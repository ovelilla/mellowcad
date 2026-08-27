import { Vec2, V } from "../../geometry/Vec2"
import { normalizeAngle } from "../../geometry/primitives"
import {
  DEFAULT_DIM_STYLE,
  DimStyle,
  scaledDimStyle,
} from "../../domain/dimStyles"
import {
  DimensionEntity,
  Entity,
  EntityId,
  dimensionAxisAngle,
} from "../../domain/entities"
import { parseNumber } from "../../domain/units"
import { UpdateEntitiesCommand } from "../commands/entityCommands"
import { DynamicInputSession } from "../input/DynamicInput"
import { entityScenePrimitive } from "../SceneBuilder"
import { ScenePrimitive } from "../../scene/types"
import { THEME } from "../../scene/theme"
import { boxSelect, buildSelectionBoxOverlay } from "./boxSelection"
import {
  CommandOption,
  CommandOptionOutcome,
  PointerInput,
  Tool,
  ToolContext,
} from "./Tool"

/** Screen-pixel movement past which a press-drag becomes a box selection. */
const DRAG_THRESHOLD_PX = 4

/** Two dimension lines closer together than this are treated as coincident. */
const COINCIDENT = 1e-9

/**
 * AutoCAD's DIMSPACE: "Adjusts the spacing between linear dimensions ... The
 * spacing between parallel dimension lines is made equal. You can also make the
 * dimension lines of a series of linear ... dimensions line up by using a
 * spacing value of 0."
 *
 * This is the command for a chain that has gone tight — DIMDLI decides how a
 * *new* baseline dimension is offset and, as its own documentation says,
 * "changes made with DIMDLI are not applied to existing dimensions". Nothing
 * else in the app re-spaces what is already drawn.
 *
 * The prompts are AutoCAD's: a base dimension "from which the others will be
 * spaced", then the dimensions to space (Enter when the set is complete), then
 * a value — or **Auto**, which is "twice the height of the dimension text" in
 * the base dimension's style.
 *
 * No new geometry, and nothing measured changes: each dimension keeps its
 * definition points and only its `linePoint` slides along the normal of the
 * shared axis, so the whole adjustment is one `UpdateEntitiesCommand` and one
 * undo step.
 *
 * AutoCAD also spaces angular dimensions "that share a common vertex"; there is
 * no angular dimension here yet, so only the parallel-linear half exists.
 */
export class DimSpaceTool implements Tool {
  readonly id = "dimspace"
  readonly label = "Space"

  private state: DimSpaceState = { phase: "base", hover: null }
  private lastScreen: Vec2 | null = null

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    ctx.selection.clear()
    this.enterBase(ctx)
  }

  onDeactivate(ctx: ToolContext): void {
    this.state = { phase: "base", hover: null }
    ctx.dynamicInput.close()
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen
    switch (this.state.phase) {
      case "base": {
        const hover = this.pickDimension(input.world, ctx)
        if (hover?.id !== this.state.hover?.id) {
          this.state = { phase: "base", hover }
        }
        break
      }
      case "select": {
        const hover = this.pickSpaceable(input.world, this.state.base, ctx)
        if (hover?.id !== this.state.hover?.id) {
          this.state = { ...this.state, hover }
        }
        break
      }
      case "pressed": {
        const moved = Math.hypot(
          input.screen.x - this.state.startScreen.x,
          input.screen.y - this.state.startScreen.y
        )
        this.state =
          moved >= DRAG_THRESHOLD_PX
            ? {
                phase: "boxing",
                base: this.state.base,
                startWorld: this.state.startWorld,
                currentWorld: input.world,
                subtract: this.state.subtract,
              }
            : { ...this.state, currentWorld: input.world }
        break
      }
      case "boxing":
        this.state = { ...this.state, currentWorld: input.world }
        break
    }
    ctx.dynamicInput.setPosition(input.screen)
    ctx.requestRender()
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0) return
    switch (this.state.phase) {
      case "base": {
        const base = this.pickDimension(input.world, ctx)
        if (base) this.enterSelect(base, ctx)
        break
      }
      case "select":
        this.state = {
          phase: "pressed",
          base: this.state.base,
          startWorld: input.world,
          startScreen: input.screen,
          currentWorld: input.world,
          subtract: input.shiftKey,
        }
        break
    }
    ctx.requestRender()
  }

  onPointerUp(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0) return
    if (this.state.phase === "pressed") {
      const hit = this.pickSpaceable(input.world, this.state.base, ctx)
      if (hit) this.applyPick([hit.id], this.state.subtract, ctx)
      this.enterSelect(this.state.base, ctx)
    } else if (this.state.phase === "boxing") {
      const { base, startWorld, currentWorld, subtract } = this.state
      const ids = boxSelect(ctx.document, startWorld, currentWorld).filter(
        (id) => {
          const entity = ctx.document.get(id)
          return entity !== undefined && spaceable(entity, base)
        }
      )
      this.applyPick(ids, subtract, ctx)
      this.enterSelect(base, ctx)
    } else {
      return
    }
    ctx.requestRender()
  }

  onEnter(ctx: ToolContext): boolean {
    // Enter closes the "Select dimensions to space" prompt, as AutoCAD's
    // "press Enter after selecting all dimensions to be adjusted" says.
    if (this.state.phase !== "select") return false
    if (ctx.selection.isEmpty()) return false
    this.enterValue(this.state.base, ctx)
    ctx.requestRender()
    return true
  }

  commandOptions(): readonly CommandOption[] {
    return this.state.phase === "value" ? [{ key: "A", label: "Auto" }] : []
  }

  invokeOption(key: string, ctx: ToolContext): CommandOptionOutcome {
    if (this.state.phase !== "value" || key.toLowerCase() !== "a")
      return "unhandled"
    const { base } = this.state
    this.apply(base, autoSpacing(this.styleOf(base, ctx)), ctx)
    return "end"
  }

  wantsSnap(): boolean {
    return false // objects and a value; never a point
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    const out: ScenePrimitive[] = []
    if (this.state.phase === "base") {
      if (this.state.hover) out.push(...this.outline(this.state.hover, ctx))
      return out
    }

    // The base stays highlighted for the rest of the command: everything is
    // measured from it, so which one it is must never be in doubt.
    out.push(...this.outline(this.state.base, ctx))

    switch (this.state.phase) {
      case "select":
        if (this.state.hover) {
          out.push(
            ...entityScenePrimitive(
              ctx.viewport,
              this.state.hover,
              { color: THEME.entityHover, width: 2 },
              this.styleOf(this.state.hover, ctx)
            )
          )
        }
        break
      case "boxing":
        out.push(
          ...buildSelectionBoxOverlay(
            ctx.viewport,
            this.state.startWorld,
            this.state.currentWorld
          )
        )
        break
      case "value":
        for (const dim of this.spaced(
          this.state.base,
          this.resolveSpacing(this.state.base, ctx),
          ctx
        )) {
          out.push(
            ...entityScenePrimitive(
              ctx.viewport,
              dim,
              { color: THEME.preview, width: 1, dash: [6, 4] },
              this.styleOf(dim, ctx)
            )
          )
        }
        break
    }
    return out
  }

  /**
   * Where each selected dimension ends up. Shared by the live preview and by
   * every commit path, so what is drawn is exactly what is executed.
   *
   * Dimensions are ranked by how far their dimension line already sits from the
   * base's, each side of it independently, and re-placed at whole multiples of
   * `spacing` — which makes a spacing of 0 line the whole series up with the
   * base, as AutoCAD documents.
   */
  private spaced(
    base: DimensionEntity,
    spacing: number,
    ctx: ToolContext
  ): DimensionEntity[] {
    const normal = axisNormal(base)
    const offsetOf = (dim: DimensionEntity): number =>
      V.dot(V.sub(dim.linePoint, base.linePoint), normal)

    const selected = ctx.selection
      .toArray()
      .map((id) => ctx.document.get(id))
      .filter(
        (entity): entity is DimensionEntity =>
          entity !== undefined && spaceable(entity, base)
      )

    const out: DimensionEntity[] = []
    for (const side of [1, -1]) {
      const ranked = selected
        .filter((dim) => (side > 0 ? offsetOf(dim) >= 0 : offsetOf(dim) < 0))
        .sort((a, b) => Math.abs(offsetOf(a)) - Math.abs(offsetOf(b)))
      ranked.forEach((dim, index) => {
        const offset = offsetOf(dim)
        const target = side * (index + 1) * spacing
        if (Math.abs(target - offset) < COINCIDENT) return
        out.push({
          ...dim,
          linePoint: V.add(dim.linePoint, V.scale(normal, target - offset)),
        })
      })
    }
    return out
  }

  /** The value being previewed: what is typed, or the Auto default. */
  private resolveSpacing(base: DimensionEntity, ctx: ToolContext): number {
    const typed = parseNumber(ctx.dynamicInput.getText("spacing"))
    return typed !== null && Number.isFinite(typed)
      ? typed
      : autoSpacing(this.styleOf(base, ctx))
  }

  private apply(
    base: DimensionEntity,
    spacing: number,
    ctx: ToolContext
  ): void {
    const moved = this.spaced(base, spacing, ctx)
    if (moved.length > 0) ctx.execute(new UpdateEntitiesCommand(moved))
  }

  private applyPick(
    ids: readonly EntityId[],
    subtract: boolean,
    ctx: ToolContext
  ): void {
    for (const id of ids) {
      if (subtract) ctx.selection.remove(id)
      else ctx.selection.add(id)
    }
  }

  private pickDimension(world: Vec2, ctx: ToolContext): DimensionEntity | null {
    const hit = ctx.pick(world)
    return hit?.type === "dimension" && isSpaceable(hit) ? hit : null
  }

  /**
   * A dimension a click would add to the set. Only parallel dimensions can be
   * spaced, so a non-parallel one simply never highlights — the pick tells the
   * user what the command can act on.
   */
  private pickSpaceable(
    world: Vec2,
    base: DimensionEntity,
    ctx: ToolContext
  ): DimensionEntity | null {
    const hit = ctx.pick(world)
    return hit && spaceable(hit, base) && !ctx.selection.has(hit.id)
      ? hit
      : null
  }

  private outline(dim: DimensionEntity, ctx: ToolContext): ScenePrimitive[] {
    return entityScenePrimitive(
      ctx.viewport,
      dim,
      { color: THEME.selected, width: 2.5 },
      this.styleOf(dim, ctx)
    )
  }

  private styleOf(dim: DimensionEntity, ctx: ToolContext): DimStyle {
    return ctx.document.getDimStyle(dim.styleId) ?? DEFAULT_DIM_STYLE
  }

  private enterBase(ctx: ToolContext): void {
    this.state = { phase: "base", hover: null }
    this.openPrompt(ctx)
  }

  private enterSelect(base: DimensionEntity, ctx: ToolContext): void {
    this.state = { phase: "select", base, hover: null }
    this.openPrompt(ctx)
  }

  private enterValue(base: DimensionEntity, ctx: ToolContext): void {
    this.state = { phase: "value", base }
    const session: DynamicInputSession = {
      fields: [{ id: "spacing", label: "Enter value", kind: "distance" }],
      commit: (values, commitCtx) => {
        this.apply(base, values.spacing, commitCtx)
        commitCtx.endCommand()
      },
    }
    ctx.dynamicInput.open(session)
    // The live value is the Auto spacing, so it shows as the placeholder and an
    // Enter with nothing typed takes it — AutoCAD's `<Auto>` default.
    ctx.dynamicInput.setLive("spacing", autoSpacing(this.styleOf(base, ctx)))
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  /**
   * The object prompts carry no field, so the canvas keeps focus and Enter
   * reaches the runtime — which hands it to `onEnter` to close the set, or ends
   * the command when there is nothing to close.
   */
  private openPrompt(ctx: ToolContext): void {
    ctx.dynamicInput.open({ fields: [], commit: () => {} })
  }
}

/**
 * AutoCAD's Auto option: "twice the height of the dimension text" of the base
 * dimension's style. The *drawn* height, so DIMSCALE counts — the whole point
 * of the value is that the text of one dimension clears the line of the next.
 */
function autoSpacing(style: DimStyle): number {
  return 2 * scaledDimStyle(style).textHeight
}

/** The direction dimension lines are spaced along: normal to the shared axis. */
function axisNormal(base: DimensionEntity): Vec2 {
  const angle = dimensionAxisAngle(base)
  return { x: -Math.sin(angle), y: Math.cos(angle) }
}

/**
 * Whether `entity` can be spaced against `base`: another dimension measuring
 * along the same line. "Spacing is applied only to parallel linear dimensions",
 * and a dimension measured in another direction has no meaningful offset from
 * the base to equalise.
 */
function spaceable(
  entity: Entity,
  base: DimensionEntity
): entity is DimensionEntity {
  if (entity.type !== "dimension" || entity.id === base.id) return false
  if (!isSpaceable(entity)) return false
  const difference = normalizeAngle(
    dimensionAxisAngle(entity) - dimensionAxisAngle(base)
  )
  return (
    difference < 1e-6 ||
    Math.abs(difference - Math.PI) < 1e-6 ||
    Math.abs(difference - 2 * Math.PI) < 1e-6
  )
}

/**
 * Only a linear or aligned dimension has a dimension line that can be moved
 * along a shared normal; a radial one's line is tied to the circle it measures.
 *
 * KNOWN GAP: DIMSPACE also applies "to angular dimensions that share a common
 * vertex", where equal spacing means stepping the arc radius rather than
 * sliding along a normal. That is a rule of its own and is not implemented.
 */
function isSpaceable(dim: DimensionEntity): boolean {
  return dim.kind === "linear" || dim.kind === "aligned"
}

type DimSpaceState =
  /** Picking the dimension the others are spaced from. */
  | { readonly phase: "base"; readonly hover: DimensionEntity | null }
  | {
      readonly phase: "select"
      readonly base: DimensionEntity
      readonly hover: DimensionEntity | null
    }
  | {
      readonly phase: "pressed"
      readonly base: DimensionEntity
      readonly startWorld: Vec2
      readonly startScreen: Vec2
      readonly currentWorld: Vec2
      readonly subtract: boolean
    }
  | {
      readonly phase: "boxing"
      readonly base: DimensionEntity
      readonly startWorld: Vec2
      readonly currentWorld: Vec2
      readonly subtract: boolean
    }
  /** Entering the spacing distance, or taking the Auto default. */
  | { readonly phase: "value"; readonly base: DimensionEntity }

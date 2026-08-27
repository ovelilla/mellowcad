import { Vec2 } from "../../geometry/Vec2"
import {
  Entity,
  EntityId,
  HatchEntity,
  HatchLoop,
  createHatch,
  hatchGeometry,
  hatchLoopFromEntity,
} from "../../domain/entities"
import {
  DEFAULT_HATCH_ANGLE,
  DEFAULT_HATCH_PATTERN_ID,
  DEFAULT_HATCH_SCALE,
  HATCH_PATTERNS,
  HatchPatternId,
  isSolidHatchPattern,
  resolveHatchPatternId,
} from "../../domain/hatchPatterns"
import { parseNumber } from "../../domain/units"
import { AddEntityCommand } from "../commands/entityCommands"
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

/** Reused so preview frames don't burn entity ids. */
const PREVIEW_ID: EntityId = "__hatch_preview__"

/**
 * What AutoCAD says when a pattern generates more line work than it will draw
 * ("the program may reject the hatch and display a message indicating that the
 * hatch scale is too small or its dash length too short").
 */
const TOO_DENSE = "Hatch spacing too dense, or dash size too small."

/**
 * AutoCAD's HATCH, by the **Select objects** boundary: "Determines a boundary
 * from selected objects that form an enclosed area."
 *
 * Only objects that close on their own qualify here — a circle or a closed
 * polyline — so a shape drawn as loose lines cannot be hatched yet. AutoCAD's
 * other boundary route, "Pick internal point", traces a boundary by casting
 * against every visible object; that is its own piece of work and is the known
 * gap of this command.
 *
 * The prompt's other option is **Properties**, which sets the pattern name and
 * then, for a real pattern, its scale and angle — the HPNAME / HPSCALE / HPANG
 * system variables. All three are "Not-saved" in AutoCAD, i.e. they last for
 * the session, which is exactly what an instance field on a tool the runtime
 * owns gives us.
 *
 * Several boundaries make **one** hatch (HPSEPARATE's initial value is 0) and
 * the fill is **not associative** (a documented deviation from HPASSOC 1 — see
 * {@link HatchEntity}).
 */
export class HatchTool implements Tool {
  readonly id = "hatch"
  readonly label = "Hatch"

  private state: HatchState = { phase: "select", hover: null }
  private lastScreen: Vec2 | null = null
  private preview: HatchEntity | null = null

  // HPNAME / HPSCALE / HPANG: session defaults, so the next hatch starts from
  // the settings of the last one.
  private patternId: HatchPatternId = DEFAULT_HATCH_PATTERN_ID
  private patternScale = DEFAULT_HATCH_SCALE
  private patternAngle = DEFAULT_HATCH_ANGLE

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("default")
    // "Each time you click Select Objects, HATCH clears the previous selection
    // set" — the boundary set starts empty every time.
    ctx.selection.clear()
    this.enterSelect(ctx)
  }

  onDeactivate(ctx: ToolContext): void {
    this.state = { phase: "select", hover: null }
    this.preview = null
    ctx.dynamicInput.close()
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen
    switch (this.state.phase) {
      case "select": {
        const hover = this.rolloverAt(input.world, ctx)
        if (hover?.id !== this.state.hover?.id) {
          this.state = { phase: "select", hover }
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
    if (input.button !== 0 || this.state.phase !== "select") return
    this.state = {
      phase: "pressed",
      startWorld: input.world,
      startScreen: input.screen,
      currentWorld: input.world,
      subtract: input.shiftKey,
    }
    ctx.requestRender()
  }

  onPointerUp(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0) return
    if (this.state.phase === "pressed") {
      const hit = ctx.pick(input.world)
      if (hit && hatchLoopFromEntity(hit)) {
        this.applyPick([hit.id], this.state.subtract, ctx)
      }
    } else if (this.state.phase === "boxing") {
      const ids = boxSelect(
        ctx.document,
        this.state.startWorld,
        this.state.currentWorld
      ).filter((id) => {
        const entity = ctx.document.get(id)
        return entity !== undefined && hatchLoopFromEntity(entity) !== null
      })
      this.applyPick(ids, this.state.subtract, ctx)
    } else {
      return
    }
    this.enterSelect(ctx)
    ctx.requestRender()
  }

  onEnter(ctx: ToolContext): boolean {
    if (this.state.phase !== "select") return false
    if (this.loopsFromSelection(ctx).length === 0) return false
    this.commit(ctx)
    return true
  }

  commandOptions(): readonly CommandOption[] {
    return this.state.phase === "select"
      ? [{ key: "P", label: "Properties" }]
      : []
  }

  invokeOption(key: string, ctx: ToolContext): CommandOptionOutcome {
    if (this.state.phase !== "select" || key.toLowerCase() !== "p") {
      return "unhandled"
    }
    this.enterPattern(ctx)
    return "continue"
  }

  wantsSnap(): boolean {
    return false // picking objects, never acquiring a point
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    const out: ScenePrimitive[] = []
    if (this.preview) {
      out.push(
        ...entityScenePrimitive(ctx.viewport, this.preview, {
          color: THEME.preview,
          width: 1,
        })
      )
    }
    if (this.state.phase === "boxing") {
      out.push(
        ...buildSelectionBoxOverlay(
          ctx.viewport,
          this.state.startWorld,
          this.state.currentWorld
        )
      )
    } else if (this.state.phase === "select" && this.state.hover) {
      out.push(
        ...entityScenePrimitive(ctx.viewport, this.state.hover, {
          color: THEME.entityHover,
          width: 2,
        })
      )
    }
    return out
  }

  /**
   * The object a click would add to the boundary set. Objects that cannot close
   * an area never light up, which answers "what can I hatch?" without inventing
   * a message AutoCAD does not print here.
   */
  private rolloverAt(world: Vec2, ctx: ToolContext): Entity | null {
    const hit = ctx.pick(world)
    if (!hit || ctx.selection.has(hit.id)) return null
    return hatchLoopFromEntity(hit) ? hit : null
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

  private loopsFromSelection(ctx: ToolContext): HatchLoop[] {
    const loops: HatchLoop[] = []
    for (const id of ctx.selection.toArray()) {
      const entity = ctx.document.get(id)
      const loop = entity ? hatchLoopFromEntity(entity) : null
      if (loop) loops.push(loop)
    }
    return loops
  }

  /** The hatch the current boundary set and settings would produce. */
  private build(
    loops: readonly HatchLoop[],
    ctx: ToolContext,
    id?: EntityId
  ): HatchEntity {
    return createHatch(loops, {
      patternId: this.patternId,
      patternScale: this.patternScale,
      patternAngle: this.patternAngle,
      layerId: ctx.document.getCurrentLayerId(),
      id,
    })
  }

  private commit(ctx: ToolContext): void {
    const hatch = this.build(this.loopsFromSelection(ctx), ctx)
    if (hatchGeometry(hatch).truncated) {
      ctx.report(TOO_DENSE, "error")
      ctx.endCommand()
      return
    }
    ctx.execute(new AddEntityCommand(hatch))
    // The boundary objects were only the answer to a prompt: HATCH leaves
    // nothing selected, so the palette does not go on describing them.
    ctx.selection.clear()
    ctx.endCommand()
  }

  /**
   * Rebuilds the live preview. Done on every change rather than every frame:
   * clipping the pattern is the expensive part of a hatch and nothing about it
   * depends on the camera.
   */
  private refreshPreview(ctx: ToolContext): void {
    const loops = this.loopsFromSelection(ctx)
    this.preview = loops.length > 0 ? this.build(loops, ctx, PREVIEW_ID) : null
  }

  private enterSelect(ctx: ToolContext): void {
    this.state = {
      phase: "select",
      hover: this.state.phase === "select" ? this.state.hover : null,
    }
    this.refreshPreview(ctx)
    // A keyword-only prompt: no field means the canvas keeps focus, so Enter
    // reaches `onEnter` to close the boundary set.
    ctx.dynamicInput.open({ fields: [], commit: () => {} })
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  private enterPattern(ctx: ToolContext): void {
    this.state = { phase: "pattern" }
    const session: DynamicInputSession = {
      fields: [{ id: "pattern", label: "Enter a pattern name", kind: "text" }],
      commit: () => {},
      commitRaw: (commitCtx) => {
        const typed = commitCtx.dynamicInput.getText("pattern").trim()
        if (typed === "?") {
          commitCtx.report(
            HATCH_PATTERNS.map((p) => `${p.id}  ${p.description}`).join("\n")
          )
          this.enterPattern(commitCtx)
          return true
        }
        const resolved =
          typed.length === 0 ? this.patternId : resolveHatchPatternId(typed)
        if (!resolved) {
          commitCtx.report(`Unknown hatch pattern "${typed}".`, "error")
          this.enterPattern(commitCtx)
          return true
        }
        this.patternId = resolved
        // A solid fill has no spacing or direction to ask about.
        if (isSolidHatchPattern(resolved)) this.enterSelect(commitCtx)
        else this.enterScale(commitCtx)
        return true
      },
    }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setText("pattern", this.patternId)
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }

  private enterScale(ctx: ToolContext): void {
    this.state = { phase: "scale" }
    const session: DynamicInputSession = {
      fields: [
        { id: "scale", label: "Specify a scale for pattern", kind: "number" },
      ],
      commit: (values, commitCtx) => {
        if (values.scale > 0) this.patternScale = values.scale
        this.enterAngle(commitCtx)
      },
      commitRaw: (commitCtx) => {
        // Enter with nothing typed keeps the current scale, the `<default>`.
        const typed = parseNumber(commitCtx.dynamicInput.getText("scale"))
        if (typed !== null && typed > 0) this.patternScale = typed
        this.enterAngle(commitCtx)
        return true
      },
    }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setLive("scale", this.patternScale)
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }

  private enterAngle(ctx: ToolContext): void {
    this.state = { phase: "angle" }
    const session: DynamicInputSession = {
      fields: [
        { id: "angle", label: "Specify an angle for pattern", kind: "angle" },
      ],
      commit: (values, commitCtx) => {
        this.patternAngle = (values.angle * Math.PI) / 180
        this.enterSelect(commitCtx)
      },
      commitRaw: (commitCtx) => {
        const typed = parseNumber(commitCtx.dynamicInput.getText("angle"))
        if (typed !== null) this.patternAngle = (typed * Math.PI) / 180
        this.enterSelect(commitCtx)
        return true
      },
    }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setLive("angle", (this.patternAngle * 180) / Math.PI)
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }
}

type HatchState =
  | { readonly phase: "select"; readonly hover: Entity | null }
  | {
      readonly phase: "pressed"
      readonly startWorld: Vec2
      readonly startScreen: Vec2
      readonly currentWorld: Vec2
      readonly subtract: boolean
    }
  | {
      readonly phase: "boxing"
      readonly startWorld: Vec2
      readonly currentWorld: Vec2
      readonly subtract: boolean
    }
  | { readonly phase: "pattern" }
  | { readonly phase: "scale" }
  | { readonly phase: "angle" }

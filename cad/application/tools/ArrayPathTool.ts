import { Vec2, V } from "../../geometry/Vec2"
import { normalizeDegrees } from "../../geometry/primitives"
import {
  Entity,
  EntityId,
  copyEntity,
  entityBounds,
  readsInPlan,
  rotateEntity,
  translateEntity,
} from "../../domain/entities"
import { parseNumber } from "../../domain/units"
import { DynamicInputSession } from "../input/DynamicInput"
import { ScenePrimitive, StrokeStyle } from "../../scene/types"
import { entityScenePrimitive } from "../SceneBuilder"
import { THEME } from "../../scene/theme"
import { ReplaceEntitiesCommand } from "../commands/entityCommands"
import { boxSelect, buildSelectionBoxOverlay } from "./boxSelection"
import {
  CommandOption,
  CommandOptionOutcome,
  PointerInput,
  Tool,
  ToolContext,
} from "./Tool"

/**
 * AutoCAD's ARRAYPATH command (path array): distribute the selected objects
 * along a path curve. Our model has only lines and circles, so the path is a
 * line (open) or a circle's circumference (closed).
 *
 * ```
 *   (empty selection)   Enter/Space   click a curve    type / Enter   [M] method  [A] align
 *  selecting ─────────────────► pickPath ──────────► config (Items | Spacing) ──► done
 *   click / box-drag adds objects    the path curve      live ghosts along the path
 * ```
 *
 * Two methods, toggled with M: **Divide** spreads a given item *count* evenly
 * over the whole path; **Measure** steps a fixed *spacing* from the start.
 * **Align items** (default Yes, toggled with A) turns each copy to follow the
 * path's tangent — a no-op on a straight line, a steady rotation around a
 * circle. As in AutoCAD, the source objects are consumed into the array (the
 * first item sits at the path start); the path curve itself is left in place.
 * The whole array commits as a single undoable step (non-associative).
 */

/** Screen-pixel movement past which a press-drag becomes a box selection. */
const DRAG_THRESHOLD_PX = 4

const DEFAULT_ITEMS = 6
const MAX_ITEMS = 1000

/** A curve the array runs along, parameterised by arc length. */
interface PathCurve {
  readonly length: number
  readonly closed: boolean
  /** Point and tangent direction (deg CCW from +X) at an arc-length distance. */
  at(distance: number): { point: Vec2; tangentDeg: number }
}

interface PathConfig {
  readonly originals: readonly Entity[]
  readonly pathEntity: Entity
  readonly path: PathCurve
  /** Base point (selection centroid) placed on the path at each item. */
  readonly basePoint: Vec2
  readonly method: "divide" | "measure"
  readonly align: boolean
  /** Default Measure spacing (≈ DEFAULT_ITEMS items over the path). */
  readonly spacingDefault: number
}

type ArrayPathState =
  | { readonly phase: "selecting" }
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
  /** Objects chosen; awaiting the path curve. `hover` is the rollover candidate. */
  | { readonly phase: "pickPath"; readonly hover: Entity | null }
  /** Path chosen; editing count/spacing with a live preview. */
  | { readonly phase: "config"; readonly config: PathConfig }

export class ArrayPathTool implements Tool {
  readonly id = "arraypath"

  private state: ArrayPathState = { phase: "selecting" }
  private lastScreen: Vec2 | null = null

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    this.state = ctx.selection.isEmpty()
      ? { phase: "selecting" }
      : { phase: "pickPath", hover: null }
  }

  onDeactivate(ctx: ToolContext): void {
    this.state = { phase: "selecting" }
    ctx.dynamicInput.close()
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen

    switch (this.state.phase) {
      case "pressed": {
        const moved = Math.hypot(
          input.screen.x - this.state.startScreen.x,
          input.screen.y - this.state.startScreen.y
        )
        if (moved >= DRAG_THRESHOLD_PX) {
          this.state = {
            phase: "boxing",
            startWorld: this.state.startWorld,
            currentWorld: input.world,
            subtract: this.state.subtract,
          }
        } else {
          this.state = { ...this.state, currentWorld: input.world }
        }
        break
      }
      case "boxing":
        this.state = { ...this.state, currentWorld: input.world }
        break
      case "pickPath": {
        // AutoCAD's rollover highlight: preview the curve under the cursor so
        // it is clear what clicking will pick as the path.
        const hover = this.pickPath(input, ctx)
        if (hover?.id !== this.state.hover?.id) {
          this.state = { phase: "pickPath", hover }
        }
        break
      }
      case "config":
        ctx.dynamicInput.setPosition(input.screen)
        break
    }

    ctx.requestRender()
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0) return

    switch (this.state.phase) {
      case "selecting":
        this.state = {
          phase: "pressed",
          startWorld: input.world,
          startScreen: input.screen,
          currentWorld: input.world,
          subtract: input.shiftKey,
        }
        return
      case "pickPath": {
        const hit = this.pickPath(input, ctx)
        if (hit) this.enterConfig(hit, ctx)
        return
      }
    }
  }

  /**
   * The curve a click would take as the path: one in the UCS's XY plane, where
   * the array is laid out (a path at an angle to it is not offered).
   */
  private pickPath(input: PointerInput, ctx: ToolContext): Entity | null {
    const hit = ctx.pick(input.world)
    return hit && readsInPlan(hit) ? hit : null
  }

  onPointerUp(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0) return

    if (this.state.phase === "pressed") {
      const hit = ctx.pick(input.world)
      if (hit) this.applyPick([hit.id], this.state.subtract, ctx)
      this.state = { phase: "selecting" }
      ctx.requestRender()
      return
    }
    if (this.state.phase === "boxing") {
      const hits = boxSelect(
        ctx.document,
        this.state.startWorld,
        this.state.currentWorld,
        ctx.viewport
      )
      this.applyPick(hits, this.state.subtract, ctx)
      this.state = { phase: "selecting" }
      ctx.requestRender()
    }
  }

  onEnter(ctx: ToolContext): boolean {
    if (this.state.phase === "config") {
      this.commit(ctx)
      return true
    }
    return this.confirmSelection(ctx)
  }

  commandOptions(): readonly CommandOption[] {
    if (this.state.phase !== "config") return []
    const { method, align } = this.state.config
    return [
      { id: "Method", value: method === "divide" ? "Divide" : "Measure" },
      { id: "Align items", value: align ? "Yes" : "No" },
    ]
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    if (this.state.phase !== "config") return "unhandled"
    if (id === "Method") {
      const method =
        this.state.config.method === "divide" ? "measure" : "divide"
      this.state = { phase: "config", config: { ...this.state.config, method } }
      this.openConfigInput(ctx)
      ctx.requestRender()
      return "continue"
    }
    if (id === "Align items") {
      this.state = {
        phase: "config",
        config: { ...this.state.config, align: !this.state.config.align },
      }
      ctx.requestRender()
      return "continue"
    }
    return "unhandled"
  }

  wantsSnap(): boolean {
    return false
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    const { viewport } = ctx

    if (this.state.phase === "boxing") {
      return buildSelectionBoxOverlay(
        viewport,
        this.state.startWorld,
        this.state.currentWorld
      )
    }

    // Rollover-highlight the curve under the cursor while choosing the path,
    // in the same amber it takes once picked so the candidate is unmistakable.
    if (this.state.phase === "pickPath") {
      const out: ScenePrimitive[] = []
      if (this.state.hover) {
        pushEntityOutline(out, viewport, this.state.hover, {
          color: THEME.selected,
          width: 2.5,
        })
      }
      return out
    }

    if (this.state.phase !== "config") return []

    const { config } = this.state
    const out: ScenePrimitive[] = []

    // Highlight the chosen path curve.
    pushEntityOutline(out, viewport, config.pathEntity, {
      color: THEME.selected,
      width: 2,
    })

    // Ghost items distributed along the path.
    const placements = this.computePlacements(ctx, config)
    const ghost: StrokeStyle = { color: THEME.preview, width: 1, dash: [6, 4] }
    const t0 = placements.length > 0 ? placements[0].tangentDeg : 0
    for (const pl of placements) {
      const dth = config.align ? pl.tangentDeg - t0 : 0
      for (const entity of config.originals) {
        pushEntityOutline(
          out,
          viewport,
          itemEntity(entity, config.basePoint, dth, pl.point),
          ghost,
          ctx.blocks
        )
      }
    }
    return out
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

  private confirmSelection(ctx: ToolContext): boolean {
    if (this.state.phase !== "selecting") return false
    if (ctx.selection.isEmpty()) return false
    this.state = { phase: "pickPath", hover: null }
    ctx.requestRender()
    return true
  }

  private enterConfig(pathEntity: Entity, ctx: ToolContext): void {
    const path = makePath(pathEntity)
    if (!path) return // only lines, circles and arcs can be a path
    const originals = ctx.selection
      .toArray()
      .filter((id) => id !== pathEntity.id)
      .map((id) => ctx.document.get(id))
      .filter((entity): entity is Entity => entity !== undefined)
    if (originals.length === 0) return // nothing but the path was selected

    const spacingDefault =
      path.length / Math.max(1, DEFAULT_ITEMS - (path.closed ? 0 : 1))
    this.state = {
      phase: "config",
      config: {
        originals,
        pathEntity,
        path,
        basePoint: centroid(originals, ctx.blocks),
        method: "divide",
        align: true,
        spacingDefault,
      },
    }
    this.openConfigInput(ctx)
  }

  private openConfigInput(ctx: ToolContext): void {
    if (this.state.phase !== "config") return
    const { method, spacingDefault } = this.state.config
    const session: DynamicInputSession =
      method === "divide"
        ? {
            fields: [{ id: "count", prompt: "items", kind: "number" }],
            commit: (_v, c) => this.commit(c),
          }
        : {
            fields: [{ id: "spacing", prompt: "spacing", kind: "distance" }],
            commit: (_v, c) => this.commit(c),
          }
    ctx.dynamicInput.open(session)
    if (method === "divide") ctx.dynamicInput.setDefault("count", DEFAULT_ITEMS)
    else ctx.dynamicInput.setDefault("spacing", spacingDefault)
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  /** Arc-length positions (and tangents) of every item for the current inputs. */
  private computePlacements(
    ctx: ToolContext,
    config: PathConfig
  ): { point: Vec2; tangentDeg: number }[] {
    const { path } = config
    const distances: number[] = []
    if (config.method === "divide") {
      const n = clampCount(readParam(ctx, "count", DEFAULT_ITEMS))
      if (n <= 1) {
        distances.push(0)
      } else {
        const step = path.closed ? path.length / n : path.length / (n - 1)
        for (let k = 0; k < n; k++) distances.push(k * step)
      }
    } else {
      const s = readParam(ctx, "spacing", config.spacingDefault)
      if (!(s > 0)) {
        distances.push(0)
      } else {
        const limit = path.closed ? path.length - 1e-6 : path.length + 1e-6
        for (let k = 0; k * s <= limit && k <= MAX_ITEMS; k++) {
          distances.push(k * s)
        }
      }
    }
    return distances.map((distance) => path.at(Math.min(distance, path.length)))
  }

  private commit(ctx: ToolContext): void {
    if (this.state.phase !== "config") return
    const { config } = this.state
    const placements = this.computePlacements(ctx, config)
    const items: Entity[] = []
    const t0 = placements.length > 0 ? placements[0].tangentDeg : 0
    for (const pl of placements) {
      const dth = config.align ? pl.tangentDeg - t0 : 0
      for (const entity of config.originals) {
        items.push(itemCopy(entity, config.basePoint, dth, pl.point))
      }
    }
    if (items.length > 0) {
      ctx.execute(
        new ReplaceEntitiesCommand(
          config.originals.map((entity) => entity.id),
          items
        )
      )
    }
    ctx.dynamicInput.close()
    ctx.endCommand()
  }
}

/** Draws an entity with the given stroke. */
function pushEntityOutline(
  out: ScenePrimitive[],
  viewport: ToolContext["viewport"],
  entity: Entity,
  stroke: StrokeStyle,
  blocks?: ToolContext["blocks"]
): void {
  out.push(...entityScenePrimitive(viewport, entity, stroke, { blocks }))
}

/** Builds a path curve from a line (open) or circle (closed). */
function makePath(entity: Entity): PathCurve | null {
  if (entity.type === "line") {
    const dir = V.sub(entity.end, entity.start)
    const length = V.length(dir)
    if (length < 1e-9) return null
    const tangentDeg = angleOf(dir)
    return {
      length,
      closed: false,
      at: (distance) => {
        const t = length > 0 ? distance / length : 0
        return { point: V.add(entity.start, V.scale(dir, t)), tangentDeg }
      },
    }
  }
  if (entity.type === "circle") {
    const length = 2 * Math.PI * entity.radius
    if (length < 1e-9) return null
    return {
      length,
      closed: true,
      at: (distance) => {
        const theta = (distance / length) * 2 * Math.PI
        return {
          point: {
            x: entity.center.x + entity.radius * Math.cos(theta),
            y: entity.center.y + entity.radius * Math.sin(theta),
          },
          // Tangent of a counter-clockwise circle leads the radius by 90°.
          tangentDeg: normalizeDegrees((theta * 180) / Math.PI + 90),
        }
      },
    }
  }
  if (entity.type === "arc") {
    const twoPi = Math.PI * 2
    let sweep = (entity.endAngle - entity.startAngle) % twoPi
    if (sweep <= 1e-9) sweep += twoPi
    const length = entity.radius * sweep
    if (length < 1e-9) return null
    return {
      length,
      closed: false,
      at: (distance) => {
        const t = length > 0 ? distance / length : 0
        const theta = entity.startAngle + t * sweep
        return {
          point: {
            x: entity.center.x + entity.radius * Math.cos(theta),
            y: entity.center.y + entity.radius * Math.sin(theta),
          },
          // Tangent of a counter-clockwise arc leads the radius by 90°.
          tangentDeg: normalizeDegrees((theta * 180) / Math.PI + 90),
        }
      },
    }
  }
  return null
}

/** One array item, preserving id — used for the live ghost preview. */
function itemEntity(
  entity: Entity,
  basePoint: Vec2,
  dthDeg: number,
  point: Vec2
): Entity {
  const rotated = rotateEntity(entity, basePoint, (dthDeg * Math.PI) / 180)
  return translateEntity(rotated, {
    x: point.x - basePoint.x,
    y: point.y - basePoint.y,
  })
}

/** One array item as a fresh entity — used when committing the array. */
function itemCopy(
  entity: Entity,
  basePoint: Vec2,
  dthDeg: number,
  point: Vec2
): Entity {
  return copyEntity(itemEntity(entity, basePoint, dthDeg, point), {
    x: 0,
    y: 0,
  })
}

function centroid(
  originals: readonly Entity[],
  blocks: ToolContext["blocks"]
): Vec2 {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const entity of originals) {
    const b = entityBounds(entity, blocks)
    minX = Math.min(minX, b.min.x)
    minY = Math.min(minY, b.min.y)
    maxX = Math.max(maxX, b.max.x)
    maxY = Math.max(maxY, b.max.y)
  }
  return { x: (minX + maxX) / 2, y: (minY + maxY) / 2 }
}

function readParam(ctx: ToolContext, id: string, fallback: number): number {
  const text = ctx.dynamicInput.getText(id).trim()
  if (text === "") return fallback
  const value = parseNumber(text)
  return value !== null && Number.isFinite(value) ? value : fallback
}

function clampCount(value: number): number {
  return Math.max(1, Math.min(MAX_ITEMS, Math.round(value)))
}

function angleOf(dir: Vec2): number {
  return normalizeDegrees((Math.atan2(dir.y, dir.x) * 180) / Math.PI)
}

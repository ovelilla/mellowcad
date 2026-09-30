import { Vec2 } from "../../geometry/Vec2"
import {
  Entity,
  EntityId,
  copyEntity,
  entityBounds,
  rotateEntity,
  rotateEntityCopy,
  rotatePoint,
  translateEntity,
} from "../../domain/entities"
import { parseNumber } from "../../domain/units"
import { DynamicInputSession } from "../input/DynamicInput"
import {
  isCoordinateExpression,
  parseCoordinate,
} from "../input/coordinateInput"
import { ScenePrimitive, StrokeStyle } from "../../scene/types"
import { entityScenePrimitive } from "../SceneBuilder"
import { THEME } from "../../scene/theme"
import { AddEntitiesCommand } from "../commands/entityCommands"
import { boxSelect, buildSelectionBoxOverlay } from "./boxSelection"
import {
  CommandOption,
  CommandOptionOutcome,
  KeyInput,
  PointerInput,
  Tool,
  ToolContext,
} from "./Tool"

/**
 * AutoCAD's ARRAYPOLAR command (polar array): replicate the selected objects
 * evenly around a center point.
 *
 * ```
 *   (empty selection)   Enter/Space   click / type    type / Enter   [R] rotate items
 *  selecting ─────────────────► center ──────────► config (Items · Fill angle) ──► done
 *   click / box-drag adds objects      pick the pivot   live ghost ring previews
 * ```
 *
 * After the center point, the array is described by the **item count** and the
 * **fill angle** (default 6 items over 360°). Items are distributed counter-
 * clockwise; a full 360° fill spaces them by `fill / items` (the closing item
 * would coincide with the first, so it is dropped), while a partial fill spans
 * the endpoints with `fill / (items − 1)`. **Rotate items** (default Yes, toggled
 * with R) turns each copy to follow the ring like spokes of a wheel; No keeps
 * every copy's orientation and only carries it around the circle. The source is
 * item 1; every copy is added as a single undoable step (non-associative).
 */

/** Screen-pixel movement past which a press-drag becomes a box selection. */
const DRAG_THRESHOLD_PX = 4

const DEFAULT_ITEMS = 6
const DEFAULT_FILL = 360
const MAX_ITEMS = 1000

interface PolarConfig {
  readonly originals: readonly Entity[]
  readonly center: Vec2
  /** Base point (selection centroid) carried around the ring when not rotating. */
  readonly basePoint: Vec2
  /** Whether each copy turns to follow the ring (AutoCAD "Rotate items"). */
  readonly rotate: boolean
}

type ArrayPolarState =
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
  /** Objects chosen; awaiting the center point of the array. */
  | { readonly phase: "center"; readonly originals: readonly Entity[] }
  /** Center placed; editing item count and fill angle with a live preview. */
  | { readonly phase: "config"; readonly config: PolarConfig }

export class ArrayPolarTool implements Tool {
  readonly id = "arraypolar"

  private state: ArrayPolarState = { phase: "selecting" }
  private lastScreen: Vec2 | null = null

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    if (ctx.selection.isEmpty()) {
      this.state = { phase: "selecting" }
    } else {
      this.enterCenter(ctx)
    }
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
      case "center":
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
      case "center": {
        const center = this.resolveCenter(input.point, ctx)
        this.enterConfig(center, ctx)
        return
      }
    }
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

  onKeyDown(input: KeyInput, ctx: ToolContext): void {
    if (input.key === " ") this.confirmSelection(ctx)
  }

  onEnter(ctx: ToolContext): boolean {
    // While configuring, Enter commits the array (handles the case where a
    // command-option toggle briefly moved focus to the canvas); while selecting
    // it confirms the set.
    if (this.state.phase === "config") {
      this.commit(ctx)
      return true
    }
    return this.confirmSelection(ctx)
  }

  commandOptions(): readonly CommandOption[] {
    if (this.state.phase === "config") {
      return [
        { id: "Rotate items", value: this.state.config.rotate ? "Yes" : "No" },
      ]
    }
    return []
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    if (this.state.phase === "config" && id === "Rotate items") {
      this.state = {
        phase: "config",
        config: { ...this.state.config, rotate: !this.state.config.rotate },
      }
      ctx.requestRender()
      return "continue"
    }
    return "unhandled"
  }

  wantsSnap(): boolean {
    // The center point benefits from object snap (e.g. an existing circle's
    // center); picking objects and typing parameters do not.
    return this.state.phase === "center"
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    if (this.state.phase === "boxing") {
      return buildSelectionBoxOverlay(
        ctx.viewport,
        this.state.startWorld,
        this.state.currentWorld
      )
    }
    if (this.state.phase !== "config") return []

    const { viewport } = ctx
    const { config } = this.state
    const { items, step } = this.computeItems(ctx)
    const ghost: StrokeStyle = { color: THEME.preview, width: 1, dash: [6, 4] }
    const out: ScenePrimitive[] = []

    for (let k = 1; k < items; k++) {
      const angle = k * step
      for (const entity of config.originals) {
        out.push(
          ...entityScenePrimitive(
            viewport,
            placeItem(entity, config, angle),
            ghost,
            { blocks: ctx.blocks }
          )
        )
      }
    }
    pushCenterMarker(out, viewport.worldToScreen(config.center))
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
    this.enterCenter(ctx)
    ctx.requestRender()
    return true
  }

  private enterCenter(ctx: ToolContext): void {
    const originals = ctx.selection
      .toArray()
      .map((id) => ctx.document.get(id))
      .filter((entity): entity is Entity => entity !== undefined)
    if (originals.length === 0) {
      this.state = { phase: "selecting" }
      ctx.dynamicInput.close()
      return
    }
    this.state = { phase: "center", originals }
    const session: DynamicInputSession = {
      fields: [{ id: "center", prompt: "centerPoint", kind: "coordinate" }],
      commit: () => {},
      commitRaw: (commitCtx) => this.commitCenterCoordinate(commitCtx),
    }
    ctx.dynamicInput.open(session)
    if (this.lastScreen) ctx.dynamicInput.setPosition(this.lastScreen)
  }

  private commitCenterCoordinate(ctx: ToolContext): boolean {
    if (this.state.phase !== "center") return false
    const text = ctx.dynamicInput.getText("center").trim()
    if (!isCoordinateExpression(text)) return false
    const center = parseCoordinate(text, {
      lastPoint: null,
      relativeByDefault: false,
      ucs: ctx.ucs,
    })
    if (!center) return false
    this.enterConfig(center, ctx)
    return true
  }

  private enterConfig(center: Vec2, ctx: ToolContext): void {
    if (this.state.phase !== "center") return
    const originals = this.state.originals
    this.state = {
      phase: "config",
      config: {
        originals,
        center,
        basePoint: centroid(originals, ctx.blocks),
        rotate: true,
      },
    }
    const session: DynamicInputSession = {
      fields: [
        { id: "items", prompt: "items", kind: "number" },
        { id: "fill", prompt: "fillAngle", kind: "angle" },
      ],
      commit: (_values, commitCtx) => this.commit(commitCtx),
    }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setLive("items", DEFAULT_ITEMS)
    ctx.dynamicInput.setLive("fill", DEFAULT_FILL)
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  /** Resolves item count and fill angle, deriving the per-item angle step. */
  private computeItems(ctx: ToolContext): {
    items: number
    fill: number
    step: number
  } {
    const items = clampItems(readParam(ctx, "items", DEFAULT_ITEMS))
    const fill = readParam(ctx, "fill", DEFAULT_FILL)
    // A full circle drops the closing item (it would land on the first);
    // a partial fill spans both endpoints.
    const isFull = Math.abs(Math.abs(fill) - 360) < 1e-9
    const step = items <= 1 ? 0 : isFull ? fill / items : fill / (items - 1)
    return { items, fill, step }
  }

  private commit(ctx: ToolContext): void {
    if (this.state.phase !== "config") return
    const { config } = this.state
    const { items, step } = this.computeItems(ctx)
    const copies: Entity[] = []
    for (let k = 1; k < items; k++) {
      const angle = k * step
      for (const entity of config.originals) {
        copies.push(placeItemCopy(entity, config, angle))
      }
    }
    if (copies.length > 0) ctx.execute(new AddEntitiesCommand(copies))
    ctx.dynamicInput.close()
    ctx.endCommand()
  }

  private resolveCenter(rawPoint: Vec2, ctx: ToolContext): Vec2 {
    const text = ctx.dynamicInput.getText("center").trim()
    if (isCoordinateExpression(text)) {
      const point = parseCoordinate(text, {
        lastPoint: null,
        relativeByDefault: false,
        ucs: ctx.ucs,
      })
      if (point) return point
    }
    return rawPoint
  }
}

/** One array item, preserving id — used for the live ghost preview. */
function placeItem(
  entity: Entity,
  config: PolarConfig,
  angleDeg: number
): Entity {
  const rad = (angleDeg * Math.PI) / 180
  if (config.rotate) return rotateEntity(entity, config.center, rad)
  const moved = rotatePoint(config.basePoint, config.center, rad)
  return translateEntity(entity, {
    x: moved.x - config.basePoint.x,
    y: moved.y - config.basePoint.y,
  })
}

/** One array item as a fresh entity — used when committing the array. */
function placeItemCopy(
  entity: Entity,
  config: PolarConfig,
  angleDeg: number
): Entity {
  const rad = (angleDeg * Math.PI) / 180
  if (config.rotate) return rotateEntityCopy(entity, config.center, rad)
  const moved = rotatePoint(config.basePoint, config.center, rad)
  return copyEntity(entity, {
    x: moved.x - config.basePoint.x,
    y: moved.y - config.basePoint.y,
  })
}

function pushCenterMarker(out: ScenePrimitive[], at: Vec2): void {
  const r = 6
  const stroke: StrokeStyle = { color: THEME.selected, width: 1 }
  out.push({
    kind: "segment",
    a: { x: at.x - r, y: at.y },
    b: { x: at.x + r, y: at.y },
    stroke,
  })
  out.push({
    kind: "segment",
    a: { x: at.x, y: at.y - r },
    b: { x: at.x, y: at.y + r },
    stroke,
  })
}

/** Centroid of the selection's combined bounding box. */
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

function clampItems(value: number): number {
  return Math.max(1, Math.min(MAX_ITEMS, Math.round(value)))
}

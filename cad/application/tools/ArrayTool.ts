import { Vec2 } from "../../geometry/Vec2"
import {
  Entity,
  EntityId,
  copyEntity,
  entityBounds,
  translateEntity,
} from "../../domain/entities"
import { parseNumber } from "../../domain/units"
import { DynamicInputSession } from "../input/DynamicInput"
import { ScenePrimitive, StrokeStyle } from "../../scene/types"
import { entityScenePrimitive } from "../SceneBuilder"
import { THEME } from "../../scene/theme"
import { AddEntitiesCommand } from "../commands/entityCommands"
import { boxSelect, buildSelectionBoxOverlay } from "./boxSelection"
import { KeyInput, PointerInput, Tool, ToolContext } from "./Tool"

/**
 * AutoCAD's ARRAYRECT command (rectangular array): replicate the selected
 * objects into a grid of columns and rows.
 *
 * ```
 *   (empty selection)     Enter/Space              type / Tab / Enter
 *  selecting ──────────────────────► config (Columns · Rows · spacings) ──► done
 *   click / box-drag adds objects       live ghost grid previews the array
 * ```
 *
 * Like AutoCAD's array ribbon, the whole array is described by four parameters
 * — column and row counts and the spacing between them — shown as editable
 * fields with sensible defaults derived from the selection's size. Columns run
 * along +X and rows along +Y; a negative spacing flips that direction. The grid
 * previews live as the values change, and Enter commits every copy as a single
 * undoable step (the source stays as item 1,1). This produces plain geometry
 * (a non-associative array, AutoCAD's ASsociative=No).
 */

/** Screen-pixel movement past which a press-drag becomes a box selection. */
const DRAG_THRESHOLD_PX = 4

const DEFAULT_COLUMNS = 4
const DEFAULT_ROWS = 3
/** Guards against a runaway preview/commit from an accidental huge count. */
const MAX_COUNT = 1000

interface ArrayConfig {
  readonly originals: readonly Entity[]
  /** Default spacings (from the selection's bounding box) used when unset. */
  readonly colSpacingDefault: number
  readonly rowSpacingDefault: number
}

type ArrayState =
  /** No pre-selection: build the set by clicking or box-dragging. */
  | { readonly phase: "selecting" }
  /** Mouse down while selecting: still a click until it drags far enough. */
  | {
      readonly phase: "pressed"
      readonly startWorld: Vec2
      readonly startScreen: Vec2
      readonly currentWorld: Vec2
      readonly subtract: boolean
    }
  /** Dragging a selection box (window left→right / crossing right→left). */
  | {
      readonly phase: "boxing"
      readonly startWorld: Vec2
      readonly currentWorld: Vec2
      readonly subtract: boolean
    }
  /** Objects chosen; editing the grid parameters with a live preview. */
  | { readonly phase: "config"; readonly config: ArrayConfig }

export class ArrayTool implements Tool {
  readonly id = "array"
  readonly label = "Rectangular array"
  readonly shortcut = "a"

  private state: ArrayState = { phase: "selecting" }
  private lastScreen: Vec2 | null = null

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    if (ctx.selection.isEmpty()) {
      this.state = { phase: "selecting" }
    } else {
      this.enterConfig(ctx)
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
      case "config":
        ctx.dynamicInput.setPosition(input.screen)
        break
    }

    ctx.requestRender()
  }

  onPointerDown(input: PointerInput): void {
    if (input.button !== 0) return
    if (this.state.phase === "selecting") {
      this.state = {
        phase: "pressed",
        startWorld: input.world,
        startScreen: input.screen,
        currentWorld: input.world,
        subtract: input.shiftKey,
      }
    }
    // In config the parameters are typed; pointer clicks do nothing.
  }

  onPointerUp(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0) return

    // AutoCAD's "Select objects" prompt, additive across picks and boxes.
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
        this.state.currentWorld
      )
      this.applyPick(hits, this.state.subtract, ctx)
      this.state = { phase: "selecting" }
      ctx.requestRender()
    }
  }

  onKeyDown(input: KeyInput, ctx: ToolContext): void {
    // Space confirms the selection set (AutoCAD treats Space like Enter). Enter
    // itself is routed through onEnter by the runtime.
    if (input.key === " ") this.confirmSelection(ctx)
  }

  onEnter(ctx: ToolContext): boolean {
    // Enter confirms the selection set while selecting; once configuring, the
    // dynamic-input box has focus and its Enter commits the array instead.
    return this.confirmSelection(ctx)
  }

  wantsSnap(): boolean {
    return false
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
    const grid = this.computeGrid(ctx, this.state.config)
    const ghost: StrokeStyle = { color: THEME.preview, width: 1, dash: [6, 4] }
    const out: ScenePrimitive[] = []
    for (let i = 0; i < grid.columns; i++) {
      for (let j = 0; j < grid.rows; j++) {
        if (i === 0 && j === 0) continue // the source occupies cell (0,0)
        const delta = { x: i * grid.colSpacing, y: j * grid.rowSpacing }
        for (const entity of this.state.config.originals) {
          out.push(
            ...entityScenePrimitive(
              viewport,
              translateEntity(entity, delta),
              ghost
            )
          )
        }
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
    if (ctx.selection.isEmpty()) return false // nothing selected: let Enter exit
    this.enterConfig(ctx)
    ctx.requestRender()
    return true
  }

  private enterConfig(ctx: ToolContext): void {
    const originals = ctx.selection
      .toArray()
      .map((id) => ctx.document.get(id))
      .filter((entity): entity is Entity => entity !== undefined)
    if (originals.length === 0) {
      this.state = { phase: "selecting" }
      ctx.dynamicInput.close()
      return
    }

    const { colSpacingDefault, rowSpacingDefault } = defaultSpacing(originals)
    this.state = {
      phase: "config",
      config: { originals, colSpacingDefault, rowSpacingDefault },
    }

    const session: DynamicInputSession = {
      fields: [
        { id: "columns", label: "Columns", kind: "number" },
        { id: "rows", label: "Rows", kind: "number" },
        { id: "colSpacing", label: "Column spacing", kind: "distance" },
        { id: "rowSpacing", label: "Row spacing", kind: "distance" },
      ],
      commit: (_values, commitCtx) => this.commit(commitCtx),
    }
    ctx.dynamicInput.open(session)
    // Defaults shown as placeholders; an untouched field uses its default.
    ctx.dynamicInput.setLive("columns", DEFAULT_COLUMNS)
    ctx.dynamicInput.setLive("rows", DEFAULT_ROWS)
    ctx.dynamicInput.setLive("colSpacing", colSpacingDefault)
    ctx.dynamicInput.setLive("rowSpacing", rowSpacingDefault)
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  /** Resolves the four grid parameters from typed text, falling back to defaults. */
  private computeGrid(
    ctx: ToolContext,
    config: ArrayConfig
  ): { columns: number; rows: number; colSpacing: number; rowSpacing: number } {
    return {
      columns: clampCount(readParam(ctx, "columns", DEFAULT_COLUMNS)),
      rows: clampCount(readParam(ctx, "rows", DEFAULT_ROWS)),
      colSpacing: readParam(ctx, "colSpacing", config.colSpacingDefault),
      rowSpacing: readParam(ctx, "rowSpacing", config.rowSpacingDefault),
    }
  }

  private commit(ctx: ToolContext): void {
    if (this.state.phase !== "config") return
    const grid = this.computeGrid(ctx, this.state.config)
    const copies: Entity[] = []
    for (let i = 0; i < grid.columns; i++) {
      for (let j = 0; j < grid.rows; j++) {
        if (i === 0 && j === 0) continue
        const delta = { x: i * grid.colSpacing, y: j * grid.rowSpacing }
        for (const entity of this.state.config.originals) {
          copies.push(copyEntity(entity, delta))
        }
      }
    }
    if (copies.length > 0) ctx.execute(new AddEntitiesCommand(copies))
    ctx.dynamicInput.close()
    ctx.endCommand()
  }
}

/** Default spacing = one and a half bounding-box extents, so copies sit apart. */
function defaultSpacing(originals: readonly Entity[]): {
  colSpacingDefault: number
  rowSpacingDefault: number
} {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const entity of originals) {
    const b = entityBounds(entity)
    minX = Math.min(minX, b.min.x)
    minY = Math.min(minY, b.min.y)
    maxX = Math.max(maxX, b.max.x)
    maxY = Math.max(maxY, b.max.y)
  }
  const width = maxX - minX
  const height = maxY - minY
  const fallback = Math.max(width, height, 10) * 1.5
  return {
    colSpacingDefault: width > 1e-6 ? width * 1.5 : fallback,
    rowSpacingDefault: height > 1e-6 ? height * 1.5 : fallback,
  }
}

/** Reads a numeric field, using `fallback` when empty or invalid. */
function readParam(ctx: ToolContext, id: string, fallback: number): number {
  const text = ctx.dynamicInput.getText(id).trim()
  if (text === "") return fallback
  const value = parseNumber(text)
  return value !== null && Number.isFinite(value) ? value : fallback
}

/** Counts are whole numbers, at least 1 and capped to a sane maximum. */
function clampCount(value: number): number {
  return Math.max(1, Math.min(MAX_COUNT, Math.round(value)))
}

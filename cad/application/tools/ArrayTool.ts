import { Vec2 } from "../../geometry/Vec2"
import { Vec3 } from "../../geometry/Vec3"
import {
  Entity,
  copyEntity,
  entityBounds,
  translateEntity,
} from "../../domain/entities"
import { parseNumber } from "../../domain/units"
import { ucsDirectionToWorld } from "../../domain/ucs"
import { ScenePrimitive, StrokeStyle } from "../../scene/types"
import { entityScenePrimitive } from "../SceneBuilder"
import { THEME } from "../../scene/theme"
import { AddEntitiesCommand } from "../commands/entityCommands"
import {
  isCoordinateExpression,
  parseCoordinate,
} from "../input/coordinateInput"
import { ObjectSelector } from "./objectSelection"
import type { PromptId } from "../../locales/types"
import {
  CommandOption,
  CommandOptionOutcome,
  PointerInput,
  QuestionInput,
  Tool,
  ToolContext,
  ToolQuestion,
} from "./Tool"

/**
 * AutoCAD's ARRAYRECT, as its 2023 console asks it: `Select objects:`, then
 * `Type = Rectangular  Associative = No` and `Select grip to edit array or
 * [COUnt/Spacing/COLumns/Rows/eXit] <eXit>:` over a live preview of the grid —
 * 4 columns along the UCS's +X and 3 rows along its +Y, a negative spacing
 * flipping the direction. COUnt asks the number of columns and of rows,
 * Spacing the distance between columns or [Unit cell] — two corners, whose
 * sides are both distances — and between rows, COLumns the number
 * of columns and their distance, Rows the number of rows, their distance and
 * the elevation each row rises by; eXit or Enter makes the copies, one undo
 * step with the source as item 1,1. Escape makes none.
 *
 * WHY Associative = No: an associative array is one object here neither
 * models nor edits, so the copies are plain geometry, as AutoCAD's are with
 * ASsociative No. The grips, Base point and Levels are not offered.
 */

const DEFAULT_COLUMNS = 4
const DEFAULT_ROWS = 3
/** Guards against a runaway preview/commit from an accidental huge count. */
const MAX_COUNT = 1000

/** The grid the prompts edit, the preview shows and eXit creates. */
interface Grid {
  readonly columns: number
  readonly rows: number
  readonly colSpacing: number
  readonly rowSpacing: number
  /** How far each row rises above the one before it (the UCS's Z). */
  readonly rowElevation: number
}

/**
 * The question being asked after the selection: the main prompt, or one of
 * the values its keywords ask in turn.
 */
type Step =
  | "main"
  | "countColumns"
  | "countRows"
  | "spacingColumns"
  | "spacingRows"
  | "columnsCount"
  | "columnsSpacing"
  | "rowsCount"
  | "rowsSpacing"
  | "rowsElevation"
  | "unitCellFirst"
  | "unitCellOpposite"

type ArrayState =
  /** No pre-selection: `Select objects:` builds the set. */
  | { readonly phase: "selecting" }
  /** Objects chosen; editing the grid with a live preview. */
  | {
      readonly phase: "edit"
      readonly originals: readonly Entity[]
      readonly grid: Grid
      readonly step: Step
      /** Unit cell's first corner, in the UCS, once given. */
      readonly corner?: Vec3
      readonly cursor?: Vec2
    }

/** The step each keyword starts, and the one each step goes on to. */
const NEXT: Readonly<Record<Step, Step>> = {
  main: "main",
  countColumns: "countRows",
  countRows: "main",
  spacingColumns: "spacingRows",
  spacingRows: "main",
  columnsCount: "columnsSpacing",
  columnsSpacing: "main",
  rowsCount: "rowsSpacing",
  rowsSpacing: "rowsElevation",
  rowsElevation: "main",
  unitCellFirst: "unitCellOpposite",
  unitCellOpposite: "main",
}
const KEYWORD_STEP: Readonly<Record<string, Step>> = {
  COUnt: "countColumns",
  Spacing: "spacingColumns",
  COLumns: "columnsCount",
  Rows: "rowsCount",
}

export class ArrayTool implements Tool {
  readonly id = "array"
  readonly shortcut = "a"

  private state: ArrayState = { phase: "selecting" }
  private readonly selector = new ObjectSelector({
    takes: () => "wholeObjects",
    done: (ctx) => this.confirmSelection(ctx),
  })
  private lastScreen: Vec2 | null = null

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    this.selector.start()
    if (!this.selector.preselect(ctx)) {
      this.state = { phase: "selecting" }
    } else {
      this.beginEdit(ctx)
    }
  }

  onDeactivate(ctx: ToolContext): void {
    this.state = { phase: "selecting" }
    this.selector.start()
    ctx.dynamicInput.close()
  }

  question(): PromptId | ToolQuestion {
    const state = this.state
    if (state.phase !== "edit") return this.selector.question()
    const { grid } = state
    switch (state.step) {
      case "main":
        return "selectGripToEditArrayOr"
      case "countColumns":
      case "columnsCount":
        return { id: "enterNumberOfColumns", enter: { count: grid.columns } }
      case "countRows":
      case "rowsCount":
        return { id: "enterNumberOfRows", enter: { count: grid.rows } }
      case "spacingColumns":
        return {
          id: "specifyDistanceBetweenColumnsOfCell",
          enter: grid.colSpacing,
        }
      case "columnsSpacing":
        return { id: "specifyDistanceBetweenColumns", enter: grid.colSpacing }
      case "spacingRows":
      case "rowsSpacing":
        return { id: "specifyDistanceBetweenRows", enter: grid.rowSpacing }
      case "rowsElevation":
        return {
          id: "specifyIncrementingElevationBetweenRows",
          enter: grid.rowElevation,
        }
      case "unitCellFirst":
        return "unitCellFirstCorner"
      case "unitCellOpposite":
        return "unitCellOppositeCorner"
    }
  }

  /**
   * The main prompt is a grip's pick; a count refuses as AutoCAD's does, its
   * Expression keyword counted though not offered here, and a distance takes
   * two points or Total and Expression (AutoCAD 2023's console).
   */
  takes(): QuestionInput | null {
    const state = this.state
    if (state.phase !== "edit") return this.selector.takes()
    switch (state.step) {
      case "main":
        return "point"
      case "countColumns":
      case "countRows":
      case "columnsCount":
      case "rowsCount":
        return { refusal: "requiresPositiveInteger" }
      case "unitCellFirst":
      case "unitCellOpposite":
        return "point"
      default:
        return {
          refusal: "requiresDistance",
          values: { points: "two", keyword: "yes" },
        }
    }
  }

  commandOptions(): readonly CommandOption[] {
    if (this.state.phase === "selecting") return this.selector.commandOptions()
    if (this.state.phase === "edit" && this.state.step === "spacingColumns") {
      return [{ id: "Unit cell" }]
    }
    if (this.state.phase !== "edit" || this.state.step !== "main") return []
    return [
      { id: "COUnt" },
      { id: "Spacing" },
      { id: "COLumns" },
      { id: "Rows" },
      { id: "eXit" },
    ]
  }

  defaultOption(): string | null {
    return this.state.phase === "edit" && this.state.step === "main"
      ? "eXit"
      : null
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    if (this.state.phase === "selecting") {
      return this.selector.invokeOption(id, ctx) ? "continue" : "unhandled"
    }
    if (
      this.state.phase === "edit" &&
      this.state.step === "spacingColumns" &&
      id === "Unit cell"
    ) {
      this.ask("unitCellFirst", ctx)
      return "continue"
    }
    if (this.state.phase !== "edit" || this.state.step !== "main") {
      return "unhandled"
    }
    if (id === "eXit") {
      this.create(ctx)
      return "end"
    }
    const step = KEYWORD_STEP[id]
    if (step === undefined) return "unhandled"
    this.ask(step, ctx)
    return "continue"
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen

    switch (this.state.phase) {
      case "selecting":
        this.selector.onPointerMove(input, ctx)
        break
      case "edit":
        if (this.state.step === "unitCellOpposite") {
          this.state = { ...this.state, cursor: input.point }
        }
        ctx.dynamicInput.setPosition(input.screen)
        break
    }

    ctx.requestRender()
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (this.state.phase === "selecting")
      this.selector.onPointerDown(input, ctx)
    // While editing the values are typed; a pick would take a grip, which
    // the preview does not have. Unit cell's corners are points.
    else if (input.button === 0) this.unitCellCorner(input.point, ctx)
  }

  answerTyped(text: string, ctx: ToolContext): boolean {
    return (
      this.state.phase === "selecting" && this.selector.answerTyped(text, ctx)
    )
  }

  onPointerUp(input: PointerInput, ctx: ToolContext): void {
    if (this.state.phase === "selecting") this.selector.onPointerUp(input, ctx)
  }

  onEnter(ctx: ToolContext): boolean {
    if (this.state.phase === "selecting") return this.selector.onEnter(ctx)
    if (this.state.phase === "edit" && this.state.step === "main") {
      // <eXit>: the array is made and the command ends.
      this.create(ctx)
      ctx.endCommand()
      return true
    }
    return false
  }

  wantsSnap(): boolean {
    if (this.state.phase === "edit") return isUnitCell(this.state.step)
    return this.selector.wantsSnap()
  }

  getConstraintAnchor(): Vec3 | null {
    return this.state.phase === "edit" && this.state.step === "unitCellOpposite"
      ? (this.state.corner ?? null)
      : null
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    if (this.state.phase === "selecting") return this.selector.buildOverlay(ctx)
    if (this.state.phase !== "edit") return []

    const ghost: StrokeStyle = { color: THEME.preview, width: 1, dash: [6, 4] }
    const { corner, cursor } = this.state
    const cell =
      this.state.step === "unitCellOpposite" && corner && cursor
        ? withCell(this.state.grid, corner, cursor)
        : null
    const grid = cell ?? this.previewGrid(ctx, this.state.grid, this.state.step)
    const copies = cells(grid, ctx).flatMap((delta) =>
      this.state.phase === "edit"
        ? this.state.originals.flatMap((entity) =>
            entityScenePrimitive(
              ctx.viewport,
              translateEntity(entity, delta),
              ghost,
              { blocks: ctx.blocks }
            )
          )
        : []
    )
    if (cell === null || !corner || !cursor) return copies
    const rubber: StrokeStyle = { color: THEME.rubberBand, width: 1 }
    const at = (x: number, y: number) => ctx.viewport.worldToScreen({ x, y })
    const box = [
      at(corner.x, corner.y),
      at(cursor.x, corner.y),
      at(cursor.x, cursor.y),
      at(corner.x, cursor.y),
    ]
    return [
      ...copies,
      ...box.map((a, i): ScenePrimitive => ({
        kind: "segment",
        a,
        b: box[(i + 1) % box.length],
        stroke: rubber,
      })),
    ]
  }

  /** Goes on from the set `Select objects:` closed to the grid. */
  private confirmSelection(ctx: ToolContext): void {
    this.beginEdit(ctx)
    ctx.requestRender()
  }

  private beginEdit(ctx: ToolContext): void {
    const originals = ctx.selection
      .toArray()
      .map((id) => ctx.document.get(id))
      .filter((entity): entity is Entity => entity !== undefined)
    if (originals.length === 0) {
      this.state = { phase: "selecting" }
      this.selector.start()
      ctx.dynamicInput.close()
      return
    }
    const { colSpacing, rowSpacing } = defaultSpacing(originals, ctx.blocks)
    this.state = {
      phase: "edit",
      originals,
      grid: {
        columns: DEFAULT_COLUMNS,
        rows: DEFAULT_ROWS,
        colSpacing,
        rowSpacing,
        rowElevation: 0,
      },
      step: "main",
    }
    ctx.report(ctx.text.message("arrayType", { type: "rectangular" }))
    this.openMain(ctx)
  }

  /** The main prompt: keywords only, the focus left on the drawing. */
  private openMain(ctx: ToolContext): void {
    ctx.dynamicInput.open({ fields: [], commit: () => {} })
    ctx.requestRender()
  }

  private ask(step: Step, ctx: ToolContext): void {
    if (this.state.phase !== "edit") return
    this.state = { ...this.state, step }
    if (step === "main") {
      this.openMain(ctx)
      return
    }
    if (isUnitCell(step)) {
      this.openUnitCell(ctx)
      return
    }
    ctx.dynamicInput.open({
      fields: [
        {
          id: "value",
          prompt: FIELD_LABEL[step],
          kind: isCount(step) ? "number" : "distance",
        },
      ],
      commit: (values, commitCtx) => this.answer(values.value, commitCtx),
      commitRaw: (commitCtx) => {
        // Enter with nothing typed keeps the value the prompt offers.
        if (commitCtx.dynamicInput.hasTypedText()) return false
        this.answer(null, commitCtx)
        return true
      },
    })
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }

  /**
   * Unit cell's corner, typed: a point, or Enter, which leaves the spacing
   * as it was. A number at the first corner is a square cell's side when
   * positive (acc/wn28, wn50), never a direct distance; anything else is
   * refused by the first corner in its own words and the main prompt asked
   * again, as AutoCAD 2023's console does (wn30, wn40, wn41). At the
   * opposite corner a number is a direct distance from the first (wn29).
   */
  private openUnitCell(ctx: ToolContext): void {
    const first =
      this.state.phase === "edit" && this.state.step === "unitCellFirst"
    ctx.dynamicInput.open({
      fields: [
        {
          id: "corner",
          prompt:
            this.state.phase === "edit" &&
            this.state.step === "unitCellOpposite"
              ? "otherCorner"
              : "firstCorner",
          kind: "coordinate",
        },
      ],
      commit: () => {},
      commitRaw: (commitCtx) => {
        if (this.state.phase !== "edit") return false
        const text = commitCtx.dynamicInput.getText("corner").trim()
        if (text === "") {
          this.ask("main", commitCtx)
          return true
        }
        const corner = this.state.corner
        const point = isCoordinateExpression(text)
          ? parseCoordinate(text, {
              lastPoint: corner ?? commitCtx.lastPoint,
              relativeByDefault: corner !== undefined,
              ucs: commitCtx.ucs,
              elevation: commitCtx.elevation,
            })
          : null
        if (point) {
          this.unitCellCorner(point, commitCtx)
          return true
        }
        if (this.state.step !== "unitCellFirst") return false
        const side = isCoordinateExpression(text) ? null : parseNumber(text)
        if (side !== null && side > 0) {
          this.state = {
            ...this.state,
            grid: { ...this.state.grid, colSpacing: side, rowSpacing: side },
          }
          this.ask("main", commitCtx)
          return true
        }
        // WHY not refused and asked again: the console leaves the unit cell.
        commitCtx.report(commitCtx.text.message("requiresNonzero"), "error")
        this.ask("main", commitCtx)
        return true
      },
      directDistance: first ? "typed" : undefined,
    })
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }

  /** Unit cell's first corner, or its opposite one, which sets both spacings. */
  private unitCellCorner(point: Vec3, ctx: ToolContext): void {
    if (this.state.phase !== "edit") return
    const { step, corner, grid } = this.state
    if (step === "unitCellFirst") {
      this.state = { ...this.state, corner: point, cursor: point }
      this.ask("unitCellOpposite", ctx)
    } else if (step === "unitCellOpposite" && corner) {
      this.state = { ...this.state, grid: withCell(grid, corner, point) }
      this.ask("main", ctx)
    }
  }

  /** The value typed for the step asked (null: Enter, the offered one). */
  private answer(value: number | null, ctx: ToolContext): void {
    if (this.state.phase !== "edit") return
    const { step, grid } = this.state
    if (value !== null && isCount(step)) {
      if (value <= 0) {
        ctx.report(ctx.text.message("positiveNonzero"), "error")
        return
      }
      if (!Number.isInteger(value) || value > MAX_COUNT) {
        ctx.report(ctx.text.message("requiresPositiveInteger"), "error")
        return
      }
    }
    if (value !== null) {
      this.state = { ...this.state, grid: withValue(grid, step, value) }
    }
    this.ask(NEXT[step], ctx)
  }

  /** The grid the preview shows: the value being typed already applied. */
  private previewGrid(ctx: ToolContext, grid: Grid, step: Step): Grid {
    if (step === "main") return grid
    const typed = parseNumber(ctx.dynamicInput.getText("value").trim())
    if (typed === null || !Number.isFinite(typed)) return grid
    if (isCount(step) && (!Number.isInteger(typed) || typed <= 0)) return grid
    return withValue(grid, step, Math.min(typed, MAX_COUNT))
  }

  private create(ctx: ToolContext): void {
    if (this.state.phase !== "edit") return
    const copies = cells(this.state.grid, ctx).flatMap((delta) =>
      this.state.phase === "edit"
        ? this.state.originals.map((entity) => copyEntity(entity, delta))
        : []
    )
    if (copies.length > 0) ctx.execute(new AddEntitiesCommand(copies))
    ctx.dynamicInput.close()
  }
}

/** The box's label for each value asked. */
const FIELD_LABEL: Readonly<
  Record<Exclude<Step, "main" | "unitCellFirst" | "unitCellOpposite">, PromptId>
> = {
  countColumns: "columns",
  columnsCount: "columns",
  countRows: "rows",
  rowsCount: "rows",
  spacingColumns: "columnSpacing",
  columnsSpacing: "columnSpacing",
  spacingRows: "rowSpacing",
  rowsSpacing: "rowSpacing",
  rowsElevation: "distance",
}

function isUnitCell(step: Step): step is "unitCellFirst" | "unitCellOpposite" {
  return step === "unitCellFirst" || step === "unitCellOpposite"
}

/** The grid whose cell runs from one corner to the other, in the UCS. */
function withCell(grid: Grid, corner: Vec2, opposite: Vec2): Grid {
  return {
    ...grid,
    colSpacing: opposite.x - corner.x,
    rowSpacing: opposite.y - corner.y,
  }
}

function isCount(step: Step): boolean {
  return (
    step === "countColumns" ||
    step === "countRows" ||
    step === "columnsCount" ||
    step === "rowsCount"
  )
}

function withValue(grid: Grid, step: Step, value: number): Grid {
  switch (step) {
    case "countColumns":
    case "columnsCount":
      return { ...grid, columns: value }
    case "countRows":
    case "rowsCount":
      return { ...grid, rows: value }
    case "spacingColumns":
    case "columnsSpacing":
      return { ...grid, colSpacing: value }
    case "spacingRows":
    case "rowsSpacing":
      return { ...grid, rowSpacing: value }
    case "rowsElevation":
      return { ...grid, rowElevation: value }
    default:
      return grid
  }
}

/** Where each copy goes, in the WCS: every cell but the source's (0, 0). */
function cells(grid: Grid, ctx: ToolContext) {
  const out: ReturnType<typeof ucsDirectionToWorld>[] = []
  for (let i = 0; i < grid.columns; i++) {
    for (let j = 0; j < grid.rows; j++) {
      if (i === 0 && j === 0) continue
      out.push(
        ucsDirectionToWorld(ctx.ucs, {
          x: i * grid.colSpacing,
          y: j * grid.rowSpacing,
          z: j * grid.rowElevation,
        })
      )
    }
  }
  return out
}

/**
 * AutoCAD's default spacing: one and a half times the selection's width
 * between columns and its height between rows, 1 where it has none (AutoCAD
 * 2023's console offers `<1>` for a line along the other axis).
 */
function defaultSpacing(
  originals: readonly Entity[],
  blocks: ToolContext["blocks"]
): { colSpacing: number; rowSpacing: number } {
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
  const width = maxX - minX
  const height = maxY - minY
  return {
    colSpacing: width > 1e-6 ? width * 1.5 : 1,
    rowSpacing: height > 1e-6 ? height * 1.5 : 1,
  }
}

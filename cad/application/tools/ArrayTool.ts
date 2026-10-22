import { Vec2 } from "../../geometry/Vec2"
import { Vec3, add3, sub3 } from "../../geometry/Vec3"
import { Entity } from "../../domain/entities"
import {
  RectangularArray,
  arrayItemCopy,
  arraySourceSize,
  placeArrayItem,
  rectangularArrayItems,
} from "../../domain/arrays"
import { parseNumber } from "../../domain/units"
import { Ucs, ucsDirectionToWorld, worldDirectionToUcs } from "../../domain/ucs"
import { ScenePrimitive, StrokeStyle } from "../../scene/types"
import { entityScenePrimitive } from "../SceneBuilder"
import { THEME } from "../../scene/theme"
import { AddEntitiesCommand } from "../commands/entityCommands"
import {
  isCoordinateExpression,
  parseCoordinate,
} from "../input/coordinateInput"
import { ObjectSelector } from "./objectSelection"
import { selectedInDrawingOrder } from "./drawingOrder"
import { MAX_PREVIEW_ITEMS, refusesCount, takesCount } from "./arrayCounts"
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
 * AutoCAD's ARRAYRECT, as its 2027 console asks it: `Select objects:` (or
 * ARRAY's set, {@link takeSet}), then `Type = Rectangular  Associative = No`
 * and `Select grip to edit array or [COUnt/Spacing/COLumns/Rows/eXit] <eXit>:`
 * over a live preview of the grid — 4 columns along the UCS's +X and 3 rows
 * along its +Y, a negative spacing flipping the direction. COUnt asks the
 * number of columns and of rows, Spacing the distance between columns or
 * [Unit cell] — two corners, whose sides along the UCS's axes are both
 * distances — and between rows, COLumns the number of columns and their
 * distance, Rows the number of rows, their distance and the elevation each row
 * rises by; eXit or Enter makes the copies, one undo step with the source as
 * item 1,1. Escape makes none.
 *
 * WHY Associative = No: an associative array is one object here neither
 * models nor edits, so the copies are plain geometry, as AutoCAD's are with
 * ASsociative No. The grips, Base point and Levels are not offered.
 */

const DEFAULT_COLUMNS = 4
const DEFAULT_ROWS = 3

/** The grid the prompts edit, the preview shows and eXit creates. */
type Grid = RectangularArray

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

  /** Goes on from the set ARRAY selected, as from its own `Select objects:`. */
  takeSet(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    this.selector.start()
    this.beginEdit(ctx)
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
          trimmed: true,
        }
      case "columnsSpacing":
        return {
          id: "specifyDistanceBetweenColumns",
          enter: grid.colSpacing,
          trimmed: true,
        }
      case "spacingRows":
      case "rowsSpacing":
        return {
          id: "specifyDistanceBetweenRows",
          enter: grid.rowSpacing,
          trimmed: true,
        }
      case "rowsElevation":
        return {
          id: "specifyIncrementingElevationBetweenRows",
          enter: grid.rowElevation,
          trimmed: true,
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
   * two points or Total and Expression — but Spacing's rows, which offers no
   * keyword (probes arrays/p108, p114, p121, p138).
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
      case "spacingRows":
        return {
          refusal: "requiresDistance",
          values: { points: "two", keyword: "no" },
        }
      default:
        return {
          refusal: "requiresDistance",
          values: { points: "two", keyword: "yes" },
        }
    }
  }

  /** Unit cell's corners leave LASTPOINT where it was (probe arrays/p148). */
  setsLastPoint(): boolean | null {
    return this.state.phase === "edit" && isUnitCell(this.state.step)
      ? false
      : null
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
    if (this.state.phase === "selecting") {
      return this.selector.answerTyped(text, ctx)
    }
    // WHY taken and asked again: a point or a number there picks no grip,
    // and the console says nothing (probes arrays/p109, p129).
    return (
      this.state.step === "main" &&
      (isCoordinateExpression(text) || parseNumber(text) !== null)
    )
  }

  onPointerUp(input: PointerInput, ctx: ToolContext): void {
    if (this.state.phase === "selecting") this.selector.onPointerUp(input, ctx)
  }

  cycleLasso(ctx: ToolContext): boolean {
    return this.selector.cycleLasso(ctx)
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
        ? withCell(this.state.grid, corner, cursor, ctx.ucs)
        : null
    const grid = cell ?? this.previewGrid(ctx, this.state.grid, this.state.step)
    const { originals } = this.state
    const copies = rectangularArrayItems(
      grid,
      ctx.ucs,
      MAX_PREVIEW_ITEMS
    ).flatMap((item) =>
      originals.flatMap((entity) =>
        entityScenePrimitive(
          ctx.viewport,
          placeArrayItem(entity, item),
          ghost,
          { blocks: ctx.blocks }
        )
      )
    )
    if (cell === null || !corner || !cursor) return copies
    const rubber: StrokeStyle = { color: THEME.rubberBand, width: 1 }
    // The cell's sides run along the UCS's axes.
    const along = (x: number, y: number) =>
      add3(corner, ucsDirectionToWorld(ctx.ucs, { x, y, z: 0 }))
    const box = [
      corner,
      along(cell.colSpacing, 0),
      along(cell.colSpacing, cell.rowSpacing),
      along(0, cell.rowSpacing),
    ].map((point) => ctx.viewport.worldToScreen(point))
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
    // WHY the drawing's order: the console adds each cell's copies so,
    // whatever order they were picked in (probe arrays/p167).
    const originals = selectedInDrawingOrder(ctx)
    if (originals.length === 0) {
      this.state = { phase: "selecting" }
      this.selector.start()
      ctx.dynamicInput.close()
      return
    }
    const { colSpacing, rowSpacing } = defaultSpacing(originals, ctx)
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
   * as it was (probes arrays/p124, p129). A number at the first corner is a
   * square cell's side when positive (p126), never a direct distance;
   * anything else is refused by the first corner in its own words and the
   * main prompt asked again (p125, p127). At the opposite corner a number is
   * a direct distance from the first (p130).
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
      this.state = {
        ...this.state,
        grid: withCell(grid, corner, point, ctx.ucs),
      }
      this.ask("main", ctx)
    }
  }

  /** The value typed for the step asked (null: Enter, the offered one). */
  private answer(value: number | null, ctx: ToolContext): void {
    if (this.state.phase !== "edit") return
    const { step, grid } = this.state
    if (value !== null && isCount(step) && refusesCount(value, ctx)) return
    // The four distances refuse 0 and ask again; the elevation takes it
    // (probes arrays/p117, p120, p135: AllowZero 0, and 1 at the elevation).
    if (value === 0 && !isCount(step) && step !== "rowsElevation") {
      ctx.report(ctx.text.message("valueMustBeNonzero"), "error")
      return
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
    if (isCount(step) && !takesCount(typed)) return grid
    return withValue(grid, step, typed)
  }

  private create(ctx: ToolContext): void {
    if (this.state.phase !== "edit") return
    const { originals } = this.state
    const copies = rectangularArrayItems(this.state.grid, ctx.ucs).flatMap(
      (item) => originals.map((entity) => arrayItemCopy(entity, item))
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

/**
 * The grid whose cell runs from one corner to the other, its sides measured
 * along the UCS's axes (probe arrays/p147: `*0,0` and `*30,20` under
 * `_UCS _Z 30`).
 */
function withCell(grid: Grid, corner: Vec3, opposite: Vec2, ucs: Ucs): Grid {
  const side = worldDirectionToUcs(ucs, sub3({ ...opposite, z: 0 }, corner))
  return { ...grid, colSpacing: side.x, rowSpacing: side.y }
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

/**
 * AutoCAD's default spacing: one and a half times the selection's width
 * between columns and its height between rows, 1 where it has none (probe
 * arrays/p168: a line's rows 1 apart). Width and height are the extents box's,
 * measured along the UCS's axes (p165: a circle of radius 2 under
 * `_UCS _Z 30` is 8.1962 apart, 1.5 × 4 (cos 30° + sin 30°)).
 */
function defaultSpacing(
  originals: readonly Entity[],
  ctx: Pick<ToolContext, "blocks" | "ucs">
): { colSpacing: number; rowSpacing: number } {
  const { width, height } = arraySourceSize(originals, ctx.ucs, ctx.blocks)
  return {
    colSpacing: width > 1e-6 ? width * 1.5 : 1,
    rowSpacing: height > 1e-6 ? height * 1.5 : 1,
  }
}

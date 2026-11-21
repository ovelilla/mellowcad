import { Vec2, V } from "../../geometry/Vec2"

import { DocumentReader } from "../../domain/Document"
import {
  BlockAttribute,
  BlockDefinition,
  BlockId,
  EntityId,
  InsertEntity,
  InsertGrid,
  MAX_INSERT_GRID_COUNT,
  blockAttribute,
  createInsert,
  findBlockNamed,
  insertFlatGeometry,
  isAnonymousBlock,
  isXref,
  onPlaneOf,
  variableAttributes,
} from "../../domain/entities"
import { parseAngleDegrees, parseNumber } from "../../domain/units"
import {
  ucsAngleToWorld,
  ucsDirectionToWorld,
  worldDirectionToUcs,
} from "../../domain/ucs"
import { Vec3, add3, sub3 } from "../../geometry/Vec3"
import { AddEntityCommand } from "../commands/entityCommands"
import {
  isCoordinateExpression,
  parseCoordinate,
} from "../input/coordinateInput"
import { ScenePrimitive } from "../../scene/types"
import { AttributeValuePrompts } from "./attributeValues"
import { BLOCKS_TO_LIST, askBlocksToList } from "./blockListing"
import type { PromptId } from "../../locales/types"
import {
  CommandOption,
  CommandOptionOutcome,
  type HeldVariables,
  PointerInput,
  QuestionInput,
  Tool,
  ToolContext,
  ToolQuestion,
} from "./Tool"
import { withCurrentProperties } from "./currentProperties"
import { headingInUcs } from "./ucsHeading"
import { THEME } from "../../scene/theme"
import { drawn } from "./ghostLook"

/** Reused so preview frames don't burn entity ids. */
const PREVIEW_ID: EntityId = "__insert_preview__"

type InsertState =
  | { readonly phase: "name" }
  /** `?`'s `Enter block(s) to list <*>:`. */
  | { readonly phase: "list" }
  | { readonly phase: "point"; readonly cursor: Vec2 }
  /** The Scale and Rotate keywords' prompts, back to the point after. */
  | { readonly phase: "scale" }
  | { readonly phase: "rotation" }
  /** What AutoCAD asks after the point: the X scale, the Y scale, the angle. */
  | { readonly phase: "scaleX"; readonly at: Vec3 }
  | { readonly phase: "scaleY"; readonly at: Vec3 }
  | { readonly phase: "angle"; readonly at: Vec3; readonly cursor: Vec2 | null }
  /** MINSERT's grid, after the rotation (probes minsert/m01–m03). */
  | { readonly phase: "rows"; readonly at: Vec3 }
  | { readonly phase: "columns"; readonly at: Vec3 }
  | { readonly phase: "rowDistance"; readonly at: Vec3 }
  /** The unit cell's other corner, the first given at the row distance. */
  | {
      readonly phase: "cellCorner"
      readonly at: Vec3
      readonly corner: Vec3
      readonly cursor: Vec2 | null
    }
  | { readonly phase: "columnDistance"; readonly at: Vec3 }
  | {
      readonly phase: "attributes"
      readonly at: Vec3
      readonly prompts: AttributeValuePrompts
    }

/** Whether a reference is placed alone (-INSERT) or in rows and columns (MINSERT). */
export type InsertMode = "insert" | "minsert"

/** INSNAME, which -INSERT and MINSERT share: per drawing, not saved (rectang/p303). */
export interface InsertName {
  id: BlockId
}

/**
 * AutoCAD's -INSERT (2027's INSERT opens the Blocks palette, whose click
 * starts it at the point): places a reference to a block already defined in
 * the drawing. The block is named first (`?` lists what is defined and ends,
 * as -BLOCK's does), then the insertion point, with **Scale** and **Rotate**
 * offered as the keywords -INSERT lists — each sets its value and returns to
 * the point prompt, so the reference is dragged in at the size and angle it
 * will keep. After the point it asks the X scale, the Y scale and the
 * rotation, leaving out what Scale or Rotate gave (probes blocks/p02, p203,
 * p205–p207, p219). Each run starts at 1 and 0 (p204).
 *
 * A block with attributes then asks for their values at the command line
 * (ATTDIA 0), and the reference is added only once they are all given: one
 * insertion, one undo step, and Escape part-way cancels the whole of it.
 *
 * Not done: inserting an external drawing file (there is no file to browse to
 * here, which is also what makes INSUNITS moot — a block defined in this
 * drawing is already in its units); Basepoint, X, Y, Z, Explode and Repeat at
 * the point; Corner and XYZ at the X scale.
 */
export class InsertTool implements Tool {
  readonly id: InsertMode

  private state: InsertState = { phase: "name" }
  private lastScreen: Vec2 | null = null
  private scaleX = 1
  private scaleY = 1
  /** Radians from the UCS's X axis. */
  private rotation = 0
  /** Whether Scale or Rotate answered, so the point skips their prompts. */
  private scaleGiven = false
  private rotationGiven = false
  /** MINSERT's grid as answered so far; 1 × 1 until the counts are given. */
  private grid: InsertGrid = EMPTY_GRID

  /**
   * MINSERT is -INSERT with its rows and columns asked after the rotation
   * (probes minsert/m01–m03): the same block name, INSNAME shared through
   * `name`, and the same point, scales and angle.
   */
  constructor(
    mode: InsertMode = "insert",
    readonly name: InsertName = { id: "" }
  ) {
    this.id = mode
  }

  /** INSNAME: the block -INSERT or MINSERT inserted last. */
  private get blockId(): BlockId {
    return this.name.id
  }

  private set blockId(id: BlockId) {
    this.name.id = id
  }

  onNewDrawing(): void {
    this.blockId = ""
  }

  heldVariables(): Partial<HeldVariables> {
    // One holder for both commands: the plain one answers for it.
    if (this.id !== "insert") return {}
    return {
      INSNAME: {
        read: () => this.blockId,
        write: (name) => {
          this.blockId = name
        },
      },
    }
  }

  onActivate(ctx: ToolContext): void {
    this.scaleX = 1
    this.scaleY = 1
    this.rotation = 0
    this.scaleGiven = false
    this.rotationGiven = false
    this.grid = EMPTY_GRID
    ctx.setCursor("crosshair")
    ctx.selection.clear()
    this.enterName(ctx)
  }

  onDeactivate(ctx: ToolContext): void {
    this.state = { phase: "name" }
    ctx.dynamicInput.close()
  }

  /**
   * Skips straight to the insertion point with `id` already chosen — how the
   * Blocks palette inserts, where the block was named by clicking it.
   */
  beginInsert(id: BlockId, ctx: ToolContext): void {
    if (!ctx.document.getBlock(id)) return
    this.blockId = id
    this.enterPoint(ctx)
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen
    if (this.state.phase === "point") {
      this.state = { phase: "point", cursor: input.point }
    } else if (
      this.state.phase === "angle" ||
      this.state.phase === "cellCorner"
    ) {
      this.state = { ...this.state, cursor: input.point }
    }
    ctx.dynamicInput.setPosition(input.screen)
    ctx.requestRender()
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0) return
    if (this.state.phase === "point") this.place(input.point, ctx)
    else if (this.state.phase === "rowDistance")
      this.enterCellCorner(this.state.at, input.point, ctx)
    else if (this.state.phase === "cellCorner")
      this.takeCell(this.state, input.point, ctx)
  }

  question(): PromptId | ToolQuestion {
    switch (this.state.phase) {
      case "name":
        return this.blockId
          ? {
              id: "blockName",
              enter: { name: this.blockId },
              takesSpaces: true,
            }
          : { id: "blockName", takesSpaces: true }
      case "list":
        return BLOCKS_TO_LIST
      case "point":
        return "insertionPoint"
      case "scale":
        return {
          id: "insertScale",
          enter: { name: factorText(this.scaleX) },
        }
      case "rotation":
        return {
          id: "insertRotation",
          enter: { angle: (this.rotation * 180) / Math.PI },
        }
      // WHY the list in the prompt's text: AutoCAD writes `[Corner/XYZ]` into
      // the message itself (table 20819, probe blocks/p219), and neither
      // keyword is built here.
      case "scaleX":
        return { id: "insertXScale", enter: { name: factorText(1) } }
      case "scaleY":
        return { id: "insertYScale", enter: "useXScaleFactor" }
      case "angle":
        return { id: "insertRotation", enter: { angle: 0 } }
      case "rows":
        return { id: "minsertRows", enter: { count: 1 } }
      case "columns":
        return { id: "minsertColumns", enter: { count: 1 } }
      case "rowDistance":
        return "minsertRowDistance"
      case "cellCorner":
        return "minsertOppositeCorner"
      case "columnDistance":
        return "minsertColumnDistance"
      case "attributes":
        return this.state.prompts.question()
    }
  }

  /**
   * As AutoCAD 2027's console refuses -INSERT's scale (probe blocks/p205) and
   * its X scale (p219, table 26313, its `X` the console's own). The Y scale
   * and the angle refuse as a number and an angle from the point do.
   */
  takes(): QuestionInput | null {
    switch (this.state.phase) {
      case "scale":
        return {
          refusal: "requiresDistance",
          values: { points: "two", keyword: "no" },
        }
      case "scaleX":
        return { refusal: "x2dCornerPointOrKeyword" }
      // MINSERT's, in AutoCAD 2027's console words (minsert/m01, m02, m07):
      // getint's range, getcorner's, and getdist's at the column distance,
      // Enter refused there and at the row distance.
      case "rows":
      case "columns":
        return {
          refusal: "requiresIntegerBetween",
          values: { min: 1, max: MAX_INSERT_GRID_COUNT },
        }
      case "rowDistance":
      case "cellCorner":
        return { refusal: "requiresNumberOrTwoCorners" }
      case "columnDistance":
        return {
          refusal: "requiresDistance",
          values: { points: "two", keyword: "no" },
        }
      default:
        return null
    }
  }

  commandOptions(): readonly CommandOption[] {
    switch (this.state.phase) {
      case "name":
        return [{ id: "?" }]
      case "point":
        return [{ id: "Scale" }, { id: "Rotate" }]
      default:
        return []
    }
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    if (this.state.phase === "name" && id === "?") {
      this.enterList(ctx)
      return "continue"
    }
    if (this.state.phase !== "point") return "unhandled"
    switch (id) {
      case "Scale":
        this.enterScale(ctx)
        return "continue"
      case "Rotate":
        this.enterRotation(ctx)
        return "continue"
      default:
        return "unhandled"
    }
  }

  /**
   * WHY none past the point: the runtime measures Scale's and Rotate's two
   * points, asking ` Specify second point:` after the first (probe
   * blocks/p236), and the angle's one from the insertion point (p219:
   * UseBasePoint); the X scale's opposite corner is not built.
   */
  wantsSnap(): boolean {
    switch (this.state.phase) {
      case "scale":
      case "rotation":
      case "scaleX":
      case "scaleY":
      case "angle":
      case "rows":
      case "columns":
      case "columnDistance":
        return false
      default:
        return true
    }
  }

  getConstraintAnchor(): Vec3 | null {
    switch (this.state.phase) {
      case "angle":
        return this.state.at
      case "cellCorner":
        return this.state.corner
      default:
        return null
    }
  }

  /**
   * The reference as it will be drawn: each object in its own colour, the
   * attributes showing their defaults, then the values given (desktop d06-7);
   * at the angle, turned towards the cursor from the insertion point.
   */
  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    const state = this.state
    const defaults = () =>
      defaultAttributes(ctx.document.getBlock(this.blockId))
    let preview: InsertEntity
    const extra: ScenePrimitive[] = []
    switch (state.phase) {
      case "point":
        preview = this.pending(state.cursor, ctx, PREVIEW_ID, defaults())
        break
      case "scaleX":
      case "scaleY":
        preview = this.pending(state.at, ctx, PREVIEW_ID, defaults())
        break
      case "angle": {
        const turn = state.cursor && this.headingTo(state.at, state.cursor, ctx)
        preview = this.pending(state.at, ctx, PREVIEW_ID, defaults(), turn)
        if (state.cursor) {
          extra.push({
            kind: "segment",
            a: ctx.viewport.worldToScreen(state.at),
            b: ctx.viewport.worldToScreen(state.cursor),
            stroke: { color: THEME.dashedRubberBand, width: 1, dash: [2, 3] },
          })
        }
        break
      }
      case "attributes":
        preview = this.pending(
          state.at,
          ctx,
          PREVIEW_ID,
          state.prompts.attributes()
        )
        break
      case "rows":
      case "columns":
      case "rowDistance":
      case "columnDistance":
        preview = this.pending(state.at, ctx, PREVIEW_ID, defaults())
        break
      case "cellCorner": {
        preview = this.pending(state.at, ctx, PREVIEW_ID, defaults())
        if (state.cursor)
          extra.push(...cellBox(state.corner, state.cursor, ctx))
        break
      }
      default:
        return []
    }
    return [
      ...insertFlatGeometry(
        withCurrentProperties(preview, ctx),
        ctx.blocks
      ).flatMap((piece) => drawn(ctx, piece, "plain")),
      ...extra,
    ]
  }

  /**
   * The angle a point gives at the rotation prompt, in radians from the UCS's
   * X axis: what the runtime measures from the insertion point for a click,
   * so the drag and the click agree.
   */
  private headingTo(at: Vec2, cursor: Vec2, ctx: ToolContext): number | null {
    const direction = V.sub(cursor, at)
    if (V.length(direction) < 1e-9) return null
    return (headingInUcs(ctx.ucs, direction) * Math.PI) / 180
  }

  /** The reference as it stands at `at`. Shared by the preview and the commit. */
  private pending(
    at: Vec2 | Vec3,
    ctx: ToolContext,
    id?: EntityId,
    attributes?: readonly BlockAttribute[],
    rotation: number | null = this.rotation
  ): InsertEntity {
    return onPlaneOf(
      createInsert(this.blockId, at, {
        scaleX: this.scaleX,
        scaleY: this.scaleY,
        rotation: ucsAngleToWorld(ctx.ucs, rotation ?? this.rotation),
        layerId: ctx.document.getCurrentLayerId(),
        attributes,
        id,
        // One cell is a plain reference (minsert/m02).
        grid:
          this.id === "minsert" && (this.grid.rows > 1 || this.grid.columns > 1)
            ? this.grid
            : undefined,
      }),
      at
    )
  }

  /** The point given: the questions Scale and Rotate left, then the values. */
  private place(at: Vec3, ctx: ToolContext): void {
    if (!this.scaleGiven) this.enterScaleX(at, ctx)
    else this.afterScale(at, ctx)
  }

  private afterScale(at: Vec3, ctx: ToolContext): void {
    if (!this.rotationGiven) this.enterAngle(at, ctx)
    else this.afterRotation(at, ctx)
  }

  /** MINSERT asks its grid before the attributes (minsert/m05). */
  private afterRotation(at: Vec3, ctx: ToolContext): void {
    if (this.id === "minsert") this.enterCount("rows", at, ctx)
    else this.enterAttributes(at, ctx)
  }

  /**
   * The number of rows, then of columns: Enter is 1, anything but a whole
   * number from 1 to 32767 refused in getint's words (minsert/m01, m07).
   */
  private enterCount(
    phase: "rows" | "columns",
    at: Vec3,
    ctx: ToolContext
  ): void {
    this.state = { phase, at }
    const take = (count: number, commitCtx: ToolContext) => {
      this.grid =
        phase === "rows"
          ? { ...this.grid, rows: count }
          : { ...this.grid, columns: count }
      if (phase === "rows") this.enterCount("columns", at, commitCtx)
      else this.afterCounts(at, commitCtx)
    }
    ctx.dynamicInput.open({
      fields: [
        {
          id: "count",
          prompt: phase === "rows" ? "minsertRows" : "minsertColumns",
          kind: "number",
        },
      ],
      commit: (values, commitCtx) => {
        const count = values.count
        if (
          !Number.isInteger(count) ||
          count < 1 ||
          count > MAX_INSERT_GRID_COUNT
        ) {
          commitCtx.report(
            commitCtx.text.message("requiresIntegerBetween", {
              min: 1,
              max: MAX_INSERT_GRID_COUNT,
            }),
            "error"
          )
          return
        }
        take(count, commitCtx)
      },
      commitRaw: (commitCtx) => {
        if (commitCtx.dynamicInput.hasTypedText()) return false
        take(1, commitCtx)
        return true
      },
    })
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }

  /**
   * The distances the counts call for: none for one cell, which is a plain
   * reference; the rows' when there are rows, else the columns' (minsert/m02).
   */
  private afterCounts(at: Vec3, ctx: ToolContext): void {
    if (this.grid.rows > 1) this.enterRowDistance(at, ctx)
    else if (this.grid.columns > 1) this.enterColumnDistance(at, ctx)
    else this.enterAttributes(at, ctx)
  }

  /**
   * A number, the rows' spacing of any sign, or a point, the unit cell's
   * first corner (minsert/m02, m03); Enter refused (getcorner's words).
   */
  private enterRowDistance(at: Vec3, ctx: ToolContext): void {
    this.state = { phase: "rowDistance", at }
    ctx.dynamicInput.open({
      fields: [
        { id: "distance", prompt: "minsertRowDistance", kind: "coordinate" },
      ],
      commit: () => {},
      commitRaw: (commitCtx) => {
        const typed = commitCtx.dynamicInput.getText("distance").trim()
        // Enter is refused and the prompt asked again (minsert/m02).
        if (typed === "") {
          commitCtx.report(
            commitCtx.text.message("requiresNumberOrTwoCorners"),
            "error"
          )
          return true
        }
        if (isCoordinateExpression(typed)) {
          const corner = parseCoordinate(typed, {
            lastPoint: commitCtx.lastPoint,
            relativeByDefault: false,
            ucs: commitCtx.ucs,
            elevation: commitCtx.elevation,
          })
          if (!corner) return false
          this.enterCellCorner(at, corner, commitCtx)
          return true
        }
        const distance = parseNumber(typed)
        if (distance === null) return false
        this.grid = { ...this.grid, rowSpacing: distance }
        if (this.grid.columns > 1) this.enterColumnDistance(at, commitCtx)
        else this.enterAttributes(at, commitCtx)
        return true
      },
      directDistance: "typed",
    })
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }

  private enterCellCorner(at: Vec3, corner: Vec3, ctx: ToolContext): void {
    this.state = { phase: "cellCorner", at, corner, cursor: null }
    ctx.dynamicInput.open({
      fields: [
        { id: "corner", prompt: "minsertOppositeCorner", kind: "coordinate" },
      ],
      commit: () => {},
      commitRaw: (commitCtx) => {
        const typed = commitCtx.dynamicInput.getText("corner").trim()
        const opposite =
          typed !== "" && isCoordinateExpression(typed)
            ? parseCoordinate(typed, {
                lastPoint: corner,
                relativeByDefault: false,
                ucs: commitCtx.ucs,
                elevation: commitCtx.elevation,
              })
            : null
        if (!opposite) {
          // Refused, and the row distance asked again (minsert/m02, m07).
          commitCtx.report(
            commitCtx.text.message("requiresNumberOrTwoCorners"),
            "error"
          )
          this.enterRowDistance(at, commitCtx)
          return true
        }
        this.takeCell({ at, corner }, opposite, commitCtx)
        return true
      },
    })
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }

  /**
   * The unit cell: its width the columns' spacing, its height the rows',
   * signed, along the UCS's axes; the column distance is not asked
   * (minsert/m03, m06).
   */
  private takeCell(
    state: { readonly at: Vec3; readonly corner: Vec3 },
    opposite: Vec2,
    ctx: ToolContext
  ): void {
    const side = worldDirectionToUcs(
      ctx.ucs,
      sub3({ ...opposite, z: 0 }, { ...state.corner, z: 0 })
    )
    this.grid = { ...this.grid, columnSpacing: side.x, rowSpacing: side.y }
    this.enterAttributes(state.at, ctx)
  }

  /**
   * Any number, a negative or 0 too, or two points' distance, which the
   * runtime measures (minsert/m01, m03); Enter refused.
   */
  private enterColumnDistance(at: Vec3, ctx: ToolContext): void {
    this.state = { phase: "columnDistance", at }
    ctx.dynamicInput.open({
      fields: [
        { id: "distance", prompt: "minsertColumnDistance", kind: "distance" },
      ],
      commit: (values, commitCtx) => {
        this.grid = { ...this.grid, columnSpacing: values.distance }
        this.enterAttributes(at, commitCtx)
      },
      commitRaw: (commitCtx) => {
        const typed = commitCtx.dynamicInput.getText("distance").trim()
        // Enter is refused and the prompt asked again (minsert/m03).
        if (typed === "") {
          commitCtx.report(
            commitCtx.text.message("requiresDistance", {
              points: "two",
              keyword: "no",
            }),
            "error"
          )
          return true
        }
        const distance = parseNumber(typed)
        if (distance === null) return false
        this.grid = { ...this.grid, columnSpacing: distance }
        this.enterAttributes(at, commitCtx)
        return true
      },
    })
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }

  private enterAttributes(at: Vec3, ctx: ToolContext): void {
    const block = ctx.document.getBlock(this.blockId)
    if (!block) return
    const prompts = new AttributeValuePrompts(block, (attributes, doneCtx) => {
      doneCtx.execute(
        new AddEntityCommand(
          withCurrentProperties(
            this.pending(at, doneCtx, undefined, attributes),
            doneCtx
          )
        )
      )
      doneCtx.endCommand()
    })
    this.state = { phase: "attributes", at, prompts }
    prompts.start(ctx)
  }

  private enterName(ctx: ToolContext): void {
    // INSNAME: the last block inserted, or else the last one defined; typed
    // by SETVAR, case-blind as every block name is.
    const named = findBlockNamed(ctx.document.getBlocks(), this.blockId)
    this.blockId = named?.id ?? namedBlocks(ctx.document).at(-1)?.id ?? ""
    this.state = { phase: "name" }
    ctx.dynamicInput.open({
      fields: [{ id: "name", prompt: "blockName", kind: "text" }],
      commit: () => {},
      commitRaw: (commitCtx) => {
        const typed = commitCtx.dynamicInput.getText("name").trim()
        if (typed === "?") {
          this.enterList(commitCtx)
          return true
        }
        // Enter with nothing typed keeps the last block, the `<default>`;
        // with none to offer it ends the command (probes blocks/p217, p238).
        if (typed.length === 0 && !this.blockId) {
          commitCtx.report(commitCtx.text.message("invalidBlockName"), "error")
          commitCtx.endCommand()
          return true
        }
        const name = typed.length === 0 ? this.blockId : typed
        // Case-blind, as every block name is: `b1` inserts B1 (p210).
        const block = isAnonymousBlock(name)
          ? undefined
          : findBlockNamed(commitCtx.document.getBlocks(), name)
        if (!block) {
          commitCtx.report(
            commitCtx.text.message("blockUndefined", { name }),
            "error"
          )
          this.enterName(commitCtx)
          return true
        }
        // An xref is placed by XREF Attach, which is not here; the command
        // ends (probes xref/p09, p14).
        if (isXref(block)) {
          commitCtx.report(commitCtx.text.message("insertXref"), "error")
          commitCtx.endCommand()
          return true
        }
        this.blockId = block.id
        this.enterPoint(commitCtx)
        return true
      },
    })
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  private enterList(ctx: ToolContext): void {
    this.state = { phase: "list" }
    askBlocksToList(ctx, "insert")
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  private enterPoint(ctx: ToolContext): void {
    this.state = {
      phase: "point",
      cursor: ctx.viewport.screenToWorld(this.lastScreen ?? { x: 0, y: 0 }),
    }
    ctx.dynamicInput.open({
      fields: [{ id: "point", prompt: "insertionPoint", kind: "coordinate" }],
      commit: () => {},
      commitRaw: (commitCtx) => {
        const typed = commitCtx.dynamicInput.getText("point").trim()
        // Enter is refused, and the point asked again (probe blocks/p216).
        if (typed === "") {
          commitCtx.report(
            commitCtx.text.message("pointOrKeywordRequired"),
            "error"
          )
          return true
        }
        const point = parseCoordinate(typed, {
          lastPoint: commitCtx.lastPoint,
          relativeByDefault: false,
          ucs: commitCtx.ucs,
          elevation: commitCtx.elevation,
        })
        if (!point) return false
        this.place(point, commitCtx)
        return true
      },
    })
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  private enterScale(ctx: ToolContext): void {
    this.state = { phase: "scale" }
    this.askFactor(ctx, "insertScale", this.scaleX, (factor, commitCtx) => {
      this.scaleX = factor
      this.scaleY = factor
      this.scaleGiven = true
      this.enterPoint(commitCtx)
    })
  }

  private enterRotation(ctx: ToolContext): void {
    this.state = { phase: "rotation" }
    this.askAngle(ctx, (degrees, commitCtx) => {
      this.rotation = (degrees * Math.PI) / 180
      this.rotationGiven = true
      this.enterPoint(commitCtx)
    })
  }

  private enterScaleX(at: Vec3, ctx: ToolContext): void {
    this.state = { phase: "scaleX", at }
    this.askFactor(ctx, "insertXScale", 1, (factor, commitCtx) => {
      this.scaleX = factor
      this.enterScaleY(at, commitCtx)
    })
  }

  private enterScaleY(at: Vec3, ctx: ToolContext): void {
    this.state = { phase: "scaleY", at }
    // Enter is `<use X scale factor>`: a negative X gives a negative Y too
    // (probe blocks/p203: X −1 then Enter is (−1, −1)).
    this.askFactor(ctx, "insertYScale", this.scaleX, (factor, commitCtx) => {
      this.scaleY = factor
      this.afterScale(at, commitCtx)
    })
  }

  private enterAngle(at: Vec3, ctx: ToolContext): void {
    this.state = { phase: "angle", at, cursor: null }
    this.askAngle(ctx, (degrees, commitCtx) => {
      this.rotation = (degrees * Math.PI) / 180
      this.afterRotation(at, commitCtx)
    })
  }

  /**
   * A scale factor's box: Enter keeps `enter`, `0` is refused in AutoCAD's
   * words and asked again, a negative is taken (probes blocks/p205, p219).
   */
  private askFactor(
    ctx: ToolContext,
    prompt: PromptId,
    enter: number,
    give: (factor: number, ctx: ToolContext) => void
  ): void {
    const take = (factor: number, commitCtx: ToolContext) => {
      if (factor === 0) {
        commitCtx.report(commitCtx.text.message("valueMustBeNonzero"), "error")
        return
      }
      give(factor, commitCtx)
    }
    ctx.dynamicInput.open({
      fields: [{ id: "factor", prompt, kind: "number" }],
      commit: (values, commitCtx) => take(values.factor, commitCtx),
      commitRaw: (commitCtx) => {
        if (!commitCtx.dynamicInput.hasTypedText()) {
          take(enter, commitCtx)
          return true
        }
        const typed = parseNumber(commitCtx.dynamicInput.getText("factor"))
        if (typed === null) return false
        take(typed, commitCtx)
        return true
      },
    })
    ctx.dynamicInput.setDefault("factor", enter)
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }

  /** A rotation's box: Enter keeps the angle the prompt offers. */
  private askAngle(
    ctx: ToolContext,
    give: (degrees: number, ctx: ToolContext) => void
  ): void {
    const enter = (this.rotation * 180) / Math.PI
    ctx.dynamicInput.open({
      fields: [{ id: "rotation", prompt: "insertRotation", kind: "angle" }],
      commit: (values, commitCtx) => give(values.rotation, commitCtx),
      commitRaw: (commitCtx) => {
        if (!commitCtx.dynamicInput.hasTypedText()) {
          give(enter, commitCtx)
          return true
        }
        const typed = parseAngleDegrees(
          commitCtx.dynamicInput.getText("rotation")
        )
        if (typed === null) return false
        give(typed, commitCtx)
        return true
      },
    })
    ctx.dynamicInput.setDefault("rotation", enter)
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }
}

const EMPTY_GRID: InsertGrid = {
  columns: 1,
  rows: 1,
  columnSpacing: 0,
  rowSpacing: 0,
}

/** The unit cell's rectangle, along the UCS's axes, rubber-banded from its first corner. */
function cellBox(
  corner: Vec3,
  cursor: Vec2,
  ctx: ToolContext
): ScenePrimitive[] {
  const side = worldDirectionToUcs(
    ctx.ucs,
    sub3({ ...cursor, z: 0 }, { ...corner, z: 0 })
  )
  const along = (x: number, y: number) =>
    add3(corner, ucsDirectionToWorld(ctx.ucs, { x, y, z: 0 }))
  const box = [
    corner,
    along(side.x, 0),
    along(side.x, side.y),
    along(0, side.y),
  ].map((point) => ctx.viewport.worldToScreen(point))
  return box.map((a, i): ScenePrimitive => ({
    kind: "segment",
    a,
    b: box[(i + 1) % box.length],
    stroke: { color: THEME.rubberBand, width: 1 },
  }))
}

/**
 * The attributes a reference of `block` takes, at their defaults: what the
 * insertion's ghost shows before any value is asked.
 */
function defaultAttributes(
  block: BlockDefinition | undefined
): BlockAttribute[] | undefined {
  return block
    ? variableAttributes(block).map((definition) =>
        blockAttribute(definition, definition.value)
      )
    : undefined
}

/**
 * A scale factor as -INSERT's `<default>` writes it, C's `%g`: `<1>`,
 * `<2.5>`, six significant digits (probes blocks/p02, p204).
 */
function factorText(factor: number): string {
  return String(Number(factor.toPrecision(6)))
}

/**
 * The blocks a user inserts: an array's anonymous block is none of them, nor
 * an xref, which -INSERT's `?` leaves out (probe xref/p15).
 */
export function namedBlocks(document: DocumentReader): BlockDefinition[] {
  return document
    .getBlocks()
    .filter((block) => !isAnonymousBlock(block.name) && !isXref(block))
}

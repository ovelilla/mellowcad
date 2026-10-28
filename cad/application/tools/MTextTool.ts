import { Vec2, V } from "../../geometry/Vec2"
import { Vec3, withZOf } from "../../geometry/Vec3"
import { normalizeDegrees } from "../../geometry/primitives"
import {
  clampLineSpacingFactor,
  createMText,
  LineSpacingStyle,
  MAX_LINE_SPACING_FACTOR,
  MIN_LINE_SPACING_FACTOR,
  MTextAttachment,
  MTextEntity,
  mtextContents,
  mtextCorners,
  mtextFromWorld,
  mtextLayout,
  mtextToWorld,
  onPlaneOf,
  MTEXT_LINE_SPACING_FACTOR,
} from "../../domain/entities"
import {
  formatLength,
  parseNumber,
  withoutTrailingZeros,
} from "../../domain/units"
import { DEFAULT_TEXT_HEIGHT, TextStyleId } from "../../domain/textStyles"
import { ucsRotation } from "../../domain/ucs"
import { AddEntityCommand } from "../commands/entityCommands"
import { DynamicInputSession } from "../input/DynamicInput"
import type { PromptId } from "../../locales/types"
import {
  isCoordinateExpression,
  parseCoordinate,
} from "../input/coordinateInput"
import { entityScenePrimitive } from "../SceneBuilder"
import { ScenePrimitive, StrokeStyle } from "../../scene/types"
import { THEME } from "../../scene/theme"
import {
  CommandOption,
  CommandOptionOutcome,
  KeyInput,
  PointerInput,
  QuestionInput,
  Tool,
  ToolContext,
  ToolQuestion,
} from "./Tool"
import { withCurrentProperties } from "./currentProperties"
import { setCommandSettings } from "./commandSettings"

/**
 * AutoCAD's MTEXT: a box from two corners, then the text, which wraps to the
 * box's width. As AutoCAD 2027's console asks it (text/p202, p213):
 * `Current text style:  "Standard"  Text height:  2.5  Annotative:  No`,
 * `Specify first corner:`, `Specify opposite corner or [Height/Justify/Line
 * spacing/Rotation/Style/Width]:`, whose keywords ask `Specify height`,
 * `Enter justification [TL/…/BR] <TL>`, `Enter line spacing type [At
 * least/Exactly]` and `Enter line spacing factor or distance <1x>`, `Specify
 * rotation angle`, `Enter style name or [?]` and return to it; Width's
 * `Specify width` replaces the corner and goes straight to the text. 2027's
 * `/Columns` is not implemented. Its heights are written at the drawing's
 * precision without trailing zeros, where TEXT keeps them (text/p264, p266).
 *
 * The in-place editor is the dynamic-input box turned multi-line, with what is
 * typed drawn in place, wrapped, inside its frame — the same deviation TEXT
 * makes, because a real focused field keeps the browser's own editing and IME.
 * Enter breaks a paragraph; Ctrl+Enter or a click outside the frame keeps the
 * text; Escape with something typed asks whether to keep it (the runtime's
 * Unsaved Changes dialog, desktop text/d05-5), with nothing typed it closes.
 *
 * `-MTEXT` runs the same prompts and then asks for the text a line at a time,
 * ending on an empty line; a line's codes are kept as typed (text/p255).
 */
export class MTextTool implements Tool {
  readonly id = "mtext"

  private state: MTextToolState = { phase: "corner" }

  /** TEXTSIZE, saved in the drawing, as the command found it or set it. */
  private height = DEFAULT_TEXT_HEIGHT
  /**
   * Radians from the UCS X axis, as the Rotation option asks it. It, the
   * justification and the line spacing start again every run (rectang/p312).
   */
  private rotation = 0
  /** The UCS's own rotation for this run: the box squares up to its axes. */
  private ucsTurn = 0
  private attachment: MTextAttachment = "tl"
  private lineSpacingStyle: LineSpacingStyle = "atLeast"
  private lineSpacingFactor = 1
  /** The height and the style Height and Style offer as their `<default>`. */
  private heightOffered = DEFAULT_TEXT_HEIGHT
  private styleOffered = ""

  /** Whether this run is `-MTEXT`, which takes the text at the command line. */
  private atCommandLine = false
  private cursor: Vec2 | null = null
  private lastScreen: Vec2 | null = null

  /** Switches the running command to `-MTEXT`'s line-by-line entry. */
  useCommandLine(): void {
    this.atCommandLine = true
  }

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    ctx.selection.clear()
    this.atCommandLine = false
    this.ucsTurn = ucsRotation(ctx.ucs)
    this.height = ctx.document.getSettings().textSize
    this.rotation = 0
    this.attachment = "tl"
    this.lineSpacingStyle = "atLeast"
    this.lineSpacingFactor = 1
    ctx.report(
      ctx.text.message("currentMTextStyle", {
        style: this.styleNameOf(ctx),
        height: this.length(this.currentHeight(ctx), ctx),
      })
    )
    this.enterCorner(ctx)
  }

  question(): PromptId | ToolQuestion | null {
    const state = this.state
    switch (state.phase) {
      case "corner":
        return "mtextFirstCorner"
      case "opposite":
        return "mtextOppositeCornerOr"
      case "height":
        return { id: "mtextHeight", enter: this.heightOffered, trimmed: true }
      case "justify":
        return "enterJustification"
      case "spacingType":
        return "enterLineSpacingType"
      case "spacingValue":
        return {
          id: "mtextLineSpacing",
          enter: { name: `${this.lineSpacingFactor}x` },
        }
      case "rotation":
        return {
          id: "mtextRotation",
          enter: { angle: normalizeDegrees((this.rotation * 180) / Math.PI) },
        }
      case "style":
        return {
          id: "mtextStyleNameOr",
          enter: { name: this.styleOffered },
          takesSpaces: true,
        }
      case "width":
        return "mtextWidth"
      case "edit":
        // The in-place editor asks nothing at the command line; -MTEXT's lines do.
        return this.atCommandLine ? "mtextLine" : null
    }
  }

  /**
   * The opposite corner is a 2D point (text/p203, p205); Justify and the
   * spacing type take their keywords only (text/p213, p215). The spacing is a
   * distance that takes anything typed (AllowArbitraryInput, text/p265): its
   * refusals are its own.
   */
  takes(): QuestionInput | null {
    switch (this.state.phase) {
      case "opposite":
        return "point2d"
      case "justify":
      case "spacingType":
        return "keyword"
      case "spacingValue":
        return "distance"
      default:
        return null
    }
  }

  /**
   * Escape in the in-place editor with something typed: AutoCAD asks
   * `Do you want to save your text changes?` before throwing it away
   * (desktop text/d05-5); with nothing typed it closes (d06). -MTEXT's lines
   * are typed at the command line, where Escape just cancels.
   */
  hasUnsavedText(ctx: ToolContext): boolean {
    return (
      this.state.phase === "edit" &&
      !this.atCommandLine &&
      ctx.dynamicInput.getText("value") !== ""
    )
  }

  defaultOption(): string | null {
    switch (this.state.phase) {
      case "justify":
        return KEYWORD_OF_ATTACHMENT[this.attachment]
      case "spacingType":
        return this.lineSpacingStyle === "exactly" ? "Exactly" : "At least"
      default:
        return null
    }
  }

  onDeactivate(ctx: ToolContext): void {
    // Leaving any other way than Escape — another command, the toolbar — keeps
    // the text, as clicking outside AutoCAD's editor does.
    this.commitPending(ctx)
    this.state = { phase: "corner" }
    this.atCommandLine = false
    ctx.dynamicInput.close()
  }

  onKeyDown(input: KeyInput): void {
    // Escape discards what was typed: "Press Esc to exit the editor without
    // saving your changes." onDeactivate follows and finds nothing to keep.
    if (input.key === "Escape") this.state = { phase: "corner" }
  }

  onEnter(ctx: ToolContext): boolean {
    switch (this.state.phase) {
      case "justify":
        // Enter takes the `<default>`, which is the current setting.
        this.enterOpposite(this.state.first, ctx)
        return true
      case "spacingType":
        // The `<default>` taken, the factor is asked (rectang/p312).
        this.invokeOption(this.defaultOption() ?? "At least", ctx)
        return true
      case "edit":
        return true
      default:
        return false
    }
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen
    this.cursor = input.point
    const state = this.state
    if (state.phase === "height" || state.phase === "width") {
      ctx.dynamicInput.setLive(
        state.phase,
        V.distance(state.first, input.point)
      )
    }
    if (state.phase === "spacingValue") {
      ctx.dynamicInput.setLive("spacing", V.distance(state.first, input.point))
    }
    ctx.dynamicInput.setPosition(input.screen)
    ctx.requestRender()
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0) return
    const state = this.state
    switch (state.phase) {
      case "corner":
        this.enterOpposite(input.point, ctx)
        break
      case "opposite":
        this.enterEdit(this.boxFrom(state.first, input.point), ctx)
        break
      case "height":
        this.commitHeight(V.distance(state.first, input.point), ctx)
        break
      case "spacingValue":
        // A point is the spacing distance from the first corner (text/p265).
        this.commitSpacing(V.distance(state.first, input.point), false, ctx)
        break
      case "rotation":
        if (!V.equals(state.first, input.point)) {
          const offset = V.sub(input.point, state.first)
          this.rotation = Math.atan2(offset.y, offset.x) - this.ucsTurn
        }
        this.enterOpposite(state.first, ctx)
        break
      case "width":
        this.enterEdit(
          {
            position: state.first,
            width: V.distance(state.first, input.point),
          },
          ctx
        )
        break
      case "edit":
        if (!this.insideFrame(input.world, ctx)) {
          this.commitPending(ctx)
          ctx.endCommand()
        }
        break
    }
    ctx.requestRender()
  }

  commandOptions(): readonly CommandOption[] {
    switch (this.state.phase) {
      case "opposite":
        return OPPOSITE_KEYWORDS.map((id) => ({ id }))
      case "justify":
        return Object.keys(ATTACHMENT_BY_KEYWORD).map((id) => ({ id }))
      case "spacingType":
        return [{ id: "At least" }, { id: "Exactly" }]
      case "style":
        return [{ id: "?" }]
      default:
        return []
    }
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    const state = this.state
    if (state.phase === "opposite") return this.invokeCornerOption(id, ctx)
    if (state.phase === "justify") {
      const attachment = ATTACHMENT_BY_KEYWORD[id]
      if (!attachment) return "unhandled"
      this.attachment = attachment
      this.enterOpposite(state.first, ctx)
      return "continue"
    }
    if (state.phase === "style") {
      if (id !== "?") return "unhandled"
      this.listStyles(ctx)
      return "continue"
    }
    if (state.phase === "spacingType") {
      if (id !== "At least" && id !== "Exactly") return "unhandled"
      this.lineSpacingStyle = id === "Exactly" ? "exactly" : "atLeast"
      this.state = { phase: "spacingValue", first: state.first }
      this.openSpacingInput(ctx)
      return "continue"
    }
    return "unhandled"
  }

  private invokeCornerOption(
    id: string,
    ctx: ToolContext
  ): CommandOptionOutcome {
    if (this.state.phase !== "opposite") return "unhandled"
    const first = this.state.first
    switch (id) {
      case "Height":
        this.heightOffered = this.currentHeight(ctx)
        this.state = { phase: "height", first }
        this.openValueInput(ctx, "height", "mtextHeight", "distance")
        return "continue"
      case "Justify":
        this.state = { phase: "justify", first }
        this.openKeywordPrompt(ctx)
        return "continue"
      case "Line spacing":
        this.state = { phase: "spacingType", first }
        this.openKeywordPrompt(ctx)
        return "continue"
      case "Rotation":
        this.state = { phase: "rotation", first }
        this.openValueInput(ctx, "rotation", "mtextRotation", "angle")
        return "continue"
      case "Style":
        this.styleOffered = this.styleNameOf(ctx)
        this.state = { phase: "style", first }
        this.openTextInput(ctx, "mtextStyleNameOr")
        return "continue"
      case "Width":
        this.state = { phase: "width", first }
        this.openValueInput(ctx, "width", "mtextWidth", "distance")
        return "continue"
      default:
        return "unhandled"
    }
  }

  getConstraintAnchor(): Vec2 | null {
    switch (this.state.phase) {
      case "opposite":
      case "height":
      case "rotation":
      case "width":
      case "spacingValue":
        return this.state.first
      default:
        return null
    }
  }

  wantsSnap(): boolean {
    return this.state.phase !== "edit"
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    const state = this.state
    const cursor = this.cursor
    switch (state.phase) {
      case "corner":
        // MTJIGSTRING: sample text at the cursor, at the height it will have.
        return cursor
          ? this.draw(ctx, this.pending(ctx, cursor, 0, MTJIGSTRING))
          : []
      case "opposite":
        return cursor ? this.boxOverlay(state.first, cursor, ctx) : []
      case "height":
      case "rotation":
      case "width":
      case "spacingValue":
        // Amber and dashed: UseDashedLine in the trace of each (text/p209,
        // p222, p228, p265).
        return cursor ? [segment(ctx, state.first, cursor, DASHED)] : []
      case "edit": {
        const entity = this.editedEntity(ctx)
        return [
          ...this.draw(ctx, entity),
          frame(ctx, mtextCorners(entity), RUBBER),
        ]
      }
      default:
        return []
    }
  }

  private enterCorner(ctx: ToolContext): void {
    this.state = { phase: "corner" }
    this.openPointInput(ctx)
  }

  private enterOpposite(first: Vec3, ctx: ToolContext): void {
    this.state = { phase: "opposite", first }
    this.openPointInput(ctx)
  }

  private enterEdit(box: MTextBox, ctx: ToolContext): void {
    this.state = { phase: "edit", box, lines: [] }
    const session: DynamicInputSession = this.atCommandLine
      ? {
          fields: [{ id: "line", prompt: "mtextLine", kind: "text" }],
          commit: () => {},
          commitRaw: (commitCtx) => this.commitLine(commitCtx),
        }
      : {
          fields: [{ id: "value", prompt: "text", kind: "paragraphs" }],
          commit: () => {},
          commitRaw: (commitCtx) => {
            this.commitPending(commitCtx)
            commitCtx.endCommand()
            return true
          },
        }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  /** `-MTEXT`: each Enter adds a line; an empty one ends the text. */
  private commitLine(ctx: ToolContext): boolean {
    if (this.state.phase !== "edit") return false
    const line = ctx.dynamicInput.getText("line")
    if (line === "") {
      this.commitPending(ctx)
      ctx.endCommand()
      return true
    }
    this.state = { ...this.state, lines: [...this.state.lines, line] }
    return true
  }

  /**
   * Adds the text being edited as one undo step: what the editor holds, if
   * anything, and whatever -MTEXT was given, no line included (text/p268).
   */
  private commitPending(ctx: ToolContext): void {
    if (this.state.phase !== "edit") return
    const keeps =
      this.atCommandLine || ctx.dynamicInput.getText("value").trim().length > 0
    const entity = keeps
      ? this.pendingEntity(ctx, ctx.document.getCurrentLayerId())
      : null
    this.state = { phase: "corner" }
    if (entity) {
      ctx.execute(new AddEntityCommand(withCurrentProperties(entity, ctx)))
    }
  }

  /**
   * The contents typed: the editor's text escaped, -MTEXT's lines as typed,
   * codes and all, joined by `\P` (text/p255, TEXT-D27).
   */
  private typedContents(ctx: ToolContext): string {
    if (this.state.phase !== "edit") return ""
    if (!this.atCommandLine) {
      return mtextContents(ctx.dynamicInput.getText("value"))
    }
    const current = ctx.dynamicInput.getText("line")
    return [...this.state.lines, ...(current ? [current] : [])].join("\\P")
  }

  private editedEntity(ctx: ToolContext): MTextEntity {
    return this.pendingEntity(ctx)
  }

  private pendingEntity(ctx: ToolContext, layerId?: string): MTextEntity {
    if (this.state.phase !== "edit") throw new Error("no text is being edited")
    const { box } = this.state
    return onPlaneOf(
      createMText(box.position, this.typedContents(ctx), {
        ...this.settings(ctx),
        width: box.width,
        ...(layerId ? { layerId } : { id: MTEXT_PREVIEW_ID }),
      }),
      box.position
    )
  }

  /** An MTEXT with the current settings, for the jig and the box preview. */
  private pending(
    ctx: ToolContext,
    position: Vec2,
    width: number,
    text: string
  ): MTextEntity {
    return createMText(position, mtextContents(text), {
      ...this.settings(ctx),
      width,
      id: MTEXT_PREVIEW_ID,
    })
  }

  private settings(ctx: ToolContext) {
    return {
      height: this.currentHeight(ctx),
      rotation: this.textRotation(),
      attachment: this.attachment,
      lineSpacingStyle: this.lineSpacingStyle,
      lineSpacingFactor: this.lineSpacingFactor,
      styleId: this.currentStyleId(ctx),
    }
  }

  private draw(ctx: ToolContext, entity: MTextEntity): ScenePrimitive[] {
    return entityScenePrimitive(ctx.viewport, entity, RUBBER)
  }

  /** The height text gets: the style's, when it fixes one, else TEXTSIZE. */
  private currentHeight(ctx: ToolContext): number {
    const style = ctx.document.getTextStyle(this.currentStyleId(ctx))
    return style && style.height > 0 ? style.height : this.height
  }

  private currentStyleId(ctx: ToolContext): TextStyleId {
    return ctx.document.getCurrentTextStyleId()
  }

  /**
   * The box two corners span, in the text's own frame. The text hangs off the
   * box's attachment point, not off the first click, whichever way the box was
   * dragged.
   */
  private boxFrom(first: Vec3, second: Vec2): MTextBox {
    const local = localOffset(first, second, this.textRotation())
    const x0 = Math.min(0, local.x)
    const x1 = Math.max(0, local.x)
    const y0 = Math.min(0, local.y)
    const y1 = Math.max(0, local.y)
    const column = this.attachment[1]
    const row = this.attachment[0]
    const x = column === "l" ? x0 : column === "r" ? x1 : (x0 + x1) / 2
    const y = row === "t" ? y1 : row === "b" ? y0 : (y0 + y1) / 2
    return {
      position: withZOf(this.toWorld(first, x, y), first),
      width: x1 - x0,
    }
  }

  private toWorld(origin: Vec2, x: number, y: number): Vec2 {
    return mtextToWorld(
      createMText(origin, "", {
        rotation: this.textRotation(),
        id: MTEXT_PREVIEW_ID,
      }),
      x,
      y
    )
  }

  /** The rotation the object gets: the one asked for, on top of the UCS's. */
  private textRotation(): number {
    return this.rotation + this.ucsTurn
  }

  private insideFrame(world: Vec2, ctx: ToolContext): boolean {
    const entity = this.editedEntity(ctx)
    const { x0, x1, y0, y1 } = mtextLayout(entity)
    const local = mtextFromWorld(entity, world)
    return local.x >= x0 && local.x <= x1 && local.y >= y0 && local.y <= y1
  }

  /**
   * The rubber rectangle, rotated with the text, and an arrow along the way
   * the text will flow from the attachment point.
   */
  private boxOverlay(
    first: Vec3,
    cursor: Vec2,
    ctx: ToolContext
  ): ScenePrimitive[] {
    const local = localOffset(first, cursor, this.textRotation())
    const corners = [
      this.toWorld(first, 0, 0),
      this.toWorld(first, local.x, 0),
      this.toWorld(first, local.x, local.y),
      this.toWorld(first, 0, local.y),
    ]
    const box = this.boxFrom(first, cursor)
    const sample = this.pending(ctx, box.position, box.width, MTJIGSTRING)
    return [
      frame(ctx, corners, RUBBER),
      ...this.flowArrows(box.position, Math.abs(local.y), ctx),
      ...this.draw(ctx, sample),
    ]
  }

  private flowArrows(
    position: Vec2,
    boxHeight: number,
    ctx: ToolContext
  ): ScenePrimitive[] {
    const length = boxHeight / 3
    if (length <= 0) return []
    const row = this.attachment[0]
    const directions = row === "t" ? [-1] : row === "b" ? [1] : [-1, 1]
    const size = length / 4
    return directions.flatMap((sign) => {
      const tip = { x: 0, y: sign * length }
      const head = [-1, 1].map((side) => ({
        x: side * size * 0.6,
        y: sign * (length - size),
      }))
      const at = (p: Vec2) => this.toWorld(position, p.x, p.y)
      return [
        segment(ctx, position, at(tip)),
        segment(ctx, at(tip), at(head[0])),
        segment(ctx, at(tip), at(head[1])),
      ]
    })
  }

  private openPointInput(ctx: ToolContext): void {
    const session: DynamicInputSession = {
      fields: [{ id: "point", kind: "coordinate" }],
      commit: () => {},
      commitRaw: (commitCtx) => this.commitTypedPoint(commitCtx),
    }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  private commitTypedPoint(ctx: ToolContext): boolean {
    const text = ctx.dynamicInput.getText("point").trim()
    const state = this.state
    if (text.length === 0) {
      // The first corner takes no Enter (AllowNone false): it is refused and
      // asked again (text/p201, desktop text/d05-6).
      if (state.phase !== "corner") return false
      ctx.report(ctx.text.message("invalidPoint"), "error")
      return true
    }
    if (!isCoordinateExpression(text)) return false
    const first = state.phase === "opposite" ? state.first : null
    const point = parseCoordinate(text, {
      lastPoint: first ?? ctx.lastPoint,
      relativeByDefault: first !== null,
      ucs: ctx.ucs,
      elevation: ctx.elevation,
    })
    if (!point) return false
    if (state.phase === "corner") this.enterOpposite(point, ctx)
    else if (state.phase === "opposite") {
      this.enterEdit(this.boxFrom(state.first, point), ctx)
    } else return false
    return true
  }

  private openValueInput(
    ctx: ToolContext,
    id: "height" | "rotation" | "width",
    prompt: PromptId,
    kind: "distance" | "angle"
  ): void {
    const session: DynamicInputSession = {
      fields: [{ id, prompt, kind }],
      commit: (values, commitCtx) => this.commitValue(values[id], commitCtx),
      // Enter with nothing typed keeps the `<default>` the prompt offers,
      // whatever the cursor reads in the box; at Width it is width 0, no
      // wrap, and the text is asked (text/p269, p273).
      commitRaw: (commitCtx) => {
        if (commitCtx.dynamicInput.hasTypedText()) return false
        const state = this.state
        if (state.phase === "width") {
          this.enterEdit({ position: state.first, width: 0 }, commitCtx)
          return true
        }
        if (state.phase === "rotation" || state.phase === "height") {
          if (state.phase === "height") this.height = this.heightOffered
          this.enterOpposite(state.first, commitCtx)
          if (state.phase === "height") {
            setCommandSettings({ textSize: this.height }, commitCtx)
          }
          return true
        }
        return false
      },
    }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  private commitValue(value: number, ctx: ToolContext): void {
    const state = this.state
    switch (state.phase) {
      case "height":
        this.commitHeight(value, ctx)
        return
      case "rotation":
        this.rotation = (value * Math.PI) / 180
        this.enterOpposite(state.first, ctx)
        return
      case "width":
        // Width takes 0 but nothing below it (text/p227, p228).
        if (!(value >= 0)) {
          ctx.report(ctx.text.message("valueMustBePositive"), "error")
          return
        }
        this.enterEdit({ position: state.first, width: value }, ctx)
        return
    }
  }

  /** A height typed or pointed: above zero, or refused (text/p209, p210). */
  private commitHeight(height: number, ctx: ToolContext): void {
    if (this.state.phase !== "height") return
    if (!(height > 0)) {
      ctx.report(ctx.text.message("positiveNonzero"), "error")
      return
    }
    this.height = height
    this.enterOpposite(this.state.first, ctx)
    setCommandSettings({ textSize: height }, ctx)
  }

  /**
   * The spacing prompt's box: a distance, which a point answers from the
   * first corner (text/p265), or a factor typed with its `x`, read raw. A
   * number field, not a distance one, so no unit follows `1.5x`.
   */
  private openSpacingInput(ctx: ToolContext): void {
    const session: DynamicInputSession = {
      fields: [{ id: "spacing", prompt: "mtextLineSpacing", kind: "number" }],
      commit: (values, commitCtx) =>
        this.commitSpacing(values.spacing, false, commitCtx),
      commitRaw: (commitCtx) => this.commitSpacingText(commitCtx),
    }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  /** `2x`, a word, or Enter, which keeps the `<1x>` offered. */
  private commitSpacingText(ctx: ToolContext): boolean {
    if (this.state.phase !== "spacingValue") return false
    const typed = ctx.dynamicInput.getText("spacing").trim()
    if (typed.length === 0) {
      this.enterOpposite(this.state.first, ctx)
      return true
    }
    const multiple = /x$/i.test(typed)
    const value = parseNumber(multiple ? typed.slice(0, -1) : typed)
    if (value === null || !Number.isFinite(value)) {
      ctx.report(this.spacingRange(ctx), "error")
      return true
    }
    this.commitSpacing(value, multiple, ctx)
    return true
  }

  /**
   * "Enter a spacing factor as a number followed by x"; a bare number is a
   * distance in drawing units, which amounts to a factor at the current
   * height. Below zero is refused as no distance can be (text/p221), the
   * rest out of 0.25x–4x with the range (p216–p219).
   */
  private commitSpacing(
    value: number,
    multiple: boolean,
    ctx: ToolContext
  ): void {
    if (this.state.phase !== "spacingValue") return
    if (value < 0) {
      ctx.report(ctx.text.message("valueMustBePositive"), "error")
      return
    }
    const factor = multiple
      ? value
      : value / (MTEXT_LINE_SPACING_FACTOR * this.currentHeight(ctx))
    if (
      factor < MIN_LINE_SPACING_FACTOR - 1e-9 ||
      factor > MAX_LINE_SPACING_FACTOR + 1e-9
    ) {
      ctx.report(this.spacingRange(ctx), "error")
      return
    }
    this.lineSpacingFactor = clampLineSpacingFactor(factor)
    this.enterOpposite(this.state.first, ctx)
  }

  /** A keyword-only prompt: the options are chips, typed and confirmed. */
  private openKeywordPrompt(ctx: ToolContext): void {
    ctx.dynamicInput.open({ fields: [], commit: () => {} })
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  private openTextInput(ctx: ToolContext, prompt: PromptId): void {
    const session: DynamicInputSession = {
      fields: [{ id: "answer", prompt, kind: "text" }],
      commit: () => {},
      commitRaw: (commitCtx) => this.commitAnswer(commitCtx),
    }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  private commitAnswer(ctx: ToolContext): boolean {
    const state = this.state
    const typed = ctx.dynamicInput.getText("answer").trim()
    if (state.phase === "style") {
      // The box holds a name, not a keyword: `?` is read here.
      if (ctx.text.resolveKeyword(typed, ["?"]) === "?") {
        this.listStyles(ctx)
        return true
      }
      if (typed.length > 0) {
        const style = ctx.document
          .getTextStyles()
          .find((s) => s.name.toLowerCase() === typed.toLowerCase())
        if (!style) {
          ctx.report(ctx.text.message("invalidStyleName"), "error")
          this.openTextInput(ctx, "mtextStyleNameOr")
          return true
        }
        ctx.setCurrentTextStyle(style.id)
      }
      this.enterOpposite(state.first, ctx)
      return true
    }
    return false
  }

  /** The style's name as the prompts offer it. */
  private styleNameOf(ctx: ToolContext): string {
    const id = ctx.document.getCurrentTextStyleId()
    return ctx.document.getTextStyle(id)?.name ?? id
  }

  /**
   * AutoCAD's refusal of a spacing out of range, in distances at the current
   * height and as factors (text/p264, p272).
   */
  private spacingRange(ctx: ToolContext): string {
    const single = MTEXT_LINE_SPACING_FACTOR * this.currentHeight(ctx)
    return ctx.text.message("lineSpacingRange", {
      min: this.length(MIN_LINE_SPACING_FACTOR * single, ctx),
      minFactor: String(MIN_LINE_SPACING_FACTOR),
      max: this.length(MAX_LINE_SPACING_FACTOR * single, ctx),
      maxFactor: String(MAX_LINE_SPACING_FACTOR),
    })
  }

  /**
   * A length as MTEXT writes it: at the drawing's precision without trailing
   * zeros, `2.5` and `3` where TEXT writes `2.50` (text/p202, p264, p272).
   */
  private length(value: number, ctx: ToolContext): string {
    return withoutTrailingZeros(formatLength(value, ctx.document.getSettings()))
  }

  /** `?`: the styles listed as TEXT lists them, then asked again. */
  private listStyles(ctx: ToolContext): void {
    if (this.state.phase !== "style") return
    const settings = ctx.document.getSettings()
    ctx.report(
      [
        ctx.text.message("textStylesHeader"),
        ...ctx.document.getTextStyles().map((style) =>
          ctx.text.message("textStyleEntry", {
            name: `"${style.name}"`.padEnd(12),
            height: formatLength(style.height, settings),
            width: formatLength(1, settings),
          })
        ),
        ctx.text.message("currentTextStyleName", {
          name: this.styleNameOf(ctx),
        }),
      ].join("\n")
    )
    this.openTextInput(ctx, "mtextStyleNameOr")
  }
}

/** What MTJIGSTRING shows at the cursor by default. */
const MTJIGSTRING = "abc"

/** Preview frames reuse one id so drawing them never burns entity ids. */
const MTEXT_PREVIEW_ID = "__mtext_preview__"

const RUBBER: StrokeStyle = { color: THEME.rubberBand, width: 1 }

const DASHED: StrokeStyle = {
  color: THEME.dashedRubberBand,
  width: 1,
  dash: [2, 3],
}

/** The opposite-corner prompt's keywords, in AutoCAD's order. */
const OPPOSITE_KEYWORDS = [
  "Height",
  "Justify",
  "Line spacing",
  "Rotation",
  "Style",
  "Width",
]

const ATTACHMENT_BY_KEYWORD: Readonly<Record<string, MTextAttachment>> = {
  TL: "tl",
  TC: "tc",
  TR: "tr",
  ML: "ml",
  MC: "mc",
  MR: "mr",
  BL: "bl",
  BC: "bc",
  BR: "br",
}

const KEYWORD_OF_ATTACHMENT = Object.fromEntries(
  Object.entries(ATTACHMENT_BY_KEYWORD).map(([id, value]) => [value, id])
) as Readonly<Record<MTextAttachment, string>>

/** `to` seen from `from` in a frame turned by `rotation`. */
function localOffset(from: Vec2, to: Vec2, rotation: number): Vec2 {
  return mtextFromWorld(
    createMText(from, "", { rotation, id: MTEXT_PREVIEW_ID }),
    to
  )
}

function segment(
  ctx: ToolContext,
  a: Vec2,
  b: Vec2,
  stroke: StrokeStyle = RUBBER
): ScenePrimitive {
  return {
    kind: "segment",
    a: ctx.viewport.worldToScreen(a),
    b: ctx.viewport.worldToScreen(b),
    stroke,
  }
}

function frame(
  ctx: ToolContext,
  corners: readonly Vec2[],
  stroke: StrokeStyle
): ScenePrimitive {
  return {
    kind: "path",
    points: corners.map((corner) => ctx.viewport.worldToScreen(corner)),
    closed: true,
    stroke,
  }
}

/** Where the text will hang, at the first corner's height, and how wide it wraps. */
interface MTextBox {
  readonly position: Vec3
  readonly width: number
}

type MTextToolState =
  | { readonly phase: "corner" }
  | { readonly phase: "opposite"; readonly first: Vec3 }
  | { readonly phase: "height"; readonly first: Vec3 }
  | { readonly phase: "justify"; readonly first: Vec3 }
  | { readonly phase: "spacingType"; readonly first: Vec3 }
  | { readonly phase: "spacingValue"; readonly first: Vec3 }
  | { readonly phase: "rotation"; readonly first: Vec3 }
  | { readonly phase: "style"; readonly first: Vec3 }
  | { readonly phase: "width"; readonly first: Vec3 }
  | {
      readonly phase: "edit"
      readonly box: MTextBox
      /** `-MTEXT`'s lines entered so far. */
      readonly lines: readonly string[]
    }

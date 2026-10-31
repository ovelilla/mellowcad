import { Vec2, V } from "../../geometry/Vec2"
import { Vec3, withZ } from "../../geometry/Vec3"
import { normalizeAngle, normalizeDegrees } from "../../geometry/primitives"
import {
  createText,
  EntityId,
  onPlaneOf,
  TextEntity,
  TextJustify,
  TEXT_LINE_SPACING_FACTOR,
} from "../../domain/entities"
import { TextStyleId } from "../../domain/textStyles"
import { DEFAULT_DOCUMENT_SETTINGS, formatLength } from "../../domain/units"
import { ucsAngleToWorld, worldAngleToUcs } from "../../domain/ucs"
import { AddEntityCommand } from "../commands/entityCommands"
import { DynamicInputSession } from "../input/DynamicInput"
import type { PromptId } from "../../locales/types"
import {
  isCoordinateExpression,
  parseCoordinate,
} from "../input/coordinateInput"
import { entityScenePrimitive } from "../SceneBuilder"
import { ScenePrimitive } from "../../scene/types"
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
import {
  type CurrentProperties,
  currentProperties,
  wearingProperties,
} from "./currentProperties"
import { setCommandSettings } from "./commandSettings"

/**
 * AutoCAD's TEXT / DTEXT: single-line text, one object per line; -TEXT is
 * the same asking one line (TEXT-D2).
 *
 * The prompt sequence is AutoCAD 2027's console's (text/p101, p103, p106):
 * `Current text style:  "Standard"  Text height:  2.5000  Annotative:  No
 * Justify:  Left`, `Specify start point of text or [Justify/Style]:` (the
 * point named by the justification: `Specify middle point of text`…),
 * Justify's `Enter an option [Left/Center/…/BR]:`, Style's `Enter style name
 * or [?] <Standard>:`, then `Specify height` and `Specify rotation angle of
 * text`, then `Enter text:`, with Enter dropping to a fresh line Arial's line
 * below (text/p122) and a click elsewhere starting a new run of lines. The
 * height prompt is skipped when the current style fixes a height, and Enter
 * at the start point continues beneath the last line this drawing session
 * wrote that is still there, skipping height and rotation too (text/p125,
 * p128).
 *
 * Typing happens in the dynamic-input box rather than in an on-canvas caret:
 * the box is a real focused input, so the browser's own text editing and IME
 * keep working. What is being typed is drawn in place, at its true size and
 * angle, so the drawing still shows the result as it grows.
 *
 * The two-point justifications (Align and Fit) are not implemented.
 */
export class TextTool implements Tool {
  readonly id = "text"

  private state: TextToolState = { phase: "start", keywords: true }
  /** The current style's name, offered as Style's `<default>`. */
  private styleName: string | null = null
  /** -TEXT: one `Enter text:`, then the end (text/p101, p118). */
  private oneLine = false

  /**
   * TEXTSIZE and the justification, saved in the drawing (rectang/p311), and
   * the rotation, per drawing (`textRotation`): the defaults offered, as the
   * command found them. The height and rotation are set only with the first
   * line written (text/p163), the justification at its answer.
   */
  private height = DEFAULT_DOCUMENT_SETTINGS.textSize
  private justify: TextJustify = "left"
  private rotation = 0

  /**
   * The lines this drawing session wrote, the newest last: Enter at the start
   * continues below the newest still in the drawing (text/p125, p128).
   */
  private written: EntityId[] = []
  private lastScreen: Vec2 | null = null

  /** Makes this run -TEXT's. */
  singleLine(): void {
    this.oneLine = true
  }

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    ctx.selection.clear()
    this.oneLine = false
    const settings = ctx.document.getSettings()
    this.height = settings.textSize
    this.justify = settings.textJustify
    this.rotation = settings.textRotation
    this.writeCurrentLine(ctx, this.currentStyleName(ctx))
    this.state = { phase: "start", keywords: true }
    this.openStartInput(ctx)
  }

  question(): PromptId | ToolQuestion {
    const state = this.state
    switch (state.phase) {
      case "start": {
        const [plain, withKeywords] = POINT_PROMPT[this.justify]
        return state.keywords ? withKeywords : plain
      }
      // WHY not `enterAnOption`: pt-BR words this one `Insira uma opção`.
      case "justify":
        return "textJustifyOption"
      case "style":
        return {
          id: "enterStyleNameOr",
          enter: { name: this.styleName ?? "" },
          takesSpaces: true,
        }
      case "height":
        return { id: "textHeight", enter: this.height }
      case "rotation":
        return {
          id: "textRotation",
          enter: { angle: normalizeDegrees((this.rotation * 180) / Math.PI) },
        }
      case "entry":
        return "enterText"
    }
  }

  /** Justify's answer is a keyword; the text and the style name are content. */
  takes(): QuestionInput | null {
    return this.state.phase === "justify" ? "keyword" : null
  }

  onNewDrawing(): void {
    this.written = []
  }

  onKeyDown(input: KeyInput): void {
    // Escape drops the line being typed and keeps those already entered
    // (desktop text/d01-2): onDeactivate follows and finds nothing to add.
    if (input.key === "Escape" && this.state.phase === "entry") {
      this.state = { phase: "start", keywords: true }
    }
  }

  onEnter(ctx: ToolContext): boolean {
    if (this.state.phase !== "justify") return false
    // Justify takes no Enter (text/p156, AllowNone 0 in p103's trace).
    ctx.report(ctx.text.message("invalidOptionKeyword"), "error")
    return true
  }

  onDeactivate(ctx: ToolContext): void {
    // Leaving any way but Escape — Enter, a click elsewhere, another
    // command — keeps the line being typed.
    this.commitPending(ctx)
    this.state = { phase: "start", keywords: true }
    this.oneLine = false
    ctx.dynamicInput.close()
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen
    if (this.state.phase === "height" || this.state.phase === "rotation") {
      this.state = { ...this.state, cursor: input.point }
    }
    ctx.dynamicInput.setPosition(input.screen)
    ctx.requestRender()
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0) return

    switch (this.state.phase) {
      case "start":
        this.beginAt(input.point, ctx)
        break
      case "height":
        this.commitHeight(V.distance(this.state.position, input.point), ctx)
        break
      case "rotation": {
        const offset = V.sub(input.point, this.state.position)
        const rotation =
          V.length(offset) > 1e-9
            ? normalizeAngle(
                worldAngleToUcs(ctx.ucs, Math.atan2(offset.y, offset.x))
              )
            : 0
        this.enterEntry(this.state, rotation, ctx)
        break
      }
      case "entry":
        // -TEXT asks its one line at the command line.
        if (this.oneLine) break
        // "Click elsewhere in a drawing to start a new set of rows of
        // single-line text" — the current line is kept and a new run begins.
        this.commitPending(ctx)
        this.state = { ...this.state, position: input.point }
        this.openEntryInput(ctx)
        break
    }
    ctx.requestRender()
  }

  commandOptions(): readonly CommandOption[] {
    switch (this.state.phase) {
      case "start":
        // The justifications are answered here too, unlisted, as AutoCAD's
        // first prompt takes them (`MC` asks the middle point at once).
        return this.state.keywords
          ? [
              { id: "Justify" },
              { id: "Style" },
              ...JUSTIFY_KEYWORDS.map((id) => ({ id, hidden: true as const })),
            ]
          : []
      case "justify":
        return JUSTIFY_KEYWORDS.map((id) => ({ id }))
      case "style":
        return [{ id: "?" }]
      default:
        // While the text itself is typed every letter is content.
        return []
    }
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    const state = this.state
    if (
      state.phase === "justify" ||
      (state.phase === "start" && state.keywords && id in JUSTIFY_BY_KEYWORD)
    ) {
      const justify = JUSTIFY_BY_KEYWORD[id]
      if (justify === undefined) return "unhandled"
      this.justify = justify
      // The point the justification names, asked without the keywords.
      this.state = { phase: "start", keywords: false }
      setCommandSettings({ textJustify: justify }, ctx)
      this.openStartInput(ctx)
      return "continue"
    }
    if (state.phase === "style") {
      if (id !== "?") return "unhandled"
      this.listStyles(ctx)
      return "continue"
    }
    if (state.phase !== "start" || !state.keywords) return "unhandled"
    switch (id) {
      case "Justify":
        this.state = { phase: "justify" }
        // Keywords only, the focus left on the drawing.
        ctx.dynamicInput.open({ fields: [], commit: () => {} })
        return "continue"
      case "Style":
        this.state = { phase: "style" }
        this.openStyleInput(ctx)
        return "continue"
      default:
        return "unhandled"
    }
  }

  getConstraintAnchor(): Vec2 | null {
    return this.state.phase === "height" || this.state.phase === "rotation"
      ? this.state.position
      : null
  }

  wantsSnap(): boolean {
    return (
      this.state.phase === "start" ||
      this.state.phase === "height" ||
      this.state.phase === "rotation"
    )
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    const { viewport } = ctx

    switch (this.state.phase) {
      case "height":
      case "rotation":
        // The pointing guide: its length is the height, its direction the
        // rotation. Amber and dashed (desktop text/d01-5, d01-6; the trace's
        // UseDashedLine).
        return [
          {
            kind: "segment",
            a: viewport.worldToScreen(this.state.position),
            b: viewport.worldToScreen(this.state.cursor),
            stroke: { color: THEME.dashedRubberBand, width: 1, dash: [2, 3] },
          },
        ]
      case "entry": {
        const value = ctx.dynamicInput.getText("value")
        if (value.length === 0) return []
        return entityScenePrimitive(viewport, this.pendingText(value), {
          color: THEME.rubberBand,
          width: 1,
        })
      }
      default:
        return []
    }
  }

  /** The text as it stands while being typed; a fixed id, never a fresh one. */
  private pendingText(value: string): TextEntity {
    const state = this.state
    if (state.phase !== "entry") throw new Error("no text is being typed")
    return createText(state.position, value, {
      height: state.height,
      rotation: state.rotation,
      justify: this.justify,
      styleId: state.styleId,
      id: TEXT_PREVIEW_ID,
    })
  }

  /**
   * `Current text style:  "Standard"  Text height:  2.5000 …`, naming
   * `style`: after Style the console names the style it was before, with the
   * new one's height (text/p126, p162).
   */
  private writeCurrentLine(ctx: ToolContext, style: string): void {
    writeCurrentTextLine(
      "currentTextStyle",
      style,
      this.height,
      this.justify,
      ctx
    )
  }

  /**
   * Starts a text object at `position`, asking only for what is still
   * unknown. The current properties are the start point's (text/p165).
   */
  private beginAt(position: Vec3, ctx: ToolContext): void {
    const properties = currentProperties(ctx)
    const fixed = fixedTextHeight(ctx)
    if (fixed !== null) {
      this.enterRotation({ position, properties }, fixed, ctx)
      return
    }
    this.state = { phase: "height", position, properties, cursor: position }
    this.openHeightInput(ctx)
  }

  private currentStyleId(ctx: ToolContext): TextStyleId {
    return ctx.document.getCurrentTextStyleId()
  }

  private currentStyleName(ctx: ToolContext): string {
    const id = this.currentStyleId(ctx)
    return ctx.document.getTextStyle(id)?.name ?? id
  }

  /** A height typed or pointed: refused unless above zero (text/p111, p112). */
  private commitHeight(height: number, ctx: ToolContext): void {
    if (this.state.phase !== "height") return
    if (!(height > 0)) {
      ctx.report(ctx.text.message("positiveNonzero"), "error")
      return
    }
    this.enterRotation(this.state, height, ctx)
  }

  private enterRotation(
    { position, properties }: StartedText,
    height: number,
    ctx: ToolContext
  ): void {
    this.state = {
      phase: "rotation",
      position,
      properties,
      height,
      cursor: position,
    }
    this.openRotationInput(ctx)
  }

  /**
   * `rotation` is the one asked for, radians from the UCS X axis, stored
   * normalised (text/p115: −30 is 330).
   */
  private enterEntry(
    { position, properties, height }: StartedText & { readonly height: number },
    rotation: number,
    ctx: ToolContext
  ): void {
    this.state = {
      phase: "entry",
      position,
      properties,
      height,
      ucsRotation: rotation,
      rotation: normalizeAngle(ucsAngleToWorld(ctx.ucs, rotation)),
      styleId: this.currentStyleId(ctx),
    }
    this.openEntryInput(ctx)
  }

  /**
   * Commits the line being typed, if any. Returns the entity so the caller can
   * place the next line beneath it. TEXTSIZE and the rotation are set with
   * it, so a run that writes nothing leaves them (text/p163, desktop d01).
   */
  private commitPending(ctx: ToolContext): TextEntity | null {
    const state = this.state
    if (state.phase !== "entry") return null
    const value = ctx.dynamicInput.getText("value")
    if (value.trim().length === 0) return null
    const text = onPlaneOf(
      createText(state.position, value, {
        height: state.height,
        rotation: state.rotation,
        justify: this.justify,
        styleId: state.styleId,
        layerId: state.properties.layerId,
      }),
      state.position
    )
    this.written.push(text.id)
    this.height = state.height
    this.rotation = state.ucsRotation
    setCommandSettings(
      { textSize: state.height, textRotation: state.ucsRotation },
      ctx
    )
    ctx.execute(new AddEntityCommand(wearingProperties(text, state.properties)))
    return text
  }

  /** Enter while typing: keep the line and drop to a fresh one beneath it. */
  private commitLine(ctx: ToolContext): boolean {
    if (this.state.phase !== "entry") return false
    const committed = this.commitPending(ctx)
    if (!committed || this.oneLine) {
      // Enter on an empty line ends the command, as DTEXT always has; -TEXT
      // asks one line. Nothing is left for onDeactivate to add.
      this.state = { phase: "start", keywords: true }
      ctx.endCommand()
      return true
    }
    this.state = { ...this.state, position: lineBelow(committed) }
    this.openEntryInput(ctx)
    return true
  }

  /** The newest line this session wrote that is still in the drawing. */
  private lineToContinue(ctx: ToolContext): TextEntity | null {
    for (let i = this.written.length - 1; i >= 0; i--) {
      const entity = ctx.document.get(this.written[i])
      if (entity?.type === "text") return entity
    }
    return null
  }

  private openStartInput(ctx: ToolContext): void {
    const session: DynamicInputSession = {
      fields: [{ id: "point", kind: "coordinate" }],
      commit: () => {},
      commitRaw: (commitCtx) => this.commitStart(commitCtx),
    }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  private commitStart(ctx: ToolContext): boolean {
    if (this.state.phase !== "start") return false
    const text = ctx.dynamicInput.getText("point").trim()
    if (text.length === 0) {
      // Enter at the start prompt continues under the previous line, skipping
      // the height and rotation prompts; with nothing to continue it is
      // refused and asked again (text/p120).
      const previous = this.lineToContinue(ctx)
      if (!previous) {
        ctx.report(
          ctx.text.message(
            this.state.keywords ? "pointOrKeywordRequired" : "invalidPoint"
          ),
          "error"
        )
        return true
      }
      this.state = {
        phase: "entry",
        position: lineBelow(previous),
        properties: currentProperties(ctx),
        height: previous.height,
        rotation: previous.rotation,
        ucsRotation: normalizeAngle(
          worldAngleToUcs(ctx.ucs, previous.rotation)
        ),
        styleId: previous.styleId,
      }
      this.openEntryInput(ctx)
      return true
    }
    if (!isCoordinateExpression(text)) return false
    const point = parseCoordinate(text, {
      lastPoint: ctx.lastPoint,
      relativeByDefault: false,
      ucs: ctx.ucs,
      elevation: ctx.elevation,
    })
    if (!point) return false
    this.beginAt(point, ctx)
    return true
  }

  private openHeightInput(ctx: ToolContext): void {
    const session: DynamicInputSession = {
      fields: [{ id: "height", prompt: "textHeight", kind: "distance" }],
      commit: (values, commitCtx) =>
        this.commitHeight(values.height, commitCtx),
    }
    ctx.dynamicInput.open(session)
    // The live value stays on the remembered height so Enter takes AutoCAD's
    // `<default>`; pointing sets it by distance instead.
    ctx.dynamicInput.setDefault("height", this.height)
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  private openRotationInput(ctx: ToolContext): void {
    const session: DynamicInputSession = {
      fields: [
        {
          id: "rotation",
          prompt: "textRotation",
          kind: "angle",
        },
      ],
      commit: (values, commitCtx) => {
        if (this.state.phase !== "rotation") return
        this.enterEntry(
          this.state,
          normalizeAngle((values.rotation * Math.PI) / 180),
          commitCtx
        )
      },
    }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setDefault(
      "rotation",
      normalizeDegrees((this.rotation * 180) / Math.PI)
    )
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  private openEntryInput(ctx: ToolContext): void {
    const session: DynamicInputSession = {
      fields: [{ id: "value", prompt: "text", kind: "text", verbatim: true }],
      commit: () => {},
      commitRaw: (commitCtx) => this.commitLine(commitCtx),
    }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  /** The style's name, typed in full; `?` lists the styles. */
  private openStyleInput(ctx: ToolContext): void {
    this.styleName =
      ctx.document.getTextStyle(this.currentStyleId(ctx))?.name ?? null
    const session: DynamicInputSession = {
      fields: [{ id: "keyword", prompt: "styleName", kind: "text" }],
      commit: () => {},
      commitRaw: (commitCtx) => this.commitStyle(commitCtx),
    }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  private commitStyle(ctx: ToolContext): boolean {
    if (this.state.phase !== "style") return false
    const typed = ctx.dynamicInput.getText("keyword").trim()
    // The box holds a name, not a keyword: `?` is read here.
    if (ctx.text.resolveKeyword(typed, ["?"]) === "?") {
      this.listStyles(ctx)
      return true
    }
    const before = this.styleName ?? this.currentStyleName(ctx)
    // Empty is Enter, which keeps the `<current>` style.
    if (typed !== "") {
      const style = ctx.document
        .getTextStyles()
        .find((s) => s.name.toLowerCase() === typed.toLowerCase())
      if (!style) {
        ctx.report(
          ctx.text.message("textStyleUndefined", { name: typed }),
          "error"
        )
        this.openStyleInput(ctx)
        return true
      }
      ctx.setCurrentTextStyle(style.id)
    }
    this.writeCurrentLine(ctx, before)
    this.state = { phase: "start", keywords: true }
    this.openStartInput(ctx)
    return true
  }

  /**
   * `?`: every style as AutoCAD lists it, then the current one; then the
   * Current line and the start point (text/p109).
   */
  private listStyles(ctx: ToolContext): void {
    listTextStyles(this.currentStyleId(ctx), ctx)
    this.writeCurrentLine(ctx, this.currentStyleName(ctx))
    this.state = { phase: "start", keywords: true }
    this.openStartInput(ctx)
  }
}

/** The current style's fixed height, or null when it leaves it free. */
export function fixedTextHeight(ctx: ToolContext): number | null {
  const style = ctx.document.getTextStyle(ctx.document.getCurrentTextStyleId())
  return style && style.height > 0 ? style.height : null
}

/**
 * The Current line TEXT and ATTDEF write (`message`), naming `style`, with
 * TEXTSIZE or a fixed-height style's own height (text/p121) and the
 * justification in the command language's words (TXT-08: es `SI` for TL).
 */
export function writeCurrentTextLine(
  message: "currentTextStyle" | "attdefTextStyle",
  style: string,
  height: number,
  justify: TextJustify,
  ctx: ToolContext
): void {
  ctx.report(
    ctx.text.message(message, {
      style,
      height: formatLength(
        fixedTextHeight(ctx) ?? height,
        ctx.document.getSettings()
      ),
      justify: ctx.text.message("textJustifyName", { justify }),
    })
  )
}

/**
 * Style's `?`, which TEXT and ATTDEF share: every style as AutoCAD lists it,
 * then `current`.
 */
export function listTextStyles(current: TextStyleId, ctx: ToolContext): void {
  const settings = ctx.document.getSettings()
  const entries = ctx.document.getTextStyles().map((style) =>
    ctx.text.message("textStyleEntry", {
      name: `"${style.name}"`.padEnd(12),
      height: formatLength(style.height, settings),
      width: formatLength(1, settings),
    })
  )
  ctx.report(
    [
      ctx.text.message("textStylesHeader"),
      ...entries,
      ctx.text.message("currentTextStyleName", {
        name: ctx.document.getTextStyle(current)?.name ?? current,
      }),
    ].join("\n")
  )
}

/**
 * The point each justification asks for, as AutoCAD names it: without and with
 * the `or [Justify/Style]` the first prompt offers. ATTDEF asks TEXT's.
 */
export const POINT_PROMPT: Readonly<
  Record<TextJustify, readonly [PromptId, PromptId]>
> = {
  left: ["specifyStartPointOfText", "specifyStartPointOfTextOr"],
  center: ["specifyCenterPointOfText", "specifyCenterPointOfTextOr"],
  right: [
    "specifyRightEndpointOfTextBaseline",
    "specifyRightEndpointOfTextBaselineOr",
  ],
  middle: ["specifyMiddlePointOfText", "specifyMiddlePointOfTextOr"],
  mc: ["specifyMiddlePointOfText", "specifyMiddlePointOfTextOr"],
  tl: ["specifyTopLeftPointOfText", "specifyTopLeftPointOfTextOr"],
  tc: ["specifyTopCenterPointOfText", "specifyTopCenterPointOfTextOr"],
  tr: ["specifyTopRightPointOfText", "specifyTopRightPointOfTextOr"],
  ml: ["specifyMiddleLeftPointOfText", "specifyMiddleLeftPointOfTextOr"],
  mr: ["specifyMiddleRightPointOfText", "specifyMiddleRightPointOfTextOr"],
  bl: ["specifyBottomLeftPointOfText", "specifyBottomLeftPointOfTextOr"],
  bc: ["specifyBottomCenterPointOfText", "specifyBottomCenterPointOfTextOr"],
  br: ["specifyBottomRightPointOfText", "specifyBottomRightPointOfTextOr"],
}

/** Preview frames reuse one id so drawing them never burns entity ids. */
const TEXT_PREVIEW_ID = "__text_preview__"

/** The Justify prompt's global keywords, in AutoCAD's order. */
export const JUSTIFY_BY_KEYWORD: Readonly<Record<string, TextJustify>> = {
  Left: "left",
  Center: "center",
  Right: "right",
  Middle: "middle",
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

export const JUSTIFY_KEYWORDS: string[] = Object.keys(JUSTIFY_BY_KEYWORD)

/**
 * Where the next line of text starts: one line below, measured along the text's
 * own down direction so a rotated run stays stacked square to itself, and at
 * the same height.
 */
export function lineBelow(
  text: Pick<TextEntity, "position" | "height" | "rotation" | "elevation">
): Vec3 {
  const gap = text.height * TEXT_LINE_SPACING_FACTOR
  return withZ(
    {
      x: text.position.x + gap * Math.sin(text.rotation),
      y: text.position.y - gap * Math.cos(text.rotation),
    },
    text.elevation ?? 0
  )
}

/** What a text being started holds once its point is given. */
interface StartedText {
  readonly position: Vec3
  /** The current layer and properties at the start point (text/p165). */
  readonly properties: CurrentProperties
}

type TextToolState =
  /**
   * Awaiting the start point — or, at the first prompt, a Justify / Style
   * keyword; after Justify the point is asked alone.
   */
  | { readonly phase: "start"; readonly keywords: boolean }
  /** Typing a justification keyword. */
  | { readonly phase: "justify" }
  /** Typing a style name. */
  | { readonly phase: "style" }
  | (StartedText & {
      readonly phase: "height"
      readonly cursor: Vec2
    })
  | (StartedText & {
      readonly phase: "rotation"
      readonly height: number
      readonly cursor: Vec2
    })
  /** Typing the text itself. */
  | (StartedText & {
      readonly phase: "entry"
      readonly height: number
      /** The world's, the text's own. */
      readonly rotation: number
      /** As asked, from the UCS X axis: the next one's `<default>`. */
      readonly ucsRotation: number
      readonly styleId: string
    })

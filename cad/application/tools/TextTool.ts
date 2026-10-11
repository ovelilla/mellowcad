import { Vec2, V } from "../../geometry/Vec2"
import { Vec3, withZ } from "../../geometry/Vec3"
import { normalizeDegrees } from "../../geometry/primitives"
import {
  createText,
  onPlaneOf,
  TextEntity,
  TextJustify,
  TEXT_LINE_SPACING_FACTOR,
} from "../../domain/entities"
import { DEFAULT_TEXT_HEIGHT, TextStyleId } from "../../domain/textStyles"
import { formatLength } from "../../domain/units"
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
  PointerInput,
  QuestionInput,
  Tool,
  ToolContext,
  ToolQuestion,
} from "./Tool"
import { withCurrentProperties } from "./currentProperties"

/**
 * AutoCAD's TEXT / DTEXT: single-line text, one object per line.
 *
 * The prompt sequence is AutoCAD's, as its 2023 console asks it — `Current text
 * style:  "Standard"  Text height:  2.5000  Annotative:  No  Justify:  Left`,
 * `Specify start point of text or [Justify/Style]:` (the point named by the
 * justification: `Specify middle point of text`…), Justify's `Enter an option
 * [Left/Center/…/BR]:`, Style's `Enter style name or [?] <Standard>:`, then
 * `Specify height` and `Specify rotation angle of text`, then `Enter text:`,
 * with Enter dropping to a fresh line directly beneath the previous one and a
 * click elsewhere starting a new run of lines. The height prompt is skipped when the
 * current style fixes a height, and pressing Enter at the start point continues
 * beneath the last line this command wrote, skipping height and rotation too.
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

  /**
   * Last height and rotation used, offered as the `<default>` of their prompts.
   * They live on the instance, like FILLET's radius: AutoCAD carries them from
   * one invocation to the next (its TEXTSIZE) rather than resetting each time.
   * The rotation is kept from the UCS X axis, as it is asked.
   */
  private height = DEFAULT_TEXT_HEIGHT
  private rotation = 0
  private justify: TextJustify = "left"
  /**
   * Style chosen with the Style keyword; null follows the drawing's current
   * one. The choice is the command's, not the document's — there is no style
   * manager yet, so nothing else would observe a change to the drawing.
   */
  private styleId: TextStyleId | null = null

  /** The last line written, so Enter at the start prompt continues below it. */
  private lastLine: TextEntity | null = null
  private lastScreen: Vec2 | null = null

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    ctx.selection.clear()
    const style = ctx.document.getTextStyle(this.currentStyleId(ctx))
    ctx.report(
      ctx.text.message("currentTextStyle", {
        style: style?.name ?? this.currentStyleId(ctx),
        height: formatLength(this.height, ctx.document.getSettings()),
        justify: ctx.text.keyword(JUSTIFY_KEYWORD_OF[this.justify]),
      })
    )
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
      case "justify":
        return "enterAnOption"
      case "style":
        return {
          id: "enterStyleNameOr",
          enter: { name: this.styleName ?? "" },
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

  onDeactivate(ctx: ToolContext): void {
    // Every exit route — Escape, Enter, switching tools — comes through here,
    // and AutoCAD keeps whatever you had typed, so this is the commit point.
    this.commitPending(ctx)
    this.state = { phase: "start", keywords: true }
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
      case "height": {
        const height = V.distance(this.state.position, input.point)
        if (height > 0) this.enterRotation(this.state.position, height, ctx)
        break
      }
      case "rotation": {
        const offset = V.sub(input.point, this.state.position)
        const rotation =
          V.length(offset) > 1e-9
            ? worldAngleToUcs(ctx.ucs, Math.atan2(offset.y, offset.x))
            : 0
        this.enterEntry(this.state.position, this.state.height, rotation, ctx)
        break
      }
      case "entry":
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
    const rubber = { color: THEME.rubberBand, width: 1 }

    switch (this.state.phase) {
      case "height":
      case "rotation":
        // The pointing guide: its length is the height, its direction the
        // rotation, depending on which is being specified.
        return [
          {
            kind: "segment",
            a: viewport.worldToScreen(this.state.position),
            b: viewport.worldToScreen(this.state.cursor),
            stroke: rubber,
          },
        ]
      case "entry": {
        const value = ctx.dynamicInput.getText("value")
        if (value.length === 0) return []
        return entityScenePrimitive(viewport, this.pendingText(value), rubber)
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

  /** Starts a text object at `position`, asking only for what is still unknown. */
  private beginAt(position: Vec3, ctx: ToolContext): void {
    const fixed = this.styleHeight(ctx)
    if (fixed !== null) {
      this.enterRotation(position, fixed, ctx)
      return
    }
    this.state = { phase: "height", position, cursor: position }
    this.openHeightInput(ctx)
  }

  /** The current style's fixed height, or null when it leaves it free. */
  private styleHeight(ctx: ToolContext): number | null {
    const style = ctx.document.getTextStyle(this.currentStyleId(ctx))
    return style && style.height > 0 ? style.height : null
  }

  private currentStyleId(ctx: ToolContext): TextStyleId {
    return this.styleId ?? ctx.document.getCurrentTextStyleId()
  }

  private enterRotation(
    position: Vec3,
    height: number,
    ctx: ToolContext
  ): void {
    this.height = height
    this.state = { phase: "rotation", position, height, cursor: position }
    this.openRotationInput(ctx)
  }

  /** `rotation` is the one asked for: radians from the UCS X axis. */
  private enterEntry(
    position: Vec3,
    height: number,
    rotation: number,
    ctx: ToolContext
  ): void {
    this.rotation = rotation
    this.state = {
      phase: "entry",
      position,
      height,
      rotation: ucsAngleToWorld(ctx.ucs, rotation),
      styleId: this.currentStyleId(ctx),
    }
    this.openEntryInput(ctx)
  }

  /**
   * Commits the line being typed, if any. Returns the entity so the caller can
   * place the next line beneath it.
   */
  private commitPending(ctx: ToolContext): TextEntity | null {
    if (this.state.phase !== "entry") return null
    const value = ctx.dynamicInput.getText("value")
    if (value.trim().length === 0) return null
    const text = onPlaneOf(
      createText(this.state.position, value, {
        height: this.state.height,
        rotation: this.state.rotation,
        justify: this.justify,
        styleId: this.state.styleId,
        layerId: ctx.document.getCurrentLayerId(),
      }),
      this.state.position
    )
    this.lastLine = text
    ctx.execute(new AddEntityCommand(withCurrentProperties(text, ctx)))
    return text
  }

  /** Enter while typing: keep the line and drop to a fresh one beneath it. */
  private commitLine(ctx: ToolContext): boolean {
    if (this.state.phase !== "entry") return false
    const committed = this.commitPending(ctx)
    if (!committed) {
      // Enter on an empty line ends the command, as DTEXT always has.
      ctx.endCommand()
      return true
    }
    this.state = { ...this.state, position: lineBelow(committed) }
    this.openEntryInput(ctx)
    return true
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
    const text = ctx.dynamicInput.getText("point").trim()
    if (text.length === 0) {
      // Enter at the start prompt continues under the previous line, skipping
      // the height and rotation prompts; with nothing to continue it ends.
      if (!this.lastLine) {
        ctx.endCommand()
        return true
      }
      const previous = this.lastLine
      this.state = {
        phase: "entry",
        position: lineBelow(previous),
        height: previous.height,
        rotation: previous.rotation,
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
      commit: (values, commitCtx) => {
        if (this.state.phase !== "height") return
        if (!(values.height > 0)) return
        this.enterRotation(this.state.position, values.height, commitCtx)
      },
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
          this.state.position,
          this.state.height,
          (values.rotation * Math.PI) / 180,
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
      fields: [{ id: "value", prompt: "text", kind: "text" }],
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
      this.styleId = style.id
    }
    this.state = { phase: "start", keywords: true }
    this.openStartInput(ctx)
    return true
  }

  /** `?`: every style as AutoCAD lists it, then the current one; asked again. */
  private listStyles(ctx: ToolContext): void {
    listTextStyles(this.currentStyleId(ctx), ctx)
    this.openStyleInput(ctx)
  }
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

export const JUSTIFY_KEYWORDS = Object.keys(JUSTIFY_BY_KEYWORD)

const JUSTIFY_KEYWORD_OF = Object.fromEntries(
  Object.entries(JUSTIFY_BY_KEYWORD).map(([id, justify]) => [justify, id])
) as Readonly<Record<TextJustify, string>>

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
  | {
      readonly phase: "height"
      readonly position: Vec3
      readonly cursor: Vec2
    }
  | {
      readonly phase: "rotation"
      readonly position: Vec3
      readonly height: number
      readonly cursor: Vec2
    }
  /** Typing the text itself. */
  | {
      readonly phase: "entry"
      readonly position: Vec3
      readonly height: number
      readonly rotation: number
      readonly styleId: string
    }

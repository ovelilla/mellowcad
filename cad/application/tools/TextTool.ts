import { Vec2, V } from "../../geometry/Vec2"
import { normalizeDegrees } from "../../geometry/primitives"
import {
  createText,
  TextEntity,
  TextJustify,
  TEXT_LINE_SPACING_FACTOR,
} from "../../domain/entities"
import { DEFAULT_TEXT_HEIGHT, TextStyleId } from "../../domain/textStyles"
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
  Tool,
  ToolContext,
} from "./Tool"

/**
 * AutoCAD's TEXT / DTEXT: single-line text, one object per line.
 *
 * The prompt sequence is AutoCAD's — start point (or the Justify / Style
 * keywords), then height and rotation, then the text itself, with Enter
 * dropping to a fresh line directly beneath the previous one and a click
 * elsewhere starting a new run of lines. The height prompt is skipped when the
 * current style fixes a height, and pressing Enter at the start point continues
 * beneath the last line this command wrote, skipping height and rotation too.
 *
 * Typing happens in the dynamic-input box rather than in an on-canvas caret:
 * the box is a real focused input, so the browser's own text editing and IME
 * keep working. What is being typed is drawn in place, at its true size and
 * angle, so the drawing still shows the result as it grows.
 *
 * The two-point justifications (Align and Fit) and MTEXT are not implemented.
 */
export class TextTool implements Tool {
  readonly id = "text"

  private state: TextToolState = { phase: "start" }

  /**
   * Last height and rotation used, offered as the `<default>` of their prompts.
   * They live on the instance, like FILLET's radius: AutoCAD carries them from
   * one invocation to the next (its TEXTSIZE) rather than resetting each time.
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
    this.state = { phase: "start" }
    this.openStartInput(ctx)
  }

  onDeactivate(ctx: ToolContext): void {
    // Every exit route — Escape, Enter, switching tools — comes through here,
    // and AutoCAD keeps whatever you had typed, so this is the commit point.
    this.commitPending(ctx)
    this.state = { phase: "start" }
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
          V.length(offset) > 1e-9 ? Math.atan2(offset.y, offset.x) : 0
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
    // Only at the start prompt: while a keyword or the text itself is being
    // typed every letter is content, so nothing may claim it.
    return this.state.phase === "start"
      ? [{ id: "Justify" }, { id: "Style" }]
      : []
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    if (this.state.phase !== "start") return "unhandled"
    switch (id) {
      case "Justify":
        this.state = { phase: "justify" }
        this.reportJustifyOptions(ctx)
        this.openKeywordInput(ctx, "justify")
        return "continue"
      case "Style":
        this.state = { phase: "style" }
        this.openKeywordInput(ctx, "styleName")
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
  private beginAt(position: Vec2, ctx: ToolContext): void {
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
    position: Vec2,
    height: number,
    ctx: ToolContext
  ): void {
    this.height = height
    this.state = { phase: "rotation", position, height, cursor: position }
    this.openRotationInput(ctx)
  }

  private enterEntry(
    position: Vec2,
    height: number,
    rotation: number,
    ctx: ToolContext
  ): void {
    this.rotation = rotation
    this.state = {
      phase: "entry",
      position,
      height,
      rotation,
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
    const text = createText(this.state.position, value, {
      height: this.state.height,
      rotation: this.state.rotation,
      justify: this.justify,
      styleId: this.state.styleId,
      layerId: ctx.document.getCurrentLayerId(),
    })
    this.lastLine = text
    ctx.execute(new AddEntityCommand(text))
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
      fields: [
        {
          id: "point",
          prompt: "textStartPoint",
          kind: "coordinate",
        },
      ],
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
      lastPoint: null,
      relativeByDefault: false,
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
    ctx.dynamicInput.setLive("height", this.height)
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
    ctx.dynamicInput.setLive(
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

  /**
   * AutoCAD's Justify prompt, minus the two-point Align and Fit options this
   * command does not implement yet. Its keywords run to two letters (`TL`,
   * `MC`), so it is read from a free-text field, and echoed here so the
   * command line still shows the prompt.
   */
  private reportJustifyOptions(ctx: ToolContext): void {
    ctx.report(
      ctx.text.message("textJustifyOptions", {
        keywords: ctx.text.keywordList(JUSTIFY_KEYWORDS),
      })
    )
  }

  /** A prompt whose answer is a keyword typed in full (Justify, Style). */
  private openKeywordInput(ctx: ToolContext, prompt: PromptId): void {
    const session: DynamicInputSession = {
      fields: [{ id: "keyword", prompt, kind: "text" }],
      commit: () => {},
      commitRaw: (commitCtx) => this.commitKeyword(commitCtx),
    }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  private commitKeyword(ctx: ToolContext): boolean {
    const typed = ctx.dynamicInput.getText("keyword").trim()
    if (this.state.phase === "justify") {
      const keyword = ctx.text.resolveKeyword(typed, JUSTIFY_KEYWORDS)
      if (!keyword) {
        this.reportJustifyOptions(ctx) // re-ask rather than accept a wrong guess
        return false
      }
      this.justify = JUSTIFY_BY_KEYWORD[keyword]
    } else if (this.state.phase === "style") {
      const style = ctx.document
        .getTextStyles()
        .find((s) => s.name.toLowerCase() === typed.toLowerCase())
      if (!style) {
        ctx.report(
          ctx.text.message("textStyleUndefined", { name: typed }),
          "error"
        )
        return false
      }
      this.styleId = style.id
    } else {
      return false
    }
    this.state = { phase: "start" }
    this.openStartInput(ctx)
    return true
  }
}

/** Preview frames reuse one id so drawing them never burns entity ids. */
const TEXT_PREVIEW_ID = "__text_preview__"

/** The Justify prompt's global keywords, in AutoCAD's order. */
const JUSTIFY_BY_KEYWORD: Readonly<Record<string, TextJustify>> = {
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

const JUSTIFY_KEYWORDS = Object.keys(JUSTIFY_BY_KEYWORD)

/**
 * Where the next line of text starts: one line below, measured along the text's
 * own down direction so a rotated run stays stacked square to itself.
 */
function lineBelow(text: TextEntity): Vec2 {
  const gap = text.height * TEXT_LINE_SPACING_FACTOR
  return {
    x: text.position.x + gap * Math.sin(text.rotation),
    y: text.position.y - gap * Math.cos(text.rotation),
  }
}

type TextToolState =
  /** Awaiting the start point, or a Justify / Style keyword. */
  | { readonly phase: "start" }
  /** Typing a justification keyword. */
  | { readonly phase: "justify" }
  /** Typing a style name. */
  | { readonly phase: "style" }
  | {
      readonly phase: "height"
      readonly position: Vec2
      readonly cursor: Vec2
    }
  | {
      readonly phase: "rotation"
      readonly position: Vec2
      readonly height: number
      readonly cursor: Vec2
    }
  /** Typing the text itself. */
  | {
      readonly phase: "entry"
      readonly position: Vec2
      readonly height: number
      readonly rotation: number
      readonly styleId: string
    }

import { Vec2, V } from "../../geometry/Vec2"
import { Vec3 } from "../../geometry/Vec3"
import { normalizeAngle, normalizeDegrees } from "../../geometry/primitives"
import {
  AttributeDefinitionEntity,
  AttributeModes,
  EntityId,
  DEFAULT_ATTRIBUTE_MODES,
  TextJustify,
  attributeInput,
  attributeTag,
  createAttributeDefinition,
  onPlaneOf,
} from "../../domain/entities"
import { TextStyleId } from "../../domain/textStyles"
import { DEFAULT_DOCUMENT_SETTINGS } from "../../domain/units"
import { ucsAngleToWorld, ucsRotation, worldAngleToUcs } from "../../domain/ucs"
import { AddEntityCommand } from "../commands/entityCommands"
import type { PromptId } from "../../locales/types"
import {
  isCoordinateExpression,
  parseCoordinate,
} from "../input/coordinateInput"
import { ScenePrimitive } from "../../scene/types"
import { THEME } from "../../scene/theme"
import {
  JUSTIFY_BY_KEYWORD,
  JUSTIFY_KEYWORDS,
  POINT_PROMPT,
  fixedTextHeight,
  lineBelow,
  listTextStyles,
  writeCurrentTextLine,
} from "./TextTool"
import {
  CommandOption,
  CommandOptionOutcome,
  type HeldVariables,
  PointerInput,
  Tool,
  ToolContext,
  ToolQuestion,
} from "./Tool"
import { withCurrentProperties } from "./currentProperties"
import { setCommandSettings } from "./commandSettings"

/** The modes a keyword toggles, keyed by AutoCAD's global keyword. */
const MODE_BY_KEYWORD: Readonly<Record<string, keyof AttributeModes>> = {
  Invisible: "invisible",
  Constant: "constant",
  Verify: "verify",
  Preset: "preset",
  "Lock position": "lockPosition",
}

/** AFLAGS' bit for each mode; Multiple lines' 32 is not modelled. */
const AFLAGS_BIT: Readonly<Record<keyof AttributeModes, number>> = {
  invisible: 1,
  constant: 2,
  verify: 4,
  preset: 8,
  lockPosition: 16,
}

type AttDefState =
  | { readonly phase: "modes" }
  | { readonly phase: "tag" }
  | { readonly phase: "prompt" }
  | { readonly phase: "value" }
  /** `keywords`: the first point prompt, before a justification was chosen. */
  | { readonly phase: "start"; readonly keywords: boolean }
  | { readonly phase: "justify" }
  | { readonly phase: "style" }
  | { readonly phase: "height"; readonly position: Vec3; readonly cursor: Vec2 }
  | {
      readonly phase: "rotation"
      readonly position: Vec3
      readonly height: number
      readonly cursor: Vec2
    }

/**
 * AutoCAD's -ATTDEF, which ATTDEF runs too: AutoCAD's ATTDEF opens the
 * Attribute Definition dialog, and here, as with BLOCK, the command line asks
 * the same things in -ATTDEF's order — `Enter an option to change [...]
 * <done>:` for the modes, the tag, the prompt, the default (or, for a constant
 * attribute, the value), and then "the same prompts as the TEXT command, using
 * the attribute tag instead of requesting a text string", after `Current text
 * style:  "Standard"  Text height:  2.50  Justify:  Left`.
 *
 * TEXTSIZE, the justification and the rotation are TEXT's, shared through
 * the drawing settings both ways (probes blocks/p326, p327). Enter at the
 * start point places the definition one line below the newest this session
 * defined that is still in the drawing, which is how -ATTDEF stacks a block's
 * attributes and what the dialog calls "Align below previous attribute
 * definition"; with none it is refused, as TEXT's (p321, p322, p324).
 *
 * The modes are AFLAGS, which AutoCAD does not save: they live on the tool for
 * the session. Annotative and Multiple lines are not offered.
 */
export class AttDefTool implements Tool {
  readonly id = "attdef"

  private state: AttDefState = { phase: "modes" }
  private modes: AttributeModes = DEFAULT_ATTRIBUTE_MODES
  private tag = ""
  private prompt = ""
  private value = ""
  /**
   * TEXTSIZE, the justification and the rotation (radians from the UCS X
   * axis) as the command found them in the drawing settings, TEXT's.
   */
  private height = DEFAULT_DOCUMENT_SETTINGS.textSize
  private rotation = 0
  private justify: TextJustify = "left"
  /** The current style's name, offered as Style's `<default>`. */
  private styleName = ""
  /**
   * The definitions this drawing session wrote, the newest last: Enter at
   * the start continues below the newest still in the drawing (p320, p324).
   */
  private written: EntityId[] = []
  private lastScreen: Vec2 | null = null

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    ctx.selection.clear()
    this.state = { phase: "modes" }
    const settings = ctx.document.getSettings()
    this.height = settings.textSize
    this.justify = settings.textJustify
    this.rotation = settings.textRotation
    this.reportModes(ctx)
    ctx.dynamicInput.open({ fields: [], commit: () => {} })
  }

  onNewDrawing(): void {
    this.written = []
  }

  heldVariables(): Partial<HeldVariables> {
    return {
      AFLAGS: {
        read: () =>
          Object.entries(AFLAGS_BIT).reduce(
            (flags, [mode, bit]) =>
              this.modes[mode as keyof AttributeModes] ? flags | bit : flags,
            0
          ),
        write: (flags) => {
          const on = (mode: keyof AttributeModes) =>
            (flags & AFLAGS_BIT[mode]) !== 0
          this.modes = {
            invisible: on("invisible"),
            constant: on("constant"),
            verify: on("verify"),
            preset: on("preset"),
            lockPosition: on("lockPosition"),
          }
        },
      },
    }
  }

  onDeactivate(ctx: ToolContext): void {
    this.state = { phase: "modes" }
    ctx.dynamicInput.close()
  }

  question(): PromptId | ToolQuestion {
    const state = this.state
    switch (state.phase) {
      case "modes":
        return { id: "attdefModes", enter: "attdefDone" }
      case "tag":
        return "attributeTag"
      case "prompt":
        return "attributePrompt"
      case "value":
        return this.modes.constant ? "attributeValue" : "attributeDefault"
      case "start": {
        const [plain, withKeywords] = POINT_PROMPT[this.justify]
        return state.keywords ? withKeywords : plain
      }
      case "justify":
        return "enterAnOption"
      case "style":
        return { id: "enterStyleNameOr", enter: { name: this.styleName } }
      case "height":
        return { id: "textHeight", enter: this.height }
      case "rotation":
        return {
          id: "textRotation",
          enter: { angle: normalizeDegrees((this.rotation * 180) / Math.PI) },
        }
    }
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
            ? Math.atan2(offset.y, offset.x)
            : ucsRotation(ctx.ucs)
        this.finish(this.state.position, this.state.height, rotation, ctx)
        break
      }
    }
    ctx.requestRender()
  }

  /** Enter at the modes prompt is `<done>`. */
  onEnter(ctx: ToolContext): boolean {
    if (this.state.phase !== "modes") return false
    this.enterText(ctx, "tag", "attributeTag")
    return true
  }

  commandOptions(): readonly CommandOption[] {
    const state = this.state
    switch (state.phase) {
      case "modes":
        return Object.keys(MODE_BY_KEYWORD).map((id) => ({ id }))
      case "start":
        // The justifications are answered here too, unlisted, as TEXT's are.
        return state.keywords
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
        return []
    }
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    const state = this.state
    if (state.phase === "modes") {
      const mode = MODE_BY_KEYWORD[id]
      if (!mode) return "unhandled"
      this.modes = { ...this.modes, [mode]: !this.modes[mode] }
      this.reportModes(ctx)
      return "continue"
    }
    if (
      state.phase === "justify" ||
      (state.phase === "start" && state.keywords && id in JUSTIFY_BY_KEYWORD)
    ) {
      const justify = JUSTIFY_BY_KEYWORD[id]
      if (justify === undefined) return "unhandled"
      this.justify = justify
      setCommandSettings({ textJustify: justify }, ctx)
      // The point the justification names, asked without the keywords.
      this.enterStart(ctx, false)
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
        this.enterStyle(ctx)
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
    if (this.state.phase !== "height" && this.state.phase !== "rotation") {
      return []
    }
    return [
      {
        kind: "segment",
        a: ctx.viewport.worldToScreen(this.state.position),
        b: ctx.viewport.worldToScreen(this.state.cursor),
        stroke: { color: THEME.rubberBand, width: 1 },
      },
    ]
  }

  private reportModes(ctx: ToolContext): void {
    const flag = (on: boolean) => (on ? "yes" : "no")
    ctx.report(
      ctx.text.message("attributeModes", {
        invisible: flag(this.modes.invisible),
        constant: flag(this.modes.constant),
        verify: flag(this.modes.verify),
        preset: flag(this.modes.preset),
        lockPosition: flag(this.modes.lockPosition),
      })
    )
  }

  /** One of the free-text prompts: tag, prompt, value. */
  private enterText(
    ctx: ToolContext,
    phase: "tag" | "prompt" | "value",
    prompt: PromptId
  ): void {
    this.state = { phase }
    this.openText(ctx, prompt)
  }

  /** The tag's answer ends at a space (AllowSpaces off, probe blocks/p313). */
  private openText(ctx: ToolContext, prompt: PromptId): void {
    ctx.dynamicInput.open({
      fields: [
        {
          id: "text",
          prompt,
          kind: "text",
          ...(this.state.phase === "tag" ? { endsAtSpace: true } : {}),
        },
      ],
      commit: () => {},
      commitRaw: (commitCtx) => this.commitText(commitCtx),
    })
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  private commitText(ctx: ToolContext): boolean {
    const typed = ctx.dynamicInput.getText("text")
    switch (this.state.phase) {
      case "tag": {
        // Only an empty tag is refused: a space has ended it already.
        const tag = attributeTag(typed)
        if (!tag) {
          ctx.report(ctx.text.message("tagCannotBeNull"), "error")
          this.enterText(ctx, "tag", "attributeTag")
          return true
        }
        this.tag = tag
        if (this.modes.constant) {
          this.prompt = ""
          this.enterText(ctx, "value", "attributeValue")
        } else {
          this.enterText(ctx, "prompt", "attributePrompt")
        }
        return true
      }
      case "prompt":
        this.prompt = attributeInput(typed)
        this.enterText(ctx, "value", "attributeDefault")
        return true
      case "value": {
        this.value = attributeInput(typed)
        this.writeCurrentLine(ctx, this.currentStyleName(ctx))
        this.enterStart(ctx, true)
        return true
      }
      case "style": {
        const name = typed.trim()
        if (ctx.text.resolveKeyword(name, ["?"]) === "?") {
          this.listStyles(ctx)
          return true
        }
        const before = this.styleName
        // Empty is Enter, which keeps the `<current>` style.
        if (name !== "") {
          const style = ctx.document
            .getTextStyles()
            .find((s) => s.name.toLowerCase() === name.toLowerCase())
          if (!style) {
            ctx.report(
              ctx.text.message("textStyleUndefined", { name }),
              "error"
            )
            this.enterStyle(ctx)
            return true
          }
          ctx.setCurrentTextStyle(style.id)
        }
        // TEXT's path: the Current line again, naming the style it was before
        // (p325; text/p126).
        this.writeCurrentLine(ctx, before)
        this.enterStart(ctx, true)
        return true
      }
      default:
        return false
    }
  }

  /**
   * `Current text style:  "Standard"  Text height:  2.50  Justify:  Left`,
   * TEXT's line without its Annotative (probe blocks/p03).
   */
  private writeCurrentLine(ctx: ToolContext, style: string): void {
    writeCurrentTextLine(
      "attdefTextStyle",
      style,
      this.height,
      this.justify,
      ctx
    )
  }

  /**
   * Style's `?`: the styles, then the Current line and the start point, as
   * TEXT's (p325; text/p109).
   */
  private listStyles(ctx: ToolContext): void {
    listTextStyles(this.currentStyleId(ctx), ctx)
    this.writeCurrentLine(ctx, this.currentStyleName(ctx))
    this.enterStart(ctx, true)
  }

  private currentStyleName(ctx: ToolContext): string {
    const id = this.currentStyleId(ctx)
    return ctx.document.getTextStyle(id)?.name ?? id
  }

  private enterStyle(ctx: ToolContext): void {
    this.styleName = this.currentStyleName(ctx)
    this.state = { phase: "style" }
    this.openText(ctx, "enterStyleNameOr")
  }

  private enterStart(ctx: ToolContext, keywords: boolean): void {
    this.state = { phase: "start", keywords }
    const [plain, withKeywords] = POINT_PROMPT[this.justify]
    ctx.dynamicInput.open({
      fields: [
        {
          id: "point",
          prompt: keywords ? withKeywords : plain,
          kind: "coordinate",
        },
      ],
      commit: () => {},
      commitRaw: (commitCtx) => this.commitStart(commitCtx),
    })
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  private commitStart(ctx: ToolContext): boolean {
    if (this.state.phase !== "start") return false
    const typed = ctx.dynamicInput.getText("point").trim()
    if (typed.length === 0) {
      const previous = this.definitionToContinue(ctx)
      if (!previous) {
        // As TEXT's: the console's refusal, and the prompt asked again.
        ctx.report(
          ctx.text.message(
            this.state.keywords ? "pointOrKeywordRequired" : "invalidPoint"
          ),
          "error"
        )
        return true
      }
      this.finish(
        lineBelow(previous),
        previous.height,
        previous.rotation,
        ctx,
        previous.styleId,
        previous.justify
      )
      return true
    }
    if (!isCoordinateExpression(typed)) return false
    const point = parseCoordinate(typed, {
      lastPoint: ctx.lastPoint,
      relativeByDefault: false,
      ucs: ctx.ucs,
      elevation: ctx.elevation,
    })
    if (!point) return false
    this.beginAt(point, ctx)
    return true
  }

  /** The newest definition this session wrote that is still in the drawing. */
  private definitionToContinue(
    ctx: ToolContext
  ): AttributeDefinitionEntity | null {
    for (let i = this.written.length - 1; i >= 0; i--) {
      const entity = ctx.document.get(this.written[i])
      if (entity?.type === "attdef") return entity
    }
    return null
  }

  private currentStyleId(ctx: ToolContext): TextStyleId {
    return ctx.document.getCurrentTextStyleId()
  }

  /** The height prompt is skipped when the style fixes one, as TEXT's is. */
  private beginAt(position: Vec3, ctx: ToolContext): void {
    const fixed = fixedTextHeight(ctx)
    if (fixed !== null) {
      this.enterRotation(position, fixed, ctx)
      return
    }
    this.state = { phase: "height", position, cursor: position }
    ctx.dynamicInput.open({
      fields: [{ id: "height", prompt: "textHeight", kind: "distance" }],
      commit: (values, commitCtx) => {
        if (this.state.phase !== "height" || !(values.height > 0)) return
        this.enterRotation(this.state.position, values.height, commitCtx)
      },
    })
    ctx.dynamicInput.setDefault("height", this.height)
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  private enterRotation(
    position: Vec3,
    height: number,
    ctx: ToolContext
  ): void {
    this.state = { phase: "rotation", position, height, cursor: position }
    ctx.dynamicInput.open({
      fields: [{ id: "rotation", prompt: "textRotation", kind: "angle" }],
      commit: (values, commitCtx) => {
        if (this.state.phase !== "rotation") return
        this.finish(
          this.state.position,
          this.state.height,
          ucsAngleToWorld(commitCtx.ucs, (values.rotation * Math.PI) / 180),
          commitCtx
        )
      },
    })
    ctx.dynamicInput.setDefault(
      "rotation",
      normalizeDegrees((this.rotation * 180) / Math.PI)
    )
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  /**
   * `rotation` is the object's own, in the WCS; the next prompt, TEXT's too,
   * offers it from the UCS X axis. Aligned below the previous one, its style
   * and justification go on. TEXTSIZE and the rotation are set with the
   * definition, as TEXT sets them with its first line (text/p163).
   */
  private finish(
    position: Vec3,
    height: number,
    rotation: number,
    ctx: ToolContext,
    styleId = this.currentStyleId(ctx),
    justify = this.justify
  ): void {
    this.height = height
    this.rotation = normalizeAngle(worldAngleToUcs(ctx.ucs, rotation))
    const definition = withCurrentProperties(
      onPlaneOf(
        createAttributeDefinition(position, this.tag, {
          prompt: this.prompt,
          value: this.value,
          modes: this.modes,
          height,
          rotation,
          justify,
          styleId,
          layerId: ctx.document.getCurrentLayerId(),
        }),
        position
      ),
      ctx
    )
    this.written.push(definition.id)
    setCommandSettings({ textSize: height, textRotation: this.rotation }, ctx)
    ctx.execute(new AddEntityCommand(definition))
    ctx.endCommand()
  }
}

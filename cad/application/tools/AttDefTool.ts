import { Vec2, V } from "../../geometry/Vec2"
import { Vec3 } from "../../geometry/Vec3"
import { normalizeDegrees } from "../../geometry/primitives"
import {
  AttributeDefinitionEntity,
  AttributeModes,
  DEFAULT_ATTRIBUTE_MODES,
  TextJustify,
  attributeInput,
  attributeTag,
  createAttributeDefinition,
  onPlaneOf,
} from "../../domain/entities"
import { DEFAULT_TEXT_HEIGHT, TextStyleId } from "../../domain/textStyles"
import { ucsAngleToWorld, ucsRotation, worldAngleToUcs } from "../../domain/ucs"
import { AddEntityCommand } from "../commands/entityCommands"
import type { PromptId } from "../../locales/types"
import {
  isCoordinateExpression,
  parseCoordinate,
} from "../input/coordinateInput"
import { ScenePrimitive } from "../../scene/types"
import { THEME } from "../../scene/theme"
import { JUSTIFY_BY_KEYWORD, JUSTIFY_KEYWORDS, lineBelow } from "./TextTool"
import {
  CommandOption,
  CommandOptionOutcome,
  PointerInput,
  Tool,
  ToolContext,
} from "./Tool"
import { withCurrentProperties } from "./currentProperties"

/** The modes a keyword toggles, keyed by AutoCAD's global keyword. */
const MODE_BY_KEYWORD: Readonly<Record<string, keyof AttributeModes>> = {
  Invisible: "invisible",
  Constant: "constant",
  Verify: "verify",
  Preset: "preset",
  "Lock position": "lockPosition",
}

type AttDefState =
  | { readonly phase: "modes" }
  | { readonly phase: "tag" }
  | { readonly phase: "prompt" }
  | { readonly phase: "value" }
  | { readonly phase: "start" }
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
 * the same things in -ATTDEF's order — the modes, the tag, the prompt, the
 * default (or, for a constant attribute, the value), and then "the same prompts
 * as the TEXT command, using the attribute tag instead of requesting a text
 * string".
 *
 * Enter at the start point places the definition one line below the previous
 * one, which is how -ATTDEF stacks a block's attributes and what the dialog
 * calls "Align below previous attribute definition".
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
  private height = DEFAULT_TEXT_HEIGHT
  private rotation = 0
  private justify: TextJustify = "left"
  private styleId: TextStyleId | null = null
  private previous: AttributeDefinitionEntity | null = null
  private lastScreen: Vec2 | null = null

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    ctx.selection.clear()
    this.state = { phase: "modes" }
    this.reportModes(ctx)
    ctx.dynamicInput.open({ fields: [], commit: () => {} })
  }

  onDeactivate(ctx: ToolContext): void {
    this.state = { phase: "modes" }
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
    switch (this.state.phase) {
      case "modes":
        return Object.keys(MODE_BY_KEYWORD).map((id) => ({ id }))
      case "start":
        return [{ id: "Justify" }, { id: "Style" }]
      default:
        return []
    }
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    if (this.state.phase === "modes") {
      const mode = MODE_BY_KEYWORD[id]
      if (!mode) return "unhandled"
      this.modes = { ...this.modes, [mode]: !this.modes[mode] }
      this.reportModes(ctx)
      return "continue"
    }
    if (this.state.phase !== "start") return "unhandled"
    switch (id) {
      case "Justify":
        this.state = { phase: "justify" }
        ctx.report(
          ctx.text.message("textJustifyOptions", {
            keywords: ctx.text.keywordList(JUSTIFY_KEYWORDS),
          })
        )
        this.openText(ctx, "justify")
        return "continue"
      case "Style":
        this.state = { phase: "style" }
        this.openText(ctx, "styleName")
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

  /** One of the free-text prompts: tag, prompt, value, justification, style. */
  private enterText(
    ctx: ToolContext,
    phase: "tag" | "prompt" | "value",
    prompt: PromptId
  ): void {
    this.state = { phase }
    this.openText(ctx, prompt)
  }

  private openText(ctx: ToolContext, prompt: PromptId): void {
    ctx.dynamicInput.open({
      fields: [{ id: "text", prompt, kind: "text" }],
      commit: () => {},
      commitRaw: (commitCtx) => this.commitText(commitCtx),
    })
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  private commitText(ctx: ToolContext): boolean {
    const typed = ctx.dynamicInput.getText("text")
    switch (this.state.phase) {
      case "tag": {
        const tag = attributeTag(typed)
        if (!tag) {
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
      case "value":
        this.value = attributeInput(typed)
        this.enterStart(ctx)
        return true
      case "justify": {
        const keyword = ctx.text.resolveKeyword(typed.trim(), JUSTIFY_KEYWORDS)
        if (!keyword) return false
        this.justify = JUSTIFY_BY_KEYWORD[keyword]
        this.enterStart(ctx)
        return true
      }
      case "style": {
        const name = typed.trim()
        const style = ctx.document
          .getTextStyles()
          .find((s) => s.name.toLowerCase() === name.toLowerCase())
        if (!style) {
          ctx.report(ctx.text.message("textStyleUndefined", { name }), "error")
          return false
        }
        this.styleId = style.id
        this.enterStart(ctx)
        return true
      }
      default:
        return false
    }
  }

  private enterStart(ctx: ToolContext): void {
    this.state = { phase: "start" }
    ctx.dynamicInput.open({
      fields: [{ id: "point", prompt: "textStartPoint", kind: "coordinate" }],
      commit: () => {},
      commitRaw: (commitCtx) => this.commitStart(commitCtx),
    })
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  private commitStart(ctx: ToolContext): boolean {
    const typed = ctx.dynamicInput.getText("point").trim()
    if (typed.length === 0) {
      const previous = this.previous
      if (!previous) return true
      this.justify = previous.justify
      this.styleId = previous.styleId
      this.finish(lineBelow(previous), previous.height, previous.rotation, ctx)
      return true
    }
    if (!isCoordinateExpression(typed)) return false
    const point = parseCoordinate(typed, {
      lastPoint: null,
      relativeByDefault: false,
      ucs: ctx.ucs,
      elevation: ctx.elevation,
    })
    if (!point) return false
    this.beginAt(point, ctx)
    return true
  }

  private currentStyleId(ctx: ToolContext): TextStyleId {
    return this.styleId ?? ctx.document.getCurrentTextStyleId()
  }

  /** The height prompt is skipped when the style fixes one, as TEXT's is. */
  private beginAt(position: Vec3, ctx: ToolContext): void {
    const style = ctx.document.getTextStyle(this.currentStyleId(ctx))
    if (style && style.height > 0) {
      this.enterRotation(position, style.height, ctx)
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
    ctx.dynamicInput.setLive("height", this.height)
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  private enterRotation(
    position: Vec3,
    height: number,
    ctx: ToolContext
  ): void {
    this.height = height
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
    ctx.dynamicInput.setLive(
      "rotation",
      normalizeDegrees((this.rotation * 180) / Math.PI)
    )
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  /** `rotation` is the object's own, in the WCS; the next prompt offers it from the UCS X axis. */
  private finish(
    position: Vec3,
    height: number,
    rotation: number,
    ctx: ToolContext
  ): void {
    this.rotation = worldAngleToUcs(ctx.ucs, rotation)
    const definition = withCurrentProperties(
      onPlaneOf(
        createAttributeDefinition(position, this.tag, {
          prompt: this.prompt,
          value: this.value,
          modes: this.modes,
          height,
          rotation,
          justify: this.justify,
          styleId: this.currentStyleId(ctx),
          layerId: ctx.document.getCurrentLayerId(),
        }),
        position
      ),
      ctx
    )
    this.previous = definition
    ctx.execute(new AddEntityCommand(definition))
    ctx.endCommand()
  }
}

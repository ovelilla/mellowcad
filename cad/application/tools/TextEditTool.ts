import { Vec2 } from "../../geometry/Vec2"
import {
  AttributeDefinitionEntity,
  Entity,
  EntityId,
  MTextEntity,
  TextEntity,
  attributeTag,
  closestOnEntity,
  mtextContents,
  mtextPlainText,
} from "../../domain/entities"
import { UpdateEntityCommand } from "../commands/entityCommands"
import { DynamicInputSession } from "../input/DynamicInput"
import { entityScenePrimitive } from "../SceneBuilder"
import { ScenePrimitive } from "../../scene/types"
import { THEME } from "../../scene/theme"
import type { PromptId } from "../../locales/types"
import {
  CommandOption,
  CommandOptionOutcome,
  KeyInput,
  PointerInput,
  QuestionInput,
  Tool,
  ToolContext,
} from "./Tool"

/**
 * AutoCAD's TEXTEDIT: retype what an existing annotation says.
 *
 * Pick a text object and its content opens for editing in place — the object
 * itself is hidden while the edit runs, so what you see on the drawing is the
 * new wording, not the old one behind it. The command repeats until Escape or
 * Enter, which is AutoCAD's default (TEXTEDITMODE 0); the Mode keyword asks
 * which of that and editing a single object and ending.
 *
 * Double-clicking a text object starts this command on it, the gesture users
 * actually reach for.
 *
 * A multiline text opens in the multi-line editor MTEXT uses, where Escape
 * discards the edit and a click inside the object stays in the editor.
 *
 * An attribute definition that is not yet in a block opens AutoCAD's Edit
 * Attribute Definition dialog instead — its Tag, Prompt and Default, one field
 * each — where Escape is Cancel.
 */
export class TextEditTool implements Tool {
  readonly id = "textedit"

  private state: TextEditToolState = { phase: "select", hover: null }
  /** AutoCAD's TEXTEDITMODE: repeat until cancelled, or edit one and stop. */
  private multiple = true
  /** Edits made in this run, so Undo only ever backs out our own commands. */
  private edits = 0

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    ctx.selection.clear()
    this.edits = 0
    this.reportMode(ctx)
    this.enterSelect(ctx)
  }

  /**
   * AutoCAD 2023's prompts. WHY the editor names none: AutoCAD edits in place,
   * with no question at the command line.
   */
  question(): PromptId | null {
    switch (this.state.phase) {
      case "select":
        return "selectAnnotationObjectOr"
      case "mode":
        return "textEditModeOption"
      case "edit":
        return null
    }
  }

  /** As AutoCAD 2023's console refuses its pick. */
  takes(): QuestionInput | null {
    return this.state.phase === "select" ? "objectOrLast" : null
  }

  defaultOption(): string | null {
    if (this.state.phase !== "mode") return null
    return this.multiple ? "Multiple" : "Single"
  }

  /** Enter at Mode keeps the mode; at the pick it ends, as AutoCAD's does. */
  onEnter(ctx: ToolContext): boolean {
    if (this.state.phase !== "mode") return false
    this.enterSelect(ctx)
    return true
  }

  onDeactivate(ctx: ToolContext): void {
    // Like every other in-place edit here, leaving keeps what was typed.
    this.commitEdit(ctx)
    this.state = { phase: "select", hover: null }
    ctx.dynamicInput.close()
  }

  /** Starts editing `text` straight away — the double-click entry point. */
  beginEdit(text: EditableText, ctx: ToolContext): void {
    this.commitEdit(ctx)
    this.state = { phase: "edit", target: text }
    this.openEditInput(ctx, text)
  }

  onKeyDown(input: KeyInput): void {
    if (
      input.key === "Escape" &&
      this.state.phase === "edit" &&
      this.state.target.type !== "text"
    ) {
      this.state = { phase: "select", hover: null }
    }
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    ctx.dynamicInput.setPosition(input.screen)
    if (this.state.phase !== "select") return
    const hover = this.pickText(input.world, ctx)
    if (hover?.id !== this.state.hover?.id) {
      this.state = { phase: "select", hover }
    }
    ctx.requestRender()
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0) return
    if (this.state.phase === "select") {
      const target = this.pickText(input.world, ctx)
      if (target) this.beginEdit(target, ctx)
      return
    }
    if (this.state.phase !== "edit") return
    const target = this.state.target
    const preview = this.preview(target, ctx)
    if (
      target.type === "mtext" &&
      preview &&
      closestOnEntity(preview, input.world).distance === 0
    ) {
      return
    }
    // A click elsewhere accepts the edit and moves on to the next object.
    this.commitEdit(ctx)
    const next = this.pickText(input.world, ctx)
    if (next) this.beginEdit(next, ctx)
    else this.enterSelect(ctx)
    ctx.requestRender()
  }

  /** The object being edited is drawn by the overlay, not by the scene. */
  hiddenEntityIds(): readonly EntityId[] {
    return this.state.phase === "edit" ? [this.state.target.id] : []
  }

  commandOptions(): readonly CommandOption[] {
    switch (this.state.phase) {
      case "select":
        return [
          ...(this.multiple ? [{ id: "Undo" }] : []),
          { id: "Mode" },
          { id: "Last", hidden: true, prompt: "selectObjects" },
        ]
      case "mode":
        return [{ id: "Single" }, { id: "Multiple" }]
      case "edit":
        return []
    }
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    if (this.state.phase === "mode") {
      if (id !== "Single" && id !== "Multiple") return "unhandled"
      this.multiple = id === "Multiple"
      this.reportMode(ctx)
      this.enterSelect(ctx)
      return "continue"
    }
    if (this.state.phase !== "select") return "unhandled"
    switch (id) {
      case "Undo":
        if (!this.multiple) return "unhandled"
        // With nothing of its own to take back it says so, as AutoCAD's does.
        if (this.edits === 0) {
          ctx.report(ctx.text.message("commandCompletelyUndone"))
          return "continue"
        }
        this.edits -= 1
        ctx.undo()
        return "continue"
      case "Mode":
        this.state = { phase: "mode" }
        ctx.dynamicInput.open({ fields: [], commit: () => {} })
        return "continue"
      case "Last": {
        const last = ctx.document
          .getEntities()
          .findLast((entity) => ctx.document.isEntityVisible(entity))
        if (last && isEditable(last)) this.beginEdit(last, ctx)
        return "continue"
      }
      default:
        return "unhandled"
    }
  }

  private reportMode(ctx: ToolContext): void {
    ctx.report(
      ctx.text.message("textEditSettings", {
        mode: this.multiple ? "multiple" : "single",
      })
    )
  }

  wantsSnap(): boolean {
    return false // picking an object, not a point
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    const { viewport } = ctx
    if (this.state.phase === "select") {
      return this.state.hover
        ? entityScenePrimitive(viewport, this.state.hover, {
            color: THEME.selected,
            width: 2,
          })
        : []
    }
    if (this.state.phase !== "edit") return []
    const preview = this.preview(this.state.target, ctx)
    if (!preview) return []
    return entityScenePrimitive(viewport, preview, {
      color: THEME.rubberBand,
      width: 1,
    })
  }

  /** The object as it reads with what is in the box; null when the box is empty. */
  private preview(target: EditableText, ctx: ToolContext): EditableText | null {
    if (target.type === "attdef") {
      const tag = attributeTag(ctx.dynamicInput.getText("tag"))
      return { ...target, tag: tag ?? target.tag, id: TEXT_EDIT_PREVIEW_ID }
    }
    const value = ctx.dynamicInput.getText("value")
    if (value.length === 0) return null
    return target.type === "mtext"
      ? { ...target, contents: mtextContents(value), id: TEXT_EDIT_PREVIEW_ID }
      : { ...target, value, id: TEXT_EDIT_PREVIEW_ID }
  }

  private enterSelect(ctx: ToolContext): void {
    this.state = { phase: "select", hover: null }
    // A keyword-only prompt: no field to focus, so U and M reach the tool.
    ctx.dynamicInput.open({ fields: [], commit: () => {} })
  }

  private pickText(world: Vec2, ctx: ToolContext): EditableText | null {
    const hit: Entity | null = ctx.pick(world)
    return hit && isEditable(hit) ? hit : null
  }

  private openEditInput(ctx: ToolContext, target: EditableText): void {
    const commitRaw = (commitCtx: ToolContext) => {
      this.commitEdit(commitCtx)
      if (this.multiple) this.enterSelect(commitCtx)
      else commitCtx.endCommand()
      return true
    }
    if (target.type === "attdef") {
      ctx.dynamicInput.open({
        fields: [
          { id: "tag", prompt: "definitionTag", kind: "text" },
          { id: "prompt", prompt: "definitionPrompt", kind: "text" },
          { id: "default", prompt: "definitionDefault", kind: "text" },
        ],
        commit: () => {},
        commitRaw,
      })
      ctx.dynamicInput.setText("tag", target.tag)
      ctx.dynamicInput.setText("prompt", target.prompt)
      ctx.dynamicInput.setText("default", target.value)
      return
    }
    const session: DynamicInputSession = {
      fields: [
        {
          id: "value",
          prompt: "text",
          kind: target.type === "mtext" ? "paragraphs" : "text",
        },
      ],
      commit: () => {},
      commitRaw,
    }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setText(
      "value",
      target.type === "mtext" ? mtextPlainText(target.contents) : target.value
    )
  }

  /** Writes the edit back, if the wording actually changed. */
  private commitEdit(ctx: ToolContext): void {
    if (this.state.phase !== "edit") return
    const target = this.state.target
    if (target.type === "attdef") {
      const next: AttributeDefinitionEntity = {
        ...target,
        // A tag that could not be one keeps the old tag, as the dialog does.
        tag: attributeTag(ctx.dynamicInput.getText("tag")) ?? target.tag,
        prompt: ctx.dynamicInput.getText("prompt"),
        value: ctx.dynamicInput.getText("default"),
      }
      this.state = { phase: "select", hover: null }
      if (
        next.tag === target.tag &&
        next.prompt === target.prompt &&
        next.value === target.value
      ) {
        return
      }
      this.edits += 1
      ctx.execute(new UpdateEntityCommand(next))
      return
    }
    const value = ctx.dynamicInput.getText("value")
    this.state = { phase: "select", hover: null }
    // Emptying the box is treated as "no change": erasing an object is what
    // ERASE is for, and the wording AutoCAD uses here could not be verified.
    if (value.trim().length === 0) return
    if (target.type === "mtext") {
      // Unchanged wording keeps the contents as they were, formatting included.
      if (value === mtextPlainText(target.contents)) return
      this.edits += 1
      ctx.execute(
        new UpdateEntityCommand({ ...target, contents: mtextContents(value) })
      )
      return
    }
    if (value === target.value) return
    this.edits += 1
    ctx.execute(new UpdateEntityCommand({ ...target, value }))
  }
}

/** Preview frames reuse one id so drawing them never burns entity ids. */
const TEXT_EDIT_PREVIEW_ID = "__textedit_preview__"

type EditableText = TextEntity | MTextEntity | AttributeDefinitionEntity

function isEditable(entity: Entity): entity is EditableText {
  return (
    entity.type === "text" ||
    entity.type === "mtext" ||
    entity.type === "attdef"
  )
}

type TextEditToolState =
  /** Awaiting an annotation object to edit. */
  | { readonly phase: "select"; readonly hover: EditableText | null }
  /** Mode's own question, which of TEXTEDITMODE's two. */
  | { readonly phase: "mode" }
  | { readonly phase: "edit"; readonly target: EditableText }

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
  mtextLayout,
  mtextPlainText,
  mtextToWorld,
} from "../../domain/entities"
import { UpdateEntityCommand } from "../commands/entityCommands"
import { SessionSettingCommand } from "../commands/settingsCommands"
import { DynamicInputSession } from "../input/DynamicInput"
import { entityScenePrimitive } from "../SceneBuilder"
import { ScenePrimitive } from "../../scene/types"
import { THEME } from "../../scene/theme"
import type { PromptId } from "../../locales/types"
import { parseNumber } from "../../domain/units"
import type { ContextualEdit } from "../EngineState"
import {
  CommandOption,
  CommandOptionOutcome,
  ContextualTabSource,
  type HeldVariables,
  KeyInput,
  PointerInput,
  QuestionInput,
  Tool,
  ToolContext,
} from "./Tool"
import { lastObject } from "./objectSelection"
import { lockedObjectAt } from "./lockedPick"
import { typedPick } from "./typedPick"

/**
 * AutoCAD's TEXTEDIT: retype what an existing annotation says.
 *
 * Pick a text object and its content opens for editing in place — the object
 * itself is hidden while the edit runs, so what you see on the drawing is the
 * new wording, not the old one behind it. The command repeats until Escape or
 * Enter, which is AutoCAD's default (TEXTEDITMODE 0); the Mode keyword asks
 * which of that and editing a single object and ending. One annotation object
 * selected before it opens at once (text/p159).
 *
 * Double-clicking a text object starts this command on it, the gesture users
 * actually reach for; on a multiline text it stands in for MTEDIT
 * ({@link startOn}).
 *
 * Escape in a single-line text's editor drops that edit and asks for the next
 * object (desktop text/d06-6). A multiline text opens in the multi-line
 * editor MTEXT uses, where Escape discards the edit, asking first when the
 * wording changed (desktop text/d05-5), and a click inside the object stays
 * in the editor.
 *
 * An attribute definition that is not yet in a block opens AutoCAD's Edit
 * Attribute Definition dialog instead — its Tag, Prompt and Default, one field
 * each — where Escape is Cancel.
 */
export class TextEditTool implements Tool {
  readonly id = "textedit"

  private state: TextEditToolState = { phase: "select", hover: null }
  /**
   * AutoCAD's TEXTEDITMODE: repeat until cancelled, or edit one and stop. A
   * profile's setting (text/p246), so NEW and OPEN keep it; Mode sets it
   * through a {@link SessionSettingCommand}, which U takes back (text/p249).
   */
  private multiple = true
  /**
   * Where the history stood before each edit of this run still standing, so
   * Undo backs out our own commands only.
   */
  private marks: number[] = []
  /** The object a double-click starts the run on, and whether as MTEDIT. */
  private starting: { target: EditableText; mtedit: boolean } | null = null
  /** This run is MTEDIT's: one object, no settings line, ended with the editor. */
  private mtedit = false

  heldVariables(): Partial<HeldVariables> {
    return {
      TEXTEDITMODE: {
        read: () => (this.multiple ? 0 : 1),
        write: (value) => {
          this.multiple = value === 0
        },
      },
    }
  }

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    const starting = this.starting
    this.starting = null
    const preselected = starting ? null : this.preselected(ctx)
    ctx.selection.clear()
    this.marks = []
    this.mtedit = starting?.mtedit ?? false
    if (!this.mtedit) this.reportMode(ctx)
    this.enterSelect(ctx)
    if (starting) this.beginEdit(starting.target, ctx)
    else if (preselected) this.open(preselected, ctx)
  }

  /**
   * The run a double-click starts opens `text` at once; as MTEDIT, which
   * the double-click on a multiline text runs (DoubleClickRoot.cui), it
   * writes no settings line and ends when the editor closes (desktop
   * text/d06). Called before the tool is activated.
   */
  startOn(text: EditableText, mtedit: boolean): void {
    this.starting = { target: text, mtedit }
  }

  /**
   * The one annotation object selected before the command; a set holding
   * anything else is dropped and the prompt asked (text/p159, p146).
   */
  private preselected(ctx: ToolContext): EditableText | null {
    const ids = ctx.selection.toArray()
    if (ids.length !== 1) return null
    const entity = ctx.document.get(ids[0])
    return entity && isEditable(entity) ? entity : null
  }

  /**
   * AutoCAD 2027's prompts. WHY the editor names none: AutoCAD edits in place,
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

  /**
   * TEXTEDIT's own refusal, which lists Undo in Multiple mode and Mode, with
   * a stray `]:`, in Single (text/p241, p274).
   */
  takes(): QuestionInput | null {
    if (this.state.phase !== "select") return null
    return {
      refusal: ["invalidSelection", "textEditExpectsPoint"],
      values: { mode: this.multiple ? "multiple" : "single" },
      keywords: { ids: [this.multiple ? "Undo" : "Mode"] },
    }
  }

  /** A point typed at the pick is a pick there; one finding no text asks again in silence (text/p243). */
  answerTyped(text: string, ctx: ToolContext): boolean {
    if (this.state.phase !== "select") return false
    const point = typedPick(text, ctx)
    if (point === null) return false
    this.pickAt(point, ctx.viewport.worldToScreen(point), ctx)
    return true
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

  /** Starts editing `text` straight away. */
  beginEdit(text: EditableText, ctx: ToolContext): void {
    this.commitEdit(ctx)
    this.state = { phase: "edit", target: text }
    this.openEditInput(ctx, text)
  }

  /**
   * Escape in a single-line text's editor discards that edit and asks for the
   * next object; a second Escape ends the command (desktop text/d06-5, d06-6).
   */
  onEscape(ctx: ToolContext): boolean {
    if (this.state.phase !== "edit" || this.state.target.type !== "text") {
      return false
    }
    this.enterSelect(ctx)
    return true
  }

  /**
   * The MTEXT editor's Escape discards; the attribute definition's dialog's
   * is Cancel.
   */
  onKeyDown(input: KeyInput): void {
    if (input.key === "Escape" && this.state.phase === "edit") {
      this.state = { phase: "select", hover: null }
    }
  }

  /**
   * An MTEXT's wording changed in its editor: Escape asks before discarding
   * it, as MTEXT's own editor does (desktop text/d05-5).
   */
  hasUnsavedText(ctx: ToolContext): boolean {
    if (this.state.phase !== "edit") return false
    const target = this.state.target
    return target.type === "mtext" && this.mtextEdited(target, ctx) !== null
  }

  /**
   * Text Editor (AcTextEditorInProgress) while a multiline text is open in
   * the editor, showing its style, height and Justification.
   */
  contextualTab(): ContextualTabSource | null {
    if (this.state.phase !== "edit") return null
    const target = this.state.target
    if (target.type !== "mtext") return null
    return {
      id: "textEditor",
      fields: [{ id: "textHeight", value: target.height, kind: "distance" }],
      textStyle: target.styleId,
      attachment: target.attachment,
    }
  }

  /**
   * Text Editor's controls on the multiline text being edited, written with
   * its wording as the editor closes: a style (its fixed height, or the
   * object's own without one), a height, a Justification, or Close Text
   * Editor, which keeps the edit as Ctrl+Enter does.
   */
  editContextual(edit: ContextualEdit, ctx: ToolContext): CommandOptionOutcome {
    if (this.state.phase !== "edit") return "unhandled"
    const target = this.state.target
    if (target.type !== "mtext") return "unhandled"
    if ("close" in edit) {
      this.commitEdit(ctx)
      if (this.endsAfterEdit()) return "end"
      this.enterSelect(ctx)
      return "continue"
    }
    let next: MTextEntity | null = null
    if ("field" in edit && edit.field === "textHeight") {
      const height = parseNumber(edit.text)
      if (height === null || !(height > 0)) {
        ctx.report(ctx.text.message("positiveNonzero"), "error")
        return "continue"
      }
      next = { ...target, height }
    } else if ("textStyle" in edit) {
      const style = ctx.document.getTextStyle(edit.textStyle)
      if (!style) return "unhandled"
      const own = ctx.document.get(target.id)
      const base = own?.type === "mtext" ? own.height : target.height
      next = {
        ...target,
        styleId: style.id,
        height: style.height > 0 ? style.height : base,
      }
    } else if ("attachment" in edit) {
      next = reattached(target, ctx.dynamicInput.getText("value"), edit)
    }
    if (!next) return "unhandled"
    this.state = { phase: "edit", target: next }
    return "continue"
  }

  editorHoldsText(ctx: ToolContext): boolean {
    return (
      this.state.phase === "edit" &&
      this.state.target.type === "mtext" &&
      ctx.dynamicInput.getText("value") !== ""
    )
  }

  /**
   * The multiline text as the editor leaves it, or null when neither its
   * wording nor what Text Editor sets changed: unchanged wording keeps the
   * contents as they were, formatting included.
   */
  private mtextEdited(
    target: MTextEntity,
    ctx: ToolContext
  ): MTextEntity | null {
    const own = ctx.document.get(target.id)
    const before = own?.type === "mtext" ? own : target
    const value = ctx.dynamicInput.getText("value")
    const reworded = value !== mtextPlainText(before.contents)
    if (
      !reworded &&
      target.styleId === before.styleId &&
      target.height === before.height &&
      target.attachment === before.attachment
    ) {
      return null
    }
    return reworded ? { ...target, contents: mtextContents(value) } : target
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
      this.pickAt(input.world, input.screen, ctx)
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
    if (this.endsAfterEdit()) {
      ctx.endCommand()
      return
    }
    this.enterSelect(ctx)
    this.pickAt(input.world, input.screen, ctx)
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
      const multiple = id === "Multiple"
      if (multiple !== this.multiple) {
        ctx.execute(
          new SessionSettingCommand(
            (value: boolean) => {
              this.multiple = value
            },
            this.multiple,
            multiple
          )
        )
      }
      this.reportMode(ctx)
      this.enterSelect(ctx)
      return "continue"
    }
    if (this.state.phase !== "select") return "unhandled"
    switch (id) {
      case "Undo": {
        if (!this.multiple) return "unhandled"
        // With nothing of its own left to take back it says so, as AutoCAD's
        // does, also as it takes back the last (text/p241, p285).
        const mark = this.marks.pop()
        if (mark !== undefined) ctx.undoTo(mark)
        if (this.marks.length === 0) {
          ctx.report(ctx.text.message("commandCompletelyUndone"))
        }
        return "continue"
      }
      case "Mode":
        this.state = { phase: "mode" }
        ctx.dynamicInput.open({ fields: [], commit: () => {} })
        return "continue"
      case "Last": {
        const last = lastObject(ctx)
        if (last) this.open(last, ctx)
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

  /**
   * The pick at `world`, clicked or typed: an object on a locked layer is
   * refused in words (text/p244, TEXT-D31), anything but an annotation
   * object in silence (p243).
   */
  private pickAt(world: Vec2, screen: Vec2, ctx: ToolContext): void {
    const hit = ctx.pick(world)
    if (lockedObjectAt(screen, ctx, hit)) {
      ctx.report(ctx.text.message("objectOnLockedLayer"), "error")
      return
    }
    if (hit && isEditable(hit)) this.beginEdit(hit, ctx)
  }

  /** Opens `entity` if it is an annotation object one may edit (text/p244). */
  private open(entity: Entity, ctx: ToolContext): void {
    if (!ctx.document.isEntityEditable(entity)) {
      ctx.report(ctx.text.message("objectOnLockedLayer"), "error")
    } else if (isEditable(entity)) {
      this.beginEdit(entity, ctx)
    }
  }

  private endsAfterEdit(): boolean {
    return this.mtedit || !this.multiple
  }

  private openEditInput(ctx: ToolContext, target: EditableText): void {
    const commitRaw = (commitCtx: ToolContext) => {
      this.commitEdit(commitCtx)
      if (this.endsAfterEdit()) commitCtx.endCommand()
      else this.enterSelect(commitCtx)
      return true
    }
    if (target.type === "attdef") {
      ctx.dynamicInput.open({
        fields: [
          { id: "tag", prompt: "definitionTag", kind: "text" },
          {
            id: "prompt",
            prompt: "definitionPrompt",
            kind: "text",
            freeText: true,
          },
          {
            id: "default",
            prompt: "definitionDefault",
            kind: "text",
            freeText: true,
          },
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
      this.marks.push(ctx.historyDepth())
      ctx.execute(new UpdateEntityCommand(next))
      return
    }
    const value = ctx.dynamicInput.getText("value")
    this.state = { phase: "select", hover: null }
    // Emptying the box is treated as "no change": erasing an object is what
    // ERASE is for, and the wording AutoCAD uses here could not be verified.
    if (value.trim().length === 0) return
    if (target.type === "mtext") {
      const edited = this.mtextEdited(target, ctx)
      if (!edited) return
      this.marks.push(ctx.historyDepth())
      ctx.execute(new UpdateEntityCommand(edited))
      return
    }
    if (value === target.value) return
    this.marks.push(ctx.historyDepth())
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

/**
 * The text kept where it stands, its insertion point moved to the new
 * attachment of its frame (the defined width, or the widest line past it, by
 * the height of what the editor holds): desktop 2026-11-27, TEXTEDIT's Middle Center to Bottom Center down
 * half the line's height, then to Bottom Left half the width to the left.
 */
function reattached(
  target: MTextEntity,
  value: string,
  { attachment }: { attachment: MTextEntity["attachment"] }
): MTextEntity {
  const { x0, x1, y0, y1 } = mtextLayout({
    ...target,
    contents: mtextContents(value),
  })
  const column = attachment[1]
  const row = attachment[0]
  const x = column === "l" ? x0 : column === "r" ? x1 : (x0 + x1) / 2
  const y = row === "t" ? y1 : row === "b" ? y0 : (y0 + y1) / 2
  return { ...target, attachment, position: mtextToWorld(target, x, y) }
}

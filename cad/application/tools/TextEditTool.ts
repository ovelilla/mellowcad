import { Vec2 } from "../../geometry/Vec2"
import { Entity, EntityId, TextEntity } from "../../domain/entities"
import { UpdateEntityCommand } from "../commands/entityCommands"
import { DynamicInputSession } from "../input/DynamicInput"
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
 * AutoCAD's TEXTEDIT: retype what an existing annotation says.
 *
 * Pick a text object and its content opens for editing in place — the object
 * itself is hidden while the edit runs, so what you see on the drawing is the
 * new wording, not the old one behind it. The command repeats until Escape or
 * Enter, which is AutoCAD's default (TEXTEDITMODE 0); the Mode keyword switches
 * to editing a single object and ending.
 *
 * Double-clicking a text object starts this command on it, the gesture users
 * actually reach for.
 */
export class TextEditTool implements Tool {
  readonly id = "textedit"
  readonly label = "Edit text"

  private state: TextEditToolState = { phase: "select", hover: null }
  /** AutoCAD's TEXTEDITMODE: repeat until cancelled, or edit one and stop. */
  private multiple = true
  /** Edits made in this run, so Undo only ever backs out our own commands. */
  private edits = 0

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    ctx.selection.clear()
    this.edits = 0
    this.enterSelect(ctx)
  }

  onDeactivate(ctx: ToolContext): void {
    // Like every other in-place edit here, leaving keeps what was typed.
    this.commitEdit(ctx)
    this.state = { phase: "select", hover: null }
    ctx.dynamicInput.close()
  }

  /** Starts editing `text` straight away — the double-click entry point. */
  beginEdit(text: TextEntity, ctx: ToolContext): void {
    this.commitEdit(ctx)
    this.state = { phase: "edit", target: text }
    this.openEditInput(ctx, text.value)
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
    if (this.state.phase !== "select") return []
    const options: CommandOption[] = []
    if (this.edits > 0) options.push({ key: "U", label: "Undo" })
    options.push({
      key: "M",
      label: `Mode: ${this.multiple ? "Multiple" : "Single"}`,
    })
    return options
  }

  invokeOption(key: string, ctx: ToolContext): CommandOptionOutcome {
    if (this.state.phase !== "select") return "unhandled"
    switch (key.toLowerCase()) {
      case "u":
        if (this.edits === 0) return "unhandled"
        this.edits -= 1
        ctx.undo()
        return "continue"
      case "m":
        this.multiple = !this.multiple
        return "continue"
      default:
        return "unhandled"
    }
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
    const value = ctx.dynamicInput.getText("value")
    if (value.length === 0) return []
    return entityScenePrimitive(
      viewport,
      { ...this.state.target, value, id: TEXT_EDIT_PREVIEW_ID },
      { color: THEME.rubberBand, width: 1 }
    )
  }

  private enterSelect(ctx: ToolContext): void {
    this.state = { phase: "select", hover: null }
    // A keyword-only prompt: no field to focus, so U and M reach the tool.
    ctx.dynamicInput.open({ fields: [], commit: () => {} })
  }

  private pickText(world: Vec2, ctx: ToolContext): TextEntity | null {
    const hit: Entity | null = ctx.pick(world)
    return hit?.type === "text" ? hit : null
  }

  private openEditInput(ctx: ToolContext, value: string): void {
    const session: DynamicInputSession = {
      fields: [{ id: "value", label: "Text", kind: "text" }],
      commit: () => {},
      commitRaw: (commitCtx) => {
        this.commitEdit(commitCtx)
        if (this.multiple) this.enterSelect(commitCtx)
        else commitCtx.endCommand()
        return true
      },
    }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setText("value", value)
  }

  /** Writes the edit back, if the wording actually changed. */
  private commitEdit(ctx: ToolContext): void {
    if (this.state.phase !== "edit") return
    const target = this.state.target
    const value = ctx.dynamicInput.getText("value")
    this.state = { phase: "select", hover: null }
    // Emptying the box is treated as "no change": erasing an object is what
    // ERASE is for, and the wording AutoCAD uses here could not be verified.
    if (value.trim().length === 0 || value === target.value) return
    this.edits += 1
    ctx.execute(new UpdateEntityCommand({ ...target, value }))
  }
}

/** Preview frames reuse one id so drawing them never burns entity ids. */
const TEXT_EDIT_PREVIEW_ID = "__textedit_preview__"

type TextEditToolState =
  /** Awaiting an annotation object to edit. */
  | { readonly phase: "select"; readonly hover: TextEntity | null }
  | { readonly phase: "edit"; readonly target: TextEntity }

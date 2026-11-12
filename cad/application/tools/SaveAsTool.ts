import { Entity, EntityId } from "../../domain/entities"
import type { PromptId } from "../../locales/types"
import { SelectionActionTool } from "./SelectionActionTool"
import {
  CommandOption,
  CommandOptionOutcome,
  PointerInput,
  QuestionInput,
  ToolContext,
  ToolQuestion,
} from "./Tool"

/**
 * SAVEAS, SAVE and DXFOUT while their Save Drawing As dialog shows, which
 * the host draws: the dialog is modal, so the run lasts until it closes.
 * Saved with DXF Options' Select objects, the command asks `Select objects:`
 * and writes what it gets (desktop dxf/d01: `Command: _SAVEAS`, `Select
 * objects: _L`, `1 found`, `Select objects:`, the file written).
 */
export class SaveAsTool extends SelectionActionTool {
  /** Whether the dialog still shows: no prompt until it closes. */
  private dialog = true

  constructor(
    readonly id: string,
    private readonly show: (open: boolean) => void,
    private readonly write: (ids: readonly EntityId[]) => void
  ) {
    super()
  }

  onActivate(): void {
    this.dialog = true
    this.show(true)
  }

  onDeactivate(ctx: ToolContext): void {
    super.onDeactivate(ctx)
    this.show(false)
  }

  /** The dialog's Save with Select objects checked: the set is asked for now. */
  selectObjects(ctx: ToolContext): void {
    this.dialog = false
    this.show(false)
    super.onActivate(ctx)
  }

  /** Whether the run is at the dialog, before any prompt. */
  atDialog(): boolean {
    return this.dialog
  }

  // WHY dropped: AutoCAD's SAVEAS takes no set before the dialog; unverified
  // whether Select objects would start from a pickfirst set.
  protected takesPreselection(): boolean {
    return false
  }

  // WHY whole objects: the file holds objects, never a polyline's segment.
  protected selectionInput(): QuestionInput {
    return "wholeObjects"
  }

  // WHY the cast: the dialog asks nothing, as UNITS' asks nothing (no
  // question), where the set's prompt is the base's to name.
  question(): PromptId | ToolQuestion {
    return this.dialog ? (null as never) : super.question()
  }

  takes(): QuestionInput | null {
    return this.dialog ? null : super.takes()
  }

  commandOptions(): readonly CommandOption[] {
    return this.dialog ? [] : super.commandOptions()
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    return this.dialog ? "unhandled" : super.invokeOption(id, ctx)
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (!this.dialog) super.onPointerDown(input, ctx)
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    if (!this.dialog) super.onPointerMove(input, ctx)
  }

  onPointerUp(input: PointerInput, ctx: ToolContext): void {
    if (!this.dialog) super.onPointerUp(input, ctx)
  }

  answerTyped(text: string, ctx: ToolContext): boolean {
    return this.dialog ? false : super.answerTyped(text, ctx)
  }

  onEnter(ctx: ToolContext): boolean {
    return this.dialog ? false : super.onEnter(ctx)
  }

  wantsSnap(): boolean {
    return this.dialog ? false : super.wantsSnap()
  }

  protected run(entities: readonly Entity[]): void {
    this.write(entities.map((entity) => entity.id))
  }
}

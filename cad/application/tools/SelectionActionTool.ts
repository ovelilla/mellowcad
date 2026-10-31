import { Entity, EntityId } from "../../domain/entities"
import { ScenePrimitive } from "../../scene/types"
import {
  CommandOption,
  CommandOptionOutcome,
  PointerInput,
  QuestionInput,
  Tool,
  ToolContext,
  ToolQuestion,
} from "./Tool"
import type { PromptId } from "../../locales/types"
import type { MessageId } from "../EngineText"
import {
  type AddedBy,
  type ModeFind,
  ObjectSelector,
  ObjectSelectorOptions,
} from "./objectSelection"

/**
 * A tool that runs a single action on a *set* of selected objects — AutoCAD's
 * EXPLODE, JOIN, ERASE and friends. It supports both invocation orders:
 *
 * - **noun→verb**: with a pre-selection, the action runs immediately on
 *   activation (picking the tool with objects already selected);
 * - **verb→noun**: with nothing selected, it asks `Select objects:`
 *   ({@link ObjectSelector}) and runs on Enter/Space.
 *
 * Escape cancels (the runtime drops back to Select without running). Subclasses
 * only implement {@link run}.
 */
export abstract class SelectionActionTool implements Tool {
  abstract readonly id: string
  readonly shortcut?: string

  /** The set being built, read live: JOIN asks differently once it holds one. */
  private selection: ToolContext["selection"] | null = null
  // WHY methods, not fields: this runs before a subclass's fields are set.
  private readonly selector = new ObjectSelector({
    takes: () => this.selectionInput(),
    done: (ctx) => this.execute(ctx),
    question: () =>
      this.selectionQuestion(!(this.selection?.isEmpty() ?? true)),
    refuse: this.refusal(),
    noneFound: this.noneFound(),
    onAdded: (ids, added, _ctx, find) => this.selectionAdded(ids, added, find),
    takesLocked: this.takesLocked(),
    lockedFirst: this.lockedFirst(),
  })

  /**
   * Whether the set and the object under the cursor draw faded rather than
   * glowing, as AutoCAD previews what ERASE will erase (desktop erase/d09).
   */
  protected readonly fadesSet: boolean = false

  /**
   * Runs the action on the selected `entities`; may reset the selection.
   * True keeps the command for a question of its own after the set (JOIN's
   * `Convert to circle?`), which ends it.
   */
  protected abstract run(
    entities: readonly Entity[],
    ctx: ToolContext
  ): boolean | void

  onActivate(ctx: ToolContext): void {
    this.selection = ctx.selection
    ctx.setCursor("default")
    this.begin(ctx)
  }

  /**
   * Enters the "Select objects" prompt — or, with a pre-selection, runs the
   * action at once (noun→verb, as AutoCAD does) unless the command refused
   * all of it. A subclass that must ask something *before* the set, like
   * COPYBASE's base point, overrides {@link onActivate} and calls this once
   * it has the answer.
   */
  protected begin(ctx: ToolContext): void {
    this.selector.start()
    if (this.selector.preselect(ctx)) this.execute(ctx)
  }

  /** Whether the set takes objects on a locked layer, as a command that only reads them does. */
  protected takesLocked(): boolean {
    return false
  }

  /** What the command says above the count of each locked object found. */
  protected lockedFirst(): MessageId | undefined {
    return undefined
  }

  /** What the command refuses at `Select objects:`, said under the count. */
  protected refusal(): ObjectSelectorOptions["refuse"] {
    return undefined
  }

  /** Objects that joined the set at `Select objects:`, and how they were found. */
  protected selectionAdded(
    ids: readonly EntityId[],
    added: AddedBy,
    find: ModeFind
  ): void {
    void ids
    void added
    void find
  }

  /** What Enter on an empty set says, if anything. */
  protected noneFound(): MessageId | undefined {
    return undefined
  }

  /** What the set is asked with, `Select objects` unless the command words it. */
  protected selectionQuestion(picked: boolean): PromptId {
    void picked
    return "selectObjects"
  }

  question(): PromptId | ToolQuestion {
    return this.selector.question()
  }

  takes(): QuestionInput | null {
    return this.selector.takes()
  }

  /** What `Select objects:` takes here, as its refusal lists the modes. */
  protected selectionInput(): QuestionInput {
    return "objects"
  }

  commandOptions(): readonly CommandOption[] {
    return this.selector.commandOptions()
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    return this.selector.invokeOption(id, ctx) ? "continue" : "unhandled"
  }

  onDeactivate(ctx: ToolContext): void {
    this.selector.start()
    this.selection = null
    ctx.dynamicInput.close()
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    this.selector.onPointerDown(input, ctx)
    ctx.requestRender()
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.selector.onPointerMove(input, ctx)
  }

  answerTyped(text: string, ctx: ToolContext): boolean {
    return this.selector.answerTyped(text, ctx)
  }

  onPointerUp(input: PointerInput, ctx: ToolContext): void {
    this.selector.onPointerUp(input, ctx)
  }

  cycleLasso(ctx: ToolContext): boolean {
    return this.selector.cycleLasso(ctx)
  }

  onEnter(ctx: ToolContext): boolean {
    return this.selector.onEnter(ctx)
  }

  wantsSnap(): boolean {
    return this.selector.wantsSnap()
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    return this.selector.buildOverlay(ctx, !this.fadesSet)
  }

  fadedEntityIds(ctx: ToolContext): readonly EntityId[] {
    if (!this.fadesSet) return []
    return [...ctx.selection.toArray(), ...this.selector.previewed()]
  }

  /** Runs the action on the current selection, then ends the command. */
  private execute(ctx: ToolContext): void {
    const entities = ctx.selection
      .toArray()
      .map((id) => ctx.document.get(id))
      .filter((entity): entity is Entity => entity !== undefined)
    if (entities.length > 0 && this.run(entities, ctx) === true) return
    ctx.endCommand()
  }
}

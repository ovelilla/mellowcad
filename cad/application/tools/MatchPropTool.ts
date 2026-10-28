import { Entity, EntityId, matchEntityProperties } from "../../domain/entities"
import { ScenePrimitive } from "../../scene/types"
import { THEME } from "../../scene/theme"
import type { PromptId } from "../../locales/types"
import type { CursorBadge } from "../SceneBuilder"
import { entityScenePrimitive } from "../SceneBuilder"
import { UpdateEntitiesCommand } from "../commands/entityCommands"
import { ObjectSelector } from "./objectSelection"
import {
  CommandOption,
  CommandOptionOutcome,
  PointerInput,
  QuestionInput,
  Tool,
  ToolContext,
} from "./Tool"

/**
 * MATCHPROP. `Select source object:` — one object selected before the command
 * is the source instead (desktop properties/d08-1), and a locked layer's is
 * taken (d08-3) — then `Current active settings:` and `Select destination
 * object(s):`, whose every selection (picks, windows and the selection modes)
 * is painted as it is made with what `matchEntityProperties` copies, until
 * Enter or Escape. A destination on a locked layer is said and left
 * (acmatchRes 28, d07).
 *
 * WHY no `[Settings]` (acmatchRes 13 lists it): the Property Settings dialog it
 * opens does not exist, and every property modelled is matched, which is what
 * its defaults do; the settings line names only those (PROPS-D46, D68).
 */
type MatchState =
  | { readonly phase: "source"; readonly hover: Entity | null }
  | { readonly phase: "destination"; readonly source: Entity }

export class MatchPropTool implements Tool {
  readonly id = "matchprop"
  /** acad.cuix's `'_matchprop ` (ID_Matchprop; desktop workspace/d02-1). */
  readonly transparentMacro = true

  private state: MatchState = { phase: "source", hover: null }
  private readonly selector = new ObjectSelector({
    question: () => "matchpropDestination",
    done: (ctx) => {
      ctx.selection.clear()
      ctx.endCommand()
    },
    locked: "matchpropLockedDestination",
    // AutoCAD paints each selection as it is made.
    onAdded: (ids, _frame, ctx) => {
      if (this.state.phase === "destination") {
        this.apply(this.state.source, ids, ctx)
      }
    },
  })

  onActivate(ctx: ToolContext): void {
    this.state = { phase: "source", hover: null }
    ctx.setCursor("crosshair")
    const preselected = ctx.selection.toArray()
    ctx.selection.clear()
    // PROPS-D71: several objects selected are dropped and the source asked
    // (unverified: acmatchRes 11 `Only one entity can be selected as source
    // object.` suggests AutoCAD refuses them).
    const source =
      preselected.length === 1 ? ctx.document.get(preselected[0]) : undefined
    if (source) this.takeSource(source, ctx)
  }

  onDeactivate(ctx: ToolContext): void {
    this.state = { phase: "source", hover: null }
    this.selector.start()
    ctx.dynamicInput.close()
  }

  question(): PromptId {
    return this.state.phase === "source"
      ? "matchpropSource"
      : this.selector.question()
  }

  takes(): QuestionInput {
    return this.state.phase === "source" ? "object" : this.selector.takes()
  }

  commandOptions(): readonly CommandOption[] {
    return this.state.phase === "destination"
      ? this.selector.commandOptions()
      : []
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    if (this.state.phase !== "destination") return "unhandled"
    return this.selector.invokeOption(id, ctx) ? "continue" : "unhandled"
  }

  /** Objects are picked by proximity, so no snap markers get in the way. */
  wantsSnap(): boolean {
    return this.state.phase === "destination" && this.selector.wantsSnap()
  }

  /** The source may be on a locked layer (desktop properties/d08-3). */
  picksLocked(): boolean {
    return this.state.phase === "source"
  }

  /** The paintbrush beside the pick box while destinations are picked (d07-1). */
  cursorBadge(): CursorBadge | null {
    return this.state.phase === "destination" && !this.selector.wantsSnap()
      ? "paint"
      : null
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    if (this.state.phase === "destination") {
      this.selector.onPointerMove(input, ctx)
      return
    }
    const hover = ctx.pick(input.world) ?? null
    if (hover?.id !== this.state.hover?.id) {
      this.state = { phase: "source", hover }
      ctx.requestRender()
    }
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (this.state.phase === "destination") {
      this.selector.onPointerDown(input, ctx)
      return
    }
    if (input.button !== 0) return
    const hit = ctx.pick(input.world)
    if (hit) this.takeSource(hit, ctx)
  }

  answerTyped(text: string, ctx: ToolContext): boolean {
    return (
      this.state.phase === "destination" && this.selector.answerTyped(text, ctx)
    )
  }

  onPointerUp(input: PointerInput, ctx: ToolContext): void {
    if (this.state.phase === "destination") {
      this.selector.onPointerUp(input, ctx)
    }
  }

  cycleLasso(ctx: ToolContext): boolean {
    return this.selector.cycleLasso(ctx)
  }

  onEnter(ctx: ToolContext): boolean {
    return this.state.phase === "destination" && this.selector.onEnter(ctx)
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    const state = this.state
    if (state.phase === "source") {
      return state.hover
        ? entityScenePrimitive(
            ctx.viewport,
            state.hover,
            { color: THEME.entityHover, width: 2 },
            { blocks: ctx.blocks }
          )
        : []
    }
    return [
      ...entityScenePrimitive(
        ctx.viewport,
        state.source,
        { color: THEME.selected, width: 2 },
        { blocks: ctx.blocks }
      ),
      ...this.selector.buildOverlay(ctx),
    ]
  }

  /** The source taken: the settings line (acmatchRes 18; d07, e02), then the destinations. */
  private takeSource(source: Entity, ctx: ToolContext): void {
    this.state = { phase: "destination", source }
    this.selector.start()
    ctx.report(ctx.text.message("matchpropSettings"))
    ctx.requestRender()
  }

  /** Paints the source's properties on the objects a selection took. */
  private apply(
    source: Entity,
    ids: readonly EntityId[],
    ctx: ToolContext
  ): void {
    const updated = ids
      .filter((id) => id !== source.id)
      .map((id) => ctx.document.get(id))
      .filter((entity): entity is Entity => entity !== undefined)
      .map((entity) => matchEntityProperties(source, entity))
    if (updated.length > 0) ctx.execute(new UpdateEntitiesCommand(updated))
    ctx.requestRender()
  }
}

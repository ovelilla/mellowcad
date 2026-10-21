import { Entity, EntityId, matchEntityProperties } from "../../domain/entities"
import { ScenePrimitive } from "../../scene/types"
import { THEME } from "../../scene/theme"
import type { PromptId } from "../../locales/types"
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
 * MATCHPROP. `Select source object:`, then its general properties — layer,
 * colour, linetype and lineweight — are painted onto the objects each
 * selection at `Select destination object(s):` takes (picks, windows and the
 * selection modes, as every set is selected), until Enter or Escape.
 *
 * The Settings dialog is not implemented: every property we model is matched,
 * which is what its defaults do anyway, so the prompt offers no `[Settings]`
 * and no `Current active settings:` line is written (its list is not
 * documented word for word).
 */
type MatchState =
  | { readonly phase: "source"; readonly hover: Entity | null }
  | { readonly phase: "destination"; readonly source: Entity }

export class MatchPropTool implements Tool {
  readonly id = "matchprop"

  private state: MatchState = { phase: "source", hover: null }
  private readonly selector = new ObjectSelector({
    question: () => "matchpropDestination",
    done: (ctx) => {
      ctx.selection.clear()
      ctx.endCommand()
    },
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
    ctx.selection.clear()
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
    if (!hit) return
    this.state = { phase: "destination", source: hit }
    this.selector.start()
    ctx.requestRender()
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

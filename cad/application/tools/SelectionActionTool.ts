import { Vec2 } from "../../geometry/Vec2"
import { Entity, EntityId } from "../../domain/entities"
import { ScenePrimitive } from "../../scene/types"
import { THEME } from "../../scene/theme"
import { entityScenePrimitive } from "../SceneBuilder"
import { boxSelect, buildSelectionBoxOverlay } from "./boxSelection"
import { PointerInput, Tool, ToolContext } from "./Tool"
import type { PromptId } from "../../locales/types"
import { countPreselection, pickObjects } from "./objectSelection"

/** Screen-pixel movement past which a press-drag becomes a box selection. */
const DRAG_THRESHOLD_PX = 4

/**
 * A tool that runs a single action on a *set* of selected objects — AutoCAD's
 * EXPLODE, JOIN, ERASE and friends. It supports both invocation orders:
 *
 * - **noun→verb**: with a pre-selection, the action runs immediately on
 *   activation (picking the tool with objects already selected);
 * - **verb→noun**: with nothing selected, it enters a "Select objects" prompt
 *   (click or window/crossing box, shift removes) and runs on Enter/Space.
 *
 * Escape cancels (the runtime drops back to Select without running). Subclasses
 * only implement {@link run}; the selection machinery is shared here and mirrors
 * the pick/box behaviour of the Select and placement tools.
 */
export abstract class SelectionActionTool implements Tool {
  abstract readonly id: string
  readonly shortcut?: string

  private state: SelectionActionState = { phase: "selecting", hover: null }
  /** The set being built, read live: JOIN asks differently once it holds one. */
  private selection: ToolContext["selection"] | null = null

  /** Runs the action on the selected `entities`; may reset the selection. */
  protected abstract run(entities: readonly Entity[], ctx: ToolContext): void

  onActivate(ctx: ToolContext): void {
    this.selection = ctx.selection
    ctx.setCursor("default")
    this.begin(ctx)
  }

  /**
   * Enters the "Select objects" prompt — or, with a pre-selection, runs the
   * action at once (noun→verb, as AutoCAD does). A subclass that must ask
   * something *before* the set, like COPYBASE's base point, overrides
   * {@link onActivate} and calls this once it has the answer.
   */
  protected begin(ctx: ToolContext): void {
    if (!ctx.selection.isEmpty()) {
      if (this.question() !== null) countPreselection(ctx)
      this.execute(ctx)
    } else {
      this.state = { phase: "selecting", hover: null }
    }
  }

  /**
   * What the set is asked with, `Select objects`; null for a command whose
   * own wording is not verified yet, which keeps `NAME:`.
   */
  protected selectionQuestion(picked: boolean): PromptId | null {
    void picked
    return "selectObjects"
  }

  question(): PromptId | null {
    return this.selectionQuestion(!(this.selection?.isEmpty() ?? true))
  }

  onDeactivate(ctx: ToolContext): void {
    this.state = { phase: "selecting", hover: null }
    this.selection = null
    ctx.dynamicInput.close()
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0) return
    if (this.state.phase !== "selecting") return
    this.state = {
      phase: "pressed",
      startWorld: input.world,
      startScreen: input.screen,
      currentWorld: input.world,
      subtract: input.shiftKey,
    }
    ctx.requestRender()
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    switch (this.state.phase) {
      case "selecting": {
        const hover = this.rolloverAt(input.world, ctx)
        if (hover?.id !== this.state.hover?.id) {
          this.state = { phase: "selecting", hover }
          ctx.requestRender()
        }
        break
      }
      case "pressed": {
        const moved = Math.hypot(
          input.screen.x - this.state.startScreen.x,
          input.screen.y - this.state.startScreen.y
        )
        if (moved >= DRAG_THRESHOLD_PX) {
          this.state = {
            phase: "boxing",
            startWorld: this.state.startWorld,
            currentWorld: input.world,
            subtract: this.state.subtract,
          }
        } else {
          this.state = { ...this.state, currentWorld: input.world }
        }
        ctx.requestRender()
        break
      }
      case "boxing":
        this.state = { ...this.state, currentWorld: input.world }
        ctx.requestRender()
        break
    }
  }

  onPointerUp(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0) return

    if (this.state.phase === "pressed") {
      const hit = ctx.pick(input.world)
      if (hit) this.applyPick([hit.id], this.state.subtract, ctx)
      this.state = {
        phase: "selecting",
        hover: this.rolloverAt(input.world, ctx),
      }
      ctx.requestRender()
      return
    }
    if (this.state.phase === "boxing") {
      const hits = boxSelect(
        ctx.document,
        this.state.startWorld,
        this.state.currentWorld,
        ctx.viewport
      )
      this.applyPick(hits, this.state.subtract, ctx, true)
      this.state = { phase: "selecting", hover: null }
      ctx.requestRender()
    }
  }

  onEnter(ctx: ToolContext): boolean {
    if (this.state.phase !== "selecting" || ctx.selection.isEmpty())
      return false
    this.execute(ctx)
    return true
  }

  wantsSnap(): boolean {
    return false // picking objects, not acquiring points
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    if (this.state.phase === "boxing") {
      return buildSelectionBoxOverlay(
        ctx.viewport,
        this.state.startWorld,
        this.state.currentWorld
      )
    }
    if (this.state.phase !== "selecting" || !this.state.hover) return []
    return entityScenePrimitive(
      ctx.viewport,
      this.state.hover,
      { color: THEME.entityHover, width: 2 },
      { blocks: ctx.blocks }
    )
  }

  /**
   * The object a click would add to the set — AutoCAD's selection preview.
   * Already-selected objects are skipped: they are drawn highlighted anyway.
   */
  private rolloverAt(world: Vec2, ctx: ToolContext): Entity | null {
    const hit = ctx.pick(world)
    return hit && !ctx.selection.has(hit.id) ? hit : null
  }

  /** Runs the action on the current selection, then ends the command. */
  private execute(ctx: ToolContext): void {
    const entities = ctx.selection
      .toArray()
      .map((id) => ctx.document.get(id))
      .filter((entity): entity is Entity => entity !== undefined)
    if (entities.length > 0) this.run(entities, ctx)
    ctx.endCommand()
  }

  private applyPick(
    ids: readonly EntityId[],
    subtract: boolean,
    ctx: ToolContext,
    box = false
  ): void {
    if (this.question() !== null) pickObjects(ids, subtract, box, ctx)
    else {
      for (const id of ids) {
        if (subtract) ctx.selection.remove(id)
        else ctx.selection.add(id)
      }
    }
  }
}

type SelectionActionState =
  | { readonly phase: "selecting"; readonly hover: Entity | null }
  | {
      readonly phase: "pressed"
      readonly startWorld: Vec2
      readonly startScreen: Vec2
      readonly currentWorld: Vec2
      readonly subtract: boolean
    }
  | {
      readonly phase: "boxing"
      readonly startWorld: Vec2
      readonly currentWorld: Vec2
      readonly subtract: boolean
    }

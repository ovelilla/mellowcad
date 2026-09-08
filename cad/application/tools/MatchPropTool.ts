import { Vec2, V } from "../../geometry/Vec2"
import { Entity, EntityId, matchEntityProperties } from "../../domain/entities"
import { ScenePrimitive } from "../../scene/types"
import { THEME } from "../../scene/theme"
import { entityScenePrimitive } from "../SceneBuilder"
import { UpdateEntitiesCommand } from "../commands/entityCommands"
import { boxSelect, buildSelectionBoxOverlay } from "./boxSelection"
import { PointerInput, Tool, ToolContext } from "./Tool"

/**
 * MATCHPROP. Pick a source object, then paint its general properties — layer,
 * colour, linetype and lineweight — onto as many destination objects as you
 * like, one pick or one selection box at a time, until Escape or Enter.
 *
 * The Settings dialog is not implemented: every property we model is matched,
 * which is what its defaults do anyway.
 */
type MatchState =
  | { readonly phase: "source"; readonly hover: Entity | null }
  | {
      readonly phase: "destination"
      readonly source: Entity
      readonly hover: Entity | null
    }
  | {
      readonly phase: "pressed"
      readonly source: Entity
      readonly startWorld: Vec2
      readonly startScreen: Vec2
      readonly currentWorld: Vec2
    }
  | {
      readonly phase: "boxing"
      readonly source: Entity
      readonly startWorld: Vec2
      readonly currentWorld: Vec2
    }

const DRAG_THRESHOLD_PX = 4

export class MatchPropTool implements Tool {
  readonly id = "matchprop"
  readonly label = "Match properties"

  private state: MatchState = { phase: "source", hover: null }

  onActivate(ctx: ToolContext): void {
    this.state = { phase: "source", hover: null }
    ctx.setCursor("crosshair")
    ctx.selection.clear()
  }

  onDeactivate(): void {
    this.state = { phase: "source", hover: null }
  }

  /** Objects are picked by proximity, so no snap markers get in the way. */
  wantsSnap(): boolean {
    return false
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    if (this.state.phase === "pressed") {
      const dragged =
        V.distance(input.screen, this.state.startScreen) >= DRAG_THRESHOLD_PX
      this.state = dragged
        ? {
            phase: "boxing",
            source: this.state.source,
            startWorld: this.state.startWorld,
            currentWorld: input.world,
          }
        : { ...this.state, currentWorld: input.world }
      ctx.requestRender()
      return
    }
    if (this.state.phase === "boxing") {
      this.state = { ...this.state, currentWorld: input.world }
      ctx.requestRender()
      return
    }

    const hover = ctx.pick(input.world) ?? null
    if (hover?.id !== this.state.hover?.id) {
      this.state = { ...this.state, hover }
      ctx.requestRender()
    }
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0) return
    if (this.state.phase === "source") {
      const hit = ctx.pick(input.world)
      if (!hit) return
      this.state = { phase: "destination", source: hit, hover: null }
      ctx.requestRender()
      return
    }
    if (this.state.phase === "destination") {
      this.state = {
        phase: "pressed",
        source: this.state.source,
        startWorld: input.world,
        startScreen: input.screen,
        currentWorld: input.world,
      }
    }
  }

  onPointerUp(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0) return
    if (this.state.phase === "boxing") {
      const ids = boxSelect(ctx.document, this.state.startWorld, input.world)
      this.apply(this.state.source, ids, ctx)
      return
    }
    if (this.state.phase !== "pressed") return
    const hit = ctx.pick(input.world)
    this.apply(this.state.source, hit ? [hit.id] : [], ctx)
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    if (this.state.phase === "boxing") {
      return buildSelectionBoxOverlay(
        ctx.viewport,
        this.state.startWorld,
        this.state.currentWorld
      )
    }

    const out: ScenePrimitive[] = []
    if (this.state.phase !== "source" && this.state.phase !== "destination") {
      return out
    }
    if (this.state.phase === "destination") {
      out.push(
        ...entityScenePrimitive(
          ctx.viewport,
          this.state.source,
          { color: THEME.selected, width: 2 },
          { blocks: ctx.blocks }
        )
      )
    }
    if (this.state.hover) {
      out.push(
        ...entityScenePrimitive(
          ctx.viewport,
          this.state.hover,
          { color: THEME.entityHover, width: 2 },
          { blocks: ctx.blocks }
        )
      )
    }
    return out
  }

  /** Paints the source's properties on the picked objects and keeps painting. */
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
    this.state = { phase: "destination", source, hover: null }
    ctx.requestRender()
  }
}

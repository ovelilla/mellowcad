import { Vec2, V } from "../../geometry/Vec2"
import { Entity, entitiesBounds, entityBounds } from "../../domain/entities"
import { ScenePrimitive } from "../../scene/types"
import { THEME } from "../../scene/theme"
import { entityScenePrimitive } from "../SceneBuilder"
import {
  CommandOption,
  CommandOptionOutcome,
  PointerInput,
  Tool,
  ToolContext,
} from "./Tool"

/**
 * ZOOM. Picking two corners frames that window (the command's default action),
 * and the usual keywords cover the rest of the navigation vocabulary:
 * `[All/Extents/Previous/Scale/Window/Object]`.
 *
 * WHY All behaves like Extents: AutoCAD's All frames the drawing limits when
 * the geometry fits inside them, and there is no LIMITS here — so the two
 * coincide. Both are kept because `Z A` and `Z E` are equally worn-in muscle
 * memory. Dynamic and the real-time default are not implemented (the wheel
 * covers real-time zooming).
 */
type ZoomState =
  | { readonly phase: "corner" }
  | {
      readonly phase: "window"
      readonly first: Vec2
      readonly firstScreen: Vec2
      readonly cursor: Vec2
    }
  | { readonly phase: "scale" }
  | { readonly phase: "object"; readonly hover: Entity | null }

/** Pixels the press must travel for a drag to count as the whole window. */
const DRAG_THRESHOLD_PX = 4

/** Screen margin left around the framed geometry, as in `zoomToFit`. */
const PADDING_PX = 40

export class ZoomTool implements Tool {
  readonly id = "zoom"

  private state: ZoomState = { phase: "corner" }

  onActivate(ctx: ToolContext): void {
    this.state = { phase: "corner" }
    ctx.setCursor("crosshair")
    this.openKeywordPrompt(ctx)
  }

  onDeactivate(ctx: ToolContext): void {
    this.state = { phase: "corner" }
    ctx.dynamicInput.close()
  }

  /** Zoom picks a rectangle, never a geometric point: no snapping, no markers. */
  wantsSnap(): boolean {
    return false
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    if (this.state.phase === "window") {
      this.state = { ...this.state, cursor: input.world }
      ctx.requestRender()
    } else if (this.state.phase === "object") {
      const hover = ctx.pick(input.world)
      if (hover?.id !== this.state.hover?.id) {
        this.state = { phase: "object", hover: hover ?? null }
        ctx.requestRender()
      }
    }
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0) return
    if (this.state.phase === "corner") {
      this.state = {
        phase: "window",
        first: input.world,
        firstScreen: input.screen,
        cursor: input.world,
      }
      ctx.requestRender()
      return
    }
    if (this.state.phase === "window") {
      this.commitWindow(this.state.first, input.world, ctx)
      return
    }
    if (this.state.phase === "object") {
      const hit = ctx.pick(input.world)
      if (!hit) return
      this.frame(entityBounds(hit, ctx.blocks), ctx)
      ctx.endCommand()
    }
  }

  /** A press-drag frames the window on release, the way AutoCAD accepts both. */
  onPointerUp(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0 || this.state.phase !== "window") return
    if (V.distance(input.screen, this.state.firstScreen) < DRAG_THRESHOLD_PX) {
      return
    }
    this.commitWindow(this.state.first, input.world, ctx)
  }

  commandOptions(): readonly CommandOption[] {
    if (this.state.phase === "scale") return []
    return [
      { id: "All" },
      { id: "Extents" },
      { id: "Previous" },
      { id: "Scale" },
      { id: "Window" },
      { id: "Object" },
    ]
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    switch (id) {
      case "All":
      case "Extents":
        this.zoomExtents(ctx)
        return "end"
      case "Previous":
        ctx.viewport.restorePrevious()
        return "end"
      case "Window":
        this.state = { phase: "corner" }
        this.openKeywordPrompt(ctx)
        return "continue"
      case "Scale":
        this.state = { phase: "scale" }
        ctx.dynamicInput.open({
          fields: [{ id: "factor", prompt: "scaleFactor", kind: "number" }],
          commit: (values) => this.commitScale(values.factor, ctx),
        })
        return "continue"
      case "Object": {
        // A pre-selected set is what the user already pointed at, so honour it
        // instead of asking again.
        const selected = ctx.selection
          .toArray()
          .map((id) => ctx.document.get(id))
          .filter((entity): entity is Entity => entity !== undefined)
        const bounds = entitiesBounds(selected, ctx.blocks)
        if (bounds) {
          this.frame(bounds, ctx)
          return "end"
        }
        this.state = { phase: "object", hover: null }
        this.openKeywordPrompt(ctx)
        return "continue"
      }
      default:
        return "unhandled"
    }
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    if (this.state.phase === "object" && this.state.hover) {
      return entityScenePrimitive(
        ctx.viewport,
        this.state.hover,
        { color: THEME.selected, width: 2.5 },
        { blocks: ctx.blocks }
      )
    }
    if (this.state.phase !== "window") return []
    const a = ctx.viewport.worldToScreen(this.state.first)
    const b = ctx.viewport.worldToScreen(this.state.cursor)
    return [
      {
        kind: "rect",
        min: { x: Math.min(a.x, b.x), y: Math.min(a.y, b.y) },
        width: Math.abs(b.x - a.x),
        height: Math.abs(b.y - a.y),
        stroke: { color: THEME.preview, width: 1, dash: [6, 4] },
      },
    ]
  }

  /**
   * The selection-phase prompt carries no fields, so the option chips show
   * while the canvas keeps focus and the keyword letters reach the tool.
   */
  private openKeywordPrompt(ctx: ToolContext): void {
    ctx.dynamicInput.open({ fields: [], commit: () => {} })
  }

  private commitWindow(first: Vec2, second: Vec2, ctx: ToolContext): void {
    const min = {
      x: Math.min(first.x, second.x),
      y: Math.min(first.y, second.y),
    }
    const max = {
      x: Math.max(first.x, second.x),
      y: Math.max(first.y, second.y),
    }
    // A stray click (an empty window) would zoom to an absurd scale; keep
    // prompting instead, as AutoCAD does.
    if (max.x - min.x < 1e-9 || max.y - min.y < 1e-9) {
      this.state = { phase: "corner" }
      ctx.requestRender()
      return
    }
    ctx.viewport.pushHistory()
    ctx.viewport.zoomToBounds(min, max)
    ctx.endCommand()
  }

  private commitScale(factor: number, ctx: ToolContext): void {
    if (!Number.isFinite(factor) || factor <= 0) return
    ctx.viewport.pushHistory()
    const center = {
      x: ctx.viewport.width / 2,
      y: ctx.viewport.height / 2,
    }
    ctx.viewport.zoomAt(center, factor)
    ctx.endCommand()
  }

  private zoomExtents(ctx: ToolContext): void {
    const bounds = entitiesBounds(ctx.document.getEntities(), ctx.blocks)
    if (!bounds) return
    this.frame(bounds, ctx)
  }

  private frame(
    bounds: { readonly min: Vec2; readonly max: Vec2 },
    ctx: ToolContext
  ): void {
    ctx.viewport.pushHistory()
    ctx.viewport.zoomToBounds(bounds.min, bounds.max, PADDING_PX)
  }
}

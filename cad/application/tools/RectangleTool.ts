import { Vec2, V } from "../../geometry/Vec2"
import { Vec3 } from "../../geometry/Vec3"
import { createPolyline, onPlaneOf } from "../../domain/entities"
import {
  Ucs,
  ucsPointToWorld,
  worldDirectionToUcs,
  worldPointToUcs,
} from "../../domain/ucs"
import { AddEntityCommand } from "../commands/entityCommands"
import { DynamicInputSession } from "../input/DynamicInput"
import type { PromptId } from "../../locales/types"
import {
  isCoordinateExpression,
  parseCoordinate,
} from "../input/coordinateInput"
import { ScenePrimitive } from "../../scene/types"
import { THEME } from "../../scene/theme"
import { KeyInput, PointerInput, Tool, ToolContext } from "./Tool"

/**
 * AutoCAD's RECTANG: two opposite corners define a rectangle squared to the
 * UCS, created as a single closed four-vertex polyline. Single-shot — the command
 * ends the moment the second corner is placed. The corner options (Chamfer,
 * Fillet, Width, Rotation, Area, Dimensions) are later work.
 */
type RectangleToolState =
  /** Awaiting the first corner. */
  | { readonly phase: "first" }
  /** First corner placed; rubber-banding the opposite corner. */
  | { readonly phase: "second"; readonly first: Vec3; readonly cursor: Vec2 }

export class RectangleTool implements Tool {
  readonly id = "rectangle"

  private state: RectangleToolState = { phase: "first" }
  private lastScreen: Vec2 | null = null

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    ctx.selection.clear()
    this.state = { phase: "first" }
    this.openPointInput(ctx, "firstCorner")
  }

  onDeactivate(ctx: ToolContext): void {
    this.state = { phase: "first" }
    ctx.dynamicInput.close()
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen
    if (this.state.phase === "second") {
      this.state = { ...this.state, cursor: input.point }
    }
    ctx.dynamicInput.setPosition(input.screen)
    ctx.requestRender()
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0) return
    this.advanceWithPoint(input.point, ctx, input.screen)
  }

  onKeyDown(input: KeyInput, ctx: ToolContext): void {
    if (input.key === "Escape") {
      this.state = { phase: "first" }
      ctx.dynamicInput.close()
      ctx.requestRender()
    }
  }

  getConstraintAnchor(): Vec2 | null {
    return this.state.phase === "second" ? this.state.first : null
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    if (this.state.phase !== "second") return []
    const corners = rectangleCorners(
      this.state.first,
      this.state.cursor,
      ctx.ucs
    )
    return [
      {
        kind: "path",
        points: corners.map((c) => ctx.viewport.worldToScreen(c)),
        closed: true,
        stroke: { color: THEME.rubberBand, width: 1 },
      },
    ]
  }

  /**
   * Advances the point phases with a resolved world point, shared by the click
   * path and the typed-coordinate path so both behave identically.
   */
  private advanceWithPoint(point: Vec3, ctx: ToolContext, screen?: Vec2): void {
    const at = screen ?? this.lastScreen ?? ctx.viewport.worldToScreen(point)
    if (this.state.phase === "first") {
      this.state = { phase: "second", first: point, cursor: point }
      this.openPointInput(ctx, "otherCorner", at)
      ctx.requestRender()
      return
    }
    this.commitRectangle(this.state.first, point, ctx)
  }

  private commitRectangle(first: Vec3, other: Vec2, ctx: ToolContext): void {
    // A degenerate rectangle (zero width or height) has no area — ignore it and
    // keep prompting, mirroring AutoCAD, which rejects a zero-size rectangle.
    const diagonal = worldDirectionToUcs(ctx.ucs, V.sub(other, first))
    if (Math.abs(diagonal.x) < 1e-9 || Math.abs(diagonal.y) < 1e-9) {
      return
    }
    ctx.execute(
      new AddEntityCommand(
        onPlaneOf(
          createPolyline(
            rectangleCorners(first, other, ctx.ucs),
            true,
            ctx.document.getCurrentLayerId()
          ),
          first
        )
      )
    )
    ctx.endCommand()
  }

  private openPointInput(
    ctx: ToolContext,
    prompt: PromptId,
    screen?: Vec2
  ): void {
    const session: DynamicInputSession = {
      fields: [{ id: "point", prompt, kind: "coordinate" }],
      commit: () => {},
      commitRaw: (commitCtx) => this.commitTypedPoint(commitCtx),
    }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setPosition(screen ?? this.lastScreen ?? { x: 0, y: 0 })
  }

  /** Places a corner from a typed coordinate (e.g. `50,20` or `@100,50`). */
  private commitTypedPoint(ctx: ToolContext): boolean {
    const text = ctx.dynamicInput.getText("point").trim()
    if (!isCoordinateExpression(text)) return false
    const last = this.state.phase === "second" ? this.state.first : null
    const point = parseCoordinate(text, {
      lastPoint: last,
      relativeByDefault: last !== null,
      ucs: ctx.ucs,
    })
    if (!point) return false
    this.advanceWithPoint(point, ctx)
    return true
  }
}

/** The four corners of the rectangle two points span, its sides along the UCS axes. */
function rectangleCorners(a: Vec2, b: Vec2, ucs: Ucs): Vec2[] {
  const la = worldPointToUcs(ucs, a)
  const lb = worldPointToUcs(ucs, b)
  return [
    { x: la.x, y: la.y },
    { x: lb.x, y: la.y },
    { x: lb.x, y: lb.y },
    { x: la.x, y: lb.y },
  ].map((corner) => ucsPointToWorld(ucs, corner))
}

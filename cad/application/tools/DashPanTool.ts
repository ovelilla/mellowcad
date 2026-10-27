import { Vec2 } from "../../geometry/Vec2"
import { Vec3 } from "../../geometry/Vec3"
import type { PromptId } from "../../locales/types"
import { THEME } from "../../scene/theme"
import { ScenePrimitive } from "../../scene/types"
import { parseCoordinate } from "../input/coordinateInput"
import { PointerInput, QuestionInput, Tool, ToolContext } from "./Tool"

/**
 * AutoCAD's -PAN, as AutoCAD 2027's console answers it (probes view/p204–p220,
 * p338, p354–p356, p368): `Specify base point or displacement:`, then
 * the measuring prompt's ` Specify second point:`. The drawing moves by the
 * second point less the first or, at Enter, by the first read as a
 * displacement in the UCS; Enter at the first is refused. Neither point
 * becomes LASTPOINT. Its run is an undo step of its own, joined with
 * nothing, even when it moves nothing.
 */
export class DashPanTool implements Tool {
  readonly id = "dashpan"
  readonly changesView = true

  private base: Vec3 | null = null
  private cursor: Vec3 | null = null
  private lastScreen: Vec2 | null = null

  onActivate(ctx: ToolContext): void {
    this.base = null
    this.cursor = null
    ctx.setCursor("crosshair")
    this.open(ctx)
  }

  onDeactivate(ctx: ToolContext): void {
    this.base = null
    ctx.dynamicInput.close()
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen
    this.cursor = input.point
    ctx.dynamicInput.setPosition(input.screen)
    if (this.base !== null) ctx.requestRender()
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button === 0) this.take(input.point, ctx)
  }

  wantsSnap(): boolean {
    return true
  }

  question(): PromptId {
    return this.base === null ? "panBasePoint" : "secondPointOfDistance"
  }

  takes(): QuestionInput {
    return { refusal: "requiresTwoPointsOrDisplacement" }
  }

  setsLastPoint(): boolean {
    return false
  }

  getConstraintAnchor(): Vec3 | null {
    return this.base
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    if (this.base === null || this.cursor === null) return []
    return [
      {
        kind: "segment",
        a: ctx.viewport.worldToScreen(this.base),
        b: ctx.viewport.worldToScreen(this.cursor),
        stroke: { color: THEME.rubberBand, width: 1 },
      },
    ]
  }

  private open(ctx: ToolContext): void {
    ctx.dynamicInput.open({
      fields: [{ id: "point", prompt: this.question(), kind: "coordinate" }],
      commit: () => {},
      commitRaw: (commitCtx) => {
        const text = commitCtx.dynamicInput.getText("point").trim()
        if (text === "") return this.enter(commitCtx)
        const point = parseCoordinate(text, {
          lastPoint: this.base ?? commitCtx.lastPoint,
          relativeByDefault: this.base !== null,
          ucs: commitCtx.ucs,
          elevation: commitCtx.elevation,
        })
        if (!point) return false
        this.take(point, commitCtx)
        return true
      },
    })
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }

  /** Enter: refused at the first point, the first as a displacement at the second. */
  private enter(ctx: ToolContext): boolean {
    if (this.base === null) {
      ctx.report(ctx.text.message("requiresTwoPointsOrDisplacement"), "error")
      return true
    }
    this.pan(ctx.ucs.origin, this.base, ctx)
    return true
  }

  private take(point: Vec3, ctx: ToolContext): void {
    if (this.base === null) {
      this.base = point
      this.open(ctx)
      return
    }
    this.pan(this.base, point, ctx)
  }

  /** Moves the drawing from `from` to `to`, as seen on the screen. */
  private pan(from: Vec3, to: Vec3, ctx: ToolContext): void {
    const a = ctx.viewport.worldToScreen(from)
    const b = ctx.viewport.worldToScreen(to)
    ctx.viewport.pushHistory()
    ctx.viewport.panByScreen({ x: b.x - a.x, y: b.y - a.y })
    ctx.endCommand()
  }
}

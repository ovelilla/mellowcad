import { Vec2 } from "../../geometry/Vec2"
import { Vec3, sub3 } from "../../geometry/Vec3"
import { createRay } from "../../domain/entities"
import type { PromptId } from "../../locales/types"
import type { ScenePrimitive } from "../../scene/types"
import { AddEntityCommand } from "../commands/entityCommands"
import {
  isCoordinateExpression,
  parseCoordinate,
} from "../input/coordinateInput"
import { entityScenePrimitive } from "../SceneBuilder"
import { currentColor, withCurrentProperties } from "./currentProperties"
import type { PointerInput, Tool, ToolContext } from "./Tool"
import { rubberBand } from "./XlineTool"

/**
 * AutoCAD's RAY (xline/r01, desktop d07): `Specify start point:`, then
 * `Specify through point:` again and again, each a ray from the start through
 * the point, Enter ending the run (Enter at the start makes none). A through
 * point on the start is `*Invalid*`. Each ray wears the current properties;
 * its points keep their Z, so one runs off the plan.
 */
export class RayTool implements Tool {
  readonly id = "ray"

  private start: Vec3 | null = null
  private cursor: Vec3 | null = null
  private lastScreen: Vec2 | null = null

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    this.start = null
    this.openPoint(ctx)
  }

  onDeactivate(ctx: ToolContext): void {
    this.start = null
    this.cursor = null
    ctx.dynamicInput.close()
  }

  question(): PromptId {
    return this.start ? "specifyThroughPoint" : "rayStartPoint"
  }

  wantsSnap(): boolean {
    return true
  }

  getConstraintAnchor(): Vec3 | null {
    return this.start
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen
    this.cursor = input.point
    ctx.dynamicInput.setPosition(input.screen)
    ctx.requestRender()
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button === 0) this.place(input.point, ctx)
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    if (!this.start || !this.cursor) return []
    const ghost = createRay(
      this.start,
      sub3(this.cursor, this.start),
      ctx.document.getCurrentLayerId(),
      "ray-preview"
    )
    return ghost
      ? [
          ...entityScenePrimitive(ctx.viewport, ghost, {
            color: currentColor(ctx),
            width: 1,
          }),
          rubberBand(ctx, this.start, this.cursor),
        ]
      : []
  }

  private place(point: Vec3, ctx: ToolContext): void {
    if (!this.start) {
      this.start = point
      this.openPoint(ctx)
      return
    }
    const ray = createRay(
      this.start,
      sub3(point, this.start),
      ctx.document.getCurrentLayerId()
    )
    if (!ray) {
      // On the start (xline/r01).
      ctx.report(ctx.text.message("invalid"), "error")
      return
    }
    ctx.execute(new AddEntityCommand(withCurrentProperties(ray, ctx)))
    this.openPoint(ctx)
  }

  private openPoint(ctx: ToolContext): void {
    ctx.dynamicInput.open({
      fields: [{ id: "point", kind: "coordinate" }],
      commit: () => {},
      commitRaw: (commitCtx) => {
        const text = commitCtx.dynamicInput.getText("point").trim()
        if (!isCoordinateExpression(text)) return false
        const point = parseCoordinate(text, {
          lastPoint: commitCtx.lastPoint,
          relativeByDefault: false,
          ucs: commitCtx.ucs,
          elevation: commitCtx.elevation,
        })
        if (!point) return false
        this.place(point, commitCtx)
        return true
      },
    })
    if (this.lastScreen) ctx.dynamicInput.setPosition(this.lastScreen)
    ctx.requestRender()
  }
}

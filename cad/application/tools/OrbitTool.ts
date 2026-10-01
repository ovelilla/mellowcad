import { Vec2 } from "../../geometry/Vec2"
import { Vec3 } from "../../geometry/Vec3"
import { orbitTarget, orbitView } from "../orbit"
import { PointerInput, Tool, ToolContext } from "./Tool"

/**
 * AutoCAD's 3DORBIT, constrained: dragging across turns the camera about the
 * world's Z axis and dragging up and down raises or lowers it, about the
 * middle of the drawing under the centre of the screen. Objects cannot be
 * edited while it runs; Enter or Escape ends it. Each drag is one step of ZOOM
 * Previous. Shift and the wheel button held orbit from any command. It works
 * in the WCS, whose Z it turns about.
 */
export class OrbitTool implements Tool {
  readonly id = "orbit"
  readonly inWorld = true

  private drag: { last: Vec2; target: Vec3 } | null = null

  onActivate(ctx: ToolContext): void {
    this.drag = null
    ctx.setCursor("move")
  }

  onDeactivate(ctx: ToolContext): void {
    this.drag = null
    ctx.setCursor("default")
  }

  /** The orbit cursor replaces the crosshair, as AutoCAD's does. */
  usesCrosshair(): boolean {
    return false
  }

  wantsSnap(): boolean {
    return false
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0) return
    ctx.viewport.pushHistory()
    this.drag = {
      last: input.screen,
      target: orbitTarget(ctx.viewport, ctx.document.getEntities(), ctx.blocks),
    }
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    if (!this.drag) return
    orbitView(
      ctx.viewport,
      {
        x: input.screen.x - this.drag.last.x,
        y: input.screen.y - this.drag.last.y,
      },
      this.drag.target
    )
    this.drag = { ...this.drag, last: input.screen }
  }

  onPointerUp(input: PointerInput): void {
    if (input.button !== 0) return
    this.drag = null
  }
}

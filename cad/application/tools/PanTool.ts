import { Vec2 } from "../../geometry/Vec2"
import { PointerInput, Tool, ToolContext } from "./Tool"

/**
 * PAN. Dragging with the left button slides the view, so panning works without
 * a middle mouse button (dragging with the middle or right button pans at any
 * time, but a trackpad has neither). Ends with Enter or Escape, like AutoCAD's
 * real-time pan.
 */
export class PanTool implements Tool {
  readonly id = "pan"
  readonly label = "Pan"

  private lastScreen: Vec2 | null = null

  onActivate(ctx: ToolContext): void {
    this.lastScreen = null
    ctx.setCursor("grab")
  }

  onDeactivate(ctx: ToolContext): void {
    this.lastScreen = null
    ctx.setCursor("default")
  }

  /** The hand cursor replaces the crosshair while panning, as in AutoCAD. */
  usesCrosshair(): boolean {
    return false
  }

  wantsSnap(): boolean {
    return false
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0) return
    this.lastScreen = input.screen
    ctx.viewport.pushHistory()
    ctx.setCursor("grabbing")
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    if (!this.lastScreen) return
    ctx.viewport.panByScreen({
      x: input.screen.x - this.lastScreen.x,
      y: input.screen.y - this.lastScreen.y,
    })
    this.lastScreen = input.screen
  }

  onPointerUp(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0) return
    this.lastScreen = null
    ctx.setCursor("grab")
  }
}

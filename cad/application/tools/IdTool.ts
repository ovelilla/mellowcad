import { Vec2 } from "../../geometry/Vec2"
import { Vec3 } from "../../geometry/Vec3"
import { worldPointToUcs } from "../../domain/ucs"
import { formatLength } from "../../domain/units"
import { parseCoordinate } from "../input/coordinateInput"
import { PointerInput, Tool, ToolContext } from "./Tool"

/**
 * AutoCAD's ID: `Specify point`, then the point's X, Y and Z in the current
 * UCS at the command prompt. Picked with an object snap, the Z is the object's
 * there. AutoCAD also keeps it as LASTPOINT for the next `@`; there is no
 * global last point here yet, so it is only reported.
 */
export class IdTool implements Tool {
  readonly id = "id"

  private lastScreen: Vec2 | null = null

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    ctx.dynamicInput.open({
      fields: [{ id: "point", prompt: "idPoint", kind: "coordinate" }],
      commit: () => {},
      commitRaw: (commitCtx) => {
        const text = commitCtx.dynamicInput.getText("point").trim()
        if (text === "") {
          commitCtx.endCommand()
          return true
        }
        const point = parseCoordinate(text, {
          lastPoint: null,
          relativeByDefault: false,
          ucs: commitCtx.ucs,
          elevation: commitCtx.elevation,
        })
        if (!point) return false
        this.identify(point, commitCtx)
        return true
      },
    })
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  onDeactivate(ctx: ToolContext): void {
    ctx.dynamicInput.close()
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen
    ctx.dynamicInput.setPosition(input.screen)
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button === 0) this.identify(input.point, ctx)
  }

  wantsSnap(): boolean {
    return true
  }

  private identify(point: Vec3, ctx: ToolContext): void {
    const settings = ctx.document.getSettings()
    const local = worldPointToUcs(settings.ucs, point)
    const coordinate = (value: number) => formatLength(value, settings)
    ctx.report(
      ctx.text.message("idReport", {
        x: coordinate(local.x),
        y: coordinate(local.y),
        z: coordinate(local.z),
      })
    )
    ctx.endCommand()
  }
}

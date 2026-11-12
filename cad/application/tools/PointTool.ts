import { Vec2 } from "../../geometry/Vec2"
import { Vec3, cross3 } from "../../geometry/Vec3"
import { arbitraryAxis, worldToAxes } from "../../geometry/ocs"
import { createPoint } from "../../domain/entities"
import type { Ucs } from "../../domain/ucs"
import { formatLength } from "../../domain/units"
import type { PromptId } from "../../locales/types"
import { AddEntityCommand } from "../commands/entityCommands"
import { parseCoordinate } from "../input/coordinateInput"
import {
  withCurrentProperties,
  withCurrentThickness,
} from "./currentProperties"
import { PointerInput, Tool, ToolContext } from "./Tool"

/**
 * AutoCAD's POINT: `Current point modes:  PDMODE=0  PDSIZE=0.0000`, then
 * `Specify a point:`, which refuses Enter (`Invalid point.`) and asks again;
 * one point and the command ends (point/p01, p02). The ribbon's Multiple Points
 * runs it again and again (`*^C^C_point `). The point wears the current
 * properties and THICKNESS (point/p04) and lies in the UCS's plane, at the Z
 * picked or ELEVATION.
 */
export class PointTool implements Tool {
  readonly id = "point"
  readonly repeatsFromButton = true

  private lastScreen: Vec2 | null = null

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    const settings = ctx.document.getSettings()
    ctx.report(
      ctx.text.message("currentPointModes", {
        mode: String(settings.pointMode),
        size: formatLength(settings.pointSize, settings),
      })
    )
    ctx.dynamicInput.open({
      fields: [{ id: "point", prompt: "specifyAPoint", kind: "coordinate" }],
      commit: () => {},
      commitRaw: (commitCtx) => {
        if (!commitCtx.dynamicInput.hasTypedText()) {
          commitCtx.report(commitCtx.text.message("invalidPoint"), "error")
          return true
        }
        const point = parseCoordinate(
          commitCtx.dynamicInput.getText("point").trim(),
          {
            lastPoint: commitCtx.lastPoint,
            relativeByDefault: false,
            ucs: commitCtx.ucs,
            elevation: commitCtx.elevation,
          }
        )
        if (!point) return false
        this.place(point, commitCtx)
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
    if (input.button === 0) this.place(input.point, ctx)
  }

  wantsSnap(): boolean {
    return true
  }

  question(): PromptId {
    return "specifyAPoint"
  }

  private place(point: Vec3, ctx: ToolContext): void {
    // AutoCAD stores in DXF 50 the angle from the UCS's X axis to the X of
    // the point's plane: drawn in UCS Z 30 it is 330° (point/p04).
    const angle = -ucsTurn(ctx.ucs)
    const made = createPoint(point, ctx.document.getCurrentLayerId(), angle)
    ctx.execute(
      new AddEntityCommand(
        withCurrentProperties(withCurrentThickness(made, ctx), ctx)
      )
    )
    ctx.endCommand()
  }
}

/** The UCS's X axis as an angle in the object coordinates of its plane. */
export function ucsTurn(ucs: Ucs): number {
  const axes = arbitraryAxis(cross3(ucs.xAxis, ucs.yAxis))
  if (!axes) return 0
  const x = worldToAxes(axes, ucs.xAxis)
  return Math.atan2(x.y, x.x)
}

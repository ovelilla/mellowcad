import { Vec2 } from "../../geometry/Vec2"
import { Vec3 } from "../../geometry/Vec3"
import { normalizeDegrees } from "../../geometry/primitives"
import { WORLD_UCS, worldDirectionToUcs } from "../../domain/ucs"
import { formatLength } from "../../domain/units"
import { parseCoordinate } from "../input/coordinateInput"
import { lookFrom } from "./viewPresets"
import {
  CommandOption,
  CommandOptionOutcome,
  PointerInput,
  Tool,
  ToolContext,
} from "./Tool"

type VPointState =
  | { readonly phase: "viewPoint" }
  | { readonly phase: "angleInPlane" }
  | { readonly phase: "angleFromPlane"; readonly inPlane: number }

/**
 * AutoCAD's -VPOINT, which VPOINT runs too (its Viewpoint Presets dialog is
 * not built): the current VIEWDIR (expressed in the UCS, as the variable is),
 * then a view point — the viewer looks from it back at the origin — or
 * Rotate's two angles. Input is in the WCS (WORLDVIEW 1), so the tool works
 * there. The view is fitted to the drawing's extents, and ZOOM Previous steps
 * back through it.
 */
export class VPointTool implements Tool {
  readonly id = "vpoint"
  readonly inWorld = true

  private state: VPointState = { phase: "viewPoint" }
  private lastScreen: Vec2 | null = null

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    const settings = ctx.document.getSettings()
    const { x, y, z } = worldDirectionToUcs(ctx.ucs, ctx.viewport.direction)
    const value = (n: number) => formatLength(n, settings)
    ctx.report(
      ctx.text.message("currentViewDirection", {
        x: value(x),
        y: value(y),
        z: value(z),
      })
    )
    this.askViewPoint(ctx)
  }

  onDeactivate(ctx: ToolContext): void {
    this.state = { phase: "viewPoint" }
    ctx.dynamicInput.close()
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen
    ctx.dynamicInput.setPosition(input.screen)
  }

  wantsSnap(): boolean {
    return false
  }

  commandOptions(): readonly CommandOption[] {
    return this.state.phase === "viewPoint" ? [{ id: "Rotate" }] : []
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    if (this.state.phase !== "viewPoint" || id !== "Rotate") return "unhandled"
    this.askAngle("angleInPlane", ctx)
    return "continue"
  }

  private askViewPoint(ctx: ToolContext): void {
    this.state = { phase: "viewPoint" }
    ctx.dynamicInput.open({
      fields: [{ id: "point", prompt: "viewPoint", kind: "coordinate" }],
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
          ucs: WORLD_UCS,
          elevation: 0,
        })
        return point !== null && this.view(point, commitCtx)
      },
    })
    this.place(ctx)
  }

  private askAngle(phase: "angleInPlane" | "angleFromPlane", ctx: ToolContext) {
    const { x, y, z } = ctx.viewport.direction
    const inPlane = phase === "angleInPlane"
    ctx.dynamicInput.open({
      fields: [
        {
          id: "angle",
          prompt: inPlane ? "viewAngleInPlane" : "viewAngleFromPlane",
          kind: "angle",
        },
      ],
      commit: (values, commitCtx) => this.answer(values.angle, commitCtx),
    })
    ctx.dynamicInput.setLive(
      "angle",
      inPlane
        ? normalizeDegrees((Math.atan2(y, x) * 180) / Math.PI)
        : (Math.asin(Math.max(-1, Math.min(1, z))) * 180) / Math.PI
    )
    if (phase === "angleInPlane") this.state = { phase }
    this.place(ctx)
  }

  private answer(degrees: number, ctx: ToolContext): void {
    if (!Number.isFinite(degrees)) return
    if (this.state.phase === "angleInPlane") {
      this.state = { phase: "angleFromPlane", inPlane: degrees }
      this.askAngle("angleFromPlane", ctx)
      return
    }
    if (this.state.phase !== "angleFromPlane") return
    const theta = (this.state.inPlane * Math.PI) / 180
    const phi = (degrees * Math.PI) / 180
    this.view(
      {
        x: Math.cos(phi) * Math.cos(theta),
        y: Math.cos(phi) * Math.sin(theta),
        z: Math.sin(phi),
      },
      ctx
    )
  }

  private view(point: Vec3, ctx: ToolContext): boolean {
    if (!lookFrom(point, ctx)) return false
    ctx.report(ctx.text.message("regeneratingModel"))
    ctx.endCommand()
    return true
  }

  private place(ctx: ToolContext): void {
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }
}

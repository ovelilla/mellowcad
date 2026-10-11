import { Vec2 } from "../../geometry/Vec2"
import { Vec3 } from "../../geometry/Vec3"
import { normalizeDegrees } from "../../geometry/primitives"
import { WORLD_UCS, worldDirectionToUcs } from "../../domain/ucs"
import { formatLength } from "../../domain/units"
import { parseCoordinate } from "../input/coordinateInput"
import { lookFrom } from "./viewPresets"
import type { MessageValues } from "../../i18n/types"
import {
  CommandOption,
  CommandOptionOutcome,
  PointerInput,
  QuestionInput,
  Tool,
  ToolContext,
  ToolQuestion,
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
  /** VIEWDIR as the command reports it when it starts. */
  private direction: MessageValues = {}
  /** The current view's two angles, which Rotate's prompts offer. */
  private angles = { inPlane: 0, fromPlane: 0 }

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    const settings = ctx.document.getSettings()
    const { x, y, z } = worldDirectionToUcs(ctx.ucs, ctx.viewport.direction)
    const value = (n: number) => formatLength(n, settings)
    this.direction = { x: value(x), y: value(y), z: value(z) }
    const world = ctx.viewport.direction
    this.angles = {
      // Straight down the Z axis there is no heading; AutoCAD offers 270,
      // the plan's own (PLAN is VPOINT 270 / 90).
      inPlane:
        Math.hypot(world.x, world.y) < 1e-12
          ? 270
          : normalizeDegrees((Math.atan2(world.y, world.x) * 180) / Math.PI),
      fromPlane:
        (Math.asin(Math.max(-1, Math.min(1, world.z))) * 180) / Math.PI,
    }
    ctx.report(ctx.text.message("currentViewDirection", this.direction))
    this.askViewPoint(ctx)
  }

  /**
   * WHY no `<display compass and tripod>`: the compass is not built, so Enter
   * leaves the view as it is.
   */
  question(): ToolQuestion {
    switch (this.state.phase) {
      case "viewPoint":
        return { id: "specifyViewPointOr" }
      case "angleInPlane":
        return { id: "viewAngleInPlane", enter: { angle: this.angles.inPlane } }
      case "angleFromPlane":
        return {
          id: "viewAngleFromPlane",
          enter: { angle: this.angles.fromPlane },
        }
    }
  }

  /**
   * As AutoCAD 2023's console refuses them: a view point by reporting the
   * current direction again, an angle as one that a second point could give.
   */
  takes(): QuestionInput {
    return this.state.phase === "viewPoint"
      ? {
          refusal: ["invalidInputTryAgain", "currentViewDirection"],
          values: this.direction,
        }
      : {
          refusal: "requiresAngle",
          values: { points: "second", keyword: "no" },
        }
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
    ctx.dynamicInput.setDefault(
      "angle",
      inPlane ? this.angles.inPlane : this.angles.fromPlane
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

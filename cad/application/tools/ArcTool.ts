import { Vec2, V } from "../../geometry/Vec2"
import { Vec3 } from "../../geometry/Vec3"
import { arcFrom3Points } from "../../geometry/primitives"
import {
  ArcEntity,
  EntityId,
  createArc,
  onPlaneOf,
  withElevation,
  withNormal,
} from "../../domain/entities"
import { LayerId } from "../../domain/layers"
import { AddEntityCommand } from "../commands/entityCommands"
import { DynamicInputSession } from "../input/DynamicInput"
import type { PromptId } from "../../locales/types"
import {
  isCoordinateExpression,
  parseCoordinate,
} from "../input/coordinateInput"
import { ScenePrimitive } from "../../scene/types"
import { THEME } from "../../scene/theme"
import { entityScenePrimitive } from "../SceneBuilder"
import {
  CommandOption,
  CommandOptionOutcome,
  KeyInput,
  PointerInput,
  Tool,
  ToolContext,
  type QuestionInput,
} from "./Tool"
import {
  withCurrentProperties,
  withCurrentThickness,
} from "./currentProperties"
import { planeThrough } from "./threePointPlane"

/** The ghost's id, reused every frame so a preview burns no entity ids. */
const PREVIEW_ID = "arc-preview"

/**
 * How an arc is defined — the top of AutoCAD's ARC dropdown, each surfaced as
 * its own rail entry (a flyout):
 *
 * - `threePoint`: start, a point on the arc, then the end (the default ARC);
 * - `startCenterEnd`: start point, centre, then the end angle;
 * - `centerStartEnd`: centre, start point, then the end angle.
 *
 * All three collect three points; only the interpretation differs, so one class
 * parameterised by {@link ArcMode} covers them.
 */
export type ArcMode = "threePoint" | "startCenterEnd" | "centerStartEnd"

type ArcToolState =
  | { readonly phase: "p1" }
  | { readonly phase: "p2"; readonly p1: Vec3; readonly cursor: Vec3 }
  | {
      readonly phase: "p3"
      readonly p1: Vec3
      readonly p2: Vec3
      readonly cursor: Vec3
    }

/**
 * The arc tool — AutoCAD's ARC. One class parameterised by {@link ArcMode},
 * registered once per mode; the start point's and the second point's
 * `[Center]` switch the mode actually running. It never mutates the document:
 * the finished arc is submitted as an {@link AddEntityCommand}, so it is
 * undoable, and the command ends the moment the arc is defined (ARC is
 * single-shot in AutoCAD).
 */
export class ArcTool implements Tool {
  readonly id: string
  readonly shortcut?: string

  private readonly mode: ArcMode
  /** The mode actually running: `[Center]` switches it. */
  private active: ArcMode
  private state: ArcToolState = { phase: "p1" }
  private lastScreen: Vec2 | null = null
  /**
   * Ctrl held at the end point of a centre mode: the arc runs clockwise,
   * "hold Ctrl to switch direction".
   */
  private reversed = false

  constructor(mode: ArcMode, id: string, shortcut?: string) {
    this.mode = mode
    this.active = mode
    this.id = id
    this.shortcut = shortcut
  }

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    ctx.selection.clear()
    this.active = this.mode
    this.state = { phase: "p1" }
    this.openPointInput(ctx, this.promptFor("p1"))
  }

  onDeactivate(ctx: ToolContext): void {
    this.active = this.mode
    this.state = { phase: "p1" }
    ctx.dynamicInput.close()
  }

  /**
   * The end point's Angle and chord Length, and the second point's End, are
   * not offered, so those questions go without the `or` that introduces them.
   */
  question(): PromptId {
    switch (this.state.phase) {
      case "p1":
        return this.active === "centerStartEnd"
          ? "specifyCenterPointOfArc"
          : "specifyStartPointOfArcOr"
      case "p2":
        return this.active === "threePoint"
          ? "specifySecondPointOfArcOr"
          : this.active === "startCenterEnd"
            ? "specifyCenterPointOfArc"
            : "specifyStartPointOfArc"
      case "p3":
        return this.active === "threePoint"
          ? "specifyEndPointOfArc"
          : "specifyEndPointOfArcCtrl"
    }
  }

  /** Every point after the first is a 2D one, as AutoCAD's console refuses it. */
  takes(): QuestionInput | null {
    return this.state.phase === "p1" ? null : "point2d"
  }

  commandOptions(): readonly CommandOption[] {
    const center =
      (this.state.phase === "p1" && this.active !== "centerStartEnd") ||
      (this.state.phase === "p2" && this.active === "threePoint")
    return center ? [{ id: "Center" }] : []
  }

  /**
   * `[Center]` at the start point asks for the centre first (Center, Start,
   * End); after the start point, for the centre next (Start, Center, End).
   */
  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    if (id !== "Center" || this.commandOptions().length === 0) {
      return "unhandled"
    }
    this.active =
      this.state.phase === "p1" ? "centerStartEnd" : "startCenterEnd"
    this.openPointInput(ctx, this.promptFor(this.state.phase))
    ctx.requestRender()
    return "continue"
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen
    this.reversed = input.ctrlKey
    if (this.state.phase !== "p1") {
      this.state = { ...this.state, cursor: input.point }
    }
    ctx.dynamicInput.setPosition(input.screen)
    ctx.requestRender()
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0) return
    this.reversed = input.ctrlKey
    this.advanceWithPoint(input.point, ctx, input.screen)
  }

  /**
   * Advances the point phases with a resolved world point, shared by the click
   * path and the typed-coordinate path so both behave identically.
   */
  private advanceWithPoint(point: Vec3, ctx: ToolContext, screen?: Vec2): void {
    const at = screen ?? this.lastScreen ?? ctx.viewport.worldToScreen(point)

    switch (this.state.phase) {
      case "p1":
        this.state = { phase: "p2", p1: point, cursor: point }
        this.openPointInput(ctx, this.promptFor("p2"), at)
        break
      case "p2":
        this.state = {
          phase: "p3",
          p1: this.state.p1,
          p2: point,
          cursor: point,
        }
        this.openPointInput(ctx, this.promptFor("p3"), at)
        break
      case "p3":
        this.commit(this.state.p1, this.state.p2, point, ctx)
        return
    }
    ctx.requestRender()
  }

  onKeyDown(input: KeyInput, ctx: ToolContext): void {
    if (input.key === "Escape") {
      this.state = { phase: "p1" }
      ctx.dynamicInput.close()
      ctx.requestRender()
    }
  }

  getConstraintAnchor(): Vec2 | null {
    switch (this.state.phase) {
      case "p2":
        return this.state.p1
      case "p3":
        // The end point is measured from the arc's centre in the centre modes,
        // and from the mid point in the three-point mode.
        return this.active === "threePoint"
          ? this.state.p2
          : this.centerOf(this.state.p1, this.state.p2)
      default:
        return null
    }
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    const { viewport } = ctx
    const rubber = { color: THEME.rubberBand, width: 1 }

    switch (this.state.phase) {
      case "p2":
        return [
          {
            kind: "segment",
            a: viewport.worldToScreen(this.state.p1),
            b: viewport.worldToScreen(this.state.cursor),
            stroke: rubber,
          },
        ]
      case "p3": {
        const { p1, p2, cursor } = this.state
        const arc = this.arcFor(
          p1,
          p2,
          cursor,
          ctx.document.getCurrentLayerId(),
          PREVIEW_ID
        )
        const out: ScenePrimitive[] = []
        // In the centre modes a spoke from the centre to the cursor shows the
        // end angle being swept.
        if (this.active !== "threePoint") {
          out.push({
            kind: "segment",
            a: viewport.worldToScreen(this.centerOf(p1, p2)),
            b: viewport.worldToScreen(cursor),
            stroke: rubber,
          })
        }
        if (arc) out.push(...entityScenePrimitive(viewport, arc, rubber))
        return out
      }
      default:
        return []
    }
  }

  /** The centre point of a centre mode, in the plane of the first point. */
  private centerOf(p1: Vec3, p2: Vec3): Vec3 {
    // startCenterEnd: p2 is the centre; centerStartEnd: p1 is the centre.
    return this.active === "startCenterEnd" ? { ...p2, z: p1.z } : p1
  }

  /**
   * The arc defined by the three points, per mode — or `null` when it is
   * degenerate (collinear three-point, or a zero-radius centre mode).
   */
  private solve(
    p1: Vec2,
    p2: Vec2,
    p3: Vec2
  ): {
    center: Vec2
    radius: number
    startAngle: number
    endAngle: number
  } | null {
    if (this.active === "threePoint") {
      return arcFrom3Points(p1, p2, p3)
    }
    // Centre modes: (centre, start, end) triplet resolved per mode.
    const center = this.active === "startCenterEnd" ? p2 : p1
    const start = this.active === "startCenterEnd" ? p1 : p2
    const arc = arcFromCenterStartEnd(center, start, p3)
    // Clockwise is counter-clockwise from the end back to the start.
    return arc && this.reversed
      ? { ...arc, startAngle: arc.endAngle, endAngle: arc.startAngle }
      : arc
  }

  /**
   * The arc the three points make: by three points, in their own plane when
   * they are at different heights, as AutoCAD's is; in a centre mode, in the
   * UCS plane through the first point. `null` when degenerate.
   */
  private arcFor(
    p1: Vec3,
    p2: Vec3,
    p3: Vec3,
    layerId: LayerId,
    id?: EntityId
  ): ArcEntity | null {
    const plane = this.active === "threePoint" ? planeThrough(p1, p2, p3) : null
    const solved = plane
      ? arcFrom3Points(plane.points[0], plane.points[1], plane.points[2])
      : this.solve(p1, p2, p3)
    if (!solved || !(solved.radius > 0)) return null
    const arc = createArc(
      solved.center,
      solved.radius,
      solved.startAngle,
      solved.endAngle,
      layerId,
      id
    )
    return plane
      ? withNormal(withElevation(arc, plane.points[0].z), plane.normal)
      : onPlaneOf(arc, p1)
  }

  private commit(p1: Vec3, p2: Vec3, p3: Vec3, ctx: ToolContext): void {
    const arc = this.arcFor(p1, p2, p3, ctx.document.getCurrentLayerId())
    if (!arc) return // degenerate — keep prompting
    ctx.execute(
      new AddEntityCommand(
        withCurrentProperties(withCurrentThickness(arc, ctx), ctx)
      )
    )
    ctx.endCommand()
  }

  private promptFor(phase: "p1" | "p2" | "p3"): PromptId {
    const prompts: Record<ArcMode, [PromptId, PromptId, PromptId]> = {
      threePoint: ["startPoint", "secondPoint", "endPoint"],
      startCenterEnd: ["startPoint", "centerPoint", "endPoint"],
      centerStartEnd: ["centerPoint", "startPoint", "endPoint"],
    }
    const index = phase === "p1" ? 0 : phase === "p2" ? 1 : 2
    return prompts[this.active][index]
  }

  /**
   * Opens a coordinate session for a point phase. Clicking places the point;
   * typing an AutoCAD coordinate (e.g. `50,20`, `@30,0`, `100<45`) and pressing
   * Enter places it precisely.
   */
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

  private commitTypedPoint(ctx: ToolContext): boolean {
    const text = ctx.dynamicInput.getText("point").trim()
    if (!isCoordinateExpression(text)) return false

    const last = this.previousPoint()
    const point = parseCoordinate(text, {
      lastPoint: last ?? ctx.lastPoint,
      relativeByDefault: last !== null,
      ucs: ctx.ucs,
      elevation: ctx.elevation,
    })
    if (!point) return false
    this.advanceWithPoint(point, ctx)
    return true
  }

  /** The point a relative coordinate is measured from, per phase. */
  private previousPoint(): Vec3 | null {
    switch (this.state.phase) {
      case "p2":
        return this.state.p1
      case "p3":
        return this.state.p2
      default:
        return null
    }
  }
}

/**
 * The arc through `start` that turns about `center` until it reaches the ray to
 * `end` — AutoCAD's Start/Center/End family. The radius comes from the start
 * point; the end point only supplies the angle to stop at, and the sweep is
 * always CCW (the tool's invariant). `null` for a zero radius.
 */
function arcFromCenterStartEnd(
  center: Vec2,
  start: Vec2,
  end: Vec2
): {
  center: Vec2
  radius: number
  startAngle: number
  endAngle: number
} | null {
  const radius = V.distance(center, start)
  if (!(radius > 0)) return null
  const startAngle = Math.atan2(start.y - center.y, start.x - center.x)
  const endAngle = Math.atan2(end.y - center.y, end.x - center.x)
  return { center, radius, startAngle, endAngle }
}

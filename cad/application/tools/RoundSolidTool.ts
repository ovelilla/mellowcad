import { V, Vec2 } from "../../geometry/Vec2"
import {
  Vec3,
  add3,
  cross3,
  dot3,
  length3,
  normalize3,
  scale3,
  sub3,
} from "../../geometry/Vec3"
import { arbitraryAxis } from "../../geometry/ocs"
import {
  TangentTarget,
  circlesTangentToBoth,
  nearestToPicks,
} from "../../geometry/primitives"
import {
  ConePrimitive,
  CylinderPrimitive,
  Entity,
  SolidPrimitive,
  SpherePrimitive,
  TorusPrimitive,
  createSolid,
  entityElevation,
  readsInPlan,
} from "../../domain/entities"
import {
  ucsDirectionToWorld,
  ucsPointToWorld,
  worldPointToUcs,
} from "../../domain/ucs"
import { formatLength, parseNumber } from "../../domain/units"
import { AddEntityCommand } from "../commands/entityCommands"
import {
  isCoordinateExpression,
  parseCoordinate,
} from "../input/coordinateInput"
import { ScenePrimitive } from "../../scene/types"
import { SnapType } from "../snapping/types"
import { entityScenePrimitive } from "../SceneBuilder"
import type { MessageId } from "../EngineText"
import type { PromptId } from "../../locales/types"
import {
  CommandOption,
  CommandOptionOutcome,
  KeyInput,
  PointerInput,
  QuestionInput,
  Tool,
  ToolContext,
  ToolQuestion,
} from "./Tool"
import { currentColor, withCurrentProperties } from "./currentProperties"
import {
  SolidDefaults,
  resetSolidDefaults,
  solidDefaults,
} from "./solidDefaults"

/**
 * The solid CYLINDER makes, or CONE, which asks the same and a top radius;
 * SPHERE and TORUS, which ask their centre as these ask a base.
 */
export type RoundKind = "cylinder" | "cone" | "sphere" | "torus"

/**
 * The base as given, in the UCS: its centre, the plane's normal, the way to
 * its seam, its radius that way and across (an ellipse's), and whether its
 * plane is the UCS's XY's. A sphere's centre and radius; a torus' ring, its
 * radius negative for a lemon or an apple.
 */
interface Base {
  readonly center: Vec3
  readonly normal: Vec3
  readonly xAxis: Vec3
  readonly radius: number
  readonly radiusY: number | null
  readonly level: boolean
}

/** An object picked for Ttr, and where: the solution touching nearest wins. */
interface Tangency {
  readonly target: TangentTarget
  readonly pick: Vec2
  readonly z: number
}

type State =
  | { readonly phase: "center" | "ellipseFirst" | "ellipseCenter" }
  | { readonly phase: "tangentFirst" }
  | { readonly phase: "tangentSecond"; readonly first: Tangency }
  | {
      readonly phase: "ttrRadius"
      readonly first: Tangency
      readonly second: Tangency
    }
  | {
      readonly phase: "radius" | "diameter" | "ellipseDistance"
      readonly center: Vec3
      readonly cursor: Vec3
    }
  /** 3P's, 2P's and the ellipse's points so far. */
  | {
      readonly phase: "threePoint" | "twoPoint" | "ellipseOther"
      readonly points: readonly Vec3[]
      readonly cursor: Vec3
    }
  | {
      readonly phase: "ellipseSecond"
      readonly center: Vec3
      readonly half: number
      readonly cursor: Vec3
    }
  /** `top` is CONE's top radius once Top radius has given one. */
  | {
      readonly phase: "height" | "twoFirst" | "axis" | "top"
      readonly base: Base
      readonly top: number | null
      readonly cursor: Vec3
    }
  | {
      readonly phase: "twoSecond"
      readonly base: Base
      readonly top: number | null
      readonly first: Vec3
      readonly cursor: Vec3
    }
  /** TORUS's tube, measured from `ring`, the point of its ring last given. */
  | {
      readonly phase: "tube" | "tubeDiameter" | "tubeFirst"
      readonly base: Base
      readonly ring: Vec3
      readonly cursor: Vec3
    }
  | {
      readonly phase: "tubeSecond"
      readonly base: Base
      readonly ring: Vec3
      readonly first: Vec3
      readonly cursor: Vec3
    }

const PREVIEW_ID = "round-preview"
const UCS_Z: Vec3 = { x: 0, y: 0, z: 1 }
const UCS_X: Vec3 = { x: 1, y: 0, z: 0 }

/**
 * AutoCAD's CYLINDER and CONE, as 2027's console asks them (solid/c01–c15,
 * k01–k07, v05): `Specify center point of base or [3P/2P/Ttr/Elliptical]:`,
 * `Specify base radius or [Diameter]:` and `Specify height or [2Point/Axis
 * endpoint]:`, CONE's with `/Top radius]`. 3P makes the base through three
 * points, in their plane; 2P on a diameter in the first's plane; Ttr tangent
 * to two lines, circles or arcs; Elliptical on two axes, the second's point
 * giving its way and size, the first square to it. The seam, where ACIS
 * starts the base round, is the UCS's X, the second axis' way, or — for a
 * base tilted by 3P or by Axis endpoint — the arbitrary axis' −X of the plane
 * in UCS terms, an ellipse's Y (c12, c14, c15). The radius, the height and the
 * top radius are the primitives' shared defaults ({@link SolidDefaults}).
 *
 * SPHERE and TORUS (solid/h01–h05, r01–r09) ask `Specify center point or
 * [3P/2P/Ttr]:` and `Specify radius or [Diameter]:`: 3P puts a sphere's
 * centre at their circle's, 2P on the diameter between them in space; a
 * torus lies in 3P's plane, its normal their turn (r05), and asks `Specify
 * tube radius or [2Point/Diameter]:` from the ring's point last given.
 */
export class RoundSolidTool implements Tool {
  readonly id: RoundKind

  private state: State = { phase: "center" }
  private lastScreen: Vec2 | null = null

  constructor(
    private readonly kind: RoundKind,
    private readonly defaults: SolidDefaults = solidDefaults()
  ) {
    this.id = kind
  }

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    ctx.selection.clear()
    this.state = { phase: "center" }
    this.openPoint(ctx)
  }

  onDeactivate(ctx: ToolContext): void {
    this.state = { phase: "center" }
    ctx.dynamicInput.close()
  }

  onNewDrawing(): void {
    resetSolidDefaults(this.defaults)
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen
    const state = this.state
    if ("cursor" in state) this.state = { ...state, cursor: input.point }
    ctx.dynamicInput.setPosition(input.screen)
    ctx.requestRender()
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0) return
    const state = this.state
    if (state.phase === "tangentFirst" || state.phase === "tangentSecond") {
      this.takeTangent(input.world, ctx)
      return
    }
    if (state.phase === "ttrRadius") return
    this.takePoint(input.point, ctx)
  }

  onKeyDown(input: KeyInput, ctx: ToolContext): void {
    if (input.key === "Escape") {
      this.state = { phase: "center" }
      ctx.dynamicInput.close()
      ctx.requestRender()
    }
  }

  question(): PromptId | ToolQuestion {
    const state = this.state
    const { radius, height, topRadius, tubeRadius } = this.defaults
    const sized = (id: PromptId, value: number | null) =>
      value === null ? id : { id, enter: value }
    const twice = (value: number | null) => (value === null ? null : value * 2)
    switch (state.phase) {
      case "center":
        return this.round ? "roundBaseCenterOr" : "sphereCenterOr"
      case "radius":
        return sized(
          this.round ? "specifyBaseRadiusOr" : "specifyRadiusOr",
          radius
        )
      case "diameter":
        return sized(
          this.kind === "torus" ? "torusDiameter" : "specifyDiameter",
          twice(radius)
        )
      case "tube":
        return sized("tubeRadiusOr", tubeRadius)
      case "tubeDiameter":
        // Before any tube, `<0.0000>` once a diameter was given (r08).
        return sized(
          "tubeDiameter",
          twice(tubeRadius ?? (this.defaults.diameterGiven ? 0 : null))
        )
      case "tubeFirst":
        return "specifyFirstPoint"
      case "tubeSecond":
        return "specifySecondPoint"
      case "threePoint":
        return (
          [
            "specifyFirstPoint",
            "specifySecondPoint",
            "specifyThirdPoint",
          ] as const
        )[state.points.length]
      case "twoPoint":
        return state.points.length === 0
          ? "firstEndOfDiameter"
          : "secondEndOfDiameter"
      case "tangentFirst":
        return "firstTangentPoint"
      case "tangentSecond":
        return "secondTangentPoint"
      case "ttrRadius":
        return sized("specifyRadiusOfCircleTtr", radius)
      case "ellipseFirst":
        return "firstAxisEndpointOr"
      case "ellipseOther":
        return "otherFirstAxisEndpoint"
      case "ellipseCenter":
        return "specifyCenterPoint"
      case "ellipseDistance":
        return "distanceToFirstAxis"
      case "ellipseSecond":
        return "secondAxisEndpoint"
      case "height":
        return sized(
          this.kind === "cone" && state.top === null
            ? "solidHeightTopOr"
            : "solidHeightOr",
          height
        )
      case "twoFirst":
        return "specifyFirstPoint"
      case "twoSecond":
        return "specifySecondPoint"
      case "axis":
        return "specifyAxisEndpoint"
      case "top":
        return { id: "specifyTopRadius", enter: topRadius }
    }
  }

  /** The words each prompt refuses `FOO` with (c03, c06, c07, c08, k04, v05). */
  takes(): QuestionInput | null {
    const distance = (keyword: "yes" | "no", points = "second") => ({
      refusal: "requiresDistance" as const,
      values: { points, keyword },
    })
    switch (this.state.phase) {
      case "center":
      case "threePoint":
      case "twoPoint":
      case "ellipseFirst":
      case "ellipseOther":
      case "ellipseCenter":
      case "ellipseSecond":
      case "twoFirst":
      case "twoSecond":
      case "axis":
      case "tubeFirst":
      case "tubeSecond":
        return { refusal: "pointOrKeywordRequired" }
      case "tangentFirst":
      case "tangentSecond":
        return { refusal: "solidTangentRequired", values: { typed: "no" } }
      case "radius":
      case "diameter":
      case "ellipseDistance":
      case "height":
      case "tube":
      case "tubeDiameter":
        return distance("yes")
      case "top":
        return distance(this.kind === "cone" ? "yes" : "no")
      case "ttrRadius":
        return distance("no", "two")
    }
  }

  commandOptions(): readonly CommandOption[] {
    const state = this.state
    switch (state.phase) {
      case "center":
        return this.round
          ? [{ id: "3P" }, { id: "2P" }, { id: "Ttr" }, { id: "Elliptical" }]
          : [{ id: "3P" }, { id: "2P" }, { id: "Ttr" }]
      case "radius":
        return [{ id: "Diameter" }]
      case "tube":
        return [{ id: "2Point" }, { id: "Diameter" }]
      case "ellipseFirst":
        return [{ id: "Center" }]
      case "height": {
        const shown =
          this.kind === "cone" && state.top === null
            ? [{ id: "2Point" }, { id: "Axis" }, { id: "Top" }]
            : [{ id: "2Point" }, { id: "Axis" }]
        // CYLINDER's height declares Center, which asks the axis endpoint
        // (c13); CONE's keeps Top after its top radius (k02).
        const hidden =
          this.kind === "cylinder"
            ? [{ id: "Center", hidden: true }]
            : state.top !== null
              ? [{ id: "Top", hidden: true }]
              : []
        return [...shown, ...hidden]
      }
      default:
        return []
    }
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    const state = this.state
    const go = (next: State, open: "point" | "distance" | "tangent") => {
      this.state = next
      if (open === "point") this.openPoint(ctx)
      else if (open === "distance") this.openDistance(ctx)
      else this.openTangent(ctx)
      return "continue" as const
    }
    switch (state.phase) {
      case "center":
        if (id === "3P") {
          return go({ phase: "threePoint", points: [], cursor: UCS_Z }, "point")
        }
        if (id === "2P") {
          return go({ phase: "twoPoint", points: [], cursor: UCS_Z }, "point")
        }
        if (id === "Ttr") return go({ phase: "tangentFirst" }, "tangent")
        if (id === "Elliptical" && this.round) {
          return go({ phase: "ellipseFirst" }, "point")
        }
        return "unhandled"
      case "radius":
        if (id !== "Diameter") return "unhandled"
        return go({ ...state, phase: "diameter" }, "distance")
      case "ellipseFirst":
        if (id !== "Center") return "unhandled"
        return go({ phase: "ellipseCenter" }, "point")
      case "height":
        if (id === "2Point") return go({ ...state, phase: "twoFirst" }, "point")
        if (id === "Axis" || (id === "Center" && this.kind === "cylinder")) {
          return go({ ...state, phase: "axis" }, "point")
        }
        if (id === "Top" && this.kind === "cone") {
          return go({ ...state, phase: "top" }, "distance")
        }
        return "unhandled"
      case "tube":
        if (id === "2Point") {
          return go({ ...state, phase: "tubeFirst" }, "point")
        }
        if (id === "Diameter") {
          return go({ ...state, phase: "tubeDiameter" }, "distance")
        }
        return "unhandled"
      default:
        return "unhandled"
    }
  }

  /** Ttr's radius and the distances measure their own picks but Ttr's, which the runtime measures. */
  wantsSnap(): boolean {
    return this.state.phase !== "ttrRadius"
  }

  /** Ttr's objects are picked as under TAN (desktop circle/d03, as CIRCLE's). */
  impliedSnap(): SnapType.Tangent | null {
    const { phase } = this.state
    return phase === "tangentFirst" || phase === "tangentSecond"
      ? SnapType.Tangent
      : null
  }

  /** A Tangent on a line, circle or arc at Ttr's picks is worked out here. */
  defersSnap(
    kind: SnapType.Tangent | SnapType.Perpendicular,
    entity: Entity | null
  ): boolean {
    const { phase } = this.state
    if (phase !== "tangentFirst" && phase !== "tangentSecond") return false
    return (
      kind === SnapType.Tangent && !!entity && tangentTarget(entity) !== null
    )
  }

  snapMarker(
    kind: SnapType.Tangent | SnapType.Perpendicular,
    entity: Entity
  ): "deferred" | "plain" | null {
    return this.defersSnap(kind, entity) ? "deferred" : null
  }

  /** The base its prompt measures from, in the frame (its points are kept in the UCS). */
  getConstraintAnchor(ctx: ToolContext): Vec3 | null {
    const anchor = this.anchorInUcs(ctx)
    return anchor ? ucsPointToWorld(ctx.ucs, anchor) : null
  }

  private anchorInUcs(ctx: ToolContext): Vec3 | null {
    const state = this.state
    switch (state.phase) {
      case "radius":
      case "diameter":
      case "ellipseDistance":
      case "ellipseSecond":
        return state.center
      case "threePoint":
      case "twoPoint":
      case "ellipseOther":
        return state.points.at(-1) ?? null
      case "height":
      case "axis":
        return state.base.center
      case "top":
        return this.topFrom(state.base, state.cursor, ctx)
      case "twoSecond":
      case "tubeSecond":
        return state.first
      case "tube":
      case "tubeDiameter":
        return state.ring
      default:
        return null
    }
  }

  /** The base as the cursor sizes it, then the solid as it rises. */
  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    const state = this.state
    const stroke = { color: currentColor(ctx), width: 1 }
    const ghost = (base: Base | null, height: number, top: number | null) => {
      if (!base || !(height > 0)) return []
      if (this.kind === "torus" && base.radius + height <= 0) return []
      const primitive = this.round
        ? this.primitive(base, top, { height }, ctx)
        : this.ballPrimitive(base, height, ctx)
      return primitive
        ? entityScenePrimitive(
            ctx.viewport,
            createSolid(
              primitive,
              ctx.document.getCurrentLayerId(),
              PREVIEW_ID
            ),
            stroke,
            { isolines: ctx.document.getSettings().isolines }
          )
        : []
    }
    const cursor = "cursor" in state ? state.cursor : null
    const reach = (from: Vec3) =>
      cursor ? this.distanceTo(from, worldPointToUcs(ctx.ucs, cursor)) : 0
    switch (state.phase) {
      case "height":
      case "axis":
        return ghost(state.base, reach(state.base.center), state.top)
      case "radius":
      case "diameter": {
        if (this.kind !== "sphere") return []
        const size = reach(state.center) / (state.phase === "diameter" ? 2 : 1)
        return ghost(this.levelBase(state.center, size), size, null)
      }
      case "tube":
      case "tubeDiameter":
        return ghost(
          state.base,
          reach(state.ring) / (state.phase === "tubeDiameter" ? 2 : 1),
          null
        )
      case "tubeSecond":
        return ghost(state.base, reach(state.first), null)
      default:
        return []
    }
  }

  /** CYLINDER's and CONE's: a base, rising. */
  private get round(): boolean {
    return this.kind === "cylinder" || this.kind === "cone"
  }

  private distanceTo(from: Vec3, to: Vec3): number {
    return length3(sub3(to, from))
  }

  /** A base in the plane through `center` parallel to the UCS's XY, its seam the UCS's X. */
  private levelBase(
    center: Vec3,
    radius: number,
    radiusY: number | null = null,
    xAxis: Vec3 = UCS_X
  ): Base {
    return { center, normal: UCS_Z, xAxis, radius, radiusY, level: true }
  }

  private takePoint(point: Vec3, ctx: ToolContext): void {
    const state = this.state
    const at = worldPointToUcs(ctx.ucs, point)
    switch (state.phase) {
      case "center":
        this.state = { phase: "radius", center: at, cursor: point }
        this.openDistance(ctx)
        return
      case "radius":
      case "diameter":
        this.takeRadius(
          this.distanceTo(state.center, at) /
            (state.phase === "diameter" ? 2 : 1),
          ctx,
          at
        )
        return
      case "tube":
      case "tubeDiameter":
        this.takeTube(
          this.distanceTo(state.ring, at) /
            (state.phase === "tubeDiameter" ? 2 : 1),
          ctx
        )
        return
      case "tubeFirst":
        this.state = { ...state, phase: "tubeSecond", first: at }
        this.openPoint(ctx)
        return
      case "tubeSecond":
        this.takeTube(this.distanceTo(state.first, at), ctx)
        return
      case "threePoint":
        this.takeThreePoint(at, ctx)
        return
      case "twoPoint":
        this.takeTwoPoint(at, ctx)
        return
      case "ellipseFirst":
        this.state = { phase: "ellipseOther", points: [at], cursor: point }
        this.openPoint(ctx)
        return
      case "ellipseOther": {
        // A first axis of no length is taken; every second axis is then
        // refused (c07).
        const [first] = state.points
        const center = V.lerp(first, at, 0.5)
        this.state = {
          phase: "ellipseSecond",
          center: { ...center, z: first.z },
          half: V.distance(first, at) / 2,
          cursor: point,
        }
        this.openPoint(ctx)
        return
      }
      case "ellipseCenter":
        this.state = { phase: "ellipseDistance", center: at, cursor: point }
        this.openDistance(ctx)
        return
      case "ellipseDistance":
        this.takeEllipseDistance(this.distanceTo(state.center, at), ctx)
        return
      case "ellipseSecond":
        this.takeSecondAxis(at, ctx)
        return
      case "height":
        this.takeHeight(this.distanceTo(state.base.center, at), ctx)
        return
      case "twoFirst":
        this.state = { ...state, phase: "twoSecond", first: at }
        this.openPoint(ctx)
        return
      case "twoSecond":
        this.takeHeight(this.distanceTo(state.first, at), ctx)
        return
      case "axis":
        if (this.distanceTo(state.base.center, at) === 0) {
          ctx.report(ctx.text.message("boxValueNonzero"), "error")
          return
        }
        this.commit(state.base, state.top, { axis: at }, ctx)
        return
      case "top":
        this.takeTop(
          this.distanceTo(this.topFrom(state.base, state.cursor, ctx), at),
          ctx
        )
        return
      default:
        return
    }
  }

  /**
   * `Value must be positive and nonzero.` for none (c06, h03); a torus'
   * `Value must be nonzero.`, its negative one a lemon's or an apple's (r03).
   * The ring's point is `toward`'s way, the cursor's when typed (r01, r02).
   */
  private takeRadius(radius: number, ctx: ToolContext, toward?: Vec3): void {
    const state = this.state
    if (state.phase !== "radius" && state.phase !== "diameter") return
    if (this.kind === "torus" ? radius === 0 : !(radius > 0)) {
      ctx.report(
        ctx.text.message(
          this.kind === "torus" ? "valueMustBeNonzero" : "positiveNonzero"
        ),
        "error"
      )
      return
    }
    if (state.phase === "diameter" && this.kind !== "torus") {
      this.defaults.diameterGiven = true
    }
    const base = this.levelBase(state.center, radius)
    const way = toward ?? worldPointToUcs(ctx.ucs, state.cursor)
    this.askRest(base, ringPoint(base, way), ctx)
  }

  /** What follows the base: CYLINDER's and CONE's height, TORUS's tube; a sphere is made. */
  private askRest(base: Base, ring: Vec3, ctx: ToolContext): void {
    if (this.kind === "sphere") {
      this.defaults.radius = base.radius
      this.commitPrimitive(this.ballPrimitive(base, 0, ctx), ctx)
      return
    }
    if (this.kind === "torus") {
      // A negative radius is no default (r03, r05).
      if (base.radius > 0) this.defaults.radius = base.radius
      this.state = {
        phase: "tube",
        base,
        ring,
        cursor: ucsPointToWorld(ctx.ucs, ring),
      }
      this.openDistance(ctx)
      return
    }
    this.askHeight(base, ctx)
  }

  /**
   * The tube: `Value must be positive and nonzero.` for none, and round a
   * negative ring no thinner than its radius' size, `If torus radius is
   * -5.0000, tube radius must be greater than 5.0000.`, which asks it again
   * (r03, r06, r07); 2Point's says that for none too, whatever the ring (r09).
   */
  private takeTube(tube: number, ctx: ToolContext): void {
    const state = this.state
    if (
      state.phase !== "tube" &&
      state.phase !== "tubeDiameter" &&
      state.phase !== "tubeSecond"
    ) {
      return
    }
    const { base } = state
    if (!(tube > 0) && state.phase !== "tubeSecond") {
      ctx.report(ctx.text.message("positiveNonzero"), "error")
      return
    }
    if (!(tube > 0) || (base.radius < 0 && tube <= -base.radius)) {
      const settings = ctx.document.getSettings()
      ctx.report(
        ctx.text.message("torusTubeTooSmall", {
          radius: formatLength(base.radius, settings),
          minimum: formatLength(Math.abs(base.radius), settings),
        }),
        "error"
      )
      return
    }
    this.defaults.tubeRadius = tube
    this.commitPrimitive(this.ballPrimitive(base, tube, ctx), ctx)
  }

  /**
   * 3P's points: a second on the first or a third on their line is refused
   * and asked again (c08), SPHERE's and TORUS's second as coincident (h03,
   * r09); the base lies in their plane, level when that is the UCS's XY's
   * (c02, c15).
   */
  private takeThreePoint(at: Vec3, ctx: ToolContext): void {
    const state = this.state
    if (state.phase !== "threePoint") return
    const points = [...state.points, at]
    const [a, b] = points
    if (points.length === 2 && length3(sub3(b, a)) === 0) {
      ctx.report(
        ctx.text.message(this.round ? "pointsCollinear" : "pointsCoincident"),
        "error"
      )
      return
    }
    if (
      points.length === 3 &&
      length3(cross3(sub3(b, a), sub3(points[2], a))) === 0
    ) {
      ctx.report(ctx.text.message("pointsCollinear"), "error")
      return
    }
    if (points.length < 3) {
      this.state = { ...state, points }
      this.openPoint(ctx)
      return
    }
    const base = circleThrough(points[0], points[1], points[2])
    if (!base) return
    this.askRest(this.kind === "torus" ? turnedBy(base, points) : base, at, ctx)
  }

  /**
   * 2P's ends of a diameter, the second read in the first's plane: on the
   * first it is refused and asked again (c08, c02, r07). A sphere's are
   * points in space, its centre between them (h02, h03).
   */
  private takeTwoPoint(at: Vec3, ctx: ToolContext): void {
    const state = this.state
    if (state.phase !== "twoPoint") return
    if (state.points.length === 0) {
      this.state = { ...state, points: [at] }
      this.openPoint(ctx)
      return
    }
    const [first] = state.points
    const end = this.kind === "sphere" ? at : { ...at, z: first.z }
    const size = length3(sub3(end, first))
    if (size === 0) {
      ctx.report(ctx.text.message("pointsCoincident"), "error")
      return
    }
    const middle = scale3(add3(first, end), 0.5)
    this.askRest(this.levelBase(middle, size / 2), end, ctx)
  }

  /** Ttr's object: a line, a circle or an arc lying in the plane, else refused (c03). */
  private takeTangent(world: Vec2, ctx: ToolContext): void {
    const state = this.state
    if (state.phase !== "tangentFirst" && state.phase !== "tangentSecond") {
      return
    }
    const hit =
      ctx.snapOverride() === SnapType.Perpendicular ? null : ctx.pick(world)
    const target = hit ? tangentTarget(hit) : null
    if (!hit || !target) {
      ctx.report(
        ctx.text.message("solidTangentRequired", { typed: "yes" }),
        "error"
      )
      return
    }
    const tangency = { target, pick: world, z: entityElevation(hit) }
    if (state.phase === "tangentFirst") {
      this.state = { phase: "tangentSecond", first: tangency }
      this.openTangent(ctx)
      return
    }
    this.state = { phase: "ttrRadius", first: state.first, second: tangency }
    this.openDistance(ctx)
  }

  /**
   * Ttr's base of `radius` tangent to both objects, its tangent points
   * nearest the picks, at their height when they share one (CIRCLE's,
   * circle/p321); none says `Circle does not exist.` and ends (v05).
   */
  private takeTtrRadius(radius: number, ctx: ToolContext): void {
    const state = this.state
    if (state.phase !== "ttrRadius") return
    if (!(radius > 0)) {
      ctx.report(ctx.text.message("positiveNonzero"), "error")
      return
    }
    const { first, second } = state
    const best = nearestToPicks(
      circlesTangentToBoth(first.target, second.target, radius),
      [first.pick, second.pick],
      (fit) => [fit.touchFirst, fit.touchSecond]
    )
    if (!best) {
      ctx.report(ctx.text.message("circleDoesNotExist"), "error")
      this.state = { phase: "center" }
      ctx.endCommand()
      return
    }
    const z = Math.abs(first.z - second.z) < 1e-9 ? first.z : ctx.elevation
    const center = worldPointToUcs(ctx.ucs, { ...best.center, z })
    const base = this.levelBase(center, radius)
    // The ring's point along the UCS's X (r04).
    this.askRest(base, ringPoint(base, center), ctx)
  }

  /** `Value must be positive and nonzero.` for none (v05). */
  private takeEllipseDistance(half: number, ctx: ToolContext): void {
    const state = this.state
    if (state.phase !== "ellipseDistance") return
    if (!(half > 0)) {
      ctx.report(ctx.text.message("positiveNonzero"), "error")
      return
    }
    this.state = {
      phase: "ellipseSecond",
      center: state.center,
      half,
      cursor: state.cursor,
    }
    this.openPoint(ctx)
  }

  /**
   * The second axis' end: its way from the centre is the seam and its
   * distance the radius that way, the first axis' half length across (c04,
   * v05). With no length to either, `Ellipse axes lengths must be positive
   * and nonzero`, and asked again (c07).
   */
  private takeSecondAxis(at: Vec3, ctx: ToolContext): void {
    const state = this.state
    if (state.phase !== "ellipseSecond") return
    const way = { x: at.x - state.center.x, y: at.y - state.center.y, z: 0 }
    const reach = length3(way)
    if (!(reach > 0) || !(state.half > 0)) {
      ctx.report(ctx.text.message("ellipseAxesNonzero"), "error")
      return
    }
    this.askHeight(
      this.levelBase(state.center, reach, state.half, scale3(way, 1 / reach)),
      ctx
    )
  }

  private askHeight(base: Base, ctx: ToolContext): void {
    if (base.radiusY === null) this.defaults.radius = base.radius
    this.state = {
      phase: "height",
      base,
      top: null,
      cursor: ucsPointToWorld(ctx.ucs, base.center),
    }
    this.openDistance(ctx)
  }

  /** `Value must be nonzero.` for none (c06); a negative one runs back along the normal. */
  private takeHeight(height: number, ctx: ToolContext): void {
    const state = this.state
    if (state.phase !== "height" && state.phase !== "twoSecond") return
    if (height === 0) {
      ctx.report(ctx.text.message("boxValueNonzero"), "error")
      return
    }
    this.commit(state.base, state.top, { height }, ctx)
  }

  /** CONE's top radius; `Value must be positive.` below 0 (k04). */
  private takeTop(radius: number, ctx: ToolContext): void {
    const state = this.state
    if (state.phase !== "top") return
    if (radius < 0) {
      ctx.report(ctx.text.message("valueMustBePositive"), "error")
      return
    }
    this.defaults.topRadius = radius
    this.state = { ...state, phase: "height", top: radius }
    this.openDistance(ctx)
  }

  /**
   * Where a point at Top radius is measured from: the axis at the height the
   * cursor gave the ghost (the console's BasePoint, k02).
   */
  private topFrom(base: Base, cursor: Vec3, ctx: ToolContext): Vec3 {
    const center = ucsPointToWorld(ctx.ucs, base.center)
    const up = ucsDirectionToWorld(ctx.ucs, base.normal)
    return worldPointToUcs(
      ctx.ucs,
      add3(center, scale3(up, this.distanceTo(center, cursor)))
    )
  }

  /**
   * The solid on `base`: rising `height` along its normal, back when
   * negative, or to `axis`. A base tilted by its axis or by 3P turns its
   * seam to its plane's arbitrary axis in the UCS: a circle's −X, an
   * ellipse's Y (c12, c14); along the UCS's Z it keeps it (c15).
   */
  private primitive(
    base: Base,
    top: number | null,
    rise: { readonly height: number } | { readonly axis: Vec3 },
    ctx: ToolContext
  ): CylinderPrimitive | ConePrimitive | null {
    let normal = base.normal
    let xAxis = base.xAxis
    let height: number
    if ("axis" in rise) {
      const along = sub3(rise.axis, base.center)
      height = length3(along)
      const n = normalize3(along)
      if (!n) return null
      const level = Math.abs(n.x) < PLUMB && Math.abs(n.y) < PLUMB
      normal = n
      if (!level || !base.level) xAxis = seamOf(n, base.radiusY !== null)
      if (level && base.level && n.z < 0) normal = { x: 0, y: 0, z: -1 }
    } else {
      height = Math.abs(rise.height)
      if (rise.height < 0) normal = scale3(normal, -1)
      if (!base.level) xAxis = seamOf(base.normal, base.radiusY !== null)
    }
    const unit = (d: Vec3) => {
      const w = ucsDirectionToWorld(ctx.ucs, d)
      return scale3(w, 1 / length3(w))
    }
    const common = {
      position: ucsPointToWorld(ctx.ucs, base.center),
      xAxis: unit(xAxis),
      normal: unit(normal),
      radius: base.radius,
      ...(base.radiusY !== null ? { radiusY: base.radiusY } : {}),
      height,
    }
    return this.kind === "cylinder"
      ? { kind: "cylinder", ...common }
      : { kind: "cone", ...common, topRadius: top ?? 0 }
  }

  /**
   * A sphere of the base's radius or a torus round its ring with a `tube`.
   * A sphere's frame is the UCS's whatever gave it (h05's MPDUMP); a torus'
   * the ring's (r05).
   */
  private ballPrimitive(
    base: Base,
    tube: number,
    ctx: ToolContext
  ): SpherePrimitive | TorusPrimitive {
    const unit = (d: Vec3) => {
      const w = ucsDirectionToWorld(ctx.ucs, d)
      return scale3(w, 1 / length3(w))
    }
    const position = ucsPointToWorld(ctx.ucs, base.center)
    return this.kind === "sphere"
      ? {
          kind: "sphere",
          position,
          xAxis: unit(UCS_X),
          normal: unit(UCS_Z),
          radius: base.radius,
        }
      : {
          kind: "torus",
          position,
          xAxis: unit(base.xAxis),
          normal: unit(base.normal),
          radius: base.radius,
          tubeRadius: tube,
        }
  }

  private commit(
    base: Base,
    top: number | null,
    rise: { readonly height: number } | { readonly axis: Vec3 },
    ctx: ToolContext
  ): void {
    const primitive = this.primitive(base, top, rise, ctx)
    if (!primitive) return
    this.defaults.height = "height" in rise ? rise.height : primitive.height
    this.commitPrimitive(primitive, ctx)
  }

  private commitPrimitive(primitive: SolidPrimitive, ctx: ToolContext): void {
    const solid = createSolid(primitive, ctx.document.getCurrentLayerId())
    this.state = { phase: "center" }
    ctx.execute(new AddEntityCommand(withCurrentProperties(solid, ctx)))
    ctx.endCommand()
  }

  private openPoint(ctx: ToolContext): void {
    const question = this.question()
    const prompt = typeof question === "string" ? question : question.id
    ctx.dynamicInput.open({
      fields: [{ id: "point", prompt, kind: "coordinate" }],
      commit: () => {},
      commitRaw: (commitCtx) => this.commitTypedPoint(commitCtx),
    })
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }

  /**
   * Ttr's object prompts: a typed point or number picks no object — the
   * starred refusal — and a word or Enter the plain one (c03). A typed `_TAN`
   * and point are a pick there, which the runtime makes.
   */
  private openTangent(ctx: ToolContext): void {
    ctx.dynamicInput.open({
      fields: [{ id: "point", kind: "coordinate" }],
      commit: () => {},
      commitRaw: (commitCtx) => {
        const text = commitCtx.dynamicInput.getText("point").trim()
        const typed =
          text !== "" &&
          (isCoordinateExpression(text) || parseNumber(text) !== null)
        commitCtx.report(
          commitCtx.text.message("solidTangentRequired", {
            typed: typed ? "yes" : "no",
          }),
          "error"
        )
        return true
      },
      directDistance: "typed",
    })
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  /**
   * A distance's box: a number typed is the value, a coordinate a point, and
   * Enter takes the default or is refused as `FOO` is.
   */
  private openDistance(ctx: ToolContext): void {
    const question = this.question()
    const prompt = typeof question === "string" ? question : question.id
    // The tube diameter's `<0.0000>` before any tube is shown, not taken (r08).
    const enter =
      typeof question === "string" ||
      typeof question.enter !== "number" ||
      (this.state.phase === "tubeDiameter" && this.defaults.tubeRadius === null)
        ? null
        : question.enter
    ctx.dynamicInput.open({
      fields: [{ id: "value", prompt, kind: "distance" }],
      commit: (values, commitCtx) => {
        if (Number.isFinite(values.value))
          this.takeValue(values.value, commitCtx)
      },
      commitRaw: (commitCtx) => {
        if (commitCtx.dynamicInput.hasTypedText()) {
          return this.commitTypedPoint(commitCtx)
        }
        if (enter !== null) {
          this.takeValue(enter, commitCtx)
          return true
        }
        this.refuse(commitCtx)
        return true
      },
    })
    if (enter !== null) ctx.dynamicInput.setDefault("value", enter)
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }

  /** A typed radius, diameter, distance, height or top radius. */
  private takeValue(value: number, ctx: ToolContext): void {
    const state = this.state
    switch (state.phase) {
      case "radius":
        this.takeRadius(value, ctx)
        return
      case "diameter":
        this.takeRadius(value / 2, ctx)
        return
      case "ttrRadius":
        this.takeTtrRadius(value, ctx)
        return
      case "ellipseDistance":
        this.takeEllipseDistance(value, ctx)
        return
      case "height":
        this.takeHeight(value, ctx)
        return
      case "top":
        this.takeTop(value, ctx)
        return
      case "tube":
        this.takeTube(value, ctx)
        return
      case "tubeDiameter":
        this.takeTube(value / 2, ctx)
        return
    }
  }

  /** Enter where nothing is offered: refused as `FOO` is. */
  private refuse(ctx: ToolContext): void {
    const takes = this.takes()
    if (!takes || typeof takes !== "object") return
    const [id] =
      typeof takes.refusal === "string" ? [takes.refusal] : takes.refusal
    ctx.report(ctx.text.message(id as MessageId, takes.values ?? {}), "error")
  }

  /** A coordinate typed at any prompt is the point it names; Enter at a point is refused. */
  private commitTypedPoint(ctx: ToolContext): boolean {
    const field = ctx.dynamicInput.getActiveFieldId()
    const text = field === null ? "" : ctx.dynamicInput.getText(field).trim()
    if (!ctx.dynamicInput.hasTypedText()) {
      this.refuse(ctx)
      return true
    }
    if (!isCoordinateExpression(text)) return false
    const base = this.getConstraintAnchor(ctx)
    const point = parseCoordinate(text, {
      lastPoint: base ?? ctx.lastPoint,
      relativeByDefault: base !== null,
      ucs: ctx.ucs,
      elevation: ctx.elevation,
    })
    if (!point) return false
    this.takePoint(point, ctx)
    return true
  }
}

/** Under this, a normal's X and Y leave it along the UCS's Z. */
const PLUMB = 1e-10

/**
 * Where ACIS starts a base tilted to `normal` (in UCS terms) round: the
 * arbitrary axis' −X for a circle, its Y for an ellipse (c12, c14, c15).
 */
function seamOf(normal: Vec3, elliptical: boolean): Vec3 {
  const axes = arbitraryAxis(normal)
  if (!axes) return UCS_X
  return elliptical ? axes.y : scale3(axes.x, -1)
}

/**
 * The circle through three points, in their plane, in UCS terms: level, its
 * seam the UCS's X, when that plane is the UCS's XY's — whichever way round
 * they run (c15); else its normal theirs (c02).
 */
function circleThrough(a: Vec3, b: Vec3, c: Vec3): Base | null {
  const u = sub3(b, a)
  const v = sub3(c, a)
  const n = cross3(u, v)
  const nn = dot3(n, n)
  if (nn === 0) return null
  // The circumcentre: a + (|u|²(v × n) + |v|²(n × u)) / 2|n|².
  const center = add3(
    a,
    scale3(
      add3(scale3(cross3(v, n), dot3(u, u)), scale3(cross3(n, u), dot3(v, v))),
      1 / (2 * nn)
    )
  )
  const radius = length3(sub3(a, center))
  const normal = scale3(n, 1 / Math.sqrt(nn))
  const level = Math.abs(normal.x) < PLUMB && Math.abs(normal.y) < PLUMB
  return {
    center,
    normal: level ? UCS_Z : normal,
    xAxis: level ? UCS_X : seamOf(normal, false),
    radius,
    radiusY: null,
    level,
  }
}

/**
 * A torus' ring through three points: in their plane, its normal their turn
 * even when that is the UCS's −Z, its X the arbitrary axis' (r05's MPDUMP).
 */
function turnedBy(base: Base, [a, b, c]: readonly Vec3[]): Base {
  const normal = normalize3(cross3(sub3(b, a), sub3(c, a))) ?? UCS_Z
  const axes = arbitraryAxis(normal)
  return { ...base, normal, xAxis: axes ? axes.x : UCS_X, level: false }
}

/**
 * Where on a level ring TORUS measures its tube from: its radius toward
 * `toward`, along the seam when that is the centre; a negative ring's centre
 * (the console's BasePoint, r01–r07).
 */
function ringPoint(base: Base, toward: Vec3): Vec3 {
  const { center, radius } = base
  if (!(radius > 0)) return center
  const way = { x: toward.x - center.x, y: toward.y - center.y, z: 0 }
  const reach = length3(way)
  const unit = reach > 0 ? scale3(way, 1 / reach) : base.xAxis
  return add3(center, scale3(unit, radius))
}

/** A line, circle or arc lying in the plane, as the tangent it offers. */
function tangentTarget(entity: Entity): TangentTarget | null {
  if (!readsInPlan(entity)) return null
  if (entity.type === "line") {
    return { kind: "line", a: entity.start, b: entity.end }
  }
  if (entity.type === "circle" || entity.type === "arc") {
    return { kind: "circle", center: entity.center, radius: entity.radius }
  }
  return null
}

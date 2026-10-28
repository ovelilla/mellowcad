import { Vec2, V } from "../../geometry/Vec2"
import { length3, sub3, Vec3, vec3, withZ } from "../../geometry/Vec3"
import {
  CircleConstraint,
  circleFrom3Points,
  circleOnDiameter,
  circlesMeetingThree,
  circlesTangentToBoth,
  closestPointOnCircle,
  closestPointOnInfiniteLine,
  nearestToPicks,
  TangentTarget,
} from "../../geometry/primitives"
import {
  CircleEntity,
  createCircle,
  Entity,
  EntityId,
  entityElevation,
  entityZAt,
  onPlaneOf,
  readsInPlan,
} from "../../domain/entities"
import { LayerId } from "../../domain/layers"
import { parseNumber } from "../../domain/units"
import { AddEntityCommand } from "../commands/entityCommands"
import { DynamicInputSession } from "../input/DynamicInput"
import type { PromptId } from "../../locales/types"
import {
  isCoordinateExpression,
  parseCoordinate,
} from "../input/coordinateInput"
import { ScenePrimitive } from "../../scene/types"
import { SnapType } from "../snapping/types"
import { THEME } from "../../scene/theme"
import { entityScenePrimitive } from "../SceneBuilder"
import {
  CommandOption,
  CommandOptionOutcome,
  type HeldVariables,
  KeyInput,
  MACRO_PAUSE,
  PointerInput,
  type RibbonMacro,
  Tool,
  ToolContext,
  ToolQuestion,
  type QuestionInput,
} from "./Tool"
import {
  currentColor,
  withCurrentProperties,
  withCurrentThickness,
} from "./currentProperties"

/** The ghost's id, reused every frame so a preview burns no entity ids. */
const PREVIEW_ID = "circle-preview"

/**
 * How a circle is defined — the ribbon's Circle buttons, each a rail entry,
 * each CIRCLE with the macro's answers (acad.cuix; see {@link
 * CircleTool.ribbonMacro}):
 *
 * - `center`: a centre point then a radius (`^C^C_circle`);
 * - `centerDiameter`: a centre point then a diameter (`_circle \_d`);
 * - `twoPoint`: two points defining the diameter (`_circle _2p`);
 * - `threePoint`: three points on the circumference (`_circle _3p`).
 *
 * Center-Radius and Center-Diameter follow AutoCAD: the size line runs from the
 * centre to the cursor, whose distance is the radius or the diameter
 * respectively. In diameter mode the cursor therefore sits at the diameter
 * distance (2× the radius), so the line extends past the rim — its length being
 * the diameter is the cue that the diameter is being specified.
 */
export type CircleMode = "center" | "centerDiameter" | "twoPoint" | "threePoint"

/** What the first prompt's keywords switch CIRCLE to. */
type ActiveMode = "center" | "twoPoint" | "threePoint" | "ttr"

/**
 * AutoCAD's CIRCLERAD, shared by every mode of one runtime: the last circle's
 * radius, the radius prompt's `<default>` ("A zero indicates no default"). Per
 * drawing and not saved (rectang/p301): {@link CircleTool.onNewDrawing}. U
 * leaves it, where AutoCAD's puts it back (p317; RECTANG-D48).
 */
export interface CircleRadiusDefault {
  radius: number
}

/** An object picked for Ttr, and where: the solution touching nearest wins. */
interface Tangency {
  readonly target: TangentTarget
  readonly pick: Vec2
  /** The object's height, which the circle takes when both share it. */
  readonly z: number
}

/**
 * One of 2P's or 3P's points as given: a point, or an object picked under a
 * Tangent or Perpendicular, which AutoCAD defers and solves with the others
 * at the last point (probes circle/p01, p03, p08, p337d).
 */
type Given =
  | { readonly kind: "point"; readonly point: Vec3 }
  | {
      readonly kind: "object"
      readonly constraint: CircleConstraint
      readonly pick: Vec2
      readonly z: number
    }

type CircleToolState =
  /** Awaiting the centre point (center mode). */
  | { readonly phase: "center" }
  /** Centre placed; awaiting a radius (or diameter). */
  | {
      readonly phase: "radius"
      readonly center: Vec3
      readonly cursor: Vec3
      /** When set, the pointed/typed value is the diameter, not the radius. */
      readonly diameter: boolean
    }
  /** Awaiting the first point (2P first / 3P first). */
  | { readonly phase: "p1" }
  /** First point given (2P diameter end / 3P second point). */
  | {
      readonly phase: "p2"
      readonly given: readonly [Given]
      readonly cursor: Vec3
    }
  /** Two points given; awaiting the third (3P only). */
  | {
      readonly phase: "p3"
      readonly given: readonly [Given, Given]
      readonly cursor: Vec3
    }
  /** Ttr: awaiting the object of the first tangent. */
  | { readonly phase: "tangentFirst" }
  /** Ttr: awaiting the object of the second tangent. */
  | { readonly phase: "tangentSecond"; readonly first: Tangency }
  /**
   * Ttr: awaiting the radius, typed or as the distance between two points,
   * which the runtime measures.
   */
  | {
      readonly phase: "ttrRadius"
      readonly first: Tangency
      readonly second: Tangency
    }

/**
 * The circle tool — AutoCAD's CIRCLE. One class parameterised by {@link
 * CircleMode}, registered once per mode: every mode starts at CIRCLE's centre
 * prompt and its macro answers it, and the first prompt's `[3P/2P/Ttr]` and
 * the radius prompt's `[Diameter]` switch the mode actually running. It never
 * mutates the document: the finished circle is submitted as an {@link
 * AddEntityCommand}, so it is undoable, and the command ends the moment the
 * circle is defined (CIRCLE is a single-shot command in AutoCAD).
 */
export class CircleTool implements Tool {
  readonly id: string
  readonly shortcut?: string

  private readonly mode: CircleMode
  /** The mode actually running: the first prompt's keywords switch it. */
  private active: ActiveMode
  private state: CircleToolState
  private lastScreen: Vec2 | null = null

  constructor(
    mode: CircleMode,
    id: string,
    shortcut?: string,
    private readonly lastRadius: CircleRadiusDefault = { radius: 0 }
  ) {
    this.mode = mode
    this.active = "center"
    this.id = id
    this.shortcut = shortcut
    this.state = this.initialState()
  }

  private initialState(): CircleToolState {
    return { phase: "center" }
  }

  /**
   * The ribbon's Circle buttons are CIRCLE answered (acad.cuix): Center
   * `^C^C_circle`, Diameter `_circle \_d`, 2-Point `_circle _2p`, 3-Point
   * `_circle _3p` (desktop circle/d01, d02). WHY CIRCLED, CIRCLE2P and
   * CIRCLE3P typed run them too: they are this app's names for the buttons.
   */
  ribbonMacro(): RibbonMacro {
    const answers: Record<CircleMode, readonly string[]> = {
      center: [],
      centerDiameter: [MACRO_PAUSE, "_d"],
      twoPoint: ["_2p"],
      threePoint: ["_3p"],
    }
    return { command: "CIRCLE", answers: answers[this.mode] }
  }

  /** CIRCLERAD, which every CIRCLE mode shares, per drawing (rectang/p301). */
  onNewDrawing(): void {
    this.lastRadius.radius = 0
  }

  heldVariables(): Partial<HeldVariables> {
    const held = this.lastRadius
    return {
      CIRCLERAD: {
        read: () => held.radius,
        write: (radius) => {
          held.radius = radius
        },
      },
    }
  }

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    ctx.selection.clear()
    this.restart(ctx)
  }

  onDeactivate(ctx: ToolContext): void {
    this.active = "center"
    this.state = this.initialState()
    ctx.dynamicInput.close()
  }

  /** Back to CIRCLE's first prompt. */
  private restart(ctx: ToolContext): void {
    this.active = "center"
    this.state = this.initialState()
    this.openPointInput(ctx, "center")
  }

  /** A radius prompt shows CIRCLERAD as its default, unless it is 0. */
  question(): PromptId | ToolQuestion {
    const { radius } = this.lastRadius
    const sized = (id: PromptId, size: number): PromptId | ToolQuestion =>
      size > 0 ? { id, enter: size } : id
    const state = this.state
    switch (state.phase) {
      case "center":
        return "specifyCenterPointForCircleOr"
      case "radius":
        return state.diameter
          ? sized("specifyDiameterOfCircle", radius * 2)
          : sized("specifyRadiusOfCircleOr", radius)
      case "p1":
        return this.active === "twoPoint"
          ? "specifyFirstEndPointOfDiameter"
          : "specifyFirstPointOnCircle"
      case "p2":
        return this.active === "twoPoint"
          ? "specifySecondEndPointOfDiameter"
          : "specifySecondPointOnCircle"
      case "p3":
        return "specifyThirdPointOnCircle"
      case "tangentFirst":
        return "specifyFirstTangentOfCircle"
      case "tangentSecond":
        return "specifySecondTangentOfCircle"
      case "ttrRadius":
        // WHY not POLYGON's id: Spanish words them apart, `Precise radio del
        // círculo` (table 20419, probe circle/p187) and `de círculo` (p188).
        return sized("specifyRadiusOfCircleTtr", radius)
    }
  }

  /**
   * The radius and Ttr's tangents take AutoCAD's own refusals (the radius's
   * names its D); the diameter measures from the centre. 2P's and 3P's later
   * points are 2D: a Z or `*` there is `Invalid 2D point.` (probes circle/p16,
   * p18, p20, p121, p122, p180, p181).
   */
  takes(): QuestionInput | null {
    switch (this.state.phase) {
      case "p2":
      case "p3":
        return "point2d"
      case "radius":
        return this.state.diameter
          ? {
              refusal: "requiresDistance",
              values: { points: "second", keyword: "no" },
            }
          : { refusal: "requiresRadius" }
      case "tangentFirst":
      case "tangentSecond":
        return { refusal: "requiresTangent" }
      default:
        return null
    }
  }

  commandOptions(): readonly CommandOption[] {
    switch (this.state.phase) {
      case "center":
        return [{ id: "3P" }, { id: "2P" }, { id: "Ttr" }]
      case "radius":
        return this.state.diameter ? [] : [{ id: "Diameter" }]
      default:
        return []
    }
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    const state = this.state
    if (state.phase === "center") {
      if (id === "3P" || id === "2P") {
        this.active = id === "3P" ? "threePoint" : "twoPoint"
        this.state = { phase: "p1" }
        this.openPointInput(ctx, "firstPoint")
        ctx.requestRender()
        return "continue"
      }
      if (id === "Ttr") {
        this.active = "ttr"
        this.state = { phase: "tangentFirst" }
        this.openTangentInput(ctx)
        ctx.requestRender()
        return "continue"
      }
    }
    if (state.phase === "radius" && id === "Diameter" && !state.diameter) {
      this.state = { ...state, diameter: true }
      this.openRadiusInput(ctx, this.lastScreen ?? { x: 0, y: 0 })
      ctx.requestRender()
      return "continue"
    }
    return "unhandled"
  }

  /**
   * Ttr's radius takes no point of its own: the runtime measures two. Its
   * tangents are points, so a typed `_TAN` and point reach them (probe
   * circle/p300); the pick is read off the object, never the snap.
   */
  wantsSnap(): boolean {
    return this.state.phase !== "ttrRadius"
  }

  /**
   * Which Tangent or Perpendicular finding nothing this prompt works out
   * itself. 2P and 3P defer a Tangent on a line, a circle or an arc, and a
   * Perpendicular on a line; a Perpendicular on a circle only at 2P, where
   * it is a Tangent (probe circle/p335e), never at 3P (p337f). The radius
   * makes the circle tangent to the object, also from inside it (p338b). Ttr
   * says its own refusal on any line or curve (p314, p373); on nothing, or
   * text, the override's (p307, p316).
   */
  defersSnap(
    kind: SnapType.Tangent | SnapType.Perpendicular,
    entity: Entity | null
  ): boolean {
    if (!entity || !readsInPlan(entity)) return false
    const flat = entity.type === "line" || entity.type === "circle"
    const round = entity.type === "circle" || entity.type === "arc"
    switch (this.state.phase) {
      case "radius":
        return (
          !this.state.diameter && kind === SnapType.Tangent && (flat || round)
        )
      case "p1":
      case "p2":
      case "p3":
        if (kind === SnapType.Tangent || entity.type === "line") {
          return flat || round
        }
        return round && this.active === "twoPoint"
      case "tangentFirst":
      case "tangentSecond":
        return (
          flat ||
          round ||
          entity.type === "ellipse" ||
          entity.type === "spline" ||
          entity.type === "polyline"
        )
      default:
        return false
    }
  }

  /**
   * Ttr's objects are picked as under TAN: the running snaps show nothing and
   * the object is not highlighted (desktop circle/d03).
   */
  impliedSnap(): SnapType.Tangent | null {
    const { phase } = this.state
    return phase === "tangentFirst" || phase === "tangentSecond"
      ? SnapType.Tangent
      : null
  }

  /**
   * Deferred Tangent where the pick will be taken: Ttr's line, circle or arc
   * (desktop circle/d03) and what 2P and 3P defer. Over an ellipse or a
   * spline Ttr shows the plain Tangent, and its pick is refused (d13). None
   * at 2P's Perpendicular on a line, the foot from LASTPOINT, an ordinary
   * point (p335): what AutoCAD shows there is unverified.
   */
  snapMarker(
    kind: SnapType.Tangent | SnapType.Perpendicular,
    entity: Entity
  ): "deferred" | "plain" | null {
    switch (this.state.phase) {
      case "p1":
      case "p2":
      case "p3":
        if (
          this.active === "twoPoint" &&
          kind === SnapType.Perpendicular &&
          entity.type === "line"
        ) {
          return null
        }
        return this.defersSnap(kind, entity) ? "deferred" : null
      case "tangentFirst":
      case "tangentSecond":
        if (kind !== SnapType.Tangent || !readsInPlan(entity)) return null
        if (
          entity.type === "line" ||
          entity.type === "circle" ||
          entity.type === "arc"
        ) {
          return "deferred"
        }
        return entity.type === "ellipse" || entity.type === "spline"
          ? "plain"
          : null
      default:
        return null
    }
  }

  /**
   * The centre's Tangent and Perpendicular are measured from LASTPOINT, the
   * answer nearer the pick (probes circle/p343–p347; CIRCLE-D32).
   */
  snapsFromLastPoint(): boolean {
    return this.state.phase === "center"
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen

    switch (this.state.phase) {
      case "radius": {
        this.state = { ...this.state, cursor: this.radiusPoint(input, ctx) }
        // The distance from the centre to the cursor is the value being
        // specified: the radius, or the diameter in diameter mode (AutoCAD puts
        // the cursor at the diameter distance, i.e. 2× the radius).
        const dist = sizeFrom(this.state.center, input.point)
        ctx.dynamicInput.setLive("radius", dist)
        break
      }
      case "p2":
      case "p3":
        this.state = { ...this.state, cursor: input.point }
        break
    }
    ctx.dynamicInput.setPosition(input.screen)
    ctx.requestRender()
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0) return
    const state = this.state

    switch (state.phase) {
      case "radius":
        this.commitRadiusAt(this.radiusPoint(input, ctx), ctx)
        return
      case "tangentFirst":
      case "tangentSecond": {
        // WHY a Perpendicular is refused on any object: Ttr takes a Tangent
        // only (probe circle/p373).
        const picked =
          ctx.snapOverride() === SnapType.Perpendicular
            ? null
            : this.pickTangent(input.world, ctx)
        if (!picked) {
          ctx.report(ctx.text.message("requiresTangentSelection"), "error")
          return
        }
        const tangency = {
          target: picked.target,
          pick: input.world,
          z: entityElevation(picked.entity),
        }
        if (state.phase === "tangentFirst") {
          this.state = { phase: "tangentSecond", first: tangency }
        } else {
          this.state = {
            phase: "ttrRadius",
            first: state.first,
            second: tangency,
          }
          this.openTtrRadiusInput(ctx, input.screen)
        }
        ctx.requestRender()
        return
      }
      case "p1":
      case "p2":
      case "p3": {
        const given = this.givenAt(input, ctx)
        if (given.kind === "point") {
          this.advanceWithPoint(given.point, ctx, input.screen)
        } else {
          // A deferred pick gives no point: LASTPOINT stays (probe
          // circle/p335, a Perpendicular after it measured from the old one).
          ctx.setLastPoint(ctx.lastPoint)
          this.advanceWith(given, ctx, input.screen)
        }
        return
      }
      default:
        this.advanceWithPoint(input.point, ctx, input.screen)
    }
  }

  /**
   * What a 2P or 3P pick gives: under a Tangent or Perpendicular that found
   * nothing to measure from, the object, solved with the rest at the last
   * point; else the point. A Perpendicular to a line is the circle's centre
   * on it at 3P (probes circle/p337c, p337d), and at 2P the foot from
   * LASTPOINT, an ordinary point (p335).
   */
  private givenAt(input: PointerInput, ctx: ToolContext): Given {
    const kind = ctx.snapOverride()
    const asPoint: Given = { kind: "point", point: input.point }
    if (
      input.snap ||
      (kind !== SnapType.Tangent && kind !== SnapType.Perpendicular)
    ) {
      return asPoint
    }
    const entity = ctx.pick(input.world, ctx.pickTolerance())
    if (!entity || !this.defersSnap(kind, entity)) return asPoint
    const pick = input.world
    if (entity.type === "line") {
      const z = entityZAt(entity, pick)
      if (kind === SnapType.Tangent) {
        return {
          kind: "object",
          constraint: { kind: "line", a: entity.start, b: entity.end },
          pick,
          z,
        }
      }
      if (this.active === "twoPoint") {
        const foot = closestPointOnInfiniteLine(
          entity.start,
          entity.end,
          ctx.lastPoint
        ).point
        const point = withZ(foot, entityZAt(entity, foot))
        ctx.setLastPoint(point)
        return { kind: "point", point }
      }
      return {
        kind: "object",
        constraint: { kind: "centerOn", a: entity.start, b: entity.end },
        pick,
        z,
      }
    }
    if (entity.type !== "circle" && entity.type !== "arc") return asPoint
    return {
      kind: "object",
      constraint: {
        kind: "circle",
        center: entity.center,
        radius: entity.radius,
      },
      pick,
      z: entityElevation(entity),
    }
  }

  /**
   * Where the radius is measured to. Under a Tangent, the point of the object
   * the circle touches: on a circle or an arc's circle the radial point nearer
   * the pick, on a line the foot (probes circle/p06, p338–p340; CIRCLE-D33).
   * The diameter keeps the ordinary snaps (p342).
   */
  private radiusPoint(input: PointerInput, ctx: ToolContext): Vec3 {
    const state = this.state
    if (
      state.phase !== "radius" ||
      state.diameter ||
      ctx.snapOverride() !== SnapType.Tangent
    ) {
      return input.point
    }
    const entity = ctx.pick(input.world, ctx.pickTolerance())
    if (!entity || !this.defersSnap(SnapType.Tangent, entity)) {
      return input.point
    }
    if (entity.type === "line") {
      const foot = closestPointOnInfiniteLine(
        entity.start,
        entity.end,
        state.center
      ).point
      return withZ(foot, entityZAt(entity, foot))
    }
    if (entity.type !== "circle" && entity.type !== "arc") return input.point
    const { center, radius } = entity
    const away = V.sub(state.center, center)
    const length = V.length(away)
    const touch =
      length < 1e-12
        ? closestPointOnCircle(center, radius, input.world).point
        : nearestTo(
            [
              V.add(center, V.scale(away, radius / length)),
              V.sub(center, V.scale(away, radius / length)),
            ],
            input.world
          )
    return withZ(touch, entityElevation(entity))
  }

  /**
   * Advances the point-based phases (centre / p1 / p2 / p3) with a resolved
   * world point, shared by the click path and the typed-coordinate path so both
   * behave identically.
   */
  private advanceWithPoint(point: Vec3, ctx: ToolContext, screen?: Vec2): void {
    if (this.state.phase !== "center") {
      this.advanceWith({ kind: "point", point }, ctx, screen)
      return
    }
    const at = screen ?? this.lastScreen ?? ctx.viewport.worldToScreen(point)
    this.state = {
      phase: "radius",
      center: point,
      cursor: point,
      diameter: false,
    }
    this.openRadiusInput(ctx, at)
    ctx.requestRender()
  }

  /** 2P's and 3P's points, each a point or a deferred object. */
  private advanceWith(given: Given, ctx: ToolContext, screen?: Vec2): void {
    const state = this.state
    const cursor = given.kind === "point" ? given.point : null
    const at =
      screen ?? this.lastScreen ?? ctx.viewport.worldToScreen(pickOf(given))
    switch (state.phase) {
      case "p1":
        this.state = {
          phase: "p2",
          given: [given],
          cursor:
            given.kind === "point" ? given.point : withZ(given.pick, given.z),
        }
        this.openPointInput(ctx, "secondPoint", at)
        break
      case "p2":
        if (this.active === "twoPoint") {
          this.commitTwoPoint(state.given[0], given, ctx)
          return
        }
        this.state = {
          phase: "p3",
          given: [state.given[0], given],
          cursor: cursor ?? state.cursor,
        }
        this.openPointInput(ctx, "thirdPoint", at)
        break
      case "p3":
        this.commitThreePoint(state.given[0], state.given[1], given, ctx)
        return
    }
    ctx.requestRender()
  }

  /** Ttr's object picks have no box: their Enter reaches the drawing. */
  onEnter(ctx: ToolContext): boolean {
    return this.refuseEnter(ctx)
  }

  /**
   * Enter where nothing is given and no default stands: every CIRCLE prompt
   * refuses it in its own words and asks again (AllowNone false; probes
   * circle/p109, p114, p119, p126–p130, p306, p309, p310).
   */
  private refuseEnter(ctx: ToolContext): boolean {
    const message = ((): string => {
      switch (this.state.phase) {
        case "center":
          return ctx.text.message("pointOrKeywordRequired")
        case "p1":
          return ctx.text.message("invalidPoint")
        case "p2":
        case "p3":
          return ctx.text.message("invalidPoint2d")
        case "radius":
          return this.state.diameter
            ? ctx.text.message("requiresDistance", {
                points: "second",
                keyword: "no",
              })
            : ctx.text.message("requiresRadius")
        case "tangentFirst":
        case "tangentSecond":
          return ctx.text.message("requiresTangent")
        case "ttrRadius":
          return ctx.text.message("requiresDistance", {
            points: "two",
            keyword: "no",
          })
      }
    })()
    ctx.report(message, "error")
    return true
  }

  onKeyDown(input: KeyInput, ctx: ToolContext): void {
    if (input.key === "Escape") {
      this.active = "center"
      this.state = this.initialState()
      ctx.dynamicInput.close()
      ctx.requestRender()
    }
  }

  /**
   * Only the radius bends about a base. WHY none at 2P's and 3P's later
   * points: AutoCAD asks them with no base point (UseBasePoint false), so
   * Ortho and Polar leave their picks alone (desktop circle/d12) and `<45`
   * there is the prompt's wrong answer (p137).
   */
  getConstraintAnchor(): Vec3 | null {
    return this.state.phase === "radius" ? this.state.center : null
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    const { viewport } = ctx
    // The circle about to be made, in its colour: red with CECOLOR 1 (desktop
    // circle/d01, d02, d05).
    const rubber = { color: currentColor(ctx), width: 1 }
    const layer = ctx.document.getCurrentLayerId()
    const ghost = (circle: CircleEntity | null): ScenePrimitive[] =>
      circle ? entityScenePrimitive(viewport, circle, rubber) : []

    switch (this.state.phase) {
      case "radius": {
        const { center, cursor } = this.state
        const radius = this.resolveRadius(ctx)
        // AutoCAD draws the size line from the centre to the cursor, amber and
        // dashed (desktop circle/d01, d05; the trace's UseDashedLine). In
        // diameter mode the cursor sits at the diameter distance (2× the
        // radius), so the line runs out past the rim — its length is the
        // diameter, which is the visual cue that the diameter (not the radius)
        // is being specified.
        return [
          {
            kind: "segment",
            a: viewport.worldToScreen(center),
            b: viewport.worldToScreen(cursor),
            stroke: { color: THEME.dashedRubberBand, width: 1, dash: [2, 3] },
          },
          ...ghost(circleAt(center, radius, center, layer, PREVIEW_ID)),
        ]
      }
      case "p2": {
        const [first] = this.state.given
        const { cursor } = this.state
        if (first.kind === "object") {
          // AutoCAD's jig solves the circle through the cursor as a point.
          if (this.active !== "twoPoint") return []
          return ghost(
            solvedTwoPoint(
              first,
              { kind: "point", point: cursor },
              ctx.elevation,
              layer,
              PREVIEW_ID
            )
          )
        }
        // No chord: 2P shows the circle alone, 3P nothing until two points
        // fix it (desktop circle/d02).
        if (this.active !== "twoPoint") return []
        return ghost(twoPointCircle(first.point, cursor, layer, PREVIEW_ID))
      }
      case "p3": {
        const [first, second] = this.state.given
        const { cursor } = this.state
        if (first.kind === "point" && second.kind === "point") {
          return ghost(
            threePointCircle(
              first.point,
              second.point,
              cursor,
              layer,
              PREVIEW_ID
            )
          )
        }
        const third: Given = { kind: "point", point: cursor }
        return ghost(
          solvedThreePoint(
            [first, second, third],
            ctx.elevation,
            layer,
            PREVIEW_ID
          )
        )
      }
      case "ttrRadius": {
        const radius = this.resolveTtrRadius(ctx)
        return ghost(
          radius === null
            ? null
            : this.ttrCircle(radius, ctx.elevation, layer, PREVIEW_ID)
        )
      }
      default:
        return []
    }
  }

  /**
   * The effective radius during the radius phase. The pointed/typed value is the
   * radius, or the diameter in diameter mode (AutoCAD's Center-Diameter puts the
   * cursor at the diameter distance). A typed value hard-locks the size.
   */
  private resolveRadius(ctx: ToolContext): number {
    if (this.state.phase !== "radius") return 0
    const typed = parseField(ctx, "radius")
    const value = typed ?? sizeFrom(this.state.center, this.state.cursor)
    return this.state.diameter ? value / 2 : value
  }

  private commitRadiusAt(point: Vec3, ctx: ToolContext): void {
    if (this.state.phase !== "radius") return
    const typed = parseField(ctx, "radius")
    // A typed value hard-locks the size; otherwise the click distance from the
    // centre is the value. In diameter mode that value is the diameter.
    const value = typed ?? sizeFrom(this.state.center, point)
    this.commitRadiusValue(value, ctx)
  }

  private commitRadiusValue(value: number, ctx: ToolContext): void {
    if (this.state.phase !== "radius") return
    if (!(value > 0)) {
      ctx.report(ctx.text.message("positiveNonzero"), "error")
      return
    }
    const radius = this.state.diameter ? value / 2 : value
    const { center } = this.state
    this.commitCircle(circleAt(center, radius, center, layerOf(ctx)), ctx)
  }

  private commitTwoPoint(first: Given, second: Given, ctx: ToolContext): void {
    if (first.kind === "point" && second.kind === "point") {
      this.commitOrEnd(
        twoPointCircle(first.point, second.point, layerOf(ctx)),
        ctx
      )
      return
    }
    this.commitSolved(
      solvedTwoPoint(first, second, ctx.elevation, layerOf(ctx)),
      ctx
    )
  }

  private commitThreePoint(
    first: Given,
    second: Given,
    third: Given,
    ctx: ToolContext
  ): void {
    if (
      first.kind === "point" &&
      second.kind === "point" &&
      third.kind === "point"
    ) {
      this.commitOrEnd(
        threePointCircle(first.point, second.point, third.point, layerOf(ctx)),
        ctx
      )
      return
    }
    this.commitSolved(
      solvedThreePoint([first, second, third], ctx.elevation, layerOf(ctx)),
      ctx
    )
  }

  /**
   * A circle solved from a deferred Tangent or Perpendicular, or AutoCAD's
   * `Circle does not exist.` and the end when none fits (desktop circle/d04).
   */
  private commitSolved(circle: CircleEntity | null, ctx: ToolContext): void {
    if (circle) {
      this.commitCircle(circle, ctx)
      return
    }
    ctx.report(ctx.text.message("circleDoesNotExist"), "error")
    ctx.endCommand()
  }

  /**
   * 2P on one point or 3P on one line makes no circle: AutoCAD says
   * `*Invalid*` and CIRCLE ends, LASTPOINT the last point given (probes
   * circle/p123–p125, p164).
   */
  private commitOrEnd(circle: CircleEntity | null, ctx: ToolContext): void {
    if (circle) {
      this.commitCircle(circle, ctx)
      return
    }
    ctx.report(ctx.text.message("invalid"), "error")
    ctx.endCommand()
  }

  /** Ttr's circle of `radius`, or AutoCAD's "Circle does not exist." and the end. */
  private commitTtr(radius: number, ctx: ToolContext): void {
    if (!(radius > 0)) {
      ctx.report(ctx.text.message("positiveNonzero"), "error")
      return
    }
    this.commitSolved(this.ttrCircle(radius, ctx.elevation, layerOf(ctx)), ctx)
  }

  /**
   * The circle of `radius` tangent to both objects. Of the several that may
   * fit, "the program draws the circle of the specified radius whose tangent
   * points are closest to the selected points": by the sum of the squared
   * distances (probes circle/p378c, p379; CIRCLE-D30). It lies at the
   * objects' height when they share one, else at the current elevation
   * (p321, p327–p329; CIRCLE-D34).
   */
  private ttrCircle(
    radius: number,
    elevation: number,
    layerId: LayerId,
    id?: EntityId
  ): CircleEntity | null {
    if (this.state.phase !== "ttrRadius") return null
    const { first, second } = this.state
    const best = nearestToPicks(
      circlesTangentToBoth(first.target, second.target, radius),
      [first.pick, second.pick],
      (fit) => [fit.touchFirst, fit.touchSecond]
    )
    const z = commonHeight([first.z, second.z], elevation)
    return best
      ? circleAt(best.center, radius, vec3(0, 0, z), layerId, id)
      : null
  }

  /** Ttr's radius as it stands: typed, else the two points' distance. */
  private resolveTtrRadius(ctx: ToolContext): number | null {
    if (this.state.phase !== "ttrRadius") return null
    return parseField(ctx, "radius") ?? ctx.dynamicInput.getLive("radius")
  }

  /** A line, circle or arc lying in the plane, as the tangent it offers. */
  private pickTangent(
    world: Vec2,
    ctx: ToolContext
  ): { entity: Entity; target: TangentTarget } | null {
    const hit = ctx.pick(world)
    if (!hit || !readsInPlan(hit)) return null
    if (hit.type === "line") {
      return { entity: hit, target: { kind: "line", a: hit.start, b: hit.end } }
    }
    if (hit.type === "circle" || hit.type === "arc") {
      return {
        entity: hit,
        target: { kind: "circle", center: hit.center, radius: hit.radius },
      }
    }
    return null
  }

  private commitCircle(circle: CircleEntity | null, ctx: ToolContext): void {
    if (!circle) return
    this.lastRadius.radius = circle.radius
    ctx.execute(
      new AddEntityCommand(
        withCurrentProperties(withCurrentThickness(circle, ctx), ctx)
      )
    )
    ctx.endCommand()
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

  /** Places a point phase from a typed coordinate, if one is present. */
  private commitTypedPoint(ctx: ToolContext): boolean {
    const text = ctx.dynamicInput.getText("point").trim()
    if (text === "") return this.refuseEnter(ctx)
    if (!isCoordinateExpression(text)) return false

    const last = this.previousPoint()
    const point = parseCoordinate(text, {
      lastPoint: last ?? ctx.lastPoint,
      relativeByDefault: last !== null,
      ucs: ctx.ucs,
      elevation: ctx.elevation,
    })
    if (!point) return false
    // WHY the tool says it: the box reads it from the point before, which is
    // no base of the runtime's; LASTPOINT is the point given (circle/p164).
    if (last !== null) ctx.setLastPoint(point)
    this.advanceWithPoint(point, ctx)
    return true
  }

  /** The point a relative coordinate is measured from, per phase. */
  private previousPoint(): Vec3 | null {
    const state = this.state
    if (state.phase !== "p2" && state.phase !== "p3") return null
    const last = state.given[state.given.length - 1]
    return last.kind === "point" ? last.point : null
  }

  /**
   * Ttr's tangent prompts: a point box, where a typed point or number picks
   * no object — AutoCAD's starred refusal (probes circle/p300, p314, p373) —
   * and a word falls to the plain one (p308). A typed `_TAN` and point are
   * a pick there, which the runtime makes.
   */
  private openTangentInput(ctx: ToolContext): void {
    ctx.dynamicInput.open({
      fields: [{ id: "point", kind: "coordinate" }],
      commit: () => {},
      commitRaw: (commitCtx) => this.refuseTypedTangent(commitCtx),
      directDistance: "typed",
    })
  }

  private refuseTypedTangent(ctx: ToolContext): boolean {
    const text = ctx.dynamicInput.getText("point").trim()
    if (text === "") return this.refuseEnter(ctx)
    if (!isCoordinateExpression(text) && parseNumber(text) === null) {
      return false
    }
    ctx.report(ctx.text.message("requiresTangentSelection"), "error")
    return true
  }

  private openRadiusInput(ctx: ToolContext, screen: Vec2): void {
    const session: DynamicInputSession = {
      fields: [
        {
          id: "radius",
          prompt: this.currentRadiusPrompt(),
          kind: "distance",
        },
      ],
      commit: (values, commitCtx) =>
        this.commitRadiusValue(values.radius, commitCtx),
      // Enter with nothing typed takes CIRCLERAD; with none, it is refused.
      commitRaw: (commitCtx) => {
        const { radius } = this.lastRadius
        if (commitCtx.dynamicInput.hasTypedText()) return false
        if (!(radius > 0)) return this.refuseEnter(commitCtx)
        this.commitRadiusValue(this.sizeOf(radius), commitCtx)
        return true
      },
    }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setLive("radius", 0)
    ctx.dynamicInput.setPosition(screen)
  }

  private openTtrRadiusInput(ctx: ToolContext, screen: Vec2): void {
    ctx.dynamicInput.open({
      fields: [{ id: "radius", prompt: "radius", kind: "distance" }],
      commit: (values, commitCtx) => this.commitTtr(values.radius, commitCtx),
      // Enter with nothing typed takes CIRCLERAD; with none, it is refused.
      commitRaw: (commitCtx) => {
        const { radius } = this.lastRadius
        if (commitCtx.dynamicInput.hasTypedText()) return false
        if (!(radius > 0)) return this.refuseEnter(commitCtx)
        this.commitTtr(radius, commitCtx)
        return true
      },
    })
    ctx.dynamicInput.setPosition(screen)
  }

  /** The value the size field asks for: the radius, or the diameter. */
  private sizeOf(radius: number): number {
    return this.state.phase === "radius" && this.state.diameter
      ? radius * 2
      : radius
  }

  private currentRadiusPrompt(): PromptId {
    return this.state.phase === "radius" && this.state.diameter
      ? "diameter"
      : "radius"
  }
}

/** Reads a numeric field, returning `null` when empty or not a number. */
function parseField(ctx: ToolContext, fieldId: string): number | null {
  const text = ctx.dynamicInput.getText(fieldId).trim()
  if (text === "") return null
  const value = parseNumber(text)
  return value !== null && Number.isFinite(value) ? value : null
}

/**
 * The radius or diameter a point gives: its distance from the centre in
 * space, not in plan (probes circle/p17 `3,4,12` → r13, p148, p184).
 */
function sizeFrom(center: Vec3, point: Vec3): number {
  return length3(sub3(point, center))
}

function layerOf(ctx: ToolContext): LayerId {
  return ctx.document.getCurrentLayerId()
}

/** A circle in the plane of `first`, or `null` for no size. */
function circleAt(
  center: Vec2,
  radius: number,
  first: Vec3,
  layerId: LayerId,
  id?: EntityId
): CircleEntity | null {
  if (!(radius > 0)) return null
  return onPlaneOf(createCircle(center, radius, layerId, id), first)
}

/**
 * The 2P circle, in the UCS plane through its first point. WHY not the two
 * points' own: AutoCAD takes the second point's X and Y only, in the first
 * one's plane (probe circle/p190: ends at Z 5 and 0 make (5,5,5) r7.0711).
 */
function twoPointCircle(
  p1: Vec3,
  p2: Vec3,
  layerId: LayerId,
  id?: EntityId
): CircleEntity | null {
  const center = V.scale(V.add(p1, p2), 0.5)
  return circleAt(center, V.distance(p1, p2) / 2, p1, layerId, id)
}

/** What a given asks of the circle: to pass through it, or its object's. */
function constraintOf(given: Given): CircleConstraint {
  return given.kind === "point"
    ? { kind: "point", point: given.point }
    : given.constraint
}

function pickOf(given: Given): Vec2 {
  return given.kind === "point" ? given.point : given.pick
}

/**
 * The height of objects a circle touches: theirs when they share one, else
 * the current elevation (Ttr, probes circle/p321, p327–p329).
 */
function commonHeight(heights: readonly number[], elevation: number): number {
  return heights.every((z) => Math.abs(z - heights[0]) < 1e-9)
    ? heights[0]
    : elevation
}

/**
 * The plane of a circle solved from 2P's or 3P's givens: the first point's,
 * as with points alone; with none, the objects' common height, else the
 * elevation, as Ttr's (**unverified**: AutoCAD's at mixed heights is
 * unprobed).
 */
function planeOfGiven(given: readonly Given[], elevation: number): Vec3 {
  const point = given.find((g) => g.kind === "point")
  if (point) return point.point
  return vec3(
    0,
    0,
    commonHeight(
      given.map((g) => (g.kind === "object" ? g.z : 0)),
      elevation
    )
  )
}

/** The 2P circle when a Tangent or Perpendicular is among its ends. */
function solvedTwoPoint(
  first: Given,
  second: Given,
  elevation: number,
  layerId: LayerId,
  id?: EntityId
): CircleEntity | null {
  const fit = circleOnDiameter(
    { constraint: constraintOf(first), pick: pickOf(first) },
    { constraint: constraintOf(second), pick: pickOf(second) }
  )
  if (!fit) return null
  const plane = planeOfGiven([first, second], elevation)
  return circleAt(fit.center, fit.radius, plane, layerId, id)
}

/**
 * The 3P circle when a Tangent or Perpendicular is among its points: of the
 * circles meeting the three, the one touching nearest the picks (CIRCLE-D30).
 */
function solvedThreePoint(
  given: readonly [Given, Given, Given],
  elevation: number,
  layerId: LayerId,
  id?: EntityId
): CircleEntity | null {
  const [a, b, c] = given
  const fit = nearestToPicks(
    circlesMeetingThree([constraintOf(a), constraintOf(b), constraintOf(c)]),
    given.map(pickOf),
    (each) => each.touches
  )
  if (!fit) return null
  const plane = planeOfGiven(given, elevation)
  return circleAt(fit.center, fit.radius, plane, layerId, id)
}

function nearestTo(points: readonly Vec2[], to: Vec2): Vec2 {
  return points.reduce((best, q) =>
    V.distance(q, to) < V.distance(best, to) ? q : best
  )
}

/**
 * The 3P circle through the three points' X and Y, in the first one's plane:
 * AutoCAD's later points are 2D (probes circle/p185, p189: snapped at other
 * heights, the circle is flat at the first's). `null` on one line.
 */
function threePointCircle(
  p1: Vec3,
  p2: Vec3,
  p3: Vec3,
  layerId: LayerId,
  id?: EntityId
): CircleEntity | null {
  const solved = circleFrom3Points(p1, p2, p3)
  return solved && circleAt(solved.center, solved.radius, p1, layerId, id)
}

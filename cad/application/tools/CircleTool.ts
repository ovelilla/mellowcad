import { Vec2, V } from "../../geometry/Vec2"
import { Vec3 } from "../../geometry/Vec3"
import {
  circleFrom3Points,
  circlesTangentToBoth,
  TangentTarget,
} from "../../geometry/primitives"
import {
  CircleEntity,
  createCircle,
  Entity,
  EntityId,
  onPlaneOf,
  readsInPlan,
  withElevation,
  withNormal,
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
import { THEME } from "../../scene/theme"
import { entityScenePrimitive } from "../SceneBuilder"
import {
  CommandOption,
  CommandOptionOutcome,
  KeyInput,
  PointerInput,
  Tool,
  ToolContext,
  ToolQuestion,
} from "./Tool"
import {
  withCurrentProperties,
  withCurrentThickness,
} from "./currentProperties"
import { planeThrough } from "./threePointPlane"

/** The ghost's id, reused every frame so a preview burns no entity ids. */
const PREVIEW_ID = "circle-preview"

/**
 * How a circle is defined — AutoCAD's CIRCLE modes, each surfaced as its own
 * rail entry (a flyout, like AutoCAD's Circle dropdown, which since recent
 * releases lists Center-Radius and Center-Diameter as separate commands):
 *
 * - `center`: a centre point then a radius;
 * - `centerDiameter`: a centre point then a diameter;
 * - `twoPoint`: two points defining the diameter;
 * - `threePoint`: three points on the circumference (circumscribed circle).
 *
 * Center-Radius and Center-Diameter follow AutoCAD: the size line runs from the
 * centre to the cursor, whose distance is the radius or the diameter
 * respectively. In diameter mode the cursor therefore sits at the diameter
 * distance (2× the radius), so the line extends past the rim — its length being
 * the diameter is the cue that the diameter is being specified.
 */
export type CircleMode = "center" | "centerDiameter" | "twoPoint" | "threePoint"

/** A mode the first prompt's keywords can switch to: `Ttr` has no rail entry. */
type ActiveMode = CircleMode | "ttr"

/**
 * AutoCAD's CIRCLERAD, shared by every mode of one runtime: the last circle's
 * radius, the radius prompt's `<default>` ("A zero indicates no default"). Not
 * saved in the drawing, as CIRCLERAD is not.
 */
export interface CircleRadiusDefault {
  radius: number
}

/** An object picked for Ttr, and where: the solution touching nearest wins. */
interface Tangency {
  readonly target: TangentTarget
  readonly pick: Vec2
  /** The pick on the drawing plane, whose height the circle takes. */
  readonly at: Vec3
}

type CircleToolState =
  /** Awaiting the centre point (center mode). */
  | { readonly phase: "center" }
  /** Centre placed; awaiting a radius (or diameter). */
  | {
      readonly phase: "radius"
      readonly center: Vec3
      readonly cursor: Vec2
      /** When set, the pointed/typed value is the diameter, not the radius. */
      readonly diameter: boolean
    }
  /** Awaiting the first point (2P first / 3P first). */
  | { readonly phase: "p1" }
  /** First point placed (2P diameter end / 3P second point). */
  | { readonly phase: "p2"; readonly p1: Vec3; readonly cursor: Vec3 }
  /** Two points placed; awaiting the third (3P only). */
  | {
      readonly phase: "p3"
      readonly p1: Vec3
      readonly p2: Vec3
      readonly cursor: Vec3
    }
  /** Ttr: awaiting the object of the first tangent. */
  | { readonly phase: "tangentFirst"; readonly hover: Entity | null }
  /** Ttr: awaiting the object of the second tangent. */
  | {
      readonly phase: "tangentSecond"
      readonly first: Tangency
      readonly hover: Entity | null
    }
  /** Ttr: awaiting the radius, typed or as the distance between two points. */
  | {
      readonly phase: "ttrRadius"
      readonly first: Tangency
      readonly second: Tangency
      readonly base: Vec3 | null
      readonly cursor: Vec3
    }

/**
 * The circle tool — AutoCAD's CIRCLE. One class parameterised by {@link
 * CircleMode}, registered once per mode; the first prompt's `[3P/2P/Ttr]` and
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
    this.active = mode
    this.id = id
    this.shortcut = shortcut
    this.state = this.initialState()
  }

  private initialState(): CircleToolState {
    switch (this.active) {
      case "center":
      case "centerDiameter":
        return { phase: "center" }
      case "ttr":
        return { phase: "tangentFirst", hover: null }
      default:
        return { phase: "p1" }
    }
  }

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    ctx.selection.clear()
    this.restart(ctx)
  }

  onDeactivate(ctx: ToolContext): void {
    this.active = this.mode
    this.state = this.initialState()
    ctx.dynamicInput.close()
  }

  /** Back to the first prompt of the mode the tool was started in. */
  private restart(ctx: ToolContext): void {
    this.active = this.mode
    this.state = this.initialState()
    this.openPointInput(ctx, this.firstPrompt())
  }

  private firstPrompt(): PromptId {
    return this.state.phase === "center" ? "center" : "firstPoint"
  }

  /** A radius prompt shows CIRCLERAD as its default, unless it is 0. */
  question(): PromptId | ToolQuestion {
    const { radius } = this.lastRadius
    const sized = (id: PromptId, size: number): PromptId | ToolQuestion =>
      size > 0 ? { id, length: size } : id
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
        return state.base
          ? "specifySecondPoint"
          : sized("specifyRadiusOfCircle", radius)
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
        this.state = { phase: "tangentFirst", hover: null }
        // An object pick: no field, so the drawing keeps focus.
        ctx.dynamicInput.open({ fields: [], commit: () => {} })
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

  wantsSnap(): boolean {
    return (
      this.state.phase !== "tangentFirst" &&
      this.state.phase !== "tangentSecond"
    )
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen

    switch (this.state.phase) {
      case "radius": {
        this.state = { ...this.state, cursor: input.point }
        // The distance from the centre to the cursor is the value being
        // specified: the radius, or the diameter in diameter mode (AutoCAD puts
        // the cursor at the diameter distance, i.e. 2× the radius).
        const dist = V.distance(this.state.center, input.point)
        ctx.dynamicInput.setLive("radius", dist)
        break
      }
      case "p2":
      case "p3":
        this.state = { ...this.state, cursor: input.point }
        break
      case "tangentFirst":
      case "tangentSecond": {
        const hover = this.pickTangent(input.world, ctx)?.entity ?? null
        if (hover?.id !== this.state.hover?.id) {
          this.state = { ...this.state, hover }
        }
        break
      }
      case "ttrRadius": {
        const { base } = this.state
        this.state = { ...this.state, cursor: input.point }
        if (base) {
          ctx.dynamicInput.setLive("radius", V.distance(base, input.point))
        }
        break
      }
    }
    ctx.dynamicInput.setPosition(input.screen)
    ctx.requestRender()
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0) return
    const state = this.state

    switch (state.phase) {
      case "radius":
        this.commitRadiusAt(input.point, ctx)
        return
      case "tangentFirst":
      case "tangentSecond": {
        const picked = this.pickTangent(input.world, ctx)
        if (!picked) return
        const tangency = {
          target: picked.target,
          pick: input.world,
          at: input.point,
        }
        if (state.phase === "tangentFirst") {
          this.state = { phase: "tangentSecond", first: tangency, hover: null }
        } else {
          this.state = {
            phase: "ttrRadius",
            first: state.first,
            second: tangency,
            base: null,
            cursor: input.point,
          }
          this.openTtrRadiusInput(ctx, input.screen)
        }
        ctx.requestRender()
        return
      }
      case "ttrRadius":
        // AutoCAD's distance prompt: a value, or two points whose distance it is.
        if (state.base) {
          this.commitTtr(V.distance(state.base, input.point), ctx)
        } else {
          this.state = { ...state, base: input.point, cursor: input.point }
          ctx.requestRender()
        }
        return
      default:
        this.advanceWithPoint(input.point, ctx, input.screen)
    }
  }

  /**
   * Advances the point-based phases (centre / p1 / p2 / p3) with a resolved
   * world point, shared by the click path and the typed-coordinate path so both
   * behave identically.
   */
  private advanceWithPoint(point: Vec3, ctx: ToolContext, screen?: Vec2): void {
    const at = screen ?? this.lastScreen ?? ctx.viewport.worldToScreen(point)

    switch (this.state.phase) {
      case "center":
        this.state = {
          phase: "radius",
          center: point,
          cursor: point,
          diameter: this.active === "centerDiameter",
        }
        this.openRadiusInput(ctx, at)
        break
      case "p1":
        this.state = { phase: "p2", p1: point, cursor: point }
        this.openPointInput(ctx, "secondPoint", at)
        break
      case "p2":
        if (this.active === "twoPoint") {
          this.commitTwoPoint(this.state.p1, point, ctx)
          return
        }
        this.state = {
          phase: "p3",
          p1: this.state.p1,
          p2: point,
          cursor: point,
        }
        this.openPointInput(ctx, "thirdPoint", at)
        break
      case "p3":
        this.commitThreePoint(this.state.p1, this.state.p2, point, ctx)
        return
    }
    ctx.requestRender()
  }

  onKeyDown(input: KeyInput, ctx: ToolContext): void {
    if (input.key === "Escape") {
      this.active = this.mode
      this.state = this.initialState()
      ctx.dynamicInput.close()
      ctx.requestRender()
    }
  }

  getConstraintAnchor(): Vec2 | null {
    switch (this.state.phase) {
      case "radius":
        return this.state.center
      case "p2":
        return this.state.p1
      case "p3":
        return this.state.p2
      case "ttrRadius":
        return this.state.base
      default:
        return null
    }
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    const { viewport } = ctx
    const rubber = { color: THEME.rubberBand, width: 1 }
    const layer = ctx.document.getCurrentLayerId()
    const ghost = (circle: CircleEntity | null): ScenePrimitive[] =>
      circle ? entityScenePrimitive(viewport, circle, rubber) : []
    const segment = (a: Vec2, b: Vec2): ScenePrimitive => ({
      kind: "segment",
      a: viewport.worldToScreen(a),
      b: viewport.worldToScreen(b),
      stroke: rubber,
    })

    switch (this.state.phase) {
      case "radius": {
        const { center, cursor } = this.state
        const radius = this.resolveRadius(ctx)
        // AutoCAD draws the size line from the centre to the cursor. In diameter
        // mode the cursor sits at the diameter distance (2× the radius), so the
        // line runs out past the rim — its length is the diameter, which is the
        // visual cue that the diameter (not the radius) is being specified.
        return [
          segment(center, cursor),
          ...ghost(circleAt(center, radius, center, layer, PREVIEW_ID)),
        ]
      }
      case "p2": {
        const { p1, cursor } = this.state
        const chord = segment(p1, cursor)
        // Three-point: only two points so far — show the chord.
        if (this.active !== "twoPoint") return [chord]
        return [chord, ...ghost(twoPointCircle(p1, cursor, layer, PREVIEW_ID))]
      }
      case "p3": {
        const { p1, p2, cursor } = this.state
        return ghost(threePointCircle(p1, p2, cursor, layer, PREVIEW_ID))
      }
      case "tangentFirst":
      case "tangentSecond": {
        const { hover } = this.state
        return hover
          ? entityScenePrimitive(viewport, hover, {
              color: THEME.selected,
              width: 2,
            })
          : []
      }
      case "ttrRadius": {
        const { base, cursor } = this.state
        const radius = this.resolveTtrRadius(ctx)
        return [
          ...(base ? [segment(base, cursor)] : []),
          ...ghost(
            radius === null ? null : this.ttrCircle(radius, layer, PREVIEW_ID)
          ),
        ]
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
    const value = typed ?? V.distance(this.state.center, this.state.cursor)
    return this.state.diameter ? value / 2 : value
  }

  private commitRadiusAt(point: Vec2, ctx: ToolContext): void {
    if (this.state.phase !== "radius") return
    const typed = parseField(ctx, "radius")
    // A typed value hard-locks the size; otherwise the click distance from the
    // centre is the value. In diameter mode that value is the diameter.
    const value = typed ?? V.distance(this.state.center, point)
    const radius = this.state.diameter ? value / 2 : value
    const { center } = this.state
    this.commitCircle(circleAt(center, radius, center, layerOf(ctx)), ctx)
  }

  private commitRadiusValue(value: number, ctx: ToolContext): void {
    if (this.state.phase !== "radius") return
    if (!(value > 0)) return
    const radius = this.state.diameter ? value / 2 : value
    const { center } = this.state
    this.commitCircle(circleAt(center, radius, center, layerOf(ctx)), ctx)
  }

  private commitTwoPoint(p1: Vec3, p2: Vec3, ctx: ToolContext): void {
    this.commitCircle(twoPointCircle(p1, p2, layerOf(ctx)), ctx)
  }

  private commitThreePoint(
    p1: Vec3,
    p2: Vec3,
    p3: Vec3,
    ctx: ToolContext
  ): void {
    // Collinear: ignored, the third point is asked again.
    this.commitCircle(threePointCircle(p1, p2, p3, layerOf(ctx)), ctx)
  }

  /** Ttr's circle of `radius`, or AutoCAD's "Circle does not exist." and the end. */
  private commitTtr(radius: number, ctx: ToolContext): void {
    if (!(radius > 0)) return
    const circle = this.ttrCircle(radius, layerOf(ctx))
    if (circle) {
      this.commitCircle(circle, ctx)
      return
    }
    ctx.report(ctx.text.message("circleDoesNotExist"), "error")
    ctx.endCommand()
  }

  /**
   * The circle of `radius` tangent to both objects. Of the several that may
   * fit, "the program draws the circle of the specified radius whose tangent
   * points are closest to the selected points".
   */
  private ttrCircle(
    radius: number,
    layerId: LayerId,
    id?: EntityId
  ): CircleEntity | null {
    if (this.state.phase !== "ttrRadius") return null
    const { first, second } = this.state
    const reach = (fit: { touchFirst: Vec2; touchSecond: Vec2 }): number =>
      V.distance(fit.touchFirst, first.pick) +
      V.distance(fit.touchSecond, second.pick)
    const best = circlesTangentToBoth(first.target, second.target, radius).sort(
      (a, b) => reach(a) - reach(b)
    )[0]
    return best ? circleAt(best.center, radius, first.at, layerId, id) : null
  }

  /** Ttr's radius as it stands: typed, else the two points' distance. */
  private resolveTtrRadius(ctx: ToolContext): number | null {
    if (this.state.phase !== "ttrRadius") return null
    const typed = parseField(ctx, "radius")
    if (typed !== null) return typed
    const { base, cursor } = this.state
    return base ? V.distance(base, cursor) : null
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
    if (!isCoordinateExpression(text)) return false

    const last = this.previousPoint()
    const point = parseCoordinate(text, {
      lastPoint: last,
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
      // Enter with nothing typed takes CIRCLERAD; with none, it ends CIRCLE.
      commitRaw: (commitCtx) => {
        const { radius } = this.lastRadius
        if (commitCtx.dynamicInput.hasTypedText() || !(radius > 0)) {
          return false
        }
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
      // Enter with nothing typed takes CIRCLERAD; with none, it ends CIRCLE.
      commitRaw: (commitCtx) => {
        const { radius } = this.lastRadius
        if (commitCtx.dynamicInput.hasTypedText() || !(radius > 0)) {
          return false
        }
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
 * The 2P circle, in the UCS plane through its first point.
 * WHY not in the two points' own plane: two points fix no plane, and what
 * AutoCAD does with two at different heights is not documented.
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

/**
 * The 3P circle: through the three points, in their own plane when they are at
 * different heights, as AutoCAD's is. `null` when they lie on one line.
 */
function threePointCircle(
  p1: Vec3,
  p2: Vec3,
  p3: Vec3,
  layerId: LayerId,
  id?: EntityId
): CircleEntity | null {
  const plane = planeThrough(p1, p2, p3)
  if (!plane) {
    const solved = circleFrom3Points(p1, p2, p3)
    return solved && circleAt(solved.center, solved.radius, p1, layerId, id)
  }
  const [a, b, c] = plane.points
  const solved = circleFrom3Points(a, b, c)
  if (!solved || !(solved.radius > 0)) return null
  return withNormal(
    withElevation(createCircle(solved.center, solved.radius, layerId, id), a.z),
    plane.normal
  )
}

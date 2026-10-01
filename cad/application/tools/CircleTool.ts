import { Vec2, V } from "../../geometry/Vec2"
import { Vec3 } from "../../geometry/Vec3"
import { circleFrom3Points } from "../../geometry/primitives"
import {
  CircleEntity,
  EntityId,
  createCircle,
  onPlaneOf,
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
import { KeyInput, PointerInput, Tool, ToolContext } from "./Tool"
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
 *
 * Tan-Tan-Radius is future work (it needs a tangent-solver over two objects).
 */
export type CircleMode = "center" | "centerDiameter" | "twoPoint" | "threePoint"

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

/**
 * The circle tool — AutoCAD's CIRCLE. One class parameterised by {@link
 * CircleMode}, registered once per mode. It never mutates the document: the
 * finished circle is submitted as an {@link AddEntityCommand}, so it is
 * undoable, and the command ends the moment the circle is defined (CIRCLE is a
 * single-shot command in AutoCAD).
 */
export class CircleTool implements Tool {
  readonly id: string
  readonly shortcut?: string

  private readonly mode: CircleMode
  private state: CircleToolState
  private lastScreen: Vec2 | null = null

  constructor(mode: CircleMode, id: string, shortcut?: string) {
    this.mode = mode
    this.id = id
    this.shortcut = shortcut
    this.state = this.initialState()
  }

  private initialState(): CircleToolState {
    return this.isCenterMode() ? { phase: "center" } : { phase: "p1" }
  }

  /** Whether this instance starts from a centre point (radius or diameter). */
  private isCenterMode(): boolean {
    return this.mode === "center" || this.mode === "centerDiameter"
  }

  /** Whether the size field means the diameter (else the radius). */
  private get diameterMode(): boolean {
    return this.mode === "centerDiameter"
  }

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    ctx.selection.clear()
    this.state = this.initialState()
    this.openPointInput(ctx, this.firstPrompt())
  }

  onDeactivate(ctx: ToolContext): void {
    this.state = this.initialState()
    ctx.dynamicInput.close()
  }

  private firstPrompt(): PromptId {
    return this.isCenterMode() ? "center" : "firstPoint"
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
        ctx.dynamicInput.setPosition(input.screen)
        break
      }
      case "p2":
      case "p3":
        this.state = { ...this.state, cursor: input.point }
        ctx.dynamicInput.setPosition(input.screen)
        break
      case "center":
      case "p1":
        ctx.dynamicInput.setPosition(input.screen)
        break
    }

    ctx.requestRender()
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0) return

    if (this.state.phase === "radius") {
      this.commitRadiusAt(input.point, ctx)
      return
    }
    this.advanceWithPoint(input.point, ctx, input.screen)
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
          diameter: this.diameterMode,
        }
        this.openRadiusInput(ctx, at)
        break
      case "p1":
        this.state = { phase: "p2", p1: point, cursor: point }
        this.openPointInput(ctx, "secondPoint", at)
        break
      case "p2":
        if (this.mode === "twoPoint") {
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

    switch (this.state.phase) {
      case "radius": {
        const { center, cursor } = this.state
        const radius = this.resolveRadius(ctx)
        // AutoCAD draws the size line from the centre to the cursor. In diameter
        // mode the cursor sits at the diameter distance (2× the radius), so the
        // line runs out past the rim — its length is the diameter, which is the
        // visual cue that the diameter (not the radius) is being specified.
        return [
          {
            kind: "segment",
            a: viewport.worldToScreen(center),
            b: viewport.worldToScreen(cursor),
            stroke: rubber,
          },
          ...ghost(circleAt(center, radius, center, layer, PREVIEW_ID)),
        ]
      }
      case "p2": {
        const { p1, cursor } = this.state
        const chord: ScenePrimitive = {
          kind: "segment",
          a: viewport.worldToScreen(p1),
          b: viewport.worldToScreen(cursor),
          stroke: rubber,
        }
        // Three-point: only two points so far — show the chord.
        if (this.mode !== "twoPoint") return [chord]
        return [chord, ...ghost(twoPointCircle(p1, cursor, layer, PREVIEW_ID))]
      }
      case "p3": {
        const { p1, p2, cursor } = this.state
        return ghost(threePointCircle(p1, p2, cursor, layer, PREVIEW_ID))
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

  private commitCircle(circle: CircleEntity | null, ctx: ToolContext): void {
    if (!circle) return
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
    }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setLive("radius", 0)
    ctx.dynamicInput.setPosition(screen)
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

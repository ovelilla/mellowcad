import { V, Vec2 } from "../../geometry/Vec2"
import { Vec3, add3, length3, scale3, sub3 } from "../../geometry/Vec3"
import { arbitraryAxis } from "../../geometry/ocs"
import { PyramidPrimitive, createSolid } from "../../domain/entities"
import {
  ucsDirectionToWorld,
  ucsPointToWorld,
  worldDirectionToUcs,
  worldPointToUcs,
} from "../../domain/ucs"
import { AddEntityCommand } from "../commands/entityCommands"
import {
  isCoordinateExpression,
  parseCoordinate,
} from "../input/coordinateInput"
import { ScenePrimitive } from "../../scene/types"
import { entityScenePrimitive } from "../SceneBuilder"
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

const MIN_SIDES = 3
const MAX_SIDES = 32
const PREVIEW_ID = "pyramid-preview"

/**
 * The base as given, in the UCS: its centre, the way to the middle of one of
 * its sides, and the circle its corners lie on.
 */
interface Base {
  readonly center: Vec3
  readonly along: Vec2
  readonly radius: number
}

type PyramidToolState =
  | { readonly phase: "center" | "sides" | "edgeFirst" }
  | {
      readonly phase: "edgeSecond"
      readonly first: Vec3
      readonly cursor: Vec3
    }
  | { readonly phase: "radius"; readonly center: Vec3; readonly cursor: Vec3 }
  /** `top` is the top's radius once Top radius has given one. */
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

/**
 * AutoCAD's PYRAMID, as 2027's console asks it (solid/y01–y10): ` 4 sides
 * Circumscribed`, then `Specify center point of base or [Edge/Sides]:`,
 * `Specify base radius or [Inscribed]:` and `Specify height or [2Point/Axis
 * endpoint/Top radius]:`. Sides asks `Enter number of sides <4>:` (3 to 32)
 * and the centre again; Edge two endpoints, the base to their left;
 * Inscribed and Circumscribed switch how the radius is read — to a corner or
 * to the middle of a side — and ask it again. A typed radius turns the base
 * towards the cursor, a point towards itself; Enter takes the last radius as
 * its corners' (y05). Top radius asks `Specify top radius <0.0000>:`, read as
 * the base's is, and the height again without it; Axis endpoint tilts the
 * base into the plane the axis is normal to, in that plane's OCS (y09). The
 * sides, the Type and the defaults are the primitives' shared ones
 * ({@link SolidDefaults}).
 */
export class PyramidTool implements Tool {
  readonly id = "pyramid"

  private state: PyramidToolState = { phase: "center" }
  private lastScreen: Vec2 | null = null

  constructor(private readonly defaults: SolidDefaults = solidDefaults()) {}

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    ctx.selection.clear()
    this.state = { phase: "center" }
    ctx.report(
      ctx.text.message("pyramidSettings", {
        sides: this.defaults.sides,
        type: this.defaults.inscribed ? "inscribed" : "circumscribed",
      })
    )
    this.openPoint(ctx, "pyramidCenterOr")
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
    if (input.button !== 0 || this.state.phase === "sides") return
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
    const { radius, height, sides, inscribed, topRadius } = this.defaults
    switch (state.phase) {
      case "center":
        return "pyramidCenterOr"
      case "sides":
        return { id: "enterNumberOfSides", enter: { count: sides } }
      case "edgeFirst":
        return "specifyFirstEndpointOfEdge"
      case "edgeSecond":
        return "specifySecondEndpointOfEdge"
      case "radius": {
        // pt-BR words the two apart (`raio base  ou`, `raio de base ou`, y02).
        const id = inscribed ? "specifyBaseRadiusOr" : "pyramidBaseRadiusOr"
        return radius === null ? id : { id, enter: radius }
      }
      case "height": {
        const id = state.top === null ? "solidHeightTopOr" : "solidHeightOr"
        return height === null ? id : { id, enter: height }
      }
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

  /**
   * The words each prompt refuses `FOO` with (y03, y05, y06): the sides'
   * range, a point's `Invalid point.` where no keyword is offered, a
   * distance's, the top radius' without keyword.
   */
  takes(): QuestionInput | null {
    switch (this.state.phase) {
      case "sides":
        return {
          refusal: "requiresIntegerBetween",
          values: { min: MIN_SIDES, max: MAX_SIDES },
        }
      case "edgeFirst":
      case "edgeSecond":
      case "axis":
        return { refusal: "invalidPoint" }
      case "twoFirst":
      case "twoSecond":
        return { refusal: "pointOrKeywordRequired" }
      case "radius":
      case "height":
        return {
          refusal: "requiresDistance",
          values: { points: "second", keyword: "yes" },
        }
      case "top":
        return {
          refusal: "requiresDistance",
          values: { points: "second", keyword: "no" },
        }
      default:
        return null
    }
  }

  commandOptions(): readonly CommandOption[] {
    const state = this.state
    switch (state.phase) {
      case "center":
        return [{ id: "Edge" }, { id: "Sides" }]
      case "radius":
        return [{ id: this.defaults.inscribed ? "Circumscribed" : "Inscribed" }]
      case "height":
        return state.top === null
          ? [{ id: "2Point" }, { id: "Axis" }, { id: "Top" }]
          : [{ id: "2Point" }, { id: "Axis" }]
      default:
        return []
    }
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    const state = this.state
    if (state.phase === "center" && id === "Sides") {
      this.state = { phase: "sides" }
      this.openSides(ctx)
      return "continue"
    }
    if (state.phase === "center" && id === "Edge") {
      this.state = { phase: "edgeFirst" }
      this.openPoint(ctx, "specifyFirstEndpointOfEdge")
      return "continue"
    }
    if (
      state.phase === "radius" &&
      (id === "Inscribed" || id === "Circumscribed")
    ) {
      this.defaults.inscribed = id === "Inscribed"
      this.openDistance(ctx)
      return "continue"
    }
    if (state.phase === "height") {
      if (id === "2Point") {
        this.state = { ...state, phase: "twoFirst" }
        this.openPoint(ctx, "specifyFirstPoint")
        return "continue"
      }
      if (id === "Axis") {
        this.state = { ...state, phase: "axis" }
        this.openPoint(ctx, "specifyAxisEndpoint")
        return "continue"
      }
      if (id === "Top" && state.top === null) {
        this.state = { ...state, phase: "top" }
        this.openDistance(ctx)
        return "continue"
      }
    }
    return "unhandled"
  }

  wantsSnap(): boolean {
    return this.state.phase !== "sides"
  }

  getConstraintAnchor(ctx: ToolContext): Vec3 | null {
    const state = this.state
    switch (state.phase) {
      case "edgeSecond":
        return state.first
      case "radius":
        return state.center
      case "height":
      case "axis":
        return state.base.center
      case "top":
        return this.topFrom(state.base, state.cursor, ctx)
      case "twoSecond":
        return state.first
      default:
        return null
    }
  }

  /** The base as the cursor turns and sizes it, then the pyramid as it rises. */
  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    const state = this.state
    const stroke = { color: currentColor(ctx), width: 1 }
    const ghost = (primitive: PyramidPrimitive | null) =>
      primitive
        ? entityScenePrimitive(
            ctx.viewport,
            createSolid(
              primitive,
              ctx.document.getCurrentLayerId(),
              PREVIEW_ID
            ),
            stroke
          )
        : []
    switch (state.phase) {
      case "edgeSecond": {
        const base = this.edgeBase(state.first, state.cursor, ctx)
        return base ? this.baseOutline(base, ctx, stroke) : []
      }
      case "radius": {
        const base = this.radiusBase(
          state.center,
          this.distanceTo(state.center, state.cursor),
          state.cursor,
          ctx
        )
        return base ? this.baseOutline(base, ctx, stroke) : []
      }
      case "height": {
        const height = this.distanceTo(state.base.center, state.cursor)
        return height > 0
          ? ghost(this.primitive(state.base, state.top, { height }, ctx))
          : []
      }
      case "axis":
        return ghost(
          this.primitive(state.base, state.top, { axis: state.cursor }, ctx)
        )
      default:
        return []
    }
  }

  private distanceTo(from: Vec3, to: Vec3): number {
    return length3(sub3(to, from))
  }

  private takePoint(point: Vec3, ctx: ToolContext): void {
    const state = this.state
    switch (state.phase) {
      case "center":
        this.state = { phase: "radius", center: point, cursor: point }
        this.openDistance(ctx)
        return
      case "edgeFirst":
        this.state = { phase: "edgeSecond", first: point, cursor: point }
        this.openPoint(ctx, "specifySecondEndpointOfEdge")
        return
      case "edgeSecond": {
        const base = this.edgeBase(state.first, point, ctx)
        if (!base) {
          // Asked again (y06).
          ctx.report(ctx.text.message("positiveNonzero"), "error")
          return
        }
        this.askHeight(base, ctx)
        return
      }
      case "radius":
        this.takeRadius(this.distanceTo(state.center, point), point, ctx)
        return
      case "height":
        this.takeHeight(this.distanceTo(state.base.center, point), ctx)
        return
      case "twoFirst":
        this.state = { ...state, phase: "twoSecond", first: point }
        this.openPoint(ctx, "specifySecondPoint")
        return
      case "twoSecond":
        this.takeHeight(this.distanceTo(state.first, point), ctx)
        return
      case "axis":
        if (this.distanceTo(state.base.center, point) === 0) {
          ctx.report(ctx.text.message("boxValueNonzero"), "error")
          return
        }
        this.commit(state.base, state.top, { axis: point }, ctx)
        return
      case "top":
        this.takeTop(
          this.distanceTo(this.topFrom(state.base, state.cursor, ctx), point),
          ctx
        )
        return
    }
  }

  /**
   * Where a point at Top radius is measured from: the axis at the height the
   * cursor gave the ghost (the console's BasePoint, k02).
   */
  private topFrom(base: Base, cursor: Vec3, ctx: ToolContext): Vec3 {
    const up = ucsDirectionToWorld(ctx.ucs, { x: 0, y: 0, z: 1 })
    return add3(base.center, scale3(up, this.distanceTo(base.center, cursor)))
  }

  /** The polygon on the edge from `first` to `second`, to its left (y02, y06). */
  private edgeBase(first: Vec3, second: Vec3, ctx: ToolContext): Base | null {
    const a = worldPointToUcs(ctx.ucs, first)
    const b = worldPointToUcs(ctx.ucs, second)
    const side = V.sub(b, a)
    const size = V.length(side)
    if (size === 0) return null
    const n = this.defaults.sides
    const left = V.perpendicular(V.scale(side, 1 / size))
    const apothem = size / (2 * Math.tan(Math.PI / n))
    const middle = V.lerp(a, b, 0.5)
    return {
      center: ucsPointToWorld(ctx.ucs, {
        ...V.add(middle, V.scale(left, apothem)),
        z: a.z,
      }),
      along: V.scale(left, -1),
      radius: size / (2 * Math.sin(Math.PI / n)),
    }
  }

  /**
   * The base a radius gives, read as Type says: to a corner when Inscribed,
   * else to the middle of a side, turned towards `toward` (y01, y02).
   */
  private radiusBase(
    center: Vec3,
    radius: number,
    toward: Vec3 | null,
    ctx: ToolContext
  ): Base | null {
    if (!(radius > 0)) return null
    const n = this.defaults.sides
    const { inscribed } = this.defaults
    const offset = toward
      ? V.sub(
          worldPointToUcs(ctx.ucs, toward),
          worldPointToUcs(ctx.ucs, center)
        )
      : { x: 0, y: 0 }
    const heading = V.length(offset) > 0 ? Math.atan2(offset.y, offset.x) : 0
    const angle = heading + (inscribed ? Math.PI / n : 0)
    return {
      center,
      along: { x: Math.cos(angle), y: Math.sin(angle) },
      radius: inscribed ? radius : radius / Math.cos(Math.PI / n),
    }
  }

  /**
   * A radius typed or picked: 0 or less is refused (y03, y04); typed, the
   * base turns towards the cursor.
   */
  private takeRadius(radius: number, toward: Vec3, ctx: ToolContext): void {
    if (this.state.phase !== "radius") return
    const base = this.radiusBase(this.state.center, radius, toward, ctx)
    if (!base) {
      ctx.report(ctx.text.message("positiveNonzero"), "error")
      return
    }
    this.askHeight(base, ctx)
  }

  private askHeight(base: Base, ctx: ToolContext): void {
    this.defaults.radius = base.radius
    this.state = { phase: "height", base, top: null, cursor: base.center }
    this.openDistance(ctx)
  }

  /** `Value must be nonzero.` for none (y03); a negative one runs down. */
  private takeHeight(height: number, ctx: ToolContext): void {
    const state = this.state
    if (state.phase !== "height" && state.phase !== "twoSecond") return
    if (height === 0) {
      ctx.report(ctx.text.message("boxValueNonzero"), "error")
      return
    }
    this.commit(state.base, state.top, { height }, ctx)
  }

  /** The top radius, read as the base's is; `Value must be positive.` below 0. */
  private takeTop(radius: number, ctx: ToolContext): void {
    const state = this.state
    if (state.phase !== "top") return
    if (radius < 0) {
      ctx.report(ctx.text.message("valueMustBePositive"), "error")
      return
    }
    const n = this.defaults.sides
    const top = this.defaults.inscribed
      ? radius
      : radius / Math.cos(Math.PI / n)
    this.defaults.topRadius = top
    this.state = { ...state, phase: "height", top }
    this.openDistance(ctx)
  }

  /**
   * The pyramid on `base`: rising `height` along the UCS's Z, down when
   * negative, or to `axis`, its base then in the plane normal to it, turned
   * by the same angle in that plane's OCS (y09).
   */
  private primitive(
    base: Base,
    top: number | null,
    rise: { readonly height: number } | { readonly axis: Vec3 },
    ctx: ToolContext
  ): PyramidPrimitive | null {
    const unit = (d: Vec3) => {
      const w = ucsDirectionToWorld(ctx.ucs, d)
      return scale3(w, 1 / length3(w))
    }
    let xAxis = unit({ ...base.along, z: 0 })
    let normal = unit({ x: 0, y: 0, z: 1 })
    let height: number
    if ("axis" in rise) {
      height = this.distanceTo(base.center, rise.axis)
      if (height === 0) return null
      const n = scale3(
        worldDirectionToUcs(ctx.ucs, sub3(rise.axis, base.center)),
        1 / height
      )
      const axes = arbitraryAxis(n)
      if (!axes) return null
      xAxis = unit(
        add3(scale3(axes.x, base.along.x), scale3(axes.y, base.along.y))
      )
      normal = unit(n)
    } else {
      height = Math.abs(rise.height)
      if (rise.height < 0) normal = scale3(normal, -1)
    }
    return {
      kind: "pyramid",
      position: base.center,
      xAxis,
      normal,
      sides: this.defaults.sides,
      radius: base.radius,
      topRadius: top ?? 0,
      height,
      inscribed: this.defaults.inscribed,
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
    const solid = createSolid(primitive, ctx.document.getCurrentLayerId())
    this.state = { phase: "center" }
    ctx.execute(new AddEntityCommand(withCurrentProperties(solid, ctx)))
    ctx.endCommand()
  }

  private baseOutline(
    base: Base,
    ctx: ToolContext,
    stroke: { color: string; width: number }
  ): ScenePrimitive[] {
    const n = this.defaults.sides
    const center = worldPointToUcs(ctx.ucs, base.center)
    const turn = Math.atan2(base.along.y, base.along.x)
    const points = Array.from({ length: n }, (_, k) => {
      const angle = turn + (Math.PI * (2 * k + 1)) / n
      return ctx.viewport.worldToScreen(
        ucsPointToWorld(ctx.ucs, {
          x: center.x + base.radius * Math.cos(angle),
          y: center.y + base.radius * Math.sin(angle),
          z: center.z,
        })
      )
    })
    return [{ kind: "path", points, closed: true, stroke }]
  }

  private openSides(ctx: ToolContext): void {
    ctx.dynamicInput.open({
      fields: [{ id: "sides", prompt: "numberOfSides", kind: "number" }],
      commit: (values, commitCtx) => this.takeSides(values.sides, commitCtx),
    })
    ctx.dynamicInput.setDefault("sides", this.defaults.sides)
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  /** A count outside 3–32, or not written as an integer, is refused and asked again (y03). */
  private takeSides(value: number, ctx: ToolContext): void {
    if (this.state.phase !== "sides") return
    const typed = ctx.dynamicInput.getText("sides").trim()
    const written = typed === "" || /^[+-]?\d+$/.test(typed)
    if (
      !written ||
      !Number.isInteger(value) ||
      value < MIN_SIDES ||
      value > MAX_SIDES
    ) {
      ctx.report(
        ctx.text.message("requiresIntegerBetween", {
          min: MIN_SIDES,
          max: MAX_SIDES,
        }),
        "error"
      )
      this.openSides(ctx)
      return
    }
    this.defaults.sides = value
    this.state = { phase: "center" }
    this.openPoint(ctx, "pyramidCenterOr")
  }

  private openPoint(ctx: ToolContext, prompt: PromptId): void {
    ctx.dynamicInput.open({
      fields: [{ id: "point", prompt, kind: "coordinate" }],
      commit: () => {},
      commitRaw: (commitCtx) => this.commitTypedPoint(commitCtx),
    })
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }

  /**
   * A distance's box: a number typed is the value, a coordinate a point, and
   * Enter takes the default or is refused as `FOO` is (y03, y05).
   */
  private openDistance(ctx: ToolContext): void {
    const question = this.question()
    const prompt = typeof question === "string" ? question : question.id
    const enter =
      typeof question === "string" || typeof question.enter !== "number"
        ? null
        : question.enter
    ctx.dynamicInput.open({
      fields: [{ id: "value", prompt, kind: "distance" }],
      // Enter commits the default the box holds: read as the default it is.
      commit: (values, commitCtx) => {
        if (!Number.isFinite(values.value)) return
        const typed = commitCtx.dynamicInput.hasTypedText()
        this.takeValue(values.value, typed ? null : "default", commitCtx)
      },
      commitRaw: (commitCtx) => {
        if (commitCtx.dynamicInput.hasTypedText()) {
          return this.commitTypedPoint(commitCtx)
        }
        if (enter !== null) {
          this.takeValue(enter, "default", commitCtx)
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

  /**
   * A typed radius, height or top radius; `"default"` when Enter took the
   * prompt's own: the last radius then gives the corners' circle, unturned
   * (y05, y10).
   */
  private takeValue(
    value: number,
    from: "default" | null,
    ctx: ToolContext
  ): void {
    const state = this.state
    switch (state.phase) {
      case "radius": {
        if (from === "default") {
          const { inscribed, sides } = this.defaults
          const base = this.radiusBase(
            state.center,
            inscribed ? value : value * Math.cos(Math.PI / sides),
            null,
            ctx
          )
          if (base) this.askHeight(base, ctx)
          return
        }
        this.takeRadius(value, state.cursor, ctx)
        return
      }
      case "height":
        this.takeHeight(value, ctx)
        return
      case "top":
        if (from === "default") {
          this.state = { ...state, phase: "height", top: value }
          this.openDistance(ctx)
          return
        }
        this.takeTop(value, ctx)
        return
    }
  }

  /** Enter where nothing is offered: refused as `FOO` is. */
  private refuse(ctx: ToolContext): void {
    const takes = this.takes() ?? { refusal: "pointOrKeywordRequired" }
    if (typeof takes !== "object") return
    const [id] =
      typeof takes.refusal === "string" ? [takes.refusal] : takes.refusal
    ctx.report(ctx.text.message(id, takes.values ?? {}), "error")
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

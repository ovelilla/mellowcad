import { Vec2 } from "../../geometry/Vec2"
import {
  Vec3,
  cross3,
  dot3,
  length3,
  normalize3,
  sub3,
} from "../../geometry/Vec3"
import { axesToWorld } from "../../geometry/ocs"
import { MODEL_TOLERANCE } from "../../geometry/planarCurves"
import { SolidBooleanError } from "../../geometry/solidBooleans"
import { CutPlane } from "../../geometry/solidEdits"
import {
  Entity,
  RegionEntity,
  Solid3dEntity,
  entityElevation,
  isLevel,
  planeAxes,
} from "../../domain/entities"
import { SliceSide, sliceSolid, solidSection } from "../../domain/solidModeling"
import {
  AddEntitiesCommand,
  ReplaceEntitiesCommand,
} from "../commands/entityCommands"
import {
  isCoordinateExpression,
  parseCoordinate,
} from "../input/coordinateInput"
import type { PromptId } from "../../locales/types"
import { ScenePrimitive } from "../../scene/types"
import {
  CommandOption,
  CommandOptionOutcome,
  PointerInput,
  QuestionInput,
  Tool,
  ToolContext,
  ToolQuestion,
} from "./Tool"
import { withCurrentProperties } from "./currentProperties"
import { ONE_OBJECT_MODES, ObjectSelector } from "./objectSelection"

type Axis = "XY" | "YZ" | "ZX"

type PlaneCutState =
  | { readonly phase: "select" }
  | { readonly phase: "start" }
  | { readonly phase: "second"; readonly first: Vec3 }
  | { readonly phase: "object" }
  | { readonly phase: "surface" }
  | { readonly phase: "zPoint" }
  | { readonly phase: "zAxis"; readonly at: Vec3 }
  | { readonly phase: "view" }
  | { readonly phase: "axis"; readonly axis: Axis }
  | { readonly phase: "first" }
  | { readonly phase: "secondOf3"; readonly first: Vec3 }
  | { readonly phase: "third"; readonly first: Vec3; readonly second: Vec3 }
  | { readonly phase: "side"; readonly plane: CutPlane }

const ORIGIN: Vec3 = { x: 0, y: 0, z: 0 }

/** The UCS planes XY, YZ and ZX, by their normals: Z, X and Y. */
const AXIS_NORMAL: Record<Axis, Vec3> = {
  XY: { x: 0, y: 0, z: 1 },
  YZ: { x: 1, y: 0, z: 0 },
  ZX: { x: 0, y: 1, z: 0 },
}

const AXIS_PROMPT: Record<Axis, PromptId> = {
  XY: "planeXYPoint",
  YZ: "planeYZPoint",
  ZX: "planeZXPoint",
}

/**
 * AutoCAD's SLICE and SECTION, one class by its mode, as 2027's console asks
 * them in en, es and pt-BR (slice/s01–s13, section/c01–c09): the set
 * (`Select objects to slice:` or `Select objects:`, whole objects, what is
 * no solid passed over), then the plane — SLICE's `Specify start point of
 * slicing plane or [planar Object/Surface/Zaxis/View/XY/YZ/ZX/3points]
 * <3points>:`, a point there its first of two square to the UCS's XY
 * (`Specify second point on plane:`, `First and second points must have
 * distinct X,Y coordinates. *Invalid*`); SECTION's `Specify first point on
 * Section plane by [Object/Zaxis/View/XY/YZ/ZX/3points] <3points>:`, a point
 * there the first of three —, a circle, ellipse, arc, 2D spline or 2D
 * polyline's plane (Object), a point and one on its normal (Zaxis), the
 * view's plane, the UCS's XY, YZ or ZX through a point (`<0,0,0>`), three
 * points; SLICE's Surface finds none (`No surfaces selected.`, Enter ends).
 * SLICE then asks `Specify a point on desired side or [keep Both sides]
 * <Both>:` (`The point should not be on the slicing plane.`): the side kept
 * keeps the object, Both the one the plane's normal points to, the other a
 * new solid of its layer and properties (s01, s03, s09). SECTION adds a
 * region of each solid it cuts, on the current layer with the current
 * properties (c09). A solid the plane misses or only touches is said
 * (`Slicing plane does not intersect the selected solid.`). One undo step.
 */
export class PlaneCutTool implements Tool {
  readonly id: "slice" | "section"

  private state: PlaneCutState = { phase: "select" }
  private solids: Solid3dEntity[] = []
  private lastScreen: Vec2 | null = null
  private readonly selector = new ObjectSelector({
    takes: () => "wholeObjects",
    done: (ctx) => this.closeSet(ctx),
    question: () =>
      this.id === "slice" ? "selectObjectsToSlice" : "selectObjects",
  })
  private readonly objectPick = new ObjectSelector({
    takes: () => "singleSet",
    done: () => {},
    question: () => (this.id === "slice" ? "sliceObject" : "sectionObject"),
    modes: ONE_OBJECT_MODES,
    one: {
      take: (entity, ctx) => this.takeObject(entity, ctx),
      newest: true,
      pick: (point, ctx) => {
        const hit = ctx.pick(point)
        if (hit) this.takeObject(hit, ctx)
      },
    },
  })

  constructor(mode: "slice" | "section") {
    this.id = mode
  }

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    this.solids = []
    this.state = { phase: "select" }
    this.selector.start()
    if (this.selector.preselect(ctx)) this.closeSet(ctx)
  }

  onDeactivate(ctx: ToolContext): void {
    this.state = { phase: "select" }
    this.solids = []
    this.selector.start()
    this.objectPick.start()
    ctx.dynamicInput.close()
  }

  question(): PromptId | ToolQuestion {
    const state = this.state
    switch (state.phase) {
      case "select":
        return this.selector.question()
      case "object":
        return this.objectPick.question()
      case "start":
        return this.id === "slice" ? "sliceStartOr" : "sectionFirstPointOr"
      case "second":
      case "secondOf3":
        return "planeSecondPoint"
      case "surface":
        return "sliceSurface"
      case "zPoint":
        return "planeSectionPoint"
      case "zAxis":
        return "planeZAxisPoint"
      case "view":
        return { id: "planeViewPoint", enter: { name: "0,0,0" } }
      case "axis":
        return { id: AXIS_PROMPT[state.axis], enter: { name: "0,0,0" } }
      case "first":
        return "planeFirstPoint"
      case "third":
        return "planeThirdPoint"
      // WHY `<Both>`, not the keyword's label: AutoCAD's default names it short.
      case "side":
        return { id: "sliceSideOr", enter: "sliceBoth" }
    }
  }

  defaultOption(): string | null {
    return this.state.phase === "start" ? "3points" : null
  }

  takes(): QuestionInput | null {
    switch (this.state.phase) {
      case "select":
        return this.selector.takes()
      case "object":
        return this.objectPick.takes()
      case "surface":
        return "object"
      case "start":
      case "side":
        return { refusal: "pointOrKeywordRequired" }
      default:
        return { refusal: "invalidPoint" }
    }
  }

  commandOptions(): readonly CommandOption[] {
    switch (this.state.phase) {
      case "select":
        return this.selector.commandOptions()
      case "object":
        return this.objectPick.commandOptions()
      case "start":
        return this.id === "slice"
          ? [
              { id: "Object" },
              { id: "Surface" },
              { id: "Zaxis" },
              { id: "View" },
              { id: "XY" },
              { id: "YZ" },
              { id: "ZX" },
              { id: "3points" },
            ]
          : [
              { id: "Object" },
              { id: "Zaxis" },
              { id: "View" },
              { id: "XY" },
              { id: "YZ" },
              { id: "ZX" },
              { id: "3points" },
            ]
      case "side":
        return [{ id: "Both" }]
      default:
        return []
    }
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    const state = this.state
    switch (state.phase) {
      case "select":
        return this.selector.invokeOption(id, ctx) ? "continue" : "unhandled"
      case "object":
        return this.objectPick.invokeOption(id, ctx) ? "continue" : "unhandled"
      case "start":
        switch (id) {
          case "Object":
            this.state = { phase: "object" }
            this.objectPick.start()
            ctx.dynamicInput.close()
            return "continue"
          case "Surface":
            if (this.id !== "slice") return "unhandled"
            this.state = { phase: "surface" }
            ctx.dynamicInput.close()
            return "continue"
          case "Zaxis":
            this.ask({ phase: "zPoint" }, ctx)
            return "continue"
          case "View":
            this.ask({ phase: "view" }, ctx)
            return "continue"
          case "XY":
          case "YZ":
          case "ZX":
            this.ask({ phase: "axis", axis: id }, ctx)
            return "continue"
          case "3points":
            this.ask({ phase: "first" }, ctx)
            return "continue"
          default:
            return "unhandled"
        }
      case "side":
        if (id !== "Both") return "unhandled"
        this.slice(state.plane, "both", ctx)
        return "end"
      default:
        return "unhandled"
    }
  }

  onEnter(ctx: ToolContext): boolean {
    const state = this.state
    switch (state.phase) {
      case "select":
        return this.selector.onEnter(ctx)
      case "object":
        return this.objectPick.onEnter(ctx)
      case "start":
        this.ask({ phase: "first" }, ctx)
        return true
      // WHY ending: Enter at `Select a surface:` takes none, and the console
      // ends the command (slice/t1).
      case "surface":
        return false
      case "view":
      case "axis":
        this.takePoint(ORIGIN, ctx)
        return true
      case "side":
        this.slice(state.plane, "both", ctx)
        ctx.endCommand()
        return true
      default:
        ctx.report(ctx.text.message("invalidPoint"), "error")
        return true
    }
  }

  answerTyped(text: string, ctx: ToolContext): boolean {
    if (this.state.phase === "select")
      return this.selector.answerTyped(text, ctx)
    if (this.state.phase === "object")
      return this.objectPick.answerTyped(text, ctx)
    return false
  }

  cycleLasso(ctx: ToolContext): boolean {
    return this.state.phase === "select" && this.selector.cycleLasso(ctx)
  }

  wantsSnap(): boolean {
    switch (this.state.phase) {
      case "select":
        return this.selector.wantsSnap()
      case "object":
        return this.objectPick.wantsSnap()
      case "surface":
        return false
      default:
        return true
    }
  }

  getConstraintAnchor(): Vec3 | null {
    const state = this.state
    switch (state.phase) {
      case "second":
      case "secondOf3":
      case "third":
        return state.first
      case "zAxis":
        return state.at
      default:
        return null
    }
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen
    if (this.state.phase === "select") {
      this.selector.onPointerMove(input, ctx)
      return
    }
    if (this.state.phase === "object") {
      this.objectPick.onPointerMove(input, ctx)
      return
    }
    ctx.dynamicInput.setPosition(input.screen)
    ctx.requestRender()
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (this.state.phase === "select") {
      this.selector.onPointerDown(input, ctx)
      return
    }
    if (input.button !== 0) return
    if (this.state.phase === "object") {
      const hit = ctx.pick(input.point)
      if (hit) this.takeObject(hit, ctx)
      return
    }
    if (this.state.phase === "surface") {
      // No object here is a surface (slice/t1: a circle picked).
      ctx.report(ctx.text.message("noSurfacesSelected"), "error")
      return
    }
    this.takePoint(input.point, ctx)
  }

  onPointerUp(input: PointerInput, ctx: ToolContext): void {
    if (this.state.phase === "select") this.selector.onPointerUp(input, ctx)
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    if (this.state.phase === "select") return this.selector.buildOverlay(ctx)
    if (this.state.phase === "object") return this.objectPick.buildOverlay(ctx)
    return []
  }

  /**
   * The solids of the set; the rest passed over (s09). With none, SLICE ends
   * saying nothing (c09) and SECTION says so (c06).
   */
  private closeSet(ctx: ToolContext): void {
    const entities = ctx.selection
      .toArray()
      .map((id) => ctx.document.get(id))
      .filter((e): e is Entity => e !== undefined)
    ctx.selection.clear()
    this.solids = entities.filter(
      (e): e is Solid3dEntity => e.type === "solid3d"
    )
    if (this.solids.length === 0) {
      if (entities.length > 0 && this.id === "section") {
        ctx.report(ctx.text.message("noSolidsSelected"), "error")
      }
      ctx.endCommand()
      return
    }
    this.ask({ phase: "start" }, ctx)
  }

  private ask(state: PlaneCutState, ctx: ToolContext): void {
    this.state = state
    const prompt = this.question()
    ctx.dynamicInput.open({
      fields: [
        {
          id: "point",
          prompt: typeof prompt === "string" ? prompt : prompt.id,
          kind: "coordinate",
        },
      ],
      commit: () => {},
      commitRaw: (commitCtx) => this.commitTypedPoint(commitCtx),
    })
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }

  /**
   * An object's plane (Object): a circle's, an arc's, an ellipse's, a 2D
   * polyline's or a spline's lying in one, through it; any other is passed
   * over and the prompt asked again.
   */
  private takeObject(entity: Entity, ctx: ToolContext): void {
    const planar =
      entity.type === "circle" ||
      entity.type === "arc" ||
      entity.type === "ellipse" ||
      entity.type === "polyline" ||
      (entity.type === "spline" && isLevel(entity))
    if (!planar) return
    const axes = planeAxes(entity) ?? {
      x: { x: 1, y: 0, z: 0 },
      y: { x: 0, y: 1, z: 0 },
      z: { x: 0, y: 0, z: 1 },
    }
    const origin = axesToWorld(axes, {
      x: 0,
      y: 0,
      z: entityElevation(entity),
    })
    this.cut({ origin, normal: axes.z }, ctx)
  }

  /** A point given at the plane's prompts, picked or typed. */
  private takePoint(point: Vec3, ctx: ToolContext): void {
    const state = this.state
    switch (state.phase) {
      case "start":
        if (this.id === "slice")
          this.ask({ phase: "second", first: point }, ctx)
        else this.ask({ phase: "secondOf3", first: point }, ctx)
        return
      case "second": {
        // Square to the UCS's XY, through both: the second's Z left out.
        const dx = point.x - state.first.x
        const dy = point.y - state.first.y
        if (Math.hypot(dx, dy) <= this.tolerance(point)) {
          ctx.report(ctx.text.message("sliceDistinctXY"), "error")
          return
        }
        this.cut(
          {
            origin: state.first,
            normal: normalize3({ x: dy, y: -dx, z: 0 })!,
          },
          ctx
        )
        return
      }
      case "zPoint":
        this.ask({ phase: "zAxis", at: point }, ctx)
        return
      case "zAxis": {
        const normal = normalize3(sub3(point, state.at))
        if (
          !normal ||
          length3(sub3(point, state.at)) <= this.tolerance(point)
        ) {
          ctx.report(ctx.text.message("planeZIdentical"), "error")
          return
        }
        this.cut({ origin: state.at, normal }, ctx)
        return
      }
      case "view":
        this.cut(
          { origin: point, normal: normalize3(ctx.viewport.direction)! },
          ctx
        )
        return
      case "axis":
        this.cut({ origin: point, normal: AXIS_NORMAL[state.axis] }, ctx)
        return
      case "first":
        this.ask({ phase: "secondOf3", first: point }, ctx)
        return
      case "secondOf3":
        if (length3(sub3(point, state.first)) <= this.tolerance(point)) {
          ctx.report(ctx.text.message("planeFirstSecondIdentical"), "error")
          return
        }
        this.ask({ phase: "third", first: state.first, second: point }, ctx)
        return
      case "third": {
        const normal = normalize3(
          cross3(sub3(state.second, state.first), sub3(point, state.first))
        )
        const span = length3(sub3(state.second, state.first))
        const off = normal
          ? length3(
              cross3(sub3(state.second, state.first), sub3(point, state.first))
            ) / span
          : 0
        if (!normal || off <= this.tolerance(point)) {
          ctx.report(ctx.text.message("planeThirdCollinear"), "error")
          return
        }
        this.cut({ origin: state.first, normal }, ctx)
        return
      }
      case "side": {
        const d = dot3(sub3(point, state.plane.origin), state.plane.normal)
        if (Math.abs(d) <= this.tolerance(point)) {
          ctx.report(ctx.text.message("sliceOnPlane"), "error")
          return
        }
        this.slice(state.plane, d > 0 ? "front" : "back", ctx)
        ctx.endCommand()
        return
      }
      default:
        return
    }
  }

  /** The model's tolerance as large as a point's coordinates need. */
  private tolerance(point: Vec3): number {
    const size = Math.max(
      1,
      Math.abs(point.x),
      Math.abs(point.y),
      Math.abs(point.z)
    )
    return MODEL_TOLERANCE * size
  }

  /** The plane given: SLICE asks which side to keep, SECTION cuts at once. */
  private cut(plane: CutPlane, ctx: ToolContext): void {
    if (this.id === "slice") {
      this.ask({ phase: "side", plane }, ctx)
      return
    }
    this.section(plane, ctx)
    ctx.dynamicInput.close()
    ctx.endCommand()
  }

  private slice(plane: CutPlane, side: SliceSide, ctx: ToolContext): void {
    ctx.dynamicInput.close()
    const changed: Solid3dEntity[] = []
    const added: Solid3dEntity[] = []
    let missed = 0
    let failed = 0
    for (const solid of this.solids) {
      const out = sliceSolid(solid, plane, side)
      if (out === "missed") missed++
      else if (out === "failed") failed++
      else {
        changed.push(out.changed)
        if (out.added) added.push(out.added)
      }
    }
    this.state = { phase: "select" }
    if (changed.length > 0) {
      ctx.execute(
        new ReplaceEntitiesCommand(
          changed.map((s) => s.id),
          [...changed, ...added]
        )
      )
    }
    this.sayMissed(missed, failed, ctx)
  }

  private section(plane: CutPlane, ctx: ToolContext): void {
    const made: RegionEntity[] = []
    let missed = 0
    let failed = 0
    for (const solid of this.solids) {
      let region: RegionEntity | null
      try {
        region = solidSection(solid, plane, ctx.document.getCurrentLayerId())
      } catch (error) {
        if (!(error instanceof SolidBooleanError)) throw error
        failed++
        continue
      }
      if (region) made.push(withCurrentProperties(region, ctx))
      else missed++
    }
    this.state = { phase: "select" }
    if (made.length > 0) ctx.execute(new AddEntitiesCommand(made))
    this.sayMissed(missed, failed, ctx)
  }

  /**
   * The solids the plane missed: "the selected solid" when it was the only
   * one, else how many (section/c04: `… does not intersect 1 selected
   * solid.` of two).
   */
  private sayMissed(missed: number, failed: number, ctx: ToolContext): void {
    // WHY AutoCAD's boolean failure words (22133): a surface this kernel
    // cannot cut by a plane in closed form, which ACIS always can.
    if (failed > 0) {
      ctx.report(ctx.text.message("booleanFailed", { count: failed }), "error")
    }
    if (missed === 0) return
    const slice = this.id === "slice"
    if (this.solids.length === 1) {
      ctx.report(
        ctx.text.message(slice ? "sliceMissedOne" : "sectionMissedOne"),
        "error"
      )
      return
    }
    ctx.report(
      ctx.text.message(slice ? "sliceMissed" : "sectionMissed", {
        count: missed,
      }),
      "error"
    )
  }

  private commitTypedPoint(ctx: ToolContext): boolean {
    if (!ctx.dynamicInput.hasTypedText()) return this.onEnter(ctx)
    const field = ctx.dynamicInput.getActiveFieldId()
    const text = field === null ? "" : ctx.dynamicInput.getText(field).trim()
    if (!isCoordinateExpression(text)) return false
    const base = this.getConstraintAnchor()
    const point = parseCoordinate(text, {
      lastPoint: base ?? ctx.lastPoint,
      relativeByDefault: false,
      ucs: ctx.ucs,
      elevation: ctx.elevation,
    })
    if (!point) return false
    this.takePoint(point, ctx)
    return true
  }
}

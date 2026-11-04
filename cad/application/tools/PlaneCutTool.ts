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
  EntityId,
  RegionEntity,
  Solid3dEntity,
  entityElevation,
  isLevel,
  planeAxes,
} from "../../domain/entities"
import { SliceSide, sliceSolid, solidSection } from "../../domain/solidModeling"
import { Ucs, ucsZAxis } from "../../domain/ucs"
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
import { lockedObjectAt } from "./lockedPick"
import { ModeFind, ObjectSelector } from "./objectSelection"
import { sizeBand } from "./solidJig"
import { typedPick } from "./typedPick"

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

/**
 * The UCS's planes XY, YZ and ZX, by their normals: its Z, X and Y as the
 * tool's frame reads them, never the frame's (solid-edits/p147, p172, p173).
 */
function axisNormal(axis: Axis, ucs: Ucs): Vec3 {
  switch (axis) {
    case "XY":
      return ucsZAxis(ucs)
    case "YZ":
      return ucs.xAxis
    case "ZX":
      return ucs.yAxis
  }
}

/** The phases asking a point. */
const POINT_PHASES: ReadonlySet<PlaneCutState["phase"]> = new Set([
  "start",
  "second",
  "zPoint",
  "zAxis",
  "view",
  "axis",
  "first",
  "secondOf3",
  "third",
  "side",
])

const AXIS_PROMPT: Record<Axis, PromptId> = {
  XY: "planeXYPoint",
  YZ: "planeYZPoint",
  ZX: "planeZXPoint",
}

/**
 * AutoCAD's SLICE and SECTION, one class by its mode, as 2027's console asks
 * them in en, es and pt-BR (slice/s01–s13, section/c01–c09, solid-edits/
 * p100–p179): the set (`Select objects to slice:` or `Select objects:`, a
 * preselection dropped, whole objects, what is no solid passed over, none at
 * all `No objects selected.`), then the plane — SLICE's `Specify start point
 * of slicing plane or [planar Object/Surface/Zaxis/View/XY/YZ/ZX/3points]
 * <3points>:`, a point there its first of two square to the UCS's XY
 * (`Specify second point on plane:`, `First and second points must have
 * distinct X,Y coordinates. *Invalid*`); SECTION's `Specify first point on
 * Section plane by [Object/Zaxis/View/XY/YZ/ZX/3points] <3points>:`, a point
 * there the first of three —, a circle, ellipse, arc, 2D spline or 2D
 * polyline's plane (Object; anything else `Unable to extract the plane of
 * the selected object.`), a point and one on its normal (Zaxis), the view's
 * plane, the UCS's XY, YZ or ZX through a point (`<0,0,0>` its origin),
 * three points; SLICE's Surface finds none (`No surfaces selected.`, Enter
 * ends). Object's and Surface's picks take no selection mode (`Expects a
 * point or Group`). SLICE then asks `Specify a point on desired side or
 * [keep Both sides] <Both>:` (`The point should not be on the slicing
 * plane.`): the side kept keeps the object, Both the one the plane's normal
 * points to, the other a new solid of its layer and properties (s01, s03,
 * s09, p158). SECTION adds a region of each solid it cuts, on the current
 * layer with the current properties (c09). The set is cut in its order,
 * what each makes added so (p151, p176). A solid the plane misses or only
 * touches is said (`Slicing plane does not intersect the selected solid.`).
 * Every point answered sets LASTPOINT. One undo step.
 */
export class PlaneCutTool implements Tool {
  readonly id: "slice" | "section"

  private state: PlaneCutState = { phase: "select" }
  private solids: Solid3dEntity[] = []
  /** The set in AutoCAD's order, which the cut follows. */
  private order: EntityId[] = []
  private lastScreen: Vec2 | null = null
  private cursor: Vec3 | null = null
  private readonly selector: ObjectSelector
  // WHY no modes: Object's and Surface's picks are AutoCAD's `entsel`, which
  // refuses `_L` and FOO alike (solid-edits/p171, p174). Surface's lights
  // what is under the cursor as Object's does (desktop solid-edits/d05-d).
  private readonly objectPick = new ObjectSelector({
    done: () => {},
    question: () => (this.id === "slice" ? "sliceObject" : "sectionObject"),
    modes: [],
    one: {
      take: () => {},
      newest: true,
      pick: (point, ctx) => this.pickObject(point, ctx),
    },
  })

  constructor(mode: "slice" | "section") {
    this.id = mode
    this.selector = new ObjectSelector({
      takes: () => "wholeObjects",
      done: (ctx) => this.closeSet(ctx),
      question: () =>
        mode === "slice" ? "selectObjectsToSlice" : "selectObjects",
      // WHY SECTION's two on one line: neither string ends its line, and
      // the console prints them so (solid-edits/p131, EDITS-D6).
      noneFound:
        mode === "slice" ? "noObjectsSelected" : "noObjectsNoSolidsSelected",
      onAdded: (ids, _added, _ctx, find) => this.added(ids, find),
    })
  }

  // WHY the selection dropped: AutoCAD asks for the set though MOVE takes the
  // same preselection in the same run (solid-edits/p130, p131; EDITS-D4).
  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    ctx.selection.clear()
    this.solids = []
    this.order = []
    this.state = { phase: "select" }
    this.selector.start()
  }

  onDeactivate(ctx: ToolContext): void {
    this.state = { phase: "select" }
    this.solids = []
    this.order = []
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

  // WHY said here: a point prompt that declares its refusal's words reads as
  // no point to the runtime, and every one of them sets it (solid-edits/
  // p100, p114–p120, p135).
  setsLastPoint(): boolean | null {
    return POINT_PHASES.has(this.state.phase) ? true : null
  }

  takes(): QuestionInput | null {
    switch (this.state.phase) {
      case "select":
        return this.selector.takes()
      case "object":
      case "surface":
        return "objectOrGroup"
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
            this.objectPick.start()
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
      // ends the command (solid-edits/p174).
      case "surface":
        return false
      case "view":
      case "axis":
        this.takePoint(ctx.ucs.origin, ctx)
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
    if (this.state.phase === "surface" && typedPick(text, ctx)) {
      // A point typed is a pick, on nothing or no surface (solid-edits/p174).
      ctx.report(ctx.text.message("noSurfacesSelected"), "error")
      return true
    }
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
    this.cursor = input.point
    if (this.state.phase === "select") {
      this.selector.onPointerMove(input, ctx)
      return
    }
    if (this.state.phase === "object" || this.state.phase === "surface") {
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
      this.pickObject(input.point, ctx, input.point)
      return
    }
    if (this.state.phase === "surface") {
      // No object here is a surface (solid-edits/p174: a circle picked).
      ctx.report(ctx.text.message("noSurfacesSelected"), "error")
      return
    }
    this.takePoint(input.point, ctx)
  }

  onPointerUp(input: PointerInput, ctx: ToolContext): void {
    if (this.state.phase === "select") this.selector.onPointerUp(input, ctx)
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    const state = this.state
    if (state.phase === "select") return this.selector.buildOverlay(ctx)
    if (state.phase === "object" || state.phase === "surface") {
      return this.objectPick.buildOverlay(ctx)
    }
    // The dashed band from the plane's first point, 3points' third's too,
    // and from Zaxis' point on the plane; none at the side (desktop
    // solid-edits/d05-b, d05-c).
    const from = this.getConstraintAnchor()
    return from && this.cursor
      ? [sizeBand(ctx.viewport, from, this.cursor)]
      : []
  }

  // WHY newest first: ALL's halves and regions are made newest first, as
  // `ssget` lists them (solid-edits/p151, p176); picks as picked (p175). A
  // fence is unprobed and kept as found, as the booleans keep it.
  private added(ids: readonly EntityId[], find: ModeFind): void {
    this.order = [
      ...this.order.filter((id) => !ids.includes(id)),
      ...(find.by !== "fence" ? [...ids].reverse() : ids),
    ]
  }

  /**
   * The solids of the set, in its order; the rest passed over (s09). With
   * none, SLICE ends saying nothing (c09, solid-edits/p157) and SECTION says
   * so (c06).
   */
  private closeSet(ctx: ToolContext): void {
    const rank = new Map(this.order.map((id, index) => [id, index]))
    const at = (id: EntityId) => rank.get(id) ?? rank.size
    const entities = ctx.selection
      .toArray()
      .sort((a, b) => at(a) - at(b))
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
   * Object's pick, clicked (at `clicked`, the cursor's point) or typed: on
   * nothing the prompt again, silently (solid-edits/p163); on an object of a
   * locked layer, the newest under the pick box tested, `The object is on a
   * locked layer.` and the prompt again (p178).
   */
  private pickObject(
    world: Vec2 | Vec3,
    ctx: ToolContext,
    clicked: Vec3 | null = null
  ): void {
    const at = { x: world.x, y: world.y }
    const hit = ctx.pick(at)
    if (lockedObjectAt(ctx.viewport.worldToScreen(world), ctx, hit)) {
      ctx.report(ctx.text.message("objectOnLockedLayer"), "error")
      return
    }
    if (hit) this.takeObject(hit, ctx, clicked)
  }

  /**
   * An object's plane (Object): a circle's, an arc's, an ellipse's, a 2D
   * polyline's or a spline's lying in one, through it; any other, a line or
   * the solid itself, is refused and the prompt asked again (solid-edits/
   * p164, p178).
   */
  private takeObject(
    entity: Entity,
    ctx: ToolContext,
    clicked: Vec3 | null
  ): void {
    const planar =
      entity.type === "circle" ||
      entity.type === "arc" ||
      entity.type === "ellipse" ||
      entity.type === "polyline" ||
      (entity.type === "spline" && isLevel(entity))
    if (!planar) {
      ctx.report(ctx.text.message("unableToExtractPlane"), "error")
      return
    }
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
    // A click that takes the plane is LASTPOINT, the cursor's point on the
    // work plane (desktop solid-edits/d06); a refused one is unverified.
    if (clicked) ctx.setLastPoint(clicked)
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
        this.cut(
          { origin: point, normal: axisNormal(state.axis, ctx.ucs) },
          ctx
        )
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
        // The third asked on the first, which LASTPOINT becomes (p118, p120,
        // EDITS-D3).
        ctx.setLastPoint(state.first)
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

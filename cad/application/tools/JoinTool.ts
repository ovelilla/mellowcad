import { Vec2 } from "../../geometry/Vec2"
import {
  type BSplineCurve,
  bsplineJoined,
  bsplineReversed,
} from "../../geometry/nurbs"
import {
  type Vec3,
  add3,
  cross3,
  dot3,
  length3,
  normalize3,
  planar,
  scale3,
  sub3,
} from "../../geometry/Vec3"
import { normalizeAngle } from "../../geometry/primitives"
import {
  type ArcEntity,
  type CircleEntity,
  type EllipseEntity,
  Entity,
  EntityId,
  type LineEntity,
  type Polyline3dEntity,
  type PolylineEntity,
  arcEndPoint,
  arcStartPoint,
  arcSweepAngle,
  carryOverrides,
  coplanar,
  createCircle,
  createPolyline,
  ellipseSweepParams,
  entityElevation,
  ellipseWithSpan,
  isFullEllipse,
  isLevel,
  lineEndZ,
  lineStartZ,
  polyline3dCurve,
  polyline3dFrame,
  polylineSegmentGeometries,
  polylineWidth,
  type PolylineWidth,
  readsInPlan,
  withElevation,
  withLineZ,
  polylineDecurved,
} from "../../domain/entities"
import { joinCurve, joinedSpline } from "../../domain/splineJoin"
import { ReplaceEntitiesCommand } from "../commands/entityCommands"
import { SelectionActionTool } from "./SelectionActionTool"
import {
  type AddedBy,
  type ModeFind,
  ObjectSelector,
  type SelectionMode,
} from "./objectSelection"
import type { PromptId } from "../../locales/types"
import {
  CommandOption,
  CommandOptionOutcome,
  PointerInput,
  QuestionInput,
  ToolContext,
  ToolQuestion,
} from "./Tool"
import type { ScenePrimitive } from "../../scene/types"

/** World tolerance within which two endpoints count as the same point. */
const JOIN_EPS = 1e-6
/** Angular tolerance within which arcs meet, or close their circle. */
const ANGLE_EPS = 1e-9
const TAU = 2 * Math.PI

/**
 * AutoCAD's JOIN, several objects at once (pieces/p300–p440). The set read in
 * order, a window's find newest first (p390), makes one of four things:
 * collinear lines the source LINE stretched over them all (p300, p328, p329,
 * p349); arcs of one circle the source ARC, counter-clockwise from it over the
 * gaps, or a CIRCLE if they close it (p327, p344, p386); elliptical arcs of
 * one ellipse the source's, so (p332, p407, p413); anything else chains, one
 * per source, each grown over whole objects meeting its ends, in the set's
 * order, until none fits (p324, p338, p377, p384): from each spline or
 * elliptical arc in turn a spline (p331, p374, p415, p435), from each 3D
 * polyline that is not level a 3D polyline (3dpoly/p44, p62), then from the
 * first polyline left, else the first object, a polyline (p339, p343, p434).
 * A spline or an elliptical arc picked alone is a source the objects asked
 * next join (p406, p411), or that cLose closes (p369).
 */
export class JoinTool extends SelectionActionTool {
  readonly id = "join"
  readonly shortcut = "j"

  /** The set in the order JOIN reads it, as `Select objects to join:` built it. */
  private order: EntityId[] = []
  /** What `Convert to circle?` is asked about, while it is. */
  private circle: Joined | null = null
  /** A spline or an elliptical arc picked alone, while what joins it is asked. */
  private source: Entity | null = null
  private readonly toSpline = this.toSource("selectOpenCurvesToJoinToSource")
  // WHY no Window and the rest: the prompt takes a pick, Fence and Crossing
  // (pieces/p369 trace), and finds only arcs of the source's ellipse (p420,
  // p439).
  private readonly toEllipse = this.toSource(
    (picked) =>
      picked
        ? "selectEllipticalArcsToJoinToSource"
        : "selectEllipticalArcsToJoinToSourceOr",
    ["Fence", "Crossing"]
  )

  private toSource(
    question: PromptId | ((picked: boolean) => PromptId),
    modes?: readonly SelectionMode[]
  ): ObjectSelector {
    return new ObjectSelector({
      takes: () => "wholeObjects",
      question: () =>
        typeof question === "string"
          ? question
          : question(!(this.liveSet?.isEmpty() ?? true)),
      accept: (ids, ctx) =>
        ids.filter((id) => {
          const entity = ctx.document.get(id)
          return entity && this.source && this.joinsSource(entity)
        }),
      done: (ctx) => this.joinToSource(ctx),
      onAdded: (ids, added, _ctx, find) =>
        this.selectionAdded(ids, added, find),
      ...(modes ? { modes } : {}),
    })
  }

  /** The set read live, for the source's prompt to drop cLose once it holds one. */
  private liveSet: ToolContext["selection"] | null = null

  /**
   * JOIN takes the source and the rest in one set here, so after the first
   * pick it asks for the objects to join as AutoCAD does once several are
   * picked at once. WHY: `Select lines to join to source`, its prompt after a
   * single line, arc or polyline, would ask for a step this JOIN takes only
   * after a spline or an elliptical arc.
   */
  protected selectionQuestion(picked: boolean): PromptId {
    return picked ? "selectObjectsToJoin" : "selectSourceOrMultipleToJoin"
  }

  protected selectionInput(): QuestionInput {
    return "wholeObjects"
  }

  // WHY a window's (and a crossing's) find newest first: `ssget` lists it so
  // (pieces/p390), which makes another source and another chain (p324, p341,
  // p377). A fence and the named modes keep the drawing's order (unprobed).
  protected selectionAdded(
    ids: readonly EntityId[],
    added: AddedBy,
    find: ModeFind
  ): void {
    const newestFirst = added.by !== "name" && find.by !== "fence"
    this.order = [
      ...this.order.filter((id) => !ids.includes(id)),
      ...(newestFirst ? [...ids].reverse() : ids),
    ]
  }

  onActivate(ctx: ToolContext): void {
    this.order = []
    this.circle = null
    this.source = null
    this.liveSet = ctx.selection
    super.onActivate(ctx)
  }

  onDeactivate(ctx: ToolContext): void {
    this.order = []
    this.circle = null
    this.source = null
    this.liveSet = null
    super.onDeactivate(ctx)
  }

  /** The prompt asking what joins the source, while it is. */
  private step(): ObjectSelector | null {
    if (!this.source || this.circle) return null
    return this.source.type === "ellipse" ? this.toEllipse : this.toSpline
  }

  question(): PromptId | ToolQuestion {
    if (this.circle) return "convertCombinedArcsToCircle"
    return this.step()?.question() ?? super.question()
  }

  takes(): QuestionInput | null {
    if (this.circle) return null
    return this.step()?.takes() ?? super.takes()
  }

  defaultOption(): string | null {
    return this.circle ? "Yes" : null
  }

  commandOptions(): readonly CommandOption[] {
    // `[Yes/No] <Yes>`, listed and declared No, Yes (pieces/p326 trace).
    if (this.circle) return [{ id: "Yes" }, { id: "No" }]
    const step = this.step()
    if (!step) return super.commandOptions()
    const closes = step === this.toEllipse && (this.liveSet?.isEmpty() ?? true)
    return [...(closes ? [{ id: "cLose" }] : []), ...step.commandOptions()]
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    const step = this.step()
    if (step && this.source?.type === "ellipse" && id === "cLose") {
      if (!ctx.selection.isEmpty()) return "unhandled"
      // cLose makes the arc's ellipse whole (p369, p412: AutoCAD keeps its
      // start, which a whole ellipse has no field for here).
      ctx.execute(
        new ReplaceEntitiesCommand(
          [this.source.id],
          [ellipseWithSpan(this.source, undefined, undefined)]
        )
      )
      ctx.report(ctx.text.message("ellipseClosed"))
      ctx.endCommand()
      return "end"
    }
    if (step) return step.invokeOption(id, ctx) ? "continue" : "unhandled"
    if (!this.circle) return super.invokeOption(id, ctx)
    if (id !== "Yes" && id !== "No") return "unhandled"
    // No changes nothing and says nothing (pieces/p385).
    if (id === "Yes") this.commit(this.circle, ctx)
    this.circle = null
    ctx.dynamicInput.close()
    ctx.endCommand()
    return "end"
  }

  onEnter(ctx: ToolContext): boolean {
    const step = this.step()
    // Enter with nothing picked ends JOIN changing nothing (p430).
    if (step) return step.onEnter(ctx)
    if (!this.circle) return super.onEnter(ctx)
    this.invokeOption("Yes", ctx)
    return true
  }

  answerTyped(text: string, ctx: ToolContext): boolean {
    const step = this.step()
    if (step) return step.answerTyped(text, ctx)
    return !this.circle && super.answerTyped(text, ctx)
  }

  wantsSnap(): boolean {
    const step = this.step()
    if (step) return step.wantsSnap()
    return !this.circle && super.wantsSnap()
  }

  cycleLasso(ctx: ToolContext): boolean {
    const step = this.step()
    return step ? step.cycleLasso(ctx) : super.cycleLasso(ctx)
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    const step = this.step()
    if (step) {
      step.onPointerDown(input, ctx)
      ctx.requestRender()
    } else if (!this.circle) super.onPointerDown(input, ctx)
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    const step = this.step()
    if (step) step.onPointerMove(input, ctx)
    else if (!this.circle) super.onPointerMove(input, ctx)
  }

  onPointerUp(input: PointerInput, ctx: ToolContext): void {
    const step = this.step()
    if (step) step.onPointerUp(input, ctx)
    else if (!this.circle) super.onPointerUp(input, ctx)
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    if (this.circle) return []
    return this.step()?.buildOverlay(ctx) ?? super.buildOverlay(ctx)
  }

  protected run(entities: readonly Entity[], ctx: ToolContext): boolean {
    const set = this.inSetOrder(entities)
    const [only] = set
    if (
      set.length === 1 &&
      (only.type === "spline" || only.type === "ellipse") &&
      joinCurve(only)
    ) {
      // A source alone: what joins it is asked next (p406, p411).
      this.source = only
      this.order = []
      ctx.selection.clear()
      this.step()!.start()
      return true
    }
    const joined = joinObjects(set)
    if (!joined) {
      ctx.report(
        ctx.text.message("nothingJoined", { count: entities.length }),
        "error"
      )
      return false
    }
    if (joined.kind === "circle") {
      this.circle = joined
      // A keyword-only prompt: the chips, and Enter takes Yes.
      ctx.dynamicInput.open({ fields: [], commit: () => {} })
      return true
    }
    this.commit(joined, ctx)
    return false
  }

  /** Whether `entity` may join the source: any other object, or an arc of its ellipse. */
  private joinsSource(entity: Entity): boolean {
    const source = this.source!
    if (entity.id === source.id) return false
    return (
      source.type !== "ellipse" ||
      (entity.type === "ellipse" && ellipseShift(source, entity) !== null)
    )
  }

  /** What the source's prompt closed on joins it, in the set's order. */
  private joinToSource(ctx: ToolContext): void {
    const source = this.source!
    const set = this.inSetOrder(
      ctx.selection
        .toArray()
        .map((id) => ctx.document.get(id))
        .filter((entity): entity is Entity => entity !== undefined)
    )
    const joined =
      source.type === "ellipse"
        ? joinToEllipse(source, set as EllipseEntity[])
        : joinToSpline(source, set)
    if (joined.made.length > 0) this.commit(joined, ctx)
    else
      ctx.report(
        ctx.text.message(joined.reports[0].message, joined.reports[0].values)
      )
    ctx.endCommand()
  }

  private commit(joined: Joined, ctx: ToolContext): void {
    ctx.execute(new ReplaceEntitiesCommand(joined.removed, joined.made))
    for (const { message, values } of joined.reports) {
      ctx.report(ctx.text.message(message, values))
    }
  }

  /** The set as JOIN reads it: a preselection first, then as it was built. */
  private inSetOrder(entities: readonly Entity[]): readonly Entity[] {
    const rank = (entity: Entity) => this.order.indexOf(entity.id)
    return [...entities].sort((a, b) => rank(a) - rank(b))
  }
}

export type JoinMessage =
  | "linesJoined"
  | "arcsJoined"
  | "arcsJoinedIntoCircle"
  | "ellipticalArcsJoined"
  | "objectsJoinedIntoSplines"
  | "objectsConvertedToSplines"
  | "objectsConvertedToPolylines"
  | "segmentsJoinedIntoPolyline"
  | "segmentsJoinedInto3dPolylines"
  | "objectsJoinedToSource"
  | "ellipticalArcsJoinedToSource"

/** One line of what JOIN says. */
export interface Report {
  readonly message: JoinMessage
  readonly values: Readonly<Record<string, number>>
}

/** What a join makes, what it takes away and how it says so. */
export interface Joined {
  readonly kind: "line" | "arc" | "circle" | "ellipse" | "chains"
  readonly made: readonly Entity[]
  /** Every object joined; a `made` under one's id is that object grown. */
  readonly removed: readonly EntityId[]
  /**
   * A line per kind of result, splines joined, splines made and polylines
   * in that order whatever came first (p436–p438).
   */
  readonly reports: readonly Report[]
}

/**
 * What `set`, in JOIN's order, joins into; null when nothing joins. What no
 * result takes is counted on the last line (where several lines are said,
 * unprobed).
 */
function joinObjects(set: readonly Entity[]): Joined | null {
  const usable = set.filter(joinable)
  const result =
    joinLines(usable) ??
    joinArcs(usable) ??
    joinEllipticalArcs(usable) ??
    joinChains(usable)
  if (!result) return null
  return withDiscarded(result, set.length - result.removed.length)
}

function withDiscarded(joined: Joined, discarded: number): Joined {
  return {
    ...joined,
    reports: joined.reports.map((report, i, all) => ({
      ...report,
      values: {
        ...report.values,
        discarded: i === all.length - 1 ? discarded : 0,
      },
    })),
  }
}

/** Closed objects, and those JOIN makes nothing of here, are discarded. */
function joinable(entity: Entity): boolean {
  return entity.type === "line" || joinCurve(entity) !== null
}

const startOf = (line: LineEntity): Vec3 => ({
  ...line.start,
  z: lineStartZ(line),
})
const endOf = (line: LineEntity): Vec3 => ({ ...line.end, z: lineEndZ(line) })

/**
 * Lines all on one line in space, with gaps or overlapping: the source LINE,
 * its handle and properties, stretched to the farthest ends along its own
 * direction (pieces/p300, p328, p329, p342, p349).
 */
function joinLines(set: readonly Entity[]): Joined | null {
  if (set.length < 2) return null
  const lines = set.filter((entity) => entity.type === "line")
  if (lines.length !== set.length) return null
  const [source] = lines
  const origin = startOf(source)
  const direction = normalize3(sub3(endOf(source), origin))
  if (!direction) return null
  let low = Infinity
  let high = -Infinity
  for (const line of lines) {
    for (const end of [startOf(line), endOf(line)]) {
      const offset = sub3(end, origin)
      if (length3(cross3(offset, direction)) > JOIN_EPS) return null
      low = Math.min(low, dot3(offset, direction))
      high = Math.max(high, dot3(offset, direction))
    }
  }
  const start = add3(origin, scale3(direction, low))
  const end = add3(origin, scale3(direction, high))
  const line = withLineZ(
    { ...source, start: planar(start), end: planar(end) },
    start.z,
    end.z
  )
  return {
    kind: "line",
    made: [line],
    removed: lines.map((entity) => entity.id),
    reports: [{ message: "linesJoined", values: { count: lines.length } }],
  }
}

/**
 * Arcs of one circle: the source ARC, counter-clockwise from its start over
 * every gap to the farthest end (pieces/p327, p344); one that reaches back
 * to its start closes the circle, which JOIN asks to convert (p326, p382).
 */
function joinArcs(set: readonly Entity[]): Joined | null {
  if (set.length < 2) return null
  const arcs = set.filter((entity) => entity.type === "arc")
  if (arcs.length !== set.length) return null
  const [source] = arcs
  let reach = 0
  for (const arc of arcs) {
    if (
      !samePoint(arc.center, source.center) ||
      Math.abs(arc.radius - source.radius) > JOIN_EPS ||
      !coplanar(arc, source)
    )
      return null
    let from = normalizeAngle(arc.startAngle - source.startAngle)
    if (from > TAU - ANGLE_EPS) from = 0
    reach = Math.max(reach, from + arcSweepAngle(arc))
  }
  const removed = arcs.map((entity) => entity.id)
  if (reach >= TAU - ANGLE_EPS) {
    const circle: CircleEntity = carryOverrides(
      source,
      createCircle(source.center, source.radius, source.layerId)
    )
    return {
      kind: "circle",
      made: [circle],
      removed,
      reports: [
        { message: "arcsJoinedIntoCircle", values: { count: arcs.length } },
      ],
    }
  }
  const arc: ArcEntity = {
    ...source,
    endAngle: normalizeAngle(source.startAngle + reach),
  }
  return {
    kind: "arc",
    made: [arc],
    removed,
    reports: [{ message: "arcsJoined", values: { count: arcs.length } }],
  }
}

/**
 * How far round `arc`'s parameter is turned from `source`'s where it is an
 * arc of the same ellipse in the same plane (its major axis the other way
 * round, half a turn), else null.
 */
function ellipseShift(
  source: EllipseEntity,
  arc: EllipseEntity
): number | null {
  if (
    !samePoint(arc.center, source.center) ||
    Math.abs(arc.ratio - source.ratio) > ANGLE_EPS ||
    !coplanar(arc, source)
  )
    return null
  if (samePoint(arc.majorAxis, source.majorAxis)) return 0
  const opposite = { x: -source.majorAxis.x, y: -source.majorAxis.y }
  return samePoint(arc.majorAxis, opposite) ? Math.PI : null
}

/**
 * Elliptical arcs of the source's ellipse made the source's arc,
 * counter-clockwise from its start over every gap to the farthest end, a
 * whole ellipse where one reaches round to its start, which JOIN does not ask
 * about (pieces/p332, p407, p408, p413; AutoCAD keeps the start, which a
 * whole ellipse has no field for here). Null where one is not of it.
 */
function ellipseOver(
  source: EllipseEntity,
  arcs: readonly EllipseEntity[]
): EllipseEntity | null {
  const { start } = ellipseSweepParams(source)
  let reach = 0
  for (const arc of arcs) {
    const shift = ellipseShift(source, arc)
    if (shift === null || isFullEllipse(arc)) return null
    const own = ellipseSweepParams(arc)
    let from = normalizeAngle(own.start + shift - start)
    if (from > TAU - ANGLE_EPS) from = 0
    reach = Math.max(reach, from + own.sweep)
  }
  return reach >= TAU - ANGLE_EPS
    ? ellipseWithSpan(source, undefined, undefined)
    : ellipseWithSpan(source, start, start + reach)
}

/** A set all of elliptical arcs of one ellipse: the source's arc over them all. */
function joinEllipticalArcs(set: readonly Entity[]): Joined | null {
  if (set.length < 2 || set.some((entity) => entity.type !== "ellipse")) {
    return null
  }
  const arcs = set as readonly EllipseEntity[]
  const ellipse = ellipseOver(arcs[0], arcs)
  if (!ellipse) return null
  return {
    kind: "ellipse",
    made: [ellipse],
    removed: arcs.map((arc) => arc.id),
    reports: [
      { message: "ellipticalArcsJoined", values: { count: arcs.length } },
    ],
  }
}

/** What the source's prompt picked of its ellipse joins the elliptical arc (p411). */
function joinToEllipse(
  source: EllipseEntity,
  arcs: readonly EllipseEntity[]
): Joined {
  return {
    kind: "ellipse",
    made: [ellipseOver(source, [source, ...arcs])!],
    removed: [source.id, ...arcs.map((arc) => arc.id)],
    reports: [
      {
        message: "ellipticalArcsJoinedToSource",
        values: { count: arcs.length, discarded: 0 },
      },
    ],
  }
}

/** A spline grown from a source, and the objects it took. */
interface SplineChain {
  readonly spline: Entity
  readonly members: readonly Entity[]
}

/**
 * The spline `source` grows into over whole objects of `left` meeting one of
 * its ends in space, in their order, scanning them again after each, until
 * none fits or it closes (pieces/p405, p418, p431): those it takes leave
 * `left`. Null where none meets it.
 */
function splineChain(source: Entity, left: Entity[]): SplineChain | null {
  const curves = [joinCurve(source)!]
  const members = [source]
  let closed = false
  for (let i = 0; i < left.length && !closed; i++) {
    const curve = joinCurve(left[i])
    if (!curve || !attachCurve(curves, curve)) continue
    members.push(...left.splice(i, 1))
    i = -1
    closed = samePoint3(
      curves[0].controlPoints[0],
      curves[curves.length - 1].controlPoints.at(-1)!
    )
  }
  if (members.length < 2) return null
  return {
    spline: joinedSpline(source, bsplineJoined(curves), closed),
    members,
  }
}

/** {@link attach}'s rule for a spline's curves, their ends met in space. */
function attachCurve(curves: BSplineCurve[], curve: BSplineCurve): boolean {
  const start = curve.controlPoints[0]
  const end = curve.controlPoints[curve.controlPoints.length - 1]
  const head = curves[0].controlPoints[0]
  const tail = curves[curves.length - 1].controlPoints.at(-1)!
  if (samePoint3(start, tail)) curves.push(curve)
  else if (samePoint3(end, tail)) curves.push(bsplineReversed(curve))
  else if (samePoint3(end, head)) curves.unshift(curve)
  else if (samePoint3(start, head)) curves.unshift(bsplineReversed(curve))
  else return false
  return true
}

/**
 * What the source's prompt picked joins the spline, its source whatever came
 * first (p406, p426); with nothing meeting it, nothing changes and JOIN says
 * so (p440). SPLINEDIT's Join is this one (spline-knots/k72, k117).
 */
export function joinToSpline(source: Entity, set: readonly Entity[]): Joined {
  const left = set.filter(joinable)
  const chain = splineChain(source, left)
  const joined = chain ? chain.members.length - 1 : 0
  return {
    kind: "chains",
    made: chain ? [chain.spline] : [],
    removed: chain ? chain.members.map((member) => member.id) : [],
    reports: [
      {
        message: "objectsJoinedToSource",
        values: { count: joined, discarded: set.length - joined },
      },
    ],
  }
}

/**
 * Chains: a spline from each spline or elliptical arc left in the set in
 * turn — the spline itself (`joined into`), or a new one (`converted to`) —
 * over anything meeting its ends, coplanar or not (p374, p415, p419, p421,
 * p435); then polylines over the lines, arcs and polylines left (p434, p436).
 */
function joinChains(set: readonly Entity[]): Joined | null {
  const left = [...set]
  const made: Entity[] = []
  const removed: EntityId[] = []
  const reports: Report[] = []
  // Joined into the source spline, then converted to a new one (p437, p438).
  const counts = {
    kept: { objects: 0, splines: 0 },
    made: { objects: 0, splines: 0 },
  }
  for (;;) {
    const source = left.find(
      (entity) => entity.type === "spline" || entity.type === "ellipse"
    )
    if (!source) break
    left.splice(left.indexOf(source), 1)
    const chain = splineChain(source, left)
    if (!chain) continue
    made.push(chain.spline)
    removed.push(...chain.members.map((member) => member.id))
    const count = source.type === "spline" ? counts.kept : counts.made
    count.objects += chain.members.length
    count.splines++
  }
  // Then from each 3D polyline that is not level, a 3D polyline, or a new
  // spline where an arc joins it (3dpoly/p44, p48, p62, p77).
  const grown = { segments: 0, polylines: 0 }
  for (;;) {
    const source = left.find(
      (entity): entity is Polyline3dEntity =>
        entity.type === "polyline3d" && !entity.closed && !isLevel(entity)
    )
    if (!source) break
    left.splice(left.indexOf(source), 1)
    const chain = polyline3dChain(source, left)
    if (!chain) continue
    made.push(chain.made)
    removed.push(...chain.members.map((member) => member.id))
    if (chain.made.type === "spline") {
      counts.made.objects += chain.members.length
      counts.made.splines++
    } else {
      grown.segments += chain.segments
      grown.polylines++
    }
  }
  for (const [count, message] of [
    [counts.kept, "objectsJoinedIntoSplines"],
    [counts.made, "objectsConvertedToSplines"],
  ] as const) {
    if (count.splines === 0) continue
    reports.push({
      message,
      values: { count: count.objects, splines: count.splines },
    })
  }
  if (grown.polylines > 0) {
    reports.push({
      message: "segmentsJoinedInto3dPolylines",
      values: { count: grown.segments, polylines: grown.polylines },
    })
  }
  const polylines = joinPolylines(
    left.filter((entity) => entity.type !== "spline")
  )
  if (polylines) {
    made.push(...polylines.made)
    removed.push(...polylines.removed)
    reports.push(...polylines.reports)
  }
  if (made.length === 0) return null
  return { kind: "chains", made, removed, reports }
}

/** An object of a 3D polyline's chain, its points in the chain's direction. */
interface Run3d {
  readonly member: Entity
  readonly points: readonly Vec3[]
  readonly reversed: boolean
}

/**
 * The points an object joins a 3D polyline by, in the WCS, or null where it
 * joins none: a line's ends, rising or not (3dpoly/p44); a polyline's
 * vertices, its arcs joined as chords (p63) and a fitted one's frame
 * (**unverified**); a 3D polyline's curve, fitted no more (p66); an arc's
 * ends, which make the chain a spline (p48). Closed objects join none.
 */
function pointsOf3d(entity: Entity): Vec3[] | null {
  switch (entity.type) {
    case "line":
      return [startOf(entity), endOf(entity)]
    case "arc": {
      if (!readsInPlan(entity)) return null
      const z = entityElevation(entity)
      return [
        { ...arcStartPoint(entity), z },
        { ...arcEndPoint(entity), z },
      ]
    }
    case "polyline": {
      if (entity.closed || !readsInPlan(entity)) return null
      const frame = entity.fit ? polylineDecurved(entity) : entity
      const z = entityElevation(entity)
      return frame.vertices.map((vertex) => ({ ...vertex, z }))
    }
    case "polyline3d":
      return entity.closed ? null : [...polyline3dCurve(entity).vertices]
    default:
      return null
  }
}

/**
 * The chain a 3D polyline grows into over whole objects of `left` meeting one
 * of its ends in space, in their order, scanning again after each, until none
 * fits or it closes (3dpoly/p64, p70, p74); those it takes leave `left`. It
 * stays that 3D polyline, its handle, properties and direction kept, whatever
 * came first (p45, p47), or becomes a new spline where an arc joins it
 * (p48). Null where nothing meets it.
 */
function polyline3dChain(
  source: Polyline3dEntity,
  left: Entity[]
): { made: Entity; members: readonly Entity[]; segments: number } | null {
  const own = pointsOf3d(source)!
  const runs: Run3d[] = [{ member: source, points: own, reversed: false }]
  const head = () => runs[0].points[0]
  const tail = () => runs[runs.length - 1].points.at(-1)!
  let closed = false
  for (let i = 0; i < left.length && !closed; i++) {
    const member = left[i]
    const points = pointsOf3d(member)
    if (!points || points.length < 2) continue
    const back = [...points].reverse()
    if (samePoint3(points[0], tail())) {
      runs.push({ member, points, reversed: false })
    } else if (samePoint3(back[0], tail())) {
      runs.push({ member, points: back, reversed: true })
    } else if (samePoint3(points.at(-1)!, head())) {
      runs.unshift({ member, points, reversed: false })
    } else if (samePoint3(back.at(-1)!, head())) {
      runs.unshift({ member, points: back, reversed: true })
    } else continue
    left.splice(i, 1)
    i = -1
    closed = samePoint3(head(), tail())
  }
  if (runs.length < 2) return null
  const members = runs.map((run) => run.member)
  if (members.some((member) => member.type === "arc")) {
    const curves = runs.map((run) => {
      const curve = joinCurve(run.member)!
      return run.reversed ? bsplineReversed(curve) : curve
    })
    return {
      made: joinedSpline(source, bsplineJoined(curves), closed),
      members,
      segments: 0,
    }
  }
  const vertices = [
    runs[0].points[0],
    ...runs.flatMap((run) => run.points.slice(1)),
  ]
  if (closed) vertices.pop()
  const made: Polyline3dEntity = {
    ...polyline3dFrame(source),
    vertices,
    closed,
  }
  const total = closed ? vertices.length : vertices.length - 1
  return { made, members, segments: total - (own.length - 1) }
}

/** A segment of a chain, from `a` to `b`. */
interface Piece {
  readonly a: Vec2
  readonly b: Vec2
  /** AutoCAD's bulge from `a` to `b` (0 = straight). */
  readonly bulge: number
  /** A polyline segment's widths from `a` to `b`; a line's or an arc's none. */
  readonly width: PolylineWidth | null
}

function piecesOf(entity: Entity): Piece[] {
  switch (entity.type) {
    case "line":
      return [{ a: entity.start, b: entity.end, bulge: 0, width: null }]
    case "arc":
      return [
        {
          a: arcStartPoint(entity),
          b: arcEndPoint(entity),
          bulge: Math.tan(arcSweepAngle(entity) / 4), // CCW start→end
          width: null,
        },
      ]
    case "polyline": {
      // A fitted one joins as its frame, straight: PEDIT's Join decurves
      // what it grows (pedit/p168, p183; JOIN's **unverified**).
      const frame = entity.fit ? polylineDecurved(entity) : entity
      return polylineSegmentGeometries(frame).map((segment, i) => ({
        a: segment.a,
        b: segment.b,
        bulge: segment.kind === "arc" ? segment.bulge : 0,
        width: polylineWidth(frame, i),
      }))
    }
    case "polyline3d": {
      // A level one joins as a polyline does (3dpoly/p50, p60, p75).
      if (entity.closed || !isLevel(entity)) return []
      const { vertices } = polyline3dCurve(entity)
      return vertices.slice(1).map((b, i) => ({
        a: vertices[i],
        b,
        bulge: 0,
        width: null,
      }))
    }
    default:
      return []
  }
}

/** The pieces run the other way: each turned round, in reverse order. */
function reversedPieces(pieces: readonly Piece[]): Piece[] {
  return pieces
    .map((piece) => ({
      a: piece.b,
      b: piece.a,
      bulge: -piece.bulge,
      width: piece.width && ([piece.width[1], piece.width[0]] as const),
    }))
    .reverse()
}

/**
 * Lines, arcs and open polylines chained into polylines, one per chain: each
 * grows from its source (the first polyline left, else the first object)
 * over whole objects in the set's order that meet one of its ends in its
 * plane, scanning the set again after each, until none fits or it closes. A
 * polyline therefore joins only by its ends (pieces/p388), and a rising line
 * not at all.
 */
function joinPolylines(set: readonly Entity[]): Joined | null {
  // WHY a rising line is left out: AutoCAD 2027 flattens one into a level
  // polyline, its rise lost (pieces/p347, p330), yet joins nothing when the
  // level line is off Z 0 (p358) and refuses one as a source (p348); neither
  // rule is copied (PIECES-D24). Collinear rising lines still join (p349).
  const left = set.filter((entity) => isLevel(entity))
  const made: Entity[] = []
  const removed: EntityId[] = []
  let polylineSource = false
  let segments = 0
  while (left.length > 0) {
    const source = left.find((entity) => entity.type === "polyline") ?? left[0]
    left.splice(left.indexOf(source), 1)
    const chain = chainOf(source, left)
    if (!chain) continue
    polylineSource = source.type === "polyline"
    segments = chain.segments
    made.push(chain.polyline)
    removed.push(...chain.members)
  }
  if (made.length === 0) return null
  // A polyline grown keeps counting its new segments (p322, p356, p378); new
  // polylines count their objects (p319, p324, p333).
  return made.length === 1 && polylineSource
    ? {
        kind: "chains",
        made,
        removed,
        reports: [
          {
            message: "segmentsJoinedIntoPolyline",
            values: { count: segments },
          },
        ],
      }
    : {
        kind: "chains",
        made,
        removed,
        reports: [
          {
            message: "objectsConvertedToPolylines",
            values: { count: removed.length, polylines: made.length },
          },
        ],
      }
}

/**
 * The chain grown from `source` over the objects of `left` that meet one of
 * its ends in its plane, in their order and scanning again after each, until
 * none fits or it closes; those joined are taken out of `left`. A polyline
 * source keeps its id. Null when nothing joins it.
 */
function chainOf(
  source: Entity,
  left: Entity[]
): { polyline: PolylineEntity; members: EntityId[]; segments: number } | null {
  const pieces = piecesOf(source)
  const members = [source.id]
  let closed = false
  for (let i = 0; i < left.length && !closed; i++) {
    const member = left[i]
    const grown = coplanar(member, source) && attach(pieces, member)
    if (!grown) continue
    left.splice(i, 1)
    members.push(member.id)
    i = -1
    closed = samePoint(pieces[0].a, pieces[pieces.length - 1].b)
  }
  if (members.length < 2) return null
  const vertices = [pieces[0].a, ...pieces.map((piece) => piece.b)]
  if (closed) vertices.pop()
  // A 3D polyline gives no plane (`carryPlane`): the polyline lies at its Z
  // (3dpoly/p69).
  const elevation = source.type === "polyline3d" ? entityElevation(source) : 0
  return {
    polyline: carryOverrides(
      source,
      withElevation(
        createPolyline(
          vertices,
          closed,
          source.layerId,
          pieces.map((piece) => piece.bulge),
          source.type === "polyline" ? source.id : undefined,
          joinedWidths(pieces.map((piece) => piece.width))
        ),
        elevation
      )
    ),
    members,
    segments: pieces.length - piecesOf(source).length,
  }
}

/**
 * PEDIT's Join onto an open polyline: JOIN's chain grown from it over the
 * level lines, arcs and open polylines of `set` (pedit/p17, p76). Null when
 * nothing joins it.
 */
export function joinToPolyline(
  source: PolylineEntity,
  set: readonly Entity[]
): { polyline: PolylineEntity; members: EntityId[]; segments: number } | null {
  const left = set.filter(
    (entity) =>
      entity.id !== source.id &&
      isLevel(entity) &&
      (entity.type === "line" ||
        entity.type === "arc" ||
        (entity.type === "polyline" && !entity.closed))
  )
  return chainOf(source, left)
}

/**
 * Adds `member`'s pieces at whichever end of the chain it meets — its tail
 * first —, turned round where it meets it backwards. False if it meets none.
 */
function attach(pieces: Piece[], member: Entity): boolean {
  const own = piecesOf(member)
  if (own.length === 0) return false
  const start = own[0].a
  const end = own[own.length - 1].b
  const tail = pieces[pieces.length - 1].b
  const head = pieces[0].a
  if (samePoint(start, tail)) pieces.push(...own)
  else if (samePoint(end, tail)) pieces.push(...reversedPieces(own))
  else if (samePoint(end, head)) pieces.unshift(...own)
  else if (samePoint(start, head)) pieces.unshift(...reversedPieces(own))
  else return false
  return true
}

function samePoint(p: Vec2, q: Vec2): boolean {
  return Math.abs(p.x - q.x) < JOIN_EPS && Math.abs(p.y - q.y) < JOIN_EPS
}

function samePoint3(p: Vec3, q: Vec3): boolean {
  return samePoint(p, q) && Math.abs(p.z - q.z) < JOIN_EPS
}

/**
 * The widths of a joined chain. A line or an arc joined to a polyline takes
 * the widths AutoCAD 2027's console gives it (pieces/p354–p356): after the
 * polyline's end the width it ends at, all along; before its start the first
 * segment's widths again. With no polyline in the chain there are none.
 */
function joinedWidths(
  widths: readonly (PolylineWidth | null)[]
): PolylineWidth[] | undefined {
  const first = widths.findIndex((width) => width !== null)
  if (first < 0) return undefined
  const out: PolylineWidth[] = []
  let after: PolylineWidth = widths[first]!
  widths.forEach((width, i) => {
    if (width) {
      out.push(width)
      after = [width[1], width[1]]
    } else {
      out.push(i < first ? widths[first]! : after)
    }
  })
  return out
}

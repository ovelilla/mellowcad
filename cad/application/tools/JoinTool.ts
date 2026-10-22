import { Vec2 } from "../../geometry/Vec2"
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
  Entity,
  EntityId,
  type LineEntity,
  arcEndPoint,
  arcStartPoint,
  arcSweepAngle,
  carryOverrides,
  coplanar,
  createCircle,
  createPolyline,
  isLevel,
  lineEndZ,
  lineStartZ,
  polylineSegmentGeometries,
  polylineWidth,
  type PolylineWidth,
  readsInPlan,
  withLineZ,
} from "../../domain/entities"
import { ReplaceEntitiesCommand } from "../commands/entityCommands"
import { SelectionActionTool } from "./SelectionActionTool"
import type { AddedBy, ModeFind } from "./objectSelection"
import type { PromptId } from "../../locales/types"
import {
  CommandOption,
  CommandOptionOutcome,
  PointerInput,
  QuestionInput,
  ToolContext,
} from "./Tool"
import type { ScenePrimitive } from "../../scene/types"

/** World tolerance within which two endpoints count as the same point. */
const JOIN_EPS = 1e-6
/** Angular tolerance within which arcs meet, or close their circle. */
const ANGLE_EPS = 1e-9
const TAU = 2 * Math.PI

/**
 * AutoCAD's JOIN, several objects at once (pieces/p300–p390). The set read in
 * order, a window's find newest first (p390), makes one of three things:
 * collinear lines the source LINE stretched over them all (p300, p328, p329,
 * p349); arcs of one circle the source ARC, counter-clockwise from it over the
 * gaps, or a CIRCLE if they close it (p327, p344, p386); anything else
 * polylines grown from a source — the set's first polyline, which keeps its
 * handle (p343, p378–p380), else its first object, whose properties a new one
 * wears (p339, p340) — over whole objects meeting its ends, in the set's
 * order, until none fits (p324, p338, p377, p384); a polyline met at an inner
 * vertex, or closed, joins nothing (p373, p388, p389).
 */
export class JoinTool extends SelectionActionTool {
  readonly id = "join"
  readonly shortcut = "j"

  /** The set in the order JOIN reads it, as `Select objects to join:` built it. */
  private order: EntityId[] = []
  /** What `Convert to circle?` is asked about, while it is. */
  private circle: Joined | null = null

  /**
   * JOIN takes the source and the rest in one set here, so after the first
   * pick it asks for the objects to join as AutoCAD does once several are
   * picked at once. WHY: `Select lines to join to source`, its prompt after a
   * single source, would ask for a step this JOIN does not take.
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
    super.onActivate(ctx)
  }

  onDeactivate(ctx: ToolContext): void {
    this.order = []
    this.circle = null
    super.onDeactivate(ctx)
  }

  question(): PromptId {
    return this.circle ? "convertCombinedArcsToCircle" : super.question()
  }

  takes(): QuestionInput | null {
    return this.circle ? null : super.takes()
  }

  defaultOption(): string | null {
    return this.circle ? "Yes" : null
  }

  commandOptions(): readonly CommandOption[] {
    // `[Yes/No] <Yes>`, listed and declared No, Yes (pieces/p326 trace).
    return this.circle ? [{ id: "Yes" }, { id: "No" }] : super.commandOptions()
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
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
    if (!this.circle) return super.onEnter(ctx)
    this.invokeOption("Yes", ctx)
    return true
  }

  answerTyped(text: string, ctx: ToolContext): boolean {
    return !this.circle && super.answerTyped(text, ctx)
  }

  wantsSnap(): boolean {
    return !this.circle && super.wantsSnap()
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (!this.circle) super.onPointerDown(input, ctx)
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    if (!this.circle) super.onPointerMove(input, ctx)
  }

  onPointerUp(input: PointerInput, ctx: ToolContext): void {
    if (!this.circle) super.onPointerUp(input, ctx)
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    return this.circle ? [] : super.buildOverlay(ctx)
  }

  protected run(entities: readonly Entity[], ctx: ToolContext): boolean {
    const set = this.inSetOrder(entities)
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

  private commit(joined: Joined, ctx: ToolContext): void {
    ctx.execute(new ReplaceEntitiesCommand(joined.removed, joined.made))
    ctx.report(ctx.text.message(joined.message, joined.values))
  }

  /** The set as JOIN reads it: a preselection first, then as it was built. */
  private inSetOrder(entities: readonly Entity[]): readonly Entity[] {
    const rank = (entity: Entity) => this.order.indexOf(entity.id)
    return [...entities].sort((a, b) => rank(a) - rank(b))
  }
}

/** What a join makes, what it takes away and how it says so. */
interface Joined {
  readonly kind: "line" | "arc" | "circle" | "polylines"
  readonly made: readonly Entity[]
  /** Every object joined; a `made` under one's id is that object grown. */
  readonly removed: readonly EntityId[]
  readonly message:
    | "linesJoined"
    | "arcsJoined"
    | "arcsJoinedIntoCircle"
    | "objectsConvertedToPolylines"
    | "segmentsJoinedIntoPolyline"
  readonly values: Readonly<Record<string, number>>
}

/** What `set`, in JOIN's order, joins into; null when nothing joins. */
function joinObjects(set: readonly Entity[]): Joined | null {
  const usable = set.filter(joinable)
  const result = joinLines(usable) ?? joinArcs(usable) ?? joinPolylines(usable)
  if (!result) return null
  return {
    ...result,
    values: {
      ...result.values,
      discarded: set.length - result.removed.length,
    },
  }
}

/** Closed objects, and those JOIN makes nothing of here, are discarded. */
function joinable(entity: Entity): boolean {
  switch (entity.type) {
    case "line":
      return true
    case "arc":
      return readsInPlan(entity)
    case "polyline":
      return readsInPlan(entity) && !entity.closed
    default:
      return false
  }
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
    message: "linesJoined",
    values: { count: lines.length },
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
      message: "arcsJoinedIntoCircle",
      values: { count: arcs.length },
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
    message: "arcsJoined",
    values: { count: arcs.length },
  }
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
    case "polyline":
      return polylineSegmentGeometries(entity).map((segment, i) => ({
        a: segment.a,
        b: segment.b,
        bulge: segment.kind === "arc" ? segment.bulge : 0,
        width: polylineWidth(entity, i),
      }))
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
    const pieces = piecesOf(source)
    const members = [source]
    let closed = false
    for (let i = 0; i < left.length && !closed; i++) {
      const member = left[i]
      const grown = coplanar(member, source) && attach(pieces, member)
      if (!grown) continue
      left.splice(i, 1)
      members.push(member)
      i = -1
      closed = samePoint(pieces[0].a, pieces[pieces.length - 1].b)
    }
    if (members.length < 2) continue
    polylineSource = source.type === "polyline"
    segments = pieces.length - piecesOf(source).length
    const vertices = [pieces[0].a, ...pieces.map((piece) => piece.b)]
    if (closed) vertices.pop()
    made.push(
      carryOverrides(
        source,
        createPolyline(
          vertices,
          closed,
          source.layerId,
          pieces.map((piece) => piece.bulge),
          polylineSource ? source.id : undefined,
          joinedWidths(pieces.map((piece) => piece.width))
        )
      )
    )
    removed.push(...members.map((member) => member.id))
  }
  if (made.length === 0) return null
  // A polyline grown keeps counting its new segments (p322, p356, p378); new
  // polylines count their objects (p319, p324, p333).
  return made.length === 1 && polylineSource
    ? {
        kind: "polylines",
        made,
        removed,
        message: "segmentsJoinedIntoPolyline",
        values: { count: segments },
      }
    : {
        kind: "polylines",
        made,
        removed,
        message: "objectsConvertedToPolylines",
        values: { count: removed.length, polylines: made.length },
      }
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

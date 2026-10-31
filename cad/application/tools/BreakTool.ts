import { Vec2, V } from "../../geometry/Vec2"
import { Vec3, planar } from "../../geometry/Vec3"
import {
  arcSweepAngle,
  ArcEntity,
  carryOverrides,
  carryPiece,
  createPolyline3d,
  polyline3dParamAt,
  polyline3dSegments,
  polyline3dSpan,
  type Polyline3dEntity,
  CircleEntity,
  createArc,
  createLine,
  createPolyline,
  Entity,
  EntityId,
  LineEntity,
  PolylineEntity,
  PolylineWidth,
  polylineParamAt,
  polylineSegments,
  polylineSpan,
  entityElevation,
  readsInPlan,
  worldToEntity,
  polylineCurve,
} from "../../domain/entities"
import { normalizeAngle } from "../../geometry/primitives"
import {
  createEllipse,
  ellipseCut,
  ellipseParamAt,
  ellipseSweepParams,
  isFullEllipse,
  type EllipsePiece,
} from "../../domain/ellipses"
import type { EllipseEntity, SplineEntity } from "../../domain/entityTypes"
import { nextEntityId } from "../../domain/entityIds"
import {
  splineBreakPiece,
  splineInPlaneOf,
  splineInWorld,
  splineParamAt,
  splineRun,
} from "../../domain/splineEdits"
import type { MessageId } from "../EngineText"
import type { CameraTransform, ScenePrimitive } from "../../scene/types"
import { cursorOnEntityPlane } from "../viewPick"
import {
  RemoveEntitiesCommand,
  ReplaceEntitiesCommand,
  UpdateEntityCommand,
} from "../commands/entityCommands"
import {
  isCoordinateExpression,
  parseCoordinate,
} from "../input/coordinateInput"
import type { PromptId } from "../../locales/types"
import { drawn, rollover } from "./ghostLook"
import { lockedObjectAt } from "./lockedPick"
import { ONE_OBJECT_MODES, ObjectSelector } from "./objectSelection"
import {
  CommandOption,
  CommandOptionOutcome,
  PointerInput,
  QuestionInput,
  Tool,
  ToolContext,
} from "./Tool"

/**
 * BREAK and BREAKATPOINT. Two points on an object remove the piece between
 * them; the same point twice (BREAKATPOINT, or `@` at BREAK's second point)
 * splits it in place with no gap.
 *
 * As in AutoCAD, BREAK asks `Select object:` and the pick that selects it *is*
 * the first break point: `Specify second break point or [First point]:`, whose
 * keyword asks `Specify first break point:` and then `Specify second break
 * point:`; BREAKATPOINT asks `Specify break point:`. Points off the object are
 * pulled onto its nearest point, and a circle or an ellipse is broken
 * counter-clockwise from the first point to the second, leaving an arc.
 */
export type BreakMode = "gap" | "atPoint"

type BreakState =
  | { readonly phase: "select"; readonly hover: Entity | null }
  /** Re-picking the first break point after the `First point` keyword. */
  | { readonly phase: "first"; readonly target: Entity }
  | {
      readonly phase: "second"
      readonly target: Entity
      readonly first: Vec2 | Vec3
      readonly cursor: Vec2 | Vec3
      /** Whether the first point was given after `First point`, which asks no keyword. */
      readonly respecified: boolean
    }

/** Geometry a break leaves behind or takes away. */
type BreakGeom =
  | ({
      readonly kind: "ellipse"
      readonly center: Vec2
      readonly majorAxis: Vec2
      readonly ratio: number
    } & EllipsePiece)
  | { readonly kind: "line"; readonly start: Vec2; readonly end: Vec2 }
  | {
      readonly kind: "arc"
      readonly center: Vec2
      readonly radius: number
      readonly startAngle: number
      readonly endAngle: number
    }
  | {
      readonly kind: "polyline"
      readonly vertices: readonly Vec2[]
      readonly bulges: readonly number[]
      readonly widths: readonly PolylineWidth[]
    }
  | { readonly kind: "polyline3d"; readonly vertices: readonly Vec3[] }
  /** A spline's piece, already wearing its object's properties (`splineEdits`). */
  | { readonly kind: "spline"; readonly spline: SplineEntity }

/** The surviving pieces, from the object's start — none when all of it goes. */
type BreakResult = readonly BreakGeom[]

const PARAM_EPS = 1e-6
const ANGLE_EPS = 1e-6
const PLANE_EPS = 1e-9

export class BreakTool implements Tool {
  constructor(
    private readonly mode: BreakMode,
    readonly id: string
  ) {}

  private state: BreakState = { phase: "select", hover: null }
  /**
   * The selection modes typed at `Select object:`. What one finds has no pick
   * point, so the first break point is asked for; AutoCAD 2027's console takes
   * the oldest unlocked object found, after a line for each locked one
   * (probes pieces/p101–p104, p107, p125–p132, p178).
   */
  private readonly modes = new ObjectSelector({
    takes: () => "oneObject",
    done: () => {},
    question: () => "selectObject",
    modes: ONE_OBJECT_MODES,
    accept: (ids, ctx) =>
      ids.filter((id) => {
        const entity = ctx.document.get(id)
        return (
          entity !== undefined &&
          (breakable(entity) || cannotBreak(entity) !== null)
        )
      }),
    one: {
      take: (entity, ctx) => {
        if (!this.refuse(entity, ctx)) this.askFirst(entity, ctx)
      },
      newest: false,
      locked: "objectOnLockedLayer",
      pick: (point, ctx) => this.pickObject(point, ctx),
    },
  })

  onActivate(ctx: ToolContext): void {
    this.state = { phase: "select", hover: null }
    this.modes.start()
    ctx.setCursor("crosshair")
    ctx.selection.clear()
  }

  onDeactivate(ctx: ToolContext): void {
    this.state = { phase: "select", hover: null }
    this.modes.start()
    ctx.dynamicInput.close()
  }

  question(): PromptId {
    switch (this.state.phase) {
      case "select":
        return this.modes.question()
      case "first":
        return this.mode === "atPoint"
          ? "specifyBreakPoint"
          : "specifyFirstBreakPoint"
      case "second":
        return this.state.respecified
          ? "specifySecondBreakPoint"
          : "specifySecondBreakPointOr"
    }
  }

  /**
   * `Select object:` is a set of one object, and the second break point keeps
   * its keyword's refusal even where the prompt lists none (AutoCAD 2027's
   * console, probes pieces/p146, p150).
   */
  takes(): QuestionInput {
    switch (this.state.phase) {
      case "select":
        return this.modes.takes()
      case "first":
        return "point"
      case "second":
        return { refusal: "pointOrKeywordRequired" }
    }
  }

  /**
   * The second break point is LASTPOINT, although its refusal is its own
   * (AutoCAD 2027's console, probes pieces/p146, p153, p154).
   */
  setsLastPoint(): boolean | null {
    return this.state.phase === "second" ? true : null
  }

  /**
   * WHY at `Select object:`: a typed or chosen object snap picks there, its
   * point the first break point and LASTPOINT (probes pieces/p108–p115,
   * p177), its Perpendicular from LASTPOINT (p113); a mode's points are
   * points already.
   */
  takesSnapOverride(): boolean {
    return this.state.phase === "select" && !this.modes.inMode()
  }

  snapsFromLastPoint(): boolean {
    return this.takesSnapOverride()
  }

  /** Object picking is by proximity; the break points themselves snap. */
  wantsSnap(): boolean {
    return this.state.phase !== "select" || this.modes.wantsSnap()
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    if (this.state.phase === "select" && this.modes.inMode()) {
      this.modes.onPointerMove(input, ctx)
      return
    }
    if (this.state.phase === "select") {
      const hover = this.pick(input.world, ctx)
      if (hover?.id !== this.state.hover?.id) {
        this.state = { phase: "select", hover: hover ?? null }
        ctx.requestRender()
      }
      return
    }
    if (this.state.phase === "second") {
      // WHY the snapped point: the click takes it (preview must equal
      // commit); AutoCAD's ghost trails the raw cursor under a far Endpoint
      // marker while its click takes the marker (desktop pieces/d13).
      this.state = { ...this.state, cursor: input.point }
      ctx.requestRender()
    }
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0) return
    switch (this.state.phase) {
      case "select": {
        if (this.modes.inMode()) {
          this.modes.onPointerDown(input, ctx)
          return
        }
        if (input.snap) ctx.setLastPoint(input.point)
        this.pickObject(input.snap ? input.point : input.world, ctx)
        return
      }
      case "first":
        this.placeFirst(input.point, ctx)
        return
      case "second":
        this.commit(this.state.target, this.state.first, input.point, ctx)
    }
  }

  onPointerUp(input: PointerInput, ctx: ToolContext): void {
    if (this.state.phase === "select") this.modes.onPointerUp(input, ctx)
  }

  /** Enter in a mode's prompt is the mode's; at `Select object:` it ends. */
  onEnter(ctx: ToolContext): boolean {
    return (
      this.state.phase === "select" &&
      this.modes.inMode() &&
      this.modes.onEnter(ctx)
    )
  }

  answerTyped(text: string, ctx: ToolContext): boolean {
    return this.state.phase === "select" && this.modes.answerTyped(text, ctx)
  }

  /**
   * First point, listed at the second break point it asks first; at the one
   * it asks after First point it is still declared, unlisted, and ends BREAK
   * changing nothing (probes pieces/p150, p171).
   */
  commandOptions(): readonly CommandOption[] {
    if (this.state.phase === "select") return this.modes.commandOptions()
    if (this.state.phase !== "second") return []
    return [
      this.state.respecified
        ? { id: "First point", hidden: true }
        : { id: "First point" },
    ]
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    if (this.state.phase === "select") {
      return this.modes.invokeOption(id, ctx) ? "continue" : "unhandled"
    }
    if (id !== "First point" || this.state.phase !== "second") {
      return "unhandled"
    }
    if (this.state.respecified) return "end"
    this.askFirst(this.state.target, ctx)
    return "continue"
  }

  /**
   * BREAK's ghost is the break the click would make: what it keeps in the
   * selection's glow over the object dimmed — nothing in the glow where all
   * of it goes, the object in the glow where it does nothing (desktop
   * pieces/d01-2–d01-4, d02-1, d03-1, d03-2, d04-2), as FILLET's. At
   * `Specify first break point:` the object is drawn plain (d04-1), at
   * BREAKATPOINT's point whole in the glow, both pieces kept (d14-1).
   */
  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    switch (this.state.phase) {
      case "select":
        if (this.modes.inMode()) return this.modes.buildOverlay(ctx)
        return this.state.hover ? rollover(ctx, this.state.hover) : []
      case "first":
        return this.mode === "atPoint"
          ? drawn(ctx, this.state.target, "glow")
          : []
      case "second": {
        const { target, first, cursor } = this.state
        const pieces = breakPieces(target, first, cursor, ctx.viewport, true)
        if (!pieces) return drawn(ctx, target, "glow")
        return [
          ...drawn(ctx, target, "faded"),
          ...pieces.flatMap((piece) => drawn(ctx, piece, "glow")),
        ]
      }
    }
  }

  /** The object the ghost draws again. */
  hiddenEntityIds(): readonly EntityId[] {
    switch (this.state.phase) {
      case "select":
        return []
      case "first":
        return this.mode === "atPoint" ? [this.state.target.id] : []
      case "second":
        return [this.state.target.id]
    }
  }

  /**
   * An object BREAK breaks (`breakable`), or one AutoCAD says it cannot
   * break.
   */
  private pick(world: Vec2, ctx: ToolContext): Entity | null {
    const hit = ctx.pick(world)
    return hit && (breakable(hit) || cannotBreak(hit) !== null) ? hit : null
  }

  /** Whether `entity` is one BREAK cannot break, saying so. */
  private refuse(entity: Entity, ctx: ToolContext): boolean {
    const message = cannotBreak(entity)
    if (message !== null) ctx.report(ctx.text.message(message))
    return message !== null
  }

  /**
   * The pick at `Select object:`, clicked, typed or snapped — AutoCAD 2027's
   * console takes a typed point as a pick there (probes pieces/p100, p122,
   * p144, p176, p179): on nothing `No object found` and the prompt again, as
   * on an object on a locked layer, which is said first, the newest under
   * the pick box tested, locked or not (p100, p105, p106, p124); BREAK's
   * pick is its first break point, BREAKATPOINT asks for its break point
   * separately.
   */
  private pickObject(world: Vec2 | Vec3, ctx: ToolContext): void {
    const at = { x: world.x, y: world.y }
    const screen = ctx.viewport.worldToScreen(world)
    if (lockedObjectAt(screen, ctx, ctx.pick(at))) {
      ctx.report(ctx.text.message("objectOnLockedLayer"), "error")
      ctx.report(ctx.text.message("noObjectFound"))
      return
    }
    const hit = this.pick(at, ctx)
    if (!hit) ctx.report(ctx.text.message("noObjectFound"))
    else if (this.refuse(hit, ctx)) ctx.requestRender()
    else if (this.mode === "atPoint") this.askFirst(hit, ctx)
    else this.askSecond(hit, world, false, ctx)
  }

  private askFirst(target: Entity, ctx: ToolContext): void {
    this.state = { phase: "first", target }
    this.openPointInput(ctx)
  }

  private askSecond(
    target: Entity,
    first: Vec2 | Vec3,
    respecified: boolean,
    ctx: ToolContext
  ): void {
    this.state = { phase: "second", target, first, cursor: first, respecified }
    this.openPointInput(ctx)
  }

  private placeFirst(point: Vec2 | Vec3, ctx: ToolContext): void {
    if (this.state.phase !== "first") return
    if (this.mode === "atPoint") {
      this.commit(this.state.target, point, point, ctx)
    } else {
      this.askSecond(this.state.target, point, true, ctx)
    }
  }

  /** A break point, picked or typed (`@` at the second: the first point again). */
  private openPointInput(ctx: ToolContext): void {
    ctx.dynamicInput.open({
      fields: [{ id: "point", kind: "coordinate" }],
      commit: () => {},
      commitRaw: (commitCtx) => this.commitTypedPoint(commitCtx),
    })
    ctx.requestRender()
  }

  /**
   * A break point typed, or Enter, which every break point refuses in its
   * own words and asks again (probes pieces/p146, p149–p151, desktop d15).
   * WHY absolute in the box too: the prompts have no base point and their
   * pointer input shows the cursor's X and Y (desktop d10-2, d10-4); `@` is
   * from the first point, LASTPOINT there.
   */
  private commitTypedPoint(ctx: ToolContext): boolean {
    const text = ctx.dynamicInput.getText("point").trim()
    if (text === "") {
      const refusal =
        this.state.phase === "second"
          ? "pointOrKeywordRequired"
          : "invalidPoint"
      ctx.report(ctx.text.message(refusal), "error")
      return true
    }
    if (!isCoordinateExpression(text)) return false
    const point = parseCoordinate(text, {
      lastPoint:
        this.state.phase === "second" ? this.state.first : ctx.lastPoint,
      relativeByDefault: false,
      ucs: ctx.ucs,
      elevation: ctx.elevation,
    })
    if (!point) return false
    if (this.state.phase === "first") this.placeFirst(point, ctx)
    else if (this.state.phase === "second") {
      this.commit(this.state.target, this.state.first, point, ctx)
    }
    return true
  }

  private commit(
    target: Entity,
    first: Vec2 | Vec3,
    second: Vec2 | Vec3,
    ctx: ToolContext
  ): void {
    const pieces = breakPieces(target, first, second, ctx.viewport, false)
    if (!pieces) {
      // WHY: AutoCAD 2027's console will not split a circle, an ellipse or
      // a closed spline in place (probes pieces/p207, p208, p223,
      // spline-knots/k23, k24); at a line's or an arc's end it does nothing
      // (p226, p227).
      if (target.type === "circle") {
        ctx.report(ctx.text.message("arcCannotBeFull360"))
      } else if (
        target.type === "ellipse" ||
        (target.type === "spline" && target.closed)
      ) {
        ctx.report(ctx.text.message("cannotBreakClosedAtOnePoint"))
      }
      ctx.endCommand()
      return
    }
    if (pieces.length === 0) {
      ctx.execute(new RemoveEntitiesCommand([target.id]))
    } else if (pieces.length === 1) {
      ctx.execute(new UpdateEntityCommand(pieces[0]))
    } else {
      ctx.execute(new ReplaceEntitiesCommand([target.id], pieces))
    }
    ctx.endCommand()
  }
}

/** What {@link computeBreak} cuts. */
const BROKEN: ReadonlySet<Entity["type"]> = new Set([
  "line",
  "arc",
  "circle",
  "ellipse",
  "polyline",
  "polyline3d",
  "spline",
])

/**
 * WHY a polyline not level with the UCS and nothing else not level: AutoCAD
 * 2027 cuts one in its OCS, as here (probes pieces/p190, p192), and breaks an
 * ARC, CIRCLE or ELLIPSE too, a −Z one reading the picks' WCS X,Y as OCS
 * coordinates (p191, p193, p199, p229, p230), a tilted one by a rule p188
 * does not settle.
 */
function breakable(entity: Entity): boolean {
  return (
    BROKEN.has(entity.type) &&
    (readsInPlan(entity) ||
      entity.type === "polyline" ||
      (entity.type === "spline" && !standsUpright(entity)))
  )
}

/** A spline whose plane stands upright on the XY plane has no plan to break it in. */
function standsUpright(spline: SplineEntity): boolean {
  return !!spline.normal && Math.abs(spline.normal.z) <= PLANE_EPS
}

/**
 * What AutoCAD 2027's console says of an object BREAK cannot break, asking
 * `Select object:` again (probes pieces/p180–p187).
 */
function cannotBreak(entity: Entity): MessageId | null {
  switch (entity.type) {
    case "insert":
      return "cannotBreakBlock"
    case "text":
    case "mtext":
    case "attdef":
    case "dimension":
    case "hatch":
    case "region":
    case "solid3d":
      return "objectCannotBeBroken"
    case "line":
    case "circle":
    case "arc":
    case "ellipse":
    case "spline":
    case "polyline":
    case "polyline3d":
      return null
    default: {
      const unhandled: never = entity
      return unhandled
    }
  }
}

function toEntity(source: Entity, geom: BreakGeom, id?: EntityId): Entity {
  switch (geom.kind) {
    case "ellipse":
      return carryPiece(
        source,
        createEllipse(geom.center, geom.majorAxis, geom.ratio, {
          startParam: geom.startParam,
          endParam: geom.endParam,
          layerId: source.layerId,
          id,
        })
      )
    case "line":
      return carryPiece(
        source,
        createLine(geom.start, geom.end, source.layerId, id)
      )
    case "arc":
      return carryPiece(
        source,
        createArc(
          geom.center,
          geom.radius,
          geom.startAngle,
          geom.endAngle,
          source.layerId,
          id
        )
      )
    case "polyline":
      return carryPiece(
        source,
        createPolyline(
          geom.vertices,
          false,
          source.layerId,
          geom.bulges,
          id,
          geom.widths
        )
      )
    case "polyline3d":
      return carryOverrides(
        source,
        createPolyline3d(geom.vertices, false, source.layerId, id)
      )
    case "spline":
      // WHY not `carryPiece`: the piece is made from its object, every
      // property kept, and `carryPlane` would set a 3D piece's Z to its
      // object's start's.
      return { ...geom.spline, id: id ?? nextEntityId() }
  }
}

/**
 * What a break at `first` and `second` keeps of `target`, worked out once for
 * the click and the ghost (`ghost`: a new piece under a fixed id). The piece
 * from the object's start, listed first, is the object kept (its handle; a
 * circle's one arc too), the other a new one, which Last then finds (AutoCAD
 * 2027's console, probes pieces/p213, p224, p225, p228); null where the break
 * does nothing.
 */
function breakPieces(
  target: Entity,
  first: Vec2 | Vec3,
  second: Vec2 | Vec3,
  view: CameraTransform,
  ghost: boolean
): Entity[] | null {
  const kept = computeBreak(target, first, second, view)
  const newId = ghost ? "break-preview" : undefined
  return (
    kept?.map((geom, i) =>
      toEntity(target, geom, i === 0 ? target.id : newId)
    ) ?? null
  )
}

/** The pieces a break at `first`/`second` leaves, or null when it does nothing. */
function computeBreak(
  entity: Entity,
  first: Vec2 | Vec3,
  second: Vec2 | Vec3,
  view: CameraTransform
): BreakResult | null {
  switch (entity.type) {
    case "line":
      return breakLine(entity, first, second)
    case "arc":
      return breakArc(entity, first, second)
    case "circle":
      return breakCircle(entity, first, second)
    case "polyline": {
      // A fitted one is broken as its curve, a polyline fitted no more
      // (pedit/p172).
      const curve = polylineCurve(entity)
      return readsInPlan(entity)
        ? breakPolyline(curve, first, second)
        : breakPolyline(
            curve,
            inPlaneOf(entity, first, view),
            inPlaneOf(entity, second, view)
          )
    }
    case "ellipse":
      return breakEllipse(entity, first, second)
    case "polyline3d":
      return breakPolyline3d(entity, first, second)
    case "spline":
      return breakSpline(entity, first, second)
    case "text":
    case "mtext":
    case "attdef":
    case "dimension":
    case "hatch":
    case "insert":
    case "region":
    case "solid3d":
      return null
  }
}

function breakLine(
  line: LineEntity,
  first: Vec2,
  second: Vec2
): BreakResult | null {
  const t1 = paramOnLine(line, first)
  const t2 = paramOnLine(line, second)
  const ta = Math.min(t1, t2)
  const tb = Math.max(t1, t2)
  const at = (t: number) =>
    V.add(line.start, V.scale(V.sub(line.end, line.start), t))

  if (tb - ta < PARAM_EPS) {
    // A gapless split: only meaningful away from the ends.
    if (ta < PARAM_EPS || ta > 1 - PARAM_EPS) return null
    return [
      { kind: "line", start: line.start, end: at(ta) },
      { kind: "line", start: at(ta), end: line.end },
    ]
  }

  const kept: BreakGeom[] = []
  if (ta > PARAM_EPS) {
    kept.push({ kind: "line", start: line.start, end: at(ta) })
  }
  if (tb < 1 - PARAM_EPS) {
    kept.push({ kind: "line", start: at(tb), end: line.end })
  }
  return kept
}

function breakArc(
  arc: ArcEntity,
  first: Vec2,
  second: Vec2
): BreakResult | null {
  const sweep = arcSweepAngle(arc)
  const o1 = offsetAlongSweep(arc, first, sweep)
  const o2 = offsetAlongSweep(arc, second, sweep)
  const oa = Math.min(o1, o2)
  const ob = Math.max(o1, o2)
  const at = (offset: number) => normalizeAngle(arc.startAngle + offset)

  if (ob - oa < ANGLE_EPS) {
    if (oa < ANGLE_EPS || oa > sweep - ANGLE_EPS) return null
    return [
      arcGeom(arc, arc.startAngle, at(oa)),
      arcGeom(arc, at(oa), arc.endAngle),
    ]
  }

  const kept: BreakGeom[] = []
  if (oa > ANGLE_EPS) kept.push(arcGeom(arc, arc.startAngle, at(oa)))
  if (ob < sweep - ANGLE_EPS) kept.push(arcGeom(arc, at(ob), arc.endAngle))
  return kept
}

/**
 * Breaking a circle removes the arc running counter-clockwise from the first
 * point to the second, so what survives is the complementary arc — AutoCAD's
 * rule, and the reason picking order matters on a circle.
 */
function breakCircle(
  circle: CircleEntity,
  first: Vec2,
  second: Vec2
): BreakResult | null {
  const a1 = angleAt(circle.center, first)
  const a2 = angleAt(circle.center, second)
  const removedSweep = normalizeAngle(a2 - a1)
  if (removedSweep < ANGLE_EPS) return null

  return [
    {
      kind: "arc",
      center: circle.center,
      radius: circle.radius,
      startAngle: a2,
      endAngle: a1,
    },
  ]
}

/**
 * A polyline loses the part between the two points in its vertices' order,
 * whichever is picked first (AutoCAD 2027's console, probes pieces/p210,
 * p211, p218, p219): an open one keeps what lies before and after, a closed
 * one what runs on from the later point round to the earlier, opened there,
 * even where that is the longer way round (p212). The same point twice
 * splits it, a closed one at its start vertex too, and does nothing at an
 * end or at that vertex (p213–p217).
 */
function breakPolyline(
  poly: PolylineEntity,
  first: Vec2,
  second: Vec2
): BreakResult | null {
  const count = polylineSegments(poly).length
  const t1 = polylineParamAt(poly, first)
  const t2 = polylineParamAt(poly, second)
  const ta = Math.min(t1, t2)
  const tb = Math.max(t1, t2)
  const span = (from: number, to: number): BreakGeom => ({
    kind: "polyline",
    ...polylineSpan(poly, from, to),
  })

  if (tb - ta < PARAM_EPS) {
    if (ta < PARAM_EPS || ta > count - PARAM_EPS) return null
    return [span(0, ta), span(ta, count)]
  }
  if (poly.closed) {
    const rest = ta + count - tb
    return rest > PARAM_EPS ? [span(tb, ta + count)] : []
  }
  const kept: BreakGeom[] = []
  if (ta > PARAM_EPS) kept.push(span(0, ta))
  if (tb < count - PARAM_EPS) kept.push(span(tb, count))
  return kept
}

/**
 * A 3D polyline cut in plan as a polyline is, each cut end at the Z the
 * polyline has there (3dpoly/p12: 5,0 to 10,5 leaves 10,5,1 onwards).
 */
function breakPolyline3d(
  poly: Polyline3dEntity,
  first: Vec2,
  second: Vec2
): BreakResult | null {
  const count = polyline3dSegments(poly).length
  if (count === 0) return null
  const t1 = polyline3dParamAt(poly, first)
  const t2 = polyline3dParamAt(poly, second)
  const ta = Math.min(t1, t2)
  const tb = Math.max(t1, t2)
  const span = (from: number, to: number): BreakGeom => ({
    kind: "polyline3d",
    vertices: polyline3dSpan(poly, from, to),
  })
  if (tb - ta < PARAM_EPS) {
    if (ta < PARAM_EPS || ta > count - PARAM_EPS) return null
    return [span(0, ta), span(ta, count)]
  }
  if (poly.closed) {
    const rest = ta + count - tb
    return rest > PARAM_EPS ? [span(tb, ta + count)] : []
  }
  const kept: BreakGeom[] = []
  if (ta > PARAM_EPS) kept.push(span(0, ta))
  if (tb < count - PARAM_EPS) kept.push(span(tb, count))
  return kept
}

/**
 * An ellipse loses what runs counter-clockwise from the first point to the
 * second, as a circle does, its piece keeping the handle; an elliptical arc
 * what lies between them in its parameter, as an arc does (AutoCAD 2027's
 * console, probes pieces/p220–p222) — cut with `ellipseCut`, as TRIM cuts it.
 */
function breakEllipse(
  ellipse: EllipseEntity,
  first: Vec2,
  second: Vec2
): BreakResult | null {
  const piece = (part: EllipsePiece): BreakGeom => ({
    kind: "ellipse",
    center: ellipse.center,
    majorAxis: ellipse.majorAxis,
    ratio: ellipse.ratio,
    ...part,
  })
  const t1 = ellipseParamAt(ellipse, first)
  const t2 = ellipseParamAt(ellipse, second)
  if (isFullEllipse(ellipse)) {
    const gap = normalizeAngle(t2 - t1)
    if (gap < ANGLE_EPS) return null
    return ellipseCut(ellipse, t1, t1 + gap).kept.map(piece)
  }
  const { sweep } = ellipseSweepParams(ellipse)
  const from = Math.min(t1, t2)
  const to = Math.max(t1, t2)
  const split = to - from < ANGLE_EPS
  if (split && (from < ANGLE_EPS || from > sweep - ANGLE_EPS)) return null
  return ellipseCut(ellipse, from, to).kept.map(piece)
}

/**
 * A spline breaks on its own parameter, in plan, each piece on the knots it
 * had there, a fit spline's a fit spline (`splineBreakPiece`): an open one
 * loses what lies between the points, whichever comes first, split by `@`,
 * untouched at an end (spline-knots/k05, k06, k21, k22); a closed one is
 * left one open piece from the later point round to the earlier, whichever
 * is picked first (k07, k37), within its first turn, its seam read as the
 * turn's end (k08), and will not split at one point (k23, k24). One at an
 * angle to the UCS is broken in plan, as a 3D one (k33).
 */
function breakSpline(
  spline: SplineEntity,
  first: Vec2,
  second: Vec2
): BreakResult | null {
  const world = splineInWorld(spline)
  const { start, end, period } = splineRun(world)
  const eps = PARAM_EPS * Math.max(1, end - start)
  const piece = (from: number, to: number): BreakGeom => ({
    kind: "spline",
    spline: splineInPlaneOf(splineBreakPiece(world, from, to), spline),
  })
  let t1 = splineParamAt(world, first)
  let t2 = splineParamAt(world, second)
  if (period !== null) {
    if (t1 - start < eps) t1 = end
    if (t2 - start < eps) t2 = end
    const from = Math.min(t1, t2)
    const to = Math.max(t1, t2)
    if (to - from < eps) return null
    const shift = to >= end - eps ? period : 0
    return [piece(to - shift, from + period - shift)]
  }
  const from = Math.min(t1, t2)
  const to = Math.max(t1, t2)
  if (to - from < eps) {
    if (from < start + eps || from > end - eps) return null
    return [piece(start, from), piece(from, end)]
  }
  const kept: BreakGeom[] = []
  if (from > start + eps) kept.push(piece(start, from))
  if (to < end - eps) kept.push(piece(to, end))
  return kept
}

/**
 * A break point on a polyline not level with the UCS, in its OCS: one lying
 * in its plane, typed or snapped, where it lies; any other where the line of
 * sight through it meets the plane.
 */
function inPlaneOf(
  poly: PolylineEntity,
  point: Vec2 | Vec3,
  view: CameraTransform
): Vec2 {
  const local = worldToEntity(poly, point)
  return Math.abs(local.z - entityElevation(poly)) < PLANE_EPS
    ? planar(local)
    : cursorOnEntityPlane(view, poly, view.worldToScreen(point))
}

function arcGeom(
  arc: ArcEntity,
  startAngle: number,
  endAngle: number
): BreakGeom {
  return {
    kind: "arc",
    center: arc.center,
    radius: arc.radius,
    startAngle,
    endAngle,
  }
}

function paramOnLine(line: LineEntity, p: Vec2): number {
  const dir = V.sub(line.end, line.start)
  const lenSq = V.lengthSq(dir)
  if (lenSq === 0) return 0
  const t = V.dot(V.sub(p, line.start), dir) / lenSq
  return Math.max(0, Math.min(1, t))
}

/**
 * How far along the arc's sweep a point lies, in radians from its start angle.
 * A point in the gap outside the sweep falls back to whichever end it is
 * nearer, which is how AutoCAD pulls an off-object pick onto the object.
 */
function offsetAlongSweep(arc: ArcEntity, p: Vec2, sweep: number): number {
  const offset = normalizeAngle(angleAt(arc.center, p) - arc.startAngle)
  if (offset <= sweep) return offset
  return offset - sweep < Math.PI * 2 - offset ? sweep : 0
}

function angleAt(center: Vec2, p: Vec2): number {
  return Math.atan2(p.y - center.y, p.x - center.x)
}

import { Vec2, V } from "../../geometry/Vec2"
import {
  angleWithinSweep,
  bulgeThroughPoint,
  circleCircleIntersection,
  closestPointOnInfiniteLine,
  filletLines,
  infiniteLineIntersection,
  lineCircleIntersectionParams,
  normalizeAngle,
  polarPoint,
} from "../../geometry/primitives"
import {
  createArc,
  createLine,
  carryOverrides,
  carryPlane,
  createPolyline,
  polylineSegmentGeometries,
  polylineSegments,
  Entity,
  LineEntity,
  PolylineEntity,
  PolylineSegmentGeometry,
} from "../../domain/entities"
import {
  ReplaceEntitiesCommand,
  UpdateEntityCommand,
} from "../commands/entityCommands"
import { DynamicInputSession } from "../input/DynamicInput"
import { ScenePrimitive, StrokeStyle } from "../../scene/types"
import { THEME } from "../../scene/theme"
import { arcScenePrimitive, entityScenePrimitive } from "../SceneBuilder"
import {
  CommandOption,
  CommandOptionOutcome,
  KeyInput,
  PointerInput,
  Tool,
  ToolContext,
} from "./Tool"

/**
 * AutoCAD's FILLET: round the corner between two lines with an arc of a given
 * radius, trimming (or extending) both lines to the points of tangency.
 *
 * ```
 *   ┌── [R] Radius ──► type radius ──┐
 *   ▼                                │
 *  first ──click line──► second ──click line──► fillet + Select
 *    └── click polyline ──► fillet every corner + Select
 * ```
 *
 * You pick two lines; the arc is placed in the corner nearest to where you
 * clicked each line (the picks choose which of the four possible corners to
 * round), and the lines are trimmed/extended to meet it. The **Radius** keyword
 * sets the arc radius and persists for the tool's session; a radius of 0 simply
 * joins the two lines at their intersection with no arc — exactly like AutoCAD.
 *
 * Clicking a **polyline** instead rounds *every* eligible straight corner at
 * once with the current radius (AutoCAD's Polyline option), replacing each
 * corner with a tangent arc bulge in a single connected polyline.
 *
 * The whole edit is one command (a {@link ReplaceEntitiesCommand} for two
 * lines, or an {@link UpdateEntityCommand} for a polyline), so a single undo
 * reverts the fillet.
 */

type FilletState =
  /** Awaiting the first object: a line, or a polyline (hover-highlighted). */
  | { readonly phase: "first"; readonly hover: Entity | null }
  /** First line chosen; awaiting the second (a live preview tracks the cursor). */
  | {
      readonly phase: "second"
      readonly line1: LineEntity
      /** The point clicked on the first line — picks which corner to round. */
      readonly pick1: Vec2
      readonly hover: LineEntity | null
      readonly cursor: Vec2
    }

export class FilletTool implements Tool {
  readonly id = "fillet"
  readonly shortcut = "f"

  private state: FilletState = { phase: "first", hover: null }
  /** The fillet radius, persisted across the tool's session (AutoCAD-style). */
  private radius = 0
  /** True while the radius sub-prompt's input is open (object picks paused). */
  private awaitingRadius = false
  private lastScreen: Vec2 | null = null

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    ctx.selection.clear()
    this.state = { phase: "first", hover: null }
    this.awaitingRadius = false
    this.openSelectPrompt(ctx)
  }

  onDeactivate(ctx: ToolContext): void {
    this.state = { phase: "first", hover: null }
    this.awaitingRadius = false
    ctx.dynamicInput.close()
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen
    ctx.dynamicInput.setPosition(input.screen)
    if (this.awaitingRadius) {
      ctx.requestRender()
      return
    }

    if (this.state.phase === "first") {
      this.state = { phase: "first", hover: this.pickFirst(input, ctx) }
    } else {
      this.state = {
        ...this.state,
        hover: this.pickLine(input, ctx, this.state.line1.id),
        cursor: input.world,
      }
    }
    ctx.requestRender()
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0 || this.awaitingRadius) return

    if (this.state.phase === "first") {
      const hit = this.pickFirst(input, ctx)
      if (!hit) return
      if (hit.type === "polyline") {
        this.commitPolylineFillet(hit, ctx)
        return
      }
      if (hit.type !== "line") return
      this.state = {
        phase: "second",
        line1: hit,
        pick1: input.world,
        hover: null,
        cursor: input.world,
      }
      ctx.requestRender()
      return
    }

    const line2 = this.pickLine(input, ctx, this.state.line1.id)
    if (!line2) return
    this.commitFillet(
      this.state.line1,
      this.state.pick1,
      line2,
      input.world,
      ctx
    )
  }

  onKeyDown(input: KeyInput, ctx: ToolContext): void {
    if (input.key === "Escape") ctx.dynamicInput.close()
  }

  commandOptions(): readonly CommandOption[] {
    return this.awaitingRadius ? [] : [{ id: "Radius" }]
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    if (id === "Radius" && !this.awaitingRadius) {
      this.openRadiusPrompt(ctx)
      return "continue"
    }
    return "unhandled"
  }

  wantsSnap(): boolean {
    // Lines are picked by proximity, not precise points, so running snaps would
    // only clutter the hover — the same choice as TRIM/EXTEND.
    return false
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    const { viewport } = ctx
    const line = (a: Vec2, b: Vec2, stroke: StrokeStyle): ScenePrimitive => ({
      kind: "segment",
      a: viewport.worldToScreen(a),
      b: viewport.worldToScreen(b),
      stroke,
    })

    if (this.state.phase === "first") {
      const h = this.state.hover
      if (!h) return []
      return h.type === "line"
        ? [line(h.start, h.end, hoverStroke)]
        : entityScenePrimitive(viewport, h, hoverStroke)
    }

    const { line1, pick1, hover, cursor } = this.state
    const prims = [line(line1.start, line1.end, selectedStroke)]
    if (!hover) return prims

    const result = filletLines(
      line1.start,
      line1.end,
      hover.start,
      hover.end,
      pick1,
      cursor,
      this.radius
    )
    if (!result) {
      prims.push(line(hover.start, hover.end, hoverStroke))
      return prims
    }

    const trimmed1 = trimLine(
      line1,
      result.corner,
      result.direction1,
      result.tangent1
    )
    const trimmed2 = trimLine(
      hover,
      result.corner,
      result.direction2,
      result.tangent2
    )
    if (trimmed1) prims.push(line(trimmed1.start, trimmed1.end, hoverStroke))
    if (trimmed2) prims.push(line(trimmed2.start, trimmed2.end, hoverStroke))
    if (result.radius > 0) {
      prims.push(
        arcScenePrimitive(
          viewport,
          result.center,
          result.radius,
          result.startAngle,
          result.endAngle,
          { color: THEME.rubberBand, width: 1 }
        )
      )
    }
    return prims
  }

  private commitFillet(
    line1: LineEntity,
    pick1: Vec2,
    line2: LineEntity,
    pick2: Vec2,
    ctx: ToolContext
  ): void {
    const result = filletLines(
      line1.start,
      line1.end,
      line2.start,
      line2.end,
      pick1,
      pick2,
      this.radius
    )
    if (!result) return // degenerate (parallel/collinear) — keep prompting

    const trimmed1 = trimLine(
      line1,
      result.corner,
      result.direction1,
      result.tangent1
    )
    const trimmed2 = trimLine(
      line2,
      result.corner,
      result.direction2,
      result.tangent2
    )
    if (!trimmed1 || !trimmed2) return

    const added: Entity[] = [trimmed1, trimmed2]
    if (result.radius > 0) {
      // AutoCAD places the arc on the lines' shared layer, or the current layer
      // when they differ.
      const arcLayer =
        line1.layerId === line2.layerId
          ? line1.layerId
          : ctx.document.getCurrentLayerId()
      added.push(
        carryPlane(
          line1,
          createArc(
            result.center,
            result.radius,
            result.startAngle,
            result.endAngle,
            arcLayer
          )
        )
      )
    }

    ctx.execute(new ReplaceEntitiesCommand([line1.id, line2.id], added))
    ctx.dynamicInput.close()
    ctx.endCommand()
  }

  /** The visible line nearest the cursor, excluding `excludeId`, or `null`. */
  private pickLine(
    input: PointerInput,
    ctx: ToolContext,
    excludeId: string | null
  ): LineEntity | null {
    const hit = ctx.pick(input.world)
    if (!hit || hit.type !== "line" || hit.id === excludeId) return null
    return hit
  }

  /** The first-pick target under the cursor: a line, or a polyline. */
  private pickFirst(input: PointerInput, ctx: ToolContext): Entity | null {
    const hit = ctx.pick(input.world)
    if (!hit) return null
    if (hit.type === "line" || hit.type === "polyline") return hit
    return null
  }

  /**
   * AutoCAD's FILLET Polyline: rounds every eligible corner of `poly` with the
   * current radius in one step, then ends the command. Corners whose fillet
   * would not fit (radius too large for an adjacent segment) are left sharp.
   */
  private commitPolylineFillet(poly: PolylineEntity, ctx: ToolContext): void {
    ctx.dynamicInput.close()
    if (this.radius > 0) {
      const filleted = filletPolyline(poly, this.radius)
      if (filleted) ctx.execute(new UpdateEntityCommand(filleted))
    }
    ctx.endCommand()
  }

  /** Opens the keyword-only object-selection prompt (shows the [R] chip). */
  private openSelectPrompt(ctx: ToolContext): void {
    const session: DynamicInputSession = { fields: [], commit: () => {} }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  private openRadiusPrompt(ctx: ToolContext): void {
    this.awaitingRadius = true
    const session: DynamicInputSession = {
      fields: [{ id: "radius", prompt: "filletRadius", kind: "distance" }],
      commit: (values, commitCtx) => this.setRadius(values.radius, commitCtx),
    }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setLive("radius", this.radius)
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }

  private setRadius(value: number, ctx: ToolContext): void {
    if (Number.isFinite(value) && value >= 0) this.radius = value
    this.awaitingRadius = false
    this.openSelectPrompt(ctx)
    ctx.requestRender()
  }
}

const hoverStroke: StrokeStyle = { color: THEME.entityHover, width: 2 }
const selectedStroke: StrokeStyle = { color: THEME.selected, width: 2 }

/**
 * Rebuilds `line` trimmed/extended to end at `tangent`: the endpoint on the
 * picked side (farther from the corner along `dir`) is kept, the other becomes
 * the tangent point. Preserves the line's id and layer. `null` when the result
 * would be zero-length.
 */
function trimLine(
  line: LineEntity,
  corner: Vec2,
  dir: Vec2,
  tangent: Vec2
): LineEntity | null {
  const keepEnd =
    V.dot(V.sub(line.end, corner), dir) >= V.dot(V.sub(line.start, corner), dir)
      ? line.end
      : line.start
  if (V.equals(keepEnd, tangent)) return null
  return carryOverrides(
    line,
    createLine(keepEnd, tangent, line.layerId, line.id)
  )
}

/** A resolved corner fillet: the two tangent points and the arc bulge between. */
interface CornerFillet {
  readonly entry: Vec2 // tangent point toward the previous vertex
  readonly exit: Vec2 // tangent point toward the next vertex
  readonly bulge: number // AutoCAD bulge of the arc from entry to exit
  readonly entryDist: number // distance from the corner to the entry tangent
  readonly exitDist: number // distance from the corner to the exit tangent
}

/**
 * Rounds every eligible corner of `poly` at `radius`, returning a new polyline
 * (same id) whose corners are tangent arc bulges. Straight-to-straight corners
 * use the plain two-line fillet; corners touching an arc segment are solved as a
 * circle tangent to a line and/or a circle. An arc segment adjacent to a fillet
 * has its bulge recomputed from the trimmed endpoints so its curvature stays
 * exact. Corners are skipped when the fillet is degenerate or would overrun an
 * adjacent segment (so two neighbouring fillets never collide). Returns `null`
 * when nothing changes.
 */
function filletPolyline(
  poly: PolylineEntity,
  radius: number
): PolylineEntity | null {
  const v = poly.vertices
  const n = v.length
  if (n < 3) return null
  const geoms = polylineSegmentGeometries(poly)
  const segLen = polylineSegments(poly).map(([a, b]) => V.distance(a, b))

  // Corner i sits between segment (i-1) and segment i. Open polylines only
  // fillet interior corners; closed ones fillet every vertex (with wraparound).
  const isCorner = (i: number) => (poly.closed ? true : i > 0 && i < n - 1)
  const fillets: (CornerFillet | null)[] = v.map((_, i) =>
    isCorner(i) ? cornerFillet(poly, i, radius, segLen, geoms) : null
  )

  // Drop neighbouring fillets that would overrun their shared segment (corner j
  // encroaches from its exit, corner j+1 from its entry).
  for (let j = 0; j < segLen.length; j++) {
    const fa = fillets[j]
    const fb = fillets[(j + 1) % n]
    if (fa && fb && fa.exitDist + fb.entryDist > segLen[j] + 1e-9) {
      fillets[j] = null
      fillets[(j + 1) % n] = null
    }
  }

  if (fillets.every((f) => f === null)) return null

  // A segment adjacent to a fillet is trimmed to the tangent point(s); an arc
  // segment's bulge is recomputed from those (possibly moved) endpoints.
  const segCount = poly.closed ? n : n - 1
  const segBulge: number[] = []
  for (let i = 0; i < segCount; i++) {
    const g = geoms[i]
    if (g.kind === "line") {
      segBulge.push(0)
      continue
    }
    const endIdx = (i + 1) % n
    const start = fillets[i] ? fillets[i]!.exit : v[i]
    const end = fillets[endIdx] ? fillets[endIdx]!.entry : v[endIdx]
    segBulge.push(arcBulgeFromEndpoints(g.center, start, end, g.bulge))
  }

  const pts: Vec2[] = []
  const bulges: number[] = []
  for (let i = 0; i < n; i++) {
    const f = fillets[i]
    const hasOut = poly.closed || i < n - 1
    if (f) {
      pts.push(f.entry)
      bulges.push(f.bulge) // the fillet arc, entry → exit
      pts.push(f.exit)
      if (hasOut) bulges.push(segBulge[i]) // outgoing segment, recomputed
    } else {
      pts.push(v[i])
      if (hasOut) bulges.push(segBulge[i])
    }
  }
  return carryOverrides(
    poly,
    createPolyline(pts, poly.closed, poly.layerId, bulges, poly.id)
  )
}

/** The fillet for corner `i`, or `null` when it isn't eligible. */
function cornerFillet(
  poly: PolylineEntity,
  i: number,
  radius: number,
  segLen: readonly number[],
  geoms: readonly PolylineSegmentGeometry[]
): CornerFillet | null {
  const n = poly.vertices.length
  const incoming = (i - 1 + n) % n // segment arriving at vertex i
  const outgoing = i // segment leaving vertex i
  const corner = poly.vertices[i]
  const gi = geoms[incoming]
  const go = geoms[outgoing]

  // Straight-to-straight corners use the plain two-line fillet (unchanged).
  if (gi.kind === "line" && go.kind === "line") {
    const prev = poly.vertices[(i - 1 + n) % n]
    const next = poly.vertices[(i + 1) % n]
    const result = filletLines(prev, corner, corner, next, prev, next, radius)
    if (!result || result.radius <= 0) return null
    const tangentDist = V.distance(result.tangent1, corner)
    if (
      tangentDist > segLen[incoming] + 1e-9 ||
      tangentDist > segLen[outgoing] + 1e-9
    ) {
      return null
    }
    const sweep = normalizeAngle(result.endAngle - result.startAngle)
    const mid = polarPoint(
      result.center,
      result.radius,
      result.startAngle + sweep / 2
    )
    return {
      entry: result.tangent1,
      exit: result.tangent2,
      bulge: bulgeThroughPoint(result.tangent1, result.tangent2, mid),
      entryDist: tangentDist,
      exitDist: tangentDist,
    }
  }

  // Any corner touching an arc is solved as a circle tangent to the two sides.
  const inSide = toFilletSide(gi, corner, true)
  const outSide = toFilletSide(go, corner, false)
  return solveCornerFillet(
    inSide,
    outSide,
    corner,
    radius,
    segLen[incoming],
    segLen[outgoing]
  )
}

/** One side of a corner: a straight segment or a circular arc, with the unit
 * travel tangent at the corner (into it for the incoming side, out for the
 * outgoing side). */
type FilletSide =
  | { readonly kind: "line"; readonly tangent: Vec2; readonly far: Vec2 }
  | {
      readonly kind: "arc"
      readonly tangent: Vec2
      readonly center: Vec2
      readonly radius: number
      readonly startAngle: number
      readonly endAngle: number
    }

/** Builds a {@link FilletSide} for the segment `g` meeting `corner`. `incoming`
 * = the segment arrives at the corner (tangent points into it), else it leaves. */
function toFilletSide(
  g: PolylineSegmentGeometry,
  corner: Vec2,
  incoming: boolean
): FilletSide {
  if (g.kind === "line") {
    const far = incoming ? g.a : g.b
    // Travel direction along the segment's own a→b orientation — into the corner
    // for the incoming side, out of it for the outgoing side, matching the arc
    // branch so `turn` and the interior normals are consistent for both sides.
    return { kind: "line", tangent: V.normalize(V.sub(g.b, g.a)), far }
  }
  // The arc's travel tangent at the corner: perpendicular to the radius, in the
  // CCW direction for a positive bulge (its natural start→end orientation).
  const radial = V.normalize(V.sub(corner, g.center))
  const ccw = g.bulge >= 0
  const travel = ccw ? V.perpendicular(radial) : negate(V.perpendicular(radial))
  return {
    kind: "arc",
    tangent: travel,
    center: g.center,
    radius: g.radius,
    startAngle: g.startAngle,
    endAngle: g.endAngle,
  }
}

/** The fillet circle of `radius` tangent to both sides, in the corner's wedge. */
function solveCornerFillet(
  inSide: FilletSide,
  outSide: FilletSide,
  corner: Vec2,
  radius: number,
  inSegLen: number,
  outSegLen: number
): CornerFillet | null {
  if (radius <= 0) return null
  const turn = Math.sign(V.cross(inSide.tangent, outSide.tangent))
  if (turn === 0) return null // collinear — no corner to round

  const nIn = interiorNormal(inSide.tangent, turn)
  const nOut = interiorNormal(outSide.tangent, turn)
  const locusIn = sideLocus(inSide, corner, nIn, radius)
  const locusOut = sideLocus(outSide, corner, nOut, radius)
  if (!locusIn || !locusOut) return null

  const ref = V.add(corner, V.scale(V.normalize(V.add(nIn, nOut)), radius))
  const center = intersectLoci(locusIn, locusOut, ref)
  if (!center) return null

  const entry = sideTangentPoint(inSide, corner, center)
  const exit = sideTangentPoint(outSide, corner, center)
  if (
    !sideContains(inSide, entry, corner, inSegLen) ||
    !sideContains(outSide, exit, corner, outSegLen)
  ) {
    return null
  }

  const mid = V.add(center, V.scale(V.normalize(V.sub(corner, center)), radius))
  return {
    entry,
    exit,
    bulge: bulgeThroughPoint(entry, exit, mid),
    entryDist: V.distance(corner, entry),
    exitDist: V.distance(corner, exit),
  }
}

/** The locus of fillet-circle centres at distance `radius` from a side, on the
 * corner-interior side: a parallel line, or a concentric circle. */
type CenterLocus =
  | { readonly kind: "line"; readonly p0: Vec2; readonly p1: Vec2 }
  | { readonly kind: "circle"; readonly center: Vec2; readonly radius: number }

function sideLocus(
  side: FilletSide,
  corner: Vec2,
  normal: Vec2,
  radius: number
): CenterLocus | null {
  if (side.kind === "line") {
    const p0 = V.add(corner, V.scale(normal, radius))
    return { kind: "line", p0, p1: V.add(p0, side.tangent) }
  }
  // Concentric circle: outside the arc when the interior lies outside, inside
  // otherwise. `rho` collapses when the fillet can't fit against the arc.
  const outward = V.normalize(V.sub(corner, side.center))
  const rho =
    V.dot(normal, outward) >= 0 ? side.radius + radius : side.radius - radius
  if (rho <= 1e-9) return null
  return { kind: "circle", center: side.center, radius: rho }
}

function intersectLoci(a: CenterLocus, b: CenterLocus, ref: Vec2): Vec2 | null {
  if (a.kind === "line" && b.kind === "line") {
    const x = infiniteLineIntersection(a.p0, a.p1, b.p0, b.p1)
    return x ? x.point : null
  }
  if (a.kind === "line" && b.kind === "circle") {
    return nearestPoint(lineCirclePoints(a.p0, a.p1, b.center, b.radius), ref)
  }
  if (a.kind === "circle" && b.kind === "line") {
    return nearestPoint(lineCirclePoints(b.p0, b.p1, a.center, a.radius), ref)
  }
  if (a.kind === "circle" && b.kind === "circle") {
    return nearestPoint(
      circleCircleIntersection(a.center, a.radius, b.center, b.radius),
      ref
    )
  }
  return null
}

/** The tangent point where the fillet circle at `center` touches a side. */
function sideTangentPoint(side: FilletSide, corner: Vec2, center: Vec2): Vec2 {
  if (side.kind === "line") {
    return closestPointOnInfiniteLine(
      corner,
      V.add(corner, side.tangent),
      center
    ).point
  }
  return V.add(
    side.center,
    V.scale(V.normalize(V.sub(center, side.center)), side.radius)
  )
}

/** Whether a tangent point lies within the side's real extent (segment length
 * for a line, sweep for an arc) so the fillet doesn't fall off the segment. */
function sideContains(
  side: FilletSide,
  point: Vec2,
  corner: Vec2,
  segLen: number
): boolean {
  if (side.kind === "line") {
    // The tangent point must lie between the corner and the segment's far end.
    const body = V.normalize(V.sub(side.far, corner))
    const along = V.dot(V.sub(point, corner), body)
    return along >= -1e-9 && along <= segLen + 1e-9
  }
  const angle = Math.atan2(point.y - side.center.y, point.x - side.center.x)
  return angleWithinSweep(side.startAngle, side.endAngle, angle)
}

/** Points where the infinite line through `a`/`b` meets a circle. */
function lineCirclePoints(
  a: Vec2,
  b: Vec2,
  center: Vec2,
  radius: number
): Vec2[] {
  const dir = V.sub(b, a)
  return lineCircleIntersectionParams(a, b, center, radius).map((t) =>
    V.add(a, V.scale(dir, t))
  )
}

/** The point in `points` nearest `ref`, or `null` when there are none. */
function nearestPoint(points: readonly Vec2[], ref: Vec2): Vec2 | null {
  let best: Vec2 | null = null
  let bestDist = Infinity
  for (const p of points) {
    const d = V.distance(p, ref)
    if (d < bestDist) {
      bestDist = d
      best = p
    }
  }
  return best
}

/** The bulge of a concentric arc between two endpoints on its circle, keeping
 * the original rotational direction (sign). */
function arcBulgeFromEndpoints(
  center: Vec2,
  start: Vec2,
  end: Vec2,
  originalBulge: number
): number {
  const angStart = Math.atan2(start.y - center.y, start.x - center.x)
  const angEnd = Math.atan2(end.y - center.y, end.x - center.x)
  const included =
    originalBulge >= 0
      ? normalizeAngle(angEnd - angStart)
      : normalizeAngle(angStart - angEnd)
  const magnitude = Math.tan(included / 4)
  return originalBulge >= 0 ? magnitude : -magnitude
}

/** The interior normal of a side's travel direction for a left (`turn` > 0) or
 * right (`turn` < 0) corner — the direction toward the fillet centre. */
function interiorNormal(tangent: Vec2, turn: number): Vec2 {
  const perp = V.perpendicular(tangent) // +90° (left)
  return turn > 0 ? perp : negate(perp)
}

function negate(v: Vec2): Vec2 {
  return { x: -v.x, y: -v.y }
}

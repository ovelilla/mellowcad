import { Vec2, V } from "../geometry/Vec2"
import { Vec3 } from "../geometry/Vec3"
import { arcFit } from "../geometry/arcFit"
import { splineFitPoints } from "../geometry/splineFit"
import { bulgeToArc } from "../geometry/primitives"
import type {
  Entity,
  FitArcs,
  PolylineEntity,
  PolylineFit,
  PolylineWidth,
  Polyline3dEntity,
  Polyline3dFit,
} from "./entityTypes"

/** PEDIT's Spline kinds by SPLINETYPE (5 quadratic, 6 cubic). */
export type SplineFitKind = Polyline3dFit["kind"]

const curves = new WeakMap<PolylineEntity, PolylineEntity>()
const curves3d = new WeakMap<Polyline3dEntity, Polyline3dEntity>()

/**
 * What a polyline draws: itself, or, fitted, the polyline of its curve — a
 * Fit's frame with each segment's two arcs, a Spline's points on the
 * B-spline of its frame (straight, or arcs through them with a negative
 * SPLINESEGS: pedit/p54, p162, p198) — with no fit of its own. Drawing,
 * picking, snapping, measuring and the edits that cut or copy a polyline's
 * shape (OFFSET, TRIM, BREAK, EXPLODE: p169–p174) read this; Edit vertex, the
 * grips and the palette's vertices read the frame. Memoised per object, which
 * never changes.
 */
export function polylineCurve(poly: PolylineEntity): PolylineEntity {
  const fit = poly.fit
  if (!fit) return poly
  const known = curves.get(poly)
  if (known) return known
  const curve =
    fit.kind === "curve" ? arcsCurve(poly, fit.arcs) : splineCurve(poly, fit)
  curves.set(poly, curve)
  return curve
}

/** A 3D polyline's curve: its frame, or its Spline curve's straight runs. */
export function polyline3dCurve(poly: Polyline3dEntity): Polyline3dEntity {
  const fit = poly.fit
  if (!fit) return poly
  const known = curves3d.get(poly)
  if (known) return known
  const points = splineFitPoints(
    poly.vertices,
    poly.closed,
    degreeOf(fit.kind),
    Math.abs(fit.segments)
  )
  const frame = polyline3dFrame(poly)
  const curve = points.length > 0 ? { ...frame, vertices: points } : frame
  curves3d.set(poly, curve)
  return curve
}

/** `poly` without its fit: its frame, as Decurve leaves it but for the arcs. */
export function polylineFrame(poly: PolylineEntity): PolylineEntity {
  if (!poly.fit) return poly
  const copy: Record<string, unknown> = { ...poly }
  delete copy.fit
  return copy as unknown as PolylineEntity
}

export function polyline3dFrame(poly: Polyline3dEntity): Polyline3dEntity {
  if (!poly.fit) return poly
  const copy: Record<string, unknown> = { ...poly }
  delete copy.fit
  return copy as unknown as Polyline3dEntity
}

/** The tangents Edit vertex gave a fitted polyline's vertices, none when unfitted. */
export function polylineTangents(
  poly: PolylineEntity
): readonly (number | null)[] | undefined {
  return poly.fit?.tangents
}

/**
 * PEDIT's Fit: a curve of two arcs between each pair of vertices, tangent at
 * each vertex as {@link arcFit} turns it, the given `tangents` kept there
 * (pedit/p51, p59, p147–p150, p184–p186); the frame's own arcs are dropped
 * (p151). Done again on a fitted one, from its frame.
 */
export function polylineFitted(
  poly: PolylineEntity,
  tangents: readonly (number | null)[] | undefined = poly.fit?.tangents
): PolylineEntity {
  const frame = straightFrame(poly)
  const arcs: (FitArcs | null)[] = arcFit(
    frame.vertices,
    frame.closed,
    tangents ?? []
  )
  return withFit(frame, { kind: "curve", arcs, ...given(tangents) })
}

/**
 * PEDIT's Spline: the frame's B-spline, `segments` points per span (SPLINESEGS
 * when it was fitted: p52–p54). Null where AutoCAD leaves the polyline as it
 * was, a frame of two vertices (p190).
 */
export function polylineSplined(
  poly: PolylineEntity,
  kind: SplineFitKind,
  segments: number,
  tangents: readonly (number | null)[] | undefined = poly.fit?.tangents
): PolylineEntity | null {
  if (poly.vertices.length < 3) return null
  return withFit(straightFrame(poly), { kind, segments, ...given(tangents) })
}

export function polyline3dSplined(
  poly: Polyline3dEntity,
  kind: SplineFitKind,
  segments: number
): Polyline3dEntity | null {
  if (poly.vertices.length < 3) return null
  return { ...polyline3dFrame(poly), fit: { kind, segments } }
}

/**
 * PEDIT's Decurve (and its hidden Defit, pedit/p198): the frame with every
 * segment straight, of a polyline fitted or not (p50–p52, p182).
 */
export function polylineDecurved(poly: PolylineEntity): PolylineEntity {
  return straightFrame(poly)
}

/**
 * A Fit polyline fitted again after an edit AutoCAD refits it for — Close and
 * Open (p166), a tangent given (p150), STRETCH (p176); any other as it is.
 */
export function polylineRefitted(poly: PolylineEntity): PolylineEntity {
  return poly.fit?.kind === "curve" ? polylineFitted(poly) : poly
}

/** `poly` with its Fit's arcs and tangents as given, the fit kept only where `poly` had one. */
export function withFitParts(
  poly: PolylineEntity,
  arcs: readonly (FitArcs | null)[] | null,
  tangents: readonly (number | null)[] | undefined
): PolylineEntity {
  const fit = poly.fit
  if (!fit) return poly
  if (fit.kind === "curve") {
    return withFit(poly, {
      kind: "curve",
      arcs: arcs ?? fit.arcs,
      ...given(tangents),
    })
  }
  return withFit(poly, { ...stripTangents(fit), ...given(tangents) })
}

/**
 * The index in `polylineCurve(poly)`'s vertices of frame vertex `index`: a
 * Fit's joints come between.
 */
export function curveIndexOf(poly: PolylineEntity, index: number): number {
  const fit = poly.fit
  if (fit?.kind !== "curve") return index
  let at = index
  for (let i = 0; i < index; i++) if (fit.arcs[i]) at++
  return at
}

function withFit(poly: PolylineEntity, fit: PolylineFit): PolylineEntity {
  return { ...poly, fit }
}

function stripTangents(fit: PolylineFit): PolylineFit {
  const copy: Record<string, unknown> = { ...fit }
  delete copy.tangents
  return copy as unknown as PolylineFit
}

function given(tangents: readonly (number | null)[] | undefined): {
  tangents?: readonly (number | null)[]
} {
  // `+ 0` turns a -0 (a tangent typed as -0), which a file cannot hold, into 0.
  return tangents?.some((t) => t !== null)
    ? { tangents: tangents.map((t) => (t === null ? null : t + 0)) }
    : {}
}

/** The frame, every segment straight and no fit. */
function straightFrame(poly: PolylineEntity): PolylineEntity {
  const copy: Record<string, unknown> = { ...poly }
  delete copy.fit
  delete copy.bulges
  return copy as unknown as PolylineEntity
}

function degreeOf(kind: SplineFitKind): 2 | 3 {
  return kind === "quadratic" ? 2 : 3
}

function segmentCount(poly: PolylineEntity): number {
  const n = poly.vertices.length
  return poly.closed && n > 1 ? n : Math.max(n - 1, 0)
}

function widthOf(poly: PolylineEntity, i: number): PolylineWidth {
  return poly.widths?.[i] ?? [0, 0]
}

/** An arc's length from `a` to `b` by its bulge, its chord's where straight. */
function arcLength(a: Vec2, b: Vec2, bulge: number): number {
  if (bulge === 0) return V.distance(a, b)
  const { radius } = bulgeToArc(a, b, bulge)
  return radius * Math.abs(4 * Math.atan(bulge))
}

/**
 * A Fit's curve: each segment's arcs, its widths running on through the
 * joint by length (pedit/p151, p156: 1 to 2 over two equal arcs is 1.5 at
 * the joint).
 */
function arcsCurve(
  poly: PolylineEntity,
  arcs: readonly (FitArcs | null)[]
): PolylineEntity {
  const n = poly.vertices.length
  const count = segmentCount(poly)
  const vertices: Vec2[] = []
  const bulges: number[] = []
  const widths: PolylineWidth[] = []
  for (let i = 0; i < count; i++) {
    const a = poly.vertices[i]
    const b = poly.vertices[(i + 1) % n]
    const arc = arcs[i] ?? null
    const [start, end] = widthOf(poly, i)
    vertices.push(a)
    if (!arc) {
      bulges.push(poly.bulges?.[i] ?? 0)
      widths.push([start, end])
      continue
    }
    const first = arcLength(a, arc.joint, arc.bulges[0])
    const second = arcLength(arc.joint, b, arc.bulges[1])
    const total = first + second
    const middle = total > 0 ? start + ((end - start) * first) / total : start
    vertices.push(arc.joint)
    bulges.push(arc.bulges[0], arc.bulges[1])
    widths.push([start, middle], [middle, end])
  }
  if (!poly.closed && n > 0) vertices.push(poly.vertices[n - 1])
  return curveOf(poly, vertices, bulges, widths)
}

/**
 * A Spline's curve, its width running by length from the frame's first
 * width to its last (pedit/p163: 0 to 4 along it, 2 halfway; p157, a width
 * given a vertex between, none).
 */
function splineCurve(
  poly: PolylineEntity,
  fit: { readonly kind: SplineFitKind; readonly segments: number }
): PolylineEntity {
  const frame3: Vec3[] = poly.vertices.map((v) => ({ x: v.x, y: v.y, z: 0 }))
  const points = splineFitPoints(
    frame3,
    poly.closed,
    degreeOf(fit.kind),
    Math.abs(fit.segments)
  ).map((p) => ({ x: p.x, y: p.y }))
  if (points.length === 0) return straightFrame(poly)
  const vertices: Vec2[] = []
  const bulges: number[] = []
  if (fit.segments < 0) {
    const arcs = arcFit(points, poly.closed)
    points.forEach((p, i) => {
      vertices.push(p)
      const arc = arcs[i]
      if (i === points.length - 1 && !poly.closed) return
      if (!arc) {
        bulges.push(0)
        return
      }
      vertices.push(arc.joint)
      bulges.push(arc.bulges[0], arc.bulges[1])
    })
  } else {
    vertices.push(...points)
    bulges.push(
      ...Array.from({ length: points.length - (poly.closed ? 0 : 1) }, () => 0)
    )
  }
  const count = segmentCount(poly)
  const from = widthOf(poly, 0)[0]
  const to = widthOf(poly, count - 1)[1]
  const lengths = bulges.map((bulge, i) =>
    arcLength(vertices[i], vertices[(i + 1) % vertices.length], bulge)
  )
  const total = lengths.reduce((sum, l) => sum + l, 0)
  let run = 0
  const widths = lengths.map((l): PolylineWidth => {
    const a = total > 0 ? from + ((to - from) * run) / total : from
    run += l
    const b = total > 0 ? from + ((to - from) * run) / total : to
    return [a, b]
  })
  return curveOf(poly, vertices, bulges, widths)
}

function curveOf(
  poly: PolylineEntity,
  vertices: readonly Vec2[],
  bulges: readonly number[],
  widths: readonly PolylineWidth[]
): PolylineEntity {
  const copy: Record<string, unknown> = { ...poly, vertices }
  delete copy.fit
  if (bulges.some((b) => b !== 0)) copy.bulges = bulges
  else delete copy.bulges
  if (widths.some(([s, e]) => s > 0 || e > 0)) copy.widths = widths
  else delete copy.widths
  return copy as unknown as PolylineEntity
}

/**
 * A polyline's fit carried through a similarity: each Fit joint mapped by
 * `point`, each tangent by `angle`, the arcs turning the other way where it
 * reflects (pedit/p191: MIRROR negates them). Null where there is none.
 */
export function mappedFit(
  fit: PolylineFit | undefined,
  point: (p: Vec2) => Vec2,
  angle: (a: number) => number,
  reflects: boolean
): { fit?: PolylineFit } {
  if (!fit) return {}
  const turned = given(fit.tangents?.map((t) => (t === null ? null : angle(t))))
  if (fit.kind !== "curve") return { fit: { ...fit, ...turned } }
  const sign = reflects ? -1 : 1
  return {
    fit: {
      kind: "curve",
      arcs: fit.arcs.map((arc) =>
        arc
          ? {
              joint: point(arc.joint),
              bulges: [sign * arc.bulges[0], sign * arc.bulges[1]] as const,
            }
          : null
      ),
      ...turned,
    },
  }
}

/** What `entity` draws as: a fitted polyline's curve, else itself. */
export function entityShape<T extends Entity>(entity: T): T {
  if (entity.type === "polyline" && entity.fit) {
    return polylineCurve(entity) as T
  }
  if (entity.type === "polyline3d" && entity.fit) {
    return polyline3dCurve(entity) as T
  }
  return entity
}

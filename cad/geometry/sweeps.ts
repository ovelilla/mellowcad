import { Vec2 } from "./Vec2"
import {
  Vec3,
  add3,
  cross3,
  dot3,
  length3,
  normalize3,
  scale3,
  sub3,
} from "./Vec3"
import { Axes3, axesToWorld } from "./ocs"
import {
  BSplineCurve,
  bsplineDomain,
  bsplinePoint,
  bsplineReversed,
  bsplineSegment,
} from "./nurbs"
import {
  MODEL_TOLERANCE,
  PlanarCurve,
  curveEnd,
  curveStart,
} from "./planarCurves"
import { RegionFace, RegionLoop, loopSelfIntersects } from "./planarRegions"
import {
  Brep,
  BrepCurve,
  unsignedDomain,
  unsignedNurbs,
  BrepFace,
  BrepLoop,
  BrepSurface,
  FaceDomain,
  SweptCurve,
  unsigned0,
} from "./solids"
import { turnedAbout } from "./faceDomains"

/**
 * A planar region in space, as EXTRUDE and REVOLVE take a profile: its
 * faces' loops (outlines counter-clockwise, holes clockwise) in the plane
 * `u X + v Y + elevation Z` of `axes`.
 */
export interface PlanarProfile {
  readonly axes: Axes3
  readonly elevation: number
  readonly faces: readonly RegionFace[]
}

/**
 * A profile's edge in space, run from its start to its end: a segment, a
 * conic's arc by its own angle (`curve`'s parameter from `from` to `to`), or
 * a spline over its whole domain.
 */
type SpaceEdge =
  | { readonly kind: "line"; readonly start: Vec3; readonly end: Vec3 }
  | {
      readonly kind: "conic"
      readonly curve: Extract<SweptCurve, { kind: "ellipse" }>
      readonly from: number
      readonly to: number
      readonly circle: boolean
    }
  | { readonly kind: "spline"; readonly curve: BSplineCurve }

function edgeStart(e: SpaceEdge): Vec3 {
  if (e.kind === "line") return e.start
  if (e.kind === "spline") {
    return splineAt(e.curve, bsplineDomain(e.curve).start)
  }
  return conicAt(e.curve, e.from)
}

function edgeEnd(e: SpaceEdge): Vec3 {
  if (e.kind === "line") return e.end
  if (e.kind === "spline") return splineAt(e.curve, bsplineDomain(e.curve).end)
  return conicAt(e.curve, e.to)
}

function conicAt(c: Extract<SweptCurve, { kind: "ellipse" }>, t: number): Vec3 {
  return add3(
    c.center,
    add3(scale3(c.majorAxis, Math.cos(t)), scale3(c.minorAxis, Math.sin(t)))
  )
}

function splineAt(curve: BSplineCurve, t: number): Vec3 {
  return bsplinePoint(curve, t)
}

/** Whether the edge starts and ends at one point: a whole circle, ellipse or closed spline. */
function isClosedEdge(e: SpaceEdge): boolean {
  if (e.kind === "line") return false
  if (e.kind === "conic") return Math.abs(e.to - e.from) >= 2 * Math.PI - 1e-9
  return length3(sub3(edgeStart(e), edgeEnd(e))) <= MODEL_TOLERANCE
}

/** The edge carried by a map of points and the matching map of directions. */
function edgeMapped(
  e: SpaceEdge,
  point: (p: Vec3) => Vec3,
  direction: (d: Vec3) => Vec3
): SpaceEdge {
  switch (e.kind) {
    case "line":
      return { kind: "line", start: point(e.start), end: point(e.end) }
    case "conic":
      return {
        ...e,
        curve: {
          kind: "ellipse",
          center: point(e.curve.center),
          majorAxis: direction(e.curve.majorAxis),
          minorAxis: direction(e.curve.minorAxis),
        },
      }
    case "spline":
      return {
        kind: "spline",
        curve: { ...e.curve, controlPoints: e.curve.controlPoints.map(point) },
      }
  }
}

function edgeReversed(e: SpaceEdge): SpaceEdge {
  switch (e.kind) {
    case "line":
      return { kind: "line", start: e.end, end: e.start }
    case "conic":
      return { ...e, from: e.to, to: e.from }
    case "spline":
      return { kind: "spline", curve: bsplineReversed(e.curve) }
  }
}

/** A planar curve of the profile's plane, in space. */
function spaceEdge(c: PlanarCurve, axes: Axes3, elevation: number): SpaceEdge {
  const at = (p: Vec2): Vec3 =>
    axesToWorld(axes, { x: p.x, y: p.y, z: elevation })
  const along = (v: Vec2): Vec3 => axesToWorld(axes, { x: v.x, y: v.y, z: 0 })
  switch (c.kind) {
    case "line":
      return { kind: "line", start: at(c.start), end: at(c.end) }
    case "arc":
      return {
        kind: "conic",
        curve: {
          kind: "ellipse",
          center: at(c.center),
          majorAxis: scale3(axes.x, c.radius),
          minorAxis: scale3(axes.y, c.radius),
        },
        from: c.startAngle,
        to: c.startAngle + c.sweep,
        circle: true,
      }
    case "ellipse":
      return {
        kind: "conic",
        curve: {
          kind: "ellipse",
          center: at(c.center),
          majorAxis: along(c.majorAxis),
          minorAxis: along({
            x: -c.majorAxis.y * c.ratio,
            y: c.majorAxis.x * c.ratio,
          }),
        },
        from: c.startParam,
        to: c.startParam + c.sweep,
        circle: false,
      }
    case "spline": {
      const lo = Math.min(c.from, c.to)
      const hi = Math.max(c.from, c.to)
      const domain = bsplineDomain(c.curve)
      let curve =
        lo <= domain.start && hi >= domain.end
          ? c.curve
          : bsplineSegment(c.curve, lo, hi)
      if (c.to < c.from) curve = bsplineReversed(curve)
      return {
        kind: "spline",
        curve: {
          ...curve,
          controlPoints: curve.controlPoints.map((p) => at(p)),
        },
      }
    }
  }
}

/**
 * The edge's curve as the B-rep holds it, run from its start to its end: a
 * conic round the normal it turns counter-clockwise about.
 */
function brepCurve(e: SpaceEdge): BrepCurve {
  switch (e.kind) {
    case "line":
      return { kind: "line" }
    case "spline":
      return { kind: "spline", curve: e.curve }
    case "conic": {
      const { center, majorAxis, minorAxis } = e.curve
      const turn = cross3(majorAxis, minorAxis)
      const normal = normalize3(e.to > e.from ? turn : scale3(turn, -1))!
      if (e.circle) {
        return { kind: "circle", center, normal, radius: length3(majorAxis) }
      }
      return {
        kind: "ellipse",
        center,
        normal,
        majorAxis,
        ratio: length3(minorAxis) / length3(majorAxis),
      }
    }
  }
}

/** Vertices, edges and faces gathered as a sweep makes them. */
class Builder {
  readonly vertices: Vec3[] = []
  readonly edges: { start: number; end: number; curve: BrepCurve }[] = []
  readonly faces: BrepFace[] = []

  vertex(p: Vec3): number {
    this.vertices.push(unsigned0(p))
    return this.vertices.length - 1
  }

  edge(start: number, end: number, curve: BrepCurve): number {
    this.edges.push({ start, end, curve: unsignedCurve(curve) })
    return this.edges.length - 1
  }

  face(surface: BrepSurface, loops: BrepLoop[], domain?: FaceDomain): void {
    this.faces.push({
      surface: unsignedSurface(surface),
      loops,
      ...(domain ? { domain: unsignedDomain(domain) } : {}),
    })
  }

  brep(): Brep {
    return { vertices: this.vertices, edges: this.edges, faces: this.faces }
  }
}

function unsignedSwept(c: SweptCurve): SweptCurve {
  return c.kind === "ellipse"
    ? {
        kind: "ellipse",
        center: unsigned0(c.center),
        majorAxis: unsigned0(c.majorAxis),
        minorAxis: unsigned0(c.minorAxis),
      }
    : {
        kind: "spline",
        curve: unsignedNurbs(c.curve),
      }
}

function unsignedCurve(c: BrepCurve): BrepCurve {
  switch (c.kind) {
    case "line":
    case "point":
      return c
    case "circle":
      return { ...c, center: unsigned0(c.center), normal: unsigned0(c.normal) }
    case "ellipse":
      return {
        ...c,
        center: unsigned0(c.center),
        normal: unsigned0(c.normal),
        majorAxis: unsigned0(c.majorAxis),
      }
    case "spline":
      return {
        kind: "spline",
        curve: unsignedNurbs(c.curve),
      }
  }
}

function unsignedSurface(s: BrepSurface): BrepSurface {
  switch (s.kind) {
    case "plane":
      return { ...s, origin: unsigned0(s.origin), normal: unsigned0(s.normal) }
    case "cylinder":
      return {
        ...s,
        origin: unsigned0(s.origin),
        axis: unsigned0(s.axis),
        xAxis: unsigned0(s.xAxis),
      }
    case "cone":
      return {
        ...s,
        apex: unsigned0(s.apex),
        axis: unsigned0(s.axis),
        xAxis: unsigned0(s.xAxis),
      }
    case "sphere":
    case "torus":
      return {
        ...s,
        center: unsigned0(s.center),
        axis: unsigned0(s.axis),
        xAxis: unsigned0(s.xAxis),
      }
    case "extrusion":
      return {
        ...s,
        profile: unsignedSwept(s.profile),
        direction: unsigned0(s.direction),
      }
    case "revolution":
      return {
        ...s,
        profile: unsignedSwept(s.profile),
        origin: unsigned0(s.origin),
        axis: unsigned0(s.axis),
      }
  }
}

/** Newell's normal of a polygon, unit: a planar face's, from its corners in order. */
function polygonNormal(points: readonly Vec3[]): Vec3 | null {
  const o = points[0]
  let n: Vec3 = { x: 0, y: 0, z: 0 }
  points.forEach((p, i) => {
    n = add3(n, cross3(sub3(p, o), sub3(points[(i + 1) % points.length], o)))
  })
  return normalize3(n)
}

/** The profile's loops in space, each turned so its face lies on its left about `normal`. */
function spaceLoops(
  profile: PlanarProfile,
  flip: boolean
): { loops: SpaceEdge[][]; face: number }[] {
  return profile.faces.flatMap((face, f) =>
    face.loops.map((loop) => {
      const edges = loop.map((c) =>
        spaceEdge(c, profile.axes, profile.elevation)
      )
      return {
        face: f,
        loops: [flip ? edges.map(edgeReversed).reverse() : edges],
      }
    })
  )
}

/**
 * Each loop moved `d` towards the region's inside, square to its edges —
 * EXTRUDE's taper at one height (x01, x09: a circle's radius shrinks, a
 * segment slides in and meets its neighbours where they cross, a polygon's
 * mitre): `side` 1 when the region lies on the edges' left. Null where the
 * taper turns an edge round, shrinks an arc to nothing or makes the loop
 * cross itself — what AutoCAD refuses (x06: a 10 × 10 square tapered 60° to
 * 10 high makes nothing) — or an edge is an ellipse's or a spline's, whose
 * offset no conic or polynomial holds.
 */
export function taperedLoop(
  loop: RegionLoop,
  d: number,
  side: 1 | -1
): RegionLoop | null {
  if (d === 0) return loop
  const shifted: (PlanarCurve | null)[] = loop.map((c) => {
    if (c.kind === "line") {
      const dx = c.end.x - c.start.x
      const dy = c.end.y - c.start.y
      const len = Math.hypot(dx, dy)
      const nx = (-dy / len) * d * side
      const ny = (dx / len) * d * side
      return {
        kind: "line",
        start: { x: c.start.x + nx, y: c.start.y + ny },
        end: { x: c.end.x + nx, y: c.end.y + ny },
      }
    }
    if (c.kind === "arc") {
      const radius = c.radius - Math.sign(c.sweep) * side * d
      return radius > MODEL_TOLERANCE ? { ...c, radius } : null
    }
    return null
  })
  if (shifted.some((c) => c === null)) return null
  const curves = shifted as PlanarCurve[]
  const n = curves.length
  if (n === 1) return curves
  // Where each curve meets the next.
  const corners: Vec2[] = []
  for (let i = 0; i < n; i++) {
    const p = cornerOf(curves[i], curves[(i + 1) % n])
    if (!p) return null
    corners.push(p)
  }
  const out: PlanarCurve[] = []
  for (let i = 0; i < n; i++) {
    const from = corners[(i + n - 1) % n]
    const to = corners[i]
    const c = curves[i]
    const was = loop[i]
    if (c.kind !== "line") {
      // Its neighbours meet it tangentially: it keeps its angles.
      out.push(c)
      continue
    }
    const along =
      (to.x - from.x) * (curveEnd(was).x - curveStart(was).x) +
      (to.y - from.y) * (curveEnd(was).y - curveStart(was).y)
    if (
      !(along > 0) ||
      Math.hypot(to.x - from.x, to.y - from.y) <= MODEL_TOLERANCE
    ) {
      return null
    }
    out.push({ kind: "line", start: from, end: to })
  }
  return loopSelfIntersects(out) ? null : out
}

/**
 * Where two offset curves meet: the moved ends, when the curves met
 * tangentially; two segments' lines where they cross. An arc meeting a
 * neighbour at a corner is null: its taper's edge there is the conic where
 * the cone meets the plane or cone beside it (x09's NurbCurve3d), which this
 * kernel does not hold yet.
 */
function cornerOf(a: PlanarCurve, b: PlanarCurve): Vec2 | null {
  const end = curveEnd(a)
  const start = curveStart(b)
  if (Math.hypot(end.x - start.x, end.y - start.y) <= MODEL_TOLERANCE) {
    return end
  }
  if (a.kind !== "line" || b.kind !== "line") return null
  const d1 = { x: a.end.x - a.start.x, y: a.end.y - a.start.y }
  const d2 = { x: b.end.x - b.start.x, y: b.end.y - b.start.y }
  const den = d1.x * d2.y - d1.y * d2.x
  if (Math.abs(den) < 1e-12 * Math.hypot(d1.x, d1.y) * Math.hypot(d2.x, d2.y)) {
    return null
  }
  const t =
    ((b.start.x - a.start.x) * d2.y - (b.start.y - a.start.y) * d2.x) / den
  return { x: a.start.x + d1.x * t, y: a.start.y + d1.y * t }
}

/**
 * The solid EXTRUDE makes of a profile, as ACIS builds it (x01, x09): a side
 * face for each edge of each loop — a plane for a segment, a cylinder for an
 * arc (its seam at the arc's start) or a cone when tapered, an elliptical
 * cylinder for an elliptical arc, an extrusion of a spline, a closed one
 * with a seam ruling —, then the top and the bottom. `offset` takes the
 * profile to its top: along its normal, or any way but along its plane
 * (Direction, x02: the top a copy, the sides an extrusion's); `taper`
 * (radians, under a right angle either way) narrows it as it rises, only
 * along the normal. A whole circle tapered shut ends at its apex below the
 * height (x03: 45° on a radius 5 to 10 high makes a cone 5 high); any other
 * loop tapered past what it can take is null, as is a taper on an ellipse or a
 * spline.
 */
export function extrusionBrep(
  profile: PlanarProfile,
  offset: Vec3,
  taper = 0
): Brep | null {
  const normal = profile.axes.z
  const rise = dot3(offset, normal)
  if (Math.abs(rise) <= MODEL_TOLERANCE) return null
  const flip = rise < 0
  const up = flip ? scale3(normal, -1) : normal
  const height = Math.abs(rise)
  const straight =
    length3(sub3(scale3(up, height), offset)) <=
    MODEL_TOLERANCE * Math.max(1, height)
  let tops: PlanarProfile | null = null
  let apex: number | null = null
  if (taper !== 0 && straight) {
    const d = height * Math.tan(taper)
    const single =
      profile.faces.length === 1 &&
      profile.faces[0].loops.length === 1 &&
      profile.faces[0].loops[0].length === 1 &&
      profile.faces[0].loops[0][0].kind === "arc"
    const circle = single ? profile.faces[0].loops[0][0] : null
    if (circle?.kind === "arc" && d >= circle.radius - MODEL_TOLERANCE) {
      // Shut before the height: a cone up to its apex.
      apex = circle.radius / Math.tan(taper)
    } else {
      const faces: RegionFace[] = []
      for (const face of profile.faces) {
        const loops: RegionLoop[] = []
        for (const loop of face.loops) {
          const moved = taperedLoop(loop, d, 1)
          if (!moved) return null
          loops.push(moved)
        }
        faces.push({ loops })
      }
      tops = { ...profile, faces }
    }
  } else if (taper !== 0) {
    return null
  }
  const b = new Builder()
  const lift = (p: Vec3) => add3(p, offset)
  const sides: (() => void)[] = []
  const topLoops: BrepLoop[][] = profile.faces.map(() => [])
  const bottomLoops: BrepLoop[][] = profile.faces.map(() => [])
  const bottoms = spaceLoops(profile, flip)
  const topsInSpace = tops ? spaceLoops(tops, flip) : null
  bottoms.forEach(({ loops: [loop], face }, l) => {
    const n = loop.length
    const topLoop = (topsInSpace ? topsInSpace[l].loops[0] : loop).map((e) =>
      edgeMapped(e, lift, (v) => v)
    )
    const closed = n === 1 && isClosedEdge(loop[0])
    const seamless = closed && loop[0].kind === "conic"
    const lower = loop.map((e) => b.vertex(edgeStart(e)))
    const upper =
      apex !== null
        ? [b.vertex(add3(conicCenter(loop[0]), scale3(up, apex)))]
        : topLoop.map((e) => b.vertex(edgeStart(e)))
    const bottomEdges = loop.map((e, i) =>
      b.edge(lower[i], lower[(i + 1) % n], brepCurve(e))
    )
    const topEdges =
      apex !== null
        ? [b.edge(upper[0], upper[0], { kind: "point" })]
        : topLoop.map((e, i) =>
            b.edge(upper[i], upper[(i + 1) % n], brepCurve(e))
          )
    const rulings = seamless
      ? []
      : lower.map((v, i) => b.edge(v, upper[i], { kind: "line" }))
    bottomLoops[face].push(
      [...bottomEdges].reverse().map((edge) => ({ edge, reversed: true }))
    )
    if (apex === null) {
      topLoops[face].push(topEdges.map((edge) => ({ edge, reversed: false })))
    }
    loop.forEach((e, i) => {
      const top = apex !== null ? null : topLoop[i]
      const loops: BrepLoop[] = seamless
        ? [
            [{ edge: bottomEdges[i], reversed: false }],
            [{ edge: topEdges[i], reversed: apex === null }],
          ]
        : [
            [
              { edge: bottomEdges[i], reversed: false },
              { edge: rulings[(i + 1) % n], reversed: false },
              { edge: topEdges[i], reversed: true },
              { edge: rulings[i], reversed: true },
            ],
          ]
      sides.push(() =>
        sideFace(
          b,
          e,
          top,
          up,
          offset,
          height,
          straight,
          apex,
          tops !== null || apex !== null,
          loops
        )
      )
    })
  })
  // ACIS's order: the sides, then the top, then the bottom (x01).
  for (const side of sides) side()
  topLoops.forEach((loops) => {
    if (loops.length > 0) {
      b.face(
        {
          kind: "plane",
          origin: b.vertices[b.edges[loops[0][0].edge].start],
          normal: up,
        },
        loops
      )
    }
  })
  bottomLoops.forEach((loops) => {
    b.face(
      {
        kind: "plane",
        origin: b.vertices[b.edges[loops[0][0].edge].start],
        normal: scale3(up, -1),
      },
      loops
    )
  })
  return b.brep()
}

function conicCenter(e: SpaceEdge): Vec3 {
  return e.kind === "conic" ? e.curve.center : edgeStart(e)
}

/** One side face of an extrusion: its surface and where on it it lies. */
function sideFace(
  b: Builder,
  e: SpaceEdge,
  top: SpaceEdge | null,
  up: Vec3,
  offset: Vec3,
  height: number,
  straight: boolean,
  apex: number | null,
  tapered: boolean,
  loops: BrepLoop[]
): void {
  if (e.kind === "line") {
    const normal = polygonNormal([
      e.start,
      e.end,
      top ? edgeEnd(top) : add3(e.end, offset),
      top ? edgeStart(top) : add3(e.start, offset),
    ])!
    b.face({ kind: "plane", origin: e.start, normal }, loops)
    return
  }
  if (e.kind === "conic" && straight) {
    const { center, majorAxis, minorAxis } = e.curve
    const a = length3(majorAxis)
    const xAxis = normalize3(majorAxis)!
    // θ round `up`: the conic's own angle where its minor axis lies on up × X, against it otherwise.
    const turns = dot3(cross3(up, xAxis), minorAxis) > 0 ? 1 : -1
    const ratio = length3(minorAxis) / a
    // A circle's seam is its arc's start (x09's ReferenceAxis).
    const x = e.circle ? normalize3(sub3(edgeStart(e), center))! : xAxis
    const u: [number, number] = e.circle
      ? [0, turns * (e.to - e.from)]
      : [turns * e.from, turns * e.to]
    if (!tapered) {
      b.face(
        {
          kind: "cylinder",
          origin: center,
          axis: up,
          xAxis: x,
          radius: a,
          ratio,
        },
        loops,
        { u, v: [0, height] }
      )
      return
    }
    // Tapered: a cone, its apex where the radius would reach nothing.
    const topRadius =
      apex !== null
        ? 0
        : top!.kind === "conic"
          ? length3(top!.curve.majorAxis)
          : a
    const narrows = topRadius < a
    const reach = apex ?? (height * a) / Math.abs(a - topRadius)
    const axis = narrows ? scale3(up, -1) : up
    const tip = add3(center, scale3(up, narrows ? reach : -reach))
    const slope = a / reach
    const t0 = reach
    const t1 = narrows ? reach - (apex ?? height) : reach + height
    // Round the cone's axis the angle runs the other way when it points down.
    const sign = narrows ? -1 : 1
    b.face(
      { kind: "cone", apex: tip, axis, xAxis: x, slope, ratio: 1 },
      loops,
      { u: [sign * u[0], sign * u[1]], v: [t0, t1] }
    )
    return
  }
  const direction = normalize3(offset)!
  const length = length3(offset)
  if (e.kind === "conic") {
    b.face({ kind: "extrusion", profile: e.curve, direction }, loops, {
      u: [e.from, e.to],
      v: [0, length],
    })
    return
  }
  const { start, end } = bsplineDomain(e.curve)
  b.face(
    {
      kind: "extrusion",
      profile: { kind: "spline", curve: e.curve },
      direction,
    },
    loops,
    { u: [start, end], v: [0, length] }
  )
}

/** What rounding leaves of an arc's centre on the axis, relative to its radius. */
const EXACT = 1e-12

/** The slope, either way, under which a cone is too flat or too steep to integrate on. */
const ALONG = 1e-3

/** Why a profile cannot be turned round an axis, in REVOLVE's words (r05). */
export type RevolveRefusal = "crossesAxis" | "perpendicularAxis" | "notInPlane"

/** A profile point's place about the axis: along it, and out from it towards the profile. */
function meridian(
  p: Vec3,
  origin: Vec3,
  axis: Vec3,
  out: Vec3
): { h: number; rho: number } {
  const d = sub3(p, origin)
  return { h: dot3(d, axis), rho: dot3(d, out) }
}

/**
 * Whether REVOLVE can turn the profile round the line through `origin` along
 * the unit `axis`, and, if it can, the side of the axis the profile lies on
 * (unit, square to the axis, in the profile's plane). AutoCAD turns a profile
 * round an axis off its plane too (r05: 40,0,0 to 40,10,10), into faces this
 * kernel cannot hold yet: refused here as one it could not turn.
 */
export function revolveSide(
  profile: PlanarProfile,
  origin: Vec3,
  axis: Vec3
): Vec3 | RevolveRefusal {
  const normal = profile.axes.z
  if (length3(cross3(axis, normal)) <= 1e-9) return "perpendicularAxis"
  const off = dot3(
    sub3(
      axesToWorld(profile.axes, { x: 0, y: 0, z: profile.elevation }),
      origin
    ),
    normal
  )
  if (Math.abs(dot3(axis, normal)) > 1e-9 || Math.abs(off) > MODEL_TOLERANCE) {
    return "notInPlane"
  }
  const across = normalize3(cross3(normal, axis))!
  let lo = Infinity
  let hi = -Infinity
  for (const { loops } of spaceLoops(profile, false)) {
    for (const e of loops[0]) {
      for (const p of edgeSamples(e)) {
        const side = dot3(sub3(p, origin), across)
        lo = Math.min(lo, side)
        hi = Math.max(hi, side)
      }
    }
  }
  const size = Math.max(1, hi - lo)
  if (lo < -MODEL_TOLERANCE * size && hi > MODEL_TOLERANCE * size) {
    return "crossesAxis"
  }
  return hi > -lo ? across : scale3(across, -1)
}

/** Points along an edge dense enough to find it crossing a line: its ends and every turn of a conic, a spline's control points' hull. */
function edgeSamples(e: SpaceEdge): Vec3[] {
  if (e.kind === "line") return [e.start, e.end]
  if (e.kind === "spline") {
    const { start, end } = bsplineDomain(e.curve)
    return Array.from({ length: 129 }, (_, k) =>
      splineAt(e.curve, start + ((end - start) * k) / 128)
    )
  }
  return Array.from({ length: 129 }, (_, k) =>
    conicAt(e.curve, e.from + ((e.to - e.from) * k) / 128)
  )
}

/**
 * The solid REVOLVE makes, as ACIS builds it (r01–r06): the profile turned
 * `angle` radians (2π a whole turn) round the line through `origin` along
 * the unit `axis`, right-handed, from `start` radians; `out` is the side of
 * the axis the profile lies on ({@link revolveSide}). A face for each edge
 * off the axis — a cylinder, a cone or a plane for a segment, a sphere or a
 * torus for an arc, a revolution for an elliptical arc or a spline —, each
 * vertex off the axis tracing a circle or an arc, an edge on it none; short
 * of a whole turn, the profile turned to its start and its end closes it. A
 * cone's apex is an edge of no length (r06); a sphere or a doughnut turned
 * whole has no edge at all (r06's half disc).
 */
export function revolutionBrep(
  profile: PlanarProfile,
  origin: Vec3,
  axis: Vec3,
  out: Vec3,
  start: number,
  angle: number
): Brep {
  const whole = Math.abs(angle) >= 2 * Math.PI - 1e-12
  // Turned backwards is turned forwards round the axis reversed.
  const A = angle < 0 ? scale3(axis, -1) : axis
  const from = angle < 0 ? -start : start
  const sweep = whole ? 2 * Math.PI : Math.abs(angle)
  const to = from + sweep
  const normal = profile.axes.z
  // The face's outside is ∂θ × ∂s when the turn carries the profile against
  // its normal; otherwise the profile is read from its other side.
  const flip = dot3(cross3(A, out), normal) > 0
  const up = flip ? scale3(normal, -1) : normal
  const y = cross3(A, out)
  const turn = (p: Vec3, a: number) => turnedAbout(p, origin, A, a)
  const turnDir = (d: Vec3, a: number) =>
    sub3(turnedAbout(add3(origin, d), origin, A, a), origin)
  const at = (p: Vec3) => meridian(p, origin, A, out)
  const scale = profile.faces.reduce(
    (m, f) =>
      f.loops.reduce(
        (m2, loop) =>
          loop.reduce(
            (m3, c) =>
              Math.max(
                m3,
                Math.abs(curveStart(c).x),
                Math.abs(curveStart(c).y)
              ),
            m2
          ),
        m
      ),
    1
  )
  const onAxis = (p: Vec3) => Math.abs(at(p).rho) <= MODEL_TOLERANCE * scale
  const b = new Builder()
  const sides: (() => void)[] = []
  const caps: { start: BrepLoop[]; end: BrepLoop[] }[] = profile.faces.map(
    () => ({ start: [], end: [] })
  )
  for (const { loops, face } of spaceLoops(profile, flip)) {
    const loop = loops[0]
    const n = loop.length
    const closedOne = n === 1 && isClosedEdge(loop[0])
    const points = loop.map(edgeStart)
    const axial = points.map(onAxis)
    // Vertices: at the start and, short of a turn, at the end; one on the axis.
    const v0 = points.map((p) =>
      closedOne && whole ? -1 : b.vertex(turn(p, from))
    )
    const v1 = points.map((p, i) =>
      whole || axial[i] ? v0[i] : b.vertex(turn(p, to))
    )
    const lying = loop.map(
      (e, i) => e.kind === "line" && axial[i] && axial[(i + 1) % n]
    )
    // The circle or arc each vertex off the axis traces.
    const rings = points.map((p, i) => {
      if (axial[i] || (closedOne && whole)) return -1
      const { h } = at(p)
      return b.edge(v0[i], v1[i], {
        kind: "circle",
        center: add3(origin, scale3(A, h)),
        normal: A,
        radius: at(p).rho,
      })
    })
    const startEdges = whole
      ? []
      : loop.map((e, i) =>
          b.edge(
            v0[i],
            v0[(i + 1) % n],
            brepCurve(
              edgeMapped(
                e,
                (p) => turn(p, from),
                (d) => turnDir(d, from)
              )
            )
          )
        )
    const endEdges = whole
      ? []
      : loop.map((e, i) =>
          lying[i]
            ? startEdges[i]
            : b.edge(
                v1[i],
                v1[(i + 1) % n],
                brepCurve(
                  edgeMapped(
                    e,
                    (p) => turn(p, to),
                    (d) => turnDir(d, to)
                  )
                )
              )
        )
    if (!whole) {
      caps[face].start.push(
        startEdges.map((edge) => ({ edge, reversed: false }))
      )
      caps[face].end.push(
        [...endEdges].reverse().map((edge) => ({ edge, reversed: true }))
      )
    }
    loop.forEach((e, i) => {
      if (lying[i]) return
      const j = (i + 1) % n
      let faceLoops: BrepLoop[]
      if (closedOne && whole) {
        faceLoops = []
      } else if (whole) {
        faceLoops = []
        if (rings[i] >= 0) faceLoops.push([{ edge: rings[i], reversed: false }])
        if (rings[j] >= 0) faceLoops.push([{ edge: rings[j], reversed: true }])
      } else {
        const coedges: BrepLoop[number][] = []
        if (rings[i] >= 0) coedges.push({ edge: rings[i], reversed: false })
        coedges.push({ edge: endEdges[i], reversed: false })
        if (rings[j] >= 0) coedges.push({ edge: rings[j], reversed: true })
        coedges.push({ edge: startEdges[i], reversed: true })
        faceLoops = [coedges]
      }
      const poles =
        whole && !closedOne
          ? [axial[i] ? v0[i] : -1, axial[j] ? v0[j] : -1]
          : [-1, -1]
      sides.push(() =>
        revolvedFace(b, e, origin, A, out, y, up, from, to, faceLoops, poles)
      )
    })
  }
  for (const side of sides) side()
  if (!whole) {
    caps.forEach(({ start: loops }) => {
      if (loops.length === 0) return
      b.face(
        {
          kind: "plane",
          origin: b.vertices[b.edges[loops[0][0].edge].start],
          normal: turnDir(up, from),
        },
        loops
      )
    })
    caps.forEach(({ end: loops }) => {
      if (loops.length === 0) return
      b.face(
        {
          kind: "plane",
          origin: b.vertices[b.edges[loops[0][0].edge].start],
          normal: turnDir(scale3(up, -1), to),
        },
        loops
      )
    })
  }
  return b.brep()
}

/**
 * The face one profile edge sweeps, on the surface the edge makes round the
 * axis, θ from `from` to `to` and the edge's own run along it: a cone's apex
 * an edge of no length where it meets the axis on a whole turn (`poles`).
 */
function revolvedFace(
  b: Builder,
  e: SpaceEdge,
  origin: Vec3,
  A: Vec3,
  out: Vec3,
  y: Vec3,
  up: Vec3,
  from: number,
  to: number,
  loops: BrepLoop[],
  poles: readonly [number, number] | number[]
): void {
  const at = (p: Vec3) => meridian(p, origin, A, out)
  const u: [number, number] = [from, to]
  const s = at(edgeStart(e))
  const f = at(edgeEnd(e))
  if (e.kind === "line") {
    const run = Math.abs(f.h - s.h)
    const rise = Math.abs(f.rho - s.rho)
    // Rounding is the coordinates' own: a segment along or square to the
    // axis within it is exactly so.
    const size = EXACT * Math.max(1, Math.abs(s.h), Math.abs(f.h), s.rho, f.rho)
    if (rise <= size) {
      b.face(
        {
          kind: "cylinder",
          origin,
          axis: A,
          xAxis: out,
          radius: s.rho,
          ratio: 1,
        },
        loops,
        { u, v: [s.h, f.h] }
      )
      return
    }
    if (run > size && Math.min(rise, run) < ALONG * Math.max(rise, run)) {
      // WHY no cone: a segment a hair off parallel or square to the axis makes
      // one whose apex lies far off or whose slope is steep, which no double
      // integrates well; the segment turned as a spline of degree 1 is the
      // same surface, well conditioned.
      const line: BSplineCurve = {
        degree: 1,
        knots: [0, 0, 1, 1],
        controlPoints: [edgeStart(e), edgeEnd(e)],
      }
      b.face(
        {
          kind: "revolution",
          profile: { kind: "spline", curve: line },
          origin,
          axis: A,
        },
        loops,
        { u, v: [0, 1] }
      )
      return
    }
    if (run <= size) {
      // A plane square to the axis: its outside ∂θ × ∂s at the profile.
      const turn = cross3(A, out)
      const along = sub3(edgeEnd(e), edgeStart(e))
      const normal = normalize3(cross3(turn, along))!
      b.face(
        {
          kind: "plane",
          origin: add3(origin, scale3(A, (s.h + f.h) / 2)),
          normal,
        },
        loops
      )
      return
    }
    // A cone, its apex where the line meets the axis, widening away from it.
    const tip = s.h - (s.rho * (f.h - s.h)) / (f.rho - s.rho)
    const wide = Math.abs(f.rho) > Math.abs(s.rho) ? f : s
    const sense = wide.h > tip ? 1 : -1
    const axis = scale3(A, sense)
    const slope = Math.abs((f.rho - s.rho) / (f.h - s.h))
    const loopsWithApex = [...loops]
    for (const pole of poles) {
      if (pole < 0) continue
      const edge = b.edge(pole, pole, { kind: "point" })
      loopsWithApex.push([{ edge, reversed: false }])
    }
    b.face(
      {
        kind: "cone",
        apex: add3(origin, scale3(A, tip)),
        axis,
        xAxis: out,
        slope,
        ratio: 1,
      },
      loopsWithApex,
      {
        u: [sense * from, sense * to],
        v: [(s.h - tip) * sense, (f.h - tip) * sense],
      }
    )
    return
  }
  if (e.kind === "conic" && e.circle) {
    const c = at(e.curve.center)
    const r = length3(e.curve.majorAxis)
    const center = add3(origin, scale3(A, c.h))
    // φ runs from `out` towards the axis' way; the arc's own angle turns
    // with it or against it.
    const plane = normalize3(cross3(e.curve.majorAxis, e.curve.minorAxis))!
    const sign = dot3(cross3(out, A), plane) > 0 ? 1 : -1
    const phi0 = Math.atan2(s.h - c.h, s.rho - c.rho)
    const v: [number, number] = [phi0, phi0 + sign * (e.to - e.from)]
    if (Math.abs(c.rho) <= EXACT * Math.max(1, r, Math.abs(c.h))) {
      b.face(
        { kind: "sphere", center, axis: A, xAxis: out, radius: r },
        loops,
        {
          u,
          v,
        }
      )
      return
    }
    b.face(
      {
        kind: "torus",
        center,
        axis: A,
        xAxis: out,
        majorRadius: c.rho,
        minorRadius: r,
      },
      loops,
      { u, v }
    )
    return
  }
  void y
  void up
  if (e.kind === "conic") {
    b.face({ kind: "revolution", profile: e.curve, origin, axis: A }, loops, {
      u,
      v: [e.from, e.to],
    })
    return
  }
  const domain = bsplineDomain(e.curve)
  b.face(
    {
      kind: "revolution",
      profile: { kind: "spline", curve: e.curve },
      origin,
      axis: A,
    },
    loops,
    { u, v: [domain.start, domain.end] }
  )
}

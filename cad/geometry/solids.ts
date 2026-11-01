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
import { Axes3, arbitraryAxis, worldToAxes } from "./ocs"
import {
  BSplineCurve,
  bsplineDomain,
  bsplinePoint,
  bsplineReversed,
  bsplineSegment,
  conicArcCurve,
} from "./nurbs"
import { MODEL_TOLERANCE, PlanarCurve } from "./planarCurves"
import { RegionFace, facesArea } from "./planarRegions"
import { faceRegionMeasures } from "./faceRegions"
import {
  spreadIsolines,
  surfacePoint,
  turnIsolines,
  turnedAbout,
} from "./faceDomains"

/**
 * A solid's boundary, as ACIS keeps one (docs/next-solids.md §3): its
 * vertices, its edges between them, and its faces, each a piece of a surface
 * bounded by loops of those edges. Every edge is shared by two faces, which
 * run it in opposite senses, so the boundary is closed. Nothing here is a
 * mesh: what is drawn is derived.
 */
export interface Brep {
  readonly vertices: readonly Vec3[]
  readonly edges: readonly BrepEdge[]
  readonly faces: readonly BrepFace[]
}

/** An edge from one vertex to another (indices), along its curve. */
export interface BrepEdge {
  readonly start: number
  readonly end: number
  readonly curve: BrepCurve
}

/**
 * The curve an edge lies on, which it runs from its start round to its end
 * counter-clockwise about the curve's `normal`; a whole circle or ellipse
 * starts and ends at one vertex (ACIS's, solid/c01). `point` is a cone's
 * apex: an edge of no length at one vertex, a face's loop round it (k01).
 *
 * - `circle`: `radius` round `center` in the plane normal to `normal`.
 * - `ellipse`: `majorAxis` from `center` to the end of its major axis, the
 *   minor `ratio` times as long (0 < ratio ≤ 1).
 * - `spline`: the NURBS over its whole domain, from its start to its end: a
 *   profile's spline swept, or its copy (x09: ACIS's edge of an extruded
 *   spline is the spline itself).
 */
export type BrepCurve =
  | { readonly kind: "line" }
  | {
      readonly kind: "circle"
      readonly center: Vec3
      readonly normal: Vec3
      readonly radius: number
    }
  | {
      readonly kind: "ellipse"
      readonly center: Vec3
      readonly normal: Vec3
      readonly majorAxis: Vec3
      readonly ratio: number
    }
  | { readonly kind: "point" }
  | { readonly kind: "spline"; readonly curve: BSplineCurve }

/** A face's use of an edge: along it, or against it when `reversed`. */
export interface Coedge {
  readonly edge: number
  readonly reversed: boolean
}

/**
 * A run of coedges end to end, closed. Seen from outside the solid, a face's
 * first loop turns counter-clockwise about its outward normal and its holes
 * clockwise, so the face is on every coedge's left.
 */
export type BrepLoop = readonly Coedge[]

/**
 * The surface a face lies on, its outside the plane's `normal` side or away
 * from the axis. `axis` and `xAxis` are unit and square; `xAxis` is where
 * ACIS starts the surface round (its seam, solid/c01), the Y axis
 * `axis × xAxis`, and an elliptical one is `ratio` times as wide along Y as
 * along X.
 *
 * - `plane`: through `origin`.
 * - `cylinder`: `radius` along X from the axis through `origin`.
 * - `cone`: widening from `apex` along `axis`, `slope` along X per unit along
 *   it (the tangent of its half angle there).
 * - `sphere`: `radius` round `center`, `axis` its north (solid/h01).
 * - `torus`: the circle `minorRadius` round, its centre `majorRadius` out
 *   from `center` in the plane square to `axis`, swept round it; the part
 *   that sweep leaves outside the axis (ρ ≥ 0). A negative `majorRadius`
 *   puts the circle's centre across the axis: a lemon; one under
 *   `minorRadius` an apple (r03, r05, r06).
 * - `extrusion`: the profile swept along the unit `direction` (an oblique
 *   EXTRUDE's, or a spline's: x02, x09's NurbSurface).
 * - `revolution`: the profile turned round the unit `axis` through
 *   `origin`, right-handed (an ellipse's or a spline's REVOLVE).
 */
export type BrepSurface =
  | {
      readonly kind: "plane"
      readonly origin: Vec3
      readonly normal: Vec3
    }
  | {
      readonly kind: "cylinder"
      readonly origin: Vec3
      readonly axis: Vec3
      readonly xAxis: Vec3
      readonly radius: number
      readonly ratio: number
    }
  | {
      readonly kind: "cone"
      readonly apex: Vec3
      readonly axis: Vec3
      readonly xAxis: Vec3
      readonly slope: number
      readonly ratio: number
    }
  | {
      readonly kind: "sphere"
      readonly center: Vec3
      readonly axis: Vec3
      readonly xAxis: Vec3
      readonly radius: number
    }
  | {
      readonly kind: "torus"
      readonly center: Vec3
      readonly axis: Vec3
      readonly xAxis: Vec3
      readonly majorRadius: number
      readonly minorRadius: number
    }
  | {
      readonly kind: "extrusion"
      readonly profile: SweptCurve
      readonly direction: Vec3
    }
  | {
      readonly kind: "revolution"
      readonly profile: SweptCurve
      readonly origin: Vec3
      readonly axis: Vec3
    }

/**
 * A profile a swept surface carries, by its own parameter: an ellipse's
 * `center + majorAxis cos t + minorAxis sin t` (a circle's when its axes are
 * as long and square), a spline's NURBS on its knots.
 */
export type SweptCurve =
  | {
      readonly kind: "ellipse"
      readonly center: Vec3
      readonly majorAxis: Vec3
      readonly minorAxis: Vec3
    }
  | { readonly kind: "spline"; readonly curve: BSplineCurve }

/**
 * Where on its surface a face made by a sweep lies: `u` from `u[0]` to `u[1]`
 * and `v` likewise, in the surface's own parameters (`surfacePoint`) — round
 * its axis and along it for a cylinder or a cone, round and over the tube for
 * a sphere or a torus, round the axis and along the profile for a revolution,
 * along the profile and the direction for an extrusion. The face's outside is
 * where `∂u × ∂v` points while both run their way: a range run backwards turns
 * it inwards, as a hole's wall faces its axis (r01, ACIS's `IsOuterNormal`).
 * A face without one is a primitive's: a whole turn round, between its loops.
 */
export interface FaceDomain {
  readonly u: readonly [number, number]
  readonly v: readonly [number, number]
}

export interface BrepFace {
  readonly surface: BrepSurface
  readonly loops: readonly BrepLoop[]
  readonly domain?: FaceDomain
}

/**
 * `v` with no -0, which a file cannot hold (it reads back 0): every point
 * and direction a solid stores passes here, so a round trip is exact.
 */
export function unsigned0(v: Vec3): Vec3 {
  return { x: v.x + 0, y: v.y + 0, z: v.z + 0 }
}

/** A domain with no -0, as {@link unsigned0}. */
export function unsignedDomain(d: FaceDomain): FaceDomain {
  return { u: [d.u[0] + 0, d.u[1] + 0], v: [d.v[0] + 0, d.v[1] + 0] }
}

/** A NURBS with no -0 in its points or its knots. */
export function unsignedNurbs(curve: BSplineCurve): BSplineCurve {
  return {
    ...curve,
    knots: curve.knots.map((k) => k + 0),
    controlPoints: curve.controlPoints.map(unsigned0),
  }
}

/**
 * The solid with flat faces through `vertices`: its edges `ends`, each run
 * from its first vertex to its second, and its faces the vertex cycles
 * `faces`, each counter-clockwise seen from outside — which the face's
 * coedges follow, along their edge or against it.
 */
export function polyhedronBrep(
  points: readonly Vec3[],
  ends: readonly (readonly [number, number])[],
  faces: readonly (readonly number[])[]
): Brep {
  const vertices = points.map(unsigned0)
  return {
    vertices,
    edges: ends.map(([start, end]) => ({
      start,
      end,
      curve: { kind: "line" },
    })),
    faces: faces.map((cycle) => {
      // Newell's normal: exact for a face along the axes, unbiased for any;
      // from its first corner, as far from the origin the products of the
      // coordinates would swamp the face's own size.
      const o = vertices[cycle[0]]
      let n: Vec3 = { x: 0, y: 0, z: 0 }
      cycle.forEach((a, i) => {
        n = add3(
          n,
          cross3(
            sub3(vertices[a], o),
            sub3(vertices[cycle[(i + 1) % cycle.length]], o)
          )
        )
      })
      return {
        surface: {
          kind: "plane",
          origin: vertices[cycle[0]],
          normal: unsigned0(normalize3(n) ?? n),
        },
        loops: [
          cycle.map((a, i) => {
            const b = cycle[(i + 1) % cycle.length]
            const along = ends.findIndex(([s, e]) => s === a && e === b)
            return along >= 0
              ? { edge: along, reversed: false }
              : {
                  edge: ends.findIndex(([s, e]) => s === b && e === a),
                  reversed: true,
                }
          }),
        ],
      }
    }),
  }
}

/**
 * The box with a corner at `corner` and sides `u`, `v` and `w`, which must
 * turn right-handed (`(u × v) · w > 0`). Its edges run as ACIS runs a box's
 * (solid/p01): the bottom's round the bottom face, the top's round the top,
 * the risers down; the bottom's come first, which in plan, where a top edge
 * hides one, is the edge AutoCAD finds (solid/s01, e07). The faces in ACIS's
 * order: top, bottom, then round from the side facing away from `v`.
 */
export function boxBrep(corner: Vec3, u: Vec3, v: Vec3, w: Vec3): Brep {
  const base = [
    corner,
    add3(corner, u),
    add3(add3(corner, u), v),
    add3(corner, v),
  ]
  return polyhedronBrep(
    [...base, ...base.map((p) => add3(p, w))],
    [
      [0, 3],
      [3, 2],
      [2, 1],
      [1, 0],
      [4, 5],
      [5, 6],
      [6, 7],
      [7, 4],
      [4, 0],
      [5, 1],
      [6, 2],
      [7, 3],
    ],
    [
      [4, 5, 6, 7],
      [0, 3, 2, 1],
      [0, 1, 5, 4],
      [3, 0, 4, 7],
      [2, 3, 7, 6],
      [1, 2, 6, 5],
    ]
  )
}

/**
 * The wedge on the base from `corner` along `u` and `v`, rising `w` over the
 * base's edge at `corner` along `v` and sloping down to the far edge along
 * `u`, right-handed as a box. ACIS builds it as that end triangle swept along
 * `v` (solid/w01): its vertices, edges, their sense and the faces — slope,
 * back, bottom, the far end, the near end — in ACIS's order, which decides
 * the edge found in plan where the slope hides a side of the base.
 */
export function wedgeBrep(corner: Vec3, u: Vec3, v: Vec3, w: Vec3): Brep {
  const a = corner
  const b = add3(a, u)
  const c = add3(b, v)
  const d = add3(a, v)
  const e = add3(a, w)
  const f = add3(d, w)
  return polyhedronBrep(
    [c, f, d, a, b, e],
    [
      [0, 1],
      [4, 0],
      [1, 2],
      [5, 1],
      [2, 0],
      [3, 2],
      [3, 4],
      [4, 5],
      [5, 3],
    ],
    [
      [0, 1, 5, 4],
      [1, 2, 3, 5],
      [2, 0, 4, 3],
      [1, 0, 2],
      [3, 4, 5],
    ]
  )
}

/**
 * The pyramid on the regular polygon `base`, its corners counter-clockwise
 * about `up`, rising to `apex`, or, given `top` (the top's corners over the
 * base's), its frustum. Its edges run as ACIS runs them (solid/y01, y02,
 * y09): the base's round the base face, the top's round the top, the slanted
 * ones from the apex or the top down.
 */
export function pyramidBrep(
  base: readonly Vec3[],
  apex: Vec3,
  top: readonly Vec3[] | null
): Brep {
  const n = base.length
  const next = (k: number) => (k + 1) % n
  const ends: [number, number][] = base.map((_, k) => [next(k), k])
  if (!top) {
    return polyhedronBrep(
      [...base, apex],
      [...ends, ...base.map((_, k): [number, number] => [n, k])],
      [base.map((_, k) => (n - k) % n), ...base.map((_, k) => [k, next(k), n])]
    )
  }
  return polyhedronBrep(
    [...base, ...top],
    [
      ...ends,
      ...top.map((_, k): [number, number] => [n + k, n + next(k)]),
      ...base.map((_, k): [number, number] => [n + k, k]),
    ],
    [
      base.map((_, k) => (n - k) % n),
      top.map((_, k) => n + k),
      ...base.map((_, k) => [k, next(k), n + next(k), n + k]),
    ]
  )
}

/**
 * A cylinder's, a cone's or a frustum's boundary: its base the circle or
 * ellipse round `center`, `rx` along `xAxis` and `ry` across, rising
 * `height` along `axis` to the same `topScale` times as wide, or to a point
 * when that is 0. As ACIS makes one (solid/c01, k01, c04): its seam, both
 * curves' vertex, along `xAxis`; the base's edge about −`axis`, the top's
 * about `axis`; the faces round, base, top; a point's edge at the apex.
 */
export function roundBrep(
  center: Vec3,
  axis: Vec3,
  xAxis: Vec3,
  rx: number,
  ry: number,
  height: number,
  topScale: number
): Brep {
  const top = add3(center, scale3(axis, height))
  const y = cross3(axis, xAxis)
  const ring = (at: Vec3, normal: Vec3, k: number): BrepCurve =>
    rx === ry
      ? { kind: "circle", center: at, normal, radius: rx * k }
      : {
          kind: "ellipse",
          center: at,
          normal,
          majorAxis: rx > ry ? scale3(xAxis, rx * k) : scale3(y, ry * k),
          ratio: Math.min(rx, ry) / Math.max(rx, ry),
        }
  const down = scale3(axis, -1)
  const pointed = topScale === 0
  let side: BrepSurface
  if (topScale === 1) {
    side = {
      kind: "cylinder",
      origin: center,
      axis,
      xAxis,
      radius: rx,
      ratio: ry / rx,
    }
  } else {
    // The apex is where the side, carried on, narrows to nothing: over the
    // base when the top is narrower, under it when wider (k02).
    const narrows = topScale < 1
    const reach = height / Math.abs(1 - topScale)
    side = {
      kind: "cone",
      apex: add3(center, scale3(axis, narrows ? reach : -reach)),
      axis: narrows ? down : axis,
      xAxis,
      slope: rx / reach,
      ratio: ry / rx,
    }
  }
  return mappedUnsigned({
    vertices: [
      add3(center, scale3(xAxis, rx)),
      pointed ? top : add3(top, scale3(xAxis, rx * topScale)),
    ],
    edges: [
      { start: 0, end: 0, curve: ring(center, down, 1) },
      {
        start: 1,
        end: 1,
        curve: pointed ? { kind: "point" } : ring(top, axis, topScale),
      },
    ],
    faces: [
      {
        surface: side,
        loops: [
          [{ edge: 0, reversed: true }],
          [{ edge: 1, reversed: !pointed }],
        ],
      },
      {
        surface: { kind: "plane", origin: center, normal: down },
        loops: [[{ edge: 0, reversed: false }]],
      },
      ...(pointed
        ? []
        : [
            {
              surface: { kind: "plane" as const, origin: top, normal: axis },
              loops: [[{ edge: 1, reversed: false }]],
            },
          ]),
    ],
  })
}

/**
 * A sphere's boundary: one face, closed on itself, with no loop, no edge and
 * no vertex (solid/h01's MPDUMP).
 */
export function sphereBrep(
  center: Vec3,
  axis: Vec3,
  xAxis: Vec3,
  radius: number
): Brep {
  return mappedUnsigned({
    vertices: [],
    edges: [],
    faces: [
      { surface: { kind: "sphere", center, axis, xAxis, radius }, loops: [] },
    ],
  })
}

/**
 * A torus' boundary: a doughnut's one face with no loop; an apple's or a
 * lemon's with a point's edge at each pole, where the tube meets the axis,
 * the north first; a vortex's both at its centre (r05's MPDUMP).
 */
export function torusBrep(
  center: Vec3,
  axis: Vec3,
  xAxis: Vec3,
  majorRadius: number,
  minorRadius: number
): Brep {
  const surface: BrepSurface = {
    kind: "torus",
    center,
    axis,
    xAxis,
    majorRadius,
    minorRadius,
  }
  if (majorRadius > minorRadius) {
    return mappedUnsigned({
      vertices: [],
      edges: [],
      faces: [{ surface, loops: [] }],
    })
  }
  const reach = Math.sqrt(
    Math.max(0, minorRadius * minorRadius - majorRadius * majorRadius)
  )
  const poles =
    reach === 0
      ? [center]
      : [add3(center, scale3(axis, reach)), add3(center, scale3(axis, -reach))]
  const last = poles.length - 1
  return mappedUnsigned({
    vertices: poles,
    edges: [
      { start: 0, end: 0, curve: { kind: "point" } },
      { start: last, end: last, curve: { kind: "point" } },
    ],
    faces: [
      {
        surface,
        loops: [[{ edge: 0, reversed: false }], [{ edge: 1, reversed: false }]],
      },
    ],
  })
}

/** `brep` with no -0 in any point or direction it holds. */
function mappedUnsigned(brep: Brep): Brep {
  return brepMapped(
    brep,
    (p) => p,
    (d) => d,
    false
  )
}

/** The vertex a coedge starts from, in its face's sense. */
export function coedgeStart(brep: Brep, coedge: Coedge): number {
  const { start, end } = brep.edges[coedge.edge]
  return coedge.reversed ? end : start
}

/**
 * The solid carried through a similarity: `point` maps a point, `direction`
 * a direction (the linear part, the scale left out). A reflection would turn
 * every face inside out: its loops are run backwards so each face keeps its
 * outside on the normal's side, and a circle or ellipse, still run from the
 * same vertex to the same one, turns about its mirrored normal reversed.
 */
export function brepMapped(
  brep: Brep,
  point: (p: Vec3) => Vec3,
  direction: (d: Vec3) => Vec3,
  reflects: boolean,
  scale = 1
): Brep {
  const at = (p: Vec3) => unsigned0(point(p))
  // A unit direction is kept to the bit when the map leaves it, as the
  // identity does when a solid is made.
  const unit = (d: Vec3) => {
    const turned = direction(d)
    const n = isUnit(turned) ? turned : (normalize3(turned) ?? d)
    return unsigned0(n)
  }
  const turn = (normal: Vec3) => {
    const n = unit(normal)
    return reflects ? unsigned0(scale3(n, -1)) : n
  }
  const curve = (c: BrepCurve): BrepCurve => {
    switch (c.kind) {
      case "line":
      case "point":
        return c
      case "circle":
        return {
          kind: "circle",
          center: at(c.center),
          normal: turn(c.normal),
          radius: c.radius * scale,
        }
      case "ellipse":
        return {
          kind: "ellipse",
          center: at(c.center),
          normal: turn(c.normal),
          majorAxis: unsigned0(scale3(direction(c.majorAxis), scale)),
          ratio: c.ratio,
        }
      case "spline":
        return { kind: "spline", curve: splineMapped(c.curve, at) }
    }
  }
  const vector = (v: Vec3) => unsigned0(scale3(direction(v), scale))
  const profile = (c: SweptCurve): SweptCurve =>
    c.kind === "ellipse"
      ? {
          kind: "ellipse",
          center: at(c.center),
          majorAxis: vector(c.majorAxis),
          minorAxis: vector(c.minorAxis),
        }
      : { kind: "spline", curve: splineMapped(c.curve, at) }
  const surface = (s: BrepSurface): BrepSurface => {
    switch (s.kind) {
      case "plane":
        return { kind: "plane", origin: at(s.origin), normal: unit(s.normal) }
      case "cylinder":
        return {
          ...s,
          origin: at(s.origin),
          axis: unit(s.axis),
          xAxis: unit(s.xAxis),
          radius: s.radius * scale,
        }
      case "cone":
        return {
          ...s,
          apex: at(s.apex),
          axis: unit(s.axis),
          xAxis: unit(s.xAxis),
        }
      case "sphere":
        return {
          ...s,
          center: at(s.center),
          axis: unit(s.axis),
          xAxis: unit(s.xAxis),
          radius: s.radius * scale,
        }
      case "torus":
        return {
          ...s,
          center: at(s.center),
          axis: unit(s.axis),
          xAxis: unit(s.xAxis),
          majorRadius: s.majorRadius * scale,
          minorRadius: s.minorRadius * scale,
        }
      case "extrusion": {
        // Mirrored, the profile runs backwards so `∂u × ∂v` still points out.
        const mapped = profile(s.profile)
        return {
          kind: "extrusion",
          profile: reflects ? sweptReversed(mapped) : mapped,
          direction: unit(s.direction),
        }
      }
      case "revolution":
        return {
          kind: "revolution",
          profile: profile(s.profile),
          origin: at(s.origin),
          axis: unit(s.axis),
        }
    }
  }
  return {
    vertices: brep.vertices.map(at),
    edges: brep.edges.map((e) => ({ ...e, curve: curve(e.curve) })),
    faces: brep.faces.map((face) => ({
      surface: surface(face.surface),
      loops: reflects
        ? face.loops.map((loop) =>
            [...loop].reverse().map((c) => ({ ...c, reversed: !c.reversed }))
          )
        : face.loops,
      ...(face.domain
        ? {
            domain: unsignedDomain(
              domainMapped(face.surface, face.domain, reflects, scale)
            ),
          }
        : {}),
    })),
  }
}

function splineMapped(
  curve: BSplineCurve,
  point: (p: Vec3) => Vec3
): BSplineCurve {
  return unsignedNurbs({
    ...curve,
    controlPoints: curve.controlPoints.map(point),
  })
}

/** The profile run the other way: an ellipse's angle and a spline's knots mirrored. */
function sweptReversed(c: SweptCurve): SweptCurve {
  return c.kind === "ellipse"
    ? { ...c, minorAxis: unsigned0(scale3(c.minorAxis, -1)) }
    : { kind: "spline", curve: unsignedNurbs(bsplineReversed(c.curve)) }
}

/**
 * A face's domain through a similarity: lengths along an axis or a
 * direction scale; a reflection turns every angle round the other way (the
 * surface's Y is its axis × its X, mapped: `S'(u, v) = M S(−u, v)`), and an
 * extrusion's profile, run backwards, takes its parameter from the other end.
 */
function domainMapped(
  s: BrepSurface,
  d: FaceDomain,
  reflects: boolean,
  scale: number
): FaceDomain {
  const lengthwise = s.kind === "cylinder" || s.kind === "cone"
  const v: [number, number] =
    lengthwise || s.kind === "extrusion"
      ? [d.v[0] * scale, d.v[1] * scale]
      : [d.v[0], d.v[1]]
  if (!reflects) return { u: [d.u[0], d.u[1]], v }
  if (s.kind === "extrusion") {
    const c =
      s.profile.kind === "ellipse"
        ? 0
        : s.profile.curve.knots[0] +
          s.profile.curve.knots[s.profile.curve.knots.length - 1]
    return { u: [c - d.u[1], c - d.u[0]], v }
  }
  return { u: [-d.u[1], -d.u[0]], v }
}

/** A planar face as a region of its plane: the plane's frame and the face's loops in it. */
export interface PlanarFace {
  /** The object coordinate system of the outward normal, DXF's arbitrary axis. */
  readonly axes: Axes3
  /** How far the plane lies from the origin along that normal. */
  readonly elevation: number
  readonly face: RegionFace
}

const WORLD: Axes3 = {
  x: { x: 1, y: 0, z: 0 },
  y: { x: 0, y: 1, z: 0 },
  z: { x: 0, y: 0, z: 1 },
}

/**
 * The face as the kernel's planar region in its plane: read in the OCS of its
 * outward normal, its outline is counter-clockwise and its holes clockwise,
 * as a region's are; a circle or an ellipse is an arc or an elliptical arc of
 * it, a whole one round from its vertex. What EXPLODE leaves of it
 * (solid/p09), and how its area is measured — then `about` a vertex of the
 * solid: a shoelace far from the origin loses a small face's area to
 * rounding.
 */
export function planarFace(
  brep: Brep,
  face: BrepFace,
  about: Vec3 = ORIGIN
): PlanarFace {
  const normal = face.surface.kind === "plane" ? face.surface.normal : WORLD.z
  const axes = arbitraryAxis(normal) ?? WORLD
  const flat = (p: Vec3) => {
    const q = worldToAxes(axes, sub3(p, about))
    return { x: q.x, y: q.y }
  }
  const loops = face.loops.map((loop) =>
    loop.map((coedge): PlanarCurve => {
      const { start, end, curve } = brep.edges[coedge.edge]
      const [from, to] = coedge.reversed ? [end, start] : [start, end]
      const a = flat(brep.vertices[from])
      const b = flat(brep.vertices[to])
      if (curve.kind === "line" || curve.kind === "point") {
        return { kind: "line", start: a, end: b }
      }
      if (curve.kind === "spline") {
        const { start: lo, end: hi } = bsplineDomain(curve.curve)
        const flatCurve = splineMapped(curve.curve, (p) => ({
          ...flat(p),
          z: 0,
        }))
        return coedge.reversed
          ? { kind: "spline", curve: flatCurve, from: hi, to: lo }
          : { kind: "spline", curve: flatCurve, from: lo, to: hi }
      }
      // Counter-clockwise in the face's plane when its normal and the
      // curve's agree, the coedge's own way.
      const turns =
        (dot3(curve.normal, axes.z) > 0 ? 1 : -1) * (coedge.reversed ? -1 : 1)
      const c = flat(curve.center)
      const angle = (p: { x: number; y: number }) =>
        Math.atan2(p.y - c.y, p.x - c.x)
      const sweep = (from: number, to: number) => {
        if (start === end) return turns * 2 * Math.PI
        const ccw =
          (((to - from) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
        return turns > 0 ? ccw : ccw - 2 * Math.PI
      }
      if (curve.kind === "circle") {
        return {
          kind: "arc",
          center: c,
          radius: curve.radius,
          startAngle: angle(a),
          sweep: sweep(angle(a), angle(b)),
        }
      }
      const tip = worldToAxes(axes, curve.majorAxis)
      const major = { x: tip.x, y: tip.y }
      const size = Math.hypot(major.x, major.y)
      // The parameter of a point in the ellipse's own frame of the plane.
      const param = (p: { x: number; y: number }) => {
        const dx = p.x - c.x
        const dy = p.y - c.y
        const u = (dx * major.x + dy * major.y) / size
        const v = (-dx * major.y + dy * major.x) / size
        return Math.atan2(v / curve.ratio, u)
      }
      return {
        kind: "ellipse",
        center: c,
        majorAxis: major,
        ratio: curve.ratio,
        startParam: param(a),
        sweep: sweep(param(a), param(b)),
      }
    })
  )
  return {
    axes,
    elevation:
      face.surface.kind === "plane"
        ? dot3(sub3(face.surface.origin, about), axes.z)
        : 0,
    face: { loops },
  }
}

const ORIGIN: Vec3 = { x: 0, y: 0, z: 0 }

/**
 * The perimeter of the ellipse of semi-axes `a` and `b`, exact to the last
 * digits by the arithmetic-geometric mean (Gauss–Kummer): no closed form
 * exists, and a series or a sum of chords loses digits AREA shows.
 */
export function ellipsePerimeter(a: number, b: number): number {
  let x = Math.max(a, b)
  let y = Math.min(a, b)
  let sum = (x * x - y * y) / 2
  let weight = 0.5
  // The mean converges quadratically: a handful of steps reach the float's
  // last digit; the cap only bounds a degenerate input.
  for (let i = 0; i < AGM_STEPS && x - y > Number.EPSILON * x; i++) {
    const c = (x - y) / 2
    weight *= 2
    sum += weight * c * c
    ;[x, y] = [(x + y) / 2, Math.sqrt(x * y)]
  }
  const top = Math.max(a, b)
  return (2 * Math.PI * (top * top - sum)) / x
}

const AGM_STEPS = 64

/**
 * Where along `axis` from `origin` each of a round face's loops lies: a
 * circle's or ellipse's centre, an apex's point.
 */
export function loopHeights(
  brep: Brep,
  face: BrepFace,
  origin: Vec3,
  axis: Vec3
): number[] {
  return face.loops.map((loop) => {
    const edge = brep.edges[loop[0].edge]
    const at =
      edge.curve.kind === "circle" || edge.curve.kind === "ellipse"
        ? edge.curve.center
        : brep.vertices[edge.start]
    return dot3(sub3(at, origin), axis)
  })
}

/**
 * A face's area and its flux `∫ (x − about) · n dA` (three times the volume
 * it bounds with `about`): a plane's by its region, a cylinder's or cone's
 * between its loops' heights in closed form.
 */
function faceMeasures(
  brep: Brep,
  face: BrepFace,
  about: Vec3
): { area: number; flux: number } {
  const s = face.surface
  if (s.kind !== "plane" && face.domain) {
    return faceRegionMeasures(brep, face, about)
  }
  switch (s.kind) {
    case "extrusion":
    case "revolution":
      // Never without its domain (brepIsClosed).
      return { area: 0, flux: 0 }
    case "plane": {
      const flat = planarFace(brep, face, about)
      const area = facesArea([flat.face])
      return { area, flux: flat.elevation * area }
    }
    case "cylinder": {
      const [t0, t1] = loopHeights(brep, face, s.origin, s.axis)
      const h = Math.abs(t1 - t0)
      const rx = s.radius
      const ry = s.radius * s.ratio
      return {
        area: ellipsePerimeter(rx, ry) * h,
        flux: 2 * Math.PI * rx * ry * h,
      }
    }
    case "cone": {
      const heights = loopHeights(brep, face, s.apex, s.axis)
      const t0 = Math.min(...heights)
      const t1 = Math.max(...heights)
      const rx = s.slope
      const ry = s.slope * s.ratio
      const span = t1 * t1 - t0 * t0
      const across = rx * ry
      return {
        area:
          (span / 2) *
          ellipsePerimeter(Math.hypot(ry, across), Math.hypot(rx, across)),
        flux: -Math.PI * across * span * dot3(sub3(s.apex, about), s.axis),
      }
    }
    case "sphere":
      return {
        area: 4 * Math.PI * s.radius ** 2,
        flux: 4 * Math.PI * s.radius ** 3,
      }
    case "torus": {
      // Swept round the axis, the tube's arc on which ρ = R + r cos φ ≥ 0:
      // ∫ 2π ρ r dφ, and the flux of (R cos φ + r) over it (r05, r06).
      const R = s.majorRadius
      const r = s.minorRadius
      const half = tubeHalfAngle(R, r)
      const sin = Math.sin(half)
      return {
        area: 2 * Math.PI * r * (2 * R * half + 2 * r * sin),
        flux:
          2 *
          Math.PI *
          r *
          ((R * R + r * r) * 2 * sin +
            R * r * (half + sin * Math.cos(half)) +
            2 * r * R * half),
      }
    }
  }
}

/** How far round its tube a torus' face runs either way from its outside: π for a doughnut. */
export function tubeHalfAngle(major: number, minor: number): number {
  return Math.acos(Math.max(-1, Math.min(1, -major / minor)))
}

/**
 * How far a sphere or a torus reaches from its centre along each world axis,
 * a face with no edge to bound it (solid/h01, r01). A torus' tube circle,
 * kept where it lies outside the axis, reaches `R·s + r·cos(α − φ)` along a
 * direction at `α` to its plane (`s` = cos α), the most at `φ = α` when the
 * tube still runs there, else at its arc's end.
 */
export function closedSurfaceReach(surface: BrepSurface): Vec3 | null {
  if (surface.kind === "sphere") {
    const { radius } = surface
    return { x: radius, y: radius, z: radius }
  }
  if (surface.kind !== "torus") return null
  const { axis, majorRadius, minorRadius } = surface
  const half = tubeHalfAngle(majorRadius, minorRadius)
  // `s` from the axis' other two components: √(1 − t²) loses an axis
  // tilted 1e-11 off the world's.
  const along = (t: number, s: number) => {
    const alpha = Math.abs(Math.atan2(t, s))
    return (
      majorRadius * s +
      minorRadius * (alpha <= half ? 1 : Math.cos(alpha - half))
    )
  }
  return {
    x: along(axis.x, Math.hypot(axis.y, axis.z)),
    y: along(axis.y, Math.hypot(axis.x, axis.z)),
    z: along(axis.z, Math.hypot(axis.x, axis.y)),
  }
}

/** A box along the world's axes. */
export interface Box3 {
  readonly min: Vec3
  readonly max: Vec3
}

/** The smallest box holding every point. */
export function boxOfPoints(points: readonly Vec3[]): Box3 | null {
  if (points.length === 0) return null
  const min = { x: Infinity, y: Infinity, z: Infinity }
  const max = { x: -Infinity, y: -Infinity, z: -Infinity }
  for (const p of points) {
    min.x = Math.min(min.x, p.x)
    min.y = Math.min(min.y, p.y)
    min.z = Math.min(min.z, p.z)
    max.x = Math.max(max.x, p.x)
    max.y = Math.max(max.y, p.y)
    max.z = Math.max(max.z, p.z)
  }
  return { min, max }
}

/**
 * The points of `center + a cos t + b sin t`, `t` from `from` through
 * `sweep`, that bound it along the world's axes: its ends and where each
 * coordinate turns, `tan t = b_k / a_k`.
 */
export function ellipticalArcExtremes(
  center: Vec3,
  a: Vec3,
  b: Vec3,
  from: number,
  sweep: number
): Vec3[] {
  const at = (t: number) =>
    add3(center, add3(scale3(a, Math.cos(t)), scale3(b, Math.sin(t))))
  const points = [at(from), at(from + sweep)]
  for (const k of ["x", "y", "z"] as const) {
    const turn = Math.atan2(b[k], a[k])
    for (const t of [turn, turn + Math.PI]) {
      const into = sweep >= 0 ? t - from : from - t
      const reach = Math.abs(sweep)
      const past = ((into % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
      if (past <= reach) points.push(at(t))
    }
  }
  return points
}

/**
 * The B-rep's exact box: its vertices (a cone's apex), its edges' circles
 * and ellipses where they turn, and a sphere's or a torus' reach (MASSPROP's
 * Bounding box, solid/m01–m04; a turned pyramid's is its corners', 6.6800).
 */
export function brepBox(brep: Brep): Box3 | null {
  const points: Vec3[] = [...brep.vertices]
  for (const edge of brep.edges) {
    const c = edge.curve
    if (c.kind === "spline") {
      const { start, end } = bsplineDomain(c.curve)
      points.push(...curveExtremes((t) => bsplinePoint(c.curve, t), start, end))
      continue
    }
    if (c.kind !== "circle" && c.kind !== "ellipse") continue
    const start = brep.vertices[edge.start]
    const end = brep.vertices[edge.end]
    const major =
      c.kind === "circle"
        ? scale3(normalize3(sub3(start, c.center)) ?? WORLD.x, c.radius)
        : c.majorAxis
    const minor = scale3(
      cross3(c.normal, major),
      c.kind === "circle" ? 1 : c.ratio
    )
    const param = (p: Vec3) => {
      const d = sub3(p, c.center)
      return Math.atan2(
        dot3(d, minor) / dot3(minor, minor),
        dot3(d, major) / dot3(major, major)
      )
    }
    const from = param(start)
    const sweep =
      edge.start === edge.end
        ? 2 * Math.PI
        : (((param(end) - from) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
    points.push(...ellipticalArcExtremes(c.center, major, minor, from, sweep))
  }
  for (const { surface, domain } of brep.faces) {
    if (domain && surface.kind !== "plane") {
      points.push(...domainExtremes(surface, domain))
      continue
    }
    const reach = closedSurfaceReach(surface)
    if (!reach || !("center" in surface)) continue
    points.push(sub3(surface.center, reach), add3(surface.center, reach))
  }
  return boxOfPoints(points)
}

/** Samples a piece of curve is searched by for where a coordinate turns. */
const EXTREME_SAMPLES = 64

/**
 * The points of `f` on `[a, b]` where a world coordinate is greatest or
 * least: its ends and each turn, bracketed by {@link EXTREME_SAMPLES} samples
 * and closed in by golden sections. A smooth curve turns no more often than
 * that; what the sections leave is far under the model's tolerance.
 */
function curveExtremes(f: (t: number) => Vec3, a: number, b: number): Vec3[] {
  const ts = Array.from(
    { length: EXTREME_SAMPLES + 1 },
    (_, k) => a + ((b - a) * k) / EXTREME_SAMPLES
  )
  const ps = ts.map(f)
  const out = [ps[0], ps[ps.length - 1]]
  for (const k of ["x", "y", "z"] as const) {
    for (const sign of [1, -1]) {
      // The ends too: a turn just inside one is bracketed by it.
      for (let i = 0; i < ts.length; i++) {
        const here = sign * ps[i][k]
        const before = Math.max(0, i - 1)
        const after = Math.min(ts.length - 1, i + 1)
        if (here < sign * ps[before][k] || here < sign * ps[after][k]) continue
        let lo = ts[before]
        let hi = ts[after]
        for (let step = 0; step < 60; step++) {
          const m1 = hi - (hi - lo) / GOLDEN
          const m2 = lo + (hi - lo) / GOLDEN
          if (sign * f(m1)[k] > sign * f(m2)[k]) hi = m2
          else lo = m1
        }
        out.push(f((lo + hi) / 2))
      }
    }
  }
  return out
}

const GOLDEN = (1 + Math.sqrt(5)) / 2

/**
 * Where a swept face round an axis reaches furthest along each world axis
 * inside it: on the meridians where that axis' heading turns, each at its
 * own furthest. Its edges hold the rest.
 */
function domainExtremes(s: Curved, d: FaceDomain): Vec3[] {
  if (s.kind !== "sphere" && s.kind !== "torus" && s.kind !== "revolution") {
    return []
  }
  const axis = s.axis
  let x: Vec3
  if (s.kind === "revolution") {
    // The profile's own meridian: its point furthest from the axis.
    const q = curveExtremes(
      (t) => surfacePoint(s, 0, t),
      d.v[0],
      d.v[1]
    ).reduce((far, p) => {
      const w = sub3(p, s.origin)
      const r = sub3(w, scale3(axis, dot3(w, axis)))
      return length3(r) > length3(far) ? r : far
    }, ORIGIN)
    x = normalize3(q) ?? arbitraryAxis(axis)!.x
  } else {
    x = s.xAxis
  }
  const y = cross3(axis, x)
  const thetas = [d.u[0], d.u[1]]
  for (const k of ["x", "y", "z"] as const) {
    const turn = Math.atan2(y[k], x[k])
    for (const base of [turn, turn + Math.PI]) {
      const lo = Math.min(d.u[0], d.u[1])
      const span = Math.abs(d.u[1] - d.u[0])
      const into = (((base - lo) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
      if (into <= span) thetas.push(lo + into)
    }
  }
  return thetas.flatMap((u) =>
    curveExtremes((v) => surfacePoint(s, u, v), d.v[0], d.v[1])
  )
}

/**
 * The point a B-rep is placed and measured by: its first vertex, else the
 * centre of a sphere or a doughnut, which have none, or of a turned profile.
 */
export function brepAnchor(brep: Brep): Vec3 {
  if (brep.vertices.length > 0) return brep.vertices[0]
  for (const { surface } of brep.faces) {
    if ("center" in surface) return surface.center
    // A doughnut turned of a closed profile: its profile's centre.
    if (surface.kind === "revolution" || surface.kind === "extrusion") {
      const c = surface.profile
      return c.kind === "ellipse" ? c.center : c.curve.controlPoints[0]
    }
  }
  return ORIGIN
}

/** The area of its whole boundary: AREA's Object of a solid (solid/p01). */
export function brepArea(brep: Brep): number {
  const about = brepAnchor(brep)
  return brep.faces.reduce(
    (sum, face) => sum + faceMeasures(brep, face, about).area,
    0
  )
}

/**
 * The volume it encloses, by the divergence theorem: a third of the flux of
 * the position through its faces, a plane's its area times its distance
 * along its outward normal.
 */
export function brepVolume(brep: Brep): number {
  const about = brepAnchor(brep)
  return (
    brep.faces.reduce(
      (sum, face) => sum + faceMeasures(brep, face, about).flux,
      0
    ) / 3
  )
}

/**
 * A wire drawn on a face: a segment, an arc `sweep` radians round `normal`
 * from `start` (a whole circle at 2π), or a profile's copy, as its NURBS.
 */
export type Wire =
  | { readonly kind: "line"; readonly start: Vec3; readonly end: Vec3 }
  | { readonly kind: "curve"; readonly curve: BSplineCurve }
  | {
      readonly kind: "arc"
      readonly center: Vec3
      readonly normal: Vec3
      readonly radius: number
      readonly start: Vec3
      readonly sweep: number
    }

/**
 * The parallels a sphere shows for ISOLINES `count`: 2⌊3n/8⌋ + 1, fitted to
 * what AutoCAD 2027 draws for every count probed, 1 to 56 (solid/d06–d08:
 * 3, 4 and 5 all show three, 8 and 10 seven, 16 thirteen).
 */
export function sphereParallels(count: number): number {
  return count <= 0 ? 0 : 2 * Math.floor((3 * count) / 8) + 1
}

/**
 * The isolines ISOLINES draws on a solid's curved faces in 2D Wireframe
 * (solid/d04, d06–d09): `count` rulings of a cylinder from its seam round, of
 * a cone from the side opposite; a sphere's `count` meridians from opposite
 * its X and its {@link sphereParallels}; a torus' `count` tube circles from
 * opposite its X and `count` parallels — round the tube from its inside for
 * a doughnut, spread over an apple's or a lemon's arc. None on a plane, nor
 * with ISOLINES 0.
 */
export function brepIsolines(brep: Brep, count: number): Wire[] {
  const out: Wire[] = []
  if (count <= 0) return out
  const turn = (k: number, from: number) => from + (2 * Math.PI * k) / count
  for (const face of brep.faces) {
    const s = face.surface
    if (s.kind === "plane") continue
    if (face.domain) {
      out.push(...domainIsolines(s, face.domain, count))
      continue
    }
    if (s.kind === "extrusion" || s.kind === "revolution") continue
    const y = cross3(s.axis, s.xAxis)
    const way = (theta: number) =>
      add3(scale3(s.xAxis, Math.cos(theta)), scale3(y, Math.sin(theta)))
    const line = (a: Vec3, b: Vec3) =>
      out.push({ kind: "line", start: unsigned0(a), end: unsigned0(b) })
    const arc = (
      center: Vec3,
      normal: Vec3,
      radius: number,
      start: Vec3,
      sweep: number
    ) => {
      if (radius > 0) {
        out.push({
          kind: "arc",
          center: unsigned0(center),
          normal: unsigned0(normal),
          radius,
          start: unsigned0(start),
          sweep,
        })
      }
    }
    const circle = (center: Vec3, radius: number) =>
      arc(
        center,
        s.axis,
        radius,
        add3(center, scale3(s.xAxis, radius)),
        2 * Math.PI
      )
    switch (s.kind) {
      case "cylinder": {
        const [t0, t1] = loopHeights(brep, face, s.origin, s.axis)
        for (let k = 0; k < count; k++) {
          const theta = turn(k, 0)
          const side = add3(
            s.origin,
            add3(
              scale3(s.xAxis, s.radius * Math.cos(theta)),
              scale3(y, s.radius * s.ratio * Math.sin(theta))
            )
          )
          line(add3(side, scale3(s.axis, t0)), add3(side, scale3(s.axis, t1)))
        }
        break
      }
      case "cone": {
        const [t0, t1] = loopHeights(brep, face, s.apex, s.axis)
        const at = (t: number, theta: number) =>
          add3(
            s.apex,
            add3(
              scale3(s.axis, t),
              add3(
                scale3(s.xAxis, s.slope * t * Math.cos(theta)),
                scale3(y, s.slope * s.ratio * t * Math.sin(theta))
              )
            )
          )
        for (let k = 0; k < count; k++) {
          const theta = turn(k, Math.PI)
          line(at(t0, theta), at(t1, theta))
        }
        break
      }
      case "sphere": {
        const north = add3(s.center, scale3(s.axis, s.radius))
        for (let k = 0; k < count; k++) {
          arc(
            s.center,
            cross3(s.axis, way(turn(k, Math.PI))),
            s.radius,
            north,
            Math.PI
          )
        }
        const parallels = sphereParallels(count)
        for (let j = 1; j <= parallels; j++) {
          const latitude = -Math.PI / 2 + (Math.PI * j) / (parallels + 1)
          circle(
            add3(s.center, scale3(s.axis, s.radius * Math.sin(latitude))),
            s.radius * Math.cos(latitude)
          )
        }
        break
      }
      case "torus": {
        const R = s.majorRadius
        const r = s.minorRadius
        const doughnut = face.loops.length === 0
        const half = tubeHalfAngle(R, r)
        for (let k = 0; k < count; k++) {
          const u = way(turn(k, Math.PI))
          const center = add3(s.center, scale3(u, R))
          const start = add3(
            center,
            add3(
              scale3(u, r * Math.cos(half)),
              scale3(s.axis, -r * Math.sin(half))
            )
          )
          arc(
            center,
            cross3(u, s.axis),
            r,
            start,
            doughnut ? 2 * Math.PI : 2 * half
          )
        }
        for (let j = 0; j < count; j++) {
          const phi = doughnut
            ? turn(j, Math.PI)
            : -half + (2 * half * (j + 1)) / (count + 1)
          circle(
            add3(s.center, scale3(s.axis, r * Math.sin(phi))),
            R + r * Math.cos(phi)
          )
        }
        break
      }
    }
  }
  return out
}

type Curved = Exclude<BrepSurface, { kind: "plane" }>

/** The arc round `axis` through `start`, `sweep` radians, run forwards. */
function arcWire(
  center: Vec3,
  axis: Vec3,
  start: Vec3,
  sweep: number
): Wire | null {
  const radius = length3(sub3(start, center))
  if (!(radius > MODEL_TOLERANCE) || sweep === 0) return null
  return sweep > 0
    ? { kind: "arc", center, normal: axis, radius, start, sweep }
    : {
        kind: "arc",
        center,
        normal: scale3(axis, -1),
        radius,
        start,
        sweep: -sweep,
      }
}

/** The profile's piece from `from` to `to`, carried by `place`, as a NURBS. */
function profileWire(
  c: SweptCurve,
  from: number,
  to: number,
  place: (p: Vec3) => Vec3
): Wire {
  let curve: BSplineCurve
  if (c.kind === "ellipse") {
    curve = conicArcCurve(c.center, c.majorAxis, c.minorAxis, from, to - from)
  } else {
    const { start, end } = bsplineDomain(c.curve)
    const lo = Math.min(from, to)
    const hi = Math.max(from, to)
    curve = lo <= start && hi >= end ? c.curve : bsplineSegment(c.curve, lo, hi)
  }
  return {
    kind: "curve",
    curve: splineMapped(curve, (p) => unsigned0(place(p))),
  }
}

/**
 * A swept face's isolines: round its axis every `2π / count` from where its
 * turn starts (r03's revolved faces; an extruded arc's from the arc's start,
 * x09's ReferenceAxis), and across it what the primitive of its surface
 * draws there — a sphere's parallels, a torus' — within the face; a
 * revolution's `count` circles spread along its profile; an extrusion's
 * `count` rulings spread along its profile (i06 also draws profiles across
 * it, ACIS's own count: none here).
 */
function domainIsolines(s: Curved, d: FaceDomain, count: number): Wire[] {
  const out: Wire[] = []
  const add = (w: Wire | null) => {
    if (w) out.push(w)
  }
  const at = (u: number, v: number) => unsigned0(surfacePoint(s, u, v))
  const ruling = (u: number) =>
    add({ kind: "line", start: at(u, d.v[0]), end: at(u, d.v[1]) })
  const inside = (range: readonly [number, number], t: number) =>
    t > Math.min(...range) + 1e-9 && t < Math.max(...range) - 1e-9
  switch (s.kind) {
    case "cylinder":
    case "cone":
      for (const u of turnIsolines(d.u, count)) ruling(u)
      break
    case "sphere":
    case "torus": {
      const R = s.kind === "sphere" ? 0 : s.majorRadius
      const r = s.kind === "sphere" ? s.radius : s.minorRadius
      const y = cross3(s.axis, s.xAxis)
      const out3 = (u: number) =>
        add3(scale3(s.xAxis, Math.cos(u)), scale3(y, Math.sin(u)))
      for (const u of turnIsolines(d.u, count)) {
        add(
          arcWire(
            add3(s.center, scale3(out3(u), R)),
            cross3(out3(u), s.axis),
            at(u, d.v[0]),
            d.v[1] - d.v[0]
          )
        )
      }
      const across =
        s.kind === "sphere"
          ? Array.from(
              { length: sphereParallels(count) },
              (_, j) =>
                -Math.PI / 2 +
                (Math.PI * (j + 1)) / (sphereParallels(count) + 1)
            )
          : turnIsolines([Math.PI, 3 * Math.PI], count).map((phi) => {
              // Into the face's own range of the tube, a turn at a time.
              const lo = Math.min(...d.v)
              return (
                lo +
                ((((phi - lo) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI))
              )
            })
      const wholeTube = Math.abs(d.v[1] - d.v[0]) >= 2 * Math.PI - 1e-9
      for (const v of across) {
        if (!(s.kind === "torus" && wholeTube) && !inside(d.v, v)) continue
        add(
          arcWire(
            add3(s.center, scale3(s.axis, r * Math.sin(v))),
            s.axis,
            at(d.u[0], v),
            d.u[1] - d.u[0]
          )
        )
      }
      break
    }
    case "revolution": {
      for (const u of turnIsolines(d.u, count)) {
        add(
          profileWire(s.profile, d.v[0], d.v[1], (p) =>
            turnedAbout(p, s.origin, s.axis, u)
          )
        )
      }
      for (const v of spreadIsolines(d.v, count)) {
        const p = at(d.u[0], v)
        const center = add3(
          s.origin,
          scale3(s.axis, dot3(sub3(p, s.origin), s.axis))
        )
        add(arcWire(center, s.axis, p, d.u[1] - d.u[0]))
      }
      break
    }
    case "extrusion": {
      const whole =
        s.profile.kind === "ellipse"
          ? Math.abs(d.u[1] - d.u[0]) >= 2 * Math.PI - 1e-9
          : Math.abs(d.u[1] - d.u[0]) >=
            bsplineDomain(s.profile.curve).end -
              bsplineDomain(s.profile.curve).start -
              1e-9
      const us = whole
        ? Array.from(
            { length: count - 1 },
            (_, k) => d.u[0] + ((d.u[1] - d.u[0]) * (k + 1)) / count
          )
        : spreadIsolines(d.u, count)
      for (const u of us) ruling(u)
      break
    }
  }
  return out
}

/** Whether `p` lies on the face's surface, within `tolerance`. */
function onSurface(s: BrepSurface, p: Vec3, tolerance: number): boolean {
  switch (s.kind) {
    case "plane":
      return Math.abs(dot3(sub3(p, s.origin), s.normal)) <= tolerance
    case "cylinder":
    case "cone": {
      const base = s.kind === "cylinder" ? s.origin : s.apex
      const d = sub3(p, base)
      const t = dot3(d, s.axis)
      const r = s.kind === "cylinder" ? s.radius : s.slope * t
      const y = cross3(s.axis, s.xAxis)
      // On the ellipse of semi-axes r and r·ratio at that height.
      const u = dot3(d, s.xAxis)
      const v = dot3(d, y) / s.ratio
      return Math.abs(Math.hypot(u, v) - Math.abs(r)) <= tolerance
    }
    case "sphere":
      return Math.abs(length3(sub3(p, s.center)) - s.radius) <= tolerance
    case "extrusion":
    case "revolution":
      // Its vertices are its profile's ends, swept: what brepIsClosed reads
      // of them is that its edges meet there.
      return true
    case "torus": {
      // At its distance ρ from the axis and z along it, on the tube's circle.
      const d = sub3(p, s.center)
      const z = dot3(d, s.axis)
      const rho = length3(sub3(d, scale3(s.axis, z)))
      return (
        Math.abs(Math.hypot(rho - s.majorRadius, z) - s.minorRadius) <=
        tolerance
      )
    }
  }
}

/** Whether `p` lies on the curve, within `tolerance`. */
function onCurve(c: BrepCurve, p: Vec3, tolerance: number): boolean {
  if (c.kind === "line" || c.kind === "point") return true
  if (c.kind === "spline") {
    const { start, end } = bsplineDomain(c.curve)
    return [start, end].some(
      (t) => length3(sub3(bsplinePoint(c.curve, t), p)) <= tolerance
    )
  }
  const d = sub3(p, c.center)
  if (Math.abs(dot3(d, c.normal)) > tolerance) return false
  if (c.kind === "circle") return Math.abs(length3(d) - c.radius) <= tolerance
  const a = length3(c.majorAxis)
  const x = scale3(c.majorAxis, 1 / a)
  const y = cross3(c.normal, x)
  const u = dot3(d, x)
  const v = dot3(d, y) / c.ratio
  return Math.abs(Math.hypot(u, v) - a) <= tolerance
}

const isUnit = (v: Vec3) => Math.abs(length3(v) - 1) <= 1e-9

/**
 * Whether the boundary closes: every index in range, every curve and
 * surface well formed, every loop running end to end, every vertex on its
 * edges' curves and on the surfaces of the faces round it, and every edge
 * used twice, once each way — an apex's once. What a solid read from a file
 * must be.
 */
export function brepIsClosed(brep: Brep): boolean {
  const { vertices, edges, faces } = brep
  const uses = edges.map(() => ({ along: 0, against: 0 }))
  const size = vertices.reduce(
    (m, p) => Math.max(m, Math.abs(p.x), Math.abs(p.y), Math.abs(p.z)),
    1
  )
  const tolerance = MODEL_TOLERANCE * size
  for (const edge of edges) {
    const a = vertices[edge.start]
    const b = vertices[edge.end]
    if (!a || !b) return false
    const c = edge.curve
    switch (c.kind) {
      case "line":
        if (edge.start === edge.end) return false
        break
      case "point":
        if (edge.start !== edge.end) return false
        break
      case "circle":
        if (!isUnit(c.normal) || !(c.radius > 0)) return false
        break
      case "ellipse":
        if (!isUnit(c.normal) || !(c.ratio > 0 && c.ratio <= 1)) return false
        if (!(length3(c.majorAxis) > 0)) return false
        if (Math.abs(dot3(c.majorAxis, c.normal)) > tolerance) return false
        break
      case "spline": {
        if (!isSpline(c.curve)) return false
        const { start, end } = bsplineDomain(c.curve)
        const near = (p: Vec3, t: number) =>
          length3(sub3(bsplinePoint(c.curve, t), p)) <= tolerance
        if (!near(a, start) || !near(b, end)) return false
        continue
      }
      default:
        return false
    }
    if (!onCurve(c, a, tolerance) || !onCurve(c, b, tolerance)) return false
  }
  for (const face of faces) {
    const s = face.surface
    const d = face.domain
    if (d) {
      const range = (r: readonly number[]) =>
        Array.isArray(r) &&
        r.length === 2 &&
        r.every(Number.isFinite) &&
        r[0] !== r[1]
      if (s.kind === "plane" || !range(d.u) || !range(d.v)) return false
    } else if (s.kind === "extrusion" || s.kind === "revolution") {
      return false
    }
    switch (s.kind) {
      case "plane":
        if (!isUnit(s.normal)) return false
        break
      case "extrusion":
        if (!isUnit(s.direction) || !isSweptCurve(s.profile)) return false
        break
      case "revolution":
        if (!isUnit(s.axis) || !isSweptCurve(s.profile)) return false
        break
      case "cylinder":
      case "cone":
        if (!isUnit(s.axis) || !isUnit(s.xAxis) || !(s.ratio > 0)) return false
        if (Math.abs(dot3(s.axis, s.xAxis)) > 1e-9) return false
        if (!((s.kind === "cylinder" ? s.radius : s.slope) > 0)) return false
        break
      case "sphere":
      case "torus": {
        if (!isUnit(s.axis) || !isUnit(s.xAxis)) return false
        if (Math.abs(dot3(s.axis, s.xAxis)) > 1e-9) return false
        const sized =
          s.kind === "sphere"
            ? s.radius > 0
            : s.minorRadius > 0 &&
              s.majorRadius !== 0 &&
              s.majorRadius + s.minorRadius > 0
        if (!sized) return false
        // A face closed on itself has no loop: a sphere, a doughnut.
        const closed = s.kind === "sphere" || s.majorRadius > s.minorRadius
        if (!d && closed !== (face.loops.length === 0)) return false
        break
      }
      default:
        return false
    }
    for (const loop of face.loops) {
      if (loop.length === 0) return false
      for (let i = 0; i < loop.length; i++) {
        const coedge = loop[i]
        const use = uses[coedge.edge]
        if (!use) return false
        if (coedge.reversed) use.against++
        else use.along++
        const next = loop[(i + 1) % loop.length]
        if (!edges[next.edge]) return false
        const { start, end } = edges[coedge.edge]
        if ((coedge.reversed ? start : end) !== coedgeStart(brep, next)) {
          return false
        }
        if (!onSurface(s, vertices[start], tolerance)) return false
      }
    }
  }
  return edges.every((edge, i) =>
    edge.curve.kind === "point"
      ? uses[i].along + uses[i].against === 1
      : uses[i].along === 1 && uses[i].against === 1
  )
}

/** A NURBS well formed: its knots one more than its points and its degree, never falling, its weights positive. */
function isSpline(curve: BSplineCurve): boolean {
  const { degree, knots, controlPoints, weights } = curve
  if (!Number.isInteger(degree) || degree < 1) return false
  if (!Array.isArray(knots) || !Array.isArray(controlPoints)) return false
  if (controlPoints.length <= degree) return false
  if (knots.length !== controlPoints.length + degree + 1) return false
  if (
    !knots.every((k, i) => Number.isFinite(k) && (i === 0 || k >= knots[i - 1]))
  ) {
    return false
  }
  const { start, end } = bsplineDomain(curve)
  if (!(end > start)) return false
  if (
    weights &&
    (weights.length !== controlPoints.length || !weights.every((w) => w > 0))
  ) {
    return false
  }
  return controlPoints.every(
    (p) => Number.isFinite(p.x) && Number.isFinite(p.y) && Number.isFinite(p.z)
  )
}

function isSweptCurve(c: SweptCurve): boolean {
  return c.kind === "ellipse"
    ? length3(c.majorAxis) > 0 && length3(c.minorAxis) > 0
    : isSpline(c.curve)
}

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
import { MODEL_TOLERANCE, PlanarCurve } from "./planarCurves"
import { RegionFace, facesArea } from "./planarRegions"

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

export interface BrepFace {
  readonly surface: BrepSurface
  readonly loops: readonly BrepLoop[]
}

/**
 * `v` with no -0, which a file cannot hold (it reads back 0): every point
 * and direction a solid stores passes here, so a round trip is exact.
 */
export function unsigned0(v: Vec3): Vec3 {
  return { x: v.x + 0, y: v.y + 0, z: v.z + 0 }
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
      // Newell's normal: exact for a face along the axes, unbiased for any.
      let n: Vec3 = { x: 0, y: 0, z: 0 }
      cycle.forEach((a, i) => {
        n = add3(
          n,
          cross3(vertices[a], vertices[cycle[(i + 1) % cycle.length]])
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
    }
  }
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
    })),
  }
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
function loopHeights(
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
  switch (s.kind) {
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
  }
}

/** The area of its whole boundary: AREA's Object of a solid (solid/p01). */
export function brepArea(brep: Brep): number {
  const about = brep.vertices[0] ?? ORIGIN
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
  const about = brep.vertices[0] ?? ORIGIN
  return (
    brep.faces.reduce(
      (sum, face) => sum + faceMeasures(brep, face, about).flux,
      0
    ) / 3
  )
}

/**
 * The isolines ISOLINES draws on a solid's curved faces in 2D Wireframe
 * (solid/d04): `count` rulings of a cylinder or a cone, from `xAxis` round,
 * between its loops' heights, an ellipse's at those parameters. None on a
 * plane, nor with ISOLINES 0.
 */
export function brepIsolines(brep: Brep, count: number): [Vec3, Vec3][] {
  const out: [Vec3, Vec3][] = []
  if (count <= 0) return out
  for (const face of brep.faces) {
    const s = face.surface
    if (s.kind === "plane") continue
    const y = cross3(s.axis, s.xAxis)
    const across = (theta: number, r: number) =>
      add3(
        scale3(s.xAxis, r * Math.cos(theta)),
        scale3(y, r * s.ratio * Math.sin(theta))
      )
    if (s.kind === "cylinder") {
      const [t0, t1] = loopHeights(brep, face, s.origin, s.axis)
      for (let k = 0; k < count; k++) {
        const side = add3(s.origin, across((2 * Math.PI * k) / count, s.radius))
        out.push([
          unsigned0(add3(side, scale3(s.axis, t0))),
          unsigned0(add3(side, scale3(s.axis, t1))),
        ])
      }
    } else {
      const [t0, t1] = loopHeights(brep, face, s.apex, s.axis)
      const at = (t: number, theta: number) =>
        unsigned0(
          add3(s.apex, add3(scale3(s.axis, t), across(theta, s.slope * t)))
        )
      for (let k = 0; k < count; k++) {
        const theta = (2 * Math.PI * k) / count
        out.push([at(t0, theta), at(t1, theta)])
      }
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
  }
}

/** Whether `p` lies on the curve, within `tolerance`. */
function onCurve(c: BrepCurve, p: Vec3, tolerance: number): boolean {
  if (c.kind === "line" || c.kind === "point") return true
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
      default:
        return false
    }
    if (!onCurve(c, a, tolerance) || !onCurve(c, b, tolerance)) return false
  }
  for (const face of faces) {
    const s = face.surface
    switch (s.kind) {
      case "plane":
        if (!isUnit(s.normal)) return false
        break
      case "cylinder":
      case "cone":
        if (!isUnit(s.axis) || !isUnit(s.xAxis) || !(s.ratio > 0)) return false
        if (Math.abs(dot3(s.axis, s.xAxis)) > 1e-9) return false
        if (!((s.kind === "cylinder" ? s.radius : s.slope) > 0)) return false
        break
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

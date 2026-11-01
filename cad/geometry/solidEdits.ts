import { Vec3, add3, cross3, dot3, length3, scale3, sub3 } from "./Vec3"
import { arbitraryAxis } from "./ocs"
import { MODEL_TOLERANCE } from "./planarCurves"
import { RegionFace, loopArea, loopReversed } from "./planarRegions"
import { SolidBooleanError, brepBoolean } from "./solidBooleans"
import { solidBox } from "./brepQueries"
import { PlanarProfile, extrusionBrep } from "./sweeps"
import {
  Brep,
  BrepEdge,
  BrepFace,
  boxBrep,
  brepAnchor,
  brepIsClosed,
  brepVolume,
  coedgeStart,
  planarFace,
  unsigned0,
} from "./solids"

/**
 * What SLICE, SECTION and PRESSPULL do to a solid's B-rep, through the
 * booleans' machinery (`solidBooleans.ts`): a cut is the solid's
 * intersection with each half-space the plane bounds, a section the face that
 * cut leaves on the plane, a face pulled or pressed the solid united with the
 * face's prism or less it. Only a face offset with sloping neighbours moves
 * vertices itself, keeping the topology as ACIS's offset does.
 */

/** A plane: through `origin`, its front where the unit `normal` points. */
export interface CutPlane {
  readonly origin: Vec3
  readonly normal: Vec3
}

/** The solid's two pieces either side of a plane: in front of it and behind it. */
export interface BrepHalves {
  readonly front: Brep | null
  readonly back: Brep | null
}

/** A region of a plane: the plane's OCS (its normal's arbitrary axis), how far along it, its faces. */
export interface PlaneSection {
  readonly normal: Vec3
  readonly elevation: number
  readonly faces: readonly RegionFace[]
}

/**
 * The box filling one side of the plane where the solid reaches, a tenth of
 * its size past it every way but the plane's: null when the solid lies wholly
 * on the other side. Its face on the plane is the cut; the others never touch
 * the solid, so they leave nothing in what it bounds.
 */
function halfSpace(brep: Brep, plane: CutPlane, side: 1 | -1): Brep | null {
  const axes = arbitraryAxis(plane.normal)
  if (!axes) return null
  const box = solidBox(brep)
  const min = [Infinity, Infinity, Infinity]
  const max = [-Infinity, -Infinity, -Infinity]
  for (const x of [box.min.x, box.max.x]) {
    for (const y of [box.min.y, box.max.y]) {
      for (const z of [box.min.z, box.max.z]) {
        const d = sub3({ x, y, z }, plane.origin)
        const p = [dot3(d, axes.x), dot3(d, axes.y), dot3(d, axes.z)]
        for (let i = 0; i < 3; i++) {
          min[i] = Math.min(min[i], p[i])
          max[i] = Math.max(max[i], p[i])
        }
      }
    }
  }
  const pad = 0.1 * Math.max(max[0] - min[0], max[1] - min[1], max[2] - min[2])
  const reach = side > 0 ? max[2] : -min[2]
  if (!(reach > MODEL_TOLERANCE)) return null
  const corner = add3(
    plane.origin,
    add3(
      add3(scale3(axes.x, min[0] - pad), scale3(axes.y, min[1] - pad)),
      scale3(axes.z, side > 0 ? 0 : -(reach + pad))
    )
  )
  return boxBrep(
    corner,
    scale3(axes.x, max[0] - min[0] + 2 * pad),
    scale3(axes.y, max[1] - min[1] + 2 * pad),
    scale3(axes.z, reach + pad)
  )
}

/**
 * The solid cut by the plane into what lies in front of it and what lies
 * behind (SLICE, slice/s01–s12): either is null where nothing is, a plane
 * that only touches the solid — on a face, along an edge, at a vertex —
 * leaving it whole on one side (s07). A piece may be several shells, as ACIS
 * keeps one solid of two lumps (s11). Throws `SolidBooleanError`.
 */
export function brepSliced(brep: Brep, plane: CutPlane): BrepHalves {
  const half = (side: 1 | -1) => {
    const space = halfSpace(brep, plane, side)
    return space ? brepBoolean("intersect", brep, space) : null
  }
  return { front: half(1), back: half(-1) }
}

/**
 * Where the plane cuts the solid, as a region of the plane facing its normal
 * (SECTION, section/c01–c06): the faces the cut leaves behind it on the
 * plane, or, where the plane holds a face of the solid, that face (c06: the
 * top of a box, a region of 100). Null where it misses the solid or only
 * touches it on an edge or at a vertex. Throws `SolidBooleanError`.
 */
export function brepSection(brep: Brep, plane: CutPlane): PlaneSection | null {
  const axes = arbitraryAxis(plane.normal)
  if (!axes) return null
  const n = axes.z
  const onPlane = (piece: Brep | null, facing: 1 | -1): RegionFace[] => {
    if (!piece) return []
    const out: RegionFace[] = []
    for (const face of piece.faces) {
      const s = face.surface
      if (s.kind !== "plane") continue
      if (dot3(s.normal, n) * facing < 1 - 1e-9) continue
      const level = dot3(sub3(s.origin, plane.origin), n)
      if (Math.abs(level) > sizeTolerance(brep)) continue
      // Read in the plane's own frame, so every face shares one.
      const flat = planarFace(piece, {
        ...face,
        surface: { kind: "plane", origin: s.origin, normal: n },
      }).face
      out.push(
        facing > 0 ? flat : { loops: flat.loops.map((l) => loopReversed(l)) }
      )
    }
    return out
  }
  const behind = halfSpace(brep, plane, -1)
  let faces = onPlane(behind ? brepBoolean("intersect", brep, behind) : null, 1)
  if (faces.length === 0) {
    // The plane on a face facing away from its normal: the piece in front
    // keeps it.
    const ahead = halfSpace(brep, plane, 1)
    faces = onPlane(ahead ? brepBoolean("intersect", brep, ahead) : null, -1)
  }
  if (faces.length === 0) return null
  return {
    normal: unsigned0(n),
    elevation: dot3(plane.origin, n),
    faces,
  }
}

/** The model's tolerance as large as the solid's coordinates need. */
function sizeTolerance(brep: Brep): number {
  const box = solidBox(brep)
  const size = Math.max(
    1,
    ...[box.min, box.max].flatMap((p) => [
      Math.abs(p.x),
      Math.abs(p.y),
      Math.abs(p.z),
    ])
  )
  return MODEL_TOLERANCE * Math.max(1, size / 1000)
}

/** A planar face as a profile of its plane, its outline counter-clockwise about its outward normal. */
function faceProfile(brep: Brep, face: BrepFace): PlanarProfile {
  const flat = planarFace(brep, face)
  return { axes: flat.axes, elevation: flat.elevation, faces: [flat.face] }
}

/**
 * A planar face swept `distance` along its outward normal: what PRESSPULL
 * adds or takes, drawn as its height is dragged. Null for a curved face.
 */
export function brepFacePrism(
  brep: Brep,
  faceIndex: number,
  distance: number
): Brep | null {
  const face = brep.faces[faceIndex]
  const n = face && planeNormal(face)
  if (!n || distance === 0) return null
  return extrusionBrep(faceProfile(brep, face), scale3(n, distance))
}

/** The face's outward normal, or null when it is not planar. */
function planeNormal(face: BrepFace): Vec3 | null {
  return face.surface.kind === "plane" ? face.surface.normal : null
}

/**
 * The solid with a planar face pulled out `distance` along its outward
 * normal, or pressed in when negative, and its neighbours left as they were
 * (PRESSPULL's click, SOLIDEDIT's Extrude with no taper; solidedit/e01–e02:
 * a face beside a slope rises square, a new side over the slope). The face's
 * prism united with the solid, or taken out of it: null when that takes it
 * all. Throws `SolidBooleanError`.
 */
export function brepFaceExtruded(
  brep: Brep,
  faceIndex: number,
  distance: number
): Brep | null {
  const face = brep.faces[faceIndex]
  const n = face && planeNormal(face)
  if (!n) throw new SolidBooleanError("unsupported")
  const prism = extrusionBrep(faceProfile(brep, face), scale3(n, distance))
  if (!prism) throw new SolidBooleanError("unsupported")
  return brepBoolean(distance > 0 ? "union" : "subtract", brep, prism)
}

/**
 * The solid with a planar face offset `distance` along its outward normal
 * and its neighbours carried on to meet it (PRESSPULL's Ctrl+click,
 * SOLIDEDIT's Offset; solidedit/e01–e03: a slope beside it runs on, a
 * cylinder square to it grows, a hole through it stays). Neighbours that are
 * planes, any way they slope, move the face's vertices along their meeting
 * lines, the topology kept; where some are curved, every one must be square
 * to the face (a plane across it, a cylinder or an extrusion along it), and
 * the face's prism is added or taken, the volume changing by exactly the
 * prism's. Throws `SolidBooleanError`: "unsupported" for neighbours neither
 * way, "failed" for an offset the topology cannot take (a face pushed past
 * the one across it).
 */
export function brepFaceOffset(
  brep: Brep,
  faceIndex: number,
  distance: number
): Brep {
  const face = brep.faces[faceIndex]
  const n = face && planeNormal(face)
  if (!n) throw new SolidBooleanError("unsupported")
  const moved = movedAmongPlanes(brep, faceIndex, distance)
  if (moved !== "curved") return moved
  for (const g of neighbours(brep, faceIndex)) {
    if (!squareTo(g, n)) throw new SolidBooleanError("unsupported")
  }
  const flat = faceProfile(brep, face)
  const area = flat.faces[0].loops.reduce((sum, l) => sum + loopArea(l), 0)
  const result = brepFaceExtruded(brep, faceIndex, distance)
  const expected = brepVolume(brep) + area * distance
  if (
    !result ||
    Math.abs(brepVolume(result) - expected) >
      1e-6 * Math.max(1, Math.abs(expected))
  ) {
    throw new SolidBooleanError("failed")
  }
  return result
}

/** The faces sharing an edge with the face, itself left out. */
function neighbours(brep: Brep, faceIndex: number): BrepFace[] {
  const edges = new Set<number>()
  for (const loop of brep.faces[faceIndex].loops) {
    for (const c of loop) edges.add(c.edge)
  }
  return brep.faces.filter(
    (g, i) =>
      i !== faceIndex && g.loops.some((l) => l.some((c) => edges.has(c.edge)))
  )
}

/** Whether a surface runs straight along `n`, so a face square to `n` moved along it keeps meeting it the same way. */
function squareTo(g: BrepFace, n: Vec3): boolean {
  const along = (d: Vec3) => length3(cross3(d, n)) <= 1e-9
  const s = g.surface
  switch (s.kind) {
    case "plane":
      return Math.abs(dot3(s.normal, n)) <= 1e-9
    case "cylinder":
      return along(s.axis)
    case "extrusion":
      return along(s.direction)
    default:
      return false
  }
}

/**
 * The face moved `distance` along its normal where every face at its
 * vertices is a plane: each vertex slides to where its neighbouring planes
 * meet the moved one. "curved" where a face there is not a plane. Throws
 * `SolidBooleanError("failed")` when a vertex has no single place (its
 * neighbours meet the plane in no point, or in none all of them share) or
 * when a face at the moved vertices turns over or shrinks to nothing.
 */
function movedAmongPlanes(
  brep: Brep,
  faceIndex: number,
  distance: number
): Brep | "curved" {
  const surface = brep.faces[faceIndex].surface
  if (surface.kind !== "plane") return "curved"
  const face = brep.faces[faceIndex]
  const n = surface.normal
  const target = dot3(surface.origin, n) + distance
  const tolerance = sizeTolerance(brep)
  const own = new Set<number>()
  for (const loop of face.loops) {
    for (const c of loop) own.add(coedgeStart(brep, c))
  }
  // The faces at each of the face's vertices, and every face touched.
  const at = new Map<number, number[]>()
  brep.faces.forEach((g, gi) => {
    if (gi === faceIndex) return
    for (const loop of g.loops) {
      for (const c of loop) {
        const e = brep.edges[c.edge]
        for (const v of [e.start, e.end]) {
          if (!own.has(v)) continue
          const list = at.get(v) ?? []
          if (!list.includes(gi)) list.push(gi)
          at.set(v, list)
        }
      }
    }
  })
  const touched = new Set<number>([faceIndex])
  for (const list of at.values()) for (const gi of list) touched.add(gi)
  for (const gi of touched) {
    if (brep.faces[gi].surface.kind !== "plane") return "curved"
  }
  const vertices = [...brep.vertices]
  for (const v of own) {
    const planes = (at.get(v) ?? []).map((gi) => {
      const s = brep.faces[gi].surface as Extract<
        BrepFace["surface"],
        { kind: "plane" }
      >
      return { normal: s.normal, level: dot3(s.origin, s.normal) }
    })
    const p = meetingPoint(planes, n, target)
    if (!p) throw new SolidBooleanError("failed")
    for (const q of planes) {
      if (Math.abs(dot3(p, q.normal) - q.level) > tolerance * 10) {
        throw new SolidBooleanError("failed")
      }
    }
    vertices[v] = unsigned0(p)
  }
  const moved: Brep = {
    vertices,
    edges: brep.edges,
    faces: brep.faces.map((g, gi) =>
      gi === faceIndex
        ? {
            ...g,
            surface: {
              kind: "plane",
              origin: unsigned0(add3(surface.origin, scale3(n, distance))),
              normal: n,
            },
          }
        : g
    ),
  }
  // Every edge keeps a length, every face touched its loops' turns.
  for (const e of moved.edges) {
    if (e.start !== e.end && edgeLength(moved, e) <= tolerance) {
      throw new SolidBooleanError("failed")
    }
  }
  const about = brepAnchor(brep)
  for (const gi of touched) {
    const before = planarFace(brep, brep.faces[gi], about).face.loops
    const after = planarFace(moved, moved.faces[gi], about).face.loops
    for (let i = 0; i < before.length; i++) {
      const a = loopArea(before[i])
      const b = loopArea(after[i])
      if (Math.sign(a) !== Math.sign(b) || Math.abs(b) <= tolerance) {
        throw new SolidBooleanError("failed")
      }
    }
  }
  if (!brepIsClosed(moved)) throw new SolidBooleanError("failed")
  return moved
}

function edgeLength(brep: Brep, e: BrepEdge): number {
  return length3(sub3(brep.vertices[e.end], brep.vertices[e.start]))
}

/**
 * The point on the plane `n · p = target` and on every plane of `planes`:
 * where the two of them that meet most squarely, and least along `n`, cross
 * it. Null when no two meet the moved plane in a point.
 */
function meetingPoint(
  planes: readonly { normal: Vec3; level: number }[],
  n: Vec3,
  target: number
): Vec3 | null {
  let best: { a: number; b: number; det: number } | null = null
  for (let a = 0; a < planes.length; a++) {
    for (let b = a + 1; b < planes.length; b++) {
      const det = dot3(cross3(planes[a].normal, planes[b].normal), n)
      if (!best || Math.abs(det) > Math.abs(best.det)) best = { a, b, det }
    }
  }
  if (!best || Math.abs(best.det) < 1e-9) return null
  const p = planes[best.a]
  const q = planes[best.b]
  // Cramer's rule for p·x = dp, q·x = dq, n·x = target.
  const x = add3(
    add3(
      scale3(cross3(q.normal, n), p.level),
      scale3(cross3(n, p.normal), q.level)
    ),
    scale3(cross3(p.normal, q.normal), target)
  )
  return scale3(x, 1 / best.det)
}

/**
 * Several planar faces of one solid pulled or pressed together (PRESSPULL's
 * Multiple): each face's prism made from the solid as it was, then united or
 * taken out in turn. Throws `SolidBooleanError`.
 */
export function brepFacesExtruded(
  brep: Brep,
  faces: readonly number[],
  distance: number
): Brep | null {
  const prisms = faces.map((index) => {
    const face = brep.faces[index]
    const n = face && planeNormal(face)
    if (!n) throw new SolidBooleanError("unsupported")
    const prism = extrusionBrep(faceProfile(brep, face), scale3(n, distance))
    if (!prism) throw new SolidBooleanError("unsupported")
    return prism
  })
  let result: Brep | null = brep
  for (const prism of prisms) {
    if (!result) return null
    result = brepBoolean(distance > 0 ? "union" : "subtract", result, prism)
  }
  return result
}

/**
 * Several planar faces of one solid offset together, one after another: a
 * face found again after the first by its plane, which offsetting another
 * leaves where it was. Throws `SolidBooleanError`.
 */
export function brepFacesOffset(
  brep: Brep,
  faces: readonly number[],
  distance: number
): Brep {
  const planes = faces.map((index) => {
    const s = brep.faces[index]?.surface
    if (!s || s.kind !== "plane") throw new SolidBooleanError("unsupported")
    return { normal: s.normal, level: dot3(s.origin, s.normal) }
  })
  const tolerance = sizeTolerance(brep)
  let result = brep
  planes.forEach((plane, i) => {
    const index =
      i === 0
        ? faces[0]
        : result.faces.findIndex(
            (f) =>
              f.surface.kind === "plane" &&
              dot3(f.surface.normal, plane.normal) > 1 - 1e-9 &&
              Math.abs(dot3(f.surface.origin, plane.normal) - plane.level) <=
                tolerance
          )
    if (index < 0) throw new SolidBooleanError("failed")
    result = brepFaceOffset(result, index, distance)
  })
  return result
}

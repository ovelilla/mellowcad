import { Vec3, add3, cross3, dot3, length3, scale3, sub3 } from "./Vec3"
import { Vec2 } from "./Vec2"
import { worldToAxes } from "./ocs"
import { EdgeTrace, edgeTrace, traceNearest } from "./brepCurves"
import { surfaceFrame } from "./faceDomains"
import { faceRegion, regionContains, surfaceParams } from "./faceRegions"
import { pointInFaces } from "./planarRegions"
import { surfaceLevel } from "./surfaces"
import {
  Box3,
  Brep,
  BrepFace,
  BrepSurface,
  PlanarFace,
  boxOfPoints,
  closedSurfaceReach,
  planarFace,
} from "./solids"

/**
 * Questions asked of a B-rep's faces and of the solid they bound: where a
 * point lies against a face, how far a face reaches, whether a point is
 * inside. What a boolean cuts and sorts its pieces by.
 */

export type FacePlace = "inside" | "boundary" | "outside"

interface FaceCache {
  readonly brep: Brep
  readonly traces: EdgeTrace[]
  readonly boxes: Box3[]
  flat?: PlanarFace
  box?: Box3
}

const caches = new WeakMap<BrepFace, FaceCache>()

function cacheOf(brep: Brep, face: BrepFace): FaceCache {
  const found = caches.get(face)
  if (found && found.brep === brep) return found
  const traces: EdgeTrace[] = []
  const boxes: Box3[] = []
  for (const loop of face.loops) {
    for (const c of loop) {
      const trace = edgeTrace(brep, brep.edges[c.edge])
      traces.push(trace)
      boxes.push(traceBox(trace))
    }
  }
  const made: FaceCache = { brep, traces, boxes }
  caches.set(face, made)
  return made
}

/** Samples a trace's box is taken over, padded by what bulges between them. */
const BOX_SAMPLES = 32

export function traceBox(trace: EdgeTrace): Box3 {
  const points = Array.from({ length: BOX_SAMPLES + 1 }, (_, i) =>
    trace.point(trace.t0 + ((trace.t1 - trace.t0) * i) / BOX_SAMPLES)
  )
  return padded(boxOfPoints(points)!, 0.01)
}

function padded(box: Box3, share: number, extra = 0): Box3 {
  const d = sub3(box.max, box.min)
  const pad = share * Math.max(d.x, d.y, d.z) + extra
  const v = { x: pad, y: pad, z: pad }
  return { min: sub3(box.min, v), max: add3(box.max, v) }
}

export function boxesOverlap(a: Box3, b: Box3, margin: number): boolean {
  return (
    a.min.x <= b.max.x + margin &&
    b.min.x <= a.max.x + margin &&
    a.min.y <= b.max.y + margin &&
    b.min.y <= a.max.y + margin &&
    a.min.z <= b.max.z + margin &&
    b.min.z <= a.max.z + margin
  )
}

export function inBox(p: Vec3, box: Box3, margin: number): boolean {
  return (
    p.x >= box.min.x - margin &&
    p.x <= box.max.x + margin &&
    p.y >= box.min.y - margin &&
    p.y <= box.max.y + margin &&
    p.z >= box.min.z - margin &&
    p.z <= box.max.z + margin
  )
}

/** Samples each way a curved face's box is taken over. */
const FACE_GRID = 16

/**
 * A box the face lies in: its edges', and a curved one's surface over its
 * domain, padded by what bulges between the samples.
 */
export function faceBox(brep: Brep, face: BrepFace): Box3 {
  const cache = cacheOf(brep, face)
  if (cache.box) return cache.box
  const points: Vec3[] = []
  for (const b of cache.boxes) points.push(b.min, b.max)
  const s = face.surface
  if (s.kind !== "plane") {
    const region = faceRegion(brep, face)
    if (region) {
      const { u, v } = region.domain
      for (let i = 0; i <= FACE_GRID; i++) {
        for (let j = 0; j <= FACE_GRID; j++) {
          points.push(
            surfaceFrame(
              s,
              u[0] + ((u[1] - u[0]) * i) / FACE_GRID,
              v[0] + ((v[1] - v[0]) * j) / FACE_GRID
            ).p
          )
        }
      }
    }
    const reach = closedSurfaceReach(s)
    if (reach && "center" in s) {
      points.push(sub3(s.center, reach), add3(s.center, reach))
    }
  }
  cache.box = padded(boxOfPoints(points)!, s.kind === "plane" ? 0 : 0.03, 1e-9)
  return cache.box
}

/** The face as a region of its plane, kept. */
function flatOf(brep: Brep, face: BrepFace): PlanarFace {
  const cache = cacheOf(brep, face)
  cache.flat ??= planarFace(brep, face)
  return cache.flat
}

/** How far `p` lies from the face's nearest edge, and whether nearer than `tolerance`. */
export function nearFaceEdge(
  brep: Brep,
  face: BrepFace,
  p: Vec3,
  tolerance: number
): boolean {
  const cache = cacheOf(brep, face)
  for (let i = 0; i < cache.traces.length; i++) {
    if (!inBox(p, cache.boxes[i], tolerance)) continue
    if (traceNearest(cache.traces[i], p).distance <= tolerance) return true
  }
  return false
}

/**
 * Where a point of the face's surface lies against the face: on an edge
 * within `tolerance`, else inside or outside its loops — a plane's region,
 * a curved face's in its parameters.
 */
export function facePlace(
  brep: Brep,
  face: BrepFace,
  p: Vec3,
  tolerance: number
): FacePlace {
  if (!inBox(p, faceBox(brep, face), tolerance)) return "outside"
  if (nearFaceEdge(brep, face, p, tolerance)) return "boundary"
  const s = face.surface
  if (s.kind === "plane") {
    const flat = flatOf(brep, face)
    const q = worldToAxes(flat.axes, p)
    const at: Vec2 = { x: q.x, y: q.y }
    return pointInFaces(at, [flat.face]) ? "inside" : "outside"
  }
  const region = faceRegion(brep, face)
  if (!region) return "outside"
  return regionContains(region, surfaceParams(s, p)) ? "inside" : "outside"
}

/** The face's outward unit normal at a point of it. */
export function faceNormal(brep: Brep, face: BrepFace, p: Vec3): Vec3 {
  const s = face.surface
  if (s.kind === "plane") return s.normal
  const region = faceRegion(brep, face)
  const uv = surfaceParams(s, p)
  const { du, dv } = surfaceFrame(s, uv.u, uv.v)
  const n = cross3(du, dv)
  const size = length3(n)
  if (size > 0) return scale3(n, (region?.sense ?? 1) / size)
  return scale3(surfaceLevel(s, p).gradient, region?.sense ?? 1)
}

/** The solid's box: every face's. */
export function solidBox(brep: Brep): Box3 {
  const points: Vec3[] = [...brep.vertices]
  for (const face of brep.faces) {
    const b = faceBox(brep, face)
    points.push(b.min, b.max)
  }
  return boxOfPoints(points)!
}

/** The parameters along a ray inside a box, null when it misses it. */
function rayInBox(o: Vec3, d: Vec3, box: Box3): [number, number] | null {
  let lo = -Infinity
  let hi = Infinity
  for (const k of ["x", "y", "z"] as const) {
    if (Math.abs(d[k]) < 1e-300) {
      if (o[k] < box.min[k] || o[k] > box.max[k]) return null
      continue
    }
    const a = (box.min[k] - o[k]) / d[k]
    const b = (box.max[k] - o[k]) / d[k]
    lo = Math.max(lo, Math.min(a, b))
    hi = Math.min(hi, Math.max(a, b))
  }
  return lo <= hi ? [lo, hi] : null
}

/**
 * Where the line `o + t d` meets the surface for `t` in `[t0, t1]`: a plane's
 * and a quadric's in closed form, a torus' and a swept surface's by sampling
 * its level. Null where it grazes it — runs along a plane, touches a quadric
 * — for the caller to cast another.
 */
export function lineSurfaceHits(
  o: Vec3,
  d: Vec3,
  t0: number,
  t1: number,
  s: BrepSurface,
  tolerance: number
): number[] | null {
  const inside = (t: number) => t >= t0 && t <= t1
  switch (s.kind) {
    case "plane": {
      const along = dot3(s.normal, d)
      const at = dot3(sub3(o, s.origin), s.normal)
      if (Math.abs(along) < 1e-9) return Math.abs(at) <= tolerance ? null : []
      const t = -at / along
      return inside(t) ? [t] : []
    }
    case "cylinder":
    case "cone":
    case "sphere": {
      let a: number
      let b: number
      let c: number
      if (s.kind === "sphere") {
        const q = sub3(o, s.center)
        a = dot3(d, d)
        b = 2 * dot3(q, d)
        c = dot3(q, q) - s.radius * s.radius
      } else {
        const base = s.kind === "cylinder" ? s.origin : s.apex
        const y = cross3(s.axis, s.xAxis)
        const q = sub3(o, base)
        const k = s.ratio
        const qx = dot3(q, s.xAxis)
        const qy = dot3(q, y) / k
        const dx = dot3(d, s.xAxis)
        const dy = dot3(d, y) / k
        a = dx * dx + dy * dy
        b = 2 * (qx * dx + qy * dy)
        c = qx * qx + qy * qy
        if (s.kind === "cylinder") {
          c -= s.radius * s.radius
        } else {
          const qz = dot3(q, s.axis) * s.slope
          const dz = dot3(d, s.axis) * s.slope
          a -= dz * dz
          b -= 2 * qz * dz
          c -= qz * qz
        }
      }
      const out: number[] = []
      if (Math.abs(a) < 1e-14 * (Math.abs(b) + Math.abs(c) + 1e-300)) {
        if (Math.abs(b) < 1e-300) return c === 0 ? null : []
        out.push(-c / b)
      } else {
        const disc = b * b - 4 * a * c
        const scale = b * b + Math.abs(4 * a * c)
        if (Math.abs(disc) <= 1e-12 * scale) return null
        if (disc < 0) return []
        const root = Math.sqrt(disc)
        const q = -0.5 * (b + Math.sign(b || 1) * root)
        out.push(q / a)
        if (q !== 0) out.push(c / q)
      }
      return out.filter(
        (t) =>
          inside(t) &&
          (s.kind !== "cone" ||
            dot3(sub3(add3(o, scale3(d, t)), s.apex), s.axis) >= 0)
      )
    }
    default: {
      const hits = rootsAlong(o, d, t0, t1, s, tolerance)
      if (hits === null) return null
      for (const t of hits) {
        const g = surfaceLevel(s, add3(o, scale3(d, t))).gradient
        if (Math.abs(dot3(g, d)) < 1e-6 * length3(d)) return null
      }
      return hits
    }
  }
}

/** Samples along a ray's stretch in a face's box. */
const RAY_SAMPLES = 128

function rootsAlong(
  o: Vec3,
  d: Vec3,
  t0: number,
  t1: number,
  s: BrepSurface,
  tolerance: number
): number[] | null {
  const level = (t: number) => surfaceLevel(s, add3(o, scale3(d, t))).value
  const n = RAY_SAMPLES
  const ts = Array.from({ length: n + 1 }, (_, i) => t0 + ((t1 - t0) * i) / n)
  const fs = ts.map(level)
  const out: number[] = []
  for (let i = 0; i < n; i++) {
    if (fs[i] === 0) {
      out.push(ts[i])
      continue
    }
    if (fs[i] * fs[i + 1] < 0) {
      let lo = ts[i]
      let hi = ts[i + 1]
      let flo = fs[i]
      for (let step = 0; step < 100; step++) {
        const m = (lo + hi) / 2
        const fm = level(m)
        if (fm * flo > 0) {
          lo = m
          flo = fm
        } else hi = m
      }
      // A swept surface's level jumps where the nearest point of its
      // profile does, far from it: a sign change there is no crossing.
      const t = (lo + hi) / 2
      if (Math.abs(level(t)) <= tolerance * 100) out.push(t)
    } else if (
      i > 0 &&
      Math.abs(fs[i]) <= tolerance * 10 &&
      Math.abs(fs[i]) <= Math.abs(fs[i - 1]) &&
      Math.abs(fs[i]) <= Math.abs(fs[i + 1])
    ) {
      return null
    }
  }
  return out
}

/** Directions a ray is cast in, tried in turn until one passes cleanly. */
const RAY_TRIES = 24

export type SolidPlace = "inside" | "outside" | "boundary"

/**
 * Where a point lies against the solid: on a face within `tolerance`, else
 * inside or outside by the parity of the faces a ray from it crosses — cast
 * again another way when it grazes a surface or passes through an edge.
 */
export function pointInSolid(
  brep: Brep,
  p: Vec3,
  tolerance: number
): SolidPlace {
  const box = solidBox(brep)
  if (!inBox(p, box, tolerance)) return "outside"
  for (const face of brep.faces) {
    if (!inBox(p, faceBox(brep, face), tolerance)) continue
    if (Math.abs(surfaceLevel(face.surface, p).value) > tolerance) continue
    if (facePlace(brep, face, p, tolerance) !== "outside") return "boundary"
  }
  for (let k = 0; k < RAY_TRIES; k++) {
    // Directions spread by the golden angle round a sphere: none repeats.
    const z = 1 - (2 * (k + 0.5)) / RAY_TRIES
    const phi = 0.7 + k * 2.399963229728653
    const r = Math.sqrt(1 - z * z)
    const d = { x: r * Math.cos(phi), y: r * Math.sin(phi), z }
    const count = rayCrossings(brep, p, d, tolerance)
    if (count !== null) return count % 2 === 1 ? "inside" : "outside"
  }
  return "outside"
}

function rayCrossings(
  brep: Brep,
  p: Vec3,
  d: Vec3,
  tolerance: number
): number | null {
  let count = 0
  for (const face of brep.faces) {
    const box = faceBox(brep, face)
    const span = rayInBox(p, d, padded(box, 0, tolerance))
    if (!span || span[1] < tolerance) continue
    const from = Math.max(span[0], 0)
    const hits = lineSurfaceHits(p, d, from, span[1], face.surface, tolerance)
    if (hits === null) return null
    for (const t of hits) {
      if (t <= tolerance) continue
      const q = add3(p, scale3(d, t))
      const place = facePlace(brep, face, q, tolerance)
      if (place === "boundary") return null
      if (place === "inside") count++
    }
  }
  return count
}

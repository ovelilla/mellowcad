import { Vec2 } from "./Vec2"
import { Vec3, cross3, length3, normalize3, scale3, sub3 } from "./Vec3"
import { axesToWorld } from "./ocs"
import { Param, parameters, surfaceFrame } from "./faceDomains"
import { UV, faceRegion, regionContains } from "./faceRegions"
import { curveBox } from "./planarCurves"
import { pointInFaces } from "./planarRegions"
import { Brep, BrepFace, planarFace } from "./solids"

/**
 * What a shaded visual style paints of a solid (docs/next-solids.md §2): its
 * faces cut into triangles, derived from the B-rep and never kept as the
 * solid. A face is a grid over its parameters — a planar one over its plane,
 * a curved one over `(u, v)` — whose cells inside the face are kept and
 * whose cells across its edge are halved until {@link MESH_DEPTH}: the
 * edges drawn over the faces cover what is left of the steps.
 */

export interface MeshTriangle {
  readonly a: Vec3
  readonly b: Vec3
  readonly c: Vec3
  /** The face's outward unit normal at the triangle's middle: the exact surface's, so a curved face shades smoothly. */
  readonly normal: Vec3
}

/** Cells per turn of an angle: 11.25°, about AutoCAD's own faceting at FACETRES 0.5. */
const CELLS_PER_TURN = 32

/** Cells along a straight parameter, a profile, and each way across a plane's box. */
const CELLS_LINEAR = 6
const CELLS_PROFILE = 16
const CELLS_PLANE = 8

/** Halvings of a cell across a face's edge. */
const MESH_DEPTH = 3

const meshes = new WeakMap<Brep, readonly MeshTriangle[]>()

/** The solid's faces as triangles, made once per B-rep. */
export function brepMesh(brep: Brep): readonly MeshTriangle[] {
  const found = meshes.get(brep)
  if (found) return found
  const out: MeshTriangle[] = []
  for (const face of brep.faces) out.push(...faceMesh(brep, face))
  meshes.set(brep, out)
  return out
}

/** A rectangle of a face's parameters, its corners as `(x, y)`. */
interface Cell {
  readonly x0: number
  readonly y0: number
  readonly x1: number
  readonly y1: number
}

/**
 * The cells of `[x0, x1] × [y0, y1]`, `nx` by `ny`, inside the face by
 * `inside`: whole where every corner and the middle are, halved where they
 * disagree, kept at the last halving where the middle is.
 */
function insideCells(
  x0: number,
  x1: number,
  y0: number,
  y1: number,
  nx: number,
  ny: number,
  inside: (x: number, y: number) => boolean
): Cell[] {
  const out: Cell[] = []
  // A corner is read a little inside its cell: a box face's lie on its
  // edges, where `inside` does not answer (within the model's tolerance).
  const visit = (cell: Cell, depth: number) => {
    const xm = (cell.x0 + cell.x1) / 2
    const ym = (cell.y0 + cell.y1) / 2
    const hx = (cell.x1 - cell.x0) * 1e-3
    const hy = (cell.y1 - cell.y0) * 1e-3
    const flags = [
      inside(cell.x0 + hx, cell.y0 + hy),
      inside(cell.x1 - hx, cell.y0 + hy),
      inside(cell.x1 - hx, cell.y1 - hy),
      inside(cell.x0 + hx, cell.y1 - hy),
      inside(xm, ym),
    ]
    if (flags.every(Boolean)) {
      out.push(cell)
      return
    }
    if (depth >= MESH_DEPTH) {
      if (flags[4]) out.push(cell)
      return
    }
    if (!flags.some(Boolean) && depth > 0) return
    for (const [a, b] of [
      [cell.x0, xm],
      [xm, cell.x1],
    ]) {
      for (const [c, d] of [
        [cell.y0, ym],
        [ym, cell.y1],
      ]) {
        visit({ x0: a, y0: c, x1: b, y1: d }, depth + 1)
      }
    }
  }
  for (let i = 0; i < nx; i++) {
    for (let j = 0; j < ny; j++) {
      visit(
        {
          x0: x0 + ((x1 - x0) * i) / nx,
          x1: x0 + ((x1 - x0) * (i + 1)) / nx,
          y0: y0 + ((y1 - y0) * j) / ny,
          y1: y0 + ((y1 - y0) * (j + 1)) / ny,
        },
        0
      )
    }
  }
  return out
}

/** A cell's two triangles, run so that `(b − a) × (c − a)` faces out where `flip` is false. */
function cellTriangles(
  at: (x: number, y: number) => Vec3,
  cell: Cell,
  normal: Vec3,
  flip: boolean
): MeshTriangle[] {
  const p00 = at(cell.x0, cell.y0)
  const p10 = at(cell.x1, cell.y0)
  const p11 = at(cell.x1, cell.y1)
  const p01 = at(cell.x0, cell.y1)
  return flip
    ? [
        { a: p00, b: p11, c: p10, normal },
        { a: p00, b: p01, c: p11, normal },
      ]
    : [
        { a: p00, b: p10, c: p11, normal },
        { a: p00, b: p11, c: p01, normal },
      ]
}

function cellsAlong(param: Param, span: number): number {
  if (param === "angle") {
    return Math.max(
      1,
      Math.ceil((Math.abs(span) * CELLS_PER_TURN) / (2 * Math.PI))
    )
  }
  return param === "linear" ? CELLS_LINEAR : CELLS_PROFILE
}

export function faceMesh(brep: Brep, face: BrepFace): MeshTriangle[] {
  const s = face.surface
  if (s.kind === "plane") {
    const flat = planarFace(brep, face)
    const boxes = flat.face.loops.flat().map(curveBox)
    if (boxes.length === 0) return []
    const x0 = Math.min(...boxes.map((b) => b.min.x))
    const x1 = Math.max(...boxes.map((b) => b.max.x))
    const y0 = Math.min(...boxes.map((b) => b.min.y))
    const y1 = Math.max(...boxes.map((b) => b.max.y))
    const size = Math.max(x1 - x0, y1 - y0)
    if (!(size > 0)) return []
    const nx = Math.max(1, Math.round((CELLS_PLANE * (x1 - x0)) / size))
    const ny = Math.max(1, Math.round((CELLS_PLANE * (y1 - y0)) / size))
    const at = (x: number, y: number) =>
      axesToWorld(flat.axes, { x, y, z: flat.elevation })
    const inside = (x: number, y: number) =>
      pointInFaces({ x, y } as Vec2, [flat.face])
    return insideCells(x0, x1, y0, y1, nx, ny, inside).flatMap((cell) =>
      cellTriangles(at, cell, s.normal, false)
    )
  }
  const region = faceRegion(brep, face)
  if (!region) return []
  const { u, v } = region.domain
  const u0 = Math.min(u[0], u[1])
  const u1 = Math.max(u[0], u[1])
  const v0 = Math.min(v[0], v[1])
  const v1 = Math.max(v[0], v[1])
  const [pu, pv] = parameters(s)
  const at = (x: number, y: number) => surfaceFrame(s, x, y).p
  const inside = (x: number, y: number) =>
    regionContains(region, { u: x, v: y } as UV)
  const out: MeshTriangle[] = []
  for (const cell of insideCells(
    u0,
    u1,
    v0,
    v1,
    cellsAlong(pu, u1 - u0),
    cellsAlong(pv, v1 - v0),
    inside
  )) {
    const xm = (cell.x0 + cell.x1) / 2
    const ym = (cell.y0 + cell.y1) / 2
    const { du, dv } = surfaceFrame(s, xm, ym)
    const n = normalize3(scale3(cross3(du, dv), region.sense))
    // At a pole the derivatives vanish: the cell's own diagonals tell.
    const normal = n ??
      normalize3(
        scale3(
          cross3(
            sub3(at(cell.x1, cell.y1), at(cell.x0, cell.y0)),
            sub3(at(cell.x0, cell.y1), at(cell.x1, cell.y0))
          ),
          region.sense
        )
      ) ?? { x: 0, y: 0, z: 1 }
    out.push(...cellTriangles(at, cell, normal, region.sense < 0))
  }
  return out
}

/** The area of the triangles: what a test holds against the face's exact area. */
export function meshArea(triangles: readonly MeshTriangle[]): number {
  let sum = 0
  for (const t of triangles) {
    sum += length3(cross3(sub3(t.b, t.a), sub3(t.c, t.a))) / 2
  }
  return sum
}

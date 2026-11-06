import { Vec2 } from "./Vec2"
import { Vec3, cross3, dot3, normalize3, scale3, sub3 } from "./Vec3"
import { axesToWorld } from "./ocs"
import { Param, parameters, surfaceFrame } from "./faceDomains"
import { UV, faceRegion, regionContains } from "./faceRegions"
import { Box2, curveBox, curveTessellation } from "./planarCurves"
import { RegionFace, pointInFaces, regionBoolean } from "./planarRegions"
import { Brep, BrepFace, planarFace } from "./solids"

/**
 * What a shaded visual style paints of a solid (docs/next-solids.md §2): its
 * faces cut into cells, derived from the B-rep and never kept as the solid. A
 * face is a grid over its parameters — a planar one over its plane, a curved
 * one over `(u, v)` — whose cells across an edge are halved until
 * {@link MESH_DEPTH}. A plane's last halving is cut to the face exactly, so
 * a round edge is never stepped; a curved face's is kept where its middle is
 * inside, and the edges drawn over the faces cover what is left of the
 * steps.
 */

export interface MeshCell {
  /**
   * Its outline, counter-clockwise about {@link normal}, then the holes an
   * edge leaves in it (a plane's cell round a bolt hole), clockwise.
   */
  readonly loops: readonly (readonly Vec3[])[]
  /** The face's outward unit normal at the cell's middle: the exact surface's, so a curved face shades smoothly. */
  readonly normal: Vec3
}

/** Cells per turn of an angle: 11.25°, about AutoCAD's own faceting at FACETRES 0.5. */
const CELLS_PER_TURN = 32

/** Cells along a straight parameter, a profile, and each way across a plane's box. */
const CELLS_LINEAR = 6
const CELLS_PROFILE = 16
const CELLS_PLANE = 4

/** Halvings of a cell across a face's edge. */
const MESH_DEPTH = 3

/**
 * A plane's round edge is cut in chords no further than this share of the
 * face's size from it: well under a pixel at any zoom the face fills.
 */
const PLANE_CHORD = 2e-4

const meshes = new WeakMap<Brep, readonly MeshCell[]>()

/** The solid's faces as cells, made once per B-rep. */
export function brepMesh(brep: Brep): readonly MeshCell[] {
  const found = meshes.get(brep)
  if (found) return found
  const out: MeshCell[] = []
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

function gridCells(
  x0: number,
  x1: number,
  y0: number,
  y1: number,
  nx: number,
  ny: number
): Cell[] {
  const out: Cell[] = []
  for (let i = 0; i < nx; i++) {
    for (let j = 0; j < ny; j++) {
      out.push({
        x0: x0 + ((x1 - x0) * i) / nx,
        x1: x0 + ((x1 - x0) * (i + 1)) / nx,
        y0: y0 + ((y1 - y0) * j) / ny,
        y1: y0 + ((y1 - y0) * (j + 1)) / ny,
      })
    }
  }
  return out
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
  for (const cell of gridCells(x0, x1, y0, y1, nx, ny)) visit(cell, 0)
  return out
}

/** A cell's corners, run so that it turns counter-clockwise about the normal where `flip` is false. */
function cellLoop(
  at: (x: number, y: number) => Vec3,
  cell: Cell,
  flip: boolean
): Vec3[] {
  const loop = [
    at(cell.x0, cell.y0),
    at(cell.x1, cell.y0),
    at(cell.x1, cell.y1),
    at(cell.x0, cell.y1),
  ]
  return flip ? loop.reverse() : loop
}

function cellFace(cell: Cell): RegionFace {
  const corners: Vec2[] = [
    { x: cell.x0, y: cell.y0 },
    { x: cell.x1, y: cell.y0 },
    { x: cell.x1, y: cell.y1 },
    { x: cell.x0, y: cell.y1 },
  ]
  return {
    loops: [
      corners.map((start, i) => ({
        kind: "line" as const,
        start,
        end: corners[(i + 1) % 4],
      })),
    ],
  }
}

/** A segment of a face's edge, in chords, with its box. */
interface Chord {
  readonly a: Vec2
  readonly b: Vec2
  readonly box: Box2
}

/**
 * Whether the chord runs through the cell's open interior: one lying along
 * the cell's side (a box face's edge on the grid's line) does not, so a cell
 * is cut only where an edge truly crosses it (Liang–Barsky).
 */
function crosses(chord: Chord, cell: Cell, eps: number): boolean {
  const x0 = cell.x0 + eps
  const x1 = cell.x1 - eps
  const y0 = cell.y0 + eps
  const y1 = cell.y1 - eps
  const { box } = chord
  if (box.max.x <= x0 || box.min.x >= x1) return false
  if (box.max.y <= y0 || box.min.y >= y1) return false
  const dx = chord.b.x - chord.a.x
  const dy = chord.b.y - chord.a.y
  let t0 = 0
  let t1 = 1
  for (const [p, q] of [
    [-dx, chord.a.x - x0],
    [dx, x1 - chord.a.x],
    [-dy, chord.a.y - y0],
    [dy, y1 - chord.a.y],
  ]) {
    if (p === 0) {
      if (q <= 0) return false
      continue
    }
    const r = q / p
    if (p < 0) t0 = Math.max(t0, r)
    else t1 = Math.min(t1, r)
    if (t0 >= t1) return false
  }
  return true
}

/**
 * A planar face's cells: whole where no edge crosses them, halved where one
 * does until {@link MESH_DEPTH} — small cells along the edges keep the
 * painter's order local, as a curved face's do — and the last halving cut to
 * the face exactly: the face and the cell intersected as regions, each
 * piece's loops in chords.
 */
function planeCells(brep: Brep, face: BrepFace, normal: Vec3): MeshCell[] {
  const flat = planarFace(brep, face)
  const curves = flat.face.loops.flat()
  if (curves.length === 0) return []
  const boxes = curves.map(curveBox)
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
  const tolerance = size * PLANE_CHORD
  const eps = size * 1e-9
  const chords: Chord[] = curves.flatMap((curve) => {
    const { points } = curveTessellation(curve, tolerance)
    return points.slice(1).map((b, i) => {
      const a = points[i]
      return {
        a,
        b,
        box: {
          min: { x: Math.min(a.x, b.x), y: Math.min(a.y, b.y) },
          max: { x: Math.max(a.x, b.x), y: Math.max(a.y, b.y) },
        },
      }
    })
  })
  const out: MeshCell[] = []
  const visit = (cell: Cell, near: readonly Chord[], depth: number) => {
    const crossing = near.filter((chord) => crosses(chord, cell, eps))
    if (crossing.length === 0) {
      // No edge through it: the cell is all in or all out.
      const middle = { x: (cell.x0 + cell.x1) / 2, y: (cell.y0 + cell.y1) / 2 }
      if (pointInFaces(middle, [flat.face])) {
        out.push({ loops: [cellLoop(at, cell, false)], normal })
      }
      return
    }
    if (depth < MESH_DEPTH) {
      const xm = (cell.x0 + cell.x1) / 2
      const ym = (cell.y0 + cell.y1) / 2
      for (const [a, b] of [
        [cell.x0, xm],
        [xm, cell.x1],
      ]) {
        for (const [c, d] of [
          [cell.y0, ym],
          [ym, cell.y1],
        ]) {
          visit({ x0: a, y0: c, x1: b, y1: d }, crossing, depth + 1)
        }
      }
      return
    }
    for (const piece of regionBoolean(
      "intersect",
      [flat.face],
      [cellFace(cell)]
    )) {
      out.push({
        loops: piece.loops.map((loop) =>
          loop.flatMap((curve) =>
            // Each curve's end is the next one's start: drop it.
            curveTessellation(curve, tolerance)
              .points.slice(0, -1)
              .map((p) => at(p.x, p.y))
          )
        ),
        normal,
      })
    }
  }
  for (const cell of gridCells(x0, x1, y0, y1, nx, ny)) visit(cell, chords, 0)
  return out
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

export function faceMesh(brep: Brep, face: BrepFace): MeshCell[] {
  const s = face.surface
  if (s.kind === "plane") return planeCells(brep, face, s.normal)
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
  const out: MeshCell[] = []
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
    out.push({ loops: [cellLoop(at, cell, region.sense < 0)], normal })
  }
  return out
}

/** Twice a loop's area vector (Newell's), so its sense about a normal is its sign. */
export function loopAreaVector(loop: readonly Vec3[]): Vec3 {
  let x = 0
  let y = 0
  let z = 0
  for (let i = 0; i < loop.length; i++) {
    const a = loop[i]
    const b = loop[(i + 1) % loop.length]
    x += (a.y - b.y) * (a.z + b.z)
    y += (a.z - b.z) * (a.x + b.x)
    z += (a.x - b.x) * (a.y + b.y)
  }
  return { x, y, z }
}

/** The cells' area, holes taken out: what a test holds against the face's exact area. */
export function meshArea(cells: readonly MeshCell[]): number {
  let sum = 0
  for (const cell of cells) {
    for (const loop of cell.loops) {
      sum += dot3(loopAreaVector(loop), cell.normal) / 2
    }
  }
  return sum
}

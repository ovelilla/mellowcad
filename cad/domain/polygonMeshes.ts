import { Vec2 } from "../geometry/Vec2"
import { Vec3 } from "../geometry/Vec3"
import { closestPointOnSegment } from "../geometry/primitives"
import {
  BSplineCurve,
  bsplineDomain,
  bsplinePoint,
  clampedUniformCurve,
} from "../geometry/nurbs"
import { splineFitCurve } from "../geometry/splineFit"
import { PolygonMeshEntity, PolygonMeshSmoothing } from "./entityTypes"

/** The mesh a polygon mesh shows: `rows` by `cols` points, row by row. */
export interface PolygonMeshGrid {
  readonly rows: number
  readonly cols: number
  readonly points: readonly Vec3[]
  readonly closedM: boolean
  readonly closedN: boolean
}

const grids = new WeakMap<PolygonMeshEntity, PolygonMeshGrid>()

/**
 * What it draws, picks, snaps to, explodes and shows its grips on: its own
 * vertices, or, smoothed, the fitted mesh (mesh/p13: AutoCAD's grips, END,
 * MID and NEA and EXPLODE's faces are the fitted mesh's, never the control
 * mesh's).
 */
export function polygonMeshGrid(mesh: PolygonMeshEntity): PolygonMeshGrid {
  const known = grids.get(mesh)
  if (known) return known
  const { m, n, closedM, closedN } = mesh
  const grid: PolygonMeshGrid = mesh.smooth
    ? {
        ...fittedGrid(
          mesh,
          mesh.smooth.kind,
          mesh.smooth.mDensity,
          mesh.smooth.nDensity
        ),
        closedM,
        closedN,
      }
    : { rows: m, cols: n, points: mesh.vertices, closedM, closedN }
  grids.set(mesh, grid)
  return grid
}

/**
 * The surface PEDIT's Smooth surface lays on the control mesh (mesh/s5–s9):
 * along each direction the curve PEDIT's Spline lays on a frame — SURFTYPE 5
 * or 6's uniform B-spline, clamped to an open frame's ends, periodic round a
 * closed one from where its first span begins — or 8's single Bezier,
 * sampled at `count` equal steps of its parameter, an open one's ends
 * included (`(P₀ + 4P₁ + P₂) / 6` the first of a closed cubic, s9). A tensor
 * product: each row's curve sampled, then a curve through each column of
 * those samples, which is the same surface since its points are linear in
 * the control points.
 */
function fittedGrid(
  mesh: PolygonMeshEntity,
  kind: PolygonMeshSmoothing,
  rows: number,
  cols: number
): { rows: number; cols: number; points: Vec3[] } {
  const { m, n, vertices, closedM, closedN } = mesh
  const across: Vec3[][] = []
  for (let i = 0; i < m; i++) {
    across.push(samples(vertices.slice(i * n, i * n + n), closedN, kind, cols))
  }
  const columns: Vec3[][] = []
  for (let j = 0; j < cols; j++) {
    columns.push(
      samples(
        across.map((row) => row[j]),
        closedM,
        kind,
        rows
      )
    )
  }
  const points: Vec3[] = []
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) points.push(columns[j][i])
  }
  return { rows, cols, points }
}

function samples(
  frame: readonly Vec3[],
  closed: boolean,
  kind: PolygonMeshSmoothing,
  count: number
): Vec3[] {
  const curve = smoothingCurve(frame, closed, kind)
  const { start, end } = bsplineDomain(curve)
  const steps = closed ? count : count - 1
  return Array.from({ length: count }, (_, i) =>
    bsplinePoint(curve, start + ((end - start) * i) / Math.max(steps, 1))
  )
}

function smoothingCurve(
  frame: readonly Vec3[],
  closed: boolean,
  kind: PolygonMeshSmoothing
): BSplineCurve {
  if (kind !== 8) return splineFitCurve(frame, closed, kind === 5 ? 2 : 3)
  // WHY a closed direction's Bezier runs back to its first vertex:
  // unverified, the probes' Bezier meshes being open (mesh/s8).
  const points = closed ? [...frame, frame[0]] : frame
  return clampedUniformCurve(points, points.length - 1)
}

/**
 * Why PEDIT's Smooth surface refuses a mesh (21583, 21587): too few control
 * vertices in a direction for its B-spline, more than two for a quadratic
 * and three for a cubic (mesh/p18, p19: `either` when both lack them), or
 * more than eleven in one for a Bezier (p18).
 */
export type PolygonMeshSmoothRefusal =
  | { readonly tooFew: "M" | "N" | "either"; readonly needs: 2 | 3 }
  | { readonly tooMany: true }

/** Under 2, SURFU and SURFV are taken as 2 (21595, 21596: mesh/p21). */
export const MIN_SURFACE_DENSITY = 2

/**
 * `mesh` smoothed by `kind` at SURFU and SURFV: SURFU + 1 points along an
 * open M, SURFU round a closed one (mesh/s6, s9, p17), likewise SURFV along
 * N; or why it cannot be.
 */
export function polygonMeshSmoothed(
  mesh: PolygonMeshEntity,
  kind: PolygonMeshSmoothing,
  surfU: number,
  surfV: number
): PolygonMeshEntity | PolygonMeshSmoothRefusal {
  if (kind === 8) {
    if (mesh.m > 11 || mesh.n > 11) return { tooMany: true }
  } else {
    const needs = kind === 5 ? 2 : 3
    const shortM = mesh.m <= needs
    const shortN = mesh.n <= needs
    if (shortM || shortN) {
      return {
        tooFew: shortM && shortN ? "either" : shortM ? "M" : "N",
        needs,
      }
    }
  }
  const u = Math.max(surfU, MIN_SURFACE_DENSITY)
  const v = Math.max(surfV, MIN_SURFACE_DENSITY)
  return {
    ...mesh,
    smooth: {
      kind,
      mDensity: mesh.closedM ? u : u + 1,
      nDensity: mesh.closedN ? v : v + 1,
    },
  }
}

/** SURFU's 200 plus the end, a fitted mesh's most points in a direction (mesh/p17). */
export const MAX_SURFACE_DENSITY = 201

/**
 * Whether a mesh of `m` by `n` may wear `smooth` as a file gives it: what
 * Smooth surface takes, densities from 2 to 201. A reader drops one that
 * may not, or its fitted mesh would read past its vertices.
 */
export function isValidMeshSmoothing(
  m: number,
  n: number,
  smooth: { kind: number; mDensity: number; nDensity: number }
): boolean {
  const { kind, mDensity, nDensity } = smooth
  const density = (d: number) =>
    Number.isInteger(d) && d >= MIN_SURFACE_DENSITY && d <= MAX_SURFACE_DENSITY
  if (!density(mDensity) || !density(nDensity)) return false
  if (kind === 8) return m <= 11 && n <= 11
  if (kind === 5) return m > 2 && n > 2
  if (kind === 6) return m > 3 && n > 3
  return false
}

export function isPolygonMeshRefusal(
  result: PolygonMeshEntity | PolygonMeshSmoothRefusal
): result is PolygonMeshSmoothRefusal {
  return !("type" in result)
}

/** PEDIT's Desmooth: the control mesh again. */
export function polygonMeshDesmoothed(
  mesh: PolygonMeshEntity
): PolygonMeshEntity {
  const { smooth, ...rest } = mesh
  void smooth
  return rest
}

/** The point of the shown mesh at row `i`, column `j`, wrapping round a closed direction. */
function gridPoint(grid: PolygonMeshGrid, i: number, j: number): Vec3 {
  return grid.points[(i % grid.rows) * grid.cols + (j % grid.cols)]
}

/**
 * The shown mesh's edges: each row's run along N, then each column's along
 * M, round a closed direction back to its first; one of no length left out.
 */
export function polygonMeshEdges(mesh: PolygonMeshEntity): [Vec3, Vec3][] {
  const grid = polygonMeshGrid(mesh)
  const { rows, cols } = grid
  const edges: [Vec3, Vec3][] = []
  const add = (a: Vec3, b: Vec3) => {
    if (a.x === b.x && a.y === b.y && a.z === b.z) return
    edges.push([a, b])
  }
  const alongN = grid.closedN && cols > 2 ? cols : cols - 1
  const alongM = grid.closedM && rows > 2 ? rows : rows - 1
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < alongN; j++) {
      add(gridPoint(grid, i, j), gridPoint(grid, i, j + 1))
    }
  }
  for (let j = 0; j < cols; j++) {
    for (let i = 0; i < alongM; i++) {
      add(gridPoint(grid, i, j), gridPoint(grid, i + 1, j))
    }
  }
  return edges
}

/**
 * The 3D faces EXPLODE makes of it, one per cell of the shown mesh, row by
 * row, each from its corner (i, j) to (i, j + 1), (i + 1, j + 1) and
 * (i + 1, j) (mesh/p03), a closed direction's cells round to the first row or
 * column too (p14: 16 of a 4 × 4 closed both ways; p13: 12 of a fitted 5 × 4).
 */
export function polygonMeshFaces(
  mesh: PolygonMeshEntity
): [Vec3, Vec3, Vec3, Vec3][] {
  const grid = polygonMeshGrid(mesh)
  const { rows, cols } = grid
  const alongN = grid.closedN && cols > 2 ? cols : cols - 1
  const alongM = grid.closedM && rows > 2 ? rows : rows - 1
  const faces: [Vec3, Vec3, Vec3, Vec3][] = []
  for (let i = 0; i < alongM; i++) {
    for (let j = 0; j < alongN; j++) {
      faces.push([
        gridPoint(grid, i, j),
        gridPoint(grid, i, j + 1),
        gridPoint(grid, i + 1, j + 1),
        gridPoint(grid, i + 1, j),
      ])
    }
  }
  return faces
}

/** The point of its shown edges nearest `point` in plan, at that edge's height. */
export function closestPointOnPolygonMesh(
  mesh: PolygonMeshEntity,
  point: Vec2
): Vec3 {
  let best: Vec3 = polygonMeshGrid(mesh).points[0]
  let bestDistance = Infinity
  for (const [a, b] of polygonMeshEdges(mesh)) {
    const hit = closestPointOnSegment(a, b, point)
    if (hit.distance >= bestDistance) continue
    bestDistance = hit.distance
    best = { ...hit.point, z: a.z + hit.t * (b.z - a.z) }
  }
  return best
}

/**
 * A reflected polygon mesh as AutoCAD's MIRROR leaves it (mesh/p05, p15):
 * each row's vertices in the reverse order, the rows as they were.
 */
export function polygonMeshReflected(
  mesh: PolygonMeshEntity
): PolygonMeshEntity {
  const vertices: Vec3[] = []
  for (let i = 0; i < mesh.m; i++) {
    vertices.push(
      ...mesh.vertices.slice(i * mesh.n, i * mesh.n + mesh.n).reverse()
    )
  }
  return { ...mesh, vertices }
}

/** Its vertices mapped one by one, smoothing kept (its fitted mesh follows an affine map). */
export function mapPolygonMesh(
  mesh: PolygonMeshEntity,
  f: (v: Vec3) => Vec3
): PolygonMeshEntity {
  return { ...mesh, vertices: mesh.vertices.map((v) => f(v)) }
}

/** {@link mapPolygonMesh} with each vertex's index. */
export function mapPolygonMeshAt(
  mesh: PolygonMeshEntity,
  f: (v: Vec3, index: number) => Vec3
): PolygonMeshEntity {
  return { ...mesh, vertices: mesh.vertices.map(f) }
}

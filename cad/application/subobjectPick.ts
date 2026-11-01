import { Vec2 } from "../geometry/Vec2"
import { Vec3, sub3, length3 } from "../geometry/Vec3"
import { closestPointOnSegment } from "../geometry/primitives"
import { edgeTrace } from "../geometry/brepCurves"
import { facesAlong, pointShown } from "../geometry/hiddenLines"
import { brepBox } from "../geometry/solids"
import { Solid3dEntity } from "../domain/entityTypes"
import { SubobjectRef } from "../domain/solidSubobjects"
import { Viewport } from "./Viewport"
import { PICK_BOX_PX } from "./SceneBuilder"

/** Samples an edge is drawn by on the screen to find how near the cursor runs. */
const EDGE_SAMPLES = 48

/** A subobject under the cursor, and how near it is: pixels for a vertex or an edge, depth for a face. */
interface Candidate {
  readonly ref: SubobjectRef
  readonly rank: number
}

/**
 * The faces, edges and vertices of the solids under `screen`, in the order a
 * Ctrl+click takes them and Ctrl+Space walks them: a vertex within the pick
 * box, then an edge, then each face the line of sight crosses, nearest the
 * viewer first (desktop: a vertex over its edges, an edge over the face it
 * bounds, the box's top before its back). `shaded` is a visual style that
 * hides lines (Hidden, Conceptual): an edge or a vertex a face hides there is
 * not drawn, so not found; in 2D Wireframe every one is.
 */
export function subobjectsAt(
  solids: readonly Solid3dEntity[],
  viewport: Viewport,
  screen: Vec2,
  shaded: boolean
): SubobjectRef[] {
  const shown = shaded
    ? pointShown(
        solids.map((s) => s.brep),
        viewport.direction
      )
    : null
  const visible = (p: Vec3) => !shown || shown(p)
  const vertices: Candidate[] = []
  const edges: Candidate[] = []
  const faces: Candidate[] = []
  const sight = viewport.screenToFacing(screen)
  for (const solid of solids) {
    const { brep, id } = solid
    if (!underBox(brep, viewport, screen)) continue
    brep.vertices.forEach((p, index) => {
      const at = viewport.worldToScreen(p)
      const d = Math.hypot(at.x - screen.x, at.y - screen.y)
      if (d <= PICK_BOX_PX && visible(p)) {
        vertices.push({ ref: { id, kind: "vertex", index }, rank: d })
      }
    })
    brep.edges.forEach((edge, index) => {
      if (edge.curve.kind === "point") return
      const near = edgeNear(brep, edge, viewport, screen)
      if (near && near.distance <= PICK_BOX_PX && visible(near.point)) {
        edges.push({ ref: { id, kind: "edge", index }, rank: near.distance })
      }
    })
    for (const { face, depth } of facesAlong(brep, sight, viewport.direction)) {
      faces.push({ ref: { id, kind: "face", index: face }, rank: -depth })
    }
  }
  const order = (list: Candidate[]) =>
    list.sort((a, b) => a.rank - b.rank).map((c) => c.ref)
  return [...order(vertices), ...order(edges), ...order(faces)]
}

/** The edge's point drawn nearest the cursor, and how many pixels off. */
function edgeNear(
  brep: Solid3dEntity["brep"],
  edge: Solid3dEntity["brep"]["edges"][number],
  viewport: Viewport,
  screen: Vec2
): { point: Vec3; distance: number } | null {
  const trace = edgeTrace(brep, edge)
  if (!(trace.t1 > trace.t0)) return null
  const points: Vec3[] = []
  for (let i = 0; i <= EDGE_SAMPLES; i++) {
    points.push(
      trace.point(trace.t0 + ((trace.t1 - trace.t0) * i) / EDGE_SAMPLES)
    )
  }
  // An edge seen end on is one point on the screen.
  if (length3(sub3(points[EDGE_SAMPLES], points[0])) === 0 && !trace.angular) {
    return null
  }
  let best: { point: Vec3; distance: number } | null = null
  let previous = viewport.worldToScreen(points[0])
  for (let i = 1; i <= EDGE_SAMPLES; i++) {
    const next = viewport.worldToScreen(points[i])
    const hit = closestPointOnSegment(previous, next, screen)
    if (!best || hit.distance < best.distance) {
      const a = points[i - 1]
      const b = points[i]
      best = {
        point: {
          x: a.x + (b.x - a.x) * hit.t,
          y: a.y + (b.y - a.y) * hit.t,
          z: a.z + (b.z - a.z) * hit.t,
        },
        distance: hit.distance,
      }
    }
    previous = next
  }
  return best
}

/** Whether the cursor lies within the pick box of the solid's box as drawn: most solids it is not near. */
function underBox(
  brep: Solid3dEntity["brep"],
  viewport: Viewport,
  screen: Vec2
): boolean {
  const box = brepBox(brep)
  if (!box) return false
  let x0 = Infinity
  let y0 = Infinity
  let x1 = -Infinity
  let y1 = -Infinity
  for (const x of [box.min.x, box.max.x]) {
    for (const y of [box.min.y, box.max.y]) {
      for (const z of [box.min.z, box.max.z]) {
        const at = viewport.worldToScreen({ x, y, z })
        x0 = Math.min(x0, at.x)
        y0 = Math.min(y0, at.y)
        x1 = Math.max(x1, at.x)
        y1 = Math.max(y1, at.y)
      }
    }
  }
  return (
    screen.x >= x0 - PICK_BOX_PX &&
    screen.x <= x1 + PICK_BOX_PX &&
    screen.y >= y0 - PICK_BOX_PX &&
    screen.y <= y1 + PICK_BOX_PX
  )
}

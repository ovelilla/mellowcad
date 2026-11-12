import { Vec2 } from "../geometry/Vec2"
import type { PolylineEntity, Solid2dEntity } from "./entityTypes"

type Corners = Solid2dEntity["corners"]

/**
 * The 2D solid's outline as it is drawn: corners 1, 2, 4, 3 (solid2d/d02).
 * Picked round the outline, the corners cross into a bow tie; a triangle's
 * last two are one point.
 */
export function solid2dOutline(solid: Solid2dEntity): readonly Vec2[] {
  const [a, b, c, d] = solid.corners
  return [a, b, d, c]
}

/** Its four edges, closing the outline: 1–2, 2–4, 4–3, 3–1, a triangle's 4–3 of no length. */
export function solid2dEdges(
  solid: Solid2dEntity
): readonly (readonly [Vec2, Vec2])[] {
  const ring = solid2dOutline(solid)
  return ring.map((p, i) => [p, ring[(i + 1) % ring.length]] as const)
}

/**
 * Whether `point` lies in what the solid fills: the outline by the even-odd
 * rule, so a bow tie is its two triangles and not the gap beside their
 * crossing (solid2d/p10).
 */
export function pointInsideSolid2d(solid: Solid2dEntity, point: Vec2): boolean {
  let inside = false
  const ring = solid2dOutline(solid)
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i]
    const b = ring[(i + 1) % ring.length]
    if (a.y > point.y !== b.y > point.y) {
      const x = a.x + ((point.y - a.y) / (b.y - a.y)) * (b.x - a.x)
      if (x > point.x) inside = !inside
    }
  }
  return inside
}

/** The solid with its corners mapped by `map`, nothing else changed. */
export function mapSolid2dCorners(
  solid: Solid2dEntity,
  map: (corner: Vec2) => Vec2
): Solid2dEntity {
  const [a, b, c, d] = solid.corners
  const corners: Corners = [map(a), map(b), map(c), map(d)]
  return { ...solid, corners }
}

/** The solid with corner `index` (0 to 3, the order picked) at `point`. */
export function withSolid2dCorner(
  solid: Solid2dEntity,
  index: number,
  point: Vec2
): Solid2dEntity {
  const at = (i: number): Vec2 =>
    i === index ? { x: point.x, y: point.y } : solid.corners[i]
  const corners: Corners = [at(0), at(1), at(2), at(3)]
  return { ...solid, corners }
}

/**
 * The solid as the closed polyline of its outline, of its id, plane and
 * thickness: what a pick measures with FILLMODE off, when AutoCAD finds it
 * by its edges alone (solid2d/p10).
 */
export function solid2dOutlinePolyline(solid: Solid2dEntity): PolylineEntity {
  const { corners, ...rest } = solid
  void corners
  return {
    ...rest,
    type: "polyline",
    vertices: solid2dOutline(solid),
    closed: true,
  }
}

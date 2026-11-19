import { Vec2 } from "../geometry/Vec2"
import type { PolylineEntity, WipeoutEntity } from "./entityTypes"

/** Its edges, closing back to the first vertex. */
export function wipeoutEdges(
  wipeout: WipeoutEntity
): readonly (readonly [Vec2, Vec2])[] {
  const ring = wipeout.vertices
  return ring.map((p, i) => [p, ring[(i + 1) % ring.length]] as const)
}

/**
 * Whether `point` lies in what the wipeout masks, by the even-odd rule its
 * fill follows: a pick inside it takes it (wipeout/w07, `ssget` at its middle;
 * w10, TRIM `Cannot TRIM this object.` there).
 */
export function pointInsideWipeout(
  wipeout: WipeoutEntity,
  point: Vec2
): boolean {
  let inside = false
  for (const [a, b] of wipeoutEdges(wipeout)) {
    if (a.y > point.y !== b.y > point.y) {
      const x = a.x + ((point.y - a.y) / (b.y - a.y)) * (b.x - a.x)
      if (x > point.x) inside = !inside
    }
  }
  return inside
}

/** The wipeout with its vertices mapped by `map`, in the same order, nothing else changed. */
export function mapWipeoutVertices(
  wipeout: WipeoutEntity,
  map: (vertex: Vec2) => Vec2
): WipeoutEntity {
  return { ...wipeout, vertices: wipeout.vertices.map(map) }
}

/** The wipeout with vertex `index` at `point`. */
export function withWipeoutVertex(
  wipeout: WipeoutEntity,
  index: number,
  point: Vec2
): WipeoutEntity {
  const vertices = wipeout.vertices.map((v, i) =>
    i === index ? { x: point.x, y: point.y } : v
  )
  return { ...wipeout, vertices }
}

/**
 * The wipeout as the closed polyline of its frame, of its id, plane and
 * overrides: what the queries that read a closed outline measure.
 */
export function wipeoutOutlinePolyline(wipeout: WipeoutEntity): PolylineEntity {
  const { vertices, ...rest } = wipeout
  return { ...rest, type: "polyline", vertices, closed: true }
}

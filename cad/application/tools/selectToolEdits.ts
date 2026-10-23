import { Vec2, V } from "../../geometry/Vec2"
import { planar } from "../../geometry/Vec3"
import {
  arcFrom3Points,
  ellipseParamFromAngle,
} from "../../geometry/primitives"
import {
  ArcEntity,
  arcEndPoint,
  arcStartPoint,
  createArc,
  createCircle,
  carryOverrides,
  DimensionEntity,
  EllipseEntity,
  Entity,
  MTextEntity,
  mtextAlign,
  mtextFromWorld,
  mtextLayout,
  mtextToWorld,
  PolylineEntity,
  ellipseRotation,
  ellipseSemiMajor,
  ellipseSemiMinor,
  ellipseWithAxes,
  ellipseWithSpan,
  splineWithPoint,
  stretchPolylineVertices,
} from "../../domain/entities"
import type { BlockLookup, InsertEntity } from "../../domain/entities"
import { arrayPlacement } from "../../domain/arrayEdits"
import {
  ArrayEditRole,
  DimensionPoint,
  EllipseGripRole,
} from "./selectToolState"
import { dragArrayGrip, typedArrayGrip } from "./arrayGrips"

/**
 * The object with its `index`th vertex grip moved to `point`: a polyline's
 * vertex, the arcs beside it bent through their old midpoints, or a spline's
 * fit point or control vertex (whichever it was made with). `null` for
 * anything else.
 */
export function withVertexAt(
  entity: Entity,
  index: number,
  point: Vec2
): Entity | null {
  if (entity.type === "polyline") {
    return stretchPolylineVertices(entity, new Map([[index, point]]))
  }
  if (entity.type === "spline") return splineWithPoint(entity, index, point)
  return null
}

/**
 * `poly` with segment `segmentIndex` moved by `delta`, both its ends: its
 * midpoint grip's Stretch (desktop pline/d09).
 */
export function withSegmentStretched(
  poly: PolylineEntity,
  segmentIndex: number,
  delta: Vec2
): PolylineEntity {
  const n = poly.vertices.length
  const ends = [segmentIndex, (segmentIndex + 1) % n]
  return stretchPolylineVertices(
    poly,
    new Map(ends.map((i) => [i, V.add(poly.vertices[i], delta)]))
  )
}

/**
 * The sides of a multiline text's box that carry a width grip: those that
 * move when the width changes — the right one, the left one for right-aligned
 * text, whose right edge is pinned to its attachment point, and both for a
 * centred one (desktop text/d03-1: arrows on both sides of an MC text).
 */
export function mtextWidthSides(
  mtext: MTextEntity
): readonly ("left" | "right")[] {
  switch (mtextAlign(mtext.attachment)) {
    case "left":
      return ["right"]
    case "right":
      return ["left"]
    case "center":
      return ["left", "right"]
  }
}

/** Where a multiline text's width grip on `side` sits: the top of that edge. */
export function mtextWidthGrip(
  mtext: MTextEntity,
  side: "left" | "right"
): Vec2 {
  const { x0, x1, y1 } = mtextLayout(mtext)
  return mtextToWorld(mtext, side === "left" ? x0 : x1, y1)
}

/**
 * The width that puts the moving edge of `mtext`'s box through `point`: a
 * centred text's either edge, the other moving with it about the attachment.
 */
export function mtextWidthThrough(mtext: MTextEntity, point: Vec2): number {
  const x = mtextFromWorld(mtext, point).x
  switch (mtextAlign(mtext.attachment)) {
    case "left":
      return Math.max(x, 0)
    case "right":
      return Math.max(-x, 0)
    case "center":
      return 2 * Math.abs(x)
  }
}

/**
 * The dimension with one definition point dragged to `point`. Moving an
 * extension-line origin restates what is measured; moving the dimension line
 * slides the whole assembly, which is what its midpoint grip is for.
 */
export function movedDimension(
  dim: DimensionEntity,
  state: { readonly point: DimensionPoint; readonly origin: Vec2 },
  point: Vec2
): DimensionEntity {
  const at = planar(point)
  switch (state.point) {
    case "first":
      return { ...dim, first: at }
    case "second":
      return { ...dim, second: at }
    case "vertex":
      return { ...dim, vertex: at }
    case "line":
      // An angular dimension's arc passes through its location, so the grip
      // sets it outright — which is also how dragging across a ray gives the
      // reflex angle. Every other kind slides its line by the drag instead,
      // because only the location's projection is drawn.
      return dim.kind === "angular"
        ? { ...dim, linePoint: at }
        : {
            ...dim,
            linePoint: V.add(dim.linePoint, V.sub(point, state.origin)),
          }
  }
}

/** The point on a circle of `radius` about `center` in the direction of `p`. */
export function radiusHandle(center: Vec2, p: Vec2, radius: number): Vec2 {
  const dir = V.sub(p, center)
  const len = V.length(dir)
  if (len < 1e-9) return { x: center.x + radius, y: center.y }
  return V.add(center, V.scale(dir, radius / len))
}

/**
 * An arc stretched by its middle grip: through its start, `point` and its
 * end, stored counter-clockwise (desktop arc/d08); `null` when the three lie
 * on one line, which leaves the arc as it was.
 */
export function arcStretchedThrough(
  arc: ArcEntity,
  point: Vec2
): ArcEntity | null {
  const through = arcFrom3Points(
    arcStartPoint(arc),
    planar(point),
    arcEndPoint(arc)
  )
  if (!through) return null
  return carryOverrides(
    arc,
    createArc(
      through.center,
      through.radius,
      through.startAngle,
      through.endAngle,
      arc.layerId,
      arc.id
    )
  )
}

/**
 * `ellipse` with one of its grips dragged to `point` (desktop ellipse/d07): a
 * quadrant sets its half-axis to the point's distance from the centre, that
 * axis's direction and the other half-axis kept, the longer staying major
 * (d07-3, d07-4); an elliptical arc's end goes to the point's heading from
 * the centre, measured as its angles are, the ellipse kept (d07-7). `null`
 * on the centre, or with an end brought round onto the other.
 */
export function ellipseGripped(
  ellipse: EllipseEntity,
  role: EllipseGripRole,
  point: Vec2
): EllipseEntity | null {
  const offset = V.sub(planar(point), ellipse.center)
  const reach = V.length(offset)
  if (reach < 1e-9) return null
  if (role.kind === "ellipseAxis") {
    return role.quadrant % 2 === 0
      ? ellipseWithAxes(
          ellipse,
          V.scale(V.normalize(ellipse.majorAxis), reach),
          ellipseSemiMinor(ellipse) / reach
        )
      : ellipseWithAxes(
          ellipse,
          ellipse.majorAxis,
          reach / ellipseSemiMajor(ellipse)
        )
  }
  const { startParam, endParam } = ellipse
  if (startParam === undefined || endParam === undefined) return null
  const param = ellipseParamFromAngle(
    ellipse.ratio,
    Math.atan2(offset.y, offset.x) - ellipseRotation(ellipse)
  )
  const arc =
    role.end === "start"
      ? ellipseWithSpan(ellipse, param, endParam)
      : ellipseWithSpan(ellipse, startParam, param)
  return arc.startParam === undefined ? null : arc
}

/** A copy of a circle or arc with a new radius (preserving id); else `null`. */
export function withRadius(entity: Entity, radius: number): Entity | null {
  if (entity.type === "circle") {
    return carryOverrides(
      entity,
      createCircle(entity.center, radius, entity.layerId, entity.id)
    )
  }
  if (entity.type === "arc") {
    return carryOverrides(
      entity,
      createArc(
        entity.center,
        radius,
        entity.startAngle,
        entity.endAngle,
        entity.layerId,
        entity.id
      )
    )
  }
  return null
}

export function toDegrees(radians: number): number {
  return (radians * 180) / Math.PI
}

/**
 * The array its grip dragged to `cursor` makes: one function for the preview
 * and the commit, null where the drag is refused.
 */
export function arrayGripped(
  insert: InsertEntity,
  role: ArrayEditRole,
  cursor: Vec2,
  blocks: BlockLookup
): InsertEntity | null {
  if (!insert.array) return null
  const array = dragArrayGrip(
    insert.array,
    arrayPlacement(insert, blocks(insert.blockId)),
    role,
    planar(cursor)
  )
  return array && { ...insert, array }
}

/** The array a value typed while its grip is hot makes, null where refused. */
export function arrayGripTyped(
  insert: InsertEntity,
  role: ArrayEditRole,
  value: number,
  blocks: BlockLookup
): InsertEntity | null {
  if (!insert.array) return null
  const array = typedArrayGrip(
    insert.array,
    arrayPlacement(insert, blocks(insert.blockId)),
    role,
    value
  )
  return array && { ...insert, array }
}

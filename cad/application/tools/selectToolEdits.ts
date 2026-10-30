import { Vec2, V } from "../../geometry/Vec2"
import { Vec3, planar } from "../../geometry/Vec3"
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
  dimensionAxisAngle,
  dimensionVertex,
  dimensionWithTextAt,
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
  entityPointToWorld,
  splineOnItsPlane,
  splineWithPoint,
  stretchPolylineVertices,
  worldToEntity,
  createPolyline,
  HatchEntity,
  hatchLoopSegments,
  PolylineSegmentGeometry,
  polylineSegmentGeometries,
  setPolylineBulge,
  rotatePoint,
  replacePolyline3dVertex,
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
  point: Vec2 | Vec3
): Entity | null {
  if (entity.type === "polyline3d") {
    // The point's Z, as a line's grabbed end takes it; a typed distance,
    // which has none, keeps the vertex's own.
    const at = entity.vertices[index]
    if (!at) return null
    return replacePolyline3dVertex(entity, index, {
      x: point.x,
      y: point.y,
      z: "z" in point ? point.z : at.z,
    })
  }
  if (entity.type === "polyline") {
    return stretchPolylineVertices(entity, new Map([[index, point]]))
  }
  if (entity.type === "hatch") {
    return withLoopEdited(entity, index, (loop, at) =>
      stretchPolylineVertices(loop, new Map([[at, point]]))
    )
  }
  if (entity.type === "spline") {
    // Its point holds its Z, as a 3D polyline's vertex: it goes to the point
    // given, Z and all, a typed distance's at its own; given in the drawing,
    // read in the spline's coordinates, which can then lie in another plane.
    const at = entity.points[index]
    if (!at) return null
    const own = entityPointToWorld(entity, at)
    const target = { x: point.x, y: point.y, z: "z" in point ? point.z : own.z }
    return splineOnItsPlane(
      splineWithPoint(entity, index, worldToEntity(entity, target))
    )
  }
  return null
}

/**
 * The object with segment `segmentIndex` moved by `delta`, both its ends: a
 * polyline's or a hatch loop's midpoint grip's Stretch (desktop pline/d09,
 * hatch/d03-4). `null` for anything else.
 */
export function withSegmentStretched(
  entity: Entity,
  segmentIndex: number,
  delta: Vec2
): Entity | null {
  const stretch = (poly: PolylineEntity, index: number) => {
    const ends = [index, (index + 1) % poly.vertices.length]
    return stretchPolylineVertices(
      poly,
      new Map(ends.map((i) => [i, V.add(poly.vertices[i], delta)]))
    )
  }
  if (entity.type === "polyline") return stretch(entity, segmentIndex)
  if (entity.type === "hatch") {
    return withLoopEdited(entity, segmentIndex, stretch)
  }
  return null
}

/** The object with segment `segmentIndex` bent to `bulge` (its arc grip). */
export function withSegmentBulge(
  entity: Entity,
  segmentIndex: number,
  bulge: number
): Entity | null {
  if (entity.type === "polyline") {
    return setPolylineBulge(entity, segmentIndex, bulge)
  }
  if (entity.type === "hatch") {
    return withLoopEdited(entity, segmentIndex, (loop, at) =>
      setPolylineBulge(loop, at, bulge)
    )
  }
  return null
}

/**
 * The segments whose midpoints carry grips: a polyline's, or a hatch's loops'
 * one after another, so a grip's index runs on from loop to loop.
 */
export function gripSegments(entity: Entity): PolylineSegmentGeometry[] {
  if (entity.type === "polyline") return polylineSegmentGeometries(entity)
  if (entity.type === "hatch") return entity.loops.flatMap(hatchLoopSegments)
  return []
}

/**
 * `hatch` with the loop holding its `index`th vertex (or segment, the same
 * count on a closed loop), counted loop after loop, edited as the closed
 * polyline it is shaped like: a hatch's boundary grips are a polyline's
 * (desktop hatch/d03-3, d03-4).
 */
function withLoopEdited(
  hatch: HatchEntity,
  index: number,
  edit: (loop: PolylineEntity, at: number) => PolylineEntity
): HatchEntity | null {
  let at = index
  const which = hatch.loops.findIndex((loop) => {
    if (at < loop.vertices.length) return true
    at -= loop.vertices.length
    return false
  })
  if (which < 0 || at < 0) return null
  const loop = hatch.loops[which]
  const edited = edit(
    createPolyline(loop.vertices, true, hatch.layerId, loop.bulges, LOOP_ID),
    at
  )
  return {
    ...hatch,
    loops: hatch.loops.map((other, i) =>
      i === which
        ? {
            vertices: edited.vertices.map(planar),
            ...(edited.bulges ? { bulges: edited.bulges.slice() } : {}),
          }
        : other
    ),
  }
}

/** The id a hatch loop takes while edited as a polyline: never minted. */
const LOOP_ID = "hatch-loop"

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
 * The dimension with one of its grips dragged to `point` (desktop d01-1,
 * d03-1). An origin or vertex restates what is measured. A dimension line's
 * end moves the line through the point, a moved text keeping its place along
 * it. The text grip's drag is Move with Dim Line, the default of its hover
 * menu (`dimensionWithTextAt`). A diameter's rim grips turn its line about the
 * centre.
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
      return dim.kind === "angular"
        ? angularArcMoved(dim, at)
        : lineMoved(dim, V.sub(point, state.origin))
    case "text":
      return dimensionWithTextAt(dim, at)
    case "rim": {
      const turn =
        Math.atan2(at.y - dim.first.y, at.x - dim.first.x) -
        Math.atan2(state.origin.y - dim.first.y, state.origin.x - dim.first.x)
      return {
        ...dim,
        second: rotatePoint(dim.second, dim.first, turn),
        linePoint: rotatePoint(dim.linePoint, dim.first, turn),
      }
    }
  }
}

/** A diameter's rim point opposite its `second`, across the centre. */
export function diameterFarRim(dim: DimensionEntity): Vec2 {
  return V.sub(V.scale(dim.first, 2), dim.second)
}

/**
 * A linear or aligned dimension's line slid by `delta`: only its move across
 * the line counts, and a moved text goes with it at its place along the line.
 */
function lineMoved(dim: DimensionEntity, delta: Vec2): DimensionEntity {
  const angle = dimensionAxisAngle(dim)
  const normal = { x: -Math.sin(angle), y: Math.cos(angle) }
  const across = V.scale(normal, V.dot(delta, normal))
  return {
    ...dim,
    linePoint: V.add(dim.linePoint, delta),
    ...(dim.textPoint ? { textPoint: V.add(dim.textPoint, across) } : {}),
  }
}

/**
 * An angular dimension's arc put through `at`, which sets its location
 * outright — which is also how dragging across a ray gives the reflex angle. A
 * moved text keeps its bearing and its distance off the arc.
 */
function angularArcMoved(dim: DimensionEntity, at: Vec2): DimensionEntity {
  const vertex = dimensionVertex(dim)
  if (!dim.textPoint) return { ...dim, linePoint: at }
  const grown = V.distance(vertex, at) - V.distance(vertex, dim.linePoint)
  const out = V.sub(dim.textPoint, vertex)
  const reach = V.length(out)
  return {
    ...dim,
    linePoint: at,
    textPoint:
      reach < 1e-9
        ? dim.textPoint
        : V.add(vertex, V.scale(out, Math.max(reach + grown, 0) / reach)),
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

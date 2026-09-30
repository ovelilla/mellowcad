import { Vec2, V } from "../geometry/Vec2"
import {
  ClosestResult,
  angleWithinSweep,
  closestPointOnArc,
  closestPointOnEllipse,
  closestPointOnSegment,
  closestPointOnCircle,
  normalizeAngle,
  polarPoint,
  segmentArcIntersection,
  segmentSegmentIntersection,
  segmentCircleIntersection,
} from "../geometry/primitives"
import {
  TextEntity,
  MTextEntity,
  DimensionEntity,
  BlockLookup,
  Entity,
  Bounds,
} from "./entityTypes"
import { insertFlatGeometry } from "./blocks"
import { attributeDefinitionText } from "./attributes"
import { hatchLoopSegments, hatchLoopRing, pointInsideHatch } from "./hatch"
import {
  textWidth,
  textCorners,
  horizontalExtent,
  verticalExtent,
} from "./text"
import { mtextCorners, mtextFromWorld, mtextLayout } from "./mtext"
import { DimensionGeometry, dimensionGeometry } from "./dimensions"
import { ellipseBounds, ellipseSegments } from "./ellipses"
import { closestPointOnSpline, splineBounds, splinePolyline } from "./splines"
import { polylineSegmentGeometries } from "./polylines"
import { arcStartPoint, arcEndPoint } from "./entityMeasures"

/** A box outline as four segments, for hit-testing and crossing tests. */
function boxEdges(c: Vec2[]): [Vec2, Vec2][] {
  return [
    [c[0], c[1]],
    [c[1], c[2]],
    [c[2], c[3]],
    [c[3], c[0]],
  ]
}

/** A filled box is picked anywhere inside it, not only on its outline. */
function closestOnBox(
  corners: Vec2[],
  inside: boolean,
  fallback: Vec2,
  point: Vec2
): ClosestResult {
  let best: ClosestResult = { point: fallback, distance: Infinity, t: 0 }
  for (const [a, b] of boxEdges(corners)) {
    const candidate = closestPointOnSegment(a, b, point)
    if (candidate.distance < best.distance) best = candidate
  }
  return inside ? { ...best, distance: 0 } : best
}

function pointInsideMText(mtext: MTextEntity, point: Vec2): boolean {
  const { x0, x1, y0, y1 } = mtextLayout(mtext)
  const local = mtextFromWorld(mtext, point)
  return local.x >= x0 && local.x <= x1 && local.y >= y0 && local.y <= y1
}

function cornersBounds(corners: Vec2[]): Bounds {
  return {
    min: {
      x: Math.min(...corners.map((c) => c.x)),
      y: Math.min(...corners.map((c) => c.y)),
    },
    max: {
      x: Math.max(...corners.map((c) => c.x)),
      y: Math.max(...corners.map((c) => c.y)),
    },
  }
}

/** Whether a world point falls within the text's box (its rotation undone). */
function pointInsideText(text: TextEntity, point: Vec2): boolean {
  const cos = Math.cos(-text.rotation)
  const sin = Math.sin(-text.rotation)
  const dx = point.x - text.position.x
  const dy = point.y - text.position.y
  const x = dx * cos - dy * sin
  const y = dx * sin + dy * cos
  const [x0, x1] = horizontalExtent(text.justify, textWidth(text))
  const [y0, y1] = verticalExtent(text.justify, text.height)
  return x >= x0 && x <= x1 && y >= y0 && y <= y1
}

/**
 * The dimension's line work as segments, for hit-testing and bounds. A curved
 * dimension line is sampled: its chord would run straight through the vertex,
 * which is where a wide angular dimension is emphatically not drawn.
 */
function dimensionSegments(g: DimensionGeometry): [Vec2, Vec2][] {
  const runs: [Vec2, Vec2][] = g.lines.map((line) => [line[0], line[1]])
  if (!g.arc) {
    runs.push([g.lineStart, g.lineEnd])
    return runs
  }
  const { center, radius, startAngle } = g.arc
  const sweep = normalizeAngle(g.arc.endAngle - startAngle)
  let previous = g.lineStart
  for (let i = 1; i <= ARC_SAMPLES; i++) {
    const point = polarPoint(
      center,
      radius,
      startAngle + (sweep * i) / ARC_SAMPLES
    )
    runs.push([previous, point])
    previous = point
  }
  return runs
}

/** How finely a curved dimension line is sampled for picking and bounds. */
const ARC_SAMPLES = 16

function dimensionEdges(dim: DimensionEntity): [Vec2, Vec2][] {
  return dimensionSegments(dimensionGeometry(dim))
}

/**
 * Shortest distance (world units) from a point to an entity's outline.
 * Used for click hit-testing.
 */
export function distanceToEntity(
  entity: Entity,
  point: Vec2,
  blocks?: BlockLookup
): number {
  return closestOnEntity(entity, point, blocks).distance
}

/**
 * The point on an entity's outline nearest `point`. A block reference is
 * measured against the geometry it draws, which is why `blocks` is needed to
 * reach inside one; without it a reference answers with its insertion point,
 * the one thing about it that is knowable on its own.
 */
export function closestOnEntity(
  entity: Entity,
  point: Vec2,
  blocks?: BlockLookup
): ClosestResult {
  switch (entity.type) {
    case "line":
      return closestPointOnSegment(entity.start, entity.end, point)
    case "circle":
      return closestPointOnCircle(entity.center, entity.radius, point)
    case "arc":
      return closestPointOnArc(
        entity.center,
        entity.radius,
        entity.startAngle,
        entity.endAngle,
        point
      )
    case "ellipse":
      // An ellipse is an outline, not an area: it is picked on the curve, so a
      // click in the middle of one selects nothing — as in AutoCAD.
      return closestPointOnEllipse(
        entity.center,
        entity.majorAxis,
        entity.ratio,
        point,
        entity.startParam,
        entity.endParam
      )
    case "spline":
      // An outline like the ellipse, even when closed.
      return closestPointOnSpline(entity, point)
    case "polyline": {
      let best: ClosestResult = {
        point: entity.vertices[0] ?? point,
        distance: Infinity,
        t: 0,
      }
      for (const seg of polylineSegmentGeometries(entity)) {
        const candidate =
          seg.kind === "line"
            ? closestPointOnSegment(seg.a, seg.b, point)
            : closestPointOnArc(
                seg.center,
                seg.radius,
                seg.startAngle,
                seg.endAngle,
                point
              )
        if (candidate.distance < best.distance) best = candidate
      }
      return best
    }
    case "text":
      // Text is picked by its box, filled rather than hollow: clicking on the
      // lettering itself must select it, the way AutoCAD picks an annotation.
      return closestOnBox(
        textCorners(entity),
        pointInsideText(entity, point),
        entity.position,
        point
      )
    case "mtext":
      return closestOnBox(
        mtextCorners(entity),
        pointInsideMText(entity, point),
        entity.position,
        point
      )
    case "attdef":
      return closestOnEntity(attributeDefinitionText(entity), point)
    case "dimension": {
      // Picked by its line work, the way you grab a dimension in AutoCAD; the
      // text is not part of the pick target.
      let best: ClosestResult = {
        point: entity.linePoint,
        distance: Infinity,
        t: 0,
      }
      for (const [a, b] of dimensionEdges(entity)) {
        const candidate = closestPointOnSegment(a, b, point)
        if (candidate.distance < best.distance) best = candidate
      }
      return best
    }
    case "hatch": {
      // A hatch is an area, so it picks solid: clicking anywhere in the fill
      // selects it, not only along the boundary it was traced from.
      let best: ClosestResult = {
        point: entity.loops[0]?.vertices[0] ?? point,
        distance: Infinity,
        t: 0,
      }
      for (const loop of entity.loops) {
        for (const seg of hatchLoopSegments(loop)) {
          const candidate =
            seg.kind === "line"
              ? closestPointOnSegment(seg.a, seg.b, point)
              : closestPointOnArc(
                  seg.center,
                  seg.radius,
                  seg.startAngle,
                  seg.endAngle,
                  point
                )
          if (candidate.distance < best.distance) best = candidate
        }
      }
      return pointInsideHatch(entity, point) ? { ...best, distance: 0 } : best
    }
    case "insert": {
      let best: ClosestResult = {
        point: entity.position,
        distance: V.distance(entity.position, point),
        t: 0,
      }
      if (!blocks) return best
      for (const nested of insertFlatGeometry(entity, blocks)) {
        const candidate = closestOnEntity(nested, point, blocks)
        if (candidate.distance < best.distance) best = candidate
      }
      return best
    }
  }
}

export function entityBounds(entity: Entity, blocks?: BlockLookup): Bounds {
  switch (entity.type) {
    case "line":
      return {
        min: {
          x: Math.min(entity.start.x, entity.end.x),
          y: Math.min(entity.start.y, entity.end.y),
        },
        max: {
          x: Math.max(entity.start.x, entity.end.x),
          y: Math.max(entity.start.y, entity.end.y),
        },
      }
    case "circle":
      return {
        min: {
          x: entity.center.x - entity.radius,
          y: entity.center.y - entity.radius,
        },
        max: {
          x: entity.center.x + entity.radius,
          y: entity.center.y + entity.radius,
        },
      }
    case "arc": {
      // The extent is spanned by the two endpoints plus any cardinal point
      // (0/90/180/270°) the sweep actually passes through.
      const points = [arcStartPoint(entity), arcEndPoint(entity)]
      for (const angle of [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2]) {
        if (angleWithinSweep(entity.startAngle, entity.endAngle, angle)) {
          points.push(polarPoint(entity.center, entity.radius, angle))
        }
      }
      let minX = Infinity
      let minY = Infinity
      let maxX = -Infinity
      let maxY = -Infinity
      for (const p of points) {
        minX = Math.min(minX, p.x)
        minY = Math.min(minY, p.y)
        maxX = Math.max(maxX, p.x)
        maxY = Math.max(maxY, p.y)
      }
      return { min: { x: minX, y: minY }, max: { x: maxX, y: maxY } }
    }
    case "ellipse":
      return ellipseBounds(entity)
    case "spline":
      return splineBounds(entity)
    case "polyline": {
      let minX = Infinity
      let minY = Infinity
      let maxX = -Infinity
      let maxY = -Infinity
      const include = (p: Vec2) => {
        minX = Math.min(minX, p.x)
        minY = Math.min(minY, p.y)
        maxX = Math.max(maxX, p.x)
        maxY = Math.max(maxY, p.y)
      }
      for (const seg of polylineSegmentGeometries(entity)) {
        include(seg.a)
        include(seg.b)
        if (seg.kind === "arc") {
          // An arc can bulge past its endpoints, so include any cardinal point
          // (0/90/180/270°) the sweep actually reaches.
          for (const angle of [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2]) {
            if (angleWithinSweep(seg.startAngle, seg.endAngle, angle)) {
              include(polarPoint(seg.center, seg.radius, angle))
            }
          }
        }
      }
      if (minX === Infinity) for (const v of entity.vertices) include(v)
      return { min: { x: minX, y: minY }, max: { x: maxX, y: maxY } }
    }
    case "text":
      return cornersBounds(textCorners(entity))
    case "mtext":
      return cornersBounds(mtextCorners(entity))
    case "attdef":
      return cornersBounds(textCorners(attributeDefinitionText(entity)))
    case "dimension": {
      const g = dimensionGeometry(entity)
      const points = [
        entity.first,
        entity.second,
        ...dimensionSegments(g).flat(),
        g.textPosition,
      ]
      return {
        min: {
          x: Math.min(...points.map((p) => p.x)),
          y: Math.min(...points.map((p) => p.y)),
        },
        max: {
          x: Math.max(...points.map((p) => p.x)),
          y: Math.max(...points.map((p) => p.y)),
        },
      }
    }
    case "hatch": {
      let minX = Infinity
      let minY = Infinity
      let maxX = -Infinity
      let maxY = -Infinity
      for (const loop of entity.loops) {
        // The chopped ring already contains the points an arc bulges out to.
        for (const p of hatchLoopRing(loop)) {
          minX = Math.min(minX, p.x)
          minY = Math.min(minY, p.y)
          maxX = Math.max(maxX, p.x)
          maxY = Math.max(maxY, p.y)
        }
      }
      if (minX === Infinity) {
        return { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } }
      }
      return { min: { x: minX, y: minY }, max: { x: maxX, y: maxY } }
    }
    case "insert": {
      const nested = blocks ? insertFlatGeometry(entity, blocks) : []
      return (
        entitiesBounds(nested, blocks) ?? {
          min: entity.position,
          max: entity.position,
        }
      )
    }
  }
}

/**
 * Where an entity sits in the paint order: lower is drawn first, and therefore
 * further back. Only hatches move — HPDRAWORDER's initial value is 3, "send
 * behind boundary", so a fill never paints over the outline it was traced from
 * and a click on that outline picks the outline. There is no per-object draw
 * order here, so "behind its boundary" is approximated by "behind everything",
 * which is the same thing for every drawing a single hatch appears in.
 */
export function entityDrawOrder(entity: Entity): number {
  return entity.type === "hatch" ? 0 : 1
}

/** The combined extent of several entities, or `null` when there are none. */
export function entitiesBounds(
  entities: Iterable<Entity>,
  blocks?: BlockLookup
): Bounds | null {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const entity of entities) {
    const bounds = entityBounds(entity, blocks)
    minX = Math.min(minX, bounds.min.x)
    minY = Math.min(minY, bounds.min.y)
    maxX = Math.max(maxX, bounds.max.x)
    maxY = Math.max(maxY, bounds.max.y)
  }
  if (minX === Infinity) return null
  return { min: { x: minX, y: minY }, max: { x: maxX, y: maxY } }
}

function pointInRect(p: Vec2, min: Vec2, max: Vec2): boolean {
  return p.x >= min.x && p.x <= max.x && p.y >= min.y && p.y <= max.y
}

function rectEdges(min: Vec2, max: Vec2): [Vec2, Vec2][] {
  const tl = { x: min.x, y: max.y }
  const tr = { x: max.x, y: max.y }
  const br = { x: max.x, y: min.y }
  const bl = { x: min.x, y: min.y }
  return [
    [tl, tr],
    [tr, br],
    [br, bl],
    [bl, tl],
  ]
}

/**
 * True when the entire entity lies within the axis-aligned rectangle
 * `min`..`max`. This is AutoCAD's *window* selection rule (drag left→right):
 * only fully-enclosed objects match.
 */
export function entityWithinRect(
  entity: Entity,
  min: Vec2,
  max: Vec2,
  blocks?: BlockLookup
): boolean {
  const b = entityBounds(entity, blocks)
  return (
    b.min.x >= min.x && b.min.y >= min.y && b.max.x <= max.x && b.max.y <= max.y
  )
}

/**
 * True when the entity's outline crosses the boundary of the rectangle
 * `min`..`max` (i.e. it is partially inside). Combined with
 * {@link entityWithinRect} this yields AutoCAD's *crossing* selection rule
 * (drag right→left): objects inside or touching the box match.
 */
export function entityCrossesRect(
  entity: Entity,
  min: Vec2,
  max: Vec2,
  blocks?: BlockLookup
): boolean {
  const edges = rectEdges(min, max)
  switch (entity.type) {
    case "line": {
      if (pointInRect(entity.start, min, max)) return true
      if (pointInRect(entity.end, min, max)) return true
      for (const [e1, e2] of edges) {
        if (segmentSegmentIntersection(entity.start, entity.end, e1, e2)) {
          return true
        }
      }
      return false
    }
    case "circle": {
      for (const [e1, e2] of edges) {
        if (
          segmentCircleIntersection(e1, e2, entity.center, entity.radius)
            .length > 0
        ) {
          return true
        }
      }
      return false
    }
    case "arc": {
      if (pointInRect(arcStartPoint(entity), min, max)) return true
      if (pointInRect(arcEndPoint(entity), min, max)) return true
      for (const [e1, e2] of edges) {
        if (
          segmentArcIntersection(
            e1,
            e2,
            entity.center,
            entity.radius,
            entity.startAngle,
            entity.endAngle
          ).length > 0
        ) {
          return true
        }
      }
      return false
    }
    case "ellipse": {
      for (const [a, b] of ellipseSegments(entity)) {
        if (pointInRect(a, min, max)) return true
        for (const [e1, e2] of edges) {
          if (segmentSegmentIntersection(a, b, e1, e2)) return true
        }
      }
      return false
    }
    case "spline": {
      const points = splinePolyline(entity)
      for (let i = 0; i < points.length; i++) {
        if (pointInRect(points[i], min, max)) return true
        if (i === 0) continue
        for (const [e1, e2] of edges) {
          if (segmentSegmentIntersection(points[i - 1], points[i], e1, e2)) {
            return true
          }
        }
      }
      return false
    }
    case "polyline": {
      for (const v of entity.vertices) {
        if (pointInRect(v, min, max)) return true
      }
      for (const seg of polylineSegmentGeometries(entity)) {
        for (const [e1, e2] of edges) {
          if (seg.kind === "line") {
            if (segmentSegmentIntersection(seg.a, seg.b, e1, e2)) return true
          } else if (
            segmentArcIntersection(
              e1,
              e2,
              seg.center,
              seg.radius,
              seg.startAngle,
              seg.endAngle
            ).length > 0
          ) {
            return true
          }
        }
      }
      return false
    }
    case "text":
    case "mtext":
    case "attdef": {
      const corners =
        entity.type === "text"
          ? textCorners(entity)
          : entity.type === "mtext"
            ? mtextCorners(entity)
            : textCorners(attributeDefinitionText(entity))
      for (const [a, b] of boxEdges(corners)) {
        if (pointInRect(a, min, max)) return true
        for (const [e1, e2] of edges) {
          if (segmentSegmentIntersection(a, b, e1, e2)) return true
        }
      }
      return false
    }
    case "dimension": {
      for (const [a, b] of dimensionEdges(entity)) {
        if (pointInRect(a, min, max) || pointInRect(b, min, max)) return true
        for (const [e1, e2] of edges) {
          if (segmentSegmentIntersection(a, b, e1, e2)) return true
        }
      }
      return false
    }
    case "hatch": {
      // A box drawn wholly inside the fill still crosses it: the hatch is the
      // area, not just its outline.
      for (const corner of [min, max, { x: min.x, y: max.y }]) {
        if (pointInsideHatch(entity, corner)) return true
      }
      for (const loop of entity.loops) {
        const ring = hatchLoopRing(loop)
        for (let i = 0; i < ring.length; i++) {
          const a = ring[i]
          const b = ring[(i + 1) % ring.length]
          if (pointInRect(a, min, max)) return true
          for (const [e1, e2] of edges) {
            if (segmentSegmentIntersection(a, b, e1, e2)) return true
          }
        }
      }
      return false
    }
    case "insert": {
      if (pointInRect(entity.position, min, max)) return true
      if (!blocks) return false
      for (const nested of insertFlatGeometry(entity, blocks)) {
        if (entityCrossesRect(nested, min, max, blocks)) return true
      }
      return false
    }
  }
}

import { V, Vec2 } from "../../geometry/Vec2"
import { Vec3, withZ, withZOf } from "../../geometry/Vec3"
import {
  angleWithinSweep,
  circleCircleIntersection,
  closestPointOnArc,
  closestPointOnCircle,
  closestPointOnInfiniteLine,
  closestPointOnSegment,
  infiniteLineIntersection,
  normalizeAngle,
  polarPoint,
  segmentArcIntersection,
  segmentCircleIntersection,
  segmentSegmentIntersection,
  tangentPointsFromPoint,
} from "../../geometry/primitives"
import {
  arcEndPoint,
  arcMidpoint,
  arcStartPoint,
  closestOnEntity,
  dimensionGeometry,
  ellipseEndPoint,
  ellipseQuadrantPoints,
  ellipseStartPoint,
  entityZAt,
  insertAttributePoints,
  isFullEllipse,
  lineMidpoint,
  polylineSegmentGeometries,
  splineEndPoint,
  splineMidpoint,
  splinePolyline,
  splineStartPoint,
  Entity,
  EntityId,
} from "../../domain/entities"
import {
  ConstructionGeometry,
  SnapCandidate,
  SnapContext,
  SnapProvider,
  SnapType,
} from "./types"

/**
 * Built-in snap providers. Each is a small, self-contained object so the set of
 * active snaps can be composed freely by the SnapEngine.
 *
 * **Hatches are deliberately absent from every provider.** OSOPTIONS ships at
 * 7, whose first bit reads "Object snaps ignore hatch objects" — and the
 * boundary a hatch was traced from is still there to snap to.
 */

/** A point on `entity` in plan, at the object's height there. */
function on(entity: Entity, point: Vec2): Vec3 {
  return withZ(point, entityZAt(entity, point))
}

/** Endpoint is the primary snap (highest priority). */
export const endpointProvider: SnapProvider = {
  type: SnapType.Endpoint,
  collect({ document, entities }: SnapContext): SnapCandidate[] {
    const candidates: SnapCandidate[] = []
    for (const entity of entities) {
      if (!document.isEntityVisible(entity)) continue
      if (entity.type === "line") {
        candidates.push({
          type: SnapType.Endpoint,
          point: on(entity, entity.start),
          sourceIds: [entity.id],
        })
        candidates.push({
          type: SnapType.Endpoint,
          point: on(entity, entity.end),
          sourceIds: [entity.id],
        })
      } else if (entity.type === "arc") {
        candidates.push({
          type: SnapType.Endpoint,
          point: on(entity, arcStartPoint(entity)),
          sourceIds: [entity.id],
        })
        candidates.push({
          type: SnapType.Endpoint,
          point: on(entity, arcEndPoint(entity)),
          sourceIds: [entity.id],
        })
      } else if (entity.type === "ellipse") {
        // Only an elliptical arc has ends; a whole ellipse closes on itself.
        if (isFullEllipse(entity)) continue
        candidates.push({
          type: SnapType.Endpoint,
          point: on(entity, ellipseStartPoint(entity)),
          sourceIds: [entity.id],
        })
        candidates.push({
          type: SnapType.Endpoint,
          point: on(entity, ellipseEndPoint(entity)),
          sourceIds: [entity.id],
        })
      } else if (entity.type === "spline") {
        // A closed spline's start is where it closes, and AutoCAD snaps there.
        candidates.push({
          type: SnapType.Endpoint,
          point: on(entity, splineStartPoint(entity)),
          sourceIds: [entity.id],
        })
        if (!entity.closed) {
          candidates.push({
            type: SnapType.Endpoint,
            point: on(entity, splineEndPoint(entity)),
            sourceIds: [entity.id],
          })
        }
      } else if (entity.type === "polyline") {
        for (const vertex of entity.vertices) {
          candidates.push({
            type: SnapType.Endpoint,
            point: on(entity, vertex),
            sourceIds: [entity.id],
          })
        }
      } else if (entity.type === "dimension") {
        // A dimension has no geometry of its own to snap along, but its
        // definition points and the ends of its dimension line are the points
        // you chain the next dimension off.
        const g = dimensionGeometry(entity)
        for (const point of [
          entity.first,
          entity.second,
          ...(entity.vertex ? [entity.vertex] : []),
          g.lineStart,
          g.lineEnd,
        ]) {
          candidates.push({
            type: SnapType.Endpoint,
            point: on(entity, point),
            sourceIds: [entity.id],
          })
        }
      }
    }
    return candidates
  },
}

export const midpointProvider: SnapProvider = {
  type: SnapType.Midpoint,
  collect({ document, entities }: SnapContext): SnapCandidate[] {
    const candidates: SnapCandidate[] = []
    for (const entity of entities) {
      if (!document.isEntityVisible(entity)) continue
      if (entity.type === "line") {
        candidates.push({
          type: SnapType.Midpoint,
          point: on(entity, lineMidpoint(entity)),
          sourceIds: [entity.id],
        })
      } else if (entity.type === "arc") {
        candidates.push({
          type: SnapType.Midpoint,
          point: on(entity, arcMidpoint(entity)),
          sourceIds: [entity.id],
        })
      } else if (entity.type === "spline" && !entity.closed) {
        candidates.push({
          type: SnapType.Midpoint,
          point: on(entity, splineMidpoint(entity)),
          sourceIds: [entity.id],
        })
      } else if (entity.type === "polyline") {
        for (const seg of polylineSegmentGeometries(entity)) {
          const point =
            seg.kind === "line"
              ? V.midpoint(seg.a, seg.b)
              : polarPoint(
                  seg.center,
                  seg.radius,
                  seg.startAngle + arcSweep(seg.startAngle, seg.endAngle) / 2
                )
          candidates.push({
            type: SnapType.Midpoint,
            point: on(entity, point),
            sourceIds: [entity.id],
          })
        }
      }
    }
    return candidates
  },
}

export const centerProvider: SnapProvider = {
  type: SnapType.Center,
  collect({ document, entities }: SnapContext): SnapCandidate[] {
    const candidates: SnapCandidate[] = []
    for (const entity of entities) {
      if (!document.isEntityVisible(entity)) continue
      if (
        entity.type === "circle" ||
        entity.type === "arc" ||
        entity.type === "ellipse"
      ) {
        candidates.push({
          type: SnapType.Center,
          point: on(entity, entity.center),
          sourceIds: [entity.id],
        })
      }
    }
    return candidates
  },
}

/**
 * Snaps to the point a text object, an attribute definition or a block
 * reference hangs off — AutoCAD's Insertion osnap. A reference offers its own
 * insertion point and those of the attributes it shows; the rest of what it
 * draws is snapped to by every other provider.
 */
export const insertionProvider: SnapProvider = {
  type: SnapType.Insertion,
  collect({ document }: SnapContext): SnapCandidate[] {
    const candidates: SnapCandidate[] = []
    const display = document.getSettings().attributeDisplay
    for (const entity of document.getEntities()) {
      if (!document.isEntityVisible(entity)) continue
      if (
        entity.type === "text" ||
        entity.type === "mtext" ||
        entity.type === "attdef" ||
        entity.type === "insert"
      ) {
        candidates.push({
          type: SnapType.Insertion,
          point: on(entity, entity.position),
          sourceIds: [entity.id],
        })
      }
      if (entity.type === "insert") {
        const block = document.getBlock(entity.blockId)
        for (const point of insertAttributePoints(entity, block, display)) {
          candidates.push({
            type: SnapType.Insertion,
            point,
            sourceIds: [entity.id],
          })
        }
      }
    }
    return candidates
  },
}

/** Snaps to the 0°/90°/180°/270° cardinal points of a circle, and to the
 * endpoints of an ellipse's axes. */
export const quadrantProvider: SnapProvider = {
  type: SnapType.Quadrant,
  collect({ document, entities }: SnapContext): SnapCandidate[] {
    const candidates: SnapCandidate[] = []
    for (const entity of entities) {
      if (!document.isEntityVisible(entity)) continue
      if (entity.type === "circle") {
        const { center: c, radius: r } = entity
        const points = [
          { x: c.x + r, y: c.y },
          { x: c.x, y: c.y + r },
          { x: c.x - r, y: c.y },
          { x: c.x, y: c.y - r },
        ]
        for (const point of points) {
          candidates.push({
            type: SnapType.Quadrant,
            point: on(entity, point),
            sourceIds: [entity.id],
          })
        }
      } else if (entity.type === "arc") {
        // Only the cardinal points the sweep actually passes through.
        for (const angle of [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2]) {
          if (!angleWithinSweep(entity.startAngle, entity.endAngle, angle)) {
            continue
          }
          candidates.push({
            type: SnapType.Quadrant,
            point: on(entity, polarPoint(entity.center, entity.radius, angle)),
            sourceIds: [entity.id],
          })
        }
      } else if (entity.type === "ellipse") {
        // An ellipse's quadrants are the endpoints of its two axes, not the
        // cardinal directions of the world.
        for (const point of ellipseQuadrantPoints(entity)) {
          candidates.push({
            type: SnapType.Quadrant,
            point: on(entity, point),
            sourceIds: [entity.id],
          })
        }
      }
    }
    return candidates
  },
}

/**
 * Snaps to the point on an entity that is *perpendicular* from the operation's
 * anchor (the line being drawn from, or a grip's fixed end) — AutoCAD's
 * Perpendicular osnap. For a line it is the foot of the perpendicular onto the
 * infinite line (so it engages even past the segment's ends, matching AutoCAD's
 * deferred perpendicular); for a circle the perpendicular runs through the
 * centre, giving the two radial points. Offered only while an anchor exists.
 */
export const perpendicularProvider: SnapProvider = {
  type: SnapType.Perpendicular,
  collect({
    document,
    entities,
    anchor,
    worldCursor,
  }: SnapContext): SnapCandidate[] {
    if (!anchor) return []
    const candidates: SnapCandidate[] = []
    for (const entity of entities) {
      if (!document.isEntityVisible(entity)) continue
      if (entity.type === "line") {
        candidates.push({
          type: SnapType.Perpendicular,
          point: on(
            entity,
            closestPointOnInfiniteLine(entity.start, entity.end, anchor).point
          ),
          // Engage while hovering over the segment, not only near the foot.
          pickDistance: closestPointOnSegment(
            entity.start,
            entity.end,
            worldCursor
          ).distance,
          sourceIds: [entity.id],
        })
      } else if (entity.type === "circle") {
        const radial = V.sub(anchor, entity.center)
        const len = V.length(radial)
        if (len < 1e-9) continue
        const dir = V.scale(radial, 1 / len)
        const toOutline = Math.abs(
          V.distance(worldCursor, entity.center) - entity.radius
        )
        for (const sign of [1, -1]) {
          candidates.push({
            type: SnapType.Perpendicular,
            point: on(
              entity,
              V.add(entity.center, V.scale(dir, entity.radius * sign))
            ),
            pickDistance: toOutline,
            sourceIds: [entity.id],
          })
        }
      }
    }
    return candidates
  },
}

/**
 * Snaps to a point on a circle where a line from the anchor would be *tangent*
 * — AutoCAD's Tangent osnap. Undefined for an anchor inside the circle, so it
 * offers nothing then. Only applies to circles.
 */
export const tangentProvider: SnapProvider = {
  type: SnapType.Tangent,
  collect({
    document,
    entities,
    anchor,
    worldCursor,
  }: SnapContext): SnapCandidate[] {
    if (!anchor) return []
    const candidates: SnapCandidate[] = []
    for (const entity of entities) {
      if (!document.isEntityVisible(entity)) continue
      if (entity.type !== "circle") continue
      const toOutline = Math.abs(
        V.distance(worldCursor, entity.center) - entity.radius
      )
      for (const point of tangentPointsFromPoint(
        anchor,
        entity.center,
        entity.radius
      )) {
        candidates.push({
          type: SnapType.Tangent,
          point: on(entity, point),
          pickDistance: toOutline,
          sourceIds: [entity.id],
        })
      }
    }
    return candidates
  },
}

/**
 * Snaps to a point on the imaginary prolongation of a line, beyond its
 * endpoints — AutoCAD's Extension. Offers the cursor's projection onto the
 * line's infinite line, but only when that projection lies *outside* the
 * segment (past an endpoint); it engages by proximity to that extension line
 * (pickDistance), so the point slides along the prolongation as the cursor
 * moves near it.
 */
export const extensionProvider: SnapProvider = {
  type: SnapType.Extension,
  collect({ document, entities, worldCursor }: SnapContext): SnapCandidate[] {
    const candidates: SnapCandidate[] = []
    for (const entity of entities) {
      if (!document.isEntityVisible(entity)) continue
      if (entity.type !== "line") continue
      const proj = closestPointOnInfiniteLine(
        entity.start,
        entity.end,
        worldCursor
      )
      // Only the extension: past an endpoint (t<0 or t>1), never over the segment.
      if (proj.t >= 0 && proj.t <= 1) continue
      candidates.push({
        type: SnapType.Extension,
        point: on(entity, proj.point),
        pickDistance: proj.distance,
        sourceIds: [entity.id],
      })
    }
    return candidates
  },
}

/**
 * Keeps the segment being drawn *parallel* to an existing line — AutoCAD's
 * Parallel. Projects the cursor onto the ray through the anchor parallel to
 * each line and offers that projection, engaging by proximity to the ray
 * (pickDistance) — so the point locks onto the parallel direction as the
 * rubber-band nears it. Needs the anchor, so it offers nothing without one.
 */
export const parallelProvider: SnapProvider = {
  type: SnapType.Parallel,
  collect({
    document,
    entities,
    anchor,
    worldCursor,
    parallelSourceIds,
  }: SnapContext): SnapCandidate[] {
    if (!anchor || parallelSourceIds.size === 0) return []
    const offset = V.sub(worldCursor, anchor)
    if (V.length(offset) < 1e-6) return []
    const candidates: SnapCandidate[] = []
    for (const entity of entities) {
      if (!document.isEntityVisible(entity)) continue
      if (entity.type !== "line") continue
      // Only lines the user has acquired (hovered) are offered as parallels.
      if (!parallelSourceIds.has(entity.id)) continue
      const along = V.sub(entity.end, entity.start)
      const len = V.length(along)
      if (len < 1e-9) continue
      const dir = V.scale(along, 1 / len)
      // Project the cursor onto the anchor→dir ray; the projection is the point
      // that keeps the new segment parallel to this line.
      const point = V.add(anchor, V.scale(dir, V.dot(offset, dir)))
      candidates.push({
        type: SnapType.Parallel,
        // The point lies on the new segment, not on the line it parallels.
        point: withZOf(point, anchor),
        pickDistance: V.distance(point, worldCursor),
        sourceIds: [entity.id],
      })
    }
    return candidates
  },
}

/**
 * Snaps to the closest point *anywhere* on an entity's outline — AutoCAD's
 * Nearest osnap. Unlike the notable-point snaps it engages whenever the cursor
 * is within tolerance of the geometry itself, so it is the greediest snap and
 * runs at lowest priority (and is off by default).
 */
export const nearestProvider: SnapProvider = {
  type: SnapType.Nearest,
  collect({
    document,
    entities,
    worldCursor,
    worldTolerance,
  }: SnapContext): SnapCandidate[] {
    const candidates: SnapCandidate[] = []
    for (const entity of entities) {
      if (!document.isEntityVisible(entity)) continue
      const closest =
        entity.type === "line"
          ? closestPointOnSegment(entity.start, entity.end, worldCursor)
          : entity.type === "circle"
            ? closestPointOnCircle(entity.center, entity.radius, worldCursor)
            : entity.type === "arc"
              ? closestPointOnArc(
                  entity.center,
                  entity.radius,
                  entity.startAngle,
                  entity.endAngle,
                  worldCursor
                )
              : entity.type === "polyline" || entity.type === "spline"
                ? closestOnEntity(entity, worldCursor)
                : null
      if (closest && closest.distance <= worldTolerance) {
        candidates.push({
          type: SnapType.Nearest,
          point: on(entity, closest.point),
          sourceIds: [entity.id],
        })
      }
    }
    return candidates
  },
}

/**
 * Snaps to intersections between entities. Only computes intersections for
 * pairs whose bounding proximity is worth checking near the cursor, keeping the
 * common case cheap.
 *
 * The rubber-band segment the active tool is drawing is folded into the same
 * shape list, so intersections engage on the line *being drawn* against the
 * committed geometry too — exactly like AutoCAD.
 */
export const intersectionProvider: SnapProvider = {
  type: SnapType.Intersection,
  collect({
    document,
    entities,
    worldCursor,
    worldTolerance,
    construction,
  }: SnapContext): SnapCandidate[] {
    const shapes = collectShapes(document, entities, construction, {
      cursor: worldCursor,
      reach: worldTolerance * 8,
    })
    const candidates: SnapCandidate[] = []
    const near = worldTolerance * 8 // coarse pre-filter around the cursor

    for (let i = 0; i < shapes.length; i++) {
      for (let j = i + 1; j < shapes.length; j++) {
        // Neighbouring chords of one spline meet at every tessellation vertex.
        const a = shapes[i]
        const b = shapes[j]
        if (
          a.kind === "segment" &&
          b.kind === "segment" &&
          a.curveId !== undefined &&
          a.curveId === b.curveId
        ) {
          continue
        }
        for (const point of intersectShapes(shapes[i], shapes[j])) {
          if (V.distance(point, worldCursor) > near) continue
          const z = meetingHeight(a, b, point)
          if (z === null) continue
          candidates.push({
            type: SnapType.Intersection,
            point: withZ(point, z),
            sourceIds: [...shapes[i].sourceIds, ...shapes[j].sourceIds],
            transient: shapes[i].fromConstruction || shapes[j].fromConstruction,
          })
        }
      }
    }
    return candidates
  },
}

/**
 * Snaps to the point where two straight edges *would* meet if extended — the
 * "Apparent Intersection" of AutoCAD. Computed from the infinite lines through
 * each segment; only offered when the crossing lies on at least one segment's
 * extension (otherwise it is a real intersection, already handled above) and is
 * near the cursor.
 */
export const apparentIntersectionProvider: SnapProvider = {
  type: SnapType.ApparentIntersection,
  collect({
    document,
    entities,
    worldCursor,
    worldTolerance,
    construction,
  }: SnapContext): SnapCandidate[] {
    const segments = collectShapes(document, entities, construction).filter(
      (s): s is SegmentShape => s.kind === "segment"
    )
    const candidates: SnapCandidate[] = []
    const near = worldTolerance * 8

    for (let i = 0; i < segments.length; i++) {
      for (let j = i + 1; j < segments.length; j++) {
        const a = segments[i]
        const b = segments[j]
        const x = infiniteLineIntersection(a.a, a.b, b.a, b.b)
        if (!x) continue
        // A crossing that lies within *both* segments is a real intersection;
        // apparent intersection is precisely the "needs extending" case.
        const withinBoth = x.t >= 0 && x.t <= 1 && x.u >= 0 && x.u <= 1
        if (withinBoth) continue
        if (V.distance(x.point, worldCursor) <= near) {
          candidates.push({
            type: SnapType.ApparentIntersection,
            // The first object's height: the two may pass at different ones.
            point: withZ(
              x.point,
              heightOn(a, x.point) ?? heightOn(b, x.point) ?? 0
            ),
            sourceIds: [...a.sourceIds, ...b.sourceIds],
            transient: a.fromConstruction || b.fromConstruction,
          })
        }
      }
    }
    return candidates
  },
}

type SegmentShape = {
  readonly kind: "segment"
  readonly a: Vec2
  readonly b: Vec2
  readonly sourceIds: readonly EntityId[]
  readonly fromConstruction: boolean
  /** The object it is part of; none for the rubber band. */
  readonly source: Entity | null
  /** The spline this is a chord of. */
  readonly curveId?: EntityId
}

type CircleShape = {
  readonly kind: "circle"
  readonly center: Vec2
  readonly radius: number
  readonly sourceIds: readonly EntityId[]
  readonly fromConstruction: boolean
  readonly source: Entity | null
}

type ArcShape = {
  readonly kind: "arc"
  readonly center: Vec2
  readonly radius: number
  readonly startAngle: number
  readonly endAngle: number
  readonly sourceIds: readonly EntityId[]
  readonly fromConstruction: boolean
  readonly source: Entity | null
}

/** A geometry primitive the intersection providers can cross with another. */
type SnapShape = SegmentShape | CircleShape | ArcShape

function heightOn(shape: SnapShape, point: Vec2): number | null {
  return shape.source ? entityZAt(shape.source, point) : null
}

/** Tolerance on the heights of two objects crossing in plan. */
const MEETING_EPSILON = 1e-6

/**
 * The Z at which two shapes crossing in plan at `point` really meet, or null
 * when they pass one above the other. The rubber band meets anything.
 */
function meetingHeight(a: SnapShape, b: SnapShape, point: Vec2): number | null {
  const za = heightOn(a, point)
  const zb = heightOn(b, point)
  if (za === null) return zb ?? 0
  if (zb === null) return za
  return Math.abs(za - zb) <= MEETING_EPSILON ? za : null
}

/**
 * Normalises committed entities and the provisional rubber-band into one
 * uniform shape list, tagging construction geometry so downstream candidates
 * can be marked {@link SnapCandidate.transient}.
 *
 * A spline enters as the chords of its tessellation (a hundred-thousandth of
 * its size off the curve), and only those within `near.reach` of the cursor:
 * a whole tessellation would make the pairwise search quadratic in chords.
 */
function collectShapes(
  document: SnapContext["document"],
  entities: SnapContext["entities"],
  construction: readonly ConstructionGeometry[],
  near?: { readonly cursor: Vec2; readonly reach: number }
): SnapShape[] {
  const shapes: SnapShape[] = []
  for (const entity of entities) {
    if (!document.isEntityVisible(entity)) continue
    if (entity.type === "spline") {
      if (!near) continue
      const points = splinePolyline(entity)
      for (let i = 1; i < points.length; i++) {
        const a = points[i - 1]
        const b = points[i]
        if (closestPointOnSegment(a, b, near.cursor).distance > near.reach) {
          continue
        }
        shapes.push({
          kind: "segment",
          a,
          b,
          sourceIds: [entity.id],
          fromConstruction: false,
          source: entity,
          curveId: entity.id,
        })
      }
    } else if (entity.type === "line") {
      shapes.push({
        kind: "segment",
        a: entity.start,
        b: entity.end,
        sourceIds: [entity.id],
        fromConstruction: false,
        source: entity,
      })
    } else if (entity.type === "circle") {
      shapes.push({
        kind: "circle",
        center: entity.center,
        radius: entity.radius,
        sourceIds: [entity.id],
        fromConstruction: false,
        source: entity,
      })
    } else if (entity.type === "arc") {
      shapes.push({
        kind: "arc",
        center: entity.center,
        radius: entity.radius,
        startAngle: entity.startAngle,
        endAngle: entity.endAngle,
        sourceIds: [entity.id],
        fromConstruction: false,
        source: entity,
      })
    } else if (entity.type === "polyline") {
      for (const seg of polylineSegmentGeometries(entity)) {
        shapes.push(
          seg.kind === "line"
            ? {
                kind: "segment",
                a: seg.a,
                b: seg.b,
                sourceIds: [entity.id],
                fromConstruction: false,
                source: entity,
              }
            : {
                kind: "arc",
                center: seg.center,
                radius: seg.radius,
                startAngle: seg.startAngle,
                endAngle: seg.endAngle,
                sourceIds: [entity.id],
                fromConstruction: false,
                source: entity,
              }
        )
      }
    }
  }
  for (const geometry of construction) {
    if (geometry.kind === "segment") {
      shapes.push({
        kind: "segment",
        a: geometry.a,
        b: geometry.b,
        sourceIds: [],
        fromConstruction: true,
        source: null,
      })
    }
  }
  return shapes
}

/** The CCW sweep (radians, in `(0, 2π]`) from `start` to `end`. */
function arcSweep(start: number, end: number): number {
  const sweep = normalizeAngle(end - start)
  return sweep < 1e-9 ? Math.PI * 2 : sweep
}

/** All *real* intersection points between two shapes (0, 1 or 2 points). */
function intersectShapes(a: SnapShape, b: SnapShape): Vec2[] {
  if (a.kind === "segment" && b.kind === "segment") {
    const p = segmentSegmentIntersection(a.a, a.b, b.a, b.b)
    return p ? [p] : []
  }
  if (a.kind === "segment" && b.kind === "circle") {
    return segmentCircleIntersection(a.a, a.b, b.center, b.radius)
  }
  if (a.kind === "circle" && b.kind === "segment") {
    return segmentCircleIntersection(b.a, b.b, a.center, a.radius)
  }
  if (a.kind === "segment" && b.kind === "arc") {
    return segmentArcIntersection(
      a.a,
      a.b,
      b.center,
      b.radius,
      b.startAngle,
      b.endAngle
    )
  }
  if (a.kind === "arc" && b.kind === "segment") {
    return segmentArcIntersection(
      b.a,
      b.b,
      a.center,
      a.radius,
      a.startAngle,
      a.endAngle
    )
  }
  if (a.kind === "circle" && b.kind === "circle") {
    return circleCircleIntersection(a.center, a.radius, b.center, b.radius)
  }
  if (a.kind === "circle" && b.kind === "arc") {
    return circleCircleIntersection(
      a.center,
      a.radius,
      b.center,
      b.radius
    ).filter((p) => arcShapeContains(b, p))
  }
  if (a.kind === "arc" && b.kind === "circle") {
    return circleCircleIntersection(
      a.center,
      a.radius,
      b.center,
      b.radius
    ).filter((p) => arcShapeContains(a, p))
  }
  if (a.kind === "arc" && b.kind === "arc") {
    return circleCircleIntersection(
      a.center,
      a.radius,
      b.center,
      b.radius
    ).filter((p) => arcShapeContains(a, p) && arcShapeContains(b, p))
  }
  return []
}

/** Whether `point` (on the arc's circle) lies within the arc's swept extent. */
function arcShapeContains(arc: ArcShape, point: Vec2): boolean {
  return angleWithinSweep(
    arc.startAngle,
    arc.endAngle,
    Math.atan2(point.y - arc.center.y, point.x - arc.center.x)
  )
}

/**
 * Default provider registry. The order here is also the default priority order
 * used by the engine to break ties between snaps at similar distances.
 */
export const defaultSnapProviders: SnapProvider[] = [
  endpointProvider,
  intersectionProvider,
  midpointProvider,
  centerProvider,
  insertionProvider,
  quadrantProvider,
  perpendicularProvider,
  tangentProvider,
  extensionProvider,
  parallelProvider,
  // Lowest priority: only engages when no real snap is near, so a genuine
  // intersection or endpoint always wins over an extended (apparent) one.
  apparentIntersectionProvider,
  // Greediest of all (matches any point on an outline): kept last so every
  // notable-point snap wins over it.
  nearestProvider,
]

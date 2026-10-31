import { Vec2 } from "../geometry/Vec2"
import { Vec3 } from "../geometry/Vec3"
import {
  BSplineCurve,
  bsplineDomain,
  bsplineJoined,
  bsplineSegment,
  conicArcCurve,
} from "../geometry/nurbs"
import { bulgeToArc } from "../geometry/primitives"
import { Entity, SplineEntity } from "./entityTypes"
import { entityElevation, lineEndZ, lineStartZ, readsInPlan } from "./elevation"
import { arcSweepAngle } from "./entityMeasures"
import { ellipseMinorAxis, ellipseSweepParams, isFullEllipse } from "./ellipses"
import { polylineSegmentGeometries } from "./polylines"
import { polyline3dSegments } from "./polylines3d"
import { createSpline } from "./splines"
import { onControlPoints, splineInWorld, splineRun } from "./splineEdits"

/*
 * JOIN's spline, as AutoCAD 2027 makes it (probes pieces/p331, p374, p375,
 * p396–p438): each object a curve of its own on its own parameter, joined
 * end to end by `bsplineJoined`, never fitted again.
 */

const at = (p: Vec2, z: number): Vec3 => ({ x: p.x, y: p.y, z })

/**
 * The curve `entity` joins a spline on, in the WCS, or null where it joins
 * none: a line on [0, 1], rational though its weights are 1 (p374, p398); an
 * arc or an elliptical arc on its own angle (p375, p424, p425); a polyline
 * segment by segment so (p401, p431), and an open 3D polyline its curve's
 * (3dpoly/p48, p49); an open spline on its own knots, shifted (p423, p432).
 * A closed object, and one in a plane at an angle to the plan, joins none.
 */
export function joinCurve(entity: Entity): BSplineCurve | null {
  switch (entity.type) {
    case "line":
      return {
        degree: 1,
        knots: [0, 0, 1, 1],
        controlPoints: [
          at(entity.start, lineStartZ(entity)),
          at(entity.end, lineEndZ(entity)),
        ],
        weights: [1, 1],
      }
    case "arc": {
      if (!readsInPlan(entity)) return null
      const r = entity.radius
      return conicArcCurve(
        at(entity.center, entityElevation(entity)),
        { x: r, y: 0, z: 0 },
        { x: 0, y: r, z: 0 },
        entity.startAngle,
        arcSweepAngle(entity)
      )
    }
    case "ellipse": {
      if (!readsInPlan(entity) || isFullEllipse(entity)) return null
      const { start, sweep } = ellipseSweepParams(entity)
      return conicArcCurve(
        at(entity.center, entityElevation(entity)),
        at(entity.majorAxis, 0),
        at(ellipseMinorAxis(entity), 0),
        start,
        sweep
      )
    }
    case "polyline": {
      if (!readsInPlan(entity) || entity.closed) return null
      const z = entityElevation(entity)
      return bsplineJoined(
        polylineSegmentGeometries(entity).map((segment) => {
          if (segment.kind === "line") {
            return {
              degree: 1,
              knots: [0, 0, 1, 1],
              controlPoints: [at(segment.a, z), at(segment.b, z)],
              weights: [1, 1],
            }
          }
          const { center, radius } = bulgeToArc(
            segment.a,
            segment.b,
            segment.bulge
          )
          return conicArcCurve(
            at(center, z),
            { x: radius, y: 0, z: 0 },
            { x: 0, y: radius, z: 0 },
            Math.atan2(segment.a.y - center.y, segment.a.x - center.x),
            4 * Math.atan(segment.bulge)
          )
        })
      )
    }
    case "polyline3d":
      if (entity.closed || entity.vertices.length < 2) return null
      return bsplineJoined(
        polyline3dSegments(entity).map(([a, b]) => ({
          degree: 1,
          knots: [0, 0, 1, 1],
          controlPoints: [a, b],
          weights: [1, 1],
        }))
      )
    case "spline": {
      if (entity.closed) return null
      const { curve } = splineRun(splineInWorld(entity))
      const { start, end } = bsplineDomain(curve)
      return bsplineSegment(curve, start, end)
    }
    default:
      return null
  }
}

/**
 * The spline JOIN leaves on `curve`, closed where its chain closes (p405): a
 * source spline is that spline, its handle and properties kept, without fit
 * data (p331, p396); any other source a new spline that wears its layer and
 * overrides (p375, p409, p415).
 */
export function joinedSpline(
  source: Entity,
  curve: BSplineCurve,
  closed: boolean
): SplineEntity {
  if (source.type === "spline") {
    return { ...onControlPoints(splineInWorld(source), curve), closed }
  }
  const { color, linetype, lineweight } = source
  return {
    ...createSpline("cv", curve.controlPoints, {
      layerId: source.layerId,
      closed,
      knotVector: curve.knots,
      weights: curve.weights,
    }),
    ...(color ? { color } : {}),
    ...(linetype ? { linetype } : {}),
    ...(lineweight !== undefined ? { lineweight } : {}),
  }
}

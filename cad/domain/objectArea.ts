import { Vec2, V } from "../geometry/Vec2"
import { circleArea, circleCircumference } from "./entityMeasures"
import {
  ellipseArcLength,
  ellipseSemiMajor,
  ellipseSemiMinor,
  ellipseSweepParams,
  isFullEllipse,
} from "./ellipses"
import { Entity, HatchEntity, HatchLoop } from "./entityTypes"
import { hatchLoopRing, hatchLoopSegments } from "./hatch"
import { polylineArea, polylineLength } from "./polylines"
import { isLevelSpline, splineArea, splineLength } from "./splines"
import { regionArea, regionPerimeter } from "./regions"
import { isLevelPolyline3d, polyline3dLength } from "./polylines3d"

/**
 * What AREA's Object option reports for an object: its area and the length
 * around it, under the word AutoCAD 2027 prints it with — a circle's
 * `Circumference`, an open curve's `Length` (its area is the one its chord
 * closes), and `Perimeter` otherwise (probes inquiry/p215, p223, p225).
 */
export interface ObjectArea {
  readonly area: number
  readonly around: number
  readonly measured: "perimeter" | "circumference" | "length" | "region"
}

/**
 * Null for an object AutoCAD says "does not have an area" (a line, an arc,
 * text, a spline in no plane), and for a 3D polyline that does not lie level, which it refuses in
 * words of its own (3dpoly/p15).
 */
export function objectArea(entity: Entity): ObjectArea | null {
  switch (entity.type) {
    case "circle":
      return {
        area: circleArea(entity),
        around: circleCircumference(entity),
        measured: "circumference",
      }
    case "ellipse": {
      const a = ellipseSemiMajor(entity)
      const b = ellipseSemiMinor(entity)
      const { start, sweep } = ellipseSweepParams(entity)
      // An affine image of a circular segment: the sector less the triangle
      // its chord cuts off, both scaled by a·b.
      return {
        area: ((a * b) / 2) * (sweep - Math.sin(sweep)),
        around: ellipseArcLength(a, b, start, sweep),
        measured: isFullEllipse(entity) ? "perimeter" : "length",
      }
    }
    case "polyline":
      return {
        area: polylineArea(entity),
        around: polylineLength(entity),
        measured: entity.closed ? "perimeter" : "length",
      }
    case "polyline3d":
      // A level one measures as a polyline at its Z does (3dpoly/p16).
      return isLevelPolyline3d(entity)
        ? {
            area: ringArea(entity.vertices),
            around: polyline3dLength(entity),
            measured: entity.closed ? "perimeter" : "length",
          }
        : null
    case "spline":
      // One in no plane has none (spline3d/s01, s14); one in a tilted plane
      // measures in it (s02).
      return isLevelSpline(entity)
        ? {
            area: splineArea(entity),
            around: splineLength(entity),
            measured: entity.closed ? "perimeter" : "length",
          }
        : null
    case "hatch":
      return {
        area: hatchArea(entity),
        around: entity.loops.reduce((sum, loop) => sum + loopLength(loop), 0),
        measured: "perimeter",
      }
    case "region":
      // Its own words: `Area = …, Trimmed area = 0.0000 , Perimeter = …` (region/p01).
      return {
        area: regionArea(entity),
        around: regionPerimeter(entity),
        measured: "region",
      }
    case "line":
    case "arc":
    case "text":
    case "mtext":
    case "attdef":
    case "dimension":
    case "insert":
      return null
    default: {
      const unhandled: never = entity
      return unhandled
    }
  }
}

/**
 * The hatched area under the even-odd rule the hatch is filled with: a loop
 * inside an odd number of others is a hole.
 */
function hatchArea(hatch: HatchEntity): number {
  const rings = hatch.loops.map(hatchLoopRing)
  return hatch.loops.reduce((sum, loop, index) => {
    const at = rings[index][0]
    const depth = rings.filter(
      (ring, other) => other !== index && at !== undefined && inRing(at, ring)
    ).length
    const area = Math.abs(loopSignedArea(loop))
    return depth % 2 === 0 ? sum + area : sum - area
  }, 0)
}

function loopSignedArea(loop: HatchLoop): number {
  let signed = 0
  for (const seg of hatchLoopSegments(loop)) {
    signed += V.cross(seg.a, seg.b) / 2
    if (seg.kind === "arc") {
      const theta = 4 * Math.atan(seg.bulge)
      signed += ((seg.radius * seg.radius) / 2) * (theta - Math.sin(theta))
    }
  }
  return signed
}

function loopLength(loop: HatchLoop): number {
  return hatchLoopSegments(loop).reduce((sum, seg) => {
    if (seg.kind === "line") return sum + V.distance(seg.a, seg.b)
    return sum + seg.radius * Math.abs(4 * Math.atan(seg.bulge))
  }, 0)
}

function inRing(point: Vec2, ring: readonly Vec2[]): boolean {
  let inside = false
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

/** The area the ring through `points` closes, by the shoelace. */
function ringArea(points: readonly Vec2[]): number {
  let signed = 0
  for (let i = 0; i < points.length; i++) {
    const a = points[i]
    const b = points[(i + 1) % points.length]
    signed += a.x * b.y - b.x * a.y
  }
  return Math.abs(signed) / 2
}

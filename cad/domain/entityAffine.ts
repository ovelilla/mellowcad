import { Vec2, V } from "../geometry/Vec2"
import {
  Linear2,
  applyLinear,
  composeLinear,
  linearDeterminant,
} from "../geometry/linear"
import type {
  EllipseEntity,
  Entity,
  HatchEntity,
  HatchLoop,
  InsertEntity,
} from "./entityTypes"
import { createEllipse } from "./ellipses"
import { mapSplinePoints } from "./splines"
import { mapDimensionPoints } from "./dimensions"
import { carryOverrides } from "./entityOverrides"
import { hatchLoopRing } from "./hatch"
import { mappedFit } from "./polylineFits"
import { curveAffine } from "../geometry/planarCurves"
import { loopReversed } from "../geometry/planarRegions"

/** A reference's placement of its block: turned by `rotation` after scaling X and Y apart. */
export function insertLinear(
  rotation: number,
  scaleX: number,
  scaleY: number
): Linear2 {
  const cos = Math.cos(rotation)
  const sin = Math.sin(rotation)
  return [cos * scaleX, sin * scaleX, -sin * scaleY, cos * scaleY]
}

/**
 * `entity`, level, carried through the linear map `map` about the origin, for
 * every type the map has a closed form for: points and vectors map, a circle
 * or an arc becomes an ellipse or an elliptical arc, an ellipse another, a
 * spline its points (its knots kept), a hatch its loops — the pattern is left
 * to the caller, which knows whether it is shown or exploded. Null for the
 * types it has none for (text, an MTEXT, an attribute definition, a solid),
 * which the caller places otherwise. A polyline's arc segments keep their bulge between
 * the mapped vertices, and its widths take `widthScale`: neither is an
 * ellipse here. A nested reference keeps its rotation and its two factors
 * read off the composed map, any shear dropped.
 */
export function linearEntity(
  entity: Entity,
  map: Linear2,
  widthScale: number
): Entity | null {
  const at = (point: Vec2) => applyLinear(map, point)
  const flips = linearDeterminant(map) < 0
  switch (entity.type) {
    case "line":
      return { ...entity, start: at(entity.start), end: at(entity.end) }
    case "circle":
      return conic(entity, entity.center, entity.radius, null, map)
    case "arc":
      return conic(
        entity,
        entity.center,
        entity.radius,
        { start: entity.startAngle, end: entity.endAngle },
        map
      )
    case "ellipse":
      return mappedEllipse(entity, map)
    case "spline":
      return mapSplinePoints(entity, at)
    case "polyline":
      return {
        ...entity,
        vertices: entity.vertices.map(at),
        ...mappedFit(
          entity.fit,
          at,
          (t) => {
            const d = applyLinear(map, { x: Math.cos(t), y: Math.sin(t) })
            return Math.atan2(d.y, d.x)
          },
          flips
        ),
        ...(entity.bulges && flips
          ? { bulges: entity.bulges.map((bulge) => -bulge) }
          : {}),
        ...(entity.widths
          ? {
              widths: entity.widths.map(
                ([start, end]) =>
                  [start * widthScale, end * widthScale] as const
              ),
            }
          : {}),
      }
    case "polyline3d":
      // Its Z is left as a line's ends' is: the map is the plan's.
      return {
        ...entity,
        vertices: entity.vertices.map((v) => ({ ...at(v), z: v.z })),
      }
    case "dimension":
      return {
        ...entity,
        ...mapDimensionPoints(entity, at),
        rotation: mappedAngle(map, entity.rotation),
        ...(entity.textAngle !== undefined
          ? { textAngle: mappedAngle(map, entity.textAngle) }
          : {}),
      }
    case "hatch":
      return {
        ...entity,
        loops: entity.loops.map((loop) => mappedLoop(loop, map)),
        origin: at(entity.origin),
      }
    case "insert":
      return nestedInsert(entity, map)
    case "region": {
      const [xx, yx, xy, yy] = map
      const affine = { linear: { xx, xy, yx, yy }, translation: { x: 0, y: 0 } }
      // Through a reflection each loop is turned back, its face kept on its left.
      return {
        ...entity,
        faces: entity.faces.map((face) => ({
          loops: face.loops.map((loop) => {
            const edges = loop.map((edge) => curveAffine(edge, affine))
            return flips ? loopReversed(edges) : edges
          }),
        })),
      }
    }
    case "text":
    case "mtext":
    case "attdef":
    case "solid3d":
      return null
  }
}

/** The direction at `angle` after `map`. */
function mappedAngle(map: Linear2, angle: number): number {
  const v = applyLinear(map, { x: Math.cos(angle), y: Math.sin(angle) })
  return Math.atan2(v.y, v.x)
}

/**
 * A loop through `map`: a map that keeps circles keeps its arcs (a
 * reflection negates their bulges); any other chops them, as the pattern's
 * clipping does (`hatchLoopRing`), into chords it maps exactly.
 */
function mappedLoop(loop: HatchLoop, map: Linear2): HatchLoop {
  const [a, b, c, d] = map
  const conformal =
    Math.abs(a * a + b * b - (c * c + d * d)) < 1e-12 * (a * a + b * b) &&
    Math.abs(a * c + b * d) < 1e-12 * (a * a + b * b)
  if (conformal || !loop.bulges?.some((bulge) => bulge !== 0)) {
    return {
      vertices: loop.vertices.map((v) => applyLinear(map, v)),
      ...(loop.bulges
        ? {
            bulges:
              linearDeterminant(map) < 0
                ? loop.bulges.map((bulge) => -bulge)
                : loop.bulges,
          }
        : {}),
    }
  }
  return { vertices: hatchLoopRing(loop).map((v) => applyLinear(map, v)) }
}

function nestedInsert(insert: InsertEntity, map: Linear2): InsertEntity {
  const [a, b, c, d] = composeLinear(
    map,
    insertLinear(insert.rotation, insert.scaleX, insert.scaleY)
  )
  const scaleX = Math.hypot(a, b)
  if (!(scaleX > 0)) return insert
  return {
    ...insert,
    position: applyLinear(map, insert.position),
    rotation: Math.atan2(b, a),
    scaleX,
    scaleY: (a * d - b * c) / scaleX,
  }
}

function mappedEllipse(ellipse: EllipseEntity, map: Linear2): EllipseEntity {
  const u = ellipse.majorAxis
  const v = V.scale({ x: -u.y, y: u.x }, ellipse.ratio)
  const range =
    ellipse.startParam !== undefined && ellipse.endParam !== undefined
      ? { start: ellipse.startParam, end: ellipse.endParam }
      : null
  return conicThrough(ellipse, ellipse.center, u, v, range, map)
}

function conic(
  source: Entity,
  center: Vec2,
  radius: number,
  range: { readonly start: number; readonly end: number } | null,
  map: Linear2
): EllipseEntity {
  return conicThrough(
    source,
    center,
    { x: radius, y: 0 },
    { x: 0, y: radius },
    range,
    map
  )
}

/**
 * The image of `center + u·cos t + v·sin t` (t from `range.start` to
 * `range.end`, counter-clockwise; the whole curve when null) as an ellipse.
 * The images of `u` and `v` are conjugate semi-diameters; the major one is at
 * the parameter t0 where their combination is longest, so the image is
 * `c + M·cos(t − t0) + N·sin(t − t0)`. A map that reverses the turn runs the
 * parameter backwards, and so swaps the range's ends.
 */
function conicThrough(
  source: Entity,
  center: Vec2,
  u: Vec2,
  v: Vec2,
  range: { readonly start: number; readonly end: number } | null,
  map: Linear2
): EllipseEntity {
  const U = applyLinear(map, u)
  const W = applyLinear(map, v)
  const t0 = Math.atan2(2 * V.dot(U, W), V.dot(U, U) - V.dot(W, W)) / 2
  const cos = Math.cos(t0)
  const sin = Math.sin(t0)
  const major = V.add(V.scale(U, cos), V.scale(W, sin))
  const minor = V.sub(V.scale(W, cos), V.scale(U, sin))
  const length = V.length(major)
  const turns = V.cross(major, minor) >= 0
  const span = range
    ? turns
      ? { startParam: range.start - t0, endParam: range.end - t0 }
      : { startParam: t0 - range.end, endParam: t0 - range.start }
    : {}
  return carryOverrides(
    source,
    createEllipse(
      applyLinear(map, center),
      major,
      length > 0 ? V.length(minor) / length : 1,
      { ...span, layerId: source.layerId, id: source.id }
    )
  )
}

/** A hatch's pattern frame after `map`. */
export function framedPattern(hatch: HatchEntity, map: Linear2): Linear2 {
  return hatch.patternFrame ? composeLinear(map, hatch.patternFrame) : map
}

import { Vec2, V } from "../geometry/Vec2"
import { Vec3, zOf } from "../geometry/Vec3"
import {
  ArcEntity,
  EllipseEntity,
  TextEntity,
  MTextEntity,
  AttributeDefinitionEntity,
  DimensionEntity,
  HatchLoop,
  HatchEntity,
  InsertEntity,
  Entity,
} from "./entityTypes"
import {
  createLine,
  createCircle,
  createArc,
  createPolyline,
  HatchOptions,
  createHatch,
  InsertOptions,
  createInsert,
} from "./entityFactories"
import { createEllipse } from "./ellipses"
import { mapSplinePoints, splineCopy } from "./splines"
import { TextOptions, createText } from "./text"
import { MTextOptions, createMText } from "./mtext"
import { createAttributeDefinition } from "./attributes"
import {
  DimensionOptions,
  createDimension,
  DimensionPoints,
  mapDimensionPoints,
} from "./dimensions"
import { carryOverrides } from "./entityOverrides"
import { scaleEntityZ, shiftEntityZ, withDeltaZ } from "./elevation"

/**
 * A *new* hatch (fresh id) with the same pattern settings as `hatch` over other
 * loops — the building block of every `*Copy` transform.
 */
function hatchLike(
  hatch: HatchEntity,
  loops: readonly HatchLoop[],
  overrides: Pick<HatchOptions, "patternScale" | "patternAngle" | "origin"> = {}
): HatchEntity {
  return createHatch(loops, {
    patternId: hatch.patternId,
    patternScale: overrides.patternScale ?? hatch.patternScale,
    patternAngle: overrides.patternAngle ?? hatch.patternAngle,
    origin: overrides.origin ?? hatch.origin,
    layerId: hatch.layerId,
  })
}

/**
 * A *new* block reference (fresh id) of the same block, with the same scale,
 * rotation and reflection, placed somewhere else — the building block of every
 * `*Copy` transform.
 */
function insertLike(
  insert: InsertEntity,
  position: Vec2,
  overrides: Pick<InsertOptions, "scale" | "rotation" | "mirrored"> = {}
): InsertEntity {
  return createInsert(insert.blockId, position, {
    scale: overrides.scale ?? insert.scale,
    rotation: overrides.rotation ?? insert.rotation,
    mirrored: overrides.mirrored ?? insert.mirrored,
    attributes: insert.attributes,
    layerId: insert.layerId,
  })
}

/** Maps every loop of a hatch through `map`, keeping its bulges. */
function mapHatchLoops(
  hatch: HatchEntity,
  map: (point: Vec2) => Vec2,
  mapBulges: (bulges: readonly number[]) => number[] = (b) => b.slice()
): HatchLoop[] {
  return hatch.loops.map((loop) => ({
    vertices: loop.vertices.map(map),
    ...(loop.bulges ? { bulges: mapBulges(loop.bulges) } : {}),
  }))
}

/**
 * A *new* text object (fresh id) with the same content and style as `text`,
 * moved to `position` — the building block of every `*Copy` transform.
 */
function textLike(
  text: TextEntity,
  position: Vec2,
  overrides: Pick<TextOptions, "height" | "rotation"> = {}
): TextEntity {
  return createText(position, text.value, {
    height: overrides.height ?? text.height,
    rotation: overrides.rotation ?? text.rotation,
    justify: text.justify,
    styleId: text.styleId,
    layerId: text.layerId,
  })
}

/** {@link textLike} for a multiline text object. */
function mtextLike(
  mtext: MTextEntity,
  position: Vec2,
  overrides: Pick<MTextOptions, "height" | "width" | "rotation"> = {}
): MTextEntity {
  return createMText(position, mtext.contents, {
    height: overrides.height ?? mtext.height,
    width: overrides.width ?? mtext.width,
    rotation: overrides.rotation ?? mtext.rotation,
    attachment: mtext.attachment,
    lineSpacingStyle: mtext.lineSpacingStyle,
    lineSpacingFactor: mtext.lineSpacingFactor,
    styleId: mtext.styleId,
    layerId: mtext.layerId,
  })
}

/** {@link textLike} for an attribute definition. */
function attdefLike(
  definition: AttributeDefinitionEntity,
  position: Vec2,
  overrides: Pick<TextOptions, "height" | "rotation"> = {}
): AttributeDefinitionEntity {
  return createAttributeDefinition(position, definition.tag, {
    prompt: definition.prompt,
    value: definition.value,
    modes: definition.modes,
    height: overrides.height ?? definition.height,
    rotation: overrides.rotation ?? definition.rotation,
    justify: definition.justify,
    styleId: definition.styleId,
    layerId: definition.layerId,
  })
}

/**
 * A *new* dimension (fresh id) with the same settings as `dim` but different
 * definition points — the building block of every `*Copy` transform.
 */
function dimensionLike(
  dim: DimensionEntity,
  points: DimensionPoints,
  overrides: Pick<DimensionOptions, "rotation" | "textAngle"> = {}
): DimensionEntity {
  return createDimension(
    dim.kind,
    points.first,
    points.second,
    points.linePoint,
    {
      ...(points.vertex ? { vertex: points.vertex } : {}),
      rotation: overrides.rotation ?? dim.rotation,
      ...(dim.text !== undefined ? { text: dim.text } : {}),
      ...(overrides.textAngle !== undefined
        ? { textAngle: overrides.textAngle }
        : dim.textAngle !== undefined
          ? { textAngle: dim.textAngle }
          : {}),
      styleId: dim.styleId,
      layerId: dim.layerId,
    }
  )
}

/** Flips the sign of every bulge — used when a reflection reverses orientation. */
function negateBulges(bulges: readonly number[]): number[] {
  return bulges.map((b) => -b)
}

/**
 * A *new* ellipse (fresh id) with the same shape ratio and swept range as
 * `ellipse`, placed on another centre and major axis — the building block of
 * every `*Copy` transform.
 */
function ellipseLike(
  ellipse: EllipseEntity,
  center: Vec2,
  majorAxis: Vec2,
  params: Pick<EllipseEntity, "startParam" | "endParam"> = ellipse
): EllipseEntity {
  return createEllipse(center, majorAxis, ellipse.ratio, {
    startParam: params.startParam,
    endParam: params.endParam,
    layerId: ellipse.layerId,
  })
}

/** The major axis as a vector, carried through a transform of its two ends. */
function mappedMajorAxis(
  ellipse: EllipseEntity,
  map: (point: Vec2) => Vec2
): Vec2 {
  return V.sub(
    map(V.add(ellipse.center, ellipse.majorAxis)),
    map(ellipse.center)
  )
}

/**
 * How an elliptical arc's swept range reflects. The parametrisation runs the
 * other way round a mirrored ellipse (reflection turns the minor axis, a
 * quarter turn CCW from the major, into a quarter turn CW), so each parameter
 * negates — and the two ends swap to keep the CCW start→end invariant.
 */
function mirrorEllipseParams(
  ellipse: EllipseEntity
): Pick<EllipseEntity, "startParam" | "endParam"> {
  if (ellipse.startParam === undefined || ellipse.endParam === undefined) {
    return {}
  }
  return { startParam: -ellipse.endParam, endParam: -ellipse.startParam }
}

/**
 * Returns a copy of `entity` translated by `delta` (preserves its id). A 2D
 * delta moves it within its plane.
 */
export function translateEntity(entity: Entity, delta: Vec2 | Vec3): Entity {
  return shiftEntityZ(translatePlanar(entity, delta), zOf(delta))
}

function translatePlanar(entity: Entity, delta: Vec2): Entity {
  switch (entity.type) {
    case "line":
      return {
        ...entity,
        start: V.add(entity.start, delta),
        end: V.add(entity.end, delta),
      }
    case "circle":
      return { ...entity, center: V.add(entity.center, delta) }
    case "arc":
      return { ...entity, center: V.add(entity.center, delta) }
    case "ellipse":
      return { ...entity, center: V.add(entity.center, delta) }
    case "spline":
      return mapSplinePoints(entity, (p) => V.add(p, delta))
    case "polyline":
      return {
        ...entity,
        vertices: entity.vertices.map((v) => V.add(v, delta)),
      }
    case "text":
    case "mtext":
    case "attdef":
      return { ...entity, position: V.add(entity.position, delta) }
    case "dimension":
      return {
        ...entity,
        ...mapDimensionPoints(entity, (p) => V.add(p, delta)),
      }
    case "hatch":
      // The pattern is anchored at its origin, so that moves with the area and
      // the fill rides along instead of sliding through it.
      return {
        ...entity,
        loops: mapHatchLoops(entity, (p) => V.add(p, delta)),
        origin: V.add(entity.origin, delta),
      }
    case "insert":
      return { ...entity, position: V.add(entity.position, delta) }
  }
}

/**
 * Returns a copy of `entity` with only the points inside the stretch frame
 * displaced by `delta` — the deformation behind AutoCAD's STRETCH (preserves
 * its id). `inFrame` reports whether a point lies inside the crossing window,
 * so an endpoint or vertex caught by the frame follows the cursor while the
 * rest of the object stays put, bending the geometry.
 *
 * Circles and arcs are *not* deformed (their shape has no free vertices): they
 * move rigidly when their centre is inside the frame, matching how AutoCAD
 * treats circles. Polyline bulges are preserved, so an arc segment whose ends
 * move keeps its curvature ratio.
 *
 * A Z in `delta` moves what moves whole, and a line's caught end; an object
 * with several vertices in one plane cannot tilt, so caught in part it ignores
 * the Z, as a polyline's vertices all share one elevation.
 */
export function stretchEntity(
  entity: Entity,
  delta: Vec2 | Vec3,
  inFrame: (point: Vec2) => boolean
): Entity {
  const dz = zOf(delta)
  const vertices = stretchVertices(entity)
  if (vertices.length > 0 && vertices.every(inFrame)) {
    return translateEntity(entity, delta)
  }
  const planar = stretchPlanar(entity, delta, inFrame)
  if (dz === 0 || planar === entity) return planar
  switch (planar.type) {
    case "line": {
      if (entity.type !== "line") return planar
      const startDz = inFrame(entity.start) ? dz : 0
      const endDz = inFrame(entity.end) ? dz : 0
      return withDeltaZ(
        shiftEntityZ(planar, startDz),
        (entity.deltaZ ?? 0) + endDz - startDz
      )
    }
    case "circle":
    case "arc":
    case "ellipse":
    case "text":
    case "mtext":
    case "attdef":
    case "insert":
      return shiftEntityZ(planar, dz)
    case "polyline":
    case "spline":
    case "dimension":
    case "hatch":
      return planar
  }
}

/** The points STRETCH moves one by one; all caught, the object moves whole. */
function stretchVertices(entity: Entity): readonly Vec2[] {
  switch (entity.type) {
    case "line":
      return [entity.start, entity.end]
    case "polyline":
      return entity.vertices
    case "spline":
      return entity.points
    case "dimension":
      return entity.vertex
        ? [entity.first, entity.second, entity.vertex]
        : [entity.first, entity.second]
    case "hatch":
      return entity.loops.flatMap((loop) => loop.vertices)
    default:
      return []
  }
}

function stretchPlanar(
  entity: Entity,
  delta: Vec2,
  inFrame: (point: Vec2) => boolean
): Entity {
  const shift = (point: Vec2): Vec2 =>
    inFrame(point) ? V.add(point, delta) : point

  switch (entity.type) {
    case "line":
      return { ...entity, start: shift(entity.start), end: shift(entity.end) }
    case "circle":
    case "arc":
    case "ellipse":
      return inFrame(entity.center)
        ? { ...entity, center: V.add(entity.center, delta) }
        : entity
    case "spline":
      // Its fit points or control vertices are its free vertices, as a
      // polyline's are; the tangents keep their direction.
      return { ...entity, points: entity.points.map(shift) }
    case "polyline":
      return { ...entity, vertices: entity.vertices.map(shift) }
    case "text":
    case "mtext":
    case "attdef":
      // Text has no free vertices either: it rides along whole when its
      // insertion point is caught by the frame.
      return inFrame(entity.position)
        ? { ...entity, position: V.add(entity.position, delta) }
        : entity
    case "dimension": {
      // Each measured origin follows the frame on its own, so stretching the
      // geometry restates the measurement. The dimension line rides along only
      // when both origins move, otherwise it stays where it was placed.
      const moved = mapDimensionPoints(entity, shift)
      const bothMoved =
        !V.equals(moved.first, entity.first) &&
        !V.equals(moved.second, entity.second)
      return {
        ...entity,
        ...moved,
        linePoint: bothMoved
          ? V.add(entity.linePoint, delta)
          : entity.linePoint,
      }
    }
    case "hatch":
      // A boundary loop is a vertex chain like a polyline's, and the objects it
      // was traced from are being stretched by the same gesture, so following
      // the frame keeps the fill on the area the user is dragging.
      return { ...entity, loops: mapHatchLoops(entity, shift) }
    case "insert":
      // A reference has no free vertices to bend: it rides along whole when the
      // frame catches its insertion point, as a circle does with its centre.
      return inFrame(entity.position)
        ? { ...entity, position: V.add(entity.position, delta) }
        : entity
  }
}

/**
 * Returns a *new* entity (fresh id) that duplicates `entity` translated by
 * `delta`, on the same layer — the building block of the COPY command.
 */
export function copyEntity(entity: Entity, delta: Vec2 | Vec3): Entity {
  const copy: Entity = (() => {
    switch (entity.type) {
      case "line":
        return createLine(
          V.add(entity.start, delta),
          V.add(entity.end, delta),
          entity.layerId
        )
      case "circle":
        return createCircle(
          V.add(entity.center, delta),
          entity.radius,
          entity.layerId
        )
      case "arc":
        return createArc(
          V.add(entity.center, delta),
          entity.radius,
          entity.startAngle,
          entity.endAngle,
          entity.layerId
        )
      case "ellipse":
        return ellipseLike(
          entity,
          V.add(entity.center, delta),
          entity.majorAxis
        )
      case "spline":
        return splineCopy(entity, (p) => V.add(p, delta))
      case "polyline":
        return createPolyline(
          entity.vertices.map((v) => V.add(v, delta)),
          entity.closed,
          entity.layerId,
          entity.bulges
        )
      case "text":
        return textLike(entity, V.add(entity.position, delta))
      case "mtext":
        return mtextLike(entity, V.add(entity.position, delta))
      case "attdef":
        return attdefLike(entity, V.add(entity.position, delta))
      case "dimension":
        return dimensionLike(
          entity,
          mapDimensionPoints(entity, (p) => V.add(p, delta))
        )
      case "hatch":
        return hatchLike(
          entity,
          mapHatchLoops(entity, (p) => V.add(p, delta)),
          { origin: V.add(entity.origin, delta) }
        )
      case "insert":
        return insertLike(entity, V.add(entity.position, delta))
    }
  })()
  return shiftEntityZ(carryOverrides(entity, copy), zOf(delta))
}

/** Rotates `point` about `pivot` by `radians` (counter-clockwise positive). */
export function rotatePoint(point: Vec2, pivot: Vec2, radians: number): Vec2 {
  const cos = Math.cos(radians)
  const sin = Math.sin(radians)
  const dx = point.x - pivot.x
  const dy = point.y - pivot.y
  return {
    x: pivot.x + dx * cos - dy * sin,
    y: pivot.y + dx * sin + dy * cos,
  }
}

/**
 * Returns a copy of `entity` rotated about `pivot` by `radians` (preserves its
 * id) — the in-place ROTATE command. A circle's radius is invariant under
 * rotation, so only its centre moves.
 */
export function rotateEntity(
  entity: Entity,
  pivot: Vec2,
  radians: number
): Entity {
  switch (entity.type) {
    case "line":
      return {
        ...entity,
        start: rotatePoint(entity.start, pivot, radians),
        end: rotatePoint(entity.end, pivot, radians),
      }
    case "circle":
      return { ...entity, center: rotatePoint(entity.center, pivot, radians) }
    case "arc":
      return {
        ...entity,
        center: rotatePoint(entity.center, pivot, radians),
        startAngle: entity.startAngle + radians,
        endAngle: entity.endAngle + radians,
      }
    case "ellipse":
      // The swept range is measured from the major axis, which turns with the
      // object, so only the axis vector and the centre move.
      return {
        ...entity,
        center: rotatePoint(entity.center, pivot, radians),
        majorAxis: rotatePoint(entity.majorAxis, V.zero(), radians),
      }
    case "spline":
      return mapSplinePoints(entity, (p) => rotatePoint(p, pivot, radians))
    case "polyline":
      return {
        ...entity,
        vertices: entity.vertices.map((v) => rotatePoint(v, pivot, radians)),
      }
    case "text":
    case "mtext":
    case "attdef":
      return {
        ...entity,
        position: rotatePoint(entity.position, pivot, radians),
        rotation: entity.rotation + radians,
      }
    case "dimension":
      return {
        ...entity,
        ...mapDimensionPoints(entity, (p) => rotatePoint(p, pivot, radians)),
        rotation: entity.rotation + radians,
        ...(entity.textAngle !== undefined
          ? { textAngle: entity.textAngle + radians }
          : {}),
      }
    case "hatch":
      return {
        ...entity,
        loops: mapHatchLoops(entity, (p) => rotatePoint(p, pivot, radians)),
        patternAngle: entity.patternAngle + radians,
        origin: rotatePoint(entity.origin, pivot, radians),
      }
    case "insert":
      return {
        ...entity,
        position: rotatePoint(entity.position, pivot, radians),
        rotation: entity.rotation + radians,
      }
  }
}

/**
 * Returns a *new* entity (fresh id) duplicating `entity` rotated about `pivot`
 * by `radians`, on the same layer — the building block of ROTATE's Copy option.
 */
export function rotateEntityCopy(
  entity: Entity,
  pivot: Vec2,
  radians: number
): Entity {
  const copy: Entity = (() => {
    switch (entity.type) {
      case "line":
        return createLine(
          rotatePoint(entity.start, pivot, radians),
          rotatePoint(entity.end, pivot, radians),
          entity.layerId
        )
      case "circle":
        return createCircle(
          rotatePoint(entity.center, pivot, radians),
          entity.radius,
          entity.layerId
        )
      case "arc":
        return createArc(
          rotatePoint(entity.center, pivot, radians),
          entity.radius,
          entity.startAngle + radians,
          entity.endAngle + radians,
          entity.layerId
        )
      case "ellipse":
        return ellipseLike(
          entity,
          rotatePoint(entity.center, pivot, radians),
          rotatePoint(entity.majorAxis, V.zero(), radians)
        )
      case "spline":
        return splineCopy(entity, (p) => rotatePoint(p, pivot, radians))
      case "polyline":
        return createPolyline(
          entity.vertices.map((v) => rotatePoint(v, pivot, radians)),
          entity.closed,
          entity.layerId,
          entity.bulges
        )
      case "text":
        return textLike(entity, rotatePoint(entity.position, pivot, radians), {
          rotation: entity.rotation + radians,
        })
      case "mtext":
        return mtextLike(entity, rotatePoint(entity.position, pivot, radians), {
          rotation: entity.rotation + radians,
        })
      case "attdef":
        return attdefLike(
          entity,
          rotatePoint(entity.position, pivot, radians),
          { rotation: entity.rotation + radians }
        )
      case "dimension":
        return dimensionLike(
          entity,
          mapDimensionPoints(entity, (p) => rotatePoint(p, pivot, radians)),
          {
            rotation: entity.rotation + radians,
            ...(entity.textAngle !== undefined
              ? { textAngle: entity.textAngle + radians }
              : {}),
          }
        )
      case "hatch":
        return hatchLike(
          entity,
          mapHatchLoops(entity, (p) => rotatePoint(p, pivot, radians)),
          {
            patternAngle: entity.patternAngle + radians,
            origin: rotatePoint(entity.origin, pivot, radians),
          }
        )
      case "insert":
        return insertLike(
          entity,
          rotatePoint(entity.position, pivot, radians),
          {
            rotation: entity.rotation + radians,
          }
        )
    }
  })()
  return carryOverrides(entity, copy)
}

/** Scales `point` about `base` by `factor` (uniform). */
export function scalePoint(point: Vec2, base: Vec2, factor: number): Vec2 {
  return {
    x: base.x + (point.x - base.x) * factor,
    y: base.y + (point.y - base.y) * factor,
  }
}

/**
 * Returns a copy of `entity` uniformly scaled about `base` by `factor`
 * (preserves its id) — the in-place SCALE command. A circle's radius scales
 * with the factor. The scale is 3D, as AutoCAD's is: the plane moves away from
 * the base's Z and the rise and thickness grow with the rest.
 */
export function scaleEntity(
  entity: Entity,
  base: Vec2 | Vec3,
  factor: number
): Entity {
  return scaleEntityZ(scalePlanar(entity, base, factor), zOf(base), factor)
}

function scalePlanar(entity: Entity, base: Vec2, factor: number): Entity {
  switch (entity.type) {
    case "line":
      return {
        ...entity,
        start: scalePoint(entity.start, base, factor),
        end: scalePoint(entity.end, base, factor),
      }
    case "circle":
      return {
        ...entity,
        center: scalePoint(entity.center, base, factor),
        radius: entity.radius * factor,
      }
    case "arc":
      return {
        ...entity,
        center: scalePoint(entity.center, base, factor),
        radius: entity.radius * factor,
      }
    case "ellipse":
      // A uniform scale leaves the shape ratio alone: only the axis grows.
      return {
        ...entity,
        center: scalePoint(entity.center, base, factor),
        majorAxis: V.scale(entity.majorAxis, factor),
      }
    case "spline":
      return mapSplinePoints(entity, (p) => scalePoint(p, base, factor))
    case "polyline":
      return {
        ...entity,
        vertices: entity.vertices.map((v) => scalePoint(v, base, factor)),
      }
    case "text":
    case "attdef":
      return {
        ...entity,
        position: scalePoint(entity.position, base, factor),
        height: entity.height * factor,
      }
    case "mtext":
      return {
        ...entity,
        position: scalePoint(entity.position, base, factor),
        height: entity.height * factor,
        width: entity.width * factor,
      }
    case "dimension":
      // Only the definition points scale: the text and arrow sizes come from
      // the style, which AutoCAD scales through DIMSCALE rather than per object.
      return {
        ...entity,
        ...mapDimensionPoints(entity, (p) => scalePoint(p, base, factor)),
      }
    case "hatch":
      // Unlike a dimension's text, the pattern is drawing geometry: scaling the
      // area scales its spacing, so the fill keeps looking the same.
      return {
        ...entity,
        loops: mapHatchLoops(entity, (p) => scalePoint(p, base, factor)),
        patternScale: entity.patternScale * factor,
        origin: scalePoint(entity.origin, base, factor),
      }
    case "insert":
      return {
        ...entity,
        position: scalePoint(entity.position, base, factor),
        scale: entity.scale * factor,
      }
  }
}

/**
 * Returns a *new* entity (fresh id) duplicating `entity` scaled about `base` by
 * `factor`, on the same layer — the building block of SCALE's Copy option.
 */
export function scaleEntityCopy(
  entity: Entity,
  base: Vec2 | Vec3,
  factor: number
): Entity {
  const copy: Entity = (() => {
    switch (entity.type) {
      case "line":
        return createLine(
          scalePoint(entity.start, base, factor),
          scalePoint(entity.end, base, factor),
          entity.layerId
        )
      case "circle":
        return createCircle(
          scalePoint(entity.center, base, factor),
          entity.radius * factor,
          entity.layerId
        )
      case "arc":
        return createArc(
          scalePoint(entity.center, base, factor),
          entity.radius * factor,
          entity.startAngle,
          entity.endAngle,
          entity.layerId
        )
      case "ellipse":
        return ellipseLike(
          entity,
          scalePoint(entity.center, base, factor),
          V.scale(entity.majorAxis, factor)
        )
      case "spline":
        return splineCopy(entity, (p) => scalePoint(p, base, factor))
      case "polyline":
        return createPolyline(
          entity.vertices.map((v) => scalePoint(v, base, factor)),
          entity.closed,
          entity.layerId,
          entity.bulges
        )
      case "text":
        return textLike(entity, scalePoint(entity.position, base, factor), {
          height: entity.height * factor,
        })
      case "mtext":
        return mtextLike(entity, scalePoint(entity.position, base, factor), {
          height: entity.height * factor,
          width: entity.width * factor,
        })
      case "attdef":
        return attdefLike(entity, scalePoint(entity.position, base, factor), {
          height: entity.height * factor,
        })
      case "dimension":
        return dimensionLike(
          entity,
          mapDimensionPoints(entity, (p) => scalePoint(p, base, factor))
        )
      case "hatch":
        return hatchLike(
          entity,
          mapHatchLoops(entity, (p) => scalePoint(p, base, factor)),
          {
            patternScale: entity.patternScale * factor,
            origin: scalePoint(entity.origin, base, factor),
          }
        )
      case "insert":
        return insertLike(entity, scalePoint(entity.position, base, factor), {
          scale: entity.scale * factor,
        })
    }
  })()
  return scaleEntityZ(carryOverrides(entity, copy), zOf(base), factor)
}

/**
 * Reflects `point` across the infinite mirror line through `a` and `b`. A
 * degenerate line (a ≈ b) returns the point unchanged.
 */
export function mirrorPoint(point: Vec2, a: Vec2, b: Vec2): Vec2 {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const lenSq = dx * dx + dy * dy
  if (lenSq < 1e-12) return point
  const t = ((point.x - a.x) * dx + (point.y - a.y) * dy) / lenSq
  const footX = a.x + t * dx
  const footY = a.y + t * dy
  return { x: 2 * footX - point.x, y: 2 * footY - point.y }
}

/**
 * Returns a copy of `entity` reflected across the mirror line through `a`,`b`
 * (preserves its id) — MIRROR when the source is erased. A circle keeps its
 * radius; only its centre reflects.
 */
export function mirrorEntity(entity: Entity, a: Vec2, b: Vec2): Entity {
  switch (entity.type) {
    case "line":
      return {
        ...entity,
        start: mirrorPoint(entity.start, a, b),
        end: mirrorPoint(entity.end, a, b),
      }
    case "circle":
      return { ...entity, center: mirrorPoint(entity.center, a, b) }
    case "arc": {
      const angles = mirrorArcAngles(entity, a, b)
      return {
        ...entity,
        center: mirrorPoint(entity.center, a, b),
        startAngle: angles.startAngle,
        endAngle: angles.endAngle,
      }
    }
    case "ellipse":
      return {
        ...entity,
        center: mirrorPoint(entity.center, a, b),
        majorAxis: mappedMajorAxis(entity, (p) => mirrorPoint(p, a, b)),
        ...mirrorEllipseParams(entity),
      }
    case "spline":
      return mapSplinePoints(entity, (p) => mirrorPoint(p, a, b))
    case "polyline":
      return {
        ...entity,
        vertices: entity.vertices.map((v) => mirrorPoint(v, a, b)),
        // Reflection reverses orientation, so every arc's turn flips sign.
        ...(entity.bulges ? { bulges: negateBulges(entity.bulges) } : {}),
      }
    case "text":
    case "mtext":
    case "attdef":
      // Only the insertion point reflects: AutoCAD's MIRRTEXT defaults to 0,
      // which keeps mirrored text upright and readable.
      return { ...entity, position: mirrorPoint(entity.position, a, b) }
    case "dimension":
      return {
        ...entity,
        ...mapDimensionPoints(entity, (p) => mirrorPoint(p, a, b)),
        rotation: mirrorAngle(entity.rotation, a, b),
        ...(entity.textAngle !== undefined
          ? { textAngle: mirrorAngle(entity.textAngle, a, b) }
          : {}),
      }
    case "hatch":
      return {
        ...entity,
        loops: mapHatchLoops(
          entity,
          (p) => mirrorPoint(p, a, b),
          // Reflection reverses the loop's turn, so each arc's bulge flips.
          negateBulges
        ),
        patternAngle: mirrorAngle(entity.patternAngle, a, b),
        origin: mirrorPoint(entity.origin, a, b),
      }
    case "insert":
      return { ...entity, ...mirroredInsert(entity, a, b) }
  }
}

/**
 * How a block reference reflects. AutoCAD mirrors a reference by negating its X
 * scale, which is what {@link InsertEntity.mirrored} carries here. Composing the
 * reflection with the reference's own transform gives, for either starting
 * value of `mirrored`, the same pair: the rotation reflects and turns a further
 * half turn, and the reflection flag flips — so mirroring twice is the identity.
 */
function mirroredInsert(
  insert: InsertEntity,
  a: Vec2,
  b: Vec2
): Pick<InsertEntity, "position" | "rotation" | "mirrored"> {
  return {
    position: mirrorPoint(insert.position, a, b),
    rotation: mirrorAngle(insert.rotation, a, b) + Math.PI,
    mirrored: !insert.mirrored,
  }
}

/** Reflects a direction across the mirror line through `a`,`b`. */
function mirrorAngle(angle: number, a: Vec2, b: Vec2): number {
  return 2 * Math.atan2(b.y - a.y, b.x - a.x) - angle
}

/**
 * Returns a *new* entity (fresh id) reflecting `entity` across the mirror line
 * through `a`,`b`, on the same layer — MIRROR when the source is kept.
 */
export function mirrorEntityCopy(entity: Entity, a: Vec2, b: Vec2): Entity {
  const copy: Entity = (() => {
    switch (entity.type) {
      case "line":
        return createLine(
          mirrorPoint(entity.start, a, b),
          mirrorPoint(entity.end, a, b),
          entity.layerId
        )
      case "circle":
        return createCircle(
          mirrorPoint(entity.center, a, b),
          entity.radius,
          entity.layerId
        )
      case "arc": {
        const angles = mirrorArcAngles(entity, a, b)
        return createArc(
          mirrorPoint(entity.center, a, b),
          entity.radius,
          angles.startAngle,
          angles.endAngle,
          entity.layerId
        )
      }
      case "ellipse":
        return ellipseLike(
          entity,
          mirrorPoint(entity.center, a, b),
          mappedMajorAxis(entity, (p) => mirrorPoint(p, a, b)),
          mirrorEllipseParams(entity)
        )
      case "spline":
        return splineCopy(entity, (p) => mirrorPoint(p, a, b))
      case "polyline":
        return createPolyline(
          entity.vertices.map((v) => mirrorPoint(v, a, b)),
          entity.closed,
          entity.layerId,
          entity.bulges ? negateBulges(entity.bulges) : undefined
        )
      case "text":
        return textLike(entity, mirrorPoint(entity.position, a, b))
      case "mtext":
        return mtextLike(entity, mirrorPoint(entity.position, a, b))
      case "attdef":
        return attdefLike(entity, mirrorPoint(entity.position, a, b))
      case "dimension":
        return dimensionLike(
          entity,
          mapDimensionPoints(entity, (p) => mirrorPoint(p, a, b)),
          {
            rotation: mirrorAngle(entity.rotation, a, b),
            ...(entity.textAngle !== undefined
              ? { textAngle: mirrorAngle(entity.textAngle, a, b) }
              : {}),
          }
        )
      case "hatch":
        return hatchLike(
          entity,
          mapHatchLoops(entity, (p) => mirrorPoint(p, a, b), negateBulges),
          {
            patternAngle: mirrorAngle(entity.patternAngle, a, b),
            origin: mirrorPoint(entity.origin, a, b),
          }
        )
      case "insert": {
        const reflected = mirroredInsert(entity, a, b)
        return insertLike(entity, reflected.position, {
          rotation: reflected.rotation,
          mirrored: reflected.mirrored,
        })
      }
    }
  })()
  return carryOverrides(entity, copy)
}

/**
 * Reflecting an arc reverses its orientation, so to keep the CCW start→end
 * invariant the angles are both mirrored across the axis direction *and*
 * swapped: an angle φ reflects to `2α − φ` (α = the mirror line's direction),
 * and the swept ends trade places.
 */
function mirrorArcAngles(
  arc: ArcEntity,
  a: Vec2,
  b: Vec2
): { startAngle: number; endAngle: number } {
  const axis = Math.atan2(b.y - a.y, b.x - a.x)
  return {
    startAngle: 2 * axis - arc.endAngle,
    endAngle: 2 * axis - arc.startAngle,
  }
}

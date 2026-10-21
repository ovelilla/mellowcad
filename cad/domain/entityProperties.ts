import { Vec2, V } from "../geometry/Vec2"
import { ellipseParamFromAngle, normalizeAngle } from "../geometry/primitives"
import {
  LineEntity,
  CircleEntity,
  ArcEntity,
  EllipseEntity,
  TextEntity,
  MTextEntity,
  AttributeDefinitionEntity,
  InsertEntity,
  PolylineEntity,
  Entity,
} from "./entityTypes"
import {
  polylineSegments,
  polylineWidth,
  replacePolylineVertex,
  withPolylineClosed,
  withPolylineWidths,
} from "./polylines"
import {
  ellipseSemiMajor,
  ellipseSemiMinor,
  ellipseWithAxes,
  ellipseWithSpan,
} from "./ellipses"
import {
  MAX_LINE_SPACING_FACTOR,
  MIN_LINE_SPACING_FACTOR,
  mtextLinePitch,
} from "./mtext"
import {
  hasThickness,
  lineEndZ,
  lineStartZ,
  withDeltaZ,
  withElevation,
  withThickness,
} from "./elevation"

/** A geometry value that can be retyped directly on a selected entity. */
export type EntityProperty =
  | "startX"
  | "startY"
  | "endX"
  | "endY"
  | "radius"
  | "diameter"
  /** A circle's, which set its radius (desktop circle/d10). */
  | "circumference"
  | "area"
  | "majorRadius"
  | "minorRadius"
  /** An ellipse's minor radius over its major, the major kept. */
  | "radiusRatio"
  | "centerX"
  | "centerY"
  | "startAngle"
  | "endAngle"
  | "totalAngle"
  | "positionX"
  | "positionY"
  | "textHeight"
  | "rotation"
  | "definedWidth"
  | "lineSpaceFactor"
  | "lineSpaceDistance"
  | "dimensionRotation"
  | "patternScale"
  | "patternAngle"
  | "insertScale"
  /** The palette's current vertex of a polyline, 1-based: the runtime's, no geometry. */
  | "vertex"
  | "vertexX"
  | "vertexY"
  | "startSegmentWidth"
  | "endSegmentWidth"
  | "globalWidth"
  /** A polyline's Closed, a choice: 1 Yes, 0 No. */
  | "closed"
  | ZProperty

/** The rows that write an object's Z, all in the WCS here. */
export type ZProperty =
  "thickness" | "startZ" | "endZ" | "centerZ" | "positionZ" | "elevation"

const Z_PROPERTIES: ReadonlySet<EntityProperty> = new Set<ZProperty>([
  "thickness",
  "startZ",
  "endZ",
  "centerZ",
  "positionZ",
  "elevation",
])

export function isZProperty(property: EntityProperty): property is ZProperty {
  return Z_PROPERTIES.has(property)
}

/** Which types show each plane row, as AutoCAD's palette names it for them. */
const PLANE_ROWS: Readonly<
  Record<"centerZ" | "positionZ" | "elevation", readonly Entity["type"][]>
> = {
  centerZ: ["circle", "arc", "ellipse"],
  positionZ: ["text", "mtext", "attdef", "insert"],
  elevation: ["polyline", "hatch"],
}

/**
 * Rebuilds an entity with one geometry value replaced, following AutoCAD's
 * Properties palette: a line keeps its start point when you retype its length
 * or angle, a circle keeps its centre when you retype its radius. Angles are in
 * degrees, CCW from +X. Returns null when the value doesn't apply to the entity
 * or would degenerate it. A polyline's vertex rows act on its `vertex`th
 * vertex (0-based), the palette's current one.
 */
export function applyEntityProperty(
  entity: Entity,
  property: EntityProperty,
  value: number,
  vertex = 0
): Entity | null {
  if (!Number.isFinite(value)) return null
  if (isZProperty(property)) return applyZProperty(entity, property, value)
  switch (entity.type) {
    case "line":
      return applyLineProperty(entity, property, value)
    case "circle":
      return applyCircleProperty(entity, property, value)
    case "arc":
      return applyArcProperty(entity, property, value)
    case "ellipse":
      return applyEllipseProperty(entity, property, value)
    case "text":
    case "attdef":
      return applyTextProperty(entity, property, value)
    case "mtext":
      return applyMTextProperty(entity, property, value)
    case "dimension":
      // Only the measurement direction is a value: the definition points are
      // edited with grips and the measurement itself is derived, so AutoCAD
      // shows it read-only too.
      return property === "dimensionRotation" && entity.kind === "linear"
        ? { ...entity, rotation: toRadians(value) }
        : null
    case "hatch":
      // The pattern's scale and angle are AutoCAD's editable hatch rows; the
      // boundary is geometry the palette has no way to retype.
      if (property === "patternScale") {
        return value > 0 ? { ...entity, patternScale: value } : null
      }
      if (property === "patternAngle") {
        return { ...entity, patternAngle: toRadians(value) }
      }
      return null
    case "polyline":
      return applyPolylineProperty(entity, property, value, vertex)
    case "spline":
      return null
    case "insert":
      return applyInsertProperty(entity, property, value)
  }
}

const toRadians = (degrees: number) => (degrees * Math.PI) / 180

/**
 * A polyline's Geometry rows: the current vertex's X and Y, the starting and
 * ending width of the segment it starts, and the Global width every segment
 * takes. A width is never negative; the last vertex of an open polyline
 * starts no segment, so it has no widths to set.
 */
function applyPolylineProperty(
  poly: PolylineEntity,
  property: EntityProperty,
  value: number,
  vertex: number
): PolylineEntity | null {
  const { vertices } = poly
  if (vertex < 0 || vertex >= vertices.length) return null
  switch (property) {
    case "vertexX":
    case "vertexY": {
      const at = vertices[vertex]
      return replacePolylineVertex(
        poly,
        vertex,
        property === "vertexX" ? { x: value, y: at.y } : { x: at.x, y: value }
      )
    }
    case "startSegmentWidth":
    case "endSegmentWidth": {
      const count = polylineSegments(poly).length
      if (value < 0 || vertex >= count) return null
      const widths = polylineSegments(poly).map((_, i) =>
        polylineWidth(poly, i)
      )
      const [start, end] = widths[vertex]
      widths[vertex] =
        property === "startSegmentWidth" ? [value, end] : [start, value]
      return withPolylineWidths(poly, widths)
    }
    case "globalWidth":
      if (value < 0) return null
      return withPolylineWidths(
        poly,
        polylineSegments(poly).map(() => [value, value])
      )
    case "closed":
      return value === 0 || value === 1
        ? withPolylineClosed(poly, value === 1)
        : null
    default:
      return null
  }
}

function applyZProperty(
  entity: Entity,
  property: ZProperty,
  value: number
): Entity | null {
  switch (property) {
    case "thickness":
      return hasThickness(entity) ? withThickness(entity, value) : null
    case "startZ":
      return entity.type === "line"
        ? withDeltaZ(withElevation(entity, value), lineEndZ(entity) - value)
        : null
    case "endZ":
      return entity.type === "line"
        ? withDeltaZ(entity, value - lineStartZ(entity))
        : null
    case "centerZ":
    case "positionZ":
    case "elevation":
      return PLANE_ROWS[property].includes(entity.type)
        ? withElevation(entity, value)
        : null
  }
}

function applyLineProperty(
  line: LineEntity,
  property: EntityProperty,
  value: number
): LineEntity | null {
  // LINE keeps a zero-length line typed (line/p08), so an end retyped onto
  // the other is let be too: a rising line stands vertical.
  const moved = (start: Vec2, end: Vec2): LineEntity => ({
    ...line,
    start,
    end,
  })

  switch (property) {
    case "startX":
      return moved({ x: value, y: line.start.y }, line.end)
    case "startY":
      return moved({ x: line.start.x, y: value }, line.end)
    case "endX":
      return moved(line.start, { x: value, y: line.end.y })
    case "endY":
      return moved(line.start, { x: line.end.x, y: value })
    default:
      return null
  }
}

function applyCircleProperty(
  circle: CircleEntity,
  property: EntityProperty,
  value: number
): CircleEntity | null {
  switch (property) {
    case "radius":
      return value > 0 ? { ...circle, radius: value } : null
    case "diameter":
      return value > 0 ? { ...circle, radius: value / 2 } : null
    case "circumference":
      return value > 0 ? { ...circle, radius: value / (2 * Math.PI) } : null
    case "area":
      return value > 0
        ? { ...circle, radius: Math.sqrt(value / Math.PI) }
        : null
    case "centerX":
      return { ...circle, center: { x: value, y: circle.center.y } }
    case "centerY":
      return { ...circle, center: { x: circle.center.x, y: value } }
    default:
      return null
  }
}

function applyArcProperty(
  arc: ArcEntity,
  property: EntityProperty,
  value: number
): ArcEntity | null {
  switch (property) {
    case "radius":
      return value > 0 ? { ...arc, radius: value } : null
    case "centerX":
      return { ...arc, center: { x: value, y: arc.center.y } }
    case "centerY":
      return { ...arc, center: { x: arc.center.x, y: value } }
    case "startAngle":
      return { ...arc, startAngle: normalizeAngle(toRadians(value)) }
    case "endAngle":
      return { ...arc, endAngle: normalizeAngle(toRadians(value)) }
    case "totalAngle":
      // A sweep is CCW start→end, so a full turn lands back on the start angle.
      return value > 0 && value <= 360
        ? {
            ...arc,
            endAngle: normalizeAngle(arc.startAngle + toRadians(value)),
          }
        : null
    default:
      return null
  }
}

function applyEllipseProperty(
  ellipse: EllipseEntity,
  property: EntityProperty,
  value: number
): EllipseEntity | null {
  // Retyping one radius holds the other, so the ratio moves — and the axes
  // swap roles when the minor grows past the major, which is why this goes
  // through `ellipseWithAxes` rather than writing `ratio` by hand.
  switch (property) {
    case "majorRadius":
      return value > 0
        ? ellipseWithAxes(
            ellipse,
            V.scale(V.normalize(ellipse.majorAxis), value),
            ellipseSemiMinor(ellipse) / value
          )
        : null
    case "minorRadius":
      return value > 0
        ? ellipseWithAxes(
            ellipse,
            ellipse.majorAxis,
            value / ellipseSemiMajor(ellipse)
          )
        : null
    case "radiusRatio":
      // The minor over the major: above 1 it would name the other axis.
      return value > 0 && value <= 1
        ? ellipseWithAxes(ellipse, ellipse.majorAxis, value)
        : null
    case "centerX":
      return { ...ellipse, center: { x: value, y: ellipse.center.y } }
    case "centerY":
      return { ...ellipse, center: { x: ellipse.center.x, y: value } }
    case "startAngle":
    case "endAngle": {
      // An arc's angles, from the major axis: a whole ellipse's rows are
      // read-only, and an arc made whole by its angles is refused.
      if (ellipse.startParam === undefined || ellipse.endParam === undefined)
        return null
      const param = ellipseParamFromAngle(ellipse.ratio, toRadians(value))
      const arc =
        property === "startAngle"
          ? ellipseWithSpan(ellipse, param, ellipse.endParam)
          : ellipseWithSpan(ellipse, ellipse.startParam, param)
      return arc.startParam === undefined ? null : arc
    }
    default:
      return null
  }
}

function applyTextProperty<T extends TextEntity | AttributeDefinitionEntity>(
  text: T,
  property: EntityProperty,
  value: number
): T | null {
  switch (property) {
    case "positionX":
      return { ...text, position: { x: value, y: text.position.y } }
    case "positionY":
      return { ...text, position: { x: text.position.x, y: value } }
    case "textHeight":
      return value > 0 ? { ...text, height: value } : null
    case "rotation":
      return { ...text, rotation: toRadians(value) }
    default:
      return null
  }
}

function applyMTextProperty(
  mtext: MTextEntity,
  property: EntityProperty,
  value: number
): MTextEntity | null {
  switch (property) {
    case "positionX":
      return { ...mtext, position: { x: value, y: mtext.position.y } }
    case "positionY":
      return { ...mtext, position: { x: mtext.position.x, y: value } }
    case "textHeight":
      return value > 0 ? { ...mtext, height: value } : null
    case "rotation":
      return { ...mtext, rotation: toRadians(value) }
    case "definedWidth":
      return value >= 0 ? { ...mtext, width: value } : null
    case "lineSpaceFactor":
      return withLineSpacingFactor(mtext, value)
    case "lineSpaceDistance":
      // The two rows are one setting, so a distance is stored as the factor
      // it amounts to at this height, and both stay in step.
      return withLineSpacingFactor(
        mtext,
        (value / mtextLinePitch(mtext)) * mtext.lineSpacingFactor
      )
    default:
      return null
  }
}

function withLineSpacingFactor(
  mtext: MTextEntity,
  factor: number
): MTextEntity | null {
  return factor >= MIN_LINE_SPACING_FACTOR - 1e-9 &&
    factor <= MAX_LINE_SPACING_FACTOR + 1e-9
    ? { ...mtext, lineSpacingFactor: factor }
    : null
}

function applyInsertProperty(
  insert: InsertEntity,
  property: EntityProperty,
  value: number
): InsertEntity | null {
  switch (property) {
    case "positionX":
      return { ...insert, position: { x: value, y: insert.position.y } }
    case "positionY":
      return { ...insert, position: { x: insert.position.x, y: value } }
    case "insertScale":
      return value > 0 ? { ...insert, scale: value } : null
    case "rotation":
      return { ...insert, rotation: toRadians(value) }
    default:
      return null
  }
}

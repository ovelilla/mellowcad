/**
 * Entities are the CAD domain model: real geometry in world coordinates, never
 * screen pixels, so a drawing is resolution- and zoom-independent. They are
 * immutable plain data operated on by the pure functions behind this barrel.
 *
 * The implementations live in the sibling modules re-exported below; those
 * modules import each other directly, never through this file.
 */

export type {
  EntityId,
  EntityType,
  LineEntity,
  CircleEntity,
  ArcEntity,
  EllipseEntity,
  PolylineEntity,
  TextJustify,
  TextEntity,
  DimensionKind,
  DimensionEntity,
  HatchLoop,
  HatchEntity,
  BlockId,
  BlockDefinition,
  BlockLookup,
  InsertEntity,
  Entity,
  Bounds,
} from "./entityTypes"
export { TEXT_JUSTIFICATIONS } from "./entityTypes"

export type { HatchOptions, InsertOptions } from "./entityFactories"
export {
  nextEntityId,
  createLine,
  createCircle,
  createArc,
  createPolyline,
  createHatch,
  createInsert,
  createBlockDefinition,
} from "./entityFactories"

export { MAX_BLOCK_NESTING, insertGeometry, insertFlatGeometry } from "./blocks"

export type { EllipseOptions } from "./ellipses"
export {
  createEllipse,
  ellipseWithAxes,
  isFullEllipse,
  ellipseSemiMajor,
  ellipseSemiMinor,
  ellipseMinorAxis,
  ellipseRotation,
  ellipsePointAt,
  ellipseSweepParams,
  ellipseParamWithinSweep,
  ellipseStartPoint,
  ellipseEndPoint,
  ellipseMidpoint,
  ellipseQuadrantPoints,
  ellipseBounds,
  ellipseArea,
} from "./ellipses"

export type { HatchGeometry } from "./hatch"
export {
  hatchLoopFromEntity,
  hatchLoopSegments,
  MAX_HATCH_LINES,
  hatchGeometry,
  pointInsideHatch,
} from "./hatch"

export type { TextOptions } from "./text"
export {
  createText,
  measureTextWidth,
  TEXT_FONT_CAP_RATIO,
  TEXT_LINE_SPACING_FACTOR,
  textWidth,
  textCorners,
} from "./text"

export type {
  DimensionOptions,
  DimensionPoints,
  DimensionGeometry,
} from "./dimensions"
export {
  createDimension,
  mapDimensionPoints,
  dimensionAxisAngle,
  dimensionVertex,
  dimensionMeasurementUnit,
  dimensionMeasurement,
  dimensionText,
  dimensionGeometry,
} from "./dimensions"

export type { PolylineSegmentGeometry } from "./polylines"
export {
  polylineBulge,
  polylineSegmentGeometries,
  polylineSegments,
  polylineLength,
  polylineArea,
  replacePolylineVertex,
  insertPolylineVertex,
  removePolylineVertex,
  setPolylineBulge,
} from "./polylines"

export {
  assignTextStyle,
  assignDimStyle,
  assignEntityLayer,
  assignEntityColor,
  assignEntityLinetype,
  assignEntityLineweight,
  carryOverrides,
  matchEntityProperties,
} from "./entityOverrides"

export {
  translateEntity,
  stretchEntity,
  copyEntity,
  rotatePoint,
  rotateEntity,
  rotateEntityCopy,
  scalePoint,
  scaleEntity,
  scaleEntityCopy,
  mirrorPoint,
  mirrorEntity,
  mirrorEntityCopy,
} from "./entityTransforms"

export {
  distanceToEntity,
  closestOnEntity,
  entityBounds,
  entityDrawOrder,
  entitiesBounds,
  entityWithinRect,
  entityCrossesRect,
} from "./entityQueries"

export {
  lineMidpoint,
  lineLength,
  lineAngleDegrees,
  circleCircumference,
  circleArea,
  arcStartPoint,
  arcEndPoint,
  arcSweepAngle,
  arcMidpoint,
  arcLength,
} from "./entityMeasures"

export type { EntityProperty } from "./entityProperties"
export { applyEntityProperty } from "./entityProperties"

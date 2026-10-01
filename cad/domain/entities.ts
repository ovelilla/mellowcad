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
  SplineMethod,
  SplineEntity,
  PolylineEntity,
  TextJustify,
  TextEntity,
  MTextAttachment,
  LineSpacingStyle,
  MTextEntity,
  AttributeModes,
  AttributeDefinitionEntity,
  BlockAttribute,
  AttributeDisplay,
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
export { TEXT_JUSTIFICATIONS, MTEXT_ATTACHMENTS } from "./entityTypes"

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

export {
  MAX_BLOCK_NESTING,
  insertGeometry,
  insertFlatGeometry,
  insertAttributePoints,
} from "./blocks"

export type { AttributeDefinitionOptions } from "./attributes"
export {
  DEFAULT_ATTRIBUTE_MODES,
  createAttributeDefinition,
  attributeTag,
  attributeInput,
  attributePrompt,
  variableAttributes,
  blockAttribute,
  attributeShown,
  attributeDefinitionText,
} from "./attributes"

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

export type { SplineOptions } from "./splines"
export {
  MAX_SPLINE_DEGREE,
  DEFAULT_SPLINE_DEGREE,
  createSpline,
  mapSplinePoints,
  splineCopy,
  splineWithPoint,
  splineCurve,
  splineControlFrame,
  splinePolyline,
  splineStartPoint,
  splineEndPoint,
  splineLength,
  splineMidpoint,
  splineArea,
  splineBounds,
  closestPointOnSpline,
} from "./splines"

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

export type { MTextOptions, MTextLine, MTextLayout } from "./mtext"
export {
  createMText,
  MIN_LINE_SPACING_FACTOR,
  MAX_LINE_SPACING_FACTOR,
  clampLineSpacingFactor,
  mtextPlainText,
  mtextContents,
  mtextLinePitch,
  mtextLayout,
  mtextAlign,
  mtextToWorld,
  mtextFromWorld,
  mtextCorners,
  mtextLineTexts,
} from "./mtext"

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
  carryPiece,
  matchEntityProperties,
} from "./entityOverrides"

export type { ThickEntity } from "./elevation"
export {
  hasThickness,
  entityElevation,
  entityThickness,
  lineStartZ,
  lineEndZ,
  lineLength3d,
  withElevation,
  withThickness,
  withDeltaZ,
  shiftEntityZ,
  scaleEntityZ,
  carryPlane,
  onPlaneOf,
  entityZAt,
  withLineZ,
  isLevel,
  coplanar,
  linesPlaneNormal,
  entityNormal,
  isTilted,
  withNormal,
  entityAxes,
  planeAxes,
  readsInPlan,
  entityPointToWorld,
  worldToEntity,
  sameNormal,
  facesAlong,
} from "./elevation"

export type { Similarity3 } from "./entityTransforms"
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
  transformEntity,
  translation3,
  scaling3,
  rotationAboutZ,
  reflectionAcross,
  entityInOcs,
  entityFromOcs,
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
export { applyEntityProperty, isZProperty } from "./entityProperties"

/**
 * Drawing persistence format. Geometry is stored as plain, human-readable JSON
 * in world coordinates so a saved file is resolution/zoom independent and can
 * be consumed by other tools. The schema is intentionally small and versioned:
 *
 * ```jsonc
 * {
 *   "type": "easycad-drawing",   // magic string identifying the format
 *   "version": 3,                 // schema version (readers reject newer ones)
 *   "generator": "mellowcad",     // free-form provenance hint
 *   "settings": { "unit": "mm", "precision": 2 },
 *   "layers": [
 *     { "id": "0", "name": "0", "color": "#e2e8f0", "visible": true, "locked": false }
 *   ],
 *   "currentLayerId": "0",
 *   "entities": [
 *     { "id": "e1", "type": "line",   "layerId": "0", "start": {"x":0,"y":0}, "end": {"x":10,"y":0} },
 *     { "id": "e2", "type": "circle", "layerId": "0", "center": {"x":0,"y":0}, "radius": 5 }
 *   ]
 * }
 * ```
 *
 * The reader is deliberately tolerant (forward-compatible): unknown fields are
 * ignored and unknown / malformed entities are skipped rather than aborting the
 * whole load, so files produced by other or newer minor tooling still open.
 */

import { COLOR_BYLAYER, normalizeColor } from "../domain/colors"
import { MAX_ARRAY_COUNT, arrayPathOfPieces } from "../domain/arrays"
import {
  ArrayParameters,
  ArrayPathPiece,
  AttributeModes,
  BlockAttribute,
  BlockDefinition,
  createAttributeDefinition,
  createBlockDefinition,
  createEllipse,
  createSpline,
  createMText,
  DEFAULT_ATTRIBUTE_MODES,
  Entity,
  isAnonymousBlock,
  nextEntityId,
  DimensionKind,
  HatchLoop,
  hasThickness,
  isWidePolyline,
  polylineConstantWidth,
  PolylineEntity,
  polylineSegments,
  polylineWidth,
  PolylineWidth,
  PolylineFit,
  FitArcs,
  Polyline3dFit,
  MTEXT_ATTACHMENTS,
  MTextAttachment,
  TEXT_JUSTIFICATIONS,
  TextJustify,
  withDeltaZ,
  withElevation,
  withNormal,
  withThickness,
  SolidPrimitive,
} from "../domain/entities"
import {
  DEFAULT_HATCH_ANGLE,
  DEFAULT_HATCH_PATTERN_ID,
  DEFAULT_HATCH_SCALE,
} from "../domain/hatchPatterns"
import {
  createDefaultTextStyle,
  DEFAULT_TEXT_HEIGHT,
  DEFAULT_TEXT_STYLE_ID,
  TextStyle,
  TextStyleId,
} from "../domain/textStyles"
import {
  clampDecimalSeparator,
  clampDimScale,
  createDefaultDimStyle,
  DEFAULT_DIM_STYLE,
  DEFAULT_DIM_STYLE_ID,
  DimStyle,
  DimStyleId,
} from "../domain/dimStyles"
import {
  createDefaultLayer,
  DEFAULT_LAYER_COLOR,
  DEFAULT_LAYER_ID,
  Layer,
  LayerId,
} from "../domain/layers"
import { DEFAULT_LINETYPE_ID, LINETYPE_BYLAYER } from "../domain/linetypes"
import {
  clampLineweight,
  DEFAULT_LINEWEIGHT,
  LINEWEIGHT_BYLAYER,
} from "../domain/lineweights"
import {
  createUcs,
  isUpright,
  NamedUcs,
  ORTHOGRAPHIC_UCS,
  OrthographicUcs,
  Ucs,
  ucsFromAxes,
  WORLD_UCS,
} from "../domain/ucs"
import { Vec2 } from "../geometry/Vec2"
import { bsplineDomain } from "../geometry/nurbs"
import { PlanarCurve } from "../geometry/planarCurves"
import { RegionFace } from "../geometry/planarRegions"
import {
  Brep,
  BrepCurve,
  BrepFace,
  BrepSurface,
  brepIsClosed,
} from "../geometry/solids"
import { Vec3, dot3, length3 } from "../geometry/Vec3"
import {
  DEFAULT_DOCUMENT_SETTINGS,
  DocumentSettings,
  LengthUnit,
  LENGTH_UNITS,
  SavedView,
} from "../domain/units"
import { DRAWING_FILE_TYPE } from "./drawingSummary"

export { DRAWING_FILE_TYPE }

/** Current schema version written by {@link serializeDrawing}. */
export const DRAWING_FILE_VERSION = 46

/** MIME type a serialised drawing is handed to the host as. */
export const DRAWING_FILE_MIME_TYPE = "application/json"

/** `accept` filter for a file picker offering mellowcad drawings. */
export const DRAWING_FILE_ACCEPT = ".json,.ecad,application/json"

/** Everything that persists: the pure data view of a document. */
export interface DrawingSnapshot {
  readonly settings: DocumentSettings
  readonly layers: readonly Layer[]
  readonly currentLayerId: LayerId
  readonly textStyles: readonly TextStyle[]
  readonly currentTextStyleId: TextStyleId
  readonly dimStyles: readonly DimStyle[]
  readonly currentDimStyleId: DimStyleId
  readonly blocks: readonly BlockDefinition[]
  readonly entities: readonly Entity[]
}

/**
 * The settings as written: a zero ELEVATION or THICKNESS is left out, as on
 * objects, and so are a shown ViewCube (NAVVCUBEDISPLAY 3) and the default
 * Home view, so a drawing that never touched them reads as before 24, and a
 * current colour, linetype or lineweight that is ByLayer, as before 25, and a
 * UCS set as no orthographic one, as before 26, and FILLMODE on and PLINEWID 0,
 * as before 27, and FILLETRAD, CHAMFERA, CHAMFERB, TEXTSIZE, TEXT's
 * justification, ORTHOMODE, SNAPMODE, SNAPUNIT and GRIDMODE at acadiso's,
 * as before 28.
 */
export type StoredSettings = Omit<
  DocumentSettings,
  | SavedCommandSetting
  | "textRotation"
  | "hatchPatternName"
  | "hatchPatternScale"
  | "hatchPatternAngle"
  | "fillMode"
  | "polylineWidth"
  | "anglePrecision"
  | "elevation"
  | "thickness"
  | "ucs"
  | "ucsOrthographic"
  | "namedUcs"
  | "viewCube"
  | "currentColor"
  | "currentLinetype"
  | "currentLineweight"
> &
  Partial<
    Pick<
      DocumentSettings,
      | "anglePrecision"
      | "elevation"
      | "thickness"
      | "currentColor"
      | "currentLinetype"
      | "currentLineweight"
    >
  > &
  Partial<Pick<DocumentSettings, SavedCommandSetting>> & {
    readonly ucsOrthographic?: OrthographicUcs
    readonly fillMode?: false
    readonly polylineWidth?: number
    readonly ucs: StoredUcs
    readonly namedUcs: readonly { name: string; ucs: StoredUcs }[]
    readonly navVCubeDisplay?: 0
    readonly homeView?: SavedView
  }

/** The command settings AutoCAD saves in the drawing, written only when not the default. */
type SavedCommandSetting =
  | "filletRadius"
  | "splineType"
  | "splineSegments"
  | "isolines"
  | "chamferDistance1"
  | "chamferDistance2"
  | "textSize"
  | "textJustify"
  | "orthoMode"
  | "snapMode"
  | "snapUnit"
  | "gridMode"

/** A level UCS is written as before 23, its X axis in plan; a tilted one gives both axes. */
export type StoredUcs =
  | { readonly origin: Vec3; readonly xAxis: Vec2 }
  | { readonly origin: Vec3; readonly xAxis: Vec3; readonly yAxis: Vec3 }

/** Shape of a serialised drawing on disk. */
export interface DrawingFile {
  readonly type: typeof DRAWING_FILE_TYPE
  readonly version: number
  readonly generator: string
  readonly settings: StoredSettings
  readonly layers: Layer[]
  readonly currentLayerId: LayerId
  readonly textStyles: TextStyle[]
  readonly currentTextStyleId: TextStyleId
  readonly dimStyles: DimStyle[]
  readonly currentDimStyleId: DimStyleId
  readonly blocks: BlockDefinition[]
  readonly entities: Entity[]
}

/** Result of parsing a drawing file: everything needed to rebuild a document. */
export interface ParsedDrawing {
  readonly settings: DocumentSettings
  readonly layers: Layer[]
  readonly currentLayerId: LayerId
  readonly textStyles: TextStyle[]
  readonly currentTextStyleId: TextStyleId
  readonly dimStyles: DimStyle[]
  readonly currentDimStyleId: DimStyleId
  readonly blocks: BlockDefinition[]
  readonly entities: Entity[]
}

export function toDrawingFile(snapshot: DrawingSnapshot): DrawingFile {
  return {
    type: DRAWING_FILE_TYPE,
    version: DRAWING_FILE_VERSION,
    generator: "mellowcad",
    settings: storedSettings(snapshot.settings),
    layers: snapshot.layers.map(cloneLayer),
    currentLayerId: snapshot.currentLayerId,
    textStyles: snapshot.textStyles.map(cloneTextStyle),
    currentTextStyleId: snapshot.currentTextStyleId,
    dimStyles: snapshot.dimStyles.map(cloneDimStyle),
    currentDimStyleId: snapshot.currentDimStyleId,
    blocks: savedBlocks(snapshot.blocks, snapshot.entities).map(cloneBlock),
    entities: snapshot.entities.map(cloneEntity),
  }
}

/**
 * The block table as written: an anonymous block (an array's) no reference
 * places any more is left out. WHY only on writing: in the session an undo
 * can bring its reference back, which a loaded drawing's cleared history
 * cannot. AutoCAD drops unreferenced anonymous blocks when it saves too
 * (**unverified** by a probe).
 */
function savedBlocks(
  blocks: readonly BlockDefinition[],
  entities: readonly Entity[]
): readonly BlockDefinition[] {
  const byId = new Map(blocks.map((block) => [block.id, block]))
  const placed = new Set<string>()
  const visit = (list: readonly Entity[]): void => {
    for (const entity of list) {
      if (entity.type !== "insert" || placed.has(entity.blockId)) continue
      placed.add(entity.blockId)
      visit(byId.get(entity.blockId)?.entities ?? [])
    }
  }
  visit(entities)
  for (const block of blocks) {
    if (!isAnonymousBlock(block.name)) visit(block.entities)
  }
  return blocks.filter(
    (block) => !isAnonymousBlock(block.name) || placed.has(block.id)
  )
}

export function serializeDrawing(snapshot: DrawingSnapshot): string {
  return JSON.stringify(toDrawingFile(snapshot), null, 2)
}

/** Why a drawing could not be read. */
export type DrawingFileErrorCode =
  "invalidJson" | "unrecognised" | "notADrawing" | "newerVersion"

const DRAWING_FILE_ERRORS: Readonly<Record<DrawingFileErrorCode, string>> = {
  invalidJson: "The file is not valid JSON.",
  unrecognised: "Unrecognised drawing file.",
  notADrawing: "This file is not a MellowCAD drawing.",
  newerVersion:
    "This drawing was created with a newer version of MellowCAD. Please update to open it.",
}

/**
 * A drawing that cannot be read. `code` is what a user is told, worded by the
 * engine's catalog in their language; `message` stays English, for logs.
 */
export class DrawingFileError extends Error {
  constructor(readonly code: DrawingFileErrorCode) {
    super(DRAWING_FILE_ERRORS[code])
    this.name = "DrawingFileError"
  }
}

/**
 * Parses and validates a drawing file's text. Throws a {@link DrawingFileError}
 * when the text is not JSON, is not a MellowCAD drawing, or was written by a
 * newer schema version. Individual malformed entities are skipped, not fatal.
 */
export function parseDrawingFile(text: string): ParsedDrawing {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    throw new DrawingFileError("invalidJson")
  }
  return parseDrawingData(data)
}

/**
 * The half of {@link parseDrawingFile} that works on already-parsed JSON, so a
 * drawing nested inside another document — a clipboard fragment — is read by
 * the same tolerant reader instead of being re-stringified to get at it.
 */
export function parseDrawingData(data: unknown): ParsedDrawing {
  if (!isRecord(data)) throw new DrawingFileError("unrecognised")
  if (data.type !== DRAWING_FILE_TYPE) {
    throw new DrawingFileError("notADrawing")
  }

  const version = isFiniteNumber(data.version) ? data.version : 0
  if (version > DRAWING_FILE_VERSION) {
    throw new DrawingFileError("newerVersion")
  }

  const blocks = parseBlocks(data.blocks, version)
  const defined = new Set(blocks.map((block) => block.id))
  const entities = parseEntities(data.entities, version)

  return {
    settings: parseSettings(data.settings),
    layers: parseLayers(data.layers),
    currentLayerId: parseLayerId(data.currentLayerId),
    textStyles: parseTextStyles(data.textStyles),
    currentTextStyleId: parseId(data.currentTextStyleId, DEFAULT_TEXT_STYLE_ID),
    dimStyles: parseDimStyles(data.dimStyles),
    currentDimStyleId: parseId(data.currentDimStyleId, DEFAULT_DIM_STYLE_ID),
    blocks,
    // A reference to a block this file does not define draws nothing and can
    // never be repaired, so it is dropped like any other malformed entity.
    entities: entities.filter(
      (entity) => entity.type !== "insert" || defined.has(entity.blockId)
    ),
  }
}

function cloneEntity(entity: Entity): Entity {
  return { ...cloneEntityShape(entity), ...planeOf(entity) }
}

/** The plane fields, written only when they are not 0 (or, the normal, +Z). */
function planeOf(entity: Entity): {
  elevation?: number
  deltaZ?: number
  thickness?: number
  normal?: Vec3
} {
  return {
    ...(entity.elevation ? { elevation: entity.elevation } : {}),
    ...(entity.type === "line" && entity.deltaZ
      ? { deltaZ: entity.deltaZ }
      : {}),
    ...(hasThickness(entity) && entity.thickness
      ? { thickness: entity.thickness }
      : {}),
    ...(entity.normal ? { normal: { ...entity.normal } } : {}),
  }
}

function cloneEntityShape(entity: Entity): Entity {
  const color = entity.color ? { color: entity.color } : {}
  const linetype = entity.linetype ? { linetype: entity.linetype } : {}
  const lineweight =
    entity.lineweight !== undefined ? { lineweight: entity.lineweight } : {}
  const overrides = { ...color, ...linetype, ...lineweight }
  switch (entity.type) {
    case "line":
      return {
        id: entity.id,
        type: "line",
        layerId: entity.layerId,
        ...overrides,
        start: { x: entity.start.x, y: entity.start.y },
        end: { x: entity.end.x, y: entity.end.y },
      }
    case "circle":
      return {
        id: entity.id,
        type: "circle",
        layerId: entity.layerId,
        ...overrides,
        center: { x: entity.center.x, y: entity.center.y },
        radius: entity.radius,
      }
    case "arc":
      return {
        id: entity.id,
        type: "arc",
        layerId: entity.layerId,
        ...overrides,
        center: { x: entity.center.x, y: entity.center.y },
        radius: entity.radius,
        startAngle: entity.startAngle,
        endAngle: entity.endAngle,
      }
    case "ellipse":
      return {
        id: entity.id,
        type: "ellipse",
        layerId: entity.layerId,
        ...overrides,
        center: { x: entity.center.x, y: entity.center.y },
        majorAxis: { x: entity.majorAxis.x, y: entity.majorAxis.y },
        ratio: entity.ratio,
        // Absent on a full ellipse, exactly as DXF omits nothing but means the
        // same by writing the whole 0..2π range.
        ...(entity.startParam !== undefined && entity.endParam !== undefined
          ? { startParam: entity.startParam, endParam: entity.endParam }
          : {}),
      }
    case "spline":
      return {
        id: entity.id,
        type: "spline",
        layerId: entity.layerId,
        ...overrides,
        method: entity.method,
        points: entity.points.map((p) => ({ x: p.x, y: p.y, z: p.z })),
        degree: entity.degree,
        knots: entity.knots,
        closed: entity.closed,
        ...(entity.startTangent
          ? { startTangent: { ...entity.startTangent } }
          : {}),
        ...(entity.endTangent ? { endTangent: { ...entity.endTangent } } : {}),
        ...(entity.knotVector ? { knotVector: [...entity.knotVector] } : {}),
        ...(entity.weights ? { weights: [...entity.weights] } : {}),
      }
    case "polyline":
      return {
        id: entity.id,
        type: "polyline",
        layerId: entity.layerId,
        ...overrides,
        vertices: entity.vertices.map((v) => ({ x: v.x, y: v.y })),
        closed: entity.closed,
        ...(entity.bulges ? { bulges: entity.bulges.slice() } : {}),
        ...storedWidths(entity),
        ...(entity.linetypeGeneration ? { linetypeGeneration: true } : {}),
        ...(entity.fit ? { fit: storedFit(entity.fit) } : {}),
      }
    case "polyline3d":
      return {
        id: entity.id,
        type: "polyline3d",
        layerId: entity.layerId,
        ...overrides,
        vertices: entity.vertices.map((v) => ({ x: v.x, y: v.y, z: v.z })),
        closed: entity.closed,
        ...(entity.fit ? { fit: { ...entity.fit } } : {}),
      }
    case "text":
      return {
        id: entity.id,
        type: "text",
        layerId: entity.layerId,
        ...overrides,
        position: { x: entity.position.x, y: entity.position.y },
        value: entity.value,
        height: entity.height,
        rotation: entity.rotation,
        justify: entity.justify,
        styleId: entity.styleId,
      }
    case "mtext":
      return {
        id: entity.id,
        type: "mtext",
        layerId: entity.layerId,
        ...overrides,
        position: { x: entity.position.x, y: entity.position.y },
        contents: entity.contents,
        height: entity.height,
        width: entity.width,
        rotation: entity.rotation,
        attachment: entity.attachment,
        lineSpacingStyle: entity.lineSpacingStyle,
        lineSpacingFactor: entity.lineSpacingFactor,
        styleId: entity.styleId,
      }
    case "attdef":
      return {
        id: entity.id,
        type: "attdef",
        layerId: entity.layerId,
        ...overrides,
        position: { x: entity.position.x, y: entity.position.y },
        height: entity.height,
        rotation: entity.rotation,
        justify: entity.justify,
        styleId: entity.styleId,
        tag: entity.tag,
        prompt: entity.prompt,
        value: entity.value,
        modes: { ...entity.modes },
      }
    case "dimension":
      return {
        id: entity.id,
        type: "dimension",
        layerId: entity.layerId,
        ...overrides,
        kind: entity.kind,
        first: { x: entity.first.x, y: entity.first.y },
        second: { x: entity.second.x, y: entity.second.y },
        linePoint: { x: entity.linePoint.x, y: entity.linePoint.y },
        ...(entity.vertex
          ? { vertex: { x: entity.vertex.x, y: entity.vertex.y } }
          : {}),
        ...(entity.textPoint
          ? { textPoint: { x: entity.textPoint.x, y: entity.textPoint.y } }
          : {}),
        rotation: entity.rotation,
        ...(entity.text !== undefined ? { text: entity.text } : {}),
        ...(entity.textAngle !== undefined
          ? { textAngle: entity.textAngle }
          : {}),
        styleId: entity.styleId,
      }
    case "hatch":
      return {
        id: entity.id,
        type: "hatch",
        layerId: entity.layerId,
        ...overrides,
        loops: entity.loops.map((loop) => ({
          vertices: loop.vertices.map((v) => ({ x: v.x, y: v.y })),
          ...(loop.bulges ? { bulges: loop.bulges.slice() } : {}),
        })),
        patternId: entity.patternId,
        patternScale: entity.patternScale,
        patternAngle: entity.patternAngle,
        origin: { x: entity.origin.x, y: entity.origin.y },
      }
    case "insert":
      return {
        id: entity.id,
        type: "insert",
        layerId: entity.layerId,
        ...overrides,
        blockId: entity.blockId,
        position: { x: entity.position.x, y: entity.position.y },
        scaleX: entity.scaleX,
        scaleY: entity.scaleY,
        rotation: entity.rotation,
        ...(entity.attributes
          ? { attributes: entity.attributes.map(cloneBlockAttribute) }
          : {}),
        ...(entity.array ? { array: cloneArray(entity.array) } : {}),
      }
    case "region":
      return {
        id: entity.id,
        type: "region",
        layerId: entity.layerId,
        ...overrides,
        faces: entity.faces.map((face) => ({
          loops: face.loops.map((loop) => loop.map(storedEdge)),
        })),
      }
    case "solid3d":
      return {
        id: entity.id,
        type: "solid3d",
        layerId: entity.layerId,
        ...overrides,
        brep: storedBrep(entity.brep),
        ...(entity.primitive ? { primitive: { ...entity.primitive } } : {}),
      }
  }
}

/** A solid's boundary as the file holds it, nothing but its own fields. */
function storedBrep(brep: Brep): Brep {
  return {
    vertices: brep.vertices.map(storedVec3),
    edges: brep.edges.map((e) => ({
      start: e.start,
      end: e.end,
      curve: storedCurve(e.curve),
    })),
    faces: brep.faces.map((face) => ({
      surface: storedSurface(face.surface),
      loops: face.loops.map((loop) =>
        loop.map((c) => ({ edge: c.edge, reversed: c.reversed }))
      ),
    })),
  }
}

const storedVec3 = (v: Vec3): Vec3 => ({ x: v.x, y: v.y, z: v.z })

function storedCurve(c: BrepCurve): BrepCurve {
  switch (c.kind) {
    case "line":
    case "point":
      return { kind: c.kind }
    case "circle":
      return {
        kind: "circle",
        center: storedVec3(c.center),
        normal: storedVec3(c.normal),
        radius: c.radius,
      }
    case "ellipse":
      return {
        kind: "ellipse",
        center: storedVec3(c.center),
        normal: storedVec3(c.normal),
        majorAxis: storedVec3(c.majorAxis),
        ratio: c.ratio,
      }
  }
}

function storedSurface(s: BrepSurface): BrepSurface {
  switch (s.kind) {
    case "plane":
      return {
        kind: "plane",
        origin: storedVec3(s.origin),
        normal: storedVec3(s.normal),
      }
    case "cylinder":
      return {
        kind: "cylinder",
        origin: storedVec3(s.origin),
        axis: storedVec3(s.axis),
        xAxis: storedVec3(s.xAxis),
        radius: s.radius,
        ratio: s.ratio,
      }
    case "cone":
      return {
        kind: "cone",
        apex: storedVec3(s.apex),
        axis: storedVec3(s.axis),
        xAxis: storedVec3(s.xAxis),
        slope: s.slope,
        ratio: s.ratio,
      }
    case "sphere":
      return {
        kind: "sphere",
        center: storedVec3(s.center),
        axis: storedVec3(s.axis),
        xAxis: storedVec3(s.xAxis),
        radius: s.radius,
      }
    case "torus":
      return {
        kind: "torus",
        center: storedVec3(s.center),
        axis: storedVec3(s.axis),
        xAxis: storedVec3(s.xAxis),
        majorRadius: s.majorRadius,
        minorRadius: s.minorRadius,
      }
  }
}

/** A region's edge as the file holds it, nothing but its own fields. */
function storedEdge(edge: PlanarCurve): PlanarCurve {
  switch (edge.kind) {
    case "line":
      return {
        kind: "line",
        start: { x: edge.start.x, y: edge.start.y },
        end: { x: edge.end.x, y: edge.end.y },
      }
    case "arc":
      return {
        kind: "arc",
        center: { x: edge.center.x, y: edge.center.y },
        radius: edge.radius,
        startAngle: edge.startAngle,
        sweep: edge.sweep,
      }
    case "ellipse":
      return {
        kind: "ellipse",
        center: { x: edge.center.x, y: edge.center.y },
        majorAxis: { x: edge.majorAxis.x, y: edge.majorAxis.y },
        ratio: edge.ratio,
        startParam: edge.startParam,
        sweep: edge.sweep,
      }
    case "spline":
      return {
        kind: "spline",
        curve: {
          degree: edge.curve.degree,
          knots: [...edge.curve.knots],
          controlPoints: edge.curve.controlPoints.map((p) => ({
            x: p.x,
            y: p.y,
            z: 0,
          })),
          ...(edge.curve.weights ? { weights: [...edge.curve.weights] } : {}),
        },
        from: edge.from,
        to: edge.to,
      }
  }
}

function cloneArray(array: ArrayParameters): ArrayParameters {
  switch (array.kind) {
    case "rectangular":
      return {
        kind: "rectangular",
        columns: array.columns,
        rows: array.rows,
        colSpacing: array.colSpacing,
        rowSpacing: array.rowSpacing,
        rowElevation: array.rowElevation,
        levels: array.levels,
        levelSpacing: array.levelSpacing,
        axis: { x: array.axis.x, y: array.axis.y },
      }
    case "polar":
      return {
        kind: "polar",
        center: { x: array.center.x, y: array.center.y },
        basePoint: { x: array.basePoint.x, y: array.basePoint.y },
        items: array.items,
        fill: array.fill,
        clockwise: array.clockwise,
        rotate: array.rotate,
        ...(array.sourceBase
          ? { sourceBase: { x: array.sourceBase.x, y: array.sourceBase.y } }
          : {}),
      }
    case "path":
      return {
        kind: "path",
        path: {
          pieces: array.path.pieces.map(clonePathPiece),
          length: array.path.length,
          closed: array.path.closed,
        },
        pathId: array.pathId,
        method: array.method,
        items: array.items,
        spacing: array.spacing,
        align: array.align,
      }
  }
}

function clonePathPiece(piece: ArrayPathPiece): ArrayPathPiece {
  return piece.kind === "line"
    ? {
        kind: "line",
        a: { x: piece.a.x, y: piece.a.y },
        b: { x: piece.b.x, y: piece.b.y },
      }
    : {
        kind: "arc",
        center: { x: piece.center.x, y: piece.center.y },
        radius: piece.radius,
        start: piece.start,
        sweep: piece.sweep,
      }
}

function cloneBlockAttribute(attribute: BlockAttribute): BlockAttribute {
  return {
    tag: attribute.tag,
    value: attribute.value,
    position: { x: attribute.position.x, y: attribute.position.y },
    ...(attribute.elevation ? { elevation: attribute.elevation } : {}),
    height: attribute.height,
    rotation: attribute.rotation,
    justify: attribute.justify,
    styleId: attribute.styleId,
    invisible: attribute.invisible,
    layerId: attribute.layerId,
    ...(attribute.color ? { color: attribute.color } : {}),
    ...(attribute.linetype ? { linetype: attribute.linetype } : {}),
    ...(attribute.lineweight !== undefined
      ? { lineweight: attribute.lineweight }
      : {}),
  }
}

function cloneBlock(block: BlockDefinition): BlockDefinition {
  return {
    id: block.id,
    name: block.name,
    basePoint: { x: block.basePoint.x, y: block.basePoint.y },
    ...(block.baseElevation ? { baseElevation: block.baseElevation } : {}),
    entities: block.entities.map(cloneEntity),
  }
}

/**
 * The block table. A definition needs a name (which is its identity) and at
 * least one object; anything else is skipped, like a malformed entity.
 */
function parseBlocks(value: unknown, version: number): BlockDefinition[] {
  if (!Array.isArray(value)) return []
  const blocks: BlockDefinition[] = []
  const seen = new Set<string>()
  for (const raw of value) {
    if (!isRecord(raw)) continue
    const name =
      typeof raw.name === "string" && raw.name.length > 0
        ? raw.name
        : typeof raw.id === "string" && raw.id.length > 0
          ? raw.id
          : null
    if (!name || seen.has(name)) continue
    const entities = parseEntities(raw.entities, version)
    if (entities.length === 0) continue
    seen.add(name)
    blocks.push(
      createBlockDefinition(
        name,
        parseVec2(raw.basePoint) ?? { x: 0, y: 0 },
        entities,
        isFiniteNumber(raw.baseElevation) ? raw.baseElevation : 0
      )
    )
  }
  return blocks
}

function cloneDimStyle(style: DimStyle): DimStyle {
  return { ...style }
}

function cloneTextStyle(style: TextStyle): TextStyle {
  return { id: style.id, name: style.name, height: style.height }
}

function cloneLayer(layer: Layer): Layer {
  return {
    id: layer.id,
    name: layer.name,
    color: layer.color,
    linetype: layer.linetype,
    lineweight: layer.lineweight,
    visible: layer.visible,
    locked: layer.locked,
  }
}

function storedSettings(settings: DocumentSettings): StoredSettings {
  const {
    filletRadius,
    splineType,
    splineSegments,
    isolines,
    chamferDistance1,
    chamferDistance2,
    textSize,
    textJustify,
    textRotation,
    hatchPatternName,
    hatchPatternScale,
    hatchPatternAngle,
    orthoMode,
    snapMode,
    snapUnit,
    gridMode,
    fillMode,
    polylineWidth,
    anglePrecision,
    elevation,
    thickness,
    ucs,
    ucsOrthographic,
    namedUcs,
    viewCube,
    currentColor,
    currentLinetype,
    currentLineweight,
    ...rest
  } = settings
  // TEXT's rotation and the HP variables are per drawing, never saved
  // (rectang/p311, p303).
  void textRotation
  void hatchPatternName
  void hatchPatternScale
  void hatchPatternAngle
  return {
    ...rest,
    ...(currentColor !== COLOR_BYLAYER ? { currentColor } : {}),
    ...(currentLinetype !== LINETYPE_BYLAYER ? { currentLinetype } : {}),
    ...(currentLineweight !== LINEWEIGHT_BYLAYER ? { currentLineweight } : {}),
    ucs: storedUcs(ucs),
    ...(ucsOrthographic ? { ucsOrthographic } : {}),
    namedUcs: namedUcs.map((entry) => ({
      name: entry.name,
      ucs: storedUcs(entry.ucs),
    })),
    ...(anglePrecision ? { anglePrecision } : {}),
    ...(elevation ? { elevation } : {}),
    ...(thickness ? { thickness } : {}),
    ...(fillMode ? {} : { fillMode: false as const }),
    ...(polylineWidth ? { polylineWidth } : {}),
    ...(filletRadius ? { filletRadius } : {}),
    ...(splineType !== 6 ? { splineType } : {}),
    ...(splineSegments !== 8 ? { splineSegments } : {}),
    ...(isolines !== 4 ? { isolines } : {}),
    ...(chamferDistance1 ? { chamferDistance1 } : {}),
    ...(chamferDistance2 ? { chamferDistance2 } : {}),
    ...(textSize !== DEFAULT_DOCUMENT_SETTINGS.textSize ? { textSize } : {}),
    ...(textJustify !== "left" ? { textJustify } : {}),
    ...(orthoMode ? { orthoMode } : {}),
    ...(snapMode ? { snapMode } : {}),
    ...(snapUnit.x !== DEFAULT_DOCUMENT_SETTINGS.snapUnit.x ||
    snapUnit.y !== DEFAULT_DOCUMENT_SETTINGS.snapUnit.y
      ? { snapUnit: { x: snapUnit.x, y: snapUnit.y } }
      : {}),
    ...(gridMode ? {} : { gridMode }),
    ...(viewCube.visible ? {} : { navVCubeDisplay: 0 as const }),
    ...(viewCube.home
      ? {
          homeView: {
            direction: { ...viewCube.home.direction },
            up: { ...viewCube.home.up },
          },
        }
      : {}),
  }
}

function storedUcs(ucs: Ucs): StoredUcs {
  const origin = { ...ucs.origin }
  return isUpright(ucs)
    ? { origin, xAxis: { x: ucs.xAxis.x, y: ucs.xAxis.y } }
    : { origin, xAxis: { ...ucs.xAxis }, yAxis: { ...ucs.yAxis } }
}

function parseSettings(value: unknown): DocumentSettings {
  if (!isRecord(value)) return DEFAULT_DOCUMENT_SETTINGS
  const unit = LENGTH_UNITS.includes(value.unit as LengthUnit)
    ? (value.unit as LengthUnit)
    : DEFAULT_DOCUMENT_SETTINGS.unit
  const precision = isFiniteNumber(value.precision)
    ? Math.max(0, Math.min(8, Math.round(value.precision)))
    : DEFAULT_DOCUMENT_SETTINGS.precision
  const ltScale =
    isFiniteNumber(value.ltScale) && value.ltScale > 0
      ? Math.max(0.01, Math.min(1000, value.ltScale))
      : DEFAULT_DOCUMENT_SETTINGS.ltScale
  const lwDisplay =
    typeof value.lwDisplay === "boolean"
      ? value.lwDisplay
      : DEFAULT_DOCUMENT_SETTINGS.lwDisplay
  const attributeDisplay =
    value.attributeDisplay === "on" || value.attributeDisplay === "off"
      ? value.attributeDisplay
      : "normal"
  const ucs = parseUcs(value.ucs) ?? WORLD_UCS
  const namedUcs = parseNamedUcs(value.namedUcs)
  const ucsName =
    typeof value.ucsName === "string" &&
    namedUcs.some((entry) => entry.name === value.ucsName)
      ? value.ucsName
      : null
  const ucsOrthographic = ORTHOGRAPHIC_UCS.find(
    (kind) => kind === value.ucsOrthographic
  )
  const icon = isRecord(value.ucsIcon) ? value.ucsIcon : {}
  const ucsIcon = {
    visible:
      typeof icon.visible === "boolean"
        ? icon.visible
        : DEFAULT_DOCUMENT_SETTINGS.ucsIcon.visible,
    atOrigin:
      typeof icon.atOrigin === "boolean"
        ? icon.atOrigin
        : DEFAULT_DOCUMENT_SETTINGS.ucsIcon.atOrigin,
  }
  return {
    unit,
    precision,
    // A drawing from before AUPREC has the starting 0.
    anglePrecision: isFiniteNumber(value.anglePrecision)
      ? Math.max(0, Math.min(8, Math.round(value.anglePrecision)))
      : DEFAULT_DOCUMENT_SETTINGS.anglePrecision,
    ltScale,
    lwDisplay,
    attributeDisplay,
    ucs,
    ucsName,
    ucsOrthographic: ucsOrthographic ?? null,
    namedUcs,
    ucsIcon,
    elevation: isFiniteNumber(value.elevation) ? value.elevation : 0,
    thickness: isFiniteNumber(value.thickness) ? value.thickness : 0,
    viewCube: {
      visible: value.navVCubeDisplay !== 0,
      home: parseSavedView(value.homeView),
    },
    // A drawing from before 25 has none of them: everything new is ByLayer.
    currentColor:
      typeof value.currentColor === "string"
        ? (normalizeColor(value.currentColor) ?? COLOR_BYLAYER)
        : COLOR_BYLAYER,
    currentLinetype:
      typeof value.currentLinetype === "string" &&
      value.currentLinetype.length > 0
        ? value.currentLinetype
        : LINETYPE_BYLAYER,
    currentLineweight: isFiniteNumber(value.currentLineweight)
      ? clampLineweight(value.currentLineweight)
      : LINEWEIGHT_BYLAYER,
    // A drawing from before 27 fills, and PLINE starts at 0.
    fillMode: value.fillMode !== false,
    polylineWidth:
      isFiniteNumber(value.polylineWidth) && value.polylineWidth > 0
        ? value.polylineWidth
        : 0,
    // A drawing from before 28 has acadiso's.
    filletRadius: nonNegative(value.filletRadius),
    // A drawing from before 40 has acadiso's.
    splineType: value.splineType === 5 ? 5 : 6,
    splineSegments:
      Number.isInteger(value.splineSegments) &&
      value.splineSegments !== 0 &&
      Math.abs(value.splineSegments as number) <= 32768
        ? (value.splineSegments as number)
        : 8,
    // A drawing from before 43 has acadiso's.
    isolines:
      Number.isInteger(value.isolines) &&
      (value.isolines as number) >= 0 &&
      (value.isolines as number) <= 2047
        ? (value.isolines as number)
        : 4,
    chamferDistance1: nonNegative(value.chamferDistance1),
    chamferDistance2: nonNegative(value.chamferDistance2),
    textSize:
      isFiniteNumber(value.textSize) && value.textSize > 0
        ? value.textSize
        : DEFAULT_DOCUMENT_SETTINGS.textSize,
    textJustify:
      TEXT_JUSTIFICATIONS.find((justify) => justify === value.textJustify) ??
      DEFAULT_DOCUMENT_SETTINGS.textJustify,
    textRotation: DEFAULT_DOCUMENT_SETTINGS.textRotation,
    hatchPatternName: DEFAULT_DOCUMENT_SETTINGS.hatchPatternName,
    hatchPatternScale: DEFAULT_DOCUMENT_SETTINGS.hatchPatternScale,
    hatchPatternAngle: DEFAULT_DOCUMENT_SETTINGS.hatchPatternAngle,
    orthoMode: value.orthoMode === true,
    snapMode: value.snapMode === true,
    snapUnit: parseSnapUnit(value.snapUnit),
    gridMode: value.gridMode !== false,
  }
}

function nonNegative(value: unknown): number {
  return isFiniteNumber(value) && value > 0 ? value : 0
}

/** A spacing not above zero is no lattice, and the default stands. */
function parseSnapUnit(value: unknown): Vec2 {
  const unit = parseVec2(value)
  return unit && unit.x > 0 && unit.y > 0
    ? unit
    : DEFAULT_DOCUMENT_SETTINGS.snapUnit
}

/** A Home view whose two directions are not unit and square is no view, and the default stands. */
function parseSavedView(value: unknown): SavedView | null {
  if (!isRecord(value)) return null
  const direction = parseVec3(value.direction)
  const up = parseVec3(value.up)
  if (!direction || !up) return null
  const square =
    Math.abs(length3(direction) - 1) < 1e-9 &&
    Math.abs(length3(up) - 1) < 1e-9 &&
    Math.abs(dot3(direction, up)) < 1e-9
  return square ? { direction, up } : null
}

function parseUcs(value: unknown): Ucs | null {
  if (!isRecord(value)) return null
  const origin = parseVec2(value.origin)
  const xAxis = parseVec2(value.xAxis)
  if (!origin || !xAxis) return null
  const z = isRecord(value.origin) ? value.origin.z : undefined
  const at = { ...origin, z: isFiniteNumber(z) ? z : 0 }
  const yAxis = parseVec3(value.yAxis)
  const x3 = parseVec3(value.xAxis)
  if (!yAxis || !x3) return createUcs(at, xAxis)
  // Axes already square and of unit length are kept to the bit, so saving a
  // loaded drawing writes the same bytes.
  const square =
    Math.abs(length3(x3) - 1) < 1e-9 &&
    Math.abs(length3(yAxis) - 1) < 1e-9 &&
    Math.abs(dot3(x3, yAxis)) < 1e-9
  return square ? { origin: at, xAxis: x3, yAxis } : ucsFromAxes(at, x3, yAxis)
}

function parseNamedUcs(value: unknown): NamedUcs[] {
  if (!Array.isArray(value)) return []
  const table: NamedUcs[] = []
  for (const raw of value) {
    if (!isRecord(raw) || typeof raw.name !== "string") continue
    const name = raw.name.trim()
    const ucs = parseUcs(raw.ucs)
    const taken = table.some(
      (entry) => entry.name.toUpperCase() === name.toUpperCase()
    )
    if (name.length > 0 && ucs && !taken) table.push({ name, ucs })
  }
  return table
}

function parseEntities(value: unknown, version: number): Entity[] {
  if (!Array.isArray(value)) return []
  const entities: Entity[] = []
  for (const raw of value) {
    const entity = parseEntity(raw, version)
    if (entity) entities.push(entity)
  }
  return entities
}

function parseEntity(raw: unknown, version: number): Entity | null {
  const shape = parseEntityShape(raw, version)
  return shape && isRecord(raw) ? parsePlane(raw, shape) : shape
}

/**
 * A drawing from before version 22 has none of these: everything lies on
 * Z = 0; one from before 23 has no normal, so everything faces +Z.
 */
function parsePlane(raw: Record<string, unknown>, entity: Entity): Entity {
  // Its vertices hold their Z: a plane in the file is not its own.
  if (entity.type === "polyline3d" || entity.type === "solid3d") return entity
  let placed = isFiniteNumber(raw.elevation)
    ? withElevation(entity, raw.elevation)
    : entity
  if (placed.type === "line" && isFiniteNumber(raw.deltaZ)) {
    placed = withDeltaZ(placed, raw.deltaZ)
  }
  if (hasThickness(placed) && isFiniteNumber(raw.thickness)) {
    placed = withThickness(placed, raw.thickness)
  }
  const normal = parseVec3(raw.normal)
  if (normal) placed = withNormal(placed, normal)
  return placed
}

function parseVec3(value: unknown): Vec3 | null {
  if (!isRecord(value)) return null
  const { x, y, z } = value
  return isFiniteNumber(x) && isFiniteNumber(y) && isFiniteNumber(z)
    ? { x, y, z }
    : null
}

/**
 * A spline's end tangent is the curve's derivative there, which SPLINE gives
 * unit (spline/p306). Before 29 it was only a direction, stored at the length
 * picked: read as AutoCAD would have stored that pick.
 */
function endTangentOf(value: unknown, version: number): Vec3 | undefined {
  const tangent = parseSplineVector(value)
  if (!tangent || version >= 29) return tangent ?? undefined
  const length = Math.hypot(tangent.x, tangent.y)
  return length > 0
    ? { x: tangent.x / length, y: tangent.y / length, z: 0 }
    : undefined
}

/** A list of finite numbers, or nothing when it is not one whole. */
function parseNumbers(value: unknown): number[] | undefined {
  return Array.isArray(value) && value.every(isFiniteNumber)
    ? [...value]
    : undefined
}

/**
 * A spline's point or tangent. Before 37 it had no Z, its points lying at the
 * elevation `parsePlane` then gives them; a Z left out is 0.
 */
function parseSplineVector(value: unknown): Vec3 | null {
  const point = parseVec2(value)
  if (!point || !isRecord(value)) return null
  return { ...point, z: isFiniteNumber(value.z) ? value.z : 0 }
}

/**
 * Before 32 the registry held acad.pat's imperial ANSI31 (spacing 0.125); it
 * holds acadiso.pat's (3.175) since (HATCH-D63). An older ANSI31 hatch is read
 * at its scale over 25.4, so it draws as it was saved.
 */
function hatchScaleOf(
  patternId: string,
  value: unknown,
  version: number
): number {
  const scale = isFiniteNumber(value) && value > 0 ? value : DEFAULT_HATCH_SCALE
  return version < 32 && patternId === "ANSI31" ? scale / 25.4 : scale
}

function parseEntityShape(raw: unknown, version: number): Entity | null {
  if (!isRecord(raw)) return null
  const id =
    typeof raw.id === "string" && raw.id.length > 0 ? raw.id : nextEntityId()
  const layerId =
    typeof raw.layerId === "string" && raw.layerId.length > 0
      ? raw.layerId
      : DEFAULT_LAYER_ID
  const color =
    typeof raw.color === "string" && normalizeColor(raw.color)
      ? { color: normalizeColor(raw.color)! }
      : {}
  const linetype =
    typeof raw.linetype === "string" && raw.linetype.length > 0
      ? { linetype: raw.linetype }
      : {}
  const lineweight = isFiniteNumber(raw.lineweight)
    ? { lineweight: clampLineweight(raw.lineweight) }
    : {}
  const overrides = { ...color, ...linetype, ...lineweight }

  switch (raw.type) {
    case "line": {
      const start = parseVec2(raw.start)
      const end = parseVec2(raw.end)
      if (!start || !end) return null
      return { id, type: "line", layerId, ...overrides, start, end }
    }
    case "circle": {
      const center = parseVec2(raw.center)
      if (!center || !isFiniteNumber(raw.radius) || raw.radius <= 0) return null
      return {
        id,
        type: "circle",
        layerId,
        ...overrides,
        center,
        radius: raw.radius,
      }
    }
    case "arc": {
      const center = parseVec2(raw.center)
      if (!center || !isFiniteNumber(raw.radius) || raw.radius <= 0) return null
      if (!isFiniteNumber(raw.startAngle) || !isFiniteNumber(raw.endAngle)) {
        return null
      }
      return {
        id,
        type: "arc",
        layerId,
        ...overrides,
        center,
        radius: raw.radius,
        startAngle: raw.startAngle,
        endAngle: raw.endAngle,
      }
    }
    case "ellipse": {
      const center = parseVec2(raw.center)
      const majorAxis = parseVec2(raw.majorAxis)
      if (!center || !majorAxis) return null
      if (majorAxis.x === 0 && majorAxis.y === 0) return null
      if (!isFiniteNumber(raw.ratio) || raw.ratio <= 0) return null
      // A stored range is trusted only when both ends are there; half of one
      // describes no sweep, so the ellipse loads whole rather than being lost.
      const swept =
        isFiniteNumber(raw.startParam) && isFiniteNumber(raw.endParam)
          ? { startParam: raw.startParam, endParam: raw.endParam }
          : {}
      // Built through the factory so a hand-edited file whose stored axis is
      // the shorter one is normalised instead of loading inside out.
      return {
        ...createEllipse(center, majorAxis, raw.ratio, {
          ...swept,
          layerId,
          id,
        }),
        ...overrides,
      }
    }
    case "spline": {
      const method = raw.method === "cv" ? "cv" : "fit"
      const points = Array.isArray(raw.points)
        ? raw.points.flatMap((p) => parseSplineVector(p) ?? [])
        : []
      if (points.length < 2) return null
      const knots =
        raw.knots === "sqrtChord" || raw.knots === "uniform"
          ? raw.knots
          : "chord"
      // Through the factory, so a hand-edited degree is clamped to 1–10 and
      // lowered to what the vertex count allows, and knots or weights that
      // do not fit the points are dropped. Version 38 brought them; an older
      // spline has neither.
      return {
        ...createSpline(method, points, {
          ...(isFiniteNumber(raw.degree) ? { degree: raw.degree } : {}),
          knots,
          closed: raw.closed === true,
          startTangent: parseSplineVector(raw.startTangent) ?? undefined,
          endTangent: endTangentOf(raw.endTangent, version),
          knotVector: parseNumbers(raw.knotVector),
          weights: parseNumbers(raw.weights),
          layerId,
          id,
        }),
        ...overrides,
      }
    }
    case "polyline": {
      const vertices = parseVertices(raw.vertices)
      if (vertices.length < 2) return null
      const closed = typeof raw.closed === "boolean" ? raw.closed : false
      const bulges = parseBulges(raw.bulges)
      const widths = parseWidths(raw, vertices.length, closed)
      return {
        id,
        type: "polyline",
        layerId,
        ...overrides,
        vertices,
        closed,
        ...(bulges ? { bulges } : {}),
        ...(widths ? { widths } : {}),
        // Version 39 brought it; anything but true is off.
        ...(raw.linetypeGeneration === true
          ? { linetypeGeneration: true as const }
          : {}),
        ...parsedFit(raw.fit, vertices.length, closed),
      }
    }
    case "polyline3d": {
      // Version 36 brought it; a vertex without its Z is dropped as malformed.
      const vertices = Array.isArray(raw.vertices)
        ? raw.vertices.flatMap((v) => parseVec3(v) ?? [])
        : []
      if (vertices.length < 1) return null
      return {
        id,
        type: "polyline3d",
        layerId,
        ...overrides,
        vertices,
        closed: typeof raw.closed === "boolean" ? raw.closed : false,
        ...parsedSplineFit(raw.fit),
      }
    }
    case "text": {
      const position = parseVec2(raw.position)
      if (!position || typeof raw.value !== "string") return null
      return {
        id,
        type: "text",
        layerId,
        ...overrides,
        position,
        value: raw.value,
        height:
          isFiniteNumber(raw.height) && raw.height > 0
            ? raw.height
            : DEFAULT_TEXT_HEIGHT,
        rotation: isFiniteNumber(raw.rotation) ? raw.rotation : 0,
        justify: TEXT_JUSTIFICATIONS.includes(raw.justify as TextJustify)
          ? (raw.justify as TextJustify)
          : "left",
        styleId: parseId(raw.styleId, DEFAULT_TEXT_STYLE_ID),
      }
    }
    case "mtext": {
      const position = parseVec2(raw.position)
      if (!position || typeof raw.contents !== "string") return null
      return {
        ...createMText(position, raw.contents, {
          height:
            isFiniteNumber(raw.height) && raw.height > 0
              ? raw.height
              : DEFAULT_TEXT_HEIGHT,
          width: isFiniteNumber(raw.width) ? raw.width : 0,
          rotation: isFiniteNumber(raw.rotation) ? raw.rotation : 0,
          attachment: MTEXT_ATTACHMENTS.includes(
            raw.attachment as MTextAttachment
          )
            ? (raw.attachment as MTextAttachment)
            : "tl",
          lineSpacingStyle:
            raw.lineSpacingStyle === "exactly" ? "exactly" : "atLeast",
          lineSpacingFactor: isFiniteNumber(raw.lineSpacingFactor)
            ? raw.lineSpacingFactor
            : 1,
          styleId: parseId(raw.styleId, DEFAULT_TEXT_STYLE_ID),
          layerId,
          id,
        }),
        ...overrides,
      }
    }
    case "attdef": {
      const position = parseVec2(raw.position)
      const tag = typeof raw.tag === "string" ? raw.tag.trim() : ""
      if (!position || tag.length === 0) return null
      return {
        ...createAttributeDefinition(position, tag, {
          prompt: typeof raw.prompt === "string" ? raw.prompt : "",
          value: typeof raw.value === "string" ? raw.value : "",
          modes: parseAttributeModes(raw.modes),
          ...parseTextLayout(raw),
          layerId,
          id,
        }),
        ...overrides,
      }
    }
    case "dimension": {
      const first = parseVec2(raw.first)
      const second = parseVec2(raw.second)
      const linePoint = parseVec2(raw.linePoint)
      if (!first || !second || !linePoint) return null
      const vertex = parseVec2(raw.vertex)
      const textPoint = parseVec2(raw.textPoint)
      return {
        id,
        type: "dimension",
        layerId,
        ...overrides,
        kind: parseDimensionKind(raw.kind),
        first,
        second,
        linePoint,
        ...(vertex ? { vertex } : {}),
        // Before 34 no text had been moved: absent, it keeps its place.
        ...(textPoint ? { textPoint } : {}),
        rotation: isFiniteNumber(raw.rotation) ? raw.rotation : 0,
        ...(typeof raw.text === "string" ? { text: raw.text } : {}),
        ...(isFiniteNumber(raw.textAngle) ? { textAngle: raw.textAngle } : {}),
        styleId: parseId(raw.styleId, DEFAULT_DIM_STYLE_ID),
      }
    }
    case "hatch": {
      const loops = parseHatchLoops(raw.loops)
      if (loops.length === 0) return null
      // Before 32 a hatch without a name was the default then, ANSI31.
      const patternId = parseId(
        raw.patternId,
        version < 32 ? "ANSI31" : DEFAULT_HATCH_PATTERN_ID
      )
      return {
        id,
        type: "hatch",
        layerId,
        ...overrides,
        loops,
        patternId,
        patternScale: hatchScaleOf(patternId, raw.patternScale, version),
        patternAngle: isFiniteNumber(raw.patternAngle)
          ? raw.patternAngle
          : DEFAULT_HATCH_ANGLE,
        origin: parseVec2(raw.origin) ?? { x: 0, y: 0 },
      }
    }
    case "insert": {
      const position = parseVec2(raw.position)
      if (!position) return null
      if (typeof raw.blockId !== "string" || raw.blockId.length === 0) {
        return null
      }
      return {
        id,
        type: "insert",
        layerId,
        ...overrides,
        blockId: raw.blockId,
        position,
        ...insertScalesOf(raw),
        rotation: isFiniteNumber(raw.rotation) ? raw.rotation : 0,
        ...parseBlockAttributes(raw.attributes),
        ...parseArray(raw.array),
      }
    }
    case "region": {
      // Since 42. A face missing its outline, or an edge malformed, loses the
      // region: a loop with a gap bounds nothing.
      if (!Array.isArray(raw.faces)) return null
      const faces: RegionFace[] = []
      for (const face of raw.faces) {
        if (!isRecord(face) || !Array.isArray(face.loops)) return null
        const loops: PlanarCurve[][] = []
        for (const loop of face.loops) {
          if (!Array.isArray(loop) || loop.length === 0) return null
          const edges = loop.map(parseEdge)
          if (edges.some((edge) => edge === null)) return null
          loops.push(edges as PlanarCurve[])
        }
        if (loops.length > 0) faces.push({ loops })
      }
      if (faces.length === 0) return null
      return { id, type: "region", layerId, ...overrides, faces }
    }
    case "solid3d": {
      // Since 43; a wedge or a pyramid since 44, a cylinder or a cone 45, a
      // sphere or a torus 46. A boundary that does not
      // close loses the solid; a malformed primitive only its history.
      const brep = parseBrep(raw.brep)
      if (!brep) return null
      const primitive = parsePrimitive(raw.primitive)
      return {
        id,
        type: "solid3d",
        layerId,
        ...overrides,
        brep,
        ...(primitive ? { primitive } : {}),
      }
    }
    default:
      return null
  }
}

function parseBrep(raw: unknown): Brep | null {
  if (!isRecord(raw)) return null
  const { vertices, edges, faces } = raw
  if (!Array.isArray(vertices) || !Array.isArray(edges)) return null
  if (!Array.isArray(faces) || faces.length === 0) return null
  const points = vertices.map(parseVec3)
  if (points.some((p) => p === null)) return null
  const index = (value: unknown) =>
    Number.isInteger(value) && (value as number) >= 0 ? (value as number) : -1
  const curves = edges.map((e) => (isRecord(e) ? parseCurve(e.curve) : null))
  const surfaces = faces.map((f) =>
    isRecord(f) ? parseSurface(f.surface) : null
  )
  if (curves.some((c) => c === null) || surfaces.some((s) => s === null)) {
    return null
  }
  const brep: Brep = {
    vertices: points as Vec3[],
    edges: edges.map((e, i) => ({
      start: isRecord(e) ? index(e.start) : -1,
      end: isRecord(e) ? index(e.end) : -1,
      curve: curves[i] as BrepCurve,
    })),
    faces: faces.map((f, i): BrepFace => {
      const loops = isRecord(f) && Array.isArray(f.loops) ? f.loops : []
      return {
        surface: surfaces[i] as BrepSurface,
        loops: loops.map((loop) =>
          (Array.isArray(loop) ? loop : []).map((c) => ({
            edge: isRecord(c) ? index(c.edge) : -1,
            reversed: isRecord(c) && c.reversed === true,
          }))
        ),
      }
    }),
  }
  return brepIsClosed(brep) ? brep : null
}

/** An edge's curve; a circle or an ellipse since 45. */
function parseCurve(raw: unknown): BrepCurve | null {
  if (!isRecord(raw)) return null
  switch (raw.kind) {
    case "line":
    case "point":
      return { kind: raw.kind }
    case "circle": {
      const center = parseVec3(raw.center)
      const normal = parseVec3(raw.normal)
      if (!center || !normal || !positive(raw.radius)) return null
      return { kind: "circle", center, normal, radius: raw.radius }
    }
    case "ellipse": {
      const center = parseVec3(raw.center)
      const normal = parseVec3(raw.normal)
      const majorAxis = parseVec3(raw.majorAxis)
      if (!center || !normal || !majorAxis || !positive(raw.ratio)) {
        return null
      }
      return { kind: "ellipse", center, normal, majorAxis, ratio: raw.ratio }
    }
    default:
      return null
  }
}

/** A face's surface; a cylinder or a cone since 45, a sphere or a torus 46. */
function parseSurface(raw: unknown): BrepSurface | null {
  if (!isRecord(raw)) return null
  switch (raw.kind) {
    case "plane": {
      const origin = parseVec3(raw.origin)
      const normal = parseVec3(raw.normal)
      return origin && normal ? { kind: "plane", origin, normal } : null
    }
    case "cylinder":
    case "cone": {
      const axis = parseVec3(raw.axis)
      const xAxis = parseVec3(raw.xAxis)
      if (!axis || !xAxis || !positive(raw.ratio)) return null
      if (raw.kind === "cylinder") {
        const origin = parseVec3(raw.origin)
        if (!origin || !positive(raw.radius)) return null
        return {
          kind: "cylinder",
          origin,
          axis,
          xAxis,
          radius: raw.radius,
          ratio: raw.ratio,
        }
      }
      const apex = parseVec3(raw.apex)
      if (!apex || !positive(raw.slope)) return null
      return {
        kind: "cone",
        apex,
        axis,
        xAxis,
        slope: raw.slope,
        ratio: raw.ratio,
      }
    }
    case "sphere":
    case "torus": {
      const center = parseVec3(raw.center)
      const axis = parseVec3(raw.axis)
      const xAxis = parseVec3(raw.xAxis)
      if (!center || !axis || !xAxis) return null
      if (raw.kind === "sphere") {
        if (!positive(raw.radius)) return null
        return { kind: "sphere", center, axis, xAxis, radius: raw.radius }
      }
      const { majorRadius, minorRadius } = raw
      if (!isFiniteNumber(majorRadius) || !positive(minorRadius)) return null
      return { kind: "torus", center, axis, xAxis, majorRadius, minorRadius }
    }
    default:
      return null
  }
}

/** A primitive's frame: a position and two unit axes square to each other. */
function parseFrame(
  raw: Record<string, unknown>
): { position: Vec3; xAxis: Vec3; normal: Vec3 } | null {
  const position = parseVec3(raw.position)
  const xAxis = parseVec3(raw.xAxis)
  const normal = parseVec3(raw.normal)
  const unit = (v: Vec3) => Math.abs(length3(v) - 1) < 1e-9
  if (!position || !xAxis || !normal || !unit(xAxis) || !unit(normal)) {
    return null
  }
  if (Math.abs(dot3(xAxis, normal)) > 1e-9) return null
  return { position, xAxis, normal }
}

const positive = (v: unknown): v is number => isFiniteNumber(v) && v > 0

function parsePrimitive(raw: unknown): SolidPrimitive | null {
  if (!isRecord(raw)) return null
  const frame = parseFrame(raw)
  if (!frame) return null
  switch (raw.kind) {
    case "box":
    case "wedge": {
      const { length, width, height } = raw
      if (!positive(length) || !positive(width) || !positive(height)) {
        return null
      }
      return { kind: raw.kind, ...frame, length, width, height }
    }
    case "pyramid": {
      const { sides, radius, topRadius, height, inscribed } = raw
      if (!Number.isInteger(sides) || (sides as number) < 3) return null
      if (!positive(radius) || !positive(height)) return null
      if (!isFiniteNumber(topRadius) || topRadius < 0) return null
      return {
        kind: "pyramid",
        ...frame,
        sides: sides as number,
        radius,
        topRadius,
        height,
        inscribed: inscribed === true,
      }
    }
    case "cylinder":
    case "cone": {
      // Since 45.
      const { radius, radiusY, height, topRadius } = raw
      if (!positive(radius) || !positive(height)) return null
      if (radiusY !== undefined && !positive(radiusY)) return null
      const common = {
        ...frame,
        radius,
        ...(radiusY !== undefined ? { radiusY } : {}),
        height,
      }
      if (raw.kind === "cylinder") return { kind: "cylinder", ...common }
      if (!isFiniteNumber(topRadius) || topRadius < 0) return null
      return { kind: "cone", ...common, topRadius }
    }
    case "sphere":
      // Since 46.
      return positive(raw.radius)
        ? { kind: "sphere", ...frame, radius: raw.radius }
        : null
    case "torus": {
      // A negative ring needs a tube wider than it, as TORUS asks (r06).
      const { radius, tubeRadius } = raw
      if (!isFiniteNumber(radius) || radius === 0 || !positive(tubeRadius)) {
        return null
      }
      if (radius + tubeRadius <= 0) return null
      return { kind: "torus", ...frame, radius, tubeRadius }
    }
    default:
      return null
  }
}

function parseEdge(raw: unknown): PlanarCurve | null {
  if (!isRecord(raw)) return null
  switch (raw.kind) {
    case "line": {
      const start = parseVec2(raw.start)
      const end = parseVec2(raw.end)
      return start && end ? { kind: "line", start, end } : null
    }
    case "arc": {
      const center = parseVec2(raw.center)
      const { radius, startAngle, sweep } = raw
      if (!center || !isFiniteNumber(radius) || !(radius > 0)) return null
      if (!isFiniteNumber(startAngle) || !isFiniteNumber(sweep) || sweep === 0)
        return null
      return { kind: "arc", center, radius, startAngle, sweep }
    }
    case "ellipse": {
      const center = parseVec2(raw.center)
      const majorAxis = parseVec2(raw.majorAxis)
      const { ratio, startParam, sweep } = raw
      if (!center || !majorAxis || !isFiniteNumber(ratio)) return null
      if (!(ratio > 0 && ratio <= 1)) return null
      if (!isFiniteNumber(startParam) || !isFiniteNumber(sweep) || sweep === 0)
        return null
      return { kind: "ellipse", center, majorAxis, ratio, startParam, sweep }
    }
    case "spline": {
      const { from, to } = raw
      if (!isRecord(raw.curve)) return null
      const { degree } = raw.curve
      const knots = parseNumbers(raw.curve.knots)
      const points = Array.isArray(raw.curve.controlPoints)
        ? raw.curve.controlPoints.map(parseVec2)
        : []
      if (!isFiniteNumber(degree) || !Number.isInteger(degree) || degree < 1)
        return null
      if (!knots || points.length < 2 || points.some((p) => p === null))
        return null
      if (knots.length !== points.length + degree + 1) return null
      if (!isFiniteNumber(from) || !isFiniteNumber(to) || from === to)
        return null
      const weights = parseNumbers(raw.curve.weights)
      const curve = {
        degree,
        knots,
        controlPoints: (points as Vec2[]).map((p) => ({ ...p, z: 0 })),
        ...(weights?.length === points.length && weights.every((w) => w > 0)
          ? { weights }
          : {}),
      }
      const domain = bsplineDomain(curve)
      const inside = (u: number) => u >= domain.start && u <= domain.end
      return inside(from) && inside(to)
        ? { kind: "spline", curve, from, to }
        : null
    }
    default:
      return null
  }
}

/**
 * A reference's X and Y scale. Before version 33 a file held one positive
 * `scale` and a `mirrored` flag, a negative X: read into the two, as a field
 * missing or 0 reads as the other factor, or 1.
 */
function insertScalesOf(raw: Record<string, unknown>): {
  scaleX: number
  scaleY: number
} {
  const factor = (value: unknown) =>
    isFiniteNumber(value) && value !== 0 ? value : null
  const legacy =
    isFiniteNumber(raw.scale) && raw.scale > 0 ? (raw.scale as number) : 1
  const scaleX =
    factor(raw.scaleX) ?? (raw.mirrored === true ? -legacy : legacy)
  return { scaleX, scaleY: factor(raw.scaleY) ?? Math.abs(scaleX) }
}

/** The height, rotation, justification and style every text-like object carries. */
function parseTextLayout(raw: Record<string, unknown>): {
  height: number
  rotation: number
  justify: TextJustify
  styleId: TextStyleId
} {
  return {
    height:
      isFiniteNumber(raw.height) && raw.height > 0
        ? raw.height
        : DEFAULT_TEXT_HEIGHT,
    rotation: isFiniteNumber(raw.rotation) ? raw.rotation : 0,
    justify: TEXT_JUSTIFICATIONS.includes(raw.justify as TextJustify)
      ? (raw.justify as TextJustify)
      : "left",
    styleId: parseId(raw.styleId, DEFAULT_TEXT_STYLE_ID),
  }
}

function parseAttributeModes(value: unknown): AttributeModes {
  if (!isRecord(value)) return DEFAULT_ATTRIBUTE_MODES
  const flag = (key: keyof AttributeModes) =>
    typeof value[key] === "boolean"
      ? (value[key] as boolean)
      : DEFAULT_ATTRIBUTE_MODES[key]
  return {
    invisible: flag("invisible"),
    constant: flag("constant"),
    verify: flag("verify"),
    preset: flag("preset"),
    lockPosition: flag("lockPosition"),
  }
}

/** A reference's attributes; one without a position or a tag is skipped. */
function parseBlockAttributes(value: unknown): {
  attributes?: BlockAttribute[]
} {
  if (!Array.isArray(value)) return {}
  const attributes: BlockAttribute[] = []
  for (const raw of value) {
    if (!isRecord(raw)) continue
    const position = parseVec2(raw.position)
    if (!position || typeof raw.tag !== "string" || raw.tag.length === 0) {
      continue
    }
    attributes.push({
      tag: raw.tag,
      value: typeof raw.value === "string" ? raw.value : "",
      position,
      ...(isFiniteNumber(raw.elevation) && raw.elevation !== 0
        ? { elevation: raw.elevation }
        : {}),
      ...parseTextLayout(raw),
      invisible: raw.invisible === true,
      layerId:
        typeof raw.layerId === "string" && raw.layerId.length > 0
          ? raw.layerId
          : DEFAULT_LAYER_ID,
      ...(typeof raw.color === "string" && normalizeColor(raw.color)
        ? { color: normalizeColor(raw.color)! }
        : {}),
      ...(typeof raw.linetype === "string" && raw.linetype.length > 0
        ? { linetype: raw.linetype }
        : {}),
      ...(isFiniteNumber(raw.lineweight)
        ? { lineweight: clampLineweight(raw.lineweight) }
        : {}),
    })
  }
  return attributes.length > 0 ? { attributes } : {}
}

/**
 * An array's parameters, from 30. WHY a malformed one leaves a plain
 * reference rather than dropping it: the block still holds the source, item
 * 1, which is the drawing's; only the derived items are lost.
 */
function parseArray(value: unknown): { array?: ArrayParameters } {
  if (!isRecord(value)) return {}
  const count = (n: unknown): n is number =>
    Number.isInteger(n) &&
    (n as number) >= 1 &&
    (n as number) <= MAX_ARRAY_COUNT
  const flag = (b: unknown): b is boolean => typeof b === "boolean"
  switch (value.kind) {
    case "rectangular": {
      const axis = parseVec2(value.axis)
      const size = axis ? Math.hypot(axis.x, axis.y) : 0
      const { columns, rows, colSpacing, rowSpacing, rowElevation } = value
      // Version 41 brought the levels; before it, one level 1 apart, as
      // ARRAYRECT starts a flat source (probe arrays/p139).
      const { levels = 1, levelSpacing = 1 } = value
      if (
        !axis ||
        !(size > 0) ||
        !count(columns) ||
        !count(rows) ||
        !count(levels) ||
        !isFiniteNumber(colSpacing) ||
        !isFiniteNumber(rowSpacing) ||
        !isFiniteNumber(rowElevation) ||
        !isFiniteNumber(levelSpacing)
      ) {
        return {}
      }
      return {
        array: {
          kind: "rectangular",
          columns,
          rows,
          colSpacing,
          rowSpacing,
          rowElevation,
          levels,
          levelSpacing,
          axis:
            Math.abs(size - 1) < 1e-9
              ? axis
              : { x: axis.x / size, y: axis.y / size },
        },
      }
    }
    case "polar": {
      const center = parseVec2(value.center)
      const basePoint = parseVec2(value.basePoint)
      const { items, fill, clockwise, rotate } = value
      if (
        !center ||
        !basePoint ||
        !count(items) ||
        !isFiniteNumber(fill) ||
        !(fill > 0 && fill <= 360) ||
        !flag(clockwise) ||
        !flag(rotate)
      ) {
        return {}
      }
      // From 31; a malformed one reads as none, the source where it stands.
      const sourceBase = parseVec2(value.sourceBase)
      return {
        array: {
          kind: "polar",
          center,
          basePoint,
          items,
          fill,
          clockwise,
          rotate,
          ...(sourceBase ? { sourceBase } : {}),
        },
      }
    }
    case "path": {
      const raw = isRecord(value.path) ? value.path : null
      const pieces = raw && Array.isArray(raw.pieces) ? raw.pieces : null
      const parsed = pieces?.map(parsePathPiece) ?? []
      const path =
        raw && flag(raw.closed) && parsed.every((piece) => piece !== null)
          ? arrayPathOfPieces(parsed as ArrayPathPiece[], raw.closed)
          : null
      const { pathId, method, items, spacing, align } = value
      if (
        !path ||
        typeof pathId !== "string" ||
        (method !== "divide" && method !== "measure") ||
        !count(items) ||
        !isFiniteNumber(spacing) ||
        !(spacing > 0) ||
        !flag(align)
      ) {
        return {}
      }
      return {
        array: { kind: "path", path, pathId, method, items, spacing, align },
      }
    }
    default:
      return {}
  }
}

function parsePathPiece(value: unknown): ArrayPathPiece | null {
  if (!isRecord(value)) return null
  if (value.kind === "line") {
    const a = parseVec2(value.a)
    const b = parseVec2(value.b)
    return a && b ? { kind: "line", a, b } : null
  }
  const center = parseVec2(value.center)
  const { radius, start, sweep } = value
  return value.kind === "arc" &&
    center &&
    isFiniteNumber(radius) &&
    radius > 0 &&
    isFiniteNumber(start) &&
    isFiniteNumber(sweep)
    ? { kind: "arc", center, radius, start, sweep }
    : null
}

/** Boundary loops. Two vertices are enough when they carry arc bulges. */
function parseHatchLoops(value: unknown): HatchLoop[] {
  if (!Array.isArray(value)) return []
  const loops: HatchLoop[] = []
  for (const raw of value) {
    if (!isRecord(raw)) continue
    const vertices = parseVertices(raw.vertices)
    if (vertices.length < 2) continue
    const bulges = parseBulges(raw.bulges)
    loops.push(bulges ? { vertices, bulges } : { vertices })
  }
  return loops
}

/**
 * Parses the layer table. Always yields at least the base layer `0`; older
 * files without a `layers` array open with just the base layer and every entity
 * on it. Malformed entries are skipped, not fatal.
 */
function parseLayers(value: unknown): Layer[] {
  const layers: Layer[] = []
  const seen = new Set<LayerId>()
  if (Array.isArray(value)) {
    for (const raw of value) {
      const layer = parseLayer(raw)
      if (layer && !seen.has(layer.id)) {
        seen.add(layer.id)
        layers.push(layer)
      }
    }
  }
  if (!seen.has(DEFAULT_LAYER_ID)) layers.unshift(createDefaultLayer())
  return layers
}

/**
 * What layer 0 and every new layer stored before they took colour 7: the stand-in
 * for it (the theme's foreground), which no picker offered, so it reads as 7.
 */
const LEGACY_LAYER_COLOR = "#e2e8f0"

function parseLayer(raw: unknown): Layer | null {
  if (!isRecord(raw)) return null
  if (typeof raw.id !== "string" || raw.id.length === 0) return null
  const name =
    typeof raw.name === "string" && raw.name.length > 0 ? raw.name : raw.id
  const color =
    typeof raw.color === "string" &&
    raw.color.length > 0 &&
    raw.color !== LEGACY_LAYER_COLOR
      ? raw.color
      : DEFAULT_LAYER_COLOR
  const visible = typeof raw.visible === "boolean" ? raw.visible : true
  const locked = typeof raw.locked === "boolean" ? raw.locked : false
  const linetype =
    typeof raw.linetype === "string" && raw.linetype.length > 0
      ? raw.linetype
      : DEFAULT_LINETYPE_ID
  const lineweight = isFiniteNumber(raw.lineweight)
    ? clampLineweight(raw.lineweight)
    : DEFAULT_LINEWEIGHT
  return { id: raw.id, name, color, linetype, lineweight, visible, locked }
}

function parseLayerId(value: unknown): LayerId {
  return typeof value === "string" && value.length > 0
    ? value
    : DEFAULT_LAYER_ID
}

function parseId(value: unknown, fallback: string): string {
  return typeof value === "string" && value.length > 0 ? value : fallback
}

/**
 * Parses the text-style table. Always yields at least the base `Standard`
 * style, so drawings written before styles existed still open.
 */
function parseTextStyles(value: unknown): TextStyle[] {
  const styles: TextStyle[] = []
  const seen = new Set<TextStyleId>()
  if (Array.isArray(value)) {
    for (const raw of value) {
      if (!isRecord(raw)) continue
      if (typeof raw.id !== "string" || raw.id.length === 0) continue
      if (seen.has(raw.id)) continue
      seen.add(raw.id)
      styles.push({
        id: raw.id,
        name: typeof raw.name === "string" && raw.name ? raw.name : raw.id,
        height: isFiniteNumber(raw.height) && raw.height > 0 ? raw.height : 0,
      })
    }
  }
  if (!seen.has(DEFAULT_TEXT_STYLE_ID)) styles.unshift(createDefaultTextStyle())
  return styles
}

/**
 * Parses the dimension-style table. Always yields at least the base `ISO-25`
 * style, and fills any missing setting from it, so drawings written before
 * dimensions existed still open.
 */
function parseDimStyles(value: unknown): DimStyle[] {
  const styles: DimStyle[] = []
  const seen = new Set<DimStyleId>()
  if (Array.isArray(value)) {
    for (const raw of value) {
      if (!isRecord(raw)) continue
      if (typeof raw.id !== "string" || raw.id.length === 0) continue
      if (seen.has(raw.id)) continue
      seen.add(raw.id)
      const size = (
        key:
          | "textHeight"
          | "arrowSize"
          | "extensionOffset"
          | "extensionBeyond"
          | "textGap"
          | "baselineSpacing"
          | "centerMark"
      ): number => {
        const candidate = raw[key]
        return isFiniteNumber(candidate) && candidate >= 0
          ? candidate
          : DEFAULT_DIM_STYLE[key]
      }
      styles.push({
        id: raw.id,
        name: typeof raw.name === "string" && raw.name ? raw.name : raw.id,
        textHeight: size("textHeight"),
        arrowSize: size("arrowSize"),
        extensionOffset: size("extensionOffset"),
        extensionBeyond: size("extensionBeyond"),
        textGap: size("textGap"),
        baselineSpacing: size("baselineSpacing"),
        centerMark: size("centerMark"),
        decimals: isFiniteNumber(raw.decimals)
          ? Math.max(0, Math.min(8, Math.round(raw.decimals)))
          : DEFAULT_DIM_STYLE.decimals,
        // DIMADEC's −1 ("use DIMDEC") is a meaningful value, so the floor is
        // −1 here rather than 0.
        angleDecimals: isFiniteNumber(raw.angleDecimals)
          ? Math.max(-1, Math.min(8, Math.round(raw.angleDecimals)))
          : DEFAULT_DIM_STYLE.angleDecimals,
        // Before 34 every style drew ISO-25's DIMDSEP and DIMZIN 8 unread.
        decimalSeparator: clampDecimalSeparator(raw.decimalSeparator),
        suppressTrailingZeros:
          typeof raw.suppressTrailingZeros === "boolean"
            ? raw.suppressTrailingZeros
            : DEFAULT_DIM_STYLE.suppressTrailingZeros,
        // Before 35 every style drew ISO-25's DIMTOFL On unread.
        forceLineInside:
          typeof raw.forceLineInside === "boolean"
            ? raw.forceLineInside
            : DEFAULT_DIM_STYLE.forceLineInside,
        scale:
          isFiniteNumber(raw.scale) && raw.scale > 0
            ? clampDimScale(raw.scale)
            : DEFAULT_DIM_STYLE.scale,
      })
    }
  }
  if (!seen.has(DEFAULT_DIM_STYLE_ID)) styles.unshift(createDefaultDimStyle())
  return styles
}

/** Reads a dimension's kind, defaulting to `linear` for anything unknown. */
function parseDimensionKind(value: unknown): DimensionKind {
  return value === "aligned" ||
    value === "angular" ||
    value === "radius" ||
    value === "diameter"
    ? value
    : "linear"
}

function parseVec2(value: unknown): Vec2 | null {
  if (!isRecord(value)) return null
  if (!isFiniteNumber(value.x) || !isFiniteNumber(value.y)) return null
  return { x: value.x, y: value.y }
}

function storedFit(fit: PolylineFit): PolylineFit {
  const tangents = fit.tangents ? { tangents: [...fit.tangents] } : {}
  if (fit.kind !== "curve") {
    return { kind: fit.kind, segments: fit.segments, ...tangents }
  }
  return {
    kind: "curve",
    arcs: fit.arcs.map((arc) =>
      arc
        ? {
            joint: { x: arc.joint.x, y: arc.joint.y },
            bulges: [arc.bulges[0], arc.bulges[1]] as const,
          }
        : null
    ),
    ...tangents,
  }
}

/**
 * A polyline's PEDIT Fit or Spline, version 40 on; one that does not fit its
 * vertices is dropped, the polyline read as its frame.
 */
function parsedFit(
  value: unknown,
  vertexCount: number,
  closed: boolean
): { fit?: PolylineFit } {
  if (!isRecord(value)) return {}
  const tangents = Array.isArray(value.tangents)
    ? value.tangents.map((t) => (isFiniteNumber(t) ? t : null))
    : null
  const given =
    tangents &&
    tangents.length === vertexCount &&
    tangents.some((t) => t !== null)
      ? { tangents }
      : {}
  if (value.kind === "curve") {
    if (!Array.isArray(value.arcs)) return {}
    const count = closed ? vertexCount : vertexCount - 1
    if (value.arcs.length !== count) return {}
    const arcs = value.arcs.map((arc): FitArcs | null => {
      if (!isRecord(arc)) return null
      const joint = parseVec2(arc.joint)
      const bulges = Array.isArray(arc.bulges) ? arc.bulges : []
      const [first, second] = bulges
      return joint && isFiniteNumber(first) && isFiniteNumber(second)
        ? { joint, bulges: [first, second] }
        : null
    })
    return { fit: { kind: "curve", arcs, ...given } }
  }
  const spline = parsedSplineFit(value).fit
  return spline ? { fit: { ...spline, ...given } } : {}
}

function parsedSplineFit(value: unknown): { fit?: Polyline3dFit } {
  if (!isRecord(value)) return {}
  const segments = value.segments
  if (
    (value.kind !== "quadratic" && value.kind !== "cubic") ||
    !Number.isInteger(segments) ||
    segments === 0
  ) {
    return {}
  }
  return { fit: { kind: value.kind, segments: segments as number } }
}

/** Parses a polyline's vertex array, skipping any malformed points. */
function parseVertices(value: unknown): Vec2[] {
  if (!Array.isArray(value)) return []
  const vertices: Vec2[] = []
  for (const raw of value) {
    const point = parseVec2(raw)
    if (point) vertices.push(point)
  }
  return vertices
}

/**
 * Parses a polyline's optional bulge array (finite numbers, non-finite entries
 * coerced to 0). Returns undefined when absent or all-zero, so straight
 * polylines never carry a redundant array.
 */
function parseBulges(value: unknown): number[] | undefined {
  if (!Array.isArray(value)) return undefined
  const bulges = value.map((b) => (isFiniteNumber(b) ? b : 0))
  return bulges.some((b) => b !== 0) ? bulges : undefined
}

/**
 * A polyline's widths as DXF writes them: one `constantWidth` (43) when every
 * segment has it, else each segment's `[start, end]` (40 / 41).
 */
function storedWidths(
  poly: PolylineEntity
): { constantWidth: number } | { widths: [number, number][] } | object {
  if (!isWidePolyline(poly)) return {}
  const constant = polylineConstantWidth(poly)
  if (constant !== null) return { constantWidth: constant }
  return {
    widths: polylineSegments(poly).map((_, i): [number, number] => {
      const [start, end] = polylineWidth(poly, i)
      return [start, end]
    }),
  }
}

/**
 * Reads a polyline's widths, tolerantly: a malformed or negative width is 0,
 * a short list is padded and a long one cut to the segments. None at all
 * (before 27) is none.
 */
function parseWidths(
  raw: Record<string, unknown>,
  vertexCount: number,
  closed: boolean
): PolylineWidth[] | undefined {
  const count = closed && vertexCount > 1 ? vertexCount : vertexCount - 1
  const width = (value: unknown) =>
    isFiniteNumber(value) && value > 0 ? value : 0
  let widths: PolylineWidth[]
  if (isFiniteNumber(raw.constantWidth)) {
    const constant = width(raw.constantWidth)
    widths = Array.from({ length: count }, () => [constant, constant])
  } else if (Array.isArray(raw.widths)) {
    widths = Array.from({ length: count }, (_, i): PolylineWidth => {
      const pair: unknown = (raw.widths as unknown[])[i]
      return Array.isArray(pair) ? [width(pair[0]), width(pair[1])] : [0, 0]
    })
  } else {
    return undefined
  }
  return widths.some(([start, end]) => start > 0 || end > 0)
    ? widths
    : undefined
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value)
}

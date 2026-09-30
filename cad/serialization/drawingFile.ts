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

import { normalizeColor } from "../domain/colors"
import {
  BlockDefinition,
  createBlockDefinition,
  createEllipse,
  createMText,
  Entity,
  nextEntityId,
  DimensionKind,
  HatchLoop,
  MTEXT_ATTACHMENTS,
  MTextAttachment,
  TEXT_JUSTIFICATIONS,
  TextJustify,
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
import { DEFAULT_LINETYPE_ID } from "../domain/linetypes"
import { clampLineweight, DEFAULT_LINEWEIGHT } from "../domain/lineweights"
import { Vec2 } from "../geometry/Vec2"
import {
  DEFAULT_DOCUMENT_SETTINGS,
  DocumentSettings,
  LengthUnit,
  LENGTH_UNITS,
} from "../domain/units"
import { DRAWING_FILE_TYPE } from "./drawingSummary"

export { DRAWING_FILE_TYPE }

/** Current schema version written by {@link serializeDrawing}. */
export const DRAWING_FILE_VERSION = 18

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

/** Shape of a serialised drawing on disk. */
export interface DrawingFile {
  readonly type: typeof DRAWING_FILE_TYPE
  readonly version: number
  readonly generator: string
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
    settings: snapshot.settings,
    layers: snapshot.layers.map(cloneLayer),
    currentLayerId: snapshot.currentLayerId,
    textStyles: snapshot.textStyles.map(cloneTextStyle),
    currentTextStyleId: snapshot.currentTextStyleId,
    dimStyles: snapshot.dimStyles.map(cloneDimStyle),
    currentDimStyleId: snapshot.currentDimStyleId,
    blocks: snapshot.blocks.map(cloneBlock),
    entities: snapshot.entities.map(cloneEntity),
  }
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

  const blocks = parseBlocks(data.blocks)
  const defined = new Set(blocks.map((block) => block.id))
  const entities = parseEntities(data.entities)

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
    case "polyline":
      return {
        id: entity.id,
        type: "polyline",
        layerId: entity.layerId,
        ...overrides,
        vertices: entity.vertices.map((v) => ({ x: v.x, y: v.y })),
        closed: entity.closed,
        ...(entity.bulges ? { bulges: entity.bulges.slice() } : {}),
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
        scale: entity.scale,
        rotation: entity.rotation,
        ...(entity.mirrored ? { mirrored: true } : {}),
      }
  }
}

function cloneBlock(block: BlockDefinition): BlockDefinition {
  return {
    id: block.id,
    name: block.name,
    basePoint: { x: block.basePoint.x, y: block.basePoint.y },
    entities: block.entities.map(cloneEntity),
  }
}

/**
 * The block table. A definition needs a name (which is its identity) and at
 * least one object; anything else is skipped, like a malformed entity.
 */
function parseBlocks(value: unknown): BlockDefinition[] {
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
    const entities = parseEntities(raw.entities)
    if (entities.length === 0) continue
    seen.add(name)
    blocks.push(
      createBlockDefinition(
        name,
        parseVec2(raw.basePoint) ?? { x: 0, y: 0 },
        entities
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
  return { unit, precision, ltScale, lwDisplay }
}

function parseEntities(value: unknown): Entity[] {
  if (!Array.isArray(value)) return []
  const entities: Entity[] = []
  for (const raw of value) {
    const entity = parseEntity(raw)
    if (entity) entities.push(entity)
  }
  return entities
}

function parseEntity(raw: unknown): Entity | null {
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
    case "polyline": {
      const vertices = parseVertices(raw.vertices)
      if (vertices.length < 2) return null
      const closed = typeof raw.closed === "boolean" ? raw.closed : false
      const bulges = parseBulges(raw.bulges)
      return bulges
        ? {
            id,
            type: "polyline",
            layerId,
            ...overrides,
            vertices,
            closed,
            bulges,
          }
        : { id, type: "polyline", layerId, ...overrides, vertices, closed }
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
    case "dimension": {
      const first = parseVec2(raw.first)
      const second = parseVec2(raw.second)
      const linePoint = parseVec2(raw.linePoint)
      if (!first || !second || !linePoint) return null
      const vertex = parseVec2(raw.vertex)
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
        rotation: isFiniteNumber(raw.rotation) ? raw.rotation : 0,
        ...(typeof raw.text === "string" ? { text: raw.text } : {}),
        ...(isFiniteNumber(raw.textAngle) ? { textAngle: raw.textAngle } : {}),
        styleId: parseId(raw.styleId, DEFAULT_DIM_STYLE_ID),
      }
    }
    case "hatch": {
      const loops = parseHatchLoops(raw.loops)
      if (loops.length === 0) return null
      return {
        id,
        type: "hatch",
        layerId,
        ...overrides,
        loops,
        patternId: parseId(raw.patternId, DEFAULT_HATCH_PATTERN_ID),
        patternScale:
          isFiniteNumber(raw.patternScale) && raw.patternScale > 0
            ? raw.patternScale
            : DEFAULT_HATCH_SCALE,
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
        scale: isFiniteNumber(raw.scale) && raw.scale > 0 ? raw.scale : 1,
        rotation: isFiniteNumber(raw.rotation) ? raw.rotation : 0,
        ...(raw.mirrored === true ? { mirrored: true } : {}),
      }
    }
    default:
      return null
  }
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

function parseLayer(raw: unknown): Layer | null {
  if (!isRecord(raw)) return null
  if (typeof raw.id !== "string" || raw.id.length === 0) return null
  const name =
    typeof raw.name === "string" && raw.name.length > 0 ? raw.name : raw.id
  const color =
    typeof raw.color === "string" && raw.color.length > 0
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value)
}

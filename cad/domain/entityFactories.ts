import { Vec2 } from "../geometry/Vec2"
import { Vec3, zOf } from "../geometry/Vec3"
import { DEFAULT_LAYER_ID, LayerId } from "./layers"
import {
  DEFAULT_HATCH_ANGLE,
  DEFAULT_HATCH_PATTERN_ID,
  DEFAULT_HATCH_SCALE,
  HatchPatternId,
} from "./hatchPatterns"
import {
  ArrayParameters,
  EntityId,
  LineEntity,
  CircleEntity,
  ArcEntity,
  PolylineEntity,
  PolylineWidth,
  HatchLoop,
  HatchEntity,
  BlockId,
  BlockDefinition,
  BlockAttribute,
  InsertEntity,
  Entity,
} from "./entityTypes"
import { withDeltaZ, withElevation } from "./elevation"

let idCounter = 0

export function nextEntityId(): EntityId {
  idCounter += 1
  return `e${idCounter.toString(36)}-${Date.now().toString(36)}`
}

/** DXF gives a line a Z per end, so ends that have one set its elevation and rise. */
export function createLine(
  start: Vec2 | Vec3,
  end: Vec2 | Vec3,
  layerId: LayerId = DEFAULT_LAYER_ID,
  id: EntityId = nextEntityId()
): LineEntity {
  const line: LineEntity = {
    id,
    type: "line",
    layerId,
    start: { x: start.x, y: start.y },
    end: { x: end.x, y: end.y },
  }
  return withDeltaZ(withElevation(line, zOf(start)), zOf(end) - zOf(start))
}

export function createCircle(
  center: Vec2,
  radius: number,
  layerId: LayerId = DEFAULT_LAYER_ID,
  id: EntityId = nextEntityId()
): CircleEntity {
  return {
    id,
    type: "circle",
    layerId,
    center: { x: center.x, y: center.y },
    radius,
  }
}

export function createArc(
  center: Vec2,
  radius: number,
  startAngle: number,
  endAngle: number,
  layerId: LayerId = DEFAULT_LAYER_ID,
  id: EntityId = nextEntityId()
): ArcEntity {
  return {
    id,
    type: "arc",
    layerId,
    center: { x: center.x, y: center.y },
    radius,
    startAngle,
    endAngle,
  }
}

export function createPolyline(
  vertices: readonly Vec2[],
  closed: boolean = false,
  layerId: LayerId = DEFAULT_LAYER_ID,
  bulges?: readonly number[],
  id: EntityId = nextEntityId(),
  widths?: readonly PolylineWidth[]
): PolylineEntity {
  const normalized = normalizeBulges(bulges)
  const wide = normalizeWidths(widths)
  return {
    id,
    type: "polyline",
    layerId,
    vertices: vertices.map((v) => ({ x: v.x, y: v.y })),
    closed,
    ...(normalized ? { bulges: normalized } : {}),
    ...(wide ? { widths: wide } : {}),
  }
}

/** The optional settings of a hatch; enough of them to want a bag. */
export interface HatchOptions {
  readonly patternId?: HatchPatternId
  readonly patternScale?: number
  readonly patternAngle?: number
  readonly origin?: Vec2
  readonly layerId?: LayerId
  readonly id?: EntityId
}

export function createHatch(
  loops: readonly HatchLoop[],
  options: HatchOptions = {}
): HatchEntity {
  return {
    id: options.id ?? nextEntityId(),
    type: "hatch",
    layerId: options.layerId ?? DEFAULT_LAYER_ID,
    loops: loops.map(cloneHatchLoop),
    patternId: options.patternId ?? DEFAULT_HATCH_PATTERN_ID,
    patternScale: options.patternScale ?? DEFAULT_HATCH_SCALE,
    patternAngle: options.patternAngle ?? DEFAULT_HATCH_ANGLE,
    origin: options.origin ? { ...options.origin } : { x: 0, y: 0 },
  }
}

function cloneHatchLoop(loop: HatchLoop): HatchLoop {
  return {
    vertices: loop.vertices.map((v) => ({ x: v.x, y: v.y })),
    ...(loop.bulges ? { bulges: loop.bulges.slice() } : {}),
  }
}

/** The optional settings of a block reference. */
export interface InsertOptions {
  /** X and Y at once, -INSERT's Scale (probe blocks/p205). */
  readonly scale?: number
  readonly scaleX?: number
  readonly scaleY?: number
  readonly rotation?: number
  readonly attributes?: readonly BlockAttribute[]
  readonly layerId?: LayerId
  readonly id?: EntityId
  readonly array?: ArrayParameters
}

export function createInsert(
  blockId: BlockId,
  position: Vec2,
  options: InsertOptions = {}
): InsertEntity {
  return {
    id: options.id ?? nextEntityId(),
    type: "insert",
    layerId: options.layerId ?? DEFAULT_LAYER_ID,
    blockId,
    position: { x: position.x, y: position.y },
    scaleX: insertFactor(options.scaleX ?? options.scale),
    scaleY: insertFactor(options.scaleY ?? options.scale),
    rotation: Number.isFinite(options.rotation) ? options.rotation! : 0,
    ...(options.attributes && options.attributes.length > 0
      ? { attributes: options.attributes.slice() }
      : {}),
    ...(options.array ? { array: options.array } : {}),
  }
}

/** A scale factor a reference takes: any finite one but 0, else 1. */
function insertFactor(factor: number | undefined): number {
  return Number.isFinite(factor) && factor !== 0 ? (factor as number) : 1
}

/**
 * Whether a reference reflects its block: one of its factors negative, as
 * MIRROR leaves it (probe blocks/p332) or -INSERT's X `-1` and Y `1` (p227).
 */
export function insertReflects(insert: InsertEntity): boolean {
  return insert.scaleX * insert.scaleY < 0
}

export function createBlockDefinition(
  name: string,
  basePoint: Vec2,
  entities: readonly Entity[],
  baseElevation = 0
): BlockDefinition {
  return {
    id: name,
    name,
    basePoint: { x: basePoint.x, y: basePoint.y },
    ...(baseElevation !== 0 ? { baseElevation } : {}),
    entities: entities.slice(),
  }
}

/**
 * Drops a bulge array that carries no arcs (undefined or all zeros) so a
 * straight polyline never stores a redundant array, and copies it otherwise.
 */
/** A width is never negative, and no width at all is stored as none. */
function normalizeWidths(
  widths: readonly PolylineWidth[] | undefined
): readonly PolylineWidth[] | undefined {
  if (!widths) return undefined
  const clean = widths.map(([start, end]): PolylineWidth => [
    start > 0 ? start : 0,
    end > 0 ? end : 0,
  ])
  return clean.some(([start, end]) => start !== 0 || end !== 0)
    ? clean
    : undefined
}

function normalizeBulges(
  bulges: readonly number[] | undefined
): readonly number[] | undefined {
  if (!bulges || bulges.every((b) => b === 0)) return undefined
  return bulges.slice()
}

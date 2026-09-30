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
  EntityId,
  LineEntity,
  CircleEntity,
  ArcEntity,
  PolylineEntity,
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
  id: EntityId = nextEntityId()
): PolylineEntity {
  const normalized = normalizeBulges(bulges)
  return {
    id,
    type: "polyline",
    layerId,
    vertices: vertices.map((v) => ({ x: v.x, y: v.y })),
    closed,
    ...(normalized ? { bulges: normalized } : {}),
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
  readonly scale?: number
  readonly rotation?: number
  readonly mirrored?: boolean
  readonly attributes?: readonly BlockAttribute[]
  readonly layerId?: LayerId
  readonly id?: EntityId
}

export function createInsert(
  blockId: BlockId,
  position: Vec2,
  options: InsertOptions = {}
): InsertEntity {
  const scale = options.scale
  return {
    id: options.id ?? nextEntityId(),
    type: "insert",
    layerId: options.layerId ?? DEFAULT_LAYER_ID,
    blockId,
    position: { x: position.x, y: position.y },
    scale:
      Number.isFinite(scale) && (scale as number) > 0 ? (scale as number) : 1,
    rotation: Number.isFinite(options.rotation) ? options.rotation! : 0,
    ...(options.mirrored ? { mirrored: true } : {}),
    ...(options.attributes && options.attributes.length > 0
      ? { attributes: options.attributes.slice() }
      : {}),
  }
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
function normalizeBulges(
  bulges: readonly number[] | undefined
): readonly number[] | undefined {
  if (!bulges || bulges.every((b) => b === 0)) return undefined
  return bulges.slice()
}

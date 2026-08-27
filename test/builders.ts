import { CadDocument } from "../cad/domain/Document"
import {
  type ArcEntity,
  type CircleEntity,
  type Entity,
  type EntityId,
  type HatchEntity,
  type HatchLoop,
  type HatchOptions,
  type LineEntity,
  type PolylineEntity,
  type TextEntity,
  type TextOptions,
  createArc,
  createCircle,
  createHatch,
  createLine,
  createPolyline,
  createText,
} from "../cad/domain/entities"
import {
  DEFAULT_LAYER_ID,
  type Layer,
  type LayerId,
  createDefaultLayer,
  createLayer,
} from "../cad/domain/layers"
import {
  DEFAULT_DOCUMENT_SETTINGS,
  type DocumentSettings,
} from "../cad/domain/units"
import {
  DEFAULT_TEXT_STYLE_ID,
  createDefaultTextStyle,
} from "../cad/domain/textStyles"
import {
  DEFAULT_DIM_STYLE_ID,
  createDefaultDimStyle,
} from "../cad/domain/dimStyles"
import type { Vec2 } from "../cad/geometry/Vec2"
import type { DrawingSnapshot } from "../cad/serialization/drawingFile"

/**
 * Terse, deterministic fixtures. Every builder takes an explicit `id` so a test
 * that cares about identity — "the entity was updated in place" versus
 * "replaced by a new one" — can assert it, which is exactly the distinction
 * undo/redo and the trim/fillet commands hinge on.
 */

export function p(x: number, y: number): Vec2 {
  return { x, y }
}

/** Degrees to radians, so angle-heavy tests read like the AutoCAD prompt. */
export function deg(degrees: number): number {
  return (degrees * Math.PI) / 180
}

interface EntityOptions {
  readonly id?: EntityId
  readonly layerId?: LayerId
}

export function lineOf(
  start: Vec2,
  end: Vec2,
  options: EntityOptions = {}
): LineEntity {
  return createLine(start, end, options.layerId ?? DEFAULT_LAYER_ID, options.id)
}

export function circleOf(
  center: Vec2,
  radius: number,
  options: EntityOptions = {}
): CircleEntity {
  return createCircle(
    center,
    radius,
    options.layerId ?? DEFAULT_LAYER_ID,
    options.id
  )
}

export function arcOf(
  center: Vec2,
  radius: number,
  startAngle: number,
  endAngle: number,
  options: EntityOptions = {}
): ArcEntity {
  return createArc(
    center,
    radius,
    startAngle,
    endAngle,
    options.layerId ?? DEFAULT_LAYER_ID,
    options.id
  )
}

export function polylineOf(
  vertices: readonly Vec2[],
  options: EntityOptions & {
    readonly closed?: boolean
    readonly bulges?: readonly number[]
  } = {}
): PolylineEntity {
  return createPolyline(
    vertices,
    options.closed ?? false,
    options.layerId ?? DEFAULT_LAYER_ID,
    options.bulges,
    options.id
  )
}

/** A closed rectangular polyline through the two opposite corners. */
export function rectOf(
  min: Vec2,
  max: Vec2,
  options: EntityOptions = {}
): PolylineEntity {
  return polylineOf([min, p(max.x, min.y), max, p(min.x, max.y)], {
    ...options,
    closed: true,
  })
}

/** A rectangular hatch loop through the two opposite corners. */
export function loopOf(min: Vec2, max: Vec2): HatchLoop {
  return { vertices: [min, p(max.x, min.y), max, p(min.x, max.y)] }
}

export function hatchOf(
  loops: readonly HatchLoop[],
  options: HatchOptions = {}
): HatchEntity {
  return createHatch(loops, options)
}

export function layerOf(
  id: LayerId,
  overrides: Partial<Omit<Layer, "id">> = {}
): Layer {
  return {
    ...createLayer(id, undefined, undefined, undefined, id),
    ...overrides,
  }
}

export function textOf(
  position: Vec2,
  value: string,
  options: TextOptions = {}
): TextEntity {
  return createText(position, value, options)
}

/** A document preloaded with `entities` (and optionally extra layers). */
export function documentWith(
  entities: readonly Entity[],
  options: {
    readonly layers?: readonly Layer[]
    readonly currentLayerId?: LayerId
    readonly settings?: DocumentSettings
  } = {}
): CadDocument {
  const document = new CadDocument()
  document.load(
    entities,
    options.settings,
    options.layers ? [createDefaultLayer(), ...options.layers] : undefined,
    options.currentLayerId
  )
  return document
}

export function snapshotOf(
  entities: readonly Entity[],
  overrides: Partial<DrawingSnapshot> = {}
): DrawingSnapshot {
  return {
    settings: DEFAULT_DOCUMENT_SETTINGS,
    layers: [createDefaultLayer()],
    currentLayerId: DEFAULT_LAYER_ID,
    textStyles: [createDefaultTextStyle()],
    currentTextStyleId: DEFAULT_TEXT_STYLE_ID,
    dimStyles: [createDefaultDimStyle()],
    currentDimStyleId: DEFAULT_DIM_STYLE_ID,
    entities,
    ...overrides,
  }
}

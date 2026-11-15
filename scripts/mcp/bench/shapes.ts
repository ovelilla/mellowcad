import type { Entity, Vec2 } from "@mellowcad/engine"
// WHY deep: the checker reads a DXF whoever wrote it (the engine or ezdxf) and
// flattens it with the domain's own helpers, which the package does not export.
import {
  entityBounds,
  insertFlatGeometry,
  dimensionMeasurement,
  mtextPlainText,
  polylineSegmentGeometries,
} from "../../../cad/domain/entities"
import type { BlockLookup } from "../../../cad/domain/entities"
import { parseDxf } from "../../../cad/serialization/dxf/readDxf"

/**
 * A drawing reduced to what a task's check asks about, however it was drawn:
 * a rectangle is four segments whether it came as a polyline, four lines or
 * an array's block; a polyline's bulge is an arc.
 */
export interface Shapes {
  readonly segments: readonly Segment[]
  readonly arcs: readonly Arc[]
  readonly circles: readonly Circle[]
  readonly texts: readonly Text[]
  readonly dimensions: readonly Dimension[]
  readonly hatches: readonly Hatch[]
  /** The names of the blocks referenced, upper case, a name per reference. */
  readonly references: readonly string[]
  /** Every object's layer name, upper case, block contents expanded. */
  readonly layers: readonly string[]
}

interface OnLayer {
  readonly layer: string
}
export interface Segment extends OnLayer {
  readonly a: Vec2
  readonly b: Vec2
}
/** Counter-clockwise from `start` to `end`, in degrees. */
export interface Arc extends OnLayer {
  readonly center: Vec2
  readonly radius: number
  readonly start: number
  readonly end: number
}
export interface Circle extends OnLayer {
  readonly center: Vec2
  readonly radius: number
}
export interface Text extends OnLayer {
  readonly value: string
  readonly position: Vec2
  readonly height: number
}
export interface Dimension extends OnLayer {
  readonly kind: string
  /** What it measures: a length, or radians when angular. */
  readonly measurement: number
  readonly first: Vec2
  readonly second: Vec2
  readonly linePoint: Vec2
}
/** One boundary loop of a hatch, by its extents. */
export interface Hatch extends OnLayer {
  readonly pattern: string
  readonly min: Vec2
  readonly max: Vec2
}

const DEG = 180 / Math.PI

export function shapesOfDxf(file: Uint8Array | string): Shapes {
  const { drawing } = parseDxf(file)
  const layerNames = new Map(
    drawing.layers.map((layer) => [layer.id, layer.name.toUpperCase()])
  )
  const blocks: BlockLookup = (id) =>
    drawing.blocks.find((block) => block.id === id)

  const segments: Segment[] = []
  const arcs: Arc[] = []
  const circles: Circle[] = []
  const texts: Text[] = []
  const dimensions: Dimension[] = []
  const hatches: Hatch[] = []
  const layers: string[] = []
  const references: string[] = []

  const visit = (entity: Entity): void => {
    if (entity.type === "insert") {
      references.push(blocks(entity.blockId)?.name.toUpperCase() ?? "?")
      for (const part of insertFlatGeometry(entity, blocks)) visit(part)
      return
    }
    const layer = layerNames.get(entity.layerId) ?? "?"
    layers.push(layer)
    switch (entity.type) {
      case "line":
        segments.push({ a: entity.start, b: entity.end, layer })
        break
      case "circle":
        circles.push({ center: entity.center, radius: entity.radius, layer })
        break
      case "arc":
        arcs.push({
          center: entity.center,
          radius: entity.radius,
          start: entity.startAngle * DEG,
          end: entity.endAngle * DEG,
          layer,
        })
        break
      case "polyline":
        for (const part of polylineSegmentGeometries(entity)) {
          if (part.kind === "line") {
            segments.push({ a: part.a, b: part.b, layer })
            continue
          }
          const angle = (p: Vec2) =>
            Math.atan2(p.y - part.center.y, p.x - part.center.x) * DEG
          const [from, to] =
            part.bulge > 0 ? [part.a, part.b] : [part.b, part.a]
          arcs.push({
            center: part.center,
            radius: part.radius,
            start: angle(from),
            end: angle(to),
            layer,
          })
        }
        break
      case "text":
        texts.push({
          value: entity.value,
          position: entity.position,
          height: entity.height,
          layer,
        })
        break
      case "mtext":
        texts.push({
          value: mtextPlainText(entity.contents),
          position: entity.position,
          height: entity.height,
          layer,
        })
        break
      case "dimension":
        dimensions.push({
          kind: entity.kind,
          measurement: dimensionMeasurement(entity),
          first: entity.first,
          second: entity.second,
          linePoint: entity.linePoint,
          layer,
        })
        break
      case "hatch":
        // One per loop: four areas picked in one HATCH are one object.
        for (const loop of entity.loops) {
          const bounds = entityBounds({ ...entity, loops: [loop] })
          hatches.push({
            pattern: entity.patternId.toUpperCase(),
            min: bounds.min,
            max: bounds.max,
            layer,
          })
        }
        break
      default:
        break
    }
  }
  for (const entity of drawing.entities) visit(entity)
  return {
    segments,
    arcs,
    circles,
    texts,
    dimensions,
    hatches,
    references,
    layers,
  }
}

export function near(a: Vec2, b: Vec2, tolerance: number): boolean {
  return Math.hypot(a.x - b.x, a.y - b.y) <= tolerance
}

function onLayer(shape: OnLayer, layer: string | undefined): boolean {
  return layer === undefined || shape.layer === layer.toUpperCase()
}

/**
 * How much of the stretch from `a` to `b` is drawn over, as intervals of its
 * parameter 0..1, by the segments that lie along it.
 */
function drawnAlong(
  shapes: Shapes,
  a: Vec2,
  b: Vec2,
  tolerance: number,
  layer?: string
): [number, number][] {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const length = Math.hypot(dx, dy)
  const offLine = (p: Vec2) =>
    Math.abs((p.x - a.x) * dy - (p.y - a.y) * dx) / length
  const along = (p: Vec2) =>
    ((p.x - a.x) * dx + (p.y - a.y) * dy) / (length * length)
  const intervals: [number, number][] = []
  for (const segment of shapes.segments) {
    if (!onLayer(segment, layer)) continue
    if (offLine(segment.a) > tolerance || offLine(segment.b) > tolerance) {
      continue
    }
    const t0 = along(segment.a)
    const t1 = along(segment.b)
    intervals.push([Math.min(t0, t1), Math.max(t0, t1)])
  }
  return merged(intervals, tolerance / length)
}

function merged(
  intervals: [number, number][],
  slack: number
): [number, number][] {
  const sorted = [...intervals].sort((p, q) => p[0] - q[0])
  const out: [number, number][] = []
  for (const [from, to] of sorted) {
    const last = out.at(-1)
    if (last && from <= last[1] + slack) last[1] = Math.max(last[1], to)
    else out.push([from, to])
  }
  return out
}

/** The whole stretch from `a` to `b` is drawn, in one piece or several. */
export function covered(
  shapes: Shapes,
  a: Vec2,
  b: Vec2,
  tolerance: number,
  layer?: string
): boolean {
  const slack = tolerance / Math.hypot(b.x - a.x, b.y - a.y)
  return drawnAlong(shapes, a, b, tolerance, layer).some(
    ([from, to]) => from <= slack && to >= 1 - slack
  )
}

/** Nothing is drawn along the stretch from `a` to `b`, its ends aside. */
export function clear(
  shapes: Shapes,
  a: Vec2,
  b: Vec2,
  tolerance: number
): boolean {
  const slack = tolerance / Math.hypot(b.x - a.x, b.y - a.y)
  return drawnAlong(shapes, a, b, tolerance).every(
    ([from, to]) => to <= slack || from >= 1 - slack
  )
}

export function hasCircle(
  shapes: Shapes,
  center: Vec2,
  radius: number,
  tolerance: number,
  layer?: string
): boolean {
  return shapes.circles.some(
    (circle) =>
      onLayer(circle, layer) &&
      near(circle.center, center, tolerance) &&
      Math.abs(circle.radius - radius) <= tolerance
  )
}

/** The intervals of angle, within 0..`sweep` from `start`, that arcs and circles on this circle draw. */
function drawnAround(
  shapes: Shapes,
  center: Vec2,
  radius: number,
  start: number,
  sweep: number,
  tolerance: number,
  layer?: string
): [number, number][] {
  const sameCircle = (shape: Circle | Arc) =>
    onLayer(shape, layer) &&
    near(shape.center, center, tolerance) &&
    Math.abs(shape.radius - radius) <= tolerance
  if (shapes.circles.some(sameCircle)) return [[0, sweep]]
  const turn = (angle: number) => ((angle % 360) + 360) % 360
  const intervals: [number, number][] = []
  for (const arc of shapes.arcs.filter(sameCircle)) {
    const from = turn(arc.start - start)
    const length = turn(arc.end - arc.start) || 360
    // An arc that starts before `start` and runs past it wraps round 360.
    for (const offset of [from, from - 360]) {
      const lo = Math.max(0, offset)
      const hi = Math.min(sweep, offset + length)
      if (hi > lo) intervals.push([lo, hi])
    }
  }
  return merged(intervals, 0.01)
}

/** The arc of this circle from `start` counter-clockwise to `end` (degrees) is drawn whole. */
export function arcCovered(
  shapes: Shapes,
  center: Vec2,
  radius: number,
  start: number,
  end: number,
  tolerance: number,
  layer?: string
): boolean {
  const sweep = (((end - start) % 360) + 360) % 360 || 360
  const slack = (tolerance / radius) * DEG
  return drawnAround(
    shapes,
    center,
    radius,
    start,
    sweep,
    tolerance,
    layer
  ).some(([from, to]) => from <= slack && to >= sweep - slack)
}

/** Nothing of this circle is drawn from `start` counter-clockwise to `end`, the ends aside. */
export function arcClear(
  shapes: Shapes,
  center: Vec2,
  radius: number,
  start: number,
  end: number,
  tolerance: number
): boolean {
  const sweep = (((end - start) % 360) + 360) % 360 || 360
  const slack = (tolerance / radius) * DEG
  return drawnAround(shapes, center, radius, start, sweep, tolerance).every(
    ([from, to]) => to <= slack || from >= sweep - slack
  )
}

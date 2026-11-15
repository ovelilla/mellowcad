import { STANDARD_COLORS } from "@mellowcad/engine"
import type { Bounds, Entity, Vec2 } from "@mellowcad/engine"

/**
 * An object as the MCP server lists it to an agent: its type and exact
 * geometry, in the world's coordinates and degrees, a line each. Exact
 * geometry, not a picture: what the bench's agents checked a drawing by
 * (`docs/next-mcp.md`, §4.3).
 */
export function describeGeometry(entity: Entity): string {
  switch (entity.type) {
    case "line":
      return `line ${point(entity.start)} to ${point(entity.end)}`
    case "circle":
      return `circle center ${point(entity.center)} radius ${num(entity.radius)}`
    case "arc": {
      const at = (angle: number) => ({
        x: entity.center.x + entity.radius * Math.cos(angle),
        y: entity.center.y + entity.radius * Math.sin(angle),
      })
      return (
        `arc center ${point(entity.center)} radius ${num(entity.radius)} ` +
        `from ${degrees(entity.startAngle)}° to ${degrees(entity.endAngle)}° ccw, ` +
        `ends ${point(at(entity.startAngle))} ${point(at(entity.endAngle))}`
      )
    }
    case "polyline": {
      const vertices = entity.vertices.map((vertex, i) => {
        const bulge = entity.bulges?.[i] ?? 0
        return point(vertex) + (bulge === 0 ? "" : ` bulge ${num(bulge)}`)
      })
      return `polyline ${entity.closed ? "closed" : "open"} ${vertices.join(" ")}`
    }
    case "ellipse":
      return (
        `ellipse center ${point(entity.center)} major axis vector ` +
        `${point(entity.majorAxis)} ratio ${num(entity.ratio)}`
      )
    case "text":
      return (
        `text "${entity.value}" at ${point(entity.position)} ` +
        `height ${num(entity.height)} rotation ${degrees(entity.rotation)}°`
      )
    case "mtext":
      return (
        `mtext "${entity.contents}" at ${point(entity.position)} ` +
        `height ${num(entity.height)}`
      )
    case "dimension":
      return (
        `dimension ${entity.kind} from ${point(entity.first)} to ` +
        `${point(entity.second)}, dimension line through ${point(entity.linePoint)}`
      )
    case "hatch":
      return `hatch ${entity.patternId}, ${entity.loops.length} loop(s)`
    case "insert":
      return `block reference at ${point(entity.position)} rotation ${degrees(entity.rotation)}°`
    case "point":
      return `point ${point(entity.position)}`
    default:
      return entity.type
  }
}

/** A layer's colour by AutoCAD's name where it has one (`red`), else its hex. */
export function colorName(hex: string): string {
  return (
    STANDARD_COLORS.find(
      (color) => color.value.toLowerCase() === hex.toLowerCase()
    )?.id ?? hex
  )
}

export function extentsText(count: number, extents: Bounds | null): string {
  if (extents === null) return "The drawing is empty."
  return (
    `${count} objects, extents ` +
    `${point(extents.min)} to ${point(extents.max)}`
  )
}

function num(value: number): string {
  const rounded = Math.round(value * 1e4) / 1e4
  return Object.is(rounded, -0) ? "0" : String(rounded)
}

function point(p: Vec2): string {
  return `(${num(p.x)},${num(p.y)})`
}

function degrees(radians: number): string {
  return num((radians * 180) / Math.PI)
}

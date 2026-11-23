import { Vec3 } from "../../geometry/Vec3"
import type { HatchEntity } from "../../domain/entities"
import { isSolidHatchPattern } from "../../domain/hatchPatterns"
import { DxfOut } from "./dxfOut"
import { R12_HATCH_DATA } from "./dxfR12Hatch"
import { gradientColorIndices, hatchDrawnLines } from "./dxfWriteEntities"

/** An xdata group: a string, a number or a point, by its code. */
type Group = readonly [code: number, value: string | number | Vec3]

/** The applications of a gradient's two index colours, as R12 names them (x040). */
export const R12_GRADIENT_COLOR_APPS = [
  "GRADIENTCOLOR1ACI",
  "GRADIENTCOLOR2ACI",
] as const

/**
 * The most xdata an object holds, in bytes: each group its code in one byte
 * and its value, and 10 for each application. A hatch whose data does not
 * fit is written without it (x048: a boundary of 410 line edges fits, of 411
 * does not; of 314 arc edges fits, of 315 does not).
 */
const XDATA_LIMIT = 16383

function groupSize([code, value]: Group): number {
  if (typeof value === "string") {
    return code === 1002 ? 2 : 4 + value.length
  }
  if (typeof value !== "number") return 25
  return code === 1070 ? 3 : code === 1071 ? 5 : 9
}

function put(out: DxfOut, groups: readonly Group[]): void {
  for (const [code, value] of groups) {
    if (typeof value === "string") out.str(code, value)
    else if (typeof value !== "number")
      out.point(code, value.x, value.y, value.z)
    else if (code === 1040) out.real(code, value)
    else out.int(code, value)
  }
}

/**
 * The xdata of the reference AutoCAD's R12 writes for a hatch, after its
 * groups: a gradient's two colours by index, each under its application
 * (the hatch's own xdata carried over, as a 2000 DXF has it), then ACAD's.
 * This model's hatch is not associative and its loops are polylines, so
 * there is no `ASC_BOUNDS` and no boundary handle (x039's hatch made with
 * Associativity off). Reals are rounded to the file's places, as AutoCAD
 * rounds xdata (x047).
 */
export function writeR12HatchXdata(
  out: DxfOut,
  e: HatchEntity,
  handle: string
): void {
  const solid = isSolidHatchPattern(e.patternId)
  const user = e.patternType === "user"
  const lines = solid ? [] : hatchDrawnLines(e)
  const double = user && lines.length > 1 ? 1 : 0
  const n = e.normal ?? { x: 0, y: 0, z: 1 }
  const colors = e.gradient ? gradientColorIndices(e.gradient) : []

  const pattern: Group[] = solid
    ? []
    : [
        [1070, 19],
        [1000, e.patternId],
        [1040, e.patternScale],
        [1040, e.patternAngle],
        ...(user ? [[1070, double] as Group] : []),
      ]
  const data: Group[] = [
    [1000, R12_HATCH_DATA],
    [1000, handle],
    [1011, { x: 1, y: 0, z: 0 }],
    [1011, { x: 0, y: 1, z: 0 }],
    [1011, { x: 0, y: 0, z: 1 }],
    [1040, e.elevation ?? 0],
    [1010, n],
    [1000, e.patternId],
    [1070, solid ? 1 : 0],
    [1070, 0],
    [1071, e.loops.length],
  ]
  for (const loop of e.loops) {
    const bulged = (loop.bulges ?? []).some((b) => b !== 0)
    data.push(
      [1071, 2],
      [1070, bulged ? 1 : 0],
      [1070, 1],
      [1071, loop.vertices.length]
    )
    loop.vertices.forEach((v, i) => {
      data.push([1040, v.x], [1040, v.y])
      if (bulged) data.push([1040, loop.bulges?.[i] ?? 0])
    })
    data.push([1071, 0])
  }
  data.push([1070, 0], [1070, user ? 0 : e.patternType === "custom" ? 2 : 1])
  if (!solid) {
    data.push(
      [1040, e.patternAngle],
      [1040, e.patternScale],
      [1070, double],
      [1070, lines.length]
    )
    for (const l of lines) {
      data.push(
        [1040, l.angle],
        [1040, l.base.x],
        [1040, l.base.y],
        [1040, l.offset.x],
        [1040, l.offset.y],
        [1070, l.dashes.length],
        ...l.dashes.map((d): Group => [1040, d])
      )
    }
  }
  data.push([1071, 0])

  const open: Group[] = solid
    ? [[1002, "{"]]
    : [
        [1000, "HATCH"],
        [1002, "{"],
      ]
  const close: Group = [1002, "}"]
  const whole = [...open, ...pattern, ...data, close]
  const size =
    colors.length * (10 + 3) +
    10 +
    whole.reduce((sum, g) => sum + groupSize(g), 0)

  colors.forEach((index, i) => {
    out.str(1001, R12_GRADIENT_COLOR_APPS[i])
    out.int(1070, index)
  })
  if (size <= XDATA_LIMIT) {
    out.str(1001, "ACAD")
    put(out, whole)
  } else if (!solid) {
    // Too long a boundary: the pattern alone, and a fill nothing (x048).
    out.str(1001, "ACAD")
    put(out, [...open, ...pattern, close])
  }
}

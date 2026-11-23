import type { DxfRecord } from "./dxfSections"

/**
 * The group of an R12 hatch's xdata that holds the hatch. R12 has no HATCH:
 * AutoCAD 2027's DXFOUT R12 writes a reference to an anonymous block of what
 * the hatch draws and says what the hatch is in the reference's xdata (probes
 * dxf/x034–x049; `writeR12HatchXdata` writes it, `r12HatchRecord` reads it):
 *
 * - `ACAD`'s `HATCH` group, R12's own (a pattern only): `19`, the pattern,
 *   its scale and its angle in radians, a User-defined one's Double after
 *   them; an associative hatch's boundary objects (`ASC_BOUNDS`, each of them
 *   naming the reference back) and first seed point (`ASC_SEEDPOINT`). LIST
 *   reads a block reference's pattern, scale, angle and `Associative` here.
 * - `R14_HATCH_DATA`, inside the same braces: the reference's handle, three
 *   axes, the elevation, the normal, and then the HATCH's own groups in
 *   their order, each as xdata (a string 1000, a 16-bit integer 1070, a
 *   32-bit one 1071, a real 1040 with every angle in radians, a boundary
 *   object's handle 1005, a seed point's X, Y and elevation).
 *
 * Opening the file leaves the reference a reference; AutoCAD's CONVERT
 * (Hatch), or an edit of it (MOVE, ROTATE: x049), is what makes a HATCH of
 * it again, from `R14_HATCH_DATA` alone: it converts a reference whose block
 * was emptied the same (x045's v5), and leaves one without it and without
 * boundary objects (x048).
 */
export const R12_HATCH_DATA = "R14_HATCH_DATA"

const DEG = 180 / Math.PI

/** Reads xdata groups in order; a group of another code than asked ends the reading. */
class Xdata {
  failed = false

  constructor(
    private readonly r: DxfRecord,
    private at: number
  ) {}

  private take(code: number): string | undefined {
    if (this.failed || this.r.codes[this.at] !== code) {
      this.failed = true
      return undefined
    }
    return this.r.values[this.at++]
  }

  peek(): number | undefined {
    return this.r.codes[this.at]
  }

  skip(code: number, count = 1): void {
    for (let i = 0; i < count; i++) this.take(code)
  }

  text(code: number): string {
    return this.take(code)?.trim() ?? ""
  }

  number(code: number): number {
    const value = Number.parseFloat(this.take(code) ?? "")
    if (!Number.isFinite(value)) this.failed = true
    return value
  }

  /** An integer no file of a drawing reaches: a count that would loop for ever is a damaged file. */
  count(code: number): number {
    const value = this.number(code)
    if (!(value >= 0 && value <= this.r.codes.length)) this.failed = true
    return this.failed ? 0 : Math.trunc(value)
  }
}

/** The groups of a HATCH record, as they are gathered. */
class HatchGroups {
  readonly codes: number[] = []
  readonly values: string[] = []

  put(code: number, value: number | string): void {
    this.codes.push(code)
    this.values.push(String(value))
  }
}

/**
 * The groups of the reference that are any object's: its handle, layer,
 * linetype, colour and space, and those a later version's file adds to them.
 */
const OBJECT_GROUPS: ReadonlySet<number> = new Set([
  5, 6, 8, 48, 60, 62, 67, 370, 420, 430, 440,
])

/**
 * The HATCH that AutoCAD's CONVERT makes of an R12 hatch's reference, as a
 * record of HATCH's own groups, or null for a reference that is no hatch or
 * whose data cannot be followed. It is the reference's `R14_HATCH_DATA`
 * group by group, on the reference's layer with its colour and linetype
 * (back.sh on x034–x042: each converted hatch is the 2018 file's but for the
 * linetype, Continuous as the reference's, and HPORIGIN's xdata, lost: the
 * origin is where the pattern's first line starts). The boundary objects'
 * handles are kept as the HATCH lists them (97, 330).
 *
 * Only a reference that names itself in its data, where AutoCAD put it: a
 * copy of one carries its source's handle and stays a reference through
 * CONVERT (x049), and AutoCAD makes the hatch of one before it moves it, so a
 * reference found elsewhere, scaled or turned is no file of AutoCAD's and
 * its data says nothing of where it now is.
 */
export function r12HatchRecord(r: DxfRecord): DxfRecord | null {
  const start = r12HatchData(r)
  if (start < 0 || !inPlace(r)) return null
  const x = new Xdata(r, start)
  const out = new HatchGroups()
  let own = ""
  r.codes.forEach((code, i) => {
    if (code === 5) own = r.values[i].trim().toUpperCase()
    if (OBJECT_GROUPS.has(code)) out.put(code, r.values[i])
  })

  if (x.text(1000).toUpperCase() !== own || own === "") return null
  for (let i = 0; i < 3; i++) {
    x.skip(1011)
    x.skip(1021)
    x.skip(1031)
  }
  out.put(10, 0)
  out.put(20, 0)
  out.put(30, x.number(1040))
  out.put(210, x.number(1010))
  out.put(220, x.number(1020))
  out.put(230, x.number(1030))
  out.put(2, x.text(1000))
  const solid = x.number(1070)
  out.put(70, solid)
  out.put(71, x.number(1070))
  const loops = x.count(1071)
  out.put(91, loops)
  for (let i = 0; i < loops && !x.failed; i++) {
    const flags = x.number(1071)
    out.put(92, flags)
    if (flags & 2) polylineLoop(x, out)
    else {
      const edges = x.count(1071)
      out.put(93, edges)
      for (let k = 0; k < edges && !x.failed; k++) edge(x, out)
    }
    const sources = x.count(1071)
    out.put(97, sources)
    for (let k = 0; k < sources; k++) out.put(330, x.text(1005))
  }
  out.put(75, x.number(1070))
  out.put(76, x.number(1070))
  if (!solid) {
    out.put(52, x.number(1040) * DEG)
    out.put(41, x.number(1040))
    out.put(77, x.number(1070))
    const lines = x.count(1070)
    out.put(78, lines)
    for (let i = 0; i < lines && !x.failed; i++) {
      out.put(53, x.number(1040) * DEG)
      for (const code of [43, 44, 45, 46]) out.put(code, x.number(1040))
      const dashes = x.count(1070)
      out.put(79, dashes)
      for (let k = 0; k < dashes; k++) out.put(49, x.number(1040))
    }
  }
  // The pixel size of a hatch made by picking a point, only when it has one.
  if (x.peek() === 1040) out.put(47, x.number(1040))
  const seeds = x.count(1071)
  out.put(98, seeds)
  for (let i = 0; i < seeds; i++) {
    out.put(10, x.number(1040))
    out.put(20, x.number(1040))
    x.skip(1040)
  }
  if (x.failed) return null
  return { type: "HATCH", codes: out.codes, values: out.values, line: r.line }
}

/** Whether a reference stands at the origin, unscaled, unturned, on the plan, one cell. */
function inPlace(r: DxfRecord): boolean {
  const expected: Record<number, number> = {
    10: 0,
    20: 0,
    30: 0,
    41: 1,
    42: 1,
    43: 1,
    50: 0,
    70: 1,
    71: 1,
    210: 0,
    220: 0,
    230: 1,
  }
  return r.codes.every((code, i) => {
    if (code >= 1000 || !(code in expected)) return true
    return Math.abs(Number.parseFloat(r.values[i]) - expected[code]) < 1e-9
  })
}

/** Where a reference's `R14_HATCH_DATA` starts, after its name, in ACAD's xdata; -1 without it. */
function r12HatchData(r: DxfRecord): number {
  let acad = false
  for (let i = 0; i < r.codes.length; i++) {
    const code = r.codes[i]
    if (code === 1001) acad = r.values[i].trim().toUpperCase() === "ACAD"
    else if (acad && code === 1000 && r.values[i].trim() === R12_HATCH_DATA)
      return i + 1
  }
  return -1
}

function polylineLoop(x: Xdata, out: HatchGroups): void {
  const bulged = x.number(1070)
  out.put(72, bulged)
  out.put(73, x.number(1070))
  const count = x.count(1071)
  out.put(93, count)
  for (let i = 0; i < count && !x.failed; i++) {
    out.put(10, x.number(1040))
    out.put(20, x.number(1040))
    if (bulged) out.put(42, x.number(1040))
  }
}

/** One edge of a loop: a line (1), an arc (2), an elliptical arc (3) or a spline (4). */
function edge(x: Xdata, out: HatchGroups): void {
  const kind = x.number(1070)
  out.put(72, kind)
  if (kind === 1) {
    for (const code of [10, 20, 11, 21]) out.put(code, x.number(1040))
  } else if (kind === 2) {
    for (const code of [10, 20, 40]) out.put(code, x.number(1040))
    out.put(50, x.number(1040) * DEG)
    out.put(51, x.number(1040) * DEG)
    out.put(73, x.number(1070))
  } else if (kind === 3) {
    for (const code of [10, 20, 11, 21, 40]) out.put(code, x.number(1040))
    out.put(50, x.number(1040) * DEG)
    out.put(51, x.number(1040) * DEG)
    out.put(73, x.number(1070))
  } else if (kind === 4) splineEdge(x, out)
  else x.failed = true
}

/**
 * A spline edge: its degree, whether it is rational and periodic, its knots
 * and its control points (a rational one's weight after each), no fit data.
 * A closed spline's is written periodic, one knot more than control points
 * (x037's first hatch), where a HATCH holds it whole: the same curve with its
 * knots carried a period each way and its control points wrapped round from
 * the one `degree` places back (the 2018 file's edges of x037's splines closed
 * through 4 and through 6 points, to 1e-13).
 */
function splineEdge(x: Xdata, out: HatchGroups): void {
  const degree = x.number(1070)
  const rational = x.number(1070)
  const periodic = x.number(1070)
  const knotCount = x.count(1071)
  const pointCount = x.count(1071)
  const knots: number[] = []
  for (let i = 0; i < knotCount; i++) knots.push(x.number(1040))
  const points: { x: number; y: number; w: number }[] = []
  for (let i = 0; i < pointCount && !x.failed; i++) {
    const px = x.number(1040)
    const py = x.number(1040)
    points.push({ x: px, y: py, w: rational ? x.number(1040) : 1 })
  }
  // A degree no spline has would size the arrays below: a damaged file.
  if (!(Number.isInteger(degree) && degree >= 1 && degree <= pointCount)) {
    x.failed = true
  }
  if (x.failed) return
  let allKnots = knots
  let allPoints = points
  if (periodic && knotCount === pointCount + 1 && pointCount > 0) {
    const n = pointCount
    const period = knots[n] - knots[0]
    const knot = (i: number) => {
      const turn = Math.floor(i / n)
      return knots[i - turn * n] + turn * period
    }
    allKnots = Array.from({ length: n + 2 * degree + 1 }, (_, j) =>
      knot(j - degree)
    )
    allPoints = Array.from(
      { length: n + degree },
      (_, j) => points[(((j - degree) % n) + n) % n]
    )
  }
  out.put(94, degree)
  out.put(73, rational)
  out.put(74, 0)
  out.put(95, allKnots.length)
  out.put(96, allPoints.length)
  for (const k of allKnots) out.put(40, k)
  for (const p of allPoints) {
    out.put(10, p.x)
    out.put(20, p.y)
    if (rational) out.put(42, p.w)
  }
}

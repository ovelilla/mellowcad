import { readFileSync } from "node:fs"
import { gunzipSync } from "node:zlib"
import { describe, expect, it } from "vitest"
import { p } from "../../../test/builders"
import type {
  ArcEntity,
  CircleEntity,
  DimensionEntity,
  EllipseEntity,
  Entity,
  HatchEntity,
  InsertEntity,
  LineEntity,
  MTextEntity,
  PointEntity,
  Solid2dEntity,
  Polyline3dEntity,
  PolylineEntity,
  SplineEntity,
  TextEntity,
} from "../../domain/entities"
import { DxfReadError, ParsedDxf, parseDxf } from "./readDxf"
import { unicode } from "./dxfEntities"

// AutoCAD 2027's own DXF files of two reference drawings (probes f001–f005 in
// scripts/research/probes/dxf/, saved with SAVEAS's DXF types): what each
// object becomes here, in every version and in binary, and what is left out.

function fixture(name: string): Uint8Array {
  const path = new URL(`./fixtures/${name}.dxf.gz`, import.meta.url)
  return new Uint8Array(gunzipSync(readFileSync(path)))
}

const open = (name: string): ParsedDxf => parseDxf(fixture(name))

/** A file written by hand, as text: one group per two lines. */
function dxf(...lines: string[]): string {
  return lines.join("\n")
}

function ofType<T extends Entity>(parsed: ParsedDxf, type: T["type"]): T[] {
  return parsed.drawing.entities.filter((e): e is T => e.type === type)
}

function layerName(parsed: ParsedDxf, id: string): string | undefined {
  return parsed.drawing.layers.find((l) => l.id === id)?.name
}

/** A drawing compared without ids, which every read mints anew. */
function shape(parsed: ParsedDxf, places = 9): unknown {
  const names = new Map(parsed.drawing.layers.map((l) => [l.id, l.name]))
  const strip = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(strip)
    if (value && typeof value === "object") {
      return Object.fromEntries(
        Object.entries(value)
          .filter(([key]) => key !== "id")
          .map(([key, v]) => [
            key,
            key === "layerId" ? names.get(v as string) : strip(v),
          ])
      )
    }
    return typeof value === "number"
      ? Math.round(value * 10 ** places) / 10 ** places
      : value
  }
  return strip({
    entities: parsed.drawing.entities,
    blocks: parsed.drawing.blocks,
  })
}

/** Equal structures whose numbers differ by `tolerance` at most. */
function expectNear(
  actual: unknown,
  expected: unknown,
  tolerance: number,
  path = ""
): void {
  if (typeof expected === "number") {
    expect(typeof actual, path).toBe("number")
    expect(Math.abs((actual as number) - expected), path).toBeLessThanOrEqual(
      tolerance
    )
  } else if (Array.isArray(expected)) {
    expect(Array.isArray(actual), path).toBe(true)
    expect((actual as unknown[]).length, path).toBe(expected.length)
    expected.forEach((item, i) =>
      expectNear((actual as unknown[])[i], item, tolerance, `${path}[${i}]`)
    )
  } else if (expected && typeof expected === "object") {
    expect(Object.keys(actual as object).sort(), path).toEqual(
      Object.keys(expected).sort()
    )
    for (const [key, value] of Object.entries(expected)) {
      expectNear(
        (actual as Record<string, unknown>)[key],
        value,
        tolerance,
        `${path}.${key}`
      )
    }
  } else {
    expect(actual, path).toEqual(expected)
  }
}

describe("parseDxf: AutoCAD 2027's files of the first drawing (f001, f002)", () => {
  const drawing = open("fixture-2018")

  it("opens every version from 2004 to 2018 and binary 2018 alike", () => {
    for (const name of [
      "fixture-2013",
      "fixture-2010",
      "fixture-2007",
      "fixture-2004",
      "fixture-2018-bin",
    ]) {
      expect(shape(open(name)), name).toEqual(shape(drawing))
    }
  })

  it("opens 2000's, which has no true colours, with AutoCAD's index for one", () => {
    const circles = ofType<CircleEntity>(open("fixture-2000"), "circle")
    expect(circles[1].color).toBe("#ff7f00")
  })

  it("reads binary R12, one-byte group codes, as its text twin", () => {
    const ascii = open("fixture-R12")
    const binary = open("fixture-R12-bin")
    expect(binary.drawing.layers.map((l) => l.name)).toEqual(
      ascii.drawing.layers.map((l) => l.name)
    )
    // WHY not the blocks, nor every digit: AutoCAD broke the SOLID hatch into
    // a different number of triangles in each R12 file it wrote, and wrote
    // the text one's converted ellipses to four decimals.
    expectNear(
      (shape(binary) as { entities: unknown }).entities,
      (shape(ascii) as { entities: unknown }).entities,
      1e-3
    )
  })

  it("lists what the model has no object for, by type, and paper space apart", () => {
    expect([...drawing.report.leftOut]).toEqual([
      ["XLINE", 1],
      ["RAY", 1],
      ["LEADER", 1],
      ["3DSOLID", 1],
      ["REGION", 1],
    ])
    expect(drawing.report.inLayouts).toBe(1)
    expect(drawing.report.unreadable).toBe(0)
  })

  it("keeps each layer's colour, linetype, lineweight and state", () => {
    const layers = Object.fromEntries(
      drawing.drawing.layers.map((l) => [l.name, l])
    )
    expect(Object.keys(layers)).toEqual([
      "0",
      "Walls",
      "Hidden",
      "Locked",
      "Frozen",
      "Señales",
      "Defpoints",
    ])
    expect(layers["0"].id).toBe("0")
    expect(layers.Walls).toMatchObject({
      color: "#ff0000",
      linetype: "Dashed",
      lineweight: 0.5,
      visible: true,
    })
    expect(layers.Hidden.visible).toBe(false)
    expect(layers.Locked).toMatchObject({ locked: true, visible: true })
    // No FREEZE here: a frozen layer opens off.
    expect(layers.Frozen.visible).toBe(false)
    expect(layers["Señales"].color).toBe("#ff8000")
  })

  it("reads the styles, a dimension style's missing groups at the DXF's own defaults", () => {
    expect(drawing.drawing.textStyles.map((s) => s.name)).toEqual([
      "Standard",
      "Annotative",
      "Notes",
    ])
    const styles = Object.fromEntries(
      drawing.drawing.dimStyles.map((s) => [s.name, s])
    )
    expect(styles.Standard).toMatchObject({
      textHeight: 0.18,
      arrowSize: 0.18,
      decimals: 4,
      decimalSeparator: ".",
    })
    expect(styles["ISO-25"]).toMatchObject({
      textHeight: 2.5,
      arrowSize: 2.5,
      decimals: 2,
      decimalSeparator: ",",
      suppressTrailingZeros: true,
      forceLineInside: true,
      scale: 1,
    })
    expect(styles.Arch.scale).toBe(2)
  })

  it("takes the drawing's units and precision", () => {
    expect(drawing.drawing.settings.unit).toBe("mm")
    expect(drawing.drawing.settings.precision).toBe(4)
  })

  it("reads lines with their Z and their own colour, linetype and lineweight", () => {
    const [walls, centre] = ofType<LineEntity>(drawing, "line")
    expect(layerName(drawing, walls.layerId)).toBe("Walls")
    expect(walls.end).toBeCloseToPoint({ x: 100, y: 0 })
    expect(centre).toMatchObject({
      deltaZ: 5,
      color: "#00ff00",
      linetype: "Center",
      lineweight: 0.35,
    })
  })

  it("reads circles and arcs, a thickness, a true colour and a circle off the plan", () => {
    const [thick, , tilted] = ofType<CircleEntity>(drawing, "circle")
    expect(thick).toMatchObject({ radius: 5, thickness: 2 })
    expect(ofType<CircleEntity>(drawing, "circle")[1].color).toBe("#ff8000")
    expect(tilted).toMatchObject({ elevation: 5, radius: 3 })
    expect(tilted.normal).toEqual({ x: 0, y: -1, z: 0 })
    const [arc] = ofType<ArcEntity>(drawing, "arc")
    expect(arc.startAngle).toBeCloseTo((278.8733853924698 * Math.PI) / 180, 12)
    expect(arc.endAngle).toBeCloseTo((314.366926962348 * Math.PI) / 180, 12)
  })

  it("reads a 2D solid, its corners in the order written (solid2d/p01)", () => {
    const solids = ofType<Solid2dEntity>(drawing, "solid2d")
    expect(solids.map((s) => s.corners)).toEqual([
      [p(200, 10), p(210, 10), p(200, 20), p(210, 20)],
    ])
  })

  it("reads a point, which a new drawing shows as a dot (PDMODE 0)", () => {
    expect(ofType<PointEntity>(drawing, "point")).toEqual([
      expect.objectContaining({ position: { x: 200, y: 0 } }),
    ])
    expect(drawing.drawing.settings).toMatchObject({
      pointMode: 0,
      pointSize: 0,
    })
  })

  it("reads an ellipse and an elliptical arc", () => {
    const [whole, part] = ofType<EllipseEntity>(drawing, "ellipse")
    expect(whole).toMatchObject({ ratio: 0.3, majorAxis: { x: 10, y: 0 } })
    expect(whole.startParam).toBeUndefined()
    expect(part.endParam).toBeCloseTo(1.5 * Math.PI, 12)
  })

  it("reads a polyline's widths and arcs, and the fitted ones as PEDIT left them", () => {
    const [wide, curve, splined] = ofType<PolylineEntity>(drawing, "polyline")
    expect(wide).toMatchObject({
      closed: true,
      widths: [
        [0.5, 1],
        [1, 1],
        [0, 0],
        [0, 0],
      ],
    })
    expect(wide.bulges?.[1]).toBeCloseTo(Math.tan(Math.PI / 8), 12)
    expect(curve.vertices).toHaveLength(4)
    expect(curve.fit?.kind).toBe("curve")
    const arcs = curve.fit?.kind === "curve" ? curve.fit.arcs : []
    expect(arcs).toHaveLength(3)
    expect(arcs[1]?.joint).toBeCloseToPoint({ x: 15, y: 72.5 })
    expect(arcs[1]?.bulges[0]).toBeCloseTo(-0.2069555463432968, 12)
    expect(splined.fit).toEqual({ kind: "cubic", segments: 8 })
    const [poly3d] = ofType<Polyline3dEntity>(drawing, "polyline3d")
    expect(poly3d.vertices).toEqual([
      { x: 0, y: 90, z: 0 },
      { x: 10, y: 90, z: 5 },
      { x: 20, y: 95, z: 0 },
    ])
  })

  it("reads a fit spline by its fit points and chord knots, a CV spline by its vertices", () => {
    const [fit, cv] = ofType<SplineEntity>(drawing, "spline")
    expect(fit).toMatchObject({ method: "fit", knots: "chord", closed: false })
    expect(fit.points).toHaveLength(4)
    expect(fit.knotVector).toBeUndefined()
    expect(cv).toMatchObject({ method: "cv", degree: 3 })
    expect(cv.knotVector).toBeUndefined()
  })

  it("reads text in its encoding, justified, with its style", () => {
    const [middle, alpha] = ofType<TextEntity>(drawing, "text")
    expect(middle).toMatchObject({
      value: "Ñandú ø 50°",
      justify: "mc",
      height: 2.5,
    })
    expect(middle.position).toBeCloseToPoint({ x: 120, y: 0 })
    expect(middle.rotation).toBeCloseTo(Math.PI / 6, 12)
    expect(alpha).toMatchObject({ value: "alpha α end", styleId: "Notes" })
    const [mtext] = ofType<MTextEntity>(drawing, "mtext")
    expect(mtext).toMatchObject({
      contents: "First line\\PSecond line ü",
      width: 40,
      attachment: "tl",
    })
  })

  it("decodes 2004's code page, its \\U+ escapes and R12's", () => {
    for (const name of ["fixture-2004", "fixture-2000", "fixture-R12"]) {
      const values = ofType<TextEntity>(open(name), "text").map((t) => t.value)
      expect(values, name).toEqual(["Ñandú ø 50°", "alpha α end"])
    }
  })

  it("puts a reference's attributes into its block's coordinates", () => {
    const [reference] = ofType<InsertEntity>(drawing, "insert")
    expect(reference).toMatchObject({ blockId: "Part", scaleX: 2, scaleY: 2 })
    expect(reference.rotation).toBeCloseTo(Math.PI / 12, 12)
    const [attribute] = reference.attributes ?? []
    expect(attribute).toMatchObject({ tag: "TAG", value: "B-7", height: 2 })
    expect(attribute.position).toBeCloseToPoint({ x: -4, y: -7 })
    expect(attribute.rotation).toBeCloseTo(0, 9)
    const [part] = drawing.drawing.blocks
    expect(part.entities.map((e) => e.type)).toEqual(["polyline", "attdef"])
  })

  it("reads each kind of dimension from its definition points and its style", () => {
    const dims = ofType<DimensionEntity>(drawing, "dimension")
    expect(dims.map((d) => [d.kind, d.styleId])).toEqual([
      ["linear", "ISO-25"],
      ["aligned", "ISO-25"],
      ["angular", "ISO-25"],
      ["radius", "ISO-25"],
      ["diameter", "ISO-25"],
      ["linear", "Arch"],
    ])
    const [linear, , angular, radius, diameter] = dims
    expect(linear.first).toBeCloseToPoint({ x: 0, y: -20 })
    expect(linear.second).toBeCloseToPoint({ x: 40, y: -20 })
    expect(linear.linePoint).toBeCloseToPoint({ x: 40, y: -30 })
    expect(angular.vertex).toBeCloseToPoint({ x: 100, y: -20 })
    expect(radius.first).toBeCloseToPoint({ x: 20, y: 30 })
    expect(Math.hypot(radius.second.x - 20, radius.second.y - 30)).toBeCloseTo(
      5,
      9
    )
    expect(diameter.first).toBeCloseToPoint({ x: 60, y: 30 })
  })

  it("reads a pattern hatch and a solid one", () => {
    const [pattern, solid] = ofType<HatchEntity>(drawing, "hatch")
    expect(pattern).toMatchObject({
      patternId: "ANSI31",
      patternScale: 1,
      origin: { x: 0, y: 0 },
    })
    expect(pattern.loops[0].vertices).toHaveLength(4)
    expect(solid.patternId).toBe("SOLID")
    expect(solid.loops[0]).toEqual({
      vertices: [
        { x: 58, y: -50 },
        { x: 42, y: -50 },
      ],
      bulges: [1, 1],
    })
  })
})

describe("parseDxf: AutoCAD 2027's files of the second drawing (f004, f005)", () => {
  const drawing = open("fixture2-2018")

  it("leaves out the ordinate dimension and takes the drawing in metres", () => {
    expect([...drawing.report.leftOut]).toEqual([["DIMENSION", 1]])
    expect(drawing.drawing.settings.unit).toBe("m")
  })

  it("opens a closed spline, which AutoCAD writes on open knots, as that curve", () => {
    const [closedFit, closedCv, tangents, rational, spatial] =
      ofType<SplineEntity>(drawing, "spline")
    for (const spline of [closedFit, closedCv]) {
      expect(spline).toMatchObject({ method: "cv", closed: true, degree: 3 })
      expect(spline.points).toHaveLength(7)
      expect(spline.knotVector).toHaveLength(11)
    }
    expect(tangents).toMatchObject({ method: "fit", knots: "chord" })
    expect(tangents.startTangent).toEqual({ x: 1, y: 1, z: 0 })
    expect(tangents.endTangent?.x).toBeCloseTo(Math.SQRT1_2, 12)
    expect(rational.weights).toEqual([1, 0.7071067811865476, 1])
    expect(rational.degree).toBe(2)
    expect(spatial.points.map((p) => p.z)).toEqual([0, 5, 0, -5])
  })

  it("lays a hatch's elliptical and spline edges as runs, and keeps HPORIGIN", () => {
    const hatches = ofType<HatchEntity>(drawing, "hatch")
    const [edges, origin, unknown, user] = hatches
    expect(edges.loops).toHaveLength(2)
    const [outer] = edges.loops
    expect(outer.vertices[0]).toBeCloseToPoint({ x: 340, y: 20 })
    expect(outer.vertices.length).toBeGreaterThan(20)
    expect(origin.origin).toEqual({ x: 7, y: 3 })
    // A pattern the model has not keeps its name, and draws no fill yet.
    expect(unknown).toMatchObject({ patternId: "AR-B816", patternScale: 0.1 })
    expect(user).toMatchObject({ patternId: "_U", patternScale: 3 })
    expect(user.patternAngle).toBeCloseTo(Math.PI / 4, 12)
  })

  it("opens a MINSERT as one reference per row and column", () => {
    const parts = ofType<InsertEntity>(drawing, "insert").filter(
      (i) => i.blockId === "Part" && i.scaleX > 0
    )
    expect(parts.map((p) => [p.position.x, p.position.y])).toEqual([
      [400, 200],
      [420, 200],
      [440, 200],
      [400, 230],
      [420, 230],
      [440, 230],
    ])
  })

  it("brings a mirrored reference's attribute back into its block", () => {
    const mirrored = ofType<InsertEntity>(drawing, "insert").find(
      (i) => i.scaleX < 0
    )
    expect(mirrored?.scaleY).toBeCloseTo(0.002, 12)
    expect(mirrored?.attributes?.[0].position).toBeCloseToPoint({
      x: -4,
      y: -7,
    })
  })

  it("keeps a dimension's text, a moved text's point and a two-line angle", () => {
    const [hello, moved, angle] = ofType<DimensionEntity>(drawing, "dimension")
    expect(hello.text).toBe("Hello <>")
    expect(moved.textPoint).toBeCloseToPoint({ x: 62, y: -115 })
    expect(angle.kind).toBe("angular")
    expect(angle.vertex).toBeCloseToPoint({ x: 600, y: 0 })
    // Both lines cross the arc, so its ends are the endpoints: no extension lines.
    const radius = Math.hypot(angle.linePoint.x - 600, angle.linePoint.y)
    for (const end of [angle.first, angle.second]) {
      expect(Math.hypot(end.x - 600, end.y)).toBeCloseTo(radius, 9)
    }
  })

  it("reads TEXT's Align and Fit left-justified at their first point", () => {
    const [fitted, aligned] = ofType<TextEntity>(drawing, "text")
    expect(fitted).toMatchObject({
      value: "Fitted",
      justify: "left",
      height: 3,
    })
    expect(fitted.position).toBeCloseToPoint({ x: 400, y: 130 })
    expect(aligned.justify).toBe("left")
  })

  it("reads a long MTEXT's chunks in order and its direction", () => {
    const [mtext] = ofType<MTextEntity>(drawing, "mtext")
    expect(mtext.contents.startsWith("Lorem ipsum")).toBe(true)
    expect(mtext.contents.endsWith("pariatur.\\PEnd ñ")).toBe(true)
    expect(mtext.rotation).toBeCloseTo(Math.PI / 6, 12)
  })

  it("puts an ellipse off the plan in its plane's coordinates", () => {
    const tilted = ofType<EllipseEntity>(drawing, "ellipse").find(
      (e) => e.normal
    )
    expect(tilted?.majorAxis).toBeCloseToPoint({ x: 10, y: 0 })
    expect(tilted?.normal?.y).toBeCloseTo(-1, 12)
  })
})

describe("parseDxf: files AutoCAD discards whole open here (t-*, x009, x010)", () => {
  const line = [
    "  0",
    "LINE",
    "  8",
    "0",
    " 10",
    "0.0",
    " 20",
    "0.0",
    " 30",
    "0.0",
    " 11",
    "10.0",
    " 21",
    "5.0",
    " 31",
    "0.0",
  ]

  it("opens an ENTITIES section alone, making the layers it names", () => {
    const parsed = parseDxf(
      dxf(
        "  0",
        "SECTION",
        "  2",
        "ENTITIES",
        ...line,
        "  0",
        "CIRCLE",
        "  8",
        "MYLAYER",
        " 10",
        "5.0",
        " 20",
        "5.0",
        " 40",
        "2.5",
        "  0",
        "ENDSEC",
        "  0",
        "EOF"
      )
    )
    expect(parsed.drawing.entities.map((e) => e.type)).toEqual([
      "line",
      "circle",
    ])
    expect(parsed.drawing.layers.map((l) => l.name)).toEqual(["0", "MYLAYER"])
  })

  it("opens a file whose EOF is missing, unknown objects and groups skipped", () => {
    const parsed = parseDxf(
      dxf(
        "  0",
        "SECTION",
        "  2",
        "ENTITIES",
        "  0",
        "FOOBAR",
        "  8",
        "0",
        " 10",
        "1.0",
        ...line,
        " 77",
        "3",
        "  0",
        "ENDSEC"
      )
    )
    expect(parsed.drawing.entities.map((e) => e.type)).toEqual(["line"])
    expect([...parsed.report.leftOut]).toEqual([["FOOBAR", 1]])
  })

  it("counts an object it cannot make, and opens the rest", () => {
    const parsed = parseDxf(
      dxf(
        "  0",
        "SECTION",
        "  2",
        "ENTITIES",
        "  0",
        "LINE",
        "  8",
        "0",
        " 10",
        "abc",
        " 20",
        "0.0",
        " 11",
        "1.0",
        " 21",
        "1.0",
        "  0",
        "CIRCLE",
        "  8",
        "0",
        " 10",
        "5.0",
        " 20",
        "5.0",
        ...line,
        "  0",
        "ENDSEC",
        "  0",
        "EOF"
      )
    )
    expect(parsed.drawing.entities).toHaveLength(1)
    expect(parsed.report.unreadable).toBe(2)
  })

  it("reads a 2018 header with objects that have no subclass markers", () => {
    const parsed = parseDxf(
      dxf(
        "  0",
        "SECTION",
        "  2",
        "HEADER",
        "  9",
        "$ACADVER",
        "  1",
        "AC1032",
        "  0",
        "ENDSEC",
        "  0",
        "SECTION",
        "  2",
        "ENTITIES",
        ...line,
        "  0",
        "ENDSEC",
        "  0",
        "EOF"
      )
    )
    expect(parsed.drawing.entities).toHaveLength(1)
  })

  it("refuses what is no DXF, on the line AutoCAD names", () => {
    expect(() => parseDxf("hello world\nthis is not a dxf")).toThrow(
      new DxfReadError("header", 1)
    )
  })

  it("refuses a file that ends inside a section", () => {
    const bytes = fixture("fixture-2018")
    const cut = bytes.subarray(0, 60000)
    expect(() => parseDxf(cut)).toThrow(DxfReadError)
    try {
      parseDxf(cut)
    } catch (error) {
      expect((error as DxfReadError).kind).toBe("read")
    }
  })
})

describe("parseDxf: text and tables written by other programs", () => {
  it("reads no further than EOF, as AutoCAD opens a file with words past it", () => {
    // ezdxf's R12_with_trash_beyond_EOF.dxf, which AutoCAD 2027's console
    // opens with its one circle.
    const circle = [
      "  0",
      "SECTION",
      "  2",
      "ENTITIES",
      "  0",
      "CIRCLE",
      "  8",
      "0",
      " 10",
      "0.0",
      " 20",
      "0.0",
      " 40",
      "1.5",
      "  0",
      "ENDSEC",
      "  0",
      "EOF",
    ]
    const trash = ["ignore", "invalid", "data", "beyond", "EOF"]
    expect(parseDxf(dxf(...circle, ...trash)).drawing.entities).toHaveLength(1)
    // The same circle as a binary file: a code in two bytes, then a string
    // ended by a zero byte or a double in eight.
    const text = new TextEncoder()
    const group = (code: number, value: string | number): number[] => {
      if (typeof value === "string") return [code, 0, ...text.encode(value), 0]
      const double = new Uint8Array(8)
      new DataView(double.buffer).setFloat64(0, value, true)
      return [code, 0, ...double]
    }
    const binary = new Uint8Array([
      ...text.encode("AutoCAD Binary DXF\r\n\x1a\0"),
      ...group(0, "SECTION"),
      ...group(2, "ENTITIES"),
      ...group(0, "CIRCLE"),
      ...group(8, "0"),
      ...group(10, 0),
      ...group(20, 0),
      ...group(40, 1.5),
      ...group(0, "ENDSEC"),
      ...group(0, "EOF"),
      ...text.encode("ignore invalid data"),
    ])
    expect(parseDxf(binary).drawing.entities).toHaveLength(1)
  })

  it("draws a hatch whose pattern's name carries its style code", () => {
    // AutoCAD 2027 writes old hatches so (five of its sample drawings), as
    // -HATCH takes a pattern's name followed by its style code.
    const hatch = (name: string) => [
      "  0",
      "HATCH",
      "  8",
      "0",
      "  2",
      name,
      " 70",
      "0",
      " 91",
      "1",
      " 92",
      "2",
      " 72",
      "0",
      " 73",
      "1",
      " 93",
      "3",
      " 10",
      "0.0",
      " 20",
      "0.0",
      " 10",
      "10.0",
      " 20",
      "0.0",
      " 10",
      "10.0",
      " 20",
      "10.0",
      " 97",
      "0",
    ]
    const parsed = parseDxf(
      dxf(
        "  0",
        "SECTION",
        "  2",
        "ENTITIES",
        ...hatch("ANSI31,_O"),
        ...hatch("LINE,_I"),
        ...hatch("U,_N"),
        "  0",
        "ENDSEC",
        "  0",
        "EOF"
      )
    )
    expect(
      ofType<HatchEntity>(parsed, "hatch").map((h) => h.patternId)
    ).toEqual(["ANSI31", "LINE", "U"])
  })

  it("decodes the code page $DWGCODEPAGE names", () => {
    const head =
      "  0\r\nSECTION\r\n  2\r\nHEADER\r\n  9\r\n$ACADVER\r\n  1\r\nAC1015\r\n  9\r\n$DWGCODEPAGE\r\n  3\r\nANSI_1251\r\n  0\r\nENDSEC\r\n  0\r\nSECTION\r\n  2\r\nENTITIES\r\n  0\r\nTEXT\r\n  8\r\n0\r\n 10\r\n0.0\r\n 20\r\n0.0\r\n 40\r\n2.5\r\n  1\r\n"
    const tail = "\r\n  0\r\nENDSEC\r\n  0\r\nEOF\r\n"
    // "Привет" in Windows-1251.
    const word = [0xcf, 0xf0, 0xe8, 0xe2, 0xe5, 0xf2]
    const bytes = new Uint8Array([
      ...new TextEncoder().encode(head),
      ...word,
      ...new TextEncoder().encode(tail),
    ])
    const [text] = parseDxf(bytes).drawing.entities as TextEntity[]
    expect(text.value).toBe("Привет")
  })

  it("names a linetype by the six's when it draws their dashes", () => {
    const parsed = parseDxf(
      dxf(
        "  0",
        "SECTION",
        "  2",
        "TABLES",
        "  0",
        "TABLE",
        "  2",
        "LTYPE",
        "  0",
        "LTYPE",
        "  2",
        "TRAZOS",
        " 70",
        "0",
        "  3",
        "Trazos __ __",
        " 72",
        "65",
        " 73",
        "2",
        " 40",
        "19.05",
        " 49",
        "12.7",
        " 74",
        "0",
        " 49",
        "-6.35",
        " 74",
        "0",
        "  0",
        "LTYPE",
        "  2",
        "MINE",
        " 70",
        "0",
        " 72",
        "65",
        " 73",
        "2",
        " 40",
        "3.0",
        " 49",
        "2.0",
        " 49",
        "-1.0",
        "  0",
        "ENDTAB",
        "  0",
        "ENDSEC",
        "  0",
        "SECTION",
        "  2",
        "ENTITIES",
        "  0",
        "LINE",
        "  8",
        "0",
        "  6",
        "TRAZOS",
        " 10",
        "0",
        " 20",
        "0",
        " 11",
        "1",
        " 21",
        "0",
        "  0",
        "LINE",
        "  8",
        "0",
        "  6",
        "MINE",
        " 10",
        "0",
        " 20",
        "0",
        " 11",
        "1",
        " 21",
        "0",
        "  0",
        "LINE",
        "  8",
        "0",
        "  6",
        "BYLAYER",
        " 10",
        "0",
        " 20",
        "0",
        " 11",
        "1",
        " 21",
        "0",
        "  0",
        "ENDSEC",
        "  0",
        "EOF"
      )
    )
    expect(
      (parsed.drawing.entities as LineEntity[]).map((l) => l.linetype)
    ).toEqual(["Dashed", "MINE", undefined])
  })

  it("unescapes \\U+ but not what follows MTEXT's literal backslash", () => {
    expect(unicode("a \\U+03B1 b")).toBe("a α b")
    expect(unicode("\\\\U+03B1")).toBe("\\\\U+03B1")
    expect(unicode("plain")).toBe("plain")
  })
})

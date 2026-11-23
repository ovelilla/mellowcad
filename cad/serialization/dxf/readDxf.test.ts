import { readFileSync } from "node:fs"
import { gunzipSync } from "node:zlib"
import { describe, expect, it } from "vitest"
import type { LeaderEntity } from "../../domain/entities"
import { p } from "../../../test/builders"
import { createHarness } from "../../../test/harness"
import type {
  ArcEntity,
  CircleEntity,
  DimensionEntity,
  EllipseEntity,
  Entity,
  HatchEntity,
  Face3dEntity,
  PolygonMeshEntity,
  InsertEntity,
  LineEntity,
  MTextEntity,
  PointEntity,
  Solid2dEntity,
  Polyline3dEntity,
  PolylineEntity,
  SplineEntity,
  TextEntity,
  WipeoutEntity,
  XlineEntity,
  RayEntity,
  ImageEntity,
} from "../../domain/entities"
import { DxfReadError, ParsedDxf, parseDxf } from "./readDxf"
import { writeDxf } from "./writeDxf"
import { serializeDrawing } from "../drawingFile"
import { dimensionGeometry, dimensionText } from "../../domain/dimensions"
import { unicode } from "./dxfEntities"
import { polygonMeshGrid } from "../../domain/entities"
import type { Vec3 } from "../../geometry/Vec3"

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
    expect(circles[1].color).toBe("30")
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

  // x051, x053: a header's $DIM* that differ from the current style's record
  // are what AutoCAD opens as that style's current overrides (`Current
  // dimension overrides: DIMASZ 5.0000`), the record left as it is. The model
  // has no such overrides (DIMS-D9): the style is its record's.
  it("reads R12's dimension styles from their records, whatever the header's $DIM* say", () => {
    const text = new TextDecoder("latin1").decode(fixture("fixture-R12"))
    const overridden = text.replace(
      /(\$DIMASZ\r?\n *40\r?\n)[^\r\n]+/,
      (_, head: string) => `${head}5.0`
    )
    expect(overridden).toContain("$DIMASZ\r\n 40\r\n5.0\r\n")
    expect(overridden).not.toBe(text)
    const styles = (bytes: Uint8Array) =>
      parseDxf(bytes).drawing.dimStyles.map((s) => [s.name, s.arrowSize])
    expect(styles(new TextEncoder().encode(overridden))).toEqual(
      styles(fixture("fixture-R12"))
    )
  })

  it("lists what the model has no object for, by type, and paper space apart", () => {
    expect([...drawing.report.leftOut]).toEqual([
      ["3DSOLID", 1],
      ["REGION", 1],
    ])
    // Its xline and ray open (xline/x10).
    expect(
      drawing.drawing.entities.filter(
        (e) => e.type === "xline" || e.type === "ray"
      )
    ).toHaveLength(2)
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
      color: "1",
      linetype: "DASHED",
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
      color: "3",
      linetype: "CENTER",
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

  it("opens a MINSERT as one reference with its rows and columns", () => {
    const parts = ofType<InsertEntity>(drawing, "insert").filter(
      (i) => i.blockId === "Part" && i.scaleX > 0 && i.grid
    )
    expect(parts).toHaveLength(1)
    const [minsert] = parts
    expect(minsert.position).toEqual({ x: 400, y: 200 })
    expect(minsert.grid).toEqual({
      columns: 3,
      rows: 2,
      columnSpacing: 20,
      rowSpacing: 30,
    })
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

  it("keeps each linetype of the file under its own name, the six added after", () => {
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
    ).toEqual(["TRAZOS", "MINE", undefined])
    // A Spanish AutoCAD's TRAZOS is its own linetype, with its own dashes.
    expect(parsed.drawing.linetypes.slice(0, 3)).toEqual([
      { name: "TRAZOS", description: "Trazos __ __", pattern: [12.7, -6.35] },
      { name: "MINE", description: "", pattern: [2, -1] },
      // Continuous, which the file lacks, among the six every drawing holds.
      { name: "Continuous", description: "Solid line", pattern: [] },
    ])
    expect(parsed.drawing.linetypes.map((l) => l.name)).toEqual([
      "TRAZOS",
      "MINE",
      "Continuous",
      "DASHED",
      "HIDDEN",
      "CENTER",
      "PHANTOM",
      "DASHDOT",
    ])
  })

  it("unescapes \\U+ but not what follows MTEXT's literal backslash", () => {
    expect(unicode("a \\U+03B1 b")).toBe("a α b")
    expect(unicode("\\\\U+03B1")).toBe("\\\\U+03B1")
    expect(unicode("plain")).toBe("plain")
  })
})

// leader/p22: AutoCAD 2027's DXFOUT of a leader with a hook, one to the left,
// one alone, a spline, one with no arrowhead whose text was moved, one to a
// block reference and one at DIMSCALE 10 (its DSTYLE override).
describe("parseDxf: AutoCAD 2027's leaders (leader/p22)", () => {
  const { drawing, report } = parseDxf(fixture("leaders-2018"))
  const leaders = drawing.entities.filter(
    (e): e is LeaderEntity => e.type === "leader"
  )
  const byId = new Map(drawing.entities.map((e) => [e.id, e]))
  const xy = (l: LeaderEntity) =>
    l.vertices.map((v) => [+v.x.toFixed(9), +v.y.toFixed(9)])

  it("opens every leader, none left out", () => {
    expect(report.leftOut.has("LEADER")).toBe(false)
    expect(leaders).toHaveLength(7)
  })

  it("keeps the vertices, hook, arrowhead and spline as written", () => {
    expect(xy(leaders[0])).toEqual([
      [0, 0],
      [7.5, 10],
      [10, 10],
    ])
    expect(leaders[0].hook).toBe(true)
    expect(leaders[2].annotation).toBeUndefined()
    expect(leaders[3].spline).toBe(true)
    expect(leaders[4].arrow).toBe(false)
    expect(leaders[6].overrides).toEqual({ scale: 10 })
  })

  it("links each to the MTEXT or block reference its 340 names", () => {
    const text = byId.get(leaders[0].annotation!.id)
    expect(text?.type === "mtext" && text.contents).toBe("Hooked")
    expect(leaders[1].annotation?.kind).toBe("mtext")
    const block = byId.get(leaders[5].annotation!.id)
    expect(block?.type).toBe("insert")
    expect(leaders[5].annotation?.kind).toBe("block")
    // 212: the end 5,5 short of the insertion point.
    expect(leaders[5].blockOffset).toBeCloseToPoint({ x: -5, y: -5 })
    // Its end where the text puts it: no offset, as 213 says none.
    expect(leaders[0].textOffset).toBeUndefined()
  })
})

// A leader of AutoCAD's Sheet_Sets_Architectural_S-04 sample (handle 25E11)
// and its text: a mirrored detail's, the leader facing -Z, its Top Right MTEXT
// +Z and after its end, 39 such in the samples (leader/p25).
const MIRRORED_LEADER = dxf(
  ...["  0", "SECTION", "  2", "ENTITIES"],
  ...["  0", "LEADER", "  5", "25E11", "100", "AcDbEntity", "  8", "0"],
  ...["100", "AcDbLeader", " 73", "     0", " 40", "3.0"],
  ...[" 41", "9.035714285714277", " 76", "     3"],
  ...[" 10", "8968.735423327149", " 20", "2964.111485398453", " 30", "0.0"],
  ...[" 10", "8976.262337993395", " 20", "2956.58457073221", " 30", "0.0"],
  ...[" 10", "8982.412921497695", " 20", "2956.58457073221", " 30", "0.0"],
  ...["340", "25E12", "210", "0.0", "220", "0.0", "230", "-1.0"],
  ...["213", "-9.035714285714286", "223", "-1.5", "233", "0.0"],
  ...["1001", "ACAD", "1000", "DSTYLE", "1002", "{"],
  ...["1070", "   147", "1040", "0.0625", "1070", "    77", "1070", "     0"],
  ...["1002", "}"],
  ...["  0", "MTEXT", "  5", "25E12", "100", "AcDbEntity", "  8", "0"],
  ...["100", "AcDbMText", " 10", "8991.511135783406"],
  ...[" 20", "2958.08457073221", " 30", "0.0", " 40", "3.0", " 41", "0.0"],
  ...[" 71", "     3", " 72", "     1", "  1", "C-1", " 73", "     1"],
  ...["  0", "ENDSEC", "  0", "EOF"]
)

describe("parseDxf: a leader facing -Z with its text facing +Z (leader/p25)", () => {
  const parsed = parseDxf(MIRRORED_LEADER)
  const [leader] = ofType<LeaderEntity>(parsed, "leader")
  const [text] = ofType<MTextEntity>(parsed, "mtext")

  it("reads it in its text's frame, the WCS, linked to it", () => {
    expect(leader.normal).toBeUndefined()
    expect(leader.vertices[2]).toBeCloseToPoint({
      x: 8982.412921497695,
      y: 2956.58457073221,
    })
    expect(leader.horizontal).toBeUndefined()
    expect(leader.annotation).toEqual({ kind: "mtext", id: text.id })
  })

  it("reads the offset AutoCAD wrote, from its Top Right text's corner", () => {
    expect(text.attachment).toBe("tr")
    expect(leader.textOffset).toBeCloseToPoint({
      x: -9.035714285714286,
      y: -1.5,
    })
  })

  it("follows the text moved as AutoCAD does: the end by as much, the text still Top Right", () => {
    const cad = createHarness({ entities: parsed.drawing.entities })
    cad.select(text.id).command("MOVE").type("0,0").enter()
    cad.type("10,0").enter()
    const moved = cad.runtime.document.get(leader.id) as LeaderEntity
    expect(moved.vertices[2]).toBeCloseToPoint({
      x: 8992.412921497695,
      y: 2956.58457073221,
    })
    const after = cad.runtime.document.get(text.id) as MTextEntity
    expect(after.attachment).toBe("tr")
  })

  it("keeps one facing -Z as it faces with no text to read it by", () => {
    const alone = parseDxf(MIRRORED_LEADER.replace("340\n25E12\n", ""))
    const [read] = ofType<LeaderEntity>(alone, "leader")
    expect(read.annotation).toBeUndefined()
    expect(read.normal).toEqual({ x: 0, y: 0, z: -1 })
    expect(read.vertices[2]).toBeCloseToPoint({
      x: -8982.412921497695,
      y: 2956.58457073221,
    })
  })
})

describe("parseDxf: AutoCAD 2027's gradients (gradient/g16)", () => {
  // The nine names centred at 0°, LINEAR and SPHERICAL at 30° not centred,
  // and a one-colour RGB 200,100,50 CURVED at tint 0.25 and 45°, each in a
  // 100 × 50 rectangle, as AutoCAD's DXFOUT wrote them.
  const { drawing, report } = parseDxf(fixture("gradients-2018"))
  const hatches = drawing.entities.filter(
    (e): e is HatchEntity => e.type === "hatch"
  )

  it("opens every gradient, none left out", () => {
    expect(report.leftOut.size).toBe(0)
    expect(hatches).toHaveLength(12)
    for (const hatch of hatches) expect(hatch.patternId).toBe("SOLID")
  })

  it("keeps each name, colour pair, angle and shift as written", () => {
    expect(hatches.map((h) => h.gradient?.name).sort()).toEqual(
      [
        "LINEAR",
        "CYLINDER",
        "INVCYLINDER",
        "SPHERICAL",
        "HEMISPHERICAL",
        "CURVED",
        "INVSPHERICAL",
        "INVHEMISPHERICAL",
        "INVCURVED",
        "LINEAR",
        "SPHERICAL",
        "CURVED",
      ].sort()
    )
    const shifted = hatches.filter((h) => h.gradient && !h.gradient.centered)
    expect(shifted.map((h) => h.gradient?.name).sort()).toEqual([
      "LINEAR",
      "SPHERICAL",
    ])
    for (const h of shifted) {
      expect(h.gradient?.angle).toBeCloseTo(Math.PI / 6, 6)
      expect(h.gradient?.colors).toEqual(["#0000ff", "#ffff00"])
    }
  })

  it("keeps a one-colour gradient's tint and the shade AutoCAD wrote", () => {
    const one = hatches.find((h) => h.gradient?.tint !== undefined)
    expect(one?.gradient).toMatchObject({
      name: "CURVED",
      tint: 0.25,
      centered: true,
    })
    expect(one?.gradient?.colors[0]).toBe("#c86432")
    expect(one?.gradient?.angle).toBeCloseTo(Math.PI / 4, 6)
  })
})

describe("parseDxf: an invisible object (60 1)", () => {
  it("opens none, as AutoCAD draws none, and counts nothing left out", () => {
    const text = [
      "0",
      "SECTION",
      "2",
      "ENTITIES",
      "0",
      "LINE",
      "8",
      "0",
      "60",
      "1",
      "10",
      "0",
      "20",
      "0",
      "11",
      "1",
      "21",
      "0",
      "0",
      "LINE",
      "8",
      "0",
      "10",
      "0",
      "20",
      "0",
      "11",
      "2",
      "21",
      "0",
      "0",
      "ENDSEC",
      "0",
      "EOF",
    ].join("\n")
    const { drawing, report } = parseDxf(text)
    expect(drawing.entities).toHaveLength(1)
    expect((drawing.entities[0] as LineEntity).end.x).toBe(2)
    expect(report.leftOut.size).toBe(0)
    expect(report.unreadable).toBe(0)
  })
})

describe("parseDxf: AutoCAD 2027's xlines and rays (xline/x10)", () => {
  // A horizontal xline, one at 30°, one rising at 45°, a ray, a red DASHED
  // ray on layer CONS and an xline drawn in a UCS turned 45°, as AutoCAD's
  // DXFOUT wrote them: base point and unit direction in the WCS.
  const { drawing, report } = parseDxf(fixture("xlines-2018"))
  const infinite = drawing.entities.filter(
    (e): e is XlineEntity | RayEntity => e.type === "xline" || e.type === "ray"
  )
  const round = (v: number) => Math.round(v * 1e6) / 1e6
  const placed = (e: XlineEntity | RayEntity) => [
    e.type,
    round(e.base.x),
    round(e.base.y),
    round(e.elevation ?? 0),
    round(e.direction.x),
    round(e.direction.y),
    round(e.directionZ ?? 0),
  ]

  it("opens every xline and ray, none left out", () => {
    expect(report.leftOut.size).toBe(0)
    expect(report.unreadable).toBe(0)
    expect(infinite.map(placed)).toEqual([
      ["xline", 0, 0, 0, 1, 0, 0],
      ["xline", 10, 10, 0, round(Math.sqrt(3) / 2), 0.5, 0],
      ["xline", 0, 0, 0, round(Math.SQRT1_2), 0, round(Math.SQRT1_2)],
      ["ray", 50, 20, 0, round(Math.SQRT1_2), round(Math.SQRT1_2), 0],
      ["ray", 100, 0, 0, 0, -1, 0],
      [
        "xline",
        round(-50 * Math.SQRT1_2),
        round(50 * Math.SQRT1_2),
        0,
        round(Math.SQRT1_2),
        round(Math.SQRT1_2),
        0,
      ],
    ])
  })

  it("keeps the red DASHED ray's properties", () => {
    const red = infinite[4]
    expect(red.color).toBe("1")
    expect(red.linetype).toBe("DASHED")
  })
})

describe("parseDxf: AutoCAD 2027's wipeouts (wipeout/w15)", () => {
  // A rectangle, a closed triangle, a rectangle turned 30° by ROTATE, a red
  // DASHED pentagon, one of a polyline at elevation 7 and one drawn in a
  // UCS turned about X, with WIPEOUTFRAME 2, as AutoCAD's DXFOUT wrote them.
  const { drawing, report } = parseDxf(fixture("wipeouts-2018"))
  const wipeouts = drawing.entities.filter(
    (e): e is WipeoutEntity => e.type === "wipeout"
  )
  const xy = (w: WipeoutEntity) =>
    w.vertices.map((v) => [
      Math.round(v.x * 1e6) / 1e6,
      Math.round(v.y * 1e6) / 1e6,
    ])

  it("opens every wipeout, none left out, and WIPEOUTFRAME", () => {
    expect(report.leftOut.size).toBe(0)
    expect(wipeouts).toHaveLength(6)
    expect(drawing.settings.wipeoutFrame).toBe(2)
  })

  it("turns the clipped pixel into its vertices, the closing one dropped", () => {
    expect(xy(wipeouts[0])).toEqual([
      [0, 0],
      [100, 0],
      [100, 50],
      [0, 50],
    ])
    expect(xy(wipeouts[1])).toEqual([
      [150, 0],
      [250, 0],
      [200, 60],
    ])
    const turned = (x: number, y: number) => {
      const c = Math.cos(Math.PI / 6)
      const s = Math.sin(Math.PI / 6)
      return [
        Math.round((300 + x * c - y * s) * 1e6) / 1e6,
        Math.round((x * s + y * c) * 1e6) / 1e6,
      ]
    }
    expect(xy(wipeouts[2])).toEqual([
      turned(0, 0),
      turned(100, 0),
      turned(100, 40),
      turned(0, 40),
    ])
  })

  it("keeps its plane, colour and linetype", () => {
    expect(wipeouts[3]).toMatchObject({ color: "1" })
    expect(wipeouts[3].linetype).toBeDefined()
    expect(wipeouts[4].elevation).toBe(7)
    expect(wipeouts[5].normal).toBeDefined()
  })
})

describe("parseDxf: AutoCAD 2027's images (image/i13)", () => {
  // Two 40×20 BMPs' and one 20×40 one's images, as AutoCAD's DXFOUT wrote
  // them: pic at 0,0 by 3, a copy at 100,0, one mirrored about X 160, a
  // red DASHED tall one at 300,0 by 2, pic by 1.5 clipped to a triangle, and
  // one drawn in a UCS turned 90° about X, with IMAGEFRAME 2 (the paths made
  // C:\maps\…).
  const { drawing, report } = parseDxf(fixture("images-2018"))
  const images = drawing.entities.filter(
    (e): e is ImageEntity => e.type === "image"
  )
  const round = (v: number) => Math.round(v * 1e6) / 1e6
  const at = (i: ImageEntity) => [round(i.position.x), round(i.position.y)]

  it("opens every image, none left out, and IMAGEFRAME", () => {
    expect(report.leftOut.size).toBe(0)
    expect(report.unreadable).toBe(0)
    expect(images).toHaveLength(6)
    expect(drawing.settings.imageFrame).toBe(2)
  })

  it("names each by its definition, with its path and pixel size", () => {
    expect(images[0].image).toEqual({
      name: "pic",
      path: "C:\\maps\\pic.bmp",
      pixelSize: 0.3527336860670194,
      units: 2,
    })
    expect(images[3].image.name).toBe("tall")
    expect([images[3].width, images[3].height]).toEqual([20, 40])
  })

  it("keeps the corner and the pixel's sides, a mirrored one's turning back", () => {
    expect(at(images[0])).toEqual([0, 0])
    expect(round(images[0].u.x)).toBe(1.058201)
    expect(at(images[2])).toEqual([220, 0])
    expect(round(images[2].u.x)).toBe(-1.058201)
    expect(round(images[2].v.y)).toBe(1.058201)
  })

  it("keeps a polygonal clip, its closing vertex dropped, and no whole one", () => {
    expect(images[0].clip).toBeUndefined()
    expect(images[4].clip?.polygonal).toBe(true)
    expect(images[4].clip?.points.map((q) => [round(q.x), round(q.y)])).toEqual(
      [
        [8.95, 10.05],
        [39.5, 10.05],
        [27.85, -0.5],
      ]
    )
  })

  it("keeps its plane, colour and linetype", () => {
    expect(images[3]).toMatchObject({ color: "1" })
    expect(images[3].linetype).toBeDefined()
    expect(images[5].normal).toBeDefined()
  })

  // The LibreCAD part (other programs') has no ACAD_IMAGE_DICT name in reach
  // of its definition: named after its file, as -IMAGE Attach names one.
  it("names a definition no dictionary names after its file", () => {
    const file = dxf(
      "0",
      "SECTION",
      "2",
      "ENTITIES",
      "0",
      "IMAGE",
      "5",
      "107",
      "8",
      "0",
      "10",
      "1",
      "20",
      "2",
      "30",
      "0",
      "11",
      "2",
      "21",
      "0",
      "31",
      "0",
      "12",
      "0",
      "22",
      "2",
      "32",
      "0",
      "13",
      "8",
      "23",
      "4",
      "340",
      "105",
      "70",
      "1",
      "0",
      "ENDSEC",
      "0",
      "SECTION",
      "2",
      "OBJECTS",
      "0",
      "IMAGEDEF",
      "5",
      "105",
      "1",
      "I:\\SHARED\\COLEG.BMP",
      "10",
      "8",
      "20",
      "4",
      "11",
      "1",
      "21",
      "1",
      "0",
      "ENDSEC",
      "0",
      "EOF"
    )
    const [image] = parseDxf(file).drawing.entities as ImageEntity[]
    expect(image.image).toMatchObject({
      name: "COLEG",
      path: "I:\\SHARED\\COLEG.BMP",
    })
    expect(image.display).toBe(1)
    expect(image.clip).toBeUndefined()
  })
})

describe("parseDxf: AutoCAD 2027's 3D faces (face3d/f09)", () => {
  // A flat quad, a triangle, a chained pair with hidden edges, a tilted quad
  // and a red DASHED one, as AutoCAD's DXFOUT wrote them.
  const { drawing, report } = parseDxf(fixture("faces-2018"))
  const faces = drawing.entities.filter(
    (e): e is Face3dEntity => e.type === "face3d"
  )
  const xyz = (f: Face3dEntity) => f.corners.map((c) => [c.x, c.y, c.z])

  it("opens every face, none left out", () => {
    expect(report.leftOut.size).toBe(0)
    expect(faces).toHaveLength(6)
  })

  it("keeps the corners in the WCS, a triangle's fourth its third", () => {
    expect(xyz(faces[1])).toEqual([
      [150, 0, 0],
      [250, 0, 0],
      [200, 50, 0],
      [200, 50, 0],
    ])
    expect(xyz(faces[4])).toEqual([
      [300, 0, 0],
      [400, 0, 0],
      [400, 50, 40],
      [300, 50, 40],
    ])
  })

  it("keeps the hidden edges (70) and the object's colour and linetype", () => {
    expect(faces.map((f) => f.invisibleEdges ?? 0)).toEqual([0, 0, 4, 9, 0, 0])
    expect(faces[5]).toMatchObject({ color: "1", linetypeScale: 2 })
    expect(faces[5].linetype).toBeDefined()
  })
})

describe("parseDxf: AutoCAD 2027's polygon meshes (mesh/f01)", () => {
  // A 3 × 4 rising one a vertex; a 4 × 4 closed in M and N; a cubic 4 × 4
  // at SURFU 4, SURFV 3; a quadratic 4 × 5 closed in N; a Bezier 4 × 4; a
  // red DASHED 2 × 3. As DXFOUT wrote them: POLYLINE 70 16 (+1, +32, +4),
  // each VERTEX 64, a smoothed one's control vertices 80 and fitted ones 72.
  const bytes = fixture("meshes-2018")
  const { drawing, report } = parseDxf(bytes)
  const meshes = drawing.entities.filter(
    (e): e is PolygonMeshEntity => e.type === "polygonMesh"
  )

  /** Each POLYLINE's fitted vertices, as AutoCAD wrote them. */
  const written = (): Vec3[][] => {
    const lines = new TextDecoder().decode(bytes).split(/\r?\n/)
    const out: Vec3[][] = []
    let vertex: { x: number; y: number; z: number; flags: number } | null = null
    const close = () => {
      if (vertex && vertex.flags & 8) out[out.length - 1].push(vertex)
      vertex = null
    }
    for (let i = 0; i + 1 < lines.length; i += 2) {
      const code = lines[i].trim()
      const value = lines[i + 1].trim()
      if (code === "0") {
        close()
        if (value === "POLYLINE") out.push([])
        if (value === "VERTEX") vertex = { x: 0, y: 0, z: 0, flags: 0 }
        continue
      }
      if (!vertex) continue
      if (code === "10") vertex.x = Number(value)
      if (code === "20") vertex.y = Number(value)
      if (code === "30") vertex.z = Number(value)
      if (code === "70") vertex.flags = Number(value)
    }
    return out
  }

  it("opens each, none left out", () => {
    expect(report.leftOut.size).toBe(0)
    expect(report.unreadable).toBe(0)
    expect(
      meshes.map((m) => [m.m, m.n, m.closedM, m.closedN, m.smooth ?? null])
    ).toEqual([
      [3, 4, false, false, null],
      [4, 4, true, true, null],
      [4, 4, false, false, { kind: 6, mDensity: 5, nDensity: 4 }],
      [4, 5, false, true, { kind: 5, mDensity: 5, nDensity: 3 }],
      [4, 4, false, false, { kind: 8, mDensity: 5, nDensity: 4 }],
      [2, 3, false, false, null],
    ])
    expect(meshes[0].vertices[11]).toEqual({ x: 30, y: 20, z: 11 })
    expect(meshes[5]).toMatchObject({ color: "1", linetypeScale: 2 })
    expect(meshes[5].linetype).toBeDefined()
  })

  it("fits each smoothed one where AutoCAD did, its Bezier and closed quadratic too", () => {
    const fitted = written()
    for (const k of [2, 3, 4]) {
      const ours = polygonMeshGrid(meshes[k]).points
      expect(ours).toHaveLength(fitted[k].length)
      ours.forEach((point, i) => {
        const theirs = fitted[k][i]
        expect(point.x).toBeCloseTo(theirs.x, 9)
        expect(point.y).toBeCloseTo(theirs.y, 9)
        expect(point.z).toBeCloseTo(theirs.z, 9)
      })
    }
  })
})

describe("parseDxf: AutoCAD 2027's MINSERTs (minsert/m09)", () => {
  // 3 × 2 of B1 with its attribute; 2 × 3 of B2 at X 2, Y 3, 30°, its cell
  // (−7, 12); a column of 3 and a row of 3; 2 × 2 at no spacing, mirrored;
  // 2 × 2 drawn in a UCS turned 45° on layer GRID. As DXFOUT wrote them:
  // AcDbMInsertBlock, 70 and 71 always, 44 and 45 when not 0.
  const { drawing, report } = parseDxf(fixture("minserts-2018"))
  const minserts = drawing.entities.filter(
    (e): e is InsertEntity => e.type === "insert"
  )

  it("opens each as one reference with its rows and columns", () => {
    expect(report.leftOut.size).toBe(0)
    expect(report.unreadable).toBe(0)
    expect(minserts.map((m) => [m.blockId, m.grid])).toEqual([
      ["B1", { columns: 3, rows: 2, columnSpacing: 20, rowSpacing: 10 }],
      ["B2", { columns: 2, rows: 3, columnSpacing: -7, rowSpacing: 12 }],
      ["B2", { columns: 1, rows: 3, columnSpacing: 0, rowSpacing: 6 }],
      ["B2", { columns: 3, rows: 1, columnSpacing: -5, rowSpacing: 0 }],
      ["B1", { columns: 2, rows: 2, columnSpacing: 0, rowSpacing: 0 }],
      ["B2", { columns: 2, rows: 2, columnSpacing: 9, rowSpacing: 8 }],
    ])
    expect(minserts[0].attributes?.[0].value).toBe("VAL")
    expect(minserts[1]).toMatchObject({ scaleX: 2, scaleY: 3 })
    expect(minserts[1].rotation).toBeCloseTo(Math.PI / 6, 12)
    expect(minserts[4].scaleX).toBe(-1)
    expect(minserts[5].rotation).toBeCloseTo(Math.PI / 4, 12)
  })
})

describe("parseDxf: AutoCAD 2027's dimension style overrides (colors/s01)", () => {
  const drawing = open("dstyle-2018")
  const dims = ofType<DimensionEntity>(drawing, "dimension")

  it("keeps what each dimension overrides of its style, the variables it has", () => {
    expect(dims[0].overrides).toBeUndefined()
    // DIMCLRD (176) is not modelled: dropped.
    expect(dims[1].overrides).toEqual({
      scale: 2,
      arrowSize: 3,
      extensionOffset: 2,
      baselineSpacing: 7,
      extensionBeyond: 4,
      suppressTrailingZeros: false,
      textHeight: 5,
      textGap: 1.5,
      forceLineInside: false,
      decimals: 1,
      decimalSeparator: ".",
    })
    expect(dims[2].overrides).toEqual({ centerMark: 5, angleDecimals: 2 })
  })

  it("draws a dimension with its overrides, and LIST writes them as AutoCAD's", () => {
    const cad = createHarness()
    cad.runtime.loadDrawing(serializeDrawing(drawing.drawing))
    const [plain, overridden] = cad.runtime.document
      .getEntities()
      .filter((e): e is DimensionEntity => e.type === "dimension")
    const style = cad.runtime.document.getDimStyle(plain.styleId)
    // DIMTXT 5 × DIMSCALE 2, DIMDEC 1 with DIMZIN 0 and a point.
    expect(dimensionGeometry(overridden, style).textHeight).toBe(10)
    expect(dimensionText(overridden, style)).toBe("100.0")
    expect(dimensionText(plain, style)).toBe("100")
    cad.select(overridden.id).command("LIST")
    const log = cad.commandLog().flatMap((entry) => entry.split("\n"))
    const from = log.indexOf("dimension style overrides:")
    expect(log.slice(from, from + 13)).toEqual([
      "dimension style overrides:",
      " DIMASZ      3.0000",
      " DIMDEC      1",
      " DIMDLI      7.0000",
      " DIMDSEP     .",
      " DIMEXE      4.0000",
      " DIMEXO      2.0000",
      " DIMGAP      1.5000",
      " DIMSCALE    2.0000",
      " DIMTOFL     Off",
      " DIMTXT      5.0000",
      " DIMZIN      0",
      "Annotative: No",
    ])
  })

  it("writes them back as AutoCAD's DSTYLE, by group", () => {
    const text = new TextDecoder().decode(
      writeDxf(drawing.drawing, {
        version: "2018",
        binary: false,
        precision: 16,
      }).bytes
    )
    expect(text).toContain(
      [
        "1000",
        "DSTYLE",
        "1002",
        "{",
        "1070",
        "    40",
        "1040",
        "2.0",
        "1070",
        "    41",
        "1040",
        "3.0",
        "1070",
        "    42",
        "1040",
        "2.0",
        "1070",
        "    43",
        "1040",
        "7.0",
        "1070",
        "    44",
        "1040",
        "4.0",
        "1070",
        "    78",
        "1070",
        "     0",
        "1070",
        "   140",
        "1040",
        "5.0",
        "1070",
        "   147",
        "1040",
        "1.5",
        "1070",
        "   172",
        "1070",
        "     0",
        "1070",
        "   271",
        "1070",
        "     1",
        "1070",
        "   278",
        "1070",
        "    46",
        "1002",
        "}",
      ].join("\r\n")
    )
    const back = ofType<DimensionEntity>(
      parseDxf(
        writeDxf(drawing.drawing, {
          version: "2000",
          binary: true,
          precision: 16,
        }).bytes
      ),
      "dimension"
    )
    expect(back.map((d) => d.overrides)).toEqual(dims.map((d) => d.overrides))
  })
})

describe("parseDxf: AutoCAD 2027's index and true colours (colors/c02)", () => {
  const drawing = open("colors-2018")
  const lines = ofType<LineEntity>(drawing, "line")

  it("keeps an index colour as one and a true colour as one, though its RGB is an index's", () => {
    // 62 30; 62 1 + 420 255,0,0; 62 30 + 420; 62 10; 62 1; 62 8 + 420; 62 0.
    expect(lines.map((line) => line.color)).toEqual([
      "30",
      "#ff0000",
      "#ff7f00",
      "10",
      "1",
      "#808080",
      undefined,
    ])
  })

  it("keeps each layer's index or true colour", () => {
    const colors = Object.fromEntries(
      drawing.drawing.layers.map((layer) => [layer.name, layer.color])
    )
    expect(colors).toMatchObject({
      "0": "7",
      L30: "30",
      LT: "#0a141e",
      L10: "10",
      L255: "255",
    })
  })

  it("writes them back as AutoCAD wrote them, the index alone or beside the true colour", () => {
    const text = new TextDecoder().decode(
      writeDxf(drawing.drawing, {
        version: "2018",
        binary: false,
        precision: 16,
      }).bytes
    )
    const groups = (record: string) =>
      [...record.matchAll(/^ *(62|420)\r\n *(-?\d+)\r$/gm)].map(
        ([, code, value]) => `${code}=${value}`
      )
    const records = text.split("\r\n  0\r\n")
    const ofKind = (kind: string) =>
      records.filter((record) => record.startsWith(`${kind}\r\n`)).map(groups)
    expect(ofKind("LINE")).toEqual([
      ["62=30"],
      ["62=1", "420=16711680"],
      ["62=30", "420=16744192"],
      ["62=10"],
      ["62=1"],
      ["62=8", "420=8421504"],
      [],
    ])
    expect(ofKind("LAYER")).toEqual(
      expect.arrayContaining([
        ["62=30"],
        ["62=168", "420=660510"],
        ["62=10"],
        ["62=255"],
      ])
    )
  })
})

describe("parseDxf: AutoCAD 2027's named UCSs (dxf/x023)", () => {
  // ALPHA saved at 5,5, beta turned 30° about Z from it, ALPHA restored and
  // UCSICON OFF, as AutoCAD's DXFOUT wrote them: the UCS table, $UCSNAME and
  // the active viewport's 74.
  const { settings } = parseDxf(fixture("ucs-2018")).drawing

  it("opens the UCS table, the current UCS named, the icon off", () => {
    expect(
      settings.namedUcs.map(({ name, ucs }) => [name, ucs.origin])
    ).toEqual([
      ["ALPHA", { x: 5, y: 5, z: 0 }],
      ["beta", { x: 5, y: 5, z: 0 }],
    ])
    const beta = settings.namedUcs[1].ucs
    expect(beta.xAxis.x).toBeCloseTo(Math.sqrt(3) / 2, 12)
    expect(beta.xAxis.y).toBeCloseTo(0.5, 12)
    expect(beta.yAxis.x).toBeCloseTo(-0.5, 12)
    expect(settings.ucsName).toBe("ALPHA")
    expect(settings.ucs.origin).toEqual({ x: 5, y: 5, z: 0 })
    expect(settings.ucsIcon).toEqual({ visible: false, atOrigin: true })
  })
})

import { describe, expect, it } from "vitest"
import type {
  ArcEntity,
  AttributeDefinitionEntity,
  DimensionEntity,
  Entity,
  HatchEntity,
  InsertEntity,
  LineEntity,
  MTextEntity,
  Polyline3dEntity,
  PolylineEntity,
  SplineEntity,
  TextEntity,
} from "../../domain/entities"
import { DxfReadError, ParsedDxf, parseDxf } from "./readDxf"
import { looksLikeDxf } from "./dxfFormat"

// Each kind of record the reader takes, written by hand to the DXF
// reference's group codes: what each group becomes, and what its absence
// does. AutoCAD's own files of the same objects are readDxf.test.ts's.

type Group = readonly [number, string | number]

function record(type: string, ...groups: Group[]): Group[] {
  return [[0, type], ...groups]
}

function file(sections: Record<string, Group[]>): string {
  const lines: string[] = []
  for (const [name, groups] of Object.entries(sections)) {
    lines.push("0", "SECTION", "2", name)
    for (const [code, value] of groups) lines.push(String(code), String(value))
    lines.push("0", "ENDSEC")
  }
  lines.push("0", "EOF")
  return lines.join("\n")
}

const read = (...records: Group[][]): ParsedDxf =>
  parseDxf(file({ ENTITIES: records.flat() }))

function only<T extends Entity>(parsed: ParsedDxf): T {
  expect(parsed.drawing.entities).toHaveLength(1)
  return parsed.drawing.entities[0] as T
}

const at = (code: number, x: number, y: number, z?: number): Group[] => [
  [code, x],
  [code + 10, y],
  ...(z === undefined ? [] : ([[code + 20, z]] as Group[])),
]

describe("what the model has no object for", () => {
  it("counts a mesh as a POLYLINE left out", () => {
    const parsed = read(
      record("POLYLINE", [70, 64]),
      record("VERTEX", ...at(10, 0, 0)),
      record("SEQEND"),
      record("POLYLINE", [70, 16]),
      record("SEQEND")
    )
    expect([...parsed.report.leftOut]).toEqual([["POLYLINE", 2]])
  })

  it("counts a gradient as a HATCH left out", () => {
    const parsed = read(record("HATCH", [450, 1], [91, 0]))
    expect([...parsed.report.leftOut]).toEqual([["HATCH", 1]])
  })

  it("counts a reference to an external drawing as XREF", () => {
    const parsed = parseDxf(
      file({
        BLOCKS: [
          ...record("BLOCK", [2, "Site"], [70, 4], ...at(10, 0, 0)),
          ...record("ENDBLK"),
        ],
        ENTITIES: record("INSERT", [2, "SITE"], ...at(10, 0, 0)),
      })
    )
    expect([...parsed.report.leftOut]).toEqual([["XREF", 1]])
    expect(parsed.drawing.blocks).toEqual([])
  })

  it("counts what it cannot make of a known type", () => {
    const parsed = read(
      record("CIRCLE", ...at(10, 0, 0)),
      record("ARC", ...at(10, 0, 0), [40, -1]),
      record("ELLIPSE", ...at(10, 0, 0), ...at(11, 1, 0)),
      record("LWPOLYLINE", [90, 1], ...at(10, 0, 0)),
      record("POLYLINE", [70, 0]),
      record("VERTEX", ...at(10, 0, 0)),
      record("SEQEND"),
      record("POLYLINE", [70, 8]),
      record("SEQEND"),
      record("SPLINE", [71, 3], ...at(10, 0, 0)),
      record("TEXT", [1, "no point"]),
      record("MTEXT", [1, "no point"]),
      record("ATTDEF", ...at(10, 0, 0)),
      record("INSERT", [2, "Nowhere"], ...at(10, 0, 0)),
      record("DIMENSION", [70, 0], ...at(10, 0, 0)),
      record(
        "DIMENSION",
        [70, 5],
        ...at(10, 0, 0),
        ...at(13, 1, 0),
        ...at(14, 0, 1)
      ),
      record("DIMENSION", [70, 4], ...at(10, 0, 0)),
      record("HATCH", [70, 1])
    )
    expect(parsed.drawing.entities).toEqual([])
    expect(parsed.report.unreadable).toBe(15)
  })
})

describe("each object's groups", () => {
  it("reads an arc with no angles as a whole turn, and colours and lineweights", () => {
    const parsed = read(
      record("ARC", ...at(10, 1, 2, 3), [40, 5], [420, 0x102030], [370, 211]),
      record(
        "LINE",
        ...at(10, 0, 0),
        ...at(11, 1, 1),
        [62, 0],
        [370, -3],
        [39, 2],
        ...at(210, 1, 0, 0)
      ),
      record("LINE", ...at(10, 0, 0), ...at(11, 1, 1), [62, 256], [370, -2]),
      record("LINE", ...at(10, 0, 0), ...at(11, 1, 1), [370, -9])
    )
    const [arc, byBlock, byLayer, odd] = parsed.drawing.entities
    expect(arc).toMatchObject({
      elevation: 3,
      color: "#102030",
      lineweight: 2.11,
    })
    expect((arc as ArcEntity).startAngle).toBe(0)
    expect(byBlock).toMatchObject({ lineweight: 0.25, thickness: 2 })
    expect(byBlock.color).toBeUndefined()
    expect((byBlock as LineEntity).normal).toEqual({ x: 1, y: 0, z: 0 })
    expect(byLayer.color).toBeUndefined()
    expect(byLayer.lineweight).toBeUndefined()
    expect(odd.lineweight).toBeUndefined()
  })

  it("reads a light polyline's constant width, Ltype gen, elevation and plane", () => {
    const poly = only<PolylineEntity>(
      read(
        record(
          "LWPOLYLINE",
          [90, 3],
          [70, 129],
          [43, 0.5],
          [38, 4],
          [39, 1],
          ...at(10, 0, 0),
          ...at(10, 10, 0),
          [42, 1],
          ...at(10, 10, 10),
          ...at(210, 0, 0, -1)
        )
      )
    )
    expect(poly).toMatchObject({
      closed: true,
      linetypeGeneration: true,
      elevation: 4,
      thickness: 1,
      widths: [
        [0.5, 0.5],
        [0.5, 0.5],
        [0.5, 0.5],
      ],
      bulges: [0, 1, 0],
    })
    expect(poly.normal).toEqual({ x: 0, y: 0, z: -1 })
  })

  it("reads a curve-fit polyline's tangents and a closed quadratic spline fit", () => {
    const parsed = read(
      record("POLYLINE", [70, 2], [40, 1], [41, 2], ...at(10, 0, 0, 5)),
      record("VERTEX", ...at(10, 0, 0), [70, 2], [50, 90]),
      record("VERTEX", ...at(10, 5, 5), [70, 1], [42, 0.2]),
      record("VERTEX", ...at(10, 10, 0)),
      record("SEQEND"),
      record("POLYLINE", [70, 133], [75, 5]),
      record("VERTEX", ...at(10, 0, 0), [70, 16]),
      record("VERTEX", ...at(10, 10, 0), [70, 16]),
      record("VERTEX", ...at(10, 10, 10), [70, 16]),
      ...[0, 1, 2, 3, 4, 5].map((i) =>
        record("VERTEX", ...at(10, i, i), [70, 8], [42, 0.1])
      ),
      record("SEQEND"),
      record("POLYLINE", [70, 4], [75, 6]),
      record("VERTEX", ...at(10, 0, 0), [70, 16]),
      record("VERTEX", ...at(10, 10, 0), [70, 16]),
      record("VERTEX", ...at(10, 20, 0), [70, 16]),
      record("VERTEX", ...at(10, 30, 0), [70, 16]),
      record("VERTEX", ...at(10, 1, 1), [70, 8]),
      record("SEQEND")
    )
    const [curve, closed, odd] = parsed.drawing.entities as PolylineEntity[]
    expect(curve.elevation).toBe(5)
    expect(curve.fit).toEqual({
      kind: "curve",
      arcs: [{ joint: { x: 5, y: 5 }, bulges: [0, 0.2] }],
      tangents: [Math.PI / 2, null],
    })
    expect(curve.widths).toEqual([[1, 2]])
    expect(closed.fit).toEqual({ kind: "quadratic", segments: -2 })
    expect(closed.linetypeGeneration).toBe(true)
    // Nine vertices of curve for one cubic span is no whole SPLINESEGS: the header's.
    expect(odd.fit).toEqual({ kind: "cubic", segments: 8 })
  })

  it("reads a 3D polyline fitted to a spline", () => {
    const poly = only<Polyline3dEntity>(
      read(
        record("POLYLINE", [70, 13], [75, 5]),
        record("VERTEX", ...at(10, 0, 0, 1), [70, 48]),
        record("VERTEX", ...at(10, 10, 0, 2), [70, 48]),
        record("VERTEX", ...at(10, 10, 10, 3), [70, 48]),
        record("VERTEX", ...at(10, 1, 1, 1), [70, 40]),
        record("SEQEND")
      )
    )
    expect(poly).toMatchObject({
      closed: true,
      fit: { kind: "quadratic", segments: 8 },
    })
    expect(poly.vertices.map((v) => v.z)).toEqual([1, 2, 3])
  })

  it("reads a fit spline's knot spacing from its flags or its knots, and its own knots", () => {
    const fits = [...at(11, 0, 0, 0), ...at(11, 10, 10, 0), ...at(11, 20, 0, 0)]
    const parsed = read(
      record("SPLINE", [70, 1096], [71, 3], ...fits),
      record("SPLINE", [70, 1160], [71, 3], ...fits),
      record(
        "SPLINE",
        [70, 8],
        [71, 3],
        ...[0, 0, 0, 0, 1, 2, 2, 2, 2].map((k): Group => [40, k]),
        ...fits
      ),
      record(
        "SPLINE",
        [70, 8],
        [71, 3],
        ...[0, 0, 0, 0, 3, 5, 5, 5, 5].map((k): Group => [40, k]),
        ...fits
      ),
      record(
        "SPLINE",
        [70, 1064],
        [71, 3],
        [44, 0.5],
        ...at(10, 0, 0, 0),
        ...at(10, 1, 1, 0),
        ...fits
      )
    )
    const [sqrt, uniform, matched, own, tolerance] = parsed.drawing
      .entities as SplineEntity[]
    expect(sqrt.knots).toBe("sqrtChord")
    expect(uniform.knots).toBe("uniform")
    expect(matched.knots).toBe("uniform")
    expect(matched.knotVector).toBeUndefined()
    expect(own.knotVector).toEqual([0, 0, 0, 0, 3, 5, 5, 5, 5])
    // A fit tolerance leaves the curve off its fit points: its control points are it.
    expect(tolerance.method).toBe("cv")
  })

  it("puts a planar spline off the plan in its plane", () => {
    const spline = only<SplineEntity>(
      read(
        record(
          "SPLINE",
          ...at(210, 0, -1, 0),
          [70, 12],
          [71, 2],
          ...[0, 0, 0, 1, 1, 1].map((k): Group => [40, k]),
          ...at(10, 0, 0, 0),
          [41, 1],
          ...at(10, 5, 0, 5),
          [41, 0.5],
          ...at(10, 10, 0, 0),
          [41, 1]
        )
      )
    )
    expect(spline.normal).toEqual({ x: 0, y: -1, z: 0 })
    expect(spline.weights).toEqual([1, 0.5, 1])
    expect(spline.points[1].y).toBeCloseTo(5, 12)
  })

  it("justifies TEXT by 72 and 73", () => {
    const text = (h: number, v: number): Group[] =>
      record(
        "TEXT",
        ...at(10, 0, 0),
        ...at(11, 5, 5),
        [1, "x"],
        [72, h],
        [73, v]
      )
    const parsed = read(
      text(1, 0),
      text(2, 0),
      text(4, 0),
      text(0, 1),
      text(1, 2),
      text(2, 3),
      record("TEXT", ...at(10, 1, 1), [1, "y"], [72, 1], [40, -2])
    )
    const texts = parsed.drawing.entities as TextEntity[]
    expect(texts.map((t) => t.justify)).toEqual([
      "center",
      "right",
      "middle",
      "bl",
      "mc",
      "tr",
      "center",
    ])
    expect(texts[0].position).toEqual({ x: 5, y: 5 })
    // No alignment point: the first point; no height: the default.
    expect(texts[6].position).toEqual({ x: 1, y: 1 })
    expect(texts[6].height).toBe(2.5)
  })

  it("reads an MTEXT's rotation in radians and a tilted one's plane", () => {
    const parsed = read(
      record(
        "MTEXT",
        ...at(10, 1, 2, 3),
        [50, Math.PI / 2],
        [3, "AB"],
        [1, "C"],
        [71, 5],
        [73, 2],
        [44, 2]
      ),
      record(
        "MTEXT",
        ...at(10, 0, 0, 0),
        ...at(210, 0, -1, 0),
        ...at(11, 1, 0, 0),
        [1, "tilted"]
      )
    )
    const [flat, tilted] = parsed.drawing.entities as MTextEntity[]
    expect(flat).toMatchObject({
      contents: "ABC",
      attachment: "mc",
      lineSpacingStyle: "exactly",
      lineSpacingFactor: 2,
      elevation: 3,
    })
    expect(flat.rotation).toBeCloseTo(Math.PI / 2, 12)
    expect(tilted.normal).toEqual({ x: 0, y: -1, z: 0 })
  })

  it("reads an attribute definition's modes and lock", () => {
    const def = only<AttributeDefinitionEntity>(
      read(
        record(
          "ATTDEF",
          ...at(10, 0, 0),
          [1, "D"],
          [3, "Ask"],
          [2, "tag"],
          [70, 15],
          [280, 1]
        )
      )
    )
    expect(def).toMatchObject({
      tag: "TAG",
      prompt: "Ask",
      value: "D",
      modes: {
        invisible: true,
        constant: true,
        verify: true,
        preset: true,
        lockPosition: true,
      },
    })
  })

  it("reads an attribute's own properties, and a block's base from its name in 3", () => {
    const parsed = parseDxf(
      file({
        BLOCKS: [
          ...record("BLOCK", [3, "Tag"], ...at(10, 1, 1, 2)),
          ...record("CIRCLE", ...at(10, 0, 0), [40, 1]),
          ...record("ENDBLK"),
        ],
        ENTITIES: [
          ...record("INSERT", [2, "tag"], ...at(10, 10, 10), [66, 1]),
          ...record(
            "ATTRIB",
            ...at(10, 11, 11),
            [1, "v"],
            [2, "a"],
            [70, 1],
            [62, 1],
            [6, "HIDDEN"],
            [370, 50]
          ),
          ...record("ATTRIB", ...at(10, 11, 11)),
        ],
      })
    )
    const [reference] = parsed.drawing.entities as InsertEntity[]
    expect(parsed.drawing.blocks[0]).toMatchObject({
      name: "Tag",
      baseElevation: 2,
    })
    expect(reference.attributes).toEqual([
      expect.objectContaining({
        tag: "A",
        invisible: true,
        color: "#ff0000",
        linetype: "Hidden",
        lineweight: 0.5,
        position: { x: 2, y: 2 },
      }),
    ])
  })

  it("reads a dimension's own text, text angle and plane, and refuses a two-line one on parallels", () => {
    const parsed = read(
      record(
        "DIMENSION",
        [70, 0],
        ...at(10, 0, 5),
        ...at(13, 0, 0),
        ...at(14, 10, 0),
        [50, 90],
        [53, 30],
        [1, ""]
      ),
      record(
        "DIMENSION",
        [70, 1],
        ...at(10, 0, 5),
        ...at(13, 0, 0),
        ...at(14, 10, 0),
        [1, "<>"],
        ...at(210, 0, -1, 0)
      ),
      record(
        "DIMENSION",
        [70, 2],
        ...at(13, 0, 0),
        ...at(14, 10, 0),
        ...at(15, 0, 1),
        ...at(10, 10, 1),
        ...at(16, 5, 5)
      )
    )
    const [linear, aligned] = parsed.drawing.entities as DimensionEntity[]
    expect(linear.rotation).toBeCloseTo(Math.PI / 2, 12)
    expect(linear.textAngle).toBeCloseTo(Math.PI / 6, 12)
    expect(linear.text).toBeUndefined()
    expect(aligned.text).toBeUndefined()
    expect(aligned.normal).toEqual({ x: 0, y: -1, z: 0 })
    expect(parsed.report.unreadable).toBe(1)
  })

  it("reads a hatch's edges: lines, arcs either way round, a whole circle, ellipses and a spline", () => {
    const edges: Group[] = [
      [91, 3],
      [92, 1],
      [93, 3],
      [72, 1],
      ...at(10, 0, 0),
      ...at(11, 10, 0),
      [72, 2],
      ...at(10, 10, 5),
      [40, 5],
      [50, 270],
      [51, 90],
      [73, 1],
      // Taken backwards: it ends where the last one ended.
      [72, 1],
      ...at(10, 0, 0),
      ...at(11, 10, 10),
      [97, 0],
      [92, 1],
      [93, 1],
      [72, 2],
      ...at(10, 0, 0),
      [40, 1],
      [50, 0],
      [51, 360],
      [73, 0],
      [97, 0],
      [92, 1],
      [93, 3],
      [72, 3],
      ...at(10, 0, 0),
      ...at(11, 2, 0),
      [40, 0.5],
      [50, 0],
      [51, 180],
      [73, 0],
      [72, 3],
      ...at(10, 0, 0),
      ...at(11, 2, 0),
      [40, 0.5],
      [50, 180],
      [51, 360],
      [73, 1],
      [72, 4],
      [94, 2],
      [73, 1],
      [74, 0],
      [95, 6],
      [96, 3],
      ...[0, 0, 0, 1, 1, 1].map((k): Group => [40, k]),
      ...at(10, 2, 0),
      [42, 1],
      ...at(10, 2, 2),
      [42, 0.5],
      ...at(10, -2, 0),
      [42, 1],
      [97, 2],
      ...at(11, 2, 0),
      ...at(11, -2, 0),
      ...at(12, 0, 1),
      ...at(13, 0, -1),
      [97, 0],
      [75, 0],
      [76, 1],
    ]
    const hatch = only<HatchEntity>(
      parseDxf(
        file({
          HEADER: [
            [9, "$ACADVER"],
            [1, "AC1032"],
          ],
          ENTITIES: record(
            "HATCH",
            ...at(10, 0, 0, 0),
            [2, "ANSI31"],
            [70, 0],
            ...edges
          ),
        })
      )
    )
    const [box, circle, round] = hatch.loops
    expect(box.vertices).toHaveLength(3)
    expect(box.bulges?.[1]).toBeCloseTo(1, 12)
    expect(box.bulges?.[2]).toBe(-0)
    expect(circle.bulges).toEqual([-1, -1])
    expect(round.vertices.length).toBeGreaterThan(40)
  })

  it("finds a hatch's origin from its first pattern line without the xdata", () => {
    const parsed = read(
      record(
        "HATCH",
        [2, "ANSI32"],
        [70, 0],
        [91, 1],
        [92, 2],
        [72, 0],
        [73, 1],
        [93, 3],
        ...at(10, 0, 0),
        ...at(10, 1, 0),
        ...at(10, 1, 1),
        [97, 0],
        [41, 1],
        [52, 0],
        [78, 2],
        [53, 45],
        [43, 1],
        [44, 2]
      ),
      record(
        "HATCH",
        [2, "MINE"],
        [70, 0],
        [91, 1],
        [92, 2],
        [72, 0],
        [73, 1],
        [93, 3],
        ...at(10, 0, 0),
        ...at(10, 1, 0),
        ...at(10, 1, 1),
        [97, 0],
        [53, 0],
        [43, 3],
        [44, 4],
        [1001, "ACAD"],
        [1000, "no origin"]
      )
    )
    const [ansi, mine] = parsed.drawing.entities as HatchEntity[]
    expect(ansi.origin).toEqual({ x: 1, y: 2 })
    expect(mine).toMatchObject({ patternId: "MINE", origin: { x: 3, y: 4 } })
  })
})

describe("the tables and the header", () => {
  it("skips an xref's layers and a second entry of a name; makes layer 0 when missing", () => {
    const parsed = parseDxf(
      file({
        TABLES: [
          ...record("TABLE", [2, "LAYER"]),
          ...record("LAYER", [2, "Site|Walls"], [70, 16], [62, 1]),
          ...record(
            "LAYER",
            [2, "Wet"],
            [70, 0],
            [62, -1],
            [420, 0x00ff00],
            [6, "BYBLOCK"]
          ),
          ...record("LAYER", [2, "WET"], [62, 3]),
          ...record("LAYER", [70, 0]),
          ...record("ENDTAB"),
          ...record("TABLE", [2, "LTYPE"]),
          ...record(
            "LTYPE",
            [2, "FENCE"],
            [73, 2],
            [49, 12.7],
            [74, 2],
            [49, -6.35],
            [74, 0]
          ),
          ...record("LTYPE", [2, "BAD"], [49, "x"]),
          ...record("ENDTAB"),
          ...record("TABLE", [2, "STYLE"]),
          ...record("STYLE", [2, "Shapes"], [70, 1]),
          ...record("STYLE", [70, 0]),
          ...record("STYLE", [2, "Big"], [40, 7]),
          ...record("ENDTAB"),
          ...record("TABLE", [2, "DIMSTYLE"]),
          ...record("DIMSTYLE", [70, 0]),
          ...record("DIMSTYLE", [2, "Mine"], [78, 8], [172, 1], [278, 44]),
          ...record("ENDTAB"),
          ...record("TABLE", [2, "LAYER"]),
          ...record("LAYER", [2, "Late"], [62, 2]),
          ...record("ENDTAB"),
        ],
        ENTITIES: [
          ...record(
            "LINE",
            [8, "0"],
            [6, "FENCE"],
            ...at(10, 0, 0),
            ...at(11, 1, 1)
          ),
          ...record("TEXT", [7, "big"], ...at(10, 0, 0), [1, "t"]),
          ...record(
            "DIMENSION",
            [3, "mine"],
            [70, 0],
            ...at(10, 0, 5),
            ...at(13, 0, 0),
            ...at(14, 1, 0)
          ),
        ],
      })
    )
    const layers = parsed.drawing.layers
    expect(layers.map((l) => l.name)).toEqual(["Wet", "Late", "0"])
    expect(layers[0]).toMatchObject({
      visible: false,
      color: "#00ff00",
      linetype: "Continuous",
    })
    expect(parsed.drawing.textStyles.map((s) => [s.name, s.height])).toEqual([
      ["Big", 7],
    ])
    expect(parsed.drawing.dimStyles.map((s) => s.name)).toEqual(["Mine"])
    expect(parsed.drawing.dimStyles[0]).toMatchObject({
      suppressTrailingZeros: true,
      forceLineInside: true,
      decimalSeparator: ",",
    })
    const [line, text, dim] = parsed.drawing.entities
    expect(line.linetype).toBe("FENCE")
    expect((text as TextEntity).styleId).toBe("Big")
    expect((dim as DimensionEntity).styleId).toBe("Mine")
  })

  it("reads R12's snap and grid from the header, a UCS and the current properties", () => {
    const parsed = parseDxf(
      file({
        HEADER: [
          [9, "$INSUNITS"],
          [70, 1],
          [9, "$SNAPMODE"],
          [70, 1],
          [9, "$SNAPUNIT"],
          ...at(10, 5, 5),
          [9, "$GRIDMODE"],
          [70, 0],
          [9, "$UCSORG"],
          ...at(10, 1, 2, 3),
          [9, "$UCSXDIR"],
          ...at(10, 0, 1, 0),
          [9, "$UCSYDIR"],
          ...at(10, -1, 0, 0),
          [9, "$UCSNAME"],
          [2, "Turned"],
          [9, "$CECOLOR"],
          [62, 1],
          [9, "$CELTYPE"],
          [6, "DASHED"],
          [9, "$CELWEIGHT"],
          [370, 50],
          [9, "$TEXTSIZE"],
          [40, -1],
          [9, "$SPLINETYPE"],
          [70, 5],
          [9, "$SPLINESEGS"],
          [70, 0],
          [9, "$ATTMODE"],
          [70, 9],
          [9, "$LUPREC"],
          [70, 12],
          [7, "a stray group"],
        ],
        ENTITIES: [],
      })
    )
    const s = parsed.drawing.settings
    expect(s).toMatchObject({
      unit: "mm",
      snapMode: true,
      snapUnit: { x: 5, y: 5 },
      gridMode: false,
      ucsName: "Turned",
      currentColor: "#ff0000",
      currentLinetype: "Dashed",
      currentLineweight: 0.5,
      textSize: 2.5,
      splineType: 5,
      splineSegments: 8,
      attributeDisplay: "normal",
      precision: 2,
    })
    expect(s.ucs.origin).toEqual({ x: 1, y: 2, z: 3 })
  })
})

describe("the file's sections and groups", () => {
  it("passes over comments, unknown sections and stray groups", () => {
    const text = [
      "999",
      "written by hand",
      "0",
      "SECTION",
      "2",
      "THUMBNAILIMAGE",
      "90",
      "0",
      "0",
      "ENDSEC",
      "5",
      "stray",
      "0",
      "SECTION",
      "2",
      "HEADER",
      "1",
      "no variable",
      "0",
      "ENDSEC",
      "0",
      "SECTION",
      "2",
      "TABLES",
      "5",
      "stray",
      "0",
      "TABLE",
      "2",
      "LAYER",
      "5",
      "x",
      "0",
      "LAYER",
      "2",
      "A",
      "0",
      "ENDSEC",
      "0",
      "SECTION",
      "2",
      "BLOCKS",
      "5",
      "stray",
      "0",
      "BLOCK",
      "2",
      "B",
      "0",
      "LINE",
      "10",
      "0",
      "20",
      "0",
      "11",
      "1",
      "21",
      "1",
      "0",
      "ENDSEC",
      "0",
      "SECTION",
      "2",
      "ENTITIES",
      "5",
      "stray",
      "0",
      "INSERT",
      "2",
      "B",
      "10",
      "0",
      "20",
      "0",
      "66",
      "1",
      "0",
      "ATTRIB",
      "10",
      "0",
      "20",
      "0",
      "1",
      "v",
      "2",
      "T",
      "0",
      "POLYLINE",
      "70",
      "0",
      "0",
      "SEQEND",
      "0",
      "SEQEND",
      "0",
      "ENDSEC",
      "0",
      "SECTION",
      "0",
      "ENDSEC",
      "0",
      "EOF",
    ].join("\n")
    const parsed = parseDxf(text)
    expect(parsed.drawing.layers.map((l) => l.name)).toEqual(["A", "0"])
    expect(parsed.drawing.blocks.map((b) => b.name)).toEqual(["B"])
    expect(parsed.drawing.entities.map((e) => e.type)).toEqual(["insert"])
  })

  it("refuses an empty file, one of comments, and a code with no value", () => {
    expect(() => parseDxf("")).toThrow(new DxfReadError("header", 1))
    expect(() => parseDxf("999\nonly a comment")).toThrow(
      new DxfReadError("header", 1)
    )
    expect(() => parseDxf("  0\nSECTION\n  2")).toThrow(
      new DxfReadError("read", 3)
    )
    expect(() => parseDxf("  5\nstray\n  0\nSECTION")).toThrow(
      new DxfReadError("header", 1)
    )
  })

  it("tells a DXF from text, bytes, a binary file and a comment first", () => {
    expect(looksLikeDxf("999\nx\n0\nSECTION")).toBe(true)
    expect(looksLikeDxf('{"type":"easycad-drawing"}')).toBe(false)
    expect(looksLikeDxf(new TextEncoder().encode("  0\r\nSECTION"))).toBe(true)
    expect(looksLikeDxf(binary([0, "SECTION"]))).toBe(true)
    expect(looksLikeDxf("")).toBe(false)
  })

  it("reads a binary file's every kind of value", () => {
    const parsed = parseDxf(
      binary(
        [0, "SECTION"],
        [2, "HEADER"],
        [9, "$DWGCODEPAGE"],
        [3, "ANSI_1253"],
        [9, "$HANDSEED"],
        [5, "FF"],
        [0, "ENDSEC"],
        [0, "SECTION"],
        [2, "ENTITIES"],
        [0, "TEXT"],
        [8, "0"],
        [10, 1],
        [20, 2],
        [40, 3],
        [1, new Uint8Array([0xe1])],
        [160, BigInt(7)],
        [290, true],
        [310, new Uint8Array([1, 2])],
        [370, 25],
        [420, 0x0000ff],
        [999, "c"],
        [1071, 9],
        [1004, new Uint8Array([3])],
        [-1, "x"],
        [430, "s"],
        [400, 1],
        [0, "ENDSEC"],
        [0, "EOF"]
      )
    )
    const [text] = parsed.drawing.entities as TextEntity[]
    // Windows-1253's 0xE1 is α.
    expect(text).toMatchObject({
      value: "α",
      height: 3,
      lineweight: 0.25,
      color: "#0000ff",
    })
  })

  it("refuses a binary file cut short", () => {
    const whole = binary(
      [0, "SECTION"],
      [2, "ENTITIES"],
      [0, "LINE"],
      [10, 1.5]
    )
    expect(() => parseDxf(whole.subarray(0, whole.length - 3))).toThrow(
      DxfReadError
    )
    expect(() => parseDxf(whole.subarray(0, 30))).toThrow(DxfReadError)
  })

  it("decodes a code page the runtime has no decoder for as Windows-1252", () => {
    const bytes = new Uint8Array([
      ...new TextEncoder().encode(
        "  0\nSECTION\n  2\nHEADER\n  9\n$DWGCODEPAGE\n  3\nANSI_9999\n  0\nENDSEC\n  0\nSECTION\n  2\nENTITIES\n  0\nTEXT\n 10\n0\n 20\n0\n  1\n"
      ),
      0xe9,
      ...new TextEncoder().encode("\n  0\nENDSEC\n  0\nEOF\n"),
    ])
    const [text] = parseDxf(bytes).drawing.entities as TextEntity[]
    expect(text.value).toBe("é")
  })
})

/**
 * A binary DXF of these groups, as AutoCAD 2018 writes one: the sentinel,
 * then each group's two-byte code and its value in its type's native form.
 */
function binary(
  ...groups: [number, string | number | bigint | boolean | Uint8Array][]
): Uint8Array {
  const out: number[] = [..."AutoCAD Binary DXF\r\n\x1a\0"].map((c) =>
    c.charCodeAt(0)
  )
  const push = (size: number, write: (view: DataView) => void) => {
    const buffer = new DataView(new ArrayBuffer(size))
    write(buffer)
    out.push(...new Uint8Array(buffer.buffer))
  }
  for (const [code, value] of groups) {
    push(2, (v) => v.setInt16(0, code, true))
    if (value instanceof Uint8Array) {
      if (code === 310 || code === 1004) out.push(value.length)
      out.push(...value)
      if (code !== 310 && code !== 1004) out.push(0)
    } else if (typeof value === "string") {
      out.push(...new TextEncoder().encode(value), 0)
    } else if (typeof value === "bigint") {
      push(8, (v) => v.setBigInt64(0, value, true))
    } else if (typeof value === "boolean") {
      out.push(value ? 1 : 0)
    } else if (code >= 10 && code <= 59) {
      push(8, (v) => v.setFloat64(0, value, true))
    } else if (
      (code >= 90 && code <= 99) ||
      (code >= 420 && code <= 429) ||
      code === 1071
    ) {
      push(4, (v) => v.setInt32(0, value, true))
    } else {
      push(2, (v) => v.setInt16(0, value, true))
    }
  }
  return new Uint8Array(out)
}

import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { gunzipSync } from "node:zlib"
import { describe, expect, it } from "vitest"
import { hatchOf, loopOf, p, snapshotOf } from "../../../test/builders"
import type { Entity, HatchEntity } from "../../domain/entities"
import { objectArea } from "../../domain/objectArea"
import { userHatchPatternLines } from "../../domain/hatchPatterns"
import { r12HatchRecord } from "./dxfR12Hatch"
import { parseDxf } from "./readDxf"
import { writeDxf } from "./writeDxf"

// An R12 hatch's xdata (probes dxf/x034–x049, back.sh). Each fixture is
// AutoCAD 2027's own DXFOUT of a probe's drawing, as R12 and, for some, as
// 2018: the reader must make of the R12 reference the hatch the 2018 file
// holds, which is what AutoCAD's CONVERT makes of it. The writer's files of
// these drawings, ASCII and binary, were opened by AutoCAD's console with no
// AUDIT error, LISTed with each pattern, scale and angle, and turned into
// hatches by its CONVERT (back.sh).

function fixture(name: string): Uint8Array {
  const path = new URL(`./fixtures/${name}.dxf.gz`, import.meta.url)
  return new Uint8Array(gunzipSync(readFileSync(path)))
}

function hatches(entities: readonly Entity[]): HatchEntity[] {
  return entities.filter((e) => e.type === "hatch")
}

/** What a hatch is, numbers to 6 places: no id, layer, colour or linetype. */
function shape(e: HatchEntity): unknown {
  const round = (value: unknown): unknown => {
    if (typeof value === "number") {
      const r = Math.round(value * 1e6) / 1e6
      return r === 0 ? 0 : r
    }
    if (Array.isArray(value)) return value.map(round)
    if (value && typeof value === "object") {
      return Object.fromEntries(
        Object.entries(value).map(([key, v]) => [key, round(v)])
      )
    }
    return value
  }
  return round({
    loops: e.loops,
    patternId: e.patternId,
    patternType: e.patternType,
    patternLines: e.patternLines,
    patternScale: e.patternScale,
    patternAngle: e.patternAngle,
    origin: e.origin,
    gradient: e.gradient,
    elevation: e.elevation,
    normal: e.normal,
  })
}

function r12(drawing: Parameters<typeof writeDxf>[0], binary = false) {
  return writeDxf(drawing, { version: "R12", binary, precision: 16 }).bytes
}

function text(bytes: Uint8Array): string {
  return new TextDecoder("latin1").decode(bytes)
}

describe("an R12 hatch read back", () => {
  // x035's arcs (one taken clockwise), x036's ellipses and elliptical arcs,
  // x037's splines (one closed through 4 points and one through 6, their
  // edges periodic) and x039's hatches: not
  // associative, its boundary erased, drawn with no boundary, each island
  // style, an origin of its own and a User-defined pattern, doubled.
  for (const name of ["arcs", "ellipses", "splines", "kinds"]) {
    it(`reads AutoCAD's R12 hatches of ${name} as the hatches of its 2018 file`, () => {
      const back = parseDxf(fixture(`hatch-${name}-R12`))
      const expected = hatches(
        parseDxf(fixture(`hatch-${name}-2018`)).drawing.entities
      )
      const read = hatches(back.drawing.entities)
      expect(expected.length).toBeGreaterThan(2)
      expect(read.map(shape)).toEqual(expected.map(shape))
      expect(back.report.unreadable).toBe(0)
      // The reference and the block of what it drew are the hatch's no more.
      expect(back.drawing.entities.some((e) => e.type === "insert")).toBe(false)
      expect(back.drawing.blocks).toEqual([])
    })
  }

  // What no 2018 file says: the edges' own geometry. x035's crescent lies
  // between two arcs on a chord of 60, radius 32 and 50, one edge clockwise;
  // x036's between two half ellipses on an axis of 80, 25 and 10 high.
  it("reads an edge taken clockwise the way it runs (x035, x036)", () => {
    const segment = (radius: number) => {
      const d = Math.sqrt(radius * radius - 900)
      return radius * radius * Math.acos(d / radius) - d * 30
    }
    const arcs = hatches(parseDxf(fixture("hatch-arcs-R12")).drawing.entities)
    expect(objectArea(arcs[2])?.area).toBeCloseTo(segment(32) - segment(50), 6)
    const ellipses = hatches(
      parseDxf(fixture("hatch-ellipses-R12")).drawing.entities
    )
    // An elliptical edge is laid as straight runs: within a hundredth.
    const near = (value: number | undefined, expected: number) =>
      expect(Math.abs((value ?? 0) / expected - 1)).toBeLessThan(0.01)
    near(objectArea(ellipses[0])?.area, Math.PI * 40 * 15)
    near(objectArea(ellipses[1])?.area, (Math.PI * 40 * 20) / 2)
    near(objectArea(ellipses[2])?.area, (Math.PI * 40 * (25 - 10)) / 2)
  })

  it("reads a boundary of lines, and one of three loops picked by a point (x034)", () => {
    const [first, second] = hatches(
      parseDxf(fixture("hatch-lines-R12")).drawing.entities
    )
    expect(first).toMatchObject({ patternId: "ANSI31", patternScale: 2 })
    expect(first.patternAngle).toBeCloseTo(Math.PI / 6, 12)
    expect(first.loops.map((l) => l.vertices.length)).toEqual([4])
    expect(objectArea(first)?.area).toBeCloseTo(5000, 6)
    expect(second.patternId).toBe("ANSI37")
    expect(second.loops.map((l) => l.vertices.length)).toEqual([3, 4, 4])
    // CONVERT gives the hatch its reference's linetype (back.sh: 6 Continuous).
    expect(first.linetype).toMatch(/^continuous$/i)
  })

  it("reads a polyline boundary with its bulges (x038)", () => {
    const read = hatches(
      parseDxf(fixture("hatch-polylines-R12")).drawing.entities
    )
    expect(read).toHaveLength(3)
    // The slot of 60 by 40 with its two half circles of radius 20.
    expect(objectArea(read[0])?.area).toBeCloseTo(60 * 40 + Math.PI * 400, 6)
    expect(read[2].loops).toHaveLength(2)
    expect(read[2].loops[1].bulges).toEqual([-1, -1])
  })

  it("reads a gradient as the fill CONVERT makes of one, its colours lost (x040, x046)", () => {
    const gradients = hatches(
      parseDxf(fixture("hatch-gradients-R12")).drawing.entities
    )
    expect(gradients).toHaveLength(3)
    for (const hatch of gradients) {
      expect(hatch.patternId).toBe("SOLID")
      expect(hatch.gradient).toBeUndefined()
    }
    const [user, solid, gradient] = hatches(
      parseDxf(fixture("hatch-fills-R12")).drawing.entities
    )
    expect(user).toMatchObject({
      patternId: "_U",
      patternType: "user",
      patternScale: 4,
    })
    expect(user.patternLines).toHaveLength(1)
    expect(user.patternLines![0].deltaY).toBeCloseTo(1, 12)
    expect(user.patternAngle).toBeCloseTo(Math.PI / 6, 12)
    expect(solid.patternId).toBe("SOLID")
    expect(gradient.patternId).toBe("SOLID")
  })

  it("reads the hatch's elevation and normal (x042)", () => {
    const [raised, front, tilted] = hatches(
      parseDxf(fixture("hatch-planes-R12")).drawing.entities
    )
    expect(raised.elevation).toBe(10)
    expect(raised.normal).toBeUndefined()
    expect(front.normal?.y).toBeCloseTo(-1, 12)
    expect(tilted.normal?.x).toBeCloseTo(Math.sqrt(1 / 3), 12)
    expect(tilted.origin.x).toBeCloseTo(205, 9)
  })

  it("leaves a hatch of R12's own, with no R14_HATCH_DATA, the reference it is (x045's v4)", () => {
    const back = parseDxf(fixture("hatch-r12only-R12")).drawing
    expect(hatches(back.entities)).toEqual([])
    expect(back.entities.filter((e) => e.type === "insert")).toHaveLength(2)
    expect(back.blocks).toHaveLength(2)
  })

  /** AutoCAD's R12 of x034, its text changed. */
  function edited(change: (text: string) => string): Uint8Array {
    const text = new TextDecoder("latin1").decode(fixture("hatch-lines-R12"))
    return Uint8Array.from(change(text), (c) => c.charCodeAt(0))
  }

  // x049: AutoCAD makes the hatch of a reference before it moves it, and a
  // copy, whose data names its source, stays a reference through CONVERT.
  it("leaves a copy of a hatch's reference, and one moved, the reference it is", () => {
    const copy = parseDxf(
      edited((t) =>
        t.replace("INSERT\r\n  5\r\n2E0\r\n", "INSERT\r\n  5\r\n9E0\r\n")
      )
    ).drawing
    expect(hatches(copy.entities)).toHaveLength(1)
    expect(copy.entities.filter((e) => e.type === "insert")).toHaveLength(1)
    expect(copy.blocks).toHaveLength(1)
    const moved = parseDxf(
      edited((t) =>
        t.replace(
          "  2\r\n*X1\r\n 10\r\n0.0\r\n 20\r\n0.0\r\n",
          "  2\r\n*X1\r\n 10\r\n500.0\r\n 20\r\n300.0\r\n"
        )
      )
    ).drawing
    expect(hatches(moved.entities)).toHaveLength(1)
    expect(moved.blocks.map((b) => b.name)).toEqual(["*X1"])
  })

  it("keeps a block with a name of its own, whatever its reference says", () => {
    const back = parseDxf(edited((t) => t.replaceAll("*X1", "DOOR"))).drawing
    expect(hatches(back.entities)).toHaveLength(2)
    expect(back.blocks.map((b) => b.name)).toEqual(["DOOR"])
  })

  it("leaves a spline edge of a degree no spline has the reference it is", () => {
    const hostile = new TextDecoder("latin1")
      .decode(fixture("hatch-splines-R12"))
      .replaceAll(
        "1070\r\n     4\r\n1070\r\n     3\r\n",
        "1070\r\n     4\r\n1070\r\n 30000\r\n"
      )
    const back = parseDxf(
      Uint8Array.from(hostile, (c) => c.charCodeAt(0))
    ).drawing
    expect(hatches(back.entities)).toEqual([])
    expect(back.entities.filter((e) => e.type === "insert")).toHaveLength(4)
  })

  it("leaves a reference whose data stops short the reference it is", () => {
    const codes = [0, 5, 8, 2, 10, 20, 30, 1001, 1002, 1000, 1000, 1011]
    const values = [
      "INSERT",
      "2E",
      "0",
      "*U1",
      "0",
      "0",
      "0",
      "ACAD",
      "{",
      "R14_HATCH_DATA",
      "2E",
      "1.0",
    ]
    expect(
      r12HatchRecord({ type: "INSERT", codes, values, line: 1 })
    ).toBeNull()
    // And one that is no hatch at all.
    expect(
      r12HatchRecord({
        type: "INSERT",
        codes: codes.slice(0, 7),
        values: values.slice(0, 7),
        line: 1,
      })
    ).toBeNull()
  })
})

describe("an R12 hatch written", () => {
  const pattern = {
    ...hatchOf([loopOf(p(0, 0), p(100, 50)), loopOf(p(30, 20), p(70, 30))], {
      patternId: "ANSI31",
      patternScale: 2,
      patternAngle: Math.PI / 6,
      origin: p(7, 3),
    }),
    color: "#ff0000" as const,
  }
  const solid = hatchOf(
    [
      {
        vertices: [p(150, 25), p(200, 25)],
        bulges: [1, 1],
      },
    ],
    { patternId: "SOLID" }
  )
  const user = hatchOf([loopOf(p(0, 100), p(100, 150))], {
    patternId: "_U",
    patternType: "user",
    patternLines: userHatchPatternLines(true),
    patternScale: 5,
    patternAngle: Math.PI / 4,
  })
  const gradient = hatchOf([loopOf(p(120, 100), p(220, 150))], {
    patternId: "SOLID",
    gradient: {
      name: "LINEAR",
      colors: ["#ff0000", "#00ff00"],
      angle: 0,
      centered: true,
    },
  })
  const raised = {
    ...hatchOf([loopOf(p(240, 100), p(340, 150))], { patternId: "ANSI37" }),
    elevation: 10,
    normal: { x: 0, y: -1, z: 0 },
  }
  const drawing = snapshotOf([pattern, solid, user, gradient, raised])

  it("says what a pattern is in the reference's HATCH and R14_HATCH_DATA xdata (x039)", () => {
    const out = text(r12(snapshotOf([pattern])))
    const handle = /INSERT\r\n {2}5\r\n([0-9A-F]+)\r\n/.exec(out)![1]
    expect(out).toContain(
      [
        "1001\r\nACAD",
        "1000\r\nHATCH",
        "1002\r\n{",
        "1070\r\n    19",
        "1000\r\nANSI31",
        "1040\r\n2.0",
        "1040\r\n0.5235987755982988",
        "1000\r\nR14_HATCH_DATA",
        `1000\r\n${handle}`,
        "1011\r\n1.0\r\n1021\r\n0.0\r\n1031\r\n0.0",
      ].join("\r\n")
    )
    // No boundary objects: the model's hatch is not associative.
    expect(out).not.toContain("ASC_BOUNDS")
    expect(out).not.toContain("1005\r\n")
    // Its two loops, as polylines with no bulge, closed, of four vertices.
    expect(out).toContain(
      "1071\r\n        2\r\n1071\r\n        2\r\n1070\r\n     0\r\n1070\r\n     1\r\n1071\r\n        4\r\n1040\r\n0.0\r\n1040\r\n0.0\r\n1040\r\n100.0\r\n"
    )
    expect(out).toMatch(/1002\r\n\}\r\n {2}0\r\nENDSEC/)
    expect(out).toContain("APPID\r\n 70\r\n     1\r\n")
  })

  it("writes a fill's data with no HATCH group, and a User-defined pattern's Double (x046, x039)", () => {
    const fill = text(r12(snapshotOf([solid])))
    expect(fill).toContain(
      "1001\r\nACAD\r\n1002\r\n{\r\n1000\r\nR14_HATCH_DATA\r\n"
    )
    expect(fill).not.toContain("1000\r\nHATCH\r\n")
    const doubled = text(r12(snapshotOf([user])))
    expect(doubled).toContain(
      "1000\r\n_U\r\n1040\r\n5.0\r\n1040\r\n0.7853981633974483\r\n1070\r\n     1\r\n1000\r\nR14_HATCH_DATA"
    )
  })

  it("carries a gradient's two colours by index, their applications registered (x040)", () => {
    const out = text(r12(snapshotOf([gradient])))
    expect(out).toContain(
      "1001\r\nGRADIENTCOLOR1ACI\r\n1070\r\n     1\r\n1001\r\nGRADIENTCOLOR2ACI\r\n1070\r\n     3\r\n1001\r\nACAD\r\n1002\r\n{"
    )
    expect(out).toContain("APPID\r\n 70\r\n     3\r\n")
    expect(out).toContain("APPID\r\n  2\r\nGRADIENTCOLOR2ACI\r\n")
  })

  it("rounds the xdata's reals to the file's places, as AutoCAD does (x047)", () => {
    const out = text(
      writeDxf(snapshotOf([pattern]), {
        version: "R12",
        binary: false,
        precision: 3,
      }).bytes
    )
    expect(out).toContain("1000\r\nANSI31\r\n1040\r\n2.0\r\n1040\r\n0.524\r\n")
    expect(out).not.toMatch(/10[14]\d\r\n-?\d+\.\d{4,}\r\n/)
  })

  for (const binary of [false, true]) {
    it(`reads its own R12${binary ? " binary" : ""} back as the hatches written`, () => {
      const back = parseDxf(r12(drawing, binary)).drawing
      const read = hatches(back.entities)
      expect(read.map(shape)).toEqual(
        [pattern, solid, user, gradient, raised].map((e) =>
          // A gradient comes back the fill it is drawn as.
          shape(e.gradient ? { ...e, gradient: undefined } : e)
        )
      )
      // R12 has no true colour: its nearest index.
      expect(read[0].color).toBe("1")
      expect(back.entities).toHaveLength(5)
      expect(back.blocks).toEqual([])
    })
  }

  // The check of the writer against AutoCAD: writeDxf.test.ts's DXF_OUT
  // writes each drawing as R12, back.sh has AutoCAD's console AUDIT, LIST and
  // CONVERT each file and save it as 2018 (<name>-back.dxf), and
  // `DXF_BACK=<dir> npx vitest run cad/serialization/dxf/dxfR12Hatch.test.ts`
  // reads that as the hatches the R12 file was written from.
  it.skipIf(!process.env.DXF_BACK)(
    "is the hatch AutoCAD's CONVERT makes of it",
    () => {
      const dir = process.env.DXF_BACK!
      const files = readdirSync(dir).filter((f) => f.endsWith("-back.dxf"))
      expect(files.length).toBeGreaterThan(0)
      for (const file of files) {
        const converted = hatches(
          parseDxf(new Uint8Array(readFileSync(join(dir, file)))).drawing
            .entities
        )
        const written = hatches(
          parseDxf(
            new Uint8Array(
              readFileSync(join(dir, file.replace("-back.dxf", ".dxf")))
            )
          ).drawing.entities
        )
        expect(written.length, file).toBeGreaterThan(0)
        expect(converted.map(shape), file).toEqual(written.map(shape))
      }
    }
  )

  // x048: an object's xdata holds 16383 bytes; AutoCAD's R12 then writes a
  // pattern's HATCH group alone and a fill's reference bare.
  it("leaves out the data of a boundary too long for an object's xdata", () => {
    const ring = (count: number) => ({
      vertices: Array.from({ length: count }, (_, i) => {
        const a = (2 * Math.PI * i) / count
        return p(100 * Math.cos(a), 100 * Math.sin(a))
      }),
    })
    const long = text(r12(snapshotOf([hatchOf([ring(1000)])])))
    expect(long).toContain("1000\r\nHATCH\r\n1002\r\n{\r\n1070\r\n    19\r\n")
    expect(long).not.toContain("R14_HATCH_DATA")
    expect(long).toMatch(/1040\r\n0\.0\r\n1002\r\n\}\r\n/)
    const fill = text(
      r12(snapshotOf([hatchOf([ring(1000)], { patternId: "SOLID" })]))
    )
    expect(fill).not.toContain("1001\r\n")
    // What fits is whole: 16 bytes of every 18 a vertex takes are its reals.
    expect(text(r12(snapshotOf([hatchOf([ring(880)])])))).toContain(
      "R14_HATCH_DATA"
    )
    expect(text(r12(snapshotOf([hatchOf([ring(900)])])))).not.toContain(
      "R14_HATCH_DATA"
    )
  })
})

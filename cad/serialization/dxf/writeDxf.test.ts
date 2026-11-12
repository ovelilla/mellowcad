import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { gunzipSync } from "node:zlib"
import { describe, expect, it } from "vitest"
import { circleOf, lineOf, p, snapshotOf } from "../../../test/builders"
import { createText } from "../../domain/entities"
import { parseDxf } from "./readDxf"
import { dxfReal } from "./dxfOut"
import { DxfVersion, writeDxf } from "./writeDxf"

// The writer of SAVEAS's DXF types and DXFOUT. Each file it writes of the
// two reference drawings (f001, f004), in every version, ASCII and binary,
// was opened by AutoCAD 2027's console with no AUDIT error and plotted as
// AutoCAD's own (scripts/research/probes/dxf/audit.sh, plot.sh); here, the
// reader opens each back as the drawing it was.

function fixture(name: string): Uint8Array {
  const path = new URL(`./fixtures/${name}.dxf.gz`, import.meta.url)
  return new Uint8Array(gunzipSync(readFileSync(path)))
}

const VERSIONS: readonly DxfVersion[] = [
  "2000",
  "2004",
  "2007",
  "2010",
  "2013",
  "2018",
]

/** A drawing's objects as plain data, ids dropped and numbers to 9 places. */
function shape(value: unknown): unknown {
  if (typeof value === "number") {
    const r = Math.round(value * 1e9) / 1e9
    return r === 0 ? 0 : r
  }
  if (Array.isArray(value)) return value.map(shape)
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {}
    for (const [key, v] of Object.entries(value)) {
      if (key === "id" || key === "layerId") continue
      out[key] = shape(v)
    }
    return out
  }
  return value
}

describe("writeDxf", () => {
  for (const name of ["fixture-2018", "fixture2-2018"]) {
    const drawing = parseDxf(fixture(name)).drawing
    for (const version of VERSIONS) {
      for (const binary of [false, true]) {
        it(`writes ${name} as ${version}${binary ? " binary" : ""}, read back the same`, () => {
          const { bytes } = writeDxf(drawing, {
            version,
            binary,
            precision: 16,
          })
          const back = parseDxf(bytes).drawing
          expect(shape(back.entities)).toEqual(shape(drawing.entities))
          expect(back.layers.map((l) => [l.name, l.color, l.visible])).toEqual(
            drawing.layers.map((l) => [l.name, l.color, l.visible])
          )
          expect(back.blocks.map((b) => b.name)).toEqual(
            drawing.blocks.map((b) => b.name)
          )
          expect(shape(back.settings)).toEqual(shape(drawing.settings))
        })
      }
    }
  }

  // x015: a line to 123.456789012345,0.001234567890123 at 0, 3, 8 and 16
  it("writes a real as AutoCAD does at each precision", () => {
    expect(dxfReal(123.45678901234501, 0)).toBe("123")
    expect(dxfReal(0.6666666666666666, 0)).toBe("1")
    expect(dxfReal(123.45678901234501, 3)).toBe("123.457")
    expect(dxfReal(0.001234567890123, 3)).toBe("0.001")
    expect(dxfReal(0, 3)).toBe("0.0")
    expect(dxfReal(0.001234567890123, 8)).toBe("0.00123457")
    expect(dxfReal(123.45678901234501, 16)).toBe("123.456789012345")
    expect(dxfReal(1 / 3, 16)).toBe("0.3333333333333333")
    expect(dxfReal(10 / 3, 16)).toBe("3.333333333333333")
    // x021: no exponent, at most 16 decimals
    expect(dxfReal(-7e-16, 16)).toBe("-0.0000000000000007")
    expect(dxfReal(-2.842170943040401e-14, 16)).toBe("-0.0000000000000284")
    expect(dxfReal(-7e-16, 3)).toBe("0.0")
    expect(dxfReal(1e21, 16)).toBe("1000000000000000000000.0")
  })

  it("rounds points to the precision and keeps a radius whole, as AutoCAD (x021)", () => {
    const drawing = snapshotOf([
      lineOf(p(0, 0), p(123.456789012345, 1 / 3)),
      circleOf(p(1 / 3, 2 / 3), 10 / 3),
    ])
    const text = new TextDecoder().decode(
      writeDxf(drawing, { version: "2018", binary: false, precision: 3 }).bytes
    )
    expect(text).toContain(" 11\r\n123.457\r\n 21\r\n0.333\r\n")
    expect(text).toContain(" 10\r\n0.333\r\n 20\r\n0.667\r\n")
    expect(text).toContain(" 40\r\n3.333333333333333\r\n")
  })

  // x014: up to 2004 the text is ANSI_1252 with \U+XXXX beyond it; from 2007, UTF-8
  it("writes text in the code page up to 2004 and in UTF-8 from 2007", () => {
    const drawing = snapshotOf([createText(p(0, 0), "Ñandú α")])
    const old = writeDxf(drawing, {
      version: "2004",
      binary: false,
      precision: 16,
    }).bytes
    expect(new TextDecoder("windows-1252").decode(old)).toContain(
      "Ñandú \\U+03B1"
    )
    expect(old.includes(0xd1)).toBe(true)
    const recent = writeDxf(drawing, {
      version: "2018",
      binary: false,
      precision: 16,
    }).bytes
    expect(new TextDecoder().decode(recent)).toContain("Ñandú α")
    for (const bytes of [old, recent]) {
      const back = parseDxf(bytes).drawing.entities[0]
      expect(back.type === "text" && back.value).toBe("Ñandú α")
    }
  })

  it("writes only the objects asked for (select Objects)", () => {
    const line = lineOf(p(0, 0), p(10, 0))
    const circle = circleOf(p(5, 5), 2)
    const { bytes } = writeDxf(snapshotOf([line, circle]), {
      version: "2018",
      binary: false,
      precision: 16,
      objects: [circle],
    })
    expect(parseDxf(bytes).drawing.entities.map((e) => e.type)).toEqual([
      "circle",
    ])
  })

  // An ACIS object is counted instead (dxfSave.test.ts writes a BOX).
  it("holds every object the reader opened of the reference drawing", () => {
    const drawing = parseDxf(fixture("fixture-2018")).drawing
    const { report } = writeDxf(drawing, {
      version: "2018",
      binary: false,
      precision: 16,
    })
    expect(report.leftOut.size).toBe(0)
  })

  // Writes the reference drawings in every version for AutoCAD's console to
  // open: `DXF_OUT=<dir> npx vitest run cad/serialization/dxf/writeDxf.test.ts`,
  // then scripts/research/probes/dxf/audit.sh on each file.
  it.skipIf(!process.env.DXF_OUT)("writes the files AutoCAD checks", () => {
    const dir = process.env.DXF_OUT!
    mkdirSync(dir, { recursive: true })
    for (const name of ["fixture-2018", "fixture2-2018"]) {
      const drawing = parseDxf(fixture(name)).drawing
      for (const version of VERSIONS) {
        for (const binary of [false, true]) {
          const { bytes } = writeDxf(drawing, {
            version,
            binary,
            precision: 16,
          })
          const file = `${name.replace("-2018", "")}-${version}${binary ? "b" : ""}.dxf`
          writeFileSync(join(dir, file), bytes)
        }
      }
    }
  })
})

import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { gunzipSync } from "node:zlib"
import { describe, expect, it } from "vitest"
import { circleOf, lineOf, p, snapshotOf } from "../../../test/builders"
import {
  attachLeaderBlock,
  attachLeaderText,
  assignEntityLinetype,
  createBlockDefinition,
  createInsert,
  createLeader,
  createPoint,
  createSolid2d,
  createText,
  dimLook,
  withLeaderOverride,
  withLinetypeScale,
  withNormal,
  withThickness,
} from "../../domain/entities"
import { DEFAULT_DIM_STYLE } from "../../domain/dimStyles"
import { linetypeNamed } from "../../domain/linetypes"
import { ACADISO_LIN } from "../../domain/linetypeLibrary"
import { withLoaded } from "../../application/commands/linetypeCommands"
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

/** Points flat, thick, turned (DXF 50) and tilted, PDMODE 35 and PDSIZE -7. */
function pointsDrawing() {
  const flat = withThickness(createPoint({ x: 1, y: 2, z: 3 }), 2.5)
  const turned = createPoint({ x: 5, y: 0 }, undefined, (330 * Math.PI) / 180)
  const tilted = withNormal(createPoint({ x: 2, y: 3, z: 4 }), {
    x: 0.5,
    y: -Math.sqrt(3) / 2,
    z: 0,
  })
  const drawing = snapshotOf([flat, turned, tilted])
  return {
    ...drawing,
    settings: { ...drawing.settings, pointMode: 35, pointSize: -7 },
  }
}

/**
 * The drawing's own linetypes (ltype/p06): ISO and scaled ones, GAS_LINE's
 * text and BATTING's shapes, one a layer names, a line at each, one with a
 * linetype scale of its own, and CELTSCALE and CELTYPE set.
 */
function linetypesDrawing() {
  const extra = ["ACAD_ISO02W100", "HIDDEN2", "GAS_LINE", "BATTING"].map(
    (name) => linetypeNamed(ACADISO_LIN, name)!
  )
  const lines = extra.map((linetype, i) =>
    assignEntityLinetype(lineOf(p(0, i * 10), p(100, i * 10)), linetype.name)
  )
  const scaled = withLinetypeScale(
    assignEntityLinetype(lineOf(p(0, 50), p(100, 50)), "DASHED"),
    2.5
  )
  const drawing = snapshotOf([...lines, scaled])
  return {
    ...drawing,
    linetypes: withLoaded(drawing.linetypes, extra, drawing.textStyles),
    layers: drawing.layers.map((layer) => ({ ...layer, linetype: "HIDDEN2" })),
    settings: {
      ...drawing.settings,
      currentLinetype: "GAS_LINE",
      currentLinetypeScale: 0.5,
    },
  }
}

/** 2D solids: a quadrilateral, a thick raised triangle, a tilted bow tie. */
function solidsDrawing() {
  const quad = createSolid2d([p(0, 0), p(10, 0), p(0, 6), p(10, 6)])
  const triangle = withThickness(
    createSolid2d([{ x: 20, y: 0, z: 4 }, p(30, 0), p(25, 8), p(25, 8)]),
    2
  )
  const bowTie = withNormal(
    createSolid2d([p(0, 0), p(5, 0), p(5, 5), p(0, 5)]),
    { x: 0, y: -1, z: 0 }
  )
  return snapshotOf([quad, triangle, bowTie])
}

/**
 * Leaders as LEADER makes them (leader/p01, p02, p05): one hooked to its
 * text, one to the left, one alone, a spline, one without an arrowhead at
 * DIMSCALE 10 with its text centred (DIMTAD 0), one to a block reference, and
 * one in a plane facing down, its text with it.
 */
function leadersDrawing() {
  const look = dimLook(DEFAULT_DIM_STYLE)
  const texted = (points: { x: number; y: number }[], text: string) =>
    attachLeaderText(createLeader(points, "ISO-25"), text, look, "Standard")
  const hooked = texted([p(0, 0), p(10, 10)], "Hooked")
  const left = texted([p(100, 0), p(90, 10)], "Left side")
  const alone = createLeader([p(200, 0), p(210, 10), p(220, 10)], "ISO-25")
  const spline = attachLeaderText(
    createLeader([p(300, 0), p(310, 10), p(320, 5)], "ISO-25", {
      spline: true,
    }),
    "Splined",
    look,
    "Standard"
  )
  const scaled = withLeaderOverride(
    withLeaderOverride(
      createLeader([p(400, 0), p(450, 50)], "ISO-25", { arrow: false }),
      "scale",
      10
    ),
    "textAbove",
    false
  )
  const centred = attachLeaderText(
    scaled,
    "Scaled",
    dimLook(DEFAULT_DIM_STYLE, scaled.overrides),
    "Standard"
  )
  const reference = createInsert("TAG", p(515, 15))
  const block = attachLeaderBlock(
    createLeader([p(500, 0), p(510, 10)], "ISO-25"),
    reference
  )
  const down = { x: 0, y: 0, z: -1 }
  const facing = texted([p(600, 0), p(610, 10)], "Below")
  const drawing = snapshotOf([
    hooked.leader,
    hooked.text,
    left.leader,
    left.text,
    alone,
    spline.leader,
    spline.text,
    centred.leader,
    centred.text,
    block,
    reference,
    withNormal(facing.leader, down),
    withNormal(facing.text, down),
  ])
  return {
    ...drawing,
    blocks: [createBlockDefinition("TAG", p(0, 0), [circleOf(p(0, 0), 2)])],
  }
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

  // point/p04: a point keeps its Z, thickness, plane and DXF 50, and the
  // drawing its PDMODE and PDSIZE.
  it("writes points and $PDMODE, $PDSIZE, read back the same", () => {
    const drawing = pointsDrawing()
    for (const version of ["2000", "2018"] as const) {
      for (const binary of [false, true]) {
        const back = parseDxf(
          writeDxf(drawing, { version, binary, precision: 16 }).bytes
        ).drawing
        expect(shape(back.entities)).toEqual(shape(drawing.entities))
        expect(back.settings).toMatchObject({ pointMode: 35, pointSize: -7 })
      }
    }
  })

  // ltype/p06: the drawing's linetypes, a complex one's text and shapes with
  // their styles, an object's own scale (48), CELTSCALE and CELTYPE.
  it("writes the drawing's linetypes, read back the same", () => {
    const drawing = linetypesDrawing()
    for (const version of VERSIONS) {
      for (const binary of [false, true]) {
        const back = parseDxf(
          writeDxf(drawing, { version, binary, precision: 16 }).bytes
        ).drawing
        expect(shape(back.linetypes)).toEqual(shape(drawing.linetypes))
        expect(shape(back.entities)).toEqual(shape(drawing.entities))
        expect(back.layers[0].linetype).toBe("HIDDEN2")
        expect(back.settings).toMatchObject({
          currentLinetype: "GAS_LINE",
          currentLinetypeScale: 0.5,
        })
      }
    }
  })

  // solid2d/p01, p08: a 2D solid keeps its corners, elevation, thickness and plane.
  it("writes 2D solids, read back the same", () => {
    const drawing = solidsDrawing()
    for (const version of ["2000", "2018"] as const) {
      for (const binary of [false, true]) {
        const back = parseDxf(
          writeDxf(drawing, { version, binary, precision: 16 }).bytes
        ).drawing
        expect(shape(back.entities)).toEqual(shape(drawing.entities))
      }
    }
  })

  // leader/p22: each leader with its vertices, flags, overrides and plane,
  // and with its text or block reference, linked again by 340.
  it("writes leaders with their annotations, read back the same", () => {
    const drawing = leadersDrawing()
    for (const version of ["2000", "2018"] as const) {
      for (const binary of [false, true]) {
        const back = parseDxf(
          writeDxf(drawing, { version, binary, precision: 16 }).bytes
        ).drawing
        expect(shape(back.entities)).toEqual(shape(drawing.entities))
        const leaders = back.entities.filter((e) => e.type === "leader")
        const texts = back.entities.filter((e) => e.type !== "leader")
        for (const leader of leaders) {
          if (leader.type !== "leader" || !leader.annotation) continue
          expect(texts.map((t) => t.id)).toContain(leader.annotation.id)
        }
      }
    }
  })

  // A pasted array's block holds the objects of the one it was copied from,
  // ids and all: each block's pair keeps handles of its own, linked inside it.
  it("pairs a leader with its text in each block, when two blocks share their ids", () => {
    const pair = attachLeaderText(
      createLeader([p(0, 0), p(10, 10)], "ISO-25"),
      "Twice",
      dimLook(DEFAULT_DIM_STYLE),
      "Standard"
    )
    const drawing = {
      ...snapshotOf([
        createInsert("*U1", p(0, 0)),
        createInsert("*U2", p(100, 0)),
      ]),
      blocks: ["*U1", "*U2"].map((name) =>
        createBlockDefinition(name, p(0, 0), [pair.leader, pair.text])
      ),
    }
    const text = new TextDecoder().decode(
      writeDxf(drawing, { version: "2018", binary: false, precision: 16 }).bytes
    )
    const groups = text.split("\r\n")
    const handles: string[] = []
    const links: [string, string][] = []
    let type = ""
    let own = ""
    for (let i = 0; i < groups.length - 1; i += 2) {
      const code = groups[i].trim()
      const value = groups[i + 1].trim()
      if (code === "0") type = value
      if (code === "5" || code === "105") {
        handles.push(value)
        own = value
      }
      if (type === "LEADER" && code === "340") links.push([own, value])
    }
    expect(new Set(handles).size).toBe(handles.length)
    expect(links).toHaveLength(2)
    expect(new Set(links.map(([, to]) => to)).size).toBe(2)
    const back = parseDxf(text).drawing
    for (const block of back.blocks.filter((b) => b.name.startsWith("*U"))) {
      const [leader, mtext] = block.entities
      expect(leader.type === "leader" && leader.annotation?.id).toBe(mtext.id)
    }
  })

  it("writes a leader as AutoCAD's DXFOUT does, its defaults left out (p22)", () => {
    const text = new TextDecoder().decode(
      writeDxf(leadersDrawing(), {
        version: "2018",
        binary: false,
        precision: 16,
      }).bytes
    )
    const first = text.slice(text.indexOf("LEADER\r\n"))
    const record = first.slice(0, first.indexOf("\r\n  0\r\n"))
    expect(record).toContain("AcDbLeader\r\n  3\r\nISO-25\r\n 73\r\n     0")
    expect(record).toContain(" 74\r\n     0\r\n 75\r\n     1")
    expect(record).not.toContain(" 71\r\n")
    expect(record).toMatch(/340\r\n[0-9A-F]+/)
    expect(text).toContain("102\r\n{ACAD_REACTORS")
    expect(text).toContain(
      "1001\r\nACAD\r\n1000\r\nDSTYLE\r\n1002\r\n{\r\n1070\r\n    40\r\n1040\r\n10.0\r\n1070\r\n    77\r\n1070\r\n     0\r\n1002\r\n}"
    )
  })

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
    for (const name of [
      "fixture-2018",
      "fixture2-2018",
      "points-2018",
      "solids-2018",
      "leaders-2018",
      "linetypes-2018",
    ]) {
      const drawing =
        name === "points-2018"
          ? pointsDrawing()
          : name === "solids-2018"
            ? solidsDrawing()
            : name === "leaders-2018"
              ? leadersDrawing()
              : name === "linetypes-2018"
                ? linetypesDrawing()
                : parseDxf(fixture(name)).drawing
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

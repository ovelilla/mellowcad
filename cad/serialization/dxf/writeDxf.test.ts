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
  unresolvedXref,
  withLeaderOverride,
  withLinetypeScale,
  withNormal,
  withThickness,
} from "../../domain/entities"
import type { Entity, ImageEntity, TableEntity } from "../../domain/entities"
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

/**
 * An ASCII R12 file as AutoCAD opens it, each hatch still the reference to
 * the block of what it draws: its hatch data unnamed, which the reader would
 * otherwise make the hatch of.
 */
function asReferences(bytes: Uint8Array): Uint8Array {
  const text = new TextDecoder("latin1").decode(bytes)
  return Uint8Array.from(
    text.replaceAll("R14_HATCH_DATA", "NO_HATCH_DATA"),
    (c) => c.charCodeAt(0)
  )
}

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

/** A UCS turned and off the plane, current and named, one tilted with a space in its name, the icon off. */
function namedUcsDrawing() {
  const third = {
    origin: { x: 1 / 3, y: 2 / 3, z: 1 / 7 },
    xAxis: { x: Math.cos(0.25), y: Math.sin(0.25), z: 0 },
    yAxis: { x: -Math.sin(0.25), y: Math.cos(0.25), z: 0 },
  }
  const tilted = {
    origin: { x: 10, y: 0, z: 0 },
    xAxis: { x: 1, y: 0, z: 0 },
    yAxis: { x: 0, y: 0, z: 1 },
  }
  return snapshotOf([lineOf(p(0, 0), p(10, 0))], {
    settings: {
      ...snapshotOf([]).settings,
      ucs: third,
      ucsName: "Third",
      namedUcs: [
        { name: "Third", ucs: third },
        { name: "front wall", ucs: tilted },
      ],
      ucsIcon: { visible: false, atOrigin: true },
    },
  })
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

  // R12 (probes dxf/r12.sh, x027 to x032): AutoCAD 2027's console opened each
  // file of the reference drawings and of every kind the DXF_OUT test writes
  // as R12, ASCII and binary, with no AUDIT error, and plotted it as it
  // plots its own R12 of the same drawing.
  for (const name of ["fixture-2018", "fixture2-2018"]) {
    const drawing = parseDxf(fixture(name)).drawing
    for (const binary of [false, true]) {
      it(`writes ${name} as R12${binary ? " binary" : ""}, as AutoCAD's R12 holds it`, () => {
        const { bytes, report } = writeDxf(drawing, {
          version: "R12",
          binary,
          precision: 16,
        })
        expect(report.leftOut.size).toBe(0)
        const back = parseDxf(bytes).drawing
        // What R12 has no object for is gone; the rest is there, as many,
        // each hatch read back from its reference's xdata (dxfR12Hatch.ts).
        const count = (entities: readonly Entity[], type: string) =>
          entities.filter((e) => e.type === type).length
        for (const type of [
          "mtext",
          "ellipse",
          "spline",
          "leader",
          "xline",
          "ray",
        ]) {
          expect(count(back.entities, type)).toBe(0)
        }
        for (const type of [
          "circle",
          "arc",
          "text",
          "dimension",
          "point",
          "hatch",
        ]) {
          expect(count(back.entities, type)).toBe(count(drawing.entities, type))
        }
        expect(back.layers.map((l) => l.name)).toEqual(
          drawing.layers.map((l) => l.name.toUpperCase())
        )
        if (binary) {
          // One byte a code: 0, then SECTION, after the sentinel.
          expect(bytes[22]).toBe(0)
          expect(String.fromCharCode(...bytes.subarray(23, 30))).toBe("SECTION")
        } else {
          const text = new TextDecoder("latin1").decode(bytes)
          expect(text).toContain("$ACADVER\r\n  1\r\nAC1009")
          expect(text).not.toContain("CLASSES")
          expect(text).not.toContain("OBJECTS")
          expect(text).not.toContain("AcDb")
        }
      })
    }
  }

  it("writes R12's tables under R12's names, a TrueType font as txt (x027, f002)", () => {
    const base = snapshotOf([]).layers[0]
    const drawing = snapshotOf(
      [{ ...lineOf(p(0, 0), p(10, 0)), layerId: "walls" }],
      { layers: [base, { ...base, id: "walls", name: "my walls layer" }] }
    )
    const text = new TextDecoder("latin1").decode(
      writeDxf(drawing, { version: "R12", binary: false, precision: 16 }).bytes
    )
    expect(text).toContain("LAYER\r\n  2\r\nMY_WALLS_LAYER\r\n")
    expect(text).toContain("LINE\r\n  5\r\n")
    expect(text).toContain("  8\r\nMY_WALLS_LAYER\r\n")
    expect(text).toContain("STYLE\r\n  2\r\nSTANDARD\r\n")
    expect(text).toContain("  3\r\ntxt\r\n")
  })

  it("writes a true colour in R12 as its nearest index alone, the current one too", () => {
    const drawing = snapshotOf(
      [{ ...lineOf(p(0, 0), p(10, 0)), color: "#ff8000" }],
      {
        settings: {
          ...snapshotOf([]).settings,
          currentColor: "#ff8000",
        },
      }
    )
    const text = new TextDecoder("latin1").decode(
      writeDxf(drawing, { version: "R12", binary: false, precision: 16 }).bytes
    )
    expect(text).toContain("$CECOLOR\r\n 62\r\n    30\r\n")
    expect(text).not.toMatch(/\r\n420\r\n/)
  })

  // gradient/g16's drawing: AutoCAD 2027's console opened each version,
  // ASCII and binary, with no AUDIT error, read 2004 on as its gradients
  // and plotted them as it plots its own file.
  it("writes gradients from 2004, read back the same, and 2000's as AutoCAD does", () => {
    const drawing = parseDxf(fixture("gradients-2018")).drawing
    const gradients = (entities: readonly Entity[]) =>
      entities.flatMap((e) => (e.type === "hatch" ? [e.gradient] : []))
    for (const version of VERSIONS) {
      for (const binary of [false, true]) {
        const { bytes } = writeDxf(drawing, { version, binary, precision: 16 })
        const back = parseDxf(bytes).drawing
        if (version !== "2000") {
          expect(shape(gradients(back.entities))).toEqual(
            shape(gradients(drawing.entities))
          )
          continue
        }
        // g15: 2000 has no gradients; AutoCAD's DXFOUT writes each a SOLID
        // hatch with its colours by index in two applications' xdata, which
        // it reads back as a plain SOLID.
        expect(gradients(back.entities).every((g) => g === undefined)).toBe(
          true
        )
        if (binary) continue
        const text = new TextDecoder().decode(bytes).replace(/\r/g, "")
        expect(text).toContain("1001\nGradientColor1ACI\n1070\n     5\n")
        expect(text).toMatch(
          /AcDbRegAppTableRecord\n {2}2\nGradientColor2ACI\n/
        )
      }
    }
  })

  // r12.sh's gradients and x029's (a layer's colour, a colour of its own, a
  // true colour, a ring): AutoCAD's R12 writes each a `*U` of SOLIDs of the
  // hatch's layer and colour, its reference likewise; the console opened each
  // file with no AUDIT error and plotted it as its own R12.
  it("writes gradients in R12 as a block of SOLIDs each, none left out", () => {
    for (const name of ["gradients-2018", "gradients2-2018"]) {
      const drawing = parseDxf(fixture(name)).drawing
      const { bytes, report } = writeDxf(drawing, {
        version: "R12",
        binary: false,
        precision: 16,
      })
      expect(report.leftOut.size).toBe(0)
      const back = parseDxf(asReferences(bytes)).drawing
      const references = back.entities.filter((e) => e.type === "insert")
      expect(references).toHaveLength(
        drawing.entities.filter((e) => e.type === "hatch").length
      )
      for (const r of references) {
        const block = back.blocks.find(
          (b) => r.type === "insert" && b.id === r.blockId
        )!
        expect(block.name).toMatch(/^\*U\d+$/)
        expect(block.entities.length).toBeGreaterThan(0)
        for (const piece of block.entities) {
          expect(piece.type).toBe("solid2d")
          expect(piece.layerId).toBe(r.layerId)
          expect(piece.color).toBe(r.color)
        }
      }
      if (name === "gradients2-2018") {
        // x029: all four on layer RED, one ByLayer, one green, one 200,100,50.
        const red = back.layers.find((l) => l.name === "RED")!
        expect(references.every((r) => r.layerId === red.id)).toBe(true)
        expect(references.map((r) => r.color).sort()).toEqual(
          ["3", "32", undefined, undefined].sort()
        )
      }
    }
  })

  // x033 (TA and TC locked, TB not), minserts (a locked definition and its
  // two references) and fixture (unlocked): AutoCAD's R12 holds each locked
  // attribute's lock position as AcDbAttr xdata and registers the
  // application only then, as many AcDbAttr lines as here.
  it("writes a locked attribute in R12 with its AcDbAttr xdata, as AutoCAD does", () => {
    for (const [name, count] of [
      ["attlocks-2018", 3],
      ["minserts-2018", 4],
      ["fixture-2018", 0],
    ] as const) {
      const drawing = parseDxf(fixture(name)).drawing
      const { bytes } = writeDxf(drawing, {
        version: "R12",
        binary: false,
        precision: 16,
      })
      const text = new TextDecoder("latin1").decode(bytes)
      expect(text.split("\r\n").filter((l) => l === "AcDbAttr")).toHaveLength(
        count
      )
      if (count > 0) {
        expect(text).toContain(
          "1001\r\nAcDbAttr\r\n1070\r\n     0\r\n1070\r\n     1\r\n"
        )
      }
    }
  })

  // x031, x032: AutoCAD's R12 writes an angular dimension's text in its *D
  // as TEXTs; any other dimension's as a reference to a *U of its TEXT.
  it("writes an angular dimension's text in R12 as TEXTs in its *D block", () => {
    const drawing = parseDxf(fixture("angulars-2018")).drawing
    const { bytes } = writeDxf(drawing, {
      version: "R12",
      binary: false,
      precision: 16,
    })
    const lines = new TextDecoder("latin1").decode(bytes).split("\r\n")
    const blocks = new Map<string, string[]>()
    let current: string[] | null = null
    for (let i = 0; i + 1 < lines.length; i += 2) {
      const [code, value] = [lines[i].trim(), lines[i + 1]]
      if (code === "0" && value === "BLOCK") current = []
      else if (code === "0" && value === "ENDBLK") current = null
      else if (current && code === "2" && current.length === 0)
        blocks.set(value, (current = [value]))
      else if (current && code === "0") current.push(value)
      else if (current && code === "1") current.push(`1:${value}`)
    }
    const dimensionBlocks = [...blocks.values()].filter((b) =>
      b[0].startsWith("*D")
    )
    const angular = dimensionBlocks.filter((b) => b.includes("ARC"))
    expect(angular).toHaveLength(6)
    for (const b of angular) {
      expect(b).toContain("TEXT")
      expect(b).not.toContain("INSERT")
    }
    // The BLOCK's own 1 comes first, its TEXT's last.
    expect(
      angular.map((b) => b.filter((v) => v.startsWith("1:")).at(-1))
    ).toEqual(["1:45?", "1:45?", "1:45?", "1:45?", "1:abc", "1:90?"])
    // The aligned and the linear one keep theirs in a *U.
    for (const b of dimensionBlocks.filter((b) => !b.includes("ARC"))) {
      expect(b).toContain("INSERT")
      expect(b).not.toContain("TEXT")
    }
  })

  it("writes xlines and rays, read back the same", () => {
    const drawing = parseDxf(fixture("xlines-2018")).drawing
    const infinite = (entities: readonly Entity[]) =>
      entities.filter((e) => e.type === "xline" || e.type === "ray")
    for (const version of VERSIONS) {
      for (const binary of [false, true]) {
        const { bytes, report } = writeDxf(drawing, {
          version,
          binary,
          precision: 16,
        })
        expect(report.leftOut.size).toBe(0)
        const back = parseDxf(bytes).drawing
        expect(shape(infinite(back.entities))).toEqual(
          shape(infinite(drawing.entities))
        )
      }
    }
  })

  // minsert/m09's drawing: AutoCAD 2027's console opened each version, ASCII
  // and binary, with no AUDIT error, and plotted them as its own file.
  it("writes MINSERTs, read back the same", () => {
    const drawing = parseDxf(fixture("minserts-2018")).drawing
    const grids = (entities: readonly Entity[]) =>
      entities.flatMap((e) => (e.type === "insert" ? [e.grid] : []))
    for (const version of VERSIONS) {
      for (const binary of [false, true]) {
        const { bytes } = writeDxf(drawing, { version, binary, precision: 16 })
        const back = parseDxf(bytes).drawing
        expect(shape(back.entities)).toEqual(shape(drawing.entities))
        expect(grids(back.entities)).toHaveLength(6)
      }
    }
  })

  it("writes wipeouts and WIPEOUTFRAME, read back the same", () => {
    const drawing = parseDxf(fixture("wipeouts-2018")).drawing
    const wipeouts = (entities: readonly Entity[]) =>
      entities.filter((e) => e.type === "wipeout")
    for (const version of VERSIONS) {
      for (const binary of [false, true]) {
        const { bytes, report } = writeDxf(drawing, {
          version,
          binary,
          precision: 16,
        })
        expect(report.leftOut.size).toBe(0)
        const back = parseDxf(bytes).drawing
        expect(shape(wipeouts(back.entities))).toEqual(
          shape(wipeouts(drawing.entities))
        )
        expect(back.settings.wipeoutFrame).toBe(2)
      }
    }
  })

  // Text and block cells, spans, a scaled one's overrides, turned,
  // mirrored, red on L1, an empty one (table/t10), in every version: from
  // 2007 each value in a CELL_VALUE, before it the text alone (t09), with
  // no data type flag.
  it("writes tables, read back the same", () => {
    const drawing = parseDxf(fixture("tables-2018")).drawing
    const tables = (entities: readonly Entity[]) =>
      entities.filter((e): e is TableEntity => e.type === "table")
    expect(tables(drawing.entities)).toHaveLength(6)
    for (const version of VERSIONS) {
      const legacy = version === "2000" || version === "2004"
      const kept = (entities: readonly Entity[]) =>
        shape(
          tables(entities).map((t) =>
            legacy
              ? {
                  ...t,
                  cells: t.cells.map((c) =>
                    Object.fromEntries(
                      Object.entries(c).filter(([key]) => key !== "flags")
                    )
                  ),
                }
              : t
          )
        )
      for (const binary of [false, true]) {
        const { bytes, report } = writeDxf(drawing, {
          version,
          binary,
          precision: 16,
        })
        expect(report.leftOut.size).toBe(0)
        const back = parseDxf(bytes).drawing
        expect(kept(back.entities)).toEqual(kept(drawing.entities))
      }
    }
  })

  it("writes images and IMAGEFRAME, read back the same", () => {
    const drawing = parseDxf(fixture("images-2018")).drawing
    const images = (entities: readonly Entity[]) =>
      entities.filter((e) => e.type === "image")
    for (const version of VERSIONS) {
      for (const binary of [false, true]) {
        const { bytes, report } = writeDxf(drawing, {
          version,
          binary,
          precision: 16,
        })
        expect(report.leftOut.size).toBe(0)
        const back = parseDxf(bytes).drawing
        expect(shape(images(back.entities))).toEqual(
          shape(images(drawing.entities))
        )
        expect(back.settings.imageFrame).toBe(2)
      }
    }
  })

  it("keeps an image's clip turned off, and names two definitions apart", () => {
    const [read] = parseDxf(fixture("images-2018")).drawing.entities.filter(
      (e): e is ImageEntity => e.type === "image" && e.clip !== undefined
    )
    const off: ImageEntity = { ...read, clip: { ...read.clip!, off: true } }
    const other: ImageEntity = {
      ...read,
      id: "other",
      image: { ...read.image, path: "D:\\elsewhere\\pic.bmp" },
    }
    const drawing = snapshotOf([off, other])
    const { bytes } = writeDxf(drawing, {
      version: "2018",
      binary: false,
      precision: 16,
    })
    const text = new TextDecoder().decode(bytes).replace(/\r/g, "")
    expect(text).toMatch(/\n {2}3\npic\n350\n/)
    expect(text).toMatch(/\n {2}3\npic2\n350\n/)
    const back = parseDxf(bytes).drawing.entities as ImageEntity[]
    expect(back[0].clip?.off).toBe(true)
    expect(back[1].clip?.off).toBeUndefined()
    expect(back.map((e) => e.image.name)).toEqual(["pic", "pic2"])
  })

  it("writes IMAGEFRAME 0 with no image, as RASTERVARIABLES' 70", () => {
    const drawing = snapshotOf([lineOf(p(0, 0), p(10, 0))])
    const off = {
      ...drawing,
      settings: { ...drawing.settings, imageFrame: 0 as const },
    }
    const text = new TextDecoder().decode(
      writeDxf(off, { version: "2018", binary: false, precision: 16 }).bytes
    )
    expect(text.replace(/\r/g, "")).toMatch(
      /AcDbRasterVariables\n 90\n {8}0\n 70\n {5}0\n/
    )
    expect(parseDxf(text).drawing.settings.imageFrame).toBe(0)
  })

  it("writes 3D faces, read back the same", () => {
    const drawing = parseDxf(fixture("faces-2018")).drawing
    const faces = (entities: readonly Entity[]) =>
      entities.filter((e) => e.type === "face3d")
    for (const version of VERSIONS) {
      for (const binary of [false, true]) {
        const { bytes, report } = writeDxf(drawing, {
          version,
          binary,
          precision: 16,
        })
        expect(report.leftOut.size).toBe(0)
        expect(shape(faces(parseDxf(bytes).drawing.entities))).toEqual(
          shape(faces(drawing.entities))
        )
      }
    }
  })

  // mesh/f01: AutoCAD's meshes, written in each version and read back the
  // same; a smoothed one's VERTEXes in AutoCAD's order, the first control
  // vertex (80), the fitted mesh (72), the other control vertices.
  it("writes polygon meshes as AutoCAD does, read back the same", () => {
    const drawing = parseDxf(fixture("meshes-2018")).drawing
    const meshes = (entities: readonly Entity[]) =>
      entities.filter((e) => e.type === "polygonMesh")
    for (const version of VERSIONS) {
      for (const binary of [false, true]) {
        const { bytes, report } = writeDxf(drawing, {
          version,
          binary,
          precision: 16,
        })
        expect(report.leftOut.size).toBe(0)
        expect(shape(meshes(parseDxf(bytes).drawing.entities))).toEqual(
          shape(meshes(drawing.entities))
        )
      }
    }
    const text = new TextDecoder().decode(
      writeDxf(drawing, { version: "2018", binary: false, precision: 16 }).bytes
    )
    const flags = [
      ...text.matchAll(
        /AcDbPolygonMeshVertex\r?\n(?:.*\r?\n){6} *70\r?\n *(\d+)/g
      ),
    ].map((m) => Number(m[1]))
    // The cubic one, third: 1 + 20 + 15 VERTEXes after the first two's 12 + 16.
    const cubic = flags.slice(28, 28 + 36)
    expect(cubic[0]).toBe(80)
    expect(cubic.slice(1, 21).every((f) => f === 72)).toBe(true)
    expect(cubic.slice(21).every((f) => f === 80)).toBe(true)
    expect(text).toContain("AcDbPolygonMesh\r\n 66\r\n     1")
  })

  // xref/p04: AutoCAD's DXFOUT of a drawing whose xref it could not find,
  // the BLOCK empty with flag 4 and its path, the reference kept.
  it("writes an external reference as AutoCAD keeps one it cannot find", () => {
    const drawing = parseDxf(fixture("xref-2018")).drawing
    const labelled = {
      ...drawing,
      blocks: drawing.blocks.map((b) =>
        b.xref ? unresolvedXref(b, `Xref ${b.xref.path}`, "Standard") : b
      ),
    }
    for (const version of VERSIONS) {
      for (const binary of [false, true]) {
        const written = writeDxf(labelled, { version, binary, precision: 16 })
        // The label is never written: an xref's BLOCK holds nothing (and
        // the reader would drop it, so only the bytes can tell).
        expect(new TextDecoder("latin1").decode(written.bytes)).not.toContain(
          "Xref C:"
        )
        const back = parseDxf(written.bytes)
        expect(back.drawing.blocks).toEqual(drawing.blocks)
        expect(back.report.xrefs).toEqual([
          {
            name: "part",
            path: String.raw`C:\Users\oveli\AppData\Local\Temp\mcadxref\sub\part.dwg`,
          },
        ])
        expect(shape(back.drawing.entities)).toEqual(shape(drawing.entities))
      }
    }
    const overlaid = {
      ...labelled,
      blocks: labelled.blocks.map((b) =>
        b.xref ? { ...b, xref: { path: "Shared.dwg", overlay: true } } : b
      ),
    }
    const text = new TextDecoder().decode(
      writeDxf(overlaid, { version: "2018", binary: false, precision: 16 })
        .bytes
    )
    expect(text).toMatch(
      /AcDbBlockBegin\r?\n {2}2\r?\npart\r?\n 70\r?\n {4}12\r?\n/
    )
    expect(text).toMatch(/ {2}1\r?\nShared\.dwg\r?\n {2}0\r?\nENDBLK/)
    expect(parseDxf(text).drawing.blocks[0]?.xref).toEqual({
      path: "Shared.dwg",
      overlay: true,
    })
  })

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

  // x023, x024: AutoCAD writes every saved UCS in the UCS table, the current
  // one's name in $UCSNAME and the UCS in the viewport too, all whole at any
  // precision, and UCSICON in the viewport's 74.
  it("writes the named UCSs, the current one's name and UCSICON, read back the same", () => {
    const drawing = namedUcsDrawing()
    const third = drawing.settings.ucs
    for (const version of VERSIONS) {
      for (const binary of [false, true]) {
        const { bytes } = writeDxf(drawing, { version, binary, precision: 3 })
        const back = parseDxf(bytes).drawing.settings
        expect(shape(back.namedUcs)).toEqual(shape(drawing.settings.namedUcs))
        expect(back.ucsName).toBe("Third")
        expect(shape(back.ucs)).toEqual(shape(third))
        expect(back.ucsIcon).toEqual({ visible: false, atOrigin: true })
      }
    }
    const text = new TextDecoder().decode(
      writeDxf(drawing, { version: "2018", binary: false, precision: 3 }).bytes
    )
    expect(text).toContain(
      "AcDbUCSTableRecord\r\n  2\r\nThird\r\n 70\r\n     0\r\n 10\r\n0.3333333333333333\r\n"
    )
    expect(text).toContain("$UCSNAME\r\n  2\r\nThird\r\n")
    expect(text).toContain("110\r\n0.3333333333333333\r\n")
    // An unnamed UCS: $UCSNAME empty, as AutoCAD writes it.
    const unnamed = new TextDecoder().decode(
      writeDxf(snapshotOf([]), {
        version: "2018",
        binary: false,
        precision: 16,
      }).bytes
    )
    expect(unnamed).toContain("$UCSNAME\r\n  2\r\n\r\n")
    expect(unnamed).toContain(" 74\r\n     3\r\n")
  })

  it("keeps the world saved by name named, and names nothing the table lacks", () => {
    const world = snapshotOf([]).settings
    const named = snapshotOf([], {
      settings: {
        ...world,
        ucsName: "W",
        namedUcs: [{ name: "W", ucs: world.ucs }],
      },
    })
    const bytes = writeDxf(named, {
      version: "2018",
      binary: false,
      precision: 16,
    }).bytes
    expect(parseDxf(bytes).drawing.settings.ucsName).toBe("W")
    // Another program's $UCSNAME with no record of that name.
    const text = new TextDecoder()
      .decode(bytes)
      .replace("$UCSNAME\r\n  2\r\nW\r\n", "$UCSNAME\r\n  2\r\nFOO\r\n")
    expect(parseDxf(text).drawing.settings.ucsName).toBeNull()
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
      "xref-2018",
      "hatchpat-2018",
      "gradients-2018",
      "gradients2-2018",
      "angulars-2018",
      "angulars2-2018",
      "attlocks-2018",
      "faces-2018",
      "wipeouts-2018",
      "xlines-2018",
      "minserts-2018",
      "images-2018",
      "tables-2018",
      "mleaders-2018",
      "ucs-2018",
      "named-ucs",
      // AutoCAD's own R12 of the hatch probes (x034–x046), read as hatches.
      "hatch-lines-R12",
      "hatch-arcs-R12",
      "hatch-ellipses-R12",
      "hatch-splines-R12",
      "hatch-polylines-R12",
      "hatch-kinds-R12",
      "hatch-gradients-R12",
      "hatch-planes-R12",
      "hatch-fills-R12",
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
                : name === "named-ucs"
                  ? namedUcsDrawing()
                  : parseDxf(fixture(name)).drawing
      for (const version of ["R12", ...VERSIONS] as const) {
        for (const binary of [false, true]) {
          const { bytes } = writeDxf(drawing, {
            version,
            binary,
            precision: 16,
          })
          const file = `${name.replace(/-(2018|R12)$/, "")}-${version}${binary ? "b" : ""}.dxf`
          writeFileSync(join(dir, file), bytes)
        }
      }
    }
  })
})

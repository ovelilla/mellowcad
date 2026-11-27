import { readFileSync } from "node:fs"
import { gunzipSync } from "node:zlib"
import { describe, expect, it } from "vitest"
import { Entity } from "../../domain/entities"
import { parseDxf } from "../../serialization/dxf/readDxf"
import { es } from "../../locales/es"
import { ptBR } from "../../locales/pt-BR"
import { createHarness, type CadHarness } from "../../../test/harness"
import { ellipseOf, layerOf, lineOf, p } from "../../../test/builders"

/**
 * CHPROP against the transcripts of AutoCAD 2027's console (probes
 * chprop/p01–p22, traced in en-US, es-ES and pt-BR with QAFLAGS 2): the
 * probe's answers typed here at LUPREC 4, the console's. Where a line differs
 * on purpose, AutoCAD's is beside it.
 */

const RED = "1"

function answer(cad: CadHarness, ...texts: string[]): CadHarness {
  for (const text of texts) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

/** A drawing of `entities` on layers 0, L1 and LK (locked), at LUPREC 4. */
function drawing(
  entities: readonly Entity[],
  locale?: typeof es | typeof ptBR
): CadHarness {
  const cad = createHarness(locale ? { locale } : {})
  cad.runtime.document.load([...entities], {
    layers: [layerOf("0"), layerOf("L1"), layerOf("LK", { locked: true })],
  })
  return answer(cad, "_LUPREC", "4")
}

/** The lines `answers` (`|` between them, an empty one Enter) add to the history. */
function written(cad: CadHarness, answers: string): string[] {
  const from = cad.commandLog().length
  answer(cad, ...answers.split("|"))
  return cad.commandLog().slice(from)
}

/** One of the DXF fixtures, a drawing AutoCAD 2018 saved. */
function fixture(name: string) {
  const url = new URL(
    `../../serialization/dxf/fixtures/${name}`,
    import.meta.url
  )
  return parseDxf(gunzipSync(readFileSync(url)).toString("latin1")).drawing
}

/** p100's drawing: a region, a box, a 2D solid, a 3D face, a 3DMESH, an xline and a ray. */
function typesOfP100(locale?: typeof es): CadHarness {
  const cad = drawing([], locale)
  answer(cad, "_ZOOM", "_W", "-100,-100", "200,200")
  answer(cad, "_CIRCLE", "0,0", "2", "_REGION", "_L", "")
  answer(cad, "_BOX", "10,0,0", "12,2,0", "2")
  answer(cad, "_SOLID", "20,0", "22,0", "20,2", "22,2", "")
  answer(cad, "_3DFACE", "30,0", "32,0", "32,2", "30,2", "")
  answer(cad, "_3DMESH", "2", "2", "40,0,0", "42,0,0", "40,2,0", "42,2,0")
  answer(cad, "_XLINE", "0,50", "10,50", "")
  return answer(cad, "_RAY", "0,60", "10,60", "")
}

function entity(cad: CadHarness, id: string): Entity {
  return cad.runtime.document.get(id)!
}

const line = (id = "l1") => lineOf(p(0, 0), p(10, 0), { id })

/** A line wearing p02's second line's properties, all of them its own. */
function dressed(id: string): Entity {
  return {
    ...lineOf(p(0, 5), p(10, 5), { id, layerId: "L1" }),
    color: RED,
    linetype: "Continuous",
    lineweight: 0.3,
    thickness: 3,
  }
}

const PROPERTY =
  "Enter property to change [Color/LAyer/LType/ltScale/LWeight/Thickness]:"

describe("CHPROP against AutoCAD 2027's console in English", () => {
  it("asks each property again until Enter, offering the set's value (p01)", () => {
    const cad = drawing([line("a"), lineOf(p(0, 5), p(10, 5), { id: "b" })])
    expect(written(cad, "_CHPROP|_ALL||_C||_LA||_LT||_LW||_T||")).toEqual([
      "CHPROP",
      "Select objects: _ALL",
      "2 found",
      "Select objects:",
      // AutoCAD: `[Color/LAyer/LType/ltScale/LWeight/Thickness/TRansparency/Material/Annotative]`.
      `${PROPERTY} _C`,
      // AutoCAD: `[Truecolor/COlorbook]`, as -COLOR's.
      "New color [Truecolor] <BYLAYER>:",
      `${PROPERTY} _LA`,
      "Enter new layer name <0>:",
      `${PROPERTY} _LT`,
      "Enter new linetype name <ByLayer>:",
      `${PROPERTY} _LW`,
      "Enter new lineweight <ByLayer>:",
      `${PROPERTY} _T`,
      "Specify new thickness <0.0000>:",
      PROPERTY,
    ])
    expect(cad.state().activeToolId).toBe("select")
    expect(entity(cad, "a")).toEqual(line("a"))
  })

  it("offers varies where the objects differ, and Enter keeps each one's own (p02)", () => {
    const cad = drawing([line("a"), dressed("b")])
    const lines = written(cad, "_CHPROP|_ALL||_C||_LA||_LT||_LW||_T||")
    expect(lines.filter((l) => l.includes("<"))).toEqual([
      "New color [Truecolor] <varies>:",
      "Enter new layer name <varies>:",
      "Enter new linetype name <varies>:",
      "Enter new lineweight <varies>:",
      "Specify new thickness <varies>:",
    ])
    expect(entity(cad, "a")).toEqual(line("a"))
    expect(entity(cad, "b")).toEqual(dressed("b"))
  })

  it("offers the value the objects share (p02b)", () => {
    const cad = drawing([dressed("a"), dressed("b")])
    const lines = written(cad, "_CHPROP|_ALL||_C||_LA||_LT||_LW||_T||")
    expect(lines.filter((l) => l.includes("<"))).toEqual([
      "New color [Truecolor] <1 (red)>:",
      "Enter new layer name <L1>:",
      "Enter new linetype name <Continuous>:",
      "Enter new lineweight <0.30 mm>:",
      "Specify new thickness <3.0000>:",
    ])
  })

  it("takes a colour number and refuses what -COLOR refuses (p03)", () => {
    const cad = drawing([line()])
    expect(written(cad, "_CHPROP|_L||_C|0|256|-1|FOO|1.5|3|_C||")).toEqual([
      "CHPROP",
      "Select objects: _L",
      "1 found",
      "Select objects:",
      `${PROPERTY} _C`,
      "New color [Truecolor] <BYLAYER>: 0",
      "Invalid color number.",
      "New color [Truecolor] <BYLAYER>: 256",
      "Invalid color number.",
      "New color [Truecolor] <BYLAYER>: -1",
      "Invalid color number.",
      "New color [Truecolor] <BYLAYER>: FOO",
      "A color number or standard color name is required.",
      "New color [Truecolor] <BYLAYER>: 1.5",
      "A color number or standard color name is required.",
      "New color [Truecolor] <BYLAYER>: 3",
      // The value this run gave it, not the object's yet.
      `${PROPERTY} _C`,
      "New color [Truecolor] <3 (green)>:",
      PROPERTY,
    ])
    expect(entity(cad, "l1").color).toBe("3")
  })

  it("takes a colour's name and BYLAYER, and asks which BY is (p04)", () => {
    const cad = drawing([line()])
    answer(cad, "_CHPROP", "_L", "", "_C", "red", "")
    expect(entity(cad, "l1").color).toBe(RED)
    answer(cad, "_CHPROP", "_L", "", "_C", "_BYLAYER", "")
    expect(entity(cad, "l1").color).toBeUndefined()
    answer(cad, "_CHPROP", "_L", "", "_C", "_Green", "")
    expect(entity(cad, "l1").color).toBe("3")
    expect(written(cad, "_CHPROP|_L||_C|BY")).toEqual([
      "CHPROP",
      "Select objects: _L",
      "1 found",
      "Select objects:",
      `${PROPERTY} _C`,
      "New color [Truecolor] <3 (green)>: BY",
      "Ambiguous response, please clarify...",
    ])
    expect(cad.state().commandLine.prompt).toBe("CHPROP BYBlock or BYLayer?")
  })

  it("takes a true colour, and asks again for a wrong one (p05)", () => {
    const cad = drawing([line()])
    expect(written(cad, "_CHPROP|_L||_C|_T|300,0,0|1,2||255,0,0|")).toEqual([
      "CHPROP",
      "Select objects: _L",
      "1 found",
      "Select objects:",
      `${PROPERTY} _C`,
      "New color [Truecolor] <BYLAYER>: _T",
      "Red,Green,Blue: 300,0,0",
      "Invalid color.  Type three comma separated values from 0 to 255.",
      "Red,Green,Blue: 1,2",
      "Invalid color.  Type three comma separated values from 0 to 255.",
      "Red,Green,Blue:",
      "Invalid color.  Type three comma separated values from 0 to 255.",
      "Red,Green,Blue: 255,0,0",
      PROPERTY,
    ])
    // A true colour, kept apart from index 1 (colors/c01).
    expect(entity(cad, "l1").color).toBe("#ff0000")
  })

  it("finds a layer by its name in any case, and asks again for one it cannot find (p06)", () => {
    const cad = drawing([line()])
    expect(written(cad, "_CHPROP|_L||_LA|FOO|*|l1|_LA||")).toEqual([
      "CHPROP",
      "Select objects: _L",
      "1 found",
      "Select objects:",
      `${PROPERTY} _LA`,
      "Enter new layer name <0>: FOO",
      'Cannot find layer "FOO".',
      "Enter new layer name <0>: *",
      "Invalid layer name.",
      "Enter new layer name <0>: l1",
      `${PROPERTY} _LA`,
      "Enter new layer name <L1>:",
      PROPERTY,
    ])
    expect(entity(cad, "l1").layerId).toBe("L1")
  })

  it("sets a loaded linetype or ByLayer, and says one it does not have (p07, p20)", () => {
    const cad = drawing([line()])
    expect(written(cad, "_CHPROP|_L||_LT|FOO|_LT|?|dashed|")).toEqual([
      "CHPROP",
      "Select objects: _L",
      "1 found",
      "Select objects:",
      `${PROPERTY} _LT`,
      "Enter new linetype name <ByLayer>: FOO",
      'Linetype "FOO" not found.  Use LINETYPE command to load it.',
      `${PROPERTY} _LT`,
      "Enter new linetype name <ByLayer>: ?",
      "Invalid linetype name.",
      // AutoCAD writes `DASHED`, as acadiso.lin names it (properties.md).
      "Enter new linetype name <ByLayer>: dashed",
      PROPERTY,
    ])
    expect(entity(cad, "l1").linetype).toBe("DASHED")
    answer(cad, "_CHPROP", "_L", "", "_LT", "bylayer", "")
    expect(entity(cad, "l1").linetype).toBeUndefined()
  })

  it("sets a lineweight as -LWEIGHT reads it, `?` asked again in -LWEIGHT's words (p09)", () => {
    const cad = drawing([line()])
    expect(
      written(cad, "_CHPROP|_L||_LW|-1|FOO|2.2|_LW|?||_LW|0|_LW||")
    ).toEqual([
      "CHPROP",
      "Select objects: _L",
      "1 found",
      "Select objects:",
      `${PROPERTY} _LW`,
      "Enter new lineweight <ByLayer>: -1",
      "Invalid lweight number.",
      "Enter new lineweight <ByLayer>: FOO",
      "A weight in lineweight units is required.",
      "Enter new lineweight <ByLayer>: 2.2",
      "Lineweight rounded to nearest valid value of 2.11 mm",
      `${PROPERTY} _LW`,
      "Enter new lineweight <2.11 mm>: ?",
      // AutoCAD's first line: `ByLayer   ByBlock      Default` (-LWEIGHT's Missing).
      [
        "ByLayer",
        "0.00 mm 0.05 mm  0.09 mm    0.13 mm 0.15 mm  0.18 mm",
        "0.20 mm 0.25 mm  0.30 mm    0.35 mm 0.40 mm  0.50 mm",
        "0.53 mm 0.60 mm  0.70 mm    0.80 mm 0.90 mm  1.00 mm",
        "1.06 mm 1.20 mm  1.40 mm    1.58 mm 2.00 mm  2.11 mm",
      ].join("\n"),
      "Enter default lineweight for new objects or [?]:",
      `${PROPERTY} _LW`,
      "Enter new lineweight <2.11 mm>: 0",
      `${PROPERTY} _LW`,
      "Enter new lineweight <None>:",
      PROPERTY,
    ])
    expect(entity(cad, "l1").lineweight).toBe(0)
    answer(cad, "_CHPROP", "_L", "", "_LW", "bylayer", "")
    expect(entity(cad, "l1").lineweight).toBeUndefined()
  })

  it("takes any thickness as a distance, two points too (p10, p08b)", () => {
    const cad = drawing([line()])
    expect(written(cad, "_CHPROP|_L||_T|FOO|-5|")).toEqual([
      "CHPROP",
      "Select objects: _L",
      "1 found",
      "Select objects:",
      `${PROPERTY} _T`,
      "Specify new thickness <0.0000>: FOO",
      "Requires numeric distance or two points.",
      "Specify new thickness <0.0000>: -5",
      PROPERTY,
    ])
    expect(entity(cad, "l1")).toMatchObject({ thickness: -5 })
    answer(cad, "_CHPROP", "_L", "", "_T", "0,0", "3,4", "")
    expect(entity(cad, "l1")).toMatchObject({ thickness: 5 })
  })

  it("names each type that has no thickness once, as it ends, in the set's order (p11, p11d, p11e)", () => {
    const cad = drawing([
      line(),
      ellipseOf(p(5, 10), p(5, 0), 0.4),
      ellipseOf(p(5, 20), p(5, 0), 0.4),
    ])
    answer(cad, "_SPLINE", "0,30", "5,35", "10,30", "")
    answer(cad, "_3DPOLY", "0,40", "10,40", "")
    answer(cad, "_-TEXT", "20,30", "2", "0", "Hola")
    expect(written(cad, "_CHPROP|_ALL||_T|5|_T|6|").slice(-4)).toEqual([
      PROPERTY,
      "Cannot change thickness for 3D Polylines.",
      "Cannot change thickness for SPLINE.",
      "Cannot change thickness for ELLIPSE.",
    ])
    expect(entity(cad, "l1")).toMatchObject({ thickness: 6 })
  })

  it("names a hatch and a dimension, an MTEXT, and references as BLOCKs (p11, p11d)", () => {
    const cad = drawing([line()])
    answer(cad, "_ZOOM", "_W", "-20,-20", "60,60")
    answer(cad, "_DIMLINEAR", "0,0", "10,0", "5,-5")
    answer(cad, "_RECTANG", "30,30", "35,35", "_-HATCH", "_S", "_L", "", "")
    expect(written(cad, "_CHPROP|_ALL||_T|5|").slice(-2)).toEqual([
      "Cannot change thickness for HATCH.",
      "Cannot change thickness for DIMENSION.",
    ])
    const refs = drawing([])
    answer(refs, "_ZOOM", "_W", "-20,-20", "60,60")
    answer(refs, "_-MTEXT", "0,30", "_H", "2", "40,40", "Hola", "")
    answer(refs, "_LINE", "0,0", "10,0", "", "_-BLOCK", "B1", "0,0", "_L", "")
    answer(refs, "_-INSERT", "B1", "20,0", "1", "1", "0")
    expect(written(refs, "_CHPROP|_ALL||_T|5|").slice(-2)).toEqual([
      "Cannot change thickness for BLOCKs.",
      "Cannot change thickness for MTEXT.",
    ])
  })

  it("names them in the order they were picked (p11e)", () => {
    const cad = drawing([ellipseOf(p(5, 10), p(5, 0), 0.4)])
    answer(cad, "_SPLINE", "0,20", "5,25", "10,20", "")
    answer(cad, "_ZOOM", "_W", "-20,-20", "60,60")
    expect(written(cad, "_CHPROP|5,25|10,10||_T|5|").slice(-2)).toEqual([
      "Cannot change thickness for SPLINE.",
      "Cannot change thickness for ELLIPSE.",
    ])
  })

  it("names a region, a solid, a 3D face, a mesh, an xline and a ray each by its own word (p100)", () => {
    const cad = typesOfP100()
    expect(written(cad, "_CHPROP|_ALL||_T|5|_S|2|").slice(-6)).toEqual([
      "Cannot change thickness for RAY.",
      "Cannot change thickness for XLINE.",
      "Cannot change thickness for 3D Polygon Meshes.",
      "Cannot change thickness for 3DFACEs.",
      "Cannot change thickness for 3DSOLID.",
      "Cannot change thickness for REGION.",
    ])
  })

  it("names a wipeout, an image, a table, a multileader and a leader each, references as BLOCKs once (p101)", () => {
    const cad = drawing([])
    answer(cad, "_ZOOM", "_W", "-100,-100", "200,200")
    answer(cad, "_WIPEOUT", "0,0", "4,0", "4,4", "0,4", "")
    const images = fixture("images-2018.dxf.gz")
    const tables = fixture("tables-2018.dxf.gz")
    const mleaders = fixture("mleaders-2018.dxf.gz")
    const doc = cad.runtime.document
    doc.load(
      [
        ...doc.getEntities(),
        images.entities.find((e) => e.type === "image")!,
        tables.entities.find((e) => e.type === "table")!,
        mleaders.entities.find((e) => e.type === "mleader")!,
      ],
      {
        layers: doc.getLayers(),
        blocks: [...doc.getBlocks(), ...tables.blocks, ...mleaders.blocks],
      }
    )
    answer(cad, "_LEADER", "50,0", "60,10", "", "Single", "")
    answer(cad, "_CIRCLE", "70,0", "1", "_-BLOCK", "B1", "70,0", "_L", "")
    answer(cad, "_MINSERT", "B1", "80,0", "1", "1", "0", "2", "2", "5", "5")
    answer(cad, "_CIRCLE", "100,0", "1", "_ARRAYRECT", "_L", "", "_X")
    answer(
      cad,
      "_PLINE",
      "120,0",
      "125,5",
      "130,0",
      "",
      "_PEDIT",
      "_L",
      "_F",
      ""
    )
    expect(written(cad, "_CHPROP|_ALL||_T|5|_S|2|").slice(-7)).toEqual([
      "Cannot change thickness for BLOCKs.",
      "Cannot change thickness for MTEXT.",
      "Cannot change thickness for LEADER.",
      "Cannot change thickness for MULTILEADER.",
      "Cannot change thickness for ACAD_TABLE.",
      "Cannot change thickness for IMAGE.",
      "Cannot change thickness for WIPEOUT.",
    ])
  })

  it("says nothing of a thickness Enter kept (p11b)", () => {
    const cad = drawing([line(), ellipseOf(p(5, 10), p(5, 0), 0.4)])
    expect(written(cad, "_CHPROP|_ALL||_T||").slice(-1)).toEqual([PROPERTY])
  })

  it("says each object on a locked layer, counts it and leaves it out (p13, p13b)", () => {
    const cad = drawing([
      line("a"),
      lineOf(p(0, 5), p(10, 5), { id: "b", layerId: "LK" }),
      lineOf(p(0, 10), p(10, 10), { id: "c", layerId: "LK" }),
    ])
    expect(written(cad, "_CHPROP|_ALL||_C|1|")).toEqual([
      "CHPROP",
      "Select objects: _ALL",
      "The object is on a locked layer.",
      "The object is on a locked layer.",
      "3 found",
      "2 were on a locked layer.",
      "Select objects:",
      `${PROPERTY} _C`,
      "New color [Truecolor] <BYLAYER>: 1",
      PROPERTY,
    ])
    expect(entity(cad, "a").color).toBe(RED)
    expect(entity(cad, "b").color).toBeUndefined()
  })

  it("takes a preselection at once, its locked objects said (p13b, p14)", () => {
    const cad = drawing([
      line("a"),
      lineOf(p(0, 5), p(10, 5), { id: "b", layerId: "LK" }),
    ])
    cad.runtime.selection.set(["a", "b"])
    expect(written(cad, "_CHPROP|_C|3|")).toEqual([
      "CHPROP",
      "The object is on a locked layer.",
      "2 found",
      "1 was on a locked layer.",
      `${PROPERTY} _C`,
      "New color [Truecolor] <BYLAYER>: 3",
      PROPERTY,
    ])
    expect(entity(cad, "a").color).toBe("3")
  })

  it("is one step U and REDO name CHPROP, however many properties it set (p16)", () => {
    const cad = drawing([line()])
    answer(cad, "_CHPROP", "_L", "", "_C", "1", "_LA", "L1", "_T", "2", "")
    expect(entity(cad, "l1")).toMatchObject({
      color: RED,
      layerId: "L1",
      thickness: 2,
    })
    expect(written(cad, "_U")).toEqual(["U", "CHPROP"])
    expect(entity(cad, "l1")).toEqual(line())
    expect(written(cad, "_REDO")).toEqual([
      "REDO",
      "CHPROP",
      "Everything has been redone",
    ])
    expect(entity(cad, "l1")).toMatchObject({ layerId: "L1", thickness: 2 })
  })

  it("changes nothing on Escape: what it set waits for Enter (p21)", () => {
    const cad = drawing([line()])
    answer(cad, "_CHPROP", "_L", "", "_C", "1", "_T", "4")
    expect(entity(cad, "l1")).toEqual(line())
    cad.escape()
    expect(entity(cad, "l1")).toEqual(line())
    expect(cad.state().activeToolId).toBe("select")
  })

  it("refuses an option it does not have, and ends on an empty set (p17)", () => {
    const cad = drawing([line()])
    expect(written(cad, "_CHPROP|")).toEqual(["CHPROP", "Select objects:"])
    expect(cad.state().activeToolId).toBe("select")
    expect(written(cad, "_CHPROP|_L||FOO").slice(-2)).toEqual([
      `${PROPERTY} FOO`,
      "Invalid option keyword.",
    ])
  })

  it("cannot run transparently, but 'ZOOM runs at its prompts (p15)", () => {
    const cad = drawing([line()])
    answer(cad, "_LINE", "0,5", "'_CHPROP")
    expect(cad.commandLog()).toContain(
      "** That command may not be invoked transparently **"
    )
    answer(cad, "10,5", "", "_CHPROP", "_L", "", "_C", "'_ZOOM", "_E", "2")
    expect(cad.commandLog()).toContain("Resuming CHPROP command.")
    answer(cad, "_LA", "'_ZOOM")
    expect(cad.commandLog().slice(-1)).toEqual(['Cannot find layer "\'_ZOOM".'])
    answer(cad, "", "")
    expect(cad.runtime.document.getEntities().at(-1)?.color).toBe("2")
  })

  it("refuses another prompt's keyword and _BYLAYER where each prompt refuses them (p103)", () => {
    const cad = drawing([line()])
    const lines = written(
      cad,
      "_CHPROP|_L||_C|_LA|_S||_LA|_C|_BYLAYER||_LT|_BYLAYER|_LW|_BYLAYER|_S|FOO|1/2|_T|1e1|"
    )
    expect(lines.slice(4)).toEqual([
      `${PROPERTY} _C`,
      "New color [Truecolor] <BYLAYER>: _LA",
      "A color number or standard color name is required.",
      "New color [Truecolor] <BYLAYER>: _S",
      "A color number or standard color name is required.",
      "New color [Truecolor] <BYLAYER>:",
      `${PROPERTY} _LA`,
      "Enter new layer name <0>: _C",
      'Cannot find layer "_C".',
      "Enter new layer name <0>: _BYLAYER",
      'Cannot find layer "_BYLAYER".',
      "Enter new layer name <0>:",
      `${PROPERTY} _LT`,
      "Enter new linetype name <ByLayer>: _BYLAYER",
      `${PROPERTY} _LW`,
      "Enter new lineweight <ByLayer>: _BYLAYER",
      `${PROPERTY} _S`,
      "Specify new linetype scale <1.0000>: FOO",
      "Requires numeric distance or two points.",
      "Specify new linetype scale <1.0000>: 1/2",
      `${PROPERTY} _T`,
      "Specify new thickness <0.0000>: 1e1",
      PROPERTY,
    ])
    expect(entity(cad, "l1")).toMatchObject({
      linetypeScale: 0.5,
      thickness: 10,
    })
  })

  it("refuses 'LINE at its prompts, where 'ORTHOMODE runs (p104)", () => {
    const cad = drawing([line()])
    const lines = written(
      cad,
      "_CHPROP|_L||'_LINE|'ORTHOMODE|1|_T|'ORTHOMODE|0|3|_C|'_LINE|2|"
    )
    // AutoCAD echoes `'_LINE` as typed; the history here writes the
    // command's name (`'LINE`), the command line's convention (LINE review).
    expect(lines.slice(4)).toEqual([
      `${PROPERTY} 'LINE`, // AutoCAD '_LINE
      "** That command may not be invoked transparently **",
      "Invalid option keyword.",
      `${PROPERTY} 'ORTHOMODE`,
      ">>Enter new value for ORTHOMODE <0>: 1",
      "Resuming CHPROP command.",
      `${PROPERTY} _T`,
      "Specify new thickness <0.0000>: 'ORTHOMODE",
      ">>Enter new value for ORTHOMODE <1>: 0",
      "Resuming CHPROP command.",
      "Specify new thickness <0.0000>: 3",
      `${PROPERTY} _C`,
      "New color [Truecolor] <BYLAYER>: 'LINE", // AutoCAD '_LINE
      "** That command may not be invoked transparently **",
      "A color number or standard color name is required.",
      "New color [Truecolor] <BYLAYER>: 2",
      PROPERTY,
    ])
    expect(entity(cad, "l1")).toMatchObject({ color: "2", thickness: 3 })
  })

  it("takes back with one U the linetype it loaded from acad.lin (p105)", () => {
    const cad = drawing([line()])
    answer(cad, "_CHPROP", "_L", "", "_LT", "DASHED2", "")
    expect(entity(cad, "l1").linetype).toBe("DASHED2")
    expect(written(cad, "_U")).toEqual(["U", "CHPROP"])
    expect(entity(cad, "l1").linetype).toBeUndefined()
    expect(cad.runtime.document.getLinetype("DASHED2")).toBeUndefined()
  })

  it("reads a command's name at the property prompt as a wrong keyword, and as a layer's name (p106)", () => {
    const cad = drawing([line()])
    const lines = written(cad, "_CHPROP|_L||_C|1|_LINE|_LA|LINE||")
    expect(lines.slice(6)).toEqual([
      `${PROPERTY} _LINE`,
      "Invalid option keyword.",
      `${PROPERTY} _LA`,
      "Enter new layer name <0>: LINE",
      'Cannot find layer "LINE".',
      "Enter new layer name <0>:",
      PROPERTY,
    ])
    expect(entity(cad, "l1").color).toBe("1")
  })

  it("leaves LASTPOINT where it was after two points at Thickness or ltScale (p107)", () => {
    const cad = drawing([line()])
    answer(cad, "_ZOOM", "_W", "-20,-20", "60,60", "_ID", "1,1,0")
    expect(written(cad, "_CHPROP|_L||_T|0,0|3,4|").slice(5)).toEqual([
      "Specify new thickness <0.0000>: 0,0",
      " Specify second point: 3,4",
      PROPERTY,
    ])
    answer(cad, "_ID", "@")
    expect(cad.commandLog().at(-1)).toBe(
      " X = 1.0000     Y = 1.0000     Z = 0.0000"
    )
    answer(cad, "_ID", "7,7,0", "_CHPROP", "_L", "", "_S", "20,20", "23,24", "")
    expect(entity(cad, "l1").linetypeScale).toBe(5)
    answer(cad, "_ID", "@")
    expect(cad.commandLog().at(-1)).toBe(
      " X = 7.0000     Y = 7.0000     Z = 0.0000"
    )
  })

  it("offers <varies> for a thick line and an ellipse (p108)", () => {
    const cad = drawing([
      { ...line("a"), thickness: 3 },
      ellipseOf(p(5, 10), p(5, 0), 0.4),
    ])
    expect(written(cad, "_CHPROP|_ALL||_T||")).toContain(
      "Specify new thickness <varies>:"
    )
  })

  it("offers a true colour as it reads back, <255,0,0> (p05)", () => {
    const cad = drawing([line()])
    answer(cad, "_CHPROP", "_L", "", "_C", "_T", "255,0,0", "")
    answer(cad, "_CHPROP", "_L", "", "_C")
    expect(cad.state().commandLine.prompt).toBe(
      "CHPROP New color [Truecolor] <255,0,0>:"
    )
  })

  it("keeps the set selected and unchanged while it asks, and changes it at Enter (desktop d01, p21, p110)", () => {
    const cad = drawing([line(), ellipseOf(p(5, 10), p(5, 0), 0.4)])
    answer(cad, "_CHPROP", "_ALL", "", "_C", "1")
    // AutoCAD's set stays highlighted, its colour unchanged, until the
    // property prompt's Enter (chprop/d01-1, d01-2).
    expect(cad.selectedIds()).toHaveLength(2)
    expect(entity(cad, "l1").color).toBeUndefined()
    answer(cad, "_LA")
    cad.escape()
    expect(entity(cad, "l1").color).toBeUndefined()
    answer(cad, "_CHPROP", "_ALL", "", "_C", "1", "")
    expect(entity(cad, "l1").color).toBe(RED)
    expect(cad.selectedIds()).toEqual([])
  })

  it("leaves nothing selected after a preselection or a set (p109)", () => {
    const cad = drawing([line()])
    cad.runtime.selection.set(["l1"])
    answer(cad, "_CHPROP", "_C", "2", "")
    expect(cad.selectedIds()).toEqual([])
    answer(cad, "_CHPROP", "_ALL", "", "_C", "3", "")
    expect(cad.selectedIds()).toEqual([])
  })
})

describe("CHPROP in AutoCAD 2027's other languages", () => {
  it("speaks Spanish AutoCAD's words (p02, p04s, p07s, p09s, p19)", () => {
    const cad = drawing([line("a"), dressed("b")], es)
    expect(written(cad, "CAMBPROP|_ALL||CO||")).toEqual([
      "CAMBPROP",
      "Designe objetos: _ALL",
      "2 encontrados",
      "Designe objetos:",
      "Indique propiedad que cambiar [COlor/Capa/Tlínea/Escalatl/Grosorl/Alt-objeto]: CO",
      "Nuevo color [COlorverdadero] <varía>:",
      "Indique propiedad que cambiar [COlor/Capa/Tlínea/Escalatl/Grosorl/Alt-objeto]:",
    ])
    const one = drawing([line()], es)
    const lines = written(
      one,
      "CAMBPROP|_L||CO|rojo|C|FOO||T|BYLAYER|G|porcapa|A|4|CO|C|T|FOO|"
    )
    expect(lines.filter((l) => !l.startsWith("Indique propiedad"))).toEqual([
      "CAMBPROP",
      "Designe objetos: _L",
      "1 encontrados",
      "Designe objetos:",
      "Nuevo color [COlorverdadero] <PORCAPA>: rojo",
      "Indique nuevo nombre de capa <0>: FOO",
      'No se puede encontrar capa "FOO".',
      "Indique nuevo nombre de capa <0>:",
      "Indique nuevo nombre de tipo de línea <PorCapa>: BYLAYER",
      "Indique el nuevo grosor de línea <PorCapa>: porcapa",
      "Precise nueva alt-objeto <0.0000>: 4",
      "Nuevo color [COlorverdadero] <1 (rojo)>: C",
      "Indique nuevo nombre de tipo de línea <PorCapa>: FOO",
      'Tipo de línea "FOO" no encontrado. Utilice TIPOLIN para cargarlo.',
    ])
    expect(entity(one, "l1")).toMatchObject({ thickness: 4 })
    expect(entity(one, "l1").color).toBeUndefined()
  })

  it("refuses in Spanish AutoCAD's words, ltScale's included (p103 es-ES, p104 es-ES)", () => {
    const cad = drawing([line()], es)
    const lines = written(
      cad,
      "_CHPROP|_L||_C|_LA|_S||_LA|_C|_BYLAYER||_LT|_BYLAYER|_LW|_BYLAYER|_S|FOO|1/2|_T|1e1|"
    )
    expect(lines.filter((l) => !l.startsWith("Indique propiedad"))).toEqual([
      "CAMBPROP",
      "Designe objetos: _L",
      "1 encontrados",
      "Designe objetos:",
      "Nuevo color [COlorverdadero] <PORCAPA>: _LA",
      "Se necesita un número o nombre de color normalizado.",
      "Nuevo color [COlorverdadero] <PORCAPA>: _S",
      "Se necesita un número o nombre de color normalizado.",
      "Nuevo color [COlorverdadero] <PORCAPA>:",
      "Indique nuevo nombre de capa <0>: _C",
      'No se puede encontrar capa "_C".',
      "Indique nuevo nombre de capa <0>: _BYLAYER",
      'No se puede encontrar capa "_BYLAYER".',
      "Indique nuevo nombre de capa <0>:",
      "Indique nuevo nombre de tipo de línea <PorCapa>: _BYLAYER",
      "Indique el nuevo grosor de línea <PorCapa>: _BYLAYER",
      "Precise nueva escala del tipo de línea <1.0000>: FOO",
      "Requiere una distancia numérica o dos puntos.",
      "Precise nueva escala del tipo de línea <1.0000>: 1/2",
      "Precise nueva alt-objeto <0.0000>: 1e1",
    ])
    const transparent = written(
      drawing([line()], es),
      "_CHPROP|_L||'_LINE|'ORTHOMODE|1|"
    )
    expect(transparent).toContain(
      "** Este comando no funciona de forma transparente **"
    )
    expect(transparent).toContain("Reanudando el comando CAMBPROP.")
  })

  it("names p100's types in Spanish AutoCAD's words (p100 es-ES)", () => {
    const cad = typesOfP100(es)
    expect(written(cad, "_CHPROP|_ALL||_T|5|_S|2|").slice(-6)).toEqual([
      "Imposible cambiar la altura de objeto de RAY.",
      "Imposible cambiar la altura de objeto de XLINE.",
      "Imposible cambiar la altura de objeto de Mallas poligonales 3D.",
      "Imposible cambiar la altura de objeto de 3DCARAs.",
      "Imposible cambiar la altura de objeto de 3DSOLID.",
      "Imposible cambiar la altura de objeto de REGION.",
    ])
  })

  it("speaks Brazilian Portuguese AutoCAD's words (p02, p11, p13b, p16)", () => {
    const cad = drawing([line(), ellipseOf(p(5, 10), p(5, 0), 0.4)], ptBR)
    expect(written(cad, "ALTPROP|_ALL||C||UR|5|")).toEqual([
      "ALTPROP",
      "Selecionar objetos: _ALL",
      "2 encontrado(s)",
      "Selecionar objetos:",
      "Inserir propriedade a alterar [Cor/CAmada/TIpolinha/escalaTL/ESplinha/espessURa]: C",
      "Nova cor [Truecolor] <PORCAMADA>:",
      "Inserir propriedade a alterar [Cor/CAmada/TIpolinha/escalaTL/ESplinha/espessURa]: UR",
      "Especificar nova espessura <0.0000>: 5",
      "Inserir propriedade a alterar [Cor/CAmada/TIpolinha/escalaTL/ESplinha/espessURa]:",
      "Não é possível alterar a espessura para ELLIPSE.",
    ])
    expect(written(cad, "_U")).toEqual(["D", "ALTPROP"])
  })
})

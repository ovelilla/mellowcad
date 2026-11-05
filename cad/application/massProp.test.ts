import { describe, expect, it } from "vitest"

import {
  type CadHarness,
  MemoryFileTransport,
  createHarness,
} from "../../test/harness"
import { es } from "../locales/es"
import { ptBR } from "../locales/pt-BR"

/** Each answer typed at the command line and confirmed, as the console types it. */
function answer(cad: CadHarness, ...texts: string[]): CadHarness {
  for (const text of texts) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

/** The lines `texts` add to the history, one per line, the blank ones left out as the probes' are. */
function written(cad: CadHarness, ...texts: string[]): string[] {
  const from = cad.commandLog().length
  answer(cad, ...texts)
  return cad
    .commandLog()
    .slice(from)
    .flatMap((entry) => entry.split("\n"))
    .filter((line) => line.trim() !== "")
}

/** What MASSPROP reports of `select`, from its first line to its question. */
function massprop(cad: CadHarness, ...select: string[]): string[] {
  const lines = written(cad, "_MASSPROP", ...select, "", "_N")
  const from = lines.findIndex(
    (line) => /-{16}/.test(line) || /(ignored|ignorada|ignoradas)\.$/.test(line)
  )
  expect(lines.at(-1)).toMatch(/\[(Yes\/No|Sí\/No|Sim\/Não)\] <N>: _N$/)
  return lines.slice(from, -1)
}

/** The same lines, each number within 1e-8 of AutoCAD's. */
function expectNear(actual: readonly string[], expected: readonly string[]) {
  const numbers = /-?\d+\.\d+/g
  expect(actual.map((line) => line.replace(numbers, "#"))).toEqual(
    expected.map((line) => line.replace(numbers, "#"))
  )
  actual.forEach((line, k) => {
    const got = line.match(numbers) ?? []
    const want = expected[k].match(numbers) ?? []
    got.forEach((value, i) =>
      expect(Math.abs(Number(value) - Number(want[i]))).toBeLessThanOrEqual(
        1e-8 * Math.max(1, Math.abs(Number(want[i]))) + 1e-4
      )
    )
  })
}

function harness(locale?: typeof es): CadHarness {
  const cad = createHarness(locale ? { locale } : {})
  answer(cad, "LUPREC", "4")
  return cad
}

describe("MASSPROP of a solid, as AutoCAD 2027's console reports it", () => {
  it("a box and a wedge (solid/m01)", () => {
    const cad = harness()
    answer(cad, "_BOX", "0,0,0", "10,20", "5")
    expect(massprop(cad, "_L")).toEqual(CONSOLE.m01[0])
    answer(cad, "_WEDGE", "20,0,0", "30,20", "5")
    expect(massprop(cad, "_L")).toEqual(CONSOLE.m01[1])
  })

  it("a cylinder and an elliptical one (m02)", () => {
    const cad = harness()
    answer(cad, "_CYLINDER", "0,0,0", "5", "10")
    expect(massprop(cad, "_L")).toEqual(CONSOLE.m02[0])
    answer(cad, "_CYLINDER", "_E", "20,0,0", "30,0,0", "25,3,0", "10")
    expect(massprop(cad, "_L")).toEqual(CONSOLE.m02[1])
  })

  it("a sphere, a doughnut, an apple, a lemon, a sphere off the origin (m03)", () => {
    const cad = harness()
    answer(cad, "_SPHERE", "0,0,0", "5")
    expect(massprop(cad, "_L")).toEqual(CONSOLE.m03[0])
    answer(cad, "_TORUS", "30,0,0", "10", "3")
    expect(massprop(cad, "_L")).toEqual(CONSOLE.m03[1])
    answer(cad, "_TORUS", "60,0,0", "2", "4")
    expect(massprop(cad, "_L")).toEqual(CONSOLE.m03[2])
    answer(cad, "_TORUS", "90,0,0", "-4", "5")
    expect(massprop(cad, "_L")).toEqual(CONSOLE.m03[3])
    answer(cad, "_SPHERE", "150,7,-3", "2.5")
    expect(massprop(cad, "_L")).toEqual(CONSOLE.m03[4])
  })

  it("two solids at once in a tilted UCS, its origin the moments' (m04)", () => {
    const cad = harness()
    answer(cad, "_BOX", "1,2,3", "11,22", "5")
    answer(cad, "_CYLINDER", "30,0,0", "4", "12")
    answer(cad, "_UCS", "_Z", "30", "_UCS", "_X", "40", "_UCS", "_O", "3,4,5")
    // WHY near, to 1e-8: AutoCAD's own numbers in a tilted UCS stray in the
    // last digit from its WCS ones carried there (its principal moments,
    // 296444.2735 there and 296444.2732 in the WCS); these are exact.
    expectNear(massprop(cad, "_ALL"), CONSOLE.m04[0])
    answer(cad, "_UCS", "_W")
    expect(massprop(cad, "_ALL")).toEqual(CONSOLE.m04[1])
  })

  it("overlapping solids, summed (m05)", () => {
    const cad = harness()
    answer(cad, "_BOX", "0,0,0", "10,10", "10", "_BOX", "5,5,5", "15,15", "10")
    expect(massprop(cad, "_ALL")).toEqual(CONSOLE.m05[0])
  })

  it("at LUPREC, every number (m08)", () => {
    const cad = harness()
    answer(cad, "_BOX", "0,0,0", "10,20", "5", "LUPREC", "6")
    expect(massprop(cad, "_L")).toEqual(CONSOLE.m08[1])
    answer(cad, "LUPREC", "3")
    expect(massprop(cad, "_L")).toEqual(CONSOLE.m08[2])
    answer(cad, "LUPREC", "0", "_RECTANG", "30,0", "40,4", "_REGION", "_L", "")
    expect(massprop(cad, "_ALL")).toEqual(CONSOLE.m08[3])
  })
})

/** A report less its principal moments, which AutoCAD turns by its rounding where two are equal. */
function withoutPrincipal(lines: readonly string[]): string[] {
  const at = lines.findIndex((line) => line.startsWith("Principal moments"))
  return at < 0 ? [...lines] : lines.slice(0, at)
}

describe("MASSPROP of composite and derived solids (probes solid-inquiry/p112–p116)", () => {
  it("a union of a box and a cylinder (p112)", () => {
    const cad = harness()
    answer(cad, "_BOX", "0,0,0", "10,10,10", "_CYLINDER", "10,5,0", "3", "10")
    answer(cad, "_UNION", "_ALL", "")
    expectNear(massprop(cad, "_L"), INQUIRY.p112[0])
  })

  it("two crossed cylinders, their union and their intersection (p113)", () => {
    for (const [boolean, k] of [
      ["_UNION", 0],
      ["_INTERSECT", 1],
    ] as const) {
      const cad = harness()
      answer(cad, "_CYLINDER", "0,0,0", "3", "20", "_UCS", "_Y", "90")
      answer(cad, "_CYLINDER", "-10,0,-10", "3", "20", "_UCS", "_W")
      answer(cad, boolean, "_ALL", "")
      // Two equal moments: AutoCAD's axes are its rounding's (Missing).
      expectNear(
        withoutPrincipal(massprop(cad, "_L")),
        withoutPrincipal(INQUIRY.p113[k])
      )
    }
  })

  it("a tapered extrusion and a partial revolution (p114)", () => {
    const cad = harness()
    answer(cad, "_CIRCLE", "0,0", "5", "_EXTRUDE", "_L", "", "_T", "10", "10")
    // WHY near: ACIS' last digit (6762.6299 and 6762.6297 for one moment).
    expectNear(massprop(cad, "_L"), INQUIRY.p114[0])
    answer(cad, "_ERASE", "_ALL", "", "_RECTANG", "5,0", "8,4")
    answer(cad, "_REVOLVE", "_L", "", "0,0", "0,10", "270")
    // Ixx and Izz equal but for rounding: AutoCAD turns them by +45° (MSP-01).
    expect(massprop(cad, "_L")).toEqual(INQUIRY.p114[1])
  })

  it("a filleted edge and a slice (p115)", () => {
    const cad = harness()
    answer(cad, "_BOX", "0,0,0", "10,10,10", "_ZOOM", "_E")
    answer(cad, "_FILLETEDGE", "10,5,10", "", "")
    expectNear(massprop(cad, "_L"), INQUIRY.p115[0])
    answer(cad, "_ERASE", "_ALL", "", "_SPHERE", "0,0,0", "5")
    answer(cad, "_SLICE", "_L", "", "_XY", "0,0,2", "0,0,10")
    expectNear(massprop(cad, "_L"), INQUIRY.p115[1])
  })

  it("SOLIDEDIT's extruded and offset faces (p116)", () => {
    const cad = harness()
    answer(cad, "_BOX", "0,0,0", "10,10", "10", "_-VPOINT", "-1.3,-2.2,1.6")
    answer(cad, "_ZOOM", "_E", "_SOLIDEDIT", "_F", "_E", "5,5,10", "", "3", "0")
    answer(cad, "_X", "_X")
    expectNear(massprop(cad, "_L"), INQUIRY.p116[0])
    answer(cad, "_SOLIDEDIT", "_F", "_O", "5,5,13", "", "1", "_X", "_X")
    expectNear(massprop(cad, "_L"), INQUIRY.p116[1])
  })

  it("the tight box of a tilted torus, cone and cylinder, in the UCS and the WCS (p118, p119)", () => {
    const cad = harness()
    answer(cad, "_UCS", "_X", "30", "_TORUS", "0,0,0", "10", "3")
    answer(cad, "_CONE", "40,0,0", "5", "12", "_CYLINDER", "70,0,0", "4", "10")
    expectNear(massprop(cad, "_L"), INQUIRY.p118[0])
    expectNear(massprop(cad, "_ALL"), INQUIRY.p118[1])
    answer(cad, "_UCS", "_W")
    expectNear(massprop(cad, "_ALL"), INQUIRY.p118[2])
    const torus = harness()
    answer(
      torus,
      "_UCS",
      "_X",
      "30",
      "_TORUS",
      "0,0,0",
      "10",
      "3",
      "_UCS",
      "_W"
    )
    expectNear(
      withoutPrincipal(massprop(torus, "_L")),
      withoutPrincipal(INQUIRY.p119[0])
    )
    const cone = harness()
    answer(cone, "_UCS", "_X", "30", "_CONE", "0,0,0", "5", "12", "_UCS", "_W")
    expectNear(
      withoutPrincipal(massprop(cone, "_L")),
      withoutPrincipal(INQUIRY.p119[1])
    )
  })
})

describe("MASSPROP of a region", () => {
  it("regions and solids, the regions first, and two regions summed (m05)", () => {
    const cad = harness()
    answer(cad, "_BOX", "0,0,0", "10,10", "10", "_BOX", "5,5,5", "15,15", "10")
    answer(cad, "_CIRCLE", "50,0", "5", "_REGION", "_L", "")
    expect(massprop(cad, "_ALL")).toEqual(CONSOLE.m05[1])
    answer(cad, "_ERASE", "_ALL", "")
    answer(cad, "_RECTANG", "0,0", "10,4", "_REGION", "_L", "")
    answer(cad, "_CIRCLE", "30,0", "2", "_REGION", "_L", "")
    expect(massprop(cad, "_ALL")).toEqual(CONSOLE.m05[2])
  })

  it("in the UCS: moved and turned in its XY plane, tilted off it, level at another Z, standing (m07)", () => {
    const cad = harness()
    answer(cad, "_RECTANG", "0,0", "10,4", "_REGION", "_L", "")
    answer(cad, "_UCS", "_O", "2,3,0")
    expect(massprop(cad, "_L")).toEqual(CONSOLE.m07[0])
    answer(cad, "_UCS", "_Z", "30")
    expect(massprop(cad, "_L")).toEqual(CONSOLE.m07[1])
    answer(cad, "_UCS", "_W", "_UCS", "_X", "30")
    expect(massprop(cad, "_L")).toEqual(CONSOLE.m07[2])
    answer(cad, "_UCS", "_W", "_CIRCLE", "50,0,7", "5", "_REGION", "_L", "")
    expect(massprop(cad, "_L")).toEqual(CONSOLE.m07[3])
    answer(
      cad,
      "_UCS",
      "_X",
      "90",
      "_CIRCLE",
      "0,0,0",
      "3",
      "_REGION",
      "_L",
      ""
    )
    answer(cad, "_UCS", "_W")
    expect(massprop(cad, "_L")).toEqual(CONSOLE.m07[4])
  })

  it("only those in the first's plane, the others counted, locked ones too (m09)", () => {
    const cad = harness()
    answer(cad, "_RECTANG", "0,0", "10,4", "_REGION", "_L", "")
    answer(cad, "_CIRCLE", "30,0,7", "2", "_REGION", "_L", "")
    expect(massprop(cad, "_ALL")).toEqual(CONSOLE.m09[0])
    answer(
      cad,
      "_UCS",
      "_X",
      "90",
      "_CIRCLE",
      "50,0,0",
      "3",
      "_REGION",
      "_L",
      ""
    )
    answer(cad, "_CIRCLE", "60,0,0", "1", "_REGION", "_L", "", "_UCS", "_W")
    expect(massprop(cad, "_L")).toEqual(CONSOLE.m09[1])
    answer(cad, "_ERASE", "_L", "")
    expect(massprop(cad, "_ALL")).toEqual(CONSOLE.m09[2])
    answer(cad, "_-LAYER", "_LO", "0", "")
    expect(massprop(cad, "_ALL")).toEqual(CONSOLE.m09[3])
  })
})

describe("MASSPROP's prompts and refusals", () => {
  it("says what it found nothing of (m05)", () => {
    const cad = harness()
    answer(cad, "_LINE", "0,0", "10,0", "")
    expect(written(cad, "_MASSPROP", "_L", "")).toEqual([
      "MASSPROP",
      "Select objects: _L",
      "1 found",
      "Select objects:",
      "No solids or regions selected.",
    ])
    expect(written(cad, "_MASSPROP", "")).toEqual([
      "MASSPROP",
      "Select objects:",
      "Nothing selected.",
    ])
  })

  it("refuses FOO at Write analysis, ends on Enter and on No (m06)", () => {
    const files = new MemoryFileTransport()
    const cad = createHarness({ files })
    answer(cad, "_BOX", "0,0,0", "10,20", "5")
    expect(written(cad, "_MASSPROP", "_L", "", "FOO", "").slice(-3)).toEqual([
      "Write analysis to a file? [Yes/No] <N>: FOO",
      "Invalid option keyword.",
      "Write analysis to a file? [Yes/No] <N>:",
    ])
    expect(cad.runtime.getState().activeToolId).toBe("select")
    answer(cad, "_MASSPROP", "_L", "", "_N")
    expect(files.saved).toEqual([])
  })

  it("writes the file AutoCAD writes on Yes, named as the drawing (m10)", () => {
    const files = new MemoryFileTransport()
    const cad = createHarness({ files })
    answer(cad, "LUPREC", "4")
    answer(cad, "_BOX", "0,0,0", "10,20", "5", "_CIRCLE", "30,0", "5")
    answer(cad, "_REGION", "_L", "", "_MASSPROP", "_ALL", "", "_Y")
    expect(files.saved).toHaveLength(1)
    expect(files.saved[0].fileName).toMatch(/^drawing-\d{4}-\d\d-\d\d\.mpr$/)
    expect(files.saved[0].text).toBe(M10A)
    expect(cad.runtime.getState().activeToolId).toBe("select")
  })

  // The platform's case: AutoCAD's file dialog always opens; a host with no
  // file transport cannot save the download (22138's words).
  it("says it cannot write without a file transport", () => {
    const cad = createHarness({ files: null })
    answer(cad, "_BOX", "0,0,0", "10,20", "5")
    expect(written(cad, "_MASSPROP", "_L", "", "_Y").at(-1)).toMatch(
      /^Unable to open mass and area properties file drawing-.*\.mpr\.$/
    )
  })

  it("drops a preselection and asks for the objects (probe solid-inquiry/p124, d01)", () => {
    const cad = harness()
    answer(cad, "_SPHERE", "0,0,0", "5")
    cad.runtime.selectAll()
    expect(written(cad, "_MASSPROP")).toEqual(["MASSPROP"])
    expect(cad.runtime.getState().selectionCount).toBe(0)
    expect(written(cad, "")).toEqual(["Select objects:", "Nothing selected."])
    expect(cad.runtime.getState().activeToolId).toBe("select")
  })

  it("is one undo step that changes nothing, REDO's too (probe solid-inquiry/p104)", () => {
    const cad = harness()
    answer(cad, "_BOX", "0,0,0", "10,20", "5", "_MASSPROP", "_L", "", "_N")
    expect(written(cad, "_U")).toEqual(["U", "MASSPROP"])
    expect(cad.entities()).toHaveLength(1)
    expect(written(cad, "_REDO")).toEqual([
      "REDO",
      "MASSPROP",
      "Everything has been redone",
    ])
  })

  it("is a step when it reports nothing, and UNDO 2 names it (p104, p105)", () => {
    const cad = harness()
    answer(cad, "_BOX", "0,0,0", "10,20", "5", "_LINE", "0,0", "10,0", "")
    answer(cad, "_MASSPROP", "_L", "")
    expect(written(cad, "_U")).toEqual(["U", "MASSPROP"])
    answer(cad, "_MASSPROP", "")
    expect(written(cad, "_U")).toEqual(["U", "MASSPROP"])
    answer(cad, "_MASSPROP", "_ALL", "", "_N")
    expect(written(cad, "_UNDO", "2").at(-1)).toBe("MASSPROP LINE")
    expect(cad.entities()).toHaveLength(1)
  })

  it("repeats on Enter, and is no transparent command (p100)", () => {
    const cad = harness()
    answer(cad, "_BOX", "0,0,0", "10,20", "5", "_MASSPROP", "_L", "", "_N")
    expect(written(cad, "", "_L", "", "_N")[0]).toBe("MASSPROP")
    expect(written(cad, "_LINE", "0,0", "'_MASSPROP").slice(-2)).toEqual([
      "** That command may not be invoked transparently **",
      "Point or option keyword required.",
    ])
  })

  it("refuses another prompt's keyword and a command at Write analysis, runs transparent ones (p103)", () => {
    const cad = harness()
    answer(cad, "_BOX", "0,0,0", "10,20", "5", "_MASSPROP", "_L", "")
    expect(written(cad, "_C", "_LINE")).toEqual([
      "Write analysis to a file? [Yes/No] <N>: _C",
      "Invalid option keyword.",
      "Write analysis to a file? [Yes/No] <N>: _LINE",
      "Invalid option keyword.",
    ])
    const ortho = written(cad, "'ORTHOMODE", "1")
    expect(ortho[0]).toBe("Write analysis to a file? [Yes/No] <N>: 'ORTHOMODE")
    expect(ortho.at(-1)).toBe("Resuming MASSPROP command.")
    answer(cad, "_No")
    expect(cad.runtime.getState().activeToolId).toBe("select")
  })

  it("measures a solid and a region among other objects, the regions first (p107)", () => {
    const cad = harness()
    answer(cad, "_BOX", "0,0,0", "10,10,10", "_LINE", "20,0", "30,0", "")
    answer(cad, "_CIRCLE", "50,0", "5", "_REGION", "_L", "")
    expect(massprop(cad, "_ALL")).toEqual(INQUIRY.p107[0])
  })

  it("measures no block reference and no array (p108, p109)", () => {
    const cad = harness()
    answer(cad, "_BOX", "0,0,0", "10,10,10", "_-BLOCK", "B1", "0,0,0", "_L", "")
    answer(cad, "_-INSERT", "B1", "20,0,0", "1", "1", "0")
    expect(written(cad, "_MASSPROP", "_L", "").at(-1)).toBe(
      "No solids or regions selected."
    )
    answer(cad, "_BOX", "0,0,0", "10,10,10", "_ARRAYRECT", "_L", "", "_X")
    expect(written(cad, "_MASSPROP", "_L", "").at(-1)).toBe(
      "No solids or regions selected."
    )
  })

  it("measures what ALL finds on a layer that is off (p111)", () => {
    const cad = harness()
    answer(cad, "_BOX", "0,0,0", "10,10,10", "_BOX", "20,0,0", "30,10,10")
    const off = cad.runtime.createLayer("L1")
    answer(cad, "_CHPROP", "_L", "", "_LA", "L1", "")
    cad.runtime.updateLayer(off, { visible: false })
    const lines = written(cad, "_MASSPROP", "_ALL", "", "_N")
    expect(lines).toContain("2 found")
    expect(lines).toContain("Volume:                  2000.0000")
  })

  it("writes decimals in fractional units (p122)", () => {
    const cad = harness()
    answer(cad, "_LUNITS", "5", "_BOX", "0,0,0", "10.3,20", "5")
    expect(massprop(cad, "_L")).toEqual(INQUIRY.p122[0])
    answer(cad, "_RECTANG", "30,0", "40.3,4", "_REGION", "_L", "")
    expect(massprop(cad, "_L")).toEqual(INQUIRY.p122[1])
  })
})

describe("MASSPROP at the cursor", () => {
  it("shows its Select objects: alone in the dynamic tip, in each language (desktop solid-inquiry/d10)", () => {
    for (const [locale, words] of [
      [undefined, "Select objects:"],
      [es, "Designe objetos:"],
    ] as const) {
      const cad = harness(locale)
      answer(cad, "_MASSPROP")
      cad.moveTo({ x: 30, y: 30 })
      expect(cad.state().dynamicInput).toMatchObject({
        prompt: words,
        fields: [],
      })
    }
  })

  it("is cancelled by Escape at Write analysis, which it echoes (desktop solid-inquiry/d09, d11)", () => {
    for (const [locale, line] of [
      [undefined, "Write analysis to a file? [Yes/No] <N>: *Cancel*"],
      [es, "¿Escribir análisis en un archivo? [Sí/No] <N>: *Cancelado*"],
    ] as const) {
      const cad = harness(locale)
      answer(cad, "_BOX", "0,0,0", "10,20", "5", "_MASSPROP", "_ALL", "")
      cad.escape()
      expect(cad.commandLog().at(-1)).toBe(line)
      expect(cad.activeToolId()).toBe("select")
    }
  })
})

describe("MASSPROP in other languages", () => {
  it("takes the bare S and N of es and pt-BR (probes solid-inquiry/p101, p102)", () => {
    for (const [locale, name] of [
      [es, "PROPFIS"],
      [ptBR, "PROPMASS"],
    ] as const) {
      const files = new MemoryFileTransport()
      const cad = createHarness({ locale, files })
      answer(cad, "_BOX", "0,0,0", "10,20", "5", name, "_L", "", "N")
      expect(files.saved).toEqual([])
      answer(cad, name, "_L", "", "S")
      expect(files.saved).toHaveLength(1)
      expect(cad.runtime.getState().activeToolId).toBe("select")
    }
  })

  it("es: PROPFIS, its columns as its tables lay them (m05)", () => {
    const cad = harness(es)
    answer(cad, "_BOX", "0,0,0", "10,10", "10", "_BOX", "5,5,5", "15,15", "10")
    expect(massprop(cad, "_ALL")).toEqual(CONSOLE.m05es[0])
    answer(cad, "_CIRCLE", "50,0", "5", "_REGION", "_L", "")
    expect(massprop(cad, "_ALL")).toEqual(CONSOLE.m05es[1])
    expect(written(cad, "PROPFIS", "_L", "", "N").at(-1)).toBe(
      "¿Escribir análisis en un archivo? [Sí/No] <N>: N"
    )
  })

  it("pt-BR: PROPMASS, its l for I (m05, m09)", () => {
    const cad = harness(ptBR)
    answer(cad, "_BOX", "0,0,0", "10,10", "10", "_BOX", "5,5,5", "15,15", "10")
    expect(massprop(cad, "_ALL")).toEqual(CONSOLE.m05ptBR[0])
    answer(cad, "_ERASE", "_ALL", "")
    answer(cad, "_RECTANG", "0,0", "10,4", "_REGION", "_L", "")
    answer(cad, "_CIRCLE", "30,0", "2", "_REGION", "_L", "")
    expect(massprop(cad, "_ALL")).toEqual(CONSOLE.m05ptBR[2])
    answer(
      cad,
      "_ERASE",
      "_ALL",
      "",
      "_CIRCLE",
      "30,0,7",
      "2",
      "_REGION",
      "_L",
      ""
    )
    answer(cad, "_RECTANG", "0,0", "10,4", "_REGION", "_L", "")
    expect(written(cad, "PROPMASS", "_ALL", "")[4]).toBe("1 região ignorada.")
    answer(cad, "_N")
  })
})

/** solid/m10's file, byte for byte: CRLF, the unit fields' spaces kept. */
const M10A = [
  "",
  " ----------------   REGIONS   ---------------- ",
  "",
  "Area:                    78.5398 ",
  "Perimeter:               31.4159 ",
  "Bounding box:         X: 25.0000  --  35.0000 ",
  "                      Y: -5.0000  --  5.0000 ",
  "Centroid:             X: 30.0000 ",
  "                      Y: 0.0000 ",
  "Moments of inertia:   X: 490.8739  ",
  "                      Y: 71176.7086  ",
  "Product of inertia:  XY: 0.0000  ",
  "Radii of gyration:    X: 2.5000 ",
  "                      Y: 30.1040 ",
  "Principal moments and X-Y directions about centroid:",
  "                      I: 490.8739 along [1.0000 0.0000]",
  "                      J: 490.8739 along [0.0000 1.0000]",
  "",
  " ----------------   SOLIDS    ---------------- ",
  "",
  "Mass:                    1000.0000 ",
  "Volume:                  1000.0000 ",
  "Bounding box:         X: 0.0000  --  10.0000 ",
  "                      Y: 0.0000  --  20.0000 ",
  "                      Z: 0.0000  --  5.0000 ",
  "Centroid:             X: 5.0000 ",
  "                      Y: 10.0000 ",
  "                      Z: 2.5000 ",
  "Moments of inertia:   X: 141666.6667  ",
  "                      Y: 41666.6667  ",
  "                      Z: 166666.6667  ",
  "Products of inertia: XY: -50000.0000  ",
  "                     YZ: -25000.0000  ",
  "                     ZX: -12500.0000  ",
  "Radii of gyration:    X: 11.9024 ",
  "                      Y: 6.4550 ",
  "                      Z: 12.9099 ",
  "Principal moments and X-Y-Z directions about centroid:",
  "                      I: 35416.6667 along [1.0000 0.0000 0.0000]",
  "                      J: 10416.6667 along [0.0000 1.0000 0.0000]",
  "                      K: 41666.6667 along [0.0000 0.0000 1.0000]",
  "",
].join("\r\n")

/** The console's reports, as AutoCAD 2027 wrote them (research/probes/solid/<id>.<culture>.txt), blank lines left out. */
const CONSOLE = {
  m01: [
    [
      " ----------------   SOLIDS    ----------------",
      "Mass:                    1000.0000",
      "Volume:                  1000.0000",
      "Bounding box:         X: 0.0000  --  10.0000",
      "                      Y: 0.0000  --  20.0000",
      "                      Z: 0.0000  --  5.0000",
      "Centroid:             X: 5.0000",
      "                      Y: 10.0000",
      "                      Z: 2.5000",
      "Moments of inertia:   X: 141666.6667",
      "                      Y: 41666.6667",
      "                      Z: 166666.6667",
      "Products of inertia: XY: -50000.0000",
      "                     YZ: -25000.0000",
      "                     ZX: -12500.0000",
      "Radii of gyration:    X: 11.9024",
      "                      Y: 6.4550",
      "                      Z: 12.9099",
      "Principal moments and X-Y-Z directions about centroid:",
      "                      I: 35416.6667 along [1.0000 0.0000 0.0000]",
      "                      J: 10416.6667 along [0.0000 1.0000 0.0000]",
      "                      K: 41666.6667 along [0.0000 0.0000 1.0000]",
    ],
    [
      " ----------------   SOLIDS    ----------------",
      "Mass:                    500.0000",
      "Volume:                  500.0000",
      "Bounding box:         X: 20.0000  --  30.0000",
      "                      Y: 0.0000  --  20.0000",
      "                      Z: 0.0000  --  5.0000",
      "Centroid:             X: 23.3333",
      "                      Y: 10.0000",
      "                      Z: 1.6667",
      "Moments of inertia:   X: 68750.0000",
      "                      Y: 277083.3333",
      "                      Z: 341666.6667",
      "Products of inertia: XY: -116666.6667",
      "                     YZ: -8333.3333",
      "                     ZX: -18750.0000",
      "Radii of gyration:    X: 11.7260",
      "                      Y: 23.5407",
      "                      Z: 26.1406",
      "Principal moments and X-Y-Z directions about centroid:",
      "                      I: 17150.8503 along [0.9571 0.0000 -0.2898]",
      "                      J: 3472.2222 along [0.0000 1.0000 0.0000]",
      "                      K: 19654.7053 along [0.2898 0.0000 0.9571]",
    ],
  ],
  m02: [
    [
      " ----------------   SOLIDS    ----------------",
      "Mass:                    785.3982",
      "Volume:                  785.3982",
      "Bounding box:         X: -5.0000  --  5.0000",
      "                      Y: -5.0000  --  5.0000",
      "                      Z: 0.0000  --  10.0000",
      "Centroid:             X: 0.0000",
      "                      Y: 0.0000",
      "                      Z: 5.0000",
      "Moments of inertia:   X: 31088.6773",
      "                      Y: 31088.6773",
      "                      Z: 9817.4770",
      "Products of inertia: XY: 0.0000",
      "                     YZ: 0.0000",
      "                     ZX: 0.0000",
      "Radii of gyration:    X: 6.2915",
      "                      Y: 6.2915",
      "                      Z: 3.5355",
      "Principal moments and X-Y-Z directions about centroid:",
      "                      I: 11453.7232 along [1.0000 0.0000 0.0000]",
      "                      J: 11453.7232 along [0.0000 1.0000 0.0000]",
      "                      K: 9817.4770 along [0.0000 0.0000 1.0000]",
    ],
    [
      " ----------------   SOLIDS    ----------------",
      "Mass:                    471.2389",
      "Volume:                  471.2389",
      "Bounding box:         X: 20.0000  --  30.0000",
      "                      Y: -3.0000  --  3.0000",
      "                      Z: 0.0000  --  10.0000",
      "Centroid:             X: 25.0000",
      "                      Y: 0.0000",
      "                      Z: 5.0000",
      "Moments of inertia:   X: 16768.2508",
      "                      Y: 313177.5177",
      "                      Z: 298529.8419",
      "Products of inertia: XY: 0.0000",
      "                     YZ: 0.0000",
      "                     ZX: -58904.8623",
      "Radii of gyration:    X: 5.9652",
      "                      Y: 25.7795",
      "                      Z: 25.1694",
      "Principal moments and X-Y-Z directions about centroid:",
      "                      I: 4987.2783 along [1.0000 0.0000 0.0000]",
      "                      J: 6872.2339 along [0.0000 1.0000 0.0000]",
      "                      K: 4005.5306 along [0.0000 0.0000 1.0000]",
    ],
  ],
  m03: [
    [
      " ----------------   SOLIDS    ----------------",
      "Mass:                    523.5988",
      "Volume:                  523.5988",
      "Bounding box:         X: -5.0000  --  5.0000",
      "                      Y: -5.0000  --  5.0000",
      "                      Z: -5.0000  --  5.0000",
      "Centroid:             X: 0.0000",
      "                      Y: 0.0000",
      "                      Z: 0.0000",
      "Moments of inertia:   X: 5235.9878",
      "                      Y: 5235.9878",
      "                      Z: 5235.9878",
      "Products of inertia: XY: 0.0000",
      "                     YZ: 0.0000",
      "                     ZX: 0.0000",
      "Radii of gyration:    X: 3.1623",
      "                      Y: 3.1623",
      "                      Z: 3.1623",
      "Principal moments and X-Y-Z directions about centroid:",
      "                      I: 5235.9878 along [1.0000 0.0000 0.0000]",
      "                      J: 5235.9878 along [0.0000 1.0000 0.0000]",
      "                      K: 5235.9878 along [0.0000 0.0000 1.0000]",
    ],
    [
      " ----------------   SOLIDS    ----------------",
      "Mass:                    1776.5288",
      "Volume:                  1776.5288",
      "Bounding box:         X: 17.0000  --  43.0000",
      "                      Y: -13.0000  --  13.0000",
      "                      Z: -3.0000  --  3.0000",
      "Centroid:             X: 30.0000",
      "                      Y: 0.0000",
      "                      Z: 0.0000",
      "Moments of inertia:   X: 98819.4141",
      "                      Y: 1697695.3270",
      "                      Z: 1788520.3615",
      "Products of inertia: XY: 0.0000",
      "                     YZ: 0.0000",
      "                     ZX: 0.0000",
      "Radii of gyration:    X: 7.4582",
      "                      Y: 30.9132",
      "                      Z: 31.7293",
      "Principal moments and X-Y-Z directions about centroid:",
      "                      I: 98819.4141 along [1.0000 0.0000 0.0000]",
      "                      J: 98819.4141 along [0.0000 1.0000 0.0000]",
      "                      K: 189644.4486 along [0.0000 0.0000 1.0000]",
    ],
    [
      " ----------------   SOLIDS    ----------------",
      "Mass:                    682.2902",
      "Volume:                  682.2902",
      "Bounding box:         X: 54.0000  --  66.0000",
      "                      Y: -6.0000  --  6.0000",
      "                      Z: -4.0000  --  4.0000",
      "Centroid:             X: 60.0000",
      "                      Y: 0.0000",
      "                      Z: 0.0000",
      "Moments of inertia:   X: 7717.3460",
      "                      Y: 2463962.1724",
      "                      Z: 2466430.1462",
      "Products of inertia: XY: 0.0000",
      "                     YZ: 0.0000",
      "                     ZX: 0.0000",
      "Radii of gyration:    X: 3.3632",
      "                      Y: 60.0942",
      "                      Z: 60.1243",
      "Principal moments and X-Y-Z directions about centroid:",
      "                      I: 7717.3460 along [1.0000 0.0000 0.0000]",
      "                      J: 7717.3460 along [0.0000 1.0000 0.0000]",
      "                      K: 10185.3198 along [0.0000 0.0000 1.0000]",
    ],
    [
      " ----------------   SOLIDS    ----------------",
      "Mass:                    10.3666",
      "Volume:                  10.3666",
      "Bounding box:         X: 89.0000  --  91.0000",
      "                      Y: -1.0000  --  1.0000",
      "                      Z: -3.0000  --  3.0000",
      "Centroid:             X: 90.0000",
      "                      Y: 0.0000",
      "                      Z: 0.0000",
      "Moments of inertia:   X: 15.8879",
      "                      Y: 83985.0164",
      "                      Z: 83973.1099",
      "Products of inertia: XY: 0.0000",
      "                     YZ: 0.0000",
      "                     ZX: 0.0000",
      "Radii of gyration:    X: 1.2380",
      "                      Y: 90.0085",
      "                      Z: 90.0021",
      "Principal moments and X-Y-Z directions about centroid:",
      "                      I: 15.8879 along [1.0000 0.0000 0.0000]",
      "                      J: 15.8879 along [0.0000 1.0000 0.0000]",
      "                      K: 3.9813 along [0.0000 0.0000 1.0000]",
    ],
    [
      " ----------------   SOLIDS    ----------------",
      "Mass:                    65.4498",
      "Volume:                  65.4498",
      "Bounding box:         X: 147.5000  --  152.5000",
      "                      Y: 4.5000  --  9.5000",
      "                      Z: -5.5000  --  -0.5000",
      "Centroid:             X: 150.0000",
      "                      Y: 7.0000",
      "                      Z: -3.0000",
      "Moments of inertia:   X: 3959.7157",
      "                      Y: 1473374.2296",
      "                      Z: 1475992.2235",
      "Products of inertia: XY: -68722.3393",
      "                     YZ: 1374.4468",
      "                     ZX: 29452.4311",
      "Radii of gyration:    X: 7.7782",
      "                      Y: 150.0383",
      "                      Z: 150.1716",
      "Principal moments and X-Y-Z directions about centroid:",
      "                      I: 163.6246 along [1.0000 0.0000 0.0000]",
      "                      J: 163.6246 along [0.0000 1.0000 0.0000]",
      "                      K: 163.6246 along [0.0000 0.0000 1.0000]",
    ],
  ],
  m04: [
    [
      " ----------------   SOLIDS    ----------------",
      "Mass:                    1603.1858",
      "Volume:                  1603.1858",
      "Bounding box:         X: -1.1340  --  26.9808",
      "                      Y: -18.5548  --  15.3544",
      "                      Z: -14.6272  --  16.4055",
      "Centroid:             X: 13.7587",
      "                      Y: -1.1348",
      "                      Z: 0.0211",
      "Moments of inertia:   X: 229630.3646",
      "                      Y: 502533.3524",
      "                      Z: 532546.4361",
      "Products of inertia: XY: 110368.2065",
      "                     YZ: 103551.2917",
      "                     ZX: -75702.9616",
      "Radii of gyration:    X: 11.9680",
      "                      Y: 17.7048",
      "                      Z: 18.2258",
      "Principal moments and X-Y-Z directions about centroid:",
      "                      I: 296444.2735 along [0.8552 0.4030 -0.3259]",
      "                      J: 39679.8944 along [-0.5180 0.6435 -0.5636]",
      "                      K: 317479.8305 along [-0.0174 0.6508 0.7590]",
    ],
    [
      " ----------------   SOLIDS    ----------------",
      "Mass:                    1603.1858",
      "Volume:                  1603.1858",
      "Bounding box:         X: 1.0000  --  34.0000",
      "                      Y: -4.0000  --  22.0000",
      "                      Z: 0.0000  --  12.0000",
      "Centroid:             X: 15.0298",
      "                      Y: 7.4851",
      "                      Z: 5.6881",
      "Moments of inertia:   X: 241032.3277",
      "                      Y: 650899.5383",
      "                      Z: 769359.3635",
      "Products of inertia: XY: -72000.0000",
      "                     YZ: -66000.0000",
      "                     ZX: -141573.4421",
      "Radii of gyration:    X: 12.2616",
      "                      Y: 20.1495",
      "                      Z: 21.9065",
      "Principal moments and X-Y-Z directions about centroid:",
      "                      I: 39679.8946 along [0.8762 -0.4817 0.0182]",
      "                      J: 296444.2732 along [0.4816 0.8764 0.0094]",
      "                      K: 317479.8304 along [-0.0204 0.0006 0.9998]",
    ],
  ],
  m05: [
    [
      " ----------------   SOLIDS    ----------------",
      "Mass:                    2000.0000",
      "Volume:                  2000.0000",
      "Bounding box:         X: 0.0000  --  15.0000",
      "                      Y: 0.0000  --  15.0000",
      "                      Z: 0.0000  --  15.0000",
      "Centroid:             X: 7.5000",
      "                      Y: 7.5000",
      "                      Z: 7.5000",
      "Moments of inertia:   X: 283333.3333",
      "                      Y: 283333.3333",
      "                      Z: 283333.3333",
      "Products of inertia: XY: -125000.0000",
      "                     YZ: -125000.0000",
      "                     ZX: -125000.0000",
      "Radii of gyration:    X: 11.9024",
      "                      Y: 11.9024",
      "                      Z: 11.9024",
      "Principal moments and X-Y-Z directions about centroid:",
      "                      I: 70833.3333 along [0.7071 -0.7071 0.0000]",
      "                      J: 33333.3333 along [0.5774 0.5774 0.5774]",
      "                      K: 70833.3333 along [-0.4082 -0.4082 0.8165]",
    ],
    [
      " ----------------   REGIONS   ----------------",
      "Area:                    78.5398",
      "Perimeter:               31.4159",
      "Bounding box:         X: 45.0000  --  55.0000",
      "                      Y: -5.0000  --  5.0000",
      "Centroid:             X: 50.0000",
      "                      Y: 0.0000",
      "Moments of inertia:   X: 490.8739",
      "                      Y: 196840.4147",
      "Product of inertia:  XY: 0.0000",
      "Radii of gyration:    X: 2.5000",
      "                      Y: 50.0625",
      "Principal moments and X-Y directions about centroid:",
      "                      I: 490.8739 along [1.0000 0.0000]",
      "                      J: 490.8739 along [0.0000 1.0000]",
      " ----------------   SOLIDS    ----------------",
      "Mass:                    2000.0000",
      "Volume:                  2000.0000",
      "Bounding box:         X: 0.0000  --  15.0000",
      "                      Y: 0.0000  --  15.0000",
      "                      Z: 0.0000  --  15.0000",
      "Centroid:             X: 7.5000",
      "                      Y: 7.5000",
      "                      Z: 7.5000",
      "Moments of inertia:   X: 283333.3333",
      "                      Y: 283333.3333",
      "                      Z: 283333.3333",
      "Products of inertia: XY: -125000.0000",
      "                     YZ: -125000.0000",
      "                     ZX: -125000.0000",
      "Radii of gyration:    X: 11.9024",
      "                      Y: 11.9024",
      "                      Z: 11.9024",
      "Principal moments and X-Y-Z directions about centroid:",
      "                      I: 70833.3333 along [0.7071 -0.7071 0.0000]",
      "                      J: 33333.3333 along [0.5774 0.5774 0.5774]",
      "                      K: 70833.3333 along [-0.4082 -0.4082 0.8165]",
    ],
    [
      " ----------------   REGIONS   ----------------",
      "Area:                    52.5664",
      "Perimeter:               40.5664",
      "Bounding box:         X: 0.0000  --  32.0000",
      "                      Y: -2.0000  --  4.0000",
      "Centroid:             X: 10.9764",
      "                      Y: 1.5219",
      "Moments of inertia:   X: 225.8997",
      "                      Y: 12655.6333",
      "Product of inertia:  XY: -400.0000",
      "Radii of gyration:    X: 2.0730",
      "                      Y: 15.5163",
      "Principal moments and X-Y directions about centroid:",
      "                      I: 67.6016 along [0.9971 -0.0762]",
      "                      J: 6358.8776 along [0.0762 0.9971]",
    ],
  ],
  m07: [
    [
      " ----------------   REGIONS   ----------------",
      "Area:                    40.0000",
      "Perimeter:               28.0000",
      "Bounding box:         X: -2.0000  --  8.0000",
      "                      Y: -3.0000  --  1.0000",
      "Centroid:             X: 3.0000",
      "                      Y: -1.0000",
      "Moments of inertia:   X: 93.3333",
      "                      Y: 693.3333",
      "Product of inertia:  XY: 120.0000",
      "Radii of gyration:    X: 1.5275",
      "                      Y: 4.1633",
      "Principal moments and X-Y directions about centroid:",
      "                      I: 53.3333 along [1.0000 0.0000]",
      "                      J: 333.3333 along [0.0000 1.0000]",
    ],
    [
      " ----------------   REGIONS   ----------------",
      "Area:                    40.0000",
      "Perimeter:               28.0000",
      "Bounding box:         X: -3.2321  --  7.4282",
      "                      Y: -6.5981  --  1.8660",
      "Centroid:             X: 2.0981",
      "                      Y: -2.3660",
      "Moments of inertia:   X: 347.2564",
      "                      Y: 439.4103",
      "Product of inertia:  XY: 319.8076",
      "Radii of gyration:    X: 2.9464",
      "                      Y: 3.3144",
      "Principal moments and X-Y directions about centroid:",
      "                      I: 53.3333 along [0.8660 -0.5000]",
      "                      J: 333.3333 along [0.5000 0.8660]",
    ],
    [
      " ----------------   REGIONS   ----------------",
      "Area:                    40.0000",
      "Perimeter:               28.0000",
      "Bounding box:         X: 0.0000  --  10.0000",
      "                      Y: 0.0000  --  3.4641",
      "                      Z: -2.0000  --  0.0000",
      "Centroid:             X: 5.0000",
      "                      Y: 1.7321",
      "                      Z: -1.0000",
    ],
    [
      " ----------------   REGIONS   ----------------",
      "Area:                    78.5398",
      "Perimeter:               31.4159",
      "Bounding box:         X: 45.0000  --  55.0000",
      "                      Y: -5.0000  --  5.0000",
      "                      Z: 7.0000  --  7.0000",
      "Centroid:             X: 50.0000",
      "                      Y: 0.0000",
      "                      Z: 7.0000",
    ],
    [
      " ----------------   REGIONS   ----------------",
      "Area:                    28.2743",
      "Perimeter:               18.8496",
      "Bounding box:         X: -3.0000  --  3.0000",
      "                      Y: 0.0000  --  0.0000",
      "                      Z: -3.0000  --  3.0000",
      "Centroid:             X: 0.0000",
      "                      Y: 0.0000",
      "                      Z: 0.0000",
    ],
  ],
  m08: [
    [
      " ----------------   SOLIDS    ----------------",
      "Mass:                    1000.00 lb",
      "Volume:                  1000.00 cu in",
      "Bounding box:         X: 0.00  --  10.00 in",
      "                      Y: 0.00  --  20.00 in",
      "                      Z: 0.00  --  5.00 in",
      "Centroid:             X: 5.00 in",
      "                      Y: 10.00 in",
      "                      Z: 2.50 in",
      "Moments of inertia:   X: 141666.67 lb sq in",
      "                      Y: 41666.67 lb sq in",
      "                      Z: 166666.67 lb sq in",
      "Products of inertia: XY: -50000.00 lb sq in",
      "                     YZ: -25000.00 lb sq in",
      "                     ZX: -12500.00 lb sq in",
      "Radii of gyration:    X: 11.90 in",
      "                      Y: 6.45 in",
      "                      Z: 12.91 in",
      "Principal moments (lb sq in) and X-Y-Z directions about centroid:",
      "                      I: 35416.67 along [1.00 0.00 0.00]",
      "                      J: 10416.67 along [0.00 1.00 0.00]",
      "                      K: 41666.67 along [0.00 0.00 1.00]",
    ],
    [
      " ----------------   SOLIDS    ----------------",
      "Mass:                    1000.000000",
      "Volume:                  1000.000000",
      "Bounding box:         X: 0.000000  --  10.000000",
      "                      Y: 0.000000  --  20.000000",
      "                      Z: 0.000000  --  5.000000",
      "Centroid:             X: 5.000000",
      "                      Y: 10.000000",
      "                      Z: 2.500000",
      "Moments of inertia:   X: 141666.666667",
      "                      Y: 41666.666667",
      "                      Z: 166666.666667",
      "Products of inertia: XY: -50000.000000",
      "                     YZ: -25000.000000",
      "                     ZX: -12500.000000",
      "Radii of gyration:    X: 11.902381",
      "                      Y: 6.454972",
      "                      Z: 12.909944",
      "Principal moments and X-Y-Z directions about centroid:",
      "                      I: 35416.666667 along [1.000000 0.000000 0.000000]",
      "                      J: 10416.666667 along [0.000000 1.000000 0.000000]",
      "                      K: 41666.666667 along [0.000000 0.000000 1.000000]",
    ],
    [
      " ----------------   SOLIDS    ----------------",
      "Mass:                    1000.000",
      "Volume:                  1000.000",
      "Bounding box:         X: 0.000  --  10.000",
      "                      Y: 0.000  --  20.000",
      "                      Z: 0.000  --  5.000",
      "Centroid:             X: 5.000",
      "                      Y: 10.000",
      "                      Z: 2.500",
      "Moments of inertia:   X: 141666.667",
      "                      Y: 41666.667",
      "                      Z: 166666.667",
      "Products of inertia: XY: -50000.000",
      "                     YZ: -25000.000",
      "                     ZX: -12500.000",
      "Radii of gyration:    X: 11.902",
      "                      Y: 6.455",
      "                      Z: 12.910",
      "Principal moments and X-Y-Z directions about centroid:",
      "                      I: 35416.667 along [1.000 0.000 0.000]",
      "                      J: 10416.667 along [0.000 1.000 0.000]",
      "                      K: 41666.667 along [0.000 0.000 1.000]",
    ],
    [
      " ----------------   REGIONS   ----------------",
      "Area:                    40",
      "Perimeter:               28",
      "Bounding box:         X: 30  --  40",
      "                      Y: 0  --  4",
      "Centroid:             X: 35",
      "                      Y: 2",
      "Moments of inertia:   X: 213",
      "                      Y: 49333",
      "Product of inertia:  XY: -2800",
      "Radii of gyration:    X: 2",
      "                      Y: 35",
      "Principal moments and X-Y directions about centroid:",
      "                      I: 53 along [1 0]",
      "                      J: 333 along [0 1]",
      " ----------------   SOLIDS    ----------------",
      "Mass:                    1000",
      "Volume:                  1000",
      "Bounding box:         X: 0  --  10",
      "                      Y: 0  --  20",
      "                      Z: 0  --  5",
      "Centroid:             X: 5",
      "                      Y: 10",
      "                      Z: 3",
      "Moments of inertia:   X: 141667",
      "                      Y: 41667",
      "                      Z: 166667",
      "Products of inertia: XY: -50000",
      "                     YZ: -25000",
      "                     ZX: -12500",
      "Radii of gyration:    X: 12",
      "                      Y: 6",
      "                      Z: 13",
      "Principal moments and X-Y-Z directions about centroid:",
      "                      I: 35417 along [1 0 0]",
      "                      J: 10417 along [0 1 0]",
      "                      K: 41667 along [0 0 1]",
    ],
  ],
  m09: [
    [
      "1 region ignored.",
      " ----------------   REGIONS   ----------------",
      "Area:                    12.5664",
      "Perimeter:               12.5664",
      "Bounding box:         X: 28.0000  --  32.0000",
      "                      Y: -2.0000  --  2.0000",
      "                      Z: 7.0000  --  7.0000",
      "Centroid:             X: 30.0000",
      "                      Y: 0.0000",
      "                      Z: 7.0000",
    ],
    [
      " ----------------   REGIONS   ----------------",
      "Area:                    3.1416",
      "Perimeter:               6.2832",
      "Bounding box:         X: 59.0000  --  61.0000",
      "                      Y: 0.0000  --  0.0000",
      "                      Z: -1.0000  --  1.0000",
      "Centroid:             X: 60.0000",
      "                      Y: 0.0000",
      "                      Z: 0.0000",
    ],
    [
      "2 regions ignored.",
      " ----------------   REGIONS   ----------------",
      "Area:                    28.2743",
      "Perimeter:               18.8496",
      "Bounding box:         X: 47.0000  --  53.0000",
      "                      Y: 0.0000  --  0.0000",
      "                      Z: -3.0000  --  3.0000",
      "Centroid:             X: 50.0000",
      "                      Y: 0.0000",
      "                      Z: 0.0000",
    ],
    [
      "2 regions ignored.",
      " ----------------   REGIONS   ----------------",
      "Area:                    28.2743",
      "Perimeter:               18.8496",
      "Bounding box:         X: 47.0000  --  53.0000",
      "                      Y: 0.0000  --  0.0000",
      "                      Z: -3.0000  --  3.0000",
      "Centroid:             X: 50.0000",
      "                      Y: 0.0000",
      "                      Z: 0.0000",
    ],
  ],
  m05es: [
    [
      " ----------------   SOLIDOS    ----------------",
      "Masa:                     2000.0000",
      "Volumen:                  2000.0000",
      "Cuadro delimitador:   X: 0.0000  --  15.0000",
      "                      Y: 0.0000  --  15.0000",
      "                      Z: 0.0000  --  15.0000",
      "Centro de gravedad:   X: 7.5000",
      "                      Y: 7.5000",
      "                      Z: 7.5000",
      "Momentos de inercia:  X: 283333.3333",
      "                      Y: 283333.3333",
      "                      Z: 283333.3333",
      "Productos de inercia:XY: -125000.0000",
      "                     YZ: -125000.0000",
      "                     ZX: -125000.0000",
      "Radios de giro:       X: 11.9024",
      "                      Y: 11.9024",
      "                      Z: 11.9024",
      "Momentos principales y direcciones X-Y-Z alrededor del centro de gravedad:",
      "                      I: 70833.3333 a lo largo de [0.7071 -0.7071 0.0000]",
      "                      J: 33333.3333 a lo largo de [0.5774 0.5774 0.5774]",
      "                      K: 70833.3333 a lo largo de [-0.4082 -0.4082 0.8165]",
    ],
    [
      " ----------------   REGIONES   ----------------",
      "Área:                    78.5398",
      "Perímetro:               31.4159",
      "Cuadro delimitador:         X: 45.0000  --  55.0000",
      "                      Y: -5.0000  --  5.0000",
      "Centro de gravedad:             X: 50.0000",
      "                      Y: 0.0000",
      "Momentos de inercia:   X: 490.8739",
      "                      Y: 196840.4147",
      "Producto de inercia:  XY: 0.0000",
      "Radios de giro:    X: 2.5000",
      "                      Y: 50.0625",
      "Momentos principales y direcciones X-Y alrededor del centro de gravedad:",
      "                      I: 490.8739 a lo largo de [1.0000 0.0000]",
      "                      J: 490.8739 a lo largo de [0.0000 1.0000]",
      " ----------------   SOLIDOS    ----------------",
      "Masa:                     2000.0000",
      "Volumen:                  2000.0000",
      "Cuadro delimitador:   X: 0.0000  --  15.0000",
      "                      Y: 0.0000  --  15.0000",
      "                      Z: 0.0000  --  15.0000",
      "Centro de gravedad:   X: 7.5000",
      "                      Y: 7.5000",
      "                      Z: 7.5000",
      "Momentos de inercia:  X: 283333.3333",
      "                      Y: 283333.3333",
      "                      Z: 283333.3333",
      "Productos de inercia:XY: -125000.0000",
      "                     YZ: -125000.0000",
      "                     ZX: -125000.0000",
      "Radios de giro:       X: 11.9024",
      "                      Y: 11.9024",
      "                      Z: 11.9024",
      "Momentos principales y direcciones X-Y-Z alrededor del centro de gravedad:",
      "                      I: 70833.3333 a lo largo de [0.7071 -0.7071 0.0000]",
      "                      J: 33333.3333 a lo largo de [0.5774 0.5774 0.5774]",
      "                      K: 70833.3333 a lo largo de [-0.4082 -0.4082 0.8165]",
    ],
    [
      " ----------------   REGIONES   ----------------",
      "Área:                    52.5664",
      "Perímetro:               40.5664",
      "Cuadro delimitador:         X: 0.0000  --  32.0000",
      "                      Y: -2.0000  --  4.0000",
      "Centro de gravedad:             X: 10.9764",
      "                      Y: 1.5219",
      "Momentos de inercia:   X: 225.8997",
      "                      Y: 12655.6333",
      "Producto de inercia:  XY: -400.0000",
      "Radios de giro:    X: 2.0730",
      "                      Y: 15.5163",
      "Momentos principales y direcciones X-Y alrededor del centro de gravedad:",
      "                      I: 67.6016 a lo largo de [0.9971 -0.0762]",
      "                      J: 6358.8776 a lo largo de [0.0762 0.9971]",
    ],
  ],
  m05ptBR: [
    [
      " ----------------   SÓLIDOS    ----------------",
      "Massa:                   2000.0000",
      "Volume:                  2000.0000",
      "Caixa delimitadora:   X: 0.0000  --  15.0000",
      "                      Y: 0.0000  --  15.0000",
      "                      Z: 0.0000  --  15.0000",
      "Centroide:            X: 7.5000",
      "                      Y: 7.5000",
      "                      Z: 7.5000",
      "Momentos de inércia:  X: 283333.3333",
      "                      Y: 283333.3333",
      "                      Z: 283333.3333",
      "Produtos de inércia: XY: -125000.0000",
      "                     YZ: -125000.0000",
      "                     ZX: -125000.0000",
      "Raio de giro:         X: 11.9024",
      "                      Y: 11.9024",
      "                      Z: 11.9024",
      "Principais momentos e direções X Y Z em relação ao centroide.",
      "                      I: 70833.3333 com [0.7071 -0.7071 0.0000]",
      "                      J: 33333.3333 com [0.5774 0.5774 0.5774]",
      "                      K: 70833.3333 com [-0.4082 -0.4082 0.8165]",
    ],
    [
      " ----------------   REGIÕES   ----------------",
      "Área:                    78.5398",
      "Perímetro:               31.4159",
      "Caixa delimitadora:   X: 45.0000  --  55.0000",
      "                      Y: -5.0000  --  5.0000",
      "Centroide:            X: 50.0000",
      "                      Y: 0.0000",
      "Momentos de inércia:  X: 490.8739",
      "                      Y: 196840.4147",
      "Produto de inércia:  XY: 0.0000",
      "Raios de giro:        X: 2.5000",
      "                      Y: 50.0625",
      "Momentos principais e direções X-Y em relação ao centroide:",
      "                      l: 490.8739 em [1.0000 0.0000]",
      "                      J: 490.8739 em [0.0000 1.0000]",
      " ----------------   SÓLIDOS    ----------------",
      "Massa:                   2000.0000",
      "Volume:                  2000.0000",
      "Caixa delimitadora:   X: 0.0000  --  15.0000",
      "                      Y: 0.0000  --  15.0000",
      "                      Z: 0.0000  --  15.0000",
      "Centroide:            X: 7.5000",
      "                      Y: 7.5000",
      "                      Z: 7.5000",
      "Momentos de inércia:  X: 283333.3333",
      "                      Y: 283333.3333",
      "                      Z: 283333.3333",
      "Produtos de inércia: XY: -125000.0000",
      "                     YZ: -125000.0000",
      "                     ZX: -125000.0000",
      "Raio de giro:         X: 11.9024",
      "                      Y: 11.9024",
      "                      Z: 11.9024",
      "Principais momentos e direções X Y Z em relação ao centroide.",
      "                      I: 70833.3333 com [0.7071 -0.7071 0.0000]",
      "                      J: 33333.3333 com [0.5774 0.5774 0.5774]",
      "                      K: 70833.3333 com [-0.4082 -0.4082 0.8165]",
    ],
    [
      " ----------------   REGIÕES   ----------------",
      "Área:                    52.5664",
      "Perímetro:               40.5664",
      "Caixa delimitadora:   X: 0.0000  --  32.0000",
      "                      Y: -2.0000  --  4.0000",
      "Centroide:            X: 10.9764",
      "                      Y: 1.5219",
      "Momentos de inércia:  X: 225.8997",
      "                      Y: 12655.6333",
      "Produto de inércia:  XY: -400.0000",
      "Raios de giro:        X: 2.0730",
      "                      Y: 15.5163",
      "Momentos principais e direções X-Y em relação ao centroide:",
      "                      l: 67.6016 em [0.9971 -0.0762]",
      "                      J: 6358.8776 em [0.0762 0.9971]",
    ],
  ],
  m09es: [
    [
      "1 región ignorada.",
      " ----------------   REGIONES   ----------------",
      "Área:                    12.5664",
      "Perímetro:               12.5664",
      "Cuadro delimitador:         X: 28.0000  --  32.0000",
      "                      Y: -2.0000  --  2.0000",
      "                      Z: 7.0000  --  7.0000",
      "Centro de gravedad:             X: 30.0000",
      "                      Y: 0.0000",
      "                      Z: 7.0000",
    ],
    [
      " ----------------   REGIONES   ----------------",
      "Área:                    3.1416",
      "Perímetro:               6.2832",
      "Cuadro delimitador:         X: 59.0000  --  61.0000",
      "                      Y: 0.0000  --  0.0000",
      "                      Z: -1.0000  --  1.0000",
      "Centro de gravedad:             X: 60.0000",
      "                      Y: 0.0000",
      "                      Z: 0.0000",
    ],
    [
      "2 regiones ignoradas.",
      " ----------------   REGIONES   ----------------",
      "Área:                    28.2743",
      "Perímetro:               18.8496",
      "Cuadro delimitador:         X: 47.0000  --  53.0000",
      "                      Y: 0.0000  --  0.0000",
      "                      Z: -3.0000  --  3.0000",
      "Centro de gravedad:             X: 50.0000",
      "                      Y: 0.0000",
      "                      Z: 0.0000",
    ],
    [
      "2 regiones ignoradas.",
      " ----------------   REGIONES   ----------------",
      "Área:                    28.2743",
      "Perímetro:               18.8496",
      "Cuadro delimitador:         X: 47.0000  --  53.0000",
      "                      Y: 0.0000  --  0.0000",
      "                      Z: -3.0000  --  3.0000",
      "Centro de gravedad:             X: 50.0000",
      "                      Y: 0.0000",
      "                      Z: 0.0000",
    ],
  ],
  m09ptBR: [
    [
      "1 região ignorada.",
      " ----------------   REGIÕES   ----------------",
      "Área:                    12.5664",
      "Perímetro:               12.5664",
      "Caixa delimitadora:   X: 28.0000  --  32.0000",
      "                      Y: -2.0000  --  2.0000",
      "                      Z: 7.0000  --  7.0000",
      "Centroide:            X: 30.0000",
      "                      Y: 0.0000",
      "                      Z: 7.0000",
    ],
    [
      " ----------------   REGIÕES   ----------------",
      "Área:                    3.1416",
      "Perímetro:               6.2832",
      "Caixa delimitadora:   X: 59.0000  --  61.0000",
      "                      Y: 0.0000  --  0.0000",
      "                      Z: -1.0000  --  1.0000",
      "Centroide:            X: 60.0000",
      "                      Y: 0.0000",
      "                      Z: 0.0000",
    ],
    [
      "2 regiões ignoradas.",
      " ----------------   REGIÕES   ----------------",
      "Área:                    28.2743",
      "Perímetro:               18.8496",
      "Caixa delimitadora:   X: 47.0000  --  53.0000",
      "                      Y: 0.0000  --  0.0000",
      "                      Z: -3.0000  --  3.0000",
      "Centroide:            X: 50.0000",
      "                      Y: 0.0000",
      "                      Z: 0.0000",
    ],
    [
      "2 regiões ignoradas.",
      " ----------------   REGIÕES   ----------------",
      "Área:                    28.2743",
      "Perímetro:               18.8496",
      "Caixa delimitadora:   X: 47.0000  --  53.0000",
      "                      Y: 0.0000  --  0.0000",
      "                      Z: -3.0000  --  3.0000",
      "Centroide:            X: 50.0000",
      "                      Y: 0.0000",
      "                      Z: 0.0000",
    ],
  ],
} as const
/** AutoCAD 2027's reports in the console, en-US (probes solid-inquiry/p107–p122). */
const INQUIRY = {
  p107: [
    [
      " ----------------   REGIONS   ----------------",
      "Area:                    78.5398",
      "Perimeter:               31.4159",
      "Bounding box:         X: 45.0000  --  55.0000",
      "                      Y: -5.0000  --  5.0000",
      "Centroid:             X: 50.0000",
      "                      Y: 0.0000",
      "Moments of inertia:   X: 490.8739",
      "                      Y: 196840.4147",
      "Product of inertia:  XY: 0.0000",
      "Radii of gyration:    X: 2.5000",
      "                      Y: 50.0625",
      "Principal moments and X-Y directions about centroid:",
      "                      I: 490.8739 along [1.0000 0.0000]",
      "                      J: 490.8739 along [0.0000 1.0000]",
      " ----------------   SOLIDS    ----------------",
      "Mass:                    1000.0000",
      "Volume:                  1000.0000",
      "Bounding box:         X: 0.0000  --  10.0000",
      "                      Y: 0.0000  --  10.0000",
      "                      Z: 0.0000  --  10.0000",
      "Centroid:             X: 5.0000",
      "                      Y: 5.0000",
      "                      Z: 5.0000",
      "Moments of inertia:   X: 66666.6667",
      "                      Y: 66666.6667",
      "                      Z: 66666.6667",
      "Products of inertia: XY: -25000.0000",
      "                     YZ: -25000.0000",
      "                     ZX: -25000.0000",
      "Radii of gyration:    X: 8.1650",
      "                      Y: 8.1650",
      "                      Z: 8.1650",
      "Principal moments and X-Y-Z directions about centroid:",
      "                      I: 16666.6667 along [1.0000 0.0000 0.0000]",
      "                      J: 16666.6667 along [0.0000 1.0000 0.0000]",
      "                      K: 16666.6667 along [0.0000 0.0000 1.0000]",
    ],
  ],
  p112: [
    [
      " ----------------   SOLIDS    ----------------",
      "Mass:                    1141.3717",
      "Volume:                  1141.3717",
      "Bounding box:         X: 0.0000  --  13.0000",
      "                      Y: 0.0000  --  10.0000",
      "                      Z: 0.0000  --  10.0000",
      "Centroid:             X: 5.7770",
      "                      Y: 5.0000",
      "                      Z: 5.0000",
      "Moments of inertia:   X: 75231.4336",
      "                      Y: 89434.3088",
      "                      Z: 88574.2979",
      "Products of inertia: XY: -32968.5835",
      "                     YZ: -28534.2917",
      "                     ZX: -32968.5835",
      "Radii of gyration:    X: 8.1187",
      "                      Y: 8.8519",
      "                      Z: 8.8093",
      "Principal moments and X-Y-Z directions about centroid:",
      "                      I: 18162.8502 along [1.0000 0.0000 0.0000]",
      "                      J: 22808.0432 along [0.0000 1.0000 0.0000]",
      "                      K: 21948.0322 along [0.0000 0.0000 1.0000]",
    ],
  ],
  p113: [
    [
      " ----------------   SOLIDS    ----------------",
      "Mass:                    986.9734",
      "Volume:                  986.9734",
      "Bounding box:         X: -10.0000  --  10.0000",
      "                      Y: -3.0000  --  3.0000",
      "                      Z: 0.0000  --  20.0000",
      "Centroid:             X: 0.0000",
      "                      Y: 0.0000",
      "                      Z: 10.0000",
      "Moments of inertia:   X: 120759.1265",
      "                      Y: 138249.9374",
      "                      Z: 22061.7910",
      "Products of inertia: XY: 0.0000",
      "                     YZ: 0.0000",
      "                     ZX: 0.0000",
      "Radii of gyration:    X: 11.0613",
      "                      Y: 11.8353",
      "                      Z: 4.7279",
      "Principal moments and X-Y-Z directions about centroid:",
      "                      I: 22061.7910 along [0.9732 0.0000 -0.2298]",
      "                      J: 39552.6019 along [0.0000 1.0000 0.0000]",
      "                      K: 22061.7910 along [0.2298 0.0000 0.9732]",
    ],
    [
      " ----------------   SOLIDS    ----------------",
      "Mass:                    144.0000",
      "Volume:                  144.0000",
      "Bounding box:         X: -3.0000  --  3.0000",
      "                      Y: -3.0000  --  3.0000",
      "                      Z: 7.0000  --  13.0000",
      "Centroid:             X: 0.0000",
      "                      Y: 0.0000",
      "                      Z: 10.0000",
      "Moments of inertia:   X: 15004.8000",
      "                      Y: 15091.2000",
      "                      Z: 604.8000",
      "Products of inertia: XY: 0.0000",
      "                     YZ: 0.0000",
      "                     ZX: 0.0000",
      "Radii of gyration:    X: 10.2078",
      "                      Y: 10.2372",
      "                      Z: 2.0494",
      "Principal moments and X-Y-Z directions about centroid:",
      "                      I: 604.8000 along [0.9988 0.0000 0.0498]",
      "                      J: 691.2000 along [0.0000 1.0000 0.0000]",
      "                      K: 604.8000 along [-0.0498 0.0000 0.9988]",
    ],
  ],
  p114: [
    [
      " ----------------   SOLIDS    ----------------",
      "Mass:                    540.9830",
      "Volume:                  540.9830",
      "Bounding box:         X: -5.0000  --  5.0000",
      "                      Y: -5.0000  --  5.0000",
      "                      Z: 0.0000  --  10.0000",
      "Centroid:             X: 0.0000",
      "                      Y: 0.0000",
      "                      Z: 4.2972",
      "Moments of inertia:   X: 16752.1813",
      "                      Y: 16752.1811",
      "                      Z: 4934.8263",
      "Products of inertia: XY: 0.0000",
      "                     YZ: 0.0000",
      "                     ZX: 0.0000",
      "Radii of gyration:    X: 5.5647",
      "                      Y: 5.5647",
      "                      Z: 3.0203",
      "Principal moments and X-Y-Z directions about centroid:",
      "                      I: 6762.6299 along [1.0000 0.0000 0.0000]",
      "                      J: 6762.6297 along [0.0000 1.0000 0.0000]",
      "                      K: 4934.8263 along [0.0000 0.0000 1.0000]",
    ],
    [
      " ----------------   SOLIDS    ----------------",
      "Mass:                    367.5663",
      "Volume:                  367.5663",
      "Bounding box:         X: -8.0000  --  8.0000",
      "                      Y: 0.0000  --  4.0000",
      "                      Z: -8.0000  --  8.0000",
      "Centroid:             X: -1.4038",
      "                      Y: 2.0000",
      "                      Z: -1.4038",
      "Moments of inertia:   X: 10138.7049",
      "                      Y: 16356.7022",
      "                      Z: 10138.7049",
      "Products of inertia: XY: 1032.0000",
      "                     YZ: 1032.0000",
      "                     ZX: 1735.5000",
      "Radii of gyration:    X: 5.2520",
      "                      Y: 6.6708",
      "                      Z: 5.2520",
      "Principal moments and X-Y-Z directions about centroid:",
      "                      I: 5484.1888 along [0.7071 0.0000 -0.7071]",
      "                      J: 14907.9514 along [0.0000 1.0000 0.0000]",
      "                      K: 10403.9395 along [0.7071 0.0000 0.7071]",
    ],
  ],
  p115: [
    [
      " ----------------   SOLIDS    ----------------",
      "Mass:                    997.8540",
      "Volume:                  997.8540",
      "Bounding box:         X: 0.0000  --  10.0000",
      "                      Y: 0.0000  --  10.0000",
      "                      Z: 0.0000  --  10.0000",
      "Centroid:             X: 4.9897",
      "                      Y: 5.0000",
      "                      Z: 5.0103",
      "Moments of inertia:   X: 66594.9502",
      "                      Y: 66461.2868",
      "                      Z: 66389.9354",
      "Products of inertia: XY: -24895.0958",
      "                     YZ: -24997.6032",
      "                     ZX: -24995.2692",
      "Radii of gyration:    X: 8.1693",
      "                      Y: 8.1611",
      "                      Z: 8.1568",
      "Principal moments and X-Y-Z directions about centroid:",
      "                      I: 16648.6633 along [0.7071 0.0000 -0.7071]",
      "                      J: 16568.3771 along [0.0000 1.0000 0.0000]",
      "                      K: 16550.6135 along [0.7071 0.0000 0.7071]",
    ],
    [
      " ----------------   SOLIDS    ----------------",
      "Mass:                    113.0973",
      "Volume:                  113.0973",
      "Bounding box:         X: -4.5826  --  4.5826",
      "                      Y: -4.5826  --  4.5826",
      "                      Z: 2.0000  --  5.0000",
      "Centroid:             X: 0.0000",
      "                      Y: 0.0000",
      "                      Z: 3.0625",
      "Moments of inertia:   X: 1546.6061",
      "                      Y: 1546.6061",
      "                      Z: 853.8849",
      "Products of inertia: XY: 0.0000",
      "                     YZ: 0.0000",
      "                     ZX: 0.0000",
      "Radii of gyration:    X: 3.6980",
      "                      Y: 3.6980",
      "                      Z: 2.7477",
      "Principal moments and X-Y-Z directions about centroid:",
      "                      I: 485.8768 along [1.0000 0.0000 0.0000]",
      "                      J: 485.8768 along [0.0000 1.0000 0.0000]",
      "                      K: 853.8849 along [0.0000 0.0000 1.0000]",
    ],
  ],
  p116: [
    [
      " ----------------   SOLIDS    ----------------",
      "Mass:                    1300.0000",
      "Volume:                  1300.0000",
      "Bounding box:         X: 0.0000  --  10.0000",
      "                      Y: 0.0000  --  10.0000",
      "                      Z: 0.0000  --  13.0000",
      "Centroid:             X: 5.0000",
      "                      Y: 5.0000",
      "                      Z: 6.5000",
      "Moments of inertia:   X: 116566.6667",
      "                      Y: 116566.6667",
      "                      Z: 86666.6667",
      "Products of inertia: XY: -32500.0000",
      "                     YZ: -42250.0000",
      "                     ZX: -42250.0000",
      "Radii of gyration:    X: 9.4692",
      "                      Y: 9.4692",
      "                      Z: 8.1650",
      "Principal moments and X-Y-Z directions about centroid:",
      "                      I: 29141.6667 along [1.0000 0.0000 0.0000]",
      "                      J: 29141.6667 along [0.0000 1.0000 0.0000]",
      "                      K: 21666.6667 along [0.0000 0.0000 1.0000]",
    ],
    [
      " ----------------   SOLIDS    ----------------",
      "Mass:                    1400.0000",
      "Volume:                  1400.0000",
      "Bounding box:         X: 0.0000  --  10.0000",
      "                      Y: 0.0000  --  10.0000",
      "                      Z: 0.0000  --  14.0000",
      "Centroid:             X: 5.0000",
      "                      Y: 5.0000",
      "                      Z: 7.0000",
      "Moments of inertia:   X: 138133.3333",
      "                      Y: 138133.3333",
      "                      Z: 93333.3333",
      "Products of inertia: XY: -35000.0000",
      "                     YZ: -49000.0000",
      "                     ZX: -49000.0000",
      "Radii of gyration:    X: 9.9331",
      "                      Y: 9.9331",
      "                      Z: 8.1650",
      "Principal moments and X-Y-Z directions about centroid:",
      "                      I: 34533.3333 along [1.0000 0.0000 0.0000]",
      "                      J: 34533.3333 along [0.0000 1.0000 0.0000]",
      "                      K: 23333.3333 along [0.0000 0.0000 1.0000]",
    ],
  ],
  p118: [
    [
      " ----------------   SOLIDS    ----------------",
      "Mass:                    502.6548",
      "Volume:                  502.6548",
      "Bounding box:         X: 66.0000  --  74.0000",
      "                      Y: -4.0000  --  4.0000",
      "                      Z: 0.0000  --  10.0000",
      "Centroid:             X: 70.0000",
      "                      Y: 0.0000",
      "                      Z: 5.0000",
      "Moments of inertia:   X: 18765.7801",
      "                      Y: 2481774.4205",
      "                      Z: 2467029.8790",
      "Products of inertia: XY: 0.0000",
      "                     YZ: 0.0000",
      "                     ZX: -175929.1886",
      "Radii of gyration:    X: 6.1101",
      "                      Y: 70.2662",
      "                      Z: 70.0571",
      "Principal moments and X-Y-Z directions about centroid:",
      "                      I: 6199.4095 along [1.0000 0.0000 0.0000]",
      "                      J: 6199.4095 along [0.0000 1.0000 0.0000]",
      "                      K: 4021.2386 along [0.0000 0.0000 1.0000]",
    ],
    [
      " ----------------   SOLIDS    ----------------",
      "Mass:                    2593.3429",
      "Volume:                  2593.3429",
      "Bounding box:         X: -13.0000  --  74.0000",
      "                      Y: -13.0000  --  13.0000",
      "                      Z: -3.0000  --  12.0000",
      "Centroid:             X: 18.4134",
      "                      Y: 0.0000",
      "                      Z: 1.3325",
      "Moments of inertia:   X: 123287.1848",
      "                      Y: 3088950.6498",
      "                      Z: 3161685.3466",
      "Products of inertia: XY: 0.0000",
      "                     YZ: 0.0000",
      "                     ZX: -213628.3004",
      "Radii of gyration:    X: 6.8949",
      "                      Y: 34.5124",
      "                      Z: 34.9164",
      "Principal moments and X-Y-Z directions about centroid:",
      "                      I: 108333.5108 along [0.9976 0.0000 0.0688]",
      "                      J: 2205066.1323 along [0.0000 1.0000 0.0000]",
      "                      K: 2292754.5031 along [-0.0688 0.0000 0.9976]",
    ],
    [
      " ----------------   SOLIDS    ----------------",
      "Mass:                    2593.3429",
      "Volume:                  2593.3429",
      "Bounding box:         X: -13.0000  --  74.0000",
      "                      Y: -11.6603  --  11.6603",
      "                      Z: -8.0000  --  10.6603",
      "Centroid:             X: 18.4134",
      "                      Y: -0.6663",
      "                      Z: 1.1540",
      "Moments of inertia:   X: 123287.1848",
      "                      Y: 3107134.3240",
      "                      Z: 3143501.6724",
      "Products of inertia: XY: 106814.1502",
      "                     YZ: -31495.0476",
      "                     ZX: -185007.5352",
      "Radii of gyration:    X: 6.8949",
      "                      Y: 34.6139",
      "                      Z: 34.8158",
      "Principal moments and X-Y-Z directions about centroid:",
      "                      I: 108333.5108 along [0.9976 -0.0344 0.0596]",
      "                      J: 2205066.1323 along [0.0000 0.8660 0.5000]",
      "                      K: 2292754.5031 along [-0.0688 -0.4988 0.8640]",
    ],
  ],
  p119: [
    [
      " ----------------   SOLIDS    ----------------",
      "Mass:                    1776.5288",
      "Volume:                  1776.5288",
      "Bounding box:         X: -13.0000  --  13.0000",
      "                      Y: -11.6603  --  11.6603",
      "                      Z: -8.0000  --  8.0000",
      "Centroid:             X: 0.0000",
      "                      Y: 0.0000",
      "                      Z: 0.0000",
      "Moments of inertia:   X: 98819.4141",
      "                      Y: 121525.6727",
      "                      Z: 166938.1899",
      "Products of inertia: XY: 0.0000",
      "                     YZ: -39328.3936",
      "                     ZX: 0.0000",
      "Radii of gyration:    X: 7.4582",
      "                      Y: 8.2708",
      "                      Z: 9.6937",
      "Principal moments and X-Y-Z directions about centroid:",
      "                      I: 98819.4141 along [1.0000 0.0000 0.0000]",
      "                      J: 98819.4141 along [0.0000 0.8660 0.5000]",
      "                      K: 189644.4486 along [0.0000 -0.5000 0.8660]",
    ],
    [
      " ----------------   SOLIDS    ----------------",
      "Mass:                    314.1593",
      "Volume:                  314.1593",
      "Bounding box:         X: -5.0000  --  5.0000",
      "                      Y: -6.0000  --  4.3301",
      "                      Z: -2.5000  --  10.3923",
      "Centroid:             X: 0.0000",
      "                      Y: -1.5000",
      "                      Z: 2.5981",
      "Moments of inertia:   X: 5701.9907",
      "                      Y: 4865.5416",
      "                      Z: 3192.6435",
      "Products of inertia: XY: 0.0000",
      "                     YZ: 1448.7722",
      "                     ZX: 0.0000",
      "Radii of gyration:    X: 4.2603",
      "                      Y: 3.9354",
      "                      Z: 3.1879",
      "Principal moments and X-Y-Z directions about centroid:",
      "                      I: 2874.5573 along [1.0000 -0.0054 -0.0031]",
      "                      J: 2874.5573 along [0.0063 0.8660 0.5000]",
      "                      K: 2356.1945 along [0.0000 -0.5000 0.8660]",
    ],
  ],
  p122: [
    [
      " ----------------   SOLIDS    ----------------",
      "Mass:                    1030.0000",
      "Volume:                  1030.0000",
      "Bounding box:         X: 0.0000  --  10.3000",
      "                      Y: 0.0000  --  20.0000",
      "                      Z: 0.0000  --  5.0000",
      "Centroid:             X: 5.1500",
      "                      Y: 10.0000",
      "                      Z: 2.5000",
      "Moments of inertia:   X: 145916.6667",
      "                      Y: 45007.5667",
      "                      Z: 173757.5667",
      "Products of inertia: XY: -53045.0000",
      "                     YZ: -25750.0000",
      "                     ZX: -13261.2500",
      "Radii of gyration:    X: 11.9024",
      "                      Y: 6.6103",
      "                      Z: 12.9883",
      "Principal moments and X-Y-Z directions about centroid:",
      "                      I: 36479.1667 along [1.0000 0.0000 0.0000]",
      "                      J: 11251.8917 along [0.0000 1.0000 0.0000]",
      "                      K: 43439.3917 along [0.0000 0.0000 1.0000]",
    ],
    [
      " ----------------   REGIONS   ----------------",
      "Area:                    41.2000",
      "Perimeter:               28.6000",
      "Bounding box:         X: 30.0000  --  40.3000",
      "                      Y: 0.0000  --  4.0000",
      "Centroid:             X: 35.1500",
      "                      Y: 2.0000",
      "Moments of inertia:   X: 219.7333",
      "                      Y: 51267.7693",
      "Product of inertia:  XY: -2896.3600",
      "Radii of gyration:    X: 2.3094",
      "                      Y: 35.2755",
      "Principal moments and X-Y directions about centroid:",
      "                      I: 54.9333 along [1.0000 0.0000]",
      "                      J: 364.2423 along [0.0000 1.0000]",
    ],
  ],
} as const

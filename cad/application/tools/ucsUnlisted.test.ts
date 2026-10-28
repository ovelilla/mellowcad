import { describe, expect, it } from "vitest"

import { type CadHarness, createHarness } from "../../../test/harness"
import { lineOf, p } from "../../../test/builders"
import { es } from "../../locales/es"

/** Typed at the command line and confirmed, as AutoCAD's prompt reads it. */
function answer(cad: CadHarness, ...texts: string[]): CadHarness {
  for (const text of texts) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

/** A drawing written at AutoCAD's LUPREC 4, as the console's is. */
function harness(): CadHarness {
  const cad = createHarness()
  cad.runtime.setDocumentPrecision(4)
  return cad
}

/** The current UCS's origin and axes, as UCSORG, UCSXDIR and UCSYDIR. */
function axes(cad: CadHarness) {
  const { origin, xAxis, yAxis } = cad.runtime.document.getSettings().ucs
  const round = (v: { x: number; y: number; z: number }) =>
    [v.x, v.y, v.z].map((n) => +n.toFixed(4) + 0)
  return { origin: round(origin), x: round(xAxis), y: round(yAxis) }
}

const ORIGIN =
  "Specify origin of UCS or [Face/NAmed/OBject/Previous/View/World/X/Y/Z/ZAxis] <World>:"
const ORTHOGRAPHIC = "Enter an option [Top/Bottom/Front/BAck/Left/Right]"

/** `ID @`'s line: LASTPOINT read in the current UCS. */
function lastPoint(cad: CadHarness): string {
  answer(cad, "ID", "@")
  return cad.commandLog().at(-1)!
}

/** The next UCS's `Current ucs name:` line, then Escape. */
function currentName(cad: CadHarness): string {
  answer(cad, "UCS")
  const line = cad.commandLog().at(-1)!
  cad.escape()
  return line
}

const FACE = "Select face of solid, surface, or mesh:"
const NEW =
  "Specify origin of new UCS or [ZAxis/3point/OBject/Face/View/X/Y/Z] <0,0,0>:"

// The words UCS's first prompt declares and does not list, each answered as
// AutoCAD 2027's console answers it (probes ucs/p200–p227, p263–p269,
// p420–p426, in both languages).
describe("UCS's unlisted words", () => {
  it("Origin moves the origin, the axes kept", () => {
    const cad = harness()
    cad.command("UCS")
    answer(cad, "O", "FOO", "100,50")
    expect(cad.commandLog().slice(2)).toEqual([
      `${ORIGIN} O`,
      "Specify new origin point <0,0,0>: FOO",
      "Invalid point.",
      "Specify new origin point <0,0,0>: 100,50",
    ])
    expect(axes(cad)).toEqual({
      origin: [100, 50, 0],
      x: [1, 0, 0],
      y: [0, 1, 0],
    })
    answer(cad, "UCS", "OR")
    expect(cad.state().commandLine.prompt).toBe(
      "UCS Specify new origin point <0,0,0>:"
    )
    cad.enter()
    expect(axes(cad).origin).toEqual([100, 50, 0])
  })

  // probes ucs/p227, p265, p246: Origin's answer always sets the UCS again,
  // so its Enter, and Origin or New at the current origin, drop a saved or
  // an orthographic name; U puts it back, one step named UCS.
  it("Origin's Enter, and Origin or New at the origin, drop the name", () => {
    const cad = harness()
    const name = () => cad.runtime.document.getSettings().ucsName
    answer(cad, "UCS", "NA", "S", "AA", "UCS", "O", "")
    expect(name()).toBeNull()
    const from = cad.commandLog().length
    answer(cad, "U")
    expect(cad.commandLog().slice(from)).toEqual(["U", "UCS"])
    expect(name()).toBe("AA")
    answer(cad, "UCS", "O", "")
    expect(currentName(cad)).toBe("Current ucs name:  *WORLD*")
    answer(cad, "UCS", "FR", "UCS", "O", "")
    expect(currentName(cad)).toBe("Current ucs name:  *NO NAME*")
    expect(axes(cad)).toEqual({ origin: [0, 0, 0], x: [1, 0, 0], y: [0, 0, 1] })
    answer(cad, "UCS", "FR", "UCS", "O", "0,0,0")
    expect(currentName(cad)).toBe("Current ucs name:  *NO NAME*")
    answer(cad, "UCS", "FR", "UCS", "N", "0,0,0")
    expect(currentName(cad)).toBe("Current ucs name:  *NO NAME*")
  })

  // probes ucs/p200, p203: Origin's point is LASTPOINT; its Enter leaves it
  // at the WCS's origin.
  it("Origin's point is LASTPOINT, its Enter leaves the WCS's origin", () => {
    const cad = harness()
    answer(cad, "ID", "7,8,9", "UCS", "O", "10,20,5")
    expect(lastPoint(cad)).toBe(" X = 0.0000     Y = 0.0000     Z = 0.0000")
    answer(cad, "UCS", "O", "30,0,0", "ID", "7,8,9", "UCS", "O", "")
    expect(lastPoint(cad)).toBe(
      " X = -40.0000     Y = -20.0000     Z = -5.0000"
    )
  })

  it("3point asks its three points, each with a default", () => {
    const cad = harness()
    cad.command("UCS")
    answer(cad, "3", "FOO", "100,0", "FOO", "100,0", "200,50", "FOO")
    answer(cad, "300,100", "")
    expect(cad.commandLog().slice(2)).toEqual([
      `${ORIGIN} 3`,
      "Specify new origin point <0,0,0>: FOO",
      "Invalid point.",
      "Specify new origin point <0,0,0>: 100,0",
      "Specify point on positive portion of X-axis <101.0000,0.0000,0.0000>: FOO",
      "Invalid point.",
      "Specify point on positive portion of X-axis <101.0000,0.0000,0.0000>: 100,0",
      "Coincident with first point",
      "Specify point on positive portion of X-axis <101.0000,0.0000,0.0000>: 200,50",
      "Specify point on positive-Y portion of the UCS XY plane <99.5528,0.8944,0.0000>: FOO",
      "Invalid point.",
      "Specify point on positive-Y portion of the UCS XY plane <99.5528,0.8944,0.0000>: 300,100",
      "Points are colinear",
      "Specify point on positive-Y portion of the UCS XY plane <99.5528,0.8944,0.0000>:",
    ])
    expect(axes(cad)).toEqual({
      origin: [100, 0, 0],
      x: [0.8944, 0.4472, 0],
      y: [-0.4472, 0.8944, 0],
    })
  })

  it("3point's defaults are the current UCS's, read in it", () => {
    const cad = harness()
    answer(cad, "UCS", "Z", "90", "UCS", "3", "10,0", "", "")
    expect(cad.commandLog().slice(-3)).toEqual([
      "Specify new origin point <0,0,0>: 10,0",
      "Specify point on positive portion of X-axis <11.0000,0.0000,0.0000>:",
      "Specify point on positive-Y portion of the UCS XY plane <10.0000,1.0000,0.0000>:",
    ])
    expect(axes(cad)).toEqual({
      origin: [0, 10, 0],
      x: [0, 1, 0],
      y: [-1, 0, 0],
    })
  })

  // probe ucs/p207: 3point writes its defaults at LUPREC, here 2.
  it("3point writes its defaults at the drawing's precision", () => {
    const cad = createHarness()
    cad.runtime.setDocumentPrecision(2)
    answer(cad, "UCS", "Z", "30", "UCS", "3", "100,0,0", "", "")
    expect(cad.commandLog().slice(-2)).toEqual([
      "Specify point on positive portion of X-axis <101.00,0.00,0.00>:",
      "Specify point on positive-Y portion of the UCS XY plane <100.00,1.00,0.00>:",
    ])
    expect(axes(cad).origin).toEqual([86.6025, 50, 0])
  })

  // probes ucs/p204, p208, p263, p264: 3point's origin is LASTPOINT, typed
  // or taken by Enter; its point on X is not; its third point is.
  it("3point's origin and third point are LASTPOINT, its X point not", () => {
    const at = (...texts: string[]) => {
      const cad = harness()
      answer(cad, "UCS", "O", "30,0,0", "ID", "7,8,9", ...texts)
      return lastPoint(cad)
    }
    const origin = " X = 0.0000     Y = 0.0000     Z = 0.0000"
    expect(at("UCS", "3", "", "", "")).toBe(origin)
    expect(at("UCS", "3", "100,0,0", "", "")).toBe(origin)
    expect(at("UCS", "3", "0,0,0", "5,0,0", "")).toBe(origin)
    expect(at("UCS", "3", "0,0,0", "1,0,0", "0,1,0")).toBe(
      " X = 0.0000     Y = 1.0000     Z = 0.0000"
    )
  })

  it("the first prompt's points say coincident and colinear too", () => {
    const cad = harness()
    answer(cad, "UCS", "0,0", "0,0", "10,0", "20,0", "0,10")
    expect(cad.commandLog().slice(3)).toEqual([
      "Specify point on X-axis or <accept>: 0,0",
      "Coincident with first point",
      "Specify point on X-axis or <accept>: 10,0",
      "Specify point on the XY plane or <accept>: 20,0",
      "Points are colinear",
      "Specify point on the XY plane or <accept>: 0,10",
    ])
  })

  it("Move moves the origin, or along Z by its Zdepth", () => {
    const cad = harness()
    answer(cad, "UCS", "Z", "30", "UCS", "M", "FOO", "10,0")
    expect(cad.commandLog().slice(-3)).toEqual([
      "Specify new origin point or [Zdepth]<0,0,0>: FOO",
      "Point or option keyword required.",
      "Specify new origin point or [Zdepth]<0,0,0>: 10,0",
    ])
    expect(axes(cad)).toEqual({
      origin: [8.6603, 5, 0],
      x: [0.866, 0.5, 0],
      y: [-0.5, 0.866, 0],
    })

    const depth = harness()
    answer(depth, "UCS", "M", "Z", "FOO", "5", "UCS", "M", "Z", "0,0", "0,5")
    expect(depth.commandLog().slice(2, 7)).toEqual([
      `${ORIGIN} M`,
      "Specify new origin point or [Zdepth]<0,0,0>: Z",
      "Specify Zdepth<0>: FOO",
      "Requires numeric distance or two points.",
      "Specify Zdepth<0>: 5",
    ])
    expect(depth.commandLog().slice(-2)).toEqual([
      "Specify Zdepth<0>: 0,0",
      " Specify second point: 0,5",
    ])
    expect(axes(depth).origin).toEqual([0, 0, 10])
    answer(depth, "UCS", "M", "", "UCS", "M", "Z", "")
    expect(axes(depth).origin).toEqual([0, 0, 10])
  })

  // probes ucs/p266, p265, p227: Move and its Zdepth keep the UCS's name,
  // orthographic or saved, and rewrite the saved one in the same step; no
  // displacement changes nothing.
  it("Move keeps the name and rewrites the saved UCS", () => {
    const cad = harness()
    answer(cad, "UCS", "FR", "UCS", "M", "5,0,0")
    expect(currentName(cad)).toBe("Current ucs name:  *FRONT*")
    expect(axes(cad)).toEqual({ origin: [5, 0, 0], x: [1, 0, 0], y: [0, 0, 1] })
    answer(cad, "UCS", "NA", "S", "AA", "UCS", "M", "Z", "3")
    expect(currentName(cad)).toBe("Current ucs name:  AA")
    expect(axes(cad).origin).toEqual([5, -3, 0])
    const saved = () =>
      cad.runtime.document
        .getSettings()
        .namedUcs.map(({ name, ucs }) => [name, ucs.origin])
    expect(saved()).toEqual([["AA", { x: 5, y: -3, z: 0 }]])
    answer(cad, "UCS", "W", "UCS", "R", "AA")
    expect(axes(cad)).toEqual({
      origin: [5, -3, 0],
      x: [1, 0, 0],
      y: [0, 0, 1],
    })
    // One step: U takes back the move and the saved entry together.
    answer(cad, "UCS", "M", "1,0,0", "U")
    expect(axes(cad).origin).toEqual([5, -3, 0])
    expect(saved()).toEqual([["AA", { x: 5, y: -3, z: 0 }]])
    expect(currentName(cad)).toBe("Current ucs name:  AA")
    // Origin from it drops the name and leaves the saved one (p266).
    answer(cad, "UCS", "O", "1,0,0")
    expect(currentName(cad)).toBe("Current ucs name:  *NO NAME*")
    expect(saved()).toEqual([["AA", { x: 5, y: -3, z: 0 }]])
  })

  it("Move with no displacement changes nothing", () => {
    for (const way of [
      ["M", ""],
      ["M", "0,0,0"],
      ["M", "Z", ""],
      ["M", "Z", "0"],
    ]) {
      const cad = harness()
      answer(cad, "UCS", "FR")
      const before = cad.runtime.document.getSettings()
      answer(cad, "UCS", ...way)
      expect(cad.runtime.document.getSettings()).toBe(before)
      expect(currentName(cad)).toBe("Current ucs name:  *FRONT*")
    }
  })

  // probes ucs/p210, p211, p213: Move's point is LASTPOINT; Zdepth leaves it
  // at the WCS's origin, by a distance or two points.
  it("Move's point is LASTPOINT, Zdepth leaves it", () => {
    const cad = harness()
    answer(cad, "ID", "7,8,9", "UCS", "M", "10,0,0")
    expect(lastPoint(cad)).toBe(" X = 0.0000     Y = 0.0000     Z = 0.0000")
    answer(cad, "UCS", "W", "UCS", "X", "90", "ID", "7,8,9")
    answer(cad, "UCS", "M", "Z", "5")
    expect(lastPoint(cad)).toBe(" X = 0.0000     Y = 0.0000     Z = -5.0000")
    answer(cad, "UCS", "M", "Z", "0,0", "0,3")
    expect(lastPoint(cad)).toBe(" X = 0.0000     Y = 0.0000     Z = -8.0000")
  })

  it("orthoGraphic sets one of six, named, and offers the current one", () => {
    const cad = harness()
    answer(cad, "UCS", "G", "FOO", "BA")
    expect(cad.commandLog().slice(-4)).toEqual([
      `${ORIGIN} G`,
      `${ORTHOGRAPHIC}<Top>: FOO`,
      "Invalid option keyword.",
      `${ORTHOGRAPHIC}<Top>: BA`,
    ])
    expect(axes(cad)).toEqual({
      origin: [0, 0, 0],
      x: [-1, 0, 0],
      y: [0, 0, 1],
    })
    answer(cad, "UCS", "G", "R", "UCS", "B", "UCS", "G")
    expect(cad.commandLog().slice(-9)).toEqual([
      "Current ucs name:  *BACK*",
      `${ORIGIN} G`,
      `${ORTHOGRAPHIC}<Back>: R`,
      "UCS",
      "Current ucs name:  *RIGHT*",
      `${ORIGIN} B`,
      "UCS",
      "Current ucs name:  *BOTTOM*",
      `${ORIGIN} G`,
    ])
    expect(cad.state().commandLine.prompt).toBe(`UCS ${ORTHOGRAPHIC}<Bottom>:`)
    cad.enter()
    expect(axes(cad)).toEqual({
      origin: [0, 0, 0],
      x: [-1, 0, 0],
      y: [0, 1, 0],
    })

    // Another UCS forgets it, even with the same axes (probe ucs/p217).
    answer(cad, "UCS", "W", "UCS", "X", "90", "UCS", "G", "")
    expect(cad.commandLog().slice(-4)).toEqual([
      "UCS",
      "Current ucs name:  *NO NAME*",
      `${ORIGIN} G`,
      `${ORTHOGRAPHIC}<Top>:`,
    ])
    answer(cad, "UCS")
    expect(cad.commandLog().at(-1)).toBe("Current ucs name:  *TOP*")
  })

  it("Top, Bottom, FRont, BAck, Left and RIght, at the WCS's origin", () => {
    const set = (word: string) => {
      const cad = harness()
      answer(cad, "UCS", "O", "100,50", "UCS", word)
      return axes(cad)
    }
    expect(set("T")).toEqual({ origin: [0, 0, 0], x: [1, 0, 0], y: [0, 1, 0] })
    expect(set("B")).toEqual({ origin: [0, 0, 0], x: [-1, 0, 0], y: [0, 1, 0] })
    expect(set("FR")).toEqual({ origin: [0, 0, 0], x: [1, 0, 0], y: [0, 0, 1] })
    expect(set("BA")).toEqual({
      origin: [0, 0, 0],
      x: [-1, 0, 0],
      y: [0, 0, 1],
    })
    expect(set("L")).toEqual({ origin: [0, 0, 0], x: [0, -1, 0], y: [0, 0, 1] })
    expect(set("RI")).toEqual({ origin: [0, 0, 0], x: [0, 1, 0], y: [0, 0, 1] })
  })

  // probes ucs/p220, p221, p268, p420, p424: Face asks for a solid's face,
  // which no object here has (there are no solids, surfaces or meshes): a
  // pick says so and ends, LASTPOINT at it; Enter ends; FOO is refused with
  // the three modes its prompt declares and does not list.
  it("Face asks for a face, which nothing here has", () => {
    const cad = createHarness({ entities: [lineOf(p(0, 0), p(10, 5))] })
    answer(cad, "UCS", "F")
    expect(cad.state().commandLine.prompt).toBe(`UCS ${FACE}`)
    answer(cad, "FOO", "5,2.5")
    expect(cad.commandLog().slice(2)).toEqual([
      `${ORIGIN} F`,
      `${FACE} FOO`,
      "*Invalid selection*",
      "Expects a point or Crossing/Fence/CPolygon",
      `${FACE} 5,2.5`,
      "No 3D solid, surface or mesh detected.",
    ])
    expect(cad.activeToolId()).toBe("select")
    expect(lastPoint(cad)).toBe(" X = 5.00     Y = 2.50     Z = 0.00")

    answer(cad, "UCS", "FA")
    cad.click(p(5, 2.5))
    expect(cad.commandLog().at(-1)).toBe(
      "No 3D solid, surface or mesh detected."
    )
    const settings = cad.runtime.document.getSettings()
    answer(cad, "UCS", "F", "")
    expect(cad.commandLog().at(-1)).toBe(FACE)
    expect(cad.activeToolId()).toBe("select")
    expect(cad.runtime.document.getSettings()).toBe(settings)
  })

  // probes ucs/p421–p423, p426: a crossing window says no solid was found,
  // whatever it crosses; a fence or a crossing polygon ends in silence.
  it("Face's Crossing says none was found, its Fence and CPolygon nothing", () => {
    const cad = createHarness({ entities: [lineOf(p(0, 0), p(10, 5))] })
    answer(cad, "UCS", "F", "C", "0,0", "10,10")
    expect(cad.commandLog().slice(-4)).toEqual([
      `${FACE} C`,
      "Specify first corner: 0,0",
      "Specify opposite corner: 10,10",
      "No 3D solid, surface or mesh detected.",
    ])
    expect(cad.activeToolId()).toBe("select")
    answer(cad, "UCS", "F", "C", "500,500", "510,510")
    expect(cad.commandLog().at(-1)).toBe(
      "No 3D solid, surface or mesh detected."
    )
    answer(cad, "UCS", "F", "F", "0,10", "10,0", "")
    expect(cad.commandLog().slice(-4)).toEqual([
      `${FACE} F`,
      "Specify first fence point or pick/drag cursor: 0,10",
      "Specify next fence point or [Undo]: 10,0",
      "Specify next fence point or [Undo]:",
    ])
    expect(cad.activeToolId()).toBe("select")
    answer(cad, "UCS", "F", "CP", "-1,-1", "11,-1", "11,11", "")
    expect(cad.commandLog().at(-1)).toBe("Specify endpoint of line or [Undo]:")
    expect(cad.activeToolId()).toBe("select")
    expect(cad.runtime.document.getSettings().ucsName).toBeNull()
  })

  it("Face asks in Spanish too", () => {
    const cad = createHarness({ locale: es })
    answer(cad, "SCP", "C", "FOO", "5,2.5")
    expect(cad.commandLog().slice(-5)).toEqual([
      "Designe la cara del sólido, la superficie o la malla: FOO",
      "*Designación no válida*",
      "Requiere un punto o Captura/Borde/polígonOC",
      "Designe la cara del sólido, la superficie o la malla: 5,2.5",
      "No hay ningún sólido, superficie o malla 3D.",
    ])
  })

  it("Restore, Save, Delete and ? are NAmed's, typed straight away", () => {
    const cad = harness()
    answer(cad, "UCS", "S", "AA", "UCS", "?", "")
    expect(cad.commandLog().slice(2, 4)).toEqual([
      `${ORIGIN} S`,
      "Enter name to save current UCS or [?]: AA",
    ])
    expect(cad.commandLog().slice(-2)).toEqual([
      "Enter UCS name(s) to list <*>:",
      [
        'Current ucs name: "AA"',
        "",
        "Saved coordinate systems:",
        "",
        '"AA"',
        "     Origin = <0.0000,0.0000,0.0000>, X Axis = <1.0000,0.0000,0.0000>",
        "     Y Axis = <0.0000,1.0000,0.0000>, Z Axis = <0.0000,0.0000,1.0000>",
      ].join("\n"),
    ])
    // The listing asks the first prompt again (probe ucs/p243).
    expect(cad.state().commandLine.prompt).toBe(`UCS ${ORIGIN}`)
    answer(cad, "O", "50,0", "UCS", "R", "AA")
    expect(axes(cad).origin).toEqual([0, 0, 0])
    answer(cad, "UCS", "D", "AA")
    expect(cad.commandLog().slice(-3)).toEqual([
      `${ORIGIN} D`,
      "Enter UCS name(s) to delete <none>: AA",
      "Deleted 1 UCS name.",
    ])
  })

  // probes ucs/p218, p223, p225, p425: New lists Face; its Enter is World,
  // named *WORLD*; its point is LASTPOINT.
  it("New asks its own prompt, its own words answering", () => {
    const cad = createHarness({ entities: [lineOf(p(50, 0), p(100, 0))] })
    answer(cad, "UCS", "N", "FOO", "W")
    expect(cad.commandLog().slice(2)).toEqual([
      `${ORIGIN} N`,
      `${NEW} FOO`,
      "Point or option keyword required.",
      `${NEW} W`,
      "Point or option keyword required.",
    ])
    answer(cad, "Z", "30")
    expect(cad.commandLog().at(-1)).toBe(
      "Specify rotation angle about Z axis <90>: 30"
    )
    answer(cad, "UCS", "W", "UCS", "N", "O", "100,50")
    expect(cad.commandLog().slice(-2)).toEqual([
      `${NEW} O`,
      "Specify new origin point <0,0,0>: 100,50",
    ])
    answer(cad, "UCS", "W", "UCS", "N", "E", "W", "40,-10", "110,10")
    expect(cad.commandLog()).toContain("Select object to align UCS: W")
    expect(cad.runtime.document.getSettings().ucs.origin).toEqual({
      x: 50,
      y: 0,
      z: 0,
    })
    answer(cad, "UCS", "N", "100,0")
    expect(cad.runtime.document.getSettings().ucs.origin).toEqual({
      x: 150,
      y: 0,
      z: 0,
    })
    for (const word of ["F", "FA"]) {
      answer(cad, "UCS", "N", word)
      expect(cad.state().commandLine.prompt).toBe(`UCS ${FACE}`)
      cad.enter()
      expect(cad.activeToolId()).toBe("select")
    }
  })

  it("New's Enter is World, named *WORLD*, and its point LASTPOINT", () => {
    const cad = harness()
    answer(cad, "UCS", "Z", "30", "UCS", "N", "")
    expect(currentName(cad)).toBe("Current ucs name:  *WORLD*")
    answer(cad, "UCS", "NA", "S", "AA", "UCS", "N", "")
    expect(currentName(cad)).toBe("Current ucs name:  *WORLD*")
    answer(cad, "ID", "7,8,9", "UCS", "N", "10,0,0")
    expect(lastPoint(cad)).toBe(" X = 0.0000     Y = 0.0000     Z = 0.0000")
  })

  it("Entity is OBject", () => {
    const cad = createHarness({ entities: [lineOf(p(50, 0), p(100, 0))] })
    answer(cad, "UCS", "E", "W", "40,-10", "110,10")
    expect(cad.commandLog()[2]).toBe(`${ORIGIN} E`)
    expect(cad.commandLog()[3]).toBe("Select object to align UCS: W")
    expect(cad.runtime.document.getSettings().ucs.origin).toEqual({
      x: 50,
      y: 0,
      z: 0,
    })
  })

  it("asks in Autodesk's Spanish, whose O is Ortogonal", () => {
    const cad = createHarness({ locale: es })
    cad.runtime.setDocumentPrecision(4)
    answer(cad, "SCP", "O", "")
    answer(cad, "SCP", "DE", "Z", "5", "SCP", "OR", "100,0")
    answer(cad, "SCP", "3", "", "", "", "SCP", "N")
    const ORIGEN =
      "Indique origen de SCP o [Cara/gUArdado/oBjeto/PRev/Vista/Univ/X/Y/Z/ejEZ] <Univ>:"
    expect(cad.commandLog()).toEqual([
      "SCP",
      "Nombre de scp actual:  *UNIVERSAL*",
      `${ORIGEN} O`,
      "Indique una opción [SUperior/Inferior/Frontal/Posterior/IZquierda/Derecha]<Superior>:",
      "SCP",
      "Nombre de scp actual:  *SUPERIOR*",
      `${ORIGEN} DE`,
      "Precise nuevo punto de origen o [profundidadZ]<0,0,0>: Z",
      "Precise profundidadZ<0>: 5",
      "SCP",
      "Nombre de scp actual:  *SUPERIOR*",
      `${ORIGEN} OR`,
      "Precise nuevo punto de origen <0,0,0>: 100,0",
      "SCP",
      "Nombre de scp actual:  *SIN NOMBRE*",
      `${ORIGEN} 3`,
      "Precise nuevo punto de origen <0,0,0>:",
      "Precise punto en parte positiva del eje X <1.0000,0.0000,0.0000>:",
      "Precise punto en parte Y positiva del plano XY del SCP <0.0000,1.0000,0.0000>:",
      "SCP",
      "Nombre de scp actual:  *SIN NOMBRE*",
      `${ORIGEN} N`,
    ])
    expect(cad.state().commandLine.prompt).toBe(
      "SCP Precise origen de nuevo SCP o [ejEZ/3p/oBjeto/Cara/Vista/X/Y/Z] <0,0,0>:"
    )
  })
})

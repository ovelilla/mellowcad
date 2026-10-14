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
  "Specify origin of UCS or [NAmed/OBject/Previous/View/World/X/Y/Z/ZAxis] <World>:"
const ORTHOGRAPHIC = "Enter an option [Top/Bottom/Front/BAck/Left/Right]"

// The words UCS's first prompt declares and does not list (table 25652),
// each answered as AutoCAD 2023's console answers it (acc/u1–u30, p1–p33,
// q1–q24 of the hidden UCS words session).
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

    // Another UCS forgets it, even with the same axes (acc/q12, q13).
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

  it("refuses Face, which needs a solid, rather than reading F as FRont", () => {
    const cad = harness()
    answer(cad, "UCS", "F")
    expect(cad.commandLog().slice(-2)).toEqual([
      `${ORIGIN} F`,
      "Point or option keyword required.",
    ])
    cad.type("F").enter()
    expect(cad.commandLog().slice(-2)).toEqual([
      `${ORIGIN} F`,
      "Point or option keyword required.",
    ])
    expect(cad.state().commandLine.prompt).toBe(`UCS ${ORIGIN}`)
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
    // The listing asks the first prompt again (acc/u19).
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

  it("New asks the older prompt, its own words answering", () => {
    const cad = createHarness({ entities: [lineOf(p(50, 0), p(100, 0))] })
    answer(cad, "UCS", "N", "FOO", "W")
    const NEW =
      "Specify origin of new UCS or [ZAxis/3point/OBject/View/X/Y/Z] <0,0,0>:"
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
      "Indique origen de SCP o [gUArdado/oBjeto/PRev/Vista/Univ/X/Y/Z/ejEZ] <Univ>:"
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
      "Nombre de scp actual:  *SIN NOMBRE*",
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
      "SCP Precise origen de nuevo SCP o [ejEZ/3p/oBjeto/Vista/X/Y/Z] <0,0,0>:"
    )
  })
})

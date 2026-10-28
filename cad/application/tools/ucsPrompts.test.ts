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

// probes ucs/p100, p101: Face listed first, in both languages (table 33659).
const ORIGIN =
  "Specify origin of UCS or [Face/NAmed/OBject/Previous/View/World/X/Y/Z/ZAxis] <World>:"
const ORIGIN_ES =
  "Indique origen de SCP o [Cara/gUArdado/oBjeto/PRev/Vista/Univ/X/Y/Z/ejEZ] <Univ>:"

// Each transcript is AutoCAD 2027's console answering the same input.
describe("UCS asks as AutoCAD 2027", () => {
  it("lists Face first, in Spanish too", () => {
    const cad = createHarness()
    cad.command("UCS")
    expect(cad.state().commandLine.prompt).toBe(`UCS ${ORIGIN}`)
    const spanish = createHarness({ locale: es })
    spanish.command("SCP")
    expect(spanish.state().commandLine.prompt).toBe(`SCP ${ORIGIN_ES}`)
  })

  // probes ucs/p107, p116, p117
  it("asks for the origin, then a point on X and one on the XY plane", () => {
    const cad = createHarness()
    cad.command("UCS")
    answer(cad, "FOO", "0,0", "FOO")
    cad.enter()
    cad.command("UCS")
    answer(cad, "1,1", "2,1", "FOO")
    cad.enter()

    expect(cad.commandLog()).toEqual([
      "UCS",
      "Current ucs name:  *WORLD*",
      `${ORIGIN} FOO`,
      "Point or option keyword required.",
      `${ORIGIN} 0,0`,
      "Specify point on X-axis or <accept>: FOO",
      "Invalid point.",
      "Specify point on X-axis or <accept>:",
      "UCS",
      "Current ucs name:  *WORLD*",
      `${ORIGIN} 1,1`,
      "Specify point on X-axis or <accept>: 2,1",
      "Specify point on the XY plane or <accept>: FOO",
      "Invalid point.",
      "Specify point on the XY plane or <accept>:",
    ])
  })

  // probe ucs/p123
  it("turns about an axis, refusing what is no angle", () => {
    const cad = createHarness()
    cad.command("UCS")
    answer(cad, "X", "FOO")
    expect(cad.commandLog().slice(-3)).toEqual([
      `${ORIGIN} X`,
      "Specify rotation angle about X axis <90>: FOO",
      "Requires valid numeric angle or second point.",
    ])
    cad.enter()
    expect(cad.commandLog().at(-1)).toBe(
      "Specify rotation angle about X axis <90>:"
    )
  })

  // probes ucs/p127, p130
  it("asks ZAxis's origin and a point on Z, offering one up the current Z", () => {
    const cad = createHarness()
    cad.command("UCS")
    answer(cad, "ZA", "FOO", "5,5", "FOO")
    cad.enter()

    expect(cad.commandLog().slice(2)).toEqual([
      `${ORIGIN} ZA`,
      "Specify new origin point or [Object] <0,0,0>: FOO",
      "Point or option keyword required.",
      "Specify new origin point or [Object] <0,0,0>: 5,5",
      "Specify point on positive portion of Z-axis <5.00,5.00,1.00>: FOO",
      "Invalid point.",
      "Specify point on positive portion of Z-axis <5.00,5.00,1.00>:",
    ])
    expect(cad.runtime.document.getSettings().ucs.origin).toEqual({
      x: 5,
      y: 5,
      z: 0,
    })
  })

  // probe ucs/p129: `Points are coincident`, no period (table 25611).
  it("says a point on Z at the new origin is coincident, and asks again", () => {
    const cad = createHarness()
    answer(cad, "UCS", "ZA", "10,0", "10,0")
    expect(cad.commandLog().slice(-2)).toEqual([
      "Specify point on positive portion of Z-axis <10.00,0.00,1.00>: 10,0",
      "Points are coincident",
    ])
    expect(cad.state().commandLine.prompt).toBe(
      "UCS Specify point on positive portion of Z-axis <10.00,0.00,1.00>:"
    )
    cad.enter()
    expect(cad.runtime.document.getSettings().ucs.origin).toEqual({
      x: 10,
      y: 0,
      z: 0,
    })

    const spanish = createHarness({ locale: es })
    answer(spanish, "SCP", "EZ", "10,0", "10,0")
    expect(spanish.commandLog().at(-1)).toBe("Los puntos coinciden")
  })

  it("refuses at OBject's pick with the modes a single selection takes", () => {
    const cad = createHarness({ entities: [lineOf(p(0, 0), p(100, 0))] })
    cad.command("UCS")
    answer(cad, "OB", "FOO")
    expect(cad.commandLog().slice(-4)).toEqual([
      `${ORIGIN} OB`,
      "Select object to align UCS: FOO",
      "*Invalid selection*",
      "Expects a point or Window/Last/Crossing/BOX/ALL/Fence/WPolygon/CPolygon/Group",
    ])
  })

  // probe ucs/p131
  it("says when there is no Previous UCS", () => {
    const cad = createHarness()
    cad.command("UCS")
    answer(cad, "P")
    expect(cad.commandLog().slice(-2)).toEqual([
      `${ORIGIN} P`,
      "No previous coordinate system saved.",
    ])
  })

  it("saves by name and asks before replacing one, ending on No or Enter", () => {
    const cad = createHarness()
    cad.command("UCS")
    answer(cad, "NA", "FOO", "S", "AA")
    cad.command("UCS")
    answer(cad, "NA", "S", "AA", "FOO")
    cad.enter()

    expect(cad.commandLog().slice(2)).toEqual([
      `${ORIGIN} NA`,
      "Enter an option [Restore/Save/Delete/?]: FOO",
      "Invalid option keyword.",
      "Enter an option [Restore/Save/Delete/?]: S",
      "Enter name to save current UCS or [?]: AA",
      "UCS",
      "Current ucs name:  AA",
      `${ORIGIN} NA`,
      "Enter an option [Restore/Save/Delete/?]: S",
      "Enter name to save current UCS or [?]: AA",
      'UCS "AA" already exists.  Replace it? <N>: FOO',
      "Yes or No, please.",
      'UCS "AA" already exists.  Replace it? <N>:',
    ])
    expect(cad.activeToolId()).toBe("select")
  })

  it("refuses a name it cannot save, and Enter saves none", () => {
    const cad = createHarness()
    cad.command("UCS")
    answer(cad, "NA", "S", "a<b")
    cad.enter()
    expect(cad.commandLog().slice(-3)).toEqual([
      "Enter name to save current UCS or [?]: a<b",
      "Invalid UCS name.",
      "Enter name to save current UCS or [?]:",
    ])
    expect(cad.runtime.document.getSettings().namedUcs).toEqual([])
    expect(cad.activeToolId()).toBe("select")
  })

  it("restores, lists as AutoCAD lays it out and deletes by name", () => {
    const cad = createHarness()
    cad.command("UCS")
    answer(cad, "NA", "S", "AA")
    cad.command("UCS")
    answer(cad, "NA", "R", "FOO", "?")
    cad.enter()

    expect(cad.commandLog().slice(-5).join("\n")).toBe(
      [
        "Enter name of UCS to restore or [?]: FOO",
        'Cannot find UCS "FOO".',
        "Enter name of UCS to restore or [?]: ?",
        "Enter UCS name(s) to list <*>:",
        'Current ucs name: "AA"',
        "",
        "Saved coordinate systems:",
        "",
        '"AA"',
        "     Origin = <0.00,0.00,0.00>, X Axis = <1.00,0.00,0.00>",
        "     Y Axis = <0.00,1.00,0.00>, Z Axis = <0.00,0.00,1.00>",
      ].join("\n")
    )
    expect(cad.state().commandLine.prompt).toBe(
      "UCS Enter name of UCS to restore or [?]:"
    )
    cad.enter()

    cad.command("UCS")
    answer(cad, "NA", "D", "FOO")
    cad.command("UCS")
    answer(cad, "NA", "D", "AA")
    expect(cad.commandLog()).toContain("  No matching UCS names found.")
    expect(cad.commandLog().at(-1)).toBe("Deleted 1 UCS name.")
  })

  it("asks and refuses in Autodesk's Spanish", () => {
    const cad = createHarness({ locale: es })
    cad.command("SCP")
    answer(cad, "FOO", "EZ", "5,5")
    cad.enter()
    cad.command("SCP")
    answer(cad, "UA", "FOO", "R", "FOO")

    expect(cad.commandLog()).toEqual([
      "SCP",
      "Nombre de scp actual:  *UNIVERSAL*",
      `${ORIGIN_ES} FOO`,
      "Se requiere un punto o una opción.",
      `${ORIGIN_ES} EZ`,
      "Precise nuevo punto de origen u [Objeto] <0,0,0>: 5,5",
      "Precise punto en parte positiva del eje Z <5.00,5.00,1.00>:",
      "SCP",
      "Nombre de scp actual:  *SIN NOMBRE*",
      `${ORIGIN_ES} UA`,
      "Indique una opción [Rest/Guardar/Supr/?]: FOO",
      "Opción no válida.",
      "Indique una opción [Rest/Guardar/Supr/?]: R",
      "Indique nombre de SCP para restaurarlo o [?]: FOO",
      'Imposible encontrar el SCP "FOO".',
    ])
  })
})

describe("UCSICON and PLAN ask as AutoCAD 2026", () => {
  it("UCSICON offers its options with the current one as the default", () => {
    const cad = createHarness()
    cad.command("UCSICON")
    expect(cad.state().commandLine.prompt).toBe(
      "UCSICON Enter an option [ON/OFF/Noorigin/ORigin] <ON>:"
    )
    answer(cad, "FOO", "OFF")
    cad.command("UCSICON")
    cad.enter()

    expect(cad.commandLog()).toEqual([
      "UCSICON",
      "Enter an option [ON/OFF/Noorigin/ORigin] <ON>: FOO",
      "Invalid option keyword.",
      "Enter an option [ON/OFF/Noorigin/ORigin] <ON>: OFF",
      "UCSICON",
      "Enter an option [ON/OFF/Noorigin/ORigin] <OFF>:",
    ])
  })

  it("PLAN defaults to the current UCS, and names a saved one", () => {
    const cad = createHarness()
    cad.command("PLAN")
    answer(cad, "FOO")
    cad.enter()
    cad.command("PLAN")
    answer(cad, "U", "FOO", "?")
    cad.enter()
    cad.enter()

    expect(cad.commandLog()).toEqual([
      "PLAN",
      "Enter an option [Current ucs/Ucs/World] <Current>: FOO",
      "Invalid option keyword.",
      "Enter an option [Current ucs/Ucs/World] <Current>:",
      "Regenerating model.",
      "PLAN",
      "Enter an option [Current ucs/Ucs/World] <Current>: U",
      "Enter name of UCS or [?]: FOO",
      'Cannot find UCS "FOO".',
      "Enter name of UCS or [?]: ?",
      "Enter UCS name(s) to list <*>:",
      [
        "Current ucs name: *WORLD*",
        "",
        "Saved coordinate systems:",
        "",
        "  No matching UCS names found.",
      ].join("\n"),
      "Enter name of UCS or [?]:",
    ])
    expect(cad.activeToolId()).toBe("select")
  })

  it("asks in Autodesk's Spanish", () => {
    const cad = createHarness({ locale: es })
    cad.command("PLANTA")
    expect(cad.state().commandLine.prompt).toBe(
      "PLANTA Indique una opción [scp Actual/SCP/Universal] <Actual>:"
    )
    cad.command("SIMBSCP")
    expect(cad.state().commandLine.prompt).toBe(
      "SIMBSCP Indique una opción [ACT/DES/Sin origen/Origen] <ACT>:"
    )
  })
})

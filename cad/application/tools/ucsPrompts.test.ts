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

  // probes ucs/p230, p231: no colon after the replace question's `<N>`.
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
      'UCS "AA" already exists.  Replace it? <N> FOO',
      "Yes or No, please.",
      'UCS "AA" already exists.  Replace it? <N>',
    ])
    expect(cad.activeToolId()).toBe("select")
  })

  // probes ucs/p236, p249
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

  // probes ucs/p234, p235, p240–p243
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

  // probes ucs/p107, p127, p230, p234 (es)
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
      'No se puede encontrar SCP "FOO".',
    ])
  })
})

const settings = (cad: CadHarness) => cad.runtime.document.getSettings()

/** UCS's first line, the name it calls the current UCS by. */
function nameLine(cad: CadHarness): string {
  answer(cad, "UCS")
  const line = cad.commandLog().at(-1)!
  cad.escape()
  return line
}

/** The `?` listing's first line, from UCS's first prompt or PLAN's Ucs. */
function listedLine(cad: CadHarness, ...asked: string[]): string {
  answer(cad, ...(asked.length > 0 ? asked : ["UCS"]), "?", "")
  const line = cad.commandLog().at(-1)!.split("\n")[0]
  cad.escape()
  return line
}

describe("UCS's NAmed and its table, as AutoCAD 2027's console", () => {
  // probe ucs/p227: NAmed's Enter is the first prompt's, World.
  it("takes NAmed's Enter for World, ELEVATION back to 0", () => {
    const cad = createHarness()
    answer(cad, "ELEV", "5", "0", "UCS", "FR", "UCS", "NA")
    expect(cad.state().commandLine.prompt).toBe(
      "UCS Enter an option [Restore/Save/Delete/?]:"
    )
    cad.enter()
    expect(cad.activeToolId()).toBe("select")
    expect(settings(cad).elevation).toBe(0)
    expect(settings(cad).ucsOrthographic).toBeNull()
    cad.undo()
    expect(settings(cad).ucsOrthographic).toBe("front")
    expect(settings(cad).elevation).toBe(5)
  })

  // probes ucs/p228, p229, p230: NAmed's `initget` is the first prompt's
  // 28 words; those it does not list do what they do there.
  it("answers the first prompt's words at NAmed's prompt", () => {
    const cad = createHarness()
    answer(cad, "UCS", "O", "5,5,0", "UCS", "NA", "W")
    expect(settings(cad).ucs.origin).toEqual({ x: 0, y: 0, z: 0 })
    answer(cad, "UCS", "NA", "T")
    expect(nameLine(cad)).toBe("Current ucs name:  *TOP*")
    answer(cad, "UCS", "NA", "O")
    expect(cad.state().commandLine.prompt).toBe(
      "UCS Specify new origin point <0,0,0>:"
    )
    cad.escape()
    const spanish = createHarness({ locale: es })
    answer(spanish, "SCP", "UA", "SU")
    expect(settings(spanish).ucsOrthographic).toBe("top")
  })

  // probe ucs/p232: `aa` replaces `AA` and the entry keeps its name.
  it("keeps a replaced entry's name as stored", () => {
    const cad = createHarness()
    answer(cad, "UCS", "NA", "S", "AA", "UCS", "O", "5,5,0")
    answer(cad, "UCS", "NA", "S", "aa")
    expect(cad.state().commandLine.prompt).toBe(
      'UCS UCS "aa" already exists.  Replace it? <N>'
    )
    answer(cad, "Y")
    expect(settings(cad).namedUcs.map((entry) => entry.name)).toEqual(["AA"])
    expect(settings(cad).ucsName).toBe("AA")
    expect(settings(cad).namedUcs[0].ucs.origin).toEqual({ x: 5, y: 5, z: 0 })
  })

  // probes ucs/p231, p267 (es): `S` replaces, `Y` is no Spanish answer.
  it("asks before replacing in Spanish, taking S and refusing Y", () => {
    const cad = createHarness({ locale: es })
    answer(cad, "SCP", "UA", "G", "AA", "SCP", "OR", "5,5,0")
    answer(cad, "SCP", "UA", "G", "AA")
    expect(cad.state().commandLine.prompt).toBe(
      'SCP El SCP "AA" ya existe. Reemplácelo.? <N>'
    )
    answer(cad, "S")
    expect(settings(cad).namedUcs[0].ucs.origin).toEqual({ x: 5, y: 5, z: 0 })
    answer(cad, "SCP", "OR", "7,7,0", "SCP", "UA", "G", "AA", "Y")
    expect(cad.commandLog().slice(-2)).toEqual([
      'El SCP "AA" ya existe. Reemplácelo.? <N> Y',
      "Sí o No.",
    ])
    expect(cad.state().commandLine.prompt).toBe(
      'SCP El SCP "AA" ya existe. Reemplácelo.? <N>'
    )
    cad.enter()
    expect(settings(cad).namedUcs[0].ucs.origin).toEqual({ x: 5, y: 5, z: 0 })
  })

  // probe ucs/p234: Restore finds a name whatever its case.
  it("restores case-blind, the stored name current", () => {
    const cad = createHarness()
    answer(cad, "UCS", "O", "5,5,0", "UCS", "NA", "S", "AA", "UCS", "W")
    answer(cad, "UCS", "NA", "R", "aa")
    expect(settings(cad).ucsName).toBe("AA")
    expect(settings(cad).ucs.origin).toEqual({ x: 5, y: 5, z: 0 })
  })

  // probes ucs/p234, p248, p258 (es): PLAN's words, not table 27139's.
  it("says in Spanish that Restore cannot find a name, and asks again", () => {
    const cad = createHarness({ locale: es })
    answer(cad, "SCP", "UA", "R", "BB")
    expect(cad.commandLog().slice(-2)).toEqual([
      "Indique nombre de SCP para restaurarlo o [?]: BB",
      'No se puede encontrar SCP "BB".',
    ])
    expect(cad.state().commandLine.prompt).toBe(
      "SCP Indique nombre de SCP para restaurarlo o [?]:"
    )
  })

  // probes ucs/p235, p236: a name it could never have saved is refused as
  // a name before it is looked up, and asked again.
  it("refuses at Restore a name with characters no name holds", () => {
    const cad = createHarness()
    answer(cad, "UCS", "NA", "R", 'A"B')
    expect(cad.commandLog().slice(-2)).toEqual([
      'Enter name of UCS to restore or [?]: A"B',
      "Invalid UCS name.",
    ])
    expect(cad.state().commandLine.prompt).toBe(
      "UCS Enter name of UCS to restore or [?]:"
    )
    const spanish = createHarness({ locale: es })
    answer(spanish, "SCP", "UA", "R", 'A"B')
    expect(spanish.commandLog().at(-1)).toBe("Nombre SCP no válido.")
  })

  // probes ucs/p236, p239 (es)
  it("refuses a name it cannot save in Spanish", () => {
    const cad = createHarness({ locale: es })
    answer(cad, "SCP", "UA", "G", "*")
    expect(cad.commandLog().at(-1)).toBe("Nombre SCP no válido.")
  })

  // probes ucs/p236, p238, p239: the characters a name may not hold, 255
  // characters at most; `-$_.`, accents, `'#~` and digits it may.
  it("saves the names AutoCAD saves, refusing the rest", () => {
    const refused = [
      ...'<>/\\":;|,=`*?'.split("").map((c) => `A${c}B`),
      "*",
      "A".repeat(256),
    ]
    for (const name of refused) {
      const cad = createHarness()
      answer(cad, "UCS", "NA", "S", name)
      expect(cad.commandLog().at(-1), name).toBe("Invalid UCS name.")
      expect(settings(cad).namedUcs, name).toEqual([])
    }
    for (const name of ["A-B$_.C", "Á'#~1", "B".repeat(255)]) {
      const cad = createHarness()
      answer(cad, "UCS", "NA", "S", name)
      expect(settings(cad).ucsName, name).toBe(name)
    }
  })

  // probe ucs/p256: a transparent command typed at Save's name is a name.
  it("takes an apostrophe and a command at Save's name as the name", () => {
    const cad = createHarness()
    answer(cad, "UCS", "NA", "S", "'ORTHOMODE")
    expect(settings(cad).ucsName).toBe("'ORTHOMODE")
    expect(cad.activeToolId()).toBe("select")
  })

  // probes ucs/p240, p241: the current one deleted leaves its UCS unnamed.
  it("deletes by commas and wildcards, the current one too", () => {
    const cad = createHarness()
    answer(cad, "UCS", "NA", "S", "AA", "UCS", "O", "1,0,0")
    answer(cad, "UCS", "NA", "S", "AB", "UCS", "O", "2,0,0")
    answer(cad, "UCS", "NA", "S", "BB", "UCS", "O", "3,0,0")
    answer(cad, "UCS", "NA", "S", "CC")
    const ucs = settings(cad).ucs
    answer(cad, "UCS", "NA", "D", "A*,CC")
    expect(cad.commandLog().at(-1)).toBe("Deleted 3 UCS names.")
    expect(settings(cad).namedUcs.map((entry) => entry.name)).toEqual(["BB"])
    expect(settings(cad).ucs).toEqual(ucs)
    expect(nameLine(cad)).toBe("Current ucs name:  *NO NAME*")
    answer(cad, "UCS", "NA", "D", "ZZ")
    expect(cad.commandLog().at(-1)).toBe("  No matching UCS names found.")
    answer(cad, "UCS", "NA", "D", "")
    expect(settings(cad).namedUcs.map((entry) => entry.name)).toEqual(["BB"])
  })

  // probes ucs/p240, p241 (es): `Suprimidos 3 nombres`, `Suprimidos 1 nombre`.
  it("counts what it deleted in Spanish", () => {
    const cad = createHarness({ locale: es })
    answer(cad, "SCP", "UA", "G", "AA", "SCP", "OR", "1,0,0")
    answer(cad, "SCP", "UA", "G", "AB", "SCP", "OR", "2,0,0")
    answer(cad, "SCP", "UA", "G", "CC", "SCP", "OR", "3,0,0")
    answer(cad, "SCP", "UA", "G", "BB")
    answer(cad, "SCP", "UA", "S", "A*,CC")
    expect(cad.commandLog().at(-1)).toBe("Suprimidos 3 nombres de SCP.")
    answer(cad, "SCP", "UA", "S", "bb")
    expect(cad.commandLog().at(-1)).toBe("Suprimidos 1 nombre de SCP.")
  })

  // probe ucs/p245: Previous steps back across a restore, and forward
  // again to the restored name.
  it("steps Previous back across a restore", () => {
    const cad = createHarness()
    answer(cad, "UCS", "O", "5,5,0", "UCS", "NA", "S", "AA", "UCS", "W")
    answer(cad, "UCS", "NA", "R", "AA", "UCS", "P")
    expect(settings(cad).ucs.origin).toEqual({ x: 0, y: 0, z: 0 })
    expect(nameLine(cad)).toBe("Current ucs name:  *WORLD*")
    answer(cad, "UCS", "P")
    expect(settings(cad).ucsName).toBe("AA")
    expect(settings(cad).ucs.origin).toEqual({ x: 5, y: 5, z: 0 })
  })

  // probe ucs/p262: Previous gives back an orthographic UCS by its name, and
  // a saved one after an orthographic UCS.
  it("steps Previous back to an orthographic UCS and to a saved one", () => {
    const cad = createHarness()
    answer(cad, "UCS", "FR", "UCS", "Z", "30", "UCS", "P")
    expect(nameLine(cad)).toBe("Current ucs name:  *FRONT*")
    answer(cad, "UCS", "NA", "S", "AA", "UCS", "BA", "UCS", "P")
    expect(nameLine(cad)).toBe("Current ucs name:  AA")
  })

  // probes ucs/p219, p261, p253 (es): the listing leaves the orthographic
  // UCS's name out, as UCS's own first line does not.
  it("lists an orthographic UCS as unnamed, or as the WCS when it is", () => {
    const front = createHarness()
    answer(front, "UCS", "FR")
    expect(listedLine(front)).toBe("Current ucs name: *NO NAME*")
    expect(listedLine(front, "PLAN", "U")).toBe("Current ucs name: *NO NAME*")
    const top = createHarness()
    answer(top, "UCS", "T")
    expect(listedLine(top)).toBe("Current ucs name: *WORLD*")
    expect(nameLine(top)).toBe("Current ucs name:  *TOP*")
    const spanish = createHarness({ locale: es })
    answer(spanish, "SCP", "SU")
    expect(listedLine(spanish, "SCP")).toBe("Nombre de scp actual: *UNIVERSAL*")
    answer(spanish, "SCP", "F")
    expect(listedLine(spanish, "SCP")).toBe(
      "Nombre de scp actual: *SIN NOMBRE*"
    )
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

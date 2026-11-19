import { describe, expect, it } from "vitest"

import { type CadHarness, createHarness } from "../../test/harness"
import { lineOf, p } from "../../test/builders"
import { hu as hungarian } from "../locales/hu"

// What Hungarian AutoCAD 2027's console prints and accepts, as a user of it
// types (the probes named in each case, hu-HU; docs/i18n/hu.md, "Command
// language").

function answer(cad: CadHarness, ...answers: string[]): CadHarness {
  for (const text of answers) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

const asked = (cad: CadHarness) => cad.state().commandLine.prompt
const inHungarian = (entities = [lineOf(p(0, 0), p(10, 0))]) =>
  createHarness({ locale: hungarian, entities })

describe("Hungarian AutoCAD's command language", () => {
  it("asks VONAL's points, Vissza alone and beside Bezár (line probes, names/p03)", () => {
    const cad = answer(inHungarian(), "VONAL")
    expect(asked(cad)).toBe("VONAL Adja meg az első pontot:")
    expect(asked(answer(cad, "0,0"))).toBe(
      "VONAL Adja meg a következő pontot vagy [Vissza]:"
    )
    expect(asked(answer(cad, "10,0", "10,10"))).toBe(
      "VONAL Adja meg a következő pontot vagy [Bezár/Vissza]:"
    )
  })

  it("runs VONAL by its alias VO and _LINE in any language", () => {
    expect(asked(answer(inHungarian(), "vo"))).toBe(
      "VONAL Adja meg az első pontot:"
    )
    expect(asked(answer(inHungarian(), "_LINE"))).toBe(
      "VONAL Adja meg az első pontot:"
    )
  })

  // P is PÁRH and K is KÖR in Hungarian AutoCAD's acad.pgp: no English letter.
  it("runs PÁRH by P and KÖR by K, where English pans and has none", () => {
    expect(asked(answer(inHungarian(), "P"))).toBe(
      "PÁRH Adja meg a párhuzamos távolságot vagy [Kijelölt/Töröl/Fólia] <Kijelölt>:"
    )
    expect(asked(answer(inHungarian(), "K"))).toMatch(/^KÖR /)
  })

  // T is U's name (getcname "_U"), and the name beats acad.pgp's T, PAN's alias
  // (names/p01; the desktop, names/d01, 19/11/2026).
  it("undoes with T, though acad.pgp gives T to TOL", () => {
    const cad = answer(inHungarian([]), "VONAL", "0,0", "10,0", "")
    expect(cad.entities()).toHaveLength(1)
    answer(cad, "T")
    expect(cad.entities()).toHaveLength(0)
  })

  // getcname "_RECTANG" is TÉGL; TÉGLALAP, acad.pgp's TE, is the local name of
  // _RECTANGLE and runs it too (names/p43).
  it("runs TÉGL by its name and by TÉGLALAP (names/p43)", () => {
    const prompt =
      "TÉGL Adja meg az első sarokpontot vagy [leTör/SZInt/leKerekít/Vastagság/széLesség]:"
    expect(asked(answer(inHungarian(), "TÉGL"))).toBe(prompt)
    expect(asked(answer(inHungarian(), "TÉGLALAP"))).toBe(prompt)
  })

  // PONTTÓL is FROM where a point is asked, and nothing at Parancs: (names/p03,
  // p42, 19/11/2026).
  it("takes PONTTÓL at a point prompt as FROM, asking its base point and offset (names/p03)", () => {
    const cad = answer(inHungarian(), "VONAL", "PONTTÓL")
    expect(asked(cad)).toBe("VONAL Bázispont:")
    expect(asked(answer(cad, "0,0"))).toBe("VONAL <Eltolás>:")
    answer(cad, "@10,0", "20,0", "")
    const drawn = cad.latest()
    expect(drawn.type === "line" && drawn.start).toBeCloseToPoint(p(10, 0))
  })

  it("reads -TRASZTER's words by their capitals and lists them as the console does (names/p07)", () => {
    const modes = answer(
      inHungarian(),
      "-TRASZTER",
      "VÉG,KÖZ,MET,MEG",
      "-TRASZTER"
    )
    expect(modes.commandLog().join("\n")).toContain(
      "Aktuális traszter módok: Vég,Köz,Met,Megh"
    )
  })

  it("takes FEL at a point prompt as Midpoint (names/p09)", () => {
    const cad = answer(inHungarian(), "VONAL", "FEL", "5,0.1", "20,20", "")
    expect(cad.commandLog().join("\n")).not.toContain("Érvénytelen pont.")
    const drawn = cad.latest()
    expect(drawn.type === "line" && drawn.start).toBeCloseToPoint(p(5, 0))
  })
})

// What only the desktop shows (names/d01, hu-HU, 19/11/2026): each drafting
// toggle says Be or Ki, Selection Cycling bekapcsolva or ki.
describe("Hungarian words of the desktop", () => {
  it("echoes the drafting toggles as the desktop's history does (names/d01)", () => {
    const cad = createHarness({ locale: hungarian })
    const toggled = (key: string) => {
      const from = cad.commandLog().length
      cad.press(key)
      return cad.commandLog().slice(from)
    }
    expect([
      ...toggled("F9"),
      ...toggled("F3"),
      ...toggled("F8"),
      ...toggled("F10"),
      ...toggled("F11"),
      ...toggled("F7"),
      ...toggled("F7"),
      ...toggled("F4"),
      ...toggled("F4"),
    ]).toEqual([
      " <Raszter Be>",
      " <Traszter Be>",
      " <Orto Be>",
      " <Poláris Be>",
      " <Tárgyraszterkövetés Ki>",
      " <Háló Ki>",
      " <Háló Be>",
      " <Ciklikus kiválasztás bekapcsolva>",
      " <Ciklikus kiválasztás ki>",
    ])
  })
})

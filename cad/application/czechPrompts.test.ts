import { describe, expect, it } from "vitest"

import { type CadHarness, createHarness } from "../../test/harness"
import { lineOf, p } from "../../test/builders"
import { cs as czech } from "../locales/cs"

// What Czech AutoCAD 2027's console prints and accepts, as a user of it types
// (the probes named in each case, cs-CZ; docs/i18n/cs.md, "Command language").

function answer(cad: CadHarness, ...answers: string[]): CadHarness {
  for (const text of answers) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

const asked = (cad: CadHarness) => cad.state().commandLine.prompt
const inCzech = (entities = [lineOf(p(0, 0), p(10, 0))]) =>
  createHarness({ locale: czech, entities })

describe("Czech AutoCAD's command language", () => {
  it("asks ÚSEČKA's points, Zpět alone and beside Uzavři (names/p01, p09)", () => {
    const cad = answer(inCzech(), "ÚSEČKA")
    expect(asked(cad)).toBe("ÚSEČKA Určete první bod:")
    expect(asked(answer(cad, "0,0"))).toBe(
      "ÚSEČKA Zadejte další bod nebo [Zpět]:"
    )
    expect(asked(answer(cad, "10,0", "10,10"))).toBe(
      "ÚSEČKA Zadejte další bod nebo [Uzavři/Zpět]:"
    )
  })

  it("runs ÚSEČKA by its alias U and _LINE in any language", () => {
    expect(asked(answer(inCzech(), "u"))).toBe("ÚSEČKA Určete první bod:")
    expect(asked(answer(inCzech(), "_LINE"))).toBe("ÚSEČKA Určete první bod:")
  })

  // E is EKVID and O is OBLOUK in Czech AutoCAD's acad.pgp: no English letter.
  it("runs EKVID by E and OBLOUK by O, where English erases and offsets", () => {
    expect(asked(answer(inCzech(), "E"))).toBe(
      "EKVID Určete vzdálenost ekvidistanty nebo [Bodem/Vymazat/Hladina] <Bodem>:"
    )
    expect(asked(answer(inCzech(), "O"))).toMatch(/^OBLOUK /)
  })

  it("undoes with Z, which no alias takes (names/p03, desktop names/d01)", () => {
    const cad = answer(inCzech([]), "ÚSEČKA", "0,0", "10,0", "")
    expect(cad.entities()).toHaveLength(1)
    answer(cad, "Z")
    expect(cad.entities()).toHaveLength(0)
  })

  // getcname "_RECTANG" is OBD; OBDÉLNÍK, the CSY help's title, is the local
  // name of _RECTANGLE and runs it too (names/p43).
  it("runs OBD by its name and by OBDÉLNÍK (names/p43)", () => {
    const prompt =
      "OBD Určete první roh nebo [Zkosení/zDvih/zAoblení/Tloušťka/šířKa]:"
    expect(asked(answer(inCzech(), "OBD"))).toBe(prompt)
    expect(asked(answer(inCzech(), "OBDÉLNÍK"))).toBe(prompt)
  })

  // ODBODU is FROM where a point is asked, and unknown at Příkaz: (names/p03,
  // p42, 17/11/2026).
  it("takes ODBODU at a point prompt as FROM, asking its base point and offset (names/p03)", () => {
    const cad = answer(inCzech(), "ÚSEČKA", "ODBODU")
    expect(asked(cad)).toBe("ÚSEČKA Základní bod:")
    expect(asked(answer(cad, "0,0"))).toBe("ÚSEČKA <Odsazení>:")
    answer(cad, "@10,0", "20,0", "")
    const drawn = cad.latest()
    expect(drawn.type === "line" && drawn.start).toBeCloseToPoint(p(10, 0))
  })

  it("reads -UCHOP's words by their capitals, STŘ and PRŮ with theirs (names/p07)", () => {
    const modes = answer(inCzech(), "-UCHOP", "KON,STŘ,PRŮ,PRO", "-UCHOP")
    expect(modes.commandLog().join("\n")).toContain(
      "Aktuální režimy uchopení: KON,STŘ,PRŮ,PRO"
    )
  })

  it("takes POL at a point prompt as Midpoint and refuses S (names/p09)", () => {
    const cad = answer(inCzech(), "ÚSEČKA", "POL", "5,0.1", "20,20", "")
    expect(cad.commandLog().join("\n")).not.toContain("Neplatný bod.")
    const drawn = cad.latest()
    expect(drawn.type === "line" && drawn.start).toBeCloseToPoint(p(5, 0))
    const refused = answer(inCzech(), "ÚSEČKA", "S")
    expect(refused.commandLog().join("\n")).toContain("Neplatný bod.")
  })
})

// What only the desktop shows (names/d01, cs-CZ, 17/11/2026): each drafting
// toggle says ano or ne, Selection Cycling zapnuto or vypnuto.
describe("Czech words of the desktop", () => {
  it("echoes the drafting toggles as the desktop's history does (names/d01)", () => {
    const cad = createHarness({ locale: czech })
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
      " <Krok ano>",
      " <Uchop ano>",
      " <Orto ano>",
      " <Polárně ano>",
      " <Trasování uchopení objektů ne>",
      " <Rastr ne>",
      " <Rastr ano>",
      " <Přepínání výběru zapnuto>",
      " <Přepínání výběru vypnuto>",
    ])
  })
})

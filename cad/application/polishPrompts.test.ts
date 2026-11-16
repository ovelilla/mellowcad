import { describe, expect, it } from "vitest"

import { type CadHarness, createHarness } from "../../test/harness"
import { lineOf, p } from "../../test/builders"
import { pl as polish } from "../locales/pl"

// What Polish AutoCAD 2027's console prints and accepts, as a user of it types
// (the probes named in each case, pl-PL; docs/i18n/pl.md, "Command language").

function answer(cad: CadHarness, ...answers: string[]): CadHarness {
  for (const text of answers) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

const asked = (cad: CadHarness) => cad.state().commandLine.prompt
const inPolish = (entities = [lineOf(p(0, 0), p(10, 0))]) =>
  createHarness({ locale: polish, entities })

describe("Polish AutoCAD's command language", () => {
  it("asks LINIA's points, Cofaj alone and beside Zamknij (the line probes)", () => {
    const cad = answer(inPolish(), "LINIA")
    expect(asked(cad)).toBe("LINIA Określ pierwszy punkt:")
    expect(asked(answer(cad, "0,0"))).toBe(
      "LINIA Określ następny punkt lub [Cofaj]:"
    )
    expect(asked(answer(cad, "10,0", "10,10"))).toBe(
      "LINIA Określ następny punkt lub [Zamknij/Cofaj]:"
    )
  })

  it("runs LINIA by its alias L and _LINE in any language", () => {
    expect(asked(answer(inPolish(), "l"))).toBe("LINIA Określ pierwszy punkt:")
    expect(asked(answer(inPolish(), "_LINE"))).toBe(
      "LINIA Określ pierwszy punkt:"
    )
  })

  // O is OKRĄG and U is ŁUK in Polish AutoCAD's acad.pgp: no English letter.
  it("runs OKRĄG by O and ŁUK by U, where English runs OFFSET and undoes", () => {
    expect(asked(answer(inPolish(), "O"))).toMatch(/^OKRĄG /)
    expect(asked(answer(inPolish(), "U"))).toMatch(/^ŁUK /)
  })

  it("undoes with C, which no alias takes (desktop, names/d01)", () => {
    const cad = answer(inPolish([]), "LINIA", "0,0", "10,0", "")
    expect(cad.entities()).toHaveLength(1)
    answer(cad, "C")
    expect(cad.entities()).toHaveLength(0)
  })

  // The console's: «Określ odległość odsunięcia lub [przezPunkt/Wymaż/wArstwa]
  // <przezPunkt>:» (the offset probes; desktop names/d01 for OD).
  it("runs ODSUŃ by OD, its Through lettered P inside przezPunkt", () => {
    expect(asked(answer(inPolish(), "OD"))).toBe(
      "ODSUŃ Określ odległość odsunięcia lub [przezPunkt/Wymaż/wArstwa] <przezPunkt>:"
    )
  })

  // OD is ODSUŃ's alias at Polecenie: and FROM where a point is asked
  // (names/p03, 16/11/2026), as Russian's ОТ.
  it("takes OD at a point prompt as FROM, asking its base point and offset (names/p03)", () => {
    const cad = answer(inPolish(), "LINIA", "OD")
    expect(asked(cad)).toBe("LINIA Punkt bazowy:")
    expect(asked(answer(cad, "0,0"))).toBe("LINIA <Odsunięcie>:")
    answer(cad, "@10,0", "20,0", "")
    const drawn = cad.latest()
    expect(drawn.type === "line" && drawn.start).toBeCloseToPoint(p(10, 0))
  })

  it("reads -OBIEKT's words by their capitals, KOŃ with its Ń (names/p07, p40)", () => {
    const modes = answer(inPolish(), "-OBIEKT", "KOŃ,CEN,PRZ,PRZED", "-OBIEKT")
    expect(modes.commandLog().join("\n")).toContain(
      "Bieżące tryby lokalizacji: Kon,Cen,Prz,Przed"
    )
  })

  it("takes SYM at a point prompt as Midpoint and refuses KON (names/p09)", () => {
    const cad = answer(inPolish(), "LINIA", "SYM", "5,0.1", "20,20", "")
    expect(cad.commandLog().join("\n")).not.toContain("Niewłaściwy punkt.")
    const drawn = cad.latest()
    expect(drawn.type === "line" && drawn.start).toBeCloseToPoint(p(5, 0))
    const refused = answer(inPolish(), "LINIA", "KON")
    expect(refused.commandLog().join("\n")).toContain("Niewłaściwy punkt.")
  })
})

// What only the desktop shows (names/d01, pl-PL, 16/11/2026): each drafting
// toggle says włącz or wyłącz, Selection Cycling włączone or wyłączone.
describe("Polish words of the desktop", () => {
  it("echoes the drafting toggles as the desktop's history does (names/d01)", () => {
    const cad = createHarness({ locale: polish })
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
      " <Skok włącz>",
      " <Stałe tryby lokalizacji włącz>",
      " <Orto włącz>",
      " <Biegunowy włącz>",
      " <Śledzenie lokalizacji wyłącz>",
      " <Siatka wyłącz>",
      " <Siatka włącz>",
      " <Wybieranie cykliczne włączone>",
      " <Wybieranie cykliczne wyłączone>",
    ])
  })
})

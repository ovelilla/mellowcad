import { describe, expect, it } from "vitest"

import { type CadHarness, createHarness } from "../../test/harness"
import { lineOf, p } from "../../test/builders"
import { de as german } from "../locales/de"

// What German AutoCAD 2027's console prints and accepts, as a user of it types
// (the probes named in each case, de-DE; docs/i18n/de.md, "Command language").

function answer(cad: CadHarness, ...answers: string[]): CadHarness {
  for (const text of answers) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

const asked = (cad: CadHarness) => cad.state().commandLine.prompt
const inGerman = (entities = [lineOf(p(0, 0), p(10, 0))]) =>
  createHarness({ locale: german, entities })

describe("German AutoCAD's command language", () => {
  it("asks LINIE's points as the console does (names/p03)", () => {
    const cad = answer(inGerman(), "LINIE")
    expect(asked(cad)).toBe("LINIE Ersten Punkt angeben:")
    expect(asked(answer(cad, "0,0"))).toBe(
      "LINIE Nächsten Punkt angeben oder [Zurück]:"
    )
  })

  it("runs VERSETZ by its alias VS, with Durch punkt for Through (offset)", () => {
    expect(asked(answer(inGerman(), "VS"))).toBe(
      "VERSETZ Abstand angeben oder [Durch punkt/lÖschen/Layer] <Durch punkt>:"
    )
  })

  it("gives S to SCHIEBEN, AR to ABRUNDEN and LÖ to LÖSCHEN, as German acad.pgp does", () => {
    expect(asked(answer(inGerman(), "S"))).toMatch(/^SCHIEBEN /)
    expect(asked(answer(inGerman(), "AR"))).toMatch(/^ABRUNDEN /)
    expect(asked(answer(inGerman(), "LÖ"))).toMatch(/^LÖSCHEN /)
  })

  it("reads -OFANG's words by their three capitals: END is Endpoint, HIL Extension (names/p07)", () => {
    const modes = answer(inGerman(), "-OFANG", "END,HIL,NÄC,ANG", "-OFANG")
    expect(asked(modes)).toBe("-OFANG Liste der Objektfang-Modi eingeben:")
    expect(modes.commandLog().join("\n")).toContain(
      "Aktuelle Objektfangmodi: End,Näch,Angschn,Hil"
    )
  })

  it("takes MIT at a point prompt as Midpoint and refuses M (names/p09)", () => {
    const cad = answer(inGerman(), "LINIE", "MIT", "5,0.1", "20,20", "")
    expect(cad.commandLog().join("\n")).not.toContain("Ungültiger Punkt.")
    const drawn = cad.latest()
    expect(drawn.type === "line" && drawn.start).toBeCloseToPoint(p(5, 0))
    const refused = answer(inGerman(), "LINIE", "M")
    expect(refused.commandLog().join("\n")).toContain("Ungültiger Punkt.")
  })

  it("asks VON's base point and offset (names/p03)", () => {
    const cad = answer(inGerman(), "LINIE", "VON")
    expect(asked(cad)).toBe("LINIE Basispunkt:")
    expect(asked(answer(cad, "0,0"))).toBe("LINIE <Abstand>:")
  })

  // German puts a prompt's verb after its list where the string says so
  // (`promptTails`), and QUADER's height first without a default, last with
  // one (27565, 27566; chamferedge/c01, primitives/p105).
  it("writes QUADER's height with its verb first, then after the list once it has a default", () => {
    const cad = answer(inGerman(), "QUADER", "0,0,0", "10,10")
    expect(asked(cad)).toBe("QUADER Höhe angeben oder [2Punkt]:")
    answer(cad, "5", "QUADER", "20,0,0", "30,10")
    expect(asked(cad)).toMatch(/^QUADER Höhe oder \[2Punkt\] angeben <5\.0+>:$/)
  })

  it("writes KEGEL's height default before its verb (25220, primitives/p321)", () => {
    const cad = answer(
      inGerman(),
      "KEGEL",
      "0,0,0",
      "5",
      "8",
      "KEGEL",
      "20,0,0"
    )
    expect(asked(cad)).toMatch(
      /^KEGEL Radius für Basis oder \[Durchmesser\] angeben <5\.0+>:$/
    )
    expect(asked(answer(cad, ""))).toMatch(
      /^KEGEL Höhe oder \[2Punkt\/Achsenendpunkt\/Oberen radius\] <8\.0+> angeben:$/
    )
  })

  it("writes PYRAMIDE's base centre with its verb after the list (primitives/p321)", () => {
    expect(asked(answer(inGerman(), "PYRAMIDE"))).toBe(
      "PYRAMIDE Mittelpunkt der Basis oder [Kante/Seiten] angeben:"
    )
  })

  it("spaces TEXT's points twice before oder, and ends them with angeben (text)", () => {
    expect(asked(answer(inGerman(), "TEXT"))).toBe(
      "TEXT Startpunkt des Texts  oder [posItion/Stil] angeben:"
    )
  })
})

// What only the desktop shows (names/d01, de-DE, 13/11/2026): each drafting
// toggle says ein or aus, but Selection Cycling, whose two lines are worded
// apart: Wechselnde Auswahl ein, Auswahl wechseln aus.
describe("German words of the desktop", () => {
  it("echoes the drafting toggles as the desktop's history does (names/d01)", () => {
    const cad = createHarness({ locale: german })
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
      " <Fang ein>",
      " <Ofang ein>",
      " <Ortho ein>",
      " <Polar ein>",
      " <Objektfangspur aus>",
      " <Raster aus>",
      " <Raster ein>",
      " <Wechselnde Auswahl ein>",
      " <Auswahl wechseln aus>",
    ])
  })
})

import { describe, expect, it } from "vitest"

import { type CadHarness, createHarness } from "../../test/harness"
import { circleOf, lineOf, p, polylineOf } from "../../test/builders"
import { createSpline } from "../domain/splines"
import { fr } from "../locales/fr"

// What French AutoCAD 2027's console prints and accepts, as a user of it types
// (the probes named in each case, fr-FR; docs/i18n/fr.md, "Command language").

function answer(cad: CadHarness, ...answers: string[]): CadHarness {
  for (const text of answers) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

const asked = (cad: CadHarness) => cad.state().commandLine.prompt
const french = (entities = [lineOf(p(0, 0), p(10, 0))]) =>
  createHarness({ locale: fr, entities })

describe("French AutoCAD's command language", () => {
  it("asks LIGNE's points as the console does (names/p03)", () => {
    const cad = answer(french(), "LIGNE")
    expect(asked(cad)).toBe("LIGNE Spécifiez le premier point:")
    expect(asked(answer(cad, "0,0"))).toBe(
      "LIGNE Spécifiez le point suivant ou [annUler]:"
    )
  })

  it("runs DECALER by its alias DC, with Par for Through (offset, 22470)", () => {
    expect(asked(answer(french(), "DC"))).toBe(
      "DECALER Spécifiez la distance de décalage ou [Par/Effacer/Calque] <Par>:"
    )
  })

  it("gives E to ETIRER and EF to EFFACER, as French acad.pgp does", () => {
    expect(asked(answer(french(), "E"))).toMatch(/^ETIRER /)
    expect(asked(answer(french(), "EF"))).toMatch(/^EFFACER /)
  })

  it("reads -ACCROBJ's words by their three capitals: EXT is Endpoint, EXTE Extension (names/p07)", () => {
    const modes = answer(french(), "-ACCROBJ", "EXT,EXTE,PRO,PROJ", "-ACCROBJ")
    expect(asked(modes)).toBe(
      "-ACCROBJ Entrez la liste des modes d'accrochage aux objets:"
    )
    expect(modes.commandLog().join("\n")).toContain(
      "Modes accrobj courants: Extr,Pro,Proj,Exte"
    )
  })

  it("takes MIL at a point prompt as Midpoint and refuses M (names/p09)", () => {
    const cad = answer(french(), "LIGNE", "MIL", "5,0.1")
    expect(asked(cad)).toBe("LIGNE Spécifiez le point suivant ou [annUler]:")
    expect(cad.commandLog().join("\n")).toContain(
      "Spécifiez le premier point: MIL"
    )
    const refused = answer(french(), "LIGNE", "M")
    expect(refused.commandLog().join("\n")).toContain("Point incorrect.")
  })

  it("asks DEPUIS's base point and offset (names/p03)", () => {
    const cad = answer(french(), "LIGNE", "DEPUIS")
    expect(asked(cad)).toBe("LIGNE Point de base:")
    expect(asked(answer(cad, "0,0"))).toBe("LIGNE <Décalage>:")
  })
})

// What English asks alike and French asks per command or per state, each with
// a prompt id or a prompt's label of its own (docs/i18n/fr.md).
describe("French AutoCAD's words where English has one", () => {
  it("asks COTALI's second origin for un second point, COTLIN's for le second (dimensions/p143, corners/p235)", () => {
    expect(asked(answer(french(), "COTALI", "0,0"))).toBe(
      "COTALI Indiquez un second point d'origine de la ligne d'attache:"
    )
    expect(asked(answer(french(), "COTLIN", "0,0"))).toBe(
      "COTLIN Indiquez le second point d'origine de la ligne d'attache:"
    )
  })

  it("asks a polygon's side by its côté, a pyramid's edge by its arête (polygon/p122, primitives/p321)", () => {
    const polygon = answer(french(), "POLYGONE", "5", "_E")
    expect(asked(polygon)).toBe(
      "POLYGONE Spécifiez la première extrémité du côté:"
    )
    expect(asked(answer(polygon, "0,0"))).toBe(
      "POLYGONE Spécifiez la deuxième extrémité du côté:"
    )
    const pyramid = answer(french(), "PYRAMIDE", "_E")
    expect(asked(pyramid)).toBe(
      "PYRAMIDE Spécifiez la première extrémité de l'arête:"
    )
    expect(asked(answer(pyramid, "0,0"))).toBe(
      "PYRAMIDE Spécifiez la seconde extrémité de l'arête:"
    )
  })

  it("asks SCU Move's origin as une nouvelle origine, ZAxis's as le nouveau point (ucs/p210, p129)", () => {
    expect(asked(answer(french(), "SCU", "_M"))).toBe(
      "SCU Spécifiez une nouvelle origine ou [profondeurZ]<0,0,0>:"
    )
    expect(asked(answer(french(), "SCU", "_ZA"))).toBe(
      "SCU Spécifiez le nouveau point d'origine ou [Objet] <0,0,0>:"
    )
  })

  it("lists SPLINE's end Tangency as Tangence fin at the third point, fin Tangente from the fourth (corners/p319; no toLerance here)", () => {
    const cad = answer(french(), "SPLINE", "0,0")
    expect(asked(cad)).toBe(
      "SPLINE Indiquez le point suivant ou [Tangence de départ]:"
    )
    expect(asked(answer(cad, "10,5"))).toBe(
      "SPLINE Indiquez le point suivant ou [Tangence fin/annUler]:"
    )
    expect(asked(answer(cad, "20,0"))).toBe(
      "SPLINE Indiquez le point suivant ou [fin Tangente/annUler/Clore]:"
    )
  })

  it("lists PEDIT's Ltype gen as TYpeligne gén for one polyline, Typeligne gén for Multiple's (pedit/p07, p12)", () => {
    const polylines = () =>
      createHarness({
        locale: fr,
        entities: [
          polylineOf([p(0, 0), p(10, 0), p(10, 10)], { id: "A" }),
          polylineOf([p(20, 0), p(30, 0), p(30, 10)], { id: "B" }),
        ],
      })
    expect(asked(answer(polylines(), "PEDIT", "5,0"))).toBe(
      "PEDIT Entrez une option [Clore/Joindre/LArgeur/Modif-sommet/Ajuster/sPline/Redresser/TYpeligne gén/Inverser/annUler]:"
    )
    expect(asked(answer(polylines(), "PEDIT", "_M", "_ALL", ""))).toBe(
      "PEDIT Entrez une option [Clore/Ouvrir/Joindre/LArgeur/Ajuster/sPline/Redresser/Typeligne gén/Inverser/annUler]:"
    )
  })

  it("lists EDITSPLINE's System default as Par défaut at the start tangent, Par Défaut at the end's (spline-knots/k110)", () => {
    const cad = createHarness({
      locale: fr,
      entities: [
        createSpline("fit", [p(0, 0), p(10, 10), p(20, 0), p(30, 10)], {
          id: "S",
        }),
      ],
    })
    answer(cad, "EDITSPLINE", "0,0", "_F", "_T")
    expect(asked(cad)).toBe(
      "EDITSPLINE Spécifiez une tangente de début ou [Par défaut]:"
    )
    expect(asked(answer(cad, "0,10"))).toBe(
      "EDITSPLINE Spécifiez une tangente de fin ou [Par Défaut]:"
    )
  })

  it("asks RESEAURECT's COLonnes and RANgées spacing entre colonnes and entre rangées, Espacement's entre les lignes (arrays/p419, p256, p432)", () => {
    const rect = (...answers: string[]) => {
      const cad = createHarness({
        locale: fr,
        entities: [circleOf(p(10, 10), 2, { id: "C" })],
      })
      cad.select("C")
      return asked(answer(cad, "_ARRAYRECT", ...answers))
    }
    expect(rect("_COL", "5")).toMatch(
      /^RESEAURECT Spécifiez la distance entre colonnes <[\d.]+>:$/
    )
    expect(rect("_R", "4")).toMatch(
      /^RESEAURECT Spécifiez la distance entre rangées <[\d.]+>:$/
    )
    expect(rect("_S", "")).toMatch(
      /^RESEAURECT Spécifiez la distance entre les lignes <[\d.]+>:$/
    )
  })
})

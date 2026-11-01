import { describe, expect, it } from "vitest"

import { type CadHarness, createHarness } from "../../test/harness"
import { snapshotOf } from "../../test/builders"
import {
  parseDrawingFile,
  serializeDrawing,
} from "../serialization/drawingFile"
import { es } from "../locales/es"
import { ptBR } from "../locales/pt-BR"
import { SvgScenePresenter } from "../adapters/SvgScenePresenter"
import { THEME } from "../scene/theme"
import { goochFill, lightDirection } from "./shading"

function answer(cad: CadHarness, ...texts: string[]): CadHarness {
  for (const text of texts) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

function written(cad: CadHarness, ...texts: string[]): string[] {
  const from = cad.commandLog().length
  answer(cad, ...texts)
  return cad.commandLog().slice(from)
}

const style = (cad: CadHarness) =>
  cad.runtime.document.getSettings().visualStyle

/** A 10 box seen from SW Isometric, as visualstyle/p02 plots one. */
function isoBox(locale?: typeof es): CadHarness {
  const cad = createHarness(locale ? { locale } : {})
  return answer(cad, "BOX", "0,0,0", "10,10", "10", "-VIEW", "_SWISO")
}

const segments = (cad: CadHarness) =>
  cad.scene().primitives.filter((p) => p.kind === "segment")

describe("VSCURRENT", () => {
  it("offers the styles built, the current one's name at Enter (visualstyle/v02)", () => {
    const cad = isoBox()
    expect(written(cad, "VSCURRENT", "FOO", "H")).toEqual([
      "VSCURRENT",
      "Enter an option [2dwireframe/Hidden/Conceptual] <2dwireframe>: FOO",
      "Invalid option keyword.",
      "Enter an option [2dwireframe/Hidden/Conceptual] <2dwireframe>: H",
    ])
    expect(style(cad)).toBe("hidden")
    expect(written(cad, "VS", "")).toEqual([
      "VS VSCURRENT",
      "Enter an option [2dwireframe/Hidden/Conceptual] <Hidden>:",
    ])
    expect(style(cad)).toBe("hidden")
  })

  it("draws a box's nine edges in Hidden, its twelve in 2D Wireframe (visualstyle/p01, p02)", () => {
    const cad = isoBox()
    // The grid and the crosshair draw segments too: three edges fewer.
    cad.moveTo({ x: 500, y: 500, z: 0 })
    const wireframe = segments(cad).length
    answer(cad, "VSCURRENT", "_HIDDEN")
    expect(segments(cad).length).toBe(wireframe - 3)
  })

  it("is a step U takes back, and says Regenerating model. only back to 2D Wireframe (v02)", () => {
    const cad = isoBox()
    expect(written(cad, "VSCURRENT", "H")).not.toContain("Regenerating model.")
    expect(written(cad, "VSCURRENT", "2")).toContain("Regenerating model.")
    expect(written(cad, "U")).toEqual(["U", "VSCURRENT"])
    expect(style(cad)).toBe("hidden")
    expect(written(cad, "REDO").slice(0, 2)).toEqual(["REDO", "VSCURRENT"])
    expect(style(cad)).toBe("2dWireframe")
  })

  it("will not run inside another command (v02)", () => {
    const cad = isoBox()
    answer(cad, "LINE", "0,0")
    expect(written(cad, "'VSCURRENT")).toContain(
      "** That command may not be invoked transparently **"
    )
    answer(cad, "")
  })

  it("is saved with the drawing (v03, v04)", () => {
    const cad = isoBox()
    answer(cad, "VSCURRENT", "H")
    const file = serializeDrawing(
      snapshotOf(cad.entities(), {
        settings: cad.runtime.document.getSettings(),
      })
    )
    expect(parseDrawingFile(file).settings.visualStyle).toBe("hidden")
  })

  it("speaks Spanish and Portuguese as their AutoCADs do (v02, table 23337)", () => {
    const spanish = isoBox(es)
    expect(written(spanish, "ESTVISACTUAL", "U", "EVA", "")).toEqual([
      "ESTVISACTUAL",
      "Indique una opción [estructuraalámbrica2d/ocUlto/Conceptual] <estructuraalámbrica2d>: U",
      "EVA ESTVISACTUAL",
      "Indique una opción [estructuraalámbrica2d/ocUlto/Conceptual] <Oculto>:",
    ])
    expect(written(spanish, "H")).toEqual(["H", "ESTVISACTUAL"])
    const portuguese = isoBox(ptBR)
    expect(written(portuguese, "EVATUAL", "U", "EVA", "")).toEqual([
      "EVATUAL",
      "Insira uma opção [estruturadearame2d/ocUlto/Conceitual] <estruturadearame2d>: U",
      "EVA EVATUAL",
      "Insira uma opção [estruturadearame2d/ocUlto/Conceitual] <ocUlto>:",
    ])
  })
})

describe("the Hidden visual style", () => {
  it("draws as SVG what it draws on the canvas: the lines no face hides (visualstyle/p02)", async () => {
    // visualstyle/p02's scene, less the torus and the overlapping pair.
    const cad = createHarness()
    answer(
      cad,
      "GRIDMODE",
      "0",
      "BOX",
      "40,30,0",
      "50,40,6",
      "CYLINDER",
      "45,35,0",
      "3",
      "12",
      "UNION",
      "ALL",
      "",
      "BOX",
      "0,0,0",
      "10,10,10",
      "CYLINDER",
      "25,5,0",
      "5",
      "10",
      "SPHERE",
      "5,25,5",
      "5",
      "CONE",
      "25,25,0",
      "5",
      "10",
      "-VIEW",
      "_SWISO",
      "VSCURRENT",
      "H"
    )
    cad.moveTo({ x: 1e6, y: 1e6, z: 0 })
    const svg = new SvgScenePresenter({ precision: 2 }).render(cad.scene(), {
      title: "Hidden",
      description: "Solids in SW Isometric, their hidden lines removed.",
    })
    await expect(svg + "\n").toMatchFileSnapshot("./__snapshots__/hidden.svg")
  })
})

describe("the Conceptual visual style", () => {
  it("paints a box's three faces towards the viewer, its edges over them in colour 7 (visualstyle/p03, v06)", () => {
    const cad = isoBox()
    answer(cad, "CHPROP", "L", "", "C", "5", "")
    cad.moveTo({ x: 1e6, y: 1e6, z: 0 })
    answer(cad, "VSCURRENT", "C")
    expect(style(cad)).toBe("conceptual")
    const scene = cad.scene().primitives
    const faces = scene.filter((p) => p.kind === "path" && p.fill)
    // The top, the -X face and the -Y face, each 8 by 8 cells of two triangles.
    expect(faces).toHaveLength(3 * 64 * 2)
    const edges = scene.filter((p) => p.kind === "segment")
    expect(edges.filter((p) => p.stroke.color === THEME.entity).length).toBe(9)
    // Painted before every edge.
    const lastFace = scene.lastIndexOf(faces[faces.length - 1])
    expect(
      scene.findIndex(
        (p) => p.kind === "segment" && p.stroke.color === THEME.entity
      )
    ).toBeGreaterThan(lastFace)
  })

  it("shades a white box as AutoCAD does from SW Isometric (visualstyle/p03)", () => {
    const n = Math.sqrt(3)
    const w = { x: -1 / n, y: -1 / n, z: 1 / n }
    // Z drawn up: its part square to the line of sight.
    const up = { x: 1 / Math.sqrt(6), y: 1 / Math.sqrt(6), z: 2 / Math.sqrt(6) }
    const light = lightDirection(w, up)
    const rgb = (hex: string) =>
      [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
    const near = (got: number[], want: number[]) =>
      got.forEach((g, i) =>
        expect(Math.abs(g - want[i])).toBeLessThanOrEqual(4)
      )
    near(
      rgb(goochFill("#ffffff", { x: 0, y: 0, z: 1 }, light)),
      [130, 130, 133]
    )
    near(
      rgb(goochFill("#ffffff", { x: -1, y: 0, z: 0 }, light)),
      [122, 122, 127]
    )
    near(rgb(goochFill("#ffffff", { x: 0, y: -1, z: 0 }, light)), [85, 85, 101])
  })
})

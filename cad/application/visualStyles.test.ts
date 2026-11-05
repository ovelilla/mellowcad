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

/** The segments drawn in the objects' white: the solids' edges, the grid off. */
const edges = (cad: CadHarness) =>
  segments(cad).filter(
    (p) => p.kind === "segment" && p.stroke.color === THEME.entity
  )

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
    const cad = answer(isoBox(), "GRIDMODE", "0")
    cad.moveTo({ x: 1e6, y: 1e6, z: 0 })
    expect(edges(cad)).toHaveLength(12)
    answer(cad, "VSCURRENT", "_HIDDEN")
    cad.moveTo({ x: 1e6, y: 1e6, z: 0 })
    expect(edges(cad)).toHaveLength(9)
  })

  it("is a step U takes back, Enter's run too (probe solid-inquiry/p205)", () => {
    const cad = isoBox()
    answer(cad, "VSCURRENT", "H")
    expect(written(cad, "VSCURRENT", "")).toEqual([
      "VSCURRENT",
      "Enter an option [2dwireframe/Hidden/Conceptual] <Hidden>:",
    ])
    expect(written(cad, "U")).toEqual(["U", "VSCURRENT"])
    expect(style(cad)).toBe("hidden")
    expect(written(cad, "U")).toEqual(["U", "VSCURRENT Regenerating model."])
    expect(style(cad)).toBe("2dWireframe")
  })

  it("says Regenerating model. whenever a step leaves 2D Wireframe current, and only then (solid-inquiry/p205–p207)", () => {
    const cad = isoBox()
    expect(written(cad, "VSCURRENT", "H")).toEqual([
      "VSCURRENT",
      "Enter an option [2dwireframe/Hidden/Conceptual] <2dwireframe>: H",
    ])
    expect(written(cad, "VSCURRENT", "2")).toEqual([
      "VSCURRENT",
      "Enter an option [2dwireframe/Hidden/Conceptual] <Hidden>: 2",
      "Regenerating model.",
    ])
    // p207: U back to Hidden is silent, REDO back to 2D Wireframe is not.
    expect(written(cad, "U")).toEqual(["U", "VSCURRENT"])
    expect(style(cad)).toBe("hidden")
    expect(written(cad, "REDO")).toEqual([
      "REDO",
      "VSCURRENT",
      "Everything has been redone",
      "Regenerating model.",
    ])
    expect(style(cad)).toBe("2dWireframe")
    // p207: 2D Wireframe again from 2D Wireframe regenerates nothing.
    expect(written(cad, "VSCURRENT", "2")).toEqual([
      "VSCURRENT",
      "Enter an option [2dwireframe/Hidden/Conceptual] <2dwireframe>: 2",
    ])
  })

  it("takes two styles back with UNDO 2 and redoes them with MREDO All (solid-inquiry/p206)", () => {
    const cad = isoBox()
    answer(cad, "VSCURRENT", "H", "VSCURRENT", "C")
    expect(written(cad, "UNDO", "2").at(-1)).toBe(
      "VSCURRENT VSCURRENT Regenerating model."
    )
    expect(style(cad)).toBe("2dWireframe")
    expect(written(cad, "MREDO", "_A").slice(-2)).toEqual([
      "VSCURRENT VSCURRENT",
      "Everything has been redone",
    ])
    expect(style(cad)).toBe("conceptual")
  })

  it("lets no view command say Regenerating model. in Hidden or Conceptual (solid-inquiry/p219, p220, d01)", () => {
    const cad = createHarness()
    answer(cad, "BOX", "0,0,0", "10,10,10", "VSCURRENT", "H")
    const silent = (...texts: string[]) =>
      expect(written(cad, ...texts)).not.toContain("Regenerating model.")
    silent("-VIEW", "_SWISO")
    silent("-VIEW", "_TOP")
    silent("PLAN", "")
    silent("ZOOM", "_E")
    silent("REGEN")
    silent("-VPOINT", "1,1,1")
    // p220: their U and REDO too.
    expect(written(cad, "U")).toEqual(["U", "-VPOINT"])
    silent("-VIEW", "_TOP")
    expect(written(cad, "U")).toEqual(["U", "-VIEW"])
    expect(written(cad, "REDO")).toEqual([
      "REDO",
      "-VIEW",
      "Everything has been redone",
    ])
    answer(cad, "VSCURRENT", "C")
    silent("-VIEW", "_SEISO")
    silent("REGEN")
    // In 2D Wireframe a turn of the view says it (p214, d01).
    answer(cad, "VSCURRENT", "2")
    expect(written(cad, "-VIEW", "_SWISO")).toContain("Regenerating model.")
  })

  it("takes Hidden's hidden keyword, in each language (solid-inquiry/p204, p222)", () => {
    const english = isoBox()
    answer(english, "VSCURRENT", "_3DHIDDEN")
    expect(style(english)).toBe("hidden")
    const spanish = isoBox(es)
    answer(spanish, "ESTVISACTUAL", "OCULTO3D")
    expect(style(spanish)).toBe("hidden")
    const portuguese = isoBox(ptBR)
    answer(portuguese, "EVATUAL", "3DOCULTO")
    expect(style(portuguese)).toBe("hidden")
    // Not listed: the prompt reads as before.
    expect(written(english, "VSCURRENT", "")).toEqual([
      "VSCURRENT",
      "Enter an option [2dwireframe/Hidden/Conceptual] <Hidden>:",
    ])
  })

  it("will not run inside another command (solid-inquiry/p213)", () => {
    const cad = isoBox()
    answer(cad, "LINE", "0,0")
    expect(written(cad, "'VSCURRENT")).toEqual([
      "Specify next point or [Undo]: 'VSCURRENT",
      "** That command may not be invoked transparently **",
      "Point or option keyword required.",
    ])
    expect(cad.runtime.getState().activeToolId).toBe("line")
    answer(cad, "")
  })

  it("drops a preselection (solid-inquiry/p216)", () => {
    const cad = isoBox()
    cad.runtime.selectAll()
    answer(cad, "VSCURRENT", "H")
    expect(cad.runtime.getState().selectionCount).toBe(0)
  })

  it("is saved with the drawing, and offered as the default once reopened (v03, v04, solid-inquiry/p211)", () => {
    const cad = isoBox()
    answer(cad, "VSCURRENT", "H")
    const file = serializeDrawing(
      snapshotOf(cad.entities(), {
        settings: cad.runtime.document.getSettings(),
      })
    )
    expect(parseDrawingFile(file).settings.visualStyle).toBe("hidden")
    const reopened = createHarness()
    reopened.runtime.loadDrawing(file)
    expect(written(reopened, "VSCURRENT", "")).toEqual([
      "VSCURRENT",
      "Enter an option [2dwireframe/Hidden/Conceptual] <Hidden>:",
    ])
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
    // p202 es: the refusal in its words.
    expect(written(spanish, "ESTVISACTUAL", "FOO").slice(-2)).toEqual([
      "Indique una opción [estructuraalámbrica2d/ocUlto/Conceptual] <Oculto>: FOO",
      "Opción no válida.",
    ])
    answer(spanish, "")
    const portuguese = isoBox(ptBR)
    expect(written(portuguese, "EVATUAL", "U", "EVA", "")).toEqual([
      "EVATUAL",
      "Insira uma opção [estruturadearame2d/ocUlto/Conceitual] <estruturadearame2d>: U",
      "EVA EVATUAL",
      "Insira uma opção [estruturadearame2d/ocUlto/Conceitual] <ocUlto>:",
    ])
  })
})

describe("picking in Hidden and Conceptual", () => {
  /** Box A in front of box B from SW Isometric, as probe solid-inquiry/p314 draws them. */
  function twoBoxes(style: string): { cad: CadHarness; a: string; b: string } {
    const cad = createHarness({})
    answer(cad, "BOX", "0,0,0", "10,10", "10")
    const a = cad.entities()[0].id
    answer(cad, "BOX", "15,15,0", "25,25", "10")
    const b = cad.entities()[1].id
    answer(cad, "-VIEW", "_SWISO", "ZOOM", "E", "VSCURRENT", style)
    return { cad, a, b }
  }

  it("takes the solid whose face is in front, never an edge it hides (solid-inquiry/p314)", () => {
    // 17,15,0 lies on B's edge, hidden by A's top: 2D Wireframe takes B,
    // Hidden and Conceptual take A.
    for (const [style, taken] of [
      ["_2", "b"],
      ["_H", "a"],
      ["_C", "a"],
    ] as const) {
      const { cad, a, b } = twoBoxes(style)
      answer(cad, "ERASE", "17,15,0", "")
      expect(cad.entities().map((e) => e.id)).toEqual(taken === "a" ? [b] : [a])
    }
  })

  it("snaps to a vertex a face hides (solid-inquiry/p313)", () => {
    for (const style of ["_2", "_H", "_C"]) {
      const cad = createHarness({})
      answer(cad, "LUPREC", "4", "BOX", "0,0,0", "20,10", "10")
      answer(cad, "-VIEW", "_SWISO", "ZOOM", "E", "VSCURRENT", style)
      expect(written(cad, "ID", "_END", "19.9,9.9,0").at(-1)).toBe(
        " X = 20.0000     Y = 10.0000     Z = 0.0000"
      )
    }
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

describe("what Hidden and Conceptual draw", () => {
  it("leaves a solid on a layer that is off undrawn and hiding nothing (solid-inquiry/p309)", () => {
    for (const style of ["_H", "_C"]) {
      const cad = createHarness({})
      answer(cad, "GRIDMODE", "0", "BOX", "15,15,0", "25,25", "10")
      answer(cad, "-VIEW", "_SWISO", "ZOOM", "E", "VSCURRENT", style)
      cad.moveTo({ x: 1e6, y: 1e6, z: 0 })
      const alone = edges(cad).length
      const off = cad.runtime.createLayer("OFFL")
      answer(
        cad,
        "BOX",
        "0,0,0",
        "10,10",
        "10",
        "CHPROP",
        "L",
        "",
        "LA",
        "OFFL",
        ""
      )
      cad.moveTo({ x: 1e6, y: 1e6, z: 0 })
      expect(edges(cad).length).toBeGreaterThan(alone)
      cad.runtime.updateLayer(off, { visible: false })
      cad.moveTo({ x: 1e6, y: 1e6, z: 0 })
      expect(edges(cad)).toHaveLength(alone)
    }
  })

  it("draws lines, circles, text and hatches as in 2D Wireframe, in their colours (solid-inquiry/p301, p302)", () => {
    const drawn = (style: string) => {
      const cad = createHarness({})
      answer(cad, "GRIDMODE", "0", "LINE", "0,0", "20,10", "")
      answer(cad, "CHPROP", "L", "", "C", "1", "", "CIRCLE", "35,5", "5")
      answer(cad, "CHPROP", "L", "", "C", "3", "", "-TEXT", "0,30", "5", "0")
      answer(cad, "Abc", "CHPROP", "L", "", "C", "4", "")
      answer(cad, "RECTANG", "70,25", "85,40", "-HATCH", "P", "ANSI31", "1")
      answer(cad, "0", "77,32", "", "CHPROP", "L", "", "C", "6", "")
      answer(cad, "BOX", "120,-10,0", "140,10", "10")
      answer(cad, "-VIEW", "_SWISO", "ZOOM", "E", "VSCURRENT", style)
      cad.moveTo({ x: 1e6, y: 1e6, z: 0 })
      return cad
        .scene()
        .primitives.filter((p) => !("fill" in p && p.fill))
        .map((p) => JSON.stringify(p))
    }
    const wire = new Set(drawn("_2"))
    for (const style of ["_H", "_C"]) {
      // Every primitive of the 2D objects is the same; only the box's edges change.
      const shown = drawn(style).filter((p) => !p.includes(THEME.entity))
      // The line, the circle, the text and the hatch's lines, the
      // rectangle in white aside.
      expect(shown.length).toBeGreaterThan(4)
      for (const p of shown) expect(wire.has(p)).toBe(true)
    }
  })

  it("draws a fillet's tangent edges in Hidden (solid-inquiry/p306)", () => {
    const cad = createHarness({})
    answer(cad, "GRIDMODE", "0", "BOX", "0,0,0", "20,10", "10")
    answer(cad, "-VPOINT", "-1.3,-2.2,1.6", "ZOOM", "E")
    answer(cad, "FILLETEDGE", "_R", "3", "10,0,10", "", "", "VSCURRENT", "_H")
    cad.moveTo({ x: 1e6, y: 1e6, z: 0 })
    // Seven of the box's edges, the bottom's left and front, and the two
    // lines where the round meets the top and the front.
    expect(edges(cad)).toHaveLength(10)
  })

  it("draws a cylinder's circle and a cone's without its apex lines in plan (solid-inquiry/p307)", () => {
    for (const shape of [
      ["CYLINDER", "0,0,0", "5", "10"],
      ["CONE", "0,0,0", "5", "10"],
    ]) {
      const cad = createHarness({})
      answer(cad, "GRIDMODE", "0", ...shape)
      cad.moveTo({ x: 1e6, y: 1e6, z: 0 })
      expect(edges(cad).length).toBeGreaterThan(0)
      answer(cad, "VSCURRENT", "_H")
      cad.moveTo({ x: 1e6, y: 1e6, z: 0 })
      expect(edges(cad)).toHaveLength(0)
    }
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
    // The top, the -X face and the -Y face, each 4 by 4 cells.
    expect(faces).toHaveLength(3 * 16)
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

  it("fades a locked solid's faces as its edges, into the background (solid-inquiry/p310)", () => {
    const fills = (locked: boolean) => {
      const cad = isoBox()
      const layer = cad.runtime.document.getCurrentLayerId()
      cad.runtime.updateLayer(layer, { locked })
      answer(cad, "VSCURRENT", "C")
      cad.moveTo({ x: 1e6, y: 1e6, z: 0 })
      return cad
        .scene()
        .primitives.flatMap((p) =>
          p.kind === "path" && p.fill ? [p.fill] : []
        )
    }
    const rgb = (hex: string) =>
      [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
    const shown = fills(false)
    const faded = fills(true)
    expect(faded).toHaveLength(shown.length)
    const back = rgb(THEME.background)
    faded.forEach((fill, i) => {
      const want = rgb(shown[i]).map((c, k) => (c + back[k]) / 2)
      rgb(fill).forEach((c, k) =>
        expect(Math.abs(c - want[k])).toBeLessThanOrEqual(1)
      )
    })
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

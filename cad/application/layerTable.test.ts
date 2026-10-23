import { describe, expect, it } from "vitest"

import { type CadHarness, createHarness } from "../../test/harness"
import { layerOf, lineOf, p } from "../../test/builders"
import {
  DEFAULT_LAYER_ID,
  INVALID_LAYER_NAME_CHARACTERS,
} from "../domain/layers"
import type { LineEntity } from "../domain/entities"
import { es } from "../locales/es"

/** Each answer typed at the command line and confirmed, as the console types it. */
function answer(cad: CadHarness, ...texts: string[]): CadHarness {
  for (const text of texts) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

/** The lines `texts` add to the history. */
function written(cad: CadHarness, ...texts: string[]): string[] {
  const from = cad.commandLog().length
  answer(cad, ...texts)
  return cad.commandLog().slice(from)
}

const layer = (cad: CadHarness, id: string) =>
  cad.state().layers.find((entry) => entry.id === id)!

const names = (cad: CadHarness) => cad.state().layers.map((entry) => entry.name)

describe("a new layer and layer 0 (LAY-06)", () => {
  it("are index colour 7, Continuous (p300: 62 7, 6 Continuous)", () => {
    const cad = createHarness()
    const id = cad.runtime.createLayer()
    for (const entry of [layer(cad, DEFAULT_LAYER_ID), layer(cad, id)]) {
      expect(entry.color).toBe("#ffffff")
      expect(entry.linetype).toBe("Continuous")
    }
  })

  it("are named Layer1 / Capa1 (table 53391)", () => {
    const cad = createHarness()
    expect(layer(cad, cad.runtime.createLayer()).name).toBe("Layer1")
    const cadEs = createHarness({ locale: es })
    expect(layer(cadEs, cadEs.runtime.createLayer()).name).toBe("Capa1")
  })
})

describe("U takes back a layer edit (LAY-01)", () => {
  it("a colour, naming the manager's step (p301; d04-2's '.-LAYER)", () => {
    const cad = createHarness()
    cad.runtime.updateLayer(DEFAULT_LAYER_ID, { color: "#ff0000" })
    expect(written(cad, "U")).toEqual(["U", "'.-LAYER"])
    expect(layer(cad, DEFAULT_LAYER_ID).color).toBe("#ffffff")
  })

  it("a lock, which regenerates (p302; desktop d04-2)", () => {
    const cad = createHarness()
    cad.runtime.updateLayer(DEFAULT_LAYER_ID, { locked: true })
    expect(written(cad, "U")).toEqual(["U", "'.-LAYER Regenerating model."])
    expect(layer(cad, DEFAULT_LAYER_ID).locked).toBe(false)
    expect(written(cad, "REDO")).toEqual([
      "REDO",
      "'.-LAYER",
      "Everything has been redone",
      "Regenerating model.",
    ])
    expect(layer(cad, DEFAULT_LAYER_ID).locked).toBe(true)
  })

  it("an Off, which does not (p303)", () => {
    const cad = createHarness()
    const id = cad.runtime.createLayer("L1", undefined, false)
    answer(cad, "LINE", "0,0", "10,0", "")
    cad.runtime.updateLayer(id, { visible: false })
    expect(written(cad, "U")).toEqual(["U", "'.-LAYER"])
    expect(layer(cad, id).visible).toBe(true)
  })

  it("a new layer (p304: tblsearch nil)", () => {
    const cad = createHarness()
    cad.runtime.createLayer("L1", undefined, false)
    answer(cad, "U")
    expect(names(cad)).toEqual(["0"])
  })

  it("a deleted layer, back with its properties", () => {
    const cad = createHarness()
    const id = cad.runtime.createLayer("L1", "#ff0000", false)
    answer(cad, "LINE", "0,0", "10,0", "")
    expect(cad.runtime.removeLayer(id)).toBe(true)
    expect(names(cad)).toEqual(["0"])
    answer(cad, "U")
    expect(layer(cad, id)).toMatchObject({ name: "L1", color: "#ff0000" })
  })

  it("the manager's current layer (p306: -LAYER Set)", () => {
    const cad = createHarness()
    const id = cad.runtime.createLayer("L1", undefined, false)
    answer(cad, "LINE", "0,0", "10,0", "")
    cad.runtime.setCurrentLayer(id, "manager")
    expect(written(cad, "U")).toEqual(["U", "'.-LAYER"])
    expect(cad.state().currentLayerId).toBe(DEFAULT_LAYER_ID)
  })

  it("the drop-down's current layer with nothing selected, 'CLAYER (desktop d05-1; p308)", () => {
    const cad = createHarness()
    const id = cad.runtime.createLayer("Walls", "#ff0000", false)
    cad.runtime.applyLayerControl(id)
    expect(cad.state().currentLayerId).toBe(id)
    expect(written(cad, "U")).toEqual(["U", "'CLAYER"])
    expect(cad.state().currentLayerId).toBe(DEFAULT_LAYER_ID)
  })

  it("before the command ahead of it (p329: U -LAYER, then U LINE)", () => {
    const cad = createHarness()
    const id = cad.runtime.createLayer("L1", undefined, false)
    answer(cad, "LINE", "0,0", "100,0", "")
    cad.runtime.setCurrentLayer(id, "manager")
    expect(written(cad, "U")).toEqual(["U", "'.-LAYER"])
    expect(cad.entityCount).toBe(1)
    expect(cad.state().currentLayerId).toBe(DEFAULT_LAYER_ID)
    expect(written(cad, "U")).toEqual(["U", "LINE"])
    expect(cad.entityCount).toBe(0)
    expect(names(cad)).toEqual(["0", "L1"])
  })

  it("names the manager's step in Spanish (p302 es: -CAPA Regenerando modelo.)", () => {
    const cad = createHarness({ locale: es })
    cad.runtime.updateLayer(DEFAULT_LAYER_ID, { locked: true })
    expect(written(cad, "H")).toEqual(["H", "'.-CAPA Regenerando modelo."])
  })
})

describe("UNDO's Layer folds the manager's edits (LAY-07)", () => {
  it("consecutive edits are one step, every one named (desktop d04-3)", () => {
    const cad = createHarness()
    const id = cad.runtime.createLayer("Off", "#0000ff", false)
    answer(cad, "LINE", "0,0", "10,0", "")
    cad.runtime.updateLayer(id, { visible: false })
    cad.runtime.updateLayer(id, { locked: true })
    cad.runtime.updateLayer(id, { color: "#ff0000" })
    expect(written(cad, "U")).toEqual([
      "U",
      "'.-LAYER '.-LAYER '.-LAYER Regenerating model.",
    ])
    expect(layer(cad, id)).toMatchObject({
      visible: true,
      locked: false,
      color: "#0000ff",
    })
    expect(cad.entityCount).toBe(1)
  })

  it("a new layer and its Set are one U (p306: -LAYER -LAYER)", () => {
    const cad = createHarness()
    answer(cad, "LINE", "0,0", "10,0", "")
    const id = cad.runtime.createLayer("L1", undefined, false)
    cad.runtime.setCurrentLayer(id, "manager")
    expect(written(cad, "U")).toEqual(["U", "'.-LAYER '.-LAYER"])
    expect(names(cad)).toEqual(["0"])
    expect(cad.entityCount).toBe(1)
  })

  it("with Layer No, each is its own step (p315)", () => {
    const cad = createHarness()
    answer(cad, "UNDO", "C", "L", "N")
    const id = cad.runtime.createLayer("L1", undefined, false)
    cad.runtime.setCurrentLayer(id, "manager")
    expect(written(cad, "U")).toEqual(["U", "'.-LAYER"])
    expect(cad.state().currentLayerId).toBe(DEFAULT_LAYER_ID)
    expect(names(cad)).toEqual(["0", "L1"])
  })

  it("a command between two edits parts them", () => {
    const cad = createHarness()
    const id = cad.runtime.createLayer("L1", undefined, false)
    answer(cad, "LINE", "0,0", "10,0", "")
    cad.runtime.updateLayer(id, { color: "#ff0000" })
    expect(written(cad, "U")).toEqual(["U", "'.-LAYER"])
    expect(names(cad)).toEqual(["0", "L1"])
  })

  it("CLAYER after an edit is a step of its own (p308: U names CLAYER alone)", () => {
    const cad = createHarness()
    const id = cad.runtime.createLayer("L1", undefined, false)
    cad.runtime.applyLayerControl(id)
    expect(written(cad, "U")).toEqual(["U", "'CLAYER"])
    expect(names(cad)).toEqual(["0", "L1"])
  })

  it("an edit while a command runs joins its step", () => {
    const cad = createHarness()
    answer(cad, "LINE", "0,0", "10,0")
    cad.runtime.updateLayer(DEFAULT_LAYER_ID, { color: "#ff0000" })
    answer(cad, "")
    expect(written(cad, "U")).toEqual(["U", "LINE"])
    expect(layer(cad, DEFAULT_LAYER_ID).color).toBe("#ffffff")
    expect(cad.entityCount).toBe(0)
  })
})

describe("a rename the engine refuses (LAY-03)", () => {
  it("of layer 0 (p319; desktop d04-16)", () => {
    const cad = createHarness()
    expect(cad.runtime.updateLayer(DEFAULT_LAYER_ID, { name: "X" })).toBe(
      "base"
    )
    expect(layer(cad, DEFAULT_LAYER_ID).name).toBe("0")
    expect(cad.state().canUndo).toBe(false)
  })

  it("to a name in use, in any case (p320; desktop d04-11, d04-14)", () => {
    const cad = createHarness()
    const a = cad.runtime.createLayer("L1", undefined, false)
    cad.runtime.createLayer("Walls", undefined, false)
    for (const name of ["Walls", "walls", "WALLS", "0"]) {
      expect(cad.runtime.updateLayer(a, { name })).toBe("inUse")
    }
    expect(layer(cad, a).name).toBe("L1")
  })

  it.each([...INVALID_LAYER_NAME_CHARACTERS])(
    "with %s in it (p321; desktop d04-13)",
    (character) => {
      const cad = createHarness()
      const a = cad.runtime.createLayer("L1", undefined, false)
      expect(cad.runtime.updateLayer(a, { name: `A${character}B` })).toBe(
        "invalid"
      )
      expect(layer(cad, a).name).toBe("L1")
    }
  )

  it("takes another case of the layer's own name, undoably", () => {
    const cad = createHarness()
    const a = cad.runtime.createLayer("Walls", undefined, false)
    answer(cad, "LINE", "0,0", "10,0", "")
    expect(cad.runtime.updateLayer(a, { name: "WALLS" })).toBeNull()
    expect(layer(cad, a).name).toBe("WALLS")
    answer(cad, "U")
    expect(layer(cad, a).name).toBe("Walls")
  })
})

describe("deleting a layer (LAY-02)", () => {
  it("refuses one only a block definition uses (p380)", () => {
    const cad = createHarness({
      blocks: [
        {
          id: "B",
          name: "B",
          basePoint: p(0, 0),
          entities: [lineOf(p(0, 0), p(10, 0), { id: "in", layerId: "L1" })],
        },
      ],
    })
    cad.runtime.document.load([], { layers: [layerOf("0"), layerOf("L1")] })
    expect(layer(cad, "L1").entityCount).toBe(0)
    expect(cad.runtime.removeLayer("L1")).toBe(false)
    expect(names(cad)).toEqual(["0", "L1"])
  })
})

describe("the manager's New Layer (LAY-05, desktop d04-4)", () => {
  it("copies the selected layer's colour, linetype and lineweight; the current layer stays", () => {
    const cad = createHarness()
    const walls = cad.runtime.createLayer("Walls", "#ff0000", false)
    cad.runtime.updateLayer(walls, { linetype: "Dashed", lineweight: 0.5 })
    const id = cad.runtime.newLayer(walls)
    expect(layer(cad, id)).toMatchObject({
      name: "Layer1",
      color: "#ff0000",
      linetype: "Dashed",
      lineweight: 0.5,
    })
    expect(cad.state().currentLayerId).toBe(DEFAULT_LAYER_ID)
  })

  it("with none selected takes the defaults", () => {
    const cad = createHarness()
    cad.runtime.updateLayer(DEFAULT_LAYER_ID, { color: "#ff0000" })
    const id = cad.runtime.newLayer()
    expect(layer(cad, id).color).toBe("#ffffff")
    expect(cad.state().currentLayerId).toBe(DEFAULT_LAYER_ID)
  })
})

describe("the layers' order (LAY-15)", () => {
  it("is by name, whatever the case, for the manager and the drop-down (desktop d04-1, d05-1)", () => {
    const cad = createHarness()
    for (const name of ["Walls", "locked", "Off", "Doors"]) {
      cad.runtime.createLayer(name, undefined, false)
    }
    expect(names(cad)).toEqual(["0", "Doors", "locked", "Off", "Walls"])
  })

  it("follows a rename (desktop d04-9)", () => {
    const cad = createHarness()
    const a = cad.runtime.createLayer("Walls", undefined, false)
    cad.runtime.createLayer("Off", undefined, false)
    cad.runtime.updateLayer(a, { name: "Doors" })
    expect(names(cad)).toEqual(["0", "Doors", "Off"])
  })
})

describe("drawing and snapping with locked and off layers", () => {
  it("draws on a locked current layer (p313, line/p201)", () => {
    const cad = createHarness()
    cad.runtime.updateLayer("0", { locked: true })
    cad.command("LINE").click(p(0, 0)).click(p(100, 0)).enter()
    expect(cad.entityCount).toBe(1)
  })

  it("snaps _END on a locked line (p322: start 100,0)", () => {
    const cad = createHarness()
    cad.runtime.document.load(
      [lineOf(p(0, 0), p(100, 0), { id: "K", layerId: "L1" })],
      { layers: [layerOf("0"), layerOf("L1", { locked: true })] }
    )
    answer(cad, "LINE", "_END", "99,1", "200,200", "")
    const made = cad.entities().filter((e) => e.id !== "K") as LineEntity[]
    expect(made).toHaveLength(1)
    expect(made[0].start).toBeCloseToPoint(p(100, 0))
  })

  it("finds no endpoint on an off line (p323)", () => {
    const cad = createHarness()
    cad.runtime.document.load(
      [lineOf(p(0, 0), p(100, 0), { id: "K", layerId: "L1" })],
      { layers: [layerOf("0"), layerOf("L1", { visible: false })] }
    )
    answer(cad, "LINE", "_END", "99,1")
    expect(cad.commandLog().slice(-2)).toEqual([
      "No Endpoint found for specified point.",
      "Invalid point.",
    ])
  })
})

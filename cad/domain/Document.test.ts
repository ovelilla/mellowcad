import { describe, expect, it, vi } from "vitest"
import { CadDocument } from "./Document"
import {
  assignEntityColor,
  assignEntityLinetype,
  createDimension,
} from "./entities"
import { DEFAULT_LAYER_ID, createLayer } from "./layers"
import { DEFAULT_DIM_STYLE_ID, createDimStyle } from "./dimStyles"
import { DEFAULT_LINETYPE_ID } from "./linetypes"
import { DEFAULT_LINEWEIGHT } from "./lineweights"
import { LengthUnit } from "./units"
import { circleOf, documentWith, layerOf, lineOf, p } from "../../test/builders"

/**
 * The document is the single source of truth. Two of its jobs are easy to
 * regress silently: notifying subscribers exactly once per logical change (bulk
 * operations must not storm the UI), and enforcing the layer rules that decide
 * what is drawn, picked and edited.
 */

describe("notification", () => {
  it("emits once per bulk operation, not once per entity", () => {
    // Every emit rebuilds the UI snapshot and schedules a frame, so a loop of
    // single adds would be a performance cliff on file load.
    const document = new CadDocument()
    const listener = vi.fn()
    document.subscribe(listener)

    document.addMany([
      lineOf(p(0, 0), p(1, 0), { id: "L1" }),
      lineOf(p(0, 1), p(1, 1), { id: "L2" }),
      lineOf(p(0, 2), p(1, 2), { id: "L3" }),
    ])

    expect(listener).toHaveBeenCalledTimes(1)
  })

  it("stays silent when a bulk operation changes nothing", () => {
    const document = new CadDocument()
    const listener = vi.fn()
    document.subscribe(listener)

    document.addMany([])
    document.removeMany([])
    document.clear()
    document.remove("missing")

    expect(listener).not.toHaveBeenCalled()
  })

  it("stays silent when a setter is given the value it already has", () => {
    const document = new CadDocument()
    const listener = vi.fn()
    document.subscribe(listener)

    document.setUnit(LengthUnit.Millimeter)
    document.setPrecision(2)
    document.setLwDisplay(true)
    document.setCurrentLayer(DEFAULT_LAYER_ID)

    expect(listener).not.toHaveBeenCalled()
  })

  it("stops notifying an unsubscribed listener", () => {
    const document = new CadDocument()
    const listener = vi.fn()
    const unsubscribe = document.subscribe(listener)

    unsubscribe()
    document.add(lineOf(p(0, 0), p(1, 0), { id: "L1" }))

    expect(listener).not.toHaveBeenCalled()
  })
})

describe("entity storage", () => {
  it("replaces an entity that shares an id", () => {
    const document = documentWith([lineOf(p(0, 0), p(1, 0), { id: "L1" })])

    document.update(lineOf(p(5, 5), p(9, 9), { id: "L1" }))

    expect(document.size).toBe(1)
    expect(document.get("L1")?.type).toBe("line")
  })

  it("reports membership and size", () => {
    const document = documentWith([lineOf(p(0, 0), p(1, 0), { id: "L1" })])

    expect(document.has("L1")).toBe(true)
    expect(document.has("nope")).toBe(false)
    expect(document.get("nope")).toBeUndefined()
    expect(document.size).toBe(1)
  })

  it("puts removed objects back at the indices they had, in one change", () => {
    const ids = ["A", "B", "C", "D"]
    const document = documentWith(
      ids.map((id, i) => lineOf(p(0, i), p(1, i), { id }))
    )
    const placed = document.placesOf(["D", "B", "ghost"])
    expect(placed.map((place) => [place.entity.id, place.index])).toEqual([
      ["B", 1],
      ["D", 3],
    ])
    document.removeMany(["B", "D"])
    const listener = vi.fn()
    document.subscribe(listener)

    document.restoreMany(placed)

    expect(document.getEntities().map((e) => e.id)).toEqual(ids)
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it("moves an object it still holds back to its index", () => {
    const document = documentWith([
      lineOf(p(0, 0), p(1, 0), { id: "A" }),
      lineOf(p(0, 1), p(1, 1), { id: "B" }),
    ])
    const placed = document.placesOf(["A"])
    document.remove("A")
    document.add(lineOf(p(0, 0), p(2, 0), { id: "A" }))

    document.restoreMany(placed)

    expect(document.getEntities().map((e) => e.id)).toEqual(["A", "B"])
    expect(document.get("A")).toBe(placed[0].entity)
  })

  it("counts only the entities it actually removed", () => {
    const document = documentWith([
      lineOf(p(0, 0), p(1, 0), { id: "L1" }),
      lineOf(p(0, 1), p(1, 1), { id: "L2" }),
    ])

    expect(document.removeMany(["L1", "ghost"])).toBe(1)
    expect(document.size).toBe(1)
  })
})

describe("picking", () => {
  it("finds the entity within tolerance and ignores the rest", () => {
    const document = documentWith([
      lineOf(p(0, 0), p(100, 0), { id: "L1" }),
      lineOf(p(0, 500), p(100, 500), { id: "L2" }),
    ])

    expect(document.pick(p(50, 3), 8)?.id).toBe("L1")
    expect(document.pick(p(50, 200), 8)).toBeNull()
  })

  // AutoCAD 2027's console: ERASE's `Select objects:` and TRIM's object
  // prompt take the newer of two lines in the pick box, though the pick is
  // nearer the older (probes trim/p400–p403, p257, p402).
  it("prefers the most recently drawn candidate, nearer or not", () => {
    const document = documentWith([
      lineOf(p(0, 0), p(100, 0), { id: "OLDER" }),
      lineOf(p(0, 5), p(100, 5), { id: "NEWER" }),
    ])

    expect(document.pick(p(50, 1), 8)?.id).toBe("NEWER")
    expect(document.pick(p(50, 4), 8)?.id).toBe("NEWER")
  })

  it("prefers the most recently drawn entity on a tie", () => {
    const document = documentWith([
      lineOf(p(0, 0), p(100, 0), { id: "UNDER" }),
      lineOf(p(0, 0), p(100, 0), { id: "OVER" }),
    ])

    expect(document.pick(p(50, 0), 8)?.id).toBe("OVER")
  })

  it("never picks something on a hidden or locked layer", () => {
    const document = documentWith(
      [
        lineOf(p(0, 0), p(100, 0), { id: "HIDDEN", layerId: "hidden" }),
        lineOf(p(0, 1), p(100, 1), { id: "LOCKED", layerId: "locked" }),
      ],
      {
        layers: [
          layerOf("hidden", { visible: false }),
          layerOf("locked", { locked: true }),
        ],
      }
    )

    expect(document.pick(p(50, 0), 8)).toBeNull()
  })
})

describe("pickAll (selection cycling candidates)", () => {
  it("lists every entity under the pick box, newest first", () => {
    const document = documentWith([
      lineOf(p(0, 0), p(100, 0), { id: "NEAR" }),
      lineOf(p(0, 5), p(100, 5), { id: "FAR" }),
      lineOf(p(0, 500), p(100, 500), { id: "AWAY" }),
    ])

    expect(document.pickAll(p(50, 0), 8).map((e) => e.id)).toEqual([
      "FAR",
      "NEAR",
    ])
  })

  it("starts with the entity a plain pick returns, tie included", () => {
    const document = documentWith([
      lineOf(p(0, 0), p(100, 0), { id: "UNDER" }),
      lineOf(p(0, 0), p(100, 0), { id: "OVER" }),
    ])

    const candidates = document.pickAll(p(50, 0), 8)
    expect(candidates.map((e) => e.id)).toEqual(["OVER", "UNDER"])
    expect(candidates[0].id).toBe(document.pick(p(50, 0), 8)?.id)
  })

  it("skips layers that are off, like pick", () => {
    const document = documentWith(
      [
        lineOf(p(0, 0), p(100, 0), { id: "HIDDEN", layerId: "hidden" }),
        lineOf(p(0, 1), p(100, 1), { id: "VISIBLE" }),
      ],
      { layers: [layerOf("hidden", { visible: false })] }
    )

    expect(document.pickAll(p(50, 0), 8).map((e) => e.id)).toEqual(["VISIBLE"])
  })
})

describe("layers", () => {
  it("starts with the base layer current", () => {
    const document = new CadDocument()

    expect(document.getLayers()).toHaveLength(1)
    expect(document.getCurrentLayerId()).toBe(DEFAULT_LAYER_ID)
  })

  it("ignores a request to make an unknown layer current", () => {
    const document = new CadDocument()

    document.setCurrentLayer("ghost")

    expect(document.getCurrentLayerId()).toBe(DEFAULT_LAYER_ID)
  })

  it("refuses to remove the base, the current or an occupied layer", () => {
    const document = new CadDocument()
    document.addLayer(
      createLayer("Used", undefined, undefined, undefined, "used")
    )
    document.addLayer(
      createLayer("Free", undefined, undefined, undefined, "free")
    )
    document.add(lineOf(p(0, 0), p(1, 0), { id: "L1", layerId: "used" }))
    document.setCurrentLayer("free")

    expect(document.removeLayer(DEFAULT_LAYER_ID)).toBe(false)
    expect(document.removeLayer("free")).toBe(false)
    expect(document.removeLayer("used")).toBe(false)
    expect(document.removeLayer("ghost")).toBe(false)

    document.setCurrentLayer(DEFAULT_LAYER_ID)
    expect(document.removeLayer("free")).toBe(true)
  })

  it("refuses to remove a layer only a block definition uses, nested too (p380)", () => {
    const document = documentWith([], {
      layers: [layerOf("L1"), layerOf("L2"), layerOf("free")],
    })
    document.addBlock({
      id: "INNER",
      name: "INNER",
      basePoint: p(0, 0),
      entities: [lineOf(p(0, 0), p(1, 0), { id: "A", layerId: "L2" })],
    })
    document.addBlock({
      id: "OUTER",
      name: "OUTER",
      basePoint: p(0, 0),
      entities: [lineOf(p(0, 0), p(1, 0), { id: "B", layerId: "L1" })],
    })

    expect(document.removeLayer("L1")).toBe(false)
    expect(document.removeLayer("L2")).toBe(false)
    expect(document.removeLayer("free")).toBe(true)
  })

  it("puts a removed layer back where it stood", () => {
    const document = documentWith([], {
      layers: [layerOf("A"), layerOf("B"), layerOf("C")],
    })
    const removed = document.getLayer("B")!
    const index = document.getLayers().indexOf(removed)
    document.removeLayer("B")

    document.restoreLayer(removed, index)

    expect(document.getLayers().map((layer) => layer.id)).toEqual([
      "0",
      "A",
      "B",
      "C",
    ])
  })

  it("resolves appearance ByObject first, then ByLayer", () => {
    const document = documentWith([], {
      layers: [
        layerOf("styled", {
          color: "#00ff00",
          linetype: "Dashed",
          lineweight: 0.7,
        }),
      ],
    })
    const inherited = lineOf(p(0, 0), p(1, 0), { id: "A", layerId: "styled" })
    const overridden = assignEntityLinetype(
      assignEntityColor(inherited, "#ff0000"),
      "Hidden"
    )

    expect(document.resolveEntityColor(inherited)).toBe("#00ff00")
    expect(document.resolveEntityLinetype(inherited)).toBe("Dashed")
    expect(document.resolveEntityLineweight(inherited)).toBe(0.7)

    expect(document.resolveEntityColor(overridden)).toBe("#ff0000")
    expect(document.resolveEntityLinetype(overridden)).toBe("Hidden")
  })

  it("falls back to the base layer for a dangling reference", () => {
    const document = new CadDocument()
    const orphan = lineOf(p(0, 0), p(1, 0), { id: "L1", layerId: "gone" })

    expect(document.resolveEntityLinetype(orphan)).toBe(DEFAULT_LINETYPE_ID)
    expect(document.resolveEntityLineweight(orphan)).toBe(DEFAULT_LINEWEIGHT)
  })

  it("distinguishes visible from selectable", () => {
    const document = documentWith([], {
      layers: [
        layerOf("off", { visible: false }),
        layerOf("locked", { locked: true }),
      ],
    })
    const hidden = lineOf(p(0, 0), p(1, 0), { id: "A", layerId: "off" })
    const locked = lineOf(p(0, 0), p(1, 0), { id: "B", layerId: "locked" })

    expect(document.isEntityVisible(hidden)).toBe(false)
    expect(document.isEntitySelectable(hidden)).toBe(false)

    // Locked geometry is still drawn and snappable — just not editable.
    expect(document.isEntityVisible(locked)).toBe(true)
    expect(document.isEntitySelectable(locked)).toBe(false)
  })
})

describe("load", () => {
  it("replaces the drawing in a single notification", () => {
    const document = documentWith([lineOf(p(0, 0), p(1, 0), { id: "OLD" })])
    const listener = vi.fn()
    document.subscribe(listener)

    document.load([circleOf(p(0, 0), 5, { id: "NEW" })])

    expect(listener).toHaveBeenCalledTimes(1)
    expect(document.size).toBe(1)
    expect(document.has("OLD")).toBe(false)
  })

  it("always keeps a base layer, whatever the file supplied", () => {
    const document = new CadDocument()

    document.load([], { layers: [layerOf("only")] })

    expect(document.getLayer(DEFAULT_LAYER_ID)).toBeDefined()
  })

  it("remaps entities whose layer did not survive the load", () => {
    const document = new CadDocument()

    document.load(
      [lineOf(p(0, 0), p(1, 0), { id: "L1", layerId: "vanished" })],
      { layers: [layerOf("present")] }
    )

    expect(document.get("L1")?.layerId).toBe(DEFAULT_LAYER_ID)
  })

  it("keeps the current layer when the load does not name one", () => {
    // Undoing "clear all" must not silently move the user to layer 0.
    const document = new CadDocument()
    document.addLayer(
      createLayer("Walls", undefined, undefined, undefined, "walls")
    )
    document.setCurrentLayer("walls")

    document.load([])

    expect(document.getCurrentLayerId()).toBe("walls")
  })

  it("falls back to the base layer when the named current layer is gone", () => {
    const document = new CadDocument()

    document.load([], {
      layers: [layerOf("present")],
      currentLayerId: "missing",
    })

    expect(document.getCurrentLayerId()).toBe(DEFAULT_LAYER_ID)
  })
})

describe("dimension styles", () => {
  const dim = (styleId: string) =>
    createDimension("linear", p(0, 0), p(10, 0), p(5, 5), {
      styleId,
      id: "D1",
    })

  it("starts with the base ISO-25 style current", () => {
    const document = new CadDocument()
    expect(document.getCurrentDimStyleId()).toBe(DEFAULT_DIM_STYLE_ID)
    expect(document.getDimStyle(DEFAULT_DIM_STYLE_ID)?.textHeight).toBe(2.5)
  })

  it("adds a style and makes it current, ignoring unknown ids", () => {
    const document = new CadDocument()
    document.addDimStyle(createDimStyle("Big", { textHeight: 10 }))

    document.setCurrentDimStyle("Big")
    expect(document.getCurrentDimStyleId()).toBe("Big")

    document.setCurrentDimStyle("nope")
    expect(document.getCurrentDimStyleId()).toBe("Big")
    expect(document.getDimStyles()).toHaveLength(2)
  })

  it("always keeps the base style, whatever the file supplied", () => {
    const document = new CadDocument()

    document.load([], { dimStyles: [createDimStyle("Only")] })

    expect(document.getDimStyle(DEFAULT_DIM_STYLE_ID)).toBeDefined()
  })

  it("remaps a dimension whose style did not survive the load", () => {
    const document = new CadDocument()

    document.load([dim("vanished")], {
      dimStyles: [createDimStyle("present")],
    })

    const loaded = document.get("D1")
    expect(loaded?.type === "dimension" && loaded.styleId).toBe(
      DEFAULT_DIM_STYLE_ID
    )
  })
})

describe("settings", () => {
  it("clamps precision into the supported range", () => {
    const document = new CadDocument()

    document.setPrecision(-5)
    expect(document.getSettings().precision).toBe(0)

    document.setPrecision(12)
    expect(document.getSettings().precision).toBe(8)

    document.setPrecision(3.6)
    expect(document.getSettings().precision).toBe(4)
  })

  it("clamps the linetype scale to a usable range", () => {
    const document = new CadDocument()

    document.setLtScale(0)
    expect(document.getSettings().ltScale).toBe(0.01)

    document.setLtScale(99_999)
    expect(document.getSettings().ltScale).toBe(1000)
  })
})

import { describe, expect, it } from "vitest"

import { createHarness } from "../../test/harness"
import { circleOf, lineOf, p } from "../../test/builders"
import type { CircleEntity, LineEntity } from "../domain/entities"
import { es } from "../locales/es"

describe("the palette panel", () => {
  it("starts folded on Properties unless the host opens it", () => {
    expect(createHarness().state().palette).toEqual({
      open: false,
      tab: "properties",
    })
  })

  it.each([
    ["LAYER", "layers"],
    ["LA", "layers"],
    ["PROPERTIES", "properties"],
    ["PR", "properties"],
    ["CH", "properties"],
    ["MO", "properties"],
    ["_LAYER", "layers"],
    ["_PROPERTIES", "properties"],
  ])("%s opens it on its palette", (command, tab) => {
    const cad = createHarness()
    cad.command(command)
    expect(cad.state().palette).toEqual({ open: true, tab })
  })

  it.each([
    ["CAPA", "layers"],
    ["CA", "layers"],
    ["PROPIEDADES", "properties"],
    ["PR", "properties"],
    ["_LAYER", "layers"],
    ["_PROPERTIES", "properties"],
  ])("%s opens it in Spanish", (command, tab) => {
    const cad = createHarness({ locale: es })
    cad.command(command)
    expect(cad.state().palette).toEqual({ open: true, tab })
  })

  it("LAYERCLOSE and PROPERTIESCLOSE fold it only while their palette shows", () => {
    const cad = createHarness()
    cad.command("LAYER")
    cad.command("PROPERTIESCLOSE")
    expect(cad.state().palette).toEqual({ open: true, tab: "layers" })
    cad.command("LAYERCLOSE")
    expect(cad.state().palette).toEqual({ open: false, tab: "layers" })

    cad.command("PROPERTIES")
    cad.command("LAYERCLOSE")
    expect(cad.state().palette).toEqual({ open: true, tab: "properties" })
    cad.command("PROPERTIESCLOSE")
    expect(cad.state().palette).toEqual({ open: false, tab: "properties" })
  })

  it.each([
    ["CERRARCAPA", "CAPA"],
    ["CERPROP", "PROPIEDADES"],
    ["_LAYERCLOSE", "_LAYER"],
    ["_PROPERTIESCLOSE", "_PROPERTIES"],
  ])("%s closes it in Spanish", (close, open) => {
    const cad = createHarness({ locale: es })
    cad.command(open)
    cad.command(close)
    expect(cad.state().palette.open).toBe(false)
  })

  it("is modeless: drawing with the layer manager open leaves it open", () => {
    const cad = createHarness()
    cad.command("LA")
    cad.command("LINE").click(p(0, 0)).click(p(100, 0)).enter()

    const end = cad.only<LineEntity>("line").end
    expect([end.x, end.y]).toEqual([100, expect.closeTo(0)])
    expect(cad.state().palette).toEqual({ open: true, tab: "layers" })

    cad.click(p(500, 500))
    expect(cad.state().palette).toEqual({ open: true, tab: "layers" })
  })

  it("its fold button reopens the palette it last showed", () => {
    const cad = createHarness()
    cad.command("BLOCKSPALETTE")
    cad.runtime.setPaletteOpen(false)
    cad.runtime.setPaletteOpen(true)
    expect(cad.state().palette).toEqual({ open: true, tab: "blocks" })
  })
})

describe("the Properties palette's object type drop-down", () => {
  const mixed = () => {
    const cad = createHarness({
      entities: [
        lineOf(p(0, 0), p(100, 0), { id: "L1" }),
        lineOf(p(0, 10), p(100, 10), { id: "L2" }),
        circleOf(p(50, 50), 10, { id: "C1" }),
      ],
    })
    cad.selectAll()
    return cad
  }

  it("lists All, then each type with its count", () => {
    const { properties } = mixed().state()
    expect(properties.filters).toEqual([
      { type: null, label: "All (3)" },
      { type: "line", label: "Line (2)" },
      { type: "circle", label: "Circle (1)" },
    ])
    expect(properties.filter).toBeNull()
    expect(properties.info?.count).toBe(3)
  })

  it("has one entry, the type, when the selection is of one type", () => {
    const cad = createHarness({
      entities: [circleOf(p(0, 0), 10, { id: "C1" })],
    })
    cad.select("C1")
    expect(cad.state().properties.filters).toEqual([
      { type: "circle", label: "Circle (1)" },
    ])
    expect(cad.state().properties.filter).toBe("circle")
  })

  it("is empty with nothing selected", () => {
    const { properties } = createHarness().state()
    expect(properties.filters).toEqual([])
    expect(properties.info).toBeNull()
  })

  it("narrows what the palette edits, and keeps the selection", () => {
    const cad = mixed()
    cad.runtime.setPropertiesFilter("circle")

    expect(cad.state().properties.info?.title).toBe("Circle")
    expect(cad.selectedIds()).toHaveLength(3)

    // One object of the type: its geometry is editable.
    expect(cad.runtime.setSelectionProperty("radius", "25")).toBe(true)
    expect(cad.only<CircleEntity>("circle").radius).toBe(25)

    cad.runtime.setSelectionColor("#ff0000", "properties")
    const colors = Object.fromEntries(
      cad.entities().map((entity) => [entity.id, entity.color])
    )
    expect(colors).toEqual({ L1: undefined, L2: undefined, C1: "#ff0000" })
  })

  it("leaves the ribbon's drop-downs on the whole selection", () => {
    const cad = mixed()
    cad.runtime.setPropertiesFilter("line")
    const layer = cad.runtime.createLayer("Walls", undefined, false)

    cad.runtime.setSelectionLayer(layer, "properties")
    expect(cad.state().properties.layerId).toBe(layer)
    // Mixed over the whole selection: the circle stayed on 0.
    expect(cad.state().selectionLayerId).toBeNull()

    cad.runtime.setSelectionLinetype("DASHED")
    expect(cad.entities().every((entity) => entity.linetype === "DASHED")).toBe(
      true
    )
  })

  it("is one undo step per edit, over the narrowed objects", () => {
    const cad = mixed()
    cad.runtime.setPropertiesFilter("line")
    cad.runtime.setSelectionColor("#00ff00", "properties")
    cad.undo()
    expect(cad.entities().every((entity) => entity.color === undefined)).toBe(
      true
    )
  })

  it("goes back to All when the selection changes", () => {
    const cad = mixed()
    cad.runtime.setPropertiesFilter("circle")
    cad.select("L1", "C1")
    expect(cad.state().properties.filter).toBeNull()
    expect(cad.state().properties.filters[0].label).toBe("All (2)")
  })

  it("names its entries in the interface language", () => {
    const cad = createHarness({
      locale: es,
      entities: [
        lineOf(p(0, 0), p(100, 0), { id: "L1" }),
        circleOf(p(50, 50), 10, { id: "C1" }),
      ],
    })
    cad.selectAll()
    expect(cad.state().properties.filters.map((entry) => entry.label)).toEqual([
      "Todo (2)",
      "Línea (1)",
      "Círculo (1)",
    ])
  })

  // desktop circle/d10: one Geometry group, Center X Y Z first, then Radius,
  // Diameter, Circumference, Area and Normal X Y Z, only the normal greyed.
  it("lists a circle's geometry in AutoCAD's order, Circumference and Area editable", () => {
    const cad = createHarness({
      entities: [circleOf(p(10, 20), 10, { id: "C1" })],
    })
    cad.select("C1")
    const groups = cad.state().properties.info!.groups
    expect(
      groups.map((g) => [
        g.title,
        g.rows.map((r) => `${r.label}=${r.value}${r.edit ? "*" : ""}`),
      ])
    ).toEqual([
      [
        "Geometry",
        [
          "Center X=10.00*",
          "Center Y=20.00*",
          "Center Z=0.00*",
          "Radius=10.00 mm*",
          "Diameter=20.00 mm*",
          "Circumference=62.83 mm*",
          "Area=314.16 mm²*",
          "Normal X=0.00",
          "Normal Y=0.00",
          "Normal Z=1.00",
        ],
      ],
    ])
  })

  it("sets a circle's radius from its Circumference or Area, refusing 0 or less", () => {
    const cad = createHarness({
      entities: [circleOf(p(0, 0), 10, { id: "C1" })],
    })
    cad.select("C1")
    expect(cad.runtime.setSelectionProperty("circumference", "0")).toBe(false)
    expect(cad.runtime.setSelectionProperty("area", "-1")).toBe(false)
    expect(cad.byId<CircleEntity>("C1").radius).toBe(10)
    expect(cad.runtime.setSelectionProperty("circumference", "100")).toBe(true)
    expect(cad.byId<CircleEntity>("C1").radius).toBeCloseTo(50 / Math.PI, 9)
    expect(cad.runtime.setSelectionProperty("area", "100")).toBe(true)
    expect(cad.byId<CircleEntity>("C1").radius).toBeCloseTo(
      Math.sqrt(100 / Math.PI),
      9
    )
  })

  // Spanish: Centro X as Autodesk's Spanish support names the palette's
  // View rows ("Centro X y Centro Y dentro de la vista"); the desktop's own
  // circle rows are unverified.
  it("names a circle's centre rows in Spanish", () => {
    const cad = createHarness({
      locale: es,
      entities: [circleOf(p(0, 0), 10, { id: "C1" })],
    })
    cad.select("C1")
    const rows = cad.state().properties.info!.groups[0].rows
    expect(rows.slice(0, 3).map((row) => row.label)).toEqual([
      "Centro X",
      "Centro Y",
      "Centro Z",
    ])
  })
})

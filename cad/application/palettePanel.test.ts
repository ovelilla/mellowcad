import { describe, expect, it } from "vitest"

import { createHarness } from "../../test/harness"
import { arcOf, circleOf, deg, ellipseOf, lineOf, p } from "../../test/builders"
import type {
  ArcEntity,
  CircleEntity,
  EllipseEntity,
  LineEntity,
  SplineEntity,
} from "../domain/entities"
import {
  createBlockDefinition,
  createInsert,
  createSpline,
} from "../domain/entities"
import type { InsertEntity } from "../domain/entities"
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
    // acad.pgp: `DDLMODES, *LAYER`.
    ["DDLMODES", "layers"],
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
    // es acad.pgp: `LAYER, *CAPA` and `DDLMODES, *CAPA`.
    ["LAYER", "layers"],
    ["DDLMODES", "layers"],
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

    cad.runtime.setSelectionLinetype("Dashed")
    expect(cad.entities().every((entity) => entity.linetype === "Dashed")).toBe(
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

  /**
   * Picked in this order: `circles` circles, `lines` lines, `references`
   * references of a block, and a rectangular array of one more circle.
   */
  const withArray = (
    circles: number,
    lines: number,
    references: number,
    locale?: typeof es
  ) => {
    const cad = createHarness({
      locale,
      blocks: [createBlockDefinition("B", p(0, 0), [lineOf(p(0, 0), p(5, 0))])],
      entities: [
        ...Array.from({ length: circles }, (_, i) =>
          circleOf(p(200, 40 * i), 5, { id: `C${i}` })
        ),
        ...Array.from({ length: lines }, (_, i) =>
          lineOf(p(0, 10 * i), p(100, 10 * i), { id: `L${i}` })
        ),
        ...Array.from({ length: references }, (_, i) =>
          createInsert("B", p(300, 20 * i), { id: `I${i}` })
        ),
        circleOf(p(10, -100), 2, { id: "S" }),
      ],
    })
    for (const text of ["_ARRAYRECT", "_L", "", "_X"]) {
      cad.runtime.setCommandLineText(text)
      cad.runtime.submitCommandLine()
    }
    cad.selectAll()
    return cad
  }

  // desktop properties/d06-2: an array is a type of its own, named by its
  // kind; the types by count, most first, whatever order they were picked
  // in. Ties keep the order picked (unverified, PROPS-D64).
  it("lists an array apart from the block references, the types by count (desktop properties/d06-2)", () => {
    const cad = withArray(2, 4, 3)
    expect(cad.state().properties.filters).toEqual([
      { type: null, label: "All (10)" },
      { type: "line", label: "Line (4)" },
      { type: "insert", label: "Block Reference (3)" },
      { type: "circle", label: "Circle (2)" },
      { type: "rectangularArray", label: "Array (Rectangular) (1)" },
    ])
  })

  // desktop properties/e01 (the drop-down read with CB_GETLBTEXT).
  it("names its entries in the interface language (desktop properties/e01)", () => {
    const cad = withArray(1, 3, 2, es)
    expect(cad.state().properties.filters.map((entry) => entry.label)).toEqual([
      "Todos (7)",
      "Línea (3)",
      "Referencia a bloque (2)",
      "Círculo (1)",
      "Matriz (rectangular) (1)",
    ])
  })

  // The polar's and the path's names are the same table's (AcArrayRes 39923,
  // 887), unseen in the drop-down.
  it("names a polar and a path array by their kind", () => {
    for (const [run, label] of [
      [["_ARRAYPOLAR", "_L", "", "0,0", "_X"], "Matriz (polar) (1)"],
      [["_ARRAYPATH", "_L", "", "50,0", "_X"], "Matriz (de ruta) (1)"],
    ] as const) {
      const cad = createHarness({
        locale: es,
        entities: [
          lineOf(p(0, 0), p(80, 0), { id: "P" }),
          circleOf(p(10, 10), 2, { id: "S" }),
        ],
      })
      for (const text of run) {
        cad.runtime.setCommandLineText(text)
        cad.runtime.submitCommandLine()
      }
      cad.selectAll()
      expect(
        cad.state().properties.filters.map((entry) => entry.label)
      ).toEqual(["Todos (2)", "Línea (1)", label])
    }
  })

  it("edits only the arrays when narrowed to them, only the references when to those", () => {
    const cad = withArray(0, 1, 2)
    cad.runtime.setPropertiesFilter("rectangularArray")
    expect(cad.state().properties.info?.title).toBe("Array (Rectangular)")
    cad.runtime.setSelectionColor("#ff0000", "properties")
    cad.runtime.setPropertiesFilter("insert")
    expect(cad.state().properties.info?.count).toBe(2)
    cad.runtime.setSelectionColor("#00ff00", "properties")

    const colors = cad
      .entities()
      .map((entity) => [
        entity.type === "insert" && (entity as InsertEntity).array
          ? "array"
          : entity.id,
        entity.color,
      ])
    expect(colors).toEqual([
      ["L0", undefined],
      ["I0", "#00ff00"],
      ["I1", "#00ff00"],
      ["array", "#ff0000"],
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

  // desktop arc/d09: one Geometry group, Start X Y Z, Center X Y Z, End X Y
  // Z, Radius, Start angle, End angle, Total angle, Arc length, Area and
  // Normal X Y Z, the ends, Total angle, Arc length, Area and the normal
  // greyed; Area the segment's (r 10.0577 through 167.7° is 137.303 there).
  it("lists an arc's geometry in AutoCAD's order, the ends and measures read-only", () => {
    const cad = createHarness({
      entities: [arcOf(p(10, 20), 10, deg(10), deg(100), { id: "A1" })],
    })
    cad.select("A1")
    const info = cad.state().properties.info!
    expect(
      info.groups.map((g) => [
        g.title,
        g.rows.map((r) => `${r.label}=${r.value}${r.edit ? "*" : ""}`),
      ])
    ).toEqual([
      [
        "Geometry",
        [
          "Start X=19.85",
          "Start Y=21.74",
          "Start Z=0.00",
          "Center X=10.00*",
          "Center Y=20.00*",
          "Center Z=0.00*",
          "End X=8.26",
          "End Y=29.85",
          "End Z=0.00",
          "Radius=10.00 mm*",
          "Start angle=10°*",
          "End angle=100°*",
          "Total angle=90°",
          "Arc length=15.71 mm",
          "Area=28.54 mm²",
          "Normal X=0.00",
          "Normal Y=0.00",
          "Normal Z=1.00",
        ],
      ],
    ])
    expect(info.general?.map((r) => r.label)).toEqual(["Thickness"])
  })

  it("measures an arc's segment area as AutoCAD's palette does", () => {
    // desktop arc/d08's stretched arc, read on d09.
    const center = p(50, 23.9245)
    const start = Math.atan2(25 - center.y, 60 - center.x)
    const end = Math.atan2(25 - center.y, 40 - center.x)
    const cad = createHarness({
      entities: [arcOf(center, 10.0577, start, end, { id: "A1" })],
    })
    cad.select("A1")
    const area = cad
      .state()
      .properties.info!.groups[0].rows.find((r) => r.id === "area")
    expect(area?.value).toBe("137.30 mm²")
    expect(cad.runtime.setSelectionProperty("startAngle", "0")).toBe(true)
    expect(cad.byId<ArcEntity>("A1").startAngle).toBe(0)
  })

  // Spanish: worded in Autodesk's style from the console's words (tables
  // 20460 `ángulo inicial`, 20981 `ángulo total`, AcDimRes 5345 `longitud de
  // arco`); the desktop's own labels are unverified.
  it("names an arc's rows in Spanish", () => {
    const cad = createHarness({
      locale: es,
      entities: [arcOf(p(0, 0), 10, 0, deg(90), { id: "A1" })],
    })
    cad.select("A1")
    const rows = cad.state().properties.info!.groups[0].rows
    expect(rows.map((row) => row.label)).toEqual([
      "Inicio X",
      "Inicio Y",
      "Inicio Z",
      "Centro X",
      "Centro Y",
      "Centro Z",
      "Fin X",
      "Fin Y",
      "Fin Z",
      "Radio",
      "Ángulo inicial",
      "Ángulo final",
      "Ángulo total",
      "Longitud de arco",
      "Área",
      "Normal X",
      "Normal Y",
      "Normal Z",
    ])
  })

  /** Each row as `label=value`, a `*` where it can be retyped. */
  const rowsOf = (cad: ReturnType<typeof createHarness>) =>
    cad
      .state()
      .properties.info!.groups.map((g) => [
        g.title,
        g.rows.map((r) => `${r.label}=${r.value}${r.edit ? "*" : ""}`),
      ])

  /**
   * desktop ellipse/d08-2's arc: centre 30,25, major axis −10,0, ratio 0.4,
   * from 30° to the end its end grip was dragged to (Fin 31.3839, 28.9615).
   */
  const d08Arc = () =>
    ellipseOf(p(30, 25), p(-10, 0), 0.4, {
      id: "E1",
      startParam: Math.atan2(Math.sin(deg(30)) / 0.4, Math.cos(deg(30))),
      endParam: Math.atan2(-3.9615 / 4, -1.3839 / 10),
    })

  // desktop ellipse/d08-1, d08-2: one Geometry group for an ellipse and an
  // elliptical arc alike, in this order; Start, End, the axis vectors and
  // Area greyed; a whole ellipse's angles 0 and 360.
  it("lists an elliptical arc's geometry in AutoCAD's order", () => {
    const cad = createHarness({ entities: [d08Arc()] })
    cad.select("E1")
    expect(rowsOf(cad)).toEqual([
      [
        "Geometry",
        [
          "Start X=24.31",
          "Start Y=21.71",
          "Start Z=0.00",
          "Center X=30.00*",
          "Center Y=25.00*",
          "Center Z=0.00*",
          "End X=31.38",
          "End Y=28.96",
          "End Z=0.00",
          "Major radius=10.00 mm*",
          "Minor radius=4.00 mm*",
          "Radius ratio=0.40*",
          "Start angle=30°*",
          "End angle=251°*",
          "Major axis vector X=-10.00",
          "Major axis vector Y=0.00",
          "Major axis vector Z=0.00",
          "Minor axis vector X=0.00",
          "Minor axis vector Y=-4.00",
          "Minor axis vector Z=0.00",
          "Area=81.18 mm²",
        ],
      ],
    ])
  })

  // desktop ellipse/d08-1: the ellipse its quadrant grips reshaped.
  it("lists a whole ellipse's rows, its angles 0 and 360", () => {
    const cad = createHarness({
      entities: [
        ellipseOf(p(50, 25), p(14.3133, 0), 8.3149 / 14.3133, { id: "E1" }),
      ],
    })
    cad.select("E1")
    expect(rowsOf(cad)).toEqual([
      [
        "Geometry",
        [
          "Start X=64.31",
          "Start Y=25.00",
          "Start Z=0.00",
          "Center X=50.00*",
          "Center Y=25.00*",
          "Center Z=0.00*",
          "End X=64.31",
          "End Y=25.00",
          "End Z=0.00",
          "Major radius=14.31 mm*",
          "Minor radius=8.31 mm*",
          "Radius ratio=0.58*",
          "Start angle=0°",
          "End angle=360°",
          "Major axis vector X=14.31",
          "Major axis vector Y=0.00",
          "Major axis vector Z=0.00",
          "Minor axis vector X=0.00",
          "Minor axis vector Y=8.31",
          "Minor axis vector Z=0.00",
          "Area=373.89 mm²",
        ],
      ],
    ])
  })

  it("retypes an ellipse's radius ratio and an arc's angles", () => {
    const cad = createHarness({ entities: [d08Arc()] })
    cad.select("E1")
    expect(cad.runtime.setSelectionProperty("radiusRatio", "0.5")).toBe(true)
    const ellipse = cad.byId<EllipseEntity>("E1")
    expect(ellipse.ratio).toBe(0.5)
    expect(ellipse.majorAxis).toBeCloseToPoint(p(-10, 0), 12)
    expect(cad.runtime.setSelectionProperty("startAngle", "90")).toBe(true)
    expect(cad.runtime.setSelectionProperty("endAngle", "180")).toBe(true)
    const arc = cad.byId<EllipseEntity>("E1")
    expect(arc.startParam).toBeCloseTo(Math.PI / 2, 12)
    expect(arc.endParam).toBeCloseTo(Math.PI, 12)
  })

  // Spanish as desktop ellipse/d08 shows it (the vectors' labels cut off
  // there after `Vector de radio may…` and `Vector de eje menor…`).
  it("names an ellipse's rows in Spanish", () => {
    const cad = createHarness({ locale: es, entities: [d08Arc()] })
    cad.select("E1")
    const rows = cad.state().properties.info!.groups[0].rows
    expect(rows.map((row) => row.label)).toEqual([
      "Inicio X",
      "Inicio Y",
      "Inicio Z",
      "Centro X",
      "Centro Y",
      "Centro Z",
      "Fin X",
      "Fin Y",
      "Fin Z",
      "Radio mayor",
      "Radio menor",
      "Relación del radio",
      "Ángulo inicial",
      "Ángulo final",
      "Vector de radio mayor X",
      "Vector de radio mayor Y",
      "Vector de radio mayor Z",
      "Vector de eje menor X",
      "Vector de eje menor Y",
      "Vector de eje menor Z",
      "Área",
    ])
  })
})

describe("a spline's rows in the Properties palette", () => {
  /** Each row as `label=value`, a `*` where it can be retyped. */
  const rowsOf = (cad: ReturnType<typeof createHarness>) =>
    cad
      .state()
      .properties.info!.groups.map((g) => [
        g.title,
        g.rows.map((r) => `${r.label}=${r.value}${r.edit ? "*" : ""}`),
      ])

  // desktop spline/d08-d10's three splines: the fit one with its second fit
  // point dragged by d08-6, the CV one with its second vertex by d09-2.
  const fit = () =>
    createSpline(
      "fit",
      [p(30, 20), p(42.0524, 34.0059), p(50, 15), p(60, 28)],
      {
        id: "S1",
      }
    )
  const cv = () =>
    createSpline("cv", [p(30, 35), p(41.0324, 48.0246), p(50, 35), p(60, 45)], {
      id: "S2",
    })
  const closedFit = () =>
    createSpline("fit", [p(70, 20), p(80, 30), p(75, 40)], {
      id: "S3",
      closed: true,
    })

  // desktop spline/d10-1: Data Points, then Misc; the count, Z, Degree,
  // Periodic and Planar greyed; no tangent given reads 0.
  it("lists an open fit spline's groups and rows in AutoCAD's order", () => {
    const cad = createHarness({ entities: [fit()] })
    cad.select("S1")
    expect(rowsOf(cad)).toEqual([
      [
        "Data Points",
        [
          "Number of fit points=4",
          "Current Fit point=1*",
          "Fit point X=30.00*",
          "Fit point Y=20.00*",
          "Fit point Z=0.00",
          "Knot parameterization=Chord",
          "CV frame=Hide",
        ],
      ],
      [
        "Misc",
        [
          "Method=Fit",
          "Degree=3",
          "Closed=No",
          "Periodic=No",
          "Planar=Yes",
          "Start tangent vector X=0.00",
          "Start tangent vector Y=0.00",
          "Start tangent vector Z=0.00",
          "End tangent vector X=0.00",
          "End tangent vector Y=0.00",
          "End tangent vector Z=0.00",
          "Fit tolerance=0.00",
        ],
      ],
    ])
  })

  // desktop spline/d10-2: a CV spline's points are control points, each of
  // weight −1; no tangents, no tolerance.
  it("lists a CV spline's rows", () => {
    const cad = createHarness({ entities: [cv()] })
    cad.select("S2")
    expect(rowsOf(cad)).toEqual([
      [
        "Data Points",
        [
          "Number of control points=4",
          "Current Control point=1*",
          "Control point X=30.00*",
          "Control point Y=35.00*",
          "Control point Z=0.00",
          "Weight=-1",
          "CV frame=Hide",
        ],
      ],
      [
        "Misc",
        [
          "Method=Control Vertices",
          "Degree=3",
          "Closed=No",
          "Periodic=No",
          "Planar=Yes",
        ],
      ],
    ])
  })

  // desktop spline/d10-3: closed, it counts its first fit point again at the
  // end, drops the tangents and shows its Area (171.7835 there).
  it("lists a closed fit spline's rows, its Area last", () => {
    const cad = createHarness({ entities: [closedFit()] })
    cad.select("S3")
    expect(rowsOf(cad)).toEqual([
      [
        "Data Points",
        [
          "Number of fit points=4",
          "Current Fit point=1*",
          "Fit point X=70.00*",
          "Fit point Y=20.00*",
          "Fit point Z=0.00",
          "Knot parameterization=Chord",
          "CV frame=Hide",
        ],
      ],
      [
        "Misc",
        [
          "Method=Fit",
          "Degree=3",
          "Closed=Yes",
          "Periodic=Yes",
          "Planar=Yes",
          "Fit tolerance=0.00",
          "Area=171.78 mm²",
        ],
      ],
    ])
    cad.runtime.setDocumentPrecision(4)
    expect(rowsOf(cad)[1][1].at(-1)).toBe("Area=171.7835 mm²")
  })

  // The tangents as SPLINE stores them: the start as typed from the first
  // point, the end a unit vector (probes spline/p306, p308).
  it("shows a fit spline's tangents as stored", () => {
    const spline = createSpline("fit", [p(0, 0), p(10, 10), p(20, 0)], {
      id: "S1",
      startTangent: p(3, 4),
      endTangent: p(0.6, -0.8),
    })
    const cad = createHarness({ entities: [spline] })
    cad.select("S1")
    expect(rowsOf(cad)[1][1].slice(5, 11)).toEqual([
      "Start tangent vector X=3.00",
      "Start tangent vector Y=4.00",
      "Start tangent vector Z=0.00",
      "End tangent vector X=0.60",
      "End tangent vector Y=-0.80",
      "End tangent vector Z=0.00",
    ])
  })

  // As the polyline's current vertex: the stepper shows a point, its X and Y
  // move it, one undo step each.
  it("steps through the points and moves the current one", () => {
    const cad = createHarness({ entities: [fit()] })
    cad.select("S1")
    expect(cad.runtime.setSelectionProperty("vertex", "2")).toBe(true)
    expect(rowsOf(cad)[0][1].slice(1, 4)).toEqual([
      "Current Fit point=2*",
      "Fit point X=42.05*",
      "Fit point Y=34.01*",
    ])
    expect(cad.runtime.setSelectionProperty("vertex", "5")).toBe(false)
    expect(cad.runtime.setSelectionProperty("vertex", "0")).toBe(false)
    expect(cad.runtime.setSelectionProperty("vertexX", "45")).toBe(true)
    expect(cad.runtime.setSelectionProperty("vertexY", "30")).toBe(true)
    const moved = cad.byId<SplineEntity>("S1")
    expect(moved.points[1]).toBeCloseToPoint(p(45, 30), 12)
    expect(moved.points[0]).toBeCloseToPoint(p(30, 20), 12)
    cad.undo()
    expect(cad.byId<SplineEntity>("S1").points[1]).toBeCloseToPoint(
      p(45, 34.0059),
      12
    )
  })

  // The fourth fit point of a closed one is its first again (d10-3's count).
  it("moves a closed fit spline's first point from its last", () => {
    const cad = createHarness({ entities: [closedFit()] })
    cad.select("S3")
    expect(cad.runtime.setSelectionProperty("vertex", "4")).toBe(true)
    expect(rowsOf(cad)[0][1][2]).toBe("Fit point X=70.00*")
    expect(cad.runtime.setSelectionProperty("vertexX", "71")).toBe(true)
    const moved = cad.byId<SplineEntity>("S3")
    expect(moved.points).toHaveLength(3)
    expect(moved.points[0]).toBeCloseToPoint(p(71, 20), 12)
  })

  it("reads and moves the current point in the UCS", () => {
    const cad = createHarness({ entities: [cv()] })
    cad.command("UCS").type("10,5").enter().enter()
    cad.select("S2")
    expect(rowsOf(cad)[0][1].slice(2, 4)).toEqual([
      "Control point X=20.00*",
      "Control point Y=30.00*",
    ])
    expect(cad.runtime.setSelectionProperty("vertexX", "0")).toBe(true)
    expect(cad.byId<SplineEntity>("S2").points[0]).toBeCloseToPoint(
      p(10, 35),
      12
    )
  })

  // Spanish as desktop spline/d10 shows it.
  it.each([
    [
      fit,
      "S1",
      [
        "Puntos auxiliares",
        [
          "Número de puntos de ajuste",
          "Punto de ajuste actual",
          "Punto de ajuste X",
          "Punto de ajuste Y",
          "Punto de ajuste Z",
          "Parametrización de nudos",
          "Marco de vértices de control",
        ],
      ],
      [
        "Varios",
        [
          "Método",
          "Grado",
          "Cerrado",
          "Periódica",
          "Plana",
          "Inicio vector de tangente X",
          "Inicio vector de tangente Y",
          "Inicio vector de tangente Z",
          "Vector de tangente final X",
          "Vector de tangente final Y",
          "Vector de tangente final Z",
          "Ajustar tolerancia",
        ],
      ],
      ["Ajustar", "Cuerda", "Ocultar", "No", "Sí"],
    ],
    [
      cv,
      "S2",
      [
        "Puntos auxiliares",
        [
          "Número de puntos de apoyo",
          "Punto de apoyo actual",
          "Punto de apoyo X",
          "Punto de apoyo Y",
          "Punto de apoyo Z",
          "Peso",
          "Marco de vértices de control",
        ],
      ],
      ["Varios", ["Método", "Grado", "Cerrado", "Periódica", "Plana"]],
      ["Vértices de control", "Ocultar"],
    ],
  ] as const)(
    "names a spline's rows in Spanish (%#)",
    (make, id, data, misc, values) => {
      const cad = createHarness({ locale: es, entities: [make()] })
      cad.select(id)
      const groups = cad.state().properties.info!.groups
      expect(
        groups.map((group) => [group.title, group.rows.map((row) => row.label)])
      ).toEqual([data, misc])
      const shown = groups.flatMap((group) =>
        group.rows.map((row) => row.value)
      )
      for (const value of values) expect(shown).toContain(value)
    }
  )
})

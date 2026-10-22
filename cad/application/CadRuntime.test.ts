import { afterEach, describe, expect, it, vi } from "vitest"
import type { CircleEntity, Entity, LineEntity } from "../domain/entities"
import type { PropertyRow } from "./EngineState"
import {
  entityElevation,
  lineEndZ,
  lineStartZ,
  withDeltaZ,
  withElevation,
  withThickness,
} from "../domain/entities"
import { LengthUnit } from "../domain/units"
import { DEFAULT_LAYER_ID } from "../domain/layers"
import {
  CadHarness,
  MemoryFileTransport,
  MemoryStore,
  createHarness,
} from "../../test/harness"
import {
  circleOf,
  hatchOf,
  lineOf,
  loopOf,
  p,
  polylineOf,
  snapshotOf,
  textOf,
} from "../../test/builders"
import { serializeDrawing } from "../serialization/drawingFile"
import { es } from "../locales/es"

/**
 * The runtime is the application's imperative shell: it owns the tools, the
 * command table, the undo history, the layer API and the persistence hooks.
 * These tests exercise it directly, without any tool-specific behaviour, so a
 * failure points at the shell rather than at a command.
 */

describe("command line", () => {
  it("starts a command by its canonical name", () => {
    const cad = createHarness()

    cad.command("LINE")

    expect(cad.activeToolId()).toBe("line")
  })

  it("starts a command by any of its aliases, case-insensitively", () => {
    const cad = createHarness()

    cad.command("l")
    expect(cad.activeToolId()).toBe("line")

    cad.command("co")
    expect(cad.activeToolId()).toBe("copy")
  })

  it("distinguishes aliases that share a prefix", () => {
    // The whole reason the command line replaced single-key shortcuts: A must
    // reach ARC while AR reaches ARRAY (acad.pgp's `AR,*ARRAY`).
    const cad = createHarness()

    cad.command("A")
    expect(cad.activeToolId()).toBe("arc")

    cad.command("AR")
    expect(cad.activeToolId()).toBe("arraycommand")
  })

  it("reports an unknown command without changing the tool", () => {
    const cad = createHarness()

    const handled = cad.runtime.runCommand("NOTACOMMAND")

    expect(handled).toBe(false)
    expect(cad.activeToolId()).toBe("select")
    const errors = cad
      .state()
      .commandLine.lines.filter((line) => line.kind === "error")
    expect(errors.at(-1)?.text).toMatch(/NOTACOMMAND/)
  })

  it("collects typed characters into the prompt buffer", () => {
    const cad = createHarness()

    expect(cad.press("l")).toBe(true)
    expect(cad.press("i")).toBe(true)

    expect(cad.state().commandLine.buffer).toBe("li")
  })

  it("suggests completions for a partial name", () => {
    const cad = createHarness()

    cad.press("l")

    const suggestions = cad.state().commandLine.suggestions.map((s) => s.name)
    expect(suggestions).toContain("LINE")
  })

  it("completes the buffer with Tab", () => {
    const cad = createHarness()

    cad.press("l")
    cad.runtime.completeCommandLine()

    expect(cad.state().commandLine.buffer).toBe("LINE")
  })

  it("runs the buffer on Enter and empties it", () => {
    const cad = createHarness()

    cad.press("l")
    cad.press("Enter")

    expect(cad.activeToolId()).toBe("line")
    expect(cad.state().commandLine.buffer).toBe("")
  })

  it("repeats the last command on an empty Enter", () => {
    const cad = createHarness()

    cad.command("CIRCLE")
    cad.escape()
    expect(cad.activeToolId()).toBe("select")

    cad.press("Enter")
    expect(cad.activeToolId()).toBe("circle")
  })

  it("repeats a command started from the rail", () => {
    // probes circle/p191, p192: Enter after the ribbon's `_circle _2p` starts
    // CIRCLE at its centre prompt; LINE's button, `^C^C_line`, likewise.
    const cad = createHarness()
    cad.tool("circle2p").click(p(0, 0)).click(p(10, 0))
    cad.press("Enter")
    expect(cad.activeToolId()).toBe("circle")
    expect(cad.commandLog().at(-1)).toBe("CIRCLE")
    expect(cad.state().commandLine.prompt).toBe(
      "CIRCLE Specify center point for circle or [3P/2P/Ttr (tan tan radius)]:"
    )
    cad.escape()

    cad.tool("line").click(p(0, 0)).click(p(10, 0)).escape()
    cad.press("Enter")
    expect(cad.activeToolId()).toBe("line")
    expect(cad.commandLog().at(-1)).toBe("LINE")
  })

  it("walks the history with the arrow keys", () => {
    const cad = createHarness()

    cad.command("LINE")
    cad.command("CIRCLE")
    cad.escape()

    cad.runtime.recallCommand(-1)
    expect(cad.state().commandLine.buffer).toBe("CIRCLE")
    cad.runtime.recallCommand(-1)
    expect(cad.state().commandLine.buffer).toBe("LINE")
    cad.runtime.recallCommand(1)
    expect(cad.state().commandLine.buffer).toBe("CIRCLE")
  })

  it("hides on Ctrl+9 but reappears the moment something is typed", () => {
    const cad = createHarness()

    cad.press("9", { ctrlKey: true })
    expect(cad.state().commandLine.visible).toBe(false)

    // Hiding is cosmetic: a keystroke must never vanish into nowhere.
    cad.press("c")
    expect(cad.state().commandLine.buffer).toBe("c")

    cad.press("9", { ctrlKey: true })
    expect(cad.state().commandLine.visible).toBe(true)
  })

  it("shows the running command and its keywords in the prompt", () => {
    const cad = createHarness()

    expect(cad.state().commandLine.prompt).toBe("Command:")

    cad.command("ELLIPSE")
    expect(cad.state().commandLine.prompt).toBe(
      "ELLIPSE Specify axis endpoint of ellipse or [Arc/Center]:"
    )
  })
})

describe("undo and redo", () => {
  // Two commands, so two undo steps: one U undoes a whole command.
  function drawTwoLines(cad: CadHarness) {
    cad.command("LINE").click(p(0, 0)).click(p(100, 0)).escape()
    cad.command("LINE").click(p(100, 0)).click(p(100, 100)).escape()
  }

  it("is driven by the keyboard as well as the API", () => {
    const cad = createHarness()
    drawTwoLines(cad)

    expect(cad.press("z", { ctrlKey: true })).toBe(true)
    expect(cad.entityCount).toBe(1)

    expect(cad.press("y", { ctrlKey: true })).toBe(true)
    expect(cad.entityCount).toBe(2)

    cad.press("z", { ctrlKey: true })
    cad.press("Z", { ctrlKey: true, shiftKey: true })
    expect(cad.entityCount).toBe(2)
  })

  it("reports what is available", () => {
    const cad = createHarness()
    expect(cad.state().canUndo).toBe(false)
    expect(cad.state().canRedo).toBe(false)

    drawTwoLines(cad)
    expect(cad.state().canUndo).toBe(true)

    cad.undo()
    expect(cad.state().canRedo).toBe(true)
  })

  it("drops the redo stack once a new action happens", () => {
    const cad = createHarness()
    drawTwoLines(cad)

    cad.undo()
    expect(cad.state().canRedo).toBe(true)

    cad.command("CIRCLE").click(p(300, 300)).click(p(350, 300))
    expect(cad.state().canRedo).toBe(false)
  })

  it("starts a blank drawing with NEW, and U brings the old one back", () => {
    const cad = createHarness()
    drawTwoLines(cad)
    const walls = cad.runtime.createLayer("Walls")
    cad.runtime.setDocumentPrecision(4)

    cad.command("NEW")
    expect(cad.entityCount).toBe(0)
    expect(cad.state().layers.map((layer) => layer.name)).toEqual(["0"])
    expect(cad.state().currentLayerId).toBe(DEFAULT_LAYER_ID)
    expect(cad.state().documentPrecision).not.toBe(4)

    cad.undo()
    expect(cad.entityCount).toBe(2)
    expect(cad.state().currentLayerId).toBe(walls)
    expect(cad.state().documentPrecision).toBe(4)
  })

  it("ends the running command before QNEW starts the drawing", () => {
    const cad = createHarness()
    cad.command("LINE").click(p(0, 0)).click(p(100, 0))

    cad.command("QNEW")
    expect(cad.state().activeToolId).toBe("select")
    expect(cad.entityCount).toBe(0)
  })
})

describe("layers", () => {
  it("creates a layer, makes it current and draws onto it", () => {
    const cad = createHarness()

    const walls = cad.runtime.createLayer("Walls")

    expect(cad.state().currentLayerId).toBe(walls)
    cad.command("LINE").click(p(0, 0)).click(p(100, 0)).escape()
    expect(cad.only<LineEntity>("line").layerId).toBe(walls)
  })

  it("auto-names layers that are not given one", () => {
    const cad = createHarness()

    cad.runtime.createLayer()
    cad.runtime.createLayer()

    const names = cad.state().layers.map((layer) => layer.name)
    expect(names).toEqual(["0", "Layer1", "Layer2"])
  })

  it("counts the entities on each layer", () => {
    const cad = createHarness()
    const walls = cad.runtime.createLayer("Walls")
    cad.runtime.document.load([
      lineOf(p(0, 0), p(10, 0), { id: "L1", layerId: walls }),
      lineOf(p(0, 10), p(10, 10), { id: "L2", layerId: walls }),
      circleOf(p(0, 0), 5, { id: "C1" }),
    ])

    const counts = Object.fromEntries(
      cad.state().layers.map((layer) => [layer.name, layer.entityCount])
    )
    expect(counts).toEqual({ "0": 1, Walls: 2 })
  })

  it("refuses to delete the base, current or in-use layers", () => {
    const cad = createHarness()
    const used = cad.runtime.createLayer("Used")
    cad.runtime.document.load([
      lineOf(p(0, 0), p(10, 0), { id: "L1", layerId: used }),
    ])
    const spare = cad.runtime.createLayer("Spare")

    expect(cad.runtime.removeLayer(DEFAULT_LAYER_ID)).toBe(false)
    expect(cad.runtime.removeLayer(spare)).toBe(false) // it is current
    expect(cad.runtime.removeLayer(used)).toBe(false) // it holds geometry

    cad.runtime.setCurrentLayer(DEFAULT_LAYER_ID)
    expect(cad.runtime.removeLayer(spare)).toBe(true)
  })

  it("moves the selection to another layer, undoably", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
    })
    const walls = cad.runtime.createLayer("Walls")

    cad.select("L1")
    cad.runtime.setSelectionLayer(walls)
    expect(cad.byId<LineEntity>("L1").layerId).toBe(walls)

    cad.undo()
    expect(cad.byId<LineEntity>("L1").layerId).toBe(DEFAULT_LAYER_ID)
  })

  it("moves several selected objects in one undo step from the layer drop-down", () => {
    const cad = createHarness({
      entities: [
        lineOf(p(0, 0), p(100, 0), { id: "L1" }),
        circleOf(p(0, 0), 5, { id: "C1" }),
      ],
    })
    const walls = cad.runtime.createLayer("Walls")
    cad.runtime.setCurrentLayer(DEFAULT_LAYER_ID)

    cad.select("L1", "C1")
    cad.runtime.applyLayerControl(walls)
    expect(cad.byId<LineEntity>("L1").layerId).toBe(walls)
    expect(cad.byId<CircleEntity>("C1").layerId).toBe(walls)
    expect(cad.state().currentLayerId).toBe(DEFAULT_LAYER_ID)
    expect(cad.selectedIds()).toEqual(["L1", "C1"])

    cad.undo()
    expect(cad.byId<LineEntity>("L1").layerId).toBe(DEFAULT_LAYER_ID)
    expect(cad.byId<CircleEntity>("C1").layerId).toBe(DEFAULT_LAYER_ID)
  })

  it("makes the layer chosen in the drop-down current with nothing selected", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
    })
    const walls = cad.runtime.createLayer("Walls")
    cad.runtime.setCurrentLayer(DEFAULT_LAYER_ID)

    cad.runtime.applyLayerControl(walls)
    expect(cad.state().currentLayerId).toBe(walls)
    expect(cad.byId<LineEntity>("L1").layerId).toBe(DEFAULT_LAYER_ID)
    expect(cad.state().canUndo).toBe(false)
  })

  it("deselects objects whose layer is turned off or locked", () => {
    const cad = createHarness()
    const walls = cad.runtime.createLayer("Walls")
    cad.runtime.document.load([
      lineOf(p(0, 0), p(100, 0), { id: "L1", layerId: walls }),
    ])
    cad.select("L1")

    cad.runtime.updateLayer(walls, { visible: false })

    expect(cad.selectedIds()).toEqual([])
  })

  it("hides an invisible layer's geometry from the scene", () => {
    const cad = createHarness()
    const walls = cad.runtime.createLayer("Walls")
    cad.runtime.document.load([
      lineOf(p(0, 0), p(100, 0), { id: "L1", layerId: walls }),
    ])

    const before = cad.scene().primitives.length
    cad.runtime.updateLayer(walls, { visible: false })
    expect(cad.scene().primitives.length).toBeLessThan(before)
  })
})

describe("selection properties", () => {
  it.each([
    ["colour", (cad: CadHarness) => cad.runtime.setSelectionColor("#ff0000")],
    [
      "linetype",
      (cad: CadHarness) => cad.runtime.setSelectionLinetype("Dashed"),
    ],
    [
      "lineweight",
      (cad: CadHarness) => cad.runtime.setSelectionLineweight(0.5),
    ],
  ])("changes the %s of several objects in one undo step", (_, change) => {
    const cad = createHarness({
      entities: [
        lineOf(p(0, 0), p(100, 0), { id: "L1" }),
        circleOf(p(0, 0), 5, { id: "C1" }),
      ],
    })
    cad.select("L1", "C1")

    change(cad)
    expect(cad.byId("L1")).not.toEqual(lineOf(p(0, 0), p(100, 0), { id: "L1" }))

    cad.undo()
    expect(cad.byId("L1")).toEqual(lineOf(p(0, 0), p(100, 0), { id: "L1" }))
    expect(cad.byId("C1")).toEqual(circleOf(p(0, 0), 5, { id: "C1" }))
    expect(cad.state().canUndo).toBe(false)
  })
})

// desktop d20: hovering a line at `Comando:` shows `Línea`, Color PorCapa,
// Capa 0, Tipo de línea PorCapa (ROLLOVERTIPS 1).
describe("rollover tooltip", () => {
  it("describes the object under the cursor at Command:", () => {
    const cad = createHarness({
      locale: es,
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
    })

    cad.moveTo(p(40, 1))
    const rollover = cad.state().rollover
    expect(rollover).toMatchObject({
      id: "L1",
      title: "Línea",
      color: "PorCapa",
      layer: "0",
      linetype: "PorCapa",
    })

    cad.moveTo(p(60, 1))
    expect(cad.state().rollover?.at).toEqual(rollover?.at)
    cad.moveTo(p(40, 200))
    expect(cad.state().rollover).toBeNull()
  })

  it("names an object's own colour and linetype, and none inside a command", () => {
    const cad = createHarness({
      entities: [
        {
          ...lineOf(p(0, 0), p(100, 0), { id: "L1" }),
          color: "#ff0000",
          linetype: "Dashed",
        },
      ],
    })

    cad.moveTo(p(40, 1))
    expect(cad.state().rollover).toMatchObject({
      color: "Red",
      swatch: "#ff0000",
      linetype: "Dashed",
    })
    cad.command("LINE").moveTo(p(50, 1))
    expect(cad.state().rollover).toBeNull()
  })
})

describe("document settings", () => {
  it("changes unit and precision", () => {
    const cad = createHarness()

    cad.runtime.setDocumentUnit(LengthUnit.Meter)
    cad.runtime.setDocumentPrecision(4)

    expect(cad.state().documentUnit).toBe(LengthUnit.Meter)
    expect(cad.state().documentPrecision).toBe(4)
  })

  it("clamps precision to a sane range", () => {
    const cad = createHarness()

    cad.runtime.setDocumentPrecision(-3)
    expect(cad.state().documentPrecision).toBe(0)

    cad.runtime.setDocumentPrecision(99)
    expect(cad.state().documentPrecision).toBe(8)
  })

  it("clamps the linetype scale away from zero", () => {
    const cad = createHarness()

    cad.runtime.setLtScale(0)
    expect(cad.state().ltScale).toBeGreaterThan(0)
  })

  it("toggles lineweight display", () => {
    const cad = createHarness()
    const before = cad.state().lwDisplay

    cad.runtime.toggleLineweightDisplay()

    expect(cad.state().lwDisplay).toBe(!before)
  })
})

describe("property editing", () => {
  it("retypes a geometry value of the selected object as one undo step", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
    })
    cad.select("L1")

    expect(cad.runtime.setSelectionProperty("endX", "250")).toBe(true)
    expect(cad.byId<LineEntity>("L1").end).toBeCloseToPoint(p(250, 0))

    cad.undo()
    expect(cad.byId<LineEntity>("L1").end).toBeCloseToPoint(p(100, 0))
  })

  it("only edits when exactly one object is selected", () => {
    const cad = createHarness({
      entities: [
        lineOf(p(0, 0), p(100, 0), { id: "L1" }),
        lineOf(p(0, 50), p(100, 50), { id: "L2" }),
      ],
    })

    expect(cad.runtime.setSelectionProperty("endX", "250")).toBe(false)

    cad.select("L1", "L2")
    expect(cad.runtime.setSelectionProperty("endX", "250")).toBe(false)
    expect(cad.byId<LineEntity>("L1").end).toBeCloseToPoint(p(100, 0))
  })

  it("rejects text that is not a number or would degenerate the object", () => {
    const cad = createHarness({
      entities: [circleOf(p(0, 0), 10, { id: "C1" })],
    })
    cad.select("C1")

    expect(cad.runtime.setSelectionProperty("radius", "")).toBe(false)
    expect(cad.runtime.setSelectionProperty("radius", "abc")).toBe(false)
    expect(cad.runtime.setSelectionProperty("radius", "0")).toBe(false)
    expect(cad.byId<CircleEntity>("C1").radius).toBe(10)
  })

  // desktop line/d16: one Geometría group, Inicio X Y Z, Fin X Y Z,
  // Incremento X Y Z, Longitud, Ángulo, the last five greyed (read-only).
  it("lists a line's geometry in AutoCAD's order, Delta, Length and Angle read-only", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(30, 40), { id: "L1" })],
    })
    cad.select("L1")

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
          "Start X=0.00*",
          "Start Y=0.00*",
          "Start Z=0.00*",
          "End X=30.00*",
          "End Y=40.00*",
          "End Z=0.00*",
          "Delta X=30.00 mm",
          "Delta Y=40.00 mm",
          "Delta Z=0.00 mm",
          "Length=50.00 mm",
          "Angle=53°",
        ],
      ],
    ])
  })

  it("offers the editable rows in the selection info", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
    })
    cad.select("L1")

    const rows =
      cad.state().properties.info?.groups.flatMap((g) => g.rows) ?? []
    const editable = rows.filter((row) => row.edit)
    expect(editable.map((row) => row.edit?.property)).toEqual([
      "startX",
      "startY",
      "startZ",
      "endX",
      "endY",
      "endZ",
    ])
    // The box is seeded with a bare number, the unit is rendered beside it.
    expect(editable[3].edit?.text).toBe("100.00")
    expect(editable[3].edit?.unit).toBe("")
    expect(cad.state().properties.info?.general.map((row) => row.id)).toEqual([
      "thickness",
    ])
  })
})

describe("the palette's Z", () => {
  function rows(cad: CadHarness): Map<string, PropertyRow> {
    const info = cad.state().properties.info!
    return new Map(
      [...info.general, ...info.groups.flatMap((group) => group.rows)].map(
        (row) => [row.id, row]
      )
    )
  }

  /** Puts the UCS's XY plane at Z = 5. */
  function raiseUcs(cad: CadHarness): void {
    cad.command("UCS").type("0,0,5").enter().enter()
  }

  it("reads a line's ends in the UCS and its rise, and retypes each end alone", () => {
    const sloped = withDeltaZ(
      withElevation(lineOf(p(0, 0), p(30, 40), { id: "L" }), 2),
      10
    )
    const cad = createHarness({ entities: [sloped] })
    raiseUcs(cad)
    cad.select("L")

    expect(rows(cad).get("startZ")?.value).toBe("-3.00")
    expect(rows(cad).get("endZ")?.value).toBe("7.00")
    expect(rows(cad).get("deltaZ")).toMatchObject({ value: "10.00 mm" })
    expect(rows(cad).get("deltaZ")?.edit).toBeUndefined()

    expect(cad.runtime.setSelectionProperty("endZ", "0")).toBe(true)
    const line = cad.byId<LineEntity>("L")
    expect(lineStartZ(line)).toBe(2)
    expect(lineEndZ(line)).toBe(5)
    expect(line.end).toBeCloseToPoint(p(30, 40))

    cad.runtime.setSelectionProperty("startZ", "0")
    expect(cad.byId<LineEntity>("L")).toMatchObject({ elevation: 5 })
    expect(cad.byId<LineEntity>("L").deltaZ).toBeUndefined()

    cad.undo()
    expect(lineStartZ(cad.byId<LineEntity>("L"))).toBe(2)
    expect(lineEndZ(cad.byId<LineEntity>("L"))).toBe(5)
  })

  it("reads a sloped line's length in 3D", () => {
    const sloped = withDeltaZ(lineOf(p(0, 0), p(30, 40), { id: "L" }), 120)
    const cad = createHarness({ entities: [sloped] })
    cad.select("L")

    expect(rows(cad).get("length")?.value).toBe("130.00 mm")
  })

  it("brings a rising line's ends together in plan: it stands vertical", () => {
    const rising = withDeltaZ(lineOf(p(0, 0), p(10, 0), { id: "L" }), 5)
    const cad = createHarness({ entities: [rising] })
    cad.select("L")

    expect(cad.runtime.setSelectionProperty("endX", "0")).toBe(true)
    const line = cad.byId<LineEntity>("L")
    expect(line.end).toBeCloseToPoint(p(0, 0))
    expect([lineStartZ(line), lineEndZ(line)]).toEqual([0, 5])
  })

  it("gives each flat type its plane row, read and written in the UCS", () => {
    const entities: Entity[] = [
      withElevation(circleOf(p(0, 0), 10, { id: "C" }), 8),
      withElevation(textOf(p(0, 0), "A", { id: "T" }), 8),
      withElevation(polylineOf([p(0, 0), p(10, 0)], { id: "P" }), 8),
      withElevation(hatchOf([loopOf(p(0, 0), p(10, 10))], { id: "H" }), 8),
    ]
    const cad = createHarness({ entities })
    raiseUcs(cad)

    for (const [id, property, row] of [
      ["C", "centerZ", "centerZ"],
      ["T", "positionZ", "z"],
      ["P", "elevation", "elevation"],
      ["H", "elevation", "elevation"],
    ] as const) {
      cad.select(id)
      expect(rows(cad).get(row)).toMatchObject({
        value: "3.00",
        edit: { property },
      })
      cad.runtime.setSelectionProperty(property, "-1")
      expect(entityElevation(cad.byId(id))).toBe(4)
    }
  })

  it("puts Thickness under General only for the types that have one", () => {
    const cad = createHarness({
      entities: [
        withThickness(circleOf(p(0, 0), 10, { id: "C" }), 3),
        textOf(p(0, 0), "A", { id: "T" }),
      ],
    })
    raiseUcs(cad)
    cad.select("C")

    expect(cad.state().properties.info?.general).toEqual([
      expect.objectContaining({
        id: "thickness",
        label: "Thickness",
        value: "3.00 mm",
      }),
    ])
    // A thickness is a length along Z: the UCS's origin does not move it.
    cad.runtime.setSelectionProperty("thickness", "-2")
    expect(cad.byId<CircleEntity>("C").thickness).toBe(-2)

    cad.select("T")
    expect(cad.state().properties.info?.general).toEqual([])
    expect(cad.runtime.setSelectionProperty("thickness", "4")).toBe(false)
  })
})

describe("the status bar", () => {
  it("reads the cursor's X, Y and Z in the UCS, on the elevation plane", () => {
    const cad = createHarness()
    cad.command("UCS").type("10,20,3").enter().enter()
    cad.command("ELEV").type("5").enter().type("0").enter()

    cad.moveTo(p(15, 25))

    const cursor = cad.state().cursorUcs!
    expect(cursor).toBeCloseToPoint(p(5, 5))
    expect(cursor.z).toBe(5)
  })
})

describe("drafting aids", () => {
  it("toggles Ortho and Polar exclusively", () => {
    const cad = createHarness()

    cad.press("F8")
    expect(cad.state().orthoActive).toBe(true)

    cad.press("F10")
    expect(cad.state().polarActive).toBe(true)
    // Both at once would fight over the same direction.
    expect(cad.state().orthoActive).toBe(false)

    // Desktop pass line/d10: F8 turning Ortho on turns Polar off.
    cad.press("F8")
    expect(cad.state().orthoActive).toBe(true)
    expect(cad.state().polarActive).toBe(false)
  })

  // Desktop passes line/d27 (en) and d10 (es); tables 33112 and 33113 for F3.
  it("writes each aid's function key at the Command prompt", () => {
    const cad = createHarness()
    for (const key of ["F3", "F8", "F9", "F10", "F11"]) cad.press(key)
    for (const key of ["F3", "F8", "F9", "F10", "F11", "F12"]) cad.press(key)
    expect(cad.state().commandLine.lines).toEqual(
      [
        " <Osnap on>",
        " <Ortho on>",
        " <Snap on>",
        // Polar turns Ortho off, and F8 then turns Polar off.
        " <Polar on>",
        " <Object Snap Tracking off>",
        " <Osnap off>",
        " <Ortho on>",
        " <Snap off>",
        " <Polar on>",
        " <Object Snap Tracking on>",
      ].map((text) => ({ kind: "command", text }))
    )
    // The host heads a command line with `Command:`, so it reads as
    // AutoCAD's `Command:  <Ortho on>`.
    expect(cad.state().commandLine.idlePrompt).toBe("Command:")
  })

  it("writes them in Spanish AutoCAD's words", () => {
    const cad = createHarness({ locale: es })
    for (const key of ["F3", "F8", "F9", "F10", "F11", "F3"]) cad.press(key)
    expect(cad.commandLog()).toEqual([
      " <Refent activado>",
      " <Orto activado>",
      " <Forzcursor activado>",
      " <Polar activado>",
      " <Rastreo de referencia a objetos desactivado>",
      " <Refent desactivado>",
    ])
  })

  it("writes a key's echo after the prompt a command asks", () => {
    const cad = createHarness()
    cad.command("LINE").click(p(0, 0))
    cad.press("F8")
    expect(cad.commandLog().at(-1)).toBe(
      "Specify next point or [Undo]:  <Ortho on>"
    )
    expect(cad.state().commandLine.prompt).toBe(
      "LINE Specify next point or [Undo]:"
    )
  })

  it("toggles the grid and snap mode from the function keys", () => {
    const cad = createHarness()

    cad.press("F7")
    expect(cad.state().gridVisible).toBe(false)

    cad.press("F9")
    expect(cad.state().snapModeActive).toBe(true)

    cad.press("F3")
    expect(cad.state().snapActive).toBe(true)
  })

  // Desktop pass line/d23: SNAPUNIT 10, F9, and LINE's picks.
  it("rounds picks to the lattice once F9 turns snap mode on", () => {
    const cad = createHarness()
    cad.press("F9")
    cad.command("LINE").click(p(13, 7)).click(p(27.5, -14)).escape()
    const line = cad.only<LineEntity>("line")
    expect(line.start).toBeCloseToPoint(p(10, 10))
    expect(line.end).toBeCloseToPoint(p(30, -10))
  })

  it("forces picks onto the snap increments when snap mode is on", () => {
    const cad = createHarness()
    cad.runtime.setSnapSpacing(25)
    cad.runtime.toggleSnapMode()

    cad.command("LINE").click(p(11, 9)).click(p(66, 41)).escape()

    const line = cad.only<LineEntity>("line")
    expect(line.start).toBeCloseToPoint(p(0, 0))
    expect(line.end).toBeCloseToPoint(p(75, 50))
  })
})

describe("viewport", () => {
  it("maps world to screen with the origin centred at unit scale", () => {
    const cad = createHarness({ width: 1000, height: 800 })

    expect(cad.toScreen(p(0, 0))).toBeCloseToPoint(p(500, 400))
    // Screen Y grows downward, world Y upward.
    expect(cad.toScreen(p(100, 50))).toBeCloseToPoint(p(600, 350))
  })

  it("round-trips screen and world coordinates", () => {
    const cad = createHarness()
    cad.wheel(p(0, 0), -100)

    expect(cad.toWorld(cad.toScreen(p(37, -12)))).toBeCloseToPoint(p(37, -12))
  })

  it("zooms towards the cursor, keeping that world point still", () => {
    const cad = createHarness()
    const anchorScreen = cad.toScreen(p(100, 100))

    cad.wheel(p(100, 100), -100)

    expect(cad.state().scale).toBeGreaterThan(1)
    expect(cad.toScreen(p(100, 100))).toBeCloseToPoint(anchorScreen, 4)
  })

  it("frames the whole drawing on zoom-to-fit", () => {
    const cad = createHarness({
      entities: [lineOf(p(-500, -500), p(500, 500), { id: "L1" })],
    })

    cad.runtime.zoomToFit()

    const min = cad.toScreen(p(-500, -500))
    const max = cad.toScreen(p(500, 500))
    for (const corner of [min, max]) {
      expect(corner.x).toBeGreaterThanOrEqual(0)
      expect(corner.x).toBeLessThanOrEqual(1000)
      expect(corner.y).toBeGreaterThanOrEqual(0)
      expect(corner.y).toBeLessThanOrEqual(800)
    }
  })

  it("frames a given rectangle, which ZOOM Previous steps back from", () => {
    const cad = createHarness({ width: 1000, height: 800 })

    cad.runtime.zoomToBounds({ min: p(0, 0), max: p(100, 50) }, 100)

    // The rectangle's width binds: (1000 − 2 × 100) / 100 = 8 px per unit.
    expect(cad.state().scale).toBeCloseTo(8)
    expect(cad.toScreen(p(50, 25))).toBeCloseToPoint(p(500, 400))
    expect(cad.runtime.zoomPrevious()).toBe(true)
    expect(cad.state().scale).toBe(1)
  })

  it("returns to the default view on reset", () => {
    const cad = createHarness()

    cad.wheel(p(200, 200), -100)
    cad.runtime.resetView()

    expect(cad.state().scale).toBe(1)
    expect(cad.toScreen(p(0, 0))).toBeCloseToPoint(p(500, 400))
  })

  it("pans with the wheel button instead of drawing", () => {
    const cad = createHarness()
    const before = cad.toScreen(p(0, 0))

    cad.drag(p(0, 0), p(60, 0), { button: 1 })

    expect(cad.toScreen(p(0, 0)).x).toBeCloseTo(before.x + 60)
    expect(cad.entityCount).toBe(0)
    expect(cad.runtime.zoomPrevious()).toBe(true)
    expect(cad.toScreen(p(0, 0))).toBeCloseToPoint(before)
  })

  describe("a double-click of the wheel button", () => {
    afterEach(() => {
      vi.useRealTimers()
    })

    function framed() {
      const cad = createHarness({
        entities: [lineOf(p(-2000, 0), p(2000, 0))],
      })
      vi.useFakeTimers({ toFake: ["Date"] })
      return cad
    }

    it("is ZOOM Extents, one ZOOM Previous step, in a command too", () => {
      const cad = framed()
      cad.command("LINE").click(p(0, 0))

      cad.click(p(100, 100), { button: 1 })
      vi.advanceTimersByTime(200)
      cad.click(p(100, 100), { button: 1 })

      expect(cad.toScreen(p(-2000, 0)).x).toBeCloseTo(40)
      expect(cad.toScreen(p(2000, 0)).x).toBeCloseTo(960)
      expect(cad.activeToolId()).toBe("line")
      expect(cad.runtime.zoomPrevious()).toBe(true)
      expect(cad.state().scale).toBe(1)
      expect(cad.runtime.zoomPrevious()).toBe(false)
    })

    it("is two clicks when they are too far apart in time", () => {
      const cad = framed()

      cad.click(p(100, 100), { button: 1 })
      vi.advanceTimersByTime(600)
      cad.click(p(100, 100), { button: 1 })

      expect(cad.state().scale).toBe(1)
      expect(cad.runtime.zoomPrevious()).toBe(false)
    })

    it("is not a pan's release", () => {
      const cad = framed()

      cad.click(p(100, 100), { button: 1 })
      cad.drag(p(100, 100), p(160, 100), { button: 1 })

      expect(cad.state().scale).toBe(1)
    })
  })
})

describe("persistence", () => {
  it("round-trips a drawing through save and open", () => {
    const cad = createHarness({
      entities: [
        lineOf(p(0, 0), p(100, 0), { id: "L1" }),
        circleOf(p(50, 50), 25, { id: "C1" }),
      ],
    })
    const saved = cad.runtime.serializeDrawing()

    const reopened = createHarness()
    reopened.runtime.loadDrawing(saved)

    expect(reopened.entityCount).toBe(2)
    expect(reopened.byId<LineEntity>("L1").end).toBeCloseToPoint(p(100, 0))
  })

  it("rejects a corrupt file without destroying the open drawing", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
    })

    expect(() => cad.runtime.loadDrawing("not a drawing")).toThrow()
    expect(cad.entityCount).toBe(1)
  })

  it("starts a fresh undo baseline after opening a file", () => {
    // Undoing past a file open would resurrect the previous drawing.
    const cad = createHarness()
    cad.command("LINE").click(p(0, 0)).click(p(100, 0)).escape()

    cad.runtime.loadDrawing(serializeDrawing(snapshotOf([])))

    expect(cad.state().canUndo).toBe(false)
  })

  it("suggests a file name", () => {
    const cad = createHarness()

    expect(cad.runtime.suggestedFileName()).toMatch(/\.ecad\.json$/)
  })

  it("restores the previous session from the store", () => {
    const store = new MemoryStore(
      serializeDrawing(snapshotOf([lineOf(p(0, 0), p(100, 0), { id: "L1" })]))
    )

    const cad = createHarness({ store })

    expect(cad.entityCount).toBe(1)
    expect(cad.state().saveState).toBe("saved")
  })

  it("ignores an unreadable stored drawing rather than failing to start", () => {
    const cad = createHarness({ store: new MemoryStore("{{{ corrupt") })

    expect(cad.entityCount).toBe(0)
  })

  it("does not write anything until the drawing changes", () => {
    const store = new MemoryStore()

    createHarness({ store })

    expect(store.writes).toHaveLength(0)
  })
})

describe("file save and open", () => {
  it("saves through the file transport, named and serialised", () => {
    const files = new MemoryFileTransport()
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
      files,
    })

    cad.command("QSAVE")

    expect(files.saved).toHaveLength(1)
    expect(files.saved[0].fileName).toMatch(/\.ecad\.json$/)
    expect(files.saved[0].text).toBe(cad.runtime.serializeDrawing())
  })

  it("saves on Ctrl+S and opens on Ctrl+O", () => {
    const files = new MemoryFileTransport()
    const cad = createHarness({ files })

    expect(cad.press("s", { ctrlKey: true })).toBe(true)
    expect(cad.press("o", { ctrlKey: true })).toBe(true)

    expect(files.saved).toHaveLength(1)
    expect(files.openCalls).toBe(1)
  })

  it("does not leak the file shortcuts into the command prompt", () => {
    const cad = createHarness({ files: new MemoryFileTransport() })

    cad.press("s", { ctrlKey: true })

    expect(cad.state().commandLine.buffer).toBe("")
  })

  it("loads the picked file", async () => {
    const files = new MemoryFileTransport(
      serializeDrawing(snapshotOf([lineOf(p(0, 0), p(100, 0), { id: "L1" })]))
    )
    const cad = createHarness({ files })

    await cad.runtime.openDrawingFromFile()

    expect(cad.entityCount).toBe(1)
    expect(cad.byId<LineEntity>("L1").end).toBeCloseToPoint(p(100, 0))
  })

  it("treats a cancelled pick as a no-op", async () => {
    const files = new MemoryFileTransport(null)
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
      files,
    })

    await cad.runtime.openDrawingFromFile()

    expect(cad.entityCount).toBe(1)
    expect(cad.commandLog()).toHaveLength(0)
  })

  it("reports a corrupt file at the prompt instead of throwing", async () => {
    const files = new MemoryFileTransport("not a drawing")
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
      files,
    })

    await expect(cad.runtime.openDrawingFromFile()).resolves.toBeUndefined()

    expect(cad.entityCount).toBe(1)
    expect(cad.commandLog().join(" ")).toMatch(/not valid/i)
  })

  it("reveals the prompt to report a failure, so it never goes unseen", async () => {
    const files = new MemoryFileTransport("not a drawing")
    const cad = createHarness({ files })
    cad.runtime.toggleCommandLine()
    expect(cad.state().commandLine.visible).toBe(false)

    await cad.runtime.openDrawingFromFile()

    expect(cad.state().commandLine.visible).toBe(true)
  })

  it("reports rather than crashes when the host offers no file access", () => {
    const cad = createHarness()

    cad.command("QSAVE")

    expect(cad.commandLog().join(" ")).toMatch(/not available/i)
  })
})

describe("engine state snapshot", () => {
  it("keeps a stable identity while nothing changes", () => {
    // The React layer subscribes with useSyncExternalStore, which re-renders on
    // every new identity; a snapshot rebuilt on each read would loop forever.
    const cad = createHarness()

    const first = cad.state()
    expect(cad.state()).toBe(first)

    // Redundant setters must not emit either.
    cad.runtime.setDocumentPrecision(first.documentPrecision)
    cad.runtime.setActiveTool("select")
    expect(cad.state()).toBe(first)
  })

  it("refreshes when the pointer moves, so the coordinate readout follows", () => {
    const cad = createHarness()
    const before = cad.state()

    cad.moveTo(p(37, -12))

    expect(cad.state()).not.toBe(before)
    expect(cad.state().cursorUcs).toBeCloseToPoint(p(37, -12))
  })

  it("produces a new identity when the model changes", () => {
    const cad = createHarness()
    const before = cad.state()

    cad.runtime.createLayer("Walls")

    expect(cad.state()).not.toBe(before)
  })

  it("describes the selection for the properties panel", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
    })

    cad.select("L1")

    const info = cad.state().properties.info
    expect(info?.count).toBe(1)
    expect(info?.title).toBe("Line")
    const rows = info?.groups.flatMap((group) => group.rows) ?? []
    expect(rows.find((row) => row.label === "Length")?.value).toBe("100.00 mm")
  })

  it("summarises a mixed multi-selection", () => {
    const cad = createHarness({
      entities: [
        lineOf(p(0, 0), p(100, 0), { id: "L1" }),
        circleOf(p(0, 0), 10, { id: "C1" }),
      ],
    })

    cad.selectAll()

    expect(cad.state().properties.info?.count).toBe(2)
    expect(cad.state().selectionLayerId).toBe(DEFAULT_LAYER_ID)
  })

  it("lists every registered tool exactly once", () => {
    const cad = createHarness()

    const ids = cad.state().tools.map((tool) => tool.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids).toContain("line")
    expect(ids).toContain("fillet")
  })
})

describe("host interaction", () => {
  it("asks for a redraw when the model changes", () => {
    const cad = createHarness()
    const before = cad.host.renderCount

    cad.command("LINE").click(p(0, 0)).click(p(100, 0)).escape()

    expect(cad.host.renderCount).toBeGreaterThan(before)
  })

  it("hides the OS cursor so the drawn crosshair takes over", () => {
    const cad = createHarness()

    cad.command("LINE").moveTo(p(10, 10))

    expect(cad.host.cursors.at(-1)).toBe("none")
  })

  it("restores the default cursor when the pointer leaves", () => {
    const cad = createHarness()

    cad.moveTo(p(10, 10))
    cad.runtime.pointerLeave()

    expect(cad.host.cursors.at(-1)).toBe("default")
    expect(cad.state().cursorUcs).toBeNull()
  })

  it("stops scheduling work once disposed", () => {
    const cad = createHarness()

    cad.runtime.dispose()

    expect(cad.runtime.isDisposed()).toBe(true)
  })
})

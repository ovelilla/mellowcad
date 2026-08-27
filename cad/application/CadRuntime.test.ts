import { describe, expect, it } from "vitest"
import type { LineEntity } from "../domain/entities"
import { LengthUnit } from "../domain/units"
import { DEFAULT_LAYER_ID } from "../domain/layers"
import {
  CadHarness,
  MemoryFileTransport,
  MemoryStore,
  createHarness,
} from "../../test/harness"
import { circleOf, lineOf, p, snapshotOf } from "../../test/builders"
import { serializeDrawing } from "../serialization/drawingFile"

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
    // reach ARC while AR reaches ARRAYRECT.
    const cad = createHarness()

    cad.command("A")
    expect(cad.activeToolId()).toBe("arc")

    cad.command("AR")
    expect(cad.activeToolId()).toBe("array")
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

  it("hides on F2 but reappears the moment something is typed", () => {
    const cad = createHarness()

    cad.press("F2")
    expect(cad.state().commandLine.visible).toBe(false)

    // Hiding is cosmetic: a keystroke must never vanish into nowhere.
    cad.press("c")
    expect(cad.state().commandLine.buffer).toBe("c")

    cad.press("F2")
    expect(cad.state().commandLine.visible).toBe(true)
  })

  it("shows the running command and its keywords in the prompt", () => {
    const cad = createHarness()

    expect(cad.state().commandLine.prompt).toBe("Command:")

    cad.command("FILLET")
    expect(cad.state().commandLine.prompt).toBe("FILLET [Radius]:")
  })
})

describe("undo and redo", () => {
  function drawTwoLines(cad: CadHarness) {
    cad
      .command("LINE")
      .click(p(0, 0))
      .click(p(100, 0))
      .click(p(100, 100))
      .escape()
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

  it("restores everything after Clear all in one step", () => {
    const cad = createHarness()
    drawTwoLines(cad)

    cad.runtime.clearAll()
    expect(cad.entityCount).toBe(0)

    cad.undo()
    expect(cad.entityCount).toBe(2)
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

    expect(cad.runtime.setSelectionProperty("length", "250")).toBe(true)
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

    expect(cad.runtime.setSelectionProperty("length", "250")).toBe(false)

    cad.select("L1", "L2")
    expect(cad.runtime.setSelectionProperty("length", "250")).toBe(false)
    expect(cad.byId<LineEntity>("L1").end).toBeCloseToPoint(p(100, 0))
  })

  it("rejects text that is not a number or would degenerate the object", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
    })
    cad.select("L1")

    expect(cad.runtime.setSelectionProperty("length", "")).toBe(false)
    expect(cad.runtime.setSelectionProperty("length", "abc")).toBe(false)
    expect(cad.runtime.setSelectionProperty("length", "0")).toBe(false)
    expect(cad.byId<LineEntity>("L1").end).toBeCloseToPoint(p(100, 0))
  })

  it("offers the editable rows in the selection info", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
    })
    cad.select("L1")

    const rows = cad.state().selectionInfo?.groups.flatMap((g) => g.rows) ?? []
    const editable = rows.filter((row) => row.edit)
    expect(editable.map((row) => row.edit?.property)).toEqual([
      "length",
      "angle",
      "startX",
      "startY",
      "endX",
      "endY",
    ])
    // The box is seeded with a bare number, the unit is rendered beside it.
    expect(editable[0].edit?.text).toBe("100.00")
    expect(editable[0].edit?.unit).toBe("mm")
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

  it("returns to the default view on reset", () => {
    const cad = createHarness()

    cad.wheel(p(200, 200), -100)
    cad.runtime.resetView()

    expect(cad.state().scale).toBe(1)
    expect(cad.toScreen(p(0, 0))).toBeCloseToPoint(p(500, 400))
  })

  it("pans with the right mouse button instead of drawing", () => {
    const cad = createHarness()
    const before = cad.toScreen(p(0, 0))

    cad.runtime.pointerDown({
      screen: p(500, 400),
      button: 2,
      shiftKey: false,
      ctrlKey: false,
      altKey: false,
    })
    cad.runtime.pointerMove({
      screen: p(560, 400),
      button: 2,
      shiftKey: false,
      ctrlKey: false,
      altKey: false,
    })
    cad.runtime.pointerUp({
      screen: p(560, 400),
      button: 2,
      shiftKey: false,
      ctrlKey: false,
      altKey: false,
    })

    expect(cad.toScreen(p(0, 0)).x).toBeCloseTo(before.x + 60)
    expect(cad.entityCount).toBe(0)
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
    expect(cad.state().cursorWorld).toBeCloseToPoint(p(37, -12))
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

    const info = cad.state().selectionInfo
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

    expect(cad.state().selectionInfo?.count).toBe(2)
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
    expect(cad.state().cursorWorld).toBeNull()
  })

  it("stops scheduling work once disposed", () => {
    const cad = createHarness()

    cad.runtime.dispose()

    expect(cad.runtime.isDisposed()).toBe(true)
  })
})

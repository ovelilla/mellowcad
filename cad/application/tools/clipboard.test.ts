import { describe, expect, it } from "vitest"
import { createHarness, MemoryClipboard } from "../../../test/harness"
import { layerOf, lineOf, p, textOf } from "../../../test/builders"
import {
  createBlockDefinition,
  createInsert,
  InsertEntity,
  LineEntity,
  TextEntity,
} from "../../domain/entities"
import { createTextStyle } from "../../domain/textStyles"
import { parseClipboard } from "../../serialization/clipboardFile"

/** Copies `ids` through COPYCLIP, the noun→verb way a user with a selection does. */
function copy(cad: ReturnType<typeof createHarness>, ...ids: string[]) {
  return cad.select(...ids).command("COPYCLIP")
}

/** Reads the clipboard and drops the fragment at `at`. */
async function pasteAt(
  cad: ReturnType<typeof createHarness>,
  at: { x: number; y: number }
) {
  await cad.runtime.pasteFromClipboard()
  cad.click(at)
}

describe("COPYCLIP", () => {
  it("measures the fragment from the lower-left of its extents", async () => {
    const cad = createHarness({
      entities: [lineOf(p(100, 50), p(200, 150), { id: "L1" })],
    })
    copy(cad, "L1")
    await pasteAt(cad, p(0, 0))

    // The documented rule: "the cursor location is based on the lower-left
    // corner of the extents of the objects you selected".
    const pasted = cad
      .entities()
      .find((entity) => entity.id !== "L1") as LineEntity
    expect(pasted.start).toBeCloseToPoint(p(0, 0))
    expect(pasted.end).toBeCloseToPoint(p(100, 100))
  })

  it("gives the copies fresh ids and leaves the originals alone", async () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
    })
    copy(cad, "L1")
    await pasteAt(cad, p(0, 200))

    expect(cad.entityCount).toBe(2)
    expect(cad.byId<LineEntity>("L1").start).toBeCloseToPoint(p(0, 0))
    const ids = cad.entities().map((entity) => entity.id)
    expect(new Set(ids).size).toBe(2)
  })

  it("asks what to copy when nothing is selected", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
    })
    cad.command("COPYCLIP")
    expect(cad.activeToolId()).toBe("copyclip")

    cad.click(p(50, 0)).enter()
    expect(cad.activeToolId()).toBe("select")
    expect(parseClipboard((cad.clipboard as MemoryClipboard).text!)).not.toBe(
      null
    )
  })

  it("leaves the originals selected, so the copy can be repeated", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
    })
    copy(cad, "L1")
    expect(cad.selectedIds()).toEqual(["L1"])
  })
})

describe("CUTCLIP", () => {
  it("copies the objects and removes them", async () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
    })
    cad.select("L1").command("CUTCLIP")
    expect(cad.entityCount).toBe(0)

    await pasteAt(cad, p(0, 0))
    expect(cad.only<LineEntity>("line").end).toBeCloseToPoint(p(100, 0))
  })

  it("restores the objects in one undo step", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
    })
    cad.select("L1").command("CUTCLIP").undo()
    expect(cad.byId<LineEntity>("L1").end).toBeCloseToPoint(p(100, 0))
  })
})

describe("COPYBASE", () => {
  it("measures the fragment from the point that was picked", async () => {
    const cad = createHarness({
      entities: [lineOf(p(100, 50), p(200, 150), { id: "L1" })],
    })
    // Base point first, then the objects — the order AutoCAD's task page gives.
    cad.select("L1").command("COPYBASE").click(p(200, 150))
    await pasteAt(cad, p(0, 0))

    const pasted = cad
      .entities()
      .find((entity) => entity.id !== "L1") as LineEntity
    expect(pasted.start).toBeCloseToPoint(p(-100, -100))
    expect(pasted.end).toBeCloseToPoint(p(0, 0))
  })

  it("accepts a typed base point and then asks for the objects", async () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
    })
    cad.command("COPYBASE").type("100,0").enter()
    expect(cad.activeToolId()).toBe("copybase")

    cad.click(p(50, 0)).enter()
    await pasteAt(cad, p(0, 0))
    const pasted = cad
      .entities()
      .find((entity) => entity.id !== "L1") as LineEntity
    expect(pasted.start).toBeCloseToPoint(p(-100, 0))
  })
})

describe("PASTECLIP", () => {
  it("previews exactly what it will commit", async () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
    })
    copy(cad, "L1")
    await cad.runtime.pasteFromClipboard()
    cad.moveTo(p(0, 200))

    // The ghost is drawn where the fragment would land, at its own base point.
    const ghostStart = cad.toScreen(p(0, 200))
    const ghost = cad
      .scene()
      .primitives.filter(
        (prim) =>
          prim.kind === "segment" &&
          Math.hypot(prim.a.x - ghostStart.x, prim.a.y - ghostStart.y) < 1e-6
      )
    expect(ghost).toHaveLength(1)

    cad.click(p(0, 200))
    const pasted = cad
      .entities()
      .find((entity) => entity.id !== "L1") as LineEntity
    expect(pasted.start).toBeCloseToPoint(p(0, 200))
  })

  it("accepts a typed insertion point", async () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
    })
    copy(cad, "L1")
    await cad.runtime.pasteFromClipboard()
    cad.type("300,400").enter()

    const pasted = cad
      .entities()
      .find((entity) => entity.id !== "L1") as LineEntity
    expect(pasted.start).toBeCloseToPoint(p(300, 400))
    expect(cad.activeToolId()).toBe("select")
  })

  // AutoCAD 2023's console answering the same input.
  it("asks as AutoCAD 2026: Enter asks again, what is no 2D point is refused", async () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
    })
    copy(cad, "L1")
    await cad.runtime.pasteFromClipboard()
    expect(cad.state().commandLine.prompt).toBe(
      "PASTECLIP Specify insertion point:"
    )
    for (const text of ["", "FOO", "5,5"]) {
      cad.runtime.setCommandLineText(text)
      cad.runtime.submitCommandLine()
    }

    expect(cad.commandLog().slice(-4)).toEqual([
      "Specify insertion point:",
      "Specify insertion point: FOO",
      "Invalid 2D point.",
      "Specify insertion point: 5,5",
    ])
    expect(cad.entityCount).toBe(2)
  })

  it("leaves the pasted objects selected (erase/p263)", async () => {
    const cad = createHarness({
      entities: [
        lineOf(p(0, 0), p(100, 0), { id: "L1" }),
        lineOf(p(0, 10), p(100, 10), { id: "L2" }),
      ],
    })
    copy(cad, "L1", "L2")
    await pasteAt(cad, p(0, 200))

    const selected = cad.selectedIds()
    expect(selected).toHaveLength(2)
    expect(selected).not.toContain("L1")
  })

  it("undoes a whole paste in one step", async () => {
    const cad = createHarness({
      entities: [
        lineOf(p(0, 0), p(100, 0), { id: "L1" }),
        lineOf(p(0, 10), p(100, 10), { id: "L2" }),
      ],
    })
    copy(cad, "L1", "L2")
    await pasteAt(cad, p(0, 200))
    expect(cad.entityCount).toBe(4)

    cad.undo()
    expect(cad.entityCount).toBe(2)
  })

  it("says so when there is nothing to paste", async () => {
    const cad = createHarness()
    await cad.runtime.pasteFromClipboard()

    expect(cad.commandLog()).toContain("Nothing on the clipboard.")
    expect(cad.activeToolId()).toBe("select")
  })

  it("Escape cancels without placing anything", async () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
    })
    copy(cad, "L1")
    await cad.runtime.pasteFromClipboard()
    cad.escape()

    expect(cad.entityCount).toBe(1)
    expect(cad.activeToolId()).toBe("select")
  })
})

describe("the fragment's tables", () => {
  it("carries the layer an object is on into another drawing", async () => {
    const clipboard = new MemoryClipboard()
    const source = createHarness({ clipboard })
    const walls = source.runtime.createLayer("WALLS", "#ff0000")
    source.runtime.document.load([
      lineOf(p(0, 0), p(100, 0), { id: "L1", layerId: walls }),
    ])
    copy(source, "L1")

    const target = createHarness({ clipboard })
    await pasteAt(target, p(0, 0))

    const pasted = target.only<LineEntity>("line")
    const layer = target.runtime.document.getLayer(pasted.layerId)
    expect(layer?.name).toBe("WALLS")
    expect(layer?.color).toBe("#ff0000")
  })

  it("joins a layer of the same name rather than adding a second", async () => {
    const clipboard = new MemoryClipboard()
    const source = createHarness({ clipboard })
    const walls = source.runtime.createLayer("WALLS", "#ff0000")
    source.runtime.document.load([
      lineOf(p(0, 0), p(100, 0), { id: "L1", layerId: walls }),
    ])
    copy(source, "L1")

    const target = createHarness({ clipboard })
    // The same name, a different id and a different colour: pasting must not
    // redefine the drawing it lands in.
    const existing = target.runtime.createLayer("WALLS", "#00ff00")
    const before = target.runtime.document.getLayers().length
    await pasteAt(target, p(0, 0))

    expect(target.runtime.document.getLayers()).toHaveLength(before)
    expect(target.only<LineEntity>("line").layerId).toBe(existing)
  })

  it("carries the text style a text object uses", async () => {
    const clipboard = new MemoryClipboard()
    const source = createHarness({ clipboard })
    source.runtime.document.load(
      [textOf(p(0, 0), "NOTE", { id: "T1", styleId: "TITLES" })],
      { textStyles: [createTextStyle("TITLES", 5)] }
    )
    copy(source, "T1")

    const target = createHarness({ clipboard })
    await pasteAt(target, p(0, 0))

    expect(target.only<TextEntity>("text").styleId).toBe("TITLES")
    expect(target.runtime.document.getTextStyle("TITLES")?.height).toBe(5)
  })

  it("carries the block definition a reference needs", async () => {
    const clipboard = new MemoryClipboard()
    const bar = createBlockDefinition("BAR", p(0, 0), [
      lineOf(p(0, 0), p(100, 0), { id: "bar-line" }),
    ])
    const source = createHarness({
      clipboard,
      blocks: [bar],
      entities: [createInsert("BAR", p(0, 0), { id: "I1" })],
    })
    copy(source, "I1")

    const target = createHarness({ clipboard })
    await pasteAt(target, p(50, 0))

    expect(target.runtime.document.getBlock("BAR")?.entities).toHaveLength(1)
    expect(target.only<InsertEntity>("insert").position).toBeCloseToPoint(
      p(50, 0)
    )
  })

  it("keeps the definition the target already has under that name", async () => {
    const clipboard = new MemoryClipboard()
    const source = createHarness({
      clipboard,
      blocks: [
        createBlockDefinition("BAR", p(0, 0), [
          lineOf(p(0, 0), p(100, 0), { id: "a" }),
        ]),
      ],
      entities: [createInsert("BAR", p(0, 0), { id: "I1" })],
    })
    copy(source, "I1")

    const target = createHarness({
      clipboard,
      blocks: [
        createBlockDefinition("BAR", p(0, 0), [
          lineOf(p(0, 0), p(7, 0), { id: "b" }),
          lineOf(p(0, 0), p(0, 7), { id: "c" }),
        ]),
      ],
    })
    await pasteAt(target, p(0, 0))

    expect(target.runtime.document.getBlock("BAR")?.entities).toHaveLength(2)
    expect(target.runtime.document.getBlocks()).toHaveLength(1)
  })

  it("takes the tables it added back out on undo", async () => {
    const clipboard = new MemoryClipboard()
    const source = createHarness({ clipboard })
    const walls = source.runtime.createLayer("WALLS", "#ff0000")
    source.runtime.document.load([
      lineOf(p(0, 0), p(100, 0), { id: "L1", layerId: walls }),
    ])
    copy(source, "L1")

    const target = createHarness({ clipboard })
    const before = target.runtime.document.getLayers().length
    await pasteAt(target, p(0, 0))
    target.undo()

    expect(target.entityCount).toBe(0)
    expect(target.runtime.document.getLayers()).toHaveLength(before)
  })

  it("carries only the layers the objects actually use", async () => {
    const clipboard = new MemoryClipboard()
    const source = createHarness({ clipboard })
    source.runtime.createLayer("UNUSED", "#0000ff")
    const walls = source.runtime.createLayer("WALLS", "#ff0000")
    source.runtime.document.load([
      lineOf(p(0, 0), p(100, 0), { id: "L1", layerId: walls }),
    ])
    copy(source, "L1")

    const fragment = parseClipboard((clipboard as MemoryClipboard).text!)!
    expect(fragment.drawing.layers.map((layer) => layer.name)).not.toContain(
      "UNUSED"
    )
  })
})

describe("the clipboard host", () => {
  it("falls back to the session copy when reading is refused", async () => {
    const clipboard = new MemoryClipboard()
    const cad = createHarness({
      clipboard,
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
    })
    copy(cad, "L1")
    clipboard.readError = new Error("denied")

    await pasteAt(cad, p(0, 200))
    expect(cad.entityCount).toBe(2)
  })

  it("falls back to the session copy when the clipboard holds other text", async () => {
    const clipboard = new MemoryClipboard()
    const cad = createHarness({
      clipboard,
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
    })
    copy(cad, "L1")
    clipboard.text = "https://example.com"

    await pasteAt(cad, p(0, 200))
    expect(cad.entityCount).toBe(2)
  })

  it("does not wait forever on a host that never answers", async () => {
    const clipboard = new MemoryClipboard()
    const cad = createHarness({
      clipboard,
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
    })
    copy(cad, "L1")
    // A browser showing an unanswered clipboard permission prompt: without a
    // bound on the wait, PASTECLIP would silently do nothing at all.
    clipboard.readHangs = true

    await pasteAt(cad, p(0, 200))
    expect(cad.entityCount).toBe(2)
  })

  it("works with no clipboard port at all", async () => {
    const cad = createHarness({
      clipboard: null,
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
    })
    copy(cad, "L1")
    await pasteAt(cad, p(0, 200))
    expect(cad.entityCount).toBe(2)
  })

  it("does not report a failed write", () => {
    const clipboard = new MemoryClipboard()
    clipboard.writeError = new Error("denied")
    const cad = createHarness({
      clipboard,
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
    })
    copy(cad, "L1")
    expect(cad.commandLog()).toHaveLength(1)
  })
})

describe("clipboard shortcuts", () => {
  const drawing = () => ({
    entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
  })

  it("Ctrl+C starts COPYCLIP and Ctrl+Shift+C starts COPYBASE", () => {
    const cad = createHarness(drawing())
    expect(cad.press("c", { ctrlKey: true })).toBe(true)
    expect(cad.activeToolId()).toBe("copyclip")

    cad.escape()
    expect(cad.press("C", { ctrlKey: true, shiftKey: true })).toBe(true)
    expect(cad.activeToolId()).toBe("copybase")
  })

  it("Ctrl+X starts CUTCLIP and Ctrl+V pastes", async () => {
    const cad = createHarness(drawing())
    cad.select("L1")
    expect(cad.press("x", { ctrlKey: true })).toBe(true)
    expect(cad.entityCount).toBe(0)

    expect(cad.press("v", { ctrlKey: true })).toBe(true)
    // The read is asynchronous; the tool starts once it settles.
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(cad.activeToolId()).toBe("paste")
  })

  it("leaves Ctrl+Shift+V to the browser (PASTEBLOCK does not exist here)", () => {
    const cad = createHarness(drawing())
    expect(cad.press("V", { ctrlKey: true, shiftKey: true })).toBe(false)
  })

  it("never leaks into the command prompt", () => {
    const cad = createHarness(drawing())
    for (const key of ["c", "x", "v", "a"]) {
      cad.press(key, { ctrlKey: true })
    }
    expect(cad.state().commandLine.buffer).toBe("")
  })
})

describe("Ctrl+A", () => {
  it("selects everything that can be selected", () => {
    const cad = createHarness({
      entities: [
        lineOf(p(0, 0), p(100, 0), { id: "L1" }),
        lineOf(p(0, 10), p(100, 10), { id: "L2" }),
      ],
    })
    expect(cad.press("a", { ctrlKey: true })).toBe(true)
    expect(cad.selectedIds().sort()).toEqual(["L1", "L2"])
  })

  it("skips objects on a locked or hidden layer", () => {
    const cad = createHarness()
    cad.runtime.document.load(
      [
        lineOf(p(0, 0), p(100, 0), { id: "L1" }),
        lineOf(p(0, 10), p(100, 10), { id: "LOCKED", layerId: "frozen" }),
      ],
      { layers: [layerOf("0"), layerOf("frozen", { locked: true })] }
    )
    cad.press("a", { ctrlKey: true })
    expect(cad.selectedIds()).toEqual(["L1"])
  })
})

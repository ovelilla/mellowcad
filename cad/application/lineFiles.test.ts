import { describe, expect, it, vi } from "vitest"
import {
  createHarness,
  MemoryFileTransport,
  MemoryStore,
} from "../../test/harness"
import { lineOf, p } from "../../test/builders"
import {
  type LineEntity,
  assignEntityColor,
  assignEntityLinetype,
  assignEntityLineweight,
  withDeltaZ,
  withElevation,
  withNormal,
  withThickness,
} from "../domain/entities"

// Every property AutoCAD's MPDUMP lists for a LINE (probe line/p21: Layer,
// Color, Linetype, LineWeight, Thickness, Normal, Start and End Z; its
// LinetypeScale is not modelled) survives the drawing file, the autosave and
// the clipboard. AutoCAD's own DWG is not the comparison.

function fullLine(): LineEntity {
  let line = lineOf(p(1.25, -2.5), p(30, 40), { id: "L" })
  line = assignEntityColor(line, "#d29b5f") as LineEntity
  line = assignEntityLinetype(line, "Hidden") as LineEntity
  line = assignEntityLineweight(line, 0.5) as LineEntity
  line = withDeltaZ(withElevation(line, 5), -2.75)
  line = withThickness(line, 3)
  line = withNormal(line, { x: 0, y: -1, z: 0 })
  return line
}

describe("a line's properties through files", () => {
  it("survives save and open, field for field", () => {
    const cad = createHarness()
    const layer = cad.runtime.createLayer("L1", undefined, false)
    cad.runtime.document.load([{ ...fullLine(), layerId: layer }])
    const before = cad.byId<LineEntity>("L")

    const copy = createHarness()
    copy.runtime.loadDrawing(cad.runtime.serializeDrawing())

    expect(copy.byId<LineEntity>("L")).toEqual(before)
  })

  it("survives QSAVE then OPEN through the file transport", async () => {
    const files = new MemoryFileTransport()
    const cad = createHarness({ entities: [fullLine()], files })
    cad.command("QSAVE")
    const reopened = createHarness({
      files: new MemoryFileTransport(files.saved[0].text),
    })
    reopened.command("OPEN")
    await vi.waitFor(() => expect(reopened.entityCount).toBe(1))
    expect(reopened.byId("L")).toEqual(fullLine())
  })

  it("survives the autosave store", () => {
    vi.useFakeTimers()
    try {
      const store = new MemoryStore()
      const cad = createHarness({ store })
      cad.runtime.document.load([fullLine()])
      cad.command("LINE").type("0,0").enter().type("@1,0").enter().enter()
      vi.advanceTimersByTime(10_000)
      expect(store.writes.length).toBeGreaterThan(0)
      const restored = createHarness({ store: new MemoryStore(store.read()) })
      expect(restored.byId("L")).toEqual(fullLine())
    } finally {
      vi.useRealTimers()
    }
  })

  it("keeps every property through COPYCLIP and PASTECLIP", async () => {
    const cad = createHarness({ entities: [fullLine()] })
    cad.select("L").command("COPYCLIP")
    await cad.runtime.pasteFromClipboard()
    cad.type("@0,0").enter()
    const pasted = cad.entities().find((e) => e.id !== "L") as LineEntity
    // Where it lands is the clipboard review's; what it wears is this one's.
    const { id: _a, start: _s, end: _e, ...a } = pasted
    const { id: _b, start: _t, end: _f, ...b } = fullLine()
    void [_a, _b, _s, _e, _t, _f]
    expect(a).toEqual(b)
  })

  it("NEW leaves no line, and U brings it back", () => {
    const cad = createHarness({ entities: [fullLine()] })
    cad.command("NEW")
    expect(cad.entityCount).toBe(0)
    cad.undo()
    expect(cad.byId("L")).toEqual(fullLine())
  })
})

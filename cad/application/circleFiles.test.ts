import { describe, expect, it, vi } from "vitest"
import {
  createHarness,
  MemoryFileTransport,
  MemoryStore,
} from "../../test/harness"
import { circleOf, p } from "../../test/builders"
import {
  type CircleEntity,
  assignEntityColor,
  assignEntityLinetype,
  assignEntityLineweight,
  entityPointToWorld,
  withElevation,
  withNormal,
  withThickness,
} from "../domain/entities"

// What a circle carries survives the drawing file, the autosave and the
// clipboard, as AutoCAD's DXF and DWG keep it (probes circle/p220, p221: a
// tilted circle's OCS centre, its elevation, thickness and normal, its colour,
// layer, linetype and lineweight read back as written). AutoCAD's own files
// are not the comparison.

const CIRCLES: [string, () => CircleEntity][] = [
  ["a plain circle", () => circleOf(p(20, -10), 5, { id: "C" })],
  [
    "a tilted circle",
    () =>
      withNormal(withElevation(circleOf(p(20, -10), 5, { id: "C" }), 5), {
        x: Math.SQRT1_2,
        y: 0,
        z: Math.SQRT1_2,
      }),
  ],
  [
    "a thick circle",
    () => withThickness(circleOf(p(20, -10), 5, { id: "C" }), -2),
  ],
  [
    "a coloured, linetyped and weighted circle",
    () => {
      let circle = circleOf(p(20, -10), 5, { id: "C" })
      circle = assignEntityColor(circle, "#0a141e") as CircleEntity
      circle = assignEntityLinetype(circle, "Dashed") as CircleEntity
      return assignEntityLineweight(circle, 0.5) as CircleEntity
    },
  ],
]

describe.each(CIRCLES)("%s through files", (_, circle) => {
  it("survives save and open on a layer of its own, field for field", () => {
    const cad = createHarness()
    const layer = cad.runtime.createLayer("L1", undefined, false)
    cad.runtime.document.load([{ ...circle(), layerId: layer }])
    const before = cad.byId<CircleEntity>("C")

    const copy = createHarness()
    copy.runtime.loadDrawing(cad.runtime.serializeDrawing())

    expect(copy.byId<CircleEntity>("C")).toEqual(before)
  })

  it("survives QSAVE then OPEN through the file transport", async () => {
    const files = new MemoryFileTransport()
    const cad = createHarness({ entities: [circle()], files })
    cad.command("QSAVE")
    const reopened = createHarness({
      files: new MemoryFileTransport(files.saved[0].text),
    })
    reopened.command("OPEN")
    await vi.waitFor(() => expect(reopened.entityCount).toBe(1))
    expect(reopened.byId("C")).toEqual(circle())
  })

  it("survives the autosave store", () => {
    vi.useFakeTimers()
    try {
      const store = new MemoryStore()
      const cad = createHarness({ store })
      cad.runtime.document.load([circle()])
      cad.command("LINE").type("0,0").enter().type("@1,0").enter().enter()
      vi.advanceTimersByTime(10_000)
      expect(store.writes.length).toBeGreaterThan(0)
      const restored = createHarness({ store: new MemoryStore(store.read()) })
      expect(restored.byId("C")).toEqual(circle())
    } finally {
      vi.useRealTimers()
    }
  })

  it("keeps every property through COPYBASE and PASTECLIP, moved in the WCS", async () => {
    const cad = createHarness({ entities: [circle()] })
    cad.select("C").command("COPYBASE").type("0,0,0").enter()
    await cad.runtime.pasteFromClipboard()
    cad.type("100,0").enter()
    const pasted = cad.entities().find((e) => e.id !== "C") as CircleEntity
    const from = entityPointToWorld(circle(), circle().center)
    const to = entityPointToWorld(pasted, pasted.center)
    expect(to.x - from.x).toBeCloseTo(100, 9)
    expect(to.y - from.y).toBeCloseTo(0, 9)
    expect(to.z - from.z).toBeCloseTo(0, 9)
    // Where it lands is the clipboard review's; what it wears is this one's.
    const { id: _a, center: _c, elevation: _e, ...a } = pasted
    const { id: _b, center: _d, elevation: _f, ...b } = circle()
    void [_a, _b, _c, _d, _e, _f]
    expect(a).toEqual(b)
  })
})

import { describe, expect, it, vi } from "vitest"
import {
  createHarness,
  MemoryFileTransport,
  MemoryStore,
} from "../../test/harness"
import { arcOf, deg, p } from "../../test/builders"
import {
  type ArcEntity,
  assignEntityColor,
  assignEntityLinetype,
  assignEntityLineweight,
  entityPointToWorld,
  withElevation,
  withNormal,
  withThickness,
} from "../domain/entities"

// What an arc carries survives the drawing file, the autosave and the
// clipboard, as AutoCAD's DXF keeps it (probes arc/p214, p215: an arc made
// clockwise, stored counter-clockwise from 270° to 0°, an elevated one, a
// thick one and one drawn in UCS X 90, its normal 0,-1,0, written and read
// back as they were). AutoCAD's own files are not the comparison.

const ARCS: [string, () => ArcEntity][] = [
  [
    "an arc made clockwise",
    () => arcOf(p(20, 0), 10, deg(270), 0, { id: "A" }),
  ],
  [
    "an elevated arc",
    () => withElevation(arcOf(p(40, 0), 10, 0, deg(90), { id: "A" }), 5),
  ],
  [
    "a thick arc",
    () => withThickness(arcOf(p(60, 0), 10, 0, deg(90), { id: "A" }), 3),
  ],
  [
    "a tilted arc",
    () =>
      withNormal(arcOf(p(80, 0), 10, 0, deg(120), { id: "A" }), {
        x: 0,
        y: -1,
        z: 0,
      }),
  ],
  [
    "a coloured, linetyped and weighted arc",
    () => {
      let arc = arcOf(p(100, 0), 10, 0, deg(90), { id: "A" })
      arc = assignEntityColor(arc, "#0a141e") as ArcEntity
      arc = assignEntityLinetype(arc, "Dashed") as ArcEntity
      return assignEntityLineweight(arc, 0.5) as ArcEntity
    },
  ],
]

describe.each(ARCS)("%s through files", (_, arc) => {
  it("survives save and open on a layer of its own, field for field", () => {
    const cad = createHarness()
    const layer = cad.runtime.createLayer("L1", undefined, false)
    cad.runtime.document.load([{ ...arc(), layerId: layer }])
    const before = cad.byId<ArcEntity>("A")

    const copy = createHarness()
    copy.runtime.loadDrawing(cad.runtime.serializeDrawing())

    expect(copy.byId<ArcEntity>("A")).toEqual(before)
  })

  it("survives QSAVE then OPEN through the file transport", async () => {
    const files = new MemoryFileTransport()
    const cad = createHarness({ entities: [arc()], files })
    cad.command("QSAVE")
    const reopened = createHarness({
      files: new MemoryFileTransport(files.saved[0].text),
    })
    reopened.command("OPEN")
    await vi.waitFor(() => expect(reopened.entityCount).toBe(1))
    expect(reopened.byId("A")).toEqual(arc())
  })

  it("survives the autosave store", () => {
    vi.useFakeTimers()
    try {
      const store = new MemoryStore()
      const cad = createHarness({ store })
      cad.runtime.document.load([arc()])
      cad.command("LINE").type("0,0").enter().type("@1,0").enter().enter()
      vi.advanceTimersByTime(10_000)
      expect(store.writes.length).toBeGreaterThan(0)
      const restored = createHarness({ store: new MemoryStore(store.read()) })
      expect(restored.byId("A")).toEqual(arc())
    } finally {
      vi.useRealTimers()
    }
  })

  it("keeps every property through COPYBASE and PASTECLIP, moved in the WCS", async () => {
    const cad = createHarness({ entities: [arc()] })
    cad.select("A").command("COPYBASE").type("0,0,0").enter()
    await cad.runtime.pasteFromClipboard()
    cad.type("100,0").enter()
    const pasted = cad.entities().find((e) => e.id !== "A") as ArcEntity
    const from = entityPointToWorld(arc(), arc().center)
    const to = entityPointToWorld(pasted, pasted.center)
    expect(to.x - from.x).toBeCloseTo(100, 9)
    expect(to.y - from.y).toBeCloseTo(0, 9)
    expect(to.z - from.z).toBeCloseTo(0, 9)
    // Where it lands is the clipboard review's; what it wears is this one's.
    const { id: _a, center: _c, elevation: _e, ...a } = pasted
    const { id: _b, center: _d, elevation: _f, ...b } = arc()
    void [_a, _b, _c, _d, _e, _f]
    expect(a).toEqual(b)
  })
})

import { describe, expect, it, vi } from "vitest"
import {
  createHarness,
  MemoryFileTransport,
  MemoryStore,
} from "../../test/harness"
import { deg, ellipseOf, p } from "../../test/builders"
import {
  type EllipseEntity,
  assignEntityColor,
  assignEntityLinetype,
  assignEntityLineweight,
  ellipseEndPoint,
  ellipseStartPoint,
  entityPointToWorld,
  mirrorEntity,
  withElevation,
  withNormal,
} from "../domain/entities"

// What an ellipse carries survives the drawing file, the autosave and the
// clipboard, as AutoCAD's DXF keeps it (probe ellipse/p327: an elliptical arc
// drawn in UCS X 90, its normal 0,-1,0; the review's scratch round trip of a
// mirrored, an elevated and a styled one). AutoCAD's own files are not the
// comparison.

/** The 10°→100° arc of probes ellipse/p320–p327, its axis at 30°. */
const arc30 = (center = p(0, 0)) =>
  ellipseOf(center, p(43.30127018922194, 25), 0.5, {
    id: "E",
    startParam: 0.33903719097228474,
    endParam: 1.6587324508186057,
  })

const ELLIPSES: [string, () => EllipseEntity][] = [
  ["a whole ellipse", () => ellipseOf(p(20, 0), p(10, 0), 0.5, { id: "E" })],
  ["an elliptical arc", () => arc30()],
  [
    "a mirrored elliptical arc",
    () => mirrorEntity(arc30(), p(0, 0), p(0, 10)) as EllipseEntity,
  ],
  [
    "an elevated ellipse",
    () => withElevation(ellipseOf(p(40, 0), p(10, 0), 0.5, { id: "E" }), 7),
  ],
  [
    "a tilted elliptical arc",
    () => withNormal(arc30(p(10, 20)), { x: 0, y: -1, z: 0 }),
  ],
  [
    "a coloured, linetyped and weighted ellipse",
    () => {
      let ellipse = ellipseOf(p(60, 0), p(0, 10), 0.4, { id: "E" })
      ellipse = assignEntityColor(ellipse, "#0a141e") as EllipseEntity
      ellipse = assignEntityLinetype(ellipse, "Dashed") as EllipseEntity
      return assignEntityLineweight(ellipse, 0.5) as EllipseEntity
    },
  ],
]

describe.each(ELLIPSES)("%s through files", (_, ellipse) => {
  it("survives save and open on a layer of its own, field for field", () => {
    const cad = createHarness()
    const layer = cad.runtime.createLayer("L1", undefined, false)
    cad.runtime.document.load([{ ...ellipse(), layerId: layer }])
    const before = cad.byId<EllipseEntity>("E")

    const copy = createHarness()
    copy.runtime.loadDrawing(cad.runtime.serializeDrawing())

    expect(copy.byId<EllipseEntity>("E")).toEqual(before)
  })

  it("survives QSAVE then OPEN through the file transport", async () => {
    const files = new MemoryFileTransport()
    const cad = createHarness({ entities: [ellipse()], files })
    cad.command("QSAVE")
    const reopened = createHarness({
      files: new MemoryFileTransport(files.saved[0].text),
    })
    reopened.command("OPEN")
    await vi.waitFor(() => expect(reopened.entityCount).toBe(1))
    expect(reopened.byId("E")).toEqual(ellipse())
  })

  it("survives the autosave store", () => {
    vi.useFakeTimers()
    try {
      const store = new MemoryStore()
      const cad = createHarness({ store })
      cad.runtime.document.load([ellipse()])
      cad.command("LINE").type("0,0").enter().type("@1,0").enter().enter()
      vi.advanceTimersByTime(10_000)
      expect(store.writes.length).toBeGreaterThan(0)
      const restored = createHarness({ store: new MemoryStore(store.read()) })
      expect(restored.byId("E")).toEqual(ellipse())
    } finally {
      vi.useRealTimers()
    }
  })

  it("keeps every property through COPYBASE and PASTECLIP, moved in the WCS", async () => {
    const cad = createHarness({ entities: [ellipse()] })
    cad.select("E").command("COPYBASE").type("0,0,0").enter()
    await cad.runtime.pasteFromClipboard()
    cad.type("100,0").enter()
    const pasted = cad.entities().find((e) => e.id !== "E") as EllipseEntity
    const from = entityPointToWorld(ellipse(), ellipse().center)
    const to = entityPointToWorld(pasted, pasted.center)
    expect(to.x - from.x).toBeCloseTo(100, 9)
    expect(to.y - from.y).toBeCloseTo(0, 9)
    expect(to.z - from.z).toBeCloseTo(0, 9)
    // Where it lands is the clipboard review's; what it wears is this one's.
    const { id: _a, center: _c, elevation: _e, ...a } = pasted
    const { id: _b, center: _d, elevation: _f, ...b } = ellipse()
    void [_a, _b, _c, _d, _e, _f]
    expect(a).toEqual(b)
  })
})

describe("an older file's ellipse", () => {
  // Saved before the factory normalised a range (probes ellipse/p134, p148:
  // AutoCAD's start in [0, 2π), its end after it): it loads as the same
  // curve, its range stored as AutoCAD stores it.
  it("loads an unnormalised range as the same arc", () => {
    const cad = createHarness()
    const file = JSON.parse(cad.runtime.serializeDrawing())
    file.entities = [
      {
        id: "E",
        type: "ellipse",
        layerId: "0",
        center: { x: 0, y: 0 },
        majorAxis: { x: 50, y: 0 },
        ratio: 0.5,
        startParam: -deg(30),
        endParam: deg(60) - 2 * Math.PI,
      },
    ]
    cad.runtime.loadDrawing(JSON.stringify(file))
    const loaded = cad.byId<EllipseEntity>("E")
    expect(loaded.startParam).toBeCloseTo(2 * Math.PI - deg(30), 12)
    expect(loaded.endParam).toBeCloseTo(2 * Math.PI + deg(60), 12)
    const same = ellipseOf(p(0, 0), p(50, 0), 0.5, {
      startParam: -deg(30),
      endParam: deg(60),
    })
    expect(ellipseStartPoint(loaded)).toBeCloseToPoint(
      ellipseStartPoint(same),
      12
    )
    expect(ellipseEndPoint(loaded)).toBeCloseToPoint(ellipseEndPoint(same), 12)
  })
})

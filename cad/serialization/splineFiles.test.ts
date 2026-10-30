import { describe, expect, it, vi } from "vitest"
import {
  createHarness,
  MemoryFileTransport,
  MemoryStore,
} from "../../test/harness"
import { p } from "../../test/builders"
import {
  type SplineEntity,
  assignEntityColor,
  assignEntityLinetype,
  assignEntityLineweight,
  createSpline,
  entityPointToWorld,
  splineCurve,
  withElevation,
  withNormal,
} from "../domain/entities"

// What a spline carries survives the drawing file, the autosave and the
// clipboard (the review's scratch round trip, spline s:c/object): its picks,
// method, degree, knots, closure and the tangents as stored — the start one
// as typed, the end one unit (probes spline/p302, p306).

const SPLINES: [string, () => SplineEntity][] = [
  [
    "a fit spline with both tangents, on square-root knots",
    () =>
      createSpline("fit", [p(0, 0), p(10, 10), p(20, 0), p(30, 10)], {
        id: "S",
        knots: "sqrtChord",
        startTangent: p(3, 4),
        endTangent: p(0, 1),
      }),
  ],
  [
    "a closed CV spline of degree 3 on three vertices",
    () =>
      createSpline("cv", [p(0, 0), p(10, 10), p(20, 0)], {
        id: "S",
        closed: true,
      }),
  ],
  [
    "a closed fit spline holding a start tangent",
    () =>
      createSpline("fit", [p(0, 0), p(10, 10), p(20, 0)], {
        id: "S",
        closed: true,
        startTangent: p(1, 0),
      }),
  ],
  [
    "an elevated open CV spline",
    () =>
      withElevation(
        createSpline("cv", [p(0, 0), p(5, 15), p(20, -5), p(40, 10)], {
          id: "S",
          degree: 2,
        }),
        7
      ),
  ],
  [
    "a tilted fit spline",
    () =>
      withNormal(
        createSpline("fit", [p(0, 0), p(4, 8), p(20, 0)], { id: "S" }),
        { x: 0, y: -1, z: 0 }
      ),
  ],
  [
    "a coloured, linetyped and weighted spline",
    () => {
      let spline = createSpline("fit", [p(0, 0), p(4, 8), p(20, 0)], {
        id: "S",
        knots: "uniform",
      })
      spline = assignEntityColor(spline, "#0a141e") as SplineEntity
      spline = assignEntityLinetype(spline, "Dashed") as SplineEntity
      return assignEntityLineweight(spline, 0.5) as SplineEntity
    },
  ],
  [
    "a weighed CV spline on knots of its own (spline-knots/k02, k11)",
    () =>
      createSpline(
        "cv",
        [p(0, 0), p(3.138593, 9.41578), p(10.217494, 5.040485), p(20, 4)],
        {
          id: "S",
          knotVector: [0, 0, 0, 0, 0.627719, 0.627719, 0.627719, 0.627719],
          weights: [1, 3, 1, 1],
        }
      ),
  ],
  [
    "a closed CV spline on one period of its own knots",
    () =>
      createSpline("cv", [p(30, 0), p(50, 0), p(50, 20), p(30, 20)], {
        id: "S",
        closed: true,
        knotVector: [0, 1, 3, 4, 7],
      }),
  ],
  [
    "a fit spline on custom knots (spline-knots/k05)",
    () =>
      createSpline("fit", [p(0, 0), p(10, 10), p(13.369531, 7.116166)], {
        id: "S",
        knotVector: [0, 0, 0, 0, 14.142136, 18.907372, 18.907372].concat([
          18.907372, 18.907372,
        ]),
        startTangent: p(0.707107, 1.178511),
        endTangent: p(0.707107, -0.867617),
      }),
  ],
]

describe.each(SPLINES)("%s through files", (_, spline) => {
  it("survives save and open on a layer of its own, field for field", () => {
    const cad = createHarness()
    const layer = cad.runtime.createLayer("L1", undefined, false)
    cad.runtime.document.load([{ ...spline(), layerId: layer }])
    const before = cad.byId<SplineEntity>("S")

    const copy = createHarness()
    copy.runtime.loadDrawing(cad.runtime.serializeDrawing())

    expect(copy.byId<SplineEntity>("S")).toEqual(before)
  })

  it("survives QSAVE then OPEN through the file transport", async () => {
    const files = new MemoryFileTransport()
    const cad = createHarness({ entities: [spline()], files })
    cad.command("QSAVE")
    const reopened = createHarness({
      files: new MemoryFileTransport(files.saved[0].text),
    })
    reopened.command("OPEN")
    await vi.waitFor(() => expect(reopened.entityCount).toBe(1))
    expect(reopened.byId("S")).toEqual(spline())
  })

  it("survives the autosave store", () => {
    vi.useFakeTimers()
    try {
      const store = new MemoryStore()
      const cad = createHarness({ store })
      cad.runtime.document.load([spline()])
      cad.command("LINE").type("0,0").enter().type("@1,0").enter().enter()
      vi.advanceTimersByTime(10_000)
      expect(store.writes.length).toBeGreaterThan(0)
      const restored = createHarness({ store: new MemoryStore(store.read()) })
      expect(restored.byId("S")).toEqual(spline())
    } finally {
      vi.useRealTimers()
    }
  })

  it("keeps every property through COPYBASE and PASTECLIP, moved in the WCS", async () => {
    const cad = createHarness({ entities: [spline()] })
    cad.select("S").command("COPYBASE").type("0,0,0").enter()
    await cad.runtime.pasteFromClipboard()
    cad.type("100,0").enter()
    const pasted = cad.entities().find((e) => e.id !== "S") as SplineEntity
    const from = entityPointToWorld(spline(), spline().points[0])
    const to = entityPointToWorld(pasted, pasted.points[0])
    expect(to.x - from.x).toBeCloseTo(100, 9)
    expect(to.y - from.y).toBeCloseTo(0, 9)
    expect(to.z - from.z).toBeCloseTo(0, 9)
    // A move keeps the tangents: they are derivatives, not places.
    const { id: _a, points: _c, elevation: _e, ...a } = pasted
    const { id: _b, points: _d, elevation: _f, ...b } = spline()
    void [_a, _b, _c, _d, _e, _f]
    expect(a).toEqual(b)
  })
})

describe("a spline's own knots and weights in a file", () => {
  const load = (entity: Record<string, unknown>) => {
    const cad = createHarness()
    const file = JSON.parse(cad.runtime.serializeDrawing())
    file.entities = [
      {
        id: "S",
        type: "spline",
        layerId: "0",
        method: "cv",
        points: [p(0, 0), p(5, 15), p(20, -5), p(40, 10)],
        degree: 3,
        knots: "chord",
        closed: false,
        ...entity,
      },
    ]
    cad.runtime.loadDrawing(JSON.stringify(file))
    return cad.byId<SplineEntity>("S")
  }

  it("drops knots or weights that do not fit its points, keeping the spline", () => {
    for (const knotVector of [
      [0, 0, 1, 1],
      "0 1",
      [0, 0, 0, 0, 1, 1, 1, "1"],
    ]) {
      expect(load({ knotVector }).knotVector).toBeUndefined()
    }
    for (const weights of [[1, 2, 3], [1, -2, 1, 1], "1"]) {
      expect(load({ weights }).weights).toBeUndefined()
    }
  })

  it("takes a CV spline's degree from its knots", () => {
    const loaded = load({ degree: 7, knotVector: [0, 0, 0, 1, 2, 2, 2] })
    expect(loaded.degree).toBe(2)
  })
})

describe("an older file's spline", () => {
  // Saved before 29, when a tangent was only a direction and the end one was
  // kept at the length picked: it loads unit, as SPLINE stores it now
  // (spline/p306), so the curve is the one AutoCAD makes from that pick.
  it("loads its end tangent unit and its start tangent as typed", () => {
    const cad = createHarness()
    const file = JSON.parse(cad.runtime.serializeDrawing())
    file.version = 28
    file.entities = [
      {
        id: "S",
        type: "spline",
        layerId: "0",
        method: "fit",
        points: [p(0, 0), p(10, 10), p(20, 0), p(30, 10)],
        degree: 3,
        knots: "chord",
        closed: false,
        startTangent: p(0, 5),
        endTangent: p(0, 5),
      },
    ]
    cad.runtime.loadDrawing(JSON.stringify(file))
    const loaded = cad.byId<SplineEntity>("S")
    expect(loaded.startTangent).toBeCloseToPoint(p(0, 5), 12)
    expect(loaded.endTangent).toBeCloseToPoint(p(0, 1), 12)
    // probe spline/p302#3: the start typed 0,5 away, the end 30,15.
    expect(splineCurve(loaded).controlPoints).toBeCloseToPoints(
      [
        p(0, 0),
        p(0, 23.57022604),
        p(12, 8.37202182),
        p(18, -4.657415431),
        p(30, 5.285954792),
        p(30, 10),
      ],
      8
    )
  })

  it("keeps a current file's end tangent at its length", () => {
    const cad = createHarness()
    const file = JSON.parse(cad.runtime.serializeDrawing())
    file.entities = [
      {
        id: "S",
        type: "spline",
        layerId: "0",
        method: "fit",
        points: [p(0, 0), p(10, 10), p(20, 0)],
        degree: 3,
        knots: "uniform",
        closed: false,
        endTangent: p(0, 2.5),
      },
    ]
    cad.runtime.loadDrawing(JSON.stringify(file))
    expect(cad.byId<SplineEntity>("S").endTangent).toBeCloseToPoint(
      p(0, 2.5),
      12
    )
  })
})

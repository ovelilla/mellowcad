import { describe, expect, it } from "vitest"
import {
  type ArcEntity,
  type CircleEntity,
  type Entity,
  type LineEntity,
  type PolylineEntity,
  entityElevation,
  lineEndZ,
  lineStartZ,
  withDeltaZ,
  withElevation,
} from "../../domain/entities"
import { type CadHarness, createHarness } from "../../../test/harness"
import {
  arcOf,
  circleOf,
  deg,
  layerOf,
  lineOf,
  p,
  polylineOf,
} from "../../../test/builders"
import { es } from "../../locales/es"

// AutoCAD 2027's console is the reference for every result below: the same
// answers there, read back with MPDUMP, which handle survived and what JOIN
// said (probes pieces/p300–p390).

/** Typed at the command line and confirmed, as AutoCAD's prompt reads it. */
function answer(cad: CadHarness, ...answers: string[]): CadHarness {
  for (const text of answers) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

/** The probes' crossing window over the whole figure. */
const CROSSING = ["_C", "-120,-120", "120,120", ""]

const A = {
  layerId: "A",
  color: "#ff0000",
  linetype: "DASHED",
  lineweight: 0.3,
  thickness: 3,
}
const B = {
  layerId: "B",
  color: "#0000ff",
  linetype: "HIDDEN",
  lineweight: 0.5,
  thickness: 6,
}

/** A drawing with the probes' layers A and B. */
function withLayers(entities: Entity[]): CadHarness {
  const cad = createHarness()
  cad.runtime.document.load(entities, {
    layers: [layerOf("0"), layerOf("A"), layerOf("B")],
  })
  return cad
}

const joined = (cad: CadHarness, ...answers: string[]) =>
  answer(cad, "_JOIN", ...answers)

describe("JOIN's prompts", () => {
  it("asks JOIN's source or several objects, then the objects to join (p300)", () => {
    const cad = createHarness({
      entities: [
        lineOf(p(0, 0), p(50, 0), { id: "A" }),
        lineOf(p(50, 0), p(100, 0), { id: "B" }),
      ],
    })

    cad.command("JOIN")
    expect(cad.state().commandLine.prompt).toBe(
      "JOIN Select source object or multiple objects to join at once:"
    )
    cad.click(p(25, 0))
    expect(cad.state().commandLine.prompt).toBe("JOIN Select objects to join:")
    cad.click(p(75, 0)).enter()

    expect(cad.commandLog().slice(0, 5)).toEqual([
      "JOIN",
      "Select source object or multiple objects to join at once: 1 found",
      "Select objects to join: 1 found, 2 total",
      "Select objects to join:",
      "2 lines joined into 1 line",
    ])
    expect(cad.entityCount).toBe(1)
  })

  it("ends silently at Enter on the first prompt (p309)", () => {
    const cad = joined(
      createHarness({ entities: [lineOf(p(0, 0), p(50, 0), { id: "A" })] }),
      ""
    )
    expect(cad.commandLog()).toEqual([
      "JOIN",
      "Select source object or multiple objects to join at once:",
    ])
    expect(cad.state().commandLine.command).toBeNull()
  })

  // WHY not `Select lines to join to source:`: the source's own step is
  // Missing (PIECES-D28), so a source alone is a set of one (p310, p364).
  it("says a source alone is discarded, its own step being Missing (p310)", () => {
    const cad = joined(
      createHarness({
        entities: [
          lineOf(p(0, 0), p(50, 0), { id: "A" }),
          lineOf(p(50, 0), p(100, 0), { id: "B" }),
        ],
      }),
      "25,0",
      ""
    )
    expect(cad.commandLog()).toContain(
      "0 objects joined, 1 object discarded from the operation"
    )
    expect(cad.entityCount).toBe(2)
  })

  it("is one step U names (p360–p362)", () => {
    const cad = joined(
      createHarness({
        entities: [
          lineOf(p(0, 0), p(50, 0), { id: "A" }),
          lineOf(p(50, 0), p(100, 50), { id: "B" }),
        ],
      }),
      ...CROSSING
    )
    expect(cad.typeCounts()).toEqual({ polyline: 1 })
    answer(cad, "_U")
    expect(cad.typeCounts()).toEqual({ line: 2 })
    expect(cad.commandLog().slice(-2)).toEqual(["U", "JOIN"])

    const nothing = joined(
      createHarness({
        entities: [
          lineOf(p(0, 0), p(50, 0), { id: "A" }),
          lineOf(p(0, 50), p(50, 80), { id: "B" }),
        ],
      }),
      ...CROSSING
    )
    answer(nothing, "_U")
    expect(nothing.commandLog().slice(-2)).toEqual(["U", "JOIN"])

    const empty = joined(
      createHarness({ entities: [lineOf(p(0, 0), p(50, 0), { id: "A" })] }),
      "",
      "_U"
    )
    expect(empty.commandLog().slice(-2)).toEqual(["U", "JOIN"])
  })

  it("speaks Spanish: names, the step U names (p301, p360)", () => {
    const cad = createHarness({
      locale: es,
      entities: [
        lineOf(p(0, 0), p(50, 0), { id: "A" }),
        lineOf(p(50, 0), p(100, 50), { id: "B" }),
      ],
    })
    answer(cad, "UNIR", ...CROSSING)
    expect(cad.commandLog()).toContain("2 objetos convertidos en 1 polilínea")
    answer(cad, "H")
    expect(cad.commandLog().slice(-2)).toEqual(["H", "UNIR"])
  })
})

describe("JOIN's collinear lines", () => {
  it("become the source LINE stretched over both (p300)", () => {
    const cad = joined(
      createHarness({
        entities: [
          lineOf(p(0, 0), p(50, 0), { id: "A" }),
          lineOf(p(50, 0), p(100, 0), { id: "B" }),
        ],
      }),
      "25,0",
      "75,0",
      ""
    )
    expect(cad.typeCounts()).toEqual({ line: 1 })
    const line = cad.byId<LineEntity>("A")
    expect(line.start).toBeCloseToPoint(p(0, 0))
    expect(line.end).toBeCloseToPoint(p(100, 0))
    expect(cad.commandLog()).toContain("2 lines joined into 1 line")
  })

  it.each([
    ["with a gap", 40, 60, "p328"],
    ["overlapping", 60, 40, "p329"],
  ])("join %s, a window's newest the source (%s %s %s)", (_, a, b) => {
    const cad = joined(
      createHarness({
        entities: [
          lineOf(p(0, 0), p(a, 0), { id: "A" }),
          lineOf(p(b, 0), p(100, 0), { id: "B" }),
        ],
      }),
      ...CROSSING
    )
    expect(cad.entities().map((e) => e.id)).toEqual(["B"])
    const line = cad.only<LineEntity>("line")
    expect(line.start).toBeCloseToPoint(p(0, 0))
    expect(line.end).toBeCloseToPoint(p(100, 0))
  })

  it("keep the handle and properties of the line picked first (p342)", () => {
    const cad = joined(
      withLayers([
        { ...lineOf(p(0, 0), p(50, 0), { id: "L1" }), ...A },
        { ...lineOf(p(50, 0), p(100, 0), { id: "L3" }), ...B },
      ]),
      "75,0",
      "25,0",
      ""
    )
    expect(cad.entities()).toHaveLength(1)
    expect(cad.entities()[0]).toMatchObject({ id: "L3", type: "line", ...B })
  })

  it("join collinear in 3D into one rising LINE (p349)", () => {
    const cad = joined(
      createHarness({
        entities: [
          withDeltaZ(lineOf(p(0, 0), p(50, 0), { id: "A" }), 10),
          withDeltaZ(
            withElevation(lineOf(p(50, 0), p(100, 0), { id: "B" }), 10),
            10
          ),
        ],
      }),
      ...CROSSING
    )
    const line = cad.only<LineEntity>("line")
    expect(line.id).toBe("B")
    expect(line.start).toBeCloseToPoint(p(0, 0))
    expect(line.end).toBeCloseToPoint(p(100, 0))
    expect(lineStartZ(line)).toBeCloseTo(0, 9)
    expect(lineEndZ(line)).toBeCloseTo(20, 9)
    expect(cad.commandLog()).toContain("2 lines joined into 1 line")
  })

  it("speak Spanish (p300)", () => {
    const cad = createHarness({
      locale: es,
      entities: [
        lineOf(p(0, 0), p(50, 0), { id: "A" }),
        lineOf(p(50, 0), p(100, 0), { id: "B" }),
      ],
    })
    answer(cad, "_JOIN", "25,0", "75,0", "")
    expect(cad.commandLog()).toContain("2 líneas unidas en 1 línea")
  })
})

describe("JOIN's arcs of one circle", () => {
  it("become the source ARC, counter-clockwise from it over the gap (p327)", () => {
    const cad = joined(
      createHarness({
        entities: [
          arcOf(p(0, 0), 50, 0, deg(90), { id: "R1" }),
          arcOf(p(0, 0), 50, deg(180), deg(270), { id: "R2" }),
        ],
      }),
      ...CROSSING
    )
    const arc = cad.only<ArcEntity>("arc")
    expect(arc.id).toBe("R2")
    expect(arc.startAngle).toBeCloseToAngle(deg(180))
    expect(arc.endAngle).toBeCloseToAngle(deg(90))
    expect(cad.commandLog()).toContain("2 arcs joined into 1 arc")
  })

  it("keep the handle and properties of the arc picked first (p344)", () => {
    const cad = joined(
      withLayers([
        { ...arcOf(p(0, 0), 50, 0, deg(90), { id: "R1" }), ...A },
        { ...arcOf(p(0, 0), 50, deg(180), deg(270), { id: "R2" }), ...B },
      ]),
      "35.35533906,35.35533906",
      "-35.35533906,-35.35533906",
      ""
    )
    expect(cad.entities()).toHaveLength(1)
    const arc = cad.only<ArcEntity>("arc")
    expect(arc).toMatchObject({ id: "R1", ...A })
    expect(arc.startAngle).toBeCloseToAngle(0)
    expect(arc.endAngle).toBeCloseToAngle(deg(270))
  })

  const closing = () =>
    createHarness({
      entities: [
        arcOf(p(0, 0), 50, 0, deg(90), { id: "R1" }),
        arcOf(p(0, 0), 50, deg(90), deg(180), { id: "R2" }),
      ],
    })

  it("ask to convert to a circle when they close it, Enter a new CIRCLE (p326, p386)", () => {
    const cad = joined(closing(), ...CROSSING)
    expect(cad.state().commandLine.prompt).toBe(
      "JOIN Combined arc segments form a circle.  Convert to circle? [Yes/No] <Yes>:"
    )
    answer(cad, "")
    const circle = cad.only<CircleEntity>("circle")
    expect(cad.entityCount).toBe(1)
    expect(circle.id).not.toMatch(/^R/)
    expect(circle.center).toBeCloseToPoint(p(0, 0))
    expect(circle.radius).toBeCloseTo(50, 9)
    expect(cad.commandLog().slice(-2)).toEqual([
      "Combined arc segments form a circle.  Convert to circle? [Yes/No] <Yes>:",
      "2 arcs joined and converted to circle",
    ])
  })

  it("change nothing and say nothing at No (p385)", () => {
    const cad = joined(closing(), ...CROSSING, "_N")
    expect(cad.typeCounts()).toEqual({ arc: 2 })
    expect(cad.byId<ArcEntity>("R1").endAngle).toBeCloseToAngle(deg(90))
    expect(cad.commandLog().at(-1)).toBe(
      "Combined arc segments form a circle.  Convert to circle? [Yes/No] <Yes>: _N"
    )
    expect(cad.state().commandLine.command).toBeNull()
  })

  it("close the circle overlapping too (p382)", () => {
    const cad = joined(
      createHarness({
        entities: [
          arcOf(p(0, 0), 50, 0, deg(90), { id: "R1" }),
          arcOf(p(0, 0), 50, deg(45), deg(180), { id: "R2" }),
        ],
      }),
      ...CROSSING,
      "_Y"
    )
    expect(cad.typeCounts()).toEqual({ circle: 1 })
  })

  it("ask and answer in Spanish (p386, p387)", () => {
    const cad = createHarness({
      locale: es,
      entities: [
        arcOf(p(0, 0), 50, 0, deg(90), { id: "R1" }),
        arcOf(p(0, 0), 50, deg(90), deg(180), { id: "R2" }),
      ],
    })
    answer(cad, "UNIR", ...CROSSING)
    expect(cad.state().commandLine.prompt).toBe(
      "UNIR Los segmentos de arco combinados forman un círculo. ¿Convertir en círculo? [Sí/No] <Sí>:"
    )
    answer(cad, "S")
    expect(cad.typeCounts()).toEqual({ circle: 1 })
    expect(cad.commandLog()).toContain("2 arcos unidos y convertidos a círculo")
  })

  it("speak Spanish (p327)", () => {
    const cad = createHarness({
      locale: es,
      entities: [
        arcOf(p(0, 0), 50, 0, deg(90), { id: "R1" }),
        arcOf(p(0, 0), 50, deg(180), deg(270), { id: "R2" }),
      ],
    })
    answer(cad, "_JOIN", ...CROSSING)
    expect(cad.commandLog()).toContain("2 arcos unidos en 1 arco")
  })
})

describe("JOIN's polylines", () => {
  it("keep a polyline's handle and properties, whatever was picked first (p343)", () => {
    const cad = joined(
      withLayers([
        { ...lineOf(p(0, 0), p(50, 0), { id: "L1" }), ...A },
        {
          ...polylineOf([p(50, 0), p(50, 50), p(100, 50)], { id: "P" }),
          ...B,
        },
      ]),
      "25,0",
      "50,25",
      ""
    )
    expect(cad.entities()).toHaveLength(1)
    const poly = cad.only<PolylineEntity>("polyline")
    expect(poly).toMatchObject({ id: "P", ...B })
    expect(poly.vertices).toBeCloseToPoints([
      p(0, 0),
      p(50, 0),
      p(50, 50),
      p(100, 50),
    ])
    expect(cad.commandLog()).toContain("1 segment joined into 1 polyline")
  })

  it.each([
    ["25,0", "50,25", "P1", "2 segments joined into 1 polyline", "p378"],
    ["50,25", "25,0", "P2", "1 segment joined into 1 polyline", "p379"],
  ])(
    "of two, keep the one picked first (%s then %s: %s, %s, %s)",
    (first, second, kept, said) => {
      const cad = joined(
        createHarness({
          entities: [
            polylineOf([p(0, 0), p(50, 0)], { id: "P1" }),
            polylineOf([p(50, 0), p(50, 50), p(100, 50)], { id: "P2" }),
          ],
        }),
        first,
        second,
        ""
      )
      const poly = cad.only<PolylineEntity>("polyline")
      expect(poly.id).toBe(kept)
      expect(poly.vertices).toBeCloseToPoints([
        p(0, 0),
        p(50, 0),
        p(50, 50),
        p(100, 50),
      ])
      expect(cad.commandLog()).toContain(said)
    }
  )

  it("keep the polyline though older than a line a window finds first (p380)", () => {
    const cad = joined(
      createHarness({
        entities: [
          polylineOf([p(0, 0), p(50, 0), p(50, 50)], { id: "P" }),
          lineOf(p(50, 50), p(100, 50), { id: "L" }),
        ],
      }),
      ...CROSSING
    )
    expect(cad.only<PolylineEntity>("polyline").id).toBe("P")
    expect(cad.entityCount).toBe(1)
  })

  it("keep the source's widths and its handle (p354, p355)", () => {
    const after = joined(
      createHarness({
        entities: [
          polylineOf([p(0, 0), p(50, 0)], { id: "P", widths: [[2, 4]] }),
          lineOf(p(50, 0), p(100, 0), { id: "A" }),
        ],
      }),
      "25,0",
      "75,0",
      ""
    )
    expect(after.only<PolylineEntity>("polyline")).toMatchObject({
      id: "P",
      widths: [
        [2, 4],
        [4, 4],
      ],
    })
    const before = joined(
      createHarness({
        entities: [
          polylineOf([p(0, 0), p(50, 0)], { id: "P", widths: [[2, 4]] }),
          lineOf(p(-50, 0), p(0, 0), { id: "A" }),
        ],
      }),
      "25,0",
      "-25,0",
      ""
    )
    expect(before.only<PolylineEntity>("polyline")).toMatchObject({
      id: "P",
      widths: [
        [2, 4],
        [2, 4],
      ],
    })
  })

  it("grow by a line and an arc at either end and count their segments (p356)", () => {
    const r = Math.SQRT2 * 50
    const cad = joined(
      createHarness({
        entities: [
          polylineOf([p(0, 0), p(50, 0), p(50, 50)], {
            id: "P",
            widths: [
              [2, 4],
              [6, 8],
            ],
          }),
          lineOf(p(-50, 0), p(0, 0), { id: "L" }),
          arcOf(p(0, 100), r, deg(-45), deg(90), { id: "R" }),
        ],
      }),
      "_C",
      "-120,-120",
      "160,160",
      ""
    )
    const poly = cad.only<PolylineEntity>("polyline")
    expect(poly.id).toBe("P")
    expect(poly.vertices).toBeCloseToPoints(
      [p(-50, 0), p(0, 0), p(50, 0), p(50, 50), p(0, 100 + r)],
      4
    )
    expect(poly.bulges?.[3]).toBeCloseTo(Math.tan(deg(135) / 4), 4)
    expect(poly.widths).toEqual([
      [2, 4],
      [2, 4],
      [6, 8],
      [8, 8],
    ])
    expect(cad.commandLog()).toContain("2 segments joined into 1 polyline")
  })

  it.each([
    ["polyline first", "_C"],
    ["line picked first", "75,0"],
  ])(
    "join nothing at a line from an open polyline's inner vertex (p388, %s)",
    (_, how) => {
      const open = polylineOf([p(0, 0), p(50, 0), p(50, 50)], { id: "P" })
      const cad = createHarness({
        entities: [open, lineOf(p(50, 0), p(100, 0), { id: "A" })],
      })
      if (how === "_C") joined(cad, ...CROSSING)
      else joined(cad, "75,0", "25,0", "")
      expect(cad.entities()).toEqual([
        open,
        lineOf(p(50, 0), p(100, 0), { id: "A" }),
      ])
      expect(cad.commandLog()).toContain(
        "0 objects joined, 2 objects discarded from the operation"
      )
    }
  )

  it.each([
    ["by a window", CROSSING],
    ["the line picked first", ["75,0", "25,0", ""]],
    ["the polyline picked first", ["25,0", "75,0", ""]],
  ])("join nothing to a closed polyline (p373, p389, %s)", (_, answers) => {
    const closed = polylineOf([p(0, 0), p(50, 0), p(50, 50)], {
      id: "P",
      closed: true,
    })
    const cad = joined(
      createHarness({
        entities: [closed, lineOf(p(50, 0), p(100, 0), { id: "A" })],
      }),
      ...answers
    )
    expect(cad.byId<PolylineEntity>("P")).toEqual(closed)
    expect(cad.typeCounts()).toEqual({ polyline: 1, line: 1 })
    expect(cad.commandLog()).toContain(
      "0 objects joined, 2 objects discarded from the operation"
    )
  })

  it("speak Spanish (p322)", () => {
    const cad = createHarness({
      locale: es,
      entities: [
        polylineOf([p(0, 0), p(50, 0)], { id: "P1" }),
        polylineOf([p(50, 0), p(50, 50), p(100, 50)], { id: "P2" }),
      ],
    })
    answer(cad, "_JOIN", ...CROSSING)
    expect(cad.only<PolylineEntity>("polyline").id).toBe("P2")
    expect(cad.commandLog()).toContain("1 segmento unido en 1 polilínea")
  })
})

describe("JOIN's new polylines", () => {
  it.each([
    ["25,0", "50,25", A, "p339"],
    ["50,25", "25,0", B, "p340"],
  ])(
    "wear the properties of the object picked first (%s then %s, %#)",
    (first, second, props) => {
      const cad = joined(
        withLayers([
          { ...lineOf(p(0, 0), p(50, 0), { id: "L1" }), ...A },
          { ...lineOf(p(50, 0), p(50, 50), { id: "L2" }), ...B },
        ]),
        first,
        second,
        ""
      )
      const poly = cad.only<PolylineEntity>("polyline")
      expect(cad.entityCount).toBe(1)
      expect(poly).toMatchObject(props)
      expect(poly.vertices).toBeCloseToPoints([p(0, 0), p(50, 0), p(50, 50)])
      expect(cad.commandLog()).toContain("2 objects converted to 1 polyline")
    }
  )

  it("join a line and an arc, the arc a bulge (p321)", () => {
    const cad = joined(
      createHarness({
        entities: [
          lineOf(p(100, 0), p(50, 0), { id: "L" }),
          arcOf(p(0, 0), 50, 0, deg(90), { id: "R" }),
        ],
      }),
      ...CROSSING
    )
    const poly = cad.only<PolylineEntity>("polyline")
    expect(poly.vertices).toBeCloseToPoints([p(100, 0), p(50, 0), p(0, 50)])
    expect(poly.bulges?.[1]).toBeCloseTo(Math.tan(deg(22.5)), 6)
    expect(cad.commandLog()).toContain("2 objects converted to 1 polyline")
  })

  it("grow from the source over whole objects until none fits (p338, p384)", () => {
    const arc = joined(
      createHarness({
        entities: [
          lineOf(p(100, 0), p(50, 0), { id: "L1" }),
          lineOf(p(150, 0), p(100, 0), { id: "L2" }),
          arcOf(p(0, 0), 50, 0, deg(90), { id: "R" }),
        ],
      }),
      "_C",
      "-120,-120",
      "180,120",
      ""
    )
    expect(arc.only<PolylineEntity>("polyline").vertices).toBeCloseToPoints([
      p(150, 0),
      p(100, 0),
      p(50, 0),
      p(0, 50),
    ])
    expect(arc.commandLog()).toContain("3 objects converted to 1 polyline")

    const picked = joined(
      createHarness({
        entities: [
          lineOf(p(0, 0), p(50, 0), { id: "L1" }),
          lineOf(p(50, 0), p(50, 50), { id: "L2" }),
          lineOf(p(50, 50), p(100, 50), { id: "L3" }),
        ],
      }),
      "75,50",
      "25,0",
      "50,25",
      ""
    )
    expect(picked.only<PolylineEntity>("polyline").vertices).toBeCloseToPoints([
      p(0, 0),
      p(50, 0),
      p(50, 50),
      p(100, 50),
    ])
  })

  it("close a lens in two vertices (p325)", () => {
    const r = 72.5
    const a1 = Math.atan2(52.5, -50)
    const a2 = Math.atan2(52.5, 50)
    const cad = joined(
      createHarness({
        entities: [
          arcOf(p(50, -52.5), r, a2, a1, { id: "R1" }),
          arcOf(p(50, 52.5), r, -a1, -a2, { id: "R2" }),
        ],
      }),
      ...CROSSING
    )
    const poly = cad.only<PolylineEntity>("polyline")
    expect(poly.closed).toBe(true)
    expect(poly.vertices).toBeCloseToPoints([p(0, 0), p(100, 0)], 6)
    expect(poly.bulges?.[0]).toBeCloseTo(0.4, 6)
    expect(poly.bulges?.[1]).toBeCloseTo(0.4, 6)
  })

  it("make one polyline per chain (p333)", () => {
    const entities = () => [
      lineOf(p(0, 0), p(50, 0), { id: "A" }),
      lineOf(p(50, 0), p(100, 0), { id: "B" }),
      lineOf(p(0, 50), p(50, 50), { id: "C" }),
      lineOf(p(50, 50), p(50, 100), { id: "D" }),
    ]
    const cad = joined(createHarness({ entities: entities() }), ...CROSSING)
    const [first, second] = cad.entities() as PolylineEntity[]
    expect(cad.typeCounts()).toEqual({ polyline: 2 })
    expect(first.vertices).toBeCloseToPoints([p(0, 50), p(50, 50), p(50, 100)])
    expect(second.vertices).toBeCloseToPoints([p(0, 0), p(50, 0), p(100, 0)])
    expect(cad.commandLog()).toContain("4 objects converted to 2 polylines")

    const spanish = createHarness({ locale: es, entities: entities() })
    answer(spanish, "_JOIN", ...CROSSING)
    expect(spanish.commandLog()).toContain(
      "4 objetos convertidos a 2 polilíneas"
    )
  })

  it.each([
    [
      undefined,
      "2 objects converted to 1 polyline, 1 object discarded from the operation",
    ],
    [
      es,
      "2 objetos convertidos en 1 polilínea, 1 objeto descartado de la operación",
    ],
  ] as const)("count what they discard (p319, %#)", (locale, said) => {
    const cad = createHarness({
      locale,
      entities: [
        circleOf(p(0, 0), 50, { id: "C" }),
        lineOf(p(50, 0), p(100, 0), { id: "A" }),
        lineOf(p(100, 0), p(100, 50), { id: "B" }),
      ],
    })
    answer(cad, "_JOIN", ...CROSSING)
    expect(cad.commandLog()).toContain(said)
    expect(cad.only<PolylineEntity>("polyline").vertices).toBeCloseToPoints([
      p(50, 0),
      p(100, 0),
      p(100, 50),
    ])
  })

  it("lie at their objects' elevation (p345)", () => {
    const cad = joined(
      createHarness({
        entities: [
          withElevation(lineOf(p(0, 0), p(50, 0), { id: "A" }), 7),
          withElevation(lineOf(p(50, 0), p(50, 50), { id: "B" }), 7),
        ],
      }),
      ...CROSSING
    )
    expect(entityElevation(cad.only<PolylineEntity>("polyline"))).toBe(7)
  })
})

describe("JOIN's set from a window", () => {
  it("takes the newest object as the source (p341, p390)", () => {
    const cad = joined(
      withLayers([
        { ...lineOf(p(0, 0), p(50, 0), { id: "L1" }), ...A },
        { ...lineOf(p(50, 0), p(50, 50), { id: "L2" }), ...B },
      ]),
      "_C",
      "-10,-10",
      "60,60",
      ""
    )
    expect(cad.only<PolylineEntity>("polyline")).toMatchObject(B)
  })

  it("starts a closed square at the newest line (p324)", () => {
    const cad = joined(
      createHarness({
        entities: [
          lineOf(p(0, 0), p(100, 0), { id: "L1" }),
          lineOf(p(100, 0), p(100, 100), { id: "L2" }),
          lineOf(p(100, 100), p(0, 100), { id: "L3" }),
          lineOf(p(0, 100), p(0, 0), { id: "L4" }),
        ],
      }),
      ...CROSSING
    )
    const poly = cad.only<PolylineEntity>("polyline")
    expect(poly.closed).toBe(true)
    expect(poly.vertices).toBeCloseToPoints([
      p(100, 0),
      p(100, 100),
      p(0, 100),
      p(0, 0),
    ])
    expect(cad.commandLog()).toContain("4 objects converted to 1 polyline")
  })

  it("grows a T from the newest line, the oldest discarded (p377)", () => {
    const cad = joined(
      createHarness({
        entities: [
          lineOf(p(0, 0), p(50, 0), { id: "L1" }),
          lineOf(p(50, 0), p(100, 0), { id: "L2" }),
          lineOf(p(50, 0), p(50, 50), { id: "L3" }),
        ],
      }),
      ...CROSSING
    )
    expect(cad.byId<LineEntity>("L1")).toBeDefined()
    expect(cad.only<PolylineEntity>("polyline").vertices).toBeCloseToPoints([
      p(100, 0),
      p(50, 0),
      p(50, 50),
    ])
    expect(cad.commandLog()).toContain(
      "2 objects converted to 1 polyline, 1 object discarded from the operation"
    )
  })
})

describe("JOIN after EXPLODE", () => {
  const rectangle = polylineOf([p(0, 0), p(200, 0), p(200, 120), p(0, 120)], {
    id: "P1",
    closed: true,
  })

  it("rebuilds the polyline from the newest piece a window finds (p324)", () => {
    const cad = createHarness({ entities: [rectangle] })

    cad.select("P1").command("EXPLODE")
    joined(cad, "_C", "-10,-10", "210,130", "")

    const poly = cad.only<PolylineEntity>("polyline")
    expect(poly.closed).toBe(true)
    expect(poly.vertices).toBeCloseToPoints([
      p(200, 0),
      p(200, 120),
      p(0, 120),
      p(0, 0),
    ])
  })

  it("each is one step U names (p360)", () => {
    const cad = createHarness({ entities: [rectangle] })

    cad.select("P1").command("EXPLODE")
    cad.selectAll().command("JOIN")
    expect(cad.entityCount).toBe(1)

    answer(cad, "_U")
    expect(cad.entityCount).toBe(4)
    expect(cad.commandLog().slice(-2)).toEqual(["U", "JOIN"])
    answer(cad, "_U")
    expect(cad.entityCount).toBe(1)
    expect(cad.only<PolylineEntity>("polyline").closed).toBe(true)
  })

  it("keeps the pieces' colour, plane and thickness (p339, p345)", () => {
    const raised: PolylineEntity = {
      ...rectangle,
      color: "#ff0000",
      elevation: 12,
      thickness: 3,
    }
    const cad = createHarness({ entities: [raised] })

    cad.select("P1").command("EXPLODE")
    for (const piece of cad.entities()) {
      expect(piece).toMatchObject({
        color: "#ff0000",
        elevation: 12,
        thickness: 3,
      })
    }

    cad.selectAll().command("JOIN")
    expect(cad.only<PolylineEntity>("polyline")).toMatchObject({
      color: "#ff0000",
      elevation: 12,
      thickness: 3,
    })
  })
})

describe("JOIN's discards", () => {
  it.each([
    [undefined, "0 objects joined, 2 objects discarded from the operation"],
    [es, "0 objetos unidos, 2 objetos descartados de la operación"],
  ] as const)(
    "leave objects that meet nothing alone (p334, %#)",
    (locale, said) => {
      const cad = createHarness({
        locale,
        entities: [
          lineOf(p(0, 0), p(50, 0), { id: "A" }),
          lineOf(p(0, 50), p(50, 80), { id: "B" }),
        ],
      })
      answer(cad, "_JOIN", ...CROSSING)
      expect(cad.typeCounts()).toEqual({ line: 2 })
      expect(cad.commandLog()).toContain(said)
    }
  )
})

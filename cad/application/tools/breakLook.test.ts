import { describe, expect, it } from "vitest"
import type { ArcEntity, Entity, LineEntity } from "../../domain/entities"
import type { Vec2 } from "../../geometry/Vec2"
import { THEME } from "../../scene/theme"
import type { ScenePrimitive, StrokeStyle } from "../../scene/types"
import { fadedColor } from "../SceneBuilder"
import { type CadHarness, createHarness } from "../../../test/harness"
import {
  circleOf,
  deg,
  layerOf,
  lineOf,
  p,
  polylineOf,
  textOf,
} from "../../../test/builders"

// BREAK's and BREAKATPOINT's look on the desktop (AutoCAD 2027, Spanish
// profile, script scripts/research/probes/pieces/dsk.sh): the figure of
// pieces/d01–d14 at 10×, a unit a pixel — the line H, the circle C, the
// closed polyline P with its arc, a text, a line on a locked layer.
function figure(): CadHarness {
  const cad = createHarness()
  const entities: Entity[] = [
    lineOf(p(100, 100), p(700, 100), { id: "H" }),
    circleOf(p(850, 250), 80, { id: "C" }),
    polylineOf([p(150, 500), p(400, 500), p(400, 650), p(150, 650)], {
      id: "P",
      closed: true,
      bulges: [0, 0, 1, 0],
    }),
    textOf(p(200, 250), "ABC", { id: "T", height: 50 }),
    lineOf(p(150, 450), p(350, 450), { id: "K", layerId: "BLQ" }),
  ]
  cad.runtime.document.load(entities, {
    layers: [layerOf("0"), layerOf("BLQ", { locked: true })],
  })
  return cad
}

const plain: StrokeStyle = { color: THEME.entity, width: 1.25 }
const faded: StrokeStyle = {
  color: fadedColor(THEME.entity),
  width: 1.25,
}
const glow: StrokeStyle = { color: THEME.selected, width: 5.25 }
const rollover: StrokeStyle = { color: THEME.entityHover, width: 2 }

/** The strokes of the segments drawn between `a` and `b`, either way round. */
function strokesAt(cad: CadHarness, a: Vec2, b: Vec2): StrokeStyle[] {
  const near = (q: Vec2, r: Vec2) => Math.hypot(q.x - r.x, q.y - r.y) < 1e-6
  const [sa, sb] = [cad.toScreen(a), cad.toScreen(b)]
  return cad
    .scene()
    .primitives.flatMap((prim) =>
      prim.kind === "segment" &&
      ((near(prim.a, sa) && near(prim.b, sb)) ||
        (near(prim.a, sb) && near(prim.b, sa)))
        ? [prim.stroke]
        : []
    )
}

/** The strokes of the primitives of `kind`. */
function strokesOf(cad: CadHarness, kind: ScenePrimitive["kind"]) {
  return cad
    .scene()
    .primitives.flatMap((prim) =>
      prim.kind === kind && "stroke" in prim && prim.stroke ? [prim.stroke] : []
    )
}

/** Every colour drawn, strokes and texts. */
const colours = (cad: CadHarness) =>
  cad
    .scene()
    .primitives.flatMap((prim) =>
      "stroke" in prim && prim.stroke
        ? [prim.stroke.color]
        : "color" in prim && typeof prim.color === "string"
          ? [prim.color]
          : []
    )

/** The line H's pieces, `start end` in drawing order. */
const lineEnds = (cad: CadHarness) =>
  (cad.entities() as LineEntity[])
    .filter((entity) => entity.type === "line" && entity.id !== "K")
    .map(({ start, end }) => `${start.x},${start.y} ${end.x},${end.y}`)

describe("BREAK's rollover at Select object", () => {
  it("draws the object under the cursor in the plain hover, as FILLET's (desktop pieces/d01-1, corners/d01-1)", () => {
    const cad = figure().command("BREAK").moveTo(p(300, 101))
    expect(strokesAt(cad, p(100, 100), p(700, 100))).toEqual([plain, rollover])
    expect(colours(cad)).not.toContain(THEME.selected)
  })

  it("draws a text it refuses (desktop d06-2), and nothing over a locked object (d06-1)", () => {
    const cad = figure().command("BREAK").moveTo(p(210, 260))
    expect(colours(cad)).toContain(THEME.entityHover)
    cad.moveTo(p(250, 451))
    expect(colours(cad)).not.toContain(THEME.entityHover)
    expect(colours(cad)).not.toContain(THEME.selected)
  })
})

describe("BREAK's ghost at the second break point", () => {
  it("draws what the break keeps in the glow over the object dimmed, hidden (desktop pieces/d01-2)", () => {
    const cad = figure().command("BREAK").click(p(250, 101)).moveTo(p(450, 101))
    expect(strokesAt(cad, p(100, 100), p(700, 100))).toEqual([faded])
    expect(strokesAt(cad, p(100, 100), p(250, 100))).toEqual([plain, glow])
    expect(strokesAt(cad, p(450, 100), p(700, 100))).toEqual([plain, glow])
    expect(colours(cad)).not.toContain(THEME.gripHot)
    expect(colours(cad)).not.toContain(THEME.entityHover)
  })

  it("follows a cursor off the object at its perpendicular foot, and the click makes it (d01-3)", () => {
    const cad = figure().command("BREAK").click(p(250, 101)).moveTo(p(450, 180))
    expect(strokesAt(cad, p(450, 100), p(700, 100))).toEqual([plain, glow])
    cad.click(p(450, 180))
    expect(lineEnds(cad)).toEqual(["100,100 250,100", "450,100 700,100"])
  })

  it("keeps the piece before alone past the end (d01-4), nothing in the glow where all goes", () => {
    const cad = figure().command("BREAK").click(p(250, 101)).moveTo(p(800, 100))
    expect(strokesAt(cad, p(100, 100), p(250, 100))).toEqual([plain, glow])
    expect(strokesAt(cad, p(250, 100), p(700, 100))).toEqual([])

    const all = figure().command("BREAK").click(p(100, 101)).moveTo(p(800, 100))
    expect(strokesAt(all, p(100, 100), p(700, 100))).toEqual([faded])
    expect(strokesOf(all, "segment")).not.toContainEqual(glow)
  })

  it("draws the object in the glow where the break would do nothing", () => {
    const cad = figure().command("BREAK").click(p(700, 101)).moveTo(p(700, 100))
    expect(strokesAt(cad, p(100, 100), p(700, 100))).toEqual([plain, glow])
    expect(colours(cad)).not.toContain(fadedColor(THEME.entity))
  })

  it("keeps a circle's arc counter-clockwise from the cursor to the pick, and the click makes it (d02-1)", () => {
    const cad = figure().command("BREAK").click(p(930, 250)).moveTo(p(850, 330))
    expect(strokesOf(cad, "circle")).toEqual([faded])
    expect(strokesOf(cad, "arc")).toEqual([plain, glow])
    cad.click(p(850, 330))
    const arc = cad.byId<ArcEntity>("C")
    expect(arc.startAngle).toBeCloseToAngle(deg(90))
    expect(arc.endAngle).toBeCloseToAngle(deg(0))
  })

  it("keeps a closed polyline open from the later point round to the earlier (d03-1, d03-2)", () => {
    for (const cursor of [p(400, 570), p(275, 775)]) {
      const cad = figure().command("BREAK").click(p(275, 501)).moveTo(cursor)
      expect(strokesOf(cad, "path")).toEqual([faded, plain, glow])
      const kept = cad
        .scene()
        .primitives.find(
          (prim) => prim.kind === "path" && prim.stroke?.color === plain.color
        )
      const points = kept?.kind === "path" ? kept.points : []
      expect(points[0]).toBeCloseToPoint(cad.toScreen(cursor), 6)
      expect(points.at(-1)).toBeCloseToPoint(cad.toScreen(p(275, 500)), 6)
    }
  })
})

describe("BREAK's look after First point", () => {
  it("draws the object plain at Specify first break point (desktop pieces/d04-1)", () => {
    const cad = figure()
      .command("BREAK")
      .click(p(250, 101))
      .option("First point")
      .moveTo(p(300, 101))
    expect(strokesAt(cad, p(100, 100), p(700, 100))).toEqual([plain])
    expect(colours(cad)).not.toContain(THEME.selected)
    expect(colours(cad)).not.toContain(THEME.entityHover)
  })

  it("draws the ghost at Specify second break point (d04-2), and the click makes it", () => {
    const cad = figure()
      .command("BREAK")
      .click(p(250, 101))
      .option("First point")
      .click(p(300, 101))
      .moveTo(p(500, 101))
    expect(strokesAt(cad, p(100, 100), p(700, 100))).toEqual([faded])
    expect(strokesAt(cad, p(100, 100), p(300, 100))).toEqual([plain, glow])
    expect(strokesAt(cad, p(500, 100), p(700, 100))).toEqual([plain, glow])
    cad.click(p(500, 101))
    expect(lineEnds(cad)).toEqual(["100,100 300,100", "500,100 700,100"])
  })
})

describe("BREAKATPOINT's look at Specify break point", () => {
  it("draws the object whole in the glow: both pieces kept, no gap (desktop pieces/d14-1)", () => {
    const cad = figure()
      .command("BREAKATPOINT")
      .click(p(250, 101))
      .moveTo(p(450, 85))
    expect(strokesAt(cad, p(100, 100), p(700, 100))).toEqual([plain, glow])
    expect(colours(cad)).not.toContain(fadedColor(THEME.entity))
  })
})

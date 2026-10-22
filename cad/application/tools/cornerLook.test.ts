import { describe, expect, it } from "vitest"
import type { Entity, LineEntity } from "../../domain/entities"
import { DEFAULT_LAYER_COLOR } from "../../domain/layers"
import type { Vec2 } from "../../geometry/Vec2"
import { THEME } from "../../scene/theme"
import type { ScenePrimitive, StrokeStyle } from "../../scene/types"
import { fadedColor } from "../SceneBuilder"
import { type CadHarness, createHarness } from "../../../test/harness"
import {
  arcOf,
  circleOf,
  ellipseOf,
  layerOf,
  lineOf,
  p,
  polylineOf,
  textOf,
} from "../../../test/builders"

// FILLET's and CHAMFER's look on the desktop (AutoCAD 2027, Spanish profile,
// script scripts/research/probes/corners/dsk.sh): the figure of corners/d01–d06
// at 10×, a unit a pixel.
const RED = "#ff0000"
const figure = (): Entity[] => [
  { ...lineOf(p(100, 100), p(700, 100), { id: "H" }), color: RED },
  lineOf(p(500, 0), p(500, 450), { id: "V" }),
  polylineOf([p(750, 50), p(950, 50), p(950, 250), p(850, 350), p(750, 350)], {
    id: "P",
    bulges: [0, 0, 0.4142, 0, 0],
  }),
  ellipseOf(p(250, 350), p(100, 0), 0.4, { id: "E" }),
]

/** The figure, with the commands' radius or distances given first. */
function drawing(
  command: "FILLET" | "CHAMFER",
  values: readonly string[] = [],
  more: Entity[] = []
): CadHarness {
  const cad = createHarness({ entities: [...figure(), ...more] })
  if (values.length > 0) {
    cad.command(command).option(command === "FILLET" ? "Radius" : "Distance")
    for (const value of values) cad.type(value).enter()
    cad.escape()
  }
  return cad
}

/** The figure and a line `K` on a locked layer. */
function withLocked(): CadHarness {
  const cad = createHarness()
  cad.runtime.document.load(
    [
      ...figure(),
      lineOf(p(150, 450), p(350, 450), { id: "K", layerId: "LK" }),
      polylineOf([p(100, 600), p(300, 600), p(300, 700)], {
        id: "KP",
        layerId: "LK",
      }),
    ],
    { layers: [layerOf("0"), layerOf("LK", { locked: true })] }
  )
  return cad
}

const plain = (color = DEFAULT_LAYER_COLOR): StrokeStyle => ({
  color,
  width: 1.25,
})
const faded = (color = DEFAULT_LAYER_COLOR): StrokeStyle => ({
  color: fadedColor(color),
  width: 1.25,
})
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

/** The circle-and-slash's rings beside the cursor. */
function refusedBadges(cad: CadHarness): number {
  return strokesOf(cad, "circle").filter(
    (stroke) => stroke.color === THEME.refusedBadge
  ).length
}

const colours = (cad: CadHarness) =>
  cad
    .scene()
    .primitives.flatMap((prim) =>
      "stroke" in prim && prim.stroke ? [prim.stroke.color] : []
    )

describe("FILLET's and CHAMFER's second prompt ghost", () => {
  it("draws the result in the selection's glow over the lines dimmed, hidden as they are (desktop corners/d01-2)", () => {
    const cad = drawing("FILLET", ["80"])
      .command("FILLET")
      .click(p(200, 101))
      .moveTo(p(501, 350))

    expect(strokesAt(cad, p(100, 100), p(700, 100))).toEqual([faded(RED)])
    expect(strokesAt(cad, p(500, 0), p(500, 450))).toEqual([faded()])
    expect(strokesAt(cad, p(100, 100), p(420, 100))).toEqual([plain(RED), glow])
    expect(strokesAt(cad, p(500, 180), p(500, 450))).toEqual([plain(), glow])
    expect(strokesOf(cad, "arc")).toEqual([plain(), glow])
    expect(colours(cad)).not.toContain(THEME.entityHover)
    expect(refusedBadges(cad)).toBe(0)
  })

  it("follows the cursor to the other side, and commits what it showed (desktop corners/d01-3)", () => {
    const cad = drawing("FILLET", ["80"])
      .command("FILLET")
      .click(p(200, 101))
      .moveTo(p(501, 40))

    expect(strokesAt(cad, p(500, 0), p(500, 20))).toEqual([plain(), glow])
    cad.click(p(501, 40))
    expect(cad.byId<LineEntity>("V").start).toBeCloseToPoint(p(500, 0), 6)
    expect(cad.byId<LineEntity>("V").end).toBeCloseToPoint(p(500, 20), 6)
    expect(cad.byId<LineEntity>("H").end).toBeCloseToPoint(p(420, 100), 6)
  })

  it("draws the first object alone in the glow with the cursor on nothing (desktop corners/d01-4)", () => {
    const cad = drawing("FILLET", ["80"])
      .command("FILLET")
      .click(p(200, 101))
      .moveTo(p(600, 300))

    expect(strokesAt(cad, p(100, 100), p(700, 100))).toEqual([
      plain(RED),
      plain(RED),
      glow,
    ])
    expect(strokesAt(cad, p(500, 0), p(500, 450))).toEqual([plain()])
    expect(colours(cad)).not.toContain(fadedColor(RED))
  })

  it("draws Shift's sharp corner in the glow, no arc (desktop corners/d02-1)", () => {
    const cad = drawing("FILLET", ["80"])
      .command("FILLET")
      .click(p(200, 101))
      .moveTo(p(501, 350), { shiftKey: true })

    expect(strokesAt(cad, p(100, 100), p(500, 100))).toEqual([plain(RED), glow])
    expect(strokesAt(cad, p(500, 100), p(500, 450))).toEqual([plain(), glow])
    expect(strokesAt(cad, p(100, 100), p(700, 100))).toEqual([faded(RED)])
    expect(strokesOf(cad, "arc")).toEqual([])
  })

  it("draws again at a radius given at the second prompt, before the cursor moves", () => {
    const cad = drawing("FILLET", ["80"])
      .command("FILLET")
      .click(p(200, 101))
      .moveTo(p(501, 350))
      .option("Radius")
      .type("0")
      .enter()

    expect(strokesOf(cad, "arc")).toEqual([])
    expect(strokesAt(cad, p(500, 100), p(500, 450))).toEqual([plain(), glow])
  })

  it("draws CHAMFER's bevel and Shift's corner the same way (desktop corners/d03-1, d03-2)", () => {
    const cad = drawing("CHAMFER", ["80", "50"])
      .command("CHAMFER")
      .click(p(200, 101))
      .moveTo(p(501, 350))

    expect(strokesAt(cad, p(100, 100), p(700, 100))).toEqual([faded(RED)])
    expect(strokesAt(cad, p(100, 100), p(420, 100))).toEqual([plain(RED), glow])
    expect(strokesAt(cad, p(500, 150), p(500, 450))).toEqual([plain(), glow])
    expect(strokesAt(cad, p(420, 100), p(500, 150))).toEqual([plain(), glow])

    cad.moveTo(p(501, 351), { shiftKey: true })
    expect(strokesAt(cad, p(100, 100), p(500, 100))).toEqual([plain(RED), glow])
    expect(strokesAt(cad, p(420, 100), p(500, 150))).toEqual([])
  })

  it("draws the joined polyline whole in the glow over the line and the polyline dimmed (desktop corners/d06-2)", () => {
    const cad = drawing("FILLET", ["80"])
      .command("FILLET")
      .click(p(300, 101))
      .moveTo(p(951, 150))

    expect(strokesAt(cad, p(100, 100), p(700, 100))).toEqual([faded(RED)])
    expect(strokesOf(cad, "path")).toEqual([faded(), plain(), glow])
    expect(refusedBadges(cad)).toBe(0)
  })

  it("leaves a circle as it is: never trimmed, neither hidden, dimmed nor in the glow", () => {
    const cad = createHarness({
      entities: [
        lineOf(p(0, 0), p(200, 0), { id: "L" }),
        circleOf(p(100, 50), 30, { id: "C" }),
      ],
    })
    cad.command("FILLET").option("Radius").type("20").enter()
    cad.click(p(20, 1)).moveTo(p(71, 50))

    expect(strokesOf(cad, "circle")).toEqual([plain()])
    expect(strokesAt(cad, p(0, 0), p(200, 0))).toEqual([faded()])
    expect(strokesAt(cad, p(0, 0), p(60, 0))).toEqual([plain(), glow])
    expect(strokesOf(cad, "arc")).toEqual([plain(), glow])
  })
})

// Desktop corners/d06-1: the circle-and-slash beside the pick box, the first
// object alone in the glow, the other drawn as it is.
describe("FILLET's and CHAMFER's refusal at the cursor", () => {
  it("shows the circle-and-slash over a second object that makes no corner (desktop corners/d06-1)", () => {
    const cad = drawing("FILLET", ["80"])
      .command("FILLET")
      .click(p(300, 101))
      .moveTo(p(850, 51))

    expect(refusedBadges(cad)).toBe(1)
    expect(strokesAt(cad, p(100, 100), p(700, 100))).toEqual([
      plain(RED),
      plain(RED),
      glow,
    ])
    expect(strokesOf(cad, "path")).toEqual([plain()])
    cad.moveTo(p(600, 300))
    expect(refusedBadges(cad)).toBe(0)
  })

  it("shows it over the first object again and over a type the command refuses", () => {
    const fillet = drawing("FILLET", [], [textOf(p(100, 500), "WALL")])
      .command("FILLET")
      .click(p(200, 101))
      .moveTo(p(300, 101))
    expect(refusedBadges(fillet)).toBe(1)
    fillet.moveTo(p(110, 503))
    expect(refusedBadges(fillet)).toBe(1)

    const chamfer = drawing("CHAMFER", [], [arcOf(p(0, 600), 50, 0, Math.PI)])
      .command("CHAMFER")
      .click(p(200, 101))
      .moveTo(p(50, 601))
    expect(refusedBadges(chamfer)).toBe(1)
    expect(chamfer.commandLog()).not.toContain(
      "Chamfer requires 2 lines (not arc segments)."
    )
  })

  it("shows it over a pair too far for the radius, and says so only at the click", () => {
    const cad = drawing("FILLET", ["400"])
      .command("FILLET")
      .click(p(200, 101))
      .moveTo(p(501, 40))

    expect(refusedBadges(cad)).toBe(1)
    expect(cad.commandLog()).not.toContain("Fillet radius is too large")
    cad.click(p(501, 40))
    expect(cad.commandLog()).toContain("Fillet radius is too large")
  })
})

describe("FILLET's and CHAMFER's first prompt rollover", () => {
  it("draws the segment a pick on a polyline takes, not the polyline (desktop corners/d04-2)", () => {
    for (const command of ["FILLET", "CHAMFER"] as const) {
      const cad = drawing(command).command(command).moveTo(p(951, 150))
      const rolled = cad
        .scene()
        .primitives.filter(
          (prim) =>
            prim.kind === "path" && prim.stroke?.color === THEME.entityHover
        )
      expect(rolled, command).toHaveLength(1)
      const points = rolled[0].kind === "path" ? rolled[0].points : []
      expect(points.map((q) => q.x)).toEqual(
        [p(950, 50), p(950, 250)].map((q) => cad.toScreen(q).x)
      )
    }
  })

  it("draws an ellipse the command takes (desktop corners/d04-3), nothing over a type it refuses", () => {
    for (const command of ["FILLET", "CHAMFER"] as const) {
      const cad = drawing(
        command,
        [],
        [textOf(p(100, 500), "WALL"), arcOf(p(0, 600), 50, 0, Math.PI)]
      )
        .command(command)
        .moveTo(p(250, 391))
      expect(strokesOf(cad, "ellipse"), command).toContainEqual(rollover)
      cad.moveTo(p(110, 503))
      expect(colours(cad), command).not.toContain(THEME.entityHover)
    }
    const chamfer = drawing("CHAMFER", [], [arcOf(p(0, 600), 50, 0, Math.PI)])
      .command("CHAMFER")
      .moveTo(p(50, 601))
    expect(colours(chamfer)).not.toContain(THEME.entityHover)
  })
})

// Desktop corners/d04-4: a locked object gets no rollover (its padlock and
// LAYLOCKFADECTL's fade are the Properties review's, CORNERS-D61).
describe("FILLET and CHAMFER over an object on a locked layer", () => {
  it("draw no rollover at the first prompt", () => {
    for (const command of ["FILLET", "CHAMFER"]) {
      const cad = withLocked().command(command).moveTo(p(250, 451))
      expect(colours(cad), command).not.toContain(THEME.entityHover)
      expect(colours(cad), command).not.toContain(THEME.selected)
    }
  })

  it("draw no ghost and no badge at the second prompt: the first object alone in the glow", () => {
    for (const command of ["FILLET", "CHAMFER"]) {
      const cad = withLocked()
        .command(command)
        .click(p(200, 101))
        .moveTo(p(250, 451))
      expect(strokesAt(cad, p(150, 450), p(350, 450)), command).toEqual([
        plain(),
      ])
      expect(strokesOf(cad, "segment"), command).toContainEqual(glow)
      expect(refusedBadges(cad), command).toBe(0)
    }
  })

  it("draw nothing over it at Polyline's prompt", () => {
    for (const command of ["FILLET", "CHAMFER"]) {
      const cad = withLocked()
        .command(command)
        .option("Polyline")
        .moveTo(p(200, 601))
      expect(colours(cad), command).not.toContain(THEME.selected)
    }
  })
})

describe("FILLET's and CHAMFER's Polyline prompt", () => {
  it("draws every corner as it would be cut, in the glow, over the polyline dimmed (desktop corners/d05-1)", () => {
    for (const [command, values] of [
      ["FILLET", ["80"]],
      ["CHAMFER", ["30", "30"]],
    ] as const) {
      const cad = drawing(command, values)
        .command(command)
        .option("Polyline")
        .moveTo(p(951, 150))
      expect(strokesOf(cad, "path"), command).toEqual([faded(), plain(), glow])
      cad.click(p(951, 150))
      expect(cad.byId("P"), command).not.toEqual(
        figure().find((entity) => entity.id === "P")
      )
    }
  })

  it("draws nothing over anything but a polyline (desktop corners/d05-2)", () => {
    const cad = drawing("FILLET", ["80"])
      .command("FILLET")
      .option("Polyline")
      .moveTo(p(300, 101))
    expect(colours(cad)).not.toContain(THEME.selected)
    expect(colours(cad)).not.toContain(THEME.entityHover)
    expect(refusedBadges(cad)).toBe(0)
  })
})

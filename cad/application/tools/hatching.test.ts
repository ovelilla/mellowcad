import { describe, expect, it } from "vitest"
import { V } from "../../geometry/Vec2"
import {
  HatchEntity,
  createHatch,
  hatchGeometry,
  hatchLoopFromEntity,
  mirrorEntity,
  pointInsideHatch,
  translateEntity,
} from "../../domain/entities"
import {
  DEFAULT_HATCH_PATTERN_ID,
  SOLID_HATCH_PATTERN_ID,
} from "../../domain/hatchPatterns"
import {
  parseDrawingFile,
  serializeDrawing,
} from "../../serialization/drawingFile"
import { THEME } from "../../scene/theme"
import {
  circleOf,
  deg,
  lineOf,
  loopOf,
  p,
  rectOf,
} from "../../../test/builders"
import { createHarness } from "../../../test/harness"
import { es } from "../../locales/es"

/** The square boundary most of these tests hatch. */
const SQUARE = rectOf(p(0, 0), p(100, 100), { id: "sq" })

function hatchOnly(entities: readonly { type: string }[]): HatchEntity {
  const hatch = entities.find((e) => e.type === "hatch")
  expect(hatch).toBeDefined()
  return hatch as unknown as HatchEntity
}

/** Four separate lines drawn corner to corner: an area nothing encloses alone. */
function looseSquare(min: number, max: number) {
  return [
    lineOf(p(min, min), p(max, min)),
    lineOf(p(max, min), p(max, max)),
    lineOf(p(max, max), p(min, max)),
    lineOf(p(min, max), p(min, min)),
  ]
}

describe("HATCH boundary by Pick internal point", () => {
  it("is the prompt the command opens with", () => {
    const h = createHarness({ entities: [SQUARE] })
    h.command("HATCH")

    expect(h.optionAbbreviations()).toEqual(["P", "S"])
  })

  it("fills an area enclosed by loose lines", () => {
    const h = createHarness({ entities: looseSquare(0, 100) })
    h.command("HATCH").click(p(50, 50)).enter()

    const hatch = hatchOnly(h.entities())
    expect(hatch.loops).toHaveLength(1)
    expect(hatch.loops[0].vertices).toHaveLength(4)
    expect(hatchGeometry(hatch).lines.length).toBeGreaterThan(0)
    expect(h.activeToolId()).toBe("select")
  })

  it("leaves an enclosed island unfilled", () => {
    const h = createHarness({
      entities: [...looseSquare(0, 100), ...looseSquare(40, 60)],
    })
    h.command("HATCH").click(p(10, 10)).enter()

    const hatch = hatchOnly(h.entities())
    expect(hatch.loops).toHaveLength(2)
    expect(pointInsideHatch(hatch, p(10, 10))).toBe(true)
    expect(pointInsideHatch(hatch, p(50, 50))).toBe(false)
  })

  it("makes one hatch out of several internal points", () => {
    const h = createHarness({
      entities: [...looseSquare(0, 100), ...looseSquare(200, 300)],
    })
    h.command("HATCH").click(p(50, 50)).click(p(250, 250)).enter()

    expect(h.typeCounts().hatch).toBe(1)
    expect(hatchOnly(h.entities()).loops).toHaveLength(2)
  })

  it("takes a typed coordinate as the internal point", () => {
    const h = createHarness({ entities: looseSquare(0, 100) })
    h.command("HATCH").type("50,50").enter().enter()

    expect(hatchOnly(h.entities()).loops).toHaveLength(1)
  })

  it("says so when the point is not enclosed, and keeps prompting", () => {
    const h = createHarness({ entities: looseSquare(0, 100) })
    h.command("HATCH").click(p(300, 300))

    expect(h.commandLog()).toContain("Valid hatch boundary not found.")
    expect(h.activeToolId()).toBe("hatch")
    expect(h.typeCounts().hatch).toBeUndefined()
  })

  it("only traces what is visible, as AutoCAD's boundary set does", () => {
    // The default 1000×800 viewport shows x/y within ±500/±400 at scale 1.
    const h = createHarness({ entities: looseSquare(2000, 2100) })
    h.command("HATCH").click(p(2050, 2050))

    expect(h.commandLog()).toContain("Valid hatch boundary not found.")
  })

  it("previews the fill as soon as an area is picked", () => {
    const h = createHarness({ entities: looseSquare(0, 100) })
    const previews = () =>
      h.scene().primitives.filter((prim) => {
        const stroke = "stroke" in prim ? prim.stroke : undefined
        return stroke?.color === THEME.preview
      }).length

    h.command("HATCH")
    expect(previews()).toBe(0)
    h.click(p(50, 50))
    expect(previews()).toBeGreaterThan(0)
  })

  it("ends without creating anything when nothing was picked", () => {
    const h = createHarness({ entities: looseSquare(0, 100) })
    h.command("HATCH").enter()

    expect(h.typeCounts().hatch).toBeUndefined()
    expect(h.activeToolId()).toBe("select")
  })

  it("undoes the whole hatch in one step", () => {
    const h = createHarness({ entities: looseSquare(0, 100) })
    h.command("HATCH").click(p(50, 50)).enter()
    h.undo()

    expect(h.typeCounts().hatch).toBeUndefined()
    expect(h.typeCounts().line).toBe(4)
  })
})

// AutoCAD 2023's console (acc/h1–h23 of 2026-10-14): -HATCH declares Undo at
// its internal point (table 25032) without listing it.
describe("HATCH's unlisted Undo", () => {
  const SMALL = rectOf(p(200, 0), p(250, 50), { id: "small" })
  const typed = (h: ReturnType<typeof createHarness>, ...texts: string[]) => {
    for (const text of texts) {
      h.runtime.setCommandLineText(text)
      h.runtime.submitCommandLine()
    }
    return h
  }
  const filled = (h: ReturnType<typeof createHarness>) => {
    const hatch = hatchOnly(h.entities())
    return [p(50, 50), p(225, 25)].map((at) => pointInsideHatch(hatch, at))
  }

  it("takes back the last internal point's boundary, silently", () => {
    const h = typed(
      createHarness({ entities: [SQUARE, SMALL] }),
      "HATCH",
      "50,50",
      "225,25",
      "U"
    )
    expect(h.commandLog().slice(-2)).toEqual([
      "Specify internal point or [Properties/Select objects]: U",
      "Current hatch pattern:  ANSI31",
    ])
    typed(h, "UNDO", "U")
    expect(h.commandLog().slice(-3)).toEqual([
      "Specify internal point or [Properties/Select objects]: U",
      "No boundary to Undo.",
      "Current hatch pattern:  ANSI31",
    ])
    typed(h, "225,25", "")
    expect(filled(h)).toEqual([false, true])
  })

  it("leaves what Select objects took", () => {
    const window = ["S", "W", "190,-10", "260,60", ""]
    const picked = typed(
      createHarness({ entities: [SQUARE, SMALL] }),
      "HATCH",
      "50,50",
      ...window,
      "U",
      ""
    )
    expect(filled(picked)).toEqual([false, true])

    const selected = typed(
      createHarness({ entities: [SQUARE, SMALL] }),
      "HATCH",
      ...window,
      "U"
    )
    expect(selected.commandLog().at(-2)).toBe("No boundary to Undo.")
    typed(selected, "")
    expect(filled(selected)).toEqual([false, true])
  })

  it("refuses anything else, and is answered in Autodesk's Spanish", () => {
    const h = typed(createHarness({ entities: [SQUARE] }), "HATCH", "FOO")
    expect(h.commandLog().slice(-2)).toEqual([
      "Specify internal point or [Properties/Select objects]: FOO",
      "2D point or option keyword required.",
    ])

    const spanish = typed(
      createHarness({ locale: es, entities: [SQUARE, SMALL] }),
      "SOMBREA",
      "50,50",
      "H",
      "DESHACER",
      "FOO"
    )
    expect(spanish.commandLog().slice(-5)).toEqual([
      "Precise punto interno o [Propiedades/Designar objetos]: DESHACER",
      "Ningún contorno por deshacer.",
      "Patrón de sombreado actual:  ANSI31",
      "Precise punto interno o [Propiedades/Designar objetos]: FOO",
      "Se requiere un punto 2D o una opción.",
    ])
  })
})

describe("HATCH boundary by Select objects", () => {
  it("fills one selected closed polyline with the default pattern", () => {
    const h = createHarness({ entities: [SQUARE] })
    h.command("HATCH").option("Select objects").click(p(50, 0)).enter().enter()

    const hatch = hatchOnly(h.entities())
    expect(hatch.loops).toHaveLength(1)
    expect(hatch.loops[0].vertices).toBeCloseToPoints(SQUARE.vertices)
    // HPNAME / HPSCALE / HPANG initial values.
    expect(hatch.patternId).toBe(DEFAULT_HATCH_PATTERN_ID)
    expect(hatch.patternScale).toBe(1)
    expect(hatch.patternAngle).toBe(0)
    expect(h.activeToolId()).toBe("select")
  })

  it("turns a circle into a two-vertex loop of semicircle bulges", () => {
    const h = createHarness({ entities: [circleOf(p(0, 0), 50, { id: "c" })] })
    h.command("HATCH").option("Select objects").click(p(50, 0)).enter().enter()

    const hatch = hatchOnly(h.entities())
    expect(hatch.loops[0].vertices).toBeCloseToPoints([p(50, 0), p(-50, 0)])
    expect(hatch.loops[0].bulges).toEqual([1, 1])
    // The ring closes: its extent is the whole circle, not just the top half.
    const ring = hatchGeometry(hatch).rings[0]
    const ys = ring.map((v) => v.y)
    expect(Math.min(...ys)).toBeCloseTo(-50, 1)
    expect(Math.max(...ys)).toBeCloseTo(50, 1)
  })

  it("makes one hatch out of several boundaries (HPSEPARATE 0)", () => {
    const h = createHarness({
      entities: [SQUARE, rectOf(p(200, 0), p(300, 100), { id: "sq2" })],
    })
    h.command("HATCH")
      .option("Select objects")
      .click(p(50, 0))
      .click(p(250, 0))
      .enter()
      .enter()

    expect(h.typeCounts().hatch).toBe(1)
    expect(hatchOnly(h.entities()).loops).toHaveLength(2)
  })

  it("picks boundaries with a crossing box too", () => {
    const h = createHarness({
      entities: [SQUARE, rectOf(p(200, 0), p(300, 100), { id: "sq2" })],
    })
    h.command("HATCH")
      .option("Select objects")
      .drag(p(400, 50), p(-50, 50))
      .enter()
      .enter()

    expect(hatchOnly(h.entities()).loops).toHaveLength(2)
  })

  it("ignores objects that do not close an area", () => {
    const h = createHarness({ entities: [lineOf(p(0, 0), p(100, 0))] })
    h.command("HATCH").option("Select objects").click(p(50, 0)).enter().enter()

    expect(h.typeCounts().hatch).toBeUndefined()
    expect(h.activeToolId()).toBe("select")
  })

  it("only rolls over objects it can hatch", () => {
    const h = createHarness({
      entities: [SQUARE, lineOf(p(0, 200), p(100, 200), { id: "l" })],
    })
    h.command("HATCH").option("Select objects")
    const hovers = () =>
      h.scene().primitives.filter((prim) => {
        const stroke = "stroke" in prim ? prim.stroke : undefined
        return stroke?.color === THEME.entityHover
      }).length

    h.moveTo(p(50, 200))
    expect(hovers()).toBe(0)
    h.moveTo(p(50, 0))
    expect(hovers()).toBeGreaterThan(0)
  })

  it("previews the fill while the boundary set is being built", () => {
    const h = createHarness({ entities: [SQUARE] })
    h.command("HATCH").option("Select objects")
    const previews = () =>
      h.scene().primitives.filter((prim) => {
        const stroke = "stroke" in prim ? prim.stroke : undefined
        return stroke?.color === THEME.preview
      }).length

    expect(previews()).toBe(0)
    h.click(p(50, 0))
    expect(previews()).toBeGreaterThan(0)
  })

  it("stays behind its boundary (HPDRAWORDER 3), for the eye and for the pick", () => {
    const h = createHarness({ entities: [SQUARE] })
    h.command("HATCH").option("Properties").type("SOLID").enter()
    h.option("Select objects").click(p(50, 0)).enter().enter()

    // Painted first, so the fill never covers the outline it was traced from.
    const kinds = h.scene().primitives.map((prim) => prim.kind)
    expect(kinds.indexOf("path")).toBeLessThan(kinds.lastIndexOf("path"))
    const filled = h
      .scene()
      .primitives.findIndex((prim) => prim.kind === "path" && prim.fill)
    const outline = h
      .scene()
      .primitives.findIndex((prim) => prim.kind === "path" && !prim.fill)
    expect(filled).toBeLessThan(outline)

    // And a click on the boundary still takes the boundary, not the fill.
    h.click(p(50, 0))
    expect(h.selectedIds()).toEqual(["sq"])
  })

  it("undoes the whole hatch in one step", () => {
    const h = createHarness({ entities: [SQUARE] })
    h.command("HATCH").option("Select objects").click(p(50, 0)).enter().enter()
    expect(h.typeCounts().hatch).toBe(1)

    h.undo()
    expect(h.typeCounts().hatch).toBeUndefined()
    expect(h.typeCounts().polyline).toBe(1)
  })

  it("creates nothing when Escape ends the command", () => {
    const h = createHarness({ entities: [SQUARE] })
    h.command("HATCH").option("Select objects").click(p(50, 0)).escape()

    expect(h.typeCounts().hatch).toBeUndefined()
    expect(h.activeToolId()).toBe("select")
  })
})

describe("HATCH Properties", () => {
  it("asks -HATCH's questions and writes them answered", () => {
    const h = createHarness({ entities: [SQUARE] })
    h.command("HATCH")
    expect(h.commandLog().at(-1)).toBe("Current hatch pattern:  ANSI31")
    expect(h.state().commandLine.prompt).toBe(
      "HATCH Specify internal point or [Properties/Select objects]:"
    )
    h.option("Properties")
    expect(h.state().commandLine.prompt).toBe(
      "HATCH Enter a pattern name or [?/Solid] <ANSI31>:"
    )
    h.enter()
    expect(h.state().commandLine.prompt).toBe(
      "HATCH Specify a scale for the pattern <1.00>:"
    )
    h.type("0").enter().type("2").enter()
    expect(h.state().commandLine.prompt).toBe(
      "HATCH Specify an angle for the pattern <0>:"
    )
    h.type("45").enter().click(p(50, 50))
    h.option("Select objects")
    expect(h.state().commandLine.prompt).toBe("HATCH Select objects:")
    h.enter().enter()

    expect(h.commandLog()).toEqual([
      "HATCH",
      "Current hatch pattern:  ANSI31",
      "Specify internal point or [Properties/Select objects]: P",
      "Enter a pattern name or [?/Solid] <ANSI31>:",
      "Specify a scale for the pattern <1.00>: 0",
      "Value must be positive and nonzero.",
      "Specify a scale for the pattern <1.00>: 2",
      "Specify an angle for the pattern <0>: 45",
      "Current hatch pattern:  ANSI31",
      "Specify internal point or [Properties/Select objects]:",
      "Selecting everything...",
      "Selecting everything visible...",
      "Analyzing the selected data...",
      "Analyzing internal islands...",
      "Current hatch pattern:  ANSI31",
      "Specify internal point or [Properties/Select objects]: S",
      "Select objects:",
      "Current hatch pattern:  ANSI31",
      "Specify internal point or [Properties/Select objects]:",
    ])
    expect(hatchOnly(h.entities()).patternScale).toBe(2)
  })

  it("asks in the words of Autodesk's Spanish table", () => {
    const h = createHarness({ locale: es, entities: [SQUARE] })
    h.command("SOMBREA")
    expect(h.commandLog().at(-1)).toBe("Patrón de sombreado actual:  ANSI31")
    expect(h.state().commandLine.prompt).toBe(
      "SOMBREA Precise punto interno o [Propiedades/Designar objetos]:"
    )
    h.option("Properties")
    expect(h.state().commandLine.prompt).toBe(
      "SOMBREA Indique nombre de patrón o [?/Sólido] <ANSI31>:"
    )
    h.type("NADA").enter()
    expect(h.commandLog().at(-1)).toBe("Nombre de patrón desconocido.")
    h.enter()
    expect(h.state().commandLine.prompt).toBe(
      "SOMBREA Precise escala del patrón <1.00>:"
    )
    h.enter()
    expect(h.state().commandLine.prompt).toBe(
      "SOMBREA Precise ángulo del patrón <0>:"
    )
    h.enter().click(p(50, 50))
    expect(h.commandLog().slice(-5)).toEqual([
      "Seleccionándolo todo...",
      "Designando todo lo visible...",
      "Analizando los datos designados...",
      "Analizando islas internas...",
      "Patrón de sombreado actual:  ANSI31",
    ])
    h.option("Properties").option("Solid").option("Properties")
    expect(h.state().commandLine.prompt).toBe(
      "SOMBREA Indique nombre de patrón o [?/Sólido] <Sólido>:"
    )
  })

  it("takes Solid by its keyword and offers it back as the keyword", () => {
    const h = createHarness({ entities: [SQUARE] })
    h.command("HATCH").option("Properties").option("Solid")
    h.command("HATCH").option("Properties")
    expect(h.state().commandLine.prompt).toBe(
      "HATCH Enter a pattern name or [?/Solid] <Solid>:"
    )
  })

  it("skips the scale and angle prompts for a solid fill", () => {
    const h = createHarness({ entities: [SQUARE] })
    h.command("HATCH").option("Properties").type("SOLID").enter()

    // Back at the internal point, its keywords offered again.
    expect(h.optionAbbreviations()).toEqual(["P", "S"])

    h.option("Select objects").click(p(50, 0)).enter().enter()
    const hatch = hatchOnly(h.entities())
    expect(hatch.patternId).toBe(SOLID_HATCH_PATTERN_ID)
    expect(hatchGeometry(hatch).solid).toBe(true)
  })

  it("asks for a scale then an angle for a real pattern", () => {
    const h = createHarness({ entities: [SQUARE] })
    h.command("HATCH").option("Properties").type("ANSI31").enter()
    expect(h.state().dynamicInput?.fields[0].label).toBe(
      "Specify a scale for the pattern"
    )

    h.type("20").enter()
    expect(h.state().dynamicInput?.fields[0].label).toBe(
      "Specify an angle for the pattern"
    )

    h.type("30").enter().option("Select objects").click(p(50, 0))
    h.enter().enter()
    const hatch = hatchOnly(h.entities())
    expect(hatch.patternScale).toBe(20)
    expect(hatch.patternAngle).toBeCloseToAngle(deg(30))
  })

  it("keeps the settings for the next hatch in the drawing (HPNAME/HPSCALE/HPANG, rectang/p303)", () => {
    const h = createHarness({
      entities: [SQUARE, rectOf(p(200, 0), p(300, 100), { id: "sq2" })],
    })
    h.command("HATCH")
      .option("Properties")
      .type("ANSI31")
      .enter()
      .type("20")
      .enter()
      .type("0")
      .enter()
      .option("Select objects")
      .click(p(50, 0))
      .enter()
      .enter()

    h.command("HATCH").option("Select objects").click(p(250, 0)).enter().enter()
    const hatches = h.entities().filter((e) => e.type === "hatch")
    expect(hatches).toHaveLength(2)
    expect((hatches[1] as HatchEntity).patternScale).toBe(20)
  })

  it("re-asks and reports an unknown pattern name", () => {
    const h = createHarness({ entities: [SQUARE] })
    h.command("HATCH").option("Properties").type("NOPE").enter()

    expect(h.commandLog().slice(-2)).toEqual([
      "Enter a pattern name or [?/Solid] <ANSI31>: NOPE",
      "Unknown pattern name.",
    ])
    expect(h.state().dynamicInput?.fields[0].label).toBe("Enter a pattern name")
  })

  it("lists the patterns for ?", () => {
    const h = createHarness({ entities: [SQUARE] })
    h.command("HATCH").option("Properties").type("?").enter()

    expect(h.commandLog().some((line) => line.includes("ANSI31"))).toBe(true)
    expect(h.state().dynamicInput?.fields[0].label).toBe("Enter a pattern name")
  })
})

describe("hatch pattern geometry", () => {
  const hatchAt = (
    scale: number,
    angle = 0,
    loops = [loopOf(p(0, 0), p(100, 100))]
  ) =>
    hatchGeometry(
      createHatch(loops, { patternScale: scale, patternAngle: angle })
    )

  it("draws ANSI31 as a family of 45° lines spaced by 0.125 × the scale", () => {
    const g = hatchAt(20)
    expect(g.solid).toBe(false)
    expect(g.lines.length).toBeGreaterThan(10)

    for (const [a, b] of g.lines) {
      const dir = V.normalize(V.sub(b, a))
      expect(Math.abs(dir.x - dir.y)).toBeLessThan(1e-9) // 45°
      for (const point of [a, b]) {
        expect(point.x).toBeGreaterThanOrEqual(-1e-9)
        expect(point.x).toBeLessThanOrEqual(100 + 1e-9)
        expect(point.y).toBeGreaterThanOrEqual(-1e-9)
        expect(point.y).toBeLessThanOrEqual(100 + 1e-9)
      }
    }

    // Perpendicular spacing between neighbouring lines = 0.125 × 20.
    const normal = { x: -Math.SQRT1_2, y: Math.SQRT1_2 }
    const offsets = g.lines.map(([a]) => V.dot(a, normal)).sort((x, y) => x - y)
    const gaps = offsets
      .slice(1)
      .map((value, i) => value - offsets[i])
      .filter((gap) => gap > 1e-6)
    expect(Math.min(...gaps)).toBeCloseTo(2.5, 6)
  })

  it("halving the scale doubles the number of lines", () => {
    expect(hatchAt(10).lines.length).toBeGreaterThan(
      hatchAt(20).lines.length * 1.8
    )
  })

  it("rotates the whole family with HPANG", () => {
    for (const [a, b] of hatchAt(20, deg(45)).lines) {
      const dir = V.normalize(V.sub(b, a))
      // 45° pattern line + 45° HPANG = vertical.
      expect(Math.abs(dir.x)).toBeLessThan(1e-9)
    }
  })

  it("leaves an island unfilled (the even-odd rule)", () => {
    const g = hatchAt(20, 0, [
      loopOf(p(0, 0), p(100, 100)),
      loopOf(p(40, 40), p(60, 60)),
    ])
    for (const [a, b] of g.lines) {
      for (const t of [0, 0.25, 0.5, 0.75, 1]) {
        const point = V.lerp(a, b, t)
        const insideHole =
          point.x > 40 + 1e-6 &&
          point.x < 60 - 1e-6 &&
          point.y > 40 + 1e-6 &&
          point.y < 60 - 1e-6
        expect(insideHole).toBe(false)
      }
    }
  })

  it("reports a solid fill with no line work", () => {
    const g = hatchGeometry(
      createHatch([loopOf(p(0, 0), p(10, 10))], {
        patternId: SOLID_HATCH_PATTERN_ID,
      })
    )
    expect(g.solid).toBe(true)
    expect(g.lines).toHaveLength(0)
    expect(g.rings[0]).toHaveLength(4)
  })

  it("gives up past the line budget instead of generating forever", () => {
    // 0.125 × 0.0005 spacing over a 100-unit square: far past HPMAXLINES.
    const g = hatchAt(0.0005)
    expect(g.truncated).toBe(true)
  })

  it("refuses to create a hatch that is too dense, and says so", () => {
    const h = createHarness({ entities: [SQUARE] })
    h.command("HATCH")
      .option("Properties")
      .type("ANSI31")
      .enter()
      .type("0.0005")
      .enter()
      .type("0")
      .enter()
      .option("Select objects")
      .click(p(50, 0))
      .enter()
      .enter()

    expect(h.typeCounts().hatch).toBeUndefined()
    expect(h.commandLog().some((line) => line.includes("too dense"))).toBe(true)
  })
})

describe("hatch as an object", () => {
  it("picks anywhere inside the area, not just on its boundary", () => {
    const h = createHarness({ entities: [SQUARE] })
    h.command("HATCH").option("Select objects").click(p(50, 0)).enter().enter()
    const hatch = hatchOnly(h.entities())

    // The command has already dropped back to Select.
    h.click(p(50, 50))
    expect(h.selectedIds()).toContain(hatch.id)
  })

  it("carries its pattern origin along when it moves", () => {
    const hatch = createHatch([loopOf(p(0, 0), p(10, 10))])
    const moved = translateEntity(hatch, p(5, 7)) as HatchEntity
    expect(moved.origin).toBeCloseToPoint(p(5, 7))
  })

  it("flips its bulges and pattern angle when mirrored", () => {
    const loop = hatchLoopFromEntity(circleOf(p(0, 0), 10))!
    const hatch = createHatch([loop], { patternAngle: deg(30) })
    const flipped = mirrorEntity(hatch, p(0, 0), p(1, 0)) as HatchEntity
    expect(flipped.loops[0].bulges).toEqual([-1, -1])
    expect(flipped.patternAngle).toBeCloseToAngle(deg(-30))
  })

  it("survives a save and reload", () => {
    const h = createHarness({ entities: [SQUARE] })
    h.command("HATCH")
      .option("Properties")
      .type("ANSI31")
      .enter()
      .type("20")
      .enter()
      .type("30")
      .enter()
      .option("Select objects")
      .click(p(50, 0))
      .enter()
      .enter()

    const parsed = parseDrawingFile(
      serializeDrawing({
        settings: h.runtime.document.getSettings(),
        layers: h.runtime.document.getLayers(),
        currentLayerId: h.runtime.document.getCurrentLayerId(),
        textStyles: h.runtime.document.getTextStyles(),
        currentTextStyleId: h.runtime.document.getCurrentTextStyleId(),
        dimStyles: h.runtime.document.getDimStyles(),
        currentDimStyleId: h.runtime.document.getCurrentDimStyleId(),
        blocks: h.runtime.document.getBlocks(),
        entities: h.entities(),
      })
    )
    const reloaded = hatchOnly(parsed.entities)
    expect(reloaded.patternScale).toBe(20)
    expect(reloaded.patternAngle).toBeCloseToAngle(deg(30))
    expect(reloaded.loops[0].vertices).toBeCloseToPoints(SQUARE.vertices)
  })

  it("shows its pattern in the Properties palette, scale and angle editable", () => {
    const h = createHarness({ entities: [SQUARE] })
    h.command("HATCH").option("Select objects").click(p(50, 0)).enter().enter()
    h.click(p(50, 50))

    const rows = h.state().properties.info?.groups[0].rows ?? []
    expect(h.state().properties.info?.title).toBe("Hatch")
    expect(rows.find((row) => row.label === "Pattern")?.value).toBe("ANSI31")
    expect(rows.find((row) => row.label === "Scale")?.edit?.property).toBe(
      "patternScale"
    )
    expect(rows.find((row) => row.label === "Angle")?.edit?.property).toBe(
      "patternAngle"
    )
  })
})

describe("hatch in the scene", () => {
  it("draws a solid fill as one filled path with the islands as subpaths", () => {
    const h = createHarness({
      entities: [
        createHatch(
          [loopOf(p(0, 0), p(100, 100)), loopOf(p(40, 40), p(60, 60))],
          {
            patternId: SOLID_HATCH_PATTERN_ID,
          }
        ),
      ],
    })
    // Away from the fill: hovering it would add a rollover preview of the very
    // path being counted.
    h.moveTo(p(400, 400))
    const paths = h
      .scene()
      .primitives.filter((prim) => prim.kind === "path" && prim.fill)
    expect(paths).toHaveLength(1)
    expect(paths[0].kind === "path" && paths[0].subpaths).toHaveLength(1)
  })

  it("draws a pattern as ordinary segments, so nothing downstream needs a clip", () => {
    const h = createHarness({
      entities: [
        createHatch([loopOf(p(0, 0), p(100, 100))], { patternScale: 20 }),
      ],
    })
    const segments = h
      .scene()
      .primitives.filter((prim) => prim.kind === "segment")
    expect(segments.length).toBeGreaterThan(10)
    expect(
      h.scene().primitives.some((prim) => prim.kind === "path" && prim.fill)
    ).toBe(false)
  })
})

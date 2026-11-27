import { readFileSync } from "node:fs"
import { gunzipSync } from "node:zlib"
import { describe, expect, it } from "vitest"
import { createHarness, type CadHarness } from "../../test/harness"
import { hatchOf, loopOf, p } from "../../test/builders"
import type { HatchEntity } from "../domain/entities"
import type { HatchGradient } from "../domain/hatchGradients"
import { hatchMatchingPattern } from "../domain/hatchPatternEdits"
import { createBlockDefinition, createInsert } from "../domain/entityFactories"
import {
  parseDrawingFile,
  serializeDrawing,
} from "../serialization/drawingFile"
import { documentSnapshot } from "./runtimeFiles"
import { es } from "../locales/es"
import type { EngineLocale } from "../locales/types"
import type { ScenePrimitive } from "../scene/types"
import { THEME } from "../scene/theme"

// AutoCAD 2027's DXFOUT of gradient/g16: twelve 100 × 50 rectangles, the
// i-th at ((i mod 4)·120, −⌊i/4⌋·70), hatched with the nine names centred
// at 0°, LINEAR and SPHERICAL at 30° not centred, and a one-colour CURVED.

function gradientsFile(): Uint8Array {
  const path = new URL(
    "../serialization/dxf/fixtures/gradients-2018.dxf.gz",
    import.meta.url
  )
  return new Uint8Array(gunzipSync(readFileSync(path)))
}

await import("../serialization/dxf/readDxf")

async function opened(locale?: EngineLocale): Promise<CadHarness> {
  const cad = createHarness(locale ? { locale } : {})
  await cad.openFile({ name: "gradients.dxf", bytes: gradientsFile() })
  return cad
}

const hatches = (cad: CadHarness): HatchEntity[] =>
  cad.entities().filter((e): e is HatchEntity => e.type === "hatch")

/** The hatch of the i-th rectangle. */
function nth(cad: CadHarness, i: number): HatchEntity {
  const x = (i % 4) * 120 + 50
  const y = -Math.floor(i / 4) * 70 + 25
  return hatches(cad).find((h) =>
    h.loops[0].vertices.some(
      (v) => Math.abs(v.x - x) === 50 && v.y < y + 30 && v.y > y - 30
    )
  )!
}

function typed(cad: CadHarness, ...texts: string[]): string[] {
  const from = cad.commandLog().length
  for (const text of texts) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad.commandLog().slice(from)
}

type GradientPath = Extract<ScenePrimitive, { kind: "path" }> & {
  gradient: NonNullable<Extract<ScenePrimitive, { kind: "path" }>["gradient"]>
}
const gradientPaths = (cad: CadHarness): GradientPath[] =>
  cad
    .scene()
    .primitives.filter(
      (q): q is GradientPath => q.kind === "path" && q.gradient !== undefined
    )

const LINEAR: HatchGradient = {
  name: "LINEAR",
  colors: ["#0000ff", "#ffff00"],
  angle: 0,
  centered: true,
}

describe("a DXF's gradients, drawn", () => {
  it("draws each in its own colours, whatever the object's", async () => {
    const cad = await opened()
    cad.zoomToFit()
    const paths = gradientPaths(cad)
    expect(paths).toHaveLength(12)
    const colors = new Set(
      paths.flatMap((q) => q.gradient.stops.map((s) => s.color))
    )
    expect(colors.has("#0000ff")).toBe(true)
    expect(colors.has("#ffff00")).toBe(true)
  })

  it("glows as a SOLID hatch when selected, and fades with ERASE's preview", async () => {
    const cad = await opened()
    cad.zoomToFit()
    const id = nth(cad, 0).id
    cad.select(id)
    const glows = cad
      .scene()
      .primitives.filter((q) => q.kind === "path" && q.fill === THEME.selected)
    expect(glows).toHaveLength(1)
    expect(glows[0]).not.toHaveProperty("gradient")
    expect(gradientPaths(cad)).toHaveLength(12)
    // ERASE with the hatch picked: its stops faded, as its stroke would be.
    cad.escape()
    typed(cad, "_ERASE")
    cad.click(p(50, 25))
    const faded = gradientPaths(cad).filter((q) =>
      q.gradient.stops.every((s) => s.color.startsWith("rgba("))
    )
    expect(faded).toHaveLength(1)
  })

  it("draws none with FILL off (g14)", async () => {
    const cad = await opened()
    typed(cad, "FILLMODE", "0")
    cad.zoomToFit()
    expect(gradientPaths(cad)).toHaveLength(0)
  })

  it("lays LINEAR left to right on the screen, HEMISPHERICAL from below", async () => {
    const cad = await opened()
    cad.zoomToFit()
    const linearHatch = nth(cad, 0)
    const at = (x: number, y: number) => cad.toScreen(p(x, y))
    const linear = gradientPaths(cad).find(
      (q) =>
        q.gradient.kind === "linear" &&
        Math.abs(q.gradient.origin.x - at(0, 0).x) < 1e-6
    )!
    expect(linearHatch.gradient?.name).toBe("LINEAR")
    expect(linear.gradient.axisX.x).toBeGreaterThan(0)
    expect(Math.abs(linear.gradient.axisX.y)).toBeLessThan(1e-9)
    // HEMISPHERICAL's centre, S/2 below its rectangle's centre: lower on
    // the screen, whose Y runs down.
    const hemi = gradientPaths(cad).find(
      (q) =>
        q.gradient.kind === "radial" &&
        Math.abs(q.gradient.origin.x - at(50, 0).x) < 1e-6 &&
        Math.abs(q.gradient.origin.y - at(50, -70 - 25).y) < 1e-6
    )
    expect(hemi).toBeDefined()
  })
})

describe("what a command does to a gradient", () => {
  // g08: ROTATE and MIRROR leave 460, and the plot draws the turned hatch's
  // fill at the angle it had.
  it("ROTATE and MIRROR keep its angle", async () => {
    const cad = await opened()
    const id = nth(cad, 9).id
    cad.select(id)
    typed(cad, "_ROTATE", "0,0", "90")
    const turned = hatches(cad).find((h) => h.id === id)!
    expect(turned.gradient?.angle).toBeCloseTo(Math.PI / 6, 9)
    cad.select(id)
    typed(cad, "_MIRROR", "0,0", "0,10", "N")
    const mirrored = hatches(cad).filter((h) => h.gradient?.name === "LINEAR")
    expect(mirrored).toHaveLength(3)
    for (const h of mirrored)
      expect(h.gradient?.angle).toBeOneOf([0, expect.closeTo(Math.PI / 6, 9)])
  })

  it("EXPLODE cannot explode it (g08)", async () => {
    const cad = await opened()
    const id = nth(cad, 0).id
    cad.select(id)
    const log = typed(cad, "_EXPLODE")
    expect(log.join("\n")).toContain("Cannot explode HATCH")
    expect(hatches(cad).some((h) => h.id === id)).toBe(true)
  })

  // g10: a reference turned 90° draws its block's LINEAR up the screen;
  // EXPLODE of it leaves the hatch at the angle the block gave it, 0.
  it("a block reference turns it, and EXPLODE of the reference keeps its angle", () => {
    const block = createBlockDefinition("G", p(0, 0), [
      hatchOf([loopOf(p(0, 0), p(100, 50))], {
        patternId: "SOLID",
        gradient: LINEAR,
      }),
    ])
    const insert = createInsert("G", p(0, 0), { rotation: Math.PI / 2 })
    const cad = createHarness({ entities: [insert], blocks: [block] })
    cad.zoomToFit()
    const [path] = gradientPaths(cad)
    expect(Math.abs(path.gradient.axisX.x)).toBeLessThan(1e-6)
    // Up the world is up the screen: negative screen Y.
    expect(path.gradient.axisX.y).toBeLessThan(0)
    cad.select(insert.id)
    typed(cad, "_EXPLODE")
    const [exploded] = hatches(cad)
    expect(exploded.gradient?.angle).toBe(0)
    expect(
      exploded.loops[0].vertices.some((v) => Math.abs(v.y - 100) < 1e-9)
    ).toBe(true)
  })

  // g14: MATCHPROP takes the fill whole, either way.
  it("MATCHPROP makes a pattern hatch the gradient, and a gradient the pattern", () => {
    const gradient = hatchOf([loopOf(p(0, 0), p(10, 10))], {
      patternId: "SOLID",
      gradient: LINEAR,
    })
    const pattern = hatchOf([loopOf(p(20, 0), p(30, 10))], {
      patternId: "ANSI37",
      patternScale: 3,
      patternAngle: Math.PI / 4,
    })
    const made = hatchMatchingPattern(gradient, pattern)
    expect(made.patternId).toBe("SOLID")
    expect(made.gradient).toEqual(LINEAR)
    const back = hatchMatchingPattern(pattern, gradient)
    expect(back.gradient).toBeUndefined()
    expect([back.patternId, back.patternScale]).toEqual(["ANSI37", 3])
  })

  it("the drawing file keeps it (version 56)", async () => {
    const cad = await opened()
    const back = parseDrawingFile(
      serializeDrawing(documentSnapshot(cad.runtime.document))
    )
    const reread = back.entities.filter(
      (e): e is HatchEntity => e.type === "hatch"
    )
    expect(reread.map((h) => h.gradient)).toEqual(
      hatches(cad).map((h) => h.gradient)
    )
  })
})

describe("LIST and the palette of a gradient", () => {
  const listed = (log: string[]) =>
    log.flatMap((l) => l.split("\n")).filter((l) => /^ {17}\S/.test(l))

  // g11, g13: in English and Spanish, as their consoles list them.
  it("lists its pattern, angle and centring as AutoCAD does", async () => {
    const cad = await opened()
    cad.select(nth(cad, 9).id)
    expect(listed(typed(cad, "_LIST")).slice(0, 5)).toEqual([
      "                 Hatch pattern GRADIENT",
      "                 Annotative: No",
      "                 Gradient Angle     30",
      "                 Gradient Not Centered",
      "                 Not associative",
    ])
    const spanish = await opened(es)
    spanish.select(nth(spanish, 0).id)
    expect(listed(typed(spanish, "_LIST")).slice(0, 4)).toEqual([
      "                 Patrón de sombreado DEGRADADO",
      "                 Anotativo: no",
      "                 Ángulo del degradado      0",
      "                 Degradado centrado",
    ])
  })

  // list/p228 (en-US): in UCS Z 30 the angle is the one it stores. AutoCAD
  // also writes `Material: ByLayer` under Space for an object it read from
  // a DXF: no materials here (LSR-45), and `listed` skips its column.
  it("lists its angle as stored in a turned UCS", async () => {
    const cad = await opened()
    typed(cad, "_UCS", "_Z", "30")
    cad.select(nth(cad, 9).id)
    expect(listed(typed(cad, "_LIST"))[2]).toBe(
      "                 Gradient Angle     30"
    )
  })

  it("shows its name, colours, angle and centring in the palette", async () => {
    const cad = await opened()
    cad.select(nth(cad, 10).id)
    const rows =
      cad.state().properties.info?.groups.flatMap((g) => g.rows) ?? []
    const value = (id: string) => rows.find((r) => r.id === id)?.value
    expect(value("type")).toBe("Gradient")
    expect(value("gradientName")).toBe("Spherical")
    expect(value("color1")).toBe("Blue")
    expect(value("color2")).toBe("Yellow")
    expect(value("gradientAngle")).toBe("30°")
    expect(value("centered")).toBe("No")
    // Read-only but its Elevation, as any hatch.
    expect(rows.filter((r) => r.edit).map((r) => r.id)).toEqual(["elevation"])
    cad.escape()
    cad.select(nth(cad, 11).id)
    const one = cad.state().properties.info?.groups.flatMap((g) => g.rows) ?? []
    expect(one.find((r) => r.id === "color1")?.value).toBe("200,100,50")
  })
})

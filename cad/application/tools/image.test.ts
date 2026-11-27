import { describe, expect, it } from "vitest"
import { createHarness, type CadHarness } from "../../../test/harness"
import { p } from "../../../test/builders"
import "../../../test/matchers"
import type { ImageEntity, LineEntity } from "../../domain/entities"
import { createImage, imageLabel, mapImage } from "../../domain/entities"
import { THEME } from "../../scene/theme"
import { es } from "../../locales/es"
import {
  parseDrawingFile,
  serializeDrawing,
} from "../../serialization/drawingFile"
import { documentSnapshot } from "../runtimeFiles"

// An image AutoCAD 2027 cannot find, as it opens one from a DXF (probes
// scripts/research/probes/image/): i01's, 40 × 20 pixels of 1.0582 at
// 10,20, 42.328 × 21.164, its path C:\nowhere\pic.bmp.

const PIXEL = 3 * 0.3527336860670194

const image: ImageEntity = createImage(
  p(10, 20),
  { x: PIXEL, y: 0 },
  { x: 0, y: PIXEL },
  40,
  20,
  {
    name: "pic",
    path: "C:\\nowhere\\pic.bmp",
    pixelSize: 0.3527336860670194,
    units: 2,
  },
  "0",
  "i1"
)

const images = (cad: CadHarness): ImageEntity[] =>
  cad.entities().filter((e): e is ImageEntity => e.type === "image")

function typed(cad: CadHarness, ...texts: string[]): string[] {
  const from = cad.commandLog().length
  for (const text of texts) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad.commandLog().slice(from)
}

describe("an image AutoCAD cannot find", () => {
  // i01, v1–v6, r2: the path across the frame, as tall as the frame's width
  // over its characters, centred, its baseline 0.64 of it below the middle.
  it("shows its path sized to the frame's width", () => {
    const label = imageLabel(image)!
    expect(label.height).toBeCloseTo((40 * PIXEL) / 18, 9)
    expect(label.at).toBeCloseToPoint(
      p(31.164021, 30.582011 - 0.64 * label.height),
      5
    )
    const short = imageLabel({
      ...image,
      image: { name: "a", path: "C:\\a.bmp" },
    })!
    expect(short.height).toBeCloseTo((40 * PIXEL) / 8, 9)
  })

  it("draws its frame and path in its colour, the frame as IMAGEFRAME says", () => {
    const cad = createHarness({ entities: [{ ...image, color: "#ff0000" }] })
    cad.zoomToFit()
    cad.moveTo(p(-500, -500))
    const drawn = () => cad.scene().primitives
    const frames = () =>
      drawn().filter((q) => q.kind === "path" && q.stroke?.color === "#ff0000")
    const texts = () =>
      drawn().filter(
        (q) => q.kind === "text" && q.text === "C:\\nowhere\\pic.bmp"
      )
    expect(frames()).toHaveLength(1)
    expect(texts()).toHaveLength(1)
    // It masks nothing (the colour plot): no fill.
    expect(frames()[0]).not.toHaveProperty("fill")
    const log = typed(cad, "IMAGEFRAME", "0")
    expect(log).toContain("Regenerating model.")
    expect(frames()).toHaveLength(0)
    expect(texts()).toHaveLength(1)
  })

  // i06e's plot: mirrored, the path reads mirrored, along u and up v.
  it("draws a mirrored one's path mirrored", () => {
    const mirrored = mapImage(image, (q) => ({ x: -q.x, y: q.y }))
    const cad = createHarness({ entities: [mirrored] })
    cad.zoomToFit()
    cad.moveTo(p(-500, -500))
    const text = cad.scene().primitives.find((q) => q.kind === "text")
    expect(text?.kind === "text" && text.matrix?.[0]).toBeCloseTo(-1, 9)
    expect(text?.kind === "text" && text.matrix?.[3]).toBeCloseTo(1, 9)
  })

  // i02, i04: picked by its frame and its path, not inside it.
  it("is picked by its frame and its path, not its empty inside", () => {
    const cad = createHarness({ entities: [image] })
    cad.zoomToFit()
    cad.click(p(40, 25))
    expect(cad.selectedIds()).toEqual([])
    cad.escape()
    cad.click(p(10, 30))
    expect(cad.selectedIds()).toEqual(["i1"])
    cad.escape()
    cad.click(p(31.164, 30))
    expect(cad.selectedIds()).toEqual(["i1"])
  })

  // i02, i04: END, MID and NEA on the frame, CEN its middle, INS its corner.
  it("snaps to its frame, its middle and its insertion corner", () => {
    const cad = createHarness({ entities: [image] })
    cad.zoomToFit()
    typed(cad, "IMAGEFRAME", "0", "LUPREC", "3")
    const found = (mode: string, at: string) => {
      typed(cad, "ID", mode, at)
      const line = cad.commandLog().at(-1) ?? ""
      const xyz = line.match(/X = (\S+)\s+Y = (\S+)/)
      return xyz ? [+xyz[1], +xyz[2]] : line
    }
    expect(found("_END", "52,41")).toEqual([52.328, 41.164])
    expect(found("_MID", "31,20.2")).toEqual([31.164, 20])
    expect(found("_NEA", "31,20.2")).toEqual([31, 20])
    expect(found("_CEN", "10,30")).toEqual([31.164, 30.582])
    expect(found("_INS", "10.2,20.2")).toEqual([10, 20])
  })

  // s3, s5, s6, s8: one corner drags, the one across stays, never stretched.
  it("STRETCH drags its last corner caught, keeping its proportions", () => {
    const stretched = (from: string, to: string, by: string) => {
      const cad = createHarness({ entities: [image] })
      cad.zoomToFit()
      typed(cad, "_STRETCH", "C", from, to, "", "0,0", by)
      const [after] = images(cad)
      return [after.position.x, after.position.y, after.u.x]
    }
    // s5: the bottom right one by −3,4: the top left stays.
    const s5 = stretched("51,19", "53,21", "-3,4")
    expect(s5[0]).toBeCloseTo(10, 4)
    expect(s5[1]).toBeCloseTo(21.5, 4)
    expect(s5[2]).toBeCloseTo(0.983201, 5)
    // s6: all four caught, still the bottom right one, by 3,4.
    const s6 = stretched("5,15", "60,50", "3,4")
    expect(s6[1]).toBeCloseTo(18.5, 4)
    expect(s6[2]).toBeCloseTo(1.1332, 4)
    // s8: the left edge, the top left one wins: the bottom right stays.
    const s8 = stretched("9,19", "11,42", "-5,0")
    expect(s8[0]).toBeCloseTo(5, 4)
    expect(s8[1]).toBeCloseTo(20, 4)
    // s10: dragged across the one that stays, nothing changes.
    expect(stretched("51,19", "53,21", "-50,0")[2]).toBeCloseTo(PIXEL, 9)
  })

  // i06a: four lines, up, across, down and back, saying nothing.
  it("EXPLODE leaves its frame's four lines", () => {
    const cad = createHarness({ entities: [image] })
    cad.select("i1")
    const log = typed(cad, "_EXPLODE")
    const lines = cad
      .entities()
      .filter((e): e is LineEntity => e.type === "line")
    expect(lines).toHaveLength(4)
    expect(lines[0].start).toBeCloseToPoint(p(10, 20), 6)
    expect(lines[0].end).toBeCloseToPoint(p(10, 41.164021), 6)
    expect(lines[3].end).toBeCloseToPoint(p(10, 20), 6)
    // Nothing said of it: what it found is all.
    expect(log).toEqual(["EXPLODE", "1 found"])
  })

  // i07 (en-US): LIST as the console writes it.
  it("lists itself as AutoCAD does", () => {
    const cad = createHarness({ entities: [image] })
    typed(cad, "LUPREC", "4")
    cad.select("i1")
    const lines = typed(cad, "_LIST").flatMap((l) => l.split("\n"))
    expect(lines.slice(2)).toEqual([
      '                  IMAGE     Layer: "0"',
      "                            Space: Model space",
      // AutoCAD: `                    Material: ByLayer` for an image it read
      // from a DXF, i07; no materials here (list/p220, LSR-45).
      "Image:                   pic",
      "Insertion:               X=  10.0000,  Y=  20.0000,  Z=   0.0000",
      "Scale:                   3.0000",
      "Rotation angle:          0",
      "Brightness:              50",
      "Contrast:                50",
      "Fade:                    0",
      "Show image:              Yes",
      "Show non-ortho:          Yes",
      "Background Transparency: Off",
      "Clipping:                On",
      "Clip boundary type:      Rectangular",
      "Number of boundary points: 4",
      "       at point, X=  10.0000,  Y=  20.0000,  Z=   0.0000",
      "       at point, X=  10.0000,  Y=  41.1640,  Z=   0.0000",
      "       at point, X=  52.3280,  Y=  41.1640,  Z=   0.0000",
      "       at point, X=  52.3280,  Y=  20.0000,  Z=   0.0000",
    ])
  })

  // i07 (es-ES, MIRROR): mirrored, its extrusion in place of its turn; i12:
  // its display off, polygonal.
  it("lists itself in Spanish, mirrored and with its display off", () => {
    const cad = createHarness({
      locale: es,
      entities: [
        {
          ...mapImage(image, (q) => ({ x: -q.x, y: q.y })),
          display: 8,
          clip: { polygonal: true, points: [p(0, 0), p(9, 0), p(0, 9)] },
        },
      ],
    })
    typed(cad, "LUPREC", "4")
    cad.select("i1")
    const lines = typed(cad, "_LIST").flatMap((l) => l.split("\n"))
    expect(lines).toContain("Escala:                   3.0000")
    expect(lines).toContain("Dirección de extrusión en relación al SCP:")
    expect(lines).toContain(
      "                   X=   0.0000    Y=   0.0000    Z=   -1.0000"
    )
    expect(lines.some((l) => l.startsWith("Ángulo de rotación"))).toBe(false)
    expect(lines).toContain("Mostrar imagen:           No")
    expect(lines).toContain("Transparencia de fondo:   Act")
    expect(lines).toContain("Delimitación:             Des")
    expect(lines).toContain("Tipo de contorno de delimitación: Poligonal")
    expect(lines).toContain(
      "       en el punto, X= -10.0000,  Y=  20.0000,  Z=   0.0000"
    )
  })

  // i07, i15: what the edit commands say of it.
  it("is refused by OFFSET, AREA, BREAK, DIVIDE and TRIM as AutoCAD's is", () => {
    const refused = (command: string, ...rest: string[]) => {
      const cad = createHarness({ entities: [image] })
      cad.zoomToFit()
      typed(cad, command, ...rest)
      cad.click(p(10, 30))
      return cad.commandLog().join("\n")
    }
    expect(refused("_OFFSET", "1")).toContain("Cannot offset that object.")
    expect(refused("_AREA", "O")).toContain(
      "Selected object does not have an area"
    )
    expect(refused("_BREAK")).toContain("Object can't be broken")
    expect(refused("_DIVIDE")).toContain("Cannot divide that object.")
    expect(refused("_TRIM", "")).toContain("Cannot TRIM this object.")
  })

  it("has a grip at each corner, dragged as STRETCH drags one", () => {
    const cad = createHarness({ entities: [image] })
    cad.zoomToFit()
    cad.select("i1")
    const grips = cad
      .scene()
      .primitives.filter((q) => q.kind === "rect" && q.fill === THEME.grip)
    expect(grips).toHaveLength(4)
    // The bottom right one dragged by −3,4, as s5's STRETCH: the top left stays.
    cad.click(p(52.328042, 20)).click(p(49.328042, 24))
    const [after] = images(cad)
    expect(after.position.y).toBeCloseTo(21.5, 4)
    expect(after.u.x).toBeCloseTo(0.983201, 5)
  })

  it("is saved in the drawing file with IMAGEFRAME", () => {
    const cad = createHarness({ entities: [image] })
    typed(cad, "IMAGEFRAME", "2")
    const parsed = parseDrawingFile(
      serializeDrawing(documentSnapshot(cad.runtime.document))
    )
    expect(parsed.entities).toEqual([image])
    expect(parsed.settings.imageFrame).toBe(2)
  })

  it("draws its frame selected, the frames hidden", () => {
    const cad = createHarness({ entities: [image] })
    cad.zoomToFit()
    typed(cad, "IMAGEFRAME", "0")
    cad.select("i1")
    const glows = cad
      .scene()
      .primitives.filter(
        (q) => q.kind === "path" && q.stroke?.color === THEME.selected
      )
    expect(glows).toHaveLength(1)
  })
})

import { describe, expect, it } from "vitest"
import { createHarness, type CadHarness } from "../../../test/harness"
import { p } from "../../../test/builders"
import type { WipeoutEntity } from "../../domain/entities"
import {
  createPolyline,
  createWipeout,
  createLine,
} from "../../domain/entities"
import { THEME } from "../../scene/theme"
import { es } from "../../locales/es"
import { hu } from "../../locales/hu"
import {
  parseDrawingFile,
  serializeDrawing,
} from "../../serialization/drawingFile"
import { documentSnapshot } from "../runtimeFiles"

// AutoCAD 2027's WIPEOUT and its wipeout (probes scripts/research/probes/wipeout/).

const wipeouts = (cad: CadHarness): WipeoutEntity[] =>
  cad.entities().filter((e): e is WipeoutEntity => e.type === "wipeout")

function typed(cad: CadHarness, ...texts: string[]): string[] {
  const from = cad.commandLog().length
  for (const text of texts) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad.commandLog().slice(from)
}

const xy = (w: WipeoutEntity) => w.vertices.map((v) => [v.x, v.y])

describe("WIPEOUT", () => {
  // w00, w04: the prompts; Enter from the fourth makes it, closing back.
  it("asks AutoCAD's prompts and makes the wipeout at Enter", () => {
    const cad = createHarness()
    const log = typed(cad, "WIPEOUT", "0,0", "100,0", "100,50", "0,50", "")
    expect(log).toEqual([
      "WIPEOUT",
      "Specify first point or [Frames/Polyline] <Polyline>: 0,0",
      "Specify next point: 100,0",
      "Specify next point or [Undo]: 100,50",
      "Specify next point or [Close/Undo]: 0,50",
      "Specify next point or [Close/Undo]:",
    ])
    expect(xy(wipeouts(cad)[0])).toEqual([
      [0, 0],
      [100, 0],
      [100, 50],
      [0, 50],
    ])
    expect(cad.activeToolId()).toBe("select")
  })

  // w13: Enter at the second point is refused; Undo takes back a point;
  // Close makes a triangle.
  it("refuses Enter at the second point, undoes a point and closes", () => {
    const cad = createHarness()
    const log = typed(cad, "WIPEOUT", "0,0", "", "100,0", "U", "100,0")
    expect(log).toContain("2D point or option keyword required.")
    typed(cad, "100,50", "C")
    expect(xy(wipeouts(cad)[0])).toEqual([
      [0, 0],
      [100, 0],
      [100, 50],
    ])
  })

  // w05: the first point's Z is the plane's; a later one with a Z is refused.
  it("lies at the first point's Z, its later points 2D", () => {
    const cad = createHarness()
    const log = typed(cad, "WIPEOUT", "0,0,5", "100,0,7")
    expect(log).toContain("2D point or option keyword required.")
    typed(cad, "100,0", "100,50", "")
    expect(wipeouts(cad)[0].elevation).toBe(5)
  })

  // w06, w13: Polyline, Enter's default; erase or keep it.
  it("makes one of a closed polyline, erasing it if asked", () => {
    const rect = createPolyline(
      [p(200, 0), p(300, 0), p(300, 50), p(200, 50)],
      true,
      "0",
      undefined,
      "r1"
    )
    const cad = createHarness({
      entities: [{ ...rect, color: "#0000ff", lineweight: 0.5 }],
    })
    cad.zoomToFit()
    const log = typed(cad, "WIPEOUT", "")
    expect(log).toContain(
      "Specify first point or [Frames/Polyline] <Polyline>:"
    )
    expect(cad.state().commandLine.prompt).toContain(
      "Select a closed polyline:"
    )
    cad.click(p(250, 0))
    expect(cad.state().commandLine.prompt).toContain(
      "Erase polyline? [Yes/No] <No>:"
    )
    typed(cad, "Y")
    const [made] = wipeouts(cad)
    expect(xy(made)).toEqual([
      [200, 0],
      [300, 0],
      [300, 50],
      [200, 50],
    ])
    // Its colour, not its lineweight (w11, w13).
    expect(made.color).toBe("#0000ff")
    expect(made.lineweight).toBeUndefined()
    expect(cad.entities().some((e) => e.id === "r1")).toBe(false)
  })

  it("ends at an open polyline or one with an arc, passing over the rest", () => {
    const open = createPolyline([p(0, 0), p(100, 0), p(100, 50)], false, "0")
    const line = createLine(p(0, 100), p(100, 100), "0")
    const cad = createHarness({ entities: [open, line] })
    cad.zoomToFit()
    typed(cad, "WIPEOUT", "P")
    cad.click(p(50, 100))
    expect(cad.state().commandLine.prompt).toContain(
      "Select a closed polyline:"
    )
    cad.click(p(50, 0))
    expect(cad.commandLog()).toContain(
      "The polyline must be closed and made up of only line segments."
    )
    expect(cad.activeToolId()).toBe("select")
    expect(wipeouts(cad)).toHaveLength(0)
  })

  // w02, w07, w12: Frames sets WIPEOUTFRAME, its default the current mode.
  it("sets the frames of every wipeout", () => {
    const cad = createHarness()
    const log = typed(cad, "WIPEOUT", "F", "OFF")
    expect(log).toEqual([
      "WIPEOUT",
      "Specify first point or [Frames/Polyline] <Polyline>: F",
      "Enter mode [ON/OFF/Display but not plot] <ON>: OFF",
      "Regenerating model.",
      "Regenerating model.",
    ])
    expect(cad.runtime.document.getSettings().wipeoutFrame).toBe(0)
    const again = typed(cad, "WIPEOUT", "F", "D")
    expect(again).toContain("Enter mode [ON/OFF/Display but not plot] <OFF>: D")
    expect(cad.runtime.document.getSettings().wipeoutFrame).toBe(2)
    typed(cad, "WIPEOUTFRAME", "1")
    expect(cad.runtime.document.getSettings().wipeoutFrame).toBe(1)
  })

  it("speaks Spanish and Hungarian as their consoles do (w12)", () => {
    const cad = createHarness({ locale: es })
    expect(typed(cad, "COBERTURA", "M", "")).toEqual([
      "COBERTURA",
      "Precise primer punto o [Marcos/Polilínea] <Polilínea>: M",
      "Indique modo [ACT/DES/Mostrar pero no trazar] <ACT>:",
    ])
    const cadHu = createHarness({ locale: hu })
    const log = typed(cadHu, "KITAKAR", "0,0", "100,0", "100,50")
    expect(log).toContain("Adja meg a következő pontot vagy [Vissza]: 100,50")
    expect(cadHu.state().commandLine.prompt).toContain(
      "Adja meg a következő pontot [Zár/Vissza]:"
    )
  })
})

describe("the wipeout", () => {
  const wipeout = createWipeout(
    [p(0, 0), p(100, 0), p(100, 50), p(0, 50)],
    "0",
    "w1"
  )

  // w02: it masks with the background, its frame in its colour; WIPEOUTFRAME
  // 0 hides the frame.
  it("masks with the background and shows its frame as WIPEOUTFRAME says", () => {
    const cad = createHarness({ entities: [wipeout] })
    cad.zoomToFit()
    const masks = () =>
      cad
        .scene()
        .primitives.filter(
          (q) => q.kind === "path" && q.fill === THEME.background
        )
    expect(masks()).toHaveLength(1)
    expect(masks()[0]).toHaveProperty("stroke")
    typed(cad, "WIPEOUTFRAME", "0")
    expect(masks()).toHaveLength(1)
    expect(masks()[0]).not.toHaveProperty("stroke")
  })

  // Selected, its frame glows whatever WIPEOUTFRAME (the help's page).
  it("shows its frame selected, the frames hidden", () => {
    const cad = createHarness({ entities: [wipeout] })
    cad.zoomToFit()
    typed(cad, "WIPEOUTFRAME", "0")
    cad.select("w1")
    const glows = cad
      .scene()
      .primitives.filter(
        (q) => q.kind === "path" && q.stroke?.color === THEME.selected
      )
    expect(glows).toHaveLength(1)
  })

  // w07: picked inside, as an area, and by its frame.
  it("is picked anywhere it masks", () => {
    const cad = createHarness({ entities: [wipeout] })
    cad.zoomToFit()
    cad.click(p(50, 25))
    expect(cad.selectedIds()).toEqual(["w1"])
  })

  // w09: STRETCH moves the vertices it catches.
  it("STRETCH moves the vertices it catches", () => {
    const cad = createHarness({ entities: [wipeout] })
    cad.zoomToFit()
    typed(cad, "_STRETCH", "C", "95,-5", "120,10", "", "0,0", "10,0")
    expect(xy(wipeouts(cad)[0])).toEqual([
      [0, 0],
      [110, 0],
      [100, 50],
      [0, 50],
    ])
  })

  // w08, w10: EXPLODE leaves a line per edge, the closing one last.
  it("EXPLODE leaves its edges as lines", () => {
    const cad = createHarness({ entities: [wipeout] })
    cad.select("w1")
    typed(cad, "_EXPLODE")
    const lines = cad.entities().filter((e) => e.type === "line")
    expect(lines).toHaveLength(4)
    const last = lines[3]
    expect(last.type === "line" && [last.start, last.end]).toEqual([
      { x: 0, y: 50 },
      { x: 0, y: 0 },
    ])
  })

  // w03, w12: LIST, in English.
  it("lists its boundary points as AutoCAD does", () => {
    const cad = createHarness({ entities: [wipeout] })
    typed(cad, "LUPREC", "4")
    cad.select("w1")
    const lines = typed(cad, "_LIST").flatMap((l) => l.split("\n"))
    expect(lines).toContain('                  WIPEOUT   Layer: "0"')
    expect(lines).toContain("Number of boundary points: 4")
    expect(lines).toContain(
      "       at point, X= 100.0000,  Y=  50.0000,  Z=   0.0000"
    )
  })

  // w07: Endpoint, Midpoint and Nearest on its frame, shown or not; no
  // geometric centre.
  it("snaps to its frame's ends, middles and nearest points", () => {
    const cad = createHarness({ entities: [wipeout] })
    cad.zoomToFit()
    typed(cad, "WIPEOUTFRAME", "0")
    const found = (mode: string, at: string) => {
      typed(cad, "ID", mode, at)
      const line = cad.commandLog().at(-1) ?? ""
      const xyz = line.match(/X = (\S+)\s+Y = (\S+)/)
      return xyz ? [+xyz[1], +xyz[2]] : line
    }
    expect(found("_END", "99,1")).toEqual([100, 0])
    expect(found("_MID", "50,1")).toEqual([50, 0])
    expect(found("_NEA", "30,1")).toEqual([30, 0])
  })

  // w08, w10: what the edit commands say of it.
  it("is refused by OFFSET, AREA, TRIM and BREAK as AutoCAD's is", () => {
    const refused = (command: string, ...rest: string[]) => {
      const cad = createHarness({ entities: [wipeout] })
      cad.zoomToFit()
      typed(cad, command, ...rest)
      cad.click(p(50, 0))
      return cad.commandLog().join("\n")
    }
    expect(refused("_OFFSET", "5")).toContain("Cannot offset that object.")
    expect(refused("_AREA", "O")).toContain(
      "Selected object does not have an area"
    )
    expect(refused("_BREAK")).toContain("Object can't be broken")
    expect(refused("_DIVIDE")).toContain("Cannot divide that object.")
  })

  it("is saved in the drawing file with WIPEOUTFRAME", () => {
    const cad = createHarness({ entities: [wipeout] })
    typed(cad, "WIPEOUTFRAME", "2")
    const parsed = parseDrawingFile(
      serializeDrawing(documentSnapshot(cad.runtime.document))
    )
    expect(parsed.entities).toEqual([wipeout])
    expect(parsed.settings.wipeoutFrame).toBe(2)
  })
})

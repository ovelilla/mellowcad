import { describe, expect, it } from "vitest"
import { VIEW_CUBE_PARTS } from "./viewCube"
import { isWorldUcs } from "../domain/ucs"
import { createHarness, type CadHarness } from "../../test/harness"
import { circleOf, lineOf, p } from "../../test/builders"
import { es } from "../locales/es"

function direction(cad: CadHarness) {
  return cad.runtime.viewport.direction
}

function expectDirection(
  cad: CadHarness,
  x: number,
  y: number,
  z: number
): void {
  const length = Math.hypot(x, y, z)
  expect(direction(cad).x).toBeCloseTo(x / length, 9)
  expect(direction(cad).y).toBeCloseTo(y / length, 9)
  expect(direction(cad).z).toBeCloseTo(z / length, 9)
}

describe("the ViewCube's parts", () => {
  it("are the six faces, twelve edges and eight corners", () => {
    expect(VIEW_CUBE_PARTS).toHaveLength(26)
    expect(new Set(VIEW_CUBE_PARTS).size).toBe(26)
    expect(VIEW_CUBE_PARTS).toEqual(
      expect.arrayContaining([
        "top",
        "front",
        "top-front",
        "left-front",
        "top-left-front",
        "bottom-right-back",
      ])
    )
  })

  it("each look along their direction in the WCS", () => {
    const cad = createHarness()
    const expected: Record<string, [number, number, number]> = {
      top: [0, 0, 1],
      bottom: [0, 0, -1],
      front: [0, -1, 0],
      back: [0, 1, 0],
      left: [-1, 0, 0],
      right: [1, 0, 0],
      "top-front": [0, -1, 1],
      "right-back": [1, 1, 0],
      "top-left-front": [-1, -1, 1],
      "bottom-right-back": [1, 1, -1],
    }
    for (const [part, [x, y, z]] of Object.entries(expected)) {
      cad.runtime.viewCubePick(part)
      expectDirection(cad, x, y, z)
      expect(cad.state().viewCube.current).toBe(part)
    }
  })

  it("keep the Z up, and Top and Bottom the X to the right, as -VIEW does", () => {
    const cad = createHarness()

    cad.runtime.viewCubePick("front")
    expect(cad.state().view.preset).toBe("Front")
    cad.runtime.viewCubePick("bottom")
    expect(cad.state().view.preset).toBe("Bottom")
    expect(cad.runtime.viewport.right).toEqual({ x: -1, y: 0, z: 0 })
    cad.runtime.viewCubePick("top-left-front")
    expect(cad.state().view.preset).toBe("SWiso")
  })

  it("follow the current UCS, and leave it as it is", () => {
    const cad = createHarness()
    cad.command("UCS").option("X").type("90").enter()
    const ucs = cad.runtime.document.getSettings().ucs

    cad.runtime.viewCubePick("top")
    expectDirection(cad, 0, -1, 0)
    cad.runtime.viewCubePick("front")
    expectDirection(cad, 0, 0, -1)

    expect(cad.runtime.document.getSettings().ucs).toBe(ucs)
    expect(cad.state().viewCube.current).toBe("front")
  })

  it("never change the UCS of the WCS either (UCSORTHO is the menu's)", () => {
    const cad = createHarness()

    cad.runtime.viewCubePick("front")

    expect(isWorldUcs(cad.runtime.document.getSettings().ucs)).toBe(true)
    expect(cad.state().canUndo).toBe(false)
  })
})

describe("what a click frames", () => {
  it("fits the drawing, one step of ZOOM Previous", () => {
    const cad = createHarness({ entities: [lineOf(p(0, 0), p(3000, 0))] })

    cad.runtime.viewCubePick("top-front")
    expect(cad.state().scale).toBeLessThan(0.5)

    cad.command("ZOOM").option("Previous")
    expect(cad.state().view.preset).toBe("Top")
    expect(cad.state().scale).toBe(1)
  })

  it("fits what is selected instead, when something is", () => {
    const cad = createHarness({
      entities: [
        lineOf(p(0, 0), p(3000, 0)),
        circleOf(p(100, 100), 5, { id: "C" }),
      ],
    })
    cad.select("C")

    cad.runtime.viewCubePick("top")

    expect(cad.state().scale).toBeGreaterThan(10)
  })
})

describe("the current part", () => {
  it("follows -VIEW and is lost by an orbit", () => {
    const cad = createHarness({ entities: [lineOf(p(0, 0), p(100, 0))] })

    // UCSORTHO turned the UCS to face the view, and the cube follows the UCS.
    cad.command("-VIEW").option("Orthographic").option("Front")
    expect(cad.state().viewCube.current).toBe("top")
    expect(cad.state().viewCube.faceView).toBe(true)

    cad.command("UCS").option("World")
    expect(cad.state().viewCube.current).toBe("front")

    cad.runtime.applyViewPreset("NEiso")
    expect(cad.state().viewCube.current).toBe("top-right-back")
    expect(cad.state().viewCube.faceView).toBe(false)

    cad.command("3DORBIT").drag(p(0, 0), p(40, 10)).escape()
    expect(cad.state().viewCube.current).toBeNull()
  })
})

describe("the roll arrows and the triangles", () => {
  it("turn a face view a quarter about the line of sight", () => {
    const cad = createHarness()

    cad.runtime.viewCubeRoll("clockwise")
    expect(cad.runtime.viewport.right.y).toBeCloseTo(1, 12)
    expect(cad.state().viewCube.current).toBe("top")

    cad.runtime.viewCubeRoll("counterclockwise")
    expect(cad.runtime.viewport.right.x).toBeCloseTo(1, 12)
  })

  it("turn to the face on that side of the screen", () => {
    const cad = createHarness()
    cad.runtime.viewCubePick("front")

    cad.runtime.viewCubeAdjacent("right")
    expect(cad.state().viewCube.current).toBe("right")
    expect(cad.state().view.preset).toBe("Right")

    cad.runtime.viewCubeAdjacent("up")
    expect(cad.state().viewCube.current).toBe("top")

    cad.runtime.viewCubeAdjacent("down")
    expect(cad.state().viewCube.current).toBe("right")
    expect(cad.runtime.viewport.up.z).toBeCloseTo(1, 12)
  })

  it("do nothing off a face view", () => {
    const cad = createHarness()
    cad.runtime.viewCubePick("top-left-front")
    const before = cad.runtime.viewport.getCamera()

    cad.runtime.viewCubeRoll("clockwise")
    cad.runtime.viewCubeAdjacent("up")

    expect(cad.runtime.viewport.getCamera()).toEqual(before)
  })
})

describe("Home", () => {
  it("is Top/Left/Front until set, and saved with the drawing", () => {
    const cad = createHarness()

    cad.runtime.viewCubeHome()
    expectDirection(cad, -1, -1, 1)

    cad.runtime.applyViewPreset("NEiso")
    // -VIEW is an undo step of its own; setting Home is none.
    cad.runtime.history.clear()
    cad.runtime.setHomeFromCurrentView()
    cad.runtime.viewCubePick("top")
    cad.runtime.viewCubeHome()
    expectDirection(cad, 1, 1, 1)
    expect(cad.state().canUndo).toBe(false)

    const reopened = createHarness()
    reopened.runtime.loadDrawing(cad.runtime.serializeDrawing())
    reopened.runtime.viewCubeHome()
    expectDirection(reopened, 1, 1, 1)
  })
})

describe("dragging the ViewCube", () => {
  it("orbits, and lands on a view let go of near it", () => {
    const cad = createHarness({ entities: [lineOf(p(0, 0), p(100, 0))] })
    cad.runtime.viewCubePick("front")

    cad.runtime.viewCubeDrag("start", { x: 0, y: 0 })
    cad.runtime.viewCubeDrag("move", { x: 10, y: 5 })
    expect(cad.state().viewCube.current).toBeNull()
    cad.runtime.viewCubeDrag("end", { x: 12, y: 5 })

    expect(cad.state().viewCube.current).toBe("front")
  })

  it("stays where it is let go far from any, one step of ZOOM Previous", () => {
    const cad = createHarness({ entities: [lineOf(p(0, 0), p(100, 0))] })
    cad.runtime.viewCubePick("front")

    cad.runtime.viewCubeDrag("start", { x: 0, y: 0 })
    cad.runtime.viewCubeDrag("move", { x: 30, y: 0 })
    cad.runtime.viewCubeDrag("end", { x: 60, y: 0 })
    expect(cad.state().viewCube.current).toBeNull()

    cad.command("ZOOM").option("Previous")
    expect(cad.state().viewCube.current).toBe("front")
  })

  it("keeps the selection's middle where it is drawn while it orbits", () => {
    const cad = createHarness({
      entities: [
        lineOf(p(0, 0), p(1000, 0)),
        circleOf(p(300, 200), 20, { id: "C" }),
      ],
    })
    cad.runtime.viewCubePick("top-left-front")
    cad.select("C")
    const before = cad.runtime.viewport.worldToScreen({ x: 300, y: 200, z: 0 })

    cad.runtime.viewCubeDrag("start", { x: 0, y: 0 })
    cad.runtime.viewCubeDrag("move", { x: 70, y: 30 })
    cad.runtime.viewCubeDrag("end", { x: 70, y: 30 })

    const after = cad.runtime.viewport.worldToScreen({ x: 300, y: 200, z: 0 })
    expect(after).toBeCloseToPoint(before, 6)
  })

  it("turns the azimuth alone on the compass ring", () => {
    const cad = createHarness()
    cad.runtime.viewCubePick("top-left-front")
    const rise = direction(cad).z

    cad.runtime.viewCubeDrag("start", { x: 0, y: 0 }, true)
    cad.runtime.viewCubeDrag("move", { x: 100, y: 80 }, true)
    cad.runtime.viewCubeDrag("end", { x: 100, y: 80 }, true)

    expect(direction(cad).z).toBeCloseTo(rise, 9)
    expect(cad.state().viewCube.current).toBeNull()
  })
})

describe("the compass", () => {
  it("looks from a point of the compass at the view's elevation", () => {
    const cad = createHarness()
    cad.runtime.viewCubePick("top-left-front")

    cad.runtime.compassPick("N")

    expectDirection(cad, 0, Math.SQRT2, 1)
  })

  it("turns the plan so the letter is at the bottom", () => {
    const cad = createHarness()

    cad.runtime.compassPick("E")

    expectDirection(cad, 0, 0, 1)
    expect(cad.runtime.viewport.up.x).toBeCloseTo(-1, 12)
  })

  it("puts its letters round the cube with North on the Y", () => {
    const cad = createHarness()
    const { compass } = cad.state().viewCube

    expect(compass.rx).toBeCloseTo(compass.ry, 12)
    const at = Object.fromEntries(
      compass.letters.map((entry) => [entry.letter, entry.at])
    )
    expect(at.N.y).toBeLessThan(compass.center.y)
    expect(at.S.y).toBeGreaterThan(compass.center.y)
    expect(at.E.x).toBeGreaterThan(compass.center.x)
    expect(at.W.x).toBeLessThan(compass.center.x)
  })
})

describe("the ViewCube in EngineState", () => {
  it("shows one face, cut into its nine parts, in a face view", () => {
    const cad = createHarness()
    const { faces } = cad.state().viewCube

    expect(faces.map((face) => face.face)).toEqual(["top"])
    expect(faces[0].zones.map((zone) => zone.part)).toEqual([
      "top-left-front",
      "top-left",
      "top-left-back",
      "top-front",
      "top",
      "top-back",
      "top-right-front",
      "top-right",
      "top-right-back",
    ])
    const [a, b, c, d, e, f] = faces[0].label
    expect([a, b, c, d]).toEqual([0.5, 0, 0, 0.5])
    expect([e, f]).toEqual([0.25, 0.25])
  })

  it("shows the three faces a corner view sees", () => {
    const cad = createHarness()
    cad.runtime.viewCubePick("top-left-front")

    expect(
      cad
        .state()
        .viewCube.faces.map((face) => face.face)
        .sort()
    ).toEqual(["front", "left", "top"])
  })

  it("is rebuilt when the camera turns, not when it zooms or pans", () => {
    const cad = createHarness()
    const before = cad.state().viewCube

    cad.wheel(p(30, 30), -100)
    cad.runtime.viewport.panByScreen({ x: 20, y: 0 })
    expect(cad.state().viewCube).toBe(before)

    cad.runtime.viewCubePick("front")
    expect(cad.state().viewCube).not.toBe(before)
  })
})

describe("NAVVCUBE", () => {
  it("hides and shows the ViewCube, saved and a step U names", () => {
    const cad = createHarness()

    cad.command("NAVVCUBE").option("OFF")
    expect(cad.state().viewCube.visible).toBe(false)
    expect(cad.runtime.serializeDrawing()).toMatch(/"navVCubeDisplay": 0/)
    // move/p238; AutoCAD's U also puts NAVVCUBEDISPLAY back, not done here.
    cad.command("_U")
    expect(cad.commandLog().at(-1)).toBe("NAVVCUBE")

    cad.command("CUBE")
    expect(cad.state().commandLine.prompt).toBe(
      "NAVVCUBE Enter an option [ON/OFF] <OFF>:"
    )
    cad.option("ON")
    expect(cad.state().viewCube.visible).toBe(true)
  })

  // AutoCAD 2023's console answering the same input (Settings, the ViewCube
  // Settings dialog, is not offered).
  it("refuses what is not one of its keywords", () => {
    const cad = createHarness()
    cad.command("NAVVCUBE")
    cad.runtime.setCommandLineText("FOO")
    cad.runtime.submitCommandLine()
    expect(cad.commandLog()).toEqual([
      "NAVVCUBE",
      "Enter an option [ON/OFF] <ON>: FOO",
      "Invalid option keyword.",
    ])
  })

  it("answers ACT and DES in Spanish", () => {
    const cad = createHarness({ locale: es })

    cad.command("NAVVCUBE")
    expect(cad.state().commandLine.prompt).toBe(
      "NAVVCUBE Indique una opción [ACT/DES] <ACT>:"
    )
    cad.option("OFF")
    expect(cad.state().viewCube.visible).toBe(false)
  })
})

describe("the UCS menu", () => {
  it("restores a saved UCS or the WCS, as UCS does, undoably", () => {
    const cad = createHarness()
    cad.command("UCS").type("10,20,0").enter().enter()
    cad.command("UCS").option("NAmed").option("Save").type("A").enter()
    cad.runtime.restoreUcs(null)
    expect(cad.state().ucsMenu).toEqual({
      world: true,
      name: null,
      named: ["A"],
    })

    expect(cad.runtime.restoreUcs("A")).toBe(true)
    expect(cad.state().ucsMenu).toEqual({
      world: false,
      name: "A",
      named: ["A"],
    })
    expect(cad.commandLog()).toContain("UCS")

    cad.undo()
    expect(cad.state().ucsMenu.world).toBe(true)
  })
})

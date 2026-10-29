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
    // The view's undo step only (desktop view/d05: the UCS stays the WCS).
    expect(written(cad, "U")).toEqual(["U", `'.VIEWCUBEACTION ${REGEN}`])
    expect(isWorldUcs(cad.runtime.document.getSettings().ucs)).toBe(true)
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
    expect(cad.state().canUndo).toBe(false)
    cad.runtime.viewCubePick("top")
    cad.runtime.viewCubeHome()
    expectDirection(cad, 1, 1, 1)

    const reopened = createHarness()
    reopened.runtime.loadDrawing(cad.runtime.serializeDrawing())
    reopened.runtime.viewCubeHome()
    expectDirection(reopened, 1, 1, 1)
  })
})

describe("a press on the ViewCube", () => {
  const view = (cad: CadHarness) => cad.state().viewCube.current

  it("is a click on its part where it moved 4 px either way", () => {
    // desktop view/d10: 4 across, 4 down, 4 both ways leave Top a click.
    const cad = createHarness({ entities: [lineOf(p(0, 0), p(100, 0))] })
    cad.runtime.viewCubePress({ part: "front" }, { x: 100, y: 100 })
    cad.runtime.viewCubeMove({ x: 104, y: 104 })
    cad.runtime.viewCubeRelease({ x: 104, y: 104 })
    expect(view(cad)).toBe("front")

    cad.runtime.viewCubePress({ letter: "S" }, { x: 100, y: 100 })
    cad.runtime.viewCubeRelease({ x: 100, y: 100 })
    expectDirection(cad, 0, -1, 0)
  })

  it("drags once out of the rectangle, from where it left it", () => {
    // desktop view/d10: 5 px across starts the orbit and turns nothing; 6
    // turns one pixel's worth, 8 three: it counts from where it began.
    const cad = createHarness({ entities: [lineOf(p(0, 0), p(100, 0))] })
    cad.runtime.viewCubePick("front")
    const before = { ...direction(cad) }
    cad.runtime.viewCubePress({ part: "front" }, { x: 100, y: 100 })
    cad.runtime.viewCubeMove({ x: 105, y: 100 })
    expect(direction(cad)).toBeCloseToPoint(before, 9)
    cad.runtime.viewCubeMove({ x: 106, y: 100 })
    cad.runtime.viewCubeRelease({ x: 106, y: 100 })
    expect(view(cad)).toBeNull()

    const once = createHarness({ entities: [lineOf(p(0, 0), p(100, 0))] })
    once.runtime.viewCubePick("front")
    once.runtime.viewCubeDrag("start", { x: 0, y: 0 })
    once.runtime.viewCubeDrag("end", { x: 1, y: 0 })
    expect(direction(cad)).toBeCloseToPoint(direction(once), 9)
  })

  it("ends a drag where it was when the pointer is lost, a click never", () => {
    const cad = createHarness({ entities: [lineOf(p(0, 0), p(100, 0))] })
    cad.runtime.viewCubePick("front")
    cad.runtime.history.clear()
    cad.runtime.viewCubePress({ part: "top" }, { x: 100, y: 100 })
    cad.runtime.viewCubeRelease(null)
    expect(view(cad)).toBe("front")

    cad.runtime.viewCubePress({ ring: true }, { x: 100, y: 100 })
    cad.runtime.viewCubeMove({ x: 140, y: 100 })
    cad.runtime.viewCubeRelease(null)
    expect(cad.state().canUndo).toBe(true)
  })
})

describe("dragging the ViewCube", () => {
  // Desktop view/d05: let go 1.7° and 6.6° off Top, it stays (VIEW-D67).
  it("orbits, and stays where it is let go however near a view", () => {
    const cad = createHarness({ entities: [lineOf(p(0, 0), p(100, 0))] })
    cad.runtime.viewCubePick("front")

    cad.runtime.viewCubeDrag("start", { x: 0, y: 0 })
    cad.runtime.viewCubeDrag("move", { x: 10, y: 5 })
    expect(cad.state().viewCube.current).toBeNull()
    cad.runtime.viewCubeDrag("end", { x: 12, y: 5 })

    expect(cad.state().viewCube.current).toBeNull()
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
  // Desktop view/d05: S from Top and from SW Isometric give VIEWDIR 0,-1,0.
  it("looks level from that side, upright, from the plan too", () => {
    const cad = createHarness()
    cad.runtime.viewCubePick("top-left-front")

    cad.runtime.compassPick("N")

    expectDirection(cad, 0, 1, 0)
    expect(cad.runtime.viewport.up.z).toBeCloseTo(1, 12)

    const plan = createHarness()
    plan.runtime.compassPick("E")
    expectDirection(plan, 1, 0, 0)
    expect(plan.runtime.viewport.up.z).toBeCloseTo(1, 12)
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

const ORIGIN =
  "Specify origin of UCS or [Face/NAmed/OBject/Previous/View/World/X/Y/Z/ZAxis] <World>:"

describe("the UCS menu", () => {
  it("restores a saved UCS or the WCS, as UCS does, undoably", () => {
    const cad = createHarness()
    cad.command("UCS").type("10,20,0").enter().enter()
    cad.command("UCS").option("NAmed").option("Save").type("A").enter()
    let from = cad.commandLog().length
    cad.runtime.restoreUcs(null)
    expect(cad.state().ucsMenu).toEqual({
      world: true,
      name: null,
      named: ["A"],
    })
    // The menu's macros, `_UCS _World` and `_UCS _NAmed _Restore`, echoed.
    expect(cad.commandLog().slice(from)).toEqual([
      "UCS",
      "Current ucs name:  A",
      `${ORIGIN} _World`,
    ])

    from = cad.commandLog().length
    expect(cad.runtime.restoreUcs("A")).toBe(true)
    expect(cad.state().ucsMenu).toEqual({
      world: false,
      name: "A",
      named: ["A"],
    })
    expect(cad.commandLog().slice(from)).toEqual([
      "UCS",
      "Current ucs name:  *WORLD*",
      `${ORIGIN} _NAmed`,
      "Enter an option [Restore/Save/Delete/?]: _Restore",
      "Enter name of UCS to restore or [?]: A",
    ])

    cad.undo()
    expect(cad.state().ucsMenu.world).toBe(true)
  })

  // desktop ucs/d03-4, d03-5, d03-8, d03-9: an unnamed UCS, `*FRONT*` and
  // `*TOP*` alike, is no WCS, the menu's `Unnamed`.
  it("reads only *WORLD* as the WCS, an orthographic UCS as unnamed", () => {
    const cad = createHarness()
    answer(cad, "UCS", "NA", "S", "A")
    expect(cad.state().ucsMenu).toEqual({
      world: false,
      name: "A",
      named: ["A"],
    })
    for (const view of ["T", "FR"]) {
      answer(cad, "UCS", "G", view)
      expect(cad.state().ucsMenu).toEqual({
        world: false,
        name: null,
        named: ["A"],
      })
    }
    answer(cad, "UCS", "5,5", "", "")
    expect(cad.state().ucsMenu).toEqual({
      world: false,
      name: null,
      named: ["A"],
    })
    answer(cad, "UCS", "W")
    expect(cad.state().ucsMenu).toEqual({
      world: true,
      name: null,
      named: ["A"],
    })
  })
})

// AutoCAD 2027's desktop (research/probes/view d05, VWD): each action is an
// undo step `'.VIEWCUBEACTION` that regenerates, transparent inside a command.
function answer(cad: CadHarness, ...texts: string[]): CadHarness {
  for (const text of texts) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

function written(cad: CadHarness, ...texts: string[]): string[] {
  const from = cad.commandLog().length
  answer(cad, ...texts)
  return cad.commandLog().slice(from)
}

const scale = (cad: CadHarness) => cad.runtime.viewport.scale
const dir = (cad: CadHarness) => {
  const d = cad.runtime.viewport.direction
  return [d.x, d.y, d.z].map((n) => +n.toFixed(6) + 0)
}
const REGEN = "Regenerating model."

function drawing(): CadHarness {
  return answer(
    createHarness({ entities: [lineOf(p(0, 0), p(100, 50))] }),
    "_LINE",
    "200,200",
    "210,200",
    ""
  )
}

describe("the ViewCube's undo and fit (desktop view/d05)", () => {
  it("a click is an undo step VIEWCUBEACTION, apart from ZOOM", () => {
    const cad = answer(drawing(), "ZOOM", "2X")
    cad.runtime.viewCubePick("front")
    expect(written(cad, "U")).toEqual(["U", `'.VIEWCUBEACTION ${REGEN}`])
    expect(dir(cad)).toEqual([0, 0, 1])
  })

  // VIEW-D62, D64: REDO regenerates too; a drag is a step as a click is.
  it("REDO regenerates, and a drag is a step too", () => {
    const cad = drawing()
    cad.runtime.viewCubePick("front")
    answer(cad, "U")
    expect(written(cad, "REDO")).toEqual([
      "REDO",
      "'.VIEWCUBEACTION",
      "Everything has been redone",
      REGEN,
    ])
    cad.runtime.viewCubeDrag("start", { x: 0, y: 0 })
    cad.runtime.viewCubeDrag("move", { x: 30, y: 10 })
    const from = cad.commandLog().length
    cad.runtime.viewCubeDrag("end", { x: 30, y: 10 })
    expect(cad.commandLog().slice(from)).toEqual([REGEN])
    expect(written(cad, "U")).toEqual(["U", `'.VIEWCUBEACTION ${REGEN}`])
    expect(dir(cad)).toEqual([0, -1, 0])
  })

  it("inside LINE it resumes LINE, and LINE's Undo takes it with the segment", () => {
    const cad = answer(drawing(), "_LINE", "0,0", "10,0")
    const from = cad.commandLog().length
    cad.runtime.viewCubePick("front")
    expect(cad.commandLog().slice(from)).toEqual([
      REGEN,
      "Resuming LINE command.",
    ])
    answer(cad, "_U")
    expect(dir(cad)).toEqual([0, 0, 1])
  })

  it("fits the extents' bounding sphere: the view's height is the box's diagonal", () => {
    const cad = drawing()
    cad.runtime.viewCubePick("front")
    const height = cad.runtime.viewport.height / scale(cad)
    expect(height).toBeCloseTo(Math.hypot(210, 200), 3)
  })

  it("the roll arrows fit too", () => {
    const cad = drawing()
    const fitted = (cad.runtime.viewCubePick("top"), scale(cad))
    answer(cad, "ZOOM", "2X")
    cad.runtime.viewCubeRoll("clockwise")
    expect(scale(cad)).toBeCloseTo(fitted, 9)
  })

  it("a compass letter looks level from that side, from the plan too", () => {
    const cad = drawing()
    cad.runtime.compassPick("S")
    expect(dir(cad)).toEqual([0, -1, 0])
    answer(cad, "-VIEW", "SWISO")
    cad.runtime.compassPick("S")
    expect(dir(cad)).toEqual([0, -1, 0])
  })
})

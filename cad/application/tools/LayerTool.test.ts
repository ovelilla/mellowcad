import { describe, expect, it } from "vitest"

import { type CadHarness, createHarness } from "../../../test/harness"
import { layerOf, lineOf, p } from "../../../test/builders"
import { DEFAULT_LAYER_ID } from "../../domain/layers"
import { es } from "../../locales/es"

/** Each answer typed at the command line and confirmed, as a script types it. */
function answer(cad: CadHarness, ...texts: string[]): CadHarness {
  for (const text of texts) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

/** The lines `texts` add to the history. */
function written(cad: CadHarness, ...texts: string[]): string[] {
  const from = cad.commandLog().length
  answer(cad, ...texts)
  return cad.commandLog().slice(from)
}

const named = (cad: CadHarness, name: string) =>
  cad.runtime.document.getLayers().find((layer) => layer.name === name)

const current = (cad: CadHarness) =>
  cad.runtime.document.getLayer(cad.runtime.document.getCurrentLayerId())?.name

/** The question open, as the command line asks it after `-LAYER `. */
const asked = (cad: CadHarness) =>
  cad.state().commandLine.prompt?.replace(/^-LAYER /, "")

/** A drawing with layer L1 (`locked` or not) and a line on each of 0 and L1. */
function withL1(locked = false): CadHarness {
  const cad = createHarness()
  cad.runtime.document.load(
    [
      lineOf(p(0, 0), p(100, 0)),
      lineOf(p(0, 50), p(100, 50), { layerId: "l1" }),
    ],
    { layers: [layerOf("0"), layerOf("l1", { name: "L1", locked })] }
  )
  return cad
}

const OPTION =
  "Enter an option [?/Make/Set/New/Rename/ON/OFF/Color/Ltype/LWeight/LOck/Unlock]:"

describe("-LAYER", () => {
  it("says the current layer and asks the options until Enter (p314)", () => {
    const cad = createHarness()
    expect(written(cad, "-LAYER", "")).toEqual([
      "-LAYER",
      'Current layer:  "0"',
      OPTION,
    ])
    expect(cad.activeToolId()).toBe("select")
  })

  it("runs as -LA (acad.pgp) and as -CAPA / -CA in Spanish", () => {
    expect(written(createHarness(), "-LA")[0]).toBe("-LA -LAYER")
    const cad = createHarness({ locale: es })
    expect(written(cad, "-CA")[1]).toBe('Capa actual:  "0"')
  })

  it("New makes each layer of a list, white and Continuous (p300, p320)", () => {
    const cad = createHarness()
    answer(cad, "-LAYER", "N", "L1,L2", "")
    for (const name of ["L1", "L2"]) {
      expect(named(cad, name)).toMatchObject({
        color: "#ffffff",
        linetype: "Continuous",
        visible: true,
        locked: false,
      })
    }
    expect(current(cad)).toBe("0")
  })

  it("New says a name in use or one AutoCAD refuses, and makes the rest (p395, p399, p321)", () => {
    const cad = createHarness()
    answer(cad, "-LAYER", "N", "L1")
    expect(written(cad, "N", "L5,A<B,l1,L6")).toEqual([
      `${OPTION} N`,
      "Enter name list for new layer(s): L5,A<B,l1,L6",
      '"A<B" is an invalid layer name.',
      'Layer "l1" already exists.',
    ])
    expect(named(cad, "L5")).toBeDefined()
    expect(named(cad, "L6")).toBeDefined()
  })

  it("Make makes a layer and makes it current, the current one offered (p305, p317)", () => {
    const cad = createHarness()
    answer(cad, "-LAYER", "M", "L2", "")
    expect(current(cad)).toBe("L2")
    answer(cad, "-LAYER", "M")
    expect(asked(cad)).toBe(
      "Enter name for new layer (becomes the current layer) <L2>:"
    )
  })

  it("Make on a layer that exists makes it current and turns it on (p399, p411)", () => {
    const cad = createHarness()
    answer(cad, "-LAYER", "N", "L1", "OFF", "L1", "M", "L1", "")
    expect(current(cad)).toBe("L1")
    expect(named(cad, "L1")?.visible).toBe(true)
    expect(cad.runtime.document.getLayers()).toHaveLength(2)
  })

  it("Set makes an existing layer current, turning it on (p306, p411)", () => {
    const cad = createHarness()
    answer(cad, "-LAYER", "N", "L1", "OFF", "L1", "S", "l1", "")
    expect(current(cad)).toBe("L1")
    expect(named(cad, "L1")?.visible).toBe(true)
  })

  it("Set says a layer it does not find and asks again (p395)", () => {
    const cad = createHarness()
    expect(written(cad, "-LAYER", "S", "ZZ")).toEqual([
      "-LAYER",
      'Current layer:  "0"',
      `${OPTION} S`,
      "Enter layer name to make current or <select object>: ZZ",
      'Cannot find layer "ZZ".',
    ])
    expect(asked(cad)).toBe(
      "Enter layer name to make current or <select object>:"
    )
  })

  it("Set's Enter takes an object's layer, saying so (p397)", () => {
    const cad = withL1()
    expect(written(cad, "-LAYER", "S", "", "L")).toEqual([
      "-LAYER",
      'Current layer:  "0"',
      `${OPTION} S`,
      "Enter layer name to make current or <select object>:",
      "Select object: L",
      'Layer "L1" has been made current.',
    ])
    expect(current(cad)).toBe("L1")
  })

  it("Set's object is picked on the drawing, and a pick on nothing says so (p395)", () => {
    const cad = withL1()
    answer(cad, "-LAYER", "S", "")
    expect(written(cad, "x").at(-1)).toBe("Expects a point or Last/Group")
    cad.click(p(50, 300))
    expect(cad.commandLog().at(-1)).toBe("No object found.")
    cad.click(p(50, 50))
    expect(current(cad)).toBe("L1")
  })

  it("Rename renames, refusing layer 0, a name in use or one AutoCAD refuses (p319, p320, p395)", () => {
    const cad = createHarness()
    answer(cad, "-LAYER", "N", "L1,L2")
    expect(written(cad, "R", "0").at(-1)).toBe('Cannot rename layer "0".')
    expect(written(cad, "R", "ZZ").at(-1)).toBe('Cannot find layer "ZZ".')
    expect(written(cad, "L1", "L2").at(-1)).toBe(
      'A layer named "L2" already exists.'
    )
    expect(written(cad, "R", "L1", "A<B").at(-1)).toBe("Invalid layer name.")
    answer(cad, "K1", "")
    expect(named(cad, "K1")).toBeDefined()
    expect(named(cad, "L1")).toBeUndefined()
  })

  it("ON, OFF, LOck and Unlock take lists with wildcards (p391)", () => {
    const cad = createHarness()
    answer(cad, "-LAYER", "N", "L1,L2", "OFF", "L1,L2", "ON", "L1")
    expect(named(cad, "L1")?.visible).toBe(true)
    expect(named(cad, "L2")?.visible).toBe(false)
    answer(cad, "LO", "L*", "U", "L2")
    expect(named(cad, "L1")?.locked).toBe(true)
    expect(named(cad, "L2")?.locked).toBe(false)
    expect(written(cad, "OFF", "ZZ").at(-1)).toBe(
      "No matching layer names found."
    )
    expect(written(cad, "ON", "ZZ").at(-1)).toBe(
      "No matching layer names found."
    )
  })

  it("OFF asks before turning the current layer off, the rest off already (p310–p312, p391)", () => {
    const cad = createHarness()
    answer(cad, "-LAYER", "N", "L1")
    answer(cad, "OFF", "*")
    expect(asked(cad)).toBe(
      'Really want layer "0" (the CURRENT layer) off? <N>'
    )
    expect(named(cad, "L1")?.visible).toBe(false)
    expect(written(cad, "FOO").at(-1)).toBe("Yes or No, please.")
    answer(cad, "")
    expect(named(cad, "0")?.visible).toBe(true)
    answer(cad, "OFF", "0", "Y", "")
    expect(named(cad, "0")?.visible).toBe(false)
  })

  it("OFF, LOck and Unlock take objects at Enter, a locked layer's too (p397, p410)", () => {
    const cad = withL1(true)
    expect(written(cad, "-LAYER", "U", "", "ALL", "")).toContain("2 found")
    expect(named(cad, "L1")?.locked).toBe(false)
    answer(cad, "OFF", "", "L", "")
    expect(named(cad, "L1")?.visible).toBe(false)
    expect(asked(cad)).toBe(OPTION)
  })

  it("Color takes a number, a name, a negative one turning the layers off (p301, p392)", () => {
    const cad = createHarness()
    answer(cad, "-LAYER", "N", "L1,L2")
    answer(cad, "C", "red")
    expect(asked(cad)).toBe(
      "Enter name list of layer(s) for color 1 (red) <0>:"
    )
    answer(cad, "L1", "C", "-5")
    expect(asked(cad)).toBe(
      "Enter name list of layer(s) for color -5 (blue) <0>:"
    )
    answer(cad, "L2", "C", "3", "")
    expect(named(cad, "L1")?.color).toBe("#ff0000")
    expect(named(cad, "L2")).toMatchObject({ color: "#0000ff", visible: false })
    expect(named(cad, "0")?.color).toBe("#00ff00")
  })

  it("Color's prompt ends ` :`, and refuses 0, past 255 and words (p392, p398)", () => {
    const cad = createHarness()
    answer(cad, "-LAYER", "C")
    expect(asked(cad)).toBe("New color [Truecolor] :")
    expect(written(cad, "0").at(-1)).toBe("Invalid color number.")
    expect(written(cad, "300").at(-1)).toBe("Invalid color number.")
    expect(written(cad, "BYLAYER").at(-1)).toBe("Invalid color.")
    expect(written(cad, "T", "255,0,0").at(-1)).toBe("Red,Green,Blue: 255,0,0")
    expect(asked(cad)).toBe(
      "Enter name list of layer(s) for color 255,0,0 <0>:"
    )
  })

  it("Ltype loads a linetype the drawing lacks from acad.lin (p393, ltype/p03)", () => {
    const cad = createHarness()
    answer(cad, "-LAYER", "N", "L1", "L", "DASHED", "L1")
    expect(named(cad, "L1")?.linetype).toBe("DASHED")
    expect(cad.runtime.document.getLinetype("DASHED")).toBeDefined()
    expect(written(cad, "L", "FOO").at(-1)).toBe(
      'Linetype "FOO" not found.  Use LINETYPE command to load it.'
    )
    expect(written(cad, "L", "", "").slice(1)).toEqual([
      "Enter loaded linetype name or [?] <Continuous>:",
      'Enter name list of layer(s) for linetype "Continuous" <0>:',
    ])
  })

  it("Ltype's ? lists the loaded linetypes, then the options (p393)", () => {
    const cad = createHarness()
    expect(written(cad, "-LAYER", "L", "?", "C*").slice(4)).toEqual([
      "Enter linetype name(s) to list <*>: C*",
      "Loaded linetypes:\n      Name          Description\n---------------- ------------------\n" +
        '"CENTER"         Center ____ _ ____ _ ____ _ ____ _ ____ _ ____\n' +
        '"Continuous"     Solid line',
    ])
    expect(asked(cad)).toBe(OPTION)
  })

  it("LWeight rounds to a valid lineweight and says so (p394, p399)", () => {
    const cad = createHarness()
    answer(cad, "-LAYER", "N", "L1", "LW")
    expect(asked(cad)).toBe("Enter lineweight (0.0mm - 2.11mm):")
    expect(written(cad, "0.33")).toEqual([
      "Enter lineweight (0.0mm - 2.11mm): 0.33",
      "Lineweight rounded to nearest valid value of 0.35 mm",
    ])
    answer(cad, "L1")
    expect(named(cad, "L1")?.lineweight).toBe(0.35)
    expect(written(cad, "LW", "-1").at(-1)).toBe("Invalid lweight number.")
    expect(written(cad, "FOO").at(-1)).toBe(
      "A weight in lineweight units is required."
    )
  })

  it("DELete deletes what it may, as the hidden option it is (p324–p327, p396)", () => {
    const cad = createHarness()
    answer(cad, "-LAYER", "N", "L1,L2,L3", "M", "K1", "DEL", "L*")
    expect(named(cad, "L1")).toBeUndefined()
    expect(written(cad, "DEL", "K1").at(-1)).toBe(
      "The selected layers could not be deleted."
    )
    expect(written(cad, "DEL", "ZZ").at(-1)).toBe(
      "No matching layer names found."
    )
  })

  it("? lists the layers in AutoCAD's columns (p390)", () => {
    const cad = createHarness()
    answer(cad, "-LAYER", "N", "L1,L2,Ab", "C", "1", "L1", "LO", "L2")
    answer(cad, "OFF", "L1", "LW", "0.5", "Ab")
    expect(written(cad, "?", "").slice(2)).toEqual([
      [
        "    Layer name        State          Color         Linetype     Lineweight",
        "------------------ ----------- ------------------ ------------ ------------",
        '"0"                on       -P   7 (white)        "Continuous"  0.250 mm.',
        '"Ab"               on       -P   7 (white)        "Continuous"  0.500 mm.',
        '"L1"               off      -P   1 (red)          "Continuous"  0.250 mm.',
        '"L2"               on     -L-P   7 (white)        "Continuous"  0.250 mm.',
        'Current layer: "0"',
      ].join("\n"),
    ])
    expect(written(cad, "?", "X*").at(-1)).toBe(
      "No matching layer names found."
    )
  })
})

describe("-LAYER typed transparently", () => {
  it("runs inside LINE, its prompts headed >>, and LINE goes on (p412)", () => {
    const cad = createHarness()
    answer(cad, "LINE", "0,0")
    expect(written(cad, "'-LAYER", "M", "L1", "")).toEqual([
      "Specify next point or [Undo]: '-LAYER",
      'Current layer:  "0"',
      `>>${OPTION} M`,
      ">>Enter name for new layer (becomes the current layer) <0>: L1",
      `>>${OPTION}`,
      "Resuming LINE command.",
    ])
    answer(cad, "100,0", "")
    expect(current(cad)).toBe("L1")
    expect(cad.latest().layerId).toBe(named(cad, "L1")?.id)
  })
})

describe("-LAYER's undo step", () => {
  it("is the whole run, U naming it (p304)", () => {
    const cad = createHarness()
    answer(cad, "-LAYER", "N", "L1", "C", "1", "L1", "")
    expect(written(cad, "U")).toEqual(["U", "-LAYER"])
    expect(named(cad, "L1")).toBeUndefined()
  })

  it("joins the -LAYER run just before, under UNDO's Layer (p303, p306)", () => {
    const cad = createHarness()
    answer(cad, "-LAYER", "N", "L1", "", "-LAYER", "S", "L1", "")
    expect(written(cad, "U")).toEqual(["U", "-LAYER -LAYER"])
    expect(current(cad)).toBe("0")
    expect(named(cad, "L1")).toBeUndefined()
  })

  it("stays its own with UNDO's Layer No (p315)", () => {
    const cad = createHarness()
    answer(cad, "UNDO", "C", "L", "N")
    answer(cad, "-LAYER", "N", "L1", "", "-LAYER", "S", "L1", "")
    expect(written(cad, "U")).toEqual(["U", "-LAYER"])
    expect(current(cad)).toBe("0")
    expect(named(cad, "L1")).toBeDefined()
  })

  it("is parted from the one before by any command between (p329)", () => {
    const cad = createHarness()
    answer(cad, "-LAYER", "N", "L1", "")
    answer(cad, "LINE", "0,0", "100,0", "")
    answer(cad, "-LAYER", "S", "L1", "")
    expect(written(cad, "U")).toEqual(["U", "-LAYER"])
    expect(written(cad, "U")).toEqual(["U", "LINE"])
    expect(named(cad, "L1")).toBeDefined()
  })

  it("regenerates on U after a lock (p302)", () => {
    const cad = createHarness()
    answer(cad, "-LAYER", "LO", "0", "")
    expect(written(cad, "U")).toEqual(["U", "-LAYER Regenerating model."])
    expect(named(cad, DEFAULT_LAYER_ID)?.locked).toBe(false)
  })
})

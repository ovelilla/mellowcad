import { describe, expect, it } from "vitest"
import { createHarness, type CadHarness } from "../../../test/harness"
import { lineOf, p } from "../../../test/builders"
import { createDimension } from "../../domain/entities"
import { es } from "../../locales/es"

/**
 * What sets CECOLOR, CELTYPE and CELWEIGHT — the Properties panel's drop-downs
 * with nothing selected, -COLOR, -LINETYPE's Set and -LWEIGHT — each an undo
 * step, as UNDO "displays the command or system variable name" it steps past;
 * and the objects that do not take them: FILLET's arc and CHAMFER's bevel,
 * whose "layer affects object properties including color and linetype".
 */

const RED = "#ff0000"

/** The question the dynamic-input box is asking right now. */
const asking = (cad: CadHarness) => cad.state().dynamicInput?.fields[0]

function setCurrent(cad: CadHarness) {
  cad.runtime.setCurrentColor(RED)
  cad.runtime.setCurrentLinetype("Hidden")
  cad.runtime.setCurrentLineweight(0.5)
  return cad
}

const corner = () => [
  lineOf(p(-50, 0), p(200, 0), { id: "L1" }),
  lineOf(p(0, -50), p(0, 200), { id: "L2" }),
]

describe("FILLET and CHAMFER", () => {
  it("make the arc ByLayer, not with the current properties", () => {
    const cad = setCurrent(createHarness({ entities: corner() }))

    cad
      .command("FILLET")
      .option("Radius")
      .type("50")
      .enter()
      .click(p(100, 0))
      .click(p(0, 100))

    const arc = cad.only("arc")
    expect(arc.color).toBeUndefined()
    expect(arc.linetype).toBeUndefined()
    expect(arc.lineweight).toBeUndefined()
  })

  it("make the bevel ByLayer, not with the current properties", () => {
    const cad = setCurrent(createHarness({ entities: corner() }))

    cad
      .command("CHAMFER")
      .option("Distance")
      .type("40")
      .enter()
      .type("60")
      .enter()
      .click(p(100, 0))
      .click(p(0, 100))

    const bevel = cad.entities().find((e) => !["L1", "L2"].includes(e.id))
    expect(bevel).toBeDefined()
    expect(bevel?.color).toBeUndefined()
    expect(bevel?.lineweight).toBeUndefined()
  })
})

describe("DIMBASELINE and DIMCONTINUE", () => {
  it.each(["DIMBASELINE", "DIMCONTINUE"])(
    "%s puts the dimension on the base's layer (DIMCONTINUEMODE 1)",
    (command) => {
      const cad = createHarness()
      const dims = cad.runtime.createLayer("Dims", undefined, false)
      cad.runtime.document.load([
        createDimension("linear", p(0, 0), p(100, 0), p(50, -30), {
          rotation: 0,
          layerId: dims,
          id: "D1",
        }),
      ])

      cad.command(command).click(p(200, 0)).escape()

      const made = cad.entities().filter((e) => e.id !== "D1")
      expect(made.map((e) => e.layerId)).toEqual([dims])
    }
  )
})

describe("the Properties panel's drop-downs", () => {
  it("set the current properties with nothing selected, one undo step each", () => {
    const cad = createHarness()

    cad.runtime.applyColorControl(RED)
    cad.runtime.applyLinetypeControl("Center")
    cad.runtime.applyLineweightControl(0.35)

    expect(cad.state()).toMatchObject({
      currentColor: RED,
      currentLinetype: "Center",
      currentLineweight: 0.35,
    })
    cad.undo()
    expect(cad.state().currentLineweight).toBe("ByLayer")
    expect(cad.state().currentLinetype).toBe("Center")
    cad.undo().undo()
    expect(cad.state().currentColor).toBe("ByLayer")
  })

  it("change the selection and leave the current properties alone", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
    })

    cad.select("L1")
    cad.runtime.applyColorControl(RED)
    cad.runtime.applyLinetypeControl("Center")
    cad.runtime.applyLineweightControl(0.35)

    expect(cad.byId("L1")).toMatchObject({
      color: RED,
      linetype: "Center",
      lineweight: 0.35,
    })
    expect(cad.state().currentColor).toBe("ByLayer")
  })

  it("take no value AutoCAD would not, and no step for the one already current", () => {
    const cad = createHarness()

    cad.runtime.setCurrentColor("not a colour")
    cad.runtime.setCurrentLinetype("Zigzag")
    cad.runtime.setCurrentLineweight(0.33)
    cad.runtime.setCurrentColor("ByLayer")

    expect(cad.state()).toMatchObject({
      currentColor: "ByLayer",
      currentLinetype: "ByLayer",
      currentLineweight: "ByLayer",
      canUndo: false,
    })
    cad.runtime.setCurrentColor("#F00")
    expect(cad.state().currentColor).toBe(RED)
  })
})

describe("-COLOR", () => {
  it("asks the default object colour, offering the current one", () => {
    const cad = createHarness()

    cad.command("-COLOR")
    expect(cad.state().commandLine.prompt).toBe(
      "-COLOR Enter default object color [Truecolor] <BYLAYER>:"
    )
    expect(asking(cad)).toMatchObject({
      label: "Enter default object color",
      placeholder: "BYLAYER",
    })
    expect(cad.optionIds()).toEqual(["Truecolor"])
    cad.type("red").enter()

    expect(cad.state().currentColor).toBe(RED)
    expect(cad.activeToolId()).toBe("select")
    cad.command("COLOR")
    expect(asking(cad)?.placeholder).toBe("1 (red)")
  })

  it("says what it needs when it cannot read the colour", () => {
    const cad = createHarness()

    cad.command("-COLOR").type("pink").enter()
    expect(cad.commandLog().at(-1)).toBe(
      "A color number or standard color name is required."
    )
    cad.option("Truecolor").type("210,155,300").enter()
    expect(cad.commandLog().at(-1)).toBe(
      "Invalid color.  Type three comma separated values from 0 to 255."
    )
    expect(asking(cad)?.label).toBe("Red,Green,Blue")
  })

  it("takes a colour by its capital, as AutoCAD's keywords read it", () => {
    const cad = createHarness()

    cad.command("-COLOR").type("r").enter()

    expect(cad.state().currentColor).toBe(RED)
  })

  it.each([
    ["1", "#ff0000"],
    ["5", "#0000ff"],
    ["Magenta", "#ff00ff"],
    ["bylayer", "ByLayer"],
  ])("takes %s", (typed, color) => {
    const cad = createHarness()
    cad.runtime.setCurrentColor("#00ff00")

    cad.command("COL").type(typed).enter()

    expect(cad.state().currentColor).toBe(color)
  })

  it("takes a true colour as three values from 0 to 255", () => {
    const cad = createHarness()

    cad.command("COLOR").option("Truecolor")
    expect(asking(cad)?.label).toBe("Red,Green,Blue")
    cad.type("210,155,300").enter()
    expect(cad.activeToolId()).toBe("color")
    cad.type("210, 155, 95").enter()

    expect(cad.state().currentColor).toBe("#d29b5f")
    cad.command("-COLOR")
    expect(asking(cad)?.placeholder).toBe("210,155,95")
  })

  it.each(["0", "8", "byblock", "pink"])(
    "asks again for %s, which it cannot draw",
    (typed) => {
      const cad = createHarness()

      cad.command("-COLOR").type(typed).enter()

      expect(cad.activeToolId()).toBe("color")
      expect(cad.state().currentColor).toBe("ByLayer")
    }
  )

  it("keeps the colour with Enter, and is one undo step otherwise", () => {
    const cad = createHarness()
    cad.command("-COLOR").enter()
    expect(cad.state().canUndo).toBe(false)

    cad.command("-COLOR").type("2").enter().undo()

    expect(cad.state().currentColor).toBe("ByLayer")
  })

  it.each(["COLOR", "-COLOR"])("runs as %s in Spanish", (name) => {
    const cad = createHarness({ locale: es })

    cad.command(name)
    expect(asking(cad)).toMatchObject({
      label: "Indique el color de objeto por defecto",
      placeholder: "PORCAPA",
    })
    cad.type("rojo").enter()
    expect(cad.state().currentColor).toBe(RED)

    cad.command(name).type("co").enter().type("0,0,255").enter()
    expect(cad.state().currentColor).toBe("#0000ff")
  })
})

describe("-LINETYPE", () => {
  it("sets the current linetype and asks for an option again", () => {
    const cad = createHarness()

    cad.command("-LINETYPE")
    expect(cad.commandLog().at(-1)).toBe('Current line type:  "ByLayer"')
    expect(cad.state().commandLine.prompt).toBe(
      "-LINETYPE Enter an option [?/Set]:"
    )
    cad.option("Set")
    expect(cad.state().commandLine.prompt).toBe(
      "-LINETYPE Specify linetype name or [?] <ByLayer>:"
    )
    cad.type("dashed").enter()

    expect(cad.state().currentLinetype).toBe("Dashed")
    expect(cad.state().commandLine.prompt).toBe(
      "-LINETYPE Enter an option [?/Set]:"
    )
    cad.enter()
    expect(cad.activeToolId()).toBe("select")
  })

  it("lists the linetypes with ? at either prompt", () => {
    const cad = createHarness()

    cad.command("LT").option("?")
    expect(cad.commandLog().at(-1)).toContain(
      'Linetypes defined in file acad.lin:\n\n      Name          Description\n---------------- -------------------\n"Continuous"     Solid line\n"Dashed"'
    )
    cad.option("Set").option("?")
    expect(cad.state().commandLine.prompt).toBe(
      "LINETYPE Enter linetype name(s) to list <*>:"
    )
    cad.type("d*").enter()
    expect(cad.commandLog().at(-1)).toBe(
      'ByLayer, ByBlock, or one of these loaded linetypes:\n\n      Name          Description\n---------------- ------------------\n"Dashed"\n"DashDot"'
    )
    expect(cad.state().commandLine.prompt).toBe(
      "LINETYPE Enter an option [?/Set]:"
    )
  })

  it("says a linetype it does not have is not in acad.lin, and asks the option again", () => {
    const cad = createHarness()

    cad.command("LINETYPE").option("Set").type("ZIGZAG").enter()

    expect(cad.commandLog().at(-1)).toBe(
      'Linetype "ZIGZAG" not found in acad.lin.\nYou can use the "Load" option to load it from another file.'
    )
    expect(cad.activeToolId()).toBe("linetype")
    expect(cad.state().currentLinetype).toBe("ByLayer")
  })

  it("goes back to ByLayer, one undo step", () => {
    const cad = createHarness()
    cad.runtime.setCurrentLinetype("Center")

    cad.command("-LINETYPE").option("Set").type("BYLAYER").enter().enter()
    expect(cad.state().currentLinetype).toBe("ByLayer")

    cad.undo()
    expect(cad.state().currentLinetype).toBe("Center")
  })

  it.each(["TIPOLIN", "-TIPOLIN"])("runs as %s in Spanish", (name) => {
    const cad = createHarness({ locale: es })

    cad.command(name)
    expect(cad.commandLog().at(-1)).toBe('Tipo de línea actual: "PorCapa"')
    expect(cad.state().commandLine.prompt).toContain(
      "Indique una opción [?/Definir]:"
    )
    cad.option("Set").type("hidden").enter()

    expect(cad.state().currentLinetype).toBe("Hidden")
  })
})

describe("-LWEIGHT", () => {
  it("shows the current lineweight and asks the new one", () => {
    const cad = createHarness()

    cad.command("-LWEIGHT")
    expect(cad.commandLog().at(-1)).toBe("Current lineweight: BYLAYER")
    expect(cad.state().commandLine.prompt).toBe(
      "-LWEIGHT Enter default lineweight for new objects or [?]:"
    )
    expect(asking(cad)?.placeholder).toBe("BYLAYER")
    cad.type("0.5").enter()

    expect(cad.state().currentLineweight).toBe(0.5)
    expect(cad.activeToolId()).toBe("select")
    cad.command("LW")
    expect(cad.commandLog().at(-1)).toBe("Current lineweight: 0.50 mm")
  })

  it.each([
    ["0.33", 0.35],
    ["0.31", 0.3],
    ["7", 2.11],
    ["-1", 0],
    ["bylayer", "ByLayer"],
  ])("sets %s to the nearest valid lineweight", (typed, lineweight) => {
    const cad = createHarness()
    cad.runtime.setCurrentLineweight(1)

    cad.command("LW").type(typed).enter()

    expect(cad.state().currentLineweight).toBe(lineweight)
  })

  it("says it rounds to a valid lineweight, and what it needs", () => {
    const cad = createHarness()

    cad.command("-LWEIGHT").type("thin").enter()
    expect(cad.commandLog().at(-1)).toBe(
      "A weight in lineweight units is required."
    )
    cad.type("0.33").enter()

    expect(cad.commandLog().at(-1)).toBe(
      "Lineweight rounded to nearest valid value of 0.35 mm"
    )
  })

  it("lists the valid lineweights with ? and asks again", () => {
    const cad = createHarness()

    cad.command("LWEIGHT").type("?").enter()

    expect(cad.commandLog().at(-1)).toBe(
      [
        "ByLayer",
        "0.00 mm 0.05 mm  0.09 mm    0.13 mm 0.15 mm  0.18 mm",
        "0.20 mm 0.25 mm  0.30 mm    0.35 mm 0.40 mm  0.50 mm",
        "0.53 mm 0.60 mm  0.70 mm    0.80 mm 0.90 mm  1.00 mm",
        "1.06 mm 1.20 mm  1.40 mm    1.58 mm 2.00 mm  2.11 mm",
      ].join("\n")
    )
    expect(cad.activeToolId()).toBe("lweight")
  })

  it("keeps the lineweight with Enter, and is one undo step otherwise", () => {
    const cad = createHarness()
    cad.command("-LWEIGHT").enter()
    expect(cad.state().canUndo).toBe(false)

    cad.command("-LWEIGHT").type("0.7").enter().undo()

    expect(cad.state().currentLineweight).toBe("ByLayer")
  })

  it.each(["GROSORLIN", "-GROSORLIN"])("runs as %s in Spanish", (name) => {
    const cad = createHarness({ locale: es })

    cad.command(name)
    expect(cad.commandLog().at(-1)).toBe("Grosor de línea actual: PORCAPA")
    cad.type("0.25").enter()

    expect(cad.state().currentLineweight).toBe(0.25)
  })
})

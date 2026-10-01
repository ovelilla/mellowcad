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
      .type("40", "dist1")
      .type("60", "dist2")
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
    expect(asking(cad)).toMatchObject({
      label: "Enter default object color [Truecolor]",
      placeholder: "BYLAYER",
    })
    expect(cad.optionIds()).toEqual(["Truecolor"])
    cad.type("red").enter()

    expect(cad.state().currentColor).toBe(RED)
    expect(cad.activeToolId()).toBe("select")
    cad.command("COLOR")
    expect(asking(cad)?.placeholder).toBe("RED")
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
    expect(asking(cad)?.label).toBe("Red, Green, Blue")
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
      label: "Indique color de objeto por defecto [COlorverdadero]",
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
    expect(asking(cad)?.label).toBe("Enter an option [?/Set]")
    cad.option("Set")
    expect(asking(cad)).toMatchObject({
      label: "Specify linetype name or [?]",
      placeholder: "BYLAYER",
    })
    cad.type("dashed").enter()

    expect(cad.state().currentLinetype).toBe("Dashed")
    expect(asking(cad)?.label).toBe("Enter an option [?/Set]")
    cad.enter()
    expect(cad.activeToolId()).toBe("select")
  })

  it("lists the linetypes with ? at either prompt", () => {
    const cad = createHarness()

    cad.command("LT").type("?").enter()
    expect(cad.commandLog().at(-1)).toContain("Continuous\nDashed")
    cad.option("Set").type("?").enter()
    expect(cad.commandLog().at(-1)).toContain("DashDot")
    expect(asking(cad)?.label).toBe("Specify linetype name or [?]")
  })

  it("returns to the Command prompt for a linetype it does not have", () => {
    const cad = createHarness()

    cad.command("LINETYPE").option("Set").type("ZIGZAG").enter()

    expect(cad.activeToolId()).toBe("select")
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
    expect(asking(cad)?.label).toBe("Indique una opción [?/Defina]")
    cad.option("Set").type("hidden").enter()

    expect(cad.state().currentLinetype).toBe("Hidden")
  })
})

describe("-LWEIGHT", () => {
  it("shows the current lineweight and asks the new one", () => {
    const cad = createHarness()

    cad.command("-LWEIGHT")
    expect(cad.commandLog().at(-1)).toBe("Current lineweight: BYLAYER")
    expect(asking(cad)).toMatchObject({
      label: "Enter default lineweight for new objects or [?]",
      placeholder: "BYLAYER",
    })
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

  it("lists the valid lineweights with ? and asks again", () => {
    const cad = createHarness()

    cad.command("LWEIGHT").type("?").enter()

    expect(cad.commandLog().at(-1)).toMatch(/^0\.00 mm {3}0\.05 mm/)
    expect(cad.commandLog().at(-1)).toContain("2.11 mm")
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

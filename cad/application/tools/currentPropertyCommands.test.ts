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

/** Each answer typed at the command line and confirmed, as the console types it. */
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

  it("give a selection no linetype that is not loaded, as with nothing selected", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" })],
    })

    cad.select("L1")
    cad.runtime.applyLinetypeControl("Zigzag")

    expect(cad.byId("L1").linetype).toBeUndefined()
    expect(cad.state().canUndo).toBe(false)
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
    cad.type("210,155,95").enter()

    expect(cad.state().currentColor).toBe("#d29b5f")
    cad.command("-COLOR")
    expect(asking(cad)?.placeholder).toBe("210,155,95")
  })

  it("refuses at Red,Green,Blue two values, one past 255, spaces and Enter (probes properties/p119, p120, p139s, p124)", () => {
    const cad = createHarness()
    answer(cad, "-COLOR", "_T")

    // A space is the prompt's Enter in AutoCAD: `210, 155, 95` answers
    // `210,` there, which it refuses (p139s).
    expect(written(cad, "255,0", "300,0,0", "210, 155, 95", "")).toEqual([
      "Red,Green,Blue: 255,0",
      "Invalid color.  Type three comma separated values from 0 to 255.",
      "Red,Green,Blue: 300,0,0",
      "Invalid color.  Type three comma separated values from 0 to 255.",
      "Red,Green,Blue: 210, 155, 95",
      "Invalid color.  Type three comma separated values from 0 to 255.",
      "Red,Green,Blue:",
      "Invalid color.  Type three comma separated values from 0 to 255.",
    ])
    expect(written(cad, "1,2,3")).toEqual(["Red,Green,Blue: 1,2,3"])
    answer(cad, "-COLOR")
    expect(cad.state().commandLine.prompt).toBe(
      "-COLOR Enter default object color [Truecolor] <1,2,3>:"
    )
  })

  it.each([
    ["0", "p100"],
    ["256", "p105"],
    ["-1", "p106"],
  ])(
    "refuses %s as an invalid colour number (probe properties/%s)",
    (typed) => {
      const cad = createHarness()
      answer(cad, "-COLOR")

      expect(written(cad, typed)).toEqual([
        `Enter default object color [Truecolor] <BYLAYER>: ${typed}`,
        "Invalid color number.",
      ])
      expect(cad.activeToolId()).toBe("color")
    }
  )

  it("needs a colour number or name for 1.5 and FOO (probes properties/p135, p116)", () => {
    const cad = createHarness()
    answer(cad, "-COLOR")

    expect(written(cad, "1.5", "FOO")).toEqual([
      "Enter default object color [Truecolor] <BYLAYER>: 1.5",
      "A color number or standard color name is required.",
      "Enter default object color [Truecolor] <BYLAYER>: FOO",
      "A color number or standard color name is required.",
    ])
  })

  // WHY asked again: AutoCAD takes 8 (p103) and ByBlock (p114, p115); this
  // build has no RGB for 8–255 and does not model ByBlock.
  it.each(["8", "byblock", "_BYBLOCK"])(
    "asks again for %s, which AutoCAD takes and this build cannot draw",
    (typed) => {
      const cad = createHarness()

      cad.command("-COLOR").type(typed).enter()

      expect(cad.activeToolId()).toBe("color")
      expect(cad.state().currentColor).toBe("ByLayer")
    }
  )

  it("asks which of BYBlock and BYLayer BY means (probe properties/p139t)", () => {
    const cad = createHarness()
    cad.runtime.setCurrentColor(RED)
    answer(cad, "-COLOR")

    expect(written(cad, "BY", "BYL")).toEqual([
      "Enter default object color [Truecolor] <1 (red)>: BY",
      "Ambiguous response, please clarify...",
      "BYBlock or BYLayer? BYL",
    ])
    expect(cad.state().currentColor).toBe("ByLayer")
  })

  it("keeps the colour with Enter, and is one undo step either way (probes properties/p129, p128)", () => {
    const cad = createHarness()
    cad.command("-COLOR").enter()
    // A run that changes nothing is a step U names.
    cad.command("_U")
    expect(cad.commandLog().at(-1)).toBe("-COLOR")

    cad.command("-COLOR").type("2").enter().undo()

    expect(cad.state().currentColor).toBe("ByLayer")
  })

  it("is taken back by UNDO 2 and put back by REDO, each naming the steps (probe properties/p130)", () => {
    const cad = createHarness()
    answer(cad, "-COLOR", "1", "-COLOR", "2")

    expect(written(cad, "UNDO", "2").at(-1)).toBe("-COLOR -COLOR")
    expect(cad.state().currentColor).toBe("ByLayer")
    expect(written(cad, "REDO")).toEqual([
      "REDO",
      "-COLOR -COLOR",
      "Everything has been redone",
    ])
    expect(cad.state().currentColor).toBe("#ffff00")
  })

  it("runs 'ZOOM at its prompt and resumes, at the command line and in the box (probe properties/p134)", () => {
    const cad = createHarness()
    answer(cad, "-COLOR")

    expect(written(cad, "'ZOOM", "E")).toEqual([
      "Enter default object color [Truecolor] <BYLAYER>: 'ZOOM",
      // ZOOM's own prompt, as this build words it (its options: view.md).
      ">>Specify corner of window, enter a scale factor (nX or nXP), or [All/Extents/Previous/Scale/Window/Object]: E",
      "** Requires a regen, cannot be transparent.",
      "Resuming -COLOR command.",
    ])
    cad.type("'ZOOM").enter()
    expect(cad.activeToolId()).toBe("zoom")
    cad.type("E").enter()
    expect(cad.commandLog().at(-1)).toBe("Resuming -COLOR command.")
    cad.type("1").enter()
    expect(cad.state().currentColor).toBe(RED)
  })

  it("gives each LINE segment run through it the colour current as it starts (probe properties/p126)", () => {
    const cad = createHarness()
    answer(cad, "LINE", "0,0")

    expect(
      written(cad, "'-COLOR", "1", "@10,0", "'-COLOR", "2", "@0,10", "")
    ).toEqual([
      "Specify next point or [Undo]: '-COLOR",
      ">>Enter default object color [Truecolor] <BYLAYER>: 1",
      "Resuming LINE command.",
      "Specify next point or [Undo]: @10,0",
      "Specify next point or [Undo]: '-COLOR",
      ">>Enter default object color [Truecolor] <1 (red)>: 2",
      "Resuming LINE command.",
      "Specify next point or [Undo]: @0,10",
      "Specify next point or [Close/Undo]:",
    ])
    expect(cad.entities().map((e) => e.color)).toEqual([RED, "#ffff00"])
  })

  it("runs as COLOUR in English, not in Spanish (probes properties/p137, p137b)", () => {
    const cad = createHarness()
    expect(written(cad, "COLOUR")[0]).toBe("COLOUR COLOR")
    expect(cad.activeToolId()).toBe("color")

    const spanish = createHarness({ locale: es })
    expect(written(spanish, "COLOUR")).toEqual([
      'Comando "COLOUR" desconocido. Pulse F1 para obtener ayuda.',
    ])
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
  it("runs as COL in Spanish, and offers <1 (rojo)> after 1 (probes properties/p136, p101)", () => {
    const cad = createHarness({ locale: es })
    answer(cad, "COL", "1", "-COLOR")

    expect(cad.state().commandLine.prompt).toBe(
      "-COLOR Indique el color de objeto por defecto [COlorverdadero] <1 (rojo)>:"
    )
  })

  it("takes porCapa's C in Spanish, at the command line and in the box (probe properties/p113c)", () => {
    const cad = createHarness({ locale: es })
    cad.runtime.setCurrentColor("#00ff00")
    answer(cad, "-COLOR", "C")
    expect(cad.state().currentColor).toBe("ByLayer")

    cad.runtime.setCurrentColor("#00ff00")
    cad.command("-COLOR").type("C").enter()
    expect(cad.state().currentColor).toBe("ByLayer")
  })

  it.each([
    ["RED", RED, "p107b"],
    ["BYLAYER", "ByLayer", "p113b"],
    ["PORC", "ByLayer", "p113d"],
  ])("takes %s in Spanish as %s (probe properties/%s)", (typed, color) => {
    const cad = createHarness({ locale: es })
    cad.runtime.setCurrentColor("#00ff00")

    answer(cad, "-COLOR", typed)

    expect(cad.state().currentColor).toBe(color)
    expect(cad.activeToolId()).toBe("select")
  })

  it("refuses in Spanish the English words short: BY, BYL (probe properties/p139t)", () => {
    const cad = createHarness({ locale: es })
    answer(cad, "-COLOR")

    expect(written(cad, "BY", "BYL")).toEqual([
      "Indique el color de objeto por defecto [COlorverdadero] <PORCAPA>: BY",
      "Se necesita un número o nombre de color normalizado.",
      "Indique el color de objeto por defecto [COlorverdadero] <PORCAPA>: BYL",
      "Se necesita un número o nombre de color normalizado.",
    ])
  })

  // WHY asked again: AutoCAD takes it (p115), ByBlock is not modelled.
  it("asks again for BYBLOCK in Spanish", () => {
    const cad = createHarness({ locale: es })
    answer(cad, "-COLOR", "BYBLOCK")

    expect(cad.commandLog().at(-1)).toBe(
      "Se necesita un número o nombre de color normalizado."
    )
    expect(cad.activeToolId()).toBe("color")
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

  it("offers the current linetype at Set, and goes back to the option prompt on Enter (probes properties/p226, p220)", () => {
    const cad = createHarness()
    answer(cad, "-LINETYPE", "S", "Continuous", "S")
    expect(cad.state().commandLine.prompt).toBe(
      "-LINETYPE Specify linetype name or [?] <Continuous>:"
    )

    answer(cad, "")

    expect(cad.commandLog().at(-1)).toBe(
      "Specify linetype name or [?] <Continuous>:"
    )
    expect(cad.state().commandLine.prompt).toBe(
      "-LINETYPE Enter an option [?/Set]:"
    )
    expect(cad.state().currentLinetype).toBe("Continuous")
  })

  it("lists acadiso.lin's linetypes at the option prompt, in the file's order and without Continuous (probe properties/p202)", () => {
    const cad = createHarness()

    // probe line/p205: a metric drawing's file is acadiso.lin
    cad.command("LT").option("?")
    expect(cad.commandLog().at(-1)).toBe(
      'Linetypes defined in file acadiso.lin:\n\n      Name          Description\n---------------- -------------------\n"Center"\n"DashDot"\n"Dashed"\n"Hidden"\n"Phantom"'
    )
    expect(cad.state().commandLine.prompt).toBe(
      "LINETYPE Enter an option [?/Set]:"
    )
  })

  it("lists the loaded linetypes at Set's ?, sorted by name whatever their case (probe properties/p217)", () => {
    const cad = createHarness()

    cad.command("LT").option("Set").option("?")
    expect(cad.state().commandLine.prompt).toBe(
      "LINETYPE Enter linetype name(s) to list <*>:"
    )
    cad.type("D*,C*").enter()
    expect(cad.commandLog().at(-1)).toBe(
      'ByLayer, ByBlock, or one of these loaded linetypes:\n\n      Name          Description\n---------------- ------------------\n"Center"\n"Continuous"     Solid line\n"DashDot"\n"Dashed"'
    )
    expect(cad.state().commandLine.prompt).toBe(
      "LINETYPE Enter an option [?/Set]:"
    )
  })

  it("writes the heading and the no-match words on the dashes' line (probe properties/p218)", () => {
    const cad = answer(createHarness(), "-LINETYPE", "S", "?", "NOPE*")
    const sp = answer(
      createHarness({ locale: es }),
      "-TIPOLIN",
      "D",
      "?",
      "NOPE*"
    )

    expect(cad.commandLog().at(-1)).toBe(
      "ByLayer, ByBlock, or one of these loaded linetypes:\n\n      Name          Description\n---------------- ------------------  No matching linetype names found."
    )
    expect(sp.commandLog().at(-1)).toBe(
      "porCapa, porBloque o uno de estos tipos de línea cargados:\n\n      Nombre         Descripción\n---------------- ------------------  Tipo de línea no encontrado."
    )
  })

  it("says a linetype it does not have is not in acad.lin, and asks the option again (probe properties/p213)", () => {
    const cad = createHarness()

    // WHY acad.lin in a metric drawing: AutoCAD 2027 names it so (p213),
    // where its `?` offers acadiso.lin (p202).
    cad.command("LINETYPE").option("Set").type("FOO").enter()

    expect(cad.commandLog().at(-1)).toBe(
      'Linetype "FOO" not found in acad.lin.\nYou can use the "Load" option to load it from another file.'
    )
    expect(cad.activeToolId()).toBe("linetype")
    expect(cad.state().currentLinetype).toBe("ByLayer")

    const sp = answer(createHarness({ locale: es }), "-TIPOLIN", "D", "NOPE")
    expect(sp.commandLog().at(-1)).toBe(
      'Tipo de línea "NOPE" no encontrado en acad.lin.\nPuede utilizar la opción "Cargar" para cargarlo desde otro archivo.'
    )
  })

  it("goes back to ByLayer, one undo step", () => {
    const cad = createHarness()
    cad.runtime.setCurrentLinetype("Center")

    cad.command("-LINETYPE").option("Set").type("BYLAYER").enter().enter()
    expect(cad.state().currentLinetype).toBe("ByLayer")

    cad.undo()
    expect(cad.state().currentLinetype).toBe("Center")
  })

  it.each<[string, readonly string[]]>([
    ["English", ["BYLAYER", "bylayer", "BYL", "_BYL", "_BYLAYER"]],
    ["Spanish", ["BYLAYER", "bylayer", "_BYL", "C", "PORCAPA", "porcapa"]],
  ])(
    "takes ByLayer at Set in %s: the table's name whole, the keyword, the global word (probes properties/p224, p225, p228, p229)",
    (language, typed) => {
      for (const name of typed) {
        const cad = createHarness(language === "Spanish" ? { locale: es } : {})
        cad.runtime.setCurrentLinetype("Center")

        answer(cad, "_-LINETYPE", "_S", name)

        expect(cad.state().currentLinetype, name).toBe("ByLayer")
      }
    }
  )

  it.each(["BYL", "POR"])(
    "refuses %s in Spanish as a linetype not found (probes properties/p223, p228)",
    (typed) => {
      const cad = createHarness({ locale: es })
      cad.runtime.setCurrentLinetype("Center")

      answer(cad, "-TIPOLIN", "D", typed)

      expect(cad.commandLog().at(-1)).toBe(
        `Tipo de línea "${typed}" no encontrado en acad.lin.\nPuede utilizar la opción "Cargar" para cargarlo desde otro archivo.`
      )
      expect(cad.state().currentLinetype).toBe("Center")
    }
  )

  it("is taken back by U and put back by REDO, each naming it (probe properties/p246)", () => {
    const cad = answer(createHarness(), "-LINETYPE", "S", "Continuous", "")

    expect(written(cad, "U")).toEqual(["U", "-LINETYPE"])
    expect(cad.state().currentLinetype).toBe("ByLayer")
    expect(written(cad, "REDO")).toEqual([
      "REDO",
      "-LINETYPE",
      "Everything has been redone",
    ])
    expect(cad.state().currentLinetype).toBe("Continuous")

    const sp = answer(
      createHarness({ locale: es }),
      "-TIPOLIN",
      "D",
      "Continuous",
      ""
    )
    expect(written(sp, "H")).toEqual(["H", "-TIPOLIN"])
  })

  it("is a step U names when it changed nothing (probe properties/p247)", () => {
    const cad = answer(createHarness(), "-LINETYPE", "")

    expect(written(cad, "U")).toEqual(["U", "-LINETYPE"])
  })

  it("takes back two Sets of one run with one U (probe properties/p248)", () => {
    // p248's second Set is _BYBLOCK, not modelled here: Center stands in.
    const cad = answer(
      createHarness(),
      "-LINETYPE",
      "S",
      "Continuous",
      "S",
      "Center",
      ""
    )

    expect(written(cad, "U")).toEqual(["U", "-LINETYPE"])
    expect(cad.state().currentLinetype).toBe("ByLayer")
  })

  it("is taken back by UNDO 2 with LTSCALE and put back by REDO, each naming both (probe properties/p249)", () => {
    const cad = answer(
      createHarness(),
      "-LINETYPE",
      "S",
      "Continuous",
      "",
      "LTSCALE",
      "2"
    )

    expect(written(cad, "UNDO", "2").at(-1)).toBe(
      "LTSCALE -LINETYPE Regenerating model."
    )
    expect(cad.state()).toMatchObject({
      currentLinetype: "ByLayer",
      ltScale: 1,
    })
    expect(written(cad, "REDO").slice(1)).toEqual([
      "-LINETYPE LTSCALE",
      "Everything has been redone",
      "Regenerating model.",
    ])
    expect(cad.state()).toMatchObject({
      currentLinetype: "Continuous",
      ltScale: 2,
    })
  })

  it("gives each LINE segment run through it the linetype current as it starts (probes properties/p250, p251)", () => {
    const cad = answer(createHarness(), "LINE", "0,0", "10,0")

    expect(
      written(cad, "'-LINETYPE", "S", "Continuous", "", "20,0", "")
    ).toEqual([
      "Specify next point or [Undo]: '-LINETYPE",
      'Current line type:  "ByLayer"',
      ">>Enter an option [?/Set]: S",
      ">>Specify linetype name or [?] <ByLayer>: Continuous",
      ">>Enter an option [?/Set]:",
      "Resuming LINE command.",
      "Specify next point or [Undo]: 20,0",
      "Specify next point or [Close/Undo]:",
    ])
    expect(cad.entities().map((e) => e.linetype)).toEqual([
      undefined,
      "Continuous",
    ])

    const first = answer(
      createHarness(),
      "LINE",
      "0,0",
      "'-LINETYPE",
      "S",
      "Continuous",
      "",
      "10,0",
      ""
    )
    expect(first.entities().map((e) => e.linetype)).toEqual(["Continuous"])
  })

  it.each(["LTYPE", "-LT", "-LTYPE", "DDLTYPE"])(
    "runs as %s in English (probe properties/p253)",
    (name) => {
      const cad = answer(createHarness(), name)

      expect(cad.activeToolId()).toBe("linetype")
    }
  )

  it.each(["TIPOLIN", "-TIPOLIN", "TL", "-TL", "TLINEA", "-TLINEA", "DDLTYPE"])(
    "runs as %s in Spanish (probe properties/p253)",
    (name) => {
      const cad = createHarness({ locale: es })

      cad.command(name)
      expect(cad.commandLog().at(-1)).toBe('Tipo de línea actual: "PorCapa"')
      expect(cad.state().commandLine.prompt).toContain(
        "Indique una opción [?/Definir]:"
      )
      cad.option("Set").type("hidden").enter()

      expect(cad.state().currentLinetype).toBe("Hidden")
    }
  )

  it("does not run as LT in Spanish, which is LIST there (probe properties/p254)", () => {
    const cad = answer(createHarness({ locale: es }), "LT")

    expect(cad.activeToolId()).not.toBe("linetype")
  })
})

describe("-LWEIGHT", () => {
  const PROMPT = "Enter default lineweight for new objects or [?]:"

  it("shows the current lineweight and asks the new one (probes properties/p140, p164)", () => {
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

  it.each<[string, number | string, string]>([
    ["0.25", 0.25, "p141"],
    ["2.11", 2.11, "p144"],
    ["0.33", 0.35, "p142"],
    ["3", 2.11, "p145"],
    ["25", 2.11, "p160"],
    ["bylayer", "ByLayer", "p148"],
  ])(
    "sets %s to %s, the nearest valid lineweight (probe properties/%s)",
    (typed, lineweight) => {
      const cad = createHarness()
      cad.runtime.setCurrentLineweight(1)

      cad.command("LW").type(typed).enter()

      expect(cad.state().currentLineweight).toBe(lineweight)
    }
  )

  it.each([
    ["0.325", 0.3, "0.30 mm", "p143"],
    ["0.07", 0.05, "0.05 mm", "p161"],
  ])(
    "takes the thinner on a tie: %s is %s, written %s (probe properties/%s)",
    (typed, lineweight, label) => {
      const cad = createHarness()
      answer(cad, "-LWEIGHT")

      expect(written(cad, typed)).toEqual([
        `${PROMPT} ${typed}`,
        `Lineweight rounded to nearest valid value of ${label}`,
      ])
      expect(cad.state().currentLineweight).toBe(lineweight)
    }
  )

  it("refuses -1 as an invalid lweight number and asks again (probe properties/p146)", () => {
    const cad = createHarness()
    answer(cad, "-LWEIGHT")

    expect(written(cad, "-1", "_-LWEIGHT")).toEqual([
      `${PROMPT} -1`,
      "Invalid lweight number.",
      `${PROMPT} _-LWEIGHT`,
      "A weight in lineweight units is required.",
    ])
    expect(cad.activeToolId()).toBe("lweight")
    expect(cad.state().currentLineweight).toBe("ByLayer")

    const spanish = createHarness({ locale: es })
    answer(spanish, "-GROSORLIN", "-1")
    expect(spanish.commandLog().at(-1)).toBe(
      "Número de grosor de línea no válido."
    )
  })

  it("names 0 None, in its heading and transparently, and rounds to 0.00 mm (probes properties/p140, p140b)", () => {
    const cad = createHarness()
    answer(cad, "-LWEIGHT")
    expect(written(cad, "0.02")).toEqual([
      `${PROMPT} 0.02`,
      "Lineweight rounded to nearest valid value of 0.00 mm",
    ])
    expect(cad.state().currentLineweight).toBe(0)

    expect(written(cad, "-LWEIGHT").at(-1)).toBe("Current lineweight: None")
    expect(asking(cad)?.placeholder).toBe("None")
    answer(cad, "", "LINE", "0,0")
    expect(written(cad, "'-LWEIGHT")[1]).toBe(">>Current lineweight: >>None")

    const spanish = createHarness({ locale: es })
    answer(spanish, "-GROSORLIN", "0", "-GROSORLIN")
    expect(spanish.commandLog().at(-1)).toBe("Grosor de línea actual: Ninguno")
  })

  it("says it rounds to a valid lineweight, and what it needs (probes properties/p142, p147)", () => {
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

  it.each([
    ["_BYLAYER", "en", "p148"],
    ["BYL", "en", "p148"],
    ["_BYLAYER", "es", "p148"],
    ["PORC", "es", "p148c"],
    ["C", "es", "p148d"],
  ])("takes %s (%s) as ByLayer (probe properties/%s)", (typed, language) => {
    const cad = createHarness(language === "es" ? { locale: es } : {})
    cad.runtime.setCurrentLineweight(0.5)

    answer(cad, "_-LWEIGHT", typed)

    expect(cad.state().currentLineweight).toBe("ByLayer")
    expect(cad.activeToolId()).toBe("select")
  })

  // The first line names ByLayer alone (ByBlock and Default are not
  // modelled), in English in Spanish too, as p151's es-ES console writes it.
  it("lists the valid lineweights with ? and asks again (probe properties/p151)", () => {
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

    const spanish = createHarness({ locale: es })
    answer(spanish, "-GROSORLIN", "?")
    expect(spanish.commandLog().at(-1)?.split("\n")[0]).toBe("ByLayer")
  })

  it("keeps the lineweight with Enter, and is one undo step either way (probes properties/p156, p155)", () => {
    const cad = createHarness()
    cad.command("-LWEIGHT").enter()
    cad.command("_U")
    expect(cad.commandLog().at(-1)).toBe("-LWEIGHT")

    cad.command("-LWEIGHT").type("0.7").enter().undo()

    expect(cad.state().currentLineweight).toBe("ByLayer")
  })

  it("is the step U names -GROSORLIN in Spanish, typed either way (probes properties/p155, p156)", () => {
    const cad = createHarness({ locale: es })
    answer(cad, "_-LWEIGHT", "0.5")
    expect(written(cad, "H")).toEqual(["H", "-GROSORLIN"])
    expect(cad.state().currentLineweight).toBe("ByLayer")

    answer(cad, "-GROSORLIN", "")
    expect(written(cad, "H")).toEqual(["H", "-GROSORLIN"])
  })

  it("runs 'ZOOM at its prompt and resumes (probe properties/p165)", () => {
    const cad = createHarness()
    answer(cad, "-LWEIGHT")

    const lines = written(cad, "'ZOOM", "E")
    expect(lines[1]).toMatch(/^>>Specify corner of window/)
    expect(lines.at(-1)).toBe("Resuming -LWEIGHT command.")
    answer(cad, "0.5")
    expect(cad.state().currentLineweight).toBe(0.5)

    const spanish = createHarness({ locale: es })
    answer(spanish, "-GROSORLIN", "'ZOOM", "E")
    expect(spanish.commandLog().at(-1)).toBe(
      "Reanudando el comando -GROSORLIN."
    )
  })

  it("gives each LINE segment run through it the lineweight current as it starts (probe properties/p154)", () => {
    const cad = createHarness()
    answer(cad, "LINE", "0,0")

    expect(
      written(cad, "'-LWEIGHT", "0.5", "@10,0", "'-LWEIGHT", "0.7", "@0,10", "")
    ).toEqual([
      "Specify next point or [Undo]: '-LWEIGHT",
      ">>Current lineweight: >>BYLAYER",
      ">>Enter default lineweight for new objects or [?]: 0.5",
      "Resuming LINE command.",
      "Specify next point or [Undo]: @10,0",
      "Specify next point or [Undo]: '-LWEIGHT",
      ">>Current lineweight: >>0.50 mm",
      ">>Enter default lineweight for new objects or [?]: 0.7",
      "Resuming LINE command.",
      "Specify next point or [Undo]: @0,10",
      "Specify next point or [Close/Undo]:",
    ])
    expect(cad.entities().map((e) => e.lineweight)).toEqual([0.5, 0.7])
  })

  it("runs as LINEWEIGHT in English (probe properties/p162)", () => {
    const cad = createHarness()
    expect(written(cad, "LINEWEIGHT")[0]).toBe("LINEWEIGHT LWEIGHT")
    expect(cad.activeToolId()).toBe("lweight")
  })

  it("runs as LINEWEIGHT in Spanish, acad.pgp's alias of GROSORLIN (probe names/p24)", () => {
    const cad = createHarness({ locale: es })
    expect(written(cad, "LINEWEIGHT")[0]).toBe("LINEWEIGHT GROSORLIN")
    expect(cad.activeToolId()).toBe("lweight")
  })

  // Spanish AutoCAD writes BYLAYER, not PORCAPA, in its heading (p140 es-ES).
  it.each(["GROSORLIN", "-GROSORLIN"])(
    "runs as %s in Spanish (probes properties/p163, p140)",
    (name) => {
      const cad = createHarness({ locale: es })

      cad.command(name)
      expect(cad.commandLog().at(-1)).toBe("Grosor de línea actual: BYLAYER")
      expect(asking(cad)?.placeholder).toBe("BYLAYER")
      cad.type("0.25").enter()

      expect(cad.state().currentLineweight).toBe(0.25)
    }
  )

  it("is written >>Grosor de línea actual: >>BYLAYER transparently in Spanish (probe properties/p154)", () => {
    const cad = createHarness({ locale: es })
    answer(cad, "LINEA", "0,0")

    expect(written(cad, "'_-LWEIGHT")[1]).toBe(
      ">>Grosor de línea actual: >>BYLAYER"
    )
  })
})

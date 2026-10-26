import { describe, expect, it } from "vitest"
import { createHarness } from "../../../test/harness"
import { lineOf, p } from "../../../test/builders"
import type { Vec2 } from "../../geometry/Vec2"
import { SnapType } from "../snapping/types"
import {
  AttributeDefinitionEntity,
  AttributeModes,
  DEFAULT_ATTRIBUTE_MODES,
  InsertEntity,
  LineEntity,
  createAttributeDefinition,
  createBlockDefinition,
  createInsert,
  insertGeometry,
} from "../../domain/entities"
import { parseDrawingFile } from "../../serialization/drawingFile"
import { es } from "../../locales/es"
import { THEME } from "../../scene/theme"

type Harness = ReturnType<typeof createHarness>

const modes = (overrides: Partial<AttributeModes> = {}): AttributeModes => ({
  ...DEFAULT_ATTRIBUTE_MODES,
  ...overrides,
})

const partDefinition = (overrides: Partial<AttributeModes> = {}) =>
  createAttributeDefinition(p(0, 10), "PART", {
    prompt: "Part number",
    value: "X-0",
    height: 5,
    modes: modes(overrides),
    id: "def-part",
  })

/** A 100-unit bar with one attribute above it. */
const taggedBlock = (...definitions: AttributeDefinitionEntity[]) =>
  createBlockDefinition("TAG", p(0, 0), [
    lineOf(p(0, 0), p(100, 0), { id: "tag-line" }),
    ...(definitions.length > 0 ? definitions : [partDefinition()]),
  ])

/** The question the dynamic-input box is asking right now. */
const asking = (cad: Harness) => cad.state().dynamicInput?.fields[0]?.label

const drawnTexts = (cad: Harness) =>
  cad
    .scene()
    .primitives.flatMap((prim) => (prim.kind === "text" ? [prim.text] : []))

/** ATTDEF from the modes prompt to a definition at `at`, 5 high, unrotated. */
function defineAttribute(
  cad: Harness,
  answers: { tag: string; prompt?: string; value: string },
  at = p(0, 0)
) {
  cad.enter().type(answers.tag).enter()
  if (answers.prompt !== undefined) cad.type(answers.prompt).enter()
  return cad
    .type(answers.value)
    .enter()
    .click(at)
    .type("5")
    .enter()
    .type("0")
    .enter()
}

describe("ATTDEF", () => {
  it("asks -ATTDEF's questions and leaves a definition that shows its tag", () => {
    const cad = createHarness()
    cad.command("ATTDEF")
    defineAttribute(cad, { tag: "part", prompt: "Part number", value: "X-0" })

    const definition = cad.only<AttributeDefinitionEntity>("attdef")
    // "Lowercase letters are automatically changed to uppercase."
    expect(definition.tag).toBe("PART")
    expect(definition.prompt).toBe("Part number")
    expect(definition.value).toBe("X-0")
    expect(definition.height).toBeCloseTo(5)
    expect(definition.position).toBeCloseToPoint(p(0, 0))
    expect(definition.modes).toEqual(DEFAULT_ATTRIBUTE_MODES)
    expect(drawnTexts(cad)).toContain("PART")
    expect(cad.activeToolId()).toBe("select")
  })

  it("toggles a mode and shows the modes line again", () => {
    const cad = createHarness()
    cad.command("ATTDEF").option("Invisible").option("Lock position")
    defineAttribute(cad, { tag: "NOTE", prompt: "", value: "" })

    expect(cad.commandLog()).toContain(
      "Current attribute modes:\nInvisible=Y  Constant=N  Verify=N  Preset=N  Lock position=N  Annotative=N  Multiple line=N"
    )
    expect(cad.only<AttributeDefinitionEntity>("attdef").modes).toEqual(
      modes({ invisible: true, lockPosition: false })
    )
  })

  // AutoCAD's tag prompt takes no spaces (AllowSpaces false): a space is its
  // Enter, and what follows answers the next prompt (probes blocks/p313,
  // p314, p315).
  it("ends the tag at a space typed in the box, takes `!`, and refuses only an empty tag", () => {
    const cad = createHarness()
    cad.command("ATTDEF").enter().type("PART NO")
    expect(asking(cad)).toBe("Enter attribute prompt")
    expect(cad.state().dynamicInput?.fields[0]?.value).toBe("NO")
    cad.escape()

    const bang = createHarness()
    bang.command("ATTDEF").enter().enter()
    expect(bang.commandLog().at(-1)).toBe("Tag cannot be null")
    bang.type("PART!").enter()
    expect(asking(bang)).toBe("Enter attribute prompt")
  })

  it("asks a constant attribute for its value and no prompt", () => {
    const cad = createHarness()
    cad.command("ATTDEF").option("Constant").enter().type("REV").enter()
    expect(asking(cad)).toBe("Enter attribute value")
    cad.type("B").enter().click(p(0, 0)).type("5").enter().type("0").enter()

    const definition = cad.only<AttributeDefinitionEntity>("attdef")
    expect(definition.prompt).toBe("")
    expect(definition.value).toBe("B")
    expect(definition.modes.constant).toBe(true)
  })

  it("keeps leading blanks after a backslash", () => {
    const cad = createHarness()
    cad.command("ATTDEF")
    defineAttribute(cad, { tag: "A", prompt: "\\  indented", value: "\\\\x" })

    const definition = cad.only<AttributeDefinitionEntity>("attdef")
    expect(definition.prompt).toBe("  indented")
    expect(definition.value).toBe("\\x")
  })

  it("stacks the next definition below the last one on Enter", () => {
    const cad = createHarness()
    cad.command("ATTDEF")
    defineAttribute(cad, { tag: "FIRST", prompt: "", value: "" }, p(0, 100))
    cad.command("ATTDEF").enter().type("SECOND").enter().enter().enter().enter()

    const [first, second] = cad
      .entities()
      .filter((e): e is AttributeDefinitionEntity => e.type === "attdef")
    expect(second.tag).toBe("SECOND")
    expect(second.position.x).toBeCloseTo(first.position.x)
    expect(second.position.y).toBeLessThan(first.position.y)
    expect(second.height).toBeCloseTo(first.height)
  })

  // desktop d03-5: a Left definition shows one grip at its insertion point;
  // a justified one TEXT's two (desktop text/d02-1), either moving it.
  it("shows TEXT's grips and moves by them", () => {
    const left = createAttributeDefinition(p(0, 100), "PART", {
      height: 10,
      id: "L",
    })
    const right = createAttributeDefinition(p(100, 0), "PART", {
      height: 10,
      justify: "right",
      id: "R",
    })
    const cad = createHarness({ entities: [left, right] })
    const gripCentres = () =>
      cad
        .scene()
        .primitives.flatMap((q) =>
          q.kind === "rect" && "fill" in q && q.fill === THEME.grip
            ? [
                cad.runtime.viewport.screenToWorld(
                  p(q.min.x + q.width / 2, q.min.y + q.height / 2)
                ),
              ]
            : []
        )

    cad.select("L").moveTo(p(500, 500))
    expect(gripCentres()).toHaveLength(1)
    expect(gripCentres()[0]).toBeCloseToPoint(p(0, 100), 0)
    cad.escape().select("R").moveTo(p(500, 500))
    expect(gripCentres()).toHaveLength(2)
    expect(gripCentres()[0]).toBeCloseToPoint(p(100, 0), 0)

    cad.drag(p(100, 0), p(110, 20))
    expect(cad.byId<AttributeDefinitionEntity>("R").position).toBeCloseToPoint(
      p(110, 20)
    )
  })

  // probes blocks/p317 (es I C V P B), p318 (en I C V P L): each letter
  // toggles its mode; p306: the modes stay for the next ATTDEF (AFLAGS).
  it("toggles each mode by its letter in either language, and keeps them for the next run", () => {
    const toggled = modes({
      invisible: true,
      constant: true,
      verify: true,
      preset: true,
      lockPosition: false,
    })
    for (const [locale, name, letters] of [
      [undefined, "ATTDEF", "ICVPL"],
      [es, "ATRDEF", "ICVPB"],
    ] as const) {
      const cad = createHarness(locale ? { locale } : {})
      cad.command(name)
      for (const letter of letters) {
        cad.runtime.setCommandLineText(letter)
        cad.runtime.submitCommandLine()
      }
      cad.enter().type("T1").enter().type("V1").enter()
      cad.click(p(0, 0)).enter().enter()
      expect(cad.only<AttributeDefinitionEntity>("attdef").modes).toEqual(
        toggled
      )
      cad.command(name)
      expect(cad.commandLog().at(-1)).toContain(
        locale ? "Constante=S" : "Constant=Y"
      )
    }
  })

  it("runs as -ATTDEF too", () => {
    const cad = createHarness()
    cad.command("-ATTDEF")
    expect(cad.activeToolId()).toBe("attdef")
  })

  // acad.pgp's aliases (probes blocks/p300, p301, p341, p342): -ATE, ATTE and
  // es -ATR are -ATTEDIT's, which is not built.
  it("answers to acad.pgp's aliases in each language", () => {
    for (const [locale, name, tool] of [
      [undefined, "ATT", "attdef"],
      [undefined, "-ATT", "attdef"],
      [undefined, "DDATTDEF", "attdef"],
      [undefined, "ATE", "attedit"],
      [undefined, "DDATTE", "attedit"],
      [es, "AT", "attdef"],
      [es, "-AT", "attdef"],
      [es, "ATR", "attedit"],
      [es, "DDATTE", "attedit"],
    ] as const) {
      const cad = createHarness(locale ? { locale } : {})
      cad.command(name)
      expect(cad.activeToolId(), name).toBe(tool)
    }
    for (const name of ["-ATE", "ATTE"]) {
      expect(createHarness().command(name).activeToolId(), name).toBe("select")
    }
    expect(createHarness({ locale: es }).command("-ATR").activeToolId()).toBe(
      "select"
    )
  })
})

// WHY ATTEDIT's box: the desktop opens Edit Attributes on the new reference
// whatever ATTDIA, and Cancel keeps the defaults (desktop d00, d01); the
// console, which shows no dialog, asks nothing (probes blocks/p134, p305).
describe("BLOCK with attributes", () => {
  const convert = () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" }), partDefinition()],
    })
    cad
      .command("BLOCK")
      .type("TAG")
      .enter()
      .click(p(0, 0))
      .click(p(-10, -10))
      .click(p(200, 50))
      .enter()
    return cad
  }

  it("converts with the defaults and opens ATTEDIT's box on the reference (desktop d00)", () => {
    const cad = convert()

    expect(cad.commandLog()).not.toContain("Enter attribute values")
    expect(cad.state().commandLine.prompt).toBe("BLOCK:")
    expect(asking(cad)).toBe("Part number")
    expect(cad.state().dynamicInput?.fields[0]?.value).toBe("X-0")
    expect(cad.only<InsertEntity>("insert").attributes).toEqual([
      expect.objectContaining({ tag: "PART", value: "X-0" }),
    ])
    cad.type("P-7").enter()

    const block = cad.runtime.document.getBlock("TAG")
    expect(block?.entities.map((e) => e.type).sort()).toEqual([
      "attdef",
      "line",
    ])
    expect(cad.only<InsertEntity>("insert").attributes).toEqual([
      expect.objectContaining({ tag: "PART", value: "P-7" }),
    ])
    expect(cad.typeCounts().attdef).toBeUndefined()
    expect(cad.activeToolId()).toBe("select")

    // The definition, the conversion and the values are one step.
    cad.undo()
    expect(cad.runtime.document.getBlock("TAG")).toBeUndefined()
    expect(cad.typeCounts()).toEqual({ line: 1, attdef: 1 })
  })

  it("keeps the defaults at Escape, the Cancel of Edit Attributes (desktop d01)", () => {
    const cad = convert()
    cad.type("P-7").escape()

    expect(cad.activeToolId()).toBe("select")
    expect(cad.only<InsertEntity>("insert").attributes).toEqual([
      expect.objectContaining({ tag: "PART", value: "X-0" }),
    ])
    expect(cad.runtime.document.getBlock("TAG")).toBeDefined()
  })

  it("lists the attributes by prompt in the order the definitions were picked (probe blocks/p307)", () => {
    const first = createAttributeDefinition(p(0, 10), "FIRST", {
      height: 5,
      id: "A1",
    })
    const second = createAttributeDefinition(p(0, 30), "SECOND", {
      height: 5,
      id: "A2",
    })
    const cad = createHarness({ entities: [first, second] })
    cad.command("BLOCK").type("TWO").enter().click(p(0, 0))
    cad.click(p(2, 32)).click(p(2, 12)).enter()

    expect(cad.state().dynamicInput?.fields.map((f) => f.label)).toEqual([
      "SECOND",
      "FIRST",
    ])
  })
})

describe("INSERT with attributes", () => {
  const insertTag = (cad: Harness) =>
    cad.command("INSERT").type("TAG").enter().click(p(300, 0))

  it("asks each value with its prompt and the default in the box", () => {
    const cad = createHarness({ blocks: [taggedBlock()] })
    insertTag(cad)

    expect(asking(cad)).toBe("Part number")
    expect(cad.state().dynamicInput?.fields[0]?.value).toBe("X-0")
    expect(cad.typeCounts().insert).toBeUndefined()
    cad.type("P-7").enter()

    const insert = cad.only<InsertEntity>("insert")
    expect(insert.attributes?.[0].value).toBe("P-7")
    expect(drawnTexts(cad)).toContain("P-7")
    // The definition's tag is not drawn: the attribute stands in its place.
    expect(drawnTexts(cad)).not.toContain("PART")
  })

  it("keeps the default on Enter", () => {
    const cad = createHarness({ blocks: [taggedBlock()] })
    insertTag(cad).enter()

    expect(cad.only<InsertEntity>("insert").attributes?.[0].value).toBe("X-0")
  })

  it("offers the default after a typed insertion point", () => {
    const cad = createHarness({ blocks: [taggedBlock()] })
    cad.command("INSERT").type("TAG").enter().type("300,0").enter()

    expect(cad.state().dynamicInput?.fields[0]?.value).toBe("X-0")
  })

  it("asks and verifies the values in the words of Autodesk's Spanish table", () => {
    const cad = createHarness({
      locale: es,
      blocks: [taggedBlock(partDefinition({ verify: true }))],
    })
    insertTag(cad).type("P-7").enter()

    expect(cad.commandLog()).toContain("Indique valores de atributo")
    expect(cad.commandLog()).toContain("Verificar valores de atributo")
  })

  // A leading backslash escapes only a backslash or a blank: `\X` stays,
  // `\\Y` is `\Y`, `\ Z` is ` Z`, and a value takes spaces (probes
  // blocks/p311, p329).
  it("keeps a leading backslash unless it escapes a backslash or a blank", () => {
    const values = ["\\X", "\\\\Y", "\\ Z", "A B"].map((typed) => {
      const cad = createHarness({ blocks: [taggedBlock()] })
      insertTag(cad)
      cad.runtime.setCommandLineText(typed)
      cad.runtime.submitCommandLine()
      return cad.only<InsertEntity>("insert").attributes?.[0].value
    })
    expect(values).toEqual(["\\X", "\\Y", " Z", "A B"])
  })

  it("asks by tag when the definition has no prompt", () => {
    const definition = createAttributeDefinition(p(0, 10), "SIZE", {
      height: 5,
    })
    const cad = createHarness({ blocks: [taggedBlock(definition)] })
    insertTag(cad)

    expect(asking(cad)).toBe("SIZE")
  })

  it("asks a Verify attribute a second time", () => {
    const cad = createHarness({
      blocks: [taggedBlock(partDefinition({ verify: true }))],
    })
    insertTag(cad).type("P-7").enter()

    expect(cad.commandLog()).toContain("Verify attribute values")
    expect(cad.state().dynamicInput?.fields[0]?.value).toBe("P-7")
    cad.type("P-8").enter()
    expect(cad.only<InsertEntity>("insert").attributes?.[0].value).toBe("P-8")
  })

  // probe blocks/p344: an empty default is asked with no `<>`, and Enter
  // leaves the value empty.
  it("asks an empty default by its prompt alone", () => {
    const empty = createAttributeDefinition(p(0, 10), "PART", {
      prompt: "Part number",
      height: 5,
    })
    const cad = createHarness({ blocks: [taggedBlock(empty)] })
    insertTag(cad)
    expect(cad.state().commandLine.prompt).toBe("INSERT Part number:")
    cad.enter()
    expect(cad.only<InsertEntity>("insert").attributes?.[0].value).toBe("")
  })

  // probe blocks/p331: an attribute keeps its definition's layer, layer 0
  // included, and wears no CECOLOR, whatever is current at the insertion.
  it("gives each attribute its definition's layer and no current colour", () => {
    const cad = createHarness()
    const l1 = cad.runtime.createLayer("L1", undefined, false)
    const l2 = cad.runtime.createLayer("L2", undefined, false)
    cad.runtime.document.addBlock(
      taggedBlock(
        partDefinition(),
        createAttributeDefinition(p(0, 20), "NOTE", {
          height: 5,
          layerId: l1,
          id: "def-note",
        })
      )
    )
    cad.runtime.setCurrentLayer(l2)
    cad.command("-COLOR")
    cad.runtime.setCommandLineText("3")
    cad.runtime.submitCommandLine()
    insertTag(cad).enter().enter()

    const insert = cad.only<InsertEntity>("insert")
    expect(insert.layerId).toBe(l2)
    expect(insert.attributes?.map((a) => [a.layerId, a.color])).toEqual([
      ["0", undefined],
      [l1, undefined],
    ])
  })

  it("takes a Preset attribute's default without asking", () => {
    const cad = createHarness({
      blocks: [taggedBlock(partDefinition({ preset: true }))],
    })
    insertTag(cad)

    expect(cad.only<InsertEntity>("insert").attributes?.[0].value).toBe("X-0")
  })

  it("draws a constant attribute's value and gives the reference none", () => {
    const cad = createHarness({
      blocks: [taggedBlock(partDefinition({ constant: true }))],
    })
    insertTag(cad)

    expect(cad.only<InsertEntity>("insert").attributes).toBeUndefined()
    expect(drawnTexts(cad)).toContain("X-0")
  })

  it("adds nothing when cancelled at a value", () => {
    const cad = createHarness({ blocks: [taggedBlock()] })
    insertTag(cad).escape()

    expect(cad.typeCounts().insert).toBeUndefined()
  })

  it("is one undo step", () => {
    const cad = createHarness({ blocks: [taggedBlock()] })
    insertTag(cad).type("P-7").enter().undo()

    expect(cad.typeCounts().insert).toBeUndefined()
  })

  it("moves its attributes with the reference", () => {
    const cad = createHarness({ blocks: [taggedBlock()] })
    insertTag(cad).type("P-7").enter()
    const insert = cad.only<InsertEntity>("insert")

    expect(insert.attributes?.[0].position).toBeCloseToPoint(p(0, 10))
    const at = (
      cad
        .scene()
        .primitives.find(
          (prim) => prim.kind === "text" && prim.text === "P-7"
        ) as { at: { x: number; y: number } }
    ).at
    expect(cad.toWorld(at)).toBeCloseToPoint(p(300, 10))
  })

  it("copies its attributes with the reference, values kept (move/p212)", () => {
    const cad = createHarness({ blocks: [taggedBlock()] })
    insertTag(cad).type("P-7").enter()
    const source = cad.only<InsertEntity>("insert")
    cad.select(source.id).command("COPY").type("0,0").enter()
    cad.type("100,0").enter().enter()

    const copy = cad.latest() as InsertEntity
    expect(copy.id).not.toBe(source.id)
    expect(copy.position).toBeCloseToPoint(p(400, 0))
    expect(copy.attributes).toEqual(source.attributes)
  })
})

describe("ATTDISP", () => {
  const withHidden = () =>
    createHarness({
      blocks: [taggedBlock(partDefinition({ invisible: true }))],
      entities: [
        createInsert("TAG", p(0, 0), {
          id: "I1",
          attributes: [
            {
              tag: "PART",
              value: "SECRET",
              position: p(0, 10),
              height: 5,
              rotation: 0,
              justify: "left",
              styleId: "Standard",
              invisible: true,
              layerId: "0",
            },
          ],
        }),
      ],
    })

  it("shows invisible attributes with ON and none with OFF", () => {
    const cad = withHidden()
    expect(drawnTexts(cad)).not.toContain("SECRET")

    cad.command("ATTDISP").option("ON")
    expect(cad.runtime.document.getSettings().attributeDisplay).toBe("on")
    expect(drawnTexts(cad)).toContain("SECRET")

    cad.command("ATTDISP").option("OFF")
    expect(drawnTexts(cad)).not.toContain("SECRET")
  })

  it("hides them from the rollover highlight too", () => {
    const cad = withHidden()
    cad.command("ATTDISP").option("ON")
    cad.command("ATTDISP").option("OFF")
    cad.moveTo(p(50, 0))

    expect(drawnTexts(cad)).not.toContain("SECRET")
  })

  it("undoes the setting", () => {
    const cad = withHidden()
    cad.command("ATTDISP").option("ON").undo()

    expect(cad.runtime.document.getSettings().attributeDisplay).toBe("normal")
  })

  // AutoCAD 2027's console answering the same input (probes blocks/p04,
  // p334).
  it("asks as AutoCAD 2027, regenerating only for a change", () => {
    const cad = withHidden()
    const answer = (text: string) => {
      cad.runtime.setCommandLineText(text)
      cad.runtime.submitCommandLine()
    }
    cad.command("ATTDISP")
    answer("FOO")
    answer("ON")
    cad.command("ATTDISP")
    answer("ON")
    expect(cad.commandLog()).toEqual([
      "ATTDISP",
      "Enter attribute visibility setting [Normal/ON/OFF] <Normal>: FOO",
      "Invalid option keyword.",
      "Enter attribute visibility setting [Normal/ON/OFF] <Normal>: ON",
      "Regenerating model.",
      "ATTDISP",
      "Enter attribute visibility setting [Normal/ON/OFF] <ON>: ON",
    ])
  })

  // probe blocks/p334: `O` is OFf or ON, and the question takes OF.
  it("asks which of OFF and ON an O is", () => {
    const cad = createHarness()
    const answer = (text: string) => {
      cad.runtime.setCommandLineText(text)
      cad.runtime.submitCommandLine()
    }
    cad.command("ATTDISP")
    answer("O")
    answer("OF")
    expect(cad.commandLog()).toEqual([
      "ATTDISP",
      "Enter attribute visibility setting [Normal/ON/OFF] <Normal>: O",
      "Ambiguous response, please clarify...",
      "OFf or ON? OF",
      "Regenerating model.",
    ])
  })

  // probe blocks/p336: inside LINE it asks under `>>`, queues the
  // regeneration and does it once LINE ends.
  it("runs transparently", () => {
    const cad = createHarness()
    const answer = (text: string) => {
      cad.runtime.setCommandLineText(text)
      cad.runtime.submitCommandLine()
    }
    cad.command("LINE")
    for (const text of ["0,0", "'ATTDISP", "ON", "10,0"]) answer(text)
    cad.enter()
    expect(cad.commandLog()).toEqual([
      "LINE",
      "Specify first point: 0,0",
      "Specify next point or [Undo]: 'ATTDISP",
      ">>Enter attribute visibility setting [Normal/ON/OFF] <Normal>: ON",
      "Regen queued.",
      "Resuming LINE command.",
      "Specify next point or [Undo]: 10,0",
      "Specify next point or [Undo]:",
      "Regenerating model.",
    ])
  })

  // probe blocks/p335: es A (ACT) and D (DES); the default reads ACT.
  it("takes Spanish AutoCAD's letters", () => {
    const cad = createHarness({ locale: es })
    const answer = (text: string) => {
      cad.runtime.setCommandLineText(text)
      cad.runtime.submitCommandLine()
    }
    cad.command("ATRVIS")
    answer("A")
    expect(cad.runtime.document.getSettings().attributeDisplay).toBe("on")
    cad.command("ATRVIS")
    expect(cad.state().commandLine.prompt).toBe(
      "ATRVIS Indique parámetro de visibilidad de atributo [Normal/ACT/DES] <ACT>:"
    )
    answer("D")
    expect(cad.runtime.document.getSettings().attributeDisplay).toBe("off")
  })

  it("asks in Autodesk's Spanish", () => {
    const cad = createHarness({ locale: es })
    cad.command("ATRVIS")
    expect(cad.state().commandLine.prompt).toBe(
      "ATRVIS Indique parámetro de visibilidad de atributo [Normal/ACT/DES] <Normal>:"
    )
  })

  // p337: U names the command and does not regenerate again, in both
  // languages.
  it("is undone by U, which names it alone (probe blocks/p337)", () => {
    const cad = createHarness()
    cad.command("ATTDISP").option("ON")
    cad.command("U")
    expect(cad.commandLog().slice(-2)).toEqual(["U", "ATTDISP"])

    const spanish = createHarness({ locale: es })
    spanish.command("ATRVIS").option("ON")
    spanish.command("H")
    expect(spanish.commandLog().at(-1)).toBe("ATRVIS")
    expect(spanish.runtime.document.getSettings().attributeDisplay).toBe(
      "normal"
    )
  })

  it("is saved with the drawing", () => {
    const cad = withHidden()
    cad.command("ATTDISP").option("OFF")

    const parsed = parseDrawingFile(cad.runtime.serializeDrawing())
    expect(parsed.settings.attributeDisplay).toBe("off")
    expect(parsed.entities[0]).toEqual(cad.byId("I1"))
  })
})

describe("editing attributes", () => {
  const withReference = () =>
    createHarness({
      blocks: [taggedBlock()],
      entities: [
        createInsert("TAG", p(0, 0), {
          id: "I1",
          attributes: [
            {
              tag: "PART",
              value: "P-7",
              position: p(0, 10),
              height: 5,
              rotation: 0,
              justify: "left",
              styleId: "Standard",
              invisible: false,
              layerId: "0",
            },
          ],
        }),
      ],
    })

  it("ATTEDIT lists each value by its prompt", () => {
    const cad = withReference()
    cad.command("ATTEDIT")
    expect(cad.state().commandLine.prompt).toBe(
      "ATTEDIT Select block reference:"
    )
    cad.click(p(50, 0))

    expect(asking(cad)).toBe("Part number")
    expect(cad.state().commandLine.prompt).toBe("ATTEDIT:")
    cad.type("P-9").enter()
    expect(cad.byId<InsertEntity>("I1").attributes?.[0].value).toBe("P-9")
    expect(cad.activeToolId()).toBe("select")
  })

  it("EATTEDIT lists each value by its tag", () => {
    const cad = withReference()
    cad.command("EATTEDIT").click(p(50, 0))

    expect(asking(cad)).toBe("PART")
    expect(cad.state().commandLine.prompt).toBe("EATTEDIT:")
  })

  it("a double-click on a reference opens EATTEDIT", () => {
    const cad = withReference()
    cad.doubleClick(p(50, 0))

    // `^C^C_eattedit` with the point picked (desktop d04).
    expect(cad.commandLog()).toEqual([
      "_eattedit",
      "Select a block: 50.000000,0.000000,0.000000",
    ])
    expect(cad.activeToolId()).toBe("attedit")
    expect(asking(cad)).toBe("PART")
    expect(cad.state().commandLine.prompt).toBe("EATTEDIT:")
    cad.type("P-9").enter().undo()
    expect(cad.byId<InsertEntity>("I1").attributes?.[0].value).toBe("P-7")
  })

  it("a double-click on a loose definition runs `_textedit` on its tag, prompt and default (DoubleClickRoot.cui)", () => {
    const cad = createHarness({ entities: [partDefinition()] })
    cad.doubleClick(p(2, 12))

    expect(cad.activeToolId()).toBe("textedit")
    expect(cad.commandLog()).toEqual([
      "_textedit",
      "Current settings: Edit mode = Multiple",
    ])
    cad
      .type("code", "tag")
      .type("Code", "prompt")
      .type("C-1", "default")
      .enter()
    const definition = cad.byId<AttributeDefinitionEntity>("def-part")
    expect(definition.tag).toBe("CODE")
    expect(definition.prompt).toBe("Code")
    expect(definition.value).toBe("C-1")
  })
})

describe("the Insertion snap", () => {
  const snapStart = (cad: Harness, aim: Vec2) => {
    cad.command("LINE")
    cad.runtime.setSnapOverride(SnapType.Insertion)
    cad.click(aim).click(p(500, 500)).escape()
    return cad.only<LineEntity>("line").start
  }

  it("catches a loose definition", () => {
    const cad = createHarness({
      entities: [createAttributeDefinition(p(200, 200), "A", { height: 5 })],
      snap: true,
    })
    expect(snapStart(cad, p(201, 201))).toBeCloseToPoint(p(200, 200))
  })

  it("catches each attribute a reference shows", () => {
    const cad = createHarness({
      blocks: [taggedBlock(partDefinition())],
      entities: [
        createInsert("TAG", p(0, 0), {
          attributes: [
            {
              tag: "PART",
              value: "P-7",
              position: p(0, 50),
              height: 5,
              rotation: 0,
              justify: "left",
              styleId: "Standard",
              invisible: false,
              layerId: "0",
            },
          ],
        }),
      ],
      snap: true,
    })
    expect(snapStart(cad, p(1, 51))).toBeCloseToPoint(p(0, 50))
  })
})

describe("EXPLODE", () => {
  // probe pieces/p254: TAG (a PART definition, default X-0, and a line),
  // inserted and exploded, gives its LINE and the ATTDEF PART back. ATTDIA 1
  // kept the default (the console asks nothing; `P-7` ran as an unknown
  // command), so the value P-7 dropped here is this test's, not the probe's.
  it("brings the definitions back and drops the values (pieces/p254)", () => {
    const cad = createHarness({
      blocks: [taggedBlock()],
      entities: [
        createInsert("TAG", p(0, 0), {
          id: "I1",
          attributes: [
            {
              tag: "PART",
              value: "P-7",
              position: p(0, 10),
              height: 5,
              rotation: 0,
              justify: "left",
              styleId: "Standard",
              invisible: false,
              layerId: "0",
            },
          ],
        }),
      ],
    })
    cad.select("I1").command("EXPLODE")

    const definition = cad.only<AttributeDefinitionEntity>("attdef")
    expect(definition.tag).toBe("PART")
    expect(definition.value).toBe("X-0")
    expect(drawnTexts(cad)).not.toContain("P-7")
  })

  it("keeps the geometry the reference drew", () => {
    const insert = createInsert("TAG", p(50, 50), { scale: 2 })
    const [, definition] = insertGeometry(insert, taggedBlock())
    expect((definition as AttributeDefinitionEntity).position).toBeCloseToPoint(
      p(50, 70)
    )
  })
})

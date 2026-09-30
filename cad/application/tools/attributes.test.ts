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
      "Current attribute modes: Invisible=Y Constant=N Verify=N Preset=N Lock position=N"
    )
    expect(cad.only<AttributeDefinitionEntity>("attdef").modes).toEqual(
      modes({ invisible: true, lockPosition: false })
    )
  })

  it("asks again for a tag with a space or an exclamation mark", () => {
    const cad = createHarness()
    cad.command("ATTDEF").enter().type("PART NO").enter()
    expect(asking(cad)).toBe("Enter attribute tag name")
    cad.type("PART!").enter()
    expect(asking(cad)).toBe("Enter attribute tag name")
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

  it("runs as -ATTDEF too", () => {
    const cad = createHarness()
    cad.command("-ATTDEF")
    expect(cad.activeToolId()).toBe("attdef")
  })
})

describe("BLOCK with attributes", () => {
  it("files the definitions and converts with the values asked for", () => {
    const cad = createHarness({
      entities: [lineOf(p(0, 0), p(100, 0), { id: "L1" }), partDefinition()],
    })
    cad
      .command("BLOCK")
      .type("TAG")
      .enter()
      .click(p(0, 0))
      .drag(p(-10, -10), p(200, 50))
      .enter()

    expect(cad.commandLog()).toContain("Enter attribute values")
    expect(asking(cad)).toBe("Part number")
    cad.type("P-7").enter()

    const block = cad.runtime.document.getBlock("TAG")
    expect(block?.entities.map((e) => e.type).sort()).toEqual([
      "attdef",
      "line",
    ])
    const insert = cad.only<InsertEntity>("insert")
    expect(insert.attributes).toEqual([
      expect.objectContaining({ tag: "PART", value: "P-7" }),
    ])
    expect(cad.typeCounts().attdef).toBeUndefined()
  })

  it("asks in the order the definitions were picked", () => {
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

    expect(asking(cad)).toBe("SECOND")
    cad.enter()
    expect(asking(cad)).toBe("FIRST")
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
    cad.command("ATTEDIT").click(p(50, 0))

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

    expect(cad.activeToolId()).toBe("attedit")
    expect(asking(cad)).toBe("PART")
    expect(cad.state().commandLine.prompt).toBe("EATTEDIT:")
    cad.type("P-9").enter().undo()
    expect(cad.byId<InsertEntity>("I1").attributes?.[0].value).toBe("P-7")
  })

  it("a double-click on a loose definition edits its tag, prompt and default", () => {
    const cad = createHarness({ entities: [partDefinition()] })
    cad.doubleClick(p(2, 12))

    expect(cad.activeToolId()).toBe("textedit")
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
  it("brings the definitions back and drops the values", () => {
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

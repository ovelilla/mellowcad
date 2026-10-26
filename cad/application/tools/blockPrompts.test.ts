import { describe, expect, it } from "vitest"

import { type CadHarness, createHarness } from "../../../test/harness"
import { lineOf, p } from "../../../test/builders"
import { es } from "../../locales/es"
import {
  InsertEntity,
  createBlockDefinition,
  createInsert,
} from "../../domain/entities"

/** Typed at the command line and confirmed, as AutoCAD's prompt reads it. */
function answer(cad: CadHarness, ...texts: string[]): CadHarness {
  for (const text of texts) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad
}

const MODES =
  "Enter an option to change [Invisible/Constant/Verify/Preset/Lock position] <done>:"
const modesLine = (verify: "Y" | "N") =>
  `Current attribute modes:\nInvisible=N  Constant=N  Verify=${verify}  Preset=N  Lock position=Y  Annotative=N  Multiple line=N`

// Each transcript is AutoCAD 2027's console answering the same input (probes
// blocks/p03, p01, p02, p303), with the options this build offers (no
// Annotative or Multiple lines, no Basepoint, X, Y, Z, Explode or REpeat) and
// the drawing's precision.
describe("ATTDEF, BLOCK and INSERT ask as AutoCAD 2027", () => {
  it("ATTDEF asks the modes, the tag, prompt and default, then TEXT's prompts", () => {
    const cad = createHarness()
    cad.command("ATTDEF")
    answer(cad, "FOO", "V")
    cad.enter().enter()
    answer(cad, "TAG1", "Prompt one", "def1", "FOO", "0,5", "FOO", "2.5")
    answer(cad, "FOO", "0")

    expect(cad.commandLog()).toEqual([
      "ATTDEF",
      modesLine("N"),
      `${MODES} FOO`,
      "Invalid option keyword.",
      `${MODES} V`,
      modesLine("Y"),
      MODES,
      "Enter attribute tag name:",
      "Tag cannot be null",
      "Enter attribute tag name: TAG1",
      "Enter attribute prompt: Prompt one",
      "Enter default attribute value: def1",
      'Current text style:  "Standard"  Text height:  2.50  Justify:  Left',
      "Specify start point of text or [Justify/Style]: FOO",
      "Point or option keyword required.",
      "Specify start point of text or [Justify/Style]: 0,5",
      "Specify height <2.50>: FOO",
      "Requires numeric distance or second point.",
      "Specify height <2.50>: 2.5",
      "Specify rotation angle of text <0>: FOO",
      "Requires valid numeric angle or second point.",
      "Specify rotation angle of text <0>: 0",
    ])
    expect(cad.typeCounts().attdef).toBe(1)
  })

  it("ATTDEF asks a constant attribute's value, and a justification's point", () => {
    const cad = createHarness()
    cad.command("ATTDEF")
    answer(cad, "C")
    cad.enter()
    answer(cad, "T1", "FOO", "MC")
    expect(cad.commandLog().slice(-3)).toEqual([
      "Enter attribute value: FOO",
      'Current text style:  "Standard"  Text height:  2.50  Justify:  Left',
      "Specify start point of text or [Justify/Style]: MC",
    ])
    expect(cad.state().commandLine.prompt).toBe(
      "ATTDEF Specify middle point of text:"
    )
  })

  it("BLOCK says its conversion, refuses a bad name and asks Select objects (probes blocks/p01, p106)", () => {
    const cad = createHarness({ entities: [lineOf(p(0, 0), p(10, 0))] })
    cad.command("BLOCK")
    answer(cad, "a<b", "B1", "FOO", "0,0", "L")
    cad.enter()

    expect(cad.commandLog()).toEqual([
      "BLOCK",
      "Current settings: Object conversion=Convert",
      "Enter block name or [?]: a<b",
      "Invalid block name.",
      "Enter block name or [?]: B1",
      "Specify insertion base point: FOO",
      "Point or option keyword required.",
      "Specify insertion base point: 0,0",
      "Select objects: L",
      "1 found",
      "Select objects:",
    ])
    expect(cad.typeCounts().insert).toBe(1)
  })

  it("INSERT offers the last block, sets Scale and Rotate, then asks the attribute values", () => {
    const cad = createHarness()
    cad.command("ATTDEF")
    cad.enter()
    answer(cad, "TAG1", "Prompt one", "def1", "0,5")
    cad.enter().enter()
    cad.command("BLOCK")
    answer(cad, "B1", "0,0", "L")
    cad.enter().enter()
    const lines = cad.commandLog().length

    cad.command("INSERT")
    answer(cad, "B1", "FOO", "S", "FOO", "2", "R", "FOO", "30", "5,5", "val1")
    expect(cad.commandLog().slice(lines)).toEqual([
      "INSERT",
      "Enter block name or [?] <B1>: B1",
      "Specify insertion point or [Scale/Rotate]: FOO",
      "Point or option keyword required.",
      "Specify insertion point or [Scale/Rotate]: S",
      "Specify scale factor for XYZ axes <1.00>: FOO",
      "Requires numeric distance or two points.",
      "Specify scale factor for XYZ axes <1.00>: 2",
      "Specify insertion point or [Scale/Rotate]: R",
      "Specify rotation angle <0>: FOO",
      "Requires valid numeric angle or two points.",
      "Specify rotation angle <0>: 30",
      "Specify insertion point or [Scale/Rotate]: 5,5",
      "Enter attribute values",
      "Prompt one <def1>: val1",
    ])
    expect(cad.typeCounts().insert).toBe(2)
  })

  it("asks in Autodesk's Spanish (probes blocks/p01, p100, p03)", () => {
    const cad = createHarness({
      locale: es,
      entities: [lineOf(p(0, 0), p(10, 0))],
    })
    cad.command("BLOQUE")
    answer(cad, "a<b", "B1", "FOO", "0,0")
    expect(cad.commandLog()).toEqual([
      "BLOQUE",
      "Parámetros actuales: conversión de objetos=Convertir",
      "Indique nombre de bloque o [?]: a<b",
      "Nombre bloque no válido.",
      "Indique nombre de bloque o [?]: B1",
      "Especifique un punto base de inserción: FOO",
      "Se requiere un punto o una opción.",
      "Especifique un punto base de inserción: 0,0",
    ])
    cad.escape()
    cad.command("ATRDEF")
    expect(cad.state().commandLine.prompt).toBe(
      "ATRDEF Indique una opción para modificar [Invisible/Constante/Verificable/Predefinido/Bloquear posición] <terminado>:"
    )
    cad.enter()
    answer(cad, "")
    expect(cad.commandLog().at(-1)).toBe("El identificador no puede ser nulo")
  })
})

const bar = (name: string) =>
  createBlockDefinition(name, p(0, 0), [lineOf(p(0, 0), p(10, 0))])

const PURGE_SETTINGS = "Nested items = Off    Orphaned data = Off"
const PURGE_TYPE = "Enter type of unused objects to purge [Blocks]:"

// AutoCAD 2027's console, offering only the one type built: Blocks.
describe("PURGE asks -PURGE's prompts, as AutoCAD 2027", () => {
  it("asks the type, the names and Verify, then names each block it deletes (probes blocks/p04, p154, erase/p326)", () => {
    const cad = createHarness({ blocks: [bar("B1"), bar("B2")] })
    answer(cad, "-PURGE", "FOO", "B", "b*", "FOO", "N")

    expect(cad.commandLog()).toEqual([
      "-PURGE",
      PURGE_SETTINGS,
      `${PURGE_TYPE} FOO`,
      "Invalid option keyword.",
      `${PURGE_TYPE} B`,
      "Enter name(s) to purge <*>: b*",
      "Verify each name to be purged? [Yes/No] <Y>: FOO",
      "Yes or No, please.",
      "Verify each name to be purged? [Yes/No] <Y>: N",
      'Deleting block "B1".',
      'Deleting block "B2".',
      "2 blocks deleted.",
    ])
    expect(cad.activeToolId()).toBe("select")
  })

  it("asks each name when verifying, and reports nothing after (probe blocks/p141)", () => {
    const cad = createHarness({ blocks: [bar("B1"), bar("B2")] })
    answer(cad, "PURGE", "B", "*", "", "FOO", "Y", "N")

    expect(cad.commandLog()).toEqual([
      "PURGE",
      PURGE_SETTINGS,
      `${PURGE_TYPE} B`,
      "Enter name(s) to purge <*>: *",
      "Verify each name to be purged? [Yes/No] <Y>:",
      'Purge block "B1"? <N> FOO',
      "Yes or No, please.",
      'Purge block "B1"? <N> Y',
      'Purge block "B2"? <N> N',
    ])
    expect(cad.runtime.document.getBlocks().map((b) => b.name)).toEqual(["B2"])
  })

  it("takes Enter at the names as all of them, and says when none is unused (probes blocks/p04, p146)", () => {
    const cad = createHarness()
    answer(cad, "PU", "B", "", "N")

    expect(cad.commandLog()).toEqual([
      "PU PURGE",
      PURGE_SETTINGS,
      `${PURGE_TYPE} B`,
      "Enter name(s) to purge <*>:",
      "Verify each name to be purged? [Yes/No] <Y>: N",
      "No unreferenced blocks found.",
    ])
  })

  it("ends at Enter on the type (probe blocks/p04)", () => {
    const cad = createHarness({ blocks: [bar("B1")] })
    answer(cad, "-PU", "")

    expect(cad.commandLog()).toEqual(["-PU -PURGE", PURGE_SETTINGS, PURGE_TYPE])
    expect(cad.activeToolId()).toBe("select")
    expect(cad.runtime.document.getBlocks()).toHaveLength(1)
  })

  it("is refused transparently (probe blocks/p103)", () => {
    const cad = createHarness()
    cad.command("LINE").click(p(0, 0))
    answer(cad, "'-PURGE")

    expect(cad.commandLog().slice(-2)).toEqual([
      "** That command may not be invoked transparently **",
      "Point or option keyword required.",
    ])
  })

  it("is LIMPIA, LI, -LIMPIA and -LI in Spanish (probe blocks/p151)", () => {
    for (const name of ["LIMPIA", "LI", "-LIMPIA", "-LI"]) {
      const cad = createHarness({ locale: es })
      answer(cad, name)
      expect(cad.state().commandLine.prompt, name).toBe(
        `${name.startsWith("-") ? "-LIMPIA" : "LIMPIA"} Indique un tipo de objetos sin utilizar para limpiar [Bloques]:`
      )
    }
  })

  it("asks and reports in Autodesk's Spanish (probes blocks/p141, erase/p326)", () => {
    const cad = createHarness({ locale: es, blocks: [bar("B1"), bar("B2")] })
    answer(cad, "-LIMPIA", "B", "", "N")

    expect(cad.commandLog()).toEqual([
      "-LIMPIA",
      "Elementos anidados = DES Datos huérfanos = DES",
      "Indique un tipo de objetos sin utilizar para limpiar [Bloques]: B",
      "Indique nombres que limpiar <*>:",
      "Verifique cada nombre que se va a limpiar? [Sí/No] <S>: N",
      'Suprimiendo bloque "B1".',
      'Suprimiendo bloque "B2".',
      "2 bloque suprimido(s).",
    ])

    const verified = createHarness({ locale: es, blocks: [bar("B1")] })
    answer(verified, "-LIMPIA", "B", "", "", "FOO", "S")
    expect(verified.commandLog().slice(-4)).toEqual([
      "Verifique cada nombre que se va a limpiar? [Sí/No] <S>:",
      'Limpiar bloque "B1"? <N> FOO',
      "Sí o No.",
      'Limpiar bloque "B1"? <N> S',
    ])
    expect(verified.runtime.document.getBlocks()).toHaveLength(0)

    const none = createHarness({ locale: es })
    answer(none, "LIMPIA", "B", "", "N")
    expect(none.commandLog().at(-1)).toBe(
      "No se ha encontrado ningún elemento sin referencia bloque."
    )
  })
})

const BLOCK_HEAD = [
  "-BLOCK",
  "Current settings: Object conversion=Convert",
] as const

// AutoCAD 2027's console; its base point offers Annotative and mOde, which
// are not built.
describe("-BLOCK asks as AutoCAD 2027", () => {
  const line = () => lineOf(p(0, 5), p(10, 5), { id: "L1" })
  const withB1 = () =>
    createHarness({
      blocks: [bar("B1")],
      entities: [createInsert("B1", p(0, 20), { id: "I1" }), line()],
    })

  it("is -BLOCK and -B, BLOCK's aliases are BMAKE, BMOD and ACADBLOCKDIALOG (probes blocks/p101, p152; acad.pgp)", () => {
    for (const name of ["-BLOCK", "-B", "BMAKE", "BMOD", "ACADBLOCKDIALOG"]) {
      const cad = createHarness()
      answer(cad, name)
      expect(cad.activeToolId(), name).toBe("block")
    }
    const dashed = createHarness()
    answer(dashed, "-B")
    expect(dashed.state().commandLine.prompt).toBe(
      "-BLOCK Enter block name or [?]:"
    )
  })

  it("is -BLOQUE and -BQ in Spanish, BLOQUE's aliases MODBLQ, BMAKE, BMOD and ACADBLOCKDIALOG (probes blocks/p100, p151; acad.pgp)", () => {
    for (const name of [
      "-BLOQUE",
      "-BQ",
      "MODBLQ",
      "BMAKE",
      "BMOD",
      "ACADBLOCKDIALOG",
    ]) {
      const cad = createHarness({ locale: es })
      answer(cad, name)
      expect(cad.activeToolId(), name).toBe("block")
    }
  })

  it("asks the name again at Enter and the base point again at Enter (probes blocks/p100–p102, p124; desktop d09)", () => {
    const cad = createHarness({ entities: [line()] })
    answer(cad, "-BLOCK", "", "B1", "", "?", "0,0", "L", "")

    expect(cad.commandLog()).toEqual([
      ...BLOCK_HEAD,
      "Enter block name or [?]:",
      "Invalid block name.",
      "Enter block name or [?]: B1",
      "Specify insertion base point:",
      "Point or option keyword required.",
      "Specify insertion base point: ?",
      "Point or option keyword required.",
      "Specify insertion base point: 0,0",
      "Select objects: L",
      "1 found",
      "Select objects:",
    ])
    expect(cad.typeCounts().insert).toBe(1)
  })

  it("asks to redefine a block it holds, in any case, and says it redefined it (probes blocks/p113, p115, p118)", () => {
    const cad = withB1()
    answer(cad, "-BLOCK", "b1", "FOO", "Y", "0,0", "L", "")

    expect(cad.commandLog()).toEqual([
      ...BLOCK_HEAD,
      "Enter block name or [?]: b1",
      'Block "B1" already exists. Redefine it? [Yes/No] <N>: FOO',
      "Yes or No, please.",
      "Redefine it? [Yes/No] <N>: Y",
      "Specify insertion base point: 0,0",
      "Select objects: L",
      "1 found",
      "Select objects:",
      'Block "B1" redefined',
    ])
    expect(cad.runtime.document.getBlocks().map((b) => b.name)).toEqual(["B1"])
    const [kept] = cad.runtime.document.getBlock("B1")?.entities ?? []
    expect(kept?.type === "line" && kept.start.y).toBeCloseTo(5)
  })

  it("ends at No or Enter to the redefine question, the block unchanged (probe blocks/p114)", () => {
    for (const reply of ["N", ""]) {
      const cad = withB1()
      answer(cad, "-BLOCK", "B1", reply)

      expect(cad.commandLog().at(-1)).toBe(
        `Block "B1" already exists. Redefine it? [Yes/No] <N>:${reply ? ` ${reply}` : ""}`
      )
      expect(cad.activeToolId()).toBe("select")
      expect(cad.byId("L1")).toBeDefined()
    }
  })

  it("U after a redefinition regenerates (probe blocks/p137)", () => {
    const cad = withB1()
    answer(cad, "-BLOCK", "B1", "Y", "0,0", "L", "", "U")

    expect(cad.commandLog().at(-1)).toBe("-BLOCK Regenerating model.")
    const [line] = cad.runtime.document.getBlock("B1")?.entities ?? []
    expect(line?.type === "line" && line.end.x).toBeCloseTo(10)
    expect(line?.type === "line" && line.start.y).toBeCloseTo(0)
  })

  it("refuses a set holding the block itself, directly or nested, and ends (probes blocks/p117, p119)", () => {
    const nested = createHarness({
      blocks: [
        bar("B1"),
        createBlockDefinition("B2", p(0, 0), [createInsert("B1", p(0, 0))]),
      ],
      entities: [createInsert("B2", p(0, 20), { id: "I2" })],
    })
    for (const [cad, id] of [
      [withB1(), "I1"],
      [nested, "I2"],
    ] as const) {
      answer(cad, "-BLOCK", "B1", "Y", "0,0")
      cad.click(p(5, 20)).enter()

      expect(cad.commandLog().slice(-4)).toEqual([
        "Select objects:",
        'Block "B1" references itself',
        "Regenerating model.",
        "*Invalid*",
      ])
      expect(cad.activeToolId()).toBe("select")
      expect(cad.byId(id)).toBeDefined()
      expect(
        cad.runtime.document.getBlock("B1")?.entities.map((e) => e.type)
      ).toEqual(["line"])
    }
  })

  it("says it in Autodesk's Spanish (probes blocks/p113, p117, p118)", () => {
    const cad = createHarness({
      locale: es,
      blocks: [bar("B1")],
      entities: [createInsert("B1", p(0, 20), { id: "I1" })],
    })
    answer(cad, "-BQ", "B1", "FOO", "S", "0,0")
    cad.click(p(5, 20)).enter()

    expect(cad.commandLog()).toEqual([
      "-BQ -BLOQUE",
      "Parámetros actuales: conversión de objetos=Convertir",
      "Indique nombre de bloque o [?]: B1",
      'El bloque "B1" ya existe. ¿Desea redefinirlo? [Sí/No] <N>: FOO',
      "Sí o No.",
      "¿Desea redefinirlo? [Sí/No] <N>: S",
      "Especifique un punto base de inserción: 0,0",
      "Designe objetos: 1 encontrados",
      "Designe objetos:",
      'El bloque "B1" hace referencia a sí mismo',
      "Regenerando modelo.",
      "*No válido*",
    ])
  })

  it("warns of a base point off Z 0, ELEVATION included (probes blocks/p126, p127)", () => {
    const cad = createHarness({ entities: [line()] })
    answer(cad, "-BLOCK", "B1", "5,5,3")
    expect(cad.commandLog().slice(-2)).toEqual([
      "Specify insertion base point: 5,5,3",
      "Beware, Z insertion base is not zero.",
    ])
    answer(cad, "L", "")
    expect(cad.only<InsertEntity>("insert").elevation).toBeCloseTo(3)

    const raised = createHarness({ entities: [line()] })
    answer(raised, "ELEV", "2", "0", "-BLOCK", "B1", "5,5")
    expect(raised.commandLog().at(-1)).toBe(
      "Beware, Z insertion base is not zero."
    )

    const es_ = createHarness({ locale: es, entities: [line()] })
    answer(es_, "-BLOQUE", "B1", "5,5,3")
    expect(es_.commandLog().at(-1)).toBe(
      "Cuidado, la base de inserción de Z no es cero."
    )
  })

  it("takes a set selected before it, counted after the base point (probe blocks/p132)", () => {
    const cad = createHarness({ entities: [line()] })
    cad.select("L1")
    answer(cad, "-BLOCK", "B1", "0,0")

    expect(cad.commandLog()).toEqual([
      ...BLOCK_HEAD,
      "Enter block name or [?]: B1",
      "Specify insertion base point: 0,0",
      "1 found",
    ])
    expect(cad.typeCounts()).toEqual({ insert: 1 })
    expect(cad.activeToolId()).toBe("select")
    expect(cad.selectedIds()).toEqual([])
  })

  it("defines an empty block at an empty Select objects, one undo step (probes blocks/p131, p139; desktop d09)", () => {
    const cad = createHarness({ entities: [line()] })
    answer(cad, "-BLOCK", "B1", "0,0", "")

    expect(cad.runtime.document.getBlock("B1")?.entities).toEqual([])
    expect(cad.typeCounts()).toEqual({ line: 1 })
    answer(cad, "U")
    expect(cad.commandLog().at(-1)).toBe("-BLOCK")
    expect(cad.runtime.document.getBlock("B1")).toBeUndefined()
    expect(cad.typeCounts()).toEqual({ line: 1 })
  })
})

const anonymous = (name: string) =>
  createBlockDefinition(name, p(0, 0), [lineOf(p(0, 0), p(1, 0))])

// WHY no `Press ENTER to continue:`: the console's pager, which a history that
// scrolls has no use for.
describe("? lists the blocks, as AutoCAD 2027", () => {
  const withBlocks = (locale?: typeof es) =>
    createHarness({
      ...(locale ? { locale } : {}),
      blocks: [bar("B1"), bar("C1"), anonymous("*U1"), anonymous("*U2")],
    })

  it("-BLOCK asks which, lists them quoted and counts them, then ends (probes blocks/p104, p105, p156)", () => {
    const cad = withBlocks()
    answer(cad, "-BLOCK", "?", "")

    expect(cad.commandLog()).toEqual([
      ...BLOCK_HEAD,
      "Enter block name or [?]: ?",
      "Enter block(s) to list <*>:",
      [
        "Defined blocks.",
        '  "B1"',
        '  "C1"',
        "User     External     Dependent   Unnamed",
        "Blocks   References   Blocks      Blocks",
        "    2         0           0           2",
      ].join("\n"),
    ])
    expect(cad.activeToolId()).toBe("select")

    const filtered = withBlocks()
    answer(filtered, "-BLOCK", "?", "b*")
    expect(filtered.commandLog().at(-1)).toBe(
      [
        "Defined blocks.",
        '  "B1"',
        "User     External     Dependent   Unnamed",
        "Blocks   References   Blocks      Blocks",
        "    1         0           0           2",
      ].join("\n")
    )

    const none = createHarness()
    answer(none, "-BLOCK", "?", "")
    expect(none.commandLog().at(-1)).toBe(
      [
        "Defined blocks.",
        "User     External     Dependent   Unnamed",
        "Blocks   References   Blocks      Blocks",
        "    0         0           0           0",
      ].join("\n")
    )
  })

  it("INSERT lists them in its own table (probes blocks/p02, p208, p238)", () => {
    const cad = withBlocks()
    answer(cad, "INSERT", "?", "")

    expect(cad.commandLog()).toEqual([
      "INSERT",
      "Enter block name or [?] <C1>: ?",
      "Enter block(s) to list <*>:",
      [
        "Defined blocks.",
        '  "B1"',
        '  "C1"',
        "User     Unnamed",
        "Blocks   Blocks",
        "    2        2",
      ].join("\n"),
    ])
    expect(cad.activeToolId()).toBe("select")
  })

  it("lists in Autodesk's Spanish (probes blocks/p02, p104, p156)", () => {
    const cad = withBlocks(es)
    answer(cad, "-BLOQUE", "?", "C*")
    expect(cad.commandLog().slice(-2)).toEqual([
      "Indique bloque(s) a enumerar <*>: C*",
      [
        "Bloques definidos.",
        '  "C1"',
        "Bloques     Referencias     Bloques          Bloques",
        "usuario     externas        dependientes     sin nombre",
        "    1           0               0                2",
      ].join("\n"),
    ])

    const inserting = withBlocks(es)
    answer(inserting, "INSERT", "?", "")
    expect(inserting.commandLog().at(-1)).toBe(
      [
        "Bloques definidos.",
        '  "B1"',
        '  "C1"',
        "Bloques      Bloques",
        "usuario      sin nombre",
        "    2            2",
      ].join("\n")
    )
  })
})

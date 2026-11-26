import { describe, expect, it } from "vitest"
import type { HatchEntity, InsertEntity } from "../domain/entities"
import { createHarness } from "../../test/harness"
import { circleOf, lineOf, p, rectOf } from "../../test/builders"

/**
 * The ribbon's contextual tabs (docs/plans/autocad-ui.md, §6, phase 6): what
 * acad.cuix's RibbonTabSelectors show while a command's variable says so
 * (`ribbon.mjs --contextual`), here Array Creation, ARRAYCREATION 1 and 2 from
 * ARRAYRECT's and ARRAYPOLAR's main prompt (probes arrays/p450, p451).
 */

const ARRAY_ROW = () =>
  createHarness({ entities: [lineOf(p(0, 0), p(10, 0), { id: "L1" })] })

describe("Array Creation", () => {
  it("opens at the main prompt, in front, and gives the front back as the command ends", () => {
    const cad = ARRAY_ROW()
    cad.runtime.setRibbonTab("annotate")
    cad.command("ARRAYRECT")
    // `Select objects:` — ARRAYCREATION 0 (p450).
    expect(cad.state().ribbon.contextual).toBeNull()
    cad.click({ x: 5, y: 0 }).enter()
    const tab = cad.state().ribbon.contextual
    expect(tab?.id).toBe("arrayCreationRectangular")
    expect(cad.state().ribbon.tab).toBe("arrayCreationRectangular")
    expect(tab?.fields.columns?.text).toBe("4")
    expect(tab?.fields.rows?.text).toBe("3")
    expect(tab?.fields.columnSpacing?.text).toBe("15")
    expect(tab?.fields.levelTotal?.text).toBe("1")
    expect(tab?.toggles.associative).toBe(true)
    cad.enter()
    expect(cad.state().ribbon.contextual).toBeNull()
    expect(cad.state().ribbon.tab).toBe("annotate")
  })

  it("leaves in front a tab picked while it was open", () => {
    const cad = ARRAY_ROW()
    cad.select("L1").command("ARRAYRECT")
    cad.runtime.setRibbonTab("view")
    cad.escape()
    expect(cad.state().ribbon.contextual).toBeNull()
    expect(cad.state().ribbon.tab).toBe("view")
  })

  it("takes a field as its prompt would, with no echo, in the command's one step", () => {
    const cad = ARRAY_ROW()
    cad.select("L1").command("ARRAYRECT")
    const before = cad.commandLog().length
    cad.runtime.editContextualTab({ field: "columns", text: "6" })
    cad.runtime.editContextualTab({ field: "rowSpacing", text: "20" })
    expect(cad.commandLog().length).toBe(before)
    expect(cad.state().ribbon.contextual?.fields.columns?.text).toBe("6")
    expect(cad.state().ribbon.contextual?.fields.rowSpacing?.text).toBe("20")
    // The main prompt still asked.
    expect(cad.state().commandLine.prompt).toMatch(/Select grip to edit array/)
    cad.enter()
    const array = cad.latest() as InsertEntity
    expect(array.array).toMatchObject({ columns: 6, rows: 3, rowSpacing: 20 })
    cad.undo()
    expect(cad.entities().map((e) => e.id)).toEqual(["L1"])
  })

  it("refuses what the prompt refuses, in its words", () => {
    const cad = ARRAY_ROW()
    cad.select("L1").command("ARRAYRECT")
    cad.runtime.editContextualTab({ field: "columns", text: "0" })
    cad.runtime.editContextualTab({ field: "columnSpacing", text: "0" })
    expect(cad.commandLog().slice(-2)).toEqual([
      "Value must be positive and nonzero.",
      "Value must be nonzero.",
    ])
    // A word, as its prompt refuses `FOO` (p113, p121, p433).
    cad.runtime.editContextualTab({ field: "columns", text: "abc" })
    cad.runtime.editContextualTab({ field: "levelTotal", text: "abc" })
    expect(cad.commandLog().slice(-2)).toEqual([
      "Requires a positive nonzero integer or option keyword.",
      "Requires numeric distance or two points.",
    ])
    expect(cad.state().ribbon.contextual?.fields.columns?.text).toBe("4")
    expect(cad.state().ribbon.contextual?.fields.columnSpacing?.text).toBe("15")
  })

  it("closes with Close Array as eXit, making the array", () => {
    const cad = ARRAY_ROW()
    cad.select("L1").command("ARRAYRECT")
    cad.runtime.editContextualTab({ field: "levelTotal", text: "10" })
    cad.runtime.editContextualTab({ toggle: "associative" })
    expect(cad.state().ribbon.contextual?.toggles.associative).toBe(false)
    cad.runtime.editContextualTab({ close: true })
    expect(cad.activeToolId()).toBe("select")
    expect(cad.state().ribbon.contextual).toBeNull()
    // Associative off: the loose copies, 4 × 3.
    expect(cad.entities().length).toBe(12)
  })

  it("stays open while a transparent command runs inside it", () => {
    const cad = ARRAY_ROW()
    cad.select("L1").command("ARRAYRECT")
    cad.keyIn("'ZOOM")
    expect(cad.state().ribbon.contextual?.id).toBe("arrayCreationRectangular")
    cad.runtime.editContextualTab({ field: "columns", text: "2" })
    expect(cad.state().ribbon.contextual?.fields.columns?.text).toBe("4")
    cad.escape()
    expect(cad.state().ribbon.contextual?.id).toBe("arrayCreationRectangular")
  })

  it("shows ARRAY's tab once its set is handed to ARRAYRECT", () => {
    const cad = ARRAY_ROW()
    cad.select("L1").command("ARRAY")
    expect(cad.state().ribbon.contextual).toBeNull()
    cad.enter()
    expect(cad.state().ribbon.contextual?.id).toBe("arrayCreationRectangular")
    cad.runtime.editContextualTab({ field: "rows", text: "1" })
    cad.enter()
    expect((cad.latest() as InsertEntity).array).toMatchObject({ rows: 1 })
  })

  it("opens ARRAYPOLAR's after the centre, Direction answering Fill angle's sign", () => {
    const cad = createHarness({
      entities: [circleOf(p(10, 0), 1, { id: "C1" })],
    })
    cad.select("C1").command("ARRAYPOLAR")
    // `Specify center point of array:` — ARRAYCREATION 0 (p451).
    expect(cad.state().ribbon.contextual).toBeNull()
    cad.type("0,0").enter()
    const tab = cad.state().ribbon.contextual
    expect(tab?.id).toBe("arrayCreationPolar")
    expect(tab?.fields.items?.text).toBe("6")
    expect(tab?.fields.angleBetween?.text).toBe("60")
    expect(tab?.fields.fillAngle?.text).toBe("360")
    expect(tab?.toggles).toMatchObject({ rotateItems: true, direction: true })
    cad.runtime.editContextualTab({ field: "fillAngle", text: "180" })
    expect(cad.state().ribbon.contextual?.fields.angleBetween?.text).toBe("36")
    cad.runtime.editContextualTab({ toggle: "direction" })
    cad.runtime.editContextualTab({ toggle: "rotateItems" })
    expect(cad.state().ribbon.contextual?.toggles).toMatchObject({
      rotateItems: false,
      direction: false,
    })
    cad.runtime.editContextualTab({ field: "angleBetween", text: "-5" })
    expect(cad.commandLog().at(-1)).toBe("Value must be positive and nonzero.")
    cad.enter()
    expect((cad.latest() as InsertEntity).array).toMatchObject({
      items: 6,
      fill: 180,
      clockwise: true,
      rotate: false,
    })
  })

  it("greys ARRAYPATH's spacing under Divide and keeps Measure's count within the path", () => {
    const cad = createHarness({
      entities: [
        circleOf(p(0, 0), 1, { id: "C1" }),
        lineOf(p(0, 0), p(100, 0), { id: "P" }),
      ],
    })
    cad.select("C1").command("ARRAYPATH").click({ x: 50, y: 0 })
    const tab = cad.state().ribbon.contextual
    expect(tab?.id).toBe("arrayCreationPath")
    expect(tab?.method).toBe("measure")
    expect(tab?.fields.itemSpacing).toEqual({ text: "3", disabled: false })
    cad.runtime.editContextualTab({ field: "itemSpacing", text: "25" })
    expect(cad.state().ribbon.contextual?.fields.items?.text).toBe("5")
    cad.runtime.editContextualTab({ field: "items", text: "9" })
    expect(cad.state().ribbon.contextual?.fields.items?.text).toBe("5")
    cad.runtime.editContextualTab({ method: "divide" })
    cad.runtime.editContextualTab({ field: "items", text: "11" })
    expect(cad.state().ribbon.contextual?.fields.itemSpacing).toEqual({
      text: "10",
      disabled: true,
    })
    cad.runtime.editContextualTab({ toggle: "alignItems" })
    cad.enter()
    expect((cad.latest() as InsertEntity).array).toMatchObject({
      method: "divide",
      items: 11,
      align: false,
    })
  })
})

/**
 * Hatch Creation (RBN_01738148), while HATCH asks with the ribbon open
 * (HATCHCREATION 1; desktop hatch/d01-2): its pattern, Angle and Scale are
 * HPNAME, HPANG and HPSCALE as Properties sets them, inside the run.
 */
describe("Hatch Creation", () => {
  const ROOM = () =>
    createHarness({ entities: [rectOf(p(0, 0), p(100, 50), { id: "R" })] })
  const hatch = (cad: ReturnType<typeof createHarness>) =>
    cad.entities().find((e) => e.type === "hatch") as HatchEntity | undefined

  it("opens with HATCH, in front, and gives the front back as Enter ends it", () => {
    const cad = ROOM()
    cad.runtime.setRibbonTab("insert")
    cad.command("HATCH")
    const tab = cad.state().ribbon.contextual
    expect(tab?.id).toBe("hatchCreation")
    expect(cad.state().ribbon.tab).toBe("hatchCreation")
    expect(tab?.pattern).toBe("ANGLE")
    expect(tab?.fields.hatchAngle).toEqual({ text: "0", disabled: false })
    expect(tab?.fields.hatchScale).toEqual({ text: "1", disabled: false })
    cad.click(p(50, 25)).enter()
    expect(cad.state().ribbon.contextual).toBeNull()
    expect(cad.state().ribbon.tab).toBe("insert")
    expect(hatch(cad)).toBeDefined()
  })

  it("closes with Escape, keeping the hatch, and with Close Hatch Creation", () => {
    const escaped = ROOM()
    escaped.command("HATCH").click(p(50, 25)).escape()
    expect(escaped.state().ribbon.contextual).toBeNull()
    expect(hatch(escaped)).toBeDefined()

    const closed = ROOM()
    closed.command("HATCH").click(p(50, 25))
    closed.runtime.editContextualTab({ close: true })
    expect(closed.activeToolId()).toBe("select")
    expect(closed.state().ribbon.contextual).toBeNull()
    expect(hatch(closed)).toBeDefined()
  })

  it("is not shown by -HATCH, nor by HATCH with the ribbon closed", () => {
    const dash = ROOM()
    dash.command("-HATCH")
    expect(dash.state().ribbon.contextual).toBeNull()
    const closed = ROOM()
    closed.runtime.closeRibbon()
    closed.command("HATCH")
    expect(closed.state().ribbon.contextual).toBeNull()
  })

  it("sets the pattern, angle and scale as Properties would, with no echo, in the run's one step", () => {
    const cad = ROOM()
    cad.command("HATCH").click(p(50, 25))
    const before = cad.commandLog().length
    cad.runtime.editContextualTab({ pattern: "ANSI31" })
    cad.runtime.editContextualTab({ field: "hatchAngle", text: "-30" })
    cad.runtime.editContextualTab({ field: "hatchScale", text: "2.5" })
    expect(cad.commandLog().length).toBe(before)
    const tab = cad.state().ribbon.contextual
    expect(tab?.pattern).toBe("ANSI31")
    expect(tab?.fields.hatchAngle?.text).toBe("330")
    expect(tab?.fields.hatchScale?.text).toBe("2.5")
    cad.enter()
    expect(hatch(cad)).toMatchObject({ patternId: "ANSI31", patternScale: 2.5 })
    expect(cad.runtime.document.getSettings().hatchPatternName).toBe("ANSI31")
    // One U takes the hatch and the settings back (HATCH-D37).
    cad.undo()
    expect(hatch(cad)).toBeUndefined()
    expect(cad.runtime.document.getSettings()).toMatchObject({
      hatchPatternName: "ANGLE",
      hatchPatternScale: 1,
      hatchPatternAngle: 0,
    })
  })

  it("refuses what Properties' prompts refuse, in their words", () => {
    const cad = ROOM()
    cad.command("HATCH")
    cad.runtime.editContextualTab({ field: "hatchScale", text: "0" })
    cad.runtime.editContextualTab({ field: "hatchScale", text: "abc" })
    cad.runtime.editContextualTab({ field: "hatchAngle", text: "abc" })
    expect(cad.commandLog().slice(-3)).toEqual([
      "Value must be positive and nonzero.",
      "Requires a distance (or numberX).",
      "Requires valid numeric angle or two points.",
    ])
    expect(cad.state().ribbon.contextual?.fields.hatchScale?.text).toBe("1")
  })

  it("brings HPNAME's pattern back from Solid, as the run started with it", () => {
    const cad = ROOM()
    cad.command("HPNAME")
    cad.runtime.setCommandLineText("NET")
    cad.runtime.submitCommandLine()
    cad.command("HATCH")
    cad.runtime.editContextualTab({ hatchType: "solid" })
    cad.runtime.editContextualTab({ hatchType: "pattern" })
    expect(cad.state().ribbon.contextual?.pattern).toBe("NET")
  })

  it("switches Type between Solid and the last pattern, greying Angle and Scale", () => {
    const cad = ROOM()
    cad.command("HATCH")
    cad.runtime.editContextualTab({ pattern: "NET" })
    cad.runtime.editContextualTab({ hatchType: "solid" })
    let tab = cad.state().ribbon.contextual
    expect(tab?.pattern).toBe("SOLID")
    expect(tab?.fields.hatchAngle?.disabled).toBe(true)
    expect(tab?.fields.hatchScale?.disabled).toBe(true)
    cad.runtime.editContextualTab({ hatchType: "pattern" })
    tab = cad.state().ribbon.contextual
    expect(tab?.pattern).toBe("NET")
    expect(tab?.fields.hatchScale?.disabled).toBe(false)
  })

  it("switches the boundaries' mode by Pick Points and Select", () => {
    const cad = ROOM()
    cad.command("HATCH")
    cad.runtime.editContextualTab({ boundary: "select" })
    expect(cad.state().commandLine.prompt).toBe(
      "HATCH Select objects or [picK internal point/Undo]:"
    )
    expect(cad.state().ribbon.contextual?.id).toBe("hatchCreation")
    cad.click(p(50, 0))
    cad.runtime.editContextualTab({ boundary: "pick" })
    expect(cad.state().commandLine.prompt).toBe(
      "HATCH Pick internal point or [Select objects/Undo]:"
    )
    cad.enter()
    expect(hatch(cad)?.loops).toHaveLength(1)
  })

  it("stays open while a transparent command runs inside it", () => {
    const cad = ROOM()
    cad.command("HATCH")
    cad.keyIn("'ZOOM")
    expect(cad.state().commandLine.prompt).toMatch(/>>Specify corner of window/)
    expect(cad.state().ribbon.contextual?.id).toBe("hatchCreation")
    cad.escape()
    expect(cad.state().ribbon.contextual?.id).toBe("hatchCreation")
  })
})

import { describe, expect, it } from "vitest"
import {
  mtextLayout,
  type HatchEntity,
  type InsertEntity,
  type MTextEntity,
} from "../domain/entities"
import { type CadHarness, createHarness } from "../../test/harness"
import {
  circleOf,
  hatchOf,
  lineOf,
  loopOf,
  p,
  rectOf,
} from "../../test/builders"
import type { ContextualEdit } from "./EngineState"

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

  // desktop 2026-11-26, arr-zero, arr-abc: Columns 0 and `abc` put back to
  // the value, no line written.
  it("leaves what the prompt refuses unchanged, in silence", () => {
    const cad = ARRAY_ROW()
    cad.select("L1").command("ARRAYRECT")
    const from = cad.commandLog().length
    cad.runtime.editContextualTab({ field: "columns", text: "0" })
    cad.runtime.editContextualTab({ field: "columnSpacing", text: "0" })
    cad.runtime.editContextualTab({ field: "columns", text: "abc" })
    cad.runtime.editContextualTab({ field: "levelTotal", text: "abc" })
    expect(cad.commandLog().slice(from)).toEqual([])
    expect(cad.state().ribbon.contextual?.fields.columns?.text).toBe("4")
    expect(cad.state().ribbon.contextual?.fields.columnSpacing?.text).toBe("15")
    expect(cad.state().commandLine.command).toBe("ARRAYRECT")
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
    const at = cad.commandLog().length
    cad.runtime.editContextualTab({ field: "angleBetween", text: "-5" })
    expect(cad.commandLog().length).toBe(at)
    expect(cad.state().ribbon.contextual?.fields.angleBetween?.text).toBe("36")
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
    cad.runtime.editContextualTab({ toggle: "fillPath" })
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

describe("ARRAYPATH's count toggle", () => {
  const pathRun = () => {
    const cad = createHarness({
      entities: [
        circleOf(p(0, 0), 1, { id: "C1" }),
        lineOf(p(0, 0), p(100, 0), { id: "P" }),
      ],
    })
    cad.select("C1").command("ARRAYPATH").click({ x: 50, y: 0 })
    return cad
  }
  const tab = (cad: ReturnType<typeof pathRun>) => cad.state().ribbon.contextual

  // desktop arraypath-tab: under Measure the count's toggle lit and Items
  // greyed (17), Between not; the toggle's tooltip TT_AcPathArrayItemCount.
  it("greys Measure's count while it fills the path, the toggle lit", () => {
    const cad = pathRun()
    expect(tab(cad)?.toggles.fillPath).toBe(true)
    expect(tab(cad)?.fields.items).toEqual({ text: "34", disabled: true })
    cad.runtime.editContextualTab({ field: "items", text: "5" })
    expect(tab(cad)?.fields.items?.text).toBe("34")
    // Filling, a new spacing takes all that fit.
    cad.runtime.editContextualTab({ field: "itemSpacing", text: "10" })
    expect(tab(cad)?.fields.items?.text).toBe("11")
    cad.runtime.editContextualTab({ field: "itemSpacing", text: "5" })
    expect(tab(cad)?.fields.items?.text).toBe("21")
  })

  it("takes a count once the toggle is off, and fills again as it lights", () => {
    const cad = pathRun()
    const from = cad.commandLog().length
    cad.runtime.editContextualTab({ toggle: "fillPath" })
    expect(tab(cad)?.toggles.fillPath).toBe(false)
    expect(tab(cad)?.fields.items?.disabled).toBe(false)
    cad.runtime.editContextualTab({ field: "items", text: "4" })
    cad.runtime.editContextualTab({ field: "itemSpacing", text: "10" })
    expect(tab(cad)?.fields.items?.text).toBe("4")
    cad.runtime.editContextualTab({ toggle: "fillPath" })
    expect(tab(cad)?.fields.items).toEqual({ text: "11", disabled: true })
    expect(cad.commandLog().slice(from)).toEqual([])
    cad.enter()
    expect((cad.latest() as InsertEntity).array).toMatchObject({
      method: "measure",
      items: 11,
      spacing: 10,
    })
  })

  it("leaves Divide's count to the user, the toggle unlit there", () => {
    const cad = pathRun()
    cad.runtime.editContextualTab({ method: "divide" })
    expect(tab(cad)?.toggles.fillPath).toBe(false)
    expect(tab(cad)?.fields.items?.disabled).toBe(false)
    cad.runtime.editContextualTab({ toggle: "fillPath" })
    cad.runtime.editContextualTab({ field: "items", text: "6" })
    expect(tab(cad)?.fields.items?.text).toBe("6")
  })

  it("is turned off by a count typed at the prompt and on by Fill entire path", () => {
    const cad = pathRun()
    cad.option("Items").type("10").enter().type("3").enter()
    expect(tab(cad)?.fields.items).toEqual({ text: "3", disabled: false })
    cad.option("Items").enter().option("Fill entire path")
    expect(tab(cad)?.fields.items).toEqual({ text: "11", disabled: true })
  })

  it("offers all that fit after a spacing typed at the prompt while it fills", () => {
    const cad = pathRun()
    cad.option("Items").type("1").enter().enter()
    expect(tab(cad)?.fields.items).toEqual({ text: "101", disabled: true })
  })

  // p334: Divide's count typed, Measure at a new spacing still offers it.
  it("keeps the toggle across Method, a count given under Divide turning it off", () => {
    const cad = pathRun()
    cad.runtime.editContextualTab({ method: "divide" })
    cad.runtime.editContextualTab({ method: "measure" })
    expect(tab(cad)?.toggles.fillPath).toBe(true)
    cad.runtime.editContextualTab({ method: "divide" })
    cad.runtime.editContextualTab({ field: "items", text: "6" })
    cad.runtime.editContextualTab({ method: "measure" })
    expect(tab(cad)?.toggles.fillPath).toBe(false)
    expect(tab(cad)?.fields.items).toEqual({ text: "6", disabled: false })
  })
})

/**
 * Array, the selection's (RBN_01740317, RBN_01740329, RBN_01740323): at
 * `Command:` with one array selected (AcRectangularAssociativeArraySelected
 * and its twins), its fields the array's Properties rows.
 */
describe("Array, the selection's tab", () => {
  const withArray = (
    command: string,
    ...then: Array<(cad: CadHarness) => void>
  ) => {
    const cad = createHarness({
      entities: [
        circleOf(p(0, 0), 1, { id: "C1" }),
        lineOf(p(0, 50), p(100, 50), { id: "P" }),
      ],
    })
    cad.select("C1").command(command)
    for (const step of then) step(cad)
    cad.enter()
    return cad
  }
  const rect = () => withArray("ARRAYRECT")
  const arrayId = (cad: CadHarness) => cad.latest().id
  const typed = (cad: CadHarness, text: string) => {
    const from = cad.commandLog().length
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
    return cad.commandLog().slice(from)
  }

  it("opens in front with one array selected and gives the front back as it is dropped", () => {
    const cad = rect()
    cad.runtime.setRibbonTab("insert")
    cad.select(arrayId(cad))
    const tab = cad.state().ribbon.contextual
    expect(tab?.id).toBe("arraySelectionRectangular")
    expect(cad.state().ribbon.tab).toBe("arraySelectionRectangular")
    // sel-arr-rect: Columns 4, Between 9, Total 27; Levels 1, Between 1, Total 1.
    expect(tab?.fields.columns?.text).toBe("4")
    expect(tab?.fields.columnSpacing?.text).toBe("3")
    expect(tab?.fields.columnTotal?.text).toBe("9")
    expect(tab?.fields.rows?.text).toBe("3")
    expect(tab?.fields.rowTotal?.text).toBe("6")
    expect(tab?.fields.levels?.text).toBe("1")
    expect(tab?.fields.levelTotal?.text).toBe("1")
    cad.escape()
    expect(cad.state().ribbon.contextual).toBeNull()
    expect(cad.state().ribbon.tab).toBe("insert")
  })

  it("is not shown for two objects, another object or inside a command", () => {
    const cad = rect()
    cad.select(arrayId(cad), "P")
    expect(cad.state().ribbon.contextual).toBeNull()
    cad.escape().select("P")
    expect(cad.state().ribbon.contextual).toBeNull()
    cad.escape().select(arrayId(cad)).command("MOVE")
    expect(cad.state().ribbon.contextual).toBeNull()
  })

  // desktop sel-arr-rect-col5: Columns 4 to 5 writes no line, U then
  // `Command: _U` alone.
  it("applies a field to the array with no line, a step U names nothing", () => {
    const cad = rect()
    const id = arrayId(cad)
    cad.select(id)
    const from = cad.commandLog().length
    cad.runtime.editContextualTab({ field: "columns", text: "5" })
    expect(cad.commandLog().slice(from)).toEqual([])
    expect(cad.byId<InsertEntity>(id).array).toMatchObject({ columns: 5 })
    expect(cad.state().ribbon.contextual?.fields.columnTotal?.text).toBe("12")
    expect(cad.state().ribbon.contextual?.id).toBe("arraySelectionRectangular")
    cad.escape()
    expect(typed(cad, "_U")).toEqual(["U"])
    expect(cad.byId<InsertEntity>(id).array).toMatchObject({ columns: 4 })
  })

  it("leaves a locked array as the Properties palette leaves it", () => {
    const cad = rect()
    const id = arrayId(cad)
    const locked = cad.runtime.createLayer("Locked")
    cad.runtime.setCurrentLayer(cad.byId<InsertEntity>(id).layerId)
    cad.runtime.document.update({
      ...cad.byId<InsertEntity>(id),
      layerId: locked,
    })
    cad.runtime.updateLayer(locked, { locked: true })
    cad.select(id)
    expect(cad.state().ribbon.contextual?.id).toBe("arraySelectionRectangular")
    cad.runtime.editContextualTab({ field: "columns", text: "7" })
    expect(cad.byId<InsertEntity>(id).array).toMatchObject({ columns: 4 })
    expect(cad.state().lockedObjectsDialog).toEqual({ removed: 1 })
    expect(cad.state().ribbon.contextual).toBeNull()
  })

  it("sets the spacing from a Total, and refuses in silence what the row refuses", () => {
    const cad = rect()
    const id = arrayId(cad)
    cad.select(id)
    cad.runtime.editContextualTab({ field: "columnTotal", text: "30" })
    expect(cad.byId<InsertEntity>(id).array).toMatchObject({ colSpacing: 10 })
    cad.runtime.editContextualTab({ field: "levelTotal", text: "7" })
    expect(cad.byId<InsertEntity>(id).array).toMatchObject({ levelSpacing: 7 })
    const from = cad.commandLog().length
    cad.runtime.editContextualTab({ field: "columns", text: "0" })
    cad.runtime.editContextualTab({ field: "rows", text: "abc" })
    cad.runtime.editContextualTab({ field: "rowSpacing", text: "0" })
    expect(cad.commandLog().slice(from)).toEqual([])
    expect(cad.state().ribbon.contextual?.fields.columns?.text).toBe("4")
    expect(cad.state().ribbon.contextual?.fields.rowSpacing?.text).toBe("3")
  })

  it("shows a ring's Items and lights Rotate Items and Direction (sel-arr-polar)", () => {
    const cad = withArray("ARRAYPOLAR", (c) => c.click({ x: -20, y: 0 }))
    const id = arrayId(cad)
    cad.select(id)
    const tab = cad.state().ribbon.contextual
    expect(tab?.id).toBe("arraySelectionPolar")
    expect(tab?.fields.items?.text).toBe("6")
    expect(tab?.fields.angleBetween?.text).toBe("60")
    expect(tab?.fields.fillAngle?.text).toBe("360")
    expect(tab?.toggles).toEqual({ rotateItems: true, direction: true })
    cad.runtime.editContextualTab({ toggle: "direction" })
    cad.runtime.editContextualTab({ toggle: "rotateItems" })
    cad.runtime.editContextualTab({ field: "items", text: "8" })
    expect(cad.byId<InsertEntity>(id).array).toMatchObject({
      clockwise: true,
      rotate: false,
      items: 8,
    })
    expect(cad.state().ribbon.contextual?.toggles).toEqual({
      rotateItems: false,
      direction: false,
    })
  })

  it("shows a path's Items, its Method and Align Items, Divide greying Between", () => {
    const cad = withArray("ARRAYPATH", (c) => c.click({ x: 50, y: 50 }))
    const id = arrayId(cad)
    cad.select(id)
    const tab = cad.state().ribbon.contextual
    expect(tab?.id).toBe("arraySelectionPath")
    expect(tab?.method).toBe("measure")
    expect(tab?.fields.itemSpacing).toEqual({ text: "3", disabled: false })
    cad.runtime.editContextualTab({ method: "divide" })
    cad.runtime.editContextualTab({ field: "items", text: "5" })
    cad.runtime.editContextualTab({ toggle: "alignItems" })
    expect(cad.state().ribbon.contextual?.fields.itemSpacing).toEqual({
      text: "25",
      disabled: true,
    })
    cad.runtime.editContextualTab({ field: "itemSpacing", text: "7" })
    expect(cad.byId<InsertEntity>(id).array).toMatchObject({
      method: "divide",
      items: 5,
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

  // As Array Creation's fields (desktop 2026-11-26, arr-zero): unchanged,
  // nothing written.
  it("leaves what Properties' prompts refuse unchanged, in silence", () => {
    const cad = ROOM()
    cad.command("HATCH")
    const from = cad.commandLog().length
    cad.runtime.editContextualTab({ field: "hatchScale", text: "0" })
    cad.runtime.editContextualTab({ field: "hatchScale", text: "abc" })
    cad.runtime.editContextualTab({ field: "hatchAngle", text: "abc" })
    expect(cad.commandLog().slice(from)).toEqual([])
    expect(cad.state().ribbon.contextual?.fields.hatchScale?.text).toBe("1")
    expect(cad.state().ribbon.contextual?.fields.hatchAngle?.text).toBe("0")
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

describe("Text Editor", () => {
  /** A drawing with S5, a style of fixed height 5, beside Standard. */
  const withS5 = () => {
    const cad = createHarness()
    const s5 = cad.runtime.createTextStyle("S5", undefined, false)
    cad.runtime.updateTextStyle(s5, { height: 5 })
    return { cad, s5 }
  }
  /** MTEXT's box drawn from (0, 0) to (200, -100), left in the editor. */
  const editing = () => {
    const { cad, s5 } = withS5()
    cad.command("MTEXT").click(p(0, 0)).click(p(200, -100))
    return { cad, s5 }
  }
  const mtext = (cad: ReturnType<typeof createHarness>) =>
    cad.only<MTextEntity>("mtext")

  it("opens with MTEXT's in-place editor, not at its corners nor with -MTEXT", () => {
    const cad = createHarness()
    cad.runtime.setRibbonTab("insert")
    cad.command("MTEXT").click(p(0, 0))
    expect(cad.state().ribbon.contextual).toBeNull()
    cad.click(p(200, -100))
    const tab = cad.state().ribbon.contextual
    expect(tab?.id).toBe("textEditor")
    expect(cad.state().ribbon.tab).toBe("textEditor")
    expect(tab?.textStyle).toBe("Standard")
    expect(tab?.attachment).toBe("tl")
    expect(tab?.fields.textHeight).toEqual({ text: "2.5", disabled: false })
    cad.type("A").enter()
    expect(cad.state().ribbon.contextual).toBeNull()
    expect(cad.state().ribbon.tab).toBe("insert")

    const dash = createHarness()
    dash.command("-MTEXT").click(p(0, 0)).click(p(200, -100))
    expect(dash.state().ribbon.contextual).toBeNull()
  })

  it("sets the object's style and height, never TEXTSTYLE or TEXTSIZE, with no echo", () => {
    // Desktop 2026-11-26: S5 picked, the object S5 at 5; 7 typed, at 7;
    // TEXTSTYLE Standard and TEXTSIZE 2.5 all along.
    const { cad, s5 } = editing()
    const before = cad.commandLog().length
    cad.runtime.editContextualTab({ textStyle: s5 })
    expect(cad.state().textStyleChangeDialog).toBe(false)
    expect(cad.state().ribbon.contextual?.textStyle).toBe(s5)
    expect(cad.state().ribbon.contextual?.fields.textHeight?.text).toBe("5")
    cad.runtime.editContextualTab({ textStyle: "Standard" })
    expect(cad.state().ribbon.contextual?.fields.textHeight?.text).toBe("2.5")
    cad.runtime.editContextualTab({ field: "textHeight", text: "7" })
    expect(cad.commandLog().length).toBe(before)
    cad.type("ABC")
    cad.runtime.editContextualTab({ close: true })
    expect(cad.activeToolId()).toBe("select")
    expect(mtext(cad)).toMatchObject({ styleId: "Standard", height: 7 })
    expect(cad.state().currentTextStyleId).toBe("Standard")

    // The next run starts again from the current style and TEXTSIZE, 2.5.
    cad.command("MTEXT").click(p(0, -200)).click(p(200, -300))
    expect(cad.state().ribbon.contextual?.fields.textHeight?.text).toBe("2.5")
    cad.escape()
  })

  // Letters too: desktop 2026-11-27, te-height-enter (`abc` back to 2.5).
  it("puts back a height of 0 or below, or letters, in silence", () => {
    const { cad } = editing()
    const before = cad.commandLog().length
    cad.runtime.editContextualTab({ field: "textHeight", text: "0" })
    cad.runtime.editContextualTab({ field: "textHeight", text: "-3" })
    cad.runtime.editContextualTab({ field: "textHeight", text: "abc" })
    expect(cad.commandLog().length).toBe(before)
    expect(cad.state().ribbon.contextual?.fields.textHeight?.text).toBe("2.5")
    cad.escape()
  })

  it("asks before a style while the editor holds text, Yes applying it and No not", () => {
    const { cad, s5 } = editing()
    cad.type("ABC")
    cad.runtime.editContextualTab({ textStyle: s5 })
    expect(cad.state().textStyleChangeDialog).toBe(true)
    expect(cad.state().ribbon.contextual?.textStyle).toBe("Standard")
    cad.runtime.answerTextStyleChange("no")
    expect(cad.state().textStyleChangeDialog).toBe(false)
    expect(cad.state().ribbon.contextual?.textStyle).toBe("Standard")
    cad.runtime.editContextualTab({ textStyle: s5 })
    cad.runtime.answerTextStyleChange("yes")
    expect(cad.state().ribbon.contextual?.textStyle).toBe(s5)
    cad.runtime.editContextualTab({ close: true })
    expect(mtext(cad)).toMatchObject({ styleId: s5, height: 5 })
  })

  it("keeps the keys typed on the drawing after a control, as the editor's", () => {
    // A control gives the drawing the focus back; the editor's box takes it
    // only after the next render, and its first key went to the command line.
    const { cad } = editing()
    cad.type("AB")
    cad.runtime.editContextualTab({ attachment: "mc" })
    cad.press("C")
    cad.press("Enter")
    cad.press("D")
    expect(cad.state().commandLine.buffer).toBe("")
    expect(cad.activeToolId()).toBe("mtext")
    // Ctrl+Enter keeps the text, as in the editor's own box.
    cad.press("Enter", { ctrlKey: true })
    expect(cad.activeToolId()).toBe("select")
    expect(mtext(cad).contents).toBe("ABC\\PD")
  })

  it("asks nothing for the style the text wears, and drops a question its command left", () => {
    const { cad, s5 } = editing()
    cad.type("ABC")
    cad.runtime.editContextualTab({ textStyle: "Standard" })
    expect(cad.state().textStyleChangeDialog).toBe(false)
    cad.runtime.editContextualTab({ textStyle: s5 })
    expect(cad.state().textStyleChangeDialog).toBe(true)
    cad.runtime.setActiveTool("line")
    expect(cad.state().textStyleChangeDialog).toBe(false)
    cad.runtime.answerTextStyleChange("yes")
    expect(cad.state().textStyleChangeDialog).toBe(false)
    cad.escape()
  })

  it("hangs the text off the Justification picked, in the box the corners drew", () => {
    const { cad } = editing()
    cad.runtime.editContextualTab({ attachment: "br" })
    expect(cad.state().ribbon.contextual?.attachment).toBe("br")
    cad.type("X")
    cad.runtime.editContextualTab({ close: true })
    expect(mtext(cad).attachment).toBe("br")
    expect(mtext(cad).position).toBeCloseToPoint(p(200, -100))
  })

  // Desktop 2026-11-27 (te-*, te2-*): TEXTEDIT's Middle Center to Bottom
  // Center moved the point down half the line's 2.5, then to Bottom Left half
  // the width (100.688) to the left; the text never moved.
  it("keeps TEXTEDIT's text where it stands, its point moved to the Justification", () => {
    const cad = createHarness()
    cad.command("MTEXT").click(p(0, 0)).click(p(100, -30))
    cad.type("Hello world").enter()
    cad.command("TEXTEDIT").click(p(3, -1))
    const height = -mtextLayout(mtext(cad)).y0
    // AutoCAD's frame 2.5 high; Arimo's ink stands a little taller
    // (`measureTextInk`).
    expect(Math.abs(height - 2.5)).toBeLessThan(0.1)
    cad.runtime.editContextualTab({ attachment: "mc" })
    cad.runtime.editContextualTab({ attachment: "bc" })
    cad.runtime.editContextualTab({ attachment: "bl" })
    cad.runtime.editContextualTab({ attachment: "br" })
    cad.runtime.editContextualTab({ close: true })
    expect(mtext(cad).attachment).toBe("br")
    expect(mtext(cad).position).toBeCloseToPoint(p(100, -height))
    cad.escape()
  })

  it("shows TEXTEDIT's multiline text and writes what it sets with the wording", () => {
    const { cad, s5 } = withS5()
    cad.command("MTEXT").click(p(0, 0)).click(p(200, -100))
    cad.type("OLD").enter()
    cad.command("TEXTEDIT").click(p(5, -1))
    const tab = cad.state().ribbon.contextual
    expect(tab?.id).toBe("textEditor")
    expect(tab?.fields.textHeight?.text).toBe("2.5")
    cad.runtime.editContextualTab({ field: "textHeight", text: "4" })
    cad.runtime.editContextualTab({ attachment: "mc" })
    // Unchanged wording, changed height and Justification: still an edit.
    cad.enter()
    expect(mtext(cad)).toMatchObject({
      contents: "OLD",
      height: 4,
      attachment: "mc",
      styleId: "Standard",
    })
    // The text stays: its point goes to the middle of its frame.
    const frame = mtextLayout({ ...mtext(cad), attachment: "tl" })
    expect(mtext(cad).position).toBeCloseToPoint(p(100, frame.y0 / 2))
    cad.escape()
    cad.undo()
    expect(mtext(cad)).toMatchObject({ height: 2.5, attachment: "tl" })

    // A style with text in the editor is asked about first.
    cad.command("TEXTEDIT").click(p(5, -1))
    cad.runtime.editContextualTab({ textStyle: s5 })
    expect(cad.state().textStyleChangeDialog).toBe(true)
    cad.runtime.answerTextStyleChange("yes")
    cad.runtime.editContextualTab({ close: true })
    expect(mtext(cad)).toMatchObject({ styleId: s5, height: 5 })
    cad.escape()
  })
})

describe("Hatch Editor, the selection's tab", () => {
  const hatches = () =>
    createHarness({
      entities: [
        hatchOf([loopOf(p(0, 0), p(10, 10))], {
          id: "H1",
          patternId: "ANSI31",
        }),
        hatchOf([loopOf(p(20, 0), p(30, 10))], {
          id: "H2",
          patternId: "ANSI37",
        }),
        lineOf(p(0, 50), p(100, 50), { id: "L" }),
      ],
    })
  const typed = (cad: CadHarness, text: string) => {
    const from = cad.commandLog().length
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
    return cad.commandLog().slice(from)
  }
  const edited = (cad: CadHarness, edit: ContextualEdit) => {
    const from = cad.commandLog().length
    cad.runtime.editContextualTab(edit)
    return cad.commandLog().slice(from)
  }

  // AcHatchSelected: `Selection.Count >= 1 && Selection.ContainsOnly("Hatch")`.
  it("opens with hatches only selected, their pattern, angle and scale shown", () => {
    const cad = hatches()
    cad.select("H1")
    expect(cad.state().ribbon.contextual?.pattern).toBe("ANSI31")
    cad.select("H1", "H2")
    const tab = cad.state().ribbon.contextual
    expect(tab?.id).toBe("hatchEditor")
    expect(cad.state().ribbon.tab).toBe("hatchEditor")
    // Patterns that differ show none (desktop 2026-11-27, he-two).
    expect(tab?.pattern).toBeNull()
    expect(tab?.fields.hatchAngle).toEqual({ text: "0", disabled: false })
    expect(tab?.fields.hatchScale).toEqual({ text: "1", disabled: false })
    cad.select("L")
    expect(cad.state().ribbon.contextual).toBeNull()
    cad.escape().select("H1").command("MOVE")
    expect(cad.state().ribbon.contextual).toBeNull()
  })

  // desktop sel-hatch-ansi32: the gallery's pick writes -HATCHEDIT's prompts,
  // the tab stays, U names `'-HATCHEDIT GROUP`.
  it("runs '_-hatchedit on the selection for a pattern, the hatch kept selected", () => {
    const cad = hatches()
    cad.select("H1")
    expect(edited(cad, { pattern: "ANSI32" })).toEqual([
      "'_-hatchedit 1 found",
      "Enter hatch option [DIsassociate/Properties] <Properties>: _p",
      "Enter a pattern name or [?/Solid] <ANSI31>: ANSI32",
      "Specify a scale for the pattern <1.0000>:",
      "Specify an angle for the pattern <0>:",
    ])
    expect(cad.byId<HatchEntity>("H1").patternId).toBe("ANSI32")
    expect(cad.selectedIds()).toEqual(["H1"])
    expect(cad.state().ribbon.contextual?.pattern).toBe("ANSI32")
    cad.escape()
    expect(typed(cad, "_U")).toEqual(["U", "'-HATCHEDIT GROUP"])
    expect(cad.byId<HatchEntity>("H1").patternId).toBe("ANSI31")
  })

  // Desktop 2026-11-27, he-two-same: the same pattern, angles and scales
  // that differ; Angle's box reads *VARIES*, Scale's nothing.
  it("shows no angle or scale where the hatches' differ", () => {
    const cad = hatches()
    cad.select("H1")
    edited(cad, { field: "hatchAngle", text: "45" })
    edited(cad, { field: "hatchScale", text: "2" })
    cad.escape().select("H2")
    edited(cad, { pattern: "ANSI31" })
    cad.escape().select("H1", "H2")
    const tab = cad.state().ribbon.contextual
    expect(tab?.pattern).toBe("ANSI31")
    expect(tab?.fields.hatchAngle).toEqual({
      text: "",
      disabled: false,
      varies: true,
    })
    expect(tab?.fields.hatchScale).toEqual({
      text: "",
      disabled: false,
      varies: true,
    })
  })

  // AcWindows.dll: `'^R_-hatchedit\n_p\n\n\n{0}\n`, `…\n_p\nSOLID\n`, and
  // the pattern's macro with HPLASTPATTERN; Scale, though it has a macro,
  // writes nothing and U names nothing (desktop 2026-11-27: 3 typed).
  it("types the angle and Type as their macros do, and sets the scale", () => {
    const cad = hatches()
    cad.select("H1")
    expect(edited(cad, { field: "hatchAngle", text: "30" }).slice(-3)).toEqual([
      "Enter a pattern name or [?/Solid] <ANSI31>:",
      "Specify a scale for the pattern <1.0000>:",
      "Specify an angle for the pattern <0>: 30",
    ])
    expect(edited(cad, { field: "hatchScale", text: "2" })).toEqual([])
    expect(cad.byId<HatchEntity>("H1").patternScale).toBe(2)
    expect(cad.state().ribbon.contextual?.fields.hatchScale?.text).toBe("2")
    expect(cad.selectedIds()).toEqual(["H1"])
    // The scale retyped as it is makes no step: U takes back the 2.
    expect(edited(cad, { field: "hatchScale", text: "2" })).toEqual([])
    expect(typed(cad, "_U")).toEqual(["U"])
    expect(cad.byId<HatchEntity>("H1").patternScale).toBe(1)
    cad.select("H1")
    edited(cad, { field: "hatchScale", text: "2" })
    expect(edited(cad, { hatchType: "solid" }).slice(-1)).toEqual([
      "Enter a pattern name or [?/Solid] <ANSI31>: SOLID",
    ])
    expect(cad.state().ribbon.contextual?.fields.hatchAngle?.disabled).toBe(
      true
    )
    // HPLASTPATTERN: ANSI31 at first (probe hatchedit/p16).
    expect(edited(cad, { hatchType: "pattern" }).slice(-3, -2)).toEqual([
      "Enter a pattern name or [?/Solid] <SOLID>: ANSI31",
    ])
    expect(cad.byId<HatchEntity>("H1").patternId).toBe("ANSI31")
  })

  // Type reads every hatch: a solid among patterns is no type of the set.
  it("turns a set with a solid fill among patterns to either type", () => {
    const cad = hatches()
    cad.select("H2")
    edited(cad, { hatchType: "solid" })
    cad.escape().select("H1", "H2")
    expect(cad.state().ribbon.contextual?.pattern).toBeNull()
    expect(
      edited(cad, { hatchType: "pattern" }).filter((line) =>
        line.startsWith("Enter a pattern name")
      )
    ).toEqual(["Enter a pattern name or [?/Solid] <varies> ANSI31"])
    expect(cad.byId<HatchEntity>("H2").patternId).toBe("ANSI31")
  })

  it("leaves hatches on a locked layer, as the palette leaves them", () => {
    const cad = hatches()
    const locked = cad.runtime.createLayer("Locked")
    cad.runtime.document.update({
      ...cad.byId<HatchEntity>("H1"),
      layerId: locked,
    })
    cad.runtime.updateLayer(locked, { locked: true })
    cad.select("H1")
    expect(edited(cad, { pattern: "ANSI32" })).toEqual([])
    expect(cad.byId<HatchEntity>("H1").patternId).toBe("ANSI31")
  })

  it("refuses in silence what its box refuses, typing nothing", () => {
    const cad = hatches()
    cad.select("H1")
    expect(edited(cad, { field: "hatchScale", text: "0" })).toEqual([])
    expect(edited(cad, { field: "hatchScale", text: "abc" })).toEqual([])
    expect(edited(cad, { field: "hatchAngle", text: "abc" })).toEqual([])
    expect(cad.byId<HatchEntity>("H1").patternScale).toBe(1)
    expect(cad.state().commandLine.command).toBeNull()
  })

  // Desktop 2026-11-27: Close with every hatch on a locked layer, its `_CA`
  // refused where the set is asked again, the command left asking.
  it("closes into Select hatch objects: when every hatch is locked", () => {
    const cad = hatches()
    const locked = cad.runtime.createLayer("Locked")
    cad.runtime.document.update({
      ...cad.byId<HatchEntity>("H1"),
      layerId: locked,
    })
    cad.runtime.updateLayer(locked, { locked: true })
    cad.select("H1")
    expect(edited(cad, { close: true })).toEqual([
      "_-HATCHEDIT 1 found",
      "1 was on a locked layer.",
      "Select hatch objects: _CA",
      "*Invalid selection*",
      "Expects a point or Window/Last/Crossing/BOX/ALL/Fence/WPolygon/CPolygon/Group/Add/Remove/Multiple/Previous/Undo/AUto/SIngle/SUbobject/Object",
    ])
    expect(cad.state().commandLine.question).toEqual([
      { keywords: false, text: "Select hatch objects:" },
    ])
    cad.escape()
  })

  // MM_1932: `^R^C^C_-HATCHEDIT _CA`.
  it("closes with Close Hatch Editor, dropping the selection", () => {
    const cad = hatches()
    cad.select("H1")
    expect(edited(cad, { close: true })).toEqual([
      "_-HATCHEDIT 1 found",
      "Enter hatch option [DIsassociate/Properties] <Properties>: _CA",
    ])
    expect(cad.selectedIds()).toEqual([])
    expect(cad.state().ribbon.contextual).toBeNull()
  })
})

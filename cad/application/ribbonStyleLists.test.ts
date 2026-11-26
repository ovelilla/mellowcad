import { describe, expect, it } from "vitest"

import { type CadHarness, createHarness } from "../../test/harness"
import { lineOf, p, textOf } from "../../test/builders"
import { createAttributeDefinition } from "../domain/attributes"
import { createDimension } from "../domain/dimensions"
import { DEFAULT_LAYER_ID } from "../domain/layers"
import type { DimensionEntity, TextEntity } from "../domain/entities"

/** What `texts`, typed at the command line and confirmed, wrote in the history. */
function written(cad: CadHarness, ...texts: string[]): string[] {
  const from = cad.commandLog().length
  for (const text of texts) {
    cad.runtime.setCommandLineText(text)
    cad.runtime.submitCommandLine()
  }
  return cad.commandLog().slice(from)
}

const drawing = () =>
  createHarness({
    entities: [
      textOf(p(0, 0), "A", { id: "T1" }),
      textOf(p(0, 10), "B", { id: "T2" }),
      createDimension("linear", p(0, 0), p(50, 0), p(25, 10), { id: "D1" }),
      lineOf(p(0, 0), p(100, 0), { id: "L1" }),
    ],
  })

// The Text Style and Dimension Style lists are bound to the selection's
// effective property, as the layer and colour drop-downs are
// (AcWindows.resources.dll's BAML: EffectiveProperties[TextStyle],
// [DimensionStyle], .Layer, [Color]).
describe("the ribbon's Text Style list", () => {
  it("with nothing selected makes the style current, a step U names 'TEXTSTYLE", () => {
    const cad = drawing()
    const standard = cad.state().currentTextStyleId
    const notes = cad.runtime.createTextStyle("Notes", undefined, false)
    expect(cad.state().textStyleControl).toBe(standard)

    cad.runtime.applyTextStyleControl(notes)
    expect(cad.state().currentTextStyleId).toBe(notes)
    expect(cad.state().textStyleControl).toBe(notes)
    expect(cad.byId<TextEntity>("T1").styleId).toBe(standard)

    expect(written(cad, "_U")).toEqual(["U", "'TEXTSTYLE"])
    expect(cad.state().currentTextStyleId).toBe(standard)
  })

  it("with text selected restyles it, a step U names CHPROP, the current style kept", () => {
    const cad = drawing()
    const standard = cad.state().currentTextStyleId
    const notes = cad.runtime.createTextStyle("Notes", undefined, false)
    cad.select("T1", "L1")
    expect(cad.state().textStyleControl).toBe(standard)

    cad.runtime.applyTextStyleControl(notes)
    expect(cad.byId<TextEntity>("T1").styleId).toBe(notes)
    expect(cad.byId<TextEntity>("T2").styleId).toBe(standard)
    expect(cad.state().currentTextStyleId).toBe(standard)
    expect(cad.state().textStyleControl).toBe(notes)

    expect(written(cad, "_U")).toEqual(["U", "CHPROP"])
    expect(cad.byId<TextEntity>("T1").styleId).toBe(standard)
  })

  it("shows nothing for texts of two styles, the current style for no text", () => {
    const cad = drawing()
    const standard = cad.state().currentTextStyleId
    const notes = cad.runtime.createTextStyle("Notes", undefined, false)
    cad.select("T1")
    cad.runtime.applyTextStyleControl(notes)
    cad.select("T1", "T2")
    expect(cad.state().textStyleControl).toBeNull()

    cad.escape()
    cad.select("L1")
    expect(cad.state().textStyleControl).toBe(standard)
    // No text in the selection: the pick sets TEXTSTYLE (unverified).
    cad.runtime.applyTextStyleControl(notes)
    expect(cad.state().currentTextStyleId).toBe(notes)
  })

  // A locked line takes no text style: the pick leaves it selected and
  // counts it in no "locked layers" dialog.
  it("leaves alone a locked object it could not restyle anyway", () => {
    const cad = createHarness()
    const locked = cad.runtime.createLayer("Locked")
    cad.runtime.setCurrentLayer(DEFAULT_LAYER_ID)
    cad.runtime.document.load([
      textOf(p(0, 0), "A", { id: "T1" }),
      lineOf(p(0, 40), p(100, 40), { id: "L1", layerId: locked }),
    ])
    cad.runtime.updateLayer(locked, { locked: true })
    const notes = cad.runtime.createTextStyle("Notes", undefined, false)
    cad.select("T1", "L1")
    cad.runtime.applyTextStyleControl(notes)
    expect(cad.byId<TextEntity>("T1").styleId).toBe(notes)
    expect(cad.selectedIds()).toEqual(["T1", "L1"])
    expect(cad.state().lockedObjectsDialog).toBeNull()
  })

  it("restyles an attribute definition, as the Properties palette's Style does", () => {
    const cad = createHarness({
      entities: [createAttributeDefinition(p(0, 0), "TAG", { id: "A1" })],
    })
    const notes = cad.runtime.createTextStyle("Notes", undefined, false)
    cad.select("A1")
    cad.runtime.applyTextStyleControl(notes)
    expect(cad.state().textStyleControl).toBe(notes)
    cad.runtime.setSelectionTextStyle(cad.state().currentTextStyleId)
    expect(cad.state().textStyleControl).toBe(cad.state().currentTextStyleId)
  })
})

describe("the ribbon's Dimension Style list", () => {
  it("with nothing selected makes the style current, a step U names 'DIMSTYLE", () => {
    const cad = drawing()
    const iso = cad.state().currentDimStyleId
    const coarse = cad.runtime.createDimStyle("Coarse", undefined, false)
    expect(cad.state().dimStyleControl).toBe(iso)

    cad.runtime.applyDimStyleControl(coarse)
    expect(cad.state().currentDimStyleId).toBe(coarse)
    expect(cad.byId<DimensionEntity>("D1").styleId).toBe(iso)

    expect(written(cad, "_U")).toEqual(["U", "'DIMSTYLE"])
    expect(cad.state().currentDimStyleId).toBe(iso)
  })

  it("with a dimension selected restyles it, a step U names CHPROP", () => {
    const cad = drawing()
    const iso = cad.state().currentDimStyleId
    const coarse = cad.runtime.createDimStyle("Coarse", undefined, false)
    cad.select("D1", "T1")
    cad.runtime.applyDimStyleControl(coarse)
    expect(cad.byId<DimensionEntity>("D1").styleId).toBe(coarse)
    expect(cad.state().currentDimStyleId).toBe(iso)
    expect(cad.state().dimStyleControl).toBe(coarse)
    // The text in the same selection kept its style.
    expect(cad.state().textStyleControl).toBe(cad.state().currentTextStyleId)

    expect(written(cad, "_U")).toEqual(["U", "CHPROP"])
    expect(cad.byId<DimensionEntity>("D1").styleId).toBe(iso)
  })
})

// The lists' last entries (AcWindows.resources.dll's BAML: Commands
// `^C^C_STYLE`, `^C^C_DIMSTYLE`), where the buttons beside them run
// `'_style` and `'_dimstyle`.
describe("Manage Text Styles... and Manage Dimension Styles...", () => {
  it("end the running command and open the dialog, echoed", () => {
    const cad = createHarness()
    written(cad, "_LINE", "0,0")
    const from = cad.commandLog().length
    cad.runtime.runRibbonButton("manageTextStyles")
    expect(cad.commandLog().slice(from)).toEqual([
      "Specify next point or [Undo]: *Cancel*",
      "_STYLE",
    ])
    expect(cad.state().styleDialog).toBe("text")
    cad.runtime.setStyleDialog(null)

    cad.runtime.runRibbonButton("manageDimensionStyles")
    expect(cad.commandLog().at(-1)).toBe("_DIMSTYLE")
    expect(cad.state().styleDialog).toBe("dimension")
  })
})

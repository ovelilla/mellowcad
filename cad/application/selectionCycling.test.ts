import { describe, expect, it } from "vitest"

import { createHarness } from "../../test/harness"
import { lineOf, p } from "../../test/builders"
import { THEME } from "../scene/theme"

/**
 * AutoCAD's selection cycling (SELECTIONCYCLING, Ctrl+W / our F4): reaching an
 * object that sits under another one, either by walking the stack with
 * Shift+Space or by choosing from the Selection list box.
 */

/** Two nearly coincident lines: a click at the origin covers both. */
function stacked() {
  return createHarness({
    entities: [
      lineOf(p(-100, 0), p(100, 0), { id: "TOP" }),
      lineOf(p(-100, 2), p(100, 2), { id: "UNDER" }),
    ],
  })
}

describe("selection cycling", () => {
  it("is off by default: a click takes the nearest object and Shift+Space does nothing", () => {
    const cad = stacked()

    expect(cad.state().selectionCycling.active).toBe(false)
    expect(cad.press(" ", { shiftKey: true })).toBe(false)

    cad.click(p(0, 0))
    expect(cad.selectedIds()).toEqual(["TOP"])
  })

  it("walks the objects under the pick box with Shift+Space", () => {
    const cad = stacked()
    cad.runtime.toggleSelectionCycling()
    // Badge only (SELECTIONCYCLING 1), so a click picks straight away.
    cad.runtime.setSelectionCyclingList(false)

    cad.moveTo(p(0, 0))
    expect(cad.state().selectionCycling.candidates.map((c) => c.id)).toEqual([
      "TOP",
      "UNDER",
    ])

    expect(cad.press(" ", { shiftKey: true })).toBe(true)
    cad.click(p(0, 0))
    expect(cad.selectedIds()).toEqual(["UNDER"])
  })

  it("wraps back to the topmost object", () => {
    const cad = stacked()
    cad.runtime.toggleSelectionCycling()
    cad.runtime.setSelectionCyclingList(false)

    cad.moveTo(p(0, 0)).press(" ", { shiftKey: true })
    cad.press(" ", { shiftKey: true })
    cad.click(p(0, 0))
    expect(cad.selectedIds()).toEqual(["TOP"])
  })

  it("keeps the cycled object while the cursor stays over the same stack", () => {
    const cad = stacked()
    cad.runtime.toggleSelectionCycling()
    cad.runtime.setSelectionCyclingList(false)

    cad.moveTo(p(0, 0)).press(" ", { shiftKey: true })
    cad.moveTo(p(20, 1))
    expect(cad.state().selectionCycling.currentId).toBe("UNDER")

    // A different stack starts again at the topmost object.
    cad.moveTo(p(0, 400))
    cad.moveTo(p(0, 0))
    expect(cad.state().selectionCycling.currentId).toBe("TOP")
  })

  it("shows the badge only where objects overlap", () => {
    const cad = stacked()
    cad.runtime.toggleSelectionCycling()

    cad.moveTo(p(0, 0))
    expect(cad.state().selectionCycling.candidates.length).toBe(2)
    const badge = cad
      .scene()
      .primitives.filter(
        (prim) => prim.kind === "rect" && prim.stroke?.color === THEME.grip
      )
    expect(badge.length).toBe(2)

    cad.moveTo(p(0, 300))
    expect(cad.state().selectionCycling.candidates.length).toBe(0)
  })

  it("does not cycle while a command is asking for a point", () => {
    const cad = stacked()
    cad.runtime.toggleSelectionCycling()

    cad.command("LINE").moveTo(p(0, 0))
    expect(cad.state().selectionCycling.candidates).toEqual([])
    expect(cad.press(" ", { shiftKey: true })).toBe(false)
  })

  it("clears the candidates when cycling is turned off", () => {
    const cad = stacked()
    cad.runtime.toggleSelectionCycling()
    cad.moveTo(p(0, 0))
    expect(cad.state().selectionCycling.candidates.length).toBe(2)

    cad.runtime.toggleSelectionCycling()
    expect(cad.state().selectionCycling.active).toBe(false)
    expect(cad.state().selectionCycling.candidates).toEqual([])
  })

  it("cycles inside a command's object prompt too", () => {
    const cad = stacked()
    cad.runtime.toggleSelectionCycling()
    cad.runtime.setSelectionCyclingList(false)

    // MOVE's "Select objects" prompt takes the cycled object, not the topmost.
    cad.command("MOVE").moveTo(p(0, 0)).press(" ", { shiftKey: true })
    cad.click(p(0, 0))
    expect(cad.selectedIds()).toEqual(["UNDER"])
  })
})

describe("selection list box", () => {
  it("defers the click and offers the overlapping objects", () => {
    const cad = stacked()
    cad.runtime.toggleSelectionCycling()

    cad.click(p(0, 0))
    expect(cad.selectedIds()).toEqual([])
    expect(cad.state().selectionCycling.listAt).not.toBeNull()
    expect(cad.state().selectionCycling.candidates.map((c) => c.label)).toEqual(
      ["Line", "Line"]
    )
  })

  it("replays the click against the chosen object", () => {
    const cad = stacked()
    cad.runtime.toggleSelectionCycling()

    cad.click(p(0, 0))
    cad.runtime.chooseCyclingCandidate("UNDER")
    expect(cad.selectedIds()).toEqual(["UNDER"])
    expect(cad.state().selectionCycling.listAt).toBeNull()
  })

  it("does not ask again once Shift+Space singled an object out", () => {
    const cad = stacked()
    cad.runtime.toggleSelectionCycling()

    cad.moveTo(p(0, 0)).press(" ", { shiftKey: true })
    cad.click(p(0, 0))
    expect(cad.state().selectionCycling.listAt).toBeNull()
    expect(cad.selectedIds()).toEqual(["UNDER"])
  })

  it("asks again over a different stack", () => {
    const cad = createHarness({
      entities: [
        lineOf(p(-100, 0), p(100, 0), { id: "TOP" }),
        lineOf(p(-100, 2), p(100, 2), { id: "UNDER" }),
        lineOf(p(-100, 200), p(100, 200), { id: "OTHER_TOP" }),
        lineOf(p(-100, 202), p(100, 202), { id: "OTHER_UNDER" }),
      ],
    })
    cad.runtime.toggleSelectionCycling()

    cad.moveTo(p(0, 0)).press(" ", { shiftKey: true })
    cad.moveTo(p(0, 200))
    cad.click(p(0, 200))
    expect(cad.state().selectionCycling.listAt).not.toBeNull()
    expect(cad.selectedIds()).toEqual([])
  })

  it("highlights the candidate being hovered in the list", () => {
    const cad = stacked()
    cad.runtime.toggleSelectionCycling()

    cad.click(p(0, 0))
    cad.runtime.previewCyclingCandidate("UNDER")
    const highlighted = cad
      .scene()
      .primitives.filter(
        (prim) =>
          prim.kind === "segment" &&
          prim.stroke.color === THEME.selected &&
          prim.stroke.width === 2.5
      )
    expect(highlighted.length).toBe(1)
  })

  it("Escape dismisses the list without selecting or ending the command", () => {
    const cad = stacked()
    cad.runtime.toggleSelectionCycling()

    cad.click(p(0, 0))
    expect(cad.press("Escape")).toBe(true)
    expect(cad.selectedIds()).toEqual([])
    expect(cad.state().selectionCycling.listAt).toBeNull()
  })

  it("lets a drag from a stack through instead of opening the list", () => {
    const cad = stacked()
    cad.runtime.toggleSelectionCycling()

    // A crossing box started on the overlapping lines must still box-select.
    cad.drag(p(0, 0), p(-200, 100))
    expect(cad.state().selectionCycling.listAt).toBeNull()
    expect(cad.selectedIds().sort()).toEqual(["TOP", "UNDER"])
  })

  it("picks straight away where only one object is under the cursor", () => {
    const cad = createHarness({
      entities: [lineOf(p(-100, 200), p(100, 200), { id: "ALONE" })],
    })
    cad.runtime.toggleSelectionCycling()

    cad.click(p(0, 200))
    expect(cad.state().selectionCycling.listAt).toBeNull()
    expect(cad.selectedIds()).toEqual(["ALONE"])
  })
})

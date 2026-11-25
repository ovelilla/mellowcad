import { describe, expect, it, vi } from "vitest"

import { drawingFocus } from "./drawing-focus"

describe("a popup's final focus", () => {
  // Chrome, 2026-11-24: with the trigger focused after a pick in the ribbon's
  // Lineweight list, `0` moved the lineweight on to 0.15 mm and Space opened
  // the list, neither reaching the command line.
  it("is the drawing's, and Base UI focuses nothing of its own", () => {
    const focusSurface = vi.fn()
    const finalFocus = drawingFocus({ focusSurface })
    expect(focusSurface).not.toHaveBeenCalled()
    expect(finalFocus()).toBe(false)
    expect(focusSurface).toHaveBeenCalledTimes(1)
  })

  // The application menu's Units opens Drawing Units; the menu unmounts
  // after it, and its final focus leaves the dialog its focus.
  it("leaves the focus where a modal dialog holds it", () => {
    const focusSurface = vi.fn()
    const inDialog = { closest: () => ({}) }
    vi.stubGlobal("document", { activeElement: inDialog })
    try {
      expect(drawingFocus({ focusSurface })()).toBe(false)
      expect(focusSurface).not.toHaveBeenCalled()
    } finally {
      vi.unstubAllGlobals()
    }
  })
})

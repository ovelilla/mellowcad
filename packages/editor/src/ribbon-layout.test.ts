import { describe, expect, it } from "vitest"

import {
  nextRibbonState,
  resolveRibbonLayout,
  RIBBON_HEIGHT,
  RIBBON_LAYOUT,
  ribbonLayoutScript,
  type RibbonState,
} from "./ribbon-layout"
import { EDITOR_ROOT_ATTRIBUTE } from "./editor-root"

const KEY = "host:ribbon"

/**
 * Runs the head script against a fake page whose root the parser inserts
 * after the script, and reads what it wrote there.
 */
function runScript(stored: string | null): string | undefined {
  const attributes: Record<string, string> = {}
  const root = {
    setAttribute: (name: string, value: string) => (attributes[name] = value),
  }
  let parsed = false
  let mutated: (() => void) | undefined
  class MutationObserver {
    constructor(callback: () => void) {
      mutated = callback
    }
    observe() {}
    disconnect() {}
  }
  const document = {
    documentElement: {},
    querySelector: (selector: string) =>
      parsed && selector === `[${EDITOR_ROOT_ATTRIBUTE}]` ? root : null,
    addEventListener: () => {},
  }
  const localStorage = {
    getItem: (key: string) => (key === KEY ? stored : null),
  }
  new Function(
    "localStorage",
    "document",
    "MutationObserver",
    ribbonLayoutScript(KEY)
  )(localStorage, document, MutationObserver)
  parsed = true
  mutated?.()
  return attributes["data-ribbon"]
}

describe("the ribbon's minimize state", () => {
  // The help's Cycle Through All: full, panel buttons, panel titles, tabs.
  it("steps through all four, or toggles with the one chosen", () => {
    const order: RibbonState[] = []
    let state: RibbonState = "full"
    for (let i = 0; i < 4; i++) {
      state = nextRibbonState({ state, mode: "cycle" })
      order.push(state)
    }
    expect(order).toEqual(["panelButtons", "panelTitles", "tabs", "full"])
    expect(nextRibbonState({ state: "full", mode: "panelTitles" })).toBe(
      "panelTitles"
    )
    expect(nextRibbonState({ state: "panelTitles", mode: "panelTitles" })).toBe(
      "full"
    )
  })

  // Every tab and panel shown, 3D Tools and View's Visual Styles,
  // Coordinates and Navigate too, which Drafting & Annotation hides: the
  // owner's choice (plan, decision 4). Show Tabs and Show Panels hide them,
  // the device keeping what they show.
  it("starts full and cycling, and reads what is stored leniently", () => {
    expect(RIBBON_LAYOUT).toEqual({
      state: "full",
      mode: "cycle",
      hiddenTabs: [],
      hiddenPanels: [],
      panelTitles: true,
    })
    expect(resolveRibbonLayout(null)).toEqual(RIBBON_LAYOUT)
    expect(resolveRibbonLayout({ state: "tabs", mode: 3 })).toEqual({
      ...RIBBON_LAYOUT,
      state: "tabs",
    })
    expect(resolveRibbonLayout({ state: "huge", mode: "tabs" })).toEqual({
      ...RIBBON_LAYOUT,
      mode: "tabs",
    })
    expect(
      resolveRibbonLayout({
        hiddenTabs: [],
        hiddenPanels: ["draw", 3],
        panelTitles: false,
      })
    ).toEqual({ ...RIBBON_LAYOUT, hiddenTabs: [], panelTitles: false })
  })

  it("shows the 3D tools to a device that only stored the deploy's hiding", () => {
    const stored = {
      state: "panelTitles",
      hiddenTabs: ["tools3d"],
      hiddenPanels: ["visualStyles", "coordinates", "navigate"],
    }
    expect(resolveRibbonLayout(stored)).toEqual({
      ...RIBBON_LAYOUT,
      state: "panelTitles",
    })
    // One stored since, hiding the same four, keeps them hidden.
    expect(
      resolveRibbonLayout({ ...stored, shownAtFirst: true })
    ).toMatchObject({
      hiddenTabs: ["tools3d"],
      hiddenPanels: ["visualStyles", "coordinates", "navigate"],
    })
    // One that hid something of its own keeps it all.
    expect(
      resolveRibbonLayout({ ...stored, hiddenPanels: ["visualStyles"] })
    ).toEqual({
      ...RIBBON_LAYOUT,
      state: "panelTitles",
      hiddenTabs: ["tools3d"],
      hiddenPanels: ["visualStyles"],
    })
  })

  // plan §2.3: the ribbon below the title bar in each state.
  it("is 124, 86, 45 or 24 high", () => {
    expect(RIBBON_HEIGHT).toEqual({
      full: 124,
      panelButtons: 86,
      panelTitles: 45,
      tabs: 24,
    })
  })
})

describe("the ribbon's head script", () => {
  it("writes a minimized state on the root as the parser inserts it", () => {
    expect(runScript(JSON.stringify({ state: "panelTitles" }))).toBe(
      "panelTitles"
    )
    expect(runScript(JSON.stringify({ state: "tabs", mode: "cycle" }))).toBe(
      "tabs"
    )
  })

  // Without the attribute the zone is the full ribbon's, as with no script.
  it("writes nothing for the full ribbon, nothing stored or nonsense", () => {
    expect(runScript(JSON.stringify({ state: "full" }))).toBeUndefined()
    expect(runScript(null)).toBeUndefined()
    expect(runScript("{")).toBeUndefined()
    expect(runScript(JSON.stringify({ state: "nope" }))).toBeUndefined()
  })
})

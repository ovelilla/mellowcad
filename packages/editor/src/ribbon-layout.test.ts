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

  it("starts full and cycling, and reads what is stored leniently", () => {
    expect(RIBBON_LAYOUT).toEqual({ state: "full", mode: "cycle" })
    expect(resolveRibbonLayout(null)).toEqual(RIBBON_LAYOUT)
    expect(resolveRibbonLayout({ state: "tabs", mode: 3 })).toEqual({
      state: "tabs",
      mode: "cycle",
    })
    expect(resolveRibbonLayout({ state: "huge", mode: "tabs" })).toEqual({
      state: "full",
      mode: "tabs",
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

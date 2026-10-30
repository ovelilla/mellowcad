import { describe, expect, test } from "vitest"

import type { EngineState } from "@mellowcad/engine"

import { lineOf, p } from "@/test/builders"
import { createHarness, type CadHarness } from "@/test/harness"

import {
  KEPT_BY_BROWSERS,
  SHORTCUT_SECTIONS,
  type KeyCombo,
  type Shortcut,
  type ShortcutBehaviour,
  type ShortcutMode,
} from "./shortcuts"

// The docs' shortcuts page says what each key does: these hold the list to
// what `CadRuntime.keyDown` does with it.

const MODE_STATE: Record<ShortcutMode, (state: EngineState) => boolean> = {
  commandHistory: (state) => state.commandLine.historyOpen,
  commandLine: (state) => state.commandLine.visible,
  objectSnap: (state) => state.snapActive,
  selectionCycling: (state) => state.selectionCycling.active,
  grid: (state) => state.gridVisible,
  ortho: (state) => state.orthoActive,
  snapMode: (state) => state.snapModeActive,
  polarTracking: (state) => state.polarActive,
  objectSnapTracking: (state) => state.objectSnapTrackingActive,
}

/** A drawing with history: two lines on top of each other and one drawn by LINE. */
function drawing(): CadHarness {
  const h = createHarness({
    entities: [lineOf(p(0, 0), p(100, 0)), lineOf(p(0, 0), p(100, 0))],
  })
  h.command("LINE").click(p(0, 50)).click(p(50, 50)).escape()
  return h
}

/** The key as a browser reports it: a letter is uppercase only with Shift. */
function press(h: CadHarness, combo: KeyCombo): boolean {
  const key =
    combo.key.length === 1 && !combo.shift ? combo.key.toLowerCase() : combo.key
  return h.press(key, { ctrlKey: combo.ctrl ?? false, shiftKey: combo.shift ?? false })
}

const name = (combo: KeyCombo) =>
  [combo.ctrl && "Ctrl", combo.shift && "Shift", combo.key === " " ? "Space" : combo.key]
    .filter(Boolean)
    .join("+")

const BEHAVIOURS: Record<ShortcutBehaviour, (h: CadHarness, combo: KeyCombo) => void> = {
  selectAll: (h, combo) => {
    expect(press(h, combo)).toBe(true)
    expect(h.state().selectionCount).toBe(3)
  },
  enter: (h, combo) => {
    expect(press(h, combo)).toBe(true)
    expect(h.state().commandLine.command).toBe("LINE")
  },
  escape: (h, combo) => {
    h.command("CIRCLE")
    press(h, combo)
    expect(h.state().commandLine.command).toBeNull()
  },
  recall: (h, combo) => {
    expect(press(h, { key: "ArrowUp" })).toBe(true)
    expect(h.state().commandLine.buffer).toBe("LINE")
    if (combo.key === "ArrowDown") {
      expect(press(h, combo)).toBe(true)
      expect(h.state().commandLine.buffer).toBe("")
    }
  },
  complete: (h, combo) => {
    for (const letter of "CIRC") h.press(letter)
    expect(press(h, combo)).toBe(true)
    expect(h.state().commandLine.buffer).toMatch(/^CIRCLE/)
  },
  cycle: (h, combo) => {
    h.press("F4")
    h.moveTo(p(50, 0))
    const before = h.state().selectionCycling.currentId
    expect(before).not.toBeNull()
    expect(press(h, combo)).toBe(true)
    expect(h.state().selectionCycling.currentId).not.toBe(before)
  },
}

function check(shortcut: Shortcut, combo: KeyCombo) {
  const h = drawing()
  const { action } = shortcut
  if ("mode" in action) {
    const read = MODE_STATE[action.mode]
    const before = read(h.state())
    expect(press(h, combo)).toBe(true)
    expect(read(h.state())).toBe(!before)
  } else if ("command" in action) {
    const ids = action.command.map((id) => id.toLowerCase())
    const count = h.entities().length
    if (ids[0] === "mredo") h.press("z", { ctrlKey: true })
    expect(press(h, combo)).toBe(true)
    if (ids[0] === "u") expect(h.entities().length).toBe(count - 1)
    else if (ids[0] === "mredo") expect(h.entities().length).toBe(count)
    else {
      // An accelerator is acad.cuix's `^C^C_qsave`: the history echoes it.
      const echoes = h.state().commandLine.recent.map((entry) => entry.text.toLowerCase())
      expect(echoes.some((echo) => ids.some((id) => echo.startsWith(`_${id}`)))).toBe(true)
    }
  } else {
    BEHAVIOURS[action.behaviour](h, combo)
  }
}

describe("each shortcut the docs list does what they say", () => {
  const cases = SHORTCUT_SECTIONS.flatMap((section) =>
    (section.shortcuts as readonly Shortcut[]).flatMap((shortcut) =>
      shortcut.keys.map((combo) => [name(combo), shortcut, combo] as const)
    )
  )
  test.each(cases)("%s", (_, shortcut, combo) => check(shortcut, combo))
})

test("every function key and Ctrl shortcut the editor takes is listed", () => {
  const listed = new Set(
    [
      ...SHORTCUT_SECTIONS.flatMap((section) =>
        (section.shortcuts as readonly Shortcut[]).flatMap((shortcut) => shortcut.keys)
      ),
      ...KEPT_BY_BROWSERS,
    ].map(name)
  )
  const swept: KeyCombo[] = [
    ...Array.from({ length: 12 }, (_, index) => ({ key: `F${index + 1}` })),
    ...[..."ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"].map((key) => ({ key, ctrl: true as const })),
  ]
  const taken = swept.filter((combo) => press(drawing(), combo)).map(name)
  expect(taken.filter((key) => !listed.has(key))).toEqual([])
})

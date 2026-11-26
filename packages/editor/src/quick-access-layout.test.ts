import { describe, expect, it } from "vitest"

import {
  QUICK_ACCESS_SHOWN,
  parseQuickAccess,
  toggleQuickAccess,
} from "./quick-access-layout"

// The Quick Access Toolbar's Customize ▾ (docs/plans/autocad-ui.md, §2.2):
// acad.cuix's toolbar less Plot at first, a command added at its end.
describe("the Quick Access Toolbar's commands", () => {
  it("start as acad.cuix's, less what is not built", () => {
    expect(QUICK_ACCESS_SHOWN).toEqual([
      "new",
      "open",
      "save",
      "saveAs",
      "undo",
      "redo",
    ])
    expect(parseQuickAccess(null)).toEqual(QUICK_ACCESS_SHOWN)
    expect(parseQuickAccess("{")).toEqual(QUICK_ACCESS_SHOWN)
    expect(parseQuickAccess('"new"')).toEqual(QUICK_ACCESS_SHOWN)
  })

  it("read what is stored, in its order, without strangers or repeats", () => {
    expect(
      parseQuickAccess('["properties","new","plot","new","undo"]')
    ).toEqual(["properties", "new", "undo"])
    expect(parseQuickAccess("[]")).toEqual([])
  })

  it("add a command at the end and take one from its place", () => {
    const added = toggleQuickAccess(QUICK_ACCESS_SHOWN, "properties", true)
    expect(added.at(-1)).toBe("properties")
    const removed = toggleQuickAccess(added, "save", false)
    expect(removed).toEqual([
      "new",
      "open",
      "saveAs",
      "undo",
      "redo",
      "properties",
    ])
    expect(toggleQuickAccess(removed, "save", true).at(-1)).toBe("save")
  })
})

import { describe, expect, it } from "vitest"

import {
  foldAt,
  foldSteps,
  levelFor,
  panelShape,
  reductionsOf,
} from "./ribbon-fold"
import { HOME, HOME_FOLD } from "./ribbon-home"
import { RIBBON_TABS } from "./ribbon-tabs"

const home = RIBBON_TABS[0]
const panel = (id: string) => {
  const found = HOME.find((p) => p.id === id)
  if (!found) throw new Error(id)
  return found
}

describe("Home's fold", () => {
  // Each step must name a panel of Home and a reduction it has, or the
  // order measured on the desktop silently loses a step.
  it("takes each panel's reductions and folds every panel, Draw last", () => {
    const steps = foldSteps(home)
    expect(steps).toBe(HOME_FOLD)
    for (const p of HOME) {
      const reduces = steps.filter(
        (s) => s.panel === p.id && s.step === "reduce"
      )
      expect(reduces.length, p.id).toBe(reductionsOf(p).length)
      const folds = steps.filter((s) => s.panel === p.id && s.step === "fold")
      expect(folds.length, p.id).toBe(1)
      // A panel sheds its width before it folds.
      const last = steps.findLastIndex((s) => s.panel === p.id)
      if (folds.length > 0) expect(steps[last].step, p.id).toBe("fold")
    }
  })

  // plan §2.3: Modify's columns drop their text right to left (1600, 1536,
  // 1440); Block's Edit Attributes before its column (1680, 1600).
  it("sheds the text the desktop showed shed, in its order", () => {
    const modify = panel("modify")
    expect(reductionsOf(modify)).toEqual([
      { kind: "iconsOnly", cells: [[2]] },
      { kind: "iconsOnly", cells: [[1]] },
      { kind: "iconsOnly", cells: [[0]] },
    ])
    const block = panelShape(panel("block"), 1)
    expect(block.iconsOnly(1, 1)).toBe(true)
    expect(block.iconsOnly(1, 0)).toBe(false)
    expect(panelShape(panel("block"), 2).iconsOnly(1, 0)).toBe(true)
    expect(panelShape(panel("properties"), 1).narrowCombos).toBe(true)
  })

  // The owner's capture of 2026-11-27: under 800, Draw folds too.
  it("leaves every panel whole at level 0, Draw at the last but one, none at the last", () => {
    const whole = foldAt(home, 0)
    for (const p of HOME)
      expect(whole.get(p.id)).toEqual({ reduced: 0, folded: false })
    const butOne = foldAt(home, HOME_FOLD.length - 1)
    for (const p of HOME)
      expect(butOne.get(p.id)?.folded, p.id).toBe(p.id !== "draw")
    const last = foldAt(home, HOME_FOLD.length)
    for (const p of HOME) expect(last.get(p.id)?.folded, p.id).toBe(true)
  })
})

describe("another tab's fold", () => {
  // Their order on the desktop is unverified here (they fit at 1280): every
  // panel sheds first, the last first, then they fold from the right.
  it("sheds from the right, then folds from the right, the first last", () => {
    for (const tab of RIBBON_TABS.slice(1)) {
      const steps = foldSteps(tab)
      const firstFold = steps.findIndex((s) => s.step === "fold")
      expect(steps.slice(firstFold).every((s) => s.step === "fold")).toBe(true)
      expect(steps.slice(firstFold).map((s) => s.panel)).toEqual(
        tab.panels.map((p) => p.id).reverse()
      )
    }
  })
})

describe("the level for a width", () => {
  it("is the first that fits, or the first not measured yet", () => {
    expect(levelFor(1000, [1200, 1100, 900, 700], 3)).toBe(2)
    expect(levelFor(1000, [1200, undefined, 900], 3)).toBe(1)
    expect(levelFor(1500, [1200, 1100], 3)).toBe(0)
    expect(levelFor(500, [1200, 1100, 900, 700], 3)).toBe(3)
  })
})

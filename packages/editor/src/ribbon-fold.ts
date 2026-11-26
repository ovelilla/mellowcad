import type {
  PanelId,
  RibbonControl,
  RibbonFoldStep,
  RibbonPanel,
  RibbonReduction,
  RibbonSlot,
  RibbonTab,
} from "./ribbon-home"

/**
 * How the window's width has left one panel: how many of its reductions are
 * applied, and whether it is folded to one button.
 */
export interface PanelFold {
  readonly reduced: number
  readonly folded: boolean
}

const WHOLE: PanelFold = { reduced: 0, folded: false }

/** Whether a control shows its text beside a small icon (`SmallWithText`). */
function hasSmallText(control: RibbonControl): boolean {
  return (
    (control.kind === "tool" ||
      control.kind === "split" ||
      control.kind === "attributeDisplay") &&
    control.size === "small"
  )
}

function slotHasSmallText(slot: RibbonSlot): boolean {
  if (slot.kind === "column") return slot.rows.some(hasSmallText)
  if (slot.kind === "rows")
    return slot.rows.some((row) =>
      row.some((c) => typeof c !== "string" && hasSmallText(c))
    )
  if (slot.kind === "fields") return false
  return hasSmallText(slot)
}

/**
 * A panel's reductions: its own, or each slot whose small controls show
 * their text dropping it, from the last slot to the first, as Modify's
 * columns do on the desktop (1600, 1536, 1440).
 */
export function reductionsOf(panel: RibbonPanel): readonly RibbonReduction[] {
  if (panel.reduce) return panel.reduce
  const out: RibbonReduction[] = []
  for (let i = panel.slots.length - 1; i >= 0; i--)
    if (slotHasSmallText(panel.slots[i]))
      out.push({ kind: "iconsOnly", cells: [[i]] })
  return out
}

/**
 * The order a tab's panels shed width and fold in as the window narrows:
 * the tab's own, as measured on the desktop (Home's), else the rule Home's
 * shows — every panel sheds its width first, the last panel first, then the
 * panels fold from the right, all but the first. WHY a rule: Insert,
 * Annotate, 3D Tools and View hold so little here that they fit at 1280;
 * their order on the desktop is unverified.
 */
export function foldSteps(tab: RibbonTab): readonly RibbonFoldStep[] {
  if (tab.fold) return tab.fold
  const steps: RibbonFoldStep[] = []
  const fromRight = [...tab.panels].reverse()
  for (const panel of fromRight)
    reductionsOf(panel).forEach(() =>
      steps.push({ panel: panel.id, step: "reduce" })
    )
  for (const panel of fromRight.slice(0, -1))
    steps.push({ panel: panel.id, step: "fold" })
  return steps
}

/** Each panel of `tab` once the first `level` steps of its fold are taken. */
export function foldAt(
  tab: RibbonTab,
  level: number
): ReadonlyMap<PanelId, PanelFold> {
  const out = new Map<PanelId, PanelFold>(
    tab.panels.map((panel) => [panel.id, WHOLE])
  )
  for (const { panel, step } of foldSteps(tab).slice(0, level)) {
    const now = out.get(panel) ?? WHOLE
    out.set(
      panel,
      step === "fold"
        ? { ...now, folded: true }
        : { ...now, reduced: now.reduced + 1 }
    )
  }
  return out
}

/** What the reductions a panel has taken leave of it. */
export interface PanelShape {
  /** Whether a cell's small controls show their icon alone. */
  readonly iconsOnly: (slot: number, row?: number) => boolean
  readonly narrowCombos: boolean
}

export function panelShape(panel: RibbonPanel, reduced: number): PanelShape {
  const taken = reductionsOf(panel).slice(0, reduced)
  return {
    iconsOnly: (slot, row) =>
      taken.some(
        (r) =>
          r.kind === "iconsOnly" &&
          r.cells.some(
            ([s, at]) => s === slot && (at === undefined || at === row)
          )
      ),
    narrowCombos: taken.some((r) => r.kind === "narrowCombos"),
  }
}

/**
 * The fold for a row `width` wide, from what each level was measured to
 * need: the first level that fits, or the first not measured yet, which the
 * ribbon then measures. WHY measured: the panels' widths are the browser's,
 * by the language and the members shown, never a table.
 */
export function levelFor(
  width: number,
  needed: readonly (number | undefined)[],
  levels: number
): number {
  for (let level = 0; level < levels; level++) {
    const need = needed[level]
    if (need === undefined || need <= width) return level
  }
  return levels
}

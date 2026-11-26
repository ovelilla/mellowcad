/**
 * Which commands the Quick Access Toolbar shows: its Customize ▾ list
 * (docs/plans/autocad-ui.md, §2.2, F4). AutoCAD keeps the toolbar in the
 * workspace, not in the drawing, so here it is this device's, like the
 * status bar's Customization (`status-bar-layout.ts`), under the host's key
 * (`layoutStorage.quickAccess`; with none, it is not remembered). The title
 * bar has its height whatever it shows, so the choice is read after mount.
 */

/**
 * The commands the list offers that exist here, in its order
 * (`autocad/uia-pop-qat-custom.txt`): New, Open, Save, Save As..., Undo,
 * Redo, then Match Properties and Properties; Plot, Batch Plot, Layer, Plot
 * Preview, Render, Sheet Set Manager and Workspace are not built.
 */
export const QUICK_ACCESS_ITEMS = [
  "new",
  "open",
  "save",
  "saveAs",
  "undo",
  "redo",
  "matchProp",
  "properties",
] as const

export type QuickAccessItem = (typeof QUICK_ACCESS_ITEMS)[number]

/** What the toolbar shows at first: acad.cuix's Quick Access Toolbar 1, less Plot. */
export const QUICK_ACCESS_SHOWN: readonly QuickAccessItem[] = [
  "new",
  "open",
  "save",
  "saveAs",
  "undo",
  "redo",
]

const isItem = (value: unknown): value is QuickAccessItem =>
  (QUICK_ACCESS_ITEMS as readonly unknown[]).includes(value)

/**
 * The commands shown, in the toolbar's order, from `stored`, the remembered
 * JSON: an item added goes after the others, as AutoCAD adds one at the
 * toolbar's end (its place there unverified).
 */
export function parseQuickAccess(
  stored: string | null
): readonly QuickAccessItem[] {
  try {
    const parsed: unknown = JSON.parse(stored ?? "null")
    if (!Array.isArray(parsed)) return QUICK_ACCESS_SHOWN
    return [...new Set(parsed.filter(isItem))]
  } catch {
    return QUICK_ACCESS_SHOWN
  }
}

/** What this device remembers, or the defaults when storage is blocked. */
export function readQuickAccess(
  key: string | undefined
): readonly QuickAccessItem[] {
  if (key === undefined) return QUICK_ACCESS_SHOWN
  try {
    return parseQuickAccess(window.localStorage.getItem(key))
  } catch {
    return QUICK_ACCESS_SHOWN
  }
}

/** The toolbar with `item` shown or not: added at its end, removed from its place. */
export function toggleQuickAccess(
  shown: readonly QuickAccessItem[],
  item: QuickAccessItem,
  on: boolean
): readonly QuickAccessItem[] {
  const without = shown.filter((each) => each !== item)
  return on ? [...without, item] : without
}

export function rememberQuickAccess(
  key: string | undefined,
  shown: readonly QuickAccessItem[]
): void {
  if (key === undefined) return
  try {
    window.localStorage.setItem(key, JSON.stringify(shown))
  } catch {
    // Not remembered: the next visit shows the defaults.
  }
}

/**
 * Which tools the status bar shows: its Customization menu, AutoCAD's
 * right-most button ("Specifies what command buttons to display on the status
 * bar"). AutoCAD keeps the choice in the user's profile, not in the drawing,
 * so here it is this device's, like the palette panel's width
 * (`palette-layout.ts`), under the host's key (`layoutStorage.statusBar`;
 * with none, it is not remembered). The bar has its height whatever it shows,
 * so the choice is read after mount: it never moves the canvas.
 */

/** The tools the menu lists, in the order of AutoCAD's status bar. */
export const STATUS_BAR_ITEMS = [
  "coordinates",
  "model",
  "grid",
  "snap",
  "ortho",
  "polar",
  "otrack",
  "osnap",
  "lineweight",
  "cycling",
  "units",
  "cleanScreen",
] as const

export type StatusBarItem = (typeof STATUS_BAR_ITEMS)[number]

/**
 * The tools hidden in `stored`, the remembered JSON. Everything shows until
 * the user hides it: the coordinates too (COORDS 1, `docs/coverage/drafting-aids.md`).
 */
export function parseHiddenStatusItems(
  stored: string | null
): ReadonlySet<StatusBarItem> {
  try {
    const parsed: unknown = JSON.parse(stored ?? "null")
    if (!Array.isArray(parsed)) return new Set()
    return new Set(STATUS_BAR_ITEMS.filter((item) => parsed.includes(item)))
  } catch {
    return new Set()
  }
}

/** What this device remembers, or nothing hidden when storage is blocked. */
export function readHiddenStatusItems(
  key: string | undefined
): ReadonlySet<StatusBarItem> {
  if (key === undefined) return new Set()
  try {
    return parseHiddenStatusItems(window.localStorage.getItem(key))
  } catch {
    return new Set()
  }
}

export function rememberHiddenStatusItems(
  key: string | undefined,
  hidden: ReadonlySet<StatusBarItem>
): void {
  if (key === undefined) return
  try {
    window.localStorage.setItem(
      key,
      JSON.stringify(STATUS_BAR_ITEMS.filter((item) => hidden.has(item)))
    )
  } catch {
    // Not remembered: the next visit shows every tool.
  }
}

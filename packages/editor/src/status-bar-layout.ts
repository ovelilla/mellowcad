/**
 * Which tools the status bar shows: its Customization menu, AutoCAD's
 * right-most button ("Specifies what command buttons to display on the status
 * bar"). AutoCAD keeps the choice in the user's profile, not in the drawing,
 * so here it is this device's, like the palettes' places
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
  "dynamicUcs",
  "units",
  "cleanScreen",
] as const

export type StatusBarItem = (typeof STATUS_BAR_ITEMS)[number]

/**
 * What AutoCAD's bar leaves out until the user shows it: Dynamic UCS ("not
 * displayed by default on the status bar", To Align the UCS Dynamically
 * With a 3D Solid).
 */
const HIDDEN_AT_FIRST: readonly StatusBarItem[] = ["dynamicUcs"]

/**
 * The tools hidden in `stored`, the remembered JSON: the hidden ones by
 * name, and one AutoCAD hides at first written `+name` once shown, so a
 * device that remembered its bar before that tool came keeps it hidden.
 * Everything else shows until the user hides it: the coordinates too
 * (COORDS 1, `docs/coverage/drafting-aids.md`).
 */
export function parseHiddenStatusItems(
  stored: string | null
): ReadonlySet<StatusBarItem> {
  try {
    const parsed: unknown = JSON.parse(stored ?? "null")
    if (!Array.isArray(parsed)) return new Set(HIDDEN_AT_FIRST)
    return new Set(
      STATUS_BAR_ITEMS.filter(
        (item) =>
          parsed.includes(item) ||
          (HIDDEN_AT_FIRST.includes(item) && !parsed.includes(`+${item}`))
      )
    )
  } catch {
    return new Set(HIDDEN_AT_FIRST)
  }
}

/** What this device remembers, or the first bar when storage is blocked. */
export function readHiddenStatusItems(
  key: string | undefined
): ReadonlySet<StatusBarItem> {
  if (key === undefined) return new Set(HIDDEN_AT_FIRST)
  try {
    return parseHiddenStatusItems(window.localStorage.getItem(key))
  } catch {
    return new Set(HIDDEN_AT_FIRST)
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
      JSON.stringify([
        ...STATUS_BAR_ITEMS.filter((item) => hidden.has(item)),
        ...HIDDEN_AT_FIRST.filter((item) => !hidden.has(item)).map(
          (item) => `+${item}`
        ),
      ])
    )
  } catch {
    // Not remembered: the next visit shows the first bar.
  }
}

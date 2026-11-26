/**
 * Which categories of the Properties palette are folded. AutoCAD keeps them
 * in the user's profile, per object class and category (Profile.aws's
 * `PROP_STATE`: `<OBJECT NAME="{class}"><CATEGORY NAME="General-12"
 * STATE="0"/>`, a `ZeroSelect` object for no selection), so a category folded
 * on a line stays open on a circle and stays folded in the next session.
 * Here it is this device's, like the palettes' places (`palette-layout.ts`),
 * under the host's key (`layoutStorage.properties`; with none, it lasts as
 * long as the palette). A fold changes no zone's size, so it is read after
 * mount.
 */

/** What the palette shows a fold for: an object type, or these two. */
export const NO_SELECTION = "none"
/** A set of several types under All, which AutoCAD files apart too. */
export const MIXED_SELECTION = "*"

/** The folded categories of each object type: `{ line: ["general"] }`. */
export type PropertiesFold = Readonly<Record<string, readonly string[]>>

/** `stored`, the remembered JSON, or nothing folded where it is not one. */
export function parsePropertiesFold(stored: string | null): PropertiesFold {
  try {
    const parsed: unknown = JSON.parse(stored ?? "null")
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed))
      return {}
    const fold: Record<string, readonly string[]> = {}
    for (const [type, categories] of Object.entries(parsed)) {
      if (!Array.isArray(categories)) continue
      const kept = categories.filter(
        (category): category is string => typeof category === "string"
      )
      if (kept.length > 0) fold[type] = [...new Set(kept)]
    }
    return fold
  } catch {
    return {}
  }
}

export function isFolded(
  fold: PropertiesFold,
  type: string,
  category: string
): boolean {
  return fold[type]?.includes(category) ?? false
}

/** `fold` with `category` of `type` folded or open; every category starts open. */
export function withFold(
  fold: PropertiesFold,
  type: string,
  category: string,
  folded: boolean
): PropertiesFold {
  const rest = (fold[type] ?? []).filter((each) => each !== category)
  const next = folded ? [...rest, category] : rest
  const others = Object.fromEntries(
    Object.entries(fold).filter(([each]) => each !== type)
  )
  return next.length > 0 ? { ...others, [type]: next } : others
}

/** What this device remembers, or nothing folded when storage is blocked. */
export function readPropertiesFold(key: string | undefined): PropertiesFold {
  if (key === undefined) return {}
  try {
    return parsePropertiesFold(window.localStorage.getItem(key))
  } catch {
    return {}
  }
}

export function rememberPropertiesFold(
  key: string | undefined,
  fold: PropertiesFold
): void {
  if (key === undefined) return
  try {
    window.localStorage.setItem(key, JSON.stringify(fold))
  } catch {
    // Not remembered: the next visit opens every category.
  }
}

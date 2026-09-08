/**
 * AutoCAD's wild-card name matching, as the Blocks palette's Filter documents
 * it: "`?` for a single character and `*` for multiple characters".
 * Case-insensitive, and an empty pattern matches everything.
 */
export function matchesWildcard(name: string, pattern: string): boolean {
  const trimmed = pattern.trim()
  if (trimmed.length === 0) return true
  const escaped = trimmed.replace(/[.+^${}()|[\]\\]/g, "\\$&")
  const expression = escaped.replace(/\*/g, ".*").replace(/\?/g, ".")
  return new RegExp(`^${expression}$`, "i").test(name)
}

/**
 * `next`, with every part equal by value to the same part of `previous`
 * replaced by that part — `previous` itself when nothing differs. A snapshot
 * rebuilt from scratch on each change then keeps the identity of whatever the
 * change did not touch, so a subscriber can tell what moved with `===`.
 *
 * Plain objects and arrays are compared member by member; anything else (a
 * class instance, a function) only by identity.
 */
export function shareStructure<T>(previous: T, next: T): T {
  if (Object.is(previous, next)) return previous
  if (Array.isArray(previous) && Array.isArray(next)) {
    return shareArray(previous, next) as T
  }
  if (isPlainObject(previous) && isPlainObject(next)) {
    return shareObject(previous, next) as T
  }
  return next
}

function shareArray(previous: unknown[], next: unknown[]): unknown[] {
  let same = previous.length === next.length
  const shared = next.map((item, i) => {
    const kept = shareStructure(previous[i], item)
    if (kept !== previous[i]) same = false
    return kept
  })
  return same ? previous : shared
}

function shareObject(
  previous: Record<string, unknown>,
  next: Record<string, unknown>
): Record<string, unknown> {
  const keys = Object.keys(next)
  let same = keys.length === Object.keys(previous).length
  const shared: Record<string, unknown> = {}
  for (const key of keys) {
    const kept = Object.hasOwn(previous, key)
      ? shareStructure(previous[key], next[key])
      : next[key]
    if (kept !== previous[key] || !Object.hasOwn(previous, key)) same = false
    shared[key] = kept
  }
  return same ? previous : shared
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null) return false
  const proto = Object.getPrototypeOf(value)
  return proto === Object.prototype || proto === null
}

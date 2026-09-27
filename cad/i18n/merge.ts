import type { DeepPartial } from "./types"

function isTree(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

/**
 * `base` with every key `override` provides replaced, recursively: a language
 * that leaves a message out shows English for that message and nothing else.
 * Arrays are leaves (a compiled message, a list of names), replaced whole.
 */
export function mergeCatalog<T>(
  base: T,
  override: DeepPartial<T> | undefined
): T {
  if (override === undefined) return base
  if (!isTree(base) || !isTree(override)) return override as T
  const merged: Record<string, unknown> = { ...base }
  for (const [key, value] of Object.entries(override)) {
    if (value === undefined) continue
    merged[key] = mergeCatalog(merged[key], value as DeepPartial<unknown>)
  }
  return merged as T
}

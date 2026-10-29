import type { DeepPartial, EditorLocale, EditorMessages } from "./types"

type Tree = { readonly [key: string]: unknown }

function isTree(value: unknown): value is Tree {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

/**
 * `base` with every message `override` provides replaced, recursively: a
 * language that leaves one out shows English for that one and nothing else.
 * A compiled message with arguments is an array, replaced whole.
 */
export function mergeMessages<T>(base: T, override: DeepPartial<T>): T {
  if (!isTree(base) || !isTree(override)) return override as T
  const merged: Record<string, unknown> = { ...base }
  for (const [key, value] of Object.entries(override)) {
    if (value === undefined) continue
    merged[key] = mergeMessages(merged[key], value as DeepPartial<unknown>)
  }
  return merged as T
}

/**
 * `base` with the host's own words laid over it, key by key: each message
 * given replaces the base's and everything else is kept. A message is a
 * compiled one (`icu-minify/compile`, in the host's build); a string without
 * arguments already is one.
 */
export function extendEditorLocale(
  base: EditorLocale,
  messages: DeepPartial<EditorMessages>
): EditorLocale {
  return { tag: base.tag, messages: mergeMessages(base.messages, messages) }
}

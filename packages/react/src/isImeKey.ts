import type { KeyboardEvent } from "react"

/**
 * Whether a key belongs to an input method's composition (Japanese, Chinese,
 * Korean): its Enter confirms a conversion and its Escape drops it, so a field
 * that answers Enter or Escape must leave it to the IME. WHY `keyCode` 229
 * too: Safari sends the Enter that ends a composition after
 * `compositionend`, with `isComposing` false and that code alone to tell it.
 */
export function isImeKey(event: KeyboardEvent): boolean {
  return event.nativeEvent.isComposing || event.keyCode === IME_KEY_CODE
}

/** The `keyCode` of every key an IME processes (`Process` in `key`). */
const IME_KEY_CODE = 229

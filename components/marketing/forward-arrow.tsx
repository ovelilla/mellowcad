/**
 * The calls to action's arrow. It points the way the page reads, so it mirrors
 * in a right-to-left page: U+2192 is not a bidi-mirrored character, and an
 * Arabic "Start drawing" would otherwise point backwards. The glyph stays the
 * text's own, so English draws exactly what it always did.
 */
export function ForwardArrow() {
  return <span className="inline-block rtl:-scale-x-100">→</span>
}

import { snapGlyph } from "@/lib/plot"

import { Glyph } from "./glyph"

/**
 * Endpoint markers on a card's four corners, shown only while the card is
 * hovered or focused (the parent carries `snap-card`): feedback, as in the
 * editor, never decoration.
 */
export async function SnapCorners() {
  const endpoint = await snapGlyph("endpoint")
  return (
    <span aria-hidden="true" className="snap-corners">
      <Glyph glyph={endpoint} />
      <Glyph glyph={endpoint} />
      <Glyph glyph={endpoint} />
      <Glyph glyph={endpoint} />
    </span>
  )
}

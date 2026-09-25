import { arrowheadGlyph } from "@/lib/plot"

import { Glyph } from "./glyph"

/**
 * A section separator drawn as a dimension line: the engine's own filled
 * arrowheads at both ends, the label centred on the line like a dimension's
 * text. Decorative — the section's heading carries the same words.
 */
export async function DimensionDivider({ label }: { label: string }) {
  const arrow = await arrowheadGlyph()
  return (
    <div aria-hidden="true" className="dim-line label-mono">
      <Glyph glyph={arrow} className="h-[3.33px] w-[10px]" />
      <span className="rule" />
      <span className="label">{label}</span>
      <span className="rule" />
      <Glyph glyph={arrow} className="h-[3.33px] w-[10px] rotate-180" />
    </div>
  )
}

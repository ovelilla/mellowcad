import type { Glyph as GlyphData } from "@/lib/plot"

/** An engine-drawn glyph (a snap marker, an arrowhead) as inline SVG. */
export function Glyph({
  glyph,
  className,
}: {
  glyph: GlyphData
  className?: string
}) {
  return (
    <svg
      viewBox={glyph.viewBox}
      direction="ltr"
      aria-hidden="true"
      className={className}
      dangerouslySetInnerHTML={{ __html: glyph.markup }}
    />
  )
}

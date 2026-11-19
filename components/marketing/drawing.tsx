import { cn } from "@/lib/utils"

function escape(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

/**
 * An engine-drawn figure: the SVG elements built at render time, wrapped as a
 * labelled image. `markup` comes from the SVG presenter, never from input.
 */
export function Drawing({
  markup,
  width,
  height,
  title,
  description,
  className,
}: {
  markup: string
  width: number
  height: number
  title: string
  description?: string
  className?: string
}) {
  return (
    // A drawing never mirrors: marketing.css keeps an SVG left to right on a
    // right-to-left page, and the engine anchors each text so.
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      className={cn("block h-auto w-full", className)}
      dangerouslySetInnerHTML={{
        __html:
          `<title>${escape(title)}</title>` +
          (description ? `<desc>${escape(description)}</desc>` : "") +
          markup,
      }}
    />
  )
}

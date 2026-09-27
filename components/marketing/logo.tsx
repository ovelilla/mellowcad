import { MARK_MARKER, MARK_PATH, MARK_STROKE, MARK_VIEWBOX } from "@/lib/brand"
import { SITE_NAME } from "@/lib/site"
import { cn } from "@/lib/utils"

/**
 * The mark: a lowercase "m" drawn as one polyline — two arc segments, a PLINE's
 * bulges — ending on an endpoint marker. It works in one colour too: the
 * marker takes the stroke's colour when `mono` is set.
 */
export function LogoMark({
  className,
  mono = false,
}: {
  className?: string
  mono?: boolean
}) {
  return (
    <svg
      viewBox={MARK_VIEWBOX}
      aria-hidden="true"
      className={cn("shrink-0", className)}
      fill="none"
    >
      <path
        d={MARK_PATH}
        stroke="currentColor"
        strokeWidth={MARK_STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x={MARK_MARKER.x}
        y={MARK_MARKER.y}
        width={MARK_MARKER.size}
        height={MARK_MARKER.size}
        className={mono ? undefined : "text-precision"}
        stroke="currentColor"
        strokeWidth={MARK_MARKER.stroke}
      />
    </svg>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark className="size-6" />
      <span className="text-[1.0625rem] font-semibold tracking-[-0.02em]">
        {SITE_NAME}
      </span>
    </span>
  )
}

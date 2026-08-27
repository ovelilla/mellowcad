"use client"

import { LINEWEIGHTS, LINEWEIGHT_BYLAYER, lineweightLabel } from "@/cad"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

/**
 * A compact lineweight picker with an inline thickness preview, shared by the
 * layer manager (a layer's default lineweight) and the properties palette (a
 * selection's ByObject override). When `includeByLayer` is set it offers a
 * leading "ByLayer" option, matching AutoCAD's per-object lineweight control.
 *
 * Values travel as strings because that is what the select works with; the
 * millimetre number is parsed back on change.
 */
export function LineweightSelect({
  value,
  onValueChange,
  includeByLayer = false,
  ariaLabel,
  className,
}: {
  value: number | "ByLayer" | null
  onValueChange: (value: number | "ByLayer") => void
  includeByLayer?: boolean
  ariaLabel: string
  className?: string
}) {
  return (
    <Select
      value={value === null ? undefined : String(value)}
      onValueChange={(next) => {
        if (next == null) return
        onValueChange(
          next === LINEWEIGHT_BYLAYER ? LINEWEIGHT_BYLAYER : Number(next)
        )
      }}
    >
      <SelectTrigger size="sm" aria-label={ariaLabel} className={className}>
        <SelectValue placeholder="Varies" />
      </SelectTrigger>
      <SelectContent>
        {includeByLayer && (
          <SelectItem value={LINEWEIGHT_BYLAYER} className="text-[11px]">
            <LineweightPreview millimetres={0} />
            ByLayer
          </SelectItem>
        )}
        {LINEWEIGHTS.map((lineweight) => (
          <SelectItem
            key={lineweight}
            value={String(lineweight)}
            className="text-[11px]"
          >
            <LineweightPreview millimetres={lineweight} />
            {lineweightLabel(lineweight)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

/** A tiny horizontal line drawn at the lineweight's relative thickness. */
function LineweightPreview({ millimetres }: { millimetres: number }) {
  // Same proportion the canvas uses (96 dpi), floored so 0.00 mm stays visible.
  const width = Math.max(1, millimetres * (96 / 25.4))
  return (
    <svg
      width={28}
      height={10}
      viewBox="0 0 28 10"
      aria-hidden
      className="shrink-0"
    >
      <line
        x1={1}
        y1={5}
        x2={27}
        y2={5}
        stroke="currentColor"
        strokeWidth={width}
        strokeLinecap="butt"
      />
    </svg>
  )
}

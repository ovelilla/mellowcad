"use client"

import {
  LINEWEIGHTS,
  LINEWEIGHT_BYLAYER,
  lineweightLabel,
  lineweightPixels,
  type EngineNames,
} from "@mellowcad/engine"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useEditorText } from "./editor-text"

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
  names,
  onValueChange,
  includeByLayer = false,
  ariaLabel,
  className,
  disabled = false,
  below = false,
}: {
  value: number | "ByLayer" | null
  /** The engine's name for ByLayer. */
  names: EngineNames
  onValueChange: (value: number | "ByLayer") => void
  includeByLayer?: boolean
  ariaLabel: string
  className?: string
  /** Unavailable: shown, but nothing to act on. */
  disabled?: boolean
  /**
   * Opens below the trigger, as a bar's drop-down does, instead of over it as
   * a palette's field does.
   */
  below?: boolean
}) {
  const t = useEditorText("Properties")
  return (
    <Select
      // The closed trigger shows what the list does — ByLayer in the page's
      // language, `0.50 mm` — not the raw value.
      items={{
        [LINEWEIGHT_BYLAYER]: names.byLayer,
        ...Object.fromEntries(
          LINEWEIGHTS.map((lineweight) => [
            String(lineweight),
            lineweightLabel(lineweight),
          ])
        ),
      }}
      disabled={disabled}
      value={value === null ? null : String(value)}
      onValueChange={(next) => {
        if (next == null) return
        onValueChange(
          next === LINEWEIGHT_BYLAYER ? LINEWEIGHT_BYLAYER : Number(next)
        )
      }}
    >
      <SelectTrigger aria-label={ariaLabel} className={className}>
        <SelectValue placeholder={t("varies")} />
      </SelectTrigger>
      <SelectContent
        align={below ? "start" : undefined}
        alignItemWithTrigger={!below}
      >
        {includeByLayer && (
          <SelectItem value={LINEWEIGHT_BYLAYER}>
            <LineweightPreview millimetres={0} />
            {names.byLayer}
          </SelectItem>
        )}
        {LINEWEIGHTS.map((lineweight) => (
          <SelectItem key={lineweight} value={String(lineweight)}>
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
  // The canvas's width, floored at a pixel so 0.00 mm stays visible.
  const width = lineweightPixels(millimetres, 1)
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

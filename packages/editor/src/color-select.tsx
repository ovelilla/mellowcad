"use client"

import type { ReactElement } from "react"
import { Palette } from "lucide-react"

import {
  COLOR_BYLAYER,
  colorLabel,
  colorRgb,
  STANDARD_COLORS,
  type EngineNames,
} from "@mellowcad/engine"
import { cn } from "./utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  type SelectFinalFocus,
} from "./ui/select"
import { useEditorText } from "./editor-text"

/**
 * A colour picker for the properties palette: AutoCAD's index colours as quick
 * choices, a leading "ByLayer" option, and a swatch that opens the native
 * colour dialog for anything else (standing in for AutoCAD's "Select Color…").
 */
export function ColorSelect({
  value,
  names,
  onValueChange,
  ariaLabel,
  className,
  triggerClassName,
  disabled = false,
  below = false,
  ribbon = false,
  finalFocus,
}: {
  value: string | null
  /** The engine's names for the colours and for ByLayer. */
  names: EngineNames
  onValueChange: (value: string) => void
  ariaLabel: string
  className?: string
  triggerClassName?: string
  /** Unavailable: shown, but nothing to act on. */
  disabled?: boolean
  /**
   * Opens below the trigger, as a bar's drop-down does, instead of over it as
   * a palette's field does; and names a colour as the ribbon's list does
   * (`30`), not as the palette (`Color 30`).
   */
  below?: boolean
  /**
   * The ribbon's Object Color: its picker in the 20 px icon's place before
   * the list, 22 high (docs/plans/autocad-ui.md, §2.3).
   */
  ribbon?: boolean
  /** Where focus goes once the list has closed; the trigger, when omitted. */
  finalFocus?: SelectFinalFocus
}): ReactElement {
  const t = useEditorText("Properties")
  const place = below ? "bar" : "palette"
  const isStandard = STANDARD_COLORS.some((color) => color.value === value)
  const custom = value && value !== COLOR_BYLAYER && !isStandard ? value : null
  // Lets the closed trigger show "Red" or "Color 30", not the stored value.
  const labels: Record<string, string> = Object.fromEntries(
    [COLOR_BYLAYER, ...STANDARD_COLORS.map((color) => color.value)]
      .concat(custom ? [custom] : [])
      .map((color) => [color, colorLabel(color, names, place)])
  )

  const picker = (
    <label
      aria-disabled={disabled || undefined}
      className={cn(
        "relative inline-flex shrink-0 cursor-pointer items-center justify-center hover:bg-accent aria-disabled:pointer-events-none aria-disabled:opacity-50",
        ribbon
          ? "h-5.5 w-5 rounded-sm"
          : "size-7 rounded-md border border-border"
      )}
      title={t("customColor")}
    >
      <Palette className="size-4 text-muted-foreground" />
      <input
        type="color"
        disabled={disabled}
        aria-label={t("customColor")}
        value={custom ? colorRgb(custom) : "#ffffff"}
        onChange={(event) => onValueChange(event.target.value)}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      />
    </label>
  )

  return (
    <div
      className={cn("flex items-center", ribbon ? "gap-0" : "gap-1", className)}
    >
      {ribbon && picker}
      <Select
        items={labels}
        disabled={disabled}
        value={value}
        onValueChange={(next) => {
          if (next != null) onValueChange(next)
        }}
      >
        <SelectTrigger
          aria-label={ariaLabel}
          className={cn(
            "min-w-0 flex-1 bg-background dark:bg-background",
            triggerClassName
          )}
        >
          <SelectValue placeholder={t("varies")} />
        </SelectTrigger>
        <SelectContent
          align={below ? "start" : undefined}
          alignItemWithTrigger={!below}
          finalFocus={finalFocus}
        >
          <SelectItem value={COLOR_BYLAYER}>
            <Swatch color={null} />
            {names.byLayer}
          </SelectItem>
          {STANDARD_COLORS.map((color) => (
            <SelectItem key={color.value} value={color.value}>
              <Swatch color={color.value} />
              {names.colors[color.id]}
            </SelectItem>
          ))}
          {custom && (
            <SelectItem value={custom}>
              <Swatch color={custom} />
              {labels[custom]}
            </SelectItem>
          )}
        </SelectContent>
      </Select>

      {!ribbon && picker}
    </div>
  )
}

/** The colour chip shown in the list; a hollow square stands for ByLayer. */
function Swatch({ color }: { color: string | null }) {
  return (
    <span
      aria-hidden
      className="size-3 shrink-0 rounded-[2px] border border-border/80"
      style={color ? { backgroundColor: colorRgb(color) } : undefined}
    />
  )
}

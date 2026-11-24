"use client"

import { useRef, type ReactElement } from "react"
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
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  type SelectFinalFocus,
} from "./ui/select"
import { useEditorText } from "./editor-text"

/** The list's last row, which is no colour: it opens the picker. */
const MORE = "more-colors"

/**
 * A colour list for the Properties palette and the ribbon's Object Color:
 * ByLayer, AutoCAD's index colours as quick choices, and last a row that
 * opens the browser's colour picker for any other, standing in for
 * AutoCAD's Select Color dialog (the ribbon's row `More Colors...`, the
 * palette's `Select Color...`: docs/coverage/properties.md).
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
   * The ribbon's Object Color: a 20 px icon before the list, which is no
   * target, 22 high, and its last row worded as the ribbon's
   * (docs/plans/autocad-ui.md, §2.3; research/ui/2026-11-24/block4).
   */
  ribbon?: boolean
  /** Where focus goes once the list has closed; the trigger, when omitted. */
  finalFocus?: SelectFinalFocus
}): ReactElement {
  const t = useEditorText("Properties")
  const ribbonText = useEditorText("Ribbon")
  const picker = useRef<HTMLInputElement>(null)
  const place = below ? "bar" : "palette"
  const isStandard = STANDARD_COLORS.some((color) => color.value === value)
  const custom = value && value !== COLOR_BYLAYER && !isStandard ? value : null
  // Lets the closed trigger show "Red" or "Color 30", not the stored value.
  const labels: Record<string, string> = Object.fromEntries(
    [COLOR_BYLAYER, ...STANDARD_COLORS.map((color) => color.value)]
      .concat(custom ? [custom] : [])
      .map((color) => [color, colorLabel(color, names, place)])
  )

  // WHY a hidden field: only `<input type="color">` opens the browser's
  // picker; the row asks it to (`showPicker`, in the pick's click), placed
  // over the trigger so the picker opens beside the list.
  const field = (
    <input
      ref={picker}
      type="color"
      tabIndex={-1}
      aria-hidden
      disabled={disabled}
      value={custom ? colorRgb(custom) : "#ffffff"}
      onChange={(event) => onValueChange(event.target.value)}
      className="pointer-events-none absolute inset-0 size-full opacity-0"
    />
  )
  const openPicker = () => {
    const input = picker.current
    if (!input) return
    if (typeof input.showPicker === "function") input.showPicker()
    else input.click()
  }

  return (
    <div className={cn("relative flex items-center", className)}>
      {ribbon && (
        <span
          aria-hidden
          className="flex w-5 shrink-0 justify-center text-muted-foreground"
        >
          <Palette className="size-4" />
        </span>
      )}
      {field}
      <Select
        items={labels}
        disabled={disabled}
        value={value}
        onValueChange={(next) => {
          if (next === MORE) openPicker()
          else if (next != null) onValueChange(next)
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
          <SelectSeparator />
          <SelectItem value={MORE}>
            <Palette aria-hidden className="size-3 shrink-0" />
            {ribbon ? ribbonText("moreColors") : t("selectColor")}
          </SelectItem>
        </SelectContent>
      </Select>
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

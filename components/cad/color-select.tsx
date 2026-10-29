"use client"

import { Palette } from "lucide-react"
import { useTranslations } from "next-intl"

import {
  COLOR_BYLAYER,
  normalizeColor,
  STANDARD_COLORS,
  type EngineNames,
} from "@mellowcad/engine"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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
   * a palette's field does.
   */
  below?: boolean
}) {
  const t = useTranslations("Editor.Properties")
  const isStandard = STANDARD_COLORS.some((color) => color.value === value)
  const custom = value && value !== COLOR_BYLAYER && !isStandard ? value : null
  // Lets the closed trigger show "Red" rather than the raw hex value.
  const labels: Record<string, string> = {
    [COLOR_BYLAYER]: names.byLayer,
    ...Object.fromEntries(
      STANDARD_COLORS.map((color) => [color.value, names.colors[color.id]])
    ),
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
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
              {custom}
            </SelectItem>
          )}
        </SelectContent>
      </Select>

      <label
        aria-disabled={disabled || undefined}
        className={cn(
          "relative inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md border border-border hover:bg-accent aria-disabled:pointer-events-none aria-disabled:opacity-50"
        )}
        title={t("customColor")}
      >
        <Palette className="size-4 text-muted-foreground" />
        <input
          type="color"
          disabled={disabled}
          aria-label={t("customColor")}
          value={normalizeColor(custom ?? "") ?? "#ffffff"}
          onChange={(event) => onValueChange(event.target.value)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </label>
    </div>
  )
}

/** The colour chip shown in the list; a hollow square stands for ByLayer. */
function Swatch({ color }: { color: string | null }) {
  return (
    <span
      aria-hidden
      className="size-3 shrink-0 rounded-[2px] border border-border/80"
      style={color ? { backgroundColor: color } : undefined}
    />
  )
}

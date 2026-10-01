"use client"

import { useTranslations } from "next-intl"

import { LINETYPES, LINETYPE_BYLAYER, type EngineNames } from "@/cad"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

/**
 * A compact linetype picker with an inline dash preview, shared by the layer
 * manager (a layer's default linetype) and the properties palette (a
 * selection's ByObject override). When `includeByLayer` is set it offers a
 * leading "ByLayer" option, matching AutoCAD's per-object linetype control.
 */
export function LinetypeSelect({
  value,
  names,
  onValueChange,
  includeByLayer = false,
  ariaLabel,
  className,
  disabled = false,
  below = false,
  size = "sm",
}: {
  value: string | null
  /** The engine's names for the linetypes and for ByLayer. */
  names: EngineNames
  onValueChange: (value: string) => void
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
  /**
   * `xs` is a palette's row (28 px), `sm` a bar's drop-down (32 px).
   */
  size?: "xs" | "sm"
}) {
  const t = useTranslations("Editor.Properties")
  // The closed trigger shows what the list shows (`Dash dot`, not the id
  // `DashDot`), and ByLayer in the page's language.
  const items = {
    [LINETYPE_BYLAYER]: names.byLayer,
    ...Object.fromEntries(
      LINETYPES.map((linetype) => [
        linetype.id,
        linetypeLabel(names, linetype.id),
      ])
    ),
  }
  return (
    <Select
      items={items}
      disabled={disabled}
      value={value}
      onValueChange={(next) => {
        if (next != null) onValueChange(next)
      }}
    >
      <SelectTrigger size={size} aria-label={ariaLabel} className={className}>
        <SelectValue placeholder={t("varies")} />
      </SelectTrigger>
      <SelectContent
        align={below ? "start" : undefined}
        alignItemWithTrigger={!below}
      >
        {includeByLayer && (
          <SelectItem value={LINETYPE_BYLAYER}>
            <LinetypePreview pattern={[]} />
            {names.byLayer}
          </SelectItem>
        )}
        {LINETYPES.map((linetype) => (
          <SelectItem key={linetype.id} value={linetype.id}>
            <LinetypePreview pattern={linetype.pattern} />
            {linetypeLabel(names, linetype.id)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

/** A linetype's display name; one the catalog does not name shows its id. */
function linetypeLabel(names: EngineNames, id: string): string {
  return names.linetypes[id] ?? id
}

/** A tiny horizontal line rendered with the linetype's dash pattern. */
function LinetypePreview({ pattern }: { pattern: readonly number[] }) {
  return (
    <svg
      width={40}
      height={8}
      viewBox="0 0 40 8"
      aria-hidden
      className="shrink-0"
    >
      <line
        x1={1}
        y1={4}
        x2={39}
        y2={4}
        stroke="currentColor"
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeDasharray={pattern.length > 0 ? pattern.join(" ") : undefined}
      />
    </svg>
  )
}

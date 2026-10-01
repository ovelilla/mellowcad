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
}: {
  value: string | null
  /** The engine's names for the linetypes and for ByLayer. */
  names: EngineNames
  onValueChange: (value: string) => void
  includeByLayer?: boolean
  ariaLabel: string
  className?: string
}) {
  const t = useTranslations("Editor.Properties")
  return (
    <Select
      // The closed trigger names ByLayer in the page's language, not by its
      // id; a linetype's name is the drawing's data, shown as it is.
      items={{ [LINETYPE_BYLAYER]: names.byLayer }}
      value={value ?? undefined}
      onValueChange={(next) => {
        if (next != null) onValueChange(next)
      }}
    >
      <SelectTrigger size="sm" aria-label={ariaLabel} className={className}>
        <SelectValue placeholder={t("varies")} />
      </SelectTrigger>
      <SelectContent>
        {includeByLayer && (
          <SelectItem value={LINETYPE_BYLAYER} className="text-[11px]">
            <LinetypePreview pattern={[]} />
            {names.byLayer}
          </SelectItem>
        )}
        {LINETYPES.map((linetype) => (
          <SelectItem
            key={linetype.id}
            value={linetype.id}
            className="text-[11px]"
          >
            <LinetypePreview pattern={linetype.pattern} />
            {names.linetypes[linetype.id] ?? linetype.id}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
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

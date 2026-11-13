"use client"

import type { ReactElement } from "react"
import {
  LINETYPE_BYLAYER,
  linetypeDashes,
  type EngineNames,
  type Linetype,
} from "@mellowcad/engine"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import { useEditorText } from "./editor-text"

/**
 * A compact linetype picker with an inline dash preview, shared by the layer
 * manager (a layer's default linetype) and the properties palette (a
 * selection's ByObject override). It offers the drawing's linetypes
 * (`state.linetypes`), each by its name, the drawing's data. When
 * `includeByLayer` is set it offers a leading "ByLayer" option, matching
 * AutoCAD's per-object linetype control.
 */
export function LinetypeSelect({
  value,
  names,
  linetypes,
  onValueChange,
  includeByLayer = false,
  ariaLabel,
  className,
  disabled = false,
  below = false,
}: {
  value: string | null
  /** The engine's names, for ByLayer. */
  names: EngineNames
  /** The drawing's linetypes, in the order to offer them. */
  linetypes: readonly Linetype[]
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
}): ReactElement {
  const t = useEditorText("Properties")
  // The closed trigger shows ByLayer in the page's language, a linetype by
  // its name.
  const items = {
    [LINETYPE_BYLAYER]: names.byLayer,
    ...Object.fromEntries(linetypes.map(({ name }) => [name, name])),
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
      <SelectTrigger aria-label={ariaLabel} className={className}>
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
        {linetypes.map((linetype) => (
          <SelectItem key={linetype.name} value={linetype.name}>
            <LinetypePreview pattern={linetypeDashes(linetype.pattern)} />
            {linetype.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

/**
 * The sample's scale: acadiso.lin's periods run to 63.5 mm, and at half size
 * PHANTOM's still shows whole in the 38 px sample.
 */
const PREVIEW_SCALE = 0.5

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
        strokeDasharray={
          pattern.length > 0
            ? pattern.map((run) => run * PREVIEW_SCALE).join(" ")
            : undefined
        }
      />
    </svg>
  )
}

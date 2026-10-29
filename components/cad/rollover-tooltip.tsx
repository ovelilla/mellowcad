"use client"

import type { EditorState } from "@/hooks/useCadEngine"
import { useEditorText } from "./editor-text"

/**
 * AutoCAD's rollover tooltip (ROLLOVERTIPS 1): hovering an object at
 * `Command:` names its type and its Color, Layer and Linetype, below and to
 * the right of where the cursor came over it (desktop d20). It shows after a
 * moment, as AutoCAD's does, and only reads: the engine words every value.
 */
export function RolloverTooltip({ state }: { state: EditorState }) {
  const t = useEditorText("Properties")
  const rollover = state.rollover
  if (!rollover) return null
  return (
    <div
      key={rollover.id}
      role="tooltip"
      className="pointer-events-none absolute z-[5] grid grid-cols-[auto_auto] gap-x-4 rounded-md border bg-popover/95 p-2 text-popover-foreground shadow-md transition-opacity delay-500 starting:opacity-0"
      style={{ left: rollover.at.x + 21, top: rollover.at.y + 27 }}
    >
      <div className="col-span-2 pb-1 text-title text-foreground">
        {rollover.title}
      </div>
      <span className="text-muted-foreground">{t("color")}</span>
      <span className="flex items-center gap-1.5">
        <span
          aria-hidden
          className="size-3 shrink-0 rounded-[2px] border border-border/80"
          style={{ backgroundColor: rollover.swatch }}
        />
        {rollover.color}
      </span>
      <span className="text-muted-foreground">{t("layer")}</span>
      <span>{rollover.layer}</span>
      <span className="text-muted-foreground">{t("linetype")}</span>
      <span>{rollover.linetype}</span>
    </div>
  )
}

"use client"

import { useTranslations } from "next-intl"

import { EngineState } from "@/cad"

/**
 * The passive coordinate/zoom readout, pinned to the bottom-left corner like a
 * classic CAD status readout. Purely informational — no interaction — which is
 * why it is deliberately separated from the interactive aid toggles.
 */
export function CoordinateReadout({ state }: { state: EngineState }) {
  const t = useTranslations("Editor.Coordinates")
  const cursor = state.cursorUcs
  return (
    <div className="pointer-events-auto flex h-10 items-center gap-3 rounded-lg bg-card/90 px-3 font-mono text-[11px] text-muted-foreground backdrop-blur">
      <span className="flex items-center">
        <span>{t("x")}</span>
        <span className="inline-block min-w-14 text-right text-foreground tabular-nums">
          {cursor ? cursor.x.toFixed(3) : "—"}
        </span>
      </span>
      <span className="flex items-center">
        <span>{t("y")}</span>
        <span className="inline-block min-w-14 text-right text-foreground tabular-nums">
          {cursor ? cursor.y.toFixed(3) : "—"}
        </span>
      </span>
      <span className="inline-block min-w-12 text-right text-foreground tabular-nums">
        {state.scale.toFixed(2)}×
      </span>
    </div>
  )
}

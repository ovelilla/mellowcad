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
  // Coordinates are technical values: X, Y and Z read left to right in
  // every locale, like the command line.
  return (
    <div
      dir="ltr"
      className="pointer-events-auto flex items-center gap-3 px-2 font-mono text-[11px] text-muted-foreground"
    >
      <span className="flex items-center">
        <span>{t("x")}</span>
        <span className="inline-block min-w-14 text-end text-foreground tabular-nums">
          {cursor ? cursor.x.toFixed(state.documentPrecision) : "—"}
        </span>
      </span>
      <span className="flex items-center">
        <span>{t("y")}</span>
        <span className="inline-block min-w-14 text-end text-foreground tabular-nums">
          {cursor ? cursor.y.toFixed(state.documentPrecision) : "—"}
        </span>
      </span>
      <span className="flex items-center">
        <span>{t("z")}</span>
        <span className="inline-block min-w-14 text-end text-foreground tabular-nums">
          {cursor ? cursor.z.toFixed(state.documentPrecision) : "—"}
        </span>
      </span>
      <span className="inline-block min-w-12 text-end text-foreground tabular-nums">
        {state.scale.toFixed(2)}×
      </span>
    </div>
  )
}

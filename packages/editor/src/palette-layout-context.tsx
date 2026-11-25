"use client"

import { createContext, useContext, type Provider } from "react"

import { PALETTE_LAYOUT, type PaletteLayout } from "./palette-layout"

/** The palettes' places on this device, and the way to change them. */
export interface PaletteLayoutControl {
  readonly layout: PaletteLayout
  /**
   * Takes the new layout; `remember` keeps it under the host's key, once a
   * gesture ends (a drag's moves only show).
   */
  readonly setLayout: (layout: PaletteLayout, remember?: boolean) => void
}

const PaletteLayoutContext = createContext<PaletteLayoutControl>({
  layout: PALETTE_LAYOUT,
  setLayout: () => {},
})

/**
 * Hands the palettes the device's layout. WHY a context and not the
 * engine's state: AutoCAD keeps where a palette is in the profile, not in the
 * drawing nor the session, and a docked column's width must be known before
 * the engine exists (palette-layout.ts).
 */
export const PaletteLayoutProvider: Provider<PaletteLayoutControl> =
  PaletteLayoutContext.Provider

export function usePaletteLayout(): PaletteLayoutControl {
  return useContext(PaletteLayoutContext)
}

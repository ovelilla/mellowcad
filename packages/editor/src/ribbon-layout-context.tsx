"use client"

import { createContext, useContext, type Provider } from "react"

import { RIBBON_LAYOUT, type RibbonLayout } from "./ribbon-layout"

/** The ribbon's minimize state on this device, and the way to change it. */
export interface RibbonLayoutControl {
  readonly layout: RibbonLayout
  /** Takes the new layout and keeps it, under the host's key if it gave one. */
  readonly setLayout: (layout: RibbonLayout) => void
}

const RibbonLayoutContext = createContext<RibbonLayoutControl>({
  layout: RIBBON_LAYOUT,
  setLayout: () => {},
})

/**
 * Hands the ribbon piece the device's minimize state. WHY a context and not
 * the engine's state: AutoCAD keeps it in the profile, not in the drawing nor
 * the session (decision 2), and the zone's height must be known before the
 * engine exists; WHY not the piece's own state: the piece unmounts while
 * RIBBONCLOSE or Clean Screen has closed the ribbon.
 */
export const RibbonLayoutProvider: Provider<RibbonLayoutControl> =
  RibbonLayoutContext.Provider

/**
 * The ribbon's minimize state and its setter, for the `Ribbon` piece or one a
 * host puts in its place: the zone's height follows it.
 */
export function useRibbonLayout(): RibbonLayoutControl {
  return useContext(RibbonLayoutContext)
}

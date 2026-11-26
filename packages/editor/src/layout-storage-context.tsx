"use client"

import { createContext, useContext, type Provider } from "react"

import type { LayoutStorage } from "./cad-editor"

const LayoutStorageContext = createContext<LayoutStorage>({})

/**
 * Hands a palette or a bar the host's keys for what it keeps on the device
 * (the Properties palette's folds, the Quick Access Toolbar's commands). WHY a context and not a prop: `PaletteContent`
 * is a slot, whose props are the pieces' own, and a host's replacement keeps
 * nothing unless it asks.
 */
export const LayoutStorageProvider: Provider<LayoutStorage> =
  LayoutStorageContext.Provider

export function useLayoutStorage(): LayoutStorage {
  return useContext(LayoutStorageContext)
}

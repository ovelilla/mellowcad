"use client"

import type { ReactElement } from "react"

import { BlocksControl } from "./blocks-control"
import { LayersControl } from "./layers-control"
import { PropertiesPanel } from "./properties-panel"
import type { PaletteProps } from "./palettes"

/**
 * What a palette holds: Properties, the Layer Properties Manager or Blocks.
 * The frame round it — its title bar, floating or docked, its size — is the
 * editor's, as a zone is.
 */
export function PaletteContent({
  engine,
  state,
  palette,
}: PaletteProps): ReactElement {
  switch (palette) {
    case "properties":
      return <PropertiesPanel engine={engine} state={state} />
    case "layers":
      return <LayersControl engine={engine} state={state} />
    case "blocks":
      return <BlocksControl engine={engine} state={state} />
  }
}

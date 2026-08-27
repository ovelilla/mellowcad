/**
 * Layers group entities and supply their default appearance ("ByLayer" in
 * AutoCAD terms): an entity references its layer by id and inherits its colour,
 * and toggling a layer's visibility or lock affects every entity on it at once.
 */

import { DEFAULT_LINETYPE_ID, LinetypeId } from "./linetypes"
import { DEFAULT_LINEWEIGHT, Lineweight } from "./lineweights"

export type LayerId = string

/**
 * A drawing layer. `visible` maps to AutoCAD's On/Off; `locked` maps to
 * Lock/Unlock (locked geometry is still shown and can be snapped to, but cannot
 * be selected or edited).
 */
export interface Layer {
  readonly id: LayerId
  readonly name: string
  /** Hex colour applied to entities that live on this layer. */
  readonly color: string
  /** Default linetype id for entities on this layer (their "ByLayer" dash). */
  readonly linetype: LinetypeId
  /** Default lineweight in mm for entities on this layer (their "ByLayer" thickness). */
  readonly lineweight: Lineweight
  /** On/Off — hidden layers are neither drawn, picked nor snapped. */
  readonly visible: boolean
  /** Locked layers are drawn and snappable but cannot be selected/edited. */
  readonly locked: boolean
}

/** The always-present base layer, matching AutoCAD's layer `0`. */
export const DEFAULT_LAYER_ID: LayerId = "0"

/** Default entity colour, used by the base layer (matches the entity theme). */
export const DEFAULT_LAYER_COLOR = "#e2e8f0"

let layerIdCounter = 0

export function nextLayerId(): LayerId {
  layerIdCounter += 1
  return `layer-${layerIdCounter.toString(36)}-${Date.now().toString(36)}`
}

export function createDefaultLayer(): Layer {
  return {
    id: DEFAULT_LAYER_ID,
    name: "0",
    color: DEFAULT_LAYER_COLOR,
    linetype: DEFAULT_LINETYPE_ID,
    lineweight: DEFAULT_LINEWEIGHT,
    visible: true,
    locked: false,
  }
}

export function createLayer(
  name: string,
  color: string = DEFAULT_LAYER_COLOR,
  linetype: LinetypeId = DEFAULT_LINETYPE_ID,
  lineweight: Lineweight = DEFAULT_LINEWEIGHT,
  id: LayerId = nextLayerId()
): Layer {
  return {
    id,
    name,
    color,
    linetype,
    lineweight,
    visible: true,
    locked: false,
  }
}

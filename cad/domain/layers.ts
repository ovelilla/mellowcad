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
 * Lock/Unlock (locked geometry is drawn faded, snappable and selectable at
 * `Command:`, never edited).
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
  /** Locked: drawn faded and snappable, selectable, never edited. */
  readonly locked: boolean
}

/** The always-present base layer, matching AutoCAD's layer `0`. */
export const DEFAULT_LAYER_ID: LayerId = "0"

/**
 * Layer 0's colour and a new layer's: AutoCAD's index colour 7, white (p300:
 * group 62 is 7), drawn in the screen's foreground (`drawnColor`).
 */
export const DEFAULT_LAYER_COLOR = "#ffffff"

/**
 * What a layer name may not hold, as AutoCAD's Layer Properties Manager lists
 * it (desktop d04-13, the string in `AcLayer.resources.dll`).
 */
export const INVALID_LAYER_NAME_CHARACTERS = '<>/\\":;?*|,=`'

/**
 * Why a layer cannot take a name: it is layer 0 (`base`, d04-16, p319),
 * another layer has it in any case (`inUse`, d04-11, d04-14, p320), or it
 * holds a character AutoCAD refuses (`invalid`, d04-13, p321).
 */
export type LayerNameRefusal = "base" | "inUse" | "invalid"

/** Whether layer `id` may be called `name` among `layers`; null when it may. */
export function layerNameRefusal(
  layers: readonly Layer[],
  id: LayerId,
  name: string
): LayerNameRefusal | null {
  if (id === DEFAULT_LAYER_ID) return "base"
  if ([...name].some((c) => INVALID_LAYER_NAME_CHARACTERS.includes(c))) {
    return "invalid"
  }
  const key = name.toUpperCase()
  if (layers.some((l) => l.id !== id && l.name.toUpperCase() === key)) {
    return "inUse"
  }
  return null
}

/**
 * The order AutoCAD's Layer Properties Manager and Layers drop-down list
 * layers in: by name, case aside (d04-1, d05-1). Layer `0` comes first as any
 * name sorts it.
 */
export function compareLayerNames(a: Layer, b: Layer): number {
  const x = a.name.toUpperCase()
  const y = b.name.toUpperCase()
  return x < y ? -1 : x > y ? 1 : 0
}

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

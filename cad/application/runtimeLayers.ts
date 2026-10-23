import { CadDocument } from "../domain/Document"
import { Entity } from "../domain/entities"
import {
  Layer,
  LayerId,
  LayerNameRefusal,
  layerNameRefusal,
} from "../domain/layers"
import { Command } from "./commands/Command"
import { UpdateLayerCommand } from "./commands/layerCommands"
import { Selection } from "./Selection"

/** What the Layer Properties Manager edits on a layer. */
export type LayerPatch = Partial<
  Pick<
    Layer,
    "name" | "color" | "linetype" | "lineweight" | "visible" | "locked"
  >
>

/**
 * Suggests a fresh, unused layer name (Layer1, Layer2, …), numbered as the
 * command language names them. The name is fixed when the layer is made, as in
 * AutoCAD, where it is data from then on.
 */
export function nextLayerName(
  document: CadDocument,
  layerName: (n: number) => string
): string {
  const names = new Set(document.getLayers().map((l) => l.name.toUpperCase()))
  let n = 1
  while (names.has(layerName(n).toUpperCase())) n += 1
  return layerName(n)
}

/**
 * Applies a change to a layer through `execute`, one step, refusing a name
 * AutoCAD refuses (returned, nothing changed). What the layer already has is
 * left out, and a change of nothing makes no step. A lock or an unlock
 * regenerates (p302: U says `Regenerating model.`; an Off does not, p303).
 * Turning a layer off drops its objects from the selection; locking it keeps
 * them (desktop properties/d09-4, d09-5).
 */
export function updateLayer(
  document: CadDocument,
  selection: Selection,
  execute: (command: Command, regenerates: boolean) => void,
  id: LayerId,
  patch: LayerPatch
): LayerNameRefusal | null {
  const layer = document.getLayer(id)
  if (!layer) return null
  const { name, ...rest } = patch
  const renamed = name?.trim()
  if (renamed && renamed !== layer.name) {
    const refusal = layerNameRefusal(document.getLayers(), id, renamed)
    if (refusal !== null) return refusal
  }
  const changed: LayerPatch = Object.fromEntries(
    Object.entries({ ...rest, name: renamed || undefined }).filter(
      ([key, value]) =>
        value !== undefined && layer[key as keyof Layer] !== value
    )
  )
  if (Object.keys(changed).length === 0) return null
  execute(new UpdateLayerCommand(id, changed), changed.locked !== undefined)

  if (changed.visible === false) {
    const drop = selection
      .toArray()
      .map((entityId) => document.get(entityId))
      .filter(
        (entity): entity is Entity =>
          entity !== undefined &&
          entity.layerId === id &&
          !document.isEntitySelectable(entity)
      )
    for (const entity of drop) selection.remove(entity.id)
  }
  return null
}

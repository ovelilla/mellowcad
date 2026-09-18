import { CadDocument } from "../domain/Document"
import { Entity } from "../domain/entities"
import { Layer, LayerId } from "../domain/layers"
import { Selection } from "./Selection"

/** Suggests a fresh, unused layer name (Layer1, Layer2, …). */
export function nextLayerName(document: CadDocument): string {
  const names = new Set(document.getLayers().map((l) => l.name))
  let n = 1
  while (names.has(`Layer${n}`)) n += 1
  return `Layer${n}`
}

/**
 * Applies a partial change to a layer (rename, recolour, on/off, lock). Using
 * a patch keeps this future-proof: new layer properties can be edited through
 * the same method without a new API. Turning a layer off or locking it drops
 * any now-unselectable entities from the current selection.
 */
export function updateLayer(
  document: CadDocument,
  selection: Selection,
  id: LayerId,
  patch: Partial<
    Pick<
      Layer,
      "name" | "color" | "linetype" | "lineweight" | "visible" | "locked"
    >
  >
): void {
  const layer = document.getLayer(id)
  if (!layer) return
  document.updateLayer({ ...layer, ...patch })

  // Objects that just became hidden or locked can no longer stay selected.
  if (patch.visible === false || patch.locked === true) {
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
}

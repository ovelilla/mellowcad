import { CadDocument } from "../domain/Document"
import {
  applyEntityProperty,
  assignEntityColor,
  assignEntityLayer,
  assignEntityLinetype,
  assignEntityLineweight,
  Entity,
  EntityProperty,
} from "../domain/entities"
import { COLOR_BYLAYER, EntityColor, normalizeColor } from "../domain/colors"
import { LayerId } from "../domain/layers"
import { LINETYPE_BYLAYER, LinetypeId } from "../domain/linetypes"
import { LINEWEIGHT_BYLAYER, Lineweight } from "../domain/lineweights"
import { parseNumber } from "../domain/units"
import { Selection } from "./Selection"
import { CommandHistory } from "./commands/Command"
import { UpdateEntityCommand } from "./commands/entityCommands"

/**
 * Moves every selected entity onto layer `id`, matching AutoCAD's "change the
 * objects' layer" (each change is individually undoable).
 */
export function setSelectionLayer(
  document: CadDocument,
  selection: Selection,
  history: CommandHistory,
  id: LayerId
): void {
  if (selection.isEmpty() || !document.getLayer(id)) return
  for (const entityId of selection.toArray()) {
    const entity = document.get(entityId)
    if (!entity || entity.layerId === id) continue
    history.execute(new UpdateEntityCommand(assignEntityLayer(entity, id)))
  }
}

/**
 * Sets the colour of every selected entity: a hex value is an explicit
 * ByObject override, `"ByLayer"` clears it so the layer's colour applies
 * again (each change is individually undoable).
 */
export function setSelectionColor(
  document: CadDocument,
  selection: Selection,
  history: CommandHistory,
  color: EntityColor | typeof COLOR_BYLAYER
): void {
  if (selection.isEmpty()) return
  const next =
    color === COLOR_BYLAYER ? undefined : (normalizeColor(color) ?? undefined)
  // Reject a malformed hex rather than silently clearing the override.
  if (color !== COLOR_BYLAYER && !next) return
  for (const entityId of selection.toArray()) {
    const entity = document.get(entityId)
    if (!entity || entity.color === next) continue
    history.execute(new UpdateEntityCommand(assignEntityColor(entity, next)))
  }
}

/**
 * Sets the linetype of every selected entity: a concrete id is an explicit
 * ByObject override, `"ByLayer"` clears it so the layer's linetype applies
 * again (each change is individually undoable).
 */
export function setSelectionLinetype(
  document: CadDocument,
  selection: Selection,
  history: CommandHistory,
  linetype: LinetypeId | typeof LINETYPE_BYLAYER
): void {
  if (selection.isEmpty()) return
  const next = linetype === LINETYPE_BYLAYER ? undefined : linetype
  for (const entityId of selection.toArray()) {
    const entity = document.get(entityId)
    if (!entity || entity.linetype === next) continue
    history.execute(new UpdateEntityCommand(assignEntityLinetype(entity, next)))
  }
}

/**
 * Sets the lineweight of every selected entity: a millimetre value is an
 * explicit ByObject override, `"ByLayer"` clears it so the layer's lineweight
 * applies again (each change is individually undoable).
 */
export function setSelectionLineweight(
  document: CadDocument,
  selection: Selection,
  history: CommandHistory,
  lineweight: Lineweight | typeof LINEWEIGHT_BYLAYER
): void {
  if (selection.isEmpty()) return
  const next = lineweight === LINEWEIGHT_BYLAYER ? undefined : lineweight
  for (const entityId of selection.toArray()) {
    const entity = document.get(entityId)
    if (!entity || entity.lineweight === next) continue
    history.execute(
      new UpdateEntityCommand(assignEntityLineweight(entity, next))
    )
  }
}

/**
 * Retypes one geometry value of the single selected entity (AutoCAD's
 * editable Properties palette). `text` is parsed with the document's number
 * rules; the change is a single undo step. Returns whether it applied.
 */
export function setSelectionProperty(
  document: CadDocument,
  selection: Selection,
  history: CommandHistory,
  property: EntityProperty,
  text: string
): boolean {
  const ids = selection.toArray()
  if (ids.length !== 1) return false
  const entity = document.get(ids[0])
  if (!entity) return false
  const value = parseNumber(text)
  if (value === null) return false
  const updated = applyEntityProperty(entity, property, value)
  if (!updated) return false
  history.execute(new UpdateEntityCommand(updated))
  return true
}

/** The layer shared by all selected entities, or null when mixed/empty. */
export function commonSelectionLayer(
  entities: readonly Entity[]
): LayerId | null {
  if (entities.length === 0) return null
  const first = entities[0].layerId
  return entities.every((entity) => entity.layerId === first) ? first : null
}

/**
 * The colour shared by every selected entity for the properties picker:
 * `"ByLayer"` when they all inherit their layer, a hex value when they all
 * share the same override, or null when the selection is empty or mixed.
 */
export function commonSelectionColor(
  entities: readonly Entity[]
): EntityColor | typeof COLOR_BYLAYER | null {
  if (entities.length === 0) return null
  const first = entities[0].color ?? COLOR_BYLAYER
  return entities.every((entity) => (entity.color ?? COLOR_BYLAYER) === first)
    ? first
    : null
}

/**
 * The linetype shared by every selected entity for the properties picker:
 * `"ByLayer"` when they all inherit their layer, a concrete id when they all
 * share the same override, or null when the selection is empty or mixed.
 */
export function commonSelectionLinetype(
  entities: readonly Entity[]
): LinetypeId | typeof LINETYPE_BYLAYER | null {
  if (entities.length === 0) return null
  const first = entities[0].linetype ?? LINETYPE_BYLAYER
  return entities.every(
    (entity) => (entity.linetype ?? LINETYPE_BYLAYER) === first
  )
    ? first
    : null
}

/** The lineweight shared by every selected entity, as {@link commonSelectionLinetype}. */
export function commonSelectionLineweight(
  entities: readonly Entity[]
): Lineweight | typeof LINEWEIGHT_BYLAYER | null {
  if (entities.length === 0) return null
  const first = entities[0].lineweight ?? LINEWEIGHT_BYLAYER
  return entities.every(
    (entity) => (entity.lineweight ?? LINEWEIGHT_BYLAYER) === first
  )
    ? first
    : null
}

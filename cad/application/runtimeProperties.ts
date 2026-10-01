import { CadDocument } from "../domain/Document"
import {
  applyEntityProperty,
  assignEntityColor,
  assignEntityLayer,
  assignEntityLinetype,
  assignEntityLineweight,
  Entity,
  EntityProperty,
  entityPointToWorld,
  isZProperty,
  planeAxes,
  translateEntity,
} from "../domain/entities"
import { COLOR_BYLAYER, EntityColor, normalizeColor } from "../domain/colors"
import { LayerId } from "../domain/layers"
import { LINETYPE_BYLAYER, LinetypeId } from "../domain/linetypes"
import { LINEWEIGHT_BYLAYER, Lineweight } from "../domain/lineweights"
import { parseNumber } from "../domain/units"
import {
  Ucs,
  isWorldUcs,
  ucsPointToWorld,
  worldPointToUcs,
} from "../domain/ucs"
import { Vec2 } from "../geometry/Vec2"
import { sub3 } from "../geometry/Vec3"
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
  const updated = applyInUcs(
    entity,
    property,
    value,
    document.getSettings().ucs
  )
  if (!updated) return false
  history.execute(new UpdateEntityCommand(updated))
  return true
}

/** The point each coordinate row reads, and the rows of its X and Y. */
const COORDINATE_ROWS: Readonly<
  Partial<
    Record<
      EntityProperty,
      {
        readonly point: "start" | "end" | "center" | "position"
        readonly axis: "x" | "y"
        readonly x: EntityProperty
        readonly y: EntityProperty
      }
    >
  >
> = {
  startX: { point: "start", axis: "x", x: "startX", y: "startY" },
  startY: { point: "start", axis: "y", x: "startX", y: "startY" },
  endX: { point: "end", axis: "x", x: "endX", y: "endY" },
  endY: { point: "end", axis: "y", x: "endX", y: "endY" },
  centerX: { point: "center", axis: "x", x: "centerX", y: "centerY" },
  centerY: { point: "center", axis: "y", x: "centerX", y: "centerY" },
  positionX: { point: "position", axis: "x", x: "positionX", y: "positionY" },
  positionY: { point: "position", axis: "y", x: "positionX", y: "positionY" },
}

/**
 * The palette shows coordinates in the UCS, so a retyped X or Y is one there:
 * in a turned UCS it moves the point along that axis, which changes both of
 * its world coordinates.
 */
function applyInUcs(
  entity: Entity,
  property: EntityProperty,
  value: number,
  ucs: Ucs
): Entity | null {
  if (planeAxes(entity)) return applyOffPlane(entity, property, value, ucs)
  if (isZProperty(property)) {
    // Thickness is a length along Z, not a position, so the origin does not apply.
    const z = property === "thickness" ? value : value + ucs.origin.z
    return applyEntityProperty(entity, property, z)
  }
  const row = COORDINATE_ROWS[property]
  if (!row || isWorldUcs(ucs)) {
    return applyEntityProperty(entity, property, value)
  }
  const point = rowPoint(entity, row.point)
  if (!point) return null
  const local = worldPointToUcs(ucs, point)
  const next = ucsPointToWorld(
    ucs,
    row.axis === "x" ? { x: value, y: local.y } : { x: local.x, y: value }
  )
  const moved = applyEntityProperty(entity, row.x, next.x)
  return moved && applyEntityProperty(moved, row.y, next.y)
}

/** Which point each position row of a planar object reads, and along which UCS axis. */
const POSITION_ROWS: Readonly<
  Partial<
    Record<
      EntityProperty,
      { readonly point: "center" | "position"; readonly axis: "x" | "y" | "z" }
    >
  >
> = {
  centerX: { point: "center", axis: "x" },
  centerY: { point: "center", axis: "y" },
  centerZ: { point: "center", axis: "z" },
  positionX: { point: "position", axis: "x" },
  positionY: { point: "position", axis: "y" },
  positionZ: { point: "position", axis: "z" },
}

/**
 * A retyped value of an object whose points are in an OCS of its own: a
 * position row moves the whole object in space to put that point where the
 * UCS coordinate says; anything else, its elevation included, is its own.
 */
function applyOffPlane(
  entity: Entity,
  property: EntityProperty,
  value: number,
  ucs: Ucs
): Entity | null {
  const row = POSITION_ROWS[property]
  if (!row) return applyEntityProperty(entity, property, value)
  const point = rowPoint(entity, row.point)
  if (!point) return null
  const world = entityPointToWorld(entity, point)
  const target = ucsPointToWorld(ucs, {
    ...worldPointToUcs(ucs, world),
    [row.axis]: value,
  })
  return translateEntity(entity, sub3(target, world))
}

function rowPoint(
  entity: Entity,
  point: "start" | "end" | "center" | "position"
): Vec2 | null {
  switch (point) {
    case "start":
      return entity.type === "line" ? entity.start : null
    case "end":
      return entity.type === "line" ? entity.end : null
    case "center":
      return "center" in entity ? entity.center : null
    case "position":
      return "position" in entity ? entity.position : null
  }
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

import { CadDocument } from "../domain/Document"
import {
  applyEntityProperty,
  assignEntityColor,
  BlockLookup,
  assignEntityLayer,
  assignEntityLinetype,
  assignEntityLineweight,
  Entity,
  EntityId,
  EntityProperty,
  entityPointToWorld,
  worldToEntity,
  isZProperty,
  lineEndZ,
  lineStartZ,
  planeAxes,
  translateEntity,
  withLineZ,
  splineDataPoints,
} from "../domain/entities"
import { COLOR_BYLAYER, EntityColor, normalizeColor } from "../domain/colors"
import { LayerId } from "../domain/layers"
import { LINETYPE_BYLAYER, LINETYPES, LinetypeId } from "../domain/linetypes"
import {
  LINEWEIGHT_BYLAYER,
  LINEWEIGHTS,
  Lineweight,
} from "../domain/lineweights"
import { DocumentSettings, parseNumber } from "../domain/units"
import {
  Ucs,
  isUpright,
  isWorldUcs,
  ucsPointToWorld,
  worldPointToUcs,
} from "../domain/ucs"
import { Vec2 } from "../geometry/Vec2"
import { Vec3, planar, sub3 } from "../geometry/Vec3"
import { CommandHistory } from "./commands/Command"
import type { EngineText } from "./EngineText"
import {
  buildSelectionInfo,
  commonStyleId,
  objectType,
  type ObjectType,
  type PropertiesFilterOption,
  type PropertiesUi,
} from "./EngineState"
import {
  UpdateEntitiesCommand,
  UpdateEntityCommand,
} from "./commands/entityCommands"
import { UpdateSettingsCommand } from "./commands/settingsCommands"

/**
 * Applies `assign` to every selected entity it changes, as one undo step: a
 * pick in a drop-down is one gesture, however many objects it touches.
 */
function updateSelection(
  document: CadDocument,
  ids: readonly EntityId[],
  history: CommandHistory,
  assign: (entity: Entity) => Entity | null
): void {
  const changed: Entity[] = []
  for (const entityId of ids) {
    const entity = document.get(entityId)
    const next = entity && assign(entity)
    if (next) changed.push(next)
  }
  if (changed.length > 0) history.execute(new UpdateEntitiesCommand(changed))
}

/** Moves every selected entity onto layer `id` (the ribbon's layer drop-down). */
export function setSelectionLayer(
  document: CadDocument,
  ids: readonly EntityId[],
  history: CommandHistory,
  id: LayerId
): void {
  if (!document.getLayer(id)) return
  updateSelection(document, ids, history, (entity) =>
    entity.layerId === id ? null : assignEntityLayer(entity, id)
  )
}

/**
 * Sets the colour of every selected entity: a hex value is an explicit
 * ByObject override, `"ByLayer"` clears it so the layer's colour applies
 * again.
 */
export function setSelectionColor(
  document: CadDocument,
  ids: readonly EntityId[],
  history: CommandHistory,
  color: EntityColor | typeof COLOR_BYLAYER
): void {
  const next =
    color === COLOR_BYLAYER ? undefined : (normalizeColor(color) ?? undefined)
  // Reject a malformed hex rather than silently clearing the override.
  if (color !== COLOR_BYLAYER && !next) return
  updateSelection(document, ids, history, (entity) =>
    entity.color === next ? null : assignEntityColor(entity, next)
  )
}

/**
 * Sets the linetype of every selected entity: a concrete id is an explicit
 * ByObject override, `"ByLayer"` clears it so the layer's linetype applies
 * again.
 */
export function setSelectionLinetype(
  document: CadDocument,
  ids: readonly EntityId[],
  history: CommandHistory,
  linetype: LinetypeId | typeof LINETYPE_BYLAYER
): void {
  // A linetype that is not loaded is refused, as `setCurrentProperties` does.
  if (
    linetype !== LINETYPE_BYLAYER &&
    !LINETYPES.some((entry) => entry.id === linetype)
  ) {
    return
  }
  const next = linetype === LINETYPE_BYLAYER ? undefined : linetype
  updateSelection(document, ids, history, (entity) =>
    entity.linetype === next ? null : assignEntityLinetype(entity, next)
  )
}

/**
 * Sets the lineweight of every selected entity: a millimetre value is an
 * explicit ByObject override, `"ByLayer"` clears it so the layer's lineweight
 * applies again.
 */
export function setSelectionLineweight(
  document: CadDocument,
  ids: readonly EntityId[],
  history: CommandHistory,
  lineweight: Lineweight | typeof LINEWEIGHT_BYLAYER
): void {
  const next = lineweight === LINEWEIGHT_BYLAYER ? undefined : lineweight
  updateSelection(document, ids, history, (entity) =>
    entity.lineweight === next ? null : assignEntityLineweight(entity, next)
  )
}

/** The current properties: CECOLOR, CELTYPE and CELWEIGHT. */
export type CurrentProperties = Pick<
  DocumentSettings,
  "currentColor" | "currentLinetype" | "currentLineweight"
>

/**
 * Sets what new objects take (CECOLOR, CELTYPE, CELWEIGHT), as the Properties
 * panel's drop-downs do with nothing selected. A value AutoCAD would not take
 * — a malformed colour, a linetype or lineweight that is not one of the
 * standard ones — changes nothing, and so does the value already current.
 */
export function setCurrentProperties(
  document: CadDocument,
  history: CommandHistory,
  patch: Partial<CurrentProperties>
): void {
  const settings = document.getSettings()
  const changed: Partial<Record<keyof CurrentProperties, unknown>> = {}
  if (patch.currentColor !== undefined) {
    const color =
      patch.currentColor === COLOR_BYLAYER
        ? COLOR_BYLAYER
        : normalizeColor(patch.currentColor)
    if (color && color !== settings.currentColor) changed.currentColor = color
  }
  const linetype = patch.currentLinetype
  if (
    linetype !== undefined &&
    linetype !== settings.currentLinetype &&
    (linetype === LINETYPE_BYLAYER ||
      LINETYPES.some((entry) => entry.id === linetype))
  ) {
    changed.currentLinetype = linetype
  }
  const lineweight = patch.currentLineweight
  if (
    lineweight !== undefined &&
    lineweight !== settings.currentLineweight &&
    (lineweight === LINEWEIGHT_BYLAYER || LINEWEIGHTS.includes(lineweight))
  ) {
    changed.currentLineweight = lineweight
  }
  if (Object.keys(changed).length > 0) {
    history.execute(
      new UpdateSettingsCommand(changed as Partial<CurrentProperties>)
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
  ids: readonly EntityId[],
  history: CommandHistory,
  property: EntityProperty,
  text: string,
  vertex = 0
): boolean {
  if (ids.length !== 1) return false
  const entity = document.get(ids[0])
  if (!entity) return false
  const value = parseNumber(text)
  if (value === null) return false
  const updated = applyInUcs(
    entity,
    property,
    value,
    document.getSettings().ucs,
    vertex
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
        readonly point: "start" | "end" | "center" | "position" | "origin"
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
  originX: { point: "origin", axis: "x", x: "originX", y: "originY" },
  originY: { point: "origin", axis: "y", x: "originX", y: "originY" },
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
  ucs: Ucs,
  vertex: number
): Entity | null {
  if (
    (entity.type === "polyline" || entity.type === "spline") &&
    (property === "vertexX" || property === "vertexY")
  ) {
    // The vertex moves along that UCS axis, and stays in the object's plane.
    const at =
      entity.type === "polyline"
        ? entity.vertices[vertex]
        : splineDataPoints(entity)[vertex]
    if (!at) return null
    const target = ucsPointToWorld(ucs, {
      ...worldPointToUcs(ucs, entityPointToWorld(entity, at)),
      [property === "vertexX" ? "x" : "y"]: value,
    })
    const moved = worldToEntity(entity, target)
    const x = applyEntityProperty(entity, "vertexX", moved.x, vertex)
    return x && applyEntityProperty(x, "vertexY", moved.y, vertex)
  }
  if (planeAxes(entity) || !isUpright(ucs)) {
    return applyOffPlane(entity, property, value, ucs, vertex)
  }
  if (isZProperty(property)) {
    // Thickness is a length along Z, not a position, so the origin does not apply.
    const z = property === "thickness" ? value : value + ucs.origin.z
    return applyEntityProperty(entity, property, z)
  }
  const row = COORDINATE_ROWS[property]
  if (!row || isWorldUcs(ucs)) {
    return applyEntityProperty(entity, property, value, vertex)
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

/** Which point each position row reads, and along which UCS axis. */
const POSITION_ROWS: Readonly<
  Partial<
    Record<
      EntityProperty,
      {
        readonly point: "start" | "end" | "center" | "position"
        readonly axis: "x" | "y" | "z"
      }
    >
  >
> = {
  startX: { point: "start", axis: "x" },
  startY: { point: "start", axis: "y" },
  startZ: { point: "start", axis: "z" },
  endX: { point: "end", axis: "x" },
  endY: { point: "end", axis: "y" },
  endZ: { point: "end", axis: "z" },
  centerX: { point: "center", axis: "x" },
  centerY: { point: "center", axis: "y" },
  centerZ: { point: "center", axis: "z" },
  positionX: { point: "position", axis: "x" },
  positionY: { point: "position", axis: "y" },
  positionZ: { point: "position", axis: "z" },
}

/**
 * A retyped value read in a UCS the object's points are not level in — its
 * own OCS, or a tilted UCS: a position row puts that point where the UCS
 * coordinate says, moving a line's end alone and any other object whole;
 * anything else, an elevation included, is the object's own.
 */
function applyOffPlane(
  entity: Entity,
  property: EntityProperty,
  value: number,
  ucs: Ucs,
  vertex: number
): Entity | null {
  const row = POSITION_ROWS[property]
  if (!row) return applyEntityProperty(entity, property, value, vertex)
  if (entity.type === "line") {
    if (row.point !== "start" && row.point !== "end") return null
    const start: Vec3 = { ...entity.start, z: lineStartZ(entity) }
    const end: Vec3 = { ...entity.end, z: lineEndZ(entity) }
    const moved = ucsPointToWorld(ucs, {
      ...worldPointToUcs(ucs, row.point === "start" ? start : end),
      [row.axis]: value,
    })
    const [from, to] = row.point === "start" ? [moved, end] : [start, moved]
    return withLineZ(
      { ...entity, start: planar(from), end: planar(to) },
      from.z,
      to.z
    )
  }
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
  point: "start" | "end" | "center" | "position" | "origin"
): Vec2 | null {
  switch (point) {
    case "origin":
      return entity.type === "hatch" ? entity.origin : null
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

/**
 * The selected objects the Properties palette edits: all of them, or those of
 * the type its drop-down picked. A type no longer in the selection reads All.
 */
export function filterByType(
  entities: readonly Entity[],
  type: ObjectType | null
): readonly Entity[] {
  if (type === null) return entities
  const kept = entities.filter((entity) => objectType(entity) === type)
  return kept.length === 0 ? entities : kept
}

/**
 * The Properties palette's state: the object type drop-down (All first when
 * the selection mixes types, then each type, most objects first: desktop
 * properties/d06-2, e01) and every value over the objects that drop-down
 * leaves.
 */
export function buildPropertiesUi(
  entities: readonly Entity[],
  filter: ObjectType | null,
  settings: DocumentSettings,
  text: EngineText,
  vertex = 0,
  blocks?: BlockLookup
): PropertiesUi {
  const counts = new Map<ObjectType, number>()
  for (const entity of entities) {
    const type = objectType(entity)
    counts.set(type, (counts.get(type) ?? 0) + 1)
  }
  // A stable sort: types of one count keep the order they were picked in
  // (unverified, PROPS-D64).
  const types: PropertiesFilterOption[] = [...counts]
    .sort(([, a], [, b]) => b - a)
    .map(([type, count]) => ({
      type,
      label: text.propertiesFilter(type, count),
    }))
  const filters: PropertiesFilterOption[] =
    types.length > 1
      ? [
          { type: null, label: text.propertiesFilter(null, entities.length) },
          ...types,
        ]
      : types
  const shown = filter !== null && counts.has(filter) ? filter : null
  const edited = filterByType(entities, shown)
  return {
    // With one type there is no All entry: the type is the whole selection.
    filter: shown ?? (types.length === 1 ? types[0].type : null),
    filters,
    info: buildSelectionInfo(edited, settings, text, vertex, blocks),
    layerId: commonSelectionLayer(edited),
    color: commonSelectionColor(edited),
    linetype: commonSelectionLinetype(edited),
    lineweight: commonSelectionLineweight(edited),
    textStyleId: commonStyleId(edited, "text"),
    dimStyleId: commonStyleId(edited, "dimension"),
  }
}

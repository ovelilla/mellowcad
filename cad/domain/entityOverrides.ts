import { EntityColor } from "./colors"
import { LayerId } from "./layers"
import { LinetypeId } from "./linetypes"
import { Lineweight } from "./lineweights"
import { TextStyleId } from "./textStyles"
import { DimStyleId } from "./dimStyles"
import { Entity } from "./entityTypes"

/** Returns a copy of `entity` using another text style (preserves its id). */
export function assignTextStyle(entity: Entity, styleId: TextStyleId): Entity {
  return entity.type === "text" ||
    entity.type === "mtext" ||
    entity.type === "attdef"
    ? { ...entity, styleId }
    : entity
}

/** Returns a copy of `entity` using another dimension style (preserves its id). */
export function assignDimStyle(entity: Entity, styleId: DimStyleId): Entity {
  return entity.type === "dimension" ? { ...entity, styleId } : entity
}

/** Returns a copy of `entity` moved onto layer `layerId` (preserves its id). */
export function assignEntityLayer(entity: Entity, layerId: LayerId): Entity {
  switch (entity.type) {
    case "line":
      return { ...entity, layerId }
    case "circle":
      return { ...entity, layerId }
    case "arc":
      return { ...entity, layerId }
    case "ellipse":
      return { ...entity, layerId }
    case "spline":
      return { ...entity, layerId }
    case "polyline":
      return { ...entity, layerId }
    case "text":
      return { ...entity, layerId }
    case "mtext":
      return { ...entity, layerId }
    case "attdef":
      return { ...entity, layerId }
    case "dimension":
      return { ...entity, layerId }
    case "hatch":
      return { ...entity, layerId }
    case "insert":
      return { ...entity, layerId }
  }
}

/**
 * Returns a copy of `entity` with an explicit colour override, or back to
 * ByLayer when `color` is undefined (preserves its id). Mirrors
 * {@link assignEntityLayer} for the colour axis.
 */
export function assignEntityColor(
  entity: Entity,
  color: EntityColor | undefined
): Entity {
  switch (entity.type) {
    case "line":
      return { ...entity, color }
    case "circle":
      return { ...entity, color }
    case "arc":
      return { ...entity, color }
    case "ellipse":
      return { ...entity, color }
    case "spline":
      return { ...entity, color }
    case "polyline":
      return { ...entity, color }
    case "text":
      return { ...entity, color }
    case "mtext":
      return { ...entity, color }
    case "attdef":
      return { ...entity, color }
    case "dimension":
      return { ...entity, color }
    case "hatch":
      return { ...entity, color }
    case "insert":
      return { ...entity, color }
  }
}

/**
 * Returns a copy of `entity` with an explicit linetype override, or back to
 * ByLayer when `linetype` is undefined (preserves its id).
 */
export function assignEntityLinetype(
  entity: Entity,
  linetype: LinetypeId | undefined
): Entity {
  switch (entity.type) {
    case "line":
      return { ...entity, linetype }
    case "circle":
      return { ...entity, linetype }
    case "arc":
      return { ...entity, linetype }
    case "ellipse":
      return { ...entity, linetype }
    case "spline":
      return { ...entity, linetype }
    case "polyline":
      return { ...entity, linetype }
    case "text":
      return { ...entity, linetype }
    case "mtext":
      return { ...entity, linetype }
    case "attdef":
      return { ...entity, linetype }
    case "dimension":
      return { ...entity, linetype }
    case "hatch":
      return { ...entity, linetype }
    case "insert":
      return { ...entity, linetype }
  }
}

/**
 * Returns a copy of `entity` with an explicit lineweight override, or back to
 * ByLayer when `lineweight` is undefined (preserves its id).
 */
export function assignEntityLineweight(
  entity: Entity,
  lineweight: Lineweight | undefined
): Entity {
  switch (entity.type) {
    case "line":
      return { ...entity, lineweight }
    case "circle":
      return { ...entity, lineweight }
    case "arc":
      return { ...entity, lineweight }
    case "ellipse":
      return { ...entity, lineweight }
    case "spline":
      return { ...entity, lineweight }
    case "polyline":
      return { ...entity, lineweight }
    case "text":
      return { ...entity, lineweight }
    case "mtext":
      return { ...entity, lineweight }
    case "attdef":
      return { ...entity, lineweight }
    case "dimension":
      return { ...entity, lineweight }
    case "hatch":
      return { ...entity, lineweight }
    case "insert":
      return { ...entity, lineweight }
  }
}

/** Applies `source`'s ByObject overrides (if any) onto a freshly-built entity. */
export function carryOverrides(source: Entity, copy: Entity): Entity {
  const withColor = source.color ? assignEntityColor(copy, source.color) : copy
  const withLinetype = source.linetype
    ? assignEntityLinetype(withColor, source.linetype)
    : withColor
  return source.lineweight !== undefined
    ? assignEntityLineweight(withLinetype, source.lineweight)
    : withLinetype
}

/**
 * Gives `target` the general properties of `source` — layer, colour, linetype
 * and lineweight — keeping its own geometry and identity. This is MATCHPROP:
 * an override the source does *not* have is cleared on the target, so the two
 * end up drawn the same way rather than merely sharing what was set.
 */
export function matchEntityProperties(source: Entity, target: Entity): Entity {
  const onLayer = assignEntityLayer(target, source.layerId)
  const withColor = assignEntityColor(onLayer, source.color)
  const withLinetype = assignEntityLinetype(withColor, source.linetype)
  return assignEntityLineweight(withLinetype, source.lineweight)
}

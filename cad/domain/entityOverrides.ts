import { EntityColor } from "./colors"
import { LayerId } from "./layers"
import { LinetypeId } from "./linetypes"
import { Lineweight } from "./lineweights"
import { TextStyleId } from "./textStyles"
import { DimStyleId } from "./dimStyles"
import { Entity } from "./entityTypes"
import {
  alongSource,
  carryPlane,
  entityThickness,
  hasThickness,
  withThickness,
} from "./elevation"

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
    case "polyline3d":
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
    case "polyline3d":
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
    case "polyline3d":
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
    case "polyline3d":
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

/**
 * Applies `source`'s ByObject overrides (if any) onto a freshly-built entity,
 * and puts it in `source`'s plane with its thickness: every object rebuilt from
 * another goes through here, which is what keeps a rebuild from dropping them.
 */
export function carryOverrides<T extends Entity>(source: Entity, copy: T): T {
  const withColor = source.color ? assignEntityColor(copy, source.color) : copy
  const withLinetype = source.linetype
    ? assignEntityLinetype(withColor, source.linetype)
    : withColor
  return carryPlane(
    source,
    (source.lineweight !== undefined
      ? assignEntityLineweight(withLinetype, source.lineweight)
      : withLinetype) as T
  )
}

/** {@link carryOverrides} for a piece of `source` along its own run: a line's ends keep the Z they had there. */
export function carryPiece<T extends Entity>(source: Entity, piece: T): T {
  return alongSource(source, carryOverrides(source, piece))
}

/**
 * Gives `target` the properties of `source` MATCHPROP's Property Settings copy
 * by default — layer, colour, linetype, lineweight and thickness, then the
 * Text, Dimension and Hatch special properties between objects of that kind —
 * keeping its own geometry and identity. An override the source does *not*
 * have is cleared on the target, so the two end up drawn the same way rather
 * than merely sharing what was set.
 */
export function matchEntityProperties(source: Entity, target: Entity): Entity {
  const onLayer = assignEntityLayer(target, source.layerId)
  const withColor = assignEntityColor(onLayer, source.color)
  // "Linetype … Available for all objects except attributes, hatches,
  // multiline text, points, and viewports" (help, Property Settings, 2027).
  const withLinetype =
    withColor.type === "hatch" ||
    withColor.type === "mtext" ||
    withColor.type === "attdef"
      ? withColor
      : assignEntityLinetype(withColor, source.linetype)
  const matched = assignEntityLineweight(withLinetype, source.lineweight)
  return matchSpecialProperties(
    source,
    hasThickness(source) && hasThickness(matched)
      ? withThickness(matched, entityThickness(source))
      : matched
  )
}

/**
 * Property Settings' Text ("single-line and multiline text objects"), Dimension
 * and Hatch special properties, on by default (help, 2027; desktop
 * properties/d07-6): the dimension style, a hatch's pattern, scale and angle,
 * and a text's as desktop text/d08 shows:
 * - between any two texts, the style, height and rotation (MTEXT to MTEXT
 *   was not probed: the same three, by analogy);
 * - TEXT to TEXT also the justification, about the destination's point: a
 *   Left text at 70,20 turned MC keeps its alignment point at 70,20. A
 *   justified destination was not probed. Width factor and obliquing are not
 *   modelled; an MTEXT's attachment is never copied.
 * Annotative scaling is not modelled; a hatch's origin is left, as the help
 * says ("To match the hatch origin, use Inherit Properties").
 */
function matchSpecialProperties(source: Entity, target: Entity): Entity {
  if (
    (source.type === "text" || source.type === "mtext") &&
    (target.type === "text" || target.type === "mtext")
  ) {
    const { styleId, height, rotation } = source
    return target.type === "mtext"
      ? { ...target, styleId, height, rotation }
      : {
          ...target,
          styleId,
          height,
          rotation,
          justify: source.type === "text" ? source.justify : target.justify,
        }
  }
  if (source.type === "dimension" && target.type === "dimension") {
    return assignDimStyle(target, source.styleId)
  }
  if (source.type === "hatch" && target.type === "hatch") {
    return {
      ...target,
      patternId: source.patternId,
      patternScale: source.patternScale,
      patternAngle: source.patternAngle,
    }
  }
  return target
}

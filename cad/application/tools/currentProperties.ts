import {
  assignEntityColor,
  assignEntityLinetype,
  assignEntityLineweight,
  Entity,
  ThickEntity,
  withThickness,
} from "../../domain/entities"
import { COLOR_BYLAYER } from "../../domain/colors"
import { DEFAULT_LAYER_COLOR } from "../../domain/layers"
import { LINETYPE_BYLAYER } from "../../domain/linetypes"
import { LINEWEIGHT_BYLAYER } from "../../domain/lineweights"
import { ToolContext } from "./Tool"

/**
 * CECOLOR, CELTYPE and CELWEIGHT, which every object drawn from scratch takes.
 * An object made from another — a copy, a piece, an offset — carries the
 * source's instead (`carryOverrides`), and ByLayer stores nothing.
 */
export function withCurrentProperties<T extends Entity>(
  entity: T,
  ctx: ToolContext
): T {
  const { currentColor, currentLinetype, currentLineweight } =
    ctx.document.getSettings()
  let placed: Entity = entity
  if (currentColor !== COLOR_BYLAYER) {
    placed = assignEntityColor(placed, currentColor)
  }
  if (currentLinetype !== LINETYPE_BYLAYER) {
    placed = assignEntityLinetype(placed, currentLinetype)
  }
  if (currentLineweight !== LINEWEIGHT_BYLAYER) {
    placed = assignEntityLineweight(placed, currentLineweight)
  }
  return placed as T
}

/**
 * The colour an object drawn from scratch will show: CECOLOR, ByLayer read
 * off the current layer.
 */
export function currentColor(ctx: ToolContext): string {
  const { currentColor } = ctx.document.getSettings()
  if (currentColor !== COLOR_BYLAYER) return currentColor
  return (
    ctx.document.getLayer(ctx.document.getCurrentLayerId())?.color ??
    DEFAULT_LAYER_COLOR
  )
}

/** THICKNESS as LINE, CIRCLE, ARC, PLINE and POLYGON give it; RECTANG and TEXT do not. */
export function withCurrentThickness<T extends ThickEntity>(
  entity: T,
  ctx: ToolContext
): T {
  return withThickness(entity, ctx.document.getSettings().thickness)
}

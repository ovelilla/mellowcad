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
import type { DocumentSettings } from "../../domain/units"
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
  return wearing(entity, ctx.document.getSettings())
}

/**
 * The current layer, CECOLOR, CELTYPE, CELWEIGHT and THICKNESS as they stand:
 * what a command that adds its object only at its end takes when that object
 * starts, as AutoCAD appends it then (PLINE's start point, pline/p39, p182,
 * p183).
 */
export interface CurrentProperties extends Pick<
  DocumentSettings,
  "currentColor" | "currentLinetype" | "currentLineweight" | "thickness"
> {
  readonly layerId: string
}

export function currentProperties(ctx: ToolContext): CurrentProperties {
  const { currentColor, currentLinetype, currentLineweight, thickness } =
    ctx.document.getSettings()
  return {
    layerId: ctx.document.getCurrentLayerId(),
    currentColor,
    currentLinetype,
    currentLineweight,
    thickness,
  }
}

/**
 * {@link withCurrentProperties} and {@link withCurrentThickness} as they
 * stood in `properties`; the layer is the factory's argument.
 */
export function withProperties<T extends ThickEntity>(
  entity: T,
  properties: CurrentProperties
): T {
  return withThickness(wearing(entity, properties), properties.thickness)
}

function wearing<T extends Entity>(
  entity: T,
  {
    currentColor,
    currentLinetype,
    currentLineweight,
  }: Pick<
    DocumentSettings,
    "currentColor" | "currentLinetype" | "currentLineweight"
  >
): T {
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
 * off the current layer — or off `properties`, those it took at its start.
 */
export function currentColor(
  ctx: ToolContext,
  properties: Pick<
    CurrentProperties,
    "currentColor" | "layerId"
  > = currentProperties(ctx)
): string {
  const { currentColor, layerId } = properties
  if (currentColor !== COLOR_BYLAYER) return currentColor
  return ctx.document.getLayer(layerId)?.color ?? DEFAULT_LAYER_COLOR
}

/** THICKNESS as LINE, CIRCLE, ARC, PLINE and POLYGON give it; RECTANG and TEXT do not. */
export function withCurrentThickness<T extends ThickEntity>(
  entity: T,
  ctx: ToolContext
): T {
  return withThickness(entity, ctx.document.getSettings().thickness)
}

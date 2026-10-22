import { Entity } from "../../domain/entities"
import { THEME } from "../../scene/theme"
import { ScenePrimitive } from "../../scene/types"
import {
  entityScenePrimitive,
  entityStroke,
  selectionGlow,
} from "../SceneBuilder"
import { ToolContext } from "./Tool"

/**
 * `piece` as the drawing draws it, faded as ERASE's preview fades an object,
 * or with the selection's glow over it: the looks of TRIM's and FILLET's
 * ghosts (desktop trim/d01-1, d01-3, corners/d01-2).
 */
export function drawn(
  ctx: ToolContext,
  piece: Entity,
  look: "plain" | "faded" | "glow"
): ScenePrimitive[] {
  const settings = ctx.document.getSettings()
  const stroke = entityStroke(
    ctx.viewport,
    piece,
    ctx.document.getLayer(piece.layerId),
    settings,
    look === "faded"
  )
  const options = {
    fill: settings.fillMode,
    linetype: true,
    blocks: ctx.blocks,
  }
  const primitives = entityScenePrimitive(ctx.viewport, piece, stroke, options)
  return look === "glow"
    ? [...primitives, ...selectionGlow(ctx.viewport, piece, stroke, options)]
    : primitives
}

/**
 * A single object's pick's rollover: the object a pick there takes, in the
 * plain hover glow (desktop corners/d01-1, pieces/d01-1).
 */
export function rollover(ctx: ToolContext, entity: Entity): ScenePrimitive[] {
  return entityScenePrimitive(
    ctx.viewport,
    entity,
    { color: THEME.entityHover, width: 2 },
    { blocks: ctx.blocks }
  )
}

import { Vec3, WORLD_X, WORLD_Z, cross3, length3 } from "../../geometry/Vec3"
import { entitiesViewBounds } from "../Viewport"
import { ToolContext } from "./Tool"

/** Screen margin left round the extents, as ZOOM Extents leaves it. */
const PADDING_PX = 40

/**
 * AutoCAD's preset views: where the viewer stands, looking back at the origin.
 * An isometric one looks down at a box from one of its upper corners (SW is
 * the lower-left one seen from the top).
 */
export const VIEW_PRESETS = {
  Top: { x: 0, y: 0, z: 1 },
  Bottom: { x: 0, y: 0, z: -1 },
  Front: { x: 0, y: -1, z: 0 },
  BAck: { x: 0, y: 1, z: 0 },
  Left: { x: -1, y: 0, z: 0 },
  Right: { x: 1, y: 0, z: 0 },
  SWiso: { x: -1, y: -1, z: 1 },
  SEiso: { x: 1, y: -1, z: 1 },
  NEiso: { x: 1, y: 1, z: 1 },
  NWiso: { x: -1, y: 1, z: 1 },
} as const satisfies Record<string, Vec3>

export type ViewPreset = keyof typeof VIEW_PRESETS

/**
 * Looks from `viewPoint` at the origin, the world's Z drawn up (the WCS's X to
 * the right when looking straight along Z), and fits the drawing's extents.
 * ZOOM Previous steps back to the view before. False, changing nothing, for a
 * zero view point.
 */
export function lookFrom(viewPoint: Vec3, ctx: ToolContext): boolean {
  if (!(length3(viewPoint) > 0) || !Number.isFinite(length3(viewPoint))) {
    return false
  }
  const across = cross3(WORLD_Z, viewPoint)
  const right = length3(across) > 1e-12 * length3(viewPoint) ? across : WORLD_X
  const { viewport } = ctx
  viewport.pushHistory()
  if (!viewport.setView(viewPoint, right)) return false
  const bounds = entitiesViewBounds(
    ctx.document.getEntities(),
    viewport,
    ctx.blocks
  )
  if (bounds) viewport.zoomToViewBounds(bounds.min, bounds.max, PADDING_PX)
  return true
}

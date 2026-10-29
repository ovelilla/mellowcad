import { Vec3, WORLD_X, length3, normalize3 } from "../../geometry/Vec3"
import { arbitraryAxis } from "../../geometry/ocs"
import { EXTENTS_MARGIN_PX, Viewport, entitiesViewBounds } from "../Viewport"
import { BlockLookup, Entity } from "../../domain/entities"
import { ToolContext } from "./Tool"

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
} as const

export type ViewPreset = keyof typeof VIEW_PRESETS

/** The preset views as the viewport controls' view menu lists them. */
export const VIEW_MENU: readonly ViewPreset[] = [
  "Top",
  "Bottom",
  "Left",
  "Right",
  "Front",
  "BAck",
  "SWiso",
  "SEiso",
  "NEiso",
  "NWiso",
]

/** Below this a camera axis is taken as a preset's. */
const SAME_AXIS = 1e-6

/**
 * The direction drawn right when looking from `viewPoint`, AutoCAD's twist 0:
 * the X of the arbitrary-axis frame of the line of sight — the world's Z drawn
 * up, and looking along Z the WCS's Y up, so Bottom has the X to the left
 * (view/p246, p305, p332: VPOINT 0,0,-1 and -VIEW Bottom, then UCS View, give
 * X = -1,0,0; p247: VPOINT 0.01,0,-1 gives -0.99995,0,-0.0099995).
 */
function presetRight(viewPoint: Vec3): Vec3 {
  return arbitraryAxis(viewPoint)?.x ?? WORLD_X
}

/**
 * The preset `viewport` shows — looking along its view point with its right
 * drawn right, so a turned plan is no longer Top — or `null` for a custom view.
 */
export function currentViewPreset(viewport: Viewport): ViewPreset | null {
  const { direction, right } = viewport
  const near = (a: Vec3, b: Vec3) => {
    const unit = normalize3(b)
    return (
      unit !== null &&
      Math.abs(a.x - unit.x) < SAME_AXIS &&
      Math.abs(a.y - unit.y) < SAME_AXIS &&
      Math.abs(a.z - unit.z) < SAME_AXIS
    )
  }
  for (const preset of VIEW_MENU) {
    const viewPoint = VIEW_PRESETS[preset]
    if (near(direction, viewPoint) && near(right, presetRight(viewPoint))) {
      return preset
    }
  }
  return null
}

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
  const right = presetRight(viewPoint)
  const { viewport } = ctx
  viewport.pushHistory()
  if (!viewport.setView(viewPoint, right)) return false
  fitExtents(viewport, ctx.document.getEntities(), ctx.blocks)
  return true
}

/** Frames `entities` as ZOOM Extents does, with its margin; nothing to frame leaves the zoom. */
export function fitExtents(
  viewport: Viewport,
  entities: readonly Entity[],
  blocks?: BlockLookup
): void {
  const bounds = entitiesViewBounds(entities, viewport, blocks)
  if (bounds)
    viewport.zoomToViewBounds(bounds.min, bounds.max, EXTENTS_MARGIN_PX)
}

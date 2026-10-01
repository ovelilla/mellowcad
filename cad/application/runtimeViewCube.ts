import { Vec2 } from "../geometry/Vec2"
import { Vec3, WORLD_Z, cross3, normalize3 } from "../geometry/Vec3"
import { worldToAxes } from "../geometry/ocs"
import { CadDocument } from "../domain/Document"
import { Entity } from "../domain/entities"
import { SavedView } from "../domain/units"
import { Selection } from "./Selection"
import { Viewport } from "./Viewport"
import { drawingMiddle, orbitTarget, orbitView } from "./orbit"
import { fitExtents } from "./tools/viewPresets"
import {
  CompassLetter,
  CubeCamera,
  CubeView,
  ViewCubePart,
  ViewCubeRoll,
  ViewCubeSide,
  ViewCubeUi,
  adjacentView,
  buildViewCubeUi,
  compassNorth,
  compassView,
  cubeAxes,
  isFace,
  nearestPart,
  partAt,
  partView,
  rolledView,
} from "./viewCube"

/** What the ViewCube acts on: the view, the drawing it frames, the objects designated. */
export interface CubeContext {
  readonly viewport: Viewport
  readonly document: CadDocument
  readonly selection: Selection
}

/** A drag on the cube (an orbit) or on its compass ring (the azimuth alone). */
export interface CubeDrag {
  readonly last: Vec2
  /** The pivot, in the cube's frame. */
  readonly target: Vec3
  /** Where the pivot is drawn, which it keeps. */
  readonly at: Vec2
  readonly ring: boolean
}

/** "Top/Left/Front", the Home view of a drawing that has not set one: SW Isometric. */
export const DEFAULT_HOME: SavedView = (() => {
  const direction = normalize3({ x: -1, y: -1, z: 1 })!
  const right = normalize3(cross3(WORLD_Z, direction))!
  return { direction, up: cross3(direction, right) }
})()

/** The view read in the cube's frame: the current UCS's. */
function cubeViewport(ctx: CubeContext): Viewport {
  return ctx.viewport.inFrame(cubeAxes(ctx.document.getSettings().ucs))
}

function cameraOf(view: Viewport): CubeCamera {
  return { direction: view.direction, right: view.right, up: view.up }
}

/** "The entire model or an object selected in the view" (V13). */
function framed(ctx: CubeContext): Entity[] {
  const selected = selectedEntities(ctx)
  return selected.length > 0 ? selected : [...ctx.document.getEntities()]
}

function selectedEntities(ctx: CubeContext): Entity[] {
  return ctx.selection
    .toArray()
    .map((id) => ctx.document.get(id))
    .filter((entity): entity is Entity => entity !== undefined)
}

/** One step of ZOOM Previous, the view, then the extents when the click asks for them. */
function show(ctx: CubeContext, view: CubeView, fit: boolean): void {
  ctx.viewport.pushHistory()
  if (!cubeViewport(ctx).setView(view.direction, view.right)) return
  if (fit) fitExtents(ctx.viewport, framed(ctx), ctx.document.blockLookup())
}

/** A click on a face, an edge or a corner: its view, fitted. The UCS stays (D10). */
export function pickPart(ctx: CubeContext, part: ViewCubePart): void {
  const view = partView(part)
  if (view) show(ctx, view, true)
}

/** A roll arrow: a quarter turn about the centre of a face view. */
export function rollCube(ctx: CubeContext, turn: ViewCubeRoll): void {
  const camera = cameraOf(cubeViewport(ctx))
  const part = partAt(camera.direction)
  if (part === null || !isFace(part)) return
  show(ctx, rolledView(camera, turn), false)
}

/** A triangle: the neighbouring face, fitted. Only from a face view. */
export function turnToAdjacent(ctx: CubeContext, side: ViewCubeSide): void {
  const camera = cameraOf(cubeViewport(ctx))
  const part = partAt(camera.direction)
  if (part === null || !isFace(part)) return
  show(ctx, adjacentView(camera, side), true)
}

/** A letter of the compass: the view from that side, fitted. */
export function pickCompass(ctx: CubeContext, letter: CompassLetter): void {
  const view = cubeViewport(ctx)
  const north = compassNorth(cubeAxes(ctx.document.getSettings().ucs))
  show(ctx, compassView(cameraOf(view), letter, north), true)
}

/** Home: the drawing's Home view, in the WCS, fitted. */
export function goHome(ctx: CubeContext): void {
  const home = ctx.document.getSettings().viewCube.home ?? DEFAULT_HOME
  ctx.viewport.pushHistory()
  if (!ctx.viewport.setView(home.direction, cross3(home.up, home.direction))) {
    return
  }
  fitExtents(ctx.viewport, framed(ctx), ctx.document.blockLookup())
}

/** Set Current View as Home: its orientation, saved in the drawing (no undo step). */
export function homeFromView(ctx: CubeContext): void {
  const { viewport, document } = ctx
  document.setViewCube({
    ...document.getSettings().viewCube,
    home: { direction: viewport.direction, up: viewport.up },
  })
}

/**
 * The pivot is the centre of the view, or of the extents of what is selected
 * ("About Reorienting the View"), and it stays where it is drawn.
 */
export function startCubeDrag(
  ctx: CubeContext,
  screen: Vec2,
  ring: boolean
): CubeDrag {
  ctx.viewport.pushHistory()
  const blocks = ctx.document.blockLookup()
  const pivot =
    drawingMiddle(selectedEntities(ctx), blocks) ??
    orbitTarget(ctx.viewport, ctx.document.getEntities(), blocks)
  return {
    last: screen,
    target: worldToAxes(cubeAxes(ctx.document.getSettings().ucs), pivot),
    at: ctx.viewport.worldToScreen(pivot),
    ring,
  }
}

/** The orbit 3DORBIT does, with the cube's Z kept up; the ring turns the azimuth only. */
export function moveCubeDrag(
  ctx: CubeContext,
  drag: CubeDrag,
  screen: Vec2
): CubeDrag {
  const view = cubeViewport(ctx)
  orbitView(
    view,
    { x: screen.x - drag.last.x, y: drag.ring ? 0 : screen.y - drag.last.y },
    drag.target
  )
  keepPivot(view, drag)
  return { ...drag, last: screen }
}

function keepPivot(view: Viewport, drag: CubeDrag): void {
  const now = view.worldToScreen(drag.target)
  view.panByScreen({ x: drag.at.x - now.x, y: drag.at.y - now.y })
}

/** Letting go of the cube near one of its 26 views lands on it ("Snap to closest view"). */
export function endCubeDrag(ctx: CubeContext, drag: CubeDrag): void {
  if (drag.ring) return
  const view = cubeViewport(ctx)
  const part = nearestPart(view.direction)
  const snapped = part === null ? null : partView(part)
  if (!snapped || partAt(view.direction) === part) return
  if (view.setView(snapped.direction, snapped.right)) keepPivot(view, drag)
}

/** The ViewCube as the current camera and UCS show it. */
export function viewCubeUi(ctx: CubeContext): ViewCubeUi {
  const settings = ctx.document.getSettings()
  const axes = cubeAxes(settings.ucs)
  return buildViewCubeUi(
    cameraOf(ctx.viewport.inFrame(axes)),
    compassNorth(axes),
    settings.viewCube.visible
  )
}

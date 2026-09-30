import type { DocumentReader } from "../domain/Document"
import { Bounds, Entity, EntityId, entitiesBounds } from "../domain/entities"
import { WORLD_UCS } from "../domain/ucs"
import { Scene } from "../scene/types"
import { Viewport } from "./Viewport"
import { buildScene } from "./SceneBuilder"

const EMPTY_IDS: ReadonlySet<EntityId> = new Set()

export interface DrawingPreviewOptions {
  /** Frame size in screen pixels. */
  readonly width: number
  readonly height: number
  /** Breathing room around the framed rectangle, in screen pixels. */
  readonly padding?: number
  /** What to draw: the whole drawing by default. */
  readonly entities?: readonly Entity[]
  /**
   * What the camera frames: the whole drawing by default. Because the default
   * does not depend on `entities`, previews of different parts of one drawing
   * share a camera and overlay each other to the pixel.
   */
  readonly frame?: Bounds
  /**
   * Draw lineweights (LWDISPLAY). Off by default: a thumbnail is a shape, not a
   * plot, and real lineweights would blot a small one out.
   */
  readonly lwDisplay?: boolean
}

/**
 * The camera that frames `bounds` in a `width`×`height` box — the same
 * `zoomToBounds` a ZOOM Extents uses.
 */
export function previewCamera(
  bounds: Bounds,
  width: number,
  height: number,
  padding = 0
): Viewport {
  const camera = new Viewport()
  camera.setSize(width, height)
  camera.zoomToBounds(bounds.min, bounds.max, padding)
  return camera
}

/**
 * The drawing, or part of it, as a neutral scene with nothing but the objects:
 * no grid, cursor, snap markers or selection. It is built by the very scene
 * builder the editor draws with, so a preview can never disagree with how the
 * drawing looks. Null when there is nothing to frame.
 */
export function buildDrawingPreview(
  document: DocumentReader,
  options: DrawingPreviewOptions
): Scene | null {
  const blocks = document.blockLookup()
  const frame =
    options.frame ?? entitiesBounds(document.getEntities(), blocks) ?? null
  if (!frame) return null
  const camera = previewCamera(
    frame,
    options.width,
    options.height,
    options.padding ?? 0
  )
  return previewScene(
    document,
    camera,
    options.entities ?? document.getEntities(),
    options.lwDisplay ?? false
  )
}

/** A scene of just `entities`, through `camera`, with every overlay off. */
export function previewScene(
  document: DocumentReader,
  camera: Viewport,
  entities: readonly Entity[],
  lwDisplay: boolean
): Scene {
  return buildScene({
    camera,
    entities,
    layers: document.getLayers(),
    dimStyles: document.getDimStyles(),
    blocks: document.blockLookup(),
    selectedIds: EMPTY_IDS,
    hiddenIds: EMPTY_IDS,
    gridVisible: false,
    gridSpacing: null,
    ucs: WORLD_UCS,
    ucsIcon: null,
    ltScale: document.getSettings().ltScale,
    lwDisplay,
    snap: null,
    snapLabel: "",
    acquiredTrackingPoints: [],
    tracking: null,
    parallelReferenceIds: EMPTY_IDS,
    toolOverlay: [],
    cursor: null,
    polar: null,
    fromBase: null,
    cyclingBadge: null,
    cyclingHighlight: null,
  })
}

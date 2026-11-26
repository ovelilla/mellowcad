import type { DocumentReader } from "../domain/Document"
import {
  Bounds,
  Entity,
  EntityId,
  createHatch,
  createPolyline,
  entitiesBounds,
} from "../domain/entities"
import { HatchPatternId, hatchPattern } from "../domain/hatchPatterns"
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
    linetypes: document.linetypeLookup(),
    textStyles: document.getTextStyles(),
    lwDisplay,
    attributeDisplay: document.getSettings().attributeDisplay,
    fillMode: document.getSettings().fillMode,
    pointMode: document.getSettings().pointMode,
    pointSize: document.getSettings().pointSize,
    wipeoutFrame: document.getSettings().wipeoutFrame,
    imageFrame: document.getSettings().imageFrame,
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
    removeBadge: null,
    cyclingHighlight: null,
  })
}

/** The swatch's side, in pattern units at the scale chosen for it. */
const SWATCH_SIDE = 30
const SWATCH_IDS = { hatch: "__swatch_hatch__", frame: "__swatch_frame__" }

/**
 * A pattern's swatch for Hatch Creation's gallery: a square hatched with it
 * in white, framed, in a `size` px box, so the gallery draws what HATCH
 * makes. WHY its own scale: AutoCAD's swatches are drawings of their own,
 * each showing a few repeats (ANSI31 three lines, ANSI32 six, ANGLE three
 * by three: desktop hatch/d01-2), so the pattern's largest repeat — a
 * family's spacing or its dashes' run — is a third of the square. Null for
 * a pattern this build has not.
 */
export function buildHatchSwatch(
  document: DocumentReader,
  patternId: HatchPatternId,
  size: number
): Scene | null {
  const pattern = hatchPattern(patternId)
  if (!pattern) return null
  const repeat = Math.max(
    0,
    ...pattern.lines.flatMap((line) => [
      Math.abs(line.deltaY),
      line.dashes.reduce((run, dash) => run + Math.abs(dash), 0),
    ])
  )
  const square = [
    { x: 0, y: 0 },
    { x: SWATCH_SIDE, y: 0 },
    { x: SWATCH_SIDE, y: SWATCH_SIDE },
    { x: 0, y: SWATCH_SIDE },
  ]
  const white = { color: "7" }
  const hatch = {
    ...createHatch([{ vertices: square }], {
      patternId,
      patternScale: repeat > 0 ? SWATCH_SIDE / 3 / repeat : 1,
      id: SWATCH_IDS.hatch,
    }),
    ...white,
  }
  const frame = {
    ...createPolyline(square, true, undefined, undefined, SWATCH_IDS.frame),
    ...white,
  }
  const camera = previewCamera(
    { min: square[0], max: square[2] },
    size,
    size,
    0.5
  )
  return previewScene(document, camera, [hatch, frame], false)
}

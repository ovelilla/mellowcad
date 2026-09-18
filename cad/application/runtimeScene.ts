import { Vec2, V } from "../geometry/Vec2"
import { CadDocument } from "../domain/Document"
import { Entity } from "../domain/entities"
import { formatAngle, formatLength, unitSuffix } from "../domain/units"
import { Scene } from "../scene/types"
import { Viewport } from "./Viewport"
import { Selection } from "./Selection"
import { SnapMode } from "./SnapMode"
import { SelectionCycling } from "./SelectionCycling"
import { SnapResult } from "./snapping/types"
import { ParallelReferenceEngine } from "./snapping/ParallelReference"
import { ConstraintManager } from "./constraints/ConstraintManager"
import { ObjectSnapTrackingEngine } from "./tracking/ObjectSnapTrackingEngine"
import { TrackingResult } from "./tracking/types"
import { Tool, ToolContext } from "./tools/Tool"
import { buildScene, PolarGuideInput } from "./SceneBuilder"

export interface RuntimeSceneInput {
  readonly document: CadDocument
  readonly viewport: Viewport
  readonly selection: Selection
  readonly snapMode: SnapMode
  readonly constraints: ConstraintManager
  readonly tracking: ObjectSnapTrackingEngine
  readonly parallelRefs: ParallelReferenceEngine
  readonly cycling: SelectionCycling
  readonly activeTool: Tool
  readonly toolContext: ToolContext
  readonly gridVisible: boolean
  readonly snap: SnapResult | null
  readonly trackingResult: TrackingResult | null
  readonly crosshairScreen: Vec2 | null
  readonly cursorWorld: Vec2 | null
  readonly pointerShift: boolean
  /** Whether the Selection list box is open, which is what gets highlighted. */
  readonly cyclingListOpen: boolean
  readonly fromBase: Vec2 | null
}

/**
 * Builds the neutral scene for the current frame, from the runtime's live
 * interaction state. Called by the host when it is ready to draw; the runtime
 * never touches a rendering technology.
 */
export function buildRuntimeScene(input: RuntimeSceneInput): Scene {
  const { document, activeTool } = input
  return buildScene({
    camera: input.viewport,
    entities: document.getEntities(),
    layers: document.getLayers(),
    dimStyles: document.getDimStyles(),
    blocks: document.blockLookup(),
    selectedIds: new Set(input.selection.toArray()),
    hiddenIds: new Set(activeTool.hiddenEntityIds?.() ?? []),
    gridVisible: input.gridVisible,
    gridSpacing: input.snapMode.displaySpacing(),
    ltScale: document.getSettings().ltScale,
    lwDisplay: document.getSettings().lwDisplay,
    snap: input.snap,
    acquiredTrackingPoints: input.tracking.getAcquired(),
    tracking: input.trackingResult,
    parallelReferenceIds: input.parallelRefs.getAcquired(),
    toolOverlay: activeTool.buildOverlay?.(input.toolContext) ?? [],
    cursor: input.crosshairScreen ? { screen: input.crosshairScreen } : null,
    polar: buildPolarGuide(input),
    fromBase: input.fromBase,
    cyclingBadge: input.cycling.hasStack() ? input.crosshairScreen : null,
    cyclingHighlight: cyclingHighlight(input),
  })
}

/**
 * The object the Selection list box is currently offering, drawn amber like
 * every other prominent "which object?" pick. Only while the list is open:
 * hovering a stack merely shows the badge, as in AutoCAD, and the tool's own
 * rollover preview keeps answering which object a click would take.
 */
function cyclingHighlight(input: RuntimeSceneInput): Entity | null {
  if (!input.cyclingListOpen) return null
  const id = input.cycling.getCurrentId()
  return (id !== null ? input.document.get(id) : undefined) ?? null
}

/**
 * The polar tracking vector to draw for the current cursor: an alignment line
 * through the tool's anchor along the engaged polar angle, plus an AutoCAD
 * "Polar: <dist> < <angle>°" readout. `null` unless polar tracking is on, the
 * active tool has a base point, and the cursor is locked to an angle. Object
 * snap and OTRACK take precedence, so it is hidden while either engages.
 */
function buildPolarGuide(input: RuntimeSceneInput): PolarGuideInput | null {
  if (input.snap || input.trackingResult) return null
  // Shift temporarily forces Ortho, which suppresses polar tracking.
  if (input.pointerShift) return null
  if (input.cursorWorld === null) return null
  const anchor = input.activeTool.getConstraintAnchor?.() ?? null
  if (anchor === null) return null

  const context = {
    anchor,
    world: input.cursorWorld,
    snapPoint: null,
    point: input.cursorWorld,
  }
  const ray = input.constraints.polarGuideRay(context)
  if (!ray) return null

  const point = input.constraints.apply(context)
  const settings = input.document.getSettings()
  const length = V.length(V.sub(point, anchor))
  let deg = (Math.atan2(ray.dir.y, ray.dir.x) * 180) / Math.PI
  if (deg < 0) deg += 360
  const label = `Polar: ${formatLength(length, settings)}${unitSuffix(
    settings.unit
  )} < ${formatAngle(deg, settings)}°`
  return { origin: anchor, point, label }
}

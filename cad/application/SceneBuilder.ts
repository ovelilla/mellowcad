import { Vec2, V } from "../geometry/Vec2"
import { Vec3, scale3, withZOf, zOf } from "../geometry/Vec3"
import { axesToWorld } from "../geometry/ocs"
import { bsplinePoint, bsplineTessellation } from "../geometry/nurbs"
import {
  ArcEntity,
  AttributeDisplay,
  BlockLookup,
  CircleEntity,
  DimensionEntity,
  EllipseEntity,
  SplineEntity,
  SplineLength,
  Entity,
  EntityId,
  HatchEntity,
  LineEntity,
  PolylineEntity,
  ThickEntity,
  arcSweepAngle,
  attributeDefinitionText,
  dimensionGeometry,
  entityDrawOrder,
  entityAxes,
  entityElevation,
  entityNormal,
  entityThickness,
  hasThickness,
  isTilted,
  planeAxes,
  hatchGeometry,
  insertFlatGeometry,
  ellipseLengthTable,
  isFullEllipse,
  lineEndZ,
  lineStartZ,
  mtextLayout,
  mtextToWorld,
  isWidePolyline,
  polylineOutline,
  PolylineSegmentGeometry,
  polylineSegmentGeometries,
  splineLengthTable,
  splinePolyline,
  measureTextWidth,
  TEXT_FONT_CAP_RATIO,
  textAlong,
  textBaselinePoint,
} from "../domain/entities"
import {
  DEFAULT_DIM_STYLE,
  DEFAULT_DIM_STYLE_ID,
  DimStyle,
  DimStyleId,
} from "../domain/dimStyles"
import { polarPoint } from "../geometry/primitives"
import { Ucs, ucsPointToWorld, worldPointToUcs } from "../domain/ucs"
import { DEFAULT_LAYER_COLOR, Layer, LayerId } from "../domain/layers"
import { normalizeColor } from "../domain/colors"
import {
  DEFAULT_LINETYPE_ID,
  centredPattern,
  linetypePattern,
  loopPattern,
} from "../domain/linetypes"
import {
  DEFAULT_LINEWEIGHT,
  Lineweight,
  lineweightPixels,
} from "../domain/lineweights"
import {
  Scene,
  ScenePrimitive,
  CameraTransform,
  StrokeStyle,
  TextAlign,
} from "../scene/types"
import { DRAWING_FONT, drawnColor, THEME } from "../scene/theme"
import {
  PlaneCamera,
  affineEllipse,
  isPlaneCamera,
  planeCamera,
  smallestStretch,
} from "./planeCamera"
import { SnapResult } from "./snapping/types"
import { TrackingPoint, TrackingResult } from "./tracking/types"

/**
 * A small crosshair drawn in place of the OS cursor, positioned on the
 * *resolved* point so it visibly snaps ("sticks") to geometry. `null` when the
 * pointer is off the canvas.
 */
export interface CrosshairInput {
  readonly screen: Vec2
  /**
   * Whether the pick box shows at its centre: at `Command:` and wherever an
   * object is picked, not at a point prompt (desktop d03, d20).
   */
  readonly pickbox: boolean
}

/**
 * The polar tracking vector to draw for the current cursor: a dashed alignment
 * line through {@link origin} along the engaged polar angle, plus an AutoCAD
 * "Polar: <dist> < <angle>°" readout ({@link label}) beside the locked point.
 */
export interface PolarGuideInput {
  readonly origin: Vec2 | Vec3
  readonly point: Vec2 | Vec3
  readonly label: string
  /** The `+Z` / `-Z` path of a 3D view: the UCS's Z through {@link origin}. */
  readonly alongZ?: boolean
}

/** The UCS icon: where UCSICON puts it, and its axis letters in the command language. */
export interface UcsIconInput {
  readonly atOrigin: boolean
  /** Whether the UCS is the WCS, which the icon marks with a square at its origin. */
  readonly world: boolean
  readonly xLabel: string
  readonly yLabel: string
  readonly zLabel: string
}

/**
 * A command's badge beside the cursor: TRIM's red ✕ where a click trims
 * (desktop trim/d01-1, d03-1), the circle-and-slash where it is refused
 * (d09-1, d09-2), the padlock over a locked layer's object at `Command:`
 * (properties/d01-1), MATCHPROP's paintbrush at its destination prompt
 * (properties/d07-1).
 */
export type CursorBadge = "trim" | "refused" | "locked" | "paint"

/**
 * Everything needed to describe one frame. The builder is a pure function of
 * this input: same input, same scene — which makes rendering trivially
 * testable without any canvas.
 */
export interface SceneInput {
  readonly camera: CameraTransform
  /** The command language's tag, for {@link Scene.lang}. */
  readonly lang?: string
  /**
   * The camera the drawing aids are given in — the grid, the UCS icon, the
   * snap, tracking and polar guides, the FROM base: the frame of the UCS's XY
   * plane, which the tools work in. {@link camera} when left out.
   */
  readonly aidCamera?: CameraTransform
  readonly entities: readonly Entity[]
  /** Layer table, used to resolve each entity's colour and visibility. */
  readonly layers: readonly Layer[]
  /** Dimension styles, used to size a dimension's text, arrows and offsets. */
  readonly dimStyles: readonly DimStyle[]
  /** Block table, used to expand every block reference into its geometry. */
  readonly blocks: BlockLookup
  readonly selectedIds: ReadonlySet<EntityId>
  /** Entities the active tool is editing in place and draws itself. */
  readonly hiddenIds: ReadonlySet<EntityId>
  /** Entities drawn faded, never glowing: what ERASE will erase, what MOVE drags. */
  readonly fadedIds?: ReadonlySet<EntityId>
  readonly gridVisible: boolean
  /**
   * Lattice the grid must align to (the SNAP spacing), so every drawn
   * intersection is a point the cursor can land on. Null lets the grid pick a
   * spacing from the zoom level.
   */
  readonly gridSpacing: Vec2 | null
  /**
   * The grid lies on the UCS: its lines run along the UCS axes from its
   * origin. Given in the frame of {@link aidCamera}, where it is level.
   */
  readonly ucs: Ucs
  /** The UCS icon to draw, or `null` when UCSICON is off or a preview shows none. */
  readonly ucsIcon: UcsIconInput | null
  /** Global linetype scale (LTSCALE): multiplies every dash pattern length. */
  readonly ltScale: number
  /** Whether lineweights are drawn thick (LWDISPLAY) or everything hairline. */
  readonly lwDisplay: boolean
  /** FILLMODE: wide polylines filled, or their outline only. On when absent. */
  readonly fillMode?: boolean
  /** ATTMODE: which attributes block references show; Normal when absent. */
  readonly attributeDisplay?: AttributeDisplay
  readonly snap: SnapResult | null
  /**
   * The snap is a Tangent or Perpendicular deferred, found nowhere yet: its
   * glyph with three dots after it (desktop circle/d03).
   */
  readonly snapDeferred?: boolean
  /**
   * The object snap's name for the tooltip beside its marker, in the command
   * language — the scene describes what to draw, not which language it speaks.
   */
  readonly snapLabel: string
  readonly acquiredTrackingPoints: readonly TrackingPoint[]
  readonly tracking: TrackingResult | null
  /** Ids of lines acquired as Parallel references, marked with a `//` badge. */
  readonly parallelReferenceIds: ReadonlySet<EntityId>
  /** The active tool's transient preview, already in screen coordinates. */
  readonly toolOverlay: readonly ScenePrimitive[]
  /** The magnetic crosshair cursor, or `null` when off-canvas. */
  readonly cursor: CrosshairInput | null
  /** The polar tracking vector to draw, or `null` when polar is not engaged. */
  readonly polar: PolarGuideInput | null
  /** The FROM base point being offset from, or `null` when not in FROM. */
  readonly fromBase: Vec2 | null
  /**
   * Where to draw the selection-cycling badge (AutoCAD's double-rectangle icon
   * beside the cursor), or `null` when the pick box covers at most one object.
   */
  readonly cyclingBadge: Vec2 | null
  /**
   * Where to draw the minus badge saying Shift removes from the selection, or
   * `null` when Shift is up or would not remove.
   */
  readonly removeBadge: Vec2 | null
  /** The active command's badge beside the cursor, or `null` for none. */
  readonly cursorBadge?: {
    readonly at: Vec2
    readonly kind: CursorBadge
  } | null
  /** The object the open Selection list box is offering, or `null`. */
  readonly cyclingHighlight: Entity | null
}

/**
 * Builds the neutral, renderer-agnostic scene for one frame: grid, entities,
 * tracking guides, tool overlay and snap markers — in paint order. All
 * world→screen conversion happens here, so render adapters stay dumb.
 */
export function buildScene(input: SceneInput): Scene {
  const { camera } = input
  const aid = input.aidCamera ?? camera
  const primitives: ScenePrimitive[] = []

  if (input.gridVisible) {
    pushGrid(primitives, aid, input.gridSpacing, input.ucs)
  }
  pushEntities(
    primitives,
    camera,
    input.entities,
    input.layers,
    input.dimStyles,
    input.blocks,
    input.selectedIds,
    input.hiddenIds,
    input.fadedIds ?? NONE,
    input.ltScale,
    input.lwDisplay,
    input.attributeDisplay ?? "normal",
    input.fillMode ?? true
  )
  if (input.ucsIcon) {
    pushUcsIcon(primitives, aid, input.ucs, input.ucsIcon)
  }
  pushTracking(primitives, aid, input.acquiredTrackingPoints, input.tracking)
  pushParallelReferences(
    primitives,
    camera,
    input.entities,
    input.parallelReferenceIds
  )
  if (input.polar) pushPolarGuide(primitives, aid, input.polar)
  if (input.fromBase) {
    pushFromBase(primitives, aid.worldToScreen(input.fromBase), input.cursor)
  }
  primitives.push(...input.toolOverlay)
  if (input.cyclingHighlight) {
    primitives.push(
      ...entityScenePrimitive(
        camera,
        input.cyclingHighlight,
        { color: THEME.selected, width: GLOW_WIDTH },
        { blocks: input.blocks }
      )
    )
  }
  if (input.cursor) {
    pushCrosshair(primitives, camera.width, camera.height, input.cursor)
  }
  if (input.cyclingBadge) pushCyclingBadge(primitives, input.cyclingBadge)
  if (input.removeBadge) {
    pushRemoveBadge(primitives, input.removeBadge, input.cyclingBadge !== null)
  }
  if (input.cursorBadge?.kind === "trim") {
    pushTrimBadge(primitives, input.cursorBadge.at)
  } else if (input.cursorBadge?.kind === "refused") {
    pushRefusedBadge(primitives, input.cursorBadge.at)
  } else if (input.cursorBadge?.kind === "locked") {
    pushLockedBadge(primitives, input.cursorBadge.at)
  } else if (input.cursorBadge?.kind === "paint") {
    pushPaintBadge(primitives, input.cursorBadge.at)
  }
  if (input.tracking && !input.snap) {
    pushTrackedPointMarker(primitives, aid.worldToScreen(input.tracking.point))
  } else if (input.polar && !input.snap) {
    pushTrackedPointMarker(primitives, aid.worldToScreen(input.polar.point))
  }
  const marker = input.snap ? aid.worldToScreen(input.snap.point) : null
  if (input.snap && marker) {
    if (input.snap.direction) {
      pushAlignmentGuide(primitives, aid, input.snap, input.snap.direction)
    }
    if (input.snap.path) pushSnapPath(primitives, aid, input.snap.path)
    pushSnapMarker(primitives, marker, input.snap, input.snapDeferred)
  }
  const tooltipAt =
    input.cursor?.screen ??
    marker ??
    (input.polar ? aid.worldToScreen(input.polar.point) : null)
  if (tooltipAt) {
    pushCursorTooltips(primitives, tooltipAt, [
      ...(input.snap ? [input.snapLabel] : []),
      ...(input.polar ? [input.polar.label] : []),
    ])
  }

  return {
    width: camera.width,
    height: camera.height,
    background: THEME.background,
    lang: input.lang,
    primitives,
  }
}

function pushGrid(
  out: ScenePrimitive[],
  camera: CameraTransform,
  snapSpacing: Vec2 | null,
  ucs: Ucs
): void {
  const { width, height } = camera
  const plane = camera.isPlan ? camera : planeCamera(camera, ucs.origin.z)
  const scale = isPlaneCamera(plane) ? smallestStretch(plane) : camera.scale

  const minorX = gridStep(snapSpacing?.x ?? null, scale)
  const minorY = gridStep(snapSpacing?.y ?? null, scale)
  if (minorX === null || minorY === null) return // too dense to be useful

  // A coarser "major" grid every few subdivisions keeps it readable.
  const majorEvery = 5

  // The screen's corners in UCS coordinates bound the lines worth drawing.
  const corners = [
    { x: 0, y: 0 },
    { x: width, y: 0 },
    { x: 0, y: height },
    { x: width, y: height },
  ].map((corner) => worldPointToUcs(ucs, plane.screenToWorld(corner)))
  const minX = Math.min(...corners.map((c) => c.x))
  const maxX = Math.max(...corners.map((c) => c.x))
  const minY = Math.min(...corners.map((c) => c.y))
  const maxY = Math.max(...corners.map((c) => c.y))

  const startI = Math.floor(minX / minorX)
  const endI = Math.ceil(maxX / minorX)
  const startJ = Math.floor(minY / minorY)
  const endJ = Math.ceil(maxY / minorY)

  const minorStroke: StrokeStyle = { color: THEME.gridMinor, width: 1 }
  const majorStroke: StrokeStyle = { color: THEME.gridMajor, width: 1 }
  const line = (a: Vec2, b: Vec2, stroke: StrokeStyle) =>
    out.push(gridLine(plane, ucs, a, b, stroke))

  for (let i = startI; i <= endI; i++) {
    const x = i * minorX
    line(
      { x, y: minY },
      { x, y: maxY },
      i % majorEvery === 0 ? majorStroke : minorStroke
    )
  }
  for (let j = startJ; j <= endJ; j++) {
    const y = j * minorY
    line(
      { x: minX, y },
      { x: maxX, y },
      j % majorEvery === 0 ? majorStroke : minorStroke
    )
  }

  // The UCS axes through its origin, tinted as AutoCAD's grid tints them.
  if (minY <= 0 && maxY >= 0) {
    line({ x: minX, y: 0 }, { x: maxX, y: 0 }, { color: THEME.axisX, width: 1 })
  }
  if (minX <= 0 && maxX >= 0) {
    line({ x: 0, y: minY }, { x: 0, y: maxY }, { color: THEME.axisY, width: 1 })
  }
}

/**
 * A grid line from UCS points `a` to `b`. One that runs straight across the
 * screen is snapped to the pixel grid (+0.5) so it stays crisp.
 */
function gridLine(
  camera: CameraTransform,
  ucs: Ucs,
  a: Vec2,
  b: Vec2,
  stroke: StrokeStyle
): ScenePrimitive {
  const sa = camera.worldToScreen(ucsPointToWorld(ucs, a))
  const sb = camera.worldToScreen(ucsPointToWorld(ucs, b))
  if (Math.abs(sa.x - sb.x) < 1e-6) {
    const x = Math.round(sa.x) + 0.5
    return { kind: "segment", a: { x, y: sa.y }, b: { x, y: sb.y }, stroke }
  }
  if (Math.abs(sa.y - sb.y) < 1e-6) {
    const y = Math.round(sa.y) + 0.5
    return { kind: "segment", a: { x: sa.x, y }, b: { x: sb.x, y }, stroke }
  }
  return { kind: "segment", a: sa, b: sb, stroke }
}

/** Length of each arm of the UCS icon, in pixels. */
const UCS_ICON_ARM = 48
/** Clearance kept round the icon, and where it sits when the origin is out of view. */
const UCS_ICON_MARGIN = 20
/** Lifts the corner icon clear of the status readout pinned under it. */
const UCS_ICON_CORNER_LIFT = 64

/**
 * The UCS icon, AutoCAD 2027's default 3D one (desktop ucs/d07-1): its arms
 * in one colour with no arrowheads, each letter at its end, and a square at
 * the origin when the UCS is the WCS (d01-2). Off the plan a Z arm shows where
 * the UCS's Z does on the screen (d01-5, d01-7); an arm seen end-on is left
 * out, so the XY plane edge-on draws X and Z (d01-6). With UCSICON at ORigin
 * it sits on the origin while the whole icon fits in the view, and in the
 * lower-left corner otherwise.
 */
function pushUcsIcon(
  out: ScenePrimitive[],
  camera: CameraTransform,
  ucs: Ucs,
  icon: UcsIconInput
): void {
  const axes = ucsIconAxes(camera, ucs)
  if (!axes) return
  const { origin, xDir, yDir, zDir } = axes
  const dirs = [xDir, yDir, zDir]
  const fits = (at: Vec2) =>
    [at, ...dirs.map((dir) => V.add(at, V.scale(dir, UCS_ICON_ARM)))].every(
      (point) =>
        point.x >= UCS_ICON_MARGIN &&
        point.x <= camera.width - UCS_ICON_MARGIN &&
        point.y >= UCS_ICON_MARGIN &&
        point.y <= camera.height - UCS_ICON_MARGIN
    )
  const at =
    icon.atOrigin && fits(origin) ? origin : cornerPlacement(camera, dirs)

  const color = THEME.ucsIcon
  const arm = (dir: Vec2, letter: string) => {
    const length = V.length(dir)
    if (!(length > END_ON)) return
    const end = V.add(at, V.scale(dir, UCS_ICON_ARM))
    const unit = V.scale(dir, 1 / length)
    out.push(
      { kind: "segment", a: at, b: end, stroke: { color, width: 1 } },
      { kind: "label", at: V.add(end, V.scale(unit, 6)), text: letter, color }
    )
  }
  arm(xDir, icon.xLabel)
  arm(yDir, icon.yLabel)
  arm(zDir, icon.zLabel)
  if (icon.world && V.length(xDir) > END_ON && V.length(yDir) > END_ON) {
    const side = 7
    out.push({
      kind: "path",
      points: [
        at,
        V.add(at, V.scale(xDir, side)),
        V.add(V.add(at, V.scale(xDir, side)), V.scale(yDir, side)),
        V.add(at, V.scale(yDir, side)),
      ],
      closed: true,
      stroke: { color, width: 1 },
    })
  }
}

/** Below this an arm, the longest of unit length, is seen end-on: not drawn. */
const END_ON = 0.02

/**
 * The icon's origin on screen and its three arms as screen vectors, the
 * longest of unit length (the others foreshortened by the view; Z none in
 * plan), or `null` when the UCS cannot be drawn at all.
 */
function ucsIconAxes(
  camera: CameraTransform,
  ucs: Ucs
): { origin: Vec2; xDir: Vec2; yDir: Vec2; zDir: Vec2 } | null {
  const origin = camera.worldToScreen(ucs.origin)
  const none = { x: 0, y: 0 }
  if (camera.isPlan) {
    const tip = camera.worldToScreen(V.add(ucs.origin, ucs.xAxis))
    const length = V.distance(origin, tip)
    if (!(length > 0)) return null
    const xDir = V.scale(V.sub(tip, origin), 1 / length)
    // Y is a quarter turn CCW in the world, which the camera's flip makes CW.
    return { origin, xDir, yDir: { x: xDir.y, y: -xDir.x }, zDir: none }
  }
  const armOf = (direction: Vec3) =>
    V.sub(camera.worldToScreen(ucsPointToWorld(ucs, direction)), origin)
  const x = armOf({ x: 1, y: 0, z: 0 })
  const y = armOf({ x: 0, y: 1, z: 0 })
  const z = armOf({ x: 0, y: 0, z: 1 })
  const longest = Math.max(V.length(x), V.length(y), V.length(z))
  if (!(longest > 0)) return null
  return {
    origin,
    xDir: V.scale(x, 1 / longest),
    yDir: V.scale(y, 1 / longest),
    zDir: V.scale(z, 1 / longest),
  }
}

/** The lower-left spot for the icon, shifted so a turned icon stays in view. */
function cornerPlacement(camera: CameraTransform, dirs: readonly Vec2[]): Vec2 {
  const reach = [
    { x: 0, y: 0 },
    ...dirs.map((dir) => V.scale(dir, UCS_ICON_ARM)),
  ]
  const minX = Math.min(...reach.map((point) => point.x))
  const maxY = Math.max(...reach.map((point) => point.y))
  return {
    x: UCS_ICON_MARGIN - minX,
    y: camera.height - UCS_ICON_MARGIN - UCS_ICON_CORNER_LIFT - maxY,
  }
}

/** Below this the grid is drawn too tightly to read, so it is skipped. */
const MIN_GRID_PX = 8

/**
 * The world spacing to draw one axis of the grid at, or null when even the
 * coarsest choice would be unreadably dense. With SNAP on it is the snap
 * spacing (doubled as needed while zoomed out) so grid intersections stay
 * exactly the points the cursor lands on; otherwise it follows the zoom level.
 */
function gridStep(snapSpacing: number | null, scale: number): number | null {
  if (!(scale > 0)) return null
  if (snapSpacing !== null && snapSpacing > 0) {
    const pixels = snapSpacing * scale
    if (!(pixels > 0)) return null
    const doublings = Math.max(0, Math.ceil(Math.log2(MIN_GRID_PX / pixels)))
    return snapSpacing * Math.pow(2, doublings)
  }
  const step = niceSpacing(80 / scale)
  return step * scale < 4 ? null : step
}

/**
 * Picks a "nice" grid spacing (1, 2 or 5 × a power of ten) closest to, but not
 * exceeding, the requested world size. This keeps grid labels human-friendly.
 */ function niceSpacing(target: number): number {
  if (target <= 0 || !Number.isFinite(target)) return 1
  const pow = Math.pow(10, Math.floor(Math.log10(target)))
  const candidates = [1, 2, 5, 10].map((m) => m * pow)
  let best = candidates[0]
  for (const candidate of candidates) {
    if (candidate <= target) best = candidate
  }
  return best
}

/**
 * Builds an `arc` scene primitive for a world-space arc (CCW from `startAngle`
 * to `endAngle`). The camera flips Y, so a world-CCW sweep renders clockwise on
 * screen: the endpoint angles are recomputed in screen space and the Canvas
 * `counterclockwise` flag is set to match. Shared by entity drawing and the arc
 * tool's rubber-band preview so both stay consistent.
 */
export function arcScenePrimitive(
  camera: CameraTransform,
  center: Vec2,
  radius: number,
  startAngle: number,
  endAngle: number,
  stroke: StrokeStyle
): ScenePrimitive {
  if (!camera.isPlan) {
    const plane = isPlaneCamera(camera)
      ? camera
      : planeCamera(camera, zOf(center))
    const end = endAngle > startAngle ? endAngle : endAngle + Math.PI * 2
    return affineEllipse(
      plane,
      center,
      { x: radius, y: 0 },
      { x: 0, y: radius },
      { start: startAngle, end },
      stroke
    )
  }
  const c = camera.worldToScreen(center)
  const start = camera.worldToScreen({
    x: center.x + Math.cos(startAngle) * radius,
    y: center.y + Math.sin(startAngle) * radius,
  })
  const end = camera.worldToScreen({
    x: center.x + Math.cos(endAngle) * radius,
    y: center.y + Math.sin(endAngle) * radius,
  })
  return {
    kind: "arc",
    center: c,
    radius: Math.max(camera.worldToScreenDistance(radius), 0.01),
    startAngle: Math.atan2(start.y - c.y, start.x - c.x),
    endAngle: Math.atan2(end.y - c.y, end.x - c.x),
    counterclockwise: true,
    stroke,
  }
}

/**
 * Builds an `ellipse` scene primitive for a world-space ellipse or elliptical
 * arc. The camera flips Y, which both reverses the major axis's angle and runs
 * the parametrisation backwards — the minor axis is a quarter turn CCW from the
 * major in the world and a quarter turn CW on screen — so the parameters negate
 * and the Canvas `counterclockwise` flag is set to match, exactly as
 * {@link arcScenePrimitive} does for a circular arc. A full ellipse is emitted
 * as a plain 0..2π sweep, where the direction cannot show.
 */
export function ellipseScenePrimitive(
  camera: CameraTransform,
  ellipse: EllipseEntity,
  stroke: StrokeStyle
): ScenePrimitive {
  const full = isFullEllipse(ellipse)
  if (!camera.isPlan) {
    const plane = isPlaneCamera(camera)
      ? camera
      : planeCamera(camera, entityElevation(ellipse))
    const { majorAxis: major, ratio } = ellipse
    const start = ellipse.startParam ?? 0
    const end = ellipse.endParam ?? 0
    return affineEllipse(
      plane,
      ellipse.center,
      major,
      { x: -major.y * ratio, y: major.x * ratio },
      full ? null : { start, end: end > start ? end : end + Math.PI * 2 },
      stroke
    )
  }
  const center = camera.worldToScreen(ellipse.center)
  const tip = camera.worldToScreen(V.add(ellipse.center, ellipse.majorAxis))
  const radiusX = Math.max(V.distance(center, tip), 0.01)
  return {
    kind: "ellipse",
    center,
    radiusX,
    radiusY: Math.max(radiusX * ellipse.ratio, 0.01),
    rotation: Math.atan2(tip.y - center.y, tip.x - center.x),
    startAngle: full ? 0 : -ellipse.startParam!,
    endAngle: full ? Math.PI * 2 : -ellipse.endParam!,
    counterclockwise: !full,
    stroke,
  }
}

/**
 * The scene primitives drawing a single entity with the given stroke. Shared by
 * entity rendering and every tool's ghost preview, so a transformed arc is
 * drawn as an arc and a dimension ghost carries its extension lines, arrowheads
 * and measurement.
 *
 * Most entities are a single primitive; a dimension is an assembly of them,
 * which is why this returns a list. The display list stays **flat** — a nesting
 * "group" primitive would hide a dimension's parts from everything that reads
 * the scene back, the tests included.
 */
/**
 * The extra context an entity may need to draw itself: a dimension's style, and
 * the block table a reference is expanded through. Grouped so a call site that
 * only has one of them does not have to name the other.
 */
export interface EntityDrawOptions {
  readonly dimStyle?: DimStyle
  readonly blocks?: BlockLookup
  /** FILLMODE, for a wide polyline; on when absent. */
  readonly fill?: boolean
  /**
   * The stroke's dash is the object's linetype, which a line lays centred; a
   * ghost's dash is the editor's own and runs from the start.
   */
  readonly linetype?: boolean
}

export function entityScenePrimitive(
  camera: CameraTransform,
  entity: Entity,
  stroke: StrokeStyle,
  options: EntityDrawOptions = {}
): ScenePrimitive[] {
  if (
    (camera.isPlan && !isTilted(entity)) ||
    isPlaneCamera(camera) ||
    entity.type === "insert"
  ) {
    return planarPrimitives(camera, entity, stroke, options)
  }
  if (entity.type === "line")
    return linePrimitives(camera, entity, stroke, options)
  const elevation = entityElevation(entity)
  const thickness = entityThickness(entity)
  const axes = planeAxes(entity)
  const base = planarPrimitives(
    planeCamera(camera, elevation, axes),
    entity,
    stroke,
    options
  )
  if (thickness === 0 || !hasThickness(entity)) return base
  return [
    ...base,
    ...planarPrimitives(
      planeCamera(camera, elevation + thickness, axes),
      entity,
      stroke,
      options
    ),
    ...extrusionEdges(camera, entity, elevation, thickness).map(
      ([a, b]): ScenePrimitive => ({ kind: "segment", a, b, stroke })
    ),
  ]
}

/**
 * A line off the plan: each end at its own Z, and its thickness, along its
 * extrusion direction, as a quadrilateral.
 */
function linePrimitives(
  camera: CameraTransform,
  line: LineEntity,
  stroke: StrokeStyle,
  options: EntityDrawOptions
): ScenePrimitive[] {
  const startZ = lineStartZ(line)
  const endZ = lineEndZ(line)
  const thickness = entityThickness(line)
  const up = scale3(entityNormal(line), thickness)
  const at = (point: Vec2, z: number, lift = 0) =>
    camera.worldToScreen({
      x: point.x + up.x * lift,
      y: point.y + up.y * lift,
      z: z + up.z * lift,
    })
  const segment = (a: Vec2, b: Vec2) =>
    lineSegments(camera, a, b, stroke, options)
  const bottomStart = at(line.start, startZ)
  const bottomEnd = at(line.end, endZ)
  const bottom = segment(bottomStart, bottomEnd)
  if (thickness === 0) return bottom
  const topStart = at(line.start, startZ, 1)
  const topEnd = at(line.end, endZ, 1)
  return [
    ...bottom,
    ...segment(topStart, topEnd),
    ...segment(bottomStart, topStart),
    ...segment(bottomEnd, topEnd),
  ]
}

/**
 * A line drawn from `a` to `b` on the screen with its linetype laid as AutoCAD
 * lays a line's, centred ({@link centredPattern}): the dash phase on the
 * stroke, and an end dash longer than the pattern's first dash drawn as solid
 * pieces either side of the pattern.
 */
function lineSegments(
  camera: CameraTransform,
  a: Vec2,
  b: Vec2,
  stroke: StrokeStyle,
  options: EntityDrawOptions
): ScenePrimitive[] {
  const segment = (
    from: Vec2,
    to: Vec2,
    style: StrokeStyle
  ): ScenePrimitive => ({
    kind: "segment",
    a: from,
    b: to,
    stroke: style,
  })
  if (!options.linetype || !stroke.dash || stroke.dash.length === 0)
    return [segment(a, b, stroke)]
  const length = V.distance(a, b)
  // WHY the length as drawn, not the line's own: the dash array is not
  // foreshortened off the plan, so only the drawn length centres it there. In
  // plan the two are the same world length.
  const layout = centredPattern(
    stroke.dash.map((run) => run / camera.scale),
    length / camera.scale
  )
  const solid: StrokeStyle = { color: stroke.color, width: stroke.width }
  if (!layout) return [segment(a, b, solid)]
  if (layout.lead === 0) {
    const dashOffset = layout.offset * camera.scale
    return [segment(a, b, dashOffset > 0 ? { ...stroke, dashOffset } : stroke)]
  }
  const t = (layout.lead * camera.scale) / length
  const start = V.lerp(a, b, t)
  const end = V.lerp(a, b, 1 - t)
  return [
    segment(a, start, solid),
    segment(start, end, stroke),
    segment(end, b, solid),
  ]
}

/**
 * The edges joining an extruded object's two faces, in screen coordinates: one
 * at each end of an arc and at each vertex of a polyline. A circle has none.
 */
export function extrusionEdges(
  camera: CameraTransform,
  entity: ThickEntity,
  elevation: number,
  thickness: number
): [Vec2, Vec2][] {
  const points: Vec2[] =
    entity.type === "arc"
      ? [
          polarPoint(entity.center, entity.radius, entity.startAngle),
          polarPoint(entity.center, entity.radius, entity.endAngle),
        ]
      : entity.type === "polyline"
        ? [...entity.vertices]
        : []
  const axes = entityAxes(entity)
  const at = (point: Vec2, z: number) =>
    camera.worldToScreen(axesToWorld(axes, { x: point.x, y: point.y, z }))
  return points.map((point) => [
    at(point, elevation),
    at(point, elevation + thickness),
  ])
}

/**
 * An entity drawn in its own plane: through a plan camera, where every plane
 * looks the same, or through the camera of the entity's plane.
 */
function planarPrimitives(
  camera: CameraTransform,
  entity: Entity,
  stroke: StrokeStyle,
  options: EntityDrawOptions
): ScenePrimitive[] {
  switch (entity.type) {
    case "line":
      return lineSegments(
        camera,
        camera.worldToScreen(entity.start),
        camera.worldToScreen(entity.end),
        stroke,
        options
      )
    case "circle":
      return options.linetype && stroke.dash && stroke.dash.length > 0
        ? linetypedCircle(camera, entity, stroke)
        : [circleCurve(camera, entity, stroke)]
    case "arc":
      return options.linetype && stroke.dash && stroke.dash.length > 0
        ? linetypedArc(camera, entity, stroke)
        : [arcCurve(camera, entity, stroke)]
    case "ellipse":
      return options.linetype && stroke.dash && stroke.dash.length > 0
        ? linetypedEllipse(camera, entity, stroke)
        : [ellipseScenePrimitive(camera, entity, stroke)]
    case "spline":
      return options.linetype && stroke.dash && stroke.dash.length > 0
        ? linetypedSpline(camera, entity, stroke)
        : [splineCurvePath(camera, entity, stroke)]
    case "polyline":
      if (isWidePolyline(entity)) {
        // Filled only seen square on, as AutoCAD fills one only "parallel
        // to the current viewing direction".
        return widePolylinePrimitives(
          camera,
          entity,
          stroke,
          camera.isPlan && (options.fill ?? true)
        )
      }
      if (options.linetype && stroke.dash && stroke.dash.length > 0) {
        return linetypedPolyline(camera, entity, stroke, options)
      }
      // A straight polyline is one crisp path (mitred corners). One that
      // carries arc bulges is tessellated finely into the same path, so arcs
      // render everywhere a polyline is drawn — including transient ghosts.
      return [
        entity.bulges
          ? {
              kind: "path",
              points: polylinePathPoints(camera, entity),
              closed: false,
              stroke,
            }
          : {
              kind: "path",
              points: entity.vertices.map((v) => camera.worldToScreen(v)),
              closed: entity.closed,
              stroke,
            },
      ]
    case "text":
      // On the baseline the domain places by Arial's metrics (text/p302): a
      // font's em-box anchors (top, middle, bottom) fall elsewhere.
      return [
        textPrimitive(camera, textBaselinePoint(entity), entity.value, {
          height: entity.height,
          angle: entity.rotation,
          align: textAlong(entity.justify),
          color: stroke.color,
        }),
      ]
    case "mtext": {
      const layout = mtextLayout(entity)
      return layout.lines.map((line) =>
        textPrimitive(
          camera,
          mtextToWorld(entity, line.x, line.y),
          line.value,
          {
            height: entity.height,
            angle: entity.rotation,
            align: layout.align,
            color: stroke.color,
          }
        )
      )
    }
    case "attdef":
      return entityScenePrimitive(
        camera,
        attributeDefinitionText(entity),
        stroke,
        options
      )
    case "dimension":
      return dimensionPrimitives(
        camera,
        entity,
        stroke,
        options.dimStyle ?? DEFAULT_DIM_STYLE
      )
    case "hatch":
      return hatchPrimitives(camera, entity, stroke, options)
    case "insert":
      // A ghost or rollover draws the whole reference in one colour; the real
      // scene resolves each nested object's own appearance (see pushEntities).
      return options.blocks
        ? insertFlatGeometry(entity, options.blocks).flatMap((nested) =>
            entityScenePrimitive(camera, nested, stroke, options)
          )
        : []
  }
}

/**
 * A hatch: one filled path for a solid, otherwise the pattern's already-clipped
 * lines as ordinary segments. The boundary itself is not drawn — the objects it
 * was traced from are their own entities. With FILL off nothing is drawn,
 * SOLID or pattern (probe hatch/p341).
 */
function hatchPrimitives(
  camera: CameraTransform,
  hatch: HatchEntity,
  stroke: StrokeStyle,
  options: EntityDrawOptions
): ScenePrimitive[] {
  if (options.fill === false) return []
  // Cached per entity by the domain: clipping happens in world space, so the
  // result does not depend on the camera and panning and zooming are free.
  const geometry = hatchGeometry(hatch)
  if (geometry.rings.length === 0) return []
  if (geometry.solid) {
    const [first, ...rest] = geometry.rings
    return [
      {
        kind: "path",
        points: first.map((p) => camera.worldToScreen(p)),
        closed: true,
        subpaths: rest.map((ring) => ring.map((p) => camera.worldToScreen(p))),
        fill: stroke.color,
      },
    ]
  }
  // Pattern lines draw continuous whatever the object's linetype, in its
  // colour and lineweight (probe hatch/p340).
  const solid: StrokeStyle = { color: stroke.color, width: stroke.width }
  return geometry.lines.map(([a, b]) => {
    const from = camera.worldToScreen(a)
    // A dot is a run as long as the stroke is wide, as a linetype's dot is
    // drawn (`drawnDash`).
    const to = V.equals(a, b)
      ? { x: from.x + Math.max(stroke.width, 1), y: from.y }
      : camera.worldToScreen(b)
    return { kind: "segment" as const, a: from, b: to, stroke: solid }
  })
}

/**
 * The line work, arrowheads and measurement of a dimension. Everything is
 * derived from the definition points, so the drawn number can never disagree
 * with the geometry.
 */
function dimensionPrimitives(
  camera: CameraTransform,
  dim: DimensionEntity,
  stroke: StrokeStyle,
  style: DimStyle
): ScenePrimitive[] {
  const g = dimensionGeometry(dim, style)
  const screen = (p: Vec2) => camera.worldToScreen(p)
  const segment = (a: Vec2, b: Vec2): ScenePrimitive => ({
    kind: "segment",
    a: screen(a),
    b: screen(b),
    stroke,
  })

  const primitives: ScenePrimitive[] = [
    ...g.lines.map((line) => segment(line[0], line[1])),
    // An angular dimension draws its dimension line as an arc between the
    // extension lines; every other kind draws it straight.
    g.arc
      ? arcScenePrimitive(
          camera,
          g.arc.center,
          g.arc.radius,
          g.arc.startAngle,
          g.arc.endAngle,
          stroke
        )
      : segment(g.lineStart, g.lineEnd),
  ]
  for (const arrow of g.arrows) {
    if (arrow.length < 3) continue
    // Solid, never outlined: AutoCAD's closed-filled arrowhead is a fill, and
    // stroking a 3:1 point makes its mitre join spike past the tip.
    primitives.push({
      kind: "path",
      points: arrow.map(screen),
      closed: true,
      fill: stroke.color,
    })
  }
  primitives.push(
    textPrimitive(camera, g.textPosition, g.text, {
      height: g.textHeight,
      angle: g.textAngle,
      align: "center",
      // The measurement sits on top of the dimension line, ISO's DIMTAD 1, with
      // DIMGAP between the two. That gap is measured to the *glyphs*, so the
      // point is on the baseline (as every text primitive's): an em box's
      // bottom has descender space digits never use, and the extra height
      // pushed the number across the neighbouring dimension line of a baseline
      // chain (DIMTXT + DIMGAP is deliberately only just under DIMDLI).
      color: stroke.color,
    })
  )
  return primitives
}

interface TextLook {
  readonly height: number
  readonly angle: number
  readonly align: TextAlign
  readonly color: string
}

/**
 * A drawing's text at a world point, `height` tall and turned `angle` in its
 * plane. Off the plan the plane's camera maps the text's own frame, so it
 * leans as its plane does.
 */
function textPrimitive(
  camera: CameraTransform,
  at: Vec2,
  text: string,
  look: TextLook
): ScenePrimitive {
  const { height, angle, align, color } = look
  if (!isPlaneCamera(camera)) {
    return {
      kind: "text",
      at: camera.worldToScreen(at),
      text,
      height: Math.max(camera.worldToScreenDistance(height), 0.01),
      rotation: screenRotation(camera, angle),
      align,
      color,
    }
  }
  const pixels = camera.worldToScreenDistance(1)
  const along = mapped(camera, { x: Math.cos(angle), y: Math.sin(angle) })
  const down = mapped(camera, { x: Math.sin(angle), y: -Math.cos(angle) })
  return {
    kind: "text",
    at: camera.worldToScreen(at),
    text,
    height: Math.max(height * pixels, 0.01),
    rotation: 0,
    matrix: [
      along.x / pixels,
      along.y / pixels,
      down.x / pixels,
      down.y / pixels,
    ],
    align,
    color,
  }
}

/** A direction of the plane on screen, in pixels per unit. */
function mapped(camera: PlaneCamera, direction: Vec2): Vec2 {
  const [a, b, c, d] = camera.linear
  return {
    x: a * direction.x + c * direction.y,
    y: b * direction.x + d * direction.y,
  }
}

/**
 * A world angle as a screen rotation: measured from the direction the view
 * draws pointing right, and clockwise, because the camera flips Y.
 */
function screenRotation(camera: CameraTransform, radians: number): number {
  return -(radians - camera.twist)
}

/**
 * A wide polyline: each band filled — or, with FILLMODE off or off the plan,
 * outlined —, a joint's wedge with it, and a segment of no width as its
 * centreline. The fill is solid whatever the linetype (PLINEGEN's dashed
 * bands are not drawn).
 */
function widePolylinePrimitives(
  camera: CameraTransform,
  poly: PolylineEntity,
  stroke: StrokeStyle,
  filled: boolean
): ScenePrimitive[] {
  const tolerance = 0.25 / camera.worldToScreenDistance(1)
  const { bands, wedges, bare } = polylineOutline(poly, tolerance)
  const screen = (ring: readonly Vec2[]) =>
    ring.map((p) => camera.worldToScreen(p))
  const out: ScenePrimitive[] = []
  const solid: StrokeStyle = { color: stroke.color, width: stroke.width }
  for (const band of bands) {
    out.push(
      filled
        ? // The hairline keeps a band thinner than a pixel in sight.
          {
            kind: "path",
            points: screen(band),
            closed: true,
            fill: stroke.color,
            stroke: solid,
          }
        : { kind: "path", points: screen(band), closed: true, stroke }
    )
  }
  for (const wedge of wedges) {
    out.push(
      filled
        ? {
            kind: "path",
            points: screen(wedge),
            closed: true,
            fill: stroke.color,
            stroke: solid,
          }
        : {
            kind: "path",
            points: screen(wedge.slice(1)),
            closed: false,
            stroke,
          }
    )
  }
  for (const segment of bare) {
    out.push(
      segment.kind === "line"
        ? {
            kind: "segment",
            a: camera.worldToScreen(segment.a),
            b: camera.worldToScreen(segment.b),
            stroke,
          }
        : arcScenePrimitive(
            camera,
            segment.center,
            segment.radius,
            segment.startAngle,
            segment.endAngle,
            stroke
          )
    )
  }
  return out
}

/**
 * Screen-space points tracing a polyline that has arc segments, with each arc
 * densified into short chords (~11° facets) so the `path` primitive renders a
 * smooth curve. Straight segments contribute just their endpoint.
 */
function polylinePathPoints(
  camera: CameraTransform,
  poly: PolylineEntity
): Vec2[] {
  const segments = polylineSegmentGeometries(poly)
  if (segments.length === 0) {
    return poly.vertices.map((v) => camera.worldToScreen(v))
  }
  const points: Vec2[] = [camera.worldToScreen(segments[0].a)]
  for (const seg of segments) {
    if (seg.kind === "line") {
      points.push(camera.worldToScreen(seg.b))
      continue
    }
    points.push(...arcSegmentPoints(camera, seg).slice(1))
  }
  return points
}

/** An arc segment's points on the screen, from its start to its end. */
function arcSegmentPoints(
  camera: CameraTransform,
  seg: Extract<PolylineSegmentGeometry, { kind: "arc" }>
): Vec2[] {
  const theta = 4 * Math.atan(seg.bulge) // signed sweep from a to b
  const startAngle = Math.atan2(seg.a.y - seg.center.y, seg.a.x - seg.center.x)
  const steps = Math.max(2, Math.ceil(Math.abs(theta) / (Math.PI / 16)))
  const points: Vec2[] = []
  for (let i = 0; i <= steps; i++) {
    const angle = startAngle + theta * (i / steps)
    points.push(camera.worldToScreen(polarPoint(seg.center, seg.radius, angle)))
  }
  return points
}

/**
 * A polyline with its linetype, PLINEGEN 0 (PEDIT's Ltype gen off, help
 * GUID-648BDC21): each straight segment laid as a line of its length is,
 * centred, the dashes either side of a vertex merging (probe pline/p232); an
 * arc segment runs its pattern from its start (**unverified**).
 */
function linetypedPolyline(
  camera: CameraTransform,
  poly: PolylineEntity,
  stroke: StrokeStyle,
  options: EntityDrawOptions
): ScenePrimitive[] {
  return polylineSegmentGeometries(poly).flatMap((seg): ScenePrimitive[] =>
    seg.kind === "line"
      ? lineSegments(
          camera,
          camera.worldToScreen(seg.a),
          camera.worldToScreen(seg.b),
          stroke,
          options
        )
      : [
          {
            kind: "path",
            points: arcSegmentPoints(camera, seg),
            closed: false,
            stroke,
          },
        ]
  )
}

/**
 * More periods than this along one circle, arc or ellipse and its pattern is
 * left to the renderer on a single curve, unfitted: drawn dash by dash, a huge circle
 * zoomed into would be tens of thousands of primitives, most off the screen,
 * and at that count the fit cannot be seen.
 */
const MAX_FITTED_PERIODS = 2048

/** A whole circle as one curve: a circle in plan, an ellipse through its plane's camera. */
function circleCurve(
  camera: CameraTransform,
  circle: CircleEntity,
  stroke: StrokeStyle
): ScenePrimitive {
  if (isPlaneCamera(camera)) {
    return affineEllipse(
      camera,
      circle.center,
      { x: circle.radius, y: 0 },
      { x: 0, y: circle.radius },
      null,
      stroke
    )
  }
  return {
    kind: "circle",
    center: camera.worldToScreen(circle.center),
    radius: Math.max(camera.worldToScreenDistance(circle.radius), 0.01),
    stroke,
  }
}

/**
 * A circle's linetype laid as AutoCAD lays it ({@link loopPattern}): from its
 * start, its OCS X, counter-clockwise about its normal, in whole stretched
 * periods (circle/p230–p233). Each dash is an arc of the circle, so a tilted
 * one is laid at true length in its plane and both presenters draw it
 * unpatterned. Under one period it is solid.
 */
function linetypedCircle(
  camera: CameraTransform,
  circle: CircleEntity,
  stroke: StrokeStyle
): ScenePrimitive[] {
  const pattern = (stroke.dash ?? []).map((run) => run / camera.scale)
  const layout = loopPattern(pattern, 2 * Math.PI * circle.radius)
  const solid: StrokeStyle = { color: stroke.color, width: stroke.width }
  if (!layout) return [circleCurve(camera, circle, solid)]
  if (layout.periods > MAX_FITTED_PERIODS)
    return [circleCurve(camera, circle, stroke)]
  return loopDashes(layout, stroke.width / camera.scale).map(([a, b]) =>
    arcScenePrimitive(
      camera,
      circle.center,
      circle.radius,
      a / circle.radius,
      b / circle.radius,
      solid
    )
  )
}

/**
 * Where a loop's dashes lie along it ({@link loopPattern}'s layout), as
 * `[from, to]` from its start. A dot is drawn as a line draws one
 * (`drawnDash`): a run as long as the stroke is wide (`dot`), taken from the
 * gap after it.
 */
function loopDashes(
  layout: { readonly runs: readonly number[]; readonly periods: number },
  dot: number
): [number, number][] {
  const { runs } = layout
  const dashes: [number, number][] = []
  let at = 0
  for (let period = 0; period < layout.periods; period++) {
    for (let i = 0; i < runs.length; i++) {
      if (i % 2 === 0) {
        const run = runs[i] > 0 ? runs[i] : Math.min(dot, runs[i + 1] ?? dot)
        dashes.push([at, at + run])
      }
      at += runs[i]
    }
  }
  return dashes
}

function arcCurve(
  camera: CameraTransform,
  arc: ArcEntity,
  stroke: StrokeStyle
): ScenePrimitive {
  return arcScenePrimitive(
    camera,
    arc.center,
    arc.radius,
    arc.startAngle,
    arc.endAngle,
    stroke
  )
}

/**
 * An arc's linetype laid as AutoCAD lays it: centred over its length as a
 * line's is ({@link centredPattern}; arc/p200, desktop arc/d10), so it begins
 * and ends on a dash of the same length, and solid under one period. Each dash
 * is a piece of the arc (ARC-D6), true in any view; past
 * {@link MAX_FITTED_PERIODS} the pattern is left to the renderer on one curve.
 */
function linetypedArc(
  camera: CameraTransform,
  arc: ArcEntity,
  stroke: StrokeStyle
): ScenePrimitive[] {
  const pattern = (stroke.dash ?? []).map((run) => run / camera.scale)
  const length = arc.radius * arcSweepAngle(arc)
  const layout = centredPattern(pattern, length)
  const solid: StrokeStyle = { color: stroke.color, width: stroke.width }
  if (!layout) return [arcCurve(camera, arc, solid)]
  const period = pattern.reduce((sum, run) => sum + run, 0)
  if (length / period > MAX_FITTED_PERIODS)
    return [arcCurve(camera, arc, stroke)]
  return centredDashes(
    pattern,
    length,
    layout,
    stroke.width / camera.scale
  ).map(([a, b]) =>
    arcScenePrimitive(
      camera,
      arc.center,
      arc.radius,
      arc.startAngle + a / arc.radius,
      arc.startAngle + b / arc.radius,
      solid
    )
  )
}

/**
 * Where a curve's dashes lie along its `length` when its pattern is centred
 * ({@link centredPattern}'s layout), as `[from, to]` from its start; a dot
 * is a run as wide as the stroke (`dot`).
 */
function centredDashes(
  pattern: readonly number[],
  length: number,
  layout: { readonly offset: number; readonly lead: number },
  dot: number
): [number, number][] {
  const from = layout.lead
  const to = length - layout.lead
  const dashes: [number, number][] = []
  let at = from - layout.offset
  while (at < to - 1e-9) {
    for (let i = 0; i < pattern.length && at < to - 1e-9; i++) {
      if (i % 2 === 0) {
        const run =
          pattern[i] > 0 ? pattern[i] : Math.min(dot, pattern[i + 1] ?? dot)
        const a = Math.max(at, from)
        const b = Math.min(at + run, to)
        if (b > a) dashes.push([a, b])
      }
      at += pattern[i]
    }
  }
  // An end dash longer than the pattern's first is the pattern's own first
  // dash with the solid lead before it.
  if (dashes.length > 0) {
    dashes[0][0] = 0
    dashes[dashes.length - 1][1] = length
  }
  return dashes
}

/**
 * An ellipse's linetype laid as AutoCAD lays it (ellipse/p330, measured on
 * the plot): a whole one as a circle's ({@link loopPattern}), from its start
 * (parameter 0) counter-clockwise about its normal in whole stretched
 * periods; an elliptical arc as an arc's, centred over its length
 * ({@link centredPattern}); solid under one period. Each dash is a piece of
 * the ellipse, found by its length along it ({@link ellipseLengthTable});
 * past {@link MAX_FITTED_PERIODS} the pattern is left to the renderer.
 */
function linetypedEllipse(
  camera: CameraTransform,
  ellipse: EllipseEntity,
  stroke: StrokeStyle
): ScenePrimitive[] {
  const pattern = (stroke.dash ?? []).map((run) => run / camera.scale)
  const along = ellipseLengthTable(ellipse)
  const solid: StrokeStyle = { color: stroke.color, width: stroke.width }
  const dot = stroke.width / camera.scale
  let dashes: [number, number][]
  if (isFullEllipse(ellipse)) {
    const layout = loopPattern(pattern, along.length)
    if (!layout) return [ellipseScenePrimitive(camera, ellipse, solid)]
    if (layout.periods > MAX_FITTED_PERIODS)
      return [ellipseScenePrimitive(camera, ellipse, stroke)]
    dashes = loopDashes(layout, dot)
  } else {
    const layout = centredPattern(pattern, along.length)
    if (!layout) return [ellipseScenePrimitive(camera, ellipse, solid)]
    const period = pattern.reduce((sum, run) => sum + run, 0)
    if (along.length / period > MAX_FITTED_PERIODS)
      return [ellipseScenePrimitive(camera, ellipse, stroke)]
    dashes = centredDashes(pattern, along.length, layout, dot)
  }
  // A dash is drawn, not stored: its range is no object's.
  return dashes.map(([a, b]) =>
    ellipseScenePrimitive(
      camera,
      { ...ellipse, startParam: along.paramAt(a), endParam: along.paramAt(b) },
      solid
    )
  )
}

/**
 * Canvas and SVG have no NURBS, and a degree above 3 fits no Bézier: the
 * curve is chopped finely enough that a chord never strays a quarter of a
 * pixel from it, at whatever zoom.
 */
function splineTolerance(camera: CameraTransform): number {
  return 0.25 / camera.worldToScreenDistance(1)
}

function splineCurvePath(
  camera: CameraTransform,
  spline: SplineEntity,
  stroke: StrokeStyle
): ScenePrimitive {
  return {
    kind: "path",
    points: splinePolyline(spline, splineTolerance(camera)).map((p) =>
      camera.worldToScreen(p)
    ),
    closed: false,
    stroke,
  }
}

/**
 * A spline's linetype laid as AutoCAD lays it (spline/p328, measured on the
 * plot): centred over its length as a line's is ({@link centredPattern}),
 * open or closed — a closed one is no circle, and one dash runs across its
 * start — and solid under one period. Each dash is a piece of the curve,
 * found by its length along it ({@link splineLengthTable}) and tessellated
 * as the whole curve is; past {@link MAX_FITTED_PERIODS} the pattern is left
 * to the renderer.
 */
function linetypedSpline(
  camera: CameraTransform,
  spline: SplineEntity,
  stroke: StrokeStyle
): ScenePrimitive[] {
  const pattern = (stroke.dash ?? []).map((run) => run / camera.scale)
  const along = splineLengthOf(spline)
  const solid: StrokeStyle = { color: stroke.color, width: stroke.width }
  const layout = centredPattern(pattern, along.length)
  if (!layout) return [splineCurvePath(camera, spline, solid)]
  const period = pattern.reduce((sum, run) => sum + run, 0)
  if (along.length / period > MAX_FITTED_PERIODS)
    return [splineCurvePath(camera, spline, stroke)]
  const dashes = centredDashes(
    pattern,
    along.length,
    layout,
    stroke.width / camera.scale
  )
  const { curve } = along
  const { params, points } = bsplineTessellation(curve, splineTolerance(camera))
  const piece = (from: number, to: number): Vec2[] => {
    const run = [bsplinePoint(curve, from)]
    let i = firstAbove(params, from)
    for (; i < params.length && params[i] < to; i++) run.push(points[i])
    run.push(bsplinePoint(curve, to))
    return run
  }
  const runs = dashes.map(([a, b]) => piece(along.paramAt(a), along.paramAt(b)))
  // The dashes at either end of a closed one are one dash across its start.
  if (spline.closed && runs.length > 1) {
    const last = runs.pop()!
    runs[0] = [...last, ...runs[0].slice(1)]
  }
  return runs.map((run) => ({
    kind: "path",
    points: run.map((p) => camera.worldToScreen(p)),
    closed: false,
    stroke: solid,
  }))
}

/**
 * Cached as a hatch's geometry is: measuring the curve is the costly part of
 * its dashes and depends only on the (immutable) entity, not on the camera.
 */
const splineLengthCache = new WeakMap<SplineEntity, SplineLength>()

function splineLengthOf(spline: SplineEntity): SplineLength {
  const cached = splineLengthCache.get(spline)
  if (cached) return cached
  const along = splineLengthTable(spline)
  splineLengthCache.set(spline, along)
  return along
}

/** The index of the first of the ascending `values` above `value`. */
function firstAbove(values: readonly number[], value: number): number {
  let low = 0
  let high = values.length
  while (low < high) {
    const mid = (low + high) >> 1
    if (values[mid] <= value) low = mid + 1
    else high = mid
  }
  return low
}

function pushEntities(
  out: ScenePrimitive[],
  camera: CameraTransform,
  entities: readonly Entity[],
  layers: readonly Layer[],
  dimStyles: readonly DimStyle[],
  blocks: BlockLookup,
  selectedIds: ReadonlySet<EntityId>,
  hiddenIds: ReadonlySet<EntityId>,
  fadedIds: ReadonlySet<EntityId>,
  ltScale: number,
  lwDisplay: boolean,
  attributeDisplay: AttributeDisplay,
  fillMode: boolean
): void {
  const layerById = new Map<LayerId, Layer>()
  for (const layer of layers) layerById.set(layer.id, layer)
  const dimStyleById = new Map<DimStyleId, DimStyle>()
  for (const style of dimStyles) dimStyleById.set(style.id, style)

  // Hatches paint first (HPDRAWORDER 3, "send behind boundary"), so a fill
  // never covers the outline it was traced from.
  const ordered = [...entities].sort(
    (a, b) => entityDrawOrder(a) - entityDrawOrder(b)
  )

  const draw = (
    entity: Entity,
    isSelected: boolean,
    isFaded: boolean,
    inLocked = false
  ) => {
    const layer = layerById.get(entity.layerId)
    // Entities on a hidden (Off) layer are not drawn at all.
    if (layer && !layer.visible) return
    const locked = inLocked || layer?.locked === true
    const drawn = entityStroke(
      camera,
      entity,
      layer,
      { ltScale, lwDisplay },
      isFaded
    )
    const stroke =
      locked && !isFaded
        ? { ...drawn, color: fadedColor(drawn.color, LOCKED_LAYER_OPACITY) }
        : drawn
    if (entity.type === "insert") {
      // Each object inside the block keeps its own colour, linetype and
      // lineweight, so a reference is not painted flat: the reference's layer
      // only reaches the ones drawn on layer 0, which `insertFlatGeometry`
      // has already resolved.
      for (const nested of insertFlatGeometry(
        entity,
        blocks,
        attributeDisplay
      )) {
        draw(nested, isSelected, isFaded, locked)
      }
      return
    }
    const options = {
      fill: fillMode,
      linetype: true,
      dimStyle:
        entity.type === "dimension"
          ? (dimStyleById.get(entity.styleId) ??
            dimStyleById.get(DEFAULT_DIM_STYLE_ID) ??
            DEFAULT_DIM_STYLE)
          : undefined,
    }
    out.push(...entityScenePrimitive(camera, entity, stroke, options))
    if (isSelected && !isFaded) {
      out.push(...selectionGlow(camera, entity, stroke, options))
    }
  }

  for (const entity of ordered) {
    if (hiddenIds.has(entity.id)) continue
    draw(entity, selectedIds.has(entity.id), fadedIds.has(entity.id))
  }
}

const NONE: ReadonlySet<EntityId> = new Set()

/**
 * How the drawing strokes `entity` on `layer`: its colour, or ERASE's faded
 * one, its lineweight and its linetype at this zoom. A tool drawing a piece
 * of an object as the object is drawn (TRIM's ghost) strokes it so too.
 */
export function entityStroke(
  camera: CameraTransform,
  entity: Entity,
  layer: Layer | undefined,
  look: { readonly ltScale: number; readonly lwDisplay: boolean },
  faded = false
): StrokeStyle {
  // Resolve the linetype ByObject → ByLayer, then turn its world-unit pattern
  // into a screen-pixel dash (scaled by LTSCALE and the current zoom).
  const linetypeId = entity.linetype ?? layer?.linetype ?? DEFAULT_LINETYPE_ID
  const dash = dashFor(linetypeId, look.ltScale, camera.scale)
  const lineweight =
    entity.lineweight ?? layer?.lineweight ?? DEFAULT_LINEWEIGHT
  // "Wide polylines display lineweights only when displayed outside of
  // plan view": in plan their width is what they show.
  const wideInPlan =
    entity.type === "polyline" &&
    isWidePolyline(entity) &&
    camera.isPlan &&
    !isTilted(entity)
  const color = drawnColor(entity.color ?? layer?.color ?? DEFAULT_LAYER_COLOR)
  return {
    color: faded ? fadedColor(color) : color,
    width: widthFor(lineweight, look.lwDisplay && !wideInPlan),
    ...(dash ? { dash } : {}),
  }
}

/**
 * AutoCAD's selection effect over an object drawn with `stroke`: the object
 * as it is, glowing blue (desktop d15).
 */
export function selectionGlow(
  camera: CameraTransform,
  entity: Entity,
  stroke: StrokeStyle,
  options: EntityDrawOptions = {}
): ScenePrimitive[] {
  return entityScenePrimitive(
    camera,
    entity,
    { color: THEME.selected, width: stroke.width + GLOW_WIDTH - 1 },
    { ...options, linetype: false }
  )
}

/**
 * How much of an object's colour AutoCAD's erase preview keeps: its faded line
 * peaks at 69 over the background's 33 where a plain one reaches 201 (desktop
 * erase/d09-2), about a fifth.
 */
const FADED_OPACITY = 0.22

/**
 * How much of its colour a locked layer's object keeps: LAYLOCKFADECTL's 50,
 * its default (p00), fades it half way into the background (desktop
 * properties/d00-2). LAYLOCKFADECTL cannot be typed here.
 */
const LOCKED_LAYER_OPACITY = 0.5

/** An object's colour as ERASE's preview fades it, or as `opacity` keeps it. */
export function fadedColor(
  color: string,
  opacity: number = FADED_OPACITY
): string {
  const hex = normalizeColor(color) ?? THEME.entity
  const [r, g, b] = [1, 3, 5].map((at) =>
    Number.parseInt(hex.slice(at, at + 2), 16)
  )
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

/** The hairline width every entity gets before its lineweight is applied. */
const HAIRLINE_WIDTH = 1.25

/** How wide the selection's blue glow is drawn over a hairline (desktop d15: 5 px). */
const GLOW_WIDTH = 5

/**
 * The stroke width for an entity: its lineweight rendered at real thickness
 * when LWDISPLAY is on, hairline otherwise.
 */
function widthFor(lineweight: Lineweight, lwDisplay: boolean): number {
  return lwDisplay
    ? lineweightPixels(lineweight, HAIRLINE_WIDTH)
    : HAIRLINE_WIDTH
}

/**
 * Converts a linetype's world-unit dash pattern into a screen-pixel dash array,
 * scaled by LTSCALE and the current zoom so dashes keep a constant drawing size.
 * Returns undefined for a solid line, or when the whole pattern would collapse
 * to sub-pixel dashes (drawn solid to avoid a smeared, slow-to-render line).
 */
function dashFor(
  linetypeId: string,
  ltScale: number,
  scale: number
): number[] | undefined {
  const pattern = linetypePattern(linetypeId)
  if (pattern.length === 0) return undefined
  const factor = ltScale * scale
  const dash = pattern.map((run) => run * factor)
  const total = dash.reduce((sum, run) => sum + run, 0)
  if (total < 2) return undefined
  return dash
}

function pushTracking(
  out: ScenePrimitive[],
  camera: CameraTransform,
  acquired: readonly TrackingPoint[],
  tracking: TrackingResult | null
): void {
  if (acquired.length === 0 && !tracking) return

  // An acquired point is a small green plus (desktop d13).
  const stroke: StrokeStyle = { color: THEME.trackingSolid, width: 1 }
  for (const p of acquired) {
    pushPlus(out, pixelCentre(camera.worldToScreen(p.origin)), 5, stroke)
  }

  // Active alignment guides: long dashed lines through the acquired point.
  if (tracking) {
    const big = 1e6
    const guideStroke: StrokeStyle = {
      color: THEME.tracking,
      width: 1,
      dash: GUIDE_DASH,
    }
    for (const guide of tracking.guides) {
      if (guide.kind === "z") {
        out.push({
          kind: "segment",
          ...alongZOnScreen(camera, guide.point.origin),
          stroke: guideStroke,
        })
        continue
      }
      out.push({
        kind: "segment",
        a: camera.worldToScreen(
          withZOf(
            V.sub(guide.point.origin, V.scale(guide.dir, big)),
            guide.point.origin
          )
        ),
        b: camera.worldToScreen(
          withZOf(
            V.add(guide.point.origin, V.scale(guide.dir, big)),
            guide.point.origin
          )
        ),
        stroke: guideStroke,
      })
    }
  }
}

/**
 * Marks each line acquired as a Parallel reference with a small `//` badge near
 * its midpoint — AutoCAD's cue that the line's direction has been picked up, so
 * only these lines offer a parallel.
 */
function pushParallelReferences(
  out: ScenePrimitive[],
  camera: CameraTransform,
  entities: readonly Entity[],
  ids: ReadonlySet<EntityId>
): void {
  if (ids.size === 0) return
  const stroke: StrokeStyle = { color: THEME.trackingSolid, width: 1.25 }
  for (const entity of entities) {
    if (entity.type !== "line" || !ids.has(entity.id)) continue
    const mid = camera.worldToScreen({
      x: (entity.start.x + entity.end.x) / 2,
      y: (entity.start.y + entity.end.y) / 2,
      z: (lineStartZ(entity) + lineEndZ(entity)) / 2,
    })
    const c = { x: Math.round(mid.x) + 0.5, y: Math.round(mid.y) + 0.5 }
    const s = 5
    for (const dx of [-2, 2]) {
      out.push({
        kind: "segment",
        a: { x: c.x + dx - s / 2, y: c.y + s },
        b: { x: c.x + dx + s / 2, y: c.y - s },
        stroke,
      })
    }
  }
}

/**
 * Marks the FROM base point with a small cross and rubber-bands it to the
 * cursor, so it is obvious the next point is measured from there.
 */
function pushFromBase(
  out: ScenePrimitive[],
  base: Vec2,
  cursor: CrosshairInput | null
): void {
  const stroke: StrokeStyle = { color: THEME.trackingSolid, width: 1.25 }
  const c = { x: Math.round(base.x) + 0.5, y: Math.round(base.y) + 0.5 }
  const s = 5
  out.push({
    kind: "segment",
    a: { x: c.x - s, y: c.y - s },
    b: { x: c.x + s, y: c.y + s },
    stroke,
  })
  out.push({
    kind: "segment",
    a: { x: c.x - s, y: c.y + s },
    b: { x: c.x + s, y: c.y - s },
    stroke,
  })
  if (cursor) {
    out.push({
      kind: "segment",
      a: c,
      b: cursor.screen,
      stroke: { color: THEME.tracking, width: 1, dash: GUIDE_DASH },
    })
  }
}

/**
 * Draws AutoCAD's polar tracking path: dashed from the anchor along the locked
 * polar angle out of the view (desktop d12); its reading is a tooltip at the
 * cursor.
 */
function pushPolarGuide(
  out: ScenePrimitive[],
  camera: CameraTransform,
  polar: PolarGuideInput
): void {
  const stroke: StrokeStyle = { color: THEME.polar, width: 1, dash: GUIDE_DASH }
  if (polar.alongZ) {
    out.push({
      kind: "segment",
      ...alongZOnScreen(camera, polar.origin),
      stroke,
    })
    return
  }
  const d = V.sub(polar.point, polar.origin)
  const len = V.length(d)
  const dir = len > 1e-9 ? V.scale(d, 1 / len) : { x: 1, y: 0 }
  out.push({
    kind: "segment",
    a: camera.worldToScreen(polar.origin),
    b: camera.worldToScreen(
      withZOf(V.add(polar.origin, V.scale(dir, 1e6)), polar.origin)
    ),
    stroke,
  })
}

/** The UCS's Z through `origin` (in the frame `camera` reads), as a segment across the view. */
function alongZOnScreen(
  camera: CameraTransform,
  origin: Vec2 | Vec3
): { a: Vec2; b: Vec2 } {
  const big = 1e6
  const z = zOf(origin)
  return {
    a: camera.worldToScreen({ x: origin.x, y: origin.y, z: z - big }),
    b: camera.worldToScreen({ x: origin.x, y: origin.y, z: z + big }),
  }
}

/** Half the side of the pick box the crosshair carries (screen px). */
export const PICK_BOX_PX = 4

/**
 * Draws the AutoCAD-style crosshair in place of the OS cursor: two continuous
 * lines that cross at the cursor (no centre gap), CURSORSIZE 5 (5 % of the
 * screen end to end; the canvas's larger side stands in for the screen), with
 * the pick box at its centre where one is wanted. It sits on the resolved
 * point, so when a snap engages the whole crosshair jumps onto the point and
 * clings there. Its colour never changes: the snap marker signals the lock.
 */
function pushCrosshair(
  out: ScenePrimitive[],
  width: number,
  height: number,
  cursor: CrosshairInput
): void {
  const stroke: StrokeStyle = { color: THEME.crosshair, width: 1 }
  const { x, y } = pixelCentre(cursor.screen)
  const arm = Math.max(12, Math.round(Math.max(width, height) * 0.025))
  out.push({
    kind: "segment",
    a: { x: x - arm, y },
    b: { x: x + arm, y },
    stroke,
  })
  out.push({
    kind: "segment",
    a: { x, y: y - arm },
    b: { x, y: y + arm },
    stroke,
  })
  if (!cursor.pickbox) return
  const s = PICK_BOX_PX
  out.push({
    kind: "rect",
    min: { x: x - s, y: y - s },
    width: s * 2,
    height: s * 2,
    stroke,
  })
}

/** A screen point moved to the centre of its pixel, where a 1 px line is crisp. */
function pixelCentre(at: Vec2): Vec2 {
  return { x: Math.round(at.x) + 0.5, y: Math.round(at.y) + 0.5 }
}

/**
 * AutoCAD's selection-cycling badge: two small offset rectangles beside the
 * cursor saying "more than one object is under the pick box". Drawn in the grip
 * blue, like AutoCAD's own icon, and offset up-right of the crosshair. It never
 * meets the object-snap tooltip there: one is shown while picking objects, the
 * other at a point prompt.
 */
function pushCyclingBadge(out: ScenePrimitive[], at: Vec2): void {
  const stroke: StrokeStyle = { color: THEME.grip, width: 1.25 }
  const s = 7
  const gap = 3
  const x = Math.round(at.x) + 14.5
  const y = Math.round(at.y) - 20.5
  out.push({
    kind: "rect",
    min: { x, y: y + gap },
    width: s,
    height: s,
    stroke,
  })
  out.push({
    kind: "rect",
    min: { x: x + gap, y },
    width: s,
    height: s,
    stroke,
  })
}

/**
 * AutoCAD's minus badge: Shift held where a pick removes from the selection.
 * Up-right of the crosshair like the cycling badge, and after it when both show.
 */
function pushRemoveBadge(
  out: ScenePrimitive[],
  at: Vec2,
  besideCycling: boolean
): void {
  const x = Math.round(at.x) + (besideCycling ? 28 : 14)
  const y = Math.round(at.y) - 16.5
  out.push({
    kind: "segment",
    a: { x, y },
    b: { x: x + 8, y },
    stroke: { color: THEME.grip, width: 2 },
  })
}

/**
 * TRIM's badge: a small red ✕ up and to the right of the pick box or the
 * crosshair, ringed dark so it reads over a line (desktop trim/d01-1z: 7 px
 * across, its middle 8 px right and 9 px up of the cursor's).
 */
function pushTrimBadge(out: ScenePrimitive[], at: Vec2): void {
  const c = { x: Math.round(at.x) + 8.5, y: Math.round(at.y) - 8.5 }
  pushCross(out, c, 3, { color: THEME.background, width: 4 })
  pushCross(out, c, 3, { color: THEME.trimBadge, width: 2 })
}

/**
 * The circle-and-slash where a click is refused, white and ringed dark,
 * a little further out than TRIM's ✕ (desktop trim/d09-1, d09-2).
 */
function pushRefusedBadge(out: ScenePrimitive[], at: Vec2): void {
  const c = { x: Math.round(at.x) + 11, y: Math.round(at.y) - 10.5 }
  const r = 3.75
  const s = r * Math.SQRT1_2
  for (const stroke of [
    { color: THEME.background, width: 3.25 },
    { color: THEME.refusedBadge, width: 1.25 },
  ]) {
    out.push({ kind: "circle", center: c, radius: r, stroke })
    out.push({
      kind: "segment",
      a: { x: c.x - s, y: c.y + s },
      b: { x: c.x + s, y: c.y - s },
      stroke,
    })
  }
}

/**
 * The padlock over a locked layer's object: white, ringed dark, its body
 * 8 px wide 10 px up and right of the pick box's middle, the shackle above
 * (desktop properties/d01-1, d01-3).
 */
function pushLockedBadge(out: ScenePrimitive[], at: Vec2): void {
  const x = Math.round(at.x) + 13
  const top = Math.round(at.y) - 16
  const shackle = (stroke: StrokeStyle) => {
    const r = 2.5
    out.push({
      kind: "arc",
      center: { x, y: top - 1.5 },
      radius: r,
      startAngle: Math.PI,
      endAngle: 2 * Math.PI,
      counterclockwise: false,
      stroke,
    })
    for (const side of [-r, r]) {
      out.push({
        kind: "segment",
        a: { x: x + side, y: top - 1.5 },
        b: { x: x + side, y: top },
        stroke,
      })
    }
  }
  shackle({ color: THEME.background, width: 3.25 })
  out.push({
    kind: "rect",
    min: { x: x - 5, y: top - 1 },
    width: 10,
    height: 9,
    fill: THEME.background,
  })
  shackle({ color: THEME.lockedBadge, width: 1.25 })
  out.push({
    kind: "rect",
    min: { x: x - 4, y: top },
    width: 8,
    height: 7,
    fill: THEME.lockedBadge,
  })
}

/**
 * MATCHPROP's paintbrush: white bristles 6 px up and right of the pick box's
 * middle, the handle running on up and right to 18 px, ringed dark so it reads
 * over a line (desktop properties/d07-1, d07-4).
 */
function pushPaintBadge(out: ScenePrimitive[], at: Vec2): void {
  const x = Math.round(at.x)
  const y = Math.round(at.y)
  const bristles = [
    { x: x + 5.5, y: y - 8 },
    { x: x + 10.5, y: y - 8 },
    { x: x + 14.5, y: y - 12.5 },
    { x: x + 13.5, y: y - 14.5 },
    { x: x + 11.5, y: y - 14.5 },
    { x: x + 5.5, y: y - 9 },
  ]
  const handle = (stroke: StrokeStyle) =>
    out.push({
      kind: "segment",
      a: { x: x + 14, y: y - 14 },
      b: { x: x + 18, y: y - 18.5 },
      stroke,
    })
  handle({ color: THEME.background, width: 4 })
  out.push({
    kind: "path",
    points: bristles,
    closed: true,
    stroke: { color: THEME.background, width: 2 },
  })
  handle({ color: THEME.paintBadge, width: 2 })
  out.push({
    kind: "path",
    points: bristles,
    closed: true,
    fill: THEME.paintBadge,
  })
}

/** The point a tracking path gives: a small ✕ in the crosshair's colour (desktop d12, d13). */
function pushTrackedPointMarker(out: ScenePrimitive[], at: Vec2): void {
  pushCross(out, pixelCentre(at), 6, { color: THEME.crosshair, width: 1 })
}

/**
 * The AutoSnap marker of the snap's type, green, 14 px across with a 2 px
 * stroke as AutoCAD's dark theme draws them (desktop d05, d21); a deferred
 * one trails three dots, as an apparent intersection does (circle/d03).
 */
function pushSnapMarker(
  out: ScenePrimitive[],
  at: Vec2,
  snap: SnapResult,
  deferred = false
): void {
  const s = 6
  const c = { x: Math.round(at.x), y: Math.round(at.y) }
  const stroke: StrokeStyle = { color: THEME.snap, width: 2 }

  // Different glyphs for different snap types, like classic OSNAP markers.
  switch (snap.type) {
    case "endpoint":
      out.push({
        kind: "rect",
        min: { x: c.x - s, y: c.y - s },
        width: s * 2,
        height: s * 2,
        stroke,
      })
      break
    case "midpoint":
      out.push({
        kind: "path",
        points: [
          { x: c.x, y: c.y - s },
          { x: c.x + s, y: c.y + s },
          { x: c.x - s, y: c.y + s },
        ],
        closed: true,
        stroke,
      })
      break
    case "center":
      out.push({ kind: "circle", center: c, radius: s, stroke })
      pushPlus(out, pixelCentre(c), 4, { color: THEME.crosshair, width: 1 })
      break
    case "intersection":
      pushCross(out, c, s, stroke)
      break
    case "apparentIntersection":
      // AutoCAD marks an apparent (extended) intersection with the same cross
      // plus a trailing ellipsis, signalling the geometry had to be extended.
      pushCross(out, c, s, stroke)
      pushEllipsis(out, { x: c.x + s + 2, y: c.y + s + 2 }, stroke.color)
      break
    case "perpendicular":
      pushPerpendicular(out, c, s, stroke)
      break
    case "tangent":
      pushTangent(out, c, s, stroke)
      break
    case "quadrant":
      pushDiamond(out, c, s + 2, stroke)
      break
    case "insertion":
      pushInsertion(out, c, s, stroke)
      break
    case "extension":
      pushPlus(out, c, s, stroke)
      break
    case "parallel":
      pushParallelBars(out, c, s, stroke)
      break
    case "nearest":
      pushBowtie(out, c, s, stroke)
      break
    default:
      out.push({ kind: "circle", center: c, radius: s, stroke })
  }
  if (deferred) {
    pushEllipsis(out, { x: c.x + s + 2, y: c.y + s + 2 }, stroke.color)
  }
}

/** Two offset squares — the insertion-point marker. */
function pushInsertion(
  out: ScenePrimitive[],
  c: Vec2,
  s: number,
  stroke: StrokeStyle
): void {
  const side = s * 1.3
  for (const [dx, dy] of [
    [-s * 0.4, -s * 0.4],
    [s * 0.4, s * 0.4],
  ]) {
    out.push({
      kind: "rect",
      min: { x: c.x + dx - side / 2, y: c.y + dy - side / 2 },
      width: side,
      height: side,
      stroke,
    })
  }
}

/** The diagonal cross (✕) shared by the intersection markers. */
function pushCross(
  out: ScenePrimitive[],
  c: Vec2,
  s: number,
  stroke: StrokeStyle
): void {
  out.push({
    kind: "segment",
    a: { x: c.x - s, y: c.y - s },
    b: { x: c.x + s, y: c.y + s },
    stroke,
  })
  out.push({
    kind: "segment",
    a: { x: c.x + s, y: c.y - s },
    b: { x: c.x - s, y: c.y + s },
    stroke,
  })
}

/** Three small dots — the "…" that denotes an extended (apparent) snap. */
function pushEllipsis(out: ScenePrimitive[], at: Vec2, color: string): void {
  for (let i = 0; i < 3; i++) {
    out.push({
      kind: "circle",
      center: { x: at.x + i * 3, y: at.y },
      radius: 0.75,
      fill: color,
    })
  }
}

/** The right-angle glyph (⊐ with an inner tick) for the perpendicular snap. */
function pushPerpendicular(
  out: ScenePrimitive[],
  c: Vec2,
  s: number,
  stroke: StrokeStyle
): void {
  // Outer right angle: left wall + bottom floor.
  out.push({
    kind: "path",
    points: [
      { x: c.x - s, y: c.y - s },
      { x: c.x - s, y: c.y + s },
      { x: c.x + s, y: c.y + s },
    ],
    closed: false,
    stroke,
  })
  // Inner square tick marking the 90° corner.
  out.push({
    kind: "path",
    points: [
      { x: c.x - s, y: c.y },
      { x: c.x, y: c.y },
      { x: c.x, y: c.y + s },
    ],
    closed: false,
    stroke,
  })
}

/** A circle with a tangent line across its top — the tangent snap glyph. */
function pushTangent(
  out: ScenePrimitive[],
  c: Vec2,
  s: number,
  stroke: StrokeStyle
): void {
  out.push({ kind: "circle", center: c, radius: s, stroke })
  out.push({
    kind: "segment",
    a: { x: c.x - s, y: c.y - s },
    b: { x: c.x + s, y: c.y - s },
    stroke,
  })
}

/** A diamond (rotated square) — the quadrant snap glyph. */
function pushDiamond(
  out: ScenePrimitive[],
  c: Vec2,
  s: number,
  stroke: StrokeStyle
): void {
  out.push({
    kind: "path",
    points: [
      { x: c.x, y: c.y - s },
      { x: c.x + s, y: c.y },
      { x: c.x, y: c.y + s },
      { x: c.x - s, y: c.y },
    ],
    closed: true,
    stroke,
  })
}

/** An hourglass / bowtie (⋈) — the nearest snap glyph. */
function pushBowtie(
  out: ScenePrimitive[],
  c: Vec2,
  s: number,
  stroke: StrokeStyle
): void {
  out.push({
    kind: "path",
    points: [
      { x: c.x - s, y: c.y - s },
      { x: c.x + s, y: c.y - s },
      { x: c.x - s, y: c.y + s },
      { x: c.x + s, y: c.y + s },
    ],
    closed: true,
    stroke,
  })
}

/**
 * Draws a dashed alignment line through an Extension/Parallel snap point along
 * `direction` — AutoCAD's dashed guide that shows the point is locked onto a
 * line's prolongation (Extension) or a parallel to it (Parallel).
 */
function pushAlignmentGuide(
  out: ScenePrimitive[],
  camera: CameraTransform,
  snap: SnapResult,
  direction: Vec2
): void {
  const big = 1e6
  out.push({
    kind: "segment",
    a: camera.worldToScreen(
      withZOf(V.sub(snap.point, V.scale(direction, big)), snap.point)
    ),
    b: camera.worldToScreen(
      withZOf(V.add(snap.point, V.scale(direction, big)), snap.point)
    ),
    stroke: { color: THEME.tracking, width: 1, dash: GUIDE_DASH },
  })
}

/** Extension's temporary line or arc, dashed from the acquired end to the point. */
function pushSnapPath(
  out: ScenePrimitive[],
  camera: CameraTransform,
  path: readonly Vec3[]
): void {
  out.push({
    kind: "path",
    points: path.map((point) => camera.worldToScreen(point)),
    closed: false,
    stroke: { color: THEME.tracking, width: 1, dash: GUIDE_DASH },
  })
}

/** An axis-aligned plus (+) — the extension snap glyph. */
function pushPlus(
  out: ScenePrimitive[],
  c: Vec2,
  s: number,
  stroke: StrokeStyle
): void {
  out.push({
    kind: "segment",
    a: { x: c.x - s, y: c.y },
    b: { x: c.x + s, y: c.y },
    stroke,
  })
  out.push({
    kind: "segment",
    a: { x: c.x, y: c.y - s },
    b: { x: c.x, y: c.y + s },
    stroke,
  })
}

/** Two short slashes (//) — the parallel snap glyph. */
function pushParallelBars(
  out: ScenePrimitive[],
  c: Vec2,
  s: number,
  stroke: StrokeStyle
): void {
  for (const dx of [-2, 2]) {
    out.push({
      kind: "segment",
      a: { x: c.x + dx - s / 2, y: c.y + s },
      b: { x: c.x + dx + s / 2, y: c.y - s },
      stroke,
    })
  }
}

/** The dashes of the tracking paths, Polar's and OTRACK's alike (desktop d12, d13). */
const GUIDE_DASH = [4, 2]

/**
 * Where the cursor's tooltips start, below and to the right of it, and how
 * far apart they stack (desktop d05, d12, d21).
 */
const TOOLTIP_OFFSET: Vec2 = { x: 17, y: 18 }
const TOOLTIP_HEIGHT = 20
export const CURSOR_TOOLTIP_ROW: number = TOOLTIP_HEIGHT + 2
const TOOLTIP_FONT_PX = 12

/**
 * The snap's name and Polar's reading, one under the other below and to the
 * right of the cursor, as AutoCAD places each (desktop d05, d12, d21). WHY a
 * stack: with dynamic input showing, AutoCAD's tooltip is there too (d11);
 * the host starts the box under them (`DynamicInputUi.clearance`).
 */
function pushCursorTooltips(
  out: ScenePrimitive[],
  at: Vec2,
  labels: readonly string[]
): void {
  const { x, y } = pixelCentre(at)
  labels.forEach((label, row) => {
    pushTooltip(
      out,
      x + TOOLTIP_OFFSET.x,
      y + TOOLTIP_OFFSET.y + row * CURSOR_TOOLTIP_ROW,
      label
    )
  })
}

/** A light grey box with a black edge and dark text, AutoCAD's tooltip on its dark theme. */
function pushTooltip(
  out: ScenePrimitive[],
  x: number,
  y: number,
  text: string
): void {
  const padX = 5
  const width =
    Math.ceil(measureTextWidth(text, TOOLTIP_FONT_PX * TEXT_FONT_CAP_RATIO)) +
    padX * 2
  out.push({
    kind: "rect",
    min: { x, y },
    width,
    height: TOOLTIP_HEIGHT,
    fill: THEME.snapTooltipBg,
    stroke: { color: THEME.snapTooltipBorder, width: 1 },
  })
  out.push({
    kind: "label",
    at: { x: x + padX, y: y + 14 },
    text,
    color: THEME.snapTooltipText,
    font: `${TOOLTIP_FONT_PX}px ${DRAWING_FONT}`,
  })
}

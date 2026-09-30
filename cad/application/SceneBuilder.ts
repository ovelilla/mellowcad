import { Vec2, V } from "../geometry/Vec2"
import {
  AttributeDisplay,
  BlockLookup,
  DimensionEntity,
  EllipseEntity,
  Entity,
  EntityId,
  HatchEntity,
  HatchGeometry,
  PolylineEntity,
  attributeDefinitionText,
  dimensionGeometry,
  entityDrawOrder,
  hatchGeometry,
  insertFlatGeometry,
  isFullEllipse,
  mtextLayout,
  mtextToWorld,
  polylineSegmentGeometries,
  splinePolyline,
  TextJustify,
} from "../domain/entities"
import {
  DEFAULT_DIM_STYLE,
  DEFAULT_DIM_STYLE_ID,
  DimStyle,
  DimStyleId,
} from "../domain/dimStyles"
import { polarPoint } from "../geometry/primitives"
import { DEFAULT_LAYER_COLOR, Layer, LayerId } from "../domain/layers"
import { DEFAULT_LINETYPE_ID, linetypePattern } from "../domain/linetypes"
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
  TextBaseline,
} from "../scene/types"
import { THEME } from "../scene/theme"
import { SnapResult, SnapType } from "./snapping/types"
import { TrackingPoint, TrackingResult } from "./tracking/types"

/**
 * A small crosshair drawn in place of the OS cursor, positioned on the
 * *resolved* point so it visibly snaps ("sticks") to geometry. `null` when the
 * pointer is off the canvas.
 */
export interface CrosshairInput {
  readonly screen: Vec2
}

/**
 * The polar tracking vector to draw for the current cursor: a dashed alignment
 * line through {@link origin} along the engaged polar angle, plus an AutoCAD
 * "Polar: <dist> < <angle>°" readout ({@link label}) beside the locked point.
 */
export interface PolarGuideInput {
  readonly origin: Vec2
  readonly point: Vec2
  readonly label: string
}

/**
 * Everything needed to describe one frame. The builder is a pure function of
 * this input: same input, same scene — which makes rendering trivially
 * testable without any canvas.
 */
export interface SceneInput {
  readonly camera: CameraTransform
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
  readonly gridVisible: boolean
  /**
   * Lattice the grid must align to (the SNAP spacing), so every drawn
   * intersection is a point the cursor can land on. Null lets the grid pick a
   * spacing from the zoom level.
   */
  readonly gridSpacing: Vec2 | null
  /** Global linetype scale (LTSCALE): multiplies every dash pattern length. */
  readonly ltScale: number
  /** Whether lineweights are drawn thick (LWDISPLAY) or everything hairline. */
  readonly lwDisplay: boolean
  /** ATTMODE: which attributes block references show; Normal when absent. */
  readonly attributeDisplay?: AttributeDisplay
  readonly snap: SnapResult | null
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
  const primitives: ScenePrimitive[] = []

  if (input.gridVisible) pushGrid(primitives, camera, input.gridSpacing)
  pushEntities(
    primitives,
    camera,
    input.entities,
    input.layers,
    input.dimStyles,
    input.blocks,
    input.selectedIds,
    input.hiddenIds,
    input.ltScale,
    input.lwDisplay,
    input.attributeDisplay ?? "normal"
  )
  pushTracking(primitives, camera, input.acquiredTrackingPoints, input.tracking)
  pushParallelReferences(
    primitives,
    camera,
    input.entities,
    input.parallelReferenceIds
  )
  if (input.polar) pushPolarGuide(primitives, camera, input.polar)
  if (input.fromBase) {
    pushFromBase(primitives, camera.worldToScreen(input.fromBase), input.cursor)
  }
  primitives.push(...input.toolOverlay)
  if (input.cyclingHighlight) {
    primitives.push(
      ...entityScenePrimitive(
        camera,
        input.cyclingHighlight,
        { color: THEME.selected, width: 2.5 },
        { blocks: input.blocks }
      )
    )
  }
  if (input.cursor) {
    pushCrosshair(primitives, camera.width, camera.height, input.cursor.screen)
  }
  if (input.cyclingBadge) pushCyclingBadge(primitives, input.cyclingBadge)
  if (input.tracking) {
    pushTrackedPointMarker(
      primitives,
      camera.worldToScreen(input.tracking.point)
    )
  }
  if (input.snap) {
    if (
      input.snap.type === SnapType.Extension ||
      input.snap.type === SnapType.Parallel
    ) {
      pushAlignmentGuide(primitives, camera, input.snap, input.entities)
    }
    pushSnapMarker(
      primitives,
      camera.worldToScreen(input.snap.point),
      input.snap,
      input.snapLabel
    )
  }

  return {
    width: camera.width,
    height: camera.height,
    background: THEME.background,
    primitives,
  }
}

function pushGrid(
  out: ScenePrimitive[],
  camera: CameraTransform,
  snapSpacing: Vec2 | null
): void {
  const { width, height, scale } = camera

  const minorX = gridStep(snapSpacing?.x ?? null, scale)
  const minorY = gridStep(snapSpacing?.y ?? null, scale)
  if (minorX === null || minorY === null) return // too dense to be useful

  // A coarser "major" grid every few subdivisions keeps it readable.
  const majorEvery = 5

  // World coordinates of the screen edges.
  const topLeft = camera.screenToWorld({ x: 0, y: 0 })
  const bottomRight = camera.screenToWorld({ x: width, y: height })
  const minX = Math.min(topLeft.x, bottomRight.x)
  const maxX = Math.max(topLeft.x, bottomRight.x)
  const minY = Math.min(topLeft.y, bottomRight.y)
  const maxY = Math.max(topLeft.y, bottomRight.y)

  const startI = Math.floor(minX / minorX)
  const endI = Math.ceil(maxX / minorX)
  const startJ = Math.floor(minY / minorY)
  const endJ = Math.ceil(maxY / minorY)

  const minorStroke: StrokeStyle = { color: THEME.gridMinor, width: 1 }
  const majorStroke: StrokeStyle = { color: THEME.gridMajor, width: 1 }

  // Vertical lines (crisp: snapped to the pixel grid, +0.5 offset).
  for (let i = startI; i <= endI; i++) {
    const worldX = i * minorX
    const sx = Math.round(camera.worldToScreen({ x: worldX, y: 0 }).x) + 0.5
    out.push({
      kind: "segment",
      a: { x: sx, y: 0 },
      b: { x: sx, y: height },
      stroke: i % majorEvery === 0 ? majorStroke : minorStroke,
    })
  }

  for (let j = startJ; j <= endJ; j++) {
    const worldY = j * minorY
    const sy = Math.round(camera.worldToScreen({ x: 0, y: worldY }).y) + 0.5
    out.push({
      kind: "segment",
      a: { x: 0, y: sy },
      b: { x: width, y: sy },
      stroke: j % majorEvery === 0 ? majorStroke : minorStroke,
    })
  }

  // World axes through the origin.
  const origin = camera.worldToScreen({ x: 0, y: 0 })
  if (origin.y >= 0 && origin.y <= height) {
    const y = Math.round(origin.y) + 0.5
    out.push({
      kind: "segment",
      a: { x: 0, y },
      b: { x: width, y },
      stroke: { color: THEME.axisX, width: 1 },
    })
  }
  if (origin.x >= 0 && origin.x <= width) {
    const x = Math.round(origin.x) + 0.5
    out.push({
      kind: "segment",
      a: { x, y: 0 },
      b: { x, y: height },
      stroke: { color: THEME.axisY, width: 1 },
    })
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
  const center = camera.worldToScreen(ellipse.center)
  const tip = camera.worldToScreen(V.add(ellipse.center, ellipse.majorAxis))
  const radiusX = Math.max(V.distance(center, tip), 0.01)
  const full = isFullEllipse(ellipse)
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
}

export function entityScenePrimitive(
  camera: CameraTransform,
  entity: Entity,
  stroke: StrokeStyle,
  options: EntityDrawOptions = {}
): ScenePrimitive[] {
  switch (entity.type) {
    case "line":
      return [
        {
          kind: "segment",
          a: camera.worldToScreen(entity.start),
          b: camera.worldToScreen(entity.end),
          stroke,
        },
      ]
    case "circle":
      return [
        {
          kind: "circle",
          center: camera.worldToScreen(entity.center),
          radius: Math.max(camera.worldToScreenDistance(entity.radius), 0.01),
          stroke,
        },
      ]
    case "arc":
      return [
        arcScenePrimitive(
          camera,
          entity.center,
          entity.radius,
          entity.startAngle,
          entity.endAngle,
          stroke
        ),
      ]
    case "ellipse":
      return [ellipseScenePrimitive(camera, entity, stroke)]
    case "spline": {
      // Canvas and SVG have no NURBS, and a degree above 3 fits no Bézier: the
      // curve is chopped finely enough that a chord never strays a quarter of
      // a pixel from it, at whatever zoom.
      const tolerance = 0.25 / camera.worldToScreenDistance(1)
      return [
        {
          kind: "path",
          points: splinePolyline(entity, tolerance).map((p) =>
            camera.worldToScreen(p)
          ),
          closed: false,
          stroke,
        },
      ]
    }
    case "polyline":
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
      return [
        {
          kind: "text",
          at: camera.worldToScreen(entity.position),
          text: entity.value,
          height: Math.max(camera.worldToScreenDistance(entity.height), 0.01),
          // The camera flips Y, so a world-CCW rotation reads clockwise on screen.
          rotation: -entity.rotation,
          align: textAlignOf(entity.justify),
          baseline: textBaselineOf(entity.justify),
          color: stroke.color,
        },
      ]
    case "mtext": {
      const layout = mtextLayout(entity)
      const height = Math.max(camera.worldToScreenDistance(entity.height), 0.01)
      return layout.lines.map((line) => ({
        kind: "text",
        at: camera.worldToScreen(mtextToWorld(entity, line.x, line.y)),
        text: line.value,
        height,
        rotation: -entity.rotation,
        align: layout.align,
        baseline: "alphabetic",
        color: stroke.color,
      }))
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
      return hatchPrimitives(camera, entity, stroke)
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
 * Cached hatch geometry. Clipping the pattern happens in *world* space, so the
 * result depends only on the (immutable) entity and not on the camera — which
 * makes panning and zooming free without the scene builder ceasing to be a pure
 * function of its input.
 */
const hatchGeometryCache = new WeakMap<HatchEntity, HatchGeometry>()

function hatchGeometryOf(hatch: HatchEntity): HatchGeometry {
  const cached = hatchGeometryCache.get(hatch)
  if (cached) return cached
  const geometry = hatchGeometry(hatch)
  hatchGeometryCache.set(hatch, geometry)
  return geometry
}

/**
 * A hatch: one filled path for a solid, otherwise the pattern's already-clipped
 * lines as ordinary segments. The boundary itself is not drawn — the objects it
 * was traced from are their own entities.
 */
function hatchPrimitives(
  camera: CameraTransform,
  hatch: HatchEntity,
  stroke: StrokeStyle
): ScenePrimitive[] {
  const geometry = hatchGeometryOf(hatch)
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
  return geometry.lines.map(([a, b]) => ({
    kind: "segment" as const,
    a: camera.worldToScreen(a),
    b: camera.worldToScreen(b),
    stroke,
  }))
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
  primitives.push({
    kind: "text",
    at: screen(g.textPosition),
    text: g.text,
    height: Math.max(camera.worldToScreenDistance(g.textHeight), 0.01),
    rotation: -g.textAngle,
    align: "center",
    // The measurement sits on top of the dimension line, ISO's DIMTAD 1, with
    // DIMGAP between the two. That gap is measured to the *glyphs*, so the
    // anchor is the alphabetic baseline: canvas's "bottom" is the em box, whose
    // descender space digits never use, and the resulting extra height pushed
    // the number across the neighbouring dimension line of a baseline chain
    // (DIMTXT + DIMGAP is deliberately only just under DIMDLI).
    baseline: "alphabetic",
    color: stroke.color,
  })
  return primitives
}

/** How a justification places the text horizontally around its point. */
function textAlignOf(justify: TextJustify): TextAlign {
  switch (justify) {
    case "left":
    case "tl":
    case "ml":
    case "bl":
      return "left"
    case "right":
    case "tr":
    case "mr":
    case "br":
      return "right"
    default:
      return "center"
  }
}

/** How a justification places the text vertically around its point. */
function textBaselineOf(justify: TextJustify): TextBaseline {
  switch (justify) {
    case "tl":
    case "tc":
    case "tr":
      return "top"
    // AutoCAD's Middle straddles all the text, descenders included; MC/ML/MR
    // straddle only the capitals.
    case "middle":
      return "middle"
    case "ml":
    case "mc":
    case "mr":
      return "capMiddle"
    case "bl":
    case "bc":
    case "br":
      return "bottom"
    default:
      return "alphabetic"
  }
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
    const theta = 4 * Math.atan(seg.bulge) // signed sweep from a to b
    const startAngle = Math.atan2(
      seg.a.y - seg.center.y,
      seg.a.x - seg.center.x
    )
    const steps = Math.max(2, Math.ceil(Math.abs(theta) / (Math.PI / 16)))
    for (let i = 1; i <= steps; i++) {
      const angle = startAngle + theta * (i / steps)
      points.push(
        camera.worldToScreen(polarPoint(seg.center, seg.radius, angle))
      )
    }
  }
  return points
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
  ltScale: number,
  lwDisplay: boolean,
  attributeDisplay: AttributeDisplay
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

  const draw = (entity: Entity, isSelected: boolean) => {
    const layer = layerById.get(entity.layerId)
    // Entities on a hidden (Off) layer are not drawn at all.
    if (layer && !layer.visible) return

    // Resolve the linetype ByObject → ByLayer, then turn its world-unit pattern
    // into a screen-pixel dash (scaled by LTSCALE and the current zoom).
    const linetypeId = entity.linetype ?? layer?.linetype ?? DEFAULT_LINETYPE_ID
    const dash = dashFor(linetypeId, ltScale, camera.scale)
    const lineweight =
      entity.lineweight ?? layer?.lineweight ?? DEFAULT_LINEWEIGHT
    const stroke: StrokeStyle = {
      color: isSelected
        ? THEME.selected
        : (entity.color ?? layer?.color ?? DEFAULT_LAYER_COLOR),
      width: widthFor(lineweight, lwDisplay, isSelected),
      ...(dash ? { dash } : {}),
    }
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
        draw(nested, isSelected)
      }
      return
    }
    out.push(
      ...entityScenePrimitive(camera, entity, stroke, {
        dimStyle:
          entity.type === "dimension"
            ? (dimStyleById.get(entity.styleId) ??
              dimStyleById.get(DEFAULT_DIM_STYLE_ID) ??
              DEFAULT_DIM_STYLE)
            : undefined,
      })
    )
  }

  for (const entity of ordered) {
    if (hiddenIds.has(entity.id)) continue
    draw(entity, selectedIds.has(entity.id))
  }
}

/** The hairline width every entity gets before its lineweight is applied. */
const HAIRLINE_WIDTH = 1.25

/**
 * The stroke width for an entity: its lineweight rendered at real thickness
 * when LWDISPLAY is on, hairline otherwise. Selected objects always get the
 * same extra weight on top, so selection stays legible at any lineweight.
 */
function widthFor(
  lineweight: Lineweight,
  lwDisplay: boolean,
  isSelected: boolean
): number {
  const width = lwDisplay
    ? lineweightPixels(lineweight, HAIRLINE_WIDTH)
    : HAIRLINE_WIDTH
  return isSelected ? width + 0.75 : width
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

  // Acquired reference markers: a small hollow square with a plus inside.
  const r = 4
  const stroke: StrokeStyle = { color: THEME.trackingSolid, width: 1.25 }
  for (const p of acquired) {
    const at = camera.worldToScreen(p.origin)
    out.push({
      kind: "rect",
      min: { x: at.x - r, y: at.y - r },
      width: r * 2,
      height: r * 2,
      stroke,
    })
    out.push({
      kind: "segment",
      a: { x: at.x - r, y: at.y },
      b: { x: at.x + r, y: at.y },
      stroke,
    })
    out.push({
      kind: "segment",
      a: { x: at.x, y: at.y - r },
      b: { x: at.x, y: at.y + r },
      stroke,
    })
  }

  // Active alignment guides: long dashed lines through the acquired point.
  if (tracking) {
    const big = 1e6
    const guideStroke: StrokeStyle = {
      color: THEME.tracking,
      width: 1.25,
      dash: [7, 5],
    }
    for (const guide of tracking.guides) {
      out.push({
        kind: "segment",
        a: camera.worldToScreen(
          V.sub(guide.point.origin, V.scale(guide.dir, big))
        ),
        b: camera.worldToScreen(
          V.add(guide.point.origin, V.scale(guide.dir, big))
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
      stroke: { color: THEME.tracking, width: 1.25, dash: [7, 5] },
    })
  }
}

/**
 * Draws AutoCAD's polar tracking vector: a dashed alignment line through the
 * anchor along the locked polar angle, extended across the viewport, with a
 * "Polar: <dist> < <angle>°" chip beside the resolved point.
 */
function pushPolarGuide(
  out: ScenePrimitive[],
  camera: CameraTransform,
  polar: PolarGuideInput
): void {
  const d = V.sub(polar.point, polar.origin)
  const len = V.length(d)
  const dir = len > 1e-9 ? V.scale(d, 1 / len) : { x: 1, y: 0 }
  const big = 1e6
  out.push({
    kind: "segment",
    a: camera.worldToScreen(V.sub(polar.origin, V.scale(dir, big))),
    b: camera.worldToScreen(V.add(polar.origin, V.scale(dir, big))),
    stroke: { color: THEME.polar, width: 1, dash: [6, 6] },
  })
  const at = camera.worldToScreen(polar.point)
  pushChip(out, at.x + 12, at.y + 12, polar.label, THEME.polarTooltipBorder)
}

/**
 * Draws the AutoCAD-style crosshair in place of the OS cursor: two continuous
 * lines that cross at the cursor (no centre gap), sized as a percentage of the
 * viewport like AutoCAD's CURSORSIZE (default 5%), plus a small central pick
 * box (PICKBOX). It sits on the resolved point, so when a snap engages the
 * whole crosshair jumps onto the point and clings there — the visible half of
 * the "sticky" feel. Kept a constant, muted colour (AutoCAD's crosshair never
 * recolours on snap); the snap marker glyph is what signals the lock.
 */
function pushCrosshair(
  out: ScenePrimitive[],
  width: number,
  height: number,
  at: Vec2
): void {
  const stroke: StrokeStyle = { color: THEME.crosshair, width: 1 }
  // Snap the lines to the pixel grid (+0.5) so they render hairline-crisp.
  const x = Math.round(at.x) + 0.5
  const y = Math.round(at.y) + 0.5
  // CURSORSIZE: 5% of the smaller viewport dimension, continuous through centre.
  const arm = Math.max(24, Math.round(Math.min(width, height) * 0.05))
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
  // Small central pick box (AutoCAD PICKBOX).
  const s = 4
  out.push({
    kind: "rect",
    min: { x: at.x - s, y: at.y - s },
    width: s * 2,
    height: s * 2,
    stroke,
  })
}

/**
 * AutoCAD's selection-cycling badge: two small offset rectangles beside the
 * cursor saying "more than one object is under the pick box". Drawn in the grip
 * blue, like AutoCAD's own icon, and offset up-right of the crosshair so it
 * clears the object-snap tooltip (which sits below-right).
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

/** Highlights the point currently resolved along a tracking guide (diamond). */ function pushTrackedPointMarker(
  out: ScenePrimitive[],
  at: Vec2
): void {
  const s = 5
  out.push({
    kind: "path",
    points: [
      { x: at.x, y: at.y - s },
      { x: at.x + s, y: at.y },
      { x: at.x, y: at.y + s },
      { x: at.x - s, y: at.y },
    ],
    closed: true,
    stroke: { color: THEME.trackingSolid, width: 1.5 },
  })
}

function pushSnapMarker(
  out: ScenePrimitive[],
  at: Vec2,
  snap: SnapResult,
  label: string
): void {
  const s = 6
  // Pixel-snap the centre so the thin marker strokes render hairline-crisp
  // instead of blurring across two rows of pixels (the "tosco" look).
  const c = { x: Math.round(at.x) + 0.5, y: Math.round(at.y) + 0.5 }
  const stroke: StrokeStyle = { color: THEME.snap, width: 1.5 }

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
      pushDiamond(out, c, s, stroke)
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

  pushSnapTooltip(out, c, s, label)
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
 * its source line's direction — AutoCAD's dashed guide that shows the point is
 * locked onto that line's prolongation (Extension) or a parallel to it
 * (Parallel). The line is looked up from the snap's source id.
 */
function pushAlignmentGuide(
  out: ScenePrimitive[],
  camera: CameraTransform,
  snap: SnapResult,
  entities: readonly Entity[]
): void {
  const id = snap.sourceIds?.[0]
  if (id === undefined) return
  const line = entities.find((e) => e.id === id)
  if (!line || line.type !== "line") return
  const along = V.sub(line.end, line.start)
  const len = V.length(along)
  if (len < 1e-9) return
  const dir = V.scale(along, 1 / len)
  const big = 1e6
  out.push({
    kind: "segment",
    a: camera.worldToScreen(V.sub(snap.point, V.scale(dir, big))),
    b: camera.worldToScreen(V.add(snap.point, V.scale(dir, big))),
    stroke: { color: THEME.tracking, width: 1, dash: [7, 5] },
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

/**
 * A compact tooltip beside the marker, AutoCAD-style: the snap name on a dark
 * rounded chip offset to the lower-right of the point, rather than raw text
 * jammed against the glyph.
 */
function pushSnapTooltip(
  out: ScenePrimitive[],
  c: Vec2,
  s: number,
  text: string
): void {
  pushChip(out, c.x + s + 8, c.y + s + 4, text, THEME.snapTooltipBorder)
}

/**
 * A compact dark rounded chip with a single line of monospace text, drawn with
 * its top-left corner at (x, y). Shared by the OSNAP and polar tooltips.
 */
function pushChip(
  out: ScenePrimitive[],
  x: number,
  y: number,
  text: string,
  borderColor: string
): void {
  const padX = 6
  const padY = 3
  const charW = 6.4 // ~width of one 11px monospace glyph
  const lineH = 14
  const w = Math.ceil(text.length * charW) + padX * 2
  out.push({
    kind: "rect",
    min: { x, y },
    width: w,
    height: lineH + padY * 2,
    fill: THEME.snapTooltipBg,
    stroke: { color: borderColor, width: 1 },
  })
  out.push({
    kind: "label",
    at: { x: x + padX, y: y + padY + 11 },
    text,
    color: THEME.snapTooltipText,
    font: "11px ui-monospace, monospace",
  })
}

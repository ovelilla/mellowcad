import { Vec2, V } from "../../geometry/Vec2"
import {
  circleCircleIntersection,
  closestPointOnArc,
  closestPointOnInfiniteLine,
  closestPointOnSegment,
  infiniteLineIntersection,
  lineCircleIntersectionParams,
  normalizeAngle,
  offsetSegment,
} from "../../geometry/primitives"
import {
  createArc,
  createCircle,
  createLine,
  createPolyline,
  polylineSegmentGeometries,
  polylineSegments,
  Entity,
  PolylineEntity,
} from "../../domain/entities"
import {
  AddEntityCommand,
  ReplaceEntitiesCommand,
} from "../commands/entityCommands"
import { DynamicInputSession } from "../input/DynamicInput"
import { ScenePrimitive, StrokeStyle } from "../../scene/types"
import { THEME } from "../../scene/theme"
import { arcScenePrimitive, entityScenePrimitive } from "../SceneBuilder"
import {
  CommandOption,
  CommandOptionOutcome,
  PointerInput,
  Tool,
  ToolContext,
} from "./Tool"

/**
 * The offset tool creates equidistant parallel copies — AutoCAD's OFFSET,
 * modelled as an explicit state machine with two modes:
 *
 * ```
 *  Distance mode:
 *          type / two clicks             click object          click side
 *  distance ─────────────────► select ───────────────► side ──────────────┐
 *                                 ▲                                         │
 *                                 └─────────────────────────────────────────┘
 *  Through mode ([T] at the distance prompt):
 *                 click object              click through-point
 *  throughSelect ───────────────► throughPoint ──────────────────┐
 *        ▲                                                        │
 *        └────────────────────────────────────────────────────────┘
 * ```
 *
 * In *distance* mode you set a distance (typed or as a two-point span) and then
 * repeatedly pick an object and the side to offset towards. In *through* mode
 * (AutoCAD's Through option) you pick an object and then a point the copy must
 * pass through — the distance is whatever makes the copy land on that point.
 * Both modes loop, staying active until Escape or Enter.
 *
 * Lines offset to a parallel line; circles and arcs to a concentric one. Three
 * session toggles at the distance prompt mirror AutoCAD: **Erase** removes the
 * source after copying, **Layer** puts the copy on the current layer instead of
 * the source's, and **Multiple** keeps stepping copies out from the same object.
 * Nothing is mutated directly: each copy is an {@link AddEntityCommand} (or a
 * {@link ReplaceEntitiesCommand} when Erase replaces the source), so every step
 * is individually undoable.
 */

/** A resolved offset copy (no id/layer yet), used for preview and commit. */
type OffsetGeom =
  | { readonly kind: "line"; readonly a: Vec2; readonly b: Vec2 }
  | { readonly kind: "circle"; readonly center: Vec2; readonly radius: number }
  | {
      readonly kind: "arc"
      readonly center: Vec2
      readonly radius: number
      readonly startAngle: number
      readonly endAngle: number
    }
  | {
      readonly kind: "polyline"
      readonly vertices: readonly Vec2[]
      readonly closed: boolean
      readonly bulges?: readonly number[]
    }

type OffsetToolState =
  /** Awaiting the offset distance: a typed value or two picked points. */
  | { readonly phase: "distance"; readonly basePoint: Vec2 | null }
  /** Distance fixed; awaiting the object to offset (hover-highlighted). */
  | {
      readonly phase: "select"
      readonly distance: number
      /** The object under the cursor, drawn highlighted as a preview. */
      readonly hover: Entity | null
    }
  /** Object chosen; awaiting the side to offset towards (cursor drives it). */
  | {
      readonly phase: "side"
      readonly distance: number
      /** The object being offset (evolves to the last copy in Multiple mode). */
      readonly source: Entity
      /** The originally-picked object (the one Erase removes). */
      readonly original: Entity
      /** Whether the original has already been erased (Erase, once). */
      readonly erasedOriginal: boolean
      readonly cursor: Vec2
    }
  /** Through mode: awaiting the object to offset (hover-highlighted). */
  | { readonly phase: "throughSelect"; readonly hover: Entity | null }
  /** Through mode: object chosen; awaiting the point the copy passes through. */
  | {
      readonly phase: "throughPoint"
      readonly source: Entity
      /** Whether the source has already been erased (Erase, once). */
      readonly erasedOriginal: boolean
      readonly cursor: Vec2
    }

export class OffsetTool implements Tool {
  readonly id = "offset"
  readonly label = "Offset"
  readonly shortcut = "o"

  private state: OffsetToolState = { phase: "distance", basePoint: null }
  /** Last known screen position, used to place dynamic input on open. */
  private lastScreen: Vec2 | null = null

  /** Session toggles (AutoCAD's Erase/Layer/Multiple), set at the distance prompt. */
  private erase = false
  private offsetLayer: "source" | "current" = "source"
  private multiple = false

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    ctx.selection.clear()
    this.erase = false
    this.offsetLayer = "source"
    this.multiple = false
    this.state = { phase: "distance", basePoint: null }
    this.openDistanceInput(ctx)
  }

  onDeactivate(ctx: ToolContext): void {
    this.state = { phase: "distance", basePoint: null }
    ctx.dynamicInput.close()
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen

    switch (this.state.phase) {
      case "distance":
        ctx.dynamicInput.setPosition(input.screen)
        // Two-point entry: once the base is placed, the live distance tracks
        // the span to the cursor.
        if (this.state.basePoint) {
          ctx.dynamicInput.setLive(
            "distance",
            V.distance(this.state.basePoint, input.point)
          )
        }
        break
      case "side":
        this.state = { ...this.state, cursor: input.world }
        break
      case "select": {
        // Preview which object a click would offset (AutoCAD rollover highlight).
        const hit = ctx.pick(input.world)
        this.state = {
          ...this.state,
          hover: hit ?? null,
        }
        break
      }
      case "throughSelect": {
        const hit = ctx.pick(input.world)
        this.state = {
          ...this.state,
          hover: hit ?? null,
        }
        break
      }
      case "throughPoint":
        this.state = { ...this.state, cursor: input.point }
        break
    }

    ctx.requestRender()
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0) return

    switch (this.state.phase) {
      case "distance": {
        // Two-point distance: the first click sets the base, the second fixes
        // the length as the distance between them.
        if (!this.state.basePoint) {
          this.state = { phase: "distance", basePoint: input.point }
          return
        }
        this.setDistance(V.distance(this.state.basePoint, input.point), ctx)
        return
      }
      case "select": {
        const hit = ctx.pick(input.world)
        if (!hit) return
        this.state = {
          phase: "side",
          distance: this.state.distance,
          source: hit,
          original: hit,
          erasedOriginal: false,
          cursor: input.world,
        }
        ctx.requestRender()
        return
      }
      case "side": {
        this.placeOffset(this.state, input.world, ctx)
        return
      }
      case "throughSelect": {
        const hit = ctx.pick(input.world)
        if (!hit) return
        this.state = {
          phase: "throughPoint",
          source: hit,
          erasedOriginal: false,
          cursor: input.point,
        }
        ctx.requestRender()
        return
      }
      case "throughPoint": {
        this.placeThrough(this.state, input.point, ctx)
        return
      }
    }
  }

  commandOptions(): readonly CommandOption[] {
    // Options live at the distance prompt, alongside the value they modify.
    // Each shows its current state, like AutoCAD's [Yes/No] toggles.
    if (this.state.phase === "distance") {
      return [
        { key: "T", label: "Through" },
        { key: "E", label: `Erase: ${this.erase ? "Yes" : "No"}` },
        {
          key: "L",
          label: `Layer: ${this.offsetLayer === "current" ? "Current" : "Source"}`,
        },
        { key: "M", label: `Multiple: ${this.multiple ? "On" : "Off"}` },
      ]
    }
    if (this.state.phase === "throughSelect") {
      return [{ key: "D", label: "Distance" }]
    }
    return []
  }

  invokeOption(key: string, ctx: ToolContext): CommandOptionOutcome {
    const k = key.toLowerCase()
    if (this.state.phase === "distance") {
      if (k === "t") {
        this.enterThrough(ctx)
        return "continue"
      }
      if (k === "e") {
        this.erase = !this.erase
        ctx.requestRender()
        return "continue"
      }
      if (k === "l") {
        this.offsetLayer = this.offsetLayer === "source" ? "current" : "source"
        ctx.requestRender()
        return "continue"
      }
      if (k === "m") {
        this.multiple = !this.multiple
        ctx.requestRender()
        return "continue"
      }
    }
    if (k === "d" && this.state.phase === "throughSelect") {
      this.state = { phase: "distance", basePoint: null }
      this.openDistanceInput(ctx)
      ctx.requestRender()
      return "continue"
    }
    return "unhandled"
  }

  getConstraintAnchor(): Vec2 | null {
    // Only the two-point distance measurement benefits from a base anchor.
    return this.state.phase === "distance" ? this.state.basePoint : null
  }

  wantsSnap(): boolean {
    // Object snaps help while measuring the distance by two points and while
    // picking the through-point (you often want the copy to pass through an
    // exact point); object and side picking are proximity/side decisions.
    return (
      this.state.phase === "distance" || this.state.phase === "throughPoint"
    )
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    const { viewport } = ctx
    const draw = (
      geom: OffsetGeom,
      color: string,
      width: number
    ): ScenePrimitive[] => {
      const stroke: StrokeStyle = { color, width }
      switch (geom.kind) {
        case "line":
          return [
            {
              kind: "segment",
              a: viewport.worldToScreen(geom.a),
              b: viewport.worldToScreen(geom.b),
              stroke,
            },
          ]
        case "circle":
          return [
            {
              kind: "circle",
              center: viewport.worldToScreen(geom.center),
              radius: viewport.worldToScreenDistance(geom.radius),
              stroke,
            },
          ]
        case "arc":
          return [
            arcScenePrimitive(
              viewport,
              geom.center,
              geom.radius,
              geom.startAngle,
              geom.endAngle,
              stroke
            ),
          ]
        case "polyline":
          return entityScenePrimitive(
            viewport,
            createPolyline(
              geom.vertices,
              geom.closed,
              "0",
              geom.bulges,
              OFFSET_PREVIEW_ID
            ),
            stroke
          )
      }
    }
    // Highlights an entity's outline, or nothing when it has no offset geometry
    // (e.g. a polyline, whose offset is a later phase).
    const highlight = (
      entity: Entity,
      color: string,
      width: number
    ): ScenePrimitive[] => {
      const geom = entityAsGeom(entity)
      return geom ? draw(geom, color, width) : []
    }

    if (this.state.phase === "select") {
      // Highlight the object a click would offset, so selection is never a
      // guess — AutoCAD's selection-preview rollover.
      return this.state.hover
        ? highlight(this.state.hover, THEME.entityHover, 2)
        : []
    }

    if (this.state.phase === "side") {
      const { source, distance, cursor } = this.state
      // Keep the chosen source emphasised while the side is picked, plus a live
      // preview of the copy about to be created.
      const prims = highlight(source, THEME.selected, 2)
      const offset = computeOffset(source, distance, cursor)
      if (offset) prims.push(...draw(offset, THEME.rubberBand, 1))
      return prims
    }

    if (this.state.phase === "throughSelect") {
      return this.state.hover
        ? highlight(this.state.hover, THEME.entityHover, 2)
        : []
    }

    if (this.state.phase === "throughPoint") {
      const { source, cursor } = this.state
      const prims = highlight(source, THEME.selected, 2)
      const offset = computeThrough(source, cursor)
      if (offset) prims.push(...draw(offset, THEME.rubberBand, 1))
      return prims
    }

    return []
  }

  private openDistanceInput(ctx: ToolContext): void {
    const session: DynamicInputSession = {
      fields: [{ id: "distance", label: "Offset distance", kind: "distance" }],
      commit: (values, commitCtx) =>
        this.setDistance(values.distance, commitCtx),
    }
    ctx.dynamicInput.open(session)
    if (this.lastScreen) ctx.dynamicInput.setPosition(this.lastScreen)
  }

  /** Fixes the offset distance and advances to selecting the object. */
  private setDistance(distance: number, ctx: ToolContext): void {
    if (this.state.phase !== "distance") return
    if (!(distance > 0)) return
    this.state = { phase: "select", distance, hover: null }
    ctx.dynamicInput.close()
    ctx.requestRender()
  }

  /**
   * Creates the parallel copy on the side `side`. In Multiple mode it keeps
   * stepping out from the last copy (each further by the distance); otherwise it
   * loops back to selecting the next object — AutoCAD's continuous OFFSET.
   */
  private placeOffset(
    state: Extract<OffsetToolState, { phase: "side" }>,
    side: Vec2,
    ctx: ToolContext
  ): void {
    const offset = computeOffset(state.source, state.distance, side)
    if (!offset) return // degenerate (e.g. the cursor is on the line); wait
    const erasedOriginal = this.emitCopy(
      state.original,
      state.source,
      offset,
      state.erasedOriginal,
      ctx
    )
    if (this.multiple) {
      // Step out from the copy just made, keeping the command in this object.
      const source = offsetToEntity(offset, this.copyLayer(state.source, ctx))
      this.state = {
        phase: "side",
        distance: state.distance,
        source,
        original: state.original,
        erasedOriginal,
        cursor: side,
      }
    } else {
      this.state = { phase: "select", distance: state.distance, hover: null }
    }
    ctx.requestRender()
  }

  /** Switches to Through mode: pick an object, then a point to pass through. */
  private enterThrough(ctx: ToolContext): void {
    this.state = { phase: "throughSelect", hover: null }
    ctx.dynamicInput.close()
    ctx.requestRender()
  }

  /**
   * Creates the copy passing through `point`. In Multiple mode it keeps making
   * copies of the same source through further points; otherwise it loops back to
   * selecting the next object — AutoCAD's continuous OFFSET Through.
   */
  private placeThrough(
    state: Extract<OffsetToolState, { phase: "throughPoint" }>,
    point: Vec2,
    ctx: ToolContext
  ): void {
    const offset = computeThrough(state.source, point)
    if (!offset) return // degenerate (the point lies on the object); wait
    const erasedOriginal = this.emitCopy(
      state.source,
      state.source,
      offset,
      state.erasedOriginal,
      ctx
    )
    if (this.multiple) {
      this.state = {
        phase: "throughPoint",
        source: state.source,
        erasedOriginal,
        cursor: point,
      }
    } else {
      this.state = { phase: "throughSelect", hover: null }
    }
    ctx.requestRender()
  }

  /** The layer a copy of `source` is created on (Layer option: Source/Current). */
  private copyLayer(source: Entity, ctx: ToolContext): string {
    return this.offsetLayer === "current"
      ? ctx.document.getCurrentLayerId()
      : source.layerId
  }

  /**
   * Executes the copy for `geom`. With Erase on and the original not yet gone,
   * the copy *replaces* the original in one undoable step; otherwise it is added
   * alongside. Returns whether the original has now been erased.
   */
  private emitCopy(
    original: Entity,
    source: Entity,
    geom: OffsetGeom,
    erasedOriginal: boolean,
    ctx: ToolContext
  ): boolean {
    const copy = offsetToEntity(geom, this.copyLayer(source, ctx))
    if (this.erase && !erasedOriginal) {
      ctx.execute(new ReplaceEntitiesCommand([original.id], [copy]))
      return true
    }
    ctx.execute(new AddEntityCommand(copy))
    return erasedOriginal
  }
}

/** The bare shape of an entity, for drawing highlights without an offset. */
function entityAsGeom(entity: Entity): OffsetGeom | null {
  switch (entity.type) {
    case "line":
      return { kind: "line", a: entity.start, b: entity.end }
    case "circle":
      return { kind: "circle", center: entity.center, radius: entity.radius }
    case "arc":
      return {
        kind: "arc",
        center: entity.center,
        radius: entity.radius,
        startAngle: entity.startAngle,
        endAngle: entity.endAngle,
      }
    case "polyline":
      return {
        kind: "polyline",
        vertices: entity.vertices,
        closed: entity.closed,
        bulges: entity.bulges,
      }
    case "text":
      return null // text has no parallel copy
    case "dimension":
    case "hatch":
    case "insert":
      return null
  }
}

/**
 * The offset copy of `source` at `distance`, on the side of `side`. Lines get a
 * parallel segment; circles and arcs a concentric one whose radius grows when
 * the side is outside the original and shrinks when inside — `null` when the
 * result is degenerate (a line of zero length or a non-positive radius).
 */
function computeOffset(
  source: Entity,
  distance: number,
  side: Vec2
): OffsetGeom | null {
  switch (source.type) {
    case "line": {
      const o = offsetSegment(source.start, source.end, distance, side)
      return o ? { kind: "line", a: o.a, b: o.b } : null
    }
    case "circle": {
      const radius = concentricRadius(
        source.center,
        source.radius,
        distance,
        side
      )
      return radius ? { kind: "circle", center: source.center, radius } : null
    }
    case "arc": {
      const radius = concentricRadius(
        source.center,
        source.radius,
        distance,
        side
      )
      return radius
        ? {
            kind: "arc",
            center: source.center,
            radius,
            startAngle: source.startAngle,
            endAngle: source.endAngle,
          }
        : null
    }
    case "polyline":
      return offsetPolyline(source, distance, side)
    case "text":
    case "dimension":
    case "hatch":
    case "insert":
      return null
  }
}

/**
 * The offset copy of `source` passing through `point` — AutoCAD's Through. For
 * a line, the parallel line that contains the point (shifted by the point's
 * offset from its perpendicular foot); for a circle/arc, the concentric one
 * whose radius is the point's distance to the centre. `null` when degenerate
 * (the point lies on the line, or the radius would be zero).
 */
function computeThrough(source: Entity, point: Vec2): OffsetGeom | null {
  switch (source.type) {
    case "line": {
      const foot = closestPointOnInfiniteLine(
        source.start,
        source.end,
        point
      ).point
      const delta = V.sub(point, foot)
      if (V.length(delta) < 1e-9) return null // the point lies on the line
      return {
        kind: "line",
        a: V.add(source.start, delta),
        b: V.add(source.end, delta),
      }
    }
    case "circle": {
      const radius = V.distance(source.center, point)
      return radius > 1e-9
        ? { kind: "circle", center: source.center, radius }
        : null
    }
    case "arc": {
      const radius = V.distance(source.center, point)
      return radius > 1e-9
        ? {
            kind: "arc",
            center: source.center,
            radius,
            startAngle: source.startAngle,
            endAngle: source.endAngle,
          }
        : null
    }
    case "polyline": {
      // The offset distance is the point's perpendicular distance to the
      // nearest segment; the point itself decides the side, so the parallel
      // runs through it.
      let best = Infinity
      for (const seg of polylineSegmentGeometries(source)) {
        const d =
          seg.kind === "line"
            ? closestPointOnSegment(seg.a, seg.b, point).distance
            : closestPointOnArc(
                seg.center,
                seg.radius,
                seg.startAngle,
                seg.endAngle,
                point
              ).distance
        if (d < best) best = d
      }
      return best > 1e-9 ? offsetPolyline(source, best, point) : null
    }
    case "text":
    case "dimension":
    case "hatch":
    case "insert":
      return null
  }
}

/** The offset radius (outward when the side is outside the circle, inward when
 * inside), or `null` when it would collapse to zero or negative. */
function concentricRadius(
  center: Vec2,
  radius: number,
  distance: number,
  side: Vec2
): number | null {
  const outward = V.distance(side, center) >= radius
  const next = radius + (outward ? distance : -distance)
  return next > 1e-9 ? next : null
}

function offsetToEntity(geom: OffsetGeom, layerId: string): Entity {
  switch (geom.kind) {
    case "line":
      return createLine(geom.a, geom.b, layerId)
    case "circle":
      return createCircle(geom.center, geom.radius, layerId)
    case "arc":
      return createArc(
        geom.center,
        geom.radius,
        geom.startAngle,
        geom.endAngle,
        layerId
      )
    case "polyline":
      return createPolyline(geom.vertices, geom.closed, layerId, geom.bulges)
  }
}

const OFFSET_PREVIEW_ID = "__offset_preview__"

/**
 * The parallel copy of a polyline at `distance`, on the side of the `side`
 * point. Straight segments shift by their perpendicular; arc (bulge) segments
 * become concentric arcs whose radius grows or shrinks depending on which way
 * the offset goes. Consecutive offset segments are re-joined at their
 * intersection so corners stay sharp (AutoCAD's default OFFSETGAPTYPE = extend);
 * line↔line joins are line intersections, and any join involving an arc is a
 * line↔circle or circle↔circle intersection. A single global side sign keeps the
 * offset consistently inside or outside the whole chain. Returns `null` for a
 * degenerate result (a zero-length segment or a non-positive arc radius).
 */
function offsetPolyline(
  poly: PolylineEntity,
  distance: number,
  side: Vec2
): OffsetGeom | null {
  const geoms = polylineSegmentGeometries(poly)
  if (geoms.length === 0) return null

  const sign = offsetSideSign(polylineSegments(poly), side)
  const signedLeftOffset = sign * distance

  const offsetSegs: (OffsetSeg | null)[] = geoms.map((g) => {
    if (g.kind === "line") {
      const s = shiftedSegment(g.a, g.b, signedLeftOffset)
      return s ? { kind: "line", a: s.a, b: s.b } : null
    }
    // A concentric arc: shifting toward the centre shrinks the radius, away
    // grows it. The centre is on the left of travel for a CCW arc (bulge > 0),
    // on the right for CW, which sets the sign of the radius change.
    const newRadius = g.radius - Math.sign(g.bulge) * signedLeftOffset
    if (newRadius < 1e-9) return null
    const radial = (p: Vec2): Vec2 =>
      V.add(g.center, V.scale(V.sub(p, g.center), newRadius / g.radius))
    return {
      kind: "arc",
      center: g.center,
      radius: newRadius,
      a: radial(g.a),
      b: radial(g.b),
      bulge: g.bulge,
    }
  })
  if (offsetSegs.some((s) => s === null)) return null
  const segs = offsetSegs as OffsetSeg[]
  const m = segs.length

  const vertices: Vec2[] = []
  if (poly.closed) {
    for (let j = 0; j < m; j++) {
      vertices.push(joinOffsetSegments(segs[(j - 1 + m) % m], segs[j]))
    }
  } else {
    vertices.push(segs[0].a)
    for (let j = 1; j < m; j++) {
      vertices.push(joinOffsetSegments(segs[j - 1], segs[j]))
    }
    vertices.push(segs[m - 1].b)
  }

  // Each arc segment's bulge is recomputed from its (corner-adjusted) endpoints
  // so the retained curvature stays exact; straight segments contribute 0.
  const bulges: number[] = []
  for (let j = 0; j < m; j++) {
    const seg = segs[j]
    if (seg.kind === "line") {
      bulges.push(0)
      continue
    }
    const start = vertices[j]
    const end = vertices[poly.closed ? (j + 1) % m : j + 1]
    bulges.push(arcBulgeFromEndpoints(seg.center, start, end, seg.bulge))
  }

  return { kind: "polyline", vertices, closed: poly.closed, bulges }
}

/** An offset segment before its corners are re-joined. */
type OffsetSeg =
  | { readonly kind: "line"; readonly a: Vec2; readonly b: Vec2 }
  | {
      readonly kind: "arc"
      readonly center: Vec2
      readonly radius: number
      readonly a: Vec2
      readonly b: Vec2
      readonly bulge: number
    }

/** The corner joining two consecutive offset segments, picking (for curves) the
 * intersection nearest the naive corner between them. */
function joinOffsetSegments(prev: OffsetSeg, cur: OffsetSeg): Vec2 {
  const ref = V.scale(V.add(prev.b, cur.a), 0.5)
  if (prev.kind === "line" && cur.kind === "line") {
    const x = infiniteLineIntersection(prev.a, prev.b, cur.a, cur.b)
    return x ? x.point : cur.a
  }
  if (prev.kind === "line" && cur.kind === "arc") {
    return (
      nearestPoint(
        lineCirclePoints(prev.a, prev.b, cur.center, cur.radius),
        ref
      ) ?? cur.a
    )
  }
  if (prev.kind === "arc" && cur.kind === "line") {
    return (
      nearestPoint(
        lineCirclePoints(cur.a, cur.b, prev.center, prev.radius),
        ref
      ) ?? cur.a
    )
  }
  if (prev.kind === "arc" && cur.kind === "arc") {
    return (
      nearestPoint(
        circleCircleIntersection(
          prev.center,
          prev.radius,
          cur.center,
          cur.radius
        ),
        ref
      ) ?? cur.a
    )
  }
  return cur.a
}

/** Points where the infinite line through `a`/`b` meets a circle. */
function lineCirclePoints(
  a: Vec2,
  b: Vec2,
  center: Vec2,
  radius: number
): Vec2[] {
  const dir = V.sub(b, a)
  return lineCircleIntersectionParams(a, b, center, radius).map((t) =>
    V.add(a, V.scale(dir, t))
  )
}

/** The point in `points` nearest `ref`, or `null` when there are none. */
function nearestPoint(points: readonly Vec2[], ref: Vec2): Vec2 | null {
  let best: Vec2 | null = null
  let bestDist = Infinity
  for (const p of points) {
    const d = V.distance(p, ref)
    if (d < bestDist) {
      bestDist = d
      best = p
    }
  }
  return best
}

/** The bulge of a concentric arc between two endpoints on its circle, keeping
 * the original rotational direction (sign). */
function arcBulgeFromEndpoints(
  center: Vec2,
  start: Vec2,
  end: Vec2,
  originalBulge: number
): number {
  const angStart = Math.atan2(start.y - center.y, start.x - center.x)
  const angEnd = Math.atan2(end.y - center.y, end.x - center.x)
  const included =
    originalBulge >= 0
      ? normalizeAngle(angEnd - angStart)
      : normalizeAngle(angStart - angEnd)
  const magnitude = Math.tan(included / 4)
  return originalBulge >= 0 ? magnitude : -magnitude
}

type ShiftedSegment = { readonly a: Vec2; readonly b: Vec2; readonly dir: Vec2 }

/** A segment moved by `offset` along its left normal, keeping its direction. */
function shiftedSegment(
  a: Vec2,
  b: Vec2,
  offset: number
): ShiftedSegment | null {
  const dir = V.sub(b, a)
  const len = V.length(dir)
  if (len < 1e-9) return null
  const unit = V.scale(dir, 1 / len)
  const normal = { x: -unit.y, y: unit.x } // left of the travel direction
  const shift = V.scale(normal, offset)
  return { a: V.add(a, shift), b: V.add(b, shift), dir: unit }
}

/**
 * +1 when the `side` point lies to the left of the segment nearest it, -1 to
 * the right — the global sign that sends the whole offset to that side.
 */
function offsetSideSign(segs: readonly [Vec2, Vec2][], side: Vec2): number {
  let best = Infinity
  let nearest = segs[0]
  for (const seg of segs) {
    const d = closestPointOnSegment(seg[0], seg[1], side).distance
    if (d < best) {
      best = d
      nearest = seg
    }
  }
  const dir = V.sub(nearest[1], nearest[0])
  const left = { x: -dir.y, y: dir.x }
  return V.dot(left, V.sub(side, nearest[0])) >= 0 ? 1 : -1
}

import { Observable } from "../../shared/Observable"
import { Vec2, V } from "../../geometry/Vec2"
import { Vec3, length3, planar, sub3 } from "../../geometry/Vec3"
import { closestPointOnInfiniteLine } from "../../geometry/primitives"
import { DocumentReader } from "../../domain/Document"
import {
  Bounds,
  Entity,
  EntityId,
  carryOverrides,
  closestOnEntity,
  createLine,
  entityBounds,
  entityPointToWorld,
  entityElevation,
  insertFlatGeometry,
  lineEndZ,
  isLevel,
  lineStartZ,
  planeAxes,
  polyline3dSegments,
} from "../../domain/entities"
import { Viewport } from "../Viewport"
import { cursorInPlane, cursorOnEntityPlane } from "../viewPick"
import {
  ExtensionLine,
  defaultSnapProviders,
  extensionLines,
} from "./providers"
import {
  AcquiredPoint,
  ConstructionGeometry,
  SnapContext,
  SnapProvider,
  SnapResult,
  SnapType,
} from "./types"

/** World distance under which two candidates are considered the same point. */
const STICKY_EPSILON = 1e-6

/**
 * Screen distance under which two candidates count as equally close, so the
 * provider order decides: a line's end on another line is an Endpoint.
 */
const TIE_PIXELS = 0.5

type Tier = "point" | "held" | "path" | "near" | "object"

/**
 * The running snaps an object offers while merely passing through the
 * aperture, however far the point: Center, which "the cursor must pass over
 * the circumference of the circle or arc" to find, and the perpendicular foot
 * and tangent point. An override offers any of its snap that way — "_mid of"
 * is answered by picking the object. WHY not a running Endpoint or Midpoint:
 * those engage near the point itself, or every line drawn across another would
 * be pulled onto its ends.
 */
const FOUND_FROM_AFAR: ReadonlySet<SnapType> = new Set([
  SnapType.Center,
  SnapType.Perpendicular,
  SnapType.Tangent,
])

function tierOf(type: SnapType): Tier {
  if (type === SnapType.Extension || type === SnapType.Parallel) return "path"
  if (type === SnapType.Nearest) return "near"
  return "point"
}

/**
 * What the providers snap to: the drawing, with every block reference replaced
 * by the geometry it draws, and every 3D polyline by its segments, lines of its
 * id: their ends, middles, nearest and perpendicular points and crossings are
 * the polyline's, each at its own Z (3dpoly/p21), seen along their image in
 * any view. Built once per resolve so the expansion is not repeated by each of
 * the ten providers.
 */
function snapEntities(document: DocumentReader): Entity[] {
  const blocks = document.blockLookup()
  const entities: Entity[] = []
  for (const entity of document.getEntities()) {
    const drawn =
      entity.type === "insert" ? insertFlatGeometry(entity, blocks) : [entity]
    for (const piece of drawn) {
      if (piece.type !== "polyline3d") {
        entities.push(piece)
        continue
      }
      for (const [a, b] of polyline3dSegments(piece)) {
        entities.push(
          carryOverrides(piece, createLine(a, b, piece.layerId, piece.id))
        )
      }
    }
  }
  return entities
}

/**
 * Coordinates the snap providers. Given a screen cursor position it asks every
 * enabled provider for candidates, converts distances to screen pixels, and
 * returns the single best snap within tolerance.
 *
 * Distance is measured in *screen pixels* so snapping feels consistent
 * regardless of zoom level, exactly like a real CAD program.
 */
export class SnapEngine extends Observable {
  private providers: SnapProvider[]
  private enabled = new Set<SnapType>()

  /**
   * Pixel radius within which a snap will *engage*: AutoCAD's APERTURE, 10 by
   * default (engaged at 10 px, not at 11: desktop d25).
   */
  pixelTolerance = 10

  /**
   * Once a snap is engaged the cursor keeps clinging to it until it drifts
   * beyond this larger radius — the magnetic gravity-well that makes notable
   * points feel tacky, exactly like AutoCAD. Must be >= {@link pixelTolerance}.
   */
  releaseTolerance = 13

  private active = true

  /** World point the cursor is currently stuck to (drives the hysteresis). */
  private stickyPoint: Vec3 | null = null

  /** The distinct snaps the last resolve found, the chosen one first. */
  private options: SnapResult[] = []

  /** The snaps Tab is cycling through, in the order it started with, and where it is. */
  private cycle: { points: Vec3[]; index: number } | null = null

  /**
   * A one-shot object-snap override for the *next* point — AutoCAD's
   * Shift+right-click behaviour. When a {@link SnapType} is set, `resolve()`
   * considers *only* that snap (ignoring the running set), so the user forces a
   * single snap for one pick; `"none"` suppresses snapping for that pick. It is
   * cleared once the point is placed (or the command is cancelled).
   */
  private override: SnapType | "none" | null = null

  constructor(providers: SnapProvider[] = defaultSnapProviders) {
    super()
    this.providers = providers
    for (const provider of providers) this.enabled.add(provider.type)
  }

  isActive(): boolean {
    return this.active
  }

  setActive(active: boolean): void {
    if (this.active === active) return
    this.active = active
    if (!active) this.stickyPoint = null
    this.emit()
  }

  toggleActive(): void {
    this.setActive(!this.active)
  }

  isEnabled(type: SnapType): boolean {
    return this.enabled.has(type)
  }

  setEnabled(type: SnapType, enabled: boolean): void {
    const changed = enabled ? !this.enabled.has(type) : this.enabled.has(type)
    if (!changed) return
    if (enabled) this.enabled.add(type)
    else this.enabled.delete(type)
    this.emit()
  }

  enabledTypes(): SnapType[] {
    return this.providers.map((p) => p.type).filter((t) => this.enabled.has(t))
  }

  /** Every snap type backed by a provider (i.e. offerable as an override). */
  availableTypes(): SnapType[] {
    return this.providers.map((p) => p.type)
  }

  /** The active one-shot override, or null when none is forced. */
  getOverride(): SnapType | "none" | null {
    return this.override
  }

  /** Forces a single snap (or `"none"`) for the next point. */
  setOverride(override: SnapType | "none"): void {
    this.override = override
    this.stickyPoint = null
    this.emit()
  }

  /** Clears the one-shot override — called once the pick is consumed. */
  clearOverride(): void {
    if (this.override === null) return
    this.override = null
    this.emit()
  }

  /**
   * Resolves the best snap for a screen-space cursor position, or `null` when
   * nothing is close enough (or snapping is disabled). The priority order of
   * `providers` breaks ties between snaps at nearly equal screen distance.
   *
   * A hysteresis makes engaged snaps *cling*: a fresh point is only captured
   * inside {@link pixelTolerance}, but once stuck it keeps holding until the
   * cursor leaves the wider {@link releaseTolerance}. So the cursor "sticks"
   * slightly to notable points, matching AutoCAD's magnetic feel.
   */
  resolve(
    screenCursor: Vec2,
    document: DocumentReader,
    viewport: Viewport,
    construction: readonly ConstructionGeometry[] = [],
    anchor: Vec2 | null = null,
    parallelSourceIds: ReadonlySet<EntityId> = new Set(),
    acquired: readonly AcquiredPoint[] = []
  ): SnapResult | null {
    // A forced "none" override suppresses snapping for this pick entirely.
    if (this.override === "none") {
      this.forget()
      return null
    }
    // Snapping is off *unless* the user has forced a specific override, which
    // implies they want that snap regardless of the running-snap master toggle.
    if (!this.active && this.override === null) {
      this.forget()
      return null
    }

    const context = this.context(
      screenCursor,
      document,
      viewport,
      construction,
      anchor,
      parallelSourceIds,
      acquired
    )

    // WHY tiers and then distance, not a fixed priority: AutoCAD applies the
    // running snaps "to return a point closest to the center of the aperture
    // box", so a midpoint under the cursor beats an endpoint a few pixels off.
    // What may compete at each tier:
    //   point  — a notable point inside the aperture;
    //   held   — the point already stuck to, within the release radius (the
    //            magnet), so it is not stolen by the sliding snaps below;
    //   path   — Extension and Parallel, points on an alignment path;
    //   near   — Nearest, which is under the cursor whenever any object is;
    //   object — a snap its object offers while passing through the
    //            aperture, however far the point (`FOUND_FROM_AFAR`, or any
    //            under an override).
    const best: Record<Tier, SnapResult | null> = {
      point: null,
      held: null,
      path: null,
      near: null,
      object: null,
    }
    const rank = new Map<SnapResult, number>()
    const engaged: [Tier, SnapResult][] = []
    const offer = (tier: Tier, result: SnapResult, priority: number) => {
      if (tier !== "held") engaged.push([tier, result])
      const current = best[tier]
      if (
        current === null ||
        result.screenDistance < current.screenDistance - TIE_PIXELS ||
        (result.screenDistance <= current.screenDistance + TIE_PIXELS &&
          priority < rank.get(current)!)
      ) {
        best[tier] = result
        rank.set(result, priority)
      }
    }

    for (let priority = 0; priority < this.providers.length; priority++) {
      const provider = this.providers[priority]
      // With an override active only that single provider runs (forced, even if
      // it is off in the running set); otherwise the enabled running snaps run.
      if (this.override !== null) {
        if (provider.type !== this.override) continue
      } else if (!this.enabled.has(provider.type)) {
        continue
      }

      for (const candidate of provider.collect(context)) {
        const screenDistance = V.distance(
          viewport.worldToScreen(candidate.point),
          screenCursor
        )
        const result = { ...candidate, screenDistance }
        if (screenDistance <= this.pixelTolerance) {
          offer(tierOf(candidate.type), result, priority)
        } else if (
          candidate.touch &&
          (this.override !== null || FOUND_FROM_AFAR.has(candidate.type)) &&
          V.distance(viewport.worldToScreen(candidate.touch), screenCursor) <=
            this.pixelTolerance
        ) {
          offer("object", result, priority)
        }
        if (
          this.stickyPoint !== null &&
          screenDistance <= this.releaseTolerance &&
          length3(sub3(candidate.point, this.stickyPoint)) < STICKY_EPSILON
        ) {
          offer("held", result, priority)
        }
      }
    }

    let chosen =
      best.point ?? best.held ?? best.path ?? best.near ?? best.object
    this.options = cycleOrder(chosen, engaged)
    if (this.cycle && samePoints(this.cycle.points, this.options)) {
      const wanted = this.cycle.points[this.cycle.index]
      chosen =
        this.options.find(
          (o) => length3(sub3(o.point, wanted)) < STICKY_EPSILON
        ) ?? chosen
    } else {
      this.cycle = null
    }
    this.stickyPoint = chosen ? chosen.point : null
    return chosen
  }

  private forget(): void {
    this.stickyPoint = null
    this.options = []
    this.cycle = null
  }

  /**
   * Moves to the next snap the objects under the cursor offer — AutoCAD's Tab
   * ("Press TAB to cycle through the options"). False, leaving Tab to its other
   * jobs, when there is nothing to cycle through. The choice lasts while the
   * cursor stays over the same snaps; the caller resolves again to show it.
   */
  cycleNext(): boolean {
    if (this.options.length < 2) return false
    this.cycle = this.cycle
      ? {
          points: this.cycle.points,
          index: (this.cycle.index + 1) % this.cycle.points.length,
        }
      : { points: this.options.map((o) => o.point), index: 1 }
    this.emit()
    return true
  }

  /**
   * Extension's straight paths from the acquired ends, while Extension is
   * running or forced; none otherwise.
   */
  extensionLines(
    document: DocumentReader,
    acquired: readonly AcquiredPoint[]
  ): ExtensionLine[] {
    const on =
      this.override === SnapType.Extension ||
      (this.override === null &&
        this.active &&
        this.enabled.has(SnapType.Extension))
    if (!on || acquired.length === 0) return []
    return extensionLines({
      document,
      entities: snapEntities(document),
      acquired,
    })
  }

  /**
   * Whether a snap slides with the cursor (Extension, Parallel, Nearest)
   * rather than being a fixed point, so a crossing of alignment paths under
   * the cursor is the more precise answer.
   */
  static slides(type: SnapType): boolean {
    return tierOf(type) !== "point"
  }

  /**
   * The endpoint under the cursor, whether or not Endpoint is running: the end
   * Extension acquires "when you pass the cursor over the endpoint of objects",
   * forced through its override or running without Endpoint.
   */
  endpointUnder(
    screenCursor: Vec2,
    document: DocumentReader,
    viewport: Viewport
  ): SnapResult | null {
    const provider = this.providers.find((p) => p.type === SnapType.Endpoint)
    if (!provider) return null
    const context = this.context(
      screenCursor,
      document,
      viewport,
      [],
      null,
      new Set(),
      []
    )
    let nearest: SnapResult | null = null
    for (const candidate of provider.collect(context)) {
      const screenDistance = V.distance(
        viewport.worldToScreen(candidate.point),
        screenCursor
      )
      if (screenDistance > this.pixelTolerance) continue
      if (nearest === null || screenDistance < nearest.screenDistance) {
        nearest = { ...candidate, screenDistance }
      }
    }
    return nearest
  }

  /**
   * What the providers see of the cursor. In a plan view that is one world
   * point and a tolerance in world units, as it always was, but for an object
   * in a plane of its own. Off the plan the cursor is a line of sight: each
   * object is asked about the point of its own plane under the cursor, and
   * nearness is measured on screen. Candidates are gathered within the
   * *release* radius, so a point already stuck to survives small drifts beyond
   * the (smaller) capture radius.
   */
  private context(
    screenCursor: Vec2,
    document: DocumentReader,
    viewport: Viewport,
    construction: readonly ConstructionGeometry[],
    anchor: Vec2 | null,
    parallelSourceIds: ReadonlySet<EntityId>,
    acquired: readonly AcquiredPoint[]
  ): SnapContext {
    const entities = snapEntities(document)
    const blocks = document.blockLookup()
    const touched = new Map<Entity, Vec3 | null>()
    // `reach` (in plan only, where a world distance means the same everywhere)
    // skips the closest-point search for objects whose box is out of range.
    const toucher =
      (cursorOn: SnapContext["cursorOn"], reach: number | null) =>
      (entity: Entity): Vec3 | null => {
        if (touched.has(entity)) return touched.get(entity)!
        const cursor = cursorOn(entity)
        let point: Vec3 | null = null
        if (
          reach === null ||
          withinBox(entityBounds(entity, blocks), cursor, reach)
        ) {
          const nearest = closestOnEntity(entity, cursor, blocks)
          point = entityPointToWorld(entity, nearest.point)
        }
        touched.set(entity, point)
        return point
      }
    const shared = {
      document,
      entities,
      construction,
      anchor,
      parallelSourceIds,
      acquired,
      view: viewport,
    }
    if (viewport.isPlan) {
      const worldCursor = viewport.screenToWorld(screenCursor)
      const worldTolerance = viewport.screenToWorldDistance(
        this.releaseTolerance
      )
      const cursorOn = (entity: Entity) =>
        planeAxes(entity)
          ? cursorOnEntityPlane(viewport, entity, screenCursor)
          : worldCursor
      return {
        ...shared,
        worldCursor,
        cursorOn,
        touch: toucher(cursorOn, worldTolerance),
        isNear: (point, reach = 1) =>
          V.distance(point, worldCursor) <= worldTolerance * reach,
      }
    }
    const settings = document.getSettings()
    const workZ = settings.ucs.origin.z + settings.elevation
    const worldCursor =
      viewport.screenToPlane(screenCursor, workZ) ??
      planar(viewport.screenToWorld(screenCursor))
    const planes = new Map<number, Vec2>()
    const onPlane = (z: number) => {
      let cursor = planes.get(z)
      if (!cursor) {
        cursor = cursorInPlane(viewport, z, screenCursor)
        planes.set(z, cursor)
      }
      return cursor
    }
    const cursorOn = (entity: Entity) => {
      if (planeAxes(entity) || (entity.type === "spline" && !isLevel(entity))) {
        return cursorOnEntityPlane(viewport, entity, screenCursor)
      }
      if (entity.type !== "line") return onPlane(entityElevation(entity))
      // A line, level or sloping, is read along its own image on screen.
      const { t } = closestPointOnInfiniteLine(
        viewport.worldToScreen({ ...entity.start, z: lineStartZ(entity) }),
        viewport.worldToScreen({ ...entity.end, z: lineEndZ(entity) }),
        screenCursor
      )
      return V.lerp(entity.start, entity.end, Number.isFinite(t) ? t : 0)
    }
    return {
      ...shared,
      worldCursor,
      cursorOn,
      touch: toucher(cursorOn, null),
      isNear: (point, reach = 1) =>
        V.distance(viewport.worldToScreen(point), screenCursor) <=
        this.releaseTolerance * reach,
    }
  }
}

function withinBox(bounds: Bounds, point: Vec2, margin: number): boolean {
  return (
    point.x >= bounds.min.x - margin &&
    point.x <= bounds.max.x + margin &&
    point.y >= bounds.min.y - margin &&
    point.y <= bounds.max.y + margin
  )
}

const TIER_ORDER: readonly Tier[] = ["point", "path", "near", "object"]

/** The distinct points engaged, `chosen` first, then by tier and distance. */
function cycleOrder(
  chosen: SnapResult | null,
  engaged: readonly [Tier, SnapResult][]
): SnapResult[] {
  const sorted = [...engaged].sort(
    ([ta, a], [tb, b]) =>
      TIER_ORDER.indexOf(ta) - TIER_ORDER.indexOf(tb) ||
      a.screenDistance - b.screenDistance
  )
  const out: SnapResult[] = chosen ? [chosen] : []
  for (const [, result] of sorted) {
    if (
      out.some((o) => length3(sub3(o.point, result.point)) < STICKY_EPSILON)
    ) {
      continue
    }
    out.push(result)
  }
  return out
}

function samePoints(points: readonly Vec3[], options: readonly SnapResult[]) {
  return (
    points.length === options.length &&
    points.every((point) =>
      options.some((o) => length3(sub3(o.point, point)) < STICKY_EPSILON)
    )
  )
}

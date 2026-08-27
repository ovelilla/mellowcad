import { Observable } from "../../shared/Observable"
import { Vec2, V } from "../../geometry/Vec2"
import { DocumentReader } from "../../domain/Document"
import { EntityId } from "../../domain/entities"
import { Viewport } from "../Viewport"
import { defaultSnapProviders } from "./providers"
import {
  ConstructionGeometry,
  SnapProvider,
  SnapResult,
  SnapType,
} from "./types"

/** World distance under which two candidates are considered the same point. */
const STICKY_EPSILON = 1e-6

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

  /** Pixel radius within which a snap will *engage* (AutoCAD's APERTURE). */
  pixelTolerance = 8

  /**
   * Once a snap is engaged the cursor keeps clinging to it until it drifts
   * beyond this larger radius — the magnetic gravity-well that makes notable
   * points feel tacky, exactly like AutoCAD. Must be >= {@link pixelTolerance}.
   */
  releaseTolerance = 11

  private active = true

  /** World point the cursor is currently stuck to (drives the hysteresis). */
  private stickyPoint: Vec2 | null = null

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
    parallelSourceIds: ReadonlySet<EntityId> = new Set()
  ): SnapResult | null {
    // A forced "none" override suppresses snapping for this pick entirely.
    if (this.override === "none") {
      this.stickyPoint = null
      return null
    }
    // Snapping is off *unless* the user has forced a specific override, which
    // implies they want that snap regardless of the running-snap master toggle.
    if (!this.active && this.override === null) {
      this.stickyPoint = null
      return null
    }

    const worldCursor = viewport.screenToWorld(screenCursor)
    // Collect candidates within the *release* radius so an already-stuck point
    // survives small drifts beyond the (smaller) capture radius.
    const worldTolerance = viewport.screenToWorldDistance(this.releaseTolerance)
    const context = {
      document,
      worldCursor,
      worldTolerance,
      construction,
      anchor,
      parallelSourceIds,
    }

    let captured: SnapResult | null = null
    let capturedPriority = Number.POSITIVE_INFINITY
    let held: SnapResult | null = null
    let heldPriority = Number.POSITIVE_INFINITY

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
        // Engagement distance: a candidate may ask to be judged by its distance
        // to the source entity (perpendicular/tangent) rather than to its
        // point, so it engages while hovering over the object, not only near
        // the foot. The marker still sits on `point`.
        const screenDistance =
          candidate.pickDistance !== undefined
            ? viewport.worldToScreenDistance(candidate.pickDistance)
            : V.distance(viewport.worldToScreen(candidate.point), screenCursor)

        // Fresh capture: a new point grabbed inside the small aperture.
        if (screenDistance <= this.pixelTolerance) {
          if (
            captured === null ||
            priority < capturedPriority ||
            (priority === capturedPriority &&
              screenDistance < captured.screenDistance)
          ) {
            captured = { ...candidate, screenDistance }
            capturedPriority = priority
          }
        }

        // Held: the point we were already stuck to, still within the release
        // radius — this is what makes the cursor cling to it.
        if (
          this.stickyPoint !== null &&
          screenDistance <= this.releaseTolerance &&
          V.distance(candidate.point, this.stickyPoint) < STICKY_EPSILON
        ) {
          if (
            held === null ||
            priority < heldPriority ||
            (priority === heldPriority && screenDistance < held.screenDistance)
          ) {
            held = { ...candidate, screenDistance }
            heldPriority = priority
          }
        }
      }
    }

    // A newly captured point wins (so the cursor can jump between adjacent
    // points); only when nothing is inside the aperture does the previously
    // stuck point keep holding.
    const best = captured ?? held
    this.stickyPoint = best ? best.point : null
    return best
  }
}

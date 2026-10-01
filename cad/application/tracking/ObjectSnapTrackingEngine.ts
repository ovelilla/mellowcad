import { Observable } from "../../shared/Observable"
import { Vec2, V } from "../../geometry/Vec2"
import {
  Vec3,
  WORLD_Z,
  dot3,
  scale3,
  sub3,
  withZ,
  withZOf,
} from "../../geometry/Vec3"
import {
  Ray,
  intersectRays,
  projectPointOntoRay,
} from "../../geometry/primitives"
import { Viewport } from "../Viewport"
import {
  crossingOnScreen,
  lineOnScreen,
  nearestOnScreen,
  zOnScreen,
} from "../constraints/zGuide"
import { SnapResult, SnapType } from "../snapping/types"
import { guideRay, guidesFor } from "./guides"
import {
  DrawingAidState,
  TrackingGuide,
  TrackingHitKind,
  TrackingPoint,
  TrackingResult,
} from "./types"

/** Snap kinds that can be acquired as tracking references. */
const TRACKABLE: ReadonlySet<SnapType> = new Set([
  SnapType.Endpoint,
  SnapType.Midpoint,
  SnapType.Center,
  SnapType.Quadrant,
  SnapType.Insertion,
  SnapType.Intersection,
  SnapType.ApparentIntersection,
])

interface Candidate {
  /** A point of the plane, at its guide's height; one with a Z lies on a Z guide. */
  point: Vec2 | Vec3
  kind: TrackingHitKind
  guides: TrackingGuide[]
  dist: number
  priority: number
}

/**
 * Manages acquired tracking points and turns them into alignment guides. It is
 * an {@link Observable} like the snap engine and constraint manager, so the
 * runtime simply subscribes and redraws when acquisitions change.
 *
 * Acquisition is time-based: hovering a valid snap for `dwellMs` "picks it up".
 * Because pointer-move events stop arriving when the mouse is still, a real
 * timer drives the dwell rather than polling.
 */
export class ObjectSnapTrackingEngine extends Observable {
  private acquired: TrackingPoint[] = []
  private hoverPoint: Vec2 | null = null
  /**
   * The snap point the cursor is currently resting on after it was already
   * handled (acquired or toggled off). While the cursor stays on it we must NOT
   * re-arm the dwell, otherwise the point would flicker on/off. Cleared once the
   * cursor leaves it, so re-hovering later toggles it (AutoCAD OTRACK).
   */
  private settledPoint: Vec2 | null = null
  private dwellTimer: ReturnType<typeof setTimeout> | null = null
  private nextId = 1

  private active = true

  /** Hover time before a snap is acquired (ms). AutoCAD acquires almost
   * instantly on hover; a short dwell just avoids grabbing points the cursor
   * merely passes over. */
  dwellMs = 120
  /** Maximum number of live reference points (FIFO beyond this). */
  maxPoints = 4

  isActive(): boolean {
    return this.active
  }

  setActive(active: boolean): void {
    if (this.active === active) return
    this.active = active
    if (!active) this.clear()
    else this.emit()
  }

  toggleActive(): void {
    this.setActive(!this.active)
  }

  getAcquired(): readonly TrackingPoint[] {
    return this.acquired
  }

  hasAcquired(): boolean {
    return this.acquired.length > 0
  }

  /**
   * Feeds the current snap under the cursor. Called on every pointer move.
   * `epsilon` is the screen tolerance expressed in world units, used to decide
   * whether the cursor is still hovering the same candidate.
   *
   * Hovering a fresh snap acquires it; hovering an already-acquired point
   * again removes it (toggle), mirroring AutoCAD's OTRACK behaviour so
   * references never get stuck on screen.
   */
  observeHover(snap: SnapResult | null, epsilon: number): void {
    // A transient snap (an intersection on the rubber-band being drawn) attracts
    // the cursor but is a *moving* point, so it must never be picked up as a
    // tracking reference — acquiring it would drop a stray marker as you draw,
    // which AutoCAD does not do.
    if (!this.active || !snap || !TRACKABLE.has(snap.type) || snap.transient) {
      this.cancelDwell()
      this.settledPoint = null
      return
    }
    // Cursor still resting on a point we already handled: do nothing until it
    // leaves, so the reference doesn't immediately toggle back off.
    if (
      this.settledPoint &&
      V.distance(this.settledPoint, snap.point) <= epsilon
    ) {
      return
    }
    // Still hovering the same point: let the running timer finish.
    if (this.hoverPoint && V.distance(this.hoverPoint, snap.point) <= epsilon) {
      return
    }
    // New hover target: (re)start the dwell timer.
    this.cancelDwell()
    this.settledPoint = null
    this.hoverPoint = snap.point
    const point = snap.point
    const sourceType = snap.type
    this.dwellTimer = setTimeout(() => {
      this.dwellTimer = null
      this.toggleAt(point, sourceType, epsilon)
    }, this.dwellMs)
  }

  private toggleAt(point: Vec3, sourceType: SnapType, epsilon: number): void {
    this.hoverPoint = null
    // Remember we just handled this point so the resting cursor won't re-toggle.
    this.settledPoint = point
    const index = this.acquired.findIndex(
      (p) => V.distance(p.origin, point) <= epsilon
    )
    if (index >= 0) {
      // Re-hovering an acquired reference removes it.
      this.acquired.splice(index, 1)
      this.emit()
      return
    }
    this.acquired.push({
      id: String(this.nextId++),
      origin: point,
      sourceType,
      acquiredAt: Date.now(),
    })
    while (this.acquired.length > this.maxPoints) this.acquired.shift()
    this.emit()
  }

  /**
   * Resolves the best tracking point for the current cursor, or `null` when no
   * guide is within tolerance.
   *
   * `anchorLine` is the line the active drawing constraint (Ortho/Polar) imposes
   * from the tool's base point, if any. Intersecting a guide with it is what
   * produces the classic "align to an existing corner" point. `anchorUp` is the
   * base point instead when that line is the UCS's Z.
   *
   * Where `view` shows the UCS's Z, each acquired point offers its `+Z` / `-Z`
   * guide too, measured on the screen; a crossing with it is where the two are
   * drawn crossing, on the Z guide, at the height the user sees.
   */
  resolve(
    worldCursor: Vec3,
    worldTolerance: number,
    aids: DrawingAidState,
    anchorLine: Ray | null,
    view: Viewport,
    anchorUp: Vec3 | null = null
  ): TrackingResult | null {
    if (!this.active || this.acquired.length === 0) return null

    const up = zOnScreen(view) !== null
    const guides = this.acquired.flatMap((p) => guidesFor(p, aids, up))
    if (guides.length === 0) return null

    const screen = view.worldToScreen(worldCursor)
    let best: Candidate | null = null
    const consider = (
      point: Vec2 | Vec3,
      kind: TrackingHitKind,
      gs: TrackingGuide[],
      priority: number
    ): void => {
      const dist =
        "z" in point
          ? view.screenToWorldDistance(
              V.distance(view.worldToScreen(point), screen)
            )
          : V.distance(point, worldCursor)
      if (dist > worldTolerance) return
      if (
        best === null ||
        priority < best.priority ||
        (priority === best.priority && dist < best.dist)
      ) {
        best = { point, kind, guides: gs, dist, priority }
      }
    }
    const zLine = (g: TrackingGuide) =>
      lineOnScreen(view, g.point.origin, g.dir)
    // Off the plan a guide is measured where it is drawn, at its point's
    // height, as picking and snapping are; in plan the 2D arithmetic stays.
    const onScreen = !view.isPlan

    // Priority 0: guide × active constraint line (Ortho/Polar of the anchor).
    if (anchorLine) {
      const drawn = onScreen
        ? lineOnScreen(
            view,
            withZOf(anchorLine.origin, anchorLine.origin),
            withZ(anchorLine.dir, 0)
          )
        : null
      for (const g of guides) {
        const x = drawn
          ? crossingOnScreen(view, g.point.origin, g.dir, drawn)
          : intersectRays(guideRay(g), anchorLine)
        if (x) consider(x, "guide-constraint", [g], 0)
      }
    }
    if (anchorUp) {
      for (const g of guides) {
        if (g.kind === "z") continue
        const x = crossingOnScreen(view, anchorUp, WORLD_Z, zLine(g))
        if (x) consider(x, "guide-constraint", [g], 0)
      }
    }

    // Priority 1: guide × guide (from different acquired points), on the
    // first one, or on the Z guide when one of them is.
    for (let i = 0; i < guides.length; i++) {
      for (let j = i + 1; j < guides.length; j++) {
        const [a, b] =
          guides[j].kind === "z"
            ? [guides[j], guides[i]]
            : [guides[i], guides[j]]
        if (a.point.id === b.point.id) continue
        if (b.kind === "z") continue
        const x = onScreen
          ? crossingOnScreen(view, a.point.origin, a.dir, zLine(b))
          : intersectRays(guideRay(a), guideRay(b))
        if (x) consider(x, "guide-intersection", [a, b], 1)
      }
    }

    // Priority 2: projection onto a single guide.
    for (const g of guides) {
      const x = onScreen
        ? nearestOnScreen(view, g.point.origin, g.dir, screen)
        : projectPointOntoRay(worldCursor, guideRay(g))
      if (x) consider(x, "projection", [g], 2)
    }

    if (best === null) return null
    const chosen: Candidate = best
    // Orient the primary direction toward the resolved point (the side the
    // cursor is on) rather than the guide's canonical axis. This lets a typed
    // offset follow the user's pointing intent — no manual minus sign — like
    // AutoCAD's tracking.
    const primary = chosen.guides[0]
    // A tracked point lies at the height of the point it was acquired from, or
    // up its Z guide.
    const point =
      "z" in chosen.point
        ? chosen.point
        : withZOf(chosen.point, primary.point.origin)
    const direction =
      dot3(sub3(point, primary.point.origin), primary.dir) < 0
        ? scale3(primary.dir, -1)
        : primary.dir
    return {
      point,
      kind: chosen.kind,
      guides: chosen.guides,
      direction,
    }
  }

  /** Drops every acquired point (Escape, tool change, OTRACK off). */
  clear(): void {
    const had = this.acquired.length > 0 || this.hoverPoint !== null
    this.acquired = []
    this.settledPoint = null
    this.cancelDwell()
    if (had) this.emit()
  }

  /** Forgets points farther than `maxWorld` from the cursor (stale references). */
  removeFarFrom(cursor: Vec2, maxWorld: number): void {
    const before = this.acquired.length
    this.acquired = this.acquired.filter(
      (p) => V.distance(p.origin, cursor) <= maxWorld
    )
    if (this.acquired.length !== before) this.emit()
  }

  private cancelDwell(): void {
    if (this.dwellTimer !== null) {
      clearTimeout(this.dwellTimer)
      this.dwellTimer = null
    }
    this.hoverPoint = null
  }
}

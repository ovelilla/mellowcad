import { Observable } from "../../shared/Observable"
import { EntityId } from "../../domain/entities"

/**
 * Tracks which existing lines the user has *acquired* as Parallel references by
 * hovering over them — AutoCAD's Parallel osnap workflow. Only acquired lines'
 * directions are offered as parallels, so the snap stays deliberate (you point
 * at the line you want to be parallel to) instead of firing on every line in
 * the drawing, which would behave like a multi-direction Polar.
 *
 * Acquisition is time-based, exactly like object-snap tracking: hovering a line
 * for {@link dwellMs} picks it up, so lines merely passed over are ignored.
 */
export class ParallelReferenceEngine extends Observable {
  private acquired: EntityId[] = []
  private hoverId: EntityId | null = null
  /** A line just acquired that the cursor still rests on — don't re-arm. */
  private settledId: EntityId | null = null
  private timer: ReturnType<typeof setTimeout> | null = null

  /** Hover time before a line is acquired (ms) — same feel as OTRACK. */
  dwellMs = 120
  /** Maximum simultaneous parallel references (FIFO beyond this). */
  maxRefs = 4

  getAcquired(): ReadonlySet<EntityId> {
    return new Set(this.acquired)
  }

  hasAcquired(): boolean {
    return this.acquired.length > 0
  }

  /**
   * Feeds the id of the line currently under the cursor (or `null` when none).
   * Dwelling on a fresh line acquires it; lines already acquired or merely
   * passed over quickly are left alone. Emits when the acquired set changes so
   * the runtime redraws the `//` marker without needing a further pointer move.
   */
  observeHover(lineId: EntityId | null): void {
    if (lineId === null) {
      this.cancel()
      this.settledId = null
      return
    }
    if (this.acquired.includes(lineId)) {
      this.cancel()
      this.settledId = lineId
      return
    }
    // Still resting on the point just handled, or the dwell is already running.
    if (this.settledId === lineId || this.hoverId === lineId) return

    this.cancel()
    this.hoverId = lineId
    this.timer = setTimeout(() => {
      this.timer = null
      this.hoverId = null
      this.settledId = lineId
      this.acquired.push(lineId)
      while (this.acquired.length > this.maxRefs) this.acquired.shift()
      this.emit()
    }, this.dwellMs)
  }

  /** Drops every acquired reference (on point placement, Escape, tool change). */
  clear(): void {
    this.cancel()
    this.acquired = []
    this.settledId = null
  }

  private cancel(): void {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
    this.hoverId = null
  }
}

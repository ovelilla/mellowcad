import { Observable } from "../shared/Observable"
import { Entity, EntityId } from "../domain/entities"

/**
 * AutoCAD's selection cycling (SELECTIONCYCLING, status bar, Ctrl+W): the way
 * to reach an object that sits under another one. While the pick box covers
 * more than one object a badge appears beside the cursor; Shift+Space walks
 * through the candidates, and — with the list box enabled — clicking offers
 * them by name so you can pick the one you meant.
 *
 * AutoCAD stores the setting as an integer whose *sign* is the on/off state and
 * whose *magnitude* chooses badge only (1) or badge plus Selection list box
 * (2), so turning the feature off keeps the display preference. That is exactly
 * the shape modelled here: {@link enabled} plus {@link listBox}.
 *
 * Session state, like Ortho or SNAP: it describes how picking behaves, not what
 * the drawing contains, so it is not part of the drawing file.
 */
export class SelectionCycling extends Observable {
  private enabled = false
  private listBox = true

  /** The objects under the pick box, topmost first (see `pickAll`). */
  private candidates: readonly Entity[] = []
  /** Which candidate a pick resolves to, kept while hovering the same stack. */
  private currentId: EntityId | null = null
  /** Whether the user already said which object they mean (Shift+Space). */
  private resolved = false

  isEnabled(): boolean {
    return this.enabled
  }

  setEnabled(enabled: boolean): void {
    if (this.enabled === enabled) return
    this.enabled = enabled
    if (!enabled) this.clear()
    this.emit()
  }

  toggle(): void {
    this.setEnabled(!this.enabled)
  }

  /** Whether a click over a stack offers the Selection list box (value 2). */
  showsList(): boolean {
    return this.enabled && this.listBox
  }

  setShowsList(showList: boolean): void {
    if (this.listBox === showList) return
    this.listBox = showList
    this.emit()
  }

  getCandidates(): readonly Entity[] {
    return this.candidates
  }

  /** True when the cursor covers a stack, i.e. when the badge is shown. */
  hasStack(): boolean {
    return this.candidates.length > 1
  }

  /**
   * Records what the pick box currently covers. The highlighted candidate is
   * kept as long as the same objects stay under the cursor, so a small mouse
   * movement never undoes a Shift+Space; a different stack starts again at the
   * topmost object.
   */
  observe(candidates: readonly Entity[]): void {
    const same = sameStack(this.candidates, candidates)
    this.candidates = candidates
    if (same) return
    this.currentId = candidates[0]?.id ?? null
    this.resolved = false
    this.emit()
  }

  clear(): void {
    if (this.candidates.length === 0 && this.currentId === null) return
    this.candidates = []
    this.currentId = null
    this.resolved = false
    this.emit()
  }

  /**
   * Whether the user has already picked out one of the stacked objects with
   * Shift+Space. AutoCAD's tip is "cycle until the required object is
   * highlighted, then click to select it", so once they have answered, a click
   * must take that object instead of opening the Selection list box to ask
   * again. Cleared as soon as the cursor covers a different set of objects.
   */
  isResolved(): boolean {
    return this.resolved
  }

  /** Highlights the next candidate (Shift+Space); false when there is no stack. */
  cycle(): boolean {
    if (!this.enabled || this.candidates.length < 2) return false
    const index = this.candidates.findIndex((e) => e.id === this.currentId)
    const next = this.candidates[(index + 1) % this.candidates.length]
    this.currentId = next.id
    this.resolved = true
    this.emit()
    return true
  }

  /** Highlights a specific candidate (chosen from the Selection list box). */
  setCurrent(id: EntityId): void {
    if (this.currentId === id) return
    if (!this.candidates.some((e) => e.id === id)) return
    this.currentId = id
    this.emit()
  }

  /** The candidate a pick would resolve to right now, or null when off. */
  getCurrentId(): EntityId | null {
    return this.enabled ? this.currentId : null
  }

  /**
   * Picks from a freshly hit-tested candidate list: the object the user cycled
   * to when it is among them, otherwise the topmost — so cycling only ever
   * changes which of the objects *actually under the cursor* is picked.
   */
  choose(candidates: readonly Entity[]): Entity | null {
    if (this.enabled && this.currentId !== null) {
      const cycled = candidates.find((e) => e.id === this.currentId)
      if (cycled) return cycled
    }
    return candidates[0] ?? null
  }
}

function sameStack(a: readonly Entity[], b: readonly Entity[]): boolean {
  return a.length === b.length && a.every((entity, i) => entity.id === b[i].id)
}

import { Observable } from "../shared/Observable"
import { DrawingStore } from "./ports"

/** Lifecycle of the transparent auto-save, surfaced to the UI save button. */
export type SaveState = "idle" | "saving" | "saved"

/** Debounce before writing an auto-save after a change settles. */
const AUTO_SAVE_DEBOUNCE_MS = 350
/** Minimum time the "saving" indicator stays visible so it is perceptible. */
const AUTO_SAVE_INDICATOR_MS = 500

/**
 * Transparent per-device persistence. The service only knows *when* to save
 * and how to surface the lifecycle; *where* the drawing goes is behind the
 * {@link DrawingStore} port, and *what* is saved comes from the injected
 * `serialize` callback. With a `null` store (e.g. tests, SSR) it is inert.
 */
export class AutosaveService extends Observable {
  private state: SaveState = "idle"
  private lastSavedAtMs: number | null = null
  private debounceHandle: ReturnType<typeof setTimeout> | null = null
  private indicatorHandle: ReturnType<typeof setTimeout> | null = null

  constructor(
    private readonly store: DrawingStore | null,
    private readonly serialize: () => string
  ) {
    super()
  }

  getState(): SaveState {
    return this.state
  }

  getLastSavedAt(): number | null {
    return this.lastSavedAtMs
  }

  restore(): string | null {
    return this.store?.read() ?? null
  }

  /** Marks the state as "saved" after a successful restore (nothing dirty). */
  markRestored(): void {
    this.state = "saved"
    this.lastSavedAtMs = Date.now()
    this.emit()
  }

  /** Schedules a debounced save and shows the "saving" indicator at once. */
  schedule(): void {
    if (!this.store) return
    this.setState("saving")
    if (this.debounceHandle !== null) clearTimeout(this.debounceHandle)
    this.debounceHandle = setTimeout(() => {
      this.debounceHandle = null
      this.saveNow()
    }, AUTO_SAVE_DEBOUNCE_MS)
  }

  /** Writes the drawing immediately and settles the save indicator. */
  saveNow(): void {
    if (!this.store) return
    this.store.write(this.serialize())
    this.lastSavedAtMs = Date.now()
    // Keep the spinner visible briefly so the auto-save is perceptible.
    if (this.indicatorHandle !== null) clearTimeout(this.indicatorHandle)
    this.indicatorHandle = setTimeout(() => {
      this.indicatorHandle = null
      this.setState("saved")
    }, AUTO_SAVE_INDICATOR_MS)
    this.emit()
  }

  /** Writes a save still waiting out its debounce at once, if one is. */
  flush(): void {
    if (this.debounceHandle === null) return
    clearTimeout(this.debounceHandle)
    this.debounceHandle = null
    this.saveNow()
  }

  dispose(): void {
    if (this.debounceHandle !== null) clearTimeout(this.debounceHandle)
    if (this.indicatorHandle !== null) clearTimeout(this.indicatorHandle)
  }

  private setState(state: SaveState): void {
    if (this.state === state) return
    this.state = state
    this.emit()
  }
}

import { DrawingStore } from "../application/ports"
import {
  DrawingSummary,
  summarizeDrawing,
} from "../serialization/drawingSummary"

/**
 * Where the transparent auto-save persists the drawing on this device. FROZEN
 * at the project's original name: renaming the key would orphan every drawing
 * already auto-saved in a user's browser.
 */
const AUTO_SAVE_STORAGE_KEY = "easycad:autosave:v1"

/**
 * localStorage implementation of the {@link DrawingStore} port. Returns `null`
 * outside the browser (SSR) so the application core stays environment-safe.
 * Failures are swallowed by contract: storage may be full or blocked (private
 * mode); manual file save still works.
 */
export function createLocalStorageDrawingStore(): DrawingStore | null {
  if (typeof window === "undefined") return null
  return {
    read(): string | null {
      try {
        return window.localStorage.getItem(AUTO_SAVE_STORAGE_KEY)
      } catch {
        return null
      }
    },
    write(text: string): void {
      try {
        window.localStorage.setItem(AUTO_SAVE_STORAGE_KEY, text)
      } catch {
        // fail quietly per the port contract
      }
    },
  }
}

/**
 * What is auto-saved on this device, without loading it — so a page outside the
 * editor can offer to continue a drawing without knowing where it is kept. Null
 * when there is none, it is unreadable, or there is no browser storage.
 */
export function readSavedDrawingSummary(): DrawingSummary | null {
  const text = createLocalStorageDrawingStore()?.read() ?? null
  return text === null ? null : summarizeDrawing(text)
}

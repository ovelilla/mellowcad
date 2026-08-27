import { DrawingStore } from "../application/ports"

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

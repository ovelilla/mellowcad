import { DrawingStore } from "../application/ports"

/**
 * A {@link DrawingStore} that lives only as long as the page: what an engine
 * embedded beside the editor autosaves to, so it can never write over the
 * drawing this device keeps for the editor. `initial` is what it restores.
 */
export function createMemoryDrawingStore(
  initial: string | null = null
): DrawingStore {
  let text = initial
  return {
    read: () => text,
    write: (next) => {
      text = next
    },
  }
}

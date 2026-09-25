/**
 * Magic `type` value every drawing file carries. FROZEN at the project's
 * original name: changing it would make every already-saved file unreadable.
 *
 * It lives in this dependency-free module so that {@link summarizeDrawing} can
 * be shipped to a page on its own, without the reader and the domain model.
 */
export const DRAWING_FILE_TYPE = "easycad-drawing"

/** What a page needs to know about a drawing without loading it. */
export interface DrawingSummary {
  /** Top-level objects in the drawing (block contents are not counted). */
  readonly objects: number
}

/**
 * A glance at a drawing file: is it one, and how much is in it. It checks only
 * the envelope — the full, tolerant reader is `parseDrawingFile` — so it stays
 * cheap enough for a landing page to call. Null when `text` is not a drawing.
 */
export function summarizeDrawing(text: string): DrawingSummary | null {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    return null
  }
  if (typeof data !== "object" || data === null) return null
  const file = data as { type?: unknown; entities?: unknown }
  if (file.type !== DRAWING_FILE_TYPE || !Array.isArray(file.entities)) {
    return null
  }
  return { objects: file.entities.length }
}

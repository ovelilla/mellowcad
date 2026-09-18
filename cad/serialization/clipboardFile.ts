/**
 * Clipboard format: what a copied piece of a drawing looks like as text.
 *
 * A fragment is **not** a drawing, but it has to carry the same named tables a
 * drawing does — layers, text and dimension styles, block definitions — or it
 * lands in another drawing referring to things that do not exist there. Writing
 * exactly those is what {@link toDrawingFile} already does, so a fragment is
 * stored as a one-off drawing plus the base point the paste is measured from,
 * rather than as a second schema to keep in step with the first.
 *
 * The settings and the `current*` ids ride along unavoidably and are ignored
 * when pasting: a fragment does not redefine the drawing it lands in.
 */

import { Vec2 } from "../geometry/Vec2"
import {
  DrawingSnapshot,
  ParsedDrawing,
  parseDrawingData,
  toDrawingFile,
} from "./drawingFile"

/** Magic `type` value identifying a clipboard fragment. */
export const CLIPBOARD_FILE_TYPE = "easycad-clipboard"

/** Current envelope version. The drawing inside carries its own. */
export const CLIPBOARD_FILE_VERSION = 1

export interface ClipboardFragment {
  /**
   * The point the objects were copied relative to — COPYCLIP puts it at the
   * lower-left of their extents, COPYBASE wherever the user picked. A paste
   * lands it on the insertion point.
   */
  readonly basePoint: Vec2
  readonly drawing: ParsedDrawing
}

export function serializeClipboard(
  basePoint: Vec2,
  snapshot: DrawingSnapshot
): string {
  return JSON.stringify({
    type: CLIPBOARD_FILE_TYPE,
    version: CLIPBOARD_FILE_VERSION,
    generator: "mellowcad",
    basePoint: { x: basePoint.x, y: basePoint.y },
    drawing: toDrawingFile(snapshot),
  })
}

/**
 * Reads a fragment, or returns `null` for anything else. Unlike opening a file,
 * "this is not ours" is the *normal* case here — the system clipboard usually
 * holds text from some other application — so nothing throws and there is no
 * message to show.
 */
export function parseClipboard(text: string): ClipboardFragment | null {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    return null
  }
  if (!isRecord(data) || data.type !== CLIPBOARD_FILE_TYPE) return null
  if (typeof data.version === "number" && data.version > CLIPBOARD_FILE_VERSION)
    return null

  let drawing: ParsedDrawing
  try {
    drawing = parseDrawingData(data.drawing)
  } catch {
    return null
  }
  if (drawing.entities.length === 0) return null

  return { basePoint: parsePoint(data.basePoint), drawing }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function parsePoint(value: unknown): Vec2 {
  if (isRecord(value) && Number.isFinite(value.x) && Number.isFinite(value.y)) {
    return { x: value.x as number, y: value.y as number }
  }
  return { x: 0, y: 0 }
}

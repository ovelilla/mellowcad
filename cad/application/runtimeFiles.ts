import { Vec2 } from "../geometry/Vec2"
import { Vec3 } from "../geometry/Vec3"
import { CadDocument } from "../domain/Document"
import { Entity } from "../domain/entities"
import {
  DrawingSnapshot,
  ParsedDrawing,
  serializeDrawing as serializeDrawingFile,
} from "../serialization/drawingFile"
import {
  ClipboardFragment,
  parseClipboard,
  serializeClipboard,
} from "../serialization/clipboardFile"
import { Selection } from "./Selection"
import { clipboardSnapshot } from "./clipboard"
import { allObjects } from "./tools/objectSelection"
import { Clipboard } from "./ports"

/** How long PASTECLIP waits for the host's clipboard before giving up on it. */
const CLIPBOARD_READ_TIMEOUT_MS = 500

/** Everything a drawing file holds, read off a live document. */
export function documentSnapshot(document: CadDocument): DrawingSnapshot {
  return {
    settings: document.getSettings(),
    layers: document.getLayers(),
    currentLayerId: document.getCurrentLayerId(),
    textStyles: document.getTextStyles(),
    currentTextStyleId: document.getCurrentTextStyleId(),
    dimStyles: document.getDimStyles(),
    currentDimStyleId: document.getCurrentDimStyleId(),
    blocks: document.getBlocks(),
    entities: document.getEntities(),
  }
}

/** Serialises the current drawing to a downloadable JSON string. */
export function serializeDrawing(document: CadDocument): string {
  return serializeDrawingFile(documentSnapshot(document))
}

/**
 * A sensible default download name, e.g. `drawing-2026-07-10.ecad.json`: the
 * name is the command language's, the date and the extension are not.
 */
export function suggestedFileName(
  name: (date: string) => string,
  extension = "ecad.json"
): string {
  const stamp = new Date().toISOString().slice(0, 10)
  return `${name(stamp)}.${extension}`
}

/** Replaces the document's contents with a parsed drawing file. */
export function applyDrawingFile(
  document: CadDocument,
  parsed: ParsedDrawing
): void {
  document.load(parsed.entities, {
    settings: parsed.settings,
    layers: parsed.layers,
    currentLayerId: parsed.currentLayerId,
    textStyles: parsed.textStyles,
    currentTextStyleId: parsed.currentTextStyleId,
    dimStyles: parsed.dimStyles,
    currentDimStyleId: parsed.currentDimStyleId,
    blocks: parsed.blocks,
  })
}

/**
 * Puts a fragment of the drawing on the clipboard, for COPYCLIP / CUTCLIP /
 * COPYBASE. The system write is best effort: the text returned here is the
 * session copy that makes a paste work regardless of what the host allows.
 */
export function copyToClipboard(
  clipboard: Clipboard | null,
  document: CadDocument,
  entities: readonly Entity[],
  basePoint: Vec2 | Vec3
): string {
  const text = serializeClipboard(
    basePoint,
    clipboardSnapshot(entities, document)
  )
  void clipboard?.write(text).catch(() => {})
  return text
}

/**
 * The host's clipboard, or `null` if it will not answer promptly. Reading it
 * needs the user's permission, and a browser that asks leaves the promise
 * pending until they reply — without a bound on the wait, Ctrl+V would
 * silently do nothing at all rather than fall back to the session copy.
 */
function readSystemClipboard(
  clipboard: Clipboard | null
): Promise<string | null> {
  if (!clipboard) return Promise.resolve(null)
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), CLIPBOARD_READ_TIMEOUT_MS)
    const settle = (text: string | null): void => {
      clearTimeout(timer)
      resolve(text)
    }
    clipboard.read().then(settle, () => settle(null))
  })
}

export async function readClipboardFragment(
  clipboard: Clipboard | null,
  fallback: string | null
): Promise<ClipboardFragment | null> {
  const text = await readSystemClipboard(clipboard)
  const fragment = text === null ? null : parseClipboard(text)
  // Anything else on the system clipboard — text from another application —
  // is not an error: fall through to what this session last copied.
  if (fragment) return fragment
  return fallback ? parseClipboard(fallback) : null
}

/** Ctrl+A's set: what the object selector's ALL takes (clipboard/p126). */
export function selectAll(document: CadDocument, selection: Selection): void {
  selection.set(allObjects(document))
}

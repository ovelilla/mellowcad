import { Vec2 } from "../geometry/Vec2"
import { Vec3 } from "../geometry/Vec3"
import { CadDocument } from "../domain/Document"
import { Entity } from "../domain/entities"
import {
  DrawingSnapshot,
  ParsedDrawing,
  parseDrawingFile,
  serializeDrawing as serializeDrawingFile,
  toDrawingFile,
} from "../serialization/drawingFile"
import { DxfReadError, looksLikeDxf } from "../serialization/dxf/dxfFormat"
import type { DxfOpenReport } from "../serialization/dxf/readDxf"
import { EngineText } from "./EngineText"
import { FileKind, OpenedFile } from "./ports"
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
 * The drawing as the autosave keeps it: the file's JSON unindented. WHY:
 * localStorage holds about 5 MB, and indented a 50,000-object DXF's drawing
 * was 10.8 MB, unindented 5.5 (docs/next-dxf.md); the downloaded file stays
 * indented, to be read.
 */
export function autosaveText(document: CadDocument): string {
  return JSON.stringify(toDrawingFile(documentSnapshot(document)))
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

/** What OPEN read: a drawing of ours, or a DXF with what it left out. */
export type OpenedDrawing =
  | { readonly kind: "drawing"; readonly drawing: ParsedDrawing }
  | {
      readonly kind: "dxf"
      readonly drawing: ParsedDrawing
      readonly report: DxfOpenReport
    }

/**
 * Reads a picked file as the kind it is: a DXF by its name or its first
 * group (a binary one's sentinel), else a drawing of ours. DXFIN, whose
 * Select File offers DXF alone, reads whatever it is given as a DXF.
 * Rejects with `DxfReadError` or `DrawingFileError` for a file it cannot
 * read. WHY the reader is loaded here: a page that never opens a DXF never
 * downloads it.
 */
export async function readOpenedFile(
  file: OpenedFile | string,
  kinds: readonly FileKind[]
): Promise<OpenedDrawing> {
  const named = typeof file !== "string"
  const content = named ? file.bytes : file
  const dxf =
    !kinds.includes("drawing") ||
    (named && /\.dxf$/i.test(file.name)) ||
    looksLikeDxf(content)
  if (dxf) {
    const { parseDxf } = await import("../serialization/dxf/readDxf")
    const { drawing, report } = parseDxf(content)
    return { kind: "dxf", drawing, report }
  }
  const text = named ? new TextDecoder().decode(file.bytes) : file
  return { kind: "drawing", drawing: parseDrawingFile(text) }
}

/**
 * What opening a DXF left out, one line per kind (`docs/next-dxf.md`):
 * WHY words of our own, where every other line is AutoCAD's, is that
 * AutoCAD has an object for everything a DXF holds and says nothing.
 */
export function dxfReportLines(
  report: DxfOpenReport,
  text: EngineText
): string[] {
  const lines: string[] = []
  let total = 0
  for (const count of report.leftOut.values()) total += count
  if (total > 0) {
    const types = [...report.leftOut]
      .map(([type, count]) => `${count} ${type}`)
      .join(", ")
    lines.push(text.message("dxfLeftOut", { count: total, types }))
  }
  if (report.inLayouts > 0) {
    lines.push(text.message("dxfInLayouts", { count: report.inLayouts }))
  }
  if (report.unreadable > 0) {
    lines.push(text.message("dxfUnreadable", { count: report.unreadable }))
  }
  return lines
}

/**
 * AutoCAD's lines for a DXF it discards (probes x010, t-no-eof): a file that
 * is no DXF names itself, one cut short says where it broke.
 */
export function dxfErrorLines(
  error: DxfReadError,
  name: string | null,
  text: EngineText
): string[] {
  const line = String(error.line)
  return [
    error.kind === "header"
      ? text.message("dxfHeaderError", { line })
      : text.message("dxfReadError", { line }),
    ...(error.kind === "header" && name
      ? [text.message("dxfNotValid", { name })]
      : []),
    text.message("dxfDiscarded"),
  ]
}

/** Ctrl+A's set: what the object selector's ALL takes (clipboard/p126). */
export function selectAll(document: CadDocument, selection: Selection): void {
  selection.set(allObjects(document))
}

import type { Bounds, DrawingStore } from "@mellowcad/engine"

/**
 * A drawing the site publishes for the editor to open by its URL
 * (`/draw?drawing=gasket`): an exercise's, which opens with its drawing
 * beside where the reader draws theirs.
 */

/** The query parameter naming the drawing. */
export const DRAWING_PARAM = "drawing"

/** Where the drawing's file is, in the page's language, and what the editor frames once it opens. */
export interface PublishedDrawing {
  readonly url: string
  readonly view: Bounds
}

export type PublishedDrawings = Readonly<Record<string, PublishedDrawing>>

/**
 * Where this browser keeps what a reader draws on a published drawing, one
 * key per drawing: never the editor's own autosave, so opening an exercise
 * neither reads nor writes the drawing someone was working on. FROZEN: a
 * renamed key forgets every exercise a reader left half done.
 */
export function drawingStorageKey(name: string): string {
  return `mellowcad:drawing:${name}:v1`
}

/** The published drawing a page's query names, or `null` for the editor's own. */
export function openedDrawing(
  search: string,
  drawings: PublishedDrawings
): (PublishedDrawing & { readonly name: string }) | null {
  const name = new URLSearchParams(search).get(DRAWING_PARAM)
  if (name === null || !Object.hasOwn(drawings, name)) return null
  return { name, ...drawings[name] }
}

/** A link of the page's that keeps the drawing open: the editor in another language. */
export function withDrawing(href: string, name: string): string {
  const url = new URL(href, "https://host.invalid")
  url.searchParams.set(DRAWING_PARAM, name)
  return `${url.pathname}${url.search}${url.hash}`
}

/**
 * A store under one key of this browser's storage. Storage may be blocked or
 * full (a private window): then nothing is kept, and the drawing opens from
 * its file each time, as the engine's own store fails quietly.
 */
export function keyedDrawingStore(
  key: string,
  storage: () => Storage
): DrawingStore {
  return {
    read(): string | null {
      try {
        return storage().getItem(key)
      } catch {
        return null
      }
    },
    write(text: string): void {
      try {
        storage().setItem(key, text)
      } catch {
        // as the port's contract: a failed autosave is quiet
      }
    },
  }
}

import type { OpenedFile } from "@mellowcad/engine"

/**
 * A file a page of the site hands to the editor to open: a DXF chosen or
 * dropped on the docs' page for it (`/draw?open=<id>`). It crosses from one
 * page to the other through this browser's IndexedDB, never a server, and
 * the editor deletes it as it opens it. IndexedDB, not `sessionStorage`: it
 * keeps bytes, a binary DXF's, and a file of many megabytes.
 */

/** The query parameter naming the handed file. */
export const OPEN_PARAM = "open"

// FROZEN: a page built before a rename would hand files the editor never finds.
const DATABASE = "mellowcad"
const STORE = "handed-files"

/** The id of the file a page handed `/draw`, from the editor's query. */
export function handedFileId(search: string): string | null {
  return new URLSearchParams(search).get(OPEN_PARAM) || null
}

/** The editor's URL that opens the file handed under `id`. */
export function openingHref(editor: string, id: string): string {
  const url = new URL(editor, "https://host.invalid")
  url.searchParams.set(OPEN_PARAM, id)
  return `${url.pathname}${url.search}`
}

/** The editor's URL once it has taken the file: a reload must not ask again. */
export function withoutOpenParam(href: string): string {
  const url = new URL(href, "https://host.invalid")
  url.searchParams.delete(OPEN_PARAM)
  return `${url.pathname}${url.search}${url.hash}`
}

/**
 * Keeps the file for the editor and resolves with its id. One at a time: a
 * file handed earlier and never taken (the tab closed on its way) goes.
 */
export async function handFile(file: File): Promise<string> {
  const bytes = new Uint8Array(await file.arrayBuffer())
  const id = crypto.randomUUID()
  await inStore((store) => {
    store.clear()
    store.put({ name: file.name, bytes }, id)
  })
  return id
}

/**
 * The file handed under `id`, deleted as it is taken with any other; null
 * when there is none, taken already or never handed in this browser.
 */
export async function takeHandedFile(id: string): Promise<OpenedFile | null> {
  let taken: OpenedFile | null = null
  await inStore((store) => {
    const request = store.get(id)
    request.onsuccess = () => {
      const value: unknown = request.result
      if (isOpenedFile(value)) taken = { name: value.name, bytes: value.bytes }
    }
    store.clear()
  })
  return taken
}

function isOpenedFile(value: unknown): value is OpenedFile {
  if (typeof value !== "object" || value === null) return false
  const file = value as { name?: unknown; bytes?: unknown }
  return typeof file.name === "string" && file.bytes instanceof Uint8Array
}

/** Runs `work` in one read-write transaction on the store, settled when it commits. */
function inStore(work: (store: IDBObjectStore) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE, 1)
    request.onupgradeneeded = () => request.result.createObjectStore(STORE)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const db = request.result
      const transaction = db.transaction(STORE, "readwrite")
      transaction.oncomplete = () => {
        db.close()
        resolve()
      }
      transaction.onerror = transaction.onabort = () => {
        db.close()
        reject(transaction.error)
      }
      work(transaction.objectStore(STORE))
    }
  })
}

import {
  FileKind,
  FileTransport,
  OpenRequest,
  OpenedFile,
} from "../application/ports"
import {
  DRAWING_FILE_ACCEPT,
  DRAWING_FILE_MIME_TYPE,
} from "../serialization/drawingFile"

/** What the picker offers for each kind of file the engine opens. */
const ACCEPT: Readonly<Record<FileKind, string>> = {
  drawing: DRAWING_FILE_ACCEPT,
  dxf: ".dxf,image/vnd.dxf,application/dxf",
}

/**
 * Browser implementation of the {@link FileTransport} port: a download for
 * save, a file picker for open. Returns `null` outside the browser (SSR) so the
 * application core stays environment-safe, exactly like the drawing store.
 */
export function createBrowserFileTransport(
  ownerDocument: Document | null = typeof document === "undefined"
    ? null
    : document
): FileTransport | null {
  if (!ownerDocument) return null

  return {
    save(text: string, fileName: string): void {
      // A drawing is JSON; anything else written (MASSPROP's .mpr) is text.
      const type = fileName.endsWith(".json")
        ? DRAWING_FILE_MIME_TYPE
        : "text/plain"
      const blob = new Blob([text], { type })
      const url = URL.createObjectURL(blob)
      const anchor = ownerDocument.createElement("a")
      anchor.href = url
      anchor.download = fileName
      anchor.click()
      URL.revokeObjectURL(url)
    },

    open(
      request: OpenRequest = { kinds: ["drawing"] }
    ): Promise<OpenedFile | null> {
      return new Promise((resolve, reject) => {
        const input = ownerDocument.createElement("input")
        input.type = "file"
        input.accept = request.kinds.map((kind) => ACCEPT[kind]).join(",")
        input.style.display = "none"

        const finish = (result: Promise<OpenedFile | null>): void => {
          input.remove()
          result.then(resolve, reject)
        }

        input.addEventListener("change", () => {
          const file = input.files?.[0]
          finish(
            file
              ? file.arrayBuffer().then((buffer) => ({
                  name: file.name,
                  bytes: new Uint8Array(buffer),
                }))
              : Promise.resolve(null)
          )
        })
        // Dismissing the picker fires `cancel`, not `change`; without it the
        // promise would never settle and the input would linger in the DOM.
        input.addEventListener("cancel", () => finish(Promise.resolve(null)))

        // The element is only attached because Safari ignores `click()` on a
        // detached input; it is removed again as soon as the pick settles.
        ownerDocument.body.append(input)
        input.click()
      })
    },
  }
}

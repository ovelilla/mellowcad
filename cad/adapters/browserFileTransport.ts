import { FileTransport } from "../application/ports"
import {
  DRAWING_FILE_ACCEPT,
  DRAWING_FILE_MIME_TYPE,
} from "../serialization/drawingFile"

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
      const blob = new Blob([text], { type: DRAWING_FILE_MIME_TYPE })
      const url = URL.createObjectURL(blob)
      const anchor = ownerDocument.createElement("a")
      anchor.href = url
      anchor.download = fileName
      anchor.click()
      URL.revokeObjectURL(url)
    },

    open(): Promise<string | null> {
      return new Promise((resolve, reject) => {
        const input = ownerDocument.createElement("input")
        input.type = "file"
        input.accept = DRAWING_FILE_ACCEPT
        input.style.display = "none"

        const finish = (result: Promise<string | null>): void => {
          input.remove()
          result.then(resolve, reject)
        }

        input.addEventListener("change", () => {
          const file = input.files?.[0]
          finish(file ? file.text() : Promise.resolve(null))
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

/**
 * What the engine needs of a DXF before reading one, kept apart from the
 * reader so the runtime loads the reader only when a DXF is opened.
 */

/**
 * A file AutoCAD would discard, and which of its two reports it gives:
 * `header` for what is no DXF at all (`Error in drawing header on line 1.`,
 * then `… is not valid DXF file`, probes x010, t-bad-number), `read` for one
 * that ends inside a section (`DXF read error on line 23.`, t-no-eof). Both
 * end in `Invalid or incomplete DXF input -- drawing discarded.` (20542).
 */
export class DxfReadError extends Error {
  constructor(
    readonly kind: "header" | "read",
    readonly line: number
  ) {
    super(
      kind === "header"
        ? `Error in drawing header on line ${line}.`
        : `DXF read error on line ${line}.`
    )
    this.name = "DxfReadError"
  }
}

export const BINARY_SENTINEL = "AutoCAD Binary DXF\r\n\x1a\0"

/** Whether the bytes are a binary DXF (its 22-byte sentinel). */
export function isBinaryDxf(bytes: Uint8Array): boolean {
  if (bytes.length < BINARY_SENTINEL.length) return false
  for (let i = 0; i < BINARY_SENTINEL.length; i++) {
    if (bytes[i] !== BINARY_SENTINEL.charCodeAt(i)) return false
  }
  return true
}

/**
 * Whether the text or bytes look like a DXF rather than a drawing of ours:
 * a binary sentinel, or a first group `0` / `SECTION` (a comment, 999, may
 * come first), which is all OPEN needs to choose a reader.
 */
export function looksLikeDxf(file: Uint8Array | string): boolean {
  if (typeof file !== "string" && isBinaryDxf(file)) return true
  const head =
    typeof file === "string"
      ? file.slice(0, 4096)
      : latin1(file.subarray(0, 4096))
  const lines = head.split(/\r\n|\r|\n/)
  for (let i = 0; i + 1 < lines.length; i += 2) {
    const code = lines[i].trim()
    if (code === "999") continue
    return code === "0" && lines[i + 1].trim() === "SECTION"
  }
  return false
}

/** Bytes as Latin-1 text: the ASCII of a header read before its encoding is known. */
export function latin1(bytes: Uint8Array): string {
  let text = ""
  for (let i = 0; i < bytes.length; i += 8192) {
    text += String.fromCharCode(...bytes.subarray(i, i + 8192))
  }
  return text
}

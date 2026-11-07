import { BINARY_SENTINEL, DxfReadError, isBinaryDxf, latin1 } from "./dxfFormat"

export { DxfReadError, isBinaryDxf, looksLikeDxf } from "./dxfFormat"

/**
 * The group code / value pairs of a DXF file, ASCII or binary, each value as
 * the text an ASCII file writes: a double from a binary file becomes the
 * shortest string that reads back as the same number, a binary chunk its hex.
 */
export interface DxfGroups {
  readonly codes: Int32Array
  readonly values: readonly string[]
  /**
   * Where each group is, for AutoCAD's messages: the line its code is on in
   * an ASCII file, its ordinal in a binary one.
   */
  readonly lines: Int32Array
  readonly count: number
}

/** Reads a DXF's groups; throws a {@link DxfReadError} for what is no DXF. */
export function dxfGroups(file: Uint8Array | string): DxfGroups {
  if (typeof file !== "string" && isBinaryDxf(file)) return binaryGroups(file)
  return asciiGroups(typeof file === "string" ? file : decodeAscii(file))
}

function asciiGroups(text: string): DxfGroups {
  const lines = text.split(/\r\n|\r|\n/)
  const count = Math.ceil(lines.length / 2)
  const codes = new Int32Array(count)
  const values: string[] = new Array<string>(count)
  const at = new Int32Array(count)
  let n = 0
  for (let i = 0; i < lines.length; i += 2) {
    // A blank line where the file ends is its last line break, no group.
    if (i === lines.length - 1 && lines[i].trim() === "") break
    const code = parseCode(lines[i])
    if (code === null) throw new DxfReadError("header", i + 1)
    if (i + 1 >= lines.length) throw new DxfReadError("read", i + 1)
    codes[n] = code
    values[n] = lines[i + 1]
    at[n] = i + 1
    n++
  }
  return { codes, values, lines: at, count: n }
}

function parseCode(line: string): number | null {
  const text = line.trim()
  return /^-?\d+$/.test(text) ? Number.parseInt(text, 10) : null
}

/**
 * A text DXF's characters. Valid UTF-8 is read as UTF-8 whatever the file
 * declares, as from 2007 AutoCAD writes it; otherwise the code page of
 * `$DWGCODEPAGE`, which AutoCAD writes up to 2004 (ANSI_1252, probe x014).
 * WHY not the declared page first: programs that write UTF-8 under an old
 * `$ACADVER` would lose every accent, and text in a single-byte page is
 * almost never valid UTF-8.
 */
function decodeAscii(bytes: Uint8Array): string {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes)
  } catch {
    return codePageDecoder(declaredCodePage(bytes)).decode(bytes)
  }
}

/** `$DWGCODEPAGE`'s value, read from the header before the text is decoded. */
function declaredCodePage(bytes: Uint8Array): string | null {
  const head = latin1(bytes.subarray(0, 16384)).split(/\r\n|\r|\n/)
  for (let i = 0; i + 3 < head.length; i++) {
    if (head[i].trim() === "$DWGCODEPAGE") return head[i + 2].trim()
  }
  return null
}

/**
 * The decoder of an ANSI code page AutoCAD names (`ANSI_1251`), Windows-1252
 * when the page is unknown or the runtime has no decoder for it.
 */
function codePageDecoder(page: string | null): TextDecoder {
  const label = page ? CODE_PAGES[page.toUpperCase()] : undefined
  try {
    return new TextDecoder(label ?? "windows-1252")
  } catch {
    return new TextDecoder("windows-1252")
  }
}

const CODE_PAGES: Readonly<Record<string, string>> = {
  ANSI_874: "windows-874",
  ANSI_932: "shift_jis",
  ANSI_936: "gbk",
  ANSI_949: "euc-kr",
  ANSI_950: "big5",
  ANSI_1250: "windows-1250",
  ANSI_1251: "windows-1251",
  ANSI_1252: "windows-1252",
  ANSI_1253: "windows-1253",
  ANSI_1254: "windows-1254",
  ANSI_1255: "windows-1255",
  ANSI_1256: "windows-1256",
  ANSI_1257: "windows-1257",
  ANSI_1258: "windows-1258",
}

/** How a binary DXF stores a group's value, by its code (DXF reference, "Group Code Value Types"). */
type ValueType =
  "string" | "double" | "int16" | "int32" | "int64" | "bool" | "chunk"

function valueType(code: number): ValueType {
  if (code < 0) return "string"
  if (code <= 9) return "string"
  if (code <= 59) return "double"
  if (code <= 79) return "int16"
  if (code <= 99) return "int32"
  if (code <= 109) return "string"
  if (code <= 149) return "double"
  if (code <= 169) return "int64"
  if (code <= 179) return "int16"
  if (code >= 210 && code <= 239) return "double"
  if (code >= 270 && code <= 289) return "int16"
  // WHY one byte: AutoCAD 2027's binary DXF writes 290–299 so ($LWDISPLAY,
  // fixture-2018-bin), where the reference only says "Boolean flag value".
  if (code >= 290 && code <= 299) return "bool"
  if (code >= 300 && code <= 309) return "string"
  if (code >= 310 && code <= 319) return "chunk"
  if (code >= 320 && code <= 369) return "string"
  if (code >= 370 && code <= 389) return "int16"
  if (code >= 390 && code <= 399) return "string"
  if (code >= 400 && code <= 409) return "int16"
  if (code >= 410 && code <= 419) return "string"
  if (code >= 420 && code <= 429) return "int32"
  if (code >= 430 && code <= 439) return "string"
  if (code >= 440 && code <= 459) return "int32"
  if (code >= 460 && code <= 469) return "double"
  if (code >= 470 && code <= 481) return "string"
  if (code === 999) return "string"
  if (code === 1004) return "chunk"
  if (code >= 1000 && code <= 1009) return "string"
  if (code >= 1010 && code <= 1059) return "double"
  if (code >= 1060 && code <= 1070) return "int16"
  if (code === 1071) return "int32"
  return "string"
}

/**
 * A binary DXF: after the sentinel, each group is its code — two bytes, or
 * one in R12 (255 then two for a code above 254) — and its value in the
 * native form of its type, little-endian; a string ends at a zero byte.
 */
function binaryGroups(bytes: Uint8Array): DxfGroups {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  let pos = BINARY_SENTINEL.length
  // R12 writes the first group's code, 0, in one byte: `SECTION` follows it.
  const shortCodes = bytes[pos] === 0 && bytes[pos + 1] === 0x53
  const strings = new BinaryStrings()
  const codes: number[] = []
  const values: string[] = []
  const at: number[] = []
  const need = (size: number) => {
    if (pos + size > bytes.length)
      throw new DxfReadError("read", codes.length + 1)
  }
  while (pos < bytes.length) {
    let code: number
    if (shortCodes) {
      need(1)
      code = bytes[pos++]
      if (code === 255) {
        need(2)
        code = view.getInt16(pos, true)
        pos += 2
      }
    } else {
      need(2)
      code = view.getInt16(pos, true)
      pos += 2
    }
    let value: string
    switch (valueType(code)) {
      case "string": {
        const end = bytes.indexOf(0, pos)
        if (end < 0) throw new DxfReadError("read", codes.length + 1)
        value = strings.decode(bytes.subarray(pos, end))
        pos = end + 1
        break
      }
      case "double":
        need(8)
        value = String(view.getFloat64(pos, true))
        pos += 8
        break
      case "int16":
        need(2)
        value = String(view.getInt16(pos, true))
        pos += 2
        break
      case "int32":
        need(4)
        value = String(view.getInt32(pos, true))
        pos += 4
        break
      case "int64":
        need(8)
        value = String(view.getBigInt64(pos, true))
        pos += 8
        break
      case "bool":
        need(1)
        value = String(bytes[pos])
        pos += 1
        break
      case "chunk": {
        need(1)
        const size = bytes[pos++]
        need(size)
        value = hex(bytes.subarray(pos, pos + size))
        pos += size
        break
      }
    }
    codes.push(code)
    values.push(value)
    at.push(codes.length)
    if (code === 9 && value === "$DWGCODEPAGE") strings.expectCodePage = true
    else if (strings.expectCodePage && code === 3) {
      strings.codePage(value)
      strings.expectCodePage = false
    }
  }
  return {
    codes: Int32Array.from(codes),
    values,
    lines: Int32Array.from(at),
    count: codes.length,
  }
}

/** A binary file's strings: each decoded as an ASCII file's text is. */
class BinaryStrings {
  expectCodePage = false
  private page: TextDecoder = codePageDecoder(null)
  private readonly utf8 = new TextDecoder("utf-8", { fatal: true })

  codePage(page: string): void {
    this.page = codePageDecoder(page)
  }

  decode(bytes: Uint8Array): string {
    let ascii = true
    for (const b of bytes) {
      if (b >= 0x80) {
        ascii = false
        break
      }
    }
    if (ascii) return String.fromCharCode(...bytes)
    try {
      return this.utf8.decode(bytes)
    } catch {
      return this.page.decode(bytes)
    }
  }
}

function hex(bytes: Uint8Array): string {
  let text = ""
  for (const b of bytes) text += b.toString(16).padStart(2, "0").toUpperCase()
  return text
}

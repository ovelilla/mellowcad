import { BINARY_SENTINEL } from "./dxfFormat"

/**
 * Where a writer puts a DXF's groups: as text lines, as AutoCAD writes an
 * ASCII file, or in the binary form, each value in its type's bytes.
 *
 * Reals go through {@link DxfOut.real} or {@link DxfOut.exact}: SAVEAS's
 * "decimal places of accuracy" rounds only some groups. AutoCAD 2027 rounded
 * points, angles, bulges and text sizes at 3 and kept a circle's radius, an
 * ellipse, a spline, a hatch's boundary and pattern offsets and every normal
 * at full precision (probes dxf/x015, x021: the same drawing written at 3 and
 * at 16).
 */
export class DxfOut {
  private readonly chunks: Uint8Array[] = []
  private readonly lines: string[] = []
  private size = 0

  constructor(
    private readonly binary: boolean,
    /** 0 to 16: the decimal places of {@link real}. */
    private readonly precision: number,
    /** Up to 2004 the text is in the drawing's code page, ANSI_1252 (probe x014). */
    private readonly codePage: boolean,
    /** Whether this starts the file: a binary one opens with its sentinel. */
    start = true
  ) {
    if (binary && start) this.push(latin1Bytes(BINARY_SENTINEL))
  }

  /** Puts another writer's groups after these: the header, written last, goes first. */
  append(other: DxfOut): void {
    // WHY a loop, not a spread: a big drawing's lines overflow the call stack.
    for (const line of other.lines) this.lines.push(line)
    for (const chunk of other.chunks) this.push(chunk)
  }

  /** A string group: names, text, handles. */
  str(code: number, value: string): void {
    if (this.binary) {
      this.code(code)
      this.push(this.encode(value))
      this.push(new Uint8Array([0]))
    } else this.line(code, value)
  }

  /** An integer group, written as wide as AutoCAD pads it in ASCII. */
  int(code: number, value: number): void {
    const n = Math.trunc(value)
    const type = valueType(code)
    if (this.binary) {
      this.code(code)
      const bytes = new Uint8Array(BYTES[type] ?? 2)
      const view = new DataView(bytes.buffer)
      if (type === "int32") view.setInt32(0, n, true)
      else if (type === "int64") view.setBigInt64(0, BigInt(n), true)
      else if (type === "bool") bytes[0] = n ? 1 : 0
      else view.setInt16(0, n, true)
      this.push(bytes)
    } else this.line(code, String(n).padStart(WIDTH[type] ?? 0))
  }

  /** A real group rounded to the precision asked for. */
  real(code: number, value: number): void {
    this.double(code, value, this.precision)
  }

  /** A real group AutoCAD writes whole whatever the precision. */
  exact(code: number, value: number): void {
    this.double(code, value, 16)
  }

  /** A point's groups: X at `code`, Y at `code + 10`, Z at `code + 20` when given. */
  point(code: number, x: number, y: number, z?: number, exact = false): void {
    const put = exact ? this.exact.bind(this) : this.real.bind(this)
    put(code, x)
    put(code + 10, y)
    if (z !== undefined) put(code + 20, z)
  }

  /**
   * The finished file's bytes: text with AutoCAD's CRLF line ends, in UTF-8
   * or the code page, or the binary groups.
   */
  result(): Uint8Array {
    if (!this.binary) {
      const text = this.lines.join("\r\n") + "\r\n"
      return this.codePage ? cp1252Bytes(text) : new TextEncoder().encode(text)
    }
    const out = new Uint8Array(this.size)
    let at = 0
    for (const chunk of this.chunks) {
      out.set(chunk, at)
      at += chunk.length
    }
    return out
  }

  private double(code: number, value: number, places: number): void {
    if (this.binary) {
      this.code(code)
      const bytes = new Uint8Array(8)
      new DataView(bytes.buffer).setFloat64(0, rounded(value, places), true)
      this.push(bytes)
    } else this.line(code, dxfReal(value, places))
  }

  private code(code: number): void {
    const bytes = new Uint8Array(2)
    new DataView(bytes.buffer).setInt16(0, code, true)
    this.push(bytes)
  }

  private line(code: number, value: string): void {
    this.lines.push(String(code).padStart(3), this.text(value))
  }

  private push(bytes: Uint8Array): void {
    this.chunks.push(bytes)
    this.size += bytes.length
  }

  /** A string as the file's text: from 2007 any character, up to 2004 the code page's or its `\U+XXXX`. */
  private text(value: string): string {
    return this.codePage ? escapeOutsideCp1252(value) : value
  }

  private encode(value: string): Uint8Array {
    return this.codePage
      ? cp1252Bytes(escapeOutsideCp1252(value))
      : new TextEncoder().encode(value)
  }
}

/**
 * A real as AutoCAD writes it at `places` decimal places (probe x015): no
 * exponent, at most 16 significant digits and 16 decimals, trailing zeros
 * dropped but one, and no decimals at all at 0 (`123`, not `123.`).
 */
export function dxfReal(value: number, places: number): string {
  const v = rounded(value, places)
  // toFixed writes an exponent from 1e21 on, which no DXF reader takes.
  if (Math.abs(v) >= 1e21)
    return `${BigInt(Math.round(v))}${places ? ".0" : ""}`
  if (places === 0) return v.toFixed(0)
  let text = v.toFixed(Math.min(places, decimalsFor(v)))
  if (text.includes(".")) text = text.replace(/0+$/, "").replace(/\.$/, ".0")
  else text += ".0"
  return text
}

/** How many decimals leave 16 significant digits. */
function decimalsFor(v: number): number {
  if (v === 0) return 1
  const whole = Math.floor(Math.log10(Math.abs(v))) + 1
  return Math.max(0, Math.min(16, 16 - whole))
}

/** The value at `places` decimals and 16 significant digits, without a negative zero. */
function rounded(value: number, places: number): number {
  if (!Number.isFinite(value)) return 0
  const v = Number(value.toFixed(Math.min(places, decimalsFor(value))))
  const sig = v === 0 ? 0 : Number(v.toPrecision(16))
  return sig === 0 ? 0 : sig
}

type ValueType = "int16" | "int32" | "int64" | "bool" | "other"

/** How a binary DXF stores an integer group (the reader's table, dxfGroups.ts). */
function valueType(code: number): ValueType {
  if ((code >= 60 && code <= 79) || (code >= 170 && code <= 179)) return "int16"
  if (code >= 270 && code <= 289) return "int16"
  if (code >= 370 && code <= 409) return "int16"
  if (code >= 1060 && code <= 1070) return "int16"
  if (code >= 90 && code <= 99) return "int32"
  if (code >= 420 && code <= 429) return "int32"
  if (code >= 440 && code <= 459) return "int32"
  if (code === 1071) return "int32"
  if (code >= 160 && code <= 169) return "int64"
  if (code >= 290 && code <= 299) return "bool"
  return "other"
}

const BYTES: Partial<Record<ValueType, number>> = {
  int16: 2,
  int32: 4,
  int64: 8,
  bool: 1,
}

/** The width AutoCAD right-aligns each integer type to in an ASCII file (x015). */
const WIDTH: Partial<Record<ValueType, number>> = {
  int16: 6,
  int32: 9,
  int64: 18,
}

function latin1Bytes(text: string): Uint8Array {
  return Uint8Array.from(text, (c) => c.charCodeAt(0))
}

/** Windows-1252's characters in 0x80–0x9F, by byte; the rest of 0x80–0xFF is Latin-1's. */
const CP1252_HIGH = "€\u0081‚ƒ„…†‡ˆ‰Š‹Œ\u008DŽ\u008F\u0090‘’“”•–—˜™š›œ\u009DžŸ"

const CP1252: ReadonlyMap<string, number> = new Map(
  [...CP1252_HIGH].map((c, i) => [c, 0x80 + i])
)

function cp1252Byte(c: string): number | null {
  const mapped = CP1252.get(c)
  if (mapped !== undefined) return mapped
  const code = c.codePointAt(0)!
  if (code < 0x80 || (code >= 0xa0 && code <= 0xff)) return code
  return null
}

/** Each character Windows-1252 lacks as AutoCAD's `\U+XXXX` (probe x014's α). */
function escapeOutsideCp1252(value: string): string {
  let out = ""
  for (const c of value) {
    if (cp1252Byte(c) !== null) out += c
    else {
      const code = c.codePointAt(0)!
      // Beyond the BMP, each UTF-16 half, as AutoCAD keeps text in UTF-16.
      const units = code > 0xffff ? [c.charCodeAt(0), c.charCodeAt(1)] : [code]
      for (const u of units)
        out += `\\U+${u.toString(16).toUpperCase().padStart(4, "0")}`
    }
  }
  return out
}

function cp1252Bytes(value: string): Uint8Array {
  return Uint8Array.from([...value], (c) => cp1252Byte(c) ?? 0x3f)
}

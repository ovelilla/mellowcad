import { Vec3 } from "../../geometry/Vec3"
import { DxfRecord } from "./dxfSections"

/** The first value of `code` as a finite number, or `undefined`. */
export function num(record: DxfRecord, code: number): number | undefined {
  const i = record.codes.indexOf(code)
  return i < 0 ? undefined : finite(record.values[i])
}

/** The first value of `code` as an integer, or `undefined`. */
export function int(record: DxfRecord, code: number): number | undefined {
  const value = num(record, code)
  return value === undefined ? undefined : Math.trunc(value)
}

/** The first value of `code`, as written but for the line's trailing blanks. */
export function str(record: DxfRecord, code: number): string | undefined {
  const i = record.codes.indexOf(code)
  return i < 0 ? undefined : record.values[i].trimEnd()
}

/**
 * The point whose X is `code` (10), its Y `code + 10` and its Z `code + 20`;
 * a missing Z is 0, a missing X or Y no point.
 */
export function point(record: DxfRecord, code: number): Vec3 | undefined {
  const x = num(record, code)
  const y = num(record, code + 10)
  if (x === undefined || y === undefined) return undefined
  return { x, y, z: num(record, code + 20) ?? 0 }
}

export function finite(text: string): number | undefined {
  const value = Number.parseFloat(text)
  return Number.isFinite(value) ? value : undefined
}

/**
 * Walks a record's groups in order, for the objects whose groups repeat
 * (LWPOLYLINE's vertices, SPLINE's points, HATCH's loops and edges).
 */
export class GroupCursor {
  private index: number

  constructor(
    private readonly record: DxfRecord,
    from = 0
  ) {
    this.index = from
  }

  done(): boolean {
    return this.index >= this.record.codes.length
  }

  code(): number {
    return this.record.codes[this.index]
  }

  value(): string {
    return this.record.values[this.index]
  }

  number(): number {
    return finite(this.value()) ?? 0
  }

  next(): void {
    this.index++
  }

  /** Moves to the next group of `code` and reads it as a number; `undefined` at the end. */
  seek(code: number): number | undefined {
    while (!this.done()) {
      if (this.code() === code) {
        const value = this.number()
        this.next()
        return value
      }
      this.next()
    }
    return undefined
  }

  /**
   * Reads the group of `code` if it is the next one, as a number; otherwise
   * leaves the cursor where it is.
   */
  take(code: number): number | undefined {
    if (this.done() || this.code() !== code) return undefined
    const value = this.number()
    this.next()
    return value
  }

  /** A point whose X is the next group, of `code`, its Y the one after (Z when given). */
  takePoint(code: number, withZ = false): Vec3 | undefined {
    const x = this.take(code)
    if (x === undefined) return undefined
    const y = this.take(code + 10) ?? 0
    const z = withZ ? (this.take(code + 20) ?? 0) : 0
    return { x, y, z }
  }
}

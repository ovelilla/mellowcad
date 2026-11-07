import {
  DEFAULT_LAYER_COLOR,
  DEFAULT_LAYER_ID,
  Layer,
  LayerId,
  createLayer,
} from "../../domain/layers"
import {
  DEFAULT_LINETYPE_ID,
  LINETYPES,
  LinetypeId,
} from "../../domain/linetypes"
import { DEFAULT_LINEWEIGHT } from "../../domain/lineweights"
import {
  DEFAULT_TEXT_STYLE_ID,
  TextStyle,
  createTextStyle,
} from "../../domain/textStyles"
import {
  DEFAULT_DIM_STYLE_ID,
  DimStyle,
  clampDimStyle,
  createDimStyle,
} from "../../domain/dimStyles"
import { dxfLineweight } from "./dxfEntities"
import { aciColor, trueColor } from "./dxfColors"
import { DxfRecord } from "./dxfSections"
import { finite, int, num, str } from "./dxfValues"

/** A name's key in a table: AutoCAD's names are case-blind. */
function key(name: string): string {
  return name.trim().toUpperCase()
}

/**
 * The linetype an object or layer names, as the model holds it: ByLayer and
 * ByBlock none (the model has no ByBlock), one of the six by its name, one
 * whose dashes are one of the six's by that one's (WHY: a Spanish AutoCAD
 * writes acadiso.lin's DASHED as TRAZOS, docs/next-dxf.md), and any other by
 * its own name, which draws continuous until the model holds a drawing's own
 * linetypes.
 */
export function dxfLinetypes(
  records: readonly DxfRecord[]
): (name: string | undefined) => LinetypeId | undefined {
  const byKey = new Map<string, LinetypeId>()
  for (const def of LINETYPES) byKey.set(key(def.id), def.id)
  for (const record of records) {
    const name = str(record, 2)
    if (!name || byKey.has(key(name))) continue
    const twin = samePattern(record)
    if (twin) byKey.set(key(name), twin)
  }
  return (name) => {
    if (name === undefined || name.trim() === "") return undefined
    const k = key(name)
    if (k === "BYLAYER" || k === "BYBLOCK") return undefined
    return byKey.get(k) ?? name.trim()
  }
}

/** The registry's linetype drawn with the dashes this LTYPE record gives (49), if any. */
function samePattern(record: DxfRecord): LinetypeId | null {
  const dashes: number[] = []
  record.codes.forEach((code, i) => {
    if (code === 49) dashes.push(Math.abs(finite(record.values[i]) ?? NaN))
    // A dash with a shape or text in it (74) is no simple pattern.
    if (code === 74 && (finite(record.values[i]) ?? 0) !== 0) dashes.push(NaN)
  })
  if (dashes.length === 0 || dashes.some((d) => !Number.isFinite(d)))
    return null
  const match = LINETYPES.find(
    (def) =>
      def.pattern.length === dashes.length &&
      def.pattern.every(
        (d, i) => Math.abs(d - dashes[i]) <= 1e-6 * Math.max(1, d)
      )
  )
  return match?.id ?? null
}

/**
 * The LAYER table as the model's layers, and the id of each name. A frozen
 * layer opens off (WHY: there is no FREEZE here; off hides it the same), a
 * negative colour is off too, and a layer an object names that the table
 * lacks is made, as AutoCAD makes it (probe t-ent-only). A layer of an
 * external reference (`xref|layer`, flag 16) is left out with the xref.
 */
export class DxfLayers {
  private readonly byKey = new Map<string, Layer>()
  private readonly order: Layer[] = []

  constructor(
    records: readonly DxfRecord[],
    private readonly linetype: (
      name: string | undefined
    ) => LinetypeId | undefined
  ) {
    for (const record of records) {
      const name = str(record, 2)?.trim()
      const flags = int(record, 70) ?? 0
      if (!name || flags & 16 || this.byKey.has(key(name))) continue
      const index = int(record, 62) ?? 7
      const color =
        (int(record, 420) !== undefined
          ? trueColor(int(record, 420)!)
          : null) ??
        aciColor(Math.abs(index)) ??
        DEFAULT_LAYER_COLOR
      const lineweight = dxfLineweight(int(record, 370)) ?? DEFAULT_LINEWEIGHT
      const layer: Layer = {
        ...createLayer(
          name,
          color,
          this.linetype(str(record, 6)) ?? DEFAULT_LINETYPE_ID,
          lineweight,
          key(name) === "0" ? DEFAULT_LAYER_ID : undefined
        ),
        visible: index >= 0 && (flags & 1) === 0,
        locked: (flags & 4) !== 0,
      }
      this.add(layer)
    }
  }

  private add(layer: Layer): void {
    this.byKey.set(key(layer.name), layer)
    this.order.push(layer)
  }

  id(name: string | undefined): LayerId {
    const wanted = name?.trim() || "0"
    const known = this.byKey.get(key(wanted))
    if (known) return known.id
    const made =
      key(wanted) === "0"
        ? { ...createLayer("0", DEFAULT_LAYER_COLOR), id: DEFAULT_LAYER_ID }
        : createLayer(wanted)
    this.add(made)
    return made.id
  }

  layers(): Layer[] {
    return [...this.order]
  }
}

/** A table whose entries the model names by their name: STYLE, DIMSTYLE. */
class NamedTable<T extends { readonly id: string; readonly name: string }> {
  private readonly byKey = new Map<string, T>()

  constructor(
    entries: readonly T[],
    private readonly fallback: string
  ) {
    for (const entry of entries) {
      if (!this.byKey.has(key(entry.name)))
        this.byKey.set(key(entry.name), entry)
    }
  }

  id(name: string | undefined): string {
    return name
      ? (this.byKey.get(key(name))?.id ?? this.fallback)
      : this.fallback
  }

  entries(): T[] {
    return [...this.byKey.values()]
  }
}

/**
 * The STYLE table's text styles, by name with their fixed height (40): the
 * model's styles hold no font, width or obliquing, and draw Arial's metrics
 * whatever the font (`docs/next-dxf.md`). A shape file's entry (70's 1) is no
 * text style.
 */
export function dxfTextStyles(
  records: readonly DxfRecord[]
): NamedTable<TextStyle> {
  const styles: TextStyle[] = []
  for (const record of records) {
    const name = str(record, 2)?.trim()
    if (!name || (int(record, 70) ?? 0) & 1) continue
    styles.push(createTextStyle(name, Math.max(num(record, 40) ?? 0, 0)))
  }
  return new NamedTable(styles, DEFAULT_TEXT_STYLE_ID)
}

export type { NamedTable }

/**
 * The DIMSTYLE table: each variable the model holds, from its group. WHY the
 * imperial values for a group left out: AutoCAD writes only what differs from
 * them (f001's ISO-25 omits DIMSCALE 1; its Standard, all), the DXF
 * reference's defaults, not ISO-25's.
 */
export function dxfDimStyles(
  records: readonly DxfRecord[]
): NamedTable<DimStyle> {
  const styles: DimStyle[] = []
  for (const record of records) {
    const name = str(record, 2)?.trim()
    if (!name) continue
    const separator = int(record, 278) ?? 46
    styles.push(
      clampDimStyle(
        createDimStyle(name, {
          scale: num(record, 40) ?? 1,
          arrowSize: num(record, 41) ?? 0.18,
          extensionOffset: num(record, 42) ?? 0.0625,
          baselineSpacing: num(record, 43) ?? 0.38,
          extensionBeyond: num(record, 44) ?? 0.18,
          textHeight: num(record, 140) ?? 0.18,
          centerMark: num(record, 141) ?? 0.09,
          textGap: num(record, 147) ?? 0.09,
          decimals: int(record, 271) ?? 4,
          angleDecimals: int(record, 179) ?? 0,
          decimalSeparator: String.fromCharCode(separator),
          suppressTrailingZeros: ((int(record, 78) ?? 0) & 8) !== 0,
          forceLineInside: (int(record, 172) ?? 0) !== 0,
        })
      )
    )
  }
  return new NamedTable(styles, DEFAULT_DIM_STYLE_ID)
}

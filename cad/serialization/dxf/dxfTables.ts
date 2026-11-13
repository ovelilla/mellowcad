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
  Linetype,
  LinetypeElement,
  LinetypeId,
  MAX_LINETYPE_DESCRIPTION,
  linetypeNamed,
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

/** A drawing's LTYPE table as the model's, and the name of each linetype an object or layer names. */
export interface DxfLinetypes {
  readonly linetypes: readonly Linetype[]
  /** ByLayer and ByBlock none (the model has no ByBlock), any other the table's name in its case. */
  readonly name: (name: string | undefined) => LinetypeId | undefined
}

/**
 * The LTYPE table: each linetype with its description (3), its lengths (49)
 * and what a complex one draws after a length (74: 2 text, 4 shape, 1 an
 * absolute rotation, 8 upright; 75 the shape's number, 340 the STYLE that is
 * its text style or shape file, 46 scale, 50 rotation, 44 and 45 offset, 9 the
 * text; ltype/p06). ByLayer, ByBlock and an external reference's
 * (`xref|name`, flag 16) are no linetype of the model's; the six every drawing
 * holds (`LINETYPES`) are added after the file's when it lacks them.
 */
export function dxfLinetypes(
  records: readonly DxfRecord[],
  styles: readonly DxfRecord[]
): DxfLinetypes {
  const styleByHandle = new Map<string, DxfRecord>()
  for (const style of styles) {
    const handle = str(style, 5)?.trim().toUpperCase()
    if (handle) styleByHandle.set(handle, style)
  }
  const linetypes: Linetype[] = []
  for (const record of records) {
    const name = str(record, 2)?.trim()
    if (!name || (int(record, 70) ?? 0) & 16) continue
    const k = key(name)
    if (k === "BYLAYER" || k === "BYBLOCK" || linetypeNamed(linetypes, name)) {
      continue
    }
    linetypes.push(linetypeOf(name, record, styleByHandle))
  }
  for (const linetype of LINETYPES) {
    if (!linetypeNamed(linetypes, linetype.name)) linetypes.push(linetype)
  }
  return {
    linetypes,
    name: (name) => {
      if (name === undefined || name.trim() === "") return undefined
      const k = key(name)
      if (k === "BYLAYER" || k === "BYBLOCK") return undefined
      return linetypeNamed(linetypes, name.trim())?.name ?? name.trim()
    },
  }
}

function linetypeOf(
  name: string,
  record: DxfRecord,
  styleByHandle: ReadonlyMap<string, DxfRecord>
): Linetype {
  const pattern: number[] = []
  const elements: LinetypeElement[] = []
  let groups: Map<number, string> | null = null
  const flush = () => {
    if (!groups) return
    const read = readElement(groups, pattern.length - 1, styleByHandle)
    if (read) elements.push(read)
    groups = null
  }
  record.codes.forEach((code, i) => {
    const value = record.values[i]
    if (code === 49) {
      flush()
      pattern.push(finite(value) ?? 0)
    } else if (pattern.length > 0 && ELEMENT_CODES.has(code)) {
      groups ??= new Map()
      groups.set(code, value)
    }
  })
  flush()
  return {
    name,
    description: (str(record, 3) ?? "").slice(0, MAX_LINETYPE_DESCRIPTION),
    pattern,
    ...(elements.length > 0 && { elements }),
  }
}

/** The groups that follow a length (49) and describe what it draws. */
const ELEMENT_CODES = new Set([74, 75, 340, 46, 50, 44, 45, 9])

/** A complex linetype's text or shape, or `null` for a plain length (74 is 0) or one that cannot be drawn. */
function readElement(
  groups: ReadonlyMap<number, string>,
  index: number,
  styleByHandle: ReadonlyMap<string, DxfRecord>
): LinetypeElement | null {
  const value = (code: number) => {
    const text = groups.get(code)
    return text === undefined ? undefined : finite(text)
  }
  const flags = value(74) ?? 0
  if ((flags & 6) === 0) return null
  const style = styleByHandle.get((groups.get(340) ?? "").trim().toUpperCase())
  const placement = {
    index,
    scale: value(46) ?? 1,
    // In degrees in the file (`50|180.0`), in radians to entget (ltype/p06).
    rotation: ((value(50) ?? 0) * Math.PI) / 180,
    rotationMode: (flags & 1
      ? "absolute"
      : flags & 8
        ? "upright"
        : "relative") as LinetypeElement["rotationMode"],
    offset: { x: value(44) ?? 0, y: value(45) ?? 0 },
  }
  if (flags & 2) {
    return {
      kind: "text",
      text: groups.get(9) ?? "",
      style: (style && str(style, 2)?.trim()) || DEFAULT_TEXT_STYLE_ID,
      ...placement,
    }
  }
  const shapeFile = style && str(style, 3)?.trim()
  return shapeFile
    ? { kind: "shape", shape: value(75) ?? 0, shapeFile, ...placement }
    : null
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
/**
 * Whether each dimension style puts its text above the line, by its name in
 * capitals: DIMTAD (77) other than 0, absent 0 (the imperial initial value).
 * The model's styles hold no DIMTAD; a leader keeps a 0 as its own.
 */
export function dxfDimStyleTextAbove(
  records: readonly DxfRecord[]
): (name: string | undefined) => boolean {
  const above = new Map<string, boolean>()
  for (const record of records) {
    const name = str(record, 2)?.trim()
    if (name) above.set(name.toUpperCase(), (int(record, 77) ?? 0) !== 0)
  }
  return (name) => above.get((name ?? "").trim().toUpperCase()) ?? true
}

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

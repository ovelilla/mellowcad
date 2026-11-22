import { Vec2 } from "../../geometry/Vec2"
import {
  BlockDefinition,
  Entity,
  MTEXT_ATTACHMENTS,
  STANDARD_TABLE_STYLE,
  STANDARD_MLEADER_STYLE,
  TableRowStyle,
  TableStyleData,
  createBlockDefinition,
  leaderLook,
  leaderInPlaneOf,
  leaderOffsetRead,
  samePlane,
} from "../../domain/entities"
import { DEFAULT_DIM_STYLE, DimStyle } from "../../domain/dimStyles"
import { ParsedDrawing, withLinetypeTable } from "../drawingFile"
import { dxfGroups } from "./dxfGroups"
import { DxfBlock, DxfRecord, dxfSections } from "./dxfSections"
import {
  DxfBlockTarget,
  DxfEntityContext,
  type DxfImageDefinition,
  dxfEntities,
  inPaperSpace,
} from "./dxfEntities"
import { dxfMLeaderStyles } from "./dxfMLeader"
import {
  DxfLayers,
  dxfDimStyleTextAbove,
  dxfDimStyles,
  dxfLinetypes,
  dxfTextStyles,
} from "./dxfTables"
import { dxfSettings } from "./dxfHeader"
import { finite, int, point, str } from "./dxfValues"
import type { TextStyleId } from "../../domain/textStyles"

export { DxfReadError, looksLikeDxf } from "./dxfFormat"

/**
 * WIPEOUTFRAME, which is no header variable: AutoCAD 2027 keeps it as the
 * drawing variable of its name (a DICTIONARYVAR of AcDbVariableDictionary,
 * 0 to 2) and as the WIPEOUTVARIABLES object's 70, 0 for OFF and 1 for the
 * rest, which is all an older drawing holds (wipeout/w15, w16).
 */
function dxfWipeoutFrame(objects: readonly DxfRecord[]): number | undefined {
  const dictionary = objects.find(
    (o) =>
      o.type === "DICTIONARY" &&
      o.codes.some(
        (code, i) => code === 3 && o.values[i].trim() === "WIPEOUTFRAME"
      )
  )
  if (dictionary) {
    const at = dictionary.codes.findIndex(
      (code, i) => code === 3 && dictionary.values[i].trim() === "WIPEOUTFRAME"
    )
    const handle =
      at >= 0 && dictionary.codes[at + 1] === 350
        ? dictionary.values[at + 1].trim().toUpperCase()
        : undefined
    const variable = objects.find(
      (o) =>
        o.type === "DICTIONARYVAR" && str(o, 5)?.trim().toUpperCase() === handle
    )
    const value = variable ? Number(str(variable, 1)) : NaN
    if (Number.isInteger(value)) return value
  }
  const variables = objects.find((o) => o.type === "WIPEOUTVARIABLES")
  return variables ? int(variables, 70) : undefined
}

/**
 * IMAGEFRAME, which is no header variable either: the RASTERVARIABLES
 * object's 70, whose 1 shows the frame and 2 keeps it off the plot, so
 * IMAGEFRAME 2 is 3 (image/i08, i09; 2 alone reads as 1, fr2).
 */
function dxfImageFrame(objects: readonly DxfRecord[]): 0 | 1 | 2 | undefined {
  const variables = objects.find((o) => o.type === "RASTERVARIABLES")
  const flags = variables ? int(variables, 70) : undefined
  if (flags === undefined) return undefined
  return (flags & 1) === 0 ? 0 : flags & 2 ? 2 : 1
}

/**
 * Each table style by its handle (TABLESTYLE, table/t00): its name from
 * ACAD_TABLESTYLE, else its description (3), its flow (70), margins (40,
 * 41), title and header suppressed (the 280 and 281 after them), and its
 * three runs, data, title and header, each from its text style (7) with its
 * height (140) and alignment (170).
 */
function dxfTableStyles(
  objects: readonly DxfRecord[],
  textStyle: (name: string | undefined) => TextStyleId
): Map<string, TableStyleData> {
  const names = new Map<string, string>()
  for (const dictionary of objects) {
    if (dictionary.type !== "DICTIONARY") continue
    dictionary.codes.forEach((code, i) => {
      if (code !== 3 || dictionary.codes[i + 1] !== 350) return
      const handle = dictionary.values[i + 1].trim().toUpperCase()
      names.set(handle, dictionary.values[i].trim())
    })
  }
  const styles = new Map<string, TableStyleData>()
  for (const record of objects) {
    if (record.type !== "TABLESTYLE") continue
    const handle = str(record, 5)?.trim().toUpperCase()
    if (!handle) continue
    const start = Math.max(
      0,
      record.codes.findIndex(
        (code, i) =>
          code === 100 && record.values[i].trim() === "AcDbTableStyle"
      )
    )
    const at = (code: number, from = start) => {
      const i = record.codes.indexOf(code, from)
      return i < 0 ? undefined : i
    }
    const value = (i: number | undefined) =>
      i === undefined ? undefined : finite(record.values[i])
    const marginAt = at(41)
    const runs = record.codes
      .map((code, i) => (code === 7 && i > start ? i : -1))
      .filter((i) => i >= 0)
    const base = STANDARD_TABLE_STYLE
    const run = (k: number, fallback: TableRowStyle): TableRowStyle => {
      const from = runs[k]
      if (from === undefined) return fallback
      const to = runs[k + 1] ?? record.codes.length
      const inRun = (code: number) => {
        const i = at(code, from)
        return i !== undefined && i < to ? value(i) : undefined
      }
      const height = inRun(140)
      const alignment = inRun(170)
      return {
        textStyleId: textStyle(record.values[from].trim() || undefined),
        textHeight:
          height !== undefined && height > 0 ? height : fallback.textHeight,
        alignment:
          (alignment !== undefined && MTEXT_ATTACHMENTS[alignment - 1]) ||
          fallback.alignment,
      }
    }
    const margin = (code: number, fallback: number) => {
      const v = value(at(code))
      return v !== undefined && v >= 0 ? v : fallback
    }
    const suppressed = (code: number) =>
      marginAt !== undefined && value(at(code, marginAt)) === 1
    const name =
      names.get(handle) ?? (str(record, 3)?.trim() || STANDARD_TABLE_STYLE.name)
    styles.set(handle, {
      name,
      horizontalMargin: margin(40, base.horizontalMargin),
      verticalMargin: margin(41, base.verticalMargin),
      ...(value(at(70)) === 1 ? { flowsUp: true as const } : {}),
      ...(suppressed(280) ? { titleSuppressed: true as const } : {}),
      ...(suppressed(281) ? { headerSuppressed: true as const } : {}),
      data: run(0, base.data),
      title: run(1, base.title),
      header: run(2, base.header),
    })
  }
  return styles
}

/**
 * Each image definition by its handle: its name from ACAD_IMAGE_DICT, else
 * its file's (as -IMAGE Attach names one), its path, its size in pixels and
 * one pixel's (10, 20, 11, 281: image/i08), which AutoCAD frames an image
 * it cannot find by (fr v3: the definition's size wins over the IMAGE's 13).
 */
function dxfImageDefinitions(
  objects: readonly DxfRecord[]
): Map<string, DxfImageDefinition> {
  const names = new Map<string, string>()
  for (const dictionary of objects) {
    if (dictionary.type !== "DICTIONARY") continue
    dictionary.codes.forEach((code, i) => {
      if (code !== 3 || dictionary.codes[i + 1] !== 350) return
      const handle = dictionary.values[i + 1].trim().toUpperCase()
      names.set(handle, dictionary.values[i].trim())
    })
  }
  const definitions = new Map<string, DxfImageDefinition>()
  for (const record of objects) {
    if (record.type !== "IMAGEDEF") continue
    const handle = str(record, 5)?.trim().toUpperCase()
    if (!handle) continue
    const path = str(record, 1)?.trim() ?? ""
    const file = path.split(/[\\/]/).pop() ?? ""
    const size = point(record, 10)
    const pixel = point(record, 11)
    definitions.set(handle, {
      reference: {
        name: names.get(handle) ?? file.replace(/\.[^.]*$/, ""),
        path,
        ...(pixel && pixel.x > 0 ? { pixelSize: pixel.x } : {}),
        ...(int(record, 281) !== undefined ? { units: int(record, 281) } : {}),
      },
      ...(size && size.x > 0 && size.y > 0
        ? { width: size.x, height: size.y }
        : {}),
    })
  }
  return definitions
}

/** What opening a DXF left out, which the command line says (`docs/next-dxf.md`). */
export interface DxfOpenReport {
  /** Objects of a type the model has none of, counted by their DXF type (`POINT`). */
  readonly leftOut: ReadonlyMap<string, number>
  /**
   * The external references the drawing defines, in its order: each opens
   * as AutoCAD opens one it cannot find, for there is no disk here to find
   * it on (`docs/coverage/clipboard-and-files.md`, DXFIN).
   */
  readonly xrefs: readonly DxfXref[]
  /** Objects in a layout's paper space: there are no layouts here. */
  readonly inLayouts: number
  /** Objects of a known type too malformed to make, which AutoCAD would have refused the file for. */
  readonly unreadable: number
}

/** An external reference's name and the path its file gives. */
export interface DxfXref {
  readonly name: string
  readonly path: string
}

export interface ParsedDxf {
  readonly drawing: ParsedDrawing
  readonly report: DxfOpenReport
}

/** A model or paper space block, which holds no definition: R12 names them with `$`. */
function spaceBlock(name: string): "model" | "paper" | null {
  const n = name.toUpperCase()
  if (n === "*MODEL_SPACE" || n === "$MODEL_SPACE") return "model"
  if (n.startsWith("*PAPER_SPACE") || n.startsWith("$PAPER_SPACE"))
    return "paper"
  return null
}

/**
 * Reads a DXF — ASCII or binary, R12 to 2018 — as the drawing the model holds
 * and a report of what it left out. Throws a `DxfReadError` for what is no
 * DXF or ends inside a section: what AutoCAD discards whole. Everything else
 * opens, more than AutoCAD's strict reader takes (`docs/next-dxf.md`).
 */
export function parseDxf(file: Uint8Array | string): ParsedDxf {
  const dxf = dxfSections(dxfGroups(file))
  const table = (name: string) => dxf.tables.get(name) ?? []
  const header = (name: string, code: number) => {
    const record = dxf.header.get(name)
    return record ? str(record, code) : undefined
  }
  const version = Number.parseInt(
    (header("$ACADVER", 1) ?? "AC1009").slice(2),
    10
  )
  const linetypes = dxfLinetypes(table("LTYPE"), table("STYLE"))
  const linetype = linetypes.name
  const layers = new DxfLayers(table("LAYER"), linetype)
  const textStyles = dxfTextStyles(table("STYLE"))
  const dimStyles = dxfDimStyles(table("DIMSTYLE"))
  const dimStyleTextAbove = dxfDimStyleTextAbove(table("DIMSTYLE"))
  const leftOut = new Map<string, number>()
  let inLayouts = 0
  let unreadable = 0

  const targets = new Map<string, DxfBlockTarget | "dependent">()
  const definitions: DxfBlock[] = []
  const xrefs: (DxfXref & { overlay: boolean; z: number })[] = []
  for (const block of dxf.blocks) {
    const name = (str(block.record, 2) ?? str(block.record, 3))?.trim()
    if (!name) continue
    const space = spaceBlock(name)
    if (space === "paper") inLayouts += countable(block.entities)
    // A dimension's geometry block (*D): the model draws dimensions from
    // their points; a table's (*T), as AutoCAD does, from its cells (table/t01).
    if (space || /^\*[DT]\d*$/i.test(name)) continue
    const flags = int(block.record, 70) ?? 0
    const key = name.toUpperCase()
    if (targets.has(key)) continue
    const base = point(block.record, 10) ?? { x: 0, y: 0, z: 0 }
    if (flags & (4 | 8)) {
      // An xref nested in another (16, dependent) goes with it: of an xref
      // it cannot find AutoCAD keeps nothing it brought (probe xref/p04, its
      // DXFOUT). An xref's objects are its drawing's, never in the file.
      if (flags & 16) {
        targets.set(key, "dependent")
        continue
      }
      targets.set(key, { id: name, basePoint: { x: base.x, y: base.y } })
      xrefs.push({
        name,
        path: str(block.record, 1)?.trim() ?? "",
        overlay: (flags & 8) !== 0,
        z: base.z,
      })
      continue
    }
    targets.set(key, { id: name, basePoint: { x: base.x, y: base.y } })
    definitions.push(block)
  }

  const viewports = table("VPORT")
  const active = viewports.find(
    (v) => str(v, 2)?.trim().toUpperCase() === "*ACTIVE"
  )
  const wipeoutFrame = dxfWipeoutFrame(dxf.objects)
  const imageFrame = dxfImageFrame(dxf.objects)
  const images = dxfImageDefinitions(dxf.objects)
  const tableStyles = dxfTableStyles(dxf.objects, (name) => textStyles.id(name))
  const styleNames = new Map(
    table("STYLE").flatMap((record) => {
      const handle = str(record, 5)?.trim().toUpperCase()
      const name = str(record, 2)?.trim()
      return handle && name ? [[handle, name] as const] : []
    })
  )
  const textStyleByHandle = (handle: string | undefined) =>
    textStyles.id(handle ? styleNames.get(handle.toUpperCase()) : undefined)
  const mleaderStyles = dxfMLeaderStyles(dxf.objects, textStyleByHandle)
  const blockRecords = new Map(
    table("BLOCK_RECORD").flatMap((record) => {
      const handle = str(record, 5)?.trim().toUpperCase()
      const name = str(record, 2)?.trim()
      return handle && name ? [[handle, name] as const] : []
    })
  )
  const settings = {
    ...dxfSettings(dxf.header, active, table("UCS"), linetype),
    ...(wipeoutFrame === 0 || wipeoutFrame === 1 || wipeoutFrame === 2
      ? { wipeoutFrame: wipeoutFrame as 0 | 1 | 2 }
      : {}),
    ...(imageFrame !== undefined ? { imageFrame } : {}),
  }
  const ctx: DxfEntityContext = {
    layer: (name) => layers.id(name),
    linetype,
    textStyle: (name) => textStyles.id(name),
    dimStyle: (name) => dimStyles.id(name),
    dimStyleTextAbove,
    block: (name) => targets.get(name.toUpperCase()) ?? null,
    image: (handle) => images.get(handle.trim().toUpperCase()) ?? null,
    tableStyle: (handle) =>
      tableStyles.get(handle.trim().toUpperCase()) ?? {
        ...STANDARD_TABLE_STYLE,
        data: {
          ...STANDARD_TABLE_STYLE.data,
          textStyleId: textStyles.id("Standard"),
        },
        title: {
          ...STANDARD_TABLE_STYLE.title,
          textStyleId: textStyles.id("Standard"),
        },
        header: {
          ...STANDARD_TABLE_STYLE.header,
          textStyleId: textStyles.id("Standard"),
        },
      },
    blockRecord: (handle) =>
      blockRecords.get(handle.trim().toUpperCase()) ?? null,
    textStyleByHandle,
    mleaderStyle: (handle) =>
      (handle && mleaderStyles.get(handle.toUpperCase())) || {
        ...STANDARD_MLEADER_STYLE,
        textStyleId: textStyles.id("Standard"),
      },
    blockByRecord: (handle) => {
      const name = blockRecords.get(handle.trim().toUpperCase())
      const target = name ? targets.get(name.toUpperCase()) : undefined
      return target && target !== "dependent" ? target.id : null
    },
    splineSegments: settings.splineSegments,
    hatchSplineFitData: version >= 1024,
    leftOut: (type) => leftOut.set(type, (leftOut.get(type) ?? 0) + 1),
    unreadable: () => {
      unreadable++
    },
  }

  const styles = new Map(dimStyles.entries().map((s) => [s.id, s]))
  const styleOf = (id: string): DimStyle => styles.get(id) ?? DEFAULT_DIM_STYLE
  /**
   * One space's objects, each leader linked to the MTEXT or block reference
   * its 340 names, when that is in the same space, and its offset from it read
   * off where they stand (DXF 213 and 212 are relative to where AutoCAD puts
   * the text, which this reads the same way: leader/p14, p22).
   */
  const readSpace = (records: readonly DxfRecord[]): Entity[] => {
    const out: Entity[] = []
    const byHandle = new Map<string, Entity>()
    const pending: { index: number; handle: string }[] = []
    for (const record of records) {
      // WHY an invisible object (60 1) is not opened, silently: AutoCAD draws
      // and selects none, and they are the hidden states of a dynamic block's
      // visibility parameter (13,793 of 43 of its samples: an arrow's other
      // turns, a tag's other shapes, the Annotation blocks' gradients), which
      // this model has not; drawn, they pile up over the state shown.
      if (int(record, 60) === 1) continue
      const made = dxfEntities(record, ctx)
      const handle = str(record, 5)?.trim().toUpperCase()
      if (
        handle &&
        made[0] &&
        (record.type === "MTEXT" || record.type === "INSERT")
      ) {
        byHandle.set(handle, made[0])
      }
      const target = str(record, 340)?.trim().toUpperCase()
      if (record.type === "LEADER" && made[0] && target && target !== "0") {
        pending.push({ index: out.length, handle: target })
      }
      out.push(...made)
    }
    for (const { index, handle } of pending) {
      const read = out[index]
      const annotation = byHandle.get(handle)
      if (read?.type !== "leader" || !annotation) continue
      if (annotation.type !== "mtext" && annotation.type !== "insert") continue
      // A leader linked to an object in another plane would mix two frames;
      // one in its plane facing the other way is read in the object's.
      const leader = samePlane(read, annotation)
        ? read
        : leaderInPlaneOf(read, annotation)
      if (!leader) continue
      const linked = {
        ...leader,
        annotation: {
          kind:
            annotation.type === "mtext"
              ? ("mtext" as const)
              : ("block" as const),
          id: annotation.id,
        },
      }
      out[index] = leaderOffsetRead(
        linked,
        annotation,
        leaderLook(linked, styleOf(linked.styleId))
      )
    }
    return out
  }

  const external: BlockDefinition[] = xrefs.map((xref) => {
    const target = targets.get(xref.name.toUpperCase()) as DxfBlockTarget
    return {
      ...createBlockDefinition(target.id, target.basePoint as Vec2, [], xref.z),
      xref: { path: xref.path, ...(xref.overlay ? { overlay: true } : {}) },
    }
  })
  const blocks: BlockDefinition[] = definitions.map((block) => {
    const target = targets.get(
      (str(block.record, 2) ?? str(block.record, 3))!.trim().toUpperCase()
    ) as DxfBlockTarget
    const base = point(block.record, 10)
    return createBlockDefinition(
      target.id,
      target.basePoint as Vec2,
      readSpace(block.entities),
      base?.z ?? 0
    )
  })

  const modelRecords: DxfRecord[] = []
  for (const record of dxf.entities) {
    if (!inPaperSpace(record)) modelRecords.push(record)
    else if (countable([record])) inLayouts++
  }
  const entities = readSpace(modelRecords)

  return {
    drawing: withLinetypeTable({
      settings,
      layers: layers.layers(),
      currentLayerId: layers.id(header("$CLAYER", 8)),
      linetypes: [...linetypes.linetypes],
      textStyles: textStyles.entries(),
      currentTextStyleId: textStyles.id(header("$TEXTSTYLE", 7)),
      dimStyles: dimStyles.entries(),
      currentDimStyleId: dimStyles.id(header("$DIMSTYLE", 2)),
      blocks: [...blocks, ...external],
      entities,
    }),
    report: {
      leftOut,
      xrefs: xrefs.map(({ name, path }) => ({ name, path })),
      inLayouts,
      unreadable,
    },
  }
}

/** The objects of a layout worth counting: not its viewports, the windows onto the model. */
function countable(records: readonly DxfRecord[]): number {
  return records.filter((r) => r.type !== "VIEWPORT").length
}

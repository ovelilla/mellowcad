import { Vec2 } from "../../geometry/Vec2"
import {
  BlockDefinition,
  Entity,
  createBlockDefinition,
} from "../../domain/entities"
import { ParsedDrawing } from "../drawingFile"
import { dxfGroups } from "./dxfGroups"
import { DxfBlock, DxfRecord, dxfSections } from "./dxfSections"
import {
  DxfBlockTarget,
  DxfEntityContext,
  dxfEntities,
  inPaperSpace,
} from "./dxfEntities"
import {
  DxfLayers,
  dxfDimStyles,
  dxfLinetypes,
  dxfTextStyles,
} from "./dxfTables"
import { dxfSettings } from "./dxfHeader"
import { int, point, str } from "./dxfValues"

export { DxfReadError, looksLikeDxf } from "./dxfFormat"

/** What opening a DXF left out, which the command line says (`docs/next-dxf.md`). */
export interface DxfOpenReport {
  /** Objects of a type the model has none of, counted by their DXF type (`POINT`), and references to external drawings (`XREF`). */
  readonly leftOut: ReadonlyMap<string, number>
  /** Objects in a layout's paper space: there are no layouts here. */
  readonly inLayouts: number
  /** Objects of a known type too malformed to make, which AutoCAD would have refused the file for. */
  readonly unreadable: number
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
  const linetype = dxfLinetypes(table("LTYPE"))
  const layers = new DxfLayers(table("LAYER"), linetype)
  const textStyles = dxfTextStyles(table("STYLE"))
  const dimStyles = dxfDimStyles(table("DIMSTYLE"))
  const leftOut = new Map<string, number>()
  let inLayouts = 0
  let unreadable = 0

  const targets = new Map<string, DxfBlockTarget | "xref">()
  const definitions: DxfBlock[] = []
  for (const block of dxf.blocks) {
    const name = (str(block.record, 2) ?? str(block.record, 3))?.trim()
    if (!name) continue
    const space = spaceBlock(name)
    if (space === "paper") inLayouts += countable(block.entities)
    // A dimension's geometry block (*D): the model draws dimensions from their points.
    if (space || /^\*D\d*$/i.test(name)) continue
    const flags = int(block.record, 70) ?? 0
    const key = name.toUpperCase()
    if (targets.has(key)) continue
    if (flags & (4 | 8)) {
      targets.set(key, "xref")
      continue
    }
    const base = point(block.record, 10) ?? { x: 0, y: 0, z: 0 }
    targets.set(key, { id: name, basePoint: { x: base.x, y: base.y } })
    definitions.push(block)
  }

  const viewports = table("VPORT")
  const active = viewports.find(
    (v) => str(v, 2)?.trim().toUpperCase() === "*ACTIVE"
  )
  const settings = dxfSettings(dxf.header, active, linetype)
  const ctx: DxfEntityContext = {
    layer: (name) => layers.id(name),
    linetype,
    textStyle: (name) => textStyles.id(name),
    dimStyle: (name) => dimStyles.id(name),
    block: (name) => targets.get(name.toUpperCase()) ?? null,
    splineSegments: settings.splineSegments,
    hatchSplineFitData: version >= 1024,
    leftOut: (type) => leftOut.set(type, (leftOut.get(type) ?? 0) + 1),
    unreadable: () => {
      unreadable++
    },
  }

  const blocks: BlockDefinition[] = definitions.map((block) => {
    const target = targets.get(
      (str(block.record, 2) ?? str(block.record, 3))!.trim().toUpperCase()
    ) as DxfBlockTarget
    const base = point(block.record, 10)
    return createBlockDefinition(
      target.id,
      target.basePoint as Vec2,
      block.entities.flatMap((record) => dxfEntities(record, ctx)),
      base?.z ?? 0
    )
  })

  const entities: Entity[] = []
  for (const record of dxf.entities) {
    if (inPaperSpace(record)) {
      if (countable([record])) inLayouts++
      continue
    }
    entities.push(...dxfEntities(record, ctx))
  }

  return {
    drawing: {
      settings,
      layers: layers.layers(),
      currentLayerId: layers.id(header("$CLAYER", 8)),
      textStyles: textStyles.entries(),
      currentTextStyleId: textStyles.id(header("$TEXTSTYLE", 7)),
      dimStyles: dimStyles.entries(),
      currentDimStyleId: dimStyles.id(header("$DIMSTYLE", 2)),
      blocks,
      entities,
    },
    report: { leftOut, inLayouts, unreadable },
  }
}

/** The objects of a layout worth counting: not its viewports, the windows onto the model. */
function countable(records: readonly DxfRecord[]): number {
  return records.filter((r) => r.type !== "VIEWPORT").length
}

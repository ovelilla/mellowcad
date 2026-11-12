import { Vec2 } from "../../geometry/Vec2"
import { Axes3, arbitraryAxis, axesToWorld } from "../../geometry/ocs"
import {
  BlockDefinition,
  BlockLookup,
  DimensionEntity,
  Entity,
  InsertEntity,
  createInsert,
  entitiesBounds,
} from "../../domain/entities"
import { anonymousBlockName } from "../../domain/blocks"
import {
  arrayItems,
  arraySourceItem,
  placeArrayItem,
} from "../../domain/arrays"
import { dimensionGeometry } from "../../domain/dimensions"
import { DimStyle, DEFAULT_DIM_STYLE } from "../../domain/dimStyles"
import { LINETYPES, LINETYPE_BYLAYER } from "../../domain/linetypes"
import { LINEWEIGHT_BYLAYER } from "../../domain/lineweights"
import { COLOR_BYLAYER } from "../../domain/colors"
import { DEFAULT_LAYER_ID } from "../../domain/layers"
import { LengthUnit } from "../../domain/units"
import { DrawingSnapshot } from "../drawingFile"
import { DxfOut } from "./dxfOut"
import { aciIndex } from "./dxfColors"
import {
  DxfWriteContext,
  color,
  layerLineweight,
  writeEntity,
} from "./dxfWriteEntities"

/** The DXF versions SAVEAS and DXFOUT write, as their Version prompt names them (probe x003). */
export type DxfVersion = "2000" | "2004" | "2007" | "2010" | "2013" | "2018"

/** Each version's $ACADVER. */
const ACADVER: Readonly<Record<DxfVersion, string>> = {
  "2000": "AC1015",
  "2004": "AC1018",
  "2007": "AC1021",
  "2010": "AC1024",
  "2013": "AC1027",
  "2018": "AC1032",
}

/** How a DXF is written: SAVEAS's DXF Options, DXFOUT's prompt. */
export interface DxfSaveOptions {
  readonly version: DxfVersion
  /** Binary instead of ASCII (the Binary keyword, the Format option). */
  readonly binary: boolean
  /** Decimal places of accuracy, 0 to 16. */
  readonly precision: number
  /** select Objects: only these of the drawing's objects; absent, all of them. */
  readonly objects?: readonly Entity[]
}

/** What the file could not hold, counted by DXF type (`3DSOLID`). */
export interface DxfSaveReport {
  readonly leftOut: ReadonlyMap<string, number>
}

export interface SavedDxf {
  readonly bytes: Uint8Array
  readonly report: DxfSaveReport
}

/** acadiso.lin's descriptions of the six linetypes, written with their patterns. */
const LINETYPE_TEXT: Readonly<Record<string, string>> = {
  Dashed: "Dashed __ __ __ __ __ __ __ __ __ __ __ __ __ _",
  Hidden: "Hidden __ __ __ __ __ __ __ __ __ __ __ __ __ __",
  Center: "Center ____ _ ____ _ ____ _ ____ _ ____ _ ____",
  Phantom: "Phantom ______  __  __  ______  __  __  ______",
  DashDot: "Dash dot __ . __ . __ . __ . __ . __ . __ . __",
}

const INSUNITS: Readonly<Record<LengthUnit, number>> = {
  [LengthUnit.Millimeter]: 4,
  [LengthUnit.Centimeter]: 5,
  [LengthUnit.Meter]: 6,
}

/** A block the file holds: the drawing's, an array's items, a dimension's geometry. */
interface WrittenBlock {
  readonly name: string
  readonly record: string
  readonly basePoint: Vec2
  readonly baseZ: number
  readonly anonymous: boolean
  write(ctx: DxfWriteContext, owner: string): void
}

/**
 * Writes a drawing as a DXF of 2000 to 2018, ASCII or binary, as AutoCAD
 * 2027's SAVEAS and DXFOUT write one (probes dxf/x001–x021): what the model
 * holds, in the tables, blocks and objects AutoCAD reads it back from, and
 * a report of the objects a DXF of ours cannot hold (ACIS).
 */
export function writeDxf(
  drawing: DrawingSnapshot,
  options: DxfSaveOptions
): SavedDxf {
  const version = Number.parseInt(ACADVER[options.version].slice(2), 10)
  const precision = Math.min(16, Math.max(0, Math.round(options.precision)))
  const codePage = version < 1021
  const body = new DxfOut(options.binary, precision, codePage, false)
  let nextHandle = 0x20
  const handle = () => (nextHandle++).toString(16).toUpperCase()
  const leftOut = new Map<string, number>()

  const blocksById = new Map(drawing.blocks.map((b) => [b.id, b]))
  const lookup: BlockLookup = Object.assign(
    (id: string) => blocksById.get(id),
    { attributeDisplay: drawing.settings.attributeDisplay }
  )
  const layers = new Map(drawing.layers.map((l) => [l.id, l]))
  const textStyles = new Map(drawing.textStyles.map((s) => [s.id, s]))
  const dimStyles = new Map(drawing.dimStyles.map((s) => [s.id, s]))
  const modelEntities = options.objects ?? drawing.entities

  // The fixed tables' handles, as a new AutoCAD drawing numbers them.
  const T = {
    blockRecords: "1",
    layers: "2",
    styles: "3",
    linetypes: "5",
    views: "6",
    ucs: "7",
    vports: "8",
    appids: "9",
    dimstyles: "A",
    rootDictionary: "C",
    groups: "D",
    plotStyles: "E",
    normalPlotStyle: "F",
    modelRecord: "1F",
    paperRecord: "1E",
    modelBlock: "1B",
    modelEnd: "1C",
    paperBlock: "1D",
    paperEnd: "1A",
    byBlock: "14",
    byLayer: "15",
    continuous: "16",
    acad: "12",
  }

  // Every block the file holds, named before the tables list them.
  const written: WrittenBlock[] = []
  const takenNames = drawing.blocks.map((b) => ({ name: b.name }))
  const dimensionBlocks = new Map<DimensionEntity, string>()
  const arrayBlocks = new Map<InsertEntity, string>()
  let dimensionCount = 0
  const nextDimensionName = () => {
    let name: string
    do name = `*D${++dimensionCount}`
    while (takenNames.some((b) => b.name.toUpperCase() === name))
    takenNames.push({ name })
    return name
  }

  const styleOf = (id: string): DimStyle =>
    dimStyles.get(id) ?? DEFAULT_DIM_STYLE

  const ctx: DxfWriteContext = {
    out: body,
    version,
    handle,
    layerName: (id) => layers.get(id)?.name ?? "0",
    textStyleName: (id) => textStyles.get(id)?.name ?? "Standard",
    dimStyleName: (id) => dimStyles.get(id)?.name ?? "ISO-25",
    dimStyle: styleOf,
    blockName: (id) => blocksById.get(id)?.name ?? id,
    block: (id) => blocksById.get(id),
    dimensionBlock: (dimension) => dimensionBlocks.get(dimension) ?? "",
    arrayBlock: (insert) => arrayBlocks.get(insert) ?? null,
    leftOut: (type) => leftOut.set(type, (leftOut.get(type) ?? 0) + 1),
  }

  const plan = (entities: readonly Entity[]): void => {
    for (const entity of entities) {
      if (entity.type === "dimension") {
        const name = nextDimensionName()
        dimensionBlocks.set(entity, name)
        written.push(dimensionBlock(name, handle(), entity, styleOf))
      } else if (entity.type === "insert" && entity.array) {
        const name = anonymousBlockName(takenNames)
        takenNames.push({ name })
        arrayBlocks.set(entity, name)
        const source = blocksById.get(entity.blockId)
        written.push(arrayBlock(name, handle(), entity, source))
      }
    }
  }
  for (const block of drawing.blocks) {
    written.push({
      name: block.name,
      record: handle(),
      basePoint: block.basePoint,
      baseZ: block.baseElevation ?? 0,
      anonymous: block.name.startsWith("*"),
      write: (c, owner) => {
        for (const e of block.entities) writeEntity(c, e, owner)
      },
    })
  }
  for (const block of drawing.blocks) plan(block.entities)
  plan(modelEntities)

  const linetypes = usedLinetypes(drawing, modelEntities)

  // TABLES
  const out = body
  out.str(0, "SECTION")
  out.str(2, "TABLES")
  table(out, "VPORT", T.vports, 1)
  activeViewport(out, handle(), T.vports, drawing, modelEntities, lookup)
  out.str(0, "ENDTAB")

  table(out, "LTYPE", T.linetypes, linetypes.length + 3)
  linetype(out, T.byBlock, T.linetypes, "ByBlock", "", [])
  linetype(out, T.byLayer, T.linetypes, "ByLayer", "", [])
  linetype(out, T.continuous, T.linetypes, "Continuous", "Solid line", [])
  for (const name of linetypes) {
    const def = LINETYPES.find((l) => l.id === name)
    linetype(
      out,
      handle(),
      T.linetypes,
      def ? name.toUpperCase() : name,
      LINETYPE_TEXT[name] ?? "",
      def?.pattern ?? []
    )
  }
  out.str(0, "ENDTAB")

  table(out, "LAYER", T.layers, drawing.layers.length)
  for (const layer of drawing.layers) {
    record(out, "LAYER", handle(), T.layers, "AcDbLayerTableRecord")
    out.str(2, layer.name)
    out.int(70, layer.locked ? 4 : 0)
    const rgb = Number.parseInt(layer.color.slice(1), 16)
    const { index, exact } = aciIndex(rgb)
    // An off layer's colour is negative (the reader's DxfLayers).
    out.int(62, layer.visible ? index : -index)
    if (!exact) out.int(420, rgb)
    out.str(6, linetypeName(layer.linetype))
    // AutoCAD refuses the whole file when DEFPOINTS plots ("Invalid
    // AcDbLayerTableRecord plot flag for DEFPOINTS layer").
    if (layer.name.toUpperCase() === "DEFPOINTS") out.int(290, 0)
    out.int(370, layerLineweight(layer.lineweight))
    out.str(390, T.normalPlotStyle)
  }
  out.str(0, "ENDTAB")

  const styleHandles = new Map<string, string>()
  table(out, "STYLE", T.styles, drawing.textStyles.length)
  for (const style of drawing.textStyles) {
    const own = handle()
    styleHandles.set(style.name.toUpperCase(), own)
    record(out, "STYLE", own, T.styles, "AcDbTextStyleTableRecord")
    out.str(2, style.name)
    out.int(70, 0)
    out.real(40, style.height)
    out.real(41, 1)
    out.real(50, 0)
    out.int(71, 0)
    out.real(42, style.height || drawing.settings.textSize)
    out.str(3, "arial.ttf")
    out.str(4, "")
  }
  out.str(0, "ENDTAB")

  table(out, "VIEW", T.views, 0)
  out.str(0, "ENDTAB")
  table(out, "UCS", T.ucs, 0)
  out.str(0, "ENDTAB")

  table(out, "APPID", T.appids, 1)
  record(out, "APPID", T.acad, T.appids, "AcDbRegAppTableRecord")
  out.str(2, "ACAD")
  out.int(70, 0)
  out.str(0, "ENDTAB")

  // DIMTXSTY: the model's dimensions write in Standard.
  const standardStyle = styleHandles.get("STANDARD") ?? ""
  table(out, "DIMSTYLE", T.dimstyles, drawing.dimStyles.length)
  out.str(100, "AcDbDimStyleTable")
  out.int(71, 0)
  for (const style of drawing.dimStyles) {
    dimStyleRecord(out, handle(), T.dimstyles, style, standardStyle)
  }
  out.str(0, "ENDTAB")

  table(out, "BLOCK_RECORD", T.blockRecords, written.length + 2)
  blockRecord(out, T.modelRecord, T.blockRecords, "*Model_Space")
  blockRecord(out, T.paperRecord, T.blockRecords, "*Paper_Space")
  for (const block of written)
    blockRecord(out, block.record, T.blockRecords, block.name)
  out.str(0, "ENDTAB")
  out.str(0, "ENDSEC")

  // BLOCKS
  out.str(0, "SECTION")
  out.str(2, "BLOCKS")
  blockBegin(
    out,
    T.modelBlock,
    T.modelRecord,
    "*Model_Space",
    0,
    { x: 0, y: 0 },
    0
  )
  blockEnd(out, T.modelEnd, T.modelRecord, false)
  blockBegin(
    out,
    T.paperBlock,
    T.paperRecord,
    "*Paper_Space",
    0,
    { x: 0, y: 0 },
    0,
    true
  )
  blockEnd(out, T.paperEnd, T.paperRecord, true)
  for (const block of written) {
    blockBegin(
      out,
      handle(),
      block.record,
      block.name,
      block.anonymous ? 1 : 0,
      block.basePoint,
      block.baseZ
    )
    block.write(ctx, block.record)
    blockEnd(out, handle(), block.record, false)
  }
  out.str(0, "ENDSEC")

  // ENTITIES
  out.str(0, "SECTION")
  out.str(2, "ENTITIES")
  for (const entity of modelEntities) writeEntity(ctx, entity, T.modelRecord)
  out.str(0, "ENDSEC")

  // OBJECTS: the named object dictionary, its groups and the plot style
  // name every layer points at (390), which AutoCAD's reader requires ("Did
  // not receive PlotStyleName").
  out.str(0, "SECTION")
  out.str(2, "OBJECTS")
  out.str(0, "DICTIONARY")
  out.str(5, T.rootDictionary)
  out.str(330, "0")
  out.str(100, "AcDbDictionary")
  out.int(281, 1)
  out.str(3, "ACAD_GROUP")
  out.str(350, T.groups)
  out.str(3, "ACAD_PLOTSTYLENAME")
  out.str(350, T.plotStyles)
  const owned = (type: string, own: string) => {
    out.str(0, type)
    out.str(5, own)
    out.str(102, "{ACAD_REACTORS")
    out.str(330, T.rootDictionary)
    out.str(102, "}")
    out.str(330, T.rootDictionary)
  }
  owned("DICTIONARY", T.groups)
  out.str(100, "AcDbDictionary")
  out.int(281, 1)
  owned("ACDBDICTIONARYWDFLT", T.plotStyles)
  out.str(100, "AcDbDictionary")
  out.int(281, 1)
  out.str(3, "Normal")
  out.str(350, T.normalPlotStyle)
  out.str(100, "AcDbDictionaryWithDefault")
  out.str(340, T.normalPlotStyle)
  out.str(0, "ACDBPLACEHOLDER")
  out.str(5, T.normalPlotStyle)
  out.str(102, "{ACAD_REACTORS")
  out.str(330, T.plotStyles)
  out.str(102, "}")
  out.str(330, T.plotStyles)
  out.str(0, "ENDSEC")
  out.str(0, "EOF")

  const file = new DxfOut(options.binary, precision, codePage, true)
  header(file, drawing, version, handle())
  file.append(body)
  return { bytes: file.result(), report: { leftOut } }

  function linetypeName(id: string): string {
    if (id === "Continuous") return "Continuous"
    return LINETYPES.some((l) => l.id === id) ? id.toUpperCase() : id
  }
}

/** The linetypes of the six and the names kept from a DXF that the file's objects and layers use. */
function usedLinetypes(
  drawing: DrawingSnapshot,
  entities: readonly Entity[]
): string[] {
  const names = new Set<string>(
    LINETYPES.map((l) => l.id).filter((id) => id !== "Continuous")
  )
  const add = (id: string | undefined) => {
    if (id && id !== "Continuous" && id !== LINETYPE_BYLAYER) names.add(id)
  }
  for (const layer of drawing.layers) add(layer.linetype)
  const visit = (list: readonly Entity[]) => {
    for (const e of list) {
      add(e.linetype)
      if (e.type === "insert")
        for (const attribute of e.attributes ?? []) add(attribute.linetype)
    }
  }
  visit(entities)
  for (const block of drawing.blocks) visit(block.entities)
  add(
    drawing.settings.currentLinetype === LINETYPE_BYLAYER
      ? undefined
      : drawing.settings.currentLinetype
  )
  return [...names]
}

function table(out: DxfOut, name: string, handle: string, count: number): void {
  out.str(0, "TABLE")
  out.str(2, name)
  out.str(5, handle)
  out.str(330, "0")
  out.str(100, "AcDbSymbolTable")
  out.int(70, count)
}

function record(
  out: DxfOut,
  type: string,
  handle: string,
  owner: string,
  subclass: string
): void {
  out.str(0, type)
  out.str(type === "DIMSTYLE" ? 105 : 5, handle)
  out.str(330, owner)
  out.str(100, "AcDbSymbolTableRecord")
  out.str(100, subclass)
}

function linetype(
  out: DxfOut,
  handle: string,
  owner: string,
  name: string,
  description: string,
  pattern: readonly number[]
): void {
  record(out, "LTYPE", handle, owner, "AcDbLinetypeTableRecord")
  out.str(2, name)
  out.int(70, 0)
  out.str(3, description)
  out.int(72, 65)
  out.int(73, pattern.length)
  out.real(
    40,
    pattern.reduce((sum, d) => sum + d, 0)
  )
  pattern.forEach((d, i) => {
    out.real(49, i % 2 === 0 ? d : -d)
    out.int(74, 0)
  })
}

/**
 * The *Active viewport: the snap and grid the model keeps there from 2000
 * on, and a view framing what the file holds, as ZOOM Extents would.
 */
function activeViewport(
  out: DxfOut,
  handle: string,
  owner: string,
  drawing: DrawingSnapshot,
  entities: readonly Entity[],
  lookup: BlockLookup
): void {
  const s = drawing.settings
  const bounds = entitiesBounds(entities, lookup)
  const center = bounds
    ? {
        x: (bounds.min.x + bounds.max.x) / 2,
        y: (bounds.min.y + bounds.max.y) / 2,
      }
    : { x: 0, y: 0 }
  const height = bounds
    ? Math.max(
        bounds.max.y - bounds.min.y,
        (bounds.max.x - bounds.min.x) / 1.5
      ) * 1.1 || 10
    : 297
  record(out, "VPORT", handle, owner, "AcDbViewportTableRecord")
  out.str(2, "*Active")
  out.int(70, 0)
  out.point(10, 0, 0)
  out.point(11, 1, 1)
  out.point(12, center.x, center.y)
  out.point(13, 0, 0)
  out.point(14, s.snapUnit.x, s.snapUnit.y)
  out.point(15, s.snapUnit.x, s.snapUnit.y)
  out.point(16, 0, 0, 1)
  out.point(17, 0, 0, 0)
  out.real(40, height)
  out.real(41, 1.5)
  out.real(42, 50)
  out.real(43, 0)
  out.real(44, 0)
  out.real(50, 0)
  out.real(51, 0)
  out.int(71, 0)
  out.int(72, 1000)
  out.int(73, 1)
  out.int(74, 3)
  out.int(75, s.snapMode ? 1 : 0)
  out.int(76, s.gridMode ? 1 : 0)
  out.int(77, 0)
  out.int(78, 0)
  out.int(281, 0)
  out.int(65, 1)
  out.point(110, 0, 0, 0)
  out.point(111, 1, 0, 0)
  out.point(112, 0, 1, 0)
  out.int(79, 0)
  out.real(146, 0)
}

/**
 * A dimension style's record: every variable the model holds, each in its
 * group, since a group left out reads as the DXF reference's imperial value
 * (the reader's `dxfDimStyles`).
 */
function dimStyleRecord(
  out: DxfOut,
  handle: string,
  owner: string,
  style: DimStyle,
  textStyle: string
): void {
  record(out, "DIMSTYLE", handle, owner, "AcDbDimStyleTableRecord")
  out.str(2, style.name)
  out.int(70, 0)
  out.real(40, style.scale)
  out.real(41, style.arrowSize)
  out.real(42, style.extensionOffset)
  out.real(43, style.baselineSpacing)
  out.real(44, style.extensionBeyond)
  out.int(73, 0)
  out.int(74, 0)
  out.int(77, 1)
  out.int(78, style.suppressTrailingZeros ? 8 : 0)
  out.real(140, style.textHeight)
  out.real(141, style.centerMark)
  out.real(147, style.textGap)
  out.int(172, style.forceLineInside ? 1 : 0)
  out.int(179, style.angleDecimals)
  out.int(271, style.decimals)
  out.int(272, style.decimals)
  out.int(278, style.decimalSeparator.charCodeAt(0))
  if (textStyle) out.str(340, textStyle)
}

function blockRecord(
  out: DxfOut,
  handle: string,
  owner: string,
  name: string
): void {
  record(out, "BLOCK_RECORD", handle, owner, "AcDbBlockTableRecord")
  out.str(2, name)
  out.int(70, 0)
  out.int(280, 1)
  out.int(281, 0)
}

function blockBegin(
  out: DxfOut,
  handle: string,
  owner: string,
  name: string,
  flags: number,
  base: Vec2,
  z: number,
  paper = false
): void {
  out.str(0, "BLOCK")
  out.str(5, handle)
  out.str(330, owner)
  out.str(100, "AcDbEntity")
  if (paper) out.int(67, 1)
  out.str(8, "0")
  out.str(100, "AcDbBlockBegin")
  out.str(2, name)
  out.int(70, flags)
  out.point(10, base.x, base.y, z)
  out.str(3, name)
  out.str(1, "")
}

function blockEnd(
  out: DxfOut,
  handle: string,
  owner: string,
  paper: boolean
): void {
  out.str(0, "ENDBLK")
  out.str(5, handle)
  out.str(330, owner)
  out.str(100, "AcDbEntity")
  if (paper) out.int(67, 1)
  out.str(8, "0")
  out.str(100, "AcDbBlockEnd")
}

/**
 * A dimension's `*D` block: what the model draws of it (`dimensionGeometry`)
 * as AutoCAD's own (f001's `*D2`): lines and arcs, filled arrowheads as
 * SOLIDs and the text as MTEXT at its middle, all ByBlock so they take the
 * dimension's colour.
 */
function dimensionBlock(
  name: string,
  record: string,
  dimension: DimensionEntity,
  styleOf: (id: string) => DimStyle
): WrittenBlock {
  return {
    name,
    record,
    basePoint: { x: 0, y: 0 },
    baseZ: 0,
    anonymous: true,
    write: (ctx, owner) => {
      const { out } = ctx
      const g = dimensionGeometry(dimension, styleOf(dimension.styleId))
      const z = dimension.elevation ?? 0
      const a = planeAxes(dimension)
      const world = (p: Vec2) => (a ? axesToWorld(a, { ...p, z }) : { ...p, z })
      const normal = () => {
        const n = dimension.normal
        if (a && n) out.point(210, n.x, n.y, n.z, true)
      }
      const begin = (type: string, subclass: string) => {
        out.str(0, type)
        out.str(5, ctx.handle())
        out.str(330, owner)
        out.str(100, "AcDbEntity")
        out.str(8, "0")
        out.int(62, 0)
        out.str(100, subclass)
      }
      const lineOf = (p: Vec2, q: Vec2) => {
        const s = world(p)
        const e = world(q)
        begin("LINE", "AcDbLine")
        out.point(10, s.x, s.y, s.z)
        out.point(11, e.x, e.y, e.z)
      }
      for (const [p, q] of g.lines) lineOf(p, q)
      if (g.arc) {
        begin("ARC", "AcDbCircle")
        out.point(10, g.arc.center.x, g.arc.center.y, z)
        out.exact(40, g.arc.radius)
        normal()
        out.str(100, "AcDbArc")
        out.real(50, (g.arc.startAngle * 180) / Math.PI)
        out.real(51, (g.arc.endAngle * 180) / Math.PI)
      } else lineOf(g.lineStart, g.lineEnd)
      for (const arrow of g.arrows) {
        if (arrow.length < 3) continue
        // SOLID's third and fourth corners cross: a quad is 1, 2, 4, 3.
        const corners =
          arrow.length === 3
            ? [arrow[0], arrow[1], arrow[2], arrow[2]]
            : [arrow[0], arrow[1], arrow[3], arrow[2]]
        begin("SOLID", "AcDbTrace")
        corners.forEach((p, i) => out.point(10 + i, p.x, p.y, z))
        normal()
      }
      const at = world(g.textPoint)
      const along = { x: Math.cos(g.textAngle), y: Math.sin(g.textAngle) }
      const direction = a
        ? axesToWorld(a, { ...along, z: 0 })
        : { ...along, z: 0 }
      begin("MTEXT", "AcDbMText")
      out.point(10, at.x, at.y, at.z)
      out.real(40, g.textHeight)
      out.real(41, 0)
      out.int(71, 5)
      out.int(72, 1)
      out.str(1, g.text)
      normal()
      out.point(11, direction.x, direction.y, direction.z, true)
      out.int(73, 1)
      out.real(44, 1)
    },
  }
}

/**
 * An array's `*U` block, in its source block's coordinates: the source
 * block placed at each item, the first where it stands, as AutoCAD's array
 * block holds a reference to its source per item.
 */
function arrayBlock(
  name: string,
  record: string,
  insert: InsertEntity,
  source: BlockDefinition | undefined
): WrittenBlock {
  const base = source?.basePoint ?? { x: 0, y: 0 }
  return {
    name,
    record,
    basePoint: base,
    baseZ: source?.baseElevation ?? 0,
    anonymous: true,
    write: (ctx, owner) => {
      const array = insert.array!
      // On layer 0, so each item takes the array's layer, as its objects do.
      const at = createInsert(insert.blockId, base, {
        id: `${insert.id}-item`,
        layerId: DEFAULT_LAYER_ID,
      })
      const first = arraySourceItem(array)
      writeEntity(ctx, first ? placeArrayItem(at, first) : at, owner)
      for (const next of arrayItems(array))
        writeEntity(ctx, placeArrayItem(at, next), owner)
    },
  }
}

function planeAxes(entity: Entity): Axes3 | null {
  const n = entity.normal
  if (!n || (Math.abs(n.x) < 1e-12 && Math.abs(n.y) < 1e-12 && n.z > 0))
    return null
  return arbitraryAxis(n)
}

/**
 * HEADER: the version, the code page AutoCAD writes up to 2004 (ANSI_1252,
 * probe x014), the handle seed past every handle, and each setting the
 * model keeps in a variable the reader takes it back from (`dxfSettings`).
 */
function header(
  out: DxfOut,
  drawing: DrawingSnapshot,
  version: number,
  seed: string
): void {
  const s = drawing.settings
  const variable = (name: string) => out.str(9, name)
  const layerName =
    drawing.layers.find((l) => l.id === drawing.currentLayerId)?.name ?? "0"
  const textStyle =
    drawing.textStyles.find((t) => t.id === drawing.currentTextStyleId)?.name ??
    "Standard"
  const dimStyle =
    drawing.dimStyles.find((d) => d.id === drawing.currentDimStyleId)?.name ??
    "ISO-25"
  out.str(0, "SECTION")
  out.str(2, "HEADER")
  variable("$ACADVER")
  out.str(1, `AC${version}`)
  variable("$DWGCODEPAGE")
  out.str(3, "ANSI_1252")
  variable("$INSBASE")
  out.point(10, 0, 0, 0)
  variable("$ORTHOMODE")
  out.int(70, s.orthoMode ? 1 : 0)
  variable("$FILLMODE")
  out.int(70, s.fillMode ? 1 : 0)
  variable("$LTSCALE")
  out.real(40, s.ltScale)
  variable("$ATTMODE")
  out.int(
    70,
    s.attributeDisplay === "off" ? 0 : s.attributeDisplay === "on" ? 2 : 1
  )
  variable("$TEXTSIZE")
  out.real(40, s.textSize)
  variable("$TEXTSTYLE")
  out.str(7, textStyle)
  variable("$CLAYER")
  out.str(8, layerName)
  variable("$CELTYPE")
  out.str(
    6,
    s.currentLinetype === LINETYPE_BYLAYER
      ? "ByLayer"
      : s.currentLinetype === "Continuous"
        ? "Continuous"
        : LINETYPES.some((l) => l.id === s.currentLinetype)
          ? s.currentLinetype.toUpperCase()
          : s.currentLinetype
  )
  variable("$CECOLOR")
  if (s.currentColor === COLOR_BYLAYER) out.int(62, 256)
  else color(out, s.currentColor)
  variable("$DIMSTYLE")
  out.str(2, dimStyle)
  variable("$LUNITS")
  out.int(70, 2)
  variable("$LUPREC")
  out.int(70, s.precision)
  variable("$AUNITS")
  out.int(70, 0)
  variable("$AUPREC")
  out.int(70, s.anglePrecision)
  variable("$ELEVATION")
  out.real(40, s.elevation)
  variable("$THICKNESS")
  out.real(40, s.thickness)
  variable("$FILLETRAD")
  out.real(40, s.filletRadius)
  variable("$CHAMFERA")
  out.real(40, s.chamferDistance1)
  variable("$CHAMFERB")
  out.real(40, s.chamferDistance2)
  variable("$PLINEWID")
  out.real(40, s.polylineWidth)
  variable("$SPLINETYPE")
  out.int(70, s.splineType)
  variable("$SPLINESEGS")
  out.int(70, s.splineSegments)
  // WHY no $UCSNAME: the UCS table is not written, and a name it lacks
  // would name nothing.
  const ucs = s.ucs
  variable("$UCSORG")
  out.point(10, ucs.origin.x, ucs.origin.y, ucs.origin.z)
  variable("$UCSXDIR")
  out.point(10, ucs.xAxis.x, ucs.xAxis.y, ucs.xAxis.z, true)
  variable("$UCSYDIR")
  out.point(10, ucs.yAxis.x, ucs.yAxis.y, ucs.yAxis.z, true)
  variable("$CELWEIGHT")
  out.int(
    370,
    s.currentLineweight === LINEWEIGHT_BYLAYER
      ? -1
      : Math.round(s.currentLineweight * 100)
  )
  variable("$LWDISPLAY")
  out.int(290, s.lwDisplay ? 1 : 0)
  variable("$INSUNITS")
  out.int(70, INSUNITS[s.unit])
  variable("$MEASUREMENT")
  out.int(70, 1)
  variable("$HANDSEED")
  out.str(5, seed)
  out.str(0, "ENDSEC")
}

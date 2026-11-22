import { Vec2 } from "../../geometry/Vec2"
import { Axes3, arbitraryAxis, axesToWorld } from "../../geometry/ocs"
import {
  BlockDefinition,
  BlockAttribute,
  BlockLookup,
  DimensionEntity,
  Entity,
  InsertEntity,
  ImageEntity,
  MTEXT_ATTACHMENTS,
  TableEntity,
  TableStyleData,
  MLeaderEntity,
  MLeaderStyleData,
  XrefSource,
  createInsert,
  entitiesBounds,
  tableExploded,
  tableGeometry,
} from "../../domain/entities"
import { anonymousBlockName } from "../../domain/blocks"
import {
  arrayItems,
  arraySourceItem,
  placeArrayItem,
} from "../../domain/arrays"
import { dimensionGeometry } from "../../domain/dimensions"
import { DimStyle, DEFAULT_DIM_STYLE } from "../../domain/dimStyles"
import {
  CONTINUOUS,
  DEFAULT_LINETYPE_ID,
  LINETYPE_BYLAYER,
  Linetype,
  LinetypeElement,
  sameLinetypeName,
} from "../../domain/linetypes"
import { DEFAULT_TEXT_STYLE_ID } from "../../domain/textStyles"
import { LINEWEIGHT_BYLAYER } from "../../domain/lineweights"
import { COLOR_BYLAYER } from "../../domain/colors"
import { DEFAULT_LAYER_ID } from "../../domain/layers"
import { LengthUnit } from "../../domain/units"
import { DrawingSnapshot } from "../drawingFile"
import { DxfOut } from "./dxfOut"
import { dxfColorCodes } from "./dxfColors"
import {
  DxfWriteContext,
  GRADIENT_COLOR_APPS,
  color,
  layerLineweight,
  writeEntity,
} from "./dxfWriteEntities"

/** The AutoCAD releases a DXF is written for, as SAVEAS and DXFOUT name them (probe x003). */
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
  /** An external reference's path (group 1), written as AutoCAD keeps one it cannot find. */
  readonly xref?: XrefSource
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

  // The images' definitions, one per name and path as -IMAGE attaches one
  // (image/i08), in the order first shown, and each image's reactor.
  const allImages = [
    ...modelEntities,
    ...drawing.blocks.flatMap((b) => b.entities),
  ].filter((e): e is ImageEntity => e.type === "image")
  const imageDefinitions = new Map<
    string,
    { handle: string; name: string; image: ImageEntity; reactors: string[] }
  >()
  const imageKey = (e: ImageEntity) => `${e.image.name}\u0000${e.image.path}`
  // A dictionary's names are unique: two definitions of one name (pasted from
  // another drawing, or named by their files) take a number after the second.
  const imageNames = new Set<string>()
  const imageName = (name: string) => {
    let unique = name
    for (let n = 2; imageNames.has(unique.toUpperCase()); n++)
      unique = `${name}${n}`
    imageNames.add(unique.toUpperCase())
    return unique
  }
  for (const e of allImages) {
    if (!imageDefinitions.has(imageKey(e))) {
      imageDefinitions.set(imageKey(e), {
        handle: handle(),
        name: imageName(e.image.name),
        image: e,
        reactors: [],
      })
    }
  }
  const imageDefinitionOf = (e: ImageEntity) =>
    imageDefinitions.get(imageKey(e))!
  const imageReactors: { handle: string; image: string }[] = []
  // ACAD_IMAGE_DICT and IMAGEFRAME's RASTERVARIABLES, where the drawing has
  // an image or its IMAGEFRAME is not a new drawing's.
  const imageObjects =
    allImages.length > 0 || drawing.settings.imageFrame !== 1
      ? { dictionary: handle(), variables: handle() }
      : null

  // The tables' styles, one TABLESTYLE per name in the order first used, and
  // ACAD_TABLESTYLE, which names them (table/t00); each table's *T block.
  const allTables = [
    ...modelEntities,
    ...drawing.blocks.flatMap((b) => b.entities),
  ].filter((e): e is TableEntity => e.type === "table")
  // One per style as each table keeps it: two of one name and other values
  // (pasted from another drawing) are both kept, the second numbered, as a
  // dictionary's names are unique.
  const tableStyles = new Map<
    string,
    { handle: string; style: TableStyleData; tables: string[] }
  >()
  const tableStyleKey = (style: TableStyleData) => JSON.stringify(style)
  const tableStyleNames = new Set<string>()
  for (const e of allTables) {
    const k = tableStyleKey(e.style)
    if (tableStyles.has(k)) continue
    let name = e.style.name
    for (let n = 2; tableStyleNames.has(name.toUpperCase()); n++) {
      name = `${e.style.name}${n}`
    }
    tableStyleNames.add(name.toUpperCase())
    tableStyles.set(k, {
      handle: handle(),
      style: { ...e.style, name },
      tables: [],
    })
  }
  const tableStyleDictionary = allTables.length > 0 ? handle() : null

  // The multileaders' styles, one MLEADERSTYLE per style as each keeps it,
  // and ACAD_MLEADERSTYLE, which names them (mleader/m02).
  const allMLeaders = [
    ...modelEntities,
    ...drawing.blocks.flatMap((b) => b.entities),
  ].filter((e): e is MLeaderEntity => e.type === "mleader")
  const mleaderStyles = new Map<
    string,
    { handle: string; style: MLeaderStyleData; mleaders: string[] }
  >()
  const mleaderStyleKey = (style: MLeaderStyleData) => JSON.stringify(style)
  const mleaderStyleNames = new Set<string>()
  for (const e of allMLeaders) {
    const k = mleaderStyleKey(e.style)
    if (mleaderStyles.has(k)) continue
    let name = e.style.name
    for (let n = 2; mleaderStyleNames.has(name.toUpperCase()); n++) {
      name = `${e.style.name}${n}`
    }
    mleaderStyleNames.add(name.toUpperCase())
    mleaderStyles.set(k, {
      handle: handle(),
      style: { ...e.style, name },
      mleaders: [],
    })
  }
  const mleaderStyleDictionary = allMLeaders.length > 0 ? handle() : null
  const tableBlocks = new Map<TableEntity, { name: string; record: string }>()
  let tableCount = 0
  const nextTableName = () => {
    let name: string
    do name = `*T${++tableCount}`
    while (takenNames.some((b) => b.name.toUpperCase() === name))
    takenNames.push({ name })
    return name
  }

  // A leader and the annotation it points at, when both are written in one
  // space: each needs the other's handle (340, ACAD_REACTORS). Keyed by the
  // space and the id, as two blocks can hold objects of one id (a pasted
  // array's), and set to the space being written as it is written.
  const MODEL = "\u0000model"
  let space = MODEL
  const key = (scope: string, id: string) => `${scope}\u0000${id}`
  const annotationOf = new Map<string, string>()
  const reactorsOf = new Map<string, string[]>()
  const pair = (scope: string, entities: readonly Entity[]): void => {
    const byId = new Map(entities.map((e) => [e.id, e]))
    for (const e of entities) {
      if (e.type !== "leader" || !e.annotation) continue
      const target = byId.get(e.annotation.id)
      const wanted = e.annotation.kind === "mtext" ? "mtext" : "insert"
      if (target?.type !== wanted) continue
      const from = key(scope, e.id)
      const to = key(scope, target.id)
      annotationOf.set(from, to)
      reactorsOf.set(to, [...(reactorsOf.get(to) ?? []), from])
    }
  }
  pair(MODEL, modelEntities)
  for (const block of drawing.blocks) pair(block.name, block.entities)
  const paired = new Map<string, string>()
  const pairedHandle = (k: string): string => {
    let h = paired.get(k)
    if (h === undefined) {
      h = handle()
      paired.set(k, h)
    }
    return h
  }
  const keyOf = (entity: Entity | BlockAttribute): string | null => {
    if (!("id" in entity)) return null
    const k = key(space, entity.id)
    return annotationOf.has(k) || reactorsOf.has(k) ? k : null
  }

  const ctx: DxfWriteContext = {
    out: body,
    version,
    handle,
    entityHandle: (entity) => {
      const k = keyOf(entity)
      return k === null ? handle() : pairedHandle(k)
    },
    reactors: (entity) => {
      const k = keyOf(entity)
      return k === null ? [] : (reactorsOf.get(k) ?? []).map(pairedHandle)
    },
    annotation: (leader) => {
      const target = annotationOf.get(key(space, leader.id))
      return target ? pairedHandle(target) : null
    },
    layerName: (id) => layers.get(id)?.name ?? "0",
    textStyleName: (id) => textStyles.get(id)?.name ?? "Standard",
    dimStyleName: (id) => dimStyles.get(id)?.name ?? "ISO-25",
    dimStyle: styleOf,
    blockName: (id) => blocksById.get(id)?.name ?? id,
    block: (id) => blocksById.get(id),
    dimensionBlock: (dimension) => dimensionBlocks.get(dimension) ?? "",
    arrayBlock: (insert) => arrayBlocks.get(insert) ?? null,
    leftOut: (type) => leftOut.set(type, (leftOut.get(type) ?? 0) + 1),
    tableBlock: (table) => tableBlocks.get(table) ?? { name: "", record: "0" },
    tableStyle: (table, own) => {
      const style = tableStyles.get(tableStyleKey(table.style))
      if (!style) return "0"
      style.tables.push(own)
      return style.handle
    },
    textStyleHandle: (id) =>
      styleHandles.get(
        (textStyles.get(id)?.name ?? DEFAULT_TEXT_STYLE_ID).toUpperCase()
      ) ??
      styleHandles.get(DEFAULT_TEXT_STYLE_ID.toUpperCase()) ??
      "0",
    mleaderStyle: (mleader, own) => {
      const style = mleaderStyles.get(mleaderStyleKey(mleader.style))
      if (!style) return "0"
      style.mleaders.push(own)
      return style.handle
    },
    blockRecord: (id) =>
      written.find(
        (b) =>
          b.name.toUpperCase() ===
          (blocksById.get(id)?.name ?? id).toUpperCase()
      )?.record ?? "0",
    imageDefinition: (image) => imageDefinitionOf(image).handle,
    imageReactor: (image, own) => {
      const reactor = handle()
      imageDefinitionOf(image).reactors.push(reactor)
      imageReactors.push({ handle: reactor, image: own })
      return reactor
    },
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
      } else if (entity.type === "table") {
        const name = nextTableName()
        const record = handle()
        tableBlocks.set(entity, { name, record })
        written.push(tableBlock(name, record, entity, lookup))
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
      ...(block.xref ? { xref: block.xref } : {}),
      write: (c, owner) => {
        // An xref's objects are only the label drawn in its place: AutoCAD
        // writes its BLOCK empty, with the flag 4 alone of one it could not
        // find (probe xref/p04, host2.dxf).
        if (block.xref) return
        space = block.name
        for (const e of block.entities) writeEntity(c, e, owner)
        space = MODEL
      },
    })
  }
  for (const block of drawing.blocks) plan(block.entities)
  plan(modelEntities)

  const linetypes = drawing.linetypes.filter(
    (l) => !sameLinetypeName(l.name, DEFAULT_LINETYPE_ID)
  )

  // CLASSES: a wipeout's, and WIPEOUTFRAME's object, as AutoCAD writes
  // them, the instance count (91) from 2004 (wipeout/w01, w14). Only where
  // the drawing has one or its WIPEOUTFRAME is not a new drawing's.
  const wipeouts = [
    modelEntities,
    ...drawing.blocks.map((b) => b.entities),
  ].reduce((n, list) => n + list.filter((e) => e.type === "wipeout").length, 0)
  const wipeoutVariables =
    wipeouts > 0 || drawing.settings.wipeoutFrame !== 1 ? handle() : null
  const out = body
  if (
    wipeoutVariables ||
    imageObjects ||
    allTables.length > 0 ||
    allMLeaders.length > 0
  ) {
    out.str(0, "SECTION")
    out.str(2, "CLASSES")
    const dxfClass = (
      name: string,
      cpp: string,
      app: string,
      flags: number,
      count: number,
      entity: boolean
    ) => {
      out.str(0, "CLASS")
      out.str(1, name)
      out.str(2, cpp)
      out.str(3, app)
      out.int(90, flags)
      if (version >= 1018) out.int(91, count)
      out.int(280, 0)
      out.int(281, entity ? 1 : 0)
    }
    if (imageObjects) {
      // As AutoCAD writes them (image/i08).
      if (allImages.length > 0) {
        dxfClass(
          "IMAGEDEF",
          "AcDbRasterImageDef",
          "ISM",
          0,
          imageDefinitions.size,
          false
        )
      }
      dxfClass("RASTERVARIABLES", "AcDbRasterVariables", "ISM", 0, 1, false)
      if (allImages.length > 0) {
        dxfClass(
          "IMAGEDEF_REACTOR",
          "AcDbRasterImageDefReactor",
          "ISM",
          1,
          allImages.length,
          false
        )
        dxfClass(
          "IMAGE",
          "AcDbRasterImage",
          "ISM",
          2175,
          allImages.length,
          true
        )
      }
    }
    if (wipeouts > 0) {
      dxfClass(
        "WIPEOUT",
        "AcDbWipeout",
        "WipeOut|Product Desc: Object Enabler for WipeOut entity | Company: Autodesk, Inc. | WEB Address: www.autodesk.com",
        2175,
        wipeouts,
        true
      )
    }
    if (allTables.length > 0) {
      // As a new AutoCAD drawing lists them (table/t00).
      dxfClass(
        "TABLESTYLE",
        "AcDbTableStyle",
        "ObjectDBX Classes",
        4095,
        tableStyles.size,
        false
      )
      dxfClass(
        "ACAD_TABLE",
        "AcDbTable",
        "ObjectDBX Classes",
        1025,
        allTables.length,
        true
      )
    }
    if (allMLeaders.length > 0) {
      // As a new AutoCAD drawing lists them (mleader/m02).
      dxfClass(
        "MLEADERSTYLE",
        "AcDbMLeaderStyle",
        "ACDB_MLEADERSTYLE_CLASS",
        4095,
        mleaderStyles.size,
        false
      )
      dxfClass(
        "MULTILEADER",
        "AcDbMLeader",
        "ACDB_MLEADER_CLASS",
        1025,
        allMLeaders.length,
        true
      )
    }
    if (wipeoutVariables) {
      dxfClass(
        "WIPEOUTVARIABLES",
        "AcDbWipeoutVariables",
        '"WipeOut|Product Desc:     WipeOut Dbx Application|Company:          Autodesk, Inc.|WEB Address:      www.autodesk.com"',
        0,
        1,
        false
      )
    }
    out.str(0, "ENDSEC")
  }

  // TABLES
  out.str(0, "SECTION")
  out.str(2, "TABLES")
  table(out, "VPORT", T.vports, 1)
  activeViewport(out, handle(), T.vports, drawing, modelEntities, lookup)
  out.str(0, "ENDTAB")

  // A complex linetype's text names its STYLE by handle (340), and a shape its
  // shape file's: a STYLE with no name, flag 1, the file as its font, as
  // AutoCAD writes ltypeshp.shx (the DesignCenter sample's handle 53).
  const styleHandles = new Map<string, string>()
  for (const style of drawing.textStyles) {
    styleHandles.set(style.name.toUpperCase(), handle())
  }
  const shapeFiles = new Map<string, string>()
  for (const l of linetypes) {
    for (const element of l.elements ?? []) {
      const key =
        element.kind === "shape" ? element.shapeFile.toLowerCase() : ""
      if (key && !shapeFiles.has(key)) shapeFiles.set(key, handle())
    }
  }
  const elementStyle = (element: LinetypeElement): string =>
    element.kind === "shape"
      ? shapeFiles.get(element.shapeFile.toLowerCase())!
      : (styleHandles.get(element.style.toUpperCase()) ??
        styleHandles.get(DEFAULT_TEXT_STYLE_ID.toUpperCase()) ??
        "")

  table(out, "LTYPE", T.linetypes, linetypes.length + 3)
  linetype(
    out,
    T.byBlock,
    T.linetypes,
    { name: "ByBlock", description: "", pattern: [] },
    elementStyle
  )
  linetype(
    out,
    T.byLayer,
    T.linetypes,
    { name: "ByLayer", description: "", pattern: [] },
    elementStyle
  )
  linetype(out, T.continuous, T.linetypes, CONTINUOUS, elementStyle)
  for (const l of linetypes) {
    linetype(out, handle(), T.linetypes, l, elementStyle)
  }
  out.str(0, "ENDTAB")

  table(out, "LAYER", T.layers, drawing.layers.length)
  for (const layer of drawing.layers) {
    record(out, "LAYER", handle(), T.layers, "AcDbLayerTableRecord")
    out.str(2, layer.name)
    out.int(70, layer.locked ? 4 : 0)
    const { index, rgb } = dxfColorCodes(layer.color) ?? { index: 7 }
    // An off layer's colour is negative (the reader's DxfLayers).
    out.int(62, layer.visible ? index : -index)
    if (rgb !== undefined) out.int(420, rgb)
    out.str(6, layer.linetype)
    // AutoCAD refuses the whole file when DEFPOINTS plots ("Invalid
    // AcDbLayerTableRecord plot flag for DEFPOINTS layer").
    if (layer.name.toUpperCase() === "DEFPOINTS") out.int(290, 0)
    out.int(370, layerLineweight(layer.lineweight))
    out.str(390, T.normalPlotStyle)
  }
  out.str(0, "ENDTAB")

  table(out, "STYLE", T.styles, drawing.textStyles.length + shapeFiles.size)
  for (const style of drawing.textStyles) {
    const own = styleHandles.get(style.name.toUpperCase())!
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
  for (const [file, own] of shapeFiles) {
    record(out, "STYLE", own, T.styles, "AcDbTextStyleTableRecord")
    out.str(2, "")
    out.int(70, 1)
    out.real(40, 0)
    out.real(41, 1)
    out.real(50, 0)
    out.int(71, 0)
    out.real(42, drawing.settings.textSize)
    out.str(3, file)
    out.str(4, "")
  }
  out.str(0, "ENDTAB")

  table(out, "VIEW", T.views, 0)
  out.str(0, "ENDTAB")
  // Each saved UCS as AutoCAD's DXFOUT writes one, its name as typed and its
  // origin and axes whole at any precision (x023, x024).
  table(out, "UCS", T.ucs, drawing.settings.namedUcs.length)
  for (const { name, ucs } of drawing.settings.namedUcs) {
    record(out, "UCS", handle(), T.ucs, "AcDbUCSTableRecord")
    out.str(2, name)
    out.int(70, 0)
    out.point(10, ucs.origin.x, ucs.origin.y, ucs.origin.z, true)
    out.point(11, ucs.xAxis.x, ucs.xAxis.y, ucs.xAxis.z, true)
    out.point(12, ucs.yAxis.x, ucs.yAxis.y, ucs.yAxis.z, true)
    out.int(79, 0)
    out.real(146, 0)
  }
  out.str(0, "ENDTAB")

  // A 2000 file's gradients are xdata of applications of their own (g15).
  const gradientApps =
    version < 1018 &&
    [modelEntities, ...drawing.blocks.map((b) => b.entities)].some((list) =>
      list.some((e) => e.type === "hatch" && e.gradient)
    )
      ? GRADIENT_COLOR_APPS
      : []
  // A multileader's version is xdata before 2010 (mleader/m11).
  const apps = [
    ...gradientApps,
    ...(allMLeaders.length > 0 ? ["ACAD_MLEADERVER"] : []),
  ]
  table(out, "APPID", T.appids, 1 + apps.length)
  record(out, "APPID", T.acad, T.appids, "AcDbRegAppTableRecord")
  out.str(2, "ACAD")
  out.int(70, 0)
  for (const app of apps) {
    record(out, "APPID", handle(), T.appids, "AcDbRegAppTableRecord")
    out.str(2, app)
    out.int(70, 0)
  }
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
      block.xref ? (block.xref.overlay ? 4 | 8 : 4) : block.anonymous ? 1 : 0,
      block.basePoint,
      block.baseZ,
      false,
      block.xref?.path
    )
    block.write(ctx, block.record)
    blockEnd(out, handle(), block.record, false)
  }
  out.str(0, "ENDSEC")

  // ENTITIES
  out.str(0, "SECTION")
  out.str(2, "ENTITIES")
  space = MODEL
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
  if (imageObjects) {
    out.str(3, "ACAD_IMAGE_DICT")
    out.str(350, imageObjects.dictionary)
    out.str(3, "ACAD_IMAGE_VARS")
    out.str(350, imageObjects.variables)
  }
  out.str(3, "ACAD_PLOTSTYLENAME")
  out.str(350, T.plotStyles)
  if (mleaderStyleDictionary) {
    out.str(3, "ACAD_MLEADERSTYLE")
    out.str(350, mleaderStyleDictionary)
  }
  if (tableStyleDictionary) {
    out.str(3, "ACAD_TABLESTYLE")
    out.str(350, tableStyleDictionary)
  }
  if (wipeoutVariables) {
    out.str(3, "ACAD_WIPEOUT_VARS")
    out.str(350, wipeoutVariables)
  }
  // WHY the drawing variables only for Display but not plot: 0 and 1 are
  // WIPEOUTVARIABLES' own, which an older reader keeps.
  const variables =
    drawing.settings.wipeoutFrame === 2
      ? { dictionary: handle(), frame: handle() }
      : null
  if (variables) {
    out.str(3, "AcDbVariableDictionary")
    out.str(350, variables.dictionary)
  }
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
  if (imageObjects) {
    owned("DICTIONARY", imageObjects.dictionary)
    out.str(100, "AcDbDictionary")
    out.int(281, 1)
    for (const definition of imageDefinitions.values()) {
      out.str(3, definition.name)
      out.str(350, definition.handle)
    }
    // IMAGEFRAME 0, 1 or 2 as 0, 1 or 3 (image/i08, i09).
    owned("RASTERVARIABLES", imageObjects.variables)
    out.str(100, "AcDbRasterVariables")
    out.int(90, 0)
    out.int(70, [0, 1, 3][drawing.settings.imageFrame])
    out.int(71, 1)
    out.int(72, 1)
    for (const { handle: own, image, reactors } of imageDefinitions.values()) {
      out.str(0, "IMAGEDEF")
      out.str(5, own)
      out.str(102, "{ACAD_REACTORS")
      out.str(330, imageObjects.dictionary)
      for (const reactor of reactors) out.str(330, reactor)
      out.str(102, "}")
      out.str(330, imageObjects.dictionary)
      out.str(100, "AcDbRasterImageDef")
      out.int(90, 0)
      out.str(1, image.image.path)
      out.point(10, image.width, image.height)
      const pixel = image.image.pixelSize ?? 1
      out.point(11, pixel, pixel)
      out.int(280, 1)
      out.int(281, image.image.units ?? 0)
    }
    for (const reactor of imageReactors) {
      out.str(0, "IMAGEDEF_REACTOR")
      out.str(5, reactor.handle)
      out.str(330, reactor.image)
      out.str(100, "AcDbRasterImageDefReactor")
      out.int(90, 2)
      out.str(330, reactor.image)
    }
  }
  if (tableStyleDictionary) {
    owned("DICTIONARY", tableStyleDictionary)
    out.str(100, "AcDbDictionary")
    out.int(281, 1)
    for (const { handle: own, style } of tableStyles.values()) {
      out.str(3, style.name)
      out.str(350, own)
    }
    for (const { handle: own, style, tables } of tableStyles.values()) {
      tableStyleObject(
        out,
        version,
        own,
        tableStyleDictionary,
        tables,
        style,
        (id) => textStyles.get(id)?.name ?? "Standard"
      )
    }
  }
  if (mleaderStyleDictionary) {
    owned("DICTIONARY", mleaderStyleDictionary)
    out.str(100, "AcDbDictionary")
    out.int(281, 1)
    for (const { handle: own, style } of mleaderStyles.values()) {
      out.str(3, style.name)
      out.str(350, own)
    }
    for (const { handle: own, style, mleaders } of mleaderStyles.values()) {
      mleaderStyleObject(
        out,
        version,
        own,
        mleaderStyleDictionary,
        mleaders,
        style,
        styleHandles.get(
          (textStyles.get(style.textStyleId)?.name ?? "Standard").toUpperCase()
        ) ?? standardStyle
      )
    }
  }
  if (wipeoutVariables) {
    // 0 for OFF, 1 for the rest, as AutoCAD 2027 writes it (w16).
    owned("WIPEOUTVARIABLES", wipeoutVariables)
    out.str(100, "AcDbWipeoutVariables")
    out.int(70, drawing.settings.wipeoutFrame === 0 ? 0 : 1)
  }
  if (variables) {
    // Display but not plot, which only the drawing variable holds (w15).
    owned("DICTIONARY", variables.dictionary)
    out.str(100, "AcDbDictionary")
    out.int(281, 1)
    out.str(3, "WIPEOUTFRAME")
    out.str(350, variables.frame)
    out.str(0, "DICTIONARYVAR")
    out.str(5, variables.frame)
    out.str(102, "{ACAD_REACTORS")
    out.str(330, variables.dictionary)
    out.str(102, "}")
    out.str(330, variables.dictionary)
    out.str(100, "DictionaryVariables")
    out.int(280, 0)
    out.str(1, String(drawing.settings.wipeoutFrame))
  }
  out.str(0, "ENDSEC")
  out.str(0, "EOF")

  const file = new DxfOut(options.binary, precision, codePage, true)
  header(file, drawing, version, handle())
  file.append(body)
  return { bytes: file.result(), report: { leftOut } }
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

/**
 * An LTYPE record as AutoCAD writes one (ltype/p06): its lengths signed, 40
 * their absolute sum, and after a length its text or shape (74's bits 2 text,
 * 4 shape, 1 absolute, 8 upright; the rotation in degrees).
 */
function linetype(
  out: DxfOut,
  handle: string,
  owner: string,
  definition: Linetype,
  styleOf: (element: LinetypeElement) => string
): void {
  const { name, description, pattern } = definition
  record(out, "LTYPE", handle, owner, "AcDbLinetypeTableRecord")
  out.str(2, name)
  out.int(70, 0)
  out.str(3, description)
  out.int(72, 65)
  out.int(73, pattern.length)
  out.real(
    40,
    pattern.reduce((sum, d) => sum + Math.abs(d), 0)
  )
  pattern.forEach((d, i) => {
    out.real(49, d)
    const element = definition.elements?.find((e) => e.index === i)
    if (!element) {
      out.int(74, 0)
      return
    }
    const mode =
      element.rotationMode === "absolute"
        ? 1
        : element.rotationMode === "upright"
          ? 8
          : 0
    out.int(74, mode | (element.kind === "text" ? 2 : 4))
    out.int(75, element.kind === "shape" ? element.shape : 0)
    out.str(340, styleOf(element))
    out.real(46, element.scale)
    out.real(50, (element.rotation * 180) / Math.PI)
    out.real(44, element.offset.x)
    out.real(45, element.offset.y)
    if (element.kind === "text") out.str(9, element.text)
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
  // UCSICON: AutoCAD keeps the origin bit with the icon off (x023's 2).
  out.int(74, (s.ucsIcon.visible ? 1 : 0) | (s.ucsIcon.atOrigin ? 2 : 0))
  out.int(75, s.snapMode ? 1 : 0)
  out.int(76, s.gridMode ? 1 : 0)
  out.int(77, 0)
  out.int(78, 0)
  out.int(281, 0)
  out.int(65, 1)
  // The viewport's UCS is the drawing's, whole at any precision (x024).
  const { origin, xAxis, yAxis } = s.ucs
  out.point(110, origin.x, origin.y, origin.z, true)
  out.point(111, xAxis.x, xAxis.y, xAxis.z, true)
  out.point(112, yAxis.x, yAxis.y, yAxis.z, true)
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
  paper = false,
  path = ""
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
  out.str(1, path)
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
 * A table's `*T` block, as AutoCAD's holds it (table/t03): what the model
 * draws of it from its insertion point, its grid as LINEs, its texts and
 * block cells, ByBlock, and the grey line of no length that ends it.
 * AutoCAD draws its tables from their cells, not from this (t01); other
 * programs draw this.
 */
function tableBlock(
  name: string,
  record: string,
  table: TableEntity,
  lookup: BlockLookup
): WrittenBlock {
  return {
    name,
    record,
    basePoint: { x: 0, y: 0 },
    baseZ: 0,
    anonymous: true,
    write: (ctx, owner) => {
      const local: TableEntity = {
        id: table.id,
        type: "table",
        layerId: DEFAULT_LAYER_ID,
        position: { x: 0, y: 0 },
        direction: table.direction,
        rowHeights: table.rowHeights,
        columnWidths: table.columnWidths,
        cells: table.cells,
        style: table.style,
        ...(table.overrides ? { overrides: table.overrides } : {}),
      }
      let n = 0
      const pieces = tableExploded(
        local,
        tableGeometry(local, lookup),
        () => `${table.id}~${n++}`
      )
      for (const piece of pieces) {
        writeEntity(
          ctx,
          piece.color === undefined
            ? { ...piece, color: "ByBlock", linetype: "ByBlock" }
            : piece,
          owner
        )
      }
    },
  }
}

/**
 * A MLEADERSTYLE as AutoCAD 2027 writes its Standard (mleader/m02, m11):
 * what the style keeps, the rest the Standard's. 179, 271–273 from 2010,
 * 298 from 2013; before 2010 its version is xdata.
 */
function mleaderStyleObject(
  out: DxfOut,
  version: number,
  own: string,
  dictionary: string,
  mleaders: readonly string[],
  style: MLeaderStyleData,
  textStyle: string
): void {
  out.str(0, "MLEADERSTYLE")
  out.str(5, own)
  out.str(102, "{ACAD_REACTORS")
  out.str(330, dictionary)
  for (const mleader of mleaders) out.str(330, mleader)
  out.str(102, "}")
  out.str(330, dictionary)
  out.str(100, "AcDbMLeaderStyle")
  if (version >= 1024) out.int(179, 2)
  out.int(170, ["none", "block", "mtext"].indexOf(style.content))
  out.int(171, 1)
  out.int(172, 0)
  out.int(90, 2)
  out.real(40, 0)
  out.real(41, 0)
  out.int(173, ["none", "straight", "spline"].indexOf(style.path))
  out.int(91, -1056964608)
  out.str(340, "14")
  out.int(92, -2)
  out.int(290, style.landing ? 1 : 0)
  out.real(42, style.landingGap)
  out.int(291, style.dogleg ? 1 : 0)
  out.real(43, style.doglegLength)
  out.str(3, style.name)
  out.real(44, style.arrowSize)
  out.str(300, "")
  out.str(342, textStyle)
  out.int(174, 1)
  out.int(178, 1)
  out.int(175, 1)
  out.int(176, 0)
  out.int(93, -1056964608)
  out.real(45, style.textHeight)
  out.int(292, 0)
  out.int(297, 0)
  out.real(46, 4)
  out.int(94, -1056964608)
  out.real(47, 1)
  out.real(49, 1)
  out.real(140, 1)
  out.int(293, 1)
  out.real(141, 0)
  out.int(294, 1)
  out.int(177, 0)
  out.real(142, style.scale)
  out.int(295, 0)
  out.int(296, style.annotative ? 1 : 0)
  out.real(143, 3.75)
  if (version >= 1024) {
    out.int(271, 0)
    out.int(272, 9)
    out.int(273, 9)
  }
  if (version >= 1027) out.int(298, 0)
  if (version < 1024) {
    out.str(1001, "ACAD_MLEADERVER")
    out.int(1070, 2)
  }
}

/**
 * A TABLESTYLE as AutoCAD writes its Standard (table/t00, t09): its name as
 * its description, flow, margins, title and header shown or not, and its
 * three runs, data, title and header, each its text style, height and
 * alignment with the colours and borders of AutoCAD's (ByBlock, shown);
 * from 2007 each run's data type (512, a new Standard's) and format, from
 * 2010 its version (280 0) first.
 */
function tableStyleObject(
  out: DxfOut,
  version: number,
  own: string,
  dictionary: string,
  tables: readonly string[],
  style: TableStyleData,
  textStyleName: (id: string) => string
): void {
  out.str(0, "TABLESTYLE")
  out.str(5, own)
  out.str(102, "{ACAD_REACTORS")
  out.str(330, dictionary)
  for (const table of tables) out.str(330, table)
  out.str(102, "}")
  out.str(330, dictionary)
  out.str(100, "AcDbTableStyle")
  if (version >= 1024) out.int(280, 0)
  out.str(3, style.name)
  out.int(70, style.flowsUp ? 1 : 0)
  out.int(71, 0)
  out.real(40, style.horizontalMargin)
  out.real(41, style.verticalMargin)
  out.int(280, style.titleSuppressed ? 1 : 0)
  out.int(281, style.headerSuppressed ? 1 : 0)
  for (const run of [style.data, style.title, style.header]) {
    out.str(7, textStyleName(run.textStyleId))
    out.real(140, run.textHeight)
    out.int(170, MTEXT_ATTACHMENTS.indexOf(run.alignment) + 1)
    out.int(62, 0)
    out.int(63, 7)
    out.int(283, 0)
    if (version >= 1021) {
      out.int(90, 512)
      out.int(91, 0)
      out.str(1, "")
    }
    for (let edge = 0; edge < 6; edge++) {
      out.int(274 + edge, -2)
      out.int(284 + edge, 1)
      out.int(64 + edge, 0)
    }
  }
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
    s.currentLinetype === LINETYPE_BYLAYER ? "ByLayer" : s.currentLinetype
  )
  variable("$CECOLOR")
  if (s.currentColor === COLOR_BYLAYER) out.int(62, 256)
  else color(out, s.currentColor)
  variable("$CELTSCALE")
  out.real(40, s.currentLinetypeScale)
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
  variable("$PDMODE")
  out.int(70, s.pointMode)
  variable("$PDSIZE")
  out.real(40, s.pointSize)
  variable("$PLINEWID")
  out.real(40, s.polylineWidth)
  variable("$SPLINETYPE")
  out.int(70, s.splineType)
  variable("$SPLINESEGS")
  out.int(70, s.splineSegments)
  variable("$SURFTYPE")
  out.int(70, s.surfaceType)
  variable("$SURFU")
  out.int(70, s.surfaceU)
  variable("$SURFV")
  out.int(70, s.surfaceV)
  // $UCSNAME names a record of the UCS table, empty for none (x023), and the
  // UCS is whole at any precision (x024).
  const ucs = s.ucs
  const ucsName = s.ucsName?.toUpperCase()
  variable("$UCSNAME")
  out.str(
    2,
    s.namedUcs.find((n) => n.name.toUpperCase() === ucsName)?.name ?? ""
  )
  variable("$UCSORG")
  out.point(10, ucs.origin.x, ucs.origin.y, ucs.origin.z, true)
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

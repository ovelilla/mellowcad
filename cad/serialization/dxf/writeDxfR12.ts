import { BlockLookup, Entity, entitiesWorldBox } from "../../domain/entities"
import { DimStyle, createDefaultDimStyle } from "../../domain/dimStyles"
import {
  CONTINUOUS,
  DEFAULT_LINETYPE_ID,
  LINETYPE_BYLAYER,
  sameLinetypeName,
} from "../../domain/linetypes"
import { COLOR_BYLAYER } from "../../domain/colors"
import { DrawingSnapshot } from "../drawingFile"
import { DxfOut } from "./dxfOut"
import { isRealDimGroup } from "./dxfDimVariables"
import { dxfColorCodes } from "./dxfColors"
import { R12Names, R12Source, r12Conversion, r12Name } from "./dxfR12"
import { R12_GRADIENT_COLOR_APPS, writeR12HatchXdata } from "./writeDxfR12Hatch"
import {
  DxfWriteContext,
  R12_ATTRIBUTE_APP,
  color,
  writeEntity,
} from "./dxfWriteEntities"
import type { WrittenBlock } from "./writeDxf"

/** The names a file gives the drawing's tables and blocks. */
export interface FileNames {
  layer(name: string): string
  linetype(name: string): string
  textStyle(name: string): string
  dimStyle(name: string): string
  block(name: string): string
  ucs(name: string): string
}

/** A file of 2000 on names everything as the drawing does. */
export const SAME_NAMES: FileNames = {
  layer: (name) => name,
  linetype: (name) => name,
  textStyle: (name) => name,
  dimStyle: (name) => name,
  block: (name) => name,
  ucs: (name) => name,
}

/**
 * R12's names (`r12Name`), each table's given in its order, so a clash is
 * numbered as AutoCAD numbers it (x028); an anonymous block is its kind
 * (`*D`, `*T`, `*U`, `*X`) and its place among the file's blocks, as
 * AutoCAD's R12 numbers them (r12.sh's tables: `*T1`, `*T2`, `B1`, `*T4`).
 * Read once every block is planned: `written` is complete by then.
 */
export function r12Naming(
  drawing: DrawingSnapshot,
  written: readonly WrittenBlock[]
): FileNames {
  const layers = new R12Names()
  const linetypes = new R12Names()
  const styles = new R12Names()
  const dimStyles = new R12Names()
  const blocks = new R12Names()
  const ucs = new R12Names()
  let anonymous: Map<string, string> | null = null
  const seeded = () => {
    if (anonymous) return anonymous
    for (const l of drawing.layers) layers.of(l.name)
    for (const l of ["ByBlock", "ByLayer", CONTINUOUS.name]) linetypes.of(l)
    for (const l of drawing.linetypes) linetypes.of(l.name)
    for (const s of drawing.textStyles) styles.of(s.name)
    for (const d of drawing.dimStyles) dimStyles.of(d.name)
    for (const u of drawing.settings.namedUcs) ucs.of(u.name)
    anonymous = new Map()
    written.forEach((b, i) => {
      if (b.anonymous) {
        anonymous!.set(
          b.name.toUpperCase(),
          `${b.name.slice(0, 2).toUpperCase()}${i + 1}`
        )
      } else blocks.of(b.name)
    })
    return anonymous
  }
  return {
    layer: (name) => (seeded(), layers.of(name)),
    linetype: (name) => (seeded(), linetypes.of(name)),
    textStyle: (name) => (seeded(), styles.of(name)),
    dimStyle: (name) => (seeded(), dimStyles.of(name)),
    block: (name) =>
      seeded().get(name.toUpperCase()) ??
      (name.startsWith("*") ? r12Name(name) : blocks.of(name)),
    ucs: (name) => (seeded(), ucs.of(name)),
  }
}

/** What `writeDxf` planned, which an R12 file is written from. */
export interface R12Plan {
  readonly drawing: DrawingSnapshot
  readonly binary: boolean
  readonly precision: number
  readonly ctx: DxfWriteContext
  readonly written: readonly WrittenBlock[]
  readonly modelEntities: readonly Entity[]
  readonly lookup: BlockLookup
  readonly names: FileNames
  handle(): string
}

/**
 * An R12 DXF (AC1009), ASCII or binary, as AutoCAD 2027's DXFOUT and SAVEAS
 * write «AutoCAD R12/LT2 DXF» (probes dxf/x022, x027, x028, r12.sh): no
 * CLASSES or OBJECTS, tables of R12's groups under R12's names, and what R12
 * has no type for written as AutoCAD's R12 makes it (`r12Conversion`), in
 * silence, as AutoCAD does.
 */
export function writeDxfR12(plan: R12Plan): Uint8Array {
  const { drawing, names, written, handle } = plan
  const s = drawing.settings
  // In space, as AutoCAD's EXTMIN and EXTMAX (x058): an object facing down
  // or tilted is not where its own plane reads it.
  const extents = entitiesWorldBox(plan.modelEntities, plan.lookup)
  const source: R12Source = {
    blocks: plan.lookup,
    dimStyle: plan.ctx.dimStyle,
    extents,
  }

  // The anonymous blocks of what R12 has no type for, named after the
  // drawing's and numbered on from them.
  const made: { name: string; out: DxfOut }[] = []
  let gradients = false
  const converted = (
    c: DxfWriteContext,
    entity: Entity,
    owner: string
  ): boolean => {
    const conversion = r12Conversion(entity, source)
    if (conversion === null) return false
    switch (conversion.kind) {
      case "dropped":
        return true
      case "replaced":
        for (const e of conversion.entities) writeEntity(c, e, owner)
        return true
      case "block": {
        const name = `${conversion.prefix}${written.length + made.length + 1}`
        const out = c.out.sibling()
        made.push({ name, out })
        const inner = { ...c, out }
        for (const piece of conversion.pieces) writeEntity(inner, piece, "0")
        const { out: o } = c
        const dressed = conversion.dressed
        const reference = handle()
        o.str(0, "INSERT")
        o.str(5, reference)
        const layer = dressed?.layerId ?? conversion.layerId
        o.str(8, layer !== undefined ? c.layerName(layer) : "0")
        if (dressed?.linetype !== undefined)
          o.str(6, c.linetypeName(dressed.linetype))
        if (dressed) color(o, dressed.color)
        o.str(2, name)
        o.point(10, 0, 0, 0)
        if (conversion.hatch) {
          writeR12HatchXdata(o, conversion.hatch, reference)
          if (conversion.hatch.gradient) gradients = true
        }
        return true
      }
    }
  }
  const ctx: DxfWriteContext = { ...plan.ctx, converted }

  // Each block's objects, then the drawing's, before the sections that list
  // them: what they convert adds the blocks it is drawn in.
  const contents = written.map((block) => {
    const out = ctx.out.sibling()
    if (!block.xref) block.write({ ...ctx, out }, "0")
    return out
  })
  const entities = ctx.out.sibling()
  for (const e of plan.modelEntities)
    writeEntity({ ...ctx, out: entities }, e, "0")

  const out = new DxfOut(plan.binary, plan.precision, true, false, "tables")

  out.str(0, "SECTION")
  out.str(2, "TABLES")
  table(out, "VPORT", 1)
  activeViewport(out, drawing, extents)
  out.str(0, "ENDTAB")

  const linetypes = drawing.linetypes.filter(
    (l) => !sameLinetypeName(l.name, DEFAULT_LINETYPE_ID)
  )
  table(out, "LTYPE", linetypes.length + 1)
  for (const l of [CONTINUOUS, ...linetypes]) {
    // A complex linetype's text and shapes are R12's no more: its dashes
    // and gaps stay (x027's GAS_LINE).
    out.str(0, "LTYPE")
    out.str(2, names.linetype(l.name))
    out.int(70, 0)
    out.str(3, l.description)
    out.int(72, 65)
    out.int(73, l.pattern.length)
    out.real(
      40,
      l.pattern.reduce((sum, d) => sum + Math.abs(d), 0)
    )
    for (const d of l.pattern) out.real(49, d)
  }
  out.str(0, "ENDTAB")

  table(out, "LAYER", drawing.layers.length)
  for (const layer of drawing.layers) {
    out.str(0, "LAYER")
    out.str(2, names.layer(layer.name))
    out.int(70, layer.locked ? 4 : 0)
    const { index } = dxfColorCodes(layer.color) ?? { index: 7 }
    out.int(62, layer.visible ? index : -index)
    out.str(6, names.linetype(layer.linetype))
  }
  out.str(0, "ENDTAB")

  // A TrueType font is R12's `txt` (f002's fixture-R12: Arial's styles).
  table(out, "STYLE", drawing.textStyles.length)
  for (const style of drawing.textStyles) {
    out.str(0, "STYLE")
    out.str(2, names.textStyle(style.name))
    out.int(70, 0)
    out.real(40, style.height)
    out.real(41, 1)
    out.real(50, 0)
    out.int(71, 0)
    out.real(42, style.height || s.textSize)
    out.str(3, "txt")
    out.str(4, "")
  }
  out.str(0, "ENDTAB")

  table(out, "VIEW", 0)
  out.str(0, "ENDTAB")
  table(out, "UCS", s.namedUcs.length)
  for (const { name, ucs } of s.namedUcs) {
    out.str(0, "UCS")
    out.str(2, names.ucs(name))
    out.int(70, 0)
    out.point(10, ucs.origin.x, ucs.origin.y, ucs.origin.z, true)
    out.point(11, ucs.xAxis.x, ucs.xAxis.y, ucs.xAxis.z, true)
    out.point(12, ucs.yAxis.x, ucs.yAxis.y, ucs.yAxis.z, true)
  }
  out.str(0, "ENDTAB")
  // The dimensions' DSTYLE overrides and a hatch's data are ACAD's xdata; a
  // locked attribute's lock position AcDbAttr's and a gradient's colours
  // their two applications', each registered only when one is written (x033,
  // x040; fixture's unlocked attributes, none).
  const lockedAttributes = [
    ...plan.modelEntities,
    ...drawing.blocks.flatMap((b) => b.entities),
  ].some((e) => e.type === "attdef" && e.modes.lockPosition)
  const apps = [
    "ACAD",
    ...(lockedAttributes ? [R12_ATTRIBUTE_APP] : []),
    ...(gradients ? R12_GRADIENT_COLOR_APPS : []),
  ]
  table(out, "APPID", apps.length)
  for (const app of apps) {
    out.str(0, "APPID")
    out.str(2, app)
    out.int(70, 0)
  }
  out.str(0, "ENDTAB")
  table(out, "DIMSTYLE", drawing.dimStyles.length)
  for (const style of drawing.dimStyles) {
    dimStyleRecord(out, names.dimStyle(style.name), style)
  }
  out.str(0, "ENDTAB")
  out.str(0, "ENDSEC")

  out.str(0, "SECTION")
  out.str(2, "BLOCKS")
  blockBegin(out, "$MODEL_SPACE", 0)
  blockEnd(out, handle())
  blockBegin(out, "$PAPER_SPACE", 0, true)
  blockEnd(out, handle(), true)
  written.forEach((block, i) => {
    const hasAttributes = drawing.blocks.some(
      (b) =>
        b.name === block.name && b.entities.some((e) => e.type === "attdef")
    )
    const flags = block.xref
      ? block.xref.overlay
        ? 4 | 8
        : 4
      : (block.anonymous ? 1 : 0) | (hasAttributes ? 2 : 0)
    blockBegin(
      out,
      names.block(block.name),
      flags,
      false,
      block.basePoint.x,
      block.basePoint.y,
      block.baseZ,
      block.xref?.path ?? ""
    )
    out.append(contents[i])
    blockEnd(out, handle())
  })
  for (const block of made) {
    blockBegin(out, block.name, 1)
    out.append(block.out)
    blockEnd(out, handle())
  }
  out.str(0, "ENDSEC")

  out.str(0, "SECTION")
  out.str(2, "ENTITIES")
  out.append(entities)
  out.str(0, "ENDSEC")
  out.str(0, "EOF")
  // The header last, its handle seed past every handle given.
  const file = new DxfOut(plan.binary, plan.precision, true, true, "tables")
  header(file, drawing, names, extents, handle())
  file.append(out)
  return file.result()
}

function table(out: DxfOut, name: string, count: number): void {
  out.str(0, "TABLE")
  out.str(2, name)
  out.int(70, count)
}

function blockBegin(
  out: DxfOut,
  name: string,
  flags: number,
  paper = false,
  x = 0,
  y = 0,
  z = 0,
  path = ""
): void {
  out.str(0, "BLOCK")
  if (paper) out.int(67, 1)
  out.str(8, "0")
  out.str(2, name)
  out.int(70, flags)
  out.point(10, x, y, z)
  out.str(3, name)
  out.str(1, path)
}

function blockEnd(out: DxfOut, handle: string, paper = false): void {
  out.str(0, "ENDBLK")
  out.str(5, handle)
  if (paper) out.int(67, 1)
  out.str(8, "0")
}

/**
 * HEADER: R12's version, its extents, and each setting the model keeps that
 * R12 has a variable for (no CELTSCALE, CELWEIGHT, LWDISPLAY, INSUNITS or
 * code page: AutoCAD's R12 header lists none of them, f002), handles on.
 */
function header(
  out: DxfOut,
  drawing: DrawingSnapshot,
  names: FileNames,
  extents: ReturnType<typeof entitiesWorldBox>,
  seed: string
): void {
  const s = drawing.settings
  const variable = (name: string) => out.str(9, name)
  const layer =
    drawing.layers.find((l) => l.id === drawing.currentLayerId)?.name ?? "0"
  const textStyle =
    drawing.textStyles.find((t) => t.id === drawing.currentTextStyleId)?.name ??
    "Standard"
  const dimStyle =
    drawing.dimStyles.find((d) => d.id === drawing.currentDimStyleId) ??
    createDefaultDimStyle()
  out.str(0, "SECTION")
  out.str(2, "HEADER")
  variable("$ACADVER")
  out.str(1, "AC1009")
  variable("$INSBASE")
  out.point(10, 0, 0, 0)
  variable("$EXTMIN")
  out.point(10, extents?.min.x ?? 0, extents?.min.y ?? 0, extents?.min.z ?? 0)
  variable("$EXTMAX")
  out.point(10, extents?.max.x ?? 0, extents?.max.y ?? 0, extents?.max.z ?? 0)
  // LIMMAX, TRACEWID and SKETCHINC as AutoCAD's metric drawing has them (x034,
  // x052): R12 has no MEASUREMENT, and without them AutoCAD opens an R12 with
  // the imperial 12,9, 0.05 and 0.1 (getvars.sh). The rest of its header that
  // the model has no value for opens the same left out.
  variable("$LIMMAX")
  out.point(10, 420, 297)
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
  variable("$TRACEWID")
  out.real(40, 1)
  variable("$TEXTSTYLE")
  out.str(7, names.textStyle(textStyle))
  variable("$CLAYER")
  out.str(8, names.layer(layer))
  variable("$CELTYPE")
  out.str(
    6,
    names.linetype(
      s.currentLinetype === LINETYPE_BYLAYER ? "ByLayer" : s.currentLinetype
    )
  )
  variable("$CECOLOR")
  // A true colour its nearest index alone: R12 has no 420.
  if (s.currentColor === COLOR_BYLAYER) out.int(62, 256)
  else if (s.currentColor === "ByBlock") out.int(62, 0)
  else out.int(62, dxfColorCodes(s.currentColor)?.index ?? 256)
  headerDimVariables(out, dimStyle, names.dimStyle(dimStyle.name))
  variable("$LUNITS")
  out.int(70, 2)
  variable("$LUPREC")
  out.int(70, s.precision)
  variable("$SKETCHINC")
  out.real(40, 1)
  variable("$FILLETRAD")
  out.real(40, s.filletRadius)
  variable("$AUNITS")
  out.int(70, 0)
  variable("$AUPREC")
  out.int(70, s.anglePrecision)
  variable("$ELEVATION")
  out.real(40, s.elevation)
  variable("$THICKNESS")
  out.real(40, s.thickness)
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
  variable("$HANDLING")
  out.int(70, 1)
  variable("$HANDSEED")
  out.str(5, seed)
  variable("$SURFTYPE")
  out.int(70, s.surfaceType)
  variable("$SURFU")
  out.int(70, s.surfaceU)
  variable("$SURFV")
  out.int(70, s.surfaceV)
  const ucsName = s.ucsName?.toUpperCase()
  const named = s.namedUcs.find((n) => n.name.toUpperCase() === ucsName)
  variable("$UCSNAME")
  out.str(2, named ? names.ucs(named.name) : "")
  const { origin, xAxis, yAxis } = s.ucs
  variable("$UCSORG")
  out.point(10, origin.x, origin.y, origin.z, true)
  variable("$UCSXDIR")
  out.point(10, xAxis.x, xAxis.y, xAxis.z, true)
  variable("$UCSYDIR")
  out.point(10, yAxis.x, yAxis.y, yAxis.z, true)
  out.str(0, "ENDSEC")
}

/** The *ACTIVE viewport in R12's groups, framing the drawing as ZOOM Extents would. */
function activeViewport(
  out: DxfOut,
  drawing: DrawingSnapshot,
  bounds: ReturnType<typeof entitiesWorldBox>
): void {
  const s = drawing.settings
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
  out.str(0, "VPORT")
  out.str(2, "*ACTIVE")
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
  out.int(74, (s.ucsIcon.visible ? 1 : 0) | (s.ucsIcon.atOrigin ? 2 : 0))
  out.int(75, s.snapMode ? 1 : 0)
  out.int(76, s.gridMode ? 1 : 0)
  out.int(77, 0)
  out.int(78, 0)
}

/**
 * R12's dimension variables in a style (f002's ISO-25): what the model
 * holds, the rest ISO-25's, each by its DIMSTYLE group, in the order of the
 * header's (x034). DIMDEC, DIMADEC and DIMDSEP came with R13: a dimension's
 * own overrides of them still go in its DSTYLE xdata.
 */
const R12_DIM_VARIABLES: readonly (readonly [
  name: string,
  group: number,
  value: (style: DimStyle) => number | string,
])[] = [
  ["$DIMSCALE", 40, (s) => s.scale],
  ["$DIMASZ", 41, (s) => s.arrowSize],
  ["$DIMEXO", 42, (s) => s.extensionOffset],
  ["$DIMDLI", 43, (s) => s.baselineSpacing],
  ["$DIMRND", 45, () => 0],
  ["$DIMDLE", 46, () => 0],
  ["$DIMEXE", 44, (s) => s.extensionBeyond],
  ["$DIMTP", 47, () => 0],
  ["$DIMTM", 48, () => 0],
  ["$DIMTXT", 140, (s) => s.textHeight],
  ["$DIMCEN", 141, (s) => s.centerMark],
  ["$DIMTSZ", 142, () => 0],
  ["$DIMTOL", 71, () => 0],
  ["$DIMLIM", 72, () => 0],
  ["$DIMTIH", 73, () => 0],
  ["$DIMTOH", 74, () => 0],
  ["$DIMSE1", 75, () => 0],
  ["$DIMSE2", 76, () => 0],
  ["$DIMTAD", 77, () => 1],
  ["$DIMZIN", 78, (s) => (s.suppressTrailingZeros ? 8 : 0)],
  ["$DIMBLK", 5, () => ""],
  ["$DIMPOST", 3, () => ""],
  ["$DIMAPOST", 4, () => ""],
  ["$DIMALT", 170, () => 0],
  ["$DIMALTD", 171, () => 3],
  ["$DIMALTF", 143, () => 0.03937007874016],
  ["$DIMLFAC", 144, () => 1],
  ["$DIMTOFL", 172, (s) => (s.forceLineInside ? 1 : 0)],
  ["$DIMTVP", 145, () => 0],
  ["$DIMTIX", 174, () => 0],
  ["$DIMSOXD", 175, () => 0],
  ["$DIMSAH", 173, () => 0],
  ["$DIMBLK1", 6, () => ""],
  ["$DIMBLK2", 7, () => ""],
  ["$DIMCLRD", 176, () => 0],
  ["$DIMCLRE", 177, () => 0],
  ["$DIMCLRT", 178, () => 0],
  ["$DIMTFAC", 146, () => 1],
  ["$DIMGAP", 147, (s) => s.textGap],
]

/** A record's groups in their order (f002): 3–7, 40–48, 140–147, 71–78, 170–178. */
const R12_DIMSTYLE_GROUPS = [3, 4, 5, 6, 7, 40, 41, 42, 43, 44, 45, 46, 47, 48]
  .concat([140, 141, 142, 143, 144, 145, 146, 147])
  .concat([71, 72, 73, 74, 75, 76, 77, 78])
  .concat([170, 171, 172, 173, 174, 175, 176, 177, 178])

/** A dimension style in R12's groups. */
function dimStyleRecord(out: DxfOut, name: string, style: DimStyle): void {
  out.str(0, "DIMSTYLE")
  out.str(2, name)
  out.int(70, 0)
  for (const group of R12_DIMSTYLE_GROUPS) {
    const [, , value] = R12_DIM_VARIABLES.find(([, g]) => g === group)!
    const v = value(style)
    if (typeof v === "string") out.str(group, v)
    else if (isRealDimGroup(group)) out.real(group, v)
    else out.int(group, v)
  }
}

/**
 * The header's dimension variables, `$DIMSTYLE` among them: the current
 * style's, as its record holds them. AutoCAD writes there the style with its
 * current overrides (x051) and reads the header back as those overrides
 * (x053); the model has none (DIMS-D9). Left out, AutoCAD opens an R12 with
 * Standard's imperial values as overrides of the style (DIMASZ 0.18, DIMTAD
 * 0: getvars.sh). DIMASO and DIMSHO, not a style's, are left out: AutoCAD
 * writes DIMASO 1 even at DIMASSOC 0 (x052), and opens both as 1 without
 * them, as its own R12 of a new drawing writes them.
 */
function headerDimVariables(
  out: DxfOut,
  style: DimStyle,
  styleName: string
): void {
  for (const [name, group, value] of R12_DIM_VARIABLES) {
    out.str(9, name)
    const v = value(style)
    if (typeof v === "string") out.str(1, v)
    else if (isRealDimGroup(group)) out.real(40, v)
    else out.int(70, v)
    if (name === "$DIMBLK2") {
      out.str(9, "$DIMSTYLE")
      out.str(2, styleName)
    }
  }
}

import { Vec2, V } from "../../geometry/Vec2"
import { Vec3, add3, cross3, normalize3, planar } from "../../geometry/Vec3"
import { arbitraryAxis, worldToAxes } from "../../geometry/ocs"
import { normalizeAngle } from "../../geometry/primitives"
import {
  BSplineCurve,
  KnotParameterization,
  bsplineDomain,
  bsplinePoint,
  fitParameters,
} from "../../geometry/nurbs"
export { unicode } from "./dxfValues"
import { DxfMLeaderContext, dxfMLeader } from "./dxfMLeader"
import {
  AttributeModes,
  BlockAttribute,
  BlockId,
  DimensionEntity,
  Entity,
  FitArcs,
  HatchLoop,
  MTEXT_ATTACHMENTS,
  Polyline3dFit,
  PolylineEntity,
  PolylineFit,
  PolylineWidth,
  SplineEntity,
  TextJustify,
  createArc,
  createAttributeDefinition,
  createCircle,
  createPoint,
  createSolid2d,
  createFace3d,
  createWipeout,
  createImage,
  ImageEntity,
  ImageReference,
  TableCell,
  TableEntity,
  TableStyleData,
  nextEntityId,
  PointEntity,
  withXAxisAngle,
  createDimension,
  createLeader,
  LeaderEntity,
  LeaderOverrides,
  createEllipse,
  createHatch,
  createInsert,
  createLine,
  createRay,
  createXline,
  createMText,
  createPolyline,
  createPolyline3d,
  createSpline,
  createText,
  withElevation,
  withNormal,
  withThickness,
  withLinetypeScale,
} from "../../domain/entities"
import { EntityColor } from "../../domain/colors"
import {
  DEFAULT_HATCH_ANGLE,
  DEFAULT_HATCH_SCALE,
  HatchPatternLine,
  SOLID_HATCH_PATTERN_ID,
  hatchPattern,
  resolveHatchPatternId,
  samePatternLines,
  userHatchPatternLines,
} from "../../domain/hatchPatterns"
import { DEFAULT_LAYER_ID, LayerId } from "../../domain/layers"
import { LinetypeId } from "../../domain/linetypes"
import {
  DEFAULT_LINEWEIGHT,
  Lineweight,
  clampLineweight,
} from "../../domain/lineweights"
import { DEFAULT_TEXT_HEIGHT, TextStyleId } from "../../domain/textStyles"
import { DimStyleId } from "../../domain/dimStyles"
import { aciColor, trueColor } from "./dxfColors"
import { HatchGradient, isHatchGradientName } from "../../domain/hatchGradients"
import { DxfRecord } from "./dxfSections"
import { GroupCursor, finite, int, num, point, str, unicode } from "./dxfValues"

const DEG = Math.PI / 180

/** A block a reference can be made to: its id and where its base point is. */
/** An IMAGEDEF: what its images show, and its size in pixels if it says. */
export interface DxfImageDefinition {
  readonly reference: ImageReference
  readonly width?: number
  readonly height?: number
}

export interface DxfBlockTarget {
  readonly id: BlockId
  readonly basePoint: Vec2
}

/** What converting an entity needs from the rest of the file, and where it reports. */
export interface DxfEntityContext extends DxfMLeaderContext {
  /** The layer of that name, made when the file's table lacks it (as AutoCAD does: t-ent-only). */
  layer(name: string | undefined): LayerId
  /** The linetype an object names; `undefined` for ByLayer. */
  linetype(name: string | undefined): LinetypeId | undefined
  textStyle(name: string | undefined): TextStyleId
  dimStyle(name: string | undefined): DimStyleId
  /** Whether the style of that name puts its text above the line (DIMTAD other than 0). */
  dimStyleTextAbove(name: string | undefined): boolean
  /** The block a reference names, `"dependent"` for an xref nested in one, `null` for none. */
  block(name: string): DxfBlockTarget | "dependent" | null
  /** The image definition (IMAGEDEF) of that handle, `null` for none. */
  image(handle: string): DxfImageDefinition | null
  /** The table style (TABLESTYLE) of that handle, AutoCAD's Standard for none. */
  tableStyle(handle: string): TableStyleData
  /** The name of the block whose BLOCK_RECORD has that handle, `null` for none. */
  blockRecord(handle: string): string | null
  /** SPLINESEGS, for a spline-fit polyline whose vertices do not say it. */
  readonly splineSegments: number
  /** Whether spline hatch edges carry their fit data (2010 on). */
  readonly hatchSplineFitData: boolean
  /** Counts an object of a type the model has none of. */
  leftOut(type: string): void
  /** Counts an object of a known type too malformed to make. */
  unreadable(): void
}

/**
 * The objects a DXF entity makes: one, or none for what the model has not (it
 * is counted).
 */
export function dxfEntities(
  record: DxfRecord,
  ctx: DxfEntityContext
): Entity[] {
  const made = (entity: Entity | null): Entity[] => {
    if (entity) return [entity]
    ctx.unreadable()
    return []
  }
  switch (record.type) {
    case "LINE":
      return made(line(record, ctx))
    case "CIRCLE":
      return made(circle(record, ctx))
    case "POINT":
      return made(pointObject(record, ctx))
    case "XLINE":
    case "RAY":
      return made(infiniteLine(record, ctx))
    case "SOLID":
      return made(solid(record, ctx))
    case "3DFACE":
      return made(face3d(record, ctx))
    case "WIPEOUT":
      return made(wipeout(record, ctx))
    case "IMAGE":
      return made(image(record, ctx))
    case "ACAD_TABLE":
      return made(table(record, ctx))
    case "MULTILEADER": {
      const mleader = dxfMLeader(record, ctx)
      return made(mleader && common(mleader, record, ctx))
    }
    case "ARC":
      return made(arc(record, ctx))
    case "ELLIPSE":
      return made(ellipse(record, ctx))
    case "LWPOLYLINE":
      return made(lightPolyline(record, ctx))
    case "POLYLINE": {
      const flags = int(record, 70) ?? 0
      // A polyface or polygon mesh: no meshes here.
      if (flags & (16 | 64)) {
        ctx.leftOut("POLYLINE")
        return []
      }
      return made(flags & 8 ? polyline3d(record, ctx) : polyline2d(record, ctx))
    }
    case "SPLINE":
      return made(spline(record, ctx))
    case "TEXT":
      return made(text(record, ctx))
    case "MTEXT":
      return made(mtext(record, ctx))
    case "ATTDEF":
      return made(attributeDefinition(record, ctx))
    case "INSERT":
      return insert(record, ctx)
    case "DIMENSION":
      return dimension(record, ctx)
    case "HATCH":
      return hatch(record, ctx)
    case "LEADER":
      return made(leader(record, ctx))
    // WHY not counted: a viewport is a layout's window onto the model, which
    // is what opens; the others belong to an object already read, or are its end.
    case "VIEWPORT":
    case "VERTEX":
    case "ATTRIB":
    case "SEQEND":
      return []
    default:
      ctx.leftOut(record.type)
      return []
  }
}

/** Whether the record lies in a layout's paper space (DXF 67), which is not opened. */
export function inPaperSpace(record: DxfRecord): boolean {
  return int(record, 67) === 1
}

/** A colour DXF gives an object: its true colour (420), else its index (62). */
export function dxfColor(record: DxfRecord): EntityColor | undefined {
  const rgb = int(record, 420)
  if (rgb !== undefined) return trueColor(rgb) ?? undefined
  const index = int(record, 62)
  return index === undefined
    ? undefined
    : (aciColor(Math.abs(index)) ?? undefined)
}

/**
 * A lineweight in hundredths of a millimetre (DXF 370). ByLayer (−1) and
 * ByBlock (−2) store none; Default (−3) is LWDEFAULT's 0.25 mm.
 */
export function dxfLineweight(
  value: number | undefined
): Lineweight | undefined {
  if (value === undefined || value === -1 || value === -2) return undefined
  if (value === -3) return DEFAULT_LINEWEIGHT
  return value < 0 ? undefined : clampLineweight(value / 100)
}

/** The layer, colour, linetype and its scale, and lineweight every object carries. */
function common<T extends Entity>(
  entity: T,
  record: DxfRecord,
  ctx: DxfEntityContext
): T {
  const color = dxfColor(record)
  const linetype = ctx.linetype(str(record, 6))
  const lineweight = dxfLineweight(int(record, 370))
  return withLinetypeScale(
    {
      ...entity,
      layerId: ctx.layer(str(record, 8)),
      ...(color ? { color } : {}),
      ...(linetype ? { linetype } : {}),
      ...(lineweight !== undefined ? { lineweight } : {}),
    },
    num(record, 48) ?? 1
  )
}

function normal(record: DxfRecord): Vec3 | undefined {
  return point(record, 210)
}

function onPlane<T extends Entity>(
  entity: T,
  record: DxfRecord,
  elevation: number
): T {
  const n = normal(record)
  const raised = withElevation(entity, elevation)
  return n ? withNormal(raised, n) : raised
}

function thick<
  T extends Extract<
    Entity,
    { type: "line" | "circle" | "arc" | "polyline" | "solid2d" }
  >,
>(entity: T, record: DxfRecord): T {
  const thickness = num(record, 39)
  return thickness ? withThickness(entity, thickness) : entity
}

/** The OCS of a normal, or none when it is +Z (the WCS). */
function ocsOf(n: Vec3 | undefined): ((p: Vec3) => Vec3) | null {
  if (!n || upright(n)) return null
  const axes = arbitraryAxis(n)
  return axes ? (p) => worldToAxes(axes, p) : null
}

function upright(n: Vec3): boolean {
  return Math.abs(n.x) < 1e-12 && Math.abs(n.y) < 1e-12 && n.z > 0
}

function line(r: DxfRecord, ctx: DxfEntityContext): Entity | null {
  const start = point(r, 10)
  const end = point(r, 11)
  if (!start || !end) return null
  let entity = thick(createLine(start, end), r)
  const n = normal(r)
  if (n) entity = withNormal(entity, n)
  return common(entity, r, ctx)
}

/**
 * An XLINE or a RAY: its base point (10) and unit direction (11), both in the
 * WCS (the DXF reference); a direction of no length makes none.
 */
function infiniteLine(r: DxfRecord, ctx: DxfEntityContext): Entity | null {
  const base = point(r, 10)
  const direction = point(r, 11)
  if (!base || !direction) return null
  const made =
    r.type === "RAY" ? createRay(base, direction) : createXline(base, direction)
  return made && common(made, r, ctx)
}

function circle(r: DxfRecord, ctx: DxfEntityContext): Entity | null {
  const center = point(r, 10)
  const radius = num(r, 40)
  if (!center || !(radius !== undefined && radius > 0)) return null
  return common(
    onPlane(thick(createCircle(center, radius), r), r, center.z),
    r,
    ctx
  )
}

/**
 * A 2D solid's corners are in the OCS of its 210, at the elevation of the
 * first one's Z, as AutoCAD writes them (solid2d/p01, p08; the fixtures'
 * arrowheads). A fourth left out is the third, a triangle's. A TRACE, its
 * twin of the same groups, is left out and counted: AutoCAD 2027's TRACE is
 * the markup feature, and none of the corpus' files has one (solid2d/p04).
 */
function solid(r: DxfRecord, ctx: DxfEntityContext): Entity | null {
  const a = point(r, 10)
  const b = point(r, 11)
  const c = point(r, 12)
  if (!a || !b || !c) return null
  const d = point(r, 13) ?? c
  return common(
    onPlane(thick(createSolid2d([planar(a), b, c, d]), r), r, a.z),
    r,
    ctx
  )
}

/**
 * A 3DFACE: its corners in the WCS (10–13, a triangle's fourth its third, a
 * missing one taken so too) and its hidden edges (70), as AutoCAD writes it
 * (face3d/f09). No plane and no thickness: its corners hold their Z.
 */
function face3d(r: DxfRecord, ctx: DxfEntityContext): Entity | null {
  const a = point(r, 10)
  const b = point(r, 11)
  const c = point(r, 12)
  if (!a || !b || !c) return null
  const d = point(r, 13) ?? c
  return common(createFace3d([a, b, c, d], int(r, 70) ?? 0), r, ctx)
}

/**
 * A WIPEOUT: a one-pixel image (10 its corner, 11 and 12 its pixel's U and V
 * vectors, 13 its size) clipped to a boundary in pixels, 14 and 24, a
 * rectangle's two corners (71 1) or a polygon closing back on its first (71
 * 2), each at `P + (x + ½)·U + (h − ½ − y)·V` (wipeout/w01, w08). No
 * boundary is its whole image. Its plane is U×V's.
 */
function wipeout(r: DxfRecord, ctx: DxfEntityContext): Entity | null {
  const origin = point(r, 10)
  const u = point(r, 11)
  const v = point(r, 12)
  if (!origin || !u || !v) return null
  const size = point(r, 13)
  const width = size && size.x > 0 ? size.x : 1
  const height = size && size.y > 0 ? size.y : 1
  const xs: number[] = []
  const ys: number[] = []
  r.codes.forEach((code, i) => {
    if (code === 14) xs.push(Number(r.values[i]))
    if (code === 24) ys.push(Number(r.values[i]))
  })
  let clip = xs.map((x, i) => ({ x, y: ys[i] ?? NaN }))
  if (clip.some((c) => !Number.isFinite(c.x) || !Number.isFinite(c.y))) {
    return null
  }
  if (int(r, 71) === 1 && clip.length === 2) {
    const [a, b] = clip
    clip = [a, { x: b.x, y: a.y }, b, { x: a.x, y: b.y }]
  } else if (clip.length === 0) {
    clip = [
      { x: -0.5, y: -0.5 },
      { x: width - 0.5, y: -0.5 },
      { x: width - 0.5, y: height - 0.5 },
      { x: -0.5, y: height - 0.5 },
    ]
  } else if (
    clip.length > 1 &&
    clip[0].x === clip[clip.length - 1].x &&
    clip[0].y === clip[clip.length - 1].y
  ) {
    clip = clip.slice(0, -1)
  }
  if (clip.length < 3) return null
  const world = clip.map((c) => {
    const s = c.x + 0.5
    const t = height - 0.5 - c.y
    return {
      x: origin.x + s * u.x + t * v.x,
      y: origin.y + s * u.y + t * v.y,
      z: origin.z + s * u.z + t * v.z,
    }
  })
  const n = normalize3(cross3(u, v))
  if (!n) return null
  const toOcs = ocsOf(n)
  const local = toOcs ? world.map(toOcs) : world
  const made = createWipeout(local.map((p) => ({ x: p.x, y: p.y })))
  const placed = withElevation(made, local[0].z)
  return common(toOcs ? withNormal(placed, n) : placed, r, ctx)
}

/**
 * The bit AutoCAD sets on a text cell with its value's type (kDataType),
 * written with no value of its own (table/t02): kept, as no other is.
 */
const CELL_DATA_TYPE = 0x40000

/** The table-wide overrides (DXF 93) read: its margins and its rows' text heights. */
const TABLE_MARGIN_H = 0x8
const TABLE_MARGIN_V = 0x10
const TABLE_TEXT_HEIGHTS = 0x700000

/**
 * An ACAD_TABLE (table/t00, t02, t09): its corner (10), direction (11),
 * normal, style (342), rows' heights (141), columns' widths (142), the
 * table-wide margins and text heights SCALE sets (93 with 40, 41 and three
 * 140s, data, title and header: t02), and each cell from its 171 on: text
 * or block (171), merged (173), fitted (174), its span (175, 176), its
 * override flags (91, or 177 in a 2000 or 2004 file) with the alignment,
 * text style and text height they give (170, 7, 140), its rotation (145),
 * its block (340, 144) and its text: code 2's chunks then 1, inside its
 * CELL_VALUE from 2007, after its flags before. Its block (343) is not
 * read: AutoCAD draws a table from these (t01).
 */
function table(r: DxfRecord, ctx: DxfEntityContext): Entity | null {
  const at = point(r, 10)
  const along = point(r, 11) ?? { x: 1, y: 0, z: 0 }
  if (!at) return null
  const n = normal(r)
  const toOcs = ocsOf(n)
  // Its corner in the OCS of its normal, as a block reference's (10); its
  // direction (11) in the WCS (unverified on a tilted table).
  const position = at
  const origin = { x: 0, y: 0, z: 0 }
  const tip = toOcs ? toOcs(along) : along
  const base = toOcs ? toOcs(origin) : origin
  const dx = tip.x - base.x
  const dy = tip.y - base.y
  const length = Math.hypot(dx, dy)
  if (!(length > 0)) return null
  const start = r.codes.findIndex(
    (code, i) => code === 100 && r.values[i].trim() === "AcDbTable"
  )
  const from = start < 0 ? 0 : start
  const after = (code: number) => {
    const i = r.codes.indexOf(code, from)
    return i < 0 ? undefined : finite(r.values[i])
  }
  const rows = Math.trunc(after(91) ?? 0)
  const columns = Math.trunc(after(92) ?? 0)
  if (rows < 1 || columns < 1) return null
  const heights: number[] = []
  const widths: number[] = []
  const firstCell = r.codes.indexOf(171, from)
  const end = firstCell < 0 ? r.codes.length : firstCell
  for (let i = from; i < end; i++) {
    const value = finite(r.values[i])
    if (value === undefined) continue
    if (r.codes[i] === 141) heights.push(value)
    if (r.codes[i] === 142) widths.push(value)
  }
  if (heights.length !== rows || widths.length !== columns) return null
  if ([...heights, ...widths].some((v) => !(v > 0))) return null
  // Table-wide overrides: between its flags (93) and its first row height.
  const flagsAt = r.codes.indexOf(93, from)
  const flags = flagsAt < 0 ? 0 : Math.trunc(finite(r.values[flagsAt]) ?? 0)
  const firstRow = r.codes.indexOf(141, from)
  const own: number[] = []
  let margins: { horizontal?: number; vertical?: number } = {}
  if (flagsAt >= 0 && firstRow > flagsAt) {
    for (let i = flagsAt + 1; i < firstRow; i++) {
      const value = finite(r.values[i])
      if (value === undefined) continue
      if (r.codes[i] === 40 && flags & TABLE_MARGIN_H) {
        margins = { ...margins, horizontal: value }
      }
      if (r.codes[i] === 41 && flags & TABLE_MARGIN_V) {
        margins = { ...margins, vertical: value }
      }
      if (r.codes[i] === 140) own.push(value)
    }
  }
  const textHeights =
    (flags & TABLE_TEXT_HEIGHTS) === TABLE_TEXT_HEIGHTS &&
    own.length === 3 &&
    own.every((h) => h > 0)
      ? { data: own[0], title: own[1], header: own[2] }
      : undefined
  const overrides = {
    ...(margins.horizontal !== undefined && margins.horizontal >= 0
      ? { horizontalMargin: margins.horizontal }
      : {}),
    ...(margins.vertical !== undefined && margins.vertical >= 0
      ? { verticalMargin: margins.vertical }
      : {}),
    ...(textHeights ? { textHeights } : {}),
  }
  const cells: TableCell[] = []
  if (firstCell >= 0) {
    let i = firstCell
    while (i < r.codes.length && cells.length < rows * columns) {
      let next = r.codes.indexOf(171, i + 1)
      if (next < 0) next = r.codes.length
      cells.push(tableCell(r, i, next, ctx))
      i = next
    }
  }
  while (cells.length < rows * columns) cells.push({})
  const made: TableEntity = {
    id: nextEntityId(),
    type: "table",
    layerId: DEFAULT_LAYER_ID,
    position: { x: position.x, y: position.y },
    direction: { x: dx / length, y: dy / length },
    rowHeights: heights,
    columnWidths: widths,
    cells,
    style: ctx.tableStyle(str(r, 342)?.trim() ?? ""),
    ...(Object.keys(overrides).length > 0 ? { overrides } : {}),
  }
  const raised = withElevation(made, position.z)
  return common(n ? withNormal(raised, n) : raised, r, ctx)
}

/** One cell, from its 171 at `start` up to `end`. */
function tableCell(
  r: DxfRecord,
  start: number,
  end: number,
  ctx: DxfEntityContext
): TableCell {
  const valueAt = r.codes.indexOf(301, start)
  const head = valueAt >= 0 && valueAt < end ? valueAt : end
  const first = (code: number, from = start, to = head) => {
    for (let i = from; i < to; i++) {
      if (r.codes[i] === code) return r.values[i]
    }
    return undefined
  }
  const number = (code: number) => {
    const value = first(code)
    return value === undefined ? undefined : finite(value)
  }
  const kind = number(171)
  const merged = number(173) === 1
  const columns = Math.max(1, Math.trunc(number(175) ?? 1))
  const rows = Math.max(1, Math.trunc(number(176) ?? 1))
  const flags = Math.trunc(number(91) ?? number(177) ?? 0)
  const alignment = number(170)
  const style = first(7)
  const height = number(140)
  const rotation = number(145)
  const valueEnd = r.codes.indexOf(304, head)
  const stop = head < end && valueEnd >= 0 && valueEnd < end ? valueEnd : end
  let text = ""
  for (let i = head === end ? start : head; i < stop; i++) {
    if (r.codes[i] === 2) text += r.values[i]
    if (r.codes[i] === 1) {
      text += r.values[i]
      break
    }
  }
  const blockName =
    kind === 2 ? ctx.blockRecord(first(340)?.trim() ?? "") : null
  const target = blockName ? ctx.block(blockName) : null
  return {
    ...(kind !== 2 && text.trimEnd() ? { text: unicode(text.trimEnd()) } : {}),
    ...(target && target !== "dependent"
      ? {
          block: {
            blockId: target.id,
            scale: positive(number(144)) ?? 1,
            autoFit: number(174) === 1,
          },
        }
      : {}),
    ...(!merged && (columns > 1 || rows > 1)
      ? { span: { columns, rows } }
      : {}),
    ...(merged ? { merged: true as const } : {}),
    ...(alignment !== undefined && MTEXT_ATTACHMENTS[alignment - 1]
      ? { alignment: MTEXT_ATTACHMENTS[alignment - 1] }
      : {}),
    ...(style?.trim() ? { textStyleId: ctx.textStyle(style.trim()) } : {}),
    ...(positive(height) !== undefined ? { textHeight: height } : {}),
    ...(rotation ? { rotation } : {}),
    ...(flags & CELL_DATA_TYPE ? { flags: CELL_DATA_TYPE } : {}),
  }
}

function positive(value: number | undefined): number | undefined {
  return value !== undefined && value > 0 ? value : undefined
}

/**
 * An IMAGE, as AutoCAD opens one whose file it cannot find (image/i01): its
 * corner (10), one pixel's sides (11, 12) and its definition (340), whose
 * size frames it; the display (70), brightness, contrast and fade
 * (281–283) and clip boundary (71, 14 and 24, a polygon's closing vertex
 * dropped) kept to be written back. Its plane is U×V's.
 */
function image(r: DxfRecord, ctx: DxfEntityContext): Entity | null {
  const origin = point(r, 10)
  const u = point(r, 11)
  const v = point(r, 12)
  const definition = ctx.image(str(r, 340) ?? "")
  if (!origin || !u || !v || !definition) return null
  const size = point(r, 13)
  const width = definition.width ?? size?.x ?? 0
  const height = definition.height ?? size?.y ?? 0
  if (!(width > 0) || !(height > 0)) return null
  const n = normalize3(cross3(u, v))
  if (!n) return null
  // A mirrored one in plan (U×V down, image/i06e) stays in the WCS, its
  // sides turning clockwise, as MIRROR leaves one here.
  const level = Math.abs(n.x) < 1e-12 && Math.abs(n.y) < 1e-12
  const toOcs = level ? null : ocsOf(n)
  const at = toOcs ? toOcs(origin) : origin
  const side = (w: Vec3) => {
    if (!toOcs) return { x: w.x, y: w.y }
    const tip = toOcs(add3(origin, w))
    return { x: tip.x - at.x, y: tip.y - at.y }
  }
  const xs: number[] = []
  const ys: number[] = []
  r.codes.forEach((code, i) => {
    if (code === 14) xs.push(Number(r.values[i]))
    if (code === 24) ys.push(Number(r.values[i]))
  })
  let clip = xs.map((x, i) => ({ x, y: ys[i] ?? NaN }))
  const polygonal = int(r, 71) === 2
  if (
    polygonal &&
    clip.length > 1 &&
    clip[0].x === clip[clip.length - 1].x &&
    clip[0].y === clip[clip.length - 1].y
  ) {
    clip = clip.slice(0, -1)
  }
  // The whole frame's two corners, unclipped (280 0), are what AutoCAD
  // writes of an image with no clip of its own (image/i00, i08): nothing to
  // keep.
  const clipped = int(r, 280) === 1
  const whole =
    !clipped &&
    !polygonal &&
    clip.length === 2 &&
    clip[0].x === -0.5 &&
    clip[0].y === -0.5 &&
    clip[1].x === width - 0.5 &&
    clip[1].y === height - 0.5
  const keepClip =
    !whole &&
    clip.length >= 2 &&
    clip.every((c) => Number.isFinite(c.x) && Number.isFinite(c.y))
  const display = int(r, 70)
  const byte = (code: number, fallback: number) => {
    const value = int(r, code)
    return value !== undefined &&
      value !== fallback &&
      value >= 0 &&
      value <= 100
      ? value
      : undefined
  }
  const brightness = byte(281, 50)
  const contrast = byte(282, 50)
  const fade = byte(283, 0)
  const made: ImageEntity = {
    ...createImage(at, side(u), side(v), width, height, definition.reference),
    ...(display !== undefined && display !== 7 ? { display } : {}),
    ...(brightness !== undefined ? { brightness } : {}),
    ...(contrast !== undefined ? { contrast } : {}),
    ...(fade !== undefined ? { fade } : {}),
    ...(keepClip
      ? {
          clip: {
            polygonal,
            points: clip,
            ...(clipped ? {} : { off: true as const }),
          },
        }
      : {}),
  }
  return common(toOcs ? withNormal(made, n) : made, r, ctx)
}

/** DXF writes a point in the WCS (point/p04), the model in the OCS of its 210. */
function pointObject(r: DxfRecord, ctx: DxfEntityContext): Entity | null {
  const at = point(r, 10)
  if (!at) return null
  const n = normal(r)
  const toOcs = ocsOf(n)
  const p = toOcs ? toOcs(at) : at
  let entity: PointEntity = withXAxisAngle(
    createPoint(p, undefined),
    (num(r, 50) ?? 0) * DEG
  )
  entity = withElevation(entity, p.z)
  const thickness = num(r, 39)
  if (thickness) entity = withThickness(entity, thickness)
  return common(n ? withNormal(entity, n) : entity, r, ctx)
}

/**
 * A leader's vertices are the WCS's, its normal 210 (leader/p22: AutoCAD's
 * DXFOUT, and the samples' leaders with a 210 of -Z beside their text); the
 * model keeps them in its OCS. A group at its default is left out: 71 1, 72
 * 0, 73 3, 75 0, 211 the X axis. Its annotation (340) is linked by the reader
 * once the space is read (`readDxf`); the overrides its palette shows come
 * from its DSTYLE xdata (DIMSCALE 40, DIMASZ 41, DIMTAD 77, DIMGAP 147), and
 * a DIMTAD of 0, its own or its style's, is kept as one.
 */
function leader(r: DxfRecord, ctx: DxfEntityContext): Entity | null {
  // The vertices are the WCS's, put in the OCS as every object's points are;
  // one facing -Z with a text facing +Z is turned to its text's frame when
  // the two are linked (`leaderInPlaneOf`, readDxf).
  const n = normal(r)
  const toOcs = ocsOf(n)
  const ocs = (p: Vec3) => (toOcs ? toOcs(p) : p)
  const points: Vec3[] = []
  const cursor = new GroupCursor(r)
  while (!cursor.done()) {
    if (cursor.code() === 10) points.push(ocs(cursor.takePoint(10, true)!))
    else cursor.next()
  }
  if (points.length < 2) return null
  // 211 is a WCS direction, world X when left out (leader/p25: a leader facing
  // -Z without one runs along its OCS's -X).
  const along = point(r, 211) ?? { x: 1, y: 0, z: 0 }
  const local = toOcs ? toOcs(along) : along
  const angle =
    Math.hypot(local.x, local.y) > 1e-12 ? Math.atan2(local.y, local.x) : 0
  const styleName = str(r, 3)
  const { textAbove: ownAbove, ...sizes } = dstyleOverrides(r)
  const textAbove = ownAbove ?? ctx.dimStyleTextAbove(styleName)
  const overrides: LeaderOverrides = textAbove
    ? sizes
    : { ...sizes, textAbove: false }
  let entity: LeaderEntity = createLeader(
    points.map((p) => planar(p)),
    ctx.dimStyle(styleName),
    {
      arrow: (int(r, 71) ?? 1) !== 0,
      spline: (int(r, 72) ?? 0) === 1,
      ...(Math.abs(angle) > 1e-12 ? { horizontal: normalizeAngle(angle) } : {}),
    }
  )
  entity = {
    ...entity,
    hook: (int(r, 75) ?? 0) === 1 && points.length > 2,
    ...(Object.keys(overrides).length > 0 ? { overrides } : {}),
  }
  const raised = withElevation(entity, points[0].z)
  return common(n ? withNormal(raised, n) : raised, r, ctx)
}

/** A leader's DSTYLE xdata: the dimension variables it overrides, those its palette shows. */
function dstyleOverrides(r: DxfRecord): LeaderOverrides {
  const { codes, values } = r
  let i = codes.findIndex(
    (code, k) => code === 1000 && values[k].trim().toUpperCase() === "DSTYLE"
  )
  if (i < 0) return {}
  const found: {
    scale?: number
    arrowSize?: number
    textGap?: number
    textAbove?: boolean
  } = {}
  for (i++; i < codes.length - 1; i++) {
    if (codes[i] === 1002 && values[i].trim() === "}") break
    if (codes[i] !== 1070) continue
    const variable = Number.parseInt(values[i], 10)
    const value = finite(values[i + 1])
    if (value === undefined) continue
    if (variable === 40 && value > 0) found.scale = value
    else if (variable === 41 && value >= 0) found.arrowSize = value
    else if (variable === 147) found.textGap = value
    else if (variable === 77) found.textAbove = value !== 0
    i++
  }
  return found
}

function arc(r: DxfRecord, ctx: DxfEntityContext): Entity | null {
  const center = point(r, 10)
  const radius = num(r, 40)
  if (!center || !(radius !== undefined && radius > 0)) return null
  const start = normalizeAngle((num(r, 50) ?? 0) * DEG)
  const end = normalizeAngle((num(r, 51) ?? 360) * DEG)
  return common(
    onPlane(thick(createArc(center, radius, start, end), r), r, center.z),
    r,
    ctx
  )
}

/** DXF writes an ellipse's centre and axis in the WCS (x006's 2E8), the model in its OCS. */
function ellipse(r: DxfRecord, ctx: DxfEntityContext): Entity | null {
  const center = point(r, 10)
  const axis = point(r, 11)
  const ratio = num(r, 40)
  if (!center || !axis || !(ratio !== undefined && ratio > 0)) return null
  const n = normal(r)
  const toOcs = ocsOf(n)
  const c = toOcs ? toOcs(center) : center
  const a = toOcs ? toOcs(axis) : axis
  const entity = createEllipse(c, a, ratio, {
    startParam: num(r, 41) ?? 0,
    endParam: num(r, 42) ?? 2 * Math.PI,
  })
  const raised = withElevation(entity, c.z)
  return common(n ? withNormal(raised, n) : raised, r, ctx)
}

/** The segments of a polyline of `count` vertices, closed or not. */
function segmentCount(count: number, closed: boolean): number {
  return closed ? count : count - 1
}

function lightPolyline(r: DxfRecord, ctx: DxfEntityContext): Entity | null {
  const flags = int(r, 70) ?? 0
  const closed = (flags & 1) !== 0
  const constant = num(r, 43) ?? 0
  const vertices: { x: number; y: number }[] = []
  const starts: (number | undefined)[] = []
  const ends: (number | undefined)[] = []
  const bulges: number[] = []
  let ownWidths = false
  r.codes.forEach((code, i) => {
    const value = finite(r.values[i])
    if (value === undefined) return
    const last = vertices.length - 1
    switch (code) {
      case 10:
        vertices.push({ x: value, y: 0 })
        break
      case 20:
        if (last >= 0) vertices[last].y = value
        break
      case 40:
        if (last >= 0) {
          starts[last] = value
          ownWidths = true
        }
        break
      case 41:
        if (last >= 0) {
          ends[last] = value
          ownWidths = true
        }
        break
      case 42:
        if (last >= 0) bulges[last] = value
        break
    }
  })
  if (vertices.length < 2) return null
  const count = segmentCount(vertices.length, closed)
  const segments = Array.from({ length: count }, (_, i) => i)
  const widths =
    ownWidths || constant > 0
      ? segments.map((i): PolylineWidth => [
          starts[i] ?? constant,
          ends[i] ?? constant,
        ])
      : undefined
  let entity: PolylineEntity = createPolyline(
    vertices,
    closed,
    undefined,
    segments.map((i) => bulges[i] ?? 0),
    undefined,
    widths
  )
  if (flags & 128) entity = { ...entity, linetypeGeneration: true }
  return common(onPlane(thick(entity, r), r, num(r, 38) ?? 0), r, ctx)
}

function vertexFlags(v: DxfRecord): number {
  return int(v, 70) ?? 0
}

/**
 * A 2D POLYLINE, the form a fitted one takes (fixture f001): a curve-fit one
 * (70's 2) lists each frame vertex then the joint PEDIT's Fit put after it
 * (vertex flag 1), each with the bulge of its arc; a spline-fit one (4) its
 * frame (16) and the vertices of its curve (8), which are derived here.
 */
function polyline2d(r: DxfRecord, ctx: DxfEntityContext): Entity | null {
  const flags = int(r, 70) ?? 0
  const closed = (flags & 1) !== 0
  const children = r.children ?? []
  const curveFit = (flags & 2) !== 0 && (flags & 4) === 0
  const splineFit = (flags & 4) !== 0
  const frame = children.filter((v) =>
    splineFit ? vertexFlags(v) & 16 : !(vertexFlags(v) & (curveFit ? 1 | 8 : 8))
  )
  const points = frame.map((v) => point(v, 10)).filter((p) => p !== undefined)
  if (points.length < 2 || points.length !== frame.length) return null
  const count = segmentCount(points.length, closed)
  const startWidth = num(r, 40) ?? 0
  const endWidth = num(r, 41) ?? 0
  const widths = frame
    .slice(0, count)
    .map((v): PolylineWidth => [
      num(v, 40) ?? startWidth,
      num(v, 41) ?? endWidth,
    ])
  const bulges =
    curveFit || splineFit
      ? undefined
      : frame.slice(0, count).map((v) => num(v, 42) ?? 0)
  let entity: PolylineEntity = createPolyline(
    points,
    closed,
    undefined,
    bulges,
    undefined,
    widths
  )
  const tangents = frame.map((v) =>
    vertexFlags(v) & 2 ? (num(v, 50) ?? 0) * DEG : null
  )
  const ownTangents = tangents.some((t) => t !== null) ? { tangents } : {}
  if (curveFit) {
    const arcs = frame.slice(0, count).map((v): FitArcs | null => {
      const next = children[children.indexOf(v) + 1]
      const joint = next && vertexFlags(next) & 1 ? point(next, 10) : undefined
      return joint
        ? {
            joint: planar(joint),
            bulges: [num(v, 42) ?? 0, num(next, 42) ?? 0],
          }
        : null
    })
    const fit: PolylineFit = { kind: "curve", arcs, ...ownTangents }
    entity = { ...entity, fit }
  } else if (splineFit) {
    const kind = int(r, 75) === 5 ? "quadratic" : "cubic"
    const curve = children.filter((v) => vertexFlags(v) & 8)
    const segments = splineSegments(curve, points.length, closed, kind, ctx)
    const fit: PolylineFit = { kind, segments, ...ownTangents }
    entity = { ...entity, fit }
  }
  if (flags & 128) entity = { ...entity, linetypeGeneration: true }
  return common(onPlane(thick(entity, r), r, point(r, 10)?.z ?? 0), r, ctx)
}

/**
 * SPLINESEGS when the polyline was fitted, from how many vertices its curve
 * has: `(frame − degree) × segs + 1` open, `frame × segs` closed (f001: four
 * frame vertices and nine of curve at 8), negative where those carry arcs.
 */
function splineSegments(
  curve: readonly DxfRecord[],
  frame: number,
  closed: boolean,
  kind: "quadratic" | "cubic",
  ctx: DxfEntityContext
): number {
  const spans = closed ? frame : frame - (kind === "quadratic" ? 2 : 3)
  const per = spans > 0 ? (curve.length - (closed ? 0 : 1)) / spans : NaN
  if (!Number.isInteger(per) || per < 1) return ctx.splineSegments
  return curve.some((v) => (num(v, 42) ?? 0) !== 0) ? -per : per
}

function polyline3d(r: DxfRecord, ctx: DxfEntityContext): Entity | null {
  const flags = int(r, 70) ?? 0
  const closed = (flags & 1) !== 0
  const children = r.children ?? []
  const splineFit = (flags & 4) !== 0
  const frame = children.filter((v) =>
    splineFit ? vertexFlags(v) & 16 : !(vertexFlags(v) & 8)
  )
  const points = frame.map((v) => point(v, 10)).filter((p) => p !== undefined)
  if (points.length === 0 || points.length !== frame.length) return null
  let entity: Entity = createPolyline3d(points, closed)
  if (splineFit) {
    const kind = int(r, 75) === 5 ? "quadratic" : "cubic"
    const curve = children.filter((v) => vertexFlags(v) & 8)
    const fit: Polyline3dFit = {
      kind,
      segments: Math.abs(
        splineSegments(curve, points.length, closed, kind, ctx)
      ),
    }
    entity = { ...entity, fit }
  }
  return common(entity, r, ctx)
}

/** The knot spacings a fit spline's flags name (f006: 32 chord, 64 square root, 128 uniform). */
function flaggedParameterization(flags: number): KnotParameterization | null {
  if (flags & 32) return "chord"
  if (flags & 64) return "sqrtChord"
  if (flags & 128) return "uniform"
  return null
}

const PARAMETERIZATIONS: readonly KnotParameterization[] = [
  "chord",
  "sqrtChord",
  "uniform",
]

/**
 * A SPLINE. One with fit points (a cubic's, 11) is a fit spline on them and
 * its end tangents (12, 13: the start's as typed, the end's unit, as the
 * model keeps them, f004); its knots name their spacing when one of the three
 * gives them, else they are its own (Custom). Without fit points — a CV
 * spline, or a closed fit one, which AutoCAD writes without them (f004) — it
 * is its control points (10), knots (40) and weights (41). Points are the
 * WCS's in the file and its plane's OCS in the model.
 */
function spline(r: DxfRecord, ctx: DxfEntityContext): Entity | null {
  const flags = int(r, 70) ?? 0
  const degree = int(r, 71) ?? 3
  const closed = (flags & 1) !== 0
  const knots: number[] = []
  const weights: number[] = []
  const controls: Vec3[] = []
  const fits: Vec3[] = []
  let startTangent: Vec3 | undefined
  let endTangent: Vec3 | undefined
  const cursor = new GroupCursor(r)
  while (!cursor.done()) {
    switch (cursor.code()) {
      case 40:
        knots.push(cursor.number())
        cursor.next()
        break
      case 41:
        weights.push(cursor.number())
        cursor.next()
        break
      case 10:
        controls.push(cursor.takePoint(10, true)!)
        break
      case 11:
        fits.push(cursor.takePoint(11, true)!)
        break
      case 12:
        startTangent = cursor.takePoint(12, true)
        break
      case 13:
        endTangent = cursor.takePoint(13, true)
        break
      default:
        cursor.next()
    }
  }
  const n = normal(r)
  const planarSpline = (flags & 8) !== 0 && n !== undefined
  const toOcs = planarSpline ? ocsOf(n) : null
  const ocs = (p: Vec3) => (toOcs ? toOcs(p) : p)
  const fitted = fits.length >= 2 && degree === 3 && (num(r, 44) ?? 0) <= 1e-9
  let entity: SplineEntity
  if (fitted) {
    const parameterization =
      flaggedParameterization(flags) ??
      matchingParameterization(fits, knots, closed)
    const own =
      parameterization === null ||
      !knotsMatch(fits, knots, closed, parameterization)
    entity = createSpline("fit", fits.map(ocs), {
      closed,
      knots: parameterization ?? "chord",
      ...(startTangent ? { startTangent: ocs(startTangent) } : {}),
      ...(endTangent ? { endTangent: ocs(endTangent) } : {}),
      ...(own ? { knotVector: knots } : {}),
    })
  } else {
    if (controls.length < 2) return null
    // WHY not an open one's clamped knots 1 apart: they are what the model
    // derives, so the spline is as SPLINE's CV method makes it here. A closed
    // one keeps them: AutoCAD writes it on open knots (f004), not periodic.
    const own =
      knots.length > 0 &&
      (closed || !uniformKnots(knots, controls.length, degree))
    entity = createSpline("cv", controls.map(ocs), {
      degree,
      closed,
      ...(own ? { knotVector: knots } : {}),
      ...(flags & 4 && weights.length === controls.length ? { weights } : {}),
    })
  }
  return common(planarSpline && n ? withNormal(entity, n) : entity, r, ctx)
}

/** Whether these are an open spline's clamped knots 1 apart: degree + 1 zeros, 1, 2 …, the last degree + 1 times. */
function uniformKnots(
  knots: readonly number[],
  count: number,
  degree: number
): boolean {
  if (knots.length !== count + degree + 1) return false
  const last = count - degree
  return knots.every((k, i) => k === Math.min(Math.max(i - degree, 0), last))
}

/** The distinct knots of a fit spline, which are its fit points' parameters. */
function distinctKnots(knots: readonly number[]): number[] {
  const out: number[] = []
  for (const k of knots) {
    if (
      out.length === 0 ||
      Math.abs(k - out[out.length - 1]) > 1e-9 * Math.max(1, Math.abs(k))
    ) {
      out.push(k)
    }
  }
  return out
}

function knotsMatch(
  points: readonly Vec3[],
  knots: readonly number[],
  closed: boolean,
  parameterization: KnotParameterization
): boolean {
  const expected = fitParameters(points, parameterization, closed)
  const actual = distinctKnots(knots)
  if (actual.length !== expected.length) return false
  const offset = actual[0] - expected[0]
  return expected.every(
    (e, i) =>
      Math.abs(actual[i] - offset - e) <= 1e-6 * Math.max(1, Math.abs(e))
  )
}

function matchingParameterization(
  points: readonly Vec3[],
  knots: readonly number[],
  closed: boolean
): KnotParameterization | null {
  return (
    PARAMETERIZATIONS.find((p) => knotsMatch(points, knots, closed, p)) ?? null
  )
}

/**
 * TEXT's justification (72 across, 73 or an attribute's 74 down). Align (3)
 * and Fit (5) take two points the model has not, so they open left-justified
 * at the first, with their height and rotation.
 */
function justification(horizontal: number, vertical: number): TextJustify {
  if (vertical === 0) {
    return horizontal === 1
      ? "center"
      : horizontal === 2
        ? "right"
        : horizontal === 4
          ? "middle"
          : "left"
  }
  const row = vertical === 3 ? "t" : vertical === 2 ? "m" : "b"
  const column = horizontal === 1 ? "c" : horizontal === 2 ? "r" : "l"
  return `${row}${column}` as TextJustify
}

/** Where a TEXT, ATTDEF or ATTRIB hangs and how: its point, justification, height and rotation. */
function textPlacement(r: DxfRecord, verticalCode: number) {
  const justify = justification(int(r, 72) ?? 0, int(r, verticalCode) ?? 0)
  const first = point(r, 10)
  const position = justify === "left" ? first : (point(r, 11) ?? first)
  const height = num(r, 40)
  return {
    position,
    justify,
    height: height !== undefined && height > 0 ? height : DEFAULT_TEXT_HEIGHT,
    rotation: normalizeAngle((num(r, 50) ?? 0) * DEG),
  }
}

/** A string value as written, CRLF already gone: TEXT keeps its own blanks. */
function raw(r: DxfRecord, code: number): string | undefined {
  const i = r.codes.indexOf(code)
  return i < 0 ? undefined : r.values[i]
}

function text(r: DxfRecord, ctx: DxfEntityContext): Entity | null {
  const placed = textPlacement(r, 73)
  if (!placed.position) return null
  const entity = createText(placed.position, unicode(raw(r, 1) ?? ""), {
    height: placed.height,
    rotation: placed.rotation,
    justify: placed.justify,
    styleId: ctx.textStyle(str(r, 7)),
  })
  return common(onPlane(entity, r, placed.position.z), r, ctx)
}

/**
 * MTEXT: its contents are the 3 groups in order and the 1 after them; its
 * point is the WCS's, its direction the X axis 11 (f004) or the rotation 50,
 * in radians.
 */
function mtext(r: DxfRecord, ctx: DxfEntityContext): Entity | null {
  const at = point(r, 10)
  if (!at) return null
  const contents = r.codes
    .map((code, i) => (code === 3 ? r.values[i] : null))
    .filter((v) => v !== null)
    .join("")
  const n = normal(r)
  const toOcs = ocsOf(n)
  const position = toOcs ? toOcs(at) : at
  const direction = point(r, 11)
  const along = direction && toOcs ? toOcs(direction) : direction
  const rotation = along ? Math.atan2(along.y, along.x) : (num(r, 50) ?? 0)
  const attachment = MTEXT_ATTACHMENTS[(int(r, 71) ?? 1) - 1] ?? "tl"
  const height = num(r, 40)
  const entity = createMText(position, unicode(contents + (raw(r, 1) ?? "")), {
    height: height !== undefined && height > 0 ? height : DEFAULT_TEXT_HEIGHT,
    width: num(r, 41) ?? 0,
    rotation: normalizeAngle(rotation),
    attachment,
    lineSpacingStyle: int(r, 73) === 2 ? "exactly" : "atLeast",
    lineSpacingFactor: num(r, 44) ?? 1,
    styleId: ctx.textStyle(str(r, 7)),
  })
  const raised = withElevation(entity, position.z)
  return common(n ? withNormal(raised, n) : raised, r, ctx)
}

/**
 * ATTDEF's and ATTRIB's flags (70): invisible 1, constant 2, verify 4, preset
 * 8. Lock position is the 280 after them, from 2007 (2010 on adds a version
 * 280 before them); a file older than that has none, unlocked (f002: the
 * 2018 file writes 0 for it).
 */
function attributeModes(r: DxfRecord): AttributeModes {
  const flagsAt = r.codes.indexOf(70)
  const flags = flagsAt < 0 ? 0 : (finite(r.values[flagsAt]) ?? 0)
  const lockAt = flagsAt < 0 ? -1 : r.codes.indexOf(280, flagsAt + 1)
  const lock = lockAt < 0 ? 0 : (finite(r.values[lockAt]) ?? 0)
  return {
    invisible: (flags & 1) !== 0,
    constant: (flags & 2) !== 0,
    verify: (flags & 4) !== 0,
    preset: (flags & 8) !== 0,
    lockPosition: lock !== 0,
  }
}

function attributeDefinition(
  r: DxfRecord,
  ctx: DxfEntityContext
): Entity | null {
  const placed = textPlacement(r, 74)
  const tag = str(r, 2)
  if (!placed.position || !tag) return null
  const entity = createAttributeDefinition(
    placed.position,
    tag.trim().toUpperCase(),
    {
      prompt: unicode(raw(r, 3) ?? ""),
      value: unicode(raw(r, 1) ?? ""),
      modes: attributeModes(r),
      height: placed.height,
      rotation: placed.rotation,
      justify: placed.justify,
      styleId: ctx.textStyle(str(r, 7)),
    }
  )
  return common(onPlane(entity, r, placed.position.z), r, ctx)
}

/**
 * A block reference, a MINSERT's with its rows and columns (70, 71, 44, 45,
 * after AcDbMInsertBlock: probe minsert/m06). Its attributes go into the
 * block's coordinates, where the model keeps them.
 */
function insert(r: DxfRecord, ctx: DxfEntityContext): Entity[] {
  const name = str(r, 2)?.trim()
  const target = name ? ctx.block(name) : null
  // Only an xref's own drawing, never in the file, references one nested in it.
  if (target === "dependent") return []
  const position = point(r, 10)
  if (!target || !position) {
    ctx.unreadable()
    return []
  }
  const sx = nonZero(num(r, 41))
  const sy = nonZero(num(r, 42))
  const rotation = normalizeAngle((num(r, 50) ?? 0) * DEG)
  const placement = {
    position: planar(position),
    sx,
    sy,
    rotation,
    base: target.basePoint,
  }
  const attributes = (r.children ?? [])
    .map((a) => blockAttribute(a, placement, ctx))
    .filter((a) => a !== null)
  const columns = int(r, 70) ?? 1
  const rows = int(r, 71) ?? 1
  // Its class, or several cells in a file that leaves the markers out.
  const minsert =
    columns > 1 ||
    rows > 1 ||
    r.codes.some(
      (code, i) => code === 100 && r.values[i].trim() === "AcDbMInsertBlock"
    )
  const entity = createInsert(target.id, placement.position, {
    scaleX: sx,
    scaleY: sy,
    rotation,
    attributes,
    grid: minsert
      ? {
          columns,
          rows,
          columnSpacing: num(r, 44) ?? 0,
          rowSpacing: num(r, 45) ?? 0,
        }
      : undefined,
  })
  return [common(onPlane(entity, r, position.z), r, ctx)]
}

/** `v` turned `angle` radians counterclockwise. */
function rotate(v: Vec2, angle: number): Vec2 {
  const c = Math.cos(angle)
  const s = Math.sin(angle)
  return { x: v.x * c - v.y * s, y: v.x * s + v.y * c }
}

function nonZero(value: number | undefined): number {
  return value === undefined || value === 0 || !Number.isFinite(value)
    ? 1
    : value
}

interface Placement {
  readonly position: Vec2
  readonly sx: number
  readonly sy: number
  readonly rotation: number
  readonly base: Vec2
}

/**
 * An ATTRIB as the model keeps a reference's attribute: in the block's own
 * coordinates, undoing the reference's placement — the inverse of what
 * `insertFlatGeometry` does with it.
 */
function blockAttribute(
  r: DxfRecord,
  placement: Placement,
  ctx: DxfEntityContext
): BlockAttribute | null {
  const placed = textPlacement(r, 74)
  const tag = str(r, 2)
  if (!placed.position || !tag) return null
  const local = rotate(
    V.sub(placed.position, placement.position),
    -placement.rotation
  )
  const position = V.add(placement.base, {
    x: local.x / placement.sx,
    y: local.y / placement.sy,
  })
  const color = dxfColor(r)
  const linetype = ctx.linetype(str(r, 6))
  const lineweight = dxfLineweight(int(r, 370))
  return {
    tag: tag.trim().toUpperCase(),
    value: unicode(raw(r, 1) ?? ""),
    position,
    height: placed.height / Math.abs(placement.sy),
    rotation: normalizeAngle(placed.rotation - placement.rotation),
    justify: placed.justify,
    styleId: ctx.textStyle(str(r, 7)),
    invisible: ((int(r, 70) ?? 0) & 1) !== 0,
    layerId: ctx.layer(str(r, 8)),
    ...(color ? { color } : {}),
    ...(linetype ? { linetype } : {}),
    ...(lineweight !== undefined ? { lineweight } : {}),
  }
}

/**
 * A DIMENSION by its type (70's low bits): rotated (0) and aligned (1) from
 * their extension line origins (13, 14) and line point (10); angular from
 * three points (5: vertex 15) or two lines (2: 13–14 and 15–10, arc point
 * 16); diameter (3) and radius (4) from the point on the curve (15) and the
 * centre or the far point (10), placed where AutoCAD put the text (11).
 * Ordinate (6) has no kind here. The geometry block (`*D`) is not read: the
 * model draws a dimension from its points.
 */
function dimension(r: DxfRecord, ctx: DxfEntityContext): Entity[] {
  const flags = int(r, 70) ?? 0
  const type = flags & 15
  if (type === 6) {
    ctx.leftOut("DIMENSION")
    return []
  }
  const n = normal(r)
  const toOcs = ocsOf(n)
  const world = (code: number) => {
    const p = point(r, code)
    return p && toOcs ? toOcs(p) : p
  }
  const ocs = (code: number) => point(r, code)
  const at = world(10)
  const override = raw(r, 1)
  const textAngle = num(r, 53)
  const options = {
    styleId: ctx.dimStyle(str(r, 3)),
    ...(override !== undefined && override !== "" && override !== "<>"
      ? { text: unicode(override) }
      : {}),
    ...(textAngle ? { textAngle: normalizeAngle(textAngle * DEG) } : {}),
  }
  const moved = flags & 128 ? ocs(11) : undefined
  const textPoint = moved ? { textPoint: planar(moved) } : {}
  let made: DimensionEntity | null = null
  const first = world(13)
  const second = world(14)
  if ((type === 0 || type === 1) && first && second && at) {
    made = createDimension(
      type === 0 ? "linear" : "aligned",
      first,
      second,
      at,
      {
        ...options,
        ...textPoint,
        rotation: type === 0 ? normalizeAngle((num(r, 50) ?? 0) * DEG) : 0,
      }
    )
  } else if (type === 5 && first && second && at) {
    const vertex = world(15)
    if (vertex) {
      made = createDimension("angular", first, second, at, {
        ...options,
        ...textPoint,
        vertex,
      })
    }
  } else if (type === 2) {
    made = twoLineAngular(r, world, options, textPoint)
  } else if (type === 3 || type === 4) {
    const onCurve = world(15)
    const textAt = ocs(11) ?? at
    if (onCurve && at && textAt) {
      const center = type === 4 ? at : V.lerp(at, onCurve, 0.5)
      made = createDimension(
        type === 4 ? "radius" : "diameter",
        center,
        onCurve,
        textAt,
        options
      )
    }
  }
  if (!made) {
    ctx.unreadable()
    return []
  }
  const raised = withElevation(made, at?.z ?? 0)
  return [common(n ? withNormal(raised, n) : raised, r, ctx)]
}

/**
 * A two-line angular dimension as the model's vertex and two endpoints: the
 * lines' crossing, and on each line the point nearest the arc on the side of
 * the vertex whose sector holds the arc point — as DIMANGULAR resolves two
 * picked lines (`AngularDimensionTool`'s `resolveOrigins`).
 */
function twoLineAngular(
  r: DxfRecord,
  world: (code: number) => Vec3 | undefined,
  options: Parameters<typeof createDimension>[4],
  textPoint: { textPoint?: Vec2 }
): DimensionEntity | null {
  const a1 = world(13)
  const a2 = world(14)
  const b1 = world(15)
  const b2 = world(10)
  const arcAt = point(r, 16)
  if (!a1 || !a2 || !b1 || !b2 || !arcAt) return null
  const da = V.sub(a2, a1)
  const db = V.sub(b2, b1)
  const cross = da.x * db.y - da.y * db.x
  if (Math.abs(cross) < 1e-12 * V.length(da) * V.length(db)) return null
  const t = ((b1.x - a1.x) * db.y - (b1.y - a1.y) * db.x) / cross
  const vertex = V.add(a1, V.scale(da, t))
  const offset = V.sub(arcAt, vertex)
  const radius = V.length(offset)
  if (radius < 1e-9) return null
  const bearing = Math.atan2(offset.y, offset.x)
  const ua = V.normalize(da)
  const ub = V.normalize(db)
  for (const ra of [ua, V.scale(ua, -1)]) {
    for (const rb of [ub, V.scale(ub, -1)]) {
      const from = Math.atan2(ra.y, ra.x)
      const to = Math.atan2(rb.y, rb.x)
      const [start, end] =
        normalizeAngle(to - from) <= Math.PI ? [from, to] : [to, from]
      if (normalizeAngle(bearing - start) <= normalizeAngle(end - start)) {
        return createDimension(
          "angular",
          rayPoint(a1, a2, vertex, ra, radius),
          rayPoint(b1, b2, vertex, rb, radius),
          planar(arcAt),
          { ...options, ...textPoint, vertex }
        )
      }
    }
  }
  return null
}

/** The point of a line nearest an arc at `radius` along `ray` from `vertex`. */
function rayPoint(
  a: Vec2,
  b: Vec2,
  vertex: Vec2,
  ray: Vec2,
  radius: number
): Vec2 {
  const reach = (end: Vec2) => V.dot(V.sub(end, vertex), ray)
  const far = Math.max(reach(a), reach(b))
  const near = Math.max(Math.min(reach(a), reach(b)), 0)
  const distance = far <= 1e-9 ? radius : Math.min(Math.max(radius, near), far)
  return V.add(vertex, V.scale(ray, distance))
}

/**
 * A HATCH: its loops as the model's rings of vertices and bulges, its
 * pattern by name (a fill when 70 says so), scale, angle and origin, or its
 * gradient (450 1); one of a gradient this model lacks is left out.
 */
function hatch(r: DxfRecord, ctx: DxfEntityContext): Entity[] {
  const gradient = int(r, 450) === 1 ? hatchGradient(r) : undefined
  if (gradient === null) {
    ctx.leftOut("HATCH")
    return []
  }
  if (gradient) {
    const loops = hatchLoops(r, ctx)
    if (loops.length === 0) {
      ctx.unreadable()
      return []
    }
    // AutoCAD stores a gradient on SOLID (2, 70 1: gradient/g02).
    const entity = createHatch(loops, {
      patternId: SOLID_HATCH_PATTERN_ID,
      gradient,
    })
    return [common(onPlane(entity, r, point(r, 10)?.z ?? 0), r, ctx)]
  }
  const loops = hatchLoops(r, ctx)
  if (loops.length === 0) {
    ctx.unreadable()
    return []
  }
  const solid = ((int(r, 70) ?? 0) & 1) !== 0
  // A pattern's name may carry a hatch style code after it (`ANSI31,_O`,
  // Outer), as -HATCH takes it (its help page), and AutoCAD 2027 writes old
  // hatches so in five of its sample drawings; the islands are the loops here.
  const name = (str(r, 2)?.trim() ?? "").replace(/,_?[NOI]$/i, "")
  const type = solid ? 1 : (int(r, 76) ?? 1)
  // A name it does not know AutoCAD reads in capitals (hatchpat/p06l: `u`
  // lists as `U`).
  const patternId = solid
    ? SOLID_HATCH_PATTERN_ID
    : (resolveHatchPatternId(name) ?? name.toUpperCase())
  const read = num(r, 41)
  // A User-defined pattern's 41 is its spacing (p00: `_U` spaced 5 writes 5).
  const scale = read !== undefined && read > 0 ? read : DEFAULT_HATCH_SCALE
  const angle = normalizeAngle((num(r, 52) ?? 0) * DEG)
  const origin = hatchOrigin(r, patternId, scale, angle)
  const patternType = type === 0 ? "user" : type === 2 ? "custom" : undefined
  const entity = createHatch(loops, {
    patternId,
    ...(patternType ? { patternType } : {}),
    ...(solid
      ? {}
      : hatchOwnLines(r, patternId, patternType, origin, scale, angle)),
    patternScale: scale,
    patternAngle: angle || DEFAULT_HATCH_ANGLE,
    origin,
  })
  return [common(onPlane(entity, r, point(r, 10)?.z ?? 0), r, ctx)]
}

/**
 * A HATCH's gradient, from 450 on (gradient/g02, the samples' Annotation
 * blocks): 460 its angle in radians, 461 its shift (0 centred), 452 one
 * colour with 462 its tint, then each colour's 463, 63 and 421 (the true
 * colour, read before the index one), and 470 its name. Null for a name
 * this model lacks.
 */
function hatchGradient(r: DxfRecord): HatchGradient | null {
  const cursor = new GroupCursor(r, r.codes.indexOf(450))
  let angle = 0
  let shift = 0
  let oneColor = false
  let tint = 1
  let name = "LINEAR"
  const colors: EntityColor[] = []
  let index: EntityColor | null = null
  const flush = () => {
    if (index) colors.push(index)
    index = null
  }
  for (; !cursor.done(); cursor.next()) {
    const code = cursor.code()
    if (code === 1001) break
    if (code === 460) angle = cursor.number()
    else if (code === 461) shift = cursor.number()
    else if (code === 452) oneColor = cursor.number() === 1
    else if (code === 462) tint = cursor.number()
    else if (code === 470) name = cursor.value().trim().toUpperCase()
    else if (code === 463) flush()
    else if (code === 63) index = aciColor(cursor.number())
    else if (code === 421) {
      index = trueColor(cursor.number()) ?? index
      flush()
    }
  }
  flush()
  // No 470 reads as LINEAR, GFNAME's first.
  if (!isHatchGradientName(name)) return null
  const first = colors[0] ?? "#0000ff"
  return {
    name,
    colors: [first, colors[1] ?? first],
    ...(oneColor ? { tint: Math.min(Math.max(tint, 0), 1) } : {}),
    angle: normalizeAngle(angle),
    centered: shift === 0,
  }
}

/**
 * The pattern lines a HATCH carries (78, then each line's 53, 43–46, 79 and
 * 49s: drawn, turned and scaled), taken back to pattern units about its
 * origin, and kept on it unless they are the registry's for its name, as
 * AutoCAD draws a hatch from the lines it holds (hatchpat/p05): HOUND or
 * GRASS, which this build does not ship, a User-defined `_U`, a program's
 * own pattern, and acad.pat's inch ANSI31 of a metric drawing, 25.4 times
 * denser than acadiso.pat's (291 hatches of 10 of AutoCAD's samples).
 */
function hatchOwnLines(
  r: DxfRecord,
  patternId: string,
  patternType: "user" | "custom" | undefined,
  origin: Vec2,
  scale: number,
  angle: number
): { patternLines?: HatchPatternLine[] } {
  const lines: HatchPatternLine[] = []
  const start = r.codes.indexOf(78)
  if (start >= 0) {
    const cursor = new GroupCursor(r, start)
    const count = cursor.take(78) ?? 0
    for (let i = 0; i < count && !cursor.done(); i++) {
      const lineAngle = cursor.seek(53)
      if (lineAngle === undefined) break
      const at = lineAngle * DEG
      const base = { x: cursor.take(43) ?? 0, y: cursor.take(44) ?? 0 }
      const offset = { x: cursor.take(45) ?? 0, y: cursor.take(46) ?? 0 }
      const dashCount = cursor.take(79) ?? 0
      const dashes: number[] = []
      for (let k = 0; k < dashCount; k++) {
        const dash = cursor.take(49)
        if (dash === undefined) break
        dashes.push(dash / scale)
      }
      const delta = V.scale(rotate(offset, -at), 1 / scale)
      if (Math.abs(delta.y) < 1e-12) continue
      lines.push({
        angle: normalizeAngle(at - angle),
        origin: V.scale(rotate(V.sub(base, origin), -angle), 1 / scale),
        deltaX: delta.x,
        deltaY: delta.y,
        dashes,
      })
    }
  }
  if (patternType === "user") {
    // None written: the spacing and Double (77) say them.
    return {
      patternLines:
        lines.length > 0 ? lines : userHatchPatternLines(int(r, 77) === 1),
    }
  }
  const registry = hatchPattern(patternId)?.lines
  if (lines.length === 0 || (registry && samePatternLines(lines, registry))) {
    return {}
  }
  return { patternLines: lines }
}

/**
 * HPORIGIN: AutoCAD writes it in the hatch's ACAD xdata (1010, f004's 30B at
 * 7,3); without it, the first pattern line's base (43, 44) less where the
 * pattern's own first line starts, turned and scaled.
 */
function hatchOrigin(
  r: DxfRecord,
  patternId: string,
  scale: number,
  angle: number
): Vec2 {
  const app = r.codes.findIndex(
    (code, i) => code === 1001 && r.values[i].trim() === "ACAD"
  )
  if (app >= 0) {
    const cursor = new GroupCursor(r, app + 1)
    const x = cursor.seek(1010)
    const y = cursor.take(1020)
    if (x !== undefined && y !== undefined) return { x, y }
  }
  const base = { x: num(r, 43) ?? 0, y: num(r, 44) ?? 0 }
  const first = hatchPattern(patternId)?.lines[0]
  if (!first) return base
  return V.sub(base, rotate(V.scale(first.origin, scale), angle))
}

/** How finely a hatch edge with no arc form (an elliptical arc, a spline) is laid as straight runs. */
const EDGE_STEP = Math.PI / 32

function hatchLoops(r: DxfRecord, ctx: DxfEntityContext): HatchLoop[] {
  const start = r.codes.indexOf(91)
  if (start < 0) return []
  const cursor = new GroupCursor(r, start)
  const count = cursor.take(91) ?? 0
  const loops: HatchLoop[] = []
  for (let i = 0; i < count && !cursor.done(); i++) {
    const flags = cursor.seek(92)
    if (flags === undefined) break
    const loop = flags & 2 ? polylineLoop(cursor) : edgeLoop(cursor, ctx)
    // The loop's source objects, whose handles the model does not keep.
    const sources = cursor.take(97) ?? 0
    for (let k = 0; k < sources; k++) cursor.take(330)
    if (loop && loop.vertices.length >= 2) loops.push(loop)
  }
  return loops
}

function polylineLoop(cursor: GroupCursor): HatchLoop | null {
  const hasBulge = (cursor.take(72) ?? 0) !== 0
  cursor.take(73)
  const count = cursor.take(93) ?? 0
  const vertices: Vec2[] = []
  const bulges: number[] = []
  for (let i = 0; i < count; i++) {
    const p = cursor.takePoint(10)
    if (!p) return null
    vertices.push(planar(p))
    bulges.push(hasBulge ? (cursor.take(42) ?? 0) : 0)
  }
  return { vertices, ...(bulges.some((b) => b !== 0) ? { bulges } : {}) }
}

/** One edge of a hatch loop as runs from its start: points, and each run's bulge. */
interface EdgeRuns {
  readonly points: Vec2[]
  readonly bulges: number[]
  readonly end: Vec2
}

/**
 * A loop of edges laid end to end. An edge that ends where the last one
 * ended, rather than starting there, is taken backwards, as programs write
 * them either way.
 */
function edgeLoop(
  cursor: GroupCursor,
  ctx: DxfEntityContext
): HatchLoop | null {
  const count = cursor.take(93) ?? 0
  const vertices: Vec2[] = []
  const bulges: number[] = []
  let last: Vec2 | null = null
  for (let i = 0; i < count; i++) {
    const kind = cursor.take(72)
    const edge =
      kind === 1
        ? lineEdge(cursor)
        : kind === 2
          ? arcEdge(cursor)
          : kind === 3
            ? ellipseEdge(cursor)
            : kind === 4
              ? splineEdge(cursor, ctx)
              : null
    if (!edge) return null
    const runs: EdgeRuns =
      last &&
      V.distance(edge.points[0], last) > 1e-6 &&
      V.distance(edge.end, last) <= 1e-6
        ? reversed(edge)
        : edge
    vertices.push(...runs.points)
    bulges.push(...runs.bulges)
    last = runs.end
  }
  return { vertices, ...(bulges.some((b) => b !== 0) ? { bulges } : {}) }
}

function reversed(edge: EdgeRuns): EdgeRuns {
  const points = [...edge.points.slice(1), edge.end].reverse()
  return {
    points,
    bulges: edge.bulges.map((b) => -b).reverse(),
    end: edge.points[0],
  }
}

function lineEdge(cursor: GroupCursor): EdgeRuns | null {
  const a = cursor.takePoint(10)
  const b = cursor.takePoint(11)
  if (!a || !b) return null
  return { points: [planar(a)], bulges: [0], end: planar(b) }
}

/**
 * An arc edge. Counterclockwise (73 = 1) from 50 to 51, which AutoCAD writes
 * past 360 to keep the end after the start (f004: 270 to 450). Clockwise
 * (0), its angles are measured the other way round, about −X (**unverified**:
 * AutoCAD wrote f006's clockwise island as a polyline loop).
 */
function arcEdge(cursor: GroupCursor): EdgeRuns | null {
  const center = cursor.takePoint(10)
  const radius = cursor.take(40)
  const s = cursor.take(50) ?? 0
  const e = cursor.take(51) ?? 360
  const ccw = (cursor.take(73) ?? 1) !== 0
  if (!center || !(radius !== undefined && radius > 0)) return null
  const c = planar(center)
  const sweep = sweepDegrees(s, e)
  const startAngle = (ccw ? s : -s) * DEG
  const at = (angle: number) =>
    V.add(c, V.scale({ x: Math.cos(angle), y: Math.sin(angle) }, radius))
  const sign = ccw ? 1 : -1
  const endAngle = startAngle + sign * sweep * DEG
  if (sweep >= 360 - 1e-9) {
    // A whole circle: two half turns, a bulge of ±1 each.
    return {
      points: [at(startAngle), at(startAngle + Math.PI)],
      bulges: [sign, sign],
      end: at(startAngle),
    }
  }
  return {
    points: [at(startAngle)],
    bulges: [sign * Math.tan((sweep * DEG) / 4)],
    end: at(endAngle),
  }
}

/** The sweep from `s` to `e` degrees, in (0, 360]. */
function sweepDegrees(s: number, e: number): number {
  const sweep = (((e - s) % 360) + 360) % 360
  return sweep === 0 && e !== s ? 360 : sweep === 0 ? 360 : sweep
}

/** An elliptical arc edge, as straight runs: its angles taken as the ellipse's parameters (**unverified**). */
function ellipseEdge(cursor: GroupCursor): EdgeRuns | null {
  const center = cursor.takePoint(10)
  const axis = cursor.takePoint(11)
  const ratio = cursor.take(40)
  const s = cursor.take(50) ?? 0
  const e = cursor.take(51) ?? 360
  const ccw = (cursor.take(73) ?? 1) !== 0
  if (!center || !axis || !(ratio !== undefined && ratio > 0)) return null
  const c = planar(center)
  const major = planar(axis)
  const minor = V.scale(V.perpendicular(major), ratio)
  const sweep = sweepDegrees(s, e) * DEG
  const start = (ccw ? s : -s) * DEG
  const sign = ccw ? 1 : -1
  const steps = Math.max(2, Math.ceil(sweep / EDGE_STEP))
  const at = (t: number) =>
    V.add(c, V.add(V.scale(major, Math.cos(t)), V.scale(minor, Math.sin(t))))
  const points = Array.from({ length: steps }, (_, i) =>
    at(start + (sign * sweep * i) / steps)
  )
  return { points, bulges: points.map(() => 0), end: at(start + sign * sweep) }
}

/** A spline edge, as straight runs along its curve. */
function splineEdge(
  cursor: GroupCursor,
  ctx: DxfEntityContext
): EdgeRuns | null {
  const degree = cursor.take(94) ?? 3
  const rational = (cursor.take(73) ?? 0) !== 0
  cursor.take(74)
  const knotCount = cursor.take(95) ?? 0
  const controlCount = cursor.take(96) ?? 0
  const knots: number[] = []
  for (let i = 0; i < knotCount; i++) {
    const k = cursor.take(40)
    if (k === undefined) return null
    knots.push(k)
  }
  const controlPoints: Vec3[] = []
  const weights: number[] = []
  for (let i = 0; i < controlCount; i++) {
    const p = cursor.takePoint(10)
    if (!p) return null
    controlPoints.push(p)
    if (rational) weights.push(cursor.take(42) ?? 1)
  }
  if (ctx.hatchSplineFitData) {
    const fits = cursor.take(97) ?? 0
    for (let i = 0; i < fits; i++) cursor.takePoint(11)
    if (fits > 0) {
      cursor.takePoint(12)
      cursor.takePoint(13)
    }
  }
  if (
    controlPoints.length < 2 ||
    knots.length !== controlPoints.length + degree + 1
  )
    return null
  const curve: BSplineCurve = {
    degree,
    knots,
    controlPoints,
    ...(rational ? { weights } : {}),
  }
  const { start, end } = bsplineDomain(curve)
  const steps = Math.max(8, (controlPoints.length - degree) * 16)
  const points = Array.from({ length: steps }, (_, i) =>
    planar(bsplinePoint(curve, start + ((end - start) * i) / steps))
  )
  return {
    points,
    bulges: points.map(() => 0),
    end: planar(bsplinePoint(curve, end)),
  }
}

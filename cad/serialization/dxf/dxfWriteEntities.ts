import { Vec2, V } from "../../geometry/Vec2"
import { Vec3, scale3 } from "../../geometry/Vec3"
import { Axes3, arbitraryAxis, axesToWorld } from "../../geometry/ocs"
import {
  BSplineCurve,
  bsplineDomain,
  bsplineSegment,
} from "../../geometry/nurbs"
import {
  ArcEntity,
  AttributeDefinitionEntity,
  BlockAttribute,
  BlockDefinition,
  CircleEntity,
  PointEntity,
  Solid2dEntity,
  DimensionEntity,
  EllipseEntity,
  Entity,
  HatchEntity,
  Face3dEntity,
  WipeoutEntity,
  ImageEntity,
  TableEntity,
  InsertEntity,
  LeaderEntity,
  LineEntity,
  MTextEntity,
  Polyline3dEntity,
  PolylineEntity,
  SplineEntity,
  TextEntity,
  TextJustify,
  MTEXT_ATTACHMENTS,
} from "../../domain/entityTypes"
import { lineEndZ, lineStartZ } from "../../domain/elevation"
import { leaderSide } from "../../domain/leaders"
import { isPeriodicSpline, splineCurve } from "../../domain/splines"
import { polylineCurve, polyline3dCurve } from "../../domain/polylineFits"
import {
  DimensionGeometry,
  dimensionGeometry,
  dimensionMeasurement,
} from "../../domain/dimensions"
import { DimStyle } from "../../domain/dimStyles"
import { isSolidHatchPattern } from "../../domain/hatchPatterns"
import type { HatchGradient } from "../../domain/hatchGradients"
import { hatchLines } from "../../domain/hatchPatternEdits"
import { DEFAULT_LINEWEIGHT } from "../../domain/lineweights"
import { aciIndex } from "./dxfColors"
import { DxfOut } from "./dxfOut"

const DEG = 180 / Math.PI

/** What writing an object needs from the rest of the file. */
export interface DxfWriteContext {
  readonly out: DxfOut
  /** AC1015 (2000) to AC1032 (2018), as a number: groups added in a release are written from it. */
  readonly version: number
  handle(): string
  /**
   * The handle an object takes: a new one, or, for a leader and its
   * annotation, the one each was given when the other named it first.
   */
  entityHandle(entity: Entity | BlockAttribute): string
  /** The leaders an annotation answers to (ACAD_REACTORS), by handle. */
  reactors(entity: Entity | BlockAttribute): readonly string[]
  /** A leader's annotation written with it: its handle, or none. */
  annotation(leader: LeaderEntity): string | null
  layerName(id: string): string
  textStyleName(id: string): string
  dimStyleName(id: string): string
  dimStyle(id: string): DimStyle
  blockName(id: string): string
  block(id: string): BlockDefinition | undefined
  /** The `*D` block drawn for a dimension. */
  dimensionBlock(dimension: DimensionEntity): string
  /** The `*U` block an array's items are drawn in. */
  arrayBlock(insert: InsertEntity): string | null
  /** Counts an object the file cannot hold, by its DXF type. */
  leftOut(type: string): void
  /** The `*T` block a table's graphics are written in, and its record's handle. */
  tableBlock(table: TableEntity): {
    readonly name: string
    readonly record: string
  }
  /** The TABLESTYLE a table names, by handle, which lists the table written as `own`. */
  tableStyle(table: TableEntity, own: string): string
  /** The handle of a block's BLOCK_RECORD. */
  blockRecord(id: string): string
  /** The IMAGEDEF an image shows, by handle. */
  imageDefinition(image: ImageEntity): string
  /** A new IMAGEDEF_REACTOR for the image written with handle `own`. */
  imageReactor(image: ImageEntity, own: string): string
}

/** The groups every object opens with, the owner its block's record. */
function head(
  ctx: DxfWriteContext,
  type: string,
  entity: Entity | BlockAttribute,
  owner: string,
  handle: string = ctx.entityHandle(entity)
): void {
  const { out } = ctx
  out.str(0, type)
  out.str(5, handle)
  // An annotation names its leaders before its owner (leader/p22).
  const reactors = ctx.reactors(entity)
  if (reactors.length > 0) {
    out.str(102, "{ACAD_REACTORS")
    for (const reactor of reactors) out.str(330, reactor)
    out.str(102, "}")
  }
  out.str(330, owner)
  out.str(100, "AcDbEntity")
  out.str(8, ctx.layerName(entity.layerId))
  if (entity.linetype !== undefined) out.str(6, entity.linetype)
  color(out, entity.color)
  if (entity.lineweight !== undefined)
    out.int(370, Math.round(entity.lineweight * 100))
  if ("linetypeScale" in entity && entity.linetypeScale !== undefined) {
    out.real(48, entity.linetypeScale)
  }
}

/**
 * A colour as AutoCAD writes it: the index when the model's RGB is one of
 * the index colours' (red is 1), else the nearest index and the true colour
 * (420), as AutoCAD writes a true colour.
 */
export function color(out: DxfOut, value: string | undefined): void {
  // A table's block's pieces (`tableBlock`), as AutoCAD's are (table/t03).
  if (value === "ByBlock") {
    out.int(62, 0)
    return
  }
  if (value === undefined || !value.startsWith("#")) return
  const rgb = Number.parseInt(value.slice(1), 16)
  const { index, exact } = aciIndex(rgb)
  out.int(62, index)
  if (!exact) out.int(420, rgb)
}

/** A layer's lineweight: AutoCAD's Default (−3) for the 0.25 mm a layer starts at here. */
export function layerLineweight(value: number): number {
  return value === DEFAULT_LINEWEIGHT ? -3 : Math.round(value * 100)
}

function axes(entity: Entity): Axes3 | null {
  const n = entity.normal
  if (!n || (Math.abs(n.x) < 1e-12 && Math.abs(n.y) < 1e-12 && n.z > 0))
    return null
  return arbitraryAxis(n)
}

function writeNormal(ctx: DxfWriteContext, entity: Entity): void {
  const n = entity.normal
  if (!n || (n.x === 0 && n.y === 0 && n.z === 1)) return
  ctx.out.point(210, n.x, n.y, n.z, true)
}

function thickness(ctx: DxfWriteContext, entity: { thickness?: number }) {
  if (entity.thickness) ctx.out.real(39, entity.thickness)
}

/** Writes one object of the drawing, or of a block, owned by `owner`. */
export function writeEntity(
  ctx: DxfWriteContext,
  entity: Entity,
  owner: string
): void {
  switch (entity.type) {
    case "line":
      return line(ctx, entity, owner)
    case "circle":
      return circle(ctx, entity, owner)
    case "point":
      return pointObject(ctx, entity, owner)
    case "solid2d":
      return solid(ctx, entity, owner)
    case "face3d":
      return face3d(ctx, entity, owner)
    case "wipeout":
      return wipeout(ctx, entity, owner)
    case "image":
      return image(ctx, entity, owner)
    case "table":
      return table(ctx, entity, owner)
    case "arc":
      return arc(ctx, entity, owner)
    case "ellipse":
      return ellipse(ctx, entity, owner)
    case "polyline":
      return entity.fit
        ? polyline2d(ctx, entity, owner)
        : lightPolyline(ctx, entity, owner)
    case "polyline3d":
      return polyline3d(ctx, entity, owner)
    case "spline":
      return spline(ctx, entity, owner)
    case "text":
      return text(ctx, entity, owner)
    case "mtext":
      return mtext(ctx, entity, owner)
    case "attdef":
      return attributeDefinition(ctx, entity, owner)
    case "insert":
      return insert(ctx, entity, owner)
    case "dimension":
      return dimension(ctx, entity, owner)
    case "hatch":
      return hatch(ctx, entity, owner)
    case "leader":
      return leader(ctx, entity, owner)
    // WHY counted, not written: a region and a solid are ACIS bodies, whose
    // SAT this engine does not write (docs/next-solids.md §6).
    case "region":
      return ctx.leftOut("REGION")
    case "solid3d":
      return ctx.leftOut("3DSOLID")
  }
}

function line(ctx: DxfWriteContext, e: LineEntity, owner: string): void {
  const { out } = ctx
  head(ctx, "LINE", e, owner)
  out.str(100, "AcDbLine")
  thickness(ctx, e)
  out.point(10, e.start.x, e.start.y, lineStartZ(e))
  out.point(11, e.end.x, e.end.y, lineEndZ(e))
  writeNormal(ctx, e)
}

function circle(ctx: DxfWriteContext, e: CircleEntity, owner: string): void {
  const { out } = ctx
  head(ctx, "CIRCLE", e, owner)
  out.str(100, "AcDbCircle")
  thickness(ctx, e)
  out.point(10, e.center.x, e.center.y, e.elevation ?? 0)
  out.exact(40, e.radius)
  writeNormal(ctx, e)
}

/**
 * A 2D solid's corners in its OCS at its elevation, thickness after them, as
 * AutoCAD writes them (solid2d/p08's entget, the fixtures' arrowheads).
 */
function solid(ctx: DxfWriteContext, e: Solid2dEntity, owner: string): void {
  const { out } = ctx
  const z = e.elevation ?? 0
  head(ctx, "SOLID", e, owner)
  out.str(100, "AcDbTrace")
  e.corners.forEach((corner, i) => out.point(10 + i, corner.x, corner.y, z))
  thickness(ctx, e)
  writeNormal(ctx, e)
}

/** A 3D face as AutoCAD writes it (face3d/f09): its WCS corners, 70 only for hidden edges. */
function face3d(ctx: DxfWriteContext, e: Face3dEntity, owner: string): void {
  const { out } = ctx
  head(ctx, "3DFACE", e, owner)
  out.str(100, "AcDbFace")
  e.corners.forEach((corner, i) =>
    out.point(10 + i, corner.x, corner.y, corner.z)
  )
  if (e.invisibleEdges) out.int(70, e.invisibleEdges)
}

/**
 * A wipeout as AutoCAD writes a new one (wipeout/w01, w14): a one-pixel
 * image on the square of its boundary's larger side, from its lower left
 * corner (10, 11, 12 in the WCS), clipped to its vertices in pixels, closed
 * back to the first; 290 from 2010.
 */
function wipeout(ctx: DxfWriteContext, e: WipeoutEntity, owner: string): void {
  const { out } = ctx
  const xs = e.vertices.map((v) => v.x)
  const ys = e.vertices.map((v) => v.y)
  const min = { x: Math.min(...xs), y: Math.min(...ys) }
  const side = Math.max(Math.max(...xs) - min.x, Math.max(...ys) - min.y) || 1
  const a = axes(e)
  const z = e.elevation ?? 0
  const world = (p: Vec3): Vec3 => (a ? axesToWorld(a, p) : p)
  const origin = world({ ...min, z })
  const u = a ? scale3(a.x, side) : { x: side, y: 0, z: 0 }
  const v = a ? scale3(a.y, side) : { x: 0, y: side, z: 0 }
  head(ctx, "WIPEOUT", e, owner)
  out.str(100, "AcDbWipeout")
  out.int(90, 0)
  out.point(10, origin.x, origin.y, origin.z)
  out.point(11, u.x, u.y, u.z)
  out.point(12, v.x, v.y, v.z)
  // Its size in pixels, X and Y alone, as AutoCAD writes it (w15).
  out.point(13, 1, 1)
  out.str(340, "0")
  out.int(70, 7)
  out.int(280, 1)
  out.int(281, 50)
  out.int(282, 50)
  out.int(283, 0)
  if (ctx.version >= 1024) out.int(290, 0)
  out.str(360, "0")
  out.int(71, 2)
  out.int(91, e.vertices.length + 1)
  for (const p of [...e.vertices, e.vertices[0]]) {
    out.real(14, (p.x - min.x) / side - 0.5)
    out.real(24, 0.5 - (p.y - min.y) / side)
  }
}

/**
 * An ACAD_TABLE as AutoCAD's DXFOUT writes one (table/t00, t02, t09): a
 * reference to its `*T` block at its corner, its style (342) and block
 * record (343), its direction in the WCS (11), its size, the table-wide
 * overrides SCALE sets (93 with 40, 41 and the data, title and header text
 * heights: t02), its rows' heights and columns' widths, then each cell:
 * text or block, merged, fitted, its span, its override flags (91, 177
 * before 2007) and the alignment, text style and height they give, its
 * block (340, 144); from 2007 its value in a CELL_VALUE (empty, a string,
 * a block: 93 7, 6, 1), before it the text alone (1), as 2000 and 2004
 * write it. From 2010 the table's version (280 0) first.
 */
function table(ctx: DxfWriteContext, e: TableEntity, owner: string): void {
  const { out } = ctx
  const own = ctx.entityHandle(e)
  const block = ctx.tableBlock(e)
  const legacy = ctx.version < 1021
  head(ctx, "ACAD_TABLE", e, owner, own)
  out.str(100, "AcDbBlockReference")
  out.str(2, block.name)
  out.point(10, e.position.x, e.position.y, e.elevation ?? 0)
  writeNormal(ctx, e)
  out.str(100, "AcDbTable")
  if (ctx.version >= 1024) out.int(280, 0)
  out.str(342, ctx.tableStyle(e, own))
  out.str(343, block.record)
  const a = axes(e)
  const along = { ...e.direction, z: 0 }
  const d = a ? axesToWorld(a, along) : along
  out.point(11, d.x, d.y, d.z)
  out.int(90, 22)
  out.int(91, e.rowHeights.length)
  out.int(92, e.columnWidths.length)
  const o = e.overrides
  out.int(
    93,
    (o?.horizontalMargin !== undefined ? 0x8 : 0) |
      (o?.verticalMargin !== undefined ? 0x10 : 0) |
      (o?.textHeights ? 0x700000 : 0)
  )
  out.int(94, 0)
  out.int(95, 0)
  out.int(96, 0)
  if (o?.horizontalMargin !== undefined) out.real(40, o.horizontalMargin)
  if (o?.verticalMargin !== undefined) out.real(41, o.verticalMargin)
  if (o?.textHeights) {
    out.real(140, o.textHeights.data)
    out.real(140, o.textHeights.title)
    out.real(140, o.textHeights.header)
  }
  for (const h of e.rowHeights) out.real(141, h)
  for (const w of e.columnWidths) out.real(142, w)
  for (const cell of e.cells) {
    const cellBlock = cell.block
    const text = cellBlock ? "" : (cell.text ?? "")
    out.int(171, cellBlock ? 2 : 1)
    out.int(172, 0)
    out.int(173, cell.merged ? 1 : 0)
    out.int(174, cellBlock?.autoFit ? 1 : 0)
    out.int(175, cell.merged ? 1 : (cell.span?.columns ?? 1))
    out.int(176, cell.merged ? 1 : (cell.span?.rows ?? 1))
    // A 2000 or 2004 file writes no data type (t09).
    const kept = legacy ? 0 : (cell.flags ?? 0)
    out.int(
      legacy ? 177 : 91,
      kept |
        (cell.alignment ? 0x1 : 0) |
        (cell.textStyleId ? 0x10 : 0) |
        (cell.textHeight !== undefined ? 0x20 : 0)
    )
    out.int(178, 0)
    out.real(145, cell.rotation ?? 0)
    if (cellBlock) {
      out.str(340, ctx.blockRecord(cellBlock.blockId))
      out.real(144, cellBlock.scale)
      out.int(179, 0)
    }
    if (cell.alignment) {
      out.int(170, MTEXT_ATTACHMENTS.indexOf(cell.alignment) + 1)
    }
    if (cell.textStyleId) out.str(7, ctx.textStyleName(cell.textStyleId))
    if (cell.textHeight !== undefined) out.real(140, cell.textHeight)
    if (legacy) {
      if (cellBlock) continue
      const chars = [...text]
      let at = 0
      while (chars.length - at > 250) {
        out.str(2, chars.slice(at, at + 250).join(""))
        at += 250
      }
      out.str(1, chars.slice(at).join(""))
      continue
    }
    out.int(92, 0)
    out.str(301, "CELL_VALUE")
    out.int(93, cellBlock ? 1 : text ? 6 : 7)
    out.int(90, cellBlock || text ? 4 : 0)
    if (text) out.str(1, text)
    out.int(94, 0)
    out.str(300, "")
    out.str(302, text)
    out.str(304, "ACVALUE_END")
  }
}

/**
 * An image as AutoCAD's DXFOUT writes one it cannot find (image/i08): its
 * corner and pixel's sides in the WCS (10, 11, 12), its size in pixels,
 * X and Y alone (13), its definition (340) and reactor (360), its display,
 * 290 from 2010, and its clip boundary in pixels (14, 24): its whole
 * frame's two corners when it kept none, a polygon closed back on its first
 * vertex (AutoCAD's console fails to open one left open).
 */
function image(ctx: DxfWriteContext, e: ImageEntity, owner: string): void {
  const { out } = ctx
  const a = axes(e)
  const z = e.elevation ?? 0
  const world = (p: Vec3): Vec3 => (a ? axesToWorld(a, p) : p)
  const origin = world({ ...e.position, z })
  const side = (w: Vec2): Vec3 => {
    const tip = world({ x: e.position.x + w.x, y: e.position.y + w.y, z })
    return { x: tip.x - origin.x, y: tip.y - origin.y, z: tip.z - origin.z }
  }
  const u = side(e.u)
  const v = side(e.v)
  const own = ctx.entityHandle(e)
  head(ctx, "IMAGE", e, owner, own)
  out.str(100, "AcDbRasterImage")
  out.int(90, 0)
  out.point(10, origin.x, origin.y, origin.z)
  out.point(11, u.x, u.y, u.z)
  out.point(12, v.x, v.y, v.z)
  out.point(13, e.width, e.height)
  out.str(340, ctx.imageDefinition(e))
  out.int(70, e.display ?? 7)
  out.int(280, e.clip && !e.clip.off ? 1 : 0)
  out.int(281, e.brightness ?? 50)
  out.int(282, e.contrast ?? 50)
  out.int(283, e.fade ?? 0)
  if (ctx.version >= 1024) out.int(290, 0)
  out.str(360, ctx.imageReactor(e, own))
  const clip = e.clip
  const points = clip
    ? clip.polygonal
      ? [...clip.points, clip.points[0]]
      : clip.points
    : [
        { x: -0.5, y: -0.5 },
        { x: e.width - 0.5, y: e.height - 0.5 },
      ]
  out.int(71, clip?.polygonal ? 2 : 1)
  out.int(91, points.length)
  for (const p of points) {
    out.real(14, p.x)
    out.real(24, p.y)
  }
}

/** A point is the WCS's in a DXF, as AutoCAD writes it (point/p04). */
function pointObject(
  ctx: DxfWriteContext,
  e: PointEntity,
  owner: string
): void {
  const { out } = ctx
  const a = axes(e)
  const ocs = { ...e.position, z: e.elevation ?? 0 }
  const at = a ? axesToWorld(a, ocs) : ocs
  head(ctx, "POINT", e, owner)
  out.str(100, "AcDbPoint")
  out.point(10, at.x, at.y, at.z, a !== null)
  thickness(ctx, e)
  writeNormal(ctx, e)
  if (e.xAxisAngle) out.real(50, e.xAxisAngle * DEG)
}

function arc(ctx: DxfWriteContext, e: ArcEntity, owner: string): void {
  const { out } = ctx
  head(ctx, "ARC", e, owner)
  out.str(100, "AcDbCircle")
  thickness(ctx, e)
  out.point(10, e.center.x, e.center.y, e.elevation ?? 0)
  out.exact(40, e.radius)
  writeNormal(ctx, e)
  out.str(100, "AcDbArc")
  out.real(50, e.startAngle * DEG)
  out.real(51, e.endAngle * DEG)
}

/** An ellipse's centre and axis are the WCS's in a DXF (the reader's x006). */
function ellipse(ctx: DxfWriteContext, e: EllipseEntity, owner: string): void {
  const { out } = ctx
  const a = axes(e)
  const z = e.elevation ?? 0
  const center = a ? axesToWorld(a, { ...e.center, z }) : { ...e.center, z }
  const axis = a
    ? axesToWorld(a, { ...e.majorAxis, z: 0 })
    : { ...e.majorAxis, z: 0 }
  const n = e.normal ?? { x: 0, y: 0, z: 1 }
  head(ctx, "ELLIPSE", e, owner)
  out.str(100, "AcDbEllipse")
  out.point(10, center.x, center.y, center.z, true)
  out.point(11, axis.x, axis.y, axis.z, true)
  out.point(210, n.x, n.y, n.z, true)
  out.exact(40, e.ratio)
  out.exact(41, e.startParam ?? 0)
  out.exact(42, e.endParam ?? 2 * Math.PI)
}

function polylineFlags(e: PolylineEntity): number {
  return (e.closed ? 1 : 0) | (e.linetypeGeneration ? 128 : 0)
}

function lightPolyline(
  ctx: DxfWriteContext,
  e: PolylineEntity,
  owner: string
): void {
  const { out } = ctx
  head(ctx, "LWPOLYLINE", e, owner)
  out.str(100, "AcDbPolyline")
  out.int(90, e.vertices.length)
  out.int(70, polylineFlags(e))
  const widths = e.widths
  const constant = constantWidth(widths)
  if (constant !== null) out.real(43, constant)
  if (e.elevation) out.real(38, e.elevation)
  thickness(ctx, e)
  e.vertices.forEach((v, i) => {
    out.point(10, v.x, v.y)
    if (widths && constant === null) {
      const [start, end] = widths[i] ?? [0, 0]
      out.real(40, start)
      out.real(41, end)
    }
    const bulge = e.bulges?.[i] ?? 0
    if (bulge !== 0) out.real(42, bulge)
  })
  writeNormal(ctx, e)
}

/** The one width every segment has, or `null` when they differ; 0 for none. */
function constantWidth(widths: PolylineEntity["widths"]): number | null {
  if (!widths || widths.length === 0) return 0
  const w = widths[0][0]
  return widths.every(([s, e]) => s === w && e === w) ? w : null
}

/**
 * A fitted polyline, as AutoCAD writes PEDIT's Fit and Spline (f001): a
 * POLYLINE whose Fit vertices are each frame vertex and the joint after it
 * (flag 1), each with its arc's bulge, and whose Spline vertices are the
 * frame (16) and the curve's (8).
 */
function polyline2d(
  ctx: DxfWriteContext,
  e: PolylineEntity,
  owner: string
): void {
  const { out } = ctx
  const fit = e.fit!
  const own = ctx.entityHandle(e)
  const z = e.elevation ?? 0
  head(ctx, "POLYLINE", e, owner, own)
  out.str(100, "AcDb2dPolyline")
  out.int(66, 1)
  out.point(10, 0, 0, z)
  thickness(ctx, e)
  const splined = fit.kind !== "curve"
  out.int(70, polylineFlags(e) | (splined ? 4 : 2))
  if (splined) out.int(75, fit.kind === "quadratic" ? 5 : 6)
  writeNormal(ctx, e)
  const tangent = (i: number) => fit.tangents?.[i] ?? null
  const vertex = (
    p: Vec2,
    flags: number,
    bulge = 0,
    width?: readonly [number, number],
    angle: number | null = null
  ) => {
    head(ctx, "VERTEX", e, own)
    out.str(100, "AcDbVertex")
    out.str(100, "AcDb2dVertex")
    out.point(10, p.x, p.y, z)
    if (width && (width[0] !== 0 || width[1] !== 0)) {
      out.real(40, width[0])
      out.real(41, width[1])
    }
    if (bulge !== 0) out.real(42, bulge)
    const tangentFlag = angle !== null ? 2 : 0
    if (flags | tangentFlag) out.int(70, flags | tangentFlag)
    if (angle !== null) out.real(50, angle * DEG)
  }
  if (fit.kind === "curve") {
    e.vertices.forEach((p, i) => {
      const arcs = fit.arcs[i] ?? null
      vertex(p, 0, arcs?.bulges[0] ?? 0, e.widths?.[i], tangent(i))
      if (arcs) vertex(arcs.joint, 1, arcs.bulges[1])
    })
  } else {
    e.vertices.forEach((p, i) => vertex(p, 16, 0, e.widths?.[i], tangent(i)))
    for (const p of polylineCurve(e).vertices) vertex(p, 8)
  }
  seqend(ctx, e, own)
}

function polyline3d(
  ctx: DxfWriteContext,
  e: Polyline3dEntity,
  owner: string
): void {
  const { out } = ctx
  const own = ctx.entityHandle(e)
  head(ctx, "POLYLINE", e, owner, own)
  out.str(100, "AcDb3dPolyline")
  out.int(66, 1)
  out.point(10, 0, 0, 0)
  const splined = e.fit !== undefined
  out.int(70, 8 | (e.closed ? 1 : 0) | (splined ? 4 : 0))
  if (e.fit) out.int(75, e.fit.kind === "quadratic" ? 5 : 6)
  const vertex = (p: Vec3, flags: number) => {
    head(ctx, "VERTEX", e, own)
    out.str(100, "AcDbVertex")
    out.str(100, "AcDb3dPolylineVertex")
    out.point(10, p.x, p.y, p.z)
    out.int(70, 32 | flags)
  }
  if (splined) {
    for (const p of e.vertices) vertex(p, 16)
    for (const p of polyline3dCurve(e).vertices) vertex(p, 8)
  } else for (const p of e.vertices) vertex(p, 0)
  seqend(ctx, e, own)
}

function seqend(ctx: DxfWriteContext, e: Entity, owner: string): void {
  const { out } = ctx
  out.str(0, "SEQEND")
  out.str(5, ctx.handle())
  out.str(330, owner)
  out.str(100, "AcDbEntity")
  out.str(8, ctx.layerName(e.layerId))
}

/** SPLINE's 70 for a fit spline's knot spacing (the reader's 32, 64, 128). */
const PARAMETERIZATION_FLAG = { chord: 32, sqrtChord: 64, uniform: 128 }

/**
 * A SPLINE in the WCS: an open fit spline with its fit points and end
 * tangents beside the curve, anything else its control points, knots and
 * weights. A periodic one is written clamped, closed, as AutoCAD writes it
 * (f004's 70 = 2059 and 3115: the fit points of a closed fit spline left out).
 */
function spline(ctx: DxfWriteContext, e: SplineEntity, owner: string): void {
  const { out } = ctx
  const a = axes(e)
  const world = (p: Vec3): Vec3 => (a ? axesToWorld(a, p) : p)
  const periodic = isPeriodicSpline(e)
  let curve: BSplineCurve = splineCurve(e)
  if (periodic) {
    const { start, end } = bsplineDomain(curve)
    curve = bsplineSegment(curve, start, end)
  }
  const fitted = e.method === "fit" && !periodic
  const rational = curve.weights !== undefined
  const planar =
    e.normal !== undefined || e.points.every((p) => p.z === e.points[0].z)
  const flags =
    (e.closed ? 1 : 0) |
    (periodic ? 2 : 0) |
    (rational ? 4 : 0) |
    (planar ? 8 : 0) |
    (fitted ? 1024 : 0) |
    (fitted && !e.knotVector ? PARAMETERIZATION_FLAG[e.knots] : 0) |
    (periodic ? 2048 : 0)
  const n = e.normal ?? { x: 0, y: 0, z: 1 }
  head(ctx, "SPLINE", e, owner)
  out.str(100, "AcDbSpline")
  if (planar) out.point(210, n.x, n.y, n.z, true)
  out.int(70, flags)
  out.int(71, curve.degree)
  out.int(72, curve.knots.length)
  out.int(73, curve.controlPoints.length)
  out.int(74, fitted ? e.points.length : 0)
  out.exact(42, 1e-9)
  out.exact(43, 1e-10)
  if (fitted) {
    out.exact(44, 1e-10)
    for (const [code, t] of [
      [12, e.startTangent],
      [13, e.endTangent],
    ] as const) {
      if (!t) continue
      const w = a ? axesToWorld(a, t) : t
      out.point(code, w.x, w.y, w.z, true)
    }
  }
  for (const k of curve.knots) out.exact(40, k)
  curve.controlPoints.forEach((p, i) => {
    const w = world(p)
    out.point(10, w.x, w.y, w.z, true)
    if (rational) out.exact(41, curve.weights![i])
  })
  if (fitted) {
    for (const p of e.points) {
      const w = world(p)
      out.point(11, w.x, w.y, w.z, true)
    }
  }
}

/** TEXT's 72 and 73 (an attribute's 74): the reader's `justification` turned round. */
function justifyCodes(justify: TextJustify): [number, number] {
  switch (justify) {
    case "left":
      return [0, 0]
    case "center":
      return [1, 0]
    case "right":
      return [2, 0]
    case "middle":
      return [4, 0]
  }
  const row = justify[0] === "t" ? 3 : justify[0] === "m" ? 2 : 1
  const column = justify[1] === "c" ? 1 : justify[1] === "r" ? 2 : 0
  return [column, row]
}

interface TextLike {
  readonly position: Vec2
  readonly elevation?: number
  readonly height: number
  readonly rotation: number
  readonly justify: TextJustify
  readonly styleId: string
}

/**
 * The AcDbText groups of a TEXT, ATTDEF or ATTRIB. WHY one point for both
 * 10 and 11 when justified: AutoCAD works the first alignment point out from
 * the second as it reads the file (the model keeps only the second).
 */
function textGroups(
  ctx: DxfWriteContext,
  t: TextLike,
  value: string,
  normal: Entity["normal"]
): number {
  const { out } = ctx
  const [horizontal, vertical] = justifyCodes(t.justify)
  const z = t.elevation ?? 0
  out.str(100, "AcDbText")
  out.point(10, t.position.x, t.position.y, z)
  out.real(40, t.height)
  out.str(1, value)
  if (t.rotation) out.real(50, t.rotation * DEG)
  if (t.styleId !== "Standard") out.str(7, ctx.textStyleName(t.styleId))
  if (horizontal) out.int(72, horizontal)
  if (horizontal || vertical) out.point(11, t.position.x, t.position.y, z)
  if (normal && !(normal.x === 0 && normal.y === 0 && normal.z === 1))
    out.point(210, normal.x, normal.y, normal.z, true)
  return vertical
}

function text(ctx: DxfWriteContext, e: TextEntity, owner: string): void {
  head(ctx, "TEXT", e, owner)
  const vertical = textGroups(ctx, e, e.value, e.normal)
  ctx.out.str(100, "AcDbText")
  if (vertical) ctx.out.int(73, vertical)
}

/** MTEXT's contents in AutoCAD's 250-character pieces: the 3 groups, then the 1. */
function mtextChunks(ctx: DxfWriteContext, contents: string): void {
  const chars = [...contents]
  let at = 0
  while (chars.length - at > 250) {
    ctx.out.str(3, chars.slice(at, at + 250).join(""))
    at += 250
  }
  ctx.out.str(1, chars.slice(at).join(""))
}

/**
 * A LEADER as AutoCAD 2027's DXFOUT writes one (leader/p22): its vertices in
 * the WCS, each group at its default left out (71 1, 72 0, 73 3, 74 1, 75 0,
 * 40 and 41 0, 211 the X axis, 212 and 213 none), 74 0 for an annotation
 * after the end; its overrides of the style as its DSTYLE xdata, in their
 * codes' order (DIMSCALE 40, DIMASZ 41, DIMTAD 77, DIMGAP 147).
 */
function leader(ctx: DxfWriteContext, e: LeaderEntity, owner: string): void {
  const { out } = ctx
  const a = axes(e)
  const z = e.elevation ?? 0
  const world = (p: Vec2): Vec3 =>
    a ? axesToWorld(a, { ...p, z }) : { ...p, z }
  const vector = (v: Vec2): Vec3 =>
    a ? axesToWorld(a, { ...v, z: 0 }) : { ...v, z: 0 }
  const annotation = ctx.annotation(e)
  const kind = annotation ? e.annotation?.kind : undefined
  head(ctx, "LEADER", e, owner)
  out.str(100, "AcDbLeader")
  out.str(3, ctx.dimStyleName(e.styleId))
  if (!e.arrow) out.int(71, 0)
  if (e.spline) out.int(72, 1)
  if (kind) out.int(73, kind === "mtext" ? 0 : 2)
  if (kind && leaderSide(e) > 0) out.int(74, 0)
  if (e.hook) out.int(75, 1)
  if (kind === "mtext" && e.textHeight) out.real(40, e.textHeight)
  if (kind === "mtext" && e.textWidth) out.real(41, e.textWidth)
  out.int(76, e.vertices.length)
  for (const v of e.vertices) {
    const p = world(v)
    out.point(10, p.x, p.y, p.z)
  }
  if (annotation) out.str(340, annotation)
  writeNormal(ctx, e)
  // 211 is a WCS direction, left out when it is world X (leader/p25: a leader
  // facing -Z along its OCS's X writes one).
  const angle = e.horizontal ?? 0
  const h = vector({ x: Math.cos(angle), y: Math.sin(angle) })
  if (
    Math.abs(h.x - 1) > 1e-12 ||
    Math.abs(h.y) > 1e-12 ||
    Math.abs(h.z) > 1e-12
  ) {
    out.point(211, h.x, h.y, h.z, true)
  }
  if (kind === "block" && e.blockOffset) {
    const v = vector(e.blockOffset)
    out.point(212, v.x, v.y, v.z)
  }
  if (kind === "mtext" && e.textOffset) {
    const v = vector(e.textOffset)
    out.point(213, v.x, v.y, v.z)
  }
  const o = e.overrides ?? {}
  const overrides: [number, number, boolean][] = []
  if (o.scale !== undefined) overrides.push([40, o.scale, false])
  if (o.arrowSize !== undefined) overrides.push([41, o.arrowSize, false])
  if (o.textAbove !== undefined) overrides.push([77, o.textAbove ? 1 : 0, true])
  if (o.textGap !== undefined) overrides.push([147, o.textGap, false])
  if (overrides.length === 0) return
  out.str(1001, "ACAD")
  out.str(1000, "DSTYLE")
  out.str(1002, "{")
  for (const [code, value, integer] of overrides) {
    out.int(1070, code)
    if (integer) out.int(1070, value)
    else out.real(1040, value)
  }
  out.str(1002, "}")
}

/** MTEXT's point and direction are the WCS's (the reader's f004). */
function mtext(ctx: DxfWriteContext, e: MTextEntity, owner: string): void {
  const { out } = ctx
  const a = axes(e)
  const z = e.elevation ?? 0
  const at = a ? axesToWorld(a, { ...e.position, z }) : { ...e.position, z }
  const along = { x: Math.cos(e.rotation), y: Math.sin(e.rotation), z: 0 }
  const direction = a ? axesToWorld(a, along) : along
  head(ctx, "MTEXT", e, owner)
  out.str(100, "AcDbMText")
  out.point(10, at.x, at.y, at.z)
  out.real(40, e.height)
  out.real(41, e.width)
  out.int(71, MTEXT_ATTACHMENTS.indexOf(e.attachment) + 1)
  out.int(72, 1)
  mtextChunks(ctx, e.contents)
  if (e.styleId !== "Standard") out.str(7, ctx.textStyleName(e.styleId))
  writeNormal(ctx, e)
  // A unit vector, kept whole as a normal is (x021): at 0 places it would turn.
  if (e.rotation) out.point(11, direction.x, direction.y, direction.z, true)
  out.int(73, e.lineSpacingStyle === "exactly" ? 2 : 1)
  out.real(44, e.lineSpacingFactor)
}

/** The 280 AutoCAD writes before an attribute's tag from 2010 (the reader's attributeModes). */
function attributeVersion(ctx: DxfWriteContext): void {
  if (ctx.version >= 1024) ctx.out.int(280, 0)
}

function attributeDefinition(
  ctx: DxfWriteContext,
  e: AttributeDefinitionEntity,
  owner: string
): void {
  const { out } = ctx
  head(ctx, "ATTDEF", e, owner)
  const vertical = textGroups(ctx, e, e.value, e.normal)
  out.str(100, "AcDbAttributeDefinition")
  attributeVersion(ctx)
  out.str(3, e.prompt)
  out.str(2, e.tag)
  const m = e.modes
  out.int(
    70,
    (m.invisible ? 1 : 0) |
      (m.constant ? 2 : 0) |
      (m.verify ? 4 : 0) |
      (m.preset ? 8 : 0)
  )
  if (vertical) out.int(74, vertical)
  if (ctx.version >= 1021) out.int(280, m.lockPosition ? 1 : 0)
}

/** `v` turned `angle` radians counterclockwise. */
function rotate(v: Vec2, angle: number): Vec2 {
  const c = Math.cos(angle)
  const s = Math.sin(angle)
  return { x: v.x * c - v.y * s, y: v.x * s + v.y * c }
}

/**
 * A block reference with its attributes, each placed in the drawing as the
 * reference shows it: the reader's `blockAttribute` turned round. An array
 * is a reference to the anonymous block of its items, as AutoCAD's own
 * array is (the source block's references inside it).
 */
function insert(ctx: DxfWriteContext, e: InsertEntity, owner: string): void {
  const { out } = ctx
  const own = ctx.entityHandle(e)
  const arrayBlock = e.array ? ctx.arrayBlock(e) : null
  const block = ctx.block(e.blockId)
  const attributes = arrayBlock ? [] : (e.attributes ?? [])
  head(ctx, "INSERT", e, owner, own)
  out.str(100, "AcDbBlockReference")
  if (attributes.length > 0) out.int(66, 1)
  out.str(2, arrayBlock ?? ctx.blockName(e.blockId))
  const z = e.elevation ?? 0
  out.point(10, e.position.x, e.position.y, z)
  if (e.scaleX !== 1) out.real(41, e.scaleX)
  if (e.scaleY !== 1) out.real(42, e.scaleY)
  if (e.scaleX !== 1 || e.scaleY !== 1) out.real(43, Math.abs(e.scaleX))
  if (e.rotation) out.real(50, e.rotation * DEG)
  writeNormal(ctx, e)
  if (attributes.length === 0) return
  const base = block?.basePoint ?? { x: 0, y: 0 }
  for (const attribute of attributes) {
    const local = V.sub(attribute.position, base)
    const position = V.add(
      e.position,
      rotate({ x: local.x * e.scaleX, y: local.y * e.scaleY }, e.rotation)
    )
    head(ctx, "ATTRIB", attribute, own)
    const vertical = textGroups(
      ctx,
      {
        position,
        elevation:
          z +
          ((attribute.elevation ?? 0) - (block?.baseElevation ?? 0)) *
            Math.abs(e.scaleX),
        height: attribute.height * Math.abs(e.scaleY),
        rotation: attribute.rotation + e.rotation,
        justify: attribute.justify,
        styleId: attribute.styleId,
      },
      attribute.value,
      e.normal
    )
    out.str(100, "AcDbAttribute")
    attributeVersion(ctx)
    out.str(2, attribute.tag)
    out.int(70, attribute.invisible ? 1 : 0)
    if (vertical) out.int(74, vertical)
    if (ctx.version >= 1021) out.int(280, 0)
  }
  seqend(ctx, e, own)
}

/**
 * A DIMENSION as AutoCAD writes each type (f001): its geometry in the
 * anonymous block it names, which AutoCAD draws as it is (no regeneration
 * on opening), and its definition points as the reader's `dimension` reads
 * them back.
 */
function dimension(
  ctx: DxfWriteContext,
  e: DimensionEntity,
  owner: string
): void {
  const { out } = ctx
  const geometry = dimensionPoints(
    e,
    dimensionGeometry(e, ctx.dimStyle(e.styleId))
  )
  head(ctx, "DIMENSION", e, owner)
  out.str(100, "AcDbDimension")
  if (ctx.version >= 1024) out.int(280, 0)
  out.str(2, ctx.dimensionBlock(e))
  const z = e.elevation ?? 0
  // 10, 13, 14 and 15 are the WCS's, 11 the dimension's OCS (the reader's
  // `dimension`): a dimension in a plane of its own has them turned.
  const a = axes(e)
  const wcs = (code: number, p: Vec2) => {
    const w = a ? axesToWorld(a, { ...p, z }) : { ...p, z }
    out.point(code, w.x, w.y, w.z)
  }
  wcs(10, geometry.definition)
  out.point(11, geometry.text.x, geometry.text.y, z)
  out.int(70, geometry.type | 32 | (e.textPoint ? 128 : 0))
  out.int(71, 5)
  out.real(42, dimensionMeasurement(e))
  if (e.text !== undefined) out.str(1, e.text)
  if (e.textAngle !== undefined) out.real(53, e.textAngle * DEG)
  out.str(3, ctx.dimStyleName(e.styleId))
  writeNormal(ctx, e)
  switch (e.kind) {
    case "linear":
    case "aligned":
      out.str(100, "AcDbAlignedDimension")
      wcs(13, e.first)
      wcs(14, e.second)
      if (e.kind === "linear") {
        if (e.rotation) out.real(50, e.rotation * DEG)
        out.str(100, "AcDbRotatedDimension")
      }
      return
    case "angular":
      out.str(100, "AcDb3PointAngularDimension")
      wcs(13, e.first)
      wcs(14, e.second)
      wcs(15, e.vertex!)
      return
    case "radius":
    case "diameter":
      out.str(
        100,
        e.kind === "radius" ? "AcDbRadialDimension" : "AcDbDiametricDimension"
      )
      wcs(15, e.second)
      out.real(40, 0)
  }
}

/**
 * The DIMENSION's type and its 10 and 11: a linear or aligned one's line
 * point where its line meets the second extension line, an angular one's
 * arc point, a radius's centre, a diameter's far end; 11 where its text's
 * grip is (`DimensionGeometry.textPoint`), a radial one's `linePoint`.
 */
export function dimensionPoints(
  e: DimensionEntity,
  geometry: DimensionGeometry
): { type: number; definition: Vec2; text: Vec2 } {
  const text = geometry.textPoint
  switch (e.kind) {
    case "linear":
      return { type: 0, definition: geometry.lineEnd, text }
    case "aligned":
      return { type: 1, definition: geometry.lineEnd, text }
    case "angular":
      return { type: 5, definition: e.linePoint, text }
    case "radius":
      return { type: 4, definition: e.first, text: e.linePoint }
    case "diameter":
      return {
        type: 3,
        definition: V.sub(V.scale(e.first, 2), e.second),
        text: e.linePoint,
      }
  }
}

/**
 * A HATCH: each loop a polyline boundary, the pattern by name and type with
 * the lines it draws as AutoCAD writes them (turned and scaled, f001's
 * ANSI31; a User-defined one's 41 its spacing and 77 its Double, hatchpat/p00),
 * and the origin in its ACAD xdata, where the reader takes HPORIGIN from.
 */
function hatch(ctx: DxfWriteContext, e: HatchEntity, owner: string): void {
  const { out } = ctx
  const solid = isSolidHatchPattern(e.patternId)
  const n = e.normal ?? { x: 0, y: 0, z: 1 }
  head(ctx, "HATCH", e, owner)
  out.str(100, "AcDbHatch")
  out.point(10, 0, 0, e.elevation ?? 0)
  out.point(210, n.x, n.y, n.z, true)
  out.str(2, e.patternId)
  out.int(70, solid ? 1 : 0)
  out.int(71, 0)
  out.int(91, e.loops.length)
  for (const loop of e.loops) {
    const bulged = (loop.bulges ?? []).some((b) => b !== 0)
    out.int(92, 2)
    out.int(72, bulged ? 1 : 0)
    out.int(73, 1)
    out.int(93, loop.vertices.length)
    loop.vertices.forEach((v, i) => {
      out.point(10, v.x, v.y, undefined, true)
      if (bulged) out.exact(42, loop.bulges?.[i] ?? 0)
    })
    out.int(97, 0)
  }
  out.int(75, 0)
  out.int(76, e.patternType === "user" ? 0 : e.patternType === "custom" ? 2 : 1)
  const lines = solid ? [] : hatchLines(e)
  if (!solid) {
    out.real(52, e.patternAngle * DEG)
    out.real(41, e.patternScale)
    out.int(77, e.patternType === "user" && lines.length > 1 ? 1 : 0)
    out.int(78, lines.length)
    for (const l of lines) {
      const angle = e.patternAngle + l.angle
      const base = V.add(
        e.origin,
        rotate(V.scale(l.origin, e.patternScale), e.patternAngle)
      )
      const offset = rotate(
        { x: l.deltaX * e.patternScale, y: l.deltaY * e.patternScale },
        angle
      )
      out.real(53, angle * DEG)
      out.exact(43, base.x)
      out.exact(44, base.y)
      out.exact(45, offset.x)
      out.exact(46, offset.y)
      out.int(79, l.dashes.length)
      for (const d of l.dashes) out.exact(49, d * e.patternScale)
    }
  }
  out.int(98, 0)
  if (e.gradient) gradient(ctx, e.gradient)
  out.str(1001, "ACAD")
  out.point(1010, e.origin.x, e.origin.y, 0, true)
}

/**
 * A hatch's gradient as AutoCAD writes it (gradient/g02, the samples): from
 * 2004 its 450 to 470, each colour's nearest index (63) beside its true
 * colour (421); in 2000, which has no gradients, a SOLID hatch whose two
 * colours are xdata by index (DXFOUT 2000 of g03's drawing, g15).
 */
function gradient(ctx: DxfWriteContext, g: HatchGradient): void {
  const { out } = ctx
  const rgb = g.colors.map((c) => parseInt(c.slice(1), 16))
  if (ctx.version < 1018) {
    GRADIENT_COLOR_APPS.forEach((app, i) => {
      out.str(1001, app)
      out.int(1070, aciIndex(rgb[i]).index)
    })
    return
  }
  out.int(450, 1)
  out.int(451, 0)
  out.exact(460, g.angle)
  out.exact(461, g.centered ? 0 : 1)
  out.int(452, g.tint === undefined ? 0 : 1)
  out.exact(462, g.tint ?? 1)
  out.int(453, 2)
  rgb.forEach((value, i) => {
    out.exact(463, i)
    out.int(63, aciIndex(value).index)
    out.int(421, value)
  })
  out.str(470, g.name)
}

/** The applications of a 2000 DXF's gradient colours, registered in its APPID table. */
export const GRADIENT_COLOR_APPS = [
  "GradientColor1ACI",
  "GradientColor2ACI",
] as const

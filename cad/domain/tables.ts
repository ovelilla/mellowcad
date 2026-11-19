import { Vec2, V } from "../geometry/Vec2"
import { createInsert, createLine, createPolyline } from "./entityFactories"
import { entityPointToWorld } from "./elevation"
import {
  assignEntityColor,
  assignEntityLinetype,
  assignEntityLineweight,
  carryOverrides,
} from "./entityOverrides"
import type {
  BlockId,
  Bounds,
  Entity,
  MTextAttachment,
  TableCell,
  TableEntity,
  TableRowStyle,
  TableStyleData,
} from "./entityTypes"
import { DEFAULT_TEXT_STYLE_ID } from "./textStyles"
import { createMText } from "./mtext"

/**
 * AutoCAD 2027's Standard table style in a metric drawing (table/t00's
 * TABLESTYLE): margins of 1.5, data in 4.5 at the top centre, the title in 6
 * and the header in 4.5 at the middle centre, all in Standard text.
 */
export const STANDARD_TABLE_STYLE: TableStyleData = {
  name: "Standard",
  horizontalMargin: 1.5,
  verticalMargin: 1.5,
  data: {
    textStyleId: DEFAULT_TEXT_STYLE_ID,
    textHeight: 4.5,
    alignment: "tc",
  },
  title: { textStyleId: DEFAULT_TEXT_STYLE_ID, textHeight: 6, alignment: "mc" },
  header: {
    textStyleId: DEFAULT_TEXT_STYLE_ID,
    textHeight: 4.5,
    alignment: "mc",
  },
}

/** The three kinds of row a table style dresses: DXF TABLESTYLE's runs. */
export type TableRowKind = "data" | "title" | "header"

/**
 * The colour of the line AutoCAD ends a table's block with: no length, at
 * its insertion point, index colour 8 and lineweight 0, which EXPLODE
 * leaves as it is (table/t03, t06, t06b).
 */
const MARKER_COLOR = "#808080"

export function tableRowCount(table: TableEntity): number {
  return table.rowHeights.length
}

export function tableColumnCount(table: TableEntity): number {
  return table.columnWidths.length
}

export function tableCell(
  table: TableEntity,
  row: number,
  column: number
): TableCell | undefined {
  return table.cells[row * table.columnWidths.length + column]
}

/** Up the table's rows' text: its direction turned a quarter left. */
export function tableUp(table: TableEntity): Vec2 {
  return { x: -table.direction.y, y: table.direction.x }
}

export function tableWidth(table: TableEntity): number {
  return table.columnWidths.reduce((sum, w) => sum + w, 0)
}

export function tableHeight(table: TableEntity): number {
  return table.rowHeights.reduce((sum, h) => sum + h, 0)
}

/** A point of the table's own frame: `x` along its rows, `y` up its text. */
function at(table: TableEntity, x: number, y: number): Vec2 {
  return V.add(
    V.add(table.position, V.scale(table.direction, x)),
    V.scale(tableUp(table), y)
  )
}

/**
 * Its corners, from its insertion point round: down a table that flows
 * down, up one that flows up (DXF TABLESTYLE 70 1, unverified).
 */
export function tableCorners(
  table: TableEntity
): readonly [Vec2, Vec2, Vec2, Vec2] {
  const w = tableWidth(table)
  const h = (table.style.flowsUp ? 1 : -1) * tableHeight(table)
  return [at(table, 0, 0), at(table, w, 0), at(table, w, h), at(table, 0, h)]
}

/** Which kind of row `row` is: the first the title, the next the header, unless suppressed. */
export function tableRowKind(table: TableEntity, row: number): TableRowKind {
  let next = 0
  if (!table.style.titleSuppressed) {
    if (row === next) return "title"
    next++
  }
  if (!table.style.headerSuppressed && row === next) return "header"
  return "data"
}

/** A kind of row's style with the table's own text height over it. */
export function tableRowStyle(
  table: TableEntity,
  kind: TableRowKind
): TableRowStyle {
  const style = table.style[kind]
  const height = table.overrides?.textHeights?.[kind]
  return height === undefined ? style : { ...style, textHeight: height }
}

export function tableMargins(table: TableEntity): {
  readonly horizontal: number
  readonly vertical: number
} {
  return {
    horizontal:
      table.overrides?.horizontalMargin ?? table.style.horizontalMargin,
    vertical: table.overrides?.verticalMargin ?? table.style.verticalMargin,
  }
}

/**
 * Which cell covers each place of the grid: the index of the cell at the
 * top left of its span, its own where it spans nothing.
 */
function cellOwners(table: TableEntity): number[] {
  const rows = tableRowCount(table)
  const columns = tableColumnCount(table)
  const owners = Array.from({ length: rows * columns }, (_, i) => i)
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      const span = tableCell(table, r, c)?.span
      if (!span || owners[r * columns + c] !== r * columns + c) continue
      for (let dr = 0; dr < span.rows && r + dr < rows; dr++) {
        for (let dc = 0; dc < span.columns && c + dc < columns; dc++) {
          owners[(r + dr) * columns + c + dc] = r * columns + c
        }
      }
    }
  }
  return owners
}

/** Each column's left edge and the right edge of the last, from 0. */
function columnEdges(table: TableEntity): number[] {
  const edges = [0]
  for (const w of table.columnWidths) edges.push(edges[edges.length - 1] + w)
  return edges
}

/** Each row's edge nearest the insertion point and the far edge of the last, up from 0. */
function rowEdges(table: TableEntity): number[] {
  const sign = table.style.flowsUp ? 1 : -1
  const edges = [0]
  for (const h of table.rowHeights) {
    edges.push(edges[edges.length - 1] + sign * h)
  }
  return edges
}

const HORIZONTAL: Record<MTextAttachment, -1 | 0 | 1> = {
  tl: -1,
  ml: -1,
  bl: -1,
  tc: 0,
  mc: 0,
  bc: 0,
  tr: 1,
  mr: 1,
  br: 1,
}

const VERTICAL: Record<MTextAttachment, -1 | 0 | 1> = {
  tl: 1,
  tc: 1,
  tr: 1,
  ml: 0,
  mc: 0,
  mr: 0,
  bl: -1,
  bc: -1,
  br: -1,
}

/**
 * Everything a table draws, in the order AutoCAD's block of it holds it and
 * EXPLODE leaves it (table/t03, t06): each text cell's MTEXT row by row,
 * each block cell's reference, the grid's lines across, top to bottom, then
 * down, left to right, each as long as no span breaks it, and a line of no
 * length at its insertion point. Each wears the table's layer, colour,
 * linetype and lineweight, as AutoCAD's ByBlock pieces do (t06b).
 *
 * A text sits at its cell's alignment inside the cell's margins, as wide as
 * the cell's width less both of them; a block cell's block is placed so
 * that its extents sit so, fitted to the inner box when `autoFit` (t03).
 * `extents` gives a block's extents at scale 1, in its own coordinates.
 */
export function tableGeometryWith(
  table: TableEntity,
  extents: (blockId: BlockId) => Bounds | null
): Entity[] {
  const rows = tableRowCount(table)
  const columns = tableColumnCount(table)
  const xs = columnEdges(table)
  const ys = rowEdges(table)
  const owners = cellOwners(table)
  const margins = tableMargins(table)
  const rotation = Math.atan2(table.direction.y, table.direction.x)
  let n = 0
  const piece = <T extends Entity>(made: T): T =>
    carryOverrides(table, {
      ...made,
      id: `${table.id}~${n++}`,
      layerId: table.layerId,
    })
  const texts: Entity[] = []
  const blocks: Entity[] = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      const index = r * columns + c
      if (owners[index] !== index) continue
      const cell = table.cells[index]
      if (!cell) continue
      const span = cell.span ?? { columns: 1, rows: 1 }
      const c2 = Math.min(c + span.columns, columns)
      const r2 = Math.min(r + span.rows, rows)
      const left = xs[c] + margins.horizontal
      const right = xs[c2] - margins.horizontal
      const top = Math.max(ys[r], ys[r2]) - margins.vertical
      const bottom = Math.min(ys[r], ys[r2]) + margins.vertical
      const style = tableRowStyle(table, tableRowKind(table, r))
      const alignment = cell.alignment ?? style.alignment
      const h = HORIZONTAL[alignment]
      const v = VERTICAL[alignment]
      const x = h < 0 ? left : h > 0 ? right : (left + right) / 2
      const y = v > 0 ? top : v < 0 ? bottom : (top + bottom) / 2
      if (cell.block) {
        const box = extents(cell.block.blockId)
        if (!box) continue
        const bw = box.max.x - box.min.x
        const bh = box.max.y - box.min.y
        const fits = [
          bw > 0 ? (right - left) / bw : Infinity,
          bh > 0 ? (top - bottom) / bh : Infinity,
        ]
        const fitted = Math.min(...fits)
        const s =
          cell.block.autoFit && Number.isFinite(fitted) && fitted > 0
            ? fitted
            : cell.block.scale
        const bx =
          h < 0
            ? x - s * box.min.x
            : h > 0
              ? x - s * box.max.x
              : x - (s * (box.min.x + box.max.x)) / 2
        const by =
          v > 0
            ? y - s * box.max.y
            : v < 0
              ? y - s * box.min.y
              : y - (s * (box.min.y + box.max.y)) / 2
        blocks.push(
          piece(
            createInsert(cell.block.blockId, at(table, bx, by), {
              scale: s,
              rotation,
            })
          )
        )
        continue
      }
      if (!cell.text) continue
      texts.push(
        piece(
          createMText(at(table, x, y), cell.text, {
            height: cell.textHeight ?? style.textHeight,
            width: Math.max(right - left, 0),
            rotation,
            attachment: alignment,
            lineSpacingStyle: "atLeast",
            lineSpacingFactor: 1,
            styleId: cell.textStyleId ?? style.textStyleId,
          })
        )
      )
    }
  }
  const lines: Entity[] = []
  const run = (from: Vec2, to: Vec2) =>
    lines.push(
      piece(createPolyline([at(table, from.x, from.y), at(table, to.x, to.y)]))
    )
  // Across: the edge below row k - 1, broken where one span covers both sides.
  for (let k = 0; k <= rows; k++) {
    let start: number | null = null
    for (let c = 0; c <= columns; c++) {
      const drawn =
        c < columns &&
        (k === 0 ||
          k === rows ||
          owners[(k - 1) * columns + c] !== owners[k * columns + c])
      if (drawn && start === null) start = c
      if (!drawn && start !== null) {
        run({ x: xs[start], y: ys[k] }, { x: xs[c], y: ys[k] })
        start = null
      }
    }
  }
  for (let k = 0; k <= columns; k++) {
    let start: number | null = null
    for (let r = 0; r <= rows; r++) {
      const drawn =
        r < rows &&
        (k === 0 ||
          k === columns ||
          owners[r * columns + k - 1] !== owners[r * columns + k])
      if (drawn && start === null) start = r
      if (!drawn && start !== null) {
        run({ x: xs[k], y: ys[start] }, { x: xs[k], y: ys[r] })
        start = null
      }
    }
  }
  return [...texts, ...blocks, ...lines]
}

/**
 * What EXPLODE leaves of a table, `pieces` being its geometry: each grid
 * run a LINE, in the WCS, then the line of no length at its insertion
 * point that ends AutoCAD's block, grey and of lineweight 0, which EXPLODE
 * leaves as it is (table/t03, t06, t06b). The texts and the block cells'
 * references as they are.
 */
export function tableExploded(
  table: TableEntity,
  pieces: readonly Entity[],
  newId: () => string
): Entity[] {
  const wearing = (made: Entity): Entity => {
    const colored = table.color ? assignEntityColor(made, table.color) : made
    const typed = table.linetype
      ? assignEntityLinetype(colored, table.linetype)
      : colored
    return table.lineweight !== undefined
      ? assignEntityLineweight(typed, table.lineweight)
      : typed
  }
  const out: Entity[] = pieces.map((piece) => {
    if (piece.type !== "polyline") return { ...piece, id: newId() }
    const [a, b] = piece.vertices
    return wearing(
      createLine(
        entityPointToWorld(piece, a),
        entityPointToWorld(piece, b),
        table.layerId,
        newId()
      )
    )
  })
  const corner = entityPointToWorld(table, table.position)
  out.push(
    assignEntityLineweight(
      assignEntityColor(
        createLine(corner, corner, table.layerId, newId()),
        MARKER_COLOR
      ),
      0
    )
  )
  return out
}

/**
 * The table under the affine map `at`, as AutoCAD's MOVE, ROTATE, SCALE and
 * MIRROR leave it (table/t02): its corner and its direction carried, its
 * rows' heights, its columns' widths, its margins and its texts' heights
 * scaled by how much the map stretches its direction, never a factor of
 * its own (t00: 41 stays 1). A map that reflects leaves it unreflected,
 * its text read as before: its insertion point the image of its far corner
 * along its rows, its direction the opposite of the image of its own.
 */
export function mapTable(
  table: TableEntity,
  at: (point: Vec2) => Vec2
): TableEntity {
  const p0 = at(table.position)
  const u = V.sub(at(V.add(table.position, table.direction)), p0)
  const v = V.sub(at(V.add(table.position, tableUp(table))), p0)
  const k = V.length(u)
  if (!(k > 0)) return table
  const reflects = u.x * v.y - u.y * v.x < 0
  const direction = V.scale(u, (reflects ? -1 : 1) / k)
  const position = reflects
    ? at(V.add(table.position, V.scale(table.direction, tableWidth(table))))
    : p0
  const moved: TableEntity = {
    ...table,
    position: { x: position.x, y: position.y },
    direction: { x: direction.x, y: direction.y },
  }
  return Math.abs(k - 1) < 1e-12 ? moved : tableScaled(moved, k)
}

/**
 * Its sizes times `k`, as AutoCAD's SCALE writes them (table/t00, t02): the
 * rows and columns, the margins and the three kinds of row's text heights
 * set on the table, and every cell that is not covered by a span given its
 * text height of its own; a block cell's scale too.
 */
export function tableScaled(table: TableEntity, k: number): TableEntity {
  const margins = tableMargins(table)
  const heights = {
    data: tableRowStyle(table, "data").textHeight * k,
    title: tableRowStyle(table, "title").textHeight * k,
    header: tableRowStyle(table, "header").textHeight * k,
  }
  const columns = tableColumnCount(table)
  return {
    ...table,
    rowHeights: table.rowHeights.map((h) => h * k),
    columnWidths: table.columnWidths.map((w) => w * k),
    overrides: {
      horizontalMargin: margins.horizontal * k,
      verticalMargin: margins.vertical * k,
      textHeights: heights,
    },
    cells: table.cells.map((cell, i) => {
      if (cell.merged) return cell
      const row = Math.floor(i / columns)
      const height =
        cell.textHeight ??
        tableRowStyle(table, tableRowKind(table, row)).textHeight
      return {
        ...cell,
        textHeight: height * k,
        ...(cell.block
          ? { block: { ...cell.block, scale: cell.block.scale * k } }
          : {}),
      }
    }),
  }
}

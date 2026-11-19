import { Vec2 } from "../../geometry/Vec2"
import { Vec3, cross3, normalize3 } from "../../geometry/Vec3"
import { arbitraryAxis, worldToAxes } from "../../geometry/ocs"
import { normalizeAngle } from "../../geometry/primitives"
import {
  MLeaderBranch,
  MLeaderColor,
  MLeaderContent,
  MLeaderEntity,
  MLeaderPath,
  MLeaderStyleData,
  MTEXT_ATTACHMENTS,
  STANDARD_MLEADER_STYLE,
  clampLineSpacingFactor,
  mleaderDoglegEnd,
  nextEntityId,
  withElevation,
  withNormal,
} from "../../domain/entities"
import type { TextStyleId } from "../../domain/textStyles"
import { aciColor, trueColor } from "./dxfColors"
import { DxfRecord } from "./dxfSections"
import { finite, str, unicode } from "./dxfValues"

/** What reading a multileader needs from the rest of the file. */
export interface DxfMLeaderContext {
  /** The text style whose STYLE record has that handle. */
  textStyleByHandle(handle: string | undefined): TextStyleId
  /** The multileader style (MLEADERSTYLE) of that handle, the Standard for none. */
  mleaderStyle(handle: string | undefined): MLeaderStyleData
  /** The block whose BLOCK_RECORD has that handle, `null` for none. */
  blockByRecord(handle: string): string | null
}

/**
 * A colour as a multileader writes its parts' (an AcCmColor: its method in
 * the high byte): 0xC0 ByLayer, 0xC1 ByBlock, 0xC2 a true colour in the
 * low three bytes, 0xC3 an index in the low byte (mleader/m02, v18, v21).
 */
export function mleaderColor(
  value: number | undefined
): MLeaderColor | undefined {
  if (value === undefined) return undefined
  const method = (value >>> 24) & 0xff
  if (method === 0xc1) return "ByBlock"
  if (method === 0xc2) return trueColor(value & 0xffffff) ?? undefined
  if (method === 0xc3) return aciColor(value & 0xff) ?? undefined
  return undefined
}

const PATHS: readonly MLeaderPath[] = ["none", "straight", "spline"]

/** The groups of one brace, `{` to its `}`, nested ones skipped whole. */
interface Groups {
  readonly codes: readonly number[]
  readonly values: readonly string[]
}

class Cursor {
  constructor(
    private readonly groups: Groups,
    public i: number
  ) {}

  done(): boolean {
    return this.i >= this.groups.codes.length
  }

  code(): number {
    return this.groups.codes[this.i]
  }

  value(): string {
    return this.groups.values[this.i]
  }
}

/**
 * A brace's level: the brace each code opens in it and the code of the `}`
 * that closes it. CONTEXT_DATA{ holds LEADER{s (302), which hold
 * LEADER_LINE{s (304); a text is a 304 of the context's own, whatever it
 * says, and so is a `}` of a code but the level's.
 */
interface Level {
  readonly opens?: readonly [number, string]
  readonly closes: number
}

const CONTEXT: Level = { opens: [302, "LEADER{"], closes: 301 }
const BRANCH: Level = { opens: [304, "LEADER_LINE{"], closes: 303 }
const LINE: Level = { closes: 305 }

/** One level's groups, by code in order, each brace below it read by `nested`. */
function level(
  cursor: Cursor,
  at: Level,
  nested: (cursor: Cursor) => void = () => {}
): Map<number, string[]> {
  const out = new Map<number, string[]>()
  while (!cursor.done()) {
    const code = cursor.code()
    const value = cursor.value()?.trim()
    if (code === at.closes && value === "}") {
      cursor.i++
      return out
    }
    if (at.opens && code === at.opens[0] && value === at.opens[1]) {
      cursor.i++
      nested(cursor)
      continue
    }
    const list = out.get(code) ?? []
    list.push(cursor.value())
    out.set(code, list)
    cursor.i++
  }
  return out
}

function number(groups: Map<number, string[]>, code: number, k = 0) {
  const value = groups.get(code)?.[k]
  return value === undefined ? undefined : finite(value)
}

function vector(
  groups: Map<number, string[]>,
  code: number,
  k = 0
): Vec3 | undefined {
  const x = number(groups, code, k)
  const y = number(groups, code + 10, k)
  if (x === undefined || y === undefined) return undefined
  return { x, y, z: number(groups, code + 20, k) ?? 0 }
}

function count(groups: Map<number, string[]>, code: number): number {
  return groups.get(code)?.length ?? 0
}

/**
 * A MULTILEADER (mleader/m02, m03, m11): its context data, each LEADER{}
 * branch with its landing (10), dogleg direction (11) and length (40) and
 * its LEADER_LINE{}s' vertices (10), its MTEXT (290 1: 304, 340, 12, 13,
 * 41, 43, 45, 170, 171) or block (296 1: 341, 15, 16, 46), the
 * arrowhead's size (140) and landing gap (145); then the object's style
 * (340), path (170), line colour (91), dogleg (291) and landing (290). Its
 * points are the WCS's; a plane (111 × 112) other than +Z puts them in its
 * OCS. `null` for one with no context.
 */
export function dxfMLeader(
  r: DxfRecord,
  ctx: DxfMLeaderContext
): MLeaderEntity | null {
  const start = r.codes.findIndex(
    (code, i) => code === 300 && r.values[i].trim() === "CONTEXT_DATA{"
  )
  if (start < 0) return null
  const branches: Map<number, string[]>[] = []
  const lines: Map<number, string[]>[][] = []
  const cursor = new Cursor(r, start + 1)
  const context = level(cursor, CONTEXT, (inner) => {
    const own: Map<number, string[]>[] = []
    branches.push(
      level(inner, BRANCH, (deeper) => own.push(level(deeper, LINE)))
    )
    lines.push(own)
  })
  // What follows the context: the object's own groups.
  const own = new Map<number, string[]>()
  for (let i = cursor.i; i < r.codes.length; i++) {
    const list = own.get(r.codes[i]) ?? []
    list.push(r.values[i])
    own.set(r.codes[i], list)
  }

  const xAxis = vector(context, 111)
  const yAxis = vector(context, 112)
  const plane = xAxis && yAxis ? normalize3(cross3(xAxis, yAxis)) : null
  const tilted =
    plane &&
    !(Math.abs(plane.x) < 1e-12 && Math.abs(plane.y) < 1e-12 && plane.z > 0)
  const axes = tilted && plane ? arbitraryAxis(plane) : null
  const local = (p: Vec3): Vec3 => (axes ? worldToAxes(axes, p) : p)
  const flat = (p: Vec3): Vec2 => {
    const q = local(p)
    return { x: q.x, y: q.y }
  }
  const direction = (v: Vec3): Vec2 | null => {
    const q = axes
      ? (() => {
          const a = local({ x: 0, y: 0, z: 0 })
          const b = local(v)
          return { x: b.x - a.x, y: b.y - a.y }
        })()
      : { x: v.x, y: v.y }
    const length = Math.hypot(q.x, q.y)
    return length > 1e-12 ? { x: q.x / length, y: q.y / length } : null
  }

  const made: MLeaderBranch[] = []
  let elevation: number | undefined
  branches.forEach((groups, k) => {
    const landing = vector(groups, 10)
    if (!landing) return
    elevation ??= local(landing).z
    const along = vector(groups, 11)
    const length = number(groups, 40)
    made.push({
      landing: flat(landing),
      direction: (along && direction(along)) ?? { x: 1, y: 0 },
      doglegLength: length !== undefined && length >= 0 ? length : 0,
      lines: lines[k].flatMap((line) => {
        const points: Vec2[] = []
        for (let j = 0; j < count(line, 10); j++) {
          const p = vector(line, 10, j)
          if (p) points.push(flat(p))
        }
        return points.length > 0 ? [points] : []
      }),
    })
  })

  const style = ctx.mleaderStyle(own.get(340)?.[0]?.trim())
  const content = mleaderContent(context, ctx, flat, direction)
  const size = (value: number | undefined, fallback: number) =>
    value !== undefined && value >= 0 ? value : fallback
  const path = PATHS[number(own, 170) ?? 1] ?? "straight"
  const lineColor = mleaderColor(number(own, 91))
  const base = vector(context, 10)
  const origin = vector(context, 110)
  const first = made[0]
  const fallback = first ? mleaderDoglegEnd(first) : { x: 0, y: 0 }
  const scale = number(context, 40)
  const entity: MLeaderEntity = {
    id: nextEntityId(),
    type: "mleader",
    layerId: "0",
    branches: made,
    path,
    dogleg: number(own, 291) !== 0,
    arrowSize: size(number(context, 140), style.arrowSize),
    landingGap: size(number(context, 145), style.landingGap),
    ...(content ? { content } : {}),
    ...(lineColor ? { lineColor } : {}),
    style,
    kept: {
      base: base ? flat(base) : fallback,
      planeOrigin: origin ? flat(origin) : fallback,
      scale: scale !== undefined && scale > 0 ? scale : 1,
      overrideFlags: number(own, 90) ?? 0,
      doglegLength: size(number(own, 41), style.doglegLength),
      arrowSize: size(number(own, 42), style.arrowSize),
      landing: number(own, 290) !== 0,
    },
  }
  const raised =
    elevation !== undefined && elevation !== 0
      ? withElevation(entity, elevation)
      : entity
  return axes && plane ? withNormal(raised, plane) : raised
}

function mleaderContent(
  context: Map<number, string[]>,
  ctx: DxfMLeaderContext,
  flat: (p: Vec3) => Vec2,
  direction: (v: Vec3) => Vec2 | null
): MLeaderContent | undefined {
  if (number(context, 290) === 1) {
    const at = vector(context, 12)
    const text = context.get(304)?.[0]
    const height = number(context, 41)
    if (!at || text === undefined || !(height !== undefined && height > 0)) {
      return undefined
    }
    const along = vector(context, 13)
    const turned = along && direction(along)
    const rotation = turned
      ? Math.atan2(turned.y, turned.x)
      : (number(context, 42) ?? 0)
    // WHY 1 for dynamic columns (173 2, what MLEADER writes): AutoCAD 2027
    // reads its own DXF so, whatever 43 and 142 say, and wraps each word
    // (mleader/v13); with none (173 0) it reads 43 (v14).
    const width = number(context, 173) === 2 ? 1 : (number(context, 43) ?? 0)
    return {
      kind: "mtext",
      position: flat(at),
      contents: unicode(text.trimEnd()),
      height,
      width: width > 0 ? width : 0,
      rotation: normalizeAngle(rotation),
      attachment: MTEXT_ATTACHMENTS[(number(context, 171) ?? 1) - 1] ?? "tl",
      lineSpacingStyle: number(context, 170) === 2 ? "exactly" : "atLeast",
      lineSpacingFactor: clampLineSpacingFactor(number(context, 45) ?? 1),
      styleId: ctx.textStyleByHandle(context.get(340)?.[0]?.trim()),
    }
  }
  if (number(context, 296) === 1) {
    const handle = context.get(341)?.[0]?.trim()
    const blockId = handle ? ctx.blockByRecord(handle) : null
    const at = vector(context, 15)
    if (!blockId || !at) return undefined
    const factors = vector(context, 16)
    const factor = (value: number | undefined) =>
      value !== undefined && value !== 0 ? value : 1
    return {
      kind: "block",
      blockId,
      position: flat(at),
      scaleX: factor(factors?.x),
      scaleY: factor(factors?.y),
      rotation: normalizeAngle(number(context, 46) ?? 0),
    }
  }
  return undefined
}

/**
 * Each multileader style by its handle (MLEADERSTYLE, mleader/m02): its
 * name from ACAD_MLEADERSTYLE, else its description (3), and what it says
 * of a new one (170, 173, 290, 42, 291, 43, 44, 342, 45, 142, 296).
 */
export function dxfMLeaderStyles(
  objects: readonly DxfRecord[],
  textStyleByHandle: (handle: string | undefined) => TextStyleId
): Map<string, MLeaderStyleData> {
  const names = new Map<string, string>()
  for (const dictionary of objects) {
    if (dictionary.type !== "DICTIONARY") continue
    dictionary.codes.forEach((code, i) => {
      if (code !== 3 || dictionary.codes[i + 1] !== 350) return
      names.set(
        dictionary.values[i + 1].trim().toUpperCase(),
        dictionary.values[i].trim()
      )
    })
  }
  const styles = new Map<string, MLeaderStyleData>()
  for (const record of objects) {
    if (record.type !== "MLEADERSTYLE") continue
    const handle = str(record, 5)?.trim().toUpperCase()
    if (!handle) continue
    const from = Math.max(
      0,
      record.codes.findIndex(
        (code, i) =>
          code === 100 && record.values[i].trim() === "AcDbMLeaderStyle"
      )
    )
    const value = (code: number) => {
      const i = record.codes.indexOf(code, from)
      return i < 0 ? undefined : finite(record.values[i])
    }
    const base = STANDARD_MLEADER_STYLE
    const size = (code: number, fallback: number) => {
      const v = value(code)
      return v !== undefined && v >= 0 ? v : fallback
    }
    const kind = value(170)
    const textHeight = value(45)
    const scale = value(142)
    const textStyle = record.values[record.codes.indexOf(342, from)]
    styles.set(handle, {
      name: names.get(handle) ?? str(record, 3)?.trim() ?? base.name,
      content: kind === 0 ? "none" : kind === 1 ? "block" : "mtext",
      path: PATHS[value(173) ?? 1] ?? base.path,
      landing: value(290) !== 0,
      landingGap: size(42, base.landingGap),
      dogleg: value(291) !== 0,
      doglegLength: size(43, base.doglegLength),
      arrowSize: size(44, base.arrowSize),
      textStyleId: textStyleByHandle(textStyle?.trim()),
      textHeight:
        textHeight !== undefined && textHeight > 0
          ? textHeight
          : base.textHeight,
      scale: scale !== undefined && scale > 0 ? scale : base.scale,
      annotative: value(296) === 1,
    })
  }
  return styles
}

import { Vec2, V } from "../geometry/Vec2"
import { normalizeAngle } from "../geometry/primitives"
import { dot3, planar } from "../geometry/Vec3"
import { DimStyle, DimStyleId, clampDimScale } from "./dimStyles"
import {
  entityElevation,
  entityNormal,
  entityPointToWorld,
  withElevation,
  withNormal,
  worldToEntity,
} from "./elevation"
import { nextEntityId } from "./entityIds"
import { DEFAULT_LAYER_ID, LayerId } from "./layers"
import { createMText, mtextLayout } from "./mtext"
import { createSpline } from "./splines"
import type {
  Entity,
  EntityId,
  InsertEntity,
  PolylineEntity,
  LeaderEntity,
  LeaderOverrides,
  MTextAttachment,
  MTextEntity,
  SplineEntity,
} from "./entityTypes"
import type { TextStyleId } from "./textStyles"

/**
 * A hook line is added when the last segment rises more than this from the
 * horizontal: "if the last leader line segment is at an angle greater than 15
 * degrees from horizontal" (Autodesk's leader help); 2.6795 over 10, a hair
 * past 15°, gets one, 1.5 over 10 none (leader/p12).
 */
const HOOK_ANGLE = (15 * Math.PI) / 180

/** The sizes a leader is drawn with: its overrides over its style, DIMSCALE folded in. */
export interface LeaderLook {
  /** DIMASZ: the arrowhead's length, and the hook's. */
  readonly arrowSize: number
  /** DIMGAP, as a distance: a negative one boxes the text in AutoCAD (not modelled). */
  readonly gap: number
  /** DIMTXT: the height of the text LEADER writes. */
  readonly textHeight: number
  /** DIMTAD other than 0: the text above the last line, which runs on under it. */
  readonly textAbove: boolean
}

export function leaderLook(leader: LeaderEntity, style: DimStyle): LeaderLook {
  return dimLook(style, leader.overrides)
}

/** The look a leader made now with `style` and `overrides` would have. */
export function dimLook(
  style: DimStyle,
  overrides: LeaderOverrides = {}
): LeaderLook {
  const scale = clampDimScale(overrides.scale ?? style.scale)
  return {
    arrowSize: (overrides.arrowSize ?? style.arrowSize) * scale,
    gap: Math.abs(overrides.textGap ?? style.textGap) * scale,
    textHeight: style.textHeight * scale,
    textAbove: overrides.textAbove ?? true,
  }
}

/** The unit vector of the leader's horizontal (DXF 211). */
export function leaderHorizontal(leader: LeaderEntity): Vec2 {
  const angle = leader.horizontal ?? 0
  return { x: Math.cos(angle), y: Math.sin(angle) }
}

/**
 * Which way the text lies from the leader's end, along its horizontal: +1
 * after it, -1 before. A vertical last segment counts as after (leader/p12's
 * hook comes from the left).
 */
export function leaderSide(leader: LeaderEntity): 1 | -1 {
  const n = leader.vertices.length
  if (n < 2) return 1
  return sideOf(
    leader.vertices[n - 2],
    leader.vertices[n - 1],
    leaderHorizontal(leader)
  )
}

function sideOf(from: Vec2, to: Vec2, horizontal: Vec2): 1 | -1 {
  return V.dot(V.sub(to, from), horizontal) < -1e-12 ? -1 : 1
}

/** Whether a last segment from `from` to `to` rises more than 15° off `horizontal`. */
function needsHook(from: Vec2, to: Vec2, horizontal: Vec2): boolean {
  const d = V.sub(to, from)
  const along = Math.abs(V.dot(d, horizontal))
  const across = Math.abs(V.cross(horizontal, d))
  return Math.atan2(across, along) > HOOK_ANGLE + 1e-12
}

/**
 * The vertices with a hook line ending at the last one when it needs one
 * (leader/p02, p12): a vertex inserted a hook's length short of it, on the
 * side the segment comes from, so the point picked stays the end.
 */
function withHook(
  vertices: readonly Vec2[],
  horizontal: Vec2,
  hookLength: number
): { vertices: Vec2[]; hook: boolean } {
  const n = vertices.length
  const end = vertices[n - 1]
  const from = vertices[n - 2]
  if (n < 2 || !needsHook(from, end, horizontal)) {
    return { vertices: [...vertices], hook: false }
  }
  const side = sideOf(from, end, horizontal)
  const start = V.sub(end, V.scale(horizontal, side * hookLength))
  return { vertices: [...vertices.slice(0, -1), start, end], hook: true }
}

/** The vertices without the hook's start, the points picked. */
function withoutHook(leader: LeaderEntity): Vec2[] {
  const { vertices } = leader
  return leader.hook && vertices.length > 2
    ? [...vertices.slice(0, -2), vertices[vertices.length - 1]]
    : [...vertices]
}

export interface LeaderOptions {
  readonly arrow?: boolean
  readonly spline?: boolean
  readonly horizontal?: number
  readonly layerId?: LayerId
  readonly id?: EntityId
}

/** A leader through the points picked, with no annotation (LEADER's None). */
export function createLeader(
  vertices: readonly Vec2[],
  styleId: DimStyleId,
  options: LeaderOptions = {}
): LeaderEntity {
  const leader: LeaderEntity = {
    id: options.id ?? nextEntityId(),
    type: "leader",
    layerId: options.layerId ?? DEFAULT_LAYER_ID,
    vertices: vertices.map((p) => ({ x: p.x, y: p.y })),
    arrow: options.arrow ?? true,
    spline: options.spline ?? false,
    hook: false,
    styleId,
  }
  return options.horizontal
    ? { ...leader, horizontal: options.horizontal }
    : leader
}

/**
 * LEADER's text at the end of `leader`, and the leader hooked to it
 * (leader/p01, p02, p12): an MTEXT of no width, DIMTXT tall, after the end
 * along the horizontal, DIMGAP from it; with DIMTAD 1 its bottom DIMGAP above
 * the line (Bottom Left), with 0 centred on it (Middle Left), mirrored before
 * the end. A straight leader rising more than 15° gets its hook first.
 */
export function attachLeaderText(
  leader: LeaderEntity,
  contents: string,
  look: LeaderLook,
  styleId: TextStyleId,
  textId: EntityId = nextEntityId()
): { leader: LeaderEntity; text: MTextEntity } {
  const h = leaderHorizontal(leader)
  const hooked = leader.spline
    ? { vertices: [...leader.vertices], hook: false }
    : withHook(leader.vertices, h, look.arrowSize)
  const placed: LeaderEntity = { ...leader, ...hooked }
  const side = leaderSide(placed)
  const end = placed.vertices[placed.vertices.length - 1]
  const up = V.perpendicular(h)
  const text = createMText(
    V.add(
      V.add(end, V.scale(h, side * look.gap)),
      V.scale(up, look.textAbove ? look.gap : 0)
    ),
    contents,
    {
      height: look.textHeight,
      rotation: leader.horizontal ?? 0,
      attachment: attachmentFor(side, look.textAbove ? "b" : "m"),
      styleId,
      layerId: leader.layerId,
      id: textId,
    }
  )
  return {
    leader: withTextSize(associate(placed, "mtext", text.id), text),
    text,
  }
}

/**
 * LEADER's Copy of a text or an MTEXT: an MTEXT of its contents, height and
 * style, Middle Left or Right at the end, DIMGAP after it (leader/p06). A
 * copied MTEXT keeps its contents; a TEXT's value becomes them.
 */
export function attachLeaderCopy(
  leader: LeaderEntity,
  source: { contents: string; height: number; styleId: TextStyleId },
  look: LeaderLook
): { leader: LeaderEntity; text: MTextEntity } {
  const h = leaderHorizontal(leader)
  const hooked = leader.spline
    ? { vertices: [...leader.vertices], hook: false }
    : withHook(leader.vertices, h, look.arrowSize)
  const placed: LeaderEntity = { ...leader, ...hooked }
  const side = leaderSide(placed)
  const end = placed.vertices[placed.vertices.length - 1]
  const text = createMText(
    V.add(
      V.add(end, V.scale(h, side * look.gap)),
      V.scale(V.perpendicular(h), look.gap)
    ),
    source.contents,
    {
      height: source.height,
      rotation: leader.horizontal ?? 0,
      attachment: attachmentFor(side, "m"),
      styleId: source.styleId,
      layerId: leader.layerId,
    }
  )
  // WHY an offset: the copy sits DIMGAP above a middle attachment, so the end
  // is that far below where the text puts it, and a move keeps it so.
  const offset = V.sub(end, textAnchor(text, side, look.gap))
  return {
    leader: withTextSize(
      { ...associate(placed, "mtext", text.id), textOffset: offset },
      text
    ),
    text,
  }
}

/**
 * Where a text puts its leader's end: DIMGAP off its near side, level with
 * its bottom DIMGAP down (the text above the line) or with its insertion
 * point. A Top Left text read from a file, QLEADER's, keeps its end at the
 * middle of its first line through the offset (DXF 213 `0,-h/2`).
 */
function textAnchor(text: MTextEntity, side: 1 | -1, gap: number): Vec2 {
  const h = { x: Math.cos(text.rotation), y: Math.sin(text.rotation) }
  const down = text.attachment[0] === "b" ? gap : 0
  return V.add(
    V.add(text.position, V.scale(h, -side * gap)),
    V.scale(V.perpendicular(h), -down)
  )
}

function withHorizontal(leader: LeaderEntity, angle: number): LeaderEntity {
  const { horizontal, ...rest } = leader
  void horizontal
  return Math.abs(angle) > 1e-12 ? { ...rest, horizontal: angle } : rest
}

/** The leader pointing at block reference `insert`, its end where the reference was put (leader/p05). */
export function attachLeaderBlock(
  leader: LeaderEntity,
  insert: InsertEntity
): LeaderEntity {
  const end = leader.vertices[leader.vertices.length - 1]
  const offset = V.sub(end, insert.position)
  const associated = associate(leader, "block", insert.id)
  return V.length(offset) > 1e-12
    ? { ...associated, blockOffset: offset }
    : associated
}

function associate(
  leader: LeaderEntity,
  kind: "mtext" | "block",
  id: EntityId
): LeaderEntity {
  return { ...leader, annotation: { kind, id } }
}

function attachmentFor(side: 1 | -1, row: "t" | "m" | "b"): MTextAttachment {
  return `${row}${side > 0 ? "l" : "r"}` as MTextAttachment
}

function withTextSize(leader: LeaderEntity, text: MTextEntity): LeaderEntity {
  const layout = mtextLayout(text)
  return {
    ...leader,
    textWidth: layout.x1 - layout.x0,
    textHeight: layout.y1 - layout.y0,
  }
}

/**
 * The leader once its annotation has changed, and the text re-justified if it
 * crossed to the other side of the leader (leader/p08, p09, p18). AutoCAD's
 * reactor: the end goes to where the text attaches — DIMGAP off its near side,
 * on its bottom with the text above, its middle otherwise — plus the offset a
 * stretch left (DXF 213); the hook is worked out again; the horizontal turns
 * with the text. A text whose box moved past the vertex before the end, from
 * where it was (`before`), turns to the other side, its box kept where it is
 * (Bottom Left to Bottom Right, p18); one that stays on its side keeps its
 * justification, even one that does not match it (the samples' mirrored
 * details, a Top Right text after the end: p25). A block reference takes the
 * end by its offset (DXF 212, p05).
 */
export function followAnnotation(
  leader: LeaderEntity,
  annotation: MTextEntity | InsertEntity,
  look: LeaderLook,
  before?: Entity
): { leader: LeaderEntity; text?: MTextEntity } {
  const base = withoutHook(leader)
  if (base.length < 2) return { leader }
  if (annotation.type === "insert") {
    const end = V.add(annotation.position, leader.blockOffset ?? V.zero())
    return {
      leader: { ...leader, vertices: [...base.slice(0, -1), end], hook: false },
    }
  }
  const rotation = normalizeAngle(annotation.rotation)
  const h = { x: Math.cos(rotation), y: Math.sin(rotation) }
  const layout = mtextLayout(annotation)
  const side = textSide(base, annotation)
  const crossed =
    before?.type === "mtext" ? textSide(base, before) !== side : false
  const text = crossed
    ? sideTurned(annotation, side, layout.x1 - layout.x0)
    : annotation
  const end = V.add(
    textAnchor(text, side, look.gap),
    leader.textOffset ?? V.zero()
  )
  const hooked = leader.spline
    ? { vertices: [...base.slice(0, -1), end], hook: false }
    : withHook([...base.slice(0, -1), end], h, look.arrowSize)
  const followed = withTextSize(
    withHorizontal({ ...leader, ...hooked }, rotation),
    text
  )
  return text === annotation ? { leader: followed } : { leader: followed, text }
}

/**
 * Which side of the leader a text lies on: past the vertex before the end
 * along its direction, by its box's centre (leader/p18).
 */
function textSide(base: readonly Vec2[], text: MTextEntity): 1 | -1 {
  const h = { x: Math.cos(text.rotation), y: Math.sin(text.rotation) }
  const layout = mtextLayout(text)
  const centre = V.add(
    text.position,
    V.add(
      V.scale(h, (layout.x0 + layout.x1) / 2),
      V.scale(V.perpendicular(h), (layout.y0 + layout.y1) / 2)
    )
  )
  return sideOf(base[base.length - 2] ?? base[0], centre, h)
}

/**
 * The leader whose end was edited, or edited with its annotation: the end
 * stays where it now is, and how far it lies from where the annotation puts
 * it becomes its offset (DXF 213 or 212). A window round the end alone moves
 * the hook and writes the offset; one round the end and the text moves both
 * and writes none (leader/p14).
 */
export function leaderOffsetRead(
  leader: LeaderEntity,
  annotation: MTextEntity | InsertEntity,
  look: LeaderLook
): LeaderEntity {
  const end = leader.vertices[leader.vertices.length - 1]
  if (!end) return leader
  if (annotation.type === "insert") {
    return withOffset(leader, "blockOffset", V.sub(end, annotation.position))
  }
  const side = textSide(withoutHook(leader), annotation)
  const offset = V.sub(end, textAnchor(annotation, side, look.gap))
  return withTextSize(withOffset(leader, "textOffset", offset), annotation)
}

function withOffset(
  leader: LeaderEntity,
  key: "textOffset" | "blockOffset",
  offset: Vec2
): LeaderEntity {
  const { [key]: old, ...rest } = leader
  void old
  return V.length(offset) > 1e-9 ? { ...rest, [key]: offset } : rest
}

/**
 * The text justified to the `side` of the leader it lies on: a left
 * attachment after the end, a right one before it, the box left in place.
 * A centred column is left as it is.
 */
function sideTurned(
  text: MTextEntity,
  side: 1 | -1,
  width: number
): MTextEntity {
  const column = text.attachment[1]
  if (column === "c") return text
  if ((column === "l") === side > 0) return text
  const h = { x: Math.cos(text.rotation), y: Math.sin(text.rotation) }
  const shift = column === "l" ? width : -width
  return {
    ...text,
    attachment:
      `${text.attachment[0]}${column === "l" ? "r" : "l"}` as MTextAttachment,
    position: V.add(text.position, V.scale(h, shift)),
  }
}

/**
 * The leader once its annotation is gone (leader/p08): no annotation, and no
 * hook — the hook's start dropped, its end kept.
 */
export function detachLeader(leader: LeaderEntity): LeaderEntity {
  const {
    annotation,
    textWidth,
    textHeight,
    textOffset,
    blockOffset,
    ...rest
  } = leader
  void annotation
  void textWidth
  void textHeight
  void textOffset
  void blockOffset
  return { ...rest, vertices: withoutHook(leader), hook: false }
}

/** What a leader draws, in its own plane (`leaderGeometry`). */
export interface LeaderGeometry {
  /** The straight line work, from the arrowhead's base, the line under the text included. */
  readonly path: readonly Vec2[]
  /** A spline leader's curve, from the arrowhead's base through the vertices. */
  readonly curve?: SplineEntity
  /** The line under the text, which a spline leader draws apart (leader/p16). */
  readonly underline?: readonly [Vec2, Vec2]
  /** The closed filled arrowhead's triangle, tip first; absent when not drawn. */
  readonly arrow?: readonly [Vec2, Vec2, Vec2]
}

/**
 * The leader as AutoCAD draws it (leader/p10, p16, p18 explode it): a closed
 * filled arrowhead 1:6 at the first vertex, drawn only when the first segment
 * is at least twice its length (5 of 2.5 gets one, 4 none), the line starting
 * at its base; a spline leader is the fit spline from there through the
 * vertices, its start tangent along the first segment, its end along the
 * horizontal towards an annotation, else along the last segment; and, with
 * DIMTAD on and a text, the line runs on under it, DIMGAP and its width.
 */
export function leaderGeometry(
  leader: LeaderEntity,
  look: LeaderLook
): LeaderGeometry {
  const { vertices } = leader
  if (vertices.length < 2) return { path: [...vertices] }
  const first = vertices[0]
  const firstLength = V.distance(first, vertices[1])
  const dir =
    firstLength > 1e-12
      ? V.scale(V.sub(vertices[1], first), 1 / firstLength)
      : null
  const size = look.arrowSize
  const drawn =
    leader.arrow && dir !== null && size > 0 && firstLength >= 2 * size - 1e-9
  const start = drawn && dir ? V.add(first, V.scale(dir, size)) : first
  const arrow: LeaderGeometry["arrow"] =
    drawn && dir
      ? (() => {
          const half = V.scale(V.perpendicular(dir), size / 6)
          return [first, V.add(start, half), V.sub(start, half)] as const
        })()
      : undefined
  const end = vertices[vertices.length - 1]
  const h = leaderHorizontal(leader)
  const side = leaderSide(leader)
  const underline: [Vec2, Vec2] | undefined =
    leader.annotation?.kind === "mtext" &&
    look.textAbove &&
    (leader.textWidth ?? 0) > 0
      ? [
          end,
          V.add(end, V.scale(h, side * (look.gap + (leader.textWidth ?? 0)))),
        ]
      : undefined
  if (leader.spline) {
    const curve = leaderCurve(leader, start)
    return {
      path: underline ? [...underline] : [],
      curve,
      ...(underline ? { underline } : {}),
      ...(arrow ? { arrow } : {}),
    }
  }
  const path = [start, ...vertices.slice(1)]
  if (underline) path.push(underline[1])
  return {
    path,
    ...(underline ? { underline } : {}),
    ...(arrow ? { arrow } : {}),
  }
}

/**
 * A spline leader's curve from `start`: the fit spline through the vertices
 * after the first, its start tangent along the first segment, its end along
 * the horizontal towards an annotation, else along the last segment (the
 * SPLINE its EXPLODE leaves, leader/p16, p18), in its plane at Z 0.
 */
function leaderCurve(leader: LeaderEntity, start: Vec2): SplineEntity {
  const { vertices } = leader
  const n = vertices.length
  const first = V.sub(vertices[1], vertices[0])
  const last = V.sub(vertices[n - 1], vertices[n - 2])
  const endTangent = leader.annotation
    ? V.scale(leaderHorizontal(leader), leaderSide(leader))
    : V.normalize(last)
  return createSpline("fit", [start, ...vertices.slice(1)], {
    knots: "chord",
    ...(V.length(first) > 1e-12 ? { startTangent: V.normalize(first) } : {}),
    ...(V.length(endTangent) > 1e-12 ? { endTangent } : {}),
    layerId: leader.layerId,
    id: leader.id,
  })
}

/**
 * What the queries take a leader for — picking, bounds, a window, the snaps:
 * its line through the vertices from the first, a polyline or its spline, of
 * its id, layer, properties and plane. AutoCAD's Midpoint of the first
 * segment is the whole segment's, arrowhead and all (leader/p11).
 */
export function leaderPathEntity(
  leader: LeaderEntity
): PolylineEntity | SplineEntity {
  const {
    type,
    vertices,
    arrow,
    spline,
    hook,
    horizontal,
    annotation,
    textWidth,
    textHeight,
    textOffset,
    blockOffset,
    styleId,
    overrides,
    elevation,
    ...base
  } = leader
  void [type, arrow, hook, horizontal, annotation, textWidth, textHeight]
  void [textOffset, blockOffset, styleId, overrides]
  if (spline && vertices.length >= 2) {
    const curve = leaderCurve(leader, vertices[0])
    const z = elevation ?? 0
    return {
      ...base,
      ...curve,
      points: curve.points.map((p) => ({ ...p, z })),
    }
  }
  return {
    ...base,
    ...(elevation ? { elevation } : {}),
    type: "polyline",
    vertices,
    closed: false,
  }
}

/**
 * The leader's vertex `index` at `point`, a grip's edit: the end takes the
 * hook with it (leader/p14); a hook's start, which has no grip, moves alone
 * (the palette's Current Vertex).
 */
export function withLeaderVertex(
  leader: LeaderEntity,
  index: number,
  point: Vec2
): LeaderEntity {
  const last = leader.vertices.length - 1
  if (index !== last) {
    const vertices = leader.vertices.map((p, i) =>
      i === index ? { x: point.x, y: point.y } : p
    )
    return { ...leader, vertices }
  }
  const delta = V.sub(point, leader.vertices[last])
  return stretchLeaderVertices(leader, (i) => (i === last ? delta : null))
}

/**
 * The leader with each vertex `move` gives a delta moved by it, as STRETCH
 * moves the vertices it catches: the end takes its hook along (leader/p14).
 * Its offset from its annotation is the command's to read once the edit is
 * done (`leaderOffsetRead`).
 */
export function stretchLeaderVertices(
  leader: LeaderEntity,
  move: (index: number) => Vec2 | null
): LeaderEntity {
  const last = leader.vertices.length - 1
  const endDelta = move(last)
  const vertices = leader.vertices.map((p, i) => {
    if (leader.hook && i === last - 1) return endDelta ? V.add(p, endDelta) : p
    const d = move(i)
    return d ? V.add(p, d) : p
  })
  return { ...leader, vertices }
}

/** The vertices that take a grip: all but a hook's start, which follows the end (desktop leader/d01). */
export function leaderGripIndices(leader: LeaderEntity): number[] {
  const n = leader.vertices.length
  return leader.vertices
    .map((_, i) => i)
    .filter((i) => !(leader.hook && i === n - 2 && n > 2))
}

/**
 * The leader under a map of its plane: its vertices by `at`, its horizontal
 * by `angle`, its offsets as vectors by `vector`. Mirrored, the side its text
 * lies on goes with it (leader/p14).
 */
export function mapLeader(
  leader: LeaderEntity,
  at: (point: Vec2) => Vec2,
  vector: (v: Vec2) => Vec2,
  angle: (radians: number) => number
): LeaderEntity {
  const mapped = withHorizontal(
    { ...leader, vertices: leader.vertices.map(at) },
    normalizeAngle(angle(leader.horizontal ?? 0))
  )
  return {
    ...mapped,
    ...(leader.textOffset ? { textOffset: vector(leader.textOffset) } : {}),
    ...(leader.blockOffset ? { blockOffset: vector(leader.blockOffset) } : {}),
  }
}

/** The leader with one of its overrides of the style set. */
export function withLeaderOverride<K extends keyof LeaderOverrides>(
  leader: LeaderEntity,
  key: K,
  value: NonNullable<LeaderOverrides[K]>
): LeaderEntity {
  return { ...leader, overrides: { ...leader.overrides, [key]: value } }
}

/**
 * Copies made together keep their pairs: a leader copied with its annotation
 * points at that copy; one copied without it keeps none, and no hook, as
 * AutoCAD's COPY of a leader alone leaves it (leader/p09). `copies[i]` is the
 * copy of `originals[i]`.
 */
export function withCopiedAssociations(
  originals: readonly Entity[],
  copies: readonly Entity[]
): Entity[] {
  // WHY by occurrence: the items of an array exploded repeat the block's ids,
  // each item once, so a leader's nth copy pairs with its text's nth.
  const copied = new Map<EntityId, EntityId[]>()
  const occurrence: number[] = []
  originals.forEach((original, i) => {
    const copy = copies[i]
    if (!copy) return
    const list = copied.get(original.id) ?? []
    occurrence[i] = list.length
    list.push(copy.id)
    copied.set(original.id, list)
  })
  return copies.map((copy, i) => {
    if (copy.type !== "leader" || !copy.annotation) return copy
    const id = copied.get(copy.annotation.id)?.[occurrence[i] ?? 0]
    return id
      ? { ...copy, annotation: { ...copy.annotation, id } }
      : detachLeader(copy)
  })
}

/**
 * Whether two objects lie in one plane, the frame a leader and its
 * annotation are read in together: the same normal and elevation. A leader
 * and a text in different planes are not kept in step (unverified in
 * AutoCAD, which follows them in space).
 */
export function samePlane(a: Entity, b: Entity): boolean {
  const na = a.normal ?? { x: 0, y: 0, z: 1 }
  const nb = b.normal ?? { x: 0, y: 0, z: 1 }
  const close = (u: number, v: number) => Math.abs(u - v) < 1e-6
  return (
    close(na.x, nb.x) &&
    close(na.y, nb.y) &&
    close(na.z, nb.z) &&
    close(a.elevation ?? 0, b.elevation ?? 0)
  )
}

/**
 * The leader put in `other`'s frame when the two lie in one plane facing
 * opposite ways, null when they do not. AutoCAD's mirrored details are so: a
 * leader facing -Z and its text +Z (the samples' 39, leader/p25), which it
 * keeps in step in the WCS: the text's frame, read here as one with the
 * leader's.
 */
export function leaderInPlaneOf(
  leader: LeaderEntity,
  other: Entity
): LeaderEntity | null {
  const normal = entityNormal(other)
  if (dot3(entityNormal(leader), normal) > -1 + 1e-9) return null
  const there = (v: Vec2) => worldToEntity(other, entityPointToWorld(leader, v))
  const points = leader.vertices.map(there)
  const z = entityElevation(other)
  if (points.some((p) => Math.abs(p.z - z) > 1e-6)) return null
  const origin = there(V.zero())
  const vector = (v: Vec2): Vec2 => V.sub(planar(there(v)), planar(origin))
  const h = vector(leaderHorizontal(leader))
  const angle = normalizeAngle(Math.atan2(h.y, h.x))
  const {
    horizontal,
    textOffset,
    blockOffset,
    normal: old,
    elevation,
    ...rest
  } = leader
  void horizontal
  void old
  void elevation
  const turned: LeaderEntity = {
    ...rest,
    vertices: points.map((p) => planar(p)),
    ...(Math.abs(angle) > 1e-12 ? { horizontal: angle } : {}),
    ...(textOffset ? { textOffset: vector(textOffset) } : {}),
    ...(blockOffset ? { blockOffset: vector(blockOffset) } : {}),
  }
  return withElevation(withNormal(turned, normal), z)
}

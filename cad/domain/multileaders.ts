import { Vec2, V } from "../geometry/Vec2"
import { normalizeAngle } from "../geometry/primitives"
import {
  createInsert,
  createLine,
  createPolyline,
  createSolid2d,
} from "./entityFactories"
import { entityPointToWorld } from "./elevation"
import { carryOverrides } from "./entityOverrides"
import type {
  Entity,
  MLeaderBranch,
  MLeaderColor,
  MLeaderContent,
  MLeaderEntity,
  MLeaderStyleData,
  MTextAttachment,
} from "./entityTypes"
import { createMText } from "./mtext"
import { createSpline } from "./splines"
import { DEFAULT_TEXT_STYLE_ID } from "./textStyles"
import type { EntityColor } from "./colors"

/**
 * AutoCAD 2027's Standard multileader style in a metric drawing
 * (mleader/m02's MLEADERSTYLE 12E): an MTEXT 4 high on a straight leader,
 * an arrowhead of 4, a landing gap of 2 and a dogleg of 8.
 */
export const STANDARD_MLEADER_STYLE: MLeaderStyleData = {
  name: "Standard",
  content: "mtext",
  path: "straight",
  landing: true,
  landingGap: 2,
  dogleg: true,
  doglegLength: 8,
  arrowSize: 4,
  textStyleId: DEFAULT_TEXT_STYLE_ID,
  textHeight: 4,
  scale: 1,
  annotative: false,
}

/** Where a branch's dogleg ends: its landing and on along its direction. */
export function mleaderDoglegEnd(branch: MLeaderBranch): Vec2 {
  return V.add(branch.landing, V.scale(branch.direction, branch.doglegLength))
}

/**
 * The colour a part of it is drawn in: ByBlock is the object's own, ByLayer
 * (absent) its layer's, which the model holds as no colour at all.
 */
function partColor(
  mleader: MLeaderEntity,
  color: MLeaderColor | undefined
): EntityColor | undefined {
  return color === "ByBlock" ? mleader.color : color
}

/**
 * Everything a multileader draws, in the order EXPLODE leaves it (mleader/
 * m03, v6, v7): its MTEXT or block reference, then each branch's dogleg and
 * each of its leader lines with its arrowhead. A straight leader runs from
 * its arrowhead's base through its vertices to the landing and the dogleg
 * on from there; with the dogleg off it runs on to where the dogleg would
 * end, as a spline always does, the fit spline through the same points,
 * its start along its first segment and its end along the dogleg. The
 * closed filled arrowhead is AutoCAD's 1:6 triangle of the context's size,
 * drawn only when the first segment is at least twice that (v15), as a
 * leader's. Each piece wears the object's layer, linetype and lineweight
 * and the colour of its part (`partColor`).
 */
export function mleaderGeometry(mleader: MLeaderEntity): Entity[] {
  const cached = GEOMETRY.get(mleader)
  if (cached) return cached
  const pieces = drawnPieces(mleader)
  GEOMETRY.set(mleader, pieces)
  return pieces
}

const GEOMETRY = new WeakMap<MLeaderEntity, Entity[]>()

function drawnPieces(mleader: MLeaderEntity): Entity[] {
  let n = 0
  const piece = <T extends Entity>(
    made: T,
    color: MLeaderColor | undefined
  ): T => {
    const { color: own, ...rest } = carryOverrides(mleader, {
      ...made,
      id: `${mleader.id}~${n++}`,
      layerId: mleader.layerId,
    })
    void own
    const shown = partColor(mleader, color)
    return (shown ? { ...rest, color: shown } : rest) as T
  }
  const out: Entity[] = []
  const content = mleader.content
  if (content?.kind === "mtext") {
    out.push(
      piece(
        createMText(content.position, content.contents, {
          height: content.height,
          width: content.width,
          rotation: content.rotation,
          attachment: content.attachment,
          lineSpacingStyle: content.lineSpacingStyle,
          lineSpacingFactor: content.lineSpacingFactor,
          styleId: content.styleId,
        }),
        "ByBlock"
      )
    )
  } else if (content?.kind === "block") {
    out.push(
      piece(
        createInsert(content.blockId, content.position, {
          scaleX: content.scaleX,
          scaleY: content.scaleY,
          rotation: content.rotation,
        }),
        "ByBlock"
      )
    )
  }
  const lineColor = mleader.lineColor
  for (const branch of mleader.branches) {
    const end = mleaderDoglegEnd(branch)
    const doglegDrawn =
      mleader.dogleg && mleader.path !== "spline" && branch.doglegLength > 0
    if (doglegDrawn) {
      out.push(piece(createPolyline([branch.landing, end]), lineColor))
    }
    if (mleader.path === "none") continue
    for (const line of branch.lines) {
      if (line.length === 0) continue
      const tail =
        mleader.path === "spline" || !mleader.dogleg ? [end] : [branch.landing]
      const points = [...line, ...tail]
      const tip = points[0]
      const next = points[1]
      const first = V.distance(tip, next)
      const dir = first > 1e-12 ? V.scale(V.sub(next, tip), 1 / first) : null
      const size = mleader.arrowSize
      const arrowed = dir !== null && size > 0 && first >= 2 * size - 1e-9
      const base = arrowed && dir ? V.add(tip, V.scale(dir, size)) : tip
      if (mleader.path === "spline") {
        const startTangent = dir ?? undefined
        out.push(
          piece(
            createSpline("fit", [base, ...points.slice(1)], {
              knots: "chord",
              ...(startTangent ? { startTangent } : {}),
              endTangent: branch.direction,
            }),
            lineColor
          )
        )
      } else {
        out.push(piece(createPolyline([base, ...points.slice(1)]), lineColor))
      }
      if (arrowed && dir) {
        const half = V.scale(V.perpendicular(dir), size / 6)
        const left = V.add(base, half)
        out.push(
          piece(createSolid2d([V.sub(base, half), tip, left, left]), lineColor)
        )
      }
    }
  }
  return out
}

/**
 * What EXPLODE leaves of a multileader, `pieces` being its geometry: each
 * dogleg a LINE in the WCS, the rest as they are (mleader/m03).
 */
export function mleaderExploded(
  mleader: MLeaderEntity,
  pieces: readonly Entity[],
  newId: () => string
): Entity[] {
  return pieces.map((piece) => {
    if (piece.type !== "polyline" || piece.vertices.length !== 2) {
      return { ...piece, id: newId() }
    }
    const dogleg = mleader.branches.some(
      (branch) =>
        V.equals(branch.landing, piece.vertices[0]) &&
        V.equals(mleaderDoglegEnd(branch), piece.vertices[1])
    )
    if (!dogleg) return { ...piece, id: newId() }
    const { vertices, closed, ...rest } = piece
    void closed
    const line = createLine(
      entityPointToWorld(piece, vertices[0]),
      entityPointToWorld(piece, vertices[1]),
      piece.layerId,
      newId()
    )
    const { type: _t, id: _i, layerId: _l, ...wearing } = rest
    void [_t, _i, _l]
    const { elevation: _e, normal: _n, ...kept } = wearing
    void [_e, _n]
    return { ...line, ...kept }
  })
}

/**
 * The points STRETCH and the grips move (mleader/m06, m07): each leader
 * line's vertices, each landing and each dogleg's end. Its text is none.
 */
export function mleaderStretchPoints(mleader: MLeaderEntity): Vec2[] {
  return mleader.branches.flatMap((branch) => [
    ...branch.lines.flat(),
    branch.landing,
    mleaderDoglegEnd(branch),
  ])
}

/**
 * The multileader as STRETCH leaves it, `caught` telling which of its
 * points the window holds (mleader/m06, m07): a leader line's vertex moves
 * by `delta`; a landing and its dogleg's end caught together move by it;
 * the landing alone moves along the dogleg, which grows to keep its end;
 * the end alone moves along it, the dogleg growing, and the content with
 * it. The content follows the first branch's end; its text is no point of
 * its own. Its plane's origin stays, as AutoCAD's does (m07: 110 kept).
 * `caught` is asked of each point with its index in `mleaderStretchPoints`,
 * so a grip moves its own point alone, whatever lies on it.
 *
 * WHY no dogleg shorter than none: one end dragged past the other would
 * draw nothing there and read back as none from a file (an AutoCAD dogleg
 * is a length, 40); what AutoCAD does then is unprobed.
 */
export function mleaderStretched(
  mleader: MLeaderEntity,
  caught: (point: Vec2, index: number) => boolean,
  delta: Vec2
): MLeaderEntity {
  let shift: Vec2 | null = null
  let index = 0
  const branches = mleader.branches.map((branch, i) => {
    const lines = branch.lines.map((line) =>
      line.map((p) => (caught(p, index++) ? V.add(p, delta) : p))
    )
    const landing = caught(branch.landing, index++)
    const end = caught(mleaderDoglegEnd(branch), index++)
    const along = V.dot(delta, branch.direction)
    const toEnd = Math.min(along, branch.doglegLength)
    const toLanding = Math.max(along, -branch.doglegLength)
    const moved: MLeaderBranch =
      landing && end
        ? { ...branch, landing: V.add(branch.landing, delta) }
        : landing
          ? {
              ...branch,
              landing: V.add(branch.landing, V.scale(branch.direction, toEnd)),
              doglegLength: branch.doglegLength - toEnd,
            }
          : end
            ? { ...branch, doglegLength: branch.doglegLength + toLanding }
            : branch
    if (i === 0 && end) {
      shift = landing ? delta : V.scale(branch.direction, toLanding)
    }
    return { ...moved, lines }
  })
  const by = shift as Vec2 | null
  return {
    ...mleader,
    branches,
    ...(by && mleader.content
      ? {
          content: {
            ...mleader.content,
            position: V.add(mleader.content.position, by),
          },
        }
      : {}),
    ...(by
      ? { kept: { ...mleader.kept, base: V.add(mleader.kept.base, by) } }
      : {}),
  }
}

/**
 * The multileader under the affine map `at`, as AutoCAD's MOVE, ROTATE,
 * SCALE and MIRROR leave it (mleader/m05, m06, m07): every point carried,
 * each dogleg's direction with them, and its sizes — the arrowhead, the
 * landing gap, each dogleg, the text's height and width, the block's
 * factors — scaled by how much the map stretches, its object's own 41 and
 * 42 and its scale left (m05). A map that reflects turns its text back to
 * read as MIRRTEXT 0 reads it (`readsRightward`), left and right swapped
 * when it turns round, and lays it at the same place by its first landing
 * as before, along the dogleg and across the text (m06: about y = 0 the
 * text stays above its landing; about x = 0 it moves to the left, Top
 * Right; about y = x it reads upward). A block reflects as a reference
 * does (m07).
 */
export function mapMLeader(
  mleader: MLeaderEntity,
  at: (point: Vec2) => Vec2
): MLeaderEntity {
  const o = at(V.zero())
  const ex = V.sub(at({ x: 1, y: 0 }), o)
  const ey = V.sub(at({ x: 0, y: 1 }), o)
  const det = ex.x * ey.y - ex.y * ey.x
  // Exactly 1 for a map that keeps sizes, as a probe of it at the origin
  // reads a hair off: MOVE after MOVE would wear them down.
  const measured = Math.sqrt(Math.abs(det))
  const k = Math.abs(measured - 1) < 1e-12 ? 1 : measured
  if (!(k > 0)) return mleader
  const vector = (v: Vec2): Vec2 => V.add(V.scale(ex, v.x), V.scale(ey, v.y))
  const unit = (v: Vec2): Vec2 => V.normalize(vector(v))
  const branches = mleader.branches.map((branch) => ({
    landing: at(branch.landing),
    direction: unit(branch.direction),
    doglegLength: branch.doglegLength * k,
    lines: branch.lines.map((line) => line.map(at)),
  }))
  return {
    ...mleader,
    branches,
    arrowSize: mleader.arrowSize * k,
    landingGap: mleader.landingGap * k,
    ...(mleader.content
      ? { content: mappedContent(mleader, at, vector, det < 0, k, branches[0]) }
      : {}),
    kept: {
      ...mleader.kept,
      base: at(mleader.kept.base),
      planeOrigin: at(mleader.kept.planeOrigin),
    },
  }
}

function mappedContent(
  mleader: MLeaderEntity,
  at: (point: Vec2) => Vec2,
  vector: (v: Vec2) => Vec2,
  reflects: boolean,
  k: number,
  branch: MLeaderBranch | undefined
): MLeaderContent {
  const content = mleader.content as MLeaderContent
  if (content.kind === "block") {
    // The reference's placement composed with the map, as a nested
    // reference's (its rotation and factors read off it).
    const cos = Math.cos(content.rotation)
    const sin = Math.sin(content.rotation)
    const u = vector({ x: cos * content.scaleX, y: sin * content.scaleX })
    const w = vector({ x: -sin * content.scaleY, y: cos * content.scaleY })
    const length = V.length(u)
    const scaleY = (u.x * w.y - u.y * w.x) / length
    // Reflected, its X negated and turned a half turn more, as AutoCAD
    // writes it (m07: about x = 0, 16 is -1,1,1 and 46 stays 0).
    const flips = scaleY < 0
    return {
      ...content,
      position: at(content.position),
      rotation: normalizeAngle(Math.atan2(u.y, u.x) + (flips ? Math.PI : 0)),
      scaleX: flips ? -length : length,
      scaleY: flips ? -scaleY : scaleY,
    }
  }
  const along = vector({
    x: Math.cos(content.rotation),
    y: Math.sin(content.rotation),
  })
  const turned = Math.atan2(along.y, along.x)
  const sized = {
    ...content,
    height: content.height * k,
    width: content.width * k,
  }
  if (!reflects || !branch) {
    return {
      ...sized,
      position: at(content.position),
      rotation: normalizeAngle(turned),
    }
  }
  const backward = readsRightward(content.rotation) !== readsRightward(turned)
  const rotation = normalizeAngle(backward ? turned + Math.PI : turned)
  const source = mleader.branches[0]
  const offset = V.sub(content.position, source.landing)
  const up = (angle: number): Vec2 => ({
    x: -Math.sin(angle),
    y: Math.cos(angle),
  })
  const a = V.dot(offset, source.direction) * k
  const b = V.dot(offset, up(content.rotation)) * k
  const [row, column] = content.attachment
  const swapped = column === "l" ? "r" : column === "r" ? "l" : column
  return {
    ...sized,
    position: V.add(
      branch.landing,
      V.add(V.scale(branch.direction, a), V.scale(up(rotation), b))
    ),
    rotation,
    attachment: (backward
      ? row + swapped
      : content.attachment) as MTextAttachment,
  }
}

/**
 * Below it a reading direction's x counts as none: above the noise of a few
 * angle sums (a text at 90° has an x of 6e-17), far below a real tilt.
 */
const READING_EPSILON = 1e-12

/**
 * Whether a direction reads rightward: its angle, normalised, lies in
 * (−90°, 90°], straight up included and straight down not — the half-plane
 * MIRRTEXT 0 keeps a text in (transforms/p283, p290–p294). It is antipodal,
 * a direction and its opposite always on different sides, which makes two
 * mirrors the identity.
 */
export function readsRightward(angle: number): boolean {
  const x = Math.cos(angle)
  return Math.abs(x) < READING_EPSILON ? Math.sin(angle) > 0 : x > 0
}

/** A multileader of `branches`, the style's sizes, for tests and fragments. */
export function createMLeader(
  branches: readonly MLeaderBranch[],
  options: {
    readonly id: string
    readonly layerId: string
    readonly content?: MLeaderContent
    readonly path?: MLeaderEntity["path"]
    readonly dogleg?: boolean
    readonly style?: MLeaderStyleData
  }
): MLeaderEntity {
  const style = options.style ?? STANDARD_MLEADER_STYLE
  const first = branches[0]
  const base = first ? mleaderDoglegEnd(first) : V.zero()
  return {
    id: options.id,
    type: "mleader",
    layerId: options.layerId,
    branches,
    path: options.path ?? style.path,
    dogleg: options.dogleg ?? style.dogleg,
    arrowSize: style.arrowSize,
    landingGap: style.landingGap,
    ...(options.content ? { content: options.content } : {}),
    lineColor: "ByBlock",
    style,
    kept: {
      base,
      planeOrigin: base,
      scale: 1,
      overrideFlags: 0,
      doglegLength: style.doglegLength,
      arrowSize: style.arrowSize,
      landing: style.landing,
    },
  }
}

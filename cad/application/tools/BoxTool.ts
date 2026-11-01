import { V, Vec2 } from "../../geometry/Vec2"
import { Vec3, length3, sub3 } from "../../geometry/Vec3"
import {
  BoxPrimitive,
  WedgePrimitive,
  createPolyline,
  createSolid,
} from "../../domain/entities"
import {
  ucsDirectionToWorld,
  ucsPointToWorld,
  worldPointToUcs,
} from "../../domain/ucs"
import { AddEntityCommand } from "../commands/entityCommands"
import {
  isCoordinateExpression,
  parseCoordinate,
} from "../input/coordinateInput"
import { ScenePrimitive } from "../../scene/types"
import { entityScenePrimitive } from "../SceneBuilder"
import type { MessageId } from "../EngineText"
import type { PromptId } from "../../locales/types"
import {
  CommandOption,
  CommandOptionOutcome,
  KeyInput,
  PointerInput,
  QuestionInput,
  Tool,
  ToolContext,
  ToolQuestion,
} from "./Tool"
import { currentColor, withCurrentProperties } from "./currentProperties"
import {
  SolidDefaults,
  resetSolidDefaults,
  solidDefaults,
} from "./solidDefaults"

/**
 * Where the solid's footprint lies, in the UCS: its centre, the way its
 * length runs (a wedge's slope runs down that way), its sides, and the Z it
 * rises from — a corner's, or the centre's when the solid is centred on it in
 * height too.
 */
interface Footprint {
  readonly center: Vec2
  readonly along: Vec2
  readonly length: number
  readonly width: number
  readonly z: number
  readonly centered: boolean
}

type Mode = "corner" | "center"

type BoxToolState =
  | { readonly phase: "first" }
  | { readonly phase: "center" }
  /** The other corner, or the corner from the centre, and Cube's and Length's length. */
  | {
      readonly phase: "other" | "cube" | "length"
      readonly mode: Mode
      readonly base: Vec3
      readonly cursor: Vec3
    }
  | {
      readonly phase: "width"
      readonly mode: Mode
      readonly base: Vec3
      readonly along: Vec2
      readonly length: number
      readonly cursor: Vec3
    }
  | {
      readonly phase: "height" | "twoFirst"
      readonly footprint: Footprint
      readonly from: Vec3
      readonly cursor: Vec3
    }
  | {
      readonly phase: "twoSecond"
      readonly footprint: Footprint
      readonly from: Vec3
      readonly first: Vec3
      readonly cursor: Vec3
    }

const PREVIEW_ID = "box-preview"
const UCS_X: Vec2 = { x: 1, y: 0 }
const UCS_Y: Vec2 = { x: 0, y: 1 }

/** The solid BOX makes, or WEDGE, which asks the same. */
export type BlockKind = "box" | "wedge"

const ZERO_LENGTH: Record<BlockKind, MessageId> = {
  box: "boxZeroLength",
  wedge: "wedgeZeroLength",
}
const ZERO_WIDTH: Record<BlockKind, MessageId> = {
  box: "boxZeroWidth",
  wedge: "wedgeZeroWidth",
}

/**
 * AutoCAD's BOX, as 2027's console asks it (solid/p01–p13), and WEDGE, which
 * asks the same (w01–w09): `Specify first corner or [Center]:`, then `Specify
 * other corner or [Cube/Length]:` and `Specify height or [2Point]:`. Center
 * asks `Specify center:` and `Specify corner or [Cube/Length]:`, the solid
 * then centred on it in height too; a negative cube or length is twice as
 * long about it (w09, x07). A corner at another Z sets the height without
 * asking it (p06, p13). The height rises along the UCS's Z, down when
 * negative; a point gives its distance (p06, p10). BOX's cube and length turn
 * towards the cursor or the point given (p03), its width to their side, a
 * typed width's sign unread (p10); WEDGE's run along the UCS's X and its width
 * along its Y, back when typed negative, a point giving the distance alone
 * (w08). A wedge's tall end is at the first corner, or opposite the corner
 * given from its centre (w02, w09). The defaults are the primitives' shared
 * ones ({@link SolidDefaults}).
 */
export class BoxTool implements Tool {
  readonly id: BlockKind

  private state: BoxToolState = { phase: "first" }
  private lastScreen: Vec2 | null = null

  constructor(
    private readonly kind: BlockKind = "box",
    private readonly defaults: SolidDefaults = solidDefaults()
  ) {
    this.id = kind
  }

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    ctx.selection.clear()
    this.state = { phase: "first" }
    this.openPoint(ctx, "boxFirstCornerOr")
  }

  onDeactivate(ctx: ToolContext): void {
    this.state = { phase: "first" }
    ctx.dynamicInput.close()
  }

  onNewDrawing(): void {
    resetSolidDefaults(this.defaults)
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen
    if (this.state.phase !== "first" && this.state.phase !== "center") {
      this.state = { ...this.state, cursor: input.point }
    }
    ctx.dynamicInput.setPosition(input.screen)
    ctx.requestRender()
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0) return
    const state = this.state
    // The other corner is dragged in the first's plane; a snap keeps its own Z.
    this.takePoint(
      state.phase === "other" && !input.snap
        ? { ...input.point, z: state.base.z }
        : input.point,
      ctx
    )
  }

  onKeyDown(input: KeyInput, ctx: ToolContext): void {
    if (input.key === "Escape") {
      this.state = { phase: "first" }
      ctx.dynamicInput.close()
      ctx.requestRender()
    }
  }

  question(): PromptId | ToolQuestion {
    const state = this.state
    const { length, width, height } = this.defaults
    switch (state.phase) {
      case "first":
        return "boxFirstCornerOr"
      case "center":
        return "boxCenter"
      case "other":
        return state.mode === "center" ? "boxCornerOr" : "boxOtherCornerOr"
      case "cube":
      case "length":
        return length === null
          ? "boxLength"
          : { id: "boxLength", enter: length }
      case "width":
        return width === null ? "boxWidth" : { id: "boxWidth", enter: width }
      case "height":
        return height === null
          ? "boxHeightOr"
          : { id: "boxHeightOr", enter: height }
      case "twoFirst":
        return "specifyFirstPoint"
      case "twoSecond":
        return "specifySecondPoint"
    }
  }

  /**
   * Every point prompt says `Point or option keyword required.`, those with
   * no keyword too; every distance `…second point, or option keyword.`, the
   * width's too (p05).
   */
  takes(): QuestionInput | null {
    switch (this.state.phase) {
      case "center":
      case "twoFirst":
      case "twoSecond":
        return { refusal: "pointOrKeywordRequired" }
      case "cube":
      case "length":
      case "width":
      case "height":
        return {
          refusal: "requiresDistance",
          values: { points: "second", keyword: "yes" },
        }
      default:
        return null
    }
  }

  commandOptions(): readonly CommandOption[] {
    switch (this.state.phase) {
      case "first":
        return [{ id: "Center" }]
      case "other":
        return [{ id: "Cube" }, { id: "Length" }]
      case "height":
        return [{ id: "2Point" }]
      default:
        return []
    }
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    const state = this.state
    if (state.phase === "first" && id === "Center") {
      this.state = { phase: "center" }
      this.openPoint(ctx, "boxCenter")
      return "continue"
    }
    if (state.phase === "other" && (id === "Cube" || id === "Length")) {
      this.state = { ...state, phase: id === "Cube" ? "cube" : "length" }
      this.openDistance(ctx, this.defaults.length)
      return "continue"
    }
    if (state.phase === "height" && id === "2Point") {
      this.state = { ...state, phase: "twoFirst" }
      this.openPoint(ctx, "specifyFirstPoint")
      return "continue"
    }
    return "unhandled"
  }

  wantsSnap(): boolean {
    return true
  }

  getConstraintAnchor(): Vec3 | null {
    const state = this.state
    switch (state.phase) {
      case "other":
      case "cube":
      case "length":
        return state.base
      case "width":
        return this.widthBase(state)
      case "height":
        return state.from
      case "twoSecond":
        return state.first
      default:
        return null
    }
  }

  /** The footprint as the cursor stretches it, then the solid as its height does. */
  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    const state = this.state
    const stroke = { color: currentColor(ctx), width: 1 }
    if (state.phase === "other") {
      const footprint = this.cornerFootprint(
        state.mode,
        state.base,
        state.cursor,
        ctx
      )
      if (!footprint) return []
      const outline = createPolyline(
        footprintCorners(footprint).map((p) =>
          ucsPointToWorld(ctx.ucs, { ...p, z: footprint.z })
        ),
        true,
        ctx.document.getCurrentLayerId(),
        undefined,
        PREVIEW_ID
      )
      return entityScenePrimitive(ctx.viewport, outline, stroke)
    }
    if (state.phase === "height") {
      const height = length3(sub3(state.cursor, state.from))
      if (!(height > 0)) return []
      const solid = createSolid(
        this.primitive(state.footprint, height, ctx),
        ctx.document.getCurrentLayerId(),
        PREVIEW_ID
      )
      return entityScenePrimitive(ctx.viewport, solid, stroke)
    }
    return []
  }

  private takePoint(point: Vec3, ctx: ToolContext): void {
    const state = this.state
    switch (state.phase) {
      case "first":
      case "center":
        this.state = {
          phase: "other",
          mode: state.phase === "first" ? "corner" : "center",
          base: point,
          cursor: point,
        }
        this.openPoint(
          ctx,
          state.phase === "first" ? "boxOtherCornerOr" : "boxCornerOr"
        )
        return
      case "other":
        this.takeCorner(point, ctx)
        return
      case "cube":
      case "length":
        this.takeLength(this.distanceTo(state.base, point), point, ctx)
        return
      case "width":
        this.takeWidth(
          this.distanceTo(this.widthBase(state), point),
          point,
          ctx
        )
        return
      case "height":
        this.takeHeight(this.distanceTo(state.from, point), ctx)
        return
      case "twoFirst":
        this.state = { ...state, phase: "twoSecond", first: point }
        this.openPoint(ctx, "specifySecondPoint")
        return
      case "twoSecond": {
        const height = this.distanceTo(state.first, point)
        if (height === 0) {
          // Asked again at the second point (p12).
          ctx.report(ctx.text.message("boxValueNonzero"), "error")
          return
        }
        this.commit(state.footprint, height, ctx)
        return
      }
    }
  }

  private distanceTo(from: Vec3, to: Vec3): number {
    return length3(sub3(to, from))
  }

  /**
   * The other corner: a footprint on the UCS's axes, refused with no length
   * or width (p06); one at another Z than the first gives the height too.
   */
  private takeCorner(point: Vec3, ctx: ToolContext): void {
    if (this.state.phase !== "other") return
    const { mode, base } = this.state
    const from = worldPointToUcs(ctx.ucs, base)
    const to = worldPointToUcs(ctx.ucs, point)
    if (Math.abs(to.x - from.x) === 0) {
      ctx.report(ctx.text.message(ZERO_LENGTH[this.kind]), "error")
      return
    }
    if (Math.abs(to.y - from.y) === 0) {
      ctx.report(ctx.text.message(ZERO_WIDTH[this.kind]), "error")
      return
    }
    const footprint = this.cornerFootprint(mode, base, point, ctx)
    if (!footprint) return
    const rise = to.z - from.z
    if (rise !== 0) {
      this.commit(footprint, mode === "center" ? 2 * rise : rise, ctx)
      return
    }
    this.askHeight(footprint, point, ctx)
  }

  /**
   * A box's footprint runs along the UCS's X; a wedge's slopes down away
   * from the first corner, or towards the corner given from its centre (w09).
   */
  private cornerFootprint(
    mode: Mode,
    base: Vec3,
    corner: Vec3,
    ctx: ToolContext
  ): Footprint | null {
    const from = worldPointToUcs(ctx.ucs, base)
    const to = worldPointToUcs(ctx.ucs, corner)
    const dx = Math.abs(to.x - from.x)
    const dy = Math.abs(to.y - from.y)
    if (dx === 0 || dy === 0) return null
    const centered = mode === "center"
    const back = this.kind === "wedge" && to.x < from.x
    return {
      center: centered ? from : V.lerp(from, to, 0.5),
      along: back ? V.scale(UCS_X, -1) : UCS_X,
      length: centered ? 2 * dx : dx,
      width: centered ? 2 * dy : dy,
      z: from.z,
      centered,
    }
  }

  /**
   * Cube's or Length's length: typed, BOX's along the cursor, WEDGE's along
   * the UCS's X, either backwards when negative (p10, w08); a point, its
   * distance, BOX's towards it (p03). From the centre a negative one is twice
   * as long (w09, x07). The length made is the next one offered (p10).
   */
  private takeLength(length: number, toward: Vec3, ctx: ToolContext): void {
    const state = this.state
    if (state.phase !== "cube" && state.phase !== "length") return
    if (length === 0) {
      ctx.report(ctx.text.message(ZERO_LENGTH[this.kind]), "error")
      return
    }
    const base = worldPointToUcs(ctx.ucs, state.base)
    const aim = worldPointToUcs(ctx.ucs, toward)
    const heading = V.sub(aim, base)
    const along0 =
      this.kind === "box" && V.length(heading) > 0
        ? V.normalize(heading)
        : UCS_X
    const along = length < 0 ? V.scale(along0, -1) : along0
    const centered = state.mode === "center"
    const size = Math.abs(length) * (centered && length < 0 ? 2 : 1)
    this.defaults.length = size
    if (state.phase === "length") {
      this.state = {
        phase: "width",
        mode: state.mode,
        base: state.base,
        along,
        length: size,
        cursor: state.cursor,
      }
      this.openDistance(ctx, this.defaults.width)
      return
    }
    // A box's cube is wide to the left of its length (p03, p10); a wedge's
    // towards the UCS's Y, or back with a negative one, as its width is.
    const side =
      this.kind === "box"
        ? V.perpendicular(along)
        : V.scale(UCS_Y, Math.sign(length))
    const footprint: Footprint = {
      center: centered
        ? base
        : V.add(base, V.scale(V.add(along, side), size / 2)),
      along,
      length: size,
      width: size,
      z: base.z,
      centered,
    }
    this.commit(footprint, size, ctx)
  }

  /** Where the width is measured from: the length's far end (its prompt's base point, p02). */
  private widthBase(state: Extract<BoxToolState, { phase: "width" }>): Vec3 {
    const reach = state.mode === "center" ? state.length / 2 : state.length
    const end = V.add(state.base, V.scale(state.along, reach))
    return { ...end, z: state.base.z }
  }

  /**
   * Length's width. BOX's lies on the side of the length the cursor or the
   * point is, the right one with the cursor on its line: what a typed length
   * always leaves in the console, whose cursor gave the length its heading
   * (p03, p10); a typed width's sign is not read (p10's -5). WEDGE's lies
   * towards the UCS's Y, back when typed negative, a point giving its
   * distance alone (w08).
   */
  private takeWidth(width: number, toward: Vec3, ctx: ToolContext): void {
    const state = this.state
    if (state.phase !== "width") return
    if (width === 0) {
      ctx.report(ctx.text.message(ZERO_WIDTH[this.kind]), "error")
      return
    }
    const size = Math.abs(width)
    this.defaults.width = size
    const base = worldPointToUcs(ctx.ucs, state.base)
    let side: Vec2
    if (this.kind === "wedge") {
      side = V.scale(UCS_Y, Math.sign(width))
    } else {
      const aim = worldPointToUcs(ctx.ucs, toward)
      const left = V.cross(state.along, V.sub(aim, base)) > 0
      side = V.scale(V.perpendicular(state.along), left ? 1 : -1)
    }
    const centered = state.mode === "center"
    const footprint: Footprint = {
      center: centered
        ? base
        : V.add(
            V.add(base, V.scale(state.along, state.length / 2)),
            V.scale(side, size / 2)
          ),
      along: state.along,
      length: state.length,
      width: size,
      z: base.z,
      centered,
    }
    this.askHeight(footprint, this.widthBase(state), ctx)
  }

  private askHeight(footprint: Footprint, from: Vec3, ctx: ToolContext): void {
    this.state = { phase: "height", footprint, from, cursor: from }
    this.openDistance(ctx, this.defaults.height)
    ctx.requestRender()
  }

  /** `Value must be nonzero.` for none, and the prompt asked again (p06). */
  private takeHeight(height: number, ctx: ToolContext): void {
    if (this.state.phase !== "height") return
    if (height === 0) {
      ctx.report(ctx.text.message("boxValueNonzero"), "error")
      return
    }
    this.commit(this.state.footprint, height, ctx)
  }

  private primitive(
    footprint: Footprint,
    height: number,
    ctx: ToolContext
  ): BoxPrimitive | WedgePrimitive {
    const up = Math.sign(height)
    // Centred, its base is half its height back from the centre (p13).
    const z = footprint.centered ? footprint.z - height / 2 : footprint.z
    const toWorld = (d: Vec2 | Vec3) => {
      const w = ucsDirectionToWorld(ctx.ucs, d)
      const n = length3(w)
      return { x: w.x / n, y: w.y / n, z: w.z / n }
    }
    return {
      kind: this.kind,
      position: ucsPointToWorld(ctx.ucs, { ...footprint.center, z }),
      xAxis: toWorld(footprint.along),
      normal: toWorld({ x: 0, y: 0, z: up }),
      length: footprint.length,
      width: footprint.width,
      height: Math.abs(height),
    }
  }

  private commit(footprint: Footprint, height: number, ctx: ToolContext): void {
    this.defaults.height = height
    const solid = createSolid(
      this.primitive(footprint, height, ctx),
      ctx.document.getCurrentLayerId()
    )
    this.state = { phase: "first" }
    ctx.execute(new AddEntityCommand(withCurrentProperties(solid, ctx)))
    ctx.endCommand()
  }

  private openPoint(ctx: ToolContext, prompt: PromptId): void {
    ctx.dynamicInput.open({
      fields: [{ id: "point", prompt, kind: "coordinate" }],
      commit: () => {},
      commitRaw: (commitCtx) => this.commitTypedPoint(commitCtx),
    })
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }

  /**
   * A distance's box, `<default>` the last one given if any: a number typed
   * is the value, a coordinate a point measured from the prompt's base, and
   * Enter takes the default or is refused as `FOO` is (p04, p11) — but at
   * WEDGE's width, where it is a width of 0 (w04).
   */
  private openDistance(ctx: ToolContext, value: number | null): void {
    const prompt = this.question()
    ctx.dynamicInput.open({
      fields: [
        {
          id: "value",
          prompt: typeof prompt === "string" ? prompt : prompt.id,
          kind: "distance",
        },
      ],
      commit: (values, commitCtx) => {
        if (Number.isFinite(values.value))
          this.takeValue(values.value, commitCtx)
      },
      commitRaw: (commitCtx) => {
        if (commitCtx.dynamicInput.hasTypedText()) {
          return this.commitTypedPoint(commitCtx)
        }
        if (this.kind === "wedge" && this.state.phase === "width") {
          commitCtx.report(
            commitCtx.text.message(ZERO_WIDTH[this.kind]),
            "error"
          )
          return true
        }
        commitCtx.report(
          commitCtx.text.message("requiresDistance", {
            points: "second",
            keyword: "yes",
          }),
          "error"
        )
        return true
      },
    })
    if (value !== null) ctx.dynamicInput.setDefault("value", value)
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }

  /** A typed length, width or height. */
  private takeValue(value: number, ctx: ToolContext): void {
    const state = this.state
    switch (state.phase) {
      case "cube":
      case "length":
        this.takeLength(value, state.cursor, ctx)
        return
      case "width":
        this.takeWidth(value, state.cursor, ctx)
        return
      case "height":
        this.takeHeight(value, ctx)
        return
    }
  }

  /** A coordinate typed at any prompt is the point it names; Enter at a point is refused (p11). */
  private commitTypedPoint(ctx: ToolContext): boolean {
    const field = ctx.dynamicInput.getActiveFieldId()
    const text = field === null ? "" : ctx.dynamicInput.getText(field).trim()
    if (!ctx.dynamicInput.hasTypedText()) {
      ctx.report(ctx.text.message("pointOrKeywordRequired"), "error")
      return true
    }
    if (!isCoordinateExpression(text)) return false
    const base = this.getConstraintAnchor()
    const state = this.state
    const point = parseCoordinate(text, {
      lastPoint: base ?? ctx.lastPoint,
      relativeByDefault: base !== null,
      ucs: ctx.ucs,
      // An other corner with no Z lies at the first's (p07: 50,0,3, then
      // 60,20 still asks the height).
      elevation:
        state.phase === "other"
          ? worldPointToUcs(ctx.ucs, state.base).z
          : ctx.elevation,
    })
    if (!point) return false
    this.takePoint(point, ctx)
    return true
  }
}

/** The footprint's corners in the UCS, round from its first. */
function footprintCorners(footprint: Footprint): Vec2[] {
  const u = V.scale(footprint.along, footprint.length / 2)
  const v = V.scale(V.perpendicular(footprint.along), footprint.width / 2)
  const c = footprint.center
  return [
    V.sub(V.sub(c, u), v),
    V.sub(V.add(c, u), v),
    V.add(V.add(c, u), v),
    V.add(V.sub(c, u), v),
  ]
}

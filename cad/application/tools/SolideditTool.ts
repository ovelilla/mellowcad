import { Vec2 } from "../../geometry/Vec2"
import {
  Vec3,
  add3,
  cross3,
  dot3,
  normalize3,
  scale3,
  sub3,
} from "../../geometry/Vec3"
import { facesAlong } from "../../geometry/hiddenLines"
import { FacePlane } from "../../geometry/solidEdits"
import { EntityId, Solid3dEntity } from "../../domain/entities"
import {
  FaceEdit,
  copiedFaces,
  solidFacesEdited,
} from "../../domain/solidModeling"
import { subobjectEdgeEntities } from "../../domain/solidSubobjects"
import {
  AddEntitiesCommand,
  UpdateEntitiesCommand,
} from "../commands/entityCommands"
import {
  isCoordinateExpression,
  parseCoordinate,
} from "../input/coordinateInput"
import type { PromptId } from "../../locales/types"
import { ScenePrimitive } from "../../scene/types"
import { THEME } from "../../scene/theme"
import { entityScenePrimitive, selectionGlow } from "../SceneBuilder"
import { withCurrentProperties } from "./currentProperties"
import {
  CommandOption,
  CommandOptionOutcome,
  PointerInput,
  QuestionInput,
  RibbonMacro,
  Tool,
  ToolContext,
  ToolQuestion,
} from "./Tool"

/** The face options built here, by their global keyword. */
export type FaceOption =
  "Extrude" | "Move" | "Rotate" | "Offset" | "Taper" | "Delete" | "Copy"

/** How a rotation's axis is given: two points, or a UCS axis or the view's through an origin. */
type AxisBy = "2points" | "Xaxis" | "Yaxis" | "Zaxis" | "View"

type SolideditState =
  | { readonly phase: "solids" }
  | { readonly phase: "faces" }
  | {
      readonly phase: "select"
      readonly option: FaceOption
      readonly removing: boolean
      readonly hover: { readonly id: EntityId; readonly face: number } | null
    }
  | { readonly phase: "height" }
  | { readonly phase: "taper"; readonly height: number }
  | { readonly phase: "base"; readonly option: "Move" | "Copy" }
  | {
      readonly phase: "second"
      readonly option: "Move" | "Copy"
      readonly base: Vec3
    }
  | { readonly phase: "axis" }
  | { readonly phase: "axisFirst" }
  | { readonly phase: "axisSecond"; readonly first: Vec3 }
  | { readonly phase: "origin"; readonly by: Exclude<AxisBy, "2points"> }
  | { readonly phase: "angle"; readonly from: Vec3; readonly axis: Vec3 }
  | { readonly phase: "offset" }
  | { readonly phase: "taperBase" }
  | { readonly phase: "taperAxis"; readonly base: Vec3 }
  | { readonly phase: "taperAngle"; readonly base: Vec3; readonly axis: Vec3 }

const OPTIONS: readonly string[] = [
  "Extrude",
  "Move",
  "Rotate",
  "Offset",
  "Taper",
  "Delete",
  "Copy",
  "coLor",
  "mAterial",
  "Undo",
  "eXit",
]

const DEGREE = Math.PI / 180

/**
 * AutoCAD's SOLIDEDIT, its faces (solidedit/e01–e12, en, es and pt-BR): it
 * says `Solids editing automatic checking:  SOLIDCHECK=1` and asks `Enter a
 * solids editing option [Face/Edge/Body/Undo/eXit] <eXit>:`; Face asks
 * `Enter a face editing option [Extrude/Move/Rotate/Offset/Taper/Delete/
 * Copy/coLor/mAterial/Undo/eXit] <eXit>:` and each option `Select faces or
 * [Undo/Remove]:` (`… /ALL]` once one is taken, `Remove faces or
 * [Undo/Add/ALL]:` after Remove), a click or a typed point taking the face
 * nearest the viewer under it (`1 face found.`, `1 face found, 1
 * removed.`), ALL every face of the solid (`6 faces found.`, e11). Then:
 * Extrude `Specify height of extrusion or [Path]:` and `Specify angle of
 * taper for extrusion <0>:`, the face's prism added or taken, narrowing as
 * it rises (e08); Move `Specify a base point or displacement:` and `Specify
 * a second point of displacement:` (e06); Rotate an axis by two points, the
 * UCS's X, Y or Z or the view's through `Specify the origin of the rotation
 * <0,0,0>:`, then `Specify a rotation angle or [Reference]:` (e07); Offset
 * `Specify the offset distance:` (e01–e05); Taper `Specify the base
 * point:`, `Specify another point along the axis of tapering:` and
 * `Specify the taper angle:`, the face turned about where it meets the plane
 * square to the axis through the base point, inwards for a positive angle
 * (e08, e12); Delete closes a hole or a fillet's or a chamfer's strip (e09);
 * Copy a planar face into a region (e10). Each edit says `Solid validation
 * started.` and `Solid validation completed.`, or AutoCAD's modelling error
 * with the solid left as it was, and asks for the next option; Undo there
 * takes the last back; eXit or Enter leaves Face, then the command. The
 * rail's buttons are its face options answered (acad.cuix `_solidedit _face
 * _extrude`…). One undo step, `SOLIDEDIT` (filletedge/f07).
 *
 * WHY Edge, Body, coLor, mAterial, Path, Axis by object and Reference are
 * offered and refused: their words are AutoCAD's prompts', the options not
 * built here (coLor needs a colour per face, which no solid holds yet).
 */
export class SolideditTool implements Tool {
  readonly id: string

  private state: SolideditState = { phase: "solids" }
  private solid: EntityId | null = null
  private faces: number[] = []
  /** The history's depth before each edit of this run, for its Undo. */
  private marks: number[] = []
  private lastScreen: Vec2 | null = null

  constructor(private readonly start: FaceOption | null = null) {
    this.id = start ? `solidedit${start.toLowerCase()}` : "solidedit"
  }

  /** A rail button's macro: SOLIDEDIT answered Face and its option (acad.cuix ID_FaceExtru…). */
  ribbonMacro(): RibbonMacro | null {
    return this.start
      ? {
          command: "SOLIDEDIT",
          answers: ["_face", `_${this.start.toLowerCase()}`],
        }
      : null
  }

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    ctx.selection.clear()
    this.marks = []
    this.toSolids(ctx)
  }

  onDeactivate(ctx: ToolContext): void {
    this.state = { phase: "solids" }
    this.solid = null
    this.faces = []
    ctx.dynamicInput.close()
  }

  question(): PromptId | ToolQuestion {
    const state = this.state
    switch (state.phase) {
      case "solids":
        return "solideditOption"
      case "faces":
        return "solideditFaceOption"
      case "select":
        return state.removing ? "removeFacesOr" : "selectFacesOr"
      case "height":
        return "solideditHeightOr"
      case "taper":
        return { id: "solideditExtrudeTaper", enter: { angle: 0 } }
      case "base":
        return "solideditBase"
      case "second":
        return "solideditSecond"
      case "axis":
        return "solideditAxisOr"
      case "axisFirst":
        return "solideditAxisFirst"
      case "axisSecond":
        return "solideditAxisSecond"
      case "origin":
        return { id: "solideditOrigin", enter: { name: "0,0,0" } }
      case "angle":
        return "solideditAngleOr"
      case "offset":
        return "solideditOffset"
      case "taperBase":
        return "solideditTaperBase"
      case "taperAxis":
        return "solideditTaperAxis"
      case "taperAngle":
        return "solideditTaperAngle"
    }
  }

  defaultOption(): string | null {
    const phase = this.state.phase
    if (phase === "solids" || phase === "faces") return "eXit"
    if (phase === "axis") return "2points"
    return null
  }

  takes(): QuestionInput | null {
    const state = this.state
    switch (state.phase) {
      case "solids":
      case "faces":
        return "keyword"
      case "select":
        return {
          refusal: ["invalidSelection", "expectsPointOr"],
          keywords: {
            ids: state.removing
              ? ["Crossing", "Fence", "CPolygon", "Undo", "Add"]
              : ["Crossing", "Fence", "CPolygon", "Undo"],
          },
        }
      case "height":
      case "offset":
        return {
          refusal: "requiresDistance",
          values: {
            points: "two",
            keyword: state.phase === "height" ? "yes" : "no",
          },
        }
      case "taper":
      case "taperAngle":
        return {
          refusal: "requiresAngle",
          values: { points: "two", keyword: "no" },
        }
      case "angle":
        return {
          refusal: "requiresAngle",
          values: { points: "second", keyword: "yes" },
        }
      case "base":
        return { refusal: "invalidPoint" }
      case "axis":
        return { refusal: "pointOrKeywordRequired" }
      default:
        return null
    }
  }

  commandOptions(): readonly CommandOption[] {
    const state = this.state
    switch (state.phase) {
      case "solids":
        return ["Face", "Edge", "Body", "Undo", "eXit"].map((id) => ({ id }))
      case "faces":
        return OPTIONS.map((id) => ({ id }))
      case "select":
        return [
          { id: "Undo" },
          { id: state.removing ? "Add" : "Remove" },
          ...(this.faces.length > 0 || state.removing ? [{ id: "ALL" }] : []),
        ]
      case "height":
        return [{ id: "Path" }]
      case "axis":
        // <2points> is Enter's: declared, not listed (22328, 22329).
        return [
          ...["Axis", "View", "Xaxis", "Yaxis", "Zaxis"].map((id) => ({ id })),
          { id: "2points", hidden: true },
        ]
      case "angle":
        return [{ id: "Reference" }]
      default:
        return []
    }
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    const state = this.state
    switch (state.phase) {
      case "solids":
        if (id === "Face") {
          this.toFaces(ctx)
          return "continue"
        }
        if (id === "Undo") {
          this.undoOne(ctx)
          this.toSolids(ctx)
          return "continue"
        }
        if (id === "eXit") {
          ctx.dynamicInput.close()
          return "end"
        }
        return "unhandled"
      case "faces":
        if (id === "Undo") {
          this.undoOne(ctx)
          this.toFaces(ctx)
          return "continue"
        }
        if (id === "eXit") {
          this.toSolids(ctx)
          return "continue"
        }
        if (isBuilt(id)) {
          this.faces = []
          this.solid = null
          this.state = {
            phase: "select",
            option: id,
            removing: false,
            hover: null,
          }
          this.openPick(ctx)
          return "continue"
        }
        return "unhandled"
      case "select":
        if (id === "Remove" || id === "Add") {
          this.state = { ...state, removing: id === "Remove" }
          this.openPick(ctx)
          return "continue"
        }
        if (id === "Undo") {
          this.faces.pop()
          if (this.faces.length === 0) this.solid = null
          this.openPick(ctx)
          return "continue"
        }
        if (id === "ALL") {
          this.takeAll(state.removing, ctx)
          return "continue"
        }
        return "unhandled"
      case "axis":
        if (id === "2points") {
          this.ask({ phase: "axisFirst" }, ctx)
          return "continue"
        }
        if (
          id === "Xaxis" ||
          id === "Yaxis" ||
          id === "Zaxis" ||
          id === "View"
        ) {
          this.ask({ phase: "origin", by: id }, ctx)
          return "continue"
        }
        return "unhandled"
      default:
        return "unhandled"
    }
  }

  onEnter(ctx: ToolContext): boolean {
    const state = this.state
    switch (state.phase) {
      case "solids":
        ctx.dynamicInput.close()
        return false
      case "faces":
        this.toSolids(ctx)
        return true
      case "select":
        this.closeFaces(state.option, ctx)
        return true
      case "taper":
        this.apply({ kind: "extrude", height: state.height, taper: 0 }, ctx)
        return true
      case "second":
        // Enter takes the base point as the displacement, MOVE's way.
        this.moved(state.option, state.base, ctx)
        return true
      case "axis":
        this.ask({ phase: "axisFirst" }, ctx)
        return true
      case "origin":
        this.toAngle(state.by, { x: 0, y: 0, z: 0 }, ctx)
        return true
      default:
        return false
    }
  }

  /** WHY no snap at a face's pick: the click takes a face, not a point. */
  wantsSnap(): boolean {
    const phase = this.state.phase
    return (
      phase === "base" ||
      phase === "second" ||
      phase === "axisFirst" ||
      phase === "axisSecond" ||
      phase === "origin" ||
      phase === "taperBase" ||
      phase === "taperAxis"
    )
  }

  getConstraintAnchor(): Vec3 | null {
    const state = this.state
    if (state.phase === "second") return state.base
    if (state.phase === "axisSecond") return state.first
    if (state.phase === "taperAxis") return state.base
    return null
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen
    const state = this.state
    if (state.phase === "select") {
      const found = this.faceAt(input.screen, ctx)
      this.state = {
        ...state,
        hover: found && { id: found.solid.id, face: found.face },
      }
    }
    ctx.dynamicInput.setPosition(input.screen)
    ctx.requestRender()
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0) return
    const state = this.state
    if (state.phase === "select") {
      this.pickFace(input.screen, ctx)
      return
    }
    if (this.wantsSnap()) this.takePoint(input.point, ctx)
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    const out: ScenePrimitive[] = []
    const state = this.state
    const solid = this.solidOf(ctx)
    if (solid) {
      for (const face of this.faces) {
        for (const edge of subobjectEdgeEntities(solid, {
          kind: "face",
          index: face,
        })) {
          out.push(
            ...selectionGlow(ctx.viewport, edge, {
              color: THEME.entity,
              width: 1,
            })
          )
        }
      }
    }
    if (state.phase === "select" && state.hover) {
      const owner = ctx.document.get(state.hover.id)
      if (owner?.type === "solid3d") {
        for (const edge of subobjectEdgeEntities(owner, {
          kind: "face",
          index: state.hover.face,
        })) {
          out.push(
            ...entityScenePrimitive(ctx.viewport, edge, {
              color: THEME.entityHover,
              width: 2,
            })
          )
        }
      }
    }
    return out
  }

  private solidOf(ctx: ToolContext): Solid3dEntity | null {
    if (!this.solid) return null
    const entity = ctx.document.get(this.solid)
    return entity?.type === "solid3d" ? entity : null
  }

  private toSolids(ctx: ToolContext): void {
    ctx.report(ctx.text.message("solideditChecking"))
    this.state = { phase: "solids" }
    this.openKeywords(ctx)
  }

  private toFaces(ctx: ToolContext): void {
    this.state = { phase: "faces" }
    this.faces = []
    this.solid = null
    this.openKeywords(ctx)
  }

  /** Undo at an option prompt: the last edit of this run taken back. */
  private undoOne(ctx: ToolContext): void {
    const mark = this.marks.pop()
    if (mark !== undefined) ctx.undoTo(mark)
  }

  /** The face nearest the viewer under `screen`, of an editable solid. */
  private faceAt(
    screen: Vec2,
    ctx: ToolContext
  ): { solid: Solid3dEntity; face: number } | null {
    const { viewport, document } = ctx
    const sight = viewport.screenToFacing(screen)
    let best: { solid: Solid3dEntity; face: number; depth: number } | null =
      null
    for (const entity of document.getEntities()) {
      if (entity.type !== "solid3d") continue
      if (
        !document.isEntityVisible(entity) ||
        !document.isEntityEditable(entity)
      ) {
        continue
      }
      const [front] = facesAlong(entity.brep, sight, viewport.direction)
      if (front && (!best || front.depth > best.depth)) {
        best = { solid: entity, face: front.face, depth: front.depth }
      }
    }
    return best && { solid: best.solid, face: best.face }
  }

  private pickFace(screen: Vec2, ctx: ToolContext): void {
    const state = this.state
    if (state.phase !== "select") return
    const found = this.faceAt(screen, ctx)
    // WHY a pick on nothing or another solid passes: what AutoCAD answers
    // to either is unverified (its console's misses say `No solids
    // detected.` only before ZOOM E, e12).
    if (!found || (this.solid && found.solid.id !== this.solid)) return
    if (state.removing) {
      const had = this.faces.includes(found.face)
      this.faces = this.faces.filter((f) => f !== found.face)
      ctx.report(
        ctx.text.message("facesFoundRemoved", {
          count: 1,
          removed: had ? 1 : 0,
        })
      )
    } else {
      if (!this.faces.includes(found.face)) this.faces.push(found.face)
      this.solid = found.solid.id
      ctx.report(ctx.text.message("facesFound", { count: 1 }))
    }
    if (this.faces.length === 0) this.solid = null
    this.openPick(ctx)
  }

  /** ALL: every face of the solid taken (e11: `6 faces found.` beside the one picked). */
  private takeAll(removing: boolean, ctx: ToolContext): void {
    const solid = this.solidOf(ctx)
    if (!solid) {
      this.openPick(ctx)
      return
    }
    const all = solid.brep.faces.map((_, i) => i)
    if (removing) {
      const count = this.faces.length
      this.faces = []
      this.solid = null
      ctx.report(
        ctx.text.message("facesFoundRemoved", { count, removed: count })
      )
    } else {
      const added = all.filter((f) => !this.faces.includes(f))
      this.faces = [...this.faces, ...added]
      ctx.report(ctx.text.message("facesFound", { count: added.length }))
    }
    this.openPick(ctx)
  }

  /** Enter after the faces: their option's next question, or back to the options with none. */
  private closeFaces(option: FaceOption, ctx: ToolContext): void {
    if (this.faces.length === 0 || !this.solidOf(ctx)) {
      this.toFaces(ctx)
      return
    }
    switch (option) {
      case "Extrude":
        this.ask({ phase: "height" }, ctx)
        return
      case "Move":
      case "Copy":
        this.ask({ phase: "base", option }, ctx)
        return
      case "Rotate":
        this.ask({ phase: "axis" }, ctx)
        return
      case "Offset":
        this.ask({ phase: "offset" }, ctx)
        return
      case "Taper":
        this.ask({ phase: "taperBase" }, ctx)
        return
      case "Delete":
        this.apply({ kind: "delete" }, ctx)
        return
    }
  }

  private takePoint(point: Vec3, ctx: ToolContext): void {
    const state = this.state
    switch (state.phase) {
      case "base":
        this.ask({ phase: "second", option: state.option, base: point }, ctx)
        return
      case "second":
        this.moved(state.option, sub3(point, state.base), ctx)
        return
      case "axis":
      case "axisFirst":
        this.ask({ phase: "axisSecond", first: point }, ctx)
        return
      case "axisSecond": {
        const axis = normalize3(sub3(point, state.first))
        if (!axis) return
        this.ask({ phase: "angle", from: state.first, axis }, ctx)
        return
      }
      case "origin":
        this.toAngle(state.by, point, ctx)
        return
      case "taperBase":
        this.ask({ phase: "taperAxis", base: point }, ctx)
        return
      case "taperAxis": {
        const axis = normalize3(sub3(point, state.base))
        if (!axis) return
        this.ask({ phase: "taperAngle", base: state.base, axis }, ctx)
        return
      }
    }
  }

  /** The point typed at the axis prompt is its first point (2points). */
  private toAngle(
    by: Exclude<AxisBy, "2points">,
    origin: Vec3,
    ctx: ToolContext
  ): void {
    const axis =
      by === "Xaxis"
        ? { x: 1, y: 0, z: 0 }
        : by === "Yaxis"
          ? { x: 0, y: 1, z: 0 }
          : by === "Zaxis"
            ? { x: 0, y: 0, z: 1 }
            : (normalize3(ctx.viewport.direction) ?? { x: 0, y: 0, z: 1 })
    this.ask({ phase: "angle", from: origin, axis }, ctx)
  }

  private takeValue(value: number, ctx: ToolContext): void {
    const state = this.state
    switch (state.phase) {
      case "height":
        this.ask({ phase: "taper", height: value }, ctx)
        return
      case "taper":
        this.apply(
          { kind: "extrude", height: state.height, taper: value * DEGREE },
          ctx
        )
        return
      case "offset":
        this.apply({ kind: "offset", distance: value }, ctx)
        return
      case "angle": {
        const { from, axis } = state
        const angle = value * DEGREE
        this.apply(
          { kind: "plane", to: (p) => turned(p, from, axis, angle) },
          ctx
        )
        return
      }
      case "taperAngle": {
        const { base, axis } = state
        const angle = value * DEGREE
        this.apply(
          { kind: "plane", to: (p) => tapered(p, base, axis, angle) },
          ctx
        )
        return
      }
    }
  }

  private moved(
    option: "Move" | "Copy",
    displacement: Vec3,
    ctx: ToolContext
  ): void {
    if (option === "Move") {
      this.apply({ kind: "move", displacement }, ctx)
      return
    }
    const solid = this.solidOf(ctx)
    if (solid) {
      const regions = copiedFaces(
        solid,
        this.faces,
        displacement,
        ctx.document.getCurrentLayerId()
      ).map((r) => withCurrentProperties(r, ctx))
      this.marks.push(ctx.historyDepth())
      if (regions.length > 0) ctx.execute(new AddEntitiesCommand(regions))
    }
    this.toFaces(ctx)
  }

  /** An edit made, said and marked for Undo, or AutoCAD's modelling error with nothing changed. */
  private apply(edit: FaceEdit, ctx: ToolContext): void {
    const solid = this.solidOf(ctx)
    const made = solid && solidFacesEdited(solid, this.faces, edit)
    if (!made) {
      // The code ACIS gives each failure seen (e09: 103013 deleting a box's
      // side, e12: 103009 moving its top through it); others never seen.
      const code =
        edit.kind === "delete" ? 103013 : edit.kind === "move" ? 103009 : null
      ctx.report(
        code === null
          ? ctx.text.message("modelingError")
          : ctx.text.message("modelingErrorCode", { code: String(code) }),
        "error"
      )
      this.toFaces(ctx)
      return
    }
    ctx.report(ctx.text.message("solidValidationStarted"))
    ctx.report(ctx.text.message("solidValidationCompleted"))
    this.marks.push(ctx.historyDepth())
    ctx.execute(new UpdateEntitiesCommand([made]))
    this.toFaces(ctx)
  }

  private ask(state: SolideditState, ctx: ToolContext): void {
    this.state = state
    switch (state.phase) {
      case "height":
      case "offset":
        this.openValue(ctx, "distance")
        return
      case "taper":
      case "angle":
      case "taperAngle":
        this.openValue(ctx, "angle")
        return
      case "axis":
      case "base":
      case "second":
      case "axisFirst":
      case "axisSecond":
      case "origin":
      case "taperBase":
      case "taperAxis":
        this.openPoint(ctx)
        return
      default:
        this.openKeywords(ctx)
    }
  }

  private openKeywords(ctx: ToolContext): void {
    ctx.dynamicInput.open({ fields: [], commit: () => {} })
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }

  /** A face's pick: a typed point takes the face drawn through it, as a click there (e01). */
  private openPick(ctx: ToolContext): void {
    ctx.dynamicInput.open({
      fields: [{ id: "point", prompt: this.prompt(), kind: "coordinate" }],
      commit: () => {},
      commitRaw: (commitCtx) => {
        if (!commitCtx.dynamicInput.hasTypedText()) return false
        const point = this.typed(commitCtx)
        if (!point) return false
        this.pickFace(commitCtx.viewport.worldToScreen(point), commitCtx)
        return true
      },
      directDistance: "typed",
    })
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }

  private openPoint(ctx: ToolContext): void {
    ctx.dynamicInput.open({
      fields: [{ id: "point", prompt: this.prompt(), kind: "coordinate" }],
      commit: () => {},
      commitRaw: (commitCtx) => {
        if (!commitCtx.dynamicInput.hasTypedText()) return false
        const point = this.typed(commitCtx)
        if (!point) return false
        this.takePoint(point, commitCtx)
        return true
      },
    })
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }

  private openValue(ctx: ToolContext, kind: "distance" | "angle"): void {
    ctx.dynamicInput.open({
      fields: [{ id: "value", prompt: this.prompt(), kind }],
      commit: (values, commitCtx) => {
        if (Number.isFinite(values.value))
          this.takeValue(values.value, commitCtx)
      },
    })
    if (this.state.phase === "taper") ctx.dynamicInput.setDefault("value", 0)
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }

  private prompt(): PromptId {
    const q = this.question()
    return typeof q === "string" ? q : q.id
  }

  private typed(ctx: ToolContext): Vec3 | null {
    const text = ctx.dynamicInput.getText("point").trim()
    if (!isCoordinateExpression(text)) return null
    const base = this.getConstraintAnchor()
    return parseCoordinate(text, {
      lastPoint: base ?? ctx.lastPoint,
      relativeByDefault: false,
      ucs: ctx.ucs,
      elevation: ctx.elevation,
    })
  }
}

function isBuilt(id: string): id is FaceOption {
  return [
    "Extrude",
    "Move",
    "Rotate",
    "Offset",
    "Taper",
    "Delete",
    "Copy",
  ].includes(id)
}

/** A point turned `angle` about the axis through `from` along the unit `axis`, right-handed. */
function turnedPoint(p: Vec3, from: Vec3, axis: Vec3, angle: number): Vec3 {
  return add3(from, turnedVector(sub3(p, from), axis, angle))
}

function turnedVector(v: Vec3, k: Vec3, angle: number): Vec3 {
  const c = Math.cos(angle)
  const s = Math.sin(angle)
  return add3(
    add3(scale3(v, c), scale3(cross3(k, v), s)),
    scale3(k, dot3(k, v) * (1 - c))
  )
}

/** A face's plane rotated about an axis (Rotate, e07). */
function turned(
  p: FacePlane,
  from: Vec3,
  axis: Vec3,
  angle: number
): FacePlane {
  const normal = turnedVector(p.normal, axis, angle)
  const point = turnedPoint(scale3(p.normal, p.level), from, axis, angle)
  return { normal, level: dot3(point, normal) }
}

/**
 * A face's plane tapered (Taper, e08, e12): turned by `angle` about the line
 * where it meets the plane square to the axis through the base point, so a
 * positive angle leans it in along the axis — a side tapered 10° up its
 * height, a top 80° along it.
 */
function tapered(
  p: FacePlane,
  base: Vec3,
  axis: Vec3,
  angle: number
): FacePlane {
  const hinge = normalize3(cross3(p.normal, axis))
  if (!hinge) return p
  // The point of both planes nearest the base point.
  const nn = 1
  const na = dot3(p.normal, axis)
  const det = nn - na * na
  const r1 = p.level - dot3(p.normal, base)
  const s = r1 / det
  const t = (-na * r1) / det
  const on = add3(base, add3(scale3(p.normal, s), scale3(axis, t)))
  const normal = turnedVector(p.normal, hinge, angle)
  return { normal, level: dot3(on, normal) }
}

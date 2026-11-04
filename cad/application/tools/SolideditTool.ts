import { Vec2 } from "../../geometry/Vec2"
import {
  Vec3,
  add3,
  cross3,
  dot3,
  length3,
  normalize3,
  scale3,
  sub3,
} from "../../geometry/Vec3"
import { edgeFaces } from "../../geometry/solidBlends"
import { FacePlane } from "../../geometry/solidEdits"
import { brepBox } from "../../geometry/solids"
import { EntityId, Solid3dEntity } from "../../domain/entities"
import {
  FaceEdit,
  copiedFaces,
  solidFacesEdited,
} from "../../domain/solidModeling"
import {
  SubobjectRef,
  subobjectEdgeEntities,
} from "../../domain/solidSubobjects"
import { ucsZAxis } from "../../domain/ucs"
import { formatLength } from "../../domain/units"
import { subobjectsAt } from "../subobjectPick"
import {
  AddEntitiesCommand,
  UpdateEntitiesCommand,
} from "../commands/entityCommands"
import {
  isCoordinateExpression,
  parseCoordinate,
} from "../input/coordinateInput"
import type { PromptId } from "../../locales/types"
import type { MessageId } from "../EngineText"
import { ScenePrimitive } from "../../scene/types"
import { THEME } from "../../scene/theme"
import { selectionGlow } from "../SceneBuilder"
import { withCurrentProperties } from "./currentProperties"
import { rollover } from "./ghostLook"
import { sizeBand } from "./solidJig"
import { SolidDefaults, solidDefaults } from "./solidDefaults"
import { SweepSettings, sweepSettings } from "./sweepSettings"
import {
  CommandOption,
  CommandOptionOutcome,
  HeldVariables,
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
      /** The solid whose edge the pick box touches, lit whole. */
      readonly hover: EntityId | null
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
  | {
      readonly phase: "angle"
      readonly from: Vec3
      /** Null for two axis points that are one: taken, as AutoCAD takes it (solid-edits/p362). */
      readonly axis: Vec3 | null
      /** Where a point given for the angle is measured from (p125's `BasePoint`). */
      readonly anchor: Vec3
    }
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
 * What SOLIDEDIT reads and keeps, one object its tools share: SOLIDCHECK, 1
 * at first, the program's (solid-edits/p405: it outlives OPEN, no drawing
 * saves it); EXTRUDE's taper, which the extrusion offers and sets (p370,
 * p372, p373); the primitives' height, which Enter at the extrusion's height
 * takes and the extrusion leaves (p326, p342, p364, p369).
 */
export interface SolideditSettings {
  solidCheck: number
  readonly sweeps: SweepSettings
  readonly primitives: SolidDefaults
}

export function solideditSettings(
  sweeps: SweepSettings = sweepSettings(),
  primitives: SolidDefaults = solidDefaults()
): SolideditSettings {
  return { solidCheck: 1, sweeps, primitives }
}

/** What a face's pick finds: the faces a pick takes, of one solid, or a locked solid. */
type FacePick =
  | { readonly solid: Solid3dEntity; readonly faces: readonly number[] }
  | "locked"
  | null

/**
 * AutoCAD's SOLIDEDIT, its faces (solidedit/e01–e12, en, es and pt-BR): it
 * says `Solids editing automatic checking:  SOLIDCHECK=1`, SOLIDCHECK's value
 * (solid-edits/p335), and asks `Enter a solids editing option
 * [Face/Edge/Body/Undo/eXit] <eXit>:`; Face asks `Enter a face editing option
 * [Extrude/Move/Rotate/Offset/Taper/Delete/Copy/coLor/mAterial/Undo/eXit]
 * <eXit>:` and each option `Select faces or [Undo/Remove]:` (`… /ALL]` once a
 * face is taken, `Remove faces or [Undo/Add/ALL]:` after Remove), a click or
 * a typed point taking the two faces of an edge drawn under it, else the face
 * nearest the viewer (`1 face found.`, `1 face found, 1 removed.`), ALL every
 * face of the solid (`6 faces found.`, e11). Then:
 * Extrude `Specify height of extrusion or [Path]:`, Enter there the
 * primitives' last height, and `Specify angle of taper for extrusion <0>:`,
 * EXTRUDE's last taper ({@link SolideditSettings}), the face's prism added or
 * taken, narrowing as it rises (e08); Move `Specify a base point or
 * displacement:` and `Specify a second point of displacement:` (e06); Rotate
 * an axis by two points, the UCS's X, Y or Z or the view's through `Specify
 * the origin of the rotation <0,0,0>:`, the UCS's, then `Specify a rotation
 * angle or [Reference]:` (e07); Offset `Specify the offset distance:`
 * (e01–e05), no further in than half the solid's largest side (`The offset
 * distance must be greater than -5.0000.`, e04, p344); Taper `Specify the
 * base point:`, `Specify another point along the axis of tapering:` and
 * `Specify the taper angle:`, the face turned about where it meets the plane
 * square to the axis through the base point, inwards for a positive angle
 * (e08, e12); Delete closes a hole or a fillet's or a chamfer's strip (e09);
 * Copy a planar face into a region (e10). Each edit says `Solid validation
 * started.` and `Solid validation completed.` while SOLIDCHECK is 1 (p335),
 * or AutoCAD's modelling error with the solid left as it was, and asks for
 * the next option; a Move or a Rotate by zero is said and edits nothing
 * (solid-edits/p328, p330). Undo there takes the last back, `Command has been
 * completely undone.` once none is left (p302); eXit or Enter leaves Face,
 * then the command. The rail's buttons are its face options answered
 * (acad.cuix `_solidedit _face _extrude`…). One undo step, `SOLIDEDIT`
 * (filletedge/f07).
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
  /** The faces each pick or ALL added and removed, for Select faces' and Remove faces' Undo. */
  private added: number[][] = []
  private removed: number[][] = []
  /** The history's depth before each edit of this run, for its Undo. */
  private marks: number[] = []
  private lastScreen: Vec2 | null = null
  private cursor: Vec3 | null = null

  constructor(
    private readonly start: FaceOption | null = null,
    private readonly settings: SolideditSettings = solideditSettings()
  ) {
    this.id = start ? `solidedit${start.toLowerCase()}` : "solidedit"
  }

  heldVariables(): Partial<HeldVariables> {
    return {
      SOLIDCHECK: {
        read: () => this.settings.solidCheck,
        write: (value) => {
          this.settings.solidCheck = value
        },
      },
    }
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
    this.clearFaces()
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
        return {
          id: "solideditExtrudeTaper",
          enter: { angle: this.settings.sweeps.taper },
        }
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

  // WHY said here: Move's base point and the axis prompt declare their
  // refusal's words, which read as no point to the runtime, and both set it
  // (solid-edits/p123, p125).
  setsLastPoint(): boolean | null {
    const phase = this.state.phase
    return phase === "base" || phase === "axis" ? true : null
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
        // ALL stays once a pick has taken a face, the set emptied or not
        // (solid-edits/p322, p323).
        return [
          { id: "Undo" },
          { id: state.removing ? "Add" : "Remove" },
          ...(this.solid !== null || state.removing ? [{ id: "ALL" }] : []),
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
          // Undo here takes no face edit back (solid-edits/p303).
          if (this.marks.length === 0) this.sayUndone(ctx)
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
          this.clearFaces()
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
          this.undoPick(state.removing, ctx)
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
      case "height": {
        // The primitives' and EXTRUDE's last height, shown nowhere; with
        // none yet, the prompt's refusal (solid-edits/p326, p364, p406).
        const height = this.settings.primitives.height
        if (height === null) {
          ctx.report(
            ctx.text.message("requiresDistance", {
              points: "two",
              keyword: "yes",
            }),
            "error"
          )
        } else {
          this.ask({ phase: "taper", height }, ctx)
        }
        return true
      }
      case "taper":
        this.takeValue(this.settings.sweeps.taper, ctx)
        return true
      case "second":
        // Enter takes the base point as the displacement, MOVE's way.
        this.moved(state.option, state.base, ctx)
        return true
      case "axis":
        this.ask({ phase: "axisFirst" }, ctx)
        return true
      case "origin":
        // The UCS's origin (p404). Enter's moves no LASTPOINT, though the
        // angle then measures from it (solid-edits/p136).
        ctx.setLastPoint(ctx.lastPoint)
        this.toAngle(state.by, ctx.ucs.origin, ctx)
        return true
      case "base":
      case "axisFirst":
      case "axisSecond":
      case "offset":
      case "angle":
      case "taperBase":
      case "taperAxis":
      case "taperAngle":
        // AllowNone false: refused in the prompt's words, asked again
        // (solid-edits/p324, p328, p330, p333, p400, p401).
        ctx.report(this.enterRefusal(state.phase, ctx), "error")
        return true
      default:
        return false
    }
  }

  private enterRefusal(
    phase: SolideditState["phase"],
    ctx: ToolContext
  ): string {
    switch (phase) {
      case "offset":
        return ctx.text.message("requiresDistance", {
          points: "two",
          keyword: "no",
        })
      case "angle":
        return ctx.text.message("requiresAngle", {
          points: "second",
          keyword: "yes",
        })
      case "taperAngle":
        return ctx.text.message("requiresAngle", {
          points: "two",
          keyword: "no",
        })
      default:
        return ctx.text.message("invalidPoint")
    }
  }

  /** WHY no snap at a face's pick: the click takes a face, not a point. */
  wantsSnap(): boolean {
    const phase = this.state.phase
    return (
      phase === "base" ||
      phase === "second" ||
      // A click at the axis prompt is its first point (desktop
      // solid-edits/d02-e), as the typed one.
      phase === "axis" ||
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
    if (state.phase === "angle") return state.anchor
    if (state.phase === "taperAxis") return state.base
    return null
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen
    this.cursor = input.point
    const state = this.state
    if (state.phase === "select") {
      const hover = this.rolloverAt(input.screen, ctx)
      if (hover !== state.hover) this.state = { ...state, hover }
    }
    ctx.dynamicInput.setPosition(input.screen)
    ctx.requestRender()
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0) return
    const state = this.state
    if (state.phase === "select") {
      // A click that takes faces is LASTPOINT, the cursor's point on the
      // work plane (desktop solid-edits/d06); one taking none is unverified.
      if (this.pickFace(input.screen, ctx)) ctx.setLastPoint(input.point)
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
      const owner = ctx.document.get(state.hover)
      if (owner) out.push(...rollover(ctx, owner))
    }
    // The dashed band from the prompt's base: Move's second point, Rotate's
    // second axis point and its angle, Taper's axis; none at Taper's angle
    // (desktop solid-edits/d02-d, d02-e, d02-f).
    const from = this.getConstraintAnchor()
    if (from && this.cursor) {
      out.push(sizeBand(ctx.viewport, from, this.cursor))
    }
    return out
  }

  private solidOf(ctx: ToolContext): Solid3dEntity | null {
    if (!this.solid) return null
    const entity = ctx.document.get(this.solid)
    return entity?.type === "solid3d" ? entity : null
  }

  private toSolids(ctx: ToolContext): void {
    ctx.report(
      ctx.text.message("solideditChecking", {
        value: String(this.settings.solidCheck),
      })
    )
    this.state = { phase: "solids" }
    this.openKeywords(ctx)
  }

  private toFaces(ctx: ToolContext): void {
    this.state = { phase: "faces" }
    this.clearFaces()
    this.openKeywords(ctx)
  }

  private clearFaces(): void {
    this.faces = []
    this.solid = null
    this.added = []
    this.removed = []
  }

  /**
   * Undo at the face option: the last edit of this run taken back, and
   * `Command has been completely undone.` once none is left, or none was
   * (solid-edits/p301, p302).
   */
  private undoOne(ctx: ToolContext): void {
    const mark = this.marks.pop()
    if (mark !== undefined) ctx.undoTo(mark)
    if (this.marks.length === 0) this.sayUndone(ctx)
  }

  private sayUndone(ctx: ToolContext): void {
    ctx.report(ctx.text.message("commandCompletelyUndone"))
  }

  /**
   * Undo at `Select faces` takes back the faces the last pick or ALL added,
   * at `Remove faces` puts back those the last pick removed, saying `Face
   * selection has been completely undone.` once none is left, or none was
   * (solid-edits/p304, p305, p368, p374).
   */
  private undoPick(removing: boolean, ctx: ToolContext): void {
    const stack = removing ? this.removed : this.added
    const last = stack.pop()
    if (last && removing) {
      this.faces = [
        ...this.faces,
        ...last.filter((f) => !this.faces.includes(f)),
      ]
    } else if (last) {
      this.faces = this.faces.filter((f) => !last.includes(f))
    }
    if (stack.length === 0) {
      ctx.report(ctx.text.message("faceSelectionUndone"))
    }
    this.openPick(ctx)
  }

  /** The edges and faces of the solids under `screen`, edges first. */
  private edgesAndFacesAt(screen: Vec2, ctx: ToolContext): SubobjectRef[] {
    const { document } = ctx
    const solids = document
      .getEntities()
      .filter(
        (e): e is Solid3dEntity =>
          e.type === "solid3d" && document.isEntityVisible(e)
      )
    const shaded = document.getSettings().visualStyle !== "2dWireframe"
    return subobjectsAt(solids, ctx.viewport, screen, shaded).filter(
      (ref) => ref.kind !== "vertex"
    )
  }

  /**
   * The solid a pick at `screen` lights: the one whose edge the pick box
   * touches, whole, as a set prompt's rollover; none inside a face (desktop
   * solid-edits/d02-b). Locked, or another than the faces' solid, none
   * (unverified).
   */
  private rolloverAt(screen: Vec2, ctx: ToolContext): EntityId | null {
    const first = this.edgesAndFacesAt(screen, ctx)[0]
    if (first?.kind !== "edge") return null
    const owner = ctx.document.get(first.id)
    if (!owner || !ctx.document.isEntityEditable(owner)) return null
    return this.solid === null || owner.id === this.solid ? owner.id : null
  }

  /**
   * What a pick at `screen` finds, the first solid under it deciding: the two
   * faces of an edge drawn within the pick box (solid-edits/p313, p361), else
   * the face nearest the viewer (e01); adding, the first of these with a face
   * not yet taken, so a face picked again gives the next one behind it
   * (p314, p316). A locked solid's is `"locked"` (p321).
   */
  private facesAt(screen: Vec2, ctx: ToolContext, adding: boolean): FacePick {
    const { document } = ctx
    const found = this.edgesAndFacesAt(screen, ctx)
    const owner = found.length > 0 ? document.get(found[0].id) : undefined
    if (owner?.type !== "solid3d") return null
    if (!document.isEntityEditable(owner)) return "locked"
    let first: readonly number[] | null = null
    for (const ref of found) {
      if (ref.id !== owner.id) continue
      const faces =
        ref.kind === "edge"
          ? [...new Set(edgeFaces(owner.brep, ref.index))]
          : [ref.index]
      first ??= faces
      if (!adding || faces.some((f) => !this.faces.includes(f))) {
        return { solid: owner, faces }
      }
    }
    return first && { solid: owner, faces: first }
  }

  /** A face's pick at `screen`: whether it took faces into the set or out of it. */
  private pickFace(screen: Vec2, ctx: ToolContext): boolean {
    const state = this.state
    if (state.phase !== "select") return false
    const found = this.facesAt(screen, ctx, !state.removing)
    let took = false
    if (found === null || found === "locked") {
      if (found === "locked") {
        ctx.report(ctx.text.message("objectOnLockedLayer"), "error")
      }
      ctx.report(ctx.text.message("noSolidsDetected"), "error")
    } else if (this.solid !== null && found.solid.id !== this.solid) {
      // Another solid's face passes in silence, as in AutoCAD (p315).
    } else if (state.removing) {
      const removed = found.faces.filter((f) => this.faces.includes(f))
      // Nothing is said for a face not in the set (p322).
      if (removed.length > 0) {
        took = true
        this.faces = this.faces.filter((f) => !removed.includes(f))
        this.removed.push(removed)
        ctx.report(
          ctx.text.message("facesFoundRemoved", {
            count: found.faces.length,
            removed: removed.length,
          })
        )
      }
    } else {
      const added = found.faces.filter((f) => !this.faces.includes(f))
      this.solid = found.solid.id
      if (added.length > 0) {
        took = true
        this.faces = [...this.faces, ...added]
        this.added.push(added)
        ctx.report(ctx.text.message("facesFound", { count: added.length }))
      }
    }
    this.openPick(ctx)
    return took
  }

  /**
   * ALL: every face of the solid taken, those added counted (e11, p317,
   * p323); at Remove faces, every one removed in silence (p322).
   */
  private takeAll(removing: boolean, ctx: ToolContext): void {
    const solid = this.solidOf(ctx)
    if (solid && removing) {
      if (this.faces.length > 0) this.removed.push(this.faces)
      this.faces = []
    } else if (solid) {
      const added = solid.brep.faces
        .map((_, i) => i)
        .filter((f) => !this.faces.includes(f))
      if (added.length > 0) this.added.push(added)
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
      case "axisSecond":
        this.ask(
          {
            phase: "angle",
            from: state.first,
            axis: normalize3(sub3(point, state.first)),
            anchor: point,
          },
          ctx
        )
        return
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

  /**
   * The axis through `origin`: the UCS's X, Y or Z as the tool's frame reads
   * them, never the frame's (solid-edits/p331, p332, p366, p367), or the
   * line of sight.
   */
  private toAngle(
    by: Exclude<AxisBy, "2points">,
    origin: Vec3,
    ctx: ToolContext
  ): void {
    const { ucs } = ctx
    const axis =
      by === "Xaxis"
        ? ucs.xAxis
        : by === "Yaxis"
          ? ucs.yAxis
          : by === "Zaxis"
            ? ucsZAxis(ucs)
            : (normalize3(ctx.viewport.direction) ?? ucsZAxis(ucs))
    this.ask({ phase: "angle", from: origin, axis, anchor: origin }, ctx)
  }

  /**
   * A value answered: a zero or out-of-range one refused in AutoCAD's words
   * and asked again, a zero rotation said and the edit dropped, neither an
   * edit nor a step (solid-edits/p324, p325, p327, p330, p333).
   */
  private takeValue(value: number, ctx: ToolContext): void {
    const state = this.state
    const refuse = (id: MessageId) => ctx.report(ctx.text.message(id), "error")
    switch (state.phase) {
      case "height":
        if (value === 0) {
          refuse("valueMustBeNonzero")
          return
        }
        this.ask({ phase: "taper", height: value }, ctx)
        return
      case "taper":
        if (!(Math.abs(value) < 90)) {
          refuse("taperAngleRange")
          return
        }
        // EXTRUDE's default from now on, which an Undo leaves (p370, p373).
        this.settings.sweeps.taper = value
        this.apply(
          { kind: "extrude", height: state.height, taper: value * DEGREE },
          ctx
        )
        return
      case "offset": {
        if (value === 0) {
          refuse("valueMustBeNonzero")
          return
        }
        const bound = this.offsetBound(ctx)
        if (bound !== null && value <= bound) {
          ctx.report(
            ctx.text.message("offsetDistanceBound", {
              distance: formatLength(bound, ctx.document.getSettings()),
            }),
            "error"
          )
          return
        }
        this.apply({ kind: "offset", distance: value }, ctx)
        return
      }
      case "angle": {
        const { from, axis } = state
        const angle = value * DEGREE
        if (value === 0) {
          ctx.report(ctx.text.message("zeroRotation"))
          this.toFaces(ctx)
          return
        }
        // A turn about an axis of no length is unprobed: the modelling
        // error any failed edit says.
        this.apply(
          axis
            ? { kind: "plane", to: (p) => turned(p, from, axis, angle) }
            : null,
          ctx
        )
        return
      }
      case "taperAngle": {
        const { base, axis } = state
        const angle = value * DEGREE
        if (value === 0 || !(Math.abs(value) < 90)) {
          refuse("taperAngleNonzero")
          return
        }
        this.apply(
          { kind: "plane", to: (p) => tapered(p, base, axis, angle) },
          ctx
        )
        return
      }
    }
  }

  /**
   * How far in an offset may go: half the largest side of the solid's box,
   * whichever faces are taken (solid-edits/e04, p344–p348, p365); the box in
   * the tool's frame, the WCS's but in a tilted UCS (unprobed there).
   */
  private offsetBound(ctx: ToolContext): number | null {
    const solid = this.solidOf(ctx)
    const box = solid && brepBox(solid.brep)
    if (!box) return null
    const { min, max } = box
    return -Math.max(max.x - min.x, max.y - min.y, max.z - min.z) / 2
  }

  private moved(
    option: "Move" | "Copy",
    displacement: Vec3,
    ctx: ToolContext
  ): void {
    if (option === "Move") {
      if (length3(displacement) === 0) {
        // Copy by zero still makes its region (solid-edits/p362).
        ctx.report(ctx.text.message("zeroDisplacement"))
        this.toFaces(ctx)
        return
      }
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
  private apply(edit: FaceEdit | null, ctx: ToolContext): void {
    const solid = this.solidOf(ctx)
    const made = solid && edit && solidFacesEdited(solid, this.faces, edit)
    if (!made) {
      // The code ACIS gives each failure seen (e09: 103013 deleting a box's
      // side, e12: 103009 moving its top through it); others never seen.
      const code =
        edit?.kind === "delete" ? 103013 : edit?.kind === "move" ? 103009 : null
      ctx.report(
        code === null
          ? ctx.text.message("modelingError")
          : ctx.text.message("modelingErrorCode", { code: String(code) }),
        "error"
      )
      this.toFaces(ctx)
      return
    }
    if (this.settings.solidCheck !== 0) {
      ctx.report(ctx.text.message("solidValidationStarted"))
      ctx.report(ctx.text.message("solidValidationCompleted"))
    }
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

  /**
   * A face's pick: a typed point takes the faces drawn through it, as a click
   * there (e01), and becomes LASTPOINT (solid-edits/p123).
   */
  private openPick(ctx: ToolContext): void {
    ctx.dynamicInput.open({
      fields: [{ id: "point", prompt: this.prompt(), kind: "coordinate" }],
      commit: () => {},
      commitRaw: (commitCtx) => {
        if (!commitCtx.dynamicInput.hasTypedText()) return false
        const point = this.typed(commitCtx)
        if (!point) return false
        commitCtx.setLastPoint(point)
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
    if (this.state.phase === "taper") {
      ctx.dynamicInput.setDefault("value", this.settings.sweeps.taper)
    }
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

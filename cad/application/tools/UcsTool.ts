import { Vec2, V } from "../../geometry/Vec2"
import { Vec3, add3, cross3, length3, scale3, sub3 } from "../../geometry/Vec3"
import { closestPointOnInfiniteLine } from "../../geometry/primitives"
import { Entity, EntityId, lineEndZ, lineStartZ } from "../../domain/entities"
import {
  NamedUcs,
  OrthographicUcs,
  Ucs,
  WORLD_UCS,
  isWorldUcs,
  orthographicUcs,
  rotateUcs,
  sameUcs,
  ucsFromAxes,
  ucsPointToWorld,
  ucsZAxis,
  worldDirectionToUcs,
  worldPointToUcs,
} from "../../domain/ucs"
import {
  DocumentSettings,
  formatLength,
  parseAngleDegrees,
  parseNumber,
} from "../../domain/units"
import { matchesWildcard } from "../../shared/wildcard"
import { UpdateSettingsCommand } from "../commands/settingsCommands"
import { Viewport } from "../Viewport"
import { cursorOnEntityPlane } from "../viewPick"
import { THEME } from "../../scene/theme"
import { ScenePrimitive } from "../../scene/types"
import type { PromptId } from "../../locales/types"
import {
  isCoordinateExpression,
  parseCoordinate,
} from "../input/coordinateInput"
import type { CursorBadge } from "../SceneBuilder"
import {
  CommandOption,
  CommandOptionOutcome,
  PointerInput,
  QuestionInput,
  Tool,
  ToolContext,
  ToolQuestion,
} from "./Tool"
import { acuteHeading, headingInUcs } from "./ucsHeading"
import { pointAlongCursor } from "./directDistance"
import { ONE_OBJECT_MODES, ObjectSelector } from "./objectSelection"
import {
  alignable,
  hasEnds,
  ucsAlongZ,
  ucsAtEnd,
  ucsFromFound,
  ucsFromObject,
} from "./ucsObjects"
import { glow, rollover } from "./ghostLook"
import { lockedObjectAt } from "./lockedPick"

type Axis = "x" | "y" | "z"

type UcsState =
  | { readonly phase: "origin" }
  | { readonly phase: "newUcs" }
  /** Origin's new origin, or Move's (which offers Zdepth). */
  | { readonly phase: "shift"; readonly move: boolean }
  | { readonly phase: "zdepth" }
  | { readonly phase: "orthographic"; readonly current: OrthographicUcs }
  | { readonly phase: "threeOrigin" }
  /**
   * `three`: 3point's prompt, with the point Enter takes as it shows it; null
   * after an origin given at the first prompt (`<accept>`).
   */
  | {
      readonly phase: "xAxis"
      readonly origin: Vec3
      readonly three: string | null
    }
  | {
      readonly phase: "xyPlane"
      readonly origin: Vec3
      readonly xAxis: Vec3
      readonly three: string | null
      /** Where its point is read ({@link UcsTool.enterXYPlane}). */
      readonly readIn: Ucs
    }
  | { readonly phase: "rotate"; readonly axis: Axis }
  | { readonly phase: "zOrigin" }
  | {
      readonly phase: "zPoint"
      readonly origin: Vec3
      /** The point Enter keeps, as the prompt shows it: one up the current Z. */
      readonly enter: string
    }
  /** `locked`: a locked object under the pick box, which its padlock shows. */
  | {
      readonly phase: "zObject"
      readonly hover: EntityId | null
      readonly locked: boolean
    }
  | { readonly phase: "named" }
  | { readonly phase: "restore" }
  | { readonly phase: "save" }
  | { readonly phase: "replace"; readonly name: string }
  | { readonly phase: "delete" }
  | { readonly phase: "list"; readonly back: ListBack }
  | {
      readonly phase: "object"
      readonly hover: EntityId | null
      readonly locked: boolean
    }
  | { readonly phase: "face" }

/** The prompt a `?` listing asks again once it is written. */
type ListBack = "origin" | "named" | "restore" | "save"

/** UCSAXISANG's initial value, which the X, Y and Z options offer as their default. */
const DEFAULT_AXIS_ANGLE = 90
const WCS_ORIGIN: Vec3 = { x: 0, y: 0, z: 0 }

/** UCS Previous steps back through the last 10 of the session. */
const MAX_PREVIOUS = 10
/** Characters a symbol-table name may not hold (AutoCAD's naming rule). */
const INVALID_NAME = /[\\<>/?":;*|,=`]/

const ROTATION_PROMPTS: Readonly<Record<Axis, PromptId>> = {
  x: "ucsRotationX",
  y: "ucsRotationY",
  z: "ucsRotationZ",
}

/** The orthographic UCS each keyword sets: UCS's, and -VIEW's views. */
export const ORTHOGRAPHIC_OPTIONS: Readonly<Record<string, OrthographicUcs>> = {
  Top: "top",
  Bottom: "bottom",
  Front: "front",
  BAck: "back",
  Left: "left",
  Right: "right",
}

/** orthoGraphic's default, named as AutoCAD writes it (`<Back>`, not BAck). */
const ORTHOGRAPHIC_NAMES: Readonly<Record<OrthographicUcs, PromptId>> = {
  top: "ucsTop",
  bottom: "ucsBottom",
  front: "ucsFront",
  back: "ucsBack",
  left: "ucsLeft",
  right: "ucsRight",
}

/**
 * The words the first prompt declares and does not list, in 2027's `initget`
 * order (probe ucs/p200). Apply and SEction, declared too, are left out: they
 * are not built, and no other word's letters would answer them.
 */
const HIDDEN_OPTIONS = [
  "Origin",
  "3point",
  "Entity",
  "Move",
  "orthoGraphic",
  "Restore",
  "Save",
  "Delete",
  "?",
  "New",
  ...Object.keys(ORTHOGRAPHIC_OPTIONS),
] as const

/**
 * What NAmed's `Enter an option [Restore/Save/Delete/?]:` takes and does not
 * list: its `initget` is the first prompt's (probe ucs/p230), each word doing
 * what it does there (p228, p229). Apply and SEction are left out, as there.
 */
const NAMED_HIDDEN = [
  "Origin",
  "Face",
  "ZAxis",
  "3point",
  "Entity",
  "View",
  "X",
  "Y",
  "Z",
  "OBject",
  "Move",
  "orthoGraphic",
  "Previous",
  "World",
  "New",
  ...Object.keys(ORTHOGRAPHIC_OPTIONS),
  "NAmed",
]

/**
 * New's `Specify origin of new UCS or [ZAxis/3point/OBject/Face/View/X/Y/Z]`
 * (probe ucs/p218).
 */
const NEW_UCS_OPTIONS = [
  "ZAxis",
  "3point",
  "OBject",
  "Face",
  "View",
  "X",
  "Y",
  "Z",
]
/** What New's `initget` declares and does not list (probe ucs/p218). */
const NEW_UCS_HIDDEN = ["Origin", "Entity"]

/** The modes Face's pick declares, unlisted (probes ucs/p220, p420). */
const FACE_MODES = ["Crossing", "Fence", "CPolygon"] as const

/**
 * AutoCAD's UCS: the origin and the three points, the X, Y and Z turns,
 * ZAxis (with its Object), OBject, View, World, Previous and the named UCSs,
 * and the words its first prompt takes unlisted — Origin, 3point, Entity,
 * Move, orthoGraphic and its six views, Restore, Save, Delete, `?` and New,
 * each with the prompts AutoCAD 2027's console answers it with. Face asks
 * for a solid's face, which nothing here has: there are no solids. It works
 * in the WCS, since it is what places the UCS the other commands work in.
 */
export class UcsTool implements Tool {
  readonly id = "ucs"
  readonly inWorld = true

  private state: UcsState = { phase: "origin" }
  private previous: {
    ucs: Ucs
    name: string | null
    orthographic: OrthographicUcs | null
  }[] = []
  private cursor: Vec3 | null = null
  private lastScreen: Vec2 | null = null
  /**
   * The selection modes typed at OBject's pick: AutoCAD 2027's console takes
   * the newest object found, locked or not and in silence, read with no pick
   * (`ucsFromFound`); finding none, `No object found` ends UCS (probes
   * ucs/p314–p326, p339, p340, p317). WHY whatever its type (UCS-D100): the
   * newest is taken and then answered as a pick on it, so a hatch says it
   * defines no coordinate system and ends UCS, even beside an older line in
   * the window (p433, p440). A dimension stays filtered out: OBject on one
   * is not built (UCS-D64).
   */
  private readonly objects = new ObjectSelector({
    takes: () => "singleSet",
    done: () => {},
    question: () => "ucsAlignObject",
    modes: ONE_OBJECT_MODES,
    accept: (ids, ctx) =>
      ids.filter((id) => ctx.document.get(id)?.type !== "dimension"),
    one: {
      take: (entity, ctx) => {
        if (entity.type === "hatch") {
          ctx.report(ctx.text.message("ucsNoCoordinateSystem"))
          return this.keep(ctx)
        }
        const ucs = ucsFromFound(entity)
        if (ucs) this.finish(ucs, null, ctx)
      },
      newest: true,
      takesLocked: true,
      notFound: (ctx) => this.keep(ctx),
      pick: (point, ctx) =>
        this.pickObject(point, ctx.viewport.worldToScreen(point), ctx),
    },
  })

  /**
   * The selection modes typed at ZAxis Object's pick: the newest object
   * found, at its end nearer the WCS's origin (probe ucs/p336). A locked one
   * is refused in BREAK's words, then `No object found`, and asked again
   * (p435). WHY whatever its type (UCS-D100): the newest unlocked one is
   * taken and answered as a pick on it, so one without ends says the option
   * is not supported and asks again, even beside an older line in the window
   * (p436, p441).
   */
  private readonly zObjects = new ObjectSelector({
    takes: () => "singleSet",
    done: () => {},
    question: () => "selectObject",
    modes: ONE_OBJECT_MODES,
    one: {
      take: (entity, ctx) => {
        if (!hasEnds(entity)) {
          ctx.report(ctx.text.message("zAxisNotSupported"))
          return
        }
        const ucs = ucsAtEnd(entity, WCS_ORIGIN)
        if (ucs) this.finish(ucs, null, ctx)
      },
      newest: true,
      locked: "objectOnLockedLayer",
      pick: (point, ctx) =>
        this.pickObject(point, ctx.viewport.worldToScreen(point), ctx),
    },
  })

  /**
   * Face's pick, `Select face of solid, surface, or mesh:`: its modes find no
   * face, for there are no solids; a crossing window says so, a fence or a
   * crossing polygon ends in silence (probes ucs/p421–p423, p426).
   */
  private readonly faces = new ObjectSelector({
    takes: () => "faceSet",
    done: () => {},
    question: () => "ucsSelectFace",
    modes: FACE_MODES,
    accept: () => [],
    one: {
      take: () => {},
      newest: true,
      none: (ctx) => {
        if (this.faceMode === "Crossing") {
          ctx.report(ctx.text.message("noSolidSurfaceOrMesh"))
        }
        ctx.endCommand()
      },
      pick: (point, ctx) => this.pickFace(point, ctx),
    },
  })
  /** The mode last typed at Face's pick. */
  private faceMode: string | null = null

  /** The selector asking now: an object's pick's, or Face's. */
  private selector(): ObjectSelector | null {
    const { phase } = this.state
    return phase === "object" || phase === "zObject" || phase === "face"
      ? this.selectorOf(phase)
      : null
  }

  private selectorOf(phase: "object" | "zObject" | "face"): ObjectSelector {
    if (phase === "face") return this.faces
    return phase === "object" ? this.objects : this.zObjects
  }

  /** Whether a selection mode's own prompt is asking, at an object's pick. */
  private inMode(): boolean {
    return this.selector()?.inMode() ?? false
  }

  onActivate(ctx: ToolContext): void {
    ctx.selection.clear()
    ctx.setCursor("crosshair")
    ctx.report(
      ctx.text.message(
        "currentUcsName",
        currentName(ctx.document.getSettings())
      )
    )
    // WHY: AutoCAD's console puts LASTPOINT at the WCS's origin as UCS
    // starts, and only a point given moves it — so after X, Y, Z, View,
    // World, Previous, a name or OBject found by a mode it is still there,
    // whatever the new origin (probes ucs/p134, p137, p138, p164).
    ctx.setLastPoint(WCS_ORIGIN)
    this.enterOrigin(ctx)
  }

  onDeactivate(ctx: ToolContext): void {
    this.state = { phase: "origin" }
    ctx.dynamicInput.close()
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.cursor = input.point
    this.lastScreen = input.screen
    if (this.inMode()) {
      this.selector()?.onPointerMove(input, ctx)
      return
    }
    const state = this.state
    if (state.phase === "object") {
      // A hatch glows too, which OBject then refuses (desktop ucs/d06-3).
      const picked = ctx.pick(input.world)
      const hit = picked?.type === "dimension" ? null : picked
      const hover = hit?.id ?? null
      const locked =
        hit !== null && ctx.document.getLayer(hit.layerId)?.locked === true
      if (hover !== state.hover || locked !== state.locked) {
        this.state = { phase: "object", hover, locked }
      }
    }
    if (state.phase === "zObject") {
      const hit = ctx.pick(input.world)
      const hover = hasEnds(hit) ? hit.id : null
      const locked = lockedObjectAt(input.screen, ctx, hit)
      if (hover !== state.hover || locked !== state.locked) {
        this.state = { phase: "zObject", hover, locked }
      }
    }
    const based = this.basis(ctx)
    if (based) this.showFromBase(based, input.point, ctx)
    if (state.phase === "rotate") {
      const offset = sub3(input.point, ctx.ucs.origin)
      if (V.length(worldDirectionToUcs(ctx.ucs, offset)) > 1e-9) {
        ctx.dynamicInput.setLive("angle", headingInUcs(ctx.ucs, offset))
      }
    }
    ctx.dynamicInput.setPosition(input.screen)
    ctx.requestRender()
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0) return
    if (this.inMode()) {
      this.selector()?.onPointerDown(input, ctx)
      return
    }
    const state = this.state
    switch (state.phase) {
      case "origin":
        this.enterXAxis(input.point, false, ctx)
        return
      case "threeOrigin":
        this.enterXAxis(input.point, true, ctx)
        return
      case "newUcs":
        this.finish({ ...ctx.ucs, origin: input.point }, null, ctx, {
          lastPoint: input.point,
        })
        return
      case "shift":
        this.shiftTo(input.point, state.move, ctx, input.point)
        return
      case "xAxis":
        this.enterXYPlane(state.origin, input.point, state.three !== null, ctx)
        return
      case "xyPlane":
        this.acceptPlanePoint(state, input.point, ctx)
        return
      // X, Y and Z alike take one point, its heading from the UCS's origin
      // in its XY plane: 0 on the origin itself (probes ucs/p124, p125,
      // p402).
      case "rotate": {
        const offset = sub3(input.point, ctx.ucs.origin)
        const flat = worldDirectionToUcs(ctx.ucs, offset)
        this.rotate(
          state.axis,
          V.length(flat) > 1e-9 ? headingInUcs(ctx.ucs, offset) : 0,
          ctx
        )
        return
      }
      case "zOrigin":
        this.enterZPoint(input.point, ctx)
        return
      case "zPoint":
        this.acceptZPoint(state.origin, input.point, ctx)
        return
      case "object":
      case "zObject":
        if (input.snap) {
          const screen = ctx.viewport.worldToScreen(input.point)
          return this.pickObject(input.point, screen, ctx)
        }
        this.pickObject(input.world, input.screen, ctx)
        return
      case "face":
        this.pickFace(input.world, ctx)
    }
  }

  /**
   * Face's pick, clicked or typed: there is no solid to take a face of, so
   * it says so and ends, the UCS kept and LASTPOINT at the pick, which U
   * takes back to the WCS's origin (probes ucs/p268, p424).
   */
  private pickFace(point: Vec3, ctx: ToolContext): void {
    ctx.report(ctx.text.message("noSolidSurfaceOrMesh"))
    this.keep(ctx, point)
  }

  /** Ends UCS with the UCS as it was, LASTPOINT at `lastPoint` if given. */
  private keep(ctx: ToolContext, lastPoint?: Vec3): void {
    const settings = ctx.document.getSettings()
    this.finish(settings.ucs, settings.ucsName, ctx, {
      remember: false,
      orthographic: settings.ucsOrthographic,
      ...(lastPoint ? { lastPoint } : {}),
    })
  }

  /**
   * OBject's and ZAxis Object's pick, clicked or typed — AutoCAD 2027's
   * console takes a typed point as a pick there and leaves LASTPOINT at it
   * (probes ucs/p300, p330, p343). On nothing `No object found`, which ends
   * OBject with the UCS as it was, LASTPOINT at the pick (p327, p328), and
   * asks ZAxis Object again (p329). OBject takes an object on a locked layer
   * in silence (p338, {@link picksLocked}) and refuses a hatch, which ends it
   * too (p311); ZAxis Object refuses a locked one in BREAK's words, the
   * newest under the pick box tested (p341), and one without ends in its
   * own (p335), asking again.
   */
  private pickObject(world: Vec3, screen: Vec2, ctx: ToolContext): void {
    const zAxis = this.state.phase === "zObject"
    const hit = ctx.pick(world)
    if (zAxis && lockedObjectAt(screen, ctx, hit)) {
      ctx.report(ctx.text.message("objectOnLockedLayer"), "error")
      ctx.report(ctx.text.message("noObjectFound"))
      return
    }
    if (!hit) {
      ctx.report(ctx.text.message("noObjectFound"))
      // WHY a click too: only a typed point is probed (p327, p328); the
      // console cannot click (desktop d06).
      if (!zAxis) this.keep(ctx, world)
      return
    }
    if (zAxis && !hasEnds(hit)) {
      ctx.report(ctx.text.message("zAxisNotSupported"))
      return
    }
    if (!zAxis && hit.type === "hatch") {
      // WHY once: the console writes it twice, taken for its artefact
      // until the desktop says otherwise (UCS-D63, d06).
      ctx.report(ctx.text.message("ucsNoCoordinateSystem"))
      return this.keep(ctx, world)
    }
    const entity = zAxis ? hit : alignable(hit)
    if (!entity) return
    const at = pickOn(ctx.viewport, entity, screen)
    const ucs = zAxis ? ucsAtEnd(entity, at) : ucsFromObject(entity, at)
    if (ucs) this.finish(ucs, null, ctx, { lastPoint: world })
  }

  /** OBject's pick takes objects on locked layers (probe ucs/p338). */
  picksLocked(): boolean {
    return this.state.phase === "object"
  }

  /**
   * WHY at OBject's pick: a typed object snap picks there, LASTPOINT at the
   * snapped point (probe ucs/p432); a mode's points are points already.
   * ZAxis Object's is unprobed.
   */
  takesSnapOverride(): boolean {
    return this.state.phase === "object" && !this.inMode()
  }

  answerTyped(text: string, ctx: ToolContext): boolean {
    return this.selector()?.answerTyped(text, ctx) ?? false
  }

  question(): PromptId | ToolQuestion {
    const state = this.state
    switch (state.phase) {
      case "origin":
        return "ucsOrigin"
      case "newUcs":
        return { id: "ucsNewUcs", enter: { name: "0,0,0" } }
      case "shift":
        return state.move
          ? { id: "ucsMoveOrigin", enter: { name: "0,0,0" }, tight: true }
          : { id: "ucsNewOrigin", enter: { name: "0,0,0" } }
      case "zdepth":
        return { id: "ucsZdepth", enter: { name: "0" }, tight: true }
      case "orthographic":
        return {
          id: "ucsOrthographic",
          enter: ORTHOGRAPHIC_NAMES[state.current],
          tight: true,
        }
      case "threeOrigin":
        return { id: "ucsNewOrigin", enter: { name: "0,0,0" } }
      case "xAxis":
        return state.three === null
          ? { id: "ucsXAxisPoint", enter: "ucsAccept" }
          : { id: "ucs3XAxisPoint", enter: { name: state.three } }
      case "xyPlane":
        return state.three === null
          ? { id: "ucsXYPlanePoint", enter: "ucsAccept" }
          : { id: "ucs3XYPlanePoint", enter: { name: state.three } }
      case "rotate":
        return {
          id: ROTATION_PROMPTS[state.axis],
          enter: { angle: DEFAULT_AXIS_ANGLE },
        }
      case "zOrigin":
        return { id: "ucsZAxisOrigin", enter: { name: "0,0,0" } }
      case "zPoint":
        return { id: "ucsZAxisPoint", enter: { name: state.enter } }
      case "zObject":
      case "object":
      case "face":
        return this.selectorOf(state.phase).question()
      case "named":
        return "enterAnOption"
      case "restore":
        return { id: "ucsRestoreName", takesSpaces: true }
      case "save":
        return { id: "ucsSaveName", takesSpaces: true }
      // WHY no keyword list: AutoCAD's yes-or-no question lists none, and
      // writes its default as the letter, with no colon (probe ucs/p231).
      case "replace":
        return {
          id: "ucsReplace",
          enter: { name: "N" },
          values: { name: state.name },
          open: true,
        }
      case "delete":
        return { id: "ucsDeleteNames", enter: "ucsNone", takesSpaces: true }
      case "list":
        return { id: "ucsListNames", enter: { name: "*" }, takesSpaces: true }
    }
  }

  defaultOption(): string | null {
    return this.state.phase === "origin" ? "World" : null
  }

  /** As AutoCAD's console refuses UCS's answers (probes ucs/p107, p116, p123). */
  takes(): QuestionInput | null {
    switch (this.state.phase) {
      case "rotate":
        return {
          refusal: "requiresAngle",
          values: { points: "second", keyword: "no" },
        }
      case "object":
      case "zObject":
      case "face":
        return this.selectorOf(this.state.phase).takes()
      case "replace":
        return { refusal: "yesOrNoPlease" }
      case "zdepth":
        return {
          refusal: "requiresDistance",
          values: { points: "two", keyword: "no" },
        }
      default:
        return null
    }
  }

  commandOptions(): readonly CommandOption[] {
    switch (this.state.phase) {
      case "origin":
        return [
          // Listed first, as 2027 lists it (probes ucs/p100, p101).
          { id: "Face" },
          { id: "NAmed" },
          { id: "OBject" },
          { id: "Previous" },
          { id: "View" },
          { id: "World" },
          { id: "X" },
          { id: "Y" },
          { id: "Z" },
          { id: "ZAxis" },
          ...HIDDEN_OPTIONS.map((id) => ({ id, hidden: true as const })),
        ]
      case "newUcs":
        return [
          ...NEW_UCS_OPTIONS.map((id) => ({ id })),
          ...NEW_UCS_HIDDEN.map((id) => ({ id, hidden: true as const })),
        ]
      case "shift":
        return this.state.move ? [{ id: "Zdepth" }] : []
      case "orthographic":
        return Object.keys(ORTHOGRAPHIC_OPTIONS).map((id) => ({ id }))
      case "zOrigin":
        return [{ id: "Object" }]
      case "object":
      case "zObject":
      case "face":
        return this.selectorOf(this.state.phase).commandOptions()
      case "named":
        return [
          { id: "Restore" },
          { id: "Save" },
          { id: "Delete" },
          { id: "?" },
          ...NAMED_HIDDEN.map((id) => ({ id, hidden: true as const })),
        ]
      case "restore":
      case "save":
        return [{ id: "?" }]
      case "replace":
        return [
          { id: "Yes", hidden: true },
          { id: "No", hidden: true },
        ]
      default:
        return []
    }
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    const state = this.state
    if (state.phase === "origin") return this.invokeMain(id, ctx)
    if (state.phase === "newUcs") {
      return [...NEW_UCS_OPTIONS, ...NEW_UCS_HIDDEN].includes(id)
        ? this.invokeMain(id, ctx)
        : "unhandled"
    }
    if (state.phase === "shift" && state.move && id === "Zdepth") {
      this.enterZdepth(ctx)
      return "continue"
    }
    if (state.phase === "orthographic" && id in ORTHOGRAPHIC_OPTIONS) {
      this.setOrthographic(ORTHOGRAPHIC_OPTIONS[id], ctx)
      return "end"
    }
    if (state.phase === "face" && FACE_MODES.some((mode) => mode === id)) {
      this.faceMode = id
    }
    const selector = this.selector()
    if (selector) {
      return selector.invokeOption(id, ctx) ? "continue" : "unhandled"
    }
    if (state.phase === "zOrigin" && id === "Object") {
      this.zObjects.start()
      this.state = { phase: "zObject", hover: null, locked: false }
      ctx.dynamicInput.open({ fields: [], commit: () => {} })
      this.place(ctx)
      return "continue"
    }
    if (state.phase === "named") {
      if (id === "?") {
        this.enterList("named", ctx)
        return "continue"
      }
      return this.invokeMain(id, ctx)
    }
    if ((state.phase === "restore" || state.phase === "save") && id === "?") {
      this.enterList(state.phase, ctx)
      return "continue"
    }
    if (state.phase === "replace") {
      if (id === "Yes") {
        this.save(state.name, ctx)
        return "end"
      }
      // No ends UCS as its Enter does, with nothing saved.
      if (id === "No") return "end"
    }
    return "unhandled"
  }

  /** A point on X leaves LASTPOINT at the origin (probes ucs/p111, p114, p264). */
  setsLastPoint(): boolean | null {
    return this.state.phase === "xAxis" ? false : null
  }

  getConstraintAnchor(ctx: ToolContext): Vec2 | null {
    return this.basis(ctx)?.base ?? null
  }

  /** The first prompt's and ZAxis's origin read `@` from LASTPOINT (ucs/p442). */
  relativeFromLastPoint(): boolean {
    return this.state.phase === "origin" || this.state.phase === "zOrigin"
  }

  /**
   * The base of a point prompt that has one, and the UCS its point is read
   * in: the first prompt's and ZAxis's origin from the current UCS's origin,
   * X, XY and ZAxis's Z from the new origin — AutoCAD 2027's `UseBasePoint`
   * there (probes ucs/p100, p111, p126), the band's start and what the box
   * measures from (desktop ucs/d04-1 to d04-8).
   */
  private basis(ctx: ToolContext): { base: Vec3; frame: Ucs } | null {
    const state = this.state
    switch (state.phase) {
      case "origin":
      case "zOrigin":
        return { base: ctx.ucs.origin, frame: ctx.ucs }
      case "xAxis":
        return {
          base: state.origin,
          frame: this.readIn(state.origin, state.three !== null, ctx),
        }
      case "xyPlane":
        return { base: state.origin, frame: state.readIn }
      case "zPoint":
        return { base: state.origin, frame: ctx.ucs }
      default:
        return null
    }
  }

  /** The length and the acute angle from the base to the cursor, in its frame. */
  private showFromBase(
    { base, frame }: { base: Vec3; frame: Ucs },
    cursor: Vec3,
    ctx: ToolContext
  ): void {
    const offset = worldDirectionToUcs(frame, sub3(cursor, base))
    const length = Math.hypot(offset.x, offset.y)
    ctx.dynamicInput.setLive("distance", length)
    ctx.dynamicInput.setLive(
      "angle",
      length > 1e-9 ? acuteHeading(headingInUcs(WORLD_UCS, offset)) : null
    )
  }

  /**
   * A point prompt with a base: the box's Length / Angle pair, as LINE's next
   * point has (desktop ucs/d04-6, d04-8). A coordinate typed there is
   * relative by default (`30,0` is echoed `@30,0`), from the base or, at the
   * origin prompts, LASTPOINT ({@link relativeFromLastPoint}); one typed at
   * the command line comes with its `#` and stays absolute. A length runs
   * from the base towards the cursor, or at the angle typed. `answer` takes the point,
   * `null` for Enter, and returns whether the prompt took it.
   */
  private openFromBase(
    ctx: ToolContext,
    answer: (point: Vec3 | null, ctx: ToolContext) => boolean
  ): void {
    const typed = (commitCtx: ToolContext): Vec3 | null => {
      const based = this.basis(commitCtx)
      return based && this.typedFromBase(based, commitCtx)
    }
    ctx.dynamicInput.open({
      fields: [
        { id: "distance", prompt: "length", kind: "distance" },
        { id: "angle", prompt: "angle", kind: "angle" },
      ],
      commit: (_values, commitCtx) => {
        const point = typed(commitCtx)
        if (point) answer(point, commitCtx)
      },
      commitRaw: (commitCtx) => {
        if (!commitCtx.dynamicInput.hasTypedText()) {
          return answer(null, commitCtx)
        }
        const point = typed(commitCtx)
        return point !== null && answer(point, commitCtx)
      },
    })
    ctx.dynamicInput.setLive("distance", 0)
    ctx.dynamicInput.setLive("angle", null)
    this.place(ctx)
  }

  /** What the box holds as a point, from `base` in `frame`; null if none. */
  private typedFromBase(
    { base, frame }: { base: Vec3; frame: Ucs },
    ctx: ToolContext
  ): Vec3 | null {
    const text = ctx.dynamicInput.getText("distance").trim()
    if (isCoordinateExpression(text)) {
      return parseCoordinate(text, {
        lastPoint: this.relativeFromLastPoint() ? ctx.lastPoint : base,
        relativeByDefault: true,
        ucs: frame,
        elevation: ctx.elevation,
      })
    }
    const angleText = ctx.dynamicInput.getText("angle").trim()
    const distance = text === "" ? null : parseNumber(text)
    const angle = angleText === "" ? null : parseAngleDegrees(angleText)
    if (
      (text !== "" && distance === null) ||
      (angleText !== "" && angle === null)
    ) {
      return null
    }
    if (distance === null && angle === null) return null
    const local = worldPointToUcs(frame, base)
    const cursor = this.cursor ? worldPointToUcs(frame, this.cursor) : local
    const along = pointAlongCursor({ ucs: WORLD_UCS }, local, cursor, {
      distance,
      angle,
    }) ?? { x: local.x + (distance ?? 0), y: local.y, z: local.z }
    return ucsPointToWorld(frame, along)
  }

  onPointerUp(input: PointerInput, ctx: ToolContext): void {
    if (this.inMode()) this.selector()?.onPointerUp(input, ctx)
  }

  /**
   * Enter in a mode's prompt is the mode's; orthoGraphic's takes its default,
   * NAmed's is the first prompt's World, though it shows none (probe ucs/p227).
   * ZAxis Object's pick asks again (AllowNone false), OBject's ends (p317).
   */
  onEnter(ctx: ToolContext): boolean {
    if (this.state.phase === "zObject" && !this.inMode()) {
      ctx.requestRender()
      return true
    }
    if (this.state.phase === "orthographic") {
      this.setOrthographic(this.state.current, ctx)
      ctx.endCommand()
      return true
    }
    if (this.state.phase === "named") {
      this.finish(WORLD_UCS, null, ctx, { resetsElevation: true })
      return true
    }
    return this.inMode() && (this.selector()?.onEnter(ctx) ?? false)
  }

  wantsSnap(): boolean {
    if (this.inMode()) return this.selector()?.wantsSnap() ?? false
    switch (this.state.phase) {
      case "origin":
      case "newUcs":
      case "shift":
      case "threeOrigin":
      case "xAxis":
      case "xyPlane":
      case "zOrigin":
      case "zPoint":
        return true
      case "rotate":
        return true
      default:
        return false
    }
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    const state = this.state
    if (this.inMode()) return this.selector()?.buildOverlay(ctx) ?? []
    if (state.phase === "object" || state.phase === "zObject") {
      const hovered = state.hover ? ctx.document.get(state.hover) : undefined
      if (!hovered) return []
      // WHY two looks: OBject's hover is the selection's glow, a locked
      // object's too, ZAxis Object's the white rollover (desktop ucs/d06-1,
      // d06-2, d06-6).
      return state.phase === "object"
        ? glow(ctx, hovered)
        : rollover(ctx, hovered)
    }
    const base =
      state.phase === "rotate" ? ctx.ucs.origin : this.basis(ctx)?.base
    if (!base || !this.cursor) return []
    // The dashed band from the base at every point prompt and at the
    // rotation's angle (desktop ucs/d04-1 to d04-5).
    return [
      {
        kind: "segment",
        a: ctx.viewport.worldToScreen(base),
        b: ctx.viewport.worldToScreen(this.cursor),
        stroke: { color: THEME.dashedRubberBand, width: 1, dash: [2, 3] },
      },
    ]
  }

  /**
   * The padlock over a locked object at OBject's pick, which takes it, and
   * at ZAxis Object's, which refuses it (desktop ucs/d06-2, d06-7).
   */
  cursorBadge(): CursorBadge | null {
    const state = this.state
    if (this.inMode()) return null
    if (state.phase !== "object" && state.phase !== "zObject") return null
    return state.locked ? "locked" : null
  }

  private invokeMain(id: string, ctx: ToolContext): CommandOptionOutcome {
    if (id in ORTHOGRAPHIC_OPTIONS) {
      this.setOrthographic(ORTHOGRAPHIC_OPTIONS[id], ctx)
      return "end"
    }
    switch (id) {
      case "World":
        this.apply(WORLD_UCS, null, ctx, { resetsElevation: true })
        return "end"
      case "Previous": {
        const previous = this.previous.pop()
        if (!previous) ctx.report(ctx.text.message("noPreviousUcs"))
        else {
          const table = ctx.document.getSettings().namedUcs
          const name =
            previous.name !== null && findNamed(table, previous.name)
              ? previous.name
              : null
          this.apply(previous.ucs, name, ctx, {
            remember: false,
            orthographic: previous.orthographic,
          })
        }
        return "end"
      }
      case "View": {
        const ucs = ucsFromAxes(
          ctx.ucs.origin,
          ctx.viewport.right,
          ctx.viewport.up
        )
        if (ucs) this.apply(ucs, null, ctx)
        return "end"
      }
      case "X":
      case "Y":
      case "Z": {
        const axis = id === "X" ? "x" : id === "Y" ? "y" : "z"
        this.state = { phase: "rotate", axis }
        ctx.dynamicInput.open({
          fields: [
            { id: "angle", prompt: ROTATION_PROMPTS[axis], kind: "angle" },
          ],
          commit: (values, commitCtx) => {
            this.rotate(axis, values.angle, commitCtx)
          },
          // The box reads the cursor's heading; Enter is still `<90>`.
          commitRaw: (commitCtx) => {
            if (commitCtx.dynamicInput.hasTypedText()) return false
            this.rotate(axis, DEFAULT_AXIS_ANGLE, commitCtx)
            return true
          },
        })
        ctx.dynamicInput.setDefault("angle", DEFAULT_AXIS_ANGLE)
        this.place(ctx)
        return "continue"
      }
      case "ZAxis":
        this.enterZOrigin(ctx)
        return "continue"
      case "NAmed":
        this.enterNamed(ctx)
        return "continue"
      case "OBject":
      // Entity is OBject's older name, which the console still takes.
      case "Entity":
        this.objects.start()
        this.state = { phase: "object", hover: null, locked: false }
        ctx.dynamicInput.open({ fields: [], commit: () => {} })
        this.place(ctx)
        return "continue"
      case "Origin":
        this.enterShift(false, ctx)
        return "continue"
      case "Move":
        this.enterShift(true, ctx)
        return "continue"
      case "3point":
        this.enterThreeOrigin(ctx)
        return "continue"
      case "orthoGraphic":
        // Its default is the orthographic UCS the current one was set as,
        // else Top (probes ucs/p214, p217).
        this.state = {
          phase: "orthographic",
          current: ctx.document.getSettings().ucsOrthographic ?? "top",
        }
        ctx.dynamicInput.open({ fields: [], commit: () => {} })
        this.place(ctx)
        return "continue"
      case "Restore":
        this.enterNamePrompt("restore", ctx)
        return "continue"
      case "Save":
        this.enterNamePrompt("save", ctx)
        return "continue"
      case "Delete":
        this.enterNamePrompt("delete", ctx)
        return "continue"
      case "?":
        this.enterList("origin", ctx)
        return "continue"
      case "New":
        this.enterNewUcs(ctx)
        return "continue"
      case "Face":
        this.faces.start()
        this.faceMode = null
        this.state = { phase: "face" }
        ctx.dynamicInput.open({ fields: [], commit: () => {} })
        this.place(ctx)
        return "continue"
      default:
        return "unhandled"
    }
  }

  private enterOrigin(ctx: ToolContext): void {
    this.state = { phase: "origin" }
    this.openFromBase(ctx, (point, commitCtx) => {
      if (point) this.enterXAxis(point, false, commitCtx)
      else this.finish(WORLD_UCS, null, commitCtx, { resetsElevation: true })
      return true
    })
  }

  /**
   * New's `Specify origin of new UCS or [ZAxis/3point/…] <0,0,0>`: a point
   * moves the origin, as Origin does; Enter is World, named `*WORLD*`,
   * whatever its `<0,0,0>` says (probes ucs/p218, p223).
   */
  private enterNewUcs(ctx: ToolContext): void {
    this.state = { phase: "newUcs" }
    this.openPointField("ucsNewUcs", ctx, (point, commitCtx) => {
      if (!point) return this.finish(WORLD_UCS, null, commitCtx)
      this.finish({ ...commitCtx.ucs, origin: point }, null, commitCtx, {
        lastPoint: point,
      })
    })
  }

  /**
   * Origin's `Specify new origin point <0,0,0>` and Move's, which offers
   * Zdepth: the axes kept. Origin's Enter sets the current UCS again, which
   * drops its name; Move's changes nothing (probes ucs/p203, p227, p246).
   */
  private enterShift(move: boolean, ctx: ToolContext): void {
    this.state = { phase: "shift", move }
    this.openPointField(
      move ? "ucsMoveOrigin" : "ucsNewOrigin",
      ctx,
      (point, commitCtx) => {
        if (point) this.shiftTo(point, move, commitCtx, point)
        else if (move) commitCtx.endCommand()
        else this.finish(commitCtx.ucs, null, commitCtx)
      }
    )
  }

  /**
   * The UCS moved to `origin`, its axes kept. Origin's answer drops the name;
   * Move's and Zdepth's keep it, orthographic or saved, and a saved one's
   * entry takes the moved UCS in the same step, so a later Restore gives it
   * (probes ucs/p227, p265, p266).
   */
  private shiftTo(
    origin: Vec3,
    move: boolean,
    ctx: ToolContext,
    lastPoint?: Vec3
  ): void {
    const ucs = { ...ctx.ucs, origin }
    const given = lastPoint ? { lastPoint } : {}
    if (!move) return this.finish(ucs, null, ctx, given)
    const settings = ctx.document.getSettings()
    this.finish(ucs, settings.ucsName, ctx, {
      ...given,
      orthographic: settings.ucsOrthographic,
      rewritesSaved: true,
    })
  }

  /** Move's Zdepth: the origin along the current Z, a distance or two points. */
  private enterZdepth(ctx: ToolContext): void {
    this.state = { phase: "zdepth" }
    const depthBy = (depth: number, commitCtx: ToolContext) => {
      const ucs = commitCtx.ucs
      this.shiftTo(
        add3(ucs.origin, scale3(ucsZAxis(ucs), depth)),
        true,
        commitCtx
      )
    }
    ctx.dynamicInput.open({
      fields: [{ id: "depth", prompt: "ucsZdepth", kind: "distance" }],
      commit: (values, commitCtx) => depthBy(values.depth, commitCtx),
      commitRaw: (commitCtx) => {
        if (commitCtx.dynamicInput.hasTypedText()) return false
        depthBy(0, commitCtx)
        return true
      },
    })
    this.place(ctx)
  }

  /**
   * 3point's `Specify new origin point <0,0,0>`, Enter the current origin —
   * given, as AutoCAD's console takes it for LASTPOINT (probe ucs/p263).
   */
  private enterThreeOrigin(ctx: ToolContext): void {
    this.state = { phase: "threeOrigin" }
    this.openPointField("ucsNewOrigin", ctx, (point, commitCtx) => {
      if (!point) commitCtx.setLastPoint(commitCtx.ucs.origin)
      this.enterXAxis(point ?? commitCtx.ucs.origin, true, commitCtx)
    })
  }

  /**
   * A prompt whose box takes a point, and Enter (`point` null) its default.
   */
  private openPointField(
    prompt: PromptId,
    ctx: ToolContext,
    answer: (point: Vec3 | null, ctx: ToolContext) => void
  ): void {
    ctx.dynamicInput.open({
      fields: [{ id: "point", prompt, kind: "coordinate" }],
      commit: () => {},
      commitRaw: (commitCtx) => {
        const text = commitCtx.dynamicInput.getText("point").trim()
        if (text === "") {
          answer(null, commitCtx)
          return true
        }
        const point = this.parse(text, null, commitCtx)
        if (!point) return false
        answer(point, commitCtx)
        return true
      },
    })
    this.place(ctx)
  }

  /**
   * The point on X after `origin`: the first prompt's (`<accept>` keeps the
   * axes) or 3point's, whose Enter takes one along the current X.
   */
  private enterXAxis(origin: Vec3, three: boolean, ctx: ToolContext): void {
    const along = add3(origin, ctx.ucs.xAxis)
    this.state = {
      phase: "xAxis",
      origin,
      three: three ? this.shown(along, ctx) : null,
    }
    this.openFromBase(ctx, (point, commitCtx) => {
      if (point) this.enterXYPlane(origin, point, three, commitCtx)
      else if (three) this.enterXYPlane(origin, along, true, commitCtx)
      else this.finish({ ...commitCtx.ucs, origin }, null, commitCtx)
      return true
    })
  }

  private enterXYPlane(
    origin: Vec3,
    onXAxis: Vec3,
    three: boolean,
    ctx: ToolContext
  ): void {
    const xAxis = sub3(onXAxis, origin)
    if (!(length3(xAxis) > 1e-9)) {
      ctx.report(ctx.text.message("coincidentWithFirstPoint"), "error")
      return
    }
    // Accepted, the new Y axis lies in the current UCS's XY plane.
    const level = cross3(ucsZAxis(ctx.ucs), xAxis)
    const towardsY = length3(level) > 1e-9 ? level : ctx.ucs.yAxis
    // WHY: the console reads the first prompt's third point in this frame —
    // the new origin, the new X, Y the current Z × the new X —, not in the
    // UCS moved there: `100,20` after X along `200,50` keeps Z up (probes
    // ucs/p120, p148, p150, p151, p401).
    const frame: Ucs = {
      origin,
      xAxis: scale3(xAxis, 1 / length3(xAxis)),
      yAxis: scale3(towardsY, 1 / length3(towardsY)),
    }
    const state = {
      phase: "xyPlane" as const,
      origin,
      xAxis,
      three: three
        ? this.shown(add3(origin, scale3(towardsY, 1 / length3(towardsY))), ctx)
        : null,
      readIn: three ? ctx.ucs : frame,
    }
    this.state = state
    this.openFromBase(ctx, (point, commitCtx) => {
      if (point) {
        this.acceptPlanePoint(state, point, commitCtx)
        return true
      }
      const ucs = ucsFromAxes(origin, xAxis, towardsY)
      if (ucs) this.finish(ucs, null, commitCtx)
      return true
    })
  }

  /** The third point, on the positive Y side of the new XY plane, and LASTPOINT. */
  private acceptPlanePoint(
    state: {
      readonly origin: Vec3
      readonly xAxis: Vec3
      readonly three: string | null
    },
    point: Vec3,
    ctx: ToolContext
  ): void {
    const ucs = ucsFromAxes(
      state.origin,
      state.xAxis,
      sub3(point, state.origin)
    )
    if (!ucs) {
      ctx.report(ctx.text.message("pointsAreColinear"), "error")
      return
    }
    this.finish(ucs, null, ctx, { lastPoint: point })
  }

  /** orthoGraphic's views, and the six words typed at the first prompt. */
  private setOrthographic(kind: OrthographicUcs, ctx: ToolContext): void {
    this.apply(orthographicUcs(kind), null, ctx, { orthographic: kind })
  }

  /** A point as a prompt's default writes it, in the current UCS. */
  private shown(point: Vec3, ctx: ToolContext): string {
    const settings = ctx.document.getSettings()
    const at = worldPointToUcs(ctx.ucs, point)
    return [at.x, at.y, at.z]
      .map((value) => formatLength(value, settings))
      .join(",")
  }

  private rotate(axis: Axis, degrees: number, ctx: ToolContext): void {
    if (!Number.isFinite(degrees)) return
    this.finish(rotateUcs(ctx.ucs, axis, (degrees * Math.PI) / 180), null, ctx)
  }

  /**
   * ZAxis: `Specify new origin point or [Object] <0,0,0>`, the current
   * origin by default — given, as 3point's (probes ucs/p127, p128).
   */
  private enterZOrigin(ctx: ToolContext): void {
    this.state = { phase: "zOrigin" }
    this.openFromBase(ctx, (point, commitCtx) => {
      if (!point) commitCtx.setLastPoint(commitCtx.ucs.origin)
      this.enterZPoint(point ?? commitCtx.ucs.origin, commitCtx)
      return true
    })
  }

  /**
   * The point on the positive Z axis. Its default keeps the current Z, which
   * only moves the UCS to the new origin.
   */
  private enterZPoint(origin: Vec3, ctx: ToolContext): void {
    const settings = ctx.document.getSettings()
    const up = worldPointToUcs(ctx.ucs, add3(origin, ucsZAxis(ctx.ucs)))
    const enter = [up.x, up.y, up.z]
      .map((value) => formatLength(value, settings))
      .join(",")
    this.state = { phase: "zPoint", origin, enter }
    this.openFromBase(ctx, (point, commitCtx) => {
      if (point) return this.acceptZPoint(origin, point, commitCtx)
      this.finish({ ...commitCtx.ucs, origin }, null, commitCtx)
      return true
    })
  }

  /** The point on Z; one on the origin is refused and asked again (probe ucs/p129). */
  private acceptZPoint(origin: Vec3, point: Vec3, ctx: ToolContext): boolean {
    const ucs = ucsAlongZ(origin, sub3(point, origin))
    if (!ucs) {
      if (length3(sub3(point, origin)) > 1e-9) return false
      ctx.report(ctx.text.message("pointsAreCoincident"), "error")
      return true
    }
    this.finish(ucs, null, ctx, { lastPoint: point })
    return true
  }

  /** `Enter an option [Restore/Save/Delete/?]:`, keywords alone (ucs/p230). */
  private enterNamed(ctx: ToolContext): void {
    this.state = { phase: "named" }
    ctx.dynamicInput.open({ fields: [], commit: () => {} })
    this.place(ctx)
  }

  private enterNamePrompt(
    phase: "restore" | "save" | "delete",
    ctx: ToolContext
  ): void {
    this.state = { phase }
    const prompt: PromptId =
      phase === "restore"
        ? "ucsRestoreName"
        : phase === "save"
          ? "ucsSaveName"
          : "ucsDeleteNames"
    this.openNameField(prompt, ctx)
  }

  private openNameField(prompt: PromptId, ctx: ToolContext): void {
    ctx.dynamicInput.open({
      fields: [{ id: "name", prompt, kind: "text" }],
      commit: () => {},
      commitRaw: (commitCtx) => {
        this.answerName(
          commitCtx.dynamicInput.getText("name").trim(),
          commitCtx
        )
        return true
      },
    })
    this.place(ctx)
  }

  private answerName(typed: string, ctx: ToolContext): void {
    const state = this.state
    const table = ctx.document.getSettings().namedUcs
    switch (state.phase) {
      case "restore": {
        if (typed === "?") return this.enterList("restore", ctx)
        if (typed === "") return ctx.endCommand()
        // A name no entry could hold is refused as a name, before it is
        // looked up (probe ucs/p235).
        if (INVALID_NAME.test(typed)) {
          ctx.report(ctx.text.message("invalidUcsName"), "error")
          return this.enterNamePrompt("restore", ctx)
        }
        const entry = findNamed(table, typed)
        if (!entry) {
          ctx.report(ctx.text.message("ucsUndefined", { name: typed }), "error")
          return this.enterNamePrompt("restore", ctx)
        }
        this.finish(entry.ucs, entry.name, ctx)
        return
      }
      case "save": {
        if (typed === "?") return this.enterList("save", ctx)
        if (typed === "") return ctx.endCommand()
        if (typed.length > 255 || INVALID_NAME.test(typed)) {
          ctx.report(ctx.text.message("invalidUcsName"), "error")
          return this.enterNamePrompt("save", ctx)
        }
        if (findNamed(table, typed)) {
          this.state = { phase: "replace", name: typed }
          ctx.dynamicInput.open({ fields: [], commit: () => {} })
          this.place(ctx)
          return
        }
        this.save(typed, ctx)
        return ctx.endCommand()
      }
      case "delete": {
        const patterns = typed.split(",").map((part) => part.trim())
        const doomed = table.filter((entry) =>
          patterns.some(
            (pattern) => pattern !== "" && matchesWildcard(entry.name, pattern)
          )
        )
        if (doomed.length > 0) {
          const settings = ctx.document.getSettings()
          const keep = table.filter((entry) => !doomed.includes(entry))
          const currentGone = doomed.some(
            (entry) => entry.name === settings.ucsName
          )
          ctx.execute(
            new UpdateSettingsCommand({
              namedUcs: keep,
              ...(currentGone ? { ucsName: null } : {}),
            })
          )
          ctx.report(ctx.text.message("ucsDeleted", { count: doomed.length }))
        } else if (typed !== "") {
          ctx.report(ctx.text.message("noMatchingUcs"))
        }
        return ctx.endCommand()
      }
      case "list": {
        listNamedUcs(typed === "" ? "*" : typed, ctx)
        if (state.back === "origin") return this.enterOrigin(ctx)
        if (state.back === "named") return this.enterNamed(ctx)
        return this.enterNamePrompt(state.back, ctx)
      }
    }
  }

  private enterList(back: ListBack, ctx: ToolContext): void {
    this.state = { phase: "list", back }
    this.openNameField("ucsListNames", ctx)
  }

  /**
   * Saves the current UCS as `name`; a replaced entry keeps its name as
   * stored and its place, `aa` over `AA` leaving `AA` (probe ucs/p232).
   */
  private save(name: string, ctx: ToolContext): void {
    const settings = ctx.document.getSettings()
    const stored = findNamed(settings.namedUcs, name)
    const entry = { name: stored?.name ?? name, ucs: settings.ucs }
    ctx.execute(
      new UpdateSettingsCommand({
        namedUcs: stored
          ? settings.namedUcs.map((old) => (old === stored ? entry : old))
          : [...settings.namedUcs, entry],
        ucsName: entry.name,
      })
    )
  }

  /**
   * Makes `ucs` current, one undo step, remembering the one it replaces
   * unless `remember` is false (Previous); `lastPoint` the point the
   * answer gave, where LASTPOINT goes, `orthographic` the view it is,
   * `resetsElevation` World's ELEVATION back to 0, and `rewritesSaved`
   * Move's saved entry of `name`, rewritten in the same patch.
   */
  private apply(
    ucs: Ucs,
    name: string | null,
    ctx: ToolContext,
    options: {
      readonly remember?: boolean
      readonly lastPoint?: Vec3
      readonly orthographic?: OrthographicUcs | null
      readonly resetsElevation?: boolean
      readonly rewritesSaved?: boolean
    } = {}
  ): void {
    const {
      remember = true,
      lastPoint,
      orthographic = null,
      resetsElevation = false,
      rewritesSaved = false,
    } = options
    if (lastPoint) ctx.setLastPoint(lastPoint)
    const settings = ctx.document.getSettings()
    const change = ucsChange(settings, ucs, name, orthographic, {
      resetsElevation,
    })
    const saved = rewritesSaved && name !== null ? name.toUpperCase() : null
    const patch =
      change && saved !== null
        ? {
            ...change,
            namedUcs: settings.namedUcs.map((entry) =>
              entry.name.toUpperCase() === saved ? { ...entry, ucs } : entry
            ),
          }
        : change
    // WHY: AutoCAD's console: U leaves LASTPOINT where a UCS made at the
    // first prompt left it, and puts it at the WCS's origin after any other
    // way; REDO puts it where the UCS left it (probes ucs/p163, p164). A run
    // that changes nothing but moved it (OBject on nothing) is still put
    // back so (p166).
    const state = this.state
    const left = ctx.lastPoint
    const firstPrompt =
      (state.phase === "xAxis" || state.phase === "xyPlane") &&
      state.three === null
    const undone = firstPrompt ? left : WCS_ORIGIN
    if (!patch && !(length3(sub3(undone, left)) > 1e-9)) return
    // World with the WCS current changes ELEVATION only: none to step back to.
    const turns = patch !== null && ucsChange(settings, ucs, name, orthographic)
    if (turns && remember) {
      this.previous.push({
        ucs: settings.ucs,
        name: settings.ucsName,
        orthographic: settings.ucsOrthographic,
      })
      if (this.previous.length > MAX_PREVIOUS) this.previous.shift()
    }
    ctx.execute(
      new UpdateSettingsCommand(patch ?? {}, { undone, redone: left })
    )
  }

  /** {@link apply} as the command's last answer, from a prompt that ends it itself. */
  private finish(
    ucs: Ucs,
    name: string | null,
    ctx: ToolContext,
    options?: Parameters<UcsTool["apply"]>[3]
  ): void {
    this.apply(ucs, name, ctx, options)
    ctx.endCommand()
  }

  private parse(
    text: string,
    from: Vec3 | null,
    ctx: ToolContext,
    ucs: Ucs = ctx.ucs
  ): Vec3 | null {
    if (!isCoordinateExpression(text)) return null
    return parseCoordinate(text, {
      lastPoint: from ?? ctx.lastPoint,
      relativeByDefault: from !== null,
      ucs,
      elevation: ctx.elevation,
    })
  }

  /**
   * Where the first prompt's point on X is read: the UCS moved to the origin
   * given, its axes kept — AutoCAD's console lays X along `200,50` typed
   * after the origin `100,0` (probes ucs/p111, p113); 3point reads it in the
   * current UCS. The third point is read otherwise ({@link enterXYPlane}).
   */
  private readIn(origin: Vec3, three: boolean, ctx: ToolContext): Ucs {
    return three ? ctx.ucs : { ...ctx.ucs, origin }
  }

  private place(ctx: ToolContext): void {
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }
}

/** What `Current ucs name:` prints: *WORLD*, *NO NAME*, *TOP* or the saved name. */
export function currentName(settings: DocumentSettings): {
  kind: "world" | "unnamed" | "named" | OrthographicUcs
  name: string
} {
  if (settings.ucsName !== null)
    return { kind: "named", name: settings.ucsName }
  // The WCS set as Top is `*TOP*` (probes ucs/p106, p153, p202, p217).
  if (settings.ucsOrthographic !== null)
    return { kind: settings.ucsOrthographic, name: "" }
  return { kind: isWorldUcs(settings.ucs) ? "world" : "unnamed", name: "" }
}

export function findNamed(
  table: readonly NamedUcs[],
  name: string
): NamedUcs | null {
  const key = name.toUpperCase()
  return table.find((entry) => entry.name.toUpperCase() === key) ?? null
}

/**
 * The `?` listing of UCS and PLAN, laid out as AutoCAD prints it: each saved
 * UCS matching `patterns`, its origin and axes relative to the current UCS in
 * the drawing's units, or `No matching UCS names found.`
 */
export function listNamedUcs(patterns: string, ctx: ToolContext): void {
  const settings = ctx.document.getSettings()
  const wanted = patterns.split(",").map((part) => part.trim())
  // WHY not currentName: the listing names no orthographic UCS, `*TOP*`
  // listed `*WORLD*` and `*FRONT*` `*NO NAME*` (probes ucs/p219, p253, p261).
  const listed = currentName({ ...settings, ucsOrthographic: null })
  const lines = [
    ctx.text.message("listedUcsName", listed),
    "",
    ctx.text.message("savedUcsHeader"),
    "",
  ]
  const fmt = (value: number) => formatLength(value, settings)
  const matching = settings.namedUcs.filter((entry) =>
    wanted.some((pattern) => matchesWildcard(entry.name, pattern))
  )
  if (matching.length === 0) lines.push(ctx.text.message("noMatchingUcs"))
  for (const entry of matching) {
    const origin = worldPointToUcs(ctx.ucs, entry.ucs.origin)
    const x = worldDirectionToUcs(ctx.ucs, entry.ucs.xAxis)
    const y = worldDirectionToUcs(ctx.ucs, entry.ucs.yAxis)
    const z = worldDirectionToUcs(ctx.ucs, ucsZAxis(entry.ucs))
    lines.push(
      ctx.text.message("savedUcsEntry", {
        name: entry.name,
        originX: fmt(origin.x),
        originY: fmt(origin.y),
        originZ: fmt(origin.z),
        xAxisX: fmt(x.x),
        xAxisY: fmt(x.y),
        xAxisZ: fmt(x.z),
        yAxisX: fmt(y.x),
        yAxisY: fmt(y.y),
        yAxisZ: fmt(y.z),
        zAxisX: fmt(z.x),
        zAxisY: fmt(z.y),
        zAxisZ: fmt(z.z),
      })
    )
  }
  ctx.report(lines.join("\n"))
}

/**
 * The patch that makes `ucs` current under `name` (or as an `orthographic`
 * one), or `null` when nothing changes: UCS, and -VIEW aligning the UCS with
 * an orthographic view. ELEVATION goes back to 0 only where the caller says
 * (`resetsElevation`): UCS World and -VIEW's orthographic views do, even
 * with that UCS current already; Previous, a restored name or orthoGraphic
 * reaching the WCS do not (probes ucs/p152, p153, p400, p403).
 */
export function ucsChange(
  settings: DocumentSettings,
  ucs: Ucs,
  name: string | null,
  orthographic: OrthographicUcs | null = null,
  { resetsElevation = false }: { readonly resetsElevation?: boolean } = {}
): Partial<DocumentSettings> | null {
  const elevation = resetsElevation && settings.elevation !== 0
  if (
    !elevation &&
    sameUcs(ucs, settings.ucs) &&
    name === settings.ucsName &&
    orthographic === settings.ucsOrthographic
  ) {
    return null
  }
  return {
    ucs,
    ucsName: name,
    ucsOrthographic: orthographic,
    ...(elevation ? { elevation: 0 } : {}),
  }
}

/**
 * Where a click at `screen` picks `entity`, in the object's own coordinates:
 * on its plane, or a point along a line as it is drawn, with its Z.
 */
function pickOn(viewport: Viewport, entity: Entity, screen: Vec2): Vec2 | Vec3 {
  if (entity.type !== "line") {
    return cursorOnEntityPlane(viewport, entity, screen)
  }
  const start = { ...entity.start, z: lineStartZ(entity) }
  const end = { ...entity.end, z: lineEndZ(entity) }
  const { t } = closestPointOnInfiniteLine(
    viewport.worldToScreen(start),
    viewport.worldToScreen(end),
    screen
  )
  const along = Number.isFinite(t) ? t : 0
  return add3(start, scale3(sub3(end, start), along))
}

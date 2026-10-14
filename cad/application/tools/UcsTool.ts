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
import { DocumentSettings, formatLength } from "../../domain/units"
import { matchesWildcard } from "../../shared/wildcard"
import { UpdateSettingsCommand } from "../commands/settingsCommands"
import { entityScenePrimitive } from "../SceneBuilder"
import { Viewport } from "../Viewport"
import { cursorOnEntityPlane } from "../viewPick"
import { THEME } from "../../scene/theme"
import { ScenePrimitive } from "../../scene/types"
import type { PromptId } from "../../locales/types"
import {
  isCoordinateExpression,
  parseCoordinate,
} from "../input/coordinateInput"
import {
  CommandOption,
  CommandOptionOutcome,
  PointerInput,
  QuestionInput,
  Tool,
  ToolContext,
  ToolQuestion,
} from "./Tool"
import { headingInUcs } from "./ucsHeading"
import { ONE_OBJECT_MODES, ObjectSelector } from "./objectSelection"
import {
  alignable,
  hasEnds,
  ucsAlongZ,
  ucsAtEnd,
  ucsFromObject,
  unpickedStart,
} from "./ucsObjects"

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
    }
  | { readonly phase: "rotate"; readonly axis: Axis }
  | { readonly phase: "zOrigin" }
  | {
      readonly phase: "zPoint"
      readonly origin: Vec3
      /** The point Enter keeps, as the prompt shows it: one up the current Z. */
      readonly enter: string
    }
  | { readonly phase: "zObject"; readonly hover: EntityId | null }
  | { readonly phase: "named" }
  | { readonly phase: "restore" }
  | { readonly phase: "save" }
  | { readonly phase: "replace"; readonly name: string }
  | { readonly phase: "delete" }
  | { readonly phase: "list"; readonly back: ListBack }
  | { readonly phase: "object"; readonly hover: EntityId | null }

/** The prompt a `?` listing asks again once it is written. */
type ListBack = "origin" | "named" | "restore" | "save"

/** UCSAXISANG's initial value, which the X, Y and Z options offer as their default. */
const DEFAULT_AXIS_ANGLE = 90
/**
 * Where UCS Previous and a restored named UCS put LASTPOINT: the WCS's
 * origin, not the restored UCS's (AutoCAD 2023's console, acc/u4, u7, u8).
 */
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
 * The words the first prompt declares and does not list, in its `initget`'s
 * order (table 25652): Face, which needs solids, only so that `F` is
 * refused as the console takes it, rather than read as `FRont`.
 */
const HIDDEN_OPTIONS = [
  "Origin",
  "Face",
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

/** New's `Specify origin of new UCS or [ZAxis/3point/OBject/View/X/Y/Z]`. */
const NEW_UCS_OPTIONS = ["ZAxis", "3point", "OBject", "View", "X", "Y", "Z"]
/** What New's `initget` declares and does not list (table 25627). */
const NEW_UCS_HIDDEN = ["Origin", "Face", "Entity"]

/**
 * AutoCAD's UCS: the origin and the three points, the X, Y and Z turns,
 * ZAxis (with its Object), OBject, View, World, Previous and the named UCSs,
 * and the words its first prompt takes unlisted — Origin, 3point, Entity,
 * Move, orthoGraphic and its six views, Restore, Save, Delete, `?` and New,
 * the older prompts AutoCAD 2023's console still answers them with. Face is
 * not offered: there are no solids. It works in the WCS, since it is what
 * places the UCS the other commands work in.
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
   * The selection modes typed at OBject's and ZAxis Object's picks; AutoCAD
   * 2023's console takes the newest object found, and reads OBject's at its
   * start and ZAxis's at the end nearer the WCS origin, as with no pick.
   */
  private readonly modes = new ObjectSelector({
    takes: () => "singleSet",
    done: () => {},
    question: () =>
      this.state.phase === "zObject" ? "selectObject" : "ucsAlignObject",
    modes: ONE_OBJECT_MODES,
    accept: (ids, ctx) =>
      ids.filter((id) => {
        const entity = ctx.document.get(id) ?? null
        return this.state.phase === "zObject"
          ? hasEnds(entity)
          : alignable(entity) !== null
      }),
    one: {
      take: (entity, ctx) => {
        const ucs =
          this.state.phase === "zObject"
            ? ucsAtEnd(entity, { x: 0, y: 0, z: 0 })
            : ucsFromObject(entity, unpickedStart(entity))
        if (ucs) this.finish(ucs, null, ctx)
      },
      newest: true,
    },
  })

  /** Whether a selection mode's own prompt is asking, at an object's pick. */
  private inMode(): boolean {
    const { phase } = this.state
    return (phase === "object" || phase === "zObject") && this.modes.inMode()
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
      this.modes.onPointerMove(input, ctx)
      return
    }
    const state = this.state
    if (state.phase === "object") {
      const hover = alignable(ctx.pick(input.world))?.id ?? null
      if (hover !== state.hover) this.state = { phase: "object", hover }
    }
    if (state.phase === "zObject") {
      const hit = ctx.pick(input.world)
      const hover = hasEnds(hit) ? hit.id : null
      if (hover !== state.hover) this.state = { phase: "zObject", hover }
    }
    if (state.phase === "rotate" && state.axis === "z") {
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
      this.modes.onPointerDown(input, ctx)
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
      case "shift":
        this.finish({ ...ctx.ucs, origin: input.point }, null, ctx)
        return
      case "xAxis":
        this.enterXYPlane(state.origin, input.point, state.three !== null, ctx)
        return
      case "xyPlane":
        this.acceptPlanePoint(state, input.point, ctx)
        return
      case "rotate": {
        if (state.axis !== "z") return
        const offset = sub3(input.point, ctx.ucs.origin)
        if (V.length(worldDirectionToUcs(ctx.ucs, offset)) > 1e-9) {
          this.rotate("z", headingInUcs(ctx.ucs, offset), ctx)
        }
        return
      }
      case "zOrigin":
        this.enterZPoint(input.point, ctx)
        return
      case "zPoint":
        this.acceptZPoint(state.origin, input.point, ctx)
        return
      case "object": {
        const entity = alignable(ctx.pick(input.world))
        const ucs = entity
          ? ucsFromObject(entity, pickOn(ctx.viewport, entity, input.screen))
          : null
        if (ucs) this.finish(ucs, null, ctx)
        return
      }
      case "zObject": {
        const entity = ctx.pick(input.world)
        const ucs = hasEnds(entity)
          ? ucsAtEnd(entity, pickOn(ctx.viewport, entity, input.screen))
          : null
        if (ucs) this.finish(ucs, null, ctx)
        return
      }
    }
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
        return this.modes.question()
      case "named":
        return "enterAnOption"
      case "restore":
        return "ucsRestoreName"
      case "save":
        return "ucsSaveName"
      // WHY no keyword list: AutoCAD's yes-or-no question lists none, and
      // writes its default as the letter.
      case "replace":
        return {
          id: "ucsReplace",
          enter: { name: "N" },
          values: { name: state.name },
        }
      case "delete":
        return { id: "ucsDeleteNames", enter: "ucsNone" }
      case "list":
        return { id: "ucsListNames", enter: { name: "*" } }
    }
  }

  defaultOption(): string | null {
    return this.state.phase === "origin" ? "World" : null
  }

  /** As AutoCAD 2023's console refuses UCS's answers. */
  takes(): QuestionInput | null {
    switch (this.state.phase) {
      case "rotate":
        return {
          refusal: "requiresAngle",
          values: { points: "second", keyword: "no" },
        }
      case "object":
      case "zObject":
        return this.modes.takes()
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
        return this.modes.commandOptions()
      case "named":
        return [
          { id: "Restore" },
          { id: "Save" },
          { id: "Delete" },
          { id: "?" },
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
    if (state.phase === "object" || state.phase === "zObject") {
      return this.modes.invokeOption(id, ctx) ? "continue" : "unhandled"
    }
    if (state.phase === "zOrigin" && id === "Object") {
      this.modes.start()
      this.state = { phase: "zObject", hover: null }
      ctx.dynamicInput.open({ fields: [], commit: () => {} })
      this.place(ctx)
      return "continue"
    }
    if (state.phase === "named") {
      switch (id) {
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
          this.enterList("named", ctx)
          return "continue"
      }
    }
    if ((state.phase === "restore" || state.phase === "save") && id === "?") {
      this.enterList(state.phase, ctx)
      return "continue"
    }
    if (state.phase === "replace") {
      if (id === "Yes") {
        this.save(state.name, ctx)
        ctx.setLastPoint(WCS_ORIGIN)
        return "end"
      }
      // No ends UCS as its Enter does, with nothing saved.
      if (id === "No") {
        ctx.setLastPoint(WCS_ORIGIN)
        return "end"
      }
    }
    return "unhandled"
  }

  getConstraintAnchor(): Vec2 | null {
    switch (this.state.phase) {
      case "xAxis":
      case "xyPlane":
      case "zPoint":
        return this.state.origin
      default:
        return null
    }
  }

  onPointerUp(input: PointerInput, ctx: ToolContext): void {
    if (this.inMode()) this.modes.onPointerUp(input, ctx)
  }

  /** Enter in a mode's prompt is the mode's; orthoGraphic's takes its default. */
  onEnter(ctx: ToolContext): boolean {
    if (this.state.phase === "orthographic") {
      this.setOrthographic(this.state.current, ctx)
      ctx.endCommand()
      return true
    }
    return this.inMode() && this.modes.onEnter(ctx)
  }

  wantsSnap(): boolean {
    if (this.inMode()) return this.modes.wantsSnap()
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
        return this.state.axis === "z"
      default:
        return false
    }
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    const state = this.state
    if (this.inMode()) return this.modes.buildOverlay(ctx)
    if (state.phase === "object" || state.phase === "zObject") {
      const hovered = state.hover ? ctx.document.get(state.hover) : undefined
      return hovered
        ? entityScenePrimitive(
            ctx.viewport,
            hovered,
            { color: THEME.selected, width: 2 },
            { blocks: ctx.blocks }
          )
        : []
    }
    if (
      (state.phase === "xAxis" ||
        state.phase === "xyPlane" ||
        state.phase === "zPoint") &&
      this.cursor
    ) {
      return [
        {
          kind: "segment",
          a: ctx.viewport.worldToScreen(state.origin),
          b: ctx.viewport.worldToScreen(this.cursor),
          stroke: { color: THEME.rubberBand, width: 1 },
        },
      ]
    }
    return []
  }

  private invokeMain(id: string, ctx: ToolContext): CommandOptionOutcome {
    if (id in ORTHOGRAPHIC_OPTIONS) {
      this.setOrthographic(ORTHOGRAPHIC_OPTIONS[id], ctx)
      return "end"
    }
    switch (id) {
      case "World":
        this.apply(WORLD_UCS, null, ctx)
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
            lastPoint: WCS_ORIGIN,
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
          // About Z the box reads the cursor's heading; Enter is still `<90>`.
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
        this.modes.start()
        this.state = { phase: "object", hover: null }
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
        // else Top (AutoCAD 2023's console, acc/p4, q12, q13, q21).
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
      // Face opens a solid's face, which there is none of: refused.
      default:
        return "unhandled"
    }
  }

  private enterOrigin(ctx: ToolContext): void {
    this.state = { phase: "origin" }
    ctx.dynamicInput.open({
      fields: [{ id: "point", prompt: "ucsOrigin", kind: "coordinate" }],
      commit: () => {},
      commitRaw: (commitCtx) => {
        const text = commitCtx.dynamicInput.getText("point").trim()
        if (text === "") {
          this.finish(WORLD_UCS, null, commitCtx)
          return true
        }
        const point = this.parse(text, null, commitCtx)
        if (!point) return false
        this.enterXAxis(point, false, commitCtx)
        return true
      },
    })
    this.place(ctx)
  }

  /**
   * New's `Specify origin of new UCS or [ZAxis/3point/…] <0,0,0>`: a point
   * moves the origin, as Origin does; Enter keeps the UCS, and puts LASTPOINT
   * at its origin (AutoCAD 2023's console, acc/q6).
   */
  private enterNewUcs(ctx: ToolContext): void {
    this.state = { phase: "newUcs" }
    this.openPointField("ucsNewUcs", ctx, (point, commitCtx) =>
      this.finish(
        { ...commitCtx.ucs, origin: point ?? commitCtx.ucs.origin },
        null,
        commitCtx
      )
    )
  }

  /**
   * Origin's `Specify new origin point <0,0,0>` and Move's, which offers
   * Zdepth: the axes kept. Enter changes nothing and, as everything that
   * changes nothing, puts LASTPOINT at the WCS's origin (acc/p2, q2).
   */
  private enterShift(move: boolean, ctx: ToolContext): void {
    this.state = { phase: "shift", move }
    this.openPointField(
      move ? "ucsMoveOrigin" : "ucsNewOrigin",
      ctx,
      (point, commitCtx) => {
        if (point)
          this.finish({ ...commitCtx.ucs, origin: point }, null, commitCtx)
        else this.endUnchanged(commitCtx)
      }
    )
  }

  /**
   * Move's Zdepth: the origin along the current Z, a distance or two points.
   * LASTPOINT goes to the WCS's origin, not the new one (acc/p1, q14).
   */
  private enterZdepth(ctx: ToolContext): void {
    this.state = { phase: "zdepth" }
    const depthBy = (depth: number, commitCtx: ToolContext) => {
      const ucs = commitCtx.ucs
      const origin = add3(ucs.origin, scale3(ucsZAxis(ucs), depth))
      this.finish({ ...ucs, origin }, null, commitCtx, {
        lastPoint: WCS_ORIGIN,
      })
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

  /** 3point's `Specify new origin point <0,0,0>`, Enter the current origin. */
  private enterThreeOrigin(ctx: ToolContext): void {
    this.state = { phase: "threeOrigin" }
    this.openPointField("ucsNewOrigin", ctx, (point, commitCtx) =>
      this.enterXAxis(point ?? commitCtx.ucs.origin, true, commitCtx)
    )
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
    ctx.dynamicInput.open({
      fields: [
        {
          id: "point",
          prompt: three ? "ucs3XAxisPoint" : "ucsXAxisPoint",
          kind: "coordinate",
        },
      ],
      commit: () => {},
      commitRaw: (commitCtx) => {
        if (this.state.phase !== "xAxis") return false
        const text = commitCtx.dynamicInput.getText("point").trim()
        if (text === "") {
          if (three) this.enterXYPlane(origin, along, true, commitCtx)
          else this.finish({ ...commitCtx.ucs, origin }, null, commitCtx)
          return true
        }
        const point = this.parse(text, origin, commitCtx)
        if (!point) return false
        this.enterXYPlane(origin, point, three, commitCtx)
        return true
      },
    })
    this.place(ctx)
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
    const state = {
      phase: "xyPlane" as const,
      origin,
      xAxis,
      three: three
        ? this.shown(add3(origin, scale3(towardsY, 1 / length3(towardsY))), ctx)
        : null,
    }
    this.state = state
    ctx.dynamicInput.open({
      fields: [
        {
          id: "point",
          prompt: three ? "ucs3XYPlanePoint" : "ucsXYPlanePoint",
          kind: "coordinate",
        },
      ],
      commit: () => {},
      commitRaw: (commitCtx) => {
        if (this.state.phase !== "xyPlane") return false
        const text = commitCtx.dynamicInput.getText("point").trim()
        if (text === "") {
          const ucs = ucsFromAxes(origin, xAxis, towardsY)
          if (ucs) this.finish(ucs, null, commitCtx)
          return true
        }
        const point = this.parse(text, origin, commitCtx)
        if (!point) return false
        this.acceptPlanePoint(state, point, commitCtx)
        return true
      },
    })
    this.place(ctx)
  }

  /**
   * The third point, on the positive Y side of the new XY plane. LASTPOINT
   * then is that point, where AutoCAD 2023's console puts it: 3point's
   * where it was given (acc/u5, p17), the first prompt's at the numbers it
   * was given in, read in the new UCS (q10).
   */
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
    const lastPoint =
      state.three === null
        ? ucsPointToWorld(ucs, worldPointToUcs(ctx.ucs, point))
        : point
    this.finish(ucs, null, ctx, { lastPoint })
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

  /**
   * UCS ending with the UCS unchanged — Enter at Origin's or Move's point, a
   * name saved, deleted or none restored: LASTPOINT goes to the WCS's origin
   * (AutoCAD 2023's console, acc/p2, q1–q8, q16, q17).
   */
  private endUnchanged(ctx: ToolContext): void {
    ctx.setLastPoint(WCS_ORIGIN)
    ctx.endCommand()
  }

  private rotate(axis: Axis, degrees: number, ctx: ToolContext): void {
    if (!Number.isFinite(degrees)) return
    this.finish(rotateUcs(ctx.ucs, axis, (degrees * Math.PI) / 180), null, ctx)
  }

  /** ZAxis: `Specify new origin point or [Object] <0,0,0>`, the current origin by default. */
  private enterZOrigin(ctx: ToolContext): void {
    this.state = { phase: "zOrigin" }
    ctx.dynamicInput.open({
      fields: [{ id: "point", prompt: "ucsZAxisOrigin", kind: "coordinate" }],
      commit: () => {},
      commitRaw: (commitCtx) => {
        const text = commitCtx.dynamicInput.getText("point").trim()
        const point =
          text === "" ? commitCtx.ucs.origin : this.parse(text, null, commitCtx)
        if (!point) return false
        this.enterZPoint(point, commitCtx)
        return true
      },
    })
    this.place(ctx)
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
    ctx.dynamicInput.open({
      fields: [{ id: "point", prompt: "ucsZAxisPoint", kind: "coordinate" }],
      commit: () => {},
      commitRaw: (commitCtx) => {
        const text = commitCtx.dynamicInput.getText("point").trim()
        if (text === "") {
          this.finish({ ...commitCtx.ucs, origin }, null, commitCtx)
          return true
        }
        const point = this.parse(text, origin, commitCtx)
        if (!point) return false
        return this.acceptZPoint(origin, point, commitCtx)
      },
    })
    this.place(ctx)
  }

  private acceptZPoint(origin: Vec3, point: Vec3, ctx: ToolContext): boolean {
    const ucs = ucsAlongZ(origin, sub3(point, origin))
    if (!ucs) return false
    this.finish(ucs, null, ctx)
    return true
  }

  /** `Enter an option [Restore/Save/Delete/?]:`, keywords alone. */
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
        if (typed === "") return this.endUnchanged(ctx)
        const entry = findNamed(table, typed)
        if (!entry) {
          ctx.report(ctx.text.message("ucsUndefined", { name: typed }), "error")
          return this.enterNamePrompt("restore", ctx)
        }
        this.finish(entry.ucs, entry.name, ctx, { lastPoint: WCS_ORIGIN })
        return
      }
      case "save": {
        if (typed === "?") return this.enterList("save", ctx)
        if (typed === "") return this.endUnchanged(ctx)
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
        return this.endUnchanged(ctx)
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
        return this.endUnchanged(ctx)
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

  private save(name: string, ctx: ToolContext): void {
    const settings = ctx.document.getSettings()
    const table = settings.namedUcs.filter(
      (entry) => entry.name.toUpperCase() !== name.toUpperCase()
    )
    ctx.execute(
      new UpdateSettingsCommand({
        namedUcs: [...table, { name, ucs: settings.ucs }],
        ucsName: name,
      })
    )
  }

  /**
   * Makes `ucs` current, one undo step, remembering the one it replaces
   * unless `remember` is false (Previous); `lastPoint` where LASTPOINT
   * goes, when not to the new origin, and `orthographic` the view it is.
   */
  private apply(
    ucs: Ucs,
    name: string | null,
    ctx: ToolContext,
    options: {
      readonly remember?: boolean
      readonly lastPoint?: Vec3
      readonly orthographic?: OrthographicUcs | null
    } = {}
  ): void {
    const { remember = true, lastPoint, orthographic = null } = options
    const settings = ctx.document.getSettings()
    const patch = ucsChange(settings, ucs, name, orthographic)
    if (!patch) {
      // acc/a11: World in the WCS changes nothing and still puts it there;
      // so do 3point's and New's Enter, at the origin they keep (p9, q6).
      ctx.setLastPoint(lastPoint ?? ucs.origin)
      return
    }
    if (remember) {
      this.previous.push({
        ucs: settings.ucs,
        name: settings.ucsName,
        orthographic: settings.ucsOrthographic,
      })
      if (this.previous.length > MAX_PREVIOUS) this.previous.shift()
    }
    // WHY: AutoCAD 2023's console: U puts LASTPOINT back at an origin
    // given at the first prompt (acc/a2, a5, a14 of the elliptical arcs
    // session), at the WCS's origin after any other way (a1, a4, a9, a12,
    // a20–a24); REDO puts it where the UCS did (a7, a8, a16).
    // 3point's origin is not one: U puts it at the WCS's (acc/u8).
    const state = this.state
    const given =
      (state.phase === "xAxis" || state.phase === "xyPlane") &&
      state.three === null
        ? state.origin
        : WCS_ORIGIN
    ctx.execute(
      new UpdateSettingsCommand(patch, {
        undone: given,
        redone: lastPoint ?? ucs.origin,
      })
    )
    if (lastPoint) ctx.setLastPoint(lastPoint)
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
    ctx: ToolContext
  ): Vec3 | null {
    if (!isCoordinateExpression(text)) return null
    return parseCoordinate(text, {
      lastPoint: from ?? ctx.lastPoint,
      relativeByDefault: from !== null,
      ucs: ctx.ucs,
      elevation: ctx.elevation,
    })
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
  // acc/p32: the WCS set as Top is `*TOP*`.
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
  const lines = [
    ctx.text.message("listedUcsName", currentName(settings)),
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
 * one), or `null` when it already is: UCS, and -VIEW aligning the UCS with
 * an orthographic view. Changing to
 * the WCS puts ELEVATION back to 0, as ELEV documents.
 */
export function ucsChange(
  settings: DocumentSettings,
  ucs: Ucs,
  name: string | null,
  orthographic: OrthographicUcs | null = null
): Partial<DocumentSettings> | null {
  if (
    sameUcs(ucs, settings.ucs) &&
    name === settings.ucsName &&
    orthographic === settings.ucsOrthographic
  ) {
    return null
  }
  const toWorld = isWorldUcs(ucs) && settings.elevation !== 0
  return {
    ucs,
    ucsName: name,
    ucsOrthographic: orthographic,
    ...(toWorld ? { elevation: 0 } : {}),
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

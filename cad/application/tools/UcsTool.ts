import { Vec2, V } from "../../geometry/Vec2"
import { Vec3, add3, cross3, length3, scale3, sub3 } from "../../geometry/Vec3"
import { closestPointOnInfiniteLine } from "../../geometry/primitives"
import { Entity, EntityId, lineEndZ, lineStartZ } from "../../domain/entities"
import {
  NamedUcs,
  Ucs,
  WORLD_UCS,
  isWorldUcs,
  rotateUcs,
  sameUcs,
  ucsFromAxes,
  ucsZAxis,
  worldDirectionToUcs,
  worldPointToUcs,
} from "../../domain/ucs"
import { DocumentSettings } from "../../domain/units"
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
  Tool,
  ToolContext,
} from "./Tool"
import { headingInUcs } from "./ucsHeading"
import {
  alignable,
  hasEnds,
  ucsAlongZ,
  ucsAtEnd,
  ucsFromObject,
} from "./ucsObjects"

type Axis = "x" | "y" | "z"

type UcsState =
  | { readonly phase: "origin" }
  | { readonly phase: "xAxis"; readonly origin: Vec3 }
  | { readonly phase: "xyPlane"; readonly origin: Vec3; readonly xAxis: Vec3 }
  | { readonly phase: "rotate"; readonly axis: Axis }
  | { readonly phase: "zOrigin" }
  | { readonly phase: "zPoint"; readonly origin: Vec3 }
  | { readonly phase: "zObject"; readonly hover: EntityId | null }
  | { readonly phase: "named" }
  | { readonly phase: "restore" }
  | { readonly phase: "save" }
  | { readonly phase: "replace"; readonly name: string }
  | { readonly phase: "delete" }
  | { readonly phase: "list"; readonly back: "named" | "restore" | "save" }
  | { readonly phase: "object"; readonly hover: EntityId | null }

/** UCSAXISANG's initial value, which the X, Y and Z options offer as their default. */
const DEFAULT_AXIS_ANGLE = 90
/** UCS Previous steps back through the last 10 of the session. */
const MAX_PREVIOUS = 10
/** Characters a symbol-table name may not hold (AutoCAD's naming rule). */
const INVALID_NAME = /[\\<>/?":;*|,=`]/

const ROTATION_PROMPTS: Readonly<Record<Axis, PromptId>> = {
  x: "ucsRotationX",
  y: "ucsRotationY",
  z: "ucsRotationZ",
}

/**
 * AutoCAD's UCS: the origin and the three points, the X, Y and Z turns,
 * ZAxis (with its Object), OBject, View, World, Previous and the named UCSs.
 * Face is not offered: there are no solids. It works in the WCS, since it is
 * what places the UCS the other commands work in.
 */
export class UcsTool implements Tool {
  readonly id = "ucs"
  readonly inWorld = true

  private state: UcsState = { phase: "origin" }
  private previous: { ucs: Ucs; name: string | null }[] = []
  private cursor: Vec3 | null = null
  private lastScreen: Vec2 | null = null

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
    const state = this.state
    switch (state.phase) {
      case "origin":
        this.enterXAxis(input.point, ctx)
        return
      case "xAxis":
        this.enterXYPlane(state.origin, input.point, ctx)
        return
      case "xyPlane":
        this.acceptPlanePoint(state.origin, state.xAxis, input.point, ctx)
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

  onEnter(ctx: ToolContext): boolean {
    if (this.state.phase === "replace") {
      this.enterNamePrompt("save", ctx)
      return true
    }
    return false
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
        ]
      case "zOrigin":
        return [{ id: "Object" }]
      case "named":
        return [{ id: "Restore" }, { id: "Save" }, { id: "Delete" }]
      case "replace":
        return [{ id: "Yes" }, { id: "No" }]
      default:
        return []
    }
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    const phase = this.state.phase
    if (phase === "origin") return this.invokeMain(id, ctx)
    if (phase === "zOrigin" && id === "Object") {
      this.state = { phase: "zObject", hover: null }
      ctx.dynamicInput.open({ fields: [], commit: () => {} })
      this.place(ctx)
      return "continue"
    }
    if (phase === "named") {
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
      }
    }
    if (this.state.phase === "replace") {
      if (id === "Yes") {
        this.save(this.state.name, ctx)
        return "end"
      }
      if (id === "No") {
        this.enterNamePrompt("save", ctx)
        return "continue"
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

  wantsSnap(): boolean {
    switch (this.state.phase) {
      case "origin":
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
    switch (id) {
      case "World":
        this.apply(WORLD_UCS, null, ctx)
        return "end"
      case "Previous": {
        const previous = this.previous.pop()
        if (previous) {
          const table = ctx.document.getSettings().namedUcs
          const name =
            previous.name !== null && findNamed(table, previous.name)
              ? previous.name
              : null
          this.apply(previous.ucs, name, ctx, false)
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
        })
        ctx.dynamicInput.setLive("angle", DEFAULT_AXIS_ANGLE)
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
        this.state = { phase: "object", hover: null }
        ctx.dynamicInput.open({ fields: [], commit: () => {} })
        this.place(ctx)
        return "continue"
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
        this.enterXAxis(point, commitCtx)
        return true
      },
    })
    this.place(ctx)
  }

  private enterXAxis(origin: Vec3, ctx: ToolContext): void {
    this.state = { phase: "xAxis", origin }
    ctx.dynamicInput.open({
      fields: [{ id: "point", prompt: "ucsXAxisPoint", kind: "coordinate" }],
      commit: () => {},
      commitRaw: (commitCtx) => {
        if (this.state.phase !== "xAxis") return false
        const text = commitCtx.dynamicInput.getText("point").trim()
        if (text === "") {
          this.finish({ ...commitCtx.ucs, origin }, null, commitCtx)
          return true
        }
        const point = this.parse(text, origin, commitCtx)
        if (!point) return false
        this.enterXYPlane(origin, point, commitCtx)
        return true
      },
    })
    this.place(ctx)
  }

  private enterXYPlane(origin: Vec3, onXAxis: Vec3, ctx: ToolContext): void {
    const xAxis = sub3(onXAxis, origin)
    if (!(length3(xAxis) > 1e-9)) return
    this.state = { phase: "xyPlane", origin, xAxis }
    ctx.dynamicInput.open({
      fields: [{ id: "point", prompt: "ucsXYPlanePoint", kind: "coordinate" }],
      commit: () => {},
      commitRaw: (commitCtx) => {
        if (this.state.phase !== "xyPlane") return false
        const text = commitCtx.dynamicInput.getText("point").trim()
        if (text === "") {
          // Accepted, the new Y axis lies in the current UCS's XY plane.
          const z = ucsZAxis(commitCtx.ucs)
          const towardsY = cross3(z, xAxis)
          const ucs = ucsFromAxes(
            origin,
            xAxis,
            length3(towardsY) > 1e-9 ? towardsY : commitCtx.ucs.yAxis
          )
          if (ucs) this.finish(ucs, null, commitCtx)
          return true
        }
        const point = this.parse(text, origin, commitCtx)
        if (!point) return false
        return this.acceptPlanePoint(origin, xAxis, point, commitCtx)
      },
    })
    this.place(ctx)
  }

  /** The third point, on the positive Y side of the new XY plane. */
  private acceptPlanePoint(
    origin: Vec3,
    xAxis: Vec3,
    point: Vec3,
    ctx: ToolContext
  ): boolean {
    const ucs = ucsFromAxes(origin, xAxis, sub3(point, origin))
    if (!ucs) return false
    this.finish(ucs, null, ctx)
    return true
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
    this.state = { phase: "zPoint", origin }
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

  /**
   * `[Restore/Save/Delete/?]`: `?` is no keyword (it has no capital to type),
   * so it is answered in a value box, which still takes the three keywords.
   */
  private enterNamed(ctx: ToolContext): void {
    this.state = { phase: "named" }
    ctx.dynamicInput.open({
      fields: [{ id: "option", prompt: "ucsNamedOption", kind: "number" }],
      commit: () => {},
      commitRaw: (commitCtx) => {
        if (commitCtx.dynamicInput.getText("option").trim() !== "?") {
          return false
        }
        this.state = { phase: "list", back: "named" }
        this.openNameField("ucsListNames", commitCtx)
        return true
      },
    })
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
        const entry = findNamed(table, typed)
        if (!entry) {
          if (typed !== "") {
            ctx.report(
              ctx.text.message("ucsUndefined", { name: typed }),
              "error"
            )
          }
          return this.enterNamePrompt("restore", ctx)
        }
        this.finish(entry.ucs, entry.name, ctx)
        return
      }
      case "save": {
        if (typed === "?") return this.enterList("save", ctx)
        if (typed === "" || typed.length > 255 || INVALID_NAME.test(typed)) {
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
        }
        return ctx.endCommand()
      }
      case "list": {
        listNamedUcs(typed === "" ? "*" : typed, ctx)
        if (state.back === "named") return this.enterNamed(ctx)
        return this.enterNamePrompt(state.back, ctx)
      }
    }
  }

  private enterList(back: "restore" | "save", ctx: ToolContext): void {
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

  /** Makes `ucs` current, one undo step, remembering the one it replaces. */
  private apply(
    ucs: Ucs,
    name: string | null,
    ctx: ToolContext,
    remember = true
  ): void {
    const settings = ctx.document.getSettings()
    const patch = ucsChange(settings, ucs, name)
    if (!patch) return
    if (remember) {
      this.previous.push({ ucs: settings.ucs, name: settings.ucsName })
      if (this.previous.length > MAX_PREVIOUS) this.previous.shift()
    }
    ctx.execute(new UpdateSettingsCommand(patch))
  }

  /** {@link apply} as the command's last answer, from a prompt that ends it itself. */
  private finish(ucs: Ucs, name: string | null, ctx: ToolContext): void {
    this.apply(ucs, name, ctx)
    ctx.endCommand()
  }

  private parse(
    text: string,
    from: Vec3 | null,
    ctx: ToolContext
  ): Vec3 | null {
    if (!isCoordinateExpression(text)) return null
    return parseCoordinate(text, {
      lastPoint: from,
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

/** What `Current ucs name:` prints: *WORLD*, *NO NAME* or the saved name. */
export function currentName(settings: DocumentSettings): {
  kind: "world" | "unnamed" | "named"
  name: string
} {
  if (settings.ucsName !== null)
    return { kind: "named", name: settings.ucsName }
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
 * The `?` listing of UCS and PLAN: each saved UCS matching `patterns`, its
 * origin and axes relative to the current UCS.
 */
export function listNamedUcs(patterns: string, ctx: ToolContext): void {
  const settings = ctx.document.getSettings()
  const wanted = patterns.split(",").map((part) => part.trim())
  const lines = [ctx.text.message("currentUcsName", currentName(settings))]
  lines.push(ctx.text.message("savedUcsHeader"))
  const fmt = (value: number) => value.toFixed(4)
  for (const entry of settings.namedUcs) {
    if (!wanted.some((pattern) => matchesWildcard(entry.name, pattern))) {
      continue
    }
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
 * The patch that makes `ucs` current under `name`, or `null` when it already
 * is: UCS, and -VIEW aligning the UCS with an orthographic view. Changing to
 * the WCS puts ELEVATION back to 0, as ELEV documents.
 */
export function ucsChange(
  settings: DocumentSettings,
  ucs: Ucs,
  name: string | null
): Partial<DocumentSettings> | null {
  if (sameUcs(ucs, settings.ucs) && name === settings.ucsName) return null
  const toWorld = isWorldUcs(ucs) && settings.elevation !== 0
  return { ucs, ucsName: name, ...(toWorld ? { elevation: 0 } : {}) }
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

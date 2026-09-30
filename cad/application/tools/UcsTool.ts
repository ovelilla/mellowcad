import { Vec2, V } from "../../geometry/Vec2"
import { polarPoint } from "../../geometry/primitives"
import {
  Entity,
  EntityId,
  arcEndPoint,
  arcStartPoint,
  ellipseEndPoint,
  ellipseStartPoint,
  isFullEllipse,
  polylineSegmentGeometries,
  splinePolyline,
} from "../../domain/entities"
import {
  NamedUcs,
  Ucs,
  WORLD_UCS,
  createUcs,
  isWorldUcs,
  rotateUcs,
  sameUcs,
  worldDirectionToUcs,
  worldPointToUcs,
} from "../../domain/ucs"
import { DocumentSettings } from "../../domain/units"
import { matchesWildcard } from "../../shared/wildcard"
import { UpdateSettingsCommand } from "../commands/settingsCommands"
import { entityScenePrimitive } from "../SceneBuilder"
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

type UcsState =
  | { readonly phase: "origin" }
  | { readonly phase: "xAxis"; readonly origin: Vec2 }
  | { readonly phase: "xyPlane"; readonly origin: Vec2; readonly xAxis: Vec2 }
  | { readonly phase: "zAngle" }
  | { readonly phase: "named" }
  | { readonly phase: "restore" }
  | { readonly phase: "save" }
  | { readonly phase: "replace"; readonly name: string }
  | { readonly phase: "delete" }
  | { readonly phase: "list"; readonly back: "named" | "restore" | "save" }
  | { readonly phase: "object"; readonly hover: EntityId | null }

/** UCSAXISANG's initial value, which the Z option offers as its default. */
const DEFAULT_AXIS_ANGLE = 90
/** UCS Previous steps back through the last 10 of the session. */
const MAX_PREVIOUS = 10
/** Characters a symbol-table name may not hold (AutoCAD's naming rule). */
const INVALID_NAME = /[\\<>/?":;*|,=`]/

/**
 * AutoCAD's UCS, in the plane: the origin and the direction of the X axis.
 * Face, X, Y and ZAxis tilt the XY plane out of the world's and are not
 * offered; a third point that would turn the Z axis down is not taken.
 */
export class UcsTool implements Tool {
  readonly id = "ucs"

  private state: UcsState = { phase: "origin" }
  private previous: { ucs: Ucs; name: string | null }[] = []
  private cursor: Vec2 | null = null
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
    if (this.state.phase === "object") {
      const hover = alignable(ctx.pick(input.world))?.id ?? null
      if (hover !== this.state.hover) this.state = { phase: "object", hover }
    }
    if (this.state.phase === "zAngle") {
      const offset = V.sub(input.point, ctx.ucs.origin)
      if (V.length(offset) > 1e-9) {
        ctx.dynamicInput.setLive("angle", headingInUcs(ctx.ucs, offset))
      }
    }
    ctx.dynamicInput.setPosition(input.screen)
    ctx.requestRender()
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0) return
    switch (this.state.phase) {
      case "origin":
        this.enterXAxis(input.point, ctx)
        return
      case "xAxis":
        this.enterXYPlane(this.state.origin, input.point, ctx)
        return
      case "xyPlane":
        this.acceptPlanePoint(
          this.state.origin,
          this.state.xAxis,
          input.point,
          ctx
        )
        return
      case "zAngle": {
        const offset = V.sub(input.point, ctx.ucs.origin)
        if (V.length(offset) > 1e-9) {
          this.rotateZ(headingInUcs(ctx.ucs, offset), ctx)
        }
        return
      }
      case "object": {
        const entity = alignable(ctx.pick(input.world))
        const ucs = entity ? ucsFromObject(entity, input.world) : null
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
          { id: "Z" },
        ]
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
    return this.state.phase === "xAxis" || this.state.phase === "xyPlane"
      ? this.state.origin
      : null
  }

  wantsSnap(): boolean {
    return (
      this.state.phase === "origin" ||
      this.state.phase === "xAxis" ||
      this.state.phase === "xyPlane" ||
      this.state.phase === "zAngle"
    )
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    const state = this.state
    if (state.phase === "object") {
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
    if ((state.phase === "xAxis" || state.phase === "xyPlane") && this.cursor) {
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
      case "View":
        this.apply(
          { origin: ctx.ucs.origin, xAxis: ctx.viewport.xAxis },
          null,
          ctx
        )
        return "end"
      case "Z":
        this.state = { phase: "zAngle" }
        ctx.dynamicInput.open({
          fields: [{ id: "angle", prompt: "ucsRotationZ", kind: "angle" }],
          commit: (values, commitCtx) => {
            this.rotateZ(values.angle, commitCtx)
          },
        })
        ctx.dynamicInput.setLive("angle", DEFAULT_AXIS_ANGLE)
        this.place(ctx)
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

  private enterXAxis(origin: Vec2, ctx: ToolContext): void {
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

  private enterXYPlane(origin: Vec2, onXAxis: Vec2, ctx: ToolContext): void {
    const ucs = createUcs(origin, V.sub(onXAxis, origin))
    if (!ucs) return
    this.state = { phase: "xyPlane", origin, xAxis: ucs.xAxis }
    ctx.dynamicInput.open({
      fields: [{ id: "point", prompt: "ucsXYPlanePoint", kind: "coordinate" }],
      commit: () => {},
      commitRaw: (commitCtx) => {
        if (this.state.phase !== "xyPlane") return false
        const text = commitCtx.dynamicInput.getText("point").trim()
        if (text === "") {
          this.finish(ucs, null, commitCtx)
          return true
        }
        const point = this.parse(text, origin, commitCtx)
        if (!point) return false
        return this.acceptPlanePoint(origin, ucs.xAxis, point, commitCtx)
      },
    })
    this.place(ctx)
  }

  /**
   * A point on the positive-Y side keeps Z pointing up; one on the other side
   * would turn the UCS over, which needs a Z the model does not have.
   */
  private acceptPlanePoint(
    origin: Vec2,
    xAxis: Vec2,
    point: Vec2,
    ctx: ToolContext
  ): boolean {
    if (V.cross(xAxis, V.sub(point, origin)) < 0) return false
    this.finish({ origin, xAxis }, null, ctx)
    return true
  }

  private rotateZ(degrees: number, ctx: ToolContext): void {
    if (!Number.isFinite(degrees)) return
    this.finish(rotateUcs(ctx.ucs, (degrees * Math.PI) / 180), null, ctx)
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
    if (sameUcs(ucs, settings.ucs) && name === settings.ucsName) return
    if (remember) {
      this.previous.push({ ucs: settings.ucs, name: settings.ucsName })
      if (this.previous.length > MAX_PREVIOUS) this.previous.shift()
    }
    ctx.execute(new UpdateSettingsCommand({ ucs, ucsName: name }))
  }

  /** {@link apply} as the command's last answer, from a prompt that ends it itself. */
  private finish(ucs: Ucs, name: string | null, ctx: ToolContext): void {
    this.apply(ucs, name, ctx)
    ctx.endCommand()
  }

  private parse(
    text: string,
    from: Vec2 | null,
    ctx: ToolContext
  ): Vec2 | null {
    if (!isCoordinateExpression(text)) return null
    return parseCoordinate(text, {
      lastPoint: from,
      relativeByDefault: from !== null,
      ucs: ctx.ucs,
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
    lines.push(
      ctx.text.message("savedUcsEntry", {
        name: entry.name,
        originX: fmt(origin.x),
        originY: fmt(origin.y),
        xAxisX: fmt(x.x),
        xAxisY: fmt(x.y),
        yAxisX: fmt(-x.y),
        yAxisY: fmt(x.x),
      })
    )
  }
  ctx.report(lines.join("\n"))
}

/** The objects UCS OBject can align to; dimensions and hatches are not among them. */
function alignable(entity: Entity | null): Entity | null {
  if (!entity) return null
  return entity.type === "dimension" || entity.type === "hatch" ? null : entity
}

/**
 * AutoCAD's UCS OBject: where the origin goes and which way X points depends
 * on the kind of object and on where it was picked.
 */
function ucsFromObject(entity: Entity, pick: Vec2): Ucs | null {
  const toward = (origin: Vec2, target: Vec2) =>
    createUcs(origin, V.sub(target, origin))
  const nearer = (a: Vec2, b: Vec2) =>
    V.distance(pick, a) <= V.distance(pick, b) ? a : b
  switch (entity.type) {
    case "line": {
      const origin = nearer(entity.start, entity.end)
      return toward(origin, origin === entity.start ? entity.end : entity.start)
    }
    case "circle":
      return toward(entity.center, pick)
    case "arc":
      return toward(
        entity.center,
        nearer(arcStartPoint(entity), arcEndPoint(entity))
      )
    case "ellipse":
      return isFullEllipse(entity)
        ? toward(entity.center, pick)
        : toward(
            entity.center,
            nearer(ellipseStartPoint(entity), ellipseEndPoint(entity))
          )
    case "polyline": {
      const segments = polylineSegmentGeometries(entity)
      let best = segments[0]
      let bestDistance = Infinity
      for (const segment of segments) {
        const distance = segmentDistance(segment, pick)
        if (distance < bestDistance) {
          best = segment
          bestDistance = distance
        }
      }
      if (!best) return null
      const end = nearer(best.a, best.b)
      if (best.kind === "arc") return toward(best.center, end)
      return toward(end, end === best.a ? best.b : best.a)
    }
    case "spline": {
      const points = splinePolyline(entity)
      const first = points[0]
      const last = points[points.length - 1]
      if (entity.closed) return toward(first, pick)
      const origin = nearer(first, last)
      return toward(origin, origin === first ? last : first)
    }
    case "text":
    case "mtext":
    case "attdef":
    case "insert":
      return createUcs(
        entity.position,
        polarPoint({ x: 0, y: 0 }, 1, entity.rotation)
      )
    default:
      return null
  }
}

function segmentDistance(
  segment: ReturnType<typeof polylineSegmentGeometries>[number],
  point: Vec2
): number {
  if (segment.kind === "line") {
    const ab = V.sub(segment.b, segment.a)
    const length = V.lengthSq(ab)
    const t =
      length > 0
        ? Math.max(0, Math.min(1, V.dot(V.sub(point, segment.a), ab) / length))
        : 0
    return V.distance(point, V.add(segment.a, V.scale(ab, t)))
  }
  return Math.abs(V.distance(point, segment.center) - segment.radius)
}

import { Vec2, V } from "../../geometry/Vec2"
import {
  Vec3,
  add3,
  length3,
  normalize3,
  scale3,
  sub3,
  withZOf,
} from "../../geometry/Vec3"
import {
  bulgeToArc,
  normalizeAngle,
  normalizeDegrees,
} from "../../geometry/primitives"
import {
  ArcSegment,
  segmentExitTangent,
  tangentArcBulge,
} from "../../geometry/bulgeArcs"
import {
  DocumentSettings,
  formatAngle,
  formatLength,
  unitSuffix,
} from "../../domain/units"
import { Ucs, worldDirectionToUcs } from "../../domain/ucs"
import { Entity, readsInPlan } from "../../domain/entities"
import { objectArea } from "../../domain/objectArea"
import { ScenePrimitive } from "../../scene/types"
import { THEME } from "../../scene/theme"
import {
  isCoordinateExpression,
  parseCoordinate,
} from "../input/coordinateInput"
import { entityScenePrimitive } from "../SceneBuilder"
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
import { lastObject } from "./objectSelection"
import type { PromptId } from "../../locales/types"
import { ARC_SEGMENT_OPTIONS, ArcSegmentInput } from "./arcSegmentInput"
import { lastDrawnDirection } from "./lastDrawnPoint"

/**
 * MEASURE (AutoCAD's DIST / MEASUREGEOM). Creates no geometry — the result is a
 * transient overlay (measurement guide + a readout chip that follows the
 * cursor) and disappears with the tool. Two modes:
 *
 * - **Distance**: pick two points → AutoCAD's DIST: the 3D distance, the angle
 *   in and from the UCS's XY plane and the ΔX/ΔY/ΔZ between them, on the
 *   readout while the second is picked and then on the command line, and the
 *   command ends, as AutoCAD's DIST does.
 * - **Area**: AutoCAD's AREA — a run of points, the enclosed area and perimeter
 *   of the (implicitly closed) polygon updating live with the cursor as a
 *   tentative vertex, or one object's (Object, the prompt's default); the
 *   command reports it and ends, as AutoCAD's does — or, under Add area or
 *   Subtract area, adds it to or takes it from a total and asks again.
 */
export type MeasureMode = "distance" | "area"

/** AREA's running total: none, or what Add area or Subtract area keeps. */
type AreaMode = "plain" | "add" | "subtract"

/** What `Area = …, Perimeter = …` writes of one measurement. */
type AreaReport = {
  readonly area: string
  readonly measured: string
  readonly around: string
}

type MeasureState =
  | { readonly phase: "first" }
  | {
      readonly phase: "second"
      readonly base: Vec3
      readonly cursor: Vec3
      /** Multiple points' {@link Run.startTangent}, read as the first point was given. */
      readonly startTangent: Vec2
    }
  | {
      readonly phase: "area"
      readonly points: readonly Vec3[]
      readonly cursor: Vec2
    }
  | { readonly phase: "areaObject"; readonly hover: Entity | null }
  | {
      /** DIST's Multiple points, or its Length's `Specify length of line:`. */
      readonly phase: "multiple" | "length"
      readonly points: readonly Vec3[]
      /** Each segment's bulge: 0 a line, an Arc's arc otherwise. */
      readonly bulges: readonly number[]
      /** Arc: the next segment is an arc, as PLINE's arc mode draws it. */
      readonly arcMode: boolean
      /** The way a first arc leaves the first point (PLINE's rule). */
      readonly startTangent: Vec2
      /** Ctrl held: the arc leaves the other way. */
      readonly reversed: boolean
      readonly cursor: Vec3
      /** The run's length so far, as `Distance = …` writes it. */
      readonly total: string
    }

type Run = Extract<MeasureState, { phase: "multiple" | "length" }>

/** A run's points, bulges and mode, from which {@link MeasureTool.walk} goes on. */
type RunPath = Pick<Run, "points" | "bulges" | "arcMode">

interface Measurement {
  readonly base: Vec3
  readonly tip: Vec3
}

export class MeasureTool implements Tool {
  constructor(
    private readonly mode: MeasureMode,
    readonly id: string,
    readonly shortcut?: string
  ) {}

  private state: MeasureState = { phase: "first" }
  private lastScreen: Vec2 | null = null
  /** The AREA system variable: the last area measured, kept for the session. */
  private area = 0
  private areaMode: AreaMode = "plain"
  /** Add area's and Subtract area's total so far. */
  private total = 0
  /** The last measurement in the mode and the total then, said again at its first corner. */
  private shown: (AreaReport & { readonly total: string }) | null = null
  /** Multiple points' Arc options, the prompts PLINE's ask. */
  private readonly arc = new ArcSegmentInput((segment, ctx) =>
    this.arcDone(segment, ctx)
  )

  /** The last area AREA measured, 0 until it has. */
  lastArea(): number {
    return this.area
  }

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    ctx.selection.clear()
    this.reset(ctx.viewport.worldCenter())
    this.askPoint(ctx)
  }

  onDeactivate(ctx: ToolContext): void {
    this.arc.cancel()
    this.reset({ x: 0, y: 0 })
    ctx.dynamicInput.close()
  }

  private reset(origin: Vec2): void {
    this.areaMode = "plain"
    this.total = 0
    this.shown = null
    this.state =
      this.mode === "area"
        ? { phase: "area", points: [], cursor: origin }
        : { phase: "first" }
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen
    ctx.dynamicInput.setPosition(input.screen)
    if (this.state.phase === "multiple") {
      this.state = {
        ...this.state,
        cursor: input.point,
        reversed: input.ctrlKey,
      }
      if (this.arc.active) this.arc.onPointerMove(input, ctx)
    } else if (this.state.phase === "second" || this.state.phase === "length") {
      this.state = { ...this.state, cursor: input.point }
    } else if (this.state.phase === "area") {
      this.state = { ...this.state, cursor: input.point }
    } else if (this.state.phase === "areaObject") {
      const hover = this.pickArea(input.world, ctx)
      if (hover?.id !== this.state.hover?.id) {
        this.state = { phase: "areaObject", hover }
      }
    }
    ctx.requestRender()
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0) return
    if (this.state.phase === "areaObject") {
      const picked = this.pickArea(input.world, ctx)
      if (
        picked &&
        this.reportObject(picked, ctx) &&
        this.areaMode === "plain"
      ) {
        ctx.endCommand()
      }
    } else if (this.state.phase === "multiple" && this.arc.active) {
      this.arc.onPointerDown(input, ctx)
    } else {
      if (this.state.phase === "multiple") {
        this.state = { ...this.state, reversed: input.ctrlKey }
      }
      this.place(input.point, ctx)
    }
    ctx.requestRender()
  }

  private place(point: Vec3, ctx: ToolContext): void {
    if (this.state.phase === "first") {
      // LASTPOINT is still the last object's: the first point sets it after,
      // and it tells a clockwise arc's drawn end (pline/p115).
      const startTangent = lastDrawnDirection(ctx.document, ctx.lastPoint) ?? {
        x: 1,
        y: 0,
      }
      this.state = { phase: "second", base: point, cursor: point, startTangent }
    } else if (this.state.phase === "second") {
      ctx.report(distanceReport({ base: this.state.base, tip: point }, ctx))
      ctx.endCommand()
      return
    } else if (this.state.phase === "multiple") {
      const run = this.state
      if (!run.arcMode) {
        this.walk(
          {
            ...run,
            points: [...run.points, point],
            bulges: [...run.bulges, 0],
          },
          ctx
        )
        return
      }
      // In Arc the point ends the arc tangent to the run, as PLINE's does.
      const end = withZOf(point, lastOf(run.points))
      const bulge = this.pendingBulge(run, end)
      if (bulge === null) {
        ctx.report(ctx.text.message("invalid"), "error")
        return
      }
      this.walk(
        {
          ...run,
          points: [...run.points, end],
          bulges: [...run.bulges, bulge],
        },
        ctx
      )
      return
    } else if (this.state.phase === "length") {
      // A point there gives the length from the last one, as AutoCAD's does.
      this.extend(length3(sub3(point, lastOf(this.state.points))), ctx)
      return
    } else if (this.state.phase === "area") {
      this.state = {
        phase: "area",
        points: [...this.state.points, point],
        cursor: point,
      }
    }
    this.askPoint(ctx)
  }

  /**
   * Multiple points' run so far, then its next point: `Distance = …` once
   * it has a segment, as AutoCAD 2023's console writes it before each.
   */
  private walk(run: RunPath, ctx: ToolContext): void {
    const { points, bulges, arcMode } = run
    const total = formatLength(
      pathLength(points, bulges),
      ctx.document.getSettings()
    )
    // Only Multiple points and its run walk, each holding the start tangent.
    const startTangent =
      "startTangent" in this.state ? this.state.startTangent : { x: 1, y: 0 }
    this.state = {
      phase: "multiple",
      points,
      bulges,
      arcMode,
      startTangent,
      reversed: false,
      cursor: lastOf(points),
      total,
    }
    if (points.length > 1) {
      ctx.report(ctx.text.message("distanceTotal", { value: total }))
    }
    this.askPoint(ctx)
  }

  /**
   * Length's segment: on along the last one (a negative length back), the
   * way an arc ends heading, or along the UCS's X axis before there is one.
   */
  private extend(length: number, ctx: ToolContext): void {
    if (this.state.phase !== "length" || !Number.isFinite(length)) return
    const run = this.state
    const { points } = run
    const last = lastOf(points)
    const n = points.length
    const bulge = run.bulges[n - 2] ?? 0
    const exit =
      bulge !== 0 ? segmentExitTangent(points[n - 2], last, bulge) : null
    const along = exit
      ? { x: exit.x, y: exit.y, z: 0 }
      : n > 1
        ? normalize3(sub3(last, points[n - 2]))
        : null
    const direction = along ?? ctx.ucs.xAxis
    this.walk(
      {
        ...run,
        points: [...points, add3(last, scale3(direction, length))],
        bulges: [...run.bulges, 0],
      },
      ctx
    )
  }

  /** The way the run leaves its last point. */
  private runTangent(run: Run): Vec2 {
    const { points, bulges } = run
    const n = points.length
    if (n < 2) return run.startTangent
    return (
      segmentExitTangent(points[n - 2], points[n - 1], bulges[n - 2] ?? 0) ??
      run.startTangent
    )
  }

  /** Arc's tangent arc to `end`, or the other way with Ctrl; null for none. */
  private pendingBulge(run: Run, end: Vec2): number | null {
    const tangent = this.runTangent(run)
    return tangentArcBulge(
      lastOf(run.points),
      run.reversed ? V.scale(tangent, -1) : tangent,
      end
    )
  }

  /** An Arc option's arc, after which the arc's prompt asks again. */
  private arcDone(segment: ArcSegment, ctx: ToolContext): void {
    if (this.state.phase !== "multiple") return
    const run = this.state
    this.walk(
      {
        ...run,
        points: [...run.points, withZOf(segment.end, lastOf(run.points))],
        bulges: [...run.bulges, segment.bulge],
      },
      ctx
    )
  }

  private askLength(ctx: ToolContext): void {
    if (this.state.phase !== "multiple") return
    this.state = { ...this.state, phase: "length" }
    ctx.dynamicInput.open({
      fields: [{ id: "distance", prompt: "length", kind: "distance" }],
      commit: (values, commitCtx) => this.extend(values.distance, commitCtx),
      commitRaw: (commitCtx) => {
        const text = commitCtx.dynamicInput.getText("distance").trim()
        if (!isCoordinateExpression(text)) return false
        const point = parseCoordinate(text, {
          lastPoint: this.basePoint() ?? commitCtx.lastPoint,
          relativeByDefault: false,
          ucs: commitCtx.ucs,
          elevation: commitCtx.elevation,
        })
        if (!point) return false
        this.place(point, commitCtx)
        return true
      },
    })
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  /**
   * A point can be typed too; one given without a Z lies at the current
   * elevation, as DIST's help says, which is what `parseCoordinate` does.
   */
  private askPoint(ctx: ToolContext): void {
    const first =
      this.state.phase === "first" ||
      (this.state.phase === "area" && this.state.points.length === 0)
    ctx.dynamicInput.open({
      fields: [
        {
          id: "point",
          prompt: first ? "firstPoint" : "secondPoint",
          kind: "coordinate",
        },
      ],
      commit: () => {},
      commitRaw: (commitCtx) => {
        const text = commitCtx.dynamicInput.getText("point").trim()
        if (text === "") return this.enter(commitCtx)
        const point = parseCoordinate(text, {
          lastPoint: this.basePoint() ?? commitCtx.lastPoint,
          relativeByDefault: false,
          ucs: commitCtx.ucs,
          elevation: commitCtx.elevation,
        })
        if (!point) return false
        this.place(point, commitCtx)
        commitCtx.requestRender()
        return true
      },
    })
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  private basePoint(): Vec3 | null {
    switch (this.state.phase) {
      case "second":
        return this.state.base
      case "area":
        return this.state.points.at(-1) ?? null
      case "multiple":
      case "length":
        return lastOf(this.state.points)
      default:
        return null
    }
  }

  /**
   * Enter, at the box or the drawing: DIST's first point takes LASTPOINT and
   * its second measures to the first (LASTPOINT again), as AutoCAD's do, Multiple points'
   * next point takes `<Total>` and its Length refuses it; AREA's first corner
   * takes `<Object>`, from the third point it takes `<Total>`, and before that
   * AutoCAD 2023's console refuses it as a missing point. In Add area or
   * Subtract area the first corner's Enter writes the total and ends, and
   * `Select objects:`'s goes back to the first corner, saying the last
   * measurement again.
   */
  private enter(ctx: ToolContext): boolean {
    switch (this.state.phase) {
      case "first":
        this.place(ctx.lastPoint, ctx)
        return true
      case "second":
        this.place(this.state.base, ctx)
        return true
      case "multiple":
        if (this.arc.active) return this.arc.onEnter(ctx)
        if (this.invokeDistOption("Total", ctx) === "end") ctx.endCommand()
        return true
      case "length":
        ctx.report(
          ctx.text.message("requiresDistance", {
            points: "second",
            keyword: "no",
          }),
          "error"
        )
        return true
      case "area": {
        const { points } = this.state
        if (points.length >= 3) {
          if (this.totalPolygon(points, ctx) === "end") ctx.endCommand()
        } else if (points.length > 0) {
          ctx.report(ctx.text.message("pointOrKeywordRequired"), "error")
        } else if (this.areaMode === "plain") this.askObject(ctx)
        else {
          this.reportTotal(ctx)
          ctx.endCommand()
        }
        return true
      }
      case "areaObject":
        if (this.areaMode === "plain") return false
        this.reportShown(ctx)
        this.askCorner(ctx)
        return true
    }
  }

  question(): PromptId | ToolQuestion | null {
    switch (this.state.phase) {
      case "first":
        return "specifyFirstPoint"
      case "second":
        return "distSecondPointOr"
      case "multiple":
        if (this.arc.active) return this.arc.question()
        return this.state.arcMode
          ? "specifyEndpointOfArcOr"
          : "specifyNextPointOr"
      case "length":
        return "specifyLengthOfLine"
      case "area":
        if (this.state.points.length === 0) return "specifyFirstCornerPointOr"
        return this.areaMode === "add"
          ? "addModeNextPointOr"
          : this.areaMode === "subtract"
            ? "subtractModeNextPointOr"
            : "specifyNextPointOr"
      case "areaObject":
        return this.areaMode === "add"
          ? "addModeSelectObjects"
          : this.areaMode === "subtract"
            ? "subtractModeSelectObjects"
            : "selectObjects"
    }
  }

  /**
   * AREA's object is one pick, and Multiple points' next point says the run
   * so far again after its refusal, as AutoCAD 2023's console refuses them.
   */
  takes(): QuestionInput | null {
    if (this.state.phase === "areaObject") return "objectOrLast"
    if (
      this.state.phase === "area" &&
      this.state.points.length === 0 &&
      this.areaMode !== "plain" &&
      this.shown
    ) {
      return {
        refusal: ["pointOrKeywordRequired", "areaReport", "totalArea"],
        values: this.shown,
      }
    }
    if (this.state.phase === "multiple") {
      if (this.arc.active) return this.arc.takes()
      const { arcMode, points, total } = this.state
      if (points.length < 2) return arcMode ? "point2d" : null
      return {
        refusal: [
          arcMode ? "point2dOrKeywordRequired" : "pointOrKeywordRequired",
          "distanceTotal",
        ],
        values: { value: total },
      }
    }
    return null
  }

  /**
   * DIST's second point keeps LASTPOINT at its first, where Multiple
   * points' set it, as AutoCAD 2023's console shows.
   */
  setsLastPoint(): boolean | null {
    if (this.state.phase === "second") return false
    return this.state.phase === "multiple" && !this.arc.active ? true : null
  }

  /** Arc's prompt shows no `<Total>`, though Enter there totals too. */
  defaultOption(): string | null {
    if (this.state.phase === "multiple") {
      return this.state.arcMode || this.arc.active ? null : "Total"
    }
    if (this.state.phase !== "area") return null
    const { length } = this.state.points
    if (length === 0) return this.areaMode === "plain" ? "Object" : null
    return length >= 3 ? "Total" : null
  }

  onEnter(ctx: ToolContext): boolean {
    return this.enter(ctx)
  }

  /** While marking an area, Backspace removes the last placed vertex too. */
  onKeyDown(input: KeyInput, ctx: ToolContext): void {
    if (input.key === "Backspace" && this.state.phase === "area") {
      this.undoPoint(ctx)
    }
  }

  /**
   * WHY no Arc and Length at AREA's next point: not built
   * (docs/coverage/inquiry.md). In Add area the first corner lists Subtract
   * area and takes Add area unlisted, as AutoCAD 2023's console does, and
   * the other way round. DIST's Arc lists PLINE's arc options.
   */
  commandOptions(): readonly CommandOption[] {
    if (this.state.phase === "areaObject") {
      return [{ id: "Last", hidden: true, prompt: "selectObjects" }]
    }
    if (this.state.phase === "second") return [{ id: "Multiple" }]
    if (this.state.phase === "multiple") {
      if (this.arc.active) return this.arc.commandOptions()
      const close = this.state.points.length > 1 ? [{ id: "Close" }] : []
      if (!this.state.arcMode) {
        return [
          { id: "Arc" },
          ...close,
          { id: "Length" },
          { id: "Undo" },
          { id: "Total" },
        ]
      }
      const [angle, center, direction, radius, second] = ARC_SEGMENT_OPTIONS
      return [
        { id: angle },
        { id: center },
        ...close,
        { id: direction },
        { id: "Line" },
        { id: radius },
        { id: second },
        { id: "Undo" },
      ]
    }
    if (this.state.phase !== "area") return []
    const { length } = this.state.points
    if (length === 0) {
      // The first corner also declares Entity (Object's old name) and eXit
      // unlisted (table 20164), which AutoCAD 2023's console takes.
      const unlisted: CommandOption[] = [
        { id: "Entity", hidden: true },
        { id: "eXit", hidden: true },
      ]
      switch (this.areaMode) {
        case "plain":
          return [
            { id: "Object" },
            { id: "Add" },
            { id: "Subtract" },
            ...unlisted,
          ]
        case "add":
          return [
            { id: "Object" },
            { id: "Subtract" },
            { id: "Add", hidden: true },
            ...unlisted,
          ]
        case "subtract":
          return [
            { id: "Object" },
            { id: "Add" },
            { id: "Subtract", hidden: true },
            ...unlisted,
          ]
      }
    }
    return length >= 3 ? [{ id: "Undo" }, { id: "Total" }] : [{ id: "Undo" }]
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    if (this.state.phase === "second" || this.state.phase === "multiple") {
      return this.invokeDistOption(id, ctx)
    }
    switch (id) {
      case "Object":
      case "Entity":
        if (this.state.phase !== "area") return "unhandled"
        this.askObject(ctx)
        return "continue"
      // WHY no `Total area = …`, which Enter says in Add or Subtract area:
      // the console's eXit ends without a word (acc/ar3, ar5 of 2026-10-14).
      case "eXit":
        return this.state.phase === "area" && this.state.points.length === 0
          ? "end"
          : "unhandled"
      case "Add":
      case "Subtract": {
        if (this.state.phase !== "area" || this.state.points.length > 0) {
          return "unhandled"
        }
        const mode = id === "Add" ? "add" : "subtract"
        if (mode !== this.areaMode) this.shown = null
        this.areaMode = mode
        return "continue"
      }
      case "Undo":
        return this.undoPoint(ctx) ? "continue" : "unhandled"
      case "Total":
        if (this.state.phase !== "area") return "unhandled"
        return this.totalPolygon(this.state.points, ctx)
      case "Last": {
        if (this.state.phase !== "areaObject") return "unhandled"
        const last = lastObject(ctx)
        return last &&
          readsInPlan(last) &&
          this.reportObject(last, ctx) &&
          this.areaMode === "plain"
          ? "end"
          : "continue"
      }
      default:
        return "unhandled"
    }
  }

  /**
   * DIST's Multiple points and what its next point offers: Close back to the
   * first point and Total, each `Distance = …` and the end, Length, and Undo
   * of one point (`All segments already undone.` at the first).
   */
  private invokeDistOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    const state = this.state
    if (state.phase === "second") {
      if (id !== "Multiple") return "unhandled"
      this.walk({ points: [state.base], bulges: [], arcMode: false }, ctx)
      return "continue"
    }
    if (state.phase !== "multiple") return "unhandled"
    if (this.arc.active) return this.arc.invokeOption(id, ctx)
    switch (id) {
      case "Arc":
      case "Line":
        // Each switch says the run again, as the console does.
        this.walk({ ...state, arcMode: id === "Arc" }, ctx)
        return "continue"
      case "Close": {
        if (state.points.length < 2) return "unhandled"
        // WHY no *Invalid*: the console closes a reversal straight, silent.
        const bulge = state.arcMode
          ? (this.pendingBulge(state, state.points[0]) ?? 0)
          : 0
        this.walk(
          {
            ...state,
            points: [...state.points, state.points[0]],
            bulges: [...state.bulges, bulge],
          },
          ctx
        )
        return "end"
      }
      case "Total":
        ctx.report(ctx.text.message("distanceTotal", { value: state.total }))
        return "end"
      case "Length":
        this.askLength(ctx)
        return "continue"
      case "Undo":
        if (state.points.length === 1) {
          ctx.report(ctx.text.message("allSegmentsUndone"))
        } else {
          // On as the segment left last was drawn, as PLINE's Undo goes.
          const bulges = state.bulges.slice(0, -1)
          this.walk(
            {
              points: state.points.slice(0, -1),
              bulges,
              arcMode: (bulges[bulges.length - 1] ?? 0) !== 0,
            },
            ctx
          )
        }
        return "continue"
      default:
        return state.arcMode &&
          this.arc.begin(
            id,
            { point: lastOf(state.points), tangent: this.runTangent(state) },
            ctx
          )
          ? "continue"
          : "unhandled"
    }
  }

  /**
   * AREA's Undo takes back the last point; the first corner it keeps, saying
   * so as AutoCAD 2023's console does.
   */
  private undoPoint(ctx: ToolContext): boolean {
    if (this.state.phase !== "area" || this.state.points.length === 0) {
      return false
    }
    if (this.state.points.length === 1) {
      ctx.report(ctx.text.message("allSegmentsUndone"))
      ctx.report(ctx.text.message("commandCompletelyUndone"))
      return true
    }
    this.state = { ...this.state, points: this.state.points.slice(0, -1) }
    ctx.requestRender()
    return true
  }

  private askObject(ctx: ToolContext): void {
    this.state = { phase: "areaObject", hover: null }
    ctx.dynamicInput.open({ fields: [], commit: () => {} })
    ctx.requestRender()
  }

  /** What an Object pick can take: an object lying in the UCS's XY plane. */
  private pickArea(world: Vec2, ctx: ToolContext): Entity | null {
    const hit = ctx.pick(world)
    return hit && readsInPlan(hit) ? hit : null
  }

  /** Back to the first corner, in the mode Add area or Subtract area keeps. */
  private askCorner(ctx: ToolContext): void {
    this.state = { phase: "area", points: [], cursor: this.lastCursor() }
    this.askPoint(ctx)
    ctx.requestRender()
  }

  private lastCursor(): Vec2 {
    return this.state.phase === "area" ? this.state.cursor : { x: 0, y: 0 }
  }

  /** Whether the object has an area, which was then reported. */
  private reportObject(entity: Entity, ctx: ToolContext): boolean {
    const measured = objectArea(entity)
    if (measured === null) {
      ctx.report(ctx.text.message("objectHasNoArea"))
      return false
    }
    this.measure(measured.area, measured.measured, measured.around, ctx)
    return true
  }

  /**
   * The polygon's area and perimeter, then the command ends, or in Add area
   * or Subtract area the first corner is asked again.
   */
  private totalPolygon(
    points: readonly Vec2[],
    ctx: ToolContext
  ): CommandOptionOutcome {
    this.measure(
      polygonArea(points),
      "perimeter",
      polygonPerimeter(points),
      ctx
    )
    if (this.areaMode === "plain") return "end"
    this.askCorner(ctx)
    return "continue"
  }

  /**
   * `Area = …, Perimeter = …`, and in Add area or Subtract area the total
   * it is added to or taken from: `Total area = …`.
   */
  private measure(
    area: number,
    measured: string,
    around: number,
    ctx: ToolContext
  ): void {
    this.area = area
    const settings = ctx.document.getSettings()
    const report: AreaReport = {
      area: formatLength(area, settings),
      measured,
      around: formatLength(around, settings),
    }
    ctx.report(ctx.text.message("areaReport", report))
    if (this.areaMode === "plain") return
    this.total += this.areaMode === "add" ? area : -area
    this.shown = { ...report, total: formatLength(this.total, settings) }
    this.reportTotal(ctx)
  }

  private reportShown(ctx: ToolContext): void {
    if (!this.shown) return
    ctx.report(ctx.text.message("areaReport", this.shown))
    ctx.report(ctx.text.message("totalArea", this.shown))
  }

  private reportTotal(ctx: ToolContext): void {
    const total = formatLength(this.total, ctx.document.getSettings())
    ctx.report(ctx.text.message("totalArea", { total }))
  }

  wantsSnap(): boolean {
    if (this.state.phase === "multiple" && this.arc.active) {
      return this.arc.wantsSnap()
    }
    return this.state.phase !== "areaObject"
  }

  getConstraintAnchor(): Vec2 | null {
    if (this.state.phase === "multiple" && this.arc.active) {
      return this.arc.anchor()
    }
    return this.basePoint()
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    const out: ScenePrimitive[] = []
    const settings = ctx.document.getSettings()
    if (this.state.phase === "second") {
      this.drawDistance(out, ctx, this.state.base, this.state.cursor, settings)
    }
    if (this.state.phase === "multiple" || this.state.phase === "length") {
      this.drawRun(out, ctx, this.runWithCursor(this.state, ctx), settings)
    }
    if (this.state.phase === "area" && this.state.points.length > 0) {
      this.drawArea(out, ctx, this.state.points, this.state.cursor, settings)
    }
    if (this.state.phase === "areaObject" && this.state.hover) {
      out.push(
        ...entityScenePrimitive(ctx.viewport, this.state.hover, {
          color: THEME.selected,
          width: 2,
        })
      )
    }
    return out
  }

  private drawDistance(
    out: ScenePrimitive[],
    ctx: ToolContext,
    base: Vec3,
    tip: Vec3,
    settings: DocumentSettings
  ): void {
    const { viewport } = ctx
    const a = viewport.worldToScreen(base)
    const b = viewport.worldToScreen(tip)
    out.push({
      kind: "segment",
      a,
      b,
      stroke: {
        color: THEME.selected,
        width: 1.5,
        dash: [6, 4],
      },
    })
    pushTick(out, a)
    pushTick(out, b)

    const measured = measure(base, tip, settings.ucs)
    const suffix = unitSuffix(settings.unit)
    const { text } = ctx
    const lines = [
      text.feedback("measureDistance", {
        value: formatLength(measured.distance, settings),
        unit: suffix,
      }),
      text.feedback("measureAngle", {
        value: formatAngle(measured.angleInPlane, settings),
      }),
      text.feedback("measureDeltaX", {
        value: formatLength(measured.deltaX, settings),
      }),
      text.feedback("measureDeltaY", {
        value: formatLength(measured.deltaY, settings),
      }),
      text.feedback("measureDeltaZ", {
        value: formatLength(measured.deltaZ, settings),
      }),
    ]
    // The readout follows the tip (like AutoCAD's dimensional input), placed
    // above-right of it clear of the object-snap tooltip (which sits below-right
    // of the cursor), then clamped inside the viewport.
    placeAndPushReadout(out, b, lines, viewport)
  }

  /**
   * The run with the segment the cursor would add: in Multiple points the
   * line or the tangent arc to it, or the arc an Arc option's answers make.
   */
  private runWithCursor(run: Run, ctx: ToolContext): RunPath {
    if (run.phase === "length") return run
    let segment: ArcSegment | null
    if (this.arc.active) segment = this.arc.preview(ctx)
    else if (run.arcMode) {
      const bulge = this.pendingBulge(run, run.cursor)
      segment = { end: run.cursor, bulge: bulge ?? 0 }
    } else segment = { end: run.cursor, bulge: 0 }
    if (segment === null) return run
    const end = run.arcMode
      ? withZOf(segment.end, lastOf(run.points))
      : run.cursor
    return {
      ...run,
      points: [...run.points, end],
      bulges: [...run.bulges, segment.bulge],
    }
  }

  /** Multiple points' run, the cursor's point last, with its length. */
  private drawRun(
    out: ScenePrimitive[],
    ctx: ToolContext,
    run: RunPath,
    settings: DocumentSettings
  ): void {
    const { viewport } = ctx
    const { points, bulges } = run
    const screen = runOutline(points, bulges).map((point) =>
      viewport.worldToScreen(point)
    )
    out.push({
      kind: "path",
      points: screen,
      closed: false,
      stroke: { color: THEME.selected, width: 1.5, dash: [6, 4] },
    })
    for (const p of points) pushTick(out, viewport.worldToScreen(p))
    const lines = [
      ctx.text.feedback("measureDistance", {
        value: formatLength(pathLength(points, bulges), settings),
        unit: unitSuffix(settings.unit),
      }),
    ]
    placeAndPushReadout(out, screen[screen.length - 1], lines, viewport)
  }

  private drawArea(
    out: ScenePrimitive[],
    ctx: ToolContext,
    points: readonly Vec2[],
    cursor: Vec2,
    settings: DocumentSettings
  ): void {
    const { viewport } = ctx
    const vertices = [...points, cursor]
    const screen = vertices.map((v) => viewport.worldToScreen(v))
    if (screen.length >= 2) {
      out.push({
        kind: "path",
        points: screen,
        closed: true,
        stroke: {
          color: THEME.selected,
          width: 1.5,
          dash: [6, 4],
        },
      })
    }
    for (const p of screen) pushTick(out, p)

    const suffix = unitSuffix(settings.unit)
    const area = polygonArea(vertices)
    const perimeter = polygonPerimeter(vertices)
    const { text } = ctx
    const lines = [
      text.feedback("measureArea", {
        value: formatLength(area, settings),
        unit: suffix,
      }),
      text.feedback("measurePerimeter", {
        value: formatLength(perimeter, settings),
        unit: suffix,
      }),
    ]
    placeAndPushReadout(out, viewport.worldToScreen(cursor), lines, viewport)
  }
}

interface DistanceMeasure {
  readonly distance: number
  readonly angleInPlane: number
  readonly angleFromPlane: number
  readonly deltaX: number
  readonly deltaY: number
  readonly deltaZ: number
}

/** DIST in model space: 3D, its components and angles relative to the UCS. */
function measure(base: Vec3, tip: Vec3, ucs: Ucs): DistanceMeasure {
  const delta = worldDirectionToUcs(ucs, V.sub(tip, base))
  const deltaZ = tip.z - base.z
  const inPlane = Math.hypot(delta.x, delta.y)
  const degrees = (radians: number) =>
    normalizeDegrees((radians * 180) / Math.PI)
  return {
    distance: Math.hypot(inPlane, deltaZ),
    angleInPlane: degrees(Math.atan2(delta.y, delta.x)),
    angleFromPlane: degrees(Math.atan2(deltaZ, inPlane)),
    deltaX: delta.x,
    deltaY: delta.y,
    deltaZ,
  }
}

function distanceReport(measurement: Measurement, ctx: ToolContext): string {
  const settings = ctx.document.getSettings()
  const measured = measure(measurement.base, measurement.tip, settings.ucs)
  const length = (value: number) => formatLength(value, settings)
  const angle = (value: number) => formatAngle(value, settings)
  return ctx.text.message("distanceReport", {
    distance: length(measured.distance),
    angleInPlane: angle(measured.angleInPlane),
    angleFromPlane: angle(measured.angleFromPlane),
    deltaX: length(measured.deltaX),
    deltaY: length(measured.deltaY),
    deltaZ: length(measured.deltaZ),
  })
}

function lastOf(points: readonly Vec3[]): Vec3 {
  return points[points.length - 1]
}

/**
 * The length of the run through `points`: in space along its lines, and
 * along its arcs (`bulges`), as Arc's `Distance = …` adds them.
 */
function pathLength(
  points: readonly Vec3[],
  bulges: readonly number[] = []
): number {
  let total = 0
  for (let i = 1; i < points.length; i++) {
    const bulge = bulges[i - 1] ?? 0
    const chord = length3(sub3(points[i], points[i - 1]))
    if (bulge === 0) {
      total += chord
      continue
    }
    const included = 4 * Math.atan(Math.abs(bulge))
    total += (chord * included) / (2 * Math.sin(included / 2))
  }
  return total
}

/** The run's outline, its arcs as short chords, for the dashed preview. */
function runOutline(
  points: readonly Vec3[],
  bulges: readonly number[]
): Vec2[] {
  const outline: Vec2[] = points.slice(0, 1)
  for (let i = 1; i < points.length; i++) {
    const bulge = bulges[i - 1] ?? 0
    if (bulge !== 0) {
      const arc = bulgeToArc(points[i - 1], points[i], bulge)
      const sweep = normalizeAngle(arc.endAngle - arc.startAngle)
      const steps = Math.max(8, Math.ceil(sweep / (Math.PI / 32)))
      for (let k = 1; k < steps; k++) {
        // A clockwise arc runs from its end angle back: follow the run.
        const t = bulge > 0 ? k / steps : 1 - k / steps
        const angle = arc.startAngle + sweep * t
        outline.push({
          x: arc.center.x + arc.radius * Math.cos(angle),
          y: arc.center.y + arc.radius * Math.sin(angle),
        })
      }
    }
    outline.push(points[i])
  }
  return outline
}

/** A small filled square marking a measured point. */
function pushTick(out: ScenePrimitive[], p: Vec2): void {
  const s = 3
  out.push({
    kind: "rect",
    min: { x: p.x - s, y: p.y - s },
    width: s * 2,
    height: s * 2,
    fill: THEME.selected,
  })
}

/** Places the readout near `anchor` (above-right, clear of the snap tooltip)
 * and pushes its chip + lines. */
function placeAndPushReadout(
  out: ScenePrimitive[],
  anchor: Vec2,
  lines: readonly string[],
  viewport: { width: number; height: number }
): void {
  const size = readoutSize(lines)
  const at = placeReadout(anchor, size, viewport)
  out.push({
    kind: "rect",
    min: at,
    width: size.width,
    height: size.height,
    fill: THEME.snapTooltipBg,
    stroke: { color: THEME.snapTooltipBorder, width: 1 },
  })
  lines.forEach((line, i) => {
    out.push({
      kind: "label",
      at: {
        x: at.x + READOUT_PAD_X,
        y: at.y + READOUT_PAD_Y + 11 + i * READOUT_LINE_H,
      },
      text: line,
      color: THEME.snapTooltipText,
      font: "11px ui-monospace, monospace",
    })
  })
}

const READOUT_PAD_X = 6
const READOUT_PAD_Y = 4
const READOUT_LINE_H = 14
const READOUT_CHAR_W = 6.4 // ~width of one 11px monospace glyph

/** The pixel size of the readout chip for the given lines. */
function readoutSize(lines: readonly string[]): {
  width: number
  height: number
} {
  const longest = Math.max(...lines.map((l) => l.length))
  return {
    width: Math.ceil(longest * READOUT_CHAR_W) + READOUT_PAD_X * 2,
    height: lines.length * READOUT_LINE_H + READOUT_PAD_Y * 2,
  }
}

/**
 * The top-left of the readout chip: above-right of the anchor (the object-snap
 * tooltip occupies the space below-right of the cursor, so this stays clear),
 * flipped below-left if it would clip the top edge, then clamped into the view.
 */
function placeReadout(
  anchor: Vec2,
  size: { width: number; height: number },
  viewport: { width: number; height: number }
): Vec2 {
  const gap = 12
  let x = anchor.x + 16
  let y = anchor.y - size.height - gap
  if (y < 4) {
    // Would clip the top: drop below and swing left, away from the snap tooltip.
    x = anchor.x - size.width - 16
    y = anchor.y + gap
  }
  return {
    x: Math.max(4, Math.min(x, viewport.width - size.width - 4)),
    y: Math.max(4, Math.min(y, viewport.height - size.height - 4)),
  }
}

/** Signed-area (shoelace) magnitude of the closed polygon through `points`. */
function polygonArea(points: readonly Vec2[]): number {
  if (points.length < 3) return 0
  let sum = 0
  for (let i = 0; i < points.length; i++) {
    const a = points[i]
    const b = points[(i + 1) % points.length]
    sum += a.x * b.y - b.x * a.y
  }
  return Math.abs(sum) / 2
}

/** Perimeter of the closed polygon (includes the closing edge). */
function polygonPerimeter(points: readonly Vec2[]): number {
  if (points.length < 2) return 0
  let total = 0
  for (let i = 0; i < points.length; i++) {
    total += V.distance(points[i], points[(i + 1) % points.length])
  }
  return total
}

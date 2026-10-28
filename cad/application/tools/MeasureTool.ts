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
import { formatAngle, formatLength } from "../../domain/units"
import { Ucs, worldDirectionToUcs } from "../../domain/ucs"
import { Entity, isWidePolyline, readsInPlan } from "../../domain/entities"
import { objectArea } from "../../domain/objectArea"
import { ScenePrimitive, StrokeStyle } from "../../scene/types"
import { THEME } from "../../scene/theme"
import {
  isCoordinateExpression,
  parseCoordinate,
} from "../input/coordinateInput"
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
import { rollover } from "./ghostLook"
import type { PromptId } from "../../locales/types"
import { ARC_SEGMENT_OPTIONS, ArcSegmentInput } from "./arcSegmentInput"
import { lastDrawnDirection } from "./lastDrawnPoint"
import { typedPick } from "./typedPick"

/**
 * MEASURE (AutoCAD's DIST and AREA). Creates no geometry: while it asks it
 * draws AutoCAD's rubber band, and what it measures is said on the command
 * line. Two modes:
 *
 * - **Distance**: pick two points → AutoCAD's DIST: the 3D distance, the angle
 *   in and from the UCS's XY plane and the ΔX/ΔY/ΔZ between them, and the
 *   command ends, as AutoCAD's DIST does.
 * - **Area**: AutoCAD's AREA — a run of points, the (implicitly closed)
 *   polygon drawn filled through the cursor as a tentative vertex, or one
 *   object's (Object, the prompt's default); the command reports its area and
 *   perimeter and ends, as AutoCAD's does — or, under Add area or Subtract
 *   area, adds it to or takes it from a total and asks again.
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
    readonly id: string
  ) {}

  private state: MeasureState = { phase: "first" }
  private lastScreen: Vec2 | null = null
  /**
   * The AREA system variable, kept for the session: the last area measured,
   * or in Add area or Subtract area the total (probes inquiry/p211–p214).
   */
  private area = 0
  /** PERIMETER: the length around the last area measured. */
  private perimeter = 0
  /** DISTANCE: the last distance DIST measured between two points. */
  private distance = 0
  private areaMode: AreaMode = "plain"
  /** Add area's and Subtract area's total so far. */
  private total = 0
  /** Whether the run has a total yet, which eXit and Enter then say. */
  private totalled = false
  /** The last measurement in the mode and the total then, said again at its first corner. */
  private shown: (AreaReport & { readonly total: string }) | null = null
  /** Multiple points' Arc options, the prompts PLINE's ask. */
  private readonly arc = new ArcSegmentInput({
    finish: (segment, ctx) => this.arcDone(segment, ctx),
    back: (ctx) => this.askPoint(ctx),
    ctrlAtCenterAngle: false,
  })

  /** The AREA system variable, 0 until AREA has measured. */
  lastArea(): number {
    return this.area
  }

  /** The PERIMETER system variable, 0 until AREA has measured. */
  lastPerimeter(): number {
    return this.perimeter
  }

  /** The DISTANCE system variable, 0 until DIST has measured. */
  lastDistance(): number {
    return this.distance
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
    this.totalled = false
    this.shown = null
    this.state =
      this.mode === "area"
        ? { phase: "area", points: [], cursor: origin }
        : { phase: "first" }
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen
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
    // After the cursor is taken: moving the box rebuilds the dynamic prompt,
    // whose lead reads it.
    ctx.dynamicInput.setPosition(input.screen)
    ctx.requestRender()
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0) return
    if (this.state.phase === "areaObject") {
      // Under a typed object snap the pick is where it found its point
      // (probe inquiry/p228).
      this.pickObject(input.snap ? input.point : input.world, ctx)
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
      const measurement = { base: this.state.base, tip: point }
      this.distance = measure(
        measurement.base,
        measurement.tip,
        ctx.document.getSettings().ucs
      ).distance
      ctx.report(distanceReport(measurement, ctx))
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
      // The length from LASTPOINT, Length's base (p118's trace, p158).
      this.extend(length3(sub3(point, ctx.lastPoint)), ctx)
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
   * it has a segment, as AutoCAD 2027's console writes it before each
   * (pline/p145, p148).
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
   * way an arc ends heading, or before there is one the way a first arc
   * would leave (p157, p164). A length of 0 adds no point (p115, p162).
   */
  private extend(length: number, ctx: ToolContext): void {
    if (this.state.phase !== "length" || !Number.isFinite(length)) return
    const run = this.state
    if (length === 0) {
      this.walk(run, ctx)
      return
    }
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
    const direction = along ?? { ...run.startTangent, z: 0 }
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
          lastPoint: this.basePoint(commitCtx) ?? commitCtx.lastPoint,
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
          lastPoint: this.basePoint(commitCtx) ?? commitCtx.lastPoint,
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

  /**
   * What `@`, a bare number, Ortho and Polar read from. Multiple points'
   * line prompts and Length read LASTPOINT, which Length and a line's Undo
   * leave where it was (p160, p165–p167, p170); Arc's prompt the run's end,
   * where switching to it puts LASTPOINT (p168, p172).
   */
  private basePoint(ctx: ToolContext): Vec3 | null {
    switch (this.state.phase) {
      case "second":
        return this.state.base
      case "area":
        return this.state.points.at(-1) ?? null
      case "multiple":
        return this.state.arcMode ? lastOf(this.state.points) : ctx.lastPoint
      case "length":
        return ctx.lastPoint
      default:
        return null
    }
  }

  /**
   * Enter, at the box or the drawing: DIST's first point takes LASTPOINT and
   * its second measures to the first (LASTPOINT again), as AutoCAD's do, Multiple points'
   * next point takes `<Total>` and its Length refuses it; AREA's first corner
   * takes `<Object>`, from the third point it takes `<Total>`, and before that
   * AutoCAD 2027's console refuses it as a missing point (probe inquiry/p208).
   * In Add area or Subtract area the first corner's Enter ends, writing the
   * total once there is one (p212, p258), and `Select objects:`'s goes back
   * to the first corner, saying the last measurement again (p215).
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
          this.endTotal(ctx)
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
   * so far again after its refusal, as AutoCAD 2027's console refuses them
   * (pline/p145).
   */
  takes(): QuestionInput | null {
    if (this.state.phase === "areaObject") return "objectOrLast"
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
   * points' set it, as AutoCAD 2027's console shows (probes inquiry/p356,
   * p358); AREA's `Select objects:` sets it to the pick, which Last leaves
   * (p253).
   */
  setsLastPoint(): boolean | null {
    if (this.state.phase === "second") return false
    if (this.state.phase === "areaObject") return true
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

  /**
   * In Add area or Subtract area the first corner says the last measurement
   * and the total again whenever it is asked again: after its refusal and
   * after `Resuming AREA command.` (probes inquiry/p213, p255).
   */
  onAskAgain(ctx: ToolContext): void {
    if (this.state.phase === "area" && this.state.points.length === 0) {
      this.reportShown(ctx)
    }
  }

  /**
   * A point typed at `Select objects:` picks there, as a click does, a
   * number its direct distance; on nothing, or off the screen, it is asked
   * again without a word (probes circle/p241, inquiry/p218, p219, p240).
   */
  answerTyped(text: string, ctx: ToolContext): boolean {
    if (this.state.phase !== "areaObject") return false
    const point = typedPick(text, ctx)
    if (!point) return false
    const { x, y } = ctx.viewport.worldToScreen(point)
    const { width, height } = ctx.viewport
    if (x >= 0 && y >= 0 && x <= width && y <= height) {
      this.pickObject(point, ctx)
    }
    return true
  }

  /** A typed object snap picks at its point (probe inquiry/p228). */
  takesSnapOverride(): boolean {
    return this.state.phase === "areaObject"
  }

  /**
   * `Select objects:` takes an object on a locked layer (p217's trace,
   * `AllowObjectOnLockedLayer`; p220).
   */
  picksLocked(): boolean {
    return this.state.phase === "areaObject"
  }

  /**
   * Escape at a prompt a keyword opened goes back to the prompt that opened
   * it, `*Cancel*` on the line it leaves and the run said again: DIST's
   * Length, and any prompt of an Arc option, back to the arc's endpoint
   * (desktop inquiry/d05, e01). Everywhere else it cancels the command.
   */
  onEscape(ctx: ToolContext): boolean | "cancelled" {
    const run = this.state
    if (run.phase === "length") {
      this.walk(run, ctx)
      return "cancelled"
    }
    if (run.phase === "multiple" && this.arc.active) {
      this.arc.cancel()
      this.walk(run, ctx)
      return "cancelled"
    }
    return false
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
   * area and takes Add area unlisted, as AutoCAD 2027's console does, and
   * the other way round (probes inquiry/p212, p215). DIST's Arc lists PLINE's
   * arc options.
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
      // unlisted (table 20164), which AutoCAD 2027's console takes (probe
      // inquiry/p215).
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
      // eXit says the total as Enter does (probes inquiry/p215, p254).
      case "eXit":
        if (this.state.phase !== "area" || this.state.points.length > 0) {
          return "unhandled"
        }
        this.endTotal(ctx)
        return "end"
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
          // WHY the mode kept: 2027's DIST stays in Arc (pline/p148), where
          // PLINE's goes on as the segment left was drawn (p128).
          this.walk(
            {
              points: state.points.slice(0, -1),
              bulges: state.bulges.slice(0, -1),
              arcMode: state.arcMode,
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
   * so as AutoCAD 2027's console does (probe inquiry/p241).
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

  /** The object picked at `world`, measured; the command ends with a plain one. */
  private pickObject(world: Vec2, ctx: ToolContext): void {
    const picked = this.pickArea(world, ctx)
    if (picked && this.reportObject(picked, ctx) && this.areaMode === "plain") {
      ctx.endCommand()
    }
  }

  /** Whether the object has an area, which was then reported. */
  private reportObject(entity: Entity, ctx: ToolContext): boolean {
    const measured = objectArea(entity)
    if (measured === null) {
      ctx.report(ctx.text.message("objectHasNoArea"))
      return false
    }
    this.measure(measured.area, measured.measured, measured.around, ctx)
    // Only a closed one is probed (inquiry/p222).
    if (entity.type === "polyline" && entity.closed && isWidePolyline(entity)) {
      ctx.report(ctx.text.message("polylineWidthIgnored"))
    }
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
    this.perimeter = around
    const settings = ctx.document.getSettings()
    const report: AreaReport = {
      area: formatLength(area, settings),
      measured,
      around: formatLength(around, settings),
    }
    ctx.report(ctx.text.message("areaReport", report))
    if (this.areaMode === "plain") return
    this.total += this.areaMode === "add" ? area : -area
    this.area = this.total
    this.totalled = true
    this.shown = { ...report, total: formatLength(this.total, settings) }
    this.reportTotal(ctx)
  }

  private reportShown(ctx: ToolContext): void {
    if (!this.shown) return
    ctx.report(ctx.text.message("areaReport", this.shown))
    ctx.report(ctx.text.message("totalArea", this.shown))
  }

  /** Leaving Add area or Subtract area: the total, once there is one. */
  private endTotal(ctx: ToolContext): void {
    if (this.totalled) this.reportTotal(ctx)
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

  getConstraintAnchor(ctx: ToolContext): Vec2 | null {
    if (this.state.phase === "multiple" && this.arc.active) {
      return this.arc.anchor()
    }
    return this.basePoint(ctx)
  }

  /**
   * Multiple points' total heads the dynamic prompt, `Distance = 45.0546`
   * above `Specify next point or`: the run to the cursor, as with dynamic
   * input on (desktop inquiry/d02-1, e02-1); at Length the run so far.
   */
  dynamicPromptLead(ctx: ToolContext): string | null {
    const run = this.state
    if (run.phase !== "multiple" && run.phase !== "length") return null
    // WHY from the first segment on: the console says the run once it has
    // one, and no screenshot shows the tooltip before it.
    if (run.points.length < 2) return null
    const { points, bulges } = this.runWithCursor(run, ctx)
    return ctx.text.message("distanceTotal", {
      value: formatLength(
        pathLength(points, bulges),
        ctx.document.getSettings()
      ),
    })
  }

  /**
   * What AutoCAD's DIST and AREA draw: the rubber band, solid, and AREA's
   * corners filled translucent green through the cursor; no marks and no
   * readout (desktop inquiry/d01–d04).
   */
  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    const { viewport } = ctx
    const screen = (points: readonly Vec2[]) =>
      points.map((point) => viewport.worldToScreen(point))
    switch (this.state.phase) {
      case "second":
        return [
          {
            kind: "segment",
            a: viewport.worldToScreen(this.state.base),
            b: viewport.worldToScreen(this.state.cursor),
            stroke: RUBBER_BAND,
          },
        ]
      case "multiple":
      case "length": {
        const { points, bulges } = this.runWithCursor(this.state, ctx)
        return [
          {
            kind: "path",
            points: screen(runOutline(points, bulges)),
            closed: false,
            stroke: RUBBER_BAND,
          },
        ]
      }
      case "area": {
        const { points, cursor } = this.state
        if (points.length === 0) return []
        const corners = screen([...points, cursor])
        if (points.length === 1) {
          return [
            {
              kind: "segment",
              a: corners[0],
              b: corners[1],
              stroke: RUBBER_BAND,
            },
          ]
        }
        return [
          {
            kind: "path",
            points: corners,
            closed: true,
            fill: THEME.measureAreaFill,
            stroke: RUBBER_BAND,
          },
        ]
      }
      case "areaObject":
        return this.state.hover ? rollover(ctx, this.state.hover) : []
      default:
        return []
    }
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
}

/** DIST's and AREA's band, as every other command's (desktop inquiry/d01-1). */
const RUBBER_BAND: StrokeStyle = { color: THEME.rubberBand, width: 1 }

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

/** The run's outline, its arcs as short chords, for the rubber band. */
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

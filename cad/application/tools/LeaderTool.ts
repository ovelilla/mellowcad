import { Vec2 } from "../../geometry/Vec2"
import { Vec3, withZOf } from "../../geometry/Vec3"
import {
  Entity,
  InsertEntity,
  LeaderEntity,
  MTextEntity,
  attachLeaderBlock,
  attachLeaderCopy,
  attachLeaderText,
  createLeader,
  dimLook,
  mtextContents,
  nextEntityId,
  onPlaneOf,
} from "../../domain/entities"
import { DEFAULT_DIM_STYLE } from "../../domain/dimStyles"
import type { PromptId } from "../../locales/types"
import { AddEntitiesCommand } from "../commands/entityCommands"
import {
  isCoordinateExpression,
  parseCoordinate,
} from "../input/coordinateInput"
import { entityScenePrimitive } from "../SceneBuilder"
import { ScenePrimitive } from "../../scene/types"
import { THEME } from "../../scene/theme"
import { withCurrentProperties } from "./currentProperties"
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

/** Reused so the jig's frames burn no entity ids. */
const PREVIEW_ID = "leader-preview"
const TEXT_PREVIEW_ID = "leader-text-preview"

type LeaderState =
  | { readonly phase: "start" }
  /** The points picked so far, one or more. */
  | { readonly phase: "points"; readonly points: readonly Vec3[] }
  | { readonly phase: "format"; readonly points: readonly Vec3[] }
  | {
      readonly phase: "lines"
      readonly points: readonly Vec3[]
      readonly lines: readonly string[]
    }
  | { readonly phase: "option"; readonly points: readonly Vec3[] }
  | { readonly phase: "editor"; readonly points: readonly Vec3[] }
  | { readonly phase: "copy"; readonly points: readonly Vec3[] }

/**
 * AutoCAD's LEADER (leader/p01–p06, p17; AcDimRes 5507–5533). `Specify leader
 * start point:`, `Specify next point:`, then `Specify next point or
 * [Annotation/Format/Undo] <Annotation>:` for as many points as wanted. Enter
 * at the first two ends the command and makes nothing; Undo takes back the
 * last point, refused at the second (`Invalid Input.`, p04). Format asks
 * `Enter leader format option [Spline/STraight/Arrow/None] <Exit>:`, each
 * answer, Enter too, back at the point prompt; it sets how the leader is made.
 *
 * Annotation, or Enter: `Enter first line of annotation text or <options>:`
 * and `Enter next line of annotation text:` until an empty line, the lines an
 * MTEXT's paragraphs; Enter at the first instead asks `Enter an annotation
 * option [Copy/None/Mtext] <Mtext>:` — Copy takes an MTEXT, a TEXT or a block
 * reference and puts a copy of it at the end (`Select an object to copy:`,
 * p06, p19), None makes the leader alone, Mtext opens the in-place editor at
 * the end with no box (desktop, leader/d01). The text is placed and the hook
 * worked out as `attachLeaderText` says (p02, p12), the leader and its text
 * one step, both in the current properties, the text in the current style.
 *
 * Not offered: Tolerance (there is no TOLERANCE object) and Block (INSERT's
 * prompts inside LEADER's) — the prompt lists the three it has.
 */
export class LeaderTool implements Tool {
  readonly id = "leader"

  private state: LeaderState = { phase: "start" }
  private cursor: Vec3 | null = null
  private lastScreen: Vec2 | null = null
  /** Format's choices, which last the run (p04). */
  private spline = false
  private arrow = true

  onActivate(ctx: ToolContext): void {
    this.state = { phase: "start" }
    this.spline = false
    this.arrow = true
    ctx.setCursor("crosshair")
    ctx.selection.clear()
    this.openPointInput(ctx)
  }

  onDeactivate(ctx: ToolContext): void {
    // Leaving the editor any way but Escape keeps what was typed, as a click
    // outside AutoCAD's does.
    if (this.state.phase === "editor") this.commitEditor(ctx)
    this.state = { phase: "start" }
    ctx.dynamicInput.close()
  }

  onKeyDown(input: KeyInput): void {
    // Escape in the editor discards the whole leader with its text.
    if (input.key === "Escape" && this.state.phase === "editor") {
      this.state = { phase: "start" }
    }
  }

  question(): ToolQuestion | PromptId | null {
    const state = this.state
    switch (state.phase) {
      case "start":
        return "leaderStartPoint"
      case "points":
        return state.points.length < 2 ? "leaderNextPoint" : "leaderNextPointOr"
      case "format":
        return "leaderFormatOption"
      case "lines":
        return state.lines.length === 0
          ? { id: "leaderFirstLine", enter: "leaderOptions" }
          : "leaderNextLine"
      case "option":
        return "leaderAnnotationOption"
      case "copy":
        return "leaderCopyObject"
      case "editor":
        return null
    }
  }

  takes(): QuestionInput | null {
    const state = this.state
    if (state.phase === "points" && state.points.length < 2) {
      // `Invalid Input.` for a word there, Undo included (p03, p04).
      return { refusal: "invalidInputCapital" }
    }
    if (state.phase === "copy") return "object"
    return null
  }

  wantsSnap(): boolean {
    return this.state.phase === "start" || this.state.phase === "points"
  }

  getConstraintAnchor(): Vec3 | null {
    const state = this.state
    return state.phase === "points" ? (state.points.at(-1) ?? null) : null
  }

  commandOptions(): CommandOption[] {
    const state = this.state
    switch (state.phase) {
      case "points":
        return state.points.length < 2
          ? []
          : [{ id: "Annotation" }, { id: "Format" }, { id: "Undo" }]
      case "format":
        return [
          { id: "Spline" },
          { id: "STraight" },
          { id: "Arrow" },
          { id: "None" },
          { id: "Exit", hidden: true },
        ]
      case "option":
        return [{ id: "Copy" }, { id: "None" }, { id: "Mtext" }]
      default:
        return []
    }
  }

  defaultOption(): string | null {
    const state = this.state
    if (state.phase === "points" && state.points.length >= 2)
      return "Annotation"
    if (state.phase === "format") return "Exit"
    if (state.phase === "option") return "Mtext"
    return null
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    const state = this.state
    if (state.phase === "points" && state.points.length >= 2) {
      switch (id) {
        case "Annotation":
          this.enterLines(state.points, ctx)
          return "continue"
        case "Format":
          this.state = { phase: "format", points: state.points }
          this.openKeywords(ctx)
          return "continue"
        case "Undo":
          this.state = { phase: "points", points: state.points.slice(0, -1) }
          this.openPointInput(ctx)
          return "continue"
      }
      return "unhandled"
    }
    if (state.phase === "format") {
      switch (id) {
        case "Spline":
          this.spline = true
          break
        case "STraight":
          this.spline = false
          break
        case "Arrow":
          this.arrow = true
          break
        case "None":
          this.arrow = false
          break
        case "Exit":
          break
        default:
          return "unhandled"
      }
      this.state = { phase: "points", points: state.points }
      this.openPointInput(ctx)
      return "continue"
    }
    if (state.phase === "option") {
      switch (id) {
        case "None":
          this.make(state.points, null, ctx)
          return "end"
        case "Mtext":
          this.enterEditor(state.points, ctx)
          return "continue"
        case "Copy":
          this.state = { phase: "copy", points: state.points }
          ctx.dynamicInput.close()
          return "continue"
      }
    }
    return "unhandled"
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen
    this.cursor = input.point
    ctx.dynamicInput.setPosition(input.screen)
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0) return
    const state = this.state
    if (state.phase === "start" || state.phase === "points") {
      this.takePoint(input.point, ctx)
    } else if (state.phase === "copy") {
      this.takeCopy(input.world, ctx)
    }
  }

  onEnter(ctx: ToolContext): boolean {
    const state = this.state
    switch (state.phase) {
      case "start":
        return false
      case "points":
        if (state.points.length < 2) return false
        this.enterLines(state.points, ctx)
        return true
      case "format":
        this.invokeOption("Exit", ctx)
        return true
      case "option":
        this.enterEditor(state.points, ctx)
        return true
      case "lines":
        return this.commitLine("", ctx)
      case "editor":
        return true
      case "copy":
        return true
    }
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    const state = this.state
    const cursor = this.cursor
    const style = { color: THEME.rubberBand, width: 1 }
    switch (state.phase) {
      case "points": {
        const points = cursor ? [...state.points, cursor] : state.points
        if (points.length < 2) return []
        return entityScenePrimitive(
          ctx.viewport,
          this.leaderOf(points, ctx, PREVIEW_ID),
          style,
          { dimStyle: this.dimStyle(ctx) }
        )
      }
      case "lines":
      case "editor": {
        const made = this.made(state.points, this.typedContents(ctx), ctx)
        if (!made) return []
        return made.flatMap((entity) =>
          entityScenePrimitive(ctx.viewport, entity, style, {
            dimStyle: this.dimStyle(ctx),
          })
        )
      }
      default:
        return []
    }
  }

  private dimStyle(ctx: ToolContext) {
    return (
      ctx.document.getDimStyle(ctx.document.getCurrentDimStyleId()) ??
      DEFAULT_DIM_STYLE
    )
  }

  private openPointInput(ctx: ToolContext): void {
    const question = this.question()
    const prompt = typeof question === "string" ? question : null
    if (!prompt) return
    ctx.dynamicInput.open({
      fields: [{ id: "point", prompt, kind: "coordinate" }],
      commit: () => {},
      commitRaw: (commitCtx) => {
        if (!commitCtx.dynamicInput.hasTypedText())
          return this.onEnter(commitCtx)
        const text = commitCtx.dynamicInput.getText("point").trim()
        if (!isCoordinateExpression(text)) return false
        const last =
          this.state.phase === "points" ? this.state.points.at(-1) : undefined
        const point = parseCoordinate(text, {
          lastPoint: last ?? commitCtx.lastPoint,
          relativeByDefault: false,
          ucs: commitCtx.ucs,
          elevation: commitCtx.elevation,
        })
        if (!point) return false
        this.takePoint(point, commitCtx)
        return true
      },
    })
    if (this.lastScreen) ctx.dynamicInput.setPosition(this.lastScreen)
  }

  /** A prompt of keywords alone: their chips, Enter its default. */
  private openKeywords(ctx: ToolContext): void {
    ctx.dynamicInput.open({ fields: [], commit: () => {} })
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  private takePoint(point: Vec3, ctx: ToolContext): void {
    const state = this.state
    if (state.phase === "start") {
      this.state = { phase: "points", points: [point] }
    } else if (state.phase === "points") {
      // Every point in the plane of the first (`onPlaneOf` makes it so).
      this.state = {
        phase: "points",
        points: [...state.points, withZOf(point, state.points[0])],
      }
    } else {
      return
    }
    this.openPointInput(ctx)
  }

  private enterLines(points: readonly Vec3[], ctx: ToolContext): void {
    this.state = { phase: "lines", points, lines: [] }
    this.openLineInput(ctx)
  }

  private openLineInput(ctx: ToolContext): void {
    const question = this.question()
    const prompt =
      typeof question === "string" ? question : (question?.id ?? null)
    if (!prompt) return
    ctx.dynamicInput.open({
      fields: [{ id: "line", prompt, kind: "text" }],
      commit: () => {},
      commitRaw: (commitCtx) =>
        this.commitLine(commitCtx.dynamicInput.getText("line"), commitCtx),
    })
    if (this.lastScreen) ctx.dynamicInput.setPosition(this.lastScreen)
  }

  /** A line typed: the next one asked, or, empty, the text made (or the options). */
  private commitLine(line: string, ctx: ToolContext): boolean {
    const state = this.state
    if (state.phase !== "lines") return false
    if (line !== "") {
      this.state = { ...state, lines: [...state.lines, line] }
      this.openLineInput(ctx)
      return true
    }
    if (state.lines.length === 0) {
      this.state = { phase: "option", points: state.points }
      this.openKeywords(ctx)
      return true
    }
    this.make(state.points, state.lines.join("\\P"), ctx)
    ctx.endCommand()
    return true
  }

  private enterEditor(points: readonly Vec3[], ctx: ToolContext): void {
    this.state = { phase: "editor", points }
    ctx.dynamicInput.open({
      fields: [{ id: "value", prompt: "text", kind: "paragraphs" }],
      commit: () => {},
      commitRaw: (commitCtx) => {
        this.commitEditor(commitCtx)
        commitCtx.endCommand()
        return true
      },
    })
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  /** The editor closed: its text, or the leader alone when it holds none (unverified). */
  private commitEditor(ctx: ToolContext): void {
    const state = this.state
    if (state.phase !== "editor") return
    const typed = ctx.dynamicInput.getText("value")
    this.make(
      state.points,
      typed.trim().length > 0 ? mtextContents(typed) : null,
      ctx
    )
  }

  /** What the text being typed reads, for the jig. */
  private typedContents(ctx: ToolContext): string {
    const state = this.state
    if (state.phase === "editor") {
      return mtextContents(ctx.dynamicInput.getText("value"))
    }
    if (state.phase !== "lines") return ""
    const current = ctx.dynamicInput.getText("line")
    return [...state.lines, ...(current ? [current] : [])].join("\\P")
  }

  private takeCopy(world: Vec2, ctx: ToolContext): void {
    const state = this.state
    if (state.phase !== "copy") return
    const picked = ctx.pick(world)
    if (!picked) return
    const copied = this.copied(state.points, picked, ctx)
    if (!copied) {
      ctx.report(ctx.text.message("leaderCopyRefused"), "error")
      return
    }
    this.state = { phase: "start" }
    ctx.execute(new AddEntitiesCommand(copied))
    ctx.endCommand()
  }

  /**
   * Copy's leader and copy: an MTEXT or a TEXT copied to an MTEXT at the end
   * (p06), a block reference put at the end, its scale kept and its angle 0
   * (p19); anything else refused.
   */
  private copied(
    points: readonly Vec3[],
    picked: Entity,
    ctx: ToolContext
  ): Entity[] | null {
    const leader = this.leaderOf(points, ctx)
    const look = dimLook(this.dimStyle(ctx))
    if (picked.type === "mtext" || picked.type === "text") {
      const contents =
        picked.type === "mtext" ? picked.contents : mtextContents(picked.value)
      const { leader: placed, text } = attachLeaderCopy(
        leader,
        { contents, height: picked.height, styleId: picked.styleId },
        look
      )
      return [
        withCurrentProperties(placed, ctx),
        withCurrentProperties(onPlaneOf(text, points[0]), ctx),
      ]
    }
    if (picked.type === "insert" && !picked.array) {
      const end = leader.vertices[leader.vertices.length - 1]
      const insert: InsertEntity = onPlaneOf(
        {
          ...picked,
          id: nextEntityId(),
          position: { x: end.x, y: end.y },
          rotation: 0,
        },
        points[0]
      )
      return [
        withCurrentProperties(attachLeaderBlock(leader, insert), ctx),
        withCurrentProperties(insert, ctx),
      ]
    }
    return null
  }

  /** The leader through `points`, as Format set it, in the plane of the first. */
  private leaderOf(
    points: readonly Vec3[],
    ctx: ToolContext,
    id?: string
  ): LeaderEntity {
    return onPlaneOf(
      createLeader(points, ctx.document.getCurrentDimStyleId(), {
        arrow: this.arrow,
        spline: this.spline,
        layerId: ctx.document.getCurrentLayerId(),
        ...(id ? { id } : {}),
      }),
      points[0]
    )
  }

  /** The leader and its text, or the leader alone, as one step. */
  private make(
    points: readonly Vec3[],
    contents: string | null,
    ctx: ToolContext
  ): void {
    this.state = { phase: "start" }
    const made = this.made(points, contents, ctx, true)
    if (made) ctx.execute(new AddEntitiesCommand(made))
  }

  private made(
    points: readonly Vec3[],
    contents: string | null,
    ctx: ToolContext,
    real = false
  ): Entity[] | null {
    if (points.length < 2) return null
    const leader = this.leaderOf(points, ctx, real ? undefined : PREVIEW_ID)
    if (contents === null || contents === "") {
      return real ? [withCurrentProperties(leader, ctx)] : [leader]
    }
    const { leader: associated, text } = attachLeaderText(
      leader,
      contents,
      dimLook(this.dimStyle(ctx)),
      ctx.document.getCurrentTextStyleId(),
      real ? undefined : TEXT_PREVIEW_ID
    )
    const onPlane: MTextEntity = onPlaneOf(text, points[0])
    return real
      ? [
          withCurrentProperties(associated, ctx),
          withCurrentProperties(onPlane, ctx),
        ]
      : [associated, onPlane]
  }
}

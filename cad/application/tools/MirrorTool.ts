import { Vec2, V } from "../../geometry/Vec2"
import { Entity, mirrorEntity, mirrorEntityCopy } from "../../domain/entities"
import { DynamicInputSession } from "../input/DynamicInput"
import type { PromptId } from "../../locales/types"
import {
  isCoordinateExpression,
  parseCoordinate,
} from "../input/coordinateInput"
import { ScenePrimitive, StrokeStyle } from "../../scene/types"
import { entityScenePrimitive } from "../SceneBuilder"
import { THEME } from "../../scene/theme"
import {
  AddEntitiesCommand,
  UpdateEntitiesCommand,
} from "../commands/entityCommands"
import {
  CommandOption,
  CommandOptionOutcome,
  PointerInput,
  Tool,
  ToolContext,
  type QuestionInput,
} from "./Tool"
import { ObjectSelector } from "./objectSelection"

/**
 * AutoCAD's MIRROR command: select a set of objects, then reflect them across a
 * mirror line defined by two points.
 *
 * ```
 *   (empty selection)   Enter/Space    click / type    click / type    [No] keep source
 *  selecting ───────────────────► first ──────────► second ──────────► erase? ──► done
 *   click / box-drag adds objects        (dashed mirrored ghost tracks)   [Yes] flip in place
 * ```
 *
 * After the two mirror-line points, AutoCAD asks "Erase source objects?
 * [Yes/No]" with **No** the default: No keeps the originals and adds the
 * reflected copy; Yes deletes the originals, leaving only the reflection (an
 * in-place flip). Works on any selection — lines and circles alike (a circle
 * keeps its radius) — with object snap and Ortho/Polar locking the mirror line
 * to the axes, plus typed coordinate entry for either point.
 */

type MirrorState =
  /** No pre-selection: `Select objects:` builds the set. */
  | { readonly phase: "selecting" }
  /** Objects chosen; awaiting the first point of the mirror line. */
  | { readonly phase: "first" }
  /** First point placed; the mirror line drags to the second point. */
  | {
      readonly phase: "second"
      readonly first: Vec2
      readonly originals: readonly Entity[]
      readonly current: Vec2
    }
  /** Mirror line fixed; asking whether to erase the source objects. */
  | {
      readonly phase: "erase"
      readonly first: Vec2
      readonly second: Vec2
      readonly originals: readonly Entity[]
    }

export class MirrorTool implements Tool {
  readonly id = "mirror"

  private state: MirrorState = { phase: "selecting" }
  private readonly selector = new ObjectSelector({
    takes: () => "wholeObjects",
    done: (ctx) => this.confirmSelection(ctx),
  })
  private lastScreen: Vec2 | null = null

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    // Pre-selected objects (the common path) skip straight to the mirror line,
    // matching AutoCAD; otherwise prompt to select the objects first.
    this.selector.start()
    if (!this.selector.preselect(ctx)) {
      this.state = { phase: "selecting" }
    } else {
      this.state = { phase: "first" }
      this.openPointInput(ctx, "mirrorFirstPoint")
    }
  }

  question(): PromptId {
    switch (this.state.phase) {
      case "selecting":
        return this.selector.question()
      case "first":
        return "specifyFirstPointOfMirrorLine"
      case "second":
        return "specifySecondPointOfMirrorLine"
      case "erase":
        return "eraseSourceObjects"
    }
  }

  /** The mirror line's points are 2D, and its selection whole objects. */
  takes(): QuestionInput | null {
    switch (this.state.phase) {
      case "selecting":
        return this.selector.takes()
      case "first":
      case "second":
        return "point2d"
      case "erase":
        return null
    }
  }

  defaultOption(): string | null {
    return this.state.phase === "erase" ? "No" : null
  }

  onDeactivate(ctx: ToolContext): void {
    this.state = { phase: "selecting" }
    this.selector.start()
    ctx.dynamicInput.close()
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen

    switch (this.state.phase) {
      case "selecting":
        this.selector.onPointerMove(input, ctx)
        break
      case "first":
        ctx.dynamicInput.setPosition(input.screen)
        break
      case "second":
        this.state = { ...this.state, current: input.point }
        ctx.dynamicInput.setPosition(input.screen)
        break
      case "erase":
        ctx.dynamicInput.setPosition(input.screen)
        break
    }

    ctx.requestRender()
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0) return

    switch (this.state.phase) {
      case "selecting":
        this.selector.onPointerDown(input, ctx)
        return
      case "first": {
        const first = this.resolvePoint(input.point, "first", ctx, null)
        this.enterSecond(first, ctx)
        return
      }
      case "second": {
        const second = this.resolvePoint(
          input.point,
          "second",
          ctx,
          this.state.first
        )
        this.enterErase(this.state.first, second, ctx)
        return
      }
      case "erase":
        // The mirror line is fixed; the Yes/No choice is keyboard-driven.
        break
    }
  }

  answerTyped(text: string, ctx: ToolContext): boolean {
    return (
      this.state.phase === "selecting" && this.selector.answerTyped(text, ctx)
    )
  }

  onPointerUp(input: PointerInput, ctx: ToolContext): void {
    if (this.state.phase === "selecting") this.selector.onPointerUp(input, ctx)
  }

  cycleLasso(ctx: ToolContext): boolean {
    return this.selector.cycleLasso(ctx)
  }

  onEnter(ctx: ToolContext): boolean {
    // Enter accepts the default at the "Erase source objects?" prompt (No), and
    // confirms the selection set while selecting.
    if (this.state.phase === "erase") {
      this.commit(this.state, false, ctx)
      return true
    }
    return this.state.phase === "selecting" && this.selector.onEnter(ctx)
  }

  commandOptions(): readonly CommandOption[] {
    if (this.state.phase === "selecting") return this.selector.commandOptions()
    if (this.state.phase === "erase") {
      // "Erase source objects? [Yes/No] <N>" — Enter takes the default No.
      return [{ id: "Yes" }, { id: "No" }]
    }
    return []
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    if (this.state.phase === "selecting") {
      return this.selector.invokeOption(id, ctx) ? "continue" : "unhandled"
    }
    if (this.state.phase !== "erase") return "unhandled"
    if (id === "Yes") {
      this.commit(this.state, true, ctx)
      return "end"
    }
    if (id === "No") {
      this.commit(this.state, false, ctx)
      return "end"
    }
    return "unhandled"
  }

  getConstraintAnchor(): Vec2 | null {
    // Ortho/Polar lock the mirror line to the axes, from its first point.
    return this.state.phase === "second" ? this.state.first : null
  }

  wantsSnap(): boolean {
    // Object snaps help place the mirror-line points precisely; picking objects
    // and the Yes/No prompt do not need them.
    return (
      this.state.phase === "first" ||
      this.state.phase === "second" ||
      (this.state.phase === "selecting" && this.selector.wantsSnap())
    )
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    if (this.state.phase === "selecting") return this.selector.buildOverlay(ctx)
    const { viewport } = ctx

    const out: ScenePrimitive[] = []
    if (this.state.phase === "second") {
      const { first, current, originals } = this.state
      // The mirror line (axis) and the reflected ghost of the selection.
      out.push({
        kind: "segment",
        a: viewport.worldToScreen(first),
        b: viewport.worldToScreen(current),
        stroke: { color: THEME.selected, width: 1, dash: [6, 4] },
      })
      pushGhost(out, viewport, originals, first, current, ctx.blocks)
    }
    return out
  }

  private confirmSelection(ctx: ToolContext): void {
    this.state = { phase: "first" }
    this.openPointInput(ctx, "mirrorFirstPoint")
    ctx.requestRender()
  }

  private openPointInput(ctx: ToolContext, prompt: PromptId): void {
    const fieldId = this.state.phase === "first" ? "first" : "second"
    const session: DynamicInputSession = {
      fields: [{ id: fieldId, prompt, kind: "coordinate" }],
      commit: () => {},
      commitRaw: (commitCtx) => this.commitPointCoordinate(fieldId, commitCtx),
    }
    ctx.dynamicInput.open(session)
    if (this.lastScreen) ctx.dynamicInput.setPosition(this.lastScreen)
  }

  private commitPointCoordinate(fieldId: string, ctx: ToolContext): boolean {
    const text = ctx.dynamicInput.getText(fieldId).trim()
    if (!isCoordinateExpression(text)) return false
    if (this.state.phase === "first" && fieldId === "first") {
      const first = parseCoordinate(text, {
        lastPoint: ctx.lastPoint,
        relativeByDefault: false,
        ucs: ctx.ucs,
        elevation: ctx.elevation,
      })
      if (!first) return false
      this.enterSecond(first, ctx)
      return true
    }
    if (this.state.phase === "second" && fieldId === "second") {
      const second = parseCoordinate(text, {
        lastPoint: this.state.first,
        relativeByDefault: true,
        ucs: ctx.ucs,
        elevation: ctx.elevation,
      })
      if (!second) return false
      this.enterErase(this.state.first, second, ctx)
      return true
    }
    return false
  }

  private enterSecond(first: Vec2, ctx: ToolContext): void {
    const originals = this.snapshotSelection(ctx)
    if (originals.length === 0) {
      // The selection vanished (e.g. undo elsewhere): fall back to picking.
      this.state = { phase: "selecting" }
      this.selector.start()
      ctx.dynamicInput.close()
      return
    }
    this.state = { phase: "second", first, originals, current: first }
    this.openPointInput(ctx, "mirrorSecondPoint")
  }

  private enterErase(first: Vec2, second: Vec2, ctx: ToolContext): void {
    if (this.state.phase !== "second") return
    // A zero-length mirror line can't reflect: end without changing anything.
    if (V.equals(first, second)) {
      ctx.dynamicInput.close()
      ctx.endCommand()
      return
    }
    this.state = {
      phase: "erase",
      first,
      second,
      originals: this.state.originals,
    }
    // A keyword-only prompt (no typed field); the Yes/No options render as
    // chips and Enter accepts the default No.
    const session: DynamicInputSession = {
      fields: [],
      commit: () => {},
    }
    ctx.dynamicInput.open(session)
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }

  /** Applies the mirror — keeping or erasing the source — and ends the command. */
  private commit(
    state: Extract<MirrorState, { phase: "erase" }>,
    erase: boolean,
    ctx: ToolContext
  ): void {
    const { first, second, originals } = state
    if (erase) {
      ctx.execute(
        new UpdateEntitiesCommand(
          originals.map((e) => mirrorEntity(e, first, second))
        )
      )
    } else {
      ctx.execute(
        new AddEntitiesCommand(
          originals.map((e) => mirrorEntityCopy(e, first, second))
        )
      )
    }
    ctx.dynamicInput.close()
    ctx.endCommand()
  }

  private snapshotSelection(ctx: ToolContext): readonly Entity[] {
    return ctx.selection
      .toArray()
      .map((id) => ctx.document.get(id))
      .filter((entity): entity is Entity => entity !== undefined)
  }

  /** Honours a coordinate typed for a mirror-line point, else uses the cursor. */
  private resolvePoint(
    rawPoint: Vec2,
    fieldId: string,
    ctx: ToolContext,
    relativeTo: Vec2 | null
  ): Vec2 {
    const text = ctx.dynamicInput.getText(fieldId).trim()
    if (isCoordinateExpression(text)) {
      const point = parseCoordinate(text, {
        lastPoint: relativeTo ?? ctx.lastPoint,
        relativeByDefault: relativeTo !== null,
        ucs: ctx.ucs,
        elevation: ctx.elevation,
      })
      if (point) return point
    }
    return rawPoint
  }
}

function pushGhost(
  out: ScenePrimitive[],
  viewport: ToolContext["viewport"],
  originals: readonly Entity[],
  a: Vec2,
  b: Vec2,
  blocks: ToolContext["blocks"]
): void {
  const ghost: StrokeStyle = { color: THEME.preview, width: 1, dash: [6, 4] }
  for (const entity of originals) {
    out.push(
      ...entityScenePrimitive(viewport, mirrorEntity(entity, a, b), ghost, {
        blocks,
      })
    )
  }
}

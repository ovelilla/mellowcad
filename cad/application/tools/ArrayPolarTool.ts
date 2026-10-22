import { Vec2 } from "../../geometry/Vec2"
import { Entity, entityBounds } from "../../domain/entities"
import {
  arrayItemCopy,
  isFullTurn,
  placeArrayItem,
  polarAngleBetween,
  polarArrayItems,
} from "../../domain/arrays"
import { parseNumber } from "../../domain/units"
import {
  isCoordinateExpression,
  parseCoordinate,
} from "../input/coordinateInput"
import { ScenePrimitive, StrokeStyle } from "../../scene/types"
import { entityScenePrimitive } from "../SceneBuilder"
import { THEME } from "../../scene/theme"
import { AddEntitiesCommand } from "../commands/entityCommands"
import { ObjectSelector } from "./objectSelection"
import { MAX_PREVIEW_ITEMS, refusesCount, takesCount } from "./arrayCounts"
import type { PromptId } from "../../locales/types"
import {
  CommandOption,
  CommandOptionOutcome,
  PointerInput,
  QuestionInput,
  Tool,
  ToolContext,
  ToolQuestion,
} from "./Tool"

/**
 * AutoCAD's ARRAYPOLAR, as its 2027 console asks it: `Select objects:` (or
 * ARRAY's set), `Type = Polar  Associative = No`, `Specify center point of
 * array:`, then `Select grip to edit array or [Items/Angle between/Fill
 * angle/ROTate items/eXit] <eXit>:` over a live preview — 6 items over 360°
 * at first. Items asks the count, Angle between the angle from one item to
 * the next, Fill angle the angle they span (+ counterclockwise, - clockwise),
 * ROTate items `Rotate arrayed items? [Yes/No] <Yes>:` (Yes turns each copy to
 * follow the ring, No only carries it round). A full 360° spaces the items by
 * fill / count; any other fill spans the first and last, fill / (count − 1),
 * and an angle between makes the fill that many steps, a full turn once they
 * reach 360°. The ring keeps its direction apart from its size, which the
 * defaults show. eXit or Enter makes the copies, one undo step with the source
 * as item 1. Escape makes none.
 *
 * WHY Associative = No: as ARRAYRECT's. Base point, Axis of rotation, ROWs and
 * Levels are not offered; ROWs is declared, so that `R` asks which.
 */

const DEFAULT_ITEMS = 6
const FULL_TURN = 360

/** The ring the prompts edit: the count and the angles, kept consistent. */
interface Ring {
  readonly items: number
  /** The angle spanned, in (0, 360]; 360 a full circle. */
  readonly fill: number
  /** Whether the ring runs clockwise, as a negative Fill angle makes it. */
  readonly clockwise: boolean
  /** Whether each copy turns to follow the ring (ROTate items). */
  readonly rotate: boolean
}

type Step = "main" | "items" | "between" | "fill" | "rotate"

interface PolarConfig {
  readonly originals: readonly Entity[]
  readonly center: Vec2
  /** Base point (selection centroid) carried around the ring when not rotating. */
  readonly basePoint: Vec2
}

type ArrayPolarState =
  /** No pre-selection: `Select objects:` builds the set. */
  | { readonly phase: "selecting" }
  /** Objects chosen; awaiting the center point of the array. */
  | { readonly phase: "center"; readonly originals: readonly Entity[] }
  /** Center placed; editing the ring with a live preview. */
  | {
      readonly phase: "edit"
      readonly config: PolarConfig
      readonly ring: Ring
      readonly step: Step
    }

const KEYWORD_STEP: Readonly<Record<string, Step>> = {
  Items: "items",
  "Angle between": "between",
  "Fill angle": "fill",
  "ROTate items": "rotate",
}

export class ArrayPolarTool implements Tool {
  readonly id = "arraypolar"

  private state: ArrayPolarState = { phase: "selecting" }
  private readonly selector = new ObjectSelector({
    takes: () => "wholeObjects",
    done: (ctx) => this.confirmSelection(ctx),
  })
  private lastScreen: Vec2 | null = null

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    this.selector.start()
    if (!this.selector.preselect(ctx)) {
      this.state = { phase: "selecting" }
    } else {
      this.enterCenter(ctx)
    }
  }

  /** Goes on from the set ARRAY selected, as from its own `Select objects:`. */
  takeSet(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    this.selector.start()
    this.enterCenter(ctx)
  }

  onDeactivate(ctx: ToolContext): void {
    this.state = { phase: "selecting" }
    this.selector.start()
    ctx.dynamicInput.close()
  }

  question(): PromptId | ToolQuestion {
    const state = this.state
    switch (state.phase) {
      case "center":
        return "specifyCenterPointOfArray"
      case "edit":
        break
      case "selecting":
        return this.selector.question()
    }
    const { ring } = state
    switch (state.step) {
      case "main":
        // ROWs before ROTate items: `R` asks `ROWs or ROTate?` (probe
        // arrays/p210).
        return {
          id: "selectGripToEditArrayOr",
          declared: [
            "Items",
            "Angle between",
            "Fill angle",
            "ROWs",
            "ROTate items",
            "eXit",
          ],
        }
      case "items":
        return { id: "enterNumberOfItemsInArray", enter: { count: ring.items } }
      // Unsigned and without trailing zeros, whichever way the ring runs
      // (probes arrays/p264, p275, p276).
      case "between":
        return {
          id: "specifyAngleBetweenItems",
          enter: { angle: polarAngleBetween(ring) },
          trimmed: true,
        }
      case "fill":
        return {
          id: "specifyTheAngleToFill",
          enter: { angle: ring.fill },
          trimmed: true,
        }
      case "rotate":
        return "rotateArrayedItems"
    }
  }

  /**
   * As AutoCAD's console refuses them: the centre and the grip's pick expect
   * a point or the keywords AutoCAD lists there, the count a positive whole
   * number, the angles two points or Expression (probes arrays/p205, p207,
   * p212, p214).
   */
  takes(): QuestionInput | null {
    const state = this.state
    if (state.phase === "center") return { refusal: "pointOrKeywordRequired" }
    if (state.phase !== "edit") return this.selector.takes()
    switch (state.step) {
      case "main":
        return "point"
      case "items":
        return { refusal: "requiresPositiveInteger" }
      case "between":
      case "fill":
        return {
          refusal: "requiresAngle",
          values: { points: "two", keyword: "yes" },
        }
      case "rotate":
        return "keyword"
    }
  }

  commandOptions(): readonly CommandOption[] {
    if (this.state.phase === "selecting") return this.selector.commandOptions()
    if (this.state.phase !== "edit") return []
    switch (this.state.step) {
      case "main":
        return [
          { id: "Items" },
          { id: "Angle between" },
          { id: "Fill angle" },
          { id: "ROTate items" },
          { id: "eXit" },
          // WHY offered and unhandled: its rows are not built, but its
          // letters must keep `R` ambiguous (p210).
          { id: "ROWs", hidden: true },
        ]
      case "rotate":
        return [{ id: "Yes" }, { id: "No" }]
      default:
        return []
    }
  }

  defaultOption(): string | null {
    if (this.state.phase !== "edit") return null
    switch (this.state.step) {
      case "main":
        return "eXit"
      case "rotate":
        return this.state.ring.rotate ? "Yes" : "No"
      default:
        return null
    }
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    if (this.state.phase === "selecting") {
      return this.selector.invokeOption(id, ctx) ? "continue" : "unhandled"
    }
    if (this.state.phase !== "edit") return "unhandled"
    if (this.state.step === "rotate") {
      if (id !== "Yes" && id !== "No") return "unhandled"
      this.state = {
        ...this.state,
        ring: { ...this.state.ring, rotate: id === "Yes" },
      }
      this.ask("main", ctx)
      return "continue"
    }
    if (this.state.step !== "main") return "unhandled"
    if (id === "eXit") {
      this.create(ctx)
      return "end"
    }
    const step = KEYWORD_STEP[id]
    if (step === undefined) return "unhandled"
    this.ask(step, ctx)
    return "continue"
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen

    switch (this.state.phase) {
      case "selecting":
        this.selector.onPointerMove(input, ctx)
        break
      case "center":
      case "edit":
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
      case "center":
        this.enterEdit(input.point, ctx)
        return
    }
  }

  answerTyped(text: string, ctx: ToolContext): boolean {
    if (this.state.phase === "selecting") {
      return this.selector.answerTyped(text, ctx)
    }
    // WHY taken and asked again: a point or a number there picks no grip,
    // and the console says nothing (probes arrays/p208, p209).
    return (
      this.state.phase === "edit" &&
      this.state.step === "main" &&
      (isCoordinateExpression(text) || parseNumber(text) !== null)
    )
  }

  onPointerUp(input: PointerInput, ctx: ToolContext): void {
    if (this.state.phase === "selecting") this.selector.onPointerUp(input, ctx)
  }

  cycleLasso(ctx: ToolContext): boolean {
    return this.selector.cycleLasso(ctx)
  }

  onEnter(ctx: ToolContext): boolean {
    if (this.state.phase === "selecting") return this.selector.onEnter(ctx)
    if (this.state.phase === "center") return this.refuseNoCenter(ctx)
    if (this.state.phase === "edit" && this.state.step === "main") {
      // <eXit>: the array is made and the command ends.
      this.create(ctx)
      ctx.endCommand()
      return true
    }
    if (this.state.phase === "edit" && this.state.step === "rotate") {
      this.ask("main", ctx) // <Yes> or <No>: the current answer stays
      return true
    }
    return false
  }

  wantsSnap(): boolean {
    // The center point benefits from object snap (e.g. an existing circle's
    // center); picking objects and typing parameters do not.
    return (
      this.state.phase === "center" ||
      (this.state.phase === "selecting" && this.selector.wantsSnap())
    )
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    const state = this.state
    if (state.phase === "selecting") return this.selector.buildOverlay(ctx)
    if (state.phase !== "edit") return []

    const ghost: StrokeStyle = { color: THEME.preview, width: 1, dash: [6, 4] }
    const ring = this.previewRing(ctx, state.ring, state.step)
    const out: ScenePrimitive[] = []
    const items = polarArrayItems(
      { ...state.config, ...ring },
      MAX_PREVIEW_ITEMS
    )
    for (const item of items) {
      for (const entity of state.config.originals) {
        out.push(
          ...entityScenePrimitive(
            ctx.viewport,
            placeArrayItem(entity, item),
            ghost,
            { blocks: ctx.blocks }
          )
        )
      }
    }
    pushCenterMarker(out, ctx.viewport.worldToScreen(state.config.center))
    return out
  }

  /** Goes on from the set `Select objects:` closed to the center point. */
  private confirmSelection(ctx: ToolContext): void {
    this.enterCenter(ctx)
    ctx.requestRender()
  }

  private enterCenter(ctx: ToolContext): void {
    const originals = ctx.selection
      .toArray()
      .map((id) => ctx.document.get(id))
      .filter((entity): entity is Entity => entity !== undefined)
    if (originals.length === 0) {
      this.state = { phase: "selecting" }
      this.selector.start()
      ctx.dynamicInput.close()
      return
    }
    this.state = { phase: "center", originals }
    ctx.report(ctx.text.message("arrayType", { type: "polar" }))
    ctx.dynamicInput.open({
      fields: [{ id: "center", prompt: "centerPoint", kind: "coordinate" }],
      commit: () => {},
      commitRaw: (commitCtx) => this.commitCenterCoordinate(commitCtx),
    })
    if (this.lastScreen) ctx.dynamicInput.setPosition(this.lastScreen)
  }

  private commitCenterCoordinate(ctx: ToolContext): boolean {
    if (this.state.phase !== "center") return false
    const text = ctx.dynamicInput.getText("center").trim()
    if (text === "") return this.refuseNoCenter(ctx)
    if (!isCoordinateExpression(text)) return false
    const center = parseCoordinate(text, {
      lastPoint: ctx.lastPoint,
      relativeByDefault: false,
      ucs: ctx.ucs,
      elevation: ctx.elevation,
    })
    if (!center) return false
    this.enterEdit(center, ctx)
    return true
  }

  /** Enter at the centre: refused, and the centre asked again (probe arrays/p206). */
  private refuseNoCenter(ctx: ToolContext): boolean {
    ctx.report(ctx.text.message("pointOrKeywordRequired"), "error")
    return true
  }

  private enterEdit(center: Vec2, ctx: ToolContext): void {
    if (this.state.phase !== "center") return
    const originals = this.state.originals
    this.state = {
      phase: "edit",
      config: {
        originals,
        center,
        basePoint: centroid(originals, ctx.blocks),
      },
      ring: {
        items: DEFAULT_ITEMS,
        fill: FULL_TURN,
        clockwise: false,
        rotate: true,
      },
      step: "main",
    }
    this.ask("main", ctx)
  }

  private ask(step: Step, ctx: ToolContext): void {
    if (this.state.phase !== "edit") return
    this.state = { ...this.state, step }
    if (step === "main" || step === "rotate") {
      // Keywords only, the focus left on the drawing.
      ctx.dynamicInput.open({ fields: [], commit: () => {} })
      ctx.requestRender()
      return
    }
    ctx.dynamicInput.open({
      fields: [
        {
          id: "value",
          prompt:
            step === "items"
              ? "items"
              : step === "fill"
                ? "fillAngle"
                : "angle",
          kind: step === "items" ? "number" : "angle",
        },
      ],
      commit: (values, commitCtx) => this.answer(values.value, commitCtx),
      commitRaw: (commitCtx) => {
        // Enter with nothing typed keeps the value the prompt offers.
        if (commitCtx.dynamicInput.hasTypedText()) return false
        this.ask("main", commitCtx)
        return true
      },
    })
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }

  private answer(value: number, ctx: ToolContext): void {
    if (this.state.phase !== "edit") return
    const { step, ring } = this.state
    if (step === "items" && refusesCount(value, ctx)) return
    // Angle between is positive, a fill's sign is its direction (probes
    // arrays/p214, p219).
    if (step === "between" && value <= 0) {
      ctx.report(ctx.text.message("positiveNonzero"), "error")
      return
    }
    if (step === "fill" && value === 0) {
      ctx.report(ctx.text.message("parameterCannotBeZero"), "error")
      return
    }
    this.state = { ...this.state, ring: withValue(ring, step, value) }
    this.ask("main", ctx)
  }

  /** The ring the preview shows: the value being typed already applied. */
  private previewRing(ctx: ToolContext, ring: Ring, step: Step): Ring {
    if (step === "main" || step === "rotate") return ring
    const typed = parseNumber(ctx.dynamicInput.getText("value").trim())
    if (typed === null || !Number.isFinite(typed)) return ring
    const taken =
      step === "items"
        ? takesCount(typed)
        : step === "between"
          ? typed > 0
          : typed !== 0
    return taken ? withValue(ring, step, typed) : ring
  }

  private create(ctx: ToolContext): void {
    const state = this.state
    if (state.phase !== "edit") return
    const copies = polarArrayItems({ ...state.config, ...state.ring }).flatMap(
      (item) =>
        state.config.originals.map((entity) => arrayItemCopy(entity, item))
    )
    if (copies.length > 0) ctx.execute(new AddEntitiesCommand(copies))
    ctx.dynamicInput.close()
  }
}

/**
 * The count keeps the fill; an angle between makes the fill that many steps
 * from the first item to the last, keeping the ring's direction, and a whole
 * turn once they reach it — the items then spaced around it, with no question
 * asked (probes arrays/p267–p271); a fill keeps the count, its sign the
 * direction (p274, p276, p277) and beyond a turn its remainder (p217: 400 is
 * 40).
 */
function withValue(ring: Ring, step: Step, value: number): Ring {
  switch (step) {
    case "items":
      return { ...ring, items: value }
    case "between": {
      const span = value * Math.max(ring.items - 1, 1)
      return { ...ring, fill: isFullTurn(span) ? FULL_TURN : span }
    }
    case "fill":
      return { ...ring, fill: withinTurn(value), clockwise: value < 0 }
    default:
      return ring
  }
}

/**
 * The size of a typed fill, in (0, 360]. WHY a whole number of turns is a
 * full one: 720 was never probed, and a fill of 0 is what the prompt refuses.
 */
function withinTurn(fill: number): number {
  const size = Math.abs(fill)
  if (size <= FULL_TURN) return size
  const rest = size % FULL_TURN
  return rest < 1e-9 ? FULL_TURN : rest
}

function pushCenterMarker(out: ScenePrimitive[], at: Vec2): void {
  const r = 6
  const stroke: StrokeStyle = { color: THEME.selected, width: 1 }
  out.push({
    kind: "segment",
    a: { x: at.x - r, y: at.y },
    b: { x: at.x + r, y: at.y },
    stroke,
  })
  out.push({
    kind: "segment",
    a: { x: at.x, y: at.y - r },
    b: { x: at.x, y: at.y + r },
    stroke,
  })
}

/** Centroid of the selection's combined bounding box. */
function centroid(
  originals: readonly Entity[],
  blocks: ToolContext["blocks"]
): Vec2 {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const entity of originals) {
    const b = entityBounds(entity, blocks)
    minX = Math.min(minX, b.min.x)
    minY = Math.min(minY, b.min.y)
    maxX = Math.max(maxX, b.max.x)
    maxY = Math.max(maxY, b.max.y)
  }
  return { x: (minX + maxX) / 2, y: (minY + maxY) / 2 }
}

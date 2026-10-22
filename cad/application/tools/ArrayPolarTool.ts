import { Vec2 } from "../../geometry/Vec2"
import { Entity, EntityId, entityBounds } from "../../domain/entities"
import {
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
import { ScenePrimitive } from "../../scene/types"
import { ObjectSelector } from "./objectSelection"
import { MAX_PREVIEW_ITEMS, refusesCount, takesCount } from "./arrayCounts"
import { drawn } from "./ghostLook"
import { ArrayAssociativity, makeArray, reportArrayType } from "./arrayObject"
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
 * ARRAY's set), `Type = Polar  Associative = Yes`, `Specify center point of
 * array:`, then `Select grip to edit array or [ASsociative/Items/Angle
 * between/Fill angle/ROTate items/eXit] <eXit>:` over a live preview — 6
 * items over 360° at first. ASsociative asks as ARRAYRECT's does. Items asks
 * the count, Angle between the angle from one item to
 * the next, Fill angle the angle they span (+ counterclockwise, - clockwise),
 * ROTate items `Rotate arrayed items? [Yes/No] <Yes>:` (Yes turns each copy to
 * follow the ring, No only carries it round). A full 360° spaces the items by
 * fill / count; any other fill spans the first and last, fill / (count − 1),
 * and an angle between makes the fill that many steps, a full turn once they
 * reach 360°. The ring keeps its direction apart from its size, which the
 * defaults show. eXit or Enter makes the array (`makeArray`), one undo step
 * with the source as item 1, the reference at the centre (probe arrays/p405);
 * so does Escape once the centre is given (**unverified**: d08c's polar run
 * was inconclusive), before it nothing. Base point, Axis of rotation, ROWs
 * and Levels are not offered; ROWs is declared, so that `R` asks which.
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

type Step = "main" | "associative" | "items" | "between" | "fill" | "rotate"

interface PolarConfig {
  readonly originals: readonly Entity[]
  readonly center: Vec2
  /**
   * The set's extents centre, carried round the ring when the items are not
   * turned: LIST's `Base point:` (probe arrays/p405).
   */
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

  constructor(
    private readonly mode: ArrayAssociativity = { associative: true }
  ) {}

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

  /** WHY the commit point: Escape keeps the array, as ARRAYRECT's (d08). */
  onDeactivate(ctx: ToolContext): void {
    this.create(ctx)
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
            "ASsociative",
            "Items",
            "Angle between",
            "Fill angle",
            "ROWs",
            "ROTate items",
            "eXit",
          ],
        }
      case "associative":
        return "createAssociativeArray"
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
      case "associative":
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
          { id: "ASsociative" },
          { id: "Items" },
          { id: "Angle between" },
          { id: "Fill angle" },
          { id: "ROTate items" },
          { id: "eXit" },
          // WHY offered and unhandled: its rows are not built, but its
          // letters must keep `R` ambiguous (p210).
          { id: "ROWs", hidden: true },
        ]
      case "associative":
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
      case "associative":
        return this.mode.associative ? "Yes" : "No"
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
    if (this.state.step === "associative") {
      if (id !== "Yes" && id !== "No") return "unhandled"
      this.mode.associative = id === "Yes"
      this.ask("main", ctx)
      return "continue"
    }
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
    if (id === "ASsociative") {
      this.ask("associative", ctx)
      return "continue"
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
    if (
      this.state.phase === "edit" &&
      (this.state.step === "rotate" || this.state.step === "associative")
    ) {
      this.ask("main", ctx) // <Yes> or <No>: the current answer stays
      return true
    }
    return false
  }

  /** The source is item 1 of the preview (ARRAYS-D5). */
  hiddenEntityIds(): readonly EntityId[] {
    return this.state.phase === "edit"
      ? this.state.config.originals.map((entity) => entity.id)
      : []
  }

  wantsSnap(): boolean {
    // The center point benefits from object snap (e.g. an existing circle's
    // center); picking objects and typing parameters do not.
    return (
      this.state.phase === "center" ||
      (this.state.phase === "selecting" && this.selector.wantsSnap())
    )
  }

  /**
   * The items as the drawing will draw them, nothing at the centre, and no
   * ghost while the centre is asked (desktop arrays/d02-1, d02-2).
   */
  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    const state = this.state
    if (state.phase === "selecting") return this.selector.buildOverlay(ctx)
    if (state.phase !== "edit") return []

    const ring = this.previewRing(ctx, state.ring, state.step)
    const { originals } = state.config
    return [
      ...originals.flatMap((entity) => drawn(ctx, entity, "plain")),
      ...polarArrayItems(
        { ...state.config, ...ring },
        MAX_PREVIEW_ITEMS
      ).flatMap((item) =>
        originals.flatMap((entity) =>
          drawn(ctx, placeArrayItem(entity, item), "plain")
        )
      ),
    ]
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
    reportArrayType(ctx, "polar", this.mode)
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
        center: { x: center.x, y: center.y },
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
    if (step === "main" || step === "associative" || step === "rotate") {
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
    if (step === "main" || step === "associative" || step === "rotate") {
      return ring
    }
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
    // Left first: the command's end deactivates the tool, which commits too.
    this.state = { phase: "selecting" }
    const { originals, center, basePoint } = state.config
    makeArray(
      ctx,
      originals,
      { kind: "polar", center, basePoint, ...state.ring },
      center,
      this.mode
    )
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

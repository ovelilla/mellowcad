import { Vec2 } from "../../geometry/Vec2"
import {
  Entity,
  copyEntity,
  entityBounds,
  rotateEntity,
  rotateEntityCopy,
  rotatePoint,
  translateEntity,
} from "../../domain/entities"
import { parseNumber } from "../../domain/units"
import {
  isCoordinateExpression,
  parseCoordinate,
} from "../input/coordinateInput"
import { ScenePrimitive, StrokeStyle } from "../../scene/types"
import { entityScenePrimitive } from "../SceneBuilder"
import { THEME } from "../../scene/theme"
import { AddEntitiesCommand } from "../commands/entityCommands"
import { ObjectSelector, countPreselection } from "./objectSelection"
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
 * AutoCAD's ARRAYPOLAR, as its 2023 console asks it: `Select objects:`, `Type
 * = Polar  Associative = No`, `Specify center point of array:`, then `Select
 * grip to edit array or [Items/Angle between/Fill angle/ROTate items/eXit]
 * <eXit>:` over a live preview — 6 items over 360° at first. Items asks the
 * count, Angle between the angle from one item to the next, Fill angle the
 * angle they span (+ counterclockwise, - clockwise), ROTate items `Rotate
 * arrayed items? [Yes/No] <Yes>:` (Yes turns each copy to follow the ring,
 * No only carries it round). A full 360° spaces the items by fill / count; any
 * other fill spans the first and last, fill / (count − 1), and an angle
 * between makes the fill that many steps. eXit or Enter makes the copies, one
 * undo step with the source as item 1. Escape makes none.
 *
 * WHY Associative = No: as ARRAYRECT's. Base point, Axis of rotation, ROWs and
 * Levels are not offered.
 */

const DEFAULT_ITEMS = 6
const DEFAULT_FILL = 360
const MAX_ITEMS = 1000

/** The ring the prompts edit: the count and the angles, kept consistent. */
interface Ring {
  readonly items: number
  /** The angle spanned, + counterclockwise; 360 a full circle. */
  readonly fill: number
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
    done: (ctx) => this.confirmSelection(ctx),
  })
  private lastScreen: Vec2 | null = null

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    if (ctx.selection.isEmpty()) {
      this.state = { phase: "selecting" }
      this.selector.start()
    } else {
      countPreselection(ctx)
      this.enterCenter(ctx)
    }
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
        return "selectGripToEditArrayOr"
      case "items":
        return { id: "enterNumberOfItemsInArray", enter: { count: ring.items } }
      case "between":
        return {
          id: "specifyAngleBetweenItems",
          enter: { angle: angleBetween(ring) },
        }
      case "fill":
        return { id: "specifyTheAngleToFill", enter: { angle: ring.fill } }
      case "rotate":
        return "rotateArrayedItems"
    }
  }

  /**
   * As AutoCAD 2023's console refuses them: the centre and the grip's pick
   * expect a point or the keywords AutoCAD lists there, the count a positive
   * whole number, the angles two points or Expression.
   */
  takes(): QuestionInput | null {
    const state = this.state
    if (state.phase === "center") return { refusal: "pointOrKeywordRequired" }
    if (state.phase !== "edit") return this.selector.takes("objects")
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

  onPointerUp(input: PointerInput, ctx: ToolContext): void {
    if (this.state.phase === "selecting") this.selector.onPointerUp(input, ctx)
  }

  onEnter(ctx: ToolContext): boolean {
    if (this.state.phase === "selecting") return this.selector.onEnter(ctx)
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
    for (const angle of itemAngles(ring)) {
      for (const entity of state.config.originals) {
        out.push(
          ...entityScenePrimitive(
            ctx.viewport,
            placeItem(entity, state.config, angle, ring.rotate),
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
    if (!isCoordinateExpression(text)) return false
    const center = parseCoordinate(text, {
      lastPoint: null,
      relativeByDefault: false,
      ucs: ctx.ucs,
      elevation: ctx.elevation,
    })
    if (!center) return false
    this.enterEdit(center, ctx)
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
      ring: { items: DEFAULT_ITEMS, fill: DEFAULT_FILL, rotate: true },
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
    if (step === "items") {
      if (value <= 0) {
        ctx.report(ctx.text.message("positiveNonzero"), "error")
        return
      }
      if (!Number.isInteger(value) || value > MAX_ITEMS) {
        ctx.report(ctx.text.message("requiresPositiveInteger"), "error")
        return
      }
    }
    this.state = { ...this.state, ring: withValue(ring, step, value) }
    this.ask("main", ctx)
  }

  /** The ring the preview shows: the value being typed already applied. */
  private previewRing(ctx: ToolContext, ring: Ring, step: Step): Ring {
    if (step === "main" || step === "rotate") return ring
    const typed = parseNumber(ctx.dynamicInput.getText("value").trim())
    if (typed === null || !Number.isFinite(typed)) return ring
    if (step === "items" && (!Number.isInteger(typed) || typed <= 0)) {
      return ring
    }
    return withValue(ring, step, Math.min(typed, MAX_ITEMS))
  }

  private create(ctx: ToolContext): void {
    const state = this.state
    if (state.phase !== "edit") return
    const copies = itemAngles(state.ring).flatMap((angle) =>
      state.config.originals.map((entity) =>
        placeItemCopy(entity, state.config, angle, state.ring.rotate)
      )
    )
    if (copies.length > 0) ctx.execute(new AddEntitiesCommand(copies))
    ctx.dynamicInput.close()
  }
}

/** Whether the fill is a whole turn, where the closing item would land on the first. */
function isFull(fill: number): boolean {
  return Math.abs(Math.abs(fill) - 360) < 1e-9
}

function angleBetween(ring: Ring): number {
  if (ring.items <= 1) return 0
  return isFull(ring.fill)
    ? ring.fill / ring.items
    : ring.fill / (ring.items - 1)
}

/**
 * The count keeps the fill; an angle between makes the fill that many steps
 * from the first item to the last; a fill keeps the count.
 */
function withValue(ring: Ring, step: Step, value: number): Ring {
  switch (step) {
    case "items":
      return { ...ring, items: value }
    case "between":
      return { ...ring, fill: value * Math.max(ring.items - 1, 1) }
    case "fill":
      return { ...ring, fill: value }
    default:
      return ring
  }
}

/** The angles of the copies, in degrees: every item but the source, item 1. */
function itemAngles(ring: Ring): number[] {
  const step = angleBetween(ring)
  const out: number[] = []
  for (let k = 1; k < ring.items; k++) out.push(k * step)
  return out
}

/** One array item, preserving id — used for the live ghost preview. */
function placeItem(
  entity: Entity,
  config: PolarConfig,
  angleDeg: number,
  rotate: boolean
): Entity {
  const rad = (angleDeg * Math.PI) / 180
  if (rotate) return rotateEntity(entity, config.center, rad)
  const moved = rotatePoint(config.basePoint, config.center, rad)
  return translateEntity(entity, {
    x: moved.x - config.basePoint.x,
    y: moved.y - config.basePoint.y,
  })
}

/** One array item as a fresh entity — used when committing the array. */
function placeItemCopy(
  entity: Entity,
  config: PolarConfig,
  angleDeg: number,
  rotate: boolean
): Entity {
  const rad = (angleDeg * Math.PI) / 180
  if (rotate) return rotateEntityCopy(entity, config.center, rad)
  const moved = rotatePoint(config.basePoint, config.center, rad)
  return copyEntity(entity, {
    x: moved.x - config.basePoint.x,
    y: moved.y - config.basePoint.y,
  })
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

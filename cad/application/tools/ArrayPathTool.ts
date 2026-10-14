import { Vec2, V } from "../../geometry/Vec2"
import { Vec3, vec3 } from "../../geometry/Vec3"
import { normalizeDegrees } from "../../geometry/primitives"
import {
  Entity,
  copyEntity,
  entityBounds,
  readsInPlan,
  rotateEntity,
  translateEntity,
} from "../../domain/entities"
import { parseNumber } from "../../domain/units"
import { ScenePrimitive, StrokeStyle } from "../../scene/types"
import { entityScenePrimitive } from "../SceneBuilder"
import { THEME } from "../../scene/theme"
import { ReplaceEntitiesCommand } from "../commands/entityCommands"
import {
  ONE_OBJECT_MODES,
  ObjectSelector,
  countPreselection,
} from "./objectSelection"
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
 * AutoCAD's ARRAYPATH, as its 2023 console asks it: `Select objects:`, `Type =
 * Path  Associative = No`, `Select path curve:` — a line, a circle or an arc —
 * then `Select grip to edit array or [Method/Items/Align items/eXit] <eXit>:`
 * over a live preview. Method asks `Enter path method [Divide/Measure]
 * <Measure>:`: Measure steps the items a distance apart from the path's start,
 * Divide spreads them evenly over it. Items asks, by Divide, `Enter number of
 * items along path`; by Measure, `Specify the distance between items along
 * path`, then says `Maximum items = 11` and asks `Specify number of items or
 * [Fill entire path]`. Align items asks `Align arrayed items to path?
 * [Yes/No] <Yes>:` (Yes turns each copy to follow the path's tangent). At
 * first the items are one and a half times the selection's size apart and
 * fill the path. As in AutoCAD the source objects are consumed into the array
 * (the first item sits at the path's start); the path is left in place. eXit
 * or Enter commits it as one undo step; Escape changes nothing.
 *
 * WHY Associative = No: as ARRAYRECT's. Base point, Tangent direction, Rows,
 * Levels and Z direction are not offered.
 */

const MAX_ITEMS = 1000

/** A curve the array runs along, parameterised by arc length. */
interface PathCurve {
  readonly length: number
  readonly closed: boolean
  /** Point and tangent direction (deg CCW from +X) at an arc-length distance. */
  at(distance: number): { point: Vec2; tangentDeg: number }
}

interface PathConfig {
  readonly originals: readonly Entity[]
  readonly pathEntity: Entity
  readonly path: PathCurve
  /** Base point (selection centroid) placed on the path at each item. */
  readonly basePoint: Vec2
}

/** What the prompts edit: kept together, as AutoCAD keeps the count across methods. */
interface Layout {
  readonly method: "divide" | "measure"
  readonly items: number
  /** Measure's distance between items. */
  readonly spacing: number
  readonly align: boolean
}

type Step = "main" | "method" | "count" | "spacing" | "measureCount" | "align"

type ArrayPathState =
  /** No pre-selection: `Select objects:` builds the set. */
  | { readonly phase: "selecting" }
  /** Objects chosen; awaiting the path curve. `hover` is the rollover candidate. */
  | { readonly phase: "pickPath"; readonly hover: Entity | null }
  /** Path chosen; editing the layout with a live preview. */
  | {
      readonly phase: "edit"
      readonly config: PathConfig
      readonly layout: Layout
      readonly step: Step
    }

export class ArrayPathTool implements Tool {
  readonly id = "arraypath"

  private state: ArrayPathState = { phase: "selecting" }
  private readonly selector = new ObjectSelector({
    done: (ctx) => this.confirmSelection(ctx),
  })
  /**
   * The selection modes typed at `Select path curve:` — Previous and AUto
   * too, as its refusal lists them. AutoCAD 2023's console takes the newest
   * curve found, and leaves out the objects being arrayed.
   */
  private readonly pathModes = new ObjectSelector({
    takes: () => "pathCurve",
    done: () => {},
    question: () => "selectPathCurve",
    modes: [...ONE_OBJECT_MODES, "Previous", "AUto"],
    accept: (ids, ctx) =>
      ids.filter((id) => {
        const entity = ctx.document.get(id)
        return entity !== undefined && !ctx.selection.has(id) && isPath(entity)
      }),
    one: {
      take: (entity, ctx) => this.enterEdit(entity, ctx),
      newest: true,
      // WHY LASTPOINT put back: a point typed on an object there leaves it
      // as it was (AutoCAD 2023's console, acc/bk45, bk46).
      pick: (point, ctx) => {
        ctx.setLastPoint(this.lastPointAtPath)
        this.pickCurve(point, ctx)
      },
    },
  })
  private lastScreen: Vec2 | null = null
  /** LASTPOINT as `Select path curve:` found it. */
  private lastPointAtPath: Vec3 = vec3(0, 0, 0)

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    if (ctx.selection.isEmpty()) {
      this.state = { phase: "selecting" }
      this.selector.start()
    } else {
      countPreselection(ctx)
      this.enterPickPath(ctx)
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
      case "pickPath":
        return this.pathModes.question()
      case "edit":
        break
      case "selecting":
        return this.selector.question()
    }
    const { layout } = state
    switch (state.step) {
      case "main":
        return "selectGripToEditArrayOr"
      case "method":
        return "enterPathMethod"
      case "count":
        return {
          id: "enterNumberOfItemsAlongPath",
          enter: { count: layout.items },
        }
      case "spacing":
        return {
          id: "specifyDistanceBetweenItemsAlongPath",
          enter: layout.spacing,
        }
      case "measureCount":
        return {
          id: "specifyNumberOfItemsOr",
          enter: {
            count: Math.min(
              layout.items,
              maxItems(state.config.path, layout.spacing)
            ),
          },
        }
      case "align":
        return "alignArrayedItemsToPath"
    }
  }

  /** As AutoCAD 2023's console refuses them. */
  takes(): QuestionInput | null {
    const state = this.state
    if (state.phase === "pickPath") return this.pathModes.takes()
    if (state.phase !== "edit") return this.selector.takes()
    switch (state.step) {
      case "main":
        return "point"
      case "count":
      case "measureCount":
        return { refusal: "requiresPositiveInteger" }
      case "spacing":
        return {
          refusal: "requiresDistance",
          values: { points: "two", keyword: "yes" },
        }
      case "method":
      case "align":
        return "keyword"
    }
  }

  commandOptions(): readonly CommandOption[] {
    if (this.state.phase === "selecting") return this.selector.commandOptions()
    if (this.state.phase === "pickPath") return this.pathModes.commandOptions()
    if (this.state.phase !== "edit") return []
    switch (this.state.step) {
      case "main":
        return [
          { id: "Method" },
          { id: "Items" },
          { id: "Align items" },
          { id: "eXit" },
        ]
      case "method":
        return [{ id: "Divide" }, { id: "Measure" }]
      case "measureCount":
        return [{ id: "Fill entire path" }]
      case "align":
        return [{ id: "Yes" }, { id: "No" }]
      default:
        return []
    }
  }

  defaultOption(): string | null {
    if (this.state.phase !== "edit") return null
    const { layout } = this.state
    switch (this.state.step) {
      case "main":
        return "eXit"
      case "method":
        return layout.method === "divide" ? "Divide" : "Measure"
      case "align":
        return layout.align ? "Yes" : "No"
      default:
        return null
    }
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    if (this.state.phase === "selecting") {
      return this.selector.invokeOption(id, ctx) ? "continue" : "unhandled"
    }
    if (this.state.phase === "pickPath") {
      return this.pathModes.invokeOption(id, ctx) ? "continue" : "unhandled"
    }
    const state = this.state
    if (state.phase !== "edit") return "unhandled"
    const { layout, config } = state
    switch (state.step) {
      case "main":
        if (id === "eXit") {
          this.create(ctx)
          return "end"
        }
        if (id === "Method") this.ask("method", ctx)
        else if (id === "Items") {
          this.ask(layout.method === "divide" ? "count" : "spacing", ctx)
        } else if (id === "Align items") this.ask("align", ctx)
        else return "unhandled"
        return "continue"
      case "method": {
        if (id !== "Divide" && id !== "Measure") return "unhandled"
        const method = id === "Divide" ? "divide" : "measure"
        // Measure goes on from the spacing Divide had, as AutoCAD's does.
        const spacing =
          method === "measure" && layout.method === "divide"
            ? divideStep(config.path, layout.items)
            : layout.spacing
        this.state = { ...state, layout: { ...layout, method, spacing } }
        this.ask("main", ctx)
        return "continue"
      }
      case "measureCount":
        if (id !== "Fill entire path") return "unhandled"
        this.state = {
          ...state,
          layout: { ...layout, items: maxItems(config.path, layout.spacing) },
        }
        this.ask("main", ctx)
        return "continue"
      case "align":
        if (id !== "Yes" && id !== "No") return "unhandled"
        this.state = { ...state, layout: { ...layout, align: id === "Yes" } }
        this.ask("main", ctx)
        return "continue"
      default:
        return "unhandled"
    }
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen

    switch (this.state.phase) {
      case "selecting":
        this.selector.onPointerMove(input, ctx)
        break
      case "pickPath": {
        if (this.pathModes.inMode()) {
          this.pathModes.onPointerMove(input, ctx)
          break
        }
        // AutoCAD's rollover highlight: preview the curve under the cursor so
        // it is clear what clicking will pick as the path.
        const hover = this.pickPath(input, ctx)
        if (hover?.id !== this.state.hover?.id) {
          this.state = { phase: "pickPath", hover }
        }
        break
      }
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
      case "pickPath": {
        if (this.pathModes.inMode()) {
          this.pathModes.onPointerDown(input, ctx)
          return
        }
        this.pickCurve(input.world, ctx)
        return
      }
    }
  }

  /**
   * The pick at `Select path curve:`, clicked or typed (AutoCAD 2023's
   * console takes a typed point as one, acc/bk19, bk21): an arrayed object is
   * refused, and on nothing a window starts, as the AUto its refusal lists
   * makes it (bk20, bk48).
   */
  private pickCurve(world: Vec2, ctx: ToolContext): void {
    const under = ctx.pick(world)
    if (!under) {
      this.pathModes.startWindow({ x: world.x, y: world.y }, ctx)
      return
    }
    if (!isPath(under)) return
    if (ctx.selection.has(under.id)) {
      ctx.report(ctx.text.message("pathCurveIsArrayed"))
      ctx.report(ctx.text.message("filteredOut", { count: 1 }))
      return
    }
    this.enterEdit(under, ctx)
  }

  /**
   * The curve a click would take as the path: one in the UCS's XY plane, where
   * the array is laid out (a path at an angle to it is not offered).
   */
  private pickPath(input: PointerInput, ctx: ToolContext): Entity | null {
    const hit = ctx.pick(input.world)
    return hit && isPath(hit) ? hit : null
  }

  answerTyped(text: string, ctx: ToolContext): boolean {
    switch (this.state.phase) {
      case "selecting":
        return this.selector.answerTyped(text, ctx)
      case "pickPath":
        return this.pathModes.answerTyped(text, ctx)
      default:
        return false
    }
  }

  onPointerUp(input: PointerInput, ctx: ToolContext): void {
    if (this.state.phase === "selecting") this.selector.onPointerUp(input, ctx)
    if (this.state.phase === "pickPath") this.pathModes.onPointerUp(input, ctx)
  }

  onEnter(ctx: ToolContext): boolean {
    const state = this.state
    if (state.phase === "selecting") return this.selector.onEnter(ctx)
    if (state.phase === "pickPath") {
      return this.pathModes.inMode() && this.pathModes.onEnter(ctx)
    }
    if (state.phase !== "edit") return false
    switch (state.step) {
      case "main":
        // <eXit>: the array is made and the command ends.
        this.create(ctx)
        ctx.endCommand()
        return true
      case "method":
      case "align":
        this.ask("main", ctx) // the current answer stays
        return true
      default:
        return false
    }
  }

  wantsSnap(): boolean {
    if (this.state.phase === "pickPath") return this.pathModes.wantsSnap()
    return this.state.phase === "selecting" && this.selector.wantsSnap()
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    const { viewport } = ctx
    const state = this.state

    if (state.phase === "selecting") return this.selector.buildOverlay(ctx)

    // Rollover-highlight the curve under the cursor while choosing the path,
    // in the same amber it takes once picked so the candidate is unmistakable.
    if (state.phase === "pickPath") {
      if (this.pathModes.inMode()) return this.pathModes.buildOverlay(ctx)
      const out: ScenePrimitive[] = []
      if (state.hover) {
        pushEntityOutline(out, viewport, state.hover, {
          color: THEME.selected,
          width: 2.5,
        })
      }
      return out
    }

    if (state.phase !== "edit") return []

    const { config } = state
    const out: ScenePrimitive[] = []
    pushEntityOutline(out, viewport, config.pathEntity, {
      color: THEME.selected,
      width: 2,
    })

    const layout = this.previewLayout(ctx, state.layout, state.step)
    const placements = placementsOf(config.path, layout)
    const ghost: StrokeStyle = { color: THEME.preview, width: 1, dash: [6, 4] }
    const t0 = placements.length > 0 ? placements[0].tangentDeg : 0
    for (const pl of placements) {
      const dth = layout.align ? pl.tangentDeg - t0 : 0
      for (const entity of config.originals) {
        pushEntityOutline(
          out,
          viewport,
          itemEntity(entity, config.basePoint, dth, pl.point),
          ghost,
          ctx.blocks
        )
      }
    }
    return out
  }

  /** Goes on from the set `Select objects:` closed to the path curve. */
  private confirmSelection(ctx: ToolContext): void {
    this.enterPickPath(ctx)
    ctx.requestRender()
  }

  private enterPickPath(ctx: ToolContext): void {
    this.state = { phase: "pickPath", hover: null }
    this.pathModes.start()
    this.lastPointAtPath = ctx.lastPoint
    ctx.report(ctx.text.message("arrayType", { type: "path" }))
    ctx.dynamicInput.open({ fields: [], commit: () => {} })
  }

  private enterEdit(pathEntity: Entity, ctx: ToolContext): void {
    const path = makePath(pathEntity)
    if (!path) return
    const originals = ctx.selection
      .toArray()
      .map((id) => ctx.document.get(id))
      .filter((entity): entity is Entity => entity !== undefined)
    if (originals.length === 0) return

    const spacing = defaultSpacing(originals, ctx.blocks)
    this.state = {
      phase: "edit",
      config: {
        originals,
        pathEntity,
        path,
        basePoint: centroid(originals, ctx.blocks),
      },
      layout: {
        method: "measure",
        items: maxItems(path, spacing),
        spacing,
        align: true,
      },
      step: "main",
    }
    this.ask("main", ctx)
  }

  private ask(step: Step, ctx: ToolContext): void {
    const state = this.state
    if (state.phase !== "edit") return
    this.state = { ...state, step }
    if (step === "main" || step === "method" || step === "align") {
      // Keywords only, the focus left on the drawing.
      ctx.dynamicInput.open({ fields: [], commit: () => {} })
      ctx.requestRender()
      return
    }
    if (step === "measureCount") {
      ctx.report(
        ctx.text.message("maximumItems", {
          count: maxItems(state.config.path, state.layout.spacing),
        })
      )
    }
    const distance = step === "spacing"
    ctx.dynamicInput.open({
      fields: [
        {
          id: "value",
          prompt: distance ? "spacing" : "items",
          kind: distance ? "distance" : "number",
        },
      ],
      commit: (values, commitCtx) => this.answer(values.value, commitCtx),
      commitRaw: (commitCtx) => {
        // Enter with nothing typed keeps the value the prompt offers.
        if (commitCtx.dynamicInput.hasTypedText()) return false
        this.answer(null, commitCtx)
        return true
      },
    })
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }

  /** The value typed for the step asked (null: Enter, the offered one). */
  private answer(value: number | null, ctx: ToolContext): void {
    const state = this.state
    if (state.phase !== "edit") return
    const { step, layout, config } = state
    if (value !== null && step !== "spacing") {
      if (value <= 0) {
        ctx.report(ctx.text.message("positiveNonzero"), "error")
        return
      }
      if (!Number.isInteger(value) || value > MAX_ITEMS) {
        ctx.report(ctx.text.message("requiresPositiveInteger"), "error")
        return
      }
    }
    if (value !== null && step === "spacing" && value <= 0) {
      ctx.report(ctx.text.message("positiveNonzero"), "error")
      return
    }
    switch (step) {
      case "count":
        if (value !== null) this.setLayout({ ...layout, items: value })
        this.ask("main", ctx)
        return
      case "spacing":
        if (value !== null) this.setLayout({ ...layout, spacing: value })
        this.ask("measureCount", ctx)
        return
      case "measureCount": {
        const items = Math.min(
          value ?? layout.items,
          maxItems(config.path, layout.spacing)
        )
        this.setLayout({ ...layout, items })
        this.ask("main", ctx)
        return
      }
    }
  }

  private setLayout(layout: Layout): void {
    if (this.state.phase === "edit") this.state = { ...this.state, layout }
  }

  /** The layout the preview shows: the value being typed already applied. */
  private previewLayout(ctx: ToolContext, layout: Layout, step: Step): Layout {
    if (step !== "count" && step !== "spacing" && step !== "measureCount") {
      return layout
    }
    const typed = parseNumber(ctx.dynamicInput.getText("value").trim())
    if (typed === null || !Number.isFinite(typed) || typed <= 0) return layout
    if (step === "spacing") return { ...layout, spacing: typed }
    if (!Number.isInteger(typed)) return layout
    return { ...layout, items: Math.min(typed, MAX_ITEMS) }
  }

  private create(ctx: ToolContext): void {
    const state = this.state
    if (state.phase !== "edit") return
    const { config, layout } = state
    const placements = placementsOf(config.path, layout)
    const items: Entity[] = []
    const t0 = placements.length > 0 ? placements[0].tangentDeg : 0
    for (const pl of placements) {
      const dth = layout.align ? pl.tangentDeg - t0 : 0
      for (const entity of config.originals) {
        items.push(itemCopy(entity, config.basePoint, dth, pl.point))
      }
    }
    if (items.length > 0) {
      ctx.execute(
        new ReplaceEntitiesCommand(
          config.originals.map((entity) => entity.id),
          items
        )
      )
    }
    ctx.dynamicInput.close()
  }
}

/** How many items fit `spacing` apart on the path (AutoCAD's `Maximum items`). */
function maxItems(path: PathCurve, spacing: number): number {
  if (!(spacing > 0)) return 1
  const fit = Math.floor((path.length + 1e-6) / spacing)
  return Math.max(1, Math.min(MAX_ITEMS, path.closed ? fit : fit + 1))
}

/** Divide's step: the path shared evenly, its ends both items when open. */
function divideStep(path: PathCurve, items: number): number {
  if (items <= 1) return path.length
  return path.closed ? path.length / items : path.length / (items - 1)
}

/** Arc-length positions (and tangents) of every item. */
function placementsOf(
  path: PathCurve,
  layout: Layout
): { point: Vec2; tangentDeg: number }[] {
  const step =
    layout.method === "divide" ? divideStep(path, layout.items) : layout.spacing
  const count =
    layout.method === "divide"
      ? layout.items
      : Math.min(layout.items, maxItems(path, layout.spacing))
  const out: { point: Vec2; tangentDeg: number }[] = []
  for (let k = 0; k < count; k++) {
    out.push(path.at(Math.min(k * step, path.length)))
  }
  return out
}

/**
 * The items one and a half times the selection's size apart, as AutoCAD's
 * Measure starts (a circle 4 across: 6); 1 for a selection of no size.
 */
function defaultSpacing(
  originals: readonly Entity[],
  blocks: ToolContext["blocks"]
): number {
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
  const size = Math.max(maxX - minX, maxY - minY)
  return size > 1e-6 ? size * 1.5 : 1
}

/** Draws an entity with the given stroke. */
function pushEntityOutline(
  out: ScenePrimitive[],
  viewport: ToolContext["viewport"],
  entity: Entity,
  stroke: StrokeStyle,
  blocks?: ToolContext["blocks"]
): void {
  out.push(...entityScenePrimitive(viewport, entity, stroke, { blocks }))
}

/** Builds a path curve from a line (open) or circle (closed). */
/** A curve in the UCS's XY plane, where the array is laid out. */
function isPath(entity: Entity): boolean {
  return readsInPlan(entity) && makePath(entity) !== null
}

function makePath(entity: Entity): PathCurve | null {
  if (entity.type === "line") {
    const dir = V.sub(entity.end, entity.start)
    const length = V.length(dir)
    if (length < 1e-9) return null
    const tangentDeg = angleOf(dir)
    return {
      length,
      closed: false,
      at: (distance) => {
        const t = length > 0 ? distance / length : 0
        return { point: V.add(entity.start, V.scale(dir, t)), tangentDeg }
      },
    }
  }
  if (entity.type === "circle") {
    const length = 2 * Math.PI * entity.radius
    if (length < 1e-9) return null
    return {
      length,
      closed: true,
      at: (distance) => {
        const theta = (distance / length) * 2 * Math.PI
        return {
          point: {
            x: entity.center.x + entity.radius * Math.cos(theta),
            y: entity.center.y + entity.radius * Math.sin(theta),
          },
          // Tangent of a counter-clockwise circle leads the radius by 90°.
          tangentDeg: normalizeDegrees((theta * 180) / Math.PI + 90),
        }
      },
    }
  }
  if (entity.type === "arc") {
    const twoPi = Math.PI * 2
    let sweep = (entity.endAngle - entity.startAngle) % twoPi
    if (sweep <= 1e-9) sweep += twoPi
    const length = entity.radius * sweep
    if (length < 1e-9) return null
    return {
      length,
      closed: false,
      at: (distance) => {
        const t = length > 0 ? distance / length : 0
        const theta = entity.startAngle + t * sweep
        return {
          point: {
            x: entity.center.x + entity.radius * Math.cos(theta),
            y: entity.center.y + entity.radius * Math.sin(theta),
          },
          // Tangent of a counter-clockwise arc leads the radius by 90°.
          tangentDeg: normalizeDegrees((theta * 180) / Math.PI + 90),
        }
      },
    }
  }
  return null
}

/** One array item, preserving id — used for the live ghost preview. */
function itemEntity(
  entity: Entity,
  basePoint: Vec2,
  dthDeg: number,
  point: Vec2
): Entity {
  const rotated = rotateEntity(entity, basePoint, (dthDeg * Math.PI) / 180)
  return translateEntity(rotated, {
    x: point.x - basePoint.x,
    y: point.y - basePoint.y,
  })
}

/** One array item as a fresh entity — used when committing the array. */
function itemCopy(
  entity: Entity,
  basePoint: Vec2,
  dthDeg: number,
  point: Vec2
): Entity {
  return copyEntity(itemEntity(entity, basePoint, dthDeg, point), {
    x: 0,
    y: 0,
  })
}

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

function angleOf(dir: Vec2): number {
  return normalizeDegrees((Math.atan2(dir.y, dir.x) * 180) / Math.PI)
}

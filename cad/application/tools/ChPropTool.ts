import { Vec2 } from "../../geometry/Vec2"
import {
  Entity,
  EntityId,
  assignEntityColor,
  assignEntityLayer,
  assignEntityLinetype,
  assignEntityLineweight,
  entityThickness,
  hasThickness,
  withThickness,
} from "../../domain/entities"
import { COLOR_BYLAYER, EntityColor } from "../../domain/colors"
import { INVALID_LAYER_NAME_CHARACTERS, LayerId } from "../../domain/layers"
import { LINETYPE_BYLAYER, LINETYPES, LinetypeId } from "../../domain/linetypes"
import { LINEWEIGHT_BYLAYER, Lineweight } from "../../domain/lineweights"
import type { PromptId } from "../../locales/types"
import type { ScenePrimitive } from "../../scene/types"
import type { MessageId } from "../EngineText"
import { UpdateEntitiesCommand } from "../commands/entityCommands"
import {
  COLOR_OPTIONS,
  colorDefault,
  colorOfOption,
  readColor,
  readTrueColor,
} from "./ColorTool"
import {
  lineweightListing,
  lineweightWord,
  readLineweight,
} from "./LweightTool"
import { newestFirst } from "./listReport"
import { AddedBy } from "./objectSelection"
import { SelectionActionTool } from "./SelectionActionTool"
import {
  CommandOption,
  CommandOptionOutcome,
  PointerInput,
  QuestionInput,
  ToolContext,
  ToolQuestion,
} from "./Tool"
import { askValueOrWord } from "./valueWordPrompt"

type Phase =
  | "property"
  | "color"
  | "trueColor"
  | "layer"
  | "linetype"
  | "lineweight"
  | "lineweightAgain"
  | "thickness"

/** What a run has set so far, applied to the set only as it ends. */
interface Changes {
  color?: EntityColor | typeof COLOR_BYLAYER
  layerId?: LayerId
  linetype?: LinetypeId | typeof LINETYPE_BYLAYER
  lineweight?: Lineweight | typeof LINEWEIGHT_BYLAYER
  thickness?: number
}

const VARIES = Symbol("varies")

/**
 * `Enter property to change [Color/LAyer/LType/LWeight/Thickness]:`. WHY not
 * ltScale, TRansparency, Material and Annotative, which AutoCAD lists (table
 * 20403): no object here has a linetype scale, a transparency, a material or
 * annotative scales of its own.
 */
const PROPERTIES: readonly CommandOption[] = [
  { id: "Color" },
  { id: "LAyer" },
  { id: "LType" },
  { id: "LWeight" },
  { id: "Thickness" },
]

/** The table's `ByLayer`, a linetype's name in every language (properties/p224). */
const BY_LAYER = "BYLAYER"

/**
 * AutoCAD's CHPROP: `Select objects:`, then `Enter property to change`, asked
 * again after each property until Enter. Each property's prompt offers the
 * set's value, `varies` where the objects differ, or the value this run gave
 * it (probes chprop/p01, p02, p11e); Enter there keeps each object's own. What
 * the run set is applied as it ends, one undo step U names `CHPROP`, and
 * Escape leaves the objects as they were (p16, p21: `(command)` cancels it
 * and the objects never changed).
 *
 * Color, Linetype and Lineweight take what -COLOR, -LINETYPE and -LWEIGHT
 * take; a layer or a linetype is found by its name in any case. A layer it
 * does not find says so and asks again, a linetype goes back to the property
 * prompt (p06, p20). Thickness is set on the objects that have one, and each
 * other type is named once as the command ends, in the set's order (p11,
 * p11d, p11e). Objects on a locked layer are said, counted and left out
 * (p13, p13b).
 */
export class ChPropTool extends SelectionActionTool {
  readonly id = "chprop"

  private phase: Phase | null = null
  /** The set's objects in the order they joined it, as the messages follow it. */
  private order: EntityId[] = []
  private set: EntityId[] = []
  private changes: Changes = {}
  private lastScreen: Vec2 | null = null

  onActivate(ctx: ToolContext): void {
    this.reset()
    super.onActivate(ctx)
  }

  onDeactivate(ctx: ToolContext): void {
    this.reset()
    super.onDeactivate(ctx)
  }

  private reset(): void {
    this.phase = null
    this.order = []
    this.set = []
    this.changes = {}
  }

  // Its refusal lists the modes of a set of whole objects, ending at SIngle
  // (p17's trace).
  protected selectionInput(): QuestionInput {
    return "wholeObjects"
  }

  protected lockedFirst(): MessageId {
    return "objectOnLockedLayer"
  }

  protected selectionAdded(ids: readonly EntityId[], added: AddedBy): void {
    this.order.push(...(added.by === "pick" ? ids : [...ids].reverse()))
  }

  protected run(entities: readonly Entity[], ctx: ToolContext): boolean {
    // A preselection newest first, then the picks as picked (p11e), as LIST.
    const ids = new Set(entities.map((entity) => entity.id))
    const joined = [...new Set(this.order)].filter((id) => ids.has(id))
    this.set = [
      ...newestFirst(
        [...ids].filter((id) => !joined.includes(id)),
        ctx
      ),
      ...joined,
    ]
    this.askProperty(ctx)
    return true
  }

  question(): PromptId | ToolQuestion {
    switch (this.phase) {
      case null:
        return super.question()
      case "property":
        return "propertyToChange"
      case "color":
        return { id: "newColor", enter: { name: this.colorShown } }
      case "trueColor":
        return "trueColor"
      case "layer":
        return {
          id: "newLayerName",
          enter: { name: this.layerShown },
          takesSpaces: true,
        }
      case "linetype":
        return {
          id: "newLinetypeName",
          enter: { name: this.linetypeShown },
          takesSpaces: true,
        }
      case "lineweight":
        return { id: "newLineweight", enter: { name: this.lineweightShown } }
      case "lineweightAgain":
        return "defaultLineweight"
      case "thickness":
        return { id: "newThickness", enter: this.thicknessShown }
    }
  }

  takes(): QuestionInput | null {
    switch (this.phase) {
      case null:
        return super.takes()
      case "color":
        return { refusal: "colorRequired" }
      case "lineweight":
      case "lineweightAgain":
        return { refusal: "lineweightRequired" }
      default:
        return null
    }
  }

  commandOptions(): readonly CommandOption[] {
    switch (this.phase) {
      case null:
        return super.commandOptions()
      case "property":
        return PROPERTIES
      case "color":
        return COLOR_OPTIONS
      // `?` lists them at the first, unlisted there (p09).
      case "lineweight":
        return [{ id: "?", hidden: true }]
      case "lineweightAgain":
        return [{ id: "?" }]
      default:
        return []
    }
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    switch (this.phase) {
      case null:
        return super.invokeOption(id, ctx)
      case "property":
        return this.askFor(id, ctx)
      case "color": {
        if (id === "Truecolor") {
          this.askTrueColor(ctx)
          return "continue"
        }
        const color = colorOfOption(id)
        if (color === null) return "unhandled"
        this.changes.color = color
        this.askProperty(ctx)
        return "continue"
      }
      case "lineweight":
      case "lineweightAgain":
        if (id !== "?") return "unhandled"
        this.listLineweights(ctx)
        return "continue"
      default:
        return "unhandled"
    }
  }

  onEnter(ctx: ToolContext): boolean {
    if (this.phase === null) return super.onEnter(ctx)
    if (this.phase !== "property") return false
    this.apply(ctx)
    ctx.endCommand()
    return true
  }

  answerTyped(text: string, ctx: ToolContext): boolean {
    return this.phase === null && super.answerTyped(text, ctx)
  }

  wantsSnap(): boolean {
    return this.phase === null && super.wantsSnap()
  }

  cycleLasso(ctx: ToolContext): boolean {
    return this.phase === null && super.cycleLasso(ctx)
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (this.phase === null) super.onPointerDown(input, ctx)
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen
    if (this.phase === null) super.onPointerMove(input, ctx)
    else ctx.dynamicInput.setPosition(input.screen)
  }

  onPointerUp(input: PointerInput, ctx: ToolContext): void {
    if (this.phase === null) super.onPointerUp(input, ctx)
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    return this.phase === null ? super.buildOverlay(ctx) : []
  }

  private askFor(id: string, ctx: ToolContext): CommandOptionOutcome {
    switch (id) {
      case "Color":
        this.askColor(ctx)
        break
      case "LAyer":
        this.askName("layer", ctx)
        break
      case "LType":
        this.askName("linetype", ctx)
        break
      case "LWeight":
        this.askLineweight("lineweight", ctx)
        break
      case "Thickness":
        this.askThickness(ctx)
        break
      default:
        return "unhandled"
    }
    return "continue"
  }

  /** The property prompt, keywords alone; Enter applies what was set. */
  private askProperty(ctx: ToolContext): void {
    this.phase = "property"
    ctx.dynamicInput.open({ fields: [], commit: () => {} })
    this.place(ctx)
  }

  private askColor(ctx: ToolContext): void {
    this.phase = "color"
    askValueOrWord(
      ctx,
      {
        field: "color",
        prompt: "newColor",
        shown: this.shownColor(ctx),
        at: this.lastScreen,
      },
      (typed, answerCtx) => {
        if (typed === "") return this.askProperty(answerCtx)
        const color = readColor(typed, answerCtx)
        if (color === null) return this.askColor(answerCtx)
        this.changes.color = color
        this.askProperty(answerCtx)
      }
    )
  }

  // An invalid true colour, Enter too, is said and asked again (p05).
  private askTrueColor(ctx: ToolContext): void {
    this.phase = "trueColor"
    ctx.dynamicInput.open({
      fields: [{ id: "rgb", prompt: "trueColor", kind: "text" }],
      commit: () => {},
      commitRaw: (commitCtx) => {
        const color = readTrueColor(commitCtx)
        if (color === null) {
          this.askTrueColor(commitCtx)
          return true
        }
        this.changes.color = color
        this.askProperty(commitCtx)
        return true
      },
    })
    this.place(ctx)
  }

  private askName(phase: "layer" | "linetype", ctx: ToolContext): void {
    this.phase = phase
    if (phase === "layer") this.layerShown = this.shownLayer(ctx)
    else this.linetypeShown = this.shownLinetype(ctx)
    ctx.dynamicInput.open({
      fields: [
        {
          id: "name",
          prompt: phase === "layer" ? "newLayerName" : "newLinetypeName",
          kind: "text",
        },
      ],
      commit: () => {},
      commitRaw: (commitCtx) => {
        const typed = commitCtx.dynamicInput.getText("name").trim()
        if (phase === "layer") this.answerLayer(typed, commitCtx)
        else this.answerLinetype(typed, commitCtx)
        return true
      },
    })
    this.place(ctx)
  }

  /**
   * A layer by its name in any case (`l1` is L1, p06); a name AutoCAD could
   * not give a layer says `Invalid layer name.`, any other one it does not
   * find `Cannot find layer "FOO".`, and the prompt is asked again.
   */
  private answerLayer(typed: string, ctx: ToolContext): void {
    if (typed === "") return this.askProperty(ctx)
    const key = typed.toUpperCase()
    const layer = ctx.document
      .getLayers()
      .find((entry) => entry.name.toUpperCase() === key)
    if (layer) {
      this.changes.layerId = layer.id
      return this.askProperty(ctx)
    }
    ctx.report(
      ctx.text.message(
        invalidName(typed) ? "invalidLayerName" : "layerNotFound",
        { name: typed }
      ),
      "error"
    )
    this.askName("layer", ctx)
  }

  /**
   * A loaded linetype by its name in any case, or ByLayer: the keyword or the
   * table's name whole (p07, p07s). A name AutoCAD could not give one says
   * `Invalid linetype name.` and asks again; any other it does not have, that
   * it is not loaded, and the property prompt follows (p20).
   */
  private answerLinetype(typed: string, ctx: ToolContext): void {
    if (typed === "") return this.askProperty(ctx)
    if (invalidName(typed)) {
      ctx.report(ctx.text.message("invalidLinetypeName"), "error")
      return this.askName("linetype", ctx)
    }
    const byLayer =
      typed.toUpperCase() === BY_LAYER ||
      ctx.text.resolveKeyword(typed, [BY_LAYER]) === BY_LAYER
    const linetype = byLayer
      ? LINETYPE_BYLAYER
      : LINETYPES.find(
          (entry) => entry.id.toUpperCase() === typed.toUpperCase()
        )?.id
    if (linetype === undefined) {
      ctx.report(ctx.text.message("linetypeNotLoaded", { name: typed }))
    } else {
      this.changes.linetype = linetype
    }
    this.askProperty(ctx)
  }

  /**
   * `Enter new lineweight <ByLayer>:`, or after `?` -LWEIGHT's own prompt, no
   * default offered, as AutoCAD asks it there (p09).
   */
  private askLineweight(
    phase: "lineweight" | "lineweightAgain",
    ctx: ToolContext
  ): void {
    this.phase = phase
    askValueOrWord(
      ctx,
      {
        field: "lineweight",
        prompt: phase === "lineweight" ? "newLineweight" : "defaultLineweight",
        shown: this.shownLineweight(ctx),
        at: this.lastScreen,
      },
      (typed, answerCtx) => {
        if (typed === "") return this.askProperty(answerCtx)
        if (typed === "?") return this.listLineweights(answerCtx)
        const lineweight = readLineweight(typed, answerCtx)
        if (lineweight === null) return this.askLineweight(phase, answerCtx)
        this.changes.lineweight = lineweight
        this.askProperty(answerCtx)
      }
    )
  }

  private listLineweights(ctx: ToolContext): void {
    ctx.report(lineweightListing(ctx))
    this.askLineweight("lineweightAgain", ctx)
  }

  /**
   * A distance, so two points give it too (p08b's ltScale, the same input),
   * negative or zero (p10); Enter keeps each object's own.
   */
  private askThickness(ctx: ToolContext): void {
    this.phase = "thickness"
    const shown = this.shownThickness(ctx)
    this.thicknessShown = shown
    const back = (commitCtx: ToolContext) => {
      if (commitCtx.dynamicInput.hasTypedText()) return false
      this.askProperty(commitCtx)
      return true
    }
    ctx.dynamicInput.open({
      fields: [{ id: "value", prompt: "newThickness", kind: "distance" }],
      commit: (values, commitCtx) => {
        if (back(commitCtx)) return
        this.changes.thickness = values.value
        this.askProperty(commitCtx)
      },
      commitRaw: back,
    })
    if (typeof shown === "number") ctx.dynamicInput.setDefault("value", shown)
    this.place(ctx)
  }

  /** What the run set, applied to every object of the set it changes. */
  private apply(ctx: ToolContext): void {
    const { color, layerId, linetype, lineweight, thickness } = this.changes
    const updated: Entity[] = []
    const refused = new Set<string>()
    for (const entity of this.entities(ctx)) {
      let next = entity
      if (layerId !== undefined && next.layerId !== layerId) {
        next = assignEntityLayer(next, layerId)
      }
      const ownColor = color === COLOR_BYLAYER ? undefined : color
      if (color !== undefined && next.color !== ownColor) {
        next = assignEntityColor(next, ownColor)
      }
      const ownLinetype = linetype === LINETYPE_BYLAYER ? undefined : linetype
      if (linetype !== undefined && next.linetype !== ownLinetype) {
        next = assignEntityLinetype(next, ownLinetype)
      }
      const ownLineweight =
        lineweight === LINEWEIGHT_BYLAYER ? undefined : lineweight
      if (lineweight !== undefined && next.lineweight !== ownLineweight) {
        next = assignEntityLineweight(next, ownLineweight)
      }
      if (thickness !== undefined) {
        if (hasThickness(next)) {
          if (entityThickness(next) !== thickness) {
            next = withThickness(next, thickness)
          }
        } else if (next.type !== "text" && next.type !== "attdef") {
          // WHY a text and an attribute definition said nothing: AutoCAD
          // gives theirs a thickness (p11, p11d), which none has here.
          refused.add(next.type === "insert" ? "other" : next.type)
        }
      }
      if (next !== entity) updated.push(next)
    }
    if (updated.length > 0) ctx.execute(new UpdateEntitiesCommand(updated))
    for (const type of refused) {
      ctx.report(ctx.text.message("cannotChangeThickness", { type }))
    }
  }

  private entities(ctx: ToolContext): Entity[] {
    return this.set
      .map((id) => ctx.document.get(id))
      .filter((entity): entity is Entity => entity !== undefined)
  }

  /** The set's one value of a property, or `VARIES`. */
  private common<T>(
    ctx: ToolContext,
    read: (entity: Entity) => T
  ): T | typeof VARIES {
    const [first, ...rest] = this.entities(ctx).map(read)
    return rest.every((value) => value === first) ? first : VARIES
  }

  private colorShown = ""
  private layerShown = ""
  private linetypeShown = ""
  private lineweightShown = ""
  private thicknessShown: number | { readonly name: string } = 0

  private shownColor(ctx: ToolContext): string {
    const color =
      this.changes.color ??
      this.common(ctx, (entity) => entity.color ?? COLOR_BYLAYER)
    this.colorShown = color === VARIES ? varies(ctx) : colorDefault(color, ctx)
    return this.colorShown
  }

  private shownLayer(ctx: ToolContext): string {
    const id =
      this.changes.layerId ?? this.common(ctx, (entity) => entity.layerId)
    return id === VARIES ? varies(ctx) : (ctx.document.getLayer(id)?.name ?? id)
  }

  private shownLinetype(ctx: ToolContext): string {
    const linetype =
      this.changes.linetype ??
      this.common(ctx, (entity) => entity.linetype ?? LINETYPE_BYLAYER)
    if (linetype === VARIES) return varies(ctx)
    return linetype === LINETYPE_BYLAYER
      ? ctx.text.message("linetypeByLayer")
      : linetype
  }

  private shownLineweight(ctx: ToolContext): string {
    const lineweight =
      this.changes.lineweight ??
      this.common(ctx, (entity) => entity.lineweight ?? LINEWEIGHT_BYLAYER)
    // WHY the linetype's word: AutoCAD writes the table's `ByLayer` at both
    // (es `PorCapa`, p09, p07), where -LWEIGHT writes `BYLAYER`.
    this.lineweightShown =
      lineweight === VARIES
        ? varies(ctx)
        : lineweight === LINEWEIGHT_BYLAYER
          ? ctx.text.message("linetypeByLayer")
          : lineweightWord(lineweight, ctx)
    return this.lineweightShown
  }

  private shownThickness(ctx: ToolContext): number | { readonly name: string } {
    const thickness =
      this.changes.thickness ?? this.common(ctx, entityThickness)
    return thickness === VARIES ? { name: varies(ctx) } : thickness
  }

  private place(ctx: ToolContext): void {
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }
}

function varies(ctx: ToolContext): string {
  return ctx.text.message("varies")
}

/**
 * A name no symbol table entry takes: AutoCAD refuses `*` as a layer's and
 * `?` as a linetype's (p06, p07).
 */
function invalidName(name: string): boolean {
  return [...name].some((c) => INVALID_LAYER_NAME_CHARACTERS.includes(c))
}

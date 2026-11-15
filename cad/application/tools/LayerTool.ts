import { Vec2 } from "../../geometry/Vec2"
import { EntityColor, STANDARD_COLORS } from "../../domain/colors"
import { Entity } from "../../domain/entities"
import {
  compareLayerNames,
  createLayer,
  DEFAULT_LAYER_ID,
  INVALID_LAYER_NAME_CHARACTERS,
  Layer,
  layerNameRefusal,
} from "../../domain/layers"
import { DEFAULT_LINETYPE_ID, Linetype } from "../../domain/linetypes"
import { Lineweight } from "../../domain/lineweights"
import { matchesWildcard } from "../../shared/wildcard"
import { parseNumber } from "../../domain/units"
import type { PromptId } from "../../locales/types"
import { ScenePrimitive } from "../../scene/types"
import {
  AddLayerCommand,
  RemoveLayerCommand,
  SetCurrentLayerCommand,
  UpdateLayerCommand,
} from "../commands/layerCommands"
import { LinetypeTableCommand, withLoaded } from "../commands/linetypeCommands"
import { colorWord, readTrueColor } from "./ColorTool"
import { rollover } from "./ghostLook"
import { linetypeRows } from "./LinetypeTool"
import { acadFile, fileLinetype } from "./linetypeFiles"
import { nearestLineweight } from "./LweightTool"
import { lastObject, ObjectSelector } from "./objectSelection"
import {
  CommandOption,
  CommandOptionOutcome,
  PointerInput,
  QuestionInput,
  Tool,
  ToolContext,
  ToolQuestion,
} from "./Tool"
import { typedPick } from "./typedPick"
import { askValueOrWord } from "./valueWordPrompt"

/** The options ON, OFF, LOck and Unlock change, each a layer's flag. */
type Switch = "on" | "off" | "lock" | "unlock"

/** A change Color, Ltype or LWeight asks the layers for. */
type Change =
  | {
      readonly kind: "color"
      readonly color: EntityColor
      /** A negative colour number: the layers are turned off too (p392). */
      readonly off: boolean
      /** Truecolor's: named by its three values, as typed (p392). */
      readonly rgb?: true
    }
  | { readonly kind: "linetype"; readonly linetype: string }
  | { readonly kind: "lineweight"; readonly lineweight: Lineweight }

type Phase =
  | { readonly kind: "option" }
  | { readonly kind: "list" }
  | { readonly kind: "make" }
  | { readonly kind: "set" }
  /** Set's `Select object:`, Enter's answer at its name. */
  | { readonly kind: "object"; readonly hover: Entity | null }
  | { readonly kind: "new" }
  | { readonly kind: "oldName" }
  | { readonly kind: "newName"; readonly layer: Layer }
  | { readonly kind: "switch"; readonly which: Switch }
  /** OFF's, LOck's and Unlock's `Select objects:`, by {@link ObjectSelector}. */
  | { readonly kind: "objects"; readonly which: Exclude<Switch, "on"> }
  /** `Really want layer "0" (the CURRENT layer) off? <N>`. */
  | { readonly kind: "currentOff"; readonly layer: Layer }
  | { readonly kind: "color" }
  | { readonly kind: "trueColor" }
  | { readonly kind: "linetype" }
  | { readonly kind: "linetypeList" }
  | { readonly kind: "lineweight" }
  | { readonly kind: "layersFor"; readonly change: Change }
  | { readonly kind: "delete" }

/**
 * The options in AutoCAD's order; DELete is declared and not listed (p324).
 * WHY OFF listed: the `initget` declares `OFf` (table 20916).
 */
const OPTIONS: readonly CommandOption[] = [
  "?",
  "Make",
  "Set",
  "New",
  "Rename",
  "ON",
  "OFF",
  "Color",
  "Ltype",
  "LWeight",
  "LOck",
  "Unlock",
].map((id) => ({ id }))

const HIDDEN_OPTIONS: readonly CommandOption[] = [
  { id: "DELete", hidden: true },
]

/** The words `New color` reads as an index colour, hidden: CHPROP's. */
const COLOR_NAMES: readonly string[] = STANDARD_COLORS.map((color) =>
  color.id.toUpperCase()
)

const COLOR_OPTIONS: readonly CommandOption[] = [
  { id: "Truecolor" },
  ...COLOR_NAMES.map((id) => ({ id, hidden: true as const })),
]

const YES_OR_NO: readonly CommandOption[] = [
  { id: "Yes", hidden: true },
  { id: "No", hidden: true },
]

/**
 * The listing's columns: a name pads to 18, On or Off to 6 and its flags
 * right of it to 5, the colour to 18, the linetype to 12; a longer word pushes
 * the rest on (p390 in every language: pt-BR `desativada   -P`).
 */
const NAME_COLUMN = 18
const ON_OFF_COLUMN = 6
const FLAGS_COLUMN = 5
const COLOR_COLUMN = 18
const LINETYPE_COLUMN = 12

/**
 * AutoCAD's -LAYER (es -CAPA), as its 2027 console asks it (probes
 * properties/p300–p329, p390–p399, p410, p411): `Current layer:  "0"`, then
 * `Enter an option [?/Make/Set/New/Rename/ON/OFF/Color/Ltype/LWeight/LOck/
 * Unlock]:`, asked again after each option until Enter.
 *
 * - `?` lists the layers a pattern matches, in AutoCAD's columns, and the
 *   current one (p390).
 * - Make makes a layer current, creating it first if need be, and turns it on
 *   (p305, p411); Set makes an existing one current, turned on, or the layer
 *   of an object picked at Enter's `Select object:`, saying so (p395, p397).
 * - New creates each layer of a comma list, saying which exist or have a
 *   name AutoCAD refuses (p300, p321, p395, p399); Rename asks the old name
 *   and the new (p319, p320, p395).
 * - ON, OFF, LOck and Unlock take a list of names with wildcards; OFF, LOck
 *   and Unlock take objects at Enter's `Select objects:`, a locked layer's
 *   too (p397, p410). Turning the current layer off asks first (p310–p312).
 * - Color (a negative number turns the layers off as well), Ltype (one the
 *   drawing lacks loaded from acad.lin, as CHPROP's) and LWeight (rounded to
 *   a valid one) ask the value, then the layers, the current one by default
 *   (p301, p392–p394).
 * - DELete, declared and not listed, deletes the layers it may (p324–p327,
 *   p396).
 *
 * The whole run is one undo step, U naming it `-LAYER`, which the next -LAYER
 * or the Layer Properties Manager's edit joins under UNDO's Layer (p303, p306,
 * p315; `layerSteps`). A lock or an unlock regenerates on U (p302).
 *
 * Not done: TRansparency, MATerial, Plot, Freeze, Thaw, stAte, Description,
 * rEconcile and Xref (none is modelled), Color's COlorbook and its index
 * colours 8 to 255 (their RGB values are not here), Group at `Select object:`,
 * the listing's pages (`Press ENTER to continue:`).
 */
export class LayerTool implements Tool {
  readonly id = "dashlayer"
  readonly layerSteps = true as const

  private phase: Phase = { kind: "option" }
  private lastScreen: Vec2 | null = null
  /** The current layer's name, which name lists default to. */
  private current = ""
  /** The colour as `layersForColor` names it, worded when it is asked. */
  private colorShown = ""
  private readonly selector = new ObjectSelector({
    done: (ctx) => this.switchSelected(ctx),
    takesLocked: true,
  })

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    ctx.report(
      ctx.text.message("currentLayerName", { name: this.currentName(ctx) })
    )
    this.askOption(ctx)
  }

  onDeactivate(ctx: ToolContext): void {
    this.phase = { kind: "option" }
    this.selector.start()
    ctx.dynamicInput.close()
  }

  wantsSnap(): boolean {
    return this.phase.kind === "objects" && this.selector.wantsSnap()
  }

  question(): PromptId | ToolQuestion {
    const phase = this.phase
    switch (phase.kind) {
      case "option":
        return "enterAnOption"
      case "list":
        return { id: "layerNamesToList", enter: { name: "*" } }
      case "make":
        return { id: "layerToMake", enter: { name: this.current } }
      // WHY the `or` in the words: its default is a phrase, which a prompt
      // without keywords writes after it.
      case "set":
        return { id: "layerToSet", enter: "layerSelectObject" }
      case "object":
        return "selectObject"
      case "new":
        return "newLayerNames"
      case "oldName":
        return "oldLayerName"
      case "newName":
        return "renamedLayerName"
      case "switch":
        return phase.which === "on"
          ? "layersToTurnOn"
          : {
              id:
                phase.which === "off"
                  ? "layersToTurnOff"
                  : phase.which === "lock"
                    ? "layersToLock"
                    : "layersToUnlock",
              enter: "layerSelectObjects",
            }
      case "objects":
        return this.selector.question()
      case "currentOff":
        return {
          id: "currentLayerOff",
          enter: "currentLayerOffNo",
          values: { name: phase.layer.name },
        }
      case "color":
        return "layerColor"
      case "trueColor":
        return "trueColor"
      case "linetype":
        return { id: "layerLinetype", enter: { name: DEFAULT_LINETYPE_ID } }
      case "linetypeList":
        return { id: "linetypeListNames", enter: { name: "*" } }
      case "lineweight":
        return "layerLineweight"
      case "layersFor":
        return this.layersForQuestion(phase.change)
      case "delete":
        return "layersToDelete"
    }
  }

  takes(): QuestionInput | null {
    switch (this.phase.kind) {
      case "object":
        return "objectLastOrGroup"
      case "objects":
        return this.selector.takes()
      case "currentOff":
        return { refusal: "yesOrNoPlease" }
      case "color":
        return { refusal: "invalidColor" }
      case "lineweight":
        return { refusal: "lineweightRequired" }
      default:
        return null
    }
  }

  commandOptions(): readonly CommandOption[] {
    switch (this.phase.kind) {
      case "option":
        return [...OPTIONS, ...HIDDEN_OPTIONS]
      case "object":
        return [{ id: "Last", hidden: true, prompt: "selectObjects" }]
      case "objects":
        return this.selector.commandOptions()
      case "currentOff":
        return YES_OR_NO
      case "color":
        return COLOR_OPTIONS
      case "linetype":
        return [{ id: "?" }]
      default:
        return []
    }
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    const phase = this.phase
    switch (phase.kind) {
      case "option":
        return this.choose(id, ctx)
      case "object":
        if (id !== "Last") return "unhandled"
        this.takeObject(lastObject(ctx) ?? null, ctx)
        return "continue"
      case "linetype":
        if (id !== "?") return "unhandled"
        this.askLinetypeList(ctx)
        return "continue"
      case "objects":
        return this.selector.invokeOption(id, ctx) ? "continue" : "unhandled"
      case "currentOff":
        if (id !== "Yes" && id !== "No") return "unhandled"
        this.answerCurrentOff(phase.layer, id === "Yes", ctx)
        return "continue"
      case "color": {
        if (id === "Truecolor") {
          this.askTrueColor(ctx)
          return "continue"
        }
        const at = COLOR_NAMES.indexOf(id)
        if (at < 0) return "unhandled"
        this.askLayersFor(
          { kind: "color", color: STANDARD_COLORS[at].value, off: false },
          ctx
        )
        return "continue"
      }
      default:
        return "unhandled"
    }
  }

  onEnter(ctx: ToolContext): boolean {
    switch (this.phase.kind) {
      // Enter on an empty set goes back to the options (p397's `0 found`).
      case "objects":
        if (!this.selector.onEnter(ctx)) this.askOption(ctx)
        return true
      // Enter keeps the `<N>` (p312).
      case "currentOff":
        this.askOption(ctx)
        return true
      // Enter at `Select object:` goes back to the options (p395).
      case "object":
        this.askOption(ctx)
        return true
      default:
        return false
    }
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen
    const phase = this.phase
    if (phase.kind === "objects") this.selector.onPointerMove(input, ctx)
    if (phase.kind === "object") {
      const hover = ctx.pick(input.world) ?? null
      if (hover?.id !== phase.hover?.id) this.phase = { ...phase, hover }
    }
    ctx.dynamicInput.setPosition(input.screen)
    ctx.requestRender()
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    const phase = this.phase
    if (phase.kind === "objects") {
      this.selector.onPointerDown(input, ctx)
      return
    }
    if (phase.kind === "object" && input.button === 0) {
      this.takeObject(ctx.pick(input.world) ?? null, ctx)
    }
  }

  onPointerUp(input: PointerInput, ctx: ToolContext): void {
    if (this.phase.kind === "objects") this.selector.onPointerUp(input, ctx)
  }

  cycleLasso(ctx: ToolContext): boolean {
    return this.phase.kind === "objects" && this.selector.cycleLasso(ctx)
  }

  /** A point typed at `Select object:` picks there. */
  answerTyped(text: string, ctx: ToolContext): boolean {
    const phase = this.phase
    if (phase.kind === "objects") return this.selector.answerTyped(text, ctx)
    if (phase.kind !== "object") return false
    const point = typedPick(text, ctx)
    if (!point) return false
    this.takeObject(ctx.pick(point) ?? null, ctx)
    return true
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    const phase = this.phase
    if (phase.kind === "objects") return this.selector.buildOverlay(ctx)
    if (phase.kind === "object" && phase.hover) {
      return rollover(ctx, phase.hover)
    }
    return []
  }

  private choose(id: string, ctx: ToolContext): CommandOptionOutcome {
    switch (id) {
      case "?":
        this.askText({ kind: "list" }, ctx, (typed, answerCtx) => {
          this.list(typed === "" ? "*" : typed, answerCtx)
          this.askOption(answerCtx)
        })
        return "continue"
      case "Make":
        this.current = this.currentName(ctx)
        this.askText({ kind: "make" }, ctx, (typed, answerCtx) =>
          this.make(typed, answerCtx)
        )
        return "continue"
      case "Set":
        this.askSet(ctx)
        return "continue"
      case "New":
        this.askText({ kind: "new" }, ctx, (typed, answerCtx) => {
          this.create(typed, answerCtx)
          this.askOption(answerCtx)
        })
        return "continue"
      case "Rename":
        this.askOldName(ctx)
        return "continue"
      case "ON":
        this.askSwitch("on", ctx)
        return "continue"
      case "OFF":
        this.askSwitch("off", ctx)
        return "continue"
      case "LOck":
        this.askSwitch("lock", ctx)
        return "continue"
      case "Unlock":
        this.askSwitch("unlock", ctx)
        return "continue"
      case "Color":
        this.askColor(ctx)
        return "continue"
      case "Ltype":
        this.askLinetype(ctx)
        return "continue"
      case "LWeight":
        this.askLineweight(ctx)
        return "continue"
      case "DELete":
        this.askText({ kind: "delete" }, ctx, (typed, answerCtx) => {
          if (typed !== "") this.delete(typed, answerCtx)
          this.askOption(answerCtx)
        })
        return "continue"
      default:
        return "unhandled"
    }
  }

  /** The option prompt, keywords alone; Enter ends the command. */
  private askOption(ctx: ToolContext): void {
    this.phase = { kind: "option" }
    ctx.dynamicInput.open({ fields: [], commit: () => {} })
    this.place(ctx)
  }

  /**
   * A name prompt. WHY no spaces: AutoCAD's string input here does not take
   * them, so a space ends the answer as in a script (`AllowSpaces` false).
   */
  private askText(
    phase: Phase,
    ctx: ToolContext,
    answer: (typed: string, ctx: ToolContext) => void
  ): void {
    this.phase = phase
    const asked = this.question()
    // WHY no label where the prompt names what it asks for (`for color 1
    // (red)`): a field's prompt takes no values; the dynamic prompt says it.
    const field =
      typeof asked === "string"
        ? { prompt: asked }
        : asked.values
          ? {}
          : { prompt: asked.id }
    ctx.dynamicInput.open({
      fields: [{ id: "name", kind: "text", ...field }],
      commit: () => {},
      commitRaw: (commitCtx) => {
        answer(commitCtx.dynamicInput.getText("name").trim(), commitCtx)
        return true
      },
    })
    this.place(ctx)
  }

  /**
   * A value prompt that takes words too: Color's, an integer prompt reading
   * Truecolor and the colour names (p392 trace), and LWeight's real one.
   */
  private askValue(
    phase: Phase,
    prompt: PromptId,
    ctx: ToolContext,
    answer: (typed: string, ctx: ToolContext) => void
  ): void {
    this.phase = phase
    askValueOrWord(
      ctx,
      { field: "value", prompt, shown: "", at: this.lastScreen },
      answer
    )
  }

  /** `?`: the layers `patterns` matches, sorted by name (p390). */
  private list(patterns: string, ctx: ToolContext): void {
    const layers = this.matching(patterns, ctx).sort(compareLayerNames)
    if (layers.length === 0) {
      ctx.report(ctx.text.message("noMatchingLayerNames"))
      return
    }
    ctx.report(
      [
        ctx.text.message("layerListColumns"),
        ...layers.map((layer) => this.row(layer, ctx)),
        ctx.text.message("layerListCurrent", { name: this.currentName(ctx) }),
      ].join("\n")
    )
  }

  /**
   * `"L2"               on     -L-P   7 (white)        "Continuous"   0.250
   * mm.`: the state is On or Off and the flags right of it, `-L` for a
   * locked layer and `-P` for one that plots, which every layer does here.
   * WHY a lineweight always: AutoCAD's layers start at Default, which is not
   * modelled (their 0.25 mm), so its word never shows.
   */
  private row(layer: Layer, ctx: ToolContext): string {
    const onOff = ctx.text.message(layer.visible ? "layerOn" : "layerOff")
    const flags =
      (layer.locked ? ctx.text.message("layerLockedFlag") : "") +
      ctx.text.message("layerPlotsFlag")
    const state = onOff.padEnd(ON_OFF_COLUMN) + flags.padStart(FLAGS_COLUMN)
    const color = colorWord(layer.color, ctx)
    const index = color.indexOf(" ")
    const number = index < 0 ? color : color.slice(0, index)
    const shownColor =
      number.padStart(3) + (index < 0 ? "" : color.slice(index))
    return [
      `"${layer.name}"`.padEnd(NAME_COLUMN),
      state,
      shownColor.padEnd(COLOR_COLUMN),
      `"${layer.linetype}"`.padEnd(LINETYPE_COLUMN),
      `${layer.lineweight.toFixed(3).padStart(6)} mm.`,
    ].join(" ")
  }

  /**
   * Make: the layer named, created if need be, current and on (p305, p411);
   * Enter keeps the current one. A name AutoCAD refuses is said (unverified
   * for Make: New's words, p321).
   */
  private make(typed: string, ctx: ToolContext): void {
    if (typed !== "") {
      const layer = this.layerNamed(typed, ctx)
      if (layer) this.makeCurrent(layer, ctx)
      else if (this.invalid(typed)) {
        ctx.report(
          ctx.text.message("invalidLayerNameQuoted", { name: typed }),
          "error"
        )
      } else ctx.execute(new AddLayerCommand(createLayer(typed), true))
    }
    this.askOption(ctx)
  }

  private askSet(ctx: ToolContext): void {
    this.askText({ kind: "set" }, ctx, (typed, answerCtx) => {
      if (typed === "") {
        this.phase = { kind: "object", hover: null }
        answerCtx.dynamicInput.close()
        this.place(answerCtx)
        return
      }
      const layer = this.layerNamed(typed, answerCtx)
      if (!layer) {
        answerCtx.report(
          answerCtx.text.message("layerNotFound", { name: typed }),
          "error"
        )
        return this.askSet(answerCtx)
      }
      this.makeCurrent(layer, answerCtx)
      this.askOption(answerCtx)
    })
  }

  /**
   * The object found at `Select object:`: its layer is made current and said
   * so (p397); none says `No object found.` and asks again (p395).
   */
  private takeObject(entity: Entity | null, ctx: ToolContext): void {
    const layer = entity ? ctx.document.getLayer(entity.layerId) : undefined
    if (!layer) {
      ctx.report(ctx.text.message("layerNoObjectFound"))
      this.phase = { kind: "object", hover: null }
      this.place(ctx)
      return
    }
    this.makeCurrent(layer, ctx)
    ctx.report(ctx.text.message("layerMadeCurrent", { name: layer.name }))
    this.askOption(ctx)
  }

  /** The layer current, turned on if it was off (p411). */
  private makeCurrent(layer: Layer, ctx: ToolContext): void {
    if (!layer.visible) {
      ctx.execute(new UpdateLayerCommand(layer.id, { visible: true }))
    }
    if (layer.id !== ctx.document.getCurrentLayerId()) {
      ctx.execute(new SetCurrentLayerCommand(layer.id))
    }
  }

  /** New: each name of the list a layer, unless one has it or AutoCAD refuses it (p395, p399). */
  private create(typed: string, ctx: ToolContext): void {
    for (const name of names(typed)) {
      if (this.layerNamed(name, ctx)) {
        ctx.report(ctx.text.message("layerAlreadyExists", { name }))
      } else if (this.invalid(name)) {
        ctx.report(
          ctx.text.message("invalidLayerNameQuoted", { name }),
          "error"
        )
      } else ctx.execute(new AddLayerCommand(createLayer(name), false))
    }
  }

  /**
   * Rename's old name: one it does not find is said and asked again, layer 0
   * is refused (p319, p395); Enter goes back to the options (unverified).
   */
  private askOldName(ctx: ToolContext): void {
    this.askText({ kind: "oldName" }, ctx, (typed, answerCtx) => {
      if (typed === "") return this.askOption(answerCtx)
      const layer = this.layerNamed(typed, answerCtx)
      if (!layer) {
        answerCtx.report(
          answerCtx.text.message("layerNotFound", { name: typed }),
          "error"
        )
        return this.askOldName(answerCtx)
      }
      if (layer.id === DEFAULT_LAYER_ID) {
        answerCtx.report(
          answerCtx.text.message("cannotRenameLayer", { name: layer.name })
        )
        return this.askOption(answerCtx)
      }
      this.askNewName(layer, answerCtx)
    })
  }

  /**
   * Rename's new name: one AutoCAD refuses is said and asked again, one in
   * use is said and the options follow (p320, p395).
   */
  private askNewName(layer: Layer, ctx: ToolContext): void {
    this.askText({ kind: "newName", layer }, ctx, (typed, answerCtx) => {
      if (typed === "") return this.askOption(answerCtx)
      const refusal = layerNameRefusal(
        answerCtx.document.getLayers(),
        layer.id,
        typed
      )
      if (refusal === "invalid") {
        answerCtx.report(answerCtx.text.message("invalidLayerName"), "error")
        return this.askNewName(layer, answerCtx)
      }
      if (refusal === "inUse") {
        answerCtx.report(
          answerCtx.text.message("layerNameInUse", { name: typed })
        )
      } else if (typed !== layer.name) {
        answerCtx.execute(new UpdateLayerCommand(layer.id, { name: typed }))
      }
      this.askOption(answerCtx)
    })
  }

  private askSwitch(which: Switch, ctx: ToolContext): void {
    this.askText({ kind: "switch", which }, ctx, (typed, answerCtx) => {
      if (typed === "") {
        if (which === "on") return this.askOption(answerCtx)
        this.phase = { kind: "objects", which }
        answerCtx.selection.clear()
        this.selector.start()
        answerCtx.dynamicInput.close()
        this.place(answerCtx)
        return
      }
      const layers = this.matching(typed, answerCtx)
      if (layers.length === 0) {
        answerCtx.report(answerCtx.text.message("noMatchingLayerNames"))
        return this.askOption(answerCtx)
      }
      this.switchLayers(which, layers, answerCtx)
    })
  }

  /** The layers of the objects `Select objects:` closed on. */
  private switchSelected(ctx: ToolContext): void {
    const phase = this.phase
    if (phase.kind !== "objects") return
    const ids = new Set(
      ctx.selection
        .toArray()
        .map((id) => ctx.document.get(id)?.layerId)
        .filter((id) => id !== undefined)
    )
    ctx.selection.clear()
    const layers = ctx.document.getLayers().filter((layer) => ids.has(layer.id))
    this.switchLayers(phase.which, layers, ctx)
  }

  /**
   * ON, OFF, LOck or Unlock on `layers`; turning the current one off is asked
   * once the others are off (p391, p310).
   */
  private switchLayers(
    which: Switch,
    layers: readonly Layer[],
    ctx: ToolContext
  ): void {
    const currentId = ctx.document.getCurrentLayerId()
    let current: Layer | null = null
    for (const layer of layers) {
      if (which === "off" && layer.id === currentId && layer.visible) {
        current = layer
        continue
      }
      this.switchOne(which, layer, ctx)
    }
    if (current === null) return this.askOption(ctx)
    this.phase = { kind: "currentOff", layer: current }
    ctx.dynamicInput.open({ fields: [], commit: () => {} })
    this.place(ctx)
  }

  private switchOne(which: Switch, layer: Layer, ctx: ToolContext): void {
    const patch =
      which === "on" || which === "off"
        ? { visible: which === "on" }
        : { locked: which === "lock" }
    const key = Object.keys(patch)[0] as keyof typeof patch
    if (layer[key] === patch[key]) return
    ctx.execute(new UpdateLayerCommand(layer.id, patch))
    // A lock or an unlock regenerates on U, saying nothing now (p302).
    if (which === "lock" || which === "unlock") ctx.regenerate("silently")
  }

  private answerCurrentOff(layer: Layer, off: boolean, ctx: ToolContext): void {
    if (off) this.switchOne("off", layer, ctx)
    this.askOption(ctx)
  }

  /**
   * `New color [Truecolor] :`: an index colour by number or name, its
   * negative turning the layers off (p392), or Truecolor's three values. An
   * integer prompt: 0 and beyond 255 say `Invalid color number.`, a word it
   * does not take `Invalid color.`, and it is asked again (p392, p398); Enter
   * goes back to the options (unverified).
   */
  private askColor(ctx: ToolContext): void {
    this.askValue({ kind: "color" }, "layerColor", ctx, (typed, answerCtx) => {
      if (typed === "") return this.askOption(answerCtx)
      const change = readLayerColor(typed, answerCtx)
      if (change === "refused") return this.askColor(answerCtx)
      this.askLayersFor(change, answerCtx)
    })
  }

  private askTrueColor(ctx: ToolContext): void {
    this.phase = { kind: "trueColor" }
    ctx.dynamicInput.open({
      fields: [{ id: "rgb", prompt: "trueColor", kind: "text" }],
      commit: () => {},
      commitRaw: (commitCtx) => {
        const color = readTrueColor(commitCtx)
        if (color === null) this.askTrueColor(commitCtx)
        else {
          const change: Change = { kind: "color", color, off: false, rgb: true }
          this.askLayersFor(change, commitCtx)
        }
        return true
      },
    })
    this.place(ctx)
  }

  /**
   * Ltype's name: `?` lists the loaded linetypes and goes back to the options
   * (p393); Enter is Continuous; one the drawing lacks is loaded from acad.lin,
   * the imperial file, as CHPROP's LType (ltype/p03, p393), and one it lacks
   * too is said, the options following.
   */
  private askLinetypeList(ctx: ToolContext): void {
    this.askText({ kind: "linetypeList" }, ctx, (pattern, listCtx) => {
      this.listLinetypes(pattern === "" ? "*" : pattern, listCtx)
      this.askOption(listCtx)
    })
  }

  private askLinetype(ctx: ToolContext): void {
    this.askText({ kind: "linetype" }, ctx, (typed, answerCtx) => {
      if (typed === "?") return this.askLinetypeList(answerCtx)
      const name = typed === "" ? DEFAULT_LINETYPE_ID : typed
      const linetype = this.loadedLinetype(name, answerCtx)
      if (linetype === null) {
        answerCtx.report(
          answerCtx.text.message("layerLinetypeNotFound", { name: typed })
        )
        return this.askOption(answerCtx)
      }
      this.askLayersFor({ kind: "linetype", linetype }, answerCtx)
    })
  }

  /** `name` as the drawing's table names it, loaded from acad.lin if need be; null if neither has it. */
  private loadedLinetype(name: string, ctx: ToolContext): string | null {
    const loaded = ctx.document.getLinetype(name)
    if (loaded) return loaded.name
    const found = fileLinetype(acadFile(), name)
    if (!found) return null
    ctx.execute(
      new LinetypeTableCommand(
        withLoaded(
          ctx.document.getLinetypes(),
          [found],
          ctx.document.getTextStyles()
        )
      )
    )
    return found.name
  }

  /** Ltype's `?`: `Loaded linetypes:` and those `patterns` matches (p393). */
  private listLinetypes(patterns: string, ctx: ToolContext): void {
    const wanted = names(patterns)
    const matching: Linetype[] = [...ctx.document.getLinetypes()]
      .sort((a, b) => (a.name.toUpperCase() < b.name.toUpperCase() ? -1 : 1))
      .filter((entry) =>
        wanted.some((pattern) => matchesWildcard(entry.name, pattern))
      )
    ctx.report(
      matching.length === 0
        ? [
            ctx.text.message("layerLoadedLinetypes"),
            ctx.text.message("linetypeColumns") +
              ctx.text.message("noMatchingLinetypes"),
          ].join("\n")
        : [
            ctx.text.message("layerLoadedLinetypes"),
            ctx.text.message("linetypeColumns"),
            ...linetypeRows(matching, ctx),
          ].join("\n")
    )
  }

  /**
   * LWeight's value, in millimetres, rounded to a valid one and said so; a
   * negative one says `Invalid lweight number.`, a word that it needs a
   * weight, and it is asked again; Enter goes back to the options (p394,
   * p399).
   */
  private askLineweight(ctx: ToolContext): void {
    const phase: Phase = { kind: "lineweight" }
    this.askValue(phase, "layerLineweight", ctx, (typed, answerCtx) => {
      if (typed === "") return this.askOption(answerCtx)
      const value = parseNumber(typed)
      if (value === null || value < 0) {
        answerCtx.report(
          answerCtx.text.message(
            value === null ? "lineweightRequired" : "invalidLineweightNumber"
          ),
          "error"
        )
        return this.askLineweight(answerCtx)
      }
      const lineweight = nearestLineweight(value)
      if (lineweight !== value) {
        answerCtx.report(
          answerCtx.text.message("lineweightRounded", {
            value: `${lineweight.toFixed(2)} mm`,
          })
        )
      }
      this.askLayersFor({ kind: "lineweight", lineweight }, answerCtx)
    })
  }

  /** The layers a colour, linetype or lineweight is for, the current one at Enter. */
  private askLayersFor(change: Change, ctx: ToolContext): void {
    this.current = this.currentName(ctx)
    if (change.kind === "color") {
      this.colorShown = change.rgb
        ? [1, 3, 5]
            .map((at) => parseInt(change.color.slice(at, at + 2), 16))
            .join(",")
        : colorWord(change.color, ctx)
    }
    this.askText({ kind: "layersFor", change }, ctx, (typed, answerCtx) => {
      const layers = this.matching(
        typed === "" ? this.current : typed,
        answerCtx
      )
      if (layers.length === 0) {
        answerCtx.report(answerCtx.text.message("noMatchingLayerNames"))
      }
      for (const layer of layers) this.change(layer, change, answerCtx)
      this.askOption(answerCtx)
    })
  }

  private layersForQuestion(change: Change): ToolQuestion {
    const enter = { name: this.current }
    switch (change.kind) {
      case "color":
        return {
          id: "layersForColor",
          enter,
          values: {
            color: (change.off ? "-" : "") + this.colorShown,
          },
        }
      case "linetype":
        return {
          id: "layersForLinetype",
          enter,
          values: { name: change.linetype },
        }
      case "lineweight":
        return {
          id: "layersForLineweight",
          enter,
          values: { value: change.lineweight.toFixed(2) },
        }
    }
  }

  /**
   * The change on one layer. WHY a positive colour leaves On as it is: what
   * AutoCAD does to an off layer's colour sign is unverified.
   */
  private change(layer: Layer, change: Change, ctx: ToolContext): void {
    const patch =
      change.kind === "color"
        ? {
            color: change.color,
            ...(change.off ? { visible: false } : {}),
          }
        : change.kind === "linetype"
          ? { linetype: change.linetype }
          : { lineweight: change.lineweight }
    const changed = Object.fromEntries(
      Object.entries(patch).filter(
        ([key, value]) => layer[key as keyof Layer] !== value
      )
    )
    if (Object.keys(changed).length > 0) {
      ctx.execute(new UpdateLayerCommand(layer.id, changed))
    }
  }

  /**
   * DELete: each layer matched that may go (never 0, the current one, or one
   * holding objects); `The selected layers could not be deleted.` if any
   * stays (p324–p327, p396).
   */
  private delete(typed: string, ctx: ToolContext): void {
    const layers = this.matching(typed, ctx)
    if (layers.length === 0) {
      ctx.report(ctx.text.message("noMatchingLayerNames"))
      return
    }
    let refused = false
    for (const layer of layers) {
      if (ctx.document.canRemoveLayer(layer.id)) {
        ctx.execute(new RemoveLayerCommand(layer.id))
      } else refused = true
    }
    if (refused) ctx.report(ctx.text.message("layersNotDeleted"))
  }

  /** The layers a comma list of names and wildcards matches, case aside. */
  private matching(typed: string, ctx: ToolContext): Layer[] {
    const patterns = names(typed)
    return ctx.document
      .getLayers()
      .filter((layer) =>
        patterns.some((pattern) => matchesWildcard(layer.name, pattern))
      )
  }

  private layerNamed(name: string, ctx: ToolContext): Layer | undefined {
    const key = name.toUpperCase()
    return ctx.document
      .getLayers()
      .find((layer) => layer.name.toUpperCase() === key)
  }

  private invalid(name: string): boolean {
    return [...name].some((c) => INVALID_LAYER_NAME_CHARACTERS.includes(c))
  }

  private currentName(ctx: ToolContext): string {
    return (
      ctx.document.getLayer(ctx.document.getCurrentLayerId())?.name ??
      DEFAULT_LAYER_ID
    )
  }

  private place(ctx: ToolContext): void {
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }
}

/** The names of a comma list, empty ones left out. */
function names(typed: string): string[] {
  return typed
    .split(",")
    .map((name) => name.trim())
    .filter((name) => name !== "")
}

/**
 * The colour typed at `New color`: an index colour by number, its negative
 * turning the layers off, or an English name whole; `"refused"`, the refusal
 * said, to ask again. WHY nothing said for 8 to 255: AutoCAD takes them, and
 * only their RGB values are missing here (as -COLOR's).
 */
function readLayerColor(typed: string, ctx: ToolContext): Change | "refused" {
  if (/^[-+]?\d+$/.test(typed)) {
    const number = Number(typed)
    const standard = STANDARD_COLORS[Math.abs(number) - 1]
    if (standard)
      return { kind: "color", color: standard.value, off: number < 0 }
    if (number === 0 || Math.abs(number) > 255) {
      ctx.report(ctx.text.message("invalidColorNumber"), "error")
    }
    return "refused"
  }
  const at = COLOR_NAMES.indexOf(typed.toUpperCase())
  if (at >= 0) {
    return { kind: "color", color: STANDARD_COLORS[at].value, off: false }
  }
  ctx.report(ctx.text.message("invalidColor"), "error")
  return "refused"
}

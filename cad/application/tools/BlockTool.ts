import { Vec2 } from "../../geometry/Vec2"
import { Vec3 } from "../../geometry/Vec3"
import {
  BlockDefinition,
  Entity,
  InsertEntity,
  blockAttribute,
  blocksInUse,
  createBlockDefinition,
  createInsert,
  findBlockNamed,
  onPlaneOf,
  rotateEntity,
  variableAttributes,
} from "../../domain/entities"
import { ucsRotation } from "../../domain/ucs"
import type { EntityId } from "../../domain/entities"
import type { PromptId } from "../../locales/types"
import { CreateBlockCommand } from "../commands/blockCommands"
import { parseCoordinate } from "../input/coordinateInput"
import { ScenePrimitive } from "../../scene/types"
import { AttributeEditBox } from "./AttEditTool"
import { BLOCKS_TO_LIST, askBlocksToList } from "./blockListing"
import { ObjectSelector } from "./objectSelection"
import {
  CommandOption,
  CommandOptionOutcome,
  PointerInput,
  QuestionInput,
  Tool,
  ToolContext,
  ToolQuestion,
} from "./Tool"
import { withCurrentProperties } from "./currentProperties"

/** Characters a symbol-table name may not hold (AutoCAD's naming rule). */
const INVALID_NAME = /[\\<>/?":;*|,=`]/

type BlockState =
  | { readonly phase: "name" }
  /** `?`'s `Enter block(s) to list <*>:`. */
  | { readonly phase: "list" }
  /**
   * `Block "B1" already exists. Redefine it?`; once refused, its short form
   * (probe blocks/p118).
   */
  | { readonly phase: "redefine"; readonly refused: boolean }
  | { readonly phase: "base" }
  /** `Select objects:`, by {@link ObjectSelector}. */
  | { readonly phase: "select" }
  /** The converted reference's attribute values, in ATTEDIT's box. */
  | { readonly phase: "values"; readonly box: AttributeEditBox }

/**
 * AutoCAD's BLOCK and -BLOCK: names some geometry, pins it to an insertion
 * base point and files it in the drawing's block table. The prompts are
 * -BLOCK's, in order — `Current settings: Object conversion=Convert`, the
 * block name (`?` lists what is defined; one the table holds asks to redefine
 * it), the insertion base point, then `Select objects:`, which a set selected
 * before the command answers (probe blocks/p132).
 *
 * The objects become a reference to the new block ("Convert to Block", the mode
 * AutoCAD's own task page tells you to choose), so the drawing looks unchanged
 * and the geometry is now one object. An empty set defines an empty block and
 * converts nothing (p131). The whole command is a single undo step.
 *
 * Attribute definitions join the block in the order they were picked, and a
 * window or crossing picks them in reverse order of creation, as AutoCAD
 * documents; the reference is converted with their defaults and ATTEDIT's box
 * opens on it.
 */
export class BlockTool implements Tool {
  readonly id = "block"

  private state: BlockState = { phase: "name" }
  private lastScreen: Vec2 | null = null
  private name = ""
  private basePoint: Vec3 = { x: 0, y: 0, z: 0 }
  private readonly selector = new ObjectSelector({
    takes: () => "wholeObjects",
    done: (ctx) => this.commit(ctx),
    // What one selection finds joins the set newest first.
    accept: (ids) => [...ids].reverse(),
  })

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("default")
    this.name = ""
    ctx.report(ctx.text.message("blockConversion"))
    this.enterName(ctx)
  }

  onDeactivate(ctx: ToolContext): void {
    this.state = { phase: "name" }
    this.selector.start()
    ctx.dynamicInput.close()
  }

  question(): PromptId | ToolQuestion | null {
    const state = this.state
    switch (state.phase) {
      case "name":
        return { id: "blockName", takesSpaces: true }
      case "list":
        return BLOCKS_TO_LIST
      case "redefine":
        return state.refused
          ? { id: "redefineIt", enter: { name: "N" } }
          : {
              id: "blockExists",
              values: { name: this.name },
              enter: { name: "N" },
            }
      case "base":
        return "insertionBasePoint"
      case "select":
        return this.selector.question()
      // The stand-in for a dialog asks nothing at the command line.
      case "values":
        return null
    }
  }

  takes(): QuestionInput | null {
    switch (this.state.phase) {
      case "select":
        return this.selector.takes()
      // AllowNone off, with keywords (probes blocks/p01, p124, p125).
      case "base":
        return { refusal: "pointOrKeywordRequired" }
      case "redefine":
        return { refusal: "yesOrNoPlease" }
      default:
        return null
    }
  }

  /** The base point's own refusal is a point prompt's. */
  setsLastPoint(): boolean | null {
    return this.state.phase === "base" ? true : null
  }

  commandOptions(): readonly CommandOption[] {
    switch (this.state.phase) {
      case "name":
        return [{ id: "?" }]
      case "redefine":
        return [{ id: "Yes" }, { id: "No" }]
      case "select":
        return this.selector.commandOptions()
      default:
        return []
    }
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    switch (this.state.phase) {
      case "select":
        return this.selector.invokeOption(id, ctx) ? "continue" : "unhandled"
      case "name":
        if (id !== "?") return "unhandled"
        this.enterList(ctx)
        return "continue"
      case "redefine":
        if (id === "No") return "end"
        if (id !== "Yes") return "unhandled"
        this.enterBase(ctx)
        return "continue"
      default:
        return "unhandled"
    }
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen
    if (this.state.phase === "select") this.selector.onPointerMove(input, ctx)
    ctx.dynamicInput.setPosition(input.screen)
    ctx.requestRender()
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (this.state.phase === "select") {
      this.selector.onPointerDown(input, ctx)
      return
    }
    if (input.button === 0 && this.state.phase === "base") {
      this.setBasePoint(input.point, ctx)
    }
  }

  answerTyped(text: string, ctx: ToolContext): boolean {
    if (this.state.phase === "redefine") {
      // Asked again short, after the refusal (probe blocks/p118).
      ctx.report(ctx.text.message("yesOrNoPlease"), "error")
      this.state = { phase: "redefine", refused: true }
      return true
    }
    return this.state.phase === "select" && this.selector.answerTyped(text, ctx)
  }

  onPointerUp(input: PointerInput, ctx: ToolContext): void {
    if (this.state.phase === "select") this.selector.onPointerUp(input, ctx)
  }

  cycleLasso(ctx: ToolContext): boolean {
    return this.selector.cycleLasso(ctx)
  }

  onEnter(ctx: ToolContext): boolean {
    switch (this.state.phase) {
      // Enter keeps the `<N>` (probe blocks/p114).
      case "redefine":
        ctx.endCommand()
        return true
      case "select":
        // An empty set defines an empty block (probe blocks/p131, desktop d09).
        if (!this.selector.onEnter(ctx)) this.commit(ctx)
        return true
      default:
        return false
    }
  }

  wantsSnap(): boolean {
    return (
      this.state.phase === "base" ||
      (this.state.phase === "select" && this.selector.wantsSnap())
    )
  }

  hiddenEntityIds(): readonly EntityId[] {
    return this.state.phase === "values" ? [this.state.box.target.id] : []
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    switch (this.state.phase) {
      case "select":
        return this.selector.buildOverlay(ctx)
      case "values":
        return this.state.box.buildOverlay(ctx)
      default:
        return []
    }
  }

  private enterName(ctx: ToolContext): void {
    this.state = { phase: "name" }
    ctx.dynamicInput.open({
      fields: [{ id: "name", prompt: "blockName", kind: "text" }],
      commit: () => {},
      commitRaw: (commitCtx) => {
        const typed = commitCtx.dynamicInput.getText("name").trim()
        if (typed === "?") {
          this.enterList(commitCtx)
          return true
        }
        // Enter is no name: refused, and asked again (probes blocks/p100–p102).
        if (
          typed.length === 0 ||
          typed.length > 255 ||
          INVALID_NAME.test(typed)
        ) {
          commitCtx.report(
            commitCtx.text.message("invalidNewBlockName"),
            "error"
          )
          this.enterName(commitCtx)
          return true
        }
        // A name the table has in another case is that block, its spelling
        // kept (p115).
        const existing = findBlockNamed(commitCtx.document.getBlocks(), typed)
        this.name = existing?.name ?? typed
        if (existing) this.enterRedefine(commitCtx)
        else this.enterBase(commitCtx)
        return true
      },
    })
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  private enterList(ctx: ToolContext): void {
    this.state = { phase: "list" }
    askBlocksToList(ctx, "block")
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  private enterRedefine(ctx: ToolContext): void {
    this.state = { phase: "redefine", refused: false }
    ctx.dynamicInput.open({ fields: [], commit: () => {} })
  }

  private enterBase(ctx: ToolContext): void {
    this.state = { phase: "base" }
    ctx.dynamicInput.open({
      fields: [
        {
          id: "base",
          prompt: "insertionBasePoint",
          kind: "coordinate",
        },
      ],
      commit: () => {},
      commitRaw: (commitCtx) => {
        const typed = commitCtx.dynamicInput.getText("base").trim()
        // Enter is refused, and the point asked again (probe blocks/p124).
        if (typed === "") {
          commitCtx.report(
            commitCtx.text.message("pointOrKeywordRequired"),
            "error"
          )
          return true
        }
        const point = parseCoordinate(typed, {
          lastPoint: commitCtx.lastPoint,
          relativeByDefault: false,
          ucs: commitCtx.ucs,
          elevation: commitCtx.elevation,
        })
        if (!point) return false
        this.setBasePoint(point, commitCtx)
        return true
      },
    })
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  private setBasePoint(point: Vec3, ctx: ToolContext): void {
    this.basePoint = point
    // ELEVATION's Z too (probes blocks/p126, p127).
    if (point.z !== 0) ctx.report(ctx.text.message("zBaseNotZero"))
    this.state = { phase: "select" }
    this.selector.start()
    ctx.dynamicInput.close()
    // A set selected before the command is counted here and closes at once
    // (probe blocks/p132).
    if (this.selector.preselect(ctx)) {
      this.commit(ctx)
      return
    }
    ctx.requestRender()
  }

  private commit(ctx: ToolContext): void {
    const ids = ctx.selection.toArray()
    const entities = ids
      .map((id) => ctx.document.get(id))
      .filter((entity): entity is Entity => entity !== undefined)
    const existing = findBlockNamed(ctx.document.getBlocks(), this.name)
    // A block may not hold itself, at any depth (probes blocks/p117, p119).
    if (existing && blocksInUse(entities, ctx.blocks).has(existing.id)) {
      ctx.report(
        ctx.text.message("blockReferencesItself", { name: existing.name }),
        "error"
      )
      ctx.regenerate()
      ctx.report(ctx.text.message("invalid"), "error")
      ctx.endCommand()
      return
    }
    // A block is defined in the current UCS: its X axis is the UCS's, and the
    // converted reference turns it back, so the drawing looks exactly as it
    // did before the objects became a block. WHY not AutoCAD's: 2027 turns
    // the reference a second time, moving the user's objects off where they
    // were (probe blocks/p155, desktop d09); a defect is no muscle memory
    // (BLOCKS-D14).
    const turn = ucsRotation(ctx.ucs)
    const block: BlockDefinition = {
      ...createBlockDefinition(
        this.name,
        this.basePoint,
        turn === 0
          ? entities
          : entities.map((entity) =>
              rotateEntity(entity, this.basePoint, -turn)
            ),
        this.basePoint.z
      ),
      ...(existing ? { id: existing.id } : {}),
    }
    const reference: InsertEntity | null =
      entities.length === 0
        ? null
        : withCurrentProperties(
            onPlaneOf(
              createInsert(block.id, this.basePoint, {
                rotation: turn,
                layerId: ctx.document.getCurrentLayerId(),
                attributes: variableAttributes(block).map((definition) =>
                  blockAttribute(definition, definition.value)
                ),
              }),
              this.basePoint
            ),
            ctx
          )
    ctx.selection.clear()
    ctx.execute(new CreateBlockCommand(block, ids, reference))
    if (existing) {
      ctx.report(ctx.text.message("blockRedefined", { name: block.name }))
      // AutoCAD says nothing now, but its U regenerates (probe blocks/p137).
      ctx.regenerate("silently")
    }
    if (!reference?.attributes?.length) {
      ctx.endCommand()
      return
    }
    // WHY ATTEDIT's box, not the command line: the desktop opens Edit
    // Attributes on the new reference whatever ATTDIA, and its Cancel keeps
    // the defaults (desktop d00, d01); the console's silence is its own, as it
    // shows no dialog (probes blocks/p134, p305). BLOCKS-D90.
    const box = new AttributeEditBox(reference, "prompt")
    this.state = { phase: "values", box }
    box.open(ctx, (doneCtx) => {
      this.state = { phase: "name" }
      box.commit(doneCtx)
      doneCtx.endCommand()
    })
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }
}

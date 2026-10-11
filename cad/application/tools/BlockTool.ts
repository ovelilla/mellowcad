import { Vec2 } from "../../geometry/Vec2"
import { Vec3 } from "../../geometry/Vec3"
import {
  BlockAttribute,
  BlockDefinition,
  Entity,
  createBlockDefinition,
  createInsert,
  onPlaneOf,
  rotateEntity,
} from "../../domain/entities"
import { ucsRotation } from "../../domain/ucs"
import type { PromptId } from "../../locales/types"
import { CreateBlockCommand } from "../commands/blockCommands"
import { parseCoordinate } from "../input/coordinateInput"
import { ScenePrimitive } from "../../scene/types"
import { AttributeValuePrompts } from "./attributeValues"
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
  | { readonly phase: "base" }
  /** `Select objects:`, by {@link ObjectSelector}. */
  | { readonly phase: "select" }
  /** Converting to a reference: asking the values of its attributes. */
  | { readonly phase: "attributes"; readonly prompts: AttributeValuePrompts }

/**
 * AutoCAD's BLOCK: names some geometry, pins it to an insertion base point and
 * files it in the drawing's block table. The prompts are -BLOCK's, in order —
 * `Current settings: Object conversion=Convert`, the block name (with `?` to
 * list what is already defined), the insertion base point, then
 * `Select objects:`.
 *
 * The objects become a reference to the new block ("Convert to Block", the mode
 * AutoCAD's own task page tells you to choose), so the drawing looks unchanged
 * and the geometry is now one object. The whole command is a single undo step.
 *
 * Attribute definitions in the selection ask for their values in the order
 * they were picked, and a window or crossing picks them in reverse order of
 * creation, as AutoCAD documents; the new reference then asks for its values
 * as INSERT does, since it is converted with attributes of its own.
 */
export class BlockTool implements Tool {
  readonly id = "block"

  private state: BlockState = { phase: "name" }
  private lastScreen: Vec2 | null = null
  private name = ""
  private basePoint: Vec3 = { x: 0, y: 0, z: 0 }
  private readonly selector = new ObjectSelector({
    done: (ctx) => this.commit(ctx),
    // What one selection finds joins the set newest first.
    accept: (ids) => [...ids].reverse(),
  })

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("default")
    ctx.selection.clear()
    this.name = ""
    ctx.report(ctx.text.message("blockConversion"))
    this.enterName(ctx)
  }

  onDeactivate(ctx: ToolContext): void {
    this.state = { phase: "name" }
    this.selector.start()
    ctx.dynamicInput.close()
  }

  question(): PromptId | ToolQuestion {
    switch (this.state.phase) {
      case "name":
        return "blockName"
      case "base":
        return "insertionBasePoint"
      case "select":
        return this.selector.question()
      case "attributes":
        return this.state.prompts.question()
    }
  }

  takes(): QuestionInput | null {
    return this.state.phase === "select" ? this.selector.takes("objects") : null
  }

  commandOptions(): readonly CommandOption[] {
    switch (this.state.phase) {
      case "name":
        return [{ id: "?" }]
      case "select":
        return this.selector.commandOptions()
      default:
        return []
    }
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    if (this.state.phase === "select") {
      return this.selector.invokeOption(id, ctx) ? "continue" : "unhandled"
    }
    if (this.state.phase !== "name" || id !== "?") return "unhandled"
    this.listBlocks(ctx)
    this.enterName(ctx)
    return "continue"
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
    return this.state.phase === "select" && this.selector.answerTyped(text, ctx)
  }

  onPointerUp(input: PointerInput, ctx: ToolContext): void {
    if (this.state.phase === "select") this.selector.onPointerUp(input, ctx)
  }

  onEnter(ctx: ToolContext): boolean {
    return this.state.phase === "select" && this.selector.onEnter(ctx)
  }

  wantsSnap(): boolean {
    return (
      this.state.phase === "base" ||
      (this.state.phase === "select" && this.selector.wantsSnap())
    )
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    return this.state.phase === "select" ? this.selector.buildOverlay(ctx) : []
  }

  private listBlocks(ctx: ToolContext): void {
    const blocks = ctx.document.getBlocks()
    ctx.report(
      blocks.length === 0
        ? ctx.text.message("noBlocks")
        : blocks.map((block) => block.name).join("\n")
    )
  }

  private enterName(ctx: ToolContext): void {
    this.state = { phase: "name" }
    ctx.dynamicInput.open({
      fields: [{ id: "name", prompt: "blockName", kind: "text" }],
      commit: () => {},
      commitRaw: (commitCtx) => {
        const typed = commitCtx.dynamicInput.getText("name").trim()
        if (typed === "?") {
          this.listBlocks(commitCtx)
          this.enterName(commitCtx)
          return true
        }
        if (typed.length === 0) {
          commitCtx.endCommand()
          return true
        }
        if (typed.length > 255 || INVALID_NAME.test(typed)) {
          commitCtx.report(commitCtx.text.message("invalidBlockName"), "error")
          this.enterName(commitCtx)
          return true
        }
        this.name = typed
        this.enterBase(commitCtx)
        return true
      },
    })
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
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
        const point = parseCoordinate(
          commitCtx.dynamicInput.getText("base").trim(),
          {
            lastPoint: commitCtx.lastPoint,
            relativeByDefault: false,
            ucs: commitCtx.ucs,
            elevation: commitCtx.elevation,
          }
        )
        if (!point) return false
        this.setBasePoint(point, commitCtx)
        return true
      },
    })
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  private setBasePoint(point: Vec3, ctx: ToolContext): void {
    this.basePoint = point
    this.state = { phase: "select" }
    this.selector.start()
    ctx.dynamicInput.close()
    ctx.requestRender()
  }

  private commit(ctx: ToolContext): void {
    const ids = ctx.selection.toArray()
    const entities = ids
      .map((id) => ctx.document.get(id))
      .filter((entity): entity is Entity => entity !== undefined)
    if (entities.length === 0) {
      ctx.endCommand()
      return
    }
    // A block is defined in the current UCS: its X axis is the UCS's, and the
    // converted reference turns it back, so the drawing looks exactly as it
    // did before the objects became a block.
    const turn = ucsRotation(ctx.ucs)
    const block: BlockDefinition = createBlockDefinition(
      this.name,
      this.basePoint,
      turn === 0
        ? entities
        : entities.map((entity) => rotateEntity(entity, this.basePoint, -turn)),
      this.basePoint.z
    )
    const convert = (
      attributes: readonly BlockAttribute[],
      doneCtx: ToolContext
    ) => {
      const reference = withCurrentProperties(
        onPlaneOf(
          createInsert(block.id, this.basePoint, {
            rotation: turn,
            layerId: doneCtx.document.getCurrentLayerId(),
            attributes,
          }),
          this.basePoint
        ),
        doneCtx
      )
      doneCtx.execute(new CreateBlockCommand(block, ids, reference))
      doneCtx.selection.set([reference.id])
      doneCtx.endCommand()
    }
    const prompts = new AttributeValuePrompts(block, convert)
    this.state = { phase: "attributes", prompts }
    prompts.start(ctx)
  }
}

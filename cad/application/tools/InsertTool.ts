import { Vec2 } from "../../geometry/Vec2"
import { Vec3 } from "../../geometry/Vec3"
import { DocumentReader } from "../../domain/Document"
import {
  BlockAttribute,
  BlockDefinition,
  BlockId,
  EntityId,
  InsertEntity,
  blockAttribute,
  createInsert,
  findBlockNamed,
  insertFlatGeometry,
  isAnonymousBlock,
  onPlaneOf,
  variableAttributes,
} from "../../domain/entities"
import { parseAngleDegrees, parseNumber } from "../../domain/units"
import { ucsAngleToWorld } from "../../domain/ucs"
import { AddEntityCommand } from "../commands/entityCommands"
import { parseCoordinate } from "../input/coordinateInput"
import { ScenePrimitive } from "../../scene/types"
import { AttributeValuePrompts } from "./attributeValues"
import { BLOCKS_TO_LIST, askBlocksToList } from "./blockListing"
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
import { withCurrentProperties } from "./currentProperties"
import { drawn } from "./ghostLook"

/** Reused so preview frames don't burn entity ids. */
const PREVIEW_ID: EntityId = "__insert_preview__"

type InsertState =
  | { readonly phase: "name" }
  /** `?`'s `Enter block(s) to list <*>:`. */
  | { readonly phase: "list" }
  | { readonly phase: "point"; readonly cursor: Vec2 }
  | { readonly phase: "scale" }
  | { readonly phase: "rotation" }
  | {
      readonly phase: "attributes"
      readonly at: Vec3
      readonly prompts: AttributeValuePrompts
    }

/**
 * AutoCAD's -INSERT (2027's INSERT opens the Blocks palette, whose click
 * starts it at the point): places a reference to a block already defined in
 * the drawing. The block is named first (`?` lists what is defined and ends,
 * as -BLOCK's does), then the insertion point, with **Scale** and **Rotate**
 * offered as the keywords -INSERT lists — each sets its value and returns to
 * the point prompt, so the reference is dragged in at the size and angle it
 * will keep. Each run starts at 1 and 0 (probe blocks/p204).
 *
 * Scale is uniform (see {@link InsertEntity}).
 *
 * A block with attributes then asks for their values at the command line
 * (ATTDIA 0), and the reference is added only once they are all given: one
 * insertion, one undo step, and Escape part-way cancels the whole of it.
 *
 * Not done: inserting an external drawing file (there is no file to browse to
 * here, which is also what makes INSUNITS moot — a block defined in this
 * drawing is already in its units); Basepoint, Corner, XYZ, Explode and Repeat.
 */
export class InsertTool implements Tool {
  readonly id = "insert"

  private state: InsertState = { phase: "name" }
  private lastScreen: Vec2 | null = null
  /** INSNAME: per drawing, not saved (rectang/p303). */
  private blockId = ""
  private scale = 1
  private rotation = 0

  onNewDrawing(): void {
    this.blockId = ""
  }

  onActivate(ctx: ToolContext): void {
    this.scale = 1
    this.rotation = 0
    ctx.setCursor("crosshair")
    ctx.selection.clear()
    this.enterName(ctx)
  }

  onDeactivate(ctx: ToolContext): void {
    this.state = { phase: "name" }
    ctx.dynamicInput.close()
  }

  /**
   * Skips straight to the insertion point with `id` already chosen — how the
   * Blocks palette inserts, where the block was named by clicking it.
   */
  beginInsert(id: BlockId, ctx: ToolContext): void {
    if (!ctx.document.getBlock(id)) return
    this.blockId = id
    this.enterPoint(ctx)
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen
    if (this.state.phase === "point") {
      this.state = { phase: "point", cursor: input.point }
    }
    ctx.dynamicInput.setPosition(input.screen)
    ctx.requestRender()
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0 || this.state.phase !== "point") return
    this.place(input.point, ctx)
  }

  /**
   * -INSERT's questions. The X scale, Y scale and rotation AutoCAD asks after
   * the point are not asked yet (INSERT's Missing): the point places the
   * reference at Scale's and Rotate's values, 1 and 0 unless given.
   */
  question(): PromptId | ToolQuestion {
    switch (this.state.phase) {
      case "name":
        return this.blockId
          ? { id: "blockName", enter: { name: this.blockId } }
          : "blockName"
      case "list":
        return BLOCKS_TO_LIST
      case "point":
        return "insertionPoint"
      case "scale":
        return { id: "insertScale", enter: { name: factorText(this.scale) } }
      case "rotation":
        return {
          id: "insertRotation",
          enter: { angle: (this.rotation * 180) / Math.PI },
        }
      case "attributes":
        return this.state.prompts.question()
    }
  }

  /** As AutoCAD 2027's console refuses -INSERT's scale (probe blocks/p205). */
  takes(): QuestionInput | null {
    return this.state.phase === "scale"
      ? {
          refusal: "requiresDistance",
          values: { points: "two", keyword: "no" },
        }
      : null
  }

  commandOptions(): readonly CommandOption[] {
    switch (this.state.phase) {
      case "name":
        return [{ id: "?" }]
      case "point":
        return [{ id: "Scale" }, { id: "Rotate" }]
      default:
        return []
    }
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    if (this.state.phase === "name" && id === "?") {
      this.enterList(ctx)
      return "continue"
    }
    if (this.state.phase !== "point") return "unhandled"
    switch (id) {
      case "Scale":
        this.enterScale(ctx)
        return "continue"
      case "Rotate":
        this.enterRotation(ctx)
        return "continue"
      default:
        return "unhandled"
    }
  }

  /**
   * WHY none at Scale and Rotate: the runtime measures their two points,
   * asking ` Specify second point:` after the first (probe blocks/p236).
   */
  wantsSnap(): boolean {
    return this.state.phase !== "scale" && this.state.phase !== "rotation"
  }

  getConstraintAnchor(): Vec2 | null {
    return null
  }

  /**
   * The reference as it will be drawn: each object in its own colour, the
   * attributes showing their defaults, then the values given (desktop d06-7).
   */
  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    const state = this.state
    if (state.phase !== "point" && state.phase !== "attributes") return []
    const preview =
      state.phase === "point"
        ? this.pending(
            state.cursor,
            ctx,
            PREVIEW_ID,
            defaultAttributes(ctx.document.getBlock(this.blockId))
          )
        : this.pending(state.at, ctx, PREVIEW_ID, state.prompts.attributes())
    return insertFlatGeometry(
      withCurrentProperties(preview, ctx),
      ctx.blocks
    ).flatMap((piece) => drawn(ctx, piece, "plain"))
  }

  /** The reference as it stands at `at`. Shared by the preview and the commit. */
  private pending(
    at: Vec2 | Vec3,
    ctx: ToolContext,
    id?: EntityId,
    attributes?: readonly BlockAttribute[]
  ): InsertEntity {
    return onPlaneOf(
      createInsert(this.blockId, at, {
        scale: this.scale,
        rotation: ucsAngleToWorld(ctx.ucs, this.rotation),
        layerId: ctx.document.getCurrentLayerId(),
        attributes,
        id,
      }),
      at
    )
  }

  private place(at: Vec3, ctx: ToolContext): void {
    const block = ctx.document.getBlock(this.blockId)
    if (!block) return
    const prompts = new AttributeValuePrompts(block, (attributes, doneCtx) => {
      doneCtx.execute(
        new AddEntityCommand(
          withCurrentProperties(
            this.pending(at, doneCtx, undefined, attributes),
            doneCtx
          )
        )
      )
      doneCtx.endCommand()
    })
    this.state = { phase: "attributes", at, prompts }
    prompts.start(ctx)
  }

  private enterName(ctx: ToolContext): void {
    // INSNAME: the last block inserted, or else the last one defined.
    if (!ctx.document.getBlock(this.blockId)) {
      this.blockId = namedBlocks(ctx.document).at(-1)?.id ?? ""
    }
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
        // Enter with nothing typed keeps the last block, the `<default>`;
        // with none to offer it ends the command (probes blocks/p217, p238).
        if (typed.length === 0 && !this.blockId) {
          commitCtx.report(commitCtx.text.message("invalidBlockName"), "error")
          commitCtx.endCommand()
          return true
        }
        const name = typed.length === 0 ? this.blockId : typed
        // Case-blind, as every block name is: `b1` inserts B1 (p210).
        const block = isAnonymousBlock(name)
          ? undefined
          : findBlockNamed(commitCtx.document.getBlocks(), name)
        if (!block) {
          commitCtx.report(
            commitCtx.text.message("blockUndefined", { name }),
            "error"
          )
          this.enterName(commitCtx)
          return true
        }
        this.blockId = block.id
        this.enterPoint(commitCtx)
        return true
      },
    })
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  private enterList(ctx: ToolContext): void {
    this.state = { phase: "list" }
    askBlocksToList(ctx, "insert")
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  private enterPoint(ctx: ToolContext): void {
    this.state = {
      phase: "point",
      cursor: ctx.viewport.screenToWorld(this.lastScreen ?? { x: 0, y: 0 }),
    }
    ctx.dynamicInput.open({
      fields: [{ id: "point", prompt: "insertionPoint", kind: "coordinate" }],
      commit: () => {},
      commitRaw: (commitCtx) => {
        const typed = commitCtx.dynamicInput.getText("point").trim()
        // Enter is refused, and the point asked again (probe blocks/p216).
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
        this.place(point, commitCtx)
        return true
      },
    })
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  private enterScale(ctx: ToolContext): void {
    this.state = { phase: "scale" }
    ctx.dynamicInput.open({
      fields: [{ id: "scale", prompt: "insertScale", kind: "number" }],
      commit: (values, commitCtx) => {
        if (values.scale > 0) this.scale = values.scale
        this.enterPoint(commitCtx)
      },
      commitRaw: (commitCtx) => {
        // Enter with nothing typed keeps the current factor, the `<default>`.
        if (!commitCtx.dynamicInput.hasTypedText()) {
          this.enterPoint(commitCtx)
          return true
        }
        const typed = parseNumber(commitCtx.dynamicInput.getText("scale"))
        if (typed === null || !(typed > 0)) return false
        this.scale = typed
        this.enterPoint(commitCtx)
        return true
      },
    })
    ctx.dynamicInput.setDefault("scale", this.scale)
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }

  private enterRotation(ctx: ToolContext): void {
    this.state = { phase: "rotation" }
    ctx.dynamicInput.open({
      fields: [{ id: "rotation", prompt: "insertRotation", kind: "angle" }],
      commit: (values, commitCtx) => {
        this.rotation = (values.rotation * Math.PI) / 180
        this.enterPoint(commitCtx)
      },
      commitRaw: (commitCtx) => {
        // Enter with nothing typed keeps the current angle, the `<default>`.
        if (!commitCtx.dynamicInput.hasTypedText()) {
          this.enterPoint(commitCtx)
          return true
        }
        const typed = parseAngleDegrees(
          commitCtx.dynamicInput.getText("rotation")
        )
        if (typed === null) return false
        this.rotation = (typed * Math.PI) / 180
        this.enterPoint(commitCtx)
        return true
      },
    })
    ctx.dynamicInput.setDefault("rotation", (this.rotation * 180) / Math.PI)
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }
}

/**
 * The attributes a reference of `block` takes, at their defaults: what the
 * insertion's ghost shows before any value is asked.
 */
function defaultAttributes(
  block: BlockDefinition | undefined
): BlockAttribute[] | undefined {
  return block
    ? variableAttributes(block).map((definition) =>
        blockAttribute(definition, definition.value)
      )
    : undefined
}

/**
 * A scale factor as -INSERT's `<default>` writes it, C's `%g`: `<1>`,
 * `<2.5>`, six significant digits (probes blocks/p02, p204).
 */
function factorText(factor: number): string {
  return String(Number(factor.toPrecision(6)))
}

/** The blocks a user names: an array's anonymous block is none of them. */
export function namedBlocks(document: DocumentReader): BlockDefinition[] {
  return document.getBlocks().filter((block) => !isAnonymousBlock(block.name))
}

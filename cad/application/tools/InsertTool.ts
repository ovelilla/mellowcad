import { Vec2 } from "../../geometry/Vec2"
import { Vec3 } from "../../geometry/Vec3"
import {
  BlockAttribute,
  BlockId,
  EntityId,
  InsertEntity,
  createInsert,
  onPlaneOf,
} from "../../domain/entities"
import { parseNumber } from "../../domain/units"
import { ucsAngleToWorld } from "../../domain/ucs"
import { AddEntityCommand } from "../commands/entityCommands"
import { parseCoordinate } from "../input/coordinateInput"
import { entityScenePrimitive } from "../SceneBuilder"
import { ScenePrimitive } from "../../scene/types"
import { THEME } from "../../scene/theme"
import { AttributeValuePrompts } from "./attributeValues"
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

/** Reused so preview frames don't burn entity ids. */
const PREVIEW_ID: EntityId = "__insert_preview__"

type InsertState =
  | { readonly phase: "name" }
  | { readonly phase: "point"; readonly cursor: Vec2 }
  | { readonly phase: "scale" }
  | { readonly phase: "rotation" }
  | {
      readonly phase: "attributes"
      readonly at: Vec3
      readonly prompts: AttributeValuePrompts
    }

/**
 * AutoCAD's INSERT: places a reference to a block already defined in the
 * drawing. The block is named first (`?` lists what is defined), then the
 * insertion point, with **Scale** and **Rotate** offered as the keywords
 * -INSERT lists — each sets its value and returns to the point prompt, so the
 * reference is dragged in at the size and angle it will keep.
 *
 * Scale is uniform (see {@link InsertEntity}) and both values persist for the
 * session, so a run of identical symbols is placed by clicking.
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
  private blockId = ""
  private scale = 1
  private rotation = 0

  onActivate(ctx: ToolContext): void {
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
   * -INSERT's questions. WHY no X scale, Y scale and rotation after the point:
   * the point places the reference at the session's scale and angle, which
   * Scale and Rotate set beforehand.
   */
  question(): PromptId | ToolQuestion {
    switch (this.state.phase) {
      case "name":
        return this.blockId
          ? { id: "blockName", enter: { name: this.blockId } }
          : "blockName"
      case "point":
        return "insertionPoint"
      case "scale":
        return { id: "insertScale", enter: this.scale }
      case "rotation":
        return {
          id: "insertRotation",
          enter: { angle: (this.rotation * 180) / Math.PI },
        }
      case "attributes":
        return this.state.prompts.question()
    }
  }

  /** As AutoCAD 2023's console refuses -INSERT's scale. */
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
      this.listBlocks(ctx)
      this.enterName(ctx)
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

  getConstraintAnchor(): Vec2 | null {
    return null
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    const state = this.state
    if (state.phase !== "point" && state.phase !== "attributes") return []
    const preview =
      state.phase === "point"
        ? this.pending(state.cursor, ctx, PREVIEW_ID)
        : this.pending(state.at, ctx, PREVIEW_ID, state.prompts.attributes())
    return entityScenePrimitive(
      ctx.viewport,
      preview,
      { color: THEME.rubberBand, width: 1 },
      { blocks: ctx.blocks }
    )
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
      this.blockId = ctx.document.getBlocks().at(-1)?.id ?? ""
    }
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
        // Enter with nothing typed keeps the last block, the `<default>`.
        const name = typed.length === 0 ? this.blockId : typed
        if (!commitCtx.document.getBlock(name)) {
          commitCtx.report(
            commitCtx.text.message("blockUndefined", { name }),
            "error"
          )
          this.enterName(commitCtx)
          return true
        }
        this.blockId = name
        this.enterPoint(commitCtx)
        return true
      },
    })
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  private listBlocks(ctx: ToolContext): void {
    const blocks = ctx.document.getBlocks()
    ctx.report(
      blocks.length === 0
        ? ctx.text.message("noBlocks")
        : blocks.map((block) => block.name).join("\n")
    )
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
        const point = parseCoordinate(
          commitCtx.dynamicInput.getText("point").trim(),
          {
            lastPoint: null,
            relativeByDefault: false,
            ucs: commitCtx.ucs,
            elevation: commitCtx.elevation,
          }
        )
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
        const typed = parseNumber(commitCtx.dynamicInput.getText("rotation"))
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

import { Vec2 } from "../../geometry/Vec2"
import {
  BlockId,
  EntityId,
  InsertEntity,
  createInsert,
} from "../../domain/entities"
import { parseNumber } from "../../domain/units"
import { AddEntityCommand } from "../commands/entityCommands"
import { parseCoordinate } from "../input/coordinateInput"
import { entityScenePrimitive } from "../SceneBuilder"
import { ScenePrimitive } from "../../scene/types"
import { THEME } from "../../scene/theme"
import {
  CommandOption,
  CommandOptionOutcome,
  PointerInput,
  Tool,
  ToolContext,
} from "./Tool"

/** Reused so preview frames don't burn entity ids. */
const PREVIEW_ID: EntityId = "__insert_preview__"

type InsertState =
  | { readonly phase: "name" }
  | { readonly phase: "point"; readonly cursor: Vec2 }
  | { readonly phase: "scale" }
  | { readonly phase: "rotation" }

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
 * Not done: inserting an external drawing file (there is no file to browse to
 * here, which is also what makes INSUNITS moot — a block defined in this
 * drawing is already in its units); Basepoint, Corner, XYZ, Explode and Repeat.
 */
export class InsertTool implements Tool {
  readonly id = "insert"
  readonly label = "Insert block"

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

  commandOptions(): readonly CommandOption[] {
    return this.state.phase === "point"
      ? [
          { key: "S", label: "Scale" },
          { key: "R", label: "Rotate" },
        ]
      : []
  }

  invokeOption(key: string, ctx: ToolContext): CommandOptionOutcome {
    if (this.state.phase !== "point") return "unhandled"
    switch (key.toLowerCase()) {
      case "s":
        this.enterScale(ctx)
        return "continue"
      case "r":
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
    if (this.state.phase !== "point") return []
    return entityScenePrimitive(
      ctx.viewport,
      this.pending(this.state.cursor, ctx, PREVIEW_ID),
      { color: THEME.rubberBand, width: 1 },
      { blocks: ctx.blocks }
    )
  }

  /** The reference as it stands at `at`. Shared by the preview and the commit. */
  private pending(at: Vec2, ctx: ToolContext, id?: EntityId): InsertEntity {
    return createInsert(this.blockId, at, {
      scale: this.scale,
      rotation: this.rotation,
      layerId: ctx.document.getCurrentLayerId(),
      id,
    })
  }

  private place(at: Vec2, ctx: ToolContext): void {
    ctx.execute(new AddEntityCommand(this.pending(at, ctx)))
    ctx.endCommand()
  }

  private enterName(ctx: ToolContext): void {
    this.state = { phase: "name" }
    ctx.dynamicInput.open({
      fields: [{ id: "name", label: "Enter block name or [?]", kind: "text" }],
      commit: () => {},
      commitRaw: (commitCtx) => {
        const typed = commitCtx.dynamicInput.getText("name").trim()
        const blocks = commitCtx.document.getBlocks()
        if (typed === "?") {
          commitCtx.report(
            blocks.length === 0
              ? "No blocks defined."
              : blocks.map((block) => block.name).join("\n")
          )
          this.enterName(commitCtx)
          return true
        }
        // Enter with nothing typed keeps the last block, the `<default>`.
        const name = typed.length === 0 ? this.blockId : typed
        if (!commitCtx.document.getBlock(name)) {
          commitCtx.report(`Block "${name}" is not defined.`, "error")
          this.enterName(commitCtx)
          return true
        }
        this.blockId = name
        this.enterPoint(commitCtx)
        return true
      },
    })
    ctx.dynamicInput.setText("name", this.blockId)
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  private enterPoint(ctx: ToolContext): void {
    this.state = {
      phase: "point",
      cursor: ctx.viewport.screenToWorld(this.lastScreen ?? { x: 0, y: 0 }),
    }
    ctx.dynamicInput.open({
      fields: [
        { id: "point", label: "Specify insertion point", kind: "coordinate" },
      ],
      commit: () => {},
      commitRaw: (commitCtx) => {
        const point = parseCoordinate(
          commitCtx.dynamicInput.getText("point").trim(),
          { lastPoint: null, relativeByDefault: false }
        )
        if (point) this.place(point, commitCtx)
        return true
      },
    })
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  private enterScale(ctx: ToolContext): void {
    this.state = { phase: "scale" }
    ctx.dynamicInput.open({
      fields: [{ id: "scale", label: "Specify scale factor", kind: "number" }],
      commit: (values, commitCtx) => {
        if (values.scale > 0) this.scale = values.scale
        this.enterPoint(commitCtx)
      },
      commitRaw: (commitCtx) => {
        // Enter with nothing typed keeps the current factor, the `<default>`.
        const typed = parseNumber(commitCtx.dynamicInput.getText("scale"))
        if (typed !== null && typed > 0) this.scale = typed
        this.enterPoint(commitCtx)
        return true
      },
    })
    ctx.dynamicInput.setLive("scale", this.scale)
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }

  private enterRotation(ctx: ToolContext): void {
    this.state = { phase: "rotation" }
    ctx.dynamicInput.open({
      fields: [
        { id: "rotation", label: "Specify rotation angle", kind: "angle" },
      ],
      commit: (values, commitCtx) => {
        this.rotation = (values.rotation * Math.PI) / 180
        this.enterPoint(commitCtx)
      },
      commitRaw: (commitCtx) => {
        // Enter with nothing typed keeps the current angle, the `<default>`.
        const typed = parseNumber(commitCtx.dynamicInput.getText("rotation"))
        if (typed !== null) this.rotation = (typed * Math.PI) / 180
        this.enterPoint(commitCtx)
        return true
      },
    })
    ctx.dynamicInput.setLive("rotation", (this.rotation * 180) / Math.PI)
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
    ctx.requestRender()
  }
}

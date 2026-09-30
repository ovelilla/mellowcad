import { Vec2 } from "../../geometry/Vec2"
import { Vec3, sub3 } from "../../geometry/Vec3"
import { BlockLookup, translateEntity } from "../../domain/entities"
import { ScenePrimitive } from "../../scene/types"
import { THEME } from "../../scene/theme"
import { ClipboardFragment } from "../../serialization/clipboardFile"
import { planPaste } from "../clipboard"
import { PasteCommand } from "../commands/clipboardCommands"
import { parseCoordinate } from "../input/coordinateInput"
import { entityScenePrimitive } from "../SceneBuilder"
import { PointerInput, Tool, ToolContext } from "./Tool"

type PasteState =
  | { readonly phase: "idle" }
  | { readonly phase: "point"; readonly cursor: Vec3 }

/**
 * AutoCAD's PASTECLIP: drags the clipboard fragment in by its base point and
 * drops it at an insertion point. Single-shot, and the pasted objects are left
 * selected, so a paste can be nudged straight away.
 *
 * The runtime drives it rather than the command line, because reading the
 * clipboard is asynchronous: it reads first and hands the fragment to
 * {@link begin}, the same way the Blocks palette names a block for INSERT.
 */
export class PasteTool implements Tool {
  readonly id = "paste"

  private fragment: ClipboardFragment | null = null
  private state: PasteState = { phase: "idle" }
  private lastScreen: Vec2 | null = null
  private lookup: BlockLookup = () => undefined

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    ctx.selection.clear()
  }

  onDeactivate(ctx: ToolContext): void {
    this.fragment = null
    this.state = { phase: "idle" }
    this.lookup = () => undefined
    ctx.dynamicInput.close()
  }

  /** Starts placing `fragment`, once the runtime has read it. */
  begin(fragment: ClipboardFragment, ctx: ToolContext): void {
    this.fragment = fragment
    // A definition the drawing already has wins over the one in the fragment,
    // exactly as the paste itself resolves it — so the ghost is what lands.
    const carried = new Map(
      fragment.drawing.blocks.map((block) => [block.id, block])
    )
    this.lookup = (id) => ctx.document.getBlock(id) ?? carried.get(id)

    const screen = this.lastScreen ?? { x: 0, y: 0 }
    this.state = {
      phase: "point",
      cursor: {
        ...ctx.viewport.screenToWorld(screen),
        z: ctx.ucs.origin.z + ctx.elevation,
      },
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
        if (point) this.place(point, commitCtx)
        return true
      },
    })
    ctx.dynamicInput.setPosition(screen)
    ctx.requestRender()
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

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    if (this.state.phase !== "point" || !this.fragment) return []
    const delta = sub3(this.state.cursor, this.fragment.basePoint)
    return this.fragment.drawing.entities.flatMap((entity) =>
      entityScenePrimitive(
        ctx.viewport,
        // The ghost keeps the fragment's ids: it never reaches the document,
        // and the paste itself mints fresh ones.
        translateEntity(entity, delta),
        { color: THEME.rubberBand, width: 1 },
        { blocks: this.lookup }
      )
    )
  }

  private place(at: Vec3, ctx: ToolContext): void {
    if (!this.fragment) return
    const plan = planPaste(this.fragment, ctx.document, at)
    ctx.execute(new PasteCommand(plan))
    ctx.selection.set(plan.entities.map((entity) => entity.id))
    ctx.endCommand()
  }
}

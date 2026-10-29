import { Vec2 } from "../../geometry/Vec2"
import { Vec3, sub3 } from "../../geometry/Vec3"
import { BlockLookup, translateEntity } from "../../domain/entities"
import { Layer, LayerId } from "../../domain/layers"
import { ScenePrimitive } from "../../scene/types"
import { ClipboardFragment } from "../../serialization/clipboardFile"
import { PastePlan, planPaste } from "../clipboard"
import { PasteCommand } from "../commands/clipboardCommands"
import { parseCoordinate } from "../input/coordinateInput"
import type { PromptId } from "../../locales/types"
import { drawn } from "./ghostLook"
import { PointerInput, QuestionInput, Tool, ToolContext } from "./Tool"

type PasteState =
  | { readonly phase: "idle" }
  | { readonly phase: "point"; readonly cursor: Vec3 }

/**
 * AutoCAD's PASTECLIP: drags the clipboard fragment in by its base point and
 * drops it at an insertion point. Single-shot; what it pasted is left
 * unselected, as the Previous set.
 *
 * The runtime drives it rather than the command line, because reading the
 * clipboard is asynchronous: it reads first and hands the fragment to
 * {@link begin}, the same way the Blocks palette names a block for INSERT.
 */
export class PasteTool implements Tool {
  readonly id = "paste"

  private fragment: ClipboardFragment | null = null
  /** The paste worked out at the base point, once: the ghost and the commit. */
  private plan: PastePlan | null = null
  private state: PasteState = { phase: "idle" }
  private lastScreen: Vec2 | null = null
  private lookup: BlockLookup = () => undefined
  private layerOf: (id: LayerId) => Layer | undefined = () => undefined

  /** PASTECLIP is registered as a command, not as this tool's. */
  runningCommand(): string {
    return "PASTECLIP"
  }

  question(): PromptId | null {
    return this.state.phase === "point" ? "specifyInsertionPoint" : null
  }

  // WHY declared: the point is INSERT's jig, whose keywords (Scale, Rotate,
  // Basepoint…) are hidden, so `FOO` and Enter get the refusal of a point
  // with keywords though the prompt lists none; a Z is taken (desktop
  // clipboard/d02: `udKWORD, udDRAG, udGETZ`).
  takes(): QuestionInput {
    return { refusal: "pointOrKeywordRequired" }
  }

  /** LASTPOINT is the insertion point (desktop clipboard/d01). */
  setsLastPoint(): boolean {
    return true
  }

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    ctx.selection.clear()
  }

  onDeactivate(ctx: ToolContext): void {
    this.fragment = null
    this.plan = null
    this.state = { phase: "idle" }
    this.lookup = () => undefined
    this.layerOf = () => undefined
    ctx.dynamicInput.close()
  }

  /** Starts placing `fragment`, once the runtime has read it. */
  begin(fragment: ClipboardFragment, ctx: ToolContext): void {
    this.fragment = fragment
    // Planned once at its own base point, so the ghost wears the layers and
    // definitions the paste lands on (a name the drawing has wins) and the
    // commit moves the very plan the ghost showed.
    const plan = planPaste(fragment, ctx.document, fragment.basePoint)
    this.plan = plan
    const blocks = new Map(plan.blocks.map((block) => [block.id, block]))
    this.lookup = (id) => ctx.document.getBlock(id) ?? blocks.get(id)
    const layers = new Map(plan.layers.map((layer) => [layer.id, layer]))
    this.layerOf = (id) => ctx.document.getLayer(id) ?? layers.get(id)

    const screen = this.lastScreen ?? { x: 0, y: 0 }
    this.state = {
      phase: "point",
      cursor: {
        ...ctx.viewport.screenToWorld(screen),
        z: ctx.ucs.origin.z + ctx.elevation,
      },
    }
    ctx.dynamicInput.open({
      fields: [
        { id: "point", prompt: "specifyInsertionPoint", kind: "coordinate" },
      ],
      commit: () => {},
      commitRaw: (commitCtx) => {
        const text = commitCtx.dynamicInput.getText("point").trim()
        // WHY Enter is refused and asked again: the point has no default
        // (desktop clipboard/d02).
        if (text === "") {
          commitCtx.report(
            commitCtx.text.message("pointOrKeywordRequired"),
            "error"
          )
          return true
        }
        const point = parseCoordinate(text, {
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

  /** The objects as they land, drawn as the drawing draws them (desktop clipboard/d04-3). */
  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    if (this.state.phase !== "point") return []
    const placed = this.placedAt(this.state.cursor)
    if (!placed) return []
    const tables = { layer: this.layerOf, blocks: this.lookup }
    return placed.entities.flatMap((entity) =>
      drawn(ctx, entity, "plain", tables)
    )
  }

  /** The plan with its base point moved to `at`. */
  private placedAt(at: Vec3): PastePlan | null {
    if (!this.fragment || !this.plan) return null
    const delta = sub3(at, this.fragment.basePoint)
    return {
      ...this.plan,
      entities: this.plan.entities.map((entity) =>
        translateEntity(entity, delta)
      ),
    }
  }

  private place(at: Vec3, ctx: ToolContext): void {
    const plan = this.placedAt(at)
    if (!plan) return
    ctx.execute(new PasteCommand(plan))
    // WHY Previous, none selected: no grips after a paste and `(ssget "_P")`
    // the pasted set (desktop clipboard/d01, d04-5, d04-6).
    ctx.rememberSelection(plan.entities.map((entity) => entity.id))
    ctx.endCommand()
  }
}

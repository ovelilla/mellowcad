import { Vec2 } from "../../geometry/Vec2"
import { Vec3 } from "../../geometry/Vec3"
import {
  BlockAttribute,
  BlockDefinition,
  Entity,
  EntityId,
  createBlockDefinition,
  createInsert,
  onPlaneOf,
  rotateEntity,
} from "../../domain/entities"
import { ucsRotation } from "../../domain/ucs"
import { CreateBlockCommand } from "../commands/blockCommands"
import { parseCoordinate } from "../input/coordinateInput"
import { entityScenePrimitive } from "../SceneBuilder"
import { ScenePrimitive } from "../../scene/types"
import { THEME } from "../../scene/theme"
import { boxSelect, buildSelectionBoxOverlay } from "./boxSelection"
import { AttributeValuePrompts } from "./attributeValues"
import { PointerInput, Tool, ToolContext } from "./Tool"

/** Screen-pixel movement past which a press-drag becomes a box selection. */
const DRAG_THRESHOLD_PX = 4

type BlockState =
  | { readonly phase: "name" }
  | { readonly phase: "base" }
  | { readonly phase: "select"; readonly hover: Entity | null }
  | {
      readonly phase: "pressed"
      readonly startWorld: Vec2
      readonly startScreen: Vec2
      readonly currentWorld: Vec2
      readonly subtract: boolean
    }
  | {
      readonly phase: "boxing"
      readonly startWorld: Vec2
      readonly currentWorld: Vec2
      readonly subtract: boolean
    }
  /** Converting to a reference: asking the values of its attributes. */
  | { readonly phase: "attributes" }

/**
 * AutoCAD's BLOCK: names some geometry, pins it to an insertion base point and
 * files it in the drawing's block table. The prompts are -BLOCK's, in order —
 * block name (with `?` to list what is already defined), insertion base point,
 * then the objects.
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

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("default")
    ctx.selection.clear()
    this.name = ""
    this.enterName(ctx)
  }

  onDeactivate(ctx: ToolContext): void {
    this.state = { phase: "name" }
    ctx.dynamicInput.close()
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    this.lastScreen = input.screen
    switch (this.state.phase) {
      case "select": {
        const hover = this.rolloverAt(input.world, ctx)
        if (hover?.id !== this.state.hover?.id) {
          this.state = { phase: "select", hover }
        }
        break
      }
      case "pressed": {
        const moved = Math.hypot(
          input.screen.x - this.state.startScreen.x,
          input.screen.y - this.state.startScreen.y
        )
        this.state =
          moved >= DRAG_THRESHOLD_PX
            ? {
                phase: "boxing",
                startWorld: this.state.startWorld,
                currentWorld: input.world,
                subtract: this.state.subtract,
              }
            : { ...this.state, currentWorld: input.world }
        break
      }
      case "boxing":
        this.state = { ...this.state, currentWorld: input.world }
        break
    }
    ctx.dynamicInput.setPosition(input.screen)
    ctx.requestRender()
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0) return
    if (this.state.phase === "base") {
      this.setBasePoint(input.point, ctx)
      return
    }
    if (this.state.phase !== "select") return
    this.state = {
      phase: "pressed",
      startWorld: input.world,
      startScreen: input.screen,
      currentWorld: input.world,
      subtract: input.shiftKey,
    }
    ctx.requestRender()
  }

  onPointerUp(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0) return
    if (this.state.phase === "pressed") {
      const hit = ctx.pick(input.world)
      if (hit) this.applyPick([hit.id], this.state.subtract, ctx)
    } else if (this.state.phase === "boxing") {
      const ids = boxSelect(
        ctx.document,
        this.state.startWorld,
        this.state.currentWorld,
        ctx.viewport
      )
      this.applyPick(ids.slice().reverse(), this.state.subtract, ctx)
    } else {
      return
    }
    this.enterSelect(ctx)
    ctx.requestRender()
  }

  onEnter(ctx: ToolContext): boolean {
    if (this.state.phase !== "select" || ctx.selection.isEmpty()) return false
    this.commit(ctx)
    return true
  }

  wantsSnap(): boolean {
    return this.state.phase === "base"
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    if (this.state.phase === "boxing") {
      return buildSelectionBoxOverlay(
        ctx.viewport,
        this.state.startWorld,
        this.state.currentWorld
      )
    }
    if (this.state.phase !== "select" || !this.state.hover) return []
    return entityScenePrimitive(
      ctx.viewport,
      this.state.hover,
      { color: THEME.entityHover, width: 2 },
      { blocks: ctx.blocks }
    )
  }

  private rolloverAt(world: Vec2, ctx: ToolContext): Entity | null {
    const hit = ctx.pick(world)
    return hit && !ctx.selection.has(hit.id) ? hit : null
  }

  private applyPick(
    ids: readonly EntityId[],
    subtract: boolean,
    ctx: ToolContext
  ): void {
    for (const id of ids) {
      if (subtract) ctx.selection.remove(id)
      else ctx.selection.add(id)
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
          const blocks = commitCtx.document.getBlocks()
          commitCtx.report(
            blocks.length === 0
              ? commitCtx.text.message("noBlocks")
              : blocks.map((block) => block.name).join("\n")
          )
          this.enterName(commitCtx)
          return true
        }
        if (typed.length === 0) {
          this.enterName(commitCtx)
          return true
        }
        this.name = typed
        this.enterBase(commitCtx)
        return true
      },
    })
    ctx.dynamicInput.setText("name", this.name)
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
          { lastPoint: null, relativeByDefault: false, ucs: commitCtx.ucs }
        )
        if (point) this.setBasePoint(point, commitCtx)
        return true
      },
    })
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
  }

  private setBasePoint(point: Vec3, ctx: ToolContext): void {
    this.basePoint = point
    this.enterSelect(ctx)
    ctx.requestRender()
  }

  private enterSelect(ctx: ToolContext): void {
    this.state = {
      phase: "select",
      hover: this.state.phase === "select" ? this.state.hover : null,
    }
    // A keyword-only prompt: no field means the canvas keeps focus, so Enter
    // reaches `onEnter` to close the selection set.
    ctx.dynamicInput.open({ fields: [], commit: () => {} })
    ctx.dynamicInput.setPosition(this.lastScreen ?? { x: 0, y: 0 })
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
      const reference = onPlaneOf(
        createInsert(block.id, this.basePoint, {
          rotation: turn,
          layerId: doneCtx.document.getCurrentLayerId(),
          attributes,
        }),
        this.basePoint
      )
      doneCtx.execute(new CreateBlockCommand(block, ids, reference))
      doneCtx.selection.set([reference.id])
      doneCtx.endCommand()
    }
    this.state = { phase: "attributes" }
    new AttributeValuePrompts(block, convert).start(ctx)
  }
}

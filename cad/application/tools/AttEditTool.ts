import { Vec2 } from "../../geometry/Vec2"
import {
  Entity,
  EntityId,
  InsertEntity,
  attributeInput,
  attributePrompt,
} from "../../domain/entities"
import { UpdateEntityCommand } from "../commands/entityCommands"
import { entityScenePrimitive } from "../SceneBuilder"
import { ScenePrimitive } from "../../scene/types"
import { THEME } from "../../scene/theme"
import { PointerInput, Tool, ToolContext } from "./Tool"

/** Which of AutoCAD's two attribute editors the command stands in for. */
export type AttributeEditor = "attedit" | "eattedit"

type AttEditState =
  | { readonly phase: "select"; readonly hover: InsertEntity | null }
  | { readonly phase: "edit"; readonly target: InsertEntity }

/**
 * AutoCAD's ATTEDIT and EATTEDIT: pick a block reference and change the values
 * of its attributes. Both of AutoCAD's dialogs edit only the values — the Edit
 * Attributes box lists each attribute by its prompt, the Enhanced Attribute
 * Editor's Attribute tab by its tag — so here each is the dynamic-input box
 * with one field per attribute, labelled the same way: Tab moves between them,
 * Enter is OK and Escape is Cancel. Double-clicking a reference with attributes
 * opens EATTEDIT, as it does in AutoCAD.
 *
 * Only a reference that has attributes is offered, so a pick never lands on
 * one there is nothing to edit in.
 */
export class AttEditTool implements Tool {
  readonly id = "attedit"

  private state: AttEditState = { phase: "select", hover: null }
  private editor: AttributeEditor = "attedit"

  /** Switches to EATTEDIT's labels for this run; the next activation resets it. */
  useEnhancedEditor(): void {
    this.editor = "eattedit"
  }

  runningCommand(): string {
    return this.editor === "eattedit" ? "EATTEDIT" : "ATTEDIT"
  }

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    ctx.selection.clear()
    this.editor = "attedit"
    this.enterSelect(ctx)
  }

  onDeactivate(ctx: ToolContext): void {
    this.state = { phase: "select", hover: null }
    ctx.dynamicInput.close()
  }

  /** Opens `insert` straight away — the double-click entry point. */
  beginEdit(insert: InsertEntity, ctx: ToolContext): void {
    this.editor = "eattedit"
    this.state = { phase: "edit", target: insert }
    this.openEditor(insert, ctx)
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    ctx.dynamicInput.setPosition(input.screen)
    if (this.state.phase !== "select") return
    const hover = this.pickReference(input.world, ctx)
    if (hover?.id !== this.state.hover?.id) {
      this.state = { phase: "select", hover }
    }
    ctx.requestRender()
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0 || this.state.phase !== "select") return
    const target = this.pickReference(input.world, ctx)
    if (target) this.beginEditing(target, ctx)
  }

  wantsSnap(): boolean {
    return false
  }

  hiddenEntityIds(): readonly EntityId[] {
    return this.state.phase === "edit" ? [this.state.target.id] : []
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    if (this.state.phase === "select") {
      return this.state.hover
        ? entityScenePrimitive(
            ctx.viewport,
            this.state.hover,
            { color: THEME.selected, width: 2 },
            { blocks: ctx.blocks }
          )
        : []
    }
    return entityScenePrimitive(
      ctx.viewport,
      this.edited(this.state.target, ctx),
      { color: THEME.rubberBand, width: 1 },
      { blocks: ctx.blocks }
    )
  }

  private beginEditing(target: InsertEntity, ctx: ToolContext): void {
    this.state = { phase: "edit", target }
    this.openEditor(target, ctx)
    ctx.requestRender()
  }

  private enterSelect(ctx: ToolContext): void {
    this.state = { phase: "select", hover: null }
    ctx.dynamicInput.open({ fields: [], commit: () => {} })
  }

  private pickReference(world: Vec2, ctx: ToolContext): InsertEntity | null {
    const hit: Entity | null = ctx.pick(world)
    return hit?.type === "insert" && (hit.attributes?.length ?? 0) > 0
      ? hit
      : null
  }

  private openEditor(target: InsertEntity, ctx: ToolContext): void {
    const block = ctx.document.getBlock(target.blockId)
    const attributes = target.attributes ?? []
    ctx.dynamicInput.open({
      fields: attributes.map((attribute, index) => {
        const definition = block?.entities.find(
          (entity) => entity.type === "attdef" && entity.tag === attribute.tag
        )
        return {
          id: fieldId(index),
          label:
            this.editor === "eattedit" || definition?.type !== "attdef"
              ? attribute.tag
              : attributePrompt(definition),
          kind: "text" as const,
        }
      }),
      commit: () => {},
      commitRaw: (commitCtx) => {
        this.commit(commitCtx)
        commitCtx.endCommand()
        return true
      },
    })
    attributes.forEach((attribute, index) =>
      ctx.dynamicInput.setText(fieldId(index), attribute.value)
    )
  }

  /** The reference with the values in the box. */
  private edited(target: InsertEntity, ctx: ToolContext): InsertEntity {
    return {
      ...target,
      attributes: (target.attributes ?? []).map((attribute, index) => ({
        ...attribute,
        value: attributeInput(ctx.dynamicInput.getText(fieldId(index))),
      })),
    }
  }

  private commit(ctx: ToolContext): void {
    if (this.state.phase !== "edit") return
    const target = this.state.target
    const next = this.edited(target, ctx)
    this.state = { phase: "select", hover: null }
    const changed = (next.attributes ?? []).some(
      (attribute, index) => attribute.value !== target.attributes?.[index].value
    )
    if (changed) ctx.execute(new UpdateEntityCommand(next))
  }
}

function fieldId(index: number): string {
  return `attribute-${index}`
}

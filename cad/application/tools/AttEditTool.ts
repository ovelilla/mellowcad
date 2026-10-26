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
import type { MessageId } from "../EngineText"
import type { PromptId } from "../../locales/types"
import { PointerInput, QuestionInput, Tool, ToolContext } from "./Tool"
import { typedPick } from "./typedPick"

/** Which of AutoCAD's two attribute editors the command stands in for. */
export type AttributeEditor = "attedit" | "eattedit"

type AttEditState =
  | { readonly phase: "select"; readonly hover: Entity | null }
  | { readonly phase: "edit"; readonly box: AttributeEditBox }

/**
 * Each editor's question and refusals: ATTEDIT's from atteditRes.dll (1, 3,
 * 4), EATTEDIT's from AcEAtteditRes.dll (43, 38, 37), both as the desktop
 * writes them (desktop d05).
 */
const WORDS: Readonly<
  Record<
    AttributeEditor,
    {
      readonly question: PromptId
      readonly notABlock: MessageId
      readonly noAttributes: MessageId
    }
  >
> = {
  attedit: {
    question: "selectBlockReference",
    notABlock: "objectNotABlock",
    noAttributes: "blockHasNoEditableAttributes",
  },
  eattedit: {
    question: "selectABlock",
    notABlock: "selectedEntityNotABlock",
    noAttributes: "selectedBlockHasNoEditableAttributes",
  },
}

/**
 * AutoCAD's ATTEDIT and EATTEDIT: pick a block reference and change the values
 * of its attributes. ATTEDIT asks `Select block reference:` and EATTEDIT
 * `Select a block:`; a pick on anything but a reference with attributes is
 * refused in each one's words and the question asked again (desktop d05).
 * Both of AutoCAD's dialogs edit only the values — the Edit Attributes box
 * lists each attribute by its prompt, the Enhanced Attribute Editor's
 * Attribute tab by its tag — so here each is the dynamic-input box with one
 * field per attribute, labelled the same way: Tab moves between them, Enter
 * is OK and Escape is Cancel. Double-clicking a reference with attributes
 * runs EATTEDIT on it, as it does in AutoCAD ({@link startOn}).
 */
export class AttEditTool implements Tool {
  readonly id = "attedit"

  private state: AttEditState = { phase: "select", hover: null }
  private editor: AttributeEditor = "attedit"
  /** Set by {@link startOn}, read once by the next activation. */
  private enhanced = false

  /** Switches to EATTEDIT's words for this run; the next activation resets it. */
  useEnhancedEditor(): void {
    this.editor = "eattedit"
  }

  /**
   * The run a double-click starts is EATTEDIT's (`^C^C_eattedit`, desktop
   * d04). Called before the tool is activated.
   */
  startOn(): void {
    this.enhanced = true
  }

  runningCommand(): string {
    return this.editor === "eattedit" ? "EATTEDIT" : "ATTEDIT"
  }

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("crosshair")
    ctx.selection.clear()
    this.editor = this.enhanced ? "eattedit" : "attedit"
    this.enhanced = false
    this.enterSelect(ctx)
  }

  onDeactivate(ctx: ToolContext): void {
    this.state = { phase: "select", hover: null }
    ctx.dynamicInput.close()
  }

  /** The editor names no question: AutoCAD's dialog asks none. */
  question(): PromptId | null {
    return this.state.phase === "select" ? WORDS[this.editor].question : null
  }

  /** A single object's pick. */
  takes(): QuestionInput | null {
    return this.state.phase === "select" ? "object" : null
  }

  /** A point typed at the pick is a pick there. */
  answerTyped(text: string, ctx: ToolContext): boolean {
    if (this.state.phase !== "select") return false
    const point = typedPick(text, ctx)
    if (point === null) return false
    this.pickAt(point, ctx)
    return true
  }

  /** Opens `insert` at once: the double-click's pick. */
  beginEdit(insert: InsertEntity, ctx: ToolContext): void {
    this.beginEditing(insert, ctx)
  }

  onPointerMove(input: PointerInput, ctx: ToolContext): void {
    ctx.dynamicInput.setPosition(input.screen)
    if (this.state.phase !== "select") return
    // AutoCAD highlights whatever the pick box covers, as a single object's
    // pick does; what is not a reference with attributes is refused on the
    // pick.
    const hover = ctx.pick(input.world)
    if (hover?.id !== this.state.hover?.id) {
      this.state = { phase: "select", hover }
    }
    ctx.requestRender()
  }

  onPointerDown(input: PointerInput, ctx: ToolContext): void {
    if (input.button !== 0 || this.state.phase !== "select") return
    this.pickAt(input.world, ctx)
  }

  wantsSnap(): boolean {
    return false
  }

  hiddenEntityIds(): readonly EntityId[] {
    return this.state.phase === "edit" ? [this.state.box.target.id] : []
  }

  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    if (this.state.phase === "select") {
      return this.state.hover
        ? entityScenePrimitive(
            ctx.viewport,
            this.state.hover,
            { color: THEME.entityHover, width: 2 },
            { blocks: ctx.blocks }
          )
        : []
    }
    return this.state.box.buildOverlay(ctx)
  }

  /**
   * The pick at `world`: a reference with attributes opens the editor; any
   * other object is refused in the editor's words and the question asked
   * again (desktop d05). A pick on nothing asks again in silence.
   */
  private pickAt(world: Vec2, ctx: ToolContext): void {
    const hit = ctx.pick(world)
    if (!hit) return
    const words = WORDS[this.editor]
    if (hit.type !== "insert") {
      ctx.report(ctx.text.message(words.notABlock), "error")
    } else if ((hit.attributes?.length ?? 0) === 0) {
      ctx.report(ctx.text.message(words.noAttributes), "error")
    } else {
      this.beginEditing(hit, ctx)
    }
  }

  private beginEditing(target: InsertEntity, ctx: ToolContext): void {
    const box = new AttributeEditBox(
      target,
      this.editor === "eattedit" ? "tag" : "prompt"
    )
    this.state = { phase: "edit", box }
    box.open(ctx, (doneCtx) => {
      this.state = { phase: "select", hover: null }
      box.commit(doneCtx)
      doneCtx.endCommand()
    })
    ctx.requestRender()
  }

  private enterSelect(ctx: ToolContext): void {
    this.state = { phase: "select", hover: null }
    ctx.dynamicInput.open({ fields: [], commit: () => {} })
  }
}

/**
 * ATTEDIT's box on one reference: a field per attribute, in the reference's
 * order, labelled by its prompt (Edit Attributes) or its tag (the Enhanced
 * Attribute Editor), each holding its value. Enter is OK; Escape, Cancel,
 * leaves the reference as it was. BLOCK's Convert opens it too (BLOCKS-D90).
 */
export class AttributeEditBox {
  constructor(
    readonly target: InsertEntity,
    private readonly labels: "prompt" | "tag"
  ) {}

  /** Opens the box; `onOk` runs at Enter. */
  open(ctx: ToolContext, onOk: (ctx: ToolContext) => void): void {
    const block = ctx.document.getBlock(this.target.blockId)
    const attributes = this.target.attributes ?? []
    ctx.dynamicInput.open({
      fields: attributes.map((attribute, index) => {
        const definition = block?.entities.find(
          (entity) => entity.type === "attdef" && entity.tag === attribute.tag
        )
        return {
          id: fieldId(index),
          label:
            this.labels === "tag" || definition?.type !== "attdef"
              ? attribute.tag
              : attributePrompt(definition),
          kind: "text" as const,
        }
      }),
      commit: () => {},
      commitRaw: (commitCtx) => {
        onOk(commitCtx)
        return true
      },
    })
    attributes.forEach((attribute, index) =>
      ctx.dynamicInput.setText(fieldId(index), attribute.value)
    )
  }

  /** The reference as the box would leave it, drawn in place of the original. */
  buildOverlay(ctx: ToolContext): ScenePrimitive[] {
    return entityScenePrimitive(
      ctx.viewport,
      this.edited(ctx),
      { color: THEME.rubberBand, width: 1 },
      { blocks: ctx.blocks }
    )
  }

  /** Applies the values in the box, if any changed. */
  commit(ctx: ToolContext): void {
    const next = this.edited(ctx)
    const changed = (next.attributes ?? []).some(
      (attribute, index) =>
        attribute.value !== this.target.attributes?.[index].value
    )
    if (changed) ctx.execute(new UpdateEntityCommand(next))
  }

  /** The reference with the values in the box. */
  private edited(ctx: ToolContext): InsertEntity {
    return {
      ...this.target,
      attributes: (this.target.attributes ?? []).map((attribute, index) => ({
        ...attribute,
        value: attributeInput(ctx.dynamicInput.getText(fieldId(index))),
      })),
    }
  }
}

function fieldId(index: number): string {
  return `attribute-${index}`
}

import {
  AttributeDefinitionEntity,
  BlockAttribute,
  BlockDefinition,
  attributeInput,
  attributePrompt,
  blockAttribute,
  variableAttributes,
} from "../../domain/entities"
import { ToolContext, ToolQuestion } from "./Tool"

/**
 * INSERT's attribute prompts as ATTDIA 0 asks them: `Enter attribute values`,
 * then `<prompt> <default>:` for every attribute that is neither constant nor
 * preset, in the order the block's definitions were selected, and
 * `Verify attribute values` for the ones in Verify mode.
 *
 * The box is labelled with the attribute's own prompt and holds its default,
 * so Enter accepts it — the angle-bracketed default of the command line.
 */
export class AttributeValuePrompts {
  private readonly definitions: readonly AttributeDefinitionEntity[]
  private readonly values: string[]
  private queue: number[] = []
  private verifying = false

  constructor(
    block: BlockDefinition,
    private readonly onDone: (
      attributes: BlockAttribute[],
      ctx: ToolContext
    ) => void
  ) {
    this.definitions = variableAttributes(block)
    this.values = this.definitions.map((definition) => definition.value)
  }

  /** The reference's attributes with the values given so far. */
  attributes(): BlockAttribute[] {
    return this.definitions.map((definition, index) =>
      blockAttribute(definition, this.values[index])
    )
  }

  /**
   * The attribute being asked, in the drawing's own words: `Prompt one
   * <def1>:`, its default left out when it has none.
   */
  question(): ToolQuestion {
    const definition = this.definitions[this.queue[0] ?? 0]
    const value = this.values[this.queue[0] ?? 0]
    return {
      id: "attributeValuePrompt",
      values: { prompt: definition ? attributePrompt(definition) : "" },
      ...(value ? { enter: { name: value } } : {}),
    }
  }

  /** Asks the first question, or finishes at once when there is none to ask. */
  start(ctx: ToolContext): void {
    this.verifying = false
    this.queue = this.definitions
      .map((definition, index) => ({ definition, index }))
      .filter(({ definition }) => !definition.modes.preset)
      .map(({ index }) => index)
    if (this.queue.length === 0) {
      this.onDone(this.attributes(), ctx)
      return
    }
    ctx.report(ctx.text.message("enterAttributeValues"))
    this.ask(ctx)
  }

  private ask(ctx: ToolContext): void {
    const index = this.queue[0]
    const definition = this.definitions[index]
    ctx.dynamicInput.open({
      fields: [
        { id: "value", label: attributePrompt(definition), kind: "text" },
      ],
      commit: () => {},
      commitRaw: (commitCtx) => {
        const typed = commitCtx.dynamicInput.getText("value")
        // An empty answer is Enter at `<default>`, which keeps the default.
        if (typed.length > 0) this.values[index] = attributeInput(typed)
        this.advance(commitCtx)
        return true
      },
    })
    ctx.dynamicInput.setText("value", this.values[index])
  }

  private advance(ctx: ToolContext): void {
    this.queue.shift()
    if (this.queue.length > 0) {
      this.ask(ctx)
      return
    }
    if (!this.verifying) {
      this.verifying = true
      this.queue = this.definitions
        .map((definition, index) => ({ definition, index }))
        .filter(
          ({ definition }) =>
            definition.modes.verify && !definition.modes.preset
        )
        .map(({ index }) => index)
      if (this.queue.length > 0) {
        ctx.report(ctx.text.message("verifyAttributeValues"))
        this.ask(ctx)
        return
      }
    }
    this.onDone(this.attributes(), ctx)
  }
}

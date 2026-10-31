import { BlockDefinition, purgeableBlocks } from "../../domain/entities"
import type { PromptId } from "../../locales/types"
import { matchesWildcard } from "../../shared/wildcard"
import { PurgeBlocksCommand } from "../commands/blockCommands"
import {
  CommandOption,
  CommandOptionOutcome,
  QuestionInput,
  Tool,
  ToolContext,
  ToolQuestion,
} from "./Tool"

type PurgeState =
  | { readonly phase: "type" }
  | { readonly phase: "names" }
  | { readonly phase: "verify"; readonly found: readonly BlockDefinition[] }
  /** `Purge block "B1"? <N>`, asked of `found[index]`. */
  | {
      readonly phase: "each"
      readonly found: readonly BlockDefinition[]
      readonly index: number
      readonly yes: ReadonlySet<string>
    }

const YES_OR_NO: readonly CommandOption[] = [{ id: "Yes" }, { id: "No" }]

/**
 * AutoCAD's -PURGE, which PURGE runs too (BLOCKS-D2): PURGE's dialog is not
 * built, and AutoCAD's console runs PURGE as -PURGE (probes blocks/p151,
 * p152). The type prompt offers only Blocks, the one type built, and Enter
 * there ends (p04). Then the names `<*>`, matched case-blind (p140, p154),
 * and Verify: No names each block deleted and counts them (erase/p326,
 * p327); Yes asks `Purge block "B1"? <N>` of each and reports nothing (p141).
 * Unused blocks go, anonymous ones too (p147), a whole unused chain in one
 * run (p142), all as one undo step.
 */
export class PurgeTool implements Tool {
  readonly id = "purge"

  private state: PurgeState = { phase: "type" }

  onActivate(ctx: ToolContext): void {
    ctx.setCursor("default")
    ctx.selection.clear()
    ctx.report(ctx.text.message("purgeSettings"))
    this.ask({ phase: "type" }, ctx)
  }

  onDeactivate(ctx: ToolContext): void {
    this.state = { phase: "type" }
    ctx.dynamicInput.close()
  }

  question(): PromptId | ToolQuestion {
    const state = this.state
    switch (state.phase) {
      case "type":
        return "purgeType"
      case "names":
        return { id: "purgeNames", enter: { name: "*" }, takesSpaces: true }
      // WHY a phrase: the default is written as the letter, `<Y>` (es `<S>`).
      case "verify":
        return { id: "purgeVerify", enter: "undoYes" }
      // A yes-or-no question lists no keywords.
      case "each":
        return {
          id: "purgeBlock",
          enter: { name: "N" },
          values: { name: state.found[state.index].name },
        }
    }
  }

  takes(): QuestionInput | null {
    const { phase } = this.state
    return phase === "verify" || phase === "each"
      ? { refusal: "yesOrNoPlease" }
      : null
  }

  commandOptions(): readonly CommandOption[] {
    switch (this.state.phase) {
      case "type":
        return [{ id: "Blocks" }]
      case "verify":
        return YES_OR_NO
      case "each":
        return YES_OR_NO.map((option) => ({ ...option, hidden: true }))
      case "names":
        return []
    }
  }

  invokeOption(id: string, ctx: ToolContext): CommandOptionOutcome {
    const state = this.state
    if (state.phase === "type" && id === "Blocks") {
      this.askNames(ctx)
      return "continue"
    }
    if (state.phase === "verify" && (id === "Yes" || id === "No")) {
      return id === "Yes"
        ? this.askEach(state.found, 0, new Set(), ctx)
        : this.purgeReporting(state.found, ctx)
    }
    if (state.phase === "each" && (id === "Yes" || id === "No")) {
      return this.answerEach(id === "Yes", ctx)
    }
    return "unhandled"
  }

  /** Enter keeps Verify's Yes and a name's No; at the type it ends (p04). */
  onEnter(ctx: ToolContext): boolean {
    const state = this.state
    let outcome: CommandOptionOutcome | null = null
    if (state.phase === "verify") {
      outcome = this.askEach(state.found, 0, new Set(), ctx)
    } else if (state.phase === "each") {
      outcome = this.answerEach(false, ctx)
    }
    if (outcome === null) return false
    if (outcome === "end") ctx.endCommand()
    return true
  }

  wantsSnap(): boolean {
    return false
  }

  private ask(state: PurgeState, ctx: ToolContext): void {
    this.state = state
    ctx.dynamicInput.open({ fields: [], commit: () => {} })
  }

  private askNames(ctx: ToolContext): void {
    this.state = { phase: "names" }
    ctx.dynamicInput.open({
      fields: [{ id: "names", prompt: "purgeNames", kind: "text" }],
      commit: () => {},
      commitRaw: (commitCtx) => {
        const typed = commitCtx.dynamicInput.getText("names").trim()
        // A list of names is separated by commas, as AutoCAD's wild-card
        // matching reads one; Enter is every name.
        const patterns = (typed === "" ? "*" : typed)
          .split(",")
          .map((pattern) => pattern.trim())
          .filter((pattern) => pattern !== "")
        const found = purgeableBlocks(
          commitCtx.document.getBlocks(),
          commitCtx.document.getEntities(),
          (block) =>
            patterns.some((pattern) => matchesWildcard(block.name, pattern))
        )
        this.ask({ phase: "verify", found }, commitCtx)
        return true
      },
    })
  }

  private askEach(
    found: readonly BlockDefinition[],
    index: number,
    yes: ReadonlySet<string>,
    ctx: ToolContext
  ): CommandOptionOutcome {
    if (found.length === 0) {
      ctx.report(ctx.text.message("noUnreferencedBlocks"))
      return "end"
    }
    if (index < found.length) {
      this.ask({ phase: "each", found, index, yes }, ctx)
      return "continue"
    }
    // WHY again: a block answered Yes that one answered No still holds stays,
    // or the one kept would draw nothing (probe blocks/p150).
    const purged = purgeableBlocks(
      ctx.document.getBlocks(),
      ctx.document.getEntities(),
      (block) => yes.has(block.id)
    )
    this.state = { phase: "type" }
    if (purged.length > 0) {
      ctx.execute(new PurgeBlocksCommand(purged.map((block) => block.id)))
    }
    return "end"
  }

  private answerEach(purge: boolean, ctx: ToolContext): CommandOptionOutcome {
    const state = this.state
    if (state.phase !== "each") return "unhandled"
    const block = state.found[state.index]
    const yes = purge ? new Set([...state.yes, block.id]) : state.yes
    return this.askEach(state.found, state.index + 1, yes, ctx)
  }

  /** Verify No: each block is named as it goes, then counted (erase/p326). */
  private purgeReporting(
    found: readonly BlockDefinition[],
    ctx: ToolContext
  ): CommandOptionOutcome {
    this.state = { phase: "type" }
    if (found.length === 0) {
      ctx.report(ctx.text.message("noUnreferencedBlocks"))
      return "end"
    }
    ctx.execute(new PurgeBlocksCommand(found.map((block) => block.id)))
    for (const block of found) {
      ctx.report(ctx.text.message("deletingBlock", { name: block.name }))
    }
    ctx.report(ctx.text.message("blocksDeleted", { count: found.length }))
    return "end"
  }
}

import { BlockDefinition, purgeableBlocks } from "../../domain/entities"
import { Linetype } from "../../domain/linetypes"
import type { PromptId } from "../../locales/types"
import { matchesWildcard } from "../../shared/wildcard"
import { PurgeBlocksCommand } from "../commands/blockCommands"
import { LinetypeTableCommand } from "../commands/linetypeCommands"
import type { MessageId } from "../EngineText"
import {
  CommandOption,
  CommandOptionOutcome,
  QuestionInput,
  Tool,
  ToolContext,
  ToolQuestion,
} from "./Tool"

/** What a run purges: unused block definitions or unused linetypes. */
type Kind = "blocks" | "linetypes"

/** One entry it found, by the id it is deleted by and the name it is said by. */
interface Found {
  readonly id: string
  readonly name: string
}

type PurgeState =
  | { readonly phase: "type" }
  | { readonly phase: "names"; readonly kind: Kind }
  | {
      readonly phase: "verify"
      readonly kind: Kind
      readonly found: readonly Found[]
    }
  /** `Purge block "B1"? <N>`, asked of `found[index]`. */
  | {
      readonly phase: "each"
      readonly kind: Kind
      readonly found: readonly Found[]
      readonly index: number
      readonly yes: ReadonlySet<string>
    }

const YES_OR_NO: readonly CommandOption[] = [{ id: "Yes" }, { id: "No" }]

/** Each kind's words: the question of each entry and what Verify No reports. */
const WORDS: Readonly<
  Record<
    Kind,
    {
      readonly each: PromptId
      readonly deleting: MessageId
      readonly deleted: MessageId
      readonly none: MessageId
    }
  >
> = {
  blocks: {
    each: "purgeBlock",
    deleting: "deletingBlock",
    deleted: "blocksDeleted",
    none: "noUnreferencedBlocks",
  },
  linetypes: {
    each: "purgeLinetype",
    deleting: "deletingLinetype",
    deleted: "linetypesDeleted",
    none: "noUnreferencedLinetypes",
  },
}

/**
 * AutoCAD's -PURGE, which PURGE runs too (BLOCKS-D2): PURGE's dialog is not
 * built, and AutoCAD's console runs PURGE as -PURGE (probes blocks/p151,
 * p152). The type prompt offers the types built, Blocks and LTypes, and
 * Enter there ends (p04). Then the names `<*>`, matched case-blind (p140,
 * p154), and Verify: No names each one deleted and counts them (erase/p326,
 * p327; ltype/p04); Yes asks `Purge block "B1"? <N>` of each and reports
 * nothing (p141; ltype/p09). Unused blocks go, anonymous ones too (p147), a
 * whole unused chain in one run (p142); unused linetypes go, but Continuous,
 * the current one and one a layer or an object names, a block's included
 * (table 4454). All as one undo step.
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
          id: WORDS[state.kind].each,
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
        return [{ id: "Blocks" }, { id: "LTypes" }]
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
    if (state.phase === "type" && (id === "Blocks" || id === "LTypes")) {
      this.askNames(id === "Blocks" ? "blocks" : "linetypes", ctx)
      return "continue"
    }
    if (state.phase === "verify" && (id === "Yes" || id === "No")) {
      return id === "Yes"
        ? this.askEach(state.kind, state.found, 0, new Set(), ctx)
        : this.purgeReporting(state.kind, state.found, ctx)
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
      outcome = this.askEach(state.kind, state.found, 0, new Set(), ctx)
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

  private askNames(kind: Kind, ctx: ToolContext): void {
    this.state = { phase: "names", kind }
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
        const found = purgeable(kind, commitCtx, (name) =>
          patterns.some((pattern) => matchesWildcard(name, pattern))
        )
        this.ask({ phase: "verify", kind, found }, commitCtx)
        return true
      },
    })
  }

  private askEach(
    kind: Kind,
    found: readonly Found[],
    index: number,
    yes: ReadonlySet<string>,
    ctx: ToolContext
  ): CommandOptionOutcome {
    if (found.length === 0) {
      ctx.report(ctx.text.message(WORDS[kind].none))
      return "end"
    }
    if (index < found.length) {
      this.ask({ phase: "each", kind, found, index, yes }, ctx)
      return "continue"
    }
    // WHY again: a block answered Yes that one answered No still holds stays,
    // or the one kept would draw nothing (probe blocks/p150).
    const purged = purgeable(kind, ctx, (_, id) => yes.has(id))
    this.state = { phase: "type" }
    purge(kind, purged, ctx)
    return "end"
  }

  private answerEach(yes: boolean, ctx: ToolContext): CommandOptionOutcome {
    const state = this.state
    if (state.phase !== "each") return "unhandled"
    const entry = state.found[state.index]
    const chosen = yes ? new Set([...state.yes, entry.id]) : state.yes
    return this.askEach(state.kind, state.found, state.index + 1, chosen, ctx)
  }

  /** Verify No: each one is named as it goes, then counted (erase/p326, ltype/p04). */
  private purgeReporting(
    kind: Kind,
    found: readonly Found[],
    ctx: ToolContext
  ): CommandOptionOutcome {
    this.state = { phase: "type" }
    if (found.length === 0) {
      ctx.report(ctx.text.message(WORDS[kind].none))
      return "end"
    }
    purge(kind, found, ctx)
    for (const entry of found) {
      ctx.report(ctx.text.message(WORDS[kind].deleting, { name: entry.name }))
    }
    ctx.report(ctx.text.message(WORDS[kind].deleted, { count: found.length }))
    return "end"
  }
}

/** What PURGE may delete of `kind` among those `wanted` takes, in the table's order. */
function purgeable(
  kind: Kind,
  ctx: ToolContext,
  wanted: (name: string, id: string) => boolean
): Found[] {
  if (kind === "blocks") {
    return purgeableBlocks(
      ctx.document.getBlocks(),
      ctx.document.getEntities(),
      (block: BlockDefinition) => wanted(block.name, block.id)
    ).map((block) => ({ id: block.id, name: block.name }))
  }
  return ctx.document
    .getLinetypes()
    .filter(
      (linetype: Linetype) =>
        wanted(linetype.name, linetype.name) &&
        ctx.document.canRemoveLinetype(linetype.name)
    )
    .map((linetype) => ({ id: linetype.name, name: linetype.name }))
}

function purge(kind: Kind, found: readonly Found[], ctx: ToolContext): void {
  if (found.length === 0) return
  if (kind === "blocks") {
    ctx.execute(new PurgeBlocksCommand(found.map((entry) => entry.id)))
    return
  }
  const gone = new Set(found.map((entry) => entry.id))
  ctx.execute(
    new LinetypeTableCommand(
      ctx.document.getLinetypes().filter((linetype) => !gone.has(linetype.name))
    )
  )
}

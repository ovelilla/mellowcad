import { isAnonymousBlock, isXref } from "../../domain/entities"
import { matchesWildcard } from "../../shared/wildcard"
import { ToolContext, ToolQuestion } from "./Tool"

/** `?`'s question at -BLOCK's and -INSERT's name (probes blocks/p104, p02). */
export const BLOCKS_TO_LIST: ToolQuestion = {
  id: "blocksToList",
  enter: { name: "*" },
  takesSpaces: true,
}

/**
 * Whose table of counts closes the listing: -BLOCK's four columns or
 * -INSERT's two (table 20838, 20839; probes blocks/p104, p02).
 */
export type BlockCountsLayout = "block" | "insert"

/**
 * Opens `?`'s `Enter block(s) to list <*>:`, whose answer lists the blocks
 * and ends the command (probes blocks/p104, p105, p02, p238).
 */
export function askBlocksToList(
  ctx: ToolContext,
  layout: BlockCountsLayout
): void {
  ctx.dynamicInput.open({
    fields: [{ id: "names", prompt: "blocksToList", kind: "text" }],
    commit: () => {},
    commitRaw: (commitCtx) => {
      listBlocks(commitCtx.dynamicInput.getText("names"), layout, commitCtx)
      commitCtx.endCommand()
      return true
    },
  })
}

/**
 * `Defined blocks.`, each named block `typed` matches, quoted, and the
 * counts: the user blocks listed, and every anonymous one, which a pattern
 * does not filter (probe blocks/p156). WHY no `Press ENTER to continue:`:
 * that is the console's pager, and the history here scrolls.
 */
function listBlocks(
  typed: string,
  layout: BlockCountsLayout,
  ctx: ToolContext
): void {
  // A list of names is separated by commas, as AutoCAD's wild-card matching
  // reads one; Enter is every name.
  const patterns = (typed.trim() === "" ? "*" : typed)
    .split(",")
    .map((pattern) => pattern.trim())
    .filter((pattern) => pattern !== "")
  const blocks = ctx.document.getBlocks()
  // -INSERT's `?` lists no xref; -BLOCK's says each as not found, counted
  // under External References (probes xref/p10, p15).
  const listed = blocks.filter(
    (block) =>
      !isAnonymousBlock(block.name) &&
      (layout === "block" || !isXref(block)) &&
      patterns.some((pattern) => matchesWildcard(block.name, pattern))
  )
  const external = listed.filter((block) => isXref(block)).length
  const unnamed = blocks.filter((block) => isAnonymousBlock(block.name))
  // The table's `%5d` and `%6d`.
  const count = (n: number, width = 5) => String(n).padStart(width)
  const counts =
    layout === "block"
      ? ctx.text.message("blockCounts", {
          user: count(listed.length - external),
          external: count(external, 6),
          dependent: count(0),
          unnamed: count(unnamed.length),
        })
      : ctx.text.message("insertBlockCounts", {
          user: count(listed.length),
          unnamed: count(unnamed.length),
        })
  ctx.report(
    [
      ctx.text.message("definedBlocks"),
      ...listed.map((block) =>
        isXref(block)
          ? // The table's `%-31s` of the quoted name (20833).
            ctx.text.message("definedXref", {
              name: `"${block.name}"`.padEnd(31),
            })
          : ctx.text.message("definedBlock", { name: block.name })
      ),
      counts,
    ].join("\n")
  )
}

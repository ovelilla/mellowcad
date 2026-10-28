import { isAnonymousBlock } from "../../domain/entities"
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
  const listed = blocks.filter(
    (block) =>
      !isAnonymousBlock(block.name) &&
      patterns.some((pattern) => matchesWildcard(block.name, pattern))
  )
  const unnamed = blocks.filter((block) => isAnonymousBlock(block.name))
  // The table's `%5d` and `%6d`.
  const count = (n: number, width = 5) => String(n).padStart(width)
  const counts =
    layout === "block"
      ? ctx.text.message("blockCounts", {
          user: count(listed.length),
          external: count(0, 6),
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
        ctx.text.message("definedBlock", { name: block.name })
      ),
      counts,
    ].join("\n")
  )
}

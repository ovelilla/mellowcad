import { metaSchema, pageSchema } from "fumadocs-core/source/schema"
import { z } from "zod"

export { metaSchema }

/** The four kinds of page (Diátaxis), each written to a purpose of its own. */
export const DOCS_PAGE_TYPES = [
  "gettingStarted",
  "howTo",
  "reference",
  "concept",
] as const

export const docsPageSchema = pageSchema.extend({
  description: z.string().min(1),
  /**
   * The page's name in search results and the browser's tab, when its title
   * (the navigation's, the heading's) needs more words to stand alone there.
   */
  metaTitle: z.string().optional(),
  type: z.enum(DOCS_PAGE_TYPES),
  /** A translation: the `sourceHash` of the English file it says. */
  sourceHash: z.string().optional(),
  /** A page written by a test from its sources, never by hand: that test. */
  generated: z.string().optional(),
})

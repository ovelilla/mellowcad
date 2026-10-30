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
  type: z.enum(DOCS_PAGE_TYPES),
})

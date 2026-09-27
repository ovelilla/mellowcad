import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"

// Named here as well as in `not-found.tsx`: once the page hydrates, the title
// is this segment's, not the boundary's.
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("NotFound")
  return { title: t("metaTitle") }
}

/**
 * Each language's 404, prerendered: `notFound()` renders `../not-found.tsx`
 * inside the language's own layout with a 404 status, and the `fallback`
 * rewrite in next.config.ts sends every unknown path of a language here.
 *
 * WHY not a `[...rest]` catch-all: a catch-all cannot be prerendered for paths
 * nobody knows in advance, so it is rendered on demand — a function for every
 * mistyped URL, on a site that is otherwise entirely static — and Next 16.3
 * sends the same body either way (see `not-found.tsx`).
 */
export default function LocaleNotFound() {
  notFound()
}

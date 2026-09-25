import type { MetadataRoute } from "next"

import { CONTENT_UPDATED, SITE_URL } from "@/lib/site"

/**
 * Only indexable pages. `lastModified` is when the copy last changed, not the
 * build time: Google uses it only while it stays truthful, and ignores
 * `changeFrequency` and `priority` altogether, so neither is set.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, lastModified: CONTENT_UPDATED },
    { url: `${SITE_URL}/privacy`, lastModified: CONTENT_UPDATED },
  ]
}

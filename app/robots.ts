import type { MetadataRoute } from "next"

import { SITE_URL } from "@/lib/site"

/**
 * Open to every crawler, AI ones included — a free product wants to be known,
 * and marketing copy has nothing to protect. `/draw` in particular must stay
 * crawlable: it is marked `noindex`, and a crawler that may not fetch it can
 * never read that.
 *
 * WHY two shut out: Meta's and OpenAI's training crawlers. Neither puts the
 * site in an answer (OpenAI's search is OAI-SearchBot, still allowed), and on
 * 17/11/2026 they were a fifth of the CDN's requests, nearly all cache misses
 * read from ISR storage, while its 30-day reads neared Hobby's cap.
 */
const TRAINING_CRAWLERS = ["meta-externalagent", "GPTBot"]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      { userAgent: TRAINING_CRAWLERS, disallow: "/" },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}

import type { MetadataRoute } from "next"

import { SITE_URL } from "@/lib/site"

/**
 * Open to every crawler, AI ones included — a free product wants to be known,
 * and marketing copy has nothing to protect. `/draw` in particular must stay
 * crawlable: it is marked `noindex`, and a crawler that may not fetch it can
 * never read that.
 */
// Exported with the site, a metadata route has to say it is static.
export const dynamic = "force-static"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}

import type { Metadata } from "next"

import messages from "@/messages/en.json"
import { OG_IMAGE_PATH, SITE_NAME } from "@/lib/site"

/**
 * A page's canonical URL and share card. Next merges `openGraph` and `twitter`
 * shallowly — a page that sets either replaces the layout's whole object — so
 * every page builds both complete, here.
 *
 * The card image is `app/opengraph-image.tsx`, named explicitly: with two root
 * layouts a metadata image at the app root is served but not inherited, and
 * one inside a route group gets a hashed URL that structured data cannot cite.
 */
const image = {
  url: OG_IMAGE_PATH,
  width: 1200,
  height: 630,
  type: "image/png",
  alt: messages.Metadata.ogAlt,
}

export function pageMetadata({
  path,
  title,
  description,
}: {
  path: string
  title: string
  description: string
}): Metadata {
  return {
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "en",
      url: path,
      title,
      description,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  }
}

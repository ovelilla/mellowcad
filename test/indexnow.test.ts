import { readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { describe, expect, it } from "vitest"

import { INDEXNOW_KEY, SITE_URL } from "../lib/site"
import {
  answer,
  keyLocation,
  sitemapUrls,
  submission,
} from "../scripts/seo/indexnow"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")

describe("IndexNow", () => {
  it("serves the key from the host's root, as the file IndexNow fetches", () => {
    expect(INDEXNOW_KEY).toMatch(/^[a-zA-Z0-9-]{8,128}$/)
    expect(
      readFileSync(path.join(ROOT, "public", `${INDEXNOW_KEY}.txt`), "utf8")
    ).toBe(INDEXNOW_KEY)
    expect(keyLocation()).toBe(`${SITE_URL}/${INDEXNOW_KEY}.txt`)
  })

  it("reads every URL of the sitemap once, its alternates aside", () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
<url>
<loc>${SITE_URL}/</loc>
<xhtml:link rel="alternate" hreflang="es" href="${SITE_URL}/es" />
<lastmod>2026-11-05</lastmod>
</url>
<url>
<loc>${SITE_URL}/es</loc>
</url>
<url>
<loc>${SITE_URL}/es</loc>
</url>
</urlset>`
    expect(sitemapUrls(xml)).toEqual([`${SITE_URL}/`, `${SITE_URL}/es`])
  })

  it("submits this host's URLs with the key that proves them, and nobody else's", () => {
    expect(submission([`${SITE_URL}/docs`])).toEqual({
      host: "mellowcad.com",
      key: INDEXNOW_KEY,
      keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
      urlList: [`${SITE_URL}/docs`],
    })
    expect(() => submission(["https://example.com/"])).toThrow(
      "Not on mellowcad.com"
    )
  })

  it("says what IndexNow's answer means", () => {
    expect(answer(200)).toBe("received")
    expect(answer(403)).toContain("key file")
    expect(answer(418)).toBe("unexpected answer")
  })
})

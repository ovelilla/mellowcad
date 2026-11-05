/**
 * Tells IndexNow — Bing, Yandex, Seznam, Naver and Yep share it, and Bing's
 * index feeds Copilot and ChatGPT's search — about every URL of the live
 * sitemap, so a new or changed page is fetched in days. The owner runs it
 * after a deploy that adds or changes pages (`docs/next-seo.md` §7):
 *
 *   npm run indexnow             # what it would send; nothing leaves
 *   npm run indexnow -- --send   # sends it
 *
 * It reads the deployed sitemap and checks the deployed key file first: a
 * submission whose key the host does not serve is refused (403).
 */

import { readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { INDEXNOW_KEY, SITE_URL } from "../../lib/site.ts"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..")

export const ENDPOINT = "https://api.indexnow.org/indexnow"

/** Where the key is served: `public/<key>.txt`, at the host's root. */
export const keyLocation = (key = INDEXNOW_KEY) => `${SITE_URL}/${key}.txt`

/** Every `<loc>` of a sitemap, in order, once each. */
export function sitemapUrls(xml: string): string[] {
  const urls = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((match) =>
    match[1].replaceAll("&amp;", "&")
  )
  return [...new Set(urls)]
}

/** The request IndexNow takes: every URL on this host, with the key that proves it. */
export function submission(urls: readonly string[], key = INDEXNOW_KEY) {
  const host = new URL(SITE_URL).host
  const foreign = urls.filter((url) => new URL(url).host !== host)
  if (foreign.length) throw new Error(`Not on ${host}: ${foreign.join(", ")}`)
  // IndexNow takes up to 10,000 URLs a request.
  if (urls.length > 10_000)
    throw new Error(`${urls.length} URLs: split them, 10,000 a request`)
  return { host, key, keyLocation: keyLocation(key), urlList: [...urls] }
}

/** What IndexNow's answer means (its documentation's table). */
export function answer(status: number): string {
  const meanings: Record<number, string> = {
    200: "received",
    202: "received; the key is still being validated",
    400: "bad request: the payload is malformed",
    403: "the key is not valid: is the key file deployed?",
    422: "a URL is not on the host, or the key does not match the file",
    429: "too many requests: try again later",
  }
  return meanings[status] ?? "unexpected answer"
}

async function main() {
  const send = process.argv.includes("--send")
  const key = readFileSync(
    resolve(ROOT, "public", `${INDEXNOW_KEY}.txt`),
    "utf8"
  ).trim()
  if (key !== INDEXNOW_KEY)
    throw new Error(`public/${INDEXNOW_KEY}.txt does not hold the key`)

  const sitemap = await fetch(`${SITE_URL}/sitemap.xml`)
  if (!sitemap.ok)
    throw new Error(`${SITE_URL}/sitemap.xml answered ${sitemap.status}`)
  const body = submission(sitemapUrls(await sitemap.text()))

  const served = await fetch(body.keyLocation)
  const keyServed = served.ok && (await served.text()).trim() === INDEXNOW_KEY
  console.log(`${body.urlList.length} URLs from ${SITE_URL}/sitemap.xml`)
  console.log(
    `key file ${body.keyLocation}: ${keyServed ? "served" : `not served (${served.status})`}`
  )

  if (!send) {
    for (const url of body.urlList) console.log(`  ${url}`)
    console.log(
      `\nNothing sent. To send them to ${ENDPOINT}: npm run indexnow -- --send`
    )
    return
  }
  if (!keyServed)
    throw new Error("Deploy the key file first: IndexNow would refuse the key")
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  })
  console.log(
    `IndexNow answered ${response.status}: ${answer(response.status)}`
  )
  if (!response.ok) process.exitCode = 1
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main()

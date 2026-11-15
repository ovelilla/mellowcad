"use client"

import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import type { ReactElement } from "react"

/**
 * The page's URL without its fragment: a `#run=` link carries a whole
 * script there, which `/privacy` promises never reaches a server, and both
 * measurements report the URL the browser is on.
 */
function withoutFragment<T extends { readonly url: string }>(event: T): T {
  return { ...event, url: event.url.split("#")[0] }
}

/** Vercel's two measurements on the editor's pages. */
export function EditorMetrics(): ReactElement {
  return (
    <>
      <Analytics beforeSend={withoutFragment} />
      <SpeedInsights beforeSend={withoutFragment} />
    </>
  )
}

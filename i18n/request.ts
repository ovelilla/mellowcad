import { getRequestConfig } from "next-intl/server"

import messages from "@/messages/en.json"

/**
 * next-intl without i18n routing: one fixed locale, read from nowhere. Nothing
 * here may touch headers, cookies or `requestLocale`, or every page that
 * translates stops being prerendered. The second language arrives as the
 * `[locale]` segment plus `proxy.ts`, not as a change to this lookup.
 */
export default getRequestConfig(async () => ({
  locale: "en",
  messages,
  // Fixed so a date formats the same at build time as anywhere it is read.
  timeZone: "UTC",
}))

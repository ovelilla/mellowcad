import { hasLocale } from "next-intl"
import { getRequestConfig } from "next-intl/server"
import { notFound } from "next/navigation"
import { locale as rootLocale } from "next/root-params"

import { loadMessages } from "./messages"
import { routing } from "./routing"

/**
 * The language of the page being rendered is the `[locale]` segment above both
 * root layouts, read with `next/root-params` — never `requestLocale`, headers
 * or cookies, any of which would stop the pages being prerendered.
 */
export default getRequestConfig(async ({ locale }) => {
  // An explicit locale wins: route handlers cannot read root params, and the
  // global 404 lives outside `[locale]`, so both name theirs.
  if (!locale) {
    const segment = await rootLocale()
    if (!hasLocale(routing.locales, segment)) notFound()
    locale = segment
  }
  return {
    locale,
    messages: await loadMessages(locale),
    // Fixed, so a date formats the same at build time as anywhere it is read.
    timeZone: "UTC",
  }
})

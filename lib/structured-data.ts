import type { Graph } from "schema-dts"
import { getLocale, getTranslations } from "next-intl/server"

import { localeUrl } from "@/i18n/navigation"
import { productFacts } from "@/lib/facts"
import { pageEngineLocale } from "@/lib/plot"
import {
  CONTACT_EMAIL,
  EDITOR_PATH,
  OG_IMAGE_PATH,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site"

/**
 * The home page's single `@graph`: the site, the app and who publishes it, in
 * the language being rendered — the publisher is the same in every one.
 * Everything comes from `lib/site.ts`, the copy and the registry — no fact is
 * restated by hand. There is no rating: without real reviews there is none to
 * give, and one is never invented.
 */
export async function homeStructuredData(): Promise<Graph> {
  const metadata = await getTranslations("Metadata")
  const status = await getTranslations("Status")
  const facts = productFacts(await pageEngineLocale())
  const locale = await getLocale()
  const home = localeUrl(locale, "/")
  const organization = `${SITE_URL}/#organization`

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${home}#website`,
        url: home,
        name: SITE_NAME,
        inLanguage: locale,
        publisher: { "@id": organization },
      },
      {
        "@type": "WebApplication",
        "@id": `${home}#app`,
        name: SITE_NAME,
        url: localeUrl(locale, EDITOR_PATH),
        inLanguage: locale,
        description: metadata("appDescription"),
        applicationCategory: "DesignApplication",
        operatingSystem: "Any",
        browserRequirements: metadata("browserRequirements"),
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
        featureList: [
          status("today1", {
            commands: facts.commands,
            aliases: facts.aliases,
          }),
          status("today2", { snaps: facts.objectSnaps }),
          status("today3", { lineweights: facts.lineweights }),
          status("today4"),
          status("today5"),
        ],
        screenshot: localeUrl(locale, OG_IMAGE_PATH),
        softwareVersion: facts.version,
        publisher: { "@id": organization },
      },
      {
        "@type": "Organization",
        "@id": organization,
        name: SITE_NAME,
        url: `${SITE_URL}/`,
        logo: `${SITE_URL}/icon.svg`,
        email: CONTACT_EMAIL,
      },
    ],
  }
}

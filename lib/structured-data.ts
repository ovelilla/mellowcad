import type { Graph } from "schema-dts"
import { getTranslations } from "next-intl/server"

import { productFacts } from "@/lib/facts"
import {
  CONTACT_EMAIL,
  EDITOR_PATH,
  OG_IMAGE_PATH,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site"

/**
 * The home page's single `@graph`: the site, the app and who publishes it.
 * Everything comes from `lib/site.ts`, the copy and the registry — no fact is
 * restated by hand. There is no rating: without real reviews there is none to
 * give, and one is never invented.
 */
export async function homeStructuredData(): Promise<Graph> {
  const metadata = await getTranslations("Metadata")
  const status = await getTranslations("Status")
  const facts = productFacts()
  const home = `${SITE_URL}/`

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${home}#website`,
        url: home,
        name: SITE_NAME,
        inLanguage: "en",
        publisher: { "@id": `${home}#organization` },
      },
      {
        "@type": "WebApplication",
        "@id": `${home}#app`,
        name: SITE_NAME,
        url: `${SITE_URL}${EDITOR_PATH}`,
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
        screenshot: `${SITE_URL}${OG_IMAGE_PATH}`,
        softwareVersion: facts.version,
        publisher: { "@id": `${home}#organization` },
      },
      {
        "@type": "Organization",
        "@id": `${home}#organization`,
        name: SITE_NAME,
        url: home,
        logo: `${SITE_URL}/icon.svg`,
        email: CONTACT_EMAIL,
      },
    ],
  }
}

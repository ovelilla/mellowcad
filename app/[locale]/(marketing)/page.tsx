import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { AudienceSection } from "@/components/marketing/audience-section"
import { CommandsSection } from "@/components/marketing/commands-section"
import { DraftingSection } from "@/components/marketing/drafting-section"
import { FaqSection } from "@/components/marketing/faq-section"
import { FinalCta } from "@/components/marketing/final-cta"
import { Hero } from "@/components/marketing/hero"
import { JsonLd } from "@/components/marketing/json-ld"
import { LocalFirstSection } from "@/components/marketing/local-first-section"
import { SolidsSection } from "@/components/marketing/solids-section"
import { StatusSection } from "@/components/marketing/status-section"
import { pageMetadata } from "@/lib/metadata"
import { homeStructuredData } from "@/lib/structured-data"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata")
  return await pageMetadata({
    path: "/",
    title: t("title"),
    description: t("description"),
  })
}

/**
 * The landing, in the order a visitor from a search asks: what it is and the
 * proof (hero), the commands they know, 2D, 3D, the price and their files,
 * who it is for, then where it stands and the answers.
 */
export default async function HomePage() {
  return (
    <>
      <JsonLd data={await homeStructuredData()} />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-275 sheet-grid"
      />
      <Hero />
      <CommandsSection />
      <DraftingSection />
      <SolidsSection />
      <LocalFirstSection />
      <AudienceSection />
      <StatusSection />
      <FaqSection />
      <FinalCta />
    </>
  )
}

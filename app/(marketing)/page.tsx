import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { CommandsSection } from "@/components/marketing/commands-section"
import { EngineSection } from "@/components/marketing/engine-section"
import { FaqSection } from "@/components/marketing/faq-section"
import { FinalCta } from "@/components/marketing/final-cta"
import { Hero } from "@/components/marketing/hero"
import { JsonLd } from "@/components/marketing/json-ld"
import { LocalFirstSection } from "@/components/marketing/local-first-section"
import { PrecisionSection } from "@/components/marketing/precision-section"
import { StatusSection } from "@/components/marketing/status-section"
import { ToolsetSection } from "@/components/marketing/toolset-section"
import { pageMetadata } from "@/lib/metadata"
import { homeStructuredData } from "@/lib/structured-data"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata")
  return pageMetadata({
    path: "/",
    title: t("title"),
    description: t("description"),
  })
}

/**
 * The landing, in the order it argues: show (hero, commands, precision,
 * toolset), reassure (local-first, engine, status), then answer (FAQ).
 */
export default async function HomePage() {
  return (
    <>
      <JsonLd data={await homeStructuredData()} />
      <div
        aria-hidden="true"
        className="sheet-grid pointer-events-none absolute inset-x-0 top-0 -z-10 h-275"
      />
      <Hero />
      <CommandsSection />
      <PrecisionSection />
      <ToolsetSection />
      <LocalFirstSection />
      <EngineSection />
      <StatusSection />
      <FaqSection />
      <FinalCta />
    </>
  )
}

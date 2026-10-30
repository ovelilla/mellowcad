import { Plus } from "lucide-react"
import { getTranslations } from "next-intl/server"

import { productFacts } from "@/lib/facts"

import { SectionHeading } from "./section-heading"
import { sourceLinks } from "./source-links"

const QUESTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const

/** Native disclosure widgets: no script, and every answer is in the HTML. */
export async function FaqSection() {
  const t = await getTranslations("Faq")
  const facts = productFacts()

  return (
    <section
      aria-labelledby="faq-title"
      id="faq"
      className="defer mx-auto flex w-full max-w-[1200px] flex-col gap-14 px-4 py-12 sm:px-6 lg:py-20"
    >
      <SectionHeading id="faq-title" label={t("label")} title={t("title")} />
      <div className="flex max-w-3xl flex-col border-t border-border">
        {QUESTIONS.map((n) => (
          <details key={n} className="group border-b border-border">
            <summary className="flex items-center justify-between gap-6 py-5 text-lg font-medium">
              <h3>{t(`q${n}`)}</h3>
              <Plus
                aria-hidden="true"
                className="size-4 shrink-0 text-fg-subtle transition-transform duration-150 group-open:rotate-45"
              />
            </summary>
            <p className="measure pb-6 text-fg-muted">
              {t.rich(`a${n}`, { ...sourceLinks, commands: facts.commands })}
            </p>
          </details>
        ))}
      </div>
    </section>
  )
}

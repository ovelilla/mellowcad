import { Plus } from "lucide-react"
import Link from "next/link"
import { getTranslations } from "next-intl/server"

import { FAQ_QUESTIONS } from "@/content/faq"
import { sitePaths } from "@/i18n/site-paths"
import { productFacts } from "@/lib/facts"

import { SectionHeading } from "./section-heading"
import { sourceLinks } from "./source-links"

/** Native disclosure widgets: no script, and every answer is in the HTML. */
export async function FaqSection() {
  const t = await getTranslations("Faq")
  const facts = productFacts()
  const paths = await sitePaths()
  const reference = (chunks: React.ReactNode) => (
    <Link href={paths.commands} prefetch={false} className="underline-link">
      {chunks}
    </Link>
  )
  const exercises = (chunks: React.ReactNode) => (
    <Link href={paths.exercises} prefetch={false} className="underline-link">
      {chunks}
    </Link>
  )

  return (
    <section
      aria-labelledby="faq-title"
      id="faq"
      className="defer mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-4 py-10 sm:px-6"
    >
      <SectionHeading id="faq-title" label={t("label")} title={t("title")} />
      <div className="grid items-start gap-x-10 border-t border-border lg:grid-cols-2">
        {FAQ_QUESTIONS.map((n) => (
          <details key={n} className="group border-b border-border">
            <summary className="flex items-center justify-between gap-6 py-4 text-lg font-medium">
              <h3>{t(`q${n}`)}</h3>
              <Plus
                aria-hidden="true"
                className="size-4 shrink-0 text-fg-subtle transition-transform duration-150 group-open:rotate-45"
              />
            </summary>
            <p className="measure pb-6 text-fg-muted">
              {t.rich(`a${n}`, {
                ...sourceLinks,
                reference,
                exercises,
                commands: facts.commands,
              })}
            </p>
          </details>
        ))}
      </div>
    </section>
  )
}

import type { Metadata } from "next"
import { getFormatter, getTranslations } from "next-intl/server"
import type { ReactNode } from "react"

import { pageMetadata } from "@/lib/metadata"
import { CONTACT_EMAIL, CONTENT_UPDATED, SITE_NAME } from "@/lib/site"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Privacy")
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    ...pageMetadata({
      path: "/privacy",
      title: `${t("metaTitle")} · ${SITE_NAME}`,
      description: t("metaDescription"),
    }),
  }
}

function Block({
  title,
  items,
  note,
}: {
  title: string
  items: ReactNode[]
  note?: string
}) {
  return (
    <section className="flex flex-col gap-4 border-t border-border pt-8">
      <h2 className="text-h3">{title}</h2>
      <ul className="text-fg-muted flex flex-col gap-3">
        {items.map((item, index) => (
          <li key={index} className="flex gap-3">
            <span aria-hidden="true" className="text-fg-subtle font-mono">
              —
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
      {note && (
        <p className="bg-bg-raised text-fg-muted rounded-md border border-border p-4 text-sm">
          {note}
        </p>
      )}
    </section>
  )
}

/**
 * The information GDPR asks for (Article 13), in plain words: what is kept
 * and measured, who handles it and on what grounds, where it goes, for how
 * long, and the visitor's rights. It changes with anything that starts
 * handling personal data.
 */
export default async function PrivacyPage() {
  const t = await getTranslations("Privacy")
  const format = await getFormatter()

  return (
    <article className="mx-auto flex w-full max-w-3xl flex-col gap-12 px-4 py-16 sm:px-6 lg:py-24">
      <header className="flex flex-col gap-5">
        <p className="label-mono">{t("label")}</p>
        <h1 className="text-h2">{t("title")}</h1>
        <p className="text-lead">{t("lead")}</p>
      </header>
      <Block
        title={t("storedTitle")}
        items={[t("stored1"), t("stored2"), t("stored3")]}
        note={t("storedNote")}
      />
      <Block
        title={t("analyticsTitle")}
        items={[t("analytics1"), t("analytics2"), t("analytics3")]}
      />
      <Block
        title={t("handledTitle")}
        items={[
          t.rich("handled1", {
            address: CONTACT_EMAIL,
            email: (chunks) => (
              <a href={`mailto:${CONTACT_EMAIL}`} className="underline-link">
                {chunks}
              </a>
            ),
          }),
          t("handled2"),
          t("handled3"),
          t("handled4"),
        ]}
      />
      <Block title={t("rightsTitle")} items={[t("rights1"), t("rights2")]} />
      <p className="data-mono text-fg-subtle text-xs">
        {t("updated", {
          date: format.dateTime(new Date(CONTENT_UPDATED), {
            dateStyle: "long",
          }),
        })}
      </p>
    </article>
  )
}

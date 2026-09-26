import type { Metadata } from "next"
import { getFormatter, getTranslations } from "next-intl/server"

import { changelog } from "@/lib/changelog"
import { pageMetadata } from "@/lib/metadata"
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/site"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Changelog")
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    ...pageMetadata({
      path: "/changelog",
      title: `${t("metaTitle")} · ${SITE_NAME}`,
      description: t("metaDescription"),
    }),
  }
}

/** An entry, with its `code` spans (command names) set in mono. */
function Entry({ text }: { text: string }) {
  return text.split("`").map((part, index) =>
    index % 2 === 1 ? (
      <code key={index} className="text-fg font-mono text-[0.9375em]">
        {part}
      </code>
    ) : (
      part
    )
  )
}

/**
 * The drawing's revision block: every release, newest first, from the
 * repository's `CHANGELOG.md`.
 */
export default async function ChangelogPage() {
  const t = await getTranslations("Changelog")
  const format = await getFormatter()
  const releases = changelog()

  return (
    <article className="mx-auto flex w-full max-w-3xl flex-col gap-12 px-4 py-16 sm:px-6 lg:py-24">
      <header className="flex flex-col gap-5">
        <p className="label-mono">{t("label")}</p>
        <h1 className="text-h2">{t("title")}</h1>
        <p className="text-lead">{t("lead")}</p>
      </header>
      <ol className="flex flex-col gap-px overflow-hidden rounded-lg border border-border bg-border">
        {releases.map((release) => (
          <li
            key={release.version}
            className="bg-bg-raised grid gap-6 p-5 sm:grid-cols-[10rem_1fr] sm:p-6"
          >
            <div className="flex flex-col gap-1">
              <span aria-hidden="true" className="label-mono text-[0.625rem]">
                {t("revision")}
              </span>
              <h2 className="data-mono text-fg text-lg">
                <span className="sr-only">{t("version")} </span>
                {release.version}
              </h2>
              <time
                dateTime={release.date}
                className="data-mono text-fg-subtle text-sm"
              >
                {format.dateTime(new Date(release.date), {
                  dateStyle: "long",
                })}
              </time>
            </div>
            <div className="flex flex-col gap-6">
              {release.sections.map((section) => (
                <section key={section.type} className="flex flex-col gap-3">
                  <h3 className="label-mono">{t(section.type)}</h3>
                  <ul className="text-fg-muted flex flex-col gap-2.5">
                    {section.items.map((item) => (
                      <li key={item} className="flex gap-3">
                        <span
                          aria-hidden="true"
                          className="text-fg-subtle font-mono"
                        >
                          —
                        </span>
                        <span>
                          <Entry text={item} />
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </li>
        ))}
      </ol>
      <a
        href={`mailto:${CONTACT_EMAIL}?subject=MellowCAD`}
        className="underline-link self-start text-sm"
      >
        {t("contact")}
      </a>
    </article>
  )
}

import { HardDrive, Save, UserX } from "lucide-react"
import Link from "next/link"
import { getTranslations } from "next-intl/server"

import { DIAGRAMS } from "@/content/figures"
import { sitePaths } from "@/i18n/site-paths"
import { pageEngineLocale, renderFigure } from "@/lib/plot"

import { Drawing } from "./drawing"
import { SectionHeading } from "./section-heading"

export async function LocalFirstSection() {
  const t = await getTranslations("LocalFirst")
  const figure = await renderFigure({
    ...DIAGRAMS.localFirst({
      editor: t("diagramEditor"),
      browser: t("diagramBrowser"),
      file: t("diagramFile"),
      device: t("diagramDevice"),
      autosave: t("diagramAutosave"),
    }),
    locale: await pageEngineLocale(),
  })
  const paths = await sitePaths()

  const facts = [
    { icon: HardDrive, title: t("autosaveTitle"), body: t("autosaveBody") },
    { icon: Save, title: t("fileTitle"), body: t("fileBody") },
    { icon: UserX, title: t("privateTitle"), body: t("privateBody") },
  ]

  return (
    <section
      aria-labelledby="privacy-title"
      id="privacy"
      className="defer mx-auto flex w-full max-w-[1200px] flex-col gap-14 px-4 py-12 sm:px-6 lg:py-20"
    >
      <SectionHeading
        id="privacy-title"
        label={t("label")}
        title={t("title")}
      />
      <div className="grid items-start gap-12 lg:grid-cols-12">
        <ul className="flex flex-col gap-8 lg:col-span-5">
          {facts.map(({ icon: Icon, title, body }) => (
            <li key={title} className="flex gap-4">
              <Icon
                className="mt-1 size-5 shrink-0 text-fg-subtle"
                aria-hidden="true"
              />
              <div className="flex flex-col gap-1">
                <h3 className="text-h3">{title}</h3>
                <p className="text-fg-muted">{body}</p>
              </div>
            </li>
          ))}
          <li className="rounded-md border border-border bg-bg-raised p-4 text-sm text-fg-muted">
            {t("warning")}{" "}
            <Link href={paths.privacy} className="underline-link">
              {t("privacyLink")}
            </Link>
          </li>
        </ul>
        <div className="reveal overflow-hidden rounded-lg border border-border bg-bg lg:col-span-7">
          <Drawing
            markup={figure.markup}
            width={figure.width}
            height={figure.height}
            title={t("diagramAlt")}
          />
        </div>
      </div>
    </section>
  )
}

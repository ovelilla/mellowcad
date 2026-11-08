import { Gift, HardDrive, Save, UserX } from "lucide-react"
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
  const dxf = (chunks: React.ReactNode) => (
    <Link href={paths.openDxf} prefetch={false} className="underline-link">
      {chunks}
    </Link>
  )

  const facts = [
    { icon: Gift, title: t("freeTitle"), body: t("freeBody") },
    { icon: HardDrive, title: t("autosaveTitle"), body: t("autosaveBody") },
    { icon: Save, title: t("fileTitle"), body: t.rich("fileBody", { dxf }) },
    { icon: UserX, title: t("privateTitle"), body: t("privateBody") },
  ]

  return (
    <section
      aria-labelledby="privacy-title"
      id="privacy"
      className="defer mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-4 py-10 sm:px-6"
    >
      <SectionHeading
        id="privacy-title"
        label={t("label")}
        title={t("title")}
      />
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {facts.map(({ icon: Icon, title, body }) => (
          <li key={title} className="flex flex-col gap-2">
            <Icon className="size-5 text-fg-subtle" aria-hidden="true" />
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-fg-muted">{body}</p>
          </li>
        ))}
      </ul>
      <div className="grid items-center gap-8 lg:grid-cols-12">
        <p className="rounded-md border border-border bg-bg-raised p-4 text-sm text-fg-muted lg:col-span-7">
          {t("formats")} {t("warning")}{" "}
          <Link href={paths.privacy} className="underline-link">
            {t("privacyLink")}
          </Link>
        </p>
        <div className="reveal overflow-hidden rounded-lg border border-border bg-bg lg:col-span-5">
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

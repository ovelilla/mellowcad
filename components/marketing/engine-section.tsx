import Link from "next/link"
import { getTranslations } from "next-intl/server"

import { DIAGRAMS } from "@/content/figures"
import { sitePaths } from "@/i18n/site-paths"
import { productFacts } from "@/lib/facts"
import { pageEngineLocale, renderFigure } from "@/lib/plot"

import { Drawing } from "./drawing"
import { SectionHeading } from "./section-heading"
import { SnapCorners } from "./snap-corners"
import { sourceLinks } from "./source-links"

export async function EngineSection() {
  const t = await getTranslations("Engine")
  const facts = productFacts()
  const paths = await sitePaths()
  const figure = await renderFigure({
    ...DIAGRAMS.engineLayers(t("diagramImports")),
    locale: await pageEngineLocale(),
  })

  const points: [string, React.ReactNode][] = [
    [t("kernelTitle"), t("kernelBody")],
    [t("undoTitle"), t("undoBody")],
    [t("formatTitle"), t("formatBody")],
    [t("fidelityTitle"), t("fidelityBody")],
    [t("testsTitle", { tests: facts.tests }), t("testsBody")],
    [
      t("sourceTitle"),
      t.rich("sourceBody", {
        ...sourceLinks,
        docs: (chunks) => (
          <Link href={paths.docs} prefetch={false} className="underline-link">
            {chunks}
          </Link>
        ),
      }),
    ],
  ]

  return (
    <section
      aria-labelledby="engine-title"
      id="engine"
      className="defer mx-auto flex w-full max-w-[1200px] flex-col gap-14 px-4 py-12 sm:px-6 lg:py-20"
    >
      <SectionHeading
        id="engine-title"
        label={t("label")}
        title={t("title")}
        lead={t("lead")}
      />
      <div className="grid items-start gap-12 lg:grid-cols-12">
        <div className="snap-card reveal relative overflow-hidden rounded-lg border border-border bg-bg lg:col-span-5">
          <SnapCorners />
          <Drawing
            markup={figure.markup}
            width={figure.width}
            height={figure.height}
            title={t("diagramAlt")}
          />
        </div>
        <dl className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:col-span-7">
          {points.map(([title, body]) => (
            <div key={title} className="flex flex-col gap-1.5">
              <dt className="text-h3">{title}</dt>
              <dd className="text-fg-muted">{body}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}

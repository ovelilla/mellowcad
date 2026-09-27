import { getTranslations } from "next-intl/server"

import { FIGURES, type FigureId } from "@/content/figures"
import { productFacts } from "@/lib/facts"
import { pageEngineLocale, renderFigure } from "@/lib/plot"

import { Drawing } from "./drawing"
import { SectionHeading } from "./section-heading"
import { SnapCorners } from "./snap-corners"

function Keys({ keys }: { keys: readonly string[] }) {
  return (
    <span className="flex gap-1.5">
      {keys.map((key) => (
        <kbd
          key={key}
          className="inline-flex h-6 items-center rounded border border-border bg-bg px-1.5 font-mono text-[0.6875rem] text-fg-muted"
        >
          {key}
        </kbd>
      ))}
    </span>
  )
}

async function Figure({ id, alt }: { id: FigureId; alt: string }) {
  const figure = await renderFigure({
    ...FIGURES[id],
    locale: await pageEngineLocale(),
  })
  return (
    <div className="overflow-hidden rounded-md border border-border bg-bg">
      <Drawing
        markup={figure.markup}
        width={figure.width}
        height={figure.height}
        title={alt}
      />
    </div>
  )
}

export async function PrecisionSection() {
  const t = await getTranslations("Precision")
  const facts = productFacts()

  const cards = [
    {
      title: t("osnapTitle"),
      body: t("osnapBody", { count: facts.objectSnaps }),
      keys: ["F3"],
      figures: [{ id: "osnap", alt: t("osnapAlt") }],
    },
    {
      title: t("otrackTitle"),
      body: t("otrackBody"),
      keys: ["F11"],
      figures: [{ id: "otrack", alt: t("otrackAlt") }],
    },
    {
      title: t("polarTitle"),
      body: t("polarBody"),
      keys: ["F10", "F8", "F9"],
      figures: [{ id: "polar", alt: t("polarAlt") }],
    },
    {
      title: t("selectionTitle"),
      body: t("selectionBody"),
      keys: [],
      figures: [
        { id: "window", alt: t("windowAlt"), label: t("windowLabel") },
        { id: "crossing", alt: t("crossingAlt"), label: t("crossingLabel") },
      ],
    },
  ] satisfies {
    title: string
    body: string
    keys: string[]
    figures: { id: FigureId; alt: string; label?: string }[]
  }[]

  return (
    <section
      aria-labelledby="precision-title"
      id="precision"
      className="defer mx-auto flex w-full max-w-[1200px] flex-col gap-14 px-4 py-12 sm:px-6 lg:py-20"
    >
      <SectionHeading
        id="precision-title"
        label={t("label")}
        title={t("title")}
        lead={t("lead")}
      />
      <ul className="grid gap-6 md:grid-cols-2">
        {cards.map((card) => (
          <li
            key={card.title}
            className="snap-card reveal relative flex flex-col gap-5 rounded-lg border border-border bg-bg-raised p-5"
          >
            <SnapCorners />
            <div
              className={
                card.figures.length > 1 ? "grid grid-cols-2 gap-3" : undefined
              }
            >
              {card.figures.map((figure) => (
                <div key={figure.id} className="flex flex-col gap-2">
                  <Figure id={figure.id} alt={figure.alt} />
                  {"label" in figure && (
                    <span className="label-mono">{figure.label}</span>
                  )}
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-h3">{card.title}</h3>
                {card.keys.length > 0 && <Keys keys={card.keys} />}
              </div>
              <p className="text-fg-muted">{card.body}</p>
            </div>
          </li>
        ))}
      </ul>
      <p className="measure data-mono text-fg-subtle">{t("dynamicInput")}</p>
    </section>
  )
}

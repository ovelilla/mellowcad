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
          dir="ltr"
          className="inline-flex h-6 items-center rounded border border-border bg-bg px-1.5 font-mono text-[0.6875rem] text-fg-muted"
        >
          {key}
        </kbd>
      ))}
    </span>
  )
}

interface Card {
  readonly title: string
  readonly body: string
  readonly keys?: readonly string[]
  readonly figures: readonly { id: FigureId; alt: string; label?: string }[]
}

/**
 * 2D drafting in one grid: the aids, each the editor's own frame
 * mid-gesture, then what the drawing groups make, each a still the engine
 * drew — one sentence apiece, the commands themselves in the board above.
 */
export async function DraftingSection() {
  const t = await getTranslations("Precision")
  const tools = await getTranslations("Toolset")
  const groups = await getTranslations("Groups")
  const facts = productFacts()
  const locale = await pageEngineLocale()

  const cards: Card[] = [
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
      figures: [
        { id: "window", alt: t("windowAlt"), label: t("windowLabel") },
        { id: "crossing", alt: t("crossingAlt"), label: t("crossingLabel") },
      ],
    },
    {
      title: groups("draw"),
      body: tools("drawBody"),
      figures: [{ id: "draw", alt: tools("drawAlt") }],
    },
    {
      title: groups("modify"),
      body: tools("modifyBody"),
      figures: [{ id: "modify", alt: tools("modifyAlt") }],
    },
    {
      title: groups("annotate"),
      body: tools("annotateBody"),
      figures: [{ id: "annotate", alt: tools("annotateAlt") }],
    },
    {
      title: groups("organize"),
      body: tools("organizeBody", {
        linetypes: facts.linetypes,
        lineweights: facts.lineweights,
      }),
      figures: [{ id: "organize", alt: tools("organizeAlt") }],
    },
  ]
  const rendered = await Promise.all(
    cards.map((card) =>
      Promise.all(
        card.figures.map((figure) =>
          renderFigure({ ...FIGURES[figure.id], locale })
        )
      )
    )
  )

  return (
    <section
      aria-labelledby="features-title"
      id="features"
      className="defer mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-4 py-10 sm:px-6"
    >
      <SectionHeading
        id="features-title"
        label={t("label")}
        title={t("title")}
        lead={t("lead")}
      />
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, index) => (
          <li
            key={card.title}
            className="snap-card reveal relative flex flex-col gap-4 rounded-lg border border-border bg-bg-raised p-4"
          >
            <SnapCorners />
            <div
              className={
                card.figures.length > 1 ? "grid grid-cols-2 gap-2" : undefined
              }
            >
              {card.figures.map((figure, f) => {
                const drawn = rendered[index][f]
                return (
                  <div key={figure.id} className="flex flex-col gap-1.5">
                    <div className="overflow-hidden rounded-md border border-border bg-bg">
                      <Drawing
                        markup={drawn.markup}
                        width={drawn.width}
                        height={drawn.height}
                        title={figure.alt}
                      />
                    </div>
                    {figure.label && (
                      <span className="label-mono">{figure.label}</span>
                    )}
                  </div>
                )
              })}
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-lg font-semibold">{card.title}</h3>
                {card.keys && <Keys keys={card.keys} />}
              </div>
              <p className="text-sm text-fg-muted">{card.body}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

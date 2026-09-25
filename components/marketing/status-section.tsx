import { getFormatter, getTranslations } from "next-intl/server"

import { productFacts } from "@/lib/facts"
import { CONTACT_EMAIL, CONTENT_UPDATED } from "@/lib/site"

import { SectionHeading } from "./section-heading"

export async function StatusSection() {
  const t = await getTranslations("Status")
  const format = await getFormatter()
  const facts = productFacts()

  const columns = [
    {
      title: t("todayTitle"),
      marker: "text-fg",
      items: [
        t("today1", { commands: facts.commands, aliases: facts.aliases }),
        t("today2", { snaps: facts.objectSnaps }),
        t("today3", { lineweights: facts.lineweights }),
        t("today4"),
        t("today5"),
      ],
    },
    {
      title: t("notYetTitle"),
      marker: "text-fg-subtle",
      items: [
        t("notYet1"),
        t("notYet2"),
        t("notYet3"),
        t("notYet4"),
        t("notYet5"),
        t("notYet6"),
      ],
    },
    {
      title: t("nextTitle"),
      marker: "text-accent",
      items: [t("next1"), t("next2"), t("next3"), t("next4")],
    },
  ]

  return (
    <section
      aria-labelledby="roadmap-title"
      id="roadmap"
      className="defer mx-auto flex w-full max-w-[1200px] flex-col gap-14 px-4 py-12 sm:px-6 lg:py-20"
    >
      <SectionHeading
        id="roadmap-title"
        label={t("label")}
        title={t("title")}
        lead={t("lead")}
      />
      <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-3">
        {columns.map((column) => (
          <div key={column.title} className="flex flex-col gap-5 bg-bg p-6">
            <h3 className="label-mono">{column.title}</h3>
            <ul className="flex flex-col gap-3">
              {column.items.map((item) => (
                <li key={item} className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className={`font-mono ${column.marker}`}
                  >
                    —
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-baseline justify-between gap-4 text-sm">
        <p className="data-mono text-fg-subtle">
          {t("updated", {
            date: format.dateTime(new Date(CONTENT_UPDATED), {
              dateStyle: "long",
            }),
          })}
        </p>
        <a
          href={`mailto:${CONTACT_EMAIL}?subject=MellowCAD`}
          className="underline-link"
        >
          {t("contact")}
        </a>
      </div>
    </section>
  )
}

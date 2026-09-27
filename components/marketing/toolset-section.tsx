import { getTranslations } from "next-intl/server"

import { COMMAND_GROUPS, type CommandGroup } from "@/content/commands"
import { FIGURES } from "@/content/figures"
import { sitePaths } from "@/i18n/site-paths"
import { commandsByGroup, productFacts } from "@/lib/facts"
import { pageEngineLocale, renderFigure } from "@/lib/plot"

import { Drawing } from "./drawing"
import { SectionHeading } from "./section-heading"

const BODY = {
  draw: "drawBody",
  modify: "modifyBody",
  annotate: "annotateBody",
  organize: "organizeBody",
  inquiry: "inquiryBody",
  files: "filesBody",
} as const satisfies Record<CommandGroup, string>

const ALT = {
  draw: "drawAlt",
  modify: "modifyAlt",
  annotate: "annotateAlt",
  organize: "organizeAlt",
  inquiry: "inquiryAlt",
  files: "filesAlt",
} as const satisfies Record<CommandGroup, string>

/**
 * The toolset as a drawing index: one sheet per ribbon group, each with a
 * small drawing its commands made and the commands themselves as text.
 */
export async function ToolsetSection() {
  const t = await getTranslations("Toolset")
  const groups = await getTranslations("Groups")
  const common = await getTranslations("Common")
  const paths = await sitePaths()
  const facts = productFacts()
  const locale = await pageEngineLocale()
  const byGroup = commandsByGroup(locale)
  const figures = await Promise.all(
    COMMAND_GROUPS.map((group) => renderFigure({ ...FIGURES[group], locale }))
  )

  return (
    <section
      aria-labelledby="features-title"
      id="features"
      className="defer mx-auto flex w-full max-w-[1200px] flex-col gap-14 px-4 py-12 sm:px-6 lg:py-20"
    >
      <SectionHeading
        id="features-title"
        label={t("label")}
        title={t("title")}
        lead={t("lead", { commands: facts.commands })}
      />
      <ol className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {COMMAND_GROUPS.map((group, index) => {
          const figure = figures[index]
          return (
            <li
              key={group}
              className="group-card reveal relative flex flex-col gap-4"
            >
              <span aria-hidden="true" className="window-select" />
              <div className="overflow-hidden rounded-md border border-border bg-bg">
                <Drawing
                  markup={figure.markup}
                  width={figure.width}
                  height={figure.height}
                  title={t(ALT[group])}
                />
              </div>
              <div className="flex items-baseline justify-between gap-4 border-b border-border pb-2">
                <h3 className="text-h3">{groups(group)}</h3>
                <span className="shrink-0 label-mono whitespace-nowrap">
                  {t("sheet", {
                    number: `A-${String(101 + index)}`,
                  })}
                </span>
              </div>
              <p className="text-fg-muted">
                {t(BODY[group], {
                  linetypes: facts.linetypes,
                  lineweights: facts.lineweights,
                })}
              </p>
              <p className="data-mono text-xs leading-relaxed text-fg-subtle">
                {byGroup[group].map((command) => command.name).join(" · ")}
              </p>
            </li>
          )
        })}
      </ol>
      <p>
        <a
          href={paths.editor}
          className="inline-flex h-12 items-center rounded-md bg-accent px-6 font-medium text-accent-ink transition-[filter] duration-150 hover:brightness-110"
        >
          {common("startDrawing")}
          <span aria-hidden="true">&nbsp;→</span>
        </a>
      </p>
    </section>
  )
}

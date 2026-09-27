import { getFormatter, getTranslations } from "next-intl/server"

import { type EngineLocale, engineText, transcript } from "@/cad"
import { COMMAND_GROUPS } from "@/content/commands"
import { FIGURES } from "@/content/figures"
import { sitePaths } from "@/i18n/site-paths"
import { autocadCommands, commandsByGroup, productFacts } from "@/lib/facts"
import { pageEngineLocale, renderFigure } from "@/lib/plot"

import { CommandTry } from "./command-try"
import { Drawing } from "./drawing"
import { SectionHeading } from "./section-heading"
import { SnapCorners } from "./snap-corners"

/** The OFFSET card's history, from the moment OFFSET is typed. */
async function offsetTranscript(locale: EngineLocale | undefined) {
  const figure = await renderFigure({ ...FIGURES.offset, locale })
  const lines = transcript(figure.recording)
  // OFFSET as the command language names it (DESFASE in Spanish).
  const [offset] = engineText(locale).commandNames("OFFSET")
  const start = lines.findIndex(
    (line) => line.kind === "command" && line.text === offset
  )
  return { figure, lines: lines.slice(Math.max(start, 0)) }
}

export async function CommandsSection() {
  const t = await getTranslations("Commands")
  const groups = await getTranslations("Groups")
  const common = await getTranslations("Common")
  const format = await getFormatter()
  const paths = await sitePaths()
  const engine = await pageEngineLocale()
  const facts = productFacts(engine)
  const text = engineText(engine)
  const byGroup = commandsByGroup(engine)
  const { figure, lines } = await offsetTranscript(engine)

  return (
    <section
      aria-labelledby="commands-title"
      id="commands"
      className="defer mx-auto flex w-full max-w-[1200px] flex-col gap-14 px-4 py-12 sm:px-6 lg:py-20"
    >
      <SectionHeading
        id="commands-title"
        label={t("label")}
        title={t("title")}
        lead={t("lead")}
      />

      <div className="flex flex-col gap-6">
        <p className="data-mono text-fg-subtle">
          {t("count", { commands: facts.commands, aliases: facts.aliases })}
        </p>
        <div
          role="group"
          aria-label={t("boardLabel")}
          className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-3"
        >
          {COMMAND_GROUPS.map((group) => (
            <div key={group} className="flex flex-col gap-4 bg-bg p-5">
              <h3 className="label-mono">{groups(group)}</h3>
              <ul className="flex flex-wrap gap-1.5">
                {byGroup[group].map((command) => {
                  // The key and the name are on the cap; the tooltip adds
                  // whatever else types the same command.
                  const also = command.aliases.filter(
                    (alias) => alias !== command.key
                  )
                  // Joined here, so each stays a single text node.
                  const described =
                    common("labelSeparator") + command.description
                  const aliases =
                    also.length > 0 &&
                    ` · ${t("also", {
                      aliases: format.list(also, {
                        type: "unit",
                        style: "short",
                      }),
                    })}`
                  return (
                    <li key={command.name} className="tip group">
                      <span className="inline-flex h-8 items-center gap-2 rounded border border-border bg-bg-raised px-2 font-mono text-xs shadow-[0_1px_0_var(--border)] transition-colors duration-150 group-hover:border-fg-subtle">
                        <span className="font-semibold text-fg">
                          {command.key}
                        </span>
                        {command.key !== command.name && (
                          <span className="text-fg-subtle">{command.name}</span>
                        )}
                      </span>
                      <span className="sr-only">{described}</span>
                      <span role="tooltip" aria-hidden="true">
                        {command.description}
                        {aliases}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-5">
          <CommandTry
            commands={autocadCommands(engine).map(
              ({ name, aliases, description }) => ({
                name,
                aliases,
                description,
              })
            )}
            editorHref={paths.editor}
            label={t("tryLabel")}
            placeholder={t("tryPlaceholder")}
            hint={t("tryHint")}
            prompt={text.idlePrompt()}
            unknown={text.message("unknownCommand", {
              name: "{command}",
            })}
          />
        </div>
        <figure className="snap-card relative flex min-w-0 flex-col gap-4 rounded-lg border border-border bg-bg-raised p-5 lg:col-span-7">
          <SnapCorners />
          <h3 className="text-h3">{t("transcriptTitle")}</h3>
          <div className="grid items-center gap-5 md:grid-cols-[1fr_minmax(0,14rem)]">
            {/* Long prompts scroll sideways rather than wrap, as a command
                line does — so the list takes focus, for the keyboard. */}
            <ol
              tabIndex={0}
              aria-label={t("transcriptTitle")}
              className="overflow-x-auto rounded-md bg-bg-sunken p-4 data-mono text-[0.8125rem] whitespace-nowrap"
            >
              {lines.map((line, index) => (
                <li key={index}>
                  {line.kind === "command" ? (
                    <>
                      <span className="text-fg-subtle">
                        {text.idlePrompt()}{" "}
                      </span>
                      <span className="text-fg">{line.text}</span>
                    </>
                  ) : line.kind === "input" ? (
                    <>
                      <span className="text-fg-subtle">{line.prompt} </span>
                      <span className="text-fg">{line.text}</span>
                    </>
                  ) : (
                    <span className="text-fg-muted">{line.text}</span>
                  )}
                </li>
              ))}
            </ol>
            <Drawing
              markup={figure.markup}
              width={figure.width}
              height={figure.height}
              title={t("transcriptTitle")}
            />
          </div>
          <figcaption className="text-sm text-fg-subtle">
            {t("transcriptCaption")}
          </figcaption>
        </figure>
      </div>
    </section>
  )
}

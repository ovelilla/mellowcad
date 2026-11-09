import Link from "next/link"
import type { ReactNode } from "react"
import { getFormatter, getLocale, getTranslations } from "next-intl/server"

import { engineText } from "@mellowcad/engine"
import { COMMAND_GROUPS } from "@/content/commands"
import { loadEngineLocale } from "@/i18n/engine"
import { localePath } from "@/i18n/navigation"
import { sitePaths } from "@/i18n/site-paths"
import { commandPagePath, commandPageIds } from "@/lib/docs/command-pages"
import { commandsByGroup, productFacts } from "@/lib/facts"
import { pageEngineLocale } from "@/lib/plot"

import { ForwardArrow } from "./forward-arrow"
import { SectionHeading } from "./section-heading"

/** Under `md` a group shows this many commands; the reference has them all. */
const ON_A_PHONE = 8

/** The command the languages line names, by its global name. */
const OFFSET = "OFFSET"

/** A command's name in a sentence, in its own command language. */
function CommandName({
  lang,
  children,
}: {
  lang: string
  children: ReactNode
}) {
  return (
    <span dir="ltr" lang={lang} className="font-mono text-sm text-fg">
      {children}
    </span>
  )
}

export async function CommandsSection() {
  const t = await getTranslations("Commands")
  const groups = await getTranslations("Groups")
  const common = await getTranslations("Common")
  const format = await getFormatter()
  const locale = await getLocale()
  const paths = await sitePaths()
  const engine = await pageEngineLocale()
  const facts = productFacts(engine)
  const text = engineText(engine)
  const byGroup = commandsByGroup(engine)
  // A command with a page of its own links to it; read when the site is
  // built, as F1 reads them in the editor.
  const pages = new Set(commandPageIds(/*turbopackIgnore: true*/ process.cwd()))
  // OFFSET as each command language names it: the engine's own words.
  const [english, spanish, portuguese, french] = await Promise.all(
    (["en", "es", "pt-BR", "fr"] as const).map(
      async (tag) =>
        engineText(await loadEngineLocale(tag)).commandNames(OFFSET)[0]
    )
  )

  return (
    <section
      aria-labelledby="commands-title"
      id="commands"
      className="defer mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-4 py-10 sm:px-6"
    >
      <SectionHeading
        id="commands-title"
        label={t("label")}
        title={t("title")}
        lead={t("lead")}
      />

      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <p className="data-mono text-fg-subtle">
            {t("count", { commands: facts.commands, aliases: facts.aliases })}
          </p>
          <Link
            href={paths.commands}
            prefetch={false}
            className="text-sm font-medium underline-link"
          >
            {t("reference")}
            <span aria-hidden="true">
              &nbsp;
              <ForwardArrow />
            </span>
          </Link>
        </div>
        <div
          role="group"
          aria-label={t("boardLabel")}
          className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-3"
        >
          {COMMAND_GROUPS.map((group) => (
            <div key={group} className="flex flex-col gap-3 bg-bg p-4">
              <h3 className="label-mono">{groups(group)}</h3>
              <ul className="flex flex-wrap gap-1">
                {byGroup[group].map((command, index) => {
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
                  const cap = (
                    // A key cap of the command language: left to right, or
                    // -MTEXT reads MTEXT- in a right-to-left page.
                    <span
                      dir="ltr"
                      lang={text.commandTag}
                      className="inline-flex h-7 items-center gap-2 rounded border border-border bg-bg-raised px-2 font-mono text-xs shadow-[0_1px_0_var(--border)] transition-colors duration-150 group-hover:border-fg-subtle"
                    >
                      <span className="font-semibold text-fg">
                        {command.key}
                      </span>
                      {command.key !== command.name && (
                        <span className="text-fg-subtle">{command.name}</span>
                      )}
                    </span>
                  )
                  return (
                    <li
                      key={command.name}
                      className={`tip group ${index >= ON_A_PHONE ? "max-md:hidden" : ""}`}
                    >
                      {pages.has(command.id) ? (
                        <Link
                          href={localePath(locale, commandPagePath(command.id))}
                          prefetch={false}
                          className="rounded decoration-fg-subtle underline-offset-4 [&_span]:underline"
                        >
                          {cap}
                        </Link>
                      ) : (
                        cap
                      )}
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

      <div className="flex flex-col gap-2 text-sm">
        <p className="text-fg-muted">
          {t.rich("languages", {
            english,
            spanish,
            portuguese,
            french,
            global: `_${OFFSET}`,
            en: (chunks) => <CommandName lang="en">{chunks}</CommandName>,
            es: (chunks) => <CommandName lang="es">{chunks}</CommandName>,
            pt: (chunks) => <CommandName lang="pt-BR">{chunks}</CommandName>,
            fr: (chunks) => <CommandName lang="fr">{chunks}</CommandName>,
            all: (chunks) => <CommandName lang="en">{chunks}</CommandName>,
          })}
        </p>
        <p className="text-fg-subtle">{t("linked")}</p>
      </div>
    </section>
  )
}

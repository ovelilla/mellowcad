import Link from "next/link"
import { getFormatter, getLocale, getTranslations } from "next-intl/server"

import { engineText } from "@mellowcad/engine"
import { HERO_ALIASES } from "@/content/commands"
import { sitePaths } from "@/i18n/site-paths"
import { productFacts } from "@/lib/facts"
import { pageEngineLocale } from "@/lib/plot"
import { pluralMessage } from "@/lib/plural"
import { REPOSITORY_URL, SITE_URL } from "@/lib/site"

import { ContinueDrawing } from "./continue-drawing"
import { ForwardArrow } from "./forward-arrow"
import { HeroSheet } from "./hero-sheet"
import { SendToDesktop } from "./send-to-desktop"

/** A command's shortest alias, as its command language spells it. */
function shortestAlias(names: readonly string[]): string {
  const [name, ...aliases] = names
  return aliases.reduce(
    (shortest, alias) => (alias.length < shortest.length ? alias : shortest),
    aliases[0] ?? name
  )
}

/**
 * What a visitor from a search must read in five seconds, by weight: the
 * category (the H1), that it is free and needs nothing (the pill over it),
 * that it works as AutoCAD does in their command language (the lead's
 * aliases, the engine's), that it does 2D and 3D, partly, and where to go;
 * then the proof, in numbers the build reads off the code.
 */
export async function Hero() {
  const t = await getTranslations("Hero")
  const proof = await getTranslations("Proof")
  const common = await getTranslations("Common")
  const share = await getTranslations("SendToDesktop")
  const format = await getFormatter()
  const locale = await getLocale()
  const paths = await sitePaths()
  const engine = await pageEngineLocale()
  const text = engineText(engine)
  const facts = productFacts(engine)

  const examples = format.list(
    HERO_ALIASES.map((id) => {
      const names = text.commandNames(id)
      return t("alias", { alias: shortestAlias(names), command: names[0] })
    }),
    { type: "conjunction" }
  )

  const numbers = [
    {
      key: "commands",
      label: proof("commands", { count: facts.commands }),
      href: paths.commands,
    },
    { key: "aliases", label: proof("aliases", { count: facts.aliases }) },
    { key: "snaps", label: proof("snaps", { count: facts.objectSnaps }) },
    { key: "languages", label: proof("languages", { count: facts.languages }) },
    { key: "tests", label: proof("tests", { count: facts.tests }) },
    { key: "source", label: proof("source"), external: REPOSITORY_URL },
  ]

  return (
    <section
      aria-labelledby="hero-title"
      className="relative mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-4 pt-8 pb-10 sm:px-6 md:pt-10 lg:pt-12 lg:pb-12"
    >
      {/* WHY the order on a phone: the figure right under the H1, so the
          first screen shows the product, not three screens of words (the
          audit's mobile fold had no visual). */}
      <div className="grid items-center gap-6 lg:grid-cols-12 lg:gap-10">
        <div className="flex min-w-0 flex-col items-start gap-6 max-lg:contents lg:col-span-5">
          <p className="justify-self-start rounded-full border border-border bg-bg-raised px-3 py-1 text-sm text-fg-muted">
            {t("pill")}
          </p>
          <h1 id="hero-title" className="text-hero">
            {t("title")}
          </h1>
          <p className="measure text-lead max-lg:order-2">
            {t.rich("lead", {
              examples,
              brand: (chunks) => (
                <strong className="font-semibold text-fg">{chunks}</strong>
              ),
            })}
          </p>
          <div className="max-lg:order-2">
            <ContinueDrawing
              href={paths.editor}
              start={common("startDrawing")}
              resume={pluralMessage(locale, (count) =>
                t("continue", { count })
              )}
            />
          </div>
          <p className="flex flex-wrap gap-x-6 gap-y-2 text-sm max-lg:order-2">
            <Link
              href={paths.commands}
              prefetch={false}
              className="font-medium underline-link"
            >
              {t("secondaryCta", { commands: facts.commands })}
            </Link>
            <a href="#solids" className="underline-link">
              {t("solids")}
              <span aria-hidden="true">
                &nbsp;
                <ForwardArrow />
              </span>
            </a>
          </p>
          <div className="flex flex-col items-start gap-3 max-lg:order-2 md:hidden">
            <p className="text-sm text-fg-muted">{t("mobileNote")}</p>
            <SendToDesktop
              url={`${SITE_URL}${paths.editor}`}
              label={share("action")}
              copiedLabel={share("copied")}
              shareTitle={share("shareTitle")}
              shareText={share("shareText")}
            />
          </div>
        </div>
        <div className="min-w-0 max-lg:order-1 lg:col-span-7">
          <HeroSheet />
        </div>
      </div>
      <ul
        aria-label={proof("label")}
        className="flex flex-wrap items-baseline justify-center gap-x-6 gap-y-2 border-y border-border py-4 text-sm text-fg-muted tabular-nums lg:justify-between"
      >
        {numbers.map(({ key, label, href, external }) => (
          <li key={key}>
            {href ? (
              <Link href={href} prefetch={false} className="underline-link">
                {label}
              </Link>
            ) : external ? (
              <a href={external} className="underline-link">
                {label}
              </a>
            ) : (
              label
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

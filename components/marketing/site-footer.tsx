import Link from "next/link"
import { getFormatter, getLocale, getTranslations } from "next-intl/server"

import { productFacts } from "@/lib/facts"
import { sitePaths } from "@/i18n/site-paths"
import { CONTACT_EMAIL } from "@/lib/site"

import { LanguageLinks } from "@/components/language-links"

import { LogoMark } from "./logo"

// The title block's own data, not words: the same in every language.
const DRAWING_NUMBER = "MC-001"
const SCALE = "1:1"

function Cell({
  label,
  children,
  className = "",
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`flex flex-col gap-1 bg-bg-raised px-4 py-3 ${className}`}>
      <span className="label-mono text-[0.625rem]">{label}</span>
      <span className="data-mono text-fg">{children}</span>
    </div>
  )
}

/**
 * The footer is the sheet's title block: identity, links and the sheet's own
 * metadata — its language among them, a plain list of links that is always in
 * the HTML, so every version of the page is found from every other.
 */
export async function SiteFooter() {
  const t = await getTranslations("Footer")
  const common = await getTranslations("Common")
  const header = await getTranslations("Header")
  const locale = await getLocale()
  const format = await getFormatter()
  const facts = productFacts()
  const paths = await sitePaths()

  const links = [
    [common("startDrawing"), paths.editor],
    [header("commands"), `${paths.home}#commands`],
    [header("roadmap"), `${paths.home}#roadmap`],
    [header("faq"), `${paths.home}#faq`],
  ] as const

  return (
    <footer className="mx-auto w-full max-w-[1200px] px-4 pb-10 sm:px-6">
      <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border lg:grid-cols-[1.1fr_1.6fr_1fr]">
        <div className="flex flex-col gap-2 bg-bg-raised p-5">
          <span className="inline-flex items-center gap-2 font-semibold tracking-[-0.02em]">
            <LogoMark className="size-6" />
            {common("brand")}
          </span>
          <span className="text-sm text-fg-muted">{t("tagline")}</span>
        </div>

        <div className="flex flex-col gap-4 bg-bg-raised p-5 text-sm">
          <div className="grid grid-cols-[5.5rem_1fr] gap-3">
            <span className="pt-0.5 label-mono">{t("product")}</span>
            <ul className="flex flex-wrap gap-x-4 gap-y-1">
              {links.map(([label, href]) => (
                <li key={href}>
                  {href === paths.editor ? (
                    <a href={href} className="underline-link">
                      {label}
                    </a>
                  ) : (
                    <Link href={href} className="underline-link">
                      {label}
                    </Link>
                  )}
                </li>
              ))}
              <li>
                <Link href={paths.privacy} className="underline-link">
                  {t("privacy")}
                </Link>
              </li>
            </ul>
          </div>
          <div className="grid grid-cols-[5.5rem_1fr] gap-3">
            <span className="pt-0.5 label-mono">{t("contact")}</span>
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=MellowCAD`}
              dir="ltr"
              className="break-all underline-link"
            >
              {CONTACT_EMAIL}
            </a>
          </div>
        </div>

        <nav
          aria-label={t("language")}
          className="flex flex-col gap-3 bg-bg-raised p-5 text-sm"
        >
          <span className="label-mono">{t("language")}</span>
          <LanguageLinks
            current={locale}
            className="flex flex-wrap gap-x-4 gap-y-1"
            linkClassName="underline-link aria-[current=true]:text-fg-muted aria-[current=true]:no-underline"
          />
        </nav>

        <div className="grid grid-cols-2 gap-px bg-border sm:grid-cols-4 lg:col-span-3">
          <Cell label={t("drawingNumber")}>{DRAWING_NUMBER}</Cell>
          <Cell label={t("revision")}>
            {/* The page is prerendered, so "now" is when this revision was built. */}
            {facts.version} ·{" "}
            {format.dateTime(new Date(), { dateStyle: "medium" })}
          </Cell>
          <Cell label={t("scale")}>{SCALE}</Cell>
          <Cell label={t("sheet")}>{t("sheetValue")}</Cell>
        </div>
      </div>
      <p className="mt-6 max-w-3xl text-xs text-fg-subtle">{t("trademark")}</p>
    </footer>
  )
}

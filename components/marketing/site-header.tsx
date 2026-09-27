import { Globe, Menu, X } from "lucide-react"
import Link from "next/link"
import { getLocale, getTranslations } from "next-intl/server"

import { LanguageLinks } from "@/components/language-links"

import { sitePaths } from "@/i18n/site-paths"

import { Logo } from "./logo"

const SECTIONS = [
  ["features", "#features"],
  ["commands", "#commands"],
  ["roadmap", "#roadmap"],
  ["faq", "#faq"],
] as const

/**
 * Sticky, with the call to action always in reach. It turns from transparent
 * to raised as the page scrolls — a scroll-driven animation where there is
 * one, a raised bar from the start where there is not. The small-screen menu
 * is a native popover, so it opens and closes without any script.
 */
export async function SiteHeader() {
  const t = await getTranslations("Header")
  const common = await getTranslations("Common")
  const paths = await sitePaths()
  const locale = await getLocale()

  return (
    <header className="header-surface sticky top-0 z-40 border-b border-border bg-bg-raised/92 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center gap-6 px-4 sm:px-6">
        <Link
          href={paths.home}
          aria-label={common("home")}
          className="rounded-sm"
        >
          <Logo />
        </Link>
        <nav aria-label={t("navLabel")} className="hidden flex-1 md:block">
          <ul className="flex items-center justify-center gap-8 text-sm text-fg-muted">
            {SECTIONS.map(([key, href]) => (
              <li key={key}>
                <a
                  href={href}
                  className="transition-colors duration-150 hover:text-fg"
                >
                  {t(key)}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ml-auto flex items-center gap-2 md:ml-0">
          {/* On a phone the languages are in the menu: the bar has no room. */}
          <button
            type="button"
            popoverTarget="language-menu"
            aria-label={t("language")}
            className="hidden size-9 place-items-center rounded-md text-fg-muted hover:text-fg md:grid"
          >
            <Globe className="size-5" aria-hidden="true" />
          </button>
          <a
            href={paths.editor}
            className="inline-flex h-9 items-center rounded-md bg-accent px-3.5 text-sm font-medium text-accent-ink transition-[filter] duration-150 hover:brightness-110"
          >
            {t("cta")}
            <span aria-hidden="true">&nbsp;→</span>
          </a>
          <button
            type="button"
            popoverTarget="site-menu"
            aria-label={t("menu")}
            className="grid size-9 place-items-center rounded-md text-fg-muted hover:text-fg md:hidden"
          >
            <Menu className="size-5" aria-hidden="true" />
          </button>
        </div>
      </div>
      <div id="site-menu" popover="auto" className="menu md:hidden">
        <nav aria-label={t("navLabel")}>
          <ul className="flex flex-col">
            {SECTIONS.map(([key, href]) => (
              <li key={key}>
                <a
                  href={href}
                  className="block rounded-md px-3 py-2.5 text-fg hover:bg-bg"
                >
                  {t(key)}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <nav
          aria-label={t("language")}
          className="mt-2 border-t border-border pt-2"
        >
          <LanguageLinks
            current={locale}
            className="flex flex-col"
            linkClassName="block rounded-md px-3 py-2.5 text-fg-muted hover:bg-bg aria-[current=true]:text-fg"
          />
        </nav>
        <button
          type="button"
          popoverTarget="site-menu"
          popoverTargetAction="hide"
          aria-label={t("closeMenu")}
          className="absolute top-2 right-2 grid size-9 place-items-center rounded-md text-fg-muted hover:text-fg"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </div>
      <nav
        id="language-menu"
        popover="auto"
        aria-label={t("language")}
        className="menu language-menu"
      >
        <LanguageLinks
          current={locale}
          className="flex flex-col"
          linkClassName="block rounded-md px-3 py-2 text-sm text-fg-muted hover:bg-bg aria-[current=true]:text-fg"
        />
      </nav>
    </header>
  )
}

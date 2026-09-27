"use client"

import { usePathname } from "next/navigation"

import { localePath, unlocalizedPath } from "@/i18n/navigation"
import { type AppLocale, LANGUAGE_NAMES, LIVE_LOCALES } from "@/i18n/routing"

/**
 * The page being read, in every live language: plain links, so a crawler
 * follows them and a switch is a full page load — changing language changes
 * `lang`, `dir`, the fonts and the engine's catalog. Shared by the landing and
 * the editor; the classes come from each, which style it their own way.
 */
export function LanguageLinks({
  current,
  className,
  linkClassName,
}: {
  current: AppLocale
  className?: string
  linkClassName?: string
}) {
  const path = unlocalizedPath(usePathname())
  if (LIVE_LOCALES.length < 2) return null
  return (
    <ul className={className}>
      {LIVE_LOCALES.map((locale) => (
        <li key={locale}>
          <a
            href={localePath(locale, path)}
            hrefLang={locale}
            lang={locale}
            aria-current={locale === current ? "true" : undefined}
            className={linkClassName}
          >
            {LANGUAGE_NAMES[locale]}
          </a>
        </li>
      ))}
    </ul>
  )
}

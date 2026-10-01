"use client"

import { usePathname } from "next/navigation"

import { localePath, unlocalizedPath } from "@/i18n/navigation"
import { type AppLocale, LANGUAGE_NAMES, LIVE_LOCALES } from "@/i18n/routing"

/**
 * The page being read, in every live language — none when only one is live.
 * Plain links, so a crawler follows them and a switch is a full page load:
 * changing language changes `lang`, `dir`, the fonts and the engine's catalog.
 */
export function useLanguageLinks(current: AppLocale) {
  const path = unlocalizedPath(usePathname())
  if (LIVE_LOCALES.length < 2) return []
  return LIVE_LOCALES.map((locale) => ({
    locale,
    href: localePath(locale, path),
    name: LANGUAGE_NAMES[locale],
    current: locale === current,
  }))
}

/**
 * The language links as a list, for the landing; the classes come from each
 * place, which styles it its own way.
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
  const links = useLanguageLinks(current)
  if (links.length === 0) return null
  return (
    <ul className={className}>
      {links.map((link) => (
        <li key={link.locale}>
          <a
            href={link.href}
            hrefLang={link.locale}
            lang={link.locale}
            aria-current={link.current ? "true" : undefined}
            className={linkClassName}
          >
            {link.name}
          </a>
        </li>
      ))}
    </ul>
  )
}

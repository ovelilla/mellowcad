"use client"

import { usePathname } from "next/navigation"

import { languageLinks, unlocalizedPath } from "@/i18n/navigation"
import { type AppLocale } from "@/i18n/routing"

/**
 * The language links as a list, for the landing; the list's class styles its
 * links (`[&_a]:…`), as each place styles them its own way. WHY on the list
 * and with no `hrefLang`: every live language adds a link to three lists on
 * every landing, and a class string and an `hrefLang` per link were some 200
 * of a landing's Brotli bytes, past its budget (docs/i18n/ja.md, "Going
 * live"); Google reads the alternates from `<link rel="alternate">` and the
 * sitemap, never from an anchor's `hreflang`. `lang` stays: a screen reader
 * reads «日本語» in Japanese.
 */
export function LanguageLinks({
  current,
  className,
}: {
  current: AppLocale
  className?: string
}) {
  const links = languageLinks(current, unlocalizedPath(usePathname()))
  if (links.length === 0) return null
  return (
    <ul className={className}>
      {links.map((link) => (
        <li key={link.locale}>
          <a
            href={link.href}
            lang={link.locale}
            aria-current={link.current ? "true" : undefined}
          >
            {link.name}
          </a>
        </li>
      ))}
    </ul>
  )
}

"use client"

import { usePathname } from "next/navigation"

import { languageLinks, unlocalizedPath } from "@/i18n/navigation"
import { type AppLocale } from "@/i18n/routing"

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
  const links = languageLinks(current, unlocalizedPath(usePathname()))
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

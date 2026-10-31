import { createNavigation } from "next-intl/navigation"
import { describe, expect, it } from "vitest"

import {
  languageLinks,
  localePath,
  localeUrl,
  unlocalizedPath,
} from "./navigation"
import {
  LIVE_LOCALES,
  localeParams,
  localeSegment,
  routing,
  segmentLocale,
} from "./routing"

describe("localePath", () => {
  const { getPathname } = createNavigation(routing)

  it("builds the path next-intl's getPathname builds", () => {
    for (const locale of routing.locales) {
      for (const href of ["/", "/draw", "/privacy", "/og", "/og/draw"]) {
        expect(localePath(locale, href), `${locale} ${href}`).toBe(
          getPathname({ locale, href })
        )
      }
    }
  })

  it("leaves English unprefixed and names the others", () => {
    expect(localePath("en", "/draw")).toBe("/draw")
    expect(localePath("es", "/")).toBe("/es")
    expect(localePath("ar", "/privacy")).toBe("/ar/privacy")
    expect(localeUrl("en", "/")).toBe("https://mellowcad.com/")
    expect(localeUrl("es", "/draw")).toBe("https://mellowcad.com/es/draw")
  })

  it("prefixes a language with its prefix, not its tag", () => {
    expect(localePath("pt-BR", "/")).toBe("/pt-br")
    expect(localePath("pt-BR", "/draw")).toBe("/pt-br/draw")
  })
})

describe("the [locale] segment", () => {
  it("is each language's prefix, and maps back to its tag", () => {
    expect(localeSegment("es")).toBe("es")
    expect(localeSegment("pt-BR")).toBe("pt-br")
    for (const locale of routing.locales) {
      expect(segmentLocale(localeSegment(locale))).toBe(locale)
    }
    expect(localeParams()).toEqual(
      routing.locales.map((locale) => ({ locale: localeSegment(locale) }))
    )
  })

  it("names no language by its tag where the prefix differs", () => {
    expect(segmentLocale("pt-BR")).toBeUndefined()
    expect(segmentLocale("xx")).toBeUndefined()
  })
})

describe("unlocalizedPath", () => {
  it("drops the prefix, whatever it is", () => {
    expect(unlocalizedPath("/es/privacy")).toBe("/privacy")
    expect(unlocalizedPath("/en/privacy")).toBe("/privacy")
    expect(unlocalizedPath("/pt-br")).toBe("/")
    expect(unlocalizedPath("/pt-br/draw")).toBe("/draw")
    expect(unlocalizedPath("/pt-BR/draw")).toBe("/pt-BR/draw")
    expect(unlocalizedPath("/privacy")).toBe("/privacy")
  })
})

describe("languageLinks", () => {
  it("offers the page in every live language, marking the current one", () => {
    const links = languageLinks("es", "/draw")
    expect(links.map((link) => link.locale)).toEqual(
      LIVE_LOCALES.length < 2 ? [] : LIVE_LOCALES
    )
    for (const link of links) {
      expect(link.href).toBe(localePath(link.locale, "/draw"))
      expect(link.current).toBe(link.locale === "es")
    }
  })
})

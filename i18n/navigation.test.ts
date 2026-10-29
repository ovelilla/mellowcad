import { createNavigation } from "next-intl/navigation"
import { describe, expect, it } from "vitest"

import { languageLinks, localePath, localeUrl } from "./navigation"
import { LIVE_LOCALES, routing } from "./routing"

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

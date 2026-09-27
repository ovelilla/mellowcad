import { createNavigation } from "next-intl/navigation"
import { describe, expect, it } from "vitest"

import { localePath, localeUrl } from "./navigation"
import { routing } from "./routing"

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

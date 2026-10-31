import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

import { loadEditorLocale } from "./editor"
import { loadEngineLocale } from "./engine"
import { COMMAND_LANGUAGE, LOCALE_STATUS, routing } from "./routing"

// Each catalog's own completeness is its test's (messages.test.ts, the
// engine's and the editor's locales.test.ts); this one holds a live language
// to having every piece, so none of it falls back to English unseen, and to
// its page in docs/i18n/, where its words and its review are kept.
const LIVE_TRANSLATIONS = routing.locales.filter(
  (locale) =>
    locale !== routing.defaultLocale && LOCALE_STATUS[locale] === "live"
)

const repoFile = (...parts: string[]) => join(__dirname, "..", ...parts)

function engineCatalog(locale: string): Record<string, unknown> | undefined {
  const file = repoFile("cad", "locales", `${locale}.json`)
  return existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : undefined
}

describe.each(LIVE_TRANSLATIONS)("the live language %s", (locale) => {
  it("draws with its own engine catalog", async () => {
    expect((await loadEngineLocale(locale))?.tag).toBe(locale)
  })

  it("shows the editor in its own catalog", async () => {
    expect((await loadEditorLocale(locale))?.tag).toBe(locale)
  })

  it("brings a command language exactly when its AutoCAD has one", () => {
    expect(engineCatalog(locale)?.commands !== undefined).toBe(
      COMMAND_LANGUAGE[locale] === "localized"
    )
  })

  it("has its page in docs/i18n/", () => {
    expect(existsSync(repoFile("docs", "i18n", `${locale}.md`))).toBe(true)
  })
})

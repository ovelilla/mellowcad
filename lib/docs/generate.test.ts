import { existsSync } from "node:fs"
import { join } from "node:path"

import { describe, expect, test } from "vitest"

import { routing } from "@/i18n/routing"

import { commandsPage, pageFile, shortcutsPage, translatesPage } from "./generate"
import { githubAnchor } from "./use"

const PAGES = { commands: commandsPage, shortcuts: shortcutsPage }

// The generated pages are file snapshots: a catalog, a message or a coverage
// heading that changes fails here until `npx vitest run -u` writes them again.
// A draft that has not translated a page yet has none: it serves English's.
describe.each(routing.locales)("the generated pages in %s", (locale) => {
  test.each(Object.keys(PAGES) as (keyof typeof PAGES)[])("%s", async (page) => {
    const file = `../../content/docs/${pageFile(page, locale)}`
    if (!(await translatesPage(locale, page))) {
      expect(existsSync(join(__dirname, file))).toBe(false)
      return
    }
    await expect(await PAGES[page](locale)).toMatchFileSnapshot(file)
  })
})

test("a coverage anchor is GitHub's", () => {
  expect(githubAnchor("`LINE` / `L` · es `LINEA` / `L`")).toBe("line--l--es-linea--l")
  expect(githubAnchor("`PAN` / `P` / `-PAN` / `-P` · es `ENCUADRE`")).toBe(
    "pan--p---pan---p--es-encuadre"
  )
})

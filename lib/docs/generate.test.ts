import { existsSync } from "node:fs"
import { join } from "node:path"

import { describe, expect, test } from "vitest"

import { LIVE_LOCALES, routing } from "@/i18n/routing"

import { COMMAND_PAGES_DIR, localizedFile, notedCommands, readNotes } from "./command-pages"
import {
  GENERATED_PAGES,
  commandPage,
  commandsPage,
  pageFile,
  shortcutsPage,
  translatesPage,
  type GeneratedPage,
} from "./generate"
import { githubAnchor } from "./use"

const PAGES = { commands: commandsPage, shortcuts: shortcutsPage }

// The generated pages are file snapshots: a catalog, a message, a command's
// notes or a coverage heading that changes fails here until
// `npx vitest run lib/docs/generate.test.ts -u` writes them again. A draft
// that has not translated a page yet has none: it serves English's.
describe.each(routing.locales)("the generated pages in %s", (locale) => {
  test.each(Object.keys(GENERATED_PAGES) as GeneratedPage[])("%s", async (page) => {
    const file = `../../content/docs/${pageFile(page, locale)}`
    if (!(await translatesPage(locale, page))) {
      expect(existsSync(join(__dirname, file))).toBe(false)
      return
    }
    await expect(await PAGES[page](locale)).toMatchFileSnapshot(file)
  })
})

// A command with notes has a page in every language its notes are written
// in, every live one at least (`docs:check` names the missing notes).
describe.each(notedCommands(process.cwd()))("the page of %s", (id) => {
  test.each(routing.locales)("in %s", async (locale) => {
    const file = `../../${COMMAND_PAGES_DIR}/${localizedFile(id, locale, "mdx")}`
    if (!readNotes(process.cwd(), id, locale)) {
      expect(LIVE_LOCALES).not.toContain(locale)
      expect(existsSync(join(__dirname, file))).toBe(false)
      return
    }
    await expect(await commandPage(id, locale)).toMatchFileSnapshot(file)
  })
})

test("a coverage anchor is GitHub's", () => {
  expect(githubAnchor("`LINE` / `L` · es `LINEA` / `L`")).toBe("line--l--es-linea--l")
  expect(githubAnchor("`PAN` / `P` / `-PAN` / `-P` · es `ENCUADRE`")).toBe(
    "pan--p---pan---p--es-encuadre"
  )
})

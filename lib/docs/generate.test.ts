import { describe, expect, test } from "vitest"

import { routing } from "@/i18n/routing"

import { commandsPage, pageFile } from "./generate"
import { githubAnchor } from "./use"

// The generated pages are file snapshots: a catalog, a message or a coverage
// heading that changes fails here until `npx vitest run -u` writes them again.
describe.each(routing.locales)("the generated pages in %s", (locale) => {
  test("commands", async () => {
    await expect(await commandsPage(locale)).toMatchFileSnapshot(
      `../../content/docs/${pageFile("commands", locale)}`
    )
  })
})

test("a coverage anchor is GitHub's", () => {
  expect(githubAnchor("`LINE` / `L` · es `LINEA` / `L`")).toBe("line--l--es-linea--l")
  expect(githubAnchor("`PAN` / `P` / `-PAN` / `-P` · es `ENCUADRE`")).toBe(
    "pan--p---pan---p--es-encuadre"
  )
})

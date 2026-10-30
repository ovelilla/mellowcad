import { readFileSync, readdirSync } from "node:fs"
import path from "node:path"

import { expect, test } from "vitest"

import { DOCS_SESSIONS } from "@/content/figures"

import { CONTENT_DIR } from "./check"

// A written page's <Session name> is rendered by the docs' MDX components at
// build time; a name that is no session would only fail there.
test("every session a page names exists, and every session is shown", () => {
  const named = readdirSync(CONTENT_DIR)
    .filter((file) => file.endsWith(".mdx"))
    .flatMap((file) =>
      [...readFileSync(path.join(CONTENT_DIR, file), "utf8").matchAll(/<Session\s+name="([^"]+)"/g)].map(
        (match) => match[1]
      )
    )
  expect(named.filter((name) => !(name in DOCS_SESSIONS))).toEqual([])
  expect(Object.keys(DOCS_SESSIONS).filter((name) => !named.includes(name))).toEqual([])
})

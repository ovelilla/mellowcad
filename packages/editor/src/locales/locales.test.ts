import { readFileSync } from "node:fs"
import { join } from "node:path"
import { parse } from "@formatjs/icu-messageformat-parser"
import compile from "icu-minify/compile"
import { describe, expect, it } from "vitest"

import {
  EDITOR_LOCALES_DIR,
  editorModule,
  editorTags,
  readEditorCatalog,
  valuesModule,
} from "../../../../scripts/locales/editor"
import { sourceDeclaration } from "../../../../scripts/locales/compile"
import { flatten, plurals, signature } from "../../../../scripts/locales/icu"
import { en } from "./en"
import { extendEditorLocale, mergeMessages } from "./extend"

const english = flatten(readEditorCatalog("en"))

describe("the editor's catalogs", () => {
  it("are committed exactly as the source compiles to", () => {
    for (const tag of editorTags()) {
      const committed = readFileSync(
        join(EDITOR_LOCALES_DIR, `${tag}.ts`),
        "utf8"
      )
      expect(committed, tag).toBe(editorModule(tag, readEditorCatalog(tag)))
    }
    const values = readFileSync(join(EDITOR_LOCALES_DIR, "values.ts"), "utf8")
    expect(values).toBe(valuesModule(readEditorCatalog("en")))
    const declaration = readFileSync(
      join(EDITOR_LOCALES_DIR, "en.d.json.ts"),
      "utf8"
    )
    expect(declaration).toBe(sourceDeclaration(readEditorCatalog("en")))
  })

  it("are each a public entry point, beside the barrel and nothing else", () => {
    const { exports } = JSON.parse(
      readFileSync(join(EDITOR_LOCALES_DIR, "../../package.json"), "utf8")
    ) as { exports: Record<string, unknown> }
    expect(Object.keys(exports).sort()).toEqual(
      [
        ".",
        "./package.json",
        ...editorTags().map((tag) => `./locales/${tag}`),
      ].sort()
    )
  })

  it("hold ICU the message parser accepts, every plural with `other`", () => {
    for (const tag of editorTags()) {
      for (const [key, message] of flatten(readEditorCatalog(tag))) {
        for (const options of plurals(parse(message))) {
          expect(options, `${tag}: ${key}`).toContain("other")
        }
      }
    }
  })

  it("translate only English's keys, with its arguments and tags", () => {
    for (const tag of editorTags()) {
      for (const [key, message] of flatten(readEditorCatalog(tag))) {
        const source = english.get(key)
        expect(source, `${tag}: ${key} is not an English key`).toBeDefined()
        expect(signature(parse(message)), `${tag}: ${key}`).toEqual(
          signature(parse(source!))
        )
      }
    }
  })
})

describe("a language laid over English", () => {
  it("keeps English for every message it leaves out", () => {
    const merged = mergeMessages(
      { A: { one: "One", two: "Two" }, B: { three: "Three" } },
      { A: { two: "Dos" } }
    )
    expect(merged).toEqual({
      A: { one: "One", two: "Dos" },
      B: { three: "Three" },
    })
  })

  it("replaces a compiled message whole", () => {
    const merged = mergeMessages(
      { A: { greet: compile("Hello {name}") } },
      { A: { greet: compile("Hola {name}") } }
    )
    expect(merged).toEqual({ A: { greet: compile("Hola {name}") } })
  })

  it("is how a host gives the editor words of its own", () => {
    const own = extendEditorLocale(en, { TopBar: { save: "Keep" } })
    expect(own.tag).toBe("en")
    expect(own.messages.TopBar?.save).toBe("Keep")
    expect(own.messages.TopBar?.open).toBe(en.messages.TopBar.open)
    expect(en.messages.TopBar.save).not.toBe("Keep")
  })
})

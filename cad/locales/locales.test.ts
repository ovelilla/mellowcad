import { readFileSync, readdirSync } from "node:fs"
import { join, resolve } from "node:path"
import { describe, expect, it } from "vitest"
import {
  type MessageFormatElement,
  isArgumentElement,
  isPluralElement,
  isSelectElement,
  isTagElement,
  parse,
} from "@formatjs/icu-messageformat-parser"

import {
  LOCALES_DIR,
  catalogTags,
  localeModule,
  readCatalog,
} from "../../scripts/locales/compile"
import { TOOL_COMMANDS } from "../application/CommandLine"
import { abbreviationOf } from "../i18n/keywords"
import { en } from "./en"

type Tree = { readonly [key: string]: Tree | string | readonly string[] }

/** Every ICU message of a catalog source, by its path. */
function messages(source: Tree, path = ""): [string, string][] {
  return Object.entries(source).flatMap(([key, value]) => {
    const at = path === "" ? key : `${path}.${key}`
    if (at === "commands.names" || at === "commands.keywords") return []
    if (typeof value === "string") return [[at, value]]
    if (Array.isArray(value)) throw new Error(`${at}: a list is not a message`)
    return messages(value as Tree, at)
  })
}

/** What a message takes: its arguments and tags, each with its kind. */
function signature(elements: MessageFormatElement[]): string[] {
  return elements
    .flatMap((element): string[] => {
      if (isArgumentElement(element)) return [`${element.value}`]
      if (isPluralElement(element) || isSelectElement(element)) {
        return [
          `${element.value}:${isPluralElement(element) ? "plural" : "select"}`,
          ...Object.values(element.options).flatMap((option) =>
            signature(option.value)
          ),
        ]
      }
      if (isTagElement(element)) {
        return [`<${element.value}>`, ...signature(element.children)]
      }
      return []
    })
    .filter((entry, index, all) => all.indexOf(entry) === index)
    .sort()
}

const english = readCatalog("en") as Tree

describe("the engine's catalogs", () => {
  it("are committed exactly as the source compiles to", () => {
    for (const tag of catalogTags()) {
      const committed = readFileSync(join(LOCALES_DIR, `${tag}.ts`), "utf8")
      expect(committed.replace(/\r\n/g, "\n")).toBe(
        localeModule(tag, readCatalog(tag))
      )
    }
  })

  it("hold ICU that the message parser accepts", () => {
    for (const tag of catalogTags()) {
      for (const [path, message] of messages(readCatalog(tag) as Tree)) {
        expect(() => parse(message), `${tag}: ${path}`).not.toThrow()
      }
    }
  })

  it("translate only keys English has, with English's arguments and tags", () => {
    const reference = new Map(messages(english))
    for (const tag of catalogTags().filter((tag) => tag !== "en")) {
      for (const [path, message] of messages(readCatalog(tag) as Tree)) {
        const source = reference.get(path)
        expect(source, `${tag}: ${path} is not an English key`).toBeDefined()
        expect(signature(parse(message)), `${tag}: ${path}`).toEqual(
          signature(parse(source!))
        )
      }
    }
  })

  // The names of linetypes and hatch patterns are the drawing's data, never
  // translated; everything else a language must say itself.
  it("leave nothing of the interface to English in another language", () => {
    for (const tag of catalogTags().filter((tag) => tag !== "en")) {
      const own = messages({
        interface: (readCatalog(tag) as Tree).interface,
      } as Tree)
      const paths = new Set(own.map(([path]) => path))
      for (const [path] of messages({ interface: english.interface } as Tree)) {
        if (/^interface.(linetype|hatchPattern)./.test(path)) continue
        expect(paths.has(path), `${tag}: ${path}`).toBe(true)
      }
    }
  })

  // There is no Arabic AutoCAD: someone who drafts in Arabic reads English
  // AutoCAD's prompts every day, so Arabic's command language is the global
  // one (docs/autocad-coverage.md, "Command line").
  it("give Arabic the global command language", () => {
    expect(readCatalog("ar")).not.toHaveProperty("commands")
  })

  it("give plurals an other branch, which every language needs", () => {
    const withoutOther = (elements: MessageFormatElement[]): boolean =>
      elements.some(
        (element) =>
          (isPluralElement(element) && !("other" in element.options)) ||
          (isTagElement(element) && withoutOther(element.children))
      )
    for (const tag of catalogTags()) {
      for (const [path, message] of messages(readCatalog(tag) as Tree)) {
        expect(withoutOther(parse(message)), `${tag}: ${path}`).toBe(false)
      }
    }
  })
})

describe("the command vocabulary", () => {
  const names: Readonly<Record<string, readonly string[]>> = en.commands.names
  // The inventory: the English module leaves keywords out (each is its id).
  const keywords = (english.commands as Tree).keywords as Readonly<
    Record<string, Readonly<Record<string, string>>>
  >

  it("names every command a tool runs", () => {
    for (const command of Object.values(TOOL_COMMANDS)) {
      expect(names[command], command).toBeDefined()
    }
  })

  it("never gives two commands the same name or alias", () => {
    const typed = Object.values(names).flat()
    expect(new Set(typed).size).toBe(typed.length)
  })

  it("marks an abbreviation in capitals on every keyword", () => {
    for (const [command, table] of Object.entries(keywords)) {
      expect(names[command], command).toBeDefined()
      for (const [id, word] of Object.entries(table)) {
        expect(abbreviationOf(word), `${command} ${id}`).not.toBe("")
      }
    }
  })

  it("labels every tool", () => {
    const labels: Readonly<Record<string, unknown>> = en.interface.tool
    for (const tool of Object.keys(TOOL_COMMANDS)) {
      expect(labels[tool], tool).toBeDefined()
    }
  })

  // WHY: toLocaleUpperCase() under a Turkish locale turns `i` into `İ`, and a
  // typed command or keyword must match whatever the page's language is.
  it("never compares typed names under the page's locale", () => {
    const sources: string[] = []
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const path = join(dir, entry.name)
        if (entry.isDirectory()) walk(path)
        else if (path.endsWith(".ts") && !path.endsWith(".test.ts")) {
          sources.push(readFileSync(path, "utf8"))
        }
      }
    }
    walk(resolve(LOCALES_DIR, ".."))
    for (const source of sources) {
      expect(source).not.toMatch(/toLocale(Upper|Lower)Case/)
    }
  })
})

describe("every command language", () => {
  /**
   * Which keywords share a prompt, read off the English surface the engine
   * walks (`LINE [Close/Undo]:`), plus TEXT's justification list, which is
   * worded as a message. A value shown beside a keyword (`Erase: No`) is not
   * a keyword of that prompt.
   */
  function sharedPrompts(): {
    command: string
    prompt?: string
    ids: string[]
  }[] {
    const surface = readFileSync(
      resolve(LOCALES_DIR, "../application/__snapshots__/englishSurface.txt"),
      "utf8"
    )
    // `LINE [Close/Undo]:`, or a converted command's question with them:
    // `UCS Specify origin of UCS or [NAmed/…/ZAxis] <World>:`.
    const prompts = [
      ...surface.matchAll(
        /^ {2}prompt: (\S+) (?:([^[\n]*) )?\[([^\]\n]+)\](?: <[^>\n]*>)?:$/gm
      ),
    ].map(([, command, question, list]) => ({
      command,
      // Its id, for the words one prompt spells otherwise (promptKeywords).
      prompt: Object.entries(en.commands.prompts).find(
        ([, text]) => text === question
      )?.[0],
      ids: list.split("/").map((entry) => entry.split(": ")[0]),
    }))
    const justify = ["Left", "Center", "Right", "Middle"]
    const corners = ["TL", "TC", "TR", "ML", "MC", "MR", "BL", "BC", "BR"]
    return [...prompts, { command: "TEXT", ids: [...justify, ...corners] }]
  }

  it("gives each keyword an abbreviation of its own in every prompt", () => {
    const prompts = sharedPrompts()
    expect(prompts.length).toBeGreaterThan(40)
    for (const tag of catalogTags()) {
      type Words = Readonly<Record<string, Readonly<Record<string, string>>>>
      const commands = (readCatalog(tag) as Tree).commands as Tree | undefined
      const keywords = commands?.keywords as Words | undefined
      const promptKeywords = (commands?.promptKeywords ?? {}) as Words
      if (!keywords) continue
      for (const { command, prompt, ids } of prompts) {
        const words = ids.map(
          (id) =>
            (prompt && promptKeywords[prompt]?.[id]) ??
            keywords[command]?.[id] ??
            id
        )
        const abbreviations = words.map((word) =>
          abbreviationOf(word).toUpperCase()
        )
        expect(
          new Set(abbreviations).size,
          `${tag} ${command} [${words.join("/")}]`
        ).toBe(abbreviations.length)
      }
    }
  })
})

describe("a command language of our own", () => {
  /** Every path under `commands`, names and keyword tables included. */
  function paths(tree: Tree, prefix = ""): string[] {
    return Object.entries(tree).flatMap(([key, value]) =>
      typeof value === "string" || Array.isArray(value)
        ? [`${prefix}${key}`]
        : paths(value as Tree, `${prefix}${key}.`)
    )
  }

  // A catalog that brings a command language brings all of it: a gap would
  // leave one command, keyword or prompt in English in the middle of Spanish.
  it("is complete or absent", () => {
    const reference = paths(english.commands as Tree)
    for (const tag of catalogTags().filter((tag) => tag !== "en")) {
      const commands = (readCatalog(tag) as Tree).commands as Tree | undefined
      if (!commands) continue
      expect(paths(commands).sort(), tag).toEqual(reference.sort())
    }
  })

  it("never gives two commands the same name or alias", () => {
    for (const tag of catalogTags()) {
      const commands = (readCatalog(tag) as Tree).commands as Tree | undefined
      if (!commands) continue
      const typed = Object.values(
        commands.names as Readonly<Record<string, readonly string[]>>
      ).flat()
      expect(new Set(typed).size, tag).toBe(typed.length)
    }
  })
})

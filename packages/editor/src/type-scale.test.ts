import { readdirSync, readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

import { cn } from "./utils"

const ROOT = path.resolve(import.meta.dirname, "../../..")

/** The editor's chrome: what the type scale governs. */
const DIRS = ["packages/editor/src"]

/**
 * A size, weight, line height or tracking that is not a role of the scale
 * (`text-ui`, `text-title` in globals.css): a Tailwind size (`text-xs`,
 * `text-[11px]`), a weight (`font-semibold`), a `leading-*` or `tracking-*`.
 * The role carries all of them.
 */
const OFF_SCALE =
  /(?<=^|[\s"'`:])(?:text-(?:xs|sm|base|lg|[2-9]?xl|\[[^\]]*\])|font-(?:thin|extralight|light|normal|medium|semibold|bold|extrabold|black)|leading-[\w[\].-]+|tracking-[\w[\].-]+)(?=$|[\s"'`])/g

/**
 * A text colour with an opacity (`text-muted-foreground/70`,
 * `placeholder:text-muted-foreground/60`): the three steps are foreground,
 * muted-foreground and faint-foreground, never a fraction of one.
 */
const TEXT_OPACITY =
  /(?<=^|[\s"'`:])text-(?:foreground|muted-foreground|faint-foreground|popover-foreground|card-foreground|accent-foreground|primary|active|active-foreground|destructive)\/\d+(?=$|[\s"'`])/g

/**
 * Each exception with its reason, file → exact match; none yet. A class that
 * comes back with `shadcn add` is changed to a role rather than listed here.
 */
const ALLOWED: Record<string, Record<string, string>> = {}

function* walk(dir: string): Generator<string> {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) yield* walk(full)
    else if (/\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name))
      yield full
  }
}

/** Every class outside the scale, outside comments, as `file:line match`. */
function offScale(): string[] {
  const found: string[] = []
  for (const dir of DIRS) {
    for (const file of walk(path.join(ROOT, dir))) {
      const rel = path.relative(ROOT, file).split(path.sep).join("/")
      const source = readFileSync(file, "utf8").replace(
        /\/\*[\s\S]*?\*\//g,
        (comment) => comment.replace(/[^\n]/g, " ")
      )
      source.split(/\r?\n/).forEach((line, index) => {
        const code = line.replace(/(^|\s)\/\/.*$/, "")
        for (const pattern of [OFF_SCALE, TEXT_OPACITY]) {
          for (const match of code.matchAll(pattern)) {
            if (ALLOWED[rel]?.[match[0]] === undefined)
              found.push(`${rel}:${index + 1} ${match[0]}`)
          }
        }
      })
    }
  }
  return found
}

describe("type scale", () => {
  it("sizes and weighs every text by a role and colours it by a step", () => {
    expect(offScale()).toEqual([])
  })

  it("keeps a role beside a text colour when classes merge", () => {
    // tailwind-merge reads an unknown `text-*` as a colour, and would drop
    // the role for the colour after it.
    expect(cn("text-ui text-muted-foreground")).toBe(
      "text-ui text-muted-foreground"
    )
    expect(cn("text-title", "text-faint-foreground")).toBe(
      "text-title text-faint-foreground"
    )
    expect(cn("text-ui", "text-title")).toBe("text-title")
  })
})

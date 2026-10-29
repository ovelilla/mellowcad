import { readdirSync, readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const ROOT = path.resolve(import.meta.dirname, "..")

/**
 * A physical side in a class list — `left-4`, `pr-8`, `md:ml-0`, `text-right`,
 * `border-l`, `rounded-r-md`, `slide-in-from-left-2` — which a right-to-left
 * page does not mirror. Centring (`left-1/2` with `-translate-x-1/2`) is
 * symmetric and allowed by name below, never by the pattern.
 */
const PHYSICAL_CLASS =
  /(?<=^|[\s"'`:])-?(?:[mp][lr]-|left-|right-|text-(?:left|right)\b|border-[lr](?:-|\b)|rounded-(?:[lr]|tl|tr|bl|br)(?:-|\b)|float-(?:left|right)\b|scroll-[mp][lr]-|slide-(?:in|out)-(?:from|to)-(?:left|right)\b)[^\s"'`]*/g

/** The same in a stylesheet: a physical property or a physical keyword. */
const PHYSICAL_DECLARATION =
  /(?<![\w-])(?:left|right|margin-(?:left|right)|padding-(?:left|right)|border-(?:left|right)[\w-]*|border-(?:top|bottom)-(?:left|right)-radius)\s*:|(?:text-align|float|clear)\s*:\s*(?:left|right)\b/g

/** A popup placed on a physical side, which RTL would leave on the wrong one. */
const PHYSICAL_SIDE = /\bside(?:\s*=\s*|\??:\s*)["'](?:left|right)["']/g

/**
 * The physical sides that stay, each with its reason: file → exact match. A new
 * one anywhere fails until it is made logical or argued for here.
 */
const ALLOWED: Record<string, Record<string, string>> = {
  "components/cad/view-cube.tsx": {
    'side: "left"': "the cube's triangles, keyed to the sides of the screen",
    'side: "right"': "the cube's triangles, keyed to the sides of the screen",
    "right-0": "the roll arrows are the cube's geometry (dir=ltr)",
  },
  "components/ui/select.tsx": {
    "slide-in-from-right-2": "the entry of a popup given a physical side",
    "slide-in-from-left-2": "the entry of a popup given a physical side",
  },
  "components/marketing/ucs-icon.tsx": {
    "left-3": "the UCS icon keeps the drawing's lower-left corner",
  },
  "app/[locale]/(marketing)/marketing.css": {
    "left:": "the four snap corners (symmetric) and .tip, centred at 50%",
    "right:": "the four snap corners (symmetric)",
  },
}

function* walk(dir: string): Generator<string> {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.name === "dist" || entry.name === "node_modules") continue
    if (entry.isDirectory()) yield* walk(full)
    else if (
      /\.(tsx|ts|css)$/.test(entry.name) &&
      !/\.test\.ts$/.test(entry.name)
    )
      yield full
  }
}

/** Every physical side outside comments, as `file → [match, line]`. */
function physicalSides(): Map<string, [string, number][]> {
  const found = new Map<string, [string, number][]>()
  for (const dir of ["components", "app", "packages"]) {
    for (const file of walk(path.join(ROOT, dir))) {
      const rel = path.relative(ROOT, file).split(path.sep).join("/")
      // Comments go, keeping the line numbers: they may well say "right-click".
      const source = readFileSync(file, "utf8").replace(
        /\/\*[\s\S]*?\*\//g,
        (comment) => comment.replace(/[^\n]/g, " ")
      )
      const patterns = file.endsWith(".css")
        ? [PHYSICAL_DECLARATION]
        : [PHYSICAL_CLASS, PHYSICAL_SIDE]
      source.split(/\r?\n/).forEach((line, index) => {
        const code = line.replace(/(^|\s)\/\/.*$/, "")
        for (const pattern of patterns) {
          for (const match of code.matchAll(pattern)) {
            const list = found.get(rel) ?? []
            list.push([match[0].trim(), index + 1])
            found.set(rel, list)
          }
        }
      })
    }
  }
  return found
}

describe("logical properties (RTL)", () => {
  it("leaves no physical side outside the justified exceptions", () => {
    const unexplained: string[] = []
    for (const [file, matches] of physicalSides()) {
      for (const [match, line] of matches) {
        const allowed = ALLOWED[file]
        if (allowed?.[match] === undefined)
          unexplained.push(`${file}:${line} ${match}`)
      }
    }
    expect(unexplained).toEqual([])
  })

  // An exception left behind by a move or a fix would excuse the next one.
  it("keeps no exception that matches nothing", () => {
    const found = physicalSides()
    const orphans = Object.entries(ALLOWED).flatMap(([file, allowed]) =>
      Object.keys(allowed)
        .filter((match) => !found.get(file)?.some(([seen]) => seen === match))
        .map((match) => `${file} ${match}`)
    )
    expect(orphans).toEqual([])
  })
})

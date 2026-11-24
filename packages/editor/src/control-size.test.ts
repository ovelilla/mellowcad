import { readdirSync, readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const ROOT = path.resolve(import.meta.dirname, "../../..")

/** The editor's chrome: what the size system governs. */
const DIRS = ["packages/editor/src"]

/**
 * A height or square size off the system (.claude/rules/ui.md, "Size"): every
 * control is 28 px (`h-7`, `size-7`), its icon 16 (`size-4`), a docked bar 36
 * (`h-9`). A 20, 22, 24, 32 or 40 px control, AutoCAD's ribbon's 18, 35, 38,
 * 72, 97 and 100, or an arbitrary one, is not, unless it is AutoCAD's own
 * measure, listed below with where it was taken.
 */
const OFF_SYSTEM =
  /(?<=^|[\s"'`:])(?:min-h|h|size)-(?:4\.5|5(?:\.5)?|6|8(?:\.75)?|9(?:\.5)?|10|11|12|18|24\.25|25|31|\[[^\]]*\])(?=$|[\s"'`!])/g

/** Each exception with its reason, file → exact match → why. */
const ALLOWED: Record<string, Record<string, string>> = {
  "packages/editor/src/ui/button.tsx": {
    "h-6": "the ViewCube's own buttons, drawn on it at its scale",
    "size-6": "the ViewCube's own buttons, drawn on it at its scale",
    "h-5.5":
      "a Quick Access button, AutoCAD's 24 × 22 on a 24 px pitch (docs/plans/autocad-ui.md, §2.2)",
    "h-8":
      "the application button, AutoCAD's 48 across its title bar's 32 (§2.2)",
  },
  "packages/editor/src/cad-editor.tsx": {
    "h-8": "the title bar, AutoCAD's 32 (docs/plans/autocad-ui.md, §2.1)",
    "h-31":
      "the ribbon whole, AutoCAD's tab row of 24 and its panels' 100 (§2.1)",
    "h-9":
      "the command line and the status bar: a control and 4 px either side",
  },
  "packages/editor/src/palette-panel.tsx": {
    "h-9": "the palette panel's tab bar, a bar like the others",
  },
  // The ribbon at AutoCAD's measures (docs/plans/autocad-ui.md, §2.3: UI
  // Automation's boxes at 1920×1080, research/ui/2026-11-24/autocad/
  // uia-a-1920-tab-ID_TabHome.txt).
  "packages/editor/src/ribbon.tsx": {
    "h-6": "the tab row, AutoCAD's 24 (§2.1)",
    "h-5": "a tab, AutoCAD's 20 on its row's foot (§2.1)",
    "h-25": "the panels' row, AutoCAD's 100 (§2.1)",
    "h-24.25": "a panel, AutoCAD's 97: 4, its rows' 72, 3 and its title bar",
    "h-18": "a panel's rows and a large button, AutoCAD's 72 (§2.3)",
    "h-4.5": "a panel's title bar and its dialog launcher, AutoCAD's 18 (§2.3)",
    "h-5.5":
      "a small button, a column's row and a combo, AutoCAD's 22 on a 24 px pitch (§2.3)",
    "h-9.5":
      "a large split button's icon, which runs, and a drop-down list's row: AutoCAD's 38 (§2.3)",
    "h-8.75":
      "a large split button's text and arrow, which list: AutoCAD's 35 (§2.3)",
    "size-8": "a drop-down list's 32 px icon (§2.3)",
  },
  "packages/editor/src/color-select.tsx": {
    "h-5.5":
      "the ribbon's colour picker, in the place of AutoCAD's 20 × 22 icon before its combo (§2.3)",
  },
}

/** The size variants `Button` may have, and what each must measure. */
const BUTTON_SIZES: Record<string, RegExp> = {
  default: /\bh-7\b/,
  icon: /\bsize-7\b/,
  "icon-flyout": /\bh-7 w-3\.5\b/,
  quick: /\bh-5\.5 w-6\b/,
  application: /\bh-8 w-12\b/,
  cube: /\bh-6\b/,
  "icon-cube": /\bsize-6\b/,
}

function* walk(dir: string): Generator<string> {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) yield* walk(full)
    else if (/\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name))
      yield full
  }
}

/** Every size off the system, outside comments, as `[file, line, match]`. */
function offSystem(): [string, number, string][] {
  const found: [string, number, string][] = []
  for (const dir of DIRS) {
    for (const file of walk(path.join(ROOT, dir))) {
      const rel = path.relative(ROOT, file).split(path.sep).join("/")
      const source = readFileSync(file, "utf8").replace(
        /\/\*[\s\S]*?\*\//g,
        (comment) => comment.replace(/[^\n]/g, " ")
      )
      source.split(/\r?\n/).forEach((line, index) => {
        const code = line.replace(/(^|\s)\/\/.*$/, "")
        for (const match of code.matchAll(OFF_SYSTEM)) {
          found.push([rel, index + 1, match[0]])
        }
      })
    }
  }
  return found
}

/** `Button`'s size variants as written in `button.tsx`: name → classes. */
function buttonSizes(): Record<string, string> {
  const source = readFileSync(
    path.join(ROOT, "packages/editor/src/ui/button.tsx"),
    "utf8"
  )
  const block = /size: \{([\s\S]*?)\n {2}\},/.exec(source)?.[1] ?? ""
  return Object.fromEntries(
    [...block.matchAll(/^\s*"?([\w-]+)"?:\s*"([^"]*)"/gm)].map((m) => [
      m[1],
      m[2],
    ])
  )
}

describe("control sizes", () => {
  it("sizes every control by the system", () => {
    const unexplained = offSystem()
      .filter(([file, , match]) => ALLOWED[file]?.[match] === undefined)
      .map(([file, line, match]) => `${file}:${line} ${match}`)
    expect(unexplained).toEqual([])
  })

  // An exception left behind by a move or a fix would excuse the next one.
  it("keeps no exception that matches nothing", () => {
    const found = offSystem()
    const orphans = Object.entries(ALLOWED).flatMap(([file, allowed]) =>
      Object.keys(allowed)
        .filter(
          (match) =>
            !found.some(([at, , seen]) => at === file && seen === match)
        )
        .map((match) => `${file} ${match}`)
    )
    expect(orphans).toEqual([])
  })

  it("gives Button only the system's sizes", () => {
    const sizes = buttonSizes()
    expect(Object.keys(sizes).sort()).toEqual(Object.keys(BUTTON_SIZES).sort())
    for (const [name, pattern] of Object.entries(BUTTON_SIZES)) {
      expect(sizes[name], name).toMatch(pattern)
    }
  })
})

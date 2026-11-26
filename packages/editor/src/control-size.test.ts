import { readdirSync, readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const ROOT = path.resolve(import.meta.dirname, "../../..")

/** The editor's chrome: what the size system governs. */
const DIRS = ["packages/editor/src"]

/**
 * A height or square size off the system (.claude/rules/ui.md, "Size"): every
 * control is 28 px (`h-7`, `size-7`), its icon 16 (`size-4`). A 20, 22, 24,
 * 25, 27, 32, 36 or 40 px control, AutoCAD's ribbon's 18, 21, 35,
 * 38, 45, 59, 62, 72, 86, 97 and 100, or an arbitrary one, is not, unless it
 * is AutoCAD's own measure, listed below with where it was taken.
 */
const OFF_SYSTEM =
  /(?<=^|[\s"'`:])(?:min-h|h|size)-(?:4\.5|5(?:\.25|\.5)?|6(?:\.25|\.75)?|8(?:\.75)?|9(?:\.5)?|10|11(?:\.25)?|12|14\.75|15\.5|18|21\.5|24\.25|25|31|\[[^\]]*\])(?=$|[\s"'`!])/g

/** Each exception with its reason, file → exact match → why. */
const ALLOWED: Record<string, Record<string, string>> = {
  "packages/editor/src/ui/button.tsx": {
    "h-6":
      "the ViewCube's own buttons, drawn on it at its scale; a status bar menu's arrow, AutoCAD's 16 × 24 (docs/plans/autocad-ui.md, §2.7)",
    "size-6":
      "the ViewCube's own buttons, drawn on it at its scale; a status bar tool, AutoCAD's 24 × 24 (§2.7)",
    "h-5.5":
      "a Quick Access button, AutoCAD's 24 × 22 on a 24 px pitch (docs/plans/autocad-ui.md, §2.2)",
    "h-8":
      "the application button, AutoCAD's 48 across its title bar's 32 (§2.2)",
    "size-5.5":
      "a palette's title bar button, AutoCAD's bar 22 across (docs/plans/autocad-ui.md, §2.8), on a 24 px pitch",
  },
  "packages/editor/src/cad-editor.tsx": {
    "h-8":
      "the title bar, AutoCAD's 32, and the bottom row, its 33: 32 and the border (docs/plans/autocad-ui.md, §2.1)",
    "h-31":
      "the ribbon whole, AutoCAD's tab row of 24 and its panels' 100 (§2.1)",
    "h-21.5":
      "the ribbon minimized to panel buttons, AutoCAD's 86 (§2.3, Minimize states)",
    "h-11.25":
      "the ribbon minimized to panel titles, AutoCAD's 45 (§2.3, Minimize states)",
    "h-6":
      "the ribbon minimized to its tabs, AutoCAD's 24 (§2.3, Minimize states)",
  },
  "packages/editor/src/status-bar.tsx": {
    "h-6":
      "the status bar's tools, AutoCAD's 24 high; Units, a text one, among them (docs/plans/autocad-ui.md, §2.7)",
  },
  "packages/editor/src/title-bar.tsx": {
    "size-8":
      "the application menu's 32 px glyphs, each entry's and each page item's (docs/plans/autocad-ui.md, §2.2)",
    "h-5.25":
      "a row of Undo's or Redo's list, AutoCAD's 21 on a pitch of 23 (§2.2, research/ui/2026-11-24/autocad/uia-pop-undo-list.txt)",
  },
  // The command window, AutoCAD's 27 high (docs/plans/autocad-ui.md, §2.6;
  // research/ui/2026-11-24/autocad-mouse/uia2-cli-Button_2.txt).
  "packages/editor/src/command-line.tsx": {
    "size-5": "its close button, AutoCAD's 20 × 20",
    "h-4.5": "Recent Commands, AutoCAD's 28 × 18",
    "h-5": "a temporary prompt line's label, AutoCAD's list rows of 20",
    "h-6.75": "the line itself, AutoCAD's 27",
    "h-6.25": "the history's arrow at its end, AutoCAD's 15 × 25",
  },
  "packages/editor/src/palettes.tsx": {
    "h-5.5":
      "a docked palette's title bar, AutoCAD's 22 high (docs/plans/autocad-ui.md, §2.8)",
  },
  // The ribbon at AutoCAD's measures (docs/plans/autocad-ui.md, §2.3: UI
  // Automation's boxes at 1920×1080, research/ui/2026-11-24/autocad/
  // uia-a-1920-tab-ID_TabHome.txt).
  "packages/editor/src/ribbon.tsx": {
    "h-6": "the tab row, AutoCAD's 24 (§2.1)",
    "h-5": "a tab, AutoCAD's 20 on its row's foot (§2.1)",
    "h-25": "the panels' row, AutoCAD's 100 (§2.1)",
    "h-24.25":
      "a panel, AutoCAD's 97: 4, its rows' 72, 3 and its title bar; folded, its button (uia-a-w1280.txt)",
    "h-15.5":
      "minimized to panel buttons, the row under the tabs, AutoCAD's 62 (block5/uia-cycle1.txt)",
    "h-14.75":
      "minimized to panel buttons, a panel's button, AutoCAD's 60 × 59 (block5/uia-buttons-draw.txt)",
    "h-5.25":
      "minimized to panel titles, the row under the tabs, AutoCAD's 21 (block5/uia-titles-draw.txt)",
    "h-18": "a panel's rows and a large button, AutoCAD's 72 (§2.3)",
    "h-4.5":
      "a panel's title bar and its dialog launcher, a minimized panel's title, the minimize button and its arrow: AutoCAD's 18 (§2.3)",
    "h-5.5":
      "a small button, a column's row, a combo and a row of the minimize menu, AutoCAD's 22 on a 24 px pitch (§2.3)",
    "h-9.5":
      "a large split button's icon, which runs, and a drop-down list's row: AutoCAD's 38 (§2.3)",
    "h-8.75":
      "a large split button's text and arrow, which list: AutoCAD's 35 (§2.3)",
    "size-8": "a drop-down list's 32 px icon (§2.3)",
    "size-12":
      "a Visual Styles gallery cell's 48 px picture (research/ui/2026-11-24/block4)",
  },
}

/** The size variants `Button` may have, and what each must measure. */
const BUTTON_SIZES: Record<string, RegExp> = {
  default: /\bh-7\b/,
  icon: /\bsize-7\b/,
  status: /\bsize-6\b/,
  "status-flyout": /\bh-6 w-4\b/,
  quick: /\bh-5\.5 w-6\b/,
  application: /\bh-8 w-12\b/,
  palette: /\bsize-5\.5\b/,
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

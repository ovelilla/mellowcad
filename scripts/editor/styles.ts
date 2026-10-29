/**
 * The editor's precompiled stylesheet, `@mellowcad/editor/styles.css`: what
 * the site's Tailwind compiles from `packages/editor/src/styles.css`, with
 * only the editor's own classes, and every rule Tailwind writes for the whole
 * page (its theme on `:root, :host`, its preflight on `html`, `*`, `button`…,
 * the `@property` fallback on `*`) scoped to the editor's root. A host's
 * `<html>` and `<body>` keep their own styles.
 *
 *   node ../../scripts/editor/styles.ts           build dist/styles.css
 *   node ../../scripts/editor/styles.ts --check   fail on a rule that could
 *                                                 match the host's page
 *
 * Run from packages/editor (its `build` and `check`).
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"

import { optimize } from "@tailwindcss/node"
import tailwindcss from "@tailwindcss/postcss"
import postcss, { AtRule, type Node, type Plugin, type Rule } from "postcss"
import selectorParser from "postcss-selector-parser"

const SOURCE = path.resolve(import.meta.dirname, "../../packages/editor/src")

/**
 * `EDITOR_ROOT_ATTRIBUTE`, which editor-root.test.ts holds equal: importing it
 * would load the engine, which Node reaches through its `dist`.
 */
export const ROOT_ATTRIBUTE = "data-mellowcad-editor"

const ROOT_SELECTOR = `[${ROOT_ATTRIBUTE}]`

// WHY no automatic source detection: it would scan the whole repository, the
// site's pages and docs included, and ship their classes too. A test's class
// strings are not the editor's (type-scale.test.ts names the forbidden ones).
const ENTRY = `
@import "tailwindcss" source(none);
@source "./";
@source not "./**/*.test.ts";
@import "./styles.css";
`

/** The selectors that name the host's document rather than an element in it. */
const DOCUMENT = new Set(["html", "body", ":root", ":host"])

/** A compound that is only the document's root, `html` or `:host`. */
function namesDocument(compound: selectorParser.Node[]): boolean {
  return (
    compound.length === 1 &&
    (compound[0].type === "tag" || compound[0].type === "pseudo") &&
    DOCUMENT.has(compound[0].value.toLowerCase())
  )
}

type SelectorPart = selectorParser.Selector["nodes"][number]

/** The nodes of a complex selector up to its first combinator. */
function firstCompound(selector: selectorParser.Selector): SelectorPart[] {
  const compound: SelectorPart[] = []
  for (const node of selector.nodes) {
    if (node.type === "combinator") break
    compound.push(node)
  }
  return compound
}

const isPseudoElement = (node: selectorParser.Node) =>
  node.type === "pseudo" && node.value.startsWith("::")

function pseudoClass(text: string): SelectorPart {
  return selectorParser().astSync(text).first.first as SelectorPart
}

/**
 * Each selector of a rule that does not name the root, held to it: the
 * document (`html`, `:root`, `:host`, `body`) becomes the root, and anything
 * else matches only the root or what is inside it. Inside `:where()`, so no
 * specificity changes and the cascade within the editor stays the site's.
 */
const scopeToRoot: Plugin = {
  postcssPlugin: "mellowcad-scope-to-root",
  OnceExit(root) {
    const transform = selectorParser((selectors) => {
      selectors.each((selector) => {
        if (selector.toString().includes(ROOT_SELECTOR)) return
        const compound = firstCompound(selector)
        if (namesDocument(compound)) {
          compound[0].replaceWith(pseudoClass(`:where(${ROOT_SELECTOR})`))
          return
        }
        const scope = pseudoClass(
          `:where(${ROOT_SELECTOR}, ${ROOT_SELECTOR} *)`
        )
        const pseudoElement = compound.find(isPseudoElement)
        if (pseudoElement) selector.insertBefore(pseudoElement, scope)
        else selector.insertAfter(compound[compound.length - 1], scope)
      })
    })
    root.walkRules((rule) => {
      if (inKeyframes(rule) || inLayer(rule, "utilities")) return
      rule.selector = transform.processSync(rule.selector, { lossless: false })
      // `:root, :host` and `html, :host` are the root twice.
      rule.selectors = [...new Set(rule.selectors)]
    })
  },
}

function inKeyframes(rule: Rule): boolean {
  return rule.parent?.type === "atrule" && /keyframes$/.test(rule.parent.name)
}

/** Whether a rule sits in the named cascade layer. */
function inLayer(rule: Rule, layer: string): boolean {
  for (let node: Node | undefined = rule.parent; node; node = node.parent)
    if (
      node instanceof AtRule &&
      node.name === "layer" &&
      node.params === layer
    )
      return true
  return false
}

/** The editor's stylesheet, scoped and minified as the site's is. */
export async function compileStyles(): Promise<string> {
  // The entry has no file of its own: `from` resolves its paths in src/.
  const from = path.join(SOURCE, "entry.css")
  const result = await postcss([
    tailwindcss({ optimize: false }),
    scopeToRoot,
  ]).process(ENTRY, { from })
  return optimize(result.css, { file: "styles.css", minify: true }).code
}

/**
 * Every selector of the stylesheet that could match the host's page outside
 * the editor: one that names `html`, `body`, `:root` or `:host`, or names
 * neither the root nor a class (a bare element or `*`). A utility's class is
 * the element's own, so a host meets it only where it puts that class.
 */
export function unscopedSelectors(css: string): string[] {
  const found: string[] = []
  const check = selectorParser((selectors) => {
    selectors.each((selector) => {
      let document = false
      let anchored = false
      selector.walk((node) => {
        if (
          (node.type === "tag" || node.type === "pseudo") &&
          DOCUMENT.has(node.value.toLowerCase())
        )
          document = true
        if (node.type === "class") anchored = true
        if (node.type === "attribute" && node.attribute === ROOT_ATTRIBUTE)
          anchored = true
      })
      if (document || !anchored) found.push(selector.toString().trim())
    })
  })
  postcss.parse(css).walkRules((rule) => {
    if (!inKeyframes(rule)) check.processSync(rule.selector)
  })
  return found
}

/** The cascade layers the stylesheet names, in the order they stack. */
export function cascadeLayers(css: string): string[] {
  const layers = new Set<string>()
  postcss.parse(css).walkAtRules("layer", (rule) => {
    for (const name of rule.params.split(",")) layers.add(name.trim())
  })
  return [...layers]
}

/**
 * The custom properties the stylesheet reads with no fallback and never
 * declares: someone else sets them, the host or the editor's own script.
 */
export function undeclaredVariables(css: string): string[] {
  const declared = new Set<string>()
  const read = new Set<string>()
  const root = postcss.parse(css)
  root.walkAtRules("property", (rule) => void declared.add(rule.params.trim()))
  root.walkDecls((decl) => {
    if (decl.prop.startsWith("--")) declared.add(decl.prop)
    for (const [, name] of decl.value.matchAll(/var\((--[\w-]+)\s*\)/g))
      read.add(name)
  })
  return [...read].filter((name) => !declared.has(name)).sort()
}

const OUT = path.resolve("dist/styles.css")

if (import.meta.main) {
  if (process.argv.includes("--check")) {
    const found = unscopedSelectors(readFileSync(OUT, "utf8"))
    if (found.length > 0) {
      console.error(
        `dist/styles.css styles the host's page outside ${ROOT_SELECTOR}:\n` +
          found.map((selector) => `  ${selector}`).join("\n")
      )
      process.exit(1)
    }
  } else {
    mkdirSync(path.dirname(OUT), { recursive: true })
    writeFileSync(OUT, await compileStyles())
  }
}

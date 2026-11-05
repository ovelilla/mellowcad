import type { Element, ElementContent } from "hast"
import { createCssVariablesTheme, type ShikiTransformer } from "shiki/core"

import { REPORT_META } from "./remark-package-source"

// Code is coloured by the site's tokens (`--syntax-*` in marketing.css), not
// by a theme's literal colours.
export const codeTheme = createCssVariablesTheme({
  name: "mellowcad",
  variablePrefix: "--syntax-",
  variableDefaults: {},
  fontStyle: true,
})

/**
 * The class each colour of Shiki's CSS-variables theme becomes, short as
 * Pygments' are: `marketing.css` gives each its `--syntax-token-*` colour.
 */
export const TOKEN_CLASSES: Readonly<Record<string, string>> = {
  "color:var(--syntax-token-keyword)": "sx-k",
  "color:var(--syntax-token-string)": "sx-s",
  "color:var(--syntax-token-string-expression)": "sx-e",
  "color:var(--syntax-token-function)": "sx-f",
  "color:var(--syntax-token-constant)": "sx-n",
  "color:var(--syntax-token-parameter)": "sx-a",
  "color:var(--syntax-token-punctuation)": "sx-p",
  "color:var(--syntax-token-comment)": "sx-c",
  "color:var(--syntax-token-link)": "sx-l",
}

const COMMENT = TOKEN_CLASSES["color:var(--syntax-token-comment)"]

/** The block's own colour: a token in it needs no element at all. */
const FOREGROUND = "color:var(--syntax-foreground)"


const isElement = (node: ElementContent): node is Element => node.type === "element"

const classOf = (node: Element) => {
  const value = node.properties.class
  return typeof value === "string" ? value : undefined
}

const textOf = (node: ElementContent): string =>
  node.type === "text" ? node.value : isElement(node) ? node.children.map(textOf).join("") : ""

/** Adds `node` to `nodes`, run into the text before it when both are text. */
function append(nodes: ElementContent[], node: ElementContent) {
  const last = nodes.at(-1)
  if (node.type === "text" && last?.type === "text") last.value += node.value
  else nodes.push(node)
}

/**
 * Adds a token to a flattened block: text runs into text, and a token of the
 * same colour as the one before, with nothing but white space between them,
 * joins it, so a comment of many lines is one element.
 */
function appendToken(nodes: ElementContent[], node: ElementContent) {
  if (isElement(node)) {
    const last = nodes.at(-1)
    const before = nodes.at(-2)
    if (last && isElement(last) && classOf(last) === classOf(node)) {
      for (const child of node.children) append(last.children, child)
      return
    }
    if (
      last?.type === "text" &&
      /^\s*$/.test(last.value) &&
      before &&
      isElement(before) &&
      classOf(before) === classOf(node)
    ) {
      nodes.pop()
      for (const child of [last, ...node.children]) append(before.children, child)
      return
    }
  }
  append(nodes, node)
}

/**
 * Each token's colour as a class, a token in the block's own colour as bare
 * text, and a block with no numbers and no marked line as its tokens and
 * newlines, with no element per line (the Code Block draws it `plain`). An
 * API report's block (`REPORT_META`) keeps the colour of its comments only.
 *
 * WHY: every element is written twice, in the HTML and in the page's RSC
 * payload. The engine's API reference had 12,448 styled tokens and 4,234
 * lines of markup: 9.1 MB of HTML, where Googlebot reads 2 MB and Bing
 * advises under one. A style this map does not know is kept as it is.
 */
export function transformerTokenClasses(): ShikiTransformer {
  return {
    name: "mellowcad:token-classes",
    line(line) {
      line.children = line.children.flatMap((child): ElementContent[] => {
        if (!isElement(child) || child.tagName !== "span") return [child]
        const style = child.properties.style
        if (style === FOREGROUND) return child.children
        const name = typeof style === "string" ? TOKEN_CLASSES[style] : undefined
        if (!name) return [child]
        const properties = { ...child.properties, class: name }
        delete properties.style
        return [{ ...child, properties }]
      })
    },
    code(code) {
      const meta = String(this.options.meta?.__raw ?? "").split(/\s+/)
      const lines = code.children.filter(isElement)
      const marked = lines.some((line) => classOf(line) !== "line")
      if (marked || meta.some((word) => /^lineNumbers(=|$)/.test(word))) return
      const report = meta.includes(REPORT_META)
      const tokens: ElementContent[] = []
      lines.forEach((line, index) => {
        if (index > 0) append(tokens, { type: "text", value: "\n" })
        if (!report) {
          for (const child of line.children) appendToken(tokens, child)
          return
        }
        // A report's line is a comment, `{@link}` and all, or code.
        const value = textOf(line)
        const first = line.children.find((child) => child.type !== "text" || child.value.trim())
        appendToken(
          tokens,
          first && isElement(first) && classOf(first) === COMMENT
            ? { type: "element", tagName: "span", properties: { class: COMMENT }, children: [{ type: "text", value }] }
            : { type: "text", value }
        )
      })
      code.children = tokens
    },
  }
}

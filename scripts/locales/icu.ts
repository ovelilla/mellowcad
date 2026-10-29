/**
 * Reading an ICU catalog source: its messages by dotted key, what each one
 * takes and its plurals. Shared by the catalogs' tests and by the editor's
 * compiler, which types every message's arguments from English's signature.
 */

import {
  type MessageFormatElement,
  isArgumentElement,
  isDateElement,
  isNumberElement,
  isPluralElement,
  isSelectElement,
  isTagElement,
  isTimeElement,
} from "@formatjs/icu-messageformat-parser"

export type Tree = { readonly [key: string]: Tree | string }

/** Every message of a catalog, by its dotted key. */
export function flatten(tree: Tree, path = ""): Map<string, string> {
  const out = new Map<string, string>()
  for (const [key, value] of Object.entries(tree)) {
    const at = path === "" ? key : `${path}.${key}`
    if (typeof value === "string") out.set(at, value)
    else for (const entry of flatten(value, at)) out.set(...entry)
  }
  return out
}

/**
 * What a message takes, sorted: each argument as `name` (a string),
 * `name:number`, `name:date` or `name:select`, and each rich tag as `<tag>`.
 */
export function signature(elements: MessageFormatElement[]): string[] {
  return elements
    .flatMap((element): string[] => {
      if (isArgumentElement(element)) return [element.value]
      if (isNumberElement(element)) return [`${element.value}:number`]
      if (isDateElement(element) || isTimeElement(element)) {
        return [`${element.value}:date`]
      }
      if (isPluralElement(element) || isSelectElement(element)) {
        return [
          // A plural takes a number, like `{n, number}`: Arabic's six forms
          // agree with a count that English only prints.
          `${element.value}:${isPluralElement(element) ? "number" : "select"}`,
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

/** The categories of every plural in a message, nested ones included. */
export function plurals(elements: MessageFormatElement[]): string[][] {
  return elements.flatMap((element) => {
    if (isPluralElement(element) || isSelectElement(element)) {
      return [
        ...(isPluralElement(element) ? [Object.keys(element.options)] : []),
        ...Object.values(element.options).flatMap((option) =>
          plurals(option.value)
        ),
      ]
    }
    return isTagElement(element) ? plurals(element.children) : []
  })
}

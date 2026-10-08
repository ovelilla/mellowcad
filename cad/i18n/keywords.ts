/**
 * AutoCAD's keyword rules, independent of any one language.
 *
 * A keyword is written with its abbreviation in capitals, anywhere in the word
 * (`Close`, `eXit`, `desHacer`, `SIZ`), exactly as `initget` declares them. Each
 * keyword also has a global (English) word, and `_` in front of what is typed
 * selects it in any language, which is what makes a script portable. The
 * command always receives the global id, however the keyword was typed.
 */

/** A keyword on offer: its global id, and the word in the command language. */
export interface Keyword {
  readonly id: string
  /** The command language's word, with its abbreviation in capitals. */
  readonly word: string
  /** The global word (the English one), which `_` selects. */
  readonly global: string
}

/** A keyword resolved for the prompt it is offered in. */
export interface OfferedKeyword extends Keyword {
  readonly abbreviation: string
}

// WHY plain toUpperCase, never the locale-aware one: under a Turkish locale
// that maps `i` to `İ`, and a typed keyword or command must match whatever
// the page's language is.
function upper(text: string): string {
  return text.toUpperCase()
}

function isCapital(char: string): boolean {
  return char !== char.toLowerCase() && char === char.toUpperCase()
}

/**
 * The abbreviation of a keyword: its first run of capital letters, digits
 * counting as capitals — CIRCLE's `3P` and `2P` are typed whole, as in AutoCAD.
 */
export function abbreviationOf(word: string): string {
  const chars = [...word]
  const required = (char: string) => isCapital(char) || isDigit(char)
  const start = chars.findIndex(required)
  if (start === -1) return ""
  let end = start
  while (end < chars.length && required(chars[end])) end += 1
  return chars.slice(start, end).join("")
}

function isDigit(char: string): boolean {
  return char >= "0" && char <= "9"
}

/** Works out each keyword's abbreviation. */
export function offerKeywords(keywords: readonly Keyword[]): OfferedKeyword[] {
  return keywords.map((keyword) => ({
    ...keyword,
    abbreviation: abbreviationOf(keyword.word),
  }))
}

/**
 * The id of the keyword `input` names, or null: its abbreviation or its whole
 * word in the command language, or — after `_` — in the global language. Case
 * does not matter.
 */
export function resolveKeyword(
  input: string,
  keywords: readonly Keyword[]
): string | null {
  const text = upper(input.trim())
  if (text === "") return null
  const global = text.startsWith("_")
  const typed = global ? text.slice(1) : text
  if (typed === "") return null
  const wordOf = (keyword: Keyword) => (global ? keyword.global : keyword.word)
  const byAbbreviation = keywords.find(
    (keyword) => upper(abbreviationOf(wordOf(keyword))) === typed
  )
  if (byAbbreviation) return byAbbreviation.id
  const byWord = keywords.find((keyword) => upper(wordOf(keyword)) === typed)
  return byWord?.id ?? null
}

/**
 * What was typed at the command prompt, split into the name and whether `_`
 * asked for the global one. Names are compared in capitals.
 */
export function parseCommandInput(text: string): {
  readonly name: string
  readonly global: boolean
} {
  const typed = upper(text.trim())
  return typed.startsWith("_")
    ? { name: typed.slice(1), global: true }
    : { name: typed, global: false }
}

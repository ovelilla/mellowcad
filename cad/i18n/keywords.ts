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
 * `?`, AutoCAD's listing keyword, is itself.
 */
export function abbreviationOf(word: string): string {
  if (word === "?") return word
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
 * The id of the keyword `input` names, or null: its abbreviation, its whole
 * word, or the start of the word as far as its capitals and on (`OB` for
 * `Object`, `EXI` for `eXit`, as AutoCAD 2023's console takes them) — in
 * the command language, or after `_` in the global one. Case does not matter.
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
  if (byWord) return byWord.id
  const byStart = keywords.find((keyword) => {
    const word = wordOf(keyword)
    const abbreviation = abbreviationOf(word)
    if (abbreviation === "") return false
    const required = word.indexOf(abbreviation) + abbreviation.length
    return typed.length >= required && upper(word).startsWith(typed)
  })
  return byStart?.id ?? null
}

/**
 * The ids of the keywords on offer at a prompt that `input` names: the one
 * whose abbreviation or whole word it is, else the first whose word it starts
 * past all of its capitals (`TH` for `Through`, before the hidden `Thru`) —
 * one its capital starts before the rest (Spanish `CE` for `Cerrar`, not
 * `cEntro`) —, else every one whose word it starts, as far as the word's first capital and
 * on — `C` for `CEnter`, but `C` for both `CEnter` and `CLose`, which AutoCAD
 * 2023's console answers `Ambiguous response, please clarify...`. `E` is not
 * `eXit`'s start, and a number is no keyword's: `3` at CIRCLE's first prompt
 * is a point, not `3P`.
 */
export function matchKeywords(
  input: string,
  keywords: readonly Keyword[]
): string[] {
  const text = upper(input.trim())
  const global = text.startsWith("_")
  const typed = global ? text.slice(1) : text
  if (typed === "") return []
  const wordOf = (keyword: Keyword) => (global ? keyword.global : keyword.word)
  const exact =
    keywords.find(
      (keyword) => upper(abbreviationOf(wordOf(keyword))) === typed
    ) ?? keywords.find((keyword) => upper(wordOf(keyword)) === typed)
  if (exact) return [exact.id]
  if (Number.isFinite(Number(typed))) return []
  const started = keywords.filter((keyword) => {
    const word = wordOf(keyword)
    const first = [...word].findIndex(isCapital)
    return first !== -1 && typed.length > first && upper(word).startsWith(typed)
  })
  // WHY the first whose capitals are all typed, not a question: AutoCAD 2023's
  // console takes `TH` at OFFSET's `Through Thru` and `CE` at ELLIPSE's
  // `Center Centre` as the first, and asks only when the input stops short of
  // each word's capitals (`C` at `CEnter CLose`). One whose capitals start
  // the word goes first: 2027's takes Spanish `CE` at `cEntro Cerrar` as
  // Cerrar (pline/p104).
  const covered = started.filter((keyword) => {
    const word = wordOf(keyword)
    const abbreviation = abbreviationOf(word)
    return typed.length >= word.indexOf(abbreviation) + abbreviation.length
  })
  const leading = covered.find((keyword) => isCapital([...wordOf(keyword)][0]))
  if (covered.length > 0) return [(leading ?? covered[0]).id]
  return [...new Set(started.map((keyword) => keyword.id))]
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

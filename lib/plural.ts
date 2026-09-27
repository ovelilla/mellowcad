/**
 * A plural message a client island can format without a message formatter:
 * one form per plural category of the language, with `#` where the count
 * goes. The server splits the ICU message; the browser picks the form with
 * `Intl.PluralRules`, so the landing ships no ICU runtime for two counters.
 */
export interface PluralMessage {
  readonly locale: string
  readonly forms: Readonly<Partial<Record<Intl.LDMLPluralRule, string>>> & {
    readonly other: string
  }
}

// Every category a language gives whole numbers is reached below 200 (Arabic's
// `many` starts at 11 and its `other` at 100).
const SAMPLES = Array.from({ length: 200 }, (_, n) => n)

/**
 * Splits an ICU plural message into its forms: formatted once with a count of
 * each category, the printed count becomes `#` again. A form that prints the
 * count more than once cannot be split, and fails the build.
 */
export function pluralMessage(
  locale: string,
  format: (count: number) => string
): PluralMessage {
  const rules = new Intl.PluralRules(locale)
  const numbers = new Intl.NumberFormat(locale)
  const forms: Partial<Record<Intl.LDMLPluralRule, string>> = {}
  for (const category of rules.resolvedOptions().pluralCategories) {
    // A category only fractions reach is never used to count objects.
    const sample = SAMPLES.find((n) => rules.select(n) === category)
    if (sample === undefined) continue
    const text = format(sample)
    const parts = text.split(numbers.format(sample))
    if (parts.length > 2) {
      throw new Error(`Cannot split the plural form "${text}" around its count`)
    }
    forms[category] = parts.join("#")
  }
  const { other } = forms
  if (other === undefined) throw new Error(`No "other" form in ${locale}`)
  return { locale, forms: { ...forms, other } }
}

export function formatPlural(
  { locale, forms }: PluralMessage,
  count: number
): string {
  const form = forms[new Intl.PluralRules(locale).select(count)] ?? forms.other
  return form.replace("#", new Intl.NumberFormat(locale).format(count))
}

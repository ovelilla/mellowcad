import format, {
  type CompiledMessage,
  type FormatOptions,
} from "icu-minify/format"
import type { MessageValues } from "./types"

/** A piece of a formatted message: text, or what a tag handler returned. */
export type MessagePart<T> = string | T

/**
 * Formats compiled ICU messages for one locale. The formatters are built here,
 * not left to whatever the host's ICU defaults to, so a count reads the same in
 * every browser: latin digits even where CLDR's default for the locale is
 * another numbering system (`ar-EG`), and a CLDR update never changes a digit.
 */
export class MessageFormatter {
  private readonly options: FormatOptions

  constructor(readonly tag: string) {
    const numbers = new Map<string, Intl.NumberFormat>()
    const plurals = new Map<string, Intl.PluralRules>()
    const dates = new Map<string, Intl.DateTimeFormat>()
    this.options = {
      timeZone: "UTC",
      formatters: {
        getNumberFormat: (locale, options) =>
          cached(
            numbers,
            locale,
            options,
            () =>
              // WHY no grouping: AutoCAD's command line writes a count as bare
              // digits ("1234 found"), and so did every message before catalogs.
              new Intl.NumberFormat(locale, {
                numberingSystem: "latn",
                useGrouping: false,
                ...options,
              })
          ),
        getPluralRules: (locale, options) =>
          cached(
            plurals,
            locale,
            options,
            () => new Intl.PluralRules(locale, options)
          ),
        getDateTimeFormat: (locale, options) =>
          cached(
            dates,
            locale,
            options,
            () =>
              new Intl.DateTimeFormat(locale, {
                numberingSystem: "latn",
                timeZone: "UTC",
                ...options,
              })
          ),
      },
    }
  }

  format(message: CompiledMessage, values?: MessageValues): string {
    const result = format(message, this.tag, values, this.options)
    return Array.isArray(result) ? result.join("") : String(result)
  }

  /**
   * Formats a message whose tags mark spans the host styles differently — the
   * keyword list of a prompt — handing each span to its handler instead of
   * flattening it into the text.
   */
  formatParts<T>(
    message: CompiledMessage,
    values: MessageValues,
    tags: Readonly<Record<string, (chunks: MessagePart<T>[]) => T>>
  ): MessagePart<T>[] {
    const result = format<T>(
      message,
      this.tag,
      { ...values, ...tags },
      {
        ...this.options,
      }
    )
    return Array.isArray(result) ? result : [result]
  }
}

function cached<T>(
  cache: Map<string, T>,
  locale: Intl.LocalesArgument,
  options: object | undefined,
  create: () => T
): T {
  const key = `${String(locale)}|${JSON.stringify(options ?? {})}`
  let value = cache.get(key)
  if (value === undefined) {
    value = create()
    cache.set(key, value)
  }
  return value
}

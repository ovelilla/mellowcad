"use client"

import {
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  type ReactNode,
} from "react"
import format, { type FormatOptions } from "icu-minify/format"

import { en } from "./locales/en"
import { mergeMessages } from "./locales/extend"
import type {
  CompiledMessage,
  EditorKey,
  EditorLocale,
  EditorMessages,
  EditorNamespace,
  EditorPath,
} from "./locales/types"
import type { EditorValues } from "./locales/values"

interface EditorText {
  readonly tag: string
  readonly messages: EditorMessages
  readonly options: FormatOptions
}

function cached<T>(create: (locale: string, options?: object) => T) {
  const made = new Map<string, T>()
  return (locale: Intl.LocalesArgument, options?: object): T => {
    const key = `${String(locale)}|${JSON.stringify(options ?? {})}`
    let value = made.get(key)
    if (value === undefined) {
      value = create(String(locale), options)
      made.set(key, value)
    }
    return value
  }
}

/** A language laid over English key by key, with its own formatters. */
function editorText(locale?: EditorLocale): EditorText {
  return {
    tag: locale?.tag ?? en.tag,
    messages: locale
      ? mergeMessages<EditorMessages>(en.messages, locale.messages)
      : en.messages,
    options: {
      // Fixed, so a date formats the same on the server as in the browser.
      timeZone: "UTC",
      formatters: {
        getNumberFormat: cached(
          (tag, options) => new Intl.NumberFormat(tag, options)
        ),
        getPluralRules: cached(
          (tag, options) => new Intl.PluralRules(tag, options)
        ),
        getDateTimeFormat: cached(
          (tag, options) => new Intl.DateTimeFormat(tag, options)
        ),
      },
    },
  }
}

// Without a provider the editor speaks English.
const EditorTextContext = createContext<EditorText>(editorText())

/** The editor's words for everything under it: `locale`, or English. */
export function EditorTextProvider({
  locale,
  children,
}: {
  locale?: EditorLocale
  children: ReactNode
}) {
  return (
    <EditorTextContext value={editorText(locale)}>{children}</EditorTextContext>
  )
}

type Values<P> = P extends keyof EditorValues ? [values: EditorValues[P]] : []

export interface EditorTranslator<N extends EditorNamespace | undefined> {
  <K extends EditorKey<N>>(key: K, ...values: Values<EditorPath<N, K>>): string
  /** A message with rich tags, each rendered by the function given for it. */
  rich<K extends EditorKey<N>>(
    key: K,
    ...values: Values<EditorPath<N, K>>
  ): ReactNode
}

type FormatValues = Parameters<typeof format<ReactNode>>[2]

function lookup(messages: EditorMessages, path: string) {
  let node: unknown = messages
  for (const key of path.split(".")) {
    node = (node as Record<string, unknown> | undefined)?.[key]
  }
  return node as CompiledMessage | undefined
}

function translator(
  text: EditorText,
  namespace: string | undefined
): EditorTranslator<EditorNamespace> {
  const formatted = (key: string, values?: FormatValues) => {
    const path = namespace === undefined ? key : `${namespace}.${key}`
    const message = lookup(text.messages, path)
    if (message === undefined) return path
    return format<ReactNode>(message, text.tag, values, text.options)
  }
  const plain = (key: string, values?: object) => {
    const result = formatted(key, values as FormatValues)
    return Array.isArray(result) ? result.join("") : String(result)
  }
  const rich = (key: string, values?: object) => {
    // React wants a key on each element a tag renders among the text.
    const keyed = Object.fromEntries(
      Object.entries(values ?? {}).map(([name, value]) => {
        if (typeof value !== "function") return [name, value]
        let index = 0
        return [
          name,
          (chunks: ReactNode[]) => {
            const node = (value as (chunks: ReactNode[]) => ReactNode)(chunks)
            return isValidElement(node)
              ? cloneElement(node, { key: `${name}${index++}` })
              : node
          },
        ]
      })
    )
    return formatted(key, keyed as FormatValues)
  }
  return Object.assign(plain, { rich }) as EditorTranslator<EditorNamespace>
}

/**
 * The messages of one part of the editor (`useEditorText("TopBar")`), or of
 * the whole catalog without a namespace. A key that is not English's fails
 * to compile, and so does a call that passes the wrong values.
 */
export function useEditorText<
  N extends EditorNamespace | undefined = undefined,
>(namespace?: N): EditorTranslator<N> {
  const text = useContext(EditorTextContext)
  return translator(text, namespace) as unknown as EditorTranslator<N>
}

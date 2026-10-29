import type { CompiledMessage } from "icu-minify/format"

import type source from "./en.json"

export type { CompiledMessage }

/**
 * The shape of an editor catalog, read off the English source: English is the
 * fallback key by key and the type every other language is checked against.
 * The keys are API: adding one is a minor version, renaming or removing one,
 * or changing what a message takes (`values.ts`), a major.
 */
type Source = typeof source

type Compiled<T> = T extends string
  ? CompiledMessage
  : { readonly [K in keyof T]: Compiled<T[K]> }

/** A catalog with any key left out. A compiled message is a leaf. */
export type DeepPartial<T> = T extends string | readonly unknown[]
  ? T
  : { readonly [K in keyof T]?: DeepPartial<T[K]> }

export type EditorMessages = Compiled<Source>

/** A complete catalog: the English one built into the editor. */
export interface EditorCatalog {
  readonly tag: string
  readonly messages: EditorMessages
}

/**
 * A language the editor is handed (`<CadEditor editorLocale={es}>`). Any
 * message may be left out, and that message is English's. Every message is
 * compiled (`icu-minify/compile`).
 */
export interface EditorLocale {
  /** BCP 47, what `Intl` receives (plurals, numbers), and the editor's `lang`. */
  readonly tag: string
  readonly messages: DeepPartial<EditorMessages>
}

/** Every dotted path from `T` to one of its messages. */
type Leaves<T> = {
  [K in keyof T & string]: T[K] extends string ? K : `${K}.${Leaves<T[K]>}`
}[keyof T & string]

/** Every dotted path from `T` to a group of messages. */
type Groups<T> = {
  [K in keyof T & string]: T[K] extends string
    ? never
    : K | `${K}.${Groups<T[K]>}`
}[keyof T & string]

type At<T, P extends string> = P extends `${infer Head}.${infer Rest}`
  ? Head extends keyof T
    ? At<T[Head], Rest>
    : never
  : P extends keyof T
    ? T[P]
    : never

/** A group of messages a part reads, `useEditorText("TopBar")`. */
export type EditorNamespace = Groups<Source>

/** A message's key within a namespace, or from the root without one. */
export type EditorKey<N extends EditorNamespace | undefined> =
  N extends EditorNamespace ? Leaves<At<Source, N>> : Leaves<Source>

/** A key with its namespace: what `values.ts` is keyed by. */
export type EditorPath<
  N extends EditorNamespace | undefined,
  K extends string,
> = N extends EditorNamespace ? `${N}.${K}` : K

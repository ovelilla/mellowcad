export type { CompiledMessage } from "icu-minify/format"

/** Values a message is formatted with. Technical numbers arrive pre-formatted. */
export type MessageValues = Readonly<Record<string, string | number>>

/**
 * A catalog with any key left out. A compiled message is an array, and so is a
 * list of command names, so arrays are leaves: a locale replaces one whole.
 */
export type DeepPartial<T> = T extends string | number | boolean
  ? T
  : T extends readonly unknown[]
    ? T
    : { readonly [K in keyof T]?: DeepPartial<T[K]> }

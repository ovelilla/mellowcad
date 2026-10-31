import type en from "@/messages/en.json"

import type { AppLocale } from "./routing"

export type Messages = typeof en

// A message is a string, or — precompiled at build time (next.config.ts) —
// the array icu-minify compiles it to. Either is a leaf; only objects nest.
type Message = string | readonly unknown[]
type Tree = { readonly [key: string]: Message | Tree }

function isTree(value: Message | Tree | undefined): value is Tree {
  return typeof value === "object" && !Array.isArray(value)
}

// One chunk per language, loaded only by the pages in it.
const catalogs: Record<AppLocale, () => Promise<{ default: object }>> = {
  en: () => import("@/messages/en.json"),
  es: () => import("@/messages/es.json"),
  ar: () => import("@/messages/ar.json"),
  "pt-BR": () => import("@/messages/pt-BR.json"),
}

export function mergeMessages(base: Tree, override: Tree): Tree {
  const out: Record<string, Message | Tree> = { ...base }
  for (const [key, value] of Object.entries(override)) {
    const current = out[key]
    out[key] =
      isTree(value) && isTree(current) ? mergeMessages(current, value) : value
  }
  return out
}

/**
 * A language's messages laid over English's, key by key: a message a draft
 * language has not translated yet shows in English, never as its key. The
 * tests keep a live language from relying on it.
 */
export async function loadMessages(locale: AppLocale): Promise<Messages> {
  const english = (await catalogs.en()).default as Messages
  if (locale === "en") return english
  const own = (await catalogs[locale]()).default as Tree
  return mergeMessages(english, own) as Messages
}

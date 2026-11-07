import { getLocale } from "next-intl/server"

import { DOCS_PATH } from "@/lib/docs/packages"
import { EDITOR_PATH } from "@/lib/site"

import { localePath } from "./navigation"

/** The site's own pages in the language being rendered. Server only. */
export async function sitePaths(): Promise<{
  readonly home: string
  readonly editor: string
  readonly privacy: string
  readonly docs: string
  /** The command reference, the docs' page a searcher for a command wants. */
  readonly commands: string
  /** The practice library, the docs' page a searcher for exercises wants. */
  readonly exercises: string
}> {
  const locale = await getLocale()
  return {
    home: localePath(locale, "/"),
    editor: localePath(locale, EDITOR_PATH),
    privacy: localePath(locale, "/privacy"),
    docs: localePath(locale, DOCS_PATH),
    commands: localePath(locale, `${DOCS_PATH}/commands`),
    exercises: localePath(locale, `${DOCS_PATH}/exercises`),
  }
}

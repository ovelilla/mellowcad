import type { EditorLocale } from "@/components/cad/locales/types"

import type { AppLocale } from "./routing"

/**
 * The editor's catalog for each page language, one chunk apiece, loaded on the
 * server and handed to the editor as a prop. English is built into the
 * editor; a language without a catalog yet shows it in English.
 */
const EDITOR_LOCALES: Partial<Record<AppLocale, () => Promise<EditorLocale>>> =
  {
    es: () => import("@/components/cad/locales/es").then((module) => module.es),
    ar: () => import("@/components/cad/locales/ar").then((module) => module.ar),
  }

export async function loadEditorLocale(
  locale: AppLocale
): Promise<EditorLocale | undefined> {
  return EDITOR_LOCALES[locale]?.()
}

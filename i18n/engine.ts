import type { EngineLocale } from "@/cad"

import type { AppLocale } from "./routing"

/**
 * The engine's catalog for each page language, one chunk apiece, loaded only
 * where that language is drawn — the build's figures, the editor, the live
 * sketch. English is built into the engine; a language without a catalog yet
 * draws in English.
 */
const ENGINE_LOCALES: Partial<Record<AppLocale, () => Promise<EngineLocale>>> =
  {
    es: () => import("@/cad/locales/es").then((module) => module.es),
  }

export async function loadEngineLocale(
  locale: AppLocale
): Promise<EngineLocale | undefined> {
  return ENGINE_LOCALES[locale]?.()
}

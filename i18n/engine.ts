import type { EngineLocale } from "@mellowcad/engine"

import type { AppLocale } from "./routing"

/**
 * The engine's catalog for each page language, one chunk apiece, loaded only
 * where that language is drawn — the build's figures, the editor, the live
 * sketch. English is built into the engine; a language without a catalog yet
 * draws in English.
 */
const ENGINE_LOCALES: Partial<Record<AppLocale, () => Promise<EngineLocale>>> =
  {
    es: () =>
      import("@mellowcad/engine/locales/es").then((module) => module.es),
    // WHY interface only: there is no Arabic AutoCAD, and whoever drafts in
    // Arabic works in the English one, so Arabic's command language is the
    // global one (docs/i18n/ar.md).
    ar: () =>
      import("@mellowcad/engine/locales/ar").then((module) => module.ar),
  }

export async function loadEngineLocale(
  locale: AppLocale
): Promise<EngineLocale | undefined> {
  return ENGINE_LOCALES[locale]?.()
}

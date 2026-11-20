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
    "pt-BR": () =>
      import("@mellowcad/engine/locales/pt-BR").then((module) => module.ptBR),
    fr: () =>
      import("@mellowcad/engine/locales/fr").then((module) => module.fr),
    it: () =>
      import("@mellowcad/engine/locales/it").then((module) => module.it),
    de: () =>
      import("@mellowcad/engine/locales/de").then((module) => module.de),
    ru: () =>
      import("@mellowcad/engine/locales/ru").then((module) => module.ru),
    pl: () =>
      import("@mellowcad/engine/locales/pl").then((module) => module.pl),
    cs: () =>
      import("@mellowcad/engine/locales/cs").then((module) => module.cs),
    hu: () =>
      import("@mellowcad/engine/locales/hu").then((module) => module.hu),
    // WHY interface only: Japanese AutoCAD keeps the global names, aliases
    // and keyword letters and words only its prompts, which are not copied
    // yet, so its command language is the global one (docs/i18n/ja.md).
    ja: () =>
      import("@mellowcad/engine/locales/ja").then((module) => module.ja),
    // WHY interface only: Japanese's reason, Korean AutoCAD's too
    // (docs/i18n/ko.md).
    ko: () =>
      import("@mellowcad/engine/locales/ko").then((module) => module.ko),
  }

export async function loadEngineLocale(
  locale: AppLocale
): Promise<EngineLocale | undefined> {
  return ENGINE_LOCALES[locale]?.()
}

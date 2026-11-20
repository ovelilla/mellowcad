import type { EditorLocale } from "@mellowcad/editor"

import type { AppLocale } from "./routing"

/**
 * The editor's catalog for each page language, one chunk apiece, loaded on the
 * server and handed to the editor as a prop. English is built into the
 * editor; a language without a catalog yet shows it in English.
 */
const EDITOR_LOCALES: Partial<Record<AppLocale, () => Promise<EditorLocale>>> =
  {
    es: () =>
      import("@mellowcad/editor/locales/es").then((module) => module.es),
    ar: () =>
      import("@mellowcad/editor/locales/ar").then((module) => module.ar),
    "pt-BR": () =>
      import("@mellowcad/editor/locales/pt-BR").then((module) => module.ptBR),
    fr: () =>
      import("@mellowcad/editor/locales/fr").then((module) => module.fr),
    it: () =>
      import("@mellowcad/editor/locales/it").then((module) => module.it),
    de: () =>
      import("@mellowcad/editor/locales/de").then((module) => module.de),
    ru: () =>
      import("@mellowcad/editor/locales/ru").then((module) => module.ru),
    pl: () =>
      import("@mellowcad/editor/locales/pl").then((module) => module.pl),
    cs: () =>
      import("@mellowcad/editor/locales/cs").then((module) => module.cs),
    hu: () =>
      import("@mellowcad/editor/locales/hu").then((module) => module.hu),
    ja: () =>
      import("@mellowcad/editor/locales/ja").then((module) => module.ja),
    ko: () =>
      import("@mellowcad/editor/locales/ko").then((module) => module.ko),
  }

export async function loadEditorLocale(
  locale: AppLocale
): Promise<EditorLocale | undefined> {
  return EDITOR_LOCALES[locale]?.()
}

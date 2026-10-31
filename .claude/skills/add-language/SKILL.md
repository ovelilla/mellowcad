---
name: add-language
description: Add a language to MellowCAD (the site, the editor and the engine's catalog), from a draft that is reachable but unannounced to a live one. Use when asked to add, translate into or launch a new language.
---

# Adding a language

Rules: `.claude/rules/i18n.md` (URLs, messages, draft and live) and `.claude/rules/ui.md` (right
to left). The words: `docs/i18n-glossary.md`.

1. **`i18n/routing.ts`**: add the tag to `locales`, then `npm run typecheck` lists every map keyed
   by `AppLocale` that now lacks it — `DIRECTION`, `LOCALE_STATUS` (start `draft`),
   `COMMAND_LANGUAGE` (`localized` when Autodesk ships an AutoCAD in it), `SCRIPT`,
   `LANGUAGE_NAMES` (the language named in itself), `OG_LOCALE` and `catalogs`
   (`i18n/messages.ts`).
2. **`messages/<tag>.json`** (the site) and **`packages/editor/src/locales/<tag>.json`** (the editor;
   `npm run locales` compiles it): a draft may leave keys out (they show in English). No test
   lists it: `TRANSLATED` (`i18n/messages.test.ts`) is every `live` language, for both, and
   `i18n/freshness.test.ts` every translation.
3. **The engine's catalog**, `cad/locales/<tag>.json` (`.claude/rules/cad-catalogs.md`): the
   interface always; `commands` only with an AutoCAD of that language to copy, and then complete,
   starting from `scripts/research/propose-commands.mjs` (skill `autocad-research`).
   `npm run locales` compiles it to `cad/locales/<tag>.ts`; make it an entry point of the
   package (`.claude/rules/engine-package.md`: `exports`, tsdown, the build's tsconfig) and add it
   to the entry table in `cad/README.md` and the table in `cad/docs/languages.md`.
4. **`i18n/engine.ts` and `i18n/editor.ts`**: its entries in `ENGINE_LOCALES` and
   `EDITOR_LOCALES`. Both are `Partial`: a draft without them draws, or shows the editor, in
   English; a live one fails `i18n/languages.test.ts`, which also holds `commands` to
   `COMMAND_LANGUAGE`.
5. **Its words** in `docs/i18n-glossary.md`, with their sources; register and search texts
   researched, not translated.
6. **A script Inter lacks**: its face in both root layouts (`preload: false`),
   `scriptFontVariables` (`lib/fonts.ts`), its `:lang()` rules in both stylesheets, and a whole
   static face for the share card (`lib/og.tsx`) if Satori is to draw it. Right to left also needs
   its `DIRECTION` and a look at every LTR island.
7. **Verify**: `npm run typecheck`, `npm run lint`, `npm test`; a production build shows the new
   pages as `●`, never `ƒ`; screenshots of the landing at 360 px and of the editor's palettes for
   text that no longer fits (skill `browser-verify`).
8. **Going `live`** (`LOCALE_STATUS`): every English key must exist (the test fails otherwise), and
   it joins the selector, `hreflang` and the sitemap. A language without an AutoCAD of its own is
   read by a native speaker first when one can be found (Arabic went without), and its
   announcement takes it off the Status section's «Next up» in every language in the same commit.

---
name: add-language
description: Add a language to MellowCAD (the site, the editor and the engine's catalog), in phases from its research and plan docs/plans/<tag>-language.md to a draft that is reachable but unannounced, then a live one. Use when asked to add, translate into or launch a new language.
---

# Adding a language

Rules: `.claude/rules/i18n.md` (URLs, messages, draft and live), `.claude/rules/cad-catalogs.md`
(the engine's words) and `.claude/rules/ui.md` (right to left). What each language's page holds:
`docs/i18n/README.md`; Spanish (`localized`) and Arabic (`global`) are the two worked examples.
Keeping a language once it is in: skill `language-review`.

The tag is BCP 47 as the catalogs write it (`pt-BR`). One phase, one commit (`feat(i18n): …`);
phases 0–1 change nothing a user sees, and the language stays `draft` until phase 6.

## 0. Research, and the plan

Nothing is translated before this is settled; each answer, with its source, goes in the plan.

1. **AutoCAD and its language pack.** Does Autodesk ship AutoCAD 2027 in the language
   (`CULTURES`, `scripts/research/tables.mjs`)? Then it is `localized`, its pack's name and link are
   recorded, and installing it on the owner's AutoCAD (for its console and desktop) is asked first;
   otherwise `global`, and why (Arabic's `docs/i18n/ar.md`). Autodesk's help in that language
   (`docs/i18n/README.md`, "Sources").
2. **`acad.pgp`.** Its aliases: `extract-strings.mjs --lang <tag>` copies it beside the tables
   (skill `autocad-research`). Which letters mean another command than in English (Spanish `H`
   undoes, `U` is UNIR).
3. **The keywords' format.** The word before a keyword list (`orWords`), how its `initget`
   capitalises inside a word, where it declares otherwise than English: `pair.mjs --lang <tag>`
   over a few prompts, then a traced console probe of them.
4. **Fonts.** Its `SCRIPT`: whether Inter and Geist Mono cover it; if not, the lightest face that
   does, one Satori can draw for the share card, and its weight against the landing's budget.
5. **Plurals.** Its CLDR categories (`Intl.PluralRules`): which counts English prints bare must be
   plurals in it (`i18n.md`, "Messages").
6. **Length.** How much longer it runs than English: the landing at 360 px, the rail's tooltips,
   the palettes' labels, the status bar, the command line's chips.
7. **Input (IME).** A layout that does not send latin letters (Ctrl shortcuts by `e.code`, as
   Arabic's), or composition (CJK): what the command line and the dynamic input must ignore while
   composing.

Then **search texts** (`docs/i18n/README.md`): what people search in that language, before any
title is written.

**The plan**, `docs/plans/<tag>-language.md`, in English: the type and its sources, the answer to
each of 1–7 with its source, the search texts, what is deviated and why, the phases below with
what each one touches, and what stays unverified. Commit it alone (`docs: <language> plan`).

## 1. Registration

**`i18n/routing.ts`**: add the tag to `locales` (and to `PREFIXES` if it has a region: `/pt-br`),
then `npm run typecheck` lists every map keyed by `AppLocale` that now lacks it — `DIRECTION`,
`LOCALE_STATUS` (`draft`), `COMMAND_LANGUAGE`, `SCRIPT`, `LANGUAGE_NAMES` (the language named in
itself), `OG_LOCALE` and `catalogs` (`i18n/messages.ts`). The tests want a site and an editor
catalog per tag: `messages/<tag>.json` and `packages/editor/src/locales/<tag>.json` as `{}` (a
draft shows English), `npm run locales`, and the editor's entry point for it (`exports`, tsdown,
the build's tsconfig, `api.md` by `npx vitest run packages/editor/api.test.ts -u`, its README's
table, a changeset; a region's tag exports without the hyphen, `ptBR`). A "Use" page a draft lacks
is served in English. Create `docs/i18n/<tag>.md` from the plan's research, with its status lines;
the plan keeps only a pointer to it.

## 2. The site and the editor

**`messages/<tag>.json`** and **`packages/editor/src/locales/<tag>.json`** (`npm run locales`
compiles the editor's and records each key's English). A draft may leave keys out (they show in
English); no test lists it: `TRANSLATED` (`i18n/messages.test.ts`) is every `live` language, and
`i18n/freshness.test.ts` every translation. Register and search texts researched, not translated;
each term, with its source and mark, in `docs/i18n/<tag>.md`.

## 3. The engine's interface

`cad/locales/<tag>.json`, its `interface` whole (`cad-catalogs.md`). `npm run locales` compiles it
to `cad/locales/<tag>.ts`; make it an entry point of the package (`.claude/rules/engine-package.md`:
`exports`, tsdown, the build's tsconfig), add it to the entry table in `cad/README.md` and the table
in `cad/docs/languages.md`, and give it its entries in `ENGINE_LOCALES` (`i18n/engine.ts`) and
`EDITOR_LOCALES` (`i18n/editor.ts`). Both maps are `Partial`: a draft without them shows English.

## 4. The command language (`localized` only)

1. Extract the tables: `node scripts/research/extract-strings.mjs --lang <tag>` (installed pack),
   or `scripts/research/open-pack.sh --lang <tag> <update.exe> <pack.exe>` (not installed: the
   current update's tables, the pack's `acad.pgp`; skill `autocad-research`).
2. `node scripts/research/propose-commands.mjs --lang <tag>`: its JSON is what one table string
   settles; its report, every key. What it leaves out (several strings, an ICU select, plurals,
   partial matches, no source) is worded by hand, from the console.
3. `commands` complete, never partial (`cad/locales/locales.test.ts`). Check the proposal with
   `catalog-sweep.mjs --lang <tag>` and the console (`probe.sh --lang <tag>`, skill
   `command-review`) prompt by prompt where the report says so; what no probe settles is
   **unverified** in `docs/i18n/<tag>.md`.
4. Each command's coverage entry names it after `· <tag>`; the `/docs` pages that read the catalog
   regenerate (`npm run docs:check`).

## 5. Script and direction

A script Inter lacks: its face in both root layouts (`preload: false`), `scriptFontVariables`
(`lib/fonts.ts`), its `:lang()` rules in both stylesheets, and a whole static face for the share
card (`lib/og.tsx`) if Satori is to draw it. Right to left also needs its `DIRECTION` and a look at
every left-to-right island (`ui.md`). Plurals and IME as the plan found.

## 6. Verify, then live

- `npm run typecheck`, `npm run lint`, `npm test`; a production build shows the new pages as `●`,
  never `ƒ`, and the budgets of `i18n.md` hold (skill `language-review` measures them).
- Screenshots of the landing at 360 px and of the editor's palettes for text that no longer fits
  (skill `browser-verify`).
- **Going `live`** (`LOCALE_STATUS`): every English key exists, `i18n/languages.test.ts` passes
  (both catalogs, `commands` as declared, `docs/i18n/<tag>.md`), and the language joins the
  selector, `hreflang` and the sitemap. A `localized` one never goes live without its command
  language. A `global` one is read by a native speaker first when one can be found (Arabic went
  without; its page says so). The announcement takes it off the Status section's «Next up» in
  every language in the same commit; `docs/i18n/README.md`'s table gets its row.
- The plan shrinks to a summary and its commits (skill `finish-feature`).

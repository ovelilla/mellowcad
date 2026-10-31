---
name: language-review
description: Keep MellowCAD's languages current once they are in — after an AutoCAD update (tables re-extracted, each localized command language swept and probed again), translations whose English moved on, text that no longer fits, the † and unverified terms, a native review still pending, and the size budgets that grow with each language. Use after an AutoCAD update, when i18n/freshness.test.ts fails, before announcing a language, or when asked to review or audit one.
---

# Reviewing the languages

`command-review` keeps a command against AutoCAD; this keeps each language against its sources and
its readers. A review walks every language of `routing.locales` (`i18n/routing.ts`), each by its
`COMMAND_LANGUAGE`, or the one it was asked for. Rules: `.claude/rules/i18n.md` and
`.claude/rules/cad-catalogs.md`; each language's state is its `docs/i18n/<tag>.md`.

What a review finds goes where it lives: a fix to the catalogs and the language's page, what stays
open to that page (marked as `docs/i18n/README.md` says), a budget to `i18n.md`. The measurements
and what was tried go in the commit message. A review too large for one session writes its plan
to `docs/plans/<tag>-language-review.md` first, as `command-review` does.

## 0. Baseline

- `git status --short`: another session editing a catalog is noted, and its keys wait for it.
- `npm run typecheck` and `npx vitest run i18n cad/locales packages/editor/src/locales`: green, or
  the failures noted before anything is blamed on the review.
- The AutoCAD build (`(getvar "_VERNUM")` in the console) against the one each `localized`
  language's page last records, and the date of its `research/strings/all_<tag>.tsv`.

## 1. After an AutoCAD update (each `localized` language)

**An update rewords prompts** (`command-review`'s annex-catalogs.md: DIMANGULAR's
`Designe primer extremo`).

1. Move the language's tables to `research/strings/previous/` and extract them again,
   `acad.pgp` included: `node scripts/research/extract-strings.mjs --lang <tag>`, or for a
   language whose pack is not installed `scripts/research/open-pack.sh` with the new update (skill
   `autocad-research`; both refuse to overwrite a table that changed).
2. `node scripts/research/catalog-sweep.mjs --lang <tag>`, read state by state as annex-catalogs.md
   §2 says. `lang-2027` and `en-2027` are findings, each confirmed by a console probe of the prompt
   (`scripts/research/probe.sh --lang <tag>`) before the catalog changes; the console beats the
   table.
3. The aliases: the new `acad_<tag>.pgp` against the one in `previous/`; an alias added or moved is
   a finding against `commands.names`.
4. `node scripts/research/propose-commands.mjs --lang <tag>` and its report: a proposal that now
   differs from the catalog is a wording to check, never one to copy unread.
5. Each fix: `npm run locales`; the English surface snapshot does not change (only the translation
   did); what a probe settled stops being **unverified** on the language's page.

## 2. Translations whose English moved on

`i18n/freshness.test.ts` lists each stale key with its old and new English. Read both, word the
key again — a `localized` language's command language from its tables and console, never from the
new English — and only then `npm run locales -- --reviewed <tag>:<key>`, key by key: a key marked
reviewed unread is a translation nobody checked. The "Use" pages' `sourceHash` works the same way
(`.claude/rules/docs.md`).

## 3. Text that does not fit

- List the keys each language runs longest against English: a throwaway script over the catalogs
  in the scratchpad, ratio and length, the editor's and the engine's `interface` first.
- See them in place (skill `browser-verify`): the landing at 360 px, the rail's tooltips, the
  palettes' rows, the status bar, the command line's chips, the menus, in each language; a
  right-to-left one also for its left-to-right runs.
- A cut or wrapped label is a finding. A project's word is shortened within the language's
  register; an AutoCAD word is Autodesk's and stays — the layout gives way, as AutoCAD's own does.

## 4. † and unverified

`grep -nE '†|unverified|\| (no|partial)' docs/i18n/<tag>.md`, and the `· <tag>` lines of
`docs/coverage/` that say unverified:

- In a `localized` language each mark is a probe: the console, the tables, the help in the
  language's folder, the desktop. Settle what a source now answers; what none does keeps its mark
  with what was seen.
- In a `global` language a † waits for a native reader; it changes only on new evidence (a course,
  a book, Autodesk's own material in that language), cited on the page.

## 5. Native review

A language whose status lines say it went live without a native speaker's review keeps that
pending. Keep its page's **Review** section current — where a reader should look first, with what
changed since — so that whoever reviews it starts there. A review received: its corrections go in
like any fix, and the status lines name the date and that a native speaker read it.

## 6. Budgets

The table of `.claude/rules/i18n.md`, measured on a production build of a clean worktree
(`git worktree add` inside `~/projects`, `cp -al node_modules`, `npm run build`): Next's build in
the shared tree fights the dev server over `.next` (AGENTS.md).

- **Each engine catalog's chunk**: find it by a string only that catalog holds
  (`grep -l` under `.next/static/chunks`), then `gzip -9 -c <chunk> | wc -c`.
- **A language's first load of the landing**, Brotli: `npx next start` in the worktree and the
  bytes the browser transferred (skill `browser-verify`), for each language.
- **Functions**: the build's route table shows `○` and `●` only, but `/api/search`.
- **Any static file under 20 MB**: `find .next -type f -size +15M` lists what is near it. What is
  built once per language grows with each one: a static search index of three languages passed
  Vercel's limit (`app/api/search/route.ts`).

Over a budget, or within a tenth of it, is a finding: what grew, and since which commit.

## 7. Close

- Each language reviewed: its status lines gain the date and the AutoCAD build it was reviewed
  against; its page loses what was settled.
- A rule the review proved wrong is fixed in the same change; a step this skill lacked is added
  here.
- Skill `finish-feature`: the gate and the commit (`fix(i18n): …` for catalog fixes, `docs: …` for
  pages alone), one per language when they separate cleanly. Report, per language, what was
  fixed, what stays open and the budgets measured.

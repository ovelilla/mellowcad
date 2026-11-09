# French (`fr`) — plan

The first language after the pilot, through skill `add-language`, phase by phase: `fr` from nothing
to `live` at `/fr`, with the whole site — the editor, the six "Use" pages written by hand, the 97
command pages' notes, the 12 exercises, the generated pages — and the command language of
AutoCAD 2027 in French. Session 08 of the visibility plan (`docs/plans/seo/08-frances.md`,
`docs/next-seo.md` L8). What does not fit is fixed in the system, never in the language.

The research of phase 0 (the pack and its install, `acad.pgp`, the keywords' format, fonts,
plurals, length, input, the search texts) and the decisions on register and typography are the
language's page, `docs/i18n/fr.md`; this plan keeps the phases and where they stand.

## Decisions

- **Tag `fr`, URL `/fr`**, `og:locale` `fr_FR`, «Français» in the selector: one French for every
  French-speaking reader, as AutoCAD has one (`fr-FR`). The tag is the segment: no prefix.
- **The command language before the site's text.** The notes of the 97 command pages name each
  command in French in their title and lead (`Commande DECALER (OFFSET)`), so phase 4 comes before
  phase 2, unlike pt-BR's order; the engine's `interface` goes with the site (phases 2–3).

## Phases

| Phase | Commit | What it touches |
| --- | --- | --- |
| 0 | `2294f28f` docs | The research and this plan; `runacc.sh`'s French banner |
| 1 | feat(i18n) | `fr` registered as a `draft` (`localized`, `latin`): `routing.ts`, `catalogs`, the diagrams' fixture, the docs' quotes (« … », spaced with U+00A0); empty site and editor catalogs; the editor's `./locales/fr` entry (`exports`, tsdown, tsconfig, `api.md`, README, changeset); `docs/i18n/fr.md`. Checked on a dev server: `/fr`, `/fr/draw`, the manifest, the docs' English fallback with its canonical, the 404, `noindex`, and nothing in the selector, `hreflang` or the sitemap |
| 4 | `feat(engine)` | the engine catalog's `commands` (`cad/locales/<tag>.json`), whole, from the console (439 probes, `console-pair.mjs`), the names by `getcname` and the FRA help, the tables where no probe shows a key; the engine's entry point; `· fr` in each coverage entry |
| 2–3 | `feat(i18n)` | the engine's `interface`, from the pack's DLLs and `acad.cuix`; `messages/fr.json`, the editor's catalog, the six "Use" pages, the 97 command notes and the 12 exercises, with their search titles; `docs/i18n/fr.md`'s terms |
| 5 | — | nothing: latin, left to right; plurals as `fr.md` says |
| 6 | `feat(i18n)` | the gate, a production build (`●`), the budgets measured before and after in worktrees (the landing's first load is within a KiB of 250 in every latin language), screenshots, AZERTY's dead keys; `live`, the selector, `hreflang`, the sitemap; what names or counts the languages by hand (the README, the editor's package and docs, the issue forms, the launch kit); the new URLs at the end of the indexing queue (`docs/next-seo.md` §7) |

## Unverified

Until the console has run (phase 4): which of several table strings a prompt uses (217
`several`), the capitals of an `initget` the table does not hold (-OSNAP's three), U's name, and
the names the tables lack.

# Brazilian Portuguese (`pt-BR`) — plan

The pilot of the language system (`docs/next-languages.md`, phase 5): `pt-BR` from nothing to
`live` through skill `add-language`, phase by phase. What does not fit is fixed in the system
(scripts, skills, rules, tests), never worked around in the language.

## 0. Research (31/10/2026)

Moved whole to `docs/i18n/pt-BR.md` in phase 1, its one home: the language pack and the update
the tables come from, the help in `PTB`, `acad.pgp`'s letters, the keywords' format and the
proposal's counts, fonts, plurals (`one` takes 0), length, input, the search texts, the register,
and what stays unverified until the pack is installed.

### Decisions

- **URL `/pt-br`**, tag `pt-BR` everywhere else: `PREFIXES` in `i18n/routing.ts`, the `[locale]`
  segment carrying the prefix and `segmentLocale` mapping it back (`docs/i18n/pt-BR.md`,
  "Deviations").
- `LANGUAGE_NAMES`: «Português (Brasil)».
- Register (phase 2, from Autodesk's PTB help): the editor labels as AutoCAD pt-BR does; the
  landing speaks to «você» in the imperative («Digite L. Pressione Enter. Desenhe.»).

## Phases

`<tag>` is `pt-BR` below.

| Phase | Commit | What it touches |
| --- | --- | --- |
| 0 | `fix(research)` + `docs` | `open-pack.sh`; `forms()` takes the language's «ou»; `probe.sh`'s language suffixes; skills `autocad-research`, `add-language`, `language-review`; this plan |
| 1 | `feat(i18n)` | **Done** (31/10/2026), below |
| 2 | `feat(i18n)` | `messages/<tag>.json`, `packages/editor/src/locales/<tag>.json` (`npm run locales`) and its `EDITOR_LOCALES` entry (`ptBR`), the four "Use" pages `content/docs/<page>.<tag>.mdx`; each term with its PTB GUID or table id in `docs/i18n/<tag>.md` |
| 3 | `feat(i18n)` | `cad/locales/<tag>.json` `interface`, the package entry (`exports`, tsdown, build tsconfig), `cad/README.md`, `cad/docs/languages.md`, `ENGINE_LOCALES` |
| 4 | `feat(engine)` | `commands` whole from `research/proposals/pt-BR.json`, the rest by hand from the report, `catalog-sweep.mjs --lang pt-BR`, console probes if the pack is installed; `· pt-BR` in each coverage entry; `npm run docs:check` |
| 5 | — | nothing: latin, left to right; plurals as §5 (in phases 2–4) |
| 6 | `feat(i18n)` | gate, production build (`●`), budgets (`language-review`), screenshots at 360 px and the palettes, the dead keys; `live`, selector, `hreflang`, sitemap, «Next up» off in every language, `docs/i18n/README.md`'s row; this plan shrinks to a summary |

Phase 4 is three or four sessions on its own: Spanish's `several` and `no-source` took the
console, command by command.

## Phase 1, as done

- `pt-BR` in `routing.locales`, `draft`, `localized`, `latin`; `PREFIXES` gives it `/pt-br`. The
  segment and the tag are two things now: `localeSegment`, `segmentLocale` and `localeParams()`
  (`i18n/routing.ts`), read by `localePath`, `unlocalizedPath`, `i18n/request.ts`, both layouts,
  the `og`, `og/draw`, manifest and `docs-md` routes and the docs page's `generateStaticParams`;
  `i18n/rewrites.ts` reads the prefixes from `routing` itself. Checked on a dev server: `/pt-br`,
  `/pt-br/draw` (`lang="pt-BR"`, `noindex`), its manifest (`start_url` `/pt-br/draw`), its 404,
  and `/pt-BR/draw` a 404.
- Fixed in the system, not the language: the docs' locale suffixes took two letters only
  (`check.ts`, `remark-command-names.ts`); a compiled catalog exported its tag as a name
  (`export const pt-BR`: `catalogExport` gives `ptBR`); `docs:check` wanted every "Use" page for a
  draft (now only for a live language; a draft's missing page is English's under its prefix,
  canonical to it, with the «English only» notice), `isTranslated` now means every live language,
  and the generator writes a draft's page only once its messages name it (`translatesPage`).
- Empty catalogs `messages/pt-BR.json` and `packages/editor/src/locales/pt-BR.json`, and the
  editor's entry `./locales/pt-BR` with a changeset (the editor's test wants one per catalog).
  `EDITOR_LOCALES` and `ENGINE_LOCALES` stay without it until phases 2 and 3 fill the catalogs.
- Not yet: `docs/i18n/README.md`'s row (phase 6, with `live`).

## Next session

> Ejecuta la fase 2 de docs/plans/pt-BR-language.md (el sitio, el editor y las páginas «Use» en
> portugués de Brasil), y la 3 si cabe. Lee antes el plan entero, docs/i18n/pt-BR.md, el brief
> docs/next-languages.md, el skill add-language y las reglas i18n.md, docs.md y cad-catalogs.md;
> es.md es el ejemplo de cómo se fuentea cada término (GUID de la ayuda PTB o id de tabla). Puede
> haber otras sesiones en el árbol y cambios staged ajenos: mira git diff --cached y haz el commit
> con git commit --only -- <tus archivos>; si el gate está rojo por otros, pásalo en un worktree
> limpio desde HEAD con solo tus archivos. Commit en main, sin push. Pon al día el plan (con el
> prompt de la sesión siguiente al final) y el estado del brief.

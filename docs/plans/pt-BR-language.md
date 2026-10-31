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
| 2 | `feat(i18n)` | **Done** (31/10/2026), with phase 3 in one commit, below |
| 3 | `feat(i18n)` | **Done** (31/10/2026), below |
| 4 | `feat(engine)` | **Done** (31/10/2026, four commits): `commands` whole, from the console, then its prompts per command and -OSNAP, a default's form and a label per prompt, and the desktop with an answer's form, below |
| 5 | — | nothing: latin, left to right; plurals as §5 (in phases 2–4) |
| 6 | `feat(i18n)` | gate, production build (`●`), budgets (`language-review`), screenshots at 360 px and the palettes, the dead keys; `live`, selector, `hreflang`, sitemap, «Next up» off in every language, `docs/i18n/README.md`'s row; this plan shrinks to a summary |

Phase 4 took four sessions: Spanish's `several` and `no-source` took the console, command by
command.

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

## Phases 2 and 3, as done

One commit: the generated "Use" pages read both catalogs, so they come out right only together.

- **Sources.** The pack's interface DLLs and its `acad.cuix`, paired by id with the installed
  English ones: palettes (`ax26res`), dialogs (Drawing Units, Dimension Style, Drafting Settings),
  task dialogs, the Layer Properties Manager, the shortcut menus and the ribbon. The PTB help only
  where the pack has none: it leaves some dialog labels in English («Baseline Spacing»). Each term
  is in `docs/i18n/pt-BR.md` with its id and mark; how to read each kind of file is in skill
  `autocad-research` (new paragraph). The pack was downloaded again (246 MB) to a scratch folder;
  the update was not: what 2027.1 rewords is in `acadres` and `AcDimRes`, whose words come from
  the tables already extracted from it (the snaps' «Ponto final»).
- **Site** (`messages/pt-BR.json`): every key, the register of `pt-BR.md` («você», the imperative), the
  title and description from the search texts. Prose names commands in pt-BR AutoCAD's language
  (`LINHA`, `CI`, `AP`, `DESLOCAMENTO`, «Next up» `EDITARP AJustar e Spline`).
- **Editor** (`packages/editor/src/locales/pt-BR.json`, `EDITOR_LOCALES`): every key.
- **Engine** (`cad/locales/pt-BR.json`, `interface` whole but `linetype` and `hatchPattern`): the
  `./locales/pt-BR` entry (`ptBR`), `cad/api.md`, a changeset, both READMEs' tables,
  `ENGINE_LOCALES`.
- **"Use" pages**: `getting-started` and `differences` by hand, with `sourceHash`; `commands` and
  `shortcuts` generated.
- Checked on a dev server: `/pt-br`, `/pt-br/draw`, `/pt-br/docs` and its pages, `/pt-br/privacy`.
- **Until phase 4** the command line speaks the global language, so the draft is incoherent on
  purpose where prose names pt-BR commands: the command line's placeholder (`LINHA, AP, CO…`), the
  landing's `CI` and `AP` (English `AP` is APPLOAD), the generated pages' names and prompts in
  English. Phase 4 regenerates the pages.
- Fixed in the system: skill `add-language` §2–3 (where a `localized` language's labels come from,
  the API report and changeset, `EDITOR_LOCALES` in phase 2), skill `autocad-research` (the pack's
  interface files). Found, not changed: `pluralMessage` samples 0 for pt-BR's `one`, so a landing
  island's plural cannot take `=0` (`pt-BR.md`, "Plurals"); none needs it today.

## Phase 4, as done

- **The pack is installed** (asked first; the owner had it installed from WSL): its `.exe -q`
  elevated, then 2027.1's again, since a pack after an update is the release build. Its tables are
  `open-pack.sh`'s byte for byte.
- **`commands` whole** in `cad/locales/pt-BR.json`, from the console first: 430 of the reviews'
  probes run in pt-BR and paired with their English transcripts by the new
  `scripts/research/console-pair.mjs` (`--select` picks them, `probe.sh --lang-only` runs them),
  then the proposal, the DLLs and the PTB help; names by `getcname` (`scripts/research/probes/names/`).
  How each piece was sourced, the deviations and what is unverified: `docs/i18n/pt-BR.md`,
  "Command language". `· pt-BR` in every coverage heading; the "Use" pages regenerated, so the
  draft's incoherence of phases 2–3 (the placeholder, `CI` and `AP`) is gone.
- Fixed in the system: `runacc.sh` knew the console's banner in English and Spanish only (pt-BR's
  ran empty), and its timeout left the Windows console hanging (ucs/p235 in pt-BR held a run for
  minutes); `probe.sh --lang-only`; skills `autocad-research` (installing a pack from WSL, the
  pairing), `add-language` §4, `command-review`'s catalogs annex.
- **Second session** (31/10/2026, `feat(engine)`): every "Pending" prompt English shares and
  pt-BR words per command has its id, its tool's change and a test
  (`cad/application/brazilianPrompts.test.ts`); the keywords one prompt spells otherwise are in
  `promptKeywords`, and the labels pt-BR declares otherwise in `keywordLabels`, English's and
  Spanish's beside. UNDO's `<S>` needed nothing (line/p109). -OSNAP: its pt-BR words had one
  capital (`Meio`, `Centro`, `Aparente`), so `A`, `M`, `C`… at any point prompt were snaps, not
  keywords; they take three now, as the console (names/p07, p09), and the listing prints
  33200–33213's short names in OSMODE's order in every language (English printed `Qua,Per,Nea,App`
  and Ext before Ins; names/p10). The `unseen` keys a transcript does print were compared by hand
  (six wordings corrected) and the six English probes that show the rest ran in pt-BR. Each
  detail: `docs/i18n/pt-BR.md`, "Per command and per prompt".
- Fixed in the system: `EngineText.keywordLabel` takes the prompt (a label equal to the command's
  word gives way to a prompt's own, pt-BR SPLINEDIT's `Sair`); rule `cad-catalogs.md` and skill
  `add-language` §4 (-OSNAP's three capitals; what the report's `several` and `unseen` mean).
  Spanish UCSICON's Noorigin is `Sin`, listed `Sin origen`, as its console declares (ucs/p347).
- **Third session** (31/10/2026, `feat(engine)`): where a default touches what precedes it is the
  language's, `commands.promptForms` by prompt id (the tools' `tight` and `open` are gone), and a
  label one prompt lists otherwise is `commands.promptKeywordLabels`: pt-BR spaces UCS's and
  -VIEW's four, and lists UCS New's `EIxo z`. A minor of the catalog's shape (changeset,
  `cad/docs/languages.md`), held in the three languages by `cad/application/promptForms.test.ts`.
  The console showed English's arrays' main prompt touching its default too (`…/eXit]<eXit>:`, as
  pt-BR's), spaced only in Spanish: the arrays' coverage had it as not built ("the space is per
  question here, not per language"), and it is built now. The `unseen` keys Pending named were
  probed in both languages (names/p11–p23) and compared by hand: MATCHPROP's source and CHAMFER's
  3D polyline refusal corrected; ATTEDIT's `Select block reference` is its dialog's (the console
  runs -ATTEDIT).
- Fixed in the system: MATCHPROP runs in the console once `(arxload "acmatch.crx")` loads it
  (skill `autocad-research`, console.md); `locales.test.ts` read only spaced defaults off the
  English surface, so the arrays' prompts would have left its abbreviation check; skills
  `add-language` §4, `new-command`, `command-review`'s catalogs annex.
- **Fourth session** (31/10/2026, `feat(engine)`): the desktop in pt-BR (`/language pt-BR`, asked
  first; the owner's default and profile left as found), against English's own desktop reviews:
  the toggles' lines, two corrected (`<Ortogonal ativado>`, `<Grade ativado>`), Polar's tooltip
  and ATTEDIT's `Selecionar referência de bloco` as worded; the dynamic input's labels are ours
  (AutoCAD's fields have none) and the `feedback.measure*` readout no AutoCAD view shows, so both
  stay unverified (`research/probes/names/d01`–`d05`). **An answer written against the colon is
  the language's**: `commands.answerForms` by prompt id and `format.answeredTight`, a minor of the
  catalog's shape, read off every traced `Message` of the three languages: DIMSPACE's and
  -DIMSTYLE's redefine in all three, pt-BR's PEDIT, MREDO, ARRAYPATH and ARRAYRECT's rows at
  Spacing, Spanish's unit cell (`cad/application/promptForms.test.ts`). ARRAYPATH's main prompt and
  ARRAYRECT's rows at Spacing took ids of their own; pt-BR Rows' is `Especificar a distância entre
  linhas`, as its console words it.
- Fixed in the system: the trailing space is read from the console's `Message`, not the table
  (TRIM's Mode, 13161, has none in the table and one in the console): rule `cad-catalogs.md`, skills
  `add-language` §4, `new-command`, `command-review`'s catalogs annex. Found: the
  English desktop came up behind the owner's windows, and `acad.sh click` sent the clicks and keys
  meant for it to VS Code; the English half came from the earlier desktop reviews instead. Skill
  `autocad-research` (gui.md) now says to see AutoCAD on top before clicking; the tool itself still
  does not bring it forward.

## Next session

> Sigue la fase 6 de docs/plans/pt-BR-language.md (verificar y pasar a `live` el portugués de
> Brasil): las fases 1 a 4 están hechas, con el lenguaje de comandos completo; la 5 no tiene nada.
> Lee antes el plan entero, docs/i18n/pt-BR.md (sobre todo Review, Length, Input y Unverified), el
> brief docs/next-languages.md, los skills add-language (§6), language-review (los presupuestos),
> browser-verify y finish-feature, y las reglas i18n.md y marketing.md. Pasa el gate y una build de
> producción en un worktree limpio (sus páginas `●`, nunca `ƒ`; no pelees con el `next dev` del
> árbol por `.next`), mide los presupuestos de i18n.md con language-review, haz las capturas de la
> landing a 360 px y de las paletas del editor en pt-BR buscando texto que no cabe, y comprueba en
> el navegador las teclas muertas de ABNT2 en la línea de comandos y la entrada dinámica. Corrige
> lo que falle en el sistema, no en el idioma. Luego pásalo a `live` (LOCALE_STATUS, selector,
> `hreflang`, sitemap, la fila de docs/i18n/README.md) y quita «Next up» de la sección Status en
> todos los idiomas en el mismo commit, con CONTENT_UPDATED. Publicar es del dueño: el commit va a
> main, sin push. Puede haber otras sesiones en el árbol y cambios staged ajenos: mira git diff
> --cached; si comparten tus archivos, trabaja en un worktree limpio desde main, pasa ahí el gate y
> lleva a main solo tus hunks. Reduce el plan a un resumen con sus commits y pon al día el estado
> del brief.

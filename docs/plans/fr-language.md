# French (`fr`) — plan

The first language after the pilot, through skill `add-language`, phase by phase: `fr` from nothing
to `live` at `/fr`, with the whole site — the editor, the six "Use" pages written by hand, the 97
command pages' notes, the 12 exercises, the generated pages — and the command language of
AutoCAD 2027 in French. Session 08 of the visibility plan (`docs/plans/seo/08-frances.md`,
`docs/next-seo.md` L8). What does not fit is fixed in the system, never in the language.

## 0. Research (9/11/2026)

### 1. AutoCAD and its language pack

- **`localized`.** Autodesk ships AutoCAD 2027 in French (culture `fr-FR`, the only French one of
  the 14 in `CULTURES`): `Autodesk_AutoCAD_2027_French_Language_Pack.exe`, 245,841,120 bytes,
  2/3/2026, at `https://up1.autodesk.com/prd/2027/ACD/CFDAD754-9F18-3486-9722-8CCEE6EE11B4/`
  (the forum thread "2027 Product download links" refuses automated reads; ceethreedee.com's
  "Civil 3D 2027 Download all the extensions" lists the same links). Signed by Autodesk, Inc.
  (Authenticode valid).
- **Installed on the owner's AutoCAD on 9/11/2026**, as the session's prompt authorises: the pack
  with `-q`, elevated, then `AutoCAD_2027.1_Update.exe` again (the update of
  `docs/i18n/pt-BR.md`, still the current one: no 2027.1.1 or 2027.2 on Autodesk's server).
  `fr-FR/acadres.dll` went from 26.0.60 (the release) to 26.0.116, as `es-ES/` and `pt-BR/`;
  `acad.exe` stays 26.0.118. The console runs in French (`runacc.sh … fr-FR`), and
  `extract-strings.mjs --lang fr` wrote the tables from the install (`all_fr.tsv`, 11,093 ids, the
  same as Spanish's and pt-BR's; `acad_fr.pgp`).
- **Help:** `https://help.autodesk.com/cloudhelp/2027/FRA/AutoCAD-Core/files/GUID-….htm` answers
  with the English GUIDs (`GUID-0546E8D5-…` is «ARETERACCORD (commande)», `GUID-D54C266B-…`
  «EDITSOLIDE (commande)»). Its prose writes «Remarque : …», a plain space before the colon.

### 2. `acad.pgp`

`research/strings/acad_fr.pgp` (560 lines, UTF-8 with BOM, CRLF, tabs, as pt-BR's). Letters that
run another command than in English, among the ones an English hand types without thinking (each
French command's own name, as the tables propose it, is checked in the console in phase 4):

| Alias | English    | French                                                   |
| ----- | ---------- | -------------------------------------------------------- |
| `E`   | ERASE      | ETIRER (STRETCH); EFFACER is `EF`, and `DELETE` stays    |
| `S`   | STRETCH    | STYLE                                                    |
| `CO`  | COPY       | COLLAGSPEC (PASTESPEC); COPIER is `CP`                   |
| `RO`  | ROTATE     | RENOMMER (RENAME); ROTATION is `RI`                      |
| `SC`  | SCALE      | GESTSCU (UCSMAN); ECHELLE is `EH`                        |
| `EX`  | EXTEND     | EXPORTER (EXPORT); PROLONGER is `PR`                     |
| `PR`  | PROPERTIES | PROLONGER (EXTEND); PROPRIETES is `PROP`, `PROPS`        |
| `PL`  | PLINE      | CALQUE (LAYER); POLYLIGNE is `PO`                        |
| `RE`  | REGEN      | RESEAU (ARRAY); REGEN is `RG`                            |
| `T`   | MTEXT      | TEXTE (TEXT); TEXTMULT is `TT`, `TX`                     |
| `LI`  | LIST       | COTLIN (DIMLINEAR); LISTE is `LS`, `LST`                 |
| `MO`  | PROPERTIES | MODIFTEXTE (TEXTEDIT)                                    |
| `ST`  | STYLE      | STYLETABLEAU (TABLESTYLE); STYLE is `S`                  |
| `AP`  | APPLOAD    | APERCU (PREVIEW)                                         |
| `DO`  | DONUT      | DROITE (XLINE)                                           |
| `PA`  | PASTESPEC  | PARAMDESS (DSETTINGS)                                    |

And none at all for `O`, `M`, `TR`, `F`, `CHA`, `POL`, `X`, `LA`, `BR`, `CH`, `D`, `DT`, `MT`,
`LT`, `LW`, `PU`, `MA`, `AR`, `AA`, `EXT`, `SL`, `V`: in French AutoCAD they are unknown commands,
as they will be here. DECALER is `DC`, DEPLACER `DP`, AJUSTER `AJ`, RACCORD `RD`, CHANFREIN `CF`,
DECOMPOSER `DE`, COUPURE `CU`, HACHURES `H`. Two names to keep apart: SLICE is SECTION (`SE`), and
SECTION is COUPE (`COU`). `LAYER` is an alias of CALQUE, as `DELETE` of EFFACER.

### 3. The keywords' format

- **«ou»** before the list, deduced by `orWords` from the tables (` (ou)$`), with no list per
  language.
- **`initget`** like Spanish's and pt-BR's: the capital inside a word marks the letter (`Arc
  Clore Demi-larg LOngueur LIgne annUler LArgeur _Arc Close Halfwidth Length LIne Undo Width`,
  21298); the console lists `[annUler]` at LINE's next point.
- **No space before a prompt's colon**, as English: `Commande:` (22843), `Spécifiez le premier
  point:`, `… [Par/Effacer/Calque] <Par>: ` (22470). The French typography of the site (below) is
  not the command line's, which is AutoCAD's string.
- **Two words for one English keyword** in different prompts, as Spanish and pt-BR have: OFFSET's
  Through is `Par` at its main prompt (22470) and `Via` at 21215; SNAP declares `ACtif INactif
  Résol … Aspect` (25920). The console decides which the command uses.
- U is `H` in 21134 and `U` in 45049 and 52855, as pt-BR's was split: the console settles it
  (names/p02).
- `propose-commands.mjs --lang fr`: 1,383 proposed, 217 `several`, 138 `partial`, 39 `plural`, 8
  `select`, 476 `no-source`, of a catalog grown to 2,392 command keys since pt-BR's 991; `names`
  126.
- **The console:** `console-pair.mjs --lang fr --select` picks 439 probes (4,372 keys and keywords
  shown), run by `probe.sh --lang fr --lang-only`. `runacc.sh` knew the banner's last line in
  English, Spanish and Portuguese: French's is «Utilitaires de menu AutoCAD chargés.», added.

### 4. Fonts

`latin`. Inter and Geist Mono have every French letter the copy needs (é è ê ë à â î ï ô û ù ü ÿ ç
œ æ and their capitals, « » ’ – — …, U+00A0) in the share card's subsets
(`assets/fonts/inter-latin-600-normal.woff`, `geist-mono-latin-400-normal.woff`, read with
opentype.js): nothing to add, no budget spent. **Missing there: U+202F** (the narrow no-break
space of French typography) and Ÿ. So the copy uses U+00A0 where French puts a space before
`: ; ! ?` and inside « » — the common web practice, which also keeps the sign from wrapping alone
onto the next line — and never U+202F, which Satori could not draw.

### 5. Plurals

CLDR `fr`: `one`, `many`, `other`, and **`one` takes 0 and 1.5** (`i = 0,1`), as pt-BR's. Here it
is the grammar: French writes «0 objet» and «1,5 mètre» in the singular, so a count of 0 needs no
`=0` but where English has one. `many` is for compact millions (`1 million d'objets`), which no
message prints. `Intl.NumberFormat("fr")` groups thousands with U+202F (`1 234`): a count the site
formats above 999 would print it; none does today (the landing's numbers are below 1,000).

### 6. Length

On the same table ids, French runs a little longer than Spanish and pt-BR: labels of up to 20
characters +30% in total (median +20%, 90th percentile +80%; Spanish +30%, +20%, +80%; pt-BR +27%,
+20%, +75%), prompts +29% (Spanish +22%, pt-BR +25%). The screenshots of phase 6 check the palette
rows, the status bar and the chips.

### 7. Input

French is typed on AZERTY (France, Belgium, the Maghreb), Swiss French on QWERTZ, Canadian
French on its own QWERTY: all latin. AZERTY's top row gives `& é " ' ( - è _ ç à` and its digits
need Shift, so **Ctrl+1, Ctrl+9 and Ctrl+0 arrive as Ctrl+&, Ctrl+ç and Ctrl+à**: `shortcutKey`
(`cad/adapters/CadEngine.ts`) already reads a Ctrl combination whose key is no latin letter or
digit by its physical key (`Digit1`), as it does for Arabic, so nothing to add. Letters arrive as
typed (`Ctrl+Z` is the key marked Z). Dead keys `^` and `¨` compose `ê`, `ï`: checked in the
command line and the dynamic input in phase 6 (skill `browser-verify`), as pt-BR's ABNT2.

### Search texts

Google's suggestions in French (`hl=fr`, `gl=fr`, and `dz`, `ma`, `be`, `ca`: the same lists),
the audit's (5/11) and this session's (9/11); Bing's keyword research (three months, worldwide,
9/11); Google Trends (France, 12 months, 9/11). Files in `~/seo-data/raw-2026-11-09/fr-keywords/`.

- **The generic term is CAO, not DAO or CAD.** Trends: «logiciel cao» 40 against «cao en ligne» 2,
  «logiciel dao» 2, «dao en ligne» 0, «dessin technique en ligne» 0; «autocad gratuit» 60,
  «autocad en ligne» 5, «logiciel cao gratuit» 4, «cao en ligne» 1. Bing: «autocad gratuit» 3.2K
  (download intent, Autodesk's), «autocad en ligne» 707 (France 276), «autocad gratuit en ligne»
  218, «autocad en ligne gratuit» 112, «logiciel cao gratuit» 42; the rest below its threshold.
  Suggested: «cao en ligne gratuit», «logiciel cao en ligne gratuit», «cao 2d en ligne gratuit»,
  «dessin cao en ligne gratuit», «logiciel dao gratuit en ligne», «alternative autocad gratuit en
  ligne». Who ranks: MiniCAD («Dessin technique 2D & CAO en ligne, gratuit et sans installation»)
  for «cao en ligne gratuit», CADCraft («DAO en ligne gratuit, sans installation») for «logiciel
  dao gratuit en ligne», KulmanLab #7 (the audit), Onshape and Autodesk.
- **The home:** main query «CAO en ligne gratuite» (la CAO: the title agrees, Google matches
  «gratuit»), then «logiciel de CAO gratuit», «sans installation», «sans inscription» and «les
  commandes AutoCAD en français». Title «CAO en ligne gratuite avec les commandes AutoCAD —
  MellowCAD» (60, the limit); «AutoCAD en ligne gratuit» is never written, as it reads as AutoCAD
  itself.
- **The command list:** «commandes autocad francais anglais», «commandes autocad en francais»,
  «liste commande autocad anglais français (pdf)», «raccourcis clavier autocad (français)»:
  **raccourcis** is the word people use for aliases. Autodesk's own shortcut guide is #1; CAD
  Forum's EN-FR dictionary is the bilingual result. Title from «Liste des commandes AutoCAD en
  français et en anglais».
- **A command:** «commande decaler autocad», «commande ajuster autocad anglais»: the French name
  and the English one, both in the title, as in Spanish.
- **Practice:** «exercices autocad (pdf)», «exercices autocad 2d», «exercice autocad débutant»,
  «exercice autocad plan maison»: «Exercices AutoCAD».
- **DXF:** «fichier dxf» is large in Trends (25 against «autocad en ligne» 6); «ouvrir fichier dxf
  en ligne», «visionneuse dxf en ligne», «lire fichier dxf en ligne», «ouvrir dxf en ligne
  gratuit». Who ranks: elysiatools, innerscene, dxfviewer.app.
- **The guides:** «dessiner plan maison en ligne gratuit», «plan de maison 2d»; «autocad
  coordonnées relatives / polaires / absolues»; «autocad 3d en 2d».

### Decisions

- **Tag `fr`, URL `/fr`**, `og:locale` `fr_FR`: one French for France, Belgium, Switzerland,
  Canada, the Maghreb and West Africa, as AutoCAD has one (`fr-FR`). No prefix map entry: the tag
  is the segment.
- `LANGUAGE_NAMES`: «Français».
- **Register** (phase 2, from Autodesk's FRA help and the pack): the editor labels as French
  AutoCAD does; the landing says «vous» with the imperative («Tapez L. Appuyez sur Entrée.
  Dessinez.»), Autodesk's «Entrée» for the key.
- **Typography:** U+00A0 before `: ; ! ?` and inside « » in the site's and the editor's own
  words (above, Fonts); what is copied from AutoCAD keeps its own spacing.
- **Order of the phases:** the notes of 97 command pages name each command in French in their
  title and lead (`Commande DECALER (OFFSET)`), so the command language (phase 4) comes before
  the site's text (phase 2), unlike pt-BR's order.

## Phases

| Phase | Commit | What it touches |
| --- | --- | --- |
| 0 | `fix(research)` + `docs` | `runacc.sh`'s French banner; this plan |
| 1 | `feat(i18n)` | `routing.ts` (`fr`: `draft`, `localized`, `latin`, «Français», `fr_FR`), `catalogs`, empty site and editor catalogs, the editor's entry point (`exports`, tsdown, tsconfig, `api.md`, README, changeset), `docs/i18n/fr.md` |
| 4 | `feat(engine)` | the engine catalog's `commands` (`cad/locales/<tag>.json`), whole, from the console (439 probes, `console-pair.mjs`), the names by `getcname` and the FRA help, the tables where no probe shows a key; the engine's entry point; `· fr` in each coverage entry |
| 2–3 | `feat(i18n)` | the engine's `interface`, from the pack's DLLs and `acad.cuix`; `messages/fr.json`, the editor's catalog, the six "Use" pages, the 97 command notes and the 12 exercises, with their search titles; `docs/i18n/fr.md`'s terms |
| 5 | — | nothing: latin, left to right; plurals as above |
| 6 | `feat(i18n)` | the gate, a production build (`●`), the budgets measured before and after in worktrees (the landing's first load is within a KiB of 250 in every latin language), screenshots, AZERTY's dead keys; `live`, the selector, `hreflang`, the sitemap; what names or counts the languages by hand (the README, the editor's package and docs, the issue forms, the launch kit); the new URLs at the end of the indexing queue (`docs/next-seo.md` §7) |

## Unverified

Until the console has run (phase 4): which of several table strings a prompt uses (217
`several`), the capitals of an `initget` the table does not hold (-OSNAP's three), U's name, and
the names the tables lack.

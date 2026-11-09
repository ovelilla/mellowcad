# French (`fr`)

> **Command language:** `localized`, French AutoCAD's. **Status:** `draft` since 9/11/2026, at
> `/fr`: registered, its catalogs still empty (a key it lacks shows English). **Review:** none by a
> native speaker. The plan and what is left: `docs/plans/fr-language.md`.

The words are Autodesk's own French localization of AutoCAD, never a translation of ours, as
Spanish's and pt-BR's are. One French for every French-speaking reader — France, Belgium,
Switzerland, Canada, the Maghreb, West Africa — as AutoCAD has one (`fr-FR`).

## Sources

- **Language pack.** Autodesk ships AutoCAD 2027 in French (culture `fr-FR`, the only French one
  of the 14 in `CULTURES`): `Autodesk_AutoCAD_2027_French_Language_Pack.exe`, 245,841,120 bytes,
  2/3/2026, at `https://up1.autodesk.com/prd/2027/ACD/CFDAD754-9F18-3486-9722-8CCEE6EE11B4/`
  (the forum thread "2027 Product download links" refuses automated reads; ceethreedee.com's
  "Civil 3D 2027 Download all the extensions" lists the same links), signed by Autodesk, Inc.
- **Installed on the owner's AutoCAD on 9/11/2026**: the pack with `-q`, elevated, then
  `AutoCAD_2027.1_Update.exe` again (`pt-BR.md`'s, still the current update), so
  `fr-FR/acadres.dll` is 26.0.116 (2027.1), as `es-ES/` and `pt-BR/`, and `acad.exe` 26.0.118.
  The tables come from the install (`extract-strings.mjs --lang fr`: `all_fr.tsv`, 11,093 ids,
  Spanish's and pt-BR's; `acad_fr.pgp`).
- **Help.** `https://help.autodesk.com/cloudhelp/2027/FRA/AutoCAD-Core/files/GUID-<id>.htm`
  answers with the English GUIDs (`GUID-0546E8D5-…` is «ARETERACCORD (commande)»,
  `GUID-D54C266B-…` «EDITSOLIDE (commande)»). Search in English (the help MCP), read in `FRA`.
- **Console:** `runacc.sh … fr-FR` and `probe.sh --lang fr` (the banner's last line, «Utilitaires
  de menu AutoCAD chargés.», is in no table). **Desktop:** `acad.exe /language fr-FR`.

## Register

- **Landing:** «vous», short sentences, the imperative («Tapez L. Appuyez sur Entrée.
  Dessinez.»), Autodesk's «Entrée» for the key.
- **Editor:** Autodesk's register, its labels as French AutoCAD words them.
- **Typography:** a no-break space (U+00A0) before `: ; ! ?` and inside « », in the site's and the
  editor's own words; never the narrow one (U+202F), which the share card's Inter and Geist Mono
  lack (Script and font). Autodesk's help writes a plain space («Remarque : »); its prompts none
  (`Commande:`), and what is copied from AutoCAD keeps its own.

## Search texts

Google's suggestions in French (`hl=fr`, `gl=fr`, and `dz`, `ma`, `be`, `ca`: the same lists), the
visibility audit's (5/11) and session 08's (9/11); Bing's keyword research (three months,
worldwide, 9/11); Google Trends (France, 12 months, 9/11). The data is in
`~/seo-data/raw-2026-11-09/fr-keywords/`, outside the repository.

- **The generic term is CAO, not DAO or CAD.** Trends: «logiciel cao» 40 against «cao en ligne»
  2, «logiciel dao» 2, «dao en ligne» 0, «dessin technique en ligne» 0; «autocad gratuit» 60,
  «autocad en ligne» 5, «logiciel cao gratuit» 4, «cao en ligne» 1. Bing: «autocad gratuit» 3.2K
  (download intent, Autodesk's), «autocad en ligne» 707 (France 276), «autocad gratuit en ligne»
  218, «autocad en ligne gratuit» 112, «logiciel cao gratuit» 42; the rest below its threshold.
  Suggested: «cao en ligne gratuit», «logiciel cao en ligne gratuit», «cao 2d en ligne gratuit»,
  «dessin cao en ligne gratuit», «logiciel dao gratuit en ligne», «alternative autocad gratuit en
  ligne». Who ranks: MiniCAD («Dessin technique 2D & CAO en ligne, gratuit et sans installation»)
  for «cao en ligne gratuit», CADCraft («DAO en ligne gratuit, sans installation») for «logiciel
  dao gratuit en ligne», KulmanLab #7 (the audit), Onshape and Autodesk. The Maghreb searches the
  same French words (Algeria «autocad gratuit» 8, «cao en ligne» 2).
- **The home:** the main query is «CAO en ligne gratuite» (la CAO: the title agrees, and Google
  matches «gratuit»), then «logiciel de CAO gratuit», «sans installation», «sans inscription»
  and «les commandes AutoCAD en français». «AutoCAD en ligne gratuit» is never written, as it
  would read as AutoCAD itself.
- **The command list:** «commandes autocad francais anglais», «commandes autocad en francais»,
  «liste commande autocad anglais français (pdf)», «raccourcis clavier autocad (français)»:
  **raccourcis** is the word people use for aliases. Autodesk's shortcut guide is #1, CAD Forum's
  EN-FR dictionary the bilingual result.
- **A command:** «commande decaler autocad», «commande ajuster autocad anglais»: the French name
  and the English one, both in the title.
- **Practice:** «exercices autocad (pdf)», «exercices autocad 2d», «exercice autocad débutant»,
  «exercice autocad plan maison».
- **DXF:** «fichier dxf» is large in Trends (25 against «autocad en ligne» 6); «ouvrir fichier dxf
  en ligne», «visionneuse dxf en ligne», «lire fichier dxf en ligne», «ouvrir dxf en ligne
  gratuit». Who ranks: elysiatools, innerscene, dxfviewer.app.
- **The guides:** «dessiner plan maison en ligne gratuit», «plan de maison 2d»; «autocad
  coordonnées relatives / polaires / absolues»; «autocad 3d en 2d».

## Command language

### `acad.pgp`

`research/strings/acad_fr.pgp` (560 lines, UTF-8 with BOM, CRLF, tabs, as pt-BR's). Letters that
run another command than in English, among the ones an English hand types without thinking:

| Alias | English    | French                                                |
| ----- | ---------- | ----------------------------------------------------- |
| `E`   | ERASE      | ETIRER (STRETCH); EFFACER is `EF`, and `DELETE` stays |
| `S`   | STRETCH    | STYLE                                                 |
| `CO`  | COPY       | COLLAGSPEC (PASTESPEC); COPIER is `CP`                |
| `RO`  | ROTATE     | RENOMMER (RENAME); ROTATION is `RI`                   |
| `SC`  | SCALE      | GESTSCU (UCSMAN); ECHELLE is `EH`                     |
| `EX`  | EXTEND     | EXPORTER (EXPORT); PROLONGER is `PR`                  |
| `PR`  | PROPERTIES | PROLONGER (EXTEND); PROPRIETES is `PROP`, `PROPS`     |
| `PL`  | PLINE      | CALQUE (LAYER); POLYLIGNE is `PO`                     |
| `RE`  | REGEN      | RESEAU (ARRAY); REGEN is `RG`                         |
| `T`   | MTEXT      | TEXTE (TEXT); TEXTMULT is `TT`, `TX`                  |
| `LI`  | LIST       | COTLIN (DIMLINEAR); LISTE is `LS`, `LST`              |
| `MO`  | PROPERTIES | MODIFTEXTE (TEXTEDIT)                                 |
| `ST`  | STYLE      | STYLETABLEAU (TABLESTYLE); STYLE is `S`               |
| `AP`  | APPLOAD    | APERCU (PREVIEW)                                      |
| `DO`  | DONUT      | DROITE (XLINE)                                        |
| `PA`  | PASTESPEC  | PARAMDESS (DSETTINGS)                                 |

And none at all for `O`, `M`, `TR`, `F`, `CHA`, `POL`, `X`, `LA`, `BR`, `CH`, `D`, `DT`, `MT`,
`LT`, `LW`, `PU`, `MA`, `AR`, `AA`, `EXT`, `SL`, `V`: in French AutoCAD they are unknown commands,
as they will be here. DECALER is `DC`, DEPLACER `DP`, AJUSTER `AJ`, RACCORD `RD`, CHANFREIN `CF`,
DECOMPOSER `DE`, COUPURE `CU`, HACHURES `H`. Two names to keep apart: SLICE is SECTION (`SE`), and
SECTION is COUPE (`COU`). `LAYER` is an alias of CALQUE, as `DELETE` of EFFACER.

### The keywords' format

- **«ou»** before the list, deduced by `orWords` from the tables (` (ou)$`), with no list per
  language.
- **`initget`** like Spanish's and pt-BR's: the capital inside a word marks the letter (`Arc
  Clore Demi-larg LOngueur LIgne annUler LArgeur _Arc Close Halfwidth Length LIne Undo Width`,
  21298); the console lists `[annUler]` at LINE's next point.
- **No space before a prompt's colon**, as English: `Commande:` (22843), `Spécifiez le premier
  point:`, `… [Par/Effacer/Calque] <Par>: ` (22470).
- **Two words for one English keyword** at different prompts, as Spanish and pt-BR have: OFFSET's
  Through is `Par` at its main prompt (22470) and `Via` at 21215; SNAP declares `ACtif INactif
  Résol … Aspect` (25920). The console decides which a command uses.
- U is `H` in 21134 and `U` in 45049 and 52855: the console settles it.
- `propose-commands.mjs --lang fr` (9/11/2026): 1,383 proposed, 217 `several`, 138 `partial`, 39
  `plural`, 8 `select`, 476 `no-source`; `names` 126. The catalog has 2,392 command keys, against
  991 proposals when pt-BR was written.

## Script and font

`latin`. Inter and Geist Mono have every French letter the copy needs (é è ê ë à â î ï ô û ù ü ÿ ç
œ æ and their capitals, « » ’ – — …, U+00A0), also in the share card's subsets
(`assets/fonts/inter-latin-600-normal.woff`, `geist-mono-latin-400-normal.woff`, read with
opentype.js): nothing to add, no budget spent. Missing there: U+202F and Ÿ (Register).

## Plurals

CLDR `fr`: `one`, `many`, `other`, and **`one` takes 0 and 1.5** (`i = 0,1`), as pt-BR's — here it
is the grammar: French writes «0 objet» and «1,5 mètre» in the singular, so a count of 0 needs no
`=0` but where English has one. `many` is for compact millions (`1 million d'objets`), which no
message prints. `Intl.NumberFormat("fr")` groups thousands with U+202F (`1 234`): no count the site
formats reaches 1,000 today.

## Length

On the same table ids, French runs a little longer than Spanish and pt-BR: labels of up to 20
characters +30% in total (median +20%, 90th percentile +80%; Spanish +30%, +20%, +80%; pt-BR +27%,
+20%, +75%), prompts +29% (Spanish +22%, pt-BR +25%).

## Input

French is typed on AZERTY (France, Belgium, the Maghreb), Swiss French on QWERTZ and Canadian
French on its own QWERTY: all latin. AZERTY's digits need Shift, so Ctrl+1, Ctrl+9 and Ctrl+0
arrive as Ctrl+&, Ctrl+ç and Ctrl+à: `shortcutKey` (`cad/adapters/CadEngine.ts`) reads a Ctrl
combination whose key is no latin letter or digit by its physical key, as for Arabic, so they
work. Letters arrive as typed. Dead keys `^` and `¨` compose `ê`, `ï`: to check in the command line
and the dynamic input before going live.

## Review

No native reader yet; nothing written yet beyond this page.

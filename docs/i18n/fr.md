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

## Interface terms

From the installed pack by id against `en-US/` (`propose-interface.mjs --lang fr --like pt-BR`,
9/11/2026): `P <dll> <id>` a string table, `D <dll> <dialog>:<control>` a dialog's label, `N
<assembly> <key>` a .NET resource, `X <uid>` an element of `UserDataCache/fr-fr/Support/acad.CUIX`.
The engine's `interface`: 232 of 468 settled by one wording or as pt-BR's ids, 152 by the row's
place (a palette row takes `ax26res`'s word, a tool the ribbon's), the rest ours, below. The
editor's catalog: 94 of 267 by id, 77 by place, 96 ours.

| Area | English | French | Source | Verified |
| --- | --- | --- | --- | --- |
| Object snaps | Endpoint, Midpoint, Center, Quadrant, Intersection, Apparent intersection, Nearest | Extrémité, Milieu, Centre, Quadrant, Intersection, Intersection projetée, Le plus proche | P acadres 70–79, 32997 | yes |
| Status bar | Object snap, Polar tracking, Object snap tracking, Selection cycling, Clean screen, Dynamic input | Accrochage aux objets, Repérage polaire, Repérage d'accrochage aux objets, Cycle de sélection, Nettoyer écran, Saisie dynamique | P dwgaidsRes 5, 2; P acadres 25573, 20051; X XLS_6102 | yes |
|  | MODEL, Model space, Grid, Grid Snap, Snap X spacing | OBJET, Espace objet, Grille, Accrochage à la grille, Espacement X de l'accrochage | P acadres 4122, 20008; D dwgaidsRes | yes |
|  | Snap mode, Snap settings, Polar snap, Snap X (our status bar's own) | Mode Résolution, Paramètres de résolution, Résolution polaire, Résolution X | ours, from SNAP's name RESOL and the toggles' «Mode ortho» | — |
| Ribbon | Home; Draw, Modify, Annotation, Block, Utilities | Début; Dessin, Modification, Annotation, Bloc, Utilitaires | X ID_TabHome, ID_PanelDraw, ID_PanelModify, ID_PanelBasicAnnotation, ID_PanelHome_Blocks, ID_PanelStandard_Clipboard | yes |
| Draw | Line, Polyline, Circle, Arc, Ellipse, Elliptical arc, Rectangle, Polygon, Hatch, Spline | Ligne, Polyligne, Cercle, Arc, Ellipse, Arc elliptique, Rectangle, Polygone, Hachures, Spline | P ax26res 298…; X ID_RBN_0138 | yes |
|  | Center, Diameter · 2-Point · 3-Point · Start, Center, End · Center, Start, End | Centre, diamètre · 2 points · 3 points · Départ, centre, fin · Centre, départ, fin | X ID_RBN_0128, 0130, 0094, 0113, 0122 | yes |
|  | Diameter circle, 2-Point circle, Start, Center, End arc, Center ellipse (tool names) | Cercle par diamètre, Cercle par 2 points, Arc départ, centre, fin, Ellipse par centre | ours, worded from the ribbon's options | — |
| Modify | Move, Copy, Stretch, Rotate, Mirror, Scale, Offset, Trim, Extend, Fillet, Chamfer | Déplacer, Copier, Etirer, Rotation, Miroir, Echelle, Décaler, Ajuster, Prolonger, Raccord, Chanfrein | X the ribbon's buttons (ID_RBN_CMDBTN_OFFSET…), P acadres | yes |
|  | Match properties; Rectangular, Polar, Path array; Break at point | Copier les propriétés; Réseau rectangulaire, polaire, le long d'une trajectoire; Couper au niveau du point | X ACAD_335, XLS_00021866, 00021843, 00021840, ACAD_2419 | yes |
| 3D | Box, Wedge, Cylinder, Sphere, Torus; Extrude, Revolve, Presspull, Slice, Section; Fillet Edge, Solid Editing | Boîte, Biseau, Cylindre, Sphère, Tore; Extrusion, Révolution, Appuyer/tirer, Section, Coupe; Arête de raccord, Edition de solides | P acadres 22278…, X XLS_6387, ID_RBN_0173, ACAD_1946 | yes |
| Annotate | Text, Multiline text; Linear, Aligned, Rotated, Continue, Adjust space | Texte, Texte multiligne; Linéaire, Alignée, Pivotée, Continuer, Ajuster l'espacement | X ACAD_284, ID_RBN_CMDBTN_DIMSPACE; P ax26res 1169; Pivotée from XLS_0033 «Cote pivotée» | yes |
| View | SW Isometric…, Custom View; ViewCube faces; Home; WCS; Zoom Extents | Isométrique orientée S-O…, Vue personnalisée; HAUT, BAS, AVANT…; Début; SCG; Zoom vers l'étendue | P AcVMToolsRes 4236, 631, 47021, 47009, 4214; acadres 40867 | yes |
| Properties | ByLayer, *VARIES*, No selection, Object type, Rotated Dimension | DuCalque, \*VARIE\*, Aucune sélection, Type d'objet, Cote pivotée | P acadres 4221, 9214; X XLS_0033 | yes |
|  | Contents, Measurement, Fit tolerance, Ext line ext (the palette's rows) | Index, Dimensions, Tolérance, Extrémité de la ligne d'attache | P ax26res 57, 154, 99, 217: the palette's own words, unlike its menus' (Contenu…); the desktop not seen | partial |
|  | Normal X, Major axis vector X, Text alignment X, First X, Definition points (our own rows) | Normale X, Vecteur X du grand axe, Alignement du texte X, Premier X, Points de définition | ours, worded from the palette's | — |
| Shortcut menu | Osnap Overrides, Point Filters, Dimension Style, Copy with Base Point | Remplacer accrobj, Filtres de coordonnées, Style de dimension, Copier avec point de base | X ACAD_2602, ACAD_1863, ACAD_2000, ACAD_1974 | yes |
| Layers | Layers, New layer, Locked, Unlocked; Invalid characters in layer name | Calques, Nouveau calque, Verrouillé, Déverrouillé; Caractères incorrects dans le nom de calque | P acadres 9221; N AcLayer | yes |
|  | The layer dialogs (Not Deleted, Current Layer Off, Name Already Exists, Rename) | Calque - Non supprimé, Calque - Calque courant désactivé… | ours, in Autodesk's style: AcTaskDialogs is BAML, not read | no |
| Dimension styles | Draw dim line between ext lines, Offset from dim line, Use overall scale of | Tracer ligne de cote entre lignes d'attache, Décalage de la ligne de cote, Utiliser l'échelle générale de | D AcDimRes 305:2687… | yes |
| Application | Send Feedback; Drawing Units | Envoyer vos commentaires; Unités de dessin | X XLS_7254; N AcScaleList | yes |
| Descriptions | The tools' descriptions | «Rétablit la dernière action annulée»… | ours, in the style of acadres 16161 «Annule la dernière action» | — |

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

### How `commands` was written (9/11/2026)

`cad/locales/fr.json`, every key, in this order of authority:

- **The console.** The 439 probes `console-pair.mjs --lang fr --select` picked, run in fr-FR by
  `probe.sh --lang fr --lang-only` (420 transcripts: 19 probes are English-only), paired with their
  en-US transcripts: 503 keys match the tables' proposal, 328 differ (the console wins), 140 are
  worded more than one way, 57 unpaired, 284 unseen. **What `console-pair.mjs` prints is the
  console's line, values filled in and a plural as `{#}`**: a message with arguments was rebuilt
  as ICU by hand from it, English's arguments kept, the tables' proposal where it had them.
- **Names.** `(getcname "_LINE")` for every command of the catalog (123 of 148); the FRA help's
  titles for those the console does not load (`TEXTMULT`, `PURGER`, `PROPRIETES`, `UNITES`, `VUE`,
  `CORRESPROP`, `DEPUIS`, `PALETTEBLOCS`, `FERMERCALQUE`, `FERMERPROPRIETES`, `RESEAURECT`,
  `RESEAUPOLAIRE`, `TRAJECTOIRERESEAU`, `COUPUREAUPOINT`, `EATTEDIT`). RECTANG is `RECTANGLE` in
  2027, `RECTANG` an alias: `acad.pgp`'s «Commands changed in 2025 release», and `(getcname
  "_RECTANG")` answers `RECTANGLE` once loaded (as `DECOMPOSER`, `POLYLIGNE`). Our own commands take
  the base name and the initials of the ribbon's words, as Spanish and pt-BR: `CERCLED`,
  `CERCLE2P`, `CERCLE3P`, `ARCDCF` (Départ, centre, fin), `ARCCDF`, `ELLIPSEC`, `ELLIPSEARC`.
  Aliases from `acad.pgp`; one that is another command's name is dropped (the name wins).
- **Probes of our own** (`scripts/research/probes/names/`, `.fr.txt`): -ACCROBJ's words and listing
  (p07, p09, p10: `EXT` and `EXTR` are Endpoint, `EXTE` Extension, `PRO` Nearest, `PROJ`
  Apparent, `AUC` None, `M` and `C` alone refused with `Point incorrect.`), DEPUIS (p03: `Point de
  base:`, `<Décalage>:`), a typed snap's echo (p31: `de` after EXT, `à` after PER and TAN), and
  -DIMSTYLE's status and -STYLE's listing (p06, p32). MASSPROP's report from solid/m09 and
  solid-inquiry/p112; the hatch patterns' descriptions from the pack's `acadiso.pat`.
- **The tables**, `propose-commands.mjs`, where no probe shows a key.

### Per command, still one wording

What English words alike and French words per command keeps one command's wording until it has a
prompt id of its own (`cad-catalogs.md`), as pt-BR's second session gave its own:
`secondExtensionOrigin` (COTLIN «Indiquez le second point d'origine…», COTALI «… un second
point…»), `ucsZAxisOrigin` and `ucsMoveOrigin` («le nouveau point d'origine» / «une nouvelle
origine»), `specifyFirstEndpointOfEdge` and `specifySecondEndpointOfEdge` (POLYGONE «… du côté»,
PYRAMIDE «… de l'arête»); the labels SPLINE's `end Tangency` (`fin Tangente` at 55306, `Tangence
fin` at 57995), SPLINEDIT's `System default` (`Par défaut` / `Par Défaut`), PEDIT's `Ltype gen`
(`TYpeligne gén` / `Typeligne gén`) and ARRAYPOLAR's `Angle between` (`ANgle entre` / `Angle
intermédiaire`). **An answer against the colon**: French AutoCAD ends the arrays' counts and
spacings (`Entrez le nombre de colonnes ou [Expression] <4>:`), DIMANGULAR's first prompt and the
array type without the space English has, so the history writes the answer against the colon
there; here it keeps English's space until `answerForms` gets their ids.

### Deviations

- **EDITSPLINE's Weight is `EPaisseur`**, as the prompt lists it and table 22405 declares it: the
  console's `initget` declares `Elever` and `Epaisseur`, one abbreviation for two keywords, which
  `locales.test.ts` refuses (pt-BR's SNAP `ASpecto` was the same case).
- **-ACCROBJ's Endpoint is `EXTrémité` and Extension `EXTEnsion`**: the console reads `EXT` and
  `EXTR` as Endpoint and `EXTE` as Extension, its `initget` declaring `Extrémité` (E) before
  `EXTension`; the three capitals keep each word's letters apart at a point prompt.

### Unverified

What no probe showed, worded from the tables or in Autodesk's style: the dynamic input's field
labels (`Centre`, `Premier point`…: AutoCAD shows none), the measure readout (`Dist`, `Aire`,
`Périm`), Polar's 3D readout, our own messages (files, clipboard, FROM's, `messages.erased`), the
keys `research/console/fr.md` lists `unseen` or `unpaired` that the tables worded, and the
`several` above.

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

No native reader yet. The command language and most of the interface are Autodesk's, so a
reader's time goes first to what Autodesk did not write, in this order:

1. **The landing's copy** (`messages/fr.json`), written from the search texts, not translated: the
   title and description, «Votre planche à dessin est à une touche», the FAQ.
2. **The 97 command pages' notes and the 12 exercises** (`content/commands/*.fr.md`,
   `content/exercises/*.fr.md`) and the six "Use" pages written by hand
   (`content/docs/*.fr.mdx`), written by four agents from one brief on 9/11/2026, each held by
   `docs:check` to its English's options, questions and elements: their register, and the words
   they coined with no Autodesk source — «info-bulle», «poignée en flèche», «poignée active»,
   «barre supérieure», «zone de saisie dynamique», «menu des vues» (the viewport control),
   «palette Calques», «palette Styles», «table des textes», «Paramètres des propriétés»
   (MATCHPROP's dialog), «Paramètres d'épaisseur de ligne», the palette rows «Echelle du type de
   ligne», «Unité du bloc», «Facteur d'unité», «Lien hypertexte», «Fenêtre de zoom», «Zoom
   d'origine», «masque d'arrière-plan», «cadre de texte», «maintien» (an object's handle); LAYDEL
   is left in English. A decimal in prose takes a comma («0,6 degré»), a typed one its point.
3. **Our own words**, marked — in "Interface terms": the tool names worded from the ribbon, the
   palette's own rows, the descriptions, the layer dialogs, the status bar's resolution words.
4. **What no source settled**: the palette rows whose own word differs from the menus' («Index»
   for Contents), the dynamic input's labels, the `several` of "Command language".

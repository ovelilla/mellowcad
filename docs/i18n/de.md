# German (`de`)

> **Command language:** `localized`, German AutoCAD's. **Status:** `live` since 13/11/2026, at
> `/de`. **Review:** none by a native speaker (the owner knows none); a model's reread of what
> Autodesk did not write ("Review"). The plan and its commits: `docs/plans/de-language.md`.

The words are Autodesk's own German localization of AutoCAD, never a translation of ours, as
Spanish's, pt-BR's, French's and Italian's are. One German for every German reader — Germany,
Austria, Switzerland — as AutoCAD has one (`de-DE`): it writes ß, which Swiss German writes ss.

## Sources

- **Language pack.** Autodesk ships AutoCAD 2027 in German (culture `de-DE`, the only German one
  of the 14 in `CULTURES`): `Autodesk_AutoCAD_2027_German_Language_Pack.exe`, 246,304,008 bytes,
  2/3/2026, at `https://up1.autodesk.com/prd/2027/ACD/D787B58D-D279-3D66-9B58-084475C1AFE7/`
  (ceethreedee.com's "Civil 3D 2027 Download all the extensions", under `/cad-news/`), signed by
  Autodesk, Inc.
- **Installed on the owner's AutoCAD on 13/11/2026**: the pack with `-q`, elevated, then
  `AutoCAD_2027.1_Update.exe` again, so `de-DE/acadres.dll` is 26.0.116 (2027.1), as `es-ES/`,
  `pt-BR/`, `fr-FR/` and `it-IT/`, and `acad.exe` 26.0.118. The tables come from the install
  (`extract-strings.mjs --lang de`: `all_de.tsv`, 11,093 ids, as every language's; `acad_de.pgp`).
- **Help.** `https://help.autodesk.com/cloudhelp/2027/DEU/AutoCAD-Core/files/GUID-<id>.htm`
  answers with the English GUIDs (`GUID-0546E8D5-…` is «ABRUNDKANTE (Befehl)»). Search in English
  (the help MCP), read in `DEU`.
- **Console:** `runacc.sh … de-DE` and `probe.sh --lang de` (the banner's last line, «AutoCAD
  Menü-Dienstprogramme geladen.», is in no table). **Desktop:** `acad.exe /language de-DE`.

## Register

- **Formal, as Autodesk**: «Sie», as its tables (431 strings) and its help address the user, on the
  landing too («Geben Sie L ein. Drücken Sie die Eingabetaste.»). The key is «Eingabetaste» in
  prose, `EINGABETASTE` where AutoCAD's prompt says so.
- **Editor:** Autodesk's register, its labels as German AutoCAD words them.
- **Typography:** „…“ (U+201E, U+201C), ‚…‘ inside them, no space before `: ; ! ?`; a hyphen
  where a name joins a noun (`AutoCAD-Befehle`, `DXF-Datei`). What is copied from AutoCAD keeps
  its own marks (its tables quote with `"`).

## Search texts

Google's suggestions (`hl=de`; `gl=de`, `at`, `ch`), Google Trends (Germany, Austria,
Switzerland, 12 months) and Bing's keyword research (three months), 13/11/2026. The data is in
`~/seo-data/raw-2026-11-13/de-keywords/`, outside the repository.

- **The generic term is CAD, with «Programm» or «Software».** Trends (Germany): «cad software» 66,
  «cad programm» 37, «cad kostenlos» 28, «kostenloses cad programm» 1; in another comparison
  «autocad» 74, «cad online» 7 (the same as «online cad»), «cad kostenlos» 4, «grundriss zeichnen»
  4. Bing (Germany): «cad programm kostenlos» 1K, «autocad kostenlos» 291, «cad kostenlos» 166;
  «cad online kostenlos» below its threshold. Suggested: «cad online kostenlos ohne anmeldung»,
  «cad programm kostenlos deutsch», «cad programm kostenlos browser», «2d zeichenprogramm
  kostenlos», «online zeichenprogramm mit bemaßung», «technisches zeichnen online kostenlos»,
  «cad (programm) ohne installation». Austria and Switzerland show only «cad online» above 0.
- **The home:** the main query is «kostenloses CAD-Programm», with «CAD online», «im Browser»,
  «ohne Installation», «ohne Anmeldung», «technisches Zeichnen» and «AutoCAD-Befehle auf Deutsch
  und Englisch». «AutoCAD kostenlos» is never written as a claim, as it would read as AutoCAD
  itself.
- **The command list:** «autocad befehle» (2 in Trends) is suggested as «… liste», «… liste pdf»,
  «… deutsch englisch (pdf)», «… liste deutsch»: the bilingual list is the search.
- **A command:** «autocad versetzen (englisch)», «autocad stutzen (befehl, englisch)»: the German
  name and the English one, both in the title.
- **Practice:** «autocad übungen» (0 in Trends), suggested with «für anfänger (pdf)», «pdf», «2d»,
  «übungsaufgaben».
- **DXF:** «dxf viewer» 17 against «dxf öffnen» 8 and «dxf datei öffnen» 2 in Trends; Bing «dxf
  datei öffnen» 322 in Germany. Suggested: «dxf datei öffnen online kostenlos», «dxf viewer
  online kostenlos», «… mit messfunktion», «dxf datei bearbeiten (kostenlos, online)», «dxf datei
  erstellen».
- **The guides:** «grundriss zeichnen online (kostenlos, ohne anmeldung)»; «autocad
  polarkoordinaten (eingeben)».
- **The SERP** for «cad online kostenlos» (Bing's top 10): liberodraft, owlcad, opensketch,
  cadcraft, opencadstudio; for «cad programm kostenlos», FreeCAD, chip.de and the lists.

## Command language

### `acad.pgp`

`research/strings/acad_de.pgp` (605 lines). German AutoCAD keeps the fewest of the English hand's
letters of any language here, and gives many of them to another command:

| Alias | English    | German                                                      |
| ----- | ---------- | ----------------------------------------------------------- |
| `E`   | ERASE      | EIGENSCHAFTEN (PROPERTIES); LÖSCHEN is `LÖ`, `DELETE` stays |
| `S`   | STRETCH    | SCHIEBEN (MOVE); STRECKEN is `STR`                          |
| `F`   | FILLET     | FANG (SNAP); ABRUNDEN is `AR`                               |
| `AR`  | ARRAY      | ABRUNDEN (FILLET); REIHE is `RH`                            |
| `B`   | BLOCK      | BOGEN (ARC); BLOCK is `BL`                                  |
| `O`   | OFFSET     | OPTIONEN (OPTIONS); VERSETZ is `VS`                         |
| `RE`  | REGEN      | RECHTECK (RECTANG); REGEN is `RG`                           |
| `DI`  | DIST       | DIFFERENZ (SUBTRACT); ABSTAND is `AB`                       |
| `EX`  | EXTEND     | EXTRUSION (EXTRUDE); DEHNEN is `DE`                         |
| `PU`  | PURGE      | PUNKT (POINT); BEREINIG is `BE`                             |
| `PR`  | PROPERTIES | PRÜFSTANDARDS (CHECKSTANDARDS); EIGENSCHAFTEN is `EI`       |
| `AP`  | APPLOAD    | APUNKT (VPOINT); APPLOAD is `AO`                            |

And none at all for `A`, `C`, `M`, `CO`, `TR`, `CHA`, `RO`, `SC`, `MI`, `J`, `X`, `H`, `Z`,
`REC`, `POL`, `I`, `D`, `LW`, `EXT`, `SL`, `G`, `DO`, `PA`, `MO`, `LEN`, `LI`, `ST`, `UN`, `DIV`,
`PO`, `LE`, `AA`, `XL`. German's own: `L` LINIE, `K` KREIS, `KO` and `CP` KOPIEREN, `SU`
STUTZEN, `FA` FASE, `DH` DREHEN, `V` VARIA, `SP` SPIEGELN, `BR` BRUCH, `VB` VERBINDEN, `UR`
URSPRUNG, `SCH` and `GS` SCHRAFF, `ZO` ZOOM, `PG` POLYGON, `EIN` EINFÜGE, `LS` and `LIS` LISTE,
`LT` LINIENTYP, `LST` LSTÄRKE, `KA` KAPPEN (SLICE), `QU` QUERSCHNITT, `GP` GRUPPE, `RI` RING,
`LÄ` LÄNGE, `ET` EINHEIT, `STI` STIL, `TL` TEILEN, `ME` MESSEN, `KL` KLINIE, `VEE` VEREINIG, `SM`
SCHNITTMENGE, `EG` EIGANPASS (MATCHPROP; `MA` is MVIEW's MANSFEN); `T` and `MT` are MTEXT and `DT` TEXT, as English. Names
and aliases hold Ä, Ö and Ü (LÖSCHEN, ÄNDERN, LÄNGE, EINFÜGE), keys of their own on QWERTZ; none
holds ß.

### The keywords' format

- **«oder»** before the list, which can come before the verb: `Nächsten Punkt angeben oder
  [Zurück]:` (20619), `Erste Ecke oder [Kreisförmig/Polygonal] angeben: ` (435). `orWords`
  deduces it from the tables.
- **`initget`** like the other languages': the capital inside a word marks the letter
  (`Kreisbogen Schließen Halbbreite sehnenLänge LInie Zurück Breite _Arc Close …`, 21298), so a
  label can start in lower case (`sehnenLänge`, PLINE's Length) and take two capitals (`ZUrück`,
  9964). Keywords hold ß (`Schließen`), and JavaScript's `"ß".toUpperCase()` is `SS`.
- **No space before a prompt's colon**, as English: `Befehl:` (22843), `Versatzabstand angeben
  oder [Mehrere]:` (67).
- **Two wordings for one English prompt**, as the others: OFFSET's distance is `Abstand angeben
  oder [Durch punkt]` at 21215, `Versatzentfernung bestimmen oder […]` at 5406.
- `propose-commands.mjs --lang de` (13/11/2026): 1,435 proposed, 221 `several`, 144 `partial`, 40
  `plural`, 8 `select`, 512 `no-source` (Italian's: 1,393, 213, 139, 39, 8, 497).
- **The verb after the list.** German writes some prompts `Höhe oder [2Punkt] angeben <5.0000>:`:
  what follows the list is `commands.promptTails` (TEXT's points, TEXTBEARB's
  `Beschriftungs-Objekt oder [Zurück/Modus] wählen:`, the solids' base and height prompts), and
  where the default comes before it (`[2Punkt/Achsenendpunkt/Oberen radius] <8.0000> angeben:`,
  KEGEL's and ZYLINDER's height with a top radius, 25220) its `promptForms` entry is
  `beforeTail`. With no default, QUADER's height, KUGEL's and TORUS' radius, the tube's and a
  cylinder's base put the verb first (`Höhe angeben oder [2Punkt]:`, 27565 against 27566):
  those prompts have ids of their own (`boxHeightNoDefaultOr` and the like), as PYRAMIDE's
  inscribed radius (`pyramidInscribedRadiusOr`, `Basisradius oder [Umkreis] angeben`). TEXT's
  points take two spaces before `oder` and `angeben` (`Startpunkt des Texts  oder [posItion/Stil]
angeben:`), copied.

## Interface terms

From the installed pack by id against `en-US/` (`propose-interface.mjs --lang de --like it`,
13/11/2026), as Italian's: `P <dll> <id>` a string table, `D <dll> <dialog>:<control>` a dialog's
label, `N <assembly> <key>` a .NET resource, `X <uid>` an element of
`UserDataCache/de-de/Support/acad.CUIX`. The engine's `interface`: 230 settled by one wording or
as Italian's ids, 151 by the row's place (a palette row takes `ax26res`'s word, abbreviated
where it is: `Hilfslinie verläng`, `Textpos vert`, `Bem-Faktor global`; a tool the ribbon's), the
rest ours, below. Changed from the proposal: `Gedreht` for a rotated dimension (the proposal's
`DREHEN` is a keyword), `Zoom`, `Systemvariablen`, `Scheitelpunkte` (ax26res 553).

| Area | English | German | Source | Verified |
| --- | --- | --- | --- | --- |
| Tools | Diameter circle, 2-Point circle, 3-Point circle; Start, Center, End arc; Center ellipse | Kreis Mittelpunkt, Durchmesser; Kreis 2 Punkte; Kreis 3 Punkte; Bogen Startpunkt, Mittelpunkt, Endpunkt; Ellipse Zentrum | ours, written out from the ribbon's abbreviations (`Mittel, Durchm`, `Startp, Mittelp, Endp`) | — |
|  | Array | Reihe | the ribbon, seen on the desktop (Start tab, Ändern) | yes |
|  | Change properties, Pan by points, Multiple redo, Linetype scale, Elevation | Eigenschaften ändern, Pan nach Punkten, Mehrfach wiederherstellen, Linientypfaktor, Erhebung | ours, from the neighbouring tables' words | — |
| Descriptions | The tools' descriptions | «Macht den letzten Vorgang rückgängig»… | ours, in the style of the cuix tooltips | — |
| Palette | Normal X, Major axis vector X, Text alignment X, First X, Definition points (our own rows); Weight | Normale X, Hauptachsenvektor X, Textausrichtung X, Erstes X, Definitionspunkte; Gewicht | ours, worded from the palette's; ax26res 1255 says `Stärke` | — |
| Objects | Plural entity names; the 2D solid | Linie/Linien, Bogen/Bögen…; Körper | the tables' singulars, plurals ours; `Körper` the Properties palette's (names/d06) | the solid |
| ViewCube | The cube's faces, the compass, the UCS menu | OBEN, UNTEN, VORNE, HINTEN, LINKS, RECHTS; N, O, S, W; `WKS`, `Neues BKS`, `Unbenannt` | the desktop (names/d05) | yes |

## The command language, how it was set

- **The console**, the 425 of the 446 probes `console-pair.mjs --lang de --select` picked that
  run in de-DE (the rest are English-only), on 13/11/2026: 512 keys match the tables, 320 differ
  and take the console's wording, 171 are worded more than one way, 76 unpaired, 290 unseen.
  The messages were rebuilt as ICU with English's arguments; three agents (one brief, each output
  checked against the parser and English's arguments) settled the rest.
- **Names** by `getcname` (`U` is `Z`, UNDO `ZURÜCK`, LEADER `FÜHRUNG`, MATCHPROP `EIGANPASS`, and
  the `acad.pgp`'s `MA` is MVIEW's `MANSFEN`), the `acad.pgp`'s targets and the DEU help's titles
  for what the console loads on demand (`RECHTECK`, `REIHERECHTECK`, `REIHEKREIS`, `ANPUNKTBRECH`,
  `BLOCKPALETTE`, `BEREINIG`, `EIGENSCHAFTEN`, `AUSSCHNT`, `EINHEIT`, `PTYP`, `VON`). An alias
  that is another command's name is dropped (`DXFIN` of ÖFFNEN, `DXFOUT` of SICHALS). Our own
  commands take the base name and the ribbon's initials, as Italian's: `KREISD`, `KREIS2P`,
  `KREIS3P`, `BOGENSME`, `BOGENMSE`, `ELLIPSEM`, `ELLIPSEBOGEN`.
- **Probes of our own** (`scripts/research/probes/names/`, `.de.txt`): -OFANG's words (p07, p33:
  `END`, `MIT`, `ZEN`, `QUA`, `SCH`, `BAS`, `LOT`, `TAN`, `NÄC` Nearest, `ANG` Apparent, `HIL`
  Extension, `PAR`, `PUN` Node, `GZE`, `KEI` none; listed as `End,Zen,Schn,Hil`; **`OFF` is
  refused**, `Ungültige Objektfang-Modi.`, so German has no OFF word), single letters refused at a
  point prompt with `Ungültiger Punkt.` (p09), VON (p03: `Basispunkt:`, `<Abstand>:`), a typed
  snap's echo (p31: `von` after END and MIT, `nach` after LOT and TAN; not found: «Kein Endpunkt
  für den spezifizierten Punkt gefunden.», and TAN's «Kein für den spezifizierten Punkt
  gefunden.» without its name, copied).
- **The tables**, `propose-commands.mjs`, where no probe shows a key.

### Per command

What German words per prompt where English words alike got `promptKeywords` slots of its own,
filled in every language with the words it already used: PLINE's and DIST's arc endpoint
(`ZUrück`, `sehnenLänge`), SPLINE's fit polyline and SPLINEDIT's join (`ZUrück`), PEDIT's multiple
and vertex Width (`BReite`, `BREite`), TRIM's and EXTEND's object and edge prompts (`MOdus`),
SOLIDEDIT's faces (`ZUrück`), LEADER's format None (`Keine`, `KEine` at its annotation) and UCS's
orthographic Bottom (`Unten`). Where one id still serves two wordings, one command's stands:

- `valueMustBeNonzero`: `Wert muss ungleich Null sein.` (REIHERECHTECK, -EINFÜGE, PLINIE), where
  QUADER and KEIL print `Wert darf nicht null sein.`.
- `specifyEndpointOfLineOr`: `Endpunkt der Linie angeben oder`, where 3DPOLY with Close on offer
  prints `eingeben`.
- EXTRUSION's path prompt declares its Taper `verJüngung`: it has no prompt id here yet.
- `PLINE.Radius`, `REVOLVE.STart` and LEADER's None are worded two ways at one prompt
  (`RAdius`/`Radius`, `STartwinkel`/`Startwinkel`): the first stands.
- **Copied as German prints them**: `1Region ignoriert.`, `gestutzer Bereich`, and TAN's not
  found without its name.

### The desktop

The drafting toggles are composed by AutoCAD and in no table, so the German desktop settled them
(names/d01, 13/11/2026, `/language de-DE`): `<Fang ein>` (F9), `<Ofang ein>` (F3), `<Ortho ein>`,
`<Polar ein>`, `<Objektfangspur ein>` (F11) and `<Raster ein>`, each with `aus`; Selection
Cycling words its two lines apart, `<Wechselnde Auswahl ein>` and `<Auswahl wechseln aus>`. Held
by `germanPrompts.test.ts`. Polar along Z writes `Polar: 6.6533 < +Z` and `Polar: 6.5589 < -Z`
(LINIE from 0,0,0 in ISO-Ansicht SW, names/d02), `feedback.polarZ`'s form. The ViewCube's faces
OBEN, UNTEN, VORNE, HINTEN, LINKS, RECHTS, the compass N, O, S, W, the UCS menu `WKS`, `Neues
BKS` and `Unbenannt` (names/d05); a SOLID is `Körper` in the Properties palette (names/d06).

### Unverified

No probe shows these; each is worded from its neighbours and stays so until one does:

- **The unused readout** `feedback.measure*`, as in the other languages.
- **Ours in every language**: the file, DXF and clipboard messages, the history's steps for what
  the chrome does, VON's own messages (`fromNeedsPoint`), our own commands' names.
- **Not probed**: `format.polar` (`Abst'<'Winkel`), `splineDegree`, `firstDistance`,
  `secondDistance`, `selectABlock`, `selectBlockReference`, three prompt forms; LIST's lines for
  cones, tori, boxes and 3D lines, the mass properties of a region, the `?` listings' descriptions
  of hatch patterns and dimension variables; which of `noValidFillet` and `noValidCurveFillet`
  each fillet prints.

The list by key is the session's, outside git, and `germanPrompts.test.ts` holds what the console
printed.

## The site's words

`messages/de.json`, the editor's catalog, the eight "Use" pages, the 101 command notes and the 12
exercises (13/11/2026, six agents on one brief, each file then read by `docs:check` against its
English's options, questions and elements): the landing's title is «Kostenloses CAD-Programm
online mit AutoCAD-Befehlen», its description carries «im Browser», «ohne Installation»,
«technisches Zeichnen online» and «AutoCAD-Befehle auf Deutsch und Englisch»; the hero says «CAD
online kostenlos, mit AutoCAD-Befehlen»; a command's page «Befehl STUTZEN (TRIM) in AutoCAD», an
exercise's «AutoCAD-Übung …». A command's prompt is Autodesk's «Eingabeaufforderung», polar
tracking the status bar's «Spurverfolgung» (`Spurverfolgung (F10)`), object snap tracking
«Objektfangspur».

- **Keys** as a German keyboard and Autodesk print them: `Strg`, `Umschalt` in a combination
  (`Strg+Umschalt+C`), Eingabetaste, Leertaste, Entf. The shortcuts page's combinations take the
  language's `Docs.keys.ctrl` (every other language's `Ctrl`).
- **The editor**: 131 labels by id, 66 by the row's place, 85 ours †: the layer dialogs (task
  dialogs, BAML, not read), the snap and polar settings rows, the file types of Save As, the
  palettes' own controls. The ribbon's ARRAY button is «Reihe» (the desktop), the command line's
  placeholder «Befehl eingeben (LINIE, SU, KO…)». Dialog titles from the pack: «Speichern unter»
  (acadres 131), «Optionen für Speichern als» (acadres 2489), «Zeichnungseinheiten» (unitsRes 500),
  «Punktstil» (acddptyperes 101).
- **Ours in the pages**: dialog names no resource was read for (Linientyp-Manager,
  Linienstärkeeinstellungen, Blockdefinition), the exercises' mechanical words (Lagerbock, Lasche,
  Nabe, Passfedernut, Teilkreis, Stufenwelle) and layer names (Kontur, Mittellinien, Bemaßung).

## Script and font

`latin`. German needs ä ö ü ß and their capitals, „ “ ‚ ‘ – …, all in Inter's and Geist Mono's
latin subsets, the share card's included (`assets/fonts/inter-latin-600-normal.woff`,
`geist-mono-latin-400-normal.woff`, read with opentype.js): nothing to add, no budget spent.
Missing there: the capital ẞ (U+1E9E), which German writes SS.

## Plurals

CLDR `de`: `one` and `other`; **0 and 1.5 are `other`**, as English. `Intl.NumberFormat("de")`
writes `1.234`, `12.345` and `1,5`.

## Length

On the same table ids, measured the same way for each (13/11/2026): labels of up to 20 characters
+22% in total (median +17%, 90th percentile +71%), prompts +16%; Italian +25%, +18%, +71%, +28%;
French +30%, +20%, +83%, +28%. **German is longer in words, not in characters**: its compounds do
not wrap. The longest word of a label is 8 letters at the median and 13 at the 90th percentile
(Italian 7 and 11, English 6 and 10), and 9.8% of labels hold a word of 14 letters or more
(Italian 4.0%, French 3.8%, Spanish 3.3%): `Linienstärke`, `Objektfangspur`, `Bemaßungsstil`.

## Input

German QWERTZ (Germany, Austria; Switzerland its own QWERTZ): Z and Y swap places, so Ctrl+Z
arrives as `z` from the key labelled Z; ä ö ü and ß are keys of their own; `@ { [ ] } \ | ~` need
AltGr; `^`, `´` and `` ` `` are dead keys.

Checked in Chrome on a production build before going live (13/11/2026, skill `browser-verify`,
keys sent through CDP as the layout sends them): LINIE and LÖ typed on the drawing reach the
command line (LÖSCHEN runs), Ctrl+Z from the key labelled Z (`KeyY`) undoes, and the dead keys,
the Windows way and as a composition, reach the dynamic input (TEXT kept `âéèßäöüô`). **AltGr was
lost on the drawing**: Windows sends it as Ctrl+Alt, the runtime typed nothing with Ctrl held, and
the adapter read the key as its physical one, so the `@` of `@10,0` (AltGr+Q; AltGr+0 on AZERTY,
AltGr+2 on a Spanish keyboard) never reached the box or the command line. Fixed for every
language: a character typed with Ctrl and Alt is text (`CadRuntime.keyDown`, `shortcutKey`;
`germanPrompts.test.ts`, `CadEngine.test.ts`). Chrome on Linux inserts no text for an emulated
Ctrl+Alt key even in a plain field, so a real Windows keyboard in a field stays unverified.

## Going live

On 13/11/2026, from production builds in a clean worktree (every page `○` or `●` but
`/api/search`; the sitemap 897 URLs, 126 of them German; `/de/draw` the only `draw.html` with the
engine's German, no client chunk with it):

- **The landing's first load**, Brotli q11, in bytes, before German (`a9bfffc0`), German a draft
  (`4be7bdf1`) and live: `/` 253,200 → 253,232 → 253,258, `/es` 254,495 → 254,506 → 254,579,
  `/pt-br` 254,697 → 254,707 → 254,907, `/ar` 278,052 → 278,110 → 278,190, `/fr` 255,406 →
  255,372 → 255,528 (472 under 250 KiB), `/it` 254,566 → 254,615 → 254,558, `/de` 254,957 →
  254,953. A build moves a landing by some 50 bytes on its own; naming German costs each up to
  about 200.
- **Naming German** in every landing's commands sentence (`<de>{german}</de>`: VERSETZ beside
  DESFASE, DESLOCAMENTO and DECALER), its lead and the FAQ's class answer.
- **What did not fit** (the landing at 360 px, the editor at 1280×720 with its palettes): the
  hero's pill wrapped, «Ohne Anmeldung»: «Ohne Konto», as `LocalFirst.freeTitle` says. The
  landing's title passed 60 characters: «Kostenloses CAD-Programm mit AutoCAD-Befehlen» («online»
  is the H1's and the description's). The Layers palette's scroll edge cuts «Sperre» as it cuts
  any column there.

## Review

No native reader: the owner knows none. What Autodesk did not write was read again by a model on
13/11/2026, four agents against the English, Autodesk's tables and the German catalogs, each change
read again before its commit:

- **The site and the editor**, 6 strings: «CAD-Zeichenbereich», the calque «den er nimmt» →
  «erfasst», «Jede Seite lässt sich einzeln drucken».
- **The "Use" pages and exercises**, some 90 edits: «Registerkarte», «QuickInfo»,
  «Layer-Steuerung», headings without a stray pronoun («Extrudieren»), FILLET's option named.
- **The command pages**, 84 files: «Blockreferenz» for «Blockverweis», «Absatztext» for
  «Mehrzeilentext», «Eigenschaftenpalette», the verbs «meldet» and «zeigt» for «sagt» and «nennt»,
  ID's prompt quoted in German (`Punkt angeben:`).
- **Left, for a native reader if one is found**: «Kreuzen» and «Gummiband» in prose, «Anordnung»
  (the array object) beside the ribbon's «Reihe», «Historie» and «Verlauf», «Auswahlkästchen» for
  the pickbox, the ours-marked editor labels, the exercises' mechanical words.

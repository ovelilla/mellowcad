# Polish (`pl`) — plan

The fifth language after the pilot, through skill `add-language`, as Russian did
(`docs/plans/ru-language.md`, `docs/i18n/ru.md`): `pl` from nothing to `live` at `/pl`, with the
whole site — the editor, the "Use" pages written by hand, the command pages' notes, the exercises,
the generated pages — and the command language of AutoCAD 2027 in Polish. The Polish session of
the visibility plan (`docs/next-seo.md`, L8). What does not fit is fixed in the system, never in
the language.

## Progress

Three commits, as Russian's: the research and this plan; the draft, reachable but unannounced
(phases 1 to 5); `live` (phase 6). Each lands on `main` through skill `finish-feature`; the work in
progress is on the branch `worktree-polish`.

| Block | State |
| --- | --- |
| Research and plan | Done 16/11/2026 (`71cf4bfb`): this plan; `runacc.sh` knows the Polish console's banner; the Polish names probes |
| Draft (phases 1–5) | Done 17/11/2026: registered as a draft, the engine's catalog whole, the site, the editor, the pages, the Polish letters' face; its research and words now live in `docs/i18n/pl.md` |
| Live (phase 6) | Next |

## 0. Research (16/11/2026)

### 1. AutoCAD and its language pack

- **`localized`.** Autodesk ships AutoCAD 2027 in Polish (culture `pl-PL`, the only Polish one of
  the 14 in `CULTURES`): `Autodesk_AutoCAD_2027_Polish_Language_Pack.exe`, 245,882,600 bytes, at
  `https://up1.autodesk.com/prd/2027/ACD/5E950B97-09B7-3A4C-A7F9-6F4195CFD21A/`
  (ceethreedee.com's "Civil 3D 2027 Download all the extensions", under `/cad-news/`). Signed by
  Autodesk, Inc. (Authenticode valid, DigiCert).
- **Installed on the owner's AutoCAD on 16/11/2026**, with the owner's leave: the pack with `-q`,
  elevated (exit 0; `pl-PL/acadres.dll` 26.0.60, the release build), then the 2027.1 update again
  (exit 0): `pl-PL/acadres.dll` 26.0.116, as `ru-RU/`; `acad.exe` stays 26.0.118.
  `extract-strings.mjs --lang pl` wrote the tables from the install (`all_pl.tsv`; `acad_pl.pgp`).
- **The console** runs in Polish (`runacc.sh … pl-PL`) once `runacc.sh` knows the banner's last
  line, «Programy usługowe menu programu AutoCAD wczytano.», which the pipe reads in Windows-1250
  («us³ugowe»). Every other line comes out as UTF-8: `Polecenie:`; LINE asks `Określ pierwszy
  punkt:` and `Określ następny punkt lub [Cofaj]:`.
- **Typing Polish into the console**: `ą ć ę ł ń ś ź ż` are not in Windows-1252 (`ó` is), so a probe
  that holds one goes as a UTF-8 script, as a Russian one does (`runacc.sh` decides by itself): no
  `acad.pgp`, and it stops at its first refused answer. A probe that types none goes as input.
- **Help:** `https://help.autodesk.com/cloudhelp/2027/PLK/AutoCAD-Core/files/GUID-….htm` answers
  with the English GUIDs (`GUID-0546E8D5-…` is «ZAOKRĄGLKRAW (polecenie)», OFFSET's
  `GUID-C0E4246D-…` «ODSUŃ (polecenie)», FROM's `GUID-0EB8FEA1-…` «OD (Modyfikator polecenia)»).

### 2. `acad.pgp`

`research/strings/acad_pl.pgp`. Names by `getcname` (names/p01, p36): LINE LINIA (`L`), PLINE
PLINIA (`PL`), CIRCLE OKRĄG (`O`), ARC ŁUK (`U`), ELLIPSE ELIPSA (`E`), RECTANG PROSTOK (`PRO`,
and the alias `PROSTOKĄT`), POLYGON WIELOBOK, SPLINE SPLAJN, HATCH KRESKUJ, MOVE PRZESUŃ (`PRS`),
COPY KOPIUJ (`K`), OFFSET ODSUŃ (`OD`), TRIM UTNIJ (`UT`), EXTEND WYDŁUŻ (`WYD`), FILLET ZAOKRĄGL
(`ZA`), CHAMFER FAZUJ (`FA`), ERASE WYMAŻ (`WY`), MIRROR LUSTRO (`LUS`), ROTATE OBRÓĆ (`OB`),
SCALE SKALA (`S`), ARRAY SZYK (`SZ`), STRETCH ROZCIĄGNIJ (`ROZC`), EXPLODE ROZBIJ (`R`), JOIN
POŁĄCZ, BREAK PRZERWIJ (`PRZ`), BREAKATPOINT PRZERWIJWPUNKCIE, BLOCK BLOK (`B`), INSERT WSTAW
(`W`), TEXT TEKST (`DT`), LAYER WARSTWA, DIST ODLEG, AREA POLE, LIST LISTA, ID ID, ZOOM ZOOM, PAN
NFRAGM, UCS LUW, UNDO COFAJ, REDO ODTWÓRZ, PURGE USUŃ, MATCHPROP UZGWŁAŚCIWOŚCI, SNAP SKOK,
-OSNAP -OBIEKT, LINETYPE RODZLIN, LWEIGHT SZERLIN, LTSCALE RLSKALA.

- **Many letters mean another command than in English**: `E` is ELIPSA (ERASE in English), `M`
  MODEL (MOVE), `O` OKRĄG (OFFSET), `S` SKALA (STRETCH), `R` ROZBIJ (REDRAW), `W` WSTAW (WBLOCK),
  `U` ŁUK, `P` PAPIER, `D` ODWYM, `PO` PKTOBS, `PU` PUNKT, `POL` POLE, `PR` PIERŚCIEŃ (DONUT). As
  in Polish AutoCAD; the engine takes the Polish file's.
- **U is `C`** (`getcname`), which no alias takes; `U` is ŁUK's alias.
- `M` MODEL, `P` PAPIER, `AR` ARKUSZ: no command of ours.
- `getcname` answers nothing for what the console loads on demand (MTEXT, the arrays, UNITS,
  PROPERTIES, VIEW, BLOCKSPALETTE, FROM): the `acad.pgp`'s targets (`WTEKST`, `JEDN`,
  `WŁAŚCIWOŚCI`, `WIDOK`) and the PLK help's titles settle them in phase 4.

### 3. The keywords' format

- **«lub»** before the list, after an imperative, as English: `Określ następny punkt lub [Cofaj]:`
  (20619), `Określ odległość odsunięcia lub [przezPunkt/Wymaż/wArstwa] <przezPunkt>:` (the
  console). One string in the tables has text after `]` (20759, `[?] %s:`, an argument): nothing
  like German's `promptTails`. No space before a prompt's colon: `Polecenie:` (22843).
- **`initget`** as the others': a capital inside a word marks the letter, so a label may start in
  lower case (`łUk`, `przezPunkt`, `wArstwa`, `śreDnica`) or carry two (`CAłkowita`). The letter
  can be one with a diacritic (`ŚGeomet`, `KOńcowy`): the engine compares upper case.
- **Yes or no** is `[Tak/Nie] <T>` (-PURGE's verify, names/p36), `<N>` where the default is no.
- **-OSNAP's words** (names/p07, p40): `KOŃ` Endpoint (listed `Kon`), `SYM` Midpoint, `CEN`
  Center, `ŚGE` Geometric center (`ŚGeo`), `PUN` Node (`Punkt`), `KWA` Quadrant, `PRZ`
  Intersection, `PRZED` Extension, `BAZ` Insertion, `PRO` Perpendicular, `STY` Tangent, `BLI`
  Nearest, `POZ` Apparent intersection, `RÓW` Parallel, `BRAK` None; `NIE` turns them off
  (names/p33; `WYŁ` is refused, p38); listed `Kon,Cen,Prz,Przed`. `KON`, as listed, is refused
  (`Niewłaściwe tryby lokalizacji.`, `Niewłaściwy punkt.` at a point prompt), and so is `NAT`.
  `PRZ` is a prefix of `PRZED` and `PRO` of PROSTOK's alias: a point prompt reads the snap first.
- **FROM is `OD`** at a point prompt (names/p03: `Punkt bazowy:`, `<Odsunięcie>:`), the PLK help's
  title; at `Polecenie:` `OD` is ODSUŃ's alias, as Russian's `ОТ` is ОТРЕЗОК's: the engine already
  reads FROM apart where a point is asked (`EngineText`'s `POINT_MODIFIERS`).
- **A typed snap's echo** (names/p09, p31, p34, p39): `of` is `z` after `KOŃ` and `SYM`, `to` is
  `do` after `PRO` and `STY`. Not found: `Nie znaleziono punktu spełniającego wymogi lokalizacji
  Prostopadły .` (with the space before the full stop), and Tangent's without its name, as
  German's and Russian's; then `Wymagany punkt lub słowo kluczowe.`
- **ZOOM's factor** is `nX lub nXP`, the latin letters (26510): nothing to change.
- `propose-commands.mjs --lang pl` (16/11/2026): 1,529 proposed, 207 `several`, 163 `partial`, 42
  `plural`, 8 `select`, 527 `no-source` (Russian's: 1,466, 217, 150, 41, 8, 519).
  `propose-interface.mjs --lang pl --like ru`: the engine 187 by one resource, 39 as Russian chose,
  165 several, 90 none; the editor 107, 15, 75, 89.

### 4. Fonts

**Latin, but not Inter's latin subset.** `ą ć ę ł ń ś ź ż` (U+0104–017C) are Latin Extended-A,
which Google's Inter and Geist Mono serve in their `latin-ext` subsets, and `next/font` declares
every subset by `unicode-range`: a Polish page would download Inter's `latin-ext` file, 85,272
bytes (every weight; the latin one is 48,432), and Geist Mono's, 14,712 — some 100 KB, where the
latin landings sit 1–5 KB under 250 KiB. **A face of the 18 Polish letters alone**, cut from the
same files (`subset-font`, HarfBuzz; the variable weight axis kept), weighs 5,252 bytes (Inter)
and 3,628 (Geist Mono). Phase 5 puts it **before** Inter and Geist Mono on Polish pages, with its
own `unicode-range`, so a Polish letter finds it first and Google's `latin-ext` is never fetched;
every other character falls through to Inter. `SCRIPT` gains `latin-ext` for it, and the next
language in Latin Extended-A (Czech, Hungarian) adds its letters to the same face. On another
language's landing a Polish word (the commands sentence's ODSUŃ) takes the system's face, as
Cyrillic's does (`marketing.css`). The share card reads WOFF: Fontsource's `latin-ext` subsets of
Inter 600 and Geist Mono 400 join `assets/fonts`. The engine's text metrics already read
U+00A0–024F from Arimo (`scripts/fonts/metrics.ts`).

### 5. Plurals

CLDR `pl`: `one` (1), `few` (2–4, 22–24…), `many` (0, 5–21, 25…) and `other`, which only a
fraction reaches (1.5), as Russian's: `pluralMessage` already takes `other` from 1.5. Every count
that agrees with a noun is a four-form plural. Polish AutoCAD agrees with a count where Russian
avoided it: `Usunięte 1 styl tekstu.`, `Usunięte 2 style wymiarowania.` (names/p36).
`Intl.NumberFormat("pl")` writes `12 345,5`.

### 6. Length

On the same table ids, measured as Russian's (16/11/2026): labels of up to 20 characters +21% in
total (median +14%, 90th percentile +71%), prompts +12% (median +10%); Russian +20%, +14%, +71%,
+7%; German +22%, +17%, +68%, +17%; French +30%, +20%, +80%, +30%. Only 2.7% of labels hold a word
of 14 letters or more (German 12.2%, Russian 4.3%). Close to German and Russian: phase 6's
screenshots look for what they found.

### 7. Input

**Polish (Programmer's)**, the layout nearly every Polish keyboard uses: QWERTY, the Polish letters
on AltGr (`AltGr+A` ą, `AltGr+L` ł, `AltGr+N` ń, `AltGr+Z` ż, `AltGr+X` ź). No composition and no
dead keys. Windows sends AltGr as Ctrl+Alt, which the German session already made reach the
drawing for every language: `ODSUŃ` typed on the drawing needs it. Ctrl shortcuts are read by
their physical key (`shortcutKey`). `@`, `<` and `>` are where English has them. Phase 6 types
`ODSUŃ` and `KOŃ` through CDP as the layout sends them.

### Search texts

Google's suggestions (`hl=pl`, `gl=pl`, 212 seeds, 1,047 suggestions), Google Trends (Poland, 12
months), Bing Webmaster's keyword research (Poland, three months; rate-limited after 10 of 16
words) and Bing's top ten (`cc=pl`), 16/11/2026. The data is in
`~/seo-data/raw-2026-11-16/pl-keywords/`, outside the repository. Trends puts nearly every Polish
long tail at 0: the suggestions and the results pages are the guide.

- **The generic term is «program CAD» and «CAD online»**, with «darmowy»: Trends «program cad» 27,
  «cad online» 20; Bing «autocad online» 354, «cad online» 212; suggestions «darmowy program cad
  (2d, po polsku, online)», «cad online za darmo». **«rysunek techniczny»** is the plain-Polish
  word (21 beside «autocad» 53; «rysowanie online z wymiarami / w skali»).
- **«darmowy»** (90 suggestions) over «za darmo» (47) and «bezpłatny» (10); **«online»** (217)
  over «w przeglądarce» (19); «bez instalacji» and «bez logowania» once each. **«po polsku»** is a
  modifier of its own (42).
- **«autocad» inflects**: «w autocadzie» (62 suggestions against 16 «w autocad»), «z autocada».
  The pages write «w AutoCADzie», the form a search tokenizes as one word; «polecenia AutoCAD» where
  the sentence allows avoids the ending.
- **The command list** is searched bilingual: «komendy autocad polsko angielskie», «autocad
  komendy polskie i angielskie», «polecenia autocad polski angielski», «autocad lista poleceń»;
  Bing's first is «Polecenia AutoCAD po polsku i angielsku» (techtutor.pl).
- **A command**: the Polish name with «po angielsku» and the English one with «po polsku»
  («autocad odsuń po angielsku», «offset autocad po polsku», «polecenie utnij autocad»), and the
  noun where it is what is searched («autocad kreskowanie», «wymiarowanie w autocadzie»).
- **Practice:** «ćwiczenia» (every Bing top-ten title, 13 suggestions) over «zadania» (6).
- **The guides:** «plan mieszkania online» belongs to room planners; the drawing's search is «rzut
  domu w autocadzie», «jak narysować rzut parteru», «rzut mieszkania z wymiarami»; «współrzędne
  biegunowe w autocadzie»; «autocad 3d».
- **DXF:** «otwórz plik dxf online», «podgląd plików dxf online», «edytor dxf online», «edycja
  plików dxf».
- **The SERP** (Bing): sharecad, opencadstudio.com/pl-PL, foremkacad.pl, darmowycad.pl, draftcad.pl
  for «cad online za darmo»; kulmanlab.com/pl, dxfviewer.app and cadcraft for the DXF searches;
  Autodesk's PLK help and techtutor.pl for the commands.

The titles these give (phase 2): the home «Darmowy program CAD online z poleceniami AutoCAD»; the
command list «Polecenia AutoCAD po polsku i angielsku»; a command «Polecenie ODSUŃ (OFFSET) w
AutoCADzie», the noun first where it is searched («Kreskowanie w AutoCADzie: polecenie KRESKUJ
(HATCH)»); an exercise «Ćwiczenie AutoCAD dla początkujących: …»; «Otwórz plik DXF online» and
«Edytor DXF online». Never «AutoCAD za darmo», which looks for AutoCAD itself.

### Register and typography

- **The reader as «ty»**, in the imperative, as Autodesk's Polish help and prompts address the user
  («wprowadź OD», `Określ`, `Wybierz`), and the impersonal where it describes («należy nacisnąć
  klawisz Enter», «można»); never «Pan/Pani».
- **Typography:** quotes „…” (U+201E, U+201D), «…» inside them; a spaced en dash ( – ); no space
  before `: ; ! ?`; the decimal comma in prose, the point in values (`i18n.md`). A command name in
  prose after «polecenie» («polecenie ODSUŃ tworzy…»), as the help writes it.

## The phases

1. **Registration**: `pl` in `routing.ts` (`draft`, `localized`, `latin-ext`, «Polski», `pl_PL`),
   the catalogs `{}`, the editor's entry point and changeset, the docs' quotes („…”);
   the language's page, from this research.
2. **The site and the editor** from the search texts above: `messages/pl.json`, the editor's
   catalog by id from the pack, the "Use" pages, the 101 command notes and the 12 exercises (agents
   on one brief, as Russian's), the generated pages.
3. **The engine's interface** by id from the installed pack (`propose-interface.mjs`).
4. **The command language** from the console: the 457 probes `console-pair.mjs --select` picked, run
   in pl-PL; `console-pair.mjs --lang pl`; the messages rebuilt as ICU in four plural forms; the
   desktop for the drafting toggles, Polar's readout and the ViewCube; `· pl` in every coverage
   heading; `polishPrompts.test.ts`.
5. **Script**: the Polish letters' face (§4), the share card's faces; nothing for direction,
   plurals or input.
6. **Verify, then live**: the gate, the first loads before and after, the screenshots at 360 px and
   1280×720, ODSUŃ typed through AltGr, a model's reread (no native reader is at hand), `live`.

## Unverified

What no probe has shown yet: the drafting toggles' lines and Polar's readout (the desktop, phase
4), and whether `C` undoes on the desktop where `U` is ŁUK's alias (Russian's `О` was tested so).

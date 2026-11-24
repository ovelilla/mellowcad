# Polish (`pl`)

> **Command language:** `localized`, Polish AutoCAD's. **Status:** `live` since 17/11/2026, at
> `/pl`. **Review:** none by a native speaker (the owner knows none); a model's reread of what
> Autodesk did not write ("Review"). The plan and its commits: `docs/plans/pl-language.md`.

The words are Autodesk's own Polish localization of AutoCAD, never a translation of ours, as the
other localized languages' are. One Polish, as AutoCAD has one (`pl-PL`).

## Sources

- **Language pack.** Autodesk ships AutoCAD 2027 in Polish (culture `pl-PL`, the only Polish one
  of the 14 in `CULTURES`): `Autodesk_AutoCAD_2027_Polish_Language_Pack.exe`, 245,882,600 bytes,
  at `https://up1.autodesk.com/prd/2027/ACD/5E950B97-09B7-3A4C-A7F9-6F4195CFD21A/`
  (ceethreedee.com's "Civil 3D 2027 Download all the extensions", under `/cad-news/`), signed by
  Autodesk, Inc.
- **Installed on the owner's AutoCAD on 16/11/2026**, with the owner's leave: the pack with `-q`,
  elevated, then `AutoCAD_2027.1_Update.exe` again, so `pl-PL/acadres.dll` is 26.0.116 (2027.1),
  as every other pack's, and `acad.exe` 26.0.118. The tables come from the install
  (`extract-strings.mjs --lang pl`: `all_pl.tsv`; `acad_pl.pgp`).
- **Help.** `https://help.autodesk.com/cloudhelp/2027/PLK/AutoCAD-Core/files/GUID-<id>.htm`
  answers with the English GUIDs (`GUID-C0E4246D-…` is «ODSUŃ (polecenie)»). Search in English
  (the help MCP), read in `PLK`.
- **Console:** `runacc.sh … pl-PL` and `probe.sh --lang pl`. It reads its input as
  Windows-1252, which lacks `ą ć ę ł ń ś ź ż`: a probe with one goes as a UTF-8 script (`/s`),
  which loads no `acad.pgp` and stops at its first refused answer (`autocad-research`,
  console.md). **Desktop:** `acad.exe /language pl-PL`.

## Register

- **The reader as «ty»**, in the imperative, as Autodesk's Polish help and AutoCAD's prompts
  address the user («wprowadź OD», `Określ`, `Wybierz`), and the impersonal where it describes
  («należy nacisnąć klawisz Enter», «można»); never «Pan/Pani». Keys as Polish AutoCAD prints
  them.
- **Editor:** Autodesk's register, its labels as Polish AutoCAD words them.
- **Typography:** „…” (U+201E, U+201D), «…» inside them; a spaced en dash ( – ); no space before
  `: ; ! ?`; the decimal comma in prose, the point in what is typed. A command name follows
  «polecenie» in prose and never inflects («polecenie ODSUŃ tworzy…»), as the help writes it.
  **AutoCAD inflects** («w AutoCADzie», «AutoCADa»): the form searched as one word («w
  autocadzie»); MellowCAD does not. What is copied from AutoCAD keeps its own marks (its tables
  quote with `"`).

## Search texts

Google's suggestions (`hl=pl`, `gl=pl`, 212 seeds, 1,047 suggestions), Google Trends (Poland, 12
months), Bing Webmaster's keyword research (Poland, three months, rate-limited after 10 of 16
words) and Bing's top ten (`cc=pl`), 16/11/2026. The data is in
`~/seo-data/raw-2026-11-16/pl-keywords/`, outside the repository. Trends puts nearly every Polish
long tail at 0: the suggestions and the results pages are the guide.

- **The generic term is «program CAD» and «CAD online»**, with «darmowy» (Trends «program cad» 27,
  «cad online» 20; Bing «cad online» 212 in three months); **«rysunek techniczny»** is the
  plain-Polish word for the drawing. «darmowy» (90 suggestions) before «za darmo» (47) and
  «bezpłatny» (10); «online» (217) before «w przeglądarce» (19); **«po polsku»** a modifier of its
  own (42).
- **The home:** «Darmowy program CAD online z poleceniami AutoCAD — MellowCAD»; the H1 «Rysunek
  techniczny online za darmo – z poleceniami AutoCAD»; the description with «polecenia po polsku i
  angielsku», «bryły 3D, na razie częściowo», «bez instalacji». «AutoCAD za darmo» (looking for
  AutoCAD itself) is never a claim.
- **The command list** is searched bilingual: «komendy autocad polsko angielskie», «polecenia
  autocad polski angielski», «autocad lista poleceń»: «Polecenia AutoCAD po polsku i angielsku».
- **A command:** the Polish name with «po angielsku», the English with «po polsku» («autocad odsuń
  po angielsku», «offset autocad po polsku»): «Polecenie ODSUŃ (OFFSET) w AutoCADzie», the noun
  first where it is what is searched («autocad kreskowanie», «wymiarowanie w autocadzie»).
- **Practice:** «ćwiczenia» (every Bing top-ten title), never «zadania».
- **DXF:** «otwórz plik dxf online», «podgląd plików dxf online»: «Otwórz plik DXF online»; «edytor
  dxf online», «edycja plików dxf»: «Edytor DXF online».
- **The guides:** «plan mieszkania online» belongs to room planners; the drawing's search is «rzut
  domu w autocadzie», «jak narysować rzut parteru»: «Jak narysować rzut domu w AutoCADzie»;
  «współrzędne biegunowe» and «względne i bezwzględne»; «autocad 3d».
- **The SERP** (Bing): sharecad, opencadstudio.com/pl-PL, foremkacad.pl, darmowycad.pl, draftcad.pl
  for «cad online za darmo»; kulmanlab.com/pl and dxfviewer.app for the DXF searches; Autodesk's
  PLK help and techtutor.pl for the commands.

## Command language

### `acad.pgp`

`research/strings/acad_pl.pgp`. Ours: `L` LINIA, `PL` PLINIA, `O` OKRĄG, `U` ŁUK, `E` ELIPSA,
`PRO` PROSTOK, `WBO` WIELOBOK, `SPL` SPLAJN, `PRS` PRZESUŃ, `K` KOPIUJ, `OD` ODSUŃ, `UT` UTNIJ,
`WYD` WYDŁUŻ, `ZA` ZAOKRĄGL, `FA` FAZUJ, `WY` WYMAŻ, `LUS` LUSTRO, `OB` OBRÓĆ, `S` SKALA, `SZ` SZYK,
`ROZC` ROZCIĄGNIJ, `R` ROZBIJ, `PRZ` PRZERWIJ, `B` BLOK, `W` WSTAW, `DT` TEKST, `WA`
WARSTWA, `ODL` ODLEG, `POL` POLE, `LI` LISTA, `Z` ZOOM, `NF` NFRAGM, `PU` PUNKT, `POD` PODZIEL, `ZMI`
ZMIERZ, `WYC` WYCIĄGNIJ, `SUM` SUMA, `ROZ` RÓŻNICA, `IL` ILOCZYN, `CE` WŁAŚCIWOŚCI, `UZG`
UZGWŁAŚCIWOŚCI, `US` USUŃ (PURGE), `JED` JEDN.

- **Many letters mean another command than in English**: `E` ELIPSA (ERASE), `M` MODEL (MOVE), `O`
  OKRĄG (OFFSET), `S` SKALA (STRETCH), `R` ROZBIJ (REDRAW), `W` WSTAW (WBLOCK), `U` ŁUK (U). As in
  Polish AutoCAD; `M` MODEL, `P` PAPIER and `AR` ARKUSZ are no commands of ours.
- **U is `C`** (`getcname`), which no alias takes; on the desktop `C` after a LINE undid it (`LINIA`,
  names/d01).
- **FROM is `OD`** at a point prompt (names/p03: `Punkt bazowy:`, `<Odsunięcie>:`), the PLK help's
  «OD (Modyfikator polecenia)»; at `Polecenie:` `OD` is ODSUŃ's alias (names/d01), as Russian's
  `ОТ` is ОТРЕЗОК's: the engine reads FROM apart where a point is asked (`POINT_MODIFIERS`).
- **RECTANG is PROSTOK** (`getcname`, names/p36; the PLK help's title), `PROSTOKĄT` its alias.
- Names by `getcname` (names/p01, p36), the `acad.pgp`'s targets and the PLK help's titles for what
  the console loads on demand (WTEKST, SZYKPROST, SZYKBIEGUN, ŚCIEŻKASZYK, JEDN, WŁAŚCIWOŚCI,
  WŁAŚCIWOŚCIZAMKNIJ, WARSTWAZAMKNIJ, RATRRED, PALETABLOKI, WIDOK). Our own commands take the base
  name and the letters of their option, as Russian's: `OKRĄGD`, `OKRĄG2P`, `OKRĄG3P`, `ŁUKPŚK`,
  `ŁUKŚPK`, `ELIPSAŚ`, `ELIPSAŁUK` (†).

### The keywords' format

- **«lub»** before the list, after an imperative, as English: `Określ następny punkt lub [Cofaj]:`
  (20619). No verb after the list; no space before a prompt's colon: `Polecenie:` (22843).
- **`initget`** as the others': a capital inside a word marks the letter (`łUk`, `przezPunkt`,
  `wArstwa`, `śreDnica`, `CAłkowita`), a letter with a diacritic among them (`KOńcowy`, `ŚGeomet`).
- **Yes or no:** `[Tak/Nie] <T>` (-PURGE's verify, names/p36).
- **-OSNAP's words** (names/p07, p40): `KOŃ` (listed `Kon`), `SYM`, `CEN`, `ŚGE` (`ŚGeo`), `PUN`
  (`Punkt`), `KWA`, `PRZ`, `PRZED`, `BAZ`, `PRO`, `STY`, `BLI`, `POZ`, `RÓW`, `BRAK`; `NIE` turns
  them off (names/p33; `WYŁ` is refused, p38); listed `Kon,Cen,Prz,Przed`. `KON`, as the listing
  writes it, is refused (`Niewłaściwe tryby lokalizacji.`), and `NAT` (Immediate) too.
- **A typed snap's echo** (names/p09, p31, p34, p39): `of` is `z`, `to` is `do`. Not found: `Nie
  znaleziono punktu spełniającego wymogi lokalizacji Prostopadły .` (a space before the full
  stop), Tangent's without its name; then `Wymagany punkt lub słowo kluczowe.`
- `propose-commands.mjs --lang pl` (16/11/2026): 1,529 proposed, 207 `several`, 163 `partial`, 42
  `plural`, 8 `select`, 527 `no-source`.

### The desktop

The drafting toggles are composed by AutoCAD and in no table, so the Polish desktop settled them
(names/d01, 16/11/2026, `/language pl-PL`): `<Skok włącz>` (F9), `<Stałe tryby lokalizacji
włącz>` (F3), `<Orto włącz>`, `<Biegunowy włącz>` (F10), `<Śledzenie lokalizacji włącz>` (F11)
and `<Siatka włącz>` (F7), each with `wyłącz`; Selection Cycling `<Wybieranie cykliczne
włączone>` and `wyłączone`; Esc `*Anulowano*`. Polar along Z writes `Biegunowy: 3.5966 < +Z` and
`… < -Z` (LINE from 0,0,0 in SW isometric, names/d02), in the plane `Biegunowy: 2.5010 < 0°`. The
ViewCube's faces are drawn in capitals, GÓRA, DÓŁ, PRZÓD, TYŁ, LEWO, PRAWO (where AcVMToolsRes
632 says «Wstecz»), its compass `Pn`, `W`, `Pd`, `Z`, the UCS menu `GUW`, `Nowy GUW`, `Nienazwany`
(names/d05).

## Interface terms

From the installed pack by id against `en-US/` (`propose-interface.mjs --lang pl --like ru`,
16/11/2026), as Russian's: `P <dll> <id>` a string table, `D` a dialog's label, `N` a .NET
resource, `X` an element of `acad.CUIX`. The engine's `interface`: 219 by one resource or the
row's place (a palette row takes `ax26res`'s word, a solid's `AcOpmExtRes`'s, a tool the ribbon's,
its menu macro's name where the ribbon has none: «Okrąg, Środek, średnica», «Nowy fragment,
Punkt»), the ViewCube's faces from the desktop, 34 ours. The editor: by id from the pack over
77,786 pairs of resources, the rest ours.

| Area | English | Polish | Source | Verified |
| --- | --- | --- | --- | --- |
| Ribbon's Home tab | Home; Draw, Modify, Annotation, Layers, Block, Properties, Utilities, Clipboard; Pin | Narzędzia główne; Rysuj, Zmień, Opis, Warstwy, Blok, Właściwości, Narzędzia, Schowek; Przypnij † | X ID_TabHome, ID_PanelDraw … RBN_00011049 and every button's and list member's uid (`ribbon.mjs --lang pl`, 2026-11-24); Pin † ours: AutoCAD's pin has no name, the word undoes acadres 49183 `Unpin` | no |
| Ribbon's other tabs | Insert, Annotate, 3D Tools, View; Retain Attribute Display, Display All Attributes, Hide All Attributes; More Colors...; Select Color...; 2D Wireframe, Hidden, Conceptual | Wstaw, Opisz, Narzędzia 3D, Widok; Zachowaj widoczność atrybutów, Wyświetl wszystkie atrybuty, Ukryj wszystkie atrybuty; Więcej kolorów...; Wybierz kolor...; Model szkieletowy 2D, Ukryty, Koncepcyjny | X ID_TabInsert, ID_TabAnnotate, ID_TAB_3D_TOOLS, ID_TabView, each panel's and button's uid (acad.CUIX by uid, 2026-11-24); AcWindows.resources.dll's BAML (`AcAttmode1/2/0`, `mMoreColorsLabel`); AcDimRes 318; tables 41794, 41445, 8027 | no |
| Ribbon's minimize button | Show Full Ribbon; Minimize to Tabs, Minimize to Panel Titles, Minimize to Panel Buttons, Cycle through All | Pokaż pełną wstążkę; Minimalizuj do kart, Minimalizuj do tytułów paneli, Minimalizuj do przycisków paneli, Przechodź przez wszystko | X AdWindows.resources.dll's BAML (`ID_MinimizeToTabs`, `ID_MinimizeToPanelTitles`, `ID_MinimizeToPanelButtons`, `ID_CycleThroughAll`, `system:String_83`), 2026-11-24 | no |
| Status bar | Object Snap, Polar Tracking, Object Snap Tracking, Dynamic Input | Lokalizacja, Śledzenie biegunowe, Śledzenie lokalizacji, Wprowadzanie dynamiczne | acadres 20022–20051 | yes |
| Ribbon | Draw, Modify, Annotation, Layers, Properties | Rysuj, Zmień, Opis, Warstwy, Właściwości | the desktop's ribbon | yes |
| Palette | Weight, Elliptical | Waga (ax26res 70), Eliptyczna († where ax26res writes «Epliptyczna») | ax26res | partial |
| Tools | Change properties, Multiple redo, Point of view | ours, from the menus' words † | — | — |
| Objects | Plural entity names, "# objects" | the tables' singulars, the four plural forms ours † | ax26res | partial |
| ViewCube | Faces, compass, UCS menu | GÓRA… PRAWO; Pn, W, Pd, Z; GUW, Nowy GUW, Nienazwany | the desktop (names/d05), AcVMToolsRes 470xx | yes |
| Editor | Snap X, polar snap distance, selection cycling settings, the layer dialogs, command history | Skok X †, Odległość skoku biegunowego †, Ustawienia wybierania cyklicznego †, the Layer dialogs' wording after the linetype ones' †, Historia poleceń † | ours, from the Drafting Settings words | — |

`Layers.unlocked` is «Odblokowana», where Autodesk's «Odblokowane» does not agree with
«Zablokowana», «Włączona», «Wyłączona» beside it.

## The command language, how it was set

- **The console**, the 434 probes `console-pair.mjs --lang pl --select` picked that run in pl-PL,
  on 16/11/2026: 569 keys match the tables, 309 differ and take the console's wording, 176 are
  worded more than one way, 82 unpaired, 298 unseen. Three agents (one brief, each output checked
  against the parser and English's arguments) settled the rest from the transcripts, the tables
  and the PLK help: interface and keywords, prompts and forms, messages.
- **Plurals**: where Polish AutoCAD prints a count with its own two forms, ungrammatical as they
  may be (`Utworzono 2 regionów.`, `4 linie zostały sfazowana(e)`), the catalog copies them;
  where it builds the noun into the sentence (PURGE) and in our own messages, four forms.
- **Aliases the console disproved**: `acad.pgp` defines `WT` and `ODLUW` twice and the console runs
  the later (`WT` is WYRÓWNAJTEKST, `ODLUW` MENLUW), so MTEXT has no alias and UCS none but its
  name; `D` points at `ODWYM`, itself an alias, and is unknown (`Nieznane polecenie "D".`): DIMSTYLE
  is `WST`, `WYMST`, `ODWYM`. An alias that is another command's name is dropped, as in German:
  `WYMPOZIOMY`, `WYMPIONOWY`, `WYMOBRÓCONY` (WYMLINIOWY's), `DXFWE`, `DXFWY` (OTWÓRZ's, NZAPISZ's).
- **PTYPE** stays PTYPE: the PLK help's title; the console knows no dialog command
  (`getcname` nil), and `acad.pgp`'s `ODTPUNKT → TYPPUNKTU` is refused there.

### Per command

Where English shares one prompt id and Polish words it per command or per prompt, one wording
stands until each gets an id of its own:

- `solidHeightTopOr`: PYRAMID `Określ wysokość lub`, CONE `Określ wysokość lub użyj opcji`.
- `specifyDiameter`: `Określ średnicę`; with a default the console prints `Określ promień
  <6.0000>` (25185, solid/x05).
- `revolveAngleOr`: `Podaj kąt obrotu lub`, `Określ kąt obrotu lub` after STart (revolve/r01).
- `enterNextPointOr`: `Wprowadź kolejny punkt lub`; SPLINE's second Fit point `Podaj kolejny punkt
  lub`, its fourth CV point on `Określ kolejny punkt lub` (inquiry/p428, p429).
- `specifyIncludedAngle`: `Określ kąt rozwarcia`, DIST after CEnter `… łuku` (pline/p145).
- **Keywords one prompt letters otherwise**, without a slot yet: a closed spline's SPLINEDIT menu
  (`Dane`, `X`, `Przełącz`, Move `PRzesuń`), SPLINE CV's second point (`Cofaj` declared, `Cofnij`
  listed), CYLINDER's height Center (`śRodek`), RECTANG's Width (`Szerokości` / `Szerokość`),
  FILLETEDGE's Radius at its accept prompt, CHAMFER's Distance (`Odległość` / `Długość`), UCS New's
  View, Origin and Object, -VIEW's orthographic Front, Back and Bottom (`Przednia`, `Tylna`,
  `Dolna`).
- **A solid's fourth point**: table 20610 drops `lub <exit>`, which the engine still shows as
  `<wyjdź>`.

### Unverified

No probe shows these; each is worded from its neighbours and stays so until one does:

- **Ours in every language**: the file, DXF and clipboard messages, FROM's own messages, the
  history's steps for what the chrome does (shortcut menu, ViewCube, IntelliZoom, the layer
  manager), our own commands' names (`OKRĄGD`, `ŁUKPŚK`…), the external references' three lines.
- **Not probed**: `format.polar`, `feedback.measure*`, LIST's lines for a cone, a 3D line, a
  curve-fit vertex and an inserted reference, `objectNotABlock` and the other block refusals,
  the short field labels (`firstPoint`, `startAngle`, `scaleFactor`…), worded from the console's
  neighbouring prompt.

The list by key is the session's, outside git, and `polishPrompts.test.ts` holds what the console
and the desktop printed.

## The site's words

`messages/pl.json`, the editor's catalog, the seven written "Use" pages (shortcuts is generated),
the 101 command notes and the 12 exercises (16/11/2026, seven agents on one brief, each file read
by `docs:check` against its English's options, questions and elements). A command's prompt is the
help's «monit», an option «opcja»; the alias question is «Jak się nazywa polecenie … po
angielsku?», its answer the alias of `acad_pl.pgp` and `_NAME` for any language.

- **Ours in the pages (†)**: dialog names no resource was read for («Menedżer właściwości
  warstw», «Wybierz kolor», «Jednostki rysunku»), the ribbon groups «Organizacja», «Pliki i
  schowek», «Zapytanie i widok», the exercises' mechanical words (uszczelka, kołnierz, wspornik L,
  wałek stopniowany, koło pasowe, łącznik, korpus łożyska, klocek schodkowy, bieg schodów,
  podstopnica) and layer names (Kontur, Linie osiowe, Linie niewidoczne, Wymiary), «Kreślarze»
  and «Majsterkowicze» (Drafters, Makers), «przeciąganie po ścieżce» and «wyciągnięcie po
  przekrojach» (SWEEP, LOFT), «półka» (LEADER's hook).

## Script and font

`latin-ext`. `ą ć ę ł ń ś ź ż` are Latin Extended-A, which Inter and Geist Mono serve from Google
Fonts in a `latin-ext` file of every such letter, declared by `next/font` with its
`unicode-range`: a Polish page fetched Inter's (85,272 bytes) and Geist Mono's (14,712). A face of
the 16 Polish letters alone (`assets/fonts/README.md`), 5,248 and 3,636 bytes, is declared in both
root layouts with `preload: false` and its own `unicode-range`, and goes **before** Inter and
Geist Mono on a Polish page (`lettersFontStack`, `lib/fonts.ts`): a Polish letter finds it first,
Google's `latin-ext` is never fetched, and every other character falls through to Inter. The
share card takes the same letters from Fontsource's static 600 and 400 faces, as families of their
own behind Inter and Geist Mono (`lib/og.tsx`). The engine's text metrics already read U+00A0–024F
from Arimo.

## Plurals

CLDR `pl`: `one` (1), `few` (2–4, 22–24…), `many` (0, 5–21, 25…) and `other`, which only a
fraction reaches (1.5). Every count that agrees with a noun is a four-form plural; Polish AutoCAD
agrees with one (`Usunięte 1 styl tekstu.`, `Usunięte 2 style wymiarowania.`, names/p36).
`Intl.NumberFormat("pl")` writes `12 345,5`.

## Length

On the same table ids (16/11/2026): labels of up to 20 characters +21% in total (median +14%,
90th percentile +71%), prompts +12% (median +10%); Russian +20%, +14%, +71%, +7%; German +22%,
+17%, +68%, +17%. 2.7% of labels hold a word of 14 letters or more (German 12.2%).

## Input

Polish (Programmer's), the layout nearly every Polish keyboard uses: QWERTY, the Polish letters on
AltGr (`AltGr+A` ą, `AltGr+L` ł, `AltGr+N` ń, `AltGr+Z` ż, `AltGr+X` ź), no dead keys and no
composition. Windows sends AltGr as Ctrl+Alt, which reaches the drawing for every language since
the German session: `ODSUŃ` typed on the drawing takes it. Ctrl shortcuts are read by their
physical key (`shortcutKey`); `@`, `<` and `>` are where English has them.

Checked in Chrome before going live (17/11/2026, keys sent through CDP as the layout sends them on
Windows, AltGr as Ctrl+Alt, the letter in `key` and `text`, the physical key in `code`): `odsuń`
typed on the drawing runs ODSUŃ and asks `Określ odległość odsunięcia lub
[przezPunkt/Wymaż/wArstwa] <przezPunkt>:`. Once a point prompt's box has the focus, the letter is
the browser's to insert, which Linux Chrome does not do for an emulated Ctrl+Alt: AltGr in a
field stays to be seen on a real Windows keyboard, as German's.

## Going live

On 17/11/2026, from production builds in a clean worktree (every page `○` or `●` but
`/api/search` and `/mcp`; 126 Polish URLs in the sitemap, 1,149 in all):

- **The landing's first load**, Brotli q11, in bytes, Polish a draft (`04deda37`) and live: `/`
  253,712 → 253,649, `/es` 254,981 → 255,044, `/pt-br` 255,135 → 255,316, `/ar` 278,414 →
  278,668, `/fr` 255,821 → 255,901 (99 under 250 KiB), `/it` 254,957 → 254,940, `/de` 255,228 →
  255,499, `/ru` 288,763 → 288,889; `/pl` 265,037 → 265,093 (258.9 KiB), under the 275 KiB of a
  script's font: its letters' two faces (5,252 and 3,640) and no Latin Extended file of Google's.
  No other landing fetches a Polish face.
- **Naming Polish** in every landing's commands sentence (`<pl>{polish}</pl>`: ODSUŃ beside
  DESFASE and ПОДОБИЕ), in Geist Mono's place the system's monospace on another language's page
  (`marketing.css`), as its Ń would fetch Geist Mono's Latin Extended file.
- **What did not fit** (the landing at 360 px, the editor at 1280×720): nothing wraps or
  overflows; the H1's en dash now keeps to the word before it (a no-break space), as Polish
  typography wants no line to open with one.

## Review

No native reader: the owner knows none. What Autodesk did not write was read again by a model on
17/11/2026, four agents against the English, Autodesk's tables and the Polish catalogs:

- **The site and the editor**, 34 edits: what the English says and the first wording dropped
  («Bez instalacji i konta», the hero's «Bez instalacji»), calques («jest o jedno naciśnięcie
  klawisza stąd» → «Od deski kreślarskiej dzieli cię jedno naciśnięcie klawisza»), «AutoCADa 2027»,
  «z Reactem»; in the editor only our own labels.
- **The "Use" pages and exercises**, some 65 edits: agreement («z wymiarem umieszczonym poniżej»),
  meaning restored («W poleceniu DIMDIAMETER wskazujesz okrąg»), AutoCAD's words («Wybieranie
  cykliczne», «okręgi izo»), the exercises' names one way in every link (wspornik L, korpus
  łożyska), UNION «zsumuj», never «połącz» (JOIN's POŁĄCZ).
- **The command pages**, some 475 edits: «monit» for a prompt, a name always after «polecenie»
  («Jak cofnąć polecenie SUMA?»), «wymiar wyrównany» (the engine's and Autodesk's, where «wymiar
  dopasowany» was invented), «kąt rozwarcia», «oznaczenie» for an attribute's tag, «obwód
  wieloboczny» as AREA prints it, F3's echo as the desktop's, `D` and `DDUNITS` gone (aliases of
  aliases the console refuses), «zlokalizuj względem obiektu» for a snap.
- **Left, for a native reader if one is found**: AcDimRes 305's «między liniami wymiarowymi» where
  «pomocniczymi» is meant, and the cuix's «Nadpisania obiektu» (Autodesk's, kept); the layer
  columns «Widoczność» and «Zamknięcie» (ours); «Sty, sty, sty», «kwadrat wyboru», «sylwetka»,
  «Do góry nogami»; the drawings' «4 otw. <>» and «<> max» for THRU and TYP; the mechanical words
  of the exercises (stopa, tuleja, oczko); the alias answers' added «… w polskiej wersji nie
  działa», true for each one checked against `acad_pl.pgp`.

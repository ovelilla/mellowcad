# Hungarian (`hu`)

> **Command language:** `localized`, Hungarian AutoCAD's. **Status:** `live` since 19/11/2026, at
> `/hu`. **Review:** none by a native speaker (the owner knows none); a model's reread of what
> Autodesk did not write ("Review"). The plan and its commits: `docs/plans/hu-language.md`.

The words are Autodesk's own Hungarian localization of AutoCAD, never a translation of ours, as the
other localized languages' are. One Hungarian, as AutoCAD has one (`hu-HU`).

## Sources

- **Language pack.** Autodesk ships AutoCAD 2027 in Hungarian (culture `hu-HU`, the only Hungarian
  one of the 14 in `CULTURES`): `Autodesk_AutoCAD_2027_Hungarian_Language_Pack.exe`, 246,433,512
  bytes, at `https://up1.autodesk.com/prd/2027/ACD/562F3F68-31A2-35DD-8D43-2055578B5350/`
  (ceethreedee.com's "Civil 3D 2027 Download all the extensions", under `/cad-news/`), signed by
  Autodesk, Inc.
- **Installed on the owner's AutoCAD on 19/11/2026**, with the owner's leave: the pack with `-q`,
  elevated, then `AutoCAD_2027.1_Update.exe` again, so `hu-HU/acadres.dll` is 26.0.116 (2027.1),
  as every other pack's, and `acad.exe` 26.0.118. The tables come from the install
  (`extract-strings.mjs --lang hu`: `all_hu.tsv`; `acad_hu.pgp`).
- **Help.** `https://help.autodesk.com/cloudhelp/2027/HUN/AutoCAD-Core/files/GUID-<id>.htm`
  answers with the English GUIDs (`GUID-C0E4246D-…` is «PÁRH (parancs)»). Search in English (the
  help MCP), read in `HUN`.
- **Console:** `runacc.sh … hu-HU` and `probe.sh --lang hu`. It reads its input as
  Windows-1252, which lacks `ő ű` (it has `á é í ó ö ú ü`): a probe with one goes as a UTF-8
  script (`/s`), which loads no `acad.pgp` and stops at its first refused answer
  (`autocad-research`, console.md). **Desktop:** `acad.exe /language hu-HU`.

## Register

- **The reader is addressed formally**, in the polite imperative, as Autodesk's Hungarian help and
  AutoCAD's prompts do («Adja meg», «Válassza ki», «Jelölje ki»), «Ön» only where a pronoun is
  unavoidable, the impersonal where it describes; never tegezés. Keys as Hungarian AutoCAD prints
  them («nyomja meg az Enter billentyűt»).
- **Editor:** Autodesk's register, its labels as Hungarian AutoCAD words them.
- **Typography:** „…” (U+201E, U+201D), »…« inside them; a spaced en dash ( – ); no space before
  `: ; ! ?`; the decimal comma in prose, the point in what is typed. A command name comes before
  «parancs», which takes the suffix («a PÁRH paranccsal»), as the help's titles «PÁRH (parancs)»;
  the name never inflects. **AutoCAD and MellowCAD take a suffix after a hyphen, with front
  vowels** («AutoCAD-ben», «MellowCAD-hez»), as Autodesk's help and native sites write it. A noun
  after a numeral is singular («3 objektum»). What is copied from AutoCAD keeps its own marks (its
  tables quote with `"`).

## Search texts

Google's suggestions (`hl=hu`, `gl=hu`, 667 seeds, 2,412 suggestions), Google Trends (Hungary, 12
months), Bing Webmaster's keyword research (Hungary, Hungarian; three months, 13 keywords before
its rate limit) and Bing's top ten (`cc=hu`, 16 queries), 18/11/2026. The data is in
`~/seo-data/raw-2026-11-18/hu-keywords/`, outside the repository. Trends and Bing Webmaster put
nearly every Hungarian long tail at 0: the suggestions and the results pages are the guide.

- **The generic term is «ingyenes CAD program»** and «online CAD program»; **«műszaki rajz»** is
  the plain-Hungarian word for drafting. «ingyenes» (108 suggestions) before «ingyen» (38),
  «díjmentes» never; «online» (322), «böngésző» never about CAD; «telepítés nélkül» in the
  description.
- **The home:** «Ingyenes online CAD program AutoCAD parancsokkal — MellowCAD»; the H1 «Műszaki
  rajz készítése online, ingyen – AutoCAD parancsokkal»; the description with «parancsok magyarul
  és angolul», «3D szilárdtestek, egyelőre részben», «telepítés nélkül». «AutoCAD ingyenes»
  (looking for AutoCAD itself) is never a claim.
- **AutoCAD is typed bare** («autocad X», 1,210 suggestions; a suffix 3, a hyphen 0): titles put
  «AutoCAD» first where they can, and write «AutoCAD-ben» where a suffix is needed.
- **The command list** is searched both ways: «autocad parancsok magyarul», «… angolul»: «AutoCAD
  parancsok listája magyarul és angolul».
- **A command:** the Hungarian name with «parancs» («autocad párhuzamos parancs» ranks the help's
  «PÁRH (parancs)»), the English with «magyarul» («autocad scale magyarul»), the Hungarian with
  «angolul»: «AutoCAD PÁRH (OFFSET) parancs», the noun first where it is what is searched
  («Sraffozás az AutoCAD-ben: SRAFFOZ (HATCH) parancs», «Méretezés…», «Fóliák…»).
- **Practice:** «AutoCAD gyakorló feladat» («feladat» 21 suggestions, «gyakorlat» 6).
- **DXF:** «DXF fájl megnyitása online»; «Ingyenes online DXF szerkesztő».
- **The guides:** «Ház alaprajz készítése AutoCAD-ben» («alaprajz készít» 44, «alaprajz rajzol»
  17); «Koordináta-megadás az AutoCAD-ben» («koordinátamegadás», the HUN help's term); «3D
  modellezés AutoCAD-ben» («2d-ből 3d» is converting images).
- **The SERP** (Bing): guru99.com/hu, opencadstudio.com/hu-HU, smartcadsoft.com/hu, kulmanlab.com
  for the generic searches; **Autodesk's HUN help in 8 of the 16 top tens**, cadjogsi.hu, terc.hu
  and YouTube for the commands; inf.u-szeged.hu, acadgyakorlo.hupont.hu, epab.bme.hu for practice;
  GroupDocs, dxfviewer.app and Aspose for DXF.

## Command language

### `acad.pgp`

`research/strings/acad_hu.pgp`. Names by `getcname` (names/p01, p44), the HUN help's titles for
what the console loads on demand (MTEXT BSZÖVEG, PURGE TISZTÍT, UNITS MÉRTEGYS, the arrays
KIOSZTNÉGYSZ, KIOSZTPOLÁRIS, KIOSZTÚTVONAL, VIEW NÉZET, PTYPE PTÍPUS, EATTEDIT BATTEDIT,
BLOCKSPALETTE BLOKKPALETTA, LAYERCLOSE FÓLIABEZÁR, BREAKATPOINT MEGTÖRÉSPONTBAN), aliases from the
file: VONAL (`VO`), VLÁNC (`VL`), KÖR (`K`), ÍV (`I`), PÁRH (`P`), METSZ (`ME`), ELÉR (`EL`),
MOZGAT (`MO`), MÁSOL (`M`), RADÍR (`R`), FORGAT (`FOR`), LÉPTÉK (`LE`), TÜKRÖZ (`TU`), NYÚJT
(`NY`), LEKEREKÍT (`LK`), LETÖR (`LT`), SZÉTVET (`SZV`), SRAFFOZ (`SF`, `SR`), FÓLIA (`FO`), TOL
(none that works), BSZÖVEG (`BS`, `SZ`), TÉGL (`TE`, `TÉGLALAP`).

- **Many letters mean another command than in English**: `P` PÁRH (PAN), `T` undoes (MTEXT), `R`
  RADÍR (REDRAW), `M` MÁSOL (MOVE), `L` LÁTVÁNYSTÍLUSOK (LINE), `C` CSOPORT (CIRCLE), `I` ÍV
  (INSERT), `ME` METSZ (MEASURE), `EL` ELÉR (ELLIPSE), `LT` LETÖR (LINETYPE), `MT` MTÉR (MSPACE,
  where English's is MTEXT). LINE has no one-letter alias: `VO`. As in Hungarian AutoCAD.
- **U is `T`** (`getcname`), and the name beats `acad.pgp`'s `T` (TOL): `T` after a LINE undoes it,
  in the console and on the desktop (names/d01). TOL keeps no alias in the engine, as none reaches
  it in Hungarian AutoCAD.
- **FROM is `PONTTÓL`** at a point prompt (names/p03: `<Eltolás>:`), the HUN help's «PONTTÓL
  (parancsmódosító)»; at `Parancs:` it is nothing (names/p42).
- **RECTANG is `TÉGL`** (`getcname`); `TÉGLALAP` (`acad.pgp`'s `TE`) is the local name of
  `_RECTANGLE`, English's 2025 alias (names/p43): the engine's alias of TÉGL.

### The keywords' format

- **«vagy»** before the list, after the polite imperative, as English: `Adja meg a következő
  pontot vagy [Vissza]:`. No verb after the list; no space before a prompt's colon: `Parancs:`.
- **`initget`** as the others': a capital inside a word marks the letters, often two (`leTör`,
  `SZInt`, `leKerekít`, `széLesség`, `SZög`, `SUgár`).
- **Yes or no:** `[Igen/Nem] <I>` (-PURGE's verify, names/p36).
- **-OSNAP's words** (names/p07, p38; each OSMODE bit's listed word, then typed back): `VÉG`,
  `FEL`, `KÖZ`, `GKÖ` (listed `Gköz`), `PON` (`Pont`), `KÖR` (`Körn`), `MET`, `ILL`, `MER`, `ÉRI`,
  `SZO` (`Szom`), `LÁT` (`Látszmet`), `MEG` (`Megh`), `PÁR` (`Párh`); `SEM` or `SEMMI` none, `KI`
  off; listed `Vég,Köz,Met,Megh`. `KÖR` is CIRCLE's name and `PÁR` a prefix of PÁRH: a point
  prompt reads the snap first.
- **A typed snap's echo** (names/p09, p31, p34, p35, p39): `of` is `rajzelemnek...`, `to` is
  `rajzelemhez`; Intersection asks ` és `. Not found: `Nincs Végpont a kijelölt pont esetén.`,
  Tangent's without its name; then `Adjon meg egy pontot vagy kulcsszó opciót.`, or `Érvénytelen
  pont.` at a first point.
- `propose-commands.mjs --lang hu` (19/11/2026): 1,476 proposed, 270 `several`, 165 `partial`, 42
  `plural`, 8 `select`, 536 `no-source`.

### The desktop

The drafting toggles are composed by AutoCAD and in no table, so the Hungarian desktop settled
them (names/d01, 19/11/2026, `/language hu-HU`): `<Raszter Be>` (F9), `<Traszter Be>` (F3),
`<Orto Be>`, `<Poláris Be>` (F10), `<Tárgyraszterkövetés Be>` (F11) and `<Háló Be>` (F7), each
with `Ki`; Selection Cycling `<Ciklikus kiválasztás bekapcsolva>` and `<Ciklikus kiválasztás
ki>`; Esc `*Megszakítva*`; an unknown command `A(z) "X" ismeretlen parancs. Információért nyomja
meg az F1 billentyűt.` Polar along Z writes `Poláris: 6.3230 < +Z` and `… < -Z` (LINE from 0,0,0
in SW isometric, names/d02), in the plane `Poláris: 5.5735 < 0°`. The ViewCube's faces are drawn in
capitals, FELÜL, ELÖL, HÁTUL, BAL, JOBB (ALUL, AcVMToolsRes 630, is the face no view showed), its
compass `É`, `K`, `D`, `NY`, the UCS menu `VKR`, `Névtelen` (names/d05). The ribbon's Home tab is
«Kezdőlap», its panels Rajz, Módosítás, Feliratozás, Fóliák, Blokk, Tulajdonságok, Csoportok,
Segédprogramok, Vágólap, Nézet (names/d00); the status bar's `MODELL`.

## Interface terms

From the installed pack by id against `en-US/` (`propose-interface.mjs --lang hu --like cs`,
19/11/2026): `P <dll> <id>` a string table, `D` a dialog's label, `N` a .NET resource, `X` an
element of `acad.CUIX`. The engine's `interface`: 146 by one resource, 31 as Czech chose, 206 by
the row's place, 58 from other resources (`ax26res`'s `;`-separated lists, `acad.CUIX`'s help
strings), 19 entity names, 9 menu macro names, 10 from the desktop, 22 ours. The editor: 74 by one
resource, 20 as Czech, 87 by the row's place, 13 other resources, 16 from the desktop, 75 ours (16
more are key names and file types).

| Area | English | Hungarian | Source | Verified |
| --- | --- | --- | --- | --- |
| Ribbon's Home tab | Home; Draw, Modify, Annotation, Layers, Block, Properties, Utilities, Clipboard; Pin | Kezdőlap; Rajz, Módosítás, Feliratozás, Fóliák, Blokk, Tulajdonságok, Segédprogramok, Vágólap; Kitűzés † | X ID_TabHome, ID_PanelDraw … RBN_00011049 and every button's and list member's uid (`ribbon.mjs --lang hu`, 2026-11-24); Pin † ours: AutoCAD's pin has no name, the word undoes acadres 49183 `Unpin` | no |
| Ribbon's other tabs | Insert, Annotate, 3D Tools, View; Retain Attribute Display, Display All Attributes, Hide All Attributes; More Colors...; Select Color...; 2D Wireframe, Hidden, Conceptual | Beszúrás, Feliratozás, 3D eszközök, Nézet; Attribútummegjelenítés megtartása, Minden attribútum megjelenítése, Minden attribútum elrejtése; Több szín...; Szín kiválasztása...; 2D drótváz, Takartvonalas, Koncepcionális | X ID_TabInsert, ID_TabAnnotate, ID_TAB_3D_TOOLS, ID_TabView, each panel's and button's uid (acad.CUIX by uid, 2026-11-24); AcWindows.resources.dll's BAML (`AcAttmode1/2/0`, `mMoreColorsLabel`); AcDimRes 318; tables 41794, 41445, 8027 | no |
| Ribbon's minimize button | Show Full Ribbon; Minimize to Tabs, Minimize to Panel Titles, Minimize to Panel Buttons, Cycle through All | A teljes szalag megjelenítése; Összecsukás füllé, Összecsukás panelcímmé, Kicsinyítés a panel gombjaira, Végiglépés az összesen | X AdWindows.resources.dll's BAML (`ID_MinimizeToTabs`, `ID_MinimizeToPanelTitles`, `ID_MinimizeToPanelButtons`, `ID_CycleThroughAll`, `system:String_83`), 2026-11-24 | no |
| Quick Access Toolbar's lists | Undo 1 command, Undo 3 commands; Redo 1 command, Redo 3 commands; Group of commands; - Mark - | 1 parancs visszavonása; 3 parancs visszavonása; 1 parancs ismétlése; 3 parancs ismétlése; Parancsok csoportja; - Jel - | P acadres 4853–4856 (two forms, 1 and the rest, as AutoCAD's), 4860, 4861; desktop 2026-11-25 (es) | yes |
| Application menu | Drawing Utilities; Units; Drawing; Other Formats; Open Documents; each page's heading and descriptions | Rajzolási segéd-\neszközök; Mértékegységek; Rajz; Egyéb formátumok; Megnyitott dokumentumok; … | X AcWindows.resources.dll's BAML (`AcNew` to `AcDrawingUtilities_Units`: name and description; New ▸ Drawing's without the template and Save As' two without DWG, DWT and DWS: this program chooses none and writes neither), AdWindows.resources.dll's `system:String_95` | yes |
| Title bar's title | A new drawing's name (Drawing1.dwg) | Rajz1.dwg | P acadres 4125 (`Drawing.dwg`, numbered as the session numbers new drawings; desktop 2026-11-25, es) | yes |
| Title bar's Help ▾ | Help; Send Feedback | Súgó; Visszajelzés küldése | X ACAD_379 (`ID_Help`, the Help menu's first item), XLS_7254 (`ID_SendFeedback`) | yes |
| Status bar | Object Snap, Polar Tracking, Object Snap Tracking, Grid, Snap Mode | Tárgyraszter, Poláris követés, Tárgyraszterkövetés, Háló, Raszter mód | acadres 20020–20029 | yes |
| Ribbon | Draw, Modify, Annotation, Block, Utilities, Clipboard | Rajz, Módosítás, Feliratozás, Blokk, Segédprogramok, Vágólap | the desktop (names/d00) | yes |
| Tools | Line, Polyline, Move, Rotate, Trim, Copy, Mirror, Fillet, Stretch, Scale, Measure | Vonal, Vonallánc, Mozgatás, Elforgatás, Metszés, Másolás, Tükrözés, Lekerekítés, Nyújtás, Léptékezés, Mérés | the ribbon (names/d00) | yes |
| Tools | Offset, Pan, Hatch, Section | Eltolás (the ribbon's, where the command is PÁRH), Eltolás (the navigation bar's), Sraffozás, Keresztmetszet | RibbonRoot, the navigation bar, ACAD_306 | partial |
| Palette | Weight (a spline's), Hidden (an edge), Solid (2D) | Vastagság (Autodesk's), Láthatatlan, Szilárdtest | ax26res 70, 49, 311 | partial |
| Snaps | Quadrant, Nearest, Node | Síknegyed, Legközelebbi, Pont (the AutoSnap tips; -OSNAP lists Körn, Szom) | dwgaidsRes 135, acadres 70–79 | partial |
| ViewCube | Faces, compass, UCS menu | FELÜL … JOBB; É, K, D, NY; VKR, Új FKR, Névtelen | the desktop (names/d05), AcVMToolsRes 47042 | yes |
| Shortcut menu | Repeat, Cancel, Deselect All | Ismétlés: {command}, Megszakítás, Kijelölés megszüntetése | acad.CUIX PopMenuRoot, ACAD_1923, ACAD_1931 | partial |
| Layers | Lock, Locked, Unlocked | Zárolás, Zárolt, Felszabadított | AcLayer `Lock`, ax26res 921, 1002 | partial |
| Editor | Snap X, the command line's placeholder, the Blocks palette, the layer dialogs | Raszter X †, Írjon be egy parancsot (VONAL, ME, M…) †, … | ours, from the neighbouring words | — |

## The command language, how it was set

- **The console**, the 454 probes `console-pair.mjs --lang hu --select` picked, run in hu-HU on
  19/11/2026 (431 paired): 522 keys match the tables, 354 differ and take the console's wording,
  178 are worded more than one way, 87 unpaired, 309 unseen. 217 keys came from the console at
  once; four agents (one brief, each output checked against the parser and English's arguments)
  settled the rest from the transcripts, the tables and the HUN help: messages (two), prompts and
  forms, keywords and names; a fifth the interface and the editor.
- **Plurals**: Hungarian AutoCAD prints a count with a singular noun (`1 szövegstílus törölve`);
  every message English counts keeps its ICU plural, `one` and `other` alike.
- **Where the tracer lists the words**: in a hu-HU trace `"g"` holds the declared Hungarian word
  and `"l"` the global id, the other way round from the en-US one.
- **Selecting objects** declares `Kivesz` (Remove), not the table's `Eltávolít`.
- **LINE's Close is `Bezár`** in the console (`[Bezár/Vissza]`), where table 20287 writes
  `Bezárás`.
- **Our own commands** take the base name and the letters of their option words, two where
  Hungarian's share a first letter (`Kezdőpont`, `Középpont`): `KÖRÁ`, `KÖR2P`, `KÖR3P`,
  `ÍVKEKÖVÉ`, `ÍVKÖKEVÉ`, `ELLIPSZK`, `ELLIPSZÍV` (†).
- **Names the help settles where `getcname` answers nothing**: the list under `acad.pgp` above;
  -VPOINT has no `NP` (`acad_hu.pgp` defines it twice, VPOINT's line last).
- Copied as AutoCAD prints them, faults included: LIST's `Szélesség` for a line's Thickness and
  `Négyzet, üres` for a box, FILLET's `# vonal lett lekerekíteni`, `Error Code Number is` left in
  English, the arc prompt of DIST and AREA declaring `Ív` but listing `SZög` (`SZög` stands),
  SPLINEDIT's weight prompt declaring `KIlépés` beside a hidden `KI`.

### Per command

Where English shares one id and Hungarian words it per command or per state, one wording stands
until each gets an id of its own:

- `specifyNextPointOr`: LINE's `következő pontot vagy` (AREA: `következő sarokpontot, vagy`).
- `dimensionLineLocationOr`: DIMLINEAR's `helyét vagy` (DIMRADIUS, DIMDIAMETER: `helyét, vagy`).
- `specifyOppositeCorner`: the selection's `ellenkező` (ZOOM: `ellentétes`).
- `specifyDiameter`: CYLINDER's spaced default (CONE and SPHERE write it tight, `átmérőt<6.0000>:`);
  `layersToTurnOn` ends `:` without its space: neither has a `promptForms` or `answerForms` slot
  in English yet.
- `valueMustBeNonzero`: ARRAYRECT's and -INSERT's `Az érték legyen nem nulla.` (BOX and WEDGE:
  `Az érték nem lehet nulla.`); `invalidNewBlockName` -BLOCK's `blokk név`, `invalidBlockName`
  -INSERT's `blokknév`.
- `listArea`: the polyline's indent (the circle's differs); `listExtrusion`: «Kihúzás iránya»
  (LWPOLYLINE: «Kihúzási irány»).
- **Keywords one prompt letters otherwise**, without a slot yet: ELLIPSE's Angle (`Szög` at the
  last prompts, `SZög` at the first); SPLINE's Close (`beZárás` with fit points, `Bezárás` with
  control vertices) and Method; PLINE's and DIST's Radius (`SUgár`, `Sugár` beside `Középpont`);
  PEDIT's Fit (`Görbe`, `Illeszt` in Multiple) and Edit vertex (`SZerkeszt`, forced: the 2D menu
  declares `Szerkeszt` beside `Spline`); SOLIDEDIT's eXit (`kiLépés`, beside `Kihúz`), Copy and
  Color; CHAMFEREDGE's Distance; -VIEW's orthographic Bottom and Front (`ALul`, `eLöl`, as the
  main prompt).

### Unverified

No probe shows these; each is worded from its neighbours and stays so until one does:

- **Ours in every language**: the file, DXF and clipboard messages, FROM's own messages, the
  history's steps for what the chrome does, our own commands' names, the external references'
  lines, `matchpropSettings`, `cornersSkipped`, `everythingDeselected`.
- **Not probed**: `format.polar`, `feedback.measure*`, the short field labels (`firstPoint`,
  `startAngle`, `scaleFactor`… from the console's neighbouring prompt), the arrays' grip labels,
  LIST's lines for a cone, a gradient hatch, an external reference and some justification points,
  attribute flags and array directions, ATTEDIT's and EATTEDIT's prompts, PURGE's linetype lines,
  EXTEND's Quick and Standard, HATCH's Solid, `cannotFindBlock`, `explodeLostWidth` (table 49,
  where EXPLODE may use 20842–20846).

The list by key is the session's, outside git, and `hungarianPrompts.test.ts` holds what the
console and the desktop printed.

## The site's words

`messages/hu.json`, the editor's catalog, the seven written "Use" pages (shortcuts is generated),
the 101 command notes and the 12 exercises (19/11/2026, six agents on one brief, each file read
by `docs:check` against its English's options, questions and elements). A command's prompt is
«prompt» (the HUN help's «promptok»), an option «opció», an alias «parancsálnév» (`acad.pgp`'s
word); the alias question is «Mi az AutoCAD PÁRH parancs angolul?» or «… magyarul?», its answer
the alias of `acad_hu.pgp` and `_NAME` for any language.

- **Ours in the pages (†)**: the exercises' parts (csapágybak, karima, tömítés, lépcsős hasáb, L
  alakú konzol, összekötő kar, szerelőlap, telek, szíjtárcsa, kerek asztal, lépcsős tengely,
  lépcső) and layer names (Körvonal, Középvonalak, Takart vonalak, Méretek; Falak, Ajtók,
  Ablakok), dialog names no resource was read for («Sraffozásszerkesztő», «Stílusok paletta»),
  the ribbon groups («Rendszerezés», «Lekérdezés és nézet»), «fogó» for grips, «elemleírás» for a
  tooltip (Windows' Hungarian word), the unit types (Építészeti, Mérnöki, Tört, Tudományos).

## Script and font

`latin-ext`. `á é í ó ö ú ü` are Latin-1, in Inter's latin subset; `ő ű Ő Ű` are Latin
Extended-A, which `next/font` would fetch from Inter's and Geist Mono's Latin Extended files (85
and 14.7 KB). The letters' face Polish and Czech use gains the four (`assets/fonts/README.md`):
Inter 7,680 → 8,180 bytes, Geist Mono 5,136 → 5,480, the card's 4,248 → 4,508 and 3,204 → 3,380;
the Polish-and-Czech cut reproduces the committed files byte for byte. It goes before Inter and
Geist Mono on a Hungarian page as on a Polish or Czech one (`lettersFontStack`); «Magyar» has no
letter outside latin, so no other landing changes its fonts.

## Plurals

CLDR `hu`: `one` (1) and `other`. A noun after a numeral is singular («3 objektum», `1
szövegstílus törölve`, names/p36), so most counts read alike in both forms; every message the
English counts keeps its ICU plural. `Intl.NumberFormat("hu")` writes `12 345,5`.

## Length

On the same table ids (19/11/2026): labels of up to 20 characters +22% in total (median +15%, 90th
percentile +67%), **prompts +24%** (median +23%), the longest prompts of any localized language
(German +16%, Polish +12%, Czech +6%); 4.8% of labels hold a word of 14 letters or more (German
8.9%, Polish 2.4%).

## Input

Hungarian QWERTZ: Z and Y swap places; the digits on the number row without Shift, `0` left of
`1`, `ö ü ó` after `9`; `ő ú é á ű` keys of their own; `@` AltGr+V. Ctrl shortcuts are read by
their physical key (`shortcutKey`).

Checked in Chrome before going live (19/11/2026, keys sent through CDP as the layout sends them on
Windows, the letter in `key` and `text`, the physical key in `code`): `párh` typed on the drawing
(á from `Quote`) runs PÁRH and asks `Adja meg a párhuzamos távolságot vagy [Kijelölt/Töröl/Fólia]
<Kijelölt>:`; `vo` then `10,0`, its `0` from the key under Esc (`Backquote`), answers VONAL's first
point; `ELŐRE`, its ő from `BracketLeft`, runs REDO. AltGr in a field (`@` is AltGr+V) stays to be
seen on a real Windows keyboard, as Czech's and Polish's.

## Going live

On 19/11/2026, from production builds of this worktree (every page `○` or `●` but `/api/search`
and `/mcp`):

- **The landing's first load**, Brotli q11 of every response until the network is idle, in bytes,
  Hungarian a draft (`209f1f08`) and live: `/` 253,842 → 253,802, `/es` 255,023 → 255,026,
  `/pt-br` 255,506 → 255,379, `/ar` 278,776 → 278,707, `/fr` 256,028 → 255,879 (121 under 250
  KiB), `/it` 255,243 → 255,145, `/de` 255,602 → 255,491, `/ru` 289,084 → 288,971, `/pl` 270,020
  → 269,877, `/cs` 269,750 → 269,680; `/hu` 270,398 → 270,357, under the 275 KiB of a script's
  font: the letters' two faces (8,184 and 5,484), never Google's Latin Extended files.
- **`/fr` was 28 bytes over 250 KiB already with Hungarian a draft**, by this measure, and 262
  over once live: each live language adds some 230 bytes to every landing (three lists of
  language links, an hreflang link, an `og:locale:alternate` in the HTML and in the payload, and
  the commands sentence). Two cuts for every page: **`og:locale:alternate` is gone** (it names the
  locales this URL serves, and Facebook scrapes it again with `?fb_locale=`; here each language
  has a URL of its own, which hreflang gives: some 250 bytes), and **an SVG keeps left to right
  on a right-to-left page by one rule of `marketing.css`** instead of `direction="ltr"` written on
  each of the landing's hundred drawings twice (some 100; on `/ar` every SVG and its text still
  computes `ltr`). The next change to the French landing has to be measured.
- **Naming Hungarian** in every landing's commands sentence (`<hu>{hungarian}</hu>`: PÁRH beside
  EKVID and ODSUŃ), in Geist Mono, as PÁRH has no letter outside Latin-1; every translation of it
  marked reviewed.
- **What did not fit** (the landing at 360 px, the editor at 1280×720): the header's «Kezdjen
  rajzolni» broke over two lines, now «Rajzolás», as German's «Zeichnen» and Czech's «Kreslit»;
  nothing else wraps or overflows (the page is 360 wide; only the hero's transcript runs past its
  own clipped box, as in every language).

## Review

No native reader: the owner knows none. What Autodesk did not write was read again by a model on
19/11/2026, four agents against the English, Autodesk's tables and the Hungarian catalogs:

- **The site and the editor**, some 40 edits: «rövidítés» for an alias everywhere (the column
  header, the counts), Conceptual as the catalog's `Látványtervi`, calques undone («Shift+jobb
  kattintással a következő pontmegadásra egy módot kényszeríthet ki»), compounds («DWG- vagy
  DXF-fájlokat», «AutoCAD-felhasználó», «Szögpontosság»); in the editor only our own labels.
- **The "Use" pages and exercises**, some 90 edits: «prompt» where «kérdés» crept in,
  «Fóliatulajdonság-kezelő», «méretsegédvonal», «tükrözési vonal», a sense inverted in 2d-to-3d
  («kivonja belőlük» for "cut by them"), the stairs' «lépcsőfok», the frames' «káva».
- **The command pages**, some 320 edits: every alias answer checked against `acad_hu.pgp` (PAN has
  no working alias: its `T` is U's name, which undoes; `TR` runs TRASZTER; TEXT's `DS`), the
  engine's lines quoted as it prints them (`<Raszter Be>`, `<Traszter Be>`, `Előzmények = Egyik
  sem`), «Látványtervi», «Fólia szerint», «zárolt fólián», «transzparens parancs», the reflex
  angle «konkáv szög» where «kiegészítő szög» said supplementary, the polite imperative where an
  impersonal «ki kell választani» crept in, a and az before what each component renders.
- **Left, for a native reader if one is found**: «Ház alaprajz készítése» (the search's words;
  «alaprajzának» would be the grammar's), «eszköztipp» for a tooltip, «kijelölődoboz», «talpvonal»
  for LEADER's hook, «aktív fogó», the pulley's «tárcsa» beside «szíjtárcsa», «homloklap», «F és
  Ctrl billentyűk» against «F- és Ctrl-billentyűk» (the title's 60 characters), «az MIL» or «a
  MIL» before an alias, «Dinamikus adatbevitel» (the table's) against «dinamikus bevitel», and
  the dialog names no resource was read for («Tulajdonságmásolás beállításai», «Stílusok
  paletta», «Szilárdtestszerkesztés»).

# Hungarian (`hu`) — plan

The seventh language after the pilot, through skill `add-language`, as Czech did
(`docs/plans/cs-language.md`, `docs/i18n/cs.md`): `hu` from nothing to `live` at `/hu`, with the
whole site — the editor, the "Use" pages written by hand, the command pages' notes, the exercises,
the generated pages — and the command language of AutoCAD 2027 in Hungarian. The Hungarian
session of the visibility plan (`docs/next-seo.md`, L8). What does not fit is fixed in the system,
never in the language.

## Progress

Three commits, as Czech's: the research and this plan; the draft, reachable but unannounced
(phases 1 to 5); `live` (phase 6). Each lands on `main` through skill `finish-feature`; the work in
progress is on the branch `worktree-hu-language`.

| Block | State |
| --- | --- |
| Research and plan | Done 19/11/2026: this plan; `runacc.sh` knows the Hungarian console's banner; the Hungarian names probes |
| Draft (phases 1–5) | Next |
| Live (phase 6) | — |

## 0. Research (18–19/11/2026)

### 1. AutoCAD and its language pack

- **`localized`.** Autodesk ships AutoCAD 2027 in Hungarian (culture `hu-HU`, the only Hungarian
  one of the 14 in `CULTURES`): `Autodesk_AutoCAD_2027_Hungarian_Language_Pack.exe`, 246,433,512
  bytes, at `https://up1.autodesk.com/prd/2027/ACD/562F3F68-31A2-35DD-8D43-2055578B5350/`
  (ceethreedee.com's "Civil 3D 2027 Download all the extensions", under `/cad-news/`, beside
  Czech's). Signed by Autodesk, Inc. (Authenticode valid, DigiCert).
- **Installed on the owner's AutoCAD on 19/11/2026**, with the owner's leave: the pack with `-q`,
  elevated (exit 0; `hu-HU/acadres.dll` 26.0.60, the release build), then the 2027.1 update again
  (exit 0): `hu-HU/acadres.dll` 26.0.116, as `cs-CZ/`; `acad.exe` stays 26.0.118.
  `extract-strings.mjs --lang hu` wrote the tables from the install (`all_hu.tsv`; `acad_hu.pgp`).
- **The console** runs in Hungarian (`runacc.sh … hu-HU`) once `runacc.sh` knows the banner's
  last line, «AutoCAD menü segédeszközök betöltve.», plain UTF-8 (Czech's and Polish's mix in
  Windows-1250). `Parancs:`; LINE asks `Adja meg az első pontot:` and `Adja meg a következő pontot
  vagy [Vissza]:`.
- **Typing Hungarian into the console**: `ő ű Ő Ű` are not in Windows-1252, so a probe that holds
  one goes as a UTF-8 script (`runacc.sh` decides by itself): no `acad.pgp`, and it stops at its
  first refused answer. `á é í ó ö ú ü` are in 1252 and go as input: `RADÍR` typed ran ERASE
  (names/p41), `TÉGL` RECTANG, `PONTTÓL` FROM.
- **Help:** `https://help.autodesk.com/cloudhelp/2027/HUN/AutoCAD-Core/files/GUID-….htm` answers
  with the English GUIDs (OFFSET's `GUID-C0E4246D-…` is «PÁRH (parancs)», RECTANG's
  `GUID-188B2DDA-…` «TÉGL (parancs)», FROM's `GUID-0EB8FEA1-…` «PONTTÓL (parancsmódosító)»).

### 2. `acad.pgp`

`research/strings/acad_hu.pgp`. Names by `getcname` (names/p01, p44): LINE VONAL (`VO`), PLINE
VLÁNC (`VL`), 3DPOLY 3DVLÁNC, CIRCLE KÖR (`K`), ARC ÍV (`I`), ELLIPSE ELLIPSZ, POLYGON POLIGON,
SPLINE SPLINE, PEDIT VLEDIT, HATCH SRAFFOZ (`SF`, `SR`), MOVE MOZGAT (`MO`), COPY MÁSOL (`M`),
OFFSET PÁRH (`P`), TRIM METSZ (`ME`), EXTEND ELÉR (`EL`), FILLET LEKEREKÍT (`LK`), CHAMFER LETÖR
(`LT`), ERASE RADÍR (`R`), MIRROR TÜKRÖZ, ROTATE FORGAT, SCALE LÉPTÉK (`LE`), ARRAY KIOSZT,
STRETCH NYÚJT (`NY`), EXPLODE SZÉTVET, JOIN EGYBEFŰZ, BREAK MEGTÖR, BLOCK BLOKK, INSERT BEILL, TEXT
SZÖVEG, LAYER FÓLIA (`FO`), DIST TÁVS, AREA TERÜLET, LIST LISTA, ZOOM ZOOM, PAN TOL (`T`), UCS FKR,
UNDO VISSZA, REDO ELŐRE, SNAP RASZTER, -OSNAP -TRASZTER, LINETYPE VTÍPUS, LWEIGHT VVAST, LTSCALE
VTLÉPTÉK, PLAN NNÉZET, STYLE STÍLUS, DIMLINEAR MÉRETHOSSZ, DIMSTYLE MÉRETSTÍLUS, MATCHPROP
TULMÁSOL, POINT PONT, SOLID TÖMÖR, LEADER MUTATÓ, 3DFACE 3DLAP, BOX TTEST, EXTRUDE KIHÚZ.

- **Many letters mean another command than in English**: `P` is PÁRH (PAN in English), `T` TOL
  (MTEXT), `R` RADÍR (REDRAW), `M` MÁSOL (MOVE), `L` LÁTVÁNYSTÍLUSOK (LINE), `C` CSOPORT
  (CIRCLE), `K` KÖR, `I` ÍV (INSERT), `ME` METSZ (MEASURE), `EL` ELÉR (ELLIPSE), `LT` LETÖR
  (LINETYPE). LINE has no one-letter alias: `VO`. As in Hungarian AutoCAD; the engine takes the
  Hungarian file's.
- **U is `T`** (`getcname "_U"`), and the name beats `acad.pgp`'s `T` (TOL): `T` after a LINE
  undoes it and echoes `VONAL`.
- **RECTANG is `TÉGL`** (`getcname "_RECTANG"`), and `TÉGLALAP` (`acad.pgp`'s `TE`) the local
  name of `_RECTANGLE`, English's 2025 alias (names/p43); both run it. The engine names it `TÉGL`
  with `TÉGLALAP` an alias, as Czech's `OBD` and `OBDÉLNÍK`.
- `getcname` answers nothing for what the console loads on demand: the HUN help's titles settle
  them — MTEXT BSZÖVEG (`acad.pgp`'s `BS`, `SZ`; its `MT` is MTÉR, MSPACE), PURGE TISZTÍT,
  PROPERTIES TULAJDONSÁGOK, UNITS MÉRTEGYS, ARRAYRECT KIOSZTNÉGYSZ, ARRAYPOLAR KIOSZTPOLÁRIS,
  ARRAYPATH KIOSZTÚTVONAL, BREAKATPOINT MEGTÖRÉSPONTBAN, BLOCKSPALETTE BLOKKPALETTA, VIEW NÉZET,
  PTYPE PTÍPUS, EATTEDIT BATTEDIT, LAYERCLOSE FÓLIABEZÁR.

### 3. The keywords' format

- **«vagy»** before the list, after the polite imperative, as English: `Adja meg a következő pontot
  vagy [Vissza]:`. No verb after the list; no space before a prompt's colon: `Parancs:`.
- **`initget`** as the others': a capital inside a word marks the letters (`leTör`, `SZInt`,
  `leKerekít`, `széLesség`, `aRány`, `voNal`), and Hungarian's keywords often take two
  (`SZög`, `SUgár`): the engine compares upper case.
- **Yes or no** is `[Igen/Nem] <I>` (-PURGE's verify, names/p36).
- **-OSNAP's words** (names/p07, p38, from OSMODE bit by bit and typed back): `VÉG` Endpoint,
  `FEL` Midpoint, `KÖZ` Center, `GKÖ` Geometric center (listed `Gköz`), `PON` Node (listed
  `Pont`), `KÖR` Quadrant (listed `Körn`), `MET` Intersection, `ILL` Insertion, `MER`
  Perpendicular, `ÉRI` Tangent, `SZO` Nearest (listed `Szom`), `LÁT` Apparent intersection (listed
  `Látszmet`), `MEG` Extension (listed `Megh`), `PÁR` Parallel (listed `Párh`); `SEM` None (and
  `SEMMI`, at a point prompt too); `KI` turns them off. Listed `Vég,Köz,Met,Megh`. `KÖR` is
  CIRCLE's name and `PÁR` a prefix of PÁRH: a point prompt reads the snap first.
- **FROM is `PONTTÓL`** at a point prompt (names/p03: `<Eltolás>:`), the HUN help's title; at
  `Parancs:` it is nothing (names/p42), so nothing clashes.
- **A typed snap's echo** (names/p09, p31, p34, p35, p39): `of` is `rajzelemnek...` after `VÉG`,
  `FEL` and `MET`, `to` is `rajzelemhez` after `MER` and `ÉRI`; Intersection asks ` és ` for its
  second object. Not found: `Nincs Végpont a kijelölt pont esetén.`, `Nincs Merőleges …`,
  Tangent's without its name (`Nincs a kijelölt pont esetén.`); then `Adjon meg egy pontot vagy
  kulcsszó opciót.`, or `Érvénytelen pont.` at a first point.
- **ZOOM's factor** is `nX vagy nXP`, the latin letters (names/p37): nothing to change.
- `propose-commands.mjs --lang hu` (19/11/2026): 1,476 proposed, 270 `several`, 165 `partial`, 42
  `plural`, 8 `select`, 536 `no-source` (Czech's: 1,479, 257, 164, 42, 8, 528).
  `propose-interface.mjs --lang hu --like cs`: the engine 163 by one resource, 39 as Czech chose,
  213 several, 90 none; the editor 77, 23, 97, 89.

### 4. Fonts

**`latin-ext`, as Polish and Czech.** `á é í ó ö ú ü` are Latin-1, in Inter's latin subset; `ő ű`
and their capitals (U+0150, U+0151, U+0170, U+0171) are Latin Extended-A, inside the letters'
face's one range (`U+0104-017E`). The face gains the four (`assets/fonts/README.md`, the same
Fontsource files and `subset-font` 2.9.0; the Polish-and-Czech cut reproduces the committed files
byte for byte): Inter 7,680 → 8,180 bytes, Geist Mono 5,136 → 5,480; the card's static faces 4,248
→ 4,508 and 3,204 → 3,380. Only a Polish, Czech or Hungarian page names the face. **«Magyar»**, the
language's name in every landing's links, has no letter outside latin: no rule of its own.

### 5. Plurals

CLDR `hu`: `one` (1) and `other`. **A noun after a numeral is singular** («3 objektum», «1
szövegstílus törölve», names/p36), so a count's words rarely change; the ICU messages keep both
forms even where they read alike. `Intl.NumberFormat("hu")` writes `12 345,5`.

### 6. Length

On the same table ids, measured as Czech's (19/11/2026; the method gives Czech +14% and Polish
+21% for the labels, where their pages recorded +12% and +21%): labels of up to 20 characters +22%
in total (median +15%, 90th percentile +67%), **prompts +24%** (median +23%), the longest of the
localized languages (German +16%, Polish +12%, Czech +6%); 4.8% of labels hold a word of 14
letters or more (German 8.9%, Polish 2.4%). Phase 6's screenshots look where German's did, and at
the command line's prompts.

### 7. Input

**Hungarian QWERTZ** (the 101/102-key layout): Z and Y swap places (Ctrl+Z from the key labelled
Z, `KeyY`, as German's); the digits are on the number row without Shift, `0` left of `1` (the key
under Esc, `Backquote`) and `ö ü ó` after `9`; `ő ú é á ű` keys of their own; `@` AltGr+V, as
Czech's. Ctrl shortcuts are read by their physical key (`shortcutKey`). Phase 6 types `metsz` and
`párh` on the drawing, `ő` from its own key, a coordinate from the number row and `@` through AltGr,
through CDP as the layout sends them.

### Search texts

Google's suggestions (`hl=hu`, `gl=hu`, 667 seeds, 2,412 suggestions), Google Trends (Hungary, 12
months, 20 groups), Bing Webmaster's keyword research (Hungary, Hungarian; three months, 13
keywords before its rate limit) and Bing's top ten (`cc=hu`, 16 queries), 18/11/2026. The data is
in `~/seo-data/raw-2026-11-18/hu-keywords/`, outside the repository. Trends and Bing Webmaster put
nearly every Hungarian long tail at 0: the suggestions and the results pages are the guide.

- **The generic term is «ingyenes CAD program»**, «online CAD program» beside it (101 suggestions
  hold «cad program»); **«műszaki rajz»** (87) and «műszaki rajzoló program» (56) are the
  plain-Hungarian words for drafting. «ingyenes» (108) before «ingyen» (38), «díjmentes» never;
  «online» (322), «böngésző» never about CAD; «telepítés nélkül» once in a top ten title.
- **«AutoCAD» is typed bare**: «autocad X» 1,210 suggestions, a suffix 3 («autocadhez», «autocadben»),
  a hyphen 0; native titles write «AutoCAD-ben» (Cadjogsi, videotanfolyam.hu), as Autodesk's HUN
  help suffixes «AutoCAD-»; «AutoCAD-ban» only on machine-translated sites. The pages write
  «AutoCAD-ben», front vowels.
- **The command list** is searched both ways: «autocad parancsok magyarul», «… angolul», «… angol
  magyar», «… listája»: «AutoCAD parancsok listája magyarul és angolul».
- **A command**: the Hungarian name with «parancs» («autocad párhuzamos parancs» ranks the help's
  «PÁRH (parancs)»; «autocad eltolás» has no suggestion), the English name with «magyarul»
  («autocad scale magyarul»), the Hungarian with «angolul» («autocad tisztít parancs angolul»);
  the noun where it is what is searched («sraffozás», «méretezés» 12, «fólia» 10 against «réteg»
  1, «blokk» 22, «lépték» 14).
- **Practice:** «autocad gyakorló feladatok» («feladat» 21 suggestions, «gyakorlat» 6).
- **DXF:** «dxf fájl megnyitása online», «dxf megnyitása online»; «ingyenes dxf szerkesztő».
- **The guides:** «autocad alaprajz készítés», «ház alaprajz» («alaprajz készít» 44, «alaprajz
  rajzol» 17); «koordinátamegadás» (the HUN help's term); «autocad 3d modellezés» («2d-ből 3d»
  is converting images).
- **The SERP** (Bing): guru99.com/hu, letoltesgyorsan.hu, opencadstudio.com/hu-HU,
  smartcadsoft.com/hu, kulmanlab.com for the generic searches; **Autodesk's HUN help in 8 of the 16
  top tens** (the command list, OFFSET, hatching, dimensions, layers, coordinates, 3D),
  cadjogsi.hu, terc.hu and YouTube for the commands; inf.u-szeged.hu, acadgyakorlo.hupont.hu and
  epab.bme.hu for practice; GroupDocs, dxfviewer.app, Aspose for DXF.

The titles these give (phase 2): the home «Ingyenes online CAD program AutoCAD parancsokkal»; the
H1 «Műszaki rajz készítése online, ingyen – AutoCAD parancsokkal»; the command list «AutoCAD
parancsok listája magyarul és angolul»; a command «AutoCAD PÁRH (OFFSET) parancs», the noun first
where it is searched («Sraffozás az AutoCAD-ben: SRAFFOZ (HATCH) parancs»); an exercise «AutoCAD
gyakorló feladat: …»; «DXF fájl megnyitása online» and «Ingyenes online DXF szerkesztő»; the
floor plan «Ház alaprajz készítése AutoCAD-ben». Never «AutoCAD ingyenes», which looks for AutoCAD
itself.

### Register and typography

- **The reader is addressed formally**, in the polite imperative, as Autodesk's Hungarian help and
  AutoCAD's prompts address the user (`Adja meg`, `Válassza ki`, `Jelölje ki`), «Ön» only where a
  pronoun cannot be avoided, the impersonal where it describes; never tegezés.
- **Typography:** quotes „…” (U+201E, U+201D), »…« inside them; a spaced en dash ( – ); no space
  before `: ; ! ?`; the decimal comma in prose, the point in values (`i18n.md`). A command name
  before «parancs», which takes the suffix («a PÁRH paranccsal»), as the help's titles «PÁRH
  (parancs)»; the name never inflects. AutoCAD and MellowCAD take a suffix after a hyphen, with
  front vowels («AutoCAD-ben», «MellowCAD-hez»).

## The phases

1. **Registration**: `hu` in `routing.ts` (`draft`, `localized`, `latin-ext`, «Magyar», `hu_HU`),
   the catalogs `{}`, the editor's entry point and changeset, the docs' quotes („…”); the
   language's page, from this research.
2. **The site and the editor** from the search texts above: the site's catalog, the editor's
   catalog by id from the pack, the "Use" pages, the 101 command notes and the 12 exercises (agents
   on one brief, as Czech's), the generated pages.
3. **The engine's interface** by id from the installed pack (`propose-interface.mjs`).
4. **The command language** from the console: the 454 probes `console-pair.mjs --select` picks,
   run in hu-HU; `console-pair.mjs --lang hu`; the messages rebuilt as ICU; the desktop for the
   drafting toggles, Polar's readout and the ViewCube; `· hu` in every coverage heading;
   `hungarianPrompts.test.ts`.
5. **Script**: the letters' face with Hungarian's four (§4), the card's faces; nothing for
   direction, plurals or input.
6. **Verify, then live**: the gate, the first loads before and after (`/fr` is 63 bytes under 250
   KiB, and naming Hungarian adds to every landing), the screenshots at 360 px and 1280×720, the
   Hungarian keyboard through CDP, a model's reread (no native reader is at hand), `live`.

## Unverified

What no probe has shown yet: the drafting toggles' lines and Polar's readout (the desktop, phase
4), and whether `T` undoes on the desktop as in the console.

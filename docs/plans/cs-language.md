# Czech (`cs`) — plan

The sixth language after the pilot, through skill `add-language`, as Polish did
(`docs/plans/pl-language.md`, `docs/i18n/pl.md`): `cs` from nothing to `live` at `/cs`, with the
whole site — the editor, the "Use" pages written by hand, the command pages' notes, the exercises,
the generated pages — and the command language of AutoCAD 2027 in Czech. The Czech session of the
visibility plan (`docs/next-seo.md`, L8). What does not fit is fixed in the system, never in the
language.

## Progress

Three commits, as Polish's: the research and this plan; the draft, reachable but unannounced
(phases 1 to 5); `live` (phase 6). Each lands on `main` through skill `finish-feature`; the work in
progress is on the branch `worktree-cs-language`.

| Block | State |
| --- | --- |
| Research and plan | Done 17/11/2026: this plan; `runacc.sh` knows the Czech console's banner; the Czech names probes |
| Draft (phases 1–5) | Done 17/11/2026: registered as a draft; the engine's catalog whole (433 probes, the desktop, the tables, four agents); the site, the editor, the "Use" pages, the 101 command notes and the 12 exercises (seven agents); the letters' face with Czech's |
| Live (phase 6) | Next |

## 0. Research (17/11/2026)

### 1. AutoCAD and its language pack

- **`localized`.** Autodesk ships AutoCAD 2027 in Czech (culture `cs-CZ`, the only Czech one of
  the 14 in `CULTURES`): `Autodesk_AutoCAD_2027_Czech_Language_Pack.exe`, 245,822,664 bytes, at
  `https://up1.autodesk.com/prd/2027/ACD/F0391787-58AD-39B5-BA0F-66525EAB1FFC/`
  (ceethreedee.com's "Civil 3D 2027 Download all the extensions", under `/cad-news/`, beside
  Polish's). Signed by Autodesk, Inc. (Authenticode valid, DigiCert).
- **Installed on the owner's AutoCAD on 17/11/2026**, with the owner's leave: the pack with `-q`,
  elevated (exit 0; `cs-CZ/acadres.dll` 26.0.60, the release build), then the 2027.1 update again
  (exit 0, at the second UAC): `cs-CZ/acadres.dll` 26.0.116, as `pl-PL/`; `acad.exe` stays 26.0.118.
  `extract-strings.mjs --lang cs` wrote the tables from the install (`all_cs.tsv`; `acad_cs.pgp`).
- **The console** runs in Czech (`runacc.sh … cs-CZ`) once `runacc.sh` knows the banner's last
  line, «Nástroje nabídek aplikace AutoCAD načteny.», which mixes UTF-8 and Windows-1250 as
  Polish's does («naèten»). Every other line is UTF-8: `Příkaz:`; LINE asks `Určete první bod:` and
  `Zadejte další bod nebo [Zpět]:`.
- **Typing Czech into the console**: `č ď ě ň ř ť ů` are not in Windows-1252, so a probe that holds
  one goes as a UTF-8 script (`runacc.sh` decides by itself): no `acad.pgp`, and it stops at its
  first refused answer. `á é í ó ú ý š ž` are in 1252 and go as input: `VYMAŽ` typed ran ERASE
  (names/p41), with the `acad.pgp` loaded.
- **Help:** `https://help.autodesk.com/cloudhelp/2027/CSY/AutoCAD-Core/files/GUID-….htm` answers
  with the English GUIDs (OFFSET's `GUID-C0E4246D-…` is «EKVID (příkaz)», RECTANG's
  `GUID-188B2DDA-…` «OBDÉLNÍK (příkaz)», FROM's `GUID-0EB8FEA1-…` «ODBODU (modifikátor příkazu)»).

### 2. `acad.pgp`

`research/strings/acad_cs.pgp`. Names by `getcname` (names/p01, p36): LINE ÚSEČKA, PLINE KŘIVKA,
3DPOLY 3DKŘIVKA, CIRCLE KRUŽNICE (`KR`), ARC OBLOUK (`O`), ELLIPSE ELIPSA (`EL`), RECTANG OBD,
POLYGON POLYGON (`POL`), SPLINE SPLINE, PEDIT KEDIT, HATCH ŠRAFY (`HS`), MOVE POSUN (`POS`), COPY
KOPIE (`KO`), OFFSET EKVID (`E`), TRIM OŘEŽ (`OR`), EXTEND PRODLUŽ (`PD`), FILLET ZAOBLI, CHAMFER
ZKOS, ERASE VYMAŽ, MIRROR ZRCADLI, ROTATE OTOČ (`OT`), SCALE MĚŘÍTKO (`ME`), ARRAY POLE (`PO`),
STRETCH PROTÁHNI (`PT`), EXPLODE ROZLOŽ, JOIN SPOJ, BREAK PŘERUŠ (`PR`), BREAKATPOINT
PŘERUŠVBODĚ, BLOCK BLOK (`B`), INSERT VLOŽ, TEXT TEXT (`DT`), MTEXT (`MT`, `T`), LAYER HLADINA
(`HL`), DIST VZD, AREA PLOCHA (`PL`), LIST VÝPIS, ZOOM ZOOM, PAN PP (`P`), UCS USS, UNDO ZPĚT,
REDO ZNOVA, PURGE ČISTI (`CI`), MATCHPROP KOPIEVLAST (`KV`), SNAP KROK, -OSNAP -UCHOP, LINETYPE
TYPČ (`TC`), LWEIGHT TLČÁRY (`TLČ`), LTSCALE TČMĚŘ (`TCM`), PLAN PŮDORYS, STYLE PÍSMO (`PSM`).

- **Many letters mean another command than in English**: `E` is EKVID (ERASE in English), `O`
  OBLOUK (OFFSET), `P` PP (PAN, as English), `PL` PLOCHA (PLINE), `PO` POLE (POINT), `POL` POLYGON,
  `R` PŘEKR (REDRAW), `S` SKUPINA (STRETCH), `T` MTEXT, `K` KŘIVKA, `KO` KOPIE, `PR` PŘERUŠ, `OR`
  OŘEŽ. As in Czech AutoCAD; the engine takes the Czech file's.
- **U is `Z`** (`getcname`), which no alias takes; `_U` after a LINE undoes it and echoes `ÚSEČKA`
  (names/p03).
- **RECTANG is `OBD`** (`getcname "_RECTANG"`), and `OBDÉLNÍK` — the CSY help's title — is the
  local name of `_RECTANGLE`, English's 2025 alias of it (`getcname "OBDÉLNÍK"`, names/p43); both
  run it. The engine names it `OBD`, as Polish names it `PROSTOK` beside `PROSTOKĄT`, with
  `OBDÉLNÍK` an alias; the site's pages name both.
- `getcname` answers nothing for what the console loads on demand (MTEXT, the arrays, UNITS,
  PROPERTIES, VIEW, BLOCKSPALETTE, FROM): the `acad.pgp`'s targets (`MTEXT`, `JEDNOTKY`) and the
  CSY help's titles settle them in phase 4.

### 3. The keywords' format

- **«nebo»** before the list, after an imperative, as English: `Zadejte další bod nebo [Zpět]:`
  (20619), `Určete vzdálenost ekvidistanty nebo [Bodem/Vymazat/Hladina] <Bodem>:` (the console).
  No verb after the list; no space before a prompt's colon: `Příkaz:`. `-STYLE` lists `[?]:
  <Standard>:` with two colons, as its table does (names/p32).
- **`initget`** as the others': a capital inside a word marks the letter, so a label may start in
  lower case (`úHel`, `úsEčka`, `zDvih`, `šířKa`, `měříTko`, `oBjekt`). The letter can be one with
  a diacritic (`Střed`, `Zpět`'s Z): the engine compares upper case.
- **Yes or no** is `[Ano/Ne] <A>` (-PURGE's verify, names/p36).
- **-OSNAP's words** (names/p07, p38): `KON` Endpoint, `POL` Midpoint, `STŘ` Center, `GST`
  Geometric center (listed `Gstř`), `BOD` Node, `KVA` Quadrant, `PRŮ` Intersection, `PRO`
  Extension, `REF` Insertion, `KOL` Perpendicular, `TAN` Tangent, `NEJ` Nearest, `ZDÁ` Apparent
  intersection (listed `ZDÁNPRŮ`), `ROV` Parallel, `NIC` None; `NE` turns them off (names/p38;
  `VYP` is refused, p33); listed `KON,STŘ,PRŮ,PRO`. `BEZ` (Immediate) is refused (p40).
  `POL` is POLYGON's alias and `PRO` a prefix of PROTÁHNI and PRODLUŽ: a point prompt reads the
  snap first.
- **FROM is `ODBODU`** at a point prompt (names/p03: `Základní bod:`, `<Odsazení>:`), the CSY help's
  title; at `Příkaz:` it is unknown (names/p42), so nothing clashes, unlike Polish's `OD`.
- **A typed snap's echo** (names/p09, p31, p34, p35, p39): `of` is `z` after `KON`, `POL` and
  `PRŮ`, `to` is `k` after `KOL` and `TAN`; Intersection asks ` a ` for its second object. Not found:
  `Žádný(é) KOlmo nenalezen(o) pro zadaný bod.` (the keyword's capitals, as the string table
  declares it), `Žádný(é) Koncový …`, `Žádný(é) Průsečík …`, Tangent's without its name; then
  `Vyžadován bod nebo klíčové slovo.`, or `Neplatný bod.` at a first point.
- **ZOOM's factor** is `nX nebo nXP`, the latin letters (26510; names/p37): nothing to change.
- `propose-commands.mjs --lang cs` (17/11/2026): 1,479 proposed, 257 `several`, 164 `partial`, 42
  `plural`, 8 `select`, 528 `no-source` (Polish's: 1,529, 207, 163, 42, 8, 527).
  `propose-interface.mjs --lang cs --like pl`: the engine 187 by one resource, 28 as Polish chose,
  178 several, 90 none; the editor 100, 18, 79, 89.

### 4. Fonts

**`latin-ext`, as Polish.** `á é í ó ú ý` are Latin-1, in Inter's latin subset; `č ď ě ň ř š ť ů ž`
and their capitals (U+010C–017E) are Latin Extended-A, which `next/font` would fetch from Inter's
and Geist Mono's `latin-ext` files (85 and 14.7 KB). The Polish letters' face (`assets/fonts/`)
gains the 18 Czech ones, cut the same way (`subset-font` 2.9.0, the same Fontsource files; the
Polish-only cut reproduces the committed files byte for byte): Inter 5,248 → 7,680 bytes, Geist
Mono 3,636 → 5,136; the card's static faces 2,992 → 4,248 and 2,372 → 3,204. A Polish page pays
3.9 KB more (`/pl` 265,093, under 275 KiB). The face is renamed for what it holds now, and
`SCRIPT` takes `cs` as `latin-ext`. **«Čeština»** in every landing's language links has a Č:
on another language's page it takes the system's face, as «Русский» does (`marketing.css`), or
every landing fetches Inter's Latin Extended file; and a Czech command name in the commands
sentence (EKVID) has none.

### 5. Plurals

CLDR `cs`: `one` (1), `few` (2–4), `many` (fractions only: 1.5, 0.5) and `other` (0, 5 and
up). Every count that agrees with a noun is a four-form plural, `many` reached only by a fraction.
Czech AutoCAD prints a count with a fixed genitive plural where it builds the noun into the
sentence: `Odstraněno 1 položek styl textu.`, `Odstraněno 2 položek kótovací styly.` (names/p36),
ungrammatical for 1 and 2, copied as the console prints it, as Polish's. `Intl.NumberFormat("cs")`
writes `12 345,5`.

### 6. Length

On the same table ids, measured as Polish's (17/11/2026; the method reproduces Polish's figures):
labels of up to 20 characters +12% in total (median +8%, 90th percentile +50%), prompts +5%
(median +4%); Polish +21%, +14%, +71%, +12%; German +21%, +17%, +67%, +17%. 1.1% of labels hold a
word of 14 letters or more (German 8.9%, Polish 2.3%). The shortest of the localized languages
after English: phase 6's screenshots look where Polish's did.

### 7. Input

**Czech QWERTZ**, the layout most Czech keyboards use: Z and Y swap places (Ctrl+Z from the key
labelled Z, `KeyY`, as German's); the number row types `+ ě š č ř ž ý á í é` and the digits need
Shift (or the keypad); `ů` and `ú` are keys of their own; `ˇ` and `´` are dead keys (Ď, Ť, Ň and
the capitals with háček need one); `@` is AltGr+V, `<` and `>` AltGr+, and AltGr+. — AltGr reaches
the drawing since German's session. Many Czech draftsmen type in the "Czech (QWERTY)" variant or
English: the same letters, other places. Ctrl shortcuts are read by their physical key
(`shortcutKey`). Phase 6 types `ořež` on the drawing (ř is `Digit5` with the key `ř`), a coordinate
with Shift held on the number row, `@` through AltGr and `ď` through the dead háček, through CDP
as the layout sends them.

### Search texts

Google's suggestions (`hl=cs`, `gl=cz`, 369 seeds, 1,509 suggestions, some 39 of them Polish or
Slovak), Google Trends (Czechia, 12 months), Bing Webmaster's keyword research (Czech Republic,
Czech; three months, rate-limited after two words) and Bing's top ten (`cc=cz`), 17/11/2026. The
data is in `~/seo-data/raw-2026-11-17/cs-keywords/`, outside the repository. Trends puts nearly
every Czech long tail at 0: the suggestions and the results pages are the guide.

- **The generic term is «CAD zdarma» and «CAD online»**: Trends «autocad» 40, «cad free» 24, «cad
  online» 6, «technický výkres» 5; Bing «autocad online» 134, «cad online» 22; suggestions «cad
  zdarma», «2d cad zdarma», «program na technické kreslení zdarma», «technické kreslení online
  zdarma». **«technické kreslení»** is the plain-Czech word for drawing.
- **«zdarma»** (74 suggestions) over «bezplatný» (7, most of them Polish); **«online»** (191) over
  «v prohlížeči» (0; «prohlížeč» is a viewer); «bez instalace» once.
- **«AutoCAD» inflects**: «v autocadu» (54 suggestions against 1 «v autocad»), «autocadu» 58 in
  all. The pages write «v AutoCADu», «příkazy AutoCADu».
- **The command list**: «autocad příkazy slovník», «autocad příkazy anglicky», «zkratky autocad
  cz»; Bing's titles «Slovníček příkazů AutoCADu» (cadforum), «Tabulka příkazů AutoCADu»
  (cads.cz): «Příkazy AutoCADu česky a anglicky».
- **A command**: the Czech name, or with «anglicky» («autocad ekvid», «ekvidistanta autocad
  anglicky», «autocad čisti anglicky»), the English with «česky» («purge autocad česky»); the noun
  where it is what is searched («ekvidistanta», «šrafování», «kótování»).
- **Practice:** «cvičení» (Bing's titles, «Cvičebnice pro systém AutoCAD»); «úlohy» autocorrects
  to «úhly».
- **DXF:** «otevřít dxf», «čím otevřít dxf», «prohlížeč dxf», «dxf editor online», «úprava dxf».
- **The guides:** «jak nakreslit půdorys domu», «půdorys domu v autocadu» (PLAN is PŮDORYS: the
  help's «PŮDORYS (příkaz)» ranks for it); «zadávání souřadnic autocad» («polární souřadnice» is
  mathematics); «autocad 3d modelování».
- **The SERP** (Bing): smartcadsoft.com/cs, konstrukter.cz, opencadstudio.com/cs-CZ, proficad.cz,
  kulmanlab.com for the generic searches; cadforum.cz, cads.cz, cadstudio.cz, Autodesk's CSY help
  and zw.cz for the commands; groupdocs and dxfviewer.app for opening a DXF, the DXF editors all
  in English.

The titles these give (phase 2): the home «CAD online zdarma s příkazy AutoCADu»; the H1
«Technické kreslení online zdarma – s příkazy AutoCADu»; the command list «Příkazy AutoCADu česky
a anglicky»; a command «Příkaz EKVID (OFFSET) v AutoCADu», the noun first where it is searched
(«Ekvidistanta v AutoCADu: příkaz EKVID (OFFSET)», «Šrafování v AutoCADu: příkaz ŠRAFY (HATCH)»);
an exercise «Cvičení v AutoCADu: …»; «Otevřít DXF online» and «DXF editor online»; the floor plan
«Jak nakreslit půdorys domu v AutoCADu». Never «AutoCAD zdarma», which looks for AutoCAD itself.

### Register and typography

- **The reader as «vy»**, in the imperative plural, as Autodesk's Czech help and AutoCAD's prompts
  address the user («zadejte ODBODU», `Určete`, `Zadejte`, `Vyberte`), and the impersonal where it
  describes; never «ty».
- **Typography:** quotes „…“ (U+201E, U+201C), ‚…‘ inside them; a spaced en dash ( – ); no space
  before `: ; ! ?`; the decimal comma in prose, the point in values (`i18n.md`). A command name in
  prose after «příkaz» («příkaz EKVID vytvoří…»), as the help writes it, never inflected; AutoCAD
  inflects («v AutoCADu»).

## The phases

1. **Registration**: `cs` in `routing.ts` (`draft`, `localized`, `latin-ext`, «Čeština», `cs_CZ`),
   the catalogs `{}`, the editor's entry point and changeset, the docs' quotes („…“); the language's
   page, from this research.
2. **The site and the editor** from the search texts above: the site's catalog, the editor's
   catalog by id from the pack, the "Use" pages, the 101 command notes and the 12 exercises (agents
   on one brief, as Polish's), the generated pages.
3. **The engine's interface** by id from the installed pack (`propose-interface.mjs`).
4. **The command language** from the console: the probes `console-pair.mjs --select` picks, run in
   cs-CZ; `console-pair.mjs --lang cs`; the messages rebuilt as ICU in four plural forms; the
   desktop for the drafting toggles, Polar's readout and the ViewCube; `· cs` in every coverage
   heading; `czechPrompts.test.ts`.
5. **Script**: the letters' face with Czech's (§4), the card's faces, «Čeština» in the system's
   face elsewhere; nothing for direction, plurals or input.
6. **Verify, then live**: the gate, the first loads before and after, the screenshots at 360 px and
   1280×720, the Czech keyboard through CDP, a model's reread (no native reader is at hand), `live`.

## Unverified

What no probe has shown yet: the drafting toggles' lines and Polar's readout (the desktop, phase
4), and whether `Z` undoes on the desktop as `_U` does in the console.

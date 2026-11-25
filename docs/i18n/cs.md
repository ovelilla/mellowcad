# Czech (`cs`)

> **Command language:** `localized`, Czech AutoCAD's. **Status:** `live` since 17/11/2026, at
> `/cs`. **Review:** none by a native speaker (the owner knows none); a model's reread of what
> Autodesk did not write ("Review"). The plan and its commits: `docs/plans/cs-language.md`.

The words are Autodesk's own Czech localization of AutoCAD, never a translation of ours, as the
other localized languages' are. One Czech, as AutoCAD has one (`cs-CZ`).

## Sources

- **Language pack.** Autodesk ships AutoCAD 2027 in Czech (culture `cs-CZ`, the only Czech one of
  the 14 in `CULTURES`): `Autodesk_AutoCAD_2027_Czech_Language_Pack.exe`, 245,822,664 bytes, at
  `https://up1.autodesk.com/prd/2027/ACD/F0391787-58AD-39B5-BA0F-66525EAB1FFC/`
  (ceethreedee.com's "Civil 3D 2027 Download all the extensions", under `/cad-news/`), signed by
  Autodesk, Inc.
- **Installed on the owner's AutoCAD on 17/11/2026**, with the owner's leave: the pack with `-q`,
  elevated, then `AutoCAD_2027.1_Update.exe` again, so `cs-CZ/acadres.dll` is 26.0.116 (2027.1),
  as every other pack's, and `acad.exe` 26.0.118. The tables come from the install
  (`extract-strings.mjs --lang cs`: `all_cs.tsv`; `acad_cs.pgp`).
- **Help.** `https://help.autodesk.com/cloudhelp/2027/CSY/AutoCAD-Core/files/GUID-<id>.htm`
  answers with the English GUIDs (`GUID-C0E4246D-…` is «EKVID (příkaz)»). Search in English (the
  help MCP), read in `CSY`.
- **Console:** `runacc.sh … cs-CZ` and `probe.sh --lang cs`. It reads its input as
  Windows-1252, which lacks `č ď ě ň ř ť ů` (it has `š ž` and the acute vowels): a probe with one
  goes as a UTF-8 script (`/s`), which loads no `acad.pgp` and stops at its first refused answer
  (`autocad-research`, console.md). **Desktop:** `acad.exe /language cs-CZ`.

## Register

- **The reader as «vy»**, in the imperative plural, as Autodesk's Czech help and AutoCAD's prompts
  address the user («zadejte ODBODU», `Určete`, `Zadejte`, `Vyberte`), and the impersonal where it
  describes; never «ty». Keys as Czech AutoCAD prints them.
- **Editor:** Autodesk's register, its labels as Czech AutoCAD words them.
- **Typography:** „…“ (U+201E, U+201C), ‚…‘ inside them; a spaced en dash ( – ); no space before
  `: ; ! ?`; the decimal comma in prose, the point in what is typed. A command name follows
  «příkaz» in prose and never inflects («příkaz EKVID vytvoří…»), as the help writes it.
  **AutoCAD inflects** («v AutoCADu», «příkazy AutoCADu»): the form searched («v autocadu»);
  MellowCAD does not. What is copied from AutoCAD keeps its own marks (its tables quote with `"`).

## Search texts

Google's suggestions (`hl=cs`, `gl=cz`, 369 seeds, 1,509 suggestions), Google Trends (Czechia, 12
months), Bing Webmaster's keyword research (Czech Republic, Czech; three months, rate-limited after
two words) and Bing's top ten (`cc=cz`), 17/11/2026. The data is in
`~/seo-data/raw-2026-11-17/cs-keywords/`, outside the repository. Trends puts nearly every Czech
long tail at 0: the suggestions and the results pages are the guide.

- **The generic term is «CAD zdarma» and «CAD online»** (Trends «autocad» 40, «cad free» 24, «cad
  online» 6; Bing «autocad online» 134, «cad online» 22); **«technické kreslení»** is the
  plain-Czech word for drafting. «zdarma» (74 suggestions) before «bezplatný» (7); «online» (191),
  never «v prohlížeči» (0: «prohlížeč» is a viewer); «bez instalace».
- **The home:** «CAD online zdarma s příkazy AutoCADu — MellowCAD»; the H1 «Technické kreslení
  online zdarma – s příkazy AutoCADu»; the description with «příkazy česky i anglicky», «3D tělesa,
  zatím částečně», «bez instalace». «AutoCAD zdarma» (looking for AutoCAD itself) is never a claim.
- **The command list** is searched as a dictionary: «autocad příkazy slovník», «autocad příkazy
  anglicky», «zkratky autocad cz»: «Příkazy AutoCADu česky a anglicky».
- **A command:** the Czech name, or with «anglicky» («autocad ekvid», «ekvidistanta autocad
  anglicky»), the English with «česky» («purge autocad česky»): «Příkaz EKVID (OFFSET) v
  AutoCADu», the noun first where it is what is searched («Ekvidistanta v AutoCADu», «Šrafování
  v AutoCADu», «Kótování v AutoCADu»).
- **Practice:** «cvičení» (Bing's titles), never «úlohy».
- **DXF:** «otevřít dxf», «čím otevřít dxf», «prohlížeč dxf»: «Otevřít DXF online»; «dxf editor
  online», «úprava dxf»: «DXF editor online».
- **The guides:** «jak nakreslit půdorys domu», «půdorys domu v autocadu»: «Jak nakreslit půdorys
  domu v AutoCADu»; «zadávání souřadnic v autocadu» («polární souřadnice» alone is mathematics);
  «autocad 3d modelování».
- **The SERP** (Bing): smartcadsoft.com/cs, konstrukter.cz, opencadstudio.com/cs-CZ, proficad.cz
  and kulmanlab.com for the generic searches; cadforum.cz, cads.cz, cadstudio.cz, Autodesk's CSY
  help and zw.cz for the commands; groupdocs and dxfviewer.app for opening a DXF.

## Command language

### `acad.pgp`

`research/strings/acad_cs.pgp`. Names by `getcname` (names/p01, p36), aliases from the file:
ÚSEČKA (`U`), VYMAŽ (`V`), VLOŽ (`VL`), VÝPIS (`VY`), VZD (`VZ`), ROZLOŽ (`X`), ZAOBLI (`ZA`),
ZRCADLI (`ZI`), ZKOS (`ZK`), ZOOM (`ZO`), KEDIT (`KE`), KÓTYSTYL (`KSL`), KŘIVKA (`K`), KRUŽNICE (`KR`), OBLOUK (`O`),
ELIPSA (`EL`), OBD, POLYGON (`POL`), ŠRAFY (`HS`), POSUN (`POS`), KOPIE (`KO`), EKVID (`E`), OŘEŽ
(`OR`), PRODLUŽ (`PD`), OTOČ (`OT`), MĚŘÍTKO (`ME`), POLE (`PO`), PROTÁHNI (`PT`), PŘERUŠ (`PR`),
BLOK (`B`), TEXT (`DT`), MTEXT (`MT`, `T`), HLADINA (`HL`), PLOCHA (`PL`), PP (`P`), ČISTI (`CI`),
KOPIEVLAST (`KV`), TYPČ (`TC`), TLČÁRY (`TLČ`), TČMĚŘ (`TCM`), PÍSMO (`PSM`), JEDNOTKY (`JN`).

- **Many letters mean another command than in English**: `U` ÚSEČKA (U undoes in English), `V`
  VYMAŽ, `E` EKVID (ERASE), `O` OBLOUK (OFFSET), `X` ROZLOŽ (EXPLODE, as English), `PL` PLOCHA
  (PLINE), `PO` POLE (POINT), `R` PŘEKR (REDRAW), `S` SKUPINA (STRETCH), `T` MTEXT, `K` KŘIVKA. As
  in Czech AutoCAD.
- **U is `Z`** (`getcname`), which no alias takes.
- **FROM is `ODBODU`** at a point prompt (names/p03: `Základní bod:`, `<Odsazení>:`), the CSY
  help's «ODBODU (modifikátor příkazu)»; at `Příkaz:` it is unknown (names/p42).
- **RECTANG is `OBD`** (`getcname`); `OBDÉLNÍK`, the CSY help's title, is the local name of
  `_RECTANGLE`, English's 2025 alias (names/p43): the engine's alias of OBD.

### The keywords' format

- **«nebo»** before the list, after an imperative, as English: `Zadejte další bod nebo [Zpět]:`
  (20619). No verb after the list; no space before a prompt's colon: `Příkaz:`.
- **`initget`** as the others': a capital inside a word marks the letter (`úHel`, `úsEčka`,
  `zDvih`, `šířKa`, `měříTko`, `oBjekt`).
- **Yes or no:** `[Ano/Ne] <A>` (-PURGE's verify, names/p36).
- **-OSNAP's words** (names/p07, p38): `KON`, `POL`, `STŘ`, `GST` (listed `Gstř`), `BOD`, `KVA`,
  `PRŮ`, `PRO`, `REF`, `KOL`, `TAN`, `NEJ`, `ZDÁ` (listed `ZDÁNPRŮ`), `ROV`, `NIC`; `NE` turns them
  off (`VYP` is refused, p33); listed `KON,STŘ,PRŮ,PRO`. `BEZ` (Immediate) is refused (p40).
- **A typed snap's echo** (names/p09, p31, p34, p35, p39): `of` is `z`, `to` is `k`; Intersection
  asks ` a `. Not found: `Žádný(é) KOlmo nenalezen(o) pro zadaný bod.` (the keyword's capitals),
  Tangent's without its name; then `Vyžadován bod nebo klíčové slovo.`, `Neplatný bod.` at a first
  point.
- `propose-commands.mjs --lang cs` (17/11/2026): 1,479 proposed, 257 `several`, 164 `partial`, 42
  `plural`, 8 `select`, 528 `no-source`.

### The desktop

The drafting toggles are composed by AutoCAD and in no table, so the Czech desktop settled them
(names/d01, 17/11/2026, `/language cs-CZ`): `<Krok ano>` (F9), `<Uchop ano>` (F3; the table's
«Uchopení objektů» is not what it prints), `<Orto ano>`, `<Polárně ano>` (F10), `<Trasování
uchopení objektů ano>` (F11) and `<Rastr ano>` (F7), each with `ne`; Selection Cycling
`<Přepínání výběru zapnuto>` and `vypnuto`; Esc `*Storno*`. `Z` after a LINE undoes it; `OBDÉLNÍK`
draws a rectangle. Polar along Z writes `Polárně: 2.2178 < +Z` and `… < -Z` (LINE from 0,0,0 in SW
isometric, names/d02), in the plane `Polárně: 2.5272 < 0°`. The ViewCube's faces are drawn in
capitals, SHORA, ZDOLA, ZEPŘEDU, ZEZADU, ZLEVA, ZPRAVA (where AcVMToolsRes 632 says «Zpátky»), its
compass `S`, `V`, `J`, `Z`, the UCS menu `GSS`, `Nový USS`, `Bez názvu` (names/d05). The ribbon's
Home tab is «Výchozí», its panels Kreslit, Modifikace, Poznámka, Hladiny, Blok, Vlastnosti
(names/d00).

## Interface terms

From the installed pack by id against `en-US/` (`propose-interface.mjs --lang cs --like pl`,
17/11/2026), as Polish's: `P <dll> <id>` a string table, `D` a dialog's label, `N` a .NET
resource, `X` an element of `acad.CUIX`. The engine's `interface`: 177 by one resource, 26 as
Polish chose, 137 by the row's place, 63 from `ax26res`'s `;`-separated lists, 9 menu macro
names, 13 other resources, 10 from the desktop, 24 ours. The editor: 94 by one resource, 14 as
Polish, 79 by the row's place, 84 ours (11 of them key names and file types).

| Area | English | Czech | Source | Verified |
| --- | --- | --- | --- | --- |
| Ribbon's Home tab | Home; Draw, Modify, Annotation, Layers, Block, Properties, Utilities, Clipboard; Pin | Výchozí; Kreslit, Modifikace, Poznámka, Hladiny, Blok, Vlastnosti, Pomůcky, Schránka; Připnout † | X ID_TabHome, ID_PanelDraw … RBN_00011049 and every button's and list member's uid (`ribbon.mjs --lang cs`, 2026-11-24); Pin † ours: AutoCAD's pin has no name, the word undoes acadres 49183 `Unpin` | no |
| Ribbon's other tabs | Insert, Annotate, 3D Tools, View; Retain Attribute Display, Display All Attributes, Hide All Attributes; More Colors...; Select Color...; 2D Wireframe, Hidden, Conceptual | Vložit, Poznámky, 3D nástroje, Pohled; Zachovat zobrazení atributu, Zobrazit všechny atributy, Skrýt všechny atributy; Další barvy...; Vybrat barvu...; 2D drátový model, Skrytý, Koncepční | X ID_TabInsert, ID_TabAnnotate, ID_TAB_3D_TOOLS, ID_TabView, each panel's and button's uid (acad.CUIX by uid, 2026-11-24); AcWindows.resources.dll's BAML (`AcAttmode1/2/0`, `mMoreColorsLabel`); AcDimRes 318; tables 41794, 41445, 8027 | no |
| Ribbon's minimize button | Show Full Ribbon; Minimize to Tabs, Minimize to Panel Titles, Minimize to Panel Buttons, Cycle through All | Zobrazit úplný pás karet; Minimalizovat na zobrazení karet, Minimalizovat na zobrazení názvů panelů, Minimalizovat na zobrazení tlačítek panelů, Cyklicky procházet všechny | X AdWindows.resources.dll's BAML (`ID_MinimizeToTabs`, `ID_MinimizeToPanelTitles`, `ID_MinimizeToPanelButtons`, `ID_CycleThroughAll`, `system:String_83`), 2026-11-24 | no |
| Title bar's title | A new drawing's name (Drawing1.dwg) | Výkres1.dwg | P acadres 4125 (`Drawing.dwg`, numbered as the session numbers new drawings; desktop 2026-11-25, es) | yes |
| Title bar's Help ▾ | Help; Send Feedback | Nápověda; Odeslat zpětnou vazbu | X ACAD_379 (`ID_Help`, the Help menu's first item), XLS_7254 (`ID_SendFeedback`) | yes |
| Palette | An XLINE's and a RAY's Basepoint Y | Refbod Y | ax26res 64, set right: it says `Refbox Y` | — |
| Status bar | Object Snap, Polar Tracking, Object Snap Tracking, Grid, Snap Mode | Uchopení objektů, Polární trasování, Trasování uchopení objektů, Rastr, Režim kroku | acadres 20020–20029, dwgaidsRes 2 | yes |
| Ribbon | Draw, Modify, Annotation, Block, Utilities, Clipboard | Kreslit, Modifikace, Poznámka, Blok, Pomůcky, Schránka | the desktop (names/d00) | yes |
| Tools | Line, Polyline, Move, Rotate, Trim, Copy, Mirror, Fillet, Stretch, Scale | Úsečka, Křivka, Posun, Otočit, Oříznout, Kopírovat, Zrcadlit, Zaoblit, Protáhnout, Měřítko | the ribbon (names/d00) | yes |
| Tools | Offset, Erase, Hatch, Extrude, Pan | Odsazení (the ribbon's, where the command is EKVID), Vymazat, Šrafování, Vytáhnout, Posun pohledu | RibbonRoot `ID_RBN_CMDBTN_*` | partial |
| Palette | Rotation, Position X, Fit (spline method) | Natočení, Umístění X (a point's; a solid's is «Poloha»), Přizpůsobit | ax26res 254, 31, 915 | partial |
| Palette | Leader, Attribute Definition (objects) | Pozice, Definovat atribut | ax26res 297, 706 (Autodesk's, odd as they are) | partial |
| Objects | Plural entity names, "# objects" | the tables' singulars, nominative plurals beside a count; # objekt/objekty/objektu/objektů † | ax26res 279–316 | partial |
| Views | Top … Right, SW Isometric | Horní … Pravý, JZ iso | AcVMToolsRes 32814–32823 (the viewport controls) | partial |
| ViewCube | Faces, compass, UCS menu | SHORA … ZPRAVA; S, V, J, Z; GSS, Nový USS, Bez názvu | the desktop (names/d05) | yes |
| Shortcut menu | Repeat, Cancel, Deselect All, Copy with Base Point | Opakovat, Storno, Vyjmout vše, Kopírovat s referenčním bodem | acad.CUIX PM_0006, ACAD_1931 | partial |
| Dialogs | Drawing Units, Point Style | Kreslicí jednotky, Typ bodu | unitsRes 500, acddptyperes 101 | partial |
| Layers | On, Off, Locked, Unlocked; columns On, Lock | Zapnuto, Vypnuto, Uzamknuto, Odemknuto; Zap, Zamknout | AcVMToolsRes 4117/4118, ax26res; AcLayer | partial |
| Editor | Snap X, polar snap distance, selection cycling settings, command history | Krok X †, Vzdálenost polárního kroku †, Nastavení přepínání výběrů †, Historie příkazů † | ours, from the Drafting Settings' words | — |

## The command language, how it was set

- **The console**, the 433 probes `console-pair.mjs --lang cs --select` picked that run in cs-CZ,
  on 17/11/2026: 529 keys match the tables, 335 differ and take the console's wording, 189 are
  worded more than one way, 85 unpaired, 298 unseen; 706 keys came from the console at once. Four
  agents (one brief, each output checked against the parser and English's arguments) settled the
  rest from the transcripts, the tables and the CSY help: messages (two), prompts and forms,
  keywords and labels.
- **Plurals**: where Czech AutoCAD prints a count with a fixed form (`Odstraněno 2 položek
  kótovací styly.`), the catalog copies it; in our own messages, four forms.
- **A closed spline's SPLINEDIT menu** declares other words than the open one's
  (`[Otevři/Data vyhlazení/Editace vrcholů/…/kOnec]` listed, `Otevřít`, `Upravit`, `obRátit`,
  `konEc` declared): `promptKeywords.splineditOptionClosed` gained Open, Edit vertex, Reverse and
  eXit in every language, with the words each already used, and `locales.test.ts` reads that
  prompt by its id where several share `Enter an option`.
- **Selecting objects** declares `OKno`, `přiDej`, `Odstraň` and `Objekt` (the erase probes'
  trace), not the tables' `Okno`, `Přidat`, `Odstranit`, `oBjekt`.
- **Names the console and the help settle apart**: RECTANG `OBD` (`getcname`) and `OBDÉLNÍK` (the
  help, `_RECTANGLE`'s local name); PTYPE `BTYP`, EATTEDIT `EATREDIT`, BLOCKSPALETTE
  `PALETABLOKY`, UNITS `JEDNOTKY`, PROPERTIES `VLASTNOSTI`, DIMSTYLE `KÓTYSTYL`, LAYERCLOSE
  `HLADZAVŘI`, the arrays `OBDPOLE`, `POLÁRPOLE`, `KŘIVPOLE` (the CSY help, for what the console
  loads on demand). Our own commands take the base name and the letters of their option:
  `KRUŽNICEP`, `KRUŽNICE2B`, `KRUŽNICE3B`, `OBLOUKPSK`, `OBLOUKSPK`, `ELIPSAS`, `ELIPSAOBLOUK` (†).
- Copied as AutoCAD prints them, faults included: `segmentsAddedToPolylines` (its labels swapped,
  not its values), `facesFoundRemoved` (`nalezeno,;`, table 22463).

### Per command

Where English shares one prompt id and Czech words it per command or per state, one wording stands
until each gets an id of its own:

- `boxLength`: `Zadejte délku` without a default, `Určete délku` with one.
- `selectFacesOr`: `Vyberte hrany` before the first pick, `Vyberte plochy` after.
- `previousShort`: PEDIT prints `<Z>`, SPLINEDIT `<P>`; `exitLower` `konec` and `kOnec`;
  `selectAll` `vybrat vše` and `vybrat všechny`.
- `specifyFirstPoint` and `specifyNextPointOr`: LINE's `Určete první bod`, `Zadejte další bod
  nebo` against DIST's and AREA's.
- `listArea`: «plocha» indented 12 for a circle, 14 for a polyline (the polyline's stands).
- **Keywords one prompt letters otherwise**, without a slot yet: PLINE's arc mode with Close
  (`poLotloušťka`, `Poloměr`) and without (`Polotloušťka`, `poloMěr`, which stands); SPLINE's
  Close (`zAvřít` with fit points, `Uzavři` with control vertices); CHAMFER's Distance (`Hrana` at
  the first line, `Vzdálenost` at the second and at a 2D polyline).

### Unverified

No probe shows these; each is worded from its neighbours and stays so until one does:

- **Ours in every language**: the file, DXF and clipboard messages, FROM's own messages, the
  history's steps for what the chrome does, our own commands' names, the external references'
  lines, `matchpropSettings`, `cornersSkipped`.
- **Not probed**: `format.polar`, `feedback.measure*`, LIST's lines for a cone, an array's method
  and direction, a justification point, the attribute refusals of ATTEDIT and DIVIDE's block
  names, the DIMSTYLE variables' descriptions, the short field labels (`firstPoint`, `startAngle`,
  `scaleFactor`…), worded from the console's neighbouring prompt.

The list by key is the session's, outside git, and `czechPrompts.test.ts` holds what the console
and the desktop printed.

## The site's words

`messages/cs.json`, the editor's catalog, the seven written "Use" pages (shortcuts is generated),
the 101 command notes and the 12 exercises (17/11/2026, seven agents on one brief, each file read
by `docs:check` against its English's options, questions and elements). A command's prompt is
«výzva», an option «možnost»; the alias question is «Jak se jmenuje příkaz … anglicky?» or «…
česky?», its answer the alias of `acad_cs.pgp` and `_NAME` for any language.

- **Ours in the pages (†)**: dialog names no resource was read for («Definice atributu»,
  «Definice bloku», «Rozšířený editor atributů», «Vybrat barvu», «Správce vlastností hladin»),
  the ribbon groups «Organizace», «Soubory a schránka», «Dotazy a pohled», «Konstruktéři» and
  «Kutilové» (Drafters, Makers), «kotvička» (LEADER's hook, the CSY help's), the exercises' parts
  (těsnění, příruba, řemenice, osazený hřídel, ložiskové těleso, montážní deska, úhelník tvaru L,
  táhlo, stupňovitý hranol, schodiště, pozemek, kulatý stůl) and layer names (Obrys, Osy, Skryté
  čáry, Kóty), «uzly» for grips.

## Script and font

`latin-ext`. `á é í ó ú ý` are Latin-1, in Inter's latin subset; `č ď ě ň ř š ť ů ž` and their
capitals are Latin Extended-A, which `next/font` would fetch from Inter's and Geist Mono's Latin
Extended files (85 and 14.7 KB). The letters' face Polish made gains the 18 Czech ones
(`assets/fonts/README.md`): Inter 5,248 → 7,680 bytes, Geist Mono 3,636 → 5,136, the card's 2,992
→ 4,248 and 2,372 → 3,204, renamed `*-letters-*` for what it holds now. It goes before Inter and
Geist Mono on a Czech page as on a Polish one (`lettersFontStack`); «Čeština» on another
language's page takes the system's face (`marketing.css`), as «Русский» does, or every landing
would fetch Inter's Latin Extended file.

## Plurals

CLDR `cs`: `one` (1), `few` (2–4), `many` (fractions only: 1.5) and `other` (0, 5 and up). Every
count that agrees with a noun is a four-form plural. Czech AutoCAD prints `Odstraněno 1 položek
styl textu.` and `Odstraněno 2 položek kótovací styly.` (names/p36), ungrammatical for 1 and 2:
copied. `Intl.NumberFormat("cs")` writes `12 345,5`.

## Length

On the same table ids (17/11/2026): labels of up to 20 characters +12% in total (median +8%, 90th
percentile +50%), prompts +5% (median +4%); Polish +21%, +14%, +71%, +12%. 1.1% of labels hold a
word of 14 letters or more (Polish 2.3%, German 8.9%).

## Input

Czech QWERTZ: Z and Y swap places; the number row types `+ ě š č ř ž ý á í é`, the digits with
Shift or the keypad; `ů` and `ú` keys of their own; `ˇ` and `´` dead keys (Ď, Ť, Ň and the
capitals with háček); `@` AltGr+V, `<` and `>` AltGr+, and AltGr+. Ctrl shortcuts are read by
their physical key (`shortcutKey`).

Checked in Chrome before going live (17/11/2026, keys sent through CDP as the layout sends them on
Windows, the letter in `key` and `text`, the physical key in `code`): `ořež` typed on the drawing
(ř and ž from `Digit5` and `Digit6`) runs OŘEŽ and asks `Vyberte objekt k oříznutí nebo s
klávesou Shift k prodloužení nebo [řEzací hrany/Křížení/Režim/Vymazat]:`; `10,0` typed with Shift
on the number row answers ÚSEČKA's first point; the dead háček then `d` reaches the command line as
`Ď`. AltGr in a field (`@` is AltGr+V) stays to be seen on a real Windows keyboard, as Polish's
and German's.

## Going live

On 17/11/2026, from production builds in a clean worktree (every page `○` or `●` but
`/api/search` and `/mcp`; 126 Czech URLs in the sitemap, 1,275 in all):

- **The landing's first load**, Brotli q11, in bytes, Czech a draft (`a6e1a4d6`) and live: `/`
  253,853 → 253,753, `/es` 255,131 → 255,151, `/pt-br` 255,342 → 255,393, `/ar` 278,700 →
  278,725, `/fr` 256,046 → 255,937 (63 under 250 KiB), `/it` 255,122 → 255,206, `/de` 255,475 →
  255,522, `/ru` 288,915 → 289,132, `/pl` 269,009 → 269,034; `/cs` 268,978 → 268,870, under the
  275 KiB of a script's font: the letters' two faces (7,684 and 5,140), never Google's Latin
  Extended files. No other landing fetches a letters' face.
- **`/fr` was 46 bytes over 250 KiB with Czech a draft**, by this measure (every response until
  the network is idle, each body Brotli q11), and 67 over once live: the letters' face declares
  one range, `U+0104-017E`, where it listed ten (only a Polish or Czech page names the face, and a
  letter it lacks there falls through to Inter), and «Čeština» shares Russian's rule, on the
  links alone (`a:lang(cs)`), where Czech had two of its own. The next change to the French
  landing has to be measured.
- **Naming Czech** in every landing's commands sentence (`<cs>{czech}</cs>`: EKVID beside ODSUŃ
  and ПОДОБИЕ), in Geist Mono, as EKVID has no letter outside latin.
- **What did not fit** (the landing at 360 px, the editor at 1280×720): nothing wraps or
  overflows; the H1's en dash keeps to the word before it (a no-break space), as Czech typography
  wants.

## Review

No native reader: the owner knows none. What Autodesk did not write was read again by a model on
17/11/2026, four agents against the English, Autodesk's tables and the Czech catalogs:

- **The site and the editor**, some 40 edits: «uchopení objektů», as the status bar writes it,
  where ten keys had «objektu»; «přímá kóta» (DIMLINEAR is KÓTYPŘÍM); calques undone («ptá se ve
  stejném pořadí jako AutoCAD», «Co kde zůstává»); in the editor only our own labels. The landing's
  figure keeps «Tečná», the snap marker's word (acadres 78), where the Object Snap tab writes
  «Tečna».
- **The "Use" pages and exercises**, 31 edits: «souřadnicové kóty» for ordinate dimensions,
  «stupňovitý hranol v izometrii» as the exercise is named, «uchopení Koncový», «uzamknuté».
- **The command pages**, some 370 edits: «možnost» for an option where «volba» crept in, «ve
  výzvě», F3's echo `<Uchop ano>`, running snaps «průběžné», the Node snap «Uzel», Fence
  «Napříč», hatch islands «ostrovy», MellowCAD never inflected, a name always after «příkaz», and
  every alias answer checked against `acad_cs.pgp` (`E` runs EKVID, `EX` EXTERNÍREFERENCE, `3P`
  3DPOLE).
- **Left, for a native reader if one is found**: «šrafy» (Autodesk's) against «šrafa»,
  «základna» against «podstava» for a cone, «kotvička» against «rameno» for LEADER's hook,
  «trasovací čáry» for alignment paths, «Kutilové» for Makers, «přechodové výplně» against
  «gradientní», the exercises' «osazený hřídel», «táhlo», «nálitek», and the drawings' `4x <>`
  and `<> max` for THRU and TYP.

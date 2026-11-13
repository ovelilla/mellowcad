# German (`de`)

> **Command language:** `localized`, German AutoCAD's. **Status:** `draft` since 13/11/2026, at
> `/de`. **Review:** none yet; no native speaker is at hand (the owner knows none), so a model's
> reread of what Autodesk did not write before going live. The plan and its phases:
> `docs/plans/de-language.md`.

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
SCHNITTMENGE, `MA` MANSFEN (MATCHPROP); `T` and `MT` are MTEXT and `DT` TEXT, as English. Names
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
AltGr; `^`, `´` and `` ` `` are dead keys. To check in the command line and the dynamic input
before going live.

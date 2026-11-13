# German (`de`) — plan

The third language after the pilot, through skill `add-language`, phase by phase, as Italian did
(`docs/plans/it-language.md`, `docs/i18n/it.md`): `de` from nothing to `live` at `/de`, with the
whole site — the editor, the six "Use" pages written by hand, the command pages' notes, the
exercises, the generated pages — and the command language of AutoCAD 2027 in German. The German
session of the visibility plan (`docs/next-seo.md`, L8). What does not fit is fixed in the system, never
in the language.

## Progress

Each phase lands on `main` when it closes (skill `finish-feature`), so a session that resumes
starts from `main` and from the table below; its work in progress is on the branch
`worktree-german`.

| Phase | State |
| --- | --- |
| 0 | Done 13/11/2026: this plan; `runacc.sh`'s German banner |
| 1 | Next |

## 0. Research (13/11/2026)

### 1. AutoCAD and its language pack

- **`localized`.** Autodesk ships AutoCAD 2027 in German (culture `de-DE`, the only German one of
  the 14 in `CULTURES`): `Autodesk_AutoCAD_2027_German_Language_Pack.exe`, 246,304,008 bytes,
  2/3/2026, at `https://up1.autodesk.com/prd/2027/ACD/D787B58D-D279-3D66-9B58-084475C1AFE7/`
  (ceethreedee.com's "Civil 3D 2027 Download all the extensions", under `/cad-news/`). Signed by
  Autodesk, Inc. (Authenticode valid, DigiCert's timestamp), as the `AutoCAD_2027.1_Update.exe`
  kept from Italian's install.
- **Installed on the owner's AutoCAD on 13/11/2026**, the owner asked first: the pack with `-q`,
  elevated, then the 2027.1 update again (both exit 0). `de-DE/acadres.dll` is 26.0.116, as
  `it-IT/`; `acad.exe` stays 26.0.118. `extract-strings.mjs --lang de` wrote the tables from the
  install (`all_de.tsv`, 11,093 ids, as every language's; `acad_de.pgp`, 605 lines).
- **The console** runs in German (`runacc.sh … de-DE`) once `runacc.sh` knows the banner's last
  line, «AutoCAD Menü-Dienstprogramme geladen.», added. `Befehl:`; LINE asks `Ersten Punkt
  angeben:` and `Nächsten Punkt angeben oder [Zurück]:`.
- **Help:** `https://help.autodesk.com/cloudhelp/2027/DEU/AutoCAD-Core/files/GUID-….htm` answers
  with the English GUIDs (`GUID-0546E8D5-…` is «ABRUNDKANTE (Befehl)»).

### 2. `acad.pgp`

`research/strings/acad_de.pgp`. German AutoCAD gives the fewest of the English hand's letters of
any language so far, and gives many of them to another command:

| Alias | English  | German                                                   |
| ----- | -------- | -------------------------------------------------------- |
| `E`   | ERASE    | EIGENSCHAFTEN (PROPERTIES); LÖSCHEN is `LÖ`, `DELETE` stays |
| `S`   | STRETCH  | SCHIEBEN (MOVE); STRECKEN is `STR`                       |
| `F`   | FILLET   | FANG (SNAP); ABRUNDEN is `AR`                            |
| `AR`  | ARRAY    | ABRUNDEN (FILLET); REIHE is `RH`                         |
| `B`   | BLOCK    | BOGEN (ARC); BLOCK is `BL`                               |
| `O`   | OFFSET   | OPTIONEN (OPTIONS); VERSETZ is `VS`                      |
| `RE`  | REGEN    | RECHTECK (RECTANG); REGEN is `RG`                        |
| `DI`  | DIST     | DIFFERENZ (SUBTRACT); ABSTAND is `AB`                    |
| `EX`  | EXTEND   | EXTRUSION (EXTRUDE); DEHNEN is `DE`                      |
| `PU`  | PURGE    | PUNKT (POINT); BEREINIG is `BE`                          |
| `PR`  | PROPERTIES | PRÜFSTANDARDS (CHECKSTANDARDS); EIGENSCHAFTEN is `EI` |
| `MA`  | MATCHPROP | MANSFEN, the German name of MATCHPROP                   |
| `AP`  | APPLOAD  | APUNKT (VPOINT); APPLOAD is `AO`                         |

And none at all for `A`, `C`, `M`, `CO`, `TR`, `CHA`, `RO`, `SC`, `MI`, `J`, `X`, `H`, `Z`,
`REC`, `POL`, `I`, `D`, `LW`, `EXT`, `SL`, `G`, `DO`, `PA`, `MO`, `LEN`, `LI`, `ST`, `UN`, `DIV`,
`PO`, `LE`, `AA`, `XL`. German's own: `L` LINIE, `K` KREIS, `KO`/`CP` KOPIEREN, `SU` STUTZEN,
`FA` FASE, `DH` DREHEN, `V` VARIA, `SP` SPIEGELN, `BR` BRUCH, `VB` VERBINDEN, `UR` URSPRUNG,
`SCH`/`GS` SCHRAFF, `ZO` ZOOM, `PG` POLYGON, `EIN` EINFÜGE, `LS`/`LIS` LISTE, `LT` LINIENTYP,
`LST` LSTÄRKE, `KA` KAPPEN (SLICE), `QU` QUERSCHNITT, `GP` GRUPPE, `RI` RING, `LÄ` LÄNGE, `ET`
EINHEIT, `STI` STIL, `TL` TEILEN, `ME` MESSEN, `KL` KLINIE, `VEE` VEREINIG, `SM` SCHNITTMENGE;
`T` and `MT` are MTEXT and `DT` TEXT, as English. Each command's name is checked in the console in
phase 4. Names and aliases hold Ä, Ö and Ü (LÖSCHEN, ÄNDERN, LÄNGE, EINFÜGE), keys of their own on
QWERTZ; none holds ß.

### 3. The keywords' format

- **«oder»** before the list, which can come before the verb: `Nächsten Punkt angeben oder
  [Zurück]:` (20619), `Erste Ecke oder [Kreisförmig/Polygonal] angeben: ` (435). `orWords`
  deduces it from the tables.
- **`initget`** like the other languages': the capital inside a word marks the letter
  (`Kreisbogen Schließen Halbbreite sehnenLänge LInie Zurück Breite _Arc Close …`, 21298), so a
  label can start in lower case (`sehnenLänge`, PLINE's Length) and take two capitals (`ZUrück`
  beside `Zeichnen`, 9964). Keywords hold `ß` (`Schließen`): JavaScript's `"ß".toUpperCase()` is
  `SS`, two letters, so phase 4 tests that typing a keyword whole, in either case, still matches.
- **No space before a prompt's colon**, as English: `Befehl:` (22843), `Versatzabstand angeben
  oder [Mehrere]:` (67).
- **Two words for one English keyword**, as the others: OFFSET's distance is `Abstand angeben
  oder [Durch punkt]` at 21215 but `Versatzentfernung bestimmen oder […/VErbinden]` at 5406.
- `propose-commands.mjs --lang de` (13/11/2026): 1,435 proposed, 221 `several`, 144 `partial`, 40
  `plural`, 8 `select`, 512 `no-source` (Italian's: 1,393, 213, 139, 39, 8, 497).

### 4. Fonts

`latin`: German needs ä ö ü ß and their capitals, „ “ ‚ ‘ – …, all in Inter's and Geist Mono's
latin subsets and in the share card's (`inter-latin-600-normal.woff`,
`geist-mono-latin-400-normal.woff`, read with opentype.js). Only the capital ẞ (U+1E9E) is missing,
which German writes as SS and no text needs. Nothing to add, no budget spent.

### 5. Plurals

CLDR `de`: `one` and `other`; **0 and 1.5 are `other`**, as English. `Intl.NumberFormat("de")`
writes `1.234`, `12.345` and `1,5`.

### 6. Length

On the same table ids, measured the same way for each (13/11/2026): labels of up to 20
characters +22% in total (median +17%, 90th percentile +71%), prompts +16%; Italian +25%, +18%,
+71%, +28%; French +30%, +20%, +83%, +28%. **German is not longer in characters but in words**:
its compounds do not wrap. The longest word of a label is 8 letters at the median and 13 at the
90th percentile (Italian 7 and 11, English 6 and 10), and 9.8% of labels hold a word of 14 letters
or more (Italian 4.0%, French 3.8%, Spanish 3.3%): `Linienstärke`, `Objektfangspur`,
`Bemaßungsstil`. Phase 6's screenshots look for a word cut or overflowing rather than a line too long:
the ribbon's buttons, the palettes' rows, the status bar's tooltips, the dialogs' labels, the
landing's headings at 360 px.

### 7. Input

German QWERTZ (Germany, Austria; Swiss German its own QWERTZ): Z and Y swap places, so Ctrl+Z
arrives as `z` from the key labelled Z (`shortcutKey` reads the letter); ä ö ü are keys of their
own, ß too; `@ { [ ] } \ | ~` need AltGr; `^`, `´` and `` ` `` are dead keys. Checked in the
command line and the dynamic input in phase 6, as AZERTY was (skill `browser-verify`).

### Search texts

Google's suggestions (`hl=de`, `gl=de`, `at`, `ch`), Google Trends (Germany, Austria and
Switzerland, 12 months) and Bing's keyword research (three months), 13/11/2026; the data is in
`~/seo-data/raw-2026-11-13/de-keywords/`, outside the repository.

- **The generic term is CAD, with «Programm» or «Software»**: Trends (Germany) gives «cad
  software» 66, «cad programm» 37, «cad kostenlos» 28; in another comparison «autocad» 74, «cad
  online» 7 (= «online cad»), «cad kostenlos» 4, «grundriss zeichnen» 4. Bing (Germany): «cad
  programm kostenlos» 1K, «autocad kostenlos» 291, «cad kostenlos» 166; «cad online kostenlos»
  below its threshold. Suggested: «cad online kostenlos ohne anmeldung», «cad programm kostenlos
  deutsch», «… browser», «2d zeichenprogramm kostenlos», «online zeichenprogramm mit bemaßung»,
  «technisches zeichnen online kostenlos», «cad ohne installation». Austria and Switzerland show
  only «cad online» above 0.
- **The home:** main query «kostenloses CAD-Programm», with «CAD online», «im Browser», «ohne
  Installation», «ohne Anmeldung», «technisches Zeichnen» and «AutoCAD-Befehle auf Deutsch und
  Englisch». «AutoCAD kostenlos» (10 in Trends against «autocad befehle» 2) is never written as a
  claim: it would read as AutoCAD itself.
- **The command list:** «autocad befehle» (2 in Trends, below Bing's threshold) is suggested as
  «… liste», «… liste pdf», «… deutsch englisch (pdf)», «… liste deutsch»: the bilingual list is
  the search, and English names are searched per command («autocad versetzen englisch», «autocad
  stutzen englisch»). Title from «AutoCAD-Befehle auf Deutsch und Englisch».
- **A command:** «autocad versetzen», «autocad stutzen (befehl, englisch)»: the German name and
  the English one, both in the title.
- **Practice:** «autocad übungen» (0 in Trends) is suggested with «für anfänger (pdf)», «pdf»,
  «2d», «übungsaufgaben»: «AutoCAD-Übungen».
- **DXF:** «dxf viewer» 17 against «dxf öffnen» 8 and «dxf datei öffnen» 2 (Trends); Bing «dxf
  datei öffnen» 322 in Germany. Suggested: «dxf datei öffnen online kostenlos», «dxf viewer online
  kostenlos», «… mit messfunktion», «dxf datei bearbeiten (kostenlos, online)», «dxf datei
  erstellen».
- **The guides:** «grundriss zeichnen online (kostenlos, ohne anmeldung)», 17 in Trends against
  «cad online» 28; «autocad polarkoordinaten (eingeben)».
- **The SERP** for «cad online kostenlos» (Bing's top 10): liberodraft, owlcad, opensketch,
  cadcraft, opencadstudio; for «cad programm kostenlos», FreeCAD, chip.de and the lists.

### Decisions

- **Tag `de`, URL `/de`**, `og:locale` `de_DE`, «Deutsch» in the selector: one German for
  Germany, Austria and Switzerland, as AutoCAD has one (`de-DE`). No prefix map entry. Swiss
  German writes ss for ß; this follows `de-DE`, as AutoCAD does.
- **Register:** Autodesk's, formal: «Sie», as its tables (431 strings) and help address the user;
  the landing too («Geben Sie L ein. Drücken Sie die Eingabetaste.»), the key as Autodesk names it
  in prose (Eingabetaste; `EINGABETASTE` in a prompt).
- **Typography:** „…“ (U+201E, U+201C), ‚…‘ inside, no space before `: ; ! ?`; compounds with
  a hyphen where a name joins a noun (`AutoCAD-Befehle`, `DXF-Datei`). What is copied from AutoCAD
  keeps its own marks (its tables quote with `"`).
- **Order of the phases as Italian's**: 0, 1, 3–4, 2, 5, 6 (the command notes name each command in
  German: `Befehl VERSETZ (OFFSET)`).

## Phases

| Phase | Commit | What it touches |
| --- | --- | --- |
| 0 | `docs` | `runacc.sh`'s German banner; this plan |
| 1 | `feat(i18n)` | `routing.ts` (`de`: `draft`, `localized`, `latin`, «Deutsch», `de_DE`), `catalogs`, the docs' quotes („ “), empty site and editor catalogs, the editor's entry point (`exports`, tsdown, tsconfig, `api.md`, README, changeset), its page in `docs/i18n` |
| 3–4 | `feat(engine)` | the engine's catalog whole: the interface by id from the installed pack (`propose-interface.mjs --like it`), the command language from the console (`console-pair.mjs --select`, `probe.sh --lang de --lang-only`), `getcname` and the DEU help, the messages rebuilt as ICU; its entry point; `· de` in every coverage heading; `germanPrompts.test.ts`; the toggles and readouts from the German desktop |
| 2 | `feat(i18n)` | the site's catalog from the search texts, the editor's catalog by id, the six "Use" pages, the command notes and the exercises (Sonnet agents, one brief, each file read before the commit), the generated pages |
| 5 | — | nothing: latin, left to right; plurals as above |
| 6 | `feat(i18n)` | the gate, a production build (`●`), every language's landing first load before and after (Brotli q11; `/fr` is 508 bytes under 250 KiB: trim before `live` if one passes), screenshots for long words, QWERTZ, `live`; a model's reread; what names or counts the languages by hand (README, packages and guides, issue forms, `docs/i18n/README.md`, the launch kit, the landing's commands section); after the push, `gsc-prioritize.mjs`'s weight for `/de`, IndexNow, the directories' listings |

## Unverified

Until the console has run (phase 4): which of several table strings a prompt uses (221
`several`), the capitals of an `initget` the table does not hold (-OSNAP's three), U's name, and
the names the tables lack.

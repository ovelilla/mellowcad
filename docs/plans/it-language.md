# Italian (`it`) — plan

The second language after the pilot, through skill `add-language`, phase by phase, as French did
(`docs/plans/fr-language.md`, `docs/i18n/fr.md`): `it` from nothing to `live` at `/it`, with the
whole site — the editor, the six "Use" pages written by hand, the command pages' notes, the
exercises, the generated pages — and the command language of AutoCAD 2027 in Italian. Session 09
of the visibility plan (`docs/plans/seo/09-italiano.md`). What does not fit is fixed in the
system, never in the language.

## Progress

Each phase lands on `main` when it closes (skill `finish-feature`), so a session that resumes
starts from `main` and from the table below; its work in progress is on the branch
`worktree-it-language`.

| Phase | State |
| --- | --- |
| 0 | Done 11/11/2026: this plan; `runacc.sh`'s Italian banner |
| 1 | Next |

## 0. Research (11/11/2026)

### 1. AutoCAD and its language pack

- **`localized`.** Autodesk ships AutoCAD 2027 in Italian (culture `it-IT`, the only Italian one
  of the 14 in `CULTURES`): `Autodesk_AutoCAD_2027_Italian_Language_Pack.exe`, 245,713,912
  bytes, 2/3/2026, at `https://up1.autodesk.com/prd/2027/ACD/8ACE0847-5C30-3CEE-918A-DA8B974D1E4B/`
  (ceethreedee.com's post, now under `/cad-news/`). Signed by Autodesk, Inc. (Authenticode
  valid), as the `AutoCAD_2027.1_Update.exe` downloaded with it.
- **Installed on the owner's AutoCAD on 11/11/2026**, the owner asked first: the pack with `-q`,
  elevated, then the 2027.1 update again. `it-IT/acadres.dll` went from 26.0.60 to 26.0.116, as
  `fr-FR/` and `es-ES/`; `acad.exe` stays 26.0.118. `extract-strings.mjs --lang it` wrote the
  tables from the install (`all_it.tsv`, 11,093 ids, as every language's; `acad_it.pgp`).
- **The console** runs in Italian (`runacc.sh … it-IT`) once `runacc.sh` knows the banner's last
  line, «Caricamento delle utilità dei menu di AutoCAD avvenuto.», added.
- **Help:** `https://help.autodesk.com/cloudhelp/2027/ITA/AutoCAD-Core/files/GUID-….htm` answers
  with the English GUIDs (`GUID-0546E8D5-…` is «RACCORDASPIGOLO (comando)»).

### 2. `acad.pgp`

`research/strings/acad_it.pgp` (579 lines). The letters an English hand types without thinking
that run another command in Italian AutoCAD (each command's own name, as the tables propose it, is
checked in the console in phase 4):

| Alias | English    | Italian                                                       |
| ----- | ---------- | ------------------------------------------------------------- |
| `U`   | UNDO       | UNISCI (JOIN); undo is the keyword `A` (Annulla) in a command |
| `E`   | ERASE      | ESPLODI (EXPLODE); CANCELLA is `CA`, and `DELETE` stays       |
| `S`   | STRETCH    | SPOSTA (MOVE); STIRA is `STI`                                 |
| `CO`  | COPY       | COLORE (COLOR); COPIA is `CP`                                 |
| `SC`  | SCALE      | SPAZIOC (UCS); SCALA is `SS`                                  |
| `RE`  | REGEN      | TRATTEGGIO (HATCH); RIGEN is `RG`                             |
| `AR`  | ARRAY      | ARCO (ARC); SERIE is `SR`                                     |
| `MT`  | MTEXT      | MODTESTO (TEXTEDIT); TESTOM is `TSM`, `TSTM`, `MTEXT`         |
| `T`   | MTEXT      | TESTO (TEXT)                                                  |
| `SL`  | SLICE      | IMPOSTADIS (DSETTINGS); TRANCIA is `TC`                       |

And none at all for `A`, `RO`, `EX`, `O`, `M`, `TR`, `F`, `CHA`, `POL`, `X`, `BR`, `DT`, `LT`,
`LW`, `PU`, `MA`, `EXT`, `H`, `REC`, `I`, `W`, `J`, `G`, `AP`, `DO`, `PA`, `MO`. OFFSET keeps its
English name (`OF`); RUOTA is `RU`, TAGLIA `TA`, ESTENDI `ES`, RACCORDO `RA`, CIMA `CM`, SPECCHIO
`SP`, SPEZZA `SZ`, RETTANGOLO `RT`, INSER `IN`, ESTRUDI `EU`. Two names to keep apart: SLICE is
TRANCIA, SECTION is SEZIONE (`SEZ`).

### 3. The keywords' format

- **«o»** before the list (`Specificare punto successivo o [Annulla]:`, the console), deduced by
  `orWords` from the tables, with no list per language.
- **`initget`** like the other languages': the capital inside a word marks the letter (`Arco
  CHiudi Mezza-larghezza LUnghezza LInea ANnulla LArghezza _Arc Close …`, 21298); LINE's next
  point lists `[Annulla]` (`A`) in the console.
- **No space before a prompt's colon**, as English: `Comando:` (22843), `Specificare primo
  punto:`, `… o [Punto/Cancella/Layer] <Punto>: ` (22470).
- **Two words for one English keyword**, as the others: OFFSET's Through is `Punto` at both 22470
  and 21215; SNAP declares `ON OFf SNap Maggiore aDattiva …` (25920). U is `SOP` in 21134, `U` in
  45049 and `A` in 52855: the console settles which (names/p02).
- `propose-commands.mjs --lang it`: 1,393 proposed, 213 `several`, 139 `partial`, 39 `plural`, 8
  `select`, 497 `no-source`; `names` 126 (French's: 1,383, 217, 138, 39, 8, 476).

### 4. Fonts

`latin`: Italian needs à è é ì ò ù (and capitals), « » ’ – …, all in the subsets French checked
(Inter, Geist Mono, the share card's). Nothing to add, no budget spent.

### 5. Plurals

CLDR `it`: `one`, `many`, `other`; unlike French, **0 and 1.5 are `other`** (`i = 1 and v = 0` is
`one`), as English. `many` is for compact millions only, which no message prints.
`Intl.NumberFormat("it")` groups with a period from five digits (`1234`, `12.345`).

### 6. Length

On the same table ids, measured the same way for each: labels of up to 20 characters +26% in
total (median +18%, 90th percentile +71%), prompts +26%; French +30%, +21%, +80%, +26%; Spanish
+29%, +20%, +78%, +17%. Italian runs a little shorter than French: the screenshots of phase 6
check the palette rows, the status bar and the chips as French's did.

### 7. Input

Italian QWERTY (Italy; Swiss Italian on QWERTZ): letters and digits in place, so Ctrl shortcuts
need nothing; à è é ì ò ù are keys of their own, with no dead keys. Checked in the command line
and the dynamic input in phase 6 (skill `browser-verify`).

### Search texts

Google's suggestions (`hl=it`, `gl=it`), Bing's keyword research (three months, worldwide) and
Google Trends (Italy, 12 months), 11/11/2026; files in `~/seo-data/raw-2026-11-11/it-keywords/`.

- **The generic term is CAD**, as in English and Spanish (no CAO). Trends, one comparison:
  «autocad gratis» 36, «cad online» 32, «autocad online» 23, «comandi autocad» 12, «programma cad
  gratis» 0; «cad online gratis», «software cad gratis», «autocad online gratis», «disegno cad
  online» about 1. Bing: «autocad online» 23.4K and «autocad gratis» 7.5K, worldwide and shared
  with Spanish; every Italian-only query below its threshold. Suggested: «cad online gratis
  italiano», «disegno cad online gratis», «software cad online gratis», «programma cad gratis
  italiano», «disegno tecnico online gratis (senza download)», «alternativa autocad gratis».
  KulmanLab is #1 for «cad online gratis» (the audit, 5/11).
- **The home:** main query «CAD online gratis», then «programma CAD gratis», «senza
  installazione», «disegno tecnico online» and «i comandi di AutoCAD in italiano». «AutoCAD online
  gratis» is never written, as it reads as AutoCAD itself.
- **The command list:** «comandi autocad» (and «… pdf», «… in italiano», «… tastiera»),
  «comandi autocad inglese italiano (pdf)», «traduzione comandi autocad inglese italiano»: the
  bilingual list is the search. Title from «Comandi AutoCAD in italiano e inglese».
- **A command:** «comando offset autocad», «comando taglia autocad (inglese)»: the Italian name
  and the English one, both in the title, as in Spanish and French.
- **Practice:** «esercizi autocad» (Trends 0 against «comandi autocad» 24, but suggested with
  «2d», «per principianti», «pdf», «meccanica», «pezzi meccanici»): «Esercizi AutoCAD».
- **DXF:** «file dxf» is the largest in Trends (53 against «autocad online» 48); «aprire file dxf
  (online, gratis, senza autocad)», «visualizzatore dxf online gratis», «file dxf catasto» (the
  land registry's DXF files, an Italian need).
- **The guides:** «disegnare pianta casa online»; «coordinate polari autocad».

### Decisions

- **Tag `it`, URL `/it`**, `og:locale` `it_IT`, «Italiano» in the selector: one Italian (Italy,
  Switzerland, San Marino), as AutoCAD has one (`it-IT`). No prefix map entry.
- **Register** (phase 2, from Autodesk's ITA help and the pack): the editor labels as Italian
  AutoCAD does; the landing addresses the reader with the informal imperative, as Italian software
  sites do («Digita L. Premi Invio. Disegna.»), Autodesk's «Invio» for the key.
- **Typography:** « » without inner spaces, the Italian practice, and no space before `: ; ! ?`;
  what is copied from AutoCAD keeps its own spacing.
- **Order of the phases as French's**: 0, 1, 3–4, 2, 5, 6 (the command notes name each command in
  Italian: `Comando OFFSET`, `Comando TAGLIA (TRIM)`).

## Phases

| Phase | Commit | What it touches |
| --- | --- | --- |
| 0 | `docs` | `runacc.sh`'s Italian banner; this plan |
| 1 | `feat(i18n)` | `routing.ts` (`it`: `draft`, `localized`, `latin`, «Italiano», `it_IT`), `catalogs`, the docs' quotes, empty site and editor catalogs, the editor's entry point (`exports`, tsdown, tsconfig, `api.md`, README, changeset), its page in docs/i18n |
| 3–4 | `feat(engine)` | the engine's catalog whole: the interface by id from the installed pack (`propose-interface.mjs`), the command language from the console (`console-pair.mjs --select`, `probe.sh --lang it --lang-only`), `getcname` and the ITA help, the messages rebuilt as ICU; its entry point; `· it` in every coverage heading |
| 2 | `feat(i18n)` | the site's catalog from the search texts, the editor's catalog by id, the six "Use" pages, the command notes and the exercises (Sonnet agents, one brief, each file read before the commit), the generated pages |
| 5 | — | nothing: latin, left to right; plurals as above |
| 6 | `feat(i18n)` | the gate, a production build (`●`), every language's landing first load before and after (Brotli q11; `/fr` is 130 bytes under 250 KiB: trim before `live` if one passes), screenshots, `live`; the drafting toggles' lines and the cursor's readouts from the Italian desktop (the owner's mouse); what each command words where English shares (`several`); a model's reread; what names or counts the languages by hand (README, packages and guides, issue forms, `docs/i18n/README.md`, the launch kit, the landing's commands section); after the push, `gsc-prioritize.mjs`'s weight for `/it`, IndexNow, Bing, the directories' listings |

## Unverified

Until the console has run (phase 4): which of several table strings a prompt uses (213
`several`), the capitals of an `initget` the table does not hold (-OSNAP's three), U's name, and
the names the tables lack.

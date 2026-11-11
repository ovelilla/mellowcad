# Italian (`it`)

> **Command language:** `localized`, Italian AutoCAD's. **Status:** `draft` since 11/11/2026, at
> `/it`: every catalog whole, the "Use" pages, the command notes and the exercises written; not yet
> `live` (phase 6). **Review:** none by a
> native speaker. The plan and what is left: `docs/plans/it-language.md`.

The words are Autodesk's own Italian localization of AutoCAD, never a translation of ours, as
Spanish's, pt-BR's and French's are. One Italian for every Italian reader — Italy, Switzerland,
San Marino — as AutoCAD has one (`it-IT`).

## Sources

- **Language pack.** Autodesk ships AutoCAD 2027 in Italian (culture `it-IT`, the only Italian one
  of the 14 in `CULTURES`): `Autodesk_AutoCAD_2027_Italian_Language_Pack.exe`, 245,713,912 bytes,
  2/3/2026, at `https://up1.autodesk.com/prd/2027/ACD/8ACE0847-5C30-3CEE-918A-DA8B974D1E4B/`
  (ceethreedee.com's "Civil 3D 2027 Download all the extensions", under `/cad-news/`), signed by
  Autodesk, Inc.
- **Installed on the owner's AutoCAD on 11/11/2026**: the pack with `-q`, elevated, then
  `AutoCAD_2027.1_Update.exe` again, so `it-IT/acadres.dll` is 26.0.116 (2027.1), as `es-ES/`,
  `pt-BR/` and `fr-FR/`, and `acad.exe` 26.0.118. The tables come from the install
  (`extract-strings.mjs --lang it`: `all_it.tsv`, 11,093 ids, as every language's; `acad_it.pgp`).
- **Help.** `https://help.autodesk.com/cloudhelp/2027/ITA/AutoCAD-Core/files/GUID-<id>.htm`
  answers with the English GUIDs (`GUID-0546E8D5-…` is «RACCORDASPIGOLO (comando)»). Search in
  English (the help MCP), read in `ITA`.
- **Console:** `runacc.sh … it-IT` and `probe.sh --lang it` (the banner's last line, «Caricamento
  delle utilità dei menu di AutoCAD avvenuto.», is in no table). **Desktop:** `acad.exe /language
  it-IT`.

## Register

- **Landing:** the informal imperative, as Italian software sites address their readers, short
  sentences («Digita L. Premi Invio. Disegna.»), Autodesk's «Invio» for the key.
- **Editor:** Autodesk's register, its labels as Italian AutoCAD words them.
- **Typography:** « » with no inner space, the Italian practice, and no space before `: ; ! ?`;
  what is copied from AutoCAD keeps its own spacing (`Comando:`).

## Search texts

Google's suggestions in Italian (`hl=it`, `gl=it`), the visibility audit's (5/11) and session
09's (11/11); Bing's keyword research (three months, worldwide, 11/11); Google Trends (Italy, 12
months, 11/11). The data is in `~/seo-data/raw-2026-11-11/it-keywords/`, outside the repository.

- **The generic term is CAD**, as in English and Spanish. Trends, one comparison: «autocad gratis»
  36, «cad online» 32, «autocad online» 23, «comandi autocad» 12, «programma cad gratis» 0; «cad
  online gratis», «software cad gratis», «autocad online gratis», «disegno cad online» about 1.
  Bing: «autocad online» 23.4K and «autocad gratis» 7.5K, worldwide and shared with Spanish; every
  Italian-only query below its threshold. Suggested: «cad online gratis italiano», «disegno cad
  online gratis», «software cad online gratis», «programma cad gratis italiano», «disegno tecnico
  online gratis (senza download)», «alternativa autocad gratis». KulmanLab is #1 for «cad online
  gratis» (the audit).
- **The home:** the main query is «CAD online gratis», then «programma CAD gratis», «senza
  installazione», «disegno tecnico online» and «i comandi di AutoCAD in italiano». «AutoCAD online
  gratis» is never written, as it would read as AutoCAD itself.
- **The command list:** «comandi autocad» (and «… pdf», «… in italiano», «… tastiera»),
  «comandi autocad inglese italiano (pdf)», «traduzione comandi autocad inglese italiano»: the
  bilingual list is the search.
- **A command:** «comando offset autocad», «comando taglia autocad (inglese)»: the Italian name
  and the English one, both in the title.
- **Practice:** «esercizi autocad», with «2d», «per principianti», «pdf», «meccanica», «pezzi
  meccanici» (Trends 0 against «comandi autocad» 24).
- **DXF:** «file dxf» is the largest in Trends (53 against «autocad online» 48); «aprire file dxf
  (online, gratis, senza autocad)», «visualizzatore dxf online gratis», «file dxf catasto» (the
  land registry's DXF files).
- **The guides:** «disegnare pianta casa online»; «coordinate polari autocad».

## Command language

### `acad.pgp`

`research/strings/acad_it.pgp` (579 lines). Letters that run another command than in English,
among the ones an English hand types without thinking:

| Alias | English    | Italian                                                       |
| ----- | ---------- | ------------------------------------------------------------- |
| `U`   | UNDO       | UNISCI (JOIN); undo is the keyword `A` (Annulla) in a command |
| `E`   | ERASE      | ESPLODI (EXPLODE); CANCELLA is `CA`, and `DELETE` stays       |
| `S`   | STRETCH    | SPOSTA (MOVE); STIRA is `STI`                                 |
| `CO`  | COPY       | COLORE (COLOR); COPIA is `CP`                                 |
| `SC`  | SCALE      | SPAZIOC (PSPACE); SCALA is `SS`                               |
| `RE`  | REGEN      | TRATTEGGIO (HATCH); RIGEN is `RG`                             |
| `AR`  | ARRAY      | ARCO (ARC); SERIE is `SR`                                     |
| `MT`  | MTEXT      | MODTESTO (TEXTEDIT); TESTOM is `TSM`, `TSTM`, `MTEXT`         |
| `T`   | MTEXT      | TESTO (TEXT)                                                  |
| `SL`  | SLICE      | IMPOSTADIS (DSETTINGS); TRANCIA is `TC`                       |

And none at all for `A`, `RO`, `EX`, `O`, `M`, `TR`, `F`, `CHA`, `POL`, `X`, `BR`, `DT`, `LT`,
`LW`, `PU`, `MA`, `EXT`, `H`, `REC`, `I`, `W`, `J`, `G`, `AP`, `DO`, `PA`, `MO`: in Italian
AutoCAD they are unknown commands, as they will be here. OFFSET keeps its English name (`OF`);
RUOTA is `RU`, TAGLIA `TA`, ESTENDI `ES`, RACCORDO `RA`, CIMA `CM`, SPECCHIO `SP`, SPEZZA `SZ`,
RETTANGOLO `RT`, INSER `IN`, ESTRUDI `EU`. Two names to keep apart: SLICE is TRANCIA, SECTION is
SEZIONE (`SEZ`). `LAYER` and `PROPRIETA` keep `LA` and `PR`, as English.

### The keywords' format

- **«o»** before the list (`Specificare punto successivo o [Annulla]:`, the console), deduced by
  `orWords` from the tables, with no list per language.
- **`initget`** like the other languages': the capital inside a word marks the letter (`Arco
  CHiudi Mezza-larghezza LUnghezza LInea ANnulla LArghezza _Arc Close …`, 21298); LINE's next
  point lists `[Annulla]` (`A`) in the console.
- **No space before a prompt's colon**, as English: `Comando:` (22843), `Specificare primo
  punto:`, `… o [Punto/Cancella/Layer] <Punto>: ` (22470).
- **Two words for one English keyword**, as the others: OFFSET's Through is `Punto` at both 22470
  and 21215; SNAP declares `ON OFf SNap Maggiore aDattiva …` (25920). U is `SOP` in 21134, `U` in
  45049 and `A` in 52855: the console settles which.
- `propose-commands.mjs --lang it` (11/11/2026): 1,393 proposed, 213 `several`, 139 `partial`, 39
  `plural`, 8 `select`, 497 `no-source`; `names` 126 (French's: 1,383, 217, 138, 39, 8, 476).

## Interface terms

From the installed pack by id against `en-US/` (`propose-interface.mjs --lang it --like fr`,
11/11/2026): `P <dll> <id>` a string table, `D <dll> <dialog>:<control>` a dialog's label, `N
<assembly> <key>` a .NET resource, `X <uid>` an element of `UserDataCache/it-it/Support/acad.CUIX`.
The engine's `interface` (456 words, `linetype` and `hatchPattern` being drawing data): 230 settled
by one wording or as French's ids, 136 by the row's place (a palette row takes `ax26res`'s word, a
tool the ribbon's: `Interrompi` and `Raccorda` on the rail, as the ribbon says them), the rest ours,
below. The editor's catalog (phase 2): 100 of 267 by id, 68 by place, 96 ours. Italian AutoCAD
leaves the Layer Properties Manager's On and Off in English (`N AcLayer On`), and so does this.

| Area | English | Italian | Source | Verified |
| --- | --- | --- | --- | --- |
| Tools | Diameter circle, 2-Point circle, 3-Point circle; Start, Center, End arc; Center ellipse | Cerchio centro, diametro; Cerchio 2 punti; Cerchio 3 punti; Arco inizio, centro, fine; Ellisse centro | ours, worded from the ribbon's options (`ID_RBN_0128`, `0130`, `0094`, `0113`, `ELLIPSECE`) | — |
|  | Attribute display, Change properties, Pan by points, Multiple redo | Visibilità attributi, Modifica proprietà, Pan per punti, Ripeti multiplo | ours, from the neighbouring tables' words | — |
| Descriptions | The tools' descriptions | «Ripristina l'ultima operazione annullata»… | ours, in the style of the cuix tooltips (ACAD_1559, 1561, 1604) | — |
| Palette | Normal X, Major axis vector X, Text alignment X, First X, Definition points (our own rows) | Normale X, Vettore asse maggiore X, Allineamento testo X, Primo X, Punti di definizione | ours, worded from the palette's | — |
| Objects | Plural entity names | Linea/Linee, Ellisse/Ellissi, Riferimento di blocco/Riferimenti di blocco… | the tables' singulars, plurals ours | — |
| ViewCube | The cube's faces | ALTO, BASSO, FRONTE, INDIETRO, SINISTRA, DESTRA | P AcVMToolsRes 629–634 (the cube's own table, in capitals) | no: the desktop draws them |
| Editor | The layer dialogs, the ViewCube's rotate arrows, the status bar's snap and polar settings, the command line's placeholder | «Layer - Non eliminato», «Ruota in senso orario», «Snap polare», «Digitare un comando (LINEA, TA, CP…)» | ours, in Autodesk's impersonal style (AcTaskDialogs is BAML, not read) | — |

## The command language, how it was set

- **The console**, 420 of the 440 probes `console-pair.mjs --lang it --select` picked (the other
  20 are English-only probes), run in it-IT on 11/11/2026: 518 keys match the tables, 289 differ
  and take the console's wording, 175 are worded more than one way (below), 58 unpaired, 284
  unseen. What the console prints is a line with its values filled in: the messages were rebuilt
  as ICU with English's arguments.
- **Names** by `getcname` (names/p01: `U` is `A`, `RECTANG` nil, `MATCHPROP` nil), the tables
  (`PIANA`, 52752), `acad.pgp`'s targets (`CORRISPROP`, `PROPRIETA`, `UNITA`) and the ITA help's
  titles (`TAVOLOZZABLOCCHI`). An alias that is another command's name is dropped:
  `DIMORIZZONTALE`, `DIMRUOTATO` and `DIMVERTICALE` are `acad.pgp` aliases of DIMLINEARE and the
  names of their own commands; `DXFIN` one of APRI. Our own commands take the base name and the
  ribbon's initials, as French's: `CERCHIOD`, `CERCHIO2P`, `CERCHIO3P`, `ARCICF` (Inizio, centro,
  fine), `ARCCIF`, `ELLISSEC`, `ELLISSEARCO`.
- **Probes of our own** (`scripts/research/probes/names/`, `.it.txt`): -OSNAP's words (p07, p33:
  `FIN` Endpoint and not `FINE`, `MED`, `CEN`, `QUA`, `INT`, `INS`, `PER`, `TAN`, `VIC` Nearest,
  `APP` Apparent, `EST` Extension, `PAR`, `NOD`, `NES` and `OFF` none; listed as `Fine,Cen,…`; `?`
  refused), single letters refused at a point prompt with `Punto non valido.` (p09), DA (p03:
  `Punto base:`, `<Offset>:`), a typed snap's echo (p31: `di` after FIN and MED, `a` after PER and
  TAN; not found: «Nessun(o/a) Finale trovato(a) per punto specificato.»), -DIMSTYLE's status and
  -STYLE's listing (p06, p32).
- **The -OSNAP words** follow Spanish's form (`FINal`, `MEDio`): `FINe`, `MEDio`, `CENtro`,
  `QUAdrante`, `INTersezione`, `ESTensione`, `INSerimento`, `PERpendicolare`, `TANgente`,
  `VICino`, `APParente`, `PARallelo`, `NESsuno`, `OFF`: the console lists the modes by their short
  forms only.
- **The tables**, `propose-commands.mjs`, where no probe shows a key.

### Per command

What English words alike and Italian words per command or per state needs a prompt id of its own
(`cad-catalogs.md`); until then one command's wording stands:

- **SPLINEDIT** declares its keywords per prompt and state: Exit is `eSci` at the main prompt and
  `ESci` at the fit data and vertex prompts, Delete `CAncella` beside Close and `Cancella` beside
  Open. The fit data prompt words its own (`promptKeywords.enterFitDataOption`: `AGgiungi`,
  `APri`, `CAncella`, `TAngenti`, a pair that never shares a letter in either state); Exit is
  `ESci` everywhere, its hidden `X` still `S`, as the vertex prompt is PEDIT's too
  (`enterVertexEditingOption`, whose `X` is `E`).
- **ARRAYRECT and ARRAYPOLAR** share `selectGripToEditArrayOr`, which Italian ends `Esci]<Esci>:`
  for one and `ESci] <ESci>:` for the other: ARRAYRECT's stands.
- `enterAnOption` is `Immettere un'opzione` at UCS and `Digitare un'opzione` at -LINETYPE, PLAN
  and UNDO: `Digitare` stands.
- **Copied as Italian prints them**: `noUnusedBlocks` («nessun blocchi»), `regionObjectsRejected`
  («non non valido»), `specifyIncrementingElevationBetweenRows` («trarighe»), and the untranslated
  «Error Code Number is» of `modelingErrorCode`.

### Unverified

No probe shows these; each is worded from its neighbours and stays so until one does:

- **The desktop's** (phase 6, the owner's mouse): the drafting toggles' lines (`snapMode`,
  `orthoMode`, `polarMode`, `otrackMode`, `gridMode`), the cursor's readouts (`feedback.measure*`),
  the ViewCube's faces.
- **Ours in every language**: the file, DXF and clipboard messages, the history's steps for what
  the chrome does (`menuStep`, `viewCubeStep`…), DA's own messages (`fromNeedsPoint`), our own
  commands' names and their Center keyword (`ARCSCE`).
- **Not probed**: `format.cartesian`, `format.polar`, `format.optionValue`; the prompts
  `definitionTag`, `definitionPrompt`, `styleName`, `firstDistance`, `secondDistance`,
  `selectBlockReference`, `selectABlock`; six answer forms; PURGE's `Blocchi`, FILLETEDGE's
  `eSci`, HATCH's `Solido`, MTEXT's `Almeno`; LIST's lines for cones, rotated dimensions and
  arrays.

The list by key is the session's, outside git (research/proposals), and
`italianPrompts.test.ts` holds what the console printed.

## The site's words

`messages/it.json`, the "Use" pages, the 97 command notes and the 12 exercises (11/11/2026, six
agents on one brief, each file then read by `docs:check` against its English's options, questions
and elements): the landing's title is «CAD online gratis con i comandi di AutoCAD», its
description carries «programma CAD gratis», «senza installazione», «disegno tecnico online» and «i
comandi di AutoCAD in italiano»; the command list is «Comandi AutoCAD in italiano e inglese», a
command's page «Comando TAGLIA (TRIM) in AutoCAD», an exercise's «Esercizio AutoCAD …». The site
calls its docs «Documentazione», as Spanish and French do (`Guide` would be the how-to guides').
The landing's strings run shorter than French's (14,327 characters against 15,161).

Dialog titles from the pack's dialog resources (`dialogs.mjs`, `:title`): «Gestione stili di
quota» (AcDimRes 701), «Gestione tipo di linea» (acadres 244), «Impostazioni spessore linea»
(acadres 2500), «Stile di testo» (acadres 515), «Unità disegno» (unitsRes 500), «Editor attributi
avanzato» (AcEAtteditRes 101); «Gestore proprietà layer» and «Definizione blocco» from
`acad.CUIX`. Mechanical terms in the exercises are ours: «mozzo» (boss), «cava per chiavetta»,
«circonferenza di foratura», «biella», «pedata».

## Script and font

`latin`. Italian needs à è é ì ò ù and their capitals, « » ’ – …, all in Inter's and Geist Mono's
subsets, the share card's included (`fr.md`, "Script and font"): nothing to add, no budget spent.

## Plurals

CLDR `it`: `one`, `many`, `other`; unlike French, **0 and 1.5 are `other`** (`i = 1 and v = 0` is
`one`), as English. `many` is for compact millions only, which no message prints.
`Intl.NumberFormat("it")` groups with a period from five digits (`1234`, `12.345`).

## Length

On the same table ids, measured the same way for each: labels of up to 20 characters +26% in
total (median +18%, 90th percentile +71%), prompts +26%; French +30%, +21%, +80%, +26%; Spanish
+29%, +20%, +78%, +17%. Italian runs a little shorter than French.

## Input

Italian QWERTY (Italy; Swiss Italian on QWERTZ): letters and digits in place, so the Ctrl
shortcuts need nothing; à è é ì ò ù are keys of their own, with no dead keys. To check in the
command line and the dynamic input before going live.

## Review

No native reader; nothing written yet beyond this page.

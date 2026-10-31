# Language review, 31/10/2026

> **Status:** done, 31/10/2026, in one session — skill `language-review` over `pt-BR` and `es`
> (both `localized`), and `ar` (`global`) where no native reader is needed. §3 and §6 were done on
> 31/10/2026 when `pt-BR` went live (`e363aba1`) and were not repeated: nothing changed the
> layout or the build since. What stays open is on each language's page.

## §0 Baseline

- **AutoCAD:** `_VERNUM` is `X.118.0.0` in the three consoles; `acad.exe` and
  `accoreconsole.exe` are 26.0.118 (since 19/10), `en-US/acadres.dll` 26.0.118 (31/10, when the
  pt-BR pack went in and the update was applied again), `es-ES/` and `pt-BR/acadres.dll` 26.0.116
  (2027.1). `extract-strings.mjs --lang en|es|pt-BR` wrote every table byte for byte as it was
  (it refuses a table that changed): 26.0.118 rewords nothing. `pt-BR.md` records 2027.1
  (26.0.116); `es.md` records no build and still speaks of AutoCAD 2026.
- **Tree:** another session's MellowProbe and the solids' probes; no
  catalog touched by it. `typecheck` and the i18n tests green (12 files, 125 tests).
- **§2:** `i18n/freshness.test.ts` lists nothing.

## §4 Inventory

The sources, in this order: the console (`research/console/<tag>.md`, `console-pair.mjs`, and
new probes under `scripts/research/probes/names/`), the tables (`research/strings/`, the installed
`es-ES/` and `pt-BR/` resource DLLs by id against `en-US/`, `acad.cuix` of `UserDataCache/es-es`
and `pt-br`, the installed `acad.pgp`), the desktop, the help in `ESP`/`PTB`. The dynamic input's
labels and `feedback.measure*` are ours: not pursued.

| Id | Language | What | Source to try |
| --- | --- | --- | --- |
| A1 | es | Ten aliases marked † in coverage headings (`ACOLIN`, `DIMLIN`, `ACOALI`, `ACOLINE`, `ACOCONT`, `ACORAD`, `ACODIA`, `ACOANG`, `PL`, `EL`, `U`) and `FC`, `EC` in `es.md` | installed `acad_es.pgp` (found: all thirteen) |
| A2 | es | Four keys the Spanish console words otherwise (`console-pair.mjs --lang es`, 68 `differs`, the rest padding or plurals): `dimensionTextAngle`, `specifyEndPointOfArcCtrl`, `invalidBlockName`, `listLwThickness` | the console, then the tables by id |
| A3 | es | 26 interface rows **no**/**partial** (palette rows, dialogs, menus, view and ViewCube) | `es-ES` DLLs (`ax26res`, `acappres`, `AcDimRes`, `dwgaidsRes`, `AcVMToolsRes`, `unitsRes`, `AcLayer`, `AcTaskDialogs`) and es-es `acad.cuix`, by id against English |
| A4 | es | The "Command language" section's **Unverified** lists (prompts, messages, palette rows, the edge-on message, U's names) and its 2026 sources | the console report's states per key, `catalog-sweep.mjs`, probes where unseen |
| A5 | es | Coverage's language marks: `Segundo`/`Segundopto`, "no Spanish console" (command-line.md), `ACOESTIL` and `ESTILO` as U's names, the dimension palette's Spanish rows, `Alineación de texto X`, `Altura de texto`, `Posición X`, `Escala X`, `Unidades para escalar el contenido insertado:`, CHAMFER's 3D polyline refusal, LINEWEIGHT, `Modify Property`, `'.-CAPA` | console and tables as above |
| B1 | pt-BR | Ten interface rows **no**/**partial** (tool names, attribute display, the cube's faces, compass and tooltips, Ponto de vista, List, Change properties, our palette groups, layer states, the decimal-separator combo) | `pt-BR` DLLs and pt-br `acad.cuix`, by id |
| B2 | pt-BR | "Unverified": the keys `research/console/pt-BR.md` still reports `unseen` or `unpaired` | the report run again, the tables, probes where it pays |
| C1 | ar | Review section: what changed in its catalogs since 01/10, where a native reader starts | `git log`, the page's † terms |
| C2 | pt-BR | Review section, and the status lines' build | this review |

## Execution

One commit per language where they separate (`fix(i18n): …` with catalog changes, `docs: …` for
pages alone), this plan's outcome table filled as each lands.

| Id | Outcome | Commit |
| --- | --- | --- |
| A1 | All thirteen are the installed `acad.pgp`'s; the † dropped from `es.md` and the coverage headings | `fix(i18n)` es |
| A2 | No finding: the pairer groups keys by their English, so INSERT's `invalidBlockName` met -BLOCK's, ARC's centre-mode end (8423) met Continue's (405), LIST's polyline thickness met the header's, and CHAMFER's double space is in the traced `Message`. `prompts.dimensionTextAngle` is a key no tool reads (the tools use `specifyAngleOfDimensionText`); removing it is a major, left | — |
| A3 | Settled by id: 22 rows **no**/**partial** to **yes**. Corrected: the palette's `Cota diamétrica`, `Factor`/`Distancia`/`Estilo de espacio de línea`, `Mínimo`, `Área acumulada`, `Verificar`, `Prestablecer`, `Incremento de elevación de fila`, `Incluye el ángulo de eje`, `Ext de línea de extensión`, `Desfase de línea de extensión`, `Posición de texto X/Y`, `Escala de cota general`, `Suprimir ceros a la derecha`, `No hay selección`; the tools' `Visualizar atributos`, `Partir en un punto`; `Línea de comando`, `Color de objeto`, `Distancia resolución X/Y`, `Unidades de escala del contenido insertado:`, `'.' (Periodo)`. The cube's INFERIOR, POSTERIOR, DERECHA from the Spanish desktop (names/e01). Open: the cube's tooltips (the mouse), the layer dialogs' `Capa` | `fix(i18n)` es |
| A4 | The 2027 console settles every prompt and message the section listed as worded in Autodesk's style but POLYGON's `Tipo`, TEXTOM's unsaved-changes dialog, Jointype's `<Ambos>`, block and dimension style not found, `Capa{n}` and our own file, clipboard and FROM words; names/p11–p23 run in `es-ES` | `fix(i18n)` es |
| A5 | Settled: `Segundo`/`Segundopto`, the snap names at POL's arc prompt, the dimension palette's rows, `Alineación de texto X`, `Altura de texto`, `Posición X`, `Escala X`, the units dialog, CHAMFER's 3D polyline refusal, `Vista personalizada`, `LINEWEIGHT` (added: `acad.pgp`'s alias of GROSORLIN, names/p24). Open: U's `ACOESTIL`/`ESTILO` after the dialogs, `'.-CAPA`, `Modify Property` (the desktop's mouse) | `fix(i18n)` es |
| B1 | Corrected `Exibir atributo`, `Lista`, `Deslocar a partir da linha de cota` (the dialog by control id); settled the separator combo (acdb26res 6150–6152), `Ponto de vista`; our own tool names and groups marked —. Open: the cube's faces and compass, its tooltips (the pt-BR desktop, asked first), the layers' gender | `fix(i18n)` pt-BR |
| B2 | The report run again: 603 match, 36 differs, none a wording (values, plurals, the documented `Especificar a distância entre linhas`); `unseen` keys stay as the page says | — |
| C1 | `ar.md`'s Review: the † terms, then the 154 + 79 keys written since 01/10 | `docs` |
| C2 | `pt-BR.md`'s status lines and Review | `fix(i18n)` pt-BR |

# Dimensions

### `DIMLINEAR` / `DIMLIN` / `DLI` · es `ACOLINEAL` / `ACOLIN`† / `DIMLIN`†

**Implemented:** the prompts AutoCAD 2023's console asks, written answered:
`Specify first extension line origin or <select object>:` (Enter: `Select object to dimension:`,
`No object selected.` on nothing), `Specify second extension line origin:`,
`Non-associative dimension created.` (origins given as points; no dimension is associative here),
`Specify dimension line location or [Text/Angle/Horizontal/Vertical/Rotated]:` (`[Text/Angle]` once
Horizontal or Vertical is set, through Text and Angle too; after Rotated the whole list again;
DIMALIGNED's `[Text/Angle]` throughout), Text's `Enter dimension text <100.00>:`, Angle's
`Specify angle of dimension text:`, Rotated's `Specify angle of dimension line <0.00>:`, then
`Dimension text = 100.00`; refusals `Invalid point input.`, `Invalid Input.`, `*Invalid selection*`
/ `Expects a single object.`; es from Autodesk's dimension table
(`Especifique el origen de la primera línea de referencia o <designar objeto>`,
`Especifique una ubicación de línea de cota o`, `Designe ángulo de texto de cota`,
`Texto de cota = `); Text, Angle, Horizontal, Vertical, Rotated, object selection (line/arc
endpoints, circle diameter, nearest polyline segment), H/V inferred from drag, DIMEXO/DIMEXE offsets

**Missing:** Mtext (a dimension's text is one line); AutoCAD breaks the location prompt after its
`or`, written here on one line

### `DIMALIGNED` / `DAL` · es `ACOALINEADA` / `ACOALI`†

**Implemented:** DIMLINEAR's prompts with `[Text/Angle]` (es `Precise ángulo de texto de cota`: the
table words DIMALIGNED's Angle otherwise); Text, Angle, object selection

**Missing:** Mtext (a dimension's text is one line)

### `DIMBASELINE` / `DBA` · es `ACOLINEABASE` / `ACOLINE`†

**Implemented:** `Specify second extension line origin or [Select/Undo] <Select>:` (Undo offered
with nothing to undo too, as AutoCAD's), `Dimension text = …` after each, `Select base dimension:`
(`No object selected.`; `Expects a point or Last`), a pick or `Last` (the chain grows from the
extension line nearer the WCS origin, as AutoCAD 2023's console does; not a dimension it chains,
`Linear, ordinate, or angular associative dimension required.`, es
`Requiere una cota asociativa lineal, de coordenada o angular.`); es
`Especifique un origen de la segunda línea de referencia o [Designar/desHacer] <Designar>`,
`Designe cota base`; Select, Undo, chains from the first extension-line origin, DIMDLI spacing,
inherits kind/rotation/style and layer (DIMCONTINUEMODE 1) and takes the current colour, linetype
and lineweight

**Missing:** DIMASSOC associativity (id-stability cost, deferred), ordinate chaining, angular
chaining

### `DIMCONTINUE` / `DCO` · es `ACOCONTINUA` / `ACOCONT`†

**Implemented:** DIMBASELINE's prompts, its own `Select continued dimension:` (es
`Designe cota continua`); Select, Undo, chains from the second extension-line origin, DIMDLI
spacing, inherits kind/rotation/style and layer (DIMCONTINUEMODE 1) and takes the current colour,
linetype and lineweight

**Missing:** DIMASSOC associativity (deferred), ordinate chaining, angular chaining

### `DIMSPACE` · es `ACOESPAC`

**Implemented:** `Select base dimension:` (es `Designar cota base`) — a pick or `Last`
(`Selected object is not a dimension.`, es `El objeto designado no es una cota.`;
`No object selected.`; a point typed there picks, erase/p221, p256) —,
`Select dimensions to space:` with MOVE's counts (es `Designe cotas para intervalo`), finding every
dimension, one at an angle to the base too, which spacing leaves where it is, and saying `0 found`
for what is no dimension, which starts the total (`0 found, 0 total`, erase/p221, p244, p256),
`Enter value or [Auto] <Auto>:` (es
`Indique valor o [Auto] <Auto>`; a negative one
`Invalid spacing value, spacing value cannot be negative.`); Select base dimension, select
dimensions to space, numeric value, Auto (2×DIMTXT, DIMSCALE-aware), 0 = line up, per-side ranking,
linear + aligned

**Missing:** angular dimensions, "if necessary" collision-only respacing (always respaces, by
design)

### `DIMRADIUS` / `DIMRAD` / `DRA` · es `ACORADIO` / `ACORAD`†

**Implemented:** `Select arc or circle:` (es `Designe un arco o un círculo`;
`Expects a single object.`), `Specify dimension line location or [Text/Angle]:`, then
`Dimension text = 10.00`; Text, Angle, arc/circle/polyline-arc-segment selection, DIMCEN centre
mark, direction from the picked location

**Missing:** Mtext, extension beyond the arc sweep (clamped to the sweep), DIMCEN negative
centrelines; **unverified**: es of the location prompt (the table has two wordings;
`Especifique una ubicación de línea de cota o` here)

### `DIMDIAMETER` / `DIMDIA` / `DDI` · es `ACODIAMETRO` / `ACODIA`†

**Implemented:** DIMRADIUS's prompts; Text, Angle, Ø symbol, centre mark, opposite-side stub with
arrowhead

**Missing:** Mtext, leader landing segment (needs text measurement), DIMTOFL/DIMATFIT, DIMCEN
negative centrelines; **unverified**: es of the location prompt, as DIMRADIUS's

### `DIMANGULAR` / `DIMANG` / `DAN` · es `ACOANGULO` / `ACOANGULAR` / `ACOANG`†

**Implemented:** `Select arc, circle, line, or <specify vertex>:` (es
`Designe arco, círculo, línea o <designar vértice>`), `Select second line:`, Enter's
`Specify angle vertex:`, `Specify first angle endpoint:`, `Specify second angle endpoint:` (es
`Designe vértice del ángulo`,
`Designe primer punto final del ángulo`, `Designe segundo punto final del ángulo` — the 2027
console's words since its update; the release's language pack said `primer extremo`) and
`Non-associative dimension created.`, `Specify dimension arc line location or [Text/Angle]:` (es
`Designe ubicación del arco de línea de cota o`), then `Dimension text = 90°`; arc, circle, line
pair and three-point vertex forms; Text, Angle; reflex angle chosen by location; <180° for a line
pair; DIMADEC formatting

**Missing:** Quadrant (deferred), DIMAUNIT, chaining and spacing (see DIMBASELINE/DIMSPACE)

### `DIMSTYLE` · es `ACOESTIL` / `ACES`† / `ACOEST`† / `AES`†

**Implemented:** style manager, set current, New with Start-With copy and auto-name, rename, delete
guarded against in-use/current, edit Lines/Symbols and Arrows/Text/Fit/Primary Units, assign per
selection

**Missing:** Override, Compare, "Use For" sub-styles, Description, All/In-use filter

### `STYLE` · es `ESTILO` / `EST`†

**Implemented:** text-style manager, set current, assign per selection, delete guarded against
in-use/current; every style draws in Arial (Standard's font), measured from its advance widths

**Missing:** font choice, width factor, oblique angle, DIMTXSTY interaction with DIMTXT; a machine
with no Arial-metric face falls back to `sans-serif`

**DIMSTYLE variables honoured**: DIMTXT, DIMASZ, DIMEXE, DIMEXO, DIMGAP, DIMDEC, DIMSCALE, DIMDLI,
DIMCEN (positive/mark branch), DIMADEC.
**Not modelled**: DIMCEN negative (centrelines), DIMTOFL and DIMATFIT (text-fit logic), DIMASSOC,
DIMCONTINUEMODE (always 1: the base's style and layer), DIMAUNIT, DIMTXSTY height override, DIMPOST
(kept empty).

`DIMSTYLE` and `STYLE` take only `D` and `ST`, the aliases Autodesk's shortcut guide lists;
`DDIM`, `DIMSTY` and `DST` could not be verified against acad.pgp, and an unverified alias is worse
than none.

# Dimensions

### The dimension object

**Implemented:**

- **The measurement** as ISO-25 writes it: DIMDSEP's comma and DIMZIN 8's trailing zeros dropped
  from a length (`12,5`, `100`, `0`, `0,5`, `1234,57`; p02), an angle keeping its zeros (DIMAZIN 0:
  `22,50°` at DIMADEC 2, p366); a Text override's `<>` drawn so (`12,5 mm`, p15). The command line
  writes it with a point and no trailing zeros, an angle's too: `Dimension text = 12.5`, Text's
  `<12.5>` (p01, p15, p366). A style's separator (`,`, `.`, space) and trailing zeros are set in
  the Styles palette's Primary units; a file before version 34 reads ISO-25's.
- **Grips** as AutoCAD's (desktop d01-1): a linear or aligned one's two origins, its dimension
  line's two ends and its text; a radius's centre, rim point and text; a diameter's two rim points
  and text; an angular one's vertex, two endpoints, a point on its arc and text. The text's grip is
  its middle until moved (d04-2: Text position Y 11.875 over a line at 10), a radial one's the end
  of its leader. An origin's drag restates the measurement; a dimension line end's moves the line
  through the point; the text's is Move with Dim Line: the line goes through the point and the text
  stays where it was put, above it (d03-1, DXF 11 with flag 70's 128), a radial one's leader
  swinging round to it; a diameter's rim point turns its line about the centre. Each is one undo
  step. A moved text goes with every transform, DIMSPACE and a later move of its line; STRETCH
  catching it alone takes the line along (transforms/p275).
- **The Properties palette** (desktop d04-1 to d04-7): the title per kind (Rotated, Aligned,
  Radial, Diametric, Angular Dimension), also in the object type drop-down; Dim style is General's
  picker (as the text's); Misc's Annotative (No); Lines & Arrows' Arrow size, Center mark size (a
  radial one's), Ext line ext, Ext line offset; Text's Text height, Text offset, Text position X
  and Y (typeable: Move with Dim Line, DIMTMOVE 0), Text rotation (typeable, 0 the line's own
  direction), Measurement as drawn, greyed, Text override (typeable, empty gives the measurement
  back); Fit's Dim scale overall; Primary Units' Decimal separator, Suppress trailing zeros,
  Precision. No definition point row, as AutoCAD's.
- **The shortcut menu** over dimensions alone (d07-1): Dimension Style ▸ lists the table's styles,
  theirs checked, and puts them on the one chosen in one step (U names it as the drop-downs'
  `CHPROP`, unverified for this entry).

**Missing:**

- **The grips' hover menus** (d02): the text's Stretch, Move with Dim Line, Move Text Only, Move
  with Leader, Above Dim Line, Center Vertically, Reset Text Position (d02-1); a dimension line
  end's Stretch, Continue Dimension, Baseline Dimension, Flip Arrow (d02-2); an origin has none
  (d02-3). The plain drag is each one's default (Move with Dim Line, Stretch). Ctrl-cycling the
  grip modes is not built either.
- **The shortcut menu's** Precision ▸ and Remove Style Overrides (dimension style overrides are not
  modelled), Annotative Object Scale ▸ (greyed there; no annotative scaling); what Dimension Style
  ▸ lists beyond the styles was not seen.
- **The palette's** rows for what is not modelled: Associative, Arrow 1 and 2, the dimension and
  extension lines' lineweights, colours, linetypes and suppression, Ext line fixed, Fill color,
  Fractional type, Text color, Text outside / inside align, Text pos hor / vert, Text style, Text
  view direction, the Fit rows but Dim scale overall, the Primary Units rows but the three, Alternate
  Units and Tolerances. The style's rows are read-only: an edit there is an override AutoCAD keeps
  on the object. A fractional Measurement (d04 showed `40`) and an angular one's Precision row
  (DIMDEC here) are **unverified**; so are the Spanish and Arabic titles, groups and rows.
- A text at its default place caught alone by STRETCH stays (its place needs the style); DIMZIN's
  other bits (leading zeros, feet and inches), DIMAZIN, DIMTMOVE (always 0: the text keeps its
  line).

### `DIMLINEAR` / `DIMLIN` / `DLI` · es `ACOLINEAL` / `ACOLIN`† / `DIMLIN`†

**Implemented:** the prompts AutoCAD 2023's console asks, written answered:
`Specify first extension line origin or <select object>:` (Enter: `Select object to dimension:`,
`No object selected.` on nothing), `Specify second extension line origin:`,
`Non-associative dimension created.` (origins given as points; no dimension is associative here),
`Specify dimension line location or [Text/Angle/Horizontal/Vertical/Rotated]:` (`[Text/Angle]` once
Horizontal or Vertical is set, through Text and Angle too; after Rotated the whole list again;
DIMALIGNED's `[Text/Angle]` throughout), Text's `Enter dimension text <100>:`, Angle's
`Specify angle of dimension text:`, Rotated's `Specify angle of dimension line <0.00>:`, then
`Dimension text = 100`; refusals `Invalid point input.`, `Invalid Input.`, `*Invalid selection*`
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
`Dimension text = 10`; Text, Angle, arc/circle/polyline-arc-segment selection, DIMCEN centre
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

### `DIMSTYLE` / `D` / `DIMSTY` / `DST` / `DDIM` · es `ACOESTIL` / `ACES` / `ACOEST` / `AES` / `DCOTA`

**Implemented:** style manager, set current, New with Start-With copy and auto-name (`Copy of
ISO-25`), rename, delete guarded against in-use/current, edit Lines/Symbols and Arrows/Text/Fit/
Primary Units (Precision, Decimal separator, Suppress trailing zeros, Angular precision), assign per
selection (the Properties palette's drop-down and the Edit menu's Dimension Style ▸: one undo
step). Every creation, edit, rename, deletion and current-style change is undone by U, which names
it `DIMSTYLE` (`ACOESTIL` in Spanish, unverified) and puts the current style back (desktop d05;
-DIMSTYLE's U, p05); one made mid-command joins that command's step (DSY-01). Names are case-blind:
a new `iso-25` is `iso-25 (2)`, and a rename onto a name in use is refused at the prompt with `A
dimension style named "X" already exists.` / `*Invalid*` (tables 21392, 26367, the text style's
wording, text/p323).

**Missing:**

- **The Dimension Style Manager.** DIMSTYLE opens the Styles palette's dimension table instead
  (TEXT-D58, DIMS-D10). The dialog (d05-1, d05-4): `Current dimension style: ISO-25`, the Styles
  list (Annotative with its icon, then ISO-25), the List filter (All styles) and `Don't list styles
  in Xrefs`, Preview of the selected style, its Description, Set Current, New…, Modify…,
  Override…, Compare…, Close, Help. New… opens Create New Dimension Style (d05-2): New Style Name
  (`Copy of ISO-25`), Start With, Annotative, Use for (All dimensions), Continue / Cancel / Help;
  Continue opens New Dimension Style: Copy of ISO-25 (d05-3) on its tabs Lines, Symbols and
  Arrows, Text, Fit, Primary Units, Alternate Units, Tolerances, with a preview, OK / Cancel /
  Help. The style made is current once the manager closes (d05-4).
- Override, Compare, "Use For" sub-styles, Description, the All/In-use filter.
- **Dimension overrides.** A DIMxxx variable typed as a command (`DIMSCALE`, `DIMTXT`) sets an
  override of the current style, which U takes back naming the variable (p06), and -DIMSTYLE then
  says `Current dimension overrides:` with each one (p06); not modelled (DIMS-D9: the variables
  typed are the Workspace review's).
- **Standard and Annotative**, the two styles beside ISO-25 a new metric drawing holds (p07, p10,
  p14, d05-1). Annotative is inert without annotative scaling (TEXT-D50); Standard's look (DIMTXT
  0.18, DIMTAD 0, DIMTIH On) needs DIMTAD and DIMTIH, which are not modelled (DIMS-D8).

### `-DIMSTYLE` · es `-ACOESTIL`

**Implemented** (p04–p11, p16): `Current dimension style: ISO-25   Annotative: No` (es `Estilo de
cota actual: ISO-25   Anotativo: No`), then `Enter a dimension style option
[Save/Restore/STatus/Variables/Apply/?] <Restore>:` (es `Indique una opción de estilo de cota
[Guardar/Restituir/Estado/Variables/Aplicar/?] <Restituir>:`), answered once; a word it does not
take says `Invalid option keyword.` and asks again (p11).

- **Save**: `Enter name for new dimension style or [?]:` names a new style holding the current
  style's settings, made current (p08). A name in use, any case, asks `That name is already in
  use, redefine it? <N>:` (es `Este nombre está ya en uso; ¿redefinirlo? <N>:`); No or Enter asks
  the name again (p08), Yes gives that style the current settings and makes it current (p06 on the
  current style's own name; on another style, unverified).
- **Restore** (Enter's): `Enter a dimension style name, [?] or <select dimension>:` makes the named
  style current and says the Current line (p11); an unknown name says `Unknown dimension style.`,
  the Current line, and ends (p04, p08, p11). Enter asks `Select dimension:` (es `Designe una
  cota:`), whose pick, typed point or `L` makes that dimension's style current (p16); another object
  says `Selected object is not a dimension.` and asks again (table AcDimRes 5307; what follows it
  unverified).
- **STatus** lists `DIMSTYLE    ISO-25               Current dimension style (read-only)` and the
  current style's variables; **Variables** asks for a style the way Restore does and lists its
  variables (p06, p07). Both list only the variables modelled (DIMADEC, DIMASZ, DIMCEN, DIMDEC,
  DIMDLI, DIMDSEP, DIMEXE, DIMEXO, DIMGAP, DIMSCALE, DIMTXT, DIMZIN), in AutoCAD's columns and
  words, both languages.
- **Apply**: `Select objects:`; the dimensions selected take the current style (p16).
- **`?`**: `Enter dimension style(s) to list <*>:`, then `Named dimension styles:` (es `Estilos de
  cota guardados:`) and the styles matching, in the table's order (p07, p10), or `No matching
  dimension styles found.` (table AcDimRes 5300). The blank line under the heading is the table's;
  the console leaves it out.
- U names the run `-DIMSTYLE` (es `-ACOESTIL`, p05). `'-DIMSTYLE` is refused: `** That command may
  not be invoked transparently **` (p09).

**Missing:**

- **ANnotative**, left out of the list: annotative scaling does not exist here (DIMS-D7, D8).
- The variables not modelled, in STatus and Variables; `Current dimension overrides:` (above).
- Unverified, not probed: Save's and Restore's `?` asking the name again after the listing, Enter
  at Save's name (it ends the command here), a name AutoCAD refuses (`Invalid style name.`, table
  AcDimRes 5301), the redefinition prompt's refusal of a word other than Yes or No, and Apply on a
  preselection (the selection is dropped here).

### `STYLE` / `ST` / `DDSTYLE` · es `ESTILO` / `EST` / `ESTILODD`

**Implemented:** text-style manager (the Styles palette's text table), set current, assign per
selection (the drop-down: one undo step over every text, TEXT-D46), delete guarded against
in-use/current; every style draws in Arial (Standard's font), measured from its advance widths.
Every creation, edit, deletion and current-style change is undone by U, which names it `STYLE`
(`ESTILO` in Spanish, unverified) and puts TEXTSTYLE back (desktop d07; -STYLE's U, text/p320); one
made mid-command joins that command's step. Names are unique and case-blind (`STANDARD` is
Standard, p324): a new name in use gets ` (2)`, and a rename onto one, any case, is refused at the
prompt with `A text style named "X" already exists.` / `*Invalid*` (es `Ya existe un estilo de texto
con el nombre "X".` / `*No válido*`; p323, p336). New proposes `style1`, `style2`…, the first free
(es `Estilo1`, table 9391), a copy of the selected style, made current (d07-2, d07-3). STYLE drops
a preselection, as the dialog does (p160, d07).

**Missing:**

- **The Text Style dialog.** STYLE opens the Styles palette's text table instead (TEXT-D58: WHY,
  the palette tab already hosts DIMSTYLE's table, and replacing it is a change of the palette panel
  of its own, the Workspace review's). The dialog (d07-1): the Styles list with its All styles
  filter and a preview; Font Name, Font Style, Use Big Font; Size: Annotative, Match text
  orientation to layout, Height; Effects: Upside down, Backwards, Vertical, Width Factor, Oblique
  Angle; Set Current, New…, Delete, Apply, Cancel (Close once applied), Help.
- **-STYLE**, and STYLE typed in the console, which asks the same (p310–p322): `Enter name of text
  style or [?] <Standard>:` (`New style.` / `Existing style. Full font name = Arial`), `Specify font
  name or font filename (for SHX) <txt>:`, `Specify height of text or [Annotative] <0.0000>:`,
  `Specify width factor <1.0000>:`, `Specify obliquing angle <0>:`, `Display text backwards?
  [Yes/No] <No>:`, `Display text upside-down? [Yes/No] <No>:`, `Vertical? [Yes/No] <No>:` (SHX
  fonts only), then `"X" is now the current text style.`; U names it `-STYLE` (p320).
- **TEXTSTYLE typed** as a variable: `Enter new value for TEXTSTYLE <"Standard">:`; an unknown name
  is rejected (p322).
- Font choice, width factor, oblique angle, and the backwards, upside-down and vertical flags (DXF
  41, 50, 71, 70), which every style here leaves at their defaults; DIMTXSTY interaction with
  DIMTXT; a machine with no Arial-metric face falls back to `sans-serif`.
- **The Annotative style** a new drawing holds beside Standard (`Anotativo` in Spanish, p311).
  Annotative scaling does not exist here, so the style would be inert (TEXT-D50).

**DIMSTYLE variables honoured**: DIMTXT, DIMASZ, DIMEXE, DIMEXO, DIMGAP, DIMDEC, DIMSCALE, DIMDLI,
DIMCEN (positive/mark branch), DIMADEC, DIMDSEP, DIMZIN (8, trailing zeros).
**Not modelled**: DIMCEN negative (centrelines), DIMTOFL and DIMATFIT (text-fit logic), DIMASSOC,
DIMZIN's other bits, DIMAZIN (0: an angle keeps its zeros), DIMTMOVE (always 0),
DIMCONTINUEMODE (always 1: the base's style and layer), DIMAUNIT, DIMTXSTY height override, DIMPOST
(kept empty).

Aliases from 2027's `acad.pgp`: `DST` and `DIMSTY` are DIMSTYLE's in its main section; `DDIM`,
`DDSTYLE`, es `DCOTA` and `ESTILODD` in its "discontinued in 2004" section, which still runs them
(DDSTYLE p335, ESTILODD p334).

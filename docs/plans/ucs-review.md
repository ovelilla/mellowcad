# UCS review (UCS, UCSICON, ELEV)

> **Status:** plan, 2026-10-28. Phases 0–4 and the five console blocks (UCO, UCH, UCN, UCB, UIE)
> done in one session with skill `command-review`, the twenty-third review of
> `docs/coverage/roadmap.md`'s order (index below). The desktop block (UCD, §12) needs the owner's
> mouse and is probed in a session of its own; once it is executed, the plan shrinks to its index.
>
> It owns no cross-cutting area. It takes what the View review left it: UCS Restore's not-found
> words (`ucsUndefined`, VIEW-D23), the `*TOP*` name after U of an orthographic -VIEW (VUN-06), and
> the roadmap's "UCS OBject's passes none [locked objects] and still says nothing of one".

## Executed

| Block | Findings | Commit |
| --- | --- | --- |
| UCO | UCO-01 to UCO-08 (UCO-08: LINE's typed length with no cursor heading was the runtime's, not the harness's) | `8ddbc70` |
| UCH | UCH-01 to UCH-06 (Face's pick probed further: p420–p426) | `f5a23ff` |
| UCN | UCN-01 to UCN-07 (VIEW-D23 settled) | `0bb97de` |
| UIE | UCI-01, ELV-01 | `52b0853` |
| UCB | UCB-01 to UCB-10 (UCB-08's click unverified until d06) | `a2c5e2f` |

Decisions added in the execution:

- **UCO:** `ucsChange` takes `{ resetsElevation }`, passed by World and -VIEW's orthographic views;
  World with the WCS current changes ELEVATION only and pushes no Previous.
- **UCH:** Face's pick is an `ObjectSelector` with `one.none`: Crossing writes
  `No 3D solid, surface or mesh detected.` whatever it finds, Fence and CPolygon end in silence
  (p420–p426). Apply and SEction are not declared: no other word answers their letters.
- **UCN:** a replaced entry keeps its place in the table; Restore checks a name's characters, not
  its length.
- **UCB:** OBject and ZAxis Object hold one selector each (`takesLocked` for OBject only); a mode
  finding nothing ends OBject through `one.notFound`; a closed spline found by a mode is read as if
  picked at the WCS's origin (unprobed, the rule that fits the ellipse and the open spline).

## 1. Summary

32 findings: 0 critical, 2 high, 14 medium, 16 low.

| Block | What | High | Medium | Low |
| --- | --- | --- | --- | --- |
| UCO | UCS's first prompt, its points, X / Y / Z, ZAxis, World, View, Previous, every run's undo | 0 | 4 | 4 |
| UCH | the words the first prompt declares and does not list (Origin, 3point, Move, orthoGraphic, New, Face…) | 1 | 3 | 2 |
| UCN | NAmed and the UCS table | 0 | 1 | 6 |
| UCB | OBject's and ZAxis Object's picks | 1 | 6 | 3 |
| UIE | UCSICON, 'UCSICON and ELEV | 0 | 0 | 2 |
| UCD | the desktop (icon, its grips, the ViewCube's UCS menu, the jig, Escape) | planned, §12 | | |

The worst:

- **UCS OBject passes over an object on a locked layer** — `No object found` and the end — where
  2027 takes it, by a pick or by a mode, and says nothing (UCB-01). ZAxis Object refuses one in
  BREAK's words, which mellowcad does not say (UCB-02).
- **UCS Move drops the UCS's name and leaves the saved UCS as it was**: 2027 keeps the name
  (`*FRONT*` too) and rewrites the saved entry, so a later Restore gives the moved UCS (UCH-02).
- **ELEVATION goes back to 0 with World and with -VIEW's orthographic views only**; mellowcad resets
  it whenever the UCS becomes the WCS (Previous, a restored name) and not after `-VIEW _FRONT`
  (UCO-03). The third point at the first prompt is read in another frame, which can turn the UCS
  upside down (UCO-02).

Most of the code cited AutoCAD 2023's console (`acc/…`, not in the repo): every one of those cells
was probed again on 2027. 2027 lists Face at the first prompt and at New's, declares Apply and
SEction, and answers `3P`, NAmed's other words and Origin's Enter otherwise.

## 2. Inventory

- **Commit** `cbae8cb`; AutoCAD 2027, ACADVER 26.0, `_VERNUM` X.118 (the View review's build);
  the tables of 2026-10-20; `acad.cuix`'s macros; each language's `acad.pgp`.
- **The tools:** `cad/application/tools/UcsTool.ts`, `ucsObjects.ts`, `ucsHeading.ts`,
  `UcsIconTool.ts` (with `UcsIconVariableTool`), `SystemVariableTool.ts`, `ElevTool.ts`;
  `objectSelection.ts`' single object's pick; `cad/i18n/keywords.ts` (the abbreviation match);
  `cad/domain/ucs.ts`.
- **Registration:** `runtimeTools.ts`, `runtimeCommands.ts` (`TRANSPARENT_COMMANDS` holds ELEV;
  UCSICON is also a `variable(…)`), `CommandLine.ts`. No acad.pgp alias reaches UCS, UCSICON or
  ELEV: en `DDUCS` and es `DDSCP` are defined twice, the later line (UCSMAN, ADMINSCP) winning
  (p103); `UC` and es `SP` run UCSMAN / ADMINSCP — all **known** (UCSMAN is in Missing).
- **Catalogs:** `cad/locales/en.json`, `es.json`; `ar.json` has the interface only (the command
  language is the global one).
- **The objects and the scene:** the UCS, its table and UCSICON in `DocumentSettings`
  (`cad/domain/units.ts`), saved by `cad/serialization/`; the icon in `SceneBuilder.ts`
  (`pushUcsIcon`, `ucsIconAxes`) and `CadRuntime.ts` (`ucsIconShown`); the ViewCube's UCS menu
  (`CadRuntime.ts`, `EngineState.ts` `ucsMenu`).
- **The UI:** not on the rail (`components/cad/tool-rail.tsx`: typed, as AutoCAD's Coordinates
  panel is hidden by default — a desktop cell, UCD); filed under inquiry in `content/commands.ts`.
  The ribbon's macros (`acad.cuix`): `^C^C_ucs _3`, `^C^C_ucs _g _t` … `_g _ba`, `^C^C_ucs _move`,
  `^C^C_ucs _w`, `^C^C^R_ucs _ob`, `^C^C^R_ucs _fa`, `^C^C_ucs _v`, `^C^C_ucs _o`,
  `^C^C_ucs _zaxis`, `^C^C^R_ucs _x` / `_y` / `_z`, `^C^C_ucs _apply`, `^C^C_ucs _na _s`,
  `^C^C_ucs _p`, `^C^C_ucsicon _off|_on|_no|_or`, `^C^C_ucsicon _p`, `^C^C_elev`.
- **Tests:** `ucs.test.ts`, `ucsPrompts.test.ts`, `ucsUnlisted.test.ts`, `elev.test.ts`,
  `elevation.test.ts`, `tiltedUcs.test.ts`, `lastPoint.test.ts`, `undoEcho.test.ts`,
  `selectionModes.test.ts`, `settingsPrompts.test.ts`, `views.test.ts`, `viewCube.test.ts`,
  `drawingFile.test.ts`, `SceneBuilder.test.ts`, the English surface walk.
- **Knowledge:** `docs/coverage/coordinate-systems.md` (UCS, UCSICON, ELEV, the last point);
  `.claude/rules/cad-tools.md`, `cad-runtime.md`, `cad-catalogs.md`, `cad-engine.md`.
- **Related tools, in their part:** -VIEW and PLAN (they set or name the UCS and share
  `ucsChange`, `listNamedUcs`); the ViewCube's UCS menu; U, REDO, UNDO, MREDO after each run.
- **Areas cited, not reviewed:** the command line (LINE's: names, echo of the global forms,
  transparency, `'ORTHOMODE` and variables typed by name — the Workspace review's); `Select
  objects:` and the single object's pick (ERASE's, Pieces' BRP); the view and its undo (View's).

## 3. Probes

Inputs are `scripts/research/probes/ucs/<id>.txt` (`.plain` untraced, `.es` / `.en` one locale),
run with `scripts/research/probe.sh ucs <ids>`; transcripts in `research/probes/ucs/` (gitignored).
Every probe ran in es-ES and en-US unless its name says otherwise. Scratch tests are in
`research/review/ucs/{a,b,c,r}/`.

| Id | What it asks |
| --- | --- |
| p100–p110 | the first prompt: its trace, `SCP` / `UCS`, `_.UCS`, `DDUCS` / `DDSCP`, repeat, `'UCS` at LINE, `Current ucs name` in each state, `FOO`, `0`, another prompt's keyword, `N` / `O` |
| p111–p120 | the point on X and on the XY plane: their reading frame, Enter, `FOO`, coincident, colinear, Z down |
| p121–p132 | X / Y / Z (Enter, a negative, `FOO`, by a point); ZAxis (Enter, a point, coincident, `FOO`); Previous (none, depth) |
| p133–p136 | View in a tilted and a turned UCS; ELEVATION through World and Previous |
| p137–p150 | the point forms at the first prompt, the X point, the third point and ZAxis's |
| p151–p153 | the third point's frame; ELEVATION after World in the WCS, Previous to the WCS, orthographic Top |
| p154–p158 | `'ZOOM` and `'ORTHOMODE` at each prompt |
| p159–p166 | (untraced) U, REDO, UNDO 2, MREDO; World in the WCS, Previous with none, Origin's Enter and OBject on nothing as steps; LASTPOINT after U and REDO |
| p167–p169 | the preselection; another command typed at a prompt |
| p200–p218 | the hidden words: Origin, 3point (`3`, `3P`, defaults, refusals), Entity, Move, Zdepth, orthoGraphic and the six views, New |
| p219–p229 | `?` with `*TOP*`; Face (`_FA`, `_F`); Apply; New's Enter; SEction; `A`; Enter from a saved UCS; which answers drop the name; `W` and `T` at NAmed |
| p230–p249 | NAmed: its prompt, replace (FOO, Yes in another case, No), Restore (not found, case), `?`, Save's names, Delete, the listing, Previous across a restore, the names after `G T`, PLAN, -VIEW, Enter at each |
| p250–p253 | (es) `_.SAVEAS` with named and orthographic UCSs, opened again with `-i` |
| p254–p269 | transparency and another command at the hidden words' prompts; -VIEW Front and U; Previous after orthographic and saved UCSs; 3point's LASTPOINT; zero moves; Move's name and table; es `S` / `Y`; Face's pick; SEction and Apply refusals |
| p300–p318 | OBject on each type, picked and found by `_L` (line, circle, arc, ellipse, elliptical arc, polyline, spline, text, mtext, attribute definition, block reference, dimension, hatch, point, a tilted circle) |
| p319–p337 | OBject by each mode; `FOO` and nothing; ZAxis Object on each type, on nothing, on a circle, by `_L`, `FOO` |
| p338–p345 | locked layers at OBject (pick, mode, mixed) and ZAxis Object; the preselection; `@`; `'ZOOM`; `'ORTHOMODE` |
| p346–p358 | UCSICON: Enter, OFF, Noorigin, ORigin, All, Selectable, Properties, `FOO`; 'UCSICON; es bare `UCSICON`; `SIMBSCP DES`; U and REDO |
| p359–p360 | UCSICON, ELEVATION and THICKNESS saved and opened (`p360a`–`c`, one locale at a time) |
| p361–p369 | ELEV: Enter, negatives, `FOO`, two points, in a raised UCS, `'ELEV` in LINE, U and REDO, `'ZOOM`, `1e1` and `.5` |
| p400–p403 | (the reviewer) ELEVATION after -VIEW Front, Top, SWIso, PLAN and a restored WCS-equal UCS; the third point typed `*x,y`; X / Y by a point in a moved UCS |
| p420–p426 | (block UCH) Face's pick: `FOO`, Crossing, Fence, CPolygon (on a line and on nothing), a pick on nothing and LASTPOINT after U (`p424`, untraced), `FA` and `FOO` from New |

## 4. Matrix

States as `matrix.md`; `a:`, `b:`, `c:` are `research/review/ucs/{a,b,c}/` scratch tests.

### UCO — the first prompt and the listed options

| Row | First prompt | X point / XY point | X / Y / Z angle | ZAxis origin / Z point | World, View, Previous |
| --- | --- | --- | --- | --- | --- |
| A names | match · p101, p104 · `ucsPrompts.test.ts`; `_.UCS` known (command line); `DDUCS` known · p102, p103 | | | | |
| A `'UCS` | match (refused, `** That command may not be invoked transparently **`) · p105 · a:91 | | | | |
| B words | differs UCO-01 · p100 | match · p111, p114, p115 | match · p121–p123 | match · p127, p130 | match · p131, p133 |
| B keywords | match (en `N` New, es `O` Ortogonal) · p100, p110 | n/a | n/a | match (`[Object]`) · p127 | n/a |
| B Enter | match (World) · p100 | match · p114, p115 | match (`<90>`) · p121 | match · p127 | n/a |
| B `FOO` | match (`Point or option keyword required.`) · p107 | match (`Invalid point.`) · p116, p117 | match · p123 | match · p130 | n/a |
| B refusals | `0` match (LASTPOINT) · p108 | coincident, colinear match · p118, p119 | n/a | coincident differs UCO-05 · p129 | Previous none match · p131 |
| B by a point | n/a | third point's frame differs UCO-02 · p151, p120 | Z match · p124; X, Y differs UCO-04 · p125, p402 | match · p149 | n/a |
| C point forms | match (`@`, `*`, `#` refused, `x,y,z`, ELEVATION) · p137–p144 · a:381–415 | match · p145–p148; third point UCO-02 · p401 | n/a | match · p149 | n/a |
| C bare number | untested (console's fixed cursor) · p141 · a:616 | untested · p147 | n/a | | |
| E `'ZOOM` | owned (View) · p154–p158 | owned | owned | owned | |
| E `'ORTHOMODE` | known (variables typed by name, Workspace) · p155 | known | known | known | |
| F undo | match (`UCS` / `SCP`, REDO, UNDO 2 `UCS UCS`, MREDO) · p159, p162 · a:483, a:509 | LASTPOINT after U and REDO match · p163 · `lastPoint.test.ts:326` | match · p164 | | World in the WCS, Previous none: a step, match · p160, p161 |
| F a run with no change | Origin's Enter a step, match · p165; OBject on nothing a step, its LASTPOINT differs UCO-06 · p166 | | | | |
| G Enter / another command | match · p169 | match | match | match | |
| H UCSORG, UCSXDIR, UCSYDIR | match · p111–p153 | | | | |
| H ELEVATION | differs UCO-03 · p135, p136, p152, p153, p400, p403 | | | | |
| H LASTPOINT | match (WCS origin as UCS starts) · p137, p138, p164 | X point keeps it match · p111; third point differs UCO-02 · p150, p401 | angle point keeps it match · p124 | match · p128, p149 | |
| H preselection | match (dropped) · p167, p168 · a:562 | | | | |
| K catalog | match but `pointsAreCoincident` missing (UCO-05) | match | match | match (es `u [Objeto]`) | match |
| L history | match but Face (UCO-01); the echo of `_U` and `'_UCS` owned (command line) | | | | |
| M, P, Q | desktop (UCD d04, d05): the trace's dashed band from the WCS origin at the first prompt and ZAxis's origin (`UseDashedLine`, base `0,0,0`) | | | | |

### UCH — the hidden words

| Row | Origin | 3point | Move / Zdepth | orthoGraphic, views | New | Face, Apply, SEction |
| --- | --- | --- | --- | --- | --- | --- |
| B words, trace | match · p200, p201, p202 · `ucsUnlisted.test.ts:39, 308` | match · p204, p208 · `ucsUnlisted.test.ts:62, 90` | match · p210–p213 · `ucsUnlisted.test.ts:118` | match · p214–p217 · `ucsUnlisted.test.ts:150, 196` | listing differs UCH-01 · p218 | Face differs UCH-01 · p220, p221, p268; Apply known · p222, p269; SEction differs UCH-05 · p224 |
| B abbreviations | `O` en, `OR` es match · p201, p202 | `3` match · p205; `3P` differs UCH-04 · p206 | match | match | match | |
| B Enter | name differs UCH-03 · p227 | match · p204 | name kept differs UCH-02 · p227, p265 | match (its default) · p214, p217 | match (World, `*WORLD*`) · p223 · b:249 | Face's Enter ends · p221 |
| B defaults' precision | n/a | untested (LUPREC) · p207 · b:144 | match | match | match | |
| H name and table | UCH-03 | untested (`*NO NAME*`) · p227 · b:112 | differs UCH-02 · p266 | match (axes, WCS origin, names) · p215, p216 | match | |
| H LASTPOINT | untested · p200, p203 | untested · p204, p208, p263, p264 | untested (Zdepth leaves it) · p211, p213 | untested · p214 | untested · p218 | |
| E | match · p254, p259 | | match · p254, p259 | match · p257 | | |
| G another command | match · p258 | | | match · p258 | | |
| K, L | match | match | match | match | UCH-01 | UCH-01, UCH-05 |

### UCN — NAmed and the table

| Row | NAmed's prompt | Restore | Save, replace | Delete | `?` listing |
| --- | --- | --- | --- | --- | --- |
| B words | match · p230 · `ucsPrompts.test.ts:110` | en match · p234 | match · p231 (colon UCN-02) | untested · p240, p241 · b:118 | match · p242, p243 · `ucsPrompts.test.ts:150` |
| B other words, Enter | differs UCN-01 · p227–p229 | Enter ends match · p249 | Enter ends match · p249 | Enter match · p241 | |
| B refusals | match | not found es differs UCN-04 · p234; invalid name differs UCN-06 · p235 | invalid-name es differs UCN-05 · p236; 255 / 256 characters, `*`, accents untested · p238, p239 | none matching untested · p241 | |
| B case | | case-blind untested · p234 | replace keeps the stored case differs UCN-03 · p232; es `S` / `Y` untested · p267 | | |
| H | | | Yes and No match · p231, p233 | the current one `*NO NAME*` untested · p240 | current line with an orthographic UCS differs UCN-07 · p219, p261 |
| F `*TOP*` after U of -VIEW Front | known (VIEW-D45, `view.md` Missing) · p260 | | | | |
| H Previous across a restore | untested · p245, p262 | | | | |
| E | match · p255 | | `'ZOOM` taken as a name, untested · p256 | | |
| J | match (table, name, orthographic kind) · p250–p253 · `drawingFile.test.ts:202` | | | | |
| K | | UCN-04 | UCN-05 | match | match |

### UCB — OBject's and ZAxis Object's picks

| Row | OBject `Select object to align UCS:` | ZAxis Object `Select object:` |
| --- | --- | --- |
| B words, `FOO` | match · p327 · `selectionModes.test.ts:1167` | match · p329, p337 · `selectionModes.test.ts:1213` |
| B Group | known (Missing) · p325 | known |
| B what it refuses | hatch differs UCB-04 · p311; dimension known · p310; point n/a | an object without ends differs UCB-05 · p335 |
| C a typed point | match (a pick; LASTPOINT there) · p300, p343 | match · p330 |
| C a click on nothing | unverified UCB-08 (desktop) | unverified |
| H each type picked | untested (values equal) · p300–p309, p313 · `ucs.test.ts:208–247` without ids | match · p330–p334 · `tiltedUcs.test.ts:276` |
| H the modes, newest | match · p319–p324, p326 · `selectionModes.test.ts:813` | match · p336 |
| H read with no pick | line, circle, arc untested · p317; ellipse, elliptical arc, spline, polyline differs UCB-03 · p314–p317 | match (the end nearest the WCS origin) · p336 |
| locked | differs UCB-01 · p338–p340 | differs UCB-02 · p341 |
| nothing | match · p327, p328 | match (asks again) · p329 |
| a mode finding nothing | differs UCB-06 · p317 | unverified |
| G Enter | untested (ends) · p317 · c:188 | differs UCB-07 · p317 |
| preselection, `'ZOOM` | untested · p342, p344 | `'ORTHOMODE` known (Workspace) · p345 |
| M, Q hover | differs UCB-09 (rule); the look desktop d06 | same |

### UIE — UCSICON and ELEV

| Row | UCSICON | 'UCSICON | ELEV elevation / thickness |
| --- | --- | --- | --- |
| B words | listed part match; All, Selectable, Properties known · p346, p349–p351 · `ucsPrompts.test.ts:215` | match · p353 · `settingsPrompts.test.ts:317` | match · p361 · `settingsPrompts.test.ts:151` |
| B keywords, `FOO` | untested capitals · p346; `FOO` match · p352 | match · p353, p354 | `FOO` match · p363 |
| B defaults | match (`<OFF>` after OFF) · p347, p348 | match | `<0.0000>` against `<0.00>` known (precision 2) · p361 |
| B two points, forms | n/a | n/a | untested · p364, p369 |
| H values | untested (OFF 2, N 1, OR 3) · p346–p348 | match · p353 | match · p362, p365 |
| E | n/a | match at LINE · p355 · `settingsPrompts.test.ts:334`; es bare · p356 | `'ELEV` in LINE untested · p366; `'ZOOM` untested · p368 |
| F | untested (`UCSICON` / `SIMBSCP`) · p358 | unverified | one step match · `elev.test.ts:59`; echo untested · p367 |
| J | match · p359, p360 · `drawingFile.test.ts:215` | | match · p360 · `elev.test.ts:76` |
| M | the scene untested (UCI-01); the look desktop d01 | | |

## 5. Findings

### High

#### UCB-01 — UCS OBject passes over an object on a locked layer; 2027 takes it, by a pick or by a mode, and says nothing

- **Severity:** high · **Row:** B/H · **Status:** verified (the reviewer read p338 and p340)
- **Where:** `cad/application/tools/UcsTool.ts:318` (`ctx.pick` leaves locked objects out),
  `cad/application/tools/objectSelection.ts` (`takeOne` drops them)
- **AutoCAD:** p338: a line on a locked layer picked at 55,39 → UCS at 60,40, X
  (−0.9806, −0.1961). p339: `_W` finding only it → origin 10,30. p340: `_W` finding an older
  unlocked line and the newer locked one → the locked one. No locked-layer words, in either
  language.
- **mellowcad:** c:104, 110, 115: the pick says `No object found` and ends; `_W` with only it asks
  again in silence; with both it takes the unlocked one.
- **Scenario:** reference geometry on a locked layer → `UCS OB` and a click on it → mellowcad ends
  with `No object found`, AutoCAD aligns the UCS → the user cannot align to it.
- **Fix:** OBject picks locked objects (`picksLocked` while in `object`) and its `ObjectSelector`
  keeps them (a `one` option the selector honours); the hover reaches them too. ZAxis Object keeps
  refusing (UCB-02). · **Alternative:** none.
- **Regression test:** `selectionModes.test.ts`, p338–p340 as c:104–118.
- **Coverage, rules:** the UCS entry ("OBject takes objects on locked layers"); `cad-tools.md`'s
  single object's pick names UCS OBject as the one that takes them; the roadmap's open line settled.

#### UCH-02 — UCS Move drops the UCS's name and leaves the saved UCS as it was; 2027 keeps the name and rewrites the saved entry

- **Severity:** high · **Row:** H · **Status:** verified (the reviewer read p266, p227)
- **Where:** `UcsTool.ts:767-800` (`enterShift`, `enterZdepth` pass `null` to `finish`)
- **AutoCAD:** p266: `UCS FR`, `UCS M 5,0,0` → `("*FRONT*" (5 0 0))`; `UCS NA S AA`,
  `UCS M Z 3` → UCSNAME `"AA"` and `(tblsearch "UCS" "AA")`'s origin `(5 -3 0)`. Move's and
  Zdepth's Enter, Zdepth 0 and Move 0,0,0 keep `*FRONT*` (p227, p265). Origin `1,0,0` drops it.
- **mellowcad:** b:104: `*NO NAME*`, the table unchanged.
- **Scenario:** restore AA, the ribbon's Move UCS (`^C^C_ucs _move`), later restore AA → AutoCAD
  gives the moved UCS, mellowcad the old one → objects land elsewhere.
- **Fix:** Move and Zdepth keep `ucsName` and `ucsOrthographic`; a named UCS's entry in `namedUcs`
  takes the new UCS in the same `UpdateSettingsCommand`; no displacement, no change.
- **Regression test:** `ucsUnlisted.test.ts`: p265, p266, p227.
- **Coverage:** Move's line in the UCS entry.

### Medium

#### UCO-01 — The first prompt does not list Face, which 2027 lists in both languages

- **Severity:** medium · **Row:** B · **Status:** verified
- **Where:** `UcsTool.ts:138` (Face in `HIDDEN_OPTIONS`), `commandOptions`' `origin`
- **AutoCAD:** p100, p101: `Specify origin of UCS or [Face/NAmed/OBject/Previous/View/World/X/Y/Z/ZAxis] <World>:`,
  es `Indique origen de SCP o [Cara/gUArdado/oBjeto/PRev/Vista/Univ/X/Y/Z/ejEZ] <Univ>:` (table
  33659).
- **mellowcad:** a:48: the list without Face.
- **Fix:** Face listed first; what it does is UCH-01. · **Regression test:** `ucsPrompts.test.ts`'s
  `ORIGIN` and an es twin (p100, p101).
- **Coverage, catalogs:** the quoted prompt; the English surface snapshot.

#### UCO-02 — The first prompt's point on the XY plane is read in the UCS moved to the origin; 2027 reads it along the new X axis, and LASTPOINT is that point

- **Severity:** medium · **Row:** B/C/H · **Status:** verified (the reviewer read p151, p401)
- **Where:** `UcsTool.ts:1243` (`readIn`), `:942` (`acceptPlanePoint`'s `lastPoint`)
- **AutoCAD:** p151: `UCS 100,0 200,50 100,20` → UCSYDIR (−0.2425, 0.9701, 0): Z up; LASTPOINT
  `(100 20 0)` in the new UCS. p120: `0,0 10,0 0,-10` → UCSYDIR (0, −1, 0), LASTPOINT (0, −10) in
  the WCS. p401: `*100,100` at the third prompt → LASTPOINT the WCS's 100,100. One rule fits p112,
  p120, p148, p150, p151, p401: the point is read in the frame of the new origin, the new X and
  Y = current Z × new X; LASTPOINT is the point given.
- **mellowcad:** a:173: Z turned down, LASTPOINT (201.86, 4.85); a:182: LASTPOINT (0, 10); a:653:
  a click at 100,100 leaves it at (75.75, 97.01).
- **Scenario:** a third point typed below the new X in the moved UCS but above it in AutoCAD's frame
  turns the UCS upside down here; later work lands in a mirrored plane.
- **Fix:** UCS-D2. · **Regression test:** `ucs.test.ts`, p151, p120, p401.
- **Coverage:** "both typed in the UCS moved to that origin" holds for the X point only; the
  LASTPOINT sentence; `readIn`'s JSDoc.

#### UCO-03 — ELEVATION goes back to 0 whenever the UCS becomes the WCS; 2027 resets it with World and with -VIEW's orthographic views only

- **Severity:** medium · **Row:** H · **Status:** verified (the reviewer read p152, p153, p400, p403)
- **Where:** `UcsTool.ts:1325-1338` (`ucsChange`'s `toWorld`, and its `null` when nothing changes)
- **AutoCAD:** p152: ELEVATION 5, `UCS W` with the WCS current → 0. p153: Previous back to the WCS
  → 5; `UCS G T` → 5. p400: `-VIEW _FRONT` → 0; a saved UCS equal to the WCS restored → 5. p403:
  `-VIEW _TOP` → 0; `-VIEW _SWISO` and `PLAN W` → 5. p135, p136 agree with mellowcad.
- **mellowcad:** a:352 (World in the WCS keeps 5), a:358, a:364 (Previous, `G T` → 0);
  r/elevation.test.ts (-VIEW Front keeps 5; Restore → 0).
- **Scenario:** `UCS P` back to the WCS, or a restored name, silently drops ELEVATION: the next
  objects are drawn at Z 0.
- **Fix:** UCS-D3, UCS-D90. · **Regression test:** `ucs.test.ts` (p152, p153, p400) and
  `views.test.ts` (p400, p403).
- **Coverage, rules:** the UCS entry's "changing to the WCS puts ELEVATION back to 0";
  `cad-runtime.md`'s "(the WCS puts ELEVATION to 0)"; `ucsChange`'s JSDoc.

#### UCO-04 — X and Y rotation by a point ask a second point, and a click is ignored; 2027 takes one point, from the UCS's origin

- **Severity:** medium · **Row:** B · **Status:** verified
- **Where:** `UcsTool.ts:293` (a click returns unless the axis is Z), `takes()` (`points: "second"`)
- **AutoCAD:** p125: `0,0` at `Specify rotation angle about X axis <90>:` ends the command
  (PromptingForAngle, UseBasePoint, dashed). p402: in a UCS turned 30° and moved to 50,0, `X` then
  `0,10` turns 90° — measured from the UCS's origin, not the WCS's.
- **mellowcad:** a:637: `0,10` → `Specify second point:`; a:643: a click does nothing.
- **Fix:** UCS-D4. · **Regression test:** `ucs.test.ts`, p125, p402.
- **Coverage:** "X / Y / Z … typed or pointed".

#### UCH-01 — 2027 lists Face at New's prompt too, and `F` asks for a face; mellowcad refuses `F`

- **Severity:** medium · **Row:** B · **Status:** verified
- **Where:** `UcsTool.ts:133-156`, `:722`
- **AutoCAD:** p218: `Specify origin of new UCS or [ZAxis/3point/OBject/Face/View/X/Y/Z] <0,0,0>:`
  (es `[ejEZ/3p/oBjeto/Cara/Vista/X/Y/Z]`). p220, p221, p268: `_F` and `_FA` ask
  `Select face of solid, surface, or mesh:` (es `Designe la cara del sólido, la superficie o la
  malla:`), keywords Crossing / Fence / CPolygon; Enter ends with nothing changed; a pick on a line
  says `No 3D solid, surface or mesh detected.` (es `No hay ningún sólido, superficie o malla 3D.`)
  and ends.
- **mellowcad:** b:34, b:42, b:50.
- **Fix:** UCS-D30. · **Regression test:** `ucsUnlisted.test.ts`: both prompts in en and es, `F`,
  `FA`, the pick, Enter (p218, p221, p268).
- **Coverage, rules, catalogs:** New's prompt, Face's Missing note (its reason changes);
  `cad-catalogs.md`'s example "UCS's `F`"; new prompt and message keys.

#### UCH-03 — Origin's Enter, and Origin or New at the current origin, re-set the UCS and drop its name; mellowcad keeps it

- **Severity:** medium · **Row:** G/H · **Status:** verified (the reviewer read p227)
- **Where:** `UcsTool.ts:767-780` (`else commitCtx.endCommand()`), the comment at `:765`
- **AutoCAD:** p227: AA current, `O` Enter → `("" 1)`; `*FRONT*`, `O` Enter → `("" 0)`. p265:
  Origin and New at 0,0,0 from `*FRONT*` → `""`. Move's Enter keeps it (UCH-02).
- **mellowcad:** b:96: `Current ucs name:  AA` after.
- **Fix:** UCS-D34. · **Regression test:** `ucsUnlisted.test.ts:39` extended (p227, p265).

#### UCH-04 — `3P` is refused at the first prompt; 2027 takes it as 3point

- **Severity:** medium · **Row:** B · **Status:** verified
- **Where:** `cad/i18n/keywords.ts:124-128`: `started` keeps the words whose first capital matches,
  testing `isCapital` only, while `abbreviationOf` counts digits as capitals — so `3point` has no
  first capital and is dropped.
- **AutoCAD:** p206 (both languages): `3P` → `Specify new origin point <0,0,0>:`.
- **mellowcad:** b:129: `Point or option keyword required.`
- **Fix:** UCS-D35, with a unit test in the keyword tests (`3`, `3P`, `3point`, es `3P`).

#### UCN-01 — NAmed's prompt answers every word of the first prompt, and its Enter is World; mellowcad refuses them and its Enter does nothing

- **Severity:** medium · **Row:** B/G · **Status:** verified
- **Where:** `UcsTool.ts:459-465`, `:557-564`
- **AutoCAD:** p230: its `initget` is the first prompt's 28 words, with AllowNone. p228: `NA W` →
  the WCS; p229: `NA T` → `*TOP*`; p227: `NA` Enter from `*FRONT*` → the WCS.
- **mellowcad:** b:ucn:32, ucn:39.
- **Fix:** UCS-D36, keeping the ViewCube's `restoreUcs` path (`_NAmed _Restore`).

#### UCB-02 — ZAxis Object on a locked object does not say `The object is on a locked layer.`

- **Severity:** medium · **Row:** B/L · **Status:** verified (the reviewer read p341)
- **Where:** `UcsTool.ts:318`, `:184` (no `one.locked`)
- **AutoCAD:** p341: `The object is on a locked layer.` / `El objeto está en una capa bloqueada.`,
  `No object found`, `Select object:` again.
- **mellowcad:** c:120: only `No object found`.
- **Fix:** UCS-D61 (BREAK's pattern: `lockedObjectAt` on a pick, `one.locked` on a mode).
- **Regression test:** `selectionModes.test.ts`, p341.

#### UCB-03 — An object a mode finds is read elsewhere than 2027 reads it: an ellipse, an elliptical arc, a spline, a polyline

- **Severity:** medium · **Row:** H · **Status:** verified
- **Where:** `cad/application/tools/ucsObjects.ts:324` (`unpickedStart`), `UcsTool.ts:197`
- **AutoCAD:** p314–p317: a full ellipse takes X through its point nearest the WCS's origin; an
  elliptical arc and a spline their end nearer the WCS's origin; a polyline whose last segment is
  straight its first vertex, X towards the last; one ending in an arc that arc's centre, X towards
  the first vertex. A line (its first end), a circle (angle 0) and an arc (its start) as now.
  LASTPOINT stays at 0,0,0.
- **mellowcad:** c:37–62: all read at their start.
- **Fix:** UCS-D62, each case with a `WHY` citing its probe. · **Regression test:**
  `selectionModes.test.ts`, the seven cases of c:37–67.
- **Coverage:** the Missing item marked **unverified** is settled and built.

#### UCB-04 — A hatch at OBject is ignored in silence; 2027 says `This object does not define a coordinate system` and ends

- **Severity:** medium · **Row:** B/L · **Status:** verified
- **Where:** `UcsTool.ts:327`, `ucsObjects.ts:39`
- **AutoCAD:** p311: `This object does not define a coordinate system` / `Este objeto no define un
  sistema de coordenadas` (table 25599), the UCS kept, LASTPOINT at the pick. The console writes it
  twice (desktop d06 settles it).
- **Fix:** UCS-D63. · **Regression test:** `selectionModes.test.ts`, p311.
- **Coverage:** Missing's "OBject on … a hatch" becomes the refusal.

#### UCB-05 — ZAxis Object on an object without ends asks again in silence; 2027 says `Z axis option not supported for selected object.`

- **Severity:** medium · **Row:** B/L/K · **Status:** verified
- **Where:** `UcsTool.ts:326-327`
- **AutoCAD:** p335: `Z axis option not supported for selected object.` / `No se admite la opción
  de eje Z para el objeto seleccionado.` (table 33775), then `Select object:`.
- **Fix:** UCS-D65. · **Regression test:** `selectionModes.test.ts`, p335 in both languages.

#### UCB-06 — A mode finding nothing at OBject asks again; 2027 says `No object found` and ends

- **Severity:** medium · **Row:** B/G · **Status:** verified
- **Where:** `objectSelection.ts`' `takeOne`
- **AutoCAD:** p317: `_W 150,150 190,190` → `No object found`, `Command:`.
- **Fix:** a `one` option that ends the command after `No object found`, as OBject's pick does;
  ZAxis Object's mode is unprobed and stays as it is. · **Regression test:**
  `selectionModes.test.ts`, p317.

#### UCB-07 — Enter at ZAxis Object ends UCS; 2027 asks again

- **Severity:** medium · **Row:** G · **Status:** verified
- **Where:** `UcsTool.ts:557-563`
- **AutoCAD:** p317: AllowNone false; Enter writes `Select object:` again. OBject's Enter ends (as
  mellowcad).
- **Fix:** `onEnter` swallows Enter in `zObject` outside a mode, asking again with no line.
- **Regression test:** `ucsPrompts.test.ts`, p317.

### Low

#### UCO-05 — A ZAxis Z point on the origin says `Invalid point.`; 2027 says `Points are coincident`

- **Severity:** low · **Row:** B/K · **Where:** `UcsTool.ts:1039-1041` · **AutoCAD:** p129:
  `Points are coincident` / `Los puntos coinciden` (table 25611, no period), asked again.
- **Fix:** UCS-D5. · **Regression test:** `ucsPrompts.test.ts`, p129.

#### UCO-06 — U after OBject on nothing leaves LASTPOINT at the pick; 2027 puts it at the WCS's origin

- **Severity:** low · **Row:** F · **Where:** `UcsTool.ts:323` · **AutoCAD:** p166: `(5 500 0)`
  after `No object found`, `(0 0 0)` after U. · **mellowcad:** a:550.
- **Fix:** UCS-D6. · **Regression test:** `lastPoint.test.ts`, p166.

#### UCO-07 — The coverage and the tests of the first prompt say what 2027 does not

- **Severity:** low · **Row:** N/O
- Missing's "Origin's or Move's Enter and OBject on nothing as an undo step of their own" is stale:
  each is a step here already, as in 2027 (p165, p166, a:541, a:550).
- "a third point on the side that would turn Z down is not taken" is false (p120,
  `ucs.test.ts:53`).
- "one given without a Z lies on the current UCS's plane": at ELEVATION above it (p144).
- `ucsPrompts.test.ts`' describe "as AutoCAD 2026" over 2023 transcripts; every `acc/` of UCO's
  part is replaced (§11).

#### UCO-08 — With the pointer never moved, a bare number at LINE's next point is refused in the harness

- **Severity:** low · **Row:** O (LINE's point input, cited) · **Status:** unverified (the harness
  alone may cause it)
- **Where:** a:607 · the coverage says a distance with no cursor runs along the UCS's X.
- **Fix:** in the execution, run it in the harness with a cursor never set; if it is the runtime's,
  fix it there (the cursor's default), else drop this finding with the reason.

#### UCH-05 — SEction is declared and asks `Select section object to align UCS:`; the coverage does not say so

- **Severity:** low · **Row:** B · **AutoCAD:** p224, p269: es `Seleccione objeto de sección para
  alinear SCP:`, the selection modes, `FOO` `*Invalid selection*`, Enter ends. · **Fix:** UCS-D32.

#### UCH-06 — Stale citations in the hidden words' part

- **Severity:** low · **Row:** N · `HIDDEN_OPTIONS`' comment cites table 25652's order; 2027's is
  Origin Face ZAxis 3point Entity View X Y Z OBject Move orthoGraphic Previous Restore Save Delete
  Apply ? World New Top Bottom FRont BAck Left RIght NAmed SEction (p200). The class JSDoc's
  "older prompts AutoCAD 2023's console still answers them with"; `ucsUnlisted.test.ts`' header.
  Replacements in §11.

#### UCN-02 — The replace question ends `<N>:`; 2027's has no colon

- **Severity:** low · **Row:** L/K · **Where:** `UcsTool.ts:390-395` · **AutoCAD:** p231:
  `UCS "AA" already exists.  Replace it? <N> ` (es `El SCP "AA" ya existe. Reemplácelo.? <N>`).
- **Fix:** UCS-D37. `ucsPrompts.test.ts:110` asserts the colon. The es wording, marked
  **unverified**, is settled.

#### UCN-03 — Replacing `aa` over a stored `AA` renames the entry; 2027 keeps `AA`

- **Severity:** low · **Where:** `UcsTool.ts:1152-1163` · **AutoCAD:** p232. · **Fix:** UCS-D38.

#### UCN-04 — Spanish Restore's not-found words (VIEW-D23)

- **Severity:** low · **Row:** K · **Where:** `cad/locales/es.json`'s `ucsUndefined` ·
  **AutoCAD:** p234, p248, p258: es `No se puede encontrar SCP "BB".` (PLAN's words), asked again;
  table 27139's `Imposible encontrar el SCP` is not what the console writes; en matches.
- **Fix:** UCS-D39. `ucsPrompts.test.ts:186` asserts the old words.

#### UCN-05 — Spanish invalid-name words

- **Severity:** low · **Row:** K · **AutoCAD:** p235, p236, p239: `Nombre SCP no válido.` (no table
  source; the console wins); mellowcad `Nombre de SCP no válido.` · **Fix:** UCS-D40.

#### UCN-06 — Restore of a name with invalid characters says `Cannot find UCS`; 2027 says `Invalid UCS name.`

- **Severity:** low · **AutoCAD:** p235, asked again. · **Fix:** UCS-D41.

#### UCN-07 — The `?` listing's current-name line names an orthographic UCS; 2027's does not

- **Severity:** low · **Row:** L · **Where:** `UcsTool.ts:1283` · **AutoCAD:** p261, p253:
  `*FRONT*` current → `Current ucs name: *NO NAME*`; p219: `*TOP*` → `*WORLD*` (es `*UNIVERSAL*`);
  UCS's own first line still names them. · **Fix:** UCS-D42 (PLAN's `?` follows).

#### UCB-08 — A click on nothing at OBject leaves LASTPOINT where it was; a typed point moves it there

- **Severity:** low · **Status:** unverified (the console cannot click) · **Where:**
  `UcsTool.ts:320-324` · **AutoCAD:** p327, p328 (typed). · **Fix:** UCS-D68 after desktop d06.

#### UCB-09 — OBject's and ZAxis Object's hover draws `THEME.selected`; a single object's pick draws `rollover`

- **Severity:** low · **Row:** M/Q · **Where:** `UcsTool.ts:585-597`, `:247-255` · BREAK
  (`BreakTool.ts`), ARRAYPATH and FILLET use `rollover` (`cad-tools.md`, "Pick feedback").
- **Fix:** UCS-D69; the look is checked on the desktop (d06).

#### UCB-10 — Stale citations in the picks' part

- **Severity:** low · **Row:** N · `UcsTool.ts`' `modes` and `pickObject` comments,
  `ucsObjects.ts`' `unpickedStart`, `UcsIconVariableTool`'s and `SystemVariableTool`'s JSDoc,
  `selectionModes.test.ts` (UCS's 2023 cases), `settingsPrompts.test.ts`' describes ("as AutoCAD
  2026") and its `acc/sv1` citation, `runtimeCommands.ts`' ELEV transparency, `ucs.test.ts`' OBject
  values without ids. Replacements in §11.

#### UCI-01 — The UCS icon's scene has no test

- **Severity:** low · **Row:** M/N · `SceneBuilder.test.ts` holds nothing of the icon: the broken
  pencil, the corner when the origin is out of view, UCSICON 0 (c/icon.test.ts asserts all three and
  passes). · **Fix:** move them into `SceneBuilder.test.ts`.

#### ELV-01 — ELEV's untested cells

- **Severity:** low · **Row:** N · two points at each prompt, LASTPOINT untouched (p364); `'ELEV` in
  LINE giving the next segment its thickness and Z (p366); a LINE in a raised UCS (p365); U's and
  REDO's echo `ELEV` (p367); `'ZOOM` (p368); `1e1`, `.5` (p369). mellowcad matches each
  (c/uci-elv.test.ts:72–113). · **Fix:** move them into `elev.test.ts` with their probes.

## 6. Decisions

- **UCS-D1:** Face is listed at the first prompt, as 2027 and table 33659 list it.
- **UCS-D2:** the first prompt's third point is read in the frame (new origin, new X, current Z ×
  new X), and LASTPOINT is the point given, typed or clicked; the X point stays read in the moved
  UCS (one rule fits p112, p120, p148, p150, p151, p401).
- **UCS-D3:** World (its keyword and the first prompt's Enter) always puts ELEVATION back to 0, even
  with the WCS current, as a change of its own; no other UCS answer does (p152, p153, p400).
- **UCS-D4:** X and Y take one point as the angle from the UCS's origin in its XY plane, as Z does
  (p125, p402).
- **UCS-D5:** a `pointsAreCoincident` message (table 25611) rather than `coincidentWithFirstPoint`.
- **UCS-D6:** a UCS run that changes nothing but moved LASTPOINT puts it back at the WCS's origin on U
  (p166).
- **UCS-D7:** every `acc/` citation of the UCS code and tests is replaced by the 2027 probe that
  confirmed it (§11).
- **UCS-D30:** Face is listed at the first prompt and New's; `F` and `FA` ask its pick prompt, which
  takes no object here (there are no solids or meshes): a pick says `No 3D solid, surface or mesh
  detected.` and ends, Enter ends. That is what 2027 does with no solid in the drawing — not a
  substitute.
- **UCS-D31:** Apply stays in Missing (a review fixes what is built; one viewport makes it a prompt
  that changes nothing, and the gap is already recorded). Its 2027 prompt is noted there (p222,
  p269).
- **UCS-D32:** SEction goes to Missing with its prompt (no section objects).
- **UCS-D33:** Move and Zdepth keep the name and the orthographic kind and rewrite a saved entry; no
  displacement, no change (p265, p266).
- **UCS-D34:** Origin's answer always applies the UCS, so its Enter (and New's point at the current
  origin) drops the name (p227, p265).
- **UCS-D35:** `keywords.ts` counts a digit as a capital where it picks the first capital, as
  `abbreviationOf` does.
- **UCS-D36:** NAmed's prompt lists Restore, Save, Delete and `?`, and takes the first prompt's
  other words hidden, through the same dispatch; its Enter is World.
- **UCS-D37:** the replace question is `open: true` (no colon).
- **UCS-D38:** a replaced entry keeps its stored name.
- **UCS-D39:** es `ucsUndefined` takes the console's `No se puede encontrar SCP "{name}".`; both it
  and `planUcsNotFound` stay (a key is never removed).
- **UCS-D40:** es `invalidUcsName` is `Nombre SCP no válido.`
- **UCS-D41:** Restore checks a name's characters before looking it up.
- **UCS-D42:** the `?` listing's current-name line leaves the orthographic kind out (UCS's and
  PLAN's).
- **UCS-D43:** the `*TOP*` name after U of an orthographic -VIEW stays known in `view.md`
  (VIEW-D45), now cited to p260.
- **UCS-D44:** the Missing item "a point default at the drawing's precision" is settled: AutoCAD
  writes it at LUPREC (p207); what remains is mellowcad's precision 2 against acadiso's 4, a UNITS
  matter outside UCS.
- **UCS-D60:** OBject takes objects on locked layers, by a pick and by a mode, in silence.
- **UCS-D61:** ZAxis Object refuses a locked object with `objectOnLockedLayer` then
  `noObjectFound`; by a mode as BREAK's (unprobed there, by analogy).
- **UCS-D62:** a mode's object is read per type (UCB-03); no single formula fits the arc and the
  ellipse.
- **UCS-D63:** the hatch's refusal is said once, the console's second line taken for its artefact
  until d06 says otherwise.
- **UCS-D64:** a dimension at OBject stays in Missing (AutoCAD aligns to it, p310: its target noted).
- **UCS-D65:** ZAxis Object says `zAxisNotSupported` for every object that is not a line, arc,
  elliptical arc, open polyline or open spline (the filter the code has).
- **UCS-D66:** UCSICON's All stays in Missing, with what 2027 asks (p349), as Apply (UCS-D31).
- **UCS-D67:** UCSICON's prompt lists only the keywords built, as now.
- **UCS-D68:** a click on nothing at OBject moves LASTPOINT as a typed point does, once d06
  confirms it.
- **UCS-D69:** OBject's and ZAxis Object's hover is `rollover`, over whatever the pick takes (locked
  objects at OBject).
- **UCS-D70:** p359 runs one locale at a time (its runs share file names).
- **UCS-D90:** -VIEW's orthographic views put ELEVATION back to 0, through the call they make to
  `ucsChange`; an isometric -VIEW and PLAN do not (p400, p403).
- **UCS-D91:** the desktop cells go in a block of their own (UCD, §12), in a session with the
  owner's mouse; the console blocks do not wait for it.

## 7. Tests proposed

Regression tests are in each finding. Besides them, the untested cells, by file:

- `ucs.test.ts`: Previous's depth of 10 (p132); an origin typed at ELEVATION (p144); each OBject
  type with its probe id (p300–p309, p313); U's echo after a first-prompt UCS (p159).
- `ucsUnlisted.test.ts`: LASTPOINT after Origin, Move, Zdepth (left), New, 3point (p200, p203, p204,
  p208, p211, p213, p218, p263, p264); 3point's defaults at LUPREC (p207); New's Enter's
  `*WORLD*` (p223); the six views' LASTPOINT (p214).
- `ucsPrompts.test.ts`: case-blind Restore (p234); Save's 255 / 256 characters, `*`, accents
  (p238, p239); replace Yes and es `S` / `Y` (p232, p267); Delete of the current one, none matching,
  the es plural (p240, p241); Previous across a restore (p245, p262); `'ZOOM` at Save's name taken
  as a name (p256); UCSICON's capitals and values (p346–p348); U after UCSICON (p358).
- `selectionModes.test.ts`: the modes reading a line, a circle and an arc (p317); LASTPOINT after a
  mode (p319); OBject's Enter (p317); the preselection and `'ZOOM` at OBject (p342, p344).
- `elev.test.ts`, `SceneBuilder.test.ts`: ELV-01, UCI-01.
- `viewCube.test.ts`: its `toContain("UCS")` made exact; the menu with `*TOP*` current (after d03).

## 8. What is not tested and why

- The look of the icon, the jig's band, the hover and the menus: the desktop (UCD).
- UCSNAME, UCSORG, UCSXDIR, UCSYDIR as variables: no getvar or SETVAR here; `settings.ucs`
  stands for them.
- A bare number at the console's point prompts: its cursor is a fixed pixel.

## 9. What could not be reviewed and why

- ZAxis Object's modes finding a locked object or a circle, and its mode finding nothing (no probe
  ids left; UCD d06 through COM).
- SEction's and Face's picks on real objects (no sections, solids or meshes here).
- U after `'UCSICON`; `'ZOOM` at UCSICON's prompt; snap overrides at OBject's pick (`_END`: UCS
  declares no `takesSnapOverride`); a mode at OBject finding only a hatch (here `1 was filtered
  out`); a closed spline found by a mode — console probes from p430, in the UCD session.

## 10. Refuted in the adversarial pass

- UCSICON's All, Selectable and Properties differ from 2027: **known** (Missing).
- ELEV's `<0.0000>` against `<0.00>`: the documented precision deviation (`command-line.md`).
- `'ORTHOMODE` refused at UCS's prompts: no variable is typable by name yet (the Workspace review).
- es `_U` echoed `H`, `'_UCS` echoed `'UCS`: the command line's echo of the global forms (LINE's
  area, its `WHY`).
- `DDUCS`, `UC`, es `DDSCP`, `SP` unknown: they run UCSMAN / ADMINSCP, in Missing.
- p153's "origin typed back to 0,0" as a WCS case: with ELEVATION 5 the origin lands at Z 10, not
  the WCS; Previous's case carries UCO-03 alone.
- A name with a space at Save taken whole (p237): the console's artefact (AllowSpaces false: the
  desktop's space is Enter, d05).

## 11. Coverage ↔ code ↔ AutoCAD, rules ↔ code

What does not hold (the rest of the UCS, UCSICON and ELEV entries holds, each cell in §4):

| Claim | Probe | State |
| --- | --- | --- |
| the first prompt's and New's lists | p100, p218 | no longer true in 2027 (UCO-01, UCH-01) |
| both points typed in the UCS moved to the origin | p151 | holds for the X point only (UCO-02) |
| a third point turning Z down is not taken | p120 | false (UCO-07) |
| X / Y / Z typed or pointed | p125 | X, Y pointed false (UCO-04) |
| changing to the WCS puts ELEVATION back to 0 | p152, p153, p400 | false (UCO-03) |
| Origin's Enter changes nothing | p227 | false (UCH-03) |
| Move: the axes kept (silent on the name) | p266 | incomplete (UCH-02) |
| `Replace it? <N>:` | p231 | false (UCN-02) |
| es `Imposible encontrar el SCP "NAME".` | p234 | false (UCN-04) |
| the hidden words as table 25652 gives them | p200 | no longer true (UCH-06) |
| es words **unverified**, no Spanish console | p200–p218 | settled: they hold |
| Missing: Origin's Enter and OBject on nothing no step | p165, p166 | stale (UCO-07) |
| Missing: where OBject reads an ellipse, polyline, spline found by a mode, **unverified** | p314–p317 | settled (UCB-03) |
| Missing: OBject on a hatch | p311 | refused in words (UCB-04) |
| Missing: the name New's Enter leaves, **unverified** | p223 | settled: `*WORLD*` |
| Missing: es's replace prompt, **unverified** | p231 | settled: it holds |
| Missing: a point default at the drawing's precision | p207 | settled (UCS-D44) |
| Missing: Face refused rather than read as `FRont` | p221 | its reason changed (UCH-01) |

Rules:

| Rule | Claim | State |
| --- | --- | --- |
| `cad-runtime.md`, settings | "(the WCS puts ELEVATION to 0)" | stale (UCO-03): World and -VIEW's orthographic views |
| `cad-tools.md`, reuse | a single object's pick says each locked one found, never takes it | holds but UCS OBject takes them (UCB-01): name it |
| `cad-tools.md`, pick feedback | a single object's pick draws `rollover` | broken by UCS (UCB-09) |
| `cad-catalogs.md`, keywords | "Where its letters would answer another word (UCS's `F`), offer it hidden" | stale (UCH-01): Face is listed; the rule needs another example or none |
| `cad-tools.md`, LASTPOINT | UCS puts it at the WCS's origin as it starts | holds (p137, p164) |

The `acc/` citations and their 2027 replacements: `onActivate` → p134, p137, p138, p164;
`apply`'s WHY → p163, p164, p166; `readIn` → p111, p113 (the X point), p151; `setsLastPoint` → p111,
p114, p264; `acceptPlanePoint` → p150, p401; `enterZOrigin` → p127, p128; `currentName` → p106,
p153, p202, p217; orthoGraphic's default → p214, p217; New → p218, p223; Origin's Enter → p203,
p227; 3point → p207, p208, p263; `modes` and `pickObject` → p300, p317, p319–p330, p336, p343;
`unpickedStart` → p317; `UcsIconVariableTool` → p353–p356; ELEV's prompts → p361–p363; ELEV's
transparency → p366; `domain/ucs.ts`' orthographic axes → p215, p216; the tests' (`lastPoint.test.ts`,
`ucsUnlisted.test.ts`, `selectionModes.test.ts`, `settingsPrompts.test.ts`) likewise.

## 12. Order of execution and estimate

One subagent per block, one commit each, in this order (they share `UcsTool.ts`, the catalogs and
the English snapshot):

1. **UCO** (UCO-01 to UCO-08): the prompt's Face, the third point's frame, ELEVATION's rule with
   -VIEW, X / Y by a point, the coincident message, U after OBject on nothing, the coverage. Medium.
2. **UCH** (UCH-01 to UCH-06): Face's prompt and refusal, Move's name and table, Origin's Enter,
   `3P` in `keywords.ts`, SEction in Missing. Medium; `keywords.ts` is shared — run the whole
   keyword suite.
3. **UCN** (UCN-01 to UCN-07): NAmed's words and Enter, the replace question, the es words, Restore's
   check, the listing's line. Small.
4. **UCB** (UCB-01 to UCB-10): locked objects, the per-type reading, the refusals, Enter at ZAxis
   Object, the hover; `objectSelection.ts` gains its `one` options. Medium; the selector is shared —
   run every test of the single object's picks (BREAK, FILLET, ARRAYPATH).
5. **UIE** (UCI-01, ELV-01): tests only. Small.
6. **UCD** — the desktop, in its own session with the owner's mouse; its findings take this prefix.
   Probes, each in `scripts/research/probes/ucs/`:
   - d01 the icon: the WCS's square, a UCS at its origin, Noorigin in the corner, a tilted UCS, the
     XY plane edge-on (the broken pencil, **unverified** for a 2D icon), letters, colours, size.
   - d02 the icon's grips and menus (UCSSELECTMODE 1): the origin's and axes' menus, the icon's
     right-click menu, what each runs and U's names — sizing the Missing gap.
   - d03 the ViewCube's UCS menu: its items with the WCS, a named, `*TOP*` and `*FRONT*` current,
     New UCS, what each echoes and U names.
   - d04 the jig: the dashed band from the WCS's origin at the first prompt and ZAxis's origin (the
     trace's `UseDashedLine`), the band at the X, XY and Z points and at X / Y / Z by a point;
     dynamic input's fields and the Down arrow's list (Face) at each prompt.
   - d05 Escape, Space and the right button at each prompt and at NAmed's sub-prompts; a Save name
     with a space; the `?` listing's `Press ENTER to continue:`; Escape at ELEV's second prompt.
   - d06 OBject's and ZAxis Object's picks: the hover against BREAK's, a locked object and a hatch
     hovered, a click on nothing then `ID @` (UCB-08), the hatch's refusal once or twice; ZAxis
     Object's mode on a locked object and on a circle (through COM).
   - d07 UCSICON's Properties dialog (look only), the ribbon's Coordinates panel (hidden by default,
     the rail's comment).
   - e01 the Spanish profile: d02's and d03's menus, Face at the prompt.
   - Console, before the desktop: §9's open cells, from p430.

## 13. Changes to coverage, rules, catalogs and roadmap

- `docs/coverage/coordinate-systems.md`: the UCS entry (prompts with Face, the third point,
  ELEVATION, X / Y by a point, Move's name and table, Origin's Enter, NAmed's words, OBject on locked
  objects and by modes, the refusals, Enter at ZAxis Object), its Missing (Apply's and SEction's
  prompts, All's, the settled items out), UCSICON's and ELEV's lines; `view.md`'s VUN-06 cited to
  p260.
- Rules: `cad-runtime.md` (ELEVATION), `cad-tools.md` (UCS OBject takes locked objects; the hover),
  `cad-catalogs.md` (the `F` example).
- Catalogs: `pointsAreCoincident`, Face's prompt and message, `ucsNoCoordinateSystem`,
  `zAxisNotSupported`; es `ucsUndefined`, `invalidUcsName`; the English snapshot.
- Roadmap: row 23 `plan`, then `done`; the open lines settled (OBject's locked objects, VIEW-D23).

## 14. Template improvements

- **Phase 1 counts each file's old citations** (`grep -o 'acc/[a-z]*[0-9]*'`): where the code cites
  AutoCAD 2023 almost everywhere, re-probing it is the review, and each subagent gets its list.
  Here two of three ran out of ids with cells left.
- **Ranges of 100 when the old citations are many**, and the reviewer keeps `p400` up for what the
  subagents leave open (p400–p403 settled three cells and found UCO-03's -VIEW half).
- **The previous review's transcripts are an analogue**: view/p351 already printed UCS's
  `[Face/…]`; a grep of the last review's transcripts for the next command's prompts is a free
  first probe.
- **Subagents number their findings without gaps** before returning (B skipped UCH-04).

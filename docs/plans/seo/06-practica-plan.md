# Session 06 — practice and guides: what was built and why

> Written on 2026-11-07 by session 06 (`docs/plans/seo/06-practica.md`), from the audit
> (`~/seo-data/audit-2026-11-05/`: `keywords-en.md`, `keywords-es-pt.md`, the autocomplete files)
> and the engine as it is. The rules that keep it true are `docs.md` ("The practice library and the
> guides"), `ui.md` (a drawing opened by URL), `marketing.md` (figures, links) and `i18n.md` (slugs).

## 1. Where it lives

- **Inside `/docs`**, as "Use" pages: the sitemap, hreflang, breadcrumbs, search, the `.md`, the
  navigation and the generated-page checks come with it. A route of its own would have rebuilt all
  of that for a shorter URL, and the URL is the weakest signal a page has.
- **The index**, `/docs/exercises`, titled for what each language searches: "AutoCAD practice
  exercises" ("autocad practice exercises", "autocad exercises", "practice drawings"; the metaTitle
  adds free and solutions), «Ejercicios de AutoCAD…», «Exercícios de AutoCAD…», «تمارين اوتوكاد…».
  `exercises` is the slug because it is the word every language's query shares (ejercicios,
  exercícios).
- **Slugs stay English** (`i18n.md`): per-language slugs would rewrite how Fumadocs pairs a page's
  languages and everything built from the path, for a click-through gain only.

## 2. The exercises

Twelve, each a script of steps the engine replays (`content/demos/exercises/`), its words in four
languages (`content/exercises/`):

| Level | Exercise | Discipline | Kind | Practises |
| --- | --- | --- | --- | --- |
| Beginner | gasket | mechanical | 2D | RECTANG Fillet, CIRCLE Diameter, COPY, LINE, DIMLINEAR, DIMDIAMETER |
| Beginner | l-bracket | mechanical | 2D | relative coordinates, FILLET, DIMBASELINE, DIMRADIUS |
| Beginner | stairs | architecture | 2D | ARRAYRECT, PLINE with width, centimetres |
| Beginner | mounting-plate | mechanical | 3D | REGION, SUBTRACT on regions, EXTRUDE, VIEW, VSCURRENT |
| Intermediate | flange | mechanical | 2D | TRIM against several objects, ARRAYPOLAR (not associative) |
| Intermediate | round-table | architecture | 2D | RECTANG's kept fillet, ARRAYPOLAR of a chair |
| Intermediate | plot-of-land | civil | 2D | polar coordinates, AREA, DIMALIGNED by object, DIMANGULAR |
| Intermediate | shaft | mechanical | 2D | PLINE, CHAMFER Multiple, MIRROR, DIMCONTINUE |
| Intermediate | isometric-block | mechanical | isometric | LINE along 30°/90°/150°, `_END`, DIMALIGNED |
| Intermediate | pulley | mechanical | 3D | REVOLVE about Y |
| Advanced | link | mechanical | 2D | `_TAN` to `_TAN`, TRIM circles into arcs |
| Advanced | bearing-block | mechanical | 3D | EXTRUDE, UNION, CYLINDER, SUBTRACT |

- **A page per exercise**: the statement, what it practises (each command linked), the drawing
  dimensioned (a 3D one's profile and its solid), and the solution step by step: each step drawn
  as far as it goes, with that step's history alone. A command's page lists the exercises that run
  it.
- **Into the editor**: `/draw?drawing=<slug>` opens it with the finished drawing moved left of the
  origin, on its template's layers named in the reader's language, in a store of its own: the
  drawing someone was working on is not touched (`ui.md`). Verified in Chrome: an own drawing kept
  through opening, drawing on, reloading and leaving an exercise; NEW (NUEVO) and the page's link
  start it over; the language links keep it.
- **Printed** (Print or save as PDF): the article alone, dark on white, its drawings as AutoCAD's
  monochrome plot style plots them.
- **Isometric honestly**: AutoCAD's isometric drafting (isometric snap, isocircles) is not built, so
  the isometric exercise draws its edges with polar coordinates and says so.

## 3. The guides

Chosen on the audit's data, all three in the four languages, English slugs:

| Guide | Searches | Why first |
| --- | --- | --- |
| `floor-plan` | pt «como fazer planta baixa no autocad», «fazer planta baixa online grátis»; es «dibujar plano de casa en autocad», «hacer plano de casa online gratis»; en "autocad floor plan tutorial"; ar «رسم مخططات منازل» | the one family whose searchers type only local words (`keywords-es-pt.md` §B.8), P1 in Brazil |
| `coordinates` | en "how to draw a line with length and angle in autocad", "how to use polar coordinates in autocad"; es «como dibujar en autocad con coordenadas», «comando linea con angulo» | the "how to X in AutoCAD" that every exercise rests on |
| `2d-to-3d` | en "how to use autocad 3d"; es «autocad 3d desde cero»; ar «رسم اوتوكاد ثلاثي الابعاد» | 3D said as it is, partial, with the commands it has |

## 4. Left for later

- **More exercises**, by the same mechanism: civil and electrical plans, a floor plan as an
  exercise, isometric ones once isometric drafting exists.
- **"Learn AutoCAD from scratch"** (es «aprender autocad desde cero», the largest learning query in
  Spanish; pt «aprender autocad do zero»): a guide that orders getting started, coordinates and the
  beginner exercises into a path.
- **The free AutoCAD alternative page** (L6), once there are links to point at it.
- **For the engine** (found while scripting, not fixed here, each needing a probe): ARC writes a
  point typed after its first without `@` though it takes it relative (LINE writes `@`); a demo's
  `type` at `Select objects:` goes to the dynamic input, which has no field there, so `ALL` never
  reaches the command line (`CadDriver.type`); `Dimension text = 25.32` where the ISO-25 drawing
  reads `25,32` (DIMDSEP), unverified against AutoCAD's history. Fixed on the way, each in a commit
  of its own: a demo's history of a typed object snap, and TRIM at a computed tangent, which had
  erased the link's larger boss.

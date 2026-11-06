# Session 04 — the landing's redesign: plan

> Written on 2026-11-06 by session 04 (`docs/plans/seo/04-landing.md`) before building, from the
> audit (`~/seo-data/audit-2026-11-05/landing.md`, its captures and keyword studies), the rules and
> the engine as it is. What changed while building, the measurements and the after-test (§9–§10)
> were added once the page was built.

## 1. Concept

**Concept A, "Free online CAD with AutoCAD commands"**, with concept B's editor-shaped hero and
concept C's "who it's for" (`landing.md` §5): the category in the H1, the familiar tool as proof,
one click into the app, and what only MellowCAD has — AutoCAD's commands in the visitor's command
language, and the same part drafted in 2D and modelled as a solid, both drawn by the engine.

The five seconds must say, in this order of weight: **what it is** (online CAD — the H1), **that it
is free and needs nothing** (the pill above the H1), **that it works like AutoCAD in your
language** (the H1's "AutoCAD commands" and the lead's own aliases, from the engine), **that it does
2D and 3D, partly** (the lead, the "New: 3D solids" link, the figure turning into a solid), and
**where to go** (Start drawing, the command box in the figure).

## 2. Decisions on the audit's open questions (`landing.md` §5.3)

1. **Demand.** The home's queries were fixed by session 02 (`docs/next-seo.md` L2): "free online
   cad" (Bing, 3 months: 640; "online cad" 2.3K, "cad online" 4.3K), "cad online gratis", "cad
   online grátis" (Brazil's "cad online" is the largest relative head, 3.9), «رسم هندسي اون لاين».
   "autocad online gratis" (1.5K) and "autocad web" are Autodesk's brand queries and "cad 3d online"
   is Tinkercad's and Onshape's: the H1 says neither. The H2s carry each section's family (§4).
2. **Trademark.** Autodesk's guidelines (read in Chrome on 2026-11-06; the page refuses plain
   fetches): AutoCAD only "in a referential phrase", as an adjective ("AutoCAD commands", "AutoCAD
   order"), never as a noun, possessive or verb in new copy; no logo, icon or colour; our name
   "distinct from and more prominent than" theirs; a footnote in their words. So: the H1 keeps
   session 02's referential phrase, **without ®** (the guidelines only "appreciate" the symbol; a
   screen reader reads it aloud in the H1, and the titles session 02 measured have none); the lead
   opens with **MellowCAD** in the body's strongest weight, and the header's logo stays; the footer's
   footnote becomes Autodesk's formula ("Autodesk and AutoCAD are trademarks of the Autodesk group of
   companies. MellowCAD is not affiliated with Autodesk.").
3. **Hero rendering.** Engine-drawn, in the editor's shape: the figure is the editor's canvas with
   its view label (`[Top]`, then `[SW Isometric]`, the engine's `names().views`), the ViewCube (drawn
   on the server from the recording's `EngineState.viewCube` and the engine's face and compass
   names — chrome around an engine figure, never the editor's component, which is a client island),
   the UCS icon and the command line, whose last line is the real command box. No screenshot. No
   status bar: its toggles would be dead buttons (B's risk).
4. **Timing.** 8–12 s stays (`content/figures.test.ts`). The 2D phase reads as CAD from the first
   second (a circle and the prompts at 1 s, the flange's outline by 3 s) and ends by about 7 s; the
   solid is built in the next 4 s and the view turns at about 11 s. Reduced motion shows the final
   frame at once. Pause and replay stay.
5. **The command box.** It moves from the board into the hero's figure: its last line, `Command:`,
   with the editor's autocomplete. Enter opens the editor; it does not run the command there (no
   deep link: an editor change with its own URL and privacy questions, left out of this session —
   the label says "Enter opens the editor").
6. **3D wording.** "3D solids" in the lead, the pill's link and an H2; never in the H1 or the title
   (session 02's titles say "2D & 3D"). Every place that describes it says "still partial" and,
   where it describes, what is missing (sweeps, lofts, meshes, rendering).
7. **Cuts.** The Engine section, the toolset's command lists, the hero's 12 px proof line, the
   duplicate try-it box. The FAQ keeps every answer (FAQ rich results are gone since 2023: it is
   content only) and gains one.
8. **Mobile hero.** Pill, H1, lead, then the figure's final frame and the phone note with "Send to
   my computer"; the command box is hidden below `md` (a phone is not where the editor works).
9. **Activation** (a sample drawing or hints in the editor): outside the landing; recorded for the
   editor's next pass.
10. **Snippets and cards.** Titles and descriptions stay session 02's. The OG card says the H1 and
    draws the hero's last frame: the flange and its solid.
11. **Arabic.** `/ar` gets its clicks for «رسم هندسي اون لاين» (session 02): the H1 is that query.
    The command language is the global one, so its aliases are the English ones, isolated.
12. **Measurement.** Search Console's per-page CTR and queries, before (2026-11-05) and four to six
    weeks after the push (session 10); the editor's visits per landing visit in Vercel Analytics.
    No new event: it would change the privacy notice for a number the ratio already gives.

## 3. The hero

```
┌ pill: Free · No sign-up · Nothing to install ─────────────┐  ┌ figure: the editor's canvas ──────────┐
│ H1  Free online CAD with AutoCAD commands                  │  │ [Top]→[SW Isometric]      ViewCube    │
│ lead MellowCAD runs in your browser, for 2D drafting and   │  │   flange plotted in plan, then the    │
│      3D solids, still partial. Type L for LINE, TR for     │  │   same drawing in SW Isometric with   │
│      TRIM and EXT for EXTRUDE: …                           │  │   its solid, Hidden                   │
│ [Start drawing →]  All 140 commands →                      │  │ UCS                    X 130.00 Y …   │
│ New: 3D solids, still partial →                            │  ├ command line (typed history) ────────┤
│ (phone) Best on a computer… [Send to my computer]          │  │ Command: [Type a command, e.g. L   ] │
└────────────────────────────────────────────────────────────┘  └ caption: Type L. Press Enter. Draw. ─┘
proof strip: 140 AutoCAD commands · 131 aliases · 12 object snaps · 4 languages · 5,800+ tests · open source, MIT
```

- **The aliases in the lead are the engine's**, by id (LINE, TRIM, EXTRUDE: each has an alias in
  every live command language — Portuguese's OFFSET has none), joined with the page's list format.
- **The proof strip** is the hero's last row, inside the first screen at 1440×900: every number from
  `lib/facts.ts` (the languages too, from `routing`); the commands link the reference, the licence
  the repository.

### The figure

One script, `content/demos/hero.ts`: the flange as today (CIRCLE, OFFSET, ARRAYPOLAR, RECTANG,
LINE, HATCH, DIMDIAMETER, DIMLINEAR), then its solid **beside it, in the same drawing**: CYLINDER
three times, ARRAYPOLAR not associative (AS, N), SUBTRACT by a window, VSCURRENT Hidden, -VIEW
SWiso. The prototype (scratch, 2026-11-06) replays with no error and 75 primitives in the last
frame.

- **Phase 1**, the plan: the 2D objects plotted stroke by stroke in the hero's frame, as now.
- **Phase 2**, from the step that leaves the plan (-VIEW): the editor's own last frame — the drawing
  in SW Isometric, Hidden, with the solid in front of it — fades in over the plan, with the view
  label and the ViewCube turning with it. The solid stands clear of the 2D objects on the screen:
  Hidden does not yet hide a line behind a solid (`docs/coverage/view.md`), and an overlap would
  show it.
- `plotDemo` learns the second phase: the plan plots the objects added before the view leaves it;
  the last frame is the recording's scene; one clock times both and the transcript.
- `recordDemo` returns the last `EngineState` (`DemoRecording.state`): the ViewCube's projected
  faces and the view's preset, for the chrome. A new field of a public type: a changeset.
- **Hidden, not Conceptual, in the hero**: Conceptual's cells cost 1,183 primitives for this part
  (the hero's budget is 600 and every one is HTML twice, markup and payload), and its planar faces
  step past their round edges (the cells are kept whole across an edge). Conceptual appears in the
  3D section, once its planar faces are trimmed exactly (§5).

## 4. Sections, in order, with their English text

Each H2 carries what its language searches (`docs/i18n/<tag>.md`, "Search texts"); the labels on
the dimension lines number them. Target: 6–8 desktop screens at 1440×900 (today 11.7).

| # | Id | H2 (en) | Family it answers |
| --- | --- | --- | --- |
| hero | — | H1: Free online CAD with AutoCAD commands | free online cad |
| 01 | `commands` | The AutoCAD commands you know, down to the aliases. | autocad commands, aliases |
| 02 | `features` | Precise 2D drafting: object snaps, tracking and polar. | 2d cad online, drafting |
| 03 | `solids` | 3D solids in the browser — new, and still partial. | autocad 3d, solids |
| 04 | `privacy` | Free, with no sign-up and nothing to install. | free, no sign-up |
| 05 | `audience` | For practising AutoCAD commands, sketching and teaching. | autocad practice |
| 06 | `roadmap` | Honest about what's here — and what isn't yet. | — (claims) |
| 07 | `faq` | Questions, answered. | the questions searched |
| — | — | Your drafting table is one keystroke away. | (final call) |

**01 Commands.** Lead: "Each command answers to its AutoCAD name and aliases — in Spanish and
Brazilian Portuguese, the names those versions of AutoCAD use — and asks in the same order, with
the same option letters." The board stays (it is the page's keyword-dense list), each command with
a page of its own a link to it (`commandPageIds`, `Link prefetch={false}`), the rest to the
reference; under `md` each group shows its first commands and the reference link. One line names a
command in the three command languages from the engine: "OFFSET is DESFASE in Spanish AutoCAD and
DESLOCAMENTO in Brazilian Portuguese, and _OFFSET works in every language." The try-it box goes
to the hero, and the OFFSET transcript card goes too (§9).

**02 2D drafting.** Lead: "Object snaps, tracking and polar angles behave the way your hands
expect, and coordinates are typed the AutoCAD way, right at the cursor: @100<30 for relative polar,
#120,80 for absolute." Eight cards, four across: the four aids (Tangent snap, OTRACK, Polar, window
and crossing — live frames, their keys) and four drawings (draw, modify, annotate, organize —
stills, one sentence each). The command lists and the inquiry and files cards go.

**03 3D solids** (new). Lead: "Solids built and edited directly, without a feature history:
primitives, extrusions and revolutions, booleans, slices and filleted edges, seen from the ViewCube
or in orbit." Three cards, each a session the engine draws and the
commands it stands for (links where they have a page): a profile revolved (REVOLVE's session), a
subtraction (SUBTRACT's), and EXTRUDE's L-shaped solid in 2D Wireframe, Hidden and Conceptual
(§9). Then "Works today": the 3D commands as key caps in the command language
(`SOLID_COMMANDS`, held to the registry by `content/commands.test.ts`), and "Not yet: sweeps and
lofts, meshes and rendering, and moving or rotating solids in 3D."

**04 Free and private.** The local-first section, shorter: "Free, no account" ("There is nothing to
sign up for and nothing to pay: open the page and draw."), autosave, a file with Ctrl+S, no
uploads; the line "DWG and DXF: not yet — drawings are saved in MellowCAD's own versioned format";
the warning and the privacy link; the engine's diagram stays beside them.

**05 Who it's for** (new). Four cards: students ("Practise the AutoCAD commands of your course in
your own language, on any computer, with nothing to install and no licence to ask for."), drafters
("Check how a command behaves, or sketch a part away from your seat, with the aliases already in
your fingers."), teachers ("Every student gets the same commands in the same order, in the lab or at
home, and there is nothing to install."), makers ("Draw a bracket or a plate to size, or model it
as a solid, for free."). Then: "Not yet for: exchanging DWG or DXF files, or plotting sheets to
paper or PDF."

**06 Status** stays as it is (its lists are claims, already true since `4c6094db`).

**07 FAQ** keeps its ten answers, reordered by what a visitor asks first (free, install, AutoCAD,
commands, 3D, DWG, class, storage, open source, Autodesk, phones), and gains one: "Can I use it to
practise for my AutoCAD class?" — "Yes, for the commands: their names and aliases, the order of
their prompts and their options are AutoCAD's, in English, Spanish or Brazilian Portuguese. It
cannot open or save DWG files yet, so work you hand in as DWG or PDF still needs another program."
The DWG answer adds printing: "…and there is no printing or PDF export yet."

**Final call** stays: its H2, `Command:` and the button.

The header's links follow the sections: Commands, 2D drafting, 3D solids, Roadmap, FAQ, Docs.

## 5. Figures

| Figure | How | New |
| --- | --- | --- |
| Hero | one script, two phases (§3), Hidden | the solid, the second phase, the chrome |
| Precision ×4 | live frames (as now) | — |
| Draw, modify, annotate, organize | stills (as now) | — |
| REVOLVE, SUBTRACT | their pages' sessions (`COMMAND_SESSIONS`), live, Hidden | reused |
| Visual styles | EXTRUDE's L-shaped solid, three live frames (2D Wireframe, Hidden, Conceptual) | yes |
| Local-first diagram | as now | — |
| OG card | the flange drafted, and its solid (`heroSolid`) under the section | yes |
| Engine layers, OFFSET card, inquiry, files | — | removed |

**Conceptual, trimmed** (engine, `fix(engine)`): a planar face's cells that an edge crosses are cut
to the face exactly (`regionBoolean` of the face and the cell, its loops tessellated) instead of
being kept whole when their middle is inside; a cell becomes a polygon with holes (`path` with
`subpaths`). The product's Conceptual loses the steps past round edges (prototype: a flange's top
face stepped 3 units past its rim), the mesh keeps its exact area, and curved faces keep their
grid.

## 6. What leaves

- `EngineSection` and the `Engine` messages; `DIAGRAMS.engineLayers` and its script.
- `ToolsetSection`'s command lists and its inquiry and files cards; `PrecisionSection` and
  `ToolsetSection` become one section (`DraftingSection`).
- The OFFSET transcript card and its figure: the hero's command line types the real prompts, and
  the page needed the room.
- `Hero.eyebrow` (it is the H1 now, `Hero.title`), `Hero.proof` (the pill), the board's try-it box.
- The hero's static caret line (the command box takes its place).

## 7. Rules that change

- `marketing.md`: the islands (`CommandTry` lives in the hero); the hero's two phases and the
  chrome drawn from the recording's state, never the editor's components; the H1 is the category
  and `Hero.tagline` the slogan; an H2 carries its section's search family; the figures test's
  numbers apply to both phases.
- `i18n.md`: nothing (its claims already hold the 3D as partial).
- The hero's test (`content/figures.test.ts`): both phases inside 8–12 s and 600 primitives, the
  turn at -VIEW's answer, only the drafted objects plotted in plan; the lead's aliases exist in
  every live command language and the 3D section's commands are filed
  (`content/commands.test.ts`). Where the solid stands, clear of the 2D objects, is chosen in the
  script and said there: no test reads overlaps off a frame.

## 8. Five-second test: before

From the audit (`landing.md` §2.2), 2026-11-05, desktop:

| After 5 s | (a) student, «autocad online gratis» → `/es` | (b) drafter, "free online cad" → `/` | (c) engineer, "cad 3d online" |
| --- | --- | --- | --- |
| What is it? | ✓ AutoCAD-like CAD in the browser | ✓ | ✓ but "2D only" |
| Is it for me? | ~ (DWG? 3D?) | ~ (DWG unanswered) | ✗ |
| Is it free? | ✓ (lead) | ~ (12 px line) | ~ |
| What next? | ✓ CTA | ✓ CTA | gone |
| Why trust it? | ~ Spanish prompts | ~ verbatim prompts | ✗ |

## 9. What changed while building, and why

- **The 3D section's figures**: REVOLVE's session and EXTRUDE's L-shaped solid in the three styles,
  not EXTRUDE, SLICE and SUBTRACT's plate. The plate's hole is a few hundred cells in Conceptual,
  written twice (the HTML and the RSC payload): 5 KB of Brotli that took the first load past 250
  KB; the L costs 1 KB.
- **The OFFSET card** left the commands section, and the lead lost "your drawings stay on your
  device" (section 04 says it): the page was 11.7 screens at the first build of this design too.
- **The FAQ** sits in two columns; **free and private** shows its four points in a row, then the
  formats line and the diagram.
- **On a phone** the figure comes right under the H1 (`order`; the DOM keeps the desktop's order,
  and the only control it moves is the figure's pause).
- **The OG card** keeps the category as its eyebrow and the slogan as its headline: Satori sets a
  right-to-left line only as one sentence per line (`lib/og.tsx`), and the H1 is one long
  sentence in Arabic. It draws the flange drafted and, under its section, the solid.
- **The engine** (two commits of their own): Conceptual cuts a planar face's cells to the face at
  its edges, halving along them as a curved face does, so the painter's order stays local (the
  first cut, without the halving, let a hole's walls show through the face round it); and
  `recordDemo` returns the last `EngineState` (`DemoRecording.state`).

## 10. Measured (2026-11-06)

On production builds of the page before (`82c1eaf2`) and after, in worktrees, `next start`:

| | Before | After |
| --- | --- | --- |
| Desktop screens at 1440×900 (en, es, pt-BR, ar) | 11.7 (en, the audit) | 7.6, 7.8, 7.9, 7.4 |
| Phone screens at 390×844 (en, es) | 19.3 (en, the audit) | 15.1, 15.8 |
| Where DWG is answered (es) | 78–88 % of the scroll | 58 % (section 04), and the FAQ at 84 % |
| First load, Brotli q11 (en, es, pt-BR, ar) | 241.2, 242.2, 242.5, 265.2 KB | 247.4, 248.5, 248.9, 271.7 KB |
| Lighthouse mobile, median of 3 (en, es) | 95, 95 | 95, 95 (ar 96) |
| Lighthouse desktop (en) | 100 | 100 |
| Accessibility, SEO; CLS | 100, 100; 0 | 100, 100; 0 |

Budgets: 250 KB and 275 with a script's font, so the four fit, with 1–3 KB to spare. Production
adds Vercel's two analytics scripts to both (about 6 KB: production measured 247.2–248.5 and 271.2
before), which local builds do not load; the next addition to the landing measures again. Local
Lighthouse is 95 on mobile both before and after (production, on Vercel's CDN, was 100); its best
practices are 96 locally for the analytics scripts' 404s. No chunk of `/` holds the engine.

## 11. Five-second test: after

Desktop, the production build, frames at 1, 3 and 5 s (es and en), read in the order of visual
weight as the audit read them:

- **(a) Student, «autocad online gratis» → `/es`.** 0–2 s: «CAD online gratis con comandos de
  AutoCAD» at 54 px, the pill «Gratis · Sin registro · Nada que instalar» above it: not AutoCAD,
  free, nothing to install, its commands. 3–5 s: the lead's «con los comandos de AutoCAD en español.
  Escribe L para LINEA, RR para RECORTA…», while the sheet plots the flange with RECTANG's Spanish
  prompts; «Los 140 comandos» and «Nuevo: sólidos 3D, aún parciales» beside the button; the
  numbers under it. Still not in the first screen: DWG and PDF, now at 58 % of the page, and the
  class question in the FAQ.
- **(b) Drafter, "free online cad" → `/`.** 0–2 s: the H1 is the query, with "AutoCAD commands";
  the pill says free and no sign-up. 3–5 s: the prompts typed in the sheet, "Type L for LINE, TR
  for TRIM and EXT for EXTRUDE"; 140 commands, 131 aliases, 6,000+ tests, the MIT link. DWG: "not
  yet", a scroll away (section 04 and "Not yet for…" in section 05).
- **(c) Engineer, "cad 3d online".** 0–2 s: online CAD, AutoCAD commands; 3–5 s: "2D drafting and
  3D solids, still partial" and the 3D link in the first screen; at 11 s the sheet turns to SW
  Isometric and the flange stands as a solid. The 3D section is the third (45 %), with what works
  and, beside it, what does not.

| After 5 s | (a) student | (b) drafter | (c) engineer |
| --- | --- | --- | --- |
| What is it? | ✓ free online CAD, AutoCAD's commands in Spanish | ✓ | ✓ 2D and 3D, partial |
| Is it for me? | ✓ practice (the FAQ asks it) ~ DWG a scroll away | ~ DWG a scroll away | ~ partial 3D, said so |
| Is it free? | ✓ pill and H1 | ✓ pill and H1 | ✓ |
| What next? | ✓ CTA, the commands | ✓ CTA, the command line | ✓ the 3D link |
| Why trust it? | ✓ Spanish prompts, the numbers | ✓ prompts, numbers, MIT | ~ the solid at 11 s |

A self-administered walkthrough, as the audit's was; a test with real people per persona (its
§5.7) remains open.

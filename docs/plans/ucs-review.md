# UCS review (UCS, UCSICON, ELEV)

> **Status:** done, 2026-10-28. Phases 0–4 and five console blocks in one session with skill
> `command-review`, the desktop block (UCD) in a second with the owner's mouse; the twenty-third
> review of `docs/coverage/roadmap.md`'s order.
>
> It owns no cross-cutting area. It took what the View review left it: UCS Restore's not-found
> words (`ucsUndefined`, VIEW-D23), the `*TOP*` name after U of an orthographic -VIEW (VUN-06), and
> OBject's locked objects.
>
> The full plan is in git: `git show c5b92ad:docs/plans/ucs-review.md`. It holds the inventory,
> the matrices, the findings, decisions UCS-D1 to D103, the refuted suspicions, and coverage and
> rules ↔ code.

## Summary

There were 0 critical, 3 high, 18 medium and 22 low findings, all executed in seven commits.

The worst:

- **UCS OBject passed over an object on a locked layer**, where 2027 takes it, picked or found by a
  mode, in silence (UCB-01).
- **UCS Move dropped the UCS's name and left the saved UCS as it was**; 2027 keeps the name and
  rewrites the saved entry (UCH-02).
- **Dynamic input at UCS's point prompts showed `X,Y` and read a typed point absolute**; 2027 shows
  distance and angle from the base and reads `30,0` as `@30,0` (UCD-01).
- **ELEVATION went back to 0 whenever the UCS became the WCS**; 2027 resets it with World and
  -VIEW's orthographic views only (UCO-03). The third point was read in another frame (UCO-02).

**Evidence:**

- About 200 console probes in es-ES and en-US (p100–p169, p200–p269, p300–p369, p400–p442) on
  AutoCAD 2027 (ACADVER 26.0, X.118); the tables of 2026-10-20; `acad.cuix`'s macros; each
  language's `acad.pgp`. Most of the code cited AutoCAD 2023's console: every such cell was probed
  again.
- A desktop pass: d01–d07 (en-US) and e01 (es-ES).

## Probes

Console inputs are `scripts/research/probes/ucs/<id>.txt` (`.plain` untraced, `.es` / `.en` one
locale), run with `scripts/research/probe.sh ucs <ids>`; the desktop pass is
`scripts/research/probes/ucs/d01-e01.sh` (`lib-dsk.sh`). Transcripts and screenshots are in
`research/probes/ucs/` (gitignored).

| Id | What it asks |
| --- | --- |
| p100–p169 | the first prompt, its points, X / Y / Z, ZAxis, World, View, Previous, ELEVATION, transparency, undo, the preselection |
| p200–p269 | the hidden words (Origin, 3point, Move, Zdepth, orthoGraphic, New, Face, Apply, SEction), NAmed and the table, files |
| p300–p345 | OBject and ZAxis Object on each type, picked and by each mode; locked layers |
| p346–p369 | UCSICON, 'UCSICON, ELEV; saved and opened |
| p400–p442 | ELEVATION after -VIEW and PLAN; X / Y by a point; Face's pick; 'UCSICON's undo; snaps and modes at the picks; a closed spline; `@` at the first prompt in a moved UCS |
| d01, d07 | the icon (3D, white, a Z arm, edge-on) and its Properties |
| d02, e01 | the icon's grips and shortcut menu, in both languages |
| d03 | the ViewCube's UCS menu, its echo and undo |
| d04 | the jig's band, dynamic input's fields and the Down list, a relative typed point |
| d05, d06 | the right button, Space, a Save name with a space; OBject's and ZAxis Object's hover, a click on nothing, the hatch |

## Findings

| Id | What it was | Outcome | Commit |
| --- | --- | --- | --- |
| UCO-01 | Face not listed at the first prompt | listed | `8ddbc70` |
| UCO-02 | the third point read in the UCS moved to the origin | read along the new X; LASTPOINT the point given | `8ddbc70` |
| UCO-03 | ELEVATION reset whenever the UCS became the WCS | World and -VIEW's orthographic views only | `8ddbc70` |
| UCO-04 | X and Y by a point asked two points | one, from the UCS's origin | `8ddbc70` |
| UCO-05 | ZAxis's Z point on the origin: `Invalid point.` | `Points are coincident` | `8ddbc70` |
| UCO-06 | U after OBject on nothing left LASTPOINT | the WCS's origin | `8ddbc70` |
| UCO-07, UCO-08 | coverage and tests of the first prompt; LINE's typed length with no heading | rewritten; the runtime's fix | `8ddbc70` |
| UCH-01 | `F` refused at New's prompt | Face listed and asked; `No 3D solid, surface or mesh detected.` | `f5a23ff` |
| UCH-02 | Move dropped the name and left the saved entry | name kept, entry rewritten | `f5a23ff` |
| UCH-03 | Origin's Enter kept the name | the UCS applied, the name dropped | `f5a23ff` |
| UCH-04 | `3P` refused | 3point (`keywords.ts`: a digit counts as a capital) | `f5a23ff` |
| UCH-05, UCH-06 | SEction declared; stale citations | Missing with its prompt; 2027 probes cited | `f5a23ff` |
| UCN-01 | NAmed refused the first prompt's words; Enter did nothing | taken hidden; Enter is World | `0bb97de` |
| UCN-02, UCN-03 | the replace question's colon; a replaced entry renamed | no colon; its stored name kept | `0bb97de` |
| UCN-04, UCN-05 | Spanish not-found and invalid-name words | the console's | `0bb97de` |
| UCN-06, UCN-07 | Restore of a bad name; the listing named an orthographic UCS | `Invalid UCS name.`; left out | `0bb97de` |
| UCI-01, ELV-01 | the icon's scene and ELEV's cells untested | tests | `52b0853` |
| UCB-01, UCB-02 | OBject passed over locked objects; ZAxis Object said nothing of one | taken in silence; BREAK's words | `a2c5e2f` |
| UCB-03 | a mode's object read elsewhere | per type, as 2027 reads each | `a2c5e2f` |
| UCB-04 to UCB-07 | a hatch, an object without ends, a mode finding nothing, Enter at ZAxis Object | their 2027 words and ends | `a2c5e2f` |
| UCB-08, UCB-10 | LASTPOINT after a click on nothing; stale citations | at the click (d06 confirmed it); 2027 probes | `a2c5e2f` |
| UCB-09 | the picks' hover `THEME.selected` | `rollover`; reversed for OBject by UCD-03 | `a2c5e2f` |
| UCB-11, UCB-12 | a mode finding a hatch or a circle: `1 was filtered out` | the newest taken whatever its type, then refused (UCS-D100); `_END` and `_MID` at OBject's pick | `facc991` |
| UCB-13 | a closed spline's X found by a mode | Missing (no rule fits p434, p438, p439) | `facc991` |
| UCD-01 | dynamic input `X,Y`, absolute, at UCS's point prompts | Length / Angle from the base, `x,y` relative; `@` from LASTPOINT at the first prompt (p442) | `02afb18` |
| UCD-02 | a solid band at three prompts | dashed amber at every point prompt and the rotation | `02afb18` |
| UCD-03 | OBject's hover the white rollover | the selection's glow, the padlock over a locked object | `02afb18` |
| UCD-04 | a red and green icon with arrowheads, a broken pencil | the 3D icon: white, a Z arm off the plan, edge-on X and Z | `02afb18` |
| UCD-05 | a Save name ended at a space | Save's and Restore's names take one (`takesSpaces`) | `02afb18` |
| UCD-06 | the ViewCube's menu read `*TOP*` as the WCS, no unnamed item; es `Sin nombre` | `Unnamed` checked, the separators; `S-nombre` | `02afb18` |
| UCD-07, UCD-08 | the menu's echo; the icon's grips and shortcut menu | Missing, sized in both languages | `02afb18` |

Decisions added in the execution:

- **UCO:** `ucsChange` takes `{ resetsElevation }`, passed by World and -VIEW's orthographic views;
  World with the WCS current changes ELEVATION only and pushes no Previous.
- **UCH:** Face's pick is an `ObjectSelector` with `one.none`: Crossing writes
  `No 3D solid, surface or mesh detected.` whatever it finds, Fence and CPolygon end in silence
  (p420–p426). Apply and SEction are not declared.
- **UCN:** a replaced entry keeps its place in the table; Restore checks a name's characters, not
  its length.
- **UCB:** OBject and ZAxis Object hold one selector each (`takesLocked` for OBject only); a closed
  spline found by a mode is read as if picked at the WCS's origin.
- **UCD:** the band and the box's readings at the first prompt and ZAxis's origin measure from the
  current UCS's origin, a typed `@` from LASTPOINT (d04-5, d04-6, p442); a bare number there in a
  moved UCS stays **unverified**. Delete's names keep ending at a space (unprobed). THEME keeps
  `ucsIconX` and `ucsIconY`, unused (public).

## Still open

What stays **unverified** or **Missing** is in `docs/coverage/coordinate-systems.md`. Worth a later
probe: a bare number at the first prompt in a moved UCS; Delete's names with a space; the rule for a
closed spline's X (UCB-13); ZAxis Object's typed object snaps.

Built here only in part: Apply, SEction, Face on real objects (no solids), UCSMAN, the icon's grips
and shortcut menu (UCSSELECTMODE), the jig's icon preview and turned crosshair (UCS-D101), the
ViewCube menu's echo (UCS-D103), UCSICON's All, Selectable and Properties, OBject on a dimension.

**Analogues for the reviews that follow** (roadmap): the landing's own UCS icon
(`components/marketing/ucs-icon.tsx`) still draws the 2D colours and arrowheads; the Workspace
review checks the other chrome menus' echo against 2027's (the ViewCube's writes prompts without
answers), and every prompt that names something for spaces (`takesSpaces`).

## Template improvements

Applied on 2026-10-28 after the console blocks: the previous review's transcripts and each file's
old citations counted (template §4.1), ranges of 100 and the reviewer's `p400`, findings numbered
without gaps (§4.8).

Applied after the desktop block, the same day:

- template §4.1: a look (a hover, a band, an icon) is changed by a rule's analogy only after the
  desktop pass — UCB-09 had to be reversed for OBject (UCD-03).
- template §5.3: a suspicion refuted as the console's artefact waits for the desktop too (p237,
  UCD-05).
- matrix.md D: at a prompt with a base, the box's fields and whether `30,0` typed there is
  relative.
- annex-probes.md §4: each profile places the view otherwise (draw a rectangle first); a menu that
  starts a command locks COM until a click on the command line.

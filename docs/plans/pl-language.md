# Polish (`pl`) — summary

The fifth language after the pilot: `pl` from nothing to `live` at `/pl` on 17/11/2026, in one
session (the Polish session of the visibility plan, `docs/next-seo.md`, L8), through skill
`add-language`, in three commits as Russian's. Its words, sources, register and typography, the
desktop, the letters' face, what stays unverified and its review are `docs/i18n/pl.md`. What did
not fit was fixed in the system, never in the language; each commit says what.

- **Tag `pl`, URL `/pl`**, `og:locale` `pl_PL`, «Polski» in the selector: one Polish, as AutoCAD
  has one (`pl-PL`).
- **The command language before the site's text**, as Russian: the command notes name each
  command in Polish («Polecenie ODSUŃ (OFFSET) w AutoCADzie»).
- **The language pack** was found where Russian's was (ceethreedee.com's list) and installed on
  the owner's AutoCAD, then the 2027.1 update again. A Polish probe with `ą ł ń` goes to the
  console as a UTF-8 script, as a Russian one.

| Block | Commit | What |
| --- | --- | --- |
| Research and plan | `71cf4bfb` docs | The research; `runacc.sh` knows the Polish console's banner; the Polish names probes (-OSNAP's `KOŃ`, FROM's `OD`) |
| Draft (phases 1–5) | `04deda37` feat(i18n) | Registered as a `draft` (`localized`, `latin-ext`); the engine's catalog whole (434 probes, the desktop, the tables, three agents); the site, the editor, the "Use" pages, the 101 command notes and the 12 exercises (seven agents, one brief); the Polish letters' face before Inter; `locales.test.ts` reads a keyword's label as its id |
| Live (phase 6) | feat(i18n): Polish goes live | Measured, a model's reread, `live`; Polish named in every landing; aliases the console disproved (`WT`, `ODLUW`, `D`, `DDUNITS`) and two it confirmed (`OR`, `ODJEDN`) (`docs/i18n/pl.md`, "Going live", "Review") |

## What is left

Each item is in `docs/i18n/pl.md`, "Unverified", "Per command" and "Review": what no probe showed
(our own messages, LIST's lines for some solids, the short field labels), what Polish words per
command or per prompt where English shares one id (`solidHeightTopOr`, `enterNextPointOr`,
SPLINEDIT's closed-spline menu, -VIEW's orthographic words), AltGr in a field on a real Windows
keyboard, and what a native reader should settle. Skill `language-review` takes the rest, and
keeps the language current after the next AutoCAD update.

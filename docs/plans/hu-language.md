# Hungarian (`hu`) — summary

The seventh language after the pilot: `hu` from nothing to `live` at `/hu` on 19/11/2026, in one
session (the Hungarian session of the visibility plan, `docs/next-seo.md`, L8), through skill
`add-language`, in three commits as Czech's. Its words, sources, register and typography, the
desktop, the letters' face, what stays unverified and its review are `docs/i18n/hu.md`. What did
not fit was fixed in the system, never in the language; each commit says what.

- **Tag `hu`, URL `/hu`**, `og:locale` `hu_HU`, «Magyar» in the selector: one Hungarian, as AutoCAD
  has one (`hu-HU`).
- **The command language before the site's text**, as Czech: the command notes name each command
  in Hungarian («AutoCAD PÁRH (OFFSET) parancs»).
- **The language pack** was found where Czech's was (ceethreedee.com's list) and installed on the
  owner's AutoCAD, then the 2027.1 update again. A Hungarian probe with `ő ű` goes to the console
  as a UTF-8 script; `á é í ó ö ú ü` are Windows-1252's and go as input.

| Block | Commit | What |
| --- | --- | --- |
| Research and plan | `580b4d03` docs | The research; `runacc.sh` knows the Hungarian console's banner; the Hungarian names probes (-OSNAP's words read bit by bit from OSMODE, FROM's `PONTTÓL`, RECTANG's `TÉGL` and `TÉGLALAP`) |
| Draft (phases 1–5) | `209f1f08` feat(i18n) | Registered as a `draft` (`localized`, `latin-ext`); the engine's catalog whole (454 probes, the desktop, the tables, five agents); the site, the editor, the "Use" pages, the 101 command notes and the 12 exercises (six agents, one brief); the letters' face with Hungarian's four |
| Live (phase 6) | feat(i18n): Hungarian goes live | Measured, a model's reread, `live`; Hungarian named in every landing; `og:locale:alternate` and each SVG's `direction="ltr"` gone to keep `/fr` under 250 KiB (`docs/i18n/hu.md`, "Going live", "Review") |

## What is left

Each item is in `docs/i18n/hu.md`, "Unverified", "Per command" and "Review": what no probe showed
(our own messages, LIST's lines for a cone and a gradient, the short field labels), what Hungarian
words per command or per prompt where English shares one id (`specifyNextPointOr`,
`valueMustBeNonzero`, ELLIPSE's and SPLINE's keywords, CONE's tight diameter default),
AltGr in a field on a real Windows keyboard, and what a native reader should settle. Skill
`language-review` takes the rest, and keeps the language current after the next AutoCAD update.

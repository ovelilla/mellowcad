# Czech (`cs`) — summary

The sixth language after the pilot: `cs` from nothing to `live` at `/cs` on 17/11/2026, in one
session (the Czech session of the visibility plan, `docs/next-seo.md`, L8), through skill
`add-language`, in three commits as Polish's. Its words, sources, register and typography, the
desktop, the letters' face, what stays unverified and its review are `docs/i18n/cs.md`. What did
not fit was fixed in the system, never in the language; each commit says what.

- **Tag `cs`, URL `/cs`**, `og:locale` `cs_CZ`, «Čeština» in the selector: one Czech, as AutoCAD
  has one (`cs-CZ`).
- **The command language before the site's text**, as Polish: the command notes name each command
  in Czech («Příkaz EKVID (OFFSET) v AutoCADu»).
- **The language pack** was found where Polish's was (ceethreedee.com's list) and installed on the
  owner's AutoCAD, then the 2027.1 update again. A Czech probe with `č ř ů` goes to the console as
  a UTF-8 script; `š ž` are Windows-1252's and go as input.

| Block | Commit | What |
| --- | --- | --- |
| Research and plan | `cf27f512` docs | The research; `runacc.sh` knows the Czech console's banner; the Czech names probes (-OSNAP's words, FROM's `ODBODU`, RECTANG's `OBD` and `OBDÉLNÍK`) |
| Draft (phases 1–5) | `a6e1a4d6` feat(i18n) | Registered as a `draft` (`localized`, `latin-ext`); the engine's catalog whole (433 probes, the desktop, the tables, four agents); the site, the editor, the "Use" pages, the 101 command notes and the 12 exercises (seven agents, one brief); the letters' face with Czech's 18; a closed spline's SPLINEDIT words per prompt in every language; Polish's doubled LIST padding |
| Live (phase 6) | feat(i18n): Czech goes live | Measured, a model's reread, `live`; Czech named in every landing; the letters' face's range and «Čeština»'s rule made smaller to keep `/fr` under 250 KiB (`docs/i18n/cs.md`, "Going live", "Review") |

## What is left

Each item is in `docs/i18n/cs.md`, "Unverified", "Per command" and "Review": what no probe showed
(our own messages, LIST's lines for a cone and an array, the short field labels), what Czech words
per command or per prompt where English shares one id (`boxLength`, `selectFacesOr`, PLINE's arc
with Close, SPLINE's Close, CHAMFER's Distance), AltGr in a field on a real Windows keyboard, and
what a native reader should settle. Skill `language-review` takes the rest, and keeps the language
current after the next AutoCAD update.

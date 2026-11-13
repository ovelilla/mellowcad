# Russian (`ru`) — summary

The fourth language after the pilot: `ru` from nothing to `live` at `/ru` on 13/11/2026, in one
session (the Russian session of the visibility plan, `docs/next-seo.md`, L8), through skill
`add-language`, in three commits as the owner asked. Its words, sources, register and typography,
the desktop, what stays unverified and its review are `docs/i18n/ru.md`. What did not fit was
fixed in the system, never in the language; each commit says what.

- **Tag `ru`, URL `/ru`**, `og:locale` `ru_RU`, «Русский» in the selector: one Russian for Russia,
  Ukraine, Kazakhstan and Belarus, as AutoCAD has one (`ru-RU`).
- **The command language before the site's text**, as German: the command notes name each
  command in Russian («Команда ОБРЕЗАТЬ (TRIM) в AutoCAD»).
- **The language pack** was found where German's was (ceethreedee.com's list) and installed on
  the owner's AutoCAD, then the 2027.1 update again. The console reads its input as Windows-1252:
  a Russian probe runs as a UTF-8 script (`runacc.sh`).

| Block | Commit | What |
| --- | --- | --- |
| Research and plan | `adf9dba1` docs | The research; `runacc.sh` reads the Russian console and runs a probe in Cyrillic; `console-pair.mjs` reads a trace whose message quotes with « » |
| Draft (phases 1–5) | `92e2bfe7` feat(i18n) | Registered as a `draft` (`localized`, `cyrillic`); the engine's catalog whole (426 probes, the desktop, the tables, three agents); the site, the editor, the "Use" pages, the 101 command notes and the 12 exercises (six agents, one brief); FROM read apart (`ОТ`); `pluralMessage`'s `other`; the Cyrillic text metrics and share card; a language's `promptKeywords` its own; the catalog's budget by script |
| Live (phase 6) | feat(i18n): Russian goes live | Measured, a model's reread, `live`; Russian named in every landing and by hand; ZOOM's `nXП`; the 285 KiB budget for a script with two faces (`docs/i18n/ru.md`, "Going live", "Review") |

## What is left

Each item is in `docs/i18n/ru.md`, "Unverified" and "Per command": what no probe showed (our own
messages, some short field labels, PURGE's plurals past one), what Russian words per command or per
prompt where English shares one id (`enterAnOption`, `copySecondPointOr`, DIST's Length, -VIEW's
orthographic words), the yes-or-no prompts' `<Н>` and the style prompts' `(?)`. Skill
`language-review` takes the rest, and keeps the language current after the next AutoCAD update.

# German (`de`) — summary

The third language after the pilot: `de` from nothing to `live` at `/de` on 13/11/2026, in one
session (the German session of the visibility plan, `docs/next-seo.md`, L8), through skill
`add-language` phase by phase. Its words, sources, register and typography, the desktop, what stays
unverified and its review are `docs/i18n/de.md`. What did not fit was fixed in the system (the
prompts' grammar, the shortcuts page, AltGr), never in the language; each commit says what.

- **Tag `de`, URL `/de`**, `og:locale` `de_DE`, «Deutsch» in the selector: one German for Germany,
  Austria and Switzerland, as AutoCAD has one (`de-DE`).
- **The command language before the site's text**, as French and Italian: the command notes name
  each command in German (`Befehl STUTZEN (TRIM) in AutoCAD`).
- **The language pack** was found where French's and Italian's were (ceethreedee.com's list) and
  installed on the owner's AutoCAD, then the 2027.1 update again.

| Phase | Commits | What |
| --- | --- | --- |
| 0 | `c3c2d6d9` docs | The research and this plan; `runacc.sh`'s German banner |
| 1 | `ab9b3670` feat(i18n) | Registered as a `draft` (`localized`, `latin`): `routing.ts`, `catalogs`, the diagrams' fixture, the docs' quotes („ “); empty catalogs; the editor's `./locales/de` entry and its changeset; `docs/i18n/de.md` |
| 3–4 | `f6285655` feat(engine) | The engine's catalog whole: the interface by id from the installed pack, the command language from the console (425 probes, `names/*.de.txt`), the messages rebuilt as ICU; the desktop's toggles, Polar's readout, the ViewCube; `commands.promptTails` and `beforeTail` for German's verb after the list, prompt ids of their own for the solids asked with no default, twelve `promptKeywords` slots; `· de` in every coverage heading; `germanPrompts.test.ts` |
| 2 | `4be7bdf1` feat(i18n) | `messages/de.json` from the search texts, the editor's catalog by id, the eight "Use" pages, the 101 command notes and the 12 exercises (six agents, one brief), the generated pages; the shortcuts page's `Strg` (`Docs.keys.ctrl`) |
| 5 | — | Nothing: latin, left to right; plurals as `de.md` says |
| 6 | feat(i18n): German goes live | Measured, then `live`; a model's reread; the hand-named lists; AltGr typed on the drawing, for every language (`de.md`, "Input", "Going live", "Review") |

## What is left

Each item is in `docs/i18n/de.md`, "Unverified" and "Per command": what no probe showed (the
unused `feedback.measure*` readout, our own messages, LIST's lines for some solids, a few prompts),
what German words per command where English shares one prompt (`valueMustBeNonzero`,
`specifyEndpointOfLineOr`, EXTRUSION's path Taper), and AltGr in a field on a real Windows keyboard.
Skill `language-review` takes the rest, and keeps the language current after the next AutoCAD
update.

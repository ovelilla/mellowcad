---
name: autocad-research
description: Establish how AutoCAD behaves and words something before building or changing a command — run a probe in AutoCAD 2027's console from WSL (optionally tracing each prompt's keywords, defaults and flags), drive the desktop AutoCAD to see dialogs and on-screen feedback, render a drawing to PNG, look up a prompt, message or keyword in its string tables, or read Autodesk's help. Use when a behaviour, prompt, default or wording is unclear, or a coverage row says unverified.
---

# Researching AutoCAD

The AutoCAD installed is **2027** (R26.0) on Windows, in Spanish with the English language pack too; every
tool runs from WSL through interop. Pick the source by the question:

| Question                                                                   | Source                      | Read       |
| -------------------------------------------------------------------------- | --------------------------- | ---------- |
| What a command asks, accepts, refuses and produces, verbatim               | the console                 | console.md |
| A prompt's options: keywords in Spanish and English, defaults, Enter, zero | the console, traced (`-t`)  | tracing.md |
| The raw initget string and flags                                           | the desktop AutoCAD, traced | tracing.md |
| Exact geometry of a result, every property                                 | MPDUMP, traced run          | tracing.md |
| How AutoCAD draws a result: linetypes, hatches, dimensions, text           | the console, plotted to PNG | console.md |
| What the user sees: jig, grips, snap markers, dialogs, palettes            | the desktop AutoCAD         | gui.md     |
| The exact wording, by id, in English and Spanish                           | the string tables           | below      |
| What no program shows: intent, the cursor, documented defaults             | Autodesk's help             | below      |

The console settles what a command does; the help never overrides it. What none of them settles
is written **unverified** in `docs/coverage/`, with what was seen instead. Cite the table id
(`21682`) or the probe in tests and comments, so the next person can check it again.

## The string tables

`research/strings/` is gitignored, because it holds Autodesk's text, not ours. Copy it along with
the project. Each table is `id<TAB>text`, with the text JSON-quoted:

| File                                                         | Source                                                   |
| ------------------------------------------------------------ | -------------------------------------------------------- |
| `st2027_en.tsv`, `st2027_es.tsv`                             | `acadres`, AutoCAD 2027 English and Spanish              |
| `AcDimRes_*`, `acmtedRes_*`, `AcArrayRes_*`, `texteditRes_*` | the dimension, MTEXT, array and TEXTEDIT resources, 2027 |
| `all_en.tsv`, `all_es.tsv`                                   | everything above merged, the other DLLs' ids prefixed    |
| `st2023_en.tsv`                                              | `acadres`, AutoCAD 2023 English, kept for history        |

`node scripts/research/pair.mjs "<regex>"` prints every English string that matches, beside the
Spanish one of the same id. The tables come from the installed DLLs: after an AutoCAD update,
regenerate them with `node scripts/research/strtable.mjs <dll>` from the install's `en-US/` and
`es-ES/` folders (it reads the PE file, nothing runs). **An update rewords prompts**: 2027's
update turned DIMANGULAR's `Designe primer extremo` into `Designe primer punto final del
ángulo`, so a table from the release's language pack is not the current product. The installed
language packs are English and Spanish; AutoCAD has none for Arabic. The palettes' labels are in
`ax24res.dll` / `ax26res.dll` and `acappres.dll`.

`node scripts/research/catalog-sweep.mjs` checks the engine's catalogs against the tables (skill
`command-review`).

A keyword is the word the table declares for `initget`; the prompt lists its label. How both are
written in the catalogs is in `.claude/rules/cad-catalogs.md`.

## Autodesk's help

**Find** a page with Autodesk's Product Help MCP server — public, no sign-in, configured in
`.mcp.json` as `autodesk-help` (tool `search_help_content`). Without the MCP tools, the same call
works with curl:

```bash
curl -sS https://developer.api.autodesk.com/knowledge/public/v1/mcp \
  -H 'Content-Type: application/json' -H 'Accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"search_help_content",
       "arguments":{"query":"OFFSET command","locale":"en_US","product_name":"AutoCAD",
       "release_code":"2027","max_results":5}}}' | sed -n 's/^data: //p'
```

It returns titles, URLs (with the page's GUID) and an excerpt of about 1 KB, support articles
included (they often quote a whole command-line session). `locale` is `en_US` or `es_ES`.

**Read** the whole page from its GUID with curl or WebFetch:
`https://help.autodesk.com/cloudhelp/2027/ENU/AutoCAD-Core/files/GUID-….htm` (`ESP` for the
Spanish page, which shares the GUID). Only the `view/ACD/…` viewer is a JavaScript shell that
needs a browser (skill `browser-verify`). Pages already read are in `research/autodesk-help/`
(gitignored, named by GUID): grep there first.

- **A thin command page is not an undocumented behaviour.** COPYCLIP's reference page has no
  prompts; the rule that decides it ("the cursor location is based on the lower-left corner of the
  extents of the objects you selected") is on a _Have You Tried_ page, and the prompt order on a
  _To …_ task page. Read `About …`, `To …` and `Have You Tried` before concluding that something
  cannot be verified.
- Spanish names come from the Spanish help pages that share the English GUIDs.

## Routes tried and dropped

So that nobody spends a session on them again (October 2026):

- **AutoCAD's own MCP server** and window messages (WM_COPYDATA, WM_CHAR): gui.md.
- **Community MCP servers** (COM, Lisp IPC or ezdxf based) draw and query objects; none exposes
  prompts or keywords, which MellowProbe does.
- **APS Design Automation** runs this same console in the cloud, for pay. **PyRx** (Python inside
  AutoCAD) needs a Windows Python. Autodesk's AutoLISP extension for VS Code does not run under
  Remote-WSL. **AcEdInputContextReactor** (C++) would need Visual Studio and ObjectARX; the
  command line monitor of tracing.md gives the same initget string.

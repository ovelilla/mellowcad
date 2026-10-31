---
description: Where AutoCAD's behaviour and wording are looked up before a command or a catalog changes, and what counts as settled
paths:
  - "cad/locales/**"
  - "docs/coverage/**"
---

# Researching AutoCAD

Check a behaviour before building it, in this order: **AutoCAD's console** (what a command does,
verbatim; traced, each prompt's keywords, defaults and flags), **its string tables** in
`research/strings/` (the exact wording, English and each translation, by id), **the desktop
AutoCAD** (what the user sees: dialogs, jigs, grips), then **Autodesk's help** (what no program
shows). What none of them settles is written **unverified** in `docs/coverage/`, with what was
seen instead. Cite the table id (`21682`) or the probe in tests and comments, so the next person
can check it again. How to run each: skill `autocad-research`.

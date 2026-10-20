---
paths:
  - "cad/locales/**"
  - "docs/coverage/**"
---

# Researching AutoCAD

Check a behaviour before building it, in this order: **AutoCAD's console** (what a command does,
verbatim), **its string tables** in `research/strings/` (the exact wording, English and Spanish,
by id), then **Autodesk's help** (what the console cannot show). What none of them settles is
written **unverified** in `docs/coverage/`, with what was seen instead. Cite the table id
(`21682`) or the probe in tests and comments, so the next person can check it again. How to run
each: skill `autocad-research`.

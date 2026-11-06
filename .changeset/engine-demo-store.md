---
"@mellowcad/engine": patch
---

`recordDemo(script, { store })` autosaves the session's drawing to a store, as a `CadDriver`'s does: once recorded, the store holds the drawing file a user would open, so a site can hand out a drawing a script made (MellowCAD's exercises open in the editor that way).

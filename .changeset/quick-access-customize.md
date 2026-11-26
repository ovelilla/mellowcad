---
"@mellowcad/editor": minor
---

The Quick Access Toolbar has AutoCAD's Customize ▾ after its last button: a list of the commands it can show — New, Open, Save, Save As..., Undo, Redo, Match Properties and Properties — each checked while the toolbar shows it, a pick adding the command at the toolbar's end or taking it away. `layoutStorage` gains `quickAccess`, the key under which the device remembers the toolbar. A focused control of the title bar now keeps Delete, Backspace, Enter and Space from the drawing, as the ribbon's do. The editor's catalog gains `TitleBar.quickAccess`.

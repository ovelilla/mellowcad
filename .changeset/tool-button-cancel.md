---
"@mellowcad/engine": patch
---

A tool's button (`setActiveTool`) cancels the running command first, as AutoCAD's `^C^C_line` does, `*Cancel*` written after its prompt: pressed while its own command runs, it starts it anew instead of doing nothing, the segments already drawn kept; MTEXT's and TEXTEDIT's editor keep their text as before.

---
"@mellowcad/engine": minor
"@mellowcad/editor": minor
---

The command line floats over the foot of the drawing, as AutoCAD's starts: one line 27 px high and as wide as the drawing, with its close button, Recent Commands, the field (`Type a command` at rest, with no `Command:` before it) and the history's arrow; the temporary prompt lines are each a label of their own above it. The drawing takes the row the docked line had, and a `CommandLine` slot of your own renders over the drawing's foot instead of in a row. The engine gains `closeCommandLine` (the close button, as Ctrl+9 hides the line), `runRecentCommand` and the state `commandLine.recentCommands` (the commands run this session, newest first). The editor's catalog trades `CommandLine.placeholder` for `typeCommand`, and adds `close` and `recentCommands`, AutoCAD's words in every language.

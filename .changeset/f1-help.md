---
"@mellowcad/engine": minor
"@mellowcad/react": minor
"@mellowcad/editor": minor
---

F1 is AutoCAD's Help: the engine asks its host for the help of the running command, by its global name, or for the help's start with none (`CadEngineOptions.onHelp`, `CadDriverOptions.help`); `CadCanvas` hands `onHelp` on, and `CadEditor` opens its `help` links in a new tab. Without a help to show, F1 stays the browser's.

---
"@mellowcad/engine": minor
"@mellowcad/editor": minor
---

Undo and Redo on the Quick Access Toolbar are AutoCAD's split buttons: the button runs `_.undo` or `_.mredo` answered 1, the running command cancelled first, and the arrow lists the steps, the next first, named as AutoCAD's lists name them (`Line`, `Group of commands`, `- Mark -`; es `Linea`), each row taking back or doing again that many. The engine's `EngineState.undoSteps` and `redoSteps` are the lists, `undoSteps(count)` and `redoSteps(count)` run the macros, and its catalog has `commands.messages.undoListGroup` and `undoListMark`; the editor's has `TitleBar.undoCount` and `redoCount`.

---
"@mellowcad/engine": minor
"@mellowcad/editor": minor
---

The title bar names the drawing, centred, as AutoCAD's title does: `EngineState.drawingName` is DWGNAME, the file opened or the one QSAVE, SAVEAS or DXFOUT last wrote the whole drawing to, else the session's new drawing's (`Drawing1.dwg`, `Drawing2.dwg` after NEW, in the command language: es `Dibujo1.dwg`), and `drawingTitled` (DWGTITLED) says which. The engine's catalog has a new key, `commands.defaults.drawing`.

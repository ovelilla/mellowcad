---
"@mellowcad/engine": minor
---

`writeDxf()` on `CadEngine` and `CadDriver` returns the drawing as a DXF, AutoCAD 2000 to 2018, ASCII or binary, with no dialog, no command and no undo step, and counts what the file could not hold; `CadDriver.openFile` opens a DXF or a drawing file as `CadEngine.openFile` does.

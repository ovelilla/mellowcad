---
"@mellowcad/engine": minor
---

Tables (`TableEntity`, with `TableCell`, `TableCellBlock`, `TableStyleData`, `TableRowStyle` and `TableOverrides`, among `Entity`'s types), as AutoCAD 2027 opens one: drawn from its cells as AutoCAD redraws its block (each cell's text at its alignment inside the margins, a block cell's block fitted to it, the grid's lines broken by spans), picked and snapped through what it draws, with a grip at its corner that moves it; MOVE, COPY, ROTATE, SCALE (its sizes and texts, as AutoCAD writes them) and MIRROR (its text kept readable), EXPLODE and LIST in every language; STRETCH leaves it, and OFFSET, AREA, BREAK, DIVIDE, TRIM, FILLET and CHAMFER refuse it as AutoCAD does. A DXF opens and saves its ACAD_TABLE objects and their TABLESTYLE. Drawing file version 60.

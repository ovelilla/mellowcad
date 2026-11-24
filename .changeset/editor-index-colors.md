---
"@mellowcad/editor": patch
---

The colour pickers and the layer manager name an index colour past 7 and a true colour as AutoCAD does (`Color 30` in the Properties palette, `30` in the title bar, `255,127,0`), and paint every swatch in the colour's RGB.

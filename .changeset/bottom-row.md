---
"@mellowcad/editor": minor
---

The status bar takes AutoCAD's bottom row of 33 px: its tools are 24 × 24 with a menu's arrow 16 wide beside them, laid from the row's end with the coordinates as their first tool and Customization alone at the edge, where the layout tabs would take the row's start. The `StatusBar` slot's zone is 32 px high (33 with its border) and no longer spaces its children: a replacement lays out its own.

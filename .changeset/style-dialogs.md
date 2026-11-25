---
"@mellowcad/engine": minor
"@mellowcad/editor": minor
---

STYLE and DIMSTYLE open AutoCAD's Text Style dialog and Dimension Style Manager, run as commands while they show: `state.styleDialog` replaces `state.stylesTable`, `setStyleDialog` replaces `setStylesTable`, `proposedStyleName` gives the name New proposes, and the palette panel loses its Styles tab (`PaletteTab` no longer has `styles`). The editor draws both dialogs, with New Text Style, Create New Dimension Style and the New and Modify pages; its catalog's `Styles` section is now `TextStyle` and `DimStyle`, in AutoCAD's words in every language.

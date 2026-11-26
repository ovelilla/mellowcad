---
"@mellowcad/engine": minor
"@mellowcad/editor": minor
---

The Properties palette is laid out as AutoCAD 2027's: its categories in AutoCAD's order, each folding by its header, and each row a label and its value in two columns, the value at its cell's start. A fold is kept per object type, as AutoCAD keeps it per class, under the new `layoutStorage.properties` key (nothing is kept without it). From the keyboard the arrows walk the type list, the headers and the values, Left and Right fold and open a header (mirrored right to left), and a click or Enter on a header folds it and hands the keys to the drawing. The text style's picker moved into the Text category as AutoCAD's Style, and the dimension style's to the head of Misc; the editor's catalog loses `Properties.textStyle` and gains `Properties.style`, AutoCAD's word in every language. A letter typed on a closed drop-down outside a dialog no longer picks a value as well as typing a command. In the engine, a selection of several types no longer has a `selection` group counting each type (AutoCAD lists them in the type list alone), and the catalogs lose `interface.property.group.selection`.

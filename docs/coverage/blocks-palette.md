# Blocks palette

`BLOCKSPALETTE` implements the Current Drawing tab only, as a tab of the modeless palette panel:
thumbnails rendered through the real `SceneBuilder`, wildcard filter (`?` / `*`), click to INSERT.
No delete, as AutoCAD's palette has none: its thumbnail menu offers Insert, Insert and Explode and
Copy to Favorites (desktop blocks/d06-4); PURGE deletes. The panel stays open while blocks are
placed, so one block after another is a click on each. Missing: Recent / Favorites / Libraries
tabs, drag and drop, the thumbnail's context menu, icon/list toggle, and the Insertion Point /
Scale / Uniform Scale / Rotation / Auto-Placement / Repeat Placement ("prompted automatically for
additional insertion points until you press Esc") / Explode checkboxes.

# Blocks palette

`BLOCKSPALETTE` implements the Current Drawing tab only, as a tab of the modeless palette panel:
thumbnails rendered through the real `SceneBuilder`, wildcard filter (`?` / `*`). INSERT (`I`, es
`IN`) and the rail's Insert open it too, as 2027's INSERT does (desktop blocks/d06).
`'BLOCKSPALETTE` opens it inside a running command, which resumes at once (desktop
workspace/d02-t). A click on a
block asks `-INSERT Specify insertion point or [Scale/Rotate]:` with the block chosen, writing only
that prompt line, and U and REDO name the step `-INSERT` (d06-6, d06-9); AutoCAD's lists
`[Basepoint/Scale/X/Y/Z/Rotate]` there, of which Basepoint, X, Y and Z are -INSERT's Missing.
No delete, as AutoCAD's palette has none: its thumbnail menu offers Insert, Insert and Explode and
Copy to Favorites (desktop blocks/d06-4); PURGE deletes. The panel stays open while blocks are
placed, so one block after another is a click on each. Missing: Recent / Favorites / Libraries
tabs, drag and drop, the thumbnail's context menu, icon/list toggle, and the Insertion Point /
Scale / Uniform Scale / Rotation / Auto-Placement / Repeat Placement ("prompted automatically for
additional insertion points until you press Esc") / Explode checkboxes.

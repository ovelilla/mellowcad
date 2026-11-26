---
"@mellowcad/engine": minor
"@mellowcad/editor": minor
---

The Blocks palette is laid out as AutoCAD 2027's: its Current Drawing tab written upwards at its edge, the filter and a view drop-down (Extra Large Icon, Large Icon, Medium Icon, Small Icon, List) over the blocks, and Options at its foot. Its Options are the engine's (`state.blockInsert`, `setBlockInsertCheck`, `setBlockInsertValue`): Insertion Point, Scale with Uniform Scale and Rotation, each asked as the block is inserted where checked, else taken from its fields. By default only the point is asked, at scale 1 and angle 0, as AutoCAD's profile starts them, so `insertBlock` (the palette's click and the ribbon's gallery) no longer asks the scale and the rotation after the point. The view is `state.blocksView` (`setBlocksView`, `BLOCKS_VIEWS`). The editor's catalog loses `Blocks.filter`, `filterLabel`, `noMatch` and `references`, and gains AutoCAD's words for the tab, the title, the filter's hint, the views and the options in every language. A Properties field's Escape now puts its value back instead of setting what was typed.

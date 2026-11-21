---
"@mellowcad/engine": minor
---

MINSERT, in every language: -INSERT's prompts, then the rows, the columns and their distances (a number, or a unit cell's two corners), one object, AutoCAD's MInsert block (`InsertEntity.grid`, `InsertGrid`): the block drawn again in rows and columns along its rotation, the spacing in drawing units whatever the scale. SCALE scales its spacing, MIRROR negates its columns' with the X scale, EXPLODE refuses it in AutoCAD's words (`1 was minserted.`), LIST adds its columns and rows, and the Properties palette names it `MInsert Block` (a type of its own in `ObjectType`) with its Insertion point and its typed Columns, Column spacing, Rows and Row spacing (`EntityProperty`'s `minsert…`). A DXF opens a MINSERT as that one object, no longer one reference per cell, and saves it as AutoCAD's AcDbMInsertBlock. Drawing file version 63.

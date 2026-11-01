---
"@mellowcad/engine": patch
"@mellowcad/editor": patch
---

FILLETEDGE, CHAMFEREDGE and SOLIDEDIT's faces, as AutoCAD 2027 asks them in English, Spanish (ARISTAEMPALME, ACHAFLANAARISTA, EDITSOLIDO) and Brazilian Portuguese (ARESTACONCORD, CHANFRARARESTA, EDITARSOLIDO): edges taken by a click, Ctrl+Space or a typed point, Chain and Loop, the radius or the distances with Expression, the blend previewed and FILLETEDGE's radius grip; SOLIDEDIT's Extrude, Move, Rotate, Offset, Taper, Delete and Copy of faces. The kernel fillets and chamfers straight edges between planes and circles round cylinders exactly, as ACIS does. FILLETRAD3D is saved in the drawing (`DocumentSettings.filletRadius3d`, file version 49). The editor's rail gains the Solid Editing panel's Fillet Edge and faces split buttons. New catalog keys: `interface.tool.filletedge`, `chamferedge`, `solidedit` and its seven face options, `commands.names`/`keywords` FILLETEDGE, CHAMFEREDGE and SOLIDEDIT, `keywordLabels.SOLIDEDIT`, `promptKeywordLabels.filletEdgeLoopOr`, the `filletEdge*`, `chamferEdge*`, `solidedit*` prompts and messages.

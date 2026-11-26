---
"@mellowcad/engine": minor
"@mellowcad/editor": minor
---

With the ribbon open, HATCH asks AutoCAD's ribbon prompts (`Pick internal point or [Select objects/Undo]:`, and `Select objects or [picK internal point/Undo]:` in its Select objects mode) and shows the Hatch Creation contextual tab; with the ribbon closed it asks -HATCH's, as before. The tab's Pick Points and Select switch the boundaries' mode, its pattern gallery, Type, Angle and Scale set HPNAME, HPANG and HPSCALE as Properties would, inside the command's undo step, and Close Hatch Creation ends it. `ContextualTabId` gains `hatchCreation`, `ContextualFieldId` gains `hatchAngle` and `hatchScale`, `ContextualTab` gains `pattern`, `ContextualEdit` gains `pattern`, `hatchType` and `boundary`, and the engine gains `buildHatchSwatch`, a pattern's swatch as a scene. The engine's catalogs gain the two prompts and the keyword `Pick internal point`; the editor's, the tab's words. A large ribbon button's text breaks where its catalog text has a line break.

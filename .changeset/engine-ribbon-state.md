---
"@mellowcad/engine": minor
"@mellowcad/editor": patch
---

The ribbon's state is the engine's: `EngineState.ribbon` says whether it shows, the tab in front and the member each drop-down shows, kept for the session (`setRibbonTab`, `setRibbonMember`). RIBBON and RIBBONCLOSE show and close it, and Clean Screen closes it and puts it back as it was, with the undo steps AutoCAD 2027 makes; RIBBONSTATE reads it. Until the editor has a ribbon, a closed one hides the tool palette and the top bar's Layers and Properties groups.

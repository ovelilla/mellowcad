---
"@mellowcad/engine": minor
"@mellowcad/editor": minor
---

The ribbon shows AutoCAD's Array Creation contextual tab while ARRAYRECT, ARRAYPOLAR or ARRAYPATH asks its main prompt: after the last tab and in front as it opens, the tab before it coming back as it closes. Its fields, toggles, Method and Close Array act on the running command as its prompts would. `RibbonUi` gains `contextual` (a `ContextualTab`, or null) and the engine gains `editContextualTab`, with the types `ContextualTab`, `ContextualTabId`, `ContextualFieldId`, `ContextualFieldUi`, `ContextualToggleId` and `ContextualEdit`. The editor's catalog gains `Ribbon.fields` and the tab's tabs, panels, items and tooltips; a tooltip whose control names no command (`tipCommands` has no key for it) shows none.

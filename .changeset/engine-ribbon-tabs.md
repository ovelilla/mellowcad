---
"@mellowcad/engine": minor
---

The ribbon's other tabs: `runRibbonButton` takes a `RibbonButton` — Annotate's Update (`_-dimstyle _apply`), the UCS buttons (`_ucs _w`, `_x`, `_3`, …), View's UCS Icon (`_ucsicon _off` / `_on`) and View Cube (NAVVCUBEDISPLAY) toggles, and 3D Tools' Extrude and Revolve; `setVisualStyle` is the Visual Styles gallery and `setAttributeDisplay` the Attribute Display drop-down, each with no echo, as AutoCAD's. `EngineState` gains `visualStyle`, `attributeDisplay` and `ucsIconOn`, `EngineNames` the visual styles' names (`visualStyles`), and the catalog's interface `visualStyle`; `AttributeDisplay`, `VisualStyle`, `RibbonButton` and `UcsButton` are exported.

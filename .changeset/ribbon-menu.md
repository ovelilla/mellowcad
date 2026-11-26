---
"@mellowcad/engine": minor
"@mellowcad/editor": minor
---

A right-click on the ribbon opens AutoCAD's menu: Show Tabs, Show Panels, Show Panel Titles and Close. The 3D Tools tab and View's Visual Styles, Coordinates and Navigate panels now start hidden, as AutoCAD's Drafting & Annotation workspace has them, and the menu brings them back; what it shows is kept with the ribbon's minimize state. `RibbonLayout` gains `hiddenTabs`, `hiddenPanels` and `panelTitles` (a `Ribbon` of your own that sets the layout spreads the one it read); the engine gains `closeRibbon`, the menu's Close. The editor's catalog gains `Ribbon.menu`.

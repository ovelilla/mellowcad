---
"@mellowcad/editor": minor
---

The editor takes AutoCAD's frame: a title bar of 32 px on top, with the application button (48 wide) and the Quick Access Toolbar at AutoCAD's 24×22, then the ribbon's band, 124 high, which RIBBONCLOSE and Clean Screen close and which holds nothing until the ribbon's tabs come. The slot `TopBar` is now `TitleBar`, its props `TitleBarProps`, and the catalog's part `TopBar` is `TitleBar`: a host that replaced, wrapped or reworded the top bar renames them.

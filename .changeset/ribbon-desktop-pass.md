---
"@mellowcad/editor": minor
"@mellowcad/engine": minor
---

The ribbon as AutoCAD's desktop shows it: a tooltip opens at the pointer, 5 px after it and 26 under it, and takes no click; with Show Panel Titles off a panel's title bar is 11 px high, the panel keeping its height; the Quick Access Toolbar's Customize ▾ is 16 × 22, with no tooltip. The engine's `closeRibbon` (the ribbon's right-click Close) now runs as AutoCAD's macro `^C^C_RibbonClose`: the running command is cancelled and `_RibbonClose` written.

---
"@mellowcad/engine": minor
"@mellowcad/editor": minor
---

The title bar ends with AutoCAD's Help ▾, a split button: Help asks the host for help as F1 does (the running command's page, or the start), and its list holds Help and Send Feedback, which leaves the application menu. The engine's `help()` is that question; `TitleBarProps.help` says whether the host shows help, and the catalog's new key is `TitleBar.help`.

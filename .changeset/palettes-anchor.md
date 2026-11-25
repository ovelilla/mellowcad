---
"@mellowcad/editor": minor
---

A palette anchors at either side, as AutoCAD's: Anchor Left and Anchor Right in its properties menu put it on a strip of 25 px at that edge of the drawing (in physical sides, right to left too), a tab with its name, and the pointer or the keyboard's focus on the tab slides it out over the drawing. Auto-hide, the title bar's new button and the menu's entry, folds a floating palette to its title bar until the pointer comes back, anchors a docked one and docks an anchored one. Each palette's `autoHide` is kept under `layoutStorage.palette` with the rest, and `paletteLayoutScript` lays the strips out with the columns before the first paint (`--palette-strip-start`, `--palette-strip-end`). The catalog's `Palette` section has `anchorLeft`, `anchorRight`, `autoHide` and `autoHideButton`, AutoCAD's words in every language.

---
"@mellowcad/engine": minor
"@mellowcad/react": minor
"@mellowcad/editor": minor
---

Each palette is open or closed apart, as AutoCAD's are: `state.palettes` (one flag per palette) replaces `state.palette`, `PALETTES` and `PaletteId` replace `PALETTE_TABS` and `PaletteTab`, `closePalette` takes the palette it closes, `setPaletteOpen` is gone, `state.cleanScreen.palettes` lists the palettes opened while Clean Screen is on, and the `palettes` option (the engine's and `CadCanvas`'s, in place of `paletteOpen`) opens the ones a host remembers. The editor draws each palette as a window of its own, floating over the drawing or docked in a column at either side by a drag (Ctrl keeps it floating), with AutoCAD's vertical title bar, its properties menu (Move, Size, Close, Allow Docking) and a splitter; where each shows, its size and which were open are kept under `layoutStorage.palette`, and `paletteLayoutScript` lays the columns out before the first paint. The `PalettePanel` slot becomes `PaletteContent`, handed which palette it fills (`PaletteProps`); its catalog's `Palette` section has the frame's words, AutoCAD's in every language.

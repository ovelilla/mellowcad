---
"@mellowcad/engine": patch
---

`SvgScenePresenter` draws text without kerning, as `CanvasScenePresenter` does: the engine measures a text's box without it, and the browser's kerning set the glyphs apart from it.

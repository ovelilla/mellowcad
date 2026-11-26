---
"@mellowcad/engine": minor
"@mellowcad/editor": minor
---

The viewport controls have AutoCAD's visual style label after the view's, `[2D Wireframe]`, naming the current style (`[Hidden (Fast)]` off 2D Wireframe), with the list of the styles built: a pick sets the style as the ribbon's gallery does, one undo step. The engine's names gain `viewportVisualStyles`, and its catalog `interface.visualStyleFast`, AutoCAD's `(Fast)` in every language; the editor's catalog gains `Viewport.visualStyle`. The view list now hands the keys back to the drawing when it closes.

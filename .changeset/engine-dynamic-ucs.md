---
"@mellowcad/engine": minor
"@mellowcad/editor": minor
---

The dynamic UCS (AutoCAD's UCSDETECT, F6): at the first point of a command that draws, the work plane lies on the planar face of a solid under the cursor, laid as UCS Face lays it, until the command ends. The engine gains `toggleDynamicUcs()` and `state.dynamicUcsActive`, and UCSDETECT at SETVAR; the editor's status bar gains Dynamic UCS (`dynamicUcs`, hidden until shown, as AutoCAD's), its words in every language. UCS Face aligns the UCS with a solid's face too.

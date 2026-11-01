---
"@mellowcad/engine": minor
"@mellowcad/editor": patch
---

VSCURRENT (VS), as AutoCAD 2027 asks it, with 2D Wireframe, Hidden and Conceptual — in English, Spanish (ESTVISACTUAL) and Brazilian Portuguese (EVATUAL). Hidden draws each solid's edges and outlines that no solid hides, worked out by the engine and emitted as ordinary scene primitives, so the canvas and the SVG presenter draw them alike; Conceptual paints the solids' faces as filled paths, back to front, in Gooch shading, its edges over them. The style is the drawing's setting `visualStyle` (`VisualStyle`), saved in the file (version 48). The editor's rail leaves VSCURRENT out, as it lives in AutoCAD's viewport controls: it is typed. New catalog keys: `interface.tool.vscurrent`, `commands.names.VSCURRENT`, `commands.keywords.VSCURRENT`, `commands.prompts.vscurrentOption`, `vscurrent2dWireframe`, `vscurrentHidden`, `vscurrentConceptual`.

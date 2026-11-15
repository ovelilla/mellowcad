---
"@mellowcad/engine": minor
---

`CadDriver.keyIn(line)` types a line in the command window, key by key, as a line of an AutoCAD script file: Space ends each answer but in a text and after the start of a name that holds spaces, and it stops at the first answer the command window answers with an error, returning what it wrote and the refusal (`KeyedInLine`, `RefusedAnswer`). `CadDriver.zoomToFit()` frames the drawing as `CadEngine`'s does. The command line's own field types every Space of a text, where it ended the answer: TEXT's (leading ones too), -MTEXT's and LEADER's lines, ATTDEF's prompt and value, an attribute's value, a dimension's text. The history writes LINE's `All segments already undone.` as a notice, and as errors -LINETYPE's linetype not found, -LAYER's invalid layer name, -DIMSTYLE's unknown style and `Invalid window specification.`.

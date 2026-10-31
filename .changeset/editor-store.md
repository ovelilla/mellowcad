---
"@mellowcad/editor": minor
---

`CadEditor` takes a `store`, where the drawing is restored from and autosaved to (this browser's `localStorage` when absent, as before), and `onEngine`, which hands the host the engine once it is built and `null` once it is disposed, to save, open or run commands from its own code.

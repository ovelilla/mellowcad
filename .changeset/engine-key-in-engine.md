---
"@mellowcad/engine": minor
---

`CadEngine.keyIn(line)` types a line in the command window as `CadDriver.keyIn` does, so a page drives its editor from a script; `cancelCommand()` on both ends whatever is asking, as a menu macro's `^C^C`; and `withViewSize(width, height, work)` on both runs `work` in a view of that size, so a pick typed at `Select objects:` takes the same objects on any screen; `CadDriver.leave()` takes the pointer off the drawing.
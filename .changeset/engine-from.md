---
"@mellowcad/engine": minor
---

`EngineText.namesModifier(modifier, text)` says whether a typed word names FROM, which is read only where a point is asked: `resolveCommand` no longer answers FROM's names, so a language may give FROM a word that is a command's alias too (Russian's `ОТ`, ОТРЕЗОК's alias at `Command:`).

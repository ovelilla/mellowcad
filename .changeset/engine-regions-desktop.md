---
"@mellowcad/engine": minor
"@mellowcad/editor": patch
---

A solid that UNION, SUBTRACT or INTERSECT made shows one grip, as AutoCAD 2027 does, at its box's X-Y centre and lowest Z, which moves it whole. The Properties palette's drop-down names one object alone by its type, without the count (`Line`, not `Line (1)`): `EngineText.propertiesFilter`'s count is optional. The editor's command line hints `Type a command` only at `Command:`, not while a command asks.

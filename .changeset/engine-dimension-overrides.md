---
"@mellowcad/engine": minor
---

A dimension's overrides of its style (`DimensionEntity.overrides`, `DimStyleOverrides`), as AutoCAD keeps them on the object: any of the variables a style holds. A DXF opens them from a dimension's DSTYLE xdata and saves them back as AutoCAD writes them; the dimension is drawn and measured with them, the Properties palette shows them, and LIST writes them under `dimension style overrides:` as AutoCAD 2027 does in each language. `commands.messages.listDimensionOverrides` is now that heading alone, the lines written after it. Drawing file version 64.

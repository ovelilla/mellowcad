---
"@mellowcad/engine": minor
---

Brazilian Portuguese prompts are worded per command where AutoCAD words them so: new prompt ids (`plineNextPointOr`, `specifyNextPointOrTotal`, `addModeNextPointOrTotal`, `subtractModeNextPointOrTotal`, `textJustifyOption`, `ucsiconOption`, `navvcubeOption`, `areaFirstCornerPointOr`, `plineCenterPointOfArc`, `copyBasePointOr`, `copyDisplacement`, `copyUseFirstPoint`, `selectEdgesOr`), keywords spelled per prompt and the labels pt-BR lists otherwise. Its object snaps are typed by their three capitals, so `A`, `M` or `C` at a point prompt is the keyword again. -OSNAP lists the running modes by AutoCAD's short names in OSMODE's order in every language (`Quad,Int,Ins,Perp,Near,App Int,Ext,Par`), from the new message `osnapModeName`. `EngineText.keywordLabel` takes the prompt, where a label that only repeats the command's word gives way to that prompt's own. Spanish UCSICON's Noorigin is the word its console declares, `Sin`, listed `Sin origen`.

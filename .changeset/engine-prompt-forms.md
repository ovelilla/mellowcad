---
"@mellowcad/engine": minor
---

How a prompt writes its default is the language's: the new `commands.promptForms` says, by prompt id, whether it is spaced (`<0>:`), against what precedes it (`[Zdepth]<0,0,0>:`) or without a colon (`OK? <Y>`), and `EngineText.promptForm` reads it. Brazilian Portuguese spaces UCS's and -VIEW's defaults (`[profundidadeZ] <0,0,0>:`), and the arrays' main prompt now writes `…/eXit]<eXit>:` in English and Brazilian Portuguese, as their consoles do, and `…/Salir] <Salir>:` in Spanish. The new `commands.promptKeywordLabels` gives a keyword the label one prompt lists it with, before its command's: Brazilian Portuguese UCS New lists `EIxo z`.

---
title: "Cvičení v AutoCADu 3D: řemenice"
metaTitle: "Cvičení v AutoCADu 3D: řemenice rotací profilu"
description: "Vymodelujte řemenici v AutoCADu 3D: polovina profilu jako uzavřená křivka, kterou rotace kolem osy Y změní v těleso. Krok za krokem, 3D cvičení zdarma online."
figure: "Polovina profilu řemenice vedle její osy, s okótovanými vzdálenostmi od osy."
model: "Řemenice jako těleso, pohled od jihovýchodu ve vizuálním stylu Koncepční."
sourceHash: "f9c2a81b39fe"
---

Vymodelujte tuto řemenici rotací poloviny jejího profilu kolem osy, v milimetrech: otvor o průměru 20, náboj dlouhý 30 o průměru 40, disk tloušťky 10 a věnec široký 24, od průměru 90 do 110, vystředěný na náboji. Profil se kreslí jako vzdálenosti od osy, která vede podél osy Y, takže každý průměr se kreslí jako jeho polovina.

## Steps

### Nakreslete polovinu profilu [#profile]

V hladině Obrys jedna uzavřená křivka příkazem <Command id="PLINE" /> od `10,0`, každý další bod jako krok od předchozího: `10,0`, `0,10`, `25,0`, `0,-7`, `10,0`, `0,24`, `-10,0`, `0,-7`, `-25,0`, `0,10` a `-10,0`, potom možnost <Keyword command="PLINE" id="Close" />.

### Natočte pohled [#view]

Příkaz <Command id="-VIEW" /> a možnost <Keyword command="VIEW" id="SEiso" /> ukážou profil od jihovýchodu a shora; příkaz <Command id="VSCURRENT" /> a možnost <Keyword command="VSCURRENT" id="Conceptual" /> stínují plochy – tak je soustružená součást vidět nejlépe.

### Orotujte profil [#revolve]

Příkaz <Command id="REVOLVE" />: vyberte profil a stiskněte Enter, potom možnost <Keyword command="REVOLVE" id="Y" />: osa Y je osou řemenice. Enter přijme výchozí úhel, celou otáčku. Příkaz <Command id="ZOOM" /> s možností <Keyword command="ZOOM" id="Extents" /> ji přizpůsobí obrazovce a měřítko `0.8x` kolem ní ponechá místo.

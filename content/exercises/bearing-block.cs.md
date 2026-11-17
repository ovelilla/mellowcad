---
title: "Cvičení v AutoCADu 3D: ložiskové těleso"
metaTitle: "Cvičení 3D v AutoCADu: ložiskové těleso s otvory"
description: "Vymodelujte ložiskové těleso v AutoCADu 3D: vytáhněte, sjednoťte a odečtěte otvor a dva otvory pro šrouby jako válce. Krok za krokem, 3D tělesa zdarma online."
figure: "Ložiskové těleso v půdorysu, 100 × 60, s kótami nálitku, středového otvoru a otvorů pro šrouby."
model: "Ložiskové těleso jako 3D těleso, pohled od jihovýchodu ve vizuálním stylu Koncepční."
sourceHash: "5579d6bd5a86"
---

Vymodelujte toto ložiskové těleso v milimetrech: základna 100 × 60 s rohy o poloměru 10, tloušťka 12; uprostřed nálitek o průměru 40 a výšce 40; středový otvor o průměru 20 skrz nálitek a dva otvory pro šrouby o průměru 10 skrz základnu, s roztečí 76. Základna a nálitek se vytáhnou ze svých obrysů a sjednotí do jednoho tělesa; otvory jsou válce od něj odečtené.

## Steps

### Nakreslete půdorys [#plan]

V hladině Obrys příkaz <Command id="RECTANG" /> s možností <Keyword command="RECTANG" id="Fillet" /> `10`, od `0,0` do `100,60`, a kružnice v jeho středu, `50,30`, s možností <Keyword command="CIRCLE" id="Diameter" /> `40`.

### Vytáhněte základnu a nálitek [#extrude]

Příkaz <Command id="EXTRUDE" />: obrys do výšky `12`, potom kružnici do výšky `40`. Vzniknou dvě tělesa.

### Sjednoťte je [#union]

Příkaz <Command id="UNION" />: vyberte obě a stiskněte Enter. Tvoří jedno těleso.

### Nakreslete válce [#holes]

Středový otvor a otvor pro šroub jako válce, příkazem <Command id="CYLINDER" />: středový otvor v bodě `50,30`, možnost <Keyword command="CYLINDER" id="Diameter" /> `20` a výška `40`; otvor pro šroub v bodě `12,30`, průměr `10` a výška `12`. Potom příkaz <Command id="COPY" /> zkopíruje otvor od `12,30` do bodu o `76,0` dál.

### Odečtěte je [#subtract]

Příkaz <Command id="SUBTRACT" />: vyberte těleso a stiskněte Enter, potom tři válce a Enter. Otvory procházejí skrz.

### Natočte pohled [#view]

Příkaz <Command id="-VIEW" /> a možnost <Keyword command="VIEW" id="SEiso" />, příkaz <Command id="VSCURRENT" /> a možnost <Keyword command="VSCURRENT" id="Conceptual" />, potom příkaz <Command id="ZOOM" /> s možností <Keyword command="ZOOM" id="Extents" /> a `0.8x`, aby se těleso vešlo na obrazovku.

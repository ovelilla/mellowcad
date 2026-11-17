---
title: "Cvičení v AutoCADu 3D: montážní deska"
metaTitle: "Cvičení v AutoCADu 3D pro začátečníky: deska"
description: "Vymodelujte montážní desku v AutoCADu 3D: oblasti, odečtení otvorů a jedno vytažení vytvoří těleso. Krok za krokem, 3D cvičení zdarma online."
figure: "Obrys desky, 100 × 60, se čtyřmi otvory a kótami."
model: "Deska jako těleso tloušťky 10, pohled od jihovýchodu s odstraněnými skrytými čarami."
sourceHash: "87b8f906b0fd"
---

Vymodelujte montážní desku tloušťky 10, v milimetrech: obrys 100 × 60 s rohy o poloměru 8 a čtyři otvory o průměru 10, jejichž středy leží 15 od okrajů. Začíná se v rovině. Obrys a kružnice se stanou oblastmi, otvory se odečtou, dokud je deska ještě plochá, a jedno vytažení z ní udělá těleso i s otvory.

## Steps

### Nakreslete profil [#profile]

V hladině Obrys příkaz <Command id="RECTANG" /> s možností <Keyword command="RECTANG" id="Fillet" /> `8`, od `0,0` do `100,60`. Potom kružnice v bodě `15,15` s možností <Keyword command="CIRCLE" id="Diameter" /> `10` a příkaz <Command id="COPY" />, který ji zkopíruje od jejího středu do `70,0`, `70,30` a `0,30`.

### Vytvořte oblasti [#region]

Příkaz <Command id="REGION" /> změní uzavřené objekty v oblasti: vyberte obrys a čtyři kružnice, potom Enter. Pět smyček, pět oblastí.

### Odečtěte otvory [#subtract]

Příkaz <Command id="SUBTRACT" />: vyberte oblast desky a stiskněte Enter, potom oblasti čtyř kružnic a Enter. Zbude jedna oblast se čtyřmi otvory.

### Natočte pohled [#view]

Příkaz <Command id="-VIEW" /> a možnost <Keyword command="VIEW" id="SEiso" /> ukážou desku od jihovýchodu a shora; příkaz <Command id="VSCURRENT" /> a možnost <Keyword command="VSCURRENT" id="Hidden" /> skryjí to, co zakrývají plochy. Pohled lze natočit i kliknutím na ViewCube.

### Vytáhněte oblast [#extrude]

Příkaz <Command id="EXTRUDE" />: vyberte oblast, stiskněte Enter a zadejte výšku, `10`. Deska je těleso, i s otvory. Příkaz <Command id="ZOOM" /> s možností <Keyword command="ZOOM" id="Extents" /> ji přizpůsobí obrazovce a měřítko `0.8x` kolem ní ponechá místo.

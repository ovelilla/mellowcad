---
title: "Příkaz KOPIE (COPY) v AutoCADu"
metaTitle: "Jak kopírovat v AutoCADu: příkaz KOPIE"
description: "Jak kopírovat v AutoCADu příkazem KOPIE (COPY, zkratka KO): základní bod, pak libovolný počet kopií, se Zpět a Konec či jedna o posun. Zdarma online."
figure: "Kružnice zkopírovaná třikrát podél X z jednoho základního bodu, pak Enter."
sourceHash: "e74bbdabf97c"
---

Příkaz KOPIE (COPY) umístí kopie vybraných objektů: vyberte je, zadejte základní bod a pak druhý bod pro každou kopii. Jako v AutoCADu, jehož režim kopírování je ve výchozím stavu Násobek, se ptá na další kopii, dokud nestisknete Enter nebo nezvolíte Konec, a každá kopie se měří od téhož základního bodu. Kopie si ponechají hladinu, barvu a všechny ostatní vlastnosti objektů. Příkaz kopíruje i objekty vybrané před jeho spuštěním a zatímco umísťujete kopii, sada sleduje kurzor.

## Options

### Displacement

Volí se na výzvu k zadání základního bodu, nebo stisknutím Enter v tomto místě: zeptá se na jedno přemístění jako vektor, `30,0` umístí jednu kopii o 30 podél X, a skončí. Výchozí hodnotou je poslední přemístění, které KOPIE v tomto výkresu použil.

### Exit

Ukončí příkaz, stejně jako Enter po umístění kopie.

### Undo

Vrátí zpět poslední umístěnou kopii. Vrácení první vypíše <Message id="commandCompletelyUndone" /> a znovu se zeptá na druhý bod.

## Missing

Režim Jeden proměnné COPYMODE (jedna kopie a konec) není k dispozici: KOPIE vždy pracuje v režimu Násobek, takže výzva k zadání základního bodu uvádí jen <Keyword id="Displacement" />. Možnost Pole u druhého bodu, řada rovnoměrně rozmístěných kopií v AutoCADu, také není k dispozici.

## Questions

### Jak se jmenuje příkaz KOPIE anglicky a jakou má zkratku?

Anglicky COPY, v českém AutoCADu KOPIE: zadejte `KO` a stiskněte Enter nebo mezerník. Anglické `CO` a `CP` v českém AutoCADu nefungují; `_COPY` funguje v AutoCADu v jakémkoli jazyce.

### Jak vytvořit několik kopií najednou v AutoCADu?

Umísťujte další kopie: každý zadaný bod je další kopie ze stejného základního bodu, dokud nestisknete Enter. Kopie v řádcích, sloupcích nebo kolem středu vytvoří najednou <Command id="ARRAY" />.

### Jak zkopírovat objekt o zadanou vzdálenost?

Zadejte základní bod a pak druhý bod jako vzdálenost: `30,0` zkopíruje objekt o 30 podél X, protože dynamické zadávání čte bod po prvním relativně k němu. Nebo nasměrujte kurzor požadovaným směrem, s ortogonálním režimem nebo polárním trasováním, a zadejte jen vzdálenost.

### Proč v příkazu KOPIE chybí možnost Pole?

MellowCAD ji zatím nenabízí. Řadu rovnoměrně rozmístěných kopií vytvoří <Command id="ARRAYRECT" /> s jedním řádkem a zachová je jako jedno pole, které lze upravovat.

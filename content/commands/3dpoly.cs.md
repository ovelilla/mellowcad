---
title: "3D křivka v AutoCADu: příkaz 3DKŘIVKA (3DPOLY)"
metaTitle: "3D křivka v AutoCADu: 3DKŘIVKA (3DPOLY)"
description: "Jak nakreslit 3D křivku v AutoCADu příkazem 3DKŘIVKA (3DPOLY, 3K): přímé segmenty, každý bod s vlastním Z, Uzavři, Zpět, rozdíl proti KŘIVKA. Zdarma online."
figure: "3D křivka, která v každém rohu obdélníku 60 na 40 ležícího na zemi stoupne o 15, při pohledu od jihovýchodu."
sourceHash: "b74d0c411c73"
---

Příkaz 3DKŘIVKA (3DPOLY) kreslí 3D křivku: přímé segmenty přes body, z nichž každý má vlastní souřadnici Z, jako jeden objekt. Zadejte počáteční bod, pak koncový bod každého segmentu, dokud příkaz neukončí Enter; zachová se i samotný počáteční bod, jako křivka s jedním vrcholem. Enter u počátečního bodu se odmítne zprávou <Message id="invalidPoint" />: chybí možnost Pokračovat, kterou má ÚSEČKA. Bod zadaný se souřadnicí Z si ji ponechá, `30,0,15`; bod zadaný bez ní nebo kliknutý leží ve výšce pracovní roviny a bod uchopený na objektu převezme Z objektu v tom místě. Body se čtou v aktuálním USS.

Na rozdíl od příkazu <Command id="PLINE" /> nemá rovinu, oblouky, šířky ani tloušťku a kreslí se plnou čarou bez ohledu na typ čáry, který si ponechá. Celá křivka je jeden krok, který <Command id="U" /> vrátí zpět; Esc ponechá, co bylo nakresleno. KEDIT ji upravuje s kratším seznamem možností a jeho možnost Spline ji proloží hladkou křivkou.

## Options

### Close

Od druhého segmentu: nakreslí segment zpět do počátečního bodu a skončí.

### Undo

Vrátí poslední vrchol a pokračuje od předchozího. Když nezbude žádný segment: <Message id="all3dSegmentsUndone" />.

## Missing

Vyhlazená 3D křivka má v paletě Vlastnosti v řádku Vyhlazení hodnotu Žádné, kde AutoCAD uvádí kvadratickou nebo kubickou, a nelze ji tam změnit. Nemůže být hranicí šraf ani trajektorií příkazu KŘIVPOLE a paleta nemá řádek Materiál. Dynamické zadávání se ptá na počáteční bod v jednom poli, se Z zadaným za druhou čárkou, kde AutoCAD ukazuje pole X, Y a Z. Nabídky uzlů po najetí kurzorem: Protáhnout, Přidat vrchol, Odstranit vrchol a další.

## Questions

### Jak se jmenuje příkaz 3DKŘIVKA anglicky a jakou má zkratku?

Anglicky 3DPOLY, v českém AutoCADu 3DKŘIVKA: zadejte `3K` a stiskněte Enter nebo mezerník. Funguje i celý název a `_3DPOLY` v AutoCADu v jakémkoli jazyce. Anglické `3P` je v českém AutoCADu zkratka příkazu 3DPOLE.

### Jaký je rozdíl mezi příkazy KŘIVKA a 3DKŘIVKA?

Křivka příkazu <Command id="PLINE" /> leží v jedné rovině a může mít oblouky a šířky. 3D křivka má jen přímé segmenty, ale každý vrchol může ležet v jiné výšce: potrubí, osa silnice, kabel.

### Jak nakreslit 3D křivku v různých výškách?

Zadejte každý bod s jeho souřadnicí Z, `x,y,z`, nebo uchopte objekty v požadovaných výškách. Při dynamickém zadávání je bod po prvním relativní: `60,0,15` jde o 60 podél X a o 15 nahoru od předchozího.

### Jak 3D křivku vyhladit?

Upravte ji příkazem <Command id="PEDIT" /> a vyberte možnost Spline: hladkou křivku vedenou vrcholy. Možnost Kostra ji opět narovná.

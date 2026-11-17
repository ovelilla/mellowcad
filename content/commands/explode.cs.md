---
title: "Příkaz ROZLOŽ (EXPLODE) v AutoCADu"
description: "Jak v AutoCADu rozložit blok nebo křivku příkazem ROZLOŽ (EXPLODE, zkratka X): na úsečky a oblouky, objekty bloku, řádky textu, čáry šrafy. Vyzkoušejte zdarma."
figure: "Obdélník, jedna křivka, rozložený na čtyři úsečky, z nichž jedna se pak samostatně vymaže."
sourceHash: "479cf1cd58d9"
---

Příkaz ROZLOŽ (EXPLODE) rozloží složený objekt na objekty, ze kterých se skládá. Vyberte objekty a stiskněte Enter: křivka se změní v úsečky a oblouky podél své střednice, reference bloku v objekty svého bloku, o jednu úroveň níž, víceřádkový text v jeden text na každý zobrazený řádek a šrafa vzorem v čáry svého vzoru. Každý kus si ponechá hladinu a vlastnosti objektu; kusy bloku si ponechají své vlastní. Křivka se šířkou o šířku přijde a příkaz ROZLOŽ to oznámí. Úsečky, kružnice, oblouky, jednořádkový text a kóty rozložit nelze: odmítnou se už při výběru, a spline, elipsa a plná šrafa při uzavření výběru. Rozložení je jeden krok, který lze vrátit zpět.

## Missing

Kóty, které AutoCAD rozloží na čáry, šipky a text a MellowCAD je odmítne. Šrafa se vzorem, který zde není, se odmítne jako plná a rozložený víceřádkový text stojí tam, kam ho umístí naše písmo, o vlásek vedle místa, kam ho klade AutoCAD.

## Questions

### Jak se jmenuje příkaz ROZLOŽ anglicky a jakou má zkratku?

EXPLODE. Zkratka je v české verzi AutoCADu stejná jako v anglické, `X`: zadejte ji a stiskněte Enter nebo mezerník. Funguje i celý název a `_EXPLODE` v AutoCADu v každém jazyce.

### Jak v AutoCADu vrátit rozložení?

Zadejte příkaz <Command id="U" /> nebo hned stiskněte Ctrl+Z: rozložení je jeden krok zpět. Později příkaz <Command id="JOIN" /> spojí úsečky a oblouky, které na sebe navazují konci, zpět do jedné křivky a příkaz <Command id="BLOCK" /> z objektů znovu udělá jeden blok.

### Lze v AutoCADu rozložit text?

Víceřádkový text ano: každý řádek se stane jednořádkovým textem. Jednořádkový text je už nejmenší kus a příkaz ROZLOŽ ho odmítne.

### Jak v AutoCADu rozložit blok?

Vyberte referenci bloku a stiskněte Enter: změní se v objekty svého bloku, tam, kde je reference kreslila. Blok vnořený v něm zůstane blokem: rozložte ho ještě jednou. Atributy se vrátí jako jejich definice, bez hodnot.

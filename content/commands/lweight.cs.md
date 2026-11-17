---
title: "Tloušťka čáry v AutoCADu: příkaz TLČÁRY (LWEIGHT)"
metaTitle: "Tloušťka čáry v AutoCADu: TLČÁRY (LWEIGHT)"
description: "Jak nastavit tloušťku čáry v AutoCADu příkazem TLČÁRY (LWEIGHT, zkratka TLČ): tloušťka nových objektů v mm, 24 standardních hodnot, DleHlad a zobrazení."
figure: "Deska obkreslená tloušťkou 0,70 mm, pak pro otvor zadáno 0.1, zaokrouhlené na 0,09 mm: obě tloušťky, jak je ukazuje obrazovka."
sourceHash: "154784b2b402"
---

Příkaz TLČÁRY (LWEIGHT) nastaví tloušťku čáry, kterou se kreslí nové objekty, v milimetrech. AutoCAD otevře dialog Nastavení tloušťky čáry; MellowCAD ho zatím nemá, a tak příkaz TLČÁRY spustí verzi pro příkazový řádek, kterou má i AutoCAD, <Command id="-LWEIGHT" />. Vypíše aktuální tloušťku čáry, na začátku `DLEHLAD`, a zeptá se na novou: jednu z 24 standardních hodnot AutoCADu, od 0,00 do 2,11 mm. Jakákoli jiná hodnota se nastaví na nejbližší standardní, s oznámením, a záporná se odmítne zprávou <Message id="invalidLineweightNumber" />. Enter ponechá aktuální tloušťku. Každá změna je krok, který vrátí <Command id="U" />.

Tloušťky čar se zde zobrazují od začátku: AutoCAD je ukazuje, až když je zapnuté tlačítko Tloušťka čáry na stavovém řádku (LWDISPLAY), ale MellowCAD nemá rozvržení ani vykreslování, takže obrazovka je jediné místo, kde se mohou ukázat. Tlačítko je vypíná a zapíná. Křivka se šířkou ukazuje v půdorysu svou šířku, ne tloušťku čáry.

## Options

### ?

Vypíše hodnoty, které přijímá, DleHlad a 24 standardních tlouštěk čar, a znovu se zeptá.

### BYLAYER

Nové objekty přebírají tloušťku čáry své hladiny, jako na začátku.

## Missing

DleBlok a Výchozí (LWDEFAULT), tloušťky čar v palcích, dialog Nastavení tloušťky čáry a položka Nastavení tloušťky čáry… v rozevíracím seznamu.

## Questions

### Jak se jmenuje příkaz TLČÁRY anglicky?

LWEIGHT. V českém AutoCADu je jeho zkratka `TLČ`: zadejte ji a stiskněte Enter nebo mezerník. Anglické `LW` a `LINEWEIGHT` v české verzi nefungují; celý název `TLČÁRY` funguje také a `_LWEIGHT` v AutoCADu v jakémkoli jazyce.

### Proč se v AutoCADu nezobrazuje tloušťka čáry?

V AutoCADu se tloušťky čar na obrazovce zobrazují, jen když je zapnuté tlačítko Tloušťka čáry na stavovém řádku (LWDISPLAY 1); na začátku je vypnuté. Zde je zapnuté od začátku. Všechny tenké tloušťky se kreslí nejtenčí čarou obrazovky, takže rozdíl je vidět u silnějších; a objekt s tloušťkou čáry DleHlad přebírá tloušťku své hladiny.

### Jak změnit tloušťku čáry existujícího objektu?

Vyberte ho a zvolte tloušťku v řádku Tloušťka čáry palety Vlastnosti, nebo, když je objekt DleHlad, změňte tloušťku čáry jeho hladiny ve Správci vlastností hladin. Příkaz TLČÁRY nastavuje jen tloušťku čáry objektů nakreslených po něm.

### Jaké tloušťky čar má AutoCAD?

24 pevných hodnot v milimetrech: 0,00; 0,05; 0,09; 0,13; 0,15; 0,18; 0,20; 0,25; 0,30; 0,35; 0,40; 0,50; 0,53; 0,60; 0,70; 0,80; 0,90; 1,00; 1,06; 1,20; 1,40; 1,58; 2,00 a 2,11. Zadejte jinou, třeba `0.45`, a příkaz TLČÁRY vezme nejbližší, při shodě tenčí.

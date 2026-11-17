---
title: "Paleta Vlastnosti v AutoCADu: příkaz VLASTNOSTI (PROPERTIES)"
metaTitle: "Paleta Vlastnosti v AutoCADu (PROPERTIES)"
description: "Jak funguje paleta Vlastnosti v AutoCADu (VLASTNOSTI, Ctrl+1): Obecné a Geometrie, *RŮZNÉ*, jeden typ objektů, aktuální nastavení. Vyzkoušejte online."
figure: "Kružnice vybraná na výzvě Příkaz, s viditelnými uzly, pak VLASTNOSTI: paleta se otevře vedle výkresu na řádcích kružnice."
sourceHash: "14d097ac5b0b"
---

Příkaz VLASTNOSTI (PROPERTIES) otevře paletu Vlastnosti. Stejně jako v AutoCADu je to paleta, ne dialog: zůstává otevřená vedle výkresu, zde jako karta panelu palet, zatímco vybíráte a kreslíte, dokud ji nezavře <Command id="PROPERTIESCLOSE" />. Ctrl+1 ji ukáže a skryje, a když příkaz zadáte s apostrofem, `'VLASTNOSTI`, otevře se uvnitř běžícího příkazu. V širokém okně je otevřená od začátku.

S vybranými objekty ukazuje jejich vlastnosti a jednu změníte tak, že v jejím řádku zadáte nebo zvolíte novou hodnotu. Nejdřív je Obecné, v pořadí AutoCADu: Barva, Hladina, Typ čáry, Tloušťka čáry a Tloušťka, `*RŮZNÉ*`, kde se vybrané objekty liší. Pod ní řádky každého typu: počáteční a koncový bod úsečky, délka a úhel; střed kružnice, poloměr, průměr, obvod a plocha; řádky oblouku, elipsy, vrcholy a šířky křivky, body spline, řádky textu a reference bloku. Souřadnice jsou v aktuálním USS a řádky, které jen informují, jako Délka úsečky, jsou šedé. Rozevírací seznam nahoře uvádí `Vše` a každý typ s počtem: zvolte jeden a uvidíte a upravíte jen tento typ. Když není nic vybráno, ukazuje Obecné aktuální hladinu, barvu, typ čáry a tloušťku čáry, které tam pro nové objekty nastavíte. Každá úprava je jeden krok, který vrátí <Command id="U" />.

## Missing

Měřítko typu čáry v Obecné pro několik objektů najednou nebo, když není nic vybráno, pro nové objekty (CELTSCALE); Styl vykreslování, Průhlednost, Hypertextový odkaz a Materiál. Řádky geometrie několika objektů jednoho typu najednou, obsah textu a hodnoty atributů zde upravovat nelze. Rychlý výběr, přepínač PICKADD, automatické skrývání, ukotvení a plovoucí paleta.

## Questions

### Jak se jmenuje příkaz VLASTNOSTI anglicky?

PROPERTIES. Nejrychleji Ctrl+1, které paletu také zase skryje. Z klávesnice: `VLASTNOSTI` nebo zkratky `VLA`, `VLAST` a `VT`, pak Enter nebo mezerník. Anglické `CH` v české verzi nefunguje, `PR` spouští příkaz PŘERUŠ a `MO` příkaz MODKAZ; `_PROPERTIES` funguje v AutoCADu v jakémkoli jazyce.

### Paleta Vlastnosti zmizela: jak ji vrátit?

Stiskněte Ctrl+1 nebo zadejte `VLA`: paleta se znovu ukáže, jako karta panelu palet vedle výkresu. Ctrl+1 stisknuté, když je vidět, ji skryje, a tak obvykle zmizela.

### Jak změnit vlastnosti několika objektů najednou?

Vyberte je všechny a pak změňte řádek: každý vybraný objekt dostane novou hodnotu. Řádek, jehož hodnoty se liší, ukazuje `*RŮZNÉ*`, dokud ho nenastavíte. Chcete-li mezi nimi změnit třeba jen kružnice, zvolte jejich typ v rozevíracím seznamu nahoře.

### Jaký je rozdíl mezi příkazy VLASTNOSTI a KOPIEVLAST (MATCHPROP)?

Příkaz VLASTNOSTI ukazuje a nastavuje hodnoty vybraných objektů. <Command id="MATCHPROP" /> je kopíruje z jednoho objektu na jiné, bez zadávání hodnoty.

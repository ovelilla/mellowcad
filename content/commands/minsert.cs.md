---
title: "Příkaz NVLOŽ (MINSERT) v AutoCADu"
metaTitle: "Příkaz NVLOŽ (MINSERT) v AutoCADu"
description: "Jak NVLOŽ (MINSERT) v AutoCADu vloží blok v řádcích a sloupcích jako jeden objekt, na co se ptá a proč ho ROZLOŽ odmítne. Vyzkoušejte zdarma."
figure: "Sedadlo převedené na blok, pak rozložené příkazem NVLOŽ do tří řádků po pěti: jeden objekt."
sourceHash: "d43a50bbc8fe"
---

NVLOŽ (anglicky MINSERT) vloží blok definovaný ve výkresu mnohokrát, v řádcích a sloupcích, jako jeden objekt. Ptá se na totéž co <Command id="-INSERT" /> — název bloku (Enter vezme nabízený, naposledy vložený blok), bod vložení, měřítko v ose X a Y a úhel otočení —, pak na počet řádků a počet sloupců (Enter je 1) a pak na vzdálenost mezi řádky a vzdálenost mezi sloupci. Ptá se jen na vzdálenosti, které počty potřebují, a jeden řádek o jednom sloupci je obyčejná reference bloku. Blok s atributy se ptá na jejich hodnoty nakonec, jednou, a každá kopie je ukazuje.

Řádky vedou podél osy Y bloku a sloupce podél jeho osy X, obě otočené o úhel otočení; vzdálenosti jsou v jednotkách výkresu, ať je měřítko jakékoli, a záporná klade kopie dolů nebo doleva. U vzdálenosti mezi řádky určí dva body místo ní jednotkovou buňku: její šířka je vzdálenost mezi sloupci a výška vzdálenost mezi řádky. Výsledkem je blok NVlož AutoCADu: přesouvá se, kopíruje, otáčí, mění měřítko a zrcadlí jako celek, <Command id="LIST" /> přidá jeho řádky a sloupce a paleta Vlastnosti je ukazuje jako Sloupce, Rozteč sloupců, Řádky a Rozteč řad, které lze zadat. <Command id="EXPLODE" /> ho započítá jako násobně vložený a nechá celý, jako AutoCAD. Soubor DXF ho otevře a uloží jako sám AutoCAD.

## Options

### ?

U názvu bloku: vypíše bloky výkresu, jako <Command id="BLOCK" />, a skončí.

### Scale

U bodu vložení: zeptá se na jedno měřítko pro obě osy a pak znovu na bod. Po bodu se na měřítka X a Y neptá.

### Rotate

U bodu vložení: zeptá se na úhel, který otočí každou kopii i celé pole, a pak znovu na bod. Po bodu se na otočení neptá.

## Missing

U bodu vložení Refbod, X, Y a Z a u měřítka X Obdélník a XYZ, jak chybí i -VLOŽ; `~`, která otevírá soubor výkresu; poznámkové bloky, které tu nejsou. Lineární kóta vybere celý objekt NVLOŽ, ne objekt v jedné z jeho kopií. Řádky Poznámkový, Jednotka bloku a Faktor jednotek palety Vlastnosti.

## Questions

### Co je příkaz NVLOŽ v AutoCADu?

Násobné vložení: rozloží blok do obdélníkového pole řádků a sloupců jako jeden objekt. Počty a rozteče změníte později v paletě Vlastnosti.

### Jak rozložit blok vložený příkazem NVLOŽ?

Nejde to: <Command id="EXPLODE" /> odpoví, že byl násobně vložen, a nechá ho, v AutoCADu stejně jako tady, i když řádky a sloupce nastavíte na 1. Vložte blok znovu příkazem <Command id="-INSERT" />, nebo rozložte kopie příkazem <Command id="ARRAYRECT" />, jehož pole se rozloží na položky.

### Jak se jmenuje MINSERT v českém AutoCADu?

NVLOŽ. Nemá zkratku ani tlačítko na pásu karet, takže se píše celý; `_MINSERT` funguje v AutoCADu v každém jazyce.

### Jaký je rozdíl mezi NVLOŽ a POLE?

NVLOŽ opakuje jeden blok jako jednu referenci, kterou nelze rozložit. <Command id="ARRAYRECT" /> opakuje libovolné objekty jako asociativní pole s uzlovými body pro počty a rozteče, které <Command id="EXPLODE" /> rozloží.

---
title: "Příkaz VÝPIS (LIST) v AutoCADu"
description: "Jak zjistit vlastnosti objektu v AutoCADu příkazem VÝPIS (LIST, zkratka VY): typ, hladina, barva, body, délka a plocha každého objektu. Vyzkoušejte online."
figure: "VÝPIS otvoru v desce: hladina kružnice, střed, poloměr, obvod a plocha."
sourceHash: "d0ebcf466ff5"
---

Příkaz VÝPIS (LIST) vypíše na příkazovém řádku zprávu o každém vybraném objektu, ve sloupcích a slovech AutoCADu 2027. Každá začíná typem, hladinou a prostorem, pak barvou, typem čáry, tloušťkou čáry a tloušťkou, pokud nejsou DleHlad nebo nulové, a pak tím, co má daný typ: koncové body úsečky, délka, úhel a přírůstky; střed kružnice, poloměr, obvod a plocha; úhly a délka oblouku; vrcholy křivky, šířky, plocha a délka; řídicí body a body proložení spline; styl, výška a zarovnání textu; typ, body a styl kóty; vzor, měřítko a plocha šraf; název, bod vložení, měřítka a atributy reference bloku; řádky a položky pole; plocha, obvod a ohraničující obdélník oblasti.

Body jsou v aktuálním USS, délky s přesností výkresu a úhly s přesností AUPREC. Objekty vybrané před příkazem VÝPIS se vypíšou hned, bez výzvy, a Enter bez výběru příkaz ukončí beze slova. Všechny řádky přijdou najednou: textové okno AutoCADu se po každé obrazovce zastaví na `Pokračujte stisknutím klávesy ENTER:`, zatímco historie zde roluje. Chybí řádek s identifikátorem objektu (handle): objekty zde identifikátory nemají.

## Missing

Plocha otevřené křivky proložené oblouky: zde je to plocha křivky uzavřené tětivou, v AutoCADu je větší. Délka spline je zde přesná, v AutoCADu je to blízká aproximace. Kóta <Command id="DIMANGULAR" /> vytvořená ze dvou úseček se vypíše svými třemi body a žádná kóta není nikdy uvedena jako asociativní. Pauza a textové okno AutoCADu. To, co objekty zde nemají: DleBlok, tloušťka čáry Výchozí, vlastní měřítko typu čáry, průhlednost a skupiny.

## Questions

### Jak se jmenuje příkaz VÝPIS anglicky?

LIST. V českém AutoCADu jsou jeho zkratky `VY` a `UKAŽMAT`: zadejte jednu z nich a stiskněte Enter nebo mezerník. Anglické `LI` a `LS` v české verzi nefungují; celý název `VÝPIS` funguje také a `_LIST` v AutoCADu v jakémkoli jazyce.

### Co ukazuje příkaz VÝPIS?

Vše, co o objektu říká příkaz VÝPIS v AutoCADu: typ, hladinu, prostor a vlastnosti, které nejsou DleHlad, pak geometrii, každý bod a každou délku jako čísla. Vyberte několik objektů a každý dostane svou zprávu.

### Jak zjistit délku nebo plochu objektu?

Použijte na něj příkaz VÝPIS: délku úsečky, obvod a plochu kružnice, délku nebo obvod a plochu křivky. Chcete-li sečíst několik ploch, použijte <Command id="AREA" />.

### Jak zobrazit souřadnice koncových bodů úsečky?

Použijte na úsečku příkaz VÝPIS: vypíše její počáteční a koncový bod v aktuálním USS. Pro jediný bod použijte <Command id="ID" /> s uchopením objektu.

### Jaký je rozdíl mezi příkazy VÝPIS a VLASTNOSTI (PROPERTIES)?

Příkaz VÝPIS vypíše zprávu, kterou čtete a kopírujete z historie. <Command id="PROPERTIES" /> ukazuje stejné hodnoty v paletě, kde je můžete měnit.

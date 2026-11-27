---
title: "Změna vlastností v AutoCADu: příkaz ZMĚNAV (CHPROP)"
metaTitle: "Změna vlastností v AutoCADu: ZMĚNAV"
description: "Jak změnit vlastnosti objektů v AutoCADu příkazem ZMĚNAV (CHPROP): barvu, hladinu, typ čáry a jeho měřítko, tloušťku čáry nebo výšku na příkazovém řádku."
figure: "ZMĚNAV na úsečce přes otvor desky: barva 1 a typ čáry CENTER, osa, v hladině, ve které byla."
sourceHash: "1cba888e4b31"
---

Příkaz ZMĚNAV (CHPROP) mění vlastnosti vybraných objektů na příkazovém řádku: řádky oddílu Obecné palety Vlastnosti, kladené jako výzvy. Vyberte objekty, nebo je vyberte před příkazem, a pak zvolte vlastnost, kterou chcete změnit; po každé se zeptá na další, dokud příkaz neukončí Enter. Výzva každé vlastnosti nabízí jako výchozí hodnotu sady, <Message id="varies" /> tam, kde se objekty liší, a Enter v tomto místě ponechá každému objektu jeho vlastní. Co nastavíte, se použije při ukončení příkazu, takže Esc ponechá všechny objekty beze změny. Objekty v uzamknuté hladině se spočítají a vynechají, každý s hlášením <Message id="objectOnLockedLayer" />. Celé spuštění je jeden krok, který <Command id="U" /> vrátí zpět.

## Options

### Color

Číslo barvy od 1 do 255, název jako `červená`, `DLEHLAD` nebo <Keyword id="Truecolor" /> a jeho `červená,zelená,modrá`, jak je přijímá <Command id="COLOR" />; co BARVA odmítne, odmítne se i zde a výzva se zopakuje.

### LAyer

Název hladiny, velkými i malými písmeny. Název, který nemůže být názvem hladiny, vypíše <Message id="invalidLayerName" />, název, který ve výkresu není, hlášení, že ho nelze najít; v obou případech se výzva zopakuje. ZMĚNAV hladiny nevytváří.

### LType

Název typu čáry, velkými i malými písmeny, nebo `DleHlad`. Typ, který výkres nemá načtený, se načte z acad.lin, souboru AutoCADu v palcích, jako to dělá AutoCAD i v metrickém výkresu; název, který chybí i v tomto souboru, vypíše, že nebyl nalezen, a příkaz se vrátí k výzvě vlastnosti.

### ltScale

Vlastní měřítko typu čáry objektů, které násobí měřítko příkazu <Command id="LTSCALE" /> jen pro ně: vzdálenost zadaná číslem nebo změřená dvěma body; záporná se vezme jako její absolutní hodnota a 0 vypíše <Message id="valueMustBeNonzero" /> a výzva se zopakuje.

### LWeight

Tloušťka čáry v milimetrech, zaokrouhlená na nejbližší standardní, jak ji zaokrouhlí <Command id="LWEIGHT" />, nebo `DleHlad`; `?` je vypíše.

### Thickness

Vzdálenost zadaná číslem nebo změřená dvěma body, i záporná a nulová. Nastaví se úsečkám, kružnicím, obloukům a křivkám v sadě, podél normály každého z nich; u každého jiného typu příkaz na konci uvede, že jeho výšku nemůže změnit.

## Missing

pRůhlednost, mAteriál a Poznámky, které objekty zde nemají, takže je výzva neuvádí. DleBlok u možností Barva, Typč a tLčáry a výchozí hodnota tloušťky čáry. Knihy barev. Výška textu a definice atributu, které zůstanou beze změny. ZMĚNA, jejíž možnost Vlastnosti klade tutéž výzvu s možností Zdvih.

## Questions

### Jak se jmenuje příkaz ZMĚNAV anglicky a má zkratku?

Anglicky CHPROP, v českém AutoCADu ZMĚNAV. Zkratku nemá: zadejte `ZMĚNAV` nebo `_CHPROP`, který funguje v AutoCADu v jakémkoli jazyce. Enter na výzvu Příkaz ho zopakuje.

### Jaký je rozdíl mezi příkazy ZMĚNAV a VLASTNOSTI?

Mění tytéž vlastnosti. <Command id="PROPERTIES" /> je zobrazí v paletě, spolu s geometrií každého objektu; ZMĚNAV se na ně ptá na příkazovém řádku, takže ruce zůstanou na klávesnici.

### Jak změnit barvu objektů z příkazového řádku?

Zadejte `ZMĚNAV`, vyberte objekty, stiskněte Enter, zvolte <Keyword id="Color" /> a zadejte barvu, například `1` pro červenou. Dalším stisknutím Enter příkaz ukončete.

### Jak přesunout několik objektů do jiné hladiny?

Spusťte ZMĚNAV, vyberte je, zvolte <Keyword id="LAyer" /> a zadejte název hladiny. Hladina musí existovat: nejprve ji vytvořte příkazem <Command id="LAYER" />.

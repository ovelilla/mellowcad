---
title: "Úprava křivky v AutoCADu: příkaz KEDIT (PEDIT)"
description: "Jak upravit křivku v AutoCADu příkazem KEDIT (PEDIT, zkratka KE): úsečky na křivku, připojení, šířka, proložení a spline, úprava vrcholů. Vyzkoušejte online."
figure: "Tři úsečky navazující koncovými body: KEDIT převede první na křivku, připojí k ní další dvě a dá jí šířku 2."
sourceHash: "bdc0bf10ac09"
---

Příkaz KEDIT (PEDIT) upravuje křivku. Vyberte ji ve výzvě `Vyberte křivku nebo [NÁsobně]:`, nebo ji vyberte před příkazem; KEDIT spustí na křivce i poklepání. Vyberete-li místo toho úsečku, oblouk nebo spline, vypíše <Message id="objectNotPolyline" /> a zeptá se, zda ho převést na křivku, ve výchozím stavu ano: nová křivka zaujme jeho místo a převezme jeho vlastnosti. Pak se znovu a znovu ptá na možnost a každou hned použije, dokud ho Enter neukončí. 3D křivka dostane kratší seznam, bez šířky, proložení a generování typu čáry, a její možnost spline je <Keyword id="Spline curve" />. Esc ponechá, co bylo uděláno; celá úprava je jeden krok, který vrátí <Command id="U" />.

## Options

### Multiple

Upraví několik křivek najednou: vyberte je, určete, zda převést úsečky, oblouky a spliny mezi nimi, a každá možnost se pak použije na všechny. Její připojení se ptá na vzdálenost tolerance a na <Keyword id="Jointype" />: <Keyword id="Extend" /> ořízne nebo prodlouží koncové segmenty, aby se setkaly, <Keyword id="Add" /> přemostí mezeru novým segmentem, <Keyword id="Both" /> prodlouží, kde může, a přidá, kde nemůže.

### Close

Uzavře křivku segmentem z posledního vrcholu do prvního, obloukem, je-li poslední segment oblouk. U uzavřené křivky je tu možnost <Keyword id="Open" />, která tento segment odebere.

### Join

Přidá úsečky, oblouky a otevřené křivky, které navazují na konce křivky, konec na konec, a vypíše, kolik segmentů přidal. K uzavřené křivce nelze nic připojit: <Message id="cannotJoinClosedPolyline" />.

### Width

Jedna šířka pro všechny segmenty, zadaná číslem nebo změřená dvěma body; 0 šířku odebere.

### Edit vertex

Označí první vrchol křížkem X a zeptá se, co s ním: <Keyword id="Next" /> a <Keyword id="Previous" /> posouvají X, <Keyword id="Move" /> přesune vrchol, <Keyword id="Insert" /> přidá za něj další, <Keyword id="Break" /> a <Keyword id="Straighten" /> si vrchol zapamatují, X posunete na jiný a <Keyword id="Go" /> křivku mezi nimi přeruší nebo z toho, co leží mezi nimi, udělá jeden přímý segment, <Keyword id="Width" /> nastaví počáteční a koncovou šířku dalšího segmentu, <Keyword id="Tangent" /> dá vrcholu směr pro pozdější proložení a <Keyword id="eXit" /> se vrátí zpět.

### Fit

Nakreslí hladkou křivku z oblouků procházející všemi vrcholy, tečných v místech, kde se stýkají, jak je klade proložení křivky v AutoCADu. Vrcholy zůstanou a jejich úprava křivku přetvaruje.

### Spline

Proloží křivkou B-spline, kterou vrcholy ohraničují, místo aby jimi procházela: kvadratickou nebo kubickou podle SPLINETYPE a tak jemnou, jak určuje SPLINESEGS. U 3D křivky je to <Keyword id="Spline curve" />. Možnost <Keyword command="SPLINE" id="Object" /> příkazu <Command id="SPLINE" /> takovou křivku převede na skutečný spline.

### Decurve

Odebere proložení nebo spline: mezi vrcholy jsou opět přímé segmenty.

### Ltype gen

<Keyword id="ON" /> položí typ čáry jedním vzorem podél celé křivky, takže i čárkovaná křivka s krátkými segmenty ukáže čárky; <Keyword id="OFF" />, výchozí, začíná vzor v každém vrcholu znovu.

### Reverse

Obrátí křivku: její vrcholy opačným směrem, oblouky a šířky s nimi.

### Undo

Vrátí poslední možnost tohoto spuštění a ptá se dál.

## Missing

PEDITACCEPT: po výběru úsečky, oblouku nebo spline se příkaz před převodem vždy zeptá. PLINECONVERTMODE: spline se stane křivkou z přímých segmentů, mnohem většího počtu, než vytvoří AutoCAD, nikdy z oblouků. Proložená křivka se v paletě Vlastnosti ukazuje jako obyčejná křivka, bez titulku 2D křivka a řádku proložení a vyhlazení, které má AutoCAD. Možnost <Keyword id="Multiple" />, když jsou ve výběru jen 3D křivky, klade 3D výzvu, kde AutoCAD klade 2D. Nejsou tu sítě, které by šlo upravovat.

## Questions

### Jak se jmenuje příkaz KEDIT anglicky?

PEDIT. V českém AutoCADu je jeho zkratka `KE`: zadejte ji a stiskněte Enter nebo mezerník. Anglické `PE` v české verzi spouští jiný příkaz, PŘEDVRENDR; celý název `KEDIT` funguje také a `_PEDIT` v AutoCADu v jakémkoli jazyce. Příkaz spustí i poklepání na křivku.

### Jak spojit úsečky do křivky?

Spusťte příkaz KEDIT, vyberte jednu z úseček a stiskněte Enter, aby se převedla na křivku, pak zvolte <Keyword id="Join" /> a vyberte ostatní: ty, které navazují koncovými body, se stanou jednou křivkou. <Command id="JOIN" /> udělá totéž v jednom kroku.

### Proč KEDIT na můj objekt nefunguje?

Příkaz KEDIT upravuje křivky a nabízí převod úseček, oblouků a spline; cokoli jiného, text, kružnici, blok, odmítne a zeptá se znovu. Na objekt v uzamknuté hladině odpoví <Message id="objectOnLockedLayer" />. Připojení přidá jen objekty, jejichž konce přesně navazují na konce křivky: pro mezery použijte <Keyword id="Multiple" /> a vzdálenost tolerance.

### Jak změnit šířku křivky?

Zvolte <Keyword id="Width" /> a zadejte šířku: dostanou ji všechny segmenty. Pro jeden segment použijte <Keyword id="Edit vertex" />, posuňte se na vrchol, kde začíná, a zvolte jeho <Keyword id="Width" />.

### Jak křivku zakřivit?

<Keyword id="Fit" /> proloží oblouky všemi vrcholy; <Keyword id="Spline" /> vytvoří hladší křivku, kterou vrcholy ohraničují. <Keyword id="Decurve" /> ji opět narovná.

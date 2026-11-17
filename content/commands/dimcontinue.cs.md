---
title: "Řetězové kótování v AutoCADu: příkaz KÓTYŘET (DIMCONTINUE)"
metaTitle: "Řetězové kótování v AutoCADu: KÓTYŘET"
description: "Jak v AutoCADu kótovat řetězově příkazem KÓTYŘET (DIMCONTINUE, zkratka KRE): od poslední kóty, další počátky, Vybrat a Zpět. Vyzkoušejte zdarma online."
figure: "Stupňovitý profil okótovaný 30, pak řetězem 40 a 30 na téže čáře: dva počátky, pak dvakrát Enter."
sourceHash: "11fa474694fd"
---

Příkaz KÓTYŘET (DIMCONTINUE) kreslí řetěz kót za sebou: každá začíná na druhé vynášecí čáře předchozí a měří k dalšímu zadanému bodu, na téže kótovací čáře. Navazuje na poslední lineární nebo šikmou kótu vytvořenou od otevření výkresu, a proto obvykle následuje po příkazu <Command id="DIMLINEAR" /> nebo <Command id="DIMALIGNED" />; když žádná taková není, zeptá se, na kterou navázat. Příkazový řádek vypíše každou naměřenou hodnotu, jakmile kóta vznikne. Enter u výzvy k zadání počátku zvolí <Keyword id="Select" /> a Enter u výzvy k výběru kóty příkaz ukončí, stejně jako Esc.

Jako v AutoCADu měří každá nová kóta ve směru základní kóty a přebírá její kótovací styl a hladinu, s aktuální barvou, typem čáry a tloušťkou čáry.

## Options

### Select

Zeptá se na kótu, na kterou se má navázat: vyberte lineární nebo šikmou kótu blízko vynášecí čáry, od které má řetěz pokračovat. Kótu vybere i bod zadaný u této výzvy. Kóta poloměru nebo průměru se odmítne zprávou <Message id="associativeDimensionRequired" /> a otázka se zopakuje.

### Undo

Vrátí poslední kótu řetězu a pokračuje od předchozí, tolikrát, kolik kót je. Když už žádná nezbývá, odpoví <Message id="commandCompletelyUndone" /> a výzva zůstane.

## Missing

Kóta není asociativní: řetěz nesleduje objekty, které měří. Na úhlovou kótu nelze navázat: AutoCAD naváže na takovou kótu vytvořenou jako poslední i vybranou; zde se příkaz při kótě vytvořené jako poslední zeptá na kótu a vybranou odmítne stejně jako radiální. Staniční kóty zatím neexistují.

## Questions

### Jak se jmenuje příkaz pro řetězové kótování anglicky a jakou má zkratku?

Anglicky DIMCONTINUE, v české verzi AutoCADu KÓTYŘET: zadejte `KRE` nebo `KOTYRE` a stiskněte Enter nebo mezerník. Funguje i celý název a `_DIMCONTINUE` v AutoCADu v každém jazyce; anglická zkratka `DCO` v české verzi nefunguje.

### Jaký je rozdíl mezi KÓTYŘET a KÓTYZÁKL?

Příkaz KÓTYŘET řadí kóty za sebou na jednu čáru, každou od místa, kde předchozí skončila. Příkaz <Command id="DIMBASELINE" /> je všechny měří od téže vynášecí čáry, každou na čáře položené dál.

### Jak navázat na kótu, která není poslední?

Stiskněte Enter u první výzvy nebo zvolte <Keyword id="Select" /> a vyberte kótu blízko vynášecí čáry, od které má řetěz pokračovat: řetěz poroste od ní.

### Proč se příkaz KÓTYŘET ptá na výběr kóty?

Nemá na co navázat: od otevření výkresu nevznikla žádná lineární ani šikmá kóta, jako v AutoCADu po otevření výkresu, nebo je poslední vytvořená kóta úhlová. Vyberte kótu, na kterou chcete navázat.

---
title: "Kótování od základny v AutoCADu: příkaz KÓTYZÁKL (DIMBASELINE)"
metaTitle: "Kótování od základny v AutoCADu: KÓTYZÁKL"
description: "Jak v AutoCADu kótovat od jedné základny příkazem KÓTYZÁKL (DIMBASELINE, zkratka KZA): další počátky, rozestup, Vybrat a Zpět. Vyzkoušejte zdarma online."
figure: "Stupňovitý profil okótovaný 30 od levé hrany, pak 70 a 100 od téže hrany, každá kóta o čáru dál."
sourceHash: "619fc0d438e9"
---

Příkaz KÓTYZÁKL (DIMBASELINE) kreslí kóty, které všechny měří od jedné vynášecí čáry, základny: každá vede od první vynášecí čáry poslední kóty k dalšímu zadanému bodu a její kótovací čára leží o krok dál. Začíná od poslední lineární nebo šikmé kóty vytvořené od otevření výkresu, a proto obvykle následuje po příkazu <Command id="DIMLINEAR" /> nebo <Command id="DIMALIGNED" />; když žádná taková není, zeptá se, od které začít. Příkazový řádek vypíše každou naměřenou hodnotu, jakmile kóta vznikne. Enter u výzvy k zadání počátku zvolí <Keyword id="Select" /> a Enter u výzvy k výběru kóty příkaz ukončí, stejně jako Esc.

Krok je „Odsazení základny“ aktuálního kótovacího stylu (3,75 v ISO-25), vynásobené celkovým měřítkem základní kóty. Jako v AutoCADu měří každá nová kóta ve směru základní kóty a přebírá její kótovací styl a hladinu, s aktuální barvou, typem čáry a tloušťkou čáry.

## Options

### Select

Zeptá se na základní kótu: vyberte lineární nebo šikmou kótu blízko vynášecí čáry, od které se má měřit. Kótu vybere i bod zadaný u této výzvy. Kóta poloměru nebo průměru se odmítne zprávou <Message id="associativeDimensionRequired" /> a otázka se zopakuje.

### Undo

Vrátí poslední vytvořenou kótu a pokračuje od předchozí, tolikrát, kolik kót je. Když už žádná nezbývá, odpoví <Message id="commandCompletelyUndone" /> a výzva zůstane.

## Missing

Kóta není asociativní: kóty nesledují objekty, které měří. Úhlová kóta nemůže být základnou: AutoCAD přijme takovou kótu vytvořenou jako poslední i vybranou; zde se příkaz při kótě vytvořené jako poslední zeptá na kótu a vybranou odmítne stejně jako radiální. Staniční kóty zatím neexistují.

## Questions

### Jak se jmenuje příkaz pro kótování od základny anglicky a jakou má zkratku?

Anglicky DIMBASELINE, v české verzi AutoCADu KÓTYZÁKL: zadejte `KZA` nebo `KOTYZA` a stiskněte Enter nebo mezerník. Funguje i celý název a `_DIMBASELINE` v AutoCADu v každém jazyce; anglická zkratka `DBA` v české verzi nefunguje.

### Jak změnit rozestup kót od základny?

Je to „Odsazení základny“ kótovacího stylu: příkaz <Command id="DIMSTYLE" /> (`KSL`) otevře Správce kótovacího stylu, kde je toto nastavení na kartě „Čáry“, jako v AutoCADu. Už nakreslené kóty zůstanou na svých místech; příkaz <Command id="DIMSPACE" /> je znovu rozmístí v pravidelných rozestupech.

### Jak začít od jiné kóty?

Stiskněte Enter u první výzvy nebo zvolte <Keyword id="Select" /> a vyberte kótu blízko vynášecí čáry, od které se má měřit: od ní začne každá nová kóta.

### Jaký je rozdíl mezi příkazy KÓTYZÁKL a KÓTYŘET?

Příkaz KÓTYZÁKL měří každou kótu od téže vynášecí čáry, každou na čáře položené dál. Příkaz <Command id="DIMCONTINUE" /> je řadí za sebou na jednu čáru, každou od místa, kde předchozí skončila.

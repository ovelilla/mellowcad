---
title: "Styl bodu v AutoCADu: příkaz BTYP (PTYPE)"
description: "Jak změnit styl bodu v AutoCADu příkazem BTYP (PTYPE): dialog Styl bodu, dvacet tvarů, velikost bodu, PDMODE a PDSIZE a proč body nejsou vidět. Vyzkoušejte."
figure: "BTYP otevře dialog Styl bodu; jeho OK zapíše PDMODE a PDSIZE, zde zadané jako 35 a 8, pak tři body nakreslené uvnitř desky."
sourceHash: "02cea384a2a9"
---

Příkaz BTYP (PTYPE) otevře dialog Styl bodu, který nastavuje, jak se kreslí každý bodový objekt výkresu: ty, které kreslí <Command id="POINT" />, i ty, které zanechávají <Command id="DIVIDE" /> a <Command id="MEASURE" />. V anglickém AutoCADu je jeho zkratkou `DDPTYPE`; v českém se příkaz jmenuje BTYP. Styl patří výkresu, ne bodu: změňte ho a změní se všechny body najednou; ukládá se s výkresem. Tlačítko je vedle ID bodu mezi nástroji Pomůcky; když příkaz zadáte s apostrofem, `'BTYP`, otevře se uvnitř běžícího příkazu.

Dialog ukazuje dvacet tvarů ve čtyřech řadách po pěti, s vybraným aktuálním: tečka, nic, plus, křížek a krátká čárka, pak každý z nich v kružnici, ve čtverci a v obojím. Pod nimi Velikost bodu a to, jak se čte: Velikost vzhledem k obrazovce, procento výšky pohledu, nebo Velikost v absolutních jednotkách, jednotky výkresu. Výchozí je 5 % vzhledem k obrazovce. OK zapíše volbu jako jeden krok, který vrátí <Command id="U" />; Storno nebo Esc nic nezmění. Velikost, která není číslo nebo je menší než 0, se odmítne (Neplatný vstup.) a dialog zůstane otevřený.

Dialog zapisuje dvě proměnné, které lze zadat i na příkazovém řádku: PDMODE, tvar (0 až 4, plus 32 pro kružnici, 64 pro čtverec, 96 pro obojí: 35 je křížek v kružnici), a PDSIZE, velikost (kladné číslo jsou jednotky výkresu, záporné procento obrazovky, 0 je 5 %).

## Missing

Tlačítko Nápověda v dialogu. Bod s velikostí vzhledem k obrazovce si tuto velikost na obrazovce drží i při zoomování, kdežto AutoCAD jen do příští regenerace výkresu.

## Questions

### Co je DDPTYPE v AutoCADu?

Zkratka příkazu PTYPE v anglickém AutoCADu: oba otevírají dialog Styl bodu. V českém AutoCADu se příkaz jmenuje BTYP a `_PTYPE` funguje v AutoCADu v jakémkoli jazyce.

### Proč nejsou vidět moje body?

Výchozí styl bodu je tečka široká jeden pixel, kterou skryje čára vedená přes ni, a PDMODE 1 nekreslí vůbec nic. Otevřete BTYP a zvolte křížek nebo tvar v kružnici, nebo zadejte PDMODE a `3`. S velikostí vzhledem k obrazovce zůstanou vidět při jakémkoli zoomu.

### Jak změnit velikost bodů?

V příkazu BTYP zadejte Velikost bodu: procento obrazovky s volbou Velikost vzhledem k obrazovce, takže bod si při zoomování drží velikost, nebo jednotky výkresu s volbou Velikost v absolutních jednotkách, takže roste a zmenšuje se s výkresem. Nebo zadejte PDSIZE: záporná hodnota je procento.

### Může mít jeden bod vlastní styl?

Ne: v AutoCADu ani zde, styl bodu patří výkresu a řídí se jím každý bodový objekt. Chcete-li místa označit různě, vložte do nich blok; <Command id="DIVIDE" /> a <Command id="MEASURE" /> mohou místo bodů umístit blok.

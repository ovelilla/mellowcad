---
title: "Příkaz ZOOM v AutoCADu"
description: "Jak funguje příkaz ZOOM (zkratka ZO) v AutoCADu: Maximálně, Okno, Předchozí, měříTko s nX, oBjekt a Vše, kolečko myši, zoom uvnitř příkazu."
figure: "Deska s malým otvorem u rohu: ZOOM Maximálně, pak okno kolem otvoru, který pak vyplní pohled."
sourceHash: "cd72af4956e4"
---

Příkaz ZOOM zvětší nebo zmenší pohled; ve výkresu se nic neposune ani nezmění velikost. Jeho první výzva přijme roh, který začne okno, faktor měřítka nebo možnost. Zadaný s apostrofem, `'ZOOM` nebo `'ZO`, funguje uvnitř jiného příkazu, který po něm pokračuje. Kolečko myši zvětšuje a zmenšuje kolem kurzoru a poklepání kolečkem je ZOOM <Keyword id="Extents" />. Každé spuštění příkazu ZOOM je krok, který lze vrátit zpět, a po sobě jdoucí spuštění tvoří jeden krok, takže <Command id="U" /> vrátí i pohled.

## Options

### All

Zobrazí všechno nakreslené, jako <Keyword id="Extents" />.

### Extents

Zobrazí všechno nakreslené, tak velké, jak okno dovolí. Když není nic nakreslené, vypíše <Message id="regeneratingModel" />, a zadaný uvnitř jiného příkazu odmítne se zprávou <Message id="requiresRegen" />, jako v AutoCADu.

### Previous

Vrátí se k předchozímu pohledu, až 20 pohledů zpět. Když už žádný nezbývá: <Message id="noPreviousView" />.

### Scale

Faktor: `2X` zvětší dvakrát vůči aktuálnímu pohledu, `0.5X` dvakrát zmenší a `2` bez X dá dvojnásobek měřítka pohledu ZOOM <Keyword id="All" />. `nXP`, faktor výkresového prostoru, se čte jako `nX`: je zde jen modelový prostor. Faktor zapsaný v první výzvě funguje stejně i bez volby možnosti.

### Window

Dva rohy, určené nebo tažené, zobrazí tento obdélník. Roh určený v první výzvě funguje stejně.

### Object

Zobrazí vybrané objekty, nebo ty, které byly vybrány před příkazem ZOOM.

## Missing

Rychlý: Enter v první výzvě ukončí ZOOM, zatímco AutoCAD začne zvětšovat myší; zde to dělá kolečko. Dynamický, Střed a skryté Levý a VMax.

## Questions

### Jaká je zkratka příkazu ZOOM v AutoCADu?

`ZO`, pak Enter nebo mezerník: v české verzi AutoCADu má příkaz stejný název, ZOOM, ale anglická zkratka `Z` v české verzi spouští příkaz Z (U), který vrátí jeden krok zpět. `_ZOOM` funguje v AutoCADu v každém jazyce. `ZO`, pak `M` je ZOOM Maximálně.

### Jak v AutoCADu zobrazit celý výkres?

<Keyword id="Extents" />: zadejte `ZO`, Enter, `M`, Enter. Nebo poklepejte kolečkem myši.

### Co v AutoCADu znamená ZOOM XP?

`nXP` zvětší výřez rozvržení v měřítku vůči výkresovému prostoru: `1/50XP` ukáže model na listu v měřítku 1:50. MellowCAD nemá rozvržení, takže se `XP` čte jako `X`.

### Jak v AutoCADu přiblížit objekt?

Zvolte <Keyword id="Object" /> a vyberte objekt, nebo ho nejprve vyberte a pak spusťte ZOOM <Keyword id="Object" />: pohled ho zobrazí.

### Jak se vrátit k předchozímu pohledu?

<Keyword id="Previous" />, znovu a znovu pro starší pohledy, až 20.

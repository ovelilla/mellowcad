---
title: "Příkaz PROTÁHNI (STRETCH) v AutoCADu"
description: "Jak funguje příkaz PROTÁHNI (STRETCH, zkratka PT) v AutoCADu: křížové okno, základní a druhý bod a proč se objekty někdy jen posunou."
figure: "Obdélník a kružnice protažené o 40 doprava křížovým oknem přes pravou stranu: rohy uvnitř okna se posunou a kružnice s nimi."
sourceHash: "de8671fb4290"
---

Příkaz PROTÁHNI (STRETCH) posune část výkresu zachycenou křížovým oknem a protáhne to, co ji spojuje se zbytkem. Vyberte objekty křížovým oknem, taženým zprava doleva, nebo křížovým polygonem přes konce a vrcholy, které chcete posunout; pak zadejte základní bod a druhý bod, jako u příkazu <Command id="MOVE" />. Co okno zachytí, se posune o tuto vzdálenost: konce úsečky, vrcholy křivky, konce oblouku, hranice šraf, počátky vynášecích čar kóty. Co leží celé uvnitř okna, se posune celé; kružnice, text nebo reference bloku se posune, když je jejich střed nebo bod vložení uvnitř okna. Objekty vybrané jednotlivě nebo obyčejným oknem se také posunou celé. Protažení je jeden krok, který lze vrátit zpět.

## Options

### Displacement

Volí se ve výzvě k zadání základního bodu, nebo klávesou Enter, protože je tam výchozí: zeptá se na posunutí jako vektor, `40,0` protáhne o 40 podél X. U druhého bodu udělá Enter totéž se základním bodem: jeho souřadnice jsou posunutím.

## Missing

Eliptický oblouk s jedním koncem v okně, který AutoCAD přetvaruje: zde se posune celý, když je jeho střed v okně, jinak zůstane na místě. Neasociativní šrafy zachycené zčásti, které AutoCAD ponechá na místě. Text kóty ve výchozí poloze zůstane na místě, když okno zachytí jen tento text.

## Questions

### Jak se jmenuje příkaz PROTÁHNI anglicky?

STRETCH. V české verzi AutoCADu zadejte `PROTÁHNI` nebo zkratku `PT` a stiskněte Enter nebo mezerník; zkratka `S` z anglické verze spouští v české příkaz SKUPINA (GROUP). `_STRETCH` funguje v AutoCADu v každém jazyce.

### Proč příkaz PROTÁHNI objekty jen posune?

Protože celý objekt leží uvnitř okna, nebo jste ho vybrali jednotlivě: takové objekty příkaz PROTÁHNI posune celé. Táhněte křížové okno zprava doleva jen přes ty konce, které chcete posunout.

### Jak v AutoCADu protáhnout o přesnou vzdálenost?

Zadejte základní bod a pak zapište posunutí: `40,0` protáhne o 40 podél X, relativně k základnímu bodu při zapnutém dynamickém zadání. Nebo nasměrujte kurzor správným směrem v režimu Orto nebo s polárním trasováním a zapište jen vzdálenost.

### Lze v AutoCADu protáhnout blok?

Reference bloku se posune celá, když je její bod vložení uvnitř okna, jinak zůstane na místě: její obsah se neprotáhne. Chcete-li protáhnout jeho části, nejprve ho rozložte příkazem <Command id="EXPLODE" />.

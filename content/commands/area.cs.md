---
title: "Výpočet plochy v AutoCADu: příkaz PLOCHA (AREA)"
metaTitle: "Výpočet plochy v AutoCADu: PLOCHA (AREA)"
description: "Jak spočítat plochu v AutoCADu příkazem PLOCHA (AREA, zkratka PL): plocha a obvod z bodů nebo objektu a součet s možnostmi Přičíst oblast a Odečíst oblast."
figure: "Deska 100 na 60 s otvorem o poloměru 18: PLOCHA přičte plochu desky, odečte plochu otvoru a vypíše zbývající součet."
sourceHash: "2ca9bb942d1e"
---

Příkaz PLOCHA (AREA) měří plochu a obvod uzavřeného tvaru: buď takového, který obkreslíte jeho rohy, nebo vybraného objektu. Zadejte první roh, pak další: od druhého se tvar uzavřený přes kurzor vyplní průsvitnou zelenou, jak ho stínuje AutoCAD. Enter nebo <Keyword id="Total" /> vypíše na příkazovém řádku `Plocha = …, Obvod = …` a skončí; Enter před třetím rohem se odmítne. S možnostmi Přičíst oblast a Odečíst oblast vede průběžný součet přes několik tvarů. Čísla se vypisují s přesností výkresu a poslední změřenou plochu lze znovu přečíst zadáním `'PLOCHA`.

## Options

### Object

Výchozí možnost první výzvy, takže ji vybere Enter: vyberte kružnici, elipsu, uzavřenou křivku nebo křivku spline, šrafy nebo oblast a PLOCHA vypíše její plochu s obvodem, u kružnice její obvod. Otevřenou křivku, křivku spline nebo eliptický oblouk uzavře přímkou od konce ke konci a vypíše její délku. Úsečka ani text plochu nemají: <Message id="objectHasNoArea" />, a příkaz se zeptá znovu.

### Add

Zahájí průběžný součet: každá plocha změřená potom, rohy nebo možností <Keyword id="Object" />, se přičte a PLOCHA ji vypíše i se součtem. Enter ukončí výběr objektů nebo rohů a příkaz se zeptá znovu, dokud ho Enter na první výzvu neukončí.

### Subtract

Totéž, ale každá plocha se od součtu odečte: nejprve deska, pak její otvory.

### Undo

Vrátí poslední zadaný roh.

### Total

Vypíše plochu a obvod zadaných rohů a skončí.

## Missing

MĚŘITGEOM, nástroje Měřit na pásu karet, s možnostmi Poloměr, Úhel, Objem a Rychlé: tady tlačítka Vzdálenost a Plocha na pásu karet spouštějí VZD a PLOCHA. Možnosti Oblouk a Délka u dalšího bodu příkazu PLOCHA. Rohy mimo rovinu aktuálního USS se měří v půdorysu, kde je AutoCAD měří ve 3D, a hlášení AutoCADu `Objekt není rovnoběžný s USS.` u objektu skloněného vůči USS se nezobrazí.

## Questions

### Jak se jmenuje příkaz PLOCHA anglicky a jakou má zkratku?

Anglicky AREA, v českém AutoCADu PLOCHA: zadejte `PL` a stiskněte Enter nebo mezerník. Anglické `AA` v českém AutoCADu nefunguje; `_AREA` funguje v AutoCADu v jakémkoli jazyce.

### Jak zjistit plochu křivky nebo šraf v AutoCADu?

Spusťte příkaz PLOCHA, stiskem Enter vyberte <Keyword id="Object" /> a vyberte uzavřenou křivku nebo šrafy: jejich plocha a obvod se vypíšou na příkazovém řádku. Plocha šraf nezahrnuje jejich ostrovy.

### Jak v AutoCADu odečíst plochu?

Vyberte <Keyword id="Add" /> a pak <Keyword id="Object" />, vyberte vnější tvar a stiskněte Enter; pak vyberte <Keyword id="Subtract" />, <Keyword id="Object" /> a vyberte každý otvor. PLOCHA po každém vypíše zbývající součet; dvakrát Enter příkaz ukončí.

### Jak získat plochu v metrech čtverečních?

PLOCHA vypisuje čtvereční jednotky výkresu. Kreslíte-li v milimetrech, vydělte 1 000 000: 6 000 000 je 6 m². V centimetrech 10 000.

### Proč PLOCHA hlásí, že objekt nemá plochu?

Mají ji jen uzavřené tvary a křivky: úsečky, samotné oblouky, texty a kóty ne. Vyberte uzavřenou křivku, kružnici nebo šrafy, nebo nejprve spojte úsečky do křivky příkazem <Command id="JOIN" />; případně obkreslete tvar jeho rohy.

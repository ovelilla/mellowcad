---
title: "Příkaz OŘEŽ (TRIM) v AutoCADu"
description: "Jak v AutoCADu oříznout úsečku příkazem OŘEŽ (TRIM, zkratka OR): rychlý a standardní režim, ořezávací hrany, možnosti Napříč a Křížení, Shift pro prodloužení."
figure: "Úsečka oříznutá ke dvěma úsečkám, které ji protínají: každý konec vybraný jednou, v rychlém režimu."
sourceHash: "fcbf44618cf3"
---

Příkaz OŘEŽ (TRIM) ořízne objekt k místům, kde ho protínají jiné objekty: vyberete část, kterou chcete odstranit, a ta zmizí až k nejbližšímu průsečíku na každé straně. Začíná v režimu <Keyword id="Quick" />, jako v AutoCADu: každý objekt je ořezávací hranou a objekt, který nic neprotíná, se vymaže celý. Podržení klávesy Shift při výběru objekt místo toho prodlouží k nejbližší hraně, jako to dělá <Command id="EXTEND" />. Každý výběr je jeden krok, který vrátí <Keyword id="Undo" />; Enter příkaz ukončí.

## Options

### cuTting

Určí, které objekty řežou: vyberte je, nebo stiskněte Enter a převezmou se všechny objekty. Od té chvíle řežou jen ony, v každém režimu, až do konce příkazu.

### Fence

Ptá se na body lomené čáry, kolik jich chcete, až do stisknutí Enter: každý objekt, který čára protne, se ořízne v místě průsečíku, v jednom kroku. Režim <Keyword id="Standard" /> tuto možnost vypisuje; režim <Keyword id="Quick" /> ji přijme také a výběr v prázdném místě sám začne čáru ze dvou bodů.

### Crossing

Zeptá se na dva rohy okna: všechno, co protíná jeho obrys, se ořízne, v jednom kroku. Objekt, který leží celý uvnitř okna, jím protnutý není.

### mOde

Přepíná mezi <Keyword id="Quick" /> a <Keyword id="Standard" />. V režimu <Keyword id="Standard" /> se příkaz OŘEŽ nejprve zeptá na ořezávací hrany (Enter převezme všechny), objekt, který žádná hrana neprotíná, ponechá se zprávou <Message id="doesNotIntersectCuttingEdge" />, vypisuje <Keyword id="Fence" /> a <Keyword id="Edge" /> a výběr v prázdném místě začne křížové okno. Režim je společný pro příkazy OŘEŽ i <Command id="EXTEND" /> a platí do konce relace.

### Edge

Jen v režimu <Keyword id="Standard" />. S <Keyword id="Extend" /> hrana řeže i tam, kde by objekt protnula, kdyby byla prodloužena – úsečka v obou směrech, oblouk podél své kružnice; výchozí je <Keyword id="No extend" />.

### eRase

Vymaže objekty bez opuštění příkazu: vyberte je a Enter je vymaže, jako jeden krok příkazu OŘEŽ, který lze vrátit zpět.

### Undo

Vypíše se, jakmile výzva dostala odpověď – výběr, čáru, okno: vrátí poslední oříznutí, a když už není co vrátit, oznámí to.

## Missing

Projekce: možnost Projekce AutoCADu (Nic, USS, Pohled) se nenabízí a vše se počítá v průmětu do roviny XY systému USS, což odpovídá výchozí hodnotě AutoCADu, USS. Čáru možnosti <Keyword id="Fence" /> zatím nelze táhnout kurzorem, jen určovat bod po bodu. Režim oříznutí a volba v možnosti <Keyword id="Edge" /> platí do konce relace, zatímco AutoCAD je zachová z jedné relace do další. Objekt skloněný vůči USS, kromě spline, neřeže ani se neořízne.

## Questions

### Jak se jmenuje příkaz OŘEŽ anglicky?

TRIM. V české verzi AutoCADu zadejte `OŘEŽ` nebo zkratku `OR` a stiskněte Enter nebo mezerník; zkratka `TR` z anglické verze v české nefunguje. Anglický název s podtržítkem, `_TRIM`, funguje v AutoCADu v každém jazyce.

### Proč příkaz OŘEŽ vymaže celou úsečku?

Protože příkaz pracuje v rychlém režimu, výchozím v AutoCADu od verze 2021: výběr objektu, který žádná hrana neprotíná, ho vymaže. Zvolte <Keyword id="mOde" /> a pak <Keyword id="Standard" />, aby příkaz OŘEŽ takový objekt ponechal a oznámil to.

### Jak v AutoCADu oříznout více úseček najednou?

Klikněte do prázdného místa a určete druhý bod: každý objekt, který tato čára protne, se ořízne v jednom kroku. Nebo zvolte <Keyword id="Crossing" /> a nakreslete okno přes části, které chcete odstranit.

### Jak prodloužit úsečku příkazem OŘEŽ?

Podržte Shift a vyberte úsečku u konce, který chcete prodloužit: prodlouží se k nejbližší hraně, jako u příkazu <Command id="EXTEND" />, a další výběr bez Shiftu zase ořezává.

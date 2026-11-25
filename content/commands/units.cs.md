---
title: "Jednotky v AutoCADu: příkaz JEDNOTKY (UNITS)"
description: "Jak v AutoCADu nastavit jednotky příkazem JEDNOTKY (UNITS, zkratka JN): dialog Výkresové jednotky, přesnost 0 až 8 míst, měřítko pro vložení v mm, cm nebo m."
figure: "JEDNOTKY otevřené nad deskou 100 na 60, pak ID v jejím vzdáleném rohu: souřadnice s přesností výkresu, dvě místa."
sourceHash: "4dd8ca2f4f5c"
---

Příkaz JEDNOTKY (UNITS) otevře dialog Výkresové jednotky, který určuje, jak výkres zapisuje délky a čemu odpovídá jedna výkresová jednotka. Jako v AutoCADu je dialog modální: příkaz trvá, dokud dialog nezavře OK nebo Storno, změna potvrzená tlačítkem OK je jeden krok, který vrátí <Command id="U" />, a Storno nebo Esc nic nezmění. Zadaný s apostrofem, `'JEDNOTKY`, se otevře uvnitř běžícího příkazu, který po zavření dialogu pokračuje. Otevřou ho také jednotky na stavovém řádku a položka Kreslicí pomůcky ▸ Jednotky v nabídce aplikace.

Typ délky je Desítkový a její Přesnost, od 0 do 8 desetinných míst, určuje zápis každé délky: souřadnic, vzdáleností, ploch, výchozích hodnot nabízených ve výzvách. Nový výkres zde začíná na dvou místech, zatímco metrická šablona AutoCADu začíná na čtyřech. Měřítko pro vložení určuje, čím je výkresová jednotka: milimetrem, centimetrem nebo metrem; ukazuje to stavový řádek a dynamické zadání. Příklad výstupu ukáže bod se zvolenou přesností.

## Missing

Ostatní typy délky, architektonické, inženýrské, zlomkové a vědecké, a vědecký zápis obrovské délky. Skupina Úhel: úhly jsou v desetinných stupních, proti směru hodinových ručiček od východu, s přesností nastavenou zapsáním proměnné AUPREC. Ostatní jednotky pro vložení, mezi nimi palce a stopy; Osvětlení; Směr; a -JEDNOTKY, verze pro příkazový řádek.

## Questions

### Jak se jmenuje příkaz JEDNOTKY anglicky?

UNITS. V české verzi AutoCADu zadejte `JEDNOTKY` nebo zkratku `JN` (také `DIAJEDN`) a stiskněte Enter nebo mezerník; zkratka `UN` z anglické verze v české nefunguje. Anglický název s podtržítkem, `_UNITS`, funguje v AutoCADu v každém jazyce.

### Jak nastavit výkresové jednotky na milimetry nebo metry?

Spusťte příkaz JEDNOTKY a v poli Měřítko pro vložení zvolte Milimetry, Centimetry nebo Metry. Výkresová jednotka zůstává jednou jednotkou: zeď dlouhou 5 m nakreslete jako 5 v metrech, nebo 5000 v milimetrech. Volba určuje, které z toho, a ukazuje to stavový řádek a dynamické zadání.

### Jak v AutoCADu změnit počet desetinných míst?

V dialogu příkazu JEDNOTKY zvolte Přesnost, od `0` do `0.00000000`. Mění zápis délek, nikdy geometrii: úsečka nakreslená s délkou 10,125 zůstane dlouhá 10,125 při jakékoli přesnosti.

### Proč kóty nemají přesnost nastavenou v příkazu JEDNOTKY?

Kóta zapisuje svou hodnotu s přesností vlastního kótovacího stylu, ne výkresu. Změňte ji v <Command id="DIMSTYLE" />, na kartě Primární jednotky.

### Lze kreslit ve stopách a palcích?

Zatím ne: délky jsou desetinné a měřítko pro vložení nabízí milimetry, centimetry a metry. Architektonické a inženýrské jednotky chybějí.

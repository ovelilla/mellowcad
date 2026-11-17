---
title: "Souřadnice bodu v AutoCADu: příkaz ID"
description: "Jak v AutoCADu zjistit souřadnice bodu příkazem ID: vyberte bod, i s uchopením, a přečtěte X, Y a Z v aktuálním USS, i uvnitř jiného příkazu. Vyzkoušejte to."
figure: "ID s uchopením Střed na otvoru desky: X, Y a Z středu."
sourceHash: "3f6bc32d12e5"
---

Příkaz ID vypíše souřadnice bodu. U výzvy `Určete bod:` bod vyberte, uchopte nebo zadejte a příkaz ID vypíše na příkazovém řádku na jednom řádku jeho X, Y a Z a skončí. Hodnoty jsou v aktuálním USS, s přesností výkresu. S uchopením objektu je Z výškou objektu v tomto bodě; jinak je to výška roviny úrovně. Enter příkaz ukončí beze slova a objekty vybrané před příkazem ID se při jeho spuštění odznačí. Zadaný s apostrofem, `'ID`, běží uvnitř jiného příkazu, který pak pokračuje.

## Questions

### K čemu slouží příkaz ID v AutoCADu?

Řekne, kde leží bod: X, Y a Z v aktuálním USS. Nic nekreslí ani nemění. V české i anglické verzi AutoCADu má stejný název a `_ID` funguje v každém jazyce.

### Jak v AutoCADu zjistit souřadnice bodu?

Zadejte `ID` a pak klikněte na bod s uchopením objektu, Koncový bod nebo Střed, abyste ho trefili přesně. Souřadnice se vypíšou na příkazovém řádku.

### Jak zjistit souřadnici Z bodu?

Uchopte ho uchopením objektu: příkaz ID vypíše Z objektu v tomto místě. Obyčejné kliknutí dá Z roviny úrovně, 0, pokud ji nezvedne ELEVATION nebo USS.

### Proč příkaz ID ukazuje jiné souřadnice, než čekám?

Příkaz ID měří v aktuálním USS. Pokud byl USS posunut nebo otočen, čísla se měří od jeho počátku podél jeho os: příkaz <Command id="UCS" /> s možností <Keyword command="UCS" id="World" /> vrátí globální souřadnice.

---
title: "Příkaz ATRDISP (ATTDISP) v AutoCADu: zobrazení atributů"
metaTitle: "Zobrazení atributů v AutoCADu: ATRDISP"
description: "Jak zobrazit nebo skrýt atributy bloků v AutoCADu příkazem ATRDISP (ATTDISP): Normální, Ano i neviditelné, Ne žádné. Ukládá se do výkresu. Vyzkoušejte zdarma."
figure: "Dva stoly, jejichž katalogová čísla jsou neviditelné atributy: ATRDISP Ano je ukáže pod každým stolem, vedle viditelných čísel."
sourceHash: "8821fdeb2077"
---

Příkaz ATRDISP (ATTDISP) určuje, které atributy reference bloků ve výkresu zobrazují. Zeptá se na nastavení a nabídne aktuální, v novém výkresu Normální; každé jiné slovo vypíše, že klíčové slovo je neplatné, a zeptá se znovu, a Enter aktuální nastavení ponechá. Změna regeneruje celý výkres, `Regeneruji model.`, jak to píše AutoCAD 2027, ukládá se do výkresu jako ATTMODE a je to krok, který <Command id="U" /> vrátí zpět. Zadaný s apostrofem uvnitř příkazu funguje i tam.

Mění jen to, co je vidět: neviditelný atribut si ponechá svou hodnotu a skrytý lze dál upravovat příkazem <Command id="ATTEDIT" /> nebo <Command id="EATTEDIT" />.

## Options

### Normal

Zobrazí každý atribut tak, jak byl definován: viditelné, ale ne ty, které byly definovány s režimem <Keyword command="ATTDEF" id="Invisible" /> příkazu <Command id="ATTDEF" />.

### ON

Zobrazí všechny atributy, i neviditelné.

### OFF

Skryje všechny atributy, i viditelné.

## Questions

### Jak zobrazit neviditelné atributy v AutoCADu?

Zadejte `ATRDISP` a zvolte <Keyword id="ON" />: zobrazí se všechny atributy, i neviditelné. <Keyword id="Normal" /> je znovu skryje.

### Proč se atributy bloku v AutoCADu nezobrazují?

<Command id="ATTDISP" /> může být nastaven na <Keyword id="OFF" />, což skryje všechny atributy, nebo na <Keyword id="Normal" />, když jsou atributy definovány jako neviditelné. Zvolte <Keyword id="ON" />, abyste viděli všechny. Reference, jejíž blok nemá atributy, nezobrazí žádné, ať je nastavení jakékoli.

### Jak skrýt hodnoty atributů v AutoCADu?

Definujte je jako neviditelné: režim <Keyword command="ATTDEF" id="Invisible" /> příkazu <Command id="ATTDEF" />, ještě než vytvoříte blok. ATRDISP <Keyword id="OFF" /> skryje najednou všechny atributy v celém výkresu.

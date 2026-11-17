---
title: "Cvičení v AutoCADu: schodiště v půdorysu"
metaTitle: "Cvičení v AutoCADu pro začátečníky: schodiště"
description: "Nakreslete v AutoCADu půdorys přímého schodiště: deset stupňů z jedné úsečky a obdélníkového pole, šipka směru výstupu a kóty. Zdarma, krok za krokem."
figure: "Přímé schodišťové rameno v půdorysu, 280 × 100 centimetrů, se šipkou ve směru výstupu."
sourceHash: "ff6e60262cd9"
---

Nakreslete půdorys přímého schodišťového ramene v centimetrech: délka 280, šířka 100, deset stupňů hlubokých 28 a šipka, která ukazuje směr výstupu. Měřítko kót výkresu je nastavené pro půdorys v centimetrech, takže kóty jsou v této velikosti čitelné. Nakreslí se hrana jednoho stupně a ostatní rozmístí obdélníkové pole.

## Steps

### Nakreslete obrys [#outline]

V hladině Obrys příkaz <Command id="RECTANG" /> od `0,0` do `280,100`: obrys ramene.

### Nakreslete první stupeň [#tread]

Hrana prvního stupně: příkaz <Command id="LINE" /> od `28,0`, `0,100` nahoru, a Enter.

### Vytvořte pole stupňů [#array]

Příkaz <Command id="ARRAYRECT" /> ji zkopíruje podél ramene: vyberte úsečku a stiskněte Enter, potom zvolte možnost <Keyword command="ARRAYRECT" id="COUnt" />, `9` sloupců a `1` řádek, a <Keyword command="ARRAYRECT" id="Spacing" />, `28` mezi sloupci a `1` mezi řádky, což u jediného řádku nic nemění. Možnost <Keyword command="ARRAYRECT" id="eXit" /> ponechá výsledek jako asociativní pole, které lze později upravit uzly.

### Nakreslete šipku [#arrow]

Příkaz <Command id="PLINE" /> od `14,50` podél ramene do bodu o `226,0` dál; potom možnost <Keyword command="PLINE" id="Width" />, `10` na začátku a `0` na konci, a poslední segment `24,0`: hrot šipky. Enter příkaz ukončí.

### Okótujte výkres [#dimensions]

V hladině Kóty třikrát příkaz <Command id="DIMLINEAR" />: délku dole, šířku vpravo a jeden stupeň, 28, nahoře.

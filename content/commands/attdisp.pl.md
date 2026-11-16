---
title: "Polecenie ATRWID (ATTDISP) w AutoCADzie: pokaż i ukryj atrybuty"
metaTitle: "Widoczność atrybutów w AutoCADzie: ATRWID"
description: "Jak pokazać lub ukryć atrybuty bloków w AutoCADzie poleceniem ATRWID (ATTDISP): Standard, Tak także dla niewidocznych, Nie dla wszystkich. Zapisywane w rysunku."
figure: "Dwa biurka, których numery katalogowe to niewidoczne atrybuty: ATRWID Tak pokazuje je pod każdym biurkiem, obok widocznych numerów."
sourceHash: "8821fdeb2077"
---

Polecenie ATRWID (ATTDISP) ustala, które atrybuty pokazują odnośniki bloków w rysunku. Pyta o ustawienie, proponując bieżące, w nowym rysunku Standard; każde inne słowo daje komunikat, że słowo kluczowe jest niewłaściwe, i pytanie powtarza się, a Enter je zachowuje. Zmiana generuje ponownie cały rysunek, `Ponowne generowanie modelu.`, jak pisze AutoCAD 2027, i jest zapisywana w rysunku jako ATTMODE, w kroku, który cofa <Command id="U" />. Wpisane z apostrofem wewnątrz polecenia, działa także tam.

Zmienia tylko to, co widać: niewidoczny atrybut zachowuje swoją wartość, a ukryty można nadal edytować poleceniem <Command id="ATTEDIT" /> lub <Command id="EATTEDIT" />.

## Options

### Normal

Pokazuje każdy atrybut tak, jak go zdefiniowano: widoczne, ale nie te zdefiniowane z trybem <Keyword command="ATTDEF" id="Invisible" /> polecenia <Command id="ATTDEF" />.

### ON

Pokazuje wszystkie atrybuty, także niewidoczne.

### OFF

Ukrywa wszystkie atrybuty, także widoczne.

## Questions

### Jak pokazać niewidoczne atrybuty w AutoCADzie?

Wpisz `ATRWID` i wybierz <Keyword id="ON" />: widać wszystkie atrybuty, także niewidoczne. <Keyword id="Normal" /> znów je ukrywa.

### Dlaczego nie widać atrybutów bloku w AutoCADzie?

<Command id="ATTDISP" /> może być ustawione na <Keyword id="OFF" />, co ukrywa każdy atrybut, albo na <Keyword id="Normal" />, gdy atrybuty zdefiniowano jako niewidoczne. Wybierz <Keyword id="ON" />, aby zobaczyć je wszystkie. Odnośnik, którego blok nie ma atrybutów, nie pokazuje żadnych, niezależnie od ustawienia.

### Jak ukryć wartości atrybutów w AutoCADzie?

Zdefiniuj je jako niewidoczne: tryb <Keyword command="ATTDEF" id="Invisible" /> polecenia <Command id="ATTDEF" />, zanim utworzysz blok. ATRWID <Keyword id="OFF" /> ukrywa od razu wszystkie atrybuty w całym rysunku.

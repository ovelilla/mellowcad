---
title: "Skalowanie w AutoCADzie: polecenie SKALA (SCALE)"
description: "Jak skalować obiekty w AutoCADzie poleceniem SKALA (SCALE, skrót S): punkt bazowy, współczynnik skali, Kopiuj i Odniesienie do znanej długości."
figure: "Płyta z otworem przeskalowana na kopii opcją Odniesienie względem narożnika: wskazana krawędź o długości 40 otrzymuje długość 60."
sourceHash: "005829bf17ad"
---

Polecenie SKALA (SCALE) powiększa lub pomniejsza wybrane obiekty względem punktu bazowego, który pozostaje na miejscu: współczynnik 2 podwaja je, 0,5 zmniejsza o połowę, jednakowo we wszystkich kierunkach. Wybierz obiekty, wskaż punkt bazowy, a potem wpisz współczynnik albo przesuń kursor i kliknij: obiekty podążają za nim. Enter w tym miejscu, bez wpisanej wartości, skaluje o ostatnio użyty współczynnik. Każde wykonanie to jeden krok, który można cofnąć.

Skaluje wszystko, co obejmuje, tak jak AutoCAD: wzór kreskowania rośnie razem z obwiednią, wymiar mierzy swoją nową długość, a obiekt nad płaszczyzną skaluje się także w osi Z względem punktu bazowego.

## Options

### Copy

Skaluje kopię i pozostawia obiekty bez zmian: wyświetla <Message id="scalingCopy" /> i ponownie pyta o współczynnik, nadal z opcją <Keyword id="Copy" /> na liście.

### Reference

Pyta o długość odniesienia, wpisaną albo wskazaną dwoma punktami, a potem o długość, jaką ma mieć: współczynnik to nowa długość podzielona przez długość odniesienia. Nową długość wpisuje się albo wskazuje punktem, którego odległość od punktu bazowego ją wyznacza; <Keyword id="Points" /> pyta zamiast tego o dwa punkty i mierzy odległość między nimi. Obie długości proponują ostatnio podane, w nowym rysunku 1.

## Missing

Enter przy pierwszym lub drugim punkcie opcji <Keyword id="Points" /> kończy polecenie bez skalowania, podczas gdy AutoCAD skaluje według odczytu kursora w tym miejscu. Bardzo mały współczynnik jest stosowany bez komunikatu, podczas gdy AutoCAD informuje, że go ignoruje. Przeciągane obiekty są rysowane tak, jak przeciąga je <Command id="MOVE" />, tylko w swoim kolorze.

## Questions

### Jak się nazywa polecenie SKALA po angielsku?

SCALE. W polskim AutoCADzie wpisz `SKALA` lub skrót `S` i naciśnij Enter lub spację; skrót `SC` z wersji angielskiej w polskiej nie działa, a `S` uruchamia w niej SKALA, a nie ROZCIĄGNIJ. `_SCALE` działa w AutoCADzie w każdym języku.

### Jak skalować z odniesieniem w AutoCADzie?

Przy współczynniku wybierz <Keyword id="Reference" />, wskaż dwa końce krawędzi o znanej długości, a potem wpisz długość, jaką ma mieć. Wszystko, co wybrano, skaluje się w stosunku nowej długości do starej, więc rysunek w złym rozmiarze można poprawić na podstawie jednego znanego wymiaru.

### Jak przeskalować obiekt i zachować oryginał?

Przy współczynniku wybierz <Keyword id="Copy" />: skaluje się kopia, a oryginał zostaje na miejscu.

### Jak zmienić skalę rodzaju linii?

Nie poleceniem SKALA, które zmienia rozmiar obiektów: <Command id="LTSCALE" /> ustala długość kresek i przerw każdego rodzaju linii.

### Jak ustawić skalę wydruku lub układu?

MellowCAD nie ma układów, rzutni ani drukowania: rysujesz w rzeczywistej wielkości w obszarze modelu, a SKALA zmienia rozmiar samych obiektów, a nie sposób, w jaki zostałyby wydrukowane.

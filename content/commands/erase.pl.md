---
title: "Polecenie WYMAŻ (ERASE) w AutoCADzie"
description: "Jak usunąć obiekty w AutoCADzie poleceniem WYMAŻ (ERASE, skrót WY): wybór, Enter i ich nie ma; klawisz Delete, WSZYSTKO i jak odzyskać wymazane obiekty."
figure: "Prostokąt i jego dwie przekątne: wskazana jedna przekątna, potem Enter i zostaje wymazana."
sourceHash: "2de33971060a"
---

Polecenie WYMAŻ (ERASE) usuwa z rysunku wybrane obiekty. Wybierz je przy monicie `Wybierz obiekty:`, wskazując je lub dowolnym trybem wyboru AutoCADa, w tym oknem lub oknem przecinającym, a potem naciśnij Enter lub spację: znikają, a polecenie nic więcej nie mówi. Esc kończy je bez wymazania czegokolwiek. Jak w AutoCADzie, obiekty wybrane przed poleceniem są wymazywane od razu, a klawisz Delete przy wybranych obiektach uruchamia na nich polecenie WYMAŻ. Podczas wybierania obiekt pod kursorem i obiekty już wybrane są rysowane wyblakłe, tak jak AutoCAD pokazuje podgląd tego, co wymaże. Całe wymazanie to jeden krok cofania.

## Missing

Polecenie ODDAJ, które w AutoCADzie przywraca ostatni zbiór wymazany poleceniem WYMAŻ, nawet po innych poleceniach. Tutaj polecenie <Command id="U" /> lub Ctrl+Z cofa wymazanie razem z tym, co nastąpiło po nim.

## Questions

### Jak się nazywa polecenie WYMAŻ po angielsku i jaki ma skrót?

ERASE. W polskim AutoCADzie jego skróty to `WY` i `DELETE`: wpisz jeden z nich i naciśnij Enter lub spację. Angielskie `E` w polskiej wersji uruchamia polecenie ELIPSA; `_ERASE` działa w AutoCADzie w każdym języku. Możesz też wybrać obiekty przy monicie `Polecenie:` i nacisnąć klawisz Delete.

### Jak wymazać wszystko w rysunku?

Uruchom polecenie WYMAŻ i wpisz `WSZYSTKO` przy monicie `Wybierz obiekty:`, a potem naciśnij Enter. Obiekty na zablokowanej warstwie są pomijane, a wybór mówi, ile ich było.

### Jak odzyskać to, co wymazałem?

Wpisz polecenie <Command id="U" /> lub naciśnij Ctrl+Z od razu: wymazanie to jeden krok cofania. Polecenia ODDAJ, które przywraca ostatnio wymazany zbiór nawet po innych poleceniach, jeszcze nie ma.

### Czym się różni polecenie WYMAŻ od UTNIJ?

Polecenie WYMAŻ usuwa całe obiekty. Polecenie <Command id="TRIM" /> usuwa tylko tę część obiektu, która wychodzi poza krawędzie, na które trafia, a resztę zachowuje.

---
title: "Polecenie LINIA (LINE) w AutoCADzie"
description: "Jak narysować linię w AutoCADzie poleceniem LINIA (LINE, skrót L), monit po monicie: punkty wskazane lub wpisane, Cofaj, Zamknij i kontynuacja. Wypróbuj online."
figure: "Trójkąt: pierwszy punkt wpisany, dwa następne względem ostatniego punktu, potem Zamknij."
sourceHash: "5065fc1817a1"
---

Polecenie LINIA (LINE) rysuje proste segmenty, każdy jako osobny obiekt: podaj pierwszy punkt, potem każdy następny, aż do Enter. Punkt można wskazać, zlokalizować względem obiektu albo wpisać. Jak w AutoCADzie z włączonym wprowadzaniem dynamicznym, punkt wpisany po pierwszym jest liczony od ostatniego, więc `80,0` rysuje 80 wzdłuż X, a historia zapisuje go jako `@80,0`; sama liczba to odległość w kierunku kursora, a `<30` blokuje następny punkt na kącie 30°. Enter lub kliknięcie prawym przyciskiem przy pierwszym punkcie kontynuuje od końca ostatniej linii, polilinii lub łuku: od łuku stycznie, pytając tylko o długość. Niezależnie od liczby segmentów jedno <Command id="U" /> cofa całe polecenie.

## Options

### Undo

Cofa ostatni segment i znów pyta od punktu poprzedniego. Gdy nie zostaje żaden segment, wyświetla <Message id="allLineSegmentsUndone" /> i ponownie pyta o pierwszy punkt.

### Close

Dostępna od drugiego segmentu: rysuje ostatni segment z powrotem do pierwszego punktu i kończy polecenie, zamykając kształt.

## Missing

Lokalizacja Styczna lub Prostopadle wpisana przy pierwszym punkcie czeka na następny punkt (odroczona lokalizacja), jak w AutoCADzie, ale tylko nad liniami, okręgami i łukami, nie nad segmentem polilinii, elipsą ani splajnem, a dwie odroczone lokalizacje Prostopadle nie są rozwiązywane.

## Questions

### Jak się nazywa polecenie LINIA po angielsku?

LINE. W polskim AutoCADzie jego skrót to `L`, tak jak w angielskim: wpisz go i naciśnij Enter lub spację. Pełna nazwa `LINIA` też działa, a `_LINE` – w AutoCADzie w każdym języku.

### Jak narysować linię o danej długości pod kątem?

Podaj pierwszy punkt, a następny wpisz jako długość i kąt: `@100<30` rysuje 100 pod kątem 30°. Albo włącz śledzenie biegunowe, prowadź kursor wzdłuż jego linii pod tym kątem i wpisz tylko długość.

### Jak kontynuować od ostatnio narysowanej linii?

Uruchom polecenie LINIA i naciśnij Enter przy pierwszym punkcie: zacznie od końca ostatniej linii, polilinii lub łuku. Od łuku linia biegnie stycznie do niego, a polecenie pyta tylko o jej długość. Gdy nie ma od czego kontynuować, wyświetla <Message id="noLineOrArcToContinue" />.

### Dlaczego moja linia składa się z osobnych kawałków?

Każdy segment narysowany poleceniem LINIA jest osobną linią, jak w AutoCADzie. Aby mieć jeden obiekt, rysuj poleceniem <Command id="PLINE" /> albo połącz linie potem poleceniem <Command id="JOIN" />.

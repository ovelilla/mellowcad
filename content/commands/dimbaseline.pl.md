---
title: "Wymiarowanie od bazy w AutoCADzie: polecenie WYMBAZA (DIMBASELINE)"
metaTitle: "Wymiarowanie od bazy w AutoCADzie: WYMBAZA"
description: "Jak wymiarować od jednej bazy w AutoCADzie poleceniem WYMBAZA (DIMBASELINE, skrót WB): kolejne początki, odstęp, Wybierz i Cofaj. Wypróbuj za darmo online."
figure: "Profil schodkowy zwymiarowany 30 od lewej krawędzi, potem 70 i 100 od tej samej krawędzi, każdy wymiar o linię dalej."
sourceHash: "cd7902f90b59"
---

Polecenie WYMBAZA (DIMBASELINE) rysuje wymiary mierzone od jednej linii pomocniczej, czyli bazy: każdy biegnie od pierwszej linii pomocniczej ostatniego wymiaru do następnego podanego punktu, a jego linia wymiarowa leży o krok dalej. Zaczyna od ostatniego wymiaru liniowego lub wyrównanego utworzonego od otwarcia rysunku, dlatego zwykle następuje po poleceniu <Command id="DIMLINEAR" /> lub <Command id="DIMALIGNED" />; gdy takiego nie ma, pyta, od którego zacząć. Wiersz polecenia podaje każdą wartość w chwili utworzenia wymiaru. Enter przy monicie o początek wybiera <Keyword id="Select" />, a Enter przy monicie wyboru wymiaru kończy polecenie, podobnie jak Esc.

Krok to „Odstępy między liniami bazowymi” bieżącego stylu wymiarowania (3,75 w ISO-25), pomnożone przez globalną skalę wymiaru bazowego. Jak w AutoCADzie, każdy nowy wymiar mierzy wzdłuż kierunku wymiaru bazowego i przejmuje jego styl wymiarowania i warstwę, z bieżącym kolorem, rodzajem linii i szerokością linii.

## Options

### Select

Pyta o wymiar bazowy: wskaż wymiar liniowy lub wyrównany blisko linii pomocniczej, od której należy mierzyć. Punkt wpisany przy tym monicie też wskazuje wymiar. Wymiar promienia lub średnicy jest odrzucany komunikatem <Message id="associativeDimensionRequired" />, a pytanie pada ponownie.

### Undo

Cofa ostatni utworzony wymiar i kontynuuje od poprzedniego, tyle razy, ile jest wymiarów. Gdy nie zostaje żaden, odpowiedzią jest <Message id="commandCompletelyUndone" />, a monit się nie zmienia.

## Missing

Wymiar nie jest skojarzony: wymiary nie podążają za obiektami, które mierzą. Wymiar kątowy nie może być bazą: AutoCAD przyjmuje taki wymiar utworzony jako ostatni lub wskazany; tutaj, gdy utworzono go jako ostatni, polecenie pyta o wymiar, a wskazany jest odrzucany jak promieniowy. Wymiarów współrzędnościowych jeszcze nie ma.

## Questions

### Jak się nazywa polecenie wymiarowania od bazy po angielsku i jaki ma skrót?

Po angielsku DIMBASELINE, w polskim AutoCADzie WYMBAZA: wpisz `WB` lub `WYMBA`, a potem naciśnij Enter lub spację. Pełna nazwa też działa, a `_DIMBASELINE` – w AutoCADzie w każdym języku.

### Jak zmienić odstęp między wymiarami od bazy?

To „Odstępy między liniami bazowymi” stylu wymiarowania: polecenie <Command id="DIMSTYLE" /> (`WST`) otwiera style w palecie „Style”, gdzie to ustawienie jest w grupie „Linie”, jak w AutoCADzie. Wymiary już narysowane zostają na swoich miejscach; polecenie <Command id="DIMSPACE" /> rozmieszcza je ponownie, w równych odstępach.

### Jak zacząć od innego wymiaru?

Naciśnij Enter przy pierwszym monicie albo wybierz <Keyword id="Select" /> i wskaż wymiar blisko linii pomocniczej, od której należy mierzyć: od niej zaczyna się każdy nowy wymiar.

### Czym się różni WYMBAZA od WYMSZEREG?

Polecenie WYMBAZA mierzy każdy wymiar od tej samej linii pomocniczej, każdy na linii położonej dalej. Polecenie <Command id="DIMCONTINUE" /> ustawia je jeden za drugim na jednej linii, każdy od miejsca, w którym skończył się poprzedni.

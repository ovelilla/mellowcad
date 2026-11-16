---
title: "Wymiarowanie szeregowe w AutoCADzie: polecenie WYMSZEREG (DIMCONTINUE)"
metaTitle: "Wymiarowanie szeregowe w AutoCADzie: WYMSZEREG"
description: "Jak wymiarować szeregowo w AutoCADzie poleceniem WYMSZEREG (DIMCONTINUE, skrót WS): od ostatniego wymiaru, kolejne początki, Wybierz i Cofaj."
figure: "Profil schodkowy zwymiarowany 30, potem szereg 40 i 30 na tej samej linii: dwa początki, potem dwa razy Enter."
sourceHash: "11fa474694fd"
---

Polecenie WYMSZEREG (DIMCONTINUE) rysuje szereg wymiarów jeden za drugim: każdy zaczyna się na drugiej linii pomocniczej poprzedniego i mierzy do następnego podanego punktu, na tej samej linii wymiarowej. Kontynuuje ostatni wymiar liniowy lub wyrównany utworzony od otwarcia rysunku, dlatego zwykle następuje po poleceniu <Command id="DIMLINEAR" /> lub <Command id="DIMALIGNED" />; gdy takiego nie ma, pyta, który kontynuować. Wiersz polecenia podaje każdą wartość w chwili utworzenia wymiaru. Enter przy monicie o początek wybiera <Keyword id="Select" />, a Enter przy monicie wyboru wymiaru kończy polecenie, podobnie jak Esc.

Jak w AutoCADzie, każdy nowy wymiar mierzy wzdłuż kierunku wymiaru bazowego i przejmuje jego styl wymiarowania i warstwę, z bieżącym kolorem, rodzajem linii i szerokością linii.

## Options

### Select

Pyta o wymiar, od którego należy kontynuować: wskaż wymiar liniowy lub wyrównany blisko linii pomocniczej, od której szereg ma biec dalej. Punkt wpisany przy tym monicie też wskazuje wymiar. Wymiar promienia lub średnicy jest odrzucany komunikatem <Message id="associativeDimensionRequired" />, a pytanie pada ponownie.

### Undo

Cofa ostatni wymiar szeregu i kontynuuje od poprzedniego, tyle razy, ile jest wymiarów. Gdy nie zostaje żaden, odpowiedzią jest <Message id="commandCompletelyUndone" />, a monit się nie zmienia.

## Missing

Wymiar nie jest skojarzony: szereg nie podąża za obiektami, które mierzy. Wymiaru kątowego nie można kontynuować: AutoCAD kontynuuje taki wymiar utworzony jako ostatni lub wskazany; tutaj, gdy utworzono go jako ostatni, polecenie pyta o wymiar, a wskazany jest odrzucany jak promieniowy. Wymiarów współrzędnościowych jeszcze nie ma.

## Questions

### Jak się nazywa polecenie wymiarowania szeregowego po angielsku i jaki ma skrót?

Po angielsku DIMCONTINUE, w polskim AutoCADzie WYMSZEREG: wpisz `WS` lub `WYMSZ`, a potem naciśnij Enter lub spację. Pełna nazwa też działa, a `_DIMCONTINUE` – w AutoCADzie w każdym języku.

### Czym się różni WYMSZEREG od WYMBAZA?

Polecenie WYMSZEREG ustawia wymiary jeden za drugim na jednej linii, każdy od miejsca, w którym skończył się poprzedni. Polecenie <Command id="DIMBASELINE" /> mierzy je wszystkie od tej samej linii pomocniczej, każdy na linii położonej dalej.

### Jak kontynuować od wymiaru, który nie jest ostatni?

Naciśnij Enter przy pierwszym monicie albo wybierz <Keyword id="Select" /> i wskaż wymiar blisko linii pomocniczej, od której szereg ma biec dalej: szereg rośnie od niej.

### Dlaczego polecenie WYMSZEREG prosi o wybranie wymiaru?

Nie ma czego kontynuować: od otwarcia rysunku nie utworzono żadnego wymiaru liniowego ani wyrównanego, jak w AutoCADzie po otwarciu rysunku, albo ostatni utworzony jest kątowy. Wskaż wymiar, od którego chcesz kontynuować.

---
title: "Polecenie ROZBIJ (EXPLODE) w AutoCADzie"
description: "Jak rozbić blok lub polilinię w AutoCADzie poleceniem ROZBIJ (EXPLODE, skrót R): na linie i łuki, obiekty bloku, wiersze tekstu, linie kreskowania."
figure: "Prostokąt, czyli jedna polilinia, rozbity na cztery linie, z których jedna zostaje potem wymazana osobno."
sourceHash: "479cf1cd58d9"
---

Polecenie ROZBIJ (EXPLODE) rozbija obiekt złożony na obiekty, z których się składa. Wybierz obiekty i naciśnij Enter: polilinia staje się liniami i łukami wzdłuż swojej linii środkowej, odnośnik bloku – obiektami swojego bloku, o jeden poziom niżej, tekst wielowierszowy – jednym tekstem na każdy wyświetlany wiersz, a kreskowanie wzorem – liniami swojego wzoru. Każda część zachowuje warstwę i właściwości obiektu; części bloku zachowują własne. Polilinia z szerokością traci szerokość, a polecenie ROZBIJ o tym informuje. Linii, okręgów, łuków, tekstu jednowierszowego i wymiarów nie można rozbić: są odrzucane już przy wyborze, a splajn, elipsa i kreskowanie pełne – przy zamknięciu wyboru. Rozbicie to jeden krok cofania.

## Missing

Wymiary, które AutoCAD rozbija na linie, groty strzałek i tekst, a MellowCAD odrzuca. Kreskowanie wzorem, którego tutaj nie ma, jest odrzucane jak pełne, a rozbity tekst wielowierszowy stoi tam, gdzie wypada w naszej czcionce, odrobinę obok miejsca, w którym stawia go AutoCAD.

## Questions

### Jak się nazywa polecenie ROZBIJ po angielsku i jaki ma skrót?

EXPLODE. W polskim AutoCADzie jego skrót to `R`: wpisz go i naciśnij Enter lub spację. Angielskie `X` w polskiej wersji nie działa; `_EXPLODE` działa w AutoCADzie w każdym języku.

### Jak cofnąć rozbicie w AutoCADzie?

Wpisz polecenie <Command id="U" /> lub naciśnij Ctrl+Z od razu: rozbicie to jeden krok cofania. Później polecenie <Command id="JOIN" /> łączy linie i łuki stykające się końcami z powrotem w jedną polilinię, a polecenie <Command id="BLOCK" /> znowu robi z obiektów jeden blok.

### Czy można rozbić tekst w AutoCADzie?

Tekst wielowierszowy tak: każdy wiersz staje się tekstem jednowierszowym. Tekst jednowierszowy jest już najmniejszym kawałkiem i polecenie ROZBIJ go odrzuca.

### Jak rozbić blok w AutoCADzie?

Wybierz odnośnik bloku i naciśnij Enter: staje się obiektami swojego bloku, tam, gdzie rysował je odnośnik. Blok zagnieżdżony w nim pozostaje blokiem: rozbij go jeszcze raz. Atrybuty wracają jako ich definicje, bez wartości.

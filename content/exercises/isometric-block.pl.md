---
title: "Ćwiczenie AutoCAD: klocek schodkowy w izometrii"
metaTitle: "Rysunek izometryczny w AutoCADzie: ćwiczenie"
description: "Narysuj klocek schodkowy w izometrii w AutoCADzie poleceniem LINIA (LINE) i współrzędnymi biegunowymi wzdłuż osi 30°, 90° i 150°, potem go zwymiaruj."
figure: "Klocek schodkowy w izometrii: długość 60, głębokość 40, wysokość 40, wymiary wzdłuż krawędzi."
sourceHash: "c1039d3b5e97"
---

Narysuj ten klocek schodkowy w izometrii, w milimetrach: długość 60, głębokość 40, wysokość 40, ze stopniem głębokim na 20 i wysokim na 20 wzdłuż przodu. Każda krawędź biegnie wzdłuż jednej z osi izometrycznych: 30° i 210° dla długości, 150° i 330° dla głębokości, 90° i 270° dla wysokości. MellowCAD nie ma jeszcze rysunku izometrycznego AutoCADa, jego skoku izometrycznego ani izookręgów, więc krawędzie to linie wpisane we współrzędnych biegunowych: długość i kąt.

## Steps

### Narysuj przód stopnia [#front]

Na warstwie Kontur polecenie <Command id="LINE" /> od `0,0`, dolnego przedniego naroża: `60<30`, `20<90`, `60<210`, potem opcja <Keyword command="LINE" id="Close" />.

### Narysuj bok [#side]

Znowu od `0,0`, lewy bok: `40<150`, `40<90`, `20<330`, `20<270` i `20<330`. Enter kończy linię na przedniej krawędzi stopnia.

### Narysuj górę [#top]

Reszta zaczyna się w narożach już narysowanych: wpisz `_END`, tryb lokalizacji Punkt końcowy dla jednego punktu, i wskaż naroże. Od prawego górnego naroża przodu: `20<150`, `20<90`, `20<150` i `60<210`. Potem dwie linie `60<210`, od dołu podstopnicy i od jej góry.

### Zwymiaruj rysunek [#dimensions]

Na warstwie Wymiary polecenie <Command id="DIMALIGNED" /> wzdłuż krawędzi, każdy wymiar obok swojej krawędzi: 60 i 40 na dole, 40 wzdłuż lewego boku, 20 wzdłuż prawego.

---
title: "Ćwiczenie AutoCAD: działka"
metaTitle: "Ćwiczenie AutoCAD: powierzchnia i boki działki"
description: "Narysuj działkę w AutoCADzie z długości i kątów jej boków we współrzędnych biegunowych, potem zmierz jej pole i zwymiaruj ją. Krok po kroku, za darmo online."
figure: "Działka o pięciu bokach, w metrach, z wymiarem każdego boku i jednego kąta."
sourceHash: "f5542a75eef7"
---

Narysuj tę działkę w metrach, z długości i kierunków jej boków: 40 pod kątem 0°, 30 pod kątem 80°, 35 pod kątem 155° i 25 pod kątem 230°, a potem z powrotem do początku. Zmierz jej pole i obwód, zwymiaruj każdy bok i kąt w drugim wierzchołku. Współrzędne biegunowe – długość i kąt – wyznaczają każdy bok od końca poprzedniego. Skala wymiarów rysunku jest ustawiona dla metrów.

## Steps

### Narysuj granicę [#boundary]

Na warstwie Kontur polecenie <Command id="PLINE" /> od `0,0`, potem każdy bok jako długość i kąt: `40<0`, `30<80`, `35<155` i `25<230`, każdy mierzony od ostatniego punktu. Opcja <Keyword command="PLINE" id="Close" /> rysuje piąty bok i zamyka granicę: jeden obiekt, który polecenie <Command id="AREA" /> potrafi zmierzyć.

### Zmierz pole [#area]

Polecenie <Command id="AREA" />, potem opcja <Keyword command="AREA" id="Object" />, i wskaż granicę: wiersz polecenia podaje jej pole, w metrach kwadratowych, i obwód.

### Zwymiaruj rysunek [#dimensions]

Na warstwie Wymiary polecenie <Command id="DIMALIGNED" /> i Enter przy pierwszym monicie: polecenie pyta wtedy o obiekt, a wskazanie boku wymiaruje ten bok, równolegle do niego. Umieść każdy wymiar na zewnątrz działki. Polecenie <Command id="DIMANGULAR" /> na dwóch bokach, które spotykają się w `40,0`, podaje kąt między nimi, 100°.

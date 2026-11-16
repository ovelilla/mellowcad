---
title: "Ćwiczenie AutoCAD 3D: płyta montażowa"
metaTitle: "Ćwiczenie AutoCAD 3D dla początkujących: płyta"
description: "Zamodeluj płytę montażową w AutoCADzie 3D: regiony, odjęcie otworów i jedno wyciągnięcie tworzą bryłę. Krok po kroku, ćwiczenie 3D za darmo online."
figure: "Kontur płyty, 100 na 60, z czterema otworami i wymiarami."
model: "Płyta jako bryła o grubości 10, widziana z południowego wschodu, z usuniętymi liniami niewidocznymi."
sourceHash: "87b8f906b0fd"
---

Zamodeluj płytę montażową o grubości 10, w milimetrach: kontur 100 na 60 z narożami o promieniu 8 i cztery otwory o średnicy 10, których środki leżą 15 od krawędzi. Praca zaczyna się na płasko. Kontur i okręgi stają się regionami, otwory odejmuje się, póki płyta jest jeszcze płaska, a jedno wyciągnięcie zamienia ją w bryłę razem z otworami.

## Steps

### Narysuj profil [#profile]

Na warstwie Kontur polecenie <Command id="RECTANG" /> z zaokrągleniem (<Keyword command="RECTANG" id="Fillet" />) `8`, od `0,0` do `100,60`. Potem okrąg w `15,15` o średnicy (<Keyword command="CIRCLE" id="Diameter" />) `10` i polecenie <Command id="COPY" />, które kopiuje go od jego środka do `70,0`, `70,30` i `0,30`.

### Utwórz regiony [#region]

Polecenie <Command id="REGION" /> zamienia obiekty zamknięte w regiony: wskaż kontur i cztery okręgi, potem Enter. Pięć pętli, pięć regionów.

### Odejmij otwory [#subtract]

Polecenie <Command id="SUBTRACT" />: wskaż region płyty i naciśnij Enter, potem regiony czterech okręgów i Enter. Zostaje jeden region z czterema otworami.

### Obróć widok [#view]

Polecenie <Command id="-VIEW" /> i opcja <Keyword command="VIEW" id="SEiso" /> pokazują płytę z południowego wschodu i z góry; polecenie <Command id="VSCURRENT" /> i opcja <Keyword command="VSCURRENT" id="Hidden" /> ukrywają to, co zasłaniają ściany. Widok można też obrócić kliknięciem w ViewCube.

### Wyciągnij region [#extrude]

Polecenie <Command id="EXTRUDE" />: wskaż region, naciśnij Enter i wpisz wysokość, `10`. Płyta jest bryłą, razem z otworami. Polecenie <Command id="ZOOM" /> z opcją <Keyword command="ZOOM" id="Extents" /> dopasowuje ją do ekranu, a skala `0.8x` zostawia wokół niej miejsce.

---
title: "Ćwiczenie AutoCAD 3D: korpus łożyska"
metaTitle: "Ćwiczenie AutoCAD 3D: korpus łożyska z otworami"
description: "Zamodeluj korpus łożyska w AutoCADzie 3D: wyciągnij, zsumuj, potem odejmij otwór i dwa otwory na śruby jako walce. Krok po kroku, bryły 3D za darmo online."
figure: "Korpus łożyska w rzucie, 100 na 60, z wymiarami tulei, otworu łożyskowego i otworów."
model: "Korpus łożyska jako bryła, widziany z południowego wschodu w stylu wizualnym Koncepcyjny."
sourceHash: "5579d6bd5a86"
---

Zamodeluj ten korpus łożyska w milimetrach: podstawa 100 na 60 z narożami o promieniu 10, grubość 12; tuleja o średnicy 40 i wysokości 40 pośrodku; otwór o średnicy 20 przez tuleję i dwa otwory na śruby o średnicy 10 przez podstawę, w rozstawie 76. Podstawę i tuleję wyciąga się z ich konturów i łączy w jedną bryłę; otwory to walce od niej odjęte.

## Steps

### Narysuj rzut [#plan]

Na warstwie Kontur polecenie <Command id="RECTANG" /> z zaokrągleniem (<Keyword command="RECTANG" id="Fillet" />) `10`, od `0,0` do `100,60`, i okrąg w jego środku, `50,30`, o średnicy (<Keyword command="CIRCLE" id="Diameter" />) `40`.

### Wyciągnij podstawę i tuleję [#extrude]

Polecenie <Command id="EXTRUDE" />: kontur na wysokość `12`, potem okrąg na wysokość `40`. Powstają dwie bryły.

### Zsumuj je [#union]

Polecenie <Command id="UNION" />: wskaż obie i naciśnij Enter. Tworzą jedną bryłę.

### Narysuj walce [#holes]

Otwór łożyskowy i otwór na śrubę jako walce, poleceniem <Command id="CYLINDER" />: otwór łożyskowy w `50,30`, opcja <Keyword command="CYLINDER" id="Diameter" /> `20` i wysokość `40`; otwór na śrubę w `12,30`, średnica `10` i wysokość `12`. Potem polecenie <Command id="COPY" /> kopiuje otwór od `12,30` do punktu `76,0` dalej.

### Odejmij je [#subtract]

Polecenie <Command id="SUBTRACT" />: wskaż korpus i naciśnij Enter, potem trzy walce i Enter. Otwory przechodzą na wylot.

### Obróć widok [#view]

Polecenie <Command id="-VIEW" /> i opcja <Keyword command="VIEW" id="SEiso" />, polecenie <Command id="VSCURRENT" /> i opcja <Keyword command="VSCURRENT" id="Conceptual" />, potem polecenie <Command id="ZOOM" /> z opcją <Keyword command="ZOOM" id="Extents" /> i `0.8x`, aby dopasować go do ekranu.

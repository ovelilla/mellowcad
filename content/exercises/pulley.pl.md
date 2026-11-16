---
title: "Ćwiczenie AutoCAD 3D: koło pasowe"
metaTitle: "Ćwiczenie AutoCAD 3D: obrót koła pasowego"
description: "Zamodeluj koło pasowe w AutoCADzie 3D: półprzekrój jako zamknięta polilinia, obrócony wokół osi Y w bryłę. Krok po kroku, ćwiczenie 3D za darmo online."
figure: "Półprzekrój koła pasowego obok jego osi, z odległościami od osi zwymiarowanymi."
model: "Koło pasowe jako bryła, widziane z południowego wschodu w stylu wizualnym Koncepcyjny."
sourceHash: "f9c2a81b39fe"
---

Zamodeluj to koło pasowe, obracając jego półprzekrój wokół osi, w milimetrach: otwór o średnicy 20, piasta długa na 30 i o średnicy 40, tarcza grubości 10 i wieniec szeroki na 24, od średnicy 90 do 110, wyśrodkowany na piaście. Przekrój rysuje się jako odległości od osi, która biegnie wzdłuż osi Y, więc każdą średnicę rysuje się jako jej połowę.

## Steps

### Narysuj półprzekrój [#profile]

Na warstwie Kontur jedna zamknięta polilinia poleceniem <Command id="PLINE" /> od `10,0`, każdy następny punkt jako krok od poprzedniego: `10,0`, `0,10`, `25,0`, `0,-7`, `10,0`, `0,24`, `-10,0`, `0,-7`, `-25,0`, `0,10` i `-10,0`, potem opcja <Keyword command="PLINE" id="Close" />.

### Obróć widok [#view]

Polecenie <Command id="-VIEW" /> i opcja <Keyword command="VIEW" id="SEiso" /> pokazują przekrój z południowego wschodu i z góry; polecenie <Command id="VSCURRENT" /> i opcja <Keyword command="VSCURRENT" id="Conceptual" /> cieniują ściany, co najlepiej pokazuje część toczoną.

### Obróć przekrój [#revolve]

Polecenie <Command id="REVOLVE" />: wskaż przekrój i naciśnij Enter, potem opcja <Keyword command="REVOLVE" id="Y" />: oś Y jest osią koła. Enter przyjmuje domyślny kąt, pełny obrót. Polecenie <Command id="ZOOM" /> z opcją <Keyword command="ZOOM" id="Extents" /> dopasowuje je do ekranu, a skala `0.8x` zostawia wokół niego miejsce.

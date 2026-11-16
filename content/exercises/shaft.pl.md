---
title: "Ćwiczenie AutoCAD: wałek stopniowany"
metaTitle: "Ćwiczenia AutoCAD 2D: wałek stopniowany"
description: "Narysuj wałek stopniowany w AutoCADzie: połowa konturu jako polilinia, sfazowana, odbita względem osi, i wymiary łańcuchowe. Krok po kroku, za darmo."
figure: "Wałek stopniowany w widoku z boku, długość 150, długości zwymiarowane łańcuchowo."
sourceHash: "8c649e73bc55"
---

Narysuj ten wałek stopniowany w widoku z boku, w milimetrach: długość 150, średnice 30, 40 i 30 na długościach 40, 60 i 50, oba końce sfazowane 2 na 2. Narysuj połowę nad osią jako jedną polilinię, sfazuj ją i odbij lustrzanie; potem krawędzie widoczne w poprzek wałka, oś i długości. Średnice są podane tutaj, w opisie.

## Steps

### Narysuj górną połowę [#half]

Na warstwie Kontur jedna polilinia poleceniem <Command id="PLINE" /> od `0,0`: w górę `0,15`, wzdłuż `40,0`, w górę `0,5`, wzdłuż `60,0`, w dół `0,-5`, wzdłuż `50,0` i w dół `0,-15`, z powrotem do osi. Enter kończy polecenie.

### Sfazuj końce [#chamfers]

Polecenie <Command id="CHAMFER" />, potem opcja <Keyword command="CHAMFER" id="Distance" />: `2`, a Enter przyjmuje `2` także jako drugą odległość. Opcja <Keyword command="CHAMFER" id="Multiple" /> fazuje jedno naroże po drugim bez ponownego uruchamiania: wskaż dwa segmenty w narożu każdego końca.

### Odbij lustrzanie [#mirror]

Polecenie <Command id="MIRROR" />: wskaż polilinię, naciśnij Enter, potem oś odbicia od `0,0` do `150,0`, czyli oś wałka, i Enter, aby zachować oryginał.

### Narysuj krawędzie [#edges]

Poleceniem <Command id="LINE" /> krawędzie widoczne w poprzek wałka, każda o `0,30` w górę od dołu: od `2,-15` i `148,-15` przy fazach oraz od `40,-15` i `100,-15` przy odsadzeniach.

### Narysuj oś [#axis]

Na warstwie Linie osiowe oś: linia od `-8,0` do punktu `166,0` dalej.

### Zwymiaruj rysunek [#dimensions]

Na warstwie Wymiary polecenie <Command id="DIMLINEAR" /> dla pierwszej długości, 40, z wymiarem umieszczonym poniżej. Polecenie <Command id="DIMCONTINUE" /> prowadzi łańcuch dalej od jego drugiej linii pomocniczej: `#100,-20`, potem `#150,-15`, wpisane od początku układu ze znakiem #, i dwa razy Enter, aby zakończyć. Ostatnie polecenie <Command id="DIMLINEAR" /> podaje całą długość, 150, jeszcze niżej.

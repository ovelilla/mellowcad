---
title: "Ćwiczenie AutoCAD: uszczelka"
metaTitle: "Ćwiczenie AutoCAD dla początkujących: uszczelka"
description: "Narysuj uszczelkę w AutoCADzie: zaokrąglona płytka, otwór środkowy, cztery otwory skopiowane z jednego, osie i wymiary. Krok po kroku, za darmo online."
figure: "Uszczelka 120 na 80 z wymiarami."
sourceHash: "dc5c0e2b45b8"
---

Narysuj tę uszczelkę w milimetrach: płytka 120 na 80 z narożami zaokrąglonymi promieniem 10, otwór środkowy o średnicy 40 i cztery otwory o średnicy 10, których środki leżą 12 od krawędzi, do tego osie otworu środkowego i wymiary. Wszystko wpisuje się z klawiatury: pierwszy punkt polecenia leży tam, gdzie go wpiszesz, a każdy następny jest mierzony od poprzedniego. Kontur, osie i wymiary trafiają na osobne warstwy.

## Steps

### Narysuj kontur [#outline]

Ustaw warstwę Kontur jako bieżącą na liście warstw. Polecenie <Command id="RECTANG" /> rysuje płytkę za jednym razem: wybierz opcję <Keyword command="RECTANG" id="Fillet" /> i wpisz promień, `10`, potem pierwszy narożnik, `0,0`, i drugi narożnik, `120,80`, mierzony od pierwszego.

### Narysuj otwór środkowy [#bore]

Polecenie <Command id="CIRCLE" /> w środku płytki, `60,40`: wybierz opcję <Keyword command="CIRCLE" id="Diameter" /> i wpisz `40`.

### Skopiuj otwory [#holes]

Narysuj jeden otwór, okrąg w `12,12` o średnicy (<Keyword command="CIRCLE" id="Diameter" />) `10`, a potem skopiuj go poleceniem <Command id="COPY" />: wskaż okrąg, naciśnij Enter, przyjmij jego środek, `12,12`, jako punkt bazowy i wpisz, gdzie od niego trafia każda kopia: `96,0`, potem `96,56`, potem `0,56`. Enter kończy kopiowanie.

### Narysuj osie [#centreLines]

Ustaw jako bieżącą warstwę Linie osiowe. Dwie linie narysowane poleceniem <Command id="LINE" /> przecinają się w środku otworu i wystają 6 poza jego krawędź: od `60,14` o `0,52` w górę; od `34,40` o `52,0` w poziomie. Enter kończy każdą z nich.

### Zwymiaruj rysunek [#dimensions]

Ustaw jako bieżącą warstwę Wymiary. Polecenie <Command id="DIMLINEAR" /> pyta o dwa punkty, a potem o położenie linii wymiarowej: długość od `0,10` do punktu `120,0` dalej, umieszczona poniżej; wysokość po prawej; rozstaw otworów, 96 i 56. Punkt wpisany w odpowiedzi na jego monity nie dotyka żadnego obiektu, więc każdy z tych wymiarów powstaje jako nieskojarzony, o czym informuje wiersz polecenia. W poleceniu <Command id="DIMDIAMETER" /> wskazujesz okrąg i umieszczasz wymiar jego średnicy: najpierw otworu środkowego, potem jednego z małych otworów.

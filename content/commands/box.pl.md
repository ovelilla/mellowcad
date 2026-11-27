---
title: "Prostopadłościan w AutoCADzie: polecenie KOSTKA (BOX)"
metaTitle: "Prostopadłościan w AutoCADzie 3D: KOSTKA"
description: "Jak narysować prostopadłościan 3D w AutoCADzie poleceniem KOSTKA (BOX): dwa narożniki i wysokość, Środek, Sześcian, Długość i 2Punkty. Wypróbuj za darmo."
figure: "Prostopadłościan 60 na 40 na 25, z dwóch narożników i wysokości, widziany od południowego wschodu w stylu wizualnym Ukryty."
sourceHash: "9a0b32afd4c2"
---

Polecenie KOSTKA (BOX) rysuje prostopadłościan jako bryłę 3D, o bokach wzdłuż osi układu LUW: podaj pierwszy narożnik, drugi narożnik, a potem wysokość. Wysokość rośnie wzdłuż osi Z układu LUW, ujemna idzie w dół, a punkt podaje ją odległością od narożnika; narożnik podany na innej wysokości Z niż pierwszy ustala wysokość bez pytania. Ostatnia wysokość oraz ostatnia długość i szerokość sześcianu lub opcji Długość są proponowane jako wartości domyślne, które przyjmuje Enter, wspólne z innymi bryłami podstawowymi i poleceniem <Command id="EXTRUDE" />. Prostopadłościan leży na bieżącej warstwie, a cofnięcie usuwa go w jednym kroku.

Prostopadłościan zachowuje swoje wymiary: <Command id="LIST" /> pokazuje jego położenie, długość, szerokość, wysokość i obrót, a paleta Właściwości pozwala wpisać pierwsze cztery. Jego uchwyty go przesuwają, rozciągają, a poza widokiem planu ustawiają jego wysokość. To bryła 3D dla poleceń <Command id="UNION" />, <Command id="SUBTRACT" /> i reszty 3D w MellowCAD, które obejmuje tylko bryły 3D i wciąż jest częściowe.

## Options

### Center

Przy pierwszym monicie: pyta o środek, potem o narożnik, <Keyword id="Cube" /> lub <Keyword id="Length" />. Prostopadłościan jest wyśrodkowany w punkcie, także w pionie.

### Cube

Przy drugim narożniku: pyta o długość, wpisaną lub wskazaną, i tworzy sześcian o wszystkich bokach tej długości. Wpisana długość biegnie w stronę kursora, ujemna – od niego.

### Length

Przy drugim narożniku: pyta o długość, potem o szerokość. Długość biegnie w stronę kursora, więc prostopadłościan może leżeć pod kątem; szerokość idzie na tę stronę, po której jest kursor.

### 2Point

Przy wysokości: pyta o dwa punkty, a wysokość to odległość między nimi.

## Missing

Przesuń, Obróć, Skala i Lustro z aktywnego uchwytu, które AutoCAD przełącza Enterem. Własne polecenia 3D – 3DPRZESUŃ, 3DOBRÓT, SKALA3D, LUSTRO3D, OBRÓT3D, WYRÓWNAJ, 3DWYRÓWNAJ – z ich uchwytami narzędzi. Kropkowane wymiary, które AutoCAD rysuje, gdy podajesz narożnik, długość i szerokość. Polecenia <Command id="FILLET" /> i <Command id="CHAMFER" /> na jego krawędziach, co robią <Command id="FILLETEDGE" /> i <Command id="CHAMFEREDGE" />. Zapisywanie i pokazywanie historii bryły oraz wiersz Materiał. Style wizualne, których <Command id="VSCURRENT" /> nie ma poza Modelem szkieletowym 2D, Ukrytym i Koncepcyjnym.

## Questions

### Jak narysować prostopadłościan 3D w AutoCADzie?

Uruchom polecenie KOSTKA, podaj jeden narożnik, potem przeciwległy narożnik, potem wysokość: `0,0`, `60,40` i `25` rysują prostopadłościan z sesji. <Keyword id="Length" /> i szerokość zamiast przeciwległego narożnika obracają prostopadłościan pod dowolnym kątem.

### Dlaczego prostopadłościan wygląda jak prostokąt?

Patrzysz na niego z góry, w rzucie. Obróć widok: narożnik kostki ViewCube, <Command id="-VIEW" /> i <Keyword command="VIEW" id="SEiso" /> albo <Command id="3DORBIT" />. <Command id="VSCURRENT" /> z opcją <Keyword command="VSCURRENT" id="Hidden" /> ukrywa krawędzie za nim.

### Jak narysować sześcian w AutoCADzie?

Podaj pierwszy narożnik, potem wybierz <Keyword id="Cube" /> i wpisz długość boku.

### Jak narysować prostopadłościan od środka?

Wybierz <Keyword id="Center" /> i podaj punkt środkowy, potem narożnik, <Keyword id="Cube" /> lub <Keyword id="Length" />: prostopadłościan jest wyśrodkowany w punkcie, także w pionie.

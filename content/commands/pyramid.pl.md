---
title: "Ostrosłup w AutoCADzie: polecenie OSTROSŁUP (PYRAMID)"
metaTitle: "Ostrosłup w AutoCADzie: OSTROSŁUP (PYRAMID)"
description: "Jak narysować ostrosłup 3D w AutoCADzie poleceniem OSTROSŁUP (PYRAMID, skrót OST): boki, podstawa, wysokość, krawędź i promień górny ściętego. Wypróbuj online."
figure: "Ostrosłup o sześciu bokach, z podstawą o promieniu 25 do połowy każdego boku i wysokości 40, widziany z południowego wschodu w stylu wizualnym Ukryty."
sourceHash: "acbc5ffa71cb"
---

Polecenie OSTROSŁUP (PYRAMID) rysuje bryłę 3D w kształcie ostrosłupa: pierwszy wiersz podaje, ile boków ma podstawa i jak jest odczytywany jej promień, potem polecenie pyta o środek podstawy, promień i wysokość. Podstawa to wielokąt foremny, taki, jaki rysuje <Command id="POLYGON" />, na początku o 4 bokach: wpisany promień obraca ją w stronę kursora, punkt – w stronę samego siebie. Wysokość rośnie wzdłuż osi Z układu LUW, ujemna idzie w dół, a punkt wyznacza ją swoją odległością od podstawy. Liczba boków i sposób odczytu promienia są zachowywane dla następnego polecenia OSTROSŁUP; promień i wysokość to wspólne wartości domyślne brył podstawowych. Ostrosłup leży na bieżącej warstwie, a cofnięcie usuwa go w jednym kroku.

<Command id="LIST" /> pokazuje jego położenie, oba promienie, podstawy i góry, wysokość, obrót i liczbę boków, a na palecie Właściwości można wpisać promienie, liczbę boków i wysokość. Jego uchwyty przesuwają go, ustalają wysokość i zmieniają rozmiar podstawy z wierzchołka lub ze środka boku. To bryła 3D dla <Command id="UNION" />, <Command id="SUBTRACT" /> i reszty funkcji 3D w MellowCAD, które obejmują tylko bryły i wciąż są częściowe; polecenie <Command id="EXPLODE" /> rozbija go na regiony, po jednym na ścianę.

## Options

### Edge

Przy środku podstawy: pyta o oba końce jednego boku podstawy, która jest rysowana po lewej stronie tego boku.

### Sides

Przy środku podstawy: pyta o liczbę boków, od 3 do 32, a potem znów o środek.

### Inscribed

Przy promieniu: odczytuje promień do wierzchołka podstawy, czyli wielokąt wpisany w ten okrąg, i pyta o niego ponownie.

### Circumscribed

Przy promieniu, gdy wybrano już <Keyword id="Inscribed" />: odczytuje promień do połowy boku, czyli wielokąt opisany na tym okręgu, jak na początku, i pyta o niego ponownie.

### 2Point

Przy wysokości: pyta o dwa punkty, a wysokość to odległość między nimi.

### Axis

Przy wysokości: pyta o wierzchołek. Ostrosłup biegnie od środka podstawy do tego punktu w dowolnym kierunku, z podstawą prostopadłą do osi.

### Top

Przy wysokości: pyta o promień górny, odczytywany tak jak promień podstawy, a potem znów o wysokość. Ostrosłup kończy się mniejszym wielokątem zamiast wierzchołkiem – ostrosłupem ściętym; góra tak duża jak podstawa daje graniastosłup.

## Missing

To, czego brakuje poleceniu <Command id="BOX" />: Przesuń, Obróć, Skala i Lustro z aktywnego uchwytu, jego własne polecenia 3D i style wizualne, których brakuje poleceniu <Command id="VSCURRENT" />. Jego typ, wpisany lub opisany, wpisywany na palecie Właściwości. Wymiary kropkowane, które AutoCAD rysuje, gdy podajesz promień i krawędź.

## Questions

### Jak się nazywa polecenie OSTROSŁUP po angielsku?

PYRAMID. W polskim AutoCADzie jego skrót to `OST`: wpisz go i naciśnij Enter lub spację, a potem podaj środek podstawy, promień i wysokość. Angielskie `PYR` w polskiej wersji nie działa; `_PYRAMID` działa w AutoCADzie w każdym języku.

### Jak narysować ostrosłup sześciokątny?

Przed środkiem podstawy wybierz <Keyword id="Sides" /> i wpisz `6`, a potem podaj środek, promień i wysokość: `0,0`, `25` i `40` rysują ostrosłup z przykładu. Następne polecenie OSTROSŁUP zachowa sześć boków.

### Jak narysować ostrosłup o zadanym boku podstawy?

Wybierz <Keyword id="Edge" /> i podaj oba końce jednego boku: bok od `0,0` do `50,0` daje kwadratową podstawę 50, przy domyślnych 4 bokach.

### Jak narysować ostrosłup ścięty?

Przy wysokości wybierz <Keyword id="Top" />, wpisz promień górny, a potem wysokość. Ostrosłup kończy się mniejszym wielokątem o tylu bokach, ile ma podstawa.

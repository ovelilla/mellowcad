---
title: "Polecenie KLIN (WEDGE) w AutoCADzie"
description: "Jak narysować klin 3D w AutoCADzie poleceniem KLIN (WEDGE, skrót KL), krok po kroku: dwa narożniki i wysokość, Środek, Sześcian, Długość i 2Punkty."
figure: "Klin 60 na 40 na 25 z dwóch narożników i wysokości, ze spadkiem od strony pierwszego narożnika, widziany z południowego wschodu w stylu wizualnym Ukryty."
sourceHash: "06fba2eeb7be"
---

Polecenie KLIN (WEDGE) rysuje bryłę 3D w kształcie klina: prostopadłościan, którego góra opada od jednego końca do drugiego. Pyta o to samo co <Command id="BOX" />: pierwszy narożnik, drugi narożnik, a potem wysokość. Wysoki koniec jest przy pierwszym narożniku, a spadek biegnie wzdłuż osi X układu LUW w stronę drugiego narożnika; drugi narożnik o mniejszym X odwraca klin. Wysokość jest odmierzana wzdłuż osi Z układu LUW, ujemna – w dół. Długość, szerokość i wysokość to wartości domyślne polecenia <Command id="BOX" />, które przyjmuje Enter. Klin powstaje na bieżącej warstwie, a cofnięcie usuwa go w jednym kroku.

<Command id="LIST" /> pokazuje jego położenie, długość, szerokość, wysokość i obrót, a w palecie Właściwości można je wpisać. Jego uchwyty są takie jak uchwyty polecenia <Command id="BOX" />. Jest bryłą 3D dla poleceń <Command id="UNION" />, <Command id="SUBTRACT" /> i reszty funkcji 3D w MellowCAD, które obejmują tylko bryły i wciąż są częściowe; <Command id="EXPLODE" /> zamienia go w osobny region dla każdej ściany.

## Options

### Center

Przy pierwszym monicie: pyta o środek, a potem o narożnik, <Keyword id="Cube" /> lub <Keyword id="Length" />. Klin jest wyśrodkowany w punkcie, także w pionie, a jego wysoki koniec leży naprzeciw podanego narożnika.

### Cube

Przy drugim narożniku: pyta o długość i tworzy klin o wszystkich bokach tej długości. Inaczej niż w poleceniu <Command id="BOX" />, klin biegnie wzdłuż osi X układu LUW, wstecz przy wartości ujemnej.

### Length

Przy drugim narożniku: pyta o długość, wzdłuż osi X układu LUW, a potem o szerokość, wzdłuż jego osi Y; wartość ujemna biegnie wstecz. Punkt podaje tylko swoją odległość, nigdy kierunek.

### 2Point

Przy wysokości: pyta o dwa punkty, a wysokość to odległość między nimi.

## Missing

To, czego brakuje w <Command id="BOX" />: przesuwanie, obracanie, skalowanie i odbicie lustrzane z aktywnego uchwytu, własne polecenia 3D, wymiary kropkowane podczas podawania narożnika oraz style wizualne, których brakuje w <Command id="VSCURRENT" />. W rzucie z góry lokalizacja Punkt końcowy pod wysokim końcem znajduje narożnik góry, podczas gdy AutoCAD znajduje narożnik podstawy.

## Questions

### Jak się nazywa polecenie KLIN po angielsku?

WEDGE. W polskim AutoCADzie wpisz `KLIN` lub skrót `KL` i naciśnij Enter lub spację; skrót `WE` z wersji angielskiej uruchamia w polskiej wersji polecenie WYMEDYCJA. `_WEDGE` działa w AutoCADzie w każdym języku. Potem podaj pierwszy narożnik, drugi narożnik i wysokość: `0,0`, `60,40` i `25` rysują klin z sesji.

### W którą stronę opada klin?

W dół od strony pierwszego narożnika, wzdłuż osi X układu LUW. Aby go odwrócić, podaj drugi narożnik o mniejszym X, co obraca go o 180°, albo obróć go później poleceniem <Command id="ROTATE" />.

### Jak narysować graniastosłup trójkątny w AutoCADzie?

Klin nim jest: trójkąt prostokątny na każdym końcu, przeciągnięty wzdłuż szerokości. Każdy inny trójkąt narysuj jako zamkniętą polilinię poleceniem <Command id="PLINE" /> i wyciągnij go poleceniem <Command id="EXTRUDE" />.

### Jak narysować klin od środka?

Wybierz <Keyword id="Center" /> i podaj punkt środkowy, potem narożnik, <Keyword id="Cube" /> lub <Keyword id="Length" />: klin jest wyśrodkowany w punkcie, także w pionie.

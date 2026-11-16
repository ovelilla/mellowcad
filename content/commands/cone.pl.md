---
title: "Polecenie STOŻEK (CONE) w AutoCADzie"
metaTitle: "Stożek i stożek ścięty w AutoCADzie: STOŻEK"
description: "Jak narysować stożek 3D lub stożek ścięty w AutoCADzie poleceniem STOŻEK (CONE): podstawa, promień, wysokość, górna podstawa, Eliptyczny i punkt końcowy osi."
figure: "Stożek o promieniu 20 i wysokości 40, od środka podstawy, widziany od południowego wschodu w stylu wizualnym Ukryty."
sourceHash: "1c40f02e6b3c"
---

Polecenie STOŻEK (CONE) rysuje bryłę 3D stożka: podaj środek jego podstawy, potem promień, potem wysokość, a stożek zwęża się do punktu. Pyta o to samo co <Command id="CYLINDER" />, z opcją <Keyword id="Top" /> przy wysokości dla stożka ściętego. Podstawa leży na płaszczyźnie XY układu LUW, na wysokości Z środka, a wysokość rośnie wzdłuż jego osi Z; ujemna kieruje stożek w dół, a punkt podaje ją odległością od podstawy. Promień i wysokość są proponowane jako wartości domyślne, które przyjmuje Enter, wspólne z innymi bryłami podstawowymi. Stożek leży na bieżącej warstwie, a cofnięcie usuwa go w jednym kroku.

<Command id="LIST" /> pokazuje jego położenie, normalną, promień podstawy, promień górnej podstawy i wysokość, a paleta Właściwości pozwala je wpisać. Jego uchwyty go przesuwają, ustawiają jego wysokość, promień podstawy w każdej ćwiartce podstawy oraz promień górnej podstawy. Wierzchołek jest lokalizowany jako punkt końcowy. To bryła 3D dla poleceń <Command id="UNION" />, <Command id="SUBTRACT" /> i reszty 3D w MellowCAD, które obejmuje tylko bryły 3D i wciąż jest częściowe.

## Options

### 3P

Przy środku podstawy: pyta o trzy punkty, a podstawa to okrąg przez nie, w ich płaszczyźnie.

### 2P

Przy środku podstawy: pyta o dwa końce średnicy podstawy.

### Ttr

Przy środku podstawy: wskaż dwie linie, okręgi lub łuki, z lokalizacją Styczna, i podaj promień: podstawa dotyka obu.

### Elliptical

Przy środku podstawy: podstawa jest elipsą, podaną oboma końcami pierwszej osi i końcem drugiej albo, z opcją <Keyword id="Center" />, od jej środka. Promień górnej podstawy pomniejsza tę samą elipsę.

### Diameter

Przy promieniu: pyta zamiast niego o średnicę, proponując dwukrotność ostatniego promienia.

### 2Point

Przy wysokości: pyta o dwa punkty, a wysokość to odległość między nimi.

### Axis

Przy wysokości: pyta o wierzchołek. Stożek biegnie od środka podstawy do tego punktu w dowolnym kierunku, z podstawą prostopadłą do osi.

### Top

Przy wysokości: pyta o promień górnej podstawy, a potem znowu o wysokość. Stożek kończy się okręgiem zamiast punktu, jako stożek ścięty; górna podstawa tak szeroka jak dolna daje boki walca, a szersza stożek rozszerzający się ku górze. Proponuje promień górnej podstawy ostatniego stożka, na początku 0.

## Missing

Polecenie <Command id="EXPLODE" /> na stożku, który AutoCAD zamienia w podstawę i powierzchnię: MellowCAD nie ma powierzchni, więc podaje, że nie mógł go rozbić. Zamiana okrągłego stożka na eliptyczny przez wpisanie w palecie Właściwości. Przy `ISOLINES` równym 0 kropka, którą AutoCAD rysuje w wierzchołku. Oraz to, czego brakuje poleceniu <Command id="CYLINDER" />: Przesuń, Obróć, Skala i Lustro z aktywnego uchwytu, kropkowane wymiary podczas podawania promienia i style wizualne, których nie ma <Command id="VSCURRENT" />.

## Questions

### Jak narysować stożek w AutoCADzie?

Uruchom STOŻEK, podaj środek podstawy, promień i wysokość: `0,0`, `20` i `40` rysują stożek z sesji. Obróć widok, aby go zobaczyć, narożnikiem kostki ViewCube albo poleceniem <Command id="-VIEW" /> i opcją <Keyword command="VIEW" id="SEiso" />.

### Jak narysować stożek ścięty w AutoCADzie?

Przy wysokości wybierz <Keyword id="Top" />, wpisz promień górnej podstawy, a potem wysokość. Stożek kończy się okręgiem o tym promieniu.

### Jak narysować odwrócony stożek?

Wpisz ujemną wysokość: stożek skierowany jest od podstawy w dół. Albo wybierz <Keyword id="Axis" /> i podaj wierzchołek w dowolnym miejscu.

### Czy podstawa stożka może być elipsą?

Tak: przy środku podstawy wybierz <Keyword id="Elliptical" /> i podaj jej osie. Promień górnej podstawy sprawia, że górna podstawa jest tą samą elipsą, mniejszą.

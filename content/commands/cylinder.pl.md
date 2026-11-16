---
title: "Polecenie WALEC (CYLINDER) w AutoCADzie"
metaTitle: "Walec w AutoCADzie 3D: polecenie WALEC, WAL"
description: "Jak narysować walec 3D w AutoCADzie poleceniem WALEC (CYLINDER, skrót WAL): podstawa, promień, wysokość, 3P, 2P, Ssr, Eliptyczny i punkt końcowy osi."
figure: "Walec o promieniu 20 i wysokości 40, od środka podstawy, widziany od południowego wschodu w stylu wizualnym Ukryty."
sourceHash: "ce397d8dcb5d"
---

Polecenie WALEC (CYLINDER) rysuje walec jako bryłę 3D: podaj środek jego podstawy, potem promień, potem wysokość. Podstawa leży na płaszczyźnie XY układu LUW, na wysokości Z środka, a wysokość rośnie wzdłuż jego osi Z; ujemna idzie w dół, a punkt podaje ją odległością od podstawy, jak w poleceniu <Command id="BOX" />. Promień i wysokość są proponowane jako wartości domyślne, które przyjmuje Enter, wspólne z innymi bryłami podstawowymi i poleceniem <Command id="EXTRUDE" />. Walec leży na bieżącej warstwie, a cofnięcie usuwa go w jednym kroku.

Walec zachowuje swoje wymiary: <Command id="LIST" /> pokazuje jego położenie, normalną, promień i wysokość, a paleta Właściwości pozwala wpisać promień i wysokość. Jego uchwyty go przesuwają, ustawiają jego wysokość, a w każdej ćwiartce podstawy jego promień. To bryła 3D dla poleceń <Command id="UNION" />, <Command id="SUBTRACT" /> i reszty 3D w MellowCAD, które obejmuje tylko bryły 3D i wciąż jest częściowe.

## Options

### 3P

Przy środku podstawy: pyta o trzy punkty, a podstawa to okrąg przez nie, w ich płaszczyźnie. Trzy punkty na płaszczyźnie XY układu LUW nadal dają walec rosnący wzdłuż Z.

### 2P

Przy środku podstawy: pyta o dwa końce średnicy podstawy; drugi jest odczytywany w płaszczyźnie pierwszego.

### Ttr

Przy środku podstawy: wskaż dwie linie, okręgi lub łuki, z lokalizacją Styczna, i podaj promień: podstawa dotyka obu, najbliżej wskazanych punktów, na ich wysokości.

### Elliptical

Przy środku podstawy: podstawa jest elipsą. Podaj oba końce jej pierwszej osi, a potem koniec drugiej; albo wybierz <Keyword id="Center" /> i podaj jej środek, połowę długości pierwszej osi, a potem koniec drugiej osi.

### Diameter

Przy promieniu: pyta zamiast niego o średnicę, proponując dwukrotność ostatniego promienia.

### 2Point

Przy wysokości: pyta o dwa punkty, a wysokość to odległość między nimi.

### Axis

Przy wysokości: pyta o drugi koniec osi. Walec biegnie od środka podstawy do tego punktu w dowolnym kierunku, z podstawą prostopadłą do osi.

## Missing

Polecenie <Command id="EXPLODE" /> na walcu, który AutoCAD zamienia w dwie podstawy i powierzchnię: MellowCAD nie ma powierzchni, więc podaje, że nie mógł go rozbić. Przesuń, Obróć, Skala i Lustro z aktywnego uchwytu oraz wysokość przeciągnięta poza podstawę. Kropkowane wymiary, które AutoCAD rysuje, gdy podajesz promień, punkty elipsy i oś. Zamiana okrągłego walca na eliptyczny przez wpisanie w palecie Właściwości. Sylwetki, które rysuje `DISPSILH` w AutoCADzie. W rzucie, gdzie górny okrąg zasłania okrąg podstawy, lokalizacja Najbliższy punkt znajduje okrąg podstawy, a AutoCAD górny. Style wizualne, których <Command id="VSCURRENT" /> nie ma poza Modelem szkieletowym 2D, Ukrytym i Koncepcyjnym.

## Questions

### Jak się nazywa polecenie WALEC po angielsku i jaki ma skrót?

Po angielsku CYLINDER, w polskim AutoCADzie WALEC: wpisz `WAL`, naciśnij Enter albo spację, a potem podaj środek podstawy, promień i wysokość: `0,0`, `20` i `40` rysują walec z sesji. Angielskie `CYL` w polskim AutoCADzie nie działa; `_CYLINDER` działa w AutoCADzie w każdym języku.

### Jak narysować walec poziomy w AutoCADzie?

Przy wysokości wybierz <Keyword id="Axis" /> i podaj drugi koniec osi: od podstawy w `0,0,0` punkt `60,0,0` kładzie walec wzdłuż X.

### Jak zrobić walec pusty w środku albo rurę?

Narysuj dwa walce z tego samego środka, wewnętrzny węższy, a potem uruchom <Command id="SUBTRACT" />: wskaż zewnętrzny, Enter, wewnętrzny, Enter.

### Dlaczego walec wygląda jak okrąg?

Patrzysz na niego z góry, w rzucie. Obróć widok: narożnik kostki ViewCube, <Command id="-VIEW" /> i <Keyword command="VIEW" id="SEiso" /> albo <Command id="3DORBIT" />.

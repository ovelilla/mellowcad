---
title: "Polecenie PRZEKRÓJ (SECTION) w AutoCADzie"
description: "Jak polecenie PRZEKRÓJ (SECTION, skrót PKR) w AutoCADzie tworzy region tam, gdzie płaszczyzna tnie bryły 3D: 3punkty, Obiekt, oś Z, Widok, XY, YZ, ZX."
figure: "Klocek z otworem na wylot przecięty płaszczyzną ZX przez środek otworu: PRZEKRÓJ tworzy profil, wysunięty do przodu, dwa prostokąty z przerwą na otwór."
sourceHash: "f1c01b76c810"
---

Polecenie PRZEKRÓJ (SECTION) tworzy przekrój brył 3D: region w miejscu, gdzie płaszczyzna przecina każdą z nich, a same bryły pozostają bez zmian. Pyta o bryły, aż do Enter: jak w AutoCADzie 2027 zbiór wybrany wcześniej zostaje odrzucony i pytanie pada ponownie, to, co nie jest bryłą, zostaje pominięte, a zbiór bez żadnej bryły daje <Message id="noSolidsSelected" />. Potem płaszczyzna: domyślnie podajesz na niej trzy punkty, a opcje wyznaczają ją inaczej, jak w <Command id="SLICE" />.

Każda bryła przecięta przez płaszczyznę otrzymuje swój region, leżący w tej płaszczyźnie: klocek z otworem na wylot daje obrys z przerwą na otwór, walec przecięty wzdłuż osi – prostokąt. Płaszczyzna leżąca na ścianie bryły daje tę ścianę. Bryła, której płaszczyzna nie przecina, daje <Message id="sectionMissedOne" />. Regiony otrzymują bieżącą warstwę i właściwości, nie właściwości bryły; <Command id="MOVE" /> wysuwa jeden, aby go obejrzeć, <Command id="AREA" /> i <Command id="MASSPROP" /> go mierzą, a <Command id="EXTRUDE" /> zamienia go w bryłę. Całe polecenie to jeden krok cofania. 3D w MellowCAD to tylko bryły i wciąż jest częściowe.

## Options

### Object

Przyjmuje płaszczyznę wskazanego obiektu: okręgu, elipsy, łuku, splajnu 2D lub polilinii 2D.

### Zaxis

Pyta o punkt na płaszczyźnie, a potem o punkt na jej osi Z, prostej do niej prostopadłej.

### View

Płaszczyzna równoległa do ekranu, przez podany punkt.

### XY

Płaszczyzna XY układu LUW, przez podany punkt: punkt na pewnej wysokości daje tam przekrój poziomy. Enter przyjmuje początek układu LUW.

### YZ

Płaszczyzna YZ układu LUW, przez podany punkt; Enter przyjmuje początek układu LUW.

### ZX

Płaszczyzna ZX układu LUW, przez podany punkt; Enter przyjmuje początek układu LUW. Przekrój w sesji to ta płaszczyzna przez środek otworu.

### 3points

Trzy punkty na płaszczyźnie, która może być wtedy dowolnie nachylona. To domyślna odpowiedź pierwszego pytania, więc punkt podany tam jest pierwszym z trzech.

## Missing

Powierzchnie i siatki, których MellowCAD nie ma. Płaska polilinia 3D jako obiekt wyznaczający płaszczyznę, którą AutoCAD przyjmuje. Przekroje, dla których MellowCAD nie ma jeszcze dokładnej postaci, jak w <Command id="SLICE" />: kończą się komunikatem, że jedna operacja logiczna się nie powiodła. SECTIONPLANE i przekrój dynamiczny, które wstążka AutoCADa oferuje w miejsce polecenia PRZEKRÓJ: tutaj PRZEKRÓJ się wpisuje.

## Questions

### Jak zrobić przekrój bryły 3D w AutoCADzie?

Uruchom PRZEKRÓJ, wybierz bryłę i naciśnij Enter, potem wyznacz płaszczyznę: <Keyword id="ZX" /> i punkt w środku tną ją od przodu do tyłu, <Keyword id="XY" /> i punkt na pewnej wysokości – poziomo. Region leży wewnątrz bryły: wysuń go poleceniem <Command id="MOVE" />, aby go zobaczyć.

### Czym się różni PRZEKRÓJ od PŁAT?

<Command id="SLICE" /> przecina bryłę na dwie części i zachowuje jedną lub obie. PRZEKRÓJ pozostawia bryłę w całości i rysuje region tam, gdzie płaszczyzna ją przecina.

### Jak się nazywa polecenie PRZEKRÓJ po angielsku?

SECTION. W polskim AutoCADzie wpisz `PRZEKRÓJ` lub skrót `PKR` i naciśnij Enter lub spację; skrót `SEC` z wersji angielskiej w polskiej nie działa. `_SECTION` działa w AutoCADzie w każdym języku.

### Dlaczego PRZEKRÓJ informuje, że płaszczyzna nie przecina bryły?

Płaszczyzna jej nie trafia: sprawdź, jak została wyznaczona. <Keyword id="XY" />, <Keyword id="YZ" /> i <Keyword id="ZX" /> to płaszczyzny układu LUW, więc punkt na złej wysokości lub po złej stronie umieszcza płaszczyznę poza bryłą.

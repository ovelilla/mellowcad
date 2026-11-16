---
title: "Polecenie PŁAT (SLICE) w AutoCADzie"
description: "Jak działa polecenie PŁAT (SLICE, skrót PAT) w AutoCADzie: bryły, płaszczyzna przez dwa punkty, 3punkty, obiekt lub LUW, potem zachowywana strona."
figure: "Walec przecięty przez oś dwoma punktami, z zachowaną połową po wskazanej stronie: widok z południowego wschodu."
sourceHash: "07b1512fb042"
---

Polecenie PŁAT (SLICE) przecina bryły 3D płaszczyzną i zachowuje część po jednej jej stronie albo obie części jako dwie bryły. Pyta o bryły do przecięcia, aż do Enter: jak w AutoCADzie 2027 zbiór wybrany wcześniej zostaje odrzucony i pytanie pada ponownie, a to, co nie jest bryłą, zostaje pominięte. Potem płaszczyzna: domyślnie podajesz dwa punkty, a płaszczyzna stoi pionowo przez nie, prostopadle do płaszczyzny XY układu LUW; opcje wyznaczają ją inaczej. Na koniec punkt po stronie, którą chcesz zachować, albo Enter, aby zachować obie.

Każda bryła zbioru jest cięta tą samą płaszczyzną. Bryła, której płaszczyzna nie przecina albo której dotyka tylko ścianą, krawędzią lub narożnikiem, pozostaje bez zmian, a PŁAT o tym informuje. Przecięta bryła nie jest już prostopadłościanem ani walcem i nie ma historii. Całe polecenie to jeden krok cofania. 3D w MellowCAD wciąż jest częściowe: bryły istnieją, powierzchnie i siatki nie.

## Options

### Object

Przyjmuje płaszczyznę wskazanego obiektu: okręgu, elipsy, łuku, polilinii 2D lub płaskiego splajnu, także nachylonego okręgu. Linia, ani sama bryła, nie ma własnej płaszczyzny: wyświetla <Message id="unableToExtractPlane" /> i pyta ponownie. Enter kończy polecenie.

### Surface

Pyta o powierzchnię, wzdłuż której ma ciąć. MellowCAD nie ma jeszcze powierzchni, więc wskazanie daje <Message id="noSurfacesSelected" />, a Enter kończy polecenie.

### Zaxis

Pyta o punkt na płaszczyźnie, a potem o punkt na jej osi Z, prostej do niej prostopadłej. Nie mogą to być te same punkty.

### View

Płaszczyzna równoległa do ekranu, przez podany punkt; Enter przyjmuje 0,0,0.

### XY

Płaszczyzna XY układu LUW, przez podany punkt: punkt na pewnej wysokości daje tam cięcie poziome. Enter przyjmuje początek układu LUW.

### YZ

Płaszczyzna YZ układu LUW, przez podany punkt; Enter przyjmuje początek układu LUW.

### ZX

Płaszczyzna ZX układu LUW, przez podany punkt; Enter przyjmuje początek układu LUW.

### 3points

Trzy punkty na płaszczyźnie, która może być wtedy dowolnie nachylona. To domyślna odpowiedź pierwszego pytania, więc wybiera ją Enter. Drugi punkt musi się różnić od pierwszego, a trzeci nie może leżeć na prostej przez nie.

### Both

Przy pytaniu o stronę, i jest to wartość domyślna, więc wybiera ją Enter: obie części zostają zachowane. Bryła zachowuje jedną, a druga staje się nową bryłą o tej samej warstwie, kolorze, rodzaju linii i szerokości linii, a nie bieżących. Punkt zamiast tego zachowuje stronę, po której leży, i odrzuca drugą; punkt na płaszczyźnie jest odrzucany.

## Missing

Powierzchnie, jako płaszczyzna tnąca i jako obiekty do przecięcia, oraz siatki. Płaska polilinia 3D jako obiekt wyznaczający płaszczyznę, którą AutoCAD przyjmuje. Torus lub bryła obrotowa przecięte ani prostopadle do osi, ani wzdłuż niej, oraz inne cięcia, dla których MellowCAD nie ma jeszcze dokładnej postaci: kończą się komunikatem, że jedna operacja logiczna się nie powiodła.

## Questions

### Jak się nazywa polecenie PŁAT po angielsku?

SLICE. W polskim AutoCADzie wpisz `PŁAT` lub skrót `PAT` i naciśnij Enter lub spację; skrót `SL` z wersji angielskiej w polskiej nie działa, bo uruchamia SZERLIN. Angielska nazwa z podkreśleniem, `_SLICE`, działa w AutoCADzie w każdym języku.

### Jak przeciąć bryłę 3D w AutoCADzie?

Wybierz bryłę i naciśnij Enter. Wskaż dwa punkty, przez które biegnie cięcie: płaszczyzna stoi przez nie pionowo. Potem wskaż punkt po stronie, którą chcesz zachować, albo naciśnij Enter, aby zachować obie połowy, i odsuń jedną poleceniem <Command id="MOVE" />. Aby ciąć pod kątem, wybierz <Keyword id="3points" /> i podaj trzy punkty na płaszczyźnie.

### Czy PŁAT przecina linie lub obiekty 2D?

Nie: PŁAT przecina bryły 3D i pomija linie, regiony i bloki; zbiór złożony tylko z nich kończy polecenie. Do cięcia obiektów 2D służą <Command id="TRIM" /> i <Command id="BREAK" />. W AutoCADzie PŁAT przecina też powierzchnie i siatki, których MellowCAD jeszcze nie ma.

### Dlaczego PŁAT informuje, że płaszczyzna nie przecina bryły?

Bo płaszczyzna jej nie trafia albo dotyka jej tylko ścianą, krawędzią lub narożnikiem: taka bryła pozostaje cała. Sprawdź, jak została wyznaczona płaszczyzna. Przez dwa punkty stoi ona pionowo, więc dwa punkty na górnej ścianie bryły tną ją pionowo, a nie poziomo; do cięcia poziomego wybierz <Keyword id="XY" /> i podaj punkt na wysokości cięcia.

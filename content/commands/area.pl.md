---
title: "Polecenie POLE (AREA): jak obliczyć pole powierzchni w AutoCADzie"
metaTitle: "Pole powierzchni w AutoCADzie: POLE (AREA)"
description: "Jak obliczyć pole w AutoCADzie poleceniem POLE (AREA, skrót POL): pole i obwód z punktów lub obiektu oraz suma z opcjami Dodaj pole i Odejmij pole."
figure: "Płyta 100 na 60 z otworem o promieniu 18: POLE dodaje pole płyty, odejmuje pole otworu i wypisuje pozostałą sumę."
sourceHash: "a8ad70c08b3a"
---

Polecenie POLE (AREA) mierzy pole powierzchni i obwód zamkniętego kształtu: takiego, który obrysowujesz jego narożnikami, albo wskazanego obiektu. Podaj pierwszy narożnik, potem kolejne: od drugiego kształt zamknięty przez kursor wypełnia się półprzezroczystą zielenią, jak cieniuje go AutoCAD. Enter lub <Keyword id="Total" /> wypisuje `Pole powierzchni = …, obwód = …` w wierszu polecenia i kończy; Enter przed trzecim narożnikiem zostaje odrzucony. Z opcjami Dodaj pole i Odejmij pole prowadzi bieżącą sumę dla kilku kształtów. Liczby są wypisywane z dokładnością rysunku, a ostatnie zmierzone pole można odczytać ponownie, wpisując `'POLE`.

## Options

### Object

Opcja domyślna pierwszego monitu, więc Enter ją wybiera: wskaż okrąg, elipsę, zamkniętą polilinię lub splajn, kreskowanie albo region, a POLE wypisze jego pole powierzchni z obwodem, a dla okręgu – długość okręgu. Otwarta polilinia, splajn lub łuk eliptyczny zostaje zamknięty prostą od końca do końca, a POLE wypisuje jego długość. Linia lub tekst nie ma pola powierzchni: <Message id="objectHasNoArea" />, i polecenie pyta ponownie.

### Add

Rozpoczyna bieżącą sumę: każde pole zmierzone potem, narożnikami lub opcją <Keyword id="Object" />, zostaje dodane, a POLE wypisuje je wraz z sumą. Enter kończy obiekty lub narożniki i pyta ponownie, aż Enter przy pierwszym monicie zakończy polecenie.

### Subtract

To samo, ale każde pole jest odejmowane od sumy: najpierw płyta, potem jej otwory.

### Undo

Cofa ostatni podany narożnik.

### Total

Wypisuje pole powierzchni i obwód podanych narożników i kończy.

## Missing

ZMIERZGEOM, narzędzia Zmierz na wstążce, z opcjami Promień, Kąt, Objętość i Szybko: tu przyciski Odległość i Pole na wstążce uruchamiają ODLEG i POLE. Opcje Łuk i Długość przy następnym punkcie polecenia POLE. Narożniki poza płaszczyzną bieżącego układu LUW są mierzone w rzucie, tam gdzie AutoCAD mierzy je w 3D, a komunikat AutoCADa `Obiekt nie jest równoległy do LUW.` dla obiektu nachylonego do LUW się nie pojawia.

## Questions

### Jak się nazywa polecenie POLE po angielsku i jaki ma skrót?

Po angielsku AREA, w polskim AutoCADzie POLE: wpisz `POL`, potem naciśnij Enter albo spację. Angielskie `AA` w polskim AutoCADzie nie działa; `_AREA` działa w AutoCADzie w każdym języku.

### Jak obliczyć pole polilinii lub kreskowania w AutoCADzie?

Uruchom polecenie POLE, naciśnij Enter, aby wybrać <Keyword id="Object" />, i wskaż zamkniętą polilinię lub kreskowanie: jego pole powierzchni i obwód zostaną wypisane w wierszu polecenia. Pole kreskowania pomija jego wyspy.

### Jak odjąć pole powierzchni w AutoCADzie?

Wybierz <Keyword id="Add" />, a potem <Keyword id="Object" />, wskaż zewnętrzny kształt i naciśnij Enter; potem wybierz <Keyword id="Subtract" />, <Keyword id="Object" /> i wskaż każdy otwór. POLE wypisuje pozostałą sumę po każdym z nich; dwa razy Enter kończy.

### Jak podać pole powierzchni w metrach kwadratowych?

POLE wypisuje kwadratowe jednostki rysunku. Jeśli rysujesz w milimetrach, podziel przez 1 000 000: 6 000 000 to 6 m². W centymetrach – przez 10 000.

### Dlaczego polecenie POLE mówi, że obiekt nie ma pola powierzchni?

Mają je tylko zamknięte kształty i krzywe: linie, same łuki, teksty i wymiary go nie mają. Wskaż zamkniętą polilinię, okrąg lub kreskowanie albo najpierw połącz linie w polilinię poleceniem <Command id="JOIN" />; możesz też obrysować kształt jego narożnikami.

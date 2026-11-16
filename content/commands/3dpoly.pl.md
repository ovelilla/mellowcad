---
title: "Polilinia 3D w AutoCADzie: polecenie 3WPLINIA (3DPOLY)"
metaTitle: "Polilinia 3D w AutoCADzie: 3WPLINIA (3DPOLY)"
description: "Jak narysować polilinię 3D w AutoCADzie poleceniem 3WPLINIA (3DPOLY, skrót 3P): proste segmenty, każdy punkt z własnym Z, Zamknij, Cofaj i różnica z PLINIA."
figure: "Polilinia 3D wznosząca się o 15 w każdym narożniku prostokąta 60 na 40 leżącego na ziemi, widziana od południowego wschodu."
sourceHash: "b74d0c411c73"
---

Polecenie 3WPLINIA (3DPOLY) rysuje polilinię 3D: proste segmenty przez punkty, z których każdy ma własną współrzędną Z, jako jeden obiekt. Podaj punkt początkowy, a potem punkt końcowy każdego segmentu, aż Enter zakończy polecenie; nawet sam punkt początkowy zostaje zachowany, jako polilinia o jednym wierzchołku. Enter przy punkcie początkowym zostaje odrzucony komunikatem <Message id="invalidPoint" />: nie ma opcji Kontynuuj, którą ma polecenie LINIA. Punkt wpisany ze współrzędną Z zachowuje ją, `30,0,15`; wpisany bez niej lub kliknięty leży na poziomie płaszczyzny roboczej, a punkt zlokalizowany względem obiektu przyjmuje Z obiektu w tym miejscu. Punkty są odczytywane w bieżącym układzie LUW.

W przeciwieństwie do polecenia <Command id="PLINE" /> nie ma płaszczyzny, łuków, szerokości ani grubości i jest rysowana linią ciągłą niezależnie od rodzaju linii, który zachowuje. Cała polilinia to jeden krok, który cofa <Command id="U" />; Esc zachowuje to, co narysowano. Polecenie EDPLIN edytuje ją z krótszą listą opcji, a jego opcja splaJn dopasowuje do niej gładką krzywą.

## Options

### Close

Od drugiego segmentu: rysuje segment z powrotem do punktu początkowego i kończy.

### Undo

Cofa ostatni wierzchołek i kontynuuje od poprzedniego. Gdy nie zostaje żaden segment: <Message id="all3dSegmentsUndone" />.

## Missing

Polilinia 3D dopasowana krzywą ma w palecie Właściwości wartość Brak we właściwości dopasowania i wygładzenia, którą AutoCAD nazywa kwadratową lub sześcienną, i nie można jej tam zmienić. Nie może być obwiednią kreskowania ani ścieżką polecenia ŚCIEŻKASZYK, a paleta nie ma wiersza Materiał. Wprowadzanie dynamiczne pyta o punkt początkowy w jednym polu, z Z wpisywanym po drugim przecinku, tam gdzie AutoCAD pokazuje pola X, Y i Z. Menu uchwytów po najechaniu kursorem: Rozciągnij, Dodaj wierzchołek, Usuń wierzchołek i reszta.

## Questions

### Jak się nazywa polecenie 3WPLINIA po angielsku i jaki ma skrót?

Po angielsku 3DPOLY, w polskim AutoCADzie 3WPLINIA: wpisz `3P`, potem naciśnij Enter albo spację. Pełna nazwa też działa, a `_3DPOLY` w AutoCADzie w każdym języku.

### Czym się różni PLINIA od 3WPLINIA?

Polilinia polecenia <Command id="PLINE" /> leży w jednej płaszczyźnie i może mieć łuki i szerokości. Polilinia 3D ma tylko proste segmenty, ale każdy wierzchołek może leżeć na innej wysokości: rurociąg, oś drogi, kabel.

### Jak narysować polilinię 3D na różnych wysokościach?

Wpisz każdy punkt z jego Z, `x,y,z`, albo zlokalizuj go względem obiektów na żądanych wysokościach. Przy wprowadzaniu dynamicznym punkt po pierwszym jest względny: `60,0,15` idzie 60 wzdłuż X i 15 w górę od poprzedniego.

### Jak wygładzić polilinię 3D?

Użyj na niej polecenia <Command id="PEDIT" /> i wybierz opcję splaJn: gładką krzywą, którą wyznaczają wierzchołki. Opcja Polilinia znów ją prostuje.

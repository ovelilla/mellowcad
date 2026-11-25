---
title: "Paleta Właściwości w AutoCADzie: polecenie WŁAŚCIWOŚCI (PROPERTIES)"
metaTitle: "Paleta Właściwości w AutoCADzie (PROPERTIES)"
description: "Jak działa paleta Właściwości w AutoCADzie (WŁAŚCIWOŚCI, Ctrl+1): Ogólne i Geometria, *RÓŻNE*, jeden typ obiektów, bieżące ustawienia. Wypróbuj online."
figure: "Okrąg wybrany, gdy żadne polecenie nie działa, z widocznymi uchwytami, potem WŁAŚCIWOŚCI: paleta otwiera się obok rysunku na wierszach okręgu."
sourceHash: "396d741b1284"
---

Polecenie WŁAŚCIWOŚCI (PROPERTIES) otwiera paletę Właściwości. Jak w AutoCADzie jest to paleta, a nie okno dialogowe: zostaje otwarta, gdy wybierasz i rysujesz, swobodnie nad rysunkiem albo zadokowana z boku, dopóki nie zamknie jej polecenie <Command id="PROPERTIESCLOSE" />. Ctrl+1 ją pokazuje i ukrywa, a polecenie wpisane z apostrofem, `'WŁAŚCIWOŚCI`, otwiera ją w trakcie innego polecenia. Na początku jest zamknięta, jak w AutoCADzie, i otwiera się znowu przy następnej wizycie, jeśli zostawisz ją otwartą.

Gdy obiekty są wybrane, pokazuje ich właściwości, a każdą zmieniasz, wpisując lub wybierając nową wartość w jej wierszu. Najpierw jest grupa Ogólne, w kolejności AutoCADa: Kolor, Warstwa, Rodzaj linii, Szerokość linii i Grubość, z `*RÓŻNE*` tam, gdzie wybrane obiekty się różnią. Pod nią wiersze własne każdego typu: punkt początkowy i końcowy linii, jej długość i kąt; środek okręgu, promień, średnica, obwód i pole; wiersze łuku, elipsy, wierzchołki i szerokości polilinii, punkty splajnu, wiersze tekstu i odnośnika bloku. Współrzędne są w bieżącym LUW, a wiersze, które tylko informują, takie jak długość linii, są wyszarzone. Lista rozwijana na górze wymienia `Wszystkie` i każdy typ z liczbą obiektów: wybierz jeden, aby widzieć i edytować tylko ten typ. Gdy nic nie jest wybrane, grupa Ogólne pokazuje bieżącą warstwę, kolor, rodzaj linii i szerokość linii, które ustawia się tam dla nowych obiektów. Każda zmiana to jeden krok, który cofa <Command id="U" />.

## Missing

Skala rodzaju linii w grupie Ogólne dla kilku obiektów naraz albo, gdy nic nie jest wybrane, dla nowych obiektów (CELTSCALE); Styl wydruku, Przezroczystość i Hiperłącze oraz Materiał. Wierszy geometrii kilku obiektów jednego typu naraz, treści tekstu ani wartości atrybutów nie można tu edytować. Szybki wybór, przełącznik PICKADD i automatyczne ukrywanie.

## Questions

### Jak się nazywa polecenie WŁAŚCIWOŚCI po angielsku?

PROPERTIES. Najszybciej – Ctrl+1, który także z powrotem ukrywa paletę. Z klawiatury: `WŁAŚCIWOŚCI` albo skrót `CE`, potem Enter lub spacja. Angielskie `CH` i `MO` w polskiej wersji nie działają, a `PR` uruchamia polecenie PIERŚCIEŃ; `_PROPERTIES` działa w AutoCADzie w każdym języku.

### Paleta Właściwości zniknęła: jak ją przywrócić?

Naciśnij Ctrl+1 albo wpisz `CE`: paleta pojawi się znowu tam, gdzie ją zostawiono: swobodnie albo zadokowana z boku rysunku. Ctrl+1 naciśnięty, gdy paleta jest widoczna, ukrywa ją – często właśnie tak znika.

### Jak zmienić właściwości kilku obiektów naraz?

Wybierz je wszystkie, a potem zmień wiersz: każdy wybrany obiekt przyjmie nową wartość. Wiersz, którego wartości się różnią, pokazuje `*RÓŻNE*`, dopóki go nie ustawisz. Aby zmienić tylko, powiedzmy, okręgi spośród nich, wybierz ten typ z listy rozwijanej na górze.

### Czym się różni WŁAŚCIWOŚCI od UZGWŁAŚCIWOŚCI (MATCHPROP)?

Polecenie WŁAŚCIWOŚCI pokazuje i ustawia wartości wybranych obiektów. <Command id="MATCHPROP" /> kopiuje je z jednego obiektu na inne, bez wpisywania wartości.

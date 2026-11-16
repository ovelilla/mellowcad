---
title: "Styl wymiarowania w AutoCADzie: polecenie WYMSTYL (DIMSTYLE)"
metaTitle: "Styl wymiarowania w AutoCADzie: WYMSTYL"
description: "Jak ustawić styl wymiarowania w AutoCADzie: WYMSTYL (DIMSTYLE, skrót WST), style od ISO-25, wysokość tekstu, strzałki, skala i jednostki. Wypróbuj online."
figure: "Wymiary narysowane w ISO-25, bieżącym stylu: strzałki, tekst nad linią i przecinek jako separator dziesiętny."
sourceHash: "a363c0740c11"
---

Polecenie WYMSTYL (DIMSTYLE) zarządza stylami wymiarowania rysunku: nazwanymi zestawami ustawień – rozmiar strzałki, wysokość tekstu, globalna skala, jednostki i reszta – które każdy wymiar bierze ze swojego stylu. Nowy rysunek zaczyna z bieżącym stylem ISO-25, metrycznym stylem, od którego zaczyna też AutoCAD. Tam, gdzie AutoCAD otwiera okno dialogowe Menedżer stylów wymiarowania, polecenie WYMSTYL otwiera tutaj tabelę wymiarów w palecie „Style” – karcie panelu palet, który pozostaje otwarty podczas rysowania; polecenie <Command id="STYLE" /> otwiera tę samą paletę na stylach tekstu.

Paleta wyświetla listę stylów, z zaznaczonym bieżącym. „Nowy” tworzy kopię wybranego stylu, nazwaną od niego, i czyni ją bieżącą; nazwę stylu zmienia się na liście, a nazwa już używana jest odrzucana. Nie można usunąć ISO-25, stylu bieżącego ani stylu w użyciu. Pod listą ustawienia wybranego stylu są zgrupowane pod nazwami kart menedżera: „Linie” (odstępy między liniami bazowymi, przedłużenie poza linię wymiarową, odsunięcie od początku), „Symbole i strzałki” (rozmiar strzałki, rozmiar znacznika środka), „Tekst” (wysokość tekstu, odsunięcie od linii wymiarowej), „Dopasowanie” (globalny współczynnik skali i to, czy między liniami pomocniczymi rysowana jest linia wymiarowa) oraz „Jednostki podstawowe” (dokładność, separator dziesiętny, pomijanie zer końcowych, dokładność kątów). Zmiana od razu przerysowuje każdy wymiar w tym stylu. Każda zmiana, a także każdy nowy styl, zmiana nazwy, usunięcie i zmiana stylu bieżącego, to krok, który cofa polecenie <Command id="U" />.

## Missing

Samo okno dialogowe Menedżer stylów wymiarowania: paleta nie ma podglądu, filtra listy, przycisków „Nadpisz” i „Porównaj” ani opisu, nie ma podstylów dla jednego rodzaju wymiarów, kart „Jednostki alternatywne” i „Tolerancje”, a ustawienia są tylko te wymienione wyżej. Zmienna wymiarowa wpisana w wierszu polecenia, na przykład DIMSCALE, nie tworzy nadpisania bieżącego stylu. Nowy rysunek ma tylko ISO-25, bez stylów Standard i Annotative, które w AutoCADzie ma także nowy rysunek metryczny.

## Questions

### Jak się nazywa polecenie WYMSTYL po angielsku i jaki ma skrót?

DIMSTYLE. W polskim AutoCADzie jego skróty to `WST`, `WYMST` i `ODWYM`: wpisz jeden z nich i naciśnij Enter lub spację. Angielskie `D`, `DST`, `DIMSTY` i `DDIM` w polskiej wersji nie działają; `_DIMSTYLE` działa w AutoCADzie w każdym języku. Zamiast niego w wierszu polecenia działa polecenie <Command id="-DIMSTYLE" />: zapisuje bieżące ustawienia jako nowy styl albo czyni bieżącym styl o podanej nazwie.

### Jak zmienić wielkość tekstu wymiarów w AutoCADzie?

Wybierz styl w palecie i zmień „Wysokość tekstu” w grupie „Tekst” albo „Globalny współczynnik skali” w grupie „Dopasowanie”, który mnoży każdy rozmiar stylu, strzałki i odsunięcia razem z tekstem. Każdy wymiar w tym stylu jest od razu przerysowywany. Aby zmienić tylko niektóre wymiary, nadaj im osobny styl.

### Jak zastosować styl wymiarowania do istniejących wymiarów?

Wybierz wymiary i wskaż styl w wierszu „Styl wymiarowania” palety „Właściwości” albo kliknij je prawym przyciskiem myszy i wybierz go w menu „Styl wymiarowania”: w obu przypadkach to jeden krok cofania. Nowe wymiary biorą styl bieżący, który zmienia przycisk „Ustaw bieżący” w palecie.

### Jak zmienić separator dziesiętny w wymiarach?

ISO-25 pisze przecinek, na przykład `82,5`. W grupie „Jednostki podstawowe” ustaw „Separator dziesiętny” na kropkę lub spację; są tam też „Dokładność” i pomijanie zer końcowych. Wiersz polecenia nadal podaje zmierzoną wartość z kropką, tak jak w AutoCADzie.

### Jak utworzyć nowy styl wymiarowania?

Wybierz styl, od którego chcesz zacząć, i naciśnij „Nowy”: kopia jest nazwana od niego, staje się bieżąca i jest gotowa do zmiany nazwy i ustawień. Każdy wymiar narysowany od tej chwili ją przyjmuje.

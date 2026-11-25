---
title: "Styl wymiarowania w AutoCADzie: polecenie WYMSTYL (DIMSTYLE)"
metaTitle: "Styl wymiarowania w AutoCADzie: WYMSTYL"
description: "Jak ustawić styl wymiarowania w AutoCADzie: WYMSTYL (DIMSTYLE, skrót WST), style od ISO-25, wysokość tekstu, strzałki, skala i jednostki. Wypróbuj online."
figure: "Wymiary narysowane w ISO-25, bieżącym stylu: strzałki, tekst nad linią i przecinek jako separator dziesiętny."
sourceHash: "7bcae870d3ae"
---

Polecenie WYMSTYL (DIMSTYLE) zarządza stylami wymiarowania rysunku: nazwanymi zestawami ustawień – rozmiar strzałki, wysokość tekstu, globalna skala, jednostki i reszta – które każdy wymiar bierze ze swojego stylu. Nowy rysunek zaczyna z bieżącym stylem ISO-25, metrycznym stylem, od którego zaczyna też AutoCAD. Polecenie WYMSTYL otwiera Menedżer stylów wymiarowania, jak w AutoCADzie; wpisane z apostrofem wewnątrz innego polecenia, `'WYMSTYL`, otwiera go bez kończenia tamtego polecenia.

Menedżer podaje bieżący styl i wyświetla listę stylów, wszystkich albo tylko używanych. „Ustaw bieżący” czyni wybrany styl bieżącym. „Nowy...” pyta o nazwę, proponując `Kopia` z nazwą stylu, od którego zaczyna, a potem otwiera ustawienia nowego stylu; staje się on bieżący po zamknięciu menedżera. „Zmień...” otwiera ustawienia wybranego stylu na kartach menedżera: „Linie” (odstępy między liniami bazowymi, przedłużenie poza linię wymiarową, odsunięcie od początku), „Symbole i strzałki” (rozmiar strzałki, znaczniki środka), „Tekst” (wysokość tekstu, odsunięcie od linii wymiarowej), „Dopasowanie” (globalny współczynnik skali i to, czy między liniami pomocniczymi rysowana jest linia wymiarowa) oraz „Jednostki podstawowe” (dokładność, separator dziesiętny, pomijanie zer końcowych, dokładność kątów). „OK” je stosuje, a każdy wymiar w tym stylu jest od razu przerysowywany. Kliknięcie stylu prawym przyciskiem myszy zmienia jego nazwę lub go usuwa; nazwa już używana jest odrzucana, a ISO-25, stylu bieżącego ani stylu w użyciu nie można usunąć. Wszystko, co zrobisz w menedżerze, to jeden krok, który cofa polecenie <Command id="U" />.

## Missing

Podgląd menedżera, opis, przyciski „Nadpisz” i „Porównaj”; nie ma podstylów dla jednego rodzaju wymiarów, kart „Jednostki alternatywne” i „Tolerancje”, a ustawienia są tylko te wymienione wyżej. Zmienna wymiarowa wpisana w wierszu polecenia, na przykład DIMSCALE, nie tworzy nadpisania bieżącego stylu. Nowy rysunek ma tylko ISO-25, bez stylów Standard i Annotative, które w AutoCADzie ma także nowy rysunek metryczny.

## Questions

### Jak się nazywa polecenie WYMSTYL po angielsku i jaki ma skrót?

DIMSTYLE. W polskim AutoCADzie jego skróty to `WST`, `WYMST` i `ODWYM`: wpisz jeden z nich i naciśnij Enter lub spację. Angielskie `D`, `DST`, `DIMSTY` i `DDIM` w polskiej wersji nie działają; `_DIMSTYLE` działa w AutoCADzie w każdym języku. Zamiast niego w wierszu polecenia działa polecenie <Command id="-DIMSTYLE" />: zapisuje bieżące ustawienia jako nowy styl albo czyni bieżącym styl o podanej nazwie.

### Jak zmienić wielkość tekstu wymiarów w AutoCADzie?

Wybierz styl w menedżerze, naciśnij „Zmień...” i zmień „Wysokość tekstu” na karcie „Tekst” albo „Globalny wsp. skali” na karcie „Dopasowanie”, który mnoży każdy rozmiar stylu, strzałki i odsunięcia razem z tekstem. Każdy wymiar w tym stylu jest od razu przerysowywany. Aby zmienić tylko niektóre wymiary, nadaj im osobny styl.

### Jak zastosować styl wymiarowania do istniejących wymiarów?

Wybierz wymiary i wskaż styl w wierszu „Styl wymiarowania” palety „Właściwości” albo kliknij je prawym przyciskiem myszy i wybierz go w menu „Styl wymiarowania”: w obu przypadkach to jeden krok cofania. Nowe wymiary biorą styl bieżący, który zmienia przycisk „Ustaw bieżący” w menedżerze.

### Jak zmienić separator dziesiętny w wymiarach?

ISO-25 pisze przecinek, na przykład `82,5`. Na karcie „Jednostki podstawowe” ustaw „Separator dziesiętny” na kropkę lub spację; są tam też „Dokładność” i pomijanie zer końcowych. Wiersz polecenia nadal podaje zmierzoną wartość z kropką, tak jak w AutoCADzie.

### Jak utworzyć nowy styl wymiarowania?

Naciśnij „Nowy...”, nadaj mu nazwę i wybierz styl, od którego zaczyna, a potem „Kontynuuj”: otwierają się jego ustawienia, a „OK” go tworzy. Staje się bieżący po zamknięciu menedżera, a każdy wymiar narysowany od tej chwili go przyjmuje.

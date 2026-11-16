---
title: "Warstwy w AutoCADzie: polecenie WARSTWA (LAYER)"
description: "Jak pracować z warstwami w AutoCADzie: polecenie WARSTWA (LAYER, skrót WA), Menedżer właściwości warstw, tworzenie, usuwanie, wyłączanie i blokowanie."
figure: "Trzy warstwy, każda ustawiona jako bieżąca przed rysowaniem na niej: ściany na biało, drzwi na żółto, oś na czerwono z rodzajem linii Center."
sourceHash: "85620b673df6"
---

Polecenie WARSTWA (LAYER) otwiera Menedżer właściwości warstw, w którym tworzy się warstwy rysunku, nadaje im nazwy i ustawia ich właściwości. Jak w AutoCADzie jest to paleta, a nie okno dialogowe: zostaje otwarta, gdy rysujesz, tutaj jako karta panelu palet, dopóki nie zamknie jej polecenie <Command id="LAYERCLOSE" />, a wpisane z apostrofem wewnątrz innego polecenia otwiera się, nie przerywając go. Każdy obiekt leży na jakiejś warstwie, a jego kolor, rodzaj linii i szerokość linii, gdy są ustawione na JakWarstwa, są przejmowane z warstwy. Nowe obiekty trafiają na warstwę bieżącą.

Każda warstwa to wiersz, z kolumnami w kolejności AutoCADa: Stan, ze znacznikiem przy warstwie bieżącej, potem Nazwa, Widoczność, Zamknięcie, Kolor, Rodzaj linii i Szerokość linii oraz liczba obiektów na warstwie; wiersze są posortowane według nazwy. Nowa warstwa dodaje warstwę z kolorem, rodzajem linii i szerokością linii warstwy wybranej, z nazwą gotową do wpisania, i nie zmienia warstwy bieżącej. Ustaw bieżącą lub dwukrotne kliknięcie wiersza czyni warstwę bieżącą. Kliknięcie nazwy wybranej warstwy albo F2 zmienia jej nazwę; nazwa już użyta lub ze znakami, których AutoCAD zabrania, zostaje odrzucona, podobnie jak zmiana nazwy warstwy 0. Usuń warstwę usuwa warstwę, ale nigdy warstwy 0, bieżącej ani takiej, na której są obiekty: okno dialogowe AutoCADa „Warstwa – nie usunięto” podaje, której. Każda zmiana w menedżerze to krok, który cofa <Command id="U" />, a kolejne zmiany cofają się razem. W wierszu polecenia -WARSTWA robi to samo bez palety, z monitami AutoCADa, także w skryptach.

## Missing

Polecenie LAYDEL i pozostałe narzędzia panelu Warstwy: ustawianie warstwy obiektu jako bieżącej, dopasowywanie warstwy, poprzednia warstwa i reszta, a także ikony włączania, zamrażania i blokowania na jego liście rozwijanej. Warstw nie można zamrażać, a menedżer nie ma kolumn Zamroź, Drukuj, Przezroczystość, Styl wydruku, Zablokuj w nowej rzutni ani Opis, nie pozwala zmieniać kolejności kolumn, nie ma filtrów ani drzewa warstw, ani okna ustawień. Samo uruchomienie polecenia WARSTWA nie jest osobnym krokiem cofania. Nowa warstwa od razu trafia na swoje miejsce w kolejności, podczas gdy AutoCAD pokazuje ją pod wybraną, dopóki nie zmienisz jej nazwy, a szerokość linii warstwy 0 to 0,25 mm, a nie Domyślna. Nie można wpisać LAYLOCKFADECTL: obiekty zablokowanej warstwy są zawsze przygaszone do połowy.

## Questions

### Jak się nazywa polecenie WARSTWA po angielsku?

LAYER. W polskim AutoCADzie jego skróty to `WA` i `ODWARSTWA`: wpisz jeden z nich i naciśnij Enter lub spację. Angielskie `LA` i `DDLMODES` w polskiej wersji nie działają; pełna nazwa `WARSTWA` działa, a `_LAYER` – w AutoCADzie w każdym języku. Polecenie otwiera Menedżer właściwości warstw, a <Command id="LAYERCLOSE" /> go zamyka.

### Jak zmienić warstwę obiektu w AutoCADzie?

Wybierz obiekt, a potem wybierz warstwę z listy rozwijanej Warstwy na górnym pasku: obiekt przechodzi na nią w jednym kroku cofania, a warstwa bieżąca zostaje bez zmian. To samo robi wiersz Warstwa na palecie Właściwości. Gdy nic nie jest wybrane, lista rozwijana ustawia wybraną warstwę jako bieżącą.

### Jak usunąć warstwę w AutoCADzie?

Wybierz ją w Menedżerze właściwości warstw i naciśnij Usuń warstwę. Warstwy 0, warstwy bieżącej ani warstwy, na której są obiekty, także w definicji bloku, usunąć nie można: najpierw wymaż lub przenieś jej obiekty i ustaw jako bieżącą inną warstwę.

### Czym się różni wyłączenie warstwy od jej zablokowania?

Wyłączona warstwa ukrywa swoje obiekty: nie można ich wskazać, lokalizacja względem obiektu ich nie widzi, a ze zbioru wskazań wypadają. Obiekty zablokowanej warstwy pozostają widoczne, przygaszone, można je wybierać i lokalizacja względem obiektu je widzi, ale żadne polecenie ich nie zmienia: gdy trafią do zbioru, polecenie podaje ich liczbę i je pomija. Wyłączenie warstwy bieżącej wymaga najpierw potwierdzenia, jak w AutoCADzie.

### Jak utworzyć nową warstwę w AutoCADzie?

Naciśnij Nowa warstwa w Menedżerze właściwości warstw i wpisz jej nazwę: warstwa przejmuje kolor, rodzaj linii i szerokość linii warstwy wybranej, które potem zmienisz w jej wierszu. Ustaw ją jako bieżącą, aby na niej rysować.

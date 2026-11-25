---
title: "Jednostki w AutoCADzie: polecenie JEDN (UNITS)"
description: "Jak ustawić jednostki w AutoCADzie poleceniem JEDN (UNITS, skrót JED): okno Jednostki rysunku, dokładność od 0 do 8 miejsc, skala wstawiania w mm, cm lub m."
figure: "JEDN otwarte nad płytą 100 na 60, potem ID w jej dalekim narożniku: współrzędne z dokładnością rysunku, dwa miejsca."
sourceHash: "4dd8ca2f4f5c"
---

Polecenie JEDN (UNITS) otwiera okno dialogowe Jednostki rysunku, które ustala, jak rysunek zapisuje długości i czemu odpowiada jedna jednostka rysunku. Jak w AutoCADzie okno jest modalne: polecenie trwa, dopóki okna nie zamknie przycisk OK lub Anuluj, zmiana zatwierdzona przyciskiem OK to jeden krok, który cofa <Command id="U" />, a Anuluj lub Esc niczego nie zmienia. Wpisane z apostrofem, `'JEDN`, otwiera się wewnątrz działającego polecenia, które trwa dalej po zamknięciu okna. Otwierają je też jednostki na pasku stanu i pozycja Narzędzia rysunkowe ▸ Jednostki w menu aplikacji.

Typ długości to Dziesiętne, a Dokładność długości, od 0 do 8 miejsc po przecinku, określa zapis każdej długości: współrzędnych, odległości, pól, wartości domyślnych proponowanych w monitach. Nowy rysunek zaczyna tu od dwóch miejsc, podczas gdy metryczny szablon AutoCADa zaczyna od czterech. Skala wstawiania określa, czym jest jednostka rysunku: milimetrem, centymetrem lub metrem; pokazują to pasek stanu i wprowadzanie dynamiczne. Przykładowy wygląd pokazuje punkt z wybraną dokładnością.

## Missing

Pozostałe typy długości, Architektoniczne, Inżynierskie, Ułamkowe i Naukowe, oraz zapis naukowy bardzo dużej długości. Grupa Kąt: kąty są w stopniach dziesiętnych, przeciwnie do ruchu wskazówek zegara od wschodu, z dokładnością ustawianą przez wpisanie zmiennej AUPREC. Pozostałe jednostki wstawiania, w tym cale i stopy; Oświetlenie; Kierunek; oraz -JEDN, forma dla wiersza polecenia.

## Questions

### Jak się nazywa polecenie JEDN po angielsku?

UNITS. W polskim AutoCADzie wpisz `JEDN` lub skrót `JED` (także `ODJEDN`) i naciśnij Enter lub spację; skrót `UN` z wersji angielskiej w polskiej nie działa. Angielska nazwa z podkreśleniem, `_UNITS`, działa w AutoCADzie w każdym języku.

### Jak ustawić jednostki rysunku na milimetry lub metry?

Uruchom polecenie JEDN i wybierz Milimetry, Centymetry lub Metry w polu Skala wstawiania. Jednostka rysunku pozostaje jedną jednostką: ścianę długości 5 m narysuj jako 5 w metrach albo 5000 w milimetrach. Wybór określa, które z nich, a pokazują to pasek stanu i wprowadzanie dynamiczne.

### Jak zmienić liczbę miejsc po przecinku w AutoCADzie?

W oknie polecenia JEDN wybierz Dokładność, od `0` do `0.00000000`. Zmienia ona zapis długości, nigdy geometrię: linia narysowana o długości 10,125 pozostaje długa na 10,125 przy każdej dokładności.

### Dlaczego wymiary nie mają dokładności ustawionej w JEDN?

Wymiar zapisuje swoją wartość z dokładnością własnego stylu wymiarowania, a nie rysunku. Zmień ją w <Command id="DIMSTYLE" />, na karcie Jednostki podstawowe.

### Czy można rysować w stopach i calach?

Jeszcze nie: długości są dziesiętne, a skala wstawiania oferuje milimetry, centymetry i metry. Brakuje jednostek architektonicznych i inżynierskich.

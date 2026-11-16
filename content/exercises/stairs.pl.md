---
title: "Ćwiczenie AutoCAD: schody w rzucie"
metaTitle: "Ćwiczenie AutoCAD dla początkujących: schody"
description: "Narysuj w AutoCADzie rzut schodów jednobiegowych: dziesięć stopni z jednej linii i szyku prostokątnego, strzałka kierunku wejścia i wymiary. Krok po kroku."
figure: "Prosty bieg schodów w rzucie, 280 na 100 centymetrów, ze strzałką skierowaną w górę biegu."
sourceHash: "ff6e60262cd9"
---

Narysuj rzut prostego biegu schodów w centymetrach: długość 280, szerokość 100, dziesięć stopni o głębokości 28 i strzałka, która pokazuje kierunek wejścia. Skala wymiarów rysunku jest ustawiona dla rzutu w centymetrach, więc wymiary są czytelne przy tej wielkości. Rysuje się krawędź jednego stopnia, a resztę rozmieszcza szyk prostokątny.

## Steps

### Narysuj obrys [#outline]

Na warstwie Kontur polecenie <Command id="RECTANG" /> od `0,0` do `280,100`: obrys biegu.

### Narysuj pierwszy stopień [#tread]

Krawędź pierwszego stopnia: polecenie <Command id="LINE" /> od `28,0`, `0,100` w górę, i Enter.

### Utwórz szyk stopni [#array]

Polecenie <Command id="ARRAYRECT" /> kopiuje ją wzdłuż biegu: wskaż linię i naciśnij Enter, potem wybierz opcję <Keyword command="ARRAYRECT" id="COUnt" />, `9` kolumn i `1` wiersz, oraz <Keyword command="ARRAYRECT" id="Spacing" />, `28` między kolumnami i `1` między wierszami, co przy jednym wierszu niczego nie zmienia. Opcja <Keyword command="ARRAYRECT" id="eXit" /> zachowuje go jako szyk skojarzony, który można później edytować uchwytami.

### Narysuj strzałkę [#arrow]

Polecenie <Command id="PLINE" /> od `14,50` wzdłuż biegu do punktu `226,0` dalej; potem opcja <Keyword command="PLINE" id="Width" />, `10` na początku i `0` na końcu, i ostatni segment `24,0`: grot strzałki. Enter kończy polecenie.

### Zwymiaruj rysunek [#dimensions]

Na warstwie Wymiary trzy razy polecenie <Command id="DIMLINEAR" />: długość poniżej, szerokość po prawej i jeden stopień, 28, powyżej.

---
title: "Polecenie KOLOR (COLOR) w AutoCADzie"
metaTitle: "Kolor obiektów w AutoCADzie: KOLOR i JakWarstwa"
description: "Jak ustawić kolor nowych obiektów w AutoCADzie poleceniem KOLOR (COLOR, skrót KOL): JakWarstwa, kolor indeksowany po nazwie lub numerze albo kolor RGB."
figure: "Płyta narysowana JakWarstwa, jej otwór na czerwono, jej wytoczenie w kolorze Truecolor 0,128,255, a potem KOLOR z powrotem na JakWarstwa."
sourceHash: "8f98a2a79cf5"
---

Polecenie KOLOR (COLOR) ustala kolor, którym rysowane są nowe obiekty. AutoCAD otwiera okno dialogowe Wybierz kolor; MellowCAD go jeszcze nie ma, więc KOLOR uruchamia formę wiersza polecenia, którą AutoCAD też ma, <Command id="-COLOR" />. Pyta o domyślny kolor obiektów, proponując bieżący, w nowym rysunku `JAKWARSTWA`: JakWarstwa oznacza, że każdy obiekt przyjmuje kolor swojej warstwy, a kolor wybrany zamiast tego jest własnym kolorem obiektu. Wpisz numer koloru indeksowanego, od 1 do 255, lub nazwę jednego z pierwszych siedmiu albo wybierz <Keyword id="Truecolor" />. Enter zachowuje bieżący kolor, a zmiana to krok, który cofa <Command id="U" />.

Słowo, którego nie potrafi odczytać, daje komunikat <Message id="colorRequired" />, a 0, liczba ujemna lub większa niż 255 komunikat <Message id="invalidColorNumber" />; pytanie się powtarza. Wpisane z apostrofem wewnątrz polecenia, `'KOLOR`, sprawia, że każdy obiekt narysowany po nim przyjmuje nowy kolor: każdy segment polecenia <Command id="LINE" /> przyjmuje kolor bieżący w chwili, gdy się zaczyna. KOLOR ustala tylko to, co powstanie później; obiekty już narysowane zmienia paleta Właściwości lub lista kolorów na wstążce (Narzędzia główne › Właściwości).

## Options

### Truecolor

Pyta o kolor jako trzy wartości od 0 do 255, czerwoną, zieloną i niebieską, oddzielone przecinkami bez spacji: `0,128,255` to średni niebieski. Pozostaje kolorem Truecolor, nawet gdy kolor indeksowany ma te same wartości RGB: po `255,0,0` KOLOR proponuje `255,0,0`, a nie czerwony.

### BYLAYER

Nowe obiekty przyjmują kolor swojej warstwy, tak jak na początku.

### RED

Kolor indeksowany 1, wpisywany też jako `1`.

### YELLOW

Kolor indeksowany 2, wpisywany też jako `2`.

### GREEN

Kolor indeksowany 3, wpisywany też jako `3`.

### CYAN

Kolor indeksowany 4, wpisywany też jako `4`.

### BLUE

Kolor indeksowany 5, wpisywany też jako `5`.

### MAGENTA

Kolor indeksowany 6, wpisywany też jako `6`.

### WHITE

Kolor indeksowany 7, wpisywany też jako `7`: biały na ciemnym tle i czarny na jasnym.

## Missing

Okno dialogowe Wybierz kolor, palety kolorów i postać HSL. JakBlok. Przezroczystość (CETRANSPARENCY) oraz domyślne wartości dla typów HPCOLOR, HPLAYER, DIMLAYER i TEXTLAYER.

## Questions

### Jak się nazywa polecenie KOLOR po angielsku i jaki ma skrót?

Po angielsku COLOR, w polskim AutoCADzie KOLOR: wpisz `KOL`, potem naciśnij Enter albo spację; działa też `ODKOLOR`. Pełna nazwa także działa, a `_COLOR` w AutoCADzie w każdym języku.

### Jak zmienić kolor obiektu w AutoCADzie?

Zaznacz go i wybierz kolor z listy kolorów na wstążce (Narzędzia główne › Właściwości) albo w wierszu Kolor palety Właściwości: zmienia się w jednym kroku. Albo skopiuj kolor innego obiektu poleceniem <Command id="MATCHPROP" />. KOLOR ustala tylko kolor obiektów rysowanych po nim.

### Co oznacza JakWarstwa w AutoCADzie?

Że obiekt przyjmuje kolor swojej warstwy, więc zmiana koloru warstwy w Menedżerze właściwości warstw zmienia każdy obiekt JakWarstwa na niej. To wartość domyślna, która porządkuje kolory rysunku według warstw: <Command id="LAYER" />.

### Jak używać kolorów RGB w AutoCADzie?

Wybierz <Keyword id="Truecolor" /> i wpisz trzy wartości oddzielone przecinkami, na przykład `0,128,255`.

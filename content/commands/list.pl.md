---
title: "Polecenie LISTA (LIST) w AutoCADzie"
description: "Jak sprawdzić właściwości obiektu w AutoCADzie poleceniem LISTA (LIST, skrót LI): typ, warstwa, kolor, punkty, długość i pole każdego obiektu. Wypróbuj online."
figure: "LISTA dla otworu w płytce: warstwa okręgu, środek, promień, obwód i pole."
sourceHash: "d0ebcf466ff5"
---

Polecenie LISTA (LIST) wypisuje w wierszu polecenia raport o każdym wybranym obiekcie, w kolumnach i słowach AutoCADa 2027. Każdy zaczyna się od typu, warstwy i obszaru, potem kolor, rodzaj linii, szerokość linii i grubość, o ile nie są JakWarstwa lub zerowe, a potem to, co ma dany typ: końce linii, długość, kąt i przyrosty; środek okręgu, promień, obwód i pole; kąty i długość łuku; wierzchołki polilinii, szerokości, pole i długość; punkty kontrolne i punkty dopasowania splajnu; styl, wysokość i wyrównanie tekstu; typ, punkty i styl wymiaru; wzór, skala i pole kreskowania; nazwa, punkt wstawienia, skale i atrybuty odnośnika bloku; wiersze i elementy szyku; pole, obwód i prostokąt ograniczający regionu.

Punkty są podawane w bieżącym LUW, długości z dokładnością rysunku, a kąty z dokładnością AUPREC. Obiekty wybrane przed poleceniem LISTA zostają opisane od razu, bez monitu, a Enter bez wyboru kończy polecenie bez komunikatu. Wszystkie wiersze pojawiają się naraz: okno tekstowe AutoCADa zatrzymuje się przy każdym ekranie na `Naciśnij klawisz ENTER by kontynuować:`, a historia tutaj się przewija. Nie ma wiersza z uchwytem obiektu (handle): obiekty tutaj go nie mają.

## Missing

Pole otwartej polilinii wygładzonej łukami: tutaj jest to pole krzywej domkniętej cięciwą, a w AutoCADzie jest większe. Długość splajnu jest tutaj dokładna, a w AutoCADzie to bliskie przybliżenie. Wymiar <Command id="DIMANGULAR" /> utworzony z dwóch linii jest opisywany trzema punktami, a żaden wymiar nie jest nigdy opisany jako skojarzony. Pauza i okno tekstowe AutoCADa. To, czego obiekty tutaj nie mają: JakBlok, szerokość linii Domyślna, własna skala rodzaju linii, przezroczystość i grupy.

## Questions

### Jak się nazywa polecenie LISTA po angielsku?

LIST. W polskim AutoCADzie jego skróty to `LI`, `LS` – takie same jak w angielskim – i `POKMAT`: wpisz jeden z nich i naciśnij Enter lub spację. Pełna nazwa `LISTA` też działa, a `_LIST` – w AutoCADzie w każdym języku.

### Co pokazuje polecenie LISTA?

Wszystko, co polecenie LISTA w AutoCADzie mówi o obiekcie: typ, warstwę, obszar i właściwości inne niż JakWarstwa, a potem geometrię, każdy punkt i każdą długość jako liczby. Wybierz kilka obiektów, a każdy dostanie swój raport.

### Jak sprawdzić długość lub pole obiektu?

Użyj na nim polecenia LISTA: długość linii, obwód i pole okręgu, długość lub obwód i pole polilinii. Aby zsumować kilka pól, użyj polecenia <Command id="AREA" />.

### Jak zobaczyć współrzędne końców linii?

Użyj na linii polecenia LISTA: wiersze `od punktu` i `do punktu`, w bieżącym LUW. Dla pojedynczego punktu – <Command id="ID" /> z trybem lokalizacji względem obiektu.

### Czym się różni LISTA od WŁAŚCIWOŚCI (PROPERTIES)?

Polecenie LISTA wypisuje raport, który czytasz i kopiujesz z historii. <Command id="PROPERTIES" /> pokazuje te same wartości na palecie, w której można je zmieniać.

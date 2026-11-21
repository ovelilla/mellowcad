---
title: "Polecenie WWSTAW (MINSERT) w AutoCADzie"
metaTitle: "Polecenie WWSTAW (MINSERT) w AutoCADzie"
description: "Jak WWSTAW (MINSERT) w AutoCADzie wstawia blok w wierszach i kolumnach jako jeden obiekt, o co pyta i dlaczego ROZBIJ go odrzuca. Wypróbuj za darmo."
figure: "Siedzisko zamienione w blok, potem ułożone poleceniem WWSTAW w trzech wierszach po pięć: jeden obiekt."
sourceHash: "d43a50bbc8fe"
---

WWSTAW (po angielsku MINSERT) wstawia blok zdefiniowany w rysunku wiele razy, w wierszach i kolumnach, jako jeden obiekt. Pyta o to samo co <Command id="-INSERT" /> — nazwę bloku (Enter przyjmuje proponowaną, ostatnio wstawiony blok), punkt wstawienia, współczynniki skali X i Y oraz kąt obrotu — potem o liczbę wierszy i liczbę kolumn (Enter to 1), a potem o odległość między wierszami i odległość między kolumnami. Pyta tylko o odległości, których wymagają te liczby, a jeden wiersz z jedną kolumną to zwykłe odniesienie do bloku. Blok z atrybutami pyta o ich wartości na końcu, raz, i każda kopia je pokazuje.

Wiersze biegną wzdłuż osi Y bloku, a kolumny wzdłuż jego osi X, obie obrócone o kąt obrotu; odległości są w jednostkach rysunku, bez względu na skalę, a ujemna kładzie kopie w dół lub w lewo. Przy odległości między wierszami dwa punkty określają zamiast niej komórkę: jej szerokość to odległość między kolumnami, a wysokość odległość między wierszami. Wynikiem jest blok wielokrotnie wstawiony AutoCADa: przesuwa się, kopiuje, obraca, skaluje i odbija jako całość, <Command id="LIST" /> dodaje jego wiersze i kolumny, a paleta Właściwości pokazuje je jako Kolumny, Odstępy między kolumnami, Wiersze i Odstępy między wierszami, które można wpisać. <Command id="EXPLODE" /> liczy go jako wielokrotnie wstawiony i zostawia w całości, jak AutoCAD. Plik DXF otwiera go i zapisuje tak jak sam AutoCAD.

## Options

### ?

Przy nazwie bloku: wypisuje bloki rysunku, jak <Command id="BLOCK" />, i kończy.

### Scale

Przy punkcie wstawienia: pyta o jeden współczynnik dla obu osi, a potem znowu o punkt. Po punkcie nie pyta o współczynniki X i Y.

### Rotate

Przy punkcie wstawienia: pyta o kąt, który obraca każdą kopię i cały szyk, a potem znowu o punkt. Po punkcie nie pyta o obrót.

## Missing

Przy punkcie wstawienia punkt Bazowy, X, Y i Z, a przy skali X Narożnik i XYZ, jak brakuje ich w -WSTAW; `~` otwierająca plik rysunku; bloki opisowe, których tu nie ma. Wymiar liniowy wybiera cały obiekt WWSTAW, a nie obiekt w jednej z jego kopii. Wiersze Opisowy, Jednostka bloku i Współczynnik jednostki palety Właściwości.

## Questions

### Co to jest polecenie WWSTAW w AutoCADzie?

Wielokrotne wstawienie: układa blok w prostokątny szyk wierszy i kolumn jako jeden obiekt. Liczby i odstępy zmienisz potem w palecie Właściwości.

### Jak rozbić blok wstawiony poleceniem WWSTAW?

Nie da się: <Command id="EXPLODE" /> odpowiada, że był wielokrotnie wstawiony, i zostawia go, w AutoCADzie tak jak tutaj, nawet gdy wiersze i kolumny ustawisz na 1. Wstaw blok od nowa poleceniem <Command id="-INSERT" /> albo ułóż kopie poleceniem <Command id="ARRAYRECT" />, którego szyk rozbija się na elementy.

### Jak nazywa się MINSERT w polskim AutoCADzie?

WWSTAW. Nie ma skrótu ani przycisku na wstążce, więc wpisuje się je w całości; `_MINSERT` działa w każdej wersji językowej AutoCADa.

### Czym różni się WWSTAW od SZYK?

WWSTAW powtarza jeden blok jako jedno odniesienie, którego nie da się rozbić. <Command id="ARRAYRECT" /> powtarza dowolne obiekty jako szyk skojarzony, z uchwytami do zmiany liczb i odstępów, który <Command id="EXPLODE" /> rozbija.

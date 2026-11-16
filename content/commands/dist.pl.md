---
title: "Polecenie ODLEG (DIST) w AutoCADzie"
description: "Jak zmierzyć odległość w AutoCADzie poleceniem ODLEG (DIST, skrót ODL): między dwoma punktami, z kątami i przyrostami X, Y i Z, albo długość ciągu punktów."
figure: "ODLEG wzdłuż przekątnej płytki 100 na 60: odległość, kąt w płaszczyźnie XY i przyrosty."
sourceHash: "31fbe420bc43"
---

Polecenie ODLEG (DIST) mierzy odległość między dwoma punktami. Wskaż, przyciągnij lub wpisz pierwszy punkt i drugi, a polecenie wypisze w wierszu polecenia odległość, kąt w płaszczyźnie XY i kąt od tej płaszczyzny oraz przyrosty X, Y i Z, po czym się zakończy. Każdy punkt jest mierzony tam, gdzie leży, razem ze swoją współrzędną Z, więc odległość jest rzeczywista w przestrzeni. Enter przy pierwszym punkcie zaczyna od ostatnio podanego punktu, a przy drugim mierzy z powrotem do pierwszego. Liczby mają dokładność rysunku, a kąty – AUPREC.

## Options

### Multiple

<Keyword id="Multiple" /> przy drugim monicie: ciąg punktów zamiast jednego odcinka; dotychczasowa odległość jest wypisywana przed każdym następnym punktem i wyświetlana nad kursorem, aż do Enter lub opcji <Keyword id="Total" />.

### Arc

Mierzy wzdłuż łuków, z opcjami łuku polecenia PLINIA: <Keyword id="Angle" />, <Keyword id="Center" />, <Keyword id="Close" />, <Keyword id="Direction" />, <Keyword id="Line" />, <Keyword id="Radius" />, <Keyword id="Second pt" />, <Keyword id="Undo" />. Długość każdego łuku jest dodawana do ciągu.

### Close

Wraca do pierwszego punktu, dodaje ten ostatni odcinek, wypisuje sumę i kończy polecenie.

### Length

Dodaje odcinek o wpisanej długości w kierunku ostatniego.

### Undo

Cofa ostatni punkt ciągu.

### Total

Wypisuje sumę ciągu i kończy polecenie; Enter działa tak samo.

## Missing

Polecenie ZMIERZGEOM, czyli narzędzia pomiaru na wstążce, które zadaje pytania polecenia ODLEG w pętli z opcjami Promień, Kąt, Pole, Objętość i Szybki: tutaj przycisk Odległość na wstążce uruchamia polecenie ODLEG. Przy opcji <Keyword id="Center" /> opcji Łuk kąt rozwarcia jest czytany w stopniach, podczas gdy AutoCAD 2027 czyta tam liczbę jako odległość wzdłuż kursora.

## Questions

### Jak się nazywa polecenie ODLEG po angielsku i jaki ma skrót?

DIST. W polskim AutoCADzie jego skrót to `ODL`: wpisz go i naciśnij Enter lub spację. Angielskie `DI` w polskiej wersji nie działa; `_DIST` działa w AutoCADzie w każdym języku.

### Jak zmierzyć odległość w AutoCADzie?

Wpisz `ODL`, a potem wskaż dwa punkty, z lokalizacją względem obiektu, aby trafić w punkty końcowe lub środki obiektów. Odległość pojawia się w wierszu polecenia razem z kątem i przyrostami.

### Jak zmierzyć łączną długość kilku odcinków?

Przy drugim punkcie wybierz <Keyword id="Multiple" /> i wskazuj dalej: przy każdym punkcie widać dotychczasową odległość, a Enter wypisuje sumę.

### Jak zmierzyć odległość w 3D?

Podaj punkty z ich współrzędną Z albo przyciągnij do obiektów na ich wysokości: polecenie ODLEG mierzy rzeczywistą odległość w przestrzeni i wypisuje kąt od płaszczyzny XY oraz przyrost Z.

### Dlaczego polecenie ODLEG pokazuje mniej miejsc po przecinku, niż potrzebuję?

Wypisuje długości z dokładnością rysunku, tutaj dwa miejsca w nowym rysunku. Ustaw więcej, do ośmiu, w poleceniu <Command id="UNITS" />.

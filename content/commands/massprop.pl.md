---
title: "Polecenie PARAMFIZ (MASSPROP) w AutoCADzie"
description: "Jak obliczyć objętość bryły 3D i środek ciężkości regionu w AutoCADzie poleceniem PARAMFIZ (MASSPROP): pole, momenty bezwładności i plik .mpr. Wypróbuj online."
figure: "Prostopadłościan 60 na 40 na 25 w początku układu: PARAMFIZ wypisuje jego objętość, obwiednię, środek ciężkości i momenty, a Enter odrzuca zapis do pliku."
sourceHash: "a0286a5d599e"
---

Polecenie PARAMFIZ (MASSPROP) mierzy bryły 3D i regiony. Wybierz je i naciśnij Enter: raport zostaje wypisany w wierszu polecenia, w kolumnach AutoCADa, a potem polecenie pyta, czy zapisać go do pliku. Zbiór bez brył i regionów daje komunikat <Message id="massPropNoneSelected" /> i kończy polecenie.

Bryły są mierzone razem jako jedno ciało o gęstości 1, więc masa równa się objętości: masa, objętość, obwiednia, środek ciężkości, momenty bezwładności, iloczyny bezwładności i promienie bezwładności, wszystkie względem bieżącego LUW, a potem główne momenty względem środka ciężkości z ich kierunkami. Bryły, które na siebie zachodzą, są liczone dwa razy. Dla regionów w płaszczyźnie XY układu LUW: pole, obwód, obwiednia, środek ciężkości, momenty i iloczyn bezwładności, promienie bezwładności i główne momenty; region poza tą płaszczyzną daje tylko pole, obwód, obwiednię i środek ciężkości. Najpierw wypisywane są regiony, potem bryły; regiony spoza płaszczyzny pierwszego są pomijane, a raport podaje ich liczbę. Liczby są wypisywane z dokładnością rysunku, ustawianą poleceniem <Command id="UNITS" />, i są dokładne: bryły są całkowane ściana po ścianie. Polecenie PARAMFIZ niczego w rysunku nie zmienia; trzeba je wpisać, jak w AutoCADzie, którego wstążka nie ma dla niego przycisku.

## Options

### Yes

Przy pytaniu o plik, którego odpowiedź domyślna to <Keyword id="No" />: zapisuje raport do pliku tak, jak zapisuje go AutoCAD, wiersz po wierszu. W AutoCADzie miejsce wskazuje się w oknie dialogowym; w przeglądarce tym oknem jest pobieranie pliku, a plik nosi nazwę rysunku z rozszerzeniem `.mpr`.

## Missing

Jednostki po każdej liczbie przy jednostkach architektonicznych lub inżynierskich (`sq in`, `cu in`, `lb`), które wypisuje AutoCAD: tutaj żadna liczba nie ma jednostki. Wybór nazwy pliku i pytanie przed zastąpieniem istniejącego. Daleko od początku układu AutoCAD zapisuje duże liczby w postaci wykładniczej i traci cyfry, a jego ostatnia cyfra może się różnić przez jego własne zaokrąglenie: liczby MellowCAD są dokładne. Dla bryły z dwoma równymi momentami głównymi – para kierunków, którą wybiera zaokrąglenie AutoCADa.

## Questions

### Jak obliczyć objętość bryły 3D w AutoCADzie?

Uruchom polecenie PARAMFIZ, wskaż bryłę i naciśnij Enter: objętość to drugi wiersz raportu. Prostopadłościan 60 na 40 na 25 z przykładu daje 60000. Naciśnij Enter przy pytaniu o plik, aby zakończyć.

### Jak znaleźć środek ciężkości figury?

Zamień ją w region poleceniem <Command id="REGION" /> albo w bryłę, potem uruchom polecenie PARAMFIZ i wskaż ją: wiersz Środek ciężkości podaje jej X i Y, a dla bryły także Z, w bieżącym LUW.

### Dlaczego PARAMFIZ wyświetla komunikat, że nie wybrano brył ani regionów?

Bo wskazane obiekty nie są ani bryłami, ani regionami: linie, polilinie, okręgi i kreskowania nie mają parametrów fizycznych, a blok zawierający bryłę nie jest bryłą. Zamknięte kształty zamień w regiony poleceniem <Command id="REGION" /> albo w bryły poleceniem <Command id="EXTRUDE" />.

### Dlaczego masa jest równa objętości?

Polecenie PARAMFIZ mierzy z gęstością 1, tak jak AutoCAD: bryły nie mają tutaj materiału. Pomnóż objętość przez gęstość materiału, aby otrzymać rzeczywistą masę bryły.

---
title: "Linia konstrukcyjna w AutoCADzie: polecenie PROSTA (XLINE)"
metaTitle: "Linia konstrukcyjna w AutoCADzie: PROSTA (XLINE)"
description: "Jak narysować linię konstrukcyjną w AutoCADzie poleceniem PROSTA (XLINE, skrót PRT): przez dwa punkty, poziomo, pionowo, pod kątem, dwusieczna lub odsunięta."
figure: "Linie konstrukcyjne przez punkt, linia pozioma i dwusieczna kąta między dwiema liniami, każda przez cały widok."
sourceHash: "5b81d2c75993"
---

Polecenie PROSTA (XLINE) rysuje linie konstrukcyjne: linie o nieskończonej długości, które biegną przez cały widok, jakkolwiek daleko go przesuniesz lub powiększysz, aby rozplanować rysunek, zanim powstaną właściwe linie. Wskaż punkt, a potem punkt, przez który ma przejść linia: prosta przechodzi przez oba, a każdy kolejny punkt tworzy następną prostą przez pierwszy, dopóki Enter nie zakończy polecenia. Punkt pokrywający się z pierwszym jest odrzucany komunikatem <Message id="invalid" />. Każda prosta trafia na bieżącą warstwę, z bieżącym kolorem, rodzajem linii i szerokością linii.

Prosta nie ma końców: gdy powiększysz widok do zakresu rysunku, zostaje pominięta, jak w AutoCADzie. Lokalizacja Punkt symetrii znajduje punkt, przez który ją narysowano, Najbliższy punkt, Prostopadle i Punkt przecięcia działają wzdłuż niej, a polecenie <Command id="TRIM" /> lub <Command id="BREAK" /> zamienia ją w półprostą albo w dwie – tak linie konstrukcyjne stają się liniami rysunku. Polecenie <Command id="RAY" /> rysuje tę jej połowę, która zaczyna się w punkcie.

## Options

### Hor

Proste poziome, wzdłuż osi X układu LUW, każda przez wskazany przez ciebie punkt, aż do naciśnięcia Enter.

### Ver

Proste pionowe, wzdłuż osi Y układu LUW, każda przez wskazany przez ciebie punkt.

### Ang

Proste pod kątem: wpisz go albo wskaż dwa punkty, a potem punkty, przez które mają przejść. Enter przy monicie o kąt przyjmuje 0. Opcja <Keyword id="Reference" /> mierzy kąt przeciwnie do ruchu wskazówek zegara od wskazanego obiektu liniowego – linii, prostej lub półprostej: każdy inny obiekt jest odrzucany komunikatem <Message id="noUsableObjectSelected" />.

### Bisect

Prosta, która dzieli kąt na pół: wskaż jego wierzchołek, punkt na pierwszym ramieniu, a potem punkt na drugim, a dwusieczna przejdzie przez wierzchołek. Każdy kolejny punkt na drugim ramieniu tworzy następną dwusieczną z tym samym pierwszym ramieniem.

### Offset

Proste równoległe do obiektu liniowego – linii, prostej lub półprostej: podaj odległość, wskaż obiekt i stronę, raz za razem, aż do naciśnięcia Enter. Opcja <Keyword id="Through" /> prowadzi zamiast tego każdą prostą przez wskazany przez ciebie punkt. Odległość jest tą, którą pamięta polecenie <Command id="OFFSET" />, i tą, którą zaproponuje ono następnym razem.

## Missing

LENGTHEN i JOIN dla linii konstrukcyjnej nie są jeszcze sprawdzone z AutoCADem, podobnie jak menu jej uchwytów.

## Questions

### Jak się nazywa polecenie PROSTA po angielsku i jaki ma skrót?

XLINE. W polskim AutoCADzie jego skrót to `PRT`: wpisz go i naciśnij Enter lub spację; `_XLINE` działa w AutoCADzie w każdym języku. Na wstążce to Linia konstrukcyjna, w rozwiniętym panelu Rysuj; tutaj jest w narzędziach rysowania obok przycisku Półprosta.

### Jak narysować poziomą lub pionową linię konstrukcyjną?

Uruchom polecenie PROSTA, wpisz `P` dla opcji <Keyword id="Hor" /> albo `I` dla <Keyword id="Ver" /> i wskaż punkty, przez które mają przechodzić proste. Poziom i pion są te bieżącego układu LUW.

### Jak uciąć linię konstrukcyjną?

Poleceniem <Command id="TRIM" />, jak każdą linię: ucięta z jednej strony prosta staje się półprostą; ucięta z obu – linią. To samo dzieje się z poleceniem <Command id="BREAK" />.

### Dlaczego ZOOM Zakres pomija linie konstrukcyjne?

Prosta nie ma zakresu: biegnie do nieskończoności w obie strony. AutoCAD pomija proste i półproste w zakresie rysunku, i MellowCAD także.

### Czym się różni prosta od półprostej w AutoCADzie?

Prosta biegnie do nieskończoności w obie strony; półprosta, rysowana poleceniem <Command id="RAY" />, zaczyna się w punkcie i biegnie tylko w jedną stronę.

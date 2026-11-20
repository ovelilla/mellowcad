---
title: "Półprosta w AutoCADzie: polecenie PÓŁPROSTA (RAY)"
metaTitle: "Półprosta w AutoCADzie: PÓŁPROSTA (RAY)"
description: "Jak narysować półprostą w AutoCADzie poleceniem PÓŁPROSTA (RAY): linia konstrukcyjna od punktu do nieskończoności w jedną stronę i jak uciąć ją do linii."
figure: "Półproste z jednego punktu początkowego przez trzy punkty, każda biegnie dalej poza krawędź widoku."
sourceHash: "732d6e8c23de"
---

Polecenie PÓŁPROSTA (RAY) rysuje półproste: linie konstrukcyjne, które zaczynają się w punkcie i biegną do nieskończoności w jednym kierunku. Wskaż punkt początkowy, a potem punkt, przez który ma przejść: półprosta zaczyna się w pierwszym i przechodzi przez drugi. Każdy kolejny punkt tworzy następną półprostą z tego samego początku, dopóki Enter nie zakończy polecenia. Punkt pokrywający się z początkiem jest odrzucany komunikatem <Message id="invalid" />. Każda półprosta trafia na bieżącą warstwę, z bieżącym kolorem, rodzajem linii i szerokością linii.

Półprosta biegnie przez cały widok, jakkolwiek daleko go przesuniesz lub powiększysz, a zakres rysunku ją pomija, jak w AutoCADzie. Lokalizacja Punkt końcowy znajduje jej początek, Najbliższy punkt, Prostopadle i Punkt przecięcia działają wzdłuż niej. Polecenia <Command id="TRIM" /> i <Command id="BREAK" /> zamieniają odcinek, na którym leży początek, w linię, a polecenie <Command id="EXTEND" /> przesuwa początek wstecz do krawędzi za nim. Polecenie <Command id="XLINE" /> rysuje linie biegnące w obie strony.

## Missing

LENGTHEN i JOIN dla półprostej nie są jeszcze sprawdzone z AutoCADem, podobnie jak menu jej uchwytów.

## Questions

### Czym jest polecenie PÓŁPROSTA w AutoCADzie?

To linia konstrukcyjna z początkiem: zaczyna się w punkcie i biegnie bez końca w jednym kierunku. Używaj jej jako odniesienia do rysowania, a potem utnij ją do linii albo wymaż.

### Jak się nazywa polecenie PÓŁPROSTA po angielsku i czy ma skrót?

RAY. AutoCAD nie daje mu skrótu, więc wpisz `PÓŁPROSTA` w całości albo `_RAY`, które działa w AutoCADzie w każdym języku. Jest w rozwiniętym panelu Rysuj na wstążce, a tutaj w narzędziach rysowania obok przycisku Linia konstrukcyjna.

### Jak zatrzymać półprostą na linii?

Utnij ją: uruchom polecenie <Command id="TRIM" /> i wskaż część za linią. To, co zostaje od początku do linii, jest obiektem linii.

### Czym się różni półprosta od linii?

Linia ma dwa końce; półprosta ma jeden, swój początek, i biegnie dalej bez końca. W pliku DXF półprosta jest zapisywana jako RAY i jako półprosta się otwiera.

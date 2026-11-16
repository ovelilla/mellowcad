---
title: "Polecenie SPLAJN (SPLINE) w AutoCADzie"
description: "Jak działa polecenie SPLAJN (SPLINE, skrót SPL) w AutoCADzie: krzywa przez punkty dopasowania lub wierzchołki sterujące, węzły, stopień, styczne, Zamknij."
figure: "Splajn dopasowania przez pięć punktów, a pod nim splajn na pięciu wierzchołkach sterujących rozmieszczonych tak samo: pierwszy przez nie przechodzi, drugi jest ku nim przyciągany."
sourceHash: "1056b5067125"
---

Polecenie SPLAJN (SPLINE) rysuje gładką krzywą na jeden z dwóch sposobów: przez podane punkty (<Keyword id="Fit" />, domyślnie) albo przyciąganą ku umieszczonym wierzchołkom sterującym (<Keyword id="CV" />). Na początku podaje swoje ustawienia, `Metoda = Dopasuj; Węzły = Cięciwa`, a potem pyta o pierwszy punkt; Enter w tym miejscu jest odrzucany, jak w AutoCADzie. Każdy kolejny punkt wygina krzywą, której podgląd podąża za kursorem, a Enter ją kończy. Punkty można wskazywać, przyciągać lokalizacją lub wpisywać, wpisana długość biegnie w kierunku kursora, a punkt zachowuje swoją współrzędną Z, więc splajn może wznosić się w przestrzeni. Esc porzuca krzywą; cały splajn to jeden krok, który cofa <Command id="U" />. Przyciski Splajn dopasowania i Splajn wierzchołków sterujących na wstążce uruchamiają SPLAJN z już wybraną metodą.

## Options

### Method

<Keyword id="Fit" /> lub <Keyword id="CV" />. Splajn dopasowania przechodzi przez każdy podany punkt; splajn wierzchołków sterujących przechodzi tylko przez pierwszy i ostatni wierzchołek, a pozostałe przyciągają go ku sobie, więc wychodzi gładszy i dalej od nich. Metoda, podobnie jak węzły i stopień, zostaje zachowana do końca sesji.

### Knots

Jak splajn dopasowania rozkłada swoje punkty wzdłuż krzywej: <Keyword id="Chord" /> (domyślnie, według odległości między nimi), <Keyword id="Square root" /> z tej odległości albo <Keyword id="Uniform" />, wszystkie jednakowo. Przez te same punkty każda z nich daje nieco inną krzywą.

### Degree

Stopień splajnu wierzchołków sterujących, od 1 (odcinki proste między wierzchołkami) do 10; 3, wartość domyślna, to krzywa sześcienna. Gdy wierzchołków jest mniej, niż wymaga stopień, krzywa przyjmuje najwyższy możliwy.

### Object

Zamienia polilinię 2D lub 3D wygładzoną opcją <Keyword command="PEDIT" id="Spline" /> polecenia <Command id="PEDIT" /> w splajn wierzchołków sterujących o tej samej krzywej i usuwa polilinię, w jednym kroku. Wszystko inne jest odrzucane komunikatem <Message id="onlySplineFittedPolylines" />.

### start Tangency

Dostępna po pierwszym punkcie: kierunek, w którym krzywa z niego wychodzi, wskazany lub wpisany od tego punktu.

### end Tangency

Kierunek, w którym krzywa dochodzi do ostatniego punktu; potem splajn się kończy.

### Undo

Cofa ostatni punkt, aż do pierwszego.

### Close

Od trzeciego punktu: łączy koniec z początkiem w jedną gładką pętlę, bez narożnika, i kończy polecenie.

## Missing

Tolerancja dopasowania: splajn dopasowania zawsze przechodzi dokładnie przez swoje punkty, a opcja toLerancja nie jest dostępna. W trakcie rysowania splajn nie jest jeszcze obiektem, do którego działa lokalizacja lub śledzenie, jak w AutoCADzie. <Keyword id="Object" /> zawsze usuwa polilinię (DELOBJ). Gotowy splajn nie ma POKAŻPUNKTSTER (CVSHOW) ani UKRYJPUNKTSTER (CVHIDE) ani menu uchwytów do dodawania i usuwania punktów, paleta Właściwości edytuje jego punkty, ale nie metodę, stopień, węzły, wagi ani zamknięcie, a lokalizacje Środek geometryczny, Prostopadły i Styczny go nie znajdują. KRESKUJ nie znajduje splajnu jako obwiedni, a POŁĄCZENIE (BLEND) jeszcze nie istnieje.

## Questions

### Jak się nazywa polecenie SPLAJN po angielsku?

SPLINE. W polskim AutoCADzie wpisz `SPL` lub pełną nazwę `SPLAJN` i naciśnij Enter lub spację; skrót `SPL` jest taki sam jak w wersji angielskiej. `_SPLINE` działa w AutoCADzie w każdym języku.

### Czym się różni splajn dopasowania od splajnu wierzchołków sterujących?

Splajn dopasowania przechodzi przez klikane punkty, co pasuje do krzywej, która musi ich dotykać. Splajn wierzchołków sterujących jest kształtowany przez wierzchołki sterujące, do których tylko się zbliża, co pasuje do płynnego, gładkiego kształtu. Wybierz metodę opcją <Keyword id="Method" /> przy pierwszym pytaniu.

### Jak zamienić splajn na polilinię w AutoCADzie?

Uruchom <Command id="PEDIT" /> i wskaż splajn: polecenie wyświetla <Message id="objectNotPolyline" /> i proponuje zamianę, a potem pyta o dokładność od 0 do 99, domyślnie 10. Polilinia biegnie wzdłuż splajnu krótkimi odcinkami prostymi, w większej liczbie niż w AutoCADzie.

### Jak zamienić polilinię na splajn?

Wygładź polilinię opcją <Keyword command="PEDIT" id="Spline" /> polecenia <Command id="PEDIT" />, potem uruchom SPLAJN i wybierz <Keyword id="Object" />: polilinia staje się splajnem o tej samej krzywej.

### Czy można rozbić splajn w AutoCADzie?

Nie: <Command id="EXPLODE" /> odrzuca splajn, tak jak AutoCAD. Aby podzielić go na części, najpierw zamień go na polilinię poleceniem <Command id="PEDIT" />, a potem rozbij ją na linie.

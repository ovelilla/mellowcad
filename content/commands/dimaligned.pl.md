---
title: "Wymiar dopasowany w AutoCADzie: polecenie WYMNORMALNY (DIMALIGNED)"
metaTitle: "Wymiar dopasowany w AutoCADzie: WYMNORMALNY"
description: "Jak zwymiarować ukośną krawędź w AutoCADzie poleceniem WYMNORMALNY (DIMALIGNED, skrót WN): dwa punkty lub obiekt, potem linia do nich równoległa."
figure: "Ukośny bok trójkąta zwymiarowany wzdłuż jego długości: dwa jego końce, potem położenie linii."
sourceHash: "243f7657ed7d"
---

Polecenie WYMNORMALNY (DIMALIGNED) mierzy rzeczywistą odległość między dwoma punktami: linia wymiarowa biegnie równolegle do prostej przez te punkty, pod dowolnym kątem, podczas gdy polecenie <Command id="DIMLINEAR" /> mierzy tylko wzdłuż X lub Y. Monity są takie same jak w poleceniu <Command id="DIMLINEAR" />: początek pierwszej i drugiej linii pomocniczej albo Enter i wskazanie linii, łuku lub segmentu polilinii, którego końce stają się tymi początkami, a potem położenie linii wymiarowej, po dowolnej stronie. Wskazany okrąg daje swoją średnicę przechodzącą przez wskazany punkt. Wiersz polecenia podaje zmierzoną wartość i polecenie się kończy.

## Options

### Text

Pyta o tekst, który ma się pojawić zamiast zmierzonej wartości, i proponuje tę wartość jako domyślną: Enter ją zachowuje. We wpisanym tekście `<>` oznacza zmierzoną wartość.

### Angle

Pyta o kąt tekstu, który jest wtedy rysowany pod tym kątem zamiast wzdłuż linii wymiarowej. 0 przywraca go wzdłuż linii.

## Missing

Tekst wielowierszowy: tekst wymiaru to jeden wiersz, ustawiany opcją <Keyword id="Text" /> w wierszu polecenia, nigdy w edytorze tekstu. Gdy kąt ustawiono opcją <Keyword id="Angle" />, AutoCAD wyśrodkowuje tekst na linii wymiarowej; tutaj tekst zostaje nad nią, tak jak bez kąta. Wymiar nie jest skojarzony: nie podąża za obiektem, który mierzy.

## Questions

### Jak się nazywa polecenie wymiaru dopasowanego po angielsku i jaki ma skrót?

Po angielsku DIMALIGNED, w polskim AutoCADzie WYMNORMALNY: wpisz `WN` lub `WYMNO`, a potem naciśnij Enter lub spację. Pełna nazwa też działa, a `_DIMALIGNED` – w AutoCADzie w każdym języku.

### Czym się różni WYMLINIOWY od WYMNORMALNY?

Na ukośnej krawędzi polecenie <Command id="DIMLINEAR" /> daje jej szerokość albo wysokość, bo jego linia wymiarowa jest pozioma lub pionowa; polecenie WYMNORMALNY daje jej długość, z linią równoległą do krawędzi. Na krawędzi wzdłuż X lub Y oba dają tę samą liczbę.

### Jak zwymiarować ukośną linię w AutoCADzie?

Poleceniem WYMNORMALNY: naciśnij Enter przy pierwszym monicie, wskaż linię i umieść wymiar po wybranej stronie. Albo wskaż jej dwa końce z lokalizacją Punkt końcowy, aby początki linii pomocniczych były dokładne.

### Jak wpisać własny tekst na wymiarze?

Wybierz <Keyword id="Text" /> przed umieszczeniem wymiaru i wpisz tekst: `<>` oznacza zmierzoną wartość, więc `<> mm` wpisuje ją z jednostką, a Enter bez wpisanego tekstu zachowuje samą wartość. Po umieszczeniu wymiaru tekst zmienia wiersz „Nadpisanie tekstu” w palecie „Właściwości”.

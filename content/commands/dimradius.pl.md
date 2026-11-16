---
title: "Wymiar promienia w AutoCADzie: polecenie WYMPROMIEŃ (DIMRADIUS)"
metaTitle: "Wymiar promienia w AutoCADzie: WYMPROMIEŃ"
description: "Jak zwymiarować promień okręgu, łuku lub zaokrąglenia w AutoCADzie poleceniem WYMPROMIEŃ (DIMRADIUS, WR): wskaż krzywą, umieść tekst R wewnątrz lub na zewnątrz."
figure: "Zaokrąglony narożnik płytki zwymiarowany na zewnątrz, a jej otwór wewnątrz: wskazana każda krzywa, potem umieszczony tekst."
sourceHash: "6b1cdea584be"
---

Polecenie WYMPROMIEŃ (DIMRADIUS) wymiaruje promień okręgu, łuku lub łukowego segmentu polilinii. Wskaż krzywą, a wiersz polecenia od razu poda wartość; potem umieść wymiar i polecenie się kończy. Jak w AutoCADzie, tekstem jest promień poprzedzony literą R, na linii biegnącej wzdłuż promienia, zakończonej jednym grotem strzałki na krzywej, wewnątrz lub na zewnątrz krzywej, zależnie od tego, gdzie umieścisz wymiar. Na zewnątrz linia biegnie dalej przez krzywą aż do środka, tak jak rysuje to ISO-25.

## Options

### Text

Pyta o tekst, który ma się pojawić zamiast zmierzonej wartości, i proponuje tę wartość jako domyślną: Enter ją zachowuje. We wpisanym tekście `<>` oznacza wartość z literą R, więc `<> max` wpisuje `R10 max` dla promienia 10.

### Angle

Pyta o kąt tekstu, który jest wtedy rysowany pod tym kątem, środkiem na linii, a linia kończy się przy nim. 0 przywraca go wzdłuż linii.

## Missing

Tekst wielowierszowy: tekst wymiaru to jeden wiersz, ustawiany opcją <Keyword id="Text" /> w wierszu polecenia, nigdy w edytorze tekstu. Na łuku grot strzałki zostaje między jego końcami, a AutoCAD rysuje łukową linię pomocniczą do wymiaru umieszczonego poza nimi. Krzywej wewnątrz odnośnika bloku nie można wskazać. Linie środkowe stylu (ujemny rozmiar znacznika środka) nie są rysowane, a jego ustawienia tekstu poza krzywą nie są dostępne: tekst zawsze biegnie wzdłuż linii, bez półki, tak jak rysuje to ISO-25. Wymiar nie jest skojarzony: nie podąża za krzywą, którą mierzy.

## Questions

### Jak się nazywa polecenie wymiaru promienia po angielsku i jaki ma skrót?

Po angielsku DIMRADIUS, w polskim AutoCADzie WYMPROMIEŃ: wpisz `WR` lub `WYMR`, a potem naciśnij Enter lub spację. Pełna nazwa też działa, a `_DIMRADIUS` – w AutoCADzie w każdym języku.

### Jak zwymiarować zaokrąglenie lub zaokrąglony narożnik?

Wskaż zaokrąglenie: jest ono łukiem albo łukowym segmentem polilinii, jak narożniki, które polecenie <Command id="RECTANG" /> zaokrągla opcją <Keyword command="RECTANG" id="Fillet" />, a polecenie WYMPROMIEŃ przyjmuje oba.

### Dlaczego nie mogę wybrać obiektu do zwymiarowania?

Polecenie WYMPROMIEŃ przyjmuje okrąg, łuk lub łukowy segment polilinii, także na zablokowanej warstwie. Każdy inny obiekt, również elipsa, daje <Message id="notCircleOrArc" /> i pytanie pada ponownie; krzywej wewnątrz odnośnika bloku nie można jeszcze wskazać.

### Jak dodać opis do wymiaru promienia?

Wybierz <Keyword id="Text" /> przed umieszczeniem wymiaru i wpisz `<> max`: `<>` to wartość z literą R, więc wymiar brzmi `R10 max`. Po umieszczeniu wymiaru tekst zmienia wiersz „Nadpisanie tekstu” w palecie „Właściwości”.

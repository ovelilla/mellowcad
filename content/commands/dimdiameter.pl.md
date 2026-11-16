---
title: "Wymiar średnicy w AutoCADzie: polecenie WYMŚREDNICA (DIMDIAMETER)"
metaTitle: "Wymiar średnicy w AutoCADzie: WYMŚREDNICA"
description: "Jak zwymiarować średnicę okręgu lub łuku w AutoCADzie poleceniem WYMŚREDNICA (DIMDIAMETER, skrót WD): wskaż krzywą i umieść wymiar wewnątrz lub na zewnątrz."
figure: "Duży okrąg zwymiarowany wewnątrz, a mały na zewnątrz: wskazany każdy okrąg, potem umieszczony tekst."
sourceHash: "76537f5f9854"
---

Polecenie WYMŚREDNICA (DIMDIAMETER) wymiaruje średnicę okręgu, łuku lub łukowego segmentu polilinii, z monitami polecenia <Command id="DIMRADIUS" />: wskaż krzywą, a wiersz polecenia od razu poda wartość; potem umieść wymiar i polecenie się kończy. Jego tekst to średnica poprzedzona znakiem średnicy. Umieszczony wewnątrz okręgu, wymiar ma jedną linię od tekstu do grotu strzałki na obwodzie; umieszczony na zewnątrz, linia przecina okrąg od brzegu do brzegu, a dalszy grot wskazuje do środka od krótkiego przedłużenia, tak jak rysuje to ISO-25.

## Options

### Text

Pyta o tekst, który ma się pojawić zamiast zmierzonej wartości, i proponuje tę wartość jako domyślną: Enter ją zachowuje. We wpisanym tekście `<>` oznacza wartość ze znakiem, więc `4 otw. <>` wpisuje „4 otw.” przed średnicą.

### Angle

Pyta o kąt tekstu, który jest wtedy rysowany pod tym kątem, środkiem na linii, a linia kończy się przy nim. 0 przywraca go wzdłuż linii.

## Missing

Tekst wielowierszowy: tekst wymiaru to jeden wiersz, ustawiany opcją <Keyword id="Text" /> w wierszu polecenia, nigdy w edytorze tekstu. Znak jest rysowany jako Ø, podczas gdy AutoCAD pisze ∅: czcionka rysunku nie ma ∅. Na łuku groty strzałek zostają między jego końcami, a AutoCAD rysuje łukową linię pomocniczą. Tak jak w poleceniu <Command id="DIMRADIUS" />, krzywej wewnątrz odnośnika bloku nie można wskazać, linie środkowe stylu nie są rysowane, a jego ustawienia tekstu poza krzywą nie są dostępne. Wymiar nie jest skojarzony: nie podąża za krzywą, którą mierzy.

## Questions

### Jak się nazywa polecenie wymiaru średnicy po angielsku i jaki ma skrót?

Po angielsku DIMDIAMETER, w polskim AutoCADzie WYMŚREDNICA: wpisz `WD` lub `WYMD`, a potem naciśnij Enter lub spację. Pełna nazwa też działa, a `_DIMDIAMETER` – w AutoCADzie w każdym języku.

### Jak zwymiarować mały otwór?

Umieść tekst poza okręgiem: linia wymiarowa przecina wtedy otwór, z grotem strzałki po każdej stronie, a tekst stoi z dala od niego. Wewnątrz tekst potrzebuje miejsca w okręgu.

### Czy polecenie WYMŚREDNICA wymiaruje łuk?

Tak: łuk lub łukowy segment polilinii, tak jak okrąg, i podaje średnicę okręgu, do którego łuk należy. Każdy inny obiekt daje <Message id="notCircleOrArc" /> i pytanie pada ponownie.

### Jak dodać liczbę otworów lub opis do wymiaru średnicy?

Wybierz <Keyword id="Text" /> przed umieszczeniem wymiaru i wpisz `4 otw. <>`: `<>` to wartość ze znakiem. Po umieszczeniu wymiaru tekst zmienia wiersz „Nadpisanie tekstu” w palecie „Właściwości”.

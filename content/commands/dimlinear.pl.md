---
title: "Wymiarowanie w AutoCADzie: polecenie WYMLINIOWY (DIMLINEAR)"
metaTitle: "Wymiarowanie w AutoCADzie: polecenie WYMLINIOWY"
description: "Jak wymiarować w AutoCADzie poleceniem WYMLINIOWY (DIMLINEAR, skrót WL): dwa punkty lub obiekt, potem linia wymiarowa, pozioma lub pionowa. Wypróbuj online."
figure: "Prostokąt zwymiarowany dwa razy: górna krawędź przez jej dwa narożniki, prawa przez Enter i wskazanie krawędzi."
sourceHash: "711a0bfcb4de"
---

Polecenie WYMLINIOWY (DIMLINEAR) mierzy odległość między dwoma punktami wzdłuż X lub wzdłuż Y i rysuje ją jako wymiar: dwie linie pomocnicze, linię wymiarową z grotami strzałek i zmierzoną wartość nad nią. Podajesz początek pierwszej i drugiej linii pomocniczej, potem położenie linii wymiarowej, a to położenie wybiera kierunek, jak w AutoCADzie: nad dwoma punktami lub pod nimi wymiar jest poziomy, obok nich – pionowy. Możesz też nacisnąć Enter przy pierwszym monicie i wskazać linię, łuk, segment polilinii lub okrąg: jego dwa końce albo średnica okręgu są początkami linii pomocniczych. Wiersz polecenia podaje wtedy zmierzoną wartość i polecenie się kończy.

Wymiar jest rysowany w bieżącym stylu wymiarowania, w nowym rysunku ISO-25: przecinek dziesiętny i bez zer końcowych, tak jak zapisują to metryczne rysunki AutoCADa. Polecenia <Command id="DIMHORIZONTAL" />, <Command id="DIMVERTICAL" /> i <Command id="DIMROTATED" />, dostępne tylko z klawiatury, to polecenie WYMLINIOWY ograniczone do jednego kierunku.

## Options

### Text

Pyta o tekst, który ma się pojawić zamiast zmierzonej wartości, i proponuje tę wartość jako domyślną: Enter ją zachowuje. We wpisanym tekście `<>` oznacza zmierzoną wartość, więc `<> mm` wpisuje ją z jednostką.

### Angle

Pyta o kąt tekstu, który jest wtedy rysowany pod tym kątem zamiast wzdłuż linii wymiarowej. 0 przywraca go wzdłuż linii.

### Horizontal

Mierzy wzdłuż X, gdziekolwiek umieścisz linię wymiarową, która pozostaje pozioma; monit proponuje wtedy tylko <Keyword id="Text" /> i <Keyword id="Angle" />.

### Vertical

Mierzy wzdłuż Y, gdziekolwiek umieścisz linię wymiarową, która pozostaje pionowa.

### Rotated

Pyta o kąt linii wymiarowej, domyślnie `0`, i mierzy wzdłuż niego odległość między początkami. Na ukośnej krawędzi jej własny kąt daje jej długość, tak jak polecenie <Command id="DIMALIGNED" />.

## Missing

Tekst wielowierszowy: tekst wymiaru to jeden wiersz, ustawiany opcją <Keyword id="Text" /> w wierszu polecenia, nigdy w edytorze tekstu. Gdy kąt ustawiono opcją <Keyword id="Angle" />, AutoCAD wyśrodkowuje tekst na linii wymiarowej; tutaj tekst zostaje nad nią, tak jak bez kąta. Wymiar nie jest skojarzony: nie podąża za obiektem, który mierzy.

## Questions

### Jak się nazywa polecenie wymiaru liniowego po angielsku i jaki ma skrót?

Po angielsku DIMLINEAR, w polskim AutoCADzie WYMLINIOWY: wpisz `WL` lub `WYMLIN`, a potem naciśnij Enter lub spację. Pełna nazwa też działa, a `_DIMLINEAR` – w AutoCADzie w każdym języku.

### Jakie są polecenia wymiarowania w AutoCADzie?

<Command id="DIMLINEAR" /> do odległości poziomych i pionowych, <Command id="DIMALIGNED" /> do odległości wzdłuż ukośnej krawędzi, <Command id="DIMRADIUS" /> i <Command id="DIMDIAMETER" /> do łuków i okręgów, <Command id="DIMANGULAR" /> do kątów, <Command id="DIMCONTINUE" /> i <Command id="DIMBASELINE" /> do szeregów, <Command id="DIMSPACE" /> do wyrównania odstępów między nimi i <Command id="DIMSTYLE" /> do ich wyglądu. Polecenia WYMIAR z AutoCADa, które tworzy każdy rodzaj wymiaru z jednego monitu, i SWYMIAR, które wymiaruje wiele obiektów naraz, nie ma jeszcze w MellowCAD.

### Dlaczego wymiar nie podąża za obiektem, gdy go zmieniam?

Wymiary MellowCAD nie są jeszcze skojarzone, jak mówi <Message id="nonAssociativeDimension" />: wymiar zachowuje punkty, które dostał. Rozciągnij je razem: obejmij przesuwany koniec i leżący tam początek wymiaru jednym oknem przecinającym polecenia <Command id="STRETCH" />, a wartość zostanie przeliczona; albo przeciągnij uchwyt początku w nowe miejsce.

### Jak zmienić wielkość tekstu i strzałek wymiaru?

W stylu wymiarowania, jak w AutoCADzie: polecenie <Command id="DIMSTYLE" /> (`WST`) otwiera Menedżer stylów wymiarowania. Ustawia się tam wysokość tekstu, rozmiar strzałki, globalną skalę i miejsca dziesiętne bieżącego stylu, a stosują się do nich wszystkie wymiary w tym stylu.

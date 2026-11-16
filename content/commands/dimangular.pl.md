---
title: "Wymiar kątowy w AutoCADzie: polecenie WYMKĄTOWY (DIMANGULAR)"
metaTitle: "Wymiar kątowy w AutoCADzie: polecenie WYMKĄTOWY"
description: "Jak zwymiarować kąt w AutoCADzie poleceniem WYMKĄTOWY (DIMANGULAR, skrót WK): dwie linie, łuk, okrąg lub trzy punkty, potem położenie łuku wymiarowego."
figure: "Dwie linie schodzące się pod kątem 30 stopni: wskazana każda z nich, potem łuk wymiarowy umieszczony między nimi."
sourceHash: "30943abd60f6"
---

Polecenie WYMKĄTOWY (DIMANGULAR) wymiaruje kąt, a jego linią wymiarową jest łuk. To, co wskażesz najpierw, decyduje o reszcie, jak w AutoCADzie: po linii pyta o drugą linię (mogą to być też dwa segmenty jednej polilinii); łuk jest mierzony od końca do końca wokół swojego środka; okrąg – od punktu, w którym go wskazano, do drugiego podanego punktu; a Enter zamiast wskazania pyta o wierzchołek kąta, potem o jego dwa punkty końcowe. Następnie umieść łuk: jego położenie wybiera mierzony kąt. Między dwiema liniami jest to ten z czterech sektorów, w którym leży łuk; w pozostałych przypadkach sam kąt albo, gdy łuk leży poza jego ramionami, kąt większy niż 180°, dopełniający go do 360°. Wiersz polecenia podaje wartość w stopniach i polecenie się kończy.

## Options

### Text

Pyta o tekst, który ma się pojawić zamiast zmierzonej wartości, i proponuje tę wartość jako domyślną: Enter ją zachowuje. We wpisanym tekście `<>` oznacza zmierzoną wartość.

### Angle

Pyta o kąt tekstu, który jest wtedy rysowany pod tym kątem zamiast wzdłuż łuku wymiarowego. 0 przywraca go wzdłuż łuku.

## Missing

Tekst wielowierszowy: tekst wymiaru to jeden wiersz, ustawiany opcją <Keyword id="Text" /> w wierszu polecenia. Opcja Kwadrant, która przypisuje wymiar do jednego sektora, aby jego tekst mógł stanąć poza nim. Jednostki kątowe inne niż stopnie dziesiętne (DIMAUNIT). Wymiaru kątowego nie można kontynuować ani rozmieścić: polecenia <Command id="DIMCONTINUE" />, <Command id="DIMBASELINE" /> i <Command id="DIMSPACE" /> przyjmują tylko wymiary liniowe i wyrównane. Linii ani łuku wewnątrz odnośnika bloku nie można wskazać. Między dwiema liniami wymiar zachowuje punkty, w których przecinał je jego łuk, a nie same linie: przesunięty później, prowadzi linie pomocnicze od tych punktów, podczas gdy AutoCAD mierzy ponownie względem linii. Wymiar nie jest skojarzony: nie podąża za obiektami, które mierzy.

## Questions

### Jak się nazywa polecenie wymiaru kątowego po angielsku i jaki ma skrót?

Po angielsku DIMANGULAR, w polskim AutoCADzie WYMKĄTOWY: wpisz `WK` lub `WYMK`, a potem naciśnij Enter lub spację. Pełna nazwa też działa, a `_DIMANGULAR` – w AutoCADzie w każdym języku.

### Jak zwymiarować kąt większy niż 180 stopni?

Naciśnij Enter przy pierwszym monicie, podaj wierzchołek i dwa punkty końcowe, a potem umieść łuk poza kątem między nimi: mierzony jest kąt większy niż 180°, czyli 360° minus kąt wewnętrzny. Z łukiem lub okręgiem jest tak samo. Między dwiema liniami kąt jest zawsze mniejszy niż 180°.

### Jak zwymiarować kąt łuku w AutoCADzie?

Wskaż łuk przy pierwszym monicie: jego środek jest wierzchołkiem, a końce – początkami linii pomocniczych, więc następne pytanie dotyczy już położenia wymiaru.

### Dlaczego polecenie WYMKĄTOWY mówi, że linie są równoległe?

Dwie równoległe linie albo ta sama linia wskazana dwa razy nie tworzą kąta: <Message id="dimLinesParallel" />, i polecenie się kończy.

### Jak zmienić liczbę miejsc po przecinku w wymiarze kątowym?

W stylu wymiarowania: polecenie <Command id="DIMSTYLE" /> (`WST`) otwiera go w palecie „Style”, gdzie ustawia ją „Dokładność” wymiarów kątowych w grupie „Jednostki podstawowe” (0 w ISO-25). Stosują się do niej wszystkie wymiary kątowe w tym stylu.

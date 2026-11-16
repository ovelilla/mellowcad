---
title: "Polecenie FAZUJ (CHAMFER) w AutoCADzie"
metaTitle: "Fazowanie w AutoCADzie: FAZUJ (CHAMFER)"
description: "Jak zrobić fazę w AutoCADzie poleceniem FAZUJ (CHAMFER, skrót FA): dwie długości, dwie linie lub narożniki polilinii, Wiele, Shift. Wypróbuj za darmo."
figure: "Cztery linie, potem Fazy 10 dla obu i Wiele: dwa narożniki ścięte, dwa pozostawione ostre."
sourceHash: "e43c5b72ffc8"
---

Polecenie FAZUJ (CHAMFER) ścina narożnik między dwiema liniami prostą fazą. Wskaż pierwszą linię, potem drugą: każda zostaje ucięta lub wydłużona do fazy, pierwsza o pierwszą długość, a druga o drugą, a faza je łączy. Działa na dwóch liniach, na dwóch prostych segmentach polilinii albo na linii i polilinii, które łączy w jedną polilinię. Jak w AutoCADzie, pierwszy wiersz podaje bieżące długości faz, przechowywane w rysunku; obie równe 0, wartość domyślna, dają ostry narożnik, w którym linie się spotykają. Gdy wskazujesz drugą linię, narożnik, który by powstał, jest pokazany na liniach.

## Options

### Undo

Cofa ostatnią fazę tego wywołania, a wraz z nią zmianę długości.

### Polyline

Pyta o polilinię 2D i fazuje każdy jej narożnik, a potem podaje, ile linii sfazowano i dlaczego któreś nie zostały sfazowane.

### Distance

Pyta o pierwszą i drugą długość fazy. Druga proponuje pierwszą, więc Enter w tym miejscu daje równą fazę, pod kątem 45 stopni na narożniku prostym.

### Multiple

Po każdej fazie znów pyta o pierwszą linię, aż do naciśnięcia Enter lub Esc.

## Missing

Opcje kąT (faza ustalana jedną długością i kątem), Metoda i Utnij: FAZUJ zawsze działa dwiema długościami i zawsze ucina linie. W AutoCADzie faza przejmuje skalę rodzaju linii drugiej linii, tu nie.

## Questions

### Jak się nazywa polecenie FAZUJ po angielsku i jaki ma skrót?

Po angielsku CHAMFER, w polskim AutoCADzie FAZUJ: wpisz `FA`, potem naciśnij Enter albo spację. Angielskie `CHA` w polskim AutoCADzie nie działa; `_CHAMFER` działa w AutoCADzie w każdym języku.

### Jak zrobić fazę 45 stopni w AutoCADzie?

Wybierz <Keyword id="Distance" />, wpisz długość i naciśnij Enter przy drugiej: na narożniku prostym dwie równe długości dają fazę pod kątem 45 stopni.

### Czym się różni FAZUJ od ZAOKRĄGL?

FAZUJ łączy dwie linie prostą fazą, a <Command id="FILLET" /> łukiem stycznym do obu. Oba polecenia ucinają lub wydłużają linie do fazy lub łuku i oba tworzą ostry narożnik przy 0 albo z przytrzymanym Shift przy drugiej linii.

### Dlaczego fazowanie nie działa w AutoCADzie?

Polecenie podaje przyczynę: <Message id="chamferDistanceTooLarge" />, gdy długość wychodzi poza koniec linii, <Message id="linesParallel" /> dla linii równoległych i <Message id="chamferRequiresLines" /> dla łuku lub okręgu. Gdy obie długości są równe 0, tworzy narożnik, a nie fazę.

### Jak sfazować wszystkie narożniki prostokąta?

Prostokąt to polilinia: wybierz <Keyword id="Polyline" /> i wskaż go, a każdy narożnik zostanie sfazowany z bieżącymi długościami.

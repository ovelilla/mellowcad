---
title: "Edycja polilinii w AutoCADzie: polecenie EDPLIN (PEDIT)"
metaTitle: "Edycja polilinii w AutoCADzie: EDPLIN (PEDIT)"
description: "Jak edytować polilinię w AutoCADzie poleceniem EDPLIN (PEDIT, skrót EDP): linie w polilinię, łączenie, szerokość, wygładzanie, wierzchołki. Wypróbuj online."
figure: "Trzy linie stykające się końcami: EDPLIN zamienia pierwszą w polilinię, dołącza do niej dwie pozostałe i nadaje jej szerokość 2."
sourceHash: "bdc0bf10ac09"
---

Polecenie EDPLIN (PEDIT) edytuje polilinię. Wskaż ją przy monicie `Wybierz polilinię lub [Wiele]:` albo wybierz przed poleceniem; dwukrotne kliknięcie polilinii też uruchamia na niej polecenie EDPLIN. Jeśli zamiast tego wskażesz linię, łuk lub splajn, polecenie wyświetli <Message id="objectNotPolyline" /> i zapyta, czy zamienić obiekt w polilinię, domyślnie Tak: nowa polilinia zajmuje jego miejsce i przejmuje jego właściwości. Potem polecenie wciąż pyta o opcję, stosując każdą od razu, aż Enter je zakończy. Polilinia 3D dostaje krótszą listę, bez szerokości, wygładzania łukami i generowania rodzaju linii, a jej opcja splajnu to <Keyword id="Spline curve" />. Esc zachowuje to, co już zrobiono; cała edycja to jeden krok, który cofa <Command id="U" />.

## Options

### Multiple

Edytuje kilka polilinii naraz: wybierz je, powiedz, czy zamienić linie, łuki i splajny wśród nich, a potem każda opcja zostaje zastosowana do wszystkich. Jej opcja <Keyword id="Join" /> pyta o odległość tolerancji i o <Keyword id="Jointype" />: <Keyword id="Extend" /> ucina lub wydłuża segmenty końcowe, aż się spotkają, <Keyword id="Add" /> wypełnia przerwę nowym segmentem, <Keyword id="Both" /> wydłuża, gdzie może, a dodaje, gdzie nie może.

### Close

Zamyka polilinię segmentem od ostatniego wierzchołka do pierwszego, łukiem, jeśli ostatni segment jest łukiem. W zamkniętej polilinii ta opcja to <Keyword id="Open" />, która usuwa ten segment.

### Join

Dołącza linie, łuki i otwarte polilinie, które stykają się końcami z końcami polilinii, i podaje, ile segmentów dodała. Do zamkniętej polilinii nie można niczego dołączyć: <Message id="cannotJoinClosedPolyline" />.

### Width

Jedna szerokość dla wszystkich segmentów, wpisana lub zmierzona dwoma punktami; 0 usuwa szerokość.

### Edit vertex

Stawia X na pierwszym wierzchołku i pyta, co tam zrobić: <Keyword id="Next" /> i <Keyword id="Previous" /> przesuwają X, <Keyword id="Move" /> przesuwa wierzchołek, <Keyword id="Insert" /> dodaje nowy za nim, <Keyword id="Break" /> i <Keyword id="Straighten" /> zapamiętują wierzchołek, przesuwasz X do innego, a <Keyword id="Go" /> przerywa polilinię między nimi albo robi z tego, co leży pomiędzy, jeden prosty segment, <Keyword id="Width" /> ustala szerokość początkową i końcową następnego segmentu, <Keyword id="Tangent" /> nadaje wierzchołkowi kierunek dla późniejszego wygładzania łukami, a <Keyword id="eXit" /> wraca.

### Fit

Rysuje gładką krzywą z łuków przez każdy wierzchołek, stycznych tam, gdzie się spotykają, tak jak układa je wygładzanie łukami w AutoCADzie. Wierzchołki zostają, a ich edycja zmienia kształt krzywej.

### Spline

Dopasowuje do polilinii krzywą B-splajn, którą wierzchołki obramowują, zamiast przez nie przechodzić: kwadratową lub sześcienną, według SPLINETYPE, i tak dokładną, jak SPLINESEGS. Dla polilinii 3D jest to <Keyword id="Spline curve" />. Opcja <Keyword command="SPLINE" id="Object" /> polecenia <Command id="SPLINE" /> zamienia taką polilinię w prawdziwy splajn.

### Decurve

Usuwa krzywą z opcji <Keyword id="Fit" /> lub <Keyword id="Spline" />: między wierzchołkami znów są proste segmenty.

### Ltype gen

<Keyword id="ON" /> kładzie rodzaj linii jednym wzorem wzdłuż całej polilinii, więc kreskowa polilinia o krótkich segmentach nadal pokazuje kreski; <Keyword id="OFF" />, wartość domyślna, zaczyna wzór od nowa przy każdym wierzchołku.

### Reverse

Odwraca polilinię: jej wierzchołki w przeciwnej kolejności, razem z łukami i szerokościami.

### Undo

Cofa ostatnią opcję tego uruchomienia i pyta dalej.

## Missing

PEDITACCEPT: wskazanie linii, łuku lub splajnu zawsze pyta przed zamianą. PLINECONVERTMODE: splajn staje się polilinią z prostych segmentów, znacznie liczniejszych niż w AutoCADzie, nigdy z łuków. Polilinia wygładzona łukami jest pokazywana na palecie Właściwości jako zwykła polilinia, bez tytułu Polilinia 2D z AutoCADa i jej wiersza wygładzania. Opcja <Keyword id="Multiple" /> z samymi poliliniami 3D w zbiorze zadaje monit dla 3D, podczas gdy AutoCAD zadaje monit dla 2D. Nie ma siatek do edycji.

## Questions

### Jak się nazywa polecenie EDPLIN po angielsku?

PEDIT. W polskim AutoCADzie jego skrót to `EDP`: wpisz go i naciśnij Enter lub spację. Angielskie `PE` w polskiej wersji nie działa; pełna nazwa `EDPLIN` działa, a `_PEDIT` – w AutoCADzie w każdym języku. Dwukrotne kliknięcie polilinii też je uruchamia.

### Jak połączyć linie w polilinię?

Uruchom polecenie EDPLIN, wskaż jedną z linii i naciśnij Enter, aby zamienić ją w polilinię, potem wybierz <Keyword id="Join" /> i wybierz pozostałe: te, które stykają się końcami, stają się jedną polilinią. <Command id="JOIN" /> robi to samo w jednym kroku.

### Dlaczego EDPLIN nie działa na moim obiekcie?

Polecenie EDPLIN edytuje polilinie i proponuje zamianę linii, łuków i splajnów; wszystko inne – tekst, okrąg, blok – odrzuca i pyta ponownie. Obiekt na zablokowanej warstwie daje <Message id="objectOnLockedLayer" />. Opcja <Keyword id="Join" /> dołącza tylko obiekty, których końce dokładnie stykają się z końcami polilinii: przy przerwach użyj <Keyword id="Multiple" /> i odległości tolerancji.

### Jak zmienić szerokość polilinii?

Wybierz <Keyword id="Width" /> i wpisz szerokość: przyjmie ją każdy segment. Dla jednego segmentu użyj <Keyword id="Edit vertex" />, przejdź do wierzchołka, w którym się zaczyna, i wybierz jego <Keyword id="Width" />.

### Jak wygładzić polilinię?

<Keyword id="Fit" /> prowadzi łuki przez każdy wierzchołek; <Keyword id="Spline" /> robi gładszą krzywą, którą obramowują wierzchołki. <Keyword id="Decurve" /> znów ją prostuje.

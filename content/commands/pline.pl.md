---
title: "Polilinia w AutoCADzie: polecenie PLINIA (PLINE)"
description: "Jak narysować polilinię w AutoCADzie poleceniem PLINIA (PLINE, skrót PL): linie i łuki w jednym obiekcie, szerokość i półszerokość, długość i zamykanie."
figure: "Linia, styczny łuk i linia z powrotem, potem grot szeroki na 10 zwężający się do 0: jedna polilinia."
sourceHash: "216b83656483"
---

Polecenie PLINIA (PLINE) rysuje polilinię: jeden obiekt złożony z prostych segmentów i łuków połączonych końcami, każdy z własną szerokością. Po punkcie początkowym podaje bieżącą szerokość; potem każdy punkt dodaje segment, aż Enter lub <Keyword id="Close" /> zakończy polecenie. Jak w AutoCADzie, zaczyna od linii: <Keyword id="Arc" /> przełącza na łuki, każdy styczny do poprzedniego segmentu, a <Keyword id="Line" /> przełącza z powrotem. Enter przy punkcie początkowym kontynuuje od końca ostatnio narysowanej linii, łuku lub polilinii.

## Options

### Arc

Tryb łuku: każdy punkt końcowy rysuje łuk styczny do ostatniego segmentu albo, jako pierwszy segment, wychodzący w kierunku, w którym kończy się ostatnio narysowana linia, łuk lub polilinia. Przytrzymaj Ctrl, aby zmienić jego kierunek. Opcje poniżej kształtują następny łuk.

### Close

Dostępna, gdy jest już segment: zamyka polilinię z powrotem do jej początku i kończy polecenie; w trybie łuku – łukiem stycznym.

### Halfwidth

Jak <Keyword id="Width" />, ale każda szerokość jest mierzona od środka segmentu do jego krawędzi.

### Length

Linia o podanej długości w kierunku, w którym biegnie polilinia: wzdłuż ostatniego segmentu albo stycznie do ostatniego łuku. Ujemna długość prowadzi wstecz.

### Undo

Cofa ostatni segment i kontynuuje w trybie segmentu wcześniejszego. Gdy żadnego nie ma, wyświetla <Message id="allSegmentsUndone" />

### Width

Szerokość początkowa, potem końcowa, każda wpisana lub wskazana od ostatniego wierzchołka: szerokości 10 i 0 zwężają segment do punktu, jak grot strzałki. Szerokość końcowa przechodzi na następne segmenty i, jako PLINEWID, na następne polecenie PLINIA.

### Angle

Tryb łuku: kąt rozwarcia łuku, potem jego punkt końcowy, środek lub promień.

### Center

Tryb łuku: środek łuku, potem jego punkt końcowy, kąt rozwarcia lub długość cięciwy.

### Direction

Tryb łuku: kierunek, w którym łuk wychodzi z ostatniego wierzchołka, zamiast stycznej, potem jego punkt końcowy.

### Line

Tryb łuku: powrót do prostych segmentów.

### Radius

Tryb łuku: promień łuku, potem jego punkt końcowy lub kąt rozwarcia. Ujemny promień rysuje większy łuk.

### Second pt

Tryb łuku: punkt, przez który przechodzi łuk, potem jego punkt końcowy: łuk przez trzy punkty.

## Missing

PLINEGEN: nowa polilinia rozkłada wzór rodzaju linii segment po segmencie, jak przy PLINEGEN 0 (opcja <Keyword command="PEDIT" id="Ltype gen" /> polecenia <Command id="PEDIT" /> włącza go dla jednej polilinii). Kreskowy rodzaj linii na szerokim segmencie jest rysowany jako ciągły. Podgląd szerokiego segmentu nie jest rysowany w przygaszonym odcieniu, a monit łuku jest pisany w jednym wierszu, podczas gdy AutoCAD łamie go na dwa.

## Questions

### Jak się nazywa polecenie PLINIA po angielsku?

PLINE. W polskim AutoCADzie jego skrót to `PL`, taki sam jak w angielskim: wpisz go i naciśnij Enter lub spację. Pełna nazwa `PLINIA` też działa, a `_PLINE` – w AutoCADzie w każdym języku.

### Jak narysować polilinię z łukami?

Wybierz <Keyword id="Arc" />: każdy punkt kończy wtedy łuk styczny do poprzedniego segmentu, aż do <Keyword id="Line" />. Aby wygładzić już narysowaną polilinię przez jej wierzchołki, użyj polecenia <Command id="PEDIT" /> i jego opcji <Keyword command="PEDIT" id="Fit" /> lub <Keyword command="PEDIT" id="Spline" />.

### Dlaczego moja polilinia jest gruba?

Szerokość podana we wcześniejszym poleceniu PLINIA zostaje zachowana i następna polilinia zaczyna się z nią, o czym informuje wiersz wyświetlany po punkcie początkowym. Wybierz <Keyword id="Width" /> i podaj dwa razy 0, aby znów rysować cienko. Gdy tryb <Command id="FILL" /> jest wyłączony, szerokie polilinie są pokazywane jako obrysy.

### Jak połączyć linie w polilinię?

Uruchom polecenie <Command id="JOIN" /> i wybierz linie, łuki i polilinie, które stykają się końcami: każdy łańcuch staje się jedną polilinią. Albo uruchom polecenie <Command id="PEDIT" /> na linii, odpowiedz <Keyword command="PEDIT" id="Yes" />, aby zamienić ją w polilinię, i dołącz resztę opcją <Keyword command="PEDIT" id="Join" />.

### Jak obliczyć pole lub długość polilinii?

Uruchom polecenie <Command id="AREA" />, naciśnij Enter, aby wybrać <Keyword command="AREA" id="Object" />, i wskaż polilinię: dla zamkniętej podaje pole i obwód, dla otwartej – długość.

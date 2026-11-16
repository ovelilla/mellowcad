---
title: "Polecenie PODZIEL (DIVIDE) w AutoCADzie"
description: "Jak podzielić linię lub okrąg na równe części w AutoCADzie poleceniem PODZIEL (DIVIDE, skrót POD): punkty lub bloki, i dlaczego punktów nie widać."
figure: "PDMODE 3, aby punkty były widoczne jako krzyżyki, potem linia podzielona na 5 i okrąg na 6, zaczynając od jego punktu 0°."
sourceHash: "6f3c52078466"
---

Polecenie PODZIEL (DIVIDE) zaznacza na obiekcie równe części. Wybierz jedną linię, łuk, okrąg, elipsę, łuk eliptyczny, polilinię, polilinię 3D lub splajn, wskazując ją lub wpisując punkt na niej, a potem podaj liczbę segmentów, od 2 do 32767: polecenie PODZIEL stawia obiekt punktu w każdym miejscu podziału i się kończy. Nie przecina obiektu, który zostaje w całości. Obiekt otwarty podzielony na 5 dostaje 4 punkty, licząc od jego początku; zamknięty dostaje 5, w tym swój początek: okrąg od swojego punktu 0°, przeciwnie do ruchu wskazówek zegara, zamknięta polilinia od pierwszego wierzchołka. Punkty leżą na obiekcie, na jego wysokości, na bieżącej warstwie, z bieżącym kolorem, rodzajem linii i szerokością linii.

Punkty są rysowane tak, jak mówi styl punktów rysunku, a domyślnie jest to kropka, która chowa się pod linią: najpierw ustaw widoczny kształt poleceniem <Command id="PTYPE" /> albo zmienną PDMODE. Cały podział to jeden krok, który cofa polecenie <Command id="U" />, a jego punkty są zbiorem Poprzedni, gotowym do wymazania lub przesunięcia. Każdy inny obiekt, tekst lub odnośnik bloku, dostaje <Message id="cannotDivideObject" /> i polecenie się kończy. Polecenie PODZIEL uruchamia też lista rozwijana „Punkty” w narzędziach rysowania.

## Options

### Block

Zamiast punktów – odnośniki bloku, który już jest w rysunku: podaj jego nazwę, potem to, czy wyrównać każdy z nich z obiektem, <Keyword id="Yes" /> (domyślnie) lub <Keyword id="No" />, a następnie liczbę segmentów. Wyrównany odnośnik obraca się razem z obiektem w swoim miejscu, wzdłuż linii lub stycznie do łuku; bez wyrównania każdy zachowuje oś X układu LUW. Nazwa, za którą nie stoi żaden blok, jest odrzucana, a pytanie o nazwę pada ponownie. Zmienne atrybuty bloku są pomijane, jak w AutoCADzie.

## Missing

Helisa, której MellowCAD jeszcze nie rysuje. Bloki wzdłuż obiektu, który nie leży w płaszczyźnie LUW, są układane w płaszczyźnie LUW, podczas gdy pomoc AutoCADa umieszcza je w płaszczyźnie samego obiektu. Punkty okręgu zawsze zaczynają się na osi X układu LUW, podczas gdy AutoCAD zaczyna je pod kątem skoku, SNAPANG, którego MellowCAD nie ma.

## Questions

### Jak się nazywa polecenie PODZIEL po angielsku i jaki ma skrót?

DIVIDE. W polskim AutoCADzie jego skrót to `POD`: wpisz go i naciśnij Enter lub spację. Angielskie `DIV` w polskiej wersji nie działa; `_DIVIDE` działa w AutoCADzie w każdym języku.

### Dlaczego polecenie PODZIEL nie działa?

Najpewniej działa: punkty są na miejscu, narysowane jako kropki na linii. Otwórz polecenie <Command id="PTYPE" /> (`DDPTYPE`) i wybierz krzyżyk lub kółko albo wpisz PDMODE i `3`: każdy punkt w rysunku zmienia się od razu. Aby je wskazać, użyj lokalizacji Punkt, `PUN`.

### Jak podzielić linię na równe części w AutoCADzie?

Uruchom polecenie PODZIEL, wybierz linię i wpisz liczbę części, `5` dla pięciu. Cztery punkty między częściami to miejsca, do których można przyciągać: znajduje je lokalizacja Punkt.

### Jak podzielić okrąg na równe części?

Tak samo: wybierz okrąg i wpisz liczbę części. Obiekt zamknięty dostaje tyle punktów, ile części, więc 6 daje sześć punktów, pierwszy w punkcie 0° okręgu, kolejne przeciwnie do ruchu wskazówek zegara.

### Jak przeciąć linię na osobne kawałki?

Polecenie PODZIEL tylko zaznacza miejsca. Aby w nich przeciąć linię, użyj polecenia <Command id="BREAK" /> albo <Command id="BREAKATPOINT" /> w każdym punkcie, przyciągając do niego lokalizacją Punkt.

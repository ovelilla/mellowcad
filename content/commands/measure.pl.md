---
title: "Polecenie ZMIERZ (MEASURE) w AutoCADzie"
description: "Jak rozmieścić punkty co zadaną długość w AutoCADzie poleceniem ZMIERZ (MEASURE, skrót ZMI): punkty lub bloki od bliższego końca. Wypróbuj online."
figure: "Polilinia długości 190 odmierzana co 15 od końca, przy którym ją wskazano: dwanaście punktów, ostatni 10 przed drugim końcem."
sourceHash: "3975c3873eff"
---

Polecenie ZMIERZ (MEASURE) zaznacza obiekt co zadaną długość. Wybierz jedną linię, łuk, okrąg, elipsę, łuk eliptyczny, polilinię, polilinię 3D lub splajn, a potem podaj długość, wpisaną lub jako dwa punkty: polecenie ZMIERZ umieszcza obiekt punktu co tę długość wzdłuż obiektu, dopóki się mieści, i kończy. Nie mierzy za ciebie odległości ani nie tnie obiektu. Zaczyna od końca bliższego miejscu wskazania, więc wskaż obiekt blisko końca, od którego chcesz odmierzać; reszta zostaje na drugim końcu, a gdy długość mieści się w obiekcie całkowitą liczbę razy, drugi koniec też dostaje punkt. Okrąg zaczyna się w swoim punkcie 0° i biegnie przeciwnie do ruchu wskazówek zegara, niezależnie od miejsca wskazania; zamknięta polilinia zaczyna się w pierwszym wierzchołku.

Punkty są rysowane tak, jak mówi styl punktu rysunku, domyślnie jako kropka: wcześniej ustaw widoczny kształt poleceniem <Command id="PTYPE" /> albo przez PDMODE. Punkty leżą na obiekcie, na bieżącej warstwie, z bieżącym kolorem, rodzajem linii i szerokością linii; całe uruchomienie to jeden krok, który cofa <Command id="U" />, a punkty stają się zbiorem Poprzedni. Długość większa niż obiekt daje <Message id="objectNotThatLong" />, a tak mała, że powstałoby ponad 32767 punktów – <Message id="objectTooLong" />; w obu przypadkach nic nie powstaje. Każdy inny obiekt daje <Message id="cannotMeasureObject" />. Polecenie ZMIERZ uruchamia też lista rozwijana Punkty wśród narzędzi Rysuj.

## Options

### Block

Zamiast punktów – odnośniki bloku, który już jest w rysunku: podaj jego nazwę, potem, czy wyrównać każdy z obiektem, <Keyword id="Yes" /> (domyślnie) lub <Keyword id="No" />, a potem długość. Wyrównany odnośnik obraca się z obiektem w swoim miejscu, wzdłuż linii lub stycznie do łuku, niezależnie od tego, od którego końca zaczyna się odmierzanie; niewyrównany zachowuje oś X układu LUW. Nazwa, za którą nie stoi żaden blok, zostaje odrzucona i polecenie znów o nią pyta.

## Missing

Kierunek zamkniętej polilinii wskazanej za jej połową: tutaj jest mierzona wstecz od pierwszego wierzchołka, tak jak AutoCAD mierzy zamkniętą elipsę lub splajn, ale samej polilinii w AutoCADzie nie sprawdzono. Punkty na okręgu zawsze zaczynają się wzdłuż osi X układu LUW, podczas gdy AutoCAD zaczyna je pod kątem skoku, SNAPANG, którego MellowCAD nie ma.

## Questions

### Jak się nazywa polecenie ZMIERZ po angielsku?

MEASURE. W polskim AutoCADzie jego skrót to `ZMI`: wpisz go i naciśnij Enter lub spację. Angielskie `ME` w polskiej wersji nie działa; pełna nazwa `ZMIERZ` działa, a `_MEASURE` – w AutoCADzie w każdym języku.

### Czy polecenie ZMIERZ mierzy odległości?

Nie: rozmieszcza punkty co podaną długość. Aby odczytać odległość między dwoma punktami, użyj polecenia <Command id="DIST" />; długość obiektu podają <Command id="LIST" /> lub <Command id="AREA" />.

### Od którego końca zaczyna polecenie ZMIERZ?

Od końca bliższego punktowi, w którym wskazano obiekt. Wskaż go blisko końca, od którego ma być odmierzona pierwsza długość.

### Dlaczego nie widać punktów utworzonych poleceniem ZMIERZ?

Są rysowane jako kropki, domyślny styl punktu. Otwórz <Command id="PTYPE" /> i wybierz krzyżyk lub kółko albo ustaw PDMODE na `3`: wszystkie punkty zmienią się od razu.

### Czym się różni ZMIERZ od PODZIEL (DIVIDE)?

<Command id="DIVIDE" /> dzieli obiekt na podaną liczbę równych części; polecenie ZMIERZ odmierza go co podaną długość, a resztę zostawia na drugim końcu.

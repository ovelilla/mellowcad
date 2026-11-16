---
title: "Polecenie PRZERWIJ (BREAK) w AutoCADzie"
metaTitle: "Jak przerwać linię w AutoCADzie: PRZERWIJ"
description: "Jak przerwać linię w AutoCADzie poleceniem PRZERWIJ (BREAK, skrót PRZ): wskazanie to pierwszy punkt, potem drugi, albo opcja Pierwszy; przerwanie w punkcie."
figure: "Linia przerwana między dwoma punktami podanymi opcją Pierwszy oraz okrąg przerwany od miejsca wskazania przeciwnie do ruchu wskazówek zegara do drugiego punktu."
sourceHash: "f351112ef2fc"
---

Polecenie PRZERWIJ (BREAK) wycina przerwę w obiekcie albo dzieli go na dwa. Wybierz obiekt: jak w AutoCADzie, punkt, w którym go wskazano, jest pierwszym punktem przerwania, więc następny monit pyta już tylko o drugi, a część między nimi zostaje usunięta. Linia, łuk, otwarta polilinia, łuk eliptyczny lub splajn traci część między punktami i staje się dwoma obiektami; okrąg lub elipsa traci część biegnącą przeciwnie do ruchu wskazówek zegara od pierwszego punktu do drugiego, a zamknięta polilinia część między nimi w kolejności jej wierzchołków: każde staje się jednym otwartym obiektem. Punkt poza obiektem jest brany w najbliższym punkcie obiektu, a punkt za końcem tnie do tego końca. Gdy podajesz drugi punkt, część, którą PRZERWIJ by zachowało, jest pokazana na obiekcie. Przerwanie to jeden krok cofania.

## Options

### First point

Przy drugim punkcie przerwania: podaj ponownie pierwszy punkt przerwania, a potem drugi, gdy miejsce, w którym wskazano obiekt, nie jest początkiem przerwy.

## Missing

Łuk, okrąg lub elipsa, które nie leżą równolegle do płaszczyzny XY układu LUW: AutoCAD je przerywa, a MellowCAD ich nie znajduje. Cała elipsa odwrócona poleceniem <Command id="MIRROR" />, którą AutoCAD przerywa w przeciwną stronę.

## Questions

### Jak się nazywa polecenie PRZERWIJ po angielsku i jaki ma skrót?

Po angielsku BREAK, w polskim AutoCADzie PRZERWIJ: wpisz `PRZ`, potem naciśnij Enter albo spację. Angielskie `BR` w polskim AutoCADzie nie działa; `_BREAK` działa w AutoCADzie w każdym języku.

### Jak przerwać linię w punkcie w AutoCADzie?

Uruchom <Command id="BREAKATPOINT" />, wybierz linię i podaj punkt: staje się ona dwiema liniami, które się w nim stykają. W poleceniu PRZERWIJ to samo daje `@` wpisane przy drugim punkcie przerwania.

### Jak przerwać linię między dwoma punktami?

Wybierz linię, wybierz <Keyword id="First point" />, a potem podaj pierwszy i drugi punkt: część między nimi zostaje usunięta. Albo wskaż linię w pierwszym punkcie i podaj tylko drugi.

### Dlaczego nie można przerwać bloku ani tekstu?

PRZERWIJ przerywa linie, łuki, okręgi, polilinie, elipsy i splajny. Odnośnik bloku daje komunikat <Message id="cannotBreakBlock" />, a tekst, wymiar lub kreskowanie <Message id="objectCannotBeBroken" />; najpierw rozbij blok poleceniem <Command id="EXPLODE" />, aby przerwać jego części.

### W którą stronę PRZERWIJ przecina okrąg?

Przeciwnie do ruchu wskazówek zegara, od pierwszego punktu do drugiego, jak w AutoCADzie. Podaj punkty w odwrotnej kolejności, aby zachować drugą część.

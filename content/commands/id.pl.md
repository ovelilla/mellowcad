---
title: "Współrzędne punktu w AutoCADzie: polecenie ID"
description: "Jak odczytać współrzędne punktu w AutoCADzie poleceniem ID: wskaż punkt, także z lokalizacją, i odczytaj X, Y i Z w bieżącym LUW, również w innym poleceniu."
figure: "ID z lokalizacją Środek na otworze płytki: X, Y i Z środka."
sourceHash: "3f6bc32d12e5"
---

Polecenie ID wypisuje współrzędne punktu. Przy monicie `Określ punkt:` wskaż go, zlokalizuj względem obiektu lub wpisz, a polecenie ID wypisze jego X, Y i Z w jednej linii w wierszu polecenia i się zakończy. Wartości są w bieżącym układzie LUW, z dokładnością rysunku. Z lokalizacją względem obiektu Z jest wysokością obiektu w tym punkcie; bez niej – wysokością płaszczyzny poziomu. Enter kończy polecenie bez komunikatu, a obiekty wybrane przed poleceniem ID są przy jego uruchomieniu odznaczane. Wpisane z apostrofem, `'ID`, działa wewnątrz innego polecenia, które potem trwa dalej.

## Questions

### Do czego służy polecenie ID w AutoCADzie?

Podaje, gdzie leży punkt: X, Y i Z w bieżącym układzie LUW. Niczego nie rysuje ani nie zmienia. Ma tę samą nazwę w polskim i angielskim AutoCADzie, a `_ID` działa w każdym języku.

### Jak sprawdzić współrzędne punktu w AutoCADzie?

Wpisz `ID`, a potem kliknij punkt z lokalizacją względem obiektu, Punkt końcowy lub Środek, aby trafić w niego dokładnie. Współrzędne pojawią się w wierszu polecenia.

### Jak odczytać współrzędną Z punktu?

Wskaż go z lokalizacją względem obiektu: polecenie ID wypisze Z obiektu w tym miejscu. Zwykłe kliknięcie daje Z płaszczyzny poziomu, 0, chyba że podnoszą ją ELEVATION lub układ LUW.

### Dlaczego polecenie ID pokazuje inne współrzędne, niż się spodziewam?

Polecenie ID mierzy w bieżącym układzie LUW. Jeśli LUW przesunięto lub obrócono, liczby są mierzone od jego początku wzdłuż jego osi: polecenie <Command id="UCS" /> z opcją <Keyword command="UCS" id="World" /> przywraca współrzędne globalne.

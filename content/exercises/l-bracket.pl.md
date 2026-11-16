---
title: "Ćwiczenie AutoCAD: wspornik L"
metaTitle: "Ćwiczenie AutoCAD dla początkujących: wspornik L"
description: "Narysuj wspornik L w AutoCADzie we współrzędnych względnych: kontur, zaokrąglenie, dwa otwory i wymiary od bazy. Krok po kroku, za darmo online."
figure: "Wspornik L, 100 na 80, zwymiarowany od lewego dolnego narożnika."
sourceHash: "5c7cd5d57c92"
---

Narysuj ten wspornik w milimetrach: długość 100, stopa wysoka na 20 i ramię pionowe szerokie na 30 i wysokie na 80, naroże wewnętrzne zaokrąglone promieniem 10, otwór o średnicy 8 w stopie i otwór o średnicy 10 w ramieniu, każdy na środku swojej części. Kontur to jeden ciąg polecenia <Command id="LINE" />, każdy punkt wpisany jako przesunięcie od poprzedniego, a wszystkie wymiary wychodzą od lewego dolnego narożnika.

## Steps

### Narysuj kontur [#outline]

Na warstwie Kontur polecenie <Command id="LINE" /> od `0,0`, potem każdy punkt jako krok od poprzedniego: `100,0`, `0,20`, `-70,0`, `0,60` i `-30,0`. Opcja <Keyword command="LINE" id="Close" /> rysuje ostatni bok z powrotem do początku i kończy polecenie.

### Zaokrąglij naroże wewnętrzne [#fillet]

Polecenie <Command id="FILLET" />: wybierz opcję <Keyword command="FILLET" id="Radius" />, wpisz `10`, potem wskaż dwie linie, które spotykają się w narożu wewnętrznym: górę stopy i bok ramienia.

### Narysuj otwory [#holes]

Dwa okręgi poleceniem <Command id="CIRCLE" />, każdy przez opcję <Keyword command="CIRCLE" id="Diameter" />: `8` w punkcie `80,10`, w stopie, i `10` w punkcie `15,65`, w ramieniu.

### Zwymiaruj rysunek [#dimensions]

Na warstwie Wymiary polecenie <Command id="DIMLINEAR" /> od `0,0` do otworu w stopie, `80,10`, z wymiarem umieszczonym poniżej: 80. Polecenie <Command id="DIMBASELINE" /> prowadzi kolejne wymiary od tej samej pierwszej linii pomocniczej: wpisz prawy koniec, `#100,0`, gdzie # oznacza pomiar od początku układu, a potem dwa razy Enter, aby zakończyć. Tak samo wzdłuż lewego boku, do górnego otworu, a potem do górnej krawędzi, `#0,80`. Polecenie <Command id="DIMRADIUS" /> na zaokrągleniu i <Command id="DIMDIAMETER" /> na każdym otworze kończą rysunek.

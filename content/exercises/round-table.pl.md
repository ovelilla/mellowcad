---
title: "Ćwiczenie AutoCAD: okrągły stół i krzesła"
metaTitle: "Ćwiczenie AutoCAD: okrągły stół, sześć krzeseł"
description: "Narysuj w AutoCADzie okrągły stół z sześcioma krzesłami: jedno krzesło, potem szyk biegunowy wokół środka stołu i wymiary. Krok po kroku, za darmo online."
figure: "Okrągły stół o średnicy 120 z sześcioma krzesłami, w rzucie, zwymiarowany w centymetrach."
sourceHash: "1e307bf5e17a"
---

Narysuj okrągły stół o średnicy 120 z sześcioma krzesłami, w centymetrach: każde krzesło to siedzisko 44 na 40 z narożami zaokrąglonymi promieniem 4 i oparcie o głębokości 8, a przód siedziska leży 8 od krawędzi stołu. Narysuj jedno krzesło nad stołem, a wszystkie sześć rozmieści szyk biegunowy. Skala wymiarów rysunku jest ustawiona dla centymetrów.

## Steps

### Narysuj stół [#table]

Na warstwie Kontur polecenie <Command id="CIRCLE" /> w `0,0`, opcja <Keyword command="CIRCLE" id="Diameter" />, `120`.

### Narysuj krzesło [#chair]

Siedzisko, nad stołem: polecenie <Command id="RECTANG" /> z opcją <Keyword command="RECTANG" id="Fillet" /> równą `4`, od `-22,68` do punktu `44,40` dalej. Potem oparcie, z promieniem zaokrąglenia z powrotem na `0`, od `-22,108` do punktu `44,8` dalej. Polecenie <Command id="RECTANG" /> zachowuje promień zaokrąglenia, dopóki go nie zmienisz.

### Utwórz szyk krzeseł [#array]

Polecenie <Command id="ARRAYPOLAR" />: wskaż siedzisko i oparcie, naciśnij Enter, podaj środek stołu, `0,0`, a potem opcję <Keyword command="ARRAYPOLAR" id="Items" />, `6`. Każde krzesło obraca się przy rozmieszczaniu, więc wszystkie sześć stoi przodem do stołu.

### Zwymiaruj rysunek [#dimensions]

Na warstwie Wymiary polecenie <Command id="DIMDIAMETER" /> na stole, umieszczony wewnątrz, i polecenie <Command id="DIMLINEAR" /> dla szerokości górnego krzesła, 44, oraz jego głębokości z oparciem, 48.

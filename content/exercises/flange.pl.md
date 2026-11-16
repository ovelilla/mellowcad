---
title: "Ćwiczenie AutoCAD: kołnierz"
metaTitle: "Ćwiczenie AutoCAD: kołnierz z rowkiem wpustowym"
description: "Narysuj kołnierz w AutoCADzie: otwór z wyciętym rowkiem wpustowym, osiem otworów w szyku biegunowym, osie i średnice. Krok po kroku, za darmo online."
figure: "Kołnierz o średnicy 140 z rowkiem wpustowym, ośmioma otworami i średnicami."
sourceHash: "32f94d57ae25"
---

Narysuj ten kołnierz w milimetrach: średnica 140, otwór o średnicy 60 z rowkiem wpustowym szerokim na 16, którego dno leży 36 od środka, osiem otworów o średnicy 14 na okręgu podziałowym o średnicy 110 i osie. Rowek to prostokąt wycięty w otworze; otwory to jeden okrąg i szyk biegunowy.

## Steps

### Narysuj okręgi [#circles]

Na warstwie Kontur dwa okręgi w `0,0`, każdy przez opcję <Keyword command="CIRCLE" id="Diameter" />: `140` i `60`.

### Wytnij rowek wpustowy [#keyway]

Polecenie <Command id="RECTANG" /> od `-8,20` do punktu `16,16` dalej: przecina otwór. Polecenie <Command id="TRIM" /> ucina obiekt tam, gdzie przecinają go inne: wskaż łuk otworu między bokami prostokąta, a potem dolny bok prostokąta, wewnątrz otworu. Zostaje rowek wpustowy: jego dwa boki i dno.

### Utwórz szyk otworów [#holes]

Otwór na okręgu podziałowym: okrąg w `55<22.5`, 55 od początku układu pod kątem 22,5°, o średnicy (<Keyword command="CIRCLE" id="Diameter" />) `14`. Polecenie <Command id="ARRAYPOLAR" />: wskaż go, naciśnij Enter i podaj środek, `0,0`; opcje <Keyword command="ARRAYPOLAR" id="ASsociative" /> i <Keyword command="ARRAYPOLAR" id="No" /> zostawiają osiem osobnych okręgów, które można wskazać przy wymiarowaniu, a <Keyword command="ARRAYPOLAR" id="Items" />, `8`, rozkłada je na całym okręgu. Potem, na warstwie Linie osiowe, okrąg podziałowy w `0,0` o średnicy `110`.

### Narysuj osie [#centreLines]

Nadal na warstwie Linie osiowe dwie linie poleceniem <Command id="LINE" /> przez środek, długie na 156: od `-78,0` o `156,0` w poziomie; od `0,-78` o `0,156` w górę.

### Zwymiaruj rysunek [#dimensions]

Na warstwie Wymiary polecenie <Command id="DIMDIAMETER" /> na otworze, jednym z małych otworów, okręgu podziałowym i konturze, każdy wskazany tam, gdzie nie przecina go jeszcze żaden wymiar, a potem polecenie <Command id="DIMLINEAR" /> w poprzek dna rowka: 16.

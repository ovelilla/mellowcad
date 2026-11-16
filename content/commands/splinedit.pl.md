---
title: "Polecenie EDSPLAJN (SPLINEDIT) w AutoCADzie"
description: "Jak działa polecenie EDSPLAJN (SPLINEDIT, skrót SPE) w AutoCADzie: zamknij, dołącz, punkty dopasowania, wierzchołki, konwersja na polilinię i odwrócenie."
figure: "Splajn przez pięć punktów dopasowania zamknięty poleceniem EDSPLAJN: gładka pętla przechodząca przez wszystkie."
sourceHash: "bedcaab2fac3"
---

Polecenie EDSPLAJN (SPLINEDIT) edytuje splajn. Wskaż go w monicie `Wybierz splajn:` albo zaznacz przed poleceniem; dwukrotne kliknięcie splajnu również uruchamia na nim EDSPLAJN. Dla każdego innego obiektu polecenie wyświetla <Message id="objectNotSpline" /> i pyta ponownie; polilinia wygładzona opcją <Keyword command="PEDIT" id="Spline" /> polecenia <Command id="PEDIT" /> zostaje bez słowa zamieniona w splajn o tej samej krzywej. Potem polecenie pyta o opcję raz za razem, każdą stosując od razu, aż wybierzesz <Keyword id="eXit" /> lub naciśniesz Enter. Splajn pokazuje uchwyty swoich punktów dopasowania, a podczas edycji wierzchołków – swoje wierzchołki sterujące i ramkę. Cała edycja to jeden krok, który cofa <Command id="U" />. Wpisane `'ZOOM` działa w każdym jego monicie.

## Options

### Close

Zamyka splajn gładko: splajn dopasowania przez jego punkty dopasowania, splajn wierzchołków sterujących na jego wierzchołkach. Na zamkniętym splajnie ta opcja to <Keyword id="Open" />, a <Keyword id="Join" /> nie jest dostępna.

### Join

Dołącza otwarte krzywe stykające się z jego końcami, według reguł polecenia POŁĄCZ dla splajnu, i podaje, ile ich dołączył.

### Fit data

Edytuje punkty, przez które przechodzi splajn. Splajn wierzchołków sterujących, który ich nie ma, najpierw otrzymuje punkty dopasowania na swojej krzywej. Jej opcje: <Keyword id="Add" /> wskazuje punkt dopasowania i dodaje po nim nowe, raz za razem (przy pierwszym punkcie otwartego splajnu <Keyword id="After" /> lub <Keyword id="Before" />); <Keyword id="Delete" /> usuwa punkty dopasowania, do dwóch, a na zamkniętym splajnie do trzech (<Message id="cannotDeleteBeyond" />); <Keyword id="Move" /> przechodzi przez punkty dopasowania opcjami <Keyword id="Next" /> i <Keyword id="Previous" /> albo <Keyword id="Select point" /> i przesuwa bieżący do podanego punktu; <Keyword id="Purge" /> usuwa dane dopasowania, pozostawiając splajn wierzchołków sterujących; <Keyword id="Tangents" /> ustala kierunek początkowy i końcowy albo <Keyword id="System default" />; <Keyword id="Close" /> i <Keyword id="eXit" /> działają jak w pierwszym monicie. Po wskazaniu czegoś, co nie jest punktem dopasowania, polecenie wyświetla <Message id="notAFitPoint" />.

### Edit vertex

Edytuje wierzchołki sterujące; splajn dopasowania traci dane dopasowania przy pierwszej edycji. <Keyword id="Add" /> umieszcza wierzchołek we wskazanym punkcie splajnu; <Keyword id="Delete" /> usuwa jeden, do dwóch, a na zamkniętym splajnie do trzech; <Keyword id="Elevate order" /> podnosi rząd, maksymalnie do 26, ale nigdy go nie obniża; <Keyword id="Move" /> przesuwa wierzchołki, przechodząc przez nie jak <Keyword id="Move" /> w <Keyword id="Fit data" />; <Keyword id="Weight" /> ustala wagę wierzchołka, po komunikacie <Message id="splineMadeRational" />, tak że krzywa zbliża się do niego lub oddala. Po wskazaniu czegoś, co nie jest wierzchołkiem, polecenie wyświetla <Message id="notAControlVertex" />.

### convert to Polyline

Pyta o dokładność od 0 do 99, domyślnie 10, i zastępuje splajn polilinią z odcinków prostych, tym liczniejszych, im wyższa dokładność; polilinią 3D, gdy splajn nie leży płasko, równolegle do płaszczyzny XY. Kończy polecenie. Dokładność zostaje zachowana na całą sesję i korzysta z niej też konwersja w poleceniu <Command id="PEDIT" />.

### Reverse

Odwraca splajn, jego pierwszy punkt staje się ostatnim: <Message id="splineReversed" />.

### Undo

Cofa ostatnią opcję, całą <Keyword id="Fit data" /> lub <Keyword id="Edit vertex" /> naraz. Gdy nie ma już nic do cofnięcia: <Message id="commandCompletelyUndone" />.

### eXit

Kończy polecenie, jak Enter.

## Missing

PUnkt podziału (Kink), który tworzy ostry narożnik w punkcie dopasowania lub wierzchołku; Tolerancja, która dopasowuje splajn ponownie w granicach tolerancji; Styczne zamkniętego splajnu. <Keyword id="convert to Polyline" /> tworzy ze splajnu dopasowania znacznie więcej wierzchołków niż AutoCAD, nigdy łuków, i zawsze zastępuje splajn. Grupa przy `Wybierz splajn:`. Znak `+`, który AutoCAD rysuje na bieżącym punkcie podczas przechodzenia przez punkty.

## Questions

### Jak się nazywa polecenie EDSPLAJN po angielsku?

SPLINEDIT. W polskim AutoCADzie wpisz `SPE` lub pełną nazwę `EDSPLAJN` i naciśnij Enter lub spację; skrót `SPE` jest taki sam jak w wersji angielskiej. `_SPLINEDIT` działa w AutoCADzie w każdym języku. Uruchamia je też dwukrotne kliknięcie splajnu.

### Jak zamienić splajn na polilinię?

Uruchom EDSPLAJN, wskaż splajn i wybierz <Keyword id="convert to Polyline" />; dokładność 10 daje gładką polilinię. <Command id="PEDIT" /> na splajnie również proponuje zamianę.

### Jak dodać lub przesunąć punkty splajnu w AutoCADzie?

Wybierz <Keyword id="Fit data" />, aby pracować na punktach, przez które przechodzi, a potem <Keyword id="Add" /> lub <Keyword id="Move" />. Wybierz <Keyword id="Edit vertex" />, aby pracować na wierzchołkach sterujących, które go otaczają.

### Jak zamknąć splajn?

Wybierz <Keyword id="Close" />: splajn zamyka się gładko, bez narożnika w miejscu, gdzie spotykają się jego końce. <Keyword id="Open" /> otwiera go ponownie.

### Jak połączyć dwa splajny?

Wybierz <Keyword id="Join" /> i zaznacz splajn, którego koniec styka się z końcem tego, albo użyj polecenia <Command id="JOIN" />.

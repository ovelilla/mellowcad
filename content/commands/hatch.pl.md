---
title: "Kreskowanie w AutoCADzie: polecenie KRESKUJ (HATCH)"
metaTitle: "Kreskowanie w AutoCADzie: polecenie KRESKUJ"
description: "Jak kreskować w AutoCADzie poleceniem KRESKUJ (HATCH), monit po monicie: punkt wewnątrz lub obiekty obwiedni, wzór, skala, kąt, wyspy. Wypróbuj za darmo online."
figure: "Prostokąt z okręgiem w środku, zakreskowany wzorem ANSI31 z jednego punktu wewnątrz: okrąg zostaje pusty jako wyspa."
sourceHash: "d3ed16b85a19"
---

Polecenie KRESKUJ (HATCH) wypełnia zamknięty obszar wzorem linii albo jednolicie. Wskaż punkt wewnątrz obszaru, a polecenie znajdzie jego obwiednię w otaczających go obiektach, pozostawiając puste to, co leży w środku jako wyspa – okrąg w prostokącie, tekst; albo wybierz obiekty, które go ograniczają. Wskaż tyle obszarów, ile chcesz: Enter lub Esc tworzy z nich wszystkich jedno kreskowanie, na bieżącej warstwie, pod jego obwiednią. Całe polecenie to jeden krok cofania.

Polecenie KRESKUJ w AutoCADzie ustawia wzór na karcie kontekstowej Tworzenie kreskowania albo w oknie dialogowym, których MellowCAD nie ma: tutaj pyta w wierszu polecenia o to, o co pyta polecenie <Command id="-HATCH" />, wzór w opcji <Keyword id="Properties" />. Oba różnią się tylko klawiszem Esc, który w poleceniu <Command id="-HATCH" /> porzuca obszary. Każde kreskowanie zaczyna od wzoru, skali i kąta, jakie dostało ostatnie: w nowym rysunku ANGLE, w skali 1 i pod kątem 0.

## Options

### Properties

Pyta o nazwę wzoru, wielkimi lub małymi literami, proponując bieżący: <Keyword id="Solid" /> wypełnia obszar jednolicie, a <Keyword id="?" /> wyświetla listę wzorów z ich opisami i wraca do punktu. Dla wzoru pyta potem o skalę – liczbę większą od 0 albo dwa zmierzone punkty – i o kąt, wpisany lub przez dwa punkty. Następne kreskowanie zachowuje wszystkie trzy.

<Session name="hatchPatterns" caption="SOLID i jedenaście wzorów z acadiso.pat, każdy zakreskowany w kwadracie o boku 30 w skali 1, AR-CONC i AR-SAND w skali 0,08 i 0,1." />

### Select objects

Zamiast punktu wewnątrz wybierz obiekty, które ograniczają obszar; Enter wraca do punktu. Obiekt, który nie zamyka żadnego obszaru, jest pomijany; gdy żaden z nich nie ogranicza obszaru, Enter mówi <Message id="unableToHatchBoundary" /> i nic nie tworzy. Region daje swój obrys, a jego otwory – wyspy.

### Undo

Nie ma jej na liście przy monicie, ale jest tam przyjmowana: cofa obszary ostatnio wskazanego punktu i pyta ponownie, zostawiając obiekty wybrane. Mówi <Message id="noBoundaryToUndo" />, gdy nie ma już punktu do cofnięcia.

## Missing

Elipsy i splajny jako obwiednie: obszar, który zamykają, nie jest znajdowany, a region z taką krawędzią jest pomijany. Tolerancja przerwy (HPGAPTOL): obszar musi być dokładnie zamknięty. Kreskowania skojarzone, style wysp Normalny i Ignoruj, gradienty, wzory użytkownika i reszta wzorów z acadiso.pat. Pozostałe opcje polecenia -KRESKUJ: rysowanie obwiedni, usuwanie obwiedni, Zaawansowane, porządek wyświetlania, początek, opisowe, kolor, warstwa i przezroczystość. Polecenie EDKRESK i Edytor kreskowania, które w AutoCADzie otwiera dwukrotne kliknięcie. MIRRHATCH 1: odbite kreskowanie zawsze zachowuje kąt swojego wzoru. Menu uchwytów kreskowania.

## Questions

### Jak się nazywa polecenie KRESKUJ po angielsku i jaki ma skrót?

HATCH. W polskim AutoCADzie polecenie KRESKUJ nie ma skrótu: wpisz pełną nazwę i naciśnij Enter lub spację. Angielskie `H` i `BH` w polskiej wersji nie działają; `_HATCH` działa w AutoCADzie w każdym języku. Bez karty Tworzenie kreskowania polecenie pyta w wierszu polecenia, tak jak `-KRE` (<Command id="-HATCH" />).

### Dlaczego kreskowanie w AutoCADzie nie działa?

Najczęściej obszar nie jest zamknięty: polecenie mówi <Message id="hatchNoBoundary" />, a wystarczy najmniejsza przerwa, bo nic jej nie zamyka. Zamknij obrys i wskaż ponownie. Obszar zamknięty elipsą lub splajnem nie jest jeszcze znajdowany, a obiekty na wyłączonej warstwie nie są widziane.

### Jakie są wzory kreskowania i czy można pobrać inne?

Wybór z acadiso.pat, metrycznego pliku wzorów AutoCADa: SOLID, ANGLE, od ANSI31 do ANSI38, AR-CONC, AR-SAND, BRICK, CROSS, DASH, DOTS, EARTH, HONEY, LINE, NET, NET3, SQUARE, STEEL i ZIGZAG. <Keyword id="?" /> w opcji <Keyword id="Properties" /> wyświetla ich listę. Własnego ani pobranego pliku wzorów nie można jeszcze wczytać.

### Jak zmienić skalę kreskowania w AutoCADzie?

Przed wskazaniem, w opcji <Keyword id="Properties" />: skala następuje po nazwie wzoru. Gdy kreskowanie już istnieje, wybierz je i wpisz na nowo „Skalę” w palecie „Właściwości” albo nadaj mu wzór, skalę i kąt innego kreskowania poleceniem <Command id="MATCHPROP" />. Skala tak mała, że wzór wymagałby zbyt wielu linii, daje <Message id="hatchTooDense" /> i nie tworzy kreskowania.

### Jak sprawdzić pole kreskowania?

Wybierz je i odczytaj „Pole” w grupie „Geometria” palety „Właściwości”, bez wysp; przy kilku wybranych kreskowaniach „Pole łączne” je sumuje. Albo uruchom polecenie <Command id="AREA" />, wybierz <Keyword command="AREA" id="Object" /> i wskaż kreskowanie.

---
title: "Kreskowanie w AutoCADzie: polecenie KRESKUJ (HATCH)"
metaTitle: "Kreskowanie w AutoCADzie: polecenie KRESKUJ"
description: "Jak kreskować w AutoCADzie poleceniem KRESKUJ (HATCH), monit po monicie: punkt wewnątrz lub obiekty obwiedni, wzór, skala, kąt, wyspy. Wypróbuj za darmo online."
figure: "Prostokąt z okręgiem w środku, zakreskowany wzorem ANSI31 z jednego punktu wewnątrz: okrąg zostaje pusty jako wyspa."
sourceHash: "a79440617f68"
---

Polecenie KRESKUJ (HATCH) wypełnia zamknięty obszar wzorem linii albo jednolicie. Wskaż punkt wewnątrz obszaru, a polecenie znajdzie jego obwiednię w otaczających go obiektach, pozostawiając puste to, co leży w środku, jako wyspę – okrąg w prostokącie, tekst; albo wybierz obiekty, które go ograniczają. Wskaż tyle obszarów, ile chcesz: Enter lub Esc tworzy z nich wszystkich jedno kreskowanie, na bieżącej warstwie, pod swoją obwiednią. Całe polecenie to jeden krok cofania.

Podczas działania polecenia wstążka pokazuje kartę kontekstową Tworzenie kreskowania, tak jak w AutoCADzie: Wskaż punkty i Wybierz, galerię wzorów, Typ kreskowania (Bryła lub Wzór), Kąt, Skala wzoru kreskowania i Zakończ tryb tworzenia kreskowania. Przy zamkniętej wstążce AutoCAD otwiera okno dialogowe Kreskowanie i wypełnienie, którego MellowCAD nie ma: wtedy KRESKUJ pyta w wierszu polecenia o to, o co pyta polecenie <Command id="-HATCH" />, wzór w opcji <Keyword id="Properties" />. Klawisz Esc zachowuje kreskowanie, a w poleceniu <Command id="-HATCH" /> porzuca obszary. Każde kreskowanie zaczyna od wzoru, skali i kąta, jakie dostało ostatnie: w nowym rysunku ANGLE, w skali 1 i pod kątem 0.

## Options

### Properties

Pytanie pada w wierszu polecenia przy zamkniętej wstążce lub w poleceniu <Command id="-HATCH" />; przy otwartej wstążce te same trzy wartości ustawia karta. Pyta o nazwę wzoru, wielkimi lub małymi literami, proponując bieżący: <Keyword id="Solid" /> wypełnia obszar jednolicie, a <Keyword id="?" /> wyświetla listę wzorów z ich opisami i wraca do punktu. Dla wzoru pyta potem o skalę – liczbę większą od 0 albo dwa zmierzone punkty – i o kąt, wpisany lub przez dwa punkty. Następne kreskowanie zachowuje wszystkie trzy.

<Session name="hatchPatterns" caption="SOLID i jedenaście wzorów z acadiso.pat, każdy zakreskowany w kwadracie o boku 30 w skali 1, AR-CONC i AR-SAND w skali 0,08 i 0,1." />

### Select objects

Zamiast punktu wewnątrz wybierz obiekty, które ograniczają obszar; przy otwartej wstążce polecenie pyta ponownie po każdym wyborze, <Keyword id="Pick internal point" /> wraca do punktu, a Enter kończy polecenie, przy zamkniętej Enter wraca do punktu. Obiekt, który nie zamyka żadnego obszaru, jest pomijany; gdy żaden z nich nie ogranicza obszaru, Enter mówi <Message id="unableToHatchBoundary" /> i nic nie tworzy. Region daje swój obrys, a jego otwory – wyspy.

### Undo

Jest na liście przy monicie wstążki, a przy monicie polecenia <Command id="-HATCH" /> jest przyjmowana, choć jej tam nie ma: cofa obszary ostatnio wskazanego punktu i pyta ponownie, zostawiając obiekty wybrane; podczas wybierania obiektów cofa ostatni wybór. Mówi <Message id="noBoundaryToUndo" />, gdy nie ma już punktu do cofnięcia.

## Missing

Elipsy i splajny jako obwiednie: obszar, który zamykają, nie jest znajdowany, a region z taką krawędzią jest pomijany. Tolerancja przerwy (HPGAPTOL): obszar musi być dokładnie zamknięty. Kreskowania skojarzone, style wysp Normalny i Ignoruj. Gradienty, wzory użytkownika i reszta wzorów z acadiso.pat nie powstają tutaj: przynoszą je tylko kreskowania z pliku DXF, gradienty w swoich kolorach, a wzory wraz z liniami. Pozostałe opcje polecenia -KRESKUJ: rysowanie obwiedni, usuwanie obwiedni, Zaawansowane, porządek wyświetlania, początek, opisowe, kolor, warstwa i przezroczystość; opcje Rysuj i Ustawienia monitu wstążki. Z karty Tworzenie kreskowania: Usuń i Odtwórz, typy Gradient i Użytkownika, kolory, przezroczystość, początek i opcje. Polecenie EDKRESK i Edytor kreskowania, które w AutoCADzie otwiera dwukrotne kliknięcie. MIRRHATCH 1: odbite kreskowanie zawsze zachowuje kąt swojego wzoru. Menu uchwytów kreskowania.

## Questions

### Jak się nazywa polecenie KRESKUJ po angielsku i jaki ma skrót?

HATCH. W polskim AutoCADzie polecenie KRESKUJ nie ma skrótu: wpisz pełną nazwę i naciśnij Enter lub spację. Angielskie `H` i `BH` w polskiej wersji nie działają; `_HATCH` działa w AutoCADzie w każdym języku. Polecenie otwiera kartę Tworzenie kreskowania; `-KRE` (<Command id="-HATCH" />) pyta o wszystko w wierszu polecenia.

### Dlaczego kreskowanie w AutoCADzie nie działa?

Najczęściej obszar nie jest zamknięty: polecenie mówi <Message id="hatchNoBoundary" />, a wystarczy najmniejsza przerwa, bo nic jej nie zamyka. Zamknij obrys i wskaż ponownie. Obszar zamknięty elipsą lub splajnem nie jest jeszcze znajdowany, a obiekty na wyłączonej warstwie nie są brane pod uwagę.

### Jakie są wzory kreskowania i czy można pobrać inne?

Wybór z acadiso.pat, metrycznego pliku wzorów AutoCADa: SOLID, ANGLE, od ANSI31 do ANSI38, AR-CONC, AR-SAND, BRICK, CROSS, DASH, DOTS, EARTH, HONEY, LINE, NET, NET3, SQUARE, STEEL i ZIGZAG. Pokazuje je karta Tworzenie kreskowania; <Keyword id="?" /> w opcji <Keyword id="Properties" /> wyświetla ich listę. Własnego ani pobranego pliku wzorów nie można jeszcze wczytać, ale kreskowania z pliku DXF otwierają się z wzorem, który zawierają, jakikolwiek by był, tak jak rysuje je AutoCAD.

### Jak zmienić skalę kreskowania w AutoCADzie?

Podczas wskazywania w polu „Skala wzoru kreskowania” na karcie Tworzenie kreskowania albo w opcji <Keyword id="Properties" /> polecenia <Command id="-HATCH" />, po nazwie wzoru. Gdy kreskowanie już istnieje, wybierz je i wpisz na nowo „Skalę” w palecie „Właściwości” albo nadaj mu wzór, skalę i kąt innego kreskowania poleceniem <Command id="MATCHPROP" />. Skala tak mała, że wzór wymagałby zbyt wielu linii, daje <Message id="hatchTooDense" /> i nie tworzy kreskowania.

### Jak sprawdzić pole kreskowania?

Wybierz je i odczytaj „Obszar” w grupie „Geometria” palety „Właściwości”, bez wysp; przy kilku wybranych kreskowaniach „Obszar łączny” je sumuje. Albo uruchom polecenie <Command id="AREA" />, wybierz <Keyword command="AREA" id="Object" /> i wskaż kreskowanie.

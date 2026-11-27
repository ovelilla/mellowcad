---
title: "Szyk prostokątny w AutoCADzie: polecenie SZYKPROST (ARRAYRECT)"
metaTitle: "Szyk prostokątny w AutoCADzie: SZYKPROST"
description: "Jak zrobić szyk prostokątny w AutoCADzie poleceniem SZYKPROST (ARRAYRECT): kolumny, wiersze i poziomy, odstępy między nimi, szyk skojarzony lub nie."
figure: "Kwadrat i jego okrąg w 5 kolumnach i 3 wierszach, w odstępach 16 i 14: najpierw liczba, potem odstęp."
sourceHash: "27ed7142411e"
---

Polecenie SZYKPROST (ARRAYRECT) kopiuje zaznaczenie w kolumnach i wierszach, a jeśli chcesz, także w poziomach, jako jeden obiekt szyku. Pyta o obiekty, podaje typ i to, czy szyk jest skojarzony, i od razu go pokazuje: 4 kolumny wzdłuż osi X układu LUW i 3 wiersze wzdłuż jego osi Y, w odstępach półtora raza większych od rozmiaru zaznaczenia. Potem jeden monit edytuje go na żywo, aż Enter go utworzy, opcjami lub uchwytami podglądu, jak w AutoCADzie: kliknij jedną z jego strzałek, a potem kliknij, gdzie ma się znaleźć, lub wpisz liczbę, aby ustawić liczbę lub odstęp. Esc w tym miejscu również tworzy szyk. Zaznaczone obiekty stają się jego pierwszym elementem.

## Options

### ASsociative

<Keyword id="Yes" />, wartość domyślna, tworzy jeden obiekt szyku: później zmieniają go jego uchwyty i paleta Właściwości, a <Command id="EXPLODE" /> rozbija go na elementy. <Keyword id="No" /> tworzy oddzielne kopie obok zaznaczonych obiektów. Odpowiedź jest pamiętana do końca sesji, także przez SZYKBIEGUN i ŚCIEŻKASZYK.

### COUnt

Liczba kolumn, potem wierszy, każda od 1 do 32767.

### Spacing

Odległość między kolumnami, potem między wierszami, ujemna w lewo lub w dół. Albo <Keyword id="Unit cell" />: dwa narożniki prostokąta, którego boki są obiema odległościami.

### COLumns

Liczba kolumn i odległość między nimi.

### Rows

Liczba wierszy, odległość między nimi i przyrost rzędnej każdego wiersza względem poprzedniego.

### Levels

Kopie ułożone wzdłuż osi Z układu LUW: liczba poziomów, potem odległość między nimi albo, z opcją <Keyword id="Total" />, odległość od pierwszego poziomu do ostatniego.

### eXit

Tworzy szyk i kończy polecenie, tak jak Enter.

## Missing

Punkt bazowy; Całkowity przy odległościach między kolumnami i między wierszami (Poziomy go mają); Wyrażenie, które wiąże wartość z parametrami rysunku. EDYTUJSZYK i ZAMKNIJSZYK, które edytują źródło szyku lub zastępują jego elementy. Dlatego karta Szyk otwierana przez wybrany szyk nie ma przycisków Punkt bazowy, Opcje ani Zamknij szyk. Menu uchwytów szyku (liczba kolumn, całkowity odstęp kolumn, kąt osi…) i Ctrl do przełączania między nimi, więc całkowitego odstępu ani kąta osi nie można ustawić uchwytem; uchwyt nie wypisuje też swoich wierszy w wierszu polecenia. Wartości Bazowy X i Bazowy Y w palecie nie można wpisać ponownie.

## Questions

### Jak zrobić szyk prostokątny w AutoCADzie?

Wpisz `SZYKPROST`, które nie ma skrótu, albo `SZ`, czyli <Command id="ARRAY" />, i naciśnij Enter przy jego pytaniu, bo prostokątny to jego typ domyślny. Zaznacz obiekty i naciśnij Enter: szyk zostaje od razu narysowany, gotowy do edycji.

### Jak ustawić odległość między wierszami i kolumnami szyku?

Wybierz <Keyword id="Spacing" /> i wpisz odległość między kolumnami, potem między wierszami; ujemna idzie w lewo lub w dół. Z opcją <Keyword id="Unit cell" /> dwa narożniki podają obie naraz. Albo przeciągnij strzałki przy drugiej kolumnie i drugim wierszu.

### Jak sprawić, by kopie szyku były oddzielnymi obiektami?

Wybierz <Keyword id="ASsociative" /> i odpowiedz <Keyword id="No" />, zanim naciśniesz Enter: każda kopia jest osobnym obiektem. Szyk skojarzony można później rozbić na elementy poleceniem <Command id="EXPLODE" />.

### Jak zrobić szyk 3D w AutoCADzie?

Wybierz <Keyword id="Levels" />: wiersze i kolumny są kopiowane w górę wzdłuż osi Z układu LUW, w tylu poziomach, ile podasz, w podanej odległości. Opcja <Keyword id="Rows" /> pyta też o przyrost rzędnej, który podnosi każdy wiersz względem poprzedniego.

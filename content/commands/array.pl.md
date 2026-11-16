---
title: "Szyk w AutoCADzie: polecenie SZYK (ARRAY)"
metaTitle: "Szyk w AutoCADzie: polecenie SZYK (ARRAY)"
description: "Jak zrobić szyk w AutoCADzie poleceniem SZYK (ARRAY, skrót SZ): prostokątny, biegunowy i wzdłuż ścieżki, edytowany na żywo przed utworzeniem. Wypróbuj za darmo."
figure: "Kwadrat i jego okrąg w szyku z wartościami domyślnymi: Enter dla szyku prostokątnego, 4 kolumny i 3 wiersze."
sourceHash: "5e0a412c9f13"
---

Polecenie SZYK (ARRAY) kopiuje zaznaczenie według wzoru: w kolumnach i wierszach, wokół środka albo wzdłuż ścieżki. Pyta o obiekty, potem o typ szyku, przy czym Enter wybiera prostokątny, i przekazuje zaznaczenie poleceniu <Command id="ARRAYRECT" />, <Command id="ARRAYPOLAR" /> lub <Command id="ARRAYPATH" />, które działa dalej, nie pytając ponownie o obiekty. Każde z nich od razu pokazuje szyk i edytuje go na żywo, opcjami i uchwytami, aż Enter go utworzy: jeden obiekt szyku albo luźne kopie, jeśli wybrano, że ma nie być skojarzony. Całe polecenie to jeden krok cofania, a Enter w wierszu polecenia powtarza SZYK.

## Options

### Rectangular

Kolumny i wiersze oraz, jeśli chcesz, poziomy ułożone wzdłuż Z: <Command id="ARRAYRECT" />. Zaczyna od 4 kolumn i 3 wierszy, w odstępach półtora raza większych od rozmiaru zaznaczenia.

### PAth

Wzdłuż linii, łuku, okręgu lub polilinii: <Command id="ARRAYPATH" />. Pyta o krzywą ścieżki, a potem układa na niej elementy, każdy obrócony tak, jak skręca ścieżka.

### POlar

Wokół punktu środkowego: <Command id="ARRAYPOLAR" />. Pyta o środek i zaczyna od 6 elementów na pełnym obrocie.

## Missing

Proponowany typ to zawsze prostokątny: zmienna ARRAYTYPE, która ustala domyślny typ w AutoCADzie, nie jest odczytywana.

## Questions

### Jak się nazywa polecenie SZYK po angielsku i jaki ma skrót?

Po angielsku ARRAY, w polskim AutoCADzie SZYK: wpisz `SZ`, potem naciśnij Enter albo spację. Angielskie `AR` to w polskim AutoCADzie skrót polecenia ARKUSZ; `_ARRAY` działa w AutoCADzie w każdym języku. <Command id="ARRAYRECT" />, <Command id="ARRAYPOLAR" /> i <Command id="ARRAYPATH" /> nie mają skrótu, a wpisane w całości pomijają pytanie o typ.

### Jak zrobić szyk kołowy w AutoCADzie?

Wybierz <Keyword id="POlar" /> albo uruchom <Command id="ARRAYPOLAR" /> i wskaż punkt środkowy: zaznaczenie zostaje skopiowane wokół niego, początkowo w 6 elementach. Liczbę zmień opcją <Keyword command="ARRAYPOLAR" id="Items" />, a kąt, który wypełniają, ustaw opcją <Keyword command="ARRAYPOLAR" id="Fill angle" />.

### Jak rozbić szyk w AutoCADzie?

Zaznacz go i uruchom <Command id="EXPLODE" />: szyk staje się obiektami swoich elementów, każdy obiekt na swojej warstwie. Aby od początku dostać luźne kopie, odpowiedz <Keyword command="ARRAYRECT" id="No" /> na <Keyword command="ARRAYRECT" id="ASsociative" />, zanim naciśniesz Enter.

### Jak zmienić szyk po jego utworzeniu?

Zaznacz go. Zmieniają go jego uchwyty: kwadrat w punkcie bazowym go przesuwa, strzałki ustawiają liczby i odstępy, a liczba wpisana, gdy strzałka liczby jest aktywna, to nowa liczba. Paleta Właściwości pokazuje jego kolumny, wiersze i odstępy albo elementy i kąty do ponownego wpisania. Polecenia EDYTUJSZYK jeszcze nie ma.

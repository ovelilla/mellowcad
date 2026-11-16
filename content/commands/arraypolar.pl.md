---
title: "Szyk biegunowy w AutoCADzie: polecenie SZYKBIEGUN (ARRAYPOLAR)"
metaTitle: "Szyk biegunowy w AutoCADzie: SZYKBIEGUN"
description: "Jak zrobić szyk biegunowy (kołowy) w AutoCADzie poleceniem SZYKBIEGUN (ARRAYPOLAR): środek, liczba elementów, kąt między nimi lub wypełnienia, obrót elementów."
figure: "Otwór na kołnierzu rozłożony wokół środka kołnierza: 8 elementów na pełnym obrocie."
sourceHash: "efed541dea7f"
---

Polecenie SZYKBIEGUN (ARRAYPOLAR) kopiuje zaznaczenie wokół punktu środkowego jako jeden obiekt szyku. Pyta o obiekty, podaje typ i to, czy szyk jest skojarzony, pyta o punkt środkowy i od razu pokazuje szyk: 6 elementów na pełnym obrocie, każdy obrócony w miarę obiegania środka. Potem jeden monit edytuje go na żywo, aż Enter go utworzy, opcjami lub uchwytami podglądu, jak w AutoCADzie. Zaznaczone obiekty stają się jego pierwszym elementem.

## Options

### ASsociative

<Keyword id="Yes" />, wartość domyślna, tworzy jeden obiekt szyku, który później zmieniają jego uchwyty i paleta Właściwości; <Keyword id="No" /> tworzy oddzielne kopie obok zaznaczonych obiektów. Odpowiedź jest pamiętana do końca sesji, także przez SZYKPROST i ŚCIEŻKASZYK.

### Items

Liczba elementów, od 1 do 32767; kąt, który wypełniają, zostaje zachowany.

### Angle between

Kąt od jednego elementu do następnego. Kąt wypełnienia staje się wielokrotnością tego kroku, z zachowanym kierunkiem, i pełnym obrotem, gdy dojdzie do 360°.

### Fill angle

Kąt, który wypełniają elementy, dodatni przeciwnie do ruchu wskazówek zegara, a ujemny zgodnie z nim; liczba elementów zostaje zachowana. Na pełnym obrocie elementy dzieli obrót podzielony przez ich liczbę; na mniejszym ostatni trafia na koniec kąta.

### ROTate items

<Keyword id="Yes" />, wartość domyślna, obraca każdy element w miarę obiegania środka; <Keyword id="No" /> tylko go przesuwa, więc każdy element stoi tak jak pierwszy.

### eXit

Tworzy szyk i kończy polecenie, tak jak Enter.

## Missing

Punkt bazowy; Oś obrotu, dla szyku wokół osi w przestrzeni; Wiersze i Poziomy, dla pierścieni elementów i kopii ułożonych wzdłuż Z; Wyrażenie, które wiąże wartość z parametrami rysunku. Menu uchwytów szyku (rozciąganie promienia, liczba elementów, kąt wypełnienia…) i Ctrl do przełączania między nimi.

## Questions

### Jak zrobić szyk biegunowy w AutoCADzie?

Wpisz `SZYKBIEGUN`, zaznacz obiekty, naciśnij Enter i wskaż punkt środkowy; albo wpisz `SZ`, czyli <Command id="ARRAY" />, i po obiektach wybierz <Keyword command="ARRAY" id="POlar" />. Potem wybierz <Keyword id="Items" />, aby ustawić ich liczbę, i naciśnij Enter, aby utworzyć szyk.

### Jak rozmieścić obiekty na części okręgu?

Wybierz <Keyword id="Fill angle" /> i wpisz kąt: 180 rozkłada elementy na pół okręgu przeciwnie do ruchu wskazówek zegara, -180 zgodnie z nim. Liczba elementów zostaje zachowana, a pierwszy i ostatni stoją na obu końcach kąta.

### Jak sprawić, by elementy szyku się nie obracały?

Wybierz <Keyword id="ROTate items" /> i odpowiedz <Keyword id="No" />: każdy element jest przesuwany wokół środka bez obracania.

### Jak zmienić promień szyku biegunowego?

Zaznacz szyk i przeciągnij jego kwadratowy uchwyt w punkcie bazowym w stronę środka lub od niego: odległość od środka to nowy promień. Albo wpisz ponownie Promień w palecie Właściwości.

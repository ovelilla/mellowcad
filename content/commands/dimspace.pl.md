---
title: "Polecenie PRZESTRZWYM (DIMSPACE) w AutoCADzie"
description: "Jak wyrównać wymiary w AutoCADzie poleceniem PRZESTRZWYM (DIMSPACE): równy odstęp między wymiarami albo 0, aby ustawić je w linii, i Auto z wysokości tekstu."
before: "Górna krawędź płytki zwymiarowana szeregiem trzech wymiarów, każdy na własnej wysokości, tak jak je narysowano."
figure: "PRZESTRZWYM od pierwszego wymiaru, dwa pozostałe wybrane i odstęp 0: szereg ustawiony w jednej linii."
sourceHash: "7ec7c0eb9883"
---

Polecenie PRZESTRZWYM (DIMSPACE) ustawia odstęp między równoległymi wymiarami liniowymi i wyrównanymi. Wybierasz wymiar bazowy, który zostaje na miejscu, potem wymiary do rozmieszczenia; Enter kończy wybór i pyta o odstęp. Linia każdego wymiaru jest wtedy przesuwana, od wymiaru bazowego, w kolejności, w jakiej leżą, na tę odległość od poprzedniego. Odstęp 0 ustawia je wszystkie na linii wymiaru bazowego: szereg rozstrzelony tak, jak go narysowano, staje się jedną linią. Zmienia się tylko położenie linii wymiarowych, w jednym kroku, który cofa polecenie <Command id="U" />.

Wymiar bazowy można wskazać, wpisać jako punkt albo wybrać przez `Ostatni`; obiekt, który nie jest wymiarem, daje <Message id="selectedObjectNotDimension" /> i pytanie pada ponownie. Zbiór wybrany przed poleceniem jest zbiorem do rozmieszczenia. Wymiar ustawiony pod kątem do bazowego jest liczony i zostaje na miejscu, a ujemny odstęp jest odrzucany komunikatem <Message id="negativeSpacing" />.

## Options

### Auto

Opcja domyślna, wybierana Enterem: odstęp równy dwukrotnej wysokości tekstu stylu wymiarowania wymiaru bazowego, pomnożonej przez jego globalną skalę, tak aby stos mieścił własny tekst.

## Missing

Wymiary kątowe, których polecenie PRZESTRZWYM jeszcze nie rozmieszcza. AutoCAD przesuwa wymiar tylko wtedy, gdy trzeba; tutaj każdy wybrany wymiar jest rozmieszczany na nowo.

## Questions

### Jak wyrównać wymiary w AutoCADzie?

Uruchom polecenie PRZESTRZWYM, wskaż wymiar, do którego mają się wyrównać pozostałe, wybierz je, naciśnij Enter i wpisz `0`: każda linia wymiarowa przesuwa się na linię wymiaru bazowego.

### Jak ustawić równe odstępy między wymiarami?

Uruchom polecenie PRZESTRZWYM, wskaż jako bazowy wymiar najbliższy obiektu, wybierz pozostałe i naciśnij dwa razy Enter: <Keyword id="Auto" /> rozmieszcza je co dwie wysokości tekstu. Albo wpisz odległość, którą chcesz, na przykład `8`.

### Jaki jest domyślny odstęp między wymiarami w AutoCADzie?

<Keyword id="Auto" /> polecenia PRZESTRZWYM to dwukrotna wysokość tekstu stylu wymiarowania. Polecenie <Command id="DIMBASELINE" /> używa zamiast tego „Odstępów między liniami bazowymi” stylu, 3,75 w ISO-25, dla każdego dodawanego wymiaru.

### Dlaczego polecenie PRZESTRZWYM nie przesuwa wymiaru?

Rozmieszcza tylko wymiary równoległe do bazowego: wymiar pod innym kątem jest liczony i zostaje na miejscu. Wymiary kątowe nie są jeszcze rozmieszczane.

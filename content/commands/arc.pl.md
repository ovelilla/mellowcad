---
title: "Polecenie ŁUK (ARC) w AutoCADzie"
metaTitle: "Łuk w AutoCADzie: polecenie ŁUK (ARC), 3 punkty"
description: "Jak narysować łuk w AutoCADzie poleceniem ŁUK (ARC, skrót U): przez trzy punkty, początek-środek-koniec lub środek-początek-koniec i zgodnie z zegarem z Ctrl."
figure: "Trzy łuki: przez trzy punkty, od początku wokół środka do końca oraz od środka, przez początek, do końca."
sourceHash: "af9b22e35456"
---

Polecenie ŁUK (ARC) domyślnie rysuje łuk przez trzy punkty: jego początek, punkt, przez który przechodzi, i jego koniec. Albo rysuje go wokół środka, od punktu początkowego do końca, tak jak uruchamiają go przyciski Początek, środek, koniec i Środek, początek, koniec na wstążce. Jak w AutoCADzie, łuk podany środkiem biegnie od początku przeciwnie do ruchu wskazówek zegara, a koniec wyznacza tylko, gdzie łuk się zatrzymuje: nie musi leżeć na łuku. Gdy umieszczasz punkty, łuk podąża za kursorem, z bursztynową przerywaną linią od początku lub od środka. Łuk leży w płaszczyźnie swojego pierwszego punktu. Łuk, którego nie da się utworzyć, trzy punkty na jednej prostej albo koniec w punkcie początkowym, daje komunikat <Message id="invalid" /> i nic nie zostaje narysowane.

## Options

### Center

Przy pierwszym monicie: najpierw podaj środek, potem punkt początkowy i punkt końcowy. Przy drugim monicie, po początku: następny jest środek, potem koniec. Przy końcu w obu przypadkach przytrzymaj Ctrl, aby łuk biegł zgodnie z ruchem wskazówek zegara.

## Missing

Opcje, które kończą łuk jego kątem, długością cięciwy, kierunkiem lub promieniem zamiast punktu końcowego, oraz Koniec przy drugim punkcie, który do nich prowadzi; brakuje też przycisków wstążki dla tych sposobów. Kontynuacja: Enter przy pierwszym monicie, który w AutoCADzie rysuje łuk styczny do ostatniej linii lub łuku, tu kończy polecenie ŁUK. Pole kąta rozwarcia, które wprowadzanie dynamiczne pokazuje na końcu trybów ze środkiem.

## Questions

### Jak się nazywa polecenie ŁUK po angielsku i jaki ma skrót?

Po angielsku ARC, w polskim AutoCADzie ŁUK: wpisz `U`, potem naciśnij Enter albo spację. Angielskie `A` w polskim AutoCADzie nie działa; `_ARC` działa w AutoCADzie w każdym języku.

### Jak narysować łuk przez trzy punkty w AutoCADzie?

Uruchom polecenie ŁUK i podaj trzy punkty: początek, dowolny punkt, przez który łuk przechodzi, i koniec. To sposób domyślny, bez wybierania opcji.

### Dlaczego łuk rysuje się w złą stronę?

Łuk rysowany od środka biegnie od początku przeciwnie do ruchu wskazówek zegara, jak w AutoCADzie. Zamień początek z końcem albo przytrzymaj Ctrl, podając punkt końcowy, aby łuk biegł zgodnie z ruchem wskazówek zegara.

### Jak narysować łuk styczny do dwóch linii?

Użyj polecenia <Command id="FILLET" /> z promieniem: rysuje łuk styczny do obu linii i przycina je do niego. Łuk styczny do poprzedniego segmentu narysuj w polilinii, opcją łuku polecenia <Command id="PLINE" />.

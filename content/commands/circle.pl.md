---
title: "Okrąg w AutoCADzie: polecenie OKRĄG (CIRCLE)"
metaTitle: "Okrąg w AutoCADzie: polecenie OKRĄG (CIRCLE)"
description: "Jak narysować okrąg w AutoCADzie poleceniem OKRĄG (CIRCLE, skrót O): środek i promień lub średnica, 2P, 3P i Ssr, okrąg styczny do dwóch obiektów."
figure: "Trzy okręgi: środek i promień, dwa końce średnicy (2P) oraz środek i średnica."
sourceHash: "62e25bc029f9"
---

Polecenie OKRĄG (CIRCLE) rysuje okrąg na podstawie środka i promienia, wpisanego lub podanego punktem na okręgu, albo jednym z innych sposobów, które proponuje jego pierwszy monit. Enter przy promieniu powtarza rozmiar ostatniego okręgu, zapamiętany w rysunku. Gdy podajesz promień, od środka do kursora biegnie bursztynowa przerywana linia, a przy podawaniu średnicy wychodzi poza okrąg, tak jak rysuje ją AutoCAD. Okrąg leży w płaszczyźnie swojego pierwszego punktu, na bieżącym poziomie, jeśli punkt nie ma własnej współrzędnej Z.

## Options

### 3P

Przez trzy punkty. Z lokalizacją Styczna przed każdym punktem, `STY` lub `_TAN`, jest to sposób Sty, sty, sty z AutoCADa: okrąg styczny do trzech obiektów.

### 2P

Z dwóch końców średnicy.

### Ttr

Styczny do dwóch obiektów, z promieniem: wskaż każdą linię, okrąg lub łuk blisko miejsca, w którym okrąg ma go dotykać, a potem podaj promień. Spośród pasujących okręgów rysuje ten, który dotyka najbliżej miejsc wskazania; gdy żaden nie pasuje, wypisuje <Message id="circleDoesNotExist" />.

### Diameter

Przy monicie o promień: zamiast niego podaj średnicę, wpisaną lub wskazaną punktem.

## Missing

Ssr na segmencie polilinii, który AutoCAD przyjmuje, a MellowCAD odrzuca; pozycja Sty, sty, sty na palecie narzędzi (wpisanie tego sposobu, czyli 3P z trzema lokalizacjami Styczna, działa); Szybkie właściwości po dwukrotnym kliknięciu okręgu.

## Questions

### Jak się nazywa polecenie OKRĄG po angielsku i jaki ma skrót?

Po angielsku CIRCLE, w polskim AutoCADzie OKRĄG: wpisz `O`, potem naciśnij Enter albo spację. Angielskie `C` w polskim AutoCADzie cofa ostatnią operację; `_CIRCLE` działa w AutoCADzie w każdym języku.

### Jak narysować okrąg styczny do dwóch linii?

Wybierz <Keyword id="Ttr" />, wskaż pierwszą linię, potem drugą, blisko miejsc, w których okrąg ma ich dotykać, i wpisz promień.

### Jak narysować okrąg styczny do trzech obiektów?

Wybierz <Keyword id="3P" /> i przed każdym z trzech punktów wpisz `STY`, wskazując każdy obiekt blisko miejsca, w którym okrąg ma go dotykać.

### Jak narysować okrąg o danej średnicy w AutoCADzie?

Podaj środek, potem wybierz <Keyword id="Diameter" /> i wpisz ją. Albo wybierz <Keyword id="2P" /> i podaj dwa końce średnicy.

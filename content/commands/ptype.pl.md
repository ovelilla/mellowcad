---
title: "Styl punktu w AutoCADzie: polecenie PTYPE"
description: "Jak zmienić styl punktu w AutoCADzie poleceniem PTYPE: okno Styl punktu, dwadzieścia kształtów, rozmiar, PDMODE i PDSIZE i czemu punktów nie widać."
figure: "PTYPE otwiera okno dialogowe Styl punktu; jego OK zapisuje PDMODE i PDSIZE, tu wpisane jako 35 i 8, a potem trzy punkty narysowane wewnątrz płytki."
sourceHash: "02cea384a2a9"
---

Polecenie PTYPE otwiera okno dialogowe Styl punktu, które ustala, jak rysowany jest każdy obiekt punktu w rysunku: te, które rysuje <Command id="POINT" />, i te, które zostawiają <Command id="DIVIDE" /> i <Command id="MEASURE" />. W angielskim AutoCADzie jego skrótem jest `DDPTYPE`, w polskim polecenie zachowuje angielską nazwę. Styl należy do rysunku, a nie do punktu: zmień go, a wszystkie punkty zmienią się naraz; zapisuje się razem z rysunkiem. Przycisk znajduje się obok ID punktu w panelu Narzędzia; wpisane z apostrofem, `'PTYPE`, otwiera się w trakcie innego polecenia.

Okno pokazuje dwadzieścia kształtów w czterech rzędach po pięć, z zaznaczonym bieżącym: kropka, nic, plus, krzyżyk i krótka kreska, a potem każdy z nich w okręgu, w kwadracie i w obu naraz. Pod nimi Rozmiar punktu i sposób jego odczytu: Ustal rozmiar względem ekranu, jako procent wysokości widoku, albo Ustal rozmiar w jednostkach rysunku. Domyślnie jest to 5% względem ekranu. OK zapisuje wybór jako jeden krok, który cofa <Command id="U" />; Anuluj lub Esc niczego nie zmienia. Rozmiar, który nie jest liczbą albo jest mniejszy od 0, zostaje odrzucony (Niewłaściwe dane wejściowe.), a okno pozostaje otwarte.

Okno zapisuje dwie zmienne, które można też wpisać w wierszu polecenia: PDMODE, kształt (od 0 do 4, plus 32 dla okręgu, 64 dla kwadratu, 96 dla obu: 35 to krzyżyk w okręgu), i PDSIZE, rozmiar (liczba dodatnia to jednostki rysunku, ujemna to procent ekranu, 0 to 5%).

## Missing

Przycisk Pomoc w oknie. Punkt o rozmiarze względem ekranu zachowuje ten rozmiar na ekranie przy zmianie powiększenia, podczas gdy AutoCAD zachowuje go tylko do następnej regeneracji rysunku.

## Questions

### Co to jest DDPTYPE w AutoCADzie?

Skrót polecenia PTYPE w angielskim AutoCADzie: oba otwierają okno dialogowe Styl punktu. W polskim AutoCADzie polecenie nazywa się tak samo, PTYPE, a `DDPTYPE` nie ma w jego pliku acad.pgp; `_PTYPE` działa w AutoCADzie w każdym języku.

### Dlaczego nie widać moich punktów?

Domyślny styl punktu to kropka szeroka na jeden piksel, którą zasłania przechodząca przez nią linia, a PDMODE 1 nie rysuje niczego. Otwórz okno poleceniem PTYPE i wybierz krzyżyk lub kształt w okręgu albo wpisz PDMODE i `3`. Z rozmiarem względem ekranu punkty pozostają widoczne przy każdym powiększeniu.

### Jak zmienić rozmiar punktów?

W oknie Styl punktu wpisz Rozmiar punktu: procent ekranu przy Ustal rozmiar względem ekranu, aby punkt zachowywał rozmiar przy zmianie powiększenia, albo jednostki rysunku przy Ustal rozmiar w jednostkach rysunku, aby rósł i malał razem z rysunkiem. Albo wpisz PDSIZE: wartość ujemna to procent.

### Czy jeden punkt może mieć własny styl?

Nie: w AutoCADzie i tutaj styl punktu należy do rysunku, a każdy obiekt punktu się do niego stosuje. Aby oznaczyć miejsca inaczej, wstaw w nich blok; <Command id="DIVIDE" /> i <Command id="MEASURE" /> mogą umieścić blok zamiast punktów.

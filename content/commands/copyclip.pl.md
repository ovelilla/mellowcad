---
title: "Kopiowanie do schowka w AutoCADzie: polecenie KOPIUJ_S (COPYCLIP)"
metaTitle: "Kopiowanie do schowka w AutoCADzie: Ctrl+C"
description: "Jak działa KOPIUJ_S (COPYCLIP, Ctrl+C) w AutoCADzie razem z WYTNIJ, KOPIUJBAZA i WKLEJ: kopiowanie obiektów do schowka i wklejanie ich w punkcie."
figure: "KOPIUJ_S otworu płyty, potem WKLEJ w 65,20: kopia ułożona tam swoim lewym dolnym narożnikiem, drugi otwór."
sourceHash: "f84c995e7c2b"
---

Polecenie KOPIUJ_S (COPYCLIP) kopiuje wybrane obiekty do schowka, razem z warstwami, stylami i blokami, których używają; rysunek się nie zmienia, a obiekty wybrane przed nim pozostają wybrane. Uruchamia je Ctrl+C, przerywając działające polecenie. <Command id="PASTECLIP" />, Ctrl+V, pyta potem o punkt wstawienia: obiekty podążają za kursorem i lądują lewym dolnym narożnikiem swojego zakresu w tym punkcie, w bieżącym układzie LUW, wszystko w jednym kroku, który cofa <Command id="U" />. Wklejać można do tego samego rysunku lub do innego: schowek jest systemowy, więc rysunek w innej karcie może go odczytać, jeśli przeglądarka pozwala stronie czytać schowek. Gdy wklejana warstwa, styl lub blok ma nazwę, którą rysunek już ma, używany jest ten z rysunku.

<Command id="CUTCLIP" />, Ctrl+X, kopiuje obiekty i wymazuje je, tak jak WYMAŻ. <Command id="COPYBASE" />, Ctrl+Shift+C, najpierw pyta o punkt bazowy, a WKLEJ umieszcza potem obiekty według tego punktu zamiast narożnika, więc lądują dokładnie tam, gdzie chcesz. Ctrl+A wybiera wszystkie obiekty rysunku.

## Missing

WKLEJBLOK i WYTNIJBAZA, a więc Ctrl+Shift+V i Ctrl+Shift+X, które zostają przeglądarce, podobnie jak Ctrl+Shift+A. WKLEJORYG, WKLEJ_S, przeciąganie obiektów między oknami oraz tekst z innego programu wklejany jako tekst wielowierszowy. Ukryte opcje polecenia WSTAW przy punkcie polecenia WKLEJ, więc wklejanego obiektu nie można przy tym skalować, obracać ani rozbijać.

## Questions

### Czym się różni KOPIUJ od KOPIUJ_S?

<Command id="COPY" /> umieszcza kopie w tym samym rysunku, od punktu bazowego do drugiego punktu. KOPIUJ_S umieszcza obiekty w schowku, aby wkleić je poleceniem WKLEJ do tego rysunku lub do innego.

### Jak kopiować z punktem bazowym w AutoCADzie?

Naciśnij Ctrl+Shift+C albo wpisz `KOPIUJBAZA`, podaj punkt bazowy i wybierz obiekty. Ctrl+V umieszcza je potem według tego punktu.

### Jak skopiować obiekty z jednego rysunku do drugiego?

Wybierz je i naciśnij Ctrl+C, otwórz drugi rysunek i naciśnij Ctrl+V, a potem wskaż punkt wstawienia. Ich warstwy, style i bloki przechodzą razem z nimi.

### Dlaczego wklejanie nie działa?

Przeglądarka może zapytać, czy strona może czytać schowek: zezwól. Jeśli przeglądarka odmówi dostępu, WKLEJ wkleja to, co ostatnio skopiowano na tej samej stronie. Gdy nic nie skopiowano, niczego nie wkleja.

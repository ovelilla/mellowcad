---
title: "Polecenie UZGWŁAŚCIWOŚCI (MATCHPROP) w AutoCADzie"
metaTitle: "UZGWŁAŚCIWOŚCI (MATCHPROP) w AutoCADzie"
description: "Jak skopiować właściwości w AutoCADzie poleceniem UZGWŁAŚCIWOŚCI (MATCHPROP, skrót UZG): warstwa, kolor, rodzaj i szerokość linii, style. Wypróbuj online."
figure: "Płytka i jej otwór, pionowa oś czerwona i z rodzajem Center na swojej warstwie, oraz pozioma linia na warstwie 0, którą UZGWŁAŚCIWOŚCI zamienia w taką samą oś."
sourceHash: "603d5ab849b1"
---

Polecenie UZGWŁAŚCIWOŚCI (MATCHPROP) kopiuje właściwości jednego obiektu na inne: to pędzel Uzgodnij właściwości z AutoCADa. Wskaż obiekt źródłowy albo wybierz go przed poleceniem; przyjmuje też obiekt na zablokowanej warstwie. Potem polecenie podaje, które właściwości kopiuje, w wierszu bieżących ustawień z ich listą, i pyta o obiekty docelowe: każde wskazanie lub okno maluje je od razu, aż Enter zakończy polecenie. Obiekt docelowy na zablokowanej warstwie zostaje bez zmian, z komunikatem <Message id="matchpropLockedDestination" />. Kursor niesie pędzel AutoCADa, a całe uruchomienie to jeden krok, który cofa <Command id="U" />. Wpisane z apostrofem, `'UZGWŁAŚCIWOŚCI`, działa wewnątrz innego polecenia.

Kopiuje to, co domyślnie zaznaczają Ustawienia właściwości: warstwę, kolor i szerokość linii; rodzaj linii, z wyjątkiem kreskowań, tekstu wielowierszowego i definicji atrybutów; grubość; między tekstami styl, wysokość i obrót, a z jednego tekstu jednowierszowego na inny także wyrównanie; między wymiarami styl wymiarowania; między kreskowaniami wzór, skalę i kąt, ale nie punkt początkowy.

## Missing

Opcja Ustawienia i jej okno dialogowe Ustawienia właściwości: każda znana właściwość jest zawsze kopiowana, a pierwszy monit nie wymienia opcji ustawień. Skala rodzaju linii, przezroczystość i styl wydruku, których obiekty tutaj nie mają; szerokości polilinii, współczynnik szerokości i kąt pochylenia tekstu oraz właściwości opisowe. Podgląd zmiany pod kursorem, który pokazuje AutoCAD.

## Questions

### Jak się nazywa polecenie UZGWŁAŚCIWOŚCI po angielsku?

MATCHPROP. W polskim AutoCADzie jego skróty to `UZG` i `MALARZ`: wpisz jeden z nich i naciśnij Enter lub spację. Angielskie `MA` i `PAINTER` w polskiej wersji nie działają; pełna nazwa `UZGWŁAŚCIWOŚCI` działa, a `_MATCHPROP` – w AutoCADzie w każdym języku.

### Jak skopiować właściwości jednej linii na inną?

Uruchom polecenie UZGWŁAŚCIWOŚCI, wskaż linię, której właściwości chcesz przenieść, potem wskaż linie, które mają je przejąć, i naciśnij Enter. Trafiają na jej warstwę, z jej kolorem, rodzajem linii i szerokością linii.

### Dlaczego Uzgodnij właściwości nie działa?

Obiekt docelowy na zablokowanej warstwie nie zostaje zmieniony: najpierw odblokuj warstwę. Właściwość jest kopiowana tylko między obiektami, które ją mają: styl wymiarowania trafia tylko do wymiarów, styl tekstu tylko do tekstów, wzór tylko do kreskowań. A rodzaj linii nie jest kopiowany na kreskowanie ani na tekst wielowierszowy, jak w AutoCADzie.

### Jak uzgodnić właściwości wymiaru lub kreskowania?

Wskaż wymiar jako źródło, a inne wymiary jako cele: przejmują jego styl wymiarowania, razem z warstwą i kolorem. Kreskowanie przekazuje innym kreskowaniom swój wzór, skalę i kąt, a każde zachowuje własny punkt początkowy.

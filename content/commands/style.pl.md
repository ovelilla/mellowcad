---
title: "Styl tekstu w AutoCADzie: polecenie STYL (STYLE)"
description: "Jak polecenie STYL (STYLE, skrót ST) w AutoCADzie zarządza stylami tekstu: nowy, zmiana nazwy, usuwanie, ustawianie bieżącego, stała wysokość."
figure: "Tabliczka znamionowa: STYL, potem TEKST, którego Styl ? wypisuje styl rysunku, Standard w kroju Arial, oraz napisana nim nazwa tabliczki."
sourceHash: "dc2db204a8ac"
---

Polecenie STYL (STYLE) zarządza stylami tekstu rysunku: tym, czym tekst jest pisany. Każdy tekst, tekst wielowierszowy i atrybut ma styl, a nowe otrzymują styl bieżący, w nowym rysunku Standard. STYL otwiera okno dialogowe Styl tekstu, jak w AutoCADzie. Zbiór wskazań wybrany wcześniej zostaje odrzucony, tak jak odrzuca go okno dialogowe, a wpisane z apostrofem wewnątrz innego polecenia, `'STYL`, otwiera okno bez kończenia tamtego polecenia, które trwa dalej po zamknięciu okna.

Okno dialogowe podaje bieżący styl i wymienia style, wszystkie albo tylko używane. Nowy... pyta o nazwę, proponując `style1`, `style2`… – pierwszą wolną – i tworzy kopię zaznaczonego stylu, ustawioną jako bieżąca. Ustaw bieżącą ustawia zaznaczony styl jako bieżący; F2 edytuje jego nazwę, a nazwa już używana, bez względu na wielkość liter, jest odrzucana, tak jak w AutoCADzie. Usuń usuwa styl, ale nigdy Standard, bieżący styl ani styl w użyciu. Wysokość nadaje stylowi stałą wysokość, przyjmowaną przyciskiem Zastosuj: 0, wartość domyślna, pozostawia ją dowolną, więc <Command id="TEXT" /> za każdym razem o nią pyta; przy ustalonej wysokości TEKST nie pyta. Anuluj odrzuca niezastosowaną wysokość i zmienia się w Zamknij, gdy coś zostało zmienione. Wszystko, co zrobisz w oknie dialogowym, to jeden krok, który cofa <Command id="U" />. Gdy zaznaczone są teksty, wiersz Styl w palecie Właściwości nadaje im inny styl, w jednym kroku.

## Missing

Podgląd okna dialogowego. Czcionka, styl czcionki i duża czcionka, współczynnik szerokości, kąt pochylenia oraz efekty Do góry nogami, Wstecz i Pionowo: każdy styl jest rysowany krojem Arial, bez pochylenia, ze współczynnikiem szerokości 1. Style opisowe i styl Annotative, który nowy rysunek AutoCADa ma obok stylu Standard. Polecenie `-STYL`, które pyta o wszystko w wierszu polecenia.

## Questions

### Jak się nazywa polecenie STYL po angielsku?

STYLE. W polskim AutoCADzie wpisz `ST` lub pełną nazwę `STYL` i naciśnij Enter lub spację; działa też `ODSTYL`. `_STYLE` działa w AutoCADzie w każdym języku.

### Jak zmienić styl tekstu w AutoCADzie?

Dla nowego tekstu ustaw styl jako bieżący przyciskiem Ustaw bieżącą w oknie dialogowym, które otwiera STYL, albo opcją <Keyword command="TEXT" id="Style" /> polecenia <Command id="TEXT" />. Dla tekstu już napisanego zaznacz go i wybierz styl w wierszu Styl palety Właściwości. Lista Styl tekstu na wstążce (Opisz › Tekst, a także rozwinięty panel Narzędzia główne › Opis) robi jedno i drugie: gdy tekst jest zaznaczony, zmienia jego styl, a gdy nic nie jest zaznaczone, ustawia styl jako bieżący.

### Jak zmienić czcionkę stylu tekstu?

W AutoCADzie w polu Nazwa czcionki okna dialogowego Styl tekstu. Tutaj jeszcze nie: każdy styl jest rysowany krojem Arial, a style różnią się tylko nazwą i wysokością.

### Dlaczego TEKST nie pyta o wysokość?

Bieżący styl ma własną wysokość. Ustaw jego wysokość na 0 w oknie dialogowym Styl tekstu, potem Zastosuj, a <Command id="TEXT" /> znów zapyta o wysokość, proponując ostatnio użytą.

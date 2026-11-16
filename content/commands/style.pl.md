---
title: "Styl tekstu w AutoCADzie: polecenie STYL (STYLE)"
description: "Jak polecenie STYL (STYLE, skrót ST) w AutoCADzie zarządza stylami tekstu: nowy, zmiana nazwy, usuwanie, ustawianie bieżącego, stała wysokość."
figure: "Tabliczka znamionowa: STYL, potem TEKST, którego Styl ? wypisuje styl rysunku, Standard w kroju Arial, i napisaną nim nazwę tabliczki."
sourceHash: "8c15a1a95e66"
---

Polecenie STYL (STYLE) zarządza stylami tekstu rysunku: tym, czym tekst jest pisany. Każdy tekst, tekst wielowierszowy i atrybut ma styl, a nowe otrzymują styl bieżący, w nowym rysunku Standard. W AutoCADzie STYL otwiera okno dialogowe Styl tekstu; MellowCAD jeszcze go nie ma, więc STYL otwiera tabelę tekstu w palecie Style, gdzie są też style wymiarowania polecenia <Command id="DIMSTYLE" />. Zbiór wskazań wybrany wcześniej zostaje odrzucony, tak jak odrzuca go okno dialogowe, a wpisane z apostrofem wewnątrz polecenia, `'STYL`, otwiera się bez kończenia tego polecenia.

Tabela wymienia style i zaznacza bieżący. Nowy tworzy kopię zaznaczonego stylu o nazwie `style1`, `style2`… – pierwszej wolnej – i ustawia ją jako bieżącą. Ustaw jako bieżący ustawia styl jako bieżący; jego nazwę można wpisać ponownie, a nazwa już używana, bez względu na wielkość liter, jest odrzucana, tak jak w AutoCADzie. Usuń usuwa styl, ale nigdy Standard, bieżący styl ani styl w użyciu. Wysokość nadaje stylowi stałą wysokość: 0, wartość domyślna, pozostawia ją dowolną, więc <Command id="TEXT" /> za każdym razem o nią pyta; przy ustalonej wysokości TEKST nie pyta. Każda zmiana to krok, który cofa <Command id="U" />. Gdy zaznaczone są teksty, wiersz Styl w palecie Właściwości nadaje im inny styl, w jednym kroku.

## Missing

Okno dialogowe Styl tekstu i jego podgląd: STYL otwiera zamiast niego paletę Style. Czcionka, styl czcionki i duża czcionka, współczynnik szerokości, kąt pochylenia oraz efekty Do góry nogami, Wstecz i Pionowo: każdy styl jest rysowany krojem Arial, prosto, ze współczynnikiem szerokości 1. Style opisowe i styl Annotative, który nowy rysunek AutoCADa ma obok stylu Standard. Polecenie `-STYL`, które pyta o wszystko w wierszu polecenia.

## Questions

### Jak się nazywa polecenie STYL po angielsku?

STYLE. W polskim AutoCADzie wpisz `ST` lub pełną nazwę `STYL` i naciśnij Enter lub spację; działa też `ODSTYL`. `_STYLE` działa w AutoCADzie w każdym języku.

### Jak zmienić styl tekstu w AutoCADzie?

Dla nowego tekstu ustaw styl jako bieżący w palecie Style, którą otwiera STYL, albo opcją <Keyword command="TEXT" id="Style" /> polecenia <Command id="TEXT" />. Dla tekstu już napisanego zaznacz go i wybierz styl w wierszu Styl palety Właściwości.

### Jak zmienić czcionkę stylu tekstu?

W AutoCADzie w polu Nazwa czcionki okna dialogowego Styl tekstu. Tutaj jeszcze nie: każdy styl jest rysowany krojem Arial, a style różnią się tylko nazwą i wysokością.

### Dlaczego TEKST nie pyta o wysokość?

Bieżący styl ma własną wysokość. Ustaw jego wysokość na 0 w palecie Style, a <Command id="TEXT" /> znów zapyta o wysokość, proponując ostatnio użytą.

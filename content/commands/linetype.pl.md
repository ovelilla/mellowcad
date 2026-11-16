---
title: "Rodzaje linii w AutoCADzie: polecenie RODZLIN (LINETYPE)"
metaTitle: "Rodzaje linii w AutoCADzie: RODZLIN (LINETYPE)"
description: "Jak wczytać rodzaj linii w AutoCADzie poleceniem RODZLIN (LINETYPE, RL): acadiso.lin, bieżący rodzaj, JakWarstwa i czemu linia przerywana wygląda na ciągłą."
figure: "Płytka, której otwór narysowano z bieżącym rodzajem HIDDEN, a dwie osie z CENTER, po czym RODZLIN przywraca JakWarstwa."
sourceHash: "d15530a865c1"
---

Polecenie RODZLIN (LINETYPE) ustala rodzaj linii, którym rysowane są nowe obiekty. AutoCAD otwiera Menedżer rodzajów linii; MellowCAD jeszcze go nie ma, więc polecenie RODZLIN uruchamia wersję dla wiersza polecenia, którą AutoCAD również ma, <Command id="-LINETYPE" />. Podaje bieżący rodzaj linii, na początku `JakWarstwa`, i po każdej odpowiedzi znów pyta o opcję, aż Enter je zakończy. JakWarstwa oznacza, że każdy obiekt bierze rodzaj linii swojej warstwy; rodzaj podany z nazwy jest własnym rodzajem obiektu. Całe uruchomienie to jeden krok, który cofa <Command id="U" />, a wpisane z apostrofem wewnątrz polecenia ustala rodzaj linii dla tego, co to polecenie narysuje dalej.

Rysunek przechowuje własne rodzaje linii, zapisywane razem z nim i w jego pliku DXF. Nowy ma ich sześć: Continuous oraz, z metrycznego pliku AutoCADa acadiso.lin, DASHED, HIDDEN, CENTER, PHANTOM i DASHDOT; pozostałe wczytuje się z acadiso.lin, a plik DXF przynosi własne, także ISO i złożone, których tekst, taki jak `GAS` w GAS_LINE, rysowany jest wzdłuż linii. Wzór jest układany na każdej linii tak jak w AutoCADzie: wyśrodkowany na jej długości, z równymi kreskami na obu końcach, przeskalowany przez <Command id="LTSCALE" /> i przez własną skalę rodzaju linii obiektu, którą ustawiają <Command id="CHPROP" /> i paleta Właściwości, a nowym obiektom nadaje CELTSCALE.

## Options

### ?

Wyświetla rodzaje linii w dwóch kolumnach: nazwa i opis. Przy monicie opcji pyta, który plik wyświetlić, domyślnie acadiso.lin albo acad.lin, plik AutoCADa w calach, i podaje jego rodzaje linii w kolejności pliku; przy monicie opcji <Keyword id="Set" /> – rodzaje wczytane do rysunku, których nazwy pasują do wpisanego tekstu, wszystkie przy `*`, posortowane według nazwy.

### Load

Pyta, które rodzaje linii wczytać, jedną nazwę lub kilka oddzielonych przecinkami, także z symbolami wieloznacznymi (`DASH*`), a potem, w którym pliku szukać: najpierw w acadiso.lin, później w ostatnio przeszukanym. Każdy znaleziony zostaje wczytany i wymieniony, w kolejności pliku; o rodzaj już wczytany najpierw pyta, a <Keyword id="Yes" />, odpowiedź domyślna, wczytuje go ponownie. Nazwa, której plik nie zawiera, albo plik inny niż acadiso.lin i acad.lin zostaje zgłoszony.

### Set

Pyta o nazwę rodzaju linii, proponując bieżący; wpisz nazwę wczytanego rodzaju albo <Keyword id="BYLayer" />. Rodzaj, który ma acadiso.lin, zostaje najpierw wczytany, jak robi to AutoCAD; żaden inny nie zostaje znaleziony, co polecenie zgłasza tak jak AutoCAD, i wraca monit opcji. Enter zostawia bieżący.

## Missing

Menedżer rodzajów linii oraz tworzenie rodzajów linii i wczytywanie ich z własnego pliku. Kształty złożonych rodzajów linii, takich jak BATTING czy ZIGZAG, rysowane jako przerwy w ich miejscu. JakBlok. PSLTSCALE i MSLTSCALE, bo nie ma obszaru papieru. Pliki acadiso.lin AutoCADa w poszczególnych językach, z których hiszpański czy niemiecki AutoCAD wczytuje własne nazwy (TRAZOS, STRICHLINIE): opcja <Keyword id="Load" /> czyta angielski w każdym języku, choć rysunek zrobiony z ich użyciem otwiera się z własnymi. PLINEGEN: nowa polilinia zaczyna wzór od nowa przy każdym wierzchołku, chyba że włączy go opcja <Keyword command="PEDIT" id="Ltype gen" /> polecenia <Command id="PEDIT" />.

## Questions

### Jak się nazywa polecenie RODZLIN po angielsku?

LINETYPE. W polskim AutoCADzie jego skróty to `RL` i `ODRODZLIN`: wpisz jeden z nich i naciśnij Enter lub spację. Angielskie `LT`, `LTYPE` i `DDLTYPE` w polskiej wersji nie działają; pełna nazwa `RODZLIN` działa, a `_LINETYPE` – w AutoCADzie w każdym języku.

### Dlaczego linia przerywana wygląda na ciągłą?

Linia krótsza niż jedno powtórzenie wzoru jest rysowana jako ciągła, jak w AutoCADzie: wzór CENTER przy domyślnej skali ma około 51 jednostek. Zwiększ lub zmniejsz <Command id="LTSCALE" />, aby dopasować wzór do rysunku. Sprawdź też, czy rodzaj linii obiektu, albo jego warstwy, gdy jest JakWarstwa, nie jest Continuous.

### Jak zmienić rodzaj linii istniejącego obiektu?

Wybierz obiekt i wybierz rodzaj linii w wierszu Rodzaj linii na palecie Właściwości albo skopiuj go z innego obiektu poleceniem <Command id="MATCHPROP" />. Polecenie RODZLIN ustala tylko rodzaj linii obiektów rysowanych po nim.

### Jak zmienić skalę rodzaju linii w AutoCADzie?

Wpisz <Command id="LTSCALE" /> i nowy współczynnik: 2 wydłuża dwukrotnie każdą kreskę w całym rysunku.

### Jak wczytać rodzaj linii w AutoCADzie?

AutoCAD wczytuje go w Menedżerze rodzajów linii. Tutaj wpisz `-RODZLIN`, wybierz <Keyword id="Load" />, wpisz nazwę rodzaju linii, na przykład `HIDDEN2` lub `ACAD_ISO02W100`, i naciśnij Enter, aby przeszukać acadiso.lin. <Keyword id="Set" /> wczytuje rodzaj, który ma acadiso.lin, od razu ustawiając go jako bieżący.

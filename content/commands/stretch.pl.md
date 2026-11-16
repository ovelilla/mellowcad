---
title: "Polecenie ROZCIĄGNIJ (STRETCH) w AutoCADzie"
description: "Jak działa polecenie ROZCIĄGNIJ (STRETCH, skrót ROZC) w AutoCADzie: okno przecinające, punkt bazowy i drugi oraz dlaczego obiekty czasem się tylko przesuwają."
figure: "Prostokąt i okrąg rozciągnięte o 40 w prawo oknem przecinającym obejmującym prawą stronę: narożniki wewnątrz okna przesuwają się, a okrąg razem z nimi."
sourceHash: "de8671fb4290"
---

Polecenie ROZCIĄGNIJ (STRETCH) przesuwa część rysunku objętą oknem przecinającym i rozciąga to, co łączy ją z resztą. Wybierz obiekty oknem przecinającym, przeciąganym od prawej do lewej, albo wielobokiem przecinającym, obejmując końce i wierzchołki do przesunięcia; potem podaj punkt bazowy i drugi punkt, jak w poleceniu <Command id="MOVE" />. To, co okno obejmuje, przesuwa się o tę odległość: końce linii, wierzchołki polilinii, końce łuku, obwiednia kreskowania, początki linii pomocniczych wymiaru. To, co leży całkowicie w oknie, przesuwa się w całości; okrąg, tekst lub odnośnik bloku przesuwa się, gdy jego środek lub punkt wstawienia leży w oknie. Obiekty wskazane pojedynczo albo wybrane zwykłym oknem również przesuwają się w całości. Rozciągnięcie to jeden krok, który można cofnąć.

## Options

### Displacement

Wybierana w monicie o punkt bazowy albo klawiszem Enter, bo jest tam domyślna: pyta o przesunięcie jako wektor, `40,0` rozciąga o 40 wzdłuż X. Przy drugim punkcie Enter robi to samo z punktem bazowym: jego współrzędne są przesunięciem.

## Missing

Łuk eliptyczny z jednym końcem w oknie, który AutoCAD przekształca: tutaj przesuwa się w całości, gdy jego środek jest w oknie, a w przeciwnym razie zostaje na miejscu. Niezespolone kreskowanie objęte częściowo, które AutoCAD pozostawia na miejscu. Tekst wymiaru w domyślnym położeniu zostaje na miejscu, gdy okno obejmuje tylko ten tekst.

## Questions

### Jak się nazywa polecenie ROZCIĄGNIJ po angielsku?

STRETCH. W polskim AutoCADzie wpisz `ROZC` lub pełną nazwę `ROZCIĄGNIJ` i naciśnij Enter lub spację; skrót `S` z wersji angielskiej uruchamia w polskiej polecenie SKALA. `_STRETCH` działa w AutoCADzie w każdym języku.

### Dlaczego ROZCIĄGNIJ tylko przesuwa obiekty?

Bo cały obiekt jest wewnątrz okna albo został wskazany pojedynczo: takie obiekty ROZCIĄGNIJ przesuwa w całości. Przeciągnij okno przecinające, od prawej do lewej, obejmując tylko te końce, które chcesz przesunąć.

### Jak rozciągnąć o dokładną odległość w AutoCADzie?

Podaj punkt bazowy, a potem wpisz przesunięcie: `40,0` rozciąga o 40 wzdłuż X, względem punktu bazowego przy włączonym wprowadzaniu dynamicznym. Albo skieruj kursor w odpowiednią stronę w trybie orto lub ze śledzeniem biegunowym i wpisz tylko odległość.

### Czy można rozciągnąć blok w AutoCADzie?

Odnośnik bloku przesuwa się w całości, gdy jego punkt wstawienia leży w oknie, a w przeciwnym razie zostaje na miejscu: jego zawartość się nie rozciąga. Aby rozciągnąć jego części, najpierw go rozbij poleceniem <Command id="EXPLODE" />.

---
title: "Polecenie PRZESUŃ (MOVE) w AutoCADzie"
description: "Jak przesunąć obiekt w AutoCADzie poleceniem PRZESUŃ (MOVE, skrót PRS): punkt bazowy i drugi punkt albo przemieszczenie wpisane jako X,Y,Z. Wypróbuj online."
figure: "Okrąg przesunięty o 50 w prawo: wskazany, jego środek jako punkt bazowy, drugi punkt wpisany."
sourceHash: "753ca38448bf"
---

Polecenie PRZESUŃ (MOVE) przenosi wybrane obiekty z jednego miejsca w inne: wybierz je, podaj punkt bazowy, a potem drugi punkt, i przesuną się o odległość i w kierunku od pierwszego do drugiego. Nic innego się w nich nie zmienia. Jak w AutoCADzie, przesuwane są obiekty wybrane przed poleceniem, punkt można wskazać, określić lokalizacją względem obiektu lub wpisać, a gdy wybierasz drugi punkt, zbiór podąża za kursorem, z linią od punktu bazowego. Przesunięcie to jeden krok, który cofa polecenie COFAJ.

## Options

### Displacement

Wybierana przy monicie o punkt bazowy albo Enterem, bo jest tam wartością domyślną: pyta o przesunięcie jako wektor – `10,5` przesuwa o 10 wzdłuż X i o 5 wzdłuż Y – z wartością domyślną równą ostatniemu przesunięciu polecenia PRZESUŃ w tym rysunku. Przy drugim punkcie Enter robi to samo z punktem bazowym: jego współrzędne są przesunięciem.

## Missing

Dwa tryby wyboru AutoCADa przy monicie o obiekty, Grupa i Wiele, oraz wybieranie z klawiszem Ctrl powierzchni, krawędzi lub wierzchołków bryły, aby zmienić jej kształt. Gdy zbiór podąża za kursorem, ma kolor każdego obiektu, ale nie jego rodzaj ani szerokość linii, a wszystkie obiekty odnośnika bloku mają kolor odnośnika.

## Questions

### Jak się nazywa polecenie PRZESUŃ po angielsku?

MOVE. W polskim AutoCADzie jego skrót to `PRS`: wpisz go i naciśnij Enter lub spację. Angielskie `M` w polskiej wersji uruchamia polecenie MODEL; pełna nazwa `PRZESUŃ` działa, a `_MOVE` – w AutoCADzie w każdym języku.

### Jak przesunąć obiekt o zadaną odległość?

Podaj punkt bazowy, a potem wpisz przesunięcie jako drugi punkt: `50,0` przesuwa o 50 wzdłuż X. Przy włączonym wprowadzaniu dynamicznym, a tak jest na początku, punkt po pierwszym jest względny, więc historia zapisuje go jako `@50,0`. Albo skieruj kursor w stronę ruchu, z trybem orto lub śledzeniem biegunowym, i wpisz tylko odległość.

### Jak przesunąć obiekty w górę w 3D?

Podaj przesunięcie ze współrzędną Z: `0,0,5` jako drugi punkt albo jako <Keyword id="Displacement" /> podnosi zbiór o 5. Punkt wpisany bez Z leży na bieżącym poziomie.

### Czym się różni PRZESUŃ od ROZCIĄGNIJ (STRETCH)?

Polecenie PRZESUŃ przesuwa całe obiekty. <Command id="STRETCH" /> przesuwa tylko końce i wierzchołki wewnątrz swojego okna przecinającego i rozciąga obiekty, do których należą.

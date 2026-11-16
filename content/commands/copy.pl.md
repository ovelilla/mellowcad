---
title: "Polecenie KOPIUJ (COPY) w AutoCADzie"
metaTitle: "Jak kopiować w AutoCADzie: polecenie KOPIUJ"
description: "Jak kopiować w AutoCADzie poleceniem KOPIUJ (COPY, skrót K): punkt bazowy, potem dowolnie wiele kopii, z Cofaj i Zakończ, albo jedna o przesunięcie."
figure: "Okrąg skopiowany trzy razy wzdłuż X z jednego punktu bazowego, potem Enter."
sourceHash: "e74bbdabf97c"
---

Polecenie KOPIUJ (COPY) umieszcza kopie wybranych obiektów: wybierz je, podaj punkt bazowy, a potem drugi punkt dla każdej kopii. Jak w AutoCADzie, którego tryb kopiowania to domyślnie Wiele, pyta o kolejną kopię, dopóki nie naciśniesz Enter albo nie wybierzesz opcji Zakończ, a każda kopia jest odmierzana od tego samego punktu bazowego. Kopie zachowują warstwę, kolor i wszystkie inne właściwości obiektów. Obiekty wybrane przed poleceniem są tymi, które kopiuje, a gdy umieszczasz kopię, zestaw podąża za kursorem.

## Options

### Displacement

Wybierana przy monicie o punkt bazowy albo Enterem w tym miejscu: pyta o jedno przesunięcie jako wektor, `30,0` umieszcza jedną kopię 30 wzdłuż X, i kończy. Jej wartością domyślną jest ostatnie przesunięcie użyte przez KOPIUJ w tym rysunku.

### Exit

Kończy polecenie, tak jak Enter po umieszczeniu kopii.

### Undo

Cofa ostatnią umieszczoną kopię. Cofnięcie pierwszej daje komunikat <Message id="commandCompletelyUndone" /> i ponownie pyta o drugi punkt.

## Missing

Tryb Jedna zmiennej COPYMODE (jedna kopia i koniec) nie jest dostępny: KOPIUJ zawsze działa w trybie Wiele, więc monit o punkt bazowy wymienia tylko <Keyword id="Displacement" />. Opcja Szyk przy drugim punkcie, rząd równo rozmieszczonych kopii w AutoCADzie, także nie jest dostępna.

## Questions

### Jak się nazywa polecenie KOPIUJ po angielsku i jaki ma skrót?

Po angielsku COPY, w polskim AutoCADzie KOPIUJ: wpisz `K`, potem naciśnij Enter albo spację. Angielskie `CO` i `CP` w polskim AutoCADzie nie działają; `_COPY` działa w AutoCADzie w każdym języku.

### Jak zrobić kilka kopii naraz w AutoCADzie?

Umieszczaj dalej: każdy podany punkt to kolejna kopia z tego samego punktu bazowego, aż do Enter. Kopie w wierszach, kolumnach lub wokół środka <Command id="ARRAY" /> tworzy za jednym razem.

### Jak skopiować obiekt o zadaną odległość?

Podaj punkt bazowy, a potem wpisz drugi punkt jako odległość: `30,0` kopiuje obiekt 30 wzdłuż X, bo wprowadzanie dynamiczne odczytuje punkt po pierwszym względem niego. Albo skieruj kursor w żądaną stronę, z trybem orto lub śledzeniem biegunowym, i wpisz tylko odległość.

### Dlaczego w poleceniu KOPIUJ nie ma opcji Szyk?

MellowCAD jeszcze jej nie oferuje. Rząd równo rozmieszczonych kopii daje <Command id="ARRAYRECT" /> z jednym wierszem, który zachowuje je jako jeden szyk do edycji.

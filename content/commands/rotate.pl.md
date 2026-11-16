---
title: "Polecenie OBRÓĆ (ROTATE) w AutoCADzie"
description: "Jak obrócić obiekt w AutoCADzie poleceniem OBRÓĆ (ROTATE, skrót OB): punkt bazowy i kąt, Kopiuj z zachowaniem oryginału, Odniesienie."
figure: "Prostokąt obrócony o 30° wokół narożnika z opcją Kopiuj: oryginał zostaje na miejscu."
sourceHash: "0e5ae021e108"
---

Polecenie OBRÓĆ (ROTATE) obraca wybrane obiekty wokół punktu bazowego: wybierz je, podaj punkt bazowy, a potem kąt – wpisany albo wskazany jako punkt, którego kierunek od punktu bazowego wyznacza kąt. Pierwszy wiersz podaje, który kierunek jest dodatni, domyślnie przeciwny do ruchu wskazówek zegara (ANGDIR), i gdzie leży 0 (ANGBASE). Enter przy kącie powtarza ostatni obrót, w nowym rysunku 0. Obiekty obracają się wokół osi równoległej do osi Z układu LUW, przechodzącej przez punkt bazowy, więc w 3D zachowują swoją wysokość. Obrót to jeden krok, który można cofnąć.

## Options

### Copy

Obraca kopię i pozostawia obiekty na miejscu, wyświetlając <Message id="rotatingCopy" />. Następnie ponownie pyta o kąt.

### Reference

Obraca od kąta, jaki obiekty mają, do kąta, jaki mają mieć: pyta o kąt odniesienia (wpisany albo zmierzony dwoma punktami), a potem o nowy kąt, i obraca o różnicę. Aby wypoziomować ukośną krawędź, wskaż jej dwa końce jako odniesienie i wpisz 0.

### Points

Przy nowym kącie opcji <Keyword id="Reference" />: nowy kąt to kąt linii między dwoma wskazanymi punktami, więc obiekty ustawiają się wzdłuż krawędzi, która jest już narysowana.

## Missing

Podczas podawania kąta obracany zbiór podąża za kursorem w kolorze każdego obiektu, ale bez jego rodzaju linii i szerokości linii.

## Questions

### Jak się nazywa polecenie OBRÓĆ po angielsku?

ROTATE. W polskim AutoCADzie wpisz `OBRÓĆ` lub skrót `OB` i naciśnij Enter lub spację; skrót `RO` z wersji angielskiej w polskiej nie działa. Angielska nazwa z podkreśleniem, `_ROTATE`, działa w AutoCADzie w każdym języku.

### Jak obrócić obiekt równolegle do innego w AutoCADzie?

Wybierz <Keyword id="Reference" />, wskaż dwa punkty wzdłuż krawędzi obiektu, potem wybierz <Keyword id="Points" /> i wskaż dwa punkty wzdłuż linii, do której ma się ustawić.

### Jak obrócić obiekt i zachować oryginał?

Wybierz <Keyword id="Copy" />, zanim podasz kąt: obraca się kopia, a oryginał zostaje.

### Dlaczego polecenie OBRÓĆ obraca w złą stronę?

Kąt dodatni obraca przeciwnie do ruchu wskazówek zegara, jak podaje ANGDIR w pierwszym wierszu. Wpisz kąt ujemny, na przykład `-30`, aby obrócić zgodnie z ruchem wskazówek zegara.

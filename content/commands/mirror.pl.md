---
title: "Polecenie LUSTRO (MIRROR) w AutoCADzie"
description: "Jak zrobić odbicie lustrzane w AutoCADzie poleceniem LUSTRO (MIRROR, skrót LUS): dwa punkty osi symetrii, zachowanie lub wymazanie źródła. Wypróbuj online."
figure: "Zamknięty obrys odbity względem pionowej osi symetrii, z zachowaniem źródła."
sourceHash: "fd4b7540311a"
---

Polecenie LUSTRO (MIRROR) odbija wybrane obiekty względem linii: wybierz je, podaj pierwszy i drugi punkt osi symetrii, a potem powiedz, czy wymazać obiekty źródłowe. Odbicie jest kopią, a przy odpowiedzi domyślnej, <Keyword id="No" />, oryginały zostają – tak rysuje się część symetryczną po połowie. Oba punkty są brane w rzucie układu LUW, więc oś narysowana w trybie orto odbija prosto w poprzek, poziomo lub pionowo. Jak w AutoCADzie przy MIRRTEXT równym 0, wartości domyślnej, tekst w odbiciu nadal czyta się od lewej do prawej, a kreskowanie zachowuje kąt swojego wzoru. Całe uruchomienie to jeden krok, który cofa polecenie Cofaj.

## Options

### Yes

Wymazuje obiekty źródłowe, więc zostaje tylko odbicie: przerzucenie w miejscu.

### No

Wartość domyślna: zostawia obiekty źródłowe obok ich odbicia.

## Missing

MIRRTEXT i MIRRHATCH zostają na 0: tekst nigdy nie jest odbijany tak, by czytał się wspak, a wzór kreskowania nigdy nie jest odbijany. Tekst wewnątrz odbitego odnośnika bloku obraca się z powrotem, by dało się go czytać, tak jak tekst luźny, podczas gdy AutoCAD odbija go razem z blokiem. Odbita elipsa zachowuje swoją normalną, więc jej kąt początkowy i końcowy wyglądają inaczej niż w AutoCADzie dla tej samej krzywej. Gdy odbicie podąża za kursorem, ma kolor każdego obiektu, ale nie jego rodzaj ani szerokość linii.

## Questions

### Jak się nazywa polecenie LUSTRO po angielsku?

MIRROR. W polskim AutoCADzie jego skrót to `LUS`: wpisz go i naciśnij Enter lub spację. Angielskie `MI` w polskiej wersji nie działa; pełna nazwa `LUSTRO` działa, a `_MIRROR` – w AutoCADzie w każdym języku.

### Jak zrobić lustro, żeby tekst nie był odwrócony?

Nie trzeba nic robić: jak w AutoCADzie przy MIRRTEXT równym 0, odbity tekst nadal czyta się normalnie i stoi tam, gdzie wypada odbicie jego ramki.

### Jak zrobić lustro i usunąć oryginał?

Odpowiedz <Keyword id="Yes" />, gdy polecenie LUSTRO zapyta, czy wymazać obiekty źródłowe.

### Jak odbić obiekt w poziomie lub w pionie?

Włącz tryb orto (F8) i podaj dwa punkty osi symetrii wzdłuż osi, względem której chcesz odbić: pionowa oś zamienia lewą i prawą stronę, pozioma – górę i dół.

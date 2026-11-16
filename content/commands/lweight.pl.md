---
title: "Szerokość linii w AutoCADzie: polecenie SZERLIN (LWEIGHT)"
metaTitle: "Szerokość linii w AutoCADzie: SZERLIN (LWEIGHT)"
description: "Jak zmienić szerokość linii w AutoCADzie poleceniem SZERLIN (LWEIGHT, skrót SL): szerokość nowych obiektów w mm, 24 wartości standardowe, JakWarstwa i ekran."
figure: "Płytka obrysowana szerokością 0,70 mm, potem 0.1 wpisane dla otworu i zaokrąglone do 0,09 mm: obie szerokości tak, jak pokazuje je ekran."
sourceHash: "154784b2b402"
---

Polecenie SZERLIN (LWEIGHT) ustala szerokość linii, z jaką rysowane są nowe obiekty, w milimetrach. AutoCAD otwiera okno dialogowe Ustawienia szerokości linii; MellowCAD jeszcze go nie ma, więc polecenie SZERLIN uruchamia wersję dla wiersza polecenia, którą AutoCAD również ma, <Command id="-LWEIGHT" />. Podaje bieżącą szerokość linii, na początku `JAKWARSTWA`, i pyta o nową: jedną z 24 standardowych wartości AutoCADa, od 0,00 do 2,11 mm. Każda inna wartość zostaje zamieniona na najbliższą standardową, z informacją o tym, a ujemna jest odrzucana komunikatem <Message id="invalidLineweightNumber" />. Enter zostawia bieżącą szerokość. Każda zmiana to krok, który cofa <Command id="U" />.

Szerokości linii są tutaj widoczne na ekranie od początku: AutoCAD pokazuje je dopiero po włączeniu przycisku Szerokość linii na pasku stanu (LWDISPLAY), ale MellowCAD nie ma układów ani drukowania, więc ekran to jedyne miejsce, w którym mogą się pokazać. Ten przycisk je wyłącza i włącza. Szeroka polilinia pokazuje w rzucie swoją szerokość, a nie szerokość linii.

## Options

### ?

Wyświetla wartości, które przyjmuje: JakWarstwa i 24 standardowe szerokości linii, a potem znów pyta.

### BYLAYER

Nowe obiekty przyjmują szerokość linii swojej warstwy, tak jak na początku.

## Missing

JakBlok i Domyślna (LWDEFAULT), szerokości linii w calach, okno dialogowe Ustawienia szerokości linii i pozycja Ustawienia szerokości linii… na liście rozwijanej.

## Questions

### Jak się nazywa polecenie SZERLIN po angielsku?

LWEIGHT. W polskim AutoCADzie jego skrót to `SL`: wpisz go i naciśnij Enter lub spację. Angielskie `LW` i `LINEWEIGHT` w polskiej wersji nie działają; pełna nazwa `SZERLIN` działa, a `_LWEIGHT` – w AutoCADzie w każdym języku.

### Dlaczego w AutoCADzie nie widać szerokości linii?

W AutoCADzie szerokości linii są widoczne na ekranie tylko przy włączonym przycisku Szerokość linii na pasku stanu (LWDISPLAY 1); na początku jest wyłączony. Tutaj jest włączony od początku. Wszystkie cienkie szerokości rysują się najcieńszą linią ekranu, więc różnicę widać na grubszych; a obiekt o szerokości linii JakWarstwa przyjmuje szerokość swojej warstwy.

### Jak zmienić szerokość linii istniejącego obiektu?

Wybierz obiekt i ustaw szerokość w wierszu Szerokość linii na palecie Właściwości albo, gdy obiekt ma JakWarstwa, zmień szerokość linii jego warstwy w Menedżerze właściwości warstw. Polecenie SZERLIN ustala tylko szerokość linii obiektów rysowanych po nim.

### Jakie szerokości linii ma AutoCAD?

24 stałe wartości w milimetrach: 0,00; 0,05; 0,09; 0,13; 0,15; 0,18; 0,20; 0,25; 0,30; 0,35; 0,40; 0,50; 0,53; 0,60; 0,70; 0,80; 0,90; 1,00; 1,06; 1,20; 1,40; 1,58; 2,00 i 2,11. Wpisz inną, na przykład `0.45`, a polecenie SZERLIN przyjmie najbliższą, a przy równej odległości – cieńszą.

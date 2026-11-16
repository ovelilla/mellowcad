---
title: "Orbita 3D w AutoCADzie: polecenie 3DORBITA (3DORBIT)"
metaTitle: "Orbita 3D w AutoCADzie: 3DORBITA i skrót"
description: "Jak obracać widok w AutoCADzie poleceniem 3DORBITA (3DORBIT, skrót 3DO, OR): przeciąganiem, z Shift i kółkiem myszy, jak z niego wyjść i wrócić do widoku planu."
figure: "Prostopadłościan widziany najpierw w rzucie: 3DORBITA, przeciągnięcie w bok i w dół, potem Enter, i prostopadłościan widać z góry, od strony przedniego narożnika."
sourceHash: "66fc1859c8fd"
---

Polecenie 3DORBITA (3DORBIT) obraca widok wokół rysunku, gdy przeciągasz kursor; w samym rysunku nic się nie przesuwa ani nie zmienia. Przeciąganie w bok obraca kamerę wokół osi Z układu GUW, a w górę i w dół podnosi ją lub opuszcza, wokół środka rysunku pod środkiem ekranu, w rzucie równoległym. Na początku polecenie mówi, jak z niego wyjść: dopóki działa, można tylko obracać widok, a Enter lub Esc je kończy, niezależnie od tego, czy było przeciąganie.

Przytrzymanie Shift i kółka myszy obraca widok z dowolnego miejsca, nawet wewnątrz innego polecenia, a przycisk Orbita na pasku nawigacji także uruchamia polecenie. Wpisane z apostrofem, `'3DORBITA`, działa wewnątrz innego polecenia, które potem trwa dalej. Każde przeciągnięcie to krok dla opcji <Keyword command="ZOOM" id="Previous" /> polecenia <Command id="ZOOM" />, a całe polecenie to jeden krok cofania, więc <Command id="U" /> przywraca widok. Aby widzieć bryły jako bryły, a nie jako model szkieletowy, użyj polecenia <Command id="VSCURRENT" />; 3D w MellowCAD to tylko bryły 3D, wciąż częściowo.

## Missing

Menu podręczne z jego rzutami, stylami wizualnymi i innymi trybami nawigacji. Obracanie tylko wokół wybranych obiektów. Perspektywa. Swobodna i ciągła orbita (3DFORBIT, 3DCORBIT) i reszta nawigacji 3D AutoCADa.

## Questions

### Jak się nazywa polecenie Orbita 3D po angielsku i jaki ma skrót?

Po angielsku 3DORBIT, w polskim AutoCADzie 3DORBITA: wpisz `3DO` lub `OR`, potem naciśnij Enter albo spację. `_3DORBIT` działa w AutoCADzie w każdym języku. Bez wpisywania czegokolwiek: przytrzymaj Shift i kółko myszy i przeciągaj.

### Jak obracać model myszką w AutoCADzie?

Przytrzymaj Shift, wciśnij kółko myszy i przeciągaj: w bok, aby obrócić model, w górę i w dół, aby spojrzeć na niego z wyższa lub z niższa. Po puszczeniu wracasz do polecenia, które było uruchomione.

### Jak wyjść z orbity 3D?

Naciśnij Enter lub Esc. Widok pozostaje taki, jaki był w chwili wyjścia.

### Jak wrócić do widoku planu po orbicie 3D?

Uruchom polecenie <Command id="PLAN" /> i naciśnij Enter, albo <Command id="-VIEW" /> z opcją <Keyword command="VIEW" id="Top" />, albo kliknij górną ścianę kostki ViewCube. Opcja <Keyword command="ZOOM" id="Previous" /> polecenia <Command id="ZOOM" /> cofa widok o jedno przeciągnięcie naraz.

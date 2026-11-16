---
title: "Polecenie ZOOM w AutoCADzie"
description: "Jak działa polecenie ZOOM (skrót Z) w AutoCADzie: Zakres, Okno, Poprzedni, Skala z nX, Obiekt i Wszystko, kółko myszy, powiększanie wewnątrz polecenia."
figure: "Płyta z małym otworem przy narożniku: ZOOM Zakres, potem okno wokół otworu, który wypełnia wtedy widok."
sourceHash: "cd72af4956e4"
---

Polecenie ZOOM powiększa lub pomniejsza widok; nic w rysunku się nie przesuwa ani nie zmienia rozmiaru. Jego pierwsze pytanie przyjmuje narożnik, który zaczyna okno, współczynnik skali albo opcję. Wpisane z apostrofem, `'ZOOM` lub `'Z`, działa wewnątrz innego polecenia, które trwa dalej po nim. Kółko myszy powiększa i pomniejsza wokół kursora, a dwukrotne kliknięcie kółkiem to ZOOM <Keyword id="Extents" />. Każde ZOOM to krok cofania, a kolejne tworzą jeden krok, więc <Command id="U" /> cofa także widok.

## Options

### All

Pokazuje wszystko, co narysowano, jak <Keyword id="Extents" />.

### Extents

Pokazuje wszystko, co narysowano, tak duże, jak pozwala okno. Gdy nic nie narysowano, wyświetla <Message id="regeneratingModel" />, a wpisane wewnątrz innego polecenia odmawia z komunikatem <Message id="requiresRegen" />, jak w AutoCADzie.

### Previous

Wraca do poprzedniego widoku, do 20 widoków wstecz. Gdy nie ma już żadnego: <Message id="noPreviousView" />.

### Scale

Współczynnik: `2X` powiększa dwa razy względem bieżącego widoku, `0.5X` dwa razy pomniejsza, a `2` bez X daje dwukrotność skali widoku ZOOM <Keyword id="All" />. `nXP`, współczynnik obszaru papieru, jest odczytywany jako `nX`: jest tu tylko obszar modelu. Współczynnik wpisany przy pierwszym pytaniu działa tak samo bez wybierania opcji.

### Window

Dwa narożniki, wskazane lub przeciągnięte, pokazują ten prostokąt. Narożnik wskazany przy pierwszym pytaniu działa tak samo.

### Object

Pokazuje wybrane obiekty albo te zaznaczone przed poleceniem ZOOM.

## Missing

W czasie rzeczywistym: Enter przy pierwszym pytaniu kończy ZOOM, podczas gdy AutoCAD zaczyna powiększanie myszą; tutaj robi to kółko. Dynamiczny, Centrum oraz ukryte Lewy i Vmax.

## Questions

### Jaki jest skrót polecenia ZOOM w AutoCADzie?

`Z`, potem Enter lub spacja: w polskim AutoCADzie polecenie ma tę samą nazwę, ZOOM, i ten sam skrót co w angielskim. `_ZOOM` działa w AutoCADzie w każdym języku. `Z`, potem `Z` to ZOOM Zakres.

### Jak pokazać cały rysunek w AutoCADzie?

<Keyword id="Extents" />: wpisz `Z`, Enter, `Z`, Enter. Albo kliknij dwukrotnie kółkiem myszy.

### Co oznacza ZOOM XP w AutoCADzie?

`nXP` powiększa rzutnię układu w skali względem obszaru papieru: `1/50XP` pokazuje model w skali 1:50 na arkuszu. MellowCAD nie ma układów, więc `XP` jest odczytywane jako `X`.

### Jak przybliżyć obiekt w AutoCADzie?

Wybierz <Keyword id="Object" /> i zaznacz obiekt albo najpierw go zaznacz, a potem uruchom ZOOM <Keyword id="Object" />: widok go pokaże.

### Jak wrócić do poprzedniego widoku?

<Keyword id="Previous" />, raz za razem dla kolejnych wcześniejszych widoków, do 20.

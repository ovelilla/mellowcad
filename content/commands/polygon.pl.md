---
title: "Wielokąt w AutoCADzie: polecenie WIELOBOK (POLYGON)"
metaTitle: "Wielokąt w AutoCADzie: WIELOBOK (POLYGON)"
description: "Jak narysować wielokąt foremny w AutoCADzie poleceniem WIELOBOK (POLYGON, skrót WBO): liczba boków, środek, wpisany lub opisany albo bok. Wypróbuj online."
figure: "Dwa okręgi o promieniu 30, sześciokąt wpisany w jeden i opisany na drugim, oraz pięciokąt zbudowany na boku."
sourceHash: "90e1cc9a53c4"
---

Polecenie WIELOBOK (POLYGON) rysuje wielokąt foremny, o równych bokach i kątach, jako jedną zamkniętą polilinię. Pyta o liczbę boków, od 3 do 1024, potem o środek i o to, czy wielokąt jest wpisany w okrąg, czy opisany na nim, a potem o promień tego okręgu. Można go też zbudować na jednym z boków opcją <Keyword id="Edge" />. Liczba boków i wybór wpisanego lub opisanego są wartościami domyślnymi następnego polecenia WIELOBOK w tym rysunku. Promień wpisany jako liczba rysuje dolny bok poziomo; podany jako punkt, wskazany lub wpisany, ustala zarówno rozmiar, jak i obrót wielokąta. Gdy podajesz promień, wielokąt podąża za kursorem, z bursztynową kreskową linią od środka.

## Options

### Edge

Zamiast środka: podaj dwa końce jednego boku, a wielokąt zostanie zbudowany od niego przeciwnie do ruchu wskazówek zegara.

### Inscribed

Wierzchołki leżą na okręgu: promień biegnie od środka do wierzchołka. Wartość domyślna.

### Circumscribed

Boki stykają się z okręgiem w swoich punktach środkowych: promień biegnie od środka do połowy boku.

## Missing

Skok obrócony o kąt: promień wpisany jako liczba zawsze rysuje dolny bok poziomo względem LUW, podczas gdy AutoCAD obraca go o kąt skoku, SNAPANG.

## Questions

### Jak się nazywa polecenie WIELOBOK po angielsku?

POLYGON. W polskim AutoCADzie jego skrót to `WBO`: wpisz go i naciśnij Enter lub spację. Angielskie `POL` w polskiej wersji uruchamia polecenie POLE; pełna nazwa `WIELOBOK` działa, a `_POLYGON` – w AutoCADzie w każdym języku.

### Jak narysować sześciokąt w AutoCADzie?

Uruchom polecenie WIELOBOK, wpisz `6` jako liczbę boków, podaj środek, wybierz <Keyword id="Inscribed" /> lub <Keyword id="Circumscribed" /> i wpisz promień. Rozstaw przeciwległych boków sześciokąta opisanego to dwukrotność podanego promienia.

### Czym się różni wielokąt wpisany od opisanego?

Przy <Keyword id="Inscribed" /> narożniki wielokąta dotykają okręgu, więc mieści się on w okręgu. Przy <Keyword id="Circumscribed" /> okręgu dotykają jego boki, więc to okrąg mieści się w nim. Przy tym samym promieniu wielokąt opisany jest większy.

### Jak narysować wielokąt o zadanej długości boku?

Wybierz <Keyword id="Edge" /> i podaj dwa końce jednego boku: `0,0`, a potem długość wpisaną względem niego, na przykład `40,0`. Pozostałe boki powstaną przeciwnie do ruchu wskazówek zegara.

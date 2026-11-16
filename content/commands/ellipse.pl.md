---
title: "Polecenie ELIPSA (ELLIPSE) w AutoCADzie"
description: "Jak narysować elipsę w AutoCADzie poleceniem ELIPSA (ELLIPSE, skrót E): oś i druga półoś, ze środka, przez obrót, łuk eliptyczny. Wypróbuj za darmo online."
figure: "Elipsa przez dwa końce osi, elipsa przez jej środek i pół łuku eliptycznego, od 0 do 180 stopni."
sourceHash: "2ee0d1b3a8a4"
---

Polecenie ELIPSA (ELLIPSE) rysuje elipsę z dwóch końców jednej osi, a potem z odległości od jej środka do końca drugiej osi, czyli połowy długości drugiej osi. Każda z osi może być dłuższa. To prawdziwa elipsa, jak w AutoCADzie, a nie polilinia, więc działają na niej lokalizacje Środek, Kwadrant i Najbliższy punkt, a jej uchwyty przesuwają ją i ustawiają każdą półoś. Gdy podajesz drugi koniec, od pierwszego biegnie bursztynowa przerywana linia; przy odległości elipsa podąża za kursorem. Elipsa powstaje na bieżącej warstwie, z właściwościami bieżącymi w chwili jej utworzenia.

## Options

### Arc

Rysuje łuk eliptyczny: te same monity co dla elipsy, potem kąt początkowy i kąt końcowy, przeciwnie do ruchu wskazówek zegara od końca pierwszej podanej osi.

### Center

Zaczyna od środka: potem koniec jednej osi, potem odległość do drugiej.

### Rotation

Zamiast odległości: kąt, o jaki elipsa jest obrócona wokół swojej pierwszej osi, jak okrąg widziany pod tym kątem. 0 rysuje okrąg; kąt różniący się od 90 o mniej niż 0,6 stopnia jest odrzucany komunikatem <Message id="invalid" />.

### Parameter

W łuku, zamiast kąta początkowego lub końcowego: kąt na okręgu, z którego rysowana jest elipsa, czyli parametr AutoCADa. <Keyword id="Angle" /> wraca do kątów.

### Included angle

W łuku, zamiast kąta końcowego: kąt, który łuk zakreśla od początku. Enter przyjmuje 180, połowę elipsy.

## Missing

Opcja Izo, dostępna w AutoCADzie tylko przy izometrycznym stylu skoku, którego tutaj nie ma. PELLIPSE 1, czyli elipsa rysowana jako polilinia. Kreskowanie i wymiarowanie elipsy oraz lokalizacje Punkt przecięcia, Styczna i Prostopadle na niej. Uchwyty strzałkowe na końcach łuku eliptycznego, tutaj rysowane jako kwadratowe, i wpisywanie długości lub kąta przy aktywnym uchwycie. Punkt ze współrzędną Z przy odległości jest mierzony w rzucie, podczas gdy AutoCAD mierzy go w przestrzeni.

## Questions

### Jak się nazywa polecenie ELIPSA po angielsku i jaki ma skrót?

ELLIPSE. W polskim AutoCADzie jego skrót to `E`: wpisz go i naciśnij Enter lub spację. Angielskie `EL` w polskiej wersji nie działa; `_ELLIPSE` działa w AutoCADzie w każdym języku.

### Jak narysować pół elipsy w AutoCADzie?

Wybierz <Keyword id="Arc" />, podaj oś i odległość, a potem kąt początkowy `0` i kąt końcowy `180`. Albo naciśnij Enter przy opcji <Keyword id="Included angle" />, która domyślnie zakreśla 180°.

### Jak narysować elipsę od środka?

Wybierz <Keyword id="Center" />, podaj środek, potem koniec jednej osi, a następnie odległość od środka do końca drugiej: to dwie półosie elipsy.

### Jak narysować okrąg izometryczny w AutoCADzie?

AutoCAD rysuje go opcją Izo polecenia ELIPSA, gdy styl skoku jest izometryczny. Żadnej z tych funkcji nie ma jeszcze w MellowCAD.

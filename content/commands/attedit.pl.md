---
title: "Edycja atrybutów w AutoCADzie: polecenie ATRRED (ATTEDIT)"
metaTitle: "Edycja atrybutów w AutoCADzie: ATRRED"
description: "Jak zmienić wartości atrybutów odnośnika bloku w AutoCADzie poleceniem ATRRED (ATTEDIT, skrót ATE): pole dla każdego monitu, jeden krok cofania."
figure: "Trzy oznaczenia drzwi, odnośniki bloku z atrybutem NUM: ATRRED wskazuje ostatnie, wstawione jako 2, a jego okno zmienia je na 3."
sourceHash: "4a8ee28ecc53"
---

Polecenie ATRRED (ATTEDIT) zmienia wartości atrybutów jednego odnośnika bloku. Prosi o wskazanie odnośnika, a potem otwiera okno z polem dla każdego z jego atrybutów, opisanym monitem atrybutu i wypełnionym jego wartością, jak okno dialogowe Edycja atrybutów w AutoCADzie. Wpisz nowe wartości, przechodząc klawiszem Tab od pola do pola, a Enter, czyli OK w AutoCADzie, zastosuje je w jednym kroku, który cofa <Command id="U" />; Esc, czyli Anuluj, niczego nie zmienia.

Wskazanie bierze obiekt pod celownikiem. Wszystko poza odnośnikiem bloku zostaje odrzucone, podobnie jak odnośnik, którego blok nie ma atrybutów, i pytanie się powtarza; wskazanie w puste miejsce powtarza je bez komunikatu. Definicja bloku się nie zmienia, podobnie jak jego pozostałe odnośniki: każdy ma własne wartości. <Command id="EATTEDIT" /> edytuje te same wartości w oknie opisanym etykietami, a dwukrotne kliknięcie odnośnika z atrybutami je uruchamia.

## Missing

`-ATRRED`, forma wiersza polecenia, która edytuje atrybuty pojedynczo lub globalnie, i jej skrót `-ATE`. Przyciski Poprzedni i Dalej okna Edycja atrybutów, dla bloku z większą liczbą atrybutów, niż mieści jedna strona, oraz jego wiersz Nazwa bloku. ATTIPEDIT, które edytuje jeden atrybut w miejscu, i jego Ctrl + dwukrotne kliknięcie. Własny uchwyt odblokowanego atrybutu na odnośniku oraz wiersze atrybutów w palecie Właściwości.

## Questions

### Jak się nazywa polecenie ATRRED po angielsku i jaki ma skrót?

Po angielsku ATTEDIT, w polskim AutoCADzie ATRRED: wpisz `ATE`, potem naciśnij Enter albo spację; działa też `ODATR`. `_ATTEDIT` działa w AutoCADzie w każdym języku.

### Jak edytować atrybuty bloku w AutoCADzie?

Wpisz `ATE` i wskaż odnośnik albo kliknij go dwukrotnie, co uruchamia <Command id="EATTEDIT" />. Zmień wartości w oknie i naciśnij Enter. Aby zmienić same atrybuty, ich etykietę, monit lub położenie, edytuj definicje i ponownie zdefiniuj blok poleceniem <Command id="BLOCK" />.

### Dlaczego ATRRED mówi, że blok nie ma atrybutów do edycji?

Bo blok wskazanego odnośnika nie ma atrybutów: ATRRED edytuje wartości odnośnika bloku, który je ma. Definicję, która nie trafiła jeszcze do bloku, edytuje się poleceniem <Command id="TEXTEDIT" />, dwukrotnym kliknięciem.

### Czym się różni ATRRED od RATRRED?

Oba edytują wartości jednego odnośnika. Okno ATRRED opisuje każde pole monitem atrybutu, jak okno dialogowe Edycja atrybutów w AutoCADzie; okno <Command id="EATTEDIT" />, Rozszerzony edytor atrybutów, opisuje je etykietą. W AutoCADzie RATRRED ma też karty z opcjami tekstu i właściwościami każdego atrybutu.

---
title: "Polecenie RATRRED (EATTEDIT) w AutoCADzie"
description: "Jak zmienić atrybuty bloku w AutoCADzie poleceniem RATRRED (EATTEDIT) w Rozszerzonym edytorze atrybutów i dlaczego uruchamia je dwukrotne kliknięcie bloku."
figure: "Dwa biurka, odnośniki bloku z atrybutami NUM i PART: RATRRED wskazuje drugie, a jego pole PART zmienia się na B-200."
sourceHash: "3517c89fd5da"
---

Polecenie RATRRED (EATTEDIT) otwiera Rozszerzony edytor atrybutów AutoCADa dla jednego odnośnika bloku: prosi o wybranie bloku, a potem pokazuje pole dla każdego jego atrybutu, opisane etykietą i wypełnione wartością, tak jak wymienia je karta „Atrybut” edytora. Wpisz nowe wartości, przechodząc między polami klawiszem Tab, a Enter zastosuje je w jednym kroku, który cofa polecenie <Command id="U" />; Esc niczego nie zmienia.

Dwukrotne kliknięcie odnośnika z atrybutami uruchamia polecenie RATRRED, jak w AutoCADzie: wiersz polecenia zapisuje je z dwukrotnie klikniętym punktem jako odpowiedzią, a okno otwiera się od razu. Wskazanie bierze obiekt pod kwadratem wyboru: wszystko, co nie jest odnośnikiem bloku, jest odrzucane, podobnie jak blok bez atrybutów, a pytanie pada ponownie. Zmienia się tylko wskazany odnośnik; definicja bloku i jego pozostałe odnośniki zachowują swoje wartości.

## Missing

Karta „Opcje tekstu” edytora (styl, wyrównanie, wysokość, obrót, współczynnik szerokości i pozostałe ustawienia tekstu każdego atrybutu) i jego karta „Właściwości” (warstwa, rodzaj linii, kolor, szerokość linii), a także jego przycisk „Wybierz blok”. Polecenie ATTIPEDIT, które edytuje jeden atrybut w miejscu, i jego Ctrl+dwukrotne kliknięcie. Własny uchwyt odblokowanego atrybutu na odnośniku i wiersze atrybutów w palecie „Właściwości”. `-ATRRED`.

## Questions

### Jak otworzyć Rozszerzony edytor atrybutów w AutoCADzie?

Kliknij dwukrotnie odnośnik bloku, który ma atrybuty, albo wpisz `RATRRED` i wskaż go. `_EATTEDIT` działa w AutoCADzie w każdym języku.

### Jak zmienić wartość atrybutu w AutoCADzie?

Kliknij dwukrotnie blok, wpisz nową wartość w polu atrybutu i naciśnij Enter. Każdy odnośnik ma własne wartości: zmiana jednego nie rusza pozostałych.

### Dlaczego dwukrotne kliknięcie nie otwiera atrybutów bloku?

Polecenie RATRRED otwiera się dla odnośnika, którego blok zawiera atrybuty, a blok utworzony bez nich ich nie ma: zdefiniuj je poleceniem <Command id="ATTDEF" /> i wybierz razem z pozostałymi obiektami, gdy tworzysz blok. Jeśli wartość atrybutu nie jest widoczna, sprawdź polecenie <Command id="ATTDISP" />, które może ukryć atrybuty niewidoczne albo wszystkie.

### Czym się różni RATRRED (EATTEDIT) od ATRRED (ATTEDIT)?

Oba polecenia edytują te same wartości. Polecenie RATRRED opisuje każde pole etykietą, jak karta „Atrybut” Rozszerzonego edytora atrybutów; polecenie <Command id="ATTEDIT" /> – monitem, jak okno dialogowe Edycja atrybutów. W AutoCADzie polecenie RATRRED edytuje też opcje tekstu i właściwości każdego atrybutu.

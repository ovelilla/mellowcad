---
title: "Polecenie REGION w AutoCADzie"
description: "Jak utworzyć region w AutoCADzie poleceniem REGION (skrót REG): jakie kontury znajduje, dlaczego nie tworzy żadnego i do czego służy region. Wypróbuj za darmo."
figure: "Cztery linie zamknięte koniec do końca i okrąg wewnątrz nich: REGION z oknem obejmującym oba kształty tworzy dwa regiony i usuwa obiekty."
sourceHash: "69a5423c3d5c"
---

Polecenie REGION zamienia zamknięte kształty w regiony: płaskie obszary bez grubości, każdy ograniczony swoimi konturami. Wybierz obiekty i naciśnij Enter: każdy kontur, który tworzą, staje się regionem. Obiekt zamknięty jest konturem sam w sobie: okrąg, elipsa, zamknięta polilinia lub splajn. Obiekty otwarte – linie, łuki, łuki eliptyczne, otwarte polilinie i splajny – łączą się w łańcuch koniec do końca, nigdy w miejscu przecięcia, a łańcuch, który się nie zamyka, zostaje pominięty. Wiersz polecenia podaje następnie liczbę znalezionych konturów, odrzuconych konturów wraz z przyczyną i utworzonych regionów; Enter bez wybranych obiektów wyświetla <Message id="regionNoneFound" />.

Obiekty, które weszły w skład regionu, zostają usunięte, pozostałe zostają, a regiony otrzymują bieżącą warstwę i właściwości, nie właściwości obiektów. Kontur wewnątrz innego tworzy osobny region, a nie otwór w tamtym: <Command id="SUBTRACT" /> odejmuje jeden od drugiego. Region rysuje się jako swoje krawędzie i na nich działa lokalizacja; paleta Właściwości pokazuje jego pole i obwód, które mierzą też <Command id="AREA" />, <Command id="LIST" /> i <Command id="MASSPROP" />. <Command id="UNION" />, <Command id="SUBTRACT" /> i <Command id="INTERSECT" /> łączą regiony leżące w jednej płaszczyźnie, <Command id="EXTRUDE" />, <Command id="REVOLVE" /> i <Command id="PRESSPULL" /> zamieniają je w bryły 3D, a <Command id="EXPLODE" /> oddaje z powrotem ich linie, łuki i okręgi. Całe polecenie to jeden krok cofania.

## Missing

Zmienna `DELOBJ` AutoCADa: obiekty, które weszły w skład regionu, są tu zawsze usuwane. Polecenie OBWIEDNIA (BOUNDARY), które potrafi utworzyć region z obszaru wokół punktu, oraz region z obwiedni kreskowania. Edycja regionu uchwytami: uchwyty są widoczne, ale przeciąganie ich niczego nie zmienia. Krawędzie regionu jako krawędzie tnące lub graniczne dla <Command id="TRIM" /> i <Command id="EXTEND" /> w trybie szybkim oraz <Command id="HATCH" /> regionu z krawędzią eliptyczną lub splajnową. Łączenie regionów z powierzchniami, których MellowCAD nie ma, oraz wiersz Materiał w palecie Właściwości.

## Questions

### Jak się nazywa polecenie REGION po angielsku i jak go używać?

Tak samo: REGION, ze skrótem `REG` w polskim AutoCADzie, a `_REGION` działa w AutoCADzie w dowolnym języku. Uruchom polecenie, wybierz zamknięte kształty albo linie, które zamykają jeden kształt koniec do końca, i naciśnij Enter. W sesji okno wokół czterech linii i okręgu tworzy dwa regiony, a wiersz polecenia podaje dwa wyodrębnione kontury i dwa utworzone regiony.

### Dlaczego REGION nie tworzy regionu?

Kształt nie jest zamknięty koniec do końca. Linie, które się przecinają albo nie dochodzą do siebie, niczego nie zamykają: polecenie REGION łączy obiekty otwarte tylko ich końcami, a szczelina grubości włosa wystarczy, by łańcuch został pominięty. Kontur, który przecina sam siebie, jak muszka, zostaje odrzucony i policzony jako samoprzecięcie. Połącz końce poleceniem <Command id="FILLET" /> z promieniem 0 albo utnij poleceniem <Command id="TRIM" /> to, co wystaje, i spróbuj ponownie.

### Jak zrobić region z otworem w AutoCADzie?

Utwórz region z obrysu i drugi z otworu, a potem uruchom <Command id="SUBTRACT" />: wskaż obrys, Enter, otwór, Enter. Wynikiem jest jeden region, a <Command id="EXTRUDE" /> zamienia go w bryłę z otworem na wylot.

### Jak sprawdzić pole regionu?

Zaznacz go i odczytaj Pole w palecie Właściwości albo uruchom <Command id="AREA" />, wybierz <Keyword command="AREA" id="Object" /> i wskaż region. <Command id="MASSPROP" /> dodaje obwód, środek ciężkości i momenty bezwładności.

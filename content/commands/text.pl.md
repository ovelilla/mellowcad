---
title: "Polecenie TEKST (TEXT) w AutoCADzie: tekst jednowierszowy"
metaTitle: "Polecenie TEKST (TEXT) w AutoCADzie"
description: "Jak działa polecenie TEKST (TEXT, skrót DT) w AutoCADzie: punkt początkowy, wysokość i obrót, Wyrównanie i Styl, jeden obiekt na wiersz."
figure: "Dwa wiersze tekstu jednowierszowego wyśrodkowane w prostokącie, z wyrównaniem środek-środek: każdy wiersz to osobny obiekt."
sourceHash: "7ff166aadef6"
---

Polecenie TEKST (TEXT) tworzy tekst jednowierszowy. Podajesz punkt początkowy, wysokość i kąt obrotu, a potem wpisujesz wiersz i naciskasz Enter: wiersz staje się osobnym obiektem, a następny zaczyna się wiersz niżej. Pusty wiersz kończy polecenie. Kliknięcie w innym miejscu przed końcem zaczyna kolejne wiersze w tym punkcie, a Esc zachowuje wiersze już wprowadzone i porzuca ten, który jest wpisywany. Akapit zawijany do szerokości, jako jeden obiekt, tworzy <Command id="MTEXT" />.

Pierwszy wiersz podaje bieżący styl, wysokość i wyrównanie. Wysokość jest wspólna z poleceniami <Command id="MTEXT" /> i <Command id="ATTDEF" />, zapisana w rysunku, a kolejne wywołanie polecenia TEKST proponuje ją jako domyślną; przy stylu z własną wysokością monit o wysokość jest pomijany. Enter przy punkcie początkowym kontynuuje pod ostatnim wierszem napisanym przez TEKST, bez ponownego pytania o wysokość i kąt. <Command id="U" /> cofa całe wykonanie.

## Options

### Justify

Pyta, gdzie tekst jest zaczepiony w swoim punkcie: <Keyword id="Left" /> (domyślnie), <Keyword id="Center" />, <Keyword id="Right" />, <Keyword id="Middle" /> albo jeden z dziewięciu punktów, góra, środek i dół po lewej, pośrodku i po prawej, tak jak wymienia je monit. Monit o punkt początkowy prosi wtedy o punkt, który wyznacza wyrównanie: przy środek-środek – o punkt środkowy. Jak w AutoCADzie, tych dziewięć punktów jest przyjmowanych także w pierwszym monicie, choć ich tam nie wymieniono, więc wpisanie tam liter wyrównania środek-środek od razu pyta o punkt środkowy. Wyrównanie zostaje zapisane w rysunku dla kolejnego wywołania polecenia TEKST.

### Style

Pyta o nazwę stylu tekstu, który ma się stać bieżący; Enter zachowuje obecny. <Keyword id="?" /> wypisuje style rysunku; nazwa, której rysunek nie ma, jest odrzucana i pytanie pada ponownie. Style tworzy się w oknie dialogowym Styl tekstu, które otwiera <Command id="STYLE" />.

## Missing

Wyrównania Wyrównaj i Dopasuj. <Keyword id="?" /> opcji <Keyword id="Style" /> wypisuje od razu wszystkie style, bez pytania, które z nich, i bez zatrzymywania się po każdej stronie. Tekst wpisuje się w polu wprowadzania dynamicznego, a nie z kursorem tekstowym na rysunku, a jego treści nie można zmienić w palecie Właściwości, w której brakuje też wierszy Opisowy, Współczynnik szerokości, Kąt pochylenia, Do góry nogami i Wstecz. Kliknięcie wewnątrz ramki tekstu wybiera go nawet poza literami, podczas gdy AutoCAD niczego nie wybiera.

## Questions

### Jak się nazywa polecenie TEKST po angielsku?

TEXT. W polskim AutoCADzie wpisz `DT` i naciśnij Enter lub spację; działają też `DTEKST` i `TEKST`, a `_TEXT` w AutoCADzie w każdym języku. Tekst wielowierszowy to <Command id="MTEXT" />, bez skrótu w polskiej wersji (w angielskiej `T` i `MT`).

### Jak wyrównać tekst w AutoCADzie?

Wybierz <Keyword id="Justify" /> w pierwszym monicie albo wpisz tam litery wyrównania, a potem podaj punkt, który ono wskazuje: środek-środek umieszcza środek każdego wiersza w jego punkcie, tak jak opis w środku prostokąta. Aby tekst biegł wzdłuż linii pod kątem, wpisz ten kąt w monicie o kąt obrotu.

### Czym się różni TEKST od WTEKST?

TEKST tworzy jeden obiekt na wiersz, każdy przesuwany, edytowany i wyrównywany osobno, i nigdy nie zawija. <Command id="MTEXT" /> tworzy jeden obiekt z akapitów zawijanych do szerokości ramki, wyrównywany jako całość. Oba korzystają ze wspólnej wysokości tekstu i tych samych stylów tekstu.

### Jak edytować tekst w AutoCADzie?

Kliknij go dwukrotnie: <Command id="TEXTEDIT" /> otwiera go do ponownego wpisania, a potem pyta o następny tekst do edycji, aż naciśniesz Esc. Wysokość i obrót tekstu to wiersze palety Właściwości, a jego uchwyty go przesuwają.

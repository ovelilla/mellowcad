---
title: "Tekst wielowierszowy w AutoCADzie: polecenie WTEKST (MTEXT)"
metaTitle: "Tekst wielowierszowy w AutoCADzie: WTEKST"
description: "Jak pisać tekst wielowierszowy w AutoCADzie poleceniem WTEKST (MTEXT, skrót WT): dwa narożniki lub szerokość, wysokość, wyrównanie, odstęp. Wypróbuj online."
figure: "Notatka w ramce: najpierw ustawiona wysokość, potem przeciwległy narożnik i jeden akapit zawinięty do szerokości między nimi."
sourceHash: "67d762bb368d"
---

Polecenie WTEKST (MTEXT) pisze tekst wielowierszowy: jeden obiekt z akapitami, które zawijają się do zadanej szerokości. Wskazujesz pierwszy narożnik i przeciwległy, a ramka między nimi ustala szerokość; potem piszesz w edytorze narysowanym na miejscu, gdzie Enter zaczyna nowy akapit, a Ctrl+Enter lub kliknięcie poza ramką zatwierdza tekst. Esc, gdy coś już wpisano, pyta, czy to zapisać, jak okno dialogowe AutoCADa „WTEKST – niezapisane zmiany”. Do wierszy, z których każdy jest osobnym obiektem, służy <Command id="TEXT" />.

Pierwszy wiersz podaje bieżący styl i wysokość. Każda opcja jest dostępna przy monicie o przeciwległy narożnik i do niego wraca, więc w jednym uruchomieniu ustawia się wysokość, wyrównanie i resztę, zanim ramka zostanie zamknięta. Słowa zawijają się tam, gdzie wiersz przekroczyłby szerokość, a słowo dłuższe niż szerokość wychodzi poza nią. Wysokość jest wspólna z <Command id="TEXT" /> i zapisana w rysunku; wyrównanie, obrót i odstęp wierszy przy każdym uruchomieniu wracają do wartości domyślnych. <Command id="-MTEXT" /> zadaje te same pytania, a potem przyjmuje tekst w wierszu polecenia, wiersz po wierszu.

## Options

### Height

Ustala wysokość tekstu, wpisaną lub jako odległość od pierwszego narożnika do punktu; musi być większa od zera. Zostaje na następne uruchomienie i dla <Command id="TEXT" />.

### Justify

Ustala, od którego z dziewięciu punktów ramki wisi tekst: domyślnie od lewego górnego albo od dowolnego z punktów górnych, środkowych i dolnych – lewego, środkowego lub prawego – tak jak wymienia je monit. Tekst wisi od tego punktu ramki, niezależnie od tego, w którą stronę ją przeciągnięto.

### Line spacing

Pyta o rodzaj: Przynajmniej (domyślnie), który robi miejsce na wiersz z wyższymi literami, albo Dokładnie, a potem o współczynnik zapisany z x, na przykład `2x`, albo o odległość. Pojedynczy odstęp to 1x, a współczynnik może wynosić od 0.25x do 4x.

### Rotation

Obraca ramkę i jej tekst o kąt wpisany lub wskazany od pierwszego narożnika.

### Style

Ustawia bieżący styl tekstu według nazwy; <Keyword id="?" /> wyświetla style rysunku, a nazwa, której rysunek nie ma, zostaje odrzucona. Style tworzy się w oknie dialogowym Styl tekstu, które otwiera <Command id="STYLE" />.

### Width

Pyta o szerokość zamiast o przeciwległy narożnik, wpisaną lub jako odległość do punktu, a potem otwiera edytor. Szerokość 0 albo Enter zostawia wiersze niezawinięte, każdy tak długi, jak wpisany.

## Missing

Kolumny, które AutoCAD 2027 wymienia przy monicie o przeciwległy narożnik, nie są oferowane. Formatowanie wewnątrz tekstu, takie jak wysokość, czcionka czy kolor jednego słowa, ułamki piętrowe lub podkreślenie, nie jest rysowane ani stosowane, a edytor nie ma linijki, tabulatorów, wcięć, list ani karty wstążki Edytor tekstu, ani kursora tekstowego na rysunku. Nie ma maski tła ani ramki tekstu, określonej wysokości, skalowania opisowego ani lokalizacji Punkt na narożnikach, a kliknięcie wewnątrz ramki wskazuje tekst nawet poza literami, podczas gdy AutoCAD niczego nie wskazuje.

## Questions

### Jak się nazywa polecenie WTEKST po angielsku?

MTEXT. W polskim AutoCADzie nie ma skrótu: wpisz pełną nazwę `WTEKST` i naciśnij Enter lub spację. Angielskie `T` i `MT` w polskiej wersji nie działają, a `WT` uruchamia WYRÓWNAJTEKST (wyrównanie tekstu); `_MTEXT` działa w AutoCADzie w każdym języku. <Command id="-MTEXT" />, skrót `-WT` lub `-T`, zadaje te same pytania i przyjmuje tekst w wierszu polecenia.

### Jak przejść do nowego wiersza w tekście wielowierszowym?

Naciśnij Enter: zaczyna nowy akapit. Wewnątrz akapitu wiersze zawijają się same przy szerokości ramki. Ctrl+Enter lub kliknięcie poza ramką zamyka edytor i zachowuje tekst.

### Jak zmienić szerokość tekstu wielowierszowego?

Wybierz go i przeciągnij uchwyt z boku: tekst zawija się na nowo, gdy szerokość się zmienia, względem punktu wyrównania. Wiersz Określona szerokość na palecie Właściwości zmienia ją liczbowo, a wiersze odstępu między liniami zmieniają odstęp.

### Jak zamienić WTEKST na tekst jednowierszowy?

Rozbij go poleceniem <Command id="EXPLODE" />: każdy jego wiersz staje się obiektem <Command id="TEXT" />, wyrównanym do lewej w miejscu, w którym stał wiersz, tak jak w AutoCADzie. Aby zamiast tego przepisać tekst, kliknij go dwukrotnie i edytuj w jego edytorze.

---
title: "Bloki w AutoCADzie: polecenie BLOK (BLOCK)"
metaTitle: "Jak utworzyć blok w AutoCADzie: polecenie BLOK"
description: "Jak utworzyć blok w AutoCADzie poleceniem BLOK (BLOCK, skrót B): nazwa, punkt bazowy i obiekty, ponowne definiowanie bloku, atrybuty. Wypróbuj za darmo."
figure: "Krzesło, prostokąt i linia, zamienione w blok B1: jego nazwa, punkt bazowy w środku przedniej krawędzi, oba obiekty zaznaczone."
sourceHash: "ca24f209008c"
---

Polecenie BLOK (BLOCK) zapisuje zestaw obiektów w rysunku pod nazwą, aby <Command id="INSERT" /> mogło go wstawiać dowolnie wiele razy, a każda kopia była odnośnikiem do tej jednej definicji. Pyta o nazwę, potem o bazowy punkt wstawienia – punkt, według którego umieszczany jest każdy odnośnik – a potem o obiekty. Enter kończy wybór i definiuje blok, a wskazane obiekty stają się odnośnikiem do niego, w tym samym miejscu. Całe polecenie to jeden krok cofania.

BLOK w AutoCADzie otwiera okno dialogowe Definicja bloku, którego MellowCAD nie ma: tu BLOK pyta w wierszu polecenia o to, o co pyta <Command id="-BLOCK" />, tak jak w konsoli AutoCADa. Nazwa może zawierać spacje i do 255 znaków, ale żadnego z `< > / \ " : ; ? * | , =` ani grawisu: sam Enter lub taka nazwa daje komunikat <Message id="invalidNewBlockName" /> i pytanie się powtarza. Nazwa, którą rysunek już ma, niezależnie od wielkości liter, prowadzi do pytania, czy przedefiniować ten blok: <Keyword id="Yes" /> lub <Keyword id="No" /> (wartość domyślna, która kończy polecenie).

## Options

### ?

Wypisuje bloki rysunku: pyta, które wypisać, domyślnie `*` dla wszystkich albo nazwę z symbolami wieloznacznymi, wypisuje pasujące nazwy i liczbę bloków każdego rodzaju, a potem kończy. Bloki anonimowe, takie jak bloki szyku, są liczone, ale nigdy nie są wymieniane z nazwy.

## Missing

Okno dialogowe Definicja bloku AutoCADa: BLOK pyta w wierszu polecenia. Przy punkcie bazowym opcje Opisowy i Tryb (zachowanie lub usunięcie obiektów): obiekty są zawsze zamieniane na odnośnik. ATTREQ 0, które pomija okno wartości atrybutów, oraz ATRSYN, ATTREDEF, MENATR i BATRKOLEJ: przedefiniowany blok zostawia atrybuty swoich odnośników bez zmian, tak jak AutoCAD. JakBlok: obiekt wewnątrz bloku nie może przyjąć koloru, rodzaju linii ani szerokości linii odnośnika, jak obiekt narysowany jako JakBlok w AutoCADzie. W obróconym układzie LUW AutoCAD 2027 przesuwa zamieniane obiekty; tu celowo zostają tam, gdzie były.

## Questions

### Jak się nazywa polecenie BLOK po angielsku i jaki ma skrót?

Po angielsku BLOCK, w polskim AutoCADzie BLOK: wpisz `B`, potem naciśnij Enter albo spację. W AutoCADzie otwiera to okno dialogowe Definicja bloku; tu pyta w wierszu polecenia, tak jak `-B` (<Command id="-BLOCK" />). `_BLOCK` działa w AutoCADzie w każdym języku.

### Jak utworzyć blok w AutoCADzie?

Wpisz `B` i nazwę, potem wskaż punkt bazowy – narożnik albo środek krawędzi, na której blok będzie stał – i zaznacz obiekty. Enter definiuje blok i zamienia obiekty na odnośnik do niego. Zaznaczenie zrobione przed poleceniem też zostaje użyte, po punkcie bazowym.

### Jak przedefiniować blok w AutoCADzie?

Uruchom BLOK z nazwą bloku i odpowiedz <Keyword id="Yes" />, potem podaj punkt bazowy i zaznacz nowe obiekty: każdy odnośnik bloku pokazuje nową definicję. Obiekty nie mogą zawierać odnośnika do tego samego bloku; taki zestaw zostaje odrzucony, a polecenie się kończy.

### Jak zrobić blok z atrybutami?

Najpierw zdefiniuj atrybuty poleceniem <Command id="ATTDEF" />, a potem zaznacz je razem z innymi obiektami: trafiają do bloku w kolejności wskazywania. Odnośnik, który je zastępuje, otwiera okno z polem dla każdego atrybutu, opisanym jego monitem i wypełnionym wartością domyślną: Enter stosuje wartości, Esc zachowuje domyślne.

### Jak rozbić blok w AutoCADzie?

<Command id="EXPLODE" /> zamienia odnośnik z powrotem w obiekty, które pokazuje, po jednym poziomie zagnieżdżenia naraz, każdy na swojej warstwie i we własnym kolorze. Atrybuty wracają jako swoje definicje; wartości przepadają.

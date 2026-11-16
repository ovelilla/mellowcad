---
title: "Style wizualne w AutoCADzie: polecenie BIEŻSTYLWIZ (VSCURRENT)"
metaTitle: "Style wizualne w AutoCADzie: BIEŻSTYLWIZ"
description: "Styl wizualny w AutoCADzie: polecenie BIEŻSTYLWIZ (VSCURRENT), Model szkieletowy 2D, Ukryty i Koncepcyjny, co rysuje każdy i jak wrócić do szkieletu."
figure: "Klocek z otworem na wylot, widziany z południowego wschodu: BIEŻSTYLWIZ Koncepcyjny cieniuje jego powierzchnie i rysuje na nich krawędzie."
sourceHash: "ddb8f2338e68"
---

Polecenie BIEŻSTYLWIZ (VSCURRENT) ustawia styl wizualny: sposób, w jaki widok rysuje bryły 3D. Pyta o styl, proponując bieżący jako domyślny, a Enter go zachowuje. <Keyword id="2dwireframe" /> rysuje każdą krawędź, także te z tyłu; <Keyword id="Hidden" /> ukrywa to, co zasłaniają powierzchnie; <Keyword id="Conceptual" /> maluje powierzchnie, z cieniowaniem. Styl należy do widoku i zapisuje się w rysunku, a każde wykonanie to jeden krok cofania. Nie można go użyć wewnątrz innego polecenia.

To, co nie jest bryłą – linie, okręgi, regiony, tekst – rysuje się jak w Modelu szkieletowym 2D bez względu na styl, we własnych kolorach. W stylach Ukryty i Koncepcyjny kliknięcie wybiera bryłę, której powierzchnia jest najbliżej ciebie pod kursorem, nigdy bryłę za zasłaniającą ją powierzchnią, a lokalizacja względem obiektu nadal znajduje każdą krawędź. Bryła na zablokowanej warstwie rysuje swoje krawędzie bledziej. 3D w MellowCAD to tylko bryły i wciąż jest częściowe.

## Options

### 2dwireframe

Każda krawędź każdej bryły, także z tyłu, wraz z liniami pokazującymi jej zakrzywione powierzchnie; domyślny w nowym rysunku. Przy powrocie do niego z innego stylu BIEŻSTYLWIZ wyświetla <Message id="regeneratingModel" />.

### Hidden

Krawędzie każdej bryły i obrysy jej zakrzywionych powierzchni tam, gdzie nie zasłania ich żadna powierzchnia żadnej bryły, w kolorze obiektu: bryła za inną jest przez nią zasłonięta. Linie, które pokazują zakrzywioną powierzchnię w Modelu szkieletowym 2D, nie są rysowane.

### Conceptual

Powierzchnie zwrócone ku tobie pomalowane kolorem obiektu, przechodzącym w chłodny błękit po stronie odwróconej od światła, które podąża za punktem widzenia, a na nich krawędzie stylu Ukryty w jednym kolorze, bez względu na kolor obiektu. Tutaj i w stylu Ukryty walec lub stożek widziany w rzucie z góry pokazuje sam okrąg, jak w AutoCADzie.

## Missing

Pozostałe style AutoCADa – Model szkieletowy, Realistyczny, Cieniowany, Cieniowany z krawędziami, Odcienie szarości, Szkic i Pochłanianie światła – oraz podawanie nazwy stylu i wypisywanie ich przez `?`: pytanie wymienia tylko trzy zbudowane style i odrzuca każdą inną odpowiedź.

## Questions

### Jak zmienić styl wizualny w AutoCADzie?

Uruchom BIEŻSTYLWIZ (polecenie nie ma skrótu w polskim AutoCADzie; angielskiego `VS` w nim nie ma) i wybierz styl: <Keyword id="Hidden" />, aby ukryć krawędzie z tyłu, <Keyword id="Conceptual" />, aby cieniować powierzchnie. Zmienia tylko widok, nie obiekty.

### Jak wrócić do modelu szkieletowego 2D?

Uruchom BIEŻSTYLWIZ i wybierz <Keyword id="2dwireframe" />, w polskim AutoCADzie litery `2D`.

### Czym się różni styl Ukryty od Koncepcyjnego?

Oba ukrywają to, co zasłaniają powierzchnie. Ukryty rysuje tylko krawędzie, na tle, jak rysunek kreskowy; Koncepcyjny maluje też powierzchnie, cieniowane światłem, z tymi samymi krawędziami na wierzchu.

### Dlaczego przez bryłę nadal widać linie?

Nie należą do bryły. Linie, okręgi i regiony rysują się jak w Modelu szkieletowym 2D w każdym stylu, więc linia za prostopadłościanem nadal jest widoczna. W stylu <Keyword id="2dwireframe" /> widać też tylne krawędzie samej bryły: wybierz <Keyword id="Hidden" />.

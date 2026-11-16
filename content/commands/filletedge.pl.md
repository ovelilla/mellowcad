---
title: "Polecenie ZAOKRĄGLKRAW (FILLETEDGE) w AutoCADzie"
description: "Jak zaokrąglić krawędzie bryły 3D w AutoCADzie poleceniem ZAOKRĄGLKRAW (FILLETEDGE): krawędzie, łańcuch, pętla, promień i uchwyt strzałkowy. Wypróbuj za darmo."
figure: "Prostopadłościan widziany z południowego wschodu: ZAOKRĄGLKRAW z promieniem 8 zaokrągla jego dwie pionowe krawędzie po prawej."
sourceHash: "403a055efb24"
---

Polecenie ZAOKRĄGLKRAW (FILLETEDGE) zaokrągla krawędzie bryły 3D. Podaje bieżący promień, a potem pyta o krawędzie, aż do Enter: kliknięcie bierze krawędź pod kursorem, podświetlaną, gdy kursor nad nią przechodzi, a wpisany punkt – krawędź, która przez niego przechodzi. W miarę wybierania krawędzi bryła jest rysowana tak, jak będzie wyglądać, z zaokrągleniami na miejscu. Enter liczy krawędzie i prosi o ponowne naciśnięcie Enter, aby przyjąć, albo o zmianę promienia; ten Enter tworzy zaokrąglenia. Tylko krawędzie jednej bryły: krawędź innej daje <Message id="filletMultipleBodies" />, a wybrana dwa razy <Message id="edgeAlreadyPicked" />.

Prosta krawędź między dwiema płaskimi ścianami staje się ćwiartką walca, a okrągła krawędź otworu lub obrzeża – ćwiartką torusa; zaokrąglenia, które spotykają się w narożniku, są łączone, trzy z nich fragmentem kuli. Promień jest zapisywany w rysunku i proponowany ponownie następnym razem. Bryła zachowuje warstwę i właściwości, ale traci to, z czego powstała: prostopadłościan nie jest już prostopadłościanem. Całe polecenie to jeden krok cofania. 3D w MellowCAD to tylko bryły 3D, na razie częściowo.

## Options

### Chain

Bierze wskazaną krawędź i każdą krawędź do niej styczną, jedną po drugiej: osiem wokół górnej ściany klocka, którego pionowe krawędzie są już zaokrąglone. Gdy żadna nie jest styczna, mówi <Message id="noTangentChainEdges" /> i bierze tylko wskazaną. <Keyword id="Edge" /> wraca do pojedynczych krawędzi.

### Loop

Bierze każdą krawędź wokół ściany: wskaż jedną krawędź, a potem <Keyword id="Accept" /> dla pokazanej pętli albo <Keyword id="Next" /> dla pętli drugiej ściany, do której należy krawędź.

### Radius

Pyta o promień, wpisany albo jako odległość między dwoma punktami; 0 lub mniej daje <Message id="radiusTooSmall" />. <Keyword id="Expression" /> przyjmuje go jako wzór. Przy monicie przyjęcia zmienia promień pokazanych zaokrągleń. Uchwyt strzałkowy w środku pierwszego zaokrąglenia ustawia go przeciąganiem: kliknij go, przesuń, kliknij; <Keyword id="eXit" /> lub Esc zostawia go bez zmian.

## Missing

Zaokrąglenia o dwóch promieniach, które się spotykają, i zaokrąglenie kończące się na zakrzywionej ścianie. Zaokrąglenie szersze niż sąsiednia ściana, które AutoCAD przetacza przez następną krawędź: tutaj kończy się błędem modelowania. Prosta krawędź obok zakrzywionej ściany, okrągła krawędź poza osią swojego walca i każda krawędź kuli, torusa, bryły wyciągniętej lub obrotowej, które kończą się tak samo. Niektóre narożniki, w których zaokrąglenia spotykają się na krawędziach o różnym nachyleniu. Uchwyt strzałkowy na krawędzi innej niż pierwsza i linia od niego do kursora. Wskazanie krawędzi bryły w poleceniu <Command id="FILLET" />, na co AutoCAD też pozwala. Zaokrąglenie rysowane jako siatka podczas wskazywania i powierzchnie.

## Questions

### Jak zaokrąglić krawędź bryły 3D w AutoCADzie?

Uruchom polecenie ZAOKRĄGLKRAW, wybierz <Keyword id="Radius" /> i wpisz go, wskaż krawędzie, a potem dwa razy naciśnij Enter: raz, aby zakończyć wskazywanie, drugi raz, aby przyjąć. W pokazanej sesji `8` zaokrągla dwie krawędzie prostopadłościanu.

### Jak zaokrąglić wszystkie krawędzie ściany?

Wybierz <Keyword id="Loop" /> i wskaż krawędź ściany, potem <Keyword id="Accept" /> albo <Keyword id="Next" />, jeśli pokazana pętla należy do drugiej ściany. Dla krawędzi, które już płynnie przechodzą jedna w drugą, jak wokół góry zaokrąglonego klocka, <Keyword id="Chain" /> bierze je wszystkie.

### Dlaczego polecenie ZAOKRĄGL nie działa na bryle 3D?

Polecenie <Command id="FILLET" /> w AutoCADzie też zaokrągla krawędź bryły, ale w MellowCAD jeszcze nie: użyj polecenia ZAOKRĄGLKRAW, a do fazy – polecenia <Command id="CHAMFEREDGE" />.

### Jak zmienić promień zaokrąglenia?

Wybierz <Keyword id="Radius" /> przed wskazaniem albo przy monicie przyjęcia, lub przeciągnij uchwyt strzałkowy w środku pierwszego zaokrąglenia. Ostatni promień jest proponowany następnym razem.

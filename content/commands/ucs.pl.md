---
title: "Polecenie LUW (UCS) w AutoCADzie: lokalny układ współrzędnych"
metaTitle: "Polecenie LUW (UCS) w AutoCADzie"
description: "Jak polecenie LUW (UCS) w AutoCADzie przesuwa i obraca lokalny układ współrzędnych: początek i 3 punkty, Obiekt, Widok, X, Y, Z, Ośz, Nazwana, Globalny."
figure: "Prostopadłościan widziany z południowego wschodu: LUW przenosi początek na jego górę, a okrąg narysowany potem w 30,20 leży na górnej ścianie, nie na ziemi."
sourceHash: "217908def9dc"
---

Polecenie LUW (UCS) ustala lokalny układ współrzędnych: początek oraz osie X i Y w dowolnym miejscu przestrzeni, więc jego płaszczyzna XY może być nachylona. Wpisywane współrzędne są w nim odczytywane, a to, co rysujesz, leży w jego płaszczyźnie XY: po przeniesieniu początku na górę prostopadłościanu okrąg o środku w `30,20` leży na górze. Najpierw podaje nazwę bieżącego układu LUW – `*GLOBALNY*`, `*BEZ NAZWY*` albo nazwę, pod którą go zapisano – a potem pyta o nowy początek lub opcję; Enter w tym miejscu wraca do układu globalnego. Punkt jest początkiem, ze swoją współrzędną Z, a punkt bez Z leży na bieżącym poziomie. Następnie pyta o punkt na dodatniej osi X i punkt na płaszczyźnie XY, odczytywane w bieżącym układzie LUW: Enter przy którymkolwiek pozostawia osie bez zmian. Jeden punkt przesuwa LUW, trzy obracają go dowolnie.

Polecenia działają potem w płaszczyźnie XY układu LUW: <Command id="LINE" /> i <Command id="CIRCLE" /> rysują na niej, a <Command id="BOX" /> i <Command id="EXTRUDE" /> tworzą bryły wznoszące się z niej wzdłuż jej osi Z. Każdy obiekt zachowuje własną płaszczyznę, gdy LUW się zmienia, a <Command id="PLAN" /> pokazuje bieżący LUW prosto z góry. LUW zapisuje się w rysunku, a każde wykonanie to jeden krok cofania. Funkcje 3D w MellowCAD obejmują tylko bryły i wciąż są częściowe.

## Options

### Face

Wyrównuje LUW do powierzchni bryły: powierzchnia pod kursorem zostaje podświetlona, a symbol LUW pokazuje, gdzie trafiłby LUW, i kliknięcie go przyjmuje, z początkiem we wskazanym punkcie i osią Z skierowaną na zewnątrz bryły. Oś X biegnie wzdłuż tej krawędzi powierzchni, która jest najbliżej miejsca, w którym kursor na nią wszedł, albo poziomo, gdy ta krawędź stoi pionowo. Potem <Keyword id="Next" /> przechodzi do następnej powierzchni za nią w kierunku patrzenia (na krawędzi do jej drugiej powierzchni), <Keyword id="Xflip" /> i <Keyword id="Yflip" /> obracają LUW o pół obrotu wokół jego osi X lub Y, a Enter go przyjmuje. Punkt, pod którym nie ma powierzchni żadnej bryły, daje komunikat <Message id="noSolidSurfaceOrMesh" />.

### NAmed

Zapisane układy LUW, według nazwy. <Keyword id="Save" /> zapisuje bieżący, pytając <Keyword id="Yes" /> lub <Keyword id="No" />, zanim zastąpi nazwę już zapisaną; <Keyword id="Restore" /> ustawia zapisany jako bieżący, a jego nazwę można wpisać literami dowolnej wielkości; <Keyword id="Delete" /> przyjmuje nazwy, z przecinkami i symbolami wieloznacznymi; <Keyword id="?" /> wypisuje je, każdą z jej początkiem i osiami. Nazwa może zawierać spacje, ale nie `<>/\":;|,=*?` ani odwrotny apostrof: <Message id="invalidUcsName" />.

### OBject

Wyrównuje LUW do wskazanego obiektu: linii, okręgu, łuku, elipsy, polilinii, splajnu, tekstu, tekstu wielowierszowego, definicji atrybutu lub odnośnika bloku. Początek i oś X trafiają tam, gdzie umieszcza je AutoCAD dla danego rodzaju obiektu, a oś Z to własna normalna obiektu, więc LUW leży w płaszczyźnie obiektu. Można wskazać obiekt na zablokowanej warstwie. Przy kreskowaniu polecenie wyświetla <Message id="ucsNoCoordinateSystem" /> i kończy działanie, nie zmieniając układu LUW.

### Previous

Wraca do poprzedniego układu LUW, do dziesięciu układów wstecz w sesji, w tym nazwanych i ortogonalnych. Gdy nie ma już żadnego: <Message id="noPreviousUcs" />.

### View

Obraca płaszczyznę XY prostopadle do kierunku patrzenia, z osią X wzdłuż poziomu ekranu, zachowując początek: tekst narysowany potem leży płasko na ekranie widoku 3D.

### World

Powrót do globalnego układu współrzędnych, który nigdy się nie przesuwa. To wartość domyślna pierwszego monitu, więc wybiera ją Enter; przywraca też poziom 0.

### X

Obraca LUW wokół jego osi X: domyślnie o 90 stopni, o wpisany kąt albo o kąt wyznaczony punktem. Kąt dodatni obraca zgodnie z regułą prawej dłoni, więc 90 stawia płaszczyznę XY pionowo na dawnej osi X.

### Y

Obraca LUW wokół jego osi Y, tak jak <Keyword id="X" /> wokół X.

### Z

Obraca LUW wokół jego osi Z, tak jak <Keyword id="X" /> wokół X: 30 obraca X i Y o 30 stopni przeciwnie do ruchu wskazówek zegara, patrząc z góry.

### ZAxis

Pyta o nowy początek (Enter zachowuje bieżący), a potem o punkt na dodatniej osi Z: płaszczyzna XY staje prostopadle do niej, a jej oś X pozostaje pozioma względem płaszczyzny XY układu globalnego. Przy dwóch pokrywających się punktach polecenie wyświetla <Message id="pointsAreCoincident" />. Jej opcja <Keyword id="Object" /> przyjmuje linię, łuk, otwartą polilinię lub splajn: początek w końcu najbliższym wskazania, a oś Z wzdłuż obiektu, skierowana od tego końca.

## Missing

<Keyword id="Face" /> na obiektach powierzchniowych i siatkach, których MellowCAD nie ma, oraz jej tryby Okno i Krawędź na bryle. Zastosuj i Przekrój, wymienione przy pierwszym monicie i tutaj odrzucane, bo jest jedna rzutnia i nie ma obiektów przekroju. Okno dialogowe LUW (MENLUW), uchwyty symbolu i jego menu skrótów oraz symbol pokazujący nowy LUW podczas jego umieszczania. Kursor obracający się razem z LUW: pozostaje prosto na ekranie, dopóki <Command id="PLAN" /> nie wyrówna z nim widoku. UCSFOLLOW, UCSVP i dynamiczny LUW. <Keyword id="OBject" /> dla wymiaru oraz Grupa przy wskazaniu. Głębokość, którą zachowuje ortogonalny LUW. Pauza `Naciśnij klawisz ENTER by kontynuować:` w długiej liście.

## Questions

### Jak przywrócić globalny układ współrzędnych w AutoCADzie?

Uruchom polecenie LUW i naciśnij Enter: <Keyword id="World" /> to wartość domyślna. Aby znów patrzeć na rysunek prosto z góry, uruchom <Command id="PLAN" /> i wybierz <Keyword command="PLAN" id="World" />.

### Jak obrócić LUW w AutoCADzie?

Uruchom polecenie LUW, wybierz <Keyword id="Z" /> i wpisz kąt: `30` obraca X i Y o 30 stopni przeciwnie do ruchu wskazówek zegara. <Keyword id="X" /> i <Keyword id="Y" /> pochylają płaszczyznę XY, domyślnie o 90 stopni.

### Czym się różni LUW od GUW?

Globalny układ współrzędnych (GUW) nigdy się nie przesuwa; lokalny układ współrzędnych (LUW) to ten, który przesuwasz i obracasz. Na początku są takie same, a LUW podaje, że bieżący to `*GLOBALNY*`. Wpisywane współrzędne są odczytywane w LUW, a to, co rysujesz, leży w jego płaszczyźnie XY.

### Jak rysować na powierzchni bryły 3D?

Przenieś na nią LUW. LUW, <Keyword id="Face" />, potem kliknij powierzchnię i naciśnij Enter: LUW leży na niej, z osią Z skierowaną na zewnątrz bryły. Na górze prostopadłościanu wystarczy też sam początek: LUW, potem narożnik góry, potem Enter, jak w przykładzie. Potem rysuj: to, co narysujesz, leży na powierzchni.

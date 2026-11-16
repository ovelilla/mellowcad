---
title: "Lokalizacja względem obiektu w AutoCADzie: polecenie -OBIEKT (-OSNAP)"
metaTitle: "Lokalizacja w AutoCADzie: -OBIEKT (-OSNAP) i F3"
description: "Lokalizacja względem obiektu w AutoCADzie: -OBIEKT (-OSNAP) ustawia stałe tryby, F3 je włącza i wyłącza, a KOŃ, SYM lub Shift + prawy przycisk wymuszają jeden."
figure: "-OBIEKT ustawia stałe tryby Punkt symetrii i Środek; LINIA biegnie potem od punktu symetrii boku do środka okręgu, a górny bok pokazuje znacznik punktu symetrii."
sourceHash: "627cd26c12df"
---

Lokalizacja względem obiektu umieszcza wskazany punkt dokładnie w charakterystycznym punkcie obiektu: w punkcie końcowym, w punkcie symetrii, w środku. Gdy lokalizacja jest włączona, kursor w pobliżu takiego punktu pokazuje jego zielony znacznik i nazwę w etykiecie narzędzia; kliknięcie trafia wtedy w ten punkt, a nie tam, gdzie stoi kursor. Stałe tryby lokalizacji działają przy każdym monicie o punkt: na początku Punkt końcowy, Środek, Punkt przecięcia i Przedłużenie, jak w AutoCADzie. F3 włącza i wyłącza lokalizację względem obiektu, wypisując `<Stałe tryby lokalizacji włącz>` lub `<Stałe tryby lokalizacji wyłącz>`; to samo robi przycisk Lokalizacja względem obiektu na pasku stanu, którego menu ma pole wyboru dla każdego trybu. Gdy pod kursorem jest kilka punktów lokalizacji, wygrywa najbliższy, a klawisz Tab przechodzi między pozostałymi. Tryb orto, śledzenie biegunowe i tryb skoku nigdy nie przesuwają zlokalizowanego punktu.

Polecenie -OBIEKT (-OSNAP) ustawia stałe tryby w wierszu polecenia. Wypisuje tryby, które działają teraz, a potem prosi o listę trybów: każdy skrótem z wielkich liter jego nazwy, oddzielone przecinkami, jak `KOŃ,SYM,CEN`, lub `_END,_MID` w AutoCADzie w każdym języku. Lista zastępuje stały zestaw i włącza lokalizację względem obiektu; <Keyword id="NONe" />, <Keyword id="OFF" /> lub sam Enter go czyści. Na nieznany tryb polecenie odpowiada <Message id="invalidOsnapModes" /> i pyta ponownie. Wpisane z apostrofem, `'-OBIEKT`, działa wewnątrz innego polecenia. Stałe tryby obowiązują do ponownego wczytania strony, a potem znów są to cztery tryby AutoCADa: jak w AutoCADzie, rysunek ich nie przechowuje.

Dla jednego punktu można je zastąpić: wpisz wielkie litery trybu w odpowiedzi na monit o punkt, `SYM` lub `_MID`, albo przytrzymaj Shift i kliknij prawym przyciskiem myszy, aby wybrać tryb z menu. Szukany jest wtedy tylko ten tryb, niezależnie od stałych, i tylko dla tego punktu; jeśli niczego nie znajdzie, punkt zostaje odrzucony i monit się powtarza. Wpisany wielkimi literami, <Keyword id="NONe" /> wyłącza lokalizację dla jednego punktu. To samo menu oferuje <Command id="FROM" />: punkt bazowy, a potem odsunięcie od niego, więc `@10,0` to 10 w prawo od niego.

## Options

### ENDpoint

Najbliższy koniec linii, łuku, segmentu polilinii, łuku eliptycznego lub splajnu: narożniki prostokąta, wierzchołki wieloboku. Znacznik to kwadrat.

### MIDpoint

Punkt w połowie długości linii, łuku, segmentu polilinii, łuku eliptycznego lub splajnu. Trójkąt.

### CENter

Środek okręgu, łuku lub łukowego segmentu polilinii. Przesuń kursor nad samą krzywą: w środku nie ma czego uchwycić. Okrąg.

### NODe

Obiekt punktu, taki jak te, które tworzą polecenia <Command id="POINT" />, <Command id="DIVIDE" /> i <Command id="MEASURE" />, niezależnie od kształtu, jaki nadaje im <Command id="PTYPE" />. Na początku nie należy do stałych trybów. Okrąg z krzyżykiem.

### QUAdrant

Punkty okręgu lub łuku na 0°, 90°, 180° i 270°, wzdłuż osi X i Y układu LUW, oraz końce osi elipsy. Romb.

### INTersection

Miejsce, w którym przecinają się dwa obiekty albo ścieżka śledzenia biegunowego przecina obiekt. Krzyżyk.

### EXTension

Za końcem linii, łuku lub prostego segmentu polilinii: przesuń kursor nad koniec, a potem odsuń go wzdłuż linii obiektu. Od końca pojawia się przerywana ścieżka, a wpisana odległość odmierzana jest wzdłuż niej. Plus.

### INSertion

Punkt wstawienia tekstu, definicji atrybutu lub odnośnika bloku.

### PERpendicular

Spodek prostopadłej z ostatniego punktu na linię, także poza jej końcami, na okrąg, łuk lub segment polilinii. Przy pierwszym punkcie polecenia <Command id="LINE" /> czeka na następny punkt: linia wychodzi z obiektu pod kątem prostym. Kąt prosty.

### TANgent

Punkt okręgu lub łuku, w którym dotyka go linia z ostatniego punktu. Przy pierwszym punkcie polecenia <Command id="LINE" /> czeka na następny punkt: linia wychodzi z krzywej stycznie do niej. Okrąg z kreską.

### NEArest

Punkt obiektu najbliższy kursorowi. Klepsydra.

### APParent

Pozorne przecięcie: miejsce, w którym dwa obiekty przecinają się w widoku, choć leżą na różnych wysokościach; tam, gdzie naprawdę się spotykają, jest to ich punkt przecięcia.

### PARallel

Przytrzymaj kursor przez chwilę nad linią, a potem prowadź go od ostatniego punktu w jej kierunku: ścieżka równoległa do linii trzyma następny punkt.

### NONe

Brak stałych trybów: lokalizacja względem obiektu niczego nie znajduje, dopóki tryb nie zostanie ustawiony ponownie.

### OFF

To samo co <Keyword id="NONe" />: stały zestaw zostaje wyczyszczony.

## Missing

Okno dialogowe Ustawienia rysunkowe, które w AutoCADzie otwierają OBIEKT i OO: tu są to nieznane polecenia, a tryby ustawia menu paska stanu. Środek geometryczny, jako tryb i w menu. Tryb Punkt na punktach definiujących wymiar i na początku jego tekstu: tu znajduje tylko obiekty punktów. Środek między 2 punktami, tymczasowy punkt śledzenia i klawisze przytrzymywane dla jednorazowej lokalizacji (Shift + A, Shift + Q…). Punkt przecięcia, Prostopadle i Styczna na elipsach, Prostopadle i Styczna na splajnach oraz Przedłużenie od końca łukowego segmentu polilinii albo z odległością i kątem w etykiecie narzędzia. Prostopadle lub Styczna czekające na drugi punkt na początku innego polecenia niż <Command id="LINE" /> i <Command id="CIRCLE" />. Ustawienia celownika i znacznika, CELOWNIK i AUTOSNAP.

## Questions

### Co robi polecenie OBIEKT (OSNAP) w AutoCADzie?

W AutoCADzie polecenie OBIEKT (`OO`; po angielsku OSNAP, `OS`) otwiera okno dialogowe Ustawienia rysunkowe na karcie Lokalizacja względem obiektu, aby wybrać stałe tryby. MellowCAD nie ma takiego okna: wpisz `-OBIEKT` lub `-O` i listę trybów albo zaznacz je w menu przycisku Lokalizacja względem obiektu na pasku stanu.

### Jak włączyć lokalizację względem obiektu w AutoCADzie?

F3 włącza i wyłącza lokalizację względem obiektu, jak w AutoCADzie; przycisk Lokalizacja względem obiektu na pasku stanu robi to samo. Shift + prawy przycisk myszy w odpowiedzi na monit o punkt otwiera menu jednorazowych trybów lokalizacji.

### Dlaczego nie działa lokalizacja w AutoCADzie?

Mógł ją wyłączyć klawisz F3: widać to po przycisku na pasku stanu. Albo tryb nie należy do stałych: ustaw go poleceniem `-OBIEKT` lub w menu przycisku. Kursor musi zbliżyć się do punktu na mniej więcej 10 pikseli, a dla środka znaleźć się nad samym okręgiem lub łukiem. Lokalizacja działa tylko wtedy, gdy polecenie prosi o punkt.

### Jak użyć lokalizacji tylko dla jednego punktu?

W odpowiedzi na monit o punkt wpisz wielkie litery trybu, na przykład `KOŃ` lub `STY`, albo wybierz go z menu Shift + prawy przycisk myszy. Działa tylko dla tego punktu, niezależnie od tego, czy ten tryb należy do stałych.

### Czy ustawienia lokalizacji względem obiektu są zapamiętywane?

Do ponownego wczytania strony; potem znów są to Punkt końcowy, Środek, Punkt przecięcia i Przedłużenie. AutoCAD również nie przechowuje ich w rysunku.

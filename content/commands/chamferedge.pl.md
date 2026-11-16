---
title: "Fazowanie krawędzi bryły w AutoCADzie: polecenie FAZOWKRAW (CHAMFEREDGE)"
metaTitle: "Fazowanie krawędzi w AutoCADzie: FAZOWKRAW"
description: "Jak sfazować krawędzie bryły 3D w AutoCADzie poleceniem FAZOWKRAW (CHAMFEREDGE): krawędzie jednej ściany, Pętla, dwie odległości. Wypróbuj za darmo."
figure: "Prostopadłościan widziany od południowego wschodu: FAZOWKRAW z obiema odległościami 6 ścina dwie górne krawędzie przy jego przednim narożniku, które spotykają się w linii."
sourceHash: "43b1908ad4b3"
---

Polecenie FAZOWKRAW (CHAMFEREDGE) ścina krawędzie bryły 3D. Podaje dwie bieżące odległości, a potem pyta o krawędź i, po pierwszej, o kolejne na tej samej ścianie, aż do Enter: kliknięcie bierze krawędź pod kursorem, wpisany punkt krawędź narysowaną przez niego. Krawędź, która nie ma wspólnej ściany z pierwszymi, daje komunikat <Message id="edgesOneFace" />, a krawędź innej bryły <Message id="chamferMultipleBodies" />. W miarę wskazywania krawędzi bryła jest rysowana tak, jak będzie wyglądać. Enter prosi potem o ponowne naciśnięcie Enter, aby zaakceptować fazowanie, albo o zmianę odległości dla tej fazy; ten Enter ją tworzy.

Pierwsza odległość biegnie wzdłuż ściany wspólnej dla krawędzi; dla pojedynczej krawędzi wzdłuż ściany, którą wybiera AutoCAD: przedniej dla górnej przedniej krawędzi prostopadłościanu i górnej dla obrzeża walca. Prosta krawędź między dwiema płaskimi ścianami staje się płaskim pasem, okrągła krawędź otworu lub obrzeża pasem stożka, a fazy spotykające się w narożniku łączą się w linii. Odległości są proponowane ponownie przy następnym użyciu. Bryła zachowuje warstwę i właściwości, ale traci to, z czego powstała: prostopadłościan nie jest już prostopadłościanem. Całe polecenie to jeden krok cofania. 3D w MellowCAD to tylko bryły 3D, wciąż częściowo.

## Options

### Loop

Bierze wszystkie krawędzie wokół ściany: wskaż jedną krawędź, a potem <Keyword id="Accept" /> dla pokazanej pętli albo <Keyword id="Next" /> dla pętli drugiej ściany, do której należy krawędź. <Keyword id="Edge" /> wraca do pojedynczych krawędzi.

### Distance

Pyta o pierwszą odległość, potem o drugą, każdą wpisaną lub jako odległość między dwoma punktami; 0 lub mniej daje komunikat <Message id="distanceTooSmall" />. <Keyword id="Expression" /> przyjmuje odległość jako wzór. Przy monicie akceptacji pyta o odległość na powierzchni bazowej i na drugiej powierzchni, tylko dla tej fazy.

## Missing

Narożnik, w którym spotykają się trzy sfazowane krawędzie. Prosta krawędź obok zakrzywionej ściany, okrągła krawędź poza osią swojego walca i każda krawędź sfery, torusa, bryły wyciągniętej lub obrotowej: tu kończą się błędem modelowania. Dwa uchwyty strzałek, które AutoCAD pokazuje przy monicie akceptacji, po jednym na odległość. Wskazanie krawędzi bryły w poleceniu <Command id="CHAMFER" />, na które AutoCAD też pozwala. Faza rysowana jako siatka podczas wskazywania oraz powierzchnie.

## Questions

### Jak sfazować krawędź bryły 3D w AutoCADzie?

Uruchom FAZOWKRAW, wybierz <Keyword id="Distance" /> i podaj obie odległości, wskaż krawędzie jednej ściany, a potem dwa razy naciśnij Enter: raz, aby zakończyć wskazywanie, i raz, aby zaakceptować. `6` i `6` z sesji ścinają dwie górne krawędzie prostopadłościanu.

### Dlaczego FAZOWKRAW mówi, że krawędzie muszą należeć do jednej ściany?

Krawędzie jednej fazy mają wspólną ścianę: wzdłuż niej biegnie pierwsza odległość. Krawędzie innej ściany sfazuj w drugim wywołaniu.

### Dlaczego FAZUJ nie działa na bryle 3D?

<Command id="CHAMFER" /> w AutoCADzie także ścina krawędź bryły, ale w MellowCAD jeszcze nie: użyj FAZOWKRAW, a do zaokrąglenia krawędzi <Command id="FILLETEDGE" />.

### Jak sfazować krawędź otworu?

Wskaż jego okrągłą krawędź tam, gdzie styka się z płaską ścianą: faza jest pasem stożka wokół otworu.

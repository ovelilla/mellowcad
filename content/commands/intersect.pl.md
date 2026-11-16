---
title: "Polecenie ILOCZYN (INTERSECT) w AutoCADzie"
description: "Jak działa ILOCZYN (INTERSECT) w AutoCADzie: z dwóch lub więcej brył 3D albo regionów w jednej płaszczyźnie zostaje tylko część wspólna, reszta znika."
figure: "Prostopadłościan i nachodząca na niego kula, przecięte: ich część wspólna to kula z sześcioma płaskimi ścianami, widziana z południowego wschodu."
sourceHash: "c8ea61c0525d"
---

Polecenie ILOCZYN (INTERSECT) zachowuje tylko to, co dwie lub więcej brył 3D albo dwa lub więcej regionów w jednej płaszczyźnie mają wspólne, a resztę wymazuje: prostopadłościan i nachodząca na niego kula zostawiają kulę z płaskimi ścianami. Pyta o obiekty aż do Enter, tak jak polecenie <Command id="UNION" />, i pomija to, co nie jest ani bryłą, ani regionem. Jak w AutoCADzie 2027, zbiór wybrany przed poleceniem jest porzucany i pytanie o obiekty pada ponownie. Bryły i regiony są liczone osobno, regiony płaszczyzna po płaszczyźnie.

Obiekt wskazany jako pierwszy staje się wynikiem, z jego warstwą i kolorem, a pozostałe są wymazywane; przy oknie, oknie przecinającym lub WSZYSTKO jest to najnowszy z nich. Wynik to bryła złożona, już nie prostopadłościan ani kula, bez historii. Gdy obiekty nie mają nic wspólnego, polecenie mówi <Message id="nullSolid" /> lub <Message id="nullRegion" /> i wymazuje je wszystkie, jak AutoCAD. Całe polecenie to jeden krok cofania. 3D w MellowCAD jest wciąż częściowe: bryły istnieją, powierzchnie i siatki nie.

## Missing

Powierzchnie, których tutaj nie ma. Zakrzywione ściany spotykające się wzdłuż krzywej, dla której MellowCAD nie ma jeszcze dokładnej postaci: walce, stożki, kule lub torusy, których osie ani się nie pokrywają, ani nie są równoległe (dwa walce mogą się też krzyżować); stożek z czymkolwiek poza płaszczyzną lub bryłą na jego osi; torus lub bryła obrotowa z płaszczyzną ani prostopadłą do jej osi, ani przez nią przechodzącą, albo z bryłą poza jej osią; bryła wyciągnięta z czymkolwiek poza płaszczyzną lub ścianą wyciągniętą w jej kierunku. Są one odrzucane z komunikatem, że jedna operacja logiczna się nie powiodła, a bryły zostają bez zmian; tak samo cięcie, które styka się z krawędzią stycznie, ściany prawie, ale nie całkiem na jednej powierzchni, i bardzo cienki pasek między cięciem a krawędzią. Walec leżący wzdłuż ściany prostopadłościanu łączy się w prawidłową objętość, ale z jedną krawędzią i jedną ścianą mniej niż w AutoCADzie. Historia brył nie jest zachowywana (SOLIDHIST, SHOWHISTORY), a to, który obiekt zostaje przy wyborze krawędzią wybierającą lub zbiorem Poprzedni, nie jest sprawdzone.

## Questions

### Jak się nazywa polecenie ILOCZYN po angielsku i jaki ma skrót?

INTERSECT. W polskim AutoCADzie jego skrót to `IL`: wpisz go i naciśnij Enter lub spację. Angielskie `IN` w polskiej wersji nie działa; pełna nazwa działa, a `_INTERSECT` – w AutoCADzie w każdym języku.

### Czym się różnią polecenia SUMA, RÓŻNICA i ILOCZYN?

Wszystkie trzy tworzą jeden obiekt z brył 3D albo z regionów w jednej płaszczyźnie. Polecenie <Command id="UNION" /> zachowuje wszystko, co pokrywa którykolwiek z nich, polecenie <Command id="SUBTRACT" /> zachowuje pierwszy zbiór pomniejszony o drugi, a polecenie ILOCZYN zachowuje tylko to, co wszystkie mają wspólne. Każde to jeden krok cofania i każde wymazuje obiekty, które zużyło.

### Jak przeciąć linie w AutoCADzie?

Nie poleceniem ILOCZYN, które działa na bryłach i regionach i pomija linie. Aby znaleźć miejsce, w którym dwie linie się przecinają, przyciągnij do niego lokalizacją Przecięcie; aby się spotkały, użyj polecenia <Command id="FILLET" /> z promieniem 0, <Command id="TRIM" /> lub <Command id="EXTEND" />.

### Dlaczego polecenie ILOCZYN usuwa moje obiekty?

Bo nie mają nic wspólnego: bez części wspólnej mówi <Message id="nullSolid" />, a dla regionów <Message id="nullRegion" />, i wymazuje je, jak AutoCAD. Polecenie <Command id="U" /> je przywraca. Jedna bryła i jeden region albo dwa regiony w różnych płaszczyznach w ogóle nie są przecinane: polecenie mówi <Message id="booleanNeedsTwo" /> i niczego nie zmienia.

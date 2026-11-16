---
title: "Polecenie EDBRYŁA (SOLIDEDIT) w AutoCADzie"
description: "Jak polecenie EDBRYŁA (SOLIDEDIT) w AutoCADzie edytuje powierzchnie bryły 3D krok po kroku: Wyciągnij, Przesuń, Obróć, Odsuń, Pochyl, Usuń i Kopiuj."
figure: "Górna powierzchnia prostopadłościanu wyciągnięta o 15 w górę z pochyleniem 15 stopni poleceniem EDBRYŁA: ostrosłup ścięty na prostopadłościanie, widok z południowego wschodu."
sourceHash: "775cdc271d4f"
---

Polecenie EDBRYŁA (SOLIDEDIT) edytuje bryłę 3D przez jej powierzchnie. Najpierw informuje, czy każda edycja jest sprawdzana, a potem pyta, co edytować: <Keyword id="Face" />, potem opcję powierzchni, potem powierzchnie, a potem to, czego opcja potrzebuje. Każda edycja jest wykonywana od razu, a opcje powierzchni pojawiają się ponownie, więc jedno wykonanie może wprowadzić kilka zmian; <Keyword id="eXit" /> lub Enter opuszcza opcje powierzchni, a potem polecenie. Sąsiednie powierzchnie podążają za edytowaną: przesuń górę prostopadłościanu w górę, a jego boki wydłużą się, aby się z nią spotkać.

Bryła zachowuje swoją warstwę i właściwości, ale traci to, z czego powstała: prostopadłościan nie jest już prostopadłościanem. Całe wykonanie to jeden krok cofania, a jego opcja <Keyword id="Undo" /> cofa edycje wewnątrz niego jedna po drugiej. Enter przy `Polecenie:` uruchamia je ponownie od pierwszego pytania. Przycisk powierzchni w panelu Edycja brył uruchamia bezpośrednio każdą opcję powierzchni. 3D w MellowCAD to tylko bryły i wciąż jest częściowe.

## Options

### Face

Opcje powierzchni. Każda pyta o powierzchnie, aż naciśniesz Enter: kliknięcie lub wpisany punkt wybiera najbliższą ci powierzchnię pod nim albo dwie powierzchnie krawędzi w tym miejscu, a wskazanie powierzchni już wybranej wybiera tę, która leży za nią. Gdy wybrano już powierzchnię, <Keyword id="ALL" /> wybiera wszystkie powierzchnie jej bryły; <Keyword id="Remove" /> usuwa powierzchnie ze zbioru, a <Keyword id="Undo" /> cofa ostatnie wskazanie. Po wskazaniu pustego miejsca polecenie wyświetla <Message id="noSolidsDetected" />. Tylko powierzchnie jednej bryły.

### Extrude

Pyta o wysokość i kąt zwężania: każda powierzchnia wyrasta w graniastosłup dodany do bryły albo, przy wysokości ujemnej, od niej odjęty, zwężający się ku górze przy kącie dodatnim. Enter przy wysokości przyjmuje ostatnią wysokość użytą przez bryły podstawowe lub <Command id="EXTRUDE" />.

### Move

Pyta o punkt bazowy i drugi punkt: płaska powierzchnia przesuwa się o tyle, ile wynosi ten wektor wzdłuż jej normalnej, pociągając za sobą sąsiednie. Enter przy drugim punkcie przyjmuje punkt bazowy jako przemieszczenie.

### Rotate

Pyta o oś, przez dwa punkty albo wzdłuż osi <Keyword id="Xaxis" />, <Keyword id="Yaxis" /> lub <Keyword id="Zaxis" /> układu LUW, albo prostopadle do ekranu przez <Keyword id="View" />, a potem o kąt: powierzchnia obraca się wokół niej zgodnie z regułą prawej dłoni.

### Offset

Pyta o odległość: powierzchnia przesuwa się na zewnątrz wzdłuż swojej normalnej albo do wewnątrz przy wartości ujemnej, pociągając za sobą sąsiednie; powierzchnie zakrzywione – wokół swojej osi. Odsunięcie do wewnątrz o połowę najdłuższego boku prostopadłościanu otaczającego bryłę jest odrzucane z informacją, jak daleko można je wykonać.

### Taper

Pyta o punkt bazowy, punkt na osi zwężania i kąt: powierzchnia pochyla się wokół linii, wzdłuż której przecina płaszczyznę przechodzącą przez punkt bazowy; kąt dodatni pochyla ją do wewnątrz wzdłuż osi.

### Delete

Usuwa ściankę otworu, zamykając otwór, albo pas zaokrąglenia lub fazy, przywracając krawędź, którą ten pas zastąpił.

### Copy

Tworzy region z każdej płaskiej powierzchni, w miejscu, gdzie ona leży, albo przesunięty o wektor wyznaczony dwoma punktami, na bieżącej warstwie i z bieżącymi właściwościami.

### Undo

Przy opcjach powierzchni cofa ostatnią edycję tego wykonania; gdy nie ma już żadnej, wyświetla <Message id="commandCompletelyUndone" />.

### eXit

Opuszcza opcje powierzchni i wraca do pierwszego pytania, a ta sama opcja w pierwszym pytaniu kończy polecenie; Enter działa tak samo.

## Missing

<Keyword id="Edge" /> i <Keyword id="Body" /> oraz <Keyword id="coLor" /> i <Keyword id="mAterial" /> powierzchni, które są na liście, ale zostają odrzucone, podobnie jak <Keyword id="Path" /> opcji <Keyword id="Extrude" />, oś przez obiekt opcji <Keyword id="Rotate" /> i jej kąt <Keyword id="Reference" />. <Keyword id="Crossing" />, <Keyword id="Fence" /> i <Keyword id="CPolygon" /> przy wyborze powierzchni. Przesuwanie, obracanie, pochylanie lub kopiowanie powierzchni zakrzywionej, odsuwanie jej, gdy ma innych sąsiadów, usuwanie powierzchni, która nie jest ścianką otworu ani pasem, oraz edycja zmieniająca kształt bryły tak bardzo, że jedna powierzchnia pochłania drugą. Edycje obok powierzchni wyciągniętej z pochyleniem. Odsunięcie na zewnątrz zbyt duże, by dało się je wykonać, które AutoCAD pomija bez komunikatu, a MellowCAD wykonuje. Podgląd podczas podawania odległości lub kąta.

## Questions

### Jak edytować bryłę 3D w AutoCADzie?

Uruchom EDBRYŁA, wybierz <Keyword id="Face" />, a potem działanie: <Keyword id="Extrude" /> lub <Keyword id="Move" /> powierzchni, aby podwyższyć bryłę, <Keyword id="Delete" />, aby zapełnić otwór, <Keyword id="Taper" />, aby pochylić bok. Wskaż powierzchnie, naciśnij Enter i odpowiedz na pytania opcji. Aby szybko wypchnąć lub wcisnąć powierzchnię, przeciągnij ją poleceniem <Command id="PRESSPULL" />.

### Jak wyciągnąć powierzchnię bryły 3D?

EDBRYŁA, <Keyword id="Face" />, <Keyword id="Extrude" />, wskaż powierzchnię i naciśnij Enter, potem wysokość i kąt zwężania: `15` i `15` z sesji wznoszą ostrosłup ścięty na górze prostopadłościanu.

### Jak usunąć otwór z bryły w AutoCADzie?

EDBRYŁA, <Keyword id="Face" />, <Keyword id="Delete" />, wskaż ściankę otworu i naciśnij Enter: otwór zostaje zapełniony. Tak samo usuwa się zaokrąglenie lub fazę.

### Czym się różni EDBRYŁA od NACIŚNIJCIĄG?

<Command id="PRESSPULL" /> przesuwa jedną powierzchnię przeciągnięciem lub o odległość, prostopadle do niej. EDBRYŁA robi to samo i więcej: pochyla, obraca, odsuwa, usuwa i kopiuje powierzchnie, kilka naraz.

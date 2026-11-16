---
title: "Polecenie NACIŚNIJCIĄG (PRESSPULL) w AutoCADzie"
description: "Jak polecenie NACIŚNIJCIĄG (PRESSPULL) w AutoCADzie wciska lub wyciąga to, co klikniesz: zamknięty obiekt, obszar między obiektami, powierzchnię bryły."
figure: "Obszar między prostokątem a okręgiem wciśnięty o 8 w dół: płytka z otworem, widziana z południowego wschodu w stylu wizualnym Ukryty."
sourceHash: "b806d59060e1"
---

Polecenie NACIŚNIJCIĄG (PRESSPULL) wyciąga to, co klikniesz: zamknięty obiekt, obszar, który obiekty zamykają wokół kliknięcia, albo płaską powierzchnię bryły 3D. Kliknij, a potem wpisz wysokość albo przesuń kursor i kliknij: dodatnia wysokość wyciąga, ujemna wciska. Zamknięty obiekt lub obszar staje się nową bryłą, taką, jaką utworzyłoby polecenie <Command id="EXTRUDE" />, a obiekty zostają; wyspy obszaru są w nim otworami, jak w przykładzie. Powierzchnia dodaje swój graniastosłup do bryły albo go z niej wycina: wyciągnięcie górnej powierzchni prostopadłościanu go podwyższa. Monit wraca po kolejne kliknięcie aż do naciśnięcia Enter, a całe polecenie to jeden krok, który można cofnąć.

Przytrzymaj Ctrl, a powierzchnia, którą wskazałoby kliknięcie, zostanie podświetlona; Ctrl+kliknięcie odsuwa zamiast tego tę powierzchnię, a sąsiednie powierzchnie zostają przedłużone, by się z nią spotkać, więc pochyła ściana zachowuje swoje nachylenie. Jak w AutoCADzie, polecenie NACIŚNIJCIĄG działa kliknięciami: na liczbę lub punkt wpisane przy pierwszym monicie odpowiada <Message id="presspullClick" /> i ponownie wyświetla monit.

## Options

### Multiple

Przy monicie o wysokość lub o odległość odsunięcia: klikaj dalej, by dodać kolejne – zamknięte obiekty i obszary albo powierzchnie jednej bryły – potem naciśnij Enter: jedna wysokość posłuży wszystkim. Powierzchnia kliknięta po obiekcie lub obszarze zostaje odfiltrowana.

## Missing

Powierzchnia zakrzywiona, którą AutoCAD też odsuwa: tutaj kliknięcie nie znajduje powierzchni. Odsunięcie, przy którym sąsiednie powierzchnie są stożkami, sferami lub torusami, albo płaszczyznami i powierzchniami zakrzywionymi naraz, albo które przepchnęłoby powierzchnię przez powierzchnię naprzeciwko: bryła zostaje bez zmian. Obszary, które na powierzchni tworzą IMPRINT i IMPLIEDFACE, oraz Ctrl+Shift+E. Obiekt otwarty, który AutoCAD wyciąga w powierzchnię: powierzchni (surfaces) jeszcze nie ma. Podczas przeciągania podgląd pokazuje graniastosłup powierzchni lub nową bryłę, a nie bryłę taką, jaka będzie, a powierzchnia podświetla się tylko przy wciśniętym Ctrl. Obszar ograniczony poza płaszczyzną LUW nie był testowany.

## Questions

### Czym się różni NACIŚNIJCIĄG od WYCIĄGNIJ (EXTRUDE)?

<Command id="EXTRUDE" /> bierze wybrane zamknięte obiekty, wymazuje je zgodnie z DELOBJ i oferuje kierunek, zbieżność i wyrażenie. Polecenie NACIŚNIJCIĄG bierze kliknięcia – zamknięty obiekt, obszar wewnątrz kilku obiektów albo powierzchnię bryły, którą dodaje do tej bryły lub z niej wycina – i zachowuje obiekty. Z obiektu oba tworzą tę samą bryłę.

### Jak wyciągnąć powierzchnię bryły?

Uruchom polecenie NACIŚNIJCIĄG, kliknij powierzchnię i podaj odległość: dodatnia ją wyciąga i bryła rośnie, ujemna ją wciska. Przytrzymaj Ctrl przy kliknięciu, aby zamiast tego odsunąć powierzchnię. Na razie tylko płaskie powierzchnie.

### Dlaczego NACIŚNIJCIĄG nie działa?

Wymaga kliknięcia czegoś zamkniętego. Na liczbę lub punkt wpisane przy pierwszym monicie, na kliknięcie otwartego obiektu albo zakrzywionej powierzchni polecenie NACIŚNIJCIĄG odpowiada <Message id="presspullClick" /> i pyta ponownie. Kliknij zamknięty obiekt, wnętrze obszaru, który obiekty zamykają w rzucie, albo płaską powierzchnię bryły.

### Czy NACIŚNIJCIĄG ma skrót?

Nie ma skrótu: wpisz `NACIŚNIJCIĄG` albo `_PRESSPULL` w AutoCADzie w każdym języku. Ctrl+Shift+E, skrót klawiszowy AutoCADa dla tego polecenia, jeszcze nie działa.

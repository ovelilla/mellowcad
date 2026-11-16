---
title: "Polecenie ODSUŃ (OFFSET) w AutoCADzie"
description: "Jak odsunąć obiekt w AutoCADzie poleceniem ODSUŃ (OFFSET, skrót OD): odległość lub punkt, wymazanie i warstwa, jeden obiekt naraz. Wypróbuj za darmo online."
figure: "Prostokąt odsunięty o 6 do wewnątrz i okrąg odsunięty o 6 na zewnątrz: każdy wskazany, potem strona."
sourceHash: "b495af1e1410"
---

Polecenie ODSUŃ (OFFSET) rysuje kopię obiektu równoległą do niego, w odległości, którą wpisujesz, albo przez wskazany punkt: linia daje linię równoległą, okrąg lub łuk – współśrodkowy, polilinia – obrys wewnątrz lub na zewnątrz niej, elipsa lub splajn – splajn biegnący wzdłuż oryginału. Jak w AutoCADzie, polecenie przyjmuje jeden obiekt naraz: odległość podajesz raz, a potem wskazujesz obiekt i stronę, po której ma się znaleźć kopia, tyle razy, ile chcesz. Enter kończy polecenie.

## Options

### Through

Zamiast odległości każda kopia przechodzi przez punkt, który wskazujesz lub wpisujesz. To wartość domyślna pierwszego monitu, więc Enter wybiera ją tam, dopóki nie podasz odległości; od tej chwili Enter powtarza ostatnią odległość w tym rysunku.

### Erase

Pyta, czy wymazać każdy obiekt źródłowy po odsunięciu: <Keyword id="Yes" /> lub <Keyword id="No" /> (domyślnie). Przy <Keyword id="Yes" /> kopia zastępuje obiekt. Wybór obowiązuje do końca sesji, a następne polecenie ODSUŃ podaje go w pierwszym wierszu.

### Layer

Pyta, na którą warstwę trafiają kopie: na bieżącą (<Keyword id="Current" />) czy na warstwę obiektu źródłowego (<Keyword id="Source" />, domyślnie). Ten wybór też obowiązuje do końca sesji.

### Exit

Kończy polecenie, tak jak Enter przy monicie o obiekt.

### Multiple

Przy monicie o stronę: odsuwa dalej ten sam obiekt bez ponownego wskazywania, każdą kopię o jedną odległość dalej od poprzedniej, aż do Enter lub <Keyword id="Exit" />.

### Undo

Cofa ostatnią kopię, niezależnie od tego, z którego obiektu powstała, i znów pyta o obiekt. Gdy nie ma już czego cofać, informuje o tym.

## Missing

OFFSETGAPTYPE 1 i 2: narożniki odsuniętej polilinii zawsze domykają się jak przy 0, przez wydłużenie segmentów do przecięcia. Odsunięcie splajnu lub elipsy mieści się w tolerancji AutoCADa, ale jego węzły leżą tam, gdzie umieszcza je MellowCAD, a nie AutoCAD. Opcja <Keyword id="Through" /> przy splajnie pokazuje w etykiecie X i Y, a nie odległość.

## Questions

### Jak się nazywa polecenie ODSUŃ po angielsku?

OFFSET. W polskim AutoCADzie jego skrót to `OD`: wpisz go i naciśnij Enter lub spację. Angielskie `O` w polskiej wersji uruchamia polecenie OKRĄG; pełna nazwa `ODSUŃ` też działa, a `_OFFSET` – w AutoCADzie w każdym języku.

### Dlaczego nie mogę odsunąć obiektu?

Polecenie ODSUŃ odsuwa linie, łuki, okręgi, polilinie 2D, elipsy i splajny. Tekst, tekst wielowierszowy, odnośniki bloków, wymiary i kreskowania odrzuca komunikatem <Message id="cannotOffsetObject" />; tak samo postępuje, gdy przy tej odległości okrąg, łuk lub polilinia zmalałyby do zera. Obiektu na zablokowanej warstwie nie da się wskazać, a polilinia 3D jest pomijana.

### Jak odsunąć tę samą linię kilka razy?

Wskaż linię, a potem przy monicie o stronę wpisz literę opcji <Keyword id="Multiple" />: każde kliknięcie po tej stronie daje kolejną kopię, każdą o jedną odległość dalej od poprzedniej. Albo zostaw tryb domyślny i za każdym razem wskazuj najnowszą kopię.

### Jak umieścić odsunięte kopie na bieżącej warstwie?

Przy pierwszym monicie wybierz <Keyword id="Layer" />, potem <Keyword id="Current" />. Od tej chwili każda kopia trafia na warstwę bieżącą, dopóki znów nie wybierzesz <Keyword id="Source" />.

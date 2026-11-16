---
title: "Polecenie PLAN w AutoCADzie: widok z góry na LUW"
metaTitle: "Polecenie PLAN w AutoCADzie: widok z góry"
description: "Jak wrócić do widoku planu w AutoCADzie: polecenie PLAN patrzy prosto z góry na bieżący LUW, zapisany LUW lub GUW i kadruje cały rysunek. Wypróbuj online."
figure: "Schodkowa bryła widziana z południowego zachodu, z LUW obróconym o 30 stopni wokół Z: PLAN i Enter patrzą prosto z góry na ten LUW, jego oś X w prawo, więc bryła wygląda na obróconą."
sourceHash: "50d157803309"
---

Polecenie PLAN patrzy prosto z góry na płaszczyznę XY układu LUW, z jego osią X skierowaną w prawo: to widok planu, w którym powstawał rysunek. Pyta, który LUW – bieżący, zapisany czy globalny – a Enter wybiera bieżący. Potem kadruje cały rysunek i wyświetla <Message id="regeneratingModel" />.

Nic w rysunku się nie przesuwa, a LUW zostaje bez zmian: polecenie PLAN obraca tylko widok. To jeden krok cofania, więc <Command id="U" /> przywraca widok, a <Command id="ZOOM" /> <Keyword command="ZOOM" id="Previous" /> wraca do widoku sprzed niego. To droga powrotu do planu po <Command id="3DORBIT" /> lub izometrycznym widoku z <Command id="VIEW" />. 3D w MellowCAD to wyłącznie bryły 3D, wciąż częściowe.

## Options

### Current ucs

Plan bieżącego LUW, wartość domyślna. Gdy polecenie <Command id="UCS" /> obróciło LUW o 30 stopni wokół Z, rysunek wygląda na obrócony o 30 stopni zgodnie z ruchem wskazówek zegara, tak by oś X układu LUW wskazywała w prawo; po LUW ustawionym na pochyłej ścianie patrzy prosto na tę ścianę.

### Ucs

Plan LUW zapisanego opcją <Keyword command="UCS" id="NAmed" /> polecenia <Command id="UCS" />, którego nazwę wpisujesz. Dla nazwy, która nie jest zapisana, informuje, że nie może znaleźć tego LUW, i pyta ponownie; <Keyword id="?" /> wyświetla zapisane układy, tak jak polecenie LUW, i też pyta ponownie. Bieżący LUW się nie zmienia.

### World

Plan globalnego układu współrzędnych: rysunek taki, jaki był na początku, X w prawo i Y w górę, niezależnie od bieżącego LUW, który zostaje bez zmian.

## Missing

Gdy nic nie jest narysowane, polecenie PLAN zostawia powiększenie tam, gdzie było, podczas gdy AutoCAD kadruje granice rysunku.

## Questions

### Jak wrócić do widoku planu w AutoCADzie?

Wpisz `PLAN` i naciśnij Enter dwa razy: drugi Enter wybiera <Keyword id="Current ucs" />. Jeśli LUW jest obrócony, a chcesz plan układu globalnego, wybierz zamiast tego <Keyword id="World" />.

### Jakie polecenie daje widok z góry na LUW?

PLAN z opcją <Keyword id="Current ucs" />: patrzy z góry na bieżący LUW, z jego osią X w prawo. Najpierw obróć LUW poleceniem <Command id="UCS" />, potem uruchom polecenie PLAN i naciśnij Enter dwa razy, a będziesz rysować na obróconym planie tak, jakby był prosty.

### Dlaczego mój rysunek jest obrócony w widoku planu?

Widok jest planem obróconego LUW. Uruchom polecenie PLAN i wybierz <Keyword id="World" />, aby znów widzieć rysunek z globalną osią X w prawo; <Command id="UCS" /> i Enter również przywracają LUW do układu globalnego.

### Czy polecenie PLAN zmienia LUW?

Nie. Obraca tylko widok; LUW zostaje bez zmian. To widoki ortogonalne polecenia <Command id="VIEW" /> obracają również LUW.

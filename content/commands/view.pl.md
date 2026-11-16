---
title: "Polecenie WIDOK (VIEW) w AutoCADzie"
description: "Jak w AutoCADzie obrócić widok poleceniem WIDOK (VIEW, -WIDOK): sześć widoków prostokątnych i cztery izometryczne oraz LUW ustawiany przez każdy prostokątny."
figure: "Klocek ze stopniem narysowany w rzucie: -WIDOK i Izometryczny SW, i widać go z południowego zachodu i z góry, w stylu wizualnym Ukryty."
sourceHash: "261c8657f5f7"
---

Polecenie WIDOK (VIEW) obraca widok do jednego z dziesięciu predefiniowanych widoków AutoCADa: sześciu prostokątnych, patrzących prosto na jedną stronę modelu, i czterech izometrycznych, patrzących z góry od narożnika. Nic w rysunku się nie przesuwa. WIDOK uruchamia <Command id="-VIEW" />, formę dla wiersza polecenia: jego pierwsze pytanie wymienia <Keyword id="Orthographic" />, które potem pyta o stronę, a przyjmuje też od razu nazwę widoku, tak jak odpowiadają na nie menu AutoCADa: <Command id="-VIEW" />, potem <Keyword id="SWiso" />. Każdy widok pokazuje cały rysunek i wyświetla <Message id="regeneratingModel" />.

Kontrolka widoku w lewym górnym rogu rysunku wymienia te same dziesięć widoków i uruchamia <Command id="-VIEW" />, a ściany i narożniki ViewCube również do nich obracają, pozostawiając LUW bez zmian. Każde WIDOK to jeden krok cofania, więc <Command id="U" /> cofa widok razem z ustawionym przez niego LUW. Wpisane z apostrofem wewnątrz innego polecenia odmawia z komunikatem <Message id="requiresRegen" />. 3D w MellowCAD to tylko bryły i wciąż jest częściowe.

## Options

### Orthographic

Pyta o stronę, na którą patrzeć, domyślnie <Keyword id="Top" />, więc Enter daje rzut z góry: <Keyword id="Top" />, <Keyword id="Bottom" />, <Keyword id="Front" />, <Keyword id="BAck" />, <Keyword id="Left" /> lub <Keyword id="Right" />. Każdy jest ustawiony prosto: <Keyword id="Top" /> pokazuje X w prawo i Y w górę, <Keyword id="Front" /> X w prawo i Z w górę, a <Keyword id="Bottom" />, widziany od spodu, X w lewo. Wpisana przy pierwszym pytaniu, każda strona działa bez tej opcji.

Każdy obraca też LUW przodem do ciebie, od osi układu globalnego, bez względu na to, jaki był LUW, z początkiem w `0,0,0`, tak jak robi to opcja ortogonalna polecenia <Command id="UCS" />: po widoku z przodu płaszczyzna XY to przód, więc to, co rysujesz, leży płasko na ekranie, a LUW nazywa się `*PRZÓD*`. Po widoku z góry ma osie układu globalnego i nazywa się `*GÓRA*`.

### SWiso

Izometria południowo-zachodnia: patrzy z góry od narożnika z przodu po lewej, widząc przód, lewy bok i górę. LUW pozostaje bez zmian. To widok z sesji.

### SEiso

Izometria południowo-wschodnia: patrzy z góry od narożnika z przodu po prawej, widząc przód, prawy bok i górę. LUW pozostaje bez zmian.

### NEiso

Izometria północno-wschodnia: patrzy z góry od narożnika z tyłu po prawej, widząc tył, prawy bok i górę. LUW pozostaje bez zmian.

### NWiso

Izometria północno-zachodnia: patrzy z góry od narożnika z tyłu po lewej, widząc tył, lewy bok i górę. LUW pozostaje bez zmian.

## Missing

Widoki nazwane: <Keyword id="Orthographic" /> to jedyna opcja wymieniana przy pierwszym pytaniu, podczas gdy w AutoCADzie lista zawiera też `?`, Usuń, Przywróć, Zapisz, Ustawienia i Okno, a wpisana tam nazwa jest odrzucana. Menedżer widoków, który WIDOK otwiera w AutoCADzie. Gdy nic nie narysowano, widok zachowuje powiększenie, podczas gdy AutoCAD pokazuje granice rysunku. UCSORTHO i UCSBASE jako zmienne: widok prostokątny zawsze wyrównuje LUW, od osi układu globalnego. Wyrównany LUW na liście <Keyword command="UCS" id="Previous" /> polecenia <Command id="UCS" />.

## Questions

### Jak uzyskać widok izometryczny w AutoCADzie?

Wpisz <Command id="-VIEW" />, potem <Keyword id="SWiso" /> dla izometrii południowo-zachodniej; <Keyword id="SEiso" />, <Keyword id="NEiso" /> i <Keyword id="NWiso" /> dają trzy pozostałe narożniki. Albo wybierz Izometryczny SW w kontrolce widoku w lewym górnym rogu lub kliknij górny narożnik ViewCube. <Command id="VSCURRENT" /> z opcją <Keyword command="VSCURRENT" id="Hidden" /> ukrywa krawędzie z tyłu.

### Jakie polecenie daje widok z góry?

<Command id="-VIEW" />, potem <Keyword id="Top" />, które ustawia też LUW na osie układu globalnego. <Command id="PLAN" /> patrzy z góry na bieżący LUW i pozostawia go bez zmian.

### Dlaczego LUW zmienił się po widoku z przodu?

Widok prostokątny obraca LUW przodem do ciebie, aby to, co rysujesz, leżało na ekranie. <Command id="UCS" /> i Enter wracają do układu globalnego; <Command id="U" /> cofa widok razem z jego LUW.

### Czy widok izometryczny to to samo co rysunek izometryczny?

Nie. Widok izometryczny patrzy na model 3D od narożnika. Rysunek izometryczny jest 2D, rysowany na płaszczyznach izometrycznych w stylu izometrycznym polecenia SKOK, którego MellowCAD jeszcze nie ma.

### Gdzie jest Menedżer widoków?

WIDOK uruchamia <Command id="-VIEW" /> w wierszu polecenia: nie ma Menedżera widoków, a widoków nazwanych (Zapisz, Przywróć) jeszcze tu nie ma.
